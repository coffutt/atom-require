var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    PROJECT = 'PROJECT',
    PACKAGE = 'PACKAGE';

var Dependency = function (module, dispName, version, variableName, type) {
    this.module = module;
    this.dispName = dispName;
    this.version = version;
    this.variableName = variableName;
    this.type = type;
    this.isRequired = false;
};

var buildModuleName = function (modulePath, moduleName) {
    var spl = moduleName.split('.'),
        ext = spl.pop(),
        focusedFilePath = fs.realpathSync(atom.workspace.activePaneItem.getPath()),
        requirePath = '';

    if (ext === 'js' || ext === 'coffee') {

        //Chop the filename off of the currently focused file full path
        focusedFilePath = focusedFilePath.substring(0, focusedFilePath.lastIndexOf('/')) + '/';

        requirePath = path.relative(focusedFilePath, path.join(fs.realpathSync(modulePath), moduleName));
        if (requirePath.substring(0, 1) !== '.') {
            requirePath = './' + requirePath;
        }

        return requirePath.replace(/\.[^/.]+$/, '');

    } else {
        return moduleName;
    }
};

var buildVariableName = function (module) {
    var split = module.split('-'),
        processed;

    if(split.length === 1) return module;

    processed = split[0];
    for(var i = 1; i < split.length; i++)
        processed += split[i].charAt(0).toUpperCase() + split[i].slice(1);

    return processed;
};

module.exports = {

    buildProjectDependency: function (module, version) {
        var moduleName = buildModuleName(version, module),
            varName = buildVariableName(module.split('.')[0]);
        return new Dependency(moduleName, module, version, varName, PROJECT);
    },

    buildPackageDependency: function (module, version) {
        return new Dependency(module, module, version, buildVariableName(module), PACKAGE);
    },

    PROJECT: PROJECT,

    PACKAGE: PACKAGE
};
