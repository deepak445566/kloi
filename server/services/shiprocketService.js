import axios from 'axios';
import { getShiprocketToken, SHIPROCKET_CONFIG } from '../config/shiprocket.js';

export class ShiprocketService {
  
  // Create shipment in Shiprocket
  static async createShipment(orderData, userData, addressData, items) {
    try {
      console.log('Creating Shiprocket shipment for order:', orderData._id);
      
      const token = await getShiprocketToken();
      
      // Prepare order items
      const order_items = items.map((item, index) => ({
        name: item.product.name.substring(0, 100), // Limit name length
        sku: `KUNTAL${item.product._id.toString().slice(-6)}`,
        units: item.quantity,
        selling_price: item.product.offerPrice || item.product.price,
        discount: 0,
        tax: item.product.gstPercentage || 5,
        hsn: 999999,
        product_id: item.product._id.toString()
      }));
      
      // Calculate total weight (minimum 0.1kg)
      const total_weight = Math.max(
        items.reduce((total, item) => {
          const weight = item.product.weightValue || 0.5;
          const unit = item.product.weightUnit || 'kg';
          let weightInKg = weight;
          if (unit === 'g') weightInKg = weight / 1000;
          return total + (weightInKg * item.quantity);
        }, 0),
        0.1
      );
      
      // Prepare shipment data
      const shipmentData = {
        order_id: `KUNTAL${orderData._id.toString().slice(-8)}`,
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: SHIPROCKET_CONFIG.pickupLocation,
        channel_id: '',
        billing_customer_name: userData.name,
        billing_last_name: '',
        billing_address: addressData.street,
        billing_city: addressData.city,
        billing_pincode: addressData.pincode.toString(),
        billing_state: addressData.state,
        billing_country: 'India',
        billing_email: userData.email,
        billing_phone: userData.phone,
        shipping_is_billing: true,
        shipping_customer_name: userData.name,
        shipping_address: addressData.street,
        shipping_city: addressData.city,
        shipping_pincode: addressData.pincode.toString(),
        shipping_country: 'India',
        shipping_state: addressData.state,
        shipping_email: userData.email,
        shipping_phone: userData.phone,
        order_items: order_items,
        payment_method: 'Prepaid', // Since you're using online payment
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: orderData.amount,
        length: 15,
        breadth: 15,
        height: 15,
        weight: total_weight,
      };
      
      console.log('Sending to Shiprocket:', shipmentData);
      
      // Call Shiprocket API
      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        shipmentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 15000
        }
      );
      
      console.log('Shiprocket response:', response.data);
      
      if (response.data.status_code === 1) {
        return {
          success: true,
          shiprocketOrderId: response.data.order_id,
          shipmentId: response.data.shipment_id,
          awbCode: response.data.awb_code,
          courierName: response.data.courier_name,
          courierCompany: response.data.courier_company_id,
          labelUrl: response.data.label_url,
          manifestUrl: response.data.manifest_url,
          trackingUrl: `https://shiprocket.co/tracking/${response.data.shipment_id}`,
          status: response.data.status
        };
      } else {
        console.error('Shiprocket API error:', response.data);
        throw new Error(response.data.message || 'Failed to create shipment');
      }
      
    } catch (error) {
      console.error('Shiprocket createShipment error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
  
  // Generate shipping label
  static async generateLabel(shipmentId) {
    try {
      const token = await getShiprocketToken();
      
      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/courier/generate/label',
        {
          shipment_id: [shipmentId]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Label generation error:', error);
      throw error;
    }
  }
  
  // Track shipment
  static async trackShipment(awbCode) {
    try {
      const token = await getShiprocketToken();
      
      const response = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Tracking error:', error);
      throw error;
    }
  }
  
  // Check serviceability (before order placement)
  static async checkServiceability(deliveryPincode, weight = 0.5) {
    try {
      const token = await getShiprocketToken();
      
      const response = await axios.get(
        `https://apiv2.shiprocket.in/v1/external/courier/serviceability`,
        {
          params: {
            pickup_postcode: SHIPROCKET_CONFIG.pickupPincode,
            delivery_postcode: deliveryPincode,
            weight: weight,
            cod: 0
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Serviceability check error:', error);
      throw error;
    }
  }
  
  // Cancel shipment
  static async cancelShipment(shipmentId) {
    try {
      const token = await getShiprocketToken();
      
      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/orders/cancel',
        {
          ids: [shipmentId]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Cancel shipment error:', error);
      throw error;
    }
  }
  
  // Generate manifest
  static async generateManifest(shipmentId) {
    try {
      const token = await getShiprocketToken();
      
      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/manifests/generate',
        {
          shipment_id: [shipmentId]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Manifest generation error:', error);
      throw error;
    }
  }
}