/* ===========================================
   PIZZIRIA BLIBLA - Animations Scroll Reveal
   Animations au défilement de la page
   =========================================== */

const ScrollReveal = {
  // Configuration
  config: {
    threshold: 0.15,
    rootMargin: '0px',
    once: true
  },

  // Éléments observés
  observer: null,

  // Initialiser l'observer
  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback pour navigateurs anciens
      document.querySelectorAll('[data-reveal]').forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.revealDelay || 0;

          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);

          // Ne plus observer après révélation
          if (this.config.once) {
            this.observer.unobserve(el);
          }
        }
      });
    }, this.config);

    // Observer tous les éléments
    document.querySelectorAll('[data-reveal]').forEach(el => {
      this.observer.observe(el);
    });
  },

  // Révéler manuellement un élément
  reveal(el) {
    if (!el) return;

    const delay = el.dataset.revealDelay || 0;

    setTimeout(() => {
      el.classList.add('revealed');
    }, delay);
  },

  // Révéler tous les éléments
  revealAll() {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      this.reveal(el);
    });
  }
};

// Animation de parallax léger
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  }, { passive: true });
}

// Animation de typing (pour les titres)
function initTypewriter() {
  const typewriterElements = document.querySelectorAll('[data-typewriter]');

  typewriterElements.forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    el.style.borderRight = '2px solid var(--primary)';

    let charIndex = 0;

    const type = () => {
      if (charIndex < text.length) {
        el.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(type, 50);
      } else {
        setTimeout(() => {
          el.style.borderRight = 'none';
        }, 1000);
      }
    };

    // Démarrer quand l'élément est visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(type, 500);
        observer.disconnect();
      }
    });

    observer.observe(el);
  });
}

// Animation counter (pour les statistiques)
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.counter);
    const duration = parseInt(counter.dataset.counterDuration) || 2000;
    const suffix = counter.dataset.counterSuffix || '';

    let current = 0;
    const increment = target / (duration / 16);
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(easeOut * target);

      counter.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(updateCounter);
        observer.disconnect();
      }
    });

    observer.observe(counter);
  });
}

// Export
window.ScrollReveal = ScrollReveal;
window.initParallax = initParallax;
window.initTypewriter = initTypewriter;
window.initCounters = initCounters;

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
  ScrollReveal.init();
  initParallax();
  initTypewriter();
  initCounters();
});