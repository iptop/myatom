Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _eventKit = require('event-kit');

var _helpers = require('./helpers');

var _file = require('./file');

var _file2 = _interopRequireDefault(_file);

'use babel';

var Directory = (function () {
  function Directory(params) {
    var _this = this;

    _classCallCheck(this, Directory);

    this.emitter = new _eventKit.Emitter();

    this.parent = null;
    this.name = '';
    this.path = '';
    this.client = null;
    this.isExpanded = false;
    this.status = 0;
    this.folders = [];
    this.files = [];
    this.original = null;

    Object.keys(params).forEach(function (n) {
      if (Object.prototype.hasOwnProperty.call(_this, n)) {
        _this[n] = params[n];
      }
    });
  }

  _createClass(Directory, [{
    key: 'destroy',
    value: function destroy() {
      this.folders.forEach(function (folder) {
        folder.destroy();
      });
      this.folders = [];

      this.files.forEach(function (file) {
        file.destroy();
      });
      this.files = [];

      if (!this.isRoot) {
        this.emitter.emit('destroyed');
        this.emitter.dispose();
      }
    }
  }, {
    key: 'sort',
    value: function sort() {
      this.folders.sort(_helpers.simpleSort);
      this.files.sort(_helpers.simpleSort);
    }
  }, {
    key: 'exists',
    value: function exists(name, isdir) {
      if (isdir) {
        for (var a = 0, b = this.folders.length; a < b; ++a) {
          if (this.folders[a].name === name) {
            return a;
          }
        }
      } else {
        for (var a = 0, b = this.files.length; a < b; ++a) {
          if (this.files[a].name === name) {
            return a;
          }
        }
      }

      return null;
    }
  }, {
    key: 'open',
    value: function open(recursive, complete) {
      var _this2 = this;

      var client = this.root.client;

      client.list(this.remote, false, function (err, list) {
        if (err) {
          atom.notifications.addError('Remote FTP: ' + err, {
            dismissable: false
          });
          return;
        }

        _this2.status = 1;

        var folders = [];
        var files = [];

        list.forEach(function (item) {
          var name = _path2['default'].basename(item.name);
          var index = undefined;
          var entry = undefined;

          if (item.type === 'd' || item.type === 'l') {
            if (name === '.' || name === '..') {
              return;
            }

            index = _this2.exists(name, true);

            if (index === null) {
              entry = new Directory({
                parent: _this2,
                original: item,
                name: name
              });
            } else {
              entry = _this2.folders[index];
              _this2.folders.splice(index, 1);
            }

            folders.push(entry);

            _this2.emitter.emit('did-change-folder', folders);
          } else {
            index = _this2.exists(name, true);

            if (index === null) {
              entry = new _file2['default']({
                parent: _this2,
                original: item,
                name: name
              });
            } else {
              entry = _this2.files[index];
              _this2.files.splice(index, 1);
            }

            entry.size = item.size;
            entry.date = item.date;

            files.push(entry);

            _this2.emitter.emit('did-change-file', files);
          }
        });

        _this2.folders.forEach(function (folder) {
          folder.destroy();
        });
        _this2.folders = folders;

        _this2.files.forEach(function (file) {
          file.destroy();
        });
        _this2.files = files;

        if (recursive) {
          _this2.folders.forEach(function (folder) {
            if (folder.status === 0) {
              return;
            }

            folder.open(true);
          });
        }

        if (typeof complete === 'function') {
          complete.call(null);
        }

        _this2.emitter.emit('did-change-items', _this2);
      });
    }
  }, {
    key: 'openPath',
    value: function openPath(opath) {
      var _this3 = this;

      var remainingPath = opath.replace(this.remote, '');

      if (remainingPath.startsWith('/')) {
        remainingPath = remainingPath.substr(1);
      }

      if (remainingPath.length > 0) {
        var remainingPathSplit = remainingPath.split('/');

        if (remainingPathSplit.length > 0 && this.folders.length > 0) {
          (function () {
            var nextPath = _this3.remote;

            if (!nextPath.endsWith('/')) {
              nextPath += '/';
            }

            nextPath += remainingPathSplit[0];

            _this3.folders.forEach(function (folder) {
              if (folder.remote === nextPath) {
                folder.isExpanded = true;

                if (folder.folders.length > 0) {
                  folder.openPath(opath);
                } else {
                  folder.open(false, function () {
                    folder.openPath(opath);
                  });
                }
              }
            });
          })();
        }
      }
    }
  }, {
    key: 'onChangeFolder',
    value: function onChangeFolder(callback) {
      return this.emitter.on('did-change-folder', callback);
    }
  }, {
    key: 'onChangeFile',
    value: function onChangeFile(callback) {
      return this.emitter.on('did-change-file', callback);
    }
  }, {
    key: 'onChangeItems',
    value: function onChangeItems(callback) {
      return this.emitter.on('did-change-items', callback);
    }
  }, {
    key: 'onChangeExpanded',
    value: function onChangeExpanded(callback) {
      return this.emitter.on('did-change-expanded', callback);
    }
  }, {
    key: 'onDestroyed',
    value: function onDestroyed(callback) {
      return this.emitter.on('destroyed', callback);
    }
  }, {
    key: 'isRoot',
    get: function get() {
      return this.parent === null;
    }
  }, {
    key: 'root',
    get: function get() {
      if (this.parent) {
        return this.parent.root;
      }

      return this;
    }
  }, {
    key: 'local',
    get: function get() {
      if (this.parent) {
        return _path2['default'].normalize(_path2['default'].join(this.parent.local, this.name)).replace(/\\/g, '/');
      }

      return (0, _helpers.multipleHostsEnabled)() === true ? this.client.projectPath : atom.project.getPaths()[0];
    }
  }, {
    key: 'remote',
    get: function get() {
      if (this.parent) {
        return _path2['default'].normalize(_path2['default'].join(this.parent.remote, this.name)).replace(/\\/g, '/');
      }

      return this.path;
    }
  }, {
    key: 'setIsExpanded',
    set: function set(value) {
      this.emitter.emit('did-change-expanded', value);
      this.isExpanded = value;
    }
  }]);

  return Directory;
})();

exports['default'] = Directory;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9kaXJlY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7Ozt3QkFDQyxXQUFXOzt1QkFDYyxXQUFXOztvQkFDM0MsUUFBUTs7OztBQUx6QixXQUFXLENBQUM7O0lBT04sU0FBUztBQUVGLFdBRlAsU0FBUyxDQUVELE1BQU0sRUFBRTs7OzBCQUZoQixTQUFTOztBQUdYLFFBQUksQ0FBQyxPQUFPLEdBQUcsdUJBQWEsQ0FBQzs7QUFFN0IsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVyQixVQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNqQyxVQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksUUFBTyxDQUFDLENBQUMsRUFBRTtBQUNqRCxjQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNyQjtLQUNGLENBQUMsQ0FBQztHQUNKOztlQXBCRyxTQUFTOztXQXNCTixtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQy9CLGNBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNsQixDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDM0IsWUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ2hCLENBQUMsQ0FBQztBQUNILFVBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVoQixVQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvQixZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0tBQ0Y7OztXQUVHLGdCQUFHO0FBQ0wsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHFCQUFZLENBQUM7QUFDOUIsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLHFCQUFZLENBQUM7S0FDN0I7OztXQUVLLGdCQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDbEIsVUFBSSxLQUFLLEVBQUU7QUFDVCxhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtBQUNuRCxjQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUFFLG1CQUFPLENBQUMsQ0FBQztXQUFFO1NBQ2pEO09BQ0YsTUFBTTtBQUNMLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELGNBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFO0FBQUUsbUJBQU8sQ0FBQyxDQUFDO1dBQUU7U0FDL0M7T0FDRjs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFRyxjQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUU7OztBQUN4QixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFaEMsWUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUs7QUFDN0MsWUFBSSxHQUFHLEVBQUU7QUFDUCxjQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsa0JBQWdCLEdBQUcsRUFBSTtBQUNoRCx1QkFBVyxFQUFFLEtBQUs7V0FDbkIsQ0FBQyxDQUFDO0FBQ0gsaUJBQU87U0FDUjs7QUFFRCxlQUFLLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWhCLFlBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixZQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7O0FBRWpCLFlBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDckIsY0FBTSxJQUFJLEdBQUcsa0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxjQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsY0FBSSxLQUFLLFlBQUEsQ0FBQzs7QUFFVixjQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFO0FBQzFDLGdCQUFJLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtBQUFFLHFCQUFPO2FBQUU7O0FBRTlDLGlCQUFLLEdBQUcsT0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVoQyxnQkFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ2xCLG1CQUFLLEdBQUcsSUFBSSxTQUFTLENBQUM7QUFDcEIsc0JBQU0sUUFBTTtBQUNaLHdCQUFRLEVBQUUsSUFBSTtBQUNkLG9CQUFJLEVBQUosSUFBSTtlQUNMLENBQUMsQ0FBQzthQUNKLE1BQU07QUFDTCxtQkFBSyxHQUFHLE9BQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVCLHFCQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQy9COztBQUVELG1CQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVwQixtQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1dBQ2pELE1BQU07QUFDTCxpQkFBSyxHQUFHLE9BQUssTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFaEMsZ0JBQUksS0FBSyxLQUFLLElBQUksRUFBRTtBQUNsQixtQkFBSyxHQUFHLHNCQUFTO0FBQ2Ysc0JBQU0sUUFBTTtBQUNaLHdCQUFRLEVBQUUsSUFBSTtBQUNkLG9CQUFJLEVBQUosSUFBSTtlQUNMLENBQUMsQ0FBQzthQUNKLE1BQU07QUFDTCxtQkFBSyxHQUFHLE9BQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLHFCQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzdCOztBQUVELGlCQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdkIsaUJBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs7QUFFdkIsaUJBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWxCLG1CQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7V0FDN0M7U0FDRixDQUFDLENBQUM7O0FBRUgsZUFBSyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQUUsZ0JBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUFFLENBQUMsQ0FBQztBQUN4RCxlQUFLLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRXZCLGVBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBSztBQUFFLGNBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUFFLENBQUMsQ0FBQztBQUNsRCxlQUFLLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRW5CLFlBQUksU0FBUyxFQUFFO0FBQ2IsaUJBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUMvQixnQkFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUFFLHFCQUFPO2FBQUU7O0FBRXBDLGtCQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQ25CLENBQUMsQ0FBQztTQUNKOztBQUVELFlBQUksT0FBUSxRQUFRLEFBQUMsS0FBSyxVQUFVLEVBQUU7QUFDcEMsa0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7O0FBRUQsZUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixTQUFPLENBQUM7T0FDN0MsQ0FBQyxDQUFDO0tBQ0o7OztXQUVPLGtCQUFDLEtBQUssRUFBRTs7O0FBQ2QsVUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUVuRCxVQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDakMscUJBQWEsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3pDOztBQUVELFVBQUksYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDNUIsWUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVwRCxZQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOztBQUM1RCxnQkFBSSxRQUFRLEdBQUcsT0FBSyxNQUFNLENBQUM7O0FBRTNCLGdCQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUFFLHNCQUFRLElBQUksR0FBRyxDQUFDO2FBQUU7O0FBRWpELG9CQUFRLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWxDLG1CQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDL0Isa0JBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7QUFDOUIsc0JBQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV6QixvQkFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDN0Isd0JBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3hCLE1BQU07QUFDTCx3QkFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsWUFBTTtBQUN2QiwwQkFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzttQkFDeEIsQ0FBQyxDQUFDO2lCQUNKO2VBQ0Y7YUFDRixDQUFDLENBQUM7O1NBQ0o7T0FDRjtLQUNGOzs7V0FFYSx3QkFBQyxRQUFRLEVBQUU7QUFDdkIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2RDs7O1dBRVcsc0JBQUMsUUFBUSxFQUFFO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDckQ7OztXQUVZLHVCQUFDLFFBQVEsRUFBRTtBQUN0QixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3REOzs7V0FFZSwwQkFBQyxRQUFRLEVBQUU7QUFDekIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN6RDs7O1dBRVUscUJBQUMsUUFBUSxFQUFFO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQy9DOzs7U0FFUyxlQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQztLQUM3Qjs7O1NBRU8sZUFBRztBQUNULFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7T0FDekI7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1NBRVEsZUFBRztBQUNWLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGVBQU8sa0JBQUssU0FBUyxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQ3BGOztBQUVELGFBQU8sb0NBQXNCLEtBQUssSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0Y7OztTQUVTLGVBQUc7QUFDWCxVQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixlQUFPLGtCQUFLLFNBQVMsQ0FBQyxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNyRjs7QUFFRCxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEI7OztTQUVnQixhQUFDLEtBQUssRUFBRTtBQUN2QixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNoRCxVQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztLQUN6Qjs7O1NBcE9HLFNBQVM7OztxQkF1T0EsU0FBUyIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvZGlyZWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgRW1pdHRlciB9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQgeyBtdWx0aXBsZUhvc3RzRW5hYmxlZCwgc2ltcGxlU29ydCB9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgRmlsZSBmcm9tICcuL2ZpbGUnO1xuXG5jbGFzcyBEaXJlY3Rvcnkge1xuXG4gIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgdGhpcy5uYW1lID0gJyc7XG4gICAgdGhpcy5wYXRoID0gJyc7XG4gICAgdGhpcy5jbGllbnQgPSBudWxsO1xuICAgIHRoaXMuaXNFeHBhbmRlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdHVzID0gMDtcbiAgICB0aGlzLmZvbGRlcnMgPSBbXTtcbiAgICB0aGlzLmZpbGVzID0gW107XG4gICAgdGhpcy5vcmlnaW5hbCA9IG51bGw7XG5cbiAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goKG4pID0+IHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgbikpIHtcbiAgICAgICAgdGhpc1tuXSA9IHBhcmFtc1tuXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5mb2xkZXJzLmZvckVhY2goKGZvbGRlcikgPT4ge1xuICAgICAgZm9sZGVyLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgICB0aGlzLmZvbGRlcnMgPSBbXTtcblxuICAgIHRoaXMuZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgZmlsZS5kZXN0cm95KCk7XG4gICAgfSk7XG4gICAgdGhpcy5maWxlcyA9IFtdO1xuXG4gICAgaWYgKCF0aGlzLmlzUm9vdCkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2Rlc3Ryb3llZCcpO1xuICAgICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBzb3J0KCkge1xuICAgIHRoaXMuZm9sZGVycy5zb3J0KHNpbXBsZVNvcnQpO1xuICAgIHRoaXMuZmlsZXMuc29ydChzaW1wbGVTb3J0KTtcbiAgfVxuXG4gIGV4aXN0cyhuYW1lLCBpc2Rpcikge1xuICAgIGlmIChpc2Rpcikge1xuICAgICAgZm9yIChsZXQgYSA9IDAsIGIgPSB0aGlzLmZvbGRlcnMubGVuZ3RoOyBhIDwgYjsgKythKSB7XG4gICAgICAgIGlmICh0aGlzLmZvbGRlcnNbYV0ubmFtZSA9PT0gbmFtZSkgeyByZXR1cm4gYTsgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBhID0gMCwgYiA9IHRoaXMuZmlsZXMubGVuZ3RoOyBhIDwgYjsgKythKSB7XG4gICAgICAgIGlmICh0aGlzLmZpbGVzW2FdLm5hbWUgPT09IG5hbWUpIHsgcmV0dXJuIGE7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIG9wZW4ocmVjdXJzaXZlLCBjb21wbGV0ZSkge1xuICAgIGNvbnN0IGNsaWVudCA9IHRoaXMucm9vdC5jbGllbnQ7XG5cbiAgICBjbGllbnQubGlzdCh0aGlzLnJlbW90ZSwgZmFsc2UsIChlcnIsIGxpc3QpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW1vdGUgRlRQOiAke2Vycn1gLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YXR1cyA9IDE7XG5cbiAgICAgIGNvbnN0IGZvbGRlcnMgPSBbXTtcbiAgICAgIGNvbnN0IGZpbGVzID0gW107XG5cbiAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gcGF0aC5iYXNlbmFtZShpdGVtLm5hbWUpO1xuICAgICAgICBsZXQgaW5kZXg7XG4gICAgICAgIGxldCBlbnRyeTtcblxuICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnZCcgfHwgaXRlbS50eXBlID09PSAnbCcpIHtcbiAgICAgICAgICBpZiAobmFtZSA9PT0gJy4nIHx8IG5hbWUgPT09ICcuLicpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICBpbmRleCA9IHRoaXMuZXhpc3RzKG5hbWUsIHRydWUpO1xuXG4gICAgICAgICAgaWYgKGluZGV4ID09PSBudWxsKSB7XG4gICAgICAgICAgICBlbnRyeSA9IG5ldyBEaXJlY3Rvcnkoe1xuICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICAgICAgICAgIG9yaWdpbmFsOiBpdGVtLFxuICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudHJ5ID0gdGhpcy5mb2xkZXJzW2luZGV4XTtcbiAgICAgICAgICAgIHRoaXMuZm9sZGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvbGRlcnMucHVzaChlbnRyeSk7XG5cbiAgICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1mb2xkZXInLCBmb2xkZXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbmRleCA9IHRoaXMuZXhpc3RzKG5hbWUsIHRydWUpO1xuXG4gICAgICAgICAgaWYgKGluZGV4ID09PSBudWxsKSB7XG4gICAgICAgICAgICBlbnRyeSA9IG5ldyBGaWxlKHtcbiAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLFxuICAgICAgICAgICAgICBvcmlnaW5hbDogaXRlbSxcbiAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbnRyeSA9IHRoaXMuZmlsZXNbaW5kZXhdO1xuICAgICAgICAgICAgdGhpcy5maWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVudHJ5LnNpemUgPSBpdGVtLnNpemU7XG4gICAgICAgICAgZW50cnkuZGF0ZSA9IGl0ZW0uZGF0ZTtcblxuICAgICAgICAgIGZpbGVzLnB1c2goZW50cnkpO1xuXG4gICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtZmlsZScsIGZpbGVzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZm9sZGVycy5mb3JFYWNoKChmb2xkZXIpID0+IHsgZm9sZGVyLmRlc3Ryb3koKTsgfSk7XG4gICAgICB0aGlzLmZvbGRlcnMgPSBmb2xkZXJzO1xuXG4gICAgICB0aGlzLmZpbGVzLmZvckVhY2goKGZpbGUpID0+IHsgZmlsZS5kZXN0cm95KCk7IH0pO1xuICAgICAgdGhpcy5maWxlcyA9IGZpbGVzO1xuXG4gICAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICAgIHRoaXMuZm9sZGVycy5mb3JFYWNoKChmb2xkZXIpID0+IHtcbiAgICAgICAgICBpZiAoZm9sZGVyLnN0YXR1cyA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgICAgIGZvbGRlci5vcGVuKHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiAoY29tcGxldGUpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbXBsZXRlLmNhbGwobnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWl0ZW1zJywgdGhpcyk7XG4gICAgfSk7XG4gIH1cblxuICBvcGVuUGF0aChvcGF0aCkge1xuICAgIGxldCByZW1haW5pbmdQYXRoID0gb3BhdGgucmVwbGFjZSh0aGlzLnJlbW90ZSwgJycpO1xuXG4gICAgaWYgKHJlbWFpbmluZ1BhdGguc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICByZW1haW5pbmdQYXRoID0gcmVtYWluaW5nUGF0aC5zdWJzdHIoMSk7XG4gICAgfVxuXG4gICAgaWYgKHJlbWFpbmluZ1BhdGgubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgcmVtYWluaW5nUGF0aFNwbGl0ID0gcmVtYWluaW5nUGF0aC5zcGxpdCgnLycpO1xuXG4gICAgICBpZiAocmVtYWluaW5nUGF0aFNwbGl0Lmxlbmd0aCA+IDAgJiYgdGhpcy5mb2xkZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IG5leHRQYXRoID0gdGhpcy5yZW1vdGU7XG5cbiAgICAgICAgaWYgKCFuZXh0UGF0aC5lbmRzV2l0aCgnLycpKSB7IG5leHRQYXRoICs9ICcvJzsgfVxuXG4gICAgICAgIG5leHRQYXRoICs9IHJlbWFpbmluZ1BhdGhTcGxpdFswXTtcblxuICAgICAgICB0aGlzLmZvbGRlcnMuZm9yRWFjaCgoZm9sZGVyKSA9PiB7XG4gICAgICAgICAgaWYgKGZvbGRlci5yZW1vdGUgPT09IG5leHRQYXRoKSB7XG4gICAgICAgICAgICBmb2xkZXIuaXNFeHBhbmRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChmb2xkZXIuZm9sZGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGZvbGRlci5vcGVuUGF0aChvcGF0aCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBmb2xkZXIub3BlbihmYWxzZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvbGRlci5vcGVuUGF0aChvcGF0aCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25DaGFuZ2VGb2xkZXIoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWZvbGRlcicsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uQ2hhbmdlRmlsZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtZmlsZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uQ2hhbmdlSXRlbXMoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWl0ZW1zJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25DaGFuZ2VFeHBhbmRlZChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtZXhwYW5kZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkRlc3Ryb3llZChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2Rlc3Ryb3llZCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldCBpc1Jvb3QoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ID09PSBudWxsO1xuICB9XG5cbiAgZ2V0IHJvb3QoKSB7XG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQucm9vdDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldCBsb2NhbCgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHJldHVybiBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4odGhpcy5wYXJlbnQubG9jYWwsIHRoaXMubmFtZSkpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbXVsdGlwbGVIb3N0c0VuYWJsZWQoKSA9PT0gdHJ1ZSA/IHRoaXMuY2xpZW50LnByb2plY3RQYXRoIDogYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gIH1cblxuICBnZXQgcmVtb3RlKCkge1xuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgcmV0dXJuIHBhdGgubm9ybWFsaXplKHBhdGguam9pbih0aGlzLnBhcmVudC5yZW1vdGUsIHRoaXMubmFtZSkpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wYXRoO1xuICB9XG5cbiAgc2V0IHNldElzRXhwYW5kZWQodmFsdWUpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1leHBhbmRlZCcsIHZhbHVlKTtcbiAgICB0aGlzLmlzRXhwYW5kZWQgPSB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEaXJlY3Rvcnk7XG4iXX0=