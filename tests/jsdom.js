import { JSDOM } from 'jsdom';

JSDOM.fromURL(process.argv[2], {
  runScripts: 'dangerously',
  resources: 'usable'
});
