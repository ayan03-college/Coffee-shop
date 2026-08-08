const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/checkout', checkout);
router.post('/checkout/payment-intent', createPaymentIntent);
router.post('/checkout/razorpay-order', createRazorpayOrder);
router.post('/checkout/razorpay-verify', verifyRazorpayPayment);
router.get('/orders', getMyOrders);
router.get('/orders/admin/all', admin, getAllOrders);
router.get('/orders/admin/analytics', admin, getAnalytics);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/cancel', cancelOrder);
router.put('/orders/:id/status', admin, updateOrderStatus);

module.exports = router;
