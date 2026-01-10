import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Check if environment variables are loaded
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  Razorpay environment variables missing!');
  console.warn('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
  
  // Use test credentials for development (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  Using test mode - no real payments will work');
    // Create a mock Razorpay instance for development
    module.exports = {
      razorpay: {
        orders: {
          create: async (options) => {
            console.log('Mock Razorpay Order Creation:', options);
            return {
              id: 'order_mock_' + Date.now(),
              entity: 'order',
              amount: options.amount,
              currency: options.currency,
              receipt: options.receipt,
              status: 'created',
              attempts: 0,
              created_at: Date.now()
            };
          }
        }
      },
      createRazorpayOrder: async (amount, currency = 'INR') => {
        return {
          id: 'order_mock_' + Date.now(),
          amount: Math.round(amount * 100),
          currency,
          receipt: `receipt_${Date.now()}`,
          status: 'created'
        };
      },
      verifyPayment: () => true // Always return true in dev mode
    };
    return;
  } else {
    throw new Error('Razorpay credentials are required in production');
  }
}

// Initialize Razorpay with proper validation
let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
  throw error;
}

// Generate order in Razorpay
export const createRazorpayOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay not initialized');
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    console.log('Creating Razorpay order with options:', {
      ...options,
      key_id: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...' // Log partial key for security
    });

    const order = await razorpayInstance.orders.create(options);
    console.log('Razorpay order created:', order.id);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

// Verify payment signature
export const verifyPayment = (orderId, paymentId, signature) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.warn('No Razorpay key secret found, skipping verification');
      return true; // Return true in development
    }

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === signature;
    console.log('Payment verification:', {
      isValid,
      orderId,
      paymentId,
      signatureLength: signature?.length
    });
    
    return isValid;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

// Get Razorpay instance
export const razorpay = razorpayInstance;

// Test function to check Razorpay connection
export const testRazorpayConnection = async () => {
  try {
    const testOrder = await createRazorpayOrder(100, 'INR', 'test_connection');
    return {
      success: true,
      message: 'Razorpay connected successfully',
      orderId: testOrder.id
    };
  } catch (error) {
    return {
      success: false,
      message: `Razorpay connection failed: ${error.message}`
    };
  }
};