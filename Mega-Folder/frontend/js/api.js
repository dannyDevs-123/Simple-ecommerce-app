const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://ecommerce-app-ujet.onrender.com/api';

async function api(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw new Error(data?.message ?? 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
}

const API = {
  // Auth
  register: (data) => api('/auth/register', { method: 'POST', body: data }),
  login: (data) => api('/auth/login', { method: 'POST', body: data }),
  getMe: () => api('/auth/me'),
  updateProfile: (data) => api('/auth/profile', { method: 'PUT', body: data }),

  // Products
  getProducts: (params = '') => api(`/products?${params}`),
  getProduct: (id) => api(`/products/${id}`),
  getCategories: () => api('/products/categories'),
  getProductsByCategory: (category, params = '') => api(`/products/category/${category}?${params}`),
  searchProducts: (keyword) => api(`/products?keyword=${encodeURIComponent(keyword)}`),
  createProduct: (data) => api('/products', { method: 'POST', body: data }),
  createReview: (id, data) => api(`/products/${id}/reviews`, { method: 'POST', body: data }),

  // Cart
  getCart: () => api('/cart'),
  addToCart: (data) => api('/cart/items', { method: 'POST', body: data }),
  updateCartItem: (itemId, data) => api(`/cart/items/${itemId}`, { method: 'PUT', body: data }),
  removeFromCart: (itemId) => api(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => api('/cart', { method: 'DELETE' }),

  // Orders
  createOrder: (data) => api('/orders', { method: 'POST', body: data }),
  getOrders: () => api('/orders'),
  getOrder: (id) => api(`/orders/${id}`)
};
