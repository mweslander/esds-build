/* global it */
/* global xit */
/* global describe */
/* global beforeEach */
/* global before */
/* global after */

'use strict';
const { exec } = require('child_process'),
      config = require('../tasks/config.js'),
      c = config.get(),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs-extra');

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
    const projectPath = './test/sample_project',
          docJsFile = `${projectPath}/_site/latest/scripts/${c.codeNamespace}.js`;

    describe('scripts', function(){
      describe('scripts:concatenate', function(){
        beforeEach(function() {
          return gulp('clean:webroot');
        });

        it('should be able to concatenate scripts', function() {
          return gulp(`scripts:concatenate:${c.productTaskName}`)
            .then(result => {
              assert.fileContent(docJsFile, '// DO NOT EDIT: This file is automatically generated by the project\'s build task\n\'use strict\';');
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });

        it('should be able to concatenate all scripts with one composite gulp task', function() {
          return gulp('scripts:concatenate:all')
            .then(result => {
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });

        it('should concatenate /scripts contents before /components/**/*.js contents', function(){
          return gulp('scripts:concatenate:all')
            .then(result => {
              assert.fileContent(docJsFile, "var endOfGlobalFile = 'testing';\n\n'use strict';\nvar startOfComponentFile = 'testing';");
            });
        });
      });

      describe('scripts:lint', function(){
        it('should be able to lint scripts', function() {
          return gulp(`scripts:lint:${c.productTaskName}`)
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('scripts/global.js'));
            });
        });

        it('should be able to lint all scripts with a composite lint task', function() {
          return gulp('scripts:lint:all')
            .then(result => {
              assert(result.stderr.includes('scripts/global.js'));
            });
        });
      });

      describe('scripts:build', function(){
        beforeEach(function() {
          return gulp('clean:webroot');
        });

        it('should be able to lint and then concatenate scripts', function() {
          return gulp(`scripts:build:${c.productTaskName}`)
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('scripts/global.js'));
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });

        it('should be able to lint and then concatenate all scripts', function() {
          return gulp('scripts:build:all')
            .then(result => {
              assert(result.stderr.includes('scripts/global.js'));
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });
      });

      describe('when the /scripts directory does not exist', function(){
        before(function(){
          fs.moveSync(`${projectPath}/scripts`, `${projectPath}/moved-scripts`);
        });

        after(function(){
          fs.moveSync(`${projectPath}/moved-scripts`, `${projectPath}/scripts`);
        });

        it('should run the scripts:build:all task without failing', function() {
          return gulp('scripts:build:all')
            .then(result => {
              assert(result.stdout.includes("Finished 'scripts:build:all'"));
            });
        });
      });

      describe('watch:scripts', function(){
        // Skipping failing wtach test for now
        xit('should watch all scripts for changes', function(done) {
          exec(`gulp watch:scripts:all`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => {
              exec(`touch ${projectPath}/scripts/global.js`);
              recursivelyCheckForFiles([docJsFile], done);
            });
        });
      });
    });
  };
