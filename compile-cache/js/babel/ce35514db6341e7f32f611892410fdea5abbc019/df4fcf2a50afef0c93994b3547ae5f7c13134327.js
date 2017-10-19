Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _client = require('./client');

var _client2 = _interopRequireDefault(_client);

var _viewsTreeView = require('./views/tree-view');

var _viewsTreeView2 = _interopRequireDefault(_viewsTreeView);

var _helpers = require('./helpers');

var _menusMain = require('./menus/main');

var _menusMain2 = _interopRequireDefault(_menusMain);

'use babel';

var config = require('./config-schema.json');

var Main = (function () {
  function Main() {
    _classCallCheck(this, Main);

    this.config = config;
    this.treeView = null;
    this.client = null;
  }

  _createClass(Main, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      if (this.subscriptions) {
        this.deactivate();
      }

      this.client = new _client2['default']();
      atom.project['remoteftp-main'] = this; // change remoteftp to object containing client and main?
      atom.project.remoteftp = this.client;
      this.treeView = new _viewsTreeView2['default']();

      this.subscriptions = new _atom.CompositeDisposable();
      this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
        _this.subscriptions.add(editor.onDidSave(function (event) {
          return _this.fileSaved(event);
        }));
      }), atom.project.onDidChangePaths(function () {
        if (!(0, _helpers.hasProject)() || !_this.client.isConnected()) return;

        atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:disconnect');
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'remote-ftp:connect');
      }), this.client.on('connected', function () {
        _this.treeView.root.name.attr('data-name', _path2['default'].basename(_this.client.root.remote));
        _this.treeView.root.name.attr('data-path', _this.client.root.remote);

        // .ftpignore initialize
        _this.client.updateIgnore();
      }));

      // NOTE: if there is a project folder & show view on startup
      //  is true, show the Remote FTP sidebar
      if ((0, _helpers.hasProject)()) {
        // NOTE: setTimeout is for when multiple hosts option is true
        setTimeout(function () {
          var conf = new _atom.File(_this.client.getConfigPath());

          conf.exists().then(function (exists) {
            if (exists && atom.config.get('Remote-FTP.tree.showViewOnStartup')) {
              _this.treeView.attach();
            }
          })['catch'](function (error) {
            atom.notifications.addWarning(error.reason);
          });
        }, 0);
      }

      // NOTE: Adds commands to context menus and atom.commands
      (0, _menusMain2['default'])();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.subscriptions.dispose();

      if (this.client) this.client.disconnect();
      if (this.treeView) this.treeView.detach();

      this.client = null;
      this.treeView = null;

      delete atom.project['remoteftp-main'];
      delete atom.project.remoteftp;
    }
  }, {
    key: 'fileSaved',
    value: function fileSaved(text) {
      if (!(0, _helpers.hasProject)()) return;

      if (atom.config.get('Remote-FTP.connector.autoUploadOnSave') === 'never') return;

      if (!this.client.isConnected() && atom.config.get('Remote-FTP.connector.autoUploadOnSave') !== 'always') return;

      var local = text.path;

      if (!atom.project.contains(local)) return;

      // Read config if undefined
      if (!this.client.ftpConfigPath) {
        this.client.readConfig();
      }

      if (this.client.ftpConfigPath !== this.client.getConfigPath()) return;

      // .ftpignore filter
      if (this.client.checkIgnore(local)) return;

      if (local === this.client.getConfigPath()) return;
      // TODO: Add fix for files which are uploaded from a glob selector
      // don't upload files watched, they will be uploaded by the watcher
      // doesn't work fully with new version of watcher
      if (this.client.watch.files.indexOf(local) >= 0) return;

      // get file name for notification message
      var uploadedItem = atom.workspace.getActiveTextEditor().getFileName();

      this.client.upload(local, function (err) {
        if (atom.config.get('Remote-FTP.notifications.enableTransfer')) {
          if (err) {
            atom.notifications.addError('Remote FTP: ' + uploadedItem + ' could not upload.');
          } else {
            atom.notifications.addSuccess('Remote FTP: ' + uploadedItem + ' uploaded.');
          }
        }
      });
    }
  }, {
    key: 'consumeElementIcons',
    value: function consumeElementIcons(fn) {
      (0, _helpers.setIconHandler)(fn);
      return new _atom.Disposable(function () {
        (0, _helpers.setIconHandler)(null);
      });
    }
  }]);

  return Main;
})();

exports['default'] = new Main();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9yZW1vdGUtZnRwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXNELE1BQU07O29CQUMzQyxNQUFNOzs7O3NCQUNKLFVBQVU7Ozs7NkJBQ1IsbUJBQW1COzs7O3VCQUlqQyxXQUFXOzt5QkFDTyxjQUFjOzs7O0FBVnZDLFdBQVcsQ0FBQzs7QUFZWixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7SUFFekMsSUFBSTtBQUVHLFdBRlAsSUFBSSxHQUVNOzBCQUZWLElBQUk7O0FBR04sUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDckIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7R0FDcEI7O2VBTkcsSUFBSTs7V0FRQSxvQkFBRzs7O0FBQ1QsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztPQUNuQjs7QUFFRCxVQUFJLENBQUMsTUFBTSxHQUFHLHlCQUFZLENBQUM7QUFDM0IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN0QyxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxRQUFRLEdBQUcsZ0NBQWMsQ0FBQzs7QUFFL0IsVUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUM1QyxjQUFLLGFBQWEsQ0FBQyxHQUFHLENBQ2xCLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFL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YUFBTyxxQkFBZSxZQUFNO0FBQzFCLHFDQUFlLElBQUksQ0FBQyxDQUFDO09BQ3RCLENBQUMsQ0FBQztLQUNKOzs7U0ExSEcsSUFBSTs7O3FCQThISyxJQUFJLElBQUksRUFBRSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvcmVtb3RlLWZ0cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBGaWxlLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBDbGllbnQgZnJvbSAnLi9jbGllbnQnO1xuaW1wb3J0IFRyZWVWaWV3IGZyb20gJy4vdmlld3MvdHJlZS12aWV3JztcbmltcG9ydCB7XG4gIGhhc1Byb2plY3QsXG4gIHNldEljb25IYW5kbGVyLFxufSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IGluaXRDb21tYW5kcyBmcm9tICcuL21lbnVzL21haW4nO1xuXG5jb25zdCBjb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy1zY2hlbWEuanNvbicpO1xuXG5jbGFzcyBNYWluIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnRyZWVWaWV3ID0gbnVsbDtcbiAgICB0aGlzLmNsaWVudCA9IG51bGw7XG4gIH1cblxuICBhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLmNsaWVudCA9IG5ldyBDbGllbnQoKTtcbiAgICBhdG9tLnByb2plY3RbJ3JlbW90ZWZ0cC1tYWluJ10gPSB0aGlzOyAvLyBjaGFuZ2UgcmVtb3RlZnRwIHRvIG9iamVjdCBjb250YWluaW5nIGNsaWVudCBhbmQgbWFpbj9cbiAgICBhdG9tLnByb2plY3QucmVtb3RlZnRwID0gdGhpcy5jbGllbnQ7XG4gICAgdGhpcy50cmVlVmlldyA9IG5ldyBUcmVlVmlldygpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoKGVkaXRvcikgPT4ge1xuICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgICAgIGVkaXRvci5vbkRpZFNhdmUoZXZlbnQgPT4gdGhpcy5maWxlU2F2ZWQoZXZlbnQpKSxcbiAgICAgICAgICApO1xuICAgICAgICB9KSxcblxuICAgICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB7XG4gICAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkgfHwgIXRoaXMuY2xpZW50LmlzQ29ubmVjdGVkKCkpIHJldHVybjtcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3JlbW90ZS1mdHA6ZGlzY29ubmVjdCcpO1xuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3JlbW90ZS1mdHA6Y29ubmVjdCcpO1xuICAgICAgICB9KSxcblxuICAgICAgICB0aGlzLmNsaWVudC5vbignY29ubmVjdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMudHJlZVZpZXcucm9vdC5uYW1lLmF0dHIoJ2RhdGEtbmFtZScsIFBhdGguYmFzZW5hbWUodGhpcy5jbGllbnQucm9vdC5yZW1vdGUpKTtcbiAgICAgICAgICB0aGlzLnRyZWVWaWV3LnJvb3QubmFtZS5hdHRyKCdkYXRhLXBhdGgnLCB0aGlzLmNsaWVudC5yb290LnJlbW90ZSk7XG5cbiAgICAgICAgICAvLyAuZnRwaWdub3JlIGluaXRpYWxpemVcbiAgICAgICAgICB0aGlzLmNsaWVudC51cGRhdGVJZ25vcmUoKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIE5PVEU6IGlmIHRoZXJlIGlzIGEgcHJvamVjdCBmb2xkZXIgJiBzaG93IHZpZXcgb24gc3RhcnR1cFxuICAgIC8vICBpcyB0cnVlLCBzaG93IHRoZSBSZW1vdGUgRlRQIHNpZGViYXJcbiAgICBpZiAoaGFzUHJvamVjdCgpKSB7XG4gICAgICAvLyBOT1RFOiBzZXRUaW1lb3V0IGlzIGZvciB3aGVuIG11bHRpcGxlIGhvc3RzIG9wdGlvbiBpcyB0cnVlXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc3QgY29uZiA9IG5ldyBGaWxlKHRoaXMuY2xpZW50LmdldENvbmZpZ1BhdGgoKSk7XG5cbiAgICAgICAgY29uZi5leGlzdHMoKS50aGVuKChleGlzdHMpID0+IHtcbiAgICAgICAgICBpZiAoZXhpc3RzICYmIGF0b20uY29uZmlnLmdldCgnUmVtb3RlLUZUUC50cmVlLnNob3dWaWV3T25TdGFydHVwJykpIHtcbiAgICAgICAgICAgIHRoaXMudHJlZVZpZXcuYXR0YWNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhlcnJvci5yZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIC8vIE5PVEU6IEFkZHMgY29tbWFuZHMgdG8gY29udGV4dCBtZW51cyBhbmQgYXRvbS5jb21tYW5kc1xuICAgIGluaXRDb21tYW5kcygpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuXG4gICAgaWYgKHRoaXMuY2xpZW50KSB0aGlzLmNsaWVudC5kaXNjb25uZWN0KCk7XG4gICAgaWYgKHRoaXMudHJlZVZpZXcpIHRoaXMudHJlZVZpZXcuZGV0YWNoKCk7XG5cbiAgICB0aGlzLmNsaWVudCA9IG51bGw7XG4gICAgdGhpcy50cmVlVmlldyA9IG51bGw7XG5cbiAgICBkZWxldGUgYXRvbS5wcm9qZWN0WydyZW1vdGVmdHAtbWFpbiddO1xuICAgIGRlbGV0ZSBhdG9tLnByb2plY3QucmVtb3RlZnRwO1xuICB9XG5cbiAgZmlsZVNhdmVkKHRleHQpIHtcbiAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnUmVtb3RlLUZUUC5jb25uZWN0b3IuYXV0b1VwbG9hZE9uU2F2ZScpID09PSAnbmV2ZXInKSByZXR1cm47XG5cbiAgICBpZiAoIXRoaXMuY2xpZW50LmlzQ29ubmVjdGVkKCkgJiYgYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLmNvbm5lY3Rvci5hdXRvVXBsb2FkT25TYXZlJykgIT09ICdhbHdheXMnKSByZXR1cm47XG5cbiAgICBjb25zdCBsb2NhbCA9IHRleHQucGF0aDtcblxuICAgIGlmICghYXRvbS5wcm9qZWN0LmNvbnRhaW5zKGxvY2FsKSkgcmV0dXJuO1xuXG4gICAgLy8gUmVhZCBjb25maWcgaWYgdW5kZWZpbmVkXG4gICAgaWYgKCF0aGlzLmNsaWVudC5mdHBDb25maWdQYXRoKSB7XG4gICAgICB0aGlzLmNsaWVudC5yZWFkQ29uZmlnKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2xpZW50LmZ0cENvbmZpZ1BhdGggIT09IHRoaXMuY2xpZW50LmdldENvbmZpZ1BhdGgoKSkgcmV0dXJuO1xuXG4gICAgLy8gLmZ0cGlnbm9yZSBmaWx0ZXJcbiAgICBpZiAodGhpcy5jbGllbnQuY2hlY2tJZ25vcmUobG9jYWwpKSByZXR1cm47XG5cbiAgICBpZiAobG9jYWwgPT09IHRoaXMuY2xpZW50LmdldENvbmZpZ1BhdGgoKSkgcmV0dXJuO1xuICAgIC8vIFRPRE86IEFkZCBmaXggZm9yIGZpbGVzIHdoaWNoIGFyZSB1cGxvYWRlZCBmcm9tIGEgZ2xvYiBzZWxlY3RvclxuICAgIC8vIGRvbid0IHVwbG9hZCBmaWxlcyB3YXRjaGVkLCB0aGV5IHdpbGwgYmUgdXBsb2FkZWQgYnkgdGhlIHdhdGNoZXJcbiAgICAvLyBkb2Vzbid0IHdvcmsgZnVsbHkgd2l0aCBuZXcgdmVyc2lvbiBvZiB3YXRjaGVyXG4gICAgaWYgKHRoaXMuY2xpZW50LndhdGNoLmZpbGVzLmluZGV4T2YobG9jYWwpID49IDApIHJldHVybjtcblxuICAgIC8vIGdldCBmaWxlIG5hbWUgZm9yIG5vdGlmaWNhdGlvbiBtZXNzYWdlXG4gICAgY29uc3QgdXBsb2FkZWRJdGVtID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldEZpbGVOYW1lKCk7XG5cbiAgICB0aGlzLmNsaWVudC51cGxvYWQobG9jYWwsIChlcnIpID0+IHtcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAubm90aWZpY2F0aW9ucy5lbmFibGVUcmFuc2ZlcicpKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6ICR7dXBsb2FkZWRJdGVtfSBjb3VsZCBub3QgdXBsb2FkLmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGBSZW1vdGUgRlRQOiAke3VwbG9hZGVkSXRlbX0gdXBsb2FkZWQuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN1bWVFbGVtZW50SWNvbnMoZm4pIHtcbiAgICBzZXRJY29uSGFuZGxlcihmbik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHNldEljb25IYW5kbGVyKG51bGwpO1xuICAgIH0pO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1haW4oKTtcbiJdfQ==