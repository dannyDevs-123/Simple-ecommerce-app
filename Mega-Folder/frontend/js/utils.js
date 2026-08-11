function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

const IMAGE_QUERY = 'w=400&q=75&auto=format';

function optimizeImageUrl(url) {
  if (!url || typeof url !== 'string') return url;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('unsplash.com')) return url;

    parsed.searchParams.set('w', '400');
    parsed.searchParams.set('q', '75');
    parsed.searchParams.set('auto', 'format');
    return parsed.toString();
  } catch (error) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${IMAGE_QUERY}`;
  }
}

const categoryFallbackImages = {
  Electronics: optimizeImageUrl('https://images.unsplash.com/photo-1518770660439-4636190af475'),
  Clothing: optimizeImageUrl('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'),
  Books: optimizeImageUrl('https://images.unsplash.com/photo-1512820790803-83ca734da794'),
  'Home & Garden': optimizeImageUrl('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
  Sports: optimizeImageUrl('https://images.unsplash.com/photo-1546519638-68e109498ffc'),
  Toys: optimizeImageUrl('https://images.unsplash.com/photo-1516627145497-ae6968895b74'),
  Food: optimizeImageUrl('https://images.unsplash.com/photo-1547592180-85f173990554'),
  Health: optimizeImageUrl('https://images.unsplash.com/photo-1571781926291-c477ebfd024b')
};

function getProductFallbackImage(category = '') {
  return categoryFallbackImages[category] || optimizeImageUrl('https://images.unsplash.com/photo-1524758631624-e2822e304c36');
}

function getProductImage(image, category = '', fallback = getProductFallbackImage(category)) {
  if (!image || typeof image !== 'string' || !image.trim()) {
    return fallback;
  }

  return optimizeImageUrl(image.trim()) || fallback;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function generateStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '&#9733;';
  if (half) html += '&#189;';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '&#9734;';
  return html;
}

function showToast(message, type = 'info') {
  let container = $('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '&#10003;',
    error: '&times;',
    warning: '&#9888;',
    info: '&#8505;'
  };

  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showLoading() {
  let overlay = $('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideLoading() {
  const overlay = $('.loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
}

function getAuthToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }

    return token;
  } catch (error) {
    return null;
  }
}

function getUser() {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser || rawUser === 'undefined' || rawUser === 'null') {
      return null;
    }

    const user = JSON.parse(rawUser);
    if (!user || typeof user !== 'object') {
      clearAuthStorage();
      return null;
    }

    return user;
  } catch (error) {
    clearAuthStorage();
    return null;
  }
}

function setUser(user) {
  if (!user || typeof user !== 'object') {
    clearAuthStorage();
    return;
  }

  const token = typeof user.token === 'string' && user.token.trim()
    ? user.token.trim()
    : getAuthToken();

  const safeUser = { ...user };
  if (token) {
    localStorage.setItem('token', token);
    safeUser.token = token;
  } else {
    localStorage.removeItem('token');
    delete safeUser.token;
  }

  localStorage.setItem('user', JSON.stringify(safeUser));
}

function clearUser() {
  clearAuthStorage();
}

function isLoggedIn() {
  return !!getAuthToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    showToast('Please log in to continue', 'warning');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return false;
  }
  return true;
}

