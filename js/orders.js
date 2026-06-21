/* ===========================================
   PIZZIRIA BLIBLA - Orders (frontend-only)
   localStorage keys:
   - localStorage.currentUser
   - localStorage.orders
   =========================================== */

(function () {
  'use strict';

  // Frontend-only orders page: always use localStorage.
  const tbody = document.getElementById('ordersTbody');

  const ordersEmpty = document.getElementById('ordersEmpty');
  const searchInput = document.getElementById('ordersSearch');
  const statusSelect = document.getElementById('ordersStatus');
  const resetBtn = document.getElementById('ordersResetBtn');

  let filters = { q: '', status: 'all' };

  function normalizeStr(v) {
    return String(v || '').toLowerCase();
  }

  function productListText(order) {
    const items = order.items || [];
    return items
      .map(it => {
        if (typeof it === 'string') return it;
        if (it && typeof it === 'object') return it.name || '';
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }

  function getCurrentUserOrRedirect() {
    const u = window.STORAGE?.getCurrentUser?.();
    if (!u) {
      showToast('Connectez-vous pour voir votre historique', 'warning');
      setTimeout(() => (window.location.href = 'auth.html'), 500);
      return null;
    }
    return u;
  }

  function getAllOrders() {
    return window.STORAGE?.getOrders?.() || [];
  }

  function getUserOrders() {
    const u = getCurrentUserOrRedirect();
    if (!u) return [];

    const email = String(u.email || '').toLowerCase();
    return getAllOrders().filter(o => String(o.userEmail || o.customerEmail || '').toLowerCase() === email);
  }

  function getStatusBadge(status) {
    const statusMap = {
      pending: { class: 'order-status-pending', text: 'En attente' },
      confirmed: { class: 'order-status-confirmed', text: 'Confirmée' },
      preparing: { class: 'order-status-confirmed', text: 'En préparation' },
      delivered: { class: 'order-status-delivered', text: 'Livrée' },
      cancelled: { class: 'order-status-cancelled', text: 'Annulée' }
    };
    const s = statusMap[status] || statusMap.pending;
    return `<span class="order-status ${s.class}">${s.text}</span>`;
  }

  function buildOrderDetails(order) {
    const items = order.items || [];
    const list = items
      .map(it => {
        if (typeof it === 'string') return `<li style="margin-bottom:6px;color:var(--gray-3);">${it}</li>`;
        const name = it.name || '';
        const qty = it.quantity || 1;
        const price = it.price || 0;
        const lineTotal = price * qty;
        return `<li style="margin-bottom:6px;color:var(--gray-3);">${name} — ${qty} × ${price} DH = ${lineTotal} DH</li>`;
      })
      .join('');

    return `
      <div style="padding: var(--space-md); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-lg);">
        <div style="font-weight:700; color: var(--white); margin-bottom: var(--space-xs);">Détails commande</div>
        <div class="small" style="color: var(--gray-4); margin-bottom: var(--space-sm);">Statut : <strong>${order.status}</strong></div>
        <ul style="padding-left: var(--space-md); margin: 0;">${list}</ul>
        <div style="margin-top: var(--space-md); font-weight:800; color: var(--white);">Total : ${order.total} DH</div>
      </div>
    `;
  }

  function createOrderRow(order) {
    const orderId = order.id;
    const itemsText = (order.items || []).map(it => (typeof it === 'string' ? it : it.name || '')).filter(Boolean).join(', ');
    const itemsTotal = (order.items || []).reduce((sum, it) => {
      if (typeof it === 'string') return sum + 1;
      return sum + (Number(it.quantity) || 1);
    }, 0);

    const details = buildOrderDetails(order);

    return `
      <tr>
        <td><strong>${orderId}</strong></td>
        <td>${order.date || ''}</td>
        <td>
          ${itemsText || '—'}
          <div class="small" style="color: var(--gray-4); margin-top: 6px;">${itemsTotal} article(s)</div>
        </td>
        <td><strong>${order.total} DH</strong></td>
        <td>${getStatusBadge(order.status)}</td>
        <td>
          <div style="display:flex; gap: var(--space-sm); flex-wrap:wrap;">
            <button class="btn btn-sm btn-ghost" type="button" data-action="download-receipt" data-order-id="${orderId}">
              📄 Reçu PDF
            </button>
            <button class="btn btn-sm btn-ghost" type="button" data-action="toggle-details" data-order-id="${orderId}">
              🔎 Détails
            </button>
          </div>
          <div id="orderDetails_${orderId}" style="display:none; margin-top: var(--space-sm);">${details}</div>
        </td>
      </tr>
    `;
  }

  function downloadReceiptForOrderId(orderId) {
    try {
      const orders = getUserOrders();
      const order = orders.find(o => String(o.id) === String(orderId));
      if (!order) {
        showToast('Commande introuvable', 'error');
        return;
      }

      if (!window.PDF_INVOICE || typeof window.PDF_INVOICE.download !== 'function') {
        showToast('Impossible de générer le PDF', 'error');
        return;
      }

      const cartForPdf = (order.items || []).map(it => ({
        name: typeof it === 'string' ? it : it.name,
        price: typeof it === 'string' ? 0 : (it.price || 0),
        quantity: typeof it === 'string' ? 1 : (it.quantity || 1)
      }));

      window.PDF_INVOICE.download(cartForPdf, order.customerName || 'Client', {
        subtotal: order.subtotal,
        discount: order.discount,
        finalTotal: order.finalTotal || order.total,
        promoCode: order.promoCode || ''
      });

      showToast('Reçu PDF téléchargé 📄', 'success');
    } catch (e) {
      console.error(e);
      showToast('Erreur génération reçu PDF', 'error');
    }
  }

  function render() {
    if (!tbody) return;

    const orders = getUserOrders();

    let filtered = orders;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    const q = String(filters.q || '').trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(o => {
        const cmdId = normalizeStr(o.id);
        const date = normalizeStr(o.date);
        const products = normalizeStr(productListText(o));
        const status = normalizeStr(o.status);
        return cmdId.includes(q) || date.includes(q) || products.includes(q) || status.includes(q);
      });
    }

    if (!filtered.length) {
      if (ordersEmpty) ordersEmpty.style.display = 'block';
      tbody.innerHTML = '';
      return;
    }

    if (ordersEmpty) ordersEmpty.style.display = 'none';

    tbody.innerHTML = filtered.map(order => createOrderRow(order)).join('');

    tbody.querySelectorAll('[data-action="download-receipt"]').forEach(btn => {
      btn.addEventListener('click', () => {
        downloadReceiptForOrderId(btn.getAttribute('data-order-id'));
      });
    });

    tbody.querySelectorAll('[data-action="toggle-details"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-order-id');
        const details = document.getElementById(`orderDetails_${orderId}`);
        if (!details) return;
        const isHidden = details.style.display === 'none' || !details.style.display;
        details.style.display = isHidden ? 'block' : 'none';
      });
    });

    if (window.ScrollReveal && typeof ScrollReveal.revealAll === 'function') {
      setTimeout(() => ScrollReveal.revealAll(), 50);
    }
  }

  function init() {
    if (!tbody) return;

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filters = { q: '', status: 'all' };
        if (searchInput) searchInput.value = '';
        if (statusSelect) statusSelect.value = 'all';
        render();
        showToast('Filtres réinitialisés', 'info');
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        filters.q = e.target.value;
        render();
      }, 250));
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        filters.status = e.target.value;
        render();
      });
    }

    render();

    window.addEventListener('storage', (e) => {
      if (e.key === 'localStorage.orders') render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();

