// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";


import axios from "axios";



export const placeOrderOnline = async (req, res) => {
  try {
    const { items, address, transactionId } = req.body;
    const userId = req.user._id;

    if (!items?.length || !address || !transactionId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    let amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: "Product not found" });

      const price = (product.offerPrice || product.price) * item.quantity;
      amount += price;

      orderItems.push({
        name: product.name,
        quantity: item.quantity,
        price
      });
    }

    const tax = Math.floor(amount * 0.05);
    amount += tax;

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: true,
      transactionId
    });

    const user = await User.findById(userId);
    const addressDetails = await Address.findById(address);
    if (!addressDetails) return res.json({ message: "Invalid address" });

    // ================= SHIPROCKET =================
    try {
      const token = await getShiprocketToken();

      const shiprocketOrder = {
        order_id: order._id.toString(),
        order_date: new Date(),
        pickup_location: "Primary",
        billing_customer_name: user.name,
        billing_phone: addressDetails.phone,
        billing_address: addressDetails.street,
        billing_city: addressDetails.city,
        billing_state: addressDetails.state,
        billing_pincode: addressDetails.pincode,
        billing_country: "India",
        payment_method: "Prepaid",
        sub_total: amount,
        order_items: orderItems.map(i => ({
          name: i.name,
          units: i.quantity,
          selling_price: i.price
        })),
        length: 10,
        breadth: 10,
        height: 5,
        weight: 0.5
      };

      const srOrder = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        shiprocketOrder,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const awbRes = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
        { shipment_id: srOrder.data.shipment_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      order.courier = {
        name: awbRes.data.courier_name,
        awb: awbRes.data.awb_code,
        shipmentId: srOrder.data.shipment_id
      };
      order.trackingStatus = "Pickup Scheduled";
      await order.save();

    } catch (err) {
      order.trackingStatus = "Courier Pending";
      await order.save();
    }

    await sendOrderNotification({
      orderId: order._id,
      customerName: user.name,
      totalAmount: amount
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= TRACK ORDER =================
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order?.courier?.awb) {
      return res.json({ success: false, message: "Tracking not available" });
    }

    const token = await getShiprocketToken();

    const trackRes = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.courier.awb}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      success: true,
      courier: order.courier.name,
      awb: order.courier.awb,
      tracking: trackRes.data
    });

  } catch {
    res.status(500).json({ success: false, message: "Tracking failed" });
  }
};


// ✅ Get user orders - userId auth se aayega
export const getUserOrders = async(req, res)=>{
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required",
      });
    }
    
    const orders = await Order.find({
      userId,
      $or:[{paymentType:"COD"},{isPaid:true}]
    }).populate("items.product address").sort({createdAt: -1});
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ✅ Get all orders for seller
export const getAllOrders = async(req, res)=>{
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
    .populate("items.product")
    .populate("address")
    .populate("userId", "name phone email") // Populate user details
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ✅ New function: Get WhatsApp URL for specific order
export const getOrderWhatsAppLink = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name phone')
      .populate('address')
      .populate('items.product', 'name price');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Prepare order data
    const orderData = {
      orderId: order._id,
      customerName: order.userId?.name || "Customer",
      customerPhone: order.userId?.phone || "Not provided",
      totalAmount: order.amount,
      paymentType: order.paymentType,
      transactionId: order.transactionId,
      address: order.address 
        ? `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
        : "Address not provided",
      items: order.items.map(item => ({
        name: item.product?.name || "Product",
        quantity: item.quantity,
        price: (item.product?.price || 0) * item.quantity
      }))
    };

    // Generate WhatsApp URL
    const { generateOrderWhatsAppMessage, getWhatsAppURL } = await import('../utils/whatsappUtils.js');
    const message = generateOrderWhatsAppMessage(orderData);
    const whatsappUrl = getWhatsAppURL(message);

    res.status(200).json({
      success: true,
      whatsappUrl: whatsappUrl,
      orderData: {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        totalAmount: orderData.totalAmount
      }
    });

  } catch (error) {
    console.error("Error generating WhatsApp link:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};