// components/ShipRocketDashboard.js
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
  Package, 
  Truck, 
  Download, 
  Eye, 
  X, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Filter,
  Search,
  Printer,
  Copy,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const ShipRocketDashboard = () => {
  const { axios } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [serviceabilityLoading, setServiceabilityLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentType: 'all',
    dateRange: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    shipped: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0
  });
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [trackingData, setTrackingData] = useState(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        const ordersWithShipment = data.orders || [];
        setOrders(ordersWithShipment);
        
        // Calculate statistics
        const stats = {
          total: ordersWithShipment.length,
          shipped: ordersWithShipment.filter(o => o.shiprocketOrderId).length,
          pending: ordersWithShipment.filter(o => !o.shiprocketOrderId && o.isPaid).length,
          delivered: ordersWithShipment.filter(o => o.status === 'Delivered').length,
          cancelled: ordersWithShipment.filter(o => o.status === 'Cancelled').length
        };
        setStats(stats);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on criteria
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'shipped' && !order.shiprocketOrderId) return false;
      if (filters.status === 'pending' && order.shiprocketOrderId) return false;
      if (filters.status === 'not_shipped' && order.shiprocketOrderId) return false;
    }

    // Payment type filter
    if (filters.paymentType !== 'all' && order.paymentType !== filters.paymentType) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = 
        (order.transactionId?.toLowerCase().includes(searchLower)) ||
        (order._id?.toLowerCase().includes(searchLower)) ||
        (order.address?.firstname?.toLowerCase().includes(searchLower)) ||
        (order.address?.lastname?.toLowerCase().includes(searchLower)) ||
        (order.address?.phone?.includes(searchLower));
      
      if (!matches) return false;
    }

    return true;
  });

  // Create shipment for single order
  const createShipment = async (orderId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/order/shipment/create/${orderId}`);
      
      if (data.success) {
        toast.success('Shipment created successfully!');
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { 
                ...order, 
                shiprocketOrderId: data.data.shiprocketOrderId,
                awbCode: data.data.awbCode,
                courierName: data.data.courierName,
                status: 'Shipped',
                shippingDate: new Date()
              }
            : order
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          shipped: prev.shipped + 1,
          pending: prev.pending - 1
        }));
      } else {
        toast.error(data.message || 'Failed to create shipment');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  // Bulk create shipments
  const bulkCreateShipments = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to ship');
      return;
    }

    try {
      setBulkProcessing(true);
      const orderIds = selectedOrders.map(order => order._id);
      
      const { data } = await axios.post('/api/order/shipment/bulk-create', {
        orderIds
      });
      
      if (data.success) {
        toast.success(`Successfully created ${data.successful} shipments`);
        
        // Refresh orders
        await fetchOrders();
        setSelectedOrders([]);
      }
    } catch (error) {
      toast.error('Failed to create bulk shipments');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Check serviceability
  const checkServiceability = async (order) => {
    try {
      setServiceabilityLoading(true);
      const { data } = await axios.post('/api/order/shipment/serviceability', {
        pincode: order.address?.zipcode,
        weight: 0.5,
        orderId: order._id
      });
      
      if (data.success) {
        const couriers = data.availableCouriers || [];
        
        if (couriers.length > 0) {
          // Show serviceability modal
          setSelectedOrderDetails({
            ...order,
            serviceability: {
              available: true,
              couriers: couriers
            }
          });
        } else {
          toast.error('No courier service available for this pincode');
        }
      }
    } catch (error) {
      toast.error('Failed to check serviceability');
    } finally {
      setServiceabilityLoading(false);
    }
  };

  // Track shipment
  const trackShipment = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/shipment/track/${orderId}`);
      
      if (data.success) {
        setTrackingData({
          orderId,
          ...data.trackingData
        });
      }
    } catch (error) {
      toast.error('Failed to track shipment');
    }
  };

  // Get shipping label
  const getShippingLabel = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/shipment/label/${orderId}`);
      
      if (data.success && data.labelUrl) {
        window.open(data.labelUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to get shipping label');
    }
  };

  // Cancel shipment
  const cancelShipment = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this shipment?')) {
      return;
    }

    try {
      const { data } = await axios.post(`/api/order/shipment/cancel/${orderId}`, {
        reason: 'Cancelled by seller'
      });
      
      if (data.success) {
        toast.success('Shipment cancelled successfully');
        
        // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, status: 'Cancelled' }
            : order
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          shipped: prev.shipped - 1,
          cancelled: prev.cancelled + 1
        }));
      }
    } catch (error) {
      toast.error('Failed to cancel shipment');
    }
  };

  // Toggle order selection for bulk actions
  const toggleOrderSelection = (order) => {
    if (order.shiprocketOrderId) {
      toast.error('This order is already shipped');
      return;
    }

    setSelectedOrders(prev => {
      const isSelected = prev.some(o => o._id === order._id);
      if (isSelected) {
        return prev.filter(o => o._id !== order._id);
      } else {
        return [...prev, order];
      }
    });
  };

  // Select all orders
  const selectAllOrders = () => {
    const eligibleOrders = filteredOrders.filter(order => !order.shiprocketOrderId);
    
    if (selectedOrders.length === eligibleOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(eligibleOrders);
    }
  };

  // Copy AWB to clipboard
  const copyAWB = (awbCode) => {
    navigator.clipboard.writeText(awbCode);
    toast.success('AWB copied to clipboard');
  };

  // Get status color
  const getStatusColor = (order) => {
    if (order.status === 'Delivered') return 'bg-green-100 text-green-800';
    if (order.status === 'Cancelled') return 'bg-red-100 text-red-800';
    if (order.status === 'Shipped' || order.shiprocketOrderId) return 'bg-blue-100 text-blue-800';
    if (order.isPaid) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get status text
  const getStatusText = (order) => {
    if (order.status === 'Delivered') return 'Delivered';
    if (order.status === 'Cancelled') return 'Cancelled';
    if (order.shiprocketOrderId) return 'Shipped';
    if (order.isPaid) return 'Ready to Ship';
    return 'Pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ShipRocket Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage shipments and track orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Shipped</p>
                <p className="text-2xl font-bold text-green-900">{stats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Ready to Ship</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Package className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Delivered</p>
                <p className="text-2xl font-bold text-purple-900">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-indigo-900">
                    {selectedOrders.length} orders selected for shipping
                  </p>
                  <p className="text-sm text-indigo-700">
                    Total amount: ₹{selectedOrders.reduce((sum, order) => sum + order.amount, 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrders([])}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={bulkCreateShipments}
                  disabled={bulkProcessing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      Ship All Selected
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="shipped">Shipped</option>
              <option value="pending">Ready to Ship</option>
              <option value="not_shipped">Not Shipped</option>
            </select>

            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({...filters, paymentType: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="COD">COD</option>
              <option value="Online">Online</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Name, Phone..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.filter(o => !o.shiprocketOrderId).length}
                    onChange={selectAllOrders}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!order.shiprocketOrderId && (
                        <input
                          type="checkbox"
                          checked={selectedOrders.some(o => o._id === order._id)}
                          onChange={() => toggleOrderSelection(order)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <p className="font-medium text-gray-900">
                            Order #{order._id?.slice(-8)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        {order.transactionId && (
                          <p className="text-xs font-mono text-blue-600">
                            Txn: {order.transactionId.slice(0, 12)}...
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {order.address?.firstname || 'Unknown'} {order.address?.lastname || ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.address?.phone || 'No phone'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {order.address?.city || 'Unknown'}, {order.address?.state || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="font-bold text-lg text-gray-900">
                        ₹{order.amount}
                      </p>
                      <p className={`text-xs ${order.paymentType === 'COD' ? 'text-red-600' : 'text-green-600'}`}>
                        {order.paymentType}
                      </p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order)}`}>
                        {getStatusText(order)}
                      </span>
                      {order.shiprocketOrderId && (
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-600">
                            AWB: {order.awbCode}
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.courierName}
                          </p>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!order.shiprocketOrderId ? (
                          <>
                            <button
                              onClick={() => createShipment(order._id)}
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3" />
                              Ship
                            </button>
                            
                            <button
                              onClick={() => checkServiceability(order)}
                              disabled={serviceabilityLoading}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Check
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => getShippingLabel(order._id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              Label
                            </button>
                            
                            <button
                              onClick={() => copyAWB(order.awbCode)}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              AWB
                            </button>
                            
                            <button
                              onClick={() => trackShipment(order._id)}
                              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Track
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Serviceability Modal */}
      {selectedOrderDetails?.serviceability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Service Availability</h3>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    Delivery to: {selectedOrderDetails.address?.city}, {selectedOrderDetails.address?.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pincode: {selectedOrderDetails.address?.zipcode}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Available Couriers</h4>
                  {selectedOrderDetails.serviceability.couriers.map((courier, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{courier.courier_name}</p>
                          <p className="text-sm text-gray-600">
                            Estimated delivery: {courier.estimated_delivery_days} days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ₹{courier.freight_charge}
                          </p>
                          <p className="text-xs text-gray-500">Freight charge</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      createShipment(selectedOrderDetails._id);
                      setSelectedOrderDetails(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Shipment Tracking</h3>
                <button
                  onClick={() => setTrackingData(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-bold">Tracking Information</p>
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Tracking Timeline */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Tracking History</h4>
                  
                  {trackingData.tracking_data?.shipment_track_activities?.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        {index < trackingData.tracking_data.shipment_track_activities.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.activity}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(activity.date).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{activity.location}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-8">
                      No tracking information available
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setTrackingData(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipRocketDashboard;