const rootPath = process.cwd(),
        gulp = require('gulp'),
        gulpfile = require(`${rootPath}/gulpfile.js`),
        tokenConfig = gulpfile.config.tokens;

//Generate constants.scss and constants.json from constants.yaml
gulp.task('tokens:build:all', function(done){
    // First the constants.yaml file is parsed into JSON
    var constants = interpolate_yaml_variables(yaml.load(`src/library/constants/constants.yaml`)),

        componentConfig = yaml.load('src/library/component_config.yaml'),

        jsonConstants = {},
        scss = `// DO NOT EDIT: This file is automatically generated by the project\'s build task - ${versionStamp}\n`,
        prevVarNameParent = false;

    jsonConstants['constants'] = constants;
    var mergedConfig = Object.assign(jsonConstants, componentConfig);
    mergedConfig['theme'] = theme;
    jsonConstants = JSON.stringify(mergedConfig);
    // Write out JSON version of constants
    if (!fs.existsSync('src/library/data')) {
        mkdirp.sync('src/library/data');
    }
    fs.writeFileSync(`src/library/data/${theme}_constants.json`, jsBeautify(jsonConstants));

    // JSON constants are iterated over and scss variable names are manually constructed
    var scssVars = Object.assign(constants),
        flattenedConstants = flatten(scssVars, {delimiter: '-'});
    for (var varName in flattenedConstants) {
        var value = flattenedConstants[varName];
        var varNameParent = varName.substr(0, varName.indexOf('-'));
        if (prevVarNameParent && prevVarNameParent !== varNameParent) {
            scss += '\n';
        }
        prevVarNameParent = varNameParent;

        scss += `$${theme}-${varName}: ${value};\n`;
    }

    scss += `$theme: ${theme};\n`;

    // Write out the concatenated variable string to _${theme}_constants.scss
    if (!fs.existsSync('src/library/styles/auto_generated')) {
        mkdirp.sync('src/library/styles/auto_generated');
    }
    fs.writeFileSync(`src/library/styles/auto_generated/_constants.scss`, scss);
    done();
});