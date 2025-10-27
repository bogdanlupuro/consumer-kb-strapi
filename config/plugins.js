module.exports = ({ env }) => ({
  meilisearch: {
    config: {
      host: env('MEILISEARCH_HOST', 'https://ms-d1c67c9d137c-33016.fra.meilisearch.io'),
      apiKey: env('MEILISEARCH_API_KEY', '5d41a228f43240f3925af646b1f441dafa9cca86c3aafcb6b1fb62659a6cff81'),
      article: {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 1000,
        },
        settings: {
          searchableAttributes: ['title', 'body'],
          filterableAttributes: ['category', 'contentType'],
          sortableAttributes: ['createdAt', 'updatedAt'],
        },
      },
      category: {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 1000,
        },
        settings: {
          searchableAttributes: ['name', 'description'],
          filterableAttributes: ['name', 'contentType'],
          sortableAttributes: ['createdAt', 'updatedAt'],
        },
      },
      about: {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 1000,
        },
        settings: {
          searchableAttributes: ['title'],
          filterableAttributes: ['contentType'],
          sortableAttributes: ['createdAt', 'updatedAt'],
        },
      },
      global: {
        indexName: 'Consumer-KnowledgeBase',
        entriesQuery: {
          limit: 1000,
        },
        settings: {
          searchableAttributes: ['siteName', 'siteDescription'],
          filterableAttributes: ['contentType'],
          sortableAttributes: ['createdAt', 'updatedAt'],
        },
      },
    },
  },
});
