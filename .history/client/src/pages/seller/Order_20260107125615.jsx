// pages/seller/Orders.jsx - Complete Seller Orders Page
import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Package, User, MapPin, Calendar, Hash, CheckCircle, Tag, Layers, 
  Download, FileText, Printer, Mail, Truck, PackageCheck, ShieldCheck,
  ClipboardCheck, AlertCircle, RefreshCw, Eye, Send, ExternalLink,
  Filter, Search, CheckSquare, Square, BarChart, Clock, TrendingUp,
  DollarSign, Globe, Phone, MessageCircle, Headphones, Bell,
  MoreVertical, Settings, Upload, Database, Cpu, Shield,
  Zap, Target, BarChart2, PieChart, Activity, Users, Star,
  MessageSquare, Award, AwardIcon, Home, Building, Navigation,
  PhoneCall, Mail as MailIcon, Smartphone, Monitor, Server,
  Cloud, Database as DatabaseIcon, Wifi, Radio, Satellite
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

function Orders() {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [generatingLabel, setGeneratingLabel] = useState(null);
  const [showShiprocketModal, setShowShiprocketModal] = useState(false);
  const [bulkSelect, setBulkSelect] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    payment: 'all',
    shipping: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    revenue: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const invoiceRef = useRef();

  // Fetch orders with detailed stats
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
        calculateStats(data.orders || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (orderList) => {
    const stats = {
      total: orderList.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      revenue: 0,
      cod: 0,
      online: 0,
      avgOrderValue: 0
    };

    let totalRevenue = 0;
    
    orderList.forEach(order => {
      totalRevenue += order.amount || 0;
      
      // Count by status
      switch(order.status) {
        case 'Order Placed': stats.pending++; break;
        case 'Processing': stats.processing++; break;
        case 'Shipped': stats.shipped++; break;
        case 'Delivered': stats.delivered++; break;
      }
      
      // Count by payment type
      if (order.paymentType === 'COD') {
        stats.cod++;
      } else {
        stats.online++;
      }
    });

    stats.revenue = totalRevenue;
    stats.avgOrderValue = stats.total > 0 ? totalRevenue / stats.total : 0;
    
    setStats(stats);
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.firstname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Payment filter
    if (filters.payment !== 'all') {
      filtered = filtered.filter(order => {
        if (filters.payment === 'paid') return order.isPaid;
        if (filters.payment === 'unpaid') return !order.isPaid;
        return true;
      });
    }

    // Shipping filter
    if (filters.shipping !== 'all') {
      filtered = filtered.filter(order => {
        if (filters.shipping === 'with') return order.shippingInfo?.hasShiprocket;
        if (filters.shipping === 'without') return !order.shippingInfo?.hasShiprocket;
        return true;
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch(filters.dateRange) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    setFilteredOrders(filtered);
  };

  // Shiprocket Functions
  const createShiprocketShipment = async (orderId) => {
    try {
      setGeneratingLabel(orderId);
      toast.loading('Creating shipment in Shiprocket...');
      
      const { data } = await axios.post(`/api/order/shiprocket/create/${orderId}`);
      toast.dismiss();
      
      if (data.success) {
        toast.success('Shiprocket shipment created successfully!');
        
        // Update the order in state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  shippingInfo: {
                    ...order.shippingInfo,
                    hasShiprocket: true,
                    shippingStatus: 'AWB Generated',
                    awbNumber: data.awbNumber,
                    courierName: data.courierName,
                    shipmentId: data.shipmentId,
                    labelUrl: data.labelUrl,
                    trackingUrl: data.trackingUrl
                  },
                  status: 'Processing'
                } 
              : order
          )
        );
        
        // Open label URL if available
        if (data.labelUrl) {
          window.open(data.labelUrl, '_blank');
        }

        // Refresh data
        fetchOrders();
      }
    } catch (error) {
      toast.dismiss();
      console.error('Shiprocket shipment error:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setGeneratingLabel(null);
    }
  };

  const generateShippingLabel = async (orderId) => {
    try {
      setGeneratingLabel(orderId);
      toast.loading('Generating shipping label...');
      
      const { data } = await axios.get(`/api/order/shiprocket/label/${orderId}`);
      toast.dismiss();
      
      if (data.success) {
        toast.success('Shipping label generated!');
        
        // Update the order in state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  shippingInfo: {
                    ...order.shippingInfo,
                    labelUrl: data.labelUrl
                  }
                } 
              : order
          )
        );
        
        // Open label URL
        if (data.labelUrl) {
          window.open(data.labelUrl, '_blank');
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error('Generate label error:', error);
      toast.error('Failed to generate shipping label');
    } finally {
      setGeneratingLabel(null);
    }
  };

  const trackShipment = async (orderId) => {
    try {
      toast.loading('Fetching tracking information...');
      
      const { data } = await axios.get(`/api/order/shiprocket/track/${orderId}`);
      toast.dismiss();
      
      if (data.success) {
        setTrackingInfo({
          orderId,
          ...data.tracking
        });
        setShowShiprocketModal(true);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Tracking error:', error);
      toast.error('Failed to fetch tracking information');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status });
      if (data.success) {
        toast.success('Order status updated');
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status } 
              : order
          )
        );
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status }));
        }
      }
    } catch (error) {
      console.error('Update status error:', error);
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

  const requestPickup = async (orderIds) => {
    try {
      toast.loading('Requesting pickup...');
      
      const { data } = await axios.post('/api/order/shiprocket/pickup', {
        orderIds: orderIds.length > 0 ? orderIds : bulkSelect
      });
      
      toast.dismiss();
      
      if (data.success) {
        toast.success(`Pickup requested for ${data.ordersUpdated} orders`);
        
        // Update orders
        setOrders(prevOrders => 
          prevOrders.map(order => 
            orderIds.includes(order._id)
              ? { 
                  ...order, 
                  shippingInfo: {
                    ...order.shippingInfo,
                    shippingStatus: 'Picked Up',
                    pickUpDate: new Date()
                  }
                } 
              : order
          )
        );
        
        // Clear bulk selection
        setBulkSelect([]);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Pickup request error:', error);
      toast.error('Failed to request pickup');
    }
  };

  const generateManifest = async (orderIds) => {
    try {
      toast.loading('Generating manifest...');
      
      const { data } = await axios.post('/api/order/shiprocket/manifest', {
        orderIds: orderIds.length > 0 ? orderIds : bulkSelect
      });
      
      toast.dismiss();
      
      if (data.success) {
        toast.success('Manifest generated successfully!');
        
        if (data.manifestUrl) {
          window.open(data.manifestUrl, '_blank');
        }
        
        // Clear bulk selection
        setBulkSelect([]);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Manifest error:', error);
      toast.error('Failed to generate manifest');
    }
  };

  const cancelShipment = async (orderId) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this shipment?')) return;
      
      toast.loading('Cancelling shipment...');
      
      const { data } = await axios.post(`/api/order/shiprocket/cancel/${orderId}`);
      toast.dismiss();
      
      if (data.success) {
        toast.success('Shipment cancelled successfully');
        
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  status: 'Cancelled',
                  shippingInfo: {
                    ...order.shippingInfo,
                    shippingStatus: 'Cancelled'
                  }
                } 
              : order
          )
        );
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error('Cancel shipment error:', error);
      toast.error('Failed to cancel shipment');
    }
  };

  const checkServiceability = async (pincode) => {
    try {
      const { data } = await axios.get('/api/order/shiprocket/serviceability', {
        params: { pincode }
      });
      
      if (data.success) {
        toast.success(`Service available for ${data.serviceability.length} couriers`);
        return data.serviceability;
      }
    } catch (error) {
      console.error('Serviceability check error:', error);
      toast.error('Failed to check serviceability');
    }
  };

  // Bulk operations
  const toggleBulkSelect = (orderId) => {
    if (bulkSelect.includes(orderId)) {
      setBulkSelect(bulkSelect.filter(id => id !== orderId));
    } else {
      setBulkSelect([...bulkSelect, orderId]);
    }
  };

  const selectAll = () => {
    if (bulkSelect.length === filteredOrders.length) {
      setBulkSelect([]);
    } else {
      setBulkSelect(filteredOrders.map(order => order._id));
    }
  };

  // Invoice functions
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
      console.error('Invoice download error:', error);
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

        ${order.shippingInfo?.awbNumber ? `
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
            <h3 style="color: #0369a1; margin-bottom: 10px; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              📦 Shipping Information
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p style="margin: 5px 0; color: #555;"><strong>AWB Number:</strong> ${order.shippingInfo.awbNumber}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> ${order.shippingInfo.shippingStatus || 'Processing'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Courier:</strong> ${order.shippingInfo.courierName || 'To be assigned'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Tracking:</strong> <a href="${order.shippingInfo.trackingUrl}" target="_blank">Click to track</a></p>
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

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Order Placed': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShippingStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Picked Up': return 'bg-purple-100 text-purple-800';
      case 'AWB Generated': return 'bg-indigo-100 text-indigo-800';
      case 'Created': return 'bg-teal-100 text-teal-800';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Initialize auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchOrders();
        toast.success('Orders refreshed automatically');
      }, 30000); // 30 seconds
      
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [orders, filters, searchTerm, activeTab]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage and track all customer orders
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden md:inline">Filters</span>
            </button>
            
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.revenue)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+18% from last month</span>
            </div>
          </div>

          {/* Processing Orders */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Processing</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.processing}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.processing / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Delivered</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.delivered}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.delivered / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setFilters({
                  status: 'all',
                  payment: 'all',
                  shipping: 'all',
                  dateRange: 'all'
                })}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={filters.payment}
                  onChange={(e) => setFilters({...filters, payment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Shipping Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shiprocket Status
                </label>
                <select
                  value={filters.shipping}
                  onChange={(e) => setFilters({...filters, shipping: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Orders</option>
                  <option value="with">With Shiprocket</option>
                  <option value="without">Without Shiprocket</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {bulkSelect.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {bulkSelect.length} order{bulkSelect.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => requestPickup(bulkSelect)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Truck className="w-4 h-4" />
                  Request Pickup
                </button>
                
                <button
                  onClick={() => generateManifest(bulkSelect)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Generate Manifest
                </button>
                
                <button
                  onClick={() => {
                    // Mark as shipped
                    bulkSelect.forEach(orderId => {
                      updateOrderStatus(orderId, 'Shipped');
                    });
                    setBulkSelect([]);
                    toast.success(`${bulkSelect.length} orders marked as shipped`);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Shipped
                </button>
                
                <button
                  onClick={() => setBulkSelect([])}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 mb-6">
          {[
            { id: 'all', label: 'All Orders', count: stats.total },
            { id: 'Order Placed', label: 'Pending', count: stats.pending },
            { id: 'Processing', label: 'Processing', count: stats.processing },
            { id: 'Shipped', label: 'Shipped', count: stats.shipped },
            { id: 'Delivered', label: 'Delivered', count: stats.delivered }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white border border-gray-200 border-b-0 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Auto Refresh Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="sr-only"
                />
                <label
                  htmlFor="auto-refresh"
                  className={`block h-6 w-12 rounded-full cursor-pointer transition-colors ${
                    autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform transform ${
                    autoRefresh ? 'translate-x-6' : ''
                  }`}></span>
                </label>
              </div>
              <label htmlFor="auto-refresh" className="text-sm text-gray-700">
                Auto Refresh (30s)
              </label>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {stats.total} orders
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString('en-IN')}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <button
                        onClick={selectAll}
                        className="mr-2 focus:outline-none"
                      >
                        {bulkSelect.length === filteredOrders.length ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      Order
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipping
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedOrder?._id === order._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBulkSelect(order._id);
                          }}
                          className="mr-2 focus:outline-none"
                        >
                          {bulkSelect.includes(order._id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.toString().slice(-8)}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate max-w-xs">
                            Txn: {order.transactionId?.slice(0, 12)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.userId?.name || order.address?.firstname || 'Customer'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.address?.phone || 'No phone'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{order.amount.toFixed(2)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        order.paymentType === 'COD' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {order.paymentType} • {order.isPaid ? 'Paid' : 'Pending'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.shippingInfo?.hasShiprocket ? (
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShippingStatusColor(order.shippingInfo.shippingStatus)}`}>
                            {order.shippingInfo.shippingStatus}
                          </span>
                          {order.shippingInfo.awbNumber && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              AWB: {order.shippingInfo.awbNumber}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Shipped
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {/* View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Shiprocket Actions */}
                        {!order.shippingInfo?.hasShiprocket && order.status !== 'Cancelled' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              createShiprocketShipment(order._id);
                            }}
                            disabled={generatingLabel === order._id}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                            title="Create Shiprocket Shipment"
                          >
                            {generatingLabel === order._id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Truck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {/* Track Button */}
                        {order.shippingInfo?.awbNumber && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              trackShipment(order._id);
                            }}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                            title="Track Shipment"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* WhatsApp Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendWhatsApp(order._id);
                          }}
                          className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg"
                          title="Send WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        
                        {/* More Actions Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle more actions
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try changing your search terms' : 'No orders match the selected filters'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          onTrackShipment={trackShipment}
          onCreateShipment={createShiprocketShipment}
          onGenerateLabel={generateShippingLabel}
          onCancelShipment={cancelShipment}
          onSendWhatsApp={sendWhatsApp}
          onDownloadInvoice={downloadInvoice}
          onPrintInvoice={printInvoice}
          downloadingInvoice={downloadingInvoice}
          generatingLabel={generatingLabel}
          checkServiceability={checkServiceability}
        />
      )}

      {/* Shiprocket Tracking Modal */}
      {showShiprocketModal && trackingInfo && (
        <ShiprocketTrackingModal
          trackingInfo={trackingInfo}
          onClose={() => {
            setShowShiprocketModal(false);
            setTrackingInfo(null);
          }}
        />
      )}
    </div>
  );
}

// Order Detail Modal Component
const OrderDetailModal = ({ 
  order, 
  onClose, 
  onUpdateStatus,
  onTrackShipment,
  onCreateShipment,
  onGenerateLabel,
  onCancelShipment,
  onSendWhatsApp,
  onDownloadInvoice,
  onPrintInvoice,
  downloadingInvoice,
  generatingLabel,
  checkServiceability
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [serviceability, setServiceability] = useState(null);
  const [checkingService, setCheckingService] = useState(false);

  const handleCheckServiceability = async () => {
    if (!order.address?.zipcode) {
      toast.error('Pincode not available');
      return;
    }
    
    setCheckingService(true);
    try {
      const result = await checkServiceability(order.address.zipcode);
      setServiceability(result);
    } finally {
      setCheckingService(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <p className="text-sm text-gray-500">Order #{order._id?.slice(-8)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadInvoice(order)}
              disabled={downloadingInvoice === order._id}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-2 text-sm"
            >
              {downloadingInvoice === order._id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Invoice
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{order.amount?.toFixed(2)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Items</p>
                <p className="text-2xl font-bold text-gray-900">{order.items?.length || 0}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Payment</p>
                <div className={`text-lg font-bold ${
                  order.isPaid ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentType} • {order.isPaid ? 'Paid' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-1">
                {['details', 'shipping', 'items', 'actions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-white border border-gray-200 border-b-0 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Status Update */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Update Order Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => onUpdateStatus(order._id, status)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          order.status === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Name:</span> {order.userId?.name || order.address?.firstname} {order.address?.lastname}</p>
                      <p><span className="text-gray-600">Phone:</span> {order.address?.phone || 'N/A'}</p>
                      <p><span className="text-gray-600">Email:</span> {order.address?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Transaction ID:</span> {order.transactionId || 'N/A'}</p>
                      <p><span className="text-gray-600">Payment Method:</span> {order.paymentType}</p>
                      <p><span className="text-gray-600">Payment Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.address && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                    <div className="space-y-1">
                      <p>{order.address.street}</p>
                      <p>{order.address.city}, {order.address.state} - {order.address.zipcode}</p>
                      <p>{order.address.country}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                {/* Shiprocket Actions */}
                {!order.shippingInfo?.hasShiprocket ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <Truck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">
                      No Shiprocket Shipment Created
                    </h4>
                    <p className="text-blue-700 mb-4">
                      Create a Shiprocket shipment to generate AWB and start tracking
                    </p>
                    <button
                      onClick={() => onCreateShipment(order._id)}
                      disabled={generatingLabel === order._id}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {generatingLabel === order._id ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Creating Shipment...
                        </>
                      ) : (
                        <>
                          <Truck className="w-5 h-5" />
                          Create Shiprocket Shipment
                        </>
                      )}
                    </button>
                    
                    {/* Serviceability Check */}
                    {order.address?.zipcode && (
                      <div className="mt-6">
                        <button
                          onClick={handleCheckServiceability}
                          disabled={checkingService}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
                        >
                          {checkingService ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                          Check Serviceability for {order.address.zipcode}
                        </button>
                        
                        {serviceability && (
                          <div className="mt-4 p-3 bg-white rounded border">
                            <p className="font-medium mb-2">Available Couriers:</p>
                            <div className="space-y-1">
                              {serviceability.map((courier, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{courier.courier_name}</span>
                                  <span>₹{courier.rate}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Shipping Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Truck className="w-10 h-10 text-blue-600" />
                          <div>
                            <h4 className="text-lg font-bold text-blue-800">Shiprocket Shipment</h4>
                            <p className="text-blue-700">Active since {new Date(order.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(order.shippingInfo.trackingUrl, '_blank')}
                            className="px-4 py-2 bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Track
                          </button>
                          
                          {order.shippingInfo.labelUrl && (
                            <button
                              onClick={() => window.open(order.shippingInfo.labelUrl, '_blank')}
                              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Label
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">AWB Number</p>
                          <p className="font-bold text-lg text-gray-900 font-mono">
                            {order.shippingInfo.awbNumber}
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Courier</p>
                          <p className="font-bold text-lg text-gray-900">
                            {order.shippingInfo.courierName}
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            order.shippingInfo.shippingStatus === 'Delivered' 
                              ? 'bg-green-100 text-green-800'
                              : order.shippingInfo.shippingStatus === 'In Transit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.shippingInfo.shippingStatus}
                          </span>
                        </div>
                      </div>
                      
                      {/* Tracking Timeline */}
                      {order.trackingHistory && order.trackingHistory.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-gray-900 mb-3">Tracking Timeline</h5>
                          <div className="space-y-3">
                            {order.trackingHistory.map((event, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{event.status}</p>
                                  <p className="text-sm text-gray-600">{event.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(event.date).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Shipping Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => onTrackShipment(order._id)}
                        className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-3"
                      >
                        <RefreshCw className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800">Refresh Tracking</p>
                          <p className="text-sm text-blue-700">Get latest shipment status</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => onGenerateLabel(order._id)}
                        disabled={generatingLabel === order._id}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-3 disabled:opacity-50"
                      >
                        <FileText className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Generate Label</p>
                          <p className="text-sm text-green-700">Download shipping label</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => onSendWhatsApp(order._id)}
                        className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 flex items-center gap-3"
                      >
                        <Send className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="font-medium text-purple-800">Send WhatsApp</p>
                          <p className="text-sm text-purple-700">Share tracking with customer</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => onCancelShipment(order._id)}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-3"
                      >
                        <X className="w-6 h-6 text-red-600" />
                        <div>
                          <p className="font-medium text-red-800">Cancel Shipment</p>
                          <p className="text-sm text-red-700">Cancel this shipment</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {item.product?.image?.[0] ? (
                        <img
                          src={item.product.image[0]}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-gray-900">{item.product?.name || 'Product'}</h5>
                            <p className="text-gray-600 text-sm mt-1">SKU: {item.product?._id?.slice(-8) || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{(item.price || 0).toFixed(2)}</p>
                            <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.product?.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {item.product.category}
                            </span>
                          )}
                          {item.product?.subCategory && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {item.product.subCategory}
                            </span>
                          )}
                          {item.product?.weight && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {item.product.weight} kg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => onDownloadInvoice(order)}
                    disabled={downloadingInvoice === order._id}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex flex-col items-center justify-center"
                  >
                    <Download className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="font-medium text-blue-800">Download Invoice</span>
                  </button>
                  
                  <button
                    onClick={() => onPrintInvoice(order)}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex flex-col items-center justify-center"
                  >
                    <Printer className="w-8 h-8 text-green-600 mb-2" />
                    <span className="font-medium text-green-800">Print Invoice</span>
                  </button>
                  
                  <button
                    onClick={() => onSendWhatsApp(order._id)}
                    className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 flex flex-col items-center justify-center"
                  >
                    <Send className="w-8 h-8 text-purple-600 mb-2" />
                    <span className="font-medium text-purple-800">Send WhatsApp</span>
                  </button>
                </div>
                
                {/* Order Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Add Order Note</h4>
                  <textarea
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    rows="3"
                    placeholder="Add internal notes about this order..."
                  ></textarea>
                  <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                    Save Note
                  </button>
                </div>
                
                {/* Support Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Support & Help</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                      <Headphones className="w-5 h-5 text-gray-600" />
                      <span>Contact Support</span>
                    </button>
                    
                    <button className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <span>Chat with Team</span>
                    </button>
                    
                    <button className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                      <PhoneCall className="w-5 h-5 text-gray-600" />
                      <span>Call Customer</span>
                    </button>
                    
                    <button className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-3">
                      <MailIcon className="w-5 h-5 text-gray-600" />
                      <span>Send Email</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Shiprocket Tracking Modal Component
const ShiprocketTrackingModal = ({ trackingInfo, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Shipment Tracking</h3>
              <p className="text-sm text-gray-500">AWB: {trackingInfo.awbNumber || 'Loading...'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {trackingInfo.tracking_data ? (
            <div className="space-y-6">
              {/* Current Status Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Current Status</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {trackingInfo.tracking_data.shipment_status || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">Last Updated</p>
                    <p className="text-blue-900 font-medium">
                      {trackingInfo.tracking_data.last_event_time || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Tracking History</h4>
                <div className="space-y-4">
                  {trackingInfo.tracking_data.shipment_track_activities?.map((event, index) => (
                    <div key={index} className="relative pl-8 pb-4">
                      {/* Timeline Line */}
                      {index < trackingInfo.tracking_data.shipment_track_activities.length - 1 && (
                        <div className="absolute left-3.5 top-6 w-0.5 h-full bg-blue-200"></div>
                      )}
                      
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Event Content */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{event.activity}</p>
                        <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{event.date}</p>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier Details */}
              {trackingInfo.courier && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Courier Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Courier Name</p>
                      <p className="font-medium">{trackingInfo.courier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium font-mono">{trackingInfo.awbNumber}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Tracking Information Not Available
              </h4>
              <p className="text-gray-600 mb-6">
                Tracking details are not available at the moment. Please try again later.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => window.open(`https://shiprocket.co/tracking/${trackingInfo.awbNumber}`, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Shiprocket
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;