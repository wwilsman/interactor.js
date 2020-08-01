import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Icon from '../icon';
import style from './hint.module.css';
const cx = classNames.bind(style);

Hint.propTypes = {
  type: PropTypes.oneOf(['info', 'warning', 'danger']).isRequired,
  children: PropTypes.node.isRequired
};

export default function Hint({ type, children }) {
  return (
    <div className={cx('hint', type)}>
      <Icon name={type}/>
      {children}
    </div>
  );
}
