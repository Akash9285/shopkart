const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route GET /api/products  (public - list/search/filter)
router.get('/', async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (keyword) query.title = { $regex: keyword, $options: 'i' };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { sellingPrice: 1 };
    if (sort === 'price_desc') sortOption = { sellingPrice: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/products/:id  (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/products  (seller/admin - create with image upload)
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, subCategory, price, sellingPrice, variants } = req.body;
    if (!title || !description || !category || !price || !sellingPrice) {
      return res.status(400).json({ message: 'Missing required product fields' });
    }

    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const parsedVariants = variants ? JSON.parse(variants) : [];
    const totalStock = parsedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

    const product = await Product.create({
      title, description, category, subCategory,
      price: Number(price), sellingPrice: Number(sellingPrice),
      images, variants: parsedVariants, totalStock,
      seller: req.user._id
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/products/:id  (seller who owns it, or admin)
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' && String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your product' });
    }

    const fields = ['title', 'description', 'category', 'subCategory', 'price', 'sellingPrice', 'isActive'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });
    if (req.body.variants) {
      product.variants = JSON.parse(req.body.variants);
      product.totalStock = product.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
    }
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/products/:id  (seller who owns it, or admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' && String(product.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your product' });
    }
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/products/:id/reviews  (any logged-in customer)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => String(r.user) === String(req.user._id));
    if (alreadyReviewed) return res.status(400).json({ message: 'You already reviewed this product' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
