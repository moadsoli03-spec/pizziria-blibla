/* ===========================================
   PIZZIRIA BLIBLA - FRONTEND ONLY
   Neutralize legacy backend API layer completely.
   - NO fetch()
   - NO API_BASE_URL
   - NO JWT / Authorization
   =========================================== */

(function() {
  'use strict';

  // NEUTRALIZED: frontend-only project.
  // No fetch, no JWT, no backend dependencies.


  // Minimal stub to keep legacy `if (window.API && API.xxx)` checks from crashing.
  // Real behavior is implemented directly in:
  // - js/auth.js
  // - js/cart.js
  // - js/orders.js
  // - js/admin.js
  const api = {
    getToken() {
      return null;
    },
    setToken() {},

    register() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: register handled in js/auth.js', data: null });
    },

    login() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: login handled in js/auth.js', data: null });
    },

    me() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: me handled in js/auth.js', data: null });
    },

    getProducts() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: products are in localStorage', data: null });
    },

    // Cart is localStorage-only
    getCart() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: cart is localStorage', data: null });
    },
    addToCart() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: addToCart is localStorage', data: null });
    },
    removeFromCart() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: removeFromCart is localStorage', data: null });
    },
    updateCart() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: updateCart is localStorage', data: null });
    },
    clearCart() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: clearCart is localStorage', data: null });
    },

    checkout() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: checkout is localStorage', data: null });
    },

    // Orders are localStorage-only
    getOrders() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: orders are localStorage', data: null });
    },

    // Admin is localStorage-only
    adminGetOrders() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: admin is localStorage', data: null });
    },
    adminUpdateOrderStatus() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: admin update status is localStorage', data: null });
    },
    adminCreateProduct() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: admin create product is localStorage', data: null });
    },
    adminUpdateProduct() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: admin update product is localStorage', data: null });
    },
    adminDeleteProduct() {
      return Promise.resolve({ ok: false, message: 'Frontend-only: admin delete product is localStorage', data: null });
    }
  };

  window.API = {};
})();

