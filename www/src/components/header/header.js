import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import logo from '../../images/logo.svg';
import style from './header.module.css';
import Search from '../search';
import Icon from '../icon';

Header.propTypes = {
  onNavToggle: PropTypes.func.isRequired
};

export default function Header({ onNavToggle }) {
  let [showSearch, setSearch] = useState(false);

  return (
    <header className={style.headerContainer}>
      <div className={style.header}>
        <button className={style.navToggle} onClick={onNavToggle}>
          <Icon name="menu"/>
        </button>

        <h1>
          <Link to="/">
            <img alt="Interactor.js" src={logo}/>
          </Link>
        </h1>

        <nav className={style.headerNav}>
          <Link to="/getting-started">Docs</Link>
          <Link to="/api/core">API</Link>
          <a href="https://github.com/wwilsman/interactor.js" target="blank">GitHub</a>
        </nav>

        <button
          className={style.searchToggle}
          onClick={({ nativeEvent: event }) => {
            event.stopImmediatePropagation();
            setSearch(true);
          }}
        >
          <Icon name="search"/>
        </button>

        <Search
          expanded={showSearch}
          onExpand={() => setSearch(true)}
          onClose={() => setSearch(false)}
        />
      </div>
    </header>
  );
}
