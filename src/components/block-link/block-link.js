import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import Icon from '../icon';
import style from './block-link.module.css';

BlockLink.propTypes = {
  url: PropTypes.string.isRequired,
  children: PropTypes.node
};

export default function BlockLink({ url, children }) {
  return (
    <Link to={url} className={style.blockLink}>
      <span>{children}</span>
      <Icon name="arrow-forward"/>
    </Link>
  );
}
