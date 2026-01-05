// utils/whatsappUtils.js
export const generateOrderWhatsAppMessage = (orderData) => {
  const {
    orderId,
    customerName,
    customerPhone,
    totalAmount,
    paymentType,
    transactionId,
    address,
    items
  } = orderData;

  // Create formatted message in Hindi/English
  const message = `🛒 *NEW ORDER RECEIVED!* 🛒

📋 *ORDER DETAILS:*
• Order ID: ${orderId}
• Customer: ${customerName}
• Customer Phone: ${customerPhone}
• Total Amount: ₹${totalAmount}
• Payment: ${paymentType}
• Transaction ID: ${transactionId}
• Order Time: ${new Date().toLocaleString('en-IN', { 
  timeZone: 'Asia/Kolkata',
  dateStyle: 'full',
  timeStyle: 'medium'
})}

📍 *DELIVERY ADDRESS:*
${address}

🛍️ *ORDER ITEMS:*
${items.map((item, index) => 
  `${index + 1}. ${item.name} x ${item.quantity} = ₹${item.price}`
).join('\n')}

📦 *TOTAL ITEMS:* ${items.length}
💰 *GRAND TOTAL:* ₹${totalAmount}

_This is an automated order notification. Please process the order._`;

  return message;
};

export const getWhatsAppURL = (message, phoneNumber = "919911577652") => {
  // Remove + from phone number if present
  const cleanPhone = phoneNumber.replace('+', '');
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Return WhatsApp API URL
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
};

// For direct WhatsApp Web opening
export const openWhatsAppWeb = (message, phoneNumber = "919911577652") => {
  const cleanPhone = phoneNumber.replace('+', '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// For mobile devices
export const openWhatsAppMobile = (message, phoneNumber = "919911577652") => {
  const cleanPhone = phoneNumber.replace('+', '');
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Check if device is mobile
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Main function to send order notification
export const sendOrderNotification = async (orderData) => {
  try {
    // Generate message
    const message = generateOrderWhatsAppMessage(orderData);
    
    // Get WhatsApp URL
    const whatsappUrl = getWhatsAppURL(message);
    
    // Also log to console for debugging
    console.log('WhatsApp Notification:', {
      orderId: orderData.orderId,
      message: message,
      url: whatsappUrl
    });
    
    // Return URL for frontend to open
    return {
      success: true,
      whatsappUrl: whatsappUrl,
      message: 'WhatsApp notification generated successfully'
    };
  } catch (error) {
    console.error('Error generating WhatsApp notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};