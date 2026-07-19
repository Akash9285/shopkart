const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/orders  (place order from cart -> order summary)
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'COD' } = req.body;
    if (!shippingAddress) return res.status(400).json({ message: 'Shipping address is required' });

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const items = cart.items.map(i => ({
      product: i.product._id,
      title: i.product.title,
      image: i.product.images[0],
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      price: i.product.sellingPrice
    }));

    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice > 499 ? 0 : 40;
    const totalPrice = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      statusHistory: [{ status: 'Placed' }]
    });

    // reduce stock
    for (const i of cart.items) {
      const product = await Product.findById(i.product._id);
      if (product) {
        const variant = product.variants.find(v => v.size === i.size && v.color === i.color);
        if (variant) variant.stock = Math.max(0, variant.stock - i.quantity);
        product.totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
        await product.save();
      }
    }

    cart.items = [];
    await cart.save();

    res.status(201).json(order); // this is the "order summary" returned right after checkout
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/orders/myorders  (order history for logged-in user)
router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @route GET /api/orders/:id  (single order summary)
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (String(order.user) !== String(req.user._id) && req.user.role === 'customer') {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  res.json(order);
});

// @route PUT /api/orders/:id/cancel  (customer cancels own order if not yet shipped)
router.put('/:id/cancel', protect, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (String(order.user) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your order' });
  }
  if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
    return res.status(400).json({ message: 'Order already shipped, cannot cancel' });
  }
  order.orderStatus = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled' });
  await order.save();
  res.json(order);
});

// ---- Admin/seller order management ----

// @route GET /api/orders  (admin: all orders)
router.get('/', protect, admin, async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// @route PUT /api/orders/:id/status  (admin updates order status)
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
  if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.orderStatus = status;
  order.statusHistory.push({ status });
  if (status === 'Delivered') order.deliveredAt = new Date();
  await order.save();
  res.json(order);
});

module.exports = router;
