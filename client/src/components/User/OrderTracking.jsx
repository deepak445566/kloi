import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { axios } = useAppContext();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/shiprocket/track/${orderId}`);
      
      if (data.success) {
        setOrder(data.order);
        setTrackingData(data.trackingData);
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-10">Loading...</div>;
  }
  
  if (!order) {
    return <div className="p-10 text-center">Order not found</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order Tracking</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium">#{order._id.slice(-8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium text-green-600">₹{order.amount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <p className={`font-medium ${
              order.status === 'Delivered' ? 'text-green-600' :
              order.status === 'Shipped' ? 'text-blue-600' :
              'text-yellow-600'
            }`}>
              {order.status}
            </p>
          </div>
        </div>
        
        {order.shiprocket?.awbCode && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-gray-500">AWB Number</p>
                <p className="font-bold text-lg">{order.shiprocket.awbCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Courier</p>
                <p className="font-medium">{order.shiprocket.courierName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shipment Status</p>
                <p className="font-medium">{order.shiprocket.status}</p>
              </div>
              {order.shiprocket.trackingUrl && (
                <a
                  href={order.shiprocket.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Track on Shiprocket
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Tracking Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Tracking History</h2>
        
        <div className="space-y-4">
          {order.trackingHistory?.map((track, index) => (
            <div key={index} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className={`w-4 h-4 rounded-full ${
                  index === 0 ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                {index < order.trackingHistory.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300" />
                )}
              </div>
              <div className="pb-4">
                <p className="font-medium">{track.status}</p>
                <p className="text-sm text-gray-500">
                  {new Date(track.date).toLocaleString()}
                </p>
                {track.location && (
                  <p className="text-sm text-gray-600">📍 {track.location}</p>
                )}
                {track.remark && (
                  <p className="text-sm text-gray-600 mt-1">{track.remark}</p>
                )}
              </div>
            </div>
          ))}
          
          {(!order.trackingHistory || order.trackingHistory.length === 0) && (
            <p className="text-gray-500 text-center py-4">
              No tracking information available yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;