// controllers/OrderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";

// controllers/OrderController.js - Updated with Shiprocket
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import ShiprocketService from "../services/shiprocket.service.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";

// ... (keep existing placeOrderOnline, getUserOrders, getAllOrders, getOrderWhatsAppLink functions)

// ✅ Shiprocket: Create shipment and generate AWB
export const createShiprocketShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const seller = req.seller;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required"
      });
    }

    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('address')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if already shipped
    if (order.shippingInfo.hasShiprocket) {
      return res.status(400).json({
        success: false,
        message: "Shipment already created for this order"
      });
    }

    // Check if order is paid (for prepaid) or COD
    if (order.paymentType === "Online" && !order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Cannot ship unpaid order"
      });
    }

    // Create shipment in Shiprocket
    const shipmentResult = await ShiprocketService.createShipment(
      order,
      order.address,
      order.userId
    );

    if (!shipmentResult.success) {
      throw new Error('Failed to create shipment in Shiprocket');
    }

    // Generate label
    const labelResult = await ShiprocketService.generateLabel(shipmentResult.shipmentId);

    // Update order with shipping info
    order.shippingInfo = {
      hasShiprocket: true,
      shippingStatus: 'AWB Generated',
      awbNumber: shipmentResult.awbNumber,
      courierName: shipmentResult.courierName,
      shipmentId: shipmentResult.shipmentId,
      labelUrl: labelResult?.label_url,
      trackingUrl: `https://shiprocket.co/tracking/${shipmentResult.awbNumber}`,
      pickUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    };

    // Add tracking history
    order.trackingHistory.push({
      status: 'AWB Generated',
      location: 'Warehouse',
      date: new Date(),
      description: 'Shipping label generated and AWB assigned'
    });

    order.status = 'Processing';
    await order.save();

    // Send WhatsApp notification to customer
    const trackingMessage = `
🚚 *Your Order is Being Processed!*

Order ID: ${order._id.toString().slice(-8)}
AWB Number: ${shipmentResult.awbNumber}
Courier: ${shipmentResult.courierName}
Tracking: https://shiprocket.co/tracking/${shipmentResult.awbNumber}

Expected Delivery: ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Thank you for shopping with us!
    `;

    // You can integrate WhatsApp sending here

    return res.status(200).json({
      success: true,
      message: "Shipment created successfully",
      awbNumber: shipmentResult.awbNumber,
      labelUrl: labelResult?.label_url,
      trackingUrl: `https://shiprocket.co/tracking/${shipmentResult.awbNumber}`,
      courierName: shipmentResult.courierName,
      order: {
        id: order._id,
        status: order.status,
        shippingStatus: order.shippingInfo.shippingStatus
      }
    });

  } catch (error) {
    console.error("Create shipment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create shipment"
    });
  }
};

// ✅ Shiprocket: Track shipment
export const trackShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;
    const seller = req.seller;

    // Allow both user and seller to track
    if (!userId && !seller) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const order = await Order.findById(orderId)
      .populate('userId', 'name')
      .populate('address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check permission
    if (userId && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to track this order"
      });
    }

    if (!order.shippingInfo.awbNumber) {
      return res.status(400).json({
        success: false,
        message: "No tracking available for this order"
      });
    }

    // Get tracking from Shiprocket
    const trackingData = await ShiprocketService.trackShipment(order.shippingInfo.awbNumber);

    // Update local tracking history if new status
    const latestStatus = trackingData?.tracking_data?.shipment_status;
    if (latestStatus && latestStatus !== order.shippingInfo.shippingStatus) {
      order.shippingInfo.shippingStatus = latestStatus;
      
      // Add to history
      if (trackingData.tracking_data?.shipment_track_activities) {
        const latestActivity = trackingData.tracking_data.shipment_track_activities[0];
        order.trackingHistory.push({
          status: latestStatus,
          location: latestActivity?.location || '',
          date: new Date(),
          description: latestActivity?.activity || 'Status updated'
        });
      }

      // Update order status based on shipping status
      if (latestStatus === 'Delivered') {
        order.status = 'Delivered';
        order.shippingInfo.deliveredDate = new Date();
      } else if (latestStatus === 'In Transit') {
        order.status = 'Shipped';
      }
      
      await order.save();
    }

    return res.status(200).json({
      success: true,
      tracking: {
        awbNumber: order.shippingInfo.awbNumber,
        courier: order.shippingInfo.courierName,
        status: order.shippingInfo.shippingStatus,
        trackingUrl: order.shippingInfo.trackingUrl,
        expectedDelivery: order.shippingInfo.expectedDelivery,
        deliveredDate: order.shippingInfo.deliveredDate,
        tracking_data: trackingData.tracking_data,
        localHistory: order.trackingHistory
      }
    });

  } catch (error) {
    console.error("Track shipment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to track shipment"
    });
  }
};

// ✅ Shiprocket: Generate shipping label
export const generateShippingLabel = async (req, res) => {
  try {
    const { orderId } = req.params;
    const seller = req.seller;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required"
      });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.shippingInfo.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shipment not created yet"
      });
    }

    const labelResult = await ShiprocketService.generateLabel(order.shippingInfo.shipmentId);

    // Update label URL
    order.shippingInfo.labelUrl = labelResult?.label_url;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Shipping label generated",
      labelUrl: labelResult?.label_url,
      downloadUrl: labelResult?.download_url
    });

  } catch (error) {
    console.error("Generate label error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate label"
    });
  }
};

