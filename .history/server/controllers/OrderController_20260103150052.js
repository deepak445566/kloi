import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import crypto from "crypto";

// ✅ Initialize Razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Generate Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, addressId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!addressId || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Address and items are required",
      });
    }

    // Calculate amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      amount += (product.offerPrice || product.price) * item.quantity;
    }

    // Add 5% tax
    const tax = Math.floor(amount * 0.05);
    const totalAmount = amount + tax;

    // Create order in database with pending status
    const order = await Order.create({
      userId,
      items,
      amount: totalAmount,
      address: addressId,
      paymentType: "Online",
      isPaid: false,
      status: "Payment Pending",
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }
    });

    res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
        razorpayKey: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Verify Razorpay payment and update order
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // Fetch Razorpay order details
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const orderId = razorpayOrder.notes.orderId;

    // Update order in database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        isPaid: true,
        status: "Order Placed",
        transactionId: razorpay_payment_id,
        paymentDetails: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: razorpayOrder.amount / 100,
          currency: razorpayOrder.currency,
          timestamp: new Date()
        }
      },
      { new: true }
    ).populate("items.product address");

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Clear user's cart after successful payment
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Get Razorpay key (for frontend)
export const getRazorpayKey = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Get Razorpay key error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Place COD order (optional)
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!address || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Address and items are required",
      });
    }

    // Calculate amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      amount += (product.offerPrice || product.price) * item.quantity;
    }

    // Add tax
    amount += Math.floor(amount * 0.05);
    
    // Create COD order
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
      status: "Order Placed",
      transactionId: `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Clear cart for COD as well
    await User.findByIdAndUpdate(userId, { cartItems: {} });
    
    return res.status(201).json({
      success: true,
      message: "COD Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    console.error("COD order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required",
      });
    }
    
    const orders = await Order.find({ userId })
      .populate({
        path: "items.product",
        select: "name image price offerPrice"
      })
      .populate("address")
      .sort({ createdAt: -1 });
    
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
};

// ✅ Get all orders for seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "name image price offerPrice"
      })
      .populate({
        path: "userId",
        select: "name email"
      })
      .populate("address")
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
};