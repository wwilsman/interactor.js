import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import classNames from 'classnames/bind';

import Icon from '../icon';
import style from './block-link.module.css';
const cx = classNames.bind(style);

BlockLink.propTypes = {
  url: PropTypes.string.isRequired,
  inline: PropTypes.boolean,
  children: PropTypes.node
};

export default function BlockLink({ url, inline, children }) {
  return (
    <Link to={url} className={cx('blockLink', { inline })}>
      <span>{children}</span>
      <Icon name="arrow-forward"/>
    </Link>
  );
}
