import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';
import Sidebar from '../components/sidebar';

NotFoundPage.propTypes = {
  location: PropTypes.object.isReqiured
};

export default function NotFoundPage({ location }) {
  let [isOpen, setOpen] = useState(false);

  return (
    <Layout onNavToggle={() => setOpen(!isOpen)}>
      <SEO title="404: Not found"/>

      <Sidebar
        location={location}
        onClose={() => setOpen(false)}
        open={isOpen}
      />

      <article>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <h1 style={{ fontSize: '5rem' }}>404.</h1>
          <h2 style={{ margin: 0 }}>Well this is awkward...</h2>
          <p><Link to="/">{'you shouldn\'t be here'}</Link></p>
        </div>
      </article>
    </Layout>
  );
}
