import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const SHIPROCKET_CONFIG = {
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
    console.log('Getting Shiprocket token...');
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: SHIPROCKET_CONFIG.email,
      password: SHIPROCKET_CONFIG.password
    }, {
      timeout: 10000
    });
    
    console.log('Shiprocket token received');
    return response.data.token;
  } catch (error) {
    console.error('Shiprocket token error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

export default SHIPROCKET_CONFIG;