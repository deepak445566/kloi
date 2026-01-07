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
      transactionId: trimmedTransactionId
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
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
    .populate("items.product")
    .populate("address")
    .populate("userId", "name phone email")
    .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      total: orders.length,
      placed: orders.filter(o => o.status === 'Order Placed').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
      returned: orders.filter(o => o.status === 'Returned').length,
      withTracking: orders.filter(o => o.awbCode).length,
      totalAmount: orders.reduce((sum, order) => sum + order.amount, 0)
    };

    res.status(200).json({
      success: true,
      orders,
      stats
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