import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  keywords: PropTypes.arrayOf(PropTypes.string)
};

export default function SEO({
  title,
  description = '',
  lang = 'en',
  meta = [],
  keywords = []
}) {
  let {
    site: {
      siteMetadata: {
        author,
        description: metaDescription,
        title: metaTitle
      }
    }
  } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          author
          description
          title
        }
      }
    }
  `);

  return (
    <Helmet
      title={title}
      titleTemplate={`%s | ${metaTitle}`}
      htmlAttributes={{ lang }}
      meta={[
        {
          name: 'description',
          content: description || metaDescription
        },
        {
          property: 'og:title',
          content: title
        },
        {
          property: 'og:description',
          content: description || metaDescription
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'twitter:card',
          content: 'summary'
        },
        {
          name: 'twitter:creator',
          content: author
        },
        {
          name: 'twitter:title',
          content: title
        },
        {
          name: 'twitter:description',
          content: description || metaDescription
        }
      ].concat(keywords.length > 0 ? {
        name: 'keywords',
        content: keywords.join(`, `)
      } : []).concat(meta)}
    />
  );
}
