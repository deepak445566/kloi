// services/shiprocket.service.js
import axios from 'axios';
import crypto from 'crypto';

class ShiprocketService {
  constructor() {
    this.email = process.env.SHIPROCKET_EMAIL || 'your-email@example.com';
    this.password = process.env.SHIPROCKET_PASSWORD || 'your-password';
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.token = null;
    this.tokenExpiry = null;
    
    // Seller details
    this.sellerDetails = {
      name: "KuntalAgroAgencies",
      phone: "+918586845185",
      email: "Kuntalagrosohna@gmail.com",
      address: "Your Business Address",
      city: "Sohna",
      state: "Haryana",
      pincode: "122103",
      country: "India"
    };
  }

  // Get authentication token
  async getToken() {
    try {
      // Check if token is still valid (valid for 24 hours)
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.email,
        password: this.password
      });

      if (response.data.token) {
        this.token = response.data.token;
        this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours
        return this.token;
      }
      
      throw new Error('Failed to get Shiprocket token');
    } catch (error) {
      console.error('Shiprocket auth error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Make authenticated request
  async makeRequest(method, endpoint, data = null) {
    try {
      const token = await this.getToken();
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Shiprocket API error:', {
        endpoint,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  // Calculate order weight
  calculateOrderWeight(items) {
    let totalWeight = 0;
    items.forEach(item => {
      // Default weight: 0.5kg per item if not specified
      const itemWeight = item.product?.weight || 0.5;
      totalWeight += itemWeight * item.quantity;
    });
    return Math.max(0.5, totalWeight); // Minimum 0.5kg
  }

  // Create shipment in Shiprocket
  async createShipment(order, address, user) {
    try {
      const orderWeight = this.calculateOrderWeight(order.items);
      
      const shipmentData = {
        order_id: order._id.toString(),
        order_date: new Date().toISOString().split('T')[0],
        channel_id: "123456", // Your channel ID
        billing_customer_name: user.name,
        billing_last_name: "",
        billing_address: address.street || "",
        billing_address_2: "",
        billing_city: address.city || "",
        billing_pincode: address.pincode || address.zipcode || "",
        billing_state: address.state || "",
        billing_country: address.country || "India",
        billing_email: user.email,
        billing_phone: address.phone || user.phone,
        shipping_is_billing: true,
        order_items: order.items.map((item, index) => ({
          name: item.product?.name || `Product ${index + 1}`,
          sku: item.product?._id?.toString() || `SKU${index}`,
          units: item.quantity,
          selling_price: item.price / item.quantity,
          discount: "",
          tax: "",
          hsn: 999999
        })),
        payment_method: order.paymentType === "COD" ? "COD" : "Prepaid",
        sub_total: order.amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: orderWeight
      };

      // Add COD amount if payment is COD
      if (order.paymentType === "COD") {
        shipmentData.total_discount = 0;
        shipmentData.shipping_charges = 0;
        shipmentData.giftwrap_charges = 0;
        shipmentData.transaction_charges = 0;
        shipmentData.cod_charges = 0;
        shipmentData.total = order.amount;
      }

      const response = await this.makeRequest('POST', '/orders/create/adhoc', shipmentData);
      
      if (response.order_id) {
        // Generate AWB
        const awbResponse = await this.generateAWB(response.order_id);
        
        return {
          success: true,
          shipmentId: response.order_id,
          awbNumber: awbResponse?.awb_code,
          courierId: awbResponse?.courier_id,
          courierName: awbResponse?.courier_name,
          status: response.status || "Created"
        };
      }
      
      throw new Error('Failed to create shipment');
    } catch (error) {
      console.error('Create shipment error:', error);
      throw error;
    }
  }

  // Generate AWB
  async generateAWB(shipmentId) {
    try {
      const response = await this.makeRequest('POST', '/courier/assign/awb', {
        shipment_id: shipmentId
      });
      
      return response;
    } catch (error) {
      console.error('Generate AWB error:', error);
      throw error;
    }
  }

  // Generate shipping label
  async generateLabel(shipmentId) {
    try {
      const response = await this.makeRequest('GET', `/courier/generate/label`, {
        params: {
          shipment_id: [shipmentId]
        }
      });
      
      return response;
    } catch (error) {
      console.error('Generate label error:', error);
      throw error;
    }
  }

  // Generate manifest
  async generateManifest(shipmentIds) {
    try {
      const response = await this.makeRequest('POST', '/manifests/generate', {
        shipment_ids: shipmentIds
      });
      
      return response;
    } catch (error) {
      console.error('Generate manifest error:', error);
      throw error;
    }
  }

  // Track shipment
  async trackShipment(awbNumber) {
    try {
      const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbNumber}`, {
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Track shipment error:', error);
      throw error;
    }
  }

  // Track by order ID
  async trackByOrderId(orderId) {
    try {
      const response = await this.makeRequest('GET', `/orders/show/${orderId}`);
      return response;
    } catch (error) {
      console.error('Track by order ID error:', error);
      throw error;
    }
  }

  // Cancel shipment
  async cancelShipment(shipmentId) {
    try {
      const response = await this.makeRequest('POST', '/orders/cancel', {
        ids: [shipmentId]
      });
      
      return response;
    } catch (error) {
      console.error('Cancel shipment error:', error);
      throw error;
    }
  }

  // Get serviceability
  async checkServiceability(pincode, weight = 0.5) {
    try {
      const response = await axios.get(`${this.baseURL}/courier/serviceability/`, {
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`
        },
        params: {
          pickup_postcode: this.sellerDetails.pincode,
          delivery_postcode: pincode,
          weight: weight,
          cod: 1, // Check for COD
          order_type: "ALL"
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Serviceability check error:', error);
      throw error;
    }
  }

  // Request pickup
  async requestPickup(shipmentIds, pickupDate = null) {
    try {
      const data = {
        shipment_id: shipmentIds
      };
      
      if (pickupDate) {
        data.pickup_date = pickupDate;
      }
      
      const response = await this.makeRequest('POST', '/courier/generate/pickup', data);
      return response;
    } catch (error) {
      console.error('Request pickup error:', error);
      throw error;
    }
  }

  // Create return shipment
  async createReturn(order, reason = "Customer Return") {
    try {
      const returnData = {
        order_id: order.shippingInfo.shipmentId,
        channel_id: "123456",
        return_date: new Date().toISOString().split('T')[0],
        reason: reason,
        pickup_location: this.sellerDetails.address,
        pickup_customer_name: this.sellerDetails.name,
        pickup_customer_phone: this.sellerDetails.phone,
        pickup_customer_email: this.sellerDetails.email,
        pickup_address: this.sellerDetails.address,
        pickup_city: this.sellerDetails.city,
        pickup_state: this.sellerDetails.state,
        pickup_pincode: this.sellerDetails.pincode,
        pickup_country: this.sellerDetails.country
      };

      const response = await this.makeRequest('POST', '/orders/create/return', returnData);
      return response;
    } catch (error) {
      console.error('Create return error:', error);
      throw error;
    }
  }
}

export default new ShiprocketService();