// utils/shiprocketUtils.js
import axios from 'axios';

class ShipRocketAPI {
  constructor() {
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.token = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      });

      if (response.data.token) {
        this.token = response.data.token;
        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        return this.token;
      }
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('ShipRocket authentication error:', error);
      throw error;
    }
  }

  async getToken() {
    if (!this.token || Date.now() > this.tokenExpiry) {
      await this.authenticate();
    }
    return this.token;
  }

  // Main function to create order in ShipRocket
  async createShiprocketOrder(orderData, orderItems, user, address) {
    try {
      const token = await this.getToken();
      
      // Prepare order items for ShipRocket
      const shiprocketItems = orderItems.map(item => ({
        name: item.product?.name || 'Product',
        sku: item.product?._id?.toString().slice(-12) || 'SKU' + Date.now(),
        units: item.quantity || 1,
        selling_price: Math.round(item.product?.offerPrice || item.product?.price || 0),
        discount: 0,
        tax: item.product?.gstPercentage || 5,
        hsn: 441122 // Default HSN code for agricultural products
      }));

      // Calculate dimensions and weight based on items
      const dimensions = this.calculatePackageDimensions(orderItems);
      
      // Prepare ShipRocket order payload
      const shiprocketPayload = {
        order_id: `${orderData._id.toString().slice(-8)}-${Date.now().toString().slice(-4)}`,
        order_date: new Date(orderData.createdAt || Date.now()).toISOString().replace('T', ' ').substring(0, 16),
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Warehouse",
        comment: `Reseller: ${process.env.COMPANY_NAME || "Kuntal Agro Agencies"}`,
        billing_customer_name: address?.firstname || user?.name || "Customer",
        billing_last_name: address?.lastname || "",
        billing_address: address?.street || "Address not provided",
        billing_address_2: address?.landmark || "",
        billing_city: address?.city || "Unknown City",
        billing_pincode: parseInt(address?.zipcode) || 0,
        billing_state: address?.state || "Unknown State",
        billing_country: address?.country || "India",
        billing_email: address?.email || user?.email || "customer@example.com",
        billing_phone: parseInt(address?.phone?.replace(/\D/g, '').slice(-10)) || 9999999999,
        billing_alternate_phone: "",
        shipping_is_billing: true,
        order_items: shiprocketItems,
        payment_method: orderData.paymentType === "COD" ? "COD" : "Prepaid",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: Math.round(orderData.amount),
        length: dimensions.length,
        breadth: dimensions.breadth,
        height: dimensions.height,
        weight: dimensions.weight,
        customer_gstin: address?.gstin || "",
        invoice_number: orderData.transactionId || "",
        order_type: "NON ESSENTIALS",
        is_document: 0,
        order_tag: "KuntalAgro"
      };

      // Send request to ShipRocket
      const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, shiprocketPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data,
        shiprocketOrderId: response.data.order_id,
        awbCode: response.data.awb_code,
        courierName: response.data.courier_name
      };
    } catch (error) {
      console.error('ShipRocket order creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Calculate package dimensions based on items
  calculatePackageDimensions(items) {
    // Default dimensions for small package
    let length = 10; // cm
    let breadth = 15; // cm
    let height = 5; // cm
    let weight = 0.5; // kg

    // Calculate based on number of items
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    if (totalItems > 10) {
      length = 30;
      breadth = 30;
      height = 20;
      weight = 5;
    } else if (totalItems > 5) {
      length = 25;
      breadth = 25;
      height = 15;
      weight = 3;
    } else if (totalItems > 2) {
      length = 20;
      breadth = 20;
      height = 10;
      weight = 1.5;
    }

    return { length, breadth, height, weight };
  }

  // Check serviceability
  async checkServiceability(pincode, weight = 0.5, codAmount = 0) {
    try {
      const token = await this.getToken();
      
      const response = await axios.get(`${this.baseURL}/courier/serviceability`, {
        params: {
          pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE || "122001",
          delivery_postcode: pincode,
          weight: weight,
          cod: codAmount > 0 ? 1 : 0,
          cod_amount: codAmount
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data,
        availableCouriers: response.data?.data?.available_courier_companies || []
      };
    } catch (error) {
      console.error('Serviceability check error:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Generate AWB and shipping label
  async generateShippingLabel(shiprocketOrderId) {
    try {
      const token = await this.getToken();
      
      const response = await axios.get(`${this.baseURL}/courier/generate/label`, {
        params: {
          order_id: shiprocketOrderId
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        labelUrl: response.data?.label_url,
        manifestUrl: response.data?.manifest_url
      };
    } catch (error) {
      console.error('Label generation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Track shipment
  async trackShipment(shiprocketOrderId) {
    try {
      const token = await this.getToken();
      
      const response = await axios.get(`${this.baseURL}/courier/track`, {
        params: {
          order_id: shiprocketOrderId
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        trackingData: response.data?.tracking_data || {},
        status: response.data?.tracking_data?.shipment_status
      };
    } catch (error) {
      console.error('Tracking error:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Cancel shipment
  async cancelShipment(shiprocketOrderId) {
    try {
      const token = await this.getToken();
      
      const response = await axios.post(`${this.baseURL}/orders/cancel`, {
        ids: [shiprocketOrderId]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        message: response.data?.message || 'Shipment cancelled successfully'
      };
    } catch (error) {
      console.error('Cancel shipment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Get all pickup locations
  async getPickupLocations() {
    try {
      const token = await this.getToken();
      
      const response = await axios.get(`${this.baseURL}/settings/pickup`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        locations: response.data?.data || []
      };
    } catch (error) {
      console.error('Get pickup locations error:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

export default new ShipRocketAPI();