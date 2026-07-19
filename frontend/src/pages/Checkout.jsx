import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const emptyAddr = { fullName: '', phone: '', pincode: '', locality: '', addressLine: '', city: '', state: '', landmark: '', addressType: 'Home' };

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddr);
  const [placing, setPlacing] = useState(false);
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const loadAddresses = () => {
    api.get('/addresses').then(({ data }) => {
      setAddresses(data);
      const def = data.find(a => a.isDefault) || data[0];
      if (def) setSelected(def._id);
    });
  };

  useEffect(() => { loadAddresses(); refreshCart(); }, []); // eslint-disable-line

  const saveAddress = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/addresses', form);
    setAddresses(data);
    setSelected(data[data.length - 1]._id);
    setShowForm(false);
    setForm(emptyAddr);
  };

  const items = cart.items || [];
  const total = items.reduce((sum, i) => sum + (i.product?.sellingPrice || 0) * i.quantity, 0);
  const shipping = total > 499 ? 0 : 40;

  const placeOrder = async () => {
    const addr = addresses.find(a => a._id === selected);
    if (!addr) return alert('Please select a delivery address');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: addr,
        paymentMethod: 'COD'
      });
      navigate(`/order/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page checkout-page">
      <div className="checkout-main">
        <h2>Select Delivery Address</h2>
        <div className="address-list">
          {addresses.map(a => (
            <label key={a._id} className={`address-card ${selected === a._id ? 'selected' : ''}`}>
              <input type="radio" name="address" checked={selected === a._id} onChange={() => setSelected(a._id)} />
              <div>
                <strong>{a.fullName}</strong> <span className="tag">{a.addressType}</span>
                <p>{a.addressLine}, {a.locality}, {a.city}, {a.state} - {a.pincode}</p>
                <p>Phone: {a.phone}</p>
              </div>
            </label>
          ))}
        </div>
        {!showForm ? (
          <button className="btn-secondary" onClick={() => setShowForm(true)}>+ Add New Address</button>
        ) : (
          <form className="address-form" onSubmit={saveAddress}>
            <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
            <input placeholder="Locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} required />
            <input placeholder="Address (House No, Street)" value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} required />
            <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
            <input placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
            <select value={form.addressType} onChange={(e) => setForm({ ...form, addressType: e.target.value })}>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
            </select>
            <div className="pd-actions">
              <button type="submit" className="btn-primary">Save Address</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
      <div className="cart-summary">
        <h3>Order Summary</h3>
        {items.map((i, idx) => (
          <div className="summary-row" key={idx}>
            <span>{i.product?.title} × {i.quantity}</span>
            <span>₹{(i.product?.sellingPrice || 0) * i.quantity}</span>
          </div>
        ))}
        <hr />
        <div className="summary-row"><span>Subtotal</span><span>₹{total}</span></div>
        <div className="summary-row"><span>Delivery</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
        <div className="summary-row total"><span>Total</span><span>₹{total + shipping}</span></div>
        <p className="cod-note">Payment Method: Cash on Delivery</p>
        <button className="btn-primary full" disabled={placing || !selected} onClick={placeOrder}>
          {placing ? 'Placing Order...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}
