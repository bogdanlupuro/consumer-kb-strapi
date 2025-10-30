'use strict';

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');

async function addSumupArticles() {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

  const LOCALE = process.env.LOCALE || 'en';
  const BASE_LOCALE = process.env.BASE_LOCALE || 'en';
  // Load locale-specific dataset (fallback to en)
  let dataset;
  try {
    dataset = require(`./data/sumup.${LOCALE}`);
  } catch (e) {
    console.warn(`⚠️  Dataset for locale "${LOCALE}" not found. Falling back to EN.`);
    dataset = require('./data/sumup.en');
  }
  const { categories = [], articles: sumupArticles } = dataset;
  const categoryByKey = new Map(categories.map(c => [c.key, c]));

  const slug = (s) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  console.log(`📝 Adding ${sumupArticles.length} SumUp Pay articles to: ${STRAPI_URL} (locale=${LOCALE})`);

  const apiToken = process.env.STRAPI_API_TOKEN;
  const email = process.env.STRAPI_EMAIL;
  const password = process.env.STRAPI_PASSWORD;

  let token;

  try {
    if (apiToken) {
      console.log('🔐 Using API token for authentication...');
      token = apiToken;
      console.log('✅ API token authenticated\n');
    } else if (email && password) {
      console.log('🔐 Authenticating with email/password...');
      const authResponse = await axios.post(`${STRAPI_URL}/admin/login`, { email, password }, { headers: { 'Content-Type': 'application/json' } });
      token = authResponse.data.data.token;
      console.log('✅ Authenticated successfully\n');
    } else {
      console.error('❌ Authentication credentials required');
      process.exit(1);
    }

    // Ensure categories exist and build a name->id map
    console.log('📂 Ensuring categories exist...');
    const categoryNameToId = {};
    const uniqueCategoryNames = Array.from(new Set(sumupArticles.map(a => a.categoryName)));
    const uniqueCategoryKeys = Array.from(new Set(sumupArticles.map(a => a.categoryKey).filter(Boolean)));
    
    // Ensure categories defined with keys first
    for (const key of uniqueCategoryKeys) {
      const def = categoryByKey.get(key);
      if (!def) continue;
      const name = def.name;
      try {
        const authHeader = { Authorization: `Bearer ${token}` };
        const catExternalKey = `cat:${key}`;
        // If target locale is not base, link to base documentId
        let baseDocId;
        if (LOCALE !== BASE_LOCALE) {
          const baseRes = await axios.get(`${STRAPI_URL}/api/categories`, {
            params: { 'filters[external_key][$eq]': catExternalKey, 'filters[locale][$eq]': BASE_LOCALE, 'pagination[pageSize]': 1, 'fields[0]': 'documentId' },
            headers: { ...authHeader }
          });
          baseDocId = baseRes.data?.data?.[0]?.documentId;
        }

        const searchRes = await axios.get(`${STRAPI_URL}/api/categories`, {
          params: { 'filters[external_key][$eq]': catExternalKey, 'filters[locale][$eq]': LOCALE, 'pagination[pageSize]': 1 },
          headers: { ...authHeader }
        });
        if (Array.isArray(searchRes.data?.data) && searchRes.data.data.length > 0) {
          categoryNameToId[name] = searchRes.data.data[0].id;
        } else {
          let created;
          if (baseDocId && LOCALE !== BASE_LOCALE) {
            // Create or update localization via PUT with locale (localized fields only)
            created = await axios.put(
              `${STRAPI_URL}/api/categories/${baseDocId}?locale=${encodeURIComponent(LOCALE)}`,
              { data: { name, description: def.description || name } },
              { headers: { ...authHeader, 'Content-Type': 'application/json' } }
            );
          } else {
            // Create normal entry (base or no base found)
            created = await axios.post(
              `${STRAPI_URL}/api/categories`,
              { data: { name, description: def.description || name, locale: LOCALE, external_key: catExternalKey } },
              { headers: { ...authHeader, 'Content-Type': 'application/json' } }
            );
          }
          categoryNameToId[name] = created.data.data.id;
        }
      } catch (e) {
        console.error(`⚠️  Could not ensure category key "${key}":`, e.response?.data || e.message);
      }
    }

    // Ensure any remaining categories (without keys)
    for (const name of uniqueCategoryNames) {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };

        const fromKey = categories.find(c => c.name === name)?.key;
        const catExternalKey = fromKey ? `cat:${fromKey}` : `cat:${slug(name)}`;

        // Try to find existing category by external_key + locale
        let baseDocId;
        if (LOCALE !== BASE_LOCALE) {
          const baseRes = await axios.get(`${STRAPI_URL}/api/categories`, {
            params: { 'filters[external_key][$eq]': catExternalKey, 'filters[locale][$eq]': BASE_LOCALE, 'pagination[pageSize]': 1, 'fields[0]': 'documentId' },
            headers: { ...authHeader }
          });
          baseDocId = baseRes.data?.data?.[0]?.documentId;
        }

        const searchRes = await axios.get(
          `${STRAPI_URL}/api/categories`,
          {
            params: { 'filters[external_key][$eq]': catExternalKey, 'filters[locale][$eq]': LOCALE, 'pagination[pageSize]': 1 },
            headers: { ...authHeader }
          }
        );

        if (Array.isArray(searchRes.data?.data) && searchRes.data.data.length > 0) {
          categoryNameToId[name] = searchRes.data.data[0].id;
          continue;
        }

        // Create if not found
        let created;
        if (baseDocId && LOCALE !== BASE_LOCALE) {
          created = await axios.put(
            `${STRAPI_URL}/api/categories/${baseDocId}?locale=${encodeURIComponent(LOCALE)}`,
            { data: { name, description: (categories.find(c => c.name === name)?.description) || name } },
            { headers: { ...authHeader, 'Content-Type': 'application/json' } }
          );
        } else {
          created = await axios.post(
            `${STRAPI_URL}/api/categories`,
            { data: { name, description: (categories.find(c => c.name === name)?.description) || name, locale: LOCALE, external_key: catExternalKey } },
            { headers: { ...authHeader, 'Content-Type': 'application/json' } }
          );
        }
        categoryNameToId[name] = created.data.data.id;
      } catch (e) {
        console.error(`⚠️  Could not ensure category "${name}":`, e.response?.data || e.message);
      }
    }

    console.log('📝 Creating articles...\n');
    let created = 0;

    for (const article of sumupArticles) {
      if (created > 5) break;
      try {
        const authHeader = { Authorization: `Bearer ${token}` };
        const articleExternalKey = article.key || `art:${slug(article.title)}`;

        // Try to find existing article by external_key + locale
        const existingRes = await axios.get(`${STRAPI_URL}/api/articles`, {
          params: {
            'filters[external_key][$eq]': articleExternalKey,
            'filters[locale][$eq]': LOCALE,
            'pagination[pageSize]': 1,
            'fields[0]': 'documentId'
          },
          headers: { ...authHeader }
        });

        if (Array.isArray(existingRes.data?.data) && existingRes.data.data.length > 0) {
          // Update existing
          const docId = existingRes.data.data[0].documentId;
          const data = (LOCALE === BASE_LOCALE)
            ? { title: article.title, body: article.body, category: categoryNameToId[article.categoryName], featured: !!article.featured }
            : { title: article.title, body: article.body, featured: !!article.featured };
          await axios.put(
            `${STRAPI_URL}/api/articles/${docId}?locale=${encodeURIComponent(LOCALE)}`,
            { data },
            { headers: { ...authHeader, 'Content-Type': 'application/json' } }
          );
          // publish
          try {
            await axios.put(`${STRAPI_URL}/api/articles/${docId}?locale=${encodeURIComponent(LOCALE)}`, { data: { publishedAt: new Date().toISOString() } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
          } catch {}
          console.log(`♻️  Updated: "${article.title}"`);
          created++;
        } else {
          // Create
          if (LOCALE === BASE_LOCALE) {
            const createdArticle = await axios.post(
              `${STRAPI_URL}/api/articles`,
              { data: { title: article.title, body: article.body, category: categoryNameToId[article.categoryName], featured: !!article.featured, locale: LOCALE, external_key: articleExternalKey } },
              { headers: { ...authHeader, 'Content-Type': 'application/json' } }
            );
            const docId = createdArticle.data.data.documentId;
            await axios.put(`${STRAPI_URL}/api/articles/${docId}?locale=${encodeURIComponent(LOCALE)}`, { data: { publishedAt: new Date().toISOString() } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
            console.log(`✅ Created: "${article.title}"`);
            created++;
          } else {
            // Create localization via PUT to base doc
            const baseRes = await axios.get(`${STRAPI_URL}/api/articles`, { params: { 'filters[external_key][$eq]': articleExternalKey, 'filters[locale][$eq]': BASE_LOCALE, 'pagination[pageSize]': 1, 'fields[0]': 'documentId' }, headers: { ...authHeader } });
            const baseDocId = baseRes.data?.data?.[0]?.documentId;
            if (!baseDocId) { console.error(`⚠️  Missing base article for key ${articleExternalKey}`); continue; }
            await axios.put(`${STRAPI_URL}/api/articles/${baseDocId}?locale=${encodeURIComponent(LOCALE)}`, { data: { title: article.title, body: article.body, featured: !!article.featured } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
            try {
              await axios.put(`${STRAPI_URL}/api/articles/${baseDocId}?locale=${encodeURIComponent(LOCALE)}`, { data: { publishedAt: new Date().toISOString() } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
            } catch {}
            console.log(`✅ Localized: "${article.title}" (${LOCALE})`);
            created++;
          }
        }
      } catch (error) {
        console.error(`❌ Error creating "${article.title}":`, error.response?.data || error.message);
      }
    }

    console.log(`\n🎉 Successfully added ${created} SumUp Pay articles!`);
    console.log('📦 The articles have been automatically indexed in Meilisearch.');
  } catch (error) {
    console.error('❌ Error adding SumUp Pay articles:', error.response?.data || error.message);
    process.exit(1);
  }

  process.exit(0);
}

addSumupArticles().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


