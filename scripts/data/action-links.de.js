'use strict';

// Deutsche Daten für Action Links
const actionLinks = [
  {
    key: 'action.kyc.show',
    title: 'Konto eröffnen',
    description: 'Zur Identitätsprüfung (KYC) navigieren',
    path: '/kyc',
    categoryKey: 'profile'
  },
  {
    key: 'action.refer.friend',
    title: 'Freund empfehlen',
    description: 'Empfehlungsprogramm-Bildschirm öffnen, um Freunde einzuladen',
    path: '/referafriend/app',
    categoryKey: 'promotions'
  },
  {
    key: 'action.zones.create',
    title: 'Space erstellen',
    description: 'Bildschirm öffnen, um eine neue Zone (Space) zu erstellen',
    path: '/zones/create/app',
    categoryKey: 'spaces'
  },
  {
    key: 'action.card.physical.activate',
    title: 'Karte aktivieren',
    description: 'Bildschirm öffnen, um Ihre physische Karte zu aktivieren',
    path: '/card/physical/activation/app',
    categoryKey: 'card'
  }
];

module.exports = { actionLinks };

