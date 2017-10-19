Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _iceteeFtp = require('@icetee/ftp');

var _iceteeFtp2 = _interopRequireDefault(_iceteeFtp);

var _connector = require('../connector');

var _connector2 = _interopRequireDefault(_connector);

var _notifications = require('../notifications');

var _helpers = require('../helpers');

'use babel';

function tryApply(callback, context, args) {
  if (typeof callback === 'function') {
    callback.apply(context, args);
  }
}

var ConnectorFTP = (function (_Connector) {
  _inherits(ConnectorFTP, _Connector);

  function ConnectorFTP() {
    _classCallCheck(this, ConnectorFTP);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _get(Object.getPrototypeOf(ConnectorFTP.prototype), 'constructor', this).apply(this, args);

    this.ftp = null;
  }

  _createClass(ConnectorFTP, [{
    key: 'isConnected',
    value: function isConnected() {
      return this.ftp && this.ftp.connected;
    }
  }, {
    key: '_isConnectedApply',
    value: function _isConnectedApply(completed) {
      if (!this.isConnected()) {
        tryApply(completed, null, ['Not connected']);
        return false;
      }
      return true;
    }
  }, {
    key: 'connect',
    value: function connect(info, completed) {
      var _this = this;

      this.info = info;

      this.ftp = new _iceteeFtp2['default']();
      this.ftp.on('greeting', function (msg) {
        _this.emit('greeting', msg);
      }).on('ready', function () {
        _this.checkFeatures(function () {
          _this.emit('connected');

          // disable keepalive manually when specified in .ftpconfig
          _this.ftp._socket.setKeepAlive(_this.info.keepalive > 0);

          tryApply(completed, _this, []);
        });
      }).on('end', function () {
        _this.emit('ended');
      }).on('error', function (err) {
        var errCode = (0, _helpers.getObject)({
          obj: err,
          keys: ['code']
        });

        if (errCode === 421 || errCode === 'ECONNRESET') {
          _this.emit('closed', 'RECONNECT');
          _this.disconnect();
        }

        _this.emit('error', err, errCode);
      });

      this.ftp.connect(this.info);

      this.ftp._parser.on('response', function (code, text) {
        _this.emit('response', code, text);
      });

      return this;
    }
  }, {
    key: 'disconnect',
    value: function disconnect(completed) {
      if (this.ftp) {
        this.ftp.destroy();
        this.ftp = null;
      }

      tryApply(completed, null, []);

      return this;
    }
  }, {
    key: 'abort',
    value: function abort(completed) {
      if (!this._isConnectedApply(completed)) return false;

      this.ftp.abort(function () {
        tryApply(completed, null, []);
      });

      return this;
    }
  }, {
    key: 'checkFeatures',
    value: function checkFeatures(cb) {
      var _this2 = this;

      this.ftp._send('EPSV', function (errEPSV) {
        if (errEPSV) {
          if (errEPSV.code >= 500 || /Operation not permitted/.test(errEPSV.message)) {
            _this2.ftp._epsvFeat = false;
            _this2.ftp._eprtFeat = false;
            _this2.ftp.options.forcePasv = true;
          }
        }
        cb();
      });
    }
  }, {
    key: 'list',
    value: function list(path, recursive, completed, isFile) {
      var _this3 = this;

      if (!this._isConnectedApply(completed)) return false;

      // NOTE: isFile is included as the list command from FTP does not throw an error
      // when you try to get the files in a file.

      var showHiddenFiles = atom.config.get('Remote-FTP.tree.showHiddenFiles');
      var nPath = _path2['default'].posix.resolve(path);

      if (isFile === true) {
        completed.apply(null, [null, []]);
        return true;
      }
      if (recursive) {
        (function () {
          var list = [];
          var digg = 0;

          var error = function error() {
            tryApply(completed, null, [null, list]);
          };

          var l = function l(np) {
            var p = _path2['default'].posix.resolve(np);
            ++digg;
            _this3.ftp.list(showHiddenFiles ? '-al ' + p : p, function (err, lis) {
              if (err) return error();

              if (lis) {
                lis.forEach(function (item) {
                  if (item.name === '.' || item.name === '..') return;
                  // NOTE: if the same, then we synhronize file
                  if (p !== item.name) item.name = p + '/' + item.name;

                  if (item.type === 'd' || item.type === 'l') {
                    list.push(item);
                    l(item.name);
                  } else {
                    item.type = 'f';
                    list.push(item);
                  }
                });
              }
              if (--digg === 0) error();

              return true;
            });
          };
          l(nPath);
        })();
      } else {
        this.ftp.list(showHiddenFiles ? '-al ' + nPath : nPath, function (err, lis) {
          var list = [];

          if (lis && !err) {
            list = (0, _helpers.separateRemoteItems)(lis);
          }

          tryApply(completed, null, [err, list]);
        });
      }

      return this;
    }
  }, {
    key: 'mlsd',
    value: function mlsd(path, completed) {
      if (!this._isConnectedApply(completed)) return;

      var nPath = _path2['default'].posix.resolve(path);

      this.ftp.mlsd(nPath, function (err, lis) {
        var list = [];

        if (lis && !err) {
          list = (0, _helpers.separateRemoteItems)(lis);
        }

        tryApply(completed, null, [err, list]);
      });
    }
  }, {
    key: 'type',
    value: function type(path, cb) {
      var _this4 = this;

      var featMLSD = typeof this.ftp._feat !== 'undefined' ? this.ftp._feat.indexOf('MLSD') > -1 : false;

      if (featMLSD) {
        this.mlsd(path, function (err, list) {
          var rtn = 'd';

          if (err && err.code !== 550) {
            console.error(err);
          }

          if (err && err.code === 550) {
            rtn = 'f';
          }

          if (!err && list && list.length >= 0) {
            rtn = 'd';
          } else {
            rtn = 'f';
          }

          if (!err && list && list.length === 1 && list[0].name === path) {
            rtn = list[0].type;
          }

          cb(rtn);
        });
      } else {
        // This is old way to check
        this.ftp.cwd(path, function (res) {
          var rtn = 'd';

          if (res && res.code !== 250) {
            rtn = 'f';
          }

          _this4.ftp.cwd('/', function () {
            cb(rtn);
          });
        });
      }
    }
  }, {
    key: '_getFile',
    value: function _getFile(path, completed, progress) {
      var _this5 = this;

      var npath = _path2['default'].posix.resolve(path);
      var local = this.client.toLocal(npath);

      _fsPlus2['default'].makeTreeSync(_path2['default'].dirname(local));

      var size = -1;
      var pool = undefined;

      this.once('150', function (reply) {
        var str = reply.match(/([0-9]+)\s*(bytes)/);
        if (str) {
          size = parseInt(str[1], 10) || -1;
          pool = setInterval(function () {
            if (!_this5.ftp || !_this5.ftp._pasvSocket) return;
            var read = _this5.ftp._pasvSocket.bytesRead;
            tryApply(progress, null, [read / size]);
          }, 250);
        }
      });

      this.ftp.get(npath, function (error, stream) {
        if (error) {
          if (pool) clearInterval(pool);
          tryApply(completed, null, [error]);
          return;
        }

        var dest = _fsPlus2['default'].createWriteStream(local);

        dest.on('unpipe', function () {
          if (pool) clearInterval(pool);

          tryApply(completed, null, []);
        });

        dest.on('error', function (cerror) {
          if (cerror.code === 'EISDIR') {
            (0, _notifications.isEISDIR)(cerror.path, function (model) {
              _fsPlus2['default'].removeSync(cerror.path);
              _this5.get(npath);

              model.removeNotification();
            });
          }

          if (pool) clearInterval(pool);

          tryApply(completed, null, [cerror]);
        });

        stream.pipe(dest);
      });
    }
  }, {
    key: '_getFolder',
    value: function _getFolder(path, recursive, completed, progress) {
      var _this6 = this;

      var npath = _path2['default'].posix.resolve(path);

      this.list(npath, recursive, function (lError, list) {
        list.unshift({ name: npath, type: 'd' });
        list.forEach(function (item) {
          item.depth = (0, _helpers.splitPaths)(item.name).length;
        });
        list.sort(_helpers.sortDepth);

        var error = null;
        var i = -1;
        var size = 0;
        var read = 0;
        var pool = undefined;

        var total = list.length;

        var e = function e() {
          tryApply(completed, null, [error, list]);
        };

        var n = function n() {
          ++i;
          if (pool) clearInterval(pool);
          tryApply(progress, null, [i / total]);

          var item = list.shift();
          if (typeof item === 'undefined' || item === null) return e();

          var nLocal = _this6.client.toLocal(item.name);

          if (item.type === 'd' || item.type === 'l') {
            try {
              _fsPlus2['default'].makeTreeSync(nLocal);
            } catch (cerror) {
              if (cerror.code === 'EEXIST') {
                (0, _notifications.isEEXIST)(cerror.path, function (model) {
                  _fsPlus2['default'].removeSync(cerror.path);
                  _this6.get(npath);
                  // FS.makeTreeSync(nLocal);

                  model.removeNotification();
                });
              }
            }

            n();
          } else {
            size = 0;
            read = 0;

            _this6.once('150', function (reply) {
              var str = reply.match(/([0-9]+)\s*(bytes)/);
              if (str) {
                size = parseInt(str[1], 10) || -1;
                pool = setInterval(function () {
                  if (!_this6.ftp || !_this6.ftp._pasvSocket) return;
                  read = _this6.ftp._pasvSocket.bytesRead;
                  tryApply(progress, null, [i / total + read / size / total]);
                }, 250);
              }
            });

            _this6.ftp.get(item.name, function (getError, stream) {
              if (getError) {
                error = getError;

                if (/Permission denied/.test(error)) {
                  (0, _notifications.isPermissionDenied)(item.name);
                }

                return n();
              }

              var dest = _fsPlus2['default'].createWriteStream(nLocal);

              dest.on('unpipe', function () {
                return n();
              });
              dest.on('error', function () {
                return n();
              });

              stream.pipe(dest);

              return true;
            });
          }
          return true;
        };
        n();
      });
    }
  }, {
    key: 'get',
    value: function get(path, recursive, completed, progress) {
      var _this7 = this;

      if (!this._isConnectedApply(completed)) return;

      var npath = _path2['default'].posix.resolve(path);

      this.type(npath, function (type) {
        if (type === 'f') {
          _this7._getFile(path, completed, progress);
        } else {
          _this7._getFolder(path, recursive, completed, progress);
        }
      });
    }
  }, {
    key: 'put',
    value: function put(path, completed, progress) {
      var _this8 = this;

      if (!this._isConnectedApply(completed)) return false;

      var remote = this.client.toRemote(path);

      if (_fsPlus2['default'].isFileSync(path)) {
        (function () {
          // NOTE: File
          var stats = _fsPlus2['default'].statSync(path);
          var size = stats.size;
          var written = 0;

          var e = function e(err) {
            tryApply(completed, null, [err || null, [{ name: path, type: 'f' }]]);
          };
          var pool = setInterval(function () {
            if (!_this8.ftp || !_this8.ftp._pasvSocket) return;
            written = _this8.ftp._pasvSocket.bytesWritten;
            tryApply(progress, null, [written / size]);
          }, 250);

          _this8.ftp.put(path, remote, function (err) {
            var fatal = false;

            if (/Permission denied/.test(err)) {
              (0, _notifications.isPermissionDenied)(path);
              fatal = true;
              return e(err);
            }

            if (err && !fatal) {
              _this8.mkdir(_path2['default'].dirname(remote).replace(/\\/g, '/'), true, function () {
                _this8.ftp.put(path, remote, function (putError) {
                  if (pool) clearInterval(pool);
                  return e(putError);
                });
              });
            }
            if (pool) clearInterval(pool);
            return e();
          });
        })();
      } else {
        // NOTE: Folder
        (0, _helpers.traverseTree)(path, function (list) {
          _this8.mkdir(remote, true, function () {
            var error = undefined;
            var i = -1;
            var size = 0;
            var written = 0;

            var total = list.length;
            var pool = setInterval(function () {
              if (!_this8.ftp || !_this8.ftp._pasvSocket) return;
              written = _this8.ftp._pasvSocket.bytesWritten;
              tryApply(progress, null, [i / total + written / size / total]);
            }, 250);
            var e = function e() {
              if (pool) clearInterval(pool);
              tryApply(completed, null, [error, list]);
            };
            var n = function n() {
              if (++i >= list.length) return e();
              var item = list[i];
              var nRemote = _this8.client.toRemote(item.name);
              if (item.type === 'd' || item.type === 'l') {
                _this8.ftp.mkdir(nRemote, function (mkdirErr) {
                  if (mkdirErr) error = mkdirErr;
                  return n();
                });
              } else {
                var stats = _fsPlus2['default'].statSync(item.name);
                size = stats.size;
                written = 0;
                _this8.ftp.put(item.name, nRemote, function (putErr) {
                  if (putErr) error = putErr;
                  return n();
                });
              }
              return true;
            };
            return n();
          });
        });
      }

      return this;
    }
  }, {
    key: 'mkdir',
    value: function mkdir(path, recursive, completed) {
      var _this9 = this;

      if (!this._isConnectedApply(completed)) return false;

      var remotes = (0, _helpers.splitPaths)(path);
      var dirs = ['/' + remotes.slice(0, remotes.length).join('/')];
      var enableTransfer = atom.config.get('Remote-FTP.notifications.enableTransfer');
      var remotePath = (0, _helpers.splitPaths)(this.client.info.remote);

      if (recursive) {
        for (var a = remotes.length - 1; a > 0; --a) {
          // Observe the specified path
          var sRemote = '/' + remotePath.slice(0, a).join('/');
          var pRemote = '/' + remotes.slice(0, a).join('/');

          if (sRemote !== pRemote) {
            dirs.unshift('/' + remotes.slice(0, a).join('/'));
          }
        }
      }

      var n = function n() {
        var dir = dirs.shift();
        var last = dirs.length === 0;

        _this9.ftp.list(dir, false, function (errList, list) {
          if (typeof list !== 'undefined') {
            var dirName = path.split('/').pop();
            var folders = list.filter(function (o) {
              return o.type === 'd' || o.type === 'l';
            });
            var dirNames = folders.map(function (o) {
              return o.name;
            });

            if (typeof list !== 'undefined' && dirNames.indexOf(dirName) > -1) {
              if (last) {
                tryApply(completed, null, [errList || null]);
                return;
              }

              n();
              return;
            }
          }

          _this9.ftp.mkdir(dir, function (err) {
            if (last) {
              tryApply(completed, null, [err || null]);
            } else {
              return n();
            }

            return false;
          });
        });
      };

      n();

      return this;
    }
  }, {
    key: 'mkfile',
    value: function mkfile(path, completed) {
      var _this10 = this;

      if (!this._isConnectedApply(completed)) return false;

      var local = this.client.toLocal(path);
      var empty = new Buffer('', 'utf8');
      var enableTransfer = atom.config.get('Remote-FTP.notifications.enableTransfer');

      this.ftp.list(path, false, function (listErr, list) {
        if (typeof list !== 'undefined') {
          var files = list.filter(function (o) {
            return o.type === '-';
          });

          // File exists
          if (files.length !== 0) {
            if (enableTransfer) (0, _notifications.isAlreadyExits)(path, 'file');

            tryApply(completed, null, [listErr]);
            return;
          }
        }

        _this10.ftp.put(empty, path, function (putErr) {
          if (putErr) {
            tryApply(completed, null, [putErr]);
            return;
          }

          _fsPlus2['default'].makeTreeSync(_path2['default'].dirname(local));
          _fsPlus2['default'].writeFile(local, empty, function (err2) {
            tryApply(completed, null, [err2]);
          });
        });
      });

      return this;
    }
  }, {
    key: 'rename',
    value: function rename(source, dest, completed) {
      var _this11 = this;

      if (!this._isConnectedApply(completed)) return false;

      this.ftp.rename(source, dest, function (err) {
        if (err) {
          tryApply(completed, null, [err]);
        } else {
          _fsPlus2['default'].rename(_this11.client.toLocal(source), _this11.client.toLocal(dest), function (rErr) {
            tryApply(completed, null, [rErr]);
          });
        }
      });

      return this;
    }
  }, {
    key: 'site',
    value: function site(command, completed) {
      if (!this._isConnectedApply(completed)) return false;

      this.ftp.site(command, function (err) {
        if (err) {
          tryApply(completed, null, [err]);
        }
      });

      return this;
    }
  }, {
    key: 'delete',
    value: function _delete(path, completed) {
      var _this12 = this;

      if (!this._isConnectedApply(completed)) return false;

      this.type(path, function (type) {
        if (type === 'f') {
          // NOTE: File
          _this12.ftp['delete'](path, function (err) {
            tryApply(completed, null, [err, [{ name: path, type: 'f' }]]);
          });
        } else {
          // NOTE: Folder
          _this12.list(path, true, function (err, list) {
            list.forEach(function (item) {
              item.depth = (0, _helpers.splitPaths)(item.name).length;
            });
            list.sort(_helpers.simpleSortDepth);

            var done = 0;

            var e = function e() {
              _this12.ftp.rmdir(path, function (eErr) {
                tryApply(completed, null, [eErr, list]);
              });
            };
            list.forEach(function (item) {
              ++done;
              var fn = item.type === 'd' || item.type === 'l' ? 'rmdir' : 'delete';
              _this12.ftp[fn](item.name, function () {
                if (--done === 0) return e();
                return true;
              });
            });
            if (list.length === 0) e();
          });
        }
      });

      return this;
    }
  }]);

  return ConnectorFTP;
})(_connector2['default']);

