// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";

// controllers/OrderController.js - Updated with Delhivery
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import Shipment from "../models/Shipment.js";
import delhiveryService from "../services/delhivery.service.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";

export const placeOrderOnline = async (req, res) => {
  try {
    const { items, address, transactionId, shippingMode = 'Surface' } = req.body;
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

    // Calculate amount and get product details
    let amount = 0;
    const orderItems = [];
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      
      const itemPrice = product.offerPrice || product.price;
      const itemTotal = itemPrice * item.quantity;
      amount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        name: product.name,
        price: itemTotal,
        weight: product.weight || 500
      });
    }

    // Add 5% tax
    const tax = Math.floor(amount * 0.05);
    amount += tax;
    
    // Create order
    const order = await Order.create({
      userId,
      items: orderItems,
      amount,
      address,
      paymentType: "Online",
      isPaid: true,
      transactionId: trimmedTransactionId,
      shippingMode,
      totalAmount: amount,
      codAmount: 0,
      pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION || 'Your_Warehouse_Name',
      status: 'Order Placed'
    });

    // ✅ Fetch user and address details
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

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      orderDetails: {
        amount: amount,
        items: orderItems.length,
        transactionId: trimmedTransactionId,
        tax: tax,
        shippingMode: shippingMode
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

// ✅ Create shipment on Delhivery
export const createShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order with all related data
    const order = await Order.findById(orderId)
      .populate('userId', 'name phone')
      .populate('address')
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if shipment already exists
    const existingShipment = await Shipment.findOne({ orderId });
    if (existingShipment && existingShipment.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: "Shipment already created for this order",
        shipment: existingShipment
      });
    }

    // Get user and address
    const user = order.userId;
    const address = order.address;

    if (!user || !address) {
      return res.status(400).json({
        success: false,
        message: "User or address details not found"
      });
    }

    // Get all products
    const productIds = order.items.map(item => item.product?._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });

    // Prepare Delhivery payload
    const delhiveryPayload = delhiveryService.prepareShipmentPayload(order, user, address, products);
    
    // Save payload to shipment record
    const shipment = new Shipment({
      orderId: order._id,
      paymentMode: delhiveryPayload.shipments[0].payment_mode,
      delhiveryPayload: delhiveryPayload,
      status: 'created'
    });

    await shipment.save();

    // Call Delhivery API
    const apiResponse = await delhiveryService.createShipment(delhiveryPayload);

    if (!apiResponse.success) {
      // Save error
      shipment.status = 'failed';
      shipment.errors.push({
        timestamp: new Date(),
        error: apiResponse.error,
        response: apiResponse
      });
      shipment.attempts += 1;
      await shipment.save();

      return res.status(400).json({
        success: false,
        message: "Failed to create shipment on Delhivery",
        error: apiResponse.error,
        shipmentId: shipment._id
      });
    }

    // Update shipment with Delhivery response
    shipment.status = 'manifested';
    shipment.delhiveryResponse = apiResponse.data;
    shipment.manifestedAt = new Date();
    
    // Extract waybill from response
    if (apiResponse.data && apiResponse.data.packages) {
      const waybill = apiResponse.data.packages[0]?.waybill;
      if (waybill) {
        shipment.waybill = waybill;
        shipment.trackingUrl = delhiveryService.generateTrackingUrl(waybill);
        
        // Update order with waybill and tracking
        order.waybill = waybill;
        order.trackingUrl = shipment.trackingUrl;
        order.delhiveryStatus = 'manifested';
        order.shipmentId = shipment._id;
        await order.save();
      }
    }

    await shipment.save();

    res.json({
      success: true,
      message: "Shipment created successfully on Delhivery",
      shipment: {
        id: shipment._id,
        waybill: shipment.waybill,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status
      },
      order: {
        id: order._id,
        status: order.status,
        delhiveryStatus: order.delhiveryStatus
      }
    });

  } catch (error) {
    console.error("Create shipment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create shipment",
      error: error.message
    });
  }
};

// ✅ Create COD order with Delhivery
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address, shippingMode = 'Surface' } = req.body;
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
        message: "Address not provided",
      });
    }

    // Calculate amount
    let amount = 0;
    const orderItems = [];
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      
      const itemPrice = product.offerPrice || product.price;
      const itemTotal = itemPrice * item.quantity;
      amount += itemTotal;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        name: product.name,
        price: itemTotal,
        weight: product.weight || 500
      });
    }

    // Create COD order
    const order = await Order.create({
      userId,
      items: orderItems,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
      shippingMode,
      totalAmount: amount,
      codAmount: amount, // For COD, codAmount = total amount
      pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION || 'Your_Warehouse_Name',
      status: 'Order Placed'
    });

    // Get user and address for WhatsApp
    const user = await User.findById(userId).select('name phone');
    const addressDetails = await Address.findById(address);
    
    // Send WhatsApp notification
    const orderDataForWhatsApp = {
      orderId: order._id,
      customerName: user?.name || "Customer",
      customerPhone: user?.phone || "Not provided",
      totalAmount: amount,
      paymentType: "COD",
      address: addressDetails 
        ? `${addressDetails.street}, ${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`
        : "Address not provided",
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    const whatsappNotification = await sendOrderNotification(orderDataForWhatsApp);

    // Auto-create shipment for COD orders
    try {
      // Prepare and send to Delhivery
      const delhiveryPayload = delhiveryService.prepareShipmentPayload(order, user, addressDetails, products);
      const apiResponse = await delhiveryService.createShipment(delhiveryPayload);

      if (apiResponse.success) {
        // Create shipment record
        const shipment = new Shipment({
          orderId: order._id,
          paymentMode: 'COD',
          delhiveryPayload: delhiveryPayload,
          delhiveryResponse: apiResponse.data,
          status: 'manifested',
          manifestedAt: new Date()
        });

        // Extract waybill
        if (apiResponse.data && apiResponse.data.packages) {
          const waybill = apiResponse.data.packages[0]?.waybill;
          if (waybill) {
            shipment.waybill = waybill;
            shipment.trackingUrl = delhiveryService.generateTrackingUrl(waybill);
            
            // Update order
            order.waybill = waybill;
            order.trackingUrl = shipment.trackingUrl;
            order.delhiveryStatus = 'manifested';
            order.shipmentId = shipment._id;
            await order.save();
          }
        }

        await shipment.save();
      }
    } catch (delhiveryError) {
      console.error("Auto-shipment creation failed:", delhiveryError);
      // Don't fail the order if Delhivery fails
    }

    res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      orderId: order._id,
      orderDetails: {
        amount: amount,
        items: orderItems.length,
        paymentType: "COD",
        shippingMode: shippingMode,
        waybill: order.waybill || null,
        trackingUrl: order.trackingUrl || null
      },
      whatsappNotification: {
        success: whatsappNotification.success,
        url: whatsappNotification.whatsappUrl,
        message: "Order details sent to WhatsApp"
      }
    });

  } catch (error) {
    console.error("COD order placement error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get all orders for seller (with shipment info)
export const getAllOrders = async(req, res)=>{
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
    .populate("items.product")
    .populate("address")
    .populate("userId", "name phone email")
    .populate("shipmentId") // Populate shipment details
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

// ✅ Update order routes

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