'use strict';

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');

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
      await axios.delete(`${STRAPI_URL}${path}/${id}`, { headers: { ...authHeader } });
      deleted += 1;
    } catch (e) {
      const msg = e.response?.data || e.message;
      console.error(`⚠️  Failed to delete ${path}/${id}:`, msg);
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

    // 1) Delete Articles documents first (delete by documentId to remove all locales/versions)
    console.log('🗂  Listing Articles (including drafts)...');
    const articles = await fetchAll(
      STRAPI_URL,
      token,
      '/api/articles',
      {
        'publicationState': 'preview',
        'fields[0]': 'documentId'
      }
    );
    const documentIds = Array.from(new Set(articles.map((a) => a.documentId).filter(Boolean)));
    console.log(`🗑  Deleting ${documentIds.length} Article documents...`);
    let deletedArticles = 0;
    for (const docId of documentIds) {
      try {
        await axios.delete(`${STRAPI_URL}/api/articles/${docId}`, { headers: { ...authHeader } });
        deletedArticles += 1;
      } catch (e) {
        const msg = e.response?.data || e.message;
        console.error(`⚠️  Failed to delete /api/articles/${docId}:`, msg);
      }
    }
    console.log(`✅ Deleted Article documents: ${deletedArticles}`);

    // 2) Delete Categories by documentId to remove all locales
    console.log('🗂  Listing Categories (all locales)...');
    const categories = await fetchAll(
      STRAPI_URL,
      token,
      '/api/categories',
      {
        'fields[0]': 'documentId'
      }
    );
    const categoryDocIds = Array.from(new Set(categories.map((c) => c.documentId).filter(Boolean)));
    console.log(`🗑  Deleting ${categoryDocIds.length} Category documents...`);
    let deletedCategories = 0;
    for (const docId of categoryDocIds) {
      try {
        await axios.delete(`${STRAPI_URL}/api/categories/${docId}`, { headers: { ...authHeader } });
        deletedCategories += 1;
      } catch (e) {
        const msg = e.response?.data || e.message;
        console.error(`⚠️  Failed to delete /api/categories/${docId}:`, msg);
      }
    }
    console.log(`✅ Deleted Category documents: ${deletedCategories}`);

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


