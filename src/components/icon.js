import React from 'react';
import PropTypes from 'prop-types';

import {
  MdChevronRight,
  MdExpandMore,
  MdHelpOutline,
  MdInfo,
  MdError,
  MdWarning,
  MdToc,
  MdSearch,
  MdArrowBack,
  MdArrowForward,
  MdClear,
  MdMenu
} from 'react-icons/md';

import {
  FaGithub
} from 'react-icons/fa';

const Icons = {
  'chevron-right': MdChevronRight,
  'expand-more': MdExpandMore,
  'help-outline': MdHelpOutline,
  'info': MdInfo,
  'error': MdError,
  'warning': MdWarning,
  'danger': MdError,
  'toc': MdToc,
  'search': MdSearch,
  'arrow-back': MdArrowBack,
  'arrow-forward': MdArrowForward,
  'clear': MdClear,
  'menu': MdMenu,
  'github': FaGithub
};

Icon.propTypes = {
  name: PropTypes.string.isRequired
};

export default function Icon({ name }) {
  let MdIcon = Icons[name] || MdHelpOutline;
  return <MdIcon/>;
}
