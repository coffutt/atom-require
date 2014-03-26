module.exports = function () {
    var requires = atom.workspace.activePaneItem.getText().match(/require\(('|")([^'"']+)('|")\)/g);
    return requires ? parseModuleNames(requires) : [];
};

var parseModuleNames = function (statements) {
    var mods = [ ],
        temp;

    for(var i = 0; i < statements.length; i++) {
        temp = statements[i].match(/require\(('|")([^'"']+)('|")\)/)[2];
        if(temp.length >= 2)
            mods.push(statements[i].match(/require\(('|")([^'"']+)('|")\)/)[2]);
    }

    return mods;
};
