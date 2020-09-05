import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Layout from '../components/layout';
import Hero from '../components/hero';
import SEO from '../components/seo';
import Sidebar from '../components/sidebar';

HomePage.propTypes = {
  location: PropTypes.object.isReqiured
};

export default function HomePage({ location }) {
  let [isOpen, setOpen] = useState(false);

  return (
    <Layout onNavToggle={() => setOpen(!isOpen)}>
      <SEO title="Interactor.js"/>

      <Sidebar
        location={location}
        onClose={() => setOpen(false)}
        open={isOpen}
        mobileOnly
      />

      <Hero
        heading={(
          <><strong>interactor.js</strong> is an asynchronous and
            composable library for interacting with DOM elements.</>
        )}
        subheading={(
          <>It works in any browser, with any framework, to produce
            blazingly fast automations and tests.</>
        )}
        ctas={[
          { text: 'Getting Started', url: '/getting-started' },
          { text: 'Documentation', url: '/getting-started' },
          { text: 'API Reference', url: '/api' }
        ]}
      />
    </Layout>
  );
}
