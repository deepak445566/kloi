import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

function Myorders() {
  const { axios, user } = useAppContext();
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Get status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
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
      <div className="mt-16 pb-16 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (myOrders.length === 0) {
    return (
      <div className="mt-16 pb-16">
        <div>
          <p className="text-2xl font-medium uppercase mb-6">My Orders</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <img 
            src={assets.empty_icon} 
            alt="No orders" 
            className="w-48 h-48 opacity-50 mb-6"
          />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-16 pb-16">
        <div className="mb-8">
          <p className="text-2xl font-medium uppercase">My Orders</p>
          <p className="text-gray-600 mt-2">{myOrders.length} orders placed</p>
        </div>
        
        {myOrders.map((order) => (
          <div 
            className="border border-gray-300 rounded-lg mb-10 p-4 py-5 hover:shadow-md transition-shadow" 
            key={order._id}
          >
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Order #{order._id.slice(-8)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status || 'Order Placed'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <span className="text-gray-700 font-medium">₹{order.amount}</span>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                  {order.paymentType}
                </span>
                {order.transactionId && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                    Txn: {order.transactionId.slice(0, 8)}...
                  </span>
                )}
                {/* ✅ TRACK ORDER BUTTON */}
                <button
                  onClick={() => navigate(`/order-tracking/${order._id}`)}
                  className="px-4 py-1.5 bg-primary text-white rounded text-sm hover:bg-primary-dull transition"
                >
                  Track Order
                </button>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="space-y-4">
              {order.items.map((item, itemIndex) => (
                item.product ? (
                  <div 
                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 hover:bg-gray-50 rounded ${
                      itemIndex !== order.items.length - 1 ? 'border-b border-gray-100' : ''
                    }`} 
                    key={itemIndex}
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product.image[0]} 
                          className="w-full h-full object-cover"
                          alt={item.product.name}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.product.category}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Qty: {item.quantity}</span>
                          <span>Weight: {item.product.weightValue} {item.product.weightUnit}</span>
                          {item.product.gstPercentage && (
                            <span>GST: {item.product.gstPercentage}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                      <div className="text-right">
                        <p className="text-gray-900 font-medium">
                          ₹{((item.product.offerPrice || item.product.price) * item.quantity).toFixed(2)}
                        </p>
                        {item.product.offerPrice && item.product.offerPrice !== item.product.price && (
                          <p className="text-sm text-gray-500 line-through">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/product/${item.product._id}`)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/order-tracking/${order._id}`)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100"
                        >
                          Track
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex items-center p-3 bg-gray-50 rounded"
                    key={itemIndex}
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-2xl">❌</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 mb-1">Product no longer available</h3>
                      <p className="text-sm text-gray-600">This product has been removed from the store</p>
                      <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
            
            {/* Order Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {order.address && (
                  <p>Deliver to: {order.address.street}, {order.address.city}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                {/* Download Invoice Button */}
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Download Invoice
                </button>
                
                {/* Need Help Button */}
                <button
                  onClick={() => navigate('/contact')}
                  className="px-4 py-2 border border-primary text-primary rounded text-sm hover:bg-primary/10"
                >
                  Need Help?
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Myorders;