import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, refreshCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const items = cart.items || [];
  const total = items.reduce((sum, i) => sum + (i.product?.sellingPrice || 0) * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="page">
        <p>Your cart is empty.</p>
        <Link to="/" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <div className="cart-items">
        <h2>My Cart ({items.length})</h2>
        {items.map((item, idx) => (
          <div className="cart-item" key={idx}>
            {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" />}
            <div className="cart-item-info">
              <p className="product-title">{item.product?.title}</p>
              <p>{item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}</p>
              <p className="selling-price">₹{item.product?.sellingPrice}</p>
              <div className="qty-row">
                <button onClick={() => updateQuantity(idx, Math.max(1, item.quantity - 1))}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(idx, item.quantity + 1)}>+</button>
                <button className="link-btn" onClick={() => removeItem(idx)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Price Details</h3>
        <div className="summary-row"><span>Subtotal</span><span>₹{total}</span></div>
        <div className="summary-row"><span>Delivery</span><span>{total > 499 ? 'FREE' : '₹40'}</span></div>
        <hr />
        <div className="summary-row total"><span>Total</span><span>₹{total + (total > 499 ? 0 : 40)}</span></div>
        <button className="btn-primary full" onClick={() => navigate('/checkout')}>Place Order</button>
      </div>
    </div>
  );
}
