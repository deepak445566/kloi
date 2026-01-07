import React, { useEffect, useState, useRef } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
  X, Package, User, MapPin, Calendar, Hash, CheckCircle, Tag, Layers, 
  Download, FileText, Printer, Mail, Truck, PackageCheck, ShieldCheck,
  ClipboardCheck, AlertCircle, RefreshCw, Eye, Send, ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [generatingLabel, setGeneratingLabel] = useState(null);
  const [showShiprocketModal, setShowShiprocketModal] = useState(false);
  const { axios } = useAppContext();
  const invoiceRef = useRef();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // Shiprocket Functions
  const generateShippingLabel = async (orderId) => {
    try {
      setGeneratingLabel(orderId);
      toast.loading('Generating shipping label...');
      
      const { data } = await axios.post(`/api/order/generate-label/${orderId}`);
      toast.dismiss();
      
      if (data.success) {
        toast.success('Shipping label generated successfully!');
        
        // Update the order in state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  awbNumber: data.awbNumber,
                  shippingInfo: {
                    ...order.shippingInfo,
                    shippingStatus: 'AWB Generated'
                  }
                } 
              : order
          )
        );
        
        // Open label URL if available
        if (data.labelUrl) {
          window.open(data.labelUrl, '_blank');
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error generating label:', error);
      toast.error('Failed to generate shipping label');
    } finally {
      setGeneratingLabel(null);
    }
  };

  const trackShipment = async (orderId, awbNumber) => {
    try {
      const { data } = await axios.get(`/api/order/track/${orderId}`);
      if (data.success) {
        setTrackingInfo({
          orderId,
          ...data.tracking
        });
        setShowShiprocketModal(true);
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast.error('Failed to track shipment');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status });
      if (data.success) {
        toast.success('Order status updated');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const sendWhatsApp = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/whatsapp/${orderId}`);
      if (data.success) {
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to generate WhatsApp link');
    }
  };

  const getShippingStatusColor = (status) => {
    switch (status) {
      case 'Created': return 'bg-blue-100 text-blue-800';
      case 'AWB Generated': return 'bg-purple-100 text-purple-800';
      case 'Picked Up': return 'bg-indigo-100 text-indigo-800';
      case 'In Transit': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Placed': return '📦';
      case 'Processing': return '⚙️';
      case 'Shipped': return '🚚';
      case 'Delivered': return '✅';
      case 'Cancelled': return '❌';
      default: return '📋';
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
  };

  // Invoice functions (same as before)
  const generateInvoiceHTML = (order) => {
    if (!order) return '';
    
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const formattedDate = orderDate.toLocaleDateString('en-IN');
    const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    let totalGST = 0;
    let totalAmount = 0;
    
    const itemsWithGST = order.items?.map(item => {
      const product = item.product || {};
      const gstPercentage = product.gstPercentage || 5;
      const unitPrice = product.offerPrice || product.price || 0;
      const quantity = item.quantity || 1;
      const subtotal = unitPrice * quantity;
      const gstAmount = (subtotal * gstPercentage) / 100;
      const itemTotal = subtotal + gstAmount;
      
      totalGST += gstAmount;
      totalAmount += itemTotal;
      
      return {
        ...item,
        gstPercentage,
        unitPrice,
        subtotal,
        gstAmount,
        itemTotal
      };
    }) || [];

    return `
      <div id="invoice-content" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
        <div style="border-bottom: 2px solid #4FBF8B; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="color: #4FBF8B; margin: 0; font-size: 28px; font-weight: bold;">KuntalAgroAgencies</h1>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Farm & Garden Solutions</p>
              <p style="color: #666; margin: 0; font-size: 14px;">+91 8586845185 | Kuntalagrosohna@gmail.com</p>
            </div>
            <div style="text-align: right;">
              <h2 style="color: #333; margin: 0; font-size: 24px;">INVOICE</h2>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Invoice #: ${order._id?.slice(-8) || 'N/A'}</p>
              <p style="color: #666; margin: 0; font-size: 14px;">Date: ${formattedDate}</p>
              <p style="color: #666; margin: 0; font-size: 14px;">Time: ${formattedTime}</p>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #333; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Seller Details</h3>
            <p style="margin: 5px 0; color: #555;"><strong>KuntalAgroAgencies</strong></p>
            <p style="margin: 5px 0; color: #555;">Farm & Garden Products</p>
            <p style="margin: 5px 0; color: #555;">+918586845185 </p>
          </div>
          
          ${order.address ? `
            <div>
              <h3 style="color: #333; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Details</h3>
              <p style="margin: 5px 0; color: #555;"><strong>${order.address.firstname || ''} ${order.address.lastname || ''}</strong></p>
              <p style="margin: 5px 0; color: #555;">${order.address.phone || 'N/A'}</p>
              <p style="margin: 5px 0; color: #555;">${order.address.email || 'N/A'}</p>
              <p style="margin: 5px 0; color: #555;">${order.address.street || ''}, ${order.address.city || ''}</p>
              <p style="margin: 5px 0; color: #555;">${order.address.state || ''} - ${order.address.zipcode || ''}</p>
            </div>
          ` : ''}
        </div>

        ${order.awbNumber ? `
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <h3 style="color: #0369a1; margin-bottom: 10px; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              📦 Shipping Information
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p style="margin: 5px 0; color: #555;"><strong>AWB Number:</strong> ${order.awbNumber}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> ${order.shippingInfo?.shippingStatus || 'Processing'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Courier:</strong> ${order.courierName || 'To be assigned'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Shipment ID:</strong> ${order.shiprocketShipmentId?.slice(-8) || 'N/A'}</p>
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <div>
              <p style="margin: 5px 0; color: #555;"><strong>Transaction ID:</strong> ${order.transactionId || 'N/A'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Payment Status:</strong> <span style="color: ${order.isPaid ? '#10b981' : '#f59e0b'};">${order.isPaid ? 'Paid' : 'Pending'}</span></p>
            </div>
            <div>
              <p style="margin: 5px 0; color: #555;"><strong>Payment Method:</strong> ${order.paymentType || 'Online Payment'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Order Status:</strong> ${order.status || 'Order Placed'}</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #4FBF8B; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">#</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Unit Price</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">GST %</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsWithGST.map((item, index) => {
                const product = item.product || {};
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; border: 1px solid #ddd;">${index + 1}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">
                      <strong>${product.name || 'Product'}</strong>
                      ${product.weightValue ? `<br/><small>${product.weightValue} ${product.weightUnit || ''}</small>` : ''}
                    </td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">₹${item.unitPrice?.toFixed(2) || '0.00'}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.gstPercentage || 5}%</td>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #4FBF8B;">₹${item.itemTotal?.toFixed(2) || '0.00'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Summary</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 8px 0; display: flex; justify-content: space-between;">
                <span>Subtotal:</span>
                <span>₹${(totalAmount - totalGST).toFixed(2)}</span>
              </p>
              <p style="margin: 8px 0; display: flex; justify-content: space-between;">
                <span>Total GST:</span>
                <span>₹${totalGST.toFixed(2)}</span>
              </p>
              <p style="margin: 8px 0; display: flex; justify-content: space-between;">
                <span>Shipping:</span>
                <span style="color: #10b981;">FREE</span>
              </p>
            </div>
            <div>
              <p style="margin: 8px 0; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px;">
                <span>Grand Total:</span>
                <span style="color: #4FBF8B; font-size: 24px;">₹${totalAmount.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>

        <div style="border-top: 2px solid #4FBF8B; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for your business with KuntalAgroAgencies</p>
          <p>For any queries, contact: +91 8586845185</p>
        </div>
      </div>
    `;
  };

  const downloadInvoice = async (order) => {
    try {
      setDownloadingInvoice(order._id);
      
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.innerHTML = generateInvoiceHTML(order);
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(tempDiv);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Invoice_${order._id.slice(-8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order ${order._id?.slice(-8)}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
          }
          body { font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        ${generateInvoiceHTML(order)}
        <div class="no-print" style="text-align: center; margin-top: 20px; padding: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #4FBF8B; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">Print Invoice</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">Close</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
        <div className="md:p-10 p-4 space-y-4">
          <h2 className="text-lg font-medium">Orders List</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
        <div className="md:p-10 p-4 space-y-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
              <p className="text-gray-600 text-sm mt-1">
                {orders.length} orders found • {orders.filter(o => o.shippingInfo?.hasShiprocket).length} with shipping
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Shiprocket Tracking Modal */}
          {showShiprocketModal && trackingInfo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Shipment Tracking</h3>
                      <p className="text-sm text-gray-500">AWB: {trackingInfo.awbNumber || 'Loading...'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowShiprocketModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <div className="p-6">
                  {trackingInfo.tracking_data ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-blue-800">Current Status</p>
                            <p className="text-lg">{trackingInfo.tracking_data.shipment_status || 'Unknown'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Last Updated</p>
                            <p>{trackingInfo.tracking_data.last_event_time || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-800">Tracking History</h4>
                        {trackingInfo.tracking_data.shipment_track_activities?.map((event, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                            <p className="font-medium">{event.activity}</p>
                            <p className="text-sm text-gray-600">{event.location}</p>
                            <p className="text-xs text-gray-500">{event.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <p className="text-gray-700">Tracking information not available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div 
                  key={index} 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white"
                >
                  {/* Order Info */}
                  <div 
                    onClick={() => handleOrderClick(order)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Package className="w-10 h-10 text-green-600" />
                        {order.isPaid && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-800">
                            Order #{order._id?.slice(-8)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getShippingStatusColor(order.shippingInfo?.shippingStatus)}`}>
                            {order.shippingInfo?.shippingStatus || 'Not Initiated'}
                          </span>
                        </div>
                        
                        {order.items && order.items.slice(0, 1).map((item, itemIndex) => (
                          <p key={itemIndex} className="text-sm text-gray-600">
                            {item?.product?.name || 'Product'} x {item?.quantity || 1}
                          </p>
                        ))}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.address?.firstname || 'Customer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Payment */}
                  <div className="flex flex-col items-end md:items-center gap-1">
                    <p className="font-bold text-lg text-gray-800">
                      ₹{order.amount || 0}
                    </p>
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600">
                        {order.transactionId ? 
                          `${order.transactionId.slice(0, 8)}...` : 
                          'No Txn ID'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.isPaid ? "Paid" : "Pending"}
                    </div>
                    
                    {/* Shiprocket Actions */}
                    <div className="flex gap-1">
                      {/* Generate Label Button */}
                      {order.status === "Processing" && !order.awbNumber && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateShippingLabel(order._id);
                          }}
                          disabled={generatingLabel === order._id}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium disabled:opacity-50"
                          title="Generate Shipping Label"
                        >
                          {generatingLabel === order._id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      
                      {/* Track Button */}
                      {order.awbNumber && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            trackShipment(order._id, order.awbNumber);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium"
                          title="Track Shipment"
                        >
                          <Truck className="w-3 h-3" />
                        </button>
                      )}
                      
                      {/* WhatsApp Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sendWhatsApp(order._id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium"
                        title="Send WhatsApp"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                      
                      {/* Invoice Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadInvoice(order);
                        }}
                        disabled={downloadingInvoice === order._id}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-medium disabled:opacity-50"
                        title="Download Invoice"
                      >
                        {downloadingInvoice === order._id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                      </button>
                      
                      {/* View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs font-medium"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" ref={invoiceRef}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                  <p className="text-sm text-gray-500">Order ID: {selectedOrder._id?.slice(-8) || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Shiprocket Actions in Modal */}
                {selectedOrder.status === "Processing" && !selectedOrder.awbNumber && (
                  <button
                    onClick={() => generateShippingLabel(selectedOrder._id)}
                    disabled={generatingLabel === selectedOrder._id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {generatingLabel === selectedOrder._id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4" />
                        Generate Label
                      </>
                    )}
                  </button>
                )}
                
                {selectedOrder.awbNumber && (
                  <button
                    onClick={() => trackShipment(selectedOrder._id, selectedOrder.awbNumber)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Truck className="w-4 h-4" />
                    Track Shipment
                  </button>
                )}
                
                {/* WhatsApp in Modal */}
                <button
                  onClick={() => sendWhatsApp(selectedOrder._id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                  WhatsApp
                </button>
                
                {/* Invoice Actions */}
                <button
                  onClick={() => downloadInvoice(selectedOrder)}
                  disabled={downloadingInvoice === selectedOrder._id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {downloadingInvoice === selectedOrder._id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                
                <button 
                  onClick={closeDetailModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Shipping Information Card */}
              {(selectedOrder.awbNumber || selectedOrder.shippingInfo?.hasShiprocket) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-blue-800">Shipping Information</h3>
                        <div className="flex flex-wrap gap-4 mt-2">
                          {selectedOrder.awbNumber && (
                            <div>
                              <p className="text-sm text-blue-700">AWB Number</p>
                              <p className="font-bold text-blue-900 text-lg">{selectedOrder.awbNumber}</p>
                            </div>
                          )}
                          {selectedOrder.shippingInfo?.shippingStatus && (
                            <div>
                              <p className="text-sm text-blue-700">Shipping Status</p>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getShippingStatusColor(selectedOrder.shippingInfo.shippingStatus)}`}>
                                {selectedOrder.shippingInfo.shippingStatus}
                              </span>
                            </div>
                          )}
                          {selectedOrder.courierName && (
                            <div>
                              <p className="text-sm text-blue-700">Courier</p>
                              <p className="font-medium">{selectedOrder.courierName}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {selectedOrder.awbNumber && (
                        <button
                          onClick={() => window.open(`https://shiprocket.co/tracking/${selectedOrder.awbNumber}`, '_blank')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 rounded-lg text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Tracking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of the modal content (same as before) */}
              <div className="flex flex-wrap items-center justify-between bg-gray-50 p-4 rounded-lg gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusIcon(selectedOrder.status)}</span>
                    <p className={`font-bold ${selectedOrder.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedOrder.isPaid ? "Payment Completed" : "Payment Pending"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-bold text-gray-800">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="font-bold text-xl text-gray-800">{selectedOrder.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-2xl text-gray-800">₹{selectedOrder.amount || 0}</p>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Update Order Status:</label>
                <select
                  value={selectedOrder.status || 'Order Placed'}
                  onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Transaction ID */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Transaction ID</p>
                      <p className="text-lg font-bold text-blue-800 font-mono break-all">
                        {selectedOrder.transactionId || 'Not Available'}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.transactionId && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.transactionId);
                        toast.success('Transaction ID copied to clipboard');
                      }}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items ({selectedOrder.items?.length || 0})
                  </h4>
                </div>
                
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => {
                      const product = item.product || {};
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                              <img 
                                src={product.image?.[0] || assets.default_product} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-800 text-lg">{product.name || 'Unknown Product'}</p>
                                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity || 1}</p>
                                </div>
                                <p className="font-bold text-green-600 text-xl">
                                  ₹{((product.offerPrice || product.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </p>
                              </div>
                              
                              {product.category && (
                                <div className="mt-3 flex items-center gap-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {product.category}
                                  </span>
                                  {product.subCategory && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                      {product.subCategory}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Package className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-yellow-700 font-medium">No items found in this order</p>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              {selectedOrder.address && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-lg">
                        {selectedOrder.address.firstname || ''} {selectedOrder.address.lastname || ''}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-lg">{selectedOrder.address.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{selectedOrder.address.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium capitalize">{selectedOrder.paymentType || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Shipping Address
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-lg mb-2">{selectedOrder.address.street || ''}</p>
                      <div className="text-gray-600 space-y-1">
                        <p>{selectedOrder.address.city || ''}, {selectedOrder.address.state || ''}</p>
                        <p>Pincode: {selectedOrder.address.zipcode || ''}</p>
                        <p>Country: {selectedOrder.address.country || 'India'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Orders;