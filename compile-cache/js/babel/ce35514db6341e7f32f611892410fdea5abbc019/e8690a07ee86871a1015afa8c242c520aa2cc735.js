Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* global atom */

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _pathsProvider = require('./paths-provider');

var _pathsProvider2 = _interopRequireDefault(_pathsProvider);

var _atom = require('atom');

var _configOptionScopes = require('./config/option-scopes');

var _configOptionScopes2 = _interopRequireDefault(_configOptionScopes);

'use babel';exports['default'] = {
  config: _config2['default'],
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'autocomplete-paths:rebuild-cache': function autocompletePathsRebuildCache() {
        _this._provider.rebuildCache();
      }
    }));

    var cacheOptions = ['core.ignoredNames', 'core.excludeVcsIgnoredPaths', 'autocomplete-paths.ignoreSubmodules', 'autocomplete-paths.ignoredNames', 'autocomplete-paths.ignoredPatterns'];
    cacheOptions.forEach(function (cacheOption) {
      _this.subscriptions.add(atom.config.observe(cacheOption, function (value) {
        if (!_this._provider) return;
        _this._provider.rebuildCache();
      }));
    });

    var scopeOptions = ['autocomplete-paths.scopes'];
    for (var key in _configOptionScopes2['default']) {
      scopeOptions.push('autocomplete-paths.' + key);
    }
    scopeOptions.forEach(function (scopeOption) {
      _this.subscriptions.add(atom.config.observe(scopeOption, function (value) {
        if (!_this._provider) return;
        _this._provider.reloadScopes();
      }));
    });
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
    if (this._provider) {
      this._provider.dispose();
      this._provider = null;
    }
    if (this._statusBarTile) {
      this._statusBarTile.destroy();
      this._statusBarTile = null;
    }
  },

  /**
   * Invoked when the status bar becomes available
   * @param  {StatusBar} statusBar
   */
  consumeStatusBar: function consumeStatusBar(statusBar) {
    this._statusBar = statusBar;
    if (this._displayStatusBarItemOnConsumption) {
      this._displayStatusBarTile();
    }
  },

  /**
   * Displays the status bar tile
   */
  _displayStatusBarTile: function _displayStatusBarTile() {
    var _this2 = this;

    if (!this._statusBar) {
      this._displayStatusBarItemOnConsumption = true;
      return;
    }
    if (this._statusBarTile) return;

    this._statusBarElement = document.createElement('autocomplete-paths-status-bar');
    this._statusBarElement.innerHTML = 'Rebuilding paths cache...';
    this._statusBarTile = this._statusBar.addRightTile({
      item: this._statusBarElement,
      priority: 100
    });
    this._statusBarInterval = setInterval(function () {
      var fileCount = _this2._provider.fileCount;
      _this2._statusBarElement.innerHTML = 'Rebuilding paths cache... ' + fileCount + ' files';
    }, 500);
  },

  /**
   * Hides the status bar tile
   */
  _hideStatusBarTile: function _hideStatusBarTile() {
    clearInterval(this._statusBarInterval);
    this._statusBarTile && this._statusBarTile.destroy();
    this._statusBarTile = null;
    this._statusBarElement = null;
  },

  getProvider: function getProvider() {
    var _this3 = this;

    if (!this._provider) {
      this._provider = new _pathsProvider2['default']();
      this._provider.on('rebuild-cache', function () {
        _this3._displayStatusBarTile();
      });
      this._provider.on('rebuild-cache-done', function () {
        _this3._hideStatusBarTile();
      });
      this._provider.rebuildCache();
    }
    return this._provider;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9hdXRvY29tcGxldGUtcGF0aHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7c0JBR21CLFVBQVU7Ozs7NkJBQ0gsa0JBQWtCOzs7O29CQUNSLE1BQU07O2tDQUNqQix3QkFBd0I7Ozs7QUFOakQsV0FBVyxDQUFBLHFCQVFJO0FBQ2IsUUFBTSxxQkFBUTtBQUNkLGVBQWEsRUFBRSxJQUFJOztBQUVuQixVQUFRLEVBQUUsb0JBQVk7OztBQUNwQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBO0FBQzlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELHdDQUFrQyxFQUFFLHlDQUFNO0FBQ3hDLGNBQUssU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFBO09BQzlCO0tBQ0YsQ0FBQyxDQUFDLENBQUE7O0FBRUgsUUFBTSxZQUFZLEdBQUcsQ0FDbkIsbUJBQW1CLEVBQ25CLDZCQUE2QixFQUM3QixxQ0FBcUMsRUFDckMsaUNBQWlDLEVBQ2pDLG9DQUFvQyxDQUNyQyxDQUFBO0FBQ0QsZ0JBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDbEMsWUFBSyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxVQUFBLEtBQUssRUFBSTtBQUMvRCxZQUFJLENBQUMsTUFBSyxTQUFTLEVBQUUsT0FBTTtBQUMzQixjQUFLLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtPQUM5QixDQUFDLENBQUMsQ0FBQTtLQUNKLENBQUMsQ0FBQTs7QUFFRixRQUFNLFlBQVksR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUE7QUFDbEQsU0FBSyxJQUFJLEdBQUcscUNBQWtCO0FBQzVCLGtCQUFZ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Q0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUE7S0FDOUI7QUFDRCxXQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7R0FDdEI7Q0FDRiIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL3N0YXJ0Ly5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wYXRocy9saWIvYXV0b2NvbXBsZXRlLXBhdGhzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcclxuLyogZ2xvYmFsIGF0b20gKi9cclxuXHJcbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcnXHJcbmltcG9ydCBQYXRoc1Byb3ZpZGVyIGZyb20gJy4vcGF0aHMtcHJvdmlkZXInXHJcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xyXG5pbXBvcnQgT3B0aW9uU2NvcGVzIGZyb20gJy4vY29uZmlnL29wdGlvbi1zY29wZXMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgY29uZmlnOiBDb25maWcsXHJcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcclxuXHJcbiAgYWN0aXZhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xyXG4gICAgICAnYXV0b2NvbXBsZXRlLXBhdGhzOnJlYnVpbGQtY2FjaGUnOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fcHJvdmlkZXIucmVidWlsZENhY2hlKClcclxuICAgICAgfVxyXG4gICAgfSkpXHJcblxyXG4gICAgY29uc3QgY2FjaGVPcHRpb25zID0gW1xyXG4gICAgICAnY29yZS5pZ25vcmVkTmFtZXMnLFxyXG4gICAgICAnY29yZS5leGNsdWRlVmNzSWdub3JlZFBhdGhzJyxcclxuICAgICAgJ2F1dG9jb21wbGV0ZS1wYXRocy5pZ25vcmVTdWJtb2R1bGVzJyxcclxuICAgICAgJ2F1dG9jb21wbGV0ZS1wYXRocy5pZ25vcmVkTmFtZXMnLFxyXG4gICAgICAnYXV0b2NvbXBsZXRlLXBhdGhzLmlnbm9yZWRQYXR0ZXJucydcclxuICAgIF1cclxuICAgIGNhY2hlT3B0aW9ucy5mb3JFYWNoKGNhY2hlT3B0aW9uID0+IHtcclxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKGNhY2hlT3B0aW9uLCB2YWx1ZSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wcm92aWRlcikgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5fcHJvdmlkZXIucmVidWlsZENhY2hlKClcclxuICAgICAgfSkpXHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IHNjb3BlT3B0aW9ucyA9IFsnYXV0b2NvbXBsZXRlLXBhdGhzLnNjb3BlcyddXHJcbiAgICBmb3IgKGxldCBrZXkgaW4gT3B0aW9uU2NvcGVzKSB7XHJcbiAgICAgIHNjb3BlT3B0aW9ucy5wdXNoKGBhdXRvY29tcGxldGUtcGF0aHMuJHtrZXl9YClcclxuICAgIH1cclxuICAgIHNjb3BlT3B0aW9ucy5mb3JFYWNoKHNjb3BlT3B0aW9uID0+IHtcclxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKHNjb3BlT3B0aW9uLCB2YWx1ZSA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wcm92aWRlcikgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5fcHJvdmlkZXIucmVsb2FkU2NvcGVzKClcclxuICAgICAgfSkpXHJcbiAgICB9KVxyXG4gIH0sXHJcblxyXG4gIGRlYWN0aXZhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcclxuICAgIGlmICh0aGlzLl9wcm92aWRlcikge1xyXG4gICAgICB0aGlzLl9wcm92aWRlci5kaXNwb3NlKClcclxuICAgICAgdGhpcy5fcHJvdmlkZXIgPSBudWxsXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5fc3RhdHVzQmFyVGlsZSkge1xyXG4gICAgICB0aGlzLl9zdGF0dXNCYXJUaWxlLmRlc3Ryb3koKVxyXG4gICAgICB0aGlzLl9zdGF0dXNCYXJUaWxlID0gbnVsbFxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEludm9rZWQgd2hlbiB0aGUgc3RhdHVzIGJhciBiZWNvbWVzIGF2YWlsYWJsZVxyXG4gICAqIEBwYXJhbSAge1N0YXR1c0Jhcn0gc3RhdHVzQmFyXHJcbiAgICovXHJcbiAgY29uc3VtZVN0YXR1c0JhcjogZnVuY3Rpb24gKHN0YXR1c0Jhcikge1xyXG4gICAgdGhpcy5fc3RhdHVzQmFyID0gc3RhdHVzQmFyXHJcbiAgICBpZiAodGhpcy5fZGlzcGxheVN0YXR1c0Jhckl0ZW1PbkNvbnN1bXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuX2Rpc3BsYXlTdGF0dXNCYXJUaWxlKClcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEaXNwbGF5cyB0aGUgc3RhdHVzIGJhciB0aWxlXHJcbiAgICovXHJcbiAgX2Rpc3BsYXlTdGF0dXNCYXJUaWxlICgpIHtcclxuICAgIGlmICghdGhpcy5fc3RhdHVzQmFyKSB7XHJcbiAgICAgIHRoaXMuX2Rpc3BsYXlTdGF0dXNCYXJJdGVtT25Db25zdW1wdGlvbiA9IHRydWVcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5fc3RhdHVzQmFyVGlsZSkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5fc3RhdHVzQmFyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1dG9jb21wbGV0ZS1wYXRocy1zdGF0dXMtYmFyJylcclxuICAgIHRoaXMuX3N0YXR1c0JhckVsZW1lbnQuaW5uZXJIVE1MID0gJ1JlYnVpbGRpbmcgcGF0aHMgY2FjaGUuLi4nXHJcbiAgICB0aGlzLl9zdGF0dXNCYXJUaWxlID0gdGhpcy5fc3RhdHVzQmFyLmFkZFJpZ2h0VGlsZSh7XHJcbiAgICAgIGl0ZW06IHRoaXMuX3N0YXR1c0JhckVsZW1lbnQsXHJcbiAgICAgIHByaW9yaXR5OiAxMDBcclxuICAgIH0pXHJcbiAgICB0aGlzLl9zdGF0dXNCYXJJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgY29uc3QgZmlsZUNvdW50ID0gdGhpcy5fcHJvdmlkZXIuZmlsZUNvdW50O1xyXG4gICAgICB0aGlzLl9zdGF0dXNCYXJFbGVtZW50LmlubmVySFRNTCA9IGBSZWJ1aWxkaW5nIHBhdGhzIGNhY2hlLi4uICR7ZmlsZUNvdW50fSBmaWxlc2A7XHJcbiAgICB9LCA1MDApXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogSGlkZXMgdGhlIHN0YXR1cyBiYXIgdGlsZVxyXG4gICAqL1xyXG4gIF9oaWRlU3RhdHVzQmFyVGlsZSAoKSB7XHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuX3N0YXR1c0JhckludGVydmFsKVxyXG4gICAgdGhpcy5fc3RhdHVzQmFyVGlsZSAmJiB0aGlzLl9zdGF0dXNCYXJUaWxlLmRlc3Ryb3koKVxyXG4gICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IG51bGxcclxuICAgIHRoaXMuX3N0YXR1c0JhckVsZW1lbnQgPSBudWxsXHJcbiAgfSxcclxuXHJcbiAgZ2V0UHJvdmlkZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy5fcHJvdmlkZXIpIHtcclxuICAgICAgdGhpcy5fcHJvdmlkZXIgPSBuZXcgUGF0aHNQcm92aWRlcigpXHJcbiAgICAgIHRoaXMuX3Byb3ZpZGVyLm9uKCdyZWJ1aWxkLWNhY2hlJywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX2Rpc3BsYXlTdGF0dXNCYXJUaWxlKClcclxuICAgICAgfSlcclxuICAgICAgdGhpcy5fcHJvdmlkZXIub24oJ3JlYnVpbGQtY2FjaGUtZG9uZScsICgpID0+IHtcclxuICAgICAgICB0aGlzLl9oaWRlU3RhdHVzQmFyVGlsZSgpXHJcbiAgICAgIH0pXHJcbiAgICAgIHRoaXMuX3Byb3ZpZGVyLnJlYnVpbGRDYWNoZSgpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJcclxuICB9XHJcbn1cclxuIl19