const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const GST_RATE = 0.05; // 5% GST on food/beverage items
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 40;

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc    Checkout - create order from cart
// @route   POST /api/checkout
// @access  Private
const checkout = asyncHandler(async (req, res) => {
  const { customerInfo, paymentMethod, stripePaymentMethodId, razorpayPaymentId } = req.body;

  if (!customerInfo || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Customer info and payment method are required' });
  }
  const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
  for (const field of requiredFields) {
    if (!customerInfo[field]) {
      return res.status(400).json({ success: false, message: `${field} is required` });
    }
  }
  if (!['COD', 'Card', 'UPI'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const discount = cart.coupon?.discountAmount || 0;
  const grandTotal = Math.round((subtotal + gst + deliveryCharge - discount) * 100) / 100;

  let paymentResult = { id: '', status: 'pending', paidAt: null };
  let isPaid = false;

  if ((paymentMethod === 'Card' || paymentMethod === 'UPI') && razorpayPaymentId) {
    // Payment was already created & signature-verified via /api/checkout/razorpay-order
    // and /api/checkout/razorpay-verify before this call.
    paymentResult = { id: razorpayPaymentId, status: 'succeeded', paidAt: new Date() };
    isPaid = true;
  } else if (paymentMethod === 'Card' || paymentMethod === 'UPI') {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message:
          'Online payments are not configured. Set STRIPE_SECRET_KEY or RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET in backend .env, or choose Cash on Delivery.',
      });
    }
    try {
      // Stripe test-mode PaymentIntent (amount in paise)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(grandTotal * 100),
        currency: 'inr',
        payment_method: stripePaymentMethodId,
        confirm: !!stripePaymentMethodId,
        automatic_payment_methods: stripePaymentMethodId
          ? { enabled: true, allow_redirects: 'never' }
          : { enabled: true },
        description: `Coffee Shop Order for ${customerInfo.email}`,
      });

      paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        paidAt: paymentIntent.status === 'succeeded' ? new Date() : null,
      };
      isPaid = paymentIntent.status === 'succeeded';
    } catch (err) {
      return res.status(402).json({ success: false, message: `Payment failed: ${err.message}` });
    }
  }

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((item) => ({
      product: item.product,
      name: item.name,
      image: item.image,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
    })),
    customerInfo,
    paymentMethod,
    paymentResult,
    isPaid,
    coupon: cart.coupon,
    subtotal,
    gst,
    deliveryCharge,
    discount,
    grandTotal,
    status: 'Pending',
    statusHistory: [{ status: 'Pending', changedAt: new Date() }],
  });

  // Update sold counts
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.quantity } });
  }

  // Increment coupon usage
  if (cart.coupon?.code) {
    await Coupon.findOneAndUpdate({ code: cart.coupon.code }, { $inc: { usedCount: 1 } });
  }

  // Clear the cart
  cart.items = [];
  cart.coupon = { code: null, discountAmount: 0 };
  await cart.save();

  res.status(201).json({ success: true, order });
});

// @desc    Create a Stripe PaymentIntent client secret for the current cart total (used by frontend Stripe Elements)
// @route   POST /api/checkout/payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe is not configured on the server' });
  }
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const discount = cart.coupon?.discountAmount || 0;
  const grandTotal = Math.round((subtotal + gst + deliveryCharge - discount) * 100) / 100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(grandTotal * 100),
    currency: 'inr',
    automatic_payment_methods: { enabled: true },
  });

  res.json({ success: true, clientSecret: paymentIntent.client_secret, amount: grandTotal });
});

// @desc    Create a Razorpay Order for the current cart total (used by frontend Razorpay Checkout)
// @route   POST /api/checkout/razorpay-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({
      success: false,
      message: 'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.',
    });
  }
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const discount = cart.coupon?.discountAmount || 0;
  const grandTotal = Math.round((subtotal + gst + deliveryCharge - discount) * 100) / 100;

  // Razorpay amount is in the smallest currency unit (paise for INR)
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(grandTotal * 100),
    currency: 'INR',
    receipt: `rcpt_${req.user._id}_${Date.now()}`,
  });

  res.json({
    success: true,
    orderId: razorpayOrder.id,
    amount: grandTotal,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify a completed Razorpay payment's signature
// @route   POST /api/checkout/razorpay-verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ success: false, message: 'Razorpay is not configured on the server' });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing Razorpay verification fields' });
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  res.json({ success: true, message: 'Payment verified', razorpay_payment_id });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }
  res.json({ success: true, order });
});

// @desc    Cancel own order (only if still Pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (order.status !== 'Pending') {
    return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
  }
  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', changedAt: new Date() });
  await order.save();
  res.json({ success: true, order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, page: pageNum, pages: Math.ceil(total / limitNum), total });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  order.status = status;
  order.statusHistory.push({ status, changedAt: new Date() });
  if (status === 'Delivered') {
    order.isPaid = true;
    if (!order.paymentResult.paidAt) order.paymentResult.paidAt = new Date();
  }
  await order.save();
  res.json({ success: true, order });
});

// @desc    Sales analytics (admin)
// @route   GET /api/orders/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: { $ne: 'Cancelled' } });

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrders = orders.length;

  const salesByProduct = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!salesByProduct[item.name]) {
        salesByProduct[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      salesByProduct[item.name].quantity += item.quantity;
      salesByProduct[item.name].revenue += item.price * item.quantity;
    });
  });

  const topSelling = Object.values(salesByProduct)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const statusCounts = { Pending: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0, Cancelled: 0 };
  const allOrders = await Order.find({});
  allOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Revenue trend for last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const revenueByDay = last7Days.map((day) => {
    const dayTotal = orders
      .filter((o) => o.createdAt.toISOString().slice(0, 10) === day)
      .reduce((sum, o) => sum + o.grandTotal, 0);
    return { date: day, revenue: dayTotal };
  });

  res.json({
    success: true,
    analytics: {
      totalRevenue,
      totalOrders,
      topSelling,
      statusCounts,
      revenueByDay,
    },
  });
});

module.exports = {
  checkout,
  createPaymentIntent,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
};
