 import axios from 'axios';
 
 const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
 
 const api = axios.create({
   baseURL: API_BASE_URL,
   headers: {
     'Content-Type': 'application/json',
   },
 });
 
 // Products API
 export const productsAPI = {
   getAll: () => api.get('/products'),
   getById: (id) => api.get(`/products/${id}`),
   getByCategory: (category) => api.get(`/products/category/${category}`),
 };
 
 // Cart API
 export const cartAPI = {
   get: (userId) => api.get(`/cart/${userId}`),
   addItem: (data) => api.post('/cart/add', data),
   updateItem: (data) => api.put('/cart/update', data),
   removeItem: (data) => api.delete('/cart/remove', { data }),
   clear: (userId) => api.delete(`/cart/clear/${userId}`),
 };
 
 // Orders API
 export const ordersAPI = {
   create: (data) => api.post('/orders/create', data),
   getById: (id) => api.get(`/orders/${id}`),
   getByUserId: (userId) => api.get(`/orders/user/${userId}`),
   updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
   validateCoupon: (data) => api.post('/orders/validate-coupon', data),
 };
 
 // Payment API
 export const paymentAPI = {
   // Get payment gateway keys
   getKeys: () => api.get('/payment/keys'),
   
   // Stripe APIs
   createStripePaymentIntent: (data) => api.post('/payment/stripe/create-payment-intent', data),
   confirmStripePayment: (data) => api.post('/payment/stripe/confirm-payment', data),
   
   // Razorpay APIs
   createRazorpayOrder: (data) => api.post('/payment/razorpay/create-order', data),
   verifyRazorpayPayment: (data) => api.post('/payment/razorpay/verify-payment', data),
   
   // Common APIs
   getStatus: (paymentId) => api.get(`/payment/status/${paymentId}`),
   refund: (data) => api.post('/payment/refund', data),
 };
 
 // Delivery API
 export const deliveryAPI = {
   getAll: () => api.get('/delivery'),
   getAvailable: () => api.get('/delivery/available'),
   getById: (id) => api.get(`/delivery/${id}`),
   updateAvailability: (id, data) => api.put(`/delivery/${id}/availability`, data),
   completeDelivery: (orderId) => api.put(`/delivery/complete/${orderId}`),
   trackOrder: (orderId) => api.get(`/delivery/track/${orderId}`),
 };
 
 export default api;
