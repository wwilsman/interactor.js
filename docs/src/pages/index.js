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
          <><strong>interactor.js</strong> is a
            composable, immutable, asynchronous library for interacting with
            elements the way a user would.</>
        )}
        subheading={(
          <>It works alongside browser DOM to produce blazingly fast
            interactions and assertions.</>
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
