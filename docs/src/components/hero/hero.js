import React from 'react';
import PropTypes from 'prop-types';

import BlockLink from '../block-link';
import style from './hero.module.css';

Hero.propTypes = {
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
  ctas: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  })).isRequired
};

export default function Hero({ heading, subheading, ctas }) {
  return (
    <article className={style.hero}>
      <h1>{heading}</h1>
      <h2>{subheading}</h2>
      <p>{ctas.map(({ url, text }, i) => (
        <BlockLink key={i} url={url} inline>{text}</BlockLink>
      ))}</p>
    </article>
  );
}
