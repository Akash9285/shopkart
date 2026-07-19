import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const tabs = [
    { to: '/admin', label: 'Dashboard', exact: true },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/upload', label: 'Upload Product' },
    { to: '/admin/orders', label: 'Orders' },
  ];
  return (
    <div className="page admin-page">
      <aside className="admin-sidebar">
        {tabs.map(t => (
          <Link key={t.to} to={t.to} className={pathname === t.to ? 'active' : ''}>{t.label}</Link>
        ))}
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
