const shiprocketConfig = {
  email: process.env.SHIPROCKET_EMAIL || "your-email@example.com",
  password: process.env.SHIPROCKET_PASSWORD || "your-password",
  baseUrl: "https://apiv2.shiprocket.in/v1/external",
  
  // Seller details (update with your details)
  sellerDetails: {
    name: "Kuntal Agro Agencies",
    company: "Kuntal Agro Agencies",
    address: "Your Complete Address",
    city: "Sohna",
    state: "Haryana",
    country: "India",
    pincode: "122103",
    phone: "8586845185",
    email: "kuntalagrosohna@gmail.com"
  },
  
  // Pickup location
  pickupLocation: {
    name: "Kuntal Agro Agencies Warehouse",
    phone: "8586845185",
    address: "Warehouse Address",
    city: "Sohna",
    state: "Haryana",
    country: "India",
    pin_code: "122103"
  }
};

export default shiprocketConfig;