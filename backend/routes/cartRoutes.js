const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/cart  (add or update item)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existing = cart.items.find(
      i => String(i.product) === String(productId) && i.size === size && i.color === color
    );
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, size, color, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/cart/:itemIndex  (update quantity)
router.put('/:itemIndex', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items[req.params.itemIndex]) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    cart.items[req.params.itemIndex].quantity = Number(quantity);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/cart/:itemIndex
router.delete('/:itemIndex', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items[req.params.itemIndex]) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    cart.items.splice(req.params.itemIndex, 1);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
