import axios from 'axios';
import shiprocketConfig from '../config/shiprocket.js';
import Order from '../models/Order.js';

class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.baseUrl = shiprocketConfig.baseUrl;
  }

  // ✅ 1. AUTHENTICATION
  async authenticate() {
    try {
      console.log('🔐 Authenticating with Shiprocket...');
      
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: shiprocketConfig.email,
        password: shiprocketConfig.password
      });
      
      if (response.data.token) {
        this.token = response.data.token;
        this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000); // 23 hours
        console.log('✅ Shiprocket authentication successful');
        return this.token;
      } else {
        throw new Error('No token received from Shiprocket');
      }
    } catch (error) {
      console.error('❌ Shiprocket authentication failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getAuthHeaders() {
    if (!this.token || new Date() > this.tokenExpiry) {
      await this.authenticate();
    }
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // ✅ 2. CHECK COURIER SERVICEABILITY
  async checkServiceability(pickupPincode, deliveryPincode, weight, cod = 0) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(`${this.baseUrl}/courier/serviceability`, {
        headers,
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight,
          cod,
          length: shiprocketConfig.shipping.defaultLength,
          breadth: shiprocketConfig.shipping.defaultBreadth,
          height: shiprocketConfig.shipping.defaultHeight
        }
      });

      return {
        success: true,
        data: response.data.data,
        availableCouriers: response.data.data?.available_courier_companies || []
      };
    } catch (error) {
      console.error('❌ Serviceability check failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        availableCouriers: []
      };
    }
  }

  // ✅ 3. CREATE SHIPMENT ORDER
  async createShipment(orderData) {
    try {
      const headers = await this.getAuthHeaders();
      
      // Prepare order items for Shiprocket
      const orderItems = orderData.items.map((item, index) => ({
        name: item.name.substring(0, 50), // Shiprocket has 50 char limit
        sku: item.productId || `SKU${index + 1}`,
        units: item.quantity,
        selling_price: Math.round(item.price / item.quantity),
        discount: "",
        tax: item.gstAmount || 0,
        hsn: shiprocketConfig.gst.hsnCode
      }));

      // Calculate totals
      const subtotal = orderItems.reduce((sum, item) => 
        sum + (item.selling_price * item.units), 0
      );
      const totalTax = orderItems.reduce((sum, item) => sum + (item.tax || 0), 0);

      // Prepare shipment data
      const shipmentData = {
        order_id: orderData.orderId,
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: shiprocketConfig.pickupLocation.pickup_location,
        channel_id: "",
        comment: "",
        billing_customer_name: orderData.customerName,
        billing_last_name: "",
        billing_address: orderData.address.street.substring(0, 100),
        billing_address_2: "",
        billing_city: orderData.address.city,
        billing_pincode: orderData.address.pincode.toString(),
        billing_state: orderData.address.state,
        billing_country: "India",
        billing_email: orderData.customerEmail || `${orderData.customerPhone}@customer.com`,
        billing_phone: orderData.customerPhone,
        shipping_is_billing: true,
        shipping_customer_name: "",
        shipping_last_name: "",
        shipping_address: "",
        shipping_address_2: "",
        shipping_city: "",
        shipping_pincode: "",
        shipping_country: "",
        shipping_state: "",
        shipping_email: "",
        shipping_phone: "",
        order_items: orderItems,
        payment_method: orderData.paymentType === "COD" ? "COD" : "Prepaid",
        shipping_charges: orderData.shippingCharges || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: subtotal,
        length: shiprocketConfig.shipping.defaultLength,
        breadth: shiprocketConfig.shipping.defaultBreadth,
        height: shiprocketConfig.shipping.defaultHeight,
        weight: shiprocketConfig.shipping.defaultWeight
      };

      // Add COD amount if COD payment
      if (orderData.paymentType === "COD") {
        shipmentData.cod_amount = orderData.totalAmount;
      }

      console.log('🚚 Creating Shiprocket shipment:', {
        orderId: orderData.orderId,
        items: orderItems.length,
        amount: orderData.totalAmount
      });

      const response = await axios.post(
        `${this.baseUrl}/orders/create/adhoc`,
        shipmentData,
        { headers, timeout: 30000 }
      );

      console.log('✅ Shipment created successfully:', {
        shipmentId: response.data.shipment_id,
        orderId: response.data.order_id
      });

      return {
        success: true,
        order_id: response.data.order_id,
        shipment_id: response.data.shipment_id,
        status: response.data.status,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Shipment creation failed:', {
        orderId: orderData.orderId,
        error: error.response?.data || error.message
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  // ✅ 4. GENERATE AWB
  async generateAWB(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('📦 Generating AWB for shipment:', shipmentId);

      const response = await axios.post(
        `${this.baseUrl}/courier/assign/awb`,
        { shipment_id: parseInt(shipmentId) },
        { headers }
      );

      console.log('✅ AWB generated:', {
        awbCode: response.data.response.data.awb_code,
        courier: response.data.response.data.courier_name
      });

      return {
        success: true,
        awb_code: response.data.response.data.awb_code,
        courier_name: response.data.response.data.courier_name,
        courier_company_id: response.data.response.data.courier_company_id,
        data: response.data
      };

    } catch (error) {
      console.error('❌ AWB generation failed:', {
        shipmentId,
        error: error.response?.data || error.message
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 5. GENERATE LABEL
  async generateLabel(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('🏷️ Generating label for shipment:', shipmentId);

      const response = await axios.post(
        `${this.baseUrl}/courier/generate/label`,
        { shipment_id: [parseInt(shipmentId)] },
        { headers }
      );

      console.log('✅ Label generated successfully');

      return {
        success: true,
        label_url: response.data.label_url,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Label generation failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 6. GENERATE MANIFEST
  async generateManifest(shipmentIds) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('📋 Generating manifest for shipments:', shipmentIds);

      const response = await axios.post(
        `${this.baseUrl}/manifests/generate`,
        { shipment_id: shipmentIds.map(id => parseInt(id)) },
        { headers }
      );

      console.log('✅ Manifest generated:', {
        manifestUrl: response.data.manifest_url,
        count: shipmentIds.length
      });

      return {
        success: true,
        manifest_url: response.data.manifest_url,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Manifest generation failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 7. SCHEDULE PICKUP
  async schedulePickup(shipmentIds) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('🚛 Scheduling pickup for shipments:', shipmentIds);

      // Validate shipment IDs
      if (!shipmentIds || shipmentIds.length === 0) {
        throw new Error('No shipment IDs provided');
      }

      // Convert to integers (Shiprocket expects integers)
      const validShipmentIds = shipmentIds
        .filter(id => id && !isNaN(parseInt(id)))
        .map(id => parseInt(id));

      if (validShipmentIds.length === 0) {
        throw new Error('No valid shipment IDs');
      }

      const response = await axios.post(
        `${this.baseUrl}/courier/generate/pickup`,
        { shipment_id: validShipmentIds },
        { headers }
      );

      console.log('✅ Pickup scheduled:', {
        pickupStatus: response.data.pickup_status,
        scheduledDate: response.data.pickup_scheduled_date,
        count: validShipmentIds.length
      });

      return {
        success: true,
        pickup_status: response.data.pickup_status,
        pickup_scheduled_date: response.data.pickup_scheduled_date,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Pickup scheduling failed:', {
        shipmentIds,
        error: error.response?.data || error.message
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 8. TRACK SHIPMENT
  async trackShipment(awbCode) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('📍 Tracking shipment:', awbCode);

      const response = await axios.get(
        `${this.baseUrl}/courier/track/awb/${awbCode}`,
        { headers }
      );

      const trackingData = response.data.tracking_data;
      
      if (trackingData && trackingData.shipment_track && trackingData.shipment_track.length > 0) {
        const trackInfo = trackingData.shipment_track[0];
        
        console.log('✅ Tracking data fetched:', {
          currentStatus: trackInfo.current_status,
          awbCode: trackInfo.awb_code,
          courier: trackInfo.courier_name
        });

        return {
          success: true,
          awb_code: trackInfo.awb_code,
          courier_name: trackInfo.courier_name,
          current_status: trackInfo.current_status,
          current_status_time: trackInfo.current_status_time,
          current_status_location: trackInfo.current_status_location,
          etd: trackInfo.etd,
          shipment_track_activities: trackInfo.shipment_track_activities || [],
          tracking_data: trackingData
        };
      } else {
        return {
          success: false,
          error: 'No tracking data available'
        };
      }

    } catch (error) {
      console.error('❌ Tracking failed:', {
        awbCode,
        error: error.response?.data || error.message
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 9. BULK TRACKING
  async bulkTrackShipments(awbCodes) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('📍 Bulk tracking shipments:', awbCodes.length);

      const response = await axios.get(
        `${this.baseUrl}/courier/track`,
        {
          headers,
          params: {
            awbs: awbCodes.join(',')
          }
        }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Bulk tracking failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 10. CANCEL SHIPMENT
  async cancelShipment(shipmentIds) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('❌ Cancelling shipments:', shipmentIds);

      const response = await axios.post(
        `${this.baseUrl}/orders/cancel`,
        {
          ids: shipmentIds.map(id => parseInt(id))
        },
        { headers }
      );

      console.log('✅ Shipments cancelled:', response.data);

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Shipment cancellation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 11. GENERATE INVOICE
  async generateInvoice(shipmentIds) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('🧾 Generating invoice for shipments:', shipmentIds);

      const response = await axios.post(
        `${this.baseUrl}/orders/print/invoice`,
        {
          shipment_id: shipmentIds.map(id => parseInt(id))
        },
        { headers }
      );

      console.log('✅ Invoice generated');

      return {
        success: true,
        invoice_url: response.data.invoice_url,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Invoice generation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 12. GET ALL COURIERS
  async getAllCouriers() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(
        `${this.baseUrl}/courier`,
        { headers }
      );

      return {
        success: true,
        couriers: response.data.data || []
      };

    } catch (error) {
      console.error('❌ Fetch couriers failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 13. UPDATE ORDER (if needed)
  async updateOrder(shipmentId, updateData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.post(
        `${this.baseUrl}/orders/update/adhoc`,
        {
          shipment_id: parseInt(shipmentId),
          ...updateData
        },
        { headers }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Order update failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 14. RTO SHIPMENT
  async rtoShipment(shipmentId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.post(
        `${this.baseUrl}/orders/rto`,
        {
          shipment_id: parseInt(shipmentId)
        },
        { headers }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('❌ RTO failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 15. CHECK PICKUP STATUS
  async checkPickupStatus(pickupToken) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(
        `${this.baseUrl}/courier/pickup/${pickupToken}`,
        { headers }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Pickup status check failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ✅ 16. WEBHOOK VALIDATION
  async validateWebhook(webhookData) {
    try {
      // Verify webhook signature if provided
      if (webhookData.signature) {
        // Add signature validation logic here
      }
      
      return {
        success: true,
        valid: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ 17. BULK SHIPMENT CREATION
  async bulkCreateShipments(ordersData) {
    try {
      const results = [];
      
      for (const orderData of ordersData) {
        try {
          const result = await this.createShipment(orderData);
          results.push({
            orderId: orderData.orderId,
            success: result.success,
            data: result.success ? {
              shipmentId: result.shipment_id,
              orderId: result.order_id
            } : result.error
          });
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          results.push({
            orderId: orderData.orderId,
            success: false,
            error: error.message
          });
        }
      }
      
      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ 18. RETRY FAILED OPERATION
  async retryOperation(operation, params, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${operation.name}`);
        
        const result = await operation(...params);
        
        if (result.success) {
          console.log(`✅ ${operation.name} succeeded on attempt ${attempt}`);
          return result;
        }
        
        lastError = result.error;
        
      } catch (error) {
        lastError = error.message;
      }
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * attempt)
        );
      }
    }
    
    console.error(`❌ ${operation.name} failed after ${maxRetries} attempts`);
    return {
      success: false,
      error: lastError
    };
  }
}

export default new ShiprocketService();