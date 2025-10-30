'use strict';

require('dotenv').config();
const axios = require('axios');
// Load featured set from locale dataset

async function authenticate(STRAPI_URL) {
  const apiToken = process.env.STRAPI_API_TOKEN;
  const email = process.env.STRAPI_EMAIL;
  const password = process.env.STRAPI_PASSWORD;
  if (apiToken) return apiToken;
  if (email && password) {
    const res = await axios.post(`${STRAPI_URL}/admin/login`, { email, password }, { headers: { 'Content-Type': 'application/json' } });
    return res.data.data.token;
  }
  throw new Error('Missing STRAPI_API_TOKEN or STRAPI_EMAIL/STRAPI_PASSWORD');
}

async function fetchAllArticles(STRAPI_URL, token, locale) {
  const authHeader = { Authorization: `Bearer ${token}` };
  const pageSize = 100;
  let page = 1;
  const all = [];
  while (true) {
    const res = await axios.get(`${STRAPI_URL}/api/articles`, {
      params: {
        'publicationState': 'live',
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'filters[locale][$eq]': locale,
        'fields[0]': 'documentId',
        'fields[1]': 'title',
        'fields[2]': 'featured',
        'fields[3]': 'external_key'
      },
      headers: { ...authHeader }
    });
    const items = res.data?.data || [];
    all.push(...items);
    const meta = res.data?.meta?.pagination;
    if (!meta || page >= meta.pageCount) break;
    page += 1;
  }
  return all;
}

async function setFeatured(STRAPI_URL, token, docId, value) {
  const authHeader = { Authorization: `Bearer ${token}` };
  await axios.put(`${STRAPI_URL}/api/articles/${docId}`, { data: { featured: value } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
}

async function run() {
  const STRAPI_URL = process.env.STRAPI_URL;
  if (!STRAPI_URL) throw new Error('Set STRAPI_URL to your target Strapi URL');

  const LOCALE = process.env.LOCALE || 'en';
  let dataset;
  try { dataset = require(`./data/sumup.${LOCALE}`); } catch { dataset = require('./data/sumup.en'); }
  const featuredKeys = new Set(dataset.articles.filter(a => a.featured === true).map(a => a.key || a.title));
  console.log(`🔄 Syncing featured flags to ${STRAPI_URL} for ${featuredTitles.size} articles`);

  try {
    const token = await authenticate(STRAPI_URL);
    const existing = await fetchAllArticles(STRAPI_URL, token, LOCALE);

    let updates = 0;
    for (const art of existing) {
      const key = art.external_key || art.title;
      const shouldBeFeatured = featuredKeys.has(key);
      if (art.featured !== shouldBeFeatured) {
        await setFeatured(STRAPI_URL, token, art.documentId, shouldBeFeatured);
        console.log(`✅ ${shouldBeFeatured ? 'Featured' : 'Unfeatured'}: ${art.title}`);
        updates += 1;
      }
    }
    console.log(`\n🎉 Featured sync complete. Updated ${updates} article(s).`);
  } catch (e) {
    console.error('❌ Error:', e.response?.data || e.message);
    process.exit(1);
  }
  process.exit(0);
}

run();


