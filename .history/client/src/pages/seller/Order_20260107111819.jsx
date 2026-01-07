import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerOrders = () => {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/seller");
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const generateShippingLabel = async (orderId) => {
    try {
      toast.loading("Generating shipping label...");
      const { data } = await axios.post(`/api/order/generate-label/${orderId}`);
      toast.dismiss();
      
      if (data.success) {
        toast.success("Shipping label generated!");
        fetchOrders(); // Refresh orders
        if (data.labelUrl) {
          window.open(data.labelUrl, "_blank");
        }
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error generating label:", error);
      toast.error("Failed to generate shipping label");
    }
  };

  const trackShipment = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/order/track/${orderId}`);
      if (data.success) {
        setTrackingInfo(data.tracking);
        setShowTracking(true);
      }
    } catch (error) {
      console.error("Error tracking shipment:", error);
      toast.error("Failed to track shipment");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status: newStatus });
      if (data.success) {
        toast.success("Order status updated");
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShippingStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "bg-green-100 text-green-800";
      case "AWB Generated":
        return "bg-blue-100 text-blue-800";
      case "Picked Up":
        return "bg-purple-100 text-purple-800";
      case "In Transit":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Refresh Orders
        </button>
      </div>

      {/* Tracking Modal */}
      {showTracking && trackingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tracking Information</h3>
              <button
                onClick={() => setShowTracking(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p><strong>Current Status:</strong> {trackingInfo.status}</p>
              <p><strong>Estimated Delivery:</strong> {trackingInfo.eta || "Not available"}</p>
              {trackingInfo.tracking_history && (
                <div>
                  <h4 className="font-semibold mb-2">Tracking History:</h4>
                  <ul className="space-y-2">
                    {trackingInfo.tracking_history.map((event, index) => (
                      <li key={index} className="border-l-4 border-primary pl-3 py-1">
                        <p className="font-medium">{event.status}</p>
                        <p className="text-sm text-gray-600">{new Date(event.date).toLocaleString()}</p>
                        <p className="text-sm">{event.location}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Order Header */}
              <div className="flex flex-wrap justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <p className="font-semibold">Order ID: {order._id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.shippingInfo?.hasShiprocket && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getShippingStatusColor(order.shippingInfo.shippingStatus)}`}>
                      {order.shippingInfo.shippingStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p><strong>Name:</strong> {order.userId?.name || "N/A"}</p>
                  <p><strong>Email:</strong> {order.userId?.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {order.userId?.phone || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <p><strong>Amount:</strong> ₹{order.amount}</p>
                  <p><strong>Payment:</strong> {order.paymentType}</p>
                  <p><strong>Transaction ID:</strong> {order.transactionId?.slice(0, 10)}...</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center">
                        <img
                          src={item.product?.image?.[0] || "/placeholder.jpg"}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded mr-4"
                        />
                        <div>
                          <p className="font-medium">{item.product?.name || "Product not available"}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        ₹{((item.product?.offerPrice || item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Status Update */}
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {/* Shipping Actions */}
                {order.shippingInfo?.hasShiprocket ? (
                  <>
                    {!order.awbNumber ? (
                      <button
                        onClick={() => generateShippingLabel(order._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Generate Shipping Label
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          trackShipment(order._id);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Track Shipment
                      </button>
                    )}
                    {order.awbNumber && (
                      <span className="px-3 py-2 bg-gray-100 rounded-lg">
                        AWB: {order.awbNumber}
                      </span>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => toast.info("Shiprocket integration required")}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Setup Shipping
                  </button>
                )}

                {/* WhatsApp */}
                <button
                  onClick={async () => {
                    try {
                      const { data } = await axios.get(`/api/order/whatsapp/${order._id}`);
                      if (data.success) {
                        window.open(data.whatsappUrl, "_blank");
                      }
                    } catch (error) {
                      toast.error("Failed to generate WhatsApp link");
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Send WhatsApp
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerOrders;