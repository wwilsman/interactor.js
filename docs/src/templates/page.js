import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import RehypeReact from 'rehype-react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import Sidebar from '../components/sidebar';
import PageNav from '../components/page-nav';
import TOC from '../components/toc';
import Hint from '../components/hint';
import BlockLink from '../components/block-link';

const rehype = new RehypeReact({
  createElement: React.createElement,
  components: {
    hint: Hint,
    'block-link': BlockLink
  }
});

// make initial node a fragment
function renderAst(tree) {
  let reply = rehype.Compiler(tree);

  return reply.type === 'div' ? (
    <>{reply.props.children}</>
  ) : reply;
}

PageTemplate.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};

export default function PageTemplate({
  location,
  data: {
    page: {
      htmlAst,
      tableOfContents,
      fields: {
        slug
      },
      frontmatter: {
        title,
        description
      }
    },
    all
  }
}) {
  let [isOpen, setOpen] = useState(false);

  return (
    <Layout onNavToggle={() => setOpen(!isOpen)}>
      <SEO
        title={title}
        description={description}
      />

      <Sidebar
        location={location}
        onClose={() => setOpen(false)}
        open={isOpen}
      />

      <article>
        <div>
          <header>
            <h1>{title}</h1>
          </header>

          {renderAst(htmlAst)}

          <PageNav slug={slug}/>
        </div>

        <TOC content={tableOfContents}/>
      </article>
    </Layout>
  );
}

export const query = graphql`
  query($slug: String!) {
    page: markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      tableOfContents
      fields {
        slug
      }
      frontmatter {
        title,
        # description
      }
    }
  }
`;
