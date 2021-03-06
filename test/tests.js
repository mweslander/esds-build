'use strict';

const cleanTests = require('./tests-clean.js'),
        configTests = require('./tests-config.js'),
        copyTests = require('./tests-copy.js'),
        esdsTests = require('./tests-esds.js'),
        generatorTests = require('./tests-generate.js'),
        iconTests = require('./tests-icons.js'),
        markupTests = require('./tests-markup.js'),
        scriptTests = require('./tests-scripts.js'),
        styleTests = require('./tests-styles.js'),
        tokenTests = require('./tests-tokens.js');
cleanTests();
configTests();
copyTests();
esdsTests();
generatorTests();
iconTests();
markupTests();
scriptTests();
styleTests();
tokenTests();
