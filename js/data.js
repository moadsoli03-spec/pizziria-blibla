/* ===========================================
   PIZZIRIA BLIBLA - Données des produits
   Base de données locale pour le food delivery
   =========================================== */

const PIZZIRIA_DATA = {
  // Catégories de produits
  categories: [
    {
      id: 'pizzas',
      name: 'Pizzas',
      icon: '🍕',
      description: 'Nos pizzas artisanales cuites au four'
    },
    {
      id: 'pates',
      name: 'Pâtes',
      icon: '🍝',
      description: 'Pâtes italiennes authentiques'
    },
    {
      id: 'burgers',
      name: 'Burgers',
      icon: '🍔',
      description: 'Burgers gourmet préparés minute'
    },
    {
      id: 'salades',
      name: 'Salades',
      icon: '🥗',
      description: 'Salades fraîches et légères'
    },
    {
      id: 'desserts',
      name: 'Desserts',
      icon: '🍰',
      description: 'Douceurs sucrées artisanales'
    },
    {
      id: 'boissons',
      name: 'Boissons',
      icon: '🥤',
      description: 'Boissons fraîches et chaudes'
    }
  ],

  // Liste complète des produits
  products: [
    // ========== PIZZAS ==========
    {
      id: 1,
      name: 'Margherita Classique',
      description: 'Sauce tomate San Marzano, mozzarella Fior di Latte, basilic frais et huile d\'olive extra vierge. Un classique indémodable.',
      price: 55,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=450&fit=crop',
      badge: 'Best Seller',
      ingredients: ['Tomate', 'Mozzarella', 'Basilic'],
      calories: 850,
      available: true
    },
    {
      id: 2,
      name: 'Diavola Infernale',
      description: 'Sauce tomate piquante, mozzarella, salami piquant, piments rojos et origan. Pour les amateurs de sensations fortes.',
      price: 75,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=450&fit=crop',
      badge: 'Hot',
      ingredients: ['Tomate', 'Mozzarella', 'Salami piquant', 'Piments'],
      calories: 980,
      available: true
    },
    {
      id: 3,
      name: 'Quattro Formaggi',
      description: 'Mozzarella, gorgonzola, parmesan et ricotta. Une symphonie fromagère qui fond en bouche.',
      price: 80,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Ricotta'],
      calories: 1100,
      available: true
    },
    {
      id: 4,
      name: 'Calzone Royale',
      description: 'Pâte farcie de mozzarella, jambon, champignons et œuf. Pliée et scellée à la main, cuite à perfection.',
      price: 85,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1600028068383-ea11a7a101f3?w=600&h=450&fit=crop',
      badge: 'Best Seller',
      ingredients: ['Mozzarella', 'Jambon', 'Champignons', 'Œuf'],
      calories: 1200,
      available: true
    },
    {
      id: 5,
      name: 'Végétarienne Fresh',
      description: 'Sauce tomate, mozzarella, aubergines grillées, peppers, oignons, champignons et olives noires.',
      price: 70,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=450&fit=crop',
      badge: 'New',
      ingredients: ['Tomate', 'Mozzarella', 'Légumes grillés', 'Olives'],
      calories: 780,
      available: true
    },
    {
      id: 6,
      name: 'Pepperoni Premium',
      description: 'Sauce tomate San Marzano, mozzarella fondant et double couche de pepperoni croustillant.',
      price: 72,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=450&fit=crop',
      badge: 'Best Seller',
      ingredients: ['Tomate', 'Mozzarella', 'Pepperoni'],
      calories: 1050,
      available: true
    },
    {
      id: 7,
      name: 'Hawaïenne Paradise',
      description: 'Sauce tomate, mozzarella, jambon blanc et ananas frais. Un voyage tropical dans votre assiette.',
      price: 68,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Tomate', 'Mozzarella', 'Jambon', 'Ananas'],
      calories: 920,
      available: true
    },
    {
      id: 8,
      name: 'Capricciosa Elegante',
      description: 'Sauce tomate, mozzarella, jambon, artichauts, champignons et olives. La pizza des connaisseurs.',
      price: 78,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Tomate', 'Mozzarella', 'Jambon', 'Artichauts', 'Champignons'],
      calories: 950,
      available: true
    },
    {
      id: 9,
      name: 'Truffe Noire Deluxe',
      description: 'Crème de truffe, mozzarella di bufala, champignons sauvages et roquette. L\'excellence à chaque bouchée.',
      price: 120,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop',
      badge: 'New',
      ingredients: ['Crème truffe', 'Mozzarella bufala', 'Champignons sauvages', 'Roquette'],
      calories: 880,
      available: true
    },
    {
      id: 10,
      name: 'BBQ Chicken Smoke',
      description: 'Sauce BBQ fumée, poulet grillé, bacon croustillant, oignons caramélisés et coriandre fraîche.',
      price: 82,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=450&fit=crop',
      badge: 'Hot',
      ingredients: ['Sauce BBQ', 'Poulet', 'Bacon', 'Oignons'],
      calories: 1020,
      available: true
    },

    // ========== PÂTES ==========
    {
      id: 11,
      name: 'Spaghetti Carbonara',
      description: 'Spaghetti al dente,guanciale croustillant, pecorino romano, jaune d\'œuf et poivre noir. La tradition romaine.',
      price: 65,
      category: 'pates',
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=450&fit=crop',
      badge: 'Best Seller',
      ingredients: ['Spaghetti', 'Guanciale', 'Pecorino', 'Jaune d\'œuf'],
      calories: 920,
      available: true
    },
    {
      id: 12,
      name: 'Penne Arrabbiata',
      description: 'Penne rigate sautées à l\'ail, tomates cerises, piments et basilic. Simple, relevé, authentique.',
      price: 50,
      category: 'pates',
      image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Penne', 'Ail', 'Tomates', 'Piments', 'Basilic'],
      calories: 680,
      available: true
    },
    {
      id: 13,
      name: 'Fettuccine Alfredo',
      description: 'Fettuccine fraîches, sauce crémeuse au parmesan et beurre. Un classique de la cuisine italienne.',
      price: 72,
      category: 'pates',
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Fettuccine', 'Crème', 'Parmesan', 'Beurre'],
      calories: 1050,
      available: true
    },
    {
      id: 14,
      name: 'Lasagna Bolognese',
      description: 'Feuilles de lasagna maison, ragout de bœuf mijoté, béchamel crémeuse et mozzarella gratinée.',
      price: 85,
      category: 'pates',
      image: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=600&h=450&fit=crop',
      badge: 'Best Seller',
      ingredients: ['Pâtes lasagna', 'Bœuf mijoté', 'Béchamel', 'Mozzarella'],
      calories: 1150,
      available: true
    },

    // ========== BURGERS ==========
    {
      id: 15,
      name: 'Classic Burger Smash',
      description: 'Deux steaks smashés croustillants, cheddar fondant, salade, tomate, oignons et sauce maison.',
      price: 60,
      category: 'burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop',
      badge: 'Best Seller',
      ingredients: ['Pain brioche', 'Steak smash', 'Cheddar', 'Sauce maison'],
      calories: 1250,
      available: true
    },
    {
      id: 16,
      name: 'Double Bacon Deluxe',
      description: 'Deux steaks, quadruple bacon fumé, cheddar, pickles maison et sauce barbecue fumée.',
      price: 78,
      category: 'burgers',
      image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=450&fit=crop',
      badge: 'Hot',
      ingredients: ['Pain', 'Steak', 'Bacon', 'Cheddar', 'BBQ'],
      calories: 1480,
      available: true
    },
    {
      id: 17,
      name: 'Veggie Burger Garden',
      description: 'Galette végétale aux légumes grillés, avocat, roquette, tomates séchées et sauce pesto.',
      price: 55,
      category: 'burgers',
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&h=450&fit=crop',
      badge: 'New',
      ingredients: ['Pain integral', 'Galette végétale', 'Avocat', 'Pesto'],
      calories: 780,
      available: true
    },
    {
      id: 18,
      name: 'Truffle Burger Premium',
      description: 'Steak wagyu, foie gras poêlé, truffe noire, roquette et mayonnaise à la truffe.',
      price: 140,
      category: 'burgers',
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=450&fit=crop',
      badge: 'New',
      ingredients: ['Pain brioché', 'Wagyu', 'Foie gras', 'Truffe'],
      calories: 1320,
      available: true
    },

    // ========== SALADES ==========
    {
      id: 19,
      name: 'César Chicken',
      description: 'Laitue romaine croquante, poulet grillé, parmesan, croûtons dorés et sauce César maison.',
      price: 48,
      category: 'salades',
      image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Laitue romaine', 'Poulet', 'Parmesan', 'Croûtons', 'César'],
      calories: 450,
      available: true
    },
    {
      id: 20,
      name: 'Salade Greek Fresh',
      description: 'Tomates, concombres, olives kalamata, feta grecque et huile d\'olive. Fraîcheur méditerranéenne.',
      price: 45,
      category: 'salades',
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Tomates', 'Concombre', 'Olives', 'Feta', 'Oignons'],
      calories: 320,
      available: true
    },
    {
      id: 21,
      name: 'Quinoa Power Bowl',
      description: 'Quinoa, avocat, edamame, mangue, grenade et vinaigrette citron-gingembre.',
      price: 52,
      category: 'salades',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop',
      badge: 'New',
      ingredients: ['Quinoa', 'Avocat', 'Edamame', 'Mangue', 'Grenade'],
      calories: 380,
      available: true
    },

    // ========== DESSERTS ==========
    {
      id: 22,
      name: 'Tiramisu Authentique',
      description: 'Biscuits savoiardi imbibés d\'espresso, crème mascarpone onctueuse et cacao pur. Le dessert italien par excellence.',
      price: 35,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=450&fit=crop',
      badge: 'Best Seller',
      ingredients: ['Mascarpone', 'Café espresso', 'Biscuits', 'Cacao'],
      calories: 420,
      available: true
    },
    {
      id: 23,
      name: 'Cheesecake New York',
      description: 'Gâteau au fromage crémeux sur fond de biscuit Graham, topping fruits rouges frais.',
      price: 38,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Cream cheese', 'Graham crackers', 'Fruits rouges'],
      calories: 480,
      available: true
    },
    {
      id: 24,
      name: 'Brownie Fondant',
      description: 'Brownie au chocolat noir 70%, cœur coulant, servi tiède avec boule de glace vanille.',
      price: 32,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&h=450&fit=crop',
      badge: 'Hot',
      ingredients: ['Chocolat noir', 'Beurre', 'Œufs', 'Glace vanille'],
      calories: 520,
      available: true
    },
    {
      id: 25,
      name: 'Panna Cotta Vanilla',
      description: 'Crème italienne vanillée, coullis de fruits rouges frais et feuille de menthe.',
      price: 28,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Crème', 'Vanille', 'Fruits rouges', 'Menthe'],
      calories: 280,
      available: true
    },

    // ========== BOISSONS ==========
    {
      id: 26,
      name: 'Coca-Cola Original',
      description: 'La classique recette de Coca-Cola. 33cl.',
      price: 12,
      category: 'boissons',
      image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&h=450&fit=crop',
      badge: null,
      ingredients: [],
      calories: 140,
      available: true
    },
    {
      id: 27,
      name: 'Jus d\'Orange Frais',
      description: 'Orange pressée du jour. Fraîcheur et vitamins garanties.',
      price: 18,
      category: 'boissons',
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Oranges fraîches'],
      calories: 110,
      available: true
    },
    {
      id: 28,
      name: 'Limonade Maison',
      description: 'Citron frais, menthe et eau pétillante. Rafraîchissante et légère.',
      price: 15,
      category: 'boissons',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&h=450&fit=crop',
      badge: 'New',
      ingredients: ['Citron', 'Menthe', 'Eau pétillante'],
      calories: 85,
      available: true
    },
    {
      id: 29,
      name: 'Milkshake Chocolat',
      description: 'Glace vanille, lait entier et chocolat belge. Onctueux et gourmand.',
      price: 25,
      category: 'boissons',
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=450&fit=crop',
      badge: null,
      ingredients: ['Glace vanille', 'Lait', 'Chocolat belge'],
      calories: 320,
      available: true
    },
    {
      id: 30,
      name: 'Eau Minérale 50cl',
      description: 'Eau minérale naturelle. 50cl.',
      price: 8,
      category: 'boissons',
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=450&fit=crop',
      badge: null,
      ingredients: [],
      calories: 0,
      available: true
    }
  ],

  // Promotions actives
  promos: [
    {
      id: 1,
      title: '2 Pizzas + Boisson',
      subtitle: 'Un combo premium pour partager',
      badge: '-20%',
      color: 'primary',
      link: 'menu.html'
    },
    {
      id: 2,
      title: 'Nouvelle Création',
      subtitle: 'Sauce signature + toppings uniques',
      badge: 'NEW',
      color: 'success',
      link: 'menu.html'
    },
    {
      id: 3,
      title: 'Offre du Midi',
      subtitle: 'Commande rapide, parfaite pour la pause',
      badge: '-15%',
      color: 'accent',
      link: 'menu.html'
    }
  ],

  // Témoignages
  testimonials: [
    {
      id: 1,
      name: 'Yasmine K.',
      avatar: 'Y',
      rating: 5,
      text: 'Incroyable ! Les bords sont parfaits et la sauce est ultra goûteuse. Je recommande à 100% !',
      orderType: 'Commande'
    },
    {
      id: 2,
      name: 'Mehdi B.',
      avatar: 'M',
      rating: 5,
      text: 'Top qualité ! Fromage fondant et ingrédients frais. Le service de livraison est impeccable.',
      orderType: 'Livraison'
    },
    {
      id: 3,
      name: 'Sara M.',
      avatar: 'S',
      rating: 5,
      text: 'La pizza Best Seller est une tuerie ! Je commande ici toutes les semaines maintenant.',
      orderType: 'Best Seller'
    },
    {
      id: 4,
      name: 'Omar F.',
      avatar: 'O',
      rating: 4.5,
      text: 'Excellente cuisine, rapide et savoureuse. Le tiramisu est divin !',
      orderType: 'Tiramisu'
    }
  ],

  // Commandes mock pour l'admin
  mockOrders: [
    {
      id: 'CMD-001',
      items: ['Margherita Classique', 'Diavola Infernale'],
      total: 130,
      status: 'pending',
      date: '12/05/2024 14:30'
    },
    {
      id: 'CMD-002',
      items: ['Classic Burger Smash', 'Frites'],
      total: 75,
      status: 'confirmed',
      date: '12/05/2024 13:15'
    },
    {
      id: 'CMD-003',
      items: ['Tiramisu Authentique', 'Coca-Cola'],
      total: 47,
      status: 'delivered',
      date: '12/05/2024 12:00'
    },
    {
      id: 'CMD-004',
      items: ['Spaghetti Carbonara'],
      total: 65,
      status: 'cancelled',
      date: '11/05/2024 20:45'
    },
    {
      id: 'CMD-005',
      items: ['Pepperoni Premium', 'Penne Arrabbiata'],
      total: 122,
      status: 'pending',
      date: '12/05/2024 15:00'
    }
  ],

  // Horaires d'ouverture
  hours: {
    monday: { open: '11:30', close: '23:30' },
    tuesday: { open: '11:30', close: '23:30' },
    wednesday: { open: '11:30', close: '23:30' },
    thursday: { open: '11:30', close: '23:30' },
    friday: { open: '11:30', close: '00:00' },
    saturday: { open: '11:30', close: '00:00' },
    sunday: { open: '12:00', close: '23:00' }
  },

  // Contact info
  contact: {
    phone: '+212 6XX-XX-XX-XX',
    email: 'contact@pizziria-blibla.ma',
    address: 'Casablanca, Maroc',
    socials: {
      instagram: '#',
      facebook: '#',
      tiktok: '#'
    }
  }
};

// Fonction pour récupérer les produits par catégorie
function getProductsByCategory(categoryId) {
  return PIZZIRIA_DATA.products.filter(p => p.category === categoryId);
}

// Fonction pour récupérer un produit par ID
function getProductById(id) {
  // Prioritize dynamic menu products stored in localStorage
  if (window.STORAGE?.getMenuProductsOrDefault) {
    const fromStorage = window.STORAGE.getMenuProductsOrDefault().find(p => String(p.id) === String(id));
    if (fromStorage) return fromStorage;
  }
  return PIZZIRIA_DATA.products.find(p => p.id === id);
}

// Fonction pour récupérer les best sellers
function getBestSellers() {
  return PIZZIRIA_DATA.products.filter(p => p.badge === 'Best Seller');
}

// Fonction pour récupérer les produits "Hot"
function getHotProducts() {
  return PIZZIRIA_DATA.products.filter(p => p.badge === 'Hot');
}

// Fonction pour récupérer les nouveaux produits
function getNewProducts() {
  return PIZZIRIA_DATA.products.filter(p => p.badge === 'New');
}

// Fonction pour rechercher des produits
function searchProducts(query) {
  const q = query.toLowerCase().trim();
  // Priorité aux produits admin (localStorage)
  const products = window.STORAGE?.getMenuProductsOrDefault?.() || PIZZIRIA_DATA.products;
  if (!q) return products;

  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.ingredients && p.ingredients.some(i => i.toLowerCase().includes(q)))
  );
}

// Fonction pour filtrer les produits
function filterProducts({ category, badge, search }) {
  // Priorité aux produits admin (localStorage), sinon fallback statique
  let products = (window.STORAGE?.getMenuProductsOrDefault?.() || [...PIZZIRIA_DATA.products]);

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (badge && badge !== 'all') {
    products = products.filter(p => p.badge === badge);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.ingredients && p.ingredients.some(i => i.toLowerCase().includes(q)))
    );
  }

  return products;
}

// Fonction pour formater le prix
function formatPrice(price) {
  return `${price} DH`;
}

// Fonction pour générer les étoiles de notation
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (halfStar) stars += '½';
  stars += '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
  return stars;
}

// Export pour usage global
window.PIZZIRIA_DATA = PIZZIRIA_DATA;
window.getProductsByCategory = getProductsByCategory;
window.getProductById = getProductById;
window.getBestSellers = getBestSellers;
window.getHotProducts = getHotProducts;
window.getNewProducts = getNewProducts;
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.formatPrice = formatPrice;
window.generateStars = generateStars;