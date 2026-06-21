/* ===========================================
   PIZZIRIA BLIBLA - Utilitaires UI
   Toasts, modals, helpers
   =========================================== */

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info', duration = 3000) {
  // Créer le container si nécessaire
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Icônes selon le type
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  // Créer le toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="font-size: 1.2em; color: ${type === 'success' ? '#00cc88' : type === 'error' ? '#e63946' : type === 'warning' ? '#ff9f1c' : '#64b5f6'}">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Supprimer après la durée
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Alias pour compatibilité
const toast = showToast;

// ========== MODAL ==========
const Modal = {
  open(content, options = {}) {
    const { title = '', size = 'md' } = options;

    // Créer le backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modalBackdrop';

    // Build shell via innerHTML (no user callbacks here — safe)
    backdrop.innerHTML = `
      <div class="modal modal-${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body" id="modalBody"></div>
      </div>
    `;

    // Inject content: DOM node → appendChild (preserves event listeners)
    //                 string   → innerHTML (legacy callers)
    const bodySlot = backdrop.querySelector('#modalBody');
    if (content instanceof Node) {
      bodySlot.appendChild(content);
    } else {
      bodySlot.innerHTML = content;
    }

    // Close button via addEventListener — no onclick= string
    backdrop.querySelector('#modalCloseBtn')
      ?.addEventListener('click', () => this.close());

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    // Animation d'entrée
    requestAnimationFrame(() => {
      backdrop.classList.add('active');
    });

    // Fermer en cliquant à l'extérieur
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this.close();
    });

    // Fermer avec Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return backdrop;
  },

  close() {
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => backdrop.remove(), 300);
    }
  }
};

// ========== CONFIRM DIALOG ==========
// Anti-stacking guard — only one confirm modal at a time
let _confirmOpen = false;

function showConfirm(message, onConfirm, onCancel) {
  if (_confirmOpen) return;
  _confirmOpen = true;

  const resetGuard = () => { _confirmOpen = false; };

  // ── Build body content via DOM (never serialize functions into onclick=) ──
  const bodyEl = document.createElement('div');

  const msgEl = document.createElement('p');
  msgEl.style.cssText = 'margin-bottom:var(--space-xl,1.5rem);color:var(--gray-4,#9898b0)';
  msgEl.textContent = message;

  const rowEl = document.createElement('div');
  rowEl.style.cssText = 'display:flex;gap:var(--space-md,1rem);justify-content:flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-ghost';
  cancelBtn.textContent = 'Annuler';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.textContent = 'Confirmer';

  rowEl.appendChild(cancelBtn);
  rowEl.appendChild(confirmBtn);
  bodyEl.appendChild(msgEl);
  bodyEl.appendChild(rowEl);

  // ── Open modal — Modal.open() returns the backdrop element ──
  const backdrop = Modal.open(bodyEl, { title: 'Confirmation' });

  const safeClose = () => {
    try { resetGuard(); } catch {}
    try { Modal.close(); } catch {}
  };

  cancelBtn.addEventListener('click', () => {
    safeClose();
    if (typeof onCancel === 'function') onCancel();
  });

  confirmBtn.addEventListener('click', (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    safeClose();
    if (typeof onConfirm === 'function') onConfirm();
  });

  // If clicking outside closes the modal, reset guard too.
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) safeClose();
  });

  // ESC close reset guard (Modal also handles Esc; this ensures guard reset regardless).
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      safeClose();
    }
  };
  document.addEventListener('keydown', escHandler);

  return backdrop;
}


// ========== FORM VALIDATION ==========
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return phone.replace(/\D/g, '').length >= 8;
}

function validateRequired(value, minLength = 1) {
  return value.trim().length >= minLength;
}

// ========== DEBOUNCE ==========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========== FORMATER LE TEMPS ==========
function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// ========== MAJUSCULES ==========
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ========== CLASSE ACTIVE NAV ==========
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}

// ========== ANNÉE COURANTE ==========
function updateYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ========== NAVIGATE MOBILE ==========
function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Fermer en cliquant sur un lien
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// ========== HEADER SCROLL ==========
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// ========== QUANTITY CONTROLLER ==========
function createQuantityController(container, options = {}) {
  const {
    value = 1,
    min = 1,
    max = 99,
    onChange = () => {}
  } = options;

  let quantity = value;

  container.innerHTML = `
    <div class="quantity-control">
      <button class="quantity-btn minus" aria-label="Diminuer">−</button>
      <span class="quantity-value">${quantity}</span>
      <button class="quantity-btn plus" aria-label="Augmenter">+</button>
    </div>
  `;

  const minusBtn = container.querySelector('.minus');
  const plusBtn = container.querySelector('.plus');
  const valueSpan = container.querySelector('.quantity-value');

  function update() {
    valueSpan.textContent = quantity;
    minusBtn.disabled = quantity <= min;
    plusBtn.disabled = quantity >= max;
    onChange(quantity);
  }

  minusBtn.addEventListener('click', () => {
    if (quantity > min) {
      quantity--;
      update();
    }
  });

  plusBtn.addEventListener('click', () => {
    if (quantity < max) {
      quantity++;
      update();
    }
  });

  update();

  return {
    getValue: () => quantity,
    setValue: (val) => {
      quantity = Math.max(min, Math.min(max, val));
      update();
    }
  };
}

// ========== PLACEHOLDER IMAGE ==========
function getPlaceholderImage(category = 'food') {
  const colors = {
    pizzas: ['#e63946', '#c1121f'],
    pates: ['#ff9f1c', '#e8840e'],
    burgers: ['#8b4513', '#654321'],
    salades: ['#228b22', '#006400'],
    desserts: ['#da70d6', '#ba55d3'],
    boissons: ['#4169e1', '#1e90ff'],
    food: ['#e63946', '#ff9f1c']
  };

  const [color1, color2] = colors[category] || colors.food;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#grad)"/>
      <circle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.1)"/>
      <text x="200" y="160" text-anchor="middle" fill="white" font-size="60">🍕</text>
    </svg>
  `)}`;
}

// ========== EXPORTS ==========
window.showToast = showToast;
window.toast = toast;
window.Modal = Modal;
window.showConfirm = showConfirm;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateRequired = validateRequired;
window.debounce = debounce;
window.formatTime = formatTime;
window.capitalize = capitalize;
window.setActiveNavLink = setActiveNavLink;
window.updateYear = updateYear;
window.initMobileNav = initMobileNav;
window.initHeaderScroll = initHeaderScroll;
window.createQuantityController = createQuantityController;
window.getPlaceholderImage = getPlaceholderImage;

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  updateYear();
  initMobileNav();
  initHeaderScroll();

  // Initialiser le compteur du panier
  if (window.STORAGE) {
    STORAGE.updateCartCount();
  }
});