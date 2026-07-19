const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/admin/dashboard  (admin-only site-wide stats)
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenueAgg, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }])
    ]);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      ordersByStatus: statusCounts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/admin/users  (admin: list users)
router.get('/users', protect, adminOnly, async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

module.exports = router;
