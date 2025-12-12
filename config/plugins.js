module.exports = ({ env }) => ({
  meilisearch: {
    config: {
      host: env('MEILISEARCH_HOST', 'https://ms-d1c67c9d137c-33016.fra.meilisearch.io'),
      article: {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 10000,
        },
        transformEntry({ entry }) {
          return {
            ...entry,
            contentType: 'article',
          };
        },
        settings: {
          searchableAttributes: ['title', 'body'],
          filterableAttributes: ['category', 'contentType', 'locale', 'category.external_key'],
          sortableAttributes: ['createdAt', 'updatedAt'],
          displayedAttributes: [
            '_meilisearch_id',
            'action_links',
            'body',
            'contentType',
            'createdAt',
            'documentId',
            'external_key',
            'featured',
            'id',
            'locale',
            'title',
            'updatedAt',
          ],
        },
      },
      'action-link': {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 10000,
        },
        transformEntry({ entry }) {
          return {
            ...entry,
            contentType: 'action-link',
          };
        },
        settings: {
          searchableAttributes: ['title', 'body'],
          filterableAttributes: ['category', 'contentType', 'locale', 'category.external_key'],
          sortableAttributes: ['createdAt', 'updatedAt'],
          displayedAttributes: [
            '_meilisearch_id',
            'title',
            'body',
            'contentType',
            'path',
            'category',
            'external_key',
            'documentId',
            'id',
            'locale',
            'createdAt',
            'updatedAt',
          ],
        },
      },
    },
  },
});
