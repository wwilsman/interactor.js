const visit = require('unist-util-visit');

const beginReg = /<\!--\s*hint(?:\:\s*(\w*))?\s*-->/;
const endReg = /<\!--\s*endhint\s*-->/;

module.exports = ({ markdownAST }) => {
  let found = false;

  visit(markdownAST, 'html', node => {
    if (node.value.substr(0, 4) !== '<!--') return;

    let begin = node.value.match(beginReg);

    if (begin) {
      if (found) throw new Error('previous hint was not closed');
      node.value = `<hint type="${begin[1]}">`;
      found = true;
    }

    let end = node.value.match(endReg);

    if (end) {
      if (!found) throw new Error('found hint end without start');
      node.value = '</hint>';
      found = false;
    }
  });
};
