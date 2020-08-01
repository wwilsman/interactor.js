module.exports = [
  {
    indexName: 'Docs',
    query: `{
      allMarkdownRemark {
        edges {
          node {
            objectID: id
            fields {
              slug
            }
            frontmatter {
              title
            }
            excerpt(pruneLength: 5000)
          }
        }
      }
    }`,
    transformer: ({ data }) => (
      data.allMarkdownRemark.edges.map(({
        node: {
          fields,
          frontmatter,
          ...rest
        }
      }) => ({
        ...fields,
        ...frontmatter,
        ...rest
      }))
    ),
    settings: {
      attributesToSnippet: [
        'excerpt:20'
      ]
    }
  }
];
