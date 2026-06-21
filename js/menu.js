/* ===========================================
   PIZZIRIA BLIBLA - Frontend-only Menu
   - localStorage.products only
   - stable delegated add-to-cart
   - single init/render/listener flow
   =========================================== */

(function () {
  'use strict';

  const menuGrid = document.getElementById('menuGrid');
  const menuEmpty = document.getElementById('menuEmpty');
  const searchInput = document.getElementById('menuSearch');
  const popularGrid = document.getElementById('popularGrid');
  const bestSellersGrid = document.getElementById('bestSellersGrid');
  const recommendedGrid = document.getElementById('recommendedGrid');
  const resultsCount = document.getElementById('resultsCount');
  const categorySelect = document.getElementById('menuCategory');
  const badgeSelect = document.getElementById('menuBadge');

  let currentFilters = {
    search: '',
    category: 'all',
    badge: 'all'
  };

  const MENU_GUARDS = {
    inited: '0',
    rendered: '0',
    delegatedBound: '0'
  };

  function normalizeIdStr(v) {
    return String(v ?? '').trim();
  }

  function safeScrollReveal() {
    try {
      if (window.ScrollReveal && typeof window.ScrollReveal.revealAll === 'function') {
        window.ScrollReveal.revealAll();
      }
    } catch {}
  }

  function getCartProductQuantities() {
    try {
      const cart = window.STORAGE?.getCart?.() || [];
      const map = new Map();
      for (const it of cart) {
        const id = normalizeIdStr(it?.id);
        const qty = Number(it?.quantity);
        if (!id) continue;
        if (!Number.isFinite(qty) || qty <= 0) continue;
        map.set(id, (map.get(id) || 0) + qty);
      }
      return map;
    } catch {
      return new Map();
    }
  }

  function formatBadge(badge) {
    const badgeClasses = {
      'Best Seller': 'badge badge-best',
      'Hot': 'badge badge-hot',
      'New': 'badge badge-new'
    };
    const cls = badgeClasses[badge] || 'badge badge-promo';
    return `<div class="product-badge"><span class="${cls}">${badge}</span></div>`;
  }

  function getCategoryName(categoryId) {
    try {
      const category = window.PIZZIRIA_DATA?.categories?.find(c => c.id === categoryId);
      return category ? category.name : categoryId;
    } catch {
      return categoryId;
    }
  }

  function getProductById(id) {
    try {
      if (window.STORAGE?.findProductById) {
        return window.STORAGE.findProductById(id);
      }
    } catch {}

    try {
      if (typeof window.getProductById === 'function') return window.getProductById(id);
    } catch {}

    try {
      return window.PIZZIRIA_DATA?.products?.find(p => String(p.id) === String(id)) || null;
    } catch {}
    return null;
  }

  function createProductCard(product) {
    const badgeHtml = product?.badge ? formatBadge(product.badge) : '';
    const categoryName = getCategoryName(product?.category);

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrap">
          ${badgeHtml}
          <img
            class="product-image"
            src="${product.image || ''}"
            alt="${product.name || ''}"
            loading="lazy"
            onerror="this.onerror=null; this.src='${window.getPlaceholderImage ? window.getPlaceholderImage(product.category) : ''}';"
          />
          <div class="product-image-overlay"></div>
          <div class="product-actions">
            <button class="product-action-btn" data-action="view" data-product-id="${product.id}" title="Aperçu rapide">
              👁
            </button>
            <button class="product-action-btn" data-action="favorite" data-product-id="${product.id}" title="Favoris">
              ${window.STORAGE?.isFavorite?.(product.id) ? '❤️' : '🤍'}
            </button>
          </div>
        </div>

        <div class="product-content">
          <span class="product-category">${categoryName}</span>
          <h3 class="product-name">${product.name || ''}</h3>
          <p class="product-description">${product.description || ''}</p>

          <div class="product-footer">
            <div class="product-price">
              ${Number(product.price) || 0}
              <span class="product-price-unit">DH</span>
            </div>

            <button class="btn-add-cart" data-product-id="${product.id}">
              <span class="cart-icon">🛒</span>
              Ajouter
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function computeMenuProducts() {
    const fromStorage = window.STORAGE?.getMenuProductsOrDefault?.();
    const products = Array.isArray(fromStorage) && fromStorage.length ? fromStorage : (window.PIZZIRIA_DATA?.products || []);
    return Array.isArray(products) ? products : [];
  }

  function filterProducts(products, filters) {
    let out = Array.isArray(products) ? [...products] : [];

    if (filters.category && filters.category !== 'all') {
      out = out.filter(p => String(p?.category) === String(filters.category));
    }

    if (filters.badge && filters.badge !== 'all') {
      out = out.filter(p => String(p?.badge) === String(filters.badge));
    }

    const q = String(filters.search || '').trim().toLowerCase();
    if (q) {
      out = out.filter(p => {
        const name = String(p?.name || '').toLowerCase();
        const desc = String(p?.description || '').toLowerCase();
        const ingredients = Array.isArray(p?.ingredients) ? p.ingredients.join(' ').toLowerCase() : '';
        return name.includes(q) || desc.includes(q) || ingredients.includes(q);
      });
    }

    return out;
  }

  function renderMenu() {
    if (!menuGrid) return;

    const productsAll = computeMenuProducts();
    const products = filterProducts(productsAll, currentFilters);

    window.currentFilters = currentFilters;

    if (!products.length) {
      menuGrid.style.display = 'none';
      if (menuEmpty) menuEmpty.style.display = 'block';
      if (resultsCount) resultsCount.textContent = '0';
      return;
    }

    menuGrid.style.display = 'grid';
    if (menuEmpty) menuEmpty.style.display = 'none';
    if (resultsCount) resultsCount.textContent = String(products.length);

    menuGrid.innerHTML = products.map(createProductCard).join('');
    setTimeout(safeScrollReveal, 50);
  }

  function safeTopN(arr, n) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, n);
  }

  function renderFeaturedSections() {
    try {
      const allProducts = computeMenuProducts();
      const favorites = window.STORAGE?.getFavorites?.() || [];
      const cartQtyMap = getCartProductQuantities();

      const scoreBadge = (p) => {
        const b = p?.badge;
        return (b === 'Best Seller' ? 3 : 0) + (b === 'Hot' ? 2 : 0) + (b === 'New' ? 1 : 0);
      };

      const popular = [...allProducts]
        .filter(p => p && p.available !== false)
        .sort((a, b) => (scoreBadge(b) + (cartQtyMap.get(normalizeIdStr(b.id)) || 0)) - (scoreBadge(a) + (cartQtyMap.get(normalizeIdStr(a.id)) || 0)));

      const bestSellers = allProducts.filter(p => p?.badge === 'Best Seller');

      const favProducts = favorites
        .map(id => allProducts.find(p => normalizeIdStr(p?.id) === normalizeIdStr(id)))
        .filter(Boolean);

      const fallbackMix = [...allProducts]
        .filter(p => p && p.available !== false)
        .sort((a, b) => scoreBadge(b) - scoreBadge(a));

      const recommended = favProducts.length
        ? [...favProducts, ...safeTopN(fallbackMix, 12)].filter((p, idx, arr) => arr.findIndex(x => normalizeIdStr(x.id) === normalizeIdStr(p.id)) === idx)
        : safeTopN(fallbackMix, 12);

      // featured renders
      if (popularGrid) popularGrid.innerHTML = safeTopN(popular, 6).map(createProductCard).join('');
      if (bestSellersGrid) bestSellersGrid.innerHTML = safeTopN(bestSellers, 6).map(createProductCard).join('');
      if (recommendedGrid) recommendedGrid.innerHTML = safeTopN(recommended, 6).map(createProductCard).join('');

      setTimeout(safeScrollReveal, 50);
    } catch {}
  }

  function handleAddToCart(btnEl) {
    if (!btnEl) return;
    const productId = normalizeIdStr(btnEl?.dataset?.productId);
    if (!productId) return;

    const product = getProductById(productId);
    if (!product) return;

    const currentUser = window.STORAGE?.getCurrentUser?.();
    if (!currentUser) {
      showToast('Veuillez vous connecter pour ajouter au panier', 'warning');
      setTimeout(() => { window.location.href = 'auth.html'; }, 600);
      return;
    }

    // prevent spam double-click
    if (btnEl.dataset.adding === '1') return;
    btnEl.dataset.adding = '1';

    try {
      window.STORAGE.addToCart(product, 1);
      showToast(`${product.name} ajouté au panier`, 'success');
      try { window.dispatchEvent(new Event('cartUpdated')); } catch {}

      // micro animation
      const originalHTML = btnEl.innerHTML;
      btnEl.classList.add('added');
      btnEl.innerHTML = '<span>✓</span> Ajouté';
      setTimeout(() => {
        btnEl.classList.remove('added');
        btnEl.innerHTML = originalHTML;
        btnEl.dataset.adding = '0';
      }, 900);
    } catch (e) {
      btnEl.dataset.adding = '0';
      showToast('Erreur lors de l\'ajout au panier', 'error');
    }
  }

  function handleQuickAction(actionBtn) {
    const action = actionBtn?.dataset?.action;
    const productId = normalizeIdStr(actionBtn?.dataset?.productId);
    const product = getProductById(productId);
    if (!product || !action) return;

    if (action === 'favorite') {
      try {
        const isFav = window.STORAGE?.isFavorite?.(productId);
        if (isFav) window.STORAGE.removeFromFavorites(productId);
        else window.STORAGE.addToFavorites(productId);

        actionBtn.textContent = window.STORAGE?.isFavorite?.(productId) ? '❤️' : '🤍';
      } catch {}
      return;
    }

    if (action === 'view') {
      // keep existing Modal if available
      try {
        const content = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);">
            <div>
              <img src="${product.image || ''}" alt="${product.name || ''}" style="width:100%;border-radius:var(--radius-lg);" onerror="this.src='${window.getPlaceholderImage ? window.getPlaceholderImage(product.category) : ''}';">
            </div>
            <div>
              ${product.badge ? `<span style="background:var(--accent);color:#fff;padding:var(--space-xs) var(--space-sm);border-radius:var(--radius-sm);font-size:var(--font-size-xs);font-weight:600;">${product.badge}</span>` : ''}
              <h3 style="font-size:var(--font-size-xl);margin:var(--space-sm) 0;">${product.name || ''}</h3>
              <p style="color:var(--gray-4);font-size:var(--font-size-sm);margin-bottom:var(--space-md);">${product.description || ''}</p>
              <div style="font-size:var(--font-size-2xl);font-weight:800;background:linear-gradient(135deg,var(--primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:var(--space-lg);">
                ${Number(product.price) || 0} DH
              </div>
              <button class="btn btn-primary btn-lg btn-block" type="button" id="__bb_menu_quick_add" >🛒 Ajouter au panier</button>
            </div>
          </div>
        `;

        Modal.open(content, { title: product.name || '' });
        setTimeout(() => {
          const b = document.getElementById('__bb_menu_quick_add');
          if (!b) return;
          b.addEventListener('click', () => {
            try { Modal.close(); } catch {}
            // reuse shared flow
            const fakeBtn = document.createElement('button');
            fakeBtn.dataset.productId = String(product.id);
            handleAddToCart(Object.assign(fakeBtn, { innerHTML: b.innerHTML }));
          }, { once: true });
        }, 0);
      } catch {}
    }
  }

  function bindMenuDelegatedHandlers() {
    if (window.__MENU_DELEGATED_BINDED === '1') return;
    window.__MENU_DELEGATED_BINDED = '1';

    const grids = [
      menuGrid,
      popularGrid,
      bestSellersGrid,
      recommendedGrid,
      document.getElementById('suggestionsGrid')
    ].filter(Boolean);

    document.addEventListener('click', (e) => {
      const btnAdd = e.target?.closest?.('.btn-add-cart[data-product-id]');
      if (btnAdd) {
        const inside = grids.some(g => g.contains(btnAdd));
        if (!inside) return;
        e.preventDefault();
        handleAddToCart(btnAdd);
        return;
      }

      const actionBtn = e.target?.closest?.('.product-action-btn');
      if (actionBtn) {
        const inside = grids.some(g => g.contains(actionBtn));
        if (!inside) return;
        e.preventDefault();
        handleQuickAction(actionBtn);
      }
    }, { passive: false });
  }

  function populateCategorySelect() {
    if (!categorySelect) return;
    const cats = window.PIZZIRIA_DATA?.categories || [];
    for (const cat of cats) {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = `${cat.icon} ${cat.name}`;
      categorySelect.appendChild(option);
    }
  }

  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        currentFilters.search = e.target.value;
        renderMenu();
      }, 250));
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        renderMenu();
      });
    }

    if (badgeSelect) {
      badgeSelect.addEventListener('change', (e) => {
        currentFilters.badge = e.target.value;
        renderMenu();
      });
    }
  }

  function setupOnce() {
    if (MENU_GUARDS.inited === '1') return;
    MENU_GUARDS.inited = '1';

    populateCategorySelect();
    setupEventListeners();

    if (MENU_GUARDS.rendered === '0') {
      MENU_GUARDS.rendered = '1';
      renderMenu();
      renderFeaturedSections();
    }

    bindMenuDelegatedHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupOnce, { once: true });
  } else {
    setupOnce();
  }

})();

