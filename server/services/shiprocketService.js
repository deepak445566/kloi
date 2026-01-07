import axios from 'axios';
import shiprocketConfig from '../config/shiprocket.js';

class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // ✅ Authenticate and get token
  async authenticate() {
    try {
      const response = await axios.post(`${shiprocketConfig.baseUrl}/auth/login`, {
        email: shiprocketConfig.email,
        password: shiprocketConfig.password
      });
      
      this.token = response.data.token;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      return this.token;
    } catch (error) {
      console.error("Shiprocket authentication failed:", error.response?.data || error.message);
      throw new Error("Shiprocket authentication failed");
    }
  }

  // ✅ Get auth headers
  async getAuthHeaders() {
    if (!this.token || new Date() > this.tokenExpiry) {
      await this.authenticate();
    }
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // ✅ Create shipment
  async createShipment(orderData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const shipmentData = {
        order_id: orderData.orderId,
        order_date: new Date().toISOString(),
        pickup_location: "Primary",
        billing_customer_name: orderData.customerName,
        billing_last_name: "",
        billing_address: orderData.address.street,
        billing_city: orderData.address.city,
        billing_pincode: orderData.address.pincode,
        billing_state: orderData.address.state,
        billing_country: "India",
        billing_email: orderData.customerEmail || orderData.customerPhone + "@email.com",
        billing_phone: orderData.customerPhone,
        shipping_is_billing: true,
        order_items: orderData.items.map(item => ({
          name: item.name,
          sku: item.productId,
          units: item.quantity,
          selling_price: item.price / item.quantity,
          discount: "",
          tax: "",
          hsn: 441122
        })),
        payment_method: orderData.paymentType === "COD" ? "COD" : "Prepaid",
        sub_total: orderData.subTotal,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
      };

      const response = await axios.post(
        `${shiprocketConfig.baseUrl}/orders/create/adhoc`,
        shipmentData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Shiprocket shipment creation failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // ✅ Generate AWB and assign courier
  async generateAWB(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.post(
        `${shiprocketConfig.baseUrl}/courier/assign/awb`,
        {
          shipment_id: shipmentId
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("AWB generation failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // ✅ Generate shipping label
  async generateLabel(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.post(
        `${shiprocketConfig.baseUrl}/courier/generate/label`,
        {
          shipment_id: [shipmentId]
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Label generation failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // ✅ Generate manifest
  async generateManifest(shipmentIds) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.post(
        `${shiprocketConfig.baseUrl}/manifests/generate`,
        {
          shipment_id: shipmentIds
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Manifest generation failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // ✅ Track shipment
  async trackShipment(awbCode) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(
        `${shiprocketConfig.baseUrl}/courier/track/awb/${awbCode}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Tracking failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // ✅ Cancel shipment
  async cancelShipment(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.post(
        `${shiprocketConfig.baseUrl}/orders/cancel`,
        {
          ids: [shipmentId]
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Shipment cancellation failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // ✅ Get available couriers
  async getAvailableCouriers(pickupPincode, deliveryPincode, weight, length, breadth, height) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(
        `${shiprocketConfig.baseUrl}/courier/serviceability`,
        {
          headers,
          params: {
            pickup_postcode: pickupPincode,
            delivery_postcode: deliveryPincode,
            weight,
            length,
            breadth,
            height
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Courier serviceability check failed:", error.response?.data || error.message);
      throw error;
    }
  }

  // ✅ Pickup schedule
  async schedulePickup(shipmentIds) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.post(
        `${shiprocketConfig.baseUrl}/courier/generate/pickup`,
        {
          shipment_id: shipmentIds
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Pickup scheduling failed:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ShiprocketService();