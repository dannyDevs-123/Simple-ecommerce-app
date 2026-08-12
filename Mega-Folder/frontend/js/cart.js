let cart = { items: [], totalAmount: 0 };

function purgeInvalidCartStorage() {
  try {
    const raw = localStorage.getItem('cart');
    
    // Handle null or missing cart in localStorage
    if (!raw) {
      cart = { items: [], totalAmount: 0 };
      // Hide any loading spinner that might be stuck
      const overlay = $('.loading-overlay');
      if (overlay) overlay.style.display = 'none';
      return;
    }

    const parsed = JSON.parse(raw);
    
    // Validate parsed cart structure
    if (!parsed || !Array.isArray(parsed.items)) {
      localStorage.removeItem('cart');
      cart = { items: [], totalAmount: 0 };
      // Hide any loading spinner that might be stuck
      const overlay = $('.loading-overlay');
      if (overlay) overlay.style.display = 'none';
      return;
    }

    // Filter out invalid items
    const validItems = parsed.items.filter(item => item && item.product);
    if (validItems.length !== parsed.items.length) {
      localStorage.setItem('cart', JSON.stringify({ ...parsed, items: validItems }));
    }
    
    // Update cart object
    cart = { ...parsed, items: validItems };
  } catch (error) {
    // Handle JSON parse errors or other exceptions
    localStorage.removeItem('cart');
    cart = { items: [], totalAmount: 0 };
    // Hide any loading spinner that might be stuck
    const overlay = $('.loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}

function getValidCartItems() {
  if (!cart || !Array.isArray(cart.items)) return [];
  return cart.items.filter(item => item && item.product);
}

document.addEventListener('DOMContentLoaded', () => {
  purgeInvalidCartStorage();
  updateCartBadge();

  // Cart page
  if (window.location.pathname.includes('cart.html')) {
    if (!isLoggedIn()) {
      showToast('Please log in to view your cart', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }
    loadCart();
  }

  // Checkout page
  if (window.location.pathname.includes('checkout.html')) {
    if (!isLoggedIn()) {
      showToast('Please log in to checkout', 'warning');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }
    loadCheckout();
  }
});

async function loadCart() {
  showLoading();
  try {
    cart = await API.getCart();
    cart.items = getValidCartItems();
    renderCart();
  } catch (error) {
    showToast(error.message, 'error');
    // Ensure cart is initialized even if API call fails
    cart = { items: [], totalAmount: 0 };
    renderCart();
  } finally {
    // Always hide loading spinner, even in error cases
    hideLoading();
  }
}

function renderCart() {
  const container = $('#cartItems');
  const summary = $('#cartSummary');
  const validCartItems = getValidCartItems();

  if (!validCartItems.length) {
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 4rem;">
          <div class="icon" style="font-size: 4rem;">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet</p>
          <a href="index.html" class="auth-btn" style="display: inline-block; margin-top: 1rem;">Continue Shopping</a>
        </div>
      `;
    }
    if (summary) summary.style.display = 'none';
    updateCartBadge();
    return;
  }

  if (container) {
    container.innerHTML = validCartItems.map(item => {
      const product = item?.product ?? {};
      const imageUrl = getProductImage(product?.images?.[0] ?? product?.image, product?.category);
      const quantity = Number(item?.quantity ?? 0);
      const price = Number(item?.price ?? product?.price ?? 0);
      const itemId = item?._id ?? '';

      return `
        <div class="cart-item" data-id="${itemId}">
          <img src="${imageUrl}" alt="${product?.name ?? 'Product'}" loading="lazy" onerror="this.onerror=null;this.src='${getProductFallbackImage(product?.category)}'">
          <div class="cart-item-info">
            <div class="category">${product?.category ?? 'General'}</div>
            <h3>${product?.name ?? 'Product'}</h3>
            <div class="price">${formatPrice(price)}</div>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button onclick="updateQuantity('${itemId}', ${quantity - 1})">−</button>
              <span>${quantity}</span>
              <button onclick="updateQuantity('${itemId}', ${quantity + 1})">+</button>
            </div>
            <button class="remove-btn" onclick="removeItem('${itemId}')">
              🗑 Remove
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (summary) {
    const subtotal = Number(cart?.totalAmount ?? 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    summary.innerHTML = `
      <h2>Order Summary</h2>
      <div class="summary-row">
        <span>Subtotal (${validCartItems.length} items)</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (8%)</span>
        <span>${formatPrice(tax)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${formatPrice(total)}</span>
      </div>
      <button class="checkout-btn" onclick="window.location.href='checkout.html'">Proceed to Checkout</button>
      <a href="index.html" class="continue-shopping">← Continue Shopping</a>
    `;
    summary.style.display = 'block';
  }

  updateCartBadge();
}

function updateCartBadge() {
  const badge = $('#cartBadge');
  if (!badge) return;

  const validCartItems = getValidCartItems();
  const count = validCartItems.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

async function addToCart(productId, quantity = 1) {
  if (!isLoggedIn()) {
    showToast('Please log in to add items to cart', 'warning');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  try {
    cart = await API.addToCart({ productId, quantity });
    updateCartBadge();
    showToast('Added to cart!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function updateQuantity(itemId, quantity) {
  try {
    cart = await API.updateCartItem(itemId, { quantity });
    renderCart();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function removeItem(itemId) {
  try {
    cart = await API.removeFromCart(itemId);
    renderCart();
    showToast('Item removed from cart', 'info');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Checkout
async function loadCheckout() {
  showLoading();
  try {
    cart = await API.getCart();
    cart.items = getValidCartItems();
    if (!cart?.items?.length) {
      showToast('Your cart is empty', 'warning');
      window.location.href = 'cart.html';
      return;
    }
    renderCheckoutSummary();

    // Pre-fill shipping if available
    const user = getUser();
    if (user?.address) {
      const streetField = $('#shippingStreet');
      const cityField = $('#shippingCity');
      const stateField = $('#shippingState');
      const zipField = $('#shippingZip');

      if (streetField) streetField.value = user?.address?.street ?? '';
      if (cityField) cityField.value = user?.address?.city ?? '';
      if (stateField) stateField.value = user?.address?.state ?? '';
      if (zipField) zipField.value = user?.address?.zipCode ?? '';
    }
  } catch (error) {
    showToast(error.message, 'error');
    // Ensure cart is initialized even if API call fails
    cart = { items: [], totalAmount: 0 };
  } finally {
    // Always hide loading spinner, even in error cases
    hideLoading();
  }
}

function renderCheckoutSummary() {
  const container = $('#checkoutSummary');
  if (!container) return;

  const validCartItems = getValidCartItems();
  const subtotal = Number(cart?.totalAmount ?? 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  container.innerHTML = `
    <h2>Order Summary</h2>
    ${validCartItems.map(item => {
      const product = item?.product ?? {};
      const imageUrl = getProductImage(product?.images?.[0] ?? product?.image, product?.category);
      const quantity = Number(item?.quantity ?? 0);
      const price = Number(item?.price ?? product?.price ?? 0);

      return `
        <div style="display: flex; gap: 0.75rem; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--gray-100);">
          <img src="${imageUrl}" loading="lazy" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius);" alt="${product?.name ?? 'Product'}" onerror="this.onerror=null;this.src='${getProductFallbackImage(product?.category)}'">
          <div style="flex: 1;">
            <div style="font-size: 0.85rem; font-weight: 600;">${product?.name ?? 'Product'}</div>
            <div style="font-size: 0.8rem; color: var(--gray-500);">Qty: ${quantity}</div>
          </div>
          <div style="font-weight: 600;">${formatPrice(price * quantity)}</div>
        </div>
      `;
    }).join('')}
    <div class="summary-row">
      <span>Subtotal</span>
      <span>${formatPrice(subtotal)}</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
    </div>
    <div class="summary-row">
      <span>Tax</span>
      <span>${formatPrice(tax)}</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>${formatPrice(total)}</span>
    </div>
  `;
}

async function placeOrder() {
  const button = document.getElementById('placeOrderBtn');
  const originalButtonText = button?.innerHTML ?? 'Place Order';

  if (!cart?.items?.length) {
    showToast('Your cart is empty or contains invalid items.', 'warning');
    return;
  }

  const user = getUser();
  if (!user) {
    showToast('Please sign in again to place your order.', 'warning');
    return;
  }

  const shippingAddress = {
    firstName: $('#shippingFirstName')?.value?.trim() ?? '',
    lastName: $('#shippingLastName')?.value?.trim() ?? '',
    street: $('#shippingStreet')?.value?.trim() ?? '',
    city: $('#shippingCity')?.value?.trim() ?? '',
    state: $('#shippingState')?.value?.trim() ?? '',
    zipCode: $('#shippingZip')?.value?.trim() ?? '',
    country: 'USA',
    phone: $('#shippingPhone')?.value?.trim() ?? ''
  };

  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'credit_card';

  if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.street ||
      !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
    showToast('Please fill in all shipping fields', 'warning');
    return;
  }

  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></span>Placing Order...';
  }

  showLoading();
  try {
    const order = await API.createOrder({
      shippingAddress,
      paymentMethod,
      userId: user?.id ?? user?._id ?? null,
      cartId: cart?._id ?? null
    });
    showToast('Order placed successfully!', 'success');
    const orderId = order?.order?._id ?? order?._id ?? null;
    setTimeout(() => {
      window.location.href = orderId
        ? `order-confirmation.html?id=${orderId}`
        : 'order-confirmation.html';
    }, 1000);
  } catch (error) {
    showToast(error?.message ?? 'Unable to place order right now. Please try again.', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = originalButtonText;
    }
    hideLoading();
  }
}
