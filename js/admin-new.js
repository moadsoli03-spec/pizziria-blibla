/* =============================================
   PIZZIRIA BLIBLA — Admin Dashboard JS (clean)
   Products CRUD — stable architecture (single state)

   localStorage keys used for products:
     localStorage.products
   ============================================= */

(function () {
  'use strict';

  // Prevent duplicated script execution
  if (window.__PIZZIRIA_ADMIN_NEW_GUARD__) return;
  window.__PIZZIRIA_ADMIN_NEW_GUARD__ = true;

  /* ─────────────────────────────────────────────
   * AdminState — SINGLE SOURCE OF TRUTH
   * ───────────────────────────────────────────── */
  const AdminState = {
    products: [],
    editingId: null,
    initialized: false
  };

  /* ─────────────────────────────────────────────
   * Safe helpers
   * ───────────────────────────────────────────── */
  const PRODUCTS_KEY = 'localStorage.products';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  function dh(n) {
    return `${Number(n) || 0} DH`;
  }

  function toast(msg, type = 'info') {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
      return;
    }
    const c = document.getElementById('adminToastContainer') || document.body;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors = { success: '#00cc88', error: '#e63946', warning: '#ff9f1c', info: '#5b8dee' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span style="color:${colors[type] || colors.info};font-size:1.1em">${icons[type] || icons.info}</span><span>${esc(msg)}</span>`;
    c.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.25s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  function requireAdmin() {
    const u = window.STORAGE?.getCurrentUser?.();
    if (!u || u.role !== 'admin') {
      toast('Accès refusé — connexion admin requise', 'error');
      setTimeout(() => {
        window.location.href = 'auth.html';
      }, 600);
      return false;
    }
    return true;
  }

  /* ─────────────────────────────────────────────
   * SAFE STORAGE LAYER (products only)
   * ───────────────────────────────────────────── */
  function normalizeProducts(input) {
    if (!Array.isArray(input)) return [];

    const out = [];
    const seen = new Set();

    for (const p of input) {
      if (!p || typeof p !== 'object') continue;

      const idRaw = p.id ?? p._id ?? p.productId;
      const id = String(idRaw ?? '').trim();
      if (!id) continue;
      if (seen.has(id)) continue; // duplicate id prevention
      seen.add(id);

      const name = String(p.name ?? '').trim();
      const description = String(p.description ?? '').trim();
      const image = String(p.image ?? '').trim();
      const category = String(p.category ?? '').trim();
      const badge = p.badge == null || String(p.badge).trim() === '' ? null : String(p.badge).trim();
      const price = Number(p.price);
      const safePrice = Number.isFinite(price) && price > 0 ? price : 0;
      const available = p.available !== false;

      const ingredients = Array.isArray(p.ingredients) ? p.ingredients : [];

      out.push({
        id,
        name,
        description,
        price: safePrice,
        category,
        image,
        badge,
        ingredients,
        available
      });
    }

    return out;
  }

  function loadProducts() {
    try {
      const raw = window.localStorage?.getItem(PRODUCTS_KEY);
      if (raw == null || raw === '') return [];
      const parsed = JSON.parse(raw);
      return normalizeProducts(parsed);
    } catch {
      return [];
    }
  }

  function saveProducts(products) {
    try {
      const normalized = normalizeProducts(products);
      window.localStorage?.setItem(PRODUCTS_KEY, JSON.stringify(normalized));
      // keep state in sync
      AdminState.products = normalized;
      return true;
    } catch {
      return false;
    }
  }

  /* ─────────────────────────────────────────────
   * Placeholders
   * ───────────────────────────────────────────── */
  function getPlaceholderImage(cat) {
    const map = {
      pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&q=60',
      boisson: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=80&q=60',
      dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=80&q=60'
    };
    return map[String(cat || '').toLowerCase()] || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&q=60';
  }

  /* ─────────────────────────────────────────────
   * Stats (keep design)
   * ───────────────────────────────────────────── */
  function renderStats() {
    const orders = window.STORAGE?.getOrders?.() || [];
    const products = AdminState.products;

    const total = orders.length;
    const revenue = orders.reduce((s, o) => s + (Number(o?.total || o?.finalTotal) || 0), 0);

    const today = new Date().toDateString();
    const todayO = orders.filter(o => new Date(o?.createdAt || o?.date || 0).toDateString() === today);
    const todayR = todayO.reduce((s, o) => s + (Number(o?.total || o?.finalTotal) || 0), 0);

    const pending = orders.filter(o => o?.status === 'pending').length;
    const deliv = orders.filter(o => o?.status === 'delivered').length;

    const emails = new Set(orders.map(o => o?.customerEmail).filter(Boolean));
    const clients = emails.size || total;

    const lowStock = products.filter(p => p.available === false).length;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('statTotalProducts', products.length);
    set('statOrders', total);
    set('statRevenue', dh(revenue));
    set('statRevenueToday', dh(todayR));
    set('statClients', clients);
    set('statPending', pending);
    set('statDelivered', deliv);
    set('adminLowStockValue', lowStock);
    set('sidebarLowStockCount', lowStock);
    set('sidebarPendingCount', pending);

    document.querySelectorAll('.customer-stat-clients').forEach(el => (el.textContent = clients));
    document.querySelectorAll('.customer-stat-revenue-today').forEach(el => (el.textContent = dh(todayR)));

    const badge = document.getElementById('sidebarPendingCount');
    if (badge) {
      badge.textContent = pending;
      badge.style.display = pending > 0 ? 'block' : 'none';
    }
  }

  /* ─────────────────────────────────────────────
   * Orders render (no changes here)
   * ───────────────────────────────────────────── */
  function getOrdersSorted() {
    return [...(window.STORAGE?.getOrders?.() || [])].sort((a, b) => {
      const ta = new Date(a?.updatedAt || a?.createdAt || a?.date || 0).getTime();
      const tb = new Date(b?.updatedAt || b?.createdAt || b?.date || 0).getTime();
      return tb - ta;
    });
  }


  const STATUS_MAP = {
    pending: {
      label: 'En attente',
      cls: 'status-pending'
    },
    confirmed: {
      label: 'Confirmée',
      cls: 'status-confirmed'
    },
    preparing: {
      label: 'Préparation',
      cls: 'status-preparing'
    },
    delivered: {
      label: 'Livrée',
      cls: 'status-delivered'
    },
    cancelled: {
      label: 'Annulée',
      cls: 'status-cancelled'
    }
  };

  function statusBadge(status) {
    const s = STATUS_MAP[status] || STATUS_MAP.pending;

    return `     <span class="status-badge ${s.cls}">
      ${s.label}     </span>
  `;
  }

  function renderOrders() {
    const tbody = document.getElementById('ordersTbody');
    if (!tbody) return;

    const q = (document.getElementById('adminOrdersSearch')?.value || '').trim().toLowerCase();
    const status = document.getElementById('adminOrdersStatus')?.value || 'all';

    let orders = getOrdersSorted();
    if (status !== 'all') orders = orders.filter(o => o?.status === status);

    if (q) {
      orders = orders.filter(o => {
        const id = String(o?.id || '').toLowerCase();
        const name = String(o?.customerName || o?.customer || '').toLowerCase();
        const items = (o?.items || [])
          .map(it => (typeof it === 'string' ? it : it?.name || ''))
          .join(' ')
          .toLowerCase();
        return id.includes(q) || name.includes(q) || items.includes(q);
      });
    }

    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><span>Aucune commande trouvée</span></div></td></tr>`;
      return;
    }

    tbody.innerHTML = orders
      .map(o => {
        const itemsHtml = (o?.items || [])
          .map(it => {
            const name = typeof it === 'string' ? it : it?.name || '';
            const qty = it?.quantity && typeof it !== 'string' ? ` ×${it.quantity}` : '';
            return `<div style="font-size:12px;color:#9898b0">${esc(name)}${qty}</div>`;
          })
          .join('');

        const sel = `<select class="status-select" data-order-id="${esc(o?.id ?? '')}">
          <option value="pending" ${o?.status === 'pending' ? 'selected' : ''}>En attente</option>
          <option value="confirmed" ${o?.status === 'confirmed' ? 'selected' : ''}>Confirmée</option>
          <option value="preparing" ${o?.status === 'preparing' ? 'selected' : ''}>Préparation</option>
          <option value="delivered" ${o?.status === 'delivered' ? 'selected' : ''}>Livrée</option>
          <option value="cancelled" ${o?.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
        </select>`;

        return `<tr>
          <td>
            <div class="td-order-id">${esc(o?.id ?? '')}</div>
            <div class="td-order-name">${esc(o?.customerName || o?.customer || 'Client')}</div>
            ${o?.customerEmail ? `<div class="td-order-email">${esc(o.customerEmail)}</div>` : ''}
          </td>
          <td>${itemsHtml}</td>
          <td><span class="td-total">${dh(o?.total || o?.finalTotal)}</span></td>
          <td>${statusBadge(o?.status)}</td>
          <td style="white-space:nowrap;font-size:12px;color:#9898b0">${esc(o?.date || '')}</td>
          <td>${sel}</td>
        </tr>`;
      })
      .join('');

    tbody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', e => {
        const id = e.target?.dataset?.orderId;
        const nextStatus = e.target?.value;
        if (!id || !nextStatus) return;
        window.STORAGE?.updateOrderStatus?.(id, nextStatus);
        toast('Statut mis à jour', 'success');
        renderOrders();
        renderStats();
      });
    });
  }

  /* ─────────────────────────────────────────────
   * PRODUCTS CRUD
   * ───────────────────────────────────────────── */
  const productForm = {
    name: document.getElementById('adminProductName'),
    price: document.getElementById('adminProductPrice'),
    description: document.getElementById('adminProductDescription'),
    image: document.getElementById('adminProductImage'),
    category: document.getElementById('adminProductCategory'),
    badge: document.getElementById('adminProductBadge'),
    available: document.getElementById('adminProductAvailable'),

    submitBtn: document.getElementById('adminProductSubmitBtn'),
    cancelBtn: document.getElementById('adminProductCancelEditBtn'),

    lblMode: document.getElementById('adminFormModeLabel'),

    errName: document.getElementById('adminProductNameError'),
    errPrice: document.getElementById('adminProductPriceError'),
    errDesc: document.getElementById('adminProductDescriptionError'),
    errImg: document.getElementById('adminProductImageError'),
    errCat: document.getElementById('adminProductCategoryError')
  };

  function resetProductForm() {
    AdminState.editingId = null;

    if (productForm.lblMode) productForm.lblMode.textContent = 'Ajouter un produit';
    if (productForm.submitBtn) {
      productForm.submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg> Ajouter le produit';
    }
    if (productForm.cancelBtn) productForm.cancelBtn.style.display = 'none';

    [productForm.name, productForm.price, productForm.description, productForm.image].forEach(el => {
      if (el) el.value = '';
      el?.classList?.remove('error');
    });
    if (productForm.category) productForm.category.value = '';
    if (productForm.badge) productForm.badge.value = '';
    if (productForm.available) productForm.available.checked = true;

    if (document.getElementById('availableLabel') && productForm.available) {
      document.getElementById('availableLabel').textContent = productForm.available.checked ? 'Actif' : 'Inactif';
    }

    const hideErr = (el) => {
      if (!el) return;
      el.style.display = 'none';
      el.textContent = '';
    };
    hideErr(productForm.errName);
    hideErr(productForm.errPrice);
    hideErr(productForm.errDesc);
    hideErr(productForm.errImg);
    hideErr(productForm.errCat);
  }

  function startEditProduct(id) {
    const pid = String(id ?? '').trim();
    if (!pid) return;

    const p = AdminState.products.find(x => String(x?.id) === pid);
    if (!p) return;

    AdminState.editingId = pid;

    if (productForm.lblMode) productForm.lblMode.textContent = 'Modifier le produit';
    if (productForm.submitBtn) {
      productForm.submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg> Enregistrer';
    }
    if (productForm.cancelBtn) productForm.cancelBtn.style.display = '';

    if (productForm.name) productForm.name.value = p.name || '';
    if (productForm.price) productForm.price.value = p.price ?? '';
    if (productForm.description) productForm.description.value = p.description || '';
    if (productForm.image) productForm.image.value = p.image || '';
    if (productForm.category) productForm.category.value = p.category || '';
    if (productForm.badge) productForm.badge.value = p.badge || '';
    if (productForm.available) productForm.available.checked = p.available !== false;

    if (productForm.available && document.getElementById('availableLabel')) {
      document.getElementById('availableLabel').textContent = productForm.available.checked ? 'Actif' : 'Inactif';
    }

    productForm.name?.focus?.();
    document.querySelector('.form-card')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  function validateProductFormData() {
    const name = productForm.name ? String(productForm.name.value || '').trim() : '';
    const priceRaw = productForm.price ? productForm.price.value : '';
    const price = Number(priceRaw);
    const description = productForm.description ? String(productForm.description.value || '').trim() : '';
    const image = productForm.image ? String(productForm.image.value || '').trim() : '';
    const category = productForm.category ? String(productForm.category.value || '').trim() : '';
    const badge = productForm.badge ? String(productForm.badge.value || '').trim() : '';
    const available = productForm.available ? !!productForm.available.checked : true;

    const setErr = (inputEl, errEl, msg) => {
      if (inputEl && inputEl.classList) inputEl.classList.toggle('error', !!msg);
      if (errEl) {
        errEl.textContent = msg || '';
        errEl.style.display = msg ? 'block' : 'none';
      }
    };

    // clear
    if (productForm.name) productForm.name.classList.remove('error');
    if (productForm.price) productForm.price.classList.remove('error');
    if (productForm.description) productForm.description.classList.remove('error');
    if (productForm.image) productForm.image.classList.remove('error');
    if (productForm.category) productForm.category.classList.remove('error');

    setErr(productForm.name, productForm.errName, name ? '' : 'Nom requis');
    setErr(productForm.price, productForm.errPrice, Number.isFinite(price) && price > 0 ? '' : 'Prix invalide');
    setErr(productForm.description, productForm.errDesc, description ? '' : 'Description requise');
    setErr(productForm.image, productForm.errImg, image ? '' : 'Image requise');
    setErr(productForm.category, productForm.errCat, category ? '' : 'Catégorie requise');

    const ok = !!(name && Number.isFinite(price) && price > 0 && description && image && category);

    return {
      ok,
      data: {
        name,
        price,
        description,
        image,
        category,
        badge: badge ? badge : null,
        available,
        ingredients: []
      }
    };
  }

  function renderProducts() {
    const tbody = document.getElementById('menuTbody');
    if (!tbody) return;

    // Clear tbody ONCE
    tbody.innerHTML = '';

    const search = String(document.getElementById('adminMenuSearch')?.value || '').trim().toLowerCase();

    const q = search;
    let prods = Array.isArray(AdminState.products) ? [...AdminState.products] : [];

    if (q) {
      prods = prods.filter(p => {
        const name = String(p?.name || '').toLowerCase();
        const category = String(p?.category || '').toLowerCase();
        const description = String(p?.description || '').toLowerCase();
        return name.includes(q) || category.includes(q) || description.includes(q);
      });
    }

    // Duplicate ID protection
    const seen = new Set();
    prods = prods.filter(p => {
      const id = String(p?.id ?? '').trim();
      if (!id) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    prods.sort((a, b) => Number(b?.available !== false) - Number(a?.available !== false));

    const frag = document.createDocumentFragment();

    if (!prods.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;

      const wrapper = document.createElement('div');
      wrapper.className = 'empty-state';
      // Allowed innerHTML once for static svg block (no +=)
      wrapper.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8M12 8v8"/>
        </svg>
        <span>Aucun produit trouvé</span>
      `;

      td.appendChild(wrapper);
      tr.appendChild(td);
      frag.appendChild(tr);
      tbody.appendChild(frag);
      return;
    }

    for (const p of prods) {
      const id = String(p?.id ?? '').trim();
      if (!id) continue;

      const tr = document.createElement('tr');

      // Produit
      const td1 = document.createElement('td');
      const tdProduct = document.createElement('div');
      tdProduct.className = 'td-product';

      const img = document.createElement('img');
      img.className = 'td-product-img';
      img.alt = p?.name ? String(p.name) : '';
      img.src = p?.image || getPlaceholderImage(p?.category);
      img.onerror = function () {
        this.src = getPlaceholderImage(p?.category);
      };

      const div2 = document.createElement('div');

      const nameDiv = document.createElement('div');
      nameDiv.className = 'td-product-name';
      const avail = p?.available !== false;
      // single innerHTML usage (no +=, no insertAdjacentHTML)
      nameDiv.innerHTML = `<span class="avail-dot ${avail ? 'avail-on' : 'avail-off'}"></span>${esc(p?.name || '')}`;

      const catDiv = document.createElement('div');
      catDiv.className = 'td-product-cat';
      catDiv.textContent = p?.category || '';

      div2.appendChild(nameDiv);
      div2.appendChild(catDiv);

      tdProduct.appendChild(img);
      tdProduct.appendChild(div2);

      td1.appendChild(tdProduct);

      // Catégorie/badge
      const td2 = document.createElement('td');
      if (p?.badge) {
        const span = document.createElement('span');
        span.className = 'prod-badge';
        span.textContent = String(p.badge);
        td2.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.style.color = '#4a4a60';
        span.style.fontSize = '11px';
        span.textContent = '—';
        td2.appendChild(span);
      }

      // Prix
      const td3 = document.createElement('td');
      td3.style.fontWeight = '700';
      td3.style.color = '#fff';
      td3.style.fontSize = '13px';
      td3.textContent = dh(p?.price);

      // Actions
      const td4 = document.createElement('td');
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.gap = '6px';

      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'btn btn-icon btn-icon-edit';
      btnEdit.dataset.action = 'edit';
      btnEdit.dataset.id = id;
      btnEdit.title = 'Modifier';
      btnEdit.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn btn-icon btn-icon-del';
      btnDel.dataset.action = 'delete';
      btnDel.dataset.id = id;
      btnDel.title = 'Supprimer';
      btnDel.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;

      wrap.appendChild(btnEdit);
      wrap.appendChild(btnDel);
      td4.appendChild(wrap);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);

      frag.appendChild(tr);
    }

    tbody.appendChild(frag);
  }

  let isDeletingProduct = false;

  function deleteProduct(id) {
    const pid = String(id);
    console.trace('[ADMIN][deleteProduct] ENTER', { id, pid });
    console.count('[ADMIN][deleteProduct] count');

    if (!pid) {
      console.warn('[ADMIN][deleteProduct] missing pid');
      return;
    }
    if (isDeletingProduct) {
      console.warn('[ADMIN][deleteProduct] already deleting (guard tripped)', { pid });
      return;
    }
    isDeletingProduct = true;

    try {
      const before = Array.isArray(AdminState.products) ? AdminState.products : [];
      console.log('[ADMIN][deleteProduct] before.length=', before.length);

      const next = before.filter(p => String(p?.id) !== pid);
      console.log('[ADMIN][deleteProduct] next.length=', next.length);

      AdminState.products = next;

      const savedOk = saveProducts(next);
      console.log('[ADMIN][deleteProduct] saveProducts returned', savedOk);

      // EDIT MODE stability (keep existing behavior)
      if (String(AdminState.editingId) === pid) {
        console.log('[ADMIN][deleteProduct] was editing -> reset');
        resetProductForm();
        AdminState.editingId = null;
      }

      console.log('[ADMIN][deleteProduct] calling renderProducts/renderStats');
      renderProducts();
      renderStats();

      toast('Produit supprimé', 'info');
    } finally {
      isDeletingProduct = false;
      console.log('[ADMIN][deleteProduct] EXIT guard released');
    }
  }






  function submitProductForm() {
    const { ok, data } = validateProductFormData();
    if (!ok) {
      toast('Veuillez remplir tous les champs requis', 'warning');
      return;
    }

    const prods = Array.isArray(AdminState.products) ? [...AdminState.products] : [];

    if (AdminState.editingId) {
      const idx = prods.findIndex(p => String(p?.id ?? '') === String(AdminState.editingId));
      if (idx < 0) {
        toast('Produit introuvable (édition)', 'error');
        resetProductForm();
        return;
      }

      prods[idx] = {
        ...prods[idx],
        ...data,
        id: String(prods[idx].id)
      };
    } else {
      const newId = String(prods.reduce((m, p) => Math.max(m, Number(p?.id) || 0), 0) + 1);

      // duplicate id prevention (best-effort)
      if (prods.some(p => String(p?.id ?? '') === newId)) {
        toast('ID produit dupliqué (corruption)', 'error');
        return;
      }

      prods.push({
        ...data,
        id: newId
      });
    }

    const savedOk = saveProducts(prods);
    if (!savedOk) {
      toast('Impossible d\'enregistrer le produit', 'error');
      return;
    }

    resetProductForm();
    renderProducts();
    renderStats();
    // no renderAll
  }

  /* ─────────────────────────────────────────────
   * Events + init (keep non-products behavior)
   * ───────────────────────────────────────────── */
  const SECTIONS = ['overview', 'orders', 'products', 'customers', 'analytics'];
  const TITLES = {
    overview: 'Vue d\'ensemble',
    orders: 'Commandes',
    products: 'Produits',
    customers: 'Clients',
    analytics: 'Analytics'
  };

  function showSection(id) {
    SECTIONS.forEach(s => {
      const el = document.getElementById('section-' + s);
      if (el) el.style.display = s === id ? 'block' : 'none';
    });

    document.querySelectorAll('.sidebar-link').forEach(a => {
      const active = a.dataset.section === id;
      a.classList.toggle('active', active);
    });

    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.textContent = TITLES[id] || '';

    try {
      history.replaceState(null, '', '#' + id);
    } catch {}
  }

  function initCategories() {
    const sel = productForm.category;
    if (!sel) return;

    const cats = window.PIZZIRIA_DATA?.categories || [];
    sel.innerHTML = cats
      .map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`)
      .join('');
  }

  function bindCommonEvents() {
    // Sidebar nav
    document.querySelectorAll('.sidebar-link[data-section]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        showSection(a.dataset.section);
        document.getElementById('sidebar')?.classList.remove('is-open');
        document.getElementById('sidebarOverlay')?.classList.remove('is-open');
      });
    });

    // Mobile toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('is-open');
      document.getElementById('sidebarOverlay')?.classList.toggle('is-open');
    });

    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('is-open');
      document.getElementById('sidebarOverlay')?.classList.remove('is-open');
    });

    // Logout
    document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
      window.STORAGE.logout();
      toast('Déconnexion...', 'info');
      setTimeout(() => {
        window.location.href = 'auth.html';
      }, 400);
    });

    // Orders filters
    const ordersSearch = document.getElementById('adminOrdersSearch');
    const ordersStatus = document.getElementById('adminOrdersStatus');

    if (ordersSearch) {
      let t;
      ordersSearch.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => renderOrders(), 200);
      });
    }

    ordersStatus?.addEventListener('change', () => renderOrders());

    // Product search (renderProducts)
    const productSearch = document.getElementById('adminMenuSearch');
    if (productSearch) {
      let t;
      productSearch.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => renderProducts(), 200);
      });
    }

    // Product form events
    document.getElementById('adminProductAvailable')?.addEventListener('change', () => {
      if (document.getElementById('availableLabel') && productForm.available) {
        document.getElementById('availableLabel').textContent = productForm.available.checked ? 'Actif' : 'Inactif';
      }
    });

    document.getElementById('menuResetBtn')?.addEventListener('click', () => {
      if (typeof window.showConfirm === 'function') {
        window.showConfirm(
          'Remettre le menu par défaut ?',
          () => {
            try {
              window.localStorage.removeItem(PRODUCTS_KEY);
            } catch {}
            window.STORAGE?.init?.();
            AdminState.products = loadProducts();
            resetProductForm();
            renderProducts();
            renderStats();
          },
          () => {}
        );
      } else if (confirm('Remettre le menu par défaut ?')) {
        try {
          window.localStorage.removeItem(PRODUCTS_KEY);
        } catch {}
        window.STORAGE?.init?.();
        AdminState.products = loadProducts();
        resetProductForm();
        renderProducts();
        renderStats();
      }
    });

    document.getElementById('menuAddBtn')?.addEventListener('click', () => {
      resetProductForm();
      productForm.name?.focus?.();
    });

    document.getElementById('adminProductCancelEditBtn')?.addEventListener('click', () => {
      resetProductForm();
      toast('Édition annulée', 'info');
    });

    document.getElementById('adminProductSubmitBtn')?.addEventListener('click', () => {
      if (productForm.submitBtn?.dataset?.submitting === '1') return;
      if (productForm.submitBtn) productForm.submitBtn.dataset.submitting = '1';
      try {
        submitProductForm();
      } finally {
        setTimeout(() => {
          if (productForm.submitBtn) productForm.submitBtn.dataset.submitting = '0';
        }, 0);
      }
    });

    // Delegated single listener for product actions
    const menuTbody = document.getElementById('menuTbody');
    menuTbody?.addEventListener('click', (event) => {
      if (!menuTbody) return;
      if (!event.target?.closest) return;
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (!action || id == null) return;

      event.preventDefault();
      event.stopPropagation();


      if (action === 'edit') {
        startEditProduct(id);
        return;
      }

      if (action === 'delete') {
        console.trace('[ADMIN][menuTbody click] delete flow start', { action, id });
        const doDelete = () => {
          console.trace('[ADMIN][showConfirm onConfirm] invoking deleteProduct', { id });
          deleteProduct(id);
        };

        if (typeof window.showConfirm === 'function') {
          console.log('[ADMIN] calling showConfirm', { id });
          window.showConfirm('Supprimer ce produit ? Action irréversible.', doDelete, () => {
            console.log('[ADMIN] showConfirm onCancel', { id });
          });
          // sanity: confirm button existence right after call
          setTimeout(() => {
            const btn = document.querySelector('#modalBackdrop .btn.btn-primary, #modalBackdrop button.btn-primary');
            console.log('[ADMIN] after showConfirm timeout: confirmBtn exists?', !!btn);
          }, 0);
        } else {
          console.log('[ADMIN] showConfirm missing -> native confirm');
          if (confirm('Supprimer ce produit ?')) doDelete();
        }
      }

    });
  }

  function init() {
    if (!requireAdmin()) return;
    if (AdminState.initialized) return;
    AdminState.initialized = true;

    initCategories();
    AdminState.products = loadProducts();
    resetProductForm();

    // initial section
    const hash = (window.location.hash || '').replace('#', '');
    const initial = SECTIONS.includes(hash) ? hash : 'overview';
    showSection(initial);

    // initial renders (no full page rebuild)
    renderStats();
    renderOrders();
    renderProducts();

    bindCommonEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

