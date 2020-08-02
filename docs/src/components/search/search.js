import React, {
  useEffect,
  useRef
} from 'react';

import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import classNames from 'classnames/bind';
import algoliasearch from 'algoliasearch/lite';

import {
  InstantSearch,
  Hits,
  Highlight,
  Snippet,
  PoweredBy,
  connectSearchBox
} from 'react-instantsearch-dom';

import Icon from '../icon';
import style from './search.module.css';
const cx = classNames.bind(style);

const searchClient = algoliasearch(
  process.env.GATSBY_ALGOLIA_APP_ID,
  process.env.GATSBY_ALGOLIA_SEARCH_KEY
);

const SearchBox = connectSearchBox(({
  refine,
  currentRefinement,
  className,
  onFocus,
  onBlur
}) => (
  <form
    className={className}
    onSubmit={e => e.preventDefault()}
  >
    <Icon name="search"/>

    <input
      type="text"
      aria-label="Search"
      placeholder="Search..."
      value={currentRefinement}
      onChange={e => refine(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
    />

    {!!currentRefinement && (
      <button
        type="button"
        onClick={({ nativeEvent: event }) => {
          event.stopImmediatePropagation();
          refine('');
        }}
      >
        <Icon name="clear"/>
      </button>
    )}
  </form>
));

function Hit(onClick) {
  /* eslint-disable react/prop-types, react/display-name */
  return ({ hit }) => {
    return (
      <Link to={hit.slug} onClick={onClick}>
        <h3>
          <Highlight attribute="title" hit={hit} tagName="mark"/>
        </h3>

        <Snippet attribute="excerpt" hit={hit} tagName="mark"/>
      </Link>
    );
  };
  /* eslint-enable react/prop-types, react/display-name */
}

Search.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default function Search({
  expanded: isExpanded,
  onExpand,
  onClose
}) {
  let ref = useRef(null);

  useEffect(() => {
    let handleClick = ({ target }) => {
      if (ref.current && !ref.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <div ref={ref} className={cx('searchContainer', { isExpanded })}>
        <InstantSearch indexName="Next" searchClient={searchClient}>
          <SearchBox
            className={style.searchBox}
            onFocus={onExpand}
          />

          <div className={style.searchResults} hidden={!isExpanded}>
            <Hits hitComponent={Hit(onClose)}/>

            <div className={style.poweredBy}>
              <PoweredBy/>
            </div>
          </div>
        </InstantSearch>
      </div>

      {isExpanded && (
        <div className={style.searchOverlay}/>
      )}
    </>
  );
}
