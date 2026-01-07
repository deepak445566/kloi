import Order from '../models/Order.js';
import Address from '../models/Address.js';
import User from '../models/User.js';
import shiprocketService from '../services/shiprocketService.js';
import { sendOrderNotification } from "../utils/whatsappUtils.js";

// ✅ Create Shiprocket shipment for order
export const createShiprocketOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find order
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

    // Prepare order data for Shiprocket
    const orderData = {
      orderId: order._id.toString(),
      customerName: order.userId?.name || "Customer",
      customerEmail: order.userId?.email || `${order.userId?.phone}@email.com`,
      customerPhone: order.userId?.phone || "9999999999",
      address: order.address || {},
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

    // Send WhatsApp notification with tracking
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
      address: order.address 
        ? `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
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
    const orders = await Order.find({ _id: { $in: orderIds } });
    const shipmentIds = orders.map(order => order.shipmentId).filter(id => id);
    
    if (shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid shipments found"
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
      "122103", // Your pickup pincode (update this)
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

// ✅ Update order status manually
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
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      status: order.status
    });

  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status"
    });
  }
};

// ✅ Get all orders with shipment details (for seller)
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