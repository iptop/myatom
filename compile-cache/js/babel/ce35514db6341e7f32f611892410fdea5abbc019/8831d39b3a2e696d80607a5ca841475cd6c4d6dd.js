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

var _ssh2 = require('ssh2');

var _ssh22 = _interopRequireDefault(_ssh2);

var _connector = require('../connector');

var _connector2 = _interopRequireDefault(_connector);

var _helpers = require('../helpers');

'use babel';

var ConnectorSFTP = (function (_Connector) {
  _inherits(ConnectorSFTP, _Connector);

  function ConnectorSFTP() {
    _classCallCheck(this, ConnectorSFTP);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _get(Object.getPrototypeOf(ConnectorSFTP.prototype), 'constructor', this).apply(this, args);

    this.ssh2 = null;
    this.sftp = null;
    this.status = 'disconnected';
  }

  _createClass(ConnectorSFTP, [{
    key: 'isConnected',
    value: function isConnected() {
      var self = this;

      return self.status !== 'disconnected' && self.sftp;
    }
  }, {
    key: 'connect',
    value: function connect(info, completed) {
      var self = this;

      self.info = info;
      self.info.debug = true;
      self.customFilePermissions = self.info.filePermissions;

      var debug = self.info.debug;
      var connectInfo = Object.assign({}, self.info);

      delete connectInfo.filePermissions;

      self.status = 'connecting';

      self.ssh2 = new _ssh22['default']();

      self.ssh2.on('banner', function (msg) {
        self.emit('greeting', msg);
      });

      self.ssh2.on('ready', function () {
        self.ssh2.sftp(function (err, sftp) {
          if (err) {
            self.disconnect();
            return;
          }

          if (self.info.remoteShell) {
            self.emit('openingShell', self.info.remoteShell);

            self.ssh2.shell(function (shellErr, stream) {
              if (shellErr) {
                self.emit('error', shellErr);
                self.disconnect();
                return;
              }

              stream.end(self.info.remoteShell + '\nexit\n');
            });
          }

          if (self.info.remoteCommand) {
            self.emit('executingCommand', self.info.remoteCommand);

            self.ssh2.exec(self.info.remoteCommand, function (remoteErr) {
              if (remoteErr) {
                self.emit('error', remoteErr);
                self.disconnect();
              }
            });
          }

          self.status = 'connected';

          self.sftp = sftp;
          self.sftp.on('end', function () {
            self.disconnect();
            self.emit('ended');
          });

          self.emit('connected');

          if (typeof completed === 'function') {
            completed.apply(self, []);
          }
        });
      });

      self.ssh2.on('end', function () {
        self.disconnect();
        self.emit('ended');
      });

      self.ssh2.on('close', function () {
        self.disconnect();
        self.emit('closed');
      });

      self.ssh2.on('error', function (err) {
        self.emit('error', err);
      });

      self.ssh2.on('debug', function (str) {
        if (typeof debug === 'function') {
          debug.apply(undefined, [str]);
        }
      });

      self.ssh2.on('keyboard-interactive', function (name, instructions, instructionsLang, prompts, finish) {
        finish([self.info.verifyCode]);
      });

      try {
        self.ssh2.connect(connectInfo);
      } catch (err) {
        atom.notifications.addError('SFTP connection attempt failed', {
          detail: err,
          dismissable: true
        });
      }

      return self;
    }
  }, {
    key: 'disconnect',
    value: function disconnect(completed) {
      var self = this;

      self.status = 'disconnected';

      if (self.sftp) {
        self.sftp.end();
        self.sftp = null;
      }

      if (self.ssh2) {
        self.ssh2.end();
        self.ssh2 = null;
      }

      if (typeof completed === 'function') {
        completed.apply(undefined, []);
      }

      return self;
    }
  }, {
    key: 'abort',
    value: function abort(completed) {
      // TODO find a way to abort current operation

      if (typeof completed === 'function') {
        completed.apply(undefined, []);
      }

      return this;
    }
  }, {
    key: 'list',
    value: function list(path, recursive, completed) {
      var self = this;

      if (!self.isConnected()) {
        if (typeof completed === 'function') completed.apply(undefined, ['Not connected']);
        return;
      }

      var list = [];
      var digg = 0;

      var callCompleted = function callCompleted() {
        if (typeof completed === 'function') completed.apply(undefined, [null, list]);
      };

      var oneDirCompleted = function oneDirCompleted() {
        if (--digg === 0) callCompleted();
      };

      var listDir = function listDir(listPath) {
        digg++;

        if (digg > 500) {
          console.log('recursion depth over 500!');
        }

        self.sftp.readdir(listPath, function (err, li) {
          if (err) return callCompleted();
          var filesLeft = li.length;

          if (filesLeft === 0) return callCompleted();

          li.forEach(function (item) {
            // symlinks
            if (item.attrs.isSymbolicLink()) {
              (function () {
                // NOTE: we only follow one symlink down here!
                // symlink -> symlink -> file won't work!
                var fname = _path2['default'].join(listPath, item.filename).replace(/\\/g, '/');

                self.sftp.realpath(fname, function (realPatherr, target) {
                  if (realPatherr) {
                    atom.notifications.addError('Could not call realpath for symlink', {
                      detail: realPatherr,
                      dismissable: false
                    });

                    if (--filesLeft === 0) oneDirCompleted();

                    return;
                  }

                  self.sftp.stat(target, function (statErr, stats) {
                    if (statErr) {
                      atom.notifications.addError('Could not correctly resolve symlink', {
                        detail: fname + ' -> ' + target,
                        dismissable: false
                      });

                      if (--filesLeft === 0) oneDirCompleted();

                      return;
                    }

                    var entry = {
                      name: fname,
                      type: stats.isFile() ? 'f' : 'd',
                      size: stats.size,
                      date: new Date()
                    };

                    entry.date.setTime(stats.mtime * 1000);
                    list.push(entry);

                    if (recursive && entry.type === 'd') listDir(entry.name);
                    if (--filesLeft === 0) oneDirCompleted();
                  });
                });

                // regular files & dirs
              })();
            } else {
                var entry = {
                  name: _path2['default'].join(path, item.filename).replace(/\\/g, '/'),
                  type: item.attrs.isFile() ? 'f' : 'd',
                  size: item.attrs.size,
                  date: new Date()
                };

                entry.date.setTime(item.attrs.mtime * 1000);
                list.push(entry);

                if (recursive && entry.type === 'd') listDir(entry.name);
                if (--filesLeft === 0) oneDirCompleted();
              }
          });

          return true;
        });
      };

      listDir(path);
    }
  }, {
    key: 'get',
    value: function get(path, recursive, completed, progress, symlinkPath) {
      var self = this;
      var local = self.client.toLocal(symlinkPath || path);

      if (!self.isConnected()) {
        if (typeof completed === 'function') completed.apply(undefined, ['Not connected']);
        return;
      }

      self.sftp.lstat(path, function (err, stats) {
        if (err) {
          if (typeof completed === 'function') completed.apply(undefined, [err]);
          return;
        }

        if (stats.isSymbolicLink()) {
          self.sftp.realpath(path, function (realPatherr, target) {
            if (realPatherr) {
              if (typeof completed === 'function') completed.apply(undefined, [realPatherr]);
              return;
            }

            self.get(target, recursive, completed, progress, path);
          });
        } else if (stats.isFile()) {
          // File
          _fsPlus2['default'].makeTreeSync(_path2['default'].dirname(local));

          self.sftp.fastGet(path, local, {
            step: function step(read, chunk, size) {
              if (typeof progress === 'function') {
                progress.apply(undefined, [read / size]);
              }
            }
          }, function (fastGetErr) {
            if (typeof completed === 'function') {
              completed.apply(undefined, [fastGetErr]);
            }
          });
        } else {
          // Directory
          self.list(path, recursive, function (listErr, list) {
            list.unshift({ name: path, type: 'd' });

            list.forEach(function (item) {
              item.depth = item.name.replace(/^\/+/, '').replace(/\/+$/).split('/').length;
            });

            list.sort(function (a, b) {
              if (a.depth === b.depth) return 0;
              return a.depth > b.depth ? 1 : -1;
            });

            var error = null;
            var total = list.length;
            var i = -1;
            var e = function e() {
              if (typeof completed === 'function') {
                completed.apply(undefined, [error, list]);
              }
            };

            var n = function n() {
              ++i;
              if (typeof progress === 'function') {
                progress.apply(undefined, [i / total]);
              }

              var item = list.shift();

              if (typeof item === 'undefined' || item === null) {
                return e();
              }

              var toLocal = self.client.toLocal(item.name);

              if (item.type === 'd' || item.type === 'l') {
                // mkdirp(toLocal, function (err) {
                _fsPlus2['default'].makeTree(toLocal, function (treeErr) {
                  if (treeErr) {
                    error = treeErr;
                  }

                  return n();
                });
              } else {
                self.sftp.fastGet(item.name, toLocal, {
                  step: function step(read, chunk, size) {
                    if (typeof progress === 'function') {
                      progress.apply(undefined, [i / total + read / size / total]);
                    }
                  }
                }, function (fastGetErr) {
                  if (fastGetErr) {
                    error = fastGetErr;
                  }

                  return n();
                });
              }
              return true;
            };
            n();
          });
        }
      });
    }
  }, {
    key: 'put',
    value: function put(path, completed, progress) {
      var self = this;
      var remote = self.client.toRemote(path);

      function put(obj) {
        // Possibly deconstruct in coffee script? If thats a thing??
        var localPath = obj.localPath;
        var remotePath = obj.remotePath;
        var e = obj.e; // callback
        var i = obj.i;
        var total = obj.total;

        self.sftp.stat(remotePath, function (err, attrs) {
          var options = {};

          if (self.customFilePermissions) {
            // overwrite permissions when filePermissions option set
            options.mode = parseInt(self.customFilePermissions, 8);
          } else if (err) {
            // using the default 0644
            options.mode = 420;
          } else {
            // using the original permissions from the remote
            options.mode = attrs.mode;
          }

          var readStream = _fsPlus2['default'].createReadStream(localPath);
          var writeStream = self.sftp.createWriteStream(remotePath, options);
          var fileSize = _fsPlus2['default'].statSync(localPath).size; // used for setting progress bar

          var totalRead = 0; // used for setting progress bar

          function applyProgress() {
            if (typeof progress !== 'function') return;
            if (total != null && i != null) {
              progress.apply(undefined, [i / total + totalRead / fileSize / total]);
            } else {
              progress.apply(undefined, [totalRead / fileSize]);
            }
          }

          writeStream.on('finish', function () {
            applyProgress(); // completes the progress bar

            return e();
          }).on('error', function (writeErr) {
            var hasProp = Object.prototype.hasOwnProperty.call(obj, 'err');

            if (!hasProp && (err.message === 'No such file' || err.message === 'NO_SUCH_FILE')) {
              self.mkdir(_path2['default'].dirname(remote).replace(/\\/g, '/'), true, function (dirErr) {
                if (dirErr) {
                  var error = err.message || dirErr;

                  atom.notifications.addError('Remote FTP: Upload Error ' + error, {
                    dismissable: false
                  });

                  return dirErr;
                }

                put(Object.assign({}, obj, { dirErr: dirErr }));

                return true;
              });
            } else {
              var error = err.message || writeErr;

              atom.notifications.addError('Remote FTP: Upload Error ' + error, {
                dismissable: false
              });
            }
          });

          readStream.on('data', function (chunk) {
            totalRead += chunk.length;

            if (totalRead === fileSize) return; // let writeStream.on("finish") complete the progress bar

            applyProgress();
          });

          readStream.pipe(writeStream);
        });
      }

      if (self.isConnected()) {
        // File
        if (_fsPlus2['default'].isFileSync(path)) {
          var e = function e(err) {
            if (typeof completed === 'function') {
              completed.apply(undefined, [err || null, [{ name: path, type: 'f' }]]);
            }
          };

          put({
            localPath: path,
            remotePath: remote,
            e: e
          });
        } else {
          // Folder
          (0, _helpers.traverseTree)(path, function (list) {
            self.mkdir(remote, true, function () {
              var error = undefined;
              var i = -1;
              var total = list.length;
              var e = function e() {
                if (typeof completed === 'function') {
                  completed.apply(undefined, [error, list]);
                }
              };
              var n = function n() {
                if (++i >= list.length) return e();

                var item = list[i];
                var toRemote = self.client.toRemote(item.name);

                if (item.type === 'd' || item.type === 'l') {
                  self.sftp.mkdir(toRemote, {}, function (travDirerr) {
                    if (travDirerr) {
                      error = travDirerr;
                    }
                    return n();
                  });
                } else {
                  put({
                    localPath: item.name,
                    remotePath: toRemote,
                    i: i,
                    total: total,
                    e: function e(putErr) {
                      if (putErr) error = putErr;

                      return n();
                    }
                  });
                }

                return true;
              };
              return n();
            });
          });
        }
      } else if (typeof completed === 'function') {
        completed.apply(undefined, ['Not connected']);
      }

      return self;
    }
  }, {
    key: 'mkdir',
    value: function mkdir(path, recursive, completed) {
      var self = this;
      var remotes = path.replace(/^\/+/, '').replace(/\/+$/, '').split('/');
      var dirs = ['/' + remotes.slice(0, remotes.length).join('/')];

      if (self.isConnected()) {
        (function () {
          if (recursive) {
            for (var a = remotes.length - 1; a > 0; --a) {
              dirs.unshift('/' + remotes.slice(0, a).join('/'));
            }
          }

          var n = function n() {
            var dir = dirs.shift();
            var last = dirs.length === 0;

            self.sftp.mkdir(dir, {}, function (err) {
              if (last) {
                if (typeof completed === 'function') {
                  completed.apply(undefined, [err || null]);
                }
              } else {
                return n();
              }

              return true;
            });
          };
          n();
        })();
      } else if (typeof completed === 'function') {
        completed.apply(undefined, ['Not connected']);
      }

      return self;
    }
  }, {
    key: 'mkfile',
    value: function mkfile(path, completed) {
      var self = this;
      var local = self.client.toLocal(path);
      var empty = new Buffer('', 'utf8');

      if (self.isConnected()) {
        self.sftp.open(path, 'w', {}, function (err, handle) {
          if (err) {
            if (typeof completed === 'function') {
              completed.apply(undefined, [err]);
            }
            return;
          }

          self.sftp.write(handle, empty, 0, 0, 0, function (writeErr) {
            if (writeErr) {
              if (typeof completed === 'function') {
                completed.apply(undefined, [writeErr]);
              }
              return;
            }

            // mkdirp(Path.dirname(local), function (err1) {
            _fsPlus2['default'].makeTree(_path2['default'].dirname(local), function (err1) {
              _fsPlus2['default'].writeFile(local, empty, function (err2) {
                if (typeof completed === 'function') {
                  completed.apply(undefined, [err1 || err2]);
                }
              });
            });
          });
        });
      } else if (typeof completed === 'function') {
        completed.apply(undefined, ['Not connected']);
      }

      return self;
    }
  }, {
    key: 'rename',
    value: function rename(source, dest, completed) {
      var self = this;

      if (self.isConnected()) {
        self.sftp.rename(source, dest, function (err) {
          if (err) {
            if (typeof completed === 'function') {
              completed.apply(undefined, [err]);
            }
          } else {
            _fsPlus2['default'].rename(self.client.toLocal(source), self.client.toLocal(dest), function (localErr) {
              if (typeof completed === 'function') {
                completed.apply(undefined, [localErr]);
              }
            });
          }
        });
      } else if (typeof completed === 'function') {
        completed.apply(undefined, ['Not connected']);
      }

      return self;
    }
  }, {
    key: 'delete',
    value: function _delete(path, completed) {
      var self = this;

      if (self.isConnected()) {
        self.sftp.stat(path, function (err, stats) {
          if (err) {
            if (typeof completed === 'function') completed.apply(undefined, [err]);
            return;
          }

          if (stats.isSymbolicLink()) {
            self.sftp.realpath(path, function (realPathErr, target) {
              if (realPathErr) {
                if (typeof completed === 'function') completed.apply(undefined, [realPathErr]);

                return;
              }

              self['delete'](target, completed);
            });
          } else if (stats.isFile()) {
            // File
            self.sftp.unlink(path, function (unlinkErr) {
              if (typeof completed === 'function') {
                completed.apply(undefined, [unlinkErr, [{ name: path, type: 'f' }]]);
              }
            });
          } else {
            // Directory
            self.list(path, true, function (listErr, list) {
              list.forEach(function (item) {
                item.depth = item.name.replace(/^\/+/, '').replace(/\/+$/).split('/').length;
              });
              list.sort(function (a, b) {
                if (a.depth === b.depth) {
                  return 0;
                }
                return a.depth > b.depth ? -1 : 1;
              });

              var done = 0;

              var e = function e() {
                self.sftp.rmdir(path, function (rmdirErr) {
                  if (typeof completed === 'function') {
                    completed.apply(undefined, [rmdirErr, list]);
                  }
                });
              };

              list.forEach(function (item) {
                ++done;
                var fn = item.type === 'd' || item.type === 'l' ? 'rmdir' : 'unlink';
                self.sftp[fn](item.name, function () {
                  if (--done === 0) ;

                  return e();
                });
              });

              if (list.length === 0) ;

              e();
            });
          }
        });
      } else if (typeof completed === 'function') {
        completed.apply(undefined, ['Not connected']);
      }

      return self;
    }
  }]);

  return ConnectorSFTP;
})(_connector2['default']);

exports['default'] = ConnectorSFTP;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9jb25uZWN0b3JzL3NmdHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRWUsU0FBUzs7OztvQkFDUCxNQUFNOzs7O29CQUNOLE1BQU07Ozs7eUJBQ0QsY0FBYzs7Ozt1QkFDUCxZQUFZOztBQU56QyxXQUFXLENBQUM7O0lBUU4sYUFBYTtZQUFiLGFBQWE7O0FBQ04sV0FEUCxhQUFhLEdBQ0k7MEJBRGpCLGFBQWE7O3NDQUNGLElBQUk7QUFBSixVQUFJOzs7QUFDakIsK0JBRkUsYUFBYSw4Q0FFTixJQUFJLEVBQUU7O0FBRWYsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7R0FDOUI7O2VBUEcsYUFBYTs7V0FTTix1QkFBRztBQUNaLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsYUFBTyxJQUFJLENBQUMsTUFBTSxLQUFLLGNBQWMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ3BEOzs7V0FFTSxpQkFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO0FBQ3ZCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQzs7QUFFdkQsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDOUIsVUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FB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UmVtb3RlLUZUUC9saWIvY29ubmVjdG9ycy9zZnRwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBGUyBmcm9tICdmcy1wbHVzJztcbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFNTSDIgZnJvbSAnc3NoMic7XG5pbXBvcnQgQ29ubmVjdG9yIGZyb20gJy4uL2Nvbm5lY3Rvcic7XG5pbXBvcnQgeyB0cmF2ZXJzZVRyZWUgfSBmcm9tICcuLi9oZWxwZXJzJztcblxuY2xhc3MgQ29ubmVjdG9yU0ZUUCBleHRlbmRzIENvbm5lY3RvciB7XG4gIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKTtcblxuICAgIHRoaXMuc3NoMiA9IG51bGw7XG4gICAgdGhpcy5zZnRwID0gbnVsbDtcbiAgICB0aGlzLnN0YXR1cyA9ICdkaXNjb25uZWN0ZWQnO1xuICB9XG5cbiAgaXNDb25uZWN0ZWQoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gc2VsZi5zdGF0dXMgIT09ICdkaXNjb25uZWN0ZWQnICYmIHNlbGYuc2Z0cDtcbiAgfVxuXG4gIGNvbm5lY3QoaW5mbywgY29tcGxldGVkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLmluZm8gPSBpbmZvO1xuICAgIHNlbGYuaW5mby5kZWJ1ZyA9IHRydWU7XG4gICAgc2VsZi5jdXN0b21GaWxlUGVybWlzc2lvbnMgPSBzZWxmLmluZm8uZmlsZVBlcm1pc3Npb25zO1xuXG4gICAgY29uc3QgZGVidWcgPSBzZWxmLmluZm8uZGVidWc7XG4gICAgY29uc3QgY29ubmVjdEluZm8gPSBPYmplY3QuYXNzaWduKHt9LCBzZWxmLmluZm8pO1xuXG4gICAgZGVsZXRlIGNvbm5lY3RJbmZvLmZpbGVQZXJtaXNzaW9ucztcblxuICAgIHNlbGYuc3RhdHVzID0gJ2Nvbm5lY3RpbmcnO1xuXG4gICAgc2VsZi5zc2gyID0gbmV3IFNTSDIoKTtcblxuICAgIHNlbGYuc3NoMi5vbignYmFubmVyJywgKG1zZykgPT4ge1xuICAgICAgc2VsZi5lbWl0KCdncmVldGluZycsIG1zZyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnNzaDIub24oJ3JlYWR5JywgKCkgPT4ge1xuICAgICAgc2VsZi5zc2gyLnNmdHAoKGVyciwgc2Z0cCkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgc2VsZi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuaW5mby5yZW1vdGVTaGVsbCkge1xuICAgICAgICAgIHNlbGYuZW1pdCgnb3BlbmluZ1NoZWxsJywgc2VsZi5pbmZvLnJlbW90ZVNoZWxsKTtcblxuICAgICAgICAgIHNlbGYuc3NoMi5zaGVsbCgoc2hlbGxFcnIsIHN0cmVhbSkgPT4ge1xuICAgICAgICAgICAgaWYgKHNoZWxsRXJyKSB7XG4gICAgICAgICAgICAgIHNlbGYuZW1pdCgnZXJyb3InLCBzaGVsbEVycik7XG4gICAgICAgICAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0cmVhbS5lbmQoYCR7c2VsZi5pbmZvLnJlbW90ZVNoZWxsfVxcbmV4aXRcXG5gKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLmluZm8ucmVtb3RlQ29tbWFuZCkge1xuICAgICAgICAgIHNlbGYuZW1pdCgnZXhlY3V0aW5nQ29tbWFuZCcsIHNlbGYuaW5mby5yZW1vdGVDb21tYW5kKTtcblxuICAgICAgICAgIHNlbGYuc3NoMi5leGVjKHNlbGYuaW5mby5yZW1vdGVDb21tYW5kLCAocmVtb3RlRXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVtb3RlRXJyKSB7XG4gICAgICAgICAgICAgIHNlbGYuZW1pdCgnZXJyb3InLCByZW1vdGVFcnIpO1xuICAgICAgICAgICAgICBzZWxmLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuc3RhdHVzID0gJ2Nvbm5lY3RlZCc7XG5cbiAgICAgICAgc2VsZi5zZnRwID0gc2Z0cDtcbiAgICAgICAgc2VsZi5zZnRwLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgc2VsZi5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgc2VsZi5lbWl0KCdlbmRlZCcpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLmVtaXQoJ2Nvbm5lY3RlZCcpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29tcGxldGVkLmFwcGx5KHNlbGYsIFtdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnNzaDIub24oJ2VuZCcsICgpID0+IHtcbiAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgICAgc2VsZi5lbWl0KCdlbmRlZCcpO1xuICAgIH0pO1xuXG4gICAgc2VsZi5zc2gyLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgICAgc2VsZi5lbWl0KCdjbG9zZWQnKTtcbiAgICB9KTtcblxuICAgIHNlbGYuc3NoMi5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgICBzZWxmLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICB9KTtcblxuICAgIHNlbGYuc3NoMi5vbignZGVidWcnLCAoc3RyKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGRlYnVnID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlYnVnKC4uLltzdHJdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNlbGYuc3NoMi5vbigna2V5Ym9hcmQtaW50ZXJhY3RpdmUnLCAobmFtZSwgaW5zdHJ1Y3Rpb25zLCBpbnN0cnVjdGlvbnNMYW5nLCBwcm9tcHRzLCBmaW5pc2gpID0+IHtcbiAgICAgIGZpbmlzaChbc2VsZi5pbmZvLnZlcmlmeUNvZGVdKTtcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICBzZWxmLnNzaDIuY29ubmVjdChjb25uZWN0SW5mbyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1NGVFAgY29ubmVjdGlvbiBhdHRlbXB0IGZhaWxlZCcsIHtcbiAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICBkaXNjb25uZWN0KGNvbXBsZXRlZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgc2VsZi5zdGF0dXMgPSAnZGlzY29ubmVjdGVkJztcblxuICAgIGlmIChzZWxmLnNmdHApIHtcbiAgICAgIHNlbGYuc2Z0cC5lbmQoKTtcbiAgICAgIHNlbGYuc2Z0cCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuc3NoMikge1xuICAgICAgc2VsZi5zc2gyLmVuZCgpO1xuICAgICAgc2VsZi5zc2gyID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcGxldGVkKC4uLltdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIGFib3J0KGNvbXBsZXRlZCkge1xuICAgIC8vIFRPRE8gZmluZCBhIHdheSB0byBhYm9ydCBjdXJyZW50IG9wZXJhdGlvblxuXG4gICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBsZXRlZCguLi5bXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0KHBhdGgsIHJlY3Vyc2l2ZSwgY29tcGxldGVkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIGNvbXBsZXRlZCguLi5bJ05vdCBjb25uZWN0ZWQnXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdCA9IFtdO1xuICAgIGxldCBkaWdnID0gMDtcblxuICAgIGNvbnN0IGNhbGxDb21wbGV0ZWQgPSAoKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykgY29tcGxldGVkKC4uLltudWxsLCBsaXN0XSk7XG4gICAgfTtcblxuICAgIGNvbnN0IG9uZURpckNvbXBsZXRlZCA9ICgpID0+IHtcbiAgICAgIGlmICgtLWRpZ2cgPT09IDApIGNhbGxDb21wbGV0ZWQoKTtcbiAgICB9O1xuXG4gICAgY29uc3QgbGlzdERpciA9IChsaXN0UGF0aCkgPT4ge1xuICAgICAgZGlnZysrO1xuXG4gICAgICBpZiAoZGlnZyA+IDUwMCkge1xuICAgICAgICBjb25zb2xlLmxvZygncmVjdXJzaW9uIGRlcHRoIG92ZXIgNTAwIScpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLnNmdHAucmVhZGRpcihsaXN0UGF0aCwgKGVyciwgbGkpID0+IHtcbiAgICAgICAgaWYgKGVycikgcmV0dXJuIGNhbGxDb21wbGV0ZWQoKTtcbiAgICAgICAgbGV0IGZpbGVzTGVmdCA9IGxpLmxlbmd0aDtcblxuICAgICAgICBpZiAoZmlsZXNMZWZ0ID09PSAwKSByZXR1cm4gY2FsbENvbXBsZXRlZCgpO1xuXG4gICAgICAgIGxpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAvLyBzeW1saW5rc1xuICAgICAgICAgIGlmIChpdGVtLmF0dHJzLmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IHdlIG9ubHkgZm9sbG93IG9uZSBzeW1saW5rIGRvd24gaGVyZSFcbiAgICAgICAgICAgIC8vIHN5bWxpbmsgLT4gc3ltbGluayAtPiBmaWxlIHdvbid0IHdvcmshXG4gICAgICAgICAgICBjb25zdCBmbmFtZSA9IFBhdGguam9pbihsaXN0UGF0aCwgaXRlbS5maWxlbmFtZSkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4gICAgICAgICAgICBzZWxmLnNmdHAucmVhbHBhdGgoZm5hbWUsIChyZWFsUGF0aGVyciwgdGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChyZWFsUGF0aGVycikge1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IGNhbGwgcmVhbHBhdGggZm9yIHN5bWxpbmsnLCB7XG4gICAgICAgICAgICAgICAgICBkZXRhaWw6IHJlYWxQYXRoZXJyLFxuICAgICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKC0tZmlsZXNMZWZ0ID09PSAwKSBvbmVEaXJDb21wbGV0ZWQoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbGYuc2Z0cC5zdGF0KHRhcmdldCwgKHN0YXRFcnIsIHN0YXRzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRFcnIpIHtcbiAgICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IGNvcnJlY3RseSByZXNvbHZlIHN5bWxpbmsnLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDogYCR7Zm5hbWV9IC0+ICR7dGFyZ2V0fWAsXG4gICAgICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoLS1maWxlc0xlZnQgPT09IDApIG9uZURpckNvbXBsZXRlZCgpO1xuXG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBmbmFtZSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IHN0YXRzLmlzRmlsZSgpID8gJ2YnIDogJ2QnLFxuICAgICAgICAgICAgICAgICAgc2l6ZTogc3RhdHMuc2l6ZSxcbiAgICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGVudHJ5LmRhdGUuc2V0VGltZShzdGF0cy5tdGltZSAqIDEwMDApO1xuICAgICAgICAgICAgICAgIGxpc3QucHVzaChlbnRyeSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVjdXJzaXZlICYmIGVudHJ5LnR5cGUgPT09ICdkJykgbGlzdERpcihlbnRyeS5uYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoLS1maWxlc0xlZnQgPT09IDApIG9uZURpckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyByZWd1bGFyIGZpbGVzICYgZGlyc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlbnRyeSA9IHtcbiAgICAgICAgICAgICAgbmFtZTogUGF0aC5qb2luKHBhdGgsIGl0ZW0uZmlsZW5hbWUpLnJlcGxhY2UoL1xcXFwvZywgJy8nKSxcbiAgICAgICAgICAgICAgdHlwZTogaXRlbS5hdHRycy5pc0ZpbGUoKSA/ICdmJyA6ICdkJyxcbiAgICAgICAgICAgICAgc2l6ZTogaXRlbS5hdHRycy5zaXplLFxuICAgICAgICAgICAgICBkYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZW50cnkuZGF0ZS5zZXRUaW1lKGl0ZW0uYXR0cnMubXRpbWUgKiAxMDAwKTtcbiAgICAgICAgICAgIGxpc3QucHVzaChlbnRyeSk7XG5cbiAgICAgICAgICAgIGlmIChyZWN1cnNpdmUgJiYgZW50cnkudHlwZSA9PT0gJ2QnKSBsaXN0RGlyKGVudHJ5Lm5hbWUpO1xuICAgICAgICAgICAgaWYgKC0tZmlsZXNMZWZ0ID09PSAwKSBvbmVEaXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGxpc3REaXIocGF0aCk7XG4gIH1cblxuICBnZXQocGF0aCwgcmVjdXJzaXZlLCBjb21wbGV0ZWQsIHByb2dyZXNzLCBzeW1saW5rUGF0aCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGxvY2FsID0gc2VsZi5jbGllbnQudG9Mb2NhbChzeW1saW5rUGF0aCB8fCBwYXRoKTtcblxuICAgIGlmICghc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykgY29tcGxldGVkKC4uLlsnTm90IGNvbm5lY3RlZCddKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLnNmdHAubHN0YXQocGF0aCwgKGVyciwgc3RhdHMpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIGNvbXBsZXRlZCguLi5bZXJyXSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRzLmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgICAgc2VsZi5zZnRwLnJlYWxwYXRoKHBhdGgsIChyZWFsUGF0aGVyciwgdGFyZ2V0KSA9PiB7XG4gICAgICAgICAgaWYgKHJlYWxQYXRoZXJyKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykgY29tcGxldGVkKC4uLltyZWFsUGF0aGVycl0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuZ2V0KHRhcmdldCwgcmVjdXJzaXZlLCBjb21wbGV0ZWQsIHByb2dyZXNzLCBwYXRoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgIC8vIEZpbGVcbiAgICAgICAgRlMubWFrZVRyZWVTeW5jKFBhdGguZGlybmFtZShsb2NhbCkpO1xuXG4gICAgICAgIHNlbGYuc2Z0cC5mYXN0R2V0KHBhdGgsIGxvY2FsLCB7XG4gICAgICAgICAgc3RlcChyZWFkLCBjaHVuaywgc2l6ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykgeyBwcm9ncmVzcyguLi5bcmVhZCAvIHNpemVdKTsgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sIChmYXN0R2V0RXJyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIHsgY29tcGxldGVkKC4uLltmYXN0R2V0RXJyXSk7IH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBEaXJlY3RvcnlcbiAgICAgICAgc2VsZi5saXN0KHBhdGgsIHJlY3Vyc2l2ZSwgKGxpc3RFcnIsIGxpc3QpID0+IHtcbiAgICAgICAgICBsaXN0LnVuc2hpZnQoeyBuYW1lOiBwYXRoLCB0eXBlOiAnZCcgfSk7XG5cbiAgICAgICAgICBsaXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGl0ZW0uZGVwdGggPSBpdGVtLm5hbWUucmVwbGFjZSgvXlxcLysvLCAnJykucmVwbGFjZSgvXFwvKyQvKS5zcGxpdCgnLycpLmxlbmd0aDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGxpc3Quc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGEuZGVwdGggPT09IGIuZGVwdGgpIHJldHVybiAwO1xuICAgICAgICAgICAgcmV0dXJuIGEuZGVwdGggPiBiLmRlcHRoID8gMSA6IC0xO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgICBjb25zdCB0b3RhbCA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgY29uc3QgZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7IGNvbXBsZXRlZCguLi5bZXJyb3IsIGxpc3RdKTsgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zdCBuID0gKCkgPT4ge1xuICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykgeyBwcm9ncmVzcyguLi5baSAvIHRvdGFsXSk7IH1cblxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3Quc2hpZnQoKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAndW5kZWZpbmVkJyB8fCBpdGVtID09PSBudWxsKSB7IHJldHVybiBlKCk7IH1cblxuICAgICAgICAgICAgY29uc3QgdG9Mb2NhbCA9IHNlbGYuY2xpZW50LnRvTG9jYWwoaXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ2QnIHx8IGl0ZW0udHlwZSA9PT0gJ2wnKSB7XG4gICAgICAgICAgICAgIC8vIG1rZGlycCh0b0xvY2FsLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgIEZTLm1ha2VUcmVlKHRvTG9jYWwsICh0cmVlRXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRyZWVFcnIpIHsgZXJyb3IgPSB0cmVlRXJyOyB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGYuc2Z0cC5mYXN0R2V0KGl0ZW0ubmFtZSwgdG9Mb2NhbCwge1xuICAgICAgICAgICAgICAgIHN0ZXAocmVhZCwgY2h1bmssIHNpemUpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MoLi4uWyhpIC8gdG90YWwpICsgKHJlYWQgLyBzaXplIC8gdG90YWwpXSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSwgKGZhc3RHZXRFcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZmFzdEdldEVycikgeyBlcnJvciA9IGZhc3RHZXRFcnI7IH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBuKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBuKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHV0KHBhdGgsIGNvbXBsZXRlZCwgcHJvZ3Jlc3MpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCByZW1vdGUgPSBzZWxmLmNsaWVudC50b1JlbW90ZShwYXRoKTtcblxuICAgIGZ1bmN0aW9uIHB1dChvYmopIHtcbiAgICAgIC8vIFBvc3NpYmx5IGRlY29uc3RydWN0IGluIGNvZmZlZSBzY3JpcHQ/IElmIHRoYXRzIGEgdGhpbmc/P1xuICAgICAgY29uc3QgbG9jYWxQYXRoID0gb2JqLmxvY2FsUGF0aDtcbiAgICAgIGNvbnN0IHJlbW90ZVBhdGggPSBvYmoucmVtb3RlUGF0aDtcbiAgICAgIGNvbnN0IGUgPSBvYmouZTsgLy8gY2FsbGJhY2tcbiAgICAgIGNvbnN0IGkgPSBvYmouaTtcbiAgICAgIGNvbnN0IHRvdGFsID0gb2JqLnRvdGFsO1xuXG4gICAgICBzZWxmLnNmdHAuc3RhdChyZW1vdGVQYXRoLCAoZXJyLCBhdHRycykgPT4ge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge307XG5cbiAgICAgICAgaWYgKHNlbGYuY3VzdG9tRmlsZVBlcm1pc3Npb25zKSB7XG4gICAgICAgICAgLy8gb3ZlcndyaXRlIHBlcm1pc3Npb25zIHdoZW4gZmlsZVBlcm1pc3Npb25zIG9wdGlvbiBzZXRcbiAgICAgICAgICBvcHRpb25zLm1vZGUgPSBwYXJzZUludChzZWxmLmN1c3RvbUZpbGVQZXJtaXNzaW9ucywgOCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gdXNpbmcgdGhlIGRlZmF1bHQgMDY0NFxuICAgICAgICAgIG9wdGlvbnMubW9kZSA9IDBvMDY0NDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyB1c2luZyB0aGUgb3JpZ2luYWwgcGVybWlzc2lvbnMgZnJvbSB0aGUgcmVtb3RlXG4gICAgICAgICAgb3B0aW9ucy5tb2RlID0gYXR0cnMubW9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlYWRTdHJlYW0gPSBGUy5jcmVhdGVSZWFkU3RyZWFtKGxvY2FsUGF0aCk7XG4gICAgICAgIGNvbnN0IHdyaXRlU3RyZWFtID0gc2VsZi5zZnRwLmNyZWF0ZVdyaXRlU3RyZWFtKHJlbW90ZVBhdGgsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBmaWxlU2l6ZSA9IEZTLnN0YXRTeW5jKGxvY2FsUGF0aCkuc2l6ZTsgLy8gdXNlZCBmb3Igc2V0dGluZyBwcm9ncmVzcyBiYXJcblxuICAgICAgICBsZXQgdG90YWxSZWFkID0gMDsgLy8gdXNlZCBmb3Igc2V0dGluZyBwcm9ncmVzcyBiYXJcblxuICAgICAgICBmdW5jdGlvbiBhcHBseVByb2dyZXNzKCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgcHJvZ3Jlc3MgIT09ICdmdW5jdGlvbicpIHJldHVybjtcbiAgICAgICAgICBpZiAodG90YWwgIT0gbnVsbCAmJiBpICE9IG51bGwpIHtcbiAgICAgICAgICAgIHByb2dyZXNzKC4uLlsoaSAvIHRvdGFsKSArICh0b3RhbFJlYWQgLyBmaWxlU2l6ZSAvIHRvdGFsKV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9ncmVzcyguLi5bdG90YWxSZWFkIC8gZmlsZVNpemVdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3cml0ZVN0cmVhbVxuICAgICAgICAgIC5vbignZmluaXNoJywgKCkgPT4ge1xuICAgICAgICAgICAgYXBwbHlQcm9ncmVzcygpOyAvLyBjb21wbGV0ZXMgdGhlIHByb2dyZXNzIGJhclxuXG4gICAgICAgICAgICByZXR1cm4gZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9uKCdlcnJvcicsICh3cml0ZUVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGFzUHJvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosICdlcnInKTtcblxuICAgICAgICAgICAgaWYgKCFoYXNQcm9wICYmIChlcnIubWVzc2FnZSA9PT0gJ05vIHN1Y2ggZmlsZScgfHwgZXJyLm1lc3NhZ2UgPT09ICdOT19TVUNIX0ZJTEUnKSkge1xuICAgICAgICAgICAgICBzZWxmLm1rZGlyKFBhdGguZGlybmFtZShyZW1vdGUpLnJlcGxhY2UoL1xcXFwvZywgJy8nKSwgdHJ1ZSwgKGRpckVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaXJFcnIpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyLm1lc3NhZ2UgfHwgZGlyRXJyO1xuXG4gICAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6IFVwbG9hZCBFcnJvciAke2Vycm9yfWAsIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJFcnI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcHV0KE9iamVjdC5hc3NpZ24oe30sIG9iaiwgeyBkaXJFcnIgfSkpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnIubWVzc2FnZSB8fCB3cml0ZUVycjtcblxuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6IFVwbG9hZCBFcnJvciAke2Vycm9yfWAsIHtcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJlYWRTdHJlYW1cbiAgICAgICAgICAub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcbiAgICAgICAgICAgIHRvdGFsUmVhZCArPSBjaHVuay5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmICh0b3RhbFJlYWQgPT09IGZpbGVTaXplKSByZXR1cm47IC8vIGxldCB3cml0ZVN0cmVhbS5vbihcImZpbmlzaFwiKSBjb21wbGV0ZSB0aGUgcHJvZ3Jlc3MgYmFyXG5cbiAgICAgICAgICAgIGFwcGx5UHJvZ3Jlc3MoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICByZWFkU3RyZWFtLnBpcGUod3JpdGVTdHJlYW0pO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAvLyBGaWxlXG4gICAgICBpZiAoRlMuaXNGaWxlU3luYyhwYXRoKSkge1xuICAgICAgICBjb25zdCBlID0gKGVycikgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb21wbGV0ZWQoLi4uW2VyciB8fCBudWxsLCBbeyBuYW1lOiBwYXRoLCB0eXBlOiAnZicgfV1dKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcHV0KHtcbiAgICAgICAgICBsb2NhbFBhdGg6IHBhdGgsXG4gICAgICAgICAgcmVtb3RlUGF0aDogcmVtb3RlLFxuICAgICAgICAgIGUsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHsgLy8gRm9sZGVyXG4gICAgICAgIHRyYXZlcnNlVHJlZShwYXRoLCAobGlzdCkgPT4ge1xuICAgICAgICAgIHNlbGYubWtkaXIocmVtb3RlLCB0cnVlLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXJyb3I7XG4gICAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgICAgY29uc3QgdG90YWwgPSBsaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0IGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7IGNvbXBsZXRlZCguLi5bZXJyb3IsIGxpc3RdKTsgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IG4gPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICgrK2kgPj0gbGlzdC5sZW5ndGgpIHJldHVybiBlKCk7XG5cbiAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgICAgICAgIGNvbnN0IHRvUmVtb3RlID0gc2VsZi5jbGllbnQudG9SZW1vdGUoaXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnZCcgfHwgaXRlbS50eXBlID09PSAnbCcpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNmdHAubWtkaXIodG9SZW1vdGUsIHt9LCAodHJhdkRpcmVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKHRyYXZEaXJlcnIpIHsgZXJyb3IgPSB0cmF2RGlyZXJyOyB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHB1dCh7XG4gICAgICAgICAgICAgICAgICBsb2NhbFBhdGg6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgIHJlbW90ZVBhdGg6IHRvUmVtb3RlLFxuICAgICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAgIHRvdGFsLFxuICAgICAgICAgICAgICAgICAgZShwdXRFcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB1dEVycikgZXJyb3IgPSBwdXRFcnI7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG4oKTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gbigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBsZXRlZCguLi5bJ05vdCBjb25uZWN0ZWQnXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICBta2RpcihwYXRoLCByZWN1cnNpdmUsIGNvbXBsZXRlZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHJlbW90ZXMgPSBwYXRoLnJlcGxhY2UoL15cXC8rLywgJycpLnJlcGxhY2UoL1xcLyskLywgJycpLnNwbGl0KCcvJyk7XG4gICAgY29uc3QgZGlycyA9IFtgLyR7cmVtb3Rlcy5zbGljZSgwLCByZW1vdGVzLmxlbmd0aCkuam9pbignLycpfWBdO1xuXG4gICAgaWYgKHNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgICBmb3IgKGxldCBhID0gcmVtb3Rlcy5sZW5ndGggLSAxOyBhID4gMDsgLS1hKSB7XG4gICAgICAgICAgZGlycy51bnNoaWZ0KGAvJHtyZW1vdGVzLnNsaWNlKDAsIGEpLmpvaW4oJy8nKX1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBuID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBkaXIgPSBkaXJzLnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBkaXJzLmxlbmd0aCA9PT0gMDtcblxuICAgICAgICBzZWxmLnNmdHAubWtkaXIoZGlyLCB7fSwgKGVycikgPT4ge1xuICAgICAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICBjb21wbGV0ZWQoLi4uW2VyciB8fCBudWxsXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIG4oKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBsZXRlZCguLi5bJ05vdCBjb25uZWN0ZWQnXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICBta2ZpbGUocGF0aCwgY29tcGxldGVkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgbG9jYWwgPSBzZWxmLmNsaWVudC50b0xvY2FsKHBhdGgpO1xuICAgIGNvbnN0IGVtcHR5ID0gbmV3IEJ1ZmZlcignJywgJ3V0ZjgnKTtcblxuICAgIGlmIChzZWxmLmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgIHNlbGYuc2Z0cC5vcGVuKHBhdGgsICd3Jywge30sIChlcnIsIGhhbmRsZSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIHsgY29tcGxldGVkKC4uLltlcnJdKTsgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuc2Z0cC53cml0ZShoYW5kbGUsIGVtcHR5LCAwLCAwLCAwLCAod3JpdGVFcnIpID0+IHtcbiAgICAgICAgICBpZiAod3JpdGVFcnIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7IGNvbXBsZXRlZCguLi5bd3JpdGVFcnJdKTsgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIG1rZGlycChQYXRoLmRpcm5hbWUobG9jYWwpLCBmdW5jdGlvbiAoZXJyMSkge1xuICAgICAgICAgIEZTLm1ha2VUcmVlKFBhdGguZGlybmFtZShsb2NhbCksIChlcnIxKSA9PiB7XG4gICAgICAgICAgICBGUy53cml0ZUZpbGUobG9jYWwsIGVtcHR5LCAoZXJyMikgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZCguLi5bZXJyMSB8fCBlcnIyXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcGxldGVkKC4uLlsnTm90IGNvbm5lY3RlZCddKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIHJlbmFtZShzb3VyY2UsIGRlc3QsIGNvbXBsZXRlZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgc2VsZi5zZnRwLnJlbmFtZShzb3VyY2UsIGRlc3QsIChlcnIpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7IGNvbXBsZXRlZCguLi5bZXJyXSk7IH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBGUy5yZW5hbWUoc2VsZi5jbGllbnQudG9Mb2NhbChzb3VyY2UpLCBzZWxmLmNsaWVudC50b0xvY2FsKGRlc3QpLCAobG9jYWxFcnIpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7IGNvbXBsZXRlZCguLi5bbG9jYWxFcnJdKTsgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBsZXRlZCguLi5bJ05vdCBjb25uZWN0ZWQnXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICBkZWxldGUocGF0aCwgY29tcGxldGVkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICBzZWxmLnNmdHAuc3RhdChwYXRoLCAoZXJyLCBzdGF0cykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIGNvbXBsZXRlZCguLi5bZXJyXSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXRzLmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgICAgICBzZWxmLnNmdHAucmVhbHBhdGgocGF0aCwgKHJlYWxQYXRoRXJyLCB0YXJnZXQpID0+IHtcbiAgICAgICAgICAgIGlmIChyZWFsUGF0aEVycikge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykgY29tcGxldGVkKC4uLltyZWFsUGF0aEVycl0pO1xuXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5kZWxldGUodGFyZ2V0LCBjb21wbGV0ZWQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRmlsZSgpKSB7XG4gICAgICAgICAgLy8gRmlsZVxuICAgICAgICAgIHNlbGYuc2Z0cC51bmxpbmsocGF0aCwgKHVubGlua0VycikgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21wbGV0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgY29tcGxldGVkKC4uLlt1bmxpbmtFcnIsIFt7IG5hbWU6IHBhdGgsIHR5cGU6ICdmJyB9XV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIERpcmVjdG9yeVxuICAgICAgICAgIHNlbGYubGlzdChwYXRoLCB0cnVlLCAobGlzdEVyciwgbGlzdCkgPT4ge1xuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7IGl0ZW0uZGVwdGggPSBpdGVtLm5hbWUucmVwbGFjZSgvXlxcLysvLCAnJykucmVwbGFjZSgvXFwvKyQvKS5zcGxpdCgnLycpLmxlbmd0aDsgfSk7XG4gICAgICAgICAgICBsaXN0LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGEuZGVwdGggPT09IGIuZGVwdGgpIHsgcmV0dXJuIDA7IH1cbiAgICAgICAgICAgICAgcmV0dXJuIGEuZGVwdGggPiBiLmRlcHRoID8gLTEgOiAxO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBkb25lID0gMDtcblxuICAgICAgICAgICAgY29uc3QgZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgc2VsZi5zZnRwLnJtZGlyKHBhdGgsIChybWRpckVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29tcGxldGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICBjb21wbGV0ZWQoLi4uW3JtZGlyRXJyLCBsaXN0XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICArK2RvbmU7XG4gICAgICAgICAgICAgIGNvbnN0IGZuID0gaXRlbS50eXBlID09PSAnZCcgfHwgaXRlbS50eXBlID09PSAnbCcgPyAncm1kaXInIDogJ3VubGluayc7XG4gICAgICAgICAgICAgIHNlbGYuc2Z0cFtmbl0oaXRlbS5uYW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKC0tZG9uZSA9PT0gMCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDApO1xuXG4gICAgICAgICAgICBlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbXBsZXRlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcGxldGVkKC4uLlsnTm90IGNvbm5lY3RlZCddKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb25uZWN0b3JTRlRQO1xuIl19