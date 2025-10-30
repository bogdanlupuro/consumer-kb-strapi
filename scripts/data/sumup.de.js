'use strict';

// German dataset placeholder — currently mirrors English until translations are provided
const categoryDescriptions = {
  'Profile & Security': 'Konto, Verifizierung (KYC), MFA und Profilgrundlagen',
  'Transfers': 'Senden, Empfangen, Limits und Verifizierungsprüfungen',
  'Wallet': 'Aufladungen, Zahlungsmethoden und unterstützte Karten',
  'Card': 'SumUp Pay Mastercard Nutzung, Gebühren, Abhebungen und Streitfälle',
  'Spaces': 'Persönliche und gemeinsame Spaces, Ziele und Überweisungen',
  'Bill Splitting': 'Rechnungen teilen, Gäste und Stornierungen',
  'Promotions': 'Empfehlungsprogramm, Promo-Codes und Belohnungen',
  'Paying Merchants': 'QR-Zahlungen und Zahlungslinks',
  'Support': 'Hilfe erhalten und Support kontaktieren'
};

// For now, reuse English titles/bodies; replace with real DE translations later
const { articles: enArticles } = require('./sumup.en');
// Mirror English structure and keys; replace title/body with DE when ready
const articles = enArticles;


module.exports = { categoryDescriptions, articles };


