import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";

// ✅ Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, addressId } = req.body;
    const userId = req.user._id;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Please select a delivery address"
      });
    }

    // Calculate total amount
    let subtotal = 0;
    const productDetails = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const price = product.offerPrice || product.price;
      subtotal += price * item.quantity;
      
      productDetails.push({
        product: product._id,
        quantity: item.quantity,
        price: price
      });
    }

    // Calculate tax (5%)
    const tax = Math.floor(subtotal * 0.05);
    const totalAmount = subtotal + tax;

    // Create order in database
    const order = await Order.create({
      userId: userId,
      items: productDetails,
      amount: totalAmount,
      address: addressId,
      paymentType: "Online",
      isPaid: false,
      status: "Payment Pending",
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }
    });

    // Update order with Razorpay order ID
    order.paymentDetails = {
      razorpayOrderId: razorpayOrder.id
    };
    await order.save();

    res.status(200).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error("Create Razorpay order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order"
    });
  }
};

// ✅ Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // Fetch Razorpay order to get our order ID
    const razorpayOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
    const orderId = razorpayOrder.notes.orderId;

    // Find and update order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update product stocks
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update order status
    order.isPaid = true;
    order.status = "Order Placed";
    order.transactionId = razorpay_payment_id;
    order.paymentDetails = {
      ...order.paymentDetails,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: razorpayOrder.amount / 100,
      currency: razorpayOrder.currency,
      timestamp: new Date()
    };

    await order.save();

    // Clear user's cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order: order
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed"
    });
  }
};

// ✅ Get Razorpay Key
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
      message: "Failed to get payment key"
    });
  }
};

// ✅ Place COD Order
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, addressId } = req.body;
    const userId = req.user._id;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Please select a delivery address"
      });
    }

    // Calculate total amount
    let subtotal = 0;
    const productDetails = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const price = product.offerPrice || product.price;
      subtotal += price * item.quantity;
      
      productDetails.push({
        product: product._id,
        quantity: item.quantity,
        price: price
      });
    }

    // Calculate tax (5%)
    const tax = Math.floor(subtotal * 0.05);
    const totalAmount = subtotal + tax;

    // Create order
    const order = await Order.create({
      userId: userId,
      items: productDetails,
      amount: totalAmount,
      address: addressId,
      paymentType: "COD",
      isPaid: false,
      status: "Order Placed",
      transactionId: `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    // Update product stocks
    for (const item of productDetails) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    res.status(201).json({
      success: true,
      message: "COD Order placed successfully",
      orderId: order._id
    });

  } catch (error) {
    console.error("COD order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to place COD order"
    });
  }
};

// ✅ Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ userId })
      .populate("items.product", "name image price offerPrice")
      .populate("address")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders"
    });
  }
};

// ✅ Get All Orders (for seller)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name image price offerPrice")
      .populate("address")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders"
    });
  }
};

// ✅ Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }

    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true }
    ).populate("items.product address");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: order
    });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status"
    });
  }
};