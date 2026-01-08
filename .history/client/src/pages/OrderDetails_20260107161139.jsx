import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Package, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { id } = useParams();
  const { axios } = useAppContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/order/${id}`);
      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Package /> Order #{order._id.slice(-8)}
      </h2>

      {/* Status */}
      <div className="flex justify-between bg-gray-50 p-4 rounded">
        <p>
          Payment Status:{" "}
          <span
            className={`font-bold ${
              order.isPaid ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {order.isPaid ? "Paid" : "Pending"}
          </span>
        </p>
        <p className="font-bold text-lg">₹{order.amount}</p>
      </div>

      {/* Address */}
      {order.address && (
        <div className="bg-white border rounded p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <MapPin size={18} /> Delivery Address
          </h3>
          <p>
            {order.address.firstname} {order.address.lastname}
          </p>
          <p>{order.address.phone}</p>
          <p>
            {order.address.street}, {order.address.city}
          </p>
          <p>
            {order.address.state} - {order.address.zipcode}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Items</h3>
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center border rounded p-3 bg-gray-50"
          >
            <div>
              <p className="font-medium">{item.product?.name}</p>
              <p className="text-sm text-gray-600">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-bold">
              ₹{item.product?.offerPrice * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {/* Tracking (Future ready) */}
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <p className="font-semibold text-green-700">
          🚚 Order placed successfully
        </p>
        <p className="text-sm text-green-600">
          Courier will be assigned & picked up soon
        </p>
      </div>
    </div>
  );
};

export default OrderDetails;
