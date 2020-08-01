const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

exports.onCreateNode = ({ node, actions, getNode }) => {
  let { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    let slug = createFilePath({ node, getNode, basePath: 'content' });
    createNodeField({ node, name: 'slug', value: slug });
  }
};

exports.createPages = ({ actions, graphql }) => {
  let PageTemplate = path.resolve('src/templates/page.js');
  let { createPage } = actions;

  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.fields.slug,
        component: PageTemplate,
        context: {
          slug: node.fields.slug
        }
      });
    });
  });
};
