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
    namespace,
    members
  }
}) {
  let descr = Object.assign({}, namespace.description.childMarkdownRemark.htmlAst, {
    children: [{ type: 'element', tagName: 'header', children: (
      namespace.description.childMarkdownRemark.htmlAst.children.slice(0, 1)
    )}, ...namespace.description.childMarkdownRemark.htmlAst.children.slice(1)]
  });

  let docs = members.edges.map(({ node }) => ({
    descr: node.description.childMarkdownRemark.htmlAst,
    title: node.name.replace(/^.+#/, '.') + (node.returns ? `(${node.params ? (
      node.params.map(({ name, optional }, i) => (
        `${optional ? '[' : ''}${i > 0 ? ', ' : ''}${name}${optional ? ']' : ''}`
      )).join('')
    ) : ''})` : ''),
  }));

  return (
    <LayoutTemplate location={location} title={`${namespace.name} API`}>
      {renderAst => (
        <>
          <div>
            {renderAst(descr)}

            <ul>
              {docs.map(({ title }, i) => (
                <li key={i}>
                  <a href={`#${title}`}>
                    <code>{title}</code>
                  </a>
                </li>
              ))}
            </ul>

            {docs.map(({ title, descr, type }, i) => (
              <React.Fragment key={i}>
                <h2 id={title}>
                  <code>{title}</code>
                </h2>


                {renderAst(descr)}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </LayoutTemplate>
  );
}

export const query = graphql`
  query($slug: String!, $name: String!) {
    namespace: documentationJs(
      fields: { slug: { eq: $slug } }
    ) {
      name
      description { childMarkdownRemark { htmlAst } }
    }
    members: allDocumentationJs(
      filter: { memberof: { eq: $name } }
    ) {
      edges {
        node {
          name
          type { name }
          description { childMarkdownRemark { htmlAst } }
          params {
            name
            optional
            type { name }
            description { childMarkdownRemark { htmlAst } }
          }
          returns {
            type { name }
            description { childMarkdownRemark { htmlAst } }
          }
        }
      }
    }
  }
`;
