/* ===========================================
   PIZZIRIA BLIBLA - Auth (Frontend-only localStorage)
   - NO API, NO fetch, NO JWT
   - Uses strict keys (via js/storage.js):
     localStorage.users
     localStorage.currentUser
   =========================================== */

(function () {
  'use strict';

  // IMPORTANT: auth.js MUST NOT depend on window.API.
  // It depends only on STORAGE (js/storage.js), which is localStorage-only.

  const ADMIN_EMAIL = 'admin@pizziriablibla.com';
  const ADMIN_PASSWORD = 'Admin12345';

  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const LOGIN_LOCK_KEY = '__pizziria_login_lock__';
  const REGISTER_LOCK_KEY = '__pizziria_register_lock__';

  function switchTab(tab) {
    if (!tabLogin || !tabRegister) return;
    if (tab === 'login') {
      tabLogin.classList.add('is-active');
      tabRegister.classList.remove('is-active');
      if (loginPanel) loginPanel.style.display = 'block';
      if (registerPanel) registerPanel.style.display = 'none';
    } else {
      tabLogin.classList.remove('is-active');
      tabRegister.classList.add('is-active');
      if (loginPanel) loginPanel.style.display = 'none';
      if (registerPanel) registerPanel.style.display = 'block';
    }
  }

  function getStorageOrShowError() {
    if (!window.STORAGE) {
      showToast('Erreur : stockage indisponible', 'error');
      throw new Error('STORAGE missing');
    }
    return window.STORAGE;
  }

  function renderAuthPanelIfPresent() {
    const authPanel = document.querySelector('.auth-panel');
    if (!authPanel) return;

    const storage = getStorageOrShowError();
    const current = storage.getCurrentUser ? storage.getCurrentUser() : null;
    if (!current) return;

    const isAdmin = current.role === 'admin';

    authPanel.innerHTML = `
      <div style="text-align: center; padding: var(--space-2xl);">
        <div style="font-size: 4rem; margin-bottom: var(--space-md);">${isAdmin ? '🔐' : '👋'}</div>
        <h3 style="margin-bottom: var(--space-sm);">Vous êtes connecté</h3>
        <div style="background: ${isAdmin ? 'rgba(230,57,70,0.1)' : 'rgba(0,204,136,0.1)'}; border: 1px solid ${isAdmin ? 'rgba(230,57,70,0.3)' : 'rgba(0,204,136,0.3)'}; border-radius: 8px; padding: 12px; margin-bottom: var(--space-lg);">
          <div style="font-size: var(--font-size-sm); color: ${isAdmin ? '#e63946' : '#00cc88'}; margin-bottom: 4px;">${isAdmin ? 'Compte Administrateur' : 'Compte Utilisateur'}</div>
          <div style="font-weight: 600;">${current.name || ''}</div>
          <div style="font-size: var(--font-size-sm); color: var(--gray-4);">${current.email || ''}</div>
        </div>
        <div style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
          <a class="btn btn-ghost" href="menu.html">Menu</a>
          ${isAdmin ? '<a class="btn btn-primary" href="admin.html">Dashboard Admin</a>' : ''}
          <button class="btn btn-accent" type="button" id="authLogoutBtn">Se déconnecter</button>
        </div>
      </div>
    `;

    const logoutBtn = document.getElementById('authLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => window.handleLogout(), { once: true });
    }
  }

  function validateLoginInputs() {
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    const errEmail = document.getElementById('errLoginEmail');
    const errPassword = document.getElementById('errLoginPassword');

    const email = String(emailInput?.value || '').trim();
    const password = String(passInput?.value || '');

    let ok = true;

    if (!email || !emailInput?.checkValidity?.()) {
      if (errEmail) {
        errEmail.textContent = 'Veuillez entrer un email valide.';
        errEmail.style.display = 'block';
      }
      ok = false;
    } else {
      if (errEmail) errEmail.style.display = 'none';
    }

    if (!password || password.length < 6) {
      if (errPassword) {
        errPassword.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
        errPassword.style.display = 'block';
      }
      ok = false;
    } else {
      if (errPassword) errPassword.style.display = 'none';
    }

    return { ok, email, password };
  }

  function handleLogin(e) {
    e.preventDefault();

    if (localStorage.getItem(LOGIN_LOCK_KEY) === '1') return;
    try { localStorage.setItem(LOGIN_LOCK_KEY, '1'); } catch {}


    try {
      const { ok, email, password } = validateLoginInputs();
      if (!ok) {
        showToast('Veuillez corriger les erreurs', 'error');
        return;
      }

      const storage = getStorageOrShowError();

      // Ensure admin exists (seed done by storage.js, but keep safety)
      const users = storage.getUsers();
      const admin = users.find(u => String(u.email).toLowerCase() === ADMIN_EMAIL.toLowerCase());
      if (!admin) {
        // If storage seed failed, we avoid crashing and show a clear error
        showToast('Admin indisponible. Réinitialisez le stockage (seed produits/users).', 'error');
        return;
      }

      const user = users.find(u => String(u.email).toLowerCase() === email.toLowerCase());
      if (!user || String(user.password) !== password) {
        const errPassword = document.getElementById('errLoginPassword');
        if (errPassword) {
          errPassword.textContent = 'Email ou mot de passe incorrect.';
          errPassword.style.display = 'block';
        }
        showToast('Email ou mot de passe incorrect', 'error');
        return;
      }

      storage.setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString()
      });

      showToast('Connexion réussie', 'success');

      setTimeout(() => {
        const target = user.role === 'admin' ? 'admin.html' : 'menu.html';
        window.location.href = target;
      }, 250);
    } finally {
      localStorage.removeItem(LOGIN_LOCK_KEY);
    }
  }

  function validateRegisterInputs() {
    const name = String(document.getElementById('registerName')?.value || '').trim();
    const emailInput = document.getElementById('registerEmail');
    const email = String(emailInput?.value || '').trim();
    const password = String(document.getElementById('registerPassword')?.value || '');
    const passwordConfirm = String(document.getElementById('registerPasswordConfirm')?.value || '');
    const termsCheckbox = document.querySelector('#registerForm input[type="checkbox"]');

    const errName = document.getElementById('errRegisterName');
    const errEmail = document.getElementById('errRegisterEmail');
    const errPassword = document.getElementById('errRegisterPassword');
    const errConfirm = document.getElementById('errRegisterPasswordConfirm');

    let ok = true;

    if (!name || name.length < 2) {
      if (errName) {
        errName.textContent = 'Le nom doit contenir au moins 2 caractères.';
        errName.style.display = 'block';
      }
      ok = false;
    } else if (errName) {
      errName.style.display = 'none';
    }

    if (!emailInput?.checkValidity?.() || !email) {
      if (errEmail) {
        errEmail.textContent = 'Veuillez entrer un email valide.';
        errEmail.style.display = 'block';
      }
      ok = false;
    } else if (errEmail) {
      errEmail.style.display = 'none';
    }

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (errEmail) {
        errEmail.textContent = 'Cet email est réservé à l\'administrateur.';
        errEmail.style.display = 'block';
      }
      ok = false;
    }

    if (!password || password.length < 6) {
      if (errPassword) {
        errPassword.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
        errPassword.style.display = 'block';
      }
      ok = false;
    } else if (errPassword) {
      errPassword.style.display = 'none';
    }

    if (password !== passwordConfirm) {
      if (errConfirm) {
        errConfirm.textContent = 'Les mots de passe ne correspondent pas.';
        errConfirm.style.display = 'block';
      }
      ok = false;
    } else if (errConfirm) {
      errConfirm.style.display = 'none';
    }

    if (!termsCheckbox?.checked) {
      showToast('Veuillez accepter les conditions d\'utilisation', 'warning');
      ok = false;
    }

    return { ok, name, email, password };
  }

  function handleRegister(e) {
    e.preventDefault();

    if (localStorage.getItem(REGISTER_LOCK_KEY) === '1') return;
    try { localStorage.setItem(REGISTER_LOCK_KEY, '1'); } catch {}



    try {
      const { ok, name, email, password } = validateRegisterInputs();
      if (!ok) {
        showToast('Veuillez corriger les erreurs', 'error');
        return;
      }

      const storage = getStorageOrShowError();
      const users = storage.getUsers();

      const exists = users.some(u => String(u.email).toLowerCase() === email.toLowerCase());
      if (exists) {
        showToast('Cet email est déjà utilisé', 'error');
        const errEmail = document.getElementById('errRegisterEmail');
        if (errEmail) {
          errEmail.textContent = 'Cet email est déjà utilisé.';
          errEmail.style.display = 'block';
        }
        return;
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      storage.saveUsers(users);

      storage.setCurrentUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      });

      showToast('Compte créé !', 'success');
      setTimeout(() => window.location.href = 'menu.html', 300);

    } finally {
      localStorage.removeItem(REGISTER_LOCK_KEY);
    }
  }

  function init() {
    if (!loginForm && !registerForm) return;

    // seed happens in js/storage.js; we only render current user and bind handlers

    // Bind tabs once
    if (tabLogin && tabLogin.dataset.bbAuthBound !== '1') {
      tabLogin.dataset.bbAuthBound = '1';
      tabLogin.addEventListener('click', () => switchTab('login'));
    }
    if (tabRegister && tabRegister.dataset.bbAuthBound !== '1') {
      tabRegister.dataset.bbAuthBound = '1';
      tabRegister.addEventListener('click', () => switchTab('register'));
    }

    // Bind forms once
    if (loginForm && loginForm.dataset.bbAuthLoginBound !== '1') {
      loginForm.dataset.bbAuthLoginBound = '1';
      loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm && registerForm.dataset.bbAuthRegisterBound !== '1') {
      registerForm.dataset.bbAuthRegisterBound = '1';
      registerForm.addEventListener('submit', handleRegister);
    }

    // Render session panel
    renderAuthPanelIfPresent();

    // remember after refresh
    const storage = window.STORAGE;
    const current = storage?.getCurrentUser?.();
    if (current) renderAuthPanelIfPresent();
  }

  function setupTabsSafe() {
    if (!tabLogin || !tabRegister) return;
    // already bound in init if present; keep this minimal to avoid duplicates
  }

  function setupFormsSafe() {
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    // password confirm live validation is optional (UI has its own logic elsewhere)
  }

  window.handleLogout = function () {
    try {
      window.STORAGE.logout();
    } catch {}
    showToast('Déconnexion réussie', 'info');
    setTimeout(() => window.location.reload(), 200);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

