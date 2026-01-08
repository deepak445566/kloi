import React, { useEffect, useState, useRef } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
  X, Package, User, MapPin, Calendar, Hash, CheckCircle, Tag, Layers, 
  Download, FileText, Printer, Mail, Truck, Package2, Box, Copy, 
  ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Eye, MoreVertical, ShipIcon, Filter,
  Search, Loader2, MailIcon, Phone, MapPinIcon, CreditCard,
  ArrowRight, TruckIcon, AlertTriangle, CheckSquare, Archive
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [creatingShipment, setCreatingShipment] = useState(null);
  const [shipmentStatus, setShipmentStatus] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [bulkActions, setBulkActions] = useState([]);
  const { axios } = useAppContext();
  const invoiceRef = useRef();

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        const ordersWithShipment = data.orders.map(order => ({
          ...order,
          hasShipment: order.waybill || order.shipmentId,
          shipmentStatus: order.delhiveryStatus || 'pending',
          selected: false
        }));
        setOrders(ordersWithShipment || []);
        
        const statusMap = {};
        ordersWithShipment.forEach(order => {
          if (order.waybill) {
            statusMap[order._id] = {
              waybill: order.waybill,
              trackingUrl: order.trackingUrl || `https://www.delhivery.com/track/${order.waybill}`,
              status: order.delhiveryStatus || 'pending',
              lastChecked: new Date()
            };
          }
        });
        setShipmentStatus(statusMap);
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

  // Create Delhivery shipment
  const createDelhiveryShipment = async (orderId, orderData = null) => {
    try {
      setCreatingShipment(orderId);
      
      const { data } = await axios.post(`/api/order/${orderId}/create-shipment`);
      
      if (data.success) {
        toast.success('Shipment created successfully!');
        
        // Update shipment status
        setShipmentStatus(prev => ({
          ...prev,
          [orderId]: {
            waybill: data.shipment?.waybill,
            trackingUrl: data.shipment?.trackingUrl,
            status: data.shipment?.status || 'manifested',
            lastChecked: new Date()
          }
        }));
        
        // Update orders list
        setOrders(prev => prev.map(order => 
          order._id === orderId ? {
            ...order,
            waybill: data.shipment?.waybill,
            trackingUrl: data.shipment?.trackingUrl,
            delhiveryStatus: data.shipment?.status || 'manifested',
            hasShipment: true,
            status: orderData?.status || 'Shipped'
          } : order
        ));
        
        // Update selected order if open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            waybill: data.shipment?.waybill,
            trackingUrl: data.shipment?.trackingUrl,
            delhiveryStatus: data.shipment?.status || 'manifested',
            status: 'Shipped'
          }));
        }
        
      } else {
        toast.error(data.message || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('Create shipment error:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setCreatingShipment(null);
    }
  };

  // Create bulk shipments
  const createBulkShipments = async () => {
    const selectedOrders = orders.filter(order => order.selected && !order.hasShipment);
    if (selectedOrders.length === 0) {
      toast.error('No orders selected for shipment');
      return;
    }

    try {
      setCreatingShipment('bulk');
      let successCount = 0;
      
      for (const order of selectedOrders) {
        try {
          const { data } = await axios.post(`/api/order/${order._id}/create-shipment`);
          if (data.success) {
            successCount++;
            
            // Update order in state
            setOrders(prev => prev.map(o => 
              o._id === order._id ? {
                ...o,
                waybill: data.shipment?.waybill,
                trackingUrl: data.shipment?.trackingUrl,
                delhiveryStatus: data.shipment?.status || 'manifested',
                hasShipment: true,
                selected: false,
                status: 'Shipped'
              } : o
            ));
          }
        } catch (err) {
          console.error(`Failed to create shipment for order ${order._id}:`, err);
        }
      }
      
      toast.success(`Created shipments for ${successCount}/${selectedOrders.length} orders`);
      setBulkActions([]);
    } catch (error) {
      toast.error('Failed to create bulk shipments');
    } finally {
      setCreatingShipment(null);
    }
  };

  // Track shipment
  const trackShipment = async (orderId, waybill) => {
    try {
      setTrackingOrderId(orderId);
      const { data } = await axios.get(`/api/shipment/track/${waybill}`);
      
      if (data.success) {
        setTrackingData(data);
        setShipmentStatus(prev => ({
          ...prev,
          [orderId]: {
            ...prev[orderId],
            status: data.status || prev[orderId].status,
            lastChecked: new Date()
          }
        }));
        
        // Update order status if delivered
        if (data.status === 'delivered') {
          updateOrderStatus(orderId, 'Delivered');
        }
      }
    } catch (error) {
      console.error('Track shipment error:', error);
      toast.error('Failed to fetch tracking details');
    } finally {
      setTrackingOrderId(null);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/api/order/${orderId}/status`, { status });
      if (data.success) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status }));
        }
        
        toast.success(`Order status updated to ${status}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  // Generate tracking URL
  const generateTrackingUrl = (waybill) => {
    return `https://www.delhivery.com/track/${waybill}`;
  };

  // Handle order click
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Toggle order selection for bulk actions
  const toggleOrderSelection = (orderId) => {
    setOrders(prev => prev.map(order => 
      order._id === orderId ? { ...order, selected: !order.selected } : order
    ));
  };

  // Select all orders
  const selectAllOrders = () => {
    const allSelected = orders.every(order => order.selected);
    setOrders(prev => prev.map(order => ({ ...order, selected: !allSelected })));
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Shipment status colors
  const getShipmentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'manifested': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Shipment status text
  const getShipmentStatusText = (status) => {
    const map = {
      'pending': 'Pending',
      'manifested': 'Manifested',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'rto': 'Returned to Origin'
    };
    return map[status] || status;
  };

  // Payment status badge
  const getPaymentStatusBadge = (isPaid, paymentType) => {
    if (isPaid) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="inline w-3 h-3 mr-1" />
          Paid ({paymentType})
        </span>
      );
    } else if (paymentType === 'COD') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          <CreditCard className="inline w-3 h-3 mr-1" />
          COD (Pending)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="inline w-3 h-3 mr-1" />
          Payment Pending
        </span>
      );
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !order.hasShipment;
    if (filter === 'shipped') return order.status === 'Shipped' || order.delhiveryStatus === 'manifested';
    if (filter === 'delivered') return order.status === 'Delivered';
    if (filter === 'cod') return order.paymentType === 'COD';
    return true;
  }).filter(order => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(term) ||
      order.transactionId?.toLowerCase().includes(term) ||
      order.address?.firstname?.toLowerCase().includes(term) ||
      order.address?.lastname?.toLowerCase().includes(term) ||
      order.address?.phone?.includes(searchTerm) ||
      order.waybill?.includes(searchTerm)
    );
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => !o.hasShipment).length,
    shipped: orders.filter(o => o.delhiveryStatus === 'manifested' || o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cod: orders.filter(o => o.paymentType === 'COD').length,
    revenue: orders.reduce((sum, order) => sum + (order.amount || 0), 0)
  };

  // Generate invoice HTML (simplified version)
  const generateInvoiceHTML = (order) => {
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const formattedDate = orderDate.toLocaleDateString('en-IN');
    
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #4FBF8B; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #4FBF8B; margin: 0;">Invoice</h1>
          <p>Order ID: ${order._id?.slice(-8)} | Date: ${formattedDate}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3>Customer Details</h3>
          <p>${order.address?.firstname} ${order.address?.lastname}</p>
          <p>${order.address?.phone}</p>
          <p>${order.address?.street}, ${order.address?.city}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; border: 1px solid #ddd;">Item</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Price</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.product?.name || 'Product'}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity || 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹${item.product?.price || 0}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹${(item.quantity || 1) * (item.product?.price || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: right; font-size: 18px; font-weight: bold;">
          Total: ₹${order.amount || 0}
        </div>
      </div>
    `;
  };

  // Download invoice
  const downloadInvoice = async (order) => {
    try {
      setDownloadingInvoice(order._id);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateInvoiceHTML(order);
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, { scale: 2 });
      document.body.removeChild(tempDiv);
      
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${order._id.slice(-8)}.pdf`);
      
      toast.success('Invoice downloaded!');
    } catch (error) {
      console.error('Invoice error:', error);
      toast.error('Failed to generate invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Print invoice
  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Invoice ${order._id?.slice(-8)}</title></head>
        <body>${generateInvoiceHTML(order)}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
        <div className="md:p-10 p-4 space-y-6">
          {/* Header with Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
              <p className="text-gray-600 text-sm mt-1">
                {stats.total} orders • ₹{stats.revenue.toLocaleString()} total revenue
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
              {bulkActions.length > 0 && (
                <button
                  onClick={createBulkShipments}
                  disabled={creatingShipment === 'bulk'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {creatingShipment === 'bulk' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  Create {bulkActions.length} Shipments
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Pending Shipment</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Shipped</p>
              <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">COD Orders</p>
              <p className="text-2xl font-bold text-purple-600">{stats.cod}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, customers, waybills..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Pending Shipment
                </button>
                <button
                  onClick={() => setFilter('shipped')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'shipped' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Shipped
                </button>
                <button
                  onClick={() => setFilter('delivered')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Delivered
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {orders.some(order => order.selected) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">
                    {orders.filter(o => o.selected).length} orders selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrders(prev => prev.map(o => ({ ...o, selected: false })))}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button
                    onClick={createBulkShipments}
                    disabled={creatingShipment === 'bulk'}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {creatingShipment === 'bulk' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    Create Shipments
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try different search terms' : 'New orders will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && orders.every(order => order.selected)}
                    onChange={selectAllOrders}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-3 text-sm font-medium text-gray-700">Order Details</div>
                <div className="col-span-2 text-sm font-medium text-gray-700">Customer</div>
                <div className="col-span-2 text-sm font-medium text-gray-700">Amount & Payment</div>
                <div className="col-span-2 text-sm font-medium text-gray-700">Shipment</div>
                <div className="col-span-2 text-sm font-medium text-gray-700">Actions</div>
              </div>

              {/* Orders */}
              {filteredOrders.map((order) => (
                <div 
                  key={order._id} 
                  className={`flex flex-col md:grid md:grid-cols-12 gap-4 p-4 rounded-lg border ${order.selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-green-300'} hover:shadow-md transition-all duration-200 bg-white`}
                >
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-start">
                    <input
                      type="checkbox"
                      checked={order.selected || false}
                      onChange={() => toggleOrderSelection(order._id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1"
                    />
                  </div>

                  {/* Order Details */}
                  <div className="col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Package className="w-10 h-10 text-green-600" />
                        {order.isPaid && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {order.items?.length || 0} items
                        </p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="col-span-2">
                    {order.address ? (
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {order.address.firstname} {order.address.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{order.address.phone}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {order.address.city}, {order.address.state}
                        </p>
                      </div>
                    ) : (
                      <p className="text-red-500 text-sm">No address</p>
                    )}
                  </div>

                  {/* Amount & Payment */}
                  <div className="col-span-2">
                    <p className="font-bold text-xl text-gray-800">
                      ₹{order.amount || 0}
                    </p>
                    <div className="mt-2">
                      {getPaymentStatusBadge(order.isPaid, order.paymentType)}
                    </div>
                    {order.transactionId && (
                      <p className="text-xs text-blue-600 mt-1 truncate" title={order.transactionId}>
                        <Hash className="inline w-3 h-3 mr-1" />
                        {order.transactionId.slice(0, 12)}...
                      </p>
                    )}
                  </div>

                  {/* Shipment Info */}
                  <div className="col-span-2">
                    {order.hasShipment ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getShipmentStatusColor(order.delhiveryStatus || 'pending')}`}>
                            {getShipmentStatusText(order.delhiveryStatus || 'pending')}
                          </span>
                          {order.delhiveryStatus === 'delivered' && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 font-mono" title={order.waybill}>
                          {order.waybill?.slice(0, 8)}...
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Track
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          No Shipment
                        </span>
                        <button
                          onClick={() => createDelhiveryShipment(order._id, order)}
                          disabled={creatingShipment === order._id}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {creatingShipment === order._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Truck className="w-3 h-3" />
                          )}
                          Create Shipment
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-2">
                    <button
                      onClick={() => downloadInvoice(order)}
                      disabled={downloadingInvoice === order._id}
                      className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Download Invoice"
                    >
                      {downloadingInvoice === order._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    
                    {order.waybill && (
                      <button
                        onClick={() => copyToClipboard(order.waybill, 'Waybill copied!')}
                        className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy Waybill"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleOrderClick(order)}
                      className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleExpandOrder(order._id)}
                      className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors md:hidden"
                    >
                      {expandedOrder === order._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Mobile Expanded View */}
                  {expandedOrder === order._id && (
                    <div className="col-span-12 md:hidden mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium">
                            {order.address?.firstname} {order.address?.lastname}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{order.address?.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment</p>
                          <div className="mt-1">
                            {getPaymentStatusBadge(order.isPaid, order.paymentType)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Shipment</p>
                          {order.hasShipment ? (
                            <div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getShipmentStatusColor(order.delhiveryStatus)}`}>
                                {getShipmentStatusText(order.delhiveryStatus)}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => createDelhiveryShipment(order._id)}
                              disabled={creatingShipment === order._id}
                              className="mt-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                              {creatingShipment === order._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Truck className="w-3 h-3" />
                              )}
                              Create Shipment
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {Math.min(filteredOrders.length, 10)} of {filteredOrders.length} orders
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Package className="w-10 h-10 text-green-600" />
                  {selectedOrder.isPaid && (
                    <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                  <p className="text-sm text-gray-500">Order ID: {selectedOrder._id?.slice(-8)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Action Buttons */}
                {!selectedOrder.hasShipment ? (
                  <button
                    onClick={() => createDelhiveryShipment(selectedOrder._id, selectedOrder)}
                    disabled={creatingShipment === selectedOrder._id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {creatingShipment === selectedOrder._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    Create Shipment
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedOrder.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track on Delhivery
                    </a>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.waybill, 'Waybill copied!')}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Waybill
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => downloadInvoice(selectedOrder)}
                  disabled={downloadingInvoice === selectedOrder._id}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {downloadingInvoice === selectedOrder._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Invoice
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
              {/* Status Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Order Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'Processing')}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        Process
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'Shipped')}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                      >
                        Ship
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'Delivered')}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        Deliver
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Payment</p>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedOrder.isPaid, selectedOrder.paymentType)}
                  </div>
                  {selectedOrder.transactionId && (
                    <p className="text-xs text-gray-600 mt-2 truncate" title={selectedOrder.transactionId}>
                      Txn: {selectedOrder.transactionId}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Shipment Status</p>
                  {selectedOrder.hasShipment ? (
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getShipmentStatusColor(selectedOrder.delhiveryStatus)}`}>
                        {getShipmentStatusText(selectedOrder.delhiveryStatus)}
                      </span>
                      <p className="text-xs text-gray-600 mt-1 font-mono">
                        Waybill: {selectedOrder.waybill}
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm mt-1">Not Shipped</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Date & Amount</p>
                  <p className="font-bold text-gray-800 mt-1">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    ₹{selectedOrder.amount || 0}
                  </p>
                </div>
              </div>

              {/* Customer Information */}
              {selectedOrder.address && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer Information
                    </h4>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            {selectedOrder.address.firstname} {selectedOrder.address.lastname}
                          </p>
                          <p className="text-gray-500">{selectedOrder.address.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{selectedOrder.address.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="w-4 h-4 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium">{selectedOrder.address.street}</p>
                            <p className="text-gray-500">
                              {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.zipcode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Order Notes</h5>
                      <textarea
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Add notes about this order..."
                        defaultValue=""
                      />
                      <div className="flex justify-end mt-3">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items ({selectedOrder.items?.length || 0})
                  </h4>
                </div>
                
                <div className="p-6">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={item.product?.image?.[0] || assets.default_product} 
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{item.product?.name}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Category: {item.product?.category} • Qty: {item.quantity}
                              </p>
                              {item.product?.weightValue && (
                                <p className="text-sm text-gray-500">
                                  Weight: {item.product.weightValue} {item.product.weightUnit}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                  Price: ₹{item.product?.price || 0}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  Total: ₹{(item.product?.price || 0) * (item.quantity || 1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">
                              ₹{(item.product?.price || 0) * (item.quantity || 1)}
                            </p>
                            <p className="text-sm text-gray-500">Item Total</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Order Summary */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-bold text-gray-800">Order Summary</h5>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{selectedOrder.amount || 0}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({selectedOrder.items?.length} items)</span>
                            <span>₹{selectedOrder.amount || 0}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className="text-green-600">FREE</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Tax</span>
                            <span>₹0.00</span>
                          </div>
                          <div className="h-px bg-gray-300 my-2"></div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Grand Total</span>
                            <span>₹{selectedOrder.amount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No items in this order</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipment Tracking Section */}
              {selectedOrder.hasShipment && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <TruckIcon className="w-5 h-5" />
                      Shipment Tracking
                    </h4>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Waybill Number</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="font-mono text-lg font-bold text-gray-800">
                            {selectedOrder.waybill}
                          </p>
                          <button
                            onClick={() => copyToClipboard(selectedOrder.waybill, 'Waybill copied!')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <a
                          href={selectedOrder.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Track on Delhivery
                        </a>
                        
                        <button
                          onClick={() => trackShipment(selectedOrder._id, selectedOrder.waybill)}
                          disabled={trackingOrderId === selectedOrder._id}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          {trackingOrderId === selectedOrder._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Refresh Status
                        </button>
                      </div>
                    </div>
                    
                    {/* Tracking Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getShipmentStatusColor(selectedOrder.delhiveryStatus)}`}>
                            {getShipmentStatusText(selectedOrder.delhiveryStatus)}
                          </span>
                          {selectedOrder.delhiveryStatus === 'delivered' && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      
                      {/* Tracking Timeline */}
                      <div className="relative pl-8">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                        
                        <div className="mb-6 relative">
                          <div className="absolute left-[-21px] top-0 w-6 h-6 bg-green-600 rounded-full border-4 border-white"></div>
                          <p className="font-medium">Order Manifested</p>
                          <p className="text-sm text-gray-500">Shipment created and ready for pickup</p>
                        </div>
                        
                        {selectedOrder.delhiveryStatus === 'in_transit' && (
                          <div className="mb-6 relative">
                            <div className="absolute left-[-21px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white"></div>
                            <p className="font-medium">In Transit</p>
                            <p className="text-sm text-gray-500">Package is on the way to destination</p>
                          </div>
                        )}
                        
                        {selectedOrder.delhiveryStatus === 'out_for_delivery' && (
                          <div className="mb-6 relative">
                            <div className="absolute left-[-21px] top-0 w-6 h-6 bg-orange-600 rounded-full border-4 border-white"></div>
                            <p className="font-medium">Out for Delivery</p>
                            <p className="text-sm text-gray-500">Delivery agent is on the way</p>
                          </div>
                        )}
                        
                        {selectedOrder.delhiveryStatus === 'delivered' && (
                          <div className="mb-6 relative">
                            <div className="absolute left-[-21px] top-0 w-6 h-6 bg-green-600 rounded-full border-4 border-white"></div>
                            <p className="font-medium">Delivered</p>
                            <p className="text-sm text-gray-500">Package delivered successfully</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Order created: {formatDate(selectedOrder.createdAt)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => printInvoice(selectedOrder)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Order;