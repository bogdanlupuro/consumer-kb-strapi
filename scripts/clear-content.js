'use strict';

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');
const DEBUG = String(process.env.DEBUG || '').toLowerCase() === 'true';

// Debug HTTP logging
if (DEBUG) {
  axios.interceptors.request.use((config) => {
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || '';
    const params = config.params ? ` params=${JSON.stringify(config.params)}` : '';
    const data = config.data ? ` data=${typeof config.data === 'string' ? config.data : JSON.stringify(config.data)}` : '';
    console.log(`[HTTP] ${method} ${url}${params}${data}`);
    return config;
  });
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      const cfg = err.config || {};
      const method = (cfg.method || 'GET').toUpperCase();
      const url = cfg.url || '';
      const status = err.response?.status;
      const body = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      console.log(`[HTTP ERROR] ${method} ${url} -> ${status} ${body}`);
      return Promise.reject(err);
    }
  );
}

async function authenticate(STRAPI_URL) {
  const apiToken = process.env.STRAPI_API_TOKEN;
  const email = process.env.STRAPI_EMAIL;
  const password = process.env.STRAPI_PASSWORD;

  if (apiToken) return apiToken;

  if (email && password) {
    const res = await axios.post(`${STRAPI_URL}/admin/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data.data.token;
  }

  throw new Error('Missing STRAPI_API_TOKEN or STRAPI_EMAIL/STRAPI_PASSWORD');
}

// Hardcoded locales; extend as needed
function getKnownLocales() {
  return ['en', 'de'];
}

async function fetchAll(STRAPI_URL, token, path, params = {}) {
  const authHeader = { Authorization: `Bearer ${token}` };
  const pageSize = 100;
  let page = 1;
  const all = [];
  while (true) {
    const res = await axios.get(`${STRAPI_URL}${path}`, {
      params: { 'pagination[page]': page, 'pagination[pageSize]': pageSize, ...params },
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

async function deleteByIds(STRAPI_URL, token, path, ids) {
  const authHeader = { Authorization: `Bearer ${token}` };
  let deleted = 0;
  for (const id of ids) {
    try {
      if (DEBUG) console.log(`   → DELETE ${path}/${id}`);
      await axios.delete(`${STRAPI_URL}${path}/${id}`, { headers: { ...authHeader } });
      deleted += 1;
    } catch (e) {
      const msg = e.response?.data || e.message;
      console.error(`⚠️  Failed to delete ${path}/${id}:`, msg);
    }
  }
  return deleted;
}

async function deleteByDocumentIdsPerLocale(STRAPI_URL, token, path, docIds, locale) {
  const authHeader = { Authorization: `Bearer ${token}` };
  let deleted = 0;
  for (const docId of docIds) {
    try {
      const url = `${STRAPI_URL}${path}/${docId}?locale=${encodeURIComponent(locale)}`;
      if (DEBUG) console.log(`   → DELETE ${url}`);
      await axios.delete(url, { headers: { ...authHeader } });
      deleted += 1;
    } catch (e) {
      const msg = e.response?.data || e.message;
      console.error(`⚠️  Failed to delete ${path}/${docId} (locale=${locale}):`, msg);
    }
  }
  return deleted;
}

async function clearContent() {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
  console.log(`🧹 Clearing content on: ${STRAPI_URL}`);

  try {
    const token = await authenticate(STRAPI_URL);
    const authHeader = { Authorization: `Bearer ${token}` };
    const locales = getKnownLocales();

    // 1) Per-locale: list documentIds and delete by documentId scoped to locale
    let deletedArticles = 0;
    for (const locale of locales) {
      console.log(`🗂  Listing Articles (locale=${locale}, including drafts)...`);
      const arts = await fetchAll(STRAPI_URL, token, '/api/articles', {
        'publicationState': 'preview',
        'filters[locale][$eq]': locale,
        'fields[0]': 'documentId'
      });
      const docIds = Array.from(new Set(arts.map((a) => a.documentId).filter(Boolean)));
      console.log(`🗑  Deleting ${docIds.length} Article documents (locale=${locale})...`);
      if (DEBUG) console.log(`   DocumentIds (articles/${locale}): ${docIds.join(', ') || '(none)'}`);
      deletedArticles += await deleteByDocumentIdsPerLocale(STRAPI_URL, token, '/api/articles', docIds, locale);
      if (DEBUG) {
        const remain = await fetchAll(STRAPI_URL, token, '/api/articles', {
          'publicationState': 'preview',
          'filters[locale][$eq]': locale,
          'fields[0]': 'id'
        });
        console.log(`   Remaining after delete (articles/${locale}): ${remain.length}`);
      }
    }
    console.log(`✅ Deleted Articles total: ${deletedArticles}`);

    // 2) Per-locale: list documentIds and delete by documentId scoped to locale
    let deletedCategories = 0;
    for (const locale of locales) {
      console.log(`🗂  Listing Categories (locale=${locale})...`);
      const cats = await fetchAll(STRAPI_URL, token, '/api/categories', {
        'filters[locale][$eq]': locale,
        'fields[0]': 'documentId'
      });
      const docIds = Array.from(new Set(cats.map((c) => c.documentId).filter(Boolean)));
      console.log(`🗑  Deleting ${docIds.length} Category documents (locale=${locale})...`);
      if (DEBUG) console.log(`   DocumentIds (categories/${locale}): ${docIds.join(', ') || '(none)'}`);
      deletedCategories += await deleteByDocumentIdsPerLocale(STRAPI_URL, token, '/api/categories', docIds, locale);
      if (DEBUG) {
        const remain = await fetchAll(STRAPI_URL, token, '/api/categories', {
          'filters[locale][$eq]': locale,
          'fields[0]': 'id'
        });
        console.log(`   Remaining after delete (categories/${locale}): ${remain.length}`);
      }
    }
    console.log(`✅ Deleted Categories total: ${deletedCategories}`);

    // Verification step
    const remainingArticles = await fetchAll(STRAPI_URL, token, '/api/articles', { 'publicationState': 'preview', 'fields[0]': 'id', 'locale': 'all' });
    const remainingCategories = await fetchAll(STRAPI_URL, token, '/api/categories', { 'fields[0]': 'id', 'locale': 'all' });
    console.log(`🔎 Remaining - Articles: ${remainingArticles.length}, Categories: ${remainingCategories.length}`);

    console.log('\n🎉 Content cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing content:', error.response?.data || error.message);
    process.exit(1);
  }

  process.exit(0);
}

clearContent().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


