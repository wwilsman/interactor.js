import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';

import LayoutTemplate from './layout';
import PageNav from '../components/page-nav';
import TOC from '../components/toc';

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
        title
      }
    }
  }
}) {
  return (
    <LayoutTemplate location={location} title={title}>
      {renderAst => (
        <>
          <div>
            <header>
              <h1>{title}</h1>
            </header>

            {renderAst(htmlAst)}

            <PageNav slug={slug}/>
          </div>

          <TOC content={tableOfContents}/>
        </>
      )}
    </LayoutTemplate>
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
