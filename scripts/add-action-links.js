'use strict';

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');

async function addActionLinks() {
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

  const LOCALE = process.env.LOCALE || 'en';
  const BASE_LOCALE = process.env.BASE_LOCALE || 'en';
  
  // Load locale-specific dataset (fallback to en)
  let dataset;
  try {
    dataset = require(`./data/action-links.${LOCALE}`);
  } catch (e) {
    console.warn(`⚠️  Dataset for locale "${LOCALE}" not found. Falling back to EN.`);
    dataset = require('./data/action-links.en');
  }
  const { actionLinks } = dataset;

  // Also need categories to map categoryKey to category ID
  let categoryDataset;
  try {
    categoryDataset = require(`./data/sumup.${LOCALE}`);
  } catch (e) {
    categoryDataset = require('./data/sumup.en');
  }
  const { categories = [] } = categoryDataset;
  const categoryByKey = new Map(categories.map(c => [c.key, c]));

  console.log(`🔗 Adding ${actionLinks.length} action links to: ${STRAPI_URL} (locale=${LOCALE})`);

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

    // Build categoryKey -> category ID map (for current locale)
    console.log('📂 Looking up categories...');
    const categoryKeyToId = {};
    const uniqueCategoryKeys = Array.from(new Set(actionLinks.map(link => link.categoryKey).filter(Boolean)));
    
    for (const catKey of uniqueCategoryKeys) {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };
        const catExternalKey = `cat:${catKey}`;
        
        const categoryRes = await axios.get(`${STRAPI_URL}/api/categories`, {
          params: { 'filters[external_key][$eq]': catExternalKey, 'filters[locale][$eq]': LOCALE, 'pagination[pageSize]': 1 },
          headers: { ...authHeader }
        });
        
        if (Array.isArray(categoryRes.data?.data) && categoryRes.data.data.length > 0) {
          categoryKeyToId[catKey] = categoryRes.data.data[0].id;
        } else {
          console.warn(`⚠️  Category with key "${catKey}" not found. Action links will be created without category.`);
        }
      } catch (e) {
        console.error(`⚠️  Could not lookup category key "${catKey}":`, e.response?.data || e.message);
      }
    }

    console.log('🔗 Creating action links...\n');
    let created = 0;

    for (const link of actionLinks) {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };
        const linkExternalKey = link.key;

        // Try to find existing action link by external_key + locale
        const existingRes = await axios.get(`${STRAPI_URL}/api/action-links`, {
          params: {
            'filters[external_key][$eq]': linkExternalKey,
            'filters[locale][$eq]': LOCALE,
            'pagination[pageSize]': 1,
            'fields[0]': 'documentId'
          },
          headers: { ...authHeader }
        });

        if (Array.isArray(existingRes.data?.data) && existingRes.data.data.length > 0) {
          // Update existing
          const docId = existingRes.data.data[0].documentId;
          const categoryId = link.categoryKey ? categoryKeyToId[link.categoryKey] : undefined;
          
          const data = (LOCALE === BASE_LOCALE)
            ? { 
                title: link.title, 
                description: link.description, 
                path: link.path, // path is non-localized
                category: categoryId,
                external_key: linkExternalKey
              }
            : { 
                title: link.title, 
                description: link.description,
                category: categoryId // category is non-localized but needs locale-specific category ID
                // path is non-localized, external_key is non-localized
              };
          
          await axios.put(
            `${STRAPI_URL}/api/action-links/${docId}?locale=${encodeURIComponent(LOCALE)}`,
            { data },
            { headers: { ...authHeader, 'Content-Type': 'application/json' } }
          );
          // publish
          try {
            await axios.put(`${STRAPI_URL}/api/action-links/${docId}?locale=${encodeURIComponent(LOCALE)}`, { data: { publishedAt: new Date().toISOString() } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
          } catch {}
          console.log(`♻️  Updated: "${link.title}"`);
          created++;
        } else {
          // Create
          if (LOCALE === BASE_LOCALE) {
            const categoryId = link.categoryKey ? categoryKeyToId[link.categoryKey] : undefined;
            const createdLink = await axios.post(
              `${STRAPI_URL}/api/action-links`,
              { 
                data: { 
                  title: link.title, 
                  description: link.description, 
                  path: link.path,
                  category: categoryId,
                  locale: LOCALE, 
                  external_key: linkExternalKey 
                } 
              },
              { headers: { ...authHeader, 'Content-Type': 'application/json' } }
            );
            const docId = createdLink.data.data.documentId;
            await axios.put(`${STRAPI_URL}/api/action-links/${docId}?locale=${encodeURIComponent(LOCALE)}`, { data: { publishedAt: new Date().toISOString() } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
            console.log(`✅ Created: "${link.title}"`);
            created++;
          } else {
            // Create localization via PUT to base doc
            const baseRes = await axios.get(`${STRAPI_URL}/api/action-links`, { 
              params: { 
                'filters[external_key][$eq]': linkExternalKey, 
                'filters[locale][$eq]': BASE_LOCALE, 
                'pagination[pageSize]': 1, 
                'fields[0]': 'documentId' 
              }, 
              headers: { ...authHeader } 
            });
            const baseDocId = baseRes.data?.data?.[0]?.documentId;
            if (!baseDocId) { 
              console.error(`⚠️  Missing base action link for key ${linkExternalKey}`); 
              continue; 
            }
            const categoryId = link.categoryKey ? categoryKeyToId[link.categoryKey] : undefined;
            await axios.put(
              `${STRAPI_URL}/api/action-links/${baseDocId}?locale=${encodeURIComponent(LOCALE)}`, 
              { 
                data: { 
                  title: link.title, 
                  description: link.description,
                  category: categoryId // category is non-localized but needs locale-specific category ID
                  // path is non-localized, keep it from base
                } 
              }, 
              { headers: { ...authHeader, 'Content-Type': 'application/json' } }
            );
            try {
              await axios.put(`${STRAPI_URL}/api/action-links/${baseDocId}?locale=${encodeURIComponent(LOCALE)}`, { data: { publishedAt: new Date().toISOString() } }, { headers: { ...authHeader, 'Content-Type': 'application/json' } });
            } catch {}
            console.log(`✅ Localized: "${link.title}" (${LOCALE})`);
            created++;
          }
        }
      } catch (error) {
        console.error(`❌ Error creating "${link.title}":`, error.response?.data || error.message);
      }
    }

    console.log(`\n🎉 Successfully added ${created} action links!`);
  } catch (error) {
    console.error('❌ Error adding action links:', error.response?.data || error.message);
    process.exit(1);
  }

  process.exit(0);
}

addActionLinks().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

