const visit = require('unist-util-visit');

module.exports = ({ markdownAST }) => {
  visit(markdownAST, 'paragraph', (node, index, parent) => {
    if (parent.type === 'root' &&
        node.children.length === 1 &&
        node.children[0].type === 'link') {
      let link = node.children[0];

      node.type = 'html';
      node.value = `<block-link url="${link.url}">`;
      delete node.children;

      parent.children.splice(index + 1, 0, ...link.children, {
        type: 'html',
        value: '</block-link>'
      });
    }
  });
};
