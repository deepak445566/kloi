import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import {
  Truck, Package, PackageCheck, RefreshCw,
  Filter, Search, Download, Eye,
  CheckCircle, Clock, AlertCircle,
  ArrowRight, ExternalLink, BarChart3,
  Mail, Phone, MapPin, Calendar,
  ChevronRight, FileText, Printer,
  Shield, Users, TrendingUp, Box
} from 'lucide-react';

const ShiprocketShipping = () => {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [generatingLabels, setGeneratingLabels] = useState([]);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Fetch shipping orders
  const fetchShippingOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        const shippingOrders = data.orders.filter(order => 
          order.status === 'Processing' || 
          order.status === 'Shipped' || 
          order.status === 'Delivered'
        );
        setOrders(shippingOrders);
        calculateStats(shippingOrders);
      }
    } catch (error) {
      console.error('Error fetching shipping orders:', error);
      toast.error('Failed to load shipping data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders) => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Order Placed').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length
    };
    setStats(stats);
  };

  const generateShippingLabel = async (orderId) => {
    try {
      setGeneratingLabels(prev => [...prev, orderId]);
      toast.loading('Generating shipping label...');
      
      const { data } = await axios.post(`/api/order/generate-label/${orderId}`);
      toast.dismiss();
      
      if (data.success) {
        toast.success('Shipping label generated successfully!');
        fetchShippingOrders();
        
        if (data.labelUrl) {
          window.open(data.labelUrl, '_blank');
        }
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate shipping label');
    } finally {
      setGeneratingLabels(prev => prev.filter(id => id !== orderId));
    }
  };

  const trackShipment = async (orderId, awbNumber) => {
    try {
      const { data } = await axios.get(`/api/order/track/${orderId}`);
      if (data.success) {
        setTrackingInfo({
          orderId,
          awbNumber,
          ...data.tracking
        });
        setShowTrackingModal(true);
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast.error('Failed to track shipment');
    }
  };

  const bulkGenerateLabels = async () => {
    const pendingOrders = orders.filter(
      order => !order.awbNumber && order.status === 'Processing'
    );
    
    if (pendingOrders.length === 0) {
      toast.info('No orders pending for shipping label generation');
      return;
    }

    try {
      toast.loading(`Generating labels for ${pendingOrders.length} orders...`);
      
      for (const order of pendingOrders) {
        try {
          await axios.post(`/api/order/generate-label/${order._id}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between requests
        } catch (error) {
          console.error(`Failed for order ${order._id}:`, error);
        }
      }
      
      toast.dismiss();
      toast.success(`Labels generated for ${pendingOrders.length} orders`);
      fetchShippingOrders();
    } catch (error) {
      toast.dismiss();
      toast.error('Bulk operation failed');
    }
  };

  useEffect(() => {
    fetchShippingOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !order.awbNumber && order.status === 'Processing';
    if (filter === 'shipped') return order.awbNumber && order.status === 'Shipped';
    if (filter === 'delivered') return order.status === 'Delivered';
    return true;
  }).filter(order => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchLower) ||
      (order.address?.firstname?.toLowerCase() || '').includes(searchLower) ||
      (order.address?.phone?.toLowerCase() || '').includes(searchLower) ||
      (order.awbNumber?.toLowerCase() || '').includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Shiprocket Shipping Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all shipping operations, generate labels, and track shipments
            </p>
          </div>
          <button
            onClick={fetchShippingOrders}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Box className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <PackageCheck className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Labels</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => !o.awbNumber && o.status === 'Processing').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tracking</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {orders.filter(o => o.awbNumber && o.status === 'Shipped').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Bulk Operations</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={bulkGenerateLabels}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Generate All Shipping Labels
          </button>
          
          <button
            onClick={() => {
              const pendingOrders = orders.filter(o => !o.awbNumber && o.status === 'Processing');
              toast.info(`${pendingOrders.length} orders need shipping labels`);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            View Pending Orders
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, AWB..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['all', 'pending', 'shipped', 'delivered'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipping Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AWB Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No shipping orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm font-medium">
                          ₹{order.amount || 0}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.address?.firstname || 'Customer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.address?.phone || 'No phone'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.address?.city || 'No city'}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getShippingStatusColor(order.shippingInfo?.shippingStatus)}`}>
                          {order.shippingInfo?.shippingStatus || 'Not Initiated'}
                        </span>
                        {order.courierName && (
                          <span className="text-xs text-gray-600">
                            {order.courierName}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.awbNumber ? (
                        <div>
                          <p className="font-medium text-gray-900 font-mono">
                            {order.awbNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            Generated on {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not generated</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {!order.awbNumber && order.status === 'Processing' && (
                          <button
                            onClick={() => generateShippingLabel(order._id)}
                            disabled={generatingLabels.includes(order._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {generatingLabels.includes(order._id) ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileText className="w-3 h-3" />
                                Generate Label
                              </>
                            )}
                          </button>
                        )}
                        
                        {order.awbNumber && (
                          <button
                            onClick={() => trackShipment(order._id, order.awbNumber)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            <Truck className="w-3 h-3" />
                            Track Shipment
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && trackingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Shipment Tracking</h3>
                  <p className="text-sm text-gray-500">AWB: {trackingInfo.awbNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <AlertCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {trackingInfo.tracking_data ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-blue-800">Current Status</p>
                        <p className="text-lg font-medium">
                          {trackingInfo.tracking_data.shipment_status || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-sm">{trackingInfo.tracking_data.last_event_time || 'N/A'}</p>
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
                    )) || (
                      <p className="text-gray-500">No tracking history available</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-700">Tracking information loading...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    It may take a few moments for tracking data to appear
                  </p>
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => window.open(`https://shiprocket.co/tracking/${trackingInfo.awbNumber}`, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Shiprocket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                  <p className="text-sm text-gray-500">#{selectedOrder._id?.slice(-8)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <AlertCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Shipping Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">Shipping Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Status</p>
                    <p className="font-medium">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-medium ${selectedOrder.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">AWB Number</p>
                    <p className="font-medium font-mono">{selectedOrder.awbNumber || 'Not generated'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipping Status</p>
                    <p className={`font-medium ${getShippingStatusColor(selectedOrder.shippingInfo?.shippingStatus)}`}>
                      {selectedOrder.shippingInfo?.shippingStatus || 'Not Initiated'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedOrder.address?.firstname || ''} {selectedOrder.address?.lastname || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedOrder.address?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedOrder.address?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium">{selectedOrder.address?.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Order Items ({selectedOrder.items?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="font-bold">
                        ₹{((item.product?.offerPrice || item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {!selectedOrder.awbNumber && selectedOrder.status === 'Processing' && (
                  <button
                    onClick={() => {
                      generateShippingLabel(selectedOrder._id);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Generate Shipping Label
                  </button>
                )}
                
                {selectedOrder.awbNumber && (
                  <button
                    onClick={() => {
                      trackShipment(selectedOrder._id, selectedOrder.awbNumber);
                      setShowDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Track Shipment
                  </button>
                )}
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiprocketShipping;