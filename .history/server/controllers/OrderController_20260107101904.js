// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";
import { ShiprocketService } from "../services/shiprocketService.js";

export const placeOrderOnline = async (req, res) => {
  try {
    const { items, address, transactionId } = req.body;
    const userId = req.user?._id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!address || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Address not provided",
      });
    }
    
    if (!transactionId || transactionId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const trimmedTransactionId = transactionId.trim();
    if (trimmedTransactionId.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID must be at least 8 characters long",
      });
    }

    // Check duplicate transaction ID
    const existingOrder = await Order.findOne({ transactionId: trimmedTransactionId });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "This Transaction ID is already used",
      });
    }

    // Calculate amount
    let amount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      const itemTotal = (product.offerPrice || product.price) * item.quantity;
      amount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        name: product.name,
        price: itemTotal,
        weightValue: product.weightValue || 0.5,
        weightUnit: product.weightUnit || 'kg',
        gstPercentage: product.gstPercentage || 5
      });
    }

    // Add 5% tax
    const tax = Math.floor(amount * 0.05);
    amount += tax;
    
    // Create order
    const order = await Order.create({
      userId,
      items: items.map(item => ({ 
        product: item.product, 
        quantity: item.quantity 
      })),
      amount,
      address,
      paymentType: "Online",
      isPaid: true,
      transactionId: trimmedTransactionId
    });

    // ✅ Fetch user and address details for WhatsApp and Shiprocket
    const user = await User.findById(userId).select('name phone email');
    const addressDetails = await Address.findById(address);
    
    // ✅ Prepare data for WhatsApp message
    const orderDataForWhatsApp = {
      orderId: order._id,
      customerName: user?.name || "Customer",
      customerPhone: user?.phone || "Not provided",
      totalAmount: amount,
      paymentType: "Online",
      transactionId: trimmedTransactionId,
      address: addressDetails 
        ? `${addressDetails.street}, ${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}\n📞 ${addressDetails.phone || "No phone"}`
        : "Address not provided",
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    // ✅ STEP 1: Generate WhatsApp notification
    const whatsappNotification = await sendOrderNotification(orderDataForWhatsApp);
    
    // ✅ STEP 2: Create Shiprocket Shipment
    let shiprocketResponse = null;
    try {
      shiprocketResponse = await ShiprocketService.createShipment(
        order,
        user,
        addressDetails,
        orderItems
      );
      
      // Update order with Shiprocket details
      order.shiprocket = {
        orderId: shiprocketResponse.shiprocketOrderId,
        shipmentId: shiprocketResponse.shipmentId,
        awbCode: shiprocketResponse.awbCode,
        courierName: shiprocketResponse.courierName,
        courierCompany: shiprocketResponse.courierCompany,
        labelUrl: shiprocketResponse.labelUrl,
        manifestUrl: shiprocketResponse.manifestUrl,
        trackingUrl: shiprocketResponse.trackingUrl,
        status: shiprocketResponse.status
      };
      
      // Add initial tracking history
      order.trackingHistory.push({
        status: 'Shipment Created',
        date: new Date(),
        location: 'Kuntal Agro, Sohna',
        remark: 'Order processed and shipment created'
      });
      
      await order.save();
      
    } catch (shiprocketError) {
      console.error('Shiprocket error:', shiprocketError);
      // Don't fail the order if Shiprocket fails
      // Continue with WhatsApp notification
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      orderDetails: {
        amount: amount,
        items: orderItems.length,
        transactionId: trimmedTransactionId,
        tax: tax
      },
      whatsappNotification: {
        success: whatsappNotification.success,
        url: whatsappNotification.whatsappUrl,
        message: "Order details sent to WhatsApp"
      },
      shipment: shiprocketResponse ? {
        success: true,
        awbCode: shiprocketResponse.awbCode,
        courier: shiprocketResponse.courierName,
        trackingUrl: shiprocketResponse.trackingUrl,
        message: "Shipment created successfully"
      } : {
        success: false,
        message: "Shipment will be created manually"
      }
    });
    
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Rest of your existing controller functions...

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