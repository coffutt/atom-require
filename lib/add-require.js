/**
 * Find the last line in a list style declaration. It's assumed that the given buffer
 * row has been identified as the first line in the declaration.
 */
var findEndOfDeclaration = function (editor, bufferRow, done) {
    var nextline,
        text,
        eof = false;

    do {
        editor.setCursorBufferPosition([++bufferRow, 0]);
        editor.selectToEndOfLine();
        nextline = editor.getSelectedText();
    } while(nextline[nextline.length-1] !== ';' && eof !== true);

    done(eof, bufferRow, nextline);
};

/**
 * Add a base require to the file. This includes the var definition and ends with
 * a semi colon. This should only ever be called once a full check for an existing
 * require statement within the script.
 */
var addBaseRequire = function(editor, dependency) {
    editor.moveCursorToBeginningOfLine();
    editor.insertText('var ' + dependency.variableName + ' = require(\'' + dependency.module + '\');\n');
};

/**
 * Append a require statement to the end of a list style variable declaration.
 */
var appendRequire = function(_this, editor, dependency) {
    return function (eof, bufferRow, lastLine) {
        var text;
        _this.eof = eof;
        _this.bufferRow = bufferRow;
        text = lastLine.slice(0, -1) + ',\n    ' + dependency.variableName + ' = require(\'' + dependency.module + '\');';
        editor.insertText(text);
    };
};

/**
 * Build a require statement regular expression for the given module name.
 */
var buildRequireStatementRegex = function (moduleName) {
    return new RegExp('require\\((\'|")' + moduleName + '(\'|")\\)(,|;)?\s*?');
};

/**
 * Check to see if there is an existing require statement corresponding to the module name.
 */
var requireExists = function(editor, moduleName) {
    var regex = buildRequireStatementRegex(moduleName),
        eof = false,
        nextPosition = { row: 0, column: 0 };

    editor.setCursorBufferPosition([0,0], { autoscroll: false });

    do {

        editor.moveCursorToBeginningOfLine();
        editor.selectToEndOfLine();

        if(editor.getSelectedText().match(regex)) {
            return true;
        } else if(editor.getCursorBufferPosition().row < nextPosition.row) {
            return false;
        }

        nextPosition.row++;
        editor.setCursorBufferPosition(nextPosition, { autoscroll: false });

    } while(!eof);

};

/**
 * Given a moduleName, check to see if the buffer loaded into the currently focused editor view
 * already has required that module. If it has not, add a require statement into the variable declaration
 * list at the top of the file. If there is no existing declaration, create one.
 */
module.exports = function (dependency) {
    var editor = atom.workspace.activePaneItem,
        initialCursorPosition = editor.getCursorBufferPosition(),
        text,
        bufferRow = 0,
        nextPos,
        eof = false;

    // Check to see if the file already has the module imported...
    if(requireExists(editor, dependency.module)) {
        return;
    }

    // Set the cursor position to the top left corner of the editor.
    editor.setCursorBufferPosition([bufferRow,0], { autoscroll: true });

    // While we haven't reached the end of the file, we want to look for a good place to add our require.
    while (eof === false) {

        // Set the cursor to beginning of the current line and select the
        // text on the line to begin evaluation
        editor.moveCursorToBeginningOfLine();
        editor.selectToEndOfLine();
        text = editor.getSelectedText();

        // Check to see if this is a valid place to insert our require statements.
        if (text.trim() !== '' && !editor.isBufferRowCommented(bufferRow) && text.indexOf('use strict') === -1) {
            // Check to see if this first valid line is a variable declaration. If it is, we want to latch on to that
            // declaration. If not, we want to make a new one.
            if(text.substring(0, 'var '.length) === 'var ') {

                if(text[text.length-1] === ';') {
                    text = text.slice(0,-1) + ',\n    ' + dependency.variableName + ' = require(\'' + dependency.module + '\');';
                    editor.insertText(text);
                    break;
                } else if(text[text.length-1] === ','){
                    var values = findEndOfDeclaration(editor, bufferRow, appendRequire(this, editor, dependency));
                    break;
                }

            } else {
                editor.insertNewlineAbove();
                addBaseRequire(editor, dependency);
                break;
            }
        }

        // Move the buffer downa line.
        nextPos = [++bufferRow, 0];
        editor.setCursorBufferPosition(nextPos);

        // Check to make sure we haven't reached the end of the file. If we have,
        // we need to go ahead and add in our require.
        if(editor.getCursorBufferPosition().row < nextPos[0]) {
            editor.moveCursorDown(1);
            addBaseRequire(editor, dependency);
            eof = true;
        }

    }

    // Reset the cursor position to the initial position.
    editor.setCursorBufferPosition([initialCursorPosition.row+1, initialCursorPosition.column]);

    return;
};
