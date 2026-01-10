// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";



import { sendOrderNotification } from "../utils/whatsappUtils.js";
import { createRazorpayOrder, verifyPayment } from "../razorpayConfig.js";

// Create Razorpay order
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, cart, addressId, userId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    // Calculate actual amount with GST and shipping
    let calculatedAmount = 0;
    
    // If cart items provided, calculate properly
    if (cart && cart.length > 0) {
      calculatedAmount = calculateTotalAmount(cart);
    } else {
      calculatedAmount = amount;
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(calculatedAmount);

    // Create pending order in database
    const order = await Order.create({
      userId,
      items: cart || [],
      amount: calculatedAmount,
      address: addressId,
      status: 'Payment Pending',
      paymentType: "Online",
      isPaid: false,
      razorpayOrderId: razorpayOrder.id,
      orderCreatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("Payment order creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify and capture payment
export const verifyAndCapturePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      transactionId,
      cartItems
    } = req.body;

    const userId = req.user?._id;

    // Verify payment signature
    const isValidSignature = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // Find and update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order with payment details
    order.isPaid = true;
    order.status = 'Order Placed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.transactionId = transactionId || razorpay_payment_id;
    order.paidAt = new Date();

    // If cart items provided, update them
    if (cartItems && cartItems.length > 0) {
      order.items = cartItems.map(item => ({
        product: item.productId || item._id,
        quantity: item.quantity
      }));
    }

    await order.save();

    // Fetch complete order details for WhatsApp
    const completeOrder = await Order.findById(orderId)
      .populate('userId', 'name phone email')
      .populate('address')
      .populate('items.product');

    // Send WhatsApp notification
    if (completeOrder) {
      const orderDataForWhatsApp = {
        orderId: completeOrder._id,
        customerName: completeOrder.userId?.name || "Customer",
        customerPhone: completeOrder.userId?.phone || "Not provided",
        totalAmount: completeOrder.amount,
        paymentType: "Online (Razorpay)",
        transactionId: completeOrder.transactionId,
        razorpayPaymentId: razorpay_payment_id,
        address: completeOrder.address
          ? `${completeOrder.address.street}, ${completeOrder.address.city}, ${completeOrder.address.state} - ${completeOrder.address.pincode}`
          : "Address not provided",
        items: completeOrder.items.map(item => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: (item.product?.price || 0) * item.quantity
        }))
      };

      await sendOrderNotification(orderDataForWhatsApp);
    }

    // Clear user's cart
    if (userId) {
      await User.findByIdAndUpdate(userId, { cartItems: {} });
    }

    res.status(200).json({
      success: true,
      message: "Payment successful! Order placed.",
      order: {
        id: order._id,
        amount: order.amount,
        transactionId: order.transactionId,
        status: order.status
      }
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payment order status
export const getPaymentOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        isPaid: order.isPaid,
        amount: order.amount,
        razorpayOrderId: order.razorpayOrderId
      }
    });

  } catch (error) {
    console.error("Get order status error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Calculate total amount function
const calculateTotalAmount = (cartItems) => {
  let total = 0;
  
  // Your existing GST and shipping calculation logic
  cartItems.forEach(item => {
    const basePrice = item.offerPrice || item.price || 0;
    const quantity = item.quantity || 1;
    const gstPercentage = item.gstPercentage || 5;
    
    const subtotal = basePrice * quantity;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const shippingCharge = item.freeShipping ? 0 : (item.shippingCharge || 0) * quantity;
    
    total += subtotal + gstAmount + shippingCharge;
  });
  
  return total;
};










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
        price: itemTotal
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

    // ✅ Fetch user and address details for WhatsApp message
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

    // ✅ Generate WhatsApp notification
    const whatsappNotification = await sendOrderNotification(orderDataForWhatsApp);
    
    // ✅ Also send a copy to seller's email (optional)
    // You can implement email notification here if needed

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