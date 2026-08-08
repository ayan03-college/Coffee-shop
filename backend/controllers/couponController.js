const asyncHandler = require('../utils/asyncHandler');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

// @desc    Apply a coupon to the logged-in user's cart
// @route   POST /api/coupon/apply
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validity = coupon.isValid(subtotal);
  if (!validity.valid) {
    return res.status(400).json({ success: false, message: validity.reason });
  }

  const discountAmount = coupon.calculateDiscount(subtotal);

  cart.coupon = { code: coupon.code, discountAmount };
  await cart.save();

  res.json({
    success: true,
    message: `Coupon applied! You saved ₹${discountAmount.toFixed(2)}`,
    cart,
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/coupon/remove
// @access  Private
const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }
  cart.coupon = { code: null, discountAmount: 0 };
  await cart.save();
  res.json({ success: true, cart });
});

// @desc    Get all coupons
// @route   GET /api/coupon
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @desc    Create a coupon
// @route   POST /api/coupon
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

// @desc    Update a coupon
// @route   PUT /api/coupon/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }
  Object.assign(coupon, req.body);
  const updated = await coupon.save();
  res.json({ success: true, coupon: updated });
});

// @desc    Delete a coupon
// @route   DELETE /api/coupon/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }
  await coupon.deleteOne();
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = {
  applyCoupon,
  removeCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
