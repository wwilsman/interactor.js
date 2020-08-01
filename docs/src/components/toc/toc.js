import React, {
  useState,
  useEffect,
  useRef
} from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import Icon from '../icon';
import style from './toc.module.css';
const cx = classNames.bind(style);

TOC.propTypes = {
  content: PropTypes.string.isRequired
};

export default function TOC({ content }) {
  let [isOpen, setOpen] = useState(false);
  let ref = useRef(null);

  useEffect(() => {
    let handleClose = ({ target }) => {
      if (ref.current && !ref.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  });

  return (
    <aside className={style.toc}>
      {content && (
        <>
          <button
            className={style.tocToggle}
            onClick={() => setOpen(!isOpen)}
          >
            <Icon name="toc"/>
          </button>

          <div ref={ref} className={cx('tocModal', { isOpen })}>
            <div className={style.tocHeader}>
              <Icon name="toc"/>
              <span>Contents</span>
            </div>

            <div dangerouslySetInnerHTML={{ __html: content }}/>
          </div>
        </>
      )}
    </aside>
  );
}
