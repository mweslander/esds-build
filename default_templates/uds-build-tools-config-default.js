'use strict';
const fs = require('fs'),
        path = require('path'),
        packageRoot = process.cwd(),
        packageJsonFile = path.join(packageRoot, 'package.json'),
        webroot = '_site',
        latestVersionPath = 'latest';

let packageJson,
    projectName,
    classPrefix = 'uds';

function makeSafeForCss(name) {
    let safeName = name.replace(/[^a-z0-9]/g, '-');
    while (safeName.indexOf('-') === 0) {
        safeName = safeName.substring(1);
    }

    return safeName;
}

if (fs.existsSync(packageJsonFile)) {
    packageJson = require(packageJsonFile);
    projectName = packageJson.name;

    classPrefix = makeSafeForCss(projectName);
}

module.exports = {
    configMethod: 'extend',
    classPrefix: classPrefix,
    rootPath: packageRoot,
    componentsPath: 'components',
    dataPath: 'data',
    dependenciesPath: 'node_modules',
    distPath: 'dist',
    docsPath: 'docs',
    iconsPath: 'icons',
    imagesPath: 'images',
    scriptsPath: 'scripts',
    sinksPath: 'sink-pages',
    stylesPath: 'styles',
    templatesPath: 'templates',
    tokensPath: 'tokens',
    webroot: '_site',
    latestVersionPath: latestVersionPath,
    versionedDocs: true,
    latestVersionWebroot: path.join(webroot, latestVersionPath),
    //Tokens filename
    tokensSourceFile: 'tokens.yaml',
    tokensFormats: ['.scss', '.json'],
    //Lint config
    stylesLintConfig: path.join(packageRoot, '.sass-lint.yml'),
    scriptsLintConfig: path.join(packageRoot, '.eslintrc'),
    //File extensions
    iconSourceExtension: '.svg',
    markupSourceExtension: '.njk',
    scriptsSourceExtension: '.js',
    stylesSourceExtension: '.scss',
    //Gulp task name segments, like watch:markup, styles:build, etc.
    allTaskName: 'all',
    copyTaskName: 'copy',
    buildTaskName: 'build',
    concatTaskName: 'concatenate',
    docsTaskName: 'docs',
    iconsTaskName: 'icons',
    imagesTaskName: 'images',
    lintTaskName: 'lint',
    markupTaskName: 'markup',
    macrosTaskName: 'macros',
    optimizeTaskName: 'optimize',
    postprocessTaskName: 'postprocess',
    precompileTaskName: 'precompile',
    productTaskName: classPrefix,
    scriptsTaskName: 'scripts',
    stylesTaskName: 'styles',
    watchTaskName: 'watch'
};