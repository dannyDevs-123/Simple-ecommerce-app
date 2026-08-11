document.addEventListener('DOMContentLoaded', () => {
  const user = getAdminUser();
  const token = localStorage.getItem('token');
 /*
  if (!user || !user.isAdmin || !token) {
    alert('Access Denied');
    window.location.href = 'login.html';
    return;
  }
*/
  const productForm = $('#productForm');
  const ordersTableBody = $('#ordersTableBody');

  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  loadOrders();

  async function handleProductSubmit(event) {
    event.preventDefault();

    const payload = {
      name: $('#name').value.trim(),
      description: $('#description').value.trim(),
      price: Number($('#price').value),
      category: $('#category').value.trim(),
      imageUrl: $('#imageUrl').value.trim(),
      stock: Number($('#stock').value)
    };

    if (!payload.name || !payload.description || !payload.category || !payload.imageUrl) {
      showToast('Please complete all product fields.', 'warning');
      return;
    }

    try {
      showLoading();
      await API.createProduct(payload);
      showToast('Product added successfully.', 'success');
      productForm.reset();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      hideLoading();
    }
  }

  async function loadOrders() {
    if (!ordersTableBody) return;

    try {
      const orders = await API.getOrders();

      if (!orders.length) {
        ordersTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="table-empty">No orders have been placed yet.</td>
          </tr>
        `;
        return;
      }

      ordersTableBody.innerHTML = orders.map((order) => {
        const customer = formatCustomer(order.user);
        const items = (order.items || []).map((item) => {
          const quantity = item.quantity ? ` x${item.quantity}` : '';
          return `${escapeHtml(item.name || 'Item')}${quantity}`;
        }).join('<br>');

        return `
          <tr>
            <td>
              <div class="customer-cell">
                <strong>${escapeHtml(customer.name)}</strong>
                <span>${escapeHtml(customer.email)}</span>
              </div>
            </td>
            <td>${items || 'No items listed'}</td>
            <td>${formatPrice(order.totalPrice || 0)}</td>
            <td><span class="order-status status-${escapeHtml(order.status || 'pending')}">${escapeHtml(order.status || 'pending')}</span></td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="table-empty">${escapeHtml(error.message)}</td>
        </tr>
      `;
    }
  }
});

function getAdminUser() {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    return null;
  }
}

function formatCustomer(user) {
  if (!user || typeof user !== 'object') {
    return { name: 'Unknown customer', email: 'No email available' };
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return {
    name: fullName || user.username || 'Unknown customer',
    email: user.email || 'No email available'
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
