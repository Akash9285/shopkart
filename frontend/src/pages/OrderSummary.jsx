import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function OrderSummary() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id]);

  if (!order) return <p className="page">Loading order...</p>;

  return (
    <div className="page order-summary-page">
      <div className="order-success">
        <h2>✅ Order Placed Successfully!</h2>
        <p>Order ID: <strong>{order._id}</strong></p>
      </div>

      <div className="order-status-track">
        {['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'].map((s, i) => (
          <div key={s} className={`status-step ${order.orderStatus === s ? 'active' : ''}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      <div className="order-items">
        <h3>Items</h3>
        {order.items.map((i, idx) => (
          <div className="cart-item" key={idx}>
            {i.image && <img src={i.image} alt="" />}
            <div className="cart-item-info">
              <p className="product-title">{i.title}</p>
              <p>{i.size && `Size: ${i.size}`} {i.color && `· Color: ${i.color}`} · Qty: {i.quantity}</p>
              <p className="selling-price">₹{i.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="order-address">
        <h3>Delivery Address</h3>
        <p>{order.shippingAddress.fullName} — {order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.addressLine}, {order.shippingAddress.locality}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
      </div>

      <div className="cart-summary">
        <h3>Price Details</h3>
        <div className="summary-row"><span>Items</span><span>₹{order.itemsPrice}</span></div>
        <div className="summary-row"><span>Delivery</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
        <hr />
        <div className="summary-row total"><span>Total</span><span>₹{order.totalPrice}</span></div>
        <p>Payment: {order.paymentMethod}</p>
      </div>

      <Link to="/orders" className="btn-secondary">View All Orders</Link>
    </div>
  );
}
