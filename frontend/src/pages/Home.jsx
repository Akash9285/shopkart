import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Women Ethnic', 'Women Western', 'Men', 'Kids', 'Home & Kitchen', 'Beauty & Health', 'Electronics'];

export default function Home() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { keyword, category, sort } })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [keyword, category, sort]);

  return (
    <div className="page">
      <aside className="sidebar">
        <h4>Categories</h4>
        <ul className="filter-list">
          <li className={!category ? 'active' : ''} onClick={() => setCategory('')}>All</li>
          {CATEGORIES.map(c => (
            <li key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</li>
          ))}
        </ul>
        <h4>Sort by</h4>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </aside>
      <main className="product-grid-wrap">
        {loading ? <p>Loading products...</p> : (
          products.length === 0 ? <p>No products found.</p> : (
            <div className="product-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )
        )}
      </main>
    </div>
  );
}
