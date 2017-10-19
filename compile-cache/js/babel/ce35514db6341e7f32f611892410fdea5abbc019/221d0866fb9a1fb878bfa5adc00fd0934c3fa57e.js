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

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _events = require('events');

var _stripJsonComments = require('strip-json-comments');

var _stripJsonComments2 = _interopRequireDefault(_stripJsonComments);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _ignore = require('ignore');

var _ignore2 = _interopRequireDefault(_ignore);

var _sshConfig = require('ssh-config');

var _sshConfig2 = _interopRequireDefault(_sshConfig);

var _helpers = require('./helpers');

var _directory = require('./directory');

var _directory2 = _interopRequireDefault(_directory);

var _progress = require('./progress');

var _progress2 = _interopRequireDefault(_progress);

var _connectorsFtp = require('./connectors/ftp');

var _connectorsFtp2 = _interopRequireDefault(_connectorsFtp);

var _connectorsSftp = require('./connectors/sftp');

var _connectorsSftp2 = _interopRequireDefault(_connectorsSftp);

var _dialogsPromptPassDialog = require('./dialogs/prompt-pass-dialog');

var _dialogsPromptPassDialog2 = _interopRequireDefault(_dialogsPromptPassDialog);

'use babel';

var SSH2_ALGORITHMS = require('ssh2-streams').constants.ALGORITHMS;

var atom = global.atom;

exports['default'] = (function INIT() {
  var Client = (function (_EventEmitter) {
    _inherits(Client, _EventEmitter);

    function Client() {
      _classCallCheck(this, Client);

      _get(Object.getPrototypeOf(Client.prototype), 'constructor', this).call(this);

      this.subscriptions = new _atom.CompositeDisposable();

      var self = this;
      self.info = null;
      self.connector = null;
      self.current = null;
      self.queue = [];

      self.ignoreBaseName = '.ftpignore';
      self.ignoreFile = null;
      self.ignoreFilter = false;

      self.root = new _directory2['default']({
        name: '/',
        path: '/',
        client: this,
        isExpanded: true
      });

      self.status = 'NOT_CONNECTED'; // Options NOT_CONNECTED, CONNECTING, CONNECTED

      self.watch = {
        watcher: null,
        files: [],
        addListeners: function addListeners() {
          var watchData = (0, _helpers.getObject)({
            keys: ['info', 'watch'],
            obj: self
          });
          if (watchData === null || watchData === false) return;
          if (typeof watchData === 'string') watchData = [watchData];

          if (!Array.isArray(watchData) || watchData.length === 0) return;

          var dir = self.getProjectPath();

          var watchDataFormatted = watchData.map(function (watch) {
            return _path2['default'].normalize(dir + '/' + watch);
          });
          // console.log(JSON.stringify(watchDataFormatted));

          var watcher = _chokidar2['default'].watch(watchDataFormatted, {
            ignored: /(^|[/\\])\../,
            persistent: true
          });

          watcher.on('change', function (path) {
            self.watch.queueUpload.apply(self, [path]);
            if (atom.config.get('Remote-FTP.notifications.enableWatchFileChange')) {
              atom.notifications.addInfo('Remote FTP: Change detected in: ' + path, {
                dismissable: false
              });
            }
          });

          self.files = watchDataFormatted.slice();

          atom.notifications.addInfo('Remote FTP: Added watch listeners', {
            dismissable: false
          });
          self.watcher = watcher;
        },
        removeListeners: function removeListeners() {
          if (self.watcher != null) {
            self.watcher.close();
            atom.notifications.addInfo('Remote FTP: Stopped watch listeners', {
              dismissable: false
            });
          }
        },
        queue: {},
        queueUpload: function queueUpload(fileName) {
          var timeoutDuration = isNaN(parseInt(self.info.watchTimeout, 10)) === true ? 500 : parseInt(self.info.watchTimeout, 10);

          function scheduleUpload(file) {
            self.watch.queue[file] = setTimeout(function () {
              self.upload(file, function () {});
            }, timeoutDuration);
          }

          if (self.watch.queue[fileName] !== null) {
            clearTimeout(self.watch.queue[fileName]);
            self.watch.queue[fileName] = null;
          }

          scheduleUpload(fileName);
        }

      };

      self.watch.addListeners = self.watch.addListeners.bind(self);
      self.watch.removeListeners = self.watch.removeListeners.bind(self);

      self.on('connected', self.watch.addListeners);
      self.on('disconnected', self.watch.removeListeners);

      self.events();
    }

    _createClass(Client, [{
      key: 'events',
      value: function events() {
        var self = this;

        this.subscriptions.add(atom.config.onDidChange('Remote-FTP.dev.debugResponse', function (values) {
          self.watchDebug(values.newValue);
        }), atom.config.onDidChange('Remote-FTP.tree.showProjectName', function () {
          self.setProjectName();
        }));
      }
    }, {
      key: 'setProjectName',
      value: function setProjectName() {
        var self = this;
        var projectRoot = atom.config.get('Remote-FTP.tree.showProjectName');
        var $rootName = (0, _atomSpacePenViews.$)('.ftptree-view .project-root > .header span');

        var rootName = '/';

        if (typeof self.info[projectRoot] !== 'undefined') {
          rootName = self.info[projectRoot];
        }

        self.root.name = rootName;
        $rootName.text(rootName);
      }
    }, {
      key: 'readConfig',
      value: function readConfig(callback) {
        var self = this;
        var error = function error(err) {
          if (typeof callback === 'function') callback.apply(self, [err]);
        };
        self.info = null;
        self.ftpConfigPath = self.getConfigPath();

        if (self.ftpConfigPath === false) throw new Error('Remote FTP: getConfigPath returned false, but expected a string');

        _fsPlus2['default'].readFile(self.ftpConfigPath, 'utf8', function (err, res) {
          if (err) return error(err);

          var data = (0, _stripJsonComments2['default'])(res);
          var json = null;
          if ((0, _helpers.validateConfig)(data)) {
            try {
              json = JSON.parse(data);

              self.info = json;
              self.root.name = '';
              self.root.path = '/' + self.info.remote.replace(/^\/+/, '');

              if (self.info.privatekey) {
                self.info.privatekey = (0, _helpers.resolveHome)(self.info.privatekey);
              }

              self.setProjectName();
            } catch (e) {
              atom.notifications.addError('Could not process `.ftpconfig`', {
                detail: e,
                dismissable: false
              });
            }
          }
          if (json !== null && typeof callback === 'function') {
            var ssconfigPath = atom.config.get('Remote-FTP.connector.sshConfigPath');

            if (ssconfigPath && self.info.protocol === 'sftp') {
              var configPath = _path2['default'].normalize(ssconfigPath.replace('~', _os2['default'].homedir()));

              _fsPlus2['default'].readFile(configPath, 'utf8', function (fileErr, conf) {
                if (fileErr) return error(fileErr);

                var config = _sshConfig2['default'].parse(conf);

                var section = config.find({
                  Host: self.info.host
                });

                if (section !== null) {
                  (function () {
                    var mapping = new Map([['HostName', 'host'], ['Port', 'port'], ['User', 'user'], ['IdentityFile', 'privatekey'], ['ServerAliveInterval', 'keepalive'], ['ConnectTimeout', 'connTimeout']]);

                    section.config.forEach(function (line) {
                      self.info[mapping.get(line.param)] = line.value;
                    });
                  })();
                }

                return callback.apply(self, [err, self.info]);
              });
            } else {
              callback.apply(self, [err, json]);
            }
          }

          return true;
        });
      }
    }, {
      key: 'getFilePath',
      value: function getFilePath(relativePath) {
        var self = this;
        var projectPath = self.getProjectPath();
        if (projectPath === false) return false;
        return _path2['default'].resolve(projectPath, relativePath);
      }
    }, {
      key: 'getProjectPath',
      value: function getProjectPath() {
        var self = this;
        var projectPath = null;

        if ((0, _helpers.multipleHostsEnabled)() === true) {
          var $selectedDir = (0, _atomSpacePenViews.$)('.tree-view .selected');
          var $currentProject = $selectedDir.hasClass('project-root') ? $selectedDir : $selectedDir.closest('.project-root');
          projectPath = $currentProject.find('> .header span.name').data('path');
        } else {
          var firstDirectory = atom.project.getDirectories()[0];
          if (firstDirectory != null) projectPath = firstDirectory.path;
        }

        if (projectPath != null) {
          self.projectPath = projectPath;
          return projectPath;
        }
        atom.notifications.addError('Remote FTP: Could not get project path', {
          dismissable: false, // Want user to report error so don't let them close it
          detail: 'Please report this error if it occurs. Multiple Hosts is ' + (0, _helpers.multipleHostsEnabled)()
        });
        return false;
      }
    }, {
      key: 'getConfigPath',
      value: function getConfigPath() {
        if (!_helpers.hasProject) return false;

        return this.getFilePath('./.ftpconfig');
      }
    }, {
      key: 'updateIgnore',
      value: function updateIgnore() {
        var self = this;

        if (!self.ignoreFile) {
          self.ignorePath = self.getFilePath(self.ignoreBaseName);
          self.ignoreFile = new _atom.File(self.ignorePath);
        }

        if (!self.ignoreFile.existsSync()) {
          self.ignoreFilter = false;
          return false;
        }

        if (self.ignoreFile.getBaseName() === self.ignoreBaseName) {
          self.ignoreFilter = (0, _ignore2['default'])().add(self.ignoreFile.readSync(true));
          return true;
        }

        return false;
      }
    }, {
      key: 'checkIgnore',
      value: function checkIgnore(local) {
        var self = this;
        var haseIgnore = true;

        if (!self.ignoreFilter) {
          haseIgnore = self.updateIgnore();
        }

        if (haseIgnore && self.ignoreFilter && self.ignoreFilter.ignores(local)) {
          return true;
        }

        return false;
      }
    }, {
      key: 'isConnected',
      value: function isConnected() {
        var self = this;
        return self.connector && self.connector.isConnected();
      }
    }, {
      key: 'onceConnected',
      value: function onceConnected(onconnect) {
        var self = this;
        if (self.connector && self.connector.isConnected()) {
          onconnect.apply(self);
          return true;
        } else if (typeof onconnect === 'function') {
          if (self.status === 'NOT_CONNECTED') {
            self.status = 'CONNECTING';
            self.readConfig(function (err) {
              if (err !== null) {
                self.status = 'NOT_CONNECTED';
                // NOTE: Remove notification as it will just say there
                // is no ftpconfig if none in directory all the time
                // atom.notifications.addError("Remote FTP: " + err);
                return;
              }
              self.connect(true);
            });
          }

          self.once('connected', onconnect);
          return false;
        }
        console.warn('Remote-FTP: Not connected and typeof onconnect is ' + typeof onconnect);
        return false;
      }
    }, {
      key: 'connect',
      value: function connect(reconnect) {
        if (reconnect !== true) this.disconnect();
        if (this.isConnected()) return;
        if (!this.info) return;
        if (this.info.promptForPass === true) {
          this.promptForPass();
        } else if (this.info.keyboardInteractive === true) {
          this.promptForKeyboardInteractive();
        } else {
          this.doConnect();
        }
      }
    }, {
      key: 'doConnect',
      value: function doConnect() {
        var self = this;

        atom.notifications.addInfo('Remote FTP: Connecting...', {
          dismissable: false
        });

        var info = undefined;
        switch (self.info.protocol) {
          case 'ftp':
            {
              info = {
                host: self.info.host || '',
                port: self.info.port || 21,
                user: self.info.user || '',
                password: self.info.pass || '',
                secure: self.info.secure || '',
                secureOptions: self.info.secureOptions || '',
                connTimeout: self.info.timeout || 10000,
                pasvTimeout: self.info.timeout || 10000,
                keepalive: self.info.keepalive === undefined ? 10000 : self.info.keepalive, // long version, because 0 is a valid value
                debug: function debug(str) {
                  var log = str.match(/^\[connection\] (>|<) '(.*?)(\\r\\n)?'$/);
                  if (!log) return;
                  if (log[2].match(/^PASS /)) log[2] = 'PASS ******';
                  self.emit('debug', log[1] + ' ' + log[2]);
                }
              };
              self.connector = new _connectorsFtp2['default'](self);
              break;
            }

          case 'sftp':
            {
              info = {
                host: self.info.host || '',
                port: self.info.port || 21,
                username: self.info.user || '',
                readyTimeout: self.info.connTimeout || 10000,
                keepaliveInterval: self.info.keepalive || 10000,
                verifyCode: self.info.verifyCode || ''
              };

              if (self.info.pass) info.password = self.info.pass;

              if (self.info.privatekey) {
                self.info.privatekey = (0, _helpers.resolveHome)(self.info.privatekey);

                try {
                  var pk = _fsPlus2['default'].readFileSync(self.info.privatekey);
                  info.privateKey = pk;
                } catch (err) {
                  atom.notifications.addError('Remote FTP: Could not read privateKey file', {
                    detail: err,
                    dismissable: true
                  });
                }
              }

              if (self.info.passphrase) info.passphrase = self.info.passphrase;

              if (self.info.agent) info.agent = self.info.agent;

              if (self.info.agent === 'env') info.agent = process.env.SSH_AUTH_SOCK;

              if (self.info.hosthash) info.hostHash = self.info.hosthash;

              if (self.info.ignorehost) {
                // NOTE: hostVerifier doesn't run at all if it's not a function.
                // Allows you to skip hostHash option in ssh2 0.5+
                info.hostVerifier = false;
              }

              info.algorithms = {
                kex: SSH2_ALGORITHMS.SUPPORTED_KEX,
                cipher: SSH2_ALGORITHMS.SUPPORTED_CIPHER,
                serverHostKey: SSH2_ALGORITHMS.SUPPORTED_SERVER_HOST_KEY,
                hmac: SSH2_ALGORITHMS.SUPPORTED_HMAC,
                compress: SSH2_ALGORITHMS.SUPPORTED_COMPRESS
              };

              info.filePermissions = self.info.filePermissions;
              info.remoteCommand = self.info.remoteCommand;
              info.remoteShell = self.info.remoteShell;
              if (self.info.keyboardInteractive) info.tryKeyboard = true;

              self.connector = new _connectorsSftp2['default'](self);
              break;
            }

          default:
            throw new Error('No `protocol` found in connection credential. Please recreate .ftpconfig file from Packages -> Remote-FTP -> Create (S)FTP config file.');
        }

        self.connector.connect(info, function () {
          if (self.root.status !== 1) self.root.open();
          self.status = 'CONNECTED';
          self.emit('connected');

          atom.notifications.addSuccess('Remote FTP: Connected', {
            dismissable: false
          });
        });

        self.connector.on('closed', function (action) {
          self.disconnect();
          self.status = 'NOT_CONNECTED';
          self.emit('closed');
          atom.notifications.addInfo('Remote FTP: Connection closed', {
            dismissable: false
          });

          if (action === 'RECONNECT') {
            self.connect(true);
          }
        });

        self.connector.on('ended', function () {
          self.emit('ended');
        });

        self.connector.on('error', function (err, code) {
          if (code === 421 || code === 'ECONNRESET') return;
          atom.notifications.addError('Remote FTP: Connection failed', {
            detail: err,
            dismissable: false
          });
        });

        self.watchDebug(atom.config.get('Remote-FTP.dev.debugResponse'));
      }
    }, {
      key: 'watchDebug',
      value: function watchDebug(isWatching) {
        this.removeListener('debug', _helpers.logger);

        if (isWatching) {
          this.on('debug', _helpers.logger);
        } else {
          this.removeListener('debug', _helpers.logger);
        }
      }
    }, {
      key: 'disconnect',
      value: function disconnect() {
        var self = this;

        if (self.connector) {
          self.connector.disconnect();
          delete self.connector;
          self.connector = null;
        }

        if (self.root) {
          self.root.status = 0;
          self.root.destroy();
        }

        self.watch.removeListeners.apply(self);

        self.current = null;
        self.queue = [];

        self.emit('disconnected');
        self.status = 'NOT_CONNECTED';

        return self;
      }
    }, {
      key: 'toRemote',
      value: function toRemote(local) {
        var self = this;

        return _path2['default'].join(self.info.remote, atom.project.relativize(local)).replace(/\\/g, '/');
      }
    }, {
      key: 'toLocal',
      value: function toLocal(remote) {
        var self = this;
        var projectPath = self.getProjectPath();
        var remoteLength = self.info.remote.length;

        if (projectPath === false) return false;
        if (typeof remote !== 'string') {
          throw new Error('Remote FTP: remote must be a string, was passed ' + typeof remote);
        }

        var path = null;
        if (remoteLength > 1) {
          path = './' + remote.substr(self.info.remote.length);
        } else {
          path = './' + remote;
        }

        return _path2['default'].resolve(projectPath, './' + path.replace(/^\/+/, ''));
      }
    }, {
      key: '_next',
      value: function _next() {
        var self = this;

        if (!self.isConnected()) return;

        self.current = self.queue.shift();

        if (self.current) self.current[1].apply(self, [self.current[2]]);

        atom.project.remoteftp.emit('queue-changed');
      }
    }, {
      key: '_enqueue',
      value: function _enqueue(func, desc) {
        var self = this;
        var progress = new _progress2['default']();

        self.queue.push([desc, func, progress]);
        if (self.queue.length === 1 && !self.current) self._next();else self.emit('queue-changed');

        return progress;
      }
    }, {
      key: 'abort',
      value: function abort() {
        var self = this;

        if (self.isConnected()) {
          self.connector.abort(function () {
            self._next();
          });
        }

        return self;
      }
    }, {
      key: 'abortAll',
      value: function abortAll() {
        var self = this;

        self.current = null;
        self.queue = [];

        if (self.isConnected()) {
          self.connector.abort();
        }

        self.emit('queue-changed');

        return self;
      }
    }, {
      key: 'list',
      value: function list(remote, recursive, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.list(remote, recursive, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Listing ' + (recursive ? 'recursively ' : '') + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'download',
      value: function download(remote, recursive, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function (progress) {
            self.connector.get(remote, recursive, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            }, function (percent) {
              progress.setProgress(percent);
            });
          }, 'Downloading ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'upload',
      value: function upload(local, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function (progress) {
            self.connector.put(local, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            }, function (percent) {
              progress.setProgress(percent);
            });
          }, 'Uploading ' + _path2['default'].basename(local));
        });

        return self;
      }
    }, {
      key: 'syncRemoteFileToLocal',
      value: function syncRemoteFileToLocal(remote, callback) {
        var self = this;
        // verify active connection
        if (self.status === 'CONNECTED') {
          self._enqueue(function () {
            self.connector.get(remote, false, function (err) {
              if (err) {
                if (typeof callback === 'function') callback.apply(null, [err]);
                return;
              }
              self._next();
            });
          }, 'Sync ' + _path2['default'].basename(remote));
        } else {
          atom.notifications.addError('Remote FTP: Not connected!', {
            dismissable: true
          });
        }
        return self;
      }
    }, {
      key: 'syncRemoteDirectoryToLocal',
      value: function syncRemoteDirectoryToLocal(remote, isFile, callback) {
        // TODO: Tidy up this function. Does ( probably ) not need to list from the connector
        // if isFile === true. Will need to check to see if that doesn't break anything before
        // implementing. In the meantime current solution should work for #453
        //
        // TODO: This method only seems to be referenced by the context menu command so gracefully
        // removing list without breaking this method should be do-able. 'isFile' is always sending
        // false at the moment inside commands.js
        var self = this;

        if (!remote) return;

        self.download(remote, true, function (err) {
          if (err) {
            console.error(err);
          }
        });

        self._enqueue(function () {
          var local = self.toLocal(remote);

          self.connector.list(remote, true, function (err, remotes) {
            if (err) {
              if (typeof callback === 'function') callback.apply(null, [err]);

              return;
            }

            (0, _helpers.traverseTree)(local, function (locals) {
              var error = function error() {
                if (typeof callback === 'function') callback.apply(null);
                self._next();
              };

              var n = function n() {
                var _again2 = true;

                _function2: while (_again2) {
                  _again2 = false;

                  var remoteOne = remotes.shift();
                  var loc = undefined;

                  if (!remoteOne) return error();

                  if (remoteOne.type === 'd') {
                    _again2 = true;
                    remoteOne = loc = undefined;
                    continue _function2;
                  }

                  var toLocal = self.toLocal(remoteOne.name);
                  loc = null;

                  for (var a = 0, b = locals.length; a < b; ++a) {
                    if (locals[a].name === toLocal) {
                      loc = locals[a];
                      break;
                    }
                  }

                  // Download only if not present on local or size differ
                  if (!loc || remoteOne.size !== loc.size) {
                    self.connector.get(remoteOne.name, false, function () {
                      return n();
                    });
                  } else {
                    n();
                  }

                  return true;
                }
              };

              if (remotes.length === 0) {
                self.connector.get(remote, false, function () {
                  return n();
                });
                return;
              }
              n();
            });
          }, isFile);
          // NOTE: Added isFile to end of call to prevent breaking any functions
          // that already use list command. Is file is used only for ftp connector
          // as it will list a file as a file of itself unlinke with sftp which
          // will throw an error.
        }, 'Sync ' + _path2['default'].basename(remote));
      }
    }, {
      key: 'syncLocalFileToRemote',
      value: function syncLocalFileToRemote(local, callback) {
        var self = this;
        // verify active connection
        if (self.status === 'CONNECTED') {
          // progress
          self._enqueue(function () {
            self.connector.put(local, function (err) {
              if (err) {
                if (typeof callback === 'function') callback.apply(null, [err]);
                return;
              }
              self._next();
            });
          }, 'Sync: ' + _path2['default'].basename(local));
        } else {
          atom.notifications.addError('Remote FTP: Not connected!', {
            dismissable: true
          });
        }
        return self;
      }
    }, {
      key: 'syncLocalDirectoryToRemote',
      value: function syncLocalDirectoryToRemote(local, callback) {
        var self = this;
        // verify active connection
        if (self.status === 'CONNECTED') {
          self._enqueue(function () {
            var remote = self.toRemote(local);

            self.connector.list(remote, true, function (err, remotes) {
              if (err) {
                if (typeof callback === 'function') callback.apply(null, [err]);
                return;
              }

              (0, _helpers.traverseTree)(local, function (locals) {
                var error = function error() {
                  if (typeof callback === 'function') callback.apply(null);
                  self._next();
                };

                // remove ignored locals
                self.checkIgnore(local);
                if (self.ignoreFilter) {
                  for (var i = locals.length - 1; i >= 0; i--) {
                    if (self.ignoreFilter.ignores(locals[i].name)) {
                      locals.splice(i, 1); // remove from list
                    }
                  }
                }

                var n = function n() {
                  var _again3 = true;

                  _function3: while (_again3) {
                    _again3 = false;

                    var nLocal = locals.shift();
                    var nRemote = undefined;

                    if (!nLocal) {
                      return error();
                    }
                    if (nLocal.type === 'd') {
                      _again3 = true;
                      nLocal = nRemote = undefined;
                      continue _function3;
                    }

                    var toRemote = self.toRemote(nLocal.name);
                    nRemote = null;

                    for (var a = 0, b = remotes.length; a < b; ++a) {
                      if (remotes[a].name === toRemote) {
                        nRemote = remotes[a];
                        break;
                      }
                    }

                    // NOTE: Upload only if not present on remote or size differ
                    if (!nRemote || remote.size !== nLocal.size) {
                      self.connector.put(nLocal.name, function () {
                        return n();
                      });
                    } else {
                      n();
                    }

                    return true;
                  }
                };

                n();
              });
            });
          }, 'Sync ' + _path2['default'].basename(local));
        } else {
          atom.notifications.addError('Remote FTP: Not connected!', {
            dismissable: true
          });
        }
        return self;
      }
    }, {
      key: 'mkdir',
      value: function mkdir(remote, recursive, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.mkdir(remote, recursive, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Creating folder ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'mkfile',
      value: function mkfile(remote, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.mkfile(remote, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Creating file ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'rename',
      value: function rename(source, dest, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector.rename(source, dest, function (err) {
              if (typeof callback === 'function') callback.apply(null, [err]);
              self._next();
            });
          }, 'Renaming ' + _path2['default'].basename(source));
        });
        return self;
      }
    }, {
      key: 'delete',
      value: function _delete(remote, callback) {
        var self = this;
        self.onceConnected(function () {
          self._enqueue(function () {
            self.connector['delete'](remote, function () {
              if (typeof callback === 'function') callback.apply(undefined, arguments);
              self._next();
            });
          }, 'Deleting ' + _path2['default'].basename(remote));
        });

        return self;
      }
    }, {
      key: 'site',
      value: function site(command, callback) {
        var _this = this;

        this.onceConnected(function () {
          _this.connector.site(command, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            if (typeof callback === 'function') callback(args);
          });
        });
      }
    }, {
      key: 'promptForPass',
      value: function promptForPass() {
        var self = this;
        var dialog = new _dialogsPromptPassDialog2['default']('', true);
        dialog.on('dialog-done', function (e, pass) {
          self.info.pass = pass;
          self.info.passphrase = pass;
          dialog.close();
          self.doConnect();
        });
        dialog.attach();
      }
    }, {
      key: 'promptForKeyboardInteractive',
      value: function promptForKeyboardInteractive() {
        var self = this;
        var dialog = new _dialogsPromptPassDialog2['default'](true);

        dialog.on('dialog-done', function (e, pass) {
          self.info.verifyCode = pass;
          dialog.close();
          self.doConnect();
        });

        dialog.attach();
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        this.subscriptions.dispose();
        this.watch.removeListeners();
      }
    }]);

    return Client;
  })(_events.EventEmitter);

  return Client;
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9jbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRWUsU0FBUzs7OztrQkFDVCxJQUFJOzs7O29CQUN1QixNQUFNOztpQ0FDOUIsc0JBQXNCOztvQkFDdkIsTUFBTTs7OztzQkFDTSxRQUFROztpQ0FDUCxxQkFBcUI7Ozs7d0JBQzlCLFVBQVU7Ozs7c0JBQ1osUUFBUTs7Ozt5QkFDTCxZQUFZOzs7O3VCQUM2RSxXQUFXOzt5QkFDcEcsYUFBYTs7Ozt3QkFDZCxZQUFZOzs7OzZCQUNqQixrQkFBa0I7Ozs7OEJBQ2pCLG1CQUFtQjs7Ozt1Q0FDUCw4QkFBOEI7Ozs7QUFqQjNELFdBQVcsQ0FBQzs7QUFtQlosSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7O0FBRXJFLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7O3FCQUVULENBQUEsU0FBUyxJQUFJLEdBQUc7TUFDeEIsTUFBTTtjQUFOLE1BQU07O0FBQ0MsYUFEUCxNQUFNLEdBQ0k7NEJBRFYsTUFBTTs7QUFFUixpQ0FGRSxNQUFNLDZDQUVBOztBQUVSLFVBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7O0FBRS9DLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNwQixVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsVUFBSSxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUM7QUFDbkMsVUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsVUFBSSxDQUFD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RyxNQUFNOzs7QUFzNEJaLFNBQU8sTUFBTSxDQUFDO0NBQ2YsQ0FBQSxFQUFFIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9jbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEZTIGZyb20gJ2ZzLXBsdXMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCB7IEZpbGUsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ICQgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgc3RyaXBKc29uQ29tbWVudHMgZnJvbSAnc3RyaXAtanNvbi1jb21tZW50cyc7XG5pbXBvcnQgY2hva2lkYXIgZnJvbSAnY2hva2lkYXInO1xuaW1wb3J0IGlnbm9yZSBmcm9tICdpZ25vcmUnO1xuaW1wb3J0IHNzaENvbmZpZyBmcm9tICdzc2gtY29uZmlnJztcbmltcG9ydCB7IG11bHRpcGxlSG9zdHNFbmFibGVkLCBnZXRPYmplY3QsIGhhc1Byb2plY3QsIGxvZ2dlciwgdHJhdmVyc2VUcmVlLCB2YWxpZGF0ZUNvbmZpZywgcmVzb2x2ZUhvbWUgfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IERpcmVjdG9yeSBmcm9tICcuL2RpcmVjdG9yeSc7XG5pbXBvcnQgUHJvZ3Jlc3MgZnJvbSAnLi9wcm9ncmVzcyc7XG5pbXBvcnQgRlRQIGZyb20gJy4vY29ubmVjdG9ycy9mdHAnO1xuaW1wb3J0IFNGVFAgZnJvbSAnLi9jb25uZWN0b3JzL3NmdHAnO1xuaW1wb3J0IFByb21wdFBhc3NEaWFsb2cgZnJvbSAnLi9kaWFsb2dzL3Byb21wdC1wYXNzLWRpYWxvZyc7XG5cbmNvbnN0IFNTSDJfQUxHT1JJVEhNUyA9IHJlcXVpcmUoJ3NzaDItc3RyZWFtcycpLmNvbnN0YW50cy5BTEdPUklUSE1TO1xuXG5jb25zdCBhdG9tID0gZ2xvYmFsLmF0b207XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBJTklUKCkge1xuICBjbGFzcyBDbGllbnQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcblxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLmluZm8gPSBudWxsO1xuICAgICAgc2VsZi5jb25uZWN0b3IgPSBudWxsO1xuICAgICAgc2VsZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgIHNlbGYucXVldWUgPSBbXTtcblxuICAgICAgc2VsZi5pZ25vcmVCYXNlTmFtZSA9ICcuZnRwaWdub3JlJztcbiAgICAgIHNlbGYuaWdub3JlRmlsZSA9IG51bGw7XG4gICAgICBzZWxmLmlnbm9yZUZpbHRlciA9IGZhbHNlO1xuXG4gICAgICBzZWxmLnJvb3QgPSBuZXcgRGlyZWN0b3J5KHtcbiAgICAgICAgbmFtZTogJy8nLFxuICAgICAgICBwYXRoOiAnLycsXG4gICAgICAgIGNsaWVudDogdGhpcyxcbiAgICAgICAgaXNFeHBhbmRlZDogdHJ1ZSxcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLnN0YXR1cyA9ICdOT1RfQ09OTkVDVEVEJzsgLy8gT3B0aW9ucyBOT1RfQ09OTkVDVEVELCBDT05ORUNUSU5HLCBDT05ORUNURURcblxuICAgICAgc2VsZi53YXRjaCA9IHtcbiAgICAgICAgd2F0Y2hlcjogbnVsbCxcbiAgICAgICAgZmlsZXM6IFtdLFxuICAgICAgICBhZGRMaXN0ZW5lcnMoKSB7XG4gICAgICAgICAgbGV0IHdhdGNoRGF0YSA9IGdldE9iamVjdCh7XG4gICAgICAgICAgICBrZXlzOiBbJ2luZm8nLCAnd2F0Y2gnXSxcbiAgICAgICAgICAgIG9iajogc2VsZixcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAod2F0Y2hEYXRhID09PSBudWxsIHx8IHdhdGNoRGF0YSA9PT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICBpZiAodHlwZW9mIHdhdGNoRGF0YSA9PT0gJ3N0cmluZycpIHdhdGNoRGF0YSA9IFt3YXRjaERhdGFdO1xuXG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHdhdGNoRGF0YSkgfHwgd2F0Y2hEYXRhLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgZGlyID0gc2VsZi5nZXRQcm9qZWN0UGF0aCgpO1xuXG4gICAgICAgICAgY29uc3Qgd2F0Y2hEYXRhRm9ybWF0dGVkID0gd2F0Y2hEYXRhLm1hcCh3YXRjaCA9PiBQYXRoLm5vcm1hbGl6ZShgJHtkaXJ9LyR7d2F0Y2h9YCkpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHdhdGNoRGF0YUZvcm1hdHRlZCkpO1xuXG4gICAgICAgICAgY29uc3Qgd2F0Y2hlciA9IGNob2tpZGFyLndhdGNoKHdhdGNoRGF0YUZvcm1hdHRlZCwge1xuICAgICAgICAgICAgaWdub3JlZDogLyhefFsvXFxcXF0pXFwuLi8sXG4gICAgICAgICAgICBwZXJzaXN0ZW50OiB0cnVlLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgd2F0Y2hlclxuICAgICAgICAgIC5vbignY2hhbmdlJywgKHBhdGgpID0+IHtcbiAgICAgICAgICAgIHNlbGYud2F0Y2gucXVldWVVcGxvYWQuYXBwbHkoc2VsZiwgW3BhdGhdKTtcbiAgICAgICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAubm90aWZpY2F0aW9ucy5lbmFibGVXYXRjaEZpbGVDaGFuZ2UnKSkge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhgUmVtb3RlIEZUUDogQ2hhbmdlIGRldGVjdGVkIGluOiAke3BhdGh9YCwge1xuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzZWxmLmZpbGVzID0gd2F0Y2hEYXRhRm9ybWF0dGVkLnNsaWNlKCk7XG5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnUmVtb3RlIEZUUDogQWRkZWQgd2F0Y2ggbGlzdGVuZXJzJywge1xuICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNlbGYud2F0Y2hlciA9IHdhdGNoZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZUxpc3RlbmVycygpIHtcbiAgICAgICAgICBpZiAoc2VsZi53YXRjaGVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIHNlbGYud2F0Y2hlci5jbG9zZSgpO1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1JlbW90ZSBGVFA6IFN0b3BwZWQgd2F0Y2ggbGlzdGVuZXJzJywge1xuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHF1ZXVlOiB7fSxcbiAgICAgICAgcXVldWVVcGxvYWQoZmlsZU5hbWUpIHtcbiAgICAgICAgICBjb25zdCB0aW1lb3V0RHVyYXRpb24gPSBpc05hTihwYXJzZUludChzZWxmLmluZm8ud2F0Y2hUaW1lb3V0LCAxMCkpID09PSB0cnVlXG4gICAgICAgICAgICA/IDUwMFxuICAgICAgICAgICAgOiBwYXJzZUludChzZWxmLmluZm8ud2F0Y2hUaW1lb3V0LCAxMCk7XG5cblxuICAgICAgICAgIGZ1bmN0aW9uIHNjaGVkdWxlVXBsb2FkKGZpbGUpIHtcbiAgICAgICAgICAgIHNlbGYud2F0Y2gucXVldWVbZmlsZV0gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgc2VsZi51cGxvYWQoZmlsZSwgKCkgPT4ge30pO1xuICAgICAgICAgICAgfSwgdGltZW91dER1cmF0aW9uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VsZi53YXRjaC5xdWV1ZVtmaWxlTmFtZV0gIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLndhdGNoLnF1ZXVlW2ZpbGVOYW1lXSk7XG4gICAgICAgICAgICBzZWxmLndhdGNoLnF1ZXVlW2ZpbGVOYW1lXSA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2NoZWR1bGVVcGxvYWQoZmlsZU5hbWUpO1xuICAgICAgICB9LFxuXG4gICAgICB9O1xuXG4gICAgICBzZWxmLndhdGNoLmFkZExpc3RlbmVycyA9IHNlbGYud2F0Y2guYWRkTGlzdGVuZXJzLmJpbmQoc2VsZik7XG4gICAgICBzZWxmLndhdGNoLnJlbW92ZUxpc3RlbmVycyA9IHNlbGYud2F0Y2gucmVtb3ZlTGlzdGVuZXJzLmJpbmQoc2VsZik7XG5cbiAgICAgIHNlbGYub24oJ2Nvbm5lY3RlZCcsIHNlbGYud2F0Y2guYWRkTGlzdGVuZXJzKTtcbiAgICAgIHNlbGYub24oJ2Rpc2Nvbm5lY3RlZCcsIHNlbGYud2F0Y2gucmVtb3ZlTGlzdGVuZXJzKTtcblxuICAgICAgc2VsZi5ldmVudHMoKTtcbiAgICB9XG5cbiAgICBldmVudHMoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ1JlbW90ZS1GVFAuZGV2LmRlYnVnUmVzcG9uc2UnLCAodmFsdWVzKSA9PiB7XG4gICAgICAgICAgc2VsZi53YXRjaERlYnVnKHZhbHVlcy5uZXdWYWx1ZSk7XG4gICAgICAgIH0pLFxuICAgICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnUmVtb3RlLUZUUC50cmVlLnNob3dQcm9qZWN0TmFtZScsICgpID0+IHtcbiAgICAgICAgICBzZWxmLnNldFByb2plY3ROYW1lKCk7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBzZXRQcm9qZWN0TmFtZSgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgY29uc3QgcHJvamVjdFJvb3QgPSBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAudHJlZS5zaG93UHJvamVjdE5hbWUnKTtcbiAgICAgIGNvbnN0ICRyb290TmFtZSA9ICQoJy5mdHB0cmVlLXZpZXcgLnByb2plY3Qtcm9vdCA+IC5oZWFkZXIgc3BhbicpO1xuXG4gICAgICBsZXQgcm9vdE5hbWUgPSAnLyc7XG5cbiAgICAgIGlmICh0eXBlb2Ygc2VsZi5pbmZvW3Byb2plY3RSb290XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcm9vdE5hbWUgPSBzZWxmLmluZm9bcHJvamVjdFJvb3RdO1xuICAgICAgfVxuXG4gICAgICBzZWxmLnJvb3QubmFtZSA9IHJvb3ROYW1lO1xuICAgICAgJHJvb3ROYW1lLnRleHQocm9vdE5hbWUpO1xuICAgIH1cblxuICAgIHJlYWRDb25maWcoY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgY29uc3QgZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrLmFwcGx5KHNlbGYsIFtlcnJdKTtcbiAgICAgIH07XG4gICAgICBzZWxmLmluZm8gPSBudWxsO1xuICAgICAgc2VsZi5mdHBDb25maWdQYXRoID0gc2VsZi5nZXRDb25maWdQYXRoKCk7XG5cbiAgICAgIGlmIChzZWxmLmZ0cENvbmZpZ1BhdGggPT09IGZhbHNlKSB0aHJvdyBuZXcgRXJyb3IoJ1JlbW90ZSBGVFA6IGdldENvbmZpZ1BhdGggcmV0dXJuZWQgZmFsc2UsIGJ1dCBleHBlY3RlZCBhIHN0cmluZycpO1xuXG4gICAgICBGUy5yZWFkRmlsZShzZWxmLmZ0cENvbmZpZ1BhdGgsICd1dGY4JywgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiBlcnJvcihlcnIpO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBzdHJpcEpzb25Db21tZW50cyhyZXMpO1xuICAgICAgICBsZXQganNvbiA9IG51bGw7XG4gICAgICAgIGlmICh2YWxpZGF0ZUNvbmZpZyhkYXRhKSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBqc29uID0gSlNPTi5wYXJzZShkYXRhKTtcblxuICAgICAgICAgICAgc2VsZi5pbmZvID0ganNvbjtcbiAgICAgICAgICAgIHNlbGYucm9vdC5uYW1lID0gJyc7XG4gICAgICAgICAgICBzZWxmLnJvb3QucGF0aCA9IGAvJHtzZWxmLmluZm8ucmVtb3RlLnJlcGxhY2UoL15cXC8rLywgJycpfWA7XG5cbiAgICAgICAgICAgIGlmIChzZWxmLmluZm8ucHJpdmF0ZWtleSkge1xuICAgICAgICAgICAgICBzZWxmLmluZm8ucHJpdmF0ZWtleSA9IHJlc29sdmVIb21lKHNlbGYuaW5mby5wcml2YXRla2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5zZXRQcm9qZWN0TmFtZSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IHByb2Nlc3MgYC5mdHBjb25maWdgJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IGUsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoanNvbiAhPT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBzc2NvbmZpZ1BhdGggPSBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuY29ubmVjdG9yLnNzaENvbmZpZ1BhdGgnKTtcblxuICAgICAgICAgIGlmIChzc2NvbmZpZ1BhdGggJiYgc2VsZi5pbmZvLnByb3RvY29sID09PSAnc2Z0cCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBQYXRoLm5vcm1hbGl6ZShzc2NvbmZpZ1BhdGgucmVwbGFjZSgnficsIG9zLmhvbWVkaXIoKSkpO1xuXG4gICAgICAgICAgICBGUy5yZWFkRmlsZShjb25maWdQYXRoLCAndXRmOCcsIChmaWxlRXJyLCBjb25mKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChmaWxlRXJyKSByZXR1cm4gZXJyb3IoZmlsZUVycik7XG5cbiAgICAgICAgICAgICAgY29uc3QgY29uZmlnID0gc3NoQ29uZmlnLnBhcnNlKGNvbmYpO1xuXG4gICAgICAgICAgICAgIGNvbnN0IHNlY3Rpb24gPSBjb25maWcuZmluZCh7XG4gICAgICAgICAgICAgICAgSG9zdDogc2VsZi5pbmZvLmhvc3QsXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIGlmIChzZWN0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFwcGluZyA9IG5ldyBNYXAoW1xuICAgICAgICAgICAgICAgICAgWydIb3N0TmFtZScsICdob3N0J10sXG4gICAgICAgICAgICAgICAgICBbJ1BvcnQnLCAncG9ydCddLFxuICAgICAgICAgICAgICAgICAgWydVc2VyJywgJ3VzZXInXSxcbiAgICAgICAgICAgICAgICAgIFsnSWRlbnRpdHlGaWxlJywgJ3ByaXZhdGVrZXknXSxcbiAgICAgICAgICAgICAgICAgIFsnU2VydmVyQWxpdmVJbnRlcnZhbCcsICdrZWVwYWxpdmUnXSxcbiAgICAgICAgICAgICAgICAgIFsnQ29ubmVjdFRpbWVvdXQnLCAnY29ublRpbWVvdXQnXSxcbiAgICAgICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgICAgIHNlY3Rpb24uY29uZmlnLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuaW5mb1ttYXBwaW5nLmdldChsaW5lLnBhcmFtKV0gPSBsaW5lLnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIFtlcnIsIHNlbGYuaW5mb10pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNlbGYsIFtlcnIsIGpzb25dKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEZpbGVQYXRoKHJlbGF0aXZlUGF0aCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IHNlbGYuZ2V0UHJvamVjdFBhdGgoKTtcbiAgICAgIGlmIChwcm9qZWN0UGF0aCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiBQYXRoLnJlc29sdmUocHJvamVjdFBhdGgsIHJlbGF0aXZlUGF0aCk7XG4gICAgfVxuXG4gICAgZ2V0UHJvamVjdFBhdGgoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGxldCBwcm9qZWN0UGF0aCA9IG51bGw7XG5cbiAgICAgIGlmIChtdWx0aXBsZUhvc3RzRW5hYmxlZCgpID09PSB0cnVlKSB7XG4gICAgICAgIGNvbnN0ICRzZWxlY3RlZERpciA9ICQoJy50cmVlLXZpZXcgLnNlbGVjdGVkJyk7XG4gICAgICAgIGNvbnN0ICRjdXJyZW50UHJvamVjdCA9ICRzZWxlY3RlZERpci5oYXNDbGFzcygncHJvamVjdC1yb290JykgPyAkc2VsZWN0ZWREaXIgOiAkc2VsZWN0ZWREaXIuY2xvc2VzdCgnLnByb2plY3Qtcm9vdCcpO1xuICAgICAgICBwcm9qZWN0UGF0aCA9ICRjdXJyZW50UHJvamVjdC5maW5kKCc+IC5oZWFkZXIgc3Bhbi5uYW1lJykuZGF0YSgncGF0aCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZmlyc3REaXJlY3RvcnkgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXTtcbiAgICAgICAgaWYgKGZpcnN0RGlyZWN0b3J5ICE9IG51bGwpIHByb2plY3RQYXRoID0gZmlyc3REaXJlY3RvcnkucGF0aDtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb2plY3RQYXRoICE9IG51bGwpIHtcbiAgICAgICAgc2VsZi5wcm9qZWN0UGF0aCA9IHByb2plY3RQYXRoO1xuICAgICAgICByZXR1cm4gcHJvamVjdFBhdGg7XG4gICAgICB9XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1JlbW90ZSBGVFA6IENvdWxkIG5vdCBnZXQgcHJvamVjdCBwYXRoJywge1xuICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsIC8vIFdhbnQgdXNlciB0byByZXBvcnQgZXJyb3Igc28gZG9uJ3QgbGV0IHRoZW0gY2xvc2UgaXRcbiAgICAgICAgZGV0YWlsOiBgUGxlYXNlIHJlcG9ydCB0aGlzIGVycm9yIGlmIGl0IG9jY3Vycy4gTXVsdGlwbGUgSG9zdHMgaXMgJHttdWx0aXBsZUhvc3RzRW5hYmxlZCgpfWAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRDb25maWdQYXRoKCkge1xuICAgICAgaWYgKCFoYXNQcm9qZWN0KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHJldHVybiB0aGlzLmdldEZpbGVQYXRoKCcuLy5mdHBjb25maWcnKTtcbiAgICB9XG5cbiAgICB1cGRhdGVJZ25vcmUoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKCFzZWxmLmlnbm9yZUZpbGUpIHtcbiAgICAgICAgc2VsZi5pZ25vcmVQYXRoID0gc2VsZi5nZXRGaWxlUGF0aChzZWxmLmlnbm9yZUJhc2VOYW1lKTtcbiAgICAgICAgc2VsZi5pZ25vcmVGaWxlID0gbmV3IEZpbGUoc2VsZi5pZ25vcmVQYXRoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzZWxmLmlnbm9yZUZpbGUuZXhpc3RzU3luYygpKSB7XG4gICAgICAgIHNlbGYuaWdub3JlRmlsdGVyID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuaWdub3JlRmlsZS5nZXRCYXNlTmFtZSgpID09PSBzZWxmLmlnbm9yZUJhc2VOYW1lKSB7XG4gICAgICAgIHNlbGYuaWdub3JlRmlsdGVyID0gaWdub3JlKCkuYWRkKHNlbGYuaWdub3JlRmlsZS5yZWFkU3luYyh0cnVlKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY2hlY2tJZ25vcmUobG9jYWwpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgbGV0IGhhc2VJZ25vcmUgPSB0cnVlO1xuXG4gICAgICBpZiAoIXNlbGYuaWdub3JlRmlsdGVyKSB7XG4gICAgICAgIGhhc2VJZ25vcmUgPSBzZWxmLnVwZGF0ZUlnbm9yZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaGFzZUlnbm9yZSAmJiBzZWxmLmlnbm9yZUZpbHRlciAmJiBzZWxmLmlnbm9yZUZpbHRlci5pZ25vcmVzKGxvY2FsKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlzQ29ubmVjdGVkKCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICByZXR1cm4gc2VsZi5jb25uZWN0b3IgJiYgc2VsZi5jb25uZWN0b3IuaXNDb25uZWN0ZWQoKTtcbiAgICB9XG5cbiAgICBvbmNlQ29ubmVjdGVkKG9uY29ubmVjdCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBpZiAoc2VsZi5jb25uZWN0b3IgJiYgc2VsZi5jb25uZWN0b3IuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgICBvbmNvbm5lY3QuYXBwbHkoc2VsZik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb25jb25uZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChzZWxmLnN0YXR1cyA9PT0gJ05PVF9DT05ORUNURUQnKSB7XG4gICAgICAgICAgc2VsZi5zdGF0dXMgPSAnQ09OTkVDVElORyc7XG4gICAgICAgICAgc2VsZi5yZWFkQ29uZmlnKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgc2VsZi5zdGF0dXMgPSAnTk9UX0NPTk5FQ1RFRCc7XG4gICAgICAgICAgICAgIC8vIE5PVEU6IFJlbW92ZSBub3RpZmljYXRpb24gYXMgaXQgd2lsbCBqdXN0IHNheSB0aGVyZVxuICAgICAgICAgICAgICAvLyBpcyBubyBmdHBjb25maWcgaWYgbm9uZSBpbiBkaXJlY3RvcnkgYWxsIHRoZSB0aW1lXG4gICAgICAgICAgICAgIC8vIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIlJlbW90ZSBGVFA6IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5jb25uZWN0KHRydWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5vbmNlKCdjb25uZWN0ZWQnLCBvbmNvbm5lY3QpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBjb25zb2xlLndhcm4oYFJlbW90ZS1GVFA6IE5vdCBjb25uZWN0ZWQgYW5kIHR5cGVvZiBvbmNvbm5lY3QgaXMgJHt0eXBlb2Ygb25jb25uZWN0fWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbm5lY3QocmVjb25uZWN0KSB7XG4gICAgICBpZiAocmVjb25uZWN0ICE9PSB0cnVlKSB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICAgIGlmICh0aGlzLmlzQ29ubmVjdGVkKCkpIHJldHVybjtcbiAgICAgIGlmICghdGhpcy5pbmZvKSByZXR1cm47XG4gICAgICBpZiAodGhpcy5pbmZvLnByb21wdEZvclBhc3MgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5wcm9tcHRGb3JQYXNzKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5mby5rZXlib2FyZEludGVyYWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMucHJvbXB0Rm9yS2V5Ym9hcmRJbnRlcmFjdGl2ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kb0Nvbm5lY3QoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkb0Nvbm5lY3QoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1JlbW90ZSBGVFA6IENvbm5lY3RpbmcuLi4nLCB7XG4gICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgaW5mbztcbiAgICAgIHN3aXRjaCAoc2VsZi5pbmZvLnByb3RvY29sKSB7XG4gICAgICAgIGNhc2UgJ2Z0cCc6IHtcbiAgICAgICAgICBpbmZvID0ge1xuICAgICAgICAgICAgaG9zdDogc2VsZi5pbmZvLmhvc3QgfHwgJycsXG4gICAgICAgICAgICBwb3J0OiBzZWxmLmluZm8ucG9ydCB8fCAyMSxcbiAgICAgICAgICAgIHVzZXI6IHNlbGYuaW5mby51c2VyIHx8ICcnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IHNlbGYuaW5mby5wYXNzIHx8ICcnLFxuICAgICAgICAgICAgc2VjdXJlOiBzZWxmLmluZm8uc2VjdXJlIHx8ICcnLFxuICAgICAgICAgICAgc2VjdXJlT3B0aW9uczogc2VsZi5pbmZvLnNlY3VyZU9wdGlvbnMgfHwgJycsXG4gICAgICAgICAgICBjb25uVGltZW91dDogc2VsZi5pbmZvLnRpbWVvdXQgfHwgMTAwMDAsXG4gICAgICAgICAgICBwYXN2VGltZW91dDogc2VsZi5pbmZvLnRpbWVvdXQgfHwgMTAwMDAsXG4gICAgICAgICAgICBrZWVwYWxpdmU6IChzZWxmLmluZm8ua2VlcGFsaXZlID09PSB1bmRlZmluZWQgPyAxMDAwMCA6IHNlbGYuaW5mby5rZWVwYWxpdmUpLCAvLyBsb25nIHZlcnNpb24sIGJlY2F1c2UgMCBpcyBhIHZhbGlkIHZhbHVlXG4gICAgICAgICAgICBkZWJ1ZyhzdHIpIHtcbiAgICAgICAgICAgICAgY29uc3QgbG9nID0gc3RyLm1hdGNoKC9eXFxbY29ubmVjdGlvblxcXSAoPnw8KSAnKC4qPykoXFxcXHJcXFxcbik/JyQvKTtcbiAgICAgICAgICAgICAgaWYgKCFsb2cpIHJldHVybjtcbiAgICAgICAgICAgICAgaWYgKGxvZ1syXS5tYXRjaCgvXlBBU1MgLykpIGxvZ1syXSA9ICdQQVNTICoqKioqKic7XG4gICAgICAgICAgICAgIHNlbGYuZW1pdCgnZGVidWcnLCBgJHtsb2dbMV19ICR7bG9nWzJdfWApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yID0gbmV3IEZUUChzZWxmKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNhc2UgJ3NmdHAnOiB7XG4gICAgICAgICAgaW5mbyA9IHtcbiAgICAgICAgICAgIGhvc3Q6IHNlbGYuaW5mby5ob3N0IHx8ICcnLFxuICAgICAgICAgICAgcG9ydDogc2VsZi5pbmZvLnBvcnQgfHwgMjEsXG4gICAgICAgICAgICB1c2VybmFtZTogc2VsZi5pbmZvLnVzZXIgfHwgJycsXG4gICAgICAgICAgICByZWFkeVRpbWVvdXQ6IHNlbGYuaW5mby5jb25uVGltZW91dCB8fCAxMDAwMCxcbiAgICAgICAgICAgIGtlZXBhbGl2ZUludGVydmFsOiBzZWxmLmluZm8ua2VlcGFsaXZlIHx8IDEwMDAwLFxuICAgICAgICAgICAgdmVyaWZ5Q29kZTogc2VsZi5pbmZvLnZlcmlmeUNvZGUgfHwgJycsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChzZWxmLmluZm8ucGFzcykgaW5mby5wYXNzd29yZCA9IHNlbGYuaW5mby5wYXNzO1xuXG4gICAgICAgICAgaWYgKHNlbGYuaW5mby5wcml2YXRla2V5KSB7XG4gICAgICAgICAgICBzZWxmLmluZm8ucHJpdmF0ZWtleSA9IHJlc29sdmVIb21lKHNlbGYuaW5mby5wcml2YXRla2V5KTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3QgcGsgPSBGUy5yZWFkRmlsZVN5bmMoc2VsZi5pbmZvLnByaXZhdGVrZXkpO1xuICAgICAgICAgICAgICBpbmZvLnByaXZhdGVLZXkgPSBwaztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1JlbW90ZSBGVFA6IENvdWxkIG5vdCByZWFkIHByaXZhdGVLZXkgZmlsZScsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGVycixcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlbGYuaW5mby5wYXNzcGhyYXNlKSBpbmZvLnBhc3NwaHJhc2UgPSBzZWxmLmluZm8ucGFzc3BocmFzZTtcblxuICAgICAgICAgIGlmIChzZWxmLmluZm8uYWdlbnQpIGluZm8uYWdlbnQgPSBzZWxmLmluZm8uYWdlbnQ7XG5cbiAgICAgICAgICBpZiAoc2VsZi5pbmZvLmFnZW50ID09PSAnZW52JykgaW5mby5hZ2VudCA9IHByb2Nlc3MuZW52LlNTSF9BVVRIX1NPQ0s7XG5cbiAgICAgICAgICBpZiAoc2VsZi5pbmZvLmhvc3RoYXNoKSBpbmZvLmhvc3RIYXNoID0gc2VsZi5pbmZvLmhvc3RoYXNoO1xuXG4gICAgICAgICAgaWYgKHNlbGYuaW5mby5pZ25vcmVob3N0KSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBob3N0VmVyaWZpZXIgZG9lc24ndCBydW4gYXQgYWxsIGlmIGl0J3Mgbm90IGEgZnVuY3Rpb24uXG4gICAgICAgICAgICAvLyBBbGxvd3MgeW91IHRvIHNraXAgaG9zdEhhc2ggb3B0aW9uIGluIHNzaDIgMC41K1xuICAgICAgICAgICAgaW5mby5ob3N0VmVyaWZpZXIgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbmZvLmFsZ29yaXRobXMgPSB7XG4gICAgICAgICAgICBrZXg6IFNTSDJfQUxHT1JJVEhNUy5TVVBQT1JURURfS0VYLFxuICAgICAgICAgICAgY2lwaGVyOiBTU0gyX0FMR09SSVRITVMuU1VQUE9SVEVEX0NJUEhFUixcbiAgICAgICAgICAgIHNlcnZlckhvc3RLZXk6IFNTSDJfQUxHT1JJVEhNUy5TVVBQT1JURURfU0VSVkVSX0hPU1RfS0VZLFxuICAgICAgICAgICAgaG1hYzogU1NIMl9BTEdPUklUSE1TLlNVUFBPUlRFRF9ITUFDLFxuICAgICAgICAgICAgY29tcHJlc3M6IFNTSDJfQUxHT1JJVEhNUy5TVVBQT1JURURfQ09NUFJFU1MsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGluZm8uZmlsZVBlcm1pc3Npb25zID0gc2VsZi5pbmZvLmZpbGVQZXJtaXNzaW9ucztcbiAgICAgICAgICBpbmZvLnJlbW90ZUNvbW1hbmQgPSBzZWxmLmluZm8ucmVtb3RlQ29tbWFuZDtcbiAgICAgICAgICBpbmZvLnJlbW90ZVNoZWxsID0gc2VsZi5pbmZvLnJlbW90ZVNoZWxsO1xuICAgICAgICAgIGlmIChzZWxmLmluZm8ua2V5Ym9hcmRJbnRlcmFjdGl2ZSkgaW5mby50cnlLZXlib2FyZCA9IHRydWU7XG5cbiAgICAgICAgICBzZWxmLmNvbm5lY3RvciA9IG5ldyBTRlRQKHNlbGYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGBwcm90b2NvbGAgZm91bmQgaW4gY29ubmVjdGlvbiBjcmVkZW50aWFsLiBQbGVhc2UgcmVjcmVhdGUgLmZ0cGNvbmZpZyBmaWxlIGZyb20gUGFja2FnZXMgLT4gUmVtb3RlLUZUUCAtPiBDcmVhdGUgKFMpRlRQIGNvbmZpZyBmaWxlLicpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLmNvbm5lY3Rvci5jb25uZWN0KGluZm8sICgpID0+IHtcbiAgICAgICAgaWYgKHNlbGYucm9vdC5zdGF0dXMgIT09IDEpIHNlbGYucm9vdC5vcGVuKCk7XG4gICAgICAgIHNlbGYuc3RhdHVzID0gJ0NPTk5FQ1RFRCc7XG4gICAgICAgIHNlbGYuZW1pdCgnY29ubmVjdGVkJyk7XG5cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ1JlbW90ZSBGVFA6IENvbm5lY3RlZCcsIHtcbiAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuY29ubmVjdG9yLm9uKCdjbG9zZWQnLCAoYWN0aW9uKSA9PiB7XG4gICAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgICAgICBzZWxmLnN0YXR1cyA9ICdOT1RfQ09OTkVDVEVEJztcbiAgICAgICAgc2VsZi5lbWl0KCdjbG9zZWQnKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ1JlbW90ZSBGVFA6IENvbm5lY3Rpb24gY2xvc2VkJywge1xuICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ1JFQ09OTkVDVCcpIHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3QodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLmNvbm5lY3Rvci5vbignZW5kZWQnLCAoKSA9PiB7XG4gICAgICAgIHNlbGYuZW1pdCgnZW5kZWQnKTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLmNvbm5lY3Rvci5vbignZXJyb3InLCAoZXJyLCBjb2RlKSA9PiB7XG4gICAgICAgIGlmIChjb2RlID09PSA0MjEgfHwgY29kZSA9PT0gJ0VDT05OUkVTRVQnKSByZXR1cm47XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignUmVtb3RlIEZUUDogQ29ubmVjdGlvbiBmYWlsZWQnLCB7XG4gICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLndhdGNoRGVidWcoYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLmRldi5kZWJ1Z1Jlc3BvbnNlJykpO1xuICAgIH1cblxuICAgIHdhdGNoRGVidWcoaXNXYXRjaGluZykge1xuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcignZGVidWcnLCBsb2dnZXIpO1xuXG4gICAgICBpZiAoaXNXYXRjaGluZykge1xuICAgICAgICB0aGlzLm9uKCdkZWJ1ZycsIGxvZ2dlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKCdkZWJ1ZycsIGxvZ2dlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGlzY29ubmVjdCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5jb25uZWN0b3IpIHtcbiAgICAgICAgc2VsZi5jb25uZWN0b3IuZGlzY29ubmVjdCgpO1xuICAgICAgICBkZWxldGUgc2VsZi5jb25uZWN0b3I7XG4gICAgICAgIHNlbGYuY29ubmVjdG9yID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYucm9vdCkge1xuICAgICAgICBzZWxmLnJvb3Quc3RhdHVzID0gMDtcbiAgICAgICAgc2VsZi5yb290LmRlc3Ryb3koKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi53YXRjaC5yZW1vdmVMaXN0ZW5lcnMuYXBwbHkoc2VsZik7XG5cbiAgICAgIHNlbGYuY3VycmVudCA9IG51bGw7XG4gICAgICBzZWxmLnF1ZXVlID0gW107XG5cbiAgICAgIHNlbGYuZW1pdCgnZGlzY29ubmVjdGVkJyk7XG4gICAgICBzZWxmLnN0YXR1cyA9ICdOT1RfQ09OTkVDVEVEJztcblxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICB0b1JlbW90ZShsb2NhbCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBQYXRoLmpvaW4oXG4gICAgICAgIHNlbGYuaW5mby5yZW1vdGUsXG4gICAgICAgIGF0b20ucHJvamVjdC5yZWxhdGl2aXplKGxvY2FsKSxcbiAgICAgICkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgIH1cblxuICAgIHRvTG9jYWwocmVtb3RlKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGNvbnN0IHByb2plY3RQYXRoID0gc2VsZi5nZXRQcm9qZWN0UGF0aCgpO1xuICAgICAgY29uc3QgcmVtb3RlTGVuZ3RoID0gc2VsZi5pbmZvLnJlbW90ZS5sZW5ndGg7XG5cbiAgICAgIGlmIChwcm9qZWN0UGF0aCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0eXBlb2YgcmVtb3RlICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlbW90ZSBGVFA6IHJlbW90ZSBtdXN0IGJlIGEgc3RyaW5nLCB3YXMgcGFzc2VkICR7dHlwZW9mIHJlbW90ZX1gKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHBhdGggPSBudWxsO1xuICAgICAgaWYgKHJlbW90ZUxlbmd0aCA+IDEpIHtcbiAgICAgICAgcGF0aCA9IGAuLyR7cmVtb3RlLnN1YnN0cihzZWxmLmluZm8ucmVtb3RlLmxlbmd0aCl9YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdGggPSBgLi8ke3JlbW90ZX1gO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUGF0aC5yZXNvbHZlKHByb2plY3RQYXRoLCBgLi8ke3BhdGgucmVwbGFjZSgvXlxcLysvLCAnJyl9YCk7XG4gICAgfVxuXG4gICAgX25leHQoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKCFzZWxmLmlzQ29ubmVjdGVkKCkpIHJldHVybjtcblxuICAgICAgc2VsZi5jdXJyZW50ID0gc2VsZi5xdWV1ZS5zaGlmdCgpO1xuXG4gICAgICBpZiAoc2VsZi5jdXJyZW50KSBzZWxmLmN1cnJlbnRbMV0uYXBwbHkoc2VsZiwgW3NlbGYuY3VycmVudFsyXV0pO1xuXG4gICAgICBhdG9tLnByb2plY3QucmVtb3RlZnRwLmVtaXQoJ3F1ZXVlLWNoYW5nZWQnKTtcbiAgICB9XG5cbiAgICBfZW5xdWV1ZShmdW5jLCBkZXNjKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGNvbnN0IHByb2dyZXNzID0gbmV3IFByb2dyZXNzKCk7XG5cbiAgICAgIHNlbGYucXVldWUucHVzaChbZGVzYywgZnVuYywgcHJvZ3Jlc3NdKTtcbiAgICAgIGlmIChzZWxmLnF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhc2VsZi5jdXJyZW50KSBzZWxmLl9uZXh0KCk7XG5cbiAgICAgIGVsc2Ugc2VsZi5lbWl0KCdxdWV1ZS1jaGFuZ2VkJyk7XG5cbiAgICAgIHJldHVybiBwcm9ncmVzcztcbiAgICB9XG5cbiAgICBhYm9ydCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHNlbGYuY29ubmVjdG9yLmFib3J0KCgpID0+IHtcbiAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBhYm9ydEFsbCgpIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgc2VsZi5xdWV1ZSA9IFtdO1xuXG4gICAgICBpZiAoc2VsZi5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHNlbGYuY29ubmVjdG9yLmFib3J0KCk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuZW1pdCgncXVldWUtY2hhbmdlZCcpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBsaXN0KHJlbW90ZSwgcmVjdXJzaXZlLCBjYWxsYmFjaykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLm9uY2VDb25uZWN0ZWQoKCkgPT4ge1xuICAgICAgICBzZWxmLl9lbnF1ZXVlKCgpID0+IHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5saXN0KHJlbW90ZSwgcmVjdXJzaXZlLCAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBMaXN0aW5nICR7cmVjdXJzaXZlID8gJ3JlY3Vyc2l2ZWx5ICcgOiAnJ30ke1BhdGguYmFzZW5hbWUocmVtb3RlKX1gKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBkb3dubG9hZChyZW1vdGUsIHJlY3Vyc2l2ZSwgY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZi5vbmNlQ29ubmVjdGVkKCgpID0+IHtcbiAgICAgICAgc2VsZi5fZW5xdWV1ZSgocHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5nZXQocmVtb3RlLCByZWN1cnNpdmUsICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgICAgIHNlbGYuX25leHQoKTtcbiAgICAgICAgICB9LCAocGVyY2VudCkgPT4ge1xuICAgICAgICAgICAgcHJvZ3Jlc3Muc2V0UHJvZ3Jlc3MocGVyY2VudCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBEb3dubG9hZGluZyAke1BhdGguYmFzZW5hbWUocmVtb3RlKX1gKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICB1cGxvYWQobG9jYWwsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYub25jZUNvbm5lY3RlZCgoKSA9PiB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKHByb2dyZXNzKSA9PiB7XG4gICAgICAgICAgc2VsZi5jb25uZWN0b3IucHV0KGxvY2FsLCAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSwgKHBlcmNlbnQpID0+IHtcbiAgICAgICAgICAgIHByb2dyZXNzLnNldFByb2dyZXNzKHBlcmNlbnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBgVXBsb2FkaW5nICR7UGF0aC5iYXNlbmFtZShsb2NhbCl9YCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgc3luY1JlbW90ZUZpbGVUb0xvY2FsKHJlbW90ZSwgY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgLy8gdmVyaWZ5IGFjdGl2ZSBjb25uZWN0aW9uXG4gICAgICBpZiAoc2VsZi5zdGF0dXMgPT09ICdDT05ORUNURUQnKSB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLmdldChyZW1vdGUsIGZhbHNlLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5fbmV4dCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBgU3luYyAke1BhdGguYmFzZW5hbWUocmVtb3RlKX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignUmVtb3RlIEZUUDogTm90IGNvbm5lY3RlZCEnLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgc3luY1JlbW90ZURpcmVjdG9yeVRvTG9jYWwocmVtb3RlLCBpc0ZpbGUsIGNhbGxiYWNrKSB7XG4gICAgICAvLyBUT0RPOiBUaWR5IHVwIHRoaXMgZnVuY3Rpb24uIERvZXMgKCBwcm9iYWJseSApIG5vdCBuZWVkIHRvIGxpc3QgZnJvbSB0aGUgY29ubmVjdG9yXG4gICAgICAvLyBpZiBpc0ZpbGUgPT09IHRydWUuIFdpbGwgbmVlZCB0byBjaGVjayB0byBzZWUgaWYgdGhhdCBkb2Vzbid0IGJyZWFrIGFueXRoaW5nIGJlZm9yZVxuICAgICAgLy8gaW1wbGVtZW50aW5nLiBJbiB0aGUgbWVhbnRpbWUgY3VycmVudCBzb2x1dGlvbiBzaG91bGQgd29yayBmb3IgIzQ1M1xuICAgICAgLy9cbiAgICAgIC8vIFRPRE86IFRoaXMgbWV0aG9kIG9ubHkgc2VlbXMgdG8gYmUgcmVmZXJlbmNlZCBieSB0aGUgY29udGV4dCBtZW51IGNvbW1hbmQgc28gZ3JhY2VmdWxseVxuICAgICAgLy8gcmVtb3ZpbmcgbGlzdCB3aXRob3V0IGJyZWFraW5nIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBkby1hYmxlLiAnaXNGaWxlJyBpcyBhbHdheXMgc2VuZGluZ1xuICAgICAgLy8gZmFsc2UgYXQgdGhlIG1vbWVudCBpbnNpZGUgY29tbWFuZHMuanNcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoIXJlbW90ZSkgcmV0dXJuO1xuXG4gICAgICBzZWxmLmRvd25sb2FkKHJlbW90ZSwgdHJ1ZSwgKGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5fZW5xdWV1ZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvY2FsID0gc2VsZi50b0xvY2FsKHJlbW90ZSk7XG5cbiAgICAgICAgc2VsZi5jb25uZWN0b3IubGlzdChyZW1vdGUsIHRydWUsIChlcnIsIHJlbW90ZXMpID0+IHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0cmF2ZXJzZVRyZWUobG9jYWwsIChsb2NhbHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjay5hcHBseShudWxsKTtcbiAgICAgICAgICAgICAgc2VsZi5fbmV4dCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcmVtb3RlT25lID0gcmVtb3Rlcy5zaGlmdCgpO1xuICAgICAgICAgICAgICBsZXQgbG9jO1xuXG4gICAgICAgICAgICAgIGlmICghcmVtb3RlT25lKSByZXR1cm4gZXJyb3IoKTtcblxuICAgICAgICAgICAgICBpZiAocmVtb3RlT25lLnR5cGUgPT09ICdkJykgcmV0dXJuIG4oKTtcblxuICAgICAgICAgICAgICBjb25zdCB0b0xvY2FsID0gc2VsZi50b0xvY2FsKHJlbW90ZU9uZS5uYW1lKTtcbiAgICAgICAgICAgICAgbG9jID0gbnVsbDtcblxuICAgICAgICAgICAgICBmb3IgKGxldCBhID0gMCwgYiA9IGxvY2Fscy5sZW5ndGg7IGEgPCBiOyArK2EpIHtcbiAgICAgICAgICAgICAgICBpZiAobG9jYWxzW2FdLm5hbWUgPT09IHRvTG9jYWwpIHtcbiAgICAgICAgICAgICAgICAgIGxvYyA9IGxvY2Fsc1thXTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRG93bmxvYWQgb25seSBpZiBub3QgcHJlc2VudCBvbiBsb2NhbCBvciBzaXplIGRpZmZlclxuICAgICAgICAgICAgICBpZiAoIWxvYyB8fCByZW1vdGVPbmUuc2l6ZSAhPT0gbG9jLnNpemUpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5nZXQocmVtb3RlT25lLm5hbWUsIGZhbHNlLCAoKSA9PiBuKCkpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG4oKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHJlbW90ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHNlbGYuY29ubmVjdG9yLmdldChyZW1vdGUsIGZhbHNlLCAoKSA9PiBuKCkpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGlzRmlsZSk7XG4gICAgICAgICAgLy8gTk9URTogQWRkZWQgaXNGaWxlIHRvIGVuZCBvZiBjYWxsIHRvIHByZXZlbnQgYnJlYWtpbmcgYW55IGZ1bmN0aW9uc1xuICAgICAgICAgIC8vIHRoYXQgYWxyZWFkeSB1c2UgbGlzdCBjb21tYW5kLiBJcyBmaWxlIGlzIHVzZWQgb25seSBmb3IgZnRwIGNvbm5lY3RvclxuICAgICAgICAgIC8vIGFzIGl0IHdpbGwgbGlzdCBhIGZpbGUgYXMgYSBmaWxlIG9mIGl0c2VsZiB1bmxpbmtlIHdpdGggc2Z0cCB3aGljaFxuICAgICAgICAgIC8vIHdpbGwgdGhyb3cgYW4gZXJyb3IuXG4gICAgICB9LCBgU3luYyAke1BhdGguYmFzZW5hbWUocmVtb3RlKX1gKTtcbiAgICB9XG5cbiAgICBzeW5jTG9jYWxGaWxlVG9SZW1vdGUobG9jYWwsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIC8vIHZlcmlmeSBhY3RpdmUgY29ubmVjdGlvblxuICAgICAgaWYgKHNlbGYuc3RhdHVzID09PSAnQ09OTkVDVEVEJykge1xuICAgICAgICAvLyBwcm9ncmVzc1xuICAgICAgICBzZWxmLl9lbnF1ZXVlKCgpID0+IHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5wdXQobG9jYWwsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2suYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBTeW5jOiAke1BhdGguYmFzZW5hbWUobG9jYWwpfWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdSZW1vdGUgRlRQOiBOb3QgY29ubmVjdGVkIScsIHtcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICBzeW5jTG9jYWxEaXJlY3RvcnlUb1JlbW90ZShsb2NhbCwgY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgLy8gdmVyaWZ5IGFjdGl2ZSBjb25uZWN0aW9uXG4gICAgICBpZiAoc2VsZi5zdGF0dXMgPT09ICdDT05ORUNURUQnKSB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlbW90ZSA9IHNlbGYudG9SZW1vdGUobG9jYWwpO1xuXG4gICAgICAgICAgc2VsZi5jb25uZWN0b3IubGlzdChyZW1vdGUsIHRydWUsIChlcnIsIHJlbW90ZXMpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2suYXBwbHkobnVsbCwgW2Vycl0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyYXZlcnNlVHJlZShsb2NhbCwgKGxvY2FscykgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjay5hcHBseShudWxsKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIGlnbm9yZWQgbG9jYWxzXG4gICAgICAgICAgICAgIHNlbGYuY2hlY2tJZ25vcmUobG9jYWwpO1xuICAgICAgICAgICAgICBpZiAoc2VsZi5pZ25vcmVGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gbG9jYWxzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoc2VsZi5pZ25vcmVGaWx0ZXIuaWdub3Jlcyhsb2NhbHNbaV0ubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzLnNwbGljZShpLCAxKTsgLy8gcmVtb3ZlIGZyb20gbGlzdFxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IG4gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbkxvY2FsID0gbG9jYWxzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgbGV0IG5SZW1vdGU7XG5cbiAgICAgICAgICAgICAgICBpZiAoIW5Mb2NhbCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuTG9jYWwudHlwZSA9PT0gJ2QnKSByZXR1cm4gbigpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdG9SZW1vdGUgPSBzZWxmLnRvUmVtb3RlKG5Mb2NhbC5uYW1lKTtcbiAgICAgICAgICAgICAgICBuUmVtb3RlID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGEgPSAwLCBiID0gcmVtb3Rlcy5sZW5ndGg7IGEgPCBiOyArK2EpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChyZW1vdGVzW2FdLm5hbWUgPT09IHRvUmVtb3RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5SZW1vdGUgPSByZW1vdGVzW2FdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBVcGxvYWQgb25seSBpZiBub3QgcHJlc2VudCBvbiByZW1vdGUgb3Igc2l6ZSBkaWZmZXJcbiAgICAgICAgICAgICAgICBpZiAoIW5SZW1vdGUgfHwgcmVtb3RlLnNpemUgIT09IG5Mb2NhbC5zaXplKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5wdXQobkxvY2FsLm5hbWUsICgpID0+IG4oKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIG4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgYFN5bmMgJHtQYXRoLmJhc2VuYW1lKGxvY2FsKX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignUmVtb3RlIEZUUDogTm90IGNvbm5lY3RlZCEnLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgbWtkaXIocmVtb3RlLCByZWN1cnNpdmUsIGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYub25jZUNvbm5lY3RlZCgoKSA9PiB7XG4gICAgICAgIHNlbGYuX2VucXVldWUoKCkgPT4ge1xuICAgICAgICAgIHNlbGYuY29ubmVjdG9yLm1rZGlyKHJlbW90ZSwgcmVjdXJzaXZlLCAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykgY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBDcmVhdGluZyBmb2xkZXIgJHtQYXRoLmJhc2VuYW1lKHJlbW90ZSl9YCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgbWtmaWxlKHJlbW90ZSwgY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZi5vbmNlQ29ubmVjdGVkKCgpID0+IHtcbiAgICAgICAgc2VsZi5fZW5xdWV1ZSgoKSA9PiB7XG4gICAgICAgICAgc2VsZi5jb25uZWN0b3IubWtmaWxlKHJlbW90ZSwgKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICAgICAgc2VsZi5fbmV4dCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBgQ3JlYXRpbmcgZmlsZSAke1BhdGguYmFzZW5hbWUocmVtb3RlKX1gKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICByZW5hbWUoc291cmNlLCBkZXN0LCBjYWxsYmFjaykge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLm9uY2VDb25uZWN0ZWQoKCkgPT4ge1xuICAgICAgICBzZWxmLl9lbnF1ZXVlKCgpID0+IHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3Rvci5yZW5hbWUoc291cmNlLCBkZXN0LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICBzZWxmLl9uZXh0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGBSZW5hbWluZyAke1BhdGguYmFzZW5hbWUoc291cmNlKX1gKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgZGVsZXRlKHJlbW90ZSwgY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZi5vbmNlQ29ubmVjdGVkKCgpID0+IHtcbiAgICAgICAgc2VsZi5fZW5xdWV1ZSgoKSA9PiB7XG4gICAgICAgICAgc2VsZi5jb25uZWN0b3IuZGVsZXRlKHJlbW90ZSwgKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICAgICAgc2VsZi5fbmV4dCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBgRGVsZXRpbmcgJHtQYXRoLmJhc2VuYW1lKHJlbW90ZSl9YCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgc2l0ZShjb21tYW5kLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5vbmNlQ29ubmVjdGVkKCgpID0+IHtcbiAgICAgICAgdGhpcy5jb25uZWN0b3Iuc2l0ZShjb21tYW5kLCAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHByb21wdEZvclBhc3MoKSB7XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIGNvbnN0IGRpYWxvZyA9IG5ldyBQcm9tcHRQYXNzRGlhbG9nKCcnLCB0cnVlKTtcbiAgICAgIGRpYWxvZy5vbignZGlhbG9nLWRvbmUnLCAoZSwgcGFzcykgPT4ge1xuICAgICAgICBzZWxmLmluZm8ucGFzcyA9IHBhc3M7XG4gICAgICAgIHNlbGYuaW5mby5wYXNzcGhyYXNlID0gcGFzcztcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgIHNlbGYuZG9Db25uZWN0KCk7XG4gICAgICB9KTtcbiAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICB9XG5cbiAgICBwcm9tcHRGb3JLZXlib2FyZEludGVyYWN0aXZlKCkge1xuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBjb25zdCBkaWFsb2cgPSBuZXcgUHJvbXB0UGFzc0RpYWxvZyh0cnVlKTtcblxuICAgICAgZGlhbG9nLm9uKCdkaWFsb2ctZG9uZScsIChlLCBwYXNzKSA9PiB7XG4gICAgICAgIHNlbGYuaW5mby52ZXJpZnlDb2RlID0gcGFzcztcbiAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgIHNlbGYuZG9Db25uZWN0KCk7XG4gICAgICB9KTtcblxuICAgICAgZGlhbG9nLmF0dGFjaCgpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy53YXRjaC5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQ2xpZW50O1xufSgpKTtcbiJdfQ==