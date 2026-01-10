import { createRazorpayOrder, verifyPaymentSignature } from '../utils/razorpayUtils.js';
import Order from '../models/Order.js';

import User from '../models/User.js';
import { sendOrderNotification } from '../utils/whatsappUtils.js';

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const order = await createRazorpayOrder(amount);

    res.status(200).json({
      success: true,
      order: order,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// Verify Razorpay payment and place order
export const verifyAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      grandTotal,
      subtotal,
      totalGST,
      totalShipping
    } = req.body;

    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Verify payment signature
    const isPaymentValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isPaymentValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Check if this payment has already been processed
    const existingOrder = await Order.findOne({ 
      $or: [
        { razorpay_order_id },
        { razorpay_payment_id }
      ] 
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "This payment has already been processed",
      });
    }

    // Validate order data
    if (!address || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Address and items are required",
      });
    }

    // Create order in database
    const order = await Order.create({
      userId,
      items: items.map(item => ({
        product: item._id,
        quantity: item.quantity,
        name: item.name,
        price: item.offerPrice || item.price,
        gstPercentage: item.gstPercentage || 5,
        shippingCharge: item.shippingCharge || 0,
        freeShipping: item.freeShipping || false
      })),
      address,
      amount: grandTotal,
      subtotal,
      totalGST,
      totalShipping,
      status: 'Order Placed',
      paymentType: 'Razorpay',
      isPaid: true,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId: razorpay_payment_id // Use payment ID as transaction ID
    });

    // Clear user's cart after successful order
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // Fetch user and address details for WhatsApp
    const user = await User.findById(userId).select('name phone email');
    const addressDetails = await Address.findById(address);

    // Prepare WhatsApp notification data
    const orderDataForWhatsApp = {
      orderId: order._id,
      customerName: user?.name || "Customer",
      customerPhone: user?.phone || "Not provided",
      totalAmount: grandTotal,
      paymentType: "Online Payment (Razorpay)",
      transactionId: razorpay_payment_id,
      address: addressDetails
        ? `${addressDetails.street}, ${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}\n📞 ${addressDetails.phone || "No phone"}`
        : "Address not provided",
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: (item.offerPrice || item.price) * item.quantity,
        gst: item.gstPercentage || 5,
        shipping: item.freeShipping ? 0 : item.shippingCharge || 0
      }))
    };

    // Send WhatsApp notification
    const whatsappNotification = await sendOrderNotification(orderDataForWhatsApp);

    res.status(201).json({
      success: true,
      message: "Payment successful and order placed",
      order: {
        id: order._id,
        amount: grandTotal,
        paymentId: razorpay_payment_id,
        status: order.status,
      },
      whatsappNotification: {
        success: whatsappNotification.success,
        message: "Order details sent to WhatsApp"
      }
    });

  } catch (error) {
    console.error("Error verifying payment and placing order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      $or: [
        { razorpay_order_id: orderId },
        { _id: orderId }
      ]
    }).populate('items.product address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment status",
      error: error.message,
    });
  }
};