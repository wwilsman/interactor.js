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

const MdIcons = {
  MdChevronRight,
  MdExpandMore,
  MdHelpOutline,
  MdInfo,
  MdError,
  MdWarning,
  MdDanger: MdError,
  MdToc,
  MdSearch,
  MdArrowBack,
  MdArrowForward,
  MdClear,
  MdMenu
};

function camelize(string) {
  return string
    .replace(/(?:^\w|[A-Z]|\b\w)/g, w => w.toUpperCase())
    .replace(/\s+|-/g, '');
}

Icon.propTypes = {
  name: PropTypes.string.isRequired
};

export default function Icon({ name }) {
  let iconName = camelize(`md-${name}`);
  let MdIcon = MdIcons[iconName] || MdHelpOutline;
  return <MdIcon/>;
}
