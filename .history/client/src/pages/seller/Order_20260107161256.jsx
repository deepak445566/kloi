import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerOrders = () => {
  const { axios, navigate } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/admin");
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">All Orders (Seller)</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border p-4 rounded bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                Order #{order._id.slice(-6)}
              </p>
              <p className="text-sm text-gray-600">
                Customer: {order.address.firstname}
              </p>
              <p className="text-sm">
                Payment:{" "}
                <span
                  className={`font-bold ${
                    order.isPaid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Pending"}
                </span>
              </p>
              <p className="text-sm">Status: {order.status}</p>
            </div>

            <button
              onClick={() => navigate(`/seller/order/${order._id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerOrders;
