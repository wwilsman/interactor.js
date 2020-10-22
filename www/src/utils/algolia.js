module.exports = [
  {
    indexName: 'Next',
    query: `{
      allMarkdownRemark {
        nodes {
          objectID: id
          fields { slug }
          frontmatter { title }
          excerpt(pruneLength: 5000)
        }
      }
    }`,
    transformer: ({ data }) => (
      data.allMarkdownRemark.nodes.map(({
        fields,
        frontmatter,
        ...rest
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
