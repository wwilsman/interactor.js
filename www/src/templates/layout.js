import React, { useState } from 'react';
import PropTypes from 'prop-types';
import RehypeReact from 'rehype-react';

import Layout from '../components/layout';
import SEO from '../components/seo';
import Sidebar from '../components/sidebar';
import Hint from '../components/hint';
import BlockLink from '../components/block-link';

const rehype = new RehypeReact({
  createElement: React.createElement,
  components: {
    hint: Hint,
    'block-link': BlockLink
  }
});

// make initial node a fragment
function renderAst(tree) {
  let reply = rehype.Compiler(tree);

  return reply.type === 'div' ? (
    <>{reply.props.children}</>
  ) : reply;
}

LayoutTemplate.propTypes = {
  location: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.func.isRequired
};

export default function LayoutTemplate({
  location,
  title,
  description,
  children
}) {
  let [isOpen, setOpen] = useState(false);

  return (
    <Layout onNavToggle={() => setOpen(!isOpen)}>
      <SEO
        title={title}
        description={description}
      />

      <Sidebar
        location={location}
        onClose={() => setOpen(false)}
        open={isOpen}
      />

      <article>
        {children(renderAst)}
      </article>
    </Layout>
  );
}
