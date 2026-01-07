import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ShiprocketDashboard = () => {
  const { axios, isSeller } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isSeller) {
      fetchOrders();
    }
  }, [isSeller]);
  
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };
  
  const createShipment = async (orderId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/shiprocket/create-shipment/${orderId}`);
      
      if (data.success) {
        toast.success('Shipment created successfully');
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const generateLabel = async (orderId) => {
    try {
      const { data } = await axios.post(`/api/shiprocket/generate-label/${orderId}`);
      
      if (data.success) {
        window.open(data.labelUrl, '_blank');
        toast.success('Label generated');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const trackShipment = async (awbCode) => {
    try {
      const { data } = await axios.get(`/api/shiprocket/track-awb/${awbCode}`);
      
      if (data.success) {
        // Show tracking modal with data
        console.log('Tracking data:', data);
        toast.success('Tracking info loaded');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Shiprocket Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Shipments Created</h3>
          <p className="text-3xl font-bold">
            {orders.filter(o => o.shiprocket?.shipmentId).length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Delivered</h3>
          <p className="text-3xl font-bold">
            {orders.filter(o => o.status === 'Delivered').length}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 text-sm">#{order._id.slice(-8)}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.userId?.name || 'Customer'}
                  </td>
                  <td className="px-6 py-4 text-sm">₹{order.amount}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.shiprocket?.awbCode ? (
                      <div>
                        <p className="font-medium">{order.shiprocket.courierName}</p>
                        <p className="text-xs text-gray-500">AWB: {order.shiprocket.awbCode}</p>
                      </div>
                    ) : (
                      <span className="text-yellow-600">No shipment</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {!order.shiprocket?.shipmentId ? (
                      <button
                        onClick={() => createShipment(order._id)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        Create Shipment
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => generateLabel(order._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                          Print Label
                        </button>
                        <button
                          onClick={() => trackShipment(order.shiprocket.awbCode)}
                          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                        >
                          Track
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShiprocketDashboard;