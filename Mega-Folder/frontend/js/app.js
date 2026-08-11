let currentPage = 1;
let currentCategory = '';
let currentSort = '';
const heroMotionState = {
  entranceAnimated: false,
  statsAnimated: false
};

document.addEventListener('DOMContentLoaded', () => {
  initializeInfoModals();
  initializeHero();

  if (document.getElementById('productGrid')) {
    loadProducts();
    loadCategories();

    document.getElementById('searchInput')?.addEventListener('input', debounce((e) => {
      currentPage = 1;
      loadProducts(e.target.value);
    }, 400));

    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      loadProducts();
    });
  }

  if (document.getElementById('productDetail')) {
    loadProductDetails();
  }
});

function initializeInfoModals() {
  const modalBackdrop = document.getElementById('infoModalBackdrop');
  const modalTitle = document.getElementById('infoModalTitle');
  const modalBody = document.getElementById('infoModalBody');
  const closeButton = document.getElementById('infoModalClose');

  if (!modalBackdrop || !modalTitle || !modalBody || !closeButton) return;

  const modalContent = {
    contact: {
      title: 'Contact Us',
      content: `
        <div class="info-modal-section">
          <p>We're here to help with order questions, account issues, and product support.</p>
        </div>
        <div class="info-modal-list">
          <div><strong>Email:</strong> support@shopright.com</div>
          <div><strong>Hotline:</strong> +1 (800) 555-0147</div>
          <div><strong>Hours:</strong> Mon-Sat, 8:00 AM - 8:00 PM</div>
        </div>
        <form class="info-modal-form">
          <label>
            Name
            <input type="text" placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Message
            <textarea rows="4" placeholder="Tell us how we can help."></textarea>
          </label>
          <button type="button" class="info-modal-submit">Send message</button>
        </form>
      `
    },
    shipping: {
      title: 'Shipping Info',
      content: `
        <div class="info-modal-section">
          <p>We offer fast, trackable delivery options for most orders.</p>
        </div>
        <div class="info-modal-grid">
          <div class="info-modal-card">
            <strong>Standard Delivery</strong>
            <span>2-4 business days</span>
            <em>Free on orders over $50</em>
          </div>
          <div class="info-modal-card">
            <strong>Express Delivery</strong>
            <span>1 business day</span>
            <em>$12.99</em>
          </div>
        </div>
        <div class="info-modal-list">
          <div><strong>Shipping rates:</strong> Starts at $5.99</div>
          <div><strong>Tracking:</strong> Available for every completed order</div>
          <div><strong>International:</strong> Delivered in 5-10 business days</div>
        </div>
      `
    },
    returns: {
      title: 'Returns',
      content: `
        <div class="info-modal-section">
          <p>We make returns easy within 30 days of delivery for eligible items.</p>
        </div>
        <div class="info-modal-list">
          <div><strong>Return window:</strong> 30 days from delivery date</div>
          <div><strong>Condition:</strong> Item must be unused, unopened, and in original packaging</div>
          <div><strong>Refund timing:</strong> Processed within 5-7 business days after inspection</div>
        </div>
        <ol class="info-modal-steps">
          <li>Open your account and select the order.</li>
          <li>Choose the item and request a return.</li>
          <li>Print the prepaid label or use in-store drop-off.</li>
          <li>Track the refund once the item is received.</li>
        </ol>
      `
    },
    faq: {
      title: 'Frequently Asked Questions',
      content: `
        <div class="faq-list">
          <details open>
            <summary>How can I track my order?</summary>
            <p>Once your order ships, a tracking number is emailed to you and appears in your profile order history.</p>
          </details>
          <details>
            <summary>What payment methods do you accept?</summary>
            <p>We accept Visa, MasterCard, American Express, PayPal, and Apple Pay for secure checkout.</p>
          </details>
          <details>
            <summary>How do I create an account?</summary>
            <p>Click Sign In, then Register, and complete your profile details to manage orders and saved preferences.</p>
          </details>
          <details>
            <summary>Can I update my shipping address after placing an order?</summary>
            <p>Yes, as long as the order has not already been processed for dispatch. You can update it from your profile or support team.</p>
          </details>
        </div>
      `
    }
  };

  const openInfoModal = (type) => {
    const content = modalContent[type];
    if (!content) return;

    modalTitle.textContent = content.title;
    modalBody.innerHTML = content.content;
    modalBackdrop.classList.add('visible');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeInfoModal = () => {
    modalBackdrop.classList.remove('visible');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  document.querySelectorAll('[data-info-modal]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openInfoModal(link.dataset.infoModal);
    });
  });

  closeButton.addEventListener('click', closeInfoModal);
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) {
      closeInfoModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalBackdrop.classList.contains('visible')) {
      closeInfoModal();
    }
  });
}

async function loadProducts(search = '') {
  showLoading();
  try {
    let params = `page=${currentPage}`;
    if (currentSort) params += `&sort=${currentSort}`;
    if (search) params += `&keyword=${encodeURIComponent(search)}`;
    if (currentCategory) params += `&category=${encodeURIComponent(currentCategory)}`;

    const data = await API.getProducts(params);
    renderProducts(data.products);
    renderPagination(data.page, data.pages);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const safeProducts = (Array.isArray(products) ? products : []).filter(Boolean);

  if (safeProducts.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="icon"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></div>
        <h3>No products found</h3>
        <p>Try adjusting your search or category</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = safeProducts.map(p => {
    const product = p ?? {};
    const productId = product._id ?? '';
    const productName = product.name ?? 'Untitled Product';
    const category = product.category ?? 'General';
    const price = Number(product.price ?? 0);
    const rating = Number(product.rating ?? 0);
    const reviewCount = Number(product.numReviews ?? 0);
    const stock = Number(product.stock ?? 0);

    return `
      <div class="product-card">
        <div class="product-image">
          <img src="${getProductImage(product.images?.[0] ?? product.image, category)}" alt="${productName}" loading="lazy" onerror="this.onerror=null;this.src='${getProductFallbackImage(category)}'">
          ${Number(product.discount ?? 0) > 0 ? `<span class="product-badge">-${product.discount}%</span>` : ''}
        </div>
        <div class="product-info">
          <div class="product-category">${category}</div>
          <h3 class="product-name"><a href="product-details.html?id=${productId}">${productName}</a></h3>
          <div class="product-rating">
            <span class="stars">${generateStars(rating)}</span>
            <span class="rating-count">(${reviewCount})</span>
          </div>
          <div class="product-price">
            <span class="price">${formatPrice(price)}</span>
            ${stock === 0 ? '<span style="color: var(--danger); font-size: 0.85rem;">Out of stock</span>' : ''}
          </div>
          <button class="add-to-cart" onclick="addToCart('${productId}', 1)" ${stock === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPagination(page, pages) {
  const container = document.getElementById('pagination');
  if (!container || pages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = `<button ${page === 1 ? 'disabled' : ''} data-page="${page - 1}"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Prev</button>`;

  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
      html += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === page - 2 || i === page + 2) {
      html += `<span style="padding: 0.5rem;">...</span>`;
    }
  }

  html += `<button ${page === pages ? 'disabled' : ''} data-page="${page + 1}">Next <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>`;
  container.innerHTML = html;

  container.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      changePage(Number(btn.dataset.page));
    });
  });
}

async function changePage(page) {
  currentPage = page;
  await loadProducts();
  const productsSection = document.getElementById('products');
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function loadCategories() {
  try {
    const categories = await API.getCategories();
    const grid = document.getElementById('categoryGrid');
    const nav = document.getElementById('categoryNav');

    const icons = {
      Electronics: 'fa-tv',
      Clothing: 'fa-shirt',
      Books: 'fa-book',
      'Home & Garden': 'fa-house',
      Sports: 'fa-person-running',
      Toys: 'fa-puzzle-piece',
      Food: 'fa-utensils',
      Health: 'fa-heart-pulse'
    };

    if (grid) {
      grid.innerHTML = categories.map(c => `
        <div class="category-card" onclick="filterCategory('${c}')">
          <div class="icon"><i class="fa-solid ${icons[c] || 'fa-box'}" aria-hidden="true"></i></div>
          <span>${c}</span>
        </div>
      `).join('');
    }

    if (nav) {
      nav.innerHTML = `<a href="#products" class="active" onclick="filterCategory(''); scrollToProductsSection(); return false;">All</a>` +
        categories.map(c => `<a href="#products" onclick="filterCategory('${c}'); scrollToProductsSection(); return false;">${c}</a>`).join('');
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

function scrollToProductsSection() {
  const productsSection = document.getElementById('products');
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterCategory(category) {
  currentCategory = category;
  currentPage = 1;
  loadProducts();
  scrollToProductsSection();

  document.querySelectorAll('.category-card').forEach(el => {
    el.style.borderColor = el.querySelector('span')?.textContent === category ? 'var(--primary)' : 'transparent';
  });

  document.querySelectorAll('#categoryNav a').forEach(el => {
    el.classList.toggle('active', el.textContent === (category || 'All'));
  });
}

async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  showLoading();
  try {
    const product = await API.getProduct(id);
    renderProductDetail(product);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

function renderProductDetail(product) {
  const container = document.getElementById('productDetail');
  if (!container || !product) return;

  const productId = product?._id ?? '';
  const productName = product?.name ?? 'Unnamed product';
  const category = product?.category ?? 'General';
  const price = Number(product?.price ?? 0);
  const rating = Number(product?.rating ?? 0);
  const reviewCount = Number(product?.numReviews ?? 0);
  const stock = Number(product?.stock ?? 0);

  container.innerHTML = `
    <div class="product-detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin: 2rem 0;">
      <div>
        <img src="${getProductImage(product?.images?.[0] ?? product?.image, category)}" alt="${productName}" loading="lazy" style="width: 100%; border-radius: var(--radius-lg); background: var(--gray-100);" onerror="this.onerror=null;this.src='${getProductFallbackImage(category)}'">
      </div>
      <div>
        <div style="color: var(--primary); font-weight: 600; text-transform: uppercase; font-size: 0.85rem; margin-bottom: 0.5rem;">${category}</div>
        <h1 style="font-size: 2rem; margin-bottom: 0.75rem;">${productName}</h1>
        <div class="product-rating" style="margin-bottom: 1rem;">
          <span class="stars">${generateStars(rating)}</span>
          <span class="rating-count">(${reviewCount} reviews)</span>
        </div>
        <div class="product-price" style="margin-bottom: 1.5rem;">
          <span class="price" style="font-size: 1.75rem;">${formatPrice(price)}</span>
        </div>
        <p style="color: var(--gray-600); margin-bottom: 1.5rem; line-height: 1.7;">${product?.description ?? ''}</p>
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="quantity-control">
            <button onclick="const el=document.getElementById('qty'); el.value=Math.max(1,parseInt(el.value)-1)">-</button>
            <input id="qty" value="1" style="width: 50px; text-align: center; border: none; font-weight: 600;" readonly>
            <button onclick="const el=document.getElementById('qty'); el.value=parseInt(el.value)+1">+</button>
          </div>
          <button class="add-to-cart" style="flex: 1; padding: 0.75rem 2rem;" onclick="addToCart('${productId}', parseInt(document.getElementById('qty').value))" ${stock === 0 ? 'disabled' : ''}>
            ${stock === 0 ? 'Out of Stock' : '<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> Add to Cart'}
          </button>
        </div>
        <div style="font-size: 0.9rem; color: var(--gray-500);">
          ${stock > 0 ? `&check; In Stock (${stock} available)` : '&times; Out of Stock'}
        </div>
      </div>
    </div>
  `;

  loadRelatedProducts(category, productId);
}

async function loadRelatedProducts(category, excludeId) {
  try {
    const data = await API.getProductsByCategory(category, 'page=1');
    const related = (Array.isArray(data?.products) ? data.products : []).filter(p => p && p._id !== excludeId).slice(0, 4);
    const container = document.getElementById('relatedProducts');
    if (!container || related.length === 0) return;

    container.innerHTML = `
      <h2 class="section-title">Related Products</h2>
      <div class="product-grid">${related.map(p => {
        const product = p ?? {};
        const productId = product._id ?? '';
        const productName = product.name ?? 'Related product';
        const categoryName = product.category ?? 'General';
        const price = Number(product.price ?? 0);
        const stock = Number(product.stock ?? 0);

        return `
          <div class="product-card">
            <div class="product-image">
              <img src="${getProductImage(product.images?.[0] ?? product.image, categoryName)}" alt="${productName}" loading="lazy" onerror="this.onerror=null;this.src='${getProductFallbackImage(categoryName)}'">
            </div>
            <div class="product-info">
              <div class="product-category">${categoryName}</div>
              <h3 class="product-name"><a href="product-details.html?id=${productId}">${productName}</a></h3>
              <div class="product-price"><span class="price">${formatPrice(price)}</span></div>
              <button class="add-to-cart" onclick="addToCart('${productId}', 1)" ${stock === 0 ? 'disabled' : ''}><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> Add to Cart</button>
            </div>
          </div>
        `;
      }).join('')}</div>
    `;
  } catch (e) { console.error(e); }
}

// ===== Hero Section Interactions =====

function initializeHero() {
  const heroSection = document.querySelector('.hero-section.hero-premium');
  if (!heroSection) return;

  const heroImage = heroSection.querySelector('.hero-visual img');
  const exploreBtn = heroSection.querySelector('#heroExploreBtn');

  if (exploreBtn) {
    exploreBtn.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToProductsSection();
    });
  }

  if (heroImage) {
    const fallbackSrc = heroImage.dataset.fallback;
    const handleImageError = () => {
      if (fallbackSrc && heroImage.src !== fallbackSrc) {
        heroImage.src = fallbackSrc;
        return;
      }
      heroImage.classList.add('is-hidden');
    };

    if (heroImage.complete && heroImage.naturalWidth === 0) {
      handleImageError();
    } else {
      heroImage.addEventListener('error', handleImageError);
    }
  }

  const runEntranceAnimation = () => {
    if (heroMotionState.entranceAnimated) return;
    heroMotionState.entranceAnimated = true;
    heroSection.classList.add('is-visible');
  };

  const animateHeroStats = () => {
    if (heroMotionState.statsAnimated) return;
    heroMotionState.statsAnimated = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    heroSection.querySelectorAll('.stat-number[data-count]').forEach((stat) => {
      const target = Number(stat.dataset.count || 0);
      if (!Number.isFinite(target) || target <= 0) return;

      if (prefersReducedMotion) {
        stat.textContent = `${target.toLocaleString()}${stat.dataset.suffix || ''}`;
        return;
      }

      animateCounter(stat, target, stat.dataset.suffix || '');
    });
  };

  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      runEntranceAnimation();
      animateHeroStats();
      observer.disconnect();
    }, {
      threshold: 0.25,
      rootMargin: '80px 0px'
    });

    heroObserver.observe(heroSection);
  } else {
    runEntranceAnimation();
    animateHeroStats();
  }
}

function animateCounter(element, target, suffix = '', duration = 1800) {
  if (!element) return;

  let current = 0;
  const frameDuration = 16;
  const increment = Math.max(1, target / Math.max(1, duration / frameDuration));

  const timer = window.setInterval(() => {
    current += increment;
    if (current >= target) {
      window.clearInterval(timer);
      element.textContent = `${target.toLocaleString()}${suffix}`;
      return;
    }

    element.textContent = `${Math.floor(current).toLocaleString()}${suffix}`;
  }, frameDuration);
}


