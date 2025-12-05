module.exports = ({ env }) => ({
  meilisearch: {
    config: {
      host: env('MEILISEARCH_HOST', 'https://ms-d1c67c9d137c-33016.fra.meilisearch.io'),
      apiKey: env('MEILISEARCH_API_KEY', '994f6388aea877c4e74667c40d7a66a229fde9250d4f1002ed51663db9168fe0'),
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
    },
  },
});
