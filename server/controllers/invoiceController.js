// controllers/invoiceController.js
import Order from '../models/Order.js';
import { jsPDF } from 'jspdf';

export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('address')
      .populate('userId', 'name phone email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Create PDF
    const doc = new jsPDF();
    
    // Add invoice content
    doc.setFontSize(20);
    doc.text('Kuntal Agro Agencies', 20, 20);
    doc.setFontSize(12);
    doc.text('Invoice', 20, 30);
    
    // Add order details
    doc.text(`Order ID: ${order._id}`, 20, 50);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 60);
    doc.text(`Total: ₹${order.amount}`, 20, 70);
    
    // Generate PDF
    const pdfBuffer = doc.output('arraybuffer');
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice_${order._id}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice"
    });
  }
};