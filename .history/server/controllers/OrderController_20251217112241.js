import Order from "../models/Order.js";
import Product from "../models/Product.js";

// COD hata ke sirf online payment ka function
export const placeOrderOnline = async (req, res) => {
  try {
    const { userId, items, address, transactionId } = req.body;
    
    // Validations
    if (!address || items.length === 0) {
      return res.json({
        success: false,
        message: "Address not provided",
      });
    }
    
    if (!transactionId || transactionId.trim() === '') {
      return res.json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Validate transaction ID format
    const trimmedTransactionId = transactionId.trim();
    if (trimmedTransactionId.length < 8) {
      return res.json({
        success: false,
        message: "Transaction ID must be at least 8 characters long",
      });
    }

    // Check if transaction ID already exists
    const existingOrder = await Order.findOne({ transactionId: trimmedTransactionId });
    if (existingOrder) {
      return res.json({
        success: false,
        message: "This Transaction ID is already used",
      });
    }

    // Calculate amount
    let amount = await items.reduce(async (total, item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }
      return (await total) + (product.offerPrice || product.price) * item.quantity;
    }, 0);

    // Add tax (5%)
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
    
    return res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// get order by userid
export const getUserOrders = async(req, res)=>{
  try {
    const userId = req.user._id;
    const orders = await Order.find({
      userId,
      isPaid: true // Sirf paid orders
    }).populate("items.product address").sort({createdAt: -1});
    
    res.json({
      success: true,
      orders
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}

// get all data for seller
export const getAllOrders = async(req, res)=>{
  try {
    const orders = await Order.find({
      isPaid: true // Sirf paid orders
    })
    .populate("items.product")
    .populate("address")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    })
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}