import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Package, Eye } from "lucide-react";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { axios, navigate } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500">
          <Package className="mx-auto w-16 h-16 mb-2" />
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4 bg-white hover:shadow"
            >
              <div>
                <p className="font-semibold">
                  Order ID: #{order._id.slice(-8)}
                </p>
                <p className="text-sm text-gray-600">
                  Date:{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </p>
                <p className="text-sm">
                  Payment:{" "}
                  <span
                    className={`font-medium ${
                      order.isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <p className="font-bold text-lg">₹{order.amount}</p>
                <button
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Eye size={16} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
