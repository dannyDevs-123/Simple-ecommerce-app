document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  bindLogoutButtons();

  const registerForm = $('#registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const data = {
        username: $('#username').value.trim(),
        email: $('#email').value.trim(),
        password: $('#password').value,
        firstName: $('#firstName').value.trim(),
        lastName: $('#lastName').value.trim()
      };

      if (!validateRegister(data)) return;

      showLoading();
      try {
        const result = await API.register(data);
        setUser(result);
        showToast('Account created successfully!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        hideLoading();
      }
    });
  }

  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const data = {
        email: $('#email').value.trim(),
        password: $('#password').value
      };

      if (!data.email || !data.password) {
        showFieldError('email', 'Please fill in all fields');
        return;
      }

      showLoading();
      try {
        const result = await API.login(data);
        setUser(result);
        showToast('Welcome back!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        hideLoading();
      }
    });
  }

  const profileForm = $('#profileForm');
  if (profileForm && isLoggedIn()) {
    loadProfile();
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        firstName: $('#firstName').value.trim(),
        lastName: $('#lastName').value.trim(),
        phone: $('#phone').value.trim(),
        address: {
          street: $('#street').value.trim(),
          city: $('#city').value.trim(),
          state: $('#state').value.trim(),
          zipCode: $('#zipCode').value.trim(),
          country: $('#country').value.trim()
        }
      };

      showLoading();
      try {
        const result = await API.updateProfile(data);
        const user = getUser();
        setUser({ ...user, ...result });
        showToast('Profile updated successfully!', 'success');
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        hideLoading();
      }
    });
  }

  const ordersTab = $('#ordersTab');
  if (ordersTab && isLoggedIn()) {
    loadOrders();
  }
});

function validateRegister(data) {
  let valid = true;

  if (data.username.length < 3) {
    showFieldError('username', 'Username must be at least 3 characters');
    valid = false;
  }

  if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    showFieldError('email', 'Please enter a valid email');
    valid = false;
  }

  if (data.password.length < 6) {
    showFieldError('password', 'Password must be at least 6 characters');
    valid = false;
  }

  if ($('#confirmPassword') && data.password !== $('#confirmPassword').value) {
    showFieldError('confirmPassword', 'Passwords do not match');
    valid = false;
  }

  return valid;
}

function showFieldError(fieldId, message) {
  const field = $(`#${fieldId}`);
  if (field) {
    field.classList.add('error');
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) errorEl.textContent = message;
  }
}

function clearErrors() {
  $$('.error-message').forEach(el => el.textContent = '');
  $$('input.error').forEach(el => el.classList.remove('error'));
}

function updateNavbar() {
  const user = getUser();
  const authSection = $('#authSection');
  const userSection = $('#userSection');

  if (authSection) authSection.style.display = user ? 'none' : 'flex';
  if (userSection) {
    userSection.style.display = user ? 'flex' : 'none';
    const usernameEl = $('#navUsername');
    if (usernameEl && user) usernameEl.textContent = user?.username ?? 'User';
  }
}

function bindLogoutButtons() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.removeEventListener('click', handleLogoutClick);
    button.addEventListener('click', handleLogoutClick);
  });
}

function handleLogoutClick(event) {
  event.preventDefault();
  logout();
}

function logout() {
  clearUser();
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'index.html', 500);
}

function toggleUserMenu() {
  const dropdown = $('#userDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  const dropdown = $('#userDropdown');
  const btn = $('#userMenuBtn');
  if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

async function loadProfile() {
  try {
    const user = await API.getMe();
    $('#firstName').value = user?.firstName ?? '';
    $('#lastName').value = user?.lastName ?? '';
    $('#email').value = user?.email ?? '';
    $('#phone').value = user?.phone ?? '';

    if (user?.address) {
      $('#street').value = user?.address?.street ?? '';
      $('#city').value = user?.address?.city ?? '';
      $('#state').value = user?.address?.state ?? '';
      $('#zipCode').value = user?.address?.zipCode ?? '';
      $('#country').value = user?.address?.country ?? 'USA';
    }

    const avatarEl = $('#profileAvatar');
    if (avatarEl && user?.firstName) {
      avatarEl.textContent = user.firstName[0].toUpperCase();
    }

    const nameEl = $('#profileName');
    if (nameEl) nameEl.textContent = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.username || 'Account';

    const emailEl = $('#profileEmail');
    if (emailEl) emailEl.textContent = user?.email ?? '';
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadOrders() {
  try {
    const orders = await API.getOrders();
    const container = $('#ordersList');
    if (!container) return;

    const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];

    if (safeOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here</p>
        </div>
      `;
      return;
    }

    container.innerHTML = safeOrders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">Order #${order?._id?.slice(-8)?.toUpperCase() ?? 'PENDING'}</span>
          <span class="order-status status-${order?.status ?? 'pending'}">${order?.status ?? 'pending'}</span>
        </div>
        <div class="order-items">
          ${(Array.isArray(order?.items) ? order.items : []).map(item => `
            <img src="${item?.image ?? 'https://via.placeholder.com/60'}" alt="${item?.name ?? 'Product'}" class="order-item-img" loading="lazy" onerror="this.src='https://via.placeholder.com/60'">
            <div class="order-item-info">
              <h4>${item?.name ?? 'Product'}</h4>
              <p>Qty: ${item?.quantity ?? 0} × ${formatPrice(Number(item?.price ?? 0))}</p>
            </div>
          `).join('')}
        </div>
        <div class="order-total">Total: ${formatPrice(Number(order?.totalPrice ?? 0))}</div>
        <div style="font-size: 0.8rem; color: var(--gray-400); margin-top: 0.5rem;">
          ${order?.createdAt ? formatDate(order.createdAt) : ''}
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