exports['default'] = ConnectorFTP;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9jb25uZWN0b3JzL2Z0cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFZSxTQUFTOzs7O29CQUNQLE1BQU07Ozs7eUJBQ1AsYUFBYTs7Ozt5QkFDUCxjQUFjOzs7OzZCQUNtQyxrQkFBa0I7O3VCQUNZLFlBQVk7O0FBUGpILFdBQVcsQ0FBQzs7QUFTWixTQUFTLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUN6QyxNQUFJLE9BQU8sUUFBUSxLQUFLLFVBQVUsRUFBRTtBQUNsQyxZQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUMvQjtDQUNGOztJQUVLLFlBQVk7WUFBWixZQUFZOztBQUNMLFdBRFAsWUFBWSxHQUNLOzBCQURqQixZQUFZOztzQ0FDRCxJQUFJO0FBQUosVUFBSTs7O0FBQ2pCLCtCQUZFLFlBQVksOENBRUwsSUFBSSxFQUFFOztBQUVmLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0dBQ2pCOztlQUxHLFlBQVk7O1dBT0wsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7S0FDdkM7OztXQUVnQiwyQkFBQyxTQUFTLEVBQUU7QUFDM0IsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN2QixnQkFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQzdDLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFTSxpQkFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFOzs7QUFDdkIsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLFVBQUksQ0FBQyxH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QUFFLENBQUM7QUFDN0IsdUJBQU8sSUFBSSxDQUFDO2VBQ2IsQ0FBQyxDQUFDO2FBQ0osQ0FBQyxDQUFDO0FBQ0gsZ0JBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7V0FDNUIsQ0FBQyxDQUFDO1NBQ0o7T0FDRixDQUFDLENBQUM7O0FBRUgsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1NBam5CRyxZQUFZOzs7cUJBcW5CSCxZQUFZIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9jb25uZWN0b3JzL2Z0cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgRlMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBGVFAgZnJvbSAnQGljZXRlZS9mdHAnO1xuaW1wb3J0IENvbm5lY3RvciBmcm9tICcuLi9jb25uZWN0b3InO1xuaW1wb3J0IHsgaXNFRVhJU1QsIGlzRUlTRElSLCBpc0FscmVhZHlFeGl0cywgaXNQZXJtaXNzaW9uRGVuaWVkIH0gZnJvbSAnLi4vbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgeyBnZXRPYmplY3QsIHNlcGFyYXRlUmVtb3RlSXRlbXMsIHNwbGl0UGF0aHMsIHNpbXBsZVNvcnREZXB0aCwgc29ydERlcHRoLCB0cmF2ZXJzZVRyZWUgfSBmcm9tICcuLi9oZWxwZXJzJztcblxuZnVuY3Rpb24gdHJ5QXBwbHkoY2FsbGJhY2ssIGNvbnRleHQsIGFyZ3MpIHtcbiAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICB9XG59XG5cbmNsYXNzIENvbm5lY3RvckZUUCBleHRlbmRzIENvbm5lY3RvciB7XG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKTtcblxuICAgIHRoaXMuZnRwID0gbnVsbDtcbiAgfVxuXG4gIGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmZ0cCAmJiB0aGlzLmZ0cC5jb25uZWN0ZWQ7XG4gIH1cblxuICBfaXNDb25uZWN0ZWRBcHBseShjb21wbGV0ZWQpIHtcbiAgICBpZiAoIXRoaXMuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbJ05vdCBjb25uZWN0ZWQnXSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29ubmVjdChpbmZvLCBjb21wbGV0ZWQpIHtcbiAgICB0aGlzLmluZm8gPSBpbmZvO1xuXG4gICAgdGhpcy5mdHAgPSBuZXcgRlRQKCk7XG4gICAgdGhpcy5mdHBcbiAgICAgIC5vbignZ3JlZXRpbmcnLCAobXNnKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdCgnZ3JlZXRpbmcnLCBtc2cpO1xuICAgICAgfSlcbiAgICAgIC5vbigncmVhZHknLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2hlY2tGZWF0dXJlcygoKSA9PiB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcblxuICAgICAgICAgIC8vIGRpc2FibGUga2VlcGFsaXZlIG1hbnVhbGx5IHdoZW4gc3BlY2lmaWVkIGluIC5mdHBjb25maWdcbiAgICAgICAgICB0aGlzLmZ0cC5fc29ja2V0LnNldEtlZXBBbGl2ZSh0aGlzLmluZm8ua2VlcGFsaXZlID4gMCk7XG5cbiAgICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIHRoaXMsIFtdKTtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdCgnZW5kZWQnKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICBjb25zdCBlcnJDb2RlID0gZ2V0T2JqZWN0KHtcbiAgICAgICAgICBvYmo6IGVycixcbiAgICAgICAgICBrZXlzOiBbJ2NvZGUnXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGVyckNvZGUgPT09IDQyMSB8fCBlcnJDb2RlID09PSAnRUNPTk5SRVNFVCcpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ2Nsb3NlZCcsICdSRUNPTk5FQ1QnKTtcbiAgICAgICAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIsIGVyckNvZGUpO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLmZ0cC5jb25uZWN0KHRoaXMuaW5mbyk7XG5cbiAgICB0aGlzLmZ0cC5fcGFyc2VyLm9uKCdyZXNwb25zZScsIChjb2RlLCB0ZXh0KSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ3Jlc3BvbnNlJywgY29kZSwgdGV4dCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoY29tcGxldGVkKSB7XG4gICAgaWYgKHRoaXMuZnRwKSB7XG4gICAgICB0aGlzLmZ0cC5kZXN0cm95KCk7XG4gICAgICB0aGlzLmZ0cCA9IG51bGw7XG4gICAgfVxuXG4gICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbXSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFib3J0KGNvbXBsZXRlZCkge1xuICAgIGlmICghdGhpcy5faXNDb25uZWN0ZWRBcHBseShjb21wbGV0ZWQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICB0aGlzLmZ0cC5hYm9ydCgoKSA9PiB7XG4gICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtdKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2hlY2tGZWF0dXJlcyhjYikge1xuICAgIHRoaXMuZnRwLl9zZW5kKCdFUFNWJywgKGVyckVQU1YpID0+IHtcbiAgICAgIGlmIChlcnJFUFNWKSB7XG4gICAgICAgIGlmIChlcnJFUFNWLmNvZGUgPj0gNTAwIHx8IC9PcGVyYXRpb24gbm90IHBlcm1pdHRlZC8udGVzdChlcnJFUFNWLm1lc3NhZ2UpKSB7XG4gICAgICAgICAgdGhpcy5mdHAuX2Vwc3ZGZWF0ID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5mdHAuX2VwcnRGZWF0ID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5mdHAub3B0aW9ucy5mb3JjZVBhc3YgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYigpO1xuICAgIH0pO1xuICB9XG5cbiAgbGlzdChwYXRoLCByZWN1cnNpdmUsIGNvbXBsZXRlZCwgaXNGaWxlKSB7XG4gICAgaWYgKCF0aGlzLl9pc0Nvbm5lY3RlZEFwcGx5KGNvbXBsZXRlZCkpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIE5PVEU6IGlzRmlsZSBpcyBpbmNsdWRlZCBhcyB0aGUgbGlzdCBjb21tYW5kIGZyb20gRlRQIGRvZXMgbm90IHRocm93IGFuIGVycm9yXG4gICAgLy8gd2hlbiB5b3UgdHJ5IHRvIGdldCB0aGUgZmlsZXMgaW4gYSBmaWxlLlxuXG4gICAgY29uc3Qgc2hvd0hpZGRlbkZpbGVzID0gYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLnRyZWUuc2hvd0hpZGRlbkZpbGVzJyk7XG4gICAgY29uc3QgblBhdGggPSBQYXRoLnBvc2l4LnJlc29sdmUocGF0aCk7XG5cbiAgICBpZiAoaXNGaWxlID09PSB0cnVlKSB7XG4gICAgICBjb21wbGV0ZWQuYXBwbHkobnVsbCwgW251bGwsIFtdXSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgY29uc3QgbGlzdCA9IFtdO1xuICAgICAgbGV0IGRpZ2cgPSAwO1xuXG4gICAgICBjb25zdCBlcnJvciA9ICgpID0+IHsgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbbnVsbCwgbGlzdF0pOyB9O1xuXG4gICAgICBjb25zdCBsID0gKG5wKSA9PiB7XG4gICAgICAgIGNvbnN0IHAgPSBQYXRoLnBvc2l4LnJlc29sdmUobnApO1xuICAgICAgICArK2RpZ2c7XG4gICAgICAgIHRoaXMuZnRwLmxpc3QoKHNob3dIaWRkZW5GaWxlcyA/IGAtYWwgJHtwfWAgOiBwKSwgKGVyciwgbGlzKSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuIGVycm9yKCk7XG5cbiAgICAgICAgICBpZiAobGlzKSB7XG4gICAgICAgICAgICBsaXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoaXRlbS5uYW1lID09PSAnLicgfHwgaXRlbS5uYW1lID09PSAnLi4nKSByZXR1cm47XG4gICAgICAgICAgICAgIC8vIE5PVEU6IGlmIHRoZSBzYW1lLCB0aGVuIHdlIHN5bmhyb25pemUgZmlsZVxuICAgICAgICAgICAgICBpZiAocCAhPT0gaXRlbS5uYW1lKSBpdGVtLm5hbWUgPSBgJHtwfS8ke2l0ZW0ubmFtZX1gO1xuXG4gICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdkJyB8fCBpdGVtLnR5cGUgPT09ICdsJykge1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICBsKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID0gJ2YnO1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgtLWRpZ2cgPT09IDApIGVycm9yKCk7XG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgbChuUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnRwLmxpc3QoKHNob3dIaWRkZW5GaWxlcyA/IGAtYWwgJHtuUGF0aH1gIDogblBhdGgpLCAoZXJyLCBsaXMpID0+IHtcbiAgICAgICAgbGV0IGxpc3QgPSBbXTtcblxuICAgICAgICBpZiAobGlzICYmICFlcnIpIHtcbiAgICAgICAgICBsaXN0ID0gc2VwYXJhdGVSZW1vdGVJdGVtcyhsaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyLCBsaXN0XSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG1sc2QocGF0aCwgY29tcGxldGVkKSB7XG4gICAgaWYgKCF0aGlzLl9pc0Nvbm5lY3RlZEFwcGx5KGNvbXBsZXRlZCkpIHJldHVybjtcblxuICAgIGNvbnN0IG5QYXRoID0gUGF0aC5wb3NpeC5yZXNvbHZlKHBhdGgpO1xuXG4gICAgdGhpcy5mdHAubWxzZChuUGF0aCwgKGVyciwgbGlzKSA9PiB7XG4gICAgICBsZXQgbGlzdCA9IFtdO1xuXG4gICAgICBpZiAobGlzICYmICFlcnIpIHtcbiAgICAgICAgbGlzdCA9IHNlcGFyYXRlUmVtb3RlSXRlbXMobGlzKTtcbiAgICAgIH1cblxuICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyLCBsaXN0XSk7XG4gICAgfSk7XG4gIH1cblxuICB0eXBlKHBhdGgsIGNiKSB7XG4gICAgY29uc3QgZmVhdE1MU0QgPSAodHlwZW9mIHRoaXMuZnRwLl9mZWF0ICE9PSAndW5kZWZpbmVkJykgPyB0aGlzLmZ0cC5fZmVhdC5pbmRleE9mKCdNTFNEJykgPiAtMSA6IGZhbHNlO1xuXG4gICAgaWYgKGZlYXRNTFNEKSB7XG4gICAgICB0aGlzLm1sc2QocGF0aCwgKGVyciwgbGlzdCkgPT4ge1xuICAgICAgICBsZXQgcnRuID0gJ2QnO1xuXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgIT09IDU1MCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgPT09IDU1MCkge1xuICAgICAgICAgIHJ0biA9ICdmJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXJyICYmIGxpc3QgJiYgbGlzdC5sZW5ndGggPj0gMCkge1xuICAgICAgICAgIHJ0biA9ICdkJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBydG4gPSAnZic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWVyciAmJiBsaXN0ICYmIGxpc3QubGVuZ3RoID09PSAxICYmIGxpc3RbMF0ubmFtZSA9PT0gcGF0aCkge1xuICAgICAgICAgIHJ0biA9IGxpc3RbMF0udHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNiKHJ0bik7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyBpcyBvbGQgd2F5IHRvIGNoZWNrXG4gICAgICB0aGlzLmZ0cC5jd2QocGF0aCwgKHJlcykgPT4ge1xuICAgICAgICBsZXQgcnRuID0gJ2QnO1xuXG4gICAgICAgIGlmIChyZXMgJiYgcmVzLmNvZGUgIT09IDI1MCkge1xuICAgICAgICAgIHJ0biA9ICdmJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZnRwLmN3ZCgnLycsICgpID0+IHtcbiAgICAgICAgICBjYihydG4pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRGaWxlKHBhdGgsIGNvbXBsZXRlZCwgcHJvZ3Jlc3MpIHtcbiAgICBjb25zdCBucGF0aCA9IFBhdGgucG9zaXgucmVzb2x2ZShwYXRoKTtcbiAgICBjb25zdCBsb2NhbCA9IHRoaXMuY2xpZW50LnRvTG9jYWwobnBhdGgpO1xuXG4gICAgRlMubWFrZVRyZWVTeW5jKFBhdGguZGlybmFtZShsb2NhbCkpO1xuXG4gICAgbGV0IHNpemUgPSAtMTtcbiAgICBsZXQgcG9vbDtcblxuICAgIHRoaXMub25jZSgnMTUwJywgKHJlcGx5KSA9PiB7XG4gICAgICBjb25zdCBzdHIgPSByZXBseS5tYXRjaCgvKFswLTldKylcXHMqKGJ5dGVzKS8pO1xuICAgICAgaWYgKHN0cikge1xuICAgICAgICBzaXplID0gcGFyc2VJbnQoc3RyWzFdLCAxMCkgfHwgLTE7XG4gICAgICAgIHBvb2wgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLmZ0cCB8fCAhdGhpcy5mdHAuX3Bhc3ZTb2NrZXQpIHJldHVybjtcbiAgICAgICAgICBjb25zdCByZWFkID0gdGhpcy5mdHAuX3Bhc3ZTb2NrZXQuYnl0ZXNSZWFkO1xuICAgICAgICAgIHRyeUFwcGx5KHByb2dyZXNzLCBudWxsLCBbcmVhZCAvIHNpemVdKTtcbiAgICAgICAgfSwgMjUwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZnRwLmdldChucGF0aCwgKGVycm9yLCBzdHJlYW0pID0+IHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBpZiAocG9vbCkgY2xlYXJJbnRlcnZhbChwb29sKTtcbiAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyb3JdKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkZXN0ID0gRlMuY3JlYXRlV3JpdGVTdHJlYW0obG9jYWwpO1xuXG4gICAgICBkZXN0Lm9uKCd1bnBpcGUnLCAoKSA9PiB7XG4gICAgICAgIGlmIChwb29sKSBjbGVhckludGVydmFsKHBvb2wpO1xuXG4gICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW10pO1xuICAgICAgfSk7XG5cbiAgICAgIGRlc3Qub24oJ2Vycm9yJywgKGNlcnJvcikgPT4ge1xuICAgICAgICBpZiAoY2Vycm9yLmNvZGUgPT09ICdFSVNESVInKSB7XG4gICAgICAgICAgaXNFSVNESVIoY2Vycm9yLnBhdGgsIChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgRlMucmVtb3ZlU3luYyhjZXJyb3IucGF0aCk7XG4gICAgICAgICAgICB0aGlzLmdldChucGF0aCk7XG5cbiAgICAgICAgICAgIG1vZGVsLnJlbW92ZU5vdGlmaWNhdGlvbigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvb2wpIGNsZWFySW50ZXJ2YWwocG9vbCk7XG5cbiAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbY2Vycm9yXSk7XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtLnBpcGUoZGVzdCk7XG4gICAgfSk7XG4gIH1cblxuICBfZ2V0Rm9sZGVyKHBhdGgsIHJlY3Vyc2l2ZSwgY29tcGxldGVkLCBwcm9ncmVzcykge1xuICAgIGNvbnN0IG5wYXRoID0gUGF0aC5wb3NpeC5yZXNvbHZlKHBhdGgpO1xuXG4gICAgdGhpcy5saXN0KG5wYXRoLCByZWN1cnNpdmUsIChsRXJyb3IsIGxpc3QpID0+IHtcbiAgICAgIGxpc3QudW5zaGlmdCh7IG5hbWU6IG5wYXRoLCB0eXBlOiAnZCcgfSk7XG4gICAgICBsaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaXRlbS5kZXB0aCA9IHNwbGl0UGF0aHMoaXRlbS5uYW1lKS5sZW5ndGg7XG4gICAgICB9KTtcbiAgICAgIGxpc3Quc29ydChzb3J0RGVwdGgpO1xuXG4gICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgbGV0IGkgPSAtMTtcbiAgICAgIGxldCBzaXplID0gMDtcbiAgICAgIGxldCByZWFkID0gMDtcbiAgICAgIGxldCBwb29sO1xuXG4gICAgICBjb25zdCB0b3RhbCA9IGxpc3QubGVuZ3RoO1xuXG4gICAgICBjb25zdCBlID0gKCkgPT4ge1xuICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtlcnJvciwgbGlzdF0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgbiA9ICgpID0+IHtcbiAgICAgICAgKytpO1xuICAgICAgICBpZiAocG9vbCkgY2xlYXJJbnRlcnZhbChwb29sKTtcbiAgICAgICAgdHJ5QXBwbHkocHJvZ3Jlc3MsIG51bGwsIFtpIC8gdG90YWxdKTtcblxuICAgICAgICBjb25zdCBpdGVtID0gbGlzdC5zaGlmdCgpO1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT09ICd1bmRlZmluZWQnIHx8IGl0ZW0gPT09IG51bGwpIHJldHVybiBlKCk7XG5cbiAgICAgICAgY29uc3QgbkxvY2FsID0gdGhpcy5jbGllbnQudG9Mb2NhbChpdGVtLm5hbWUpO1xuXG4gICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdkJyB8fCBpdGVtLnR5cGUgPT09ICdsJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBGUy5tYWtlVHJlZVN5bmMobkxvY2FsKTtcbiAgICAgICAgICB9IGNhdGNoIChjZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChjZXJyb3IuY29kZSA9PT0gJ0VFWElTVCcpIHtcbiAgICAgICAgICAgICAgaXNFRVhJU1QoY2Vycm9yLnBhdGgsIChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgICAgIEZTLnJlbW92ZVN5bmMoY2Vycm9yLnBhdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0KG5wYXRoKTtcbiAgICAgICAgICAgICAgICAvLyBGUy5tYWtlVHJlZVN5bmMobkxvY2FsKTtcblxuICAgICAgICAgICAgICAgIG1vZGVsLnJlbW92ZU5vdGlmaWNhdGlvbigpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2l6ZSA9IDA7XG4gICAgICAgICAgcmVhZCA9IDA7XG5cbiAgICAgICAgICB0aGlzLm9uY2UoJzE1MCcsIChyZXBseSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RyID0gcmVwbHkubWF0Y2goLyhbMC05XSspXFxzKihieXRlcykvKTtcbiAgICAgICAgICAgIGlmIChzdHIpIHtcbiAgICAgICAgICAgICAgc2l6ZSA9IHBhcnNlSW50KHN0clsxXSwgMTApIHx8IC0xO1xuICAgICAgICAgICAgICBwb29sID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5mdHAgfHwgIXRoaXMuZnRwLl9wYXN2U29ja2V0KSByZXR1cm47XG4gICAgICAgICAgICAgICAgcmVhZCA9IHRoaXMuZnRwLl9wYXN2U29ja2V0LmJ5dGVzUmVhZDtcbiAgICAgICAgICAgICAgICB0cnlBcHBseShwcm9ncmVzcywgbnVsbCwgWyhpIC8gdG90YWwpICsgKHJlYWQgLyBzaXplIC8gdG90YWwpXSk7XG4gICAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLmZ0cC5nZXQoaXRlbS5uYW1lLCAoZ2V0RXJyb3IsIHN0cmVhbSkgPT4ge1xuICAgICAgICAgICAgaWYgKGdldEVycm9yKSB7XG4gICAgICAgICAgICAgIGVycm9yID0gZ2V0RXJyb3I7XG5cbiAgICAgICAgICAgICAgaWYgKC9QZXJtaXNzaW9uIGRlbmllZC8udGVzdChlcnJvcikpIHtcbiAgICAgICAgICAgICAgICBpc1Blcm1pc3Npb25EZW5pZWQoaXRlbS5uYW1lKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRlc3QgPSBGUy5jcmVhdGVXcml0ZVN0cmVhbShuTG9jYWwpO1xuXG4gICAgICAgICAgICBkZXN0Lm9uKCd1bnBpcGUnLCAoKSA9PiBuKCkpO1xuICAgICAgICAgICAgZGVzdC5vbignZXJyb3InLCAoKSA9PiBuKCkpO1xuXG4gICAgICAgICAgICBzdHJlYW0ucGlwZShkZXN0KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgICAgbigpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0KHBhdGgsIHJlY3Vyc2l2ZSwgY29tcGxldGVkLCBwcm9ncmVzcykge1xuICAgIGlmICghdGhpcy5faXNDb25uZWN0ZWRBcHBseShjb21wbGV0ZWQpKSByZXR1cm47XG5cbiAgICBjb25zdCBucGF0aCA9IFBhdGgucG9zaXgucmVzb2x2ZShwYXRoKTtcblxuICAgIHRoaXMudHlwZShucGF0aCwgKHR5cGUpID0+IHtcbiAgICAgIGlmICh0eXBlID09PSAnZicpIHtcbiAgICAgICAgdGhpcy5fZ2V0RmlsZShwYXRoLCBjb21wbGV0ZWQsIHByb2dyZXNzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2dldEZvbGRlcihwYXRoLCByZWN1cnNpdmUsIGNvbXBsZXRlZCwgcHJvZ3Jlc3MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHV0KHBhdGgsIGNvbXBsZXRlZCwgcHJvZ3Jlc3MpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ29ubmVjdGVkQXBwbHkoY29tcGxldGVkKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgcmVtb3RlID0gdGhpcy5jbGllbnQudG9SZW1vdGUocGF0aCk7XG5cbiAgICBpZiAoRlMuaXNGaWxlU3luYyhwYXRoKSkge1xuICAgICAgLy8gTk9URTogRmlsZVxuICAgICAgY29uc3Qgc3RhdHMgPSBGUy5zdGF0U3luYyhwYXRoKTtcbiAgICAgIGNvbnN0IHNpemUgPSBzdGF0cy5zaXplO1xuICAgICAgbGV0IHdyaXR0ZW4gPSAwO1xuXG4gICAgICBjb25zdCBlID0gKGVycikgPT4ge1xuICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtlcnIgfHwgbnVsbCwgW3sgbmFtZTogcGF0aCwgdHlwZTogJ2YnIH1dXSk7XG4gICAgICB9O1xuICAgICAgY29uc3QgcG9vbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmZ0cCB8fCAhdGhpcy5mdHAuX3Bhc3ZTb2NrZXQpIHJldHVybjtcbiAgICAgICAgd3JpdHRlbiA9IHRoaXMuZnRwLl9wYXN2U29ja2V0LmJ5dGVzV3JpdHRlbjtcbiAgICAgICAgdHJ5QXBwbHkocHJvZ3Jlc3MsIG51bGwsIFt3cml0dGVuIC8gc2l6ZV0pO1xuICAgICAgfSwgMjUwKTtcblxuICAgICAgdGhpcy5mdHAucHV0KHBhdGgsIHJlbW90ZSwgKGVycikgPT4ge1xuICAgICAgICBsZXQgZmF0YWwgPSBmYWxzZTtcblxuICAgICAgICBpZiAoL1Blcm1pc3Npb24gZGVuaWVkLy50ZXN0KGVycikpIHtcbiAgICAgICAgICBpc1Blcm1pc3Npb25EZW5pZWQocGF0aCk7XG4gICAgICAgICAgZmF0YWwgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiBlKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXJyICYmICFmYXRhbCkge1xuICAgICAgICAgIHRoaXMubWtkaXIoUGF0aC5kaXJuYW1lKHJlbW90ZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcL2csICcvJyksIHRydWUsICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5mdHAucHV0KHBhdGgsIHJlbW90ZSwgKHB1dEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBvb2wpIGNsZWFySW50ZXJ2YWwocG9vbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUocHV0RXJyb3IpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb29sKSBjbGVhckludGVydmFsKHBvb2wpO1xuICAgICAgICByZXR1cm4gZSgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5PVEU6IEZvbGRlclxuICAgICAgdHJhdmVyc2VUcmVlKHBhdGgsIChsaXN0KSA9PiB7XG4gICAgICAgIHRoaXMubWtkaXIocmVtb3RlLCB0cnVlLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGVycm9yO1xuICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgbGV0IHNpemUgPSAwO1xuICAgICAgICAgIGxldCB3cml0dGVuID0gMDtcblxuICAgICAgICAgIGNvbnN0IHRvdGFsID0gbGlzdC5sZW5ndGg7XG4gICAgICAgICAgY29uc3QgcG9vbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5mdHAgfHwgIXRoaXMuZnRwLl9wYXN2U29ja2V0KSByZXR1cm47XG4gICAgICAgICAgICB3cml0dGVuID0gdGhpcy5mdHAuX3Bhc3ZTb2NrZXQuYnl0ZXNXcml0dGVuO1xuICAgICAgICAgICAgdHJ5QXBwbHkocHJvZ3Jlc3MsIG51bGwsIFsoaSAvIHRvdGFsKSArICh3cml0dGVuIC8gc2l6ZSAvIHRvdGFsKV0pO1xuICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgICAgY29uc3QgZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChwb29sKSBjbGVhckludGVydmFsKHBvb2wpO1xuICAgICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyb3IsIGxpc3RdKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IG4gPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoKytpID49IGxpc3QubGVuZ3RoKSByZXR1cm4gZSgpO1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgICAgICBjb25zdCBuUmVtb3RlID0gdGhpcy5jbGllbnQudG9SZW1vdGUoaXRlbS5uYW1lKTtcbiAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdkJyB8fCBpdGVtLnR5cGUgPT09ICdsJykge1xuICAgICAgICAgICAgICB0aGlzLmZ0cC5ta2RpcihuUmVtb3RlLCAobWtkaXJFcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobWtkaXJFcnIpIGVycm9yID0gbWtkaXJFcnI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG4oKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBzdGF0cyA9IEZTLnN0YXRTeW5jKGl0ZW0ubmFtZSk7XG4gICAgICAgICAgICAgIHNpemUgPSBzdGF0cy5zaXplO1xuICAgICAgICAgICAgICB3cml0dGVuID0gMDtcbiAgICAgICAgICAgICAgdGhpcy5mdHAucHV0KGl0ZW0ubmFtZSwgblJlbW90ZSwgKHB1dEVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwdXRFcnIpIGVycm9yID0gcHV0RXJyO1xuICAgICAgICAgICAgICAgIHJldHVybiBuKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbWtkaXIocGF0aCwgcmVjdXJzaXZlLCBjb21wbGV0ZWQpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ29ubmVjdGVkQXBwbHkoY29tcGxldGVkKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgcmVtb3RlcyA9IHNwbGl0UGF0aHMocGF0aCk7XG4gICAgY29uc3QgZGlycyA9IFtgLyR7cmVtb3Rlcy5zbGljZSgwLCByZW1vdGVzLmxlbmd0aCkuam9pbignLycpfWBdO1xuICAgIGNvbnN0IGVuYWJsZVRyYW5zZmVyID0gYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLm5vdGlmaWNhdGlvbnMuZW5hYmxlVHJhbnNmZXInKTtcbiAgICBjb25zdCByZW1vdGVQYXRoID0gc3BsaXRQYXRocyh0aGlzLmNsaWVudC5pbmZvLnJlbW90ZSk7XG5cbiAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICBmb3IgKGxldCBhID0gcmVtb3Rlcy5sZW5ndGggLSAxOyBhID4gMDsgLS1hKSB7XG4gICAgICAgIC8vIE9ic2VydmUgdGhlIHNwZWNpZmllZCBwYXRoXG4gICAgICAgIGNvbnN0IHNSZW1vdGUgPSBgLyR7cmVtb3RlUGF0aC5zbGljZSgwLCBhKS5qb2luKCcvJyl9YDtcbiAgICAgICAgY29uc3QgcFJlbW90ZSA9IGAvJHtyZW1vdGVzLnNsaWNlKDAsIGEpLmpvaW4oJy8nKX1gO1xuXG4gICAgICAgIGlmIChzUmVtb3RlICE9PSBwUmVtb3RlKSB7XG4gICAgICAgICAgZGlycy51bnNoaWZ0KGAvJHtyZW1vdGVzLnNsaWNlKDAsIGEpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG4gPSAoKSA9PiB7XG4gICAgICBjb25zdCBkaXIgPSBkaXJzLnNoaWZ0KCk7XG4gICAgICBjb25zdCBsYXN0ID0gZGlycy5sZW5ndGggPT09IDA7XG5cbiAgICAgIHRoaXMuZnRwLmxpc3QoZGlyLCBmYWxzZSwgKGVyckxpc3QsIGxpc3QpID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGNvbnN0IGRpck5hbWUgPSBwYXRoLnNwbGl0KCcvJykucG9wKCk7XG4gICAgICAgICAgY29uc3QgZm9sZGVycyA9IGxpc3QuZmlsdGVyKG8gPT4gby50eXBlID09PSAnZCcgfHwgby50eXBlID09PSAnbCcpO1xuICAgICAgICAgIGNvbnN0IGRpck5hbWVzID0gZm9sZGVycy5tYXAobyA9PiBvLm5hbWUpO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBsaXN0ICE9PSAndW5kZWZpbmVkJyAmJiBkaXJOYW1lcy5pbmRleE9mKGRpck5hbWUpID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2Vyckxpc3QgfHwgbnVsbF0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG4oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZ0cC5ta2RpcihkaXIsIChlcnIpID0+IHtcbiAgICAgICAgICBpZiAobGFzdCkge1xuICAgICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyIHx8IG51bGxdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG4oKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIG4oKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbWtmaWxlKHBhdGgsIGNvbXBsZXRlZCkge1xuICAgIGlmICghdGhpcy5faXNDb25uZWN0ZWRBcHBseShjb21wbGV0ZWQpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBsb2NhbCA9IHRoaXMuY2xpZW50LnRvTG9jYWwocGF0aCk7XG4gICAgY29uc3QgZW1wdHkgPSBuZXcgQnVmZmVyKCcnLCAndXRmOCcpO1xuICAgIGNvbnN0IGVuYWJsZVRyYW5zZmVyID0gYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLm5vdGlmaWNhdGlvbnMuZW5hYmxlVHJhbnNmZXInKTtcblxuICAgIHRoaXMuZnRwLmxpc3QocGF0aCwgZmFsc2UsIChsaXN0RXJyLCBsaXN0KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGxpc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gbGlzdC5maWx0ZXIobyA9PiBvLnR5cGUgPT09ICctJyk7XG5cbiAgICAgICAgLy8gRmlsZSBleGlzdHNcbiAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgIGlmIChlbmFibGVUcmFuc2ZlcikgaXNBbHJlYWR5RXhpdHMocGF0aCwgJ2ZpbGUnKTtcblxuICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2xpc3RFcnJdKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5mdHAucHV0KGVtcHR5LCBwYXRoLCAocHV0RXJyKSA9PiB7XG4gICAgICAgIGlmIChwdXRFcnIpIHtcbiAgICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtwdXRFcnJdKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBGUy5tYWtlVHJlZVN5bmMoUGF0aC5kaXJuYW1lKGxvY2FsKSk7XG4gICAgICAgIEZTLndyaXRlRmlsZShsb2NhbCwgZW1wdHksIChlcnIyKSA9PiB7XG4gICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyMl0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZW5hbWUoc291cmNlLCBkZXN0LCBjb21wbGV0ZWQpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ29ubmVjdGVkQXBwbHkoY29tcGxldGVkKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5mdHAucmVuYW1lKHNvdXJjZSwgZGVzdCwgKGVycikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICB0cnlBcHBseShjb21wbGV0ZWQsIG51bGwsIFtlcnJdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEZTLnJlbmFtZSh0aGlzLmNsaWVudC50b0xvY2FsKHNvdXJjZSksIHRoaXMuY2xpZW50LnRvTG9jYWwoZGVzdCksIChyRXJyKSA9PiB7XG4gICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbckVycl0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2l0ZShjb21tYW5kLCBjb21wbGV0ZWQpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ29ubmVjdGVkQXBwbHkoY29tcGxldGVkKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy5mdHAuc2l0ZShjb21tYW5kLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2Vycl0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkZWxldGUocGF0aCwgY29tcGxldGVkKSB7XG4gICAgaWYgKCF0aGlzLl9pc0Nvbm5lY3RlZEFwcGx5KGNvbXBsZXRlZCkpIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMudHlwZShwYXRoLCAodHlwZSkgPT4ge1xuICAgICAgaWYgKHR5cGUgPT09ICdmJykge1xuICAgICAgICAvLyBOT1RFOiBGaWxlXG4gICAgICAgIHRoaXMuZnRwLmRlbGV0ZShwYXRoLCAoZXJyKSA9PiB7XG4gICAgICAgICAgdHJ5QXBwbHkoY29tcGxldGVkLCBudWxsLCBbZXJyLCBbeyBuYW1lOiBwYXRoLCB0eXBlOiAnZicgfV1dKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOT1RFOiBGb2xkZXJcbiAgICAgICAgdGhpcy5saXN0KHBhdGgsIHRydWUsIChlcnIsIGxpc3QpID0+IHtcbiAgICAgICAgICBsaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGl0ZW0uZGVwdGggPSBzcGxpdFBhdGhzKGl0ZW0ubmFtZSkubGVuZ3RoO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxpc3Quc29ydChzaW1wbGVTb3J0RGVwdGgpO1xuXG4gICAgICAgICAgbGV0IGRvbmUgPSAwO1xuXG4gICAgICAgICAgY29uc3QgZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZnRwLnJtZGlyKHBhdGgsIChlRXJyKSA9PiB7XG4gICAgICAgICAgICAgIHRyeUFwcGx5KGNvbXBsZXRlZCwgbnVsbCwgW2VFcnIsIGxpc3RdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgICAgbGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICArK2RvbmU7XG4gICAgICAgICAgICBjb25zdCBmbiA9IGl0ZW0udHlwZSA9PT0gJ2QnIHx8IGl0ZW0udHlwZSA9PT0gJ2wnID8gJ3JtZGlyJyA6ICdkZWxldGUnO1xuICAgICAgICAgICAgdGhpcy5mdHBbZm5dKGl0ZW0ubmFtZSwgKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoLS1kb25lID09PSAwKSByZXR1cm4gZSgpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkgZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ29ubmVjdG9yRlRQO1xuIl19