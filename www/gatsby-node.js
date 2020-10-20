const { createFilePath } = require('gatsby-source-filesystem');

// on node creation, add a slug to specific nodes
exports.onCreateNode = ({ node, getNode, actions: { createNodeField } }) => {
  let slug;

  // markdown nodes that correlate to files
  if (node.internal.type === 'MarkdownRemark' && node.fileAbsolutePath) {
    slug = createFilePath({ node, getNode, basePath: 'docs' })
  }

  // documentation nodes that have a namespace
  if (node.internal.type === 'DocumentationJs' && node.kind === 'namespace') {
    slug = `/api/${node.name.toLowerCase()}/`;
  }

  // create a slug field for the node to later create pages
  if (slug) {
    createNodeField({ node, name: 'slug', value: slug });
  }
};

// create pages for all docs with slugs
exports.createPages = async ({ graphql, actions: { createPage } }) => {
  let { data, errors } = await graphql(`{
    page: allMarkdownRemark { edges { node { fields { slug } } } }
    doc: allDocumentationJs { edges { node { fields { slug }, name } } }
  }`)

  // throw errors
  if (errors) {
    throw errors;
  }

  // for each node in each datapoint
  for (let name in data) {
    for (let { node } of data[name].edges) {
      // create a page if there is a slug field
      if (node.fields && node.fields.slug) createPage({
        // use a component matching the datapoint name
        component: `${__dirname}/src/templates/${name}.js`,
        context: { slug: node.fields.slug, name: node.name },
        path: node.fields.slug
      });
    }
  }
};
