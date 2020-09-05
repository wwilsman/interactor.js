import React from 'react';
import PropTypes from 'prop-types';

import Header from '../header';
import style from './layout.module.css';

Layout.propTypes = {
  onNavToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default function Layout({
  onNavToggle,
  children
}) {
  return (
    <>
      <Header onNavToggle={onNavToggle}/>
      <main className={style.layout}>
        {children}
      </main>
    </>
  );
}
