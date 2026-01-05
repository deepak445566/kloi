import Razorpay from 'razorpay';

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are missing in environment variables');
}

// Create Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Test connection
export const testRazorpayConnection = async () => {
  try {
    await razorpayInstance.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: 'test_receipt'
    });
    console.log('✅ Razorpay connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Razorpay connection test failed:', error.message);
    return false;
  }
};

export default razorpayInstance;