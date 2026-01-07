import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration object
export const SHIPROCKET_CONFIG = {
  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD,
  pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE || '122103',
  pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'KuntalAgroSohna',
  sellerName: 'Kuntal Agro',
  sellerPhone: '9911577652',
  sellerEmail: 'kuntalagrosohna@gmail.com'
};

// Get authentication token
export const getShiprocketToken = async () => {
  try {
    console.log('Getting Shiprocket token with email:', SHIPROCKET_CONFIG.email);
    
    if (!SHIPROCKET_CONFIG.email || !SHIPROCKET_CONFIG.password) {
      throw new Error('Shiprocket credentials not configured');
    }
    
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: SHIPROCKET_CONFIG.email,
      password: SHIPROCKET_CONFIG.password
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.token) {
      console.log('Shiprocket token received successfully');
      return response.data.token;
    } else {
      throw new Error('No token received from Shiprocket');
    }
    
  } catch (error) {
    console.error('Shiprocket token error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Shiprocket authentication failed: ${error.message}`);
  }
};

// Export default if needed
export default {
  SHIPROCKET_CONFIG,
  getShiprocketToken
};