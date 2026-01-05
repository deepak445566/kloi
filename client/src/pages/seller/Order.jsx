import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { X, Package, User, MapPin, Calendar, Hash, CheckCircle, Tag, Layers } from 'lucide-react';

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
                    <div className="space-y-2">
                      {order.items && order.items.map((item, itemIndex) => {
                        const hasSubcategory = ["Crop", "Fertilizer", "Pesticide"].includes(item?.product?.category);
                        
                        return (
                          <div key={itemIndex} className="flex flex-col gap-1 mb-3 last:mb-0">
                            <p className="font-medium text-gray-800">
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
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {order.address ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{order.address.firstname || ''} {order.address.lastname || ''}</span>
                      </div>
                    ) : (
                      <p className='text-red-500 text-xs'>No address</p>
                    )}
                  </div>

                  <p className="font-bold text-lg text-gray-800 flex items-center gap-1">
                    ₹{order.amount || 0}
                  </p>

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
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

              {/* Order Items Section with Category/Subcategory */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>
                
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => {
                      const hasSubcategory = ["Crop", "Fertilizer", "Pesticide"].includes(item?.product?.category);
                      const itemTotal = ((item?.product?.price || 0) * (item?.quantity || 0)).toFixed(2);
                      
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
                                </div>
                              </div>
                              
                              <div className="text-right space-y-2 min-w-[120px]">
                                <div>
                                  <p className="text-sm text-gray-500">Unit Price</p>
                                  <p className="font-bold text-gray-800">₹{item?.product?.price || 0}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Quantity</p>
                                  <p className="font-bold text-gray-800">{item?.quantity || 0}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Item Total</p>
                                  <p className="font-bold text-green-600 text-xl">₹{itemTotal}</p>
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
                                Item Total: <span className="font-bold text-green-700">₹{itemTotal}</span>
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
                          <span className="font-bold">₹{selectedOrder.amount || 0}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                          <span className="text-gray-600">Shipping Fee</span>
                          <span className="font-bold">₹0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tax (5%)</span>
                          <span className="font-bold">₹{((selectedOrder.amount || 0) * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                          <span className="text-xl font-bold text-gray-800">Grand Total</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{(parseFloat(selectedOrder.amount || 0) + (parseFloat(selectedOrder.amount || 0) * 0.05)).toFixed(2)}
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