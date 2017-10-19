Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomSpacePenViews = require('atom-space-pen-views');

var _helpers = require('../helpers');

var _fileView = require('./file-view');

var _fileView2 = _interopRequireDefault(_fileView);

'use babel';

var DirectoryView = (function (_View) {
  _inherits(DirectoryView, _View);

  function DirectoryView() {
    _classCallCheck(this, DirectoryView);

    _get(Object.getPrototypeOf(DirectoryView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DirectoryView, [{
    key: 'initialize',
    value: function initialize(directory) {
      // super.initialize(directory);

      this.item = directory;
      this.name.text(this.item.name);
      this.name.attr('data-name', this.item.name);
      this.name.attr('data-path', this.item.remote);

      var addIconToElement = (0, _helpers.getIconHandler)();
      if (addIconToElement) {
        var element = this.name[0] || this.name;
        var pathIco = this.item && this.item.local;
        this.iconDisposable = addIconToElement(element, pathIco, { isDirectory: true });
      } else {
        this.name.addClass(this.item.type && this.item.type === 'l' ? 'icon-file-symlink-directory' : 'icon-file-directory');
      }

      if (this.item.isExpanded || this.item.isRoot) {
        this.expand();
      }

      if (this.item.isRoot) {
        this.addClass('project-root');
        this.header.addClass('project-root-header');
        this.name.addClass('icon-server').removeClass('icon-file-directory');
      }

      // Trigger repaint
      this.triggers();

      this.repaint();

      // Events
      this.events();

      // NOTE: Newer versions will have event handling
      if (atom.config.get('Remote-FTP.tree.enableDragAndDrop')) {
        this.dragEvents();
      }
    }
  }, {
    key: 'triggers',
    value: function triggers() {
      var _this = this;

      this.item.onChangeItems(function () {
        _this.repaint();
      });

      this.item.onChangeExpanded(function () {
        _this.setClasses();
      });

      this.item.onDestroyed(function () {
        _this.destroy();
      });
    }
  }, {
    key: 'events',
    value: function events() {
      this.on('mousedown', function (e) {
        var self = e.currentTarget;
        e.stopPropagation();

        var view = (0, _atomSpacePenViews.$)(self).view();
        var button = e.originalEvent ? e.originalEvent.button : 0;
        var selectKey = process.platform === 'darwin' ? 'metaKey' : 'ctrlKey'; // on mac the select key for multiple files is the meta key
        var $selected = (0, _atomSpacePenViews.$)('.remote-ftp-view .selected');

        if (!view) return;

        if ((button === 0 || button === 2) && !(button === 2 && $selected.length > 1)) {
          if (!e[selectKey]) {
            $selected.removeClass('selected');
            (0, _atomSpacePenViews.$)('.remote-ftp-view .entries.list-tree').removeClass('multi-select');
          } else {
            (0, _atomSpacePenViews.$)('.remote-ftp-view .entries.list-tree').addClass('multi-select');
          }
          view.toggleClass('selected');

          if (button === 0 && !e[selectKey]) {
            if (view.item.status === 0) {
              view.open();
              view.toggle();
            }

            view.toggle();
          }
        }
      });

      this.on('dblclick', function (e) {
        var self = e.currentTarget;
        e.stopPropagation();

        var view = (0, _atomSpacePenViews.$)(self).view();

        if (!view) return;

        view.open();
      });
    }
  }, {
    key: 'dragEvents',
    value: function dragEvents() {
      this.on('drop', function (e) {
        var self = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();

        self.classList.remove('selected');

        if (!(0, _helpers.checkTarget)(e)) return;

        var ftp = atom.project['remoteftp-main'];
        var $self = (0, _atomSpacePenViews.$)(self);
        var dataTransfer = e.originalEvent.dataTransfer;
        var pathInfos = JSON.parse(dataTransfer.getData('pathInfos'));
        var newPathInfo = $self.find('span[data-path]').attr('data-path');
        var destPath = _path2['default'].posix.join(newPathInfo, pathInfos.name);

        if (pathInfos.fullPath === destPath) return;

        ftp.client.rename(pathInfos.fullPath, destPath, function (err) {
          if (err) console.error(err);

          // const sourceTree = ftp.treeView.resolve(path.posix.dirname(pathInfos.fullPath));
          // const destTree = ftp.treeView.resolve(path.posix.dirname(destPath));

          // NOTE: Check the hierarchy.
          // if (sourceTree) {
          //   sourceTree.open();
          //   recursiveViewDestroy(sourceTree);
          // }
          //
          // if (destTree) {
          //   destTree.open();
          //   recursiveViewDestroy(destTree);
          // }
        });
      });

      this.on('dragstart', function (e) {
        var target = (0, _atomSpacePenViews.$)(e.target).find('.name');
        var dataTransfer = e.originalEvent.dataTransfer;
        var pathInfos = {
          fullPath: target.data('path'),
          name: target.data('name')
        };

        dataTransfer.setData('pathInfos', JSON.stringify(pathInfos));
        dataTransfer.effectAllowed = 'move';
      });

      this.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
      });

      this.on('dragenter', function (e) {
        var self = e.currentTarget;
        e.stopPropagation();

        if (!(0, _helpers.checkTarget)(e)) return;

        self.classList.add('selected');
      });

      this.on('dragend', function () {
        // this.dragged = null;
      });

      this.on('dragleave', function (e) {
        e.stopPropagation();

        e.currentTarget.classList.remove('selected');
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.item = null;

      if (this.iconDisposable) {
        this.iconDisposable.dispose();
        this.iconDisposable = null;
      }

      this.remove();
    }
  }, {
    key: 'repaint',
    value: function repaint() {
      var _this2 = this;

      var views = this.entries.children().map(function (err, item) {
        return (0, _atomSpacePenViews.$)(item).view();
      }).get();
      var folders = [];
      var files = [];

      this.entries.children().detach();

      if (this.item) {
        this.item.folders.forEach(function (item) {
          for (var a = 0, b = views.length; a < b; ++a) {
            if (views[a] && views[a] instanceof DirectoryView && views[a].item === item) {
              folders.push(views[a]);
              return;
            }
          }
          folders.push(new DirectoryView(item));
        });

        this.item.files.forEach(function (item) {
          for (var a = 0, b = views.length; a < b; ++a) {
            if (views[a] && views[a] instanceof _fileView2['default'] && views[a].item === item) {
              files.push(views[a]);
              return;
            }
          }
          files.push(new _fileView2['default'](item));
        });
      }

      // TODO Destroy left over...
      views = folders.concat(files);

      views.sort(function (a, b) {
        if (a.constructor !== b.constructor) {
          return a instanceof DirectoryView ? -1 : 1;
        }
        if (a.item.name === b.item.name) {
          return 0;
        }

        return a.item.name.toLowerCase().localeCompare(b.item.name.toLowerCase());
      });

      views.forEach(function (view) {
        _this2.entries.append(view);
      });
    }
  }, {
    key: 'setClasses',
    value: function setClasses() {
      if (this.item.isExpanded) {
        this.addClass('expanded').removeClass('collapsed');
      } else {
        this.addClass('collapsed').removeClass('expanded');
      }
    }
  }, {
    key: 'expand',
    value: function expand(recursive) {
      this.item.setIsExpanded = true;

      if (recursive) {
        this.entries.children().each(function (e, item) {
          var view = (0, _atomSpacePenViews.$)(item).view();
          if (view && view instanceof DirectoryView) {
            view.expand(true);
          }
        });
      }
    }
  }, {
    key: 'collapse',
    value: function collapse(recursive) {
      this.item.setIsExpanded = false;

      if (recursive) {
        this.entries.children().each(function (e, item) {
          var view = (0, _atomSpacePenViews.$)(item).view();
          if (view && view instanceof DirectoryView) {
            view.collapse(true);
          }
        });
      }
    }
  }, {
    key: 'toggle',
    value: function toggle(recursive) {
      if (this.item.isExpanded) {
        this.collapse(recursive);
      } else {
        this.expand(recursive);
      }
    }
  }, {
    key: 'open',
    value: function open() {
      this.item.open();
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this.item.open();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      return this.li({
        'class': 'directory entry list-nested-item collapsed',
        is: 'tree-view-directory'
      }, function () {
        _this3.div({
          'class': 'header list-item',
          outlet: 'header',
          is: 'tree-view-directory'
        }, function () {
          return _this3.span({
            'class': 'name icon',
            outlet: 'name'
          });
        });
        _this3.ol({
          'class': 'entries list-tree',
          outlet: 'entries'
        });
      });
    }
  }]);

  return DirectoryView;
})(_atomSpacePenViews.View);

exports['default'] = DirectoryView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi92aWV3cy9kaXJlY3Rvcnktdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7OztpQ0FDQyxzQkFBc0I7O3VCQUNvQixZQUFZOzt3QkFDekQsYUFBYTs7OztBQUxsQyxXQUFXLENBQUM7O0lBT04sYUFBYTtZQUFiLGFBQWE7O1dBQWIsYUFBYTswQkFBYixhQUFhOzsrQkFBYixhQUFhOzs7ZUFBYixhQUFhOztXQXNCUCxvQkFBQyxTQUFTLEVBQUU7OztBQUdwQixVQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztBQUN0QixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUU5QyxVQUFNLGdCQUFnQixHQUFHLDhCQUFnQixDQUFDO0FBQzFDLFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzFDLFlBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDN0MsWUFBSSxDQUFDLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7T0FDakYsTUFBTTtBQUNMLFlBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyw2QkFBNkIsR0FBRyxxQkFBcUIsQ0FBQyxDQUFDO09BQ3RIOztBQUVELFVBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFBRSxZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FBRTs7QUFFaEUsVUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNwQixZQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzlCLFlBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDNUMsWUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7T0FDdEU7OztBQUdELFVBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFaEIsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDOzs7QUFHZixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7OztBQUdkLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsRUFBRTtBQUN4RCxZQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7T0FDbkI7S0FDRjs7O1dBRU8sb0JBQUc7OztBQUNULFVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQU07QUFDNUIsY0FBSyxPQUFPLEVBQUUsQ0FBQztPQUNoQixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFNO0FBQy9CLGNBQUssVUFBVSxFQUFFLENBQUM7T0FDbkIsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQU07QUFDMUIsY0FBSyxPQUFPLEVBQUUsQ0FBQztPQUNoQixDQUFDLENBQUM7S0FDSjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsRUFBSztBQUMxQixZQUFNLElBQUksR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDO0FBQzdCLFNBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFcEIsWUFBTSxJQUFJLEdBQUcsMEJBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDNUIsWUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDNUQsWUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUN4RSxZQUFNLFNBQVMsR0FBRywwQkFBRSw0QkFBNEIsQ0FBQyxDQUFDOztBQUVsRCxZQUFJLENBQUMsSUFBSSxFQUFFLE9BQU87O0FBRWxCLFlBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUEsSUFBSyxFQUFFLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUEsQUFBQyxFQUFFO0FBQzdFLGNBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDakIscUJBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbEMsc0NBQUUscUNBQXFDLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7V0FDdEUsTUFBTTtBQUNMLHNDQUFFLHFDQUFxQyxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1dBQ25FO0FBQ0QsY0FBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFN0IsY0FBSSxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ2pDLGdCQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMxQixrQkFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1osa0JBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNmOztBQUVELGdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7V0FDZjtTQUNGO09BQ0YsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ3pCLFlBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDN0IsU0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUVwQixZQUFNLElBQUksR0FBRywwQkFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFNUIsWUFBSSxDQUFDLElBQUksRUFBRSxPQUFPOztBQUVsQixZQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDYixDQUFDLENBQUM7S0FDSjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLENBQUMsRUFBSztBQUNyQixZQUFNLElBQUksR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDO0FBQzdCLFNBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuQixTQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7O0FBRXBCLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVsQyxZQUFJLENBQUMsMEJBQVksQ0FBQyxDQUFDLEVBQUUsT0FBTzs7QUFFNUIsWUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzNDLFlBQU0sS0FBSyxHQUFHLDBCQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RCLFlBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDO0FBQ2xELFlBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLFlBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDcEUsWUFBTSxRQUFRLEdBQUcsa0JBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU5RCxZQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFLE9BQU87O0FBRTVDLFdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQUMsR0FBRyxFQUFLO0FBQ3ZELGNBQUksR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7OztTQWU3QixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDMUIsWUFBTSxNQUFNLEdBQUcsMEJBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxZQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztBQUNsRCxZQUFNLFNBQVMsR0FBRztBQUNoQixrQkFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzdCLGNBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUMxQixDQUFDOztBQUVGLG9CQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0Qsb0JBQVksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO09BQ3JDLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFDLENBQUMsRUFBSztBQUN6QixTQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsU0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO09BQ3JCLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLENBQUMsRUFBSztBQUMxQixZQUFNLElBQUksR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDO0FBQzdCLFNBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFcEIsWUFBSSxDQUFDLDBCQUFZLENBQUMsQ0FBQyxFQUFFLE9BQU87O0FBRTVCLFlBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ2hDLENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxZQUFNOztPQUV4QixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDMUIsU0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUVwQixTQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDOUMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO09BQzVCOztBQUVELFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFTSxtQkFBRzs7O0FBQ1IsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHLEVBQUUsSUFBSTtlQUFLLDBCQUFFLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtPQUFBLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUM3RSxVQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbkIsVUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVqQixVQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUVqQyxVQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDYixZQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDbEMsZUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM1QyxnQkFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLGFBQWEsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUMzRSxxQkFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixxQkFBTzthQUNSO1dBQ0Y7QUFDRCxpQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3ZDLENBQUMsQ0FBQzs7QUFFSCxZQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDaEMsZUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUM1QyxnQkFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxpQ0FBb0IsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUN0RSxtQkFBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixxQkFBTzthQUNSO1dBQ0Y7QUFDRCxlQUFLLENBQUMsSUFBSSxDQUFDLDBCQUFhLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDaEMsQ0FBQyxDQUFDO09BQ0o7OztBQUdELFdBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU5QixXQUFLLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNuQixZQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRTtBQUFFLGlCQUFPLENBQUMsWUFBWSxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQUU7QUFDcEYsWUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUFFLGlCQUFPLENBQUMsQ0FBQztTQUFFOztBQUU5QyxlQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUM3QixhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztPQUM3QyxDQUFDLENBQUM7O0FBRUgsV0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBSztBQUN0QixlQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDM0IsQ0FBQyxDQUFDO0tBQ0o7OztXQUVTLHNCQUFHO0FBQ1gsVUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUN4QixZQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztPQUNwRCxNQUFNO0FBQ0wsWUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDcEQ7S0FDRjs7O1dBRUssZ0JBQUMsU0FBUyxFQUFFO0FBQ2hCLFVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzs7QUFFL0IsVUFBSSxTQUFTLEVBQUU7QUFDYixZQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxJQUFJLEVBQUs7QUFDeEMsY0FBTSxJQUFJLEdBQUcsMEJBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDNUIsY0FBSSxJQUFJLElBQUksSUFBSSxZQUFZLGFBQWEsRUFBRTtBQUFFLGdCQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQUU7U0FDbEUsQ0FBQyxDQUFDO09BQ0o7S0FDRjs7O1dBRU8sa0JBQUMsU0FBUyxFQUFFO0FBQ2xCLFVBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQzs7QUFFaEMsVUFBSSxTQUFTLEVBQUU7QUFDYixZQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxJQUFJLEVBQUs7QUFDeEMsY0FBTSxJQUFJLEdBQUcsMEJBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDNUIsY0FBSSxJQUFJLElBQUksSUFBSSxZQUFZLGFBQWEsRUFBRTtBQUFFLGdCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQUU7U0FDcEUsQ0FBQyxDQUFDO09BQ0o7S0FDRjs7O1dBRUssZ0JBQUMsU0FBUyxFQUFFO0FBQ2hCLFVBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDeEIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUMxQixNQUFNO0FBQ0wsWUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUN4QjtLQUNGOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDbEI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNsQjs7O1dBcFNhLG1CQUFHOzs7QUFDZixhQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDYixpQkFBTyw0Q0FBNEM7QUFDbkQsVUFBRSxFQUFFLHFCQUFxQjtPQUMxQixFQUFFLFlBQU07QUFDUCxlQUFLLEdBQUcsQ0FBQztBQUNQLG1CQUFPLGtCQUFrQjtBQUN6QixnQkFBTSxFQUFFLFFBQVE7QUFDaEIsWUFBRSxFQUFFLHFCQUFxQjtTQUMxQixFQUFFO2lCQUFNLE9BQUssSUFBSSxDQUFDO0FBQ2pCLHFCQUFPLFdBQVc7QUFDbEIsa0JBQU0sRUFBRSxNQUFNO1dBQ2YsQ0FBQztTQUFBLENBQUMsQ0FBQztBQUNKLGVBQUssRUFBRSxDQUFDO0FBQ04sbUJBQU8sbUJBQW1CO0FBQzFCLGdCQUFNLEVBQUUsU0FBUztTQUNsQixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBcEJHLGFBQWE7OztxQkF5U0osYUFBYSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvdmlld3MvZGlyZWN0b3J5LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyAkLCBWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgZ2V0SWNvbkhhbmRsZXIsIGNoZWNrVGFyZ2V0LCByZWN1cnNpdmVWaWV3RGVzdHJveSB9IGZyb20gJy4uL2hlbHBlcnMnO1xuaW1wb3J0IEZpbGVWaWV3IGZyb20gJy4vZmlsZS12aWV3JztcblxuY2xhc3MgRGlyZWN0b3J5VmlldyBleHRlbmRzIFZpZXcge1xuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLmxpKHtcbiAgICAgIGNsYXNzOiAnZGlyZWN0b3J5IGVudHJ5IGxpc3QtbmVzdGVkLWl0ZW0gY29sbGFwc2VkJyxcbiAgICAgIGlzOiAndHJlZS12aWV3LWRpcmVjdG9yeScsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5kaXYoe1xuICAgICAgICBjbGFzczogJ2hlYWRlciBsaXN0LWl0ZW0nLFxuICAgICAgICBvdXRsZXQ6ICdoZWFkZXInLFxuICAgICAgICBpczogJ3RyZWUtdmlldy1kaXJlY3RvcnknLFxuICAgICAgfSwgKCkgPT4gdGhpcy5zcGFuKHtcbiAgICAgICAgY2xhc3M6ICduYW1lIGljb24nLFxuICAgICAgICBvdXRsZXQ6ICduYW1lJyxcbiAgICAgIH0pKTtcbiAgICAgIHRoaXMub2woe1xuICAgICAgICBjbGFzczogJ2VudHJpZXMgbGlzdC10cmVlJyxcbiAgICAgICAgb3V0bGV0OiAnZW50cmllcycsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemUoZGlyZWN0b3J5KSB7XG4gICAgLy8gc3VwZXIuaW5pdGlhbGl6ZShkaXJlY3RvcnkpO1xuXG4gICAgdGhpcy5pdGVtID0gZGlyZWN0b3J5O1xuICAgIHRoaXMubmFtZS50ZXh0KHRoaXMuaXRlbS5uYW1lKTtcbiAgICB0aGlzLm5hbWUuYXR0cignZGF0YS1uYW1lJywgdGhpcy5pdGVtLm5hbWUpO1xuICAgIHRoaXMubmFtZS5hdHRyKCdkYXRhLXBhdGgnLCB0aGlzLml0ZW0ucmVtb3RlKTtcblxuICAgIGNvbnN0IGFkZEljb25Ub0VsZW1lbnQgPSBnZXRJY29uSGFuZGxlcigpO1xuICAgIGlmIChhZGRJY29uVG9FbGVtZW50KSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5uYW1lWzBdIHx8IHRoaXMubmFtZTtcbiAgICAgIGNvbnN0IHBhdGhJY28gPSB0aGlzLml0ZW0gJiYgdGhpcy5pdGVtLmxvY2FsO1xuICAgICAgdGhpcy5pY29uRGlzcG9zYWJsZSA9IGFkZEljb25Ub0VsZW1lbnQoZWxlbWVudCwgcGF0aEljbywgeyBpc0RpcmVjdG9yeTogdHJ1ZSB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uYW1lLmFkZENsYXNzKHRoaXMuaXRlbS50eXBlICYmIHRoaXMuaXRlbS50eXBlID09PSAnbCcgPyAnaWNvbi1maWxlLXN5bWxpbmstZGlyZWN0b3J5JyA6ICdpY29uLWZpbGUtZGlyZWN0b3J5Jyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXRlbS5pc0V4cGFuZGVkIHx8IHRoaXMuaXRlbS5pc1Jvb3QpIHsgdGhpcy5leHBhbmQoKTsgfVxuXG4gICAgaWYgKHRoaXMuaXRlbS5pc1Jvb3QpIHtcbiAgICAgIHRoaXMuYWRkQ2xhc3MoJ3Byb2plY3Qtcm9vdCcpO1xuICAgICAgdGhpcy5oZWFkZXIuYWRkQ2xhc3MoJ3Byb2plY3Qtcm9vdC1oZWFkZXInKTtcbiAgICAgIHRoaXMubmFtZS5hZGRDbGFzcygnaWNvbi1zZXJ2ZXInKS5yZW1vdmVDbGFzcygnaWNvbi1maWxlLWRpcmVjdG9yeScpO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXIgcmVwYWludFxuICAgIHRoaXMudHJpZ2dlcnMoKTtcblxuICAgIHRoaXMucmVwYWludCgpO1xuXG4gICAgLy8gRXZlbnRzXG4gICAgdGhpcy5ldmVudHMoKTtcblxuICAgIC8vIE5PVEU6IE5ld2VyIHZlcnNpb25zIHdpbGwgaGF2ZSBldmVudCBoYW5kbGluZ1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAudHJlZS5lbmFibGVEcmFnQW5kRHJvcCcpKSB7XG4gICAgICB0aGlzLmRyYWdFdmVudHMoKTtcbiAgICB9XG4gIH1cblxuICB0cmlnZ2VycygpIHtcbiAgICB0aGlzLml0ZW0ub25DaGFuZ2VJdGVtcygoKSA9PiB7XG4gICAgICB0aGlzLnJlcGFpbnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuaXRlbS5vbkNoYW5nZUV4cGFuZGVkKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0Q2xhc3NlcygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pdGVtLm9uRGVzdHJveWVkKCgpID0+IHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZXZlbnRzKCkge1xuICAgIHRoaXMub24oJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICBjb25zdCBzZWxmID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgY29uc3QgdmlldyA9ICQoc2VsZikudmlldygpO1xuICAgICAgY29uc3QgYnV0dG9uID0gZS5vcmlnaW5hbEV2ZW50ID8gZS5vcmlnaW5hbEV2ZW50LmJ1dHRvbiA6IDA7XG4gICAgICBjb25zdCBzZWxlY3RLZXkgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJyA/ICdtZXRhS2V5JyA6ICdjdHJsS2V5JzsgLy8gb24gbWFjIHRoZSBzZWxlY3Qga2V5IGZvciBtdWx0aXBsZSBmaWxlcyBpcyB0aGUgbWV0YSBrZXlcbiAgICAgIGNvbnN0ICRzZWxlY3RlZCA9ICQoJy5yZW1vdGUtZnRwLXZpZXcgLnNlbGVjdGVkJyk7XG5cbiAgICAgIGlmICghdmlldykgcmV0dXJuO1xuXG4gICAgICBpZiAoKGJ1dHRvbiA9PT0gMCB8fCBidXR0b24gPT09IDIpICYmICEoYnV0dG9uID09PSAyICYmICRzZWxlY3RlZC5sZW5ndGggPiAxKSkge1xuICAgICAgICBpZiAoIWVbc2VsZWN0S2V5XSkge1xuICAgICAgICAgICRzZWxlY3RlZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAkKCcucmVtb3RlLWZ0cC12aWV3IC5lbnRyaWVzLmxpc3QtdHJlZScpLnJlbW92ZUNsYXNzKCdtdWx0aS1zZWxlY3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkKCcucmVtb3RlLWZ0cC12aWV3IC5lbnRyaWVzLmxpc3QtdHJlZScpLmFkZENsYXNzKCdtdWx0aS1zZWxlY3QnKTtcbiAgICAgICAgfVxuICAgICAgICB2aWV3LnRvZ2dsZUNsYXNzKCdzZWxlY3RlZCcpO1xuXG4gICAgICAgIGlmIChidXR0b24gPT09IDAgJiYgIWVbc2VsZWN0S2V5XSkge1xuICAgICAgICAgIGlmICh2aWV3Lml0ZW0uc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgICB2aWV3Lm9wZW4oKTtcbiAgICAgICAgICAgIHZpZXcudG9nZ2xlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmlldy50b2dnbGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZGJsY2xpY2snLCAoZSkgPT4ge1xuICAgICAgY29uc3Qgc2VsZiA9IGUuY3VycmVudFRhcmdldDtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGNvbnN0IHZpZXcgPSAkKHNlbGYpLnZpZXcoKTtcblxuICAgICAgaWYgKCF2aWV3KSByZXR1cm47XG5cbiAgICAgIHZpZXcub3BlbigpO1xuICAgIH0pO1xuICB9XG5cbiAgZHJhZ0V2ZW50cygpIHtcbiAgICB0aGlzLm9uKCdkcm9wJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHNlbGYgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBzZWxmLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XG5cbiAgICAgIGlmICghY2hlY2tUYXJnZXQoZSkpIHJldHVybjtcblxuICAgICAgY29uc3QgZnRwID0gYXRvbS5wcm9qZWN0WydyZW1vdGVmdHAtbWFpbiddO1xuICAgICAgY29uc3QgJHNlbGYgPSAkKHNlbGYpO1xuICAgICAgY29uc3QgZGF0YVRyYW5zZmVyID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2ZlcjtcbiAgICAgIGNvbnN0IHBhdGhJbmZvcyA9IEpTT04ucGFyc2UoZGF0YVRyYW5zZmVyLmdldERhdGEoJ3BhdGhJbmZvcycpKTtcbiAgICAgIGNvbnN0IG5ld1BhdGhJbmZvID0gJHNlbGYuZmluZCgnc3BhbltkYXRhLXBhdGhdJykuYXR0cignZGF0YS1wYXRoJyk7XG4gICAgICBjb25zdCBkZXN0UGF0aCA9IHBhdGgucG9zaXguam9pbihuZXdQYXRoSW5mbywgcGF0aEluZm9zLm5hbWUpO1xuXG4gICAgICBpZiAocGF0aEluZm9zLmZ1bGxQYXRoID09PSBkZXN0UGF0aCkgcmV0dXJuO1xuXG4gICAgICBmdHAuY2xpZW50LnJlbmFtZShwYXRoSW5mb3MuZnVsbFBhdGgsIGRlc3RQYXRoLCAoZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIGNvbnNvbGUuZXJyb3IoZXJyKTtcblxuICAgICAgICAvLyBjb25zdCBzb3VyY2VUcmVlID0gZnRwLnRyZWVWaWV3LnJlc29sdmUocGF0aC5wb3NpeC5kaXJuYW1lKHBhdGhJbmZvcy5mdWxsUGF0aCkpO1xuICAgICAgICAvLyBjb25zdCBkZXN0VHJlZSA9IGZ0cC50cmVlVmlldy5yZXNvbHZlKHBhdGgucG9zaXguZGlybmFtZShkZXN0UGF0aCkpO1xuXG4gICAgICAgIC8vIE5PVEU6IENoZWNrIHRoZSBoaWVyYXJjaHkuXG4gICAgICAgIC8vIGlmIChzb3VyY2VUcmVlKSB7XG4gICAgICAgIC8vICAgc291cmNlVHJlZS5vcGVuKCk7XG4gICAgICAgIC8vICAgcmVjdXJzaXZlVmlld0Rlc3Ryb3koc291cmNlVHJlZSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gaWYgKGRlc3RUcmVlKSB7XG4gICAgICAgIC8vICAgZGVzdFRyZWUub3BlbigpO1xuICAgICAgICAvLyAgIHJlY3Vyc2l2ZVZpZXdEZXN0cm95KGRlc3RUcmVlKTtcbiAgICAgICAgLy8gfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnc3RhcnQnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gJChlLnRhcmdldCkuZmluZCgnLm5hbWUnKTtcbiAgICAgIGNvbnN0IGRhdGFUcmFuc2ZlciA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXI7XG4gICAgICBjb25zdCBwYXRoSW5mb3MgPSB7XG4gICAgICAgIGZ1bGxQYXRoOiB0YXJnZXQuZGF0YSgncGF0aCcpLFxuICAgICAgICBuYW1lOiB0YXJnZXQuZGF0YSgnbmFtZScpLFxuICAgICAgfTtcblxuICAgICAgZGF0YVRyYW5zZmVyLnNldERhdGEoJ3BhdGhJbmZvcycsIEpTT04uc3RyaW5naWZ5KHBhdGhJbmZvcykpO1xuICAgICAgZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdkcmFnb3ZlcicsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZ2VudGVyJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IHNlbGYgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBpZiAoIWNoZWNrVGFyZ2V0KGUpKSByZXR1cm47XG5cbiAgICAgIHNlbGYuY2xhc3NMaXN0LmFkZCgnc2VsZWN0ZWQnKTtcbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2RyYWdlbmQnLCAoKSA9PiB7XG4gICAgICAvLyB0aGlzLmRyYWdnZWQgPSBudWxsO1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignZHJhZ2xlYXZlJywgKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLml0ZW0gPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuaWNvbkRpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuaWNvbkRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5pY29uRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfVxuXG4gIHJlcGFpbnQoKSB7XG4gICAgbGV0IHZpZXdzID0gdGhpcy5lbnRyaWVzLmNoaWxkcmVuKCkubWFwKChlcnIsIGl0ZW0pID0+ICQoaXRlbSkudmlldygpKS5nZXQoKTtcbiAgICBjb25zdCBmb2xkZXJzID0gW107XG4gICAgY29uc3QgZmlsZXMgPSBbXTtcblxuICAgIHRoaXMuZW50cmllcy5jaGlsZHJlbigpLmRldGFjaCgpO1xuXG4gICAgaWYgKHRoaXMuaXRlbSkge1xuICAgICAgdGhpcy5pdGVtLmZvbGRlcnMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBmb3IgKGxldCBhID0gMCwgYiA9IHZpZXdzLmxlbmd0aDsgYSA8IGI7ICsrYSkge1xuICAgICAgICAgIGlmICh2aWV3c1thXSAmJiB2aWV3c1thXSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXcgJiYgdmlld3NbYV0uaXRlbSA9PT0gaXRlbSkge1xuICAgICAgICAgICAgZm9sZGVycy5wdXNoKHZpZXdzW2FdKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9sZGVycy5wdXNoKG5ldyBEaXJlY3RvcnlWaWV3KGl0ZW0pKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLml0ZW0uZmlsZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBmb3IgKGxldCBhID0gMCwgYiA9IHZpZXdzLmxlbmd0aDsgYSA8IGI7ICsrYSkge1xuICAgICAgICAgIGlmICh2aWV3c1thXSAmJiB2aWV3c1thXSBpbnN0YW5jZW9mIEZpbGVWaWV3ICYmIHZpZXdzW2FdLml0ZW0gPT09IGl0ZW0pIHtcbiAgICAgICAgICAgIGZpbGVzLnB1c2godmlld3NbYV0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmaWxlcy5wdXNoKG5ldyBGaWxlVmlldyhpdGVtKSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIERlc3Ryb3kgbGVmdCBvdmVyLi4uXG4gICAgdmlld3MgPSBmb2xkZXJzLmNvbmNhdChmaWxlcyk7XG5cbiAgICB2aWV3cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5jb25zdHJ1Y3RvciAhPT0gYi5jb25zdHJ1Y3RvcikgeyByZXR1cm4gYSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXcgPyAtMSA6IDE7IH1cbiAgICAgIGlmIChhLml0ZW0ubmFtZSA9PT0gYi5pdGVtLm5hbWUpIHsgcmV0dXJuIDA7IH1cblxuICAgICAgcmV0dXJuIGEuaXRlbS5uYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLmxvY2FsZUNvbXBhcmUoYi5pdGVtLm5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgfSk7XG5cbiAgICB2aWV3cy5mb3JFYWNoKCh2aWV3KSA9PiB7XG4gICAgICB0aGlzLmVudHJpZXMuYXBwZW5kKHZpZXcpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0Q2xhc3NlcygpIHtcbiAgICBpZiAodGhpcy5pdGVtLmlzRXhwYW5kZWQpIHtcbiAgICAgIHRoaXMuYWRkQ2xhc3MoJ2V4cGFuZGVkJykucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZENsYXNzKCdjb2xsYXBzZWQnKS5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKTtcbiAgICB9XG4gIH1cblxuICBleHBhbmQocmVjdXJzaXZlKSB7XG4gICAgdGhpcy5pdGVtLnNldElzRXhwYW5kZWQgPSB0cnVlO1xuXG4gICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgdGhpcy5lbnRyaWVzLmNoaWxkcmVuKCkuZWFjaCgoZSwgaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCB2aWV3ID0gJChpdGVtKS52aWV3KCk7XG4gICAgICAgIGlmICh2aWV3ICYmIHZpZXcgaW5zdGFuY2VvZiBEaXJlY3RvcnlWaWV3KSB7IHZpZXcuZXhwYW5kKHRydWUpOyB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb2xsYXBzZShyZWN1cnNpdmUpIHtcbiAgICB0aGlzLml0ZW0uc2V0SXNFeHBhbmRlZCA9IGZhbHNlO1xuXG4gICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgdGhpcy5lbnRyaWVzLmNoaWxkcmVuKCkuZWFjaCgoZSwgaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCB2aWV3ID0gJChpdGVtKS52aWV3KCk7XG4gICAgICAgIGlmICh2aWV3ICYmIHZpZXcgaW5zdGFuY2VvZiBEaXJlY3RvcnlWaWV3KSB7IHZpZXcuY29sbGFwc2UodHJ1ZSk7IH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZShyZWN1cnNpdmUpIHtcbiAgICBpZiAodGhpcy5pdGVtLmlzRXhwYW5kZWQpIHtcbiAgICAgIHRoaXMuY29sbGFwc2UocmVjdXJzaXZlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5leHBhbmQocmVjdXJzaXZlKTtcbiAgICB9XG4gIH1cblxuICBvcGVuKCkge1xuICAgIHRoaXMuaXRlbS5vcGVuKCk7XG4gIH1cblxuICByZWZyZXNoKCkge1xuICAgIHRoaXMuaXRlbS5vcGVuKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGlyZWN0b3J5VmlldztcbiJdfQ==