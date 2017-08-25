/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const { exec } = require('child_process'),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs'),
      configProductName = 'eightshapes-uds-build-tools';

// TODO Move this function to a commonly shared place
function recursivelyCheckForFiles(filePaths, done) {
  let allFilesFound = filePaths.every(file => fs.existsSync(file));

  if (allFilesFound) {
    done();
  } else {
    setTimeout(function() {
      recursivelyCheckForFiles(filePaths, done);
    }, 20);
  }
}

module.exports = function(){
    const projectPath = './tests/sample_project',
          compiledCssFile = `${projectPath}/_site/latest/styles/doc.css`;

    describe('styles', function(){
      describe('styles:precompile', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
        });

        it('should be able to compile styles with tokens', function() {
          return gulp(`styles:precompile:${configProductName}`)
            .then(result => {
              assert.fileContent(compiledCssFile, `.${configProductName}-nav {`);
              assert.fileContent(compiledCssFile, 'border: solid 3px #000;');
            });
        });

        it('should be able to compile the primary Product styles using tokens from a dependency', function(){
          return gulp(`styles:precompile:${configProductName}`)
            .then(result => {
              assert.fileContent(compiledCssFile, `.${configProductName}-nav {`);
              assert.fileContent(compiledCssFile, 'content: "content token in product-a";'); // token from dependency
            });
        });


        it('should be able to compile all styles with one composite gulp task', function() {
          return gulp('styles:precompile:all')
            .then(result => {
              assert.file(compiledCssFile);
            });
        });
      });

      describe('styles:lint', function(){
        it('should be able to lint styles', function() {
          return gulp(`styles:lint:${configProductName}`)
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
            });
        });

        it('should be able to lint all styles with one composite gulp task', function() {
          return gulp('styles:lint:all')
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
            });
        });

        it('should get sass lint options including lint config file when config file exists', function(){
          const existingConfigFilePath = './tests/sample_project/node_modules/library-component-module/.sass-lint.yaml',
                stylesTasks = require('../tasks/styles.js'),
                taskConfig = {
                  lintOptions: {
                    configFile: existingConfigFilePath
                  }
                },
                lintOptions = stylesTasks.getLintOptions(taskConfig);
          assert(lintOptions.configFile === existingConfigFilePath);
        });

        it('should get an empty set of sass lint options that does not include a lint config file when the config file does not exist', function(){
          const nonExistentConfigPath = './path/does/not/exist',
                stylesTasks = require('../tasks/styles.js'),
                taskConfig = {
                  lintOptions: {
                    configFile: nonExistentConfigPath
                  }
                },
                lintOptions = stylesTasks.getLintOptions(taskConfig);
          assert(typeof lintOptions.configFile === 'undefined');
        });
      });

      describe('styles:postprocess', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
        });

        it('should be able to auto-prefix styles with vendor-specific rules', function() {
          return gulp(`styles:precompile:${configProductName}`)
            .then(result => gulp(`styles:postprocess:${configProductName}`))
            .then(result => {
              assert.fileContent(compiledCssFile, '-ms-grid-row: 1;');
            });
        });
      });

      describe('styles:build', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
          .then(result => gulp('tokens:build:all'));
        });

        it('should lint, precompile, and post-process styles', function() {
          return gulp(`styles:build:${configProductName}`)
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
              assert.fileContent(compiledCssFile, `.${configProductName}-nav {`);
              assert.fileContent(compiledCssFile, 'border: solid 3px #000;'); // token from library
              assert.fileContent(compiledCssFile, '-ms-grid-row: 1;');
            });
        });

        it('should lint, precompile, and post-process all styles', function() {
          return gulp('tokens:build:all')
            .then(result => gulp('styles:build:all'))
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
              assert.file(compiledCssFile);
            });
        });
      });

      describe('watch:styles', function(){
        it('should watch styles for changes', function(done) {
          exec(`gulp watch:styles:${configProductName}`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              exec(`touch ${projectPath}/styles/doc.scss`);
              recursivelyCheckForFiles([compiledCssFile], done);
            });
        });

        it('should rebuild styles when tokens are updated', function(done) {
          exec(`gulp watch:styles:${configProductName}`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              exec(`touch ${projectPath}/tokens/tokens.scss`);
              recursivelyCheckForFiles([compiledCssFile], done);
            });
        });

        it('should run all watch:style tasks simultaneously', function(done) {
          exec(`gulp watch:styles:all`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              exec(`touch ${projectPath}/tokens/tokens.scss`);
              recursivelyCheckForFiles([compiledCssFile], done);
            });
        });

        it('should watch tokens.scss for changes and recompile', function(done){
          exec(`gulp watch:styles:tokens`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              recursivelyCheckForFiles([compiledCssFile], done);
            });
        });
      });
    });
  };
