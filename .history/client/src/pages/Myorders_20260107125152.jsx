// components/Myorders.jsx - Updated with Shiprocket Tracking
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Shield,
  PhoneCall,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

function Myorders() {
  const { axios, user } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const [loadingTracking, setLoadingTracking] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (orderId) => {
    try {
      setLoadingTracking(prev => ({ ...prev, [orderId]: true }));
      
      const { data } = await axios.get(`/api/order/track/${orderId}`);
      if (data.success) {
        setTrackingData(prev => ({ 
          ...prev, 
          [orderId]: data.tracking 
        }));
      }
    } catch (error) {
      console.error("Tracking error:", error);
      toast.error("Failed to load tracking info");
    } finally {
      setLoadingTracking(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      // Fetch tracking if not already loaded
      if (!trackingData[orderId]) {
        fetchTracking(orderId);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
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
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const openTrackingExternal = (awbNumber) => {
    window.open(`https://shiprocket.co/tracking/${awbNumber}`, '_blank');
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="mt-16 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6 mb-4">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track and manage all your orders in one place
          </p>
        </div>

        {myOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500">
              When you place an order, it will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {myOrders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
              >
                {/* Order Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <Package className="w-6 h-6 text-green-600" />
                          {order.isPaid && (
                            <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order._id.toString().slice(-8)}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            {order.shippingInfo?.hasShiprocket && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShippingStatusColor(order.shippingInfo.shippingStatus)}`}>
                                {order.shippingInfo.shippingStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Ordered on {formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>
                            {order.shippingInfo?.hasShiprocket 
                              ? `Shipped via ${order.shippingInfo.courierName || 'Courier'}`
                              : 'Preparing for shipment'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span className={order.isPaid ? "text-green-600" : "text-yellow-600"}>
                            {order.isPaid ? "Paid" : "Payment Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex flex-col items-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{order.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderExpand(order._id);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          {expandedOrder === order._id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              View Details
                            </>
                          )}
                        </button>
                        
                        {order.shippingInfo?.awbNumber && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTrackingExternal(order.shippingInfo.awbNumber);
                            }}
                            className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Track
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedOrder === order._id && (
                  <div className="border-t border-gray-200 p-6">
                    {/* Tracking Section */}
                    {order.shippingInfo?.hasShiprocket && (
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                            Shipment Tracking
                          </h4>
                          {order.shippingInfo.awbNumber && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">AWB: {order.shippingInfo.awbNumber}</span>
                              <button
                                onClick={() => openTrackingExternal(order.shippingInfo.awbNumber)}
                                className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-lg flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open Tracking
                              </button>
                            </div>
                          )}
                        </div>

                        {loadingTracking[order._id] ? (
                          <div className="flex justify-center py-8">
                            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                          </div>
                        ) : trackingData[order._id] ? (
                          <div className="space-y-4">
                            {/* Current Status */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-blue-700 font-medium">Current Status</p>
                                  <p className="text-xl font-bold text-blue-800 mt-1">
                                    {trackingData[order._id]?.status || 'Tracking...'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-blue-700">Last Updated</p>
                                  <p className="text-blue-800">
                                    {new Date().toLocaleDateString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Tracking Timeline */}
                            <div>
                              <h5 className="font-medium text-gray-700 mb-3">Tracking History</h5>
                              <div className="space-y-3">
                                {(order.trackingHistory || []).map((event, index) => (
                                  <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{event.status}</p>
                                      <p className="text-sm text-gray-600">{event.description}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(event.date).toLocaleString('en-IN')}
                                        {event.location && ` • ${event.location}`}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Info */}
                            {order.shippingInfo.expectedDelivery && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <Clock className="w-5 h-5 text-green-600" />
                                  <div>
                                    <p className="font-medium text-green-800">Expected Delivery</p>
                                    <p className="text-green-700">
                                      {formatDate(order.shippingInfo.expectedDelivery)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                            <p className="text-gray-700">Tracking information not available</p>
                            <button
                              onClick={() => fetchTracking(order._id)}
                              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Try again
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                            {item.product?.image?.[0] ? (
                              <img
                                src={item.product.image[0]}
                                alt={item.product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h5>
                              <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                              {item.product?.category && (
                                <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {item.product.category}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ₹{(item.price || 0).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                ₹{(item.price / item.quantity || 0).toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Shipping Address */}
                      {order.address && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-600" />
                            Shipping Address
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium text-gray-900">
                              {order.address.firstname} {order.address.lastname}
                            </p>
                            <p className="text-gray-700 mt-2">{order.address.street}</p>
                            <p className="text-gray-700">
                              {order.address.city}, {order.address.state} - {order.address.zipcode}
                            </p>
                            <p className="text-gray-700">{order.address.country}</p>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-gray-700">
                                📞 {order.address.phone}
                              </p>
                              {order.address.email && (
                                <p className="text-gray-700">📧 {order.address.email}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Payment Summary
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>₹{(order.amount * 0.95).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax (5%)</span>
                            <span>₹{(order.amount * 0.05).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-green-600">FREE</span>
                          </div>
                          <div className="border-t border-gray-300 pt-3 mt-3">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span>₹{order.amount.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Payment Method</span>
                              <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                {order.paymentType} • {order.isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                            {order.transactionId && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">Transaction ID</p>
                                <p className="font-mono text-sm bg-blue-50 px-2 py-1 rounded mt-1">
                                  {order.transactionId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Support Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Need Help?
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        <button className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Chat Support
                        </button>
                        <button className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg flex items-center gap-2">
                          <PhoneCall className="w-4 h-4" />
                          Call Support
                        </button>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg">
                            Cancel Order
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <button className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg">
                            Return/Exchange
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
      </div>
    </div>
  );
}

export default Myorders;