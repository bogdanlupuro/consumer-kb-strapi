# Knowledge Base Entity Relationship Diagram

## Overview

This document describes the data model for the Strapi Knowledge Base system, including entities, attributes, and relationships.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│           Category                  │
├─────────────────────────────────────┤
│ id (PK, locale-specific)            │
│ documentId (shared across locales)  │
│ name (localized) ✱                  │
│ description (localized) ✱           │
│ external_key (non-localized, unique)│
│ locale ✱                            │
├─────────────────────────────────────┤
│ Relationships:                      │
│ • has many Articles                 │
│ • has many Action Links             │
└─────────────────────────────────────┘
           │                    │
           │                    │
           │ 1                  │ 1
           │                    │
           │                    │
           ▼                    ▼
┌────────────────────┐  ┌──────────────────────┐
│      Article       │  │    Action Link       │
├────────────────────┤  ├──────────────────────┤
│ id (PK, locale)    │  │ id (PK, locale)      │
│ documentId         │  │ documentId           │
│ title (localized) ✱│  │ title (localized) ✱  │
│ body (localized) ✱ │  │ description (local.) │
│ featured (bool) ✱  │  │ path (non-localized) │
│ external_key       │  │ external_key         │
│   (non-localized,  │  │   (non-localized,    │
│    unique)         │  │    unique)           │
│ locale ✱           │  │ locale ✱             │
│ publishedAt        │  │ publishedAt          │
├────────────────────┤  ├──────────────────────┤
│ Relationships:     │  │ Relationships:       │
│ • belongs to       │  │ • belongs to         │
│   Category         │  │   Category           │
└────────────────────┘  └──────────────────────┘
           │                    │
           │                    │
           │ many               │ many
           │                    │
           │                    │
           └──────────┬─────────┘
                      │
                      │
                      ▼
            ┌──────────────────┐
            │    Category      │
            └──────────────────┘
```

---

## Entity Details

### Category

**Description:** Organizes articles and action links into groups.

**Attributes:**
- `id` (number, PK): Unique identifier per locale
- `documentId` (string): Shared ID across all locales
- `name` (string, localized, required): Category name
- `description` (text, localized, required): Category description
- `external_key` (string, non-localized, unique): Stable identifier (e.g., `cat:profile`)
- `locale` (string): Locale code (e.g., `en`, `de`)

**Relationships:**
- **One-to-Many** with `Article` (via `articles` relation)
- **One-to-Many** with `Action Link` (via `action_links` relation)

**Localization:** ✅ Yes (localized)

**Publishing:** ❌ No (always published)

---

### Article

**Description:** Knowledge base articles with markdown content.

**Attributes:**
- `id` (number, PK): Unique identifier per locale
- `documentId` (string): Shared ID across all locales
- `title` (string, localized, required): Article title
- `body` (richtext, localized, required): Article content (Markdown supported)
- `featured` (boolean, localized): Whether article is featured/top article
- `external_key` (string, non-localized, unique, required): Stable identifier (e.g., `sumup.overview`)
- `locale` (string): Locale code (e.g., `en`, `de`)
- `publishedAt` (timestamp): Publication date
- `createdAt` (timestamp): Creation date
- `updatedAt` (timestamp): Last update date

**Relationships:**
- **Many-to-One** with `Category` (via `category` relation)

**Localization:** ✅ Yes (localized)

**Publishing:** ✅ Yes (draft & publish)

---

### Action Link

**Description:** Deep links for quick navigation within the mobile app.

**Attributes:**
- `id` (number, PK): Unique identifier per locale
- `documentId` (string): Shared ID across all locales
- `title` (string, localized, required): Action link title
- `description` (text, localized): Action link description
- `path` (string, non-localized, required): Deep link path (domain-agnostic, e.g., `/kyc`)
- `external_key` (string, non-localized, unique, required): Stable identifier (e.g., `action.kyc.show`)
- `locale` (string): Locale code (e.g., `en`, `de`)
- `publishedAt` (timestamp): Publication date
- `createdAt` (timestamp): Creation date
- `updatedAt` (timestamp): Last update date

**Relationships:**
- **Many-to-One** with `Category` (via `category` relation)

**Localization:** ✅ Yes (localized)

**Publishing:** ✅ Yes (draft & publish)

---

## Relationship Details

### Category → Articles (One-to-Many)

- **Type:** One-to-Many
- **Owning side:** Article (contains `category` field)
- **Inverse side:** Category (contains `articles` field)
- **Cardinality:** One category can have many articles
- **Notes:** Articles must belong to a category

### Category → Action Links (One-to-Many)

- **Type:** One-to-Many
- **Owning side:** Action Link (contains `category` field)
- **Inverse side:** Category (contains `action_links` field)
- **Cardinality:** One category can have many action links
- **Notes:** Action links can optionally belong to a category

---

## Localization Strategy

All entities support **Strapi i18n localization**:

- **Localized fields:** `name`, `description`, `title`, `body`, `featured`
- **Non-localized fields:** `external_key`, `path` (for Action Links), `documentId`
- **Relations:** Non-localized (shared across locales), but referenced using locale-specific IDs

**Base Locale:** `en` (English)  
**Additional Locales:** `de` (German)

**Key Points:**
- `external_key` provides stable cross-locale references
- `documentId` links localized entries of the same entity
- Relations use locale-specific category IDs but represent the same logical category

---

## Key Identifiers

### External Keys

**Purpose:** Provide stable, human-readable identifiers that work across locales and environments.

**Format Examples:**
- Articles: `sumup.overview`, `wallet.topup`, `card.fees`
- Categories: `cat:profile`, `cat:transfers`, `cat:wallet`
- Action Links: `action.kyc.show`, `action.refer.friend`

**Usage:** Use `external_key` for filtering and referencing in API queries.

### Document IDs

**Purpose:** Link localized entries of the same entity together.

**Usage:** Use `documentId` for direct entity lookups (requires locale parameter).

---

## API Endpoints Summary

### Categories
- `GET /api/categories?locale={locale}`

### Articles
- `GET /api/articles?locale={locale}`
- `GET /api/articles/{documentId}?locale={locale}`
- `GET /api/articles?locale={locale}&filters[category][external_key][$eq]={key}`

### Action Links
- `GET /api/action-links?locale={locale}`
- `GET /api/action-links/{documentId}?locale={locale}`
- `GET /api/action-links?locale={locale}&filters[category][external_key][$eq]={key}`

---

## Legend

- **✱** = Localized field
- **PK** = Primary Key
- **(PK, locale-specific)** = Primary key that varies by locale
- **non-localized** = Same value across all locales
- **unique** = Unique constraint applied
- **required** = Field is required

---

## Notes

1. **Category `external_key`** is optional but recommended for stable filtering.
2. **Article `body`** supports Markdown formatting.
3. **Action Link `path`** is domain-agnostic (e.g., `/kyc` not `https://example.com/kyc`).
4. All entities support draft/publish workflow (except Categories, which are always published).
5. Use `populate=category` in API queries to include category details in responses.

