const visit = require('unist-util-visit');

const tabReg = /<\!--\s*tabbed\:\s*(\S*)\s*-->/;
const endReg = /<\!--\s*endtabbed\s*-->/;

module.exports = ({ markdownAST }) => {
  let found = null;

  visit(markdownAST, 'html', node => {
    if (node.value.substr(0, 4) !== '<!--') return;

    let tab = node.value.match(tabReg);

    if (tab) {
      if (!found) {
        node.value = `<tabbed><tab name="${tab[1]}">`;
        found = true;
      } else {
        node.value = `</tab><tab name="${tab[1]}">`;
      }
    }

    let end = node.value.match(endReg);

    if (end) {
      node.value = '</tab></tabbed>';
      found = false;
    }
  });
};
