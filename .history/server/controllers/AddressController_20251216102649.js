import Address from "../models/Address.js";

// ================== Add Address ==================
export const addAddress = async (req, res) => {
  try {
    console.log("=== ADD ADDRESS API CALLED ===");
    console.log("Request Body:", req.body);
    console.log("Authenticated User:", req.user);
    
    // Extract address data from req.body
    const { address } = req.body;
    
    // Check if address data exists
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address data is required",
      });
    }
    
    // Get userId from req.user (set by authUser middleware)
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    
    // Create the address with userId
    const newAddress = await Address.create({ 
      ...address, 
      userId,
      createdAt: new Date()
    });
    
    console.log("Address created successfully:", newAddress);
    
    res.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.log("Error adding address:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

// ================== Get Addresses ==================
export const getAddress = async (req, res) => {
  try {
    console.log("=== GET ADDRESS API CALLED ===");
    console.log("Authenticated User:", req.user);
    
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    
    const addresses = await Address.find({ userId });
    console.log("Found addresses:", addresses);
    
    res.json({
      success: true,
      addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.log("Error getting addresses:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};