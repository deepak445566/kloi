import Razorpay from 'razorpay';
import crypto from 'crypto';

// Log environment check
console.log('🔍 Checking Razorpay environment variables...');
console.log('RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

// Use test credentials if not provided (for development only)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxxxx';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'xxxxxxxxxxxxxxxxxxxx';

if (!RAZORPAY_KEY_ID.startsWith('rzp_')) {
  console.warn('⚠️  WARNING: Invalid Razorpay Key ID format');
  console.warn('Please set valid RAZORPAY_KEY_ID in .env file');
  console.warn('Format should be: rzp_test_... or rzp_live_...');
}

console.log('🔑 Using Razorpay Key ID:', RAZORPAY_KEY_ID.substring(0, 15) + '...');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

console.log('✅ Razorpay initialized successfully');

// Generate Razorpay order
export const createRazorpayOrder = async (amount, currency = 'INR') => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert rupees to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    console.log('Creating Razorpay order:', options);

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);
    
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };
  } catch (error) {
    console.error('❌ Razorpay order creation failed:', error);
    throw new Error(`Payment gateway error: ${error.error?.description || error.message}`);
  }
};

// Verify payment signature
export const verifyPayment = (orderId, paymentId, signature) => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === signature;
    
    console.log('🔍 Payment verification:', {
      isValid,
      orderId,
      paymentId
    });
    
    return isValid;
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return false;
  }
};

// Get Razorpay key for frontend
export const getRazorpayKey = () => RAZORPAY_KEY_ID;

export { razorpay };