/* ===========================================
   PIZZIRIA BLIBLA - Cart (frontend-only)
   localStorage keys:
   - localStorage.cart
   - localStorage.orders
   - localStorage.currentUser
   =========================================== */

(function () {
  'use strict';

  const cartList = document.getElementById('cartList');
  const cartEmpty = document.getElementById('cartEmpty');

  const promoCodeInput = document.getElementById('promoCodeInput');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const removePromoBtn = document.getElementById('removePromoBtn');
  const promoMessage = document.getElementById('promoMessage');
  const appliedPromoBadge = document.getElementById('appliedPromoBadge');

  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const discountRow = document.getElementById('discountRow');
  const cartDiscountEl = document.getElementById('cartDiscount');
  const promoSavingsRow = document.getElementById('promoSavingsRow');
  const promoSavingsText = document.getElementById('promoSavingsText');

  const cartTotal = document.getElementById('cartTotal');
  const cartItemsLabel = document.getElementById('cartItemsLabel');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');

  const PROMOS = {
    BLIBLA00: { code: 'BLIBLA00', type: 'percent', value: 50 },
    UH07: { code: 'UH07', type: 'percent', value: 30 },
    HALAMADRID15: { code: 'HALAMADRID15', type: 'percent', value: 25 },
    CMD20: { code: 'CMD20', type: 'percent', value: 20 }
  };

  const PROMO_MEM_KEY = '__pizziria_promo';

  function getAppliedPromo() {
    try {
      const raw = sessionStorage.getItem(PROMO_MEM_KEY) || '';
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.code) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function setAppliedPromo(promo) {
    try {
      if (!promo) sessionStorage.removeItem(PROMO_MEM_KEY);
      else sessionStorage.setItem(PROMO_MEM_KEY, JSON.stringify(promo));
    } catch {}
  }

  function parsePromoCode(code) {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized) return { valid: false };
    const p = PROMOS[normalized];
    if (!p) return { valid: false };
    return { valid: true, ...p };
  }

  function computeTotals(cart, promo) {
    const subtotal = (cart || []).reduce((sum, it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 0;
      return sum + price * qty;
    }, 0);

    if (!promo || !promo.valid) {
      return {
        subtotal,
        discount: 0,
        finalTotal: subtotal,
        promo: null
      };
    }

    let discount = 0;
    if (promo.type === 'percent') {
      discount = subtotal * (Number(promo.value) || 0) / 100;
    } else if (promo.type === 'fixed') {
      discount = Number(promo.value) || 0;
    }

    discount = Math.max(0, discount);
    const finalTotal = Math.max(0, subtotal - discount);

    return {
      subtotal,
      discount,
      finalTotal,
      promo: { code: promo.code, type: promo.type, value: promo.value }
    };
  }

  function formatDH(n) {
    return `${Math.round(Number(n) || 0)} DH`;
  }

  function getProductById(id) {
    try {
      if (window.STORAGE?.findProductById) return window.STORAGE.findProductById(id);
    } catch {}
    if (window.getProductById) return window.getProductById(id);
    return null;
  }

  function createCartItem(item) {
    const product = getProductById(item.id);
    const resolvedImage = product?.image || item.image || (window.getPlaceholderImage ? window.getPlaceholderImage(product?.category) : '');
    const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);

    return `
      <div class="cart-item" data-product-id="${item.id}">
        <div class="cart-item-image">
          <img
            src="${resolvedImage}"
            alt="${item.name || ''}"
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.onerror=null; this.src='${window.getPlaceholderImage ? window.getPlaceholderImage(product?.category) : ''}';"
          >
        </div>

        <div class="cart-item-content">
          <div class="cart-item-name">${item.name || product?.name || ''}</div>
          <div class="cart-item-price">${Number(item.price) || 0} DH / unité</div>

          <div class="cart-item-controls">
            <div class="quantity-control" data-product-id="${item.id}">
              <button class="quantity-btn minus" data-action="decrease" aria-label="Diminuer">−</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn plus" data-action="increase" aria-label="Augmenter">+</button>
            </div>

            <button class="cart-item-remove" data-product-id="${item.id}" aria-label="Retirer du panier">🗑️ Retirer</button>
          </div>
        </div>

        <div class="cart-item-total">${Math.round(itemTotal)} DH</div>
      </div>
    `;
  }

  function renderPromoUI(totals) {
    const promo = getAppliedPromo();
    const hasPromo = totals && totals.promo && totals.promo.code;

    if (appliedPromoBadge) {
      if (hasPromo) {
        appliedPromoBadge.style.display = 'inline-flex';
        appliedPromoBadge.textContent = `Promo: ${totals.promo.code}`;
      } else {
        appliedPromoBadge.style.display = 'none';
        appliedPromoBadge.textContent = '';
      }
    }

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatDH(totals.subtotal);

    if (discountRow) {
      if (hasPromo && totals.discount > 0) {
        discountRow.style.display = 'block';
        if (cartDiscountEl) cartDiscountEl.textContent = `-${Math.round(totals.discount)} DH`;
      } else {
        discountRow.style.display = 'none';
        if (cartDiscountEl) cartDiscountEl.textContent = `-0 DH`;
      }
    }

    if (promoSavingsRow && promoSavingsText) {
      if (hasPromo && totals.discount > 0) {
        promoSavingsRow.style.display = 'block';
        promoSavingsText.textContent = `Vous avez économisé ${Math.round(totals.discount)} DH`;
      } else {
        promoSavingsRow.style.display = 'none';
        promoSavingsText.textContent = '';
      }
    }

    if (promoMessage) promoMessage.textContent = hasPromo ? 'Code promo appliqué ✅' : '';

    if (applyPromoBtn) applyPromoBtn.disabled = !!hasPromo;
    if (removePromoBtn) removePromoBtn.style.display = hasPromo ? 'inline-flex' : 'none';
  }

  function renderCart() {
    if (!cartList) return;

    const cart = window.STORAGE?.getCart?.() || [];

    const promo = (() => {
      const p = getAppliedPromo();
      if (!p) return null;
      return { valid: true, ...p };
    })();

    const totals = computeTotals(cart, promo);

    if (cartTotal) cartTotal.textContent = formatDH(totals.finalTotal);
    if (cartItemsLabel) {
      const count = cart.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
      cartItemsLabel.textContent = `${count} article${count > 1 ? 's' : ''}`;
    }

    if (!cart.length) {
      if (cartList) cartList.style.display = 'none';
      if (cartEmpty) cartEmpty.style.display = 'block';
      if (cartList) cartList.innerHTML = '';
      if (cartTotal) cartTotal.textContent = '0 DH';
      return;
    }

    if (cartList) {
      cartList.style.display = 'flex';
      cartList.innerHTML = cart.map(createCartItem).join('');
    }

    renderPromoUI(totals);

    // Bind actions
    cartList.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.removeEventListener('click', handleQuantityChange);
      btn.addEventListener('click', handleQuantityChange);
    });

    cartList.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.removeEventListener('click', handleRemoveItem);
      btn.addEventListener('click', handleRemoveItem);
    });
  }

  function handleQuantityChange(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action;
    const container = btn.closest('.quantity-control');
    const productId = String(container?.dataset?.productId || '').trim();
    if (!productId) return;

    const cart = window.STORAGE.getCart();
    const item = cart.find(it => String(it.id) === productId);
    if (!item) return;

    let newQty = Number(item.quantity) || 1;
    if (action === 'increase') newQty += 1;
    if (action === 'decrease') newQty -= 1;

    if (newQty < 1) {
      if (confirm('Retirer ce produit du panier ?')) {
        window.STORAGE.removeFromCart(productId);
        showToast('Produit retiré du panier', 'info');
        renderCart();
      }
      return;
    }

    window.STORAGE.updateQuantity(productId, newQty);
    renderCart();
  }

  function handleRemoveItem(e) {
    const btn = e.currentTarget;
    const productId = String(btn.dataset.productId || '').trim();
    if (!productId) return;

    if (!confirm('Retirer ce produit du panier ?')) return;
    window.STORAGE.removeFromCart(productId);
    showToast('Produit retiré du panier', 'info');
    renderCart();
  }

  function handleClearCart() {
    if (!confirm('Êtes-vous sûr de vouloir vider le panier ?')) return;
    window.STORAGE.clearCart();
    setAppliedPromo(null);
    renderCart();
    showToast('Panier vidé', 'info');
  }

  function setCheckoutLoading(isLoading) {
    if (!checkoutBtn) return;
    checkoutBtn.disabled = !!isLoading;
    if (isLoading) checkoutBtn.dataset.loading = 'true';
    else checkoutBtn.dataset.loading = 'false';

    const original = checkoutBtn.dataset.originalText;
    if (!original) checkoutBtn.dataset.originalText = checkoutBtn.innerText;

    if (isLoading) {
      checkoutBtn.innerHTML = `Commander <span class="btn-icon" aria-hidden="true">⏳</span>`;
    } else {
      checkoutBtn.innerText = checkoutBtn.dataset.originalText || 'Commander';
    }
  }

  function generateOrderNumber() {
    const suffix = String(Date.now()).slice(-6);
    return `CMD-${suffix}`;
  }

  function handleCheckout() {
    if (!checkoutBtn) return;
    const currentUser = window.STORAGE.getCurrentUser?.();
    if (!currentUser) {
      showToast('Connectez-vous pour commander', 'warning');
      setTimeout(() => (window.location.href = 'auth.html'), 400);
      return;
    }

    const cart = window.STORAGE.getCart();
    if (!cart.length) {
      showToast('Votre panier est vide', 'warning');
      return;
    }

    setCheckoutLoading(true);

    try {
      const promo = (() => {
        const p = getAppliedPromo();
        if (!p) return null;
        const parsed = parsePromoCode(p.code);
        if (!parsed.valid) return null;
        return parsed;
      })();

      const totals = computeTotals(cart, promo);

      const orderNumber = generateOrderNumber();
      const order = {
        id: orderNumber,
        orderNumber,
        date: new Date().toLocaleString('fr-FR'),
        createdAt: new Date().toISOString(),
        status: 'pending',
        items: cart.map(it => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: it.price
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        promoCode: totals.promo?.code || null,
        finalTotal: totals.finalTotal,
        total: totals.finalTotal,
        customerEmail: currentUser.email,
        customerName: currentUser.name,
        userEmail: currentUser.email
      };

      const orders = window.STORAGE.getOrders();
      orders.unshift(order);
      window.STORAGE.saveOrders(orders);

      // PDF invoice: optional (non-fatal)
      try {
        if (window.PDF_INVOICE && typeof window.PDF_INVOICE.download === 'function') {
          const cartForPdf = cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }));
          window.PDF_INVOICE.download(cartForPdf, currentUser.name, {
            subtotal: order.subtotal,
            discount: order.discount,
            finalTotal: order.finalTotal,
            promoCode: order.promoCode || ''
          });
        }
      } catch {}

      window.STORAGE.clearCart();
      setAppliedPromo(null);

      showToast('Commande confirmée 🍕', 'success');
      setTimeout(() => {
        setCheckoutLoading(false);
        window.location.href = 'menu.html';
      }, 350);
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la commande. Veuillez réessayer.', 'error');
      setCheckoutLoading(false);
    }
  }

  function setupEventListeners() {
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => {
        const code = promoCodeInput ? promoCodeInput.value : '';
        const parsed = parsePromoCode(code);
        if (!parsed.valid) {
          showToast('Code promo invalide.', 'error');
          return;
        }
        setAppliedPromo({ code: parsed.code, type: parsed.type, value: parsed.value });
        showToast('Code promo appliqué avec succès', 'success');
        renderCart();
      });
    }

    if (promoCodeInput) {
      promoCodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (applyPromoBtn) applyPromoBtn.click();
        }
      });
    }

    if (removePromoBtn) {
      removePromoBtn.addEventListener('click', () => {
        setAppliedPromo(null);
        if (promoCodeInput) promoCodeInput.value = '';
        showToast('Code promo retiré', 'info');
        renderCart();
      });
    }

    if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);
    if (clearCartBtn) clearCartBtn.addEventListener('click', handleClearCart);
  }

  function init() {
    setupEventListeners();
    renderCart();

    // listen to cart updates from other tabs
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === 'localStorage.cart' || e.key === 'localStorage.orders') renderCart();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.renderCart = renderCart;
})();

