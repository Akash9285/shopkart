const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/addresses
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.addresses);
});

// @route POST /api/addresses
router.post('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newAddress = req.body;

    if (newAddress.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }
    if (user.addresses.length === 0) newAddress.isDefault = true;

    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/addresses/:addressId
router.put('/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    Object.assign(address, req.body);
    if (req.body.isDefault) {
      user.addresses.forEach(a => {
        if (String(a._id) !== req.params.addressId) a.isDefault = false;
      });
    }
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/addresses/:addressId
router.delete('/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
