import React, {
  Fragment,
  useState,
  useEffect,
  useRef
} from 'react';

import PropTypes from 'prop-types';
import { StaticQuery, graphql, Link } from 'gatsby';
import classNames from 'classnames/bind';

import Icon from '../icon';
import items from '../../sidebar.yaml';
import style from './sidebar.module.css';
const cx = classNames.bind(style);

function getItemTitle({ slug }, data) {
  let { nodes } = data.allMarkdownRemark;
  let item = nodes.find(node => node.fields.slug === slug);
  return item && item.frontmatter.title;
}

function isItemActive({ slug }, { pathname }) {
  return slug.substr(1, slug.length - 2) === pathname.replace(/^\/|\/$/g, '');
}

function isItemActiveParent({ slug }, { pathname }) {
  return slug.substr(1, slug.length - 2) === pathname.split('/')[1];
}

function renderItem(item, i, data, location) {
  let isParent = !!item.items;
  let isActive = isItemActive(item, location);
  let isActiveParent = isItemActiveParent(item, location);
  let className = cx({ isParent, isActive, isActiveParent });

  return (
    <li key={i} className={className}>
      {item.slug && (
        <Link to={item.slug}>
          {getItemTitle(item, data)}

          {isParent && (
            <Icon name={
              (isActive || isActiveParent)
                ? 'expand-more'
                : 'chevron-right'
            }/>
          )}
        </Link>
      )}
      {isParent && (
        <ul>
          {item.items.map((item, i) => (
            renderItem(item, i, data, location)
          ))}
        </ul>
      )}
    </li>
  );
}

Sidebar.propTypes = {
  location: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool
};

export default function Sidebar({ location, open, onClose }) {
  let [maxHeight, setHeight] = useState('none');
  let ref = useRef(null);

  useEffect(() => {
    let handleScroll = () => {
      if (ref.current) {
        let { y: top } = ref.current.getBoundingClientRect();
        let newHeight = `calc(100vh - ${top}px)`;
        if (maxHeight !== newHeight) setHeight(newHeight);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let sections = [{
    items: items.filter(item => !item.section)
  }].concat(
    items.filter(item => item.section)
  );

  return (
    <StaticQuery
      query={graphql`
        query {
          allMarkdownRemark {
            nodes {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      `}
      render={data => (
        <>
          <aside className={cx('sidebarContainer', { isOpen: open })}>
            <div ref={ref} className={style.sidebar} style={{ maxHeight }}>
              {sections.map((section, i) => (
                <Fragment key={i}>
                  {section.section && (
                    <span className={style.section}>
                      {section.section}
                    </span>
                  )}

                  <ul>
                    {section.items.map((item, i) => (
                      renderItem(item, i, data, location))
                    )}
                  </ul>
                </Fragment>
              ))}

              <a
                href="https://github.com/wwilsman/interactor.js"
                className={style.link}
                target="blank"
              >
                <Icon name="github" />
              </a>
            </div>
          </aside>

          {open && (
            <div
              className={style.sidebarOverlay}
              onClick={onClose}
            />
          )}
        </>
      )}
    />
  );
}
