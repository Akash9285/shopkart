import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const search = (e) => {
    e.preventDefault();
    navigate(`/?keyword=${encodeURIComponent(q)}`);
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">ShopKart</Link>
      <form className="search" onSubmit={search}>
        <input
          placeholder="Search for products, brands and more"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <nav className="nav-links">
        {user?.role === 'admin' || user?.role === 'seller' ? (
          <Link to="/admin">Admin Panel</Link>
        ) : null}
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Cart</Link>
            <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
            <button className="link-btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
