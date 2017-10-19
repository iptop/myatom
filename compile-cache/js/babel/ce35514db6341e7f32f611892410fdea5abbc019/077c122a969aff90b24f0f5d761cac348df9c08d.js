Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _myEmacsModeView = require('./my-emacs-mode-view');

var _myEmacsModeView2 = _interopRequireDefault(_myEmacsModeView);

var _atom = require('atom');

'use babel';

exports['default'] = {

  myEmacsModeView: null,
  modalPanel: null,
  subscriptions: null,

  activate: function activate(state) {
    var _this = this;

    this.myEmacsModeView = new _myEmacsModeView2['default'](state.myEmacsModeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.myEmacsModeView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _atom.CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'my-emacs-mode:toggle': function myEmacsModeToggle() {
        return _this.toggle();
      }
    }));
  },

  deactivate: function deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.myEmacsModeView.destroy();
  },

  serialize: function serialize() {
    return {
      myEmacsModeViewState: this.myEmacsModeView.serialize()
    };
  },

  toggle: function toggle() {
    console.log('MyEmacsMode was toggled!');
    return this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci9naXRodWIvbXktZW1hY3MtbW9kZS9saWIvbXktZW1hY3MtbW9kZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7K0JBRTRCLHNCQUFzQjs7OztvQkFDZCxNQUFNOztBQUgxQyxXQUFXLENBQUM7O3FCQUtHOztBQUViLGlCQUFlLEVBQUUsSUFBSTtBQUNyQixZQUFVLEVBQUUsSUFBSTtBQUNoQixlQUFhLEVBQUUsSUFBSTs7QUFFbkIsVUFBUSxFQUFBLGtCQUFDLEtBQUssRUFBRTs7O0FBQ2QsUUFBSSxDQUFDLGVBQWUsR0FBRyxpQ0FBb0IsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDdkUsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztBQUM3QyxVQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUU7QUFDdkMsYUFBTyxFQUFFLEtBQUs7S0FDZixDQUFDLENBQUM7OztBQUdILFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7OztBQUcvQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCw0QkFBc0IsRUFBRTtlQUFNLE1BQUssTUFBTSxFQUFFO09BQUE7S0FDNUMsQ0FBQyxDQUFDLENBQUM7R0FDTDs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsUUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxXQUFTLEVBQUEscUJBQUc7QUFDVixXQUFPO0FBQ0wsMEJBQW9CLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUU7S0FDdkQsQ0FBQztHQUNIOztBQUVELFFBQU0sRUFBQSxrQkFBRztBQUNQLFdBQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN4QyxXQUNFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLEdBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQ3RCO0dBQ0g7O0NBRUYiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL2dpdGh1Yi9teS1lbWFjcy1tb2RlL2xpYi9teS1lbWFjcy1tb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBNeUVtYWNzTW9kZVZpZXcgZnJvbSAnLi9teS1lbWFjcy1tb2RlLXZpZXcnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgbXlFbWFjc01vZGVWaWV3OiBudWxsLFxuICBtb2RhbFBhbmVsOiBudWxsLFxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuXG4gIGFjdGl2YXRlKHN0YXRlKSB7XG4gICAgdGhpcy5teUVtYWNzTW9kZVZpZXcgPSBuZXcgTXlFbWFjc01vZGVWaWV3KHN0YXRlLm15RW1hY3NNb2RlVmlld1N0YXRlKTtcbiAgICB0aGlzLm1vZGFsUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcbiAgICAgIGl0ZW06IHRoaXMubXlFbWFjc01vZGVWaWV3LmdldEVsZW1lbnQoKSxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfSk7XG5cbiAgICAvLyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdteS1lbWFjcy1tb2RlOnRvZ2dsZSc6ICgpID0+IHRoaXMudG9nZ2xlKClcbiAgICB9KSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLm1vZGFsUGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5teUVtYWNzTW9kZVZpZXcuZGVzdHJveSgpO1xuICB9LFxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbXlFbWFjc01vZGVWaWV3U3RhdGU6IHRoaXMubXlFbWFjc01vZGVWaWV3LnNlcmlhbGl6ZSgpXG4gICAgfTtcbiAgfSxcblxuICB0b2dnbGUoKSB7XG4gICAgY29uc29sZS5sb2coJ015RW1hY3NNb2RlIHdhcyB0b2dnbGVkIScpO1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm1vZGFsUGFuZWwuaXNWaXNpYmxlKCkgP1xuICAgICAgdGhpcy5tb2RhbFBhbmVsLmhpZGUoKSA6XG4gICAgICB0aGlzLm1vZGFsUGFuZWwuc2hvdygpXG4gICAgKTtcbiAgfVxuXG59O1xuIl19