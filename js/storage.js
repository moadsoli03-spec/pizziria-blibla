/* ===========================================
   PIZZIRIA BLIBLA - Frontend Storage (localStorage only)
   Keys (STRICT):
   - localStorage.users
   - localStorage.currentUser
   - localStorage.cart
   - localStorage.orders
   - localStorage.products
   =========================================== */

(function () {
  'use strict';

  const KEYS = {
    USERS: 'localStorage.users',
    CURRENT_USER: 'localStorage.currentUser',
    CART: 'localStorage.cart',
    ORDERS: 'localStorage.orders',
    PRODUCTS: 'localStorage.products'
  };

  const ADMIN_SEED = {
    email: 'admin@pizziriablibla.com',
    password: 'Admin12345',
    role: 'admin',
    name: 'Administrateur'
  };

  function safeJsonParse(raw, fallback) {
    try {
      if (raw === null || raw === undefined) return fallback;
      if (raw === '') return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }


  function nowIso() {
    return new Date().toISOString();
  }

  function getUsers() {
    const raw = localStorage.getItem(KEYS.USERS);
    const users = safeJsonParse(raw, []);
    return Array.isArray(users) ? users : [];
  }


  function saveUsers(users) {
    if (!Array.isArray(users)) users = [];
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    const u = safeJsonParse(raw, null);
    return u && typeof u === 'object' ? u : null;
  }

  function setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(KEYS.CURRENT_USER);
      return;
    }
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }

  function logout() {
    setCurrentUser(null);
  }

  function ensureSeedUsers() {
    const users = getUsers();
    const hasAdmin = users.some(u => String(u?.email || '').toLowerCase() === ADMIN_SEED.email.toLowerCase());
    if (hasAdmin) return;

    users.push({
      id: Date.now(),
      name: ADMIN_SEED.name,
      email: ADMIN_SEED.email,
      password: ADMIN_SEED.password,
      role: 'admin',
      createdAt: nowIso()
    });

    saveUsers(users);
  }

  function seedProductsIfEmpty() {
    const products = getProducts();
    if (products.length > 0) return;

    const fallback = (window.PIZZIRIA_DATA && Array.isArray(window.PIZZIRIA_DATA.products))
      ? window.PIZZIRIA_DATA.products
      : [];

    const normalized = fallback.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: Number(p.price) || 0,
      category: p.category,
      image: p.image || '',
      badge: p.badge ?? null,
      ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
      calories: p.calories ?? null,
      available: p.available !== false
    }));

    saveProducts(normalized);
  }

  function getProducts() {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    const products = safeJsonParse(raw, []);
    if (!Array.isArray(products)) return [];

    return products
      .map(p => {
        if (!p || typeof p !== 'object') return null;
        return {
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: Number(p.price) || 0,
          category: p.category,
          image: p.image || '',
          badge: p.badge ?? null,
          ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
          calories: p.calories ?? null,
          available: p.available !== false
        };
      })
      .filter(Boolean);
  }

  function saveProducts(products) {
    if (!Array.isArray(products)) products = [];
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  }

  function getCart() {
    const raw = localStorage.getItem(KEYS.CART);
    const cart = safeJsonParse(raw, []);
    if (!Array.isArray(cart)) return [];

    return cart
      .map(it => {
        if (!it || typeof it !== 'object') return null;
        const id = String(it.id ?? '').trim();
        const qty = Number(it.quantity);
        if (!id) return null;
        return {
          id,
          name: String(it.name ?? ''),
          price: Number(it.price) || 0,
          image: String(it.image ?? ''),
          quantity: Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1
        };
      })
      .filter(Boolean);
  }

  function saveCart(cart) {
    if (!Array.isArray(cart)) cart = [];
    localStorage.setItem(KEYS.CART, JSON.stringify(cart));
  }

  function clearCart() {
    localStorage.removeItem(KEYS.CART);
  }

  function getOrders() {
    const raw = localStorage.getItem(KEYS.ORDERS);
    const orders = safeJsonParse(raw, []);
    return Array.isArray(orders) ? orders : [];
  }

  function saveOrders(orders) {
    if (!Array.isArray(orders)) orders = [];
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }

  // ------------------- Public API -------------------
  const STORAGE = {
    KEYS,

    init() {
      ensureSeedUsers();
      seedProductsIfEmpty();
    },

    // users
    getUsers,
    saveUsers,
    getCurrentUser,
    setCurrentUser,
    logout,

    // products
    getProducts,
    saveProducts,

    // cart
    getCart,
    saveCart,
    clearCart,

    // orders
    getOrders,
    saveOrders,

    getCartCount() {
      return getCart().reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    },

    updateCartCount() {
      const count = this.getCartCount();
      document.querySelectorAll('#navCartCount').forEach(el => {
        el.textContent = String(count);
        el.style.display = count > 0 ? 'inline-flex' : 'none';
      });
      return count;
    },

    // Stable localStorage-based addToCart(productId)
    addToCartById(productId, quantity = 1) {
      const user = this.getCurrentUser();
      if (!user) throw new Error('NOT_LOGGED_IN');

      const pid = String(productId ?? '').trim();
      if (!pid) throw new Error('INVALID_PRODUCT_ID');

      const product = this.getProducts().find(p => String(p.id) === pid);
      if (!product) throw new Error('PRODUCT_NOT_FOUND');

      const cart = this.getCart();
      const qty = Number(quantity);
      const safeQty = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;

      const existing = cart.find(it => String(it.id) === pid);
      if (existing) existing.quantity += safeQty;
      else {
        cart.push({
          id: pid,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image || '',
          quantity: safeQty
        });
      }

      this.saveCart(cart);
      this.updateCartCount();

      return cart;
    },

    removeFromCartById(productId) {
      const pid = String(productId ?? '').trim();
      const cart = this.getCart().filter(it => String(it.id) !== pid);
      this.saveCart(cart);
      this.updateCartCount();
      return cart;
    },

    updateCartQuantity(productId, quantity) {
      const pid = String(productId ?? '').trim();
      const cart = this.getCart();
      const item = cart.find(it => String(it.id) === pid);
      if (!item) return cart;

      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return this.removeFromCartById(pid);
      }

      item.quantity = Math.floor(qty);
      this.saveCart(cart);
      this.updateCartCount();
      return cart;
    }
  };

  // Backward-compatible legacy helpers used by existing pages/UI
  STORAGE.isAdmin = function () {
    const u = getCurrentUser();
    return !!u && u.role === 'admin';
  };

  // Legacy addToCart(product, qty) signature
  STORAGE.addToCart = function (productOrId, quantity = 1) {
    // If passed a product object
    if (productOrId && typeof productOrId === 'object') {
      const p = productOrId;
      return this.addToCartById(p.id, quantity);
    }
    // If passed an id
    return this.addToCartById(productOrId, quantity);
  };

  STORAGE.removeFromCart = function (productId) {
    return this.removeFromCartById(productId);
  };

  STORAGE.updateQuantity = function (productId, quantity) {
    return this.updateCartQuantity(productId, quantity);
  };

  // Products legacy compatibility for menu/admin
  STORAGE.getMenuProductsOrDefault = function () {
    const products = this.getProducts();
    return Array.isArray(products) && products.length ? products : [];
  };

  // Favorites (legacy key; not part of prompt but required by UI)
  STORAGE.KEYS_FAVORITES = 'pizziria_favorites';
  STORAGE.getFavorites = function () {
    const raw = localStorage.getItem(STORAGE.KEYS_FAVORITES);
    const arr = safeJsonParse(raw, []);
    return Array.isArray(arr) ? arr : [];
  };
  STORAGE.addToFavorites = function (productId) {
    const id = String(productId);
    const fav = this.getFavorites();
    if (!fav.includes(id)) fav.push(id);
    localStorage.setItem(STORAGE.KEYS_FAVORITES, JSON.stringify(fav));
    return fav;
  };
  STORAGE.removeFromFavorites = function (productId) {
    const id = String(productId);
    const fav = this.getFavorites().filter(x => String(x) !== id);
    localStorage.setItem(STORAGE.KEYS_FAVORITES, JSON.stringify(fav));
    return fav;
  };
  STORAGE.isFavorite = function (productId) {
    return this.getFavorites().includes(String(productId));
  };

  // Legacy product lookup
  STORAGE.findProductById = function (id) {
    const pid = String(id).trim();
    return this.getProducts().find(p => String(p.id) === pid) || null;
  };

  // Orders legacy helpers used by pages (admins + orders UI)
  STORAGE.saveOrder = function (orderData) {
    const orders = this.getOrders();
    const normalized = {
      id: orderData?.orderNumber || orderData?.id || ('CMD-' + String(Date.now()).slice(-6)),
      orderNumber: orderData?.orderNumber || orderData?.id || ('CMD-' + String(Date.now()).slice(-6)),
      date: orderData?.date || new Date().toLocaleString('fr-FR'),
      createdAt: orderData?.createdAt || nowIso(),
      status: orderData?.status || 'pending',
      items: Array.isArray(orderData?.items) ? orderData.items : [],
      subtotal: Number(orderData?.subtotal) || 0,
      discount: Number(orderData?.discount) || 0,
      promoCode: orderData?.promoCode ?? null,
      finalTotal: Number(orderData?.finalTotal) || Number(orderData?.total) || 0,
      total: Number(orderData?.finalTotal) || Number(orderData?.total) || 0,
      customerEmail: orderData?.customerEmail || orderData?.customer?.email || '',
      customerName: orderData?.customerName || orderData?.customer?.name || 'Client',
      userEmail: orderData?.userEmail || orderData?.customerEmail || '',
      updatedAt: orderData?.updatedAt || null
    };

    orders.unshift(normalized);
    this.saveOrders(orders);
    return normalized;
  };

  STORAGE.updateOrderStatus = function (orderId, newStatus) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => String(o.id) === String(orderId));
    if (idx < 0) return null;
    orders[idx].status = newStatus;
    orders[idx].updatedAt = nowIso();
    this.saveOrders(orders);
    return orders[idx];
  };

  // Seed init
  try {
    STORAGE.init();
  } catch (e) {
    console.error('[STORAGE] init failed', e);
  }

  window.STORAGE = STORAGE;
})();