// ✅ Shiprocket: Request pickup
export const requestPickup = async (req, res) => {
  try {
    const { orderIds } = req.body;
    const seller = req.seller;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required"
      });
    }

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    // Get shipment IDs
    const orders = await Order.find({ _id: { $in: orderIds } });
    const shipmentIds = orders
      .filter(order => order.shippingInfo.shipmentId)
      .map(order => order.shippingInfo.shipmentId);

    if (shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid shipments found"
      });
    }

    const pickupResult = await ShiprocketService.requestPickup(shipmentIds);

    // Update orders with pickup info
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        $set: { 
          'shippingInfo.shippingStatus': 'Picked Up',
          'shippingInfo.pickUpDate': new Date()
        },
        $push: {
          trackingHistory: {
            status: 'Picked Up',
            location: 'Warehouse',
            date: new Date(),
            description: 'Order picked up by courier'
          }
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Pickup requested successfully",
      pickupId: pickupResult?.pickup_id,
      ordersUpdated: orders.length
    });

  } catch (error) {
    console.error("Request pickup error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to request pickup"
    });
  }
};

// ✅ Shiprocket: Cancel shipment
export const cancelShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const seller = req.seller;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required"
      });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.shippingInfo.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "No shipment to cancel"
      });
    }

    // Cancel in Shiprocket
    await ShiprocketService.cancelShipment(order.shippingInfo.shipmentId);

    // Update order
    order.shippingInfo.shippingStatus = 'Cancelled';
    order.status = 'Cancelled';
    order.trackingHistory.push({
      status: 'Cancelled',
      location: 'Warehouse',
      date: new Date(),
      description: 'Shipment cancelled by seller'
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Shipment cancelled successfully",
      order: {
        id: order._id,
        status: order.status
      }
    });

  } catch (error) {
    console.error("Cancel shipment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel shipment"
    });
  }
};

// ✅ Shiprocket: Check serviceability
export const checkServiceability = async (req, res) => {
  try {
    const { pincode, weight = 0.5 } = req.query;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: "Pincode is required"
      });
    }

    const serviceability = await ShiprocketService.checkServiceability(pincode, parseFloat(weight));

    return res.status(200).json({
      success: true,
      serviceability: serviceability.data?.available_courier_companies || []
    });

  } catch (error) {
    console.error("Serviceability check error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check serviceability"
    });
  }
};

// ✅ Shiprocket: Generate manifest
export const generateManifest = async (req, res) => {
  try {
    const { orderIds } = req.body;
    const seller = req.seller;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required"
      });
    }

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    // Get shipment IDs
    const orders = await Order.find({ _id: { $in: orderIds } });
    const shipmentIds = orders
      .filter(order => order.shippingInfo.shipmentId)
      .map(order => order.shippingInfo.shipmentId);

    if (shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid shipments found"
      });
    }

    const manifestResult = await ShiprocketService.generateManifest(shipmentIds);

    // Update orders with manifest info
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { 
        $set: { 
          'shippingInfo.manifestUrl': manifestResult?.manifest_url
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Manifest generated successfully",
      manifestUrl: manifestResult?.manifest_url,
      downloadUrl: manifestResult?.download_url,
      ordersIncluded: orders.length
    });

  } catch (error) {
    console.error("Generate manifest error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate manifest"
    });
  }
};

// ✅ Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const seller = req.seller;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required"
      });
    }

    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // If marking as shipped and has Shiprocket, update shipping status
    if (status === 'Shipped' && order.shippingInfo.hasShiprocket) {
      order.shippingInfo.shippingStatus = 'In Transit';
      order.trackingHistory.push({
        status: 'In Transit',
        location: 'Hub',
        date: new Date(),
        description: 'Order shipped and in transit'
      });
    }

    // If marking as delivered and has Shiprocket
    if (status === 'Delivered' && order.shippingInfo.hasShiprocket) {
      order.shippingInfo.shippingStatus = 'Delivered';
      order.shippingInfo.deliveredDate = new Date();
      order.trackingHistory.push({
        status: 'Delivered',
        location: order.address?.city || 'Destination',
        date: new Date(),
        description: 'Order delivered successfully'
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: order._id,
        status: order.status,
        shippingStatus: order.shippingInfo.shippingStatus
      }
    });

  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status"
    });
  }
};

// ✅ Get order tracking for user
export const getUserOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: userId
    })
    .populate('address')
    .populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Get tracking data if available
    let trackingData = null;
    if (order.shippingInfo.awbNumber) {
      try {
        trackingData = await ShiprocketService.trackShipment(order.shippingInfo.awbNumber);
      } catch (error) {
        console.error("Failed to fetch tracking:", error);
      }
    }

    return res.status(200).json({
      success: true,
      order: {
        id: order._id,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items,
        address: order.address,
        transactionId: order.transactionId,
        paymentType: order.paymentType,
        isPaid: order.isPaid
      },
      shipping: order.shippingInfo,
      tracking: trackingData,
      trackingHistory: order.trackingHistory
    });

  } catch (error) {
    console.error("Get user tracking error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get order tracking"
    });
  }
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