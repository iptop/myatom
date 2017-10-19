Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _atomSpacePenViews = require('atom-space-pen-views');

var _helpers = require('../helpers');

var _directoryView = require('./directory-view');

var _directoryView2 = _interopRequireDefault(_directoryView);

'use babel';

var hideLocalTreeError = false;

function hideLocalTree() {
  var treeView = (0, _helpers.getObject)({
    obj: atom.packages.loadedPackages,
    keys: ['tree-view', 'mainModule', 'treeView']
  });

  if (treeView && typeof treeView.detach === 'function') {
    // Fix for Issue 433 ( workaround to stop throwing error)
    try {
      treeView.detach();
    } catch (e) {
      if (hideLocalTreeError === false) {
        atom.notifications.addWarning('Remote FTP: See issue #433', {
          dismissable: false
        });
        hideLocalTreeError = true;
      }
    }
  }
}

function showLocalTree() {
  var treeView = (0, _helpers.getObject)({
    obj: atom.packages.loadedPackages,
    keys: ['tree-view', 'mainModule', 'treeView']
  });
  if (treeView && typeof treeView.detach === 'function') treeView.attach();
}

var TreeView = (function (_ScrollView) {
  _inherits(TreeView, _ScrollView);

  function TreeView() {
    _classCallCheck(this, TreeView);

    _get(Object.getPrototypeOf(TreeView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(TreeView, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _get(Object.getPrototypeOf(TreeView.prototype), 'initialize', this).apply(this, args);

      // Supported for old API
      this.getSelected = _helpers.getSelectedTree;
      this.resolve = _helpers.resolveTree;

      var html = '\n    <div class="remote-ftp-offline-inner">\n    <div class="remote-ftp-picto"><span class="icon icon-shield"></span></div>\n    <ul>\n      <li><a role="connect" class="btn btn-default icon">Connect</a><br /></li>\n      <li><a role="configure" class="btn btn-default icon">Edit Configuration</a><br /></li>\n      <li><a role="configure_ignored" class="btn btn-default icon">Edit Ignore Configuration</a><br /></li>\n      <li><a role="toggle" class="btn btn-default icon">Close Panel</a></li>\n    </ul>\n    </div>';

      this.offline.html(html);

      if (atom.project.remoteftp.isConnected()) {
        this.showOnline();
      } else {
        this.showOffline();
      }

      this.root = new _directoryView2['default'](atom.project.remoteftp.root);
      this.root.expand();
      this.list.append(this.root);

      // Events
      atom.config.onDidChange('tree-view.showOnRightSide', function () {
        if (_this.isVisible()) {
          setTimeout(function () {
            _this.detach();
            _this.attach();
          }, 1);
        }
      });

      atom.config.onDidChange('Remote-FTP.tree.hideLocalWhenDisplayed', function (values) {
        if (values.newValue) {
          if (_this.isVisible()) {
            hideLocalTree();
          }
        } else if (_this.isVisible()) {
          _this.detach();
          showLocalTree();
          _this.attach();
        } else {
          showLocalTree();
        }
      });

      atom.config.onDidChange('Remote-FTP.tree.useDockIntegration', function () {
        if (typeof atom.workspace.getRightDock === 'undefined') {
          atom.notifications.addWarning('Your editor is <b>deprecated</b>.<br />This option is available only >=1.17.0 version.');
          atom.config.set('Remote-FTP.tree.useDockIntegration', 'false');
        } else if (_this.isVisible()) {
          setTimeout(function () {
            _this.detach();
            _this.attach();
          }, 1);
        }
      });

      atom.project.remoteftp.on('debug', function (msg) {
        _this.debug.prepend('<li>' + msg + '</li>');
        var children = _this.debug.children();

        if (children.length > 20) {
          children.last().remove();
        }
      });

      atom.project.remoteftp.on('queue-changed', function () {
        _this.progress.empty();

        var queues = [];
        if (atom.project.remoteftp.current) {
          queues.push(atom.project.remoteftp.current);
        }

        atom.project.remoteftp.queue.forEach(function (queueElem) {
          queues.push(queueElem);
        });

        if (queues.length === 0) {
          _this.progress.hide();
        } else {
          _this.progress.show();

          queues.forEach(function (queue) {
            var $li = (0, _atomSpacePenViews.$)('<li><progress class="inline-block" /><div class="name">' + queue[0] + '</div><div class="eta">-</div></li>');
            var $progress = $li.children('progress');
            var $eta = $li.children('.eta');
            var progress = queue[2];

            _this.progress.append($li);

            progress.on('progress', function (percent) {
              if (percent === -1) {
                $progress.removeAttr('max').removeAttr('value');
                $eta.text('-');
              } else {
                $progress.attr('max', 100).attr('value', parseInt(percent * 100, 10));
                var eta = progress.getEta();

                $eta.text((0, _helpers.elapsedTime)(eta));
              }
            });

            progress.once('done', function () {
              progress.removeAllListeners('progress');
            });
          });
        }
      });

      this.offline.on('click', '[role="connect"]', function () {
        atom.project.remoteftp.readConfig(function () {
          atom.project.remoteftp.connect();
        });
      });

      this.offline.on('click', '[role="configure"]', function () {
        atom.workspace.open(atom.project.remoteftp.getConfigPath());
      });

      this.offline.on('click', '[role="configure_ignored"]', function () {
        atom.workspace.open(atom.project.getDirectories()[0].resolve('.ftpignore'));
      });

      this.offline.on('click', '[role="toggle"]', function () {
        _this.toggle();
      });

      this.horizontalResize.on('dblclick', function (e) {
        _this.resizeToFitContent(e);
      });
      this.horizontalResize.on('mousedown', function (e) {
        _this.resizeHorizontalStarted(e);
      });
      this.verticalResize.on('mousedown', function (e) {
        _this.resizeVerticalStarted(e);
      });
      this.list.on('keydown', function (e) {
        _this.remoteKeyboardNavigation(e);
      });

      atom.project.remoteftp.on('connected', function () {
        _this.showOnline();
      });

      atom.project.remoteftp.on('disconnected', function () {
        _this.showOffline();
      });

      this.getTitle = function () {
        return 'Remote';
      };
    }
  }, {
    key: 'attach',
    value: function attach() {
      var enableDock = atom.config.get('Remote-FTP.tree.useDockIntegration');
      var showOnRightSide = atom.config.get('tree-view.showOnRightSide');
      var hideLocalDisplay = atom.config.get('Remote-FTP.tree.hideLocalWhenDisplayed');

      if (showOnRightSide && enableDock) {
        // if show on right side && use new integration
        var activePane = atom.workspace.getRightDock().paneContainer.getActivePane();

        this.panel = activePane.addItem(this);
        activePane.activateItemforURI(this.getTitle());
      } else if (!showOnRightSide && enableDock) {
        // if not show on right side && use new integration
        var activePane = atom.workspace.getLeftDock().paneContainer.getActivePane();

        this.panel = activePane.addItem(this);
        activePane.activateItem(this.panel);
      } else if (showOnRightSide && !enableDock) {
        // if show on right side && not use new integration
        this.panel = atom.workspace.addRightPanel({ item: this });
      } else if (!showOnRightSide && !enableDock) {
        // if not show on right side && not use new integration
        this.panel = atom.workspace.addLeftPanel({ item: this });
      }

      if (hideLocalDisplay) {
        hideLocalTree();
      } else {
        showLocalTree();
      }
    }
  }, {
    key: 'attached',
    value: function attached() {
      var enableDock = atom.config.get('Remote-FTP.tree.useDockIntegration');
      var appVersion = atom.appVersion.split('-')[0];

      if (_semver2['default'].satisfies(appVersion, '<1.17.0')) {
        this.classList.add('oldversion');
      }

      if (!enableDock && _semver2['default'].satisfies(appVersion, '>=1.17.0')) {
        this.tabPanel.addClass('show');
      } else {
        this.tabPanel.removeClass('show');
      }

      this.attr('data-use-dock-integration', enableDock);
    }
  }, {
    key: 'detach',
    value: function detach() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      _get(Object.getPrototypeOf(TreeView.prototype), 'detach', this).apply(this, args);

      if (this.panel) {
        if (typeof this.panel.destroy === 'function') {
          this.panel.destroy();
        } else if (typeof atom.workspace.paneForItem === 'function') {
          if (typeof atom.workspace.paneForItem(this.panel) !== 'undefined') {
            atom.workspace.paneForItem(this.panel).destroyItem(this.panel, true);
          }
        }

        this.panel = null;
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (typeof this.panel !== 'undefined' && this.panel !== null) {
        this.detach();
      } else {
        this.attach();
      }
    }
  }, {
    key: 'showOffline',
    value: function showOffline() {
      this.list.hide();
      this.queue.hide();
      this.offline.css('display', 'flex');
    }
  }, {
    key: 'showOnline',
    value: function showOnline() {
      this.list.show();
      this.queue.show();
      this.offline.hide();
    }
  }, {
    key: 'resizeVerticalStarted',
    value: function resizeVerticalStarted(e) {
      e.preventDefault();

      var $doc = (0, _atomSpacePenViews.$)(document);

      this.resizeHeightStart = this.queue.height();
      this.resizeMouseStart = e.pageY;

      $doc.on('mousemove', this.resizeVerticalView.bind(this));
      $doc.on('mouseup', this.resizeVerticalStopped);
    }
  }, {
    key: 'resizeVerticalStopped',
    value: function resizeVerticalStopped() {
      delete this.resizeHeightStart;
      delete this.resizeMouseStart;

      var $doc = (0, _atomSpacePenViews.$)(document);

      $doc.off('mousemove', this.resizeVerticalView);
      $doc.off('mouseup', this.resizeVerticalStopped);
    }
  }, {
    key: 'resizeVerticalView',
    value: function resizeVerticalView(e) {
      if (e.which !== 1) {
        return this.resizeVerticalStopped();
      }

      var delta = e.pageY - this.resizeMouseStart;
      var height = Math.max(26, this.resizeHeightStart - delta);

      this.queue.height(height);
      this.scroller.css('bottom', height + 'px');

      return true;
    }
  }, {
    key: 'resizeHorizontalStarted',
    value: function resizeHorizontalStarted(e) {
      e.preventDefault();

      this.resizeWidthStart = this.width();
      this.resizeMouseStart = e.pageX;

      var $doc = (0, _atomSpacePenViews.$)(document);

      $doc.on('mousemove', this.resizeHorizontalView.bind(this));
      $doc.on('mouseup', this.resizeHorizontalStopped);
    }
  }, {
    key: 'resizeHorizontalStopped',
    value: function resizeHorizontalStopped() {
      delete this.resizeWidthStart;
      delete this.resizeMouseStart;

      var $doc = (0, _atomSpacePenViews.$)(document);

      $doc.off('mousemove', this.resizeHorizontalView);
      $doc.off('mouseup', this.resizeHorizontalStopped);
    }
  }, {
    key: 'resizeHorizontalView',
    value: function resizeHorizontalView(e) {
      if (e.which !== 1) {
        return this.resizeHorizontalStopped();
      }

      var delta = e.pageX - this.resizeMouseStart;
      var width = Math.max(50, this.resizeWidthStart + delta);

      this.width(width);

      return true;
    }
  }, {
    key: 'resizeToFitContent',
    value: function resizeToFitContent(e) {
      e.preventDefault();

      this.width(1);
      this.width(this.list.outerWidth());
    }
  }, {
    key: 'remoteKeyboardNavigation',
    value: function remoteKeyboardNavigation(e) {
      var arrows = { left: 37, up: 38, right: 39, down: 40 };
      var keyCode = e.keyCode || e.which;

      switch (keyCode) {
        case arrows.up:
          this.remoteKeyboardNavigationUp();
          break;
        case arrows.down:
          this.remoteKeyboardNavigationDown();
          break;
        case arrows.left:
          this.remoteKeyboardNavigationLeft();
          break;
        case arrows.right:
          this.remoteKeyboardNavigationRight();
          break;
        default:
          return;
      }

      e.preventDefault();
      e.stopPropagation();

      this.remoteKeyboardNavigationMovePage();
    }
  }, {
    key: 'remoteKeyboardNavigationUp',
    value: function remoteKeyboardNavigationUp() {
      var current = this.list.find('.selected');

      var next = current.prev('.entry:visible');

      if (next.length) {
        while (next.is('.expanded') && next.find('.entries .entry:visible').length) {
          next = next.find('.entries .entry:visible');
        }
      } else {
        next = current.closest('.entries').closest('.entry:visible');
      }

      if (next.length) {
        current.removeClass('selected');
        next.last().addClass('selected');
      }
    }
  }, {
    key: 'remoteKeyboardNavigationDown',
    value: function remoteKeyboardNavigationDown() {
      var current = this.list.find('.selected');

      var next = current.find('.entries .entry:visible');
      var tmp = null;

      if (!next.length) {
        tmp = current;

        do {
          next = tmp.next('.entry:visible');

          if (!next.length) {
            tmp = tmp.closest('.entries').closest('.entry:visible');
          }
        } while (!next.length && !tmp.is('.project-root'));
      }
      if (next.length) {
        current.removeClass('selected');
        next.first().addClass('selected');
      }
    }
  }, {
    key: 'remoteKeyboardNavigationLeft',
    value: function remoteKeyboardNavigationLeft() {
      var current = this.list.find('.selected');

      var next = null;

      if (!current.is('.directory')) {
        next = current.closest('.directory');
        next.view().collapse();

        current.removeClass('selected');
        next.first().addClass('selected');
      } else {
        current.view().collapse();
      }
    }
  }, {
    key: 'remoteKeyboardNavigationRight',
    value: function remoteKeyboardNavigationRight() {
      var current = this.list.find('.selected');

      if (current.is('.directory')) {
        var view = current.view();

        view.open();
        view.expand();
      }
    }
  }, {
    key: 'remoteKeyboardNavigationMovePage',
    value: function remoteKeyboardNavigationMovePage() {
      var current = this.list.find('.selected');

      if (current.length) {
        var scrollerTop = this.scroller.scrollTop();
        var selectedTop = current.position().top;

        if (selectedTop < scrollerTop - 10) {
          this.scroller.pageUp();
        } else if (selectedTop > scrollerTop + (this.scroller.height() - 10)) {
          this.scroller.pageDown();
        }
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this2 = this;

      return this.div({
        'class': 'remote-ftp-view ftptree-view-resizer tool-panel',
        'data-show-on-right-side': atom.config.get('tree-view.showOnRightSide'),
        'data-use-dock-integration': atom.config.get('Remote-FTP.tree.useDockIntegration')
      }, function () {
        _this2.ul({
          'class': 'list-inline tab-bar inset-panel show',
          is: 'atom-tabs',
          tabindex: -1,
          location: 'left',
          outlet: 'tabPanel'
        }, function () {
          _this2.li({
            'class': 'tab',
            is: 'tabs-tab',
            'data-type': 'TreeView'
          }, function () {
            _this2.div({
              'class': 'title'
            }, function () {
              _this2.text('Remote');
            });
          });
        });

        _this2.div({
          'class': 'scroller',
          outlet: 'scroller'
        }, function () {
          _this2.ol({
            'class': 'ftptree-view full-menu list-tree has-collapsable-children focusable-panel',
            tabindex: -1,
            outlet: 'list'
          });
        });

        _this2.div({
          'class': 'resize-handle',
          outlet: 'horizontalResize',
          style: 'cursor:' + _helpers.resizeCursor });

        // platform specific cursor
        _this2.div({
          'class': 'queue tool-panel panel-bottom',
          tabindex: -1,
          outlet: 'queue'
        }, function () {
          _this2.ul({
            'class': 'progress tool-panel panel-top',
            tabindex: -1,
            outlet: 'progress'
          });
          _this2.ul({
            'class': 'list',
            tabindex: -1,
            outlet: 'debug'
          });
          return _this2.div({
            'class': 'resize-handle',
            outlet: 'verticalResize'
          });
        });

        _this2.div({
          'class': 'offline',
          tabindex: -1,
          outlet: 'offline'
        });
      });
    }
  }]);

  return TreeView;
})(_atomSpacePenViews.ScrollView);

exports['default'] = TreeView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi92aWV3cy90cmVlLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRW1CLFFBQVE7Ozs7aUNBQ0csc0JBQXNCOzt1QkFPN0MsWUFBWTs7NkJBQ08sa0JBQWtCOzs7O0FBWDVDLFdBQVcsQ0FBQzs7QUFhWixJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQzs7QUFFL0IsU0FBUyxhQUFhLEdBQUc7QUFDdkIsTUFBTSxRQUFRLEdBQUcsd0JBQVU7QUFDekIsT0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYztBQUNqQyxRQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQztHQUM5QyxDQUFDLENBQUM7O0FBRUgsTUFBSSxRQUFRLElBQUksT0FBTyxRQUFRLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTs7QUFDckQsUUFBSTtBQUNGLGNBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNuQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsVUFBSSxrQkFBa0IsS0FBSyxLQUFLLEVBQUU7QUFDaEMsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsNEJBQTRCLEVBQUU7QUFDMUQscUJBQVcsRUFBRSxLQUFLO1NBQ25CLENBQUMsQ0FBQztBQUNILDBCQUFrQixHQUFHLElBQUksQ0FBQztPQUMzQjtLQUNGO0dBQ0Y7Q0FDRjs7QUFFRCxTQUFTLGFBQWEsR0FBRztBQUN2QixNQUFNLFFBQVEsR0FBRyx3QkFBVTtBQUN6QixPQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjO0FBQ2pDLFFBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDO0dBQzlDLENBQUMsQ0FBQztBQUNILE1BQUksUUFBUSxJQUFJLE9BQU8sUUFBUSxDQUFDLE1BQU0sS0FBSyxV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Qzs7QUFFSCxlQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLFNBQVM7QUFDaEIsa0JBQVEsRUFBRSxDQUFDLENBQUM7QUFDWixnQkFBTSxFQUFFLFNBQVM7U0FDbEIsQ0FBQyxDQUFDO09BQ0osQ0FBQyxDQUFDO0tBQ0o7OztTQXhFRyxRQUFROzs7cUJBa2ZDLFFBQVEiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL3ZpZXdzL3RyZWUtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgeyAkLCBTY3JvbGxWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHtcbiAgZ2V0T2JqZWN0LFxuICByZXNpemVDdXJzb3IsXG4gIGVsYXBzZWRUaW1lLFxuICByZXNvbHZlVHJlZSxcbiAgZ2V0U2VsZWN0ZWRUcmVlLFxufSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCBEaXJlY3RvcnlWaWV3IGZyb20gJy4vZGlyZWN0b3J5LXZpZXcnO1xuXG5sZXQgaGlkZUxvY2FsVHJlZUVycm9yID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGhpZGVMb2NhbFRyZWUoKSB7XG4gIGNvbnN0IHRyZWVWaWV3ID0gZ2V0T2JqZWN0KHtcbiAgICBvYmo6IGF0b20ucGFja2FnZXMubG9hZGVkUGFja2FnZXMsXG4gICAga2V5czogWyd0cmVlLXZpZXcnLCAnbWFpbk1vZHVsZScsICd0cmVlVmlldyddLFxuICB9KTtcblxuICBpZiAodHJlZVZpZXcgJiYgdHlwZW9mIHRyZWVWaWV3LmRldGFjaCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBGaXggZm9yIElzc3VlIDQzMyAoIHdvcmthcm91bmQgdG8gc3RvcCB0aHJvd2luZyBlcnJvcilcbiAgICB0cnkge1xuICAgICAgdHJlZVZpZXcuZGV0YWNoKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGhpZGVMb2NhbFRyZWVFcnJvciA9PT0gZmFsc2UpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1JlbW90ZSBGVFA6IFNlZSBpc3N1ZSAjNDMzJywge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGhpZGVMb2NhbFRyZWVFcnJvciA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNob3dMb2NhbFRyZWUoKSB7XG4gIGNvbnN0IHRyZWVWaWV3ID0gZ2V0T2JqZWN0KHtcbiAgICBvYmo6IGF0b20ucGFja2FnZXMubG9hZGVkUGFja2FnZXMsXG4gICAga2V5czogWyd0cmVlLXZpZXcnLCAnbWFpbk1vZHVsZScsICd0cmVlVmlldyddLFxuICB9KTtcbiAgaWYgKHRyZWVWaWV3ICYmIHR5cGVvZiB0cmVlVmlldy5kZXRhY2ggPT09ICdmdW5jdGlvbicpIHRyZWVWaWV3LmF0dGFjaCgpO1xufVxuXG5jbGFzcyBUcmVlVmlldyBleHRlbmRzIFNjcm9sbFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmRpdih7XG4gICAgICBjbGFzczogJ3JlbW90ZS1mdHAtdmlldyBmdHB0cmVlLXZpZXctcmVzaXplciB0b29sLXBhbmVsJyxcbiAgICAgICdkYXRhLXNob3ctb24tcmlnaHQtc2lkZSc6IGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpLFxuICAgICAgJ2RhdGEtdXNlLWRvY2staW50ZWdyYXRpb24nOiBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAudHJlZS51c2VEb2NrSW50ZWdyYXRpb24nKSxcbiAgICB9LCAoKSA9PiB7XG4gICAgICB0aGlzLnVsKHtcbiAgICAgICAgY2xhc3M6ICdsaXN0LWlubGluZSB0YWItYmFyIGluc2V0LXBhbmVsIHNob3cnLFxuICAgICAgICBpczogJ2F0b20tdGFicycsXG4gICAgICAgIHRhYmluZGV4OiAtMSxcbiAgICAgICAgbG9jYXRpb246ICdsZWZ0JyxcbiAgICAgICAgb3V0bGV0OiAndGFiUGFuZWwnLFxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmxpKHtcbiAgICAgICAgICBjbGFzczogJ3RhYicsXG4gICAgICAgICAgaXM6ICd0YWJzLXRhYicsXG4gICAgICAgICAgJ2RhdGEtdHlwZSc6ICdUcmVlVmlldycsXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRpdih7XG4gICAgICAgICAgICBjbGFzczogJ3RpdGxlJyxcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRleHQoJ1JlbW90ZScpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAnc2Nyb2xsZXInLFxuICAgICAgICBvdXRsZXQ6ICdzY3JvbGxlcicsXG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2woe1xuICAgICAgICAgIGNsYXNzOiAnZnRwdHJlZS12aWV3IGZ1bGwtbWVudSBsaXN0LXRyZWUgaGFzLWNvbGxhcHNhYmxlLWNoaWxkcmVuIGZvY3VzYWJsZS1wYW5lbCcsXG4gICAgICAgICAgdGFiaW5kZXg6IC0xLFxuICAgICAgICAgIG91dGxldDogJ2xpc3QnLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAncmVzaXplLWhhbmRsZScsXG4gICAgICAgIG91dGxldDogJ2hvcml6b250YWxSZXNpemUnLFxuICAgICAgICBzdHlsZTogYGN1cnNvcjoke3Jlc2l6ZUN1cnNvcn1gLCAvLyBwbGF0Zm9ybSBzcGVjaWZpYyBjdXJzb3JcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmRpdih7XG4gICAgICAgIGNsYXNzOiAncXVldWUgdG9vbC1wYW5lbCBwYW5lbC1ib3R0b20nLFxuICAgICAgICB0YWJpbmRleDogLTEsXG4gICAgICAgIG91dGxldDogJ3F1ZXVlJyxcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy51bCh7XG4gICAgICAgICAgY2xhc3M6ICdwcm9ncmVzcyB0b29sLXBhbmVsIHBhbmVsLXRvcCcsXG4gICAgICAgICAgdGFiaW5kZXg6IC0xLFxuICAgICAgICAgIG91dGxldDogJ3Byb2dyZXNzJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudWwoe1xuICAgICAgICAgIGNsYXNzOiAnbGlzdCcsXG4gICAgICAgICAgdGFiaW5kZXg6IC0xLFxuICAgICAgICAgIG91dGxldDogJ2RlYnVnJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmRpdih7XG4gICAgICAgICAgY2xhc3M6ICdyZXNpemUtaGFuZGxlJyxcbiAgICAgICAgICBvdXRsZXQ6ICd2ZXJ0aWNhbFJlc2l6ZScsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgY2xhc3M6ICdvZmZsaW5lJyxcbiAgICAgICAgdGFiaW5kZXg6IC0xLFxuICAgICAgICBvdXRsZXQ6ICdvZmZsaW5lJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSguLi5hcmdzKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSguLi5hcmdzKTtcblxuICAgIC8vIFN1cHBvcnRlZCBmb3Igb2xkIEFQSVxuICAgIHRoaXMuZ2V0U2VsZWN0ZWQgPSBnZXRTZWxlY3RlZFRyZWU7XG4gICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZVRyZWU7XG5cbiAgICBjb25zdCBodG1sID0gYFxuICAgIDxkaXYgY2xhc3M9XCJyZW1vdGUtZnRwLW9mZmxpbmUtaW5uZXJcIj5cbiAgICA8ZGl2IGNsYXNzPVwicmVtb3RlLWZ0cC1waWN0b1wiPjxzcGFuIGNsYXNzPVwiaWNvbiBpY29uLXNoaWVsZFwiPjwvc3Bhbj48L2Rpdj5cbiAgICA8dWw+XG4gICAgICA8bGk+PGEgcm9sZT1cImNvbm5lY3RcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBpY29uXCI+Q29ubmVjdDwvYT48YnIgLz48L2xpPlxuICAgICAgPGxpPjxhIHJvbGU9XCJjb25maWd1cmVcIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBpY29uXCI+RWRpdCBDb25maWd1cmF0aW9uPC9hPjxiciAvPjwvbGk+XG4gICAgICA8bGk+PGEgcm9sZT1cImNvbmZpZ3VyZV9pZ25vcmVkXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgaWNvblwiPkVkaXQgSWdub3JlIENvbmZpZ3VyYXRpb248L2E+PGJyIC8+PC9saT5cbiAgICAgIDxsaT48YSByb2xlPVwidG9nZ2xlXCIgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgaWNvblwiPkNsb3NlIFBhbmVsPC9hPjwvbGk+XG4gICAgPC91bD5cbiAgICA8L2Rpdj5gO1xuXG4gICAgdGhpcy5vZmZsaW5lLmh0bWwoaHRtbCk7XG5cbiAgICBpZiAoYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnNob3dPbmxpbmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93T2ZmbGluZSgpO1xuICAgIH1cblxuICAgIHRoaXMucm9vdCA9IG5ldyBEaXJlY3RvcnlWaWV3KGF0b20ucHJvamVjdC5yZW1vdGVmdHAucm9vdCk7XG4gICAgdGhpcy5yb290LmV4cGFuZCgpO1xuICAgIHRoaXMubGlzdC5hcHBlbmQodGhpcy5yb290KTtcblxuICAgIC8vIEV2ZW50c1xuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCd0cmVlLXZpZXcuc2hvd09uUmlnaHRTaWRlJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgICB0aGlzLmF0dGFjaCgpO1xuICAgICAgICB9LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdSZW1vdGUtRlRQLnRyZWUuaGlkZUxvY2FsV2hlbkRpc3BsYXllZCcsICh2YWx1ZXMpID0+IHtcbiAgICAgIGlmICh2YWx1ZXMubmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICBoaWRlTG9jYWxUcmVlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1Zpc2libGUoKSkge1xuICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICBzaG93TG9jYWxUcmVlKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaG93TG9jYWxUcmVlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnUmVtb3RlLUZUUC50cmVlLnVzZURvY2tJbnRlZ3JhdGlvbicsICgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgYXRvbS53b3Jrc3BhY2UuZ2V0UmlnaHREb2NrID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnWW91ciBlZGl0b3IgaXMgPGI+ZGVwcmVjYXRlZDwvYj4uPGJyIC8+VGhpcyBvcHRpb24gaXMgYXZhaWxhYmxlIG9ubHkgPj0xLjE3LjAgdmVyc2lvbi4nKTtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdSZW1vdGUtRlRQLnRyZWUudXNlRG9ja0ludGVncmF0aW9uJywgJ2ZhbHNlJyk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgICB0aGlzLmF0dGFjaCgpO1xuICAgICAgICB9LCAxKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF0b20ucHJvamVjdC5yZW1vdGVmdHAub24oJ2RlYnVnJywgKG1zZykgPT4ge1xuICAgICAgdGhpcy5kZWJ1Zy5wcmVwZW5kKGA8bGk+JHttc2d9PC9saT5gKTtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5kZWJ1Zy5jaGlsZHJlbigpO1xuXG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMjApIHtcbiAgICAgICAgY2hpbGRyZW4ubGFzdCgpLnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC5vbigncXVldWUtY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIHRoaXMucHJvZ3Jlc3MuZW1wdHkoKTtcblxuICAgICAgY29uc3QgcXVldWVzID0gW107XG4gICAgICBpZiAoYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC5jdXJyZW50KSB7XG4gICAgICAgIHF1ZXVlcy5wdXNoKGF0b20ucHJvamVjdC5yZW1vdGVmdHAuY3VycmVudCk7XG4gICAgICB9XG5cbiAgICAgIGF0b20ucHJvamVjdC5yZW1vdGVmdHAucXVldWUuZm9yRWFjaCgocXVldWVFbGVtKSA9PiB7XG4gICAgICAgIHF1ZXVlcy5wdXNoKHF1ZXVlRWxlbSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHF1ZXVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5wcm9ncmVzcy5oaWRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb2dyZXNzLnNob3coKTtcblxuICAgICAgICBxdWV1ZXMuZm9yRWFjaCgocXVldWUpID0+IHtcbiAgICAgICAgICBjb25zdCAkbGkgPSAkKGA8bGk+PHByb2dyZXNzIGNsYXNzPVwiaW5saW5lLWJsb2NrXCIgLz48ZGl2IGNsYXNzPVwibmFtZVwiPiR7cXVldWVbMF19PC9kaXY+PGRpdiBjbGFzcz1cImV0YVwiPi08L2Rpdj48L2xpPmApO1xuICAgICAgICAgIGNvbnN0ICRwcm9ncmVzcyA9ICRsaS5jaGlsZHJlbigncHJvZ3Jlc3MnKTtcbiAgICAgICAgICBjb25zdCAkZXRhID0gJGxpLmNoaWxkcmVuKCcuZXRhJyk7XG4gICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBxdWV1ZVsyXTtcblxuICAgICAgICAgIHRoaXMucHJvZ3Jlc3MuYXBwZW5kKCRsaSk7XG5cbiAgICAgICAgICBwcm9ncmVzcy5vbigncHJvZ3Jlc3MnLCAocGVyY2VudCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBlcmNlbnQgPT09IC0xKSB7XG4gICAgICAgICAgICAgICRwcm9ncmVzcy5yZW1vdmVBdHRyKCdtYXgnKS5yZW1vdmVBdHRyKCd2YWx1ZScpO1xuICAgICAgICAgICAgICAkZXRhLnRleHQoJy0nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRwcm9ncmVzcy5hdHRyKCdtYXgnLCAxMDApLmF0dHIoJ3ZhbHVlJywgcGFyc2VJbnQocGVyY2VudCAqIDEwMCwgMTApKTtcbiAgICAgICAgICAgICAgY29uc3QgZXRhID0gcHJvZ3Jlc3MuZ2V0RXRhKCk7XG5cbiAgICAgICAgICAgICAgJGV0YS50ZXh0KGVsYXBzZWRUaW1lKGV0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcHJvZ3Jlc3Mub25jZSgnZG9uZScsICgpID0+IHtcbiAgICAgICAgICAgIHByb2dyZXNzLnJlbW92ZUFsbExpc3RlbmVycygncHJvZ3Jlc3MnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLm9mZmxpbmUub24oJ2NsaWNrJywgJ1tyb2xlPVwiY29ubmVjdFwiXScsICgpID0+IHtcbiAgICAgIGF0b20ucHJvamVjdC5yZW1vdGVmdHAucmVhZENvbmZpZygoKSA9PiB7XG4gICAgICAgIGF0b20ucHJvamVjdC5yZW1vdGVmdHAuY29ubmVjdCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9mZmxpbmUub24oJ2NsaWNrJywgJ1tyb2xlPVwiY29uZmlndXJlXCJdJywgKCkgPT4ge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihhdG9tLnByb2plY3QucmVtb3RlZnRwLmdldENvbmZpZ1BhdGgoKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9mZmxpbmUub24oJ2NsaWNrJywgJ1tyb2xlPVwiY29uZmlndXJlX2lnbm9yZWRcIl0nLCAoKSA9PiB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJy5mdHBpZ25vcmUnKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9mZmxpbmUub24oJ2NsaWNrJywgJ1tyb2xlPVwidG9nZ2xlXCJdJywgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuaG9yaXpvbnRhbFJlc2l6ZS5vbignZGJsY2xpY2snLCAoZSkgPT4geyB0aGlzLnJlc2l6ZVRvRml0Q29udGVudChlKTsgfSk7XG4gICAgdGhpcy5ob3Jpem9udGFsUmVzaXplLm9uKCdtb3VzZWRvd24nLCAoZSkgPT4geyB0aGlzLnJlc2l6ZUhvcml6b250YWxTdGFydGVkKGUpOyB9KTtcbiAgICB0aGlzLnZlcnRpY2FsUmVzaXplLm9uKCdtb3VzZWRvd24nLCAoZSkgPT4geyB0aGlzLnJlc2l6ZVZlcnRpY2FsU3RhcnRlZChlKTsgfSk7XG4gICAgdGhpcy5saXN0Lm9uKCdrZXlkb3duJywgKGUpID0+IHsgdGhpcy5yZW1vdGVLZXlib2FyZE5hdmlnYXRpb24oZSk7IH0pO1xuXG4gICAgYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC5vbignY29ubmVjdGVkJywgKCkgPT4ge1xuICAgICAgdGhpcy5zaG93T25saW5lKCk7XG4gICAgfSk7XG5cbiAgICBhdG9tLnByb2plY3QucmVtb3RlZnRwLm9uKCdkaXNjb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNob3dPZmZsaW5lKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmdldFRpdGxlID0gKCkgPT4gJ1JlbW90ZSc7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgY29uc3QgZW5hYmxlRG9jayA9IGF0b20uY29uZmlnLmdldCgnUmVtb3RlLUZUUC50cmVlLnVzZURvY2tJbnRlZ3JhdGlvbicpO1xuICAgIGNvbnN0IHNob3dPblJpZ2h0U2lkZSA9IGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpO1xuICAgIGNvbnN0IGhpZGVMb2NhbERpc3BsYXkgPSBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAudHJlZS5oaWRlTG9jYWxXaGVuRGlzcGxheWVkJyk7XG5cbiAgICBpZiAoc2hvd09uUmlnaHRTaWRlICYmIGVuYWJsZURvY2spIHtcbiAgICAgIC8vIGlmIHNob3cgb24gcmlnaHQgc2lkZSAmJiB1c2UgbmV3IGludGVncmF0aW9uXG4gICAgICBjb25zdCBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0UmlnaHREb2NrKCkucGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKCk7XG5cbiAgICAgIHRoaXMucGFuZWwgPSBhY3RpdmVQYW5lLmFkZEl0ZW0odGhpcyk7XG4gICAgICBhY3RpdmVQYW5lLmFjdGl2YXRlSXRlbWZvclVSSSh0aGlzLmdldFRpdGxlKCkpO1xuICAgIH0gZWxzZSBpZiAoIXNob3dPblJpZ2h0U2lkZSAmJiBlbmFibGVEb2NrKSB7XG4gICAgICAvLyBpZiBub3Qgc2hvdyBvbiByaWdodCBzaWRlICYmIHVzZSBuZXcgaW50ZWdyYXRpb25cbiAgICAgIGNvbnN0IGFjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRMZWZ0RG9jaygpLnBhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpO1xuXG4gICAgICB0aGlzLnBhbmVsID0gYWN0aXZlUGFuZS5hZGRJdGVtKHRoaXMpO1xuICAgICAgYWN0aXZlUGFuZS5hY3RpdmF0ZUl0ZW0odGhpcy5wYW5lbCk7XG4gICAgfSBlbHNlIGlmIChzaG93T25SaWdodFNpZGUgJiYgIWVuYWJsZURvY2spIHtcbiAgICAgIC8vIGlmIHNob3cgb24gcmlnaHQgc2lkZSAmJiBub3QgdXNlIG5ldyBpbnRlZ3JhdGlvblxuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWwoeyBpdGVtOiB0aGlzIH0pO1xuICAgIH0gZWxzZSBpZiAoIXNob3dPblJpZ2h0U2lkZSAmJiAhZW5hYmxlRG9jaykge1xuICAgICAgLy8gaWYgbm90IHNob3cgb24gcmlnaHQgc2lkZSAmJiBub3QgdXNlIG5ldyBpbnRlZ3JhdGlvblxuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZExlZnRQYW5lbCh7IGl0ZW06IHRoaXMgfSk7XG4gICAgfVxuXG4gICAgaWYgKGhpZGVMb2NhbERpc3BsYXkpIHtcbiAgICAgIGhpZGVMb2NhbFRyZWUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2hvd0xvY2FsVHJlZSgpO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaGVkKCkge1xuICAgIGNvbnN0IGVuYWJsZURvY2sgPSBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAudHJlZS51c2VEb2NrSW50ZWdyYXRpb24nKTtcbiAgICBjb25zdCBhcHBWZXJzaW9uID0gYXRvbS5hcHBWZXJzaW9uLnNwbGl0KCctJylbMF07XG5cbiAgICBpZiAoc2VtdmVyLnNhdGlzZmllcyhhcHBWZXJzaW9uLCAnPDEuMTcuMCcpKSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ29sZHZlcnNpb24nKTtcbiAgICB9XG5cbiAgICBpZiAoIWVuYWJsZURvY2sgJiYgc2VtdmVyLnNhdGlzZmllcyhhcHBWZXJzaW9uLCAnPj0xLjE3LjAnKSkge1xuICAgICAgdGhpcy50YWJQYW5lbC5hZGRDbGFzcygnc2hvdycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRhYlBhbmVsLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5hdHRyKCdkYXRhLXVzZS1kb2NrLWludGVncmF0aW9uJywgZW5hYmxlRG9jayk7XG4gIH1cblxuICBkZXRhY2goLi4uYXJncykge1xuICAgIHN1cGVyLmRldGFjaCguLi5hcmdzKTtcblxuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucGFuZWwuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcy5wYW5lbCkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcy5wYW5lbCkuZGVzdHJveUl0ZW0odGhpcy5wYW5lbCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wYW5lbCAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5wYW5lbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICB9XG4gIH1cblxuICBzaG93T2ZmbGluZSgpIHtcbiAgICB0aGlzLmxpc3QuaGlkZSgpO1xuICAgIHRoaXMucXVldWUuaGlkZSgpO1xuICAgIHRoaXMub2ZmbGluZS5jc3MoJ2Rpc3BsYXknLCAnZmxleCcpO1xuICB9XG5cbiAgc2hvd09ubGluZSgpIHtcbiAgICB0aGlzLmxpc3Quc2hvdygpO1xuICAgIHRoaXMucXVldWUuc2hvdygpO1xuICAgIHRoaXMub2ZmbGluZS5oaWRlKCk7XG4gIH1cblxuICByZXNpemVWZXJ0aWNhbFN0YXJ0ZWQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGNvbnN0ICRkb2MgPSAkKGRvY3VtZW50KTtcblxuICAgIHRoaXMucmVzaXplSGVpZ2h0U3RhcnQgPSB0aGlzLnF1ZXVlLmhlaWdodCgpO1xuICAgIHRoaXMucmVzaXplTW91c2VTdGFydCA9IGUucGFnZVk7XG5cbiAgICAkZG9jLm9uKCdtb3VzZW1vdmUnLCB0aGlzLnJlc2l6ZVZlcnRpY2FsVmlldy5iaW5kKHRoaXMpKTtcbiAgICAkZG9jLm9uKCdtb3VzZXVwJywgdGhpcy5yZXNpemVWZXJ0aWNhbFN0b3BwZWQpO1xuICB9XG5cbiAgcmVzaXplVmVydGljYWxTdG9wcGVkKCkge1xuICAgIGRlbGV0ZSB0aGlzLnJlc2l6ZUhlaWdodFN0YXJ0O1xuICAgIGRlbGV0ZSB0aGlzLnJlc2l6ZU1vdXNlU3RhcnQ7XG5cbiAgICBjb25zdCAkZG9jID0gJChkb2N1bWVudCk7XG5cbiAgICAkZG9jLm9mZignbW91c2Vtb3ZlJywgdGhpcy5yZXNpemVWZXJ0aWNhbFZpZXcpO1xuICAgICRkb2Mub2ZmKCdtb3VzZXVwJywgdGhpcy5yZXNpemVWZXJ0aWNhbFN0b3BwZWQpO1xuICB9XG5cbiAgcmVzaXplVmVydGljYWxWaWV3KGUpIHtcbiAgICBpZiAoZS53aGljaCAhPT0gMSkgeyByZXR1cm4gdGhpcy5yZXNpemVWZXJ0aWNhbFN0b3BwZWQoKTsgfVxuXG4gICAgY29uc3QgZGVsdGEgPSBlLnBhZ2VZIC0gdGhpcy5yZXNpemVNb3VzZVN0YXJ0O1xuICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWF4KDI2LCB0aGlzLnJlc2l6ZUhlaWdodFN0YXJ0IC0gZGVsdGEpO1xuXG4gICAgdGhpcy5xdWV1ZS5oZWlnaHQoaGVpZ2h0KTtcbiAgICB0aGlzLnNjcm9sbGVyLmNzcygnYm90dG9tJywgYCR7aGVpZ2h0fXB4YCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJlc2l6ZUhvcml6b250YWxTdGFydGVkKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0aGlzLnJlc2l6ZVdpZHRoU3RhcnQgPSB0aGlzLndpZHRoKCk7XG4gICAgdGhpcy5yZXNpemVNb3VzZVN0YXJ0ID0gZS5wYWdlWDtcblxuICAgIGNvbnN0ICRkb2MgPSAkKGRvY3VtZW50KTtcblxuICAgICRkb2Mub24oJ21vdXNlbW92ZScsIHRoaXMucmVzaXplSG9yaXpvbnRhbFZpZXcuYmluZCh0aGlzKSk7XG4gICAgJGRvYy5vbignbW91c2V1cCcsIHRoaXMucmVzaXplSG9yaXpvbnRhbFN0b3BwZWQpO1xuICB9XG5cbiAgcmVzaXplSG9yaXpvbnRhbFN0b3BwZWQoKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzaXplV2lkdGhTdGFydDtcbiAgICBkZWxldGUgdGhpcy5yZXNpemVNb3VzZVN0YXJ0O1xuXG4gICAgY29uc3QgJGRvYyA9ICQoZG9jdW1lbnQpO1xuXG4gICAgJGRvYy5vZmYoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplSG9yaXpvbnRhbFZpZXcpO1xuICAgICRkb2Mub2ZmKCdtb3VzZXVwJywgdGhpcy5yZXNpemVIb3Jpem9udGFsU3RvcHBlZCk7XG4gIH1cblxuICByZXNpemVIb3Jpem9udGFsVmlldyhlKSB7XG4gICAgaWYgKGUud2hpY2ggIT09IDEpIHsgcmV0dXJuIHRoaXMucmVzaXplSG9yaXpvbnRhbFN0b3BwZWQoKTsgfVxuXG4gICAgY29uc3QgZGVsdGEgPSBlLnBhZ2VYIC0gdGhpcy5yZXNpemVNb3VzZVN0YXJ0O1xuICAgIGNvbnN0IHdpZHRoID0gTWF0aC5tYXgoNTAsIHRoaXMucmVzaXplV2lkdGhTdGFydCArIGRlbHRhKTtcblxuICAgIHRoaXMud2lkdGgod2lkdGgpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXNpemVUb0ZpdENvbnRlbnQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRoaXMud2lkdGgoMSk7XG4gICAgdGhpcy53aWR0aCh0aGlzLmxpc3Qub3V0ZXJXaWR0aCgpKTtcbiAgfVxuXG4gIHJlbW90ZUtleWJvYXJkTmF2aWdhdGlvbihlKSB7XG4gICAgY29uc3QgYXJyb3dzID0geyBsZWZ0OiAzNywgdXA6IDM4LCByaWdodDogMzksIGRvd246IDQwIH07XG4gICAgY29uc3Qga2V5Q29kZSA9IGUua2V5Q29kZSB8fCBlLndoaWNoO1xuXG4gICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICBjYXNlIGFycm93cy51cDpcbiAgICAgICAgdGhpcy5yZW1vdGVLZXlib2FyZE5hdmlnYXRpb25VcCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgYXJyb3dzLmRvd246XG4gICAgICAgIHRoaXMucmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uRG93bigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgYXJyb3dzLmxlZnQ6XG4gICAgICAgIHRoaXMucmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uTGVmdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgYXJyb3dzLnJpZ2h0OlxuICAgICAgICB0aGlzLnJlbW90ZUtleWJvYXJkTmF2aWdhdGlvblJpZ2h0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdGhpcy5yZW1vdGVLZXlib2FyZE5hdmlnYXRpb25Nb3ZlUGFnZSgpO1xuICB9XG5cbiAgcmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uVXAoKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHRoaXMubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGxldCBuZXh0ID0gY3VycmVudC5wcmV2KCcuZW50cnk6dmlzaWJsZScpO1xuXG4gICAgaWYgKG5leHQubGVuZ3RoKSB7XG4gICAgICB3aGlsZSAobmV4dC5pcygnLmV4cGFuZGVkJykgJiYgbmV4dC5maW5kKCcuZW50cmllcyAuZW50cnk6dmlzaWJsZScpLmxlbmd0aCkge1xuICAgICAgICBuZXh0ID0gbmV4dC5maW5kKCcuZW50cmllcyAuZW50cnk6dmlzaWJsZScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0ID0gY3VycmVudC5jbG9zZXN0KCcuZW50cmllcycpLmNsb3Nlc3QoJy5lbnRyeTp2aXNpYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKG5leHQubGVuZ3RoKSB7XG4gICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgbmV4dC5sYXN0KCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uRG93bigpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgbGV0IG5leHQgPSBjdXJyZW50LmZpbmQoJy5lbnRyaWVzIC5lbnRyeTp2aXNpYmxlJyk7XG4gICAgbGV0IHRtcCA9IG51bGw7XG5cbiAgICBpZiAoIW5leHQubGVuZ3RoKSB7XG4gICAgICB0bXAgPSBjdXJyZW50O1xuXG4gICAgICBkbyB7XG4gICAgICAgIG5leHQgPSB0bXAubmV4dCgnLmVudHJ5OnZpc2libGUnKTtcblxuICAgICAgICBpZiAoIW5leHQubGVuZ3RoKSB7XG4gICAgICAgICAgdG1wID0gdG1wLmNsb3Nlc3QoJy5lbnRyaWVzJykuY2xvc2VzdCgnLmVudHJ5OnZpc2libGUnKTtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoIW5leHQubGVuZ3RoICYmICF0bXAuaXMoJy5wcm9qZWN0LXJvb3QnKSk7XG4gICAgfVxuICAgIGlmIChuZXh0Lmxlbmd0aCkge1xuICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIG5leHQuZmlyc3QoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9XG4gIH1cblxuICByZW1vdGVLZXlib2FyZE5hdmlnYXRpb25MZWZ0KCkge1xuICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLmxpc3QuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICBsZXQgbmV4dCA9IG51bGw7XG5cbiAgICBpZiAoIWN1cnJlbnQuaXMoJy5kaXJlY3RvcnknKSkge1xuICAgICAgbmV4dCA9IGN1cnJlbnQuY2xvc2VzdCgnLmRpcmVjdG9yeScpO1xuICAgICAgbmV4dC52aWV3KCkuY29sbGFwc2UoKTtcblxuICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIG5leHQuZmlyc3QoKS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudC52aWV3KCkuY29sbGFwc2UoKTtcbiAgICB9XG4gIH1cblxuICByZW1vdGVLZXlib2FyZE5hdmlnYXRpb25SaWdodCgpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5saXN0LmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgaWYgKGN1cnJlbnQuaXMoJy5kaXJlY3RvcnknKSkge1xuICAgICAgY29uc3QgdmlldyA9IGN1cnJlbnQudmlldygpO1xuXG4gICAgICB2aWV3Lm9wZW4oKTtcbiAgICAgIHZpZXcuZXhwYW5kKCk7XG4gICAgfVxuICB9XG5cbiAgcmVtb3RlS2V5Ym9hcmROYXZpZ2F0aW9uTW92ZVBhZ2UoKSB7XG4gICAgY29uc3QgY3VycmVudCA9IHRoaXMubGlzdC5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgIGlmIChjdXJyZW50Lmxlbmd0aCkge1xuICAgICAgY29uc3Qgc2Nyb2xsZXJUb3AgPSB0aGlzLnNjcm9sbGVyLnNjcm9sbFRvcCgpO1xuICAgICAgY29uc3Qgc2VsZWN0ZWRUb3AgPSBjdXJyZW50LnBvc2l0aW9uKCkudG9wO1xuXG4gICAgICBpZiAoc2VsZWN0ZWRUb3AgPCBzY3JvbGxlclRvcCAtIDEwKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsZXIucGFnZVVwKCk7XG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkVG9wID4gc2Nyb2xsZXJUb3AgKyAodGhpcy5zY3JvbGxlci5oZWlnaHQoKSAtIDEwKSkge1xuICAgICAgICB0aGlzLnNjcm9sbGVyLnBhZ2VEb3duKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyZWVWaWV3O1xuIl19