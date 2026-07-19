import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/myorders').then(({ data }) => setOrders(data));
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    const { data } = await api.put(`/orders/${id}/cancel`);
    setOrders(orders.map(o => (o._id === id ? data : o)));
  };

  if (orders.length === 0) return <p className="page">You have no orders yet. <Link to="/">Shop now</Link></p>;

  return (
    <div className="page">
      <h2>My Orders</h2>
      <div className="orders-list">
        {orders.map(o => (
          <div className="order-card" key={o._id}>
            <div className="order-card-header">
              <span>Order #{o._id.slice(-8).toUpperCase()}</span>
              <span className={`status-badge ${o.orderStatus.toLowerCase().replace(/\s/g, '-')}`}>{o.orderStatus}</span>
            </div>
            {o.items.map((i, idx) => (
              <p key={idx}>{i.title} × {i.quantity} — ₹{i.price}</p>
            ))}
            <div className="order-card-footer">
              <span>Total: ₹{o.totalPrice}</span>
              <Link to={`/order/${o._id}`}>View Details</Link>
              {['Placed', 'Confirmed'].includes(o.orderStatus) && (
                <button className="link-btn" onClick={() => cancelOrder(o._id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
