var _ = require('underscore'),
    walk = require('walk'),
    fs = require('fs'),
    dependencyFactory = require('../models/dependency-factory'),
    harvestRequires = require('./harvest-requires');

var loadDependencyPackages = function (packageFile) {
    var pkg = require(packageFile),
        dependencies,
        packages = [ ];

    dependencies = _.extend(pkg['dependencies'],
                            pkg['bundledDependencies'],
                            pkg['optionalDependencies'],
                            pkg['devDependencies']);

    for (var module in dependencies) {
        if (dependencies.hasOwnProperty(module)) {
            packages.push(dependencyFactory.buildPackageDependency(module, dependencies[module]));
        }
    }

    return packages;
};

var loadProjectModules = function (projectRoot) {

    var modules = [ ],
        options = { };

    // Skip the node_modules directory when looking for file modules to include.
    options.followLinkes = false;
    options.filters = ['node_modules'];

    options.listeners = {
        file: function (root, fileStats, next) {
            var file = fileStats.name,
                ext = file.split('.').pop();

            if (ext === 'js' || ext === 'coffee') {
                modules.push(dependencyFactory.buildProjectDependency(file, root));
            }
            next();
        },
        error: function (root, nodeStatsArray, next) {
            throw new Error('Error walking the project directory.');
        }
    };

    walk.walkSync(projectRoot, options);

    return modules;
};

var loadNativeModules = function () {
    return Object.keys(process.binding("natives")).filter(function removePrivates (module) {
        return module[0] !== '_';
    }).map(function (name) {
        return dependencyFactory.buildPackageDependency(name, name);
    });
}

module.exports = function (projectRoot) {

    var packageDependencies,
        projectDependencies,
        nativeModules,
        dependencies,
        existing = harvestRequires();

    try {
        packageDependencies = loadDependencyPackages(projectRoot + '/package.json');
    } catch (err) {
        console.log('Could not find package.json file in project root', err);
        packageDependencies = [ ];
    }

    try {
        projectDependencies = loadProjectModules(projectRoot);
    } catch (err) {
        console.log('Error walking project for dependencies');
        projectDependencies = [ ];
    }

    try {
        nativeModules = loadNativeModules();
    } catch (err) {
        console.log('Error loading native modules');
        nativeModules = [ ];
    }


    dependencies = packageDependencies.concat(projectDependencies).concat(nativeModules);

    dependencies.forEach(function (dependency) {
        if (_.contains(existing, dependency.module)) {
            dependency.isRequired = true;
        }
    });

    return dependencies;
};
