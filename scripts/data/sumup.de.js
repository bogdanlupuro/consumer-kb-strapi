'use strict';

// German dataset placeholder — currently mirrors English until translations are provided
const categories = [
  { key: 'profile', name: 'Profile & Security', description: 'Konto, Verifizierung (KYC), MFA und Profilgrundlagen' },
  { key: 'transfers', name: 'Transfers', description: 'Senden, Empfangen, Limits und Verifizierungsprüfungen' },
  { key: 'wallet', name: 'Wallet', description: 'Aufladungen, Zahlungsmethoden und unterstützte Karten' },
  { key: 'card', name: 'Card', description: 'SumUp Pay Mastercard Nutzung, Gebühren, Abhebungen und Streitfälle' },
  { key: 'spaces', name: 'Spaces', description: 'Persönliche und gemeinsame Spaces, Ziele und Überweisungen' },
  { key: 'bill-splitting', name: 'Bill Splitting', description: 'Rechnungen teilen, Gäste und Stornierungen' },
  { key: 'promotions', name: 'Promotions', description: 'Empfehlungsprogramm, Promo-Codes und Belohnungen' },
  { key: 'merchants', name: 'Paying Merchants', description: 'QR-Zahlungen und Zahlungslinks' },
  { key: 'support', name: 'Support', description: 'Hilfe erhalten und Support kontaktieren' }
];

// For now, reuse English titles/bodies; replace with real DE translations later
const { articles: enArticles } = require('./sumup.en');
// Mirror English structure and keys; replace title/body with DE when ready
const articles = enArticles;

module.exports = { categories, articles };


