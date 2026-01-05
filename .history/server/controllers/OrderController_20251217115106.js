import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ✅ Online Payment ke liye - userId auth se aayega
export const placeOrderOnline = async (req, res) => {
  try {
    const { items, address, transactionId } = req.body;
    const userId = req.user?._id || req.body.userId; // ✅ Both auth and body
    
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
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      amount += (product.offerPrice || product.price) * item.quantity;
    }

    amount += Math.floor(amount * 0.05);
    
    // Create order
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: true,
      transactionId: trimmedTransactionId
    });
    
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ COD ke liye - userId body se aayega (existing code)
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Address not provided",
      });
    }

    // Calculate amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }
      amount += (product.offerPrice || product.price) * item.quantity;
    }

    amount += Math.floor(amount * 0.05);
    
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
      transactionId: "" // COD ke liye empty
    });
    
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    console.error("COD Order error:", error);
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