// Both content types share the same index, so settings must be a superset of both.
// The last content type re-indexed will overwrite the index settings.
const sharedSettings = {
  searchableAttributes: ['title', 'body'],
  filterableAttributes: ['category', 'contentType', 'locale', 'category.external_key'],
  sortableAttributes: ['createdAt', 'updatedAt'],
  displayedAttributes: [
    '_meilisearch_id',
    'action_links',
    'body',
    'category',
    'contentType',
    'createdAt',
    'documentId',
    'external_key',
    'featured',
    'id',
    'locale',
    'path',
    'title',
    'updatedAt',
  ],
};

module.exports = ({ env }) => ({
  meilisearch: {
    config: {
      host: env('MEILISEARCH_HOST', 'https://ms-d1c67c9d137c-33016.fra.meilisearch.io'),
      article: {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 10000,
          locale: '*',
        },
        transformEntry({ entry }) {
          return {
            ...entry,
            contentType: 'article',
          };
        },
        settings: sharedSettings,
      },
      'action-link': {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 10000,
          locale: '*',
        },
        transformEntry({ entry }) {
          return {
            ...entry,
            contentType: 'action-link',
          };
        },
        settings: sharedSettings,
      },
    },
  },
});
