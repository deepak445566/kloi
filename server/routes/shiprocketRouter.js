import express from "express";
import { ShiprocketService } from "../services/shiprocketService.js";
import Order from "../models/Order.js";
import authSeller from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";

const shiprocketRouter = express.Router();

// Check serviceability (public)
shiprocketRouter.post('/check-service', async (req, res) => {
  try {
    const { pincode, weight } = req.body;
    
    const result = await ShiprocketService.checkServiceability(pincode, weight || 0.5);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get tracking info (user & seller)
shiprocketRouter.get('/track/:orderId', authUser, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Check if user owns the order (for users)
    if (req.user.role !== 'seller' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    
    let trackingData = null;
    if (order.shiprocket?.awbCode) {
      trackingData = await ShiprocketService.trackShipment(order.shiprocket.awbCode);
    }
    
    res.json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        shiprocket: order.shiprocket,
        trackingHistory: order.trackingHistory
      },
      trackingData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate label (seller only)
shiprocketRouter.post('/generate-label/:orderId', authSeller, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order?.shiprocket?.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shipment not created yet"
      });
    }
    
    const result = await ShiprocketService.generateLabel(order.shiprocket.shipmentId);
    
    // Update label URL if new one generated
    if (result.label_url) {
      order.shiprocket.labelUrl = result.label_url;
      await order.save();
    }
    
    res.json({
      success: true,
      labelUrl: result.label_url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel shipment (seller only)
shiprocketRouter.post('/cancel/:orderId', authSeller, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order?.shiprocket?.shipmentId) {
      return res.status(400).json({
        success: false,
        message: "Shipment not found"
      });
    }
    
    const result = await ShiprocketService.cancelShipment(order.shiprocket.shipmentId);
    
    // Update order status
    order.status = 'Cancelled';
    order.shiprocket.status = 'CANCELLED';
    order.trackingHistory.push({
      status: 'Cancelled',
      date: new Date(),
      remark: reason || 'Shipment cancelled by seller'
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: "Shipment cancelled successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Webhook endpoint for Shiprocket updates
shiprocketRouter.post('/webhook', async (req, res) => {
  try {
    const { awb, status, remark, location, datetime } = req.body;
    
    console.log('Shiprocket webhook received:', req.body);
    
    // Find order by AWB code
    const order = await Order.findOne({ 'shiprocket.awbCode': awb });
    
    if (order) {
      // Update tracking history
      order.trackingHistory.push({
        status: status,
        date: new Date(datetime),
        location: location || '',
        remark: remark || ''
      });
      
      // Update shipment status
      if (order.shiprocket) {
        order.shiprocket.status = status;
      }
      
      // Update main order status
      if (status.includes('Delivered')) {
        order.status = 'Delivered';
      } else if (status.includes('Shipped')) {
        order.status = 'Shipped';
      } else if (status.includes('Cancelled')) {
        order.status = 'Cancelled';
      }
      
      await order.save();
      
      // You can send notifications to user here
      console.log(`Order ${order._id} updated with status: ${status}`);
    }
    
    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default shiprocketRouter;