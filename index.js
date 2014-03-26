var editor = atom.workspace.activePaneItem,
    RequireView = require('./views/require-view');

module.exports = {

    requireView: null,

    activate: function (state) {
        this.requireView = new RequireView(state.requireViewState);
    },

    deactivate: function () {
        this.requireView.destroy();
    },

    serialize: function () {
        return this.requireView.serialize();
    }
};
