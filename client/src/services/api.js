import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling - log the user out if token is invalid/expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------- Auth ----------
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const saveAddress = (data) => api.post('/auth/address', data);
export const deleteAddress = (id) => api.delete(`/auth/address/${id}`);

// ---------- Products ----------
export const fetchProducts = (params) => api.get('/products', { params });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const fetchSearchSuggestions = (q) => api.get('/products/search/suggestions', { params: { q } });
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ---------- Cart ----------
export const fetchCart = () => api.get('/cart');
export const addToCartApi = (data) => api.post('/cart', data);
export const updateCartItemApi = (data) => api.put('/cart', data);
export const removeCartItemApi = (itemId) => api.delete(`/cart/${itemId}`);
export const clearCartApi = () => api.delete('/cart');

// ---------- Coupons ----------
export const applyCouponApi = (code) => api.post('/coupon/apply', { code });
export const removeCouponApi = () => api.delete('/coupon/remove');
export const fetchCoupons = () => api.get('/coupon');
export const createCoupon = (data) => api.post('/coupon', data);
export const updateCoupon = (id, data) => api.put(`/coupon/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/coupon/${id}`);

// ---------- Checkout / Orders ----------
export const checkoutApi = (data) => api.post('/checkout', data);
export const createPaymentIntentApi = () => api.post('/checkout/payment-intent');
export const createRazorpayOrderApi = () => api.post('/checkout/razorpay-order');
export const verifyRazorpayPaymentApi = (data) => api.post('/checkout/razorpay-verify', data);
export const fetchMyOrders = () => api.get('/orders');
export const fetchOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrderApi = (id) => api.put(`/orders/${id}/cancel`);
export const fetchAllOrders = (params) => api.get('/orders/admin/all', { params });
export const updateOrderStatusApi = (id, status) => api.put(`/orders/${id}/status`, { status });
export const fetchAnalytics = () => api.get('/orders/admin/analytics');

// ---------- Reviews ----------
export const fetchProductReviews = (productId) => api.get(`/reviews/${productId}`);
export const createReviewApi = (data) => api.post('/reviews', data);
export const updateReviewApi = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReviewApi = (id) => api.delete(`/reviews/${id}`);

// ---------- Wishlist / Users ----------
export const fetchWishlist = () => api.get('/users/wishlist');
export const addToWishlistApi = (productId) => api.post(`/users/wishlist/${productId}`);
export const removeFromWishlistApi = (productId) => api.delete(`/users/wishlist/${productId}`);
export const fetchAllUsers = () => api.get('/users');
export const updateUserApi = (id, data) => api.put(`/users/${id}`, data);
export const deleteUserApi = (id) => api.delete(`/users/${id}`);

// ---------- AI Barista ----------
export const chatWithBaristaApi = (message, history) => api.post('/ai/barista', { message, history });
