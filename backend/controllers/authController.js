const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated' });
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (avatar !== undefined) req.user.avatar = avatar;

  const updatedUser = await req.user.save();
  res.json({ success: true, user: updatedUser.toSafeObject() });
});

// @desc    Add or update a saved address
// @route   POST /api/auth/address
// @access  Private
const saveAddress = asyncHandler(async (req, res) => {
  const { label, address, city, state, pincode, phone } = req.body;
  if (!address || !city || !state || !pincode || !phone) {
    return res.status(400).json({ success: false, message: 'All address fields are required' });
  }
  req.user.addresses.push({ label, address, city, state, pincode, phone });
  await req.user.save();
  res.status(201).json({ success: true, addresses: req.user.addresses });
});

// @desc    Delete a saved address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  req.user.addresses = req.user.addresses.filter(
    (a) => a._id.toString() !== req.params.addressId
  );
  await req.user.save();
  res.json({ success: true, addresses: req.user.addresses });
});

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  saveAddress,
  deleteAddress,
};
