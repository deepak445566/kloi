// services/delhivery.service.js
import axios from 'axios';

class DelhiveryService {
  constructor() {
    this.apiKey = process.env.DELHIVERY_API_KEY;
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://track.delhivery.com/api/cmu/create.json'
      : 'https://staging-express.delhivery.com/api/cmu/create.json';
    
    this.headers = {
      'Authorization': `Token ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  sanitizeString(str) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/[&#%;\\]/g, '');
  }

  formatPhone(phone) {
    if (!phone) return '';
    if (Array.isArray(phone)) {
      return phone.map(p => this.sanitizeString(String(p)));
    }
    return [this.sanitizeString(String(phone))];
  }

  /**
   * Prepare shipment payload from order data
   */
  prepareShipmentPayload(order, user, address, products) {
    // Calculate total weight and prepare product description
    let totalWeight = 0;
    const productNames = [];
    const hsnCodes = [];
    
    for (const item of order.items) {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (product) {
        productNames.push(`${product.name} x${item.quantity}`);
        
        // Add weight (assuming 500g per product if not specified)
        const itemWeight = product.weight || 500;
        totalWeight += itemWeight * item.quantity;
        
        // Add HSN code
        if (product.hsnCode && !hsnCodes.includes(product.hsnCode)) {
          hsnCodes.push(product.hsnCode);
        }
      }
    }

    // Determine payment mode
    let paymentMode = 'Prepaid';
    if (order.paymentType === 'COD') {
      paymentMode = 'COD';
    } else if (order.paymentType === 'Pickup') {
      paymentMode = 'Pickup';
    } else if (order.paymentType === 'REPL') {
      paymentMode = 'REPL';
    }

    const payload = {
      shipments: [{
        name: this.sanitizeString(user.name || `${address.firstName} ${address.lastName}`),
        order: order._id.toString(),
        phone: this.formatPhone(user.phone || address.phone),
        add: this.sanitizeString(`${address.street}, ${address.landmark || ''}, ${address.city}`),
        pin: address.pincode.toString(),
        city: this.sanitizeString(address.city),
        state: this.sanitizeString(address.state),
        country: 'India',
        payment_mode: paymentMode,
        total_amount: order.amount.toString(),
        cod_amount: paymentMode === 'COD' ? order.amount.toString() : '0',
        weight: totalWeight.toString(),
        products_desc: this.sanitizeString(productNames.join(', ')),
        hsn_code: hsnCodes.join(',') || '',
        shipping_mode: order.shippingMode || 'Surface',
        address_type: 'home', // or 'office' based on address type
        // Additional optional fields
        seller_name: 'Your Store Name', // Replace with your store name
        seller_inv: order._id.toString(),
        quantity: order.items.length.toString(),
        waybill: order.waybill || '', // If you have prefetched waybill
        shipment_width: order.dimensions?.width?.toString() || '10',
        shipment_height: order.dimensions?.height?.toString() || '10',
        shipment_length: order.dimensions?.length?.toString() || '10',
        fragile_shipment: false,
        dangerous_good: false,
        plastic_packaging: false
      }],
      pickup_location: {
        name: this.sanitizeString(order.pickupLocation || 'Your_Warehouse_Name')
      }
    };

    return payload;
  }

  /**
   * Create shipment on Delhivery
   */
  async createShipment(orderData) {
    try {
      const encodedPayload = `format=json&data=${encodeURIComponent(JSON.stringify(orderData))}`;
      
      console.log('Sending to Delhivery:', {
        url: this.baseUrl,
        payload: orderData
      });

      const response = await axios.post(this.baseUrl, encodedPayload, {
        headers: this.headers,
        timeout: 10000 // 10 second timeout
      });

      console.log('Delhivery Response:', response.data);

      return {
        success: true,
        data: response.data,
        manifest: response.data?.package_manifest || response.data
      };
    } catch (error) {
      console.error('Delhivery API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status,
        isNetworkError: !error.response
      };
    }
  }

  /**
   * Generate tracking URL
   */
  generateTrackingUrl(waybill) {
    return `https://www.delhivery.com/track/${waybill}`;
  }
}

export default new DelhiveryService();