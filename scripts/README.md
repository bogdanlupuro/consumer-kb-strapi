'use strict';

# Content Seeding and Maintenance

## Prerequisites
- Set environment variables in `.env`:
```
STRAPI_URL=https://<your-strapi-url>
STRAPI_API_TOKEN=<token>  # or STRAPI_EMAIL / STRAPI_PASSWORD
```

## Seed SumUp Support Articles (locale-aware)
Creates categories (if missing) and publishes articles for a given locale using per-locale datasets in `scripts/data/`.
```
# default LOCALE=en
LOCALE=en npm run add:sumup
LOCALE=de npm run add:sumup
```

## Clear All Content
Deletes all Articles (by documentId, all locales/drafts) and all Categories.
```
npm run clear:content
```

Notes:
- Works with Strapi v5; publishing is handled by setting `publishedAt`.
- Categories used: Profile & Security, Transfers, Wallet, Card, Spaces, Bill Splitting, Promotions, Paying Merchants, Support.

## Seed localized versions from base (translations)
Creates localized Categories and Articles linked to the base entries by documentId.
```
# Example: add German localizations based on base English data
STRAPI_URL=http://localhost:1337 BASE_LOCALE=en LOCALE=de npm run add:sumup:locale
```
Use later when you have translated fields; script currently reuses English text and links localizations correctly.


