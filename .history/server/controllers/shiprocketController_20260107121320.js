import Order from "../models/Order.js";
import { getShiprocketToken } from "../utils/shiprocketService.js";
import axios from "axios";

export const generateLabel = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("address");

    if (!order) return res.status(404).json({ success:false });

    const token = await getShiprocketToken();

    const payload = {
      order_id: order._id.toString(),
      order_date: new Date(),
      pickup_location: "Primary",
      billing_customer_name: order.address.firstname,
      billing_last_name: order.address.lastname,
      billing_address: order.address.street,
      billing_city: order.address.city,
      billing_state: order.address.state,
      billing_pincode: order.address.pincode,
      billing_phone: order.address.phone,
      payment_method: "Prepaid",
      order_items: order.items.map(i => ({
        name: i.product.name,
        sku: i.product._id,
        units: i.quantity,
        selling_price: i.product.offerPrice || i.product.price
      })),
      sub_total: order.amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    const { data } = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    order.awbNumber = data.awb_code;
    order.shiprocketOrderId = data.order_id;
    order.shiprocketShipmentId = data.shipment_id;
    order.courierName = data.courier_name;
    order.shippingInfo = {
      hasShiprocket: true,
      shippingStatus: "AWB Generated"
    };
    await order.save();

    res.json({
      success:true,
      awbNumber: data.awb_code,
      labelUrl: data.label_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: err.message });
  }
};
export const trackShipment = async (req,res)=>{
  const order = await Order.findById(req.params.orderId);
  const token = await getShiprocketToken();

  const { data } = await axios.get(
    `${process.env.SHIPROCKET_BASE_URL}/courier/track/awb/${order.awbNumber}`,
    { headers:{ Authorization:`Bearer ${token}` } }
  );

  res.json({ success:true, tracking:data });
};
