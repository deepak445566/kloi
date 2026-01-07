import React, { useEffect, useState, useRef } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { X, Package, User, MapPin, Calendar, Hash, CheckCircle, Tag, Layers, Download, FileText, Printer, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
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

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
  };

  // Function to generate invoice HTML
  const generateInvoiceHTML = (order) => {
    if (!order) return '';
    
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const formattedDate = orderDate.toLocaleDateString('en-IN');
    const formattedTime = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    // Calculate GST breakdown
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
        <!-- Header -->
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

        <!-- Seller & Customer Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #333; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Seller Details</h3>
            <p style="margin: 5px 0; color: #555;"><strong>GreenMantra Store</strong></p>
            <p style="margin: 5px 0; color: #555;">Farm & Garden Products</p>
            <p style="margin: 5px 0; color: #555;">+91  8586845185 </p>
            <p style="margin: 5px 0; color: #555;">GSTIN: 27ABCDE1234F1Z5</p>
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

        <!-- Order Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <div>
              <p style="margin: 5px 0; color: #555;"><strong>Transaction ID:</strong> ${order.transactionId || 'N/A'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Payment Status:</strong> <span style="color: ${order.isPaid ? '#10b981' : '#f59e0b'};">${order.isPaid ? 'Paid' : 'Pending'}</span></p>
            </div>
            <div>
              <p style="margin: 5px 0; color: #555;"><strong>Payment Method:</strong> ${order.paymentType || 'Online Payment'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Delivery:</strong> Standard Shipping</p>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin-bottom: 15px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #4FBF8B; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">#</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Category</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Unit Price</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">GST %</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">GST Amount</th>
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
                    <td style="padding: 12px; border: 1px solid #ddd;">${product.category || 'N/A'}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">₹${item.unitPrice?.toFixed(2) || '0.00'}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.gstPercentage || 5}%</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">₹${item.gstAmount?.toFixed(2) || '0.00'}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #4FBF8B;">₹${item.itemTotal?.toFixed(2) || '0.00'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Summary -->
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
              <p style="margin: 8px 0; display: flex; justify-content: space-between;">
                <span>Amount in Words:</span>
                <span style="font-style: italic;">${numberToWords(totalAmount)} only</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px solid #4FBF8B; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for your business with GreenMantra!</p>
          <p>For any queries, contact: +91 9911577652 | Email: support@greenmantra.com</p>
          <p style="margin-top: 20px; font-size: 10px; color: #999;">
            This is a computer-generated invoice. No signature required.
          </p>
        </div>
      </div>
    `;
  };

  // Function to convert number to words
  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convert = (n) => {
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
      if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      return '';
    };
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paise';
    }
    
    return result;
  };

  // Function to download invoice as PDF
  const downloadInvoice = async (order) => {
    try {
      setDownloadingInvoice(order._id);
      
      // Create temporary div for invoice
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.innerHTML = generateInvoiceHTML(order);
      document.body.appendChild(tempDiv);
      
      // Use html2canvas to capture the invoice
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
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
      
      // Save PDF
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

  // Function to print invoice
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

  // Function to get color based on category
  const getCategoryColor = (category) => {
    const colorMap = {
      "Crop": "bg-green-50 text-green-800 border-green-200",
      "Fertilizer": "bg-blue-50 text-blue-800 border-blue-200",
      "Pesticide": "bg-red-50 text-red-800 border-red-200",
      "Household Items": "bg-purple-50 text-purple-800 border-purple-200",
      "Sprayers": "bg-amber-50 text-amber-800 border-amber-200",
      "Sprayers Parts": "bg-cyan-50 text-cyan-800 border-cyan-200",
      "Terrace Gardening": "bg-emerald-50 text-emerald-800 border-emerald-200",
      "Household Insecticides": "bg-orange-50 text-orange-800 border-orange-200",
      "Farm Machinery": "bg-gray-100 text-gray-800 border-gray-300",
      "Plantation": "bg-lime-50 text-lime-800 border-lime-200"
    };
    
    return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Function to get subcategory color
  const getSubCategoryColor = (category, subCategory) => {
    if (category === "Fertilizer") {
      if (subCategory === "Organic") return "bg-green-100 text-green-900 border-green-300";
      if (subCategory === "Non-organic") return "bg-yellow-100 text-yellow-900 border-yellow-300";
    }
    
    if (category === "Crop") {
      if (subCategory === "Field Crop") return "bg-teal-100 text-teal-900 border-teal-300";
      if (subCategory === "Vegetable Crop") return "bg-emerald-100 text-emerald-900 border-emerald-300";
    }
    
    if (category === "Pesticide") {
      if (subCategory === "Herbicides") return "bg-red-100 text-red-900 border-red-300";
      if (subCategory === "Insecticides") return "bg-orange-100 text-orange-900 border-orange-300";
      if (subCategory === "Fungicides") return "bg-purple-100 text-purple-900 border-purple-300";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Function to get emoji for subcategory
  const getSubCategoryEmoji = (category, subCategory) => {
    if (category === "Fertilizer") {
      if (subCategory === "Organic") return "🌱";
      if (subCategory === "Non-organic") return "⚗️";
    }
    
    if (category === "Crop") {
      if (subCategory === "Field Crop") return "🌾";
      if (subCategory === "Vegetable Crop") return "🥦";
    }
    
    if (category === "Pesticide") {
      if (subCategory === "Herbicides") return "🚫";
      if (subCategory === "Insecticides") return "🐛";
      if (subCategory === "Fungicides") return "🍄";
    }
    
    return "";
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Orders List</h2>
              <p className="text-gray-600 text-sm mt-1">
                {orders.length} orders found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
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
                        {order.items && order.items.slice(0, 2).map((item, itemIndex) => {
                          const hasSubcategory = ["Crop", "Fertilizer", "Pesticide"].includes(item?.product?.category);
                          
                          return (
                            <div key={itemIndex} className="flex flex-col gap-1">
                              <p className="font-medium text-gray-800 text-sm">
                                {item?.product?.name || 'Unknown Product'} 
                                <span className={`text-green-600 ml-2 ${(!item?.quantity || item.quantity < 2) && "hidden"}`}>
                                  x {item?.quantity || 0}
                                </span>
                              </p>
                              
                              {/* Category and Subcategory Badges */}
                              {item?.product?.category && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(item.product.category)}`}>
                                    <Tag className="inline w-3 h-3 mr-1" />
                                    {item.product.category}
                                  </span>
                                  
                                  {hasSubcategory && item?.product?.subCategory && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSubCategoryColor(item.product.category, item.product.subCategory)}`}>
                                      <Layers className="inline w-3 h-3 mr-1" />
                                      {getSubCategoryEmoji(item.product.category, item.product.subCategory)} {item.product.subCategory}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {order.items && order.items.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 md:text-center">
                    {order.address ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-xs">{order.address.firstname || ''} {order.address.lastname || ''}</span>
                      </div>
                    ) : (
                      <p className='text-red-500 text-xs'>No address</p>
                    )}
                  </div>

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

                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.isPaid ? "Paid" : "Pending"}
                    </div>
                    
                    {/* Invoice Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadInvoice(order);
                      }}
                      disabled={downloadingInvoice === order._id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {downloadingInvoice === order._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Invoice
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderClick(order);
                      }}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      View
                    </button>
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
                {/* Invoice Actions */}
                <button
                  onClick={() => downloadInvoice(selectedOrder)}
                  disabled={downloadingInvoice === selectedOrder._id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {downloadingInvoice === selectedOrder._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
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
              {/* Invoice Header for Print */}
              <div className="hidden print:block">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-green-600">GreenMantra</h1>
                  <p className="text-gray-600">Farm & Garden Solutions</p>
                  <p className="text-gray-500 text-sm">Invoice #{selectedOrder._id?.slice(-8)}</p>
                </div>
              </div>

              {/* Order Status */}
              <div className="flex flex-wrap items-center justify-between bg-gray-50 p-4 rounded-lg gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <p className={`font-bold ${selectedOrder.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedOrder.isPaid ? "Payment Completed" : "Payment Pending"}
                  </p>
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

              {/* Transaction ID Section */}
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

              {/* Order Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="text-sm text-gray-500">
                    GST included in prices
                  </div>
                </div>
                
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => {
                      const hasSubcategory = ["Crop", "Fertilizer", "Pesticide"].includes(item?.product?.category);
                      const gstPercentage = item?.product?.gstPercentage || 5;
                      const unitPrice = item?.product?.offerPrice || item?.product?.price || 0;
                      const quantity = item?.quantity || 1;
                      const subtotal = unitPrice * quantity;
                      const gstAmount = (subtotal * gstPercentage) / 100;
                      const itemTotal = subtotal + gstAmount;
                      
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                  <img 
                                    src={item?.product?.image?.[0] || assets.default_product} 
                                    alt={item?.product?.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-2 flex-1">
                                  <div>
                                    <p className="font-bold text-gray-800 text-lg">{item?.product?.name || 'Unknown Product'}</p>
                                    <p className="text-sm text-gray-500">
                                      Product ID: {item?.product?._id?.slice(-8) || 'N/A'}
                                    </p>
                                  </div>
                                  
                                  {/* Category and Subcategory Badges */}
                                  {item?.product?.category && (
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-gray-500" />
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.product.category)}`}>
                                          {item.product.category}
                                        </span>
                                      </div>
                                      
                                      {hasSubcategory && item?.product?.subCategory && (
                                        <div className="flex items-center gap-1">
                                          <Layers className="w-3 h-3 text-gray-500" />
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSubCategoryColor(item.product.category, item.product.subCategory)}`}>
                                            {getSubCategoryEmoji(item.product.category, item.product.subCategory)} {item.product.subCategory}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Weight/Size Info */}
                                  {item?.product?.weightValue && (
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Weight: </span>
                                      {item.product.weightValue} {item.product.weightUnit}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right space-y-2 min-w-[120px]">
                                <div>
                                  <p className="text-sm text-gray-500">Unit Price</p>
                                  <p className="font-bold text-gray-800">₹{unitPrice.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Quantity</p>
                                  <p className="font-bold text-gray-800">{quantity}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">GST ({gstPercentage}%)</p>
                                  <p className="font-bold text-gray-800">₹{gstAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Item Total</p>
                                  <p className="font-bold text-green-600 text-xl">₹{itemTotal.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Details Summary */}
                          <div className="bg-gray-100 px-4 py-3 border-t border-gray-200">
                            <div className="flex flex-wrap items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                {item?.product?.category && (
                                  <span className="text-gray-600">
                                    Category: <span className="font-medium">{item.product.category}</span>
                                  </span>
                                )}
                                {item?.product?.subCategory && (
                                  <span className="text-gray-600">
                                    Subcategory: <span className="font-medium">{item.product.subCategory}</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-600">
                                Item Total (incl. GST): <span className="font-bold text-green-700">₹{itemTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Order Summary with GST Breakdown */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h5 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h5>
                      <div className="space-y-3">
                        {/* Calculate totals */}
                        {(() => {
                          let subtotal = 0;
                          let totalGST = 0;
                          let gstBreakdown = {};
                          
                          selectedOrder.items?.forEach(item => {
                            const gstPercentage = item?.product?.gstPercentage || 5;
                            const unitPrice = item?.product?.offerPrice || item?.product?.price || 0;
                            const quantity = item?.quantity || 1;
                            const itemSubtotal = unitPrice * quantity;
                            const gstAmount = (itemSubtotal * gstPercentage) / 100;
                            
                            subtotal += itemSubtotal;
                            totalGST += gstAmount;
                            
                            if (!gstBreakdown[gstPercentage]) {
                              gstBreakdown[gstPercentage] = 0;
                            }
                            gstBreakdown[gstPercentage] += gstAmount;
                          });
                          
                          const grandTotal = subtotal + totalGST;
                          
                          return (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Subtotal ({selectedOrder.items?.length || 0} items)</span>
                                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                              </div>
                              
                              {/* GST Breakdown */}
                              <div className="pl-4 border-l-2 border-gray-300">
                                <p className="text-sm font-medium text-gray-600 mb-2">GST Breakdown:</p>
                                {Object.entries(gstBreakdown).map(([percentage, amount]) => (
                                  <div key={percentage} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{percentage}% GST</span>
                                    <span>₹{amount.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                                <span className="text-gray-600">Total GST</span>
                                <span className="font-bold">₹{totalGST.toFixed(2)}</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Shipping Fee</span>
                                <span className="font-bold text-green-600">FREE</span>
                              </div>
                              
                              <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                                <span className="text-xl font-bold text-gray-800">Grand Total</span>
                                <span className="text-2xl font-bold text-green-600">
                                  ₹{grandTotal.toFixed(2)}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
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

export default Order;