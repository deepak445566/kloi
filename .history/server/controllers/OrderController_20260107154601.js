// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";
import ShipRocketAPI from "../utils/shiprocketUtils.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";
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




// Existing functions (placeOrderOnline, getUserOrders, getAllOrders, getOrderWhatsAppLink)
// ... keep all your existing functions ...

// ✅ NEW: Create ShipRocket shipment for order
export const createShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('address')
      .populate('userId', 'name email phone');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if already shipped
    if (order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: "Shipment already created for this order"
      });
    }

    // Get user and address
    const user = await User.findById(order.userId);
    const address = await Address.findById(order.address);

    // Create shipment in ShipRocket
    const shiprocketResponse = await ShipRocketAPI.createShiprocketOrder(
      order,
      order.items,
      user,
      address
    );

    if (!shiprocketResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to create shipment",
        error: shiprocketResponse.error
      });
    }

    // Update order with ShipRocket details
    order.shiprocketOrderId = shiprocketResponse.shiprocketOrderId;
    order.awbCode = shiprocketResponse.awbCode;
    order.courierName = shiprocketResponse.courierName;
    order.shiprocketData = shiprocketResponse.data;
    order.status = 'Shipped';
    order.shippingDate = new Date();
    
    // Generate shipping label
    const labelResponse = await ShipRocketAPI.generateShippingLabel(
      shiprocketResponse.shiprocketOrderId
    );
    
    if (labelResponse.success) {
      order.labelUrl = labelResponse.labelUrl;
      order.manifestUrl = labelResponse.manifestUrl;
    }

    await order.save();

    // Send WhatsApp notification
    const orderDataForWhatsApp = {
      orderId: order._id,
      customerName: user?.name || "Customer",
      customerPhone: user?.phone || address?.phone || "Not provided",
      totalAmount: order.amount,
      paymentType: order.paymentType,
      transactionId: order.transactionId,
      awbNumber: order.awbCode,
      courier: order.courierName,
      trackingUrl: `https://shiprocket.co/tracking/${order.awbCode}`,
      address: address 
        ? `${address.street}, ${address.city}, ${address.state} - ${address.zipcode}\n📞 ${address.phone || "No phone"}`
        : "Address not provided",
      items: order.items.map(item => ({
        name: item.product?.name || "Product",
        quantity: item.quantity,
        price: (item.product?.offerPrice || item.product?.price || 0) * item.quantity
      }))
    };

    const whatsappNotification = await sendOrderNotification(orderDataForWhatsApp);

    return res.status(200).json({
      success: true,
      message: "Shipment created successfully",
      data: {
        orderId: order._id,
        shiprocketOrderId: order.shiprocketOrderId,
        awbCode: order.awbCode,
        courierName: order.courierName,
        status: order.status,
        trackingUrl: `https://shiprocket.co/tracking/${order.awbCode}`,
        labelUrl: order.labelUrl,
        shippingDate: order.shippingDate
      },
      whatsappNotification: {
        success: whatsappNotification.success,
        url: whatsappNotification.whatsappUrl,
        message: "Shipping details sent to WhatsApp"
      }
    });
    
  } catch (error) {
    console.error("Create shipment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ NEW: Check serviceability
export const checkServiceability = async (req, res) => {
  try {
    const { pincode, weight, orderId } = req.body;
    
    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required"
      });
    }

    // If orderId is provided, get order details
    let codAmount = 0;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentType === "COD") {
        codAmount = order.amount;
      }
    }

    const serviceabilityResponse = await ShipRocketAPI.checkServiceability(
      pincode,
      weight || 0.5,
      codAmount
    );

    if (!serviceabilityResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to check serviceability",
        error: serviceabilityResponse.error
      });
    }

    return res.status(200).json({
      success: true,
      data: serviceabilityResponse.data,
      availableCouriers: serviceabilityResponse.availableCouriers
    });
    
  } catch (error) {
    console.error("Serviceability check error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ NEW: Track shipment
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

    if (!order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: "No shipment created for this order"
      });
    }

    const trackingResponse = await ShipRocketAPI.trackShipment(order.shiprocketOrderId);

    if (!trackingResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to track shipment",
        error: trackingResponse.error
      });
    }

    // Update order status if changed
    if (trackingResponse.status && trackingResponse.status !== order.status) {
      order.status = trackingResponse.status;
      order.shiprocketStatus = trackingResponse.status;
      await order.save();
    }

    return res.status(200).json({
      success: true,
      trackingData: trackingResponse.trackingData,
      status: trackingResponse.status,
      orderId: order._id,
      awbCode: order.awbCode,
      courierName: order.courierName
    });
    
  } catch (error) {
    console.error("Track shipment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ NEW: Get shipping label
export const getShippingLabel = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: "No shipment created for this order"
      });
    }

    const labelResponse = await ShipRocketAPI.generateShippingLabel(order.shiprocketOrderId);

    if (!labelResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate shipping label",
        error: labelResponse.error
      });
    }

    // Update order with label URLs
    order.labelUrl = labelResponse.labelUrl;
    order.manifestUrl = labelResponse.manifestUrl;
    await order.save();

    return res.status(200).json({
      success: true,
      labelUrl: labelResponse.labelUrl,
      manifestUrl: labelResponse.manifestUrl,
      orderId: order._id
    });
    
  } catch (error) {
    console.error("Get shipping label error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ NEW: Cancel shipment
export const cancelShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: "No shipment created for this order"
      });
    }

    const cancelResponse = await ShipRocketAPI.cancelShipment(order.shiprocketOrderId);

    if (!cancelResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to cancel shipment",
        error: cancelResponse.error
      });
    }

    // Update order status
    order.status = 'Cancelled';
    order.notes = order.notes || [];
    order.notes.push(`Shipment cancelled: ${reason || 'No reason provided'} - ${new Date().toLocaleString()}`);
    await order.save();

    return res.status(200).json({
      success: true,
      message: cancelResponse.message || "Shipment cancelled successfully",
      orderId: order._id,
      status: order.status
    });
    
  } catch (error) {
    console.error("Cancel shipment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ NEW: Get pickup locations
export const getPickupLocations = async (req, res) => {
  try {
    const locationsResponse = await ShipRocketAPI.getPickupLocations();

    if (!locationsResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pickup locations",
        error: locationsResponse.error
      });
    }

    return res.status(200).json({
      success: true,
      locations: locationsResponse.locations
    });
    
  } catch (error) {
    console.error("Get pickup locations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ NEW: Bulk create shipments
export const bulkCreateShipments = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    const results = [];
    
    for (const orderId of orderIds) {
      try {
        // Find order
        const order = await Order.findById(orderId)
          .populate('items.product')
          .populate('address')
          .populate('userId', 'name email phone');
        
        if (!order) {
          results.push({
            orderId,
            success: false,
            message: "Order not found"
          });
          continue;
        }

        // Skip if already shipped
        if (order.shiprocketOrderId) {
          results.push({
            orderId,
            success: false,
            message: "Shipment already exists"
          });
          continue;
        }

        // Get user and address
        const user = await User.findById(order.userId);
        const address = await Address.findById(order.address);

        // Create shipment
        const shiprocketResponse = await ShipRocketAPI.createShiprocketOrder(
          order,
          order.items,
          user,
          address
        );

        if (shiprocketResponse.success) {
          // Update order
          order.shiprocketOrderId = shiprocketResponse.shiprocketOrderId;
          order.awbCode = shiprocketResponse.awbCode;
          order.courierName = shiprocketResponse.courierName;
          order.shiprocketData = shiprocketResponse.data;
          order.status = 'Shipped';
          order.shippingDate = new Date();
          await order.save();

          results.push({
            orderId,
            success: true,
            shiprocketOrderId: shiprocketResponse.shiprocketOrderId,
            awbCode: shiprocketResponse.awbCode,
            courierName: shiprocketResponse.courierName
          });
        } else {
          results.push({
            orderId,
            success: false,
            message: "Failed to create shipment",
            error: shiprocketResponse.error
          });
        }
      } catch (error) {
        results.push({
          orderId,
          success: false,
          message: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      results,
      total: orderIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
    
  } catch (error) {
    console.error("Bulk create shipments error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};