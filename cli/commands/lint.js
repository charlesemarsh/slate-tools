const argv = require('yargs').argv;

const {runEslint} = require('../../tools/eslint');

const {runThemelint} = require('../../tools/theme-lint');

const {scripts, styles, locales} = argv;
const runAll =
  typeof scripts === 'undefined' &&
  typeof styles === 'undefined' &&
  typeof locales === 'undefined';

if (scripts || runAll) {
  runEslint();
}

if (locales || runAll) {
  runThemelint();
}
