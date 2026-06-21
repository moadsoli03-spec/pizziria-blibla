/* ===========================================
   PIZZIRIA BLIBLA - Générateur de Facture PDF
   Utilise jsPDF pour créer des factures professionnelles
   =========================================== */

// CDN jsPDF
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
script.onload = () => {
  window.jsPDF = window.jspdf.jsPDF;
  console.log('✅ jsPDF chargé avec succès');
};
document.head.appendChild(script);

const PDF_INVOICE = {
  // Générer un numéro de commande unique
  generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 900) + 100;
    return `PB-${year}${month}${day}-${random}`;
  },

  // Formater la date
  formatDate() {
    const date = new Date();
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  },

  // Formater l'heure
  formatTime() {
    const date = new Date();
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Générer la facture PDF
  // options: { subtotal, discount, finalTotal, promoCode }
  generate(cart, customerName = 'Client', options = {}) {

    if (typeof window.jspdf === 'undefined') {

      console.error('jsPDF non chargé');
      showToast('Erreur: impossible de générer le PDF', 'error');
      return null;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const orderNumber = this.generateOrderNumber();
    const orderDate = this.formatDate();
    const orderTime = this.formatTime();

    const subtotal = Number(options.subtotal) || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = Number(options.discount) || 0;
    const finalTotal = Number(options.finalTotal) || Math.max(0, subtotal - discount);
    const promoCode = String(options.promoCode || '').trim();


    // Couleurs de la marque
    const primaryColor = [230, 57, 70]; // Rouge
    const darkColor = [30, 30, 30];
    const grayColor = [120, 120, 120];

    // ========== HEADER ==========
    // Logo et nom
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 60, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('🍕', 12, 18, { align: 'left' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PIZZIRIA BLIBLA', 25, 16);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Pizza • Food Delivery', 25, 22);

    // Informations pizzéria (côté droit)
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Pizza Blibla', 150, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Casablanca, Maroc', 150, 17);
    doc.text('Tel: +212 6XX-XX-XX-XX', 150, 22);
    doc.text('contact@pizziria-blibla.ma', 150, 27);

    // ========== TITRE FACTURE ==========
    let y = 50;
    doc.setFillColor(250, 250, 250);
    doc.rect(0, y - 5, 210, 20, 'F');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 105, y + 8, { align: 'center' });

    // ========== INFORMATIONS COMMANDE ==========
    y = 80;

    // Colonne gauche - Info client
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT:', 20, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text(customerName, 20, y + 6);
    doc.text(`Commande: ${orderNumber}`, 20, y + 12);

    // Colonne droite - Date/Heure
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DATE:', 130, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text(orderDate, 130, y + 6);
    doc.text(`Heure: ${orderTime}`, 130, y + 12);

    // Ligne de séparation
    y = 105;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);

    // ========== TABLEAU DES ARTICLES ==========
    y = 120;

    // En-têtes du tableau
    doc.setFillColor(...primaryColor);
    doc.rect(20, y - 5, 170, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUIT', 25, y + 1);
    doc.text('QTE', 115, y + 1, { align: 'center' });
    doc.text('PRIX UNIT.', 140, y + 1, { align: 'center' });
    doc.text('TOTAL', 180, y + 1, { align: 'right' });

    // Corps du tableau
    y += 10;
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [252, 252, 252];

      doc.setFillColor(...bgColor);
      doc.rect(20, y - 4, 170, 8, 'F');

      // Tronquer le nom si trop long
      let itemName = item.name;
      if (itemName.length > 35) {
        itemName = itemName.substring(0, 32) + '...';
      }

      doc.text(itemName, 25, y);
      doc.text(item.quantity.toString(), 115, y, { align: 'center' });
      doc.text(`${item.price} DH`, 140, y, { align: 'center' });
      doc.text(`${itemTotal} DH`, 180, y, { align: 'right' });

      y += 8;
    });

    // Ligne de séparation avant le total
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);

    // ========== TOTAUX ==========
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Articles:', 130, y);
    doc.text(`${cart.reduce((sum, item) => sum + item.quantity, 0)}`, 180, y, { align: 'right' });

    y += 8;
    doc.text('Livraison:', 130, y);
    doc.setTextColor(0, 180, 100);
    doc.text('GRATUITE', 180, y, { align: 'right' });

    y += 12;
    doc.setFillColor(...primaryColor);
    doc.rect(120, y - 5, 90, 12, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    // Promo / Remise (optional)
    if (discount > 0 && promoCode) {
      y -= 2;
      doc.setFontSize(9);
      doc.setTextColor(...grayColor);
      doc.text(`Code promo: ${promoCode}`, 20, y);

      y += 6;
      doc.text('Remise:', 130, y);
      doc.text(`-${discount} DH`, 180, y, { align: 'right' });

      y += 6;
    }

    doc.setFontSize(12);
    doc.setTextColor(...grayColor);
    doc.setFillColor(...primaryColor);
    doc.rect(120, y - 5, 90, 12, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL À PAYER', 125, y + 2);
    doc.text(`${finalTotal} DH`, 180, y + 2, { align: 'right' });


    // ========== PIED DE PAGE ==========
    y = 240;

    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, 190, y);

    y += 10;
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Merci pour votre commande !', 105, y, { align: 'center' });

    y += 6;
    doc.setFontSize(7);
    doc.text('Pizziria Blibla - Casablanca, Maroc - www.pizziria-blibla.ma', 105, y, { align: 'center' });

    y += 8;
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('Ce document a été généré automatiquement. Aucune signature requise.', 105, y, { align: 'center' });

    // ========== CODE-BARRES SIMULÉ ==========
    y = 270;
    doc.setFillColor(...darkColor);
    doc.rect(150, y, 40, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(orderNumber, 170, y + 10, { align: 'center' });

    return {
      pdf: doc,
      orderNumber: orderNumber,
      total: finalTotal
    };
  },

  // Télécharger le PDF
  download(cart, customerName = 'Client', options = {}) {
    const result = this.generate(cart, customerName, options);


    if (result) {
      const filename = `Facture_${result.orderNumber}.pdf`;
      result.pdf.save(filename);
      return result;
    }

    return null;
  }
};

// Export global
window.PDF_INVOICE = PDF_INVOICE;