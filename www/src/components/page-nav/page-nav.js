import React from 'react';
import PropTypes from 'prop-types';
import { Link, StaticQuery, graphql } from 'gatsby';
import classNames from 'classnames/bind';

import Icon from '../icon';
import items from '../../sidebar.yaml';
import style from './page-nav.module.css';
const cx = classNames.bind(style);

const flatItems = items.reduce(function flatten(flat, item) {
  if (item.slug) {
    flat = flat.concat(item);
  }

  if (item.items) {
    flat = flat.concat(
      item.items.reduce(flatten, []).map(i => ({
        ...i, parent: item.slug || item.section
      }))
    );
  }

  return flat;
}, []);

function getSiblingPages(slug, pages) {
  let i = flatItems.findIndex(item => item.slug === slug);
  let prev = flatItems[i - 1];
  let next = flatItems[i + 1];

  return pages.reduce((sibs, {
    fields: { slug },
    frontmatter: { title }
  }) => {
    if (slug === prev?.slug) {
      return [{ ...prev, title }, sibs[1]];
    } else if (slug === next?.slug) {
      return [sibs[0], { ...next, title }];
    } else {
      return sibs;
    }
  }, []);
}

PageNav.propTypes = {
  slug: PropTypes.string.isRequired
};

export default function PageNav({ slug }) {
  return (
    <StaticQuery
      query={graphql`
        query {
          pages: allMarkdownRemark(
            filter: {
              frontmatter: { title: { ne: "" } }
            }
          ) {
            nodes {
              fields { slug }
              frontmatter { title }
            }
          }
        }
      `}
      render={({ pages: { nodes: pages } }) => (
        <div className={style.pageNav}>
          {getSiblingPages(slug, pages).map((item, i) => item && (
            <Link key={i} to={item.slug} className={cx({ prev: !i, next: i })}>
              <span className={style.heading}>
                {i ? 'Next' : 'Previous'}
              </span>

              <span className={style.title}>
                {item.title}
              </span>

              <Icon name={i ? 'arrow-forward' : 'arrow-back'}/>
            </Link>
          ))}
        </div>
      )}
    />
  );
}
