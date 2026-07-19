import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [msg, setMsg] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <p className="page">Loading...</p>;

  const handleAdd = async (goToCart) => {
    if (!user) return navigate('/login');
    await addToCart(id, size, color, 1);
    setMsg('Added to cart');
    if (goToCart) navigate('/cart');
  };

  const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];

  return (
    <div className="page product-detail">
      <div className="pd-images">
        {product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.title} className="pd-main-img" />
        ) : (
          <div className="img-placeholder large">No Image</div>
        )}
        <div className="pd-thumbs">
          {product.images.map((img, i) => <img key={i} src={img} alt="" />)}
        </div>
      </div>
      <div className="pd-info">
        <h2>{product.title}</h2>
        {product.numReviews > 0 && (
          <span className="rating-badge">★ {product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
        )}
        <div className="price-row large">
          <span className="selling-price">₹{product.sellingPrice}</span>
          {product.price > product.sellingPrice && (
            <>
              <span className="mrp">₹{product.price}</span>
              <span className="discount">{product.discountPercent}% off</span>
            </>
          )}
        </div>
        <p className="pd-desc">{product.description}</p>

        {sizes.length > 0 && (
          <div className="variant-row">
            <label>Size</label>
            <div className="variant-options">
              {sizes.map(s => (
                <button key={s} className={size === s ? 'variant-btn active' : 'variant-btn'} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {colors.length > 0 && (
          <div className="variant-row">
            <label>Color</label>
            <div className="variant-options">
              {colors.map(c => (
                <button key={c} className={color === c ? 'variant-btn active' : 'variant-btn'} onClick={() => setColor(c)}>{c}</button>
              ))}
            </div>
          </div>
        )}

        <div className="pd-actions">
          <button className="btn-secondary" onClick={() => handleAdd(false)}>Add to Cart</button>
          <button className="btn-primary" onClick={() => handleAdd(true)}>Buy Now</button>
        </div>
        {msg && <p className="success-msg">{msg}</p>}

        <div className="pd-reviews">
          <h4>Reviews</h4>
          {product.reviews.length === 0 && <p>No reviews yet.</p>}
          {product.reviews.map((r, i) => (
            <div key={i} className="review-item">
              <strong>{r.name}</strong> — ★ {r.rating}
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
