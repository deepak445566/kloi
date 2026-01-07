import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { 
  Package, Truck, CheckCircle, Clock, 
  MapPin, Calendar, Hash, Eye,
  Download, RefreshCw, AlertCircle,
  ExternalLink, ChevronRight
} from "lucide-react";

function Myorders() {
  const { axios, user } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
    } finally {
      setLoading(false);
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
        setShowTracking(true);
      }
    } catch (error) {
      console.error("Error tracking shipment:", error);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      window.open(`/api/order/invoice/${orderId}`, '_blank');
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      case "Shipped": return "bg-purple-100 text-purple-800";
      case "Delivered": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getShippingStatusColor = (status) => {
    switch (status) {
      case "Created": return "bg-blue-100 text-blue-800";
      case "AWB Generated": return "bg-purple-100 text-purple-800";
      case "Picked Up": return "bg-indigo-100 text-indigo-800";
      case "In Transit": return "bg-yellow-100 text-yellow-800";
      case "Delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-2">
                  Track and manage all your orders in one place
                </p>
              </div>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Orders
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {myOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">You haven't placed any orders yet.</p>
              <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myOrders.map((order, index) => (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order._id.slice(-8)}
                          </h3>
                          {order.isPaid && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Paid
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="font-medium">
                            Total: ₹{order.amount}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Tracking Button */}
                        {order.awbNumber && (
                          <button
                            onClick={() => trackShipment(order._id, order.awbNumber)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Truck className="w-4 h-4" />
                            Track Shipment
                          </button>
                        )}
                        
                        {/* View Details Button */}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        
                        {/* Download Invoice */}
                        <button
                          onClick={() => downloadInvoice(order._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      </div>
                    </div>

                    {/* Shipping Info Badge */}
                    {order.awbNumber && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-800">Shipping Information</p>
                              <div className="flex flex-wrap items-center gap-4 mt-1">
                                <span className="text-sm">
                                  <span className="font-medium">AWB:</span> {order.awbNumber}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getShippingStatusColor(order.shippingInfo?.shippingStatus)}`}>
                                  {order.shippingInfo?.shippingStatus || 'Processing'}
                                </span>
                                {order.courierName && (
                                  <span className="text-sm">
                                    <span className="font-medium">Courier:</span> {order.courierName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => window.open(`https://shiprocket.co/tracking/${order.awbNumber}`, '_blank')}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Open Tracking
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Order Items ({order.items?.length || 0})</h4>
                    <div className="space-y-4">
                      {order.items?.map((item, itemIndex) => (
                        item.product ? (
                          <div key={itemIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-white border rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={item.product.image?.[0] || '/placeholder.jpg'} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                <p className="text-sm text-gray-600">{item.product.category}</p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ₹{(item.product.offerPrice || item.product.price || 0) * (item.quantity || 1)}
                              </p>
                              <p className="text-sm text-gray-600">
                                ₹{item.product.offerPrice || item.product.price || 0} each
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div key={itemIndex} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-yellow-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Product Unavailable</h4>
                                <p className="text-sm text-gray-600">This product has been removed or is no longer available</p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                              </div>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span>Transaction ID: {order.transactionId?.slice(0, 12)}...</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{order.address?.city || ''}, {order.address?.state || ''}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">₹{order.amount}</p>
                        <p className="text-sm text-gray-600">Payment: {order.paymentType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Tracking Modal */}
      {showTracking && trackingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Track Your Order</h3>
                  <p className="text-sm text-gray-500">AWB: {trackingInfo.awbNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTracking(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <AlertCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {trackingInfo.tracking_data ? (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700 font-medium mb-1">Current Status</p>
                    <p className="text-xl font-bold text-blue-900">
                      {trackingInfo.tracking_data.shipment_status || 'In Transit'}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Last updated: {trackingInfo.tracking_data.last_event_time || 'Recently'}
                    </p>
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4">Tracking History</h4>
                    <div className="space-y-4">
                      {trackingInfo.tracking_data.shipment_track_activities?.map((event, index) => (
                        <div key={index} className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            {index < (trackingInfo.tracking_data.shipment_track_activities?.length - 1) && (
                              <div className="w-0.5 h-8 bg-gray-300 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-gray-900">{event.activity}</p>
                            <p className="text-sm text-gray-600">{event.location}</p>
                            <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  {trackingInfo.tracking_data.eta && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-700 font-medium">Estimated Delivery</p>
                          <p className="text-lg font-bold text-green-900">
                            {new Date(trackingInfo.tracking_data.eta).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-700">Loading tracking information...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please wait while we fetch the latest tracking updates
                  </p>
                </div>
              )}
              
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => window.open(`https://shiprocket.co/tracking/${trackingInfo.awbNumber}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Detailed Tracking
                </button>
                <button
                  onClick={() => setShowTracking(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                  <p className="text-sm text-gray-500">Order #{selectedOrder._id?.slice(-8)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <AlertCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <p className={`font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{selectedOrder.amount}</p>
                </div>
              </div>

              {/* Shipping Information */}
              {selectedOrder.awbNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">AWB Number</p>
                      <p className="font-bold text-blue-900">{selectedOrder.awbNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Shipping Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getShippingStatusColor(selectedOrder.shippingInfo?.shippingStatus)}`}>
                        {selectedOrder.shippingInfo?.shippingStatus || 'Processing'}
                      </span>
                    </div>
                    {selectedOrder.courierName && (
                      <div>
                        <p className="text-sm text-blue-700">Courier Partner</p>
                        <p className="font-medium">{selectedOrder.courierName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-blue-700">Tracking</p>
                      <button
                        onClick={() => {
                          setShowOrderDetails(false);
                          trackShipment(selectedOrder._id, selectedOrder.awbNumber);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Track Shipment →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Order Items</h4>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-white border rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product?.image?.[0] || '/placeholder.jpg'} 
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h5>
                          <p className="text-sm text-gray-600 mt-1">{item.product?.category || 'Category'}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">
                              Quantity: {item.quantity || 1}
                            </span>
                            {item.product?.weightValue && (
                              <span className="text-sm text-gray-600">
                                Weight: {item.product.weightValue} {item.product.weightUnit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{((item.product?.offerPrice || item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{item.product?.offerPrice || item.product?.price || 0} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedOrder.paymentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-medium ${selectedOrder.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium font-mono text-sm">{selectedOrder.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">₹{selectedOrder.amount}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {selectedOrder.address.firstname} {selectedOrder.address.lastname}
                    </p>
                    <p className="text-gray-600 mt-1">{selectedOrder.address.street}</p>
                    <p className="text-gray-600">
                      {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.zipcode}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-gray-600">
                        <span className="font-medium">Phone:</span> {selectedOrder.address.phone}
                      </p>
                      {selectedOrder.address.email && (
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span> {selectedOrder.address.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t">
                <button
                  onClick={() => downloadInvoice(selectedOrder._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </button>
                {selectedOrder.awbNumber && (
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      trackShipment(selectedOrder._id, selectedOrder.awbNumber);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Truck className="w-4 h-4" />
                    Track Shipment
                  </button>
                )}
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Myorders;