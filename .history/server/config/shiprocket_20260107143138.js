const shiprocketConfig = {
  // Authentication
  email: process.env.SHIPROCKET_EMAIL || "your-email@example.com",
  password: process.env.SHIPROCKET_PASSWORD || "your-password",
  baseUrl: "https://apiv2.shiprocket.in/v1/external",
  
  // Seller/Business Details
  sellerDetails: {
    name: "Kuntal Agro Agencies",
    company: "Kuntal Agro Agencies",
    address: "Your Complete Business Address",
    city: "Sohna",
    state: "Haryana",
    country: "India",
    pin_code: "122103",
    phone: "8586845185",
    email: "kuntalagrosohna@gmail.com",
    gstin: process.env.GST_NUMBER || ""
  },
  
  // Pickup Location (Warehouse)
  pickupLocation: {
    pickup_location: "Primary",
    name: "Kuntal Agro Agencies Warehouse",
    phone: "8586845185",
    address: "Complete Warehouse Address",
    city: "Sohna",
    state: "Haryana",
    country: "India",
    pin_code: "122103",
    email: "kuntalagrosohna@gmail.com"
  },
  
  // Shipping Settings
  shipping: {
    defaultWeight: 0.5, // kg
    defaultLength: 10,  // cm
    defaultBreadth: 10, // cm
    defaultHeight: 10,  // cm
    defaultShippingCharges: 0,
    codCharges: 0,
    insuranceAmount: 0
  },
  
  // Product Categories Mapping (for Shiprocket)
  productCategories: {
    "Fertilizer": "Fertilizers & Chemicals",
    "Pesticide": "Pesticides & Insecticides",
    "Crop": "Agriculture Products",
    "Sprayers": "Agricultural Equipment",
    "Household Items": "Home & Kitchen",
    "Terrace Gardening": "Gardening Tools"
  },
  
  // Courier Preferences (Priority order)
  preferredCouriers: [
    "Delhivery",
    "Ecom Express",
    "XpressBees",
    "DTDC",
    "Blue Dart"
  ],
  
  // GST Settings
  gst: {
    sellerGstin: process.env.GST_NUMBER || "",
    hsnCode: "441122", // Default HSN code for agricultural products
    taxPercentage: 5
  },
  
  // Webhook URL (for Shiprocket to send updates)
  webhookUrl: process.env.WEBHOOK_URL || "https://your-domain.com/api/shiprocket/webhook",
  
  // Testing Mode
  testMode: process.env.NODE_ENV === 'development',
  
  // Retry Settings
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  }
};

export default shiprocketConfig;