// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";

export const placeOrderOnline = async (req, res) => {
  try {
    const { 
      items, 
      address, 
      subtotal, 
      totalGST, 
      totalShipping, 
      grandTotal,
      paymentType = "Online"
    } = req.body;
    
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
        message: "Address and items are required",
      });
    }

    // Calculate amount
    let amount = grandTotal || 0;
    const orderItems = [];
    
    // Validate products and calculate amount if not provided
    if (!grandTotal) {
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
          price: product.offerPrice || product.price,
          gstPercentage: item.gstPercentage || 5,
          shippingCharge: item.shippingCharge || 0,
          freeShipping: item.freeShipping || false
        });
      }
    } else {
      // Use provided amount and collect product info
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (product) {
          orderItems.push({
            product: product._id,
            quantity: item.quantity,
            name: product.name,
            price: product.offerPrice || product.price,
            gstPercentage: item.gstPercentage || 5,
            shippingCharge: item.shippingCharge || 0,
            freeShipping: item.freeShipping || false
          });
        }
      }
    }
    
    // Create order WITHOUT transaction ID
    const order = await Order.create({
      userId,
      items: items.map(item => ({ 
        product: item.product, 
        quantity: item.quantity 
      })),
      amount: amount,
      subtotal: subtotal || 0,
      totalGST: totalGST || 0,
      totalShipping: totalShipping || 0,
      address,
      paymentType: paymentType,
      isPaid: true,
      // No transaction ID field - it's not required
    });

    // Clear user's cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // ✅ Fetch user and address details for WhatsApp message
    const user = await User.findById(userId).select('name phone email');
    const addressDetails = await Address.findById(address);
    
    // ✅ Prepare data for WhatsApp message
    const orderDataForWhatsApp = {
      orderId: order._id,
      customerName: user?.name || "Customer",
      customerPhone: user?.phone || "Not provided",
      totalAmount: amount,
      paymentType: paymentType,
      address: addressDetails 
        ? `${addressDetails.street}, ${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}\n📞 ${addressDetails.phone || "No phone"}`
        : "Address not provided",
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        gst: item.gstPercentage,
        shipping: item.freeShipping ? 0 : item.shippingCharge
      })),
      subtotal: subtotal || 0,
      totalGST: totalGST || 0,
      totalShipping: totalShipping || 0
    };

    // ✅ Generate WhatsApp notification
    const whatsappNotification = await sendOrderNotification(orderDataForWhatsApp);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        id: order._id,
        amount: amount,
        status: order.status,
        paymentType: order.paymentType
      },
      whatsappNotification: {
        success: whatsappNotification.success,
        url: whatsappNotification.whatsappUrl,
        message: "Order details sent to WhatsApp"
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