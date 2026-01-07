import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class ShiprocketAPI {
  constructor() {
    this.baseURL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
    this.token = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      });

      this.token = response.data.token;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      return this.token;
    } catch (error) {
      console.error('Shiprocket authentication failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getToken() {
    if (!this.token || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
    return this.token;
  }

  async createOrder(orderData) {
    try {
      const token = await this.getToken();
      
      const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Shiprocket order creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateAWB(orderId, shipmentId) {
    try {
      const token = await this.getToken();
      
      const response = await axios.post(`${this.baseURL}/courier/assign/awb`, {
        shipment_id: shipmentId,
        courier_id: orderId // You need to get courier_id from courier list API
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Shiprocket AWB generation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async trackOrder(awbNumber) {
    try {
      const token = await this.getToken();
      
      const response = await axios.get(`${this.baseURL}/courier/track/awb/${awbNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Shiprocket tracking failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ShiprocketAPI();