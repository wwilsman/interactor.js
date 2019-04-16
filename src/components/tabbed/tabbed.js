import React, {
  Children,
  cloneElement,
  useState,
  useEffect
} from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import style from './tabbed.module.css';
const cx = classNames.bind(style);

const uid = () => (uid.i = (uid.i || 0) + 1);
const dasherize = str => str.replace('.', '').replace(' ', '-');

Tab.propTypes = {
  tabId: PropTypes.string,
  panelId: PropTypes.string,
  isActive: PropTypes.bool,
  children: PropTypes.node
};

export function Tab({
  tabId,
  panelId,
  isActive,
  children
}) {
  return (
    <section
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
    >
      {children}
    </section>
  );
}

Tabbed.propTypes = {
  children: PropTypes.node
};

export default function Tabbed({ children }) {
  let [tabs, setTabs] = useState([]);
  let [active, setActive] = useState();

  useEffect(() => {
    let id = uid();
    let tabs = Children.map(children, child => {
      let key = dasherize(child.props.name);

      return {
        tabId: `${key}-${id}-tab`,
        panelId: `${key}-${id}-panel`,
        isActive: active === key,
        name: child.props.name,
        child,
        key
      };
    });

    setTabs(tabs);
    setActive(tabs[0].key);
  }, []);

  useEffect(() => {
    if (tabs.length) {
      setTabs(tabs.map(tab => {
        return { ...tab, isActive: active === tab.key };
      }));
    }
  }, [active]);

  return (
    <div>
      <ul role="tablist" className={style.tabList}>
        {tabs.map(tab => (
          <li
            role="tab"
            id={tab.tabId}
            key={tab.tabId}
            aria-controls={tab.panelId}
            onClick={() => tab.isActive || setActive(tab.key)}
            className={cx({ isActive: tab.isActive })}
          >
            {tab.name}
          </li>
        ))}
      </ul>

      {tabs.map(({ child, ...props }) => (
        cloneElement(child, props)
      ))}
    </div>
  );
}
