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
    doc: {
      name,
      description,
      members
    }
  }
}) {
  let descr = Object.assign({}, description.childMarkdownRemark.htmlAst, {
    children: [{ type: 'element', tagName: 'header', children: (
      description.childMarkdownRemark.htmlAst.children.slice(0, 1)
    )}, ...description.childMarkdownRemark.htmlAst.children.slice(1)]
  });

  let docs = members.static.map(({ name, description, params, returns, type }) => ({
    descr: description.childMarkdownRemark.htmlAst,
    title: name.replace(/^.+#/, '.') + (returns ? `(${params ? (
      params.map(({ name, optional }, i) => (
        `${optional ? '[' : ''}${i > 0 ? ', ' : ''}${name}${optional ? ']' : ''}`
      )).join('')
    ) : ''})` : ''),
  }));

  return (
    <LayoutTemplate location={location} title={`${name} API`}>
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
  query($slug: String!) {
    doc: documentationJs(fields: { slug: { eq: $slug } }) {
      name
      description { childMarkdownRemark { htmlAst } }
      members {
        static {
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
