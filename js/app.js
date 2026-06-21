/* ===========================================
   PIZZIRIA BLIBLA - Application Principale
   Logique de la page d'accueil
   =========================================== */

(function() {
  'use strict';

  // ========== BEST SELLERS ==========
  function renderBestSellers() {
    const container = document.getElementById('homeBestsellers');
    if (!container) return;

    const bestSellers = getBestSellers().slice(0, 3);

    container.innerHTML = bestSellers.map(product => createProductCard(product)).join('');

    // Ajouter les événements aux boutons
    container.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', handleAddToCart);
    });

    // Révéler les cartes
    setTimeout(() => {
      ScrollReveal.revealAll();
    }, 100);
  }

  // ========== CRÉER UNE CARTE PRODUIT ==========
  function createProductCard(product) {
    const badgeHtml = product.badge ? getBadgeHtml(product.badge) : '';
    const categoryName = getCategoryName(product.category);

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrap">
          ${badgeHtml}
          <img
            class="product-image"
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
            onerror="this.src='${getPlaceholderImage(product.category)}'"
          />
          <div class="product-image-overlay"></div>
          <div class="product-actions">
            <button class="product-action-btn" title="Aperçu rapide" onclick="quickView(${product.id})">
              👁
            </button>
<button class="product-action-btn" title="${STORAGE.isFavorite(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}" onclick="toggleFavorite(${product.id})">

              ${STORAGE.isFavorite(product.id) ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
        <div class="product-content">
          <span class="product-category">${categoryName}</span>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <div class="product-price">
              ${product.price}
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

  // ========== BADGE HTML ==========
  function getBadgeHtml(badge) {
    const badgeClasses = {
      'Best Seller': 'badge badge-best',
      'Hot': 'badge badge-hot',
      'New': 'badge badge-new'
    };

    const badgeClass = badgeClasses[badge] || 'badge badge-promo';

    return `<div class="product-badge"><span class="${badgeClass}">${badge}</span></div>`;
  }

  // ========== NOM DE CATÉGORIE ==========
  function getCategoryName(categoryId) {
    const category = PIZZIRIA_DATA.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  // ========== AJOUTER AU PANIER (Frontend-only) ==========
  function handleAddToCart(e) {
    const btn = e.currentTarget;
    const productId = String(btn?.dataset?.productId ?? '').trim();
    const product = getProductById(productId);

    if (!product) return;

    // Auth gate via localStorage.currentUser
    const currentUser = window.STORAGE?.getCurrentUser?.();
    if (!currentUser) {
      showToast('Veuillez vous connecter pour ajouter au panier', 'warning');
      setTimeout(() => { window.location.href = 'auth.html'; }, 600);
      return;
    }

    // Animation de confirmation
    btn.classList.add('added');
    btn.innerHTML = '<span>✓</span> Ajouté';

    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '<span class="cart-icon">🛒</span> Ajouter';
    }, 1500);

    try {
      window.STORAGE.addToCart(product, 1);
      showToast(`${product.name} ajouté au panier`, 'success');
      try { window.dispatchEvent(new Event('cartUpdated')); } catch (_) {}
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'ajout au panier", 'error');
    }
  }



  // ========== TOGGLE FAVORITE ==========
  function toggleFavorite(productId) {
    if (STORAGE.isFavorite(productId)) {
      STORAGE.removeFromFavorites(productId);
      showToast('Retiré des favoris', 'info');
    } else {
      STORAGE.addToFavorites(productId);
      showToast('Ajouté aux favoris', 'success');
    }

    // Re-render si nécessaire
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
      const btn = card.querySelector('.product-action-btn:nth-child(2)');
      if (btn) {
        btn.textContent = STORAGE.isFavorite(productId) ? '❤️' : '🤍';
      }
    }
  }

  // ========== QUICK VIEW ==========
  function quickView(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const content = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl);">
        <div>
          <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: var(--radius-lg);" onerror="this.src='${getPlaceholderImage(product.category)}'">
        </div>
        <div>
          ${product.badge ? `<span style="background: var(--accent); color: white; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: 600;">${product.badge}</span>` : ''}
          <h3 style="font-size: var(--font-size-xl); margin: var(--space-sm) 0;">${product.name}</h3>
          <p style="color: var(--gray-4); font-size: var(--font-size-sm); margin-bottom: var(--space-md);">${product.description}</p>
          ${product.ingredients && product.ingredients.length > 0 ? `
            <div style="margin-bottom: var(--space-md);">
              <strong style="color: var(--gray-5); font-size: var(--font-size-sm);">Ingrédients:</strong>
              <p style="color: var(--gray-4); font-size: var(--font-size-xs);">${product.ingredients.join(', ')}</p>
            </div>
          ` : ''}
          <div style="font-size: var(--font-size-2xl); font-weight: 800; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: var(--space-lg);">
            ${product.price} DH
          </div>
          <button class="btn btn-primary btn-lg btn-block" onclick="Modal.close(); STORAGE.addToCart(getProductById(${product.id}), 1); showToast('${product.name} ajouté au panier', 'success');">
            🛒 Ajouter au panier
          </button>
        </div>
      </div>
    `;

    Modal.open(content, { title: product.name });
  }

  // ========== TESTIMONIALS ==========
  function renderTestimonials() {
    const container = document.getElementById('testimonials');
    if (!container) return;

    const testimonials = PIZZIRIA_DATA.testimonials;

    container.innerHTML = testimonials.map(t => `
      <article class="testimonial" data-reveal>
        <div class="testimonial-top">
          <div class="avatar">${t.avatar}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-meta">${t.orderType}</div>
          </div>
        </div>
        <div class="rating" aria-label="Note : ${t.rating} sur 5">
          ${generateStars(t.rating)}
        </div>
        <p class="testimonial-text">"${t.text}"</p>
      </article>
    `).join('');
  }

  // ========== PROMOS ==========
  function renderPromos() {
    const container = document.getElementById('promos');
    if (!container) return;

    const promos = PIZZIRIA_DATA.promos;

    container.innerHTML = promos.map(p => {
      const colorClass = p.color === 'success' ? 'promo-card-alt' : p.color === 'accent' ? 'promo-card-dark' : '';
      const badgeClass = p.color === 'success' ? 'promo-badge-2' : p.color === 'accent' ? 'promo-badge-3' : '';
      const badgeNum = p.badge.replace('%', '');

      return `
        <article class="promo-card ${colorClass}" data-reveal>
          <div class="promo-badge ${badgeClass}">${p.badge}</div>
          <h3 class="promo-title">${p.title}</h3>
          <p class="promo-text">${p.subtitle}</p>
          <div class="promo-actions">
            <a class="btn btn-primary" href="${p.link}">Profiter</a>
          </div>
        </article>
      `;
    }).join('');
  }

  // ========== FEATURES ==========
  function renderFeatures() {
    const container = document.getElementById('features');
    if (!container) return;

    const features = [
      { icon: '🥖', title: 'Pâte artisanale', text: 'Fermentation lente pour une texture incredible.' },
      { icon: '🧀', title: 'Fromage fondant', text: 'Moelleux au centre, croustillant sur les bords.' },
      { icon: '🌿', title: 'Ingrédients frais', text: 'Sélection rigoureuse, saveurs naturelles.' },
      { icon: '⚡', title: 'Livraison rapide', text: 'Préparée avec soin, livrée au bon moment.' }
    ];

    container.innerHTML = features.map(f => `
      <article class="feature-card" data-reveal>
        <div class="feature-icon" aria-hidden="true">${f.icon}</div>
        <h3 class="feature-title">${f.title}</h3>
        <p class="feature-text">${f.text}</p>
      </article>
    `).join('');
  }

  // ========== STATS ==========
  function renderStats() {
    const container = document.getElementById('heroStats');
    if (!container) return;

    container.innerHTML = `
      <div class="stat-card" data-reveal-delay="80">
        <div class="stat-value" data-counter="35" data-counter-suffix=" min">25–35 min</div>
        <div class="stat-label">Délai moyen</div>
      </div>
      <div class="stat-card" data-reveal-delay="140">
        <div class="stat-value" data-counter="100" data-counter-suffix="%">100%</div>
        <div class="stat-label">Ingrédients frais</div>
      </div>
      <div class="stat-card" data-reveal-delay="200">
        <div class="stat-value">4.9★</div>
        <div class="stat-label">Avis clients</div>
      </div>
    `;
  }

  // ========== INIT ==========
  function init() {
    // Ne s'exécute que sur la page d'accueil (index.html)
    if (!document.getElementById('homeBestsellers')) return;

    renderBestSellers();
    renderTestimonials();
    renderPromos();
    renderFeatures();
    renderStats();
  }

  // IMPORTANT: app.js ne doit pas casser les pages Menu/Cart/Orders/Admin.
  // Garder uniquement la logique homepage et éviter toute fuite de fonctions.
  // (Les pages menu utilisent js/menu.js)


  // Exécuter au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposer les fonctions globalement
  window.handleAddToCart = handleAddToCart;
  window.toggleFavorite = toggleFavorite;
  window.quickView = quickView;

})();