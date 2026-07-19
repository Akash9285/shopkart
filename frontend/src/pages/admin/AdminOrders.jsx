import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = () => api.get('/orders').then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h2>All Orders</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o._id.slice(-8).toUpperCase()}</td>
              <td>{o.user?.name}<br /><small>{o.user?.email}</small></td>
              <td>{o.items.map(i => i.title).join(', ')}</td>
              <td>₹{o.totalPrice}</td>
              <td>
                <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
