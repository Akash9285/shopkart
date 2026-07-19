import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Dashboard is admin-only (sellers see Products/Orders only)'));
  }, []);

  if (error) return <p>{error}</p>;
  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stat-cards">
        <div className="stat-card"><h3>{stats.totalOrders}</h3><p>Total Orders</p></div>
        <div className="stat-card"><h3>{stats.totalProducts}</h3><p>Total Products</p></div>
        <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Customers</p></div>
        <div className="stat-card"><h3>₹{stats.totalRevenue}</h3><p>Revenue</p></div>
      </div>
      <h3>Orders by Status</h3>
      <ul>
        {stats.ordersByStatus.map(s => (
          <li key={s._id}>{s._id}: {s.count}</li>
        ))}
      </ul>
    </div>
  );
}
