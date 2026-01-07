import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration object
export const SHIPROCKET_CONFIG = {
  email: process.env.SHIPROCKET_EMAIL || 'test@test.com',
  password: process.env.SHIPROCKET_PASSWORD || 'test123',
  pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE || '122103',
  pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'KuntalAgroSohna'
};

// Get authentication token
export const getShiprocketToken = async () => {
  try {
    console.log('Getting Shiprocket token...');
    
    // Mock token for now (Shiprocket API integrate करने के बाद actual API call करें)
    return 'mock_token_' + Date.now();
    
  } catch (error) {
    console.error('Shiprocket token error:', error.message);
    return 'mock_token';
  }
};