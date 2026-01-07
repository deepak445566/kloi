import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import { sendOrderNotification } from "../utils/whatsappUtils.js";
import shiprocketService from '../services/shiprocketService.js';

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
    
    // ✅ CREATE ORDER
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

    // ✅ TRY TO CREATE SHIPROCKET ORDER
    let shiprocketData = null;
    try {
      const orderForShiprocket = await Order.findById(order._id)
        .populate('items.product')
        .populate('address')
        .populate('userId', 'name phone email');

      const addressDetails = await Address.findById(address);
      
      const orderData = {
        orderId: order._id.toString(),
        customerName: orderForShiprocket.userId?.name || "Customer",
        customerEmail: orderForShiprocket.userId?.email || `${orderForShiprocket.userId?.phone}@email.com`,
        customerPhone: orderForShiprocket.userId?.phone || "9999999999",
        address: addressDetails || {},
        items: orderForShiprocket.items.map(item => ({
          name: item.product?.name || "Product",
          productId: item.product?._id || "default",
          quantity: item.quantity,
          price: item.product?.offerPrice * item.quantity || 0
        })),
        subTotal: amount,
        paymentType: "Online"
      };

      const shipmentResponse = await shiprocketService.createShipment(orderData);
      const awbResponse = await shiprocketService.generateAWB(shipmentResponse.shipment_id);
      const labelResponse = await shiprocketService.generateLabel(shipmentResponse.shipment_id);

      // Update order with Shiprocket details
      await Order.findByIdAndUpdate(order._id, {
        shiprocketOrderId: shipmentResponse.order_id,
        shipmentId: shipmentResponse.shipment_id,
        awbCode: awbResponse.response.data.awb_code,
        courierName: awbResponse.response.data.courier_name,
        courierCompanyId: awbResponse.response.data.courier_company_id,
        labelUrl: labelResponse.label_url,
        status: 'Processing'
      });

      shiprocketData = {
        shiprocketOrderId: shipmentResponse.order_id,
        shipmentId: shipmentResponse.shipment_id,
        awbCode: awbResponse.response.data.awb_code,
        courierName: awbResponse.response.data.courier_name,
        labelUrl: labelResponse.label_url
      };

    } catch (shiprocketError) {
      console.error("Shiprocket auto-creation failed:", shiprocketError);
      // Continue even if Shiprocket fails
    }

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
      awbCode: shiprocketData?.awbCode,
      courierName: shiprocketData?.courierName,
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
        status: 'Order Placed'
      },
      shiprocket: shiprocketData,
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

// ✅ Get user orders with tracking
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
    })
    .populate("items.product")
    .populate("address")
    .sort({createdAt: -1});
    
    // Fetch tracking for orders with AWB
    const ordersWithTracking = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();
      
      if (order.awbCode) {
        try {
          const trackingData = await shiprocketService.trackShipment(order.awbCode);
          if (trackingData.tracking_data?.shipment_track?.[0]) {
            orderObj.trackingData = {
              currentStatus: trackingData.tracking_data.shipment_track[0].current_status,
              currentStatusDate: trackingData.tracking_data.shipment_track[0].current_status_time,
              currentStatusLocation: trackingData.tracking_data.shipment_track[0].current_status_location,
              history: trackingData.tracking_data.shipment_track[0].shipment_track_activities || []
            };
          }
        } catch (trackingError) {
          console.error(`Tracking error for order ${order._id}:`, trackingError);
        }
      }
      
      return orderObj;
    }));
    
    res.status(200).json({
      success: true,
      orders: ordersWithTracking
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ✅ Get all orders for seller with stats
export const getAllOrders = async(req, res)=>{
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { $or: [{ paymentType: "COD" }, { isPaid: true }] };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { awbCode: { $regex: search, $options: 'i' } },
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'userId.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate("items.product")
        .populate("address")
        .populate("userId", "name phone email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      Order.countDocuments(query)
    ]);

    // Calculate statistics
    const allOrders = await Order.find({ 
      $or: [{ paymentType: "COD" }, { isPaid: true }] 
    });
    
    const stats = {
      total: totalOrders,
      placed: allOrders.filter(o => o.status === 'Order Placed').length,
      processing: allOrders.filter(o => o.status === 'Processing').length,
      shipped: allOrders.filter(o => o.status === 'Shipped').length,
      outForDelivery: allOrders.filter(o => o.status === 'Out for Delivery').length,
      delivered: allOrders.filter(o => o.status === 'Delivered').length,
      cancelled: allOrders.filter(o => o.status === 'Cancelled').length,
      returned: allOrders.filter(o => o.status === 'Returned').length,
      withTracking: allOrders.filter(o => o.awbCode).length,
      totalAmount: allOrders.reduce((sum, order) => sum + order.amount, 0)
    };

    res.status(200).json({
      success: true,
      orders,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// ✅ Get WhatsApp URL for specific order
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
      awbCode: order.awbCode,
      courierName: order.courierName,
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
        totalAmount: orderData.totalAmount,
        awbCode: orderData.awbCode,
        trackingAvailable: !!order.awbCode
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

// ✅ Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Send WhatsApp notification for status update
    try {
      const orderDataForWhatsApp = {
        orderId: order._id,
        customerName: order.userId?.name || "Customer",
        customerPhone: order.userId?.phone || "Not provided",
        status: status,
        awbCode: order.awbCode,
        courierName: order.courierName
      };
      
      await sendOrderNotification(orderDataForWhatsApp, 'STATUS_UPDATE');
    } catch (whatsappError) {
      console.error("WhatsApp notification failed:", whatsappError);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Create Shiprocket shipment for order
export const createShiprocketOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('address')
      .populate('userId', 'name phone email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: "Shiprocket order already created for this order"
      });
    }

    const addressDetails = await Address.findById(order.address);
    
    const orderData = {
      orderId: order._id.toString(),
      customerName: order.userId?.name || "Customer",
      customerEmail: order.userId?.email || `${order.userId?.phone}@email.com`,
      customerPhone: order.userId?.phone || "9999999999",
      address: addressDetails || {},
      items: order.items.map(item => ({
        name: item.product?.name || "Product",
        productId: item.product?._id || "default",
        quantity: item.quantity,
        price: item.product?.offerPrice * item.quantity || 0
      })),
      subTotal: order.amount,
      paymentType: order.paymentType
    };

    // Create shipment in Shiprocket
    const shipmentResponse = await shiprocketService.createShipment(orderData);
    
    // Generate AWB
    const awbResponse = await shiprocketService.generateAWB(shipmentResponse.shipment_id);
    
    // Generate label
    const labelResponse = await shiprocketService.generateLabel(shipmentResponse.shipment_id);

    // Update order with Shiprocket details
    order.shiprocketOrderId = shipmentResponse.order_id;
    order.shipmentId = shipmentResponse.shipment_id;
    order.awbCode = awbResponse.response.data.awb_code;
    order.courierName = awbResponse.response.data.courier_name;
    order.courierCompanyId = awbResponse.response.data.courier_company_id;
    order.labelUrl = labelResponse.label_url;
    order.status = 'Processing';
    await order.save();

    // Send WhatsApp notification
    const whatsappData = {
      orderId: order._id,
      customerName: order.userId?.name || "Customer",
      customerPhone: order.userId?.phone || "Not provided",
      totalAmount: order.amount,
      paymentType: order.paymentType,
      transactionId: order.transactionId,
      trackingId: order.awbCode,
      courierName: order.courierName,
      status: "Shipment Created",
      address: addressDetails 
        ? `${addressDetails.street}, ${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`
        : "Address not provided",
      items: order.items.map(item => ({
        name: item.product?.name || "Product",
        quantity: item.quantity,
        price: (item.product?.price || 0) * item.quantity
      }))
    };

    await sendOrderNotification(whatsappData);

    res.status(200).json({
      success: true,
      message: "Shiprocket order created successfully",
      data: {
        shiprocketOrderId: order.shiprocketOrderId,
        shipmentId: order.shipmentId,
        awbCode: order.awbCode,
        courierName: order.courierName,
        labelUrl: order.labelUrl,
        status: order.status
      }
    });

  } catch (error) {
    console.error("Shiprocket order creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Shiprocket order"
    });
  }
};

// ✅ Get tracking information
export const getTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.awbCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking not available for this order"
      });
    }

    const trackingData = await shiprocketService.trackShipment(order.awbCode);
    
    // Update order tracking data
    if (trackingData.tracking_data && trackingData.tracking_data.shipment_track) {
      const trackInfo = trackingData.tracking_data.shipment_track[0];
      
      order.trackingData = {
        currentStatus: trackInfo.current_status,
        currentStatusDate: new Date(trackInfo.current_status_time),
        currentStatusLocation: trackInfo.current_status_location,
        history: trackInfo.shipment_track_activities.map(activity => ({
          status: activity.status,
          date: new Date(activity.date),
          location: activity.location
        }))
      };
      
      // Update order status based on tracking
      if (trackInfo.current_status === 'Delivered') {
        order.status = 'Delivered';
      } else if (trackInfo.current_status === 'Out for Delivery') {
        order.status = 'Out for Delivery';
      } else if (trackInfo.current_status === 'Shipped') {
        order.status = 'Shipped';
      }
      
      await order.save();
    }

    res.status(200).json({
      success: true,
      tracking: order.trackingData,
      awbCode: order.awbCode,
      courierName: order.courierName,
      status: order.status
    });

  } catch (error) {
    console.error("Tracking fetch error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tracking information"
    });
  }
};

// ✅ Generate manifest for multiple orders
export const generateManifest = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    // Get shipment IDs for the orders
    const orders = await Order.find({ _id: { $in: orderIds } });
    const shipmentIds = orders.map(order => order.shipmentId).filter(id => id);
    
    if (shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid shipments found"
      });
    }

    const manifestResponse = await shiprocketService.generateManifest(shipmentIds);
    
    // Update orders with manifest URL
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { manifestUrl: manifestResponse.manifest_url } }
    );

    res.status(200).json({
      success: true,
      message: "Manifest generated successfully",
      manifestUrl: manifestResponse.manifest_url
    });

  } catch (error) {
    console.error("Manifest generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate manifest"
    });
  }
};

// ✅ Schedule pickup
export const schedulePickup = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    // Get shipment IDs for the orders
    const orders = await Order.find({ 
      _id: { $in: orderIds },
      shipmentId: { $exists: true, $ne: null }
    });
    
    const shipmentIds = orders.map(order => order.shipmentId).filter(id => id);
    
    if (shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid shipments found. Please create shipments first."
      });
    }

    const pickupResponse = await shiprocketService.schedulePickup(shipmentIds);
    
    // Update orders with pickup date
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1); // Tomorrow
    
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { pickupScheduledDate: pickupDate, status: 'Processing' } }
    );

    res.status(200).json({
      success: true,
      message: "Pickup scheduled successfully",
      pickupDate: pickupDate.toISOString(),
      pickupData: pickupResponse
    });

  } catch (error) {
    console.error("Pickup scheduling error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to schedule pickup"
    });
  }
};

// ✅ Cancel shipment
export const cancelShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "No shipment found for this order"
      });
    }

    await shiprocketService.cancelShipment(order.shipmentId);
    
    // Update order status
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: "Shipment cancelled successfully",
      status: order.status
    });

  } catch (error) {
    console.error("Shipment cancellation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel shipment"
    });
  }
};

// ✅ Get available couriers for order
export const getCouriersForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId).populate('address');
    
    if (!order || !order.address) {
      return res.status(404).json({
        success: false,
        message: "Order or address not found"
      });
    }

    const couriers = await shiprocketService.getAvailableCouriers(
      "122103", // Your pickup pincode
      order.address.pincode,
      0.5, // weight in kg
      10,  // length in cm
      10,  // breadth in cm
      10   // height in cm
    );

    res.status(200).json({
      success: true,
      couriers: couriers.data?.available_courier_companies || []
    });

  } catch (error) {
    console.error("Courier fetch error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch available couriers"
    });
  }
};

// ✅ Get Shiprocket dashboard stats
export const getShiprocketStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const ordersWithShipment = await Order.countDocuments({ 
      shipmentId: { $exists: true, $ne: null } 
    });
    const ordersWithAWB = await Order.countDocuments({ 
      awbCode: { $exists: true, $ne: null } 
    });
    const ordersShipped = await Order.countDocuments({ status: 'Shipped' });
    const ordersDelivered = await Order.countDocuments({ status: 'Delivered' });
    const ordersInTransit = await Order.countDocuments({ 
      status: { $in: ['Processing', 'Out for Delivery'] } 
    });

    // Get recent shipments
    const recentShipments = await Order.find({
      shipmentId: { $exists: true, $ne: null }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('_id status awbCode courierName totalAmount createdAt')
    .lean();

    // Get pending pickups
    const pendingPickups = await Order.find({
      status: 'Processing',
      shipmentId: { $exists: true, $ne: null },
      pickupScheduledDate: { $exists: false }
    })
    .select('_id createdAt totalAmount')
    .limit(5)
    .lean();

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          ordersWithShipment,
          ordersWithAWB,
          shipmentPercentage: totalOrders > 0 ? Math.round((ordersWithShipment / totalOrders) * 100) : 0
        },
        statusBreakdown: {
          shipped: ordersShipped,
          delivered: ordersDelivered,
          inTransit: ordersInTransit,
          pending: totalOrders - (ordersShipped + ordersDelivered + ordersInTransit)
        },
        recentShipments,
        pendingPickups,
        summary: {
          totalShipments: ordersWithShipment,
          totalAWBGenerated: ordersWithAWB,
          pendingShipmentCreation: totalOrders - ordersWithShipment
        }
      }
    });

  } catch (error) {
    console.error("Get Shiprocket stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Download label
export const downloadLabel = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.labelUrl) {
      return res.status(400).json({
        success: false,
        message: "Label not available"
      });
    }

    res.status(200).json({
      success: true,
      labelUrl: order.labelUrl
    });

  } catch (error) {
    console.error("Label download error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Generate invoice
export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shipment not created for this order"
      });
    }

    const invoiceResult = await shiprocketService.generateInvoice([order.shipmentId]);
    
    if (!invoiceResult.success) {
      throw new Error(invoiceResult.error);
    }

    // Update order with invoice URL
    order.invoiceUrl = invoiceResult.invoice_url;
    await order.save();

    res.status(200).json({
      success: true,
      invoiceUrl: invoiceResult.invoice_url
    });

  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Check serviceability
export const checkServiceability = async (req, res) => {
  try {
    const { pincode } = req.params;
    const { weight = 0.5 } = req.query;
    
    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Valid 6-digit pincode required"
      });
    }

    const serviceability = await shiprocketService.checkServiceability(
      "122103", // Your pickup pincode
      pincode,
      parseFloat(weight),
      0
    );

    if (!serviceability.success) {
      return res.status(400).json({
        success: false,
        message: serviceability.error
      });
    }

    res.status(200).json({
      success: true,
      serviceable: serviceability.availableCouriers.length > 0,
      availableCouriers: serviceability.availableCouriers
    });

  } catch (error) {
    console.error("Serviceability check error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Get all shipments
export const getAllShipments = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('items.product')
      .populate('address')
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
      stats: {
        total: orders.length,
        processing: orders.filter(o => o.status === 'Processing').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        pending: orders.filter(o => o.status === 'Order Placed').length
      }
    });

  } catch (error) {
    console.error("Get shipments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch shipments"
    });
  }
};