'use strict';

# Content Seeding and Maintenance

## Prerequisites
- Set environment variables in `.env`:
```
STRAPI_URL=https://<your-strapi-url>
STRAPI_API_TOKEN=<token>  # or STRAPI_EMAIL / STRAPI_PASSWORD
```

## Seed SumUp Support Articles
Creates categories (if missing) and publishes articles.
```
npm run add:sumup
```

## Clear All Content
Deletes all Articles (by documentId, all locales/drafts) and all Categories.
```
npm run clear:content
```

Notes:
- Works with Strapi v5; publishing is handled by setting `publishedAt`.
- Categories used: Profile & Security, Transfers, Wallet, Card, Spaces, Bill Splitting, Promotions, Paying Merchants, Support.


