'use strict';

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');

async function addSumupArticles() {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

  const LOCALE = process.env.LOCALE || 'en';
  // Load locale-specific dataset (fallback to en)
  let dataset;
  try {
    dataset = require(`./data/sumup.${LOCALE}`);
  } catch (e) {
    console.warn(`⚠️  Dataset for locale "${LOCALE}" not found. Falling back to EN.`);
    dataset = require('./data/sumup.en');
  }
  const { categoryDescriptions, articles: sumupArticles } = dataset;

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
    
    for (const name of uniqueCategoryNames) {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };

        // Derive stable external key for category (prefer explicit key if provided in dataset later)
        const catExternalKey = `cat:${slug(name)}`;

        // Try to find existing category by external_key + locale
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
        const createRes = await axios.post(
          `${STRAPI_URL}/api/categories`,
          { data: { name, description: categoryDescriptions[name] || name, locale: LOCALE, external_key: catExternalKey } },
          { headers: { ...authHeader, 'Content-Type': 'application/json' } }
        );
        categoryNameToId[name] = createRes.data.data.id;
      } catch (e) {
        console.error(`⚠️  Could not ensure category "${name}":`, e.response?.data || e.message);
      }
    }

    console.log('📝 Creating articles...\n');
    let created = 0;

    for (const article of sumupArticles) {
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
          // Update existing (idempotent upsert)
          const docId = existingRes.data.data[0].documentId;
          await axios.put(
            `${STRAPI_URL}/api/articles/${docId}`,
            { data: { title: article.title, body: article.body, category: categoryNameToId[article.categoryName], featured: !!article.featured, locale: LOCALE } },
            { headers: { ...authHeader, 'Content-Type': 'application/json' } }
          );
          console.log(`♻️  Updated: "${article.title}"`);
          created++;
        } else {
          // Create draft
          const createResponse = await axios.post(
            `${STRAPI_URL}/api/articles`,
            { data: { title: article.title, body: article.body, category: categoryNameToId[article.categoryName], featured: !!article.featured, locale: LOCALE, external_key: articleExternalKey } },
            { headers: { ...authHeader, 'Content-Type': 'application/json' } }
          );

          const docId = createResponse.data.data.documentId;
          console.log(`✅ Created draft: "${article.title}"`);

          await axios.put(
            `${STRAPI_URL}/api/articles/${docId}`,
            { data: { publishedAt: new Date().toISOString() } },
            { headers: { ...authHeader, 'Content-Type': 'application/json' } }
          );

          console.log(`✅ Published: "${article.title}"`);
          created++;
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


