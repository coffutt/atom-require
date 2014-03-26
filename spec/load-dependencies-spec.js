var loadDependencies = require('../lib/load-dependencies'),
    expect = require('chai').expect;

describe('Load Dependencies', function () {

    describe('given a path to a valid package json file', function () {
        it('should return a list of all application dependencies', function () {

            // Note the path is relative to load-dependencies.js
            var dependencies = loadDependencies('../spec/test-package.json'),
                expected = ['require', 'express', 'chai'];

            expect(expected).to.be.an.Array;
            expected.forEach(function (dep) { expect(dependencies).to.contain(dep); });
        });
    });

});
