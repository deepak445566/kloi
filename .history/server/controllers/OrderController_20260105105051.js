import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import qrcode from 'qrcode-terminal';

// ✅ CommonJS import for whatsapp-web.js
import pkg from 'whatsapp-web.js';
const { Client } = pkg;

// WhatsApp client setup
let whatsappClient = null;

// Initialize WhatsApp client
const initWhatsAppClient = () => {
  if (!whatsappClient) {
    whatsappClient = new Client({
      authStrategy: {
        clientId: 'whatsapp-bot-client'
      },
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
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

    whatsappClient.on('disconnected', (reason) => {
      console.log('❌ WhatsApp client disconnected:', reason);
      whatsappClient.destroy();
      whatsappClient = null;
      // Try to reconnect after 5 seconds
      setTimeout(initWhatsAppClient, 5000);
    });

    whatsappClient.initialize();
  }
};

// Initialize on import
initWhatsAppClient();

// ✅ Send WhatsApp notification function
const sendWhatsAppNotification = async (orderDetails) => {
  try {
    // Check if client is ready
    if (!whatsappClient) {
      console.log('WhatsApp client not initialized');
      return;
    }

    // Wait for client to be ready (max 10 seconds)
    const waitForReady = () => {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (whatsappClient && whatsappClient.info) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('WhatsApp client not ready'));
        }, 10000);
      });
    };

    await waitForReady();

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
      `*Transaction ID:* ${orderDetails.transactionId || 'COD'}\n` +
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
    const { items, address, transactionId, paymentType = "Online" } = req.body;
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
    
    // For online payment, validate transaction ID
    let trimmedTransactionId = '';
    let isPaid = false;
    
    if (paymentType === "Online") {
      if (!transactionId || transactionId.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Transaction ID is required for online payment",
        });
      }

      trimmedTransactionId = transactionId.trim();
      if (trimmedTransactionId.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Transaction ID must be at least 8 characters long",
        });
      }

      // Check duplicate transaction ID only for online payments
      const existingOrder = await Order.findOne({ transactionId: trimmedTransactionId });
      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message: "This Transaction ID is already used",
        });
      }
      
      isPaid = true;
    } else {
      // For COD, generate a unique transaction ID
      trimmedTransactionId = `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      isPaid = false;
    }

    // Create order
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType,
      isPaid,
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

// ✅ Test WhatsApp connection
export const testWhatsApp = async (req, res) => {
  try {
    const status = whatsappClient ? {
      isReady: !!whatsappClient.info,
      status: 'connected'
    } : {
      isReady: false,
      status: 'not initialized'
    };
    
    res.status(200).json({
      success: true,
      whatsapp: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};