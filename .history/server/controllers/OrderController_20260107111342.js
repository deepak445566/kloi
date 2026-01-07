// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";


import { sendOrderNotification } from "../utils/whatsappUtils.js";
import ShiprocketAPI from "../config/shiprocket.js";

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
    const shiprocketItems = [];
    
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

      // Prepare items for Shiprocket
      shiprocketItems.push({
        name: product.name,
        sku: product._id.toString().slice(-12),
        units: item.quantity,
        selling_price: product.offerPrice || product.price,
        discount: 0,
        tax: 0,
        hsn: 999999 // Default HSN code, update as per your products
      });
    }

    // Add 5% tax
    const tax = Math.floor(amount * 0.05);
    amount += tax;
    
    // Fetch user and address details
    const user = await User.findById(userId).select('name phone email');
    const addressDetails = await Address.findById(address);

    // Create order in database
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
      transactionId: trimmedTransactionId,
      status: 'Order Placed'
    });

    // ✅ Shiprocket Integration
    let shiprocketResponse = null;
    try {
      const shiprocketOrderData = {
        order_id: order._id.toString(),
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: 'Primary', // Your pickup location name from Shiprocket
        channel_id: process.env.SHIPROCKET_CHANNEL_ID || '',
        comment: 'Order placed via website',
        billing_customer_name: user?.name || 'Customer',
        billing_last_name: '',
        billing_address: addressDetails?.street || '',
        billing_address_2: '',
        billing_city: addressDetails?.city || '',
        billing_pincode: addressDetails?.pincode || '',
        billing_state: addressDetails?.state || '',
        billing_country: 'India',
        billing_email: user?.email || '',
        billing_phone: user?.phone || '',
        shipping_is_billing: true,
        shipping_customer_name: user?.name || 'Customer',
        shipping_last_name: '',
        shipping_address: addressDetails?.street || '',
        shipping_address_2: '',
        shipping_city: addressDetails?.city || '',
        shipping_pincode: addressDetails?.pincode || '',
        shipping_country: 'India',
        shipping_state: addressDetails?.state || '',
        shipping_email: user?.email || '',
        shipping_phone: user?.phone || '',
        order_items: shiprocketItems,
        payment_method: 'Prepaid',
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
      };

      shiprocketResponse = await ShiprocketAPI.createOrder(shiprocketOrderData);
      
      // Update order with Shiprocket data
      order.shiprocketOrderId = shiprocketResponse.order_id;
      order.shiprocketShipmentId = shiprocketResponse.shipment_id;
      order.shiprocketStatus = 'Created';
      await order.save();

    } catch (shiprocketError) {
      console.error('Shiprocket integration failed:', shiprocketError);
      // Continue even if Shiprocket fails - order is still saved in database
    }

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
      })),
      shiprocketInfo: shiprocketResponse ? `Shiprocket ID: ${shiprocketResponse.order_id}` : 'Shipping pending'
    };

    // ✅ Generate WhatsApp notification
    const whatsappNotification = await sendOrderNotification(orderDataForWhatsApp);

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
      shiprocket: shiprocketResponse ? {
        success: true,
        orderId: shiprocketResponse.order_id,
        shipmentId: shiprocketResponse.shipment_id
      } : {
        success: false,
        message: 'Shipping integration pending'
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

// Add these new functions for Shiprocket management

export const generateShippingLabel = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shiprocket shipment not created yet"
      });
    }

    // Generate AWB
    const awbResponse = await ShiprocketAPI.generateAWB(
      order._id.toString(),
      order.shiprocketShipmentId
    );

    // Update order with AWB details
    order.awbNumber = awbResponse.awb_code;
    order.shiprocketStatus = 'AWB Generated';
    await order.save();

    res.status(200).json({
      success: true,
      message: "Shipping label generated",
      awbNumber: awbResponse.awb_code,
      courierName: awbResponse.courier_name,
      labelUrl: awbResponse.label_url
    });

  } catch (error) {
    console.error("Shipping label generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const trackShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.awbNumber) {
      return res.status(400).json({
        success: false,
        message: "AWB number not generated yet"
      });
    }

    const trackingInfo = await ShiprocketAPI.trackOrder(order.awbNumber);

    res.status(200).json({
      success: true,
      tracking: trackingInfo.tracking_data,
      status: trackingInfo.tracking_data?.shipment_status || 'Unknown'
    });

  } catch (error) {
    console.error("Tracking error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllOrdersWithShipping = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
    .populate("items.product")
    .populate("address")
    .populate("userId", "name phone email")
    .sort({ createdAt: -1 });

    // Format orders with shipping info
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      shippingInfo: {
        hasShiprocket: !!order.shiprocketOrderId,
        shiprocketOrderId: order.shiprocketOrderId,
        awbNumber: order.awbNumber,
        shippingStatus: order.shiprocketStatus || 'Not initiated'
      }
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message
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