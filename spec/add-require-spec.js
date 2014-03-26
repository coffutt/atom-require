var addRequire = require('../lib/add-require'),
    WorkspaceView = require('atom').WorkspaceView,
    temp = require('temp').track(),
    path = require('path'),
    fs = require('fs-plus'),
    expect = require('chai').expect;

describe('Add Require', function() {

    beforeEach(function() {

        var directory, filePath, editor, buffer;

        directory = temp.mkdirSync();
        atom.project.setPath(directory);
        atom.workspaceView = new WorkspaceView();
        atom.workspace = atom.workspaceView.model;
        filePath = path.join(directory, 'add-require.txt');
        fs.writeFileSync(filePath, '');
        editor = atom.workspace.openSync(filePath);
        buffer = editor.getBuffer();

    });

    describe('given a module name and a presently focused editor that already contains the module', function() {

        it('should detect the existing module and return without adding a second declaration.', function() {

            var text = '// This is a comment\nvar a = 100;\nvar module = require(\'module\')';

            editor = atom.project.openSync('add-require.txt');
            editor.insertText(text);
            editor.save();

            addRequire('module');

            expect(editor.getText()).to.equal(text);

        });
    });

    describe('given a module name and a presently focused editor that doesn\'t contain the module', function () {

        describe('with no existing var declarations', function () {

            it('should add a variable declaration for the module', function () {

                var text = 'function testfun() { };',
                    expected = 'var module = require(\'module\');\n\n' + text;
                editor = atom.project.openSync('add-require.txt');
                editor.insertText(text);
                editor.save();

                addRequire('module');

                expect(editor.getText()).to.equal(expected);
            });
        });

        describe('with an existing single var declaration', function () {
            it('should add the require as a multi line declaration ', function() {

                var text = 'var a = 10;',
                    expected = text.slice(0, -1) + ',\n    module = require(\'module\');';
                editor = atom.project.openSync('add-require.txt');
                editor.insertText(text);
                editor.save();

                addRequire('module');

                expect(editor.getText()).to.equal(expected);

            });
        });

        describe('with an existing multi line var declaration', function () {
            it('should add the require to the end of the declaration ', function() {

                var text = 'var a = 10,\n\tb = require(\'b\');',
                    expected = text.slice(0, -1) + ',\n    module = require(\'module\');';
                editor = atom.project.openSync('add-require.txt');
                editor.insertText(text);
                editor.save();

                addRequire('module');

                expect(editor.getText()).to.equal(expected);

            });
        });
    });
});
