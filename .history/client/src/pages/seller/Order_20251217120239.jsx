import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { X, Package, User, MapPin, Calendar, CreditCard, DollarSign, CheckCircle, Clock, Hash } from 'lucide-react';

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { axios } = useAppContext();

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders List</h2>
          
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
                  onClick={() => handleOrderClick(order)}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 max-w-4xl rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                >
                  <div className="flex gap-5">
                    <div className="relative">
                      <Package className="w-12 h-12 text-green-600" />
                      {order.isPaid && (
                        <CheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      {order.items && order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2 mb-2 last:mb-0">
                          <p className="font-medium text-gray-800">
                            {item?.product?.name || 'Unknown Product'} 
                            <span className={`text-green-600 ${(!item?.quantity || item.quantity < 2) && "hidden"}`}>
                              x {item?.quantity || 0}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {order.address ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{order.address.firstname || ''} {order.address.lastname || ''}</span>
                      </div>
                    ) : (
                      <p className='text-red-500'>Address not provided</p>
                    )}
                  </div>

                  <p className="font-bold text-lg text-gray-800 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {order.amount || 0}
                  </p>

                  {/* ✅ Transaction ID Display in Order List */}
                  <div className="flex flex-col text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <Hash className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-600">
                        {order.transactionId ? 
                          `${order.transactionId.slice(0, 8)}...${order.transactionId.slice(-4)}` : 
                          'No Txn ID'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.isPaid ? "Paid" : "Pending"}
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                  <p className="text-sm text-gray-500">Order ID: {selectedOrder._id?.slice(-8) || 'N/A'}</p>
                </div>
              </div>
              <button 
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
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
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-2xl text-gray-800">${selectedOrder.amount || 0}</p>
                </div>
              </div>

              {/* ✅ Transaction ID Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Transaction ID</p>
                      <p className="text-lg font-bold text-blue-800 font-mono">
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
                {!selectedOrder.transactionId && (
                  <p className="text-red-500 text-sm mt-2">⚠️ No transaction ID provided</p>
                )}
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </h4>
                {selectedOrder.address ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">
                        {selectedOrder.address.firstname || ''} {selectedOrder.address.lastname || ''}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedOrder.address.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedOrder.address.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">{selectedOrder.paymentType || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500">Address information not available</p>
                )}
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedOrder.address.street || ''}</p>
                    <p className="text-gray-600">
                      {selectedOrder.address.city || ''}, {selectedOrder.address.state || ''}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.address.zipcode || ''}, {selectedOrder.address.country || ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                          <img 
                            src={item?.product?.image?.[0] || assets.default_product} 
                            alt={item?.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item?.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Product ID: {item?.product?._id?.slice(-6) || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">${item?.product?.price || 0}</p>
                        <p className="text-gray-600">Qty: {item?.quantity || 0}</p>
                        <p className="font-bold text-green-600">
                          Total: ${((item?.product?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">${selectedOrder.amount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-bold">₹{((selectedOrder.amount || 0) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-green-600">₹{selectedOrder.amount || 0}</span>
                  </div>
                </div>
              </div>

            
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Order;