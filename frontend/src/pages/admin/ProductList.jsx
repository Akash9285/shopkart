import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  const load = () => api.get('/products', { params: { limit: 100 } }).then(({ data }) => setProducts(data.products));

  useEffect(() => { load(); }, []);

  const toggleActive = async (p) => {
    const fd = new FormData();
    fd.append('isActive', !p.isActive);
    await api.put(`/products/${p._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <h2>My Products</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Image</th><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.images[0] && <img src={p.images[0]} alt="" width="50" />}</td>
              <td>{p.title}</td>
              <td>{p.category}</td>
              <td>₹{p.sellingPrice}</td>
              <td>{p.totalStock}</td>
              <td>{p.isActive ? 'Active' : 'Hidden'}</td>
              <td>
                <button className="link-btn" onClick={() => toggleActive(p)}>{p.isActive ? 'Hide' : 'Show'}</button>
                <button className="link-btn" onClick={() => remove(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
