import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const discount = product.price > 0
    ? Math.round(((product.price - product.sellingPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-img">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} />
        ) : (
          <div className="img-placeholder">No Image</div>
        )}
      </div>
      <div className="product-info">
        <p className="product-title">{product.title}</p>
        <div className="price-row">
          <span className="selling-price">₹{product.sellingPrice}</span>
          {discount > 0 && (
            <>
              <span className="mrp">₹{product.price}</span>
              <span className="discount">{discount}% off</span>
            </>
          )}
        </div>
        {product.numReviews > 0 && (
          <span className="rating-badge">★ {product.rating.toFixed(1)} ({product.numReviews})</span>
        )}
      </div>
    </Link>
  );
}
