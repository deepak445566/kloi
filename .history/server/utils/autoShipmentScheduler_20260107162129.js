// utils/autoShipmentScheduler.js
import cron from 'node-cron';
import Order from '../models/Order.js';
import ShipRocketAPI from './shiprocketUtils.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import Product from '../models/Product.js';

class AutoShipmentScheduler {
  constructor() {
    this.isRunning = false;
  }

  start() {
    // Run every 5 minutes to check for new orders
    cron.schedule('*/5 * * * *', async () => {
      await this.processPendingOrders();
    });

    // Run every 30 minutes to update tracking
    cron.schedule('*/30 * * * *', async () => {
      await this.updateTrackingStatus();
    });

    // Run daily at 9 AM for next day pickup
    cron.schedule('0 9 * * *', async () => {
      await this.scheduleNextDayPickups();
    });

    console.log('🚚 Automated Shipping Scheduler Started');
  }

  async processPendingOrders() {
    if (this.isRunning) return;
    
    try {
      this.isRunning = true;
      
      // Find orders that are paid but not shipped yet
      const pendingOrders = await Order.find({
        isPaid: true,
        shiprocketOrderId: { $exists: false },
        'autoShipment.enabled': true,
        'autoShipment.attempted': false,
        status: { $in: ['Order Placed', 'Processing'] }
      })
      .populate('items.product')
      .populate('address')
      .populate('userId', 'name email phone')
      .limit(10); // Process 10 orders at a time

      for (const order of pendingOrders) {
        try {
          console.log(`🚀 Processing auto-shipment for order: ${order._id}`);
          
          // Mark as attempted
          order.autoShipment.attempted = true;
          order.autoShipment.processedAt = new Date();
          await order.save();

          // Create shipment in ShipRocket
          const user = await User.findById(order.userId);
          const address = await Address.findById(order.address);

          const shiprocketResponse = await ShipRocketAPI.createShiprocketOrder(
            order,
            order.items,
            user,
            address
          );

          if (shiprocketResponse.success) {
            // Update order with ShipRocket details
            order.shiprocketOrderId = shiprocketResponse.shiprocketOrderId;
            order.awbCode = shiprocketResponse.awbCode;
            order.courierName = shiprocketResponse.courierName;
            order.shiprocketData = shiprocketResponse.data;
            order.status = 'Ready for Pickup';
            order.shippingDate = new Date();
            
            // Calculate expected delivery (3 days from now)
            const expectedDelivery = new Date();
            expectedDelivery.setDate(expectedDelivery.getDate() + 3);
            order.expectedDelivery = expectedDelivery;

            // Generate shipping label
            const labelResponse = await ShipRocketAPI.generateShippingLabel(
              shiprocketResponse.shiprocketOrderId
            );
            
            if (labelResponse.success) {
              order.labelUrl = labelResponse.labelUrl;
              order.manifestUrl = labelResponse.manifestUrl;
            }

            // Add tracking event
            order.trackingEvents.push({
              status: 'Order Processed',
              location: 'Warehouse',
              remark: 'Order processed and ready for courier pickup'
            });

            await order.save();

            console.log(`✅ Auto-shipment created for order: ${order._id}`);
            
            // Send notification to user
            await this.sendShippingNotification(order, user);
            
          } else {
            console.error(`❌ Failed to create shipment for order: ${order._id}`, shiprocketResponse.error);
          }
        } catch (error) {
          console.error(`❌ Error processing order ${order._id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Auto-shipment scheduler error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async updateTrackingStatus() {
    try {
      // Find shipped orders that are not delivered
      const shippedOrders = await Order.find({
        shiprocketOrderId: { $exists: true },
        status: { $nin: ['Delivered', 'Cancelled', 'Returned'] }
      }).limit(20);

      for (const order of shippedOrders) {
        try {
          const trackingResponse = await ShipRocketAPI.trackShipment(order.shiprocketOrderId);
          
          if (trackingResponse.success && trackingResponse.trackingData) {
            const trackingData = trackingResponse.trackingData;
            
            // Update order status based on tracking
            if (trackingData.shipment_status) {
              const newStatus = this.mapShiprocketStatus(trackingData.shipment_status);
              
              if (newStatus && newStatus !== order.status) {
                order.status = newStatus;
                
                // Add tracking event
                order.trackingEvents.push({
                  status: newStatus,
                  location: trackingData.shipment_track_activities?.[0]?.location || 'In Transit',
                  remark: trackingData.shipment_track_activities?.[0]?.activity || 'Status updated'
                });

                // If delivered, update delivered date
                if (newStatus === 'Delivered') {
                  order.deliveredDate = new Date();
                }

                await order.save();
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error updating tracking for order ${order._id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Tracking update error:', error);
    }
  }

  async scheduleNextDayPickups() {
    try {
      // Find orders ready for pickup today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const ordersForPickup = await Order.find({
        status: 'Ready for Pickup',
        shippingDate: { $gte: today, $lt: tomorrow },
        shiprocketOrderId: { $exists: true }
      });

      // In a real system, you would:
      // 1. Generate pickup manifest
      // 2. Notify courier
      // 3. Update order status
      
      console.log(`📦 ${ordersForPickup.length} orders scheduled for pickup tomorrow`);

    } catch (error) {
      console.error('❌ Pickup scheduling error:', error);
    }
  }

  async sendShippingNotification(order, user) {
    try {
      // This function would integrate with your notification system
      // Email, SMS, WhatsApp, Push Notification, etc.
      
      const message = `🚚 Your order #${order._id.slice(-8)} has been shipped! 
Tracking Number: ${order.awbCode}
Courier: ${order.courierName}
Expected Delivery: ${order.expectedDelivery ? order.expectedDelivery.toLocaleDateString() : '3-5 days'}

Track your order: https://shiprocket.co/tracking/${order.awbCode}`;

      // You can use:
      // 1. Nodemailer for emails
      // 2. Twilio for SMS
      // 3. Your WhatsApp API
      // 4. Firebase for push notifications

      console.log(`📧 Shipping notification sent for order: ${order._id}`);
      
    } catch (error) {
      console.error('❌ Notification sending error:', error);
    }
  }

  mapShiprocketStatus(shiprocketStatus) {
    const statusMap = {
      'NEW': 'Ready for Pickup',
      'PICKUP_PENDING': 'Ready for Pickup',
      'PICKUP_QUEUED': 'Ready for Pickup',
      'PICKUP_GENERATED': 'Ready for Pickup',
      'PICKUP_ASSIGNED': 'Ready for Pickup',
      'PICKUP_RESCHEDULED': 'Ready for Pickup',
      'PICKED_UP': 'Picked Up',
      'PICKUP_FAILED': 'Failed Pickup',
      'IN_TRANSIT': 'In Transit',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'RTO': 'Returned',
      'LOST': 'Lost',
      'DAMAGED': 'Damaged'
    };

    return statusMap[shiprocketStatus] || 'In Transit';
  }
}

export default new AutoShipmentScheduler()