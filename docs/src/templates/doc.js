import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';

import LayoutTemplate from './layout';

DocTemplate.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};

export default function DocTemplate({
  location,
  data: {
    page: {
      name,
      description,
      returns,
      params
    }
  }
}) {
  return (
    <LayoutTemplate location={location} title={name}>
      {renderAst => (
        <>
          <div>
            <header>
              <h1>{name}</h1>
            </header>

            {renderAst(description.htmlAst)}
          </div>
        </>
      )}
    </LayoutTemplate>
  );
}

export const query = graphql`
  query($slug: String!) {
    page: documentationJs(fields: { slug: { eq: $slug } }) {
      name
      description {
        childMarkdownRemark {
          htmlAst
        }
      }
      params {
        name
        type {
          name
        }
        description {
          childMarkdownRemark {
            htmlAst
          }
        }
      }
      returns {
        type {
          name
        }
        description {
          childMarkdownRemark {
            htmlAst
          }
        }
      }
    }
  }
`;
