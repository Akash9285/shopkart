import { useState } from 'react';
import api from '../../api/axios';

const CATEGORIES = ['Women Ethnic', 'Women Western', 'Men', 'Kids', 'Home & Kitchen', 'Beauty & Health', 'Electronics'];

export default function ProductUpload() {
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0], subCategory: '', price: '', sellingPrice: '' });
  const [variants, setVariants] = useState([{ size: '', color: '', stock: '' }]);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const addVariantRow = () => setVariants([...variants, { size: '', color: '', stock: '' }]);
  const updateVariant = (i, key, val) => {
    const copy = [...variants];
    copy[i][key] = val;
    setVariants(copy);
  };
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('variants', JSON.stringify(variants.filter(v => v.stock !== '')));
      images.forEach(img => fd.append('images', img));

      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Product uploaded successfully!');
      setForm({ title: '', description: '', category: CATEGORIES[0], subCategory: '', price: '', sellingPrice: '' });
      setVariants([{ size: '', color: '', stock: '' }]);
      setImages([]);
      e.target.reset?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div>
      <h2>Upload New Product</h2>
      {msg && <p className="success-msg">{msg}</p>}
      {error && <p className="error-msg">{error}</p>}
      <form className="upload-form" onSubmit={submit}>
        <input placeholder="Product Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <div className="form-row">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Sub-category (optional)" value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} />
        </div>
        <div className="form-row">
          <input type="number" placeholder="MRP (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input type="number" placeholder="Selling Price (₹)" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
        </div>

        <h4>Variants (size / color / stock)</h4>
        {variants.map((v, i) => (
          <div className="form-row" key={i}>
            <input placeholder="Size (e.g. M, L, XL)" value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} />
            <input placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} />
            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
            <button type="button" className="link-btn" onClick={() => removeVariant(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={addVariantRow}>+ Add Variant</button>

        <h4>Product Images (up to 5)</h4>
        <input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} />

        <button type="submit" className="btn-primary">Upload Product</button>
      </form>
    </div>
  );
}
