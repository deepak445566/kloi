import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
  X, Package, User, MapPin, Calendar, Hash, CheckCircle, Tag, Layers, 
  Download, FileText, Printer, Mail, Truck, Clock, CheckSquare, 
  AlertCircle, RefreshCw, Filter, ExternalLink, ShoppingBag,
  BarChart3, Loader2, Ship, Box, ClipboardCheck, Copy, Search,
  Eye, ArrowUpDown, MoreVertical, Plus, Minus, ShoppingCart,
  Mail as MailIcon, Phone as PhoneIcon, Home as HomeIcon,
  CreditCard as CreditCardIcon, Truck as TruckIcon, Check as CheckIcon,
  AlertTriangle, Info, Calendar as CalendarIcon, Tag as TagIcon,
  TrendingUp, TrendingDown, BarChart, PieChart, Download as DownloadIcon,
  Upload, Settings, Bell, ChevronRight, ChevronLeft, Star,
  Shield, Lock, Unlock, Heart, MessageSquare, Share2,
  Globe, Map, Navigation, Pin, Target, Compass, Send,
  PackageCheck, PackageX, Timer, Zap, ArrowRight, ArrowLeft,
  ShieldCheck, ShieldOff, TagIcon as TagIcon2, ShoppingCart as CartIcon,
  DollarSign, CreditCard, Truck as TruckIcon2, Box as BoxIcon,
  CheckCircle as CheckCircleIcon, XCircle, ArrowUpDown as SortIcon,
  Filter as FilterIcon, EyeOff, Eye as EyeIcon, FileText as FileTextIcon,
  Archive, ArchiveRestore, RotateCcw, PlayCircle, PauseCircle,
  StopCircle, FastForward, Rewind, SkipBack, SkipForward,
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  Users, Settings as SettingsIcon, HelpCircle, BookOpen,
  Bookmark, BookmarkCheck, CalendarDays, Clock as ClockIcon,
  MapPin as MapPinIcon, Navigation as NavigationIcon,
  Globe as GlobeIcon, Shield as ShieldIcon, Lock as LockIcon,
  Unlock as UnlockIcon, Heart as HeartIcon, Star as StarIcon,
  ThumbsUp, ThumbsDown, Flag, FlagTriangleRight,
  Award, Crown, Trophy, Medal, Target as TargetIcon,
  Zap as ZapIcon, Cloud, CloudRain, CloudSnow, CloudLightning,
  Sun, Moon, Sunrise, Sunset, Wind, Thermometer, Droplets,
  Umbrella, CloudSun, CloudMoon, CloudDrizzle, CloudFog,
  CloudHail, CloudSleet, CloudWind, Hurricane, Tornado,
  Snowflake, Wind as WindIcon, ThermometerSun, ThermometerSnowflake,
  Droplet, Droplets as DropletsIcon, Thermometer as ThermometerIcon
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';

function Order() {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    processing: 0,
    shipped: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    totalAmount: 0,
    withTracking: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [creatingShipment, setCreatingShipment] = useState(null);
  const [schedulingPickup, setSchedulingPickup] = useState(false);
  const [generatingManifest, setGeneratingManifest] = useState(false);
  const [refreshingTracking, setRefreshingTracking] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const invoiceRef = useRef();

  // Fetch orders
  const fetchOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit,
        status: statusFilter !== 'all' ? statusFilter : '',
        search: searchTerm
      });
      
      const { data } = await axios.get(`/api/order/seller?${params}`);
      if (data.success) {
        setOrders(data.orders || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.pages || 1);
        setPage(pageNum);
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

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter and sort orders
  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.awbCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.phone?.includes(searchTerm) ||
        order.address?.phone?.includes(searchTerm) ||
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => new Date(order.createdAt) >= today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(order => new Date(order.createdAt) >= monthAgo);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'amount-high') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-low') {
      filtered.sort((a, b) => a.amount - b.amount);
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Handle order click
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeDetailModal = () => {
    setSelectedOrder(null);
  };

  // Selection handlers
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id));
    }
  };

  // Shiprocket functions
  const createShiprocketOrder = async (orderId) => {
    try {
      setCreatingShipment(orderId);
      const { data } = await axios.post(`/api/order/shiprocket/create/${orderId}`);
      
      if (data.success) {
        toast.success('Shipment created successfully!');
        fetchOrders(page);
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            ...data.data
          }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setCreatingShipment(null);
    }
  };

  const schedulePickupForOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders for pickup');
      return;
    }

    try {
      setSchedulingPickup(true);
      const { data } = await axios.post('/api/order/shiprocket/pickup', {
        orderIds: selectedOrders
      });
      
      if (data.success) {
        toast.success(`Pickup scheduled for ${selectedOrders.length} order(s)`);
        fetchOrders(page);
        setSelectedOrders([]);
        setShowBulkActions(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setSchedulingPickup(false);
    }
  };

  const generateManifestForOrders = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders for manifest');
      return;
    }

    try {
      setGeneratingManifest(true);
      const { data } = await axios.post('/api/order/shiprocket/manifest', {
        orderIds: selectedOrders
      });
      
      if (data.success) {
        toast.success('Manifest generated!');
        window.open(data.manifestUrl, '_blank');
        setSelectedOrders([]);
        setShowBulkActions(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate manifest');
    } finally {
      setGeneratingManifest(false);
    }
  };

  const refreshTracking = async (orderId) => {
    try {
      setRefreshingTracking(orderId);
      const { data } = await axios.get(`/api/order/shiprocket/track/${orderId}`);
      
      if (data.success) {
        toast.success('Tracking updated!');
        fetchOrders(page);
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            trackingData: data.tracking,
            status: data.status
          }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tracking');
    } finally {
      setRefreshingTracking(null);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      const { data } = await axios.put(`/api/order/status/${orderId}`, {
        status: newStatus
      });
      
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchOrders(page);
        
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            status: newStatus
          }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const downloadLabel = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/shiprocket/label/${orderId}`);
      if (data.success && data.labelUrl) {
        window.open(data.labelUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to download label');
    }
  };

  const generateInvoice = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/shiprocket/invoice/${orderId}`);
      if (data.success && data.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  const printAWB = (awbCode) => {
    if (awbCode) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>AWB: ${awbCode}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .awb { border: 2px solid #000; padding: 20px; max-width: 400px; }
              .header { text-align: center; margin-bottom: 20px; }
              .code { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
              .info { margin-top: 20px; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="awb">
              <div class="header">
                <h2>SHIPPING LABEL</h2>
                <p>Kuntal Agro Agencies</p>
                <p>+91 8586845185</p>
              </div>
              <div class="code">
                AWB: ${awbCode}
              </div>
              <div class="info">
                <p><strong>Scan this code for tracking</strong></p>
                <p>Generated: ${new Date().toLocaleString()}</p>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast.error('AWB code not available');
    }
  };

  const copyToClipboard = (text, label = '') => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const trackOnShiprocket = (awbCode) => {
    if (awbCode) {
      window.open(`https://shiprocket.co/tracking/${awbCode}`, '_blank');
    }
  };

  // Invoice generation functions
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
        <!-- Header -->
        <div style="border-bottom: 2px solid #4FBF8B; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="color: #4FBF8B; margin: 0; font-size: 28px; font-weight: bold;">Kuntal Agro Agencies</h1>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Farm & Garden Solutions</p>
              <p style="color: #666; margin: 0; font-size: 14px;">+91 8586845185 | kuntalagrosohna@gmail.com</p>
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
            <p style="margin: 5px 0; color: #555;"><strong>Kuntal Agro Agencies</strong></p>
            <p style="margin: 5px 0; color: #555;">Farm & Garden Products</p>
            <p style="margin: 5px 0; color: #555;">+91 8586845185</p>
            <p style="margin: 5px 0; color: #555;">kuntalagrosohna@gmail.com</p>
          </div>
          
          ${order.address ? `
            <div>
              <h3 style="color: #333; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Details</h3>
              <p style="margin: 5px 0; color: #555;"><strong>${order.address.firstname || ''} ${order.address.lastname || ''}</strong></p>
              <p style="margin: 5px 0; color: #555;">${order.address.phone || 'N/A'}</p>
              <p style="margin: 5px 0; color: #555;">${order.address.email || 'N/A'}</p>
              <p style="margin: 5px 0; color: #555;">${order.address.street || ''}, ${order.address.city || ''}</p>
              <p style="margin: 5px 0; color: #555;">${order.address.state || ''} - ${order.address.pincode || ''}</p>
            </div>
          ` : ''}
        </div>

        <!-- Order Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Order Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <div>
              <p style="margin: 5px 0; color: #555;"><strong>Order ID:</strong> ${order._id || 'N/A'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Transaction ID:</strong> ${order.transactionId || 'N/A'}</p>
              ${order.awbCode ? `<p style="margin: 5px 0; color: #555;"><strong>AWB Code:</strong> ${order.awbCode}</p>` : ''}
            </div>
            <div>
              <p style="margin: 5px 0; color: #555;"><strong>Payment Status:</strong> <span style="color: ${order.isPaid ? '#10b981' : '#f59e0b'};">${order.isPaid ? 'Paid' : 'Pending'}</span></p>
              <p style="margin: 5px 0; color: #555;"><strong>Payment Method:</strong> ${order.paymentType || 'Online Payment'}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Order Status:</strong> ${order.status || 'N/A'}</p>
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
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px solid #4FBF8B; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>Thank you for your business with Kuntal Agro Agencies</p>
          <p>For any queries, contact: +91 8586845185 | kuntalagrosohna@gmail.com</p>
          <p>This is a computer-generated invoice and does not require a signature</p>
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
      
      const fileName = `Invoice_${order._id.slice(-8)}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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

  // Helper functions
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Order Placed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'Returned': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy, hh:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM');
    } catch {
      return 'N/A';
    }
  };

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      const days = differenceInDays(new Date(), date);
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      return `${days} days ago`;
    } catch {
      return '';
    }
  };

  const getTrackingStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped': return <Truck className="w-4 h-4 text-blue-600" />;
      case 'out for delivery': return <Package className="w-4 h-4 text-purple-600" />;
      case 'in transit': return <Truck className="w-4 h-4 text-yellow-600" />;
      case 'manifested': return <FileText className="w-4 h-4 text-gray-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  // WhatsApp notification
  const sendWhatsAppNotification = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/whatsapp/${orderId}`);
      if (data.success && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to send WhatsApp notification');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
        <div className="md:p-10 p-4 space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
        <div className="md:p-10 p-4 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Orders Dashboard</h2>
              <p className="text-gray-600 text-sm mt-1">
                {stats.total} orders • ₹{stats.totalAmount?.toFixed(2) || '0'} total revenue
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchOrders(1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                {viewMode === 'list' ? 'Grid View' : 'List View'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Processing</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.processing}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Shipped</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.shipped}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Out for Delivery</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.outForDelivery}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Delivered</p>
                  <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Cancelled</p>
                  <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
                </div>
                <X className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">₹{stats.totalAmount?.toFixed(2) || '0'}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-gray-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, AWB, Customer Name, Phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount-high">Amount: High to Low</option>
                  <option value="amount-low">Amount: Low to High</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      {selectedOrders.length} order(s) selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={schedulePickupForOrders}
                      disabled={schedulingPickup}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                      {schedulingPickup ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4" />
                          Schedule Pickup
                        </>
                      )}
                    </button>
                    <button
                      onClick={generateManifestForOrders}
                      disabled={generatingManifest}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                      {generatingManifest ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Generate Manifest
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrders([]);
                        setShowBulkActions(false);
                      }}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-gray-200">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={selectAllOrders}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="col-span-2">Order ID</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-2">Items</div>
                <div className="col-span-1">Amount</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Orders */}
              {filteredOrders.map((order) => (
                <div 
                  key={order._id} 
                  className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="rounded border-gray-300"
                      />
                    </div>

                    {/* Order ID */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800">#{order._id.slice(-8)}</p>
                        <p className="text-xs text-gray-500">{formatShortDate(order.createdAt)}</p>
                        {order.transactionId && (
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-blue-600">
                              {order.transactionId.slice(0, 8)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800">
                          {order.userId?.name || order.address?.firstname || 'Customer'}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <PhoneIcon className="w-3 h-3" />
                          <span>{order.userId?.phone || order.address?.phone || 'N/A'}</span>
                        </div>
                        {order.address?.city && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{order.address.city}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800">
                          {order.items?.length || 0} item(s)
                        </p>
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-xs text-gray-600 truncate">
                            {item.product?.name || 'Product'} ×{item.quantity}
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-gray-500">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-1">
                      <p className="font-bold text-lg text-gray-800">
                        ₹{order.amount || 0}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <div className="space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {order.awbCode && (
                          <div className="flex items-center gap-1 text-xs">
                            <Truck className="w-3 h-3 text-blue-500" />
                            <span className="text-blue-600">{order.courierName || 'Shiprocket'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOrderClick(order)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        
                        <div className="relative">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => toggleOrderSelection(order._id)}
                            className="rounded border-gray-300"
                          />
                          <span className="font-bold text-gray-800">#{order._id.slice(-8)}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            {order.userId?.name || order.address?.firstname || 'Customer'} • 
                            {order.userId?.phone || order.address?.phone || 'N/A'}
                          </p>
                          <p>{order.items?.length || 0} item(s) • ₹{order.amount}</p>
                          {order.awbCode && (
                            <p className="text-blue-600">
                              <Truck className="inline w-3 h-3 mr-1" />
                              {order.courierName} • {order.awbCode.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleOrderClick(order)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => page > 1 && fetchOrders(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchOrders(pageNum)}
                        className={`px-3 py-1 rounded-lg ${
                          page === pageNum
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => page < totalPages && fetchOrders(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" ref={invoiceRef}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Package className="w-8 h-8 text-green-600" />
                  {selectedOrder.isPaid && (
                    <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                  <p className="text-sm text-gray-500">ID: #{selectedOrder._id?.slice(-8)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadInvoice(selectedOrder)}
                  disabled={downloadingInvoice === selectedOrder._id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {downloadingInvoice === selectedOrder._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-800">₹{selectedOrder.amount || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Items</p>
                  <p className="text-2xl font-bold text-green-800">{selectedOrder.items?.length || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">Date</p>
                  <p className="text-xl font-bold text-purple-800">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700">Payment</p>
                  <p className="text-xl font-bold text-yellow-800">{selectedOrder.paymentType}</p>
                </div>
              </div>

              {/* Tracking Section */}
              {selectedOrder.awbCode ? (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Shipment Tracking</h4>
                        <p className="text-sm text-gray-600">Powered by Shiprocket</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => refreshTracking(selectedOrder._id)}
                        disabled={refreshingTracking === selectedOrder._id}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                      >
                        {refreshingTracking === selectedOrder._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Refresh
                      </button>
                      <button
                        onClick={() => trackOnShiprocket(selectedOrder.awbCode)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Track on Shiprocket
                      </button>
                      <button
                        onClick={() => printAWB(selectedOrder.awbCode)}
                        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                      >
                        Print AWB
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-600">AWB Number</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash className="w-5 h-5 text-blue-600" />
                        <p className="text-lg font-bold text-blue-800 font-mono">{selectedOrder.awbCode}</p>
                        <button
                          onClick={() => copyToClipboard(selectedOrder.awbCode, 'AWB Code')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-600">Courier</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <p className="text-lg font-bold text-gray-800">{selectedOrder.courierName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-600">Shiprocket Order ID</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash className="w-5 h-5 text-green-600" />
                        <p className="text-lg font-bold text-gray-800 font-mono">{selectedOrder.shiprocketOrderId?.slice(0, 8) || 'N/A'}...</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {selectedOrder.trackingData?.history && selectedOrder.trackingData.history.length > 0 && (
                    <div className="bg-white rounded-lg border p-4">
                      <h5 className="font-bold text-gray-800 mb-3">Tracking Timeline</h5>
                      <div className="space-y-3">
                        {selectedOrder.trackingData.history.slice(0, 5).map((activity, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              {index < selectedOrder.trackingData.history.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-300"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{activity.status}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(activity.date)}</span>
                                {activity.location && (
                                  <>
                                    <MapPin className="w-3 h-3" />
                                    <span>{activity.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-yellow-600" />
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">No Shipment Created</h4>
                        <p className="text-sm text-gray-600">Create Shiprocket shipment to enable tracking</p>
                      </div>
                    </div>
                    <button
                      onClick={() => createShiprocketOrder(selectedOrder._id)}
                      disabled={creatingShipment === selectedOrder._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      {creatingShipment === selectedOrder._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Ship className="w-4 h-4" />
                          Create Shipment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h4 className="text-lg font-bold text-gray-800">Order Items ({selectedOrder.items?.length || 0})</h4>
                </div>
                <div className="p-4">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-white border rounded-lg overflow-hidden">
                              <img 
                                src={item.product?.image?.[0]} 
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{item.product?.name || 'Product'}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                {item.product?.category && (
                                  <span className={`px-2 py-0.5 rounded ${getCategoryColor(item.product.category)}`}>
                                    {item.product.category}
                                  </span>
                                )}
                                <span>Quantity: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-800">
                              ₹{(item.product?.offerPrice || 0) * item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₹{item.product?.offerPrice || 0} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No items found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              {selectedOrder.address && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b">
                    <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer Information
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-bold text-lg">
                            {selectedOrder.address.firstname} {selectedOrder.address.lastname}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{selectedOrder.address.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-bold text-lg">{selectedOrder.address.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium capitalize">{selectedOrder.paymentType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <h5 className="font-bold text-gray-800">Shipping Address</h5>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{selectedOrder.address.street}</p>
                        <p className="text-gray-600">
                          {selectedOrder.address.city}, {selectedOrder.address.state}
                        </p>
                        <p className="text-gray-600">Pincode: {selectedOrder.address.pincode}</p>
                        <p className="text-gray-600">Country: {selectedOrder.address.country || 'India'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h4 className="text-lg font-bold text-gray-800">Quick Actions</h4>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => sendWhatsAppNotification(selectedOrder._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send WhatsApp
                    </button>
                    {selectedOrder.labelUrl && (
                      <button
                        onClick={() => downloadLabel(selectedOrder._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Shipping Label
                      </button>
                    )}
                    <div className="relative">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                        disabled={updatingStatus === selectedOrder._id}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium cursor-pointer"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                      {updatingStatus === selectedOrder._id && (
                        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
                      )}
                    </div>
                    {!selectedOrder.awbCode && (
                      <button
                        onClick={() => createShiprocketOrder(selectedOrder._id)}
                        disabled={creatingShipment === selectedOrder._id}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 font-medium flex items-center gap-2"
                      >
                        {creatingShipment === selectedOrder._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Ship className="w-4 h-4" />
                            Create Shipment
                          </>
                        )}
                      </button>
                    )}
                    {selectedOrder.awbCode && (
                      <button
                        onClick={() => generateInvoice(selectedOrder._id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Generate Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Order;