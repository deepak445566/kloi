import Order from '../models/Order.js';
import Address from '../models/Address.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import shiprocketService from '../services/shiprocketService.js';
import { sendOrderNotification } from '../utils/whatsappUtils.js';

// ✅ 1. CREATE SHIPROCKET ORDER
export const createShiprocketOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { forceCreate = false } = req.body;
    
    console.log(`🚀 Creating Shiprocket order for: ${orderId}`);

    // Find order with all details
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

    // Check if already has Shiprocket order
    if (order.shiprocketOrderId && !forceCreate) {
      return res.status(400).json({
        success: false,
        message: "Shiprocket order already exists",
        data: {
          shiprocketOrderId: order.shiprocketOrderId,
          shipmentId: order.shipmentId,
          awbCode: order.awbCode
        }
      });
    }

    // Get address details
    const address = await Address.findById(order.address);
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address not found"
      });
    }

    // Prepare order data for Shiprocket
    const orderData = {
      orderId: order._id.toString(),
      customerName: order.userId?.name || address.firstname || "Customer",
      customerEmail: order.userId?.email || address.email || "customer@email.com",
      customerPhone: order.userId?.phone || address.phone || "9999999999",
      address: {
        street: address.street || "Not Provided",
        city: address.city || "Not Provided",
        state: address.state || "Not Provided",
        pincode: address.pincode || address.zipcode || "000000",
        country: address.country || "India"
      },
      items: order.items.map(item => {
        const product = item.product || {};
        const itemPrice = item.price || product.offerPrice || product.price || 0;
        const gstPercentage = item.gstPercentage || product.gstPercentage || 5;
        const gstAmount = (itemPrice * item.quantity * gstPercentage) / 100;
        
        return {
          name: product.name || "Product",
          productId: product._id || "default",
          quantity: item.quantity,
          price: itemPrice * item.quantity,
          gstAmount: gstAmount,
          weight: product.weightValue || 0.5,
          category: product.category || "General"
        };
      }),
      subTotal: order.amount,
      shippingCharges: order.shippingCharges || 0,
      gstAmount: order.gstAmount || 0,
      totalAmount: order.totalAmount || order.amount,
      paymentType: order.paymentType
    };

    console.log('📦 Order data prepared for Shiprocket:', {
      orderId: orderData.orderId,
      customer: orderData.customerName,
      items: orderData.items.length,
      amount: orderData.totalAmount
    });

    // Create shipment in Shiprocket
    const shipmentResult = await shiprocketService.createShipment(orderData);
    
    if (!shipmentResult.success) {
      throw new Error(`Shipment creation failed: ${shipmentResult.error}`);
    }

    const { shipment_id, order_id } = shipmentResult;

    // Generate AWB
    const awbResult = await shiprocketService.generateAWB(shipment_id);
    
    if (!awbResult.success) {
      // Continue even if AWB fails, we can generate it later
      console.warn('⚠️ AWB generation failed, but shipment created:', awbResult.error);
    }

    // Generate label
    const labelResult = await shiprocketService.generateLabel(shipment_id);
    
    if (!labelResult.success) {
      console.warn('⚠️ Label generation failed:', labelResult.error);
    }

    // Update order with Shiprocket details
    const updates = {
      shiprocketOrderId: order_id,
      shipmentId: shipment_id,
      status: 'Processing',
      trackingData: {
        currentStatus: 'Shipment Created',
        currentStatusDate: new Date()
      }
    };

    if (awbResult.success) {
      updates.awbCode = awbResult.awb_code;
      updates.courierName = awbResult.courier_name;
      updates.courierCompanyId = awbResult.courier_company_id;
      updates.trackingData.currentStatus = 'AWB Generated';
    }

    if (labelResult.success) {
      updates.labelUrl = labelResult.label_url;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updates,
      { new: true }
    );

    // Send WhatsApp notification
    try {
      const whatsappData = {
        orderId: order._id,
        customerName: order.userId?.name || "Customer",
        customerPhone: order.userId?.phone || "Not provided",
        totalAmount: order.totalAmount,
        paymentType: order.paymentType,
        transactionId: order.transactionId,
        trackingId: updatedOrder.awbCode,
        courierName: updatedOrder.courierName,
        status: "Shipment Created",
        address: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
        items: order.items.map(item => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: (item.product?.price || 0) * item.quantity
        }))
      };

      await sendOrderNotification(whatsappData);
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError);
    }

    console.log('✅ Shiprocket order created successfully:', {
      orderId: order._id,
      shiprocketOrderId: order_id,
      shipmentId: shipment_id,
      awbCode: updatedOrder.awbCode
    });

    res.status(200).json({
      success: true,
      message: "Shiprocket order created successfully",
      data: {
        orderId: order._id,
        shiprocketOrderId: order_id,
        shipmentId: shipment_id,
        awbCode: updatedOrder.awbCode,
        courierName: updatedOrder.courierName,
        labelUrl: updatedOrder.labelUrl,
        status: updatedOrder.status,
        trackingData: updatedOrder.trackingData
      }
    });

  } catch (error) {
    console.error('❌ Shiprocket order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ✅ 2. BULK CREATE SHIPROCKET ORDERS
export const bulkCreateShiprocketOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    const results = [];
    const errors = [];

    for (const orderId of orderIds) {
      try {
        // Simulate the request
        const mockReq = { params: { orderId }, body: {} };
        const mockRes = {
          json: (data) => results.push({ orderId, success: data.success, data })
        };
        
        // Use the existing function
        await createShiprocketOrder(mockReq, mockRes);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errors.push({
          orderId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${orderIds.length} orders`,
      results: {
        successful: results.filter(r => r.success).length,
        failed: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    console.error('❌ Bulk creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 3. SCHEDULE PICKUP
export const schedulePickup = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    console.log(`🚛 Scheduling pickup for ${orderIds.length} orders`);

    // Get orders with shipment details
    const orders = await Order.find({ 
      _id: { $in: orderIds },
      shipmentId: { $exists: true, $ne: null, $ne: '' }
    });

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders with valid Shiprocket shipments found. Please create shipments first."
      });
    }

    // Extract valid shipment IDs
    const shipmentIds = orders
      .map(order => order.shipmentId)
      .filter(id => id && id.toString().trim() !== '');

    if (shipmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid shipment IDs found. Please create Shiprocket shipments for these orders first.",
        ordersWithoutShipment: orderIds.filter(orderId => 
          !orders.find(o => o._id.toString() === orderId)
        )
      });
    }

    // Schedule pickup with Shiprocket
    const pickupResult = await shiprocketService.schedulePickup(shipmentIds);
    
    if (!pickupResult.success) {
      throw new Error(`Pickup scheduling failed: ${pickupResult.error}`);
    }

    // Update orders
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1); // Tomorrow
    
    await Order.updateMany(
      { _id: { $in: orders.map(o => o._id) } },
      { 
        $set: { 
          pickupScheduledDate: pickupDate,
          status: 'Processing',
          'trackingData.pickupStatus': 'Scheduled',
          'trackingData.currentStatus': 'Pickup Scheduled'
        } 
      }
    );

    console.log('✅ Pickup scheduled successfully:', {
      scheduledOrders: orders.length,
      pickupDate: pickupDate.toISOString(),
      shipmentIds
    });

    res.status(200).json({
      success: true,
      message: `Pickup scheduled for ${shipmentIds.length} shipment(s)`,
      data: {
        pickupStatus: pickupResult.pickup_status,
        pickupScheduledDate: pickupResult.pickup_scheduled_date || pickupDate,
        scheduledOrders: orders.map(o => o._id),
        shipmentIds,
        ordersUpdated: orders.length
      }
    });

  } catch (error) {
    console.error('❌ Pickup scheduling error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ✅ 4. GENERATE MANIFEST
export const generateManifest = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    // Get orders with shipment details
    const orders = await Order.find({ 
      _id: { $in: orderIds },
      shipmentId: { $exists: true, $ne: null }
    });

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No orders with valid shipments found"
      });
    }

    const shipmentIds = orders
      .map(order => order.shipmentId)
      .filter(id => id);

    const manifestResult = await shiprocketService.generateManifest(shipmentIds);
    
    if (!manifestResult.success) {
      throw new Error(`Manifest generation failed: ${manifestResult.error}`);
    }

    // Update orders with manifest URL
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { manifestUrl: manifestResult.manifest_url } }
    );

    res.status(200).json({
      success: true,
      message: "Manifest generated successfully",
      data: {
        manifestUrl: manifestResult.manifest_url,
        ordersCount: orders.length,
        shipmentIds
      }
    });

  } catch (error) {
    console.error('❌ Manifest generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 5. TRACK SHIPMENT
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

    if (!order.awbCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking not available for this order. AWB code is missing."
      });
    }

    const trackingResult = await shiprocketService.trackShipment(order.awbCode);
    
    if (!trackingResult.success) {
      return res.status(400).json({
        success: false,
        message: trackingResult.error || "Failed to fetch tracking information"
      });
    }

    // Update order tracking data
    await order.updateTracking(trackingResult);

    const updatedOrder = await Order.findById(orderId);

    res.status(200).json({
      success: true,
      message: "Tracking information fetched successfully",
      data: {
        orderId: order._id,
        awbCode: order.awbCode,
        courierName: order.courierName,
        currentStatus: trackingResult.current_status,
        currentStatusDate: trackingResult.current_status_time,
        currentStatusLocation: trackingResult.current_status_location,
        estimatedDelivery: trackingResult.etd,
        trackingHistory: trackingResult.shipment_track_activities || [],
        orderStatus: updatedOrder.status,
        trackingData: updatedOrder.trackingData
      }
    });

  } catch (error) {
    console.error('❌ Tracking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 6. BULK TRACK SHIPMENTS
export const bulkTrackShipments = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({
        success: false,
        message: "Please provide order IDs"
      });
    }

    const orders = await Order.find({ 
      _id: { $in: orderIds },
      awbCode: { $exists: true, $ne: null }
    });

    const trackingResults = [];
    const errors = [];

    for (const order of orders) {
      try {
        const trackingResult = await shiprocketService.trackShipment(order.awbCode);
        
        if (trackingResult.success) {
          await order.updateTracking(trackingResult);
          trackingResults.push({
            orderId: order._id,
            awbCode: order.awbCode,
            success: true,
            currentStatus: trackingResult.current_status,
            status: order.status
          });
        } else {
          errors.push({
            orderId: order._id,
            error: trackingResult.error
          });
        }
      } catch (error) {
        errors.push({
          orderId: order._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Tracking updated for ${trackingResults.length} orders`,
      data: {
        successful: trackingResults.length,
        failed: errors.length,
        results: trackingResults,
        errors
      }
    });

  } catch (error) {
    console.error('❌ Bulk tracking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 7. DOWNLOAD LABEL
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
      // Try to generate label if not exists
      if (order.shipmentId) {
        const labelResult = await shiprocketService.generateLabel(order.shipmentId);
        
        if (labelResult.success) {
          order.labelUrl = labelResult.label_url;
          await order.save();
          
          return res.redirect(labelResult.label_url);
        }
      }
      
      return res.status(400).json({
        success: false,
        message: "Shipping label not available"
      });
    }

    // Redirect to label URL
    res.redirect(order.labelUrl);

  } catch (error) {
    console.error('❌ Label download error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 8. GENERATE INVOICE
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
      message: "Invoice generated successfully",
      data: {
        invoiceUrl: invoiceResult.invoice_url,
        orderId: order._id
      }
    });

  } catch (error) {
    console.error('❌ Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 9. CHECK SERVICEABILITY
export const checkServiceability = async (req, res) => {
  try {
    const { pincode } = req.params;
    const { weight = 0.5, cod = 0 } = req.query;
    
    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Valid 6-digit pincode required"
      });
    }

    const pickupPincode = shiprocketConfig.pickupLocation.pin_code;
    const serviceability = await shiprocketService.checkServiceability(
      pickupPincode,
      pincode,
      parseFloat(weight),
      parseFloat(cod)
    );

    if (!serviceability.success) {
      return res.status(400).json({
        success: false,
        message: serviceability.error
      });
    }

    res.status(200).json({
      success: true,
      message: "Serviceability checked successfully",
      data: {
        pickupPincode,
        deliveryPincode: pincode,
        serviceable: serviceability.availableCouriers.length > 0,
        availableCouriers: serviceability.availableCouriers,
        recommendedCouriers: serviceability.availableCouriers
          .filter(courier => shiprocketConfig.preferredCouriers.includes(courier.courier_name))
          .sort((a, b) => a.rate - b.rate)
      }
    });

  } catch (error) {
    console.error('❌ Serviceability check error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 10. CANCEL SHIPMENT
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

    if (!order.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "No shipment found for this order"
      });
    }

    // Cancel in Shiprocket
    const cancelResult = await shiprocketService.cancelShipment([order.shipmentId]);
    
    if (!cancelResult.success) {
      console.warn('⚠️ Shiprocket cancellation failed, but updating local status:', cancelResult.error);
    }

    // Update order status
    order.status = 'Cancelled';
    order.cancellationReason = reason;
    order.trackingData.currentStatus = 'Cancelled';
    order.trackingData.currentStatusDate = new Date();
    
    await order.save();

    res.status(200).json({
      success: true,
      message: "Shipment cancelled successfully",
      data: {
        orderId: order._id,
        status: order.status,
        cancellationReason: reason,
        cancelledAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Shipment cancellation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 11. UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = [
      'Order Placed', 'Confirmed', 'Processing', 'Shipped', 
      'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'RTO'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        ...(notes && { sellerNotes: notes }),
        ...(status === 'Delivered' && { 
          actualDeliveryDate: new Date(),
          'trackingData.currentStatus': 'Delivered',
          'trackingData.currentStatusDate': new Date(),
          'trackingData.deliveryStatus': 'Delivered'
        }),
        ...(status === 'Shipped' && { 
          'trackingData.currentStatus': 'Shipped',
          'trackingData.currentStatusDate': new Date()
        })
      },
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
      const whatsappData = {
        orderId: order._id,
        customerName: order.userId?.name || "Customer",
        customerPhone: order.userId?.phone || "Not provided",
        status: status,
        awbCode: order.awbCode,
        courierName: order.courierName,
        notes: notes
      };
      
      await sendOrderNotification(whatsappData, 'STATUS_UPDATE');
    } catch (whatsappError) {
      console.error("WhatsApp notification failed:", whatsappError);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        orderId: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
        trackingData: order.trackingData
      }
    });

  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 12. GET SHIPROCKET DASHBOARD STATS
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
      message: "Shiprocket stats fetched successfully",
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
          pendingShipmentCreation: totalOrders - ordersWithShipment,
          averageShipmentsPerDay: await calculateAverageShipments()
        }
      }
    });

  } catch (error) {
    console.error('❌ Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function
async function calculateAverageShipments() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const shipmentsLast30Days = await Order.countDocuments({
    shipmentId: { $exists: true, $ne: null },
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  return Math.round(shipmentsLast30Days / 30);
}

// ✅ 13. WEBHOOK HANDLER (for Shiprocket callbacks)
export const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('🔔 Shiprocket Webhook Received:', {
      type: webhookData.event,
      data: webhookData.data
    });

    // Validate webhook
    const validation = await shiprocketService.validateWebhook(webhookData);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook"
      });
    }

    // Handle different webhook events
    switch (webhookData.event) {
      case 'shipment_status_updated':
        await handleStatusUpdate(webhookData.data);
        break;
      
      case 'shipment_delivered':
        await handleDelivery(webhookData.data);
        break;
      
      case 'shipment_out_for_delivery':
        await handleOutForDelivery(webhookData.data);
        break;
      
      case 'shipment_picked_up':
        await handlePickup(webhookData.data);
        break;
      
      case 'rto_initiated':
        await handleRTO(webhookData.data);
        break;
      
      default:
        console.log('Unknown webhook event:', webhookData.event);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully"
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Still return 200 so Shiprocket doesn't retry
    res.status(200).json({
      success: false,
      message: "Webhook received but processing failed"
    });
  }
};

// Webhook handlers
async function handleStatusUpdate(data) {
  const { awb_code, current_status, current_status_time } = data;
  
  const order = await Order.findOne({ awbCode: awb_code });
  if (order) {
    order.trackingData.currentStatus = current_status;
    order.trackingData.currentStatusDate = new Date(current_status_time);
    order.status = mapShiprocketStatus(current_status);
    await order.save();
    
    console.log(`🔄 Order ${order._id} status updated to ${current_status}`);
  }
}

async function handleDelivery(data) {
  const { awb_code } = data;
  
  const order = await Order.findOne({ awbCode: awb_code });
  if (order) {
    order.status = 'Delivered';
    order.actualDeliveryDate = new Date();
    order.trackingData.currentStatus = 'Delivered';
    order.trackingData.currentStatusDate = new Date();
    order.trackingData.deliveryStatus = 'Delivered';
    await order.save();
    
    console.log(`🎉 Order ${order._id} marked as delivered`);
  }
}

async function handleOutForDelivery(data) {
  const { awb_code } = data;
  
  const order = await Order.findOne({ awbCode: awb_code });
  if (order) {
    order.status = 'Out for Delivery';
    order.trackingData.currentStatus = 'Out for Delivery';
    order.trackingData.currentStatusDate = new Date();
    await order.save();
    
    console.log(`🚚 Order ${order._id} is out for delivery`);
  }
}

async function handlePickup(data) {
  const { awb_code } = data;
  
  const order = await Order.findOne({ awbCode: awb_code });
  if (order) {
    order.pickupCompletedDate = new Date();
    order.trackingData.pickupStatus = 'Picked Up';
    order.trackingData.currentStatusDate = new Date();
    await order.save();
    
    console.log(`📦 Order ${order._id} picked up`);
  }
}

async function handleRTO(data) {
  const { awb_code } = data;
  
  const order = await Order.findOne({ awbCode: awb_code });
  if (order) {
    order.status = 'RTO';
    order.trackingData.currentStatus = 'RTO';
    order.trackingData.currentStatusDate = new Date();
    await order.save();
    
    console.log(`↩️ Order ${order._id} marked as RTO`);
  }
}

function mapShiprocketStatus(shiprocketStatus) {
  const statusMap = {
    'NEW': 'Order Placed',
    'PROCESSING': 'Processing',
    'MANIFESTED': 'Processing',
    'INTRANSIT': 'Shipped',
    'OUT FOR DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered',
    'CANCELLED': 'Cancelled',
    'RTO': 'RTO',
    'RETURNED': 'Returned'
  };
  
  return statusMap[shiprocketStatus] || shiprocketStatus;
}

// ✅ 14. GET ALL COURIERS
export const getAllCouriers = async (req, res) => {
  try {
    const couriersResult = await shiprocketService.getAllCouriers();
    
    if (!couriersResult.success) {
      return res.status(400).json({
        success: false,
        message: couriersResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: "Couriers fetched successfully",
      data: {
        couriers: couriersResult.couriers,
        count: couriersResult.couriers.length,
        preferredCouriers: shiprocketConfig.preferredCouriers
      }
    });

  } catch (error) {
    console.error('❌ Get couriers error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 15. RETRY FAILED SHIPMENTS
export const retryFailedShipments = async (req, res) => {
  try {
    // Find orders that failed shipment creation
    const failedOrders = await Order.find({
      $or: [
        { shipmentId: { $exists: false } },
        { shipmentId: null },
        { 
          $and: [
            { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            { status: 'Order Placed' }
          ]
        }
      ],
      status: { $nin: ['Cancelled', 'Delivered'] }
    })
    .populate('items.product')
    .populate('address')
    .populate('userId', 'name phone email')
    .limit(10);

    const results = [];
    
    for (const order of failedOrders) {
      try {
        const req = { params: { orderId: order._id }, body: { forceCreate: true } };
        const shipmentResult = await createShiprocketOrder(req, { json: () => {} });
        
        results.push({
          orderId: order._id,
          success: true,
          message: "Shipment created"
        });
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        results.push({
          orderId: order._id,
          success: false,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Retried ${failedOrders.length} failed shipments`,
      data: {
        attempted: failedOrders.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error) {
    console.error('❌ Retry failed shipments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 16. EXPORT ORDERS FOR SHIPROCKET
export const exportOrdersForShiprocket = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const query = {
      shipmentId: { $exists: false },
      status: { $nin: ['Cancelled', 'Delivered'] }
    };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('address')
      .populate('userId', 'name phone email')
      .select('_id items amount address paymentType transactionId createdAt')
      .lean();

    const exportData = orders.map(order => ({
      order_id: order._id.toString(),
      order_date: order.createdAt.toISOString().split('T')[0],
      customer_name: order.userId?.name || 'Customer',
      customer_phone: order.userId?.phone || order.address?.phone || '9999999999',
      customer_email: order.userId?.email || `${order.userId?.phone || 'customer'}@email.com`,
      shipping_address: order.address ? `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}` : 'Address not provided',
      total_amount: order.totalAmount || order.amount,
      payment_method: order.paymentType,
      items_count: order.items?.length || 0,
      items: order.items?.map(item => ({
        name: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.price || item.product?.offerPrice || 0
      })) || []
    }));

    res.status(200).json({
      success: true,
      message: "Orders exported successfully",
      data: {
        count: exportData.length,
        orders: exportData,
        summary: {
          totalAmount: exportData.reduce((sum, order) => sum + order.total_amount, 0),
          totalItems: exportData.reduce((sum, order) => sum + order.items_count, 0),
          codOrders: exportData.filter(o => o.payment_method === 'COD').length,
          prepaidOrders: exportData.filter(o => o.payment_method === 'Online').length
        }
      }
    });

  } catch (error) {
    console.error('❌ Export orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};