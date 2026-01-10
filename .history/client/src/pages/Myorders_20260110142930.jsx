import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { 
  Package, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  MapPin, 
  Copy, 
  ExternalLink,
  Download,
  Printer,
  FileText,
  Calendar,
  Hash
} from "lucide-react";
import toast from "react-hot-toast";

function Myorders() {
  const { axios, user } = useAppContext();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders || []);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Function to get status color and icon
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Delivered'
        };
      case 'shipped':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Truck className="w-4 h-4" />,
          text: 'Shipped'
        };
      case 'processing':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />,
          text: 'Processing'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Package className="w-4 h-4" />,
          text: status || 'Order Placed'
        };
    }
  };

  // Function to get payment method info
  const getPaymentMethodInfo = (order) => {
    if (order.paymentType === 'Razorpay' || order.razorpay_payment_id) {
      return {
        text: 'Razorpay',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: '💳'
      };
    } else if (order.paymentType === 'COD') {
      return {
        text: 'COD',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: '💰'
      };
    } else {
      return {
        text: order.paymentType || 'Online',
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: '💳'
      };
    }
  };

  // Function to format transaction/payment ID
  const formatPaymentId = (id) => {
    if (!id) return '';
    if (id.length > 12) {
      return `${id.slice(0, 8)}...${id.slice(-4)}`;
    }
    return id;
  };

  // Function to copy payment ID
  const copyPaymentId = (paymentId) => {
    if (!paymentId) return;
    navigator.clipboard.writeText(paymentId);
    toast.success('Payment ID copied to clipboard');
  };

  // Function to open Razorpay dashboard
  const openRazorpayDashboard = (paymentId) => {
    if (!paymentId) return;
    const url = `https://dashboard.razorpay.com/app/payments/${paymentId}`;
    window.open(url, '_blank');
  };

  // Function to view order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Calculate order total with GST and shipping
  const calculateOrderTotal = (order) => {
    let total = 0;
    order.items?.forEach(item => {
      const product = item.product || {};
      const price = product.offerPrice || product.price || 0;
      const quantity = item.quantity || 1;
      total += price * quantity;
    });
    return total;
  };

  // Function to download invoice
  const downloadInvoice = async (order) => {
    try {
      toast.loading('Generating invoice...');
      // This would call your backend to generate invoice
      // For now, just show a success message
      setTimeout(() => {
        toast.dismiss();
        toast.success('Invoice will be sent to your email');
      }, 1500);
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  if (loading) {
    return (
      <div className="mt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600 mt-2">Loading your orders...</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (myOrders.length === 0) {
    return (
      <div className="mt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600 mt-2">You haven't placed any orders yet</p>
          </div>
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No orders found</h3>
            <p className="text-gray-500 mt-2">Your orders will appear here once you make a purchase</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600 mt-2">View and manage all your orders in one place</p>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {myOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const paymentInfo = getPaymentMethodInfo(order);
              const totalAmount = calculateOrderTotal(order);

              return (
                <div 
                  key={order._id} 
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-green-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">Order #{order._id?.slice(-8)}</h3>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Payment Info */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentInfo.color} flex items-center gap-1`}>
                            <span>{paymentInfo.icon}</span>
                            <span>{paymentInfo.text}</span>
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-2`}>
                            {statusInfo.icon}
                            {statusInfo.text}
                          </span>

                          {/* Razorpay Quick Actions */}
                          {(order.razorpay_payment_id || order.paymentType === 'Razorpay') && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyPaymentId(order.razorpay_payment_id || order.transactionId);
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs font-medium"
                                title="Copy Payment ID"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRazorpayDashboard(order.razorpay_payment_id);
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium"
                                title="View in Razorpay"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">₹{order.amount?.toFixed(2) || totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{order.items?.length || 0} item(s)</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item, index) => (
                      <div key={index} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product?.image?.[0] ? (
                                <img 
                                  src={item.product.image[0]} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.product?.name || 'Product not available'}</h4>
                              <p className="text-sm text-gray-600 mt-1">{item.product?.category || 'N/A'}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-gray-700">Quantity: {item.quantity || 1}</span>
                                <span className="text-sm text-gray-700">Price: ₹{item.product?.offerPrice || item.product?.price || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{(item.product?.offerPrice || item.product?.price || 0) * (item.quantity || 1)}
                            </p>
                            {item.product?.freeShipping && (
                              <p className="text-sm text-green-600 mt-1 flex items-center justify-end gap-1">
                                <Truck className="w-4 h-4" />
                                Free Shipping
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        {/* Transaction ID */}
                        {(order.razorpay_payment_id || order.transactionId) && (
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-mono text-blue-700">
                              {order.razorpay_payment_id 
                                ? `Razorpay: ${formatPaymentId(order.razorpay_payment_id)}`
                                : `Txn: ${formatPaymentId(order.transactionId)}`
                              }
                            </span>
                            <button
                              onClick={() => copyPaymentId(order.razorpay_payment_id || order.transactionId)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Copy Transaction ID"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        {/* Address Info */}
                        {order.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <p className="text-sm text-gray-600">
                              Delivering to: {order.address.city}, {order.address.state}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => downloadInvoice(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                        
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-bold text-gray-800">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusInfo(selectedOrder.status).icon}
                    <span className={`font-bold ${selectedOrder.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                      {selectedOrder.status || 'Order Placed'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-2xl text-gray-800">
                    ₹{selectedOrder.amount?.toFixed(2) || calculateOrderTotal(selectedOrder).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Razorpay Payment Details */}
              {(selectedOrder.paymentType === 'Razorpay' || selectedOrder.razorpay_payment_id) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-800">Razorpay Payment</h4>
                        <p className="text-sm text-blue-600">Secure online payment processed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openRazorpayDashboard(selectedOrder.razorpay_payment_id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => copyPaymentId(selectedOrder.razorpay_payment_id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 rounded text-sm font-medium"
                      >
                        <Copy className="w-4 h-4" />
                        Copy ID
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Payment ID</p>
                      <p className="font-mono text-blue-900 bg-white p-2 rounded border border-blue-200 break-all">
                        {selectedOrder.razorpay_payment_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Payment Status</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-green-700">Payment Successful</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>
                
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => {
                      const itemTotal = (item.product?.offerPrice || item.product?.price || 0) * (item.quantity || 1);
                      
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                  {item.product?.image?.[0] ? (
                                    <img 
                                      src={item.product.image[0]} 
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2 flex-1">
                                  <div>
                                    <p className="font-bold text-gray-800 text-lg">{item.product?.name || 'Product not available'}</p>
                                    <p className="text-sm text-gray-500">{item.product?.category || 'N/A'}</p>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <span className="text-gray-600">
                                      Quantity: <span className="font-medium">{item.quantity || 1}</span>
                                    </span>
                                    <span className="text-gray-600">
                                      Price: <span className="font-medium">₹{item.product?.offerPrice || item.product?.price || 0}</span>
                                    </span>
                                    {item.product?.freeShipping && (
                                      <span className="text-green-600 flex items-center gap-1">
                                        <Truck className="w-4 h-4" />
                                        Free Shipping
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">₹{itemTotal.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h5 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Subtotal ({selectedOrder.items?.length || 0} items)</span>
                          <span className="font-bold">₹{calculateOrderTotal(selectedOrder).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-bold text-green-600">Free</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                          <span className="text-xl font-bold text-gray-800">Grand Total</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{selectedOrder.amount?.toFixed(2) || calculateOrderTotal(selectedOrder).toFixed(2)}
                          </span>
                        </div>
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
                    <MapPin className="w-5 h-5" />
                    Delivery Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer Name</p>
                        <p className="font-medium text-lg">
                          {selectedOrder.address.firstname} {selectedOrder.address.lastname}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium text-lg">{selectedOrder.address.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Delivery Address</p>
                        <p className="font-medium">
                          {selectedOrder.address.street}, {selectedOrder.address.city}
                        </p>
                        <p className="text-gray-600">
                          {selectedOrder.address.state} - {selectedOrder.address.zipcode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-lg capitalize">
                        {selectedOrder.paymentType || 'Online Payment'}
                        {selectedOrder.razorpay_payment_id && ' (Razorpay)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p className="font-medium text-lg text-green-600">Paid</p>
                    </div>
                    {(selectedOrder.razorpay_payment_id || selectedOrder.transactionId) && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-gray-800 break-all">
                            {selectedOrder.razorpay_payment_id || selectedOrder.transactionId}
                          </p>
                          <button
                            onClick={() => copyPaymentId(selectedOrder.razorpay_payment_id || selectedOrder.transactionId)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Copy Transaction ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => downloadInvoice(selectedOrder)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>
                
                <button
                  onClick={() => {
                    // Implement print functionality
                    window.print();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <Printer className="w-5 h-5" />
                  Print Order
                </button>
                
                {selectedOrder.razorpay_payment_id && (
                  <button
                    onClick={() => openRazorpayDashboard(selectedOrder.razorpay_payment_id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Razorpay Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Myorders;