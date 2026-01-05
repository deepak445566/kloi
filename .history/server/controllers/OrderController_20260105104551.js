import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';

// WhatsApp client setup
let whatsappClient = null;

// Initialize WhatsApp client
const initWhatsAppClient = () => {
  if (!whatsappClient) {
    whatsappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }
    });

    whatsappClient.on('qr', (qr) => {
      console.log('📱 WhatsApp QR Code - Scan with your phone:');
      qrcode.generate(qr, { small: true });
    });

    whatsappClient.on('ready', () => {
      console.log('✅ WhatsApp client is ready for notifications!');
    });

    whatsappClient.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp authentication failed:', msg);
    });

    whatsappClient.initialize();
  }
};

// Initialize on import
initWhatsAppClient();

// ✅ Send WhatsApp notification function
const sendWhatsAppNotification = async (orderDetails) => {
  try {
    // Wait for client to be ready
    if (!whatsappClient) {
      console.log('WhatsApp client not initialized');
      return;
    }

    // Wait for client to be ready with timeout
    await new Promise((resolve) => {
      if (whatsappClient.info) {
        resolve();
      } else {
        // Try for 5 seconds then skip
        setTimeout(resolve, 5000);
      }
    });

    const phoneNumber = "919911577652"; // Your WhatsApp number
    const formattedNumber = phoneNumber.includes('@c.us') 
      ? phoneNumber 
      : `${phoneNumber}@c.us`;

    // Get user details
    const user = await User.findById(orderDetails.userId);
    const userName = user?.name || 'Customer';
    
    // Get product details
    const productDetails = [];
    let totalQuantity = 0;
    
    for (const item of orderDetails.items) {
      const product = await Product.findById(item.product);
      if (product) {
        productDetails.push(`• ${product.name} - Qty: ${item.quantity}`);
        totalQuantity += item.quantity;
      }
    }

    const itemsList = productDetails.join('\n');

    const message = `🛒 *NEW ORDER RECEIVED*\n\n` +
      `*Order ID:* ${orderDetails._id}\n` +
      `*Customer:* ${userName}\n` +
      `*Mobile:* ${user?.mobile || 'Not provided'}\n` +
      `*Transaction ID:* ${orderDetails.transactionId}\n` +
      `*Total Amount:* ₹${orderDetails.amount}\n` +
      `*Total Items:* ${totalQuantity}\n` +
      `*Payment Type:* ${orderDetails.paymentType}\n\n` +
      `*Items Ordered:*\n${itemsList}\n\n` +
      `*Delivery Address:*\n` +
      `${orderDetails.address?.street || ''}\n` +
      `${orderDetails.address?.city || ''}, ${orderDetails.address?.state || ''}\n` +
      `Pincode: ${orderDetails.address?.pincode || ''}\n\n` +
      `📅 Order Time: ${new Date(orderDetails.createdAt).toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata' 
      })}\n\n` +
      `✅ Order Status: ${orderDetails.status}`;

    await whatsappClient.sendMessage(formattedNumber, message);
    console.log('✅ WhatsApp notification sent successfully to', phoneNumber);
    
  } catch (error) {
    console.error('❌ Error sending WhatsApp notification:', error.message);
    // Don't throw error, just log it so order placement continues
  }
};

// ✅ Online Payment order placement
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

    amount += Math.floor(amount * 0.05);
    
    // Create order
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: true,
      transactionId: trimmedTransactionId
    });

    // ✅ Send WhatsApp notification (async - don't wait for it)
    sendWhatsAppNotification(order).catch(err => {
      console.error("Failed to send WhatsApp notification:", err);
    });
    
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get user orders
export const getUserOrders = async(req, res) => {
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
export const getAllOrders = async(req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
    .populate("items.product")
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
}