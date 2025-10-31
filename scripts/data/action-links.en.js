'use strict';

// English dataset for Action Links
const actionLinks = [
  {
    key: 'action.kyc.show',
    title: 'Open Account',
    description: 'Navigate to the identity verification (KYC) process',
    path: '/kyc',
    categoryKey: 'profile'
  },
  {
    key: 'action.refer.friend',
    title: 'Refer a Friend',
    description: 'Open the referral program screen to invite friends',
    path: '/referafriend/app',
    categoryKey: 'promotions'
  },
  {
    key: 'action.zones.create',
    title: `Create Space`,
    description: 'Open the screen to create a new Zone (Space)',
    path: '/zones/create/app',
    categoryKey: 'spaces'
  },
  {
    key: 'action.card.physical.activate',
    title: 'Activate Card',
    description: 'Open the screen to activate your physical card',
    path: '/card/physical/activation/app',
    categoryKey: 'card'
  }
];

module.exports = { actionLinks };

