Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atomSpacePenViews = require('atom-space-pen-views');

var _helpers = require('../helpers');

var _viewsDirectoryView = require('../views/directory-view');

var _viewsDirectoryView2 = _interopRequireDefault(_viewsDirectoryView);

var _viewsPermissionView = require('../views/permission-view');

var _viewsPermissionView2 = _interopRequireDefault(_viewsPermissionView);

var _dialogsAddDialog = require('../dialogs/add-dialog');

var _dialogsAddDialog2 = _interopRequireDefault(_dialogsAddDialog);

var _dialogsMoveDialog = require('../dialogs/move-dialog');

var _dialogsMoveDialog2 = _interopRequireDefault(_dialogsMoveDialog);

var _dialogsNavigateToDialog = require('../dialogs/navigate-to-dialog');

var _dialogsNavigateToDialog2 = _interopRequireDefault(_dialogsNavigateToDialog);

'use babel';

var init = function init() {
  var atom = global.atom;
  var client = atom.project.remoteftp;
  var remoteftp = atom.project['remoteftp-main'];

  var getRemotes = function getRemotes(errMessage) {
    var remotes = remoteftp.treeView.getSelected();

    if (!remotes || remotes.length === 0) {
      atom.notifications.addWarning('Remote FTP: ' + errMessage, {
        dismissable: false
      });
      return false;
    }

    return remotes;
  };

  var createConfig = function createConfig(obj) {
    if (!(0, _helpers.hasProject)()) return;

    var ftpConfigPath = client.getConfigPath();
    var fileExists = _fsPlus2['default'].existsSync(ftpConfigPath);
    var json = JSON.stringify(obj, null, 4);

    var writeFile = true;
    if (fileExists) {
      writeFile = atom.confirm({
        message: 'Do you want to overwrite .ftpconfig?',
        detailedMessage: 'You are overwriting ' + ftpConfigPath,
        buttons: {
          Yes: function Yes() {
            return true;
          },
          No: function No() {
            return false;
          }
        }
      });
    }

    if (writeFile) {
      _fsPlus2['default'].writeFile(ftpConfigPath, json, function (err) {
        if (!err) atom.workspace.open(ftpConfigPath);
      });
    }
  };

  var commands = {
    'remote-ftp:create-ftp-config': {
      enabled: true,
      command: function command() {
        createConfig({
          protocol: 'ftp',
          host: 'example.com',
          port: 21,
          user: 'user',
          pass: 'pass',
          promptForPass: false,
          remote: '/',
          local: '',
          secure: false,
          secureOptions: null,
          connTimeout: 10000,
          pasvTimeout: 10000,
          keepalive: 10000,
          watch: [],
          watchTimeout: 500
        });
      }
    },
    'remote-ftp:create-sftp-config': {
      enabled: true,
      command: function command() {
        createConfig({
          protocol: 'sftp',
          host: 'example.com',
          port: 22,
          user: 'user',
          pass: 'pass',
          promptForPass: false,
          remote: '/',
          local: '',
          agent: '',
          privatekey: '',
          passphrase: '',
          hosthash: '',
          ignorehost: true,
          connTimeout: 10000,
          keepalive: 10000,
          keyboardInteractive: false,
          remoteCommand: '',
          remoteShell: '',
          watch: [],
          watchTimeout: 500
        });
      }
    },
    'remote-ftp:create-ignore-file': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var fileContents = ['.ftpconfig', '.ftpignore', 'id_rsa', '.DS_Store', '.git'];
        var ftpIgnorePath = client.getFilePath('./.ftpignore');

        _fsPlus2['default'].writeFile(ftpIgnorePath, fileContents.join('\n'), function (err) {
          if (!err) atom.workspace.open(ftpIgnorePath);
        });
      }
    },
    'remote-ftp:toggle': {
      enabled: true,
      command: function command() {
        remoteftp.treeView.toggle();
      }
    },
    'remote-ftp:connect': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        client.readConfig(function (e) {
          if (e) {
            atom.notifications.addError('Remote FTP: Could not read `.ftpconfig` file', {
              detail: e,
              dismissable: false
            });

            return;
          }

          var hideFTPTreeView = false;
          if (!remoteftp.treeView.isVisible()) {
            remoteftp.treeView.toggle();
            hideFTPTreeView = true;
          }

          client.connect();

          if (hideFTPTreeView) {
            atom.project.remoteftp.once('connected', function () {
              remoteftp.treeView.toggle();
            });
          }
        });
      }
    },
    'remote-ftp:disconnect': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        client.disconnect();
      }
    },
    'remote-ftp:add-file': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');

        if (remotes === false) return;

        if (!(remotes[0] instanceof _viewsDirectoryView2['default'])) {
          atom.notifications.addError('Remote FTP: Cannot add a file to ' + remotes[0].item.remote, {
            dismissable: false
          });

          return;
        }

        var dialog = new _dialogsAddDialog2['default']('', true);

        dialog.on('new-path', function (e, name) {
          var remote = _path2['default'].join(remotes[0].item.remote, name).replace(/\\/g, '/');
          dialog.close();
          client.mkdir(remotes[0].item.remote, true, function () {
            client.mkfile(remote, function (err) {
              remotes[0].open();
              if (!err) atom.workspace.open(client.toLocal(remote));
            });
          });
        });

        dialog.attach();
      }
    },
    'remote-ftp:add-folder': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');

        if (remotes === false) return;

        if (!(remotes[0] instanceof _viewsDirectoryView2['default'])) {
          atom.notifications.addError('Remote FTP: Cannot add a folder to ' + remotes[0].item.remote, {
            dismissable: false
          });
          return;
        }

        var dialog = new _dialogsAddDialog2['default']('');

        dialog.on('new-path', function (e, name) {
          var remote = _path2['default'].join(remotes[0].item.remote, name).replace(/\\/g, '/');
          client.mkdir(remote, true, function () {
            dialog.close();
            remotes[0].open();
          });
        });

        dialog.attach();
      }
    },
    'remote-ftp:refresh-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;

        remotes.forEach(function (remote) {
          remote.open();
        });
      }
    },
    'remote-ftp:move-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');

        if (remotes === false) return;

        var dialog = new _dialogsMoveDialog2['default'](remotes[0].item.remote);

        dialog.on('path-changed', function (e, newremote) {
          client.rename(remotes[0].item.remote, newremote, function (err) {
            var errMessage = (0, _helpers.getObject)({
              obj: err,
              keys: ['message']
            });

            dialog.close();

            if (errMessage === 'file exists' || errMessage === 'File already exists') {
              atom.notifications.addError('Remote FTP: File / Folder already exists', {
                dismissable: false
              });
              return;
            }

            var parentNew = remoteftp.treeView.resolve(_path2['default'].dirname(newremote));

            if (parentNew) parentNew.open();

            var parentOld = remoteftp.treeView.resolve(_path2['default'].dirname(remotes[0].item.remote));

            if (parentOld && parentOld !== parentNew) parentOld.open();

            remotes[0].destroy();
          });
        });

        dialog.attach();
      }
    },
    'remote-ftp:delete-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');
        if (remotes === false) return;

        atom.confirm({
          message: 'Are you sure you want to delete the selected item ?',
          detailedMessage: 'You are deleting:' + remotes.map(function (view) {
            return '\n  ' + view.item.remote;
          }),
          buttons: {
            'Move to Trash': function MoveToTrash() {
              remotes.forEach(function (view) {
                if (!view) return;

                var dir = _path2['default'].dirname(view.item.remote).replace(/\\/g, '/');
                var parent = remoteftp.treeView.resolve(dir);

                client['delete'](view.item.remote, function (err) {
                  if (!err && parent) {
                    parent.open();
                  }
                });
              });
            },
            Cancel: null
          }
        });
      }
    },
    'remote-ftp:download-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = getRemotes('You need to select a folder first');

        if (remotes === false) return;

        remotes.forEach(function (view) {
          if (!view) return;

          client.download(view.item.remote, true, function () {});
        });
      }
    },
    'remote-ftp:download-active': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;
        if (!client.isConnected()) return;
        if (client.ftpConfigPath !== client.getConfigPath()) return;

        var activeTextEditor = atom.workspace.getActiveTextEditor();

        if (typeof activeTextEditor === 'undefined') return;

        var currentPath = activeTextEditor.getPath();

        if (currentPath === client.getConfigPath()) return;
        if (client.watch.files.indexOf(currentPath) >= 0) return;

        var downloadItem = client.toRemote(currentPath);
        client.download(downloadItem, true, function () {});
      }
    },
    'remote-ftp:download-selected-local': {
      enabled: true,
      command: function command() {
        var _this = this;

        if (!(0, _helpers.hasProject)()) return;

        if (client.root.local === '') {
          atom.notifications.addError('Remote FTP: You must define your local root folder in the projects .ftpconfig file.', {
            dismissable: false
          });

          return;
        }

        if (!client.isConnected()) {
          var _ret = (function () {
            var viewWorkspace = atom.views.getView(atom.workspace);

            atom.commands.dispatch(viewWorkspace, 'remote-ftp:connect');

            client.onceConnected('connected', function () {
              atom.commands.dispatch(viewWorkspace, 'remote-ftp:download-selected-local');
            });

            return {
              v: undefined
            };
          })();

          if (typeof _ret === 'object') return _ret.v;
        }

        // TODO: correctly count files within a subdirectory
        var $treeSelected = (0, _atomSpacePenViews.$)('.tree-view .selected');
        var requestedTransfers = $treeSelected.length;

        var successfulTransfers = 0;
        var attemptedTransfers = 0;

        $treeSelected.each(function () {
          var path = _this.getPath ? _this.getPath() : '';
          var localPath = path.replace(client.root.local, '');

          // if this is windows, the path may have \ instead of / as directory separators
          var remotePath = atom.project.remoteftp.root.remote + localPath.replace(/\\/g, '/');

          client.download(remotePath, true, function () {
            if (atom.config.get('Remote-FTP.notifications.enableTransfer')) {
              // TODO: check if any errors were thrown, indicating an unsuccessful transfer
              attemptedTransfers++;
              successfulTransfers++;
            }
          });
        });

        if (atom.config.get('Remote-FTP.notifications.enableTransfer')) {
          (function () {
            var waitingForTransfers = setInterval(function () {
              if (attemptedTransfers === requestedTransfers) {
                // we're done waiting
                clearInterval(waitingForTransfers);

                if (successfulTransfers === requestedTransfers) {
                  // great, all uploads worked
                  atom.notifications.addSuccess('Remote FTP: All transfers succeeded (' + successfulTransfers + ' of ' + requestedTransfers + ').');
                } else {
                  // :( some uploads failed
                  atom.notifications.addError('Remote FTP: Some transfers failed<br />There were ' + successfulTransfers + ' successful out of an expected ' + requestedTransfers + '.');
                }
              }
            }, 200);
          })();
        }
      }
    },
    'remote-ftp:upload-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        if (!client.isConnected()) {
          var _ret3 = (function () {
            var viewWorkspace = atom.views.getView(atom.workspace);

            atom.commands.dispatch(viewWorkspace, 'remote-ftp:connect');

            atom.project.remoteftp.once('connected', function () {
              atom.commands.dispatch(viewWorkspace, 'remote-ftp:upload-selected');
            });

            return {
              v: undefined
            };
          })();

          if (typeof _ret3 === 'object') return _ret3.v;
        }

        var locals = (0, _atomSpacePenViews.$)('.tree-view .selected').map(function MAP() {
          return this.getPath ? this.getPath() : '';
        }).get();

        var enableTransfer = atom.config.get('Remote-FTP.notifications.enableTransfer');

        var successfulTransfers = undefined;
        var attemptedTransfers = undefined;

        if (enableTransfer) {
          successfulTransfers = 0;
          attemptedTransfers = 0;
        }

        locals.forEach(function (local) {
          if (!local) return;

          client.upload(local, function (err, list) {
            if (enableTransfer) {
              attemptedTransfers++;
            }
            if (err && !/File exists/.test(err)) {
              console.error(err);
              return;
            }

            if (enableTransfer) {
              successfulTransfers++;
            }

            var dirs = [];
            list.forEach(function (item) {
              var remote = client.toRemote(item.name);
              var dir = _path2['default'].dirname(remote);
              if (dirs.indexOf(dir) === -1) dirs.push(dir);
            });

            dirs.forEach(function (dir) {
              var view = remoteftp.treeView.resolve(dir);
              if (view) view.open();
            });
          });
        });

        if (atom.config.get('Remote-FTP.notifications.enableTransfer')) {
          (function () {
            var waitingForTransfers = setInterval(function () {
              if (attemptedTransfers === locals.length) {
                // we're done waiting
                clearInterval(waitingForTransfers);

                if (successfulTransfers === locals.length) {
                  // great, all uploads worked
                  atom.notifications.addSuccess('Remote FTP: All transfers succeeded (' + successfulTransfers + ' of ' + locals.length + ').');
                } else {
                  // :( some uploads failed
                  atom.notifications.addError('Remote FTP: Some transfers failed<br />There were ' + successfulTransfers + ' successful out of an expected ' + locals.length + '.');
                }
              }
            }, 200);
          })();
        }
      }
    },
    'remote-ftp:upload-active': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) return;

        var local = editor.getPath();

        client.upload(local, function (err, list) {
          if (err) return;

          var dirs = [];
          list.forEach(function (item) {
            var remote = atom.project.remoteftp.toRemote(item.name);
            var dir = _path2['default'].dirname(remote);
            if (dirs.indexOf(dir) === -1) dirs.push(dir);
          });

          dirs.forEach(function (dir) {
            var view = remoteftp.treeView.resolve(dir);
            if (view) view.open();
          });
        });
      }
    },
    // Remote -> Local
    'remote-ftp:sync-with-remote': {
      enabled: true,
      command: function command() {
        var remotes = remoteftp.treeView.getSelected();
        remotes.forEach(function (view) {
          if (!view) return;

          // checking to see if we're working with a file
          if (view.item.constructor.name === 'File') {
            try {
              client.syncRemoteFileToLocal(view.item.remote);
            } catch (err) {
              // syncRemoteFileToLocal() is not setup to return any errors here,
              // as they are handled else where. TODO: perhaps look into a way to restructure
              // sequence to handle all errors in one location (here)
              atom.notifications.addError('Remote FTP: Error Syncing "' + _path2['default'].basename(view.item.remote) + '" to local', {
                dismissable: true
              });
            } finally {
              // TODO: Verify transfer was completed successfully by checking files
              // and verifying sizes or hash of both files
              atom.notifications.addInfo('Remote FTP: Synced "' + _path2['default'].basename(view.item.remote) + '" to local!', {
                dismissable: false
              });
            }
          } else {
            // process sync for entire directory
            var isFile = false;
            try {
              client.syncRemoteDirectoryToLocal(view.item.remote, isFile);
            } catch (err) {
              // syncRemoteDirectoryToLocal() is not setup to return any errors here,
              // as they are handled else where. TODO: perhaps look into a way to restructure
              // sequence to handle all errors in one location (here)
              atom.notifications.addError('Remote FTP: Error in Syncing "' + _path2['default'].basename(view.item.remote) + '" to local', {
                dismissable: true
              });
            } finally {
              // TODO: Verify transfer was completed successfully by checking files
              // and verifying sizes or hash of both files
              atom.notifications.addInfo('Remote FTP: Synced "' + _path2['default'].basename(view.item.remote) + '" to local!!', {
                dismissable: false
              });
            }
          }
        });
      }
    },

    // Local -> Remote
    'remote-ftp:sync-with-local': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        if (!client.isConnected()) {
          var _ret5 = (function () {
            var viewWorkspace = atom.views.getView(atom.workspace);

            atom.commands.dispatch(viewWorkspace, 'remote-ftp:connect');

            client.once('connected', function () {
              atom.commands.dispatch(viewWorkspace, 'remote-ftp:sync-with-local');
            });

            return {
              v: undefined
            };
          })();

          if (typeof _ret5 === 'object') return _ret5.v;
        }

        var locals = (0, _atomSpacePenViews.$)('.tree-view .selected').map(function MAP() {
          return this.getPath ? this.getPath() : '';
        }).get();

        locals.forEach(function (local) {
          if (!local) return;

          // checking to see if we're working with a file
          if (_fsPlus2['default'].isFileSync(local) === true) {
            try {
              client.syncLocalFileToRemote(local);
            } catch (err) {
              // syncLocalFileToRemote() is not setup to return any errors here,
              // as they are handled else where. TODO: perhaps look into a way to restructure
              // sequence to handle all errors in one location (here)
              atom.notifications.addError('Remote FTP: Error Syncing "' + _path2['default'].basename(local) + '" to remote', {
                dismissable: true
              });
            } finally {
              // TODO: Verify transfer was completed successfully by checking remote
              // and verifying sizes or hash of both files
              atom.notifications.addInfo('Remote FTP: Synced "' + _path2['default'].basename(local) + '" to remote', {
                dismissable: false
              });
            }
          } else {
            // process sync for entire directory
            try {
              client.syncLocalDirectoryToRemote(local, function () {
                // TODO: Verify transfer was completed successfully by checking remote
                // and verifying sizes or hash of both files
                atom.notifications.addInfo('Remote FTP: Synced "' + local + '" to remote', {
                  dismissable: false
                });
              });
            } catch (err) {
              // syncLocalDirectoryToRemote() is not setup to return any errors here,
              // as they are handled else where. TODO: perhaps look into a way to restructure
              // sequence to handle all errors in one location (here)
              atom.notifications.addError('Remote FTP: Error Syncing "' + local + '" to remote', {
                dismissable: true
              });
            }
          }
        });
      }
    },
    'remote-ftp:abort-current': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        client.abort();
      }
    },
    'remote-ftp:navigate-to': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var dialog = new _dialogsNavigateToDialog2['default']();

        dialog.on('navigate-to', function (e, path) {
          dialog.close();
          client.root.openPath(path);
        });

        dialog.attach();
      }
    },
    'remote-ftp:copy-name': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = remoteftp.treeView.getSelected();

        if (!remotes || remotes.length === 0) return;

        var name = '' + remotes.map(function (data) {
          return data.item.name;
        });

        atom.clipboard.write(name);
      }
    },

    'remote-ftp:permission-selected': {
      enabled: true,
      command: function command() {
        if (!(0, _helpers.hasProject)()) return;

        var remotes = remoteftp.treeView.getSelected();
        if (!remotes || remotes.length === 0) return;

        var isRoot = remotes[0].hasClass('project-root');
        if (isRoot) return;

        var original = remotes[0].item.original;

        var permission = new _viewsPermissionView2['default']({
          rights: original.rights,
          group: original.group,
          owner: original.owner
        }, remotes[0]);
      }
    }

  };

  return commands;
};

exports['default'] = init;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9tZW51cy9jb21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7c0JBRWUsU0FBUzs7OztvQkFDUCxNQUFNOzs7O2lDQUNMLHNCQUFzQjs7dUJBSWpDLFlBQVk7O2tDQUVPLHlCQUF5Qjs7OzttQ0FDeEIsMEJBQTBCOzs7O2dDQUMvQix1QkFBdUI7Ozs7aUNBQ3RCLHdCQUF3Qjs7Ozt1Q0FDeEIsK0JBQStCOzs7O0FBZHRELFdBQVcsQ0FBQzs7QUFpQlosSUFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQVM7QUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUN0QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRWpELE1BQU0sVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLFVBQVUsRUFBSztBQUNqQyxRQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVqRCxRQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3BDLFVBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxrQkFBZ0IsVUFBVSxFQUFJO0FBQ3pELG1CQUFXLEVBQUUsS0FBSztPQUNuQixDQUFDLENBQUM7QUFDSCxhQUFPLEtBQUssQ0FBQztLQUNkOztBQUVELFdBQU8sT0FBTyxDQUFDO0dBQ2hCLENBQUM7O0FBRUYsTUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksR0FBRyxFQUFLO0FBQzVCLFFBQUksQ0FBQywwQkFBWSxFQUFFLE9BQU87O0FBRTFCLFFBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUs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QUFLO0FBQ3JCLGVBQUssRUFBRSxRQUFRLENBQUMsS0FBSztTQUN0QixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ2hCO0tBQ0Y7O0dBRUYsQ0FBQzs7QUFFRixTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztxQkFFYSxJQUFJIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9tZW51cy9jb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgRlMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7ICQgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQge1xuICBoYXNQcm9qZWN0LFxuICBnZXRPYmplY3QsXG59IGZyb20gJy4uL2hlbHBlcnMnO1xuXG5pbXBvcnQgRGlyZWN0b3J5VmlldyBmcm9tICcuLi92aWV3cy9kaXJlY3Rvcnktdmlldyc7XG5pbXBvcnQgUGVybWlzc2lvblZpZXcgZnJvbSAnLi4vdmlld3MvcGVybWlzc2lvbi12aWV3JztcbmltcG9ydCBBZGREaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9hZGQtZGlhbG9nJztcbmltcG9ydCBNb3ZlRGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvbW92ZS1kaWFsb2cnO1xuaW1wb3J0IE5hdmlnYXRlVG8gZnJvbSAnLi4vZGlhbG9ncy9uYXZpZ2F0ZS10by1kaWFsb2cnO1xuXG5cbmNvbnN0IGluaXQgPSAoKSA9PiB7XG4gIGNvbnN0IGF0b20gPSBnbG9iYWwuYXRvbTtcbiAgY29uc3QgY2xpZW50ID0gYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cDtcbiAgY29uc3QgcmVtb3RlZnRwID0gYXRvbS5wcm9qZWN0WydyZW1vdGVmdHAtbWFpbiddO1xuXG4gIGNvbnN0IGdldFJlbW90ZXMgPSAoZXJyTWVzc2FnZSkgPT4ge1xuICAgIGNvbnN0IHJlbW90ZXMgPSByZW1vdGVmdHAudHJlZVZpZXcuZ2V0U2VsZWN0ZWQoKTtcblxuICAgIGlmICghcmVtb3RlcyB8fCByZW1vdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoYFJlbW90ZSBGVFA6ICR7ZXJyTWVzc2FnZX1gLCB7XG4gICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiByZW1vdGVzO1xuICB9O1xuXG4gIGNvbnN0IGNyZWF0ZUNvbmZpZyA9IChvYmopID0+IHtcbiAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZnRwQ29uZmlnUGF0aCA9IGNsaWVudC5nZXRDb25maWdQYXRoKCk7XG4gICAgY29uc3QgZmlsZUV4aXN0cyA9IEZTLmV4aXN0c1N5bmMoZnRwQ29uZmlnUGF0aCk7XG4gICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgNCk7XG5cbiAgICBsZXQgd3JpdGVGaWxlID0gdHJ1ZTtcbiAgICBpZiAoZmlsZUV4aXN0cykge1xuICAgICAgd3JpdGVGaWxlID0gYXRvbS5jb25maXJtKHtcbiAgICAgICAgbWVzc2FnZTogJ0RvIHlvdSB3YW50IHRvIG92ZXJ3cml0ZSAuZnRwY29uZmlnPycsXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogYFlvdSBhcmUgb3ZlcndyaXRpbmcgJHtmdHBDb25maWdQYXRofWAsXG4gICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICBZZXM6ICgpID0+IHRydWUsXG4gICAgICAgICAgTm86ICgpID0+IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHdyaXRlRmlsZSkge1xuICAgICAgRlMud3JpdGVGaWxlKGZ0cENvbmZpZ1BhdGgsIGpzb24sIChlcnIpID0+IHtcbiAgICAgICAgaWYgKCFlcnIpIGF0b20ud29ya3NwYWNlLm9wZW4oZnRwQ29uZmlnUGF0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY29tbWFuZHMgPSB7XG4gICAgJ3JlbW90ZS1mdHA6Y3JlYXRlLWZ0cC1jb25maWcnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgY3JlYXRlQ29uZmlnKHtcbiAgICAgICAgICBwcm90b2NvbDogJ2Z0cCcsXG4gICAgICAgICAgaG9zdDogJ2V4YW1wbGUuY29tJyxcbiAgICAgICAgICBwb3J0OiAyMSxcbiAgICAgICAgICB1c2VyOiAndXNlcicsXG4gICAgICAgICAgcGFzczogJ3Bhc3MnLFxuICAgICAgICAgIHByb21wdEZvclBhc3M6IGZhbHNlLFxuICAgICAgICAgIHJlbW90ZTogJy8nLFxuICAgICAgICAgIGxvY2FsOiAnJyxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgIHNlY3VyZU9wdGlvbnM6IG51bGwsXG4gICAgICAgICAgY29ublRpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgIHBhc3ZUaW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICBrZWVwYWxpdmU6IDEwMDAwLFxuICAgICAgICAgIHdhdGNoOiBbXSxcbiAgICAgICAgICB3YXRjaFRpbWVvdXQ6IDUwMCxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6Y3JlYXRlLXNmdHAtY29uZmlnJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGNyZWF0ZUNvbmZpZyh7XG4gICAgICAgICAgcHJvdG9jb2w6ICdzZnRwJyxcbiAgICAgICAgICBob3N0OiAnZXhhbXBsZS5jb20nLFxuICAgICAgICAgIHBvcnQ6IDIyLFxuICAgICAgICAgIHVzZXI6ICd1c2VyJyxcbiAgICAgICAgICBwYXNzOiAncGFzcycsXG4gICAgICAgICAgcHJvbXB0Rm9yUGFzczogZmFsc2UsXG4gICAgICAgICAgcmVtb3RlOiAnLycsXG4gICAgICAgICAgbG9jYWw6ICcnLFxuICAgICAgICAgIGFnZW50OiAnJyxcbiAgICAgICAgICBwcml2YXRla2V5OiAnJyxcbiAgICAgICAgICBwYXNzcGhyYXNlOiAnJyxcbiAgICAgICAgICBob3N0aGFzaDogJycsXG4gICAgICAgICAgaWdub3JlaG9zdDogdHJ1ZSxcbiAgICAgICAgICBjb25uVGltZW91dDogMTAwMDAsXG4gICAgICAgICAga2VlcGFsaXZlOiAxMDAwMCxcbiAgICAgICAgICBrZXlib2FyZEludGVyYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICByZW1vdGVDb21tYW5kOiAnJyxcbiAgICAgICAgICByZW1vdGVTaGVsbDogJycsXG4gICAgICAgICAgd2F0Y2g6IFtdLFxuICAgICAgICAgIHdhdGNoVGltZW91dDogNTAwLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDpjcmVhdGUtaWdub3JlLWZpbGUnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBmaWxlQ29udGVudHMgPSBbJy5mdHBjb25maWcnLCAnLmZ0cGlnbm9yZScsICdpZF9yc2EnLCAnLkRTX1N0b3JlJywgJy5naXQnXTtcbiAgICAgICAgY29uc3QgZnRwSWdub3JlUGF0aCA9IGNsaWVudC5nZXRGaWxlUGF0aCgnLi8uZnRwaWdub3JlJyk7XG5cbiAgICAgICAgRlMud3JpdGVGaWxlKGZ0cElnbm9yZVBhdGgsIGZpbGVDb250ZW50cy5qb2luKCdcXG4nKSwgKGVycikgPT4ge1xuICAgICAgICAgIGlmICghZXJyKSBhdG9tLndvcmtzcGFjZS5vcGVuKGZ0cElnbm9yZVBhdGgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDp0b2dnbGUnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgcmVtb3RlZnRwLnRyZWVWaWV3LnRvZ2dsZSgpO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOmNvbm5lY3QnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcblxuICAgICAgICBjbGllbnQucmVhZENvbmZpZygoZSkgPT4ge1xuICAgICAgICAgIGlmIChlKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1JlbW90ZSBGVFA6IENvdWxkIG5vdCByZWFkIGAuZnRwY29uZmlnYCBmaWxlJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IGUsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGhpZGVGVFBUcmVlVmlldyA9IGZhbHNlO1xuICAgICAgICAgIGlmICghcmVtb3RlZnRwLnRyZWVWaWV3LmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgICByZW1vdGVmdHAudHJlZVZpZXcudG9nZ2xlKCk7XG4gICAgICAgICAgICBoaWRlRlRQVHJlZVZpZXcgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNsaWVudC5jb25uZWN0KCk7XG5cbiAgICAgICAgICBpZiAoaGlkZUZUUFRyZWVWaWV3KSB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3QucmVtb3RlZnRwLm9uY2UoJ2Nvbm5lY3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmVtb3RlZnRwLnRyZWVWaWV3LnRvZ2dsZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDpkaXNjb25uZWN0Jzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY2xpZW50LmRpc2Nvbm5lY3QoKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDphZGQtZmlsZSc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlbW90ZXMgPSBnZXRSZW1vdGVzKCdZb3UgbmVlZCB0byBzZWxlY3QgYSBmb2xkZXIgZmlyc3QnKTtcblxuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgICBpZiAoIShyZW1vdGVzWzBdIGluc3RhbmNlb2YgRGlyZWN0b3J5VmlldykpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6IENhbm5vdCBhZGQgYSBmaWxlIHRvICR7cmVtb3Rlc1swXS5pdGVtLnJlbW90ZX1gLCB7XG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkaWFsb2cgPSBuZXcgQWRkRGlhbG9nKCcnLCB0cnVlKTtcblxuICAgICAgICBkaWFsb2cub24oJ25ldy1wYXRoJywgKGUsIG5hbWUpID0+IHtcbiAgICAgICAgICBjb25zdCByZW1vdGUgPSBQYXRoLmpvaW4ocmVtb3Rlc1swXS5pdGVtLnJlbW90ZSwgbmFtZSkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgIGNsaWVudC5ta2RpcihyZW1vdGVzWzBdLml0ZW0ucmVtb3RlLCB0cnVlLCAoKSA9PiB7XG4gICAgICAgICAgICBjbGllbnQubWtmaWxlKHJlbW90ZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICByZW1vdGVzWzBdLm9wZW4oKTtcbiAgICAgICAgICAgICAgaWYgKCFlcnIpIGF0b20ud29ya3NwYWNlLm9wZW4oY2xpZW50LnRvTG9jYWwocmVtb3RlKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlhbG9nLmF0dGFjaCgpO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOmFkZC1mb2xkZXInOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCByZW1vdGVzID0gZ2V0UmVtb3RlcygnWW91IG5lZWQgdG8gc2VsZWN0IGEgZm9sZGVyIGZpcnN0Jyk7XG5cbiAgICAgICAgaWYgKHJlbW90ZXMgPT09IGZhbHNlKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCEocmVtb3Rlc1swXSBpbnN0YW5jZW9mIERpcmVjdG9yeVZpZXcpKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW1vdGUgRlRQOiBDYW5ub3QgYWRkIGEgZm9sZGVyIHRvICR7cmVtb3Rlc1swXS5pdGVtLnJlbW90ZX1gLCB7XG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IEFkZERpYWxvZygnJyk7XG5cbiAgICAgICAgZGlhbG9nLm9uKCduZXctcGF0aCcsIChlLCBuYW1lKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVtb3RlID0gUGF0aC5qb2luKHJlbW90ZXNbMF0uaXRlbS5yZW1vdGUsIG5hbWUpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICAgIGNsaWVudC5ta2RpcihyZW1vdGUsIHRydWUsICgpID0+IHtcbiAgICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgICAgcmVtb3Rlc1swXS5vcGVuKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRpYWxvZy5hdHRhY2goKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDpyZWZyZXNoLXNlbGVjdGVkJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVtb3RlcyA9IGdldFJlbW90ZXMoJ1lvdSBuZWVkIHRvIHNlbGVjdCBhIGZvbGRlciBmaXJzdCcpO1xuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgICByZW1vdGVzLmZvckVhY2goKHJlbW90ZSkgPT4ge1xuICAgICAgICAgIHJlbW90ZS5vcGVuKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOm1vdmUtc2VsZWN0ZWQnOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCByZW1vdGVzID0gZ2V0UmVtb3RlcygnWW91IG5lZWQgdG8gc2VsZWN0IGEgZm9sZGVyIGZpcnN0Jyk7XG5cbiAgICAgICAgaWYgKHJlbW90ZXMgPT09IGZhbHNlKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IE1vdmVEaWFsb2cocmVtb3Rlc1swXS5pdGVtLnJlbW90ZSk7XG5cbiAgICAgICAgZGlhbG9nLm9uKCdwYXRoLWNoYW5nZWQnLCAoZSwgbmV3cmVtb3RlKSA9PiB7XG4gICAgICAgICAgY2xpZW50LnJlbmFtZShyZW1vdGVzWzBdLml0ZW0ucmVtb3RlLCBuZXdyZW1vdGUsIChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVyck1lc3NhZ2UgPSBnZXRPYmplY3Qoe1xuICAgICAgICAgICAgICBvYmo6IGVycixcbiAgICAgICAgICAgICAga2V5czogWydtZXNzYWdlJ10sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG5cbiAgICAgICAgICAgIGlmIChlcnJNZXNzYWdlID09PSAnZmlsZSBleGlzdHMnIHx8IGVyck1lc3NhZ2UgPT09ICdGaWxlIGFscmVhZHkgZXhpc3RzJykge1xuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1JlbW90ZSBGVFA6IEZpbGUgLyBGb2xkZXIgYWxyZWFkeSBleGlzdHMnLCB7XG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYXJlbnROZXcgPSByZW1vdGVmdHAudHJlZVZpZXcucmVzb2x2ZShQYXRoLmRpcm5hbWUobmV3cmVtb3RlKSk7XG5cbiAgICAgICAgICAgIGlmIChwYXJlbnROZXcpIHBhcmVudE5ldy5vcGVuKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBhcmVudE9sZCA9IHJlbW90ZWZ0cC50cmVlVmlldy5yZXNvbHZlKFBhdGguZGlybmFtZShyZW1vdGVzWzBdLml0ZW0ucmVtb3RlKSk7XG5cbiAgICAgICAgICAgIGlmIChwYXJlbnRPbGQgJiYgcGFyZW50T2xkICE9PSBwYXJlbnROZXcpIHBhcmVudE9sZC5vcGVuKCk7XG5cbiAgICAgICAgICAgIHJlbW90ZXNbMF0uZGVzdHJveSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaWFsb2cuYXR0YWNoKCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6ZGVsZXRlLXNlbGVjdGVkJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVtb3RlcyA9IGdldFJlbW90ZXMoJ1lvdSBuZWVkIHRvIHNlbGVjdCBhIGZvbGRlciBmaXJzdCcpO1xuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICAgIG1lc3NhZ2U6ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBzZWxlY3RlZCBpdGVtID8nLFxuICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogYFlvdSBhcmUgZGVsZXRpbmc6JHtyZW1vdGVzLm1hcCh2aWV3ID0+IGBcXG4gICR7dmlldy5pdGVtLnJlbW90ZX1gKX1gLFxuICAgICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAgICdNb3ZlIHRvIFRyYXNoJzogKCkgPT4ge1xuICAgICAgICAgICAgICByZW1vdGVzLmZvckVhY2goKHZpZXcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IFBhdGguZGlybmFtZSh2aWV3Lml0ZW0ucmVtb3RlKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gcmVtb3RlZnRwLnRyZWVWaWV3LnJlc29sdmUoZGlyKTtcblxuICAgICAgICAgICAgICAgIGNsaWVudC5kZWxldGUodmlldy5pdGVtLnJlbW90ZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIENhbmNlbDogbnVsbCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDpkb3dubG9hZC1zZWxlY3RlZCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlbW90ZXMgPSBnZXRSZW1vdGVzKCdZb3UgbmVlZCB0byBzZWxlY3QgYSBmb2xkZXIgZmlyc3QnKTtcblxuICAgICAgICBpZiAocmVtb3RlcyA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgICByZW1vdGVzLmZvckVhY2goKHZpZXcpID0+IHtcbiAgICAgICAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgICAgICAgIGNsaWVudC5kb3dubG9hZCh2aWV3Lml0ZW0ucmVtb3RlLCB0cnVlLCAoKSA9PiB7XG5cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6ZG93bmxvYWQtYWN0aXZlJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG4gICAgICAgIGlmICghY2xpZW50LmlzQ29ubmVjdGVkKCkpIHJldHVybjtcbiAgICAgICAgaWYgKGNsaWVudC5mdHBDb25maWdQYXRoICE9PSBjbGllbnQuZ2V0Q29uZmlnUGF0aCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblxuICAgICAgICBpZiAodHlwZW9mIGFjdGl2ZVRleHRFZGl0b3IgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY3VycmVudFBhdGggPSBhY3RpdmVUZXh0RWRpdG9yLmdldFBhdGgoKTtcblxuICAgICAgICBpZiAoY3VycmVudFBhdGggPT09IGNsaWVudC5nZXRDb25maWdQYXRoKCkpIHJldHVybjtcbiAgICAgICAgaWYgKGNsaWVudC53YXRjaC5maWxlcy5pbmRleE9mKGN1cnJlbnRQYXRoKSA+PSAwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZG93bmxvYWRJdGVtID0gY2xpZW50LnRvUmVtb3RlKGN1cnJlbnRQYXRoKTtcbiAgICAgICAgY2xpZW50LmRvd25sb2FkKGRvd25sb2FkSXRlbSwgdHJ1ZSwgKCkgPT4ge1xuXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOmRvd25sb2FkLXNlbGVjdGVkLWxvY2FsJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGNsaWVudC5yb290LmxvY2FsID09PSAnJykge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignUmVtb3RlIEZUUDogWW91IG11c3QgZGVmaW5lIHlvdXIgbG9jYWwgcm9vdCBmb2xkZXIgaW4gdGhlIHByb2plY3RzIC5mdHBjb25maWcgZmlsZS4nLCB7XG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNsaWVudC5pc0Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgY29uc3Qgdmlld1dvcmtzcGFjZSA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHZpZXdXb3Jrc3BhY2UsICdyZW1vdGUtZnRwOmNvbm5lY3QnKTtcblxuICAgICAgICAgIGNsaWVudC5vbmNlQ29ubmVjdGVkKCdjb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHZpZXdXb3Jrc3BhY2UsICdyZW1vdGUtZnRwOmRvd25sb2FkLXNlbGVjdGVkLWxvY2FsJyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBjb3JyZWN0bHkgY291bnQgZmlsZXMgd2l0aGluIGEgc3ViZGlyZWN0b3J5XG4gICAgICAgIGNvbnN0ICR0cmVlU2VsZWN0ZWQgPSAkKCcudHJlZS12aWV3IC5zZWxlY3RlZCcpO1xuICAgICAgICBjb25zdCByZXF1ZXN0ZWRUcmFuc2ZlcnMgPSAkdHJlZVNlbGVjdGVkLmxlbmd0aDtcblxuICAgICAgICBsZXQgc3VjY2Vzc2Z1bFRyYW5zZmVycyA9IDA7XG4gICAgICAgIGxldCBhdHRlbXB0ZWRUcmFuc2ZlcnMgPSAwO1xuXG4gICAgICAgICR0cmVlU2VsZWN0ZWQuZWFjaCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGF0aCA9IHRoaXMuZ2V0UGF0aCA/IHRoaXMuZ2V0UGF0aCgpIDogJyc7XG4gICAgICAgICAgY29uc3QgbG9jYWxQYXRoID0gcGF0aC5yZXBsYWNlKGNsaWVudC5yb290LmxvY2FsLCAnJyk7XG5cbiAgICAgICAgICAvLyBpZiB0aGlzIGlzIHdpbmRvd3MsIHRoZSBwYXRoIG1heSBoYXZlIFxcIGluc3RlYWQgb2YgLyBhcyBkaXJlY3Rvcnkgc2VwYXJhdG9yc1xuICAgICAgICAgIGNvbnN0IHJlbW90ZVBhdGggPSBhdG9tLnByb2plY3QucmVtb3RlZnRwLnJvb3QucmVtb3RlICsgbG9jYWxQYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblxuICAgICAgICAgIGNsaWVudC5kb3dubG9hZChyZW1vdGVQYXRoLCB0cnVlLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLm5vdGlmaWNhdGlvbnMuZW5hYmxlVHJhbnNmZXInKSkge1xuICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBhbnkgZXJyb3JzIHdlcmUgdGhyb3duLCBpbmRpY2F0aW5nIGFuIHVuc3VjY2Vzc2Z1bCB0cmFuc2ZlclxuICAgICAgICAgICAgICBhdHRlbXB0ZWRUcmFuc2ZlcnMrKztcbiAgICAgICAgICAgICAgc3VjY2Vzc2Z1bFRyYW5zZmVycysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLm5vdGlmaWNhdGlvbnMuZW5hYmxlVHJhbnNmZXInKSkge1xuICAgICAgICAgIGNvbnN0IHdhaXRpbmdGb3JUcmFuc2ZlcnMgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXR0ZW1wdGVkVHJhbnNmZXJzID09PSByZXF1ZXN0ZWRUcmFuc2ZlcnMpIHtcbiAgICAgICAgICAgICAgLy8gd2UncmUgZG9uZSB3YWl0aW5nXG4gICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwod2FpdGluZ0ZvclRyYW5zZmVycyk7XG5cbiAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NmdWxUcmFuc2ZlcnMgPT09IHJlcXVlc3RlZFRyYW5zZmVycykge1xuICAgICAgICAgICAgICAgIC8vIGdyZWF0LCBhbGwgdXBsb2FkcyB3b3JrZWRcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhgUmVtb3RlIEZUUDogQWxsIHRyYW5zZmVycyBzdWNjZWVkZWQgKCR7c3VjY2Vzc2Z1bFRyYW5zZmVyc30gb2YgJHtyZXF1ZXN0ZWRUcmFuc2ZlcnN9KS5gKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyA6KCBzb21lIHVwbG9hZHMgZmFpbGVkXG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW1vdGUgRlRQOiBTb21lIHRyYW5zZmVycyBmYWlsZWQ8YnIgLz5UaGVyZSB3ZXJlICR7c3VjY2Vzc2Z1bFRyYW5zZmVyc30gc3VjY2Vzc2Z1bCBvdXQgb2YgYW4gZXhwZWN0ZWQgJHtyZXF1ZXN0ZWRUcmFuc2ZlcnN9LmApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICAgICdyZW1vdGUtZnRwOnVwbG9hZC1zZWxlY3RlZCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghY2xpZW50LmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICBjb25zdCB2aWV3V29ya3NwYWNlID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godmlld1dvcmtzcGFjZSwgJ3JlbW90ZS1mdHA6Y29ubmVjdCcpO1xuXG4gICAgICAgICAgYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC5vbmNlKCdjb25uZWN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHZpZXdXb3Jrc3BhY2UsICdyZW1vdGUtZnRwOnVwbG9hZC1zZWxlY3RlZCcpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9jYWxzID0gJCgnLnRyZWUtdmlldyAuc2VsZWN0ZWQnKS5tYXAoZnVuY3Rpb24gTUFQKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFBhdGggPyB0aGlzLmdldFBhdGgoKSA6ICcnO1xuICAgICAgICB9KS5nZXQoKTtcblxuICAgICAgICBjb25zdCBlbmFibGVUcmFuc2ZlciA9IGF0b20uY29uZmlnLmdldCgnUmVtb3RlLUZUUC5ub3RpZmljYXRpb25zLmVuYWJsZVRyYW5zZmVyJyk7XG5cbiAgICAgICAgbGV0IHN1Y2Nlc3NmdWxUcmFuc2ZlcnM7XG4gICAgICAgIGxldCBhdHRlbXB0ZWRUcmFuc2ZlcnM7XG5cbiAgICAgICAgaWYgKGVuYWJsZVRyYW5zZmVyKSB7XG4gICAgICAgICAgc3VjY2Vzc2Z1bFRyYW5zZmVycyA9IDA7XG4gICAgICAgICAgYXR0ZW1wdGVkVHJhbnNmZXJzID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2Fscy5mb3JFYWNoKChsb2NhbCkgPT4ge1xuICAgICAgICAgIGlmICghbG9jYWwpIHJldHVybjtcblxuICAgICAgICAgIGNsaWVudC51cGxvYWQobG9jYWwsIChlcnIsIGxpc3QpID0+IHtcbiAgICAgICAgICAgIGlmIChlbmFibGVUcmFuc2ZlcikgeyBhdHRlbXB0ZWRUcmFuc2ZlcnMrKzsgfVxuICAgICAgICAgICAgaWYgKGVyciAmJiAhL0ZpbGUgZXhpc3RzLy50ZXN0KGVycikpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbmFibGVUcmFuc2ZlcikgeyBzdWNjZXNzZnVsVHJhbnNmZXJzKys7IH1cblxuICAgICAgICAgICAgY29uc3QgZGlycyA9IFtdO1xuICAgICAgICAgICAgbGlzdC5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlbW90ZSA9IGNsaWVudC50b1JlbW90ZShpdGVtLm5hbWUpO1xuICAgICAgICAgICAgICBjb25zdCBkaXIgPSBQYXRoLmRpcm5hbWUocmVtb3RlKTtcbiAgICAgICAgICAgICAgaWYgKGRpcnMuaW5kZXhPZihkaXIpID09PSAtMSkgZGlycy5wdXNoKGRpcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGlycy5mb3JFYWNoKChkaXIpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgdmlldyA9IHJlbW90ZWZ0cC50cmVlVmlldy5yZXNvbHZlKGRpcik7XG4gICAgICAgICAgICAgIGlmICh2aWV3KSB2aWV3Lm9wZW4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdSZW1vdGUtRlRQLm5vdGlmaWNhdGlvbnMuZW5hYmxlVHJhbnNmZXInKSkge1xuICAgICAgICAgIGNvbnN0IHdhaXRpbmdGb3JUcmFuc2ZlcnMgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXR0ZW1wdGVkVHJhbnNmZXJzID09PSBsb2NhbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmUgd2FpdGluZ1xuICAgICAgICAgICAgICBjbGVhckludGVydmFsKHdhaXRpbmdGb3JUcmFuc2ZlcnMpO1xuXG4gICAgICAgICAgICAgIGlmIChzdWNjZXNzZnVsVHJhbnNmZXJzID09PSBsb2NhbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gZ3JlYXQsIGFsbCB1cGxvYWRzIHdvcmtlZFxuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKGBSZW1vdGUgRlRQOiBBbGwgdHJhbnNmZXJzIHN1Y2NlZWRlZCAoJHtzdWNjZXNzZnVsVHJhbnNmZXJzfSBvZiAke2xvY2Fscy5sZW5ndGh9KS5gKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyA6KCBzb21lIHVwbG9hZHMgZmFpbGVkXG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW1vdGUgRlRQOiBTb21lIHRyYW5zZmVycyBmYWlsZWQ8YnIgLz5UaGVyZSB3ZXJlICR7c3VjY2Vzc2Z1bFRyYW5zZmVyc30gc3VjY2Vzc2Z1bCBvdXQgb2YgYW4gZXhwZWN0ZWQgJHtsb2NhbHMubGVuZ3RofS5gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDp1cGxvYWQtYWN0aXZlJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGxvY2FsID0gZWRpdG9yLmdldFBhdGgoKTtcblxuICAgICAgICBjbGllbnQudXBsb2FkKGxvY2FsLCAoZXJyLCBsaXN0KSA9PiB7XG4gICAgICAgICAgaWYgKGVycikgcmV0dXJuO1xuXG4gICAgICAgICAgY29uc3QgZGlycyA9IFtdO1xuICAgICAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVtb3RlID0gYXRvbS5wcm9qZWN0LnJlbW90ZWZ0cC50b1JlbW90ZShpdGVtLm5hbWUpO1xuICAgICAgICAgICAgY29uc3QgZGlyID0gUGF0aC5kaXJuYW1lKHJlbW90ZSk7XG4gICAgICAgICAgICBpZiAoZGlycy5pbmRleE9mKGRpcikgPT09IC0xKSBkaXJzLnB1c2goZGlyKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGRpcnMuZm9yRWFjaCgoZGlyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2aWV3ID0gcmVtb3RlZnRwLnRyZWVWaWV3LnJlc29sdmUoZGlyKTtcbiAgICAgICAgICAgIGlmICh2aWV3KSB2aWV3Lm9wZW4oKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gUmVtb3RlIC0+IExvY2FsXG4gICAgJ3JlbW90ZS1mdHA6c3luYy13aXRoLXJlbW90ZSc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBjb25zdCByZW1vdGVzID0gcmVtb3RlZnRwLnRyZWVWaWV3LmdldFNlbGVjdGVkKCk7XG4gICAgICAgIHJlbW90ZXMuZm9yRWFjaCgodmlldykgPT4ge1xuICAgICAgICAgIGlmICghdmlldykgcmV0dXJuO1xuXG4gICAgICAgICAgLy8gY2hlY2tpbmcgdG8gc2VlIGlmIHdlJ3JlIHdvcmtpbmcgd2l0aCBhIGZpbGVcbiAgICAgICAgICBpZiAodmlldy5pdGVtLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdGaWxlJykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY2xpZW50LnN5bmNSZW1vdGVGaWxlVG9Mb2NhbCh2aWV3Lml0ZW0ucmVtb3RlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAvLyBzeW5jUmVtb3RlRmlsZVRvTG9jYWwoKSBpcyBub3Qgc2V0dXAgdG8gcmV0dXJuIGFueSBlcnJvcnMgaGVyZSxcbiAgICAgICAgICAgICAgLy8gYXMgdGhleSBhcmUgaGFuZGxlZCBlbHNlIHdoZXJlLiBUT0RPOiBwZXJoYXBzIGxvb2sgaW50byBhIHdheSB0byByZXN0cnVjdHVyZVxuICAgICAgICAgICAgICAvLyBzZXF1ZW5jZSB0byBoYW5kbGUgYWxsIGVycm9ycyBpbiBvbmUgbG9jYXRpb24gKGhlcmUpXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVtb3RlIEZUUDogRXJyb3IgU3luY2luZyBcIiR7UGF0aC5iYXNlbmFtZSh2aWV3Lml0ZW0ucmVtb3RlKX1cIiB0byBsb2NhbGAsIHtcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAvLyBUT0RPOiBWZXJpZnkgdHJhbnNmZXIgd2FzIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkgYnkgY2hlY2tpbmcgZmlsZXNcbiAgICAgICAgICAgICAgLy8gYW5kIHZlcmlmeWluZyBzaXplcyBvciBoYXNoIG9mIGJvdGggZmlsZXNcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oYFJlbW90ZSBGVFA6IFN5bmNlZCBcIiR7UGF0aC5iYXNlbmFtZSh2aWV3Lml0ZW0ucmVtb3RlKX1cIiB0byBsb2NhbCFgLCB7XG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgeyAvLyBwcm9jZXNzIHN5bmMgZm9yIGVudGlyZSBkaXJlY3RvcnlcbiAgICAgICAgICAgIGNvbnN0IGlzRmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY2xpZW50LnN5bmNSZW1vdGVEaXJlY3RvcnlUb0xvY2FsKHZpZXcuaXRlbS5yZW1vdGUsIGlzRmlsZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgLy8gc3luY1JlbW90ZURpcmVjdG9yeVRvTG9jYWwoKSBpcyBub3Qgc2V0dXAgdG8gcmV0dXJuIGFueSBlcnJvcnMgaGVyZSxcbiAgICAgICAgICAgICAgLy8gYXMgdGhleSBhcmUgaGFuZGxlZCBlbHNlIHdoZXJlLiBUT0RPOiBwZXJoYXBzIGxvb2sgaW50byBhIHdheSB0byByZXN0cnVjdHVyZVxuICAgICAgICAgICAgICAvLyBzZXF1ZW5jZSB0byBoYW5kbGUgYWxsIGVycm9ycyBpbiBvbmUgbG9jYXRpb24gKGhlcmUpXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVtb3RlIEZUUDogRXJyb3IgaW4gU3luY2luZyBcIiR7UGF0aC5iYXNlbmFtZSh2aWV3Lml0ZW0ucmVtb3RlKX1cIiB0byBsb2NhbGAsIHtcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAvLyBUT0RPOiBWZXJpZnkgdHJhbnNmZXIgd2FzIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkgYnkgY2hlY2tpbmcgZmlsZXNcbiAgICAgICAgICAgICAgLy8gYW5kIHZlcmlmeWluZyBzaXplcyBvciBoYXNoIG9mIGJvdGggZmlsZXNcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oYFJlbW90ZSBGVFA6IFN5bmNlZCBcIiR7UGF0aC5iYXNlbmFtZSh2aWV3Lml0ZW0ucmVtb3RlKX1cIiB0byBsb2NhbCEhYCwge1xuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIExvY2FsIC0+IFJlbW90ZVxuICAgICdyZW1vdGUtZnRwOnN5bmMtd2l0aC1sb2NhbCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghY2xpZW50LmlzQ29ubmVjdGVkKCkpIHtcbiAgICAgICAgICBjb25zdCB2aWV3V29ya3NwYWNlID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcblxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godmlld1dvcmtzcGFjZSwgJ3JlbW90ZS1mdHA6Y29ubmVjdCcpO1xuXG4gICAgICAgICAgY2xpZW50Lm9uY2UoJ2Nvbm5lY3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godmlld1dvcmtzcGFjZSwgJ3JlbW90ZS1mdHA6c3luYy13aXRoLWxvY2FsJyk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsb2NhbHMgPSAkKCcudHJlZS12aWV3IC5zZWxlY3RlZCcpLm1hcChmdW5jdGlvbiBNQVAoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGF0aCA/IHRoaXMuZ2V0UGF0aCgpIDogJyc7XG4gICAgICAgIH0pLmdldCgpO1xuXG4gICAgICAgIGxvY2Fscy5mb3JFYWNoKChsb2NhbCkgPT4ge1xuICAgICAgICAgIGlmICghbG9jYWwpIHJldHVybjtcblxuICAgICAgICAgIC8vIGNoZWNraW5nIHRvIHNlZSBpZiB3ZSdyZSB3b3JraW5nIHdpdGggYSBmaWxlXG4gICAgICAgICAgaWYgKEZTLmlzRmlsZVN5bmMobG9jYWwpID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjbGllbnQuc3luY0xvY2FsRmlsZVRvUmVtb3RlKGxvY2FsKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAvLyBzeW5jTG9jYWxGaWxlVG9SZW1vdGUoKSBpcyBub3Qgc2V0dXAgdG8gcmV0dXJuIGFueSBlcnJvcnMgaGVyZSxcbiAgICAgICAgICAgICAgLy8gYXMgdGhleSBhcmUgaGFuZGxlZCBlbHNlIHdoZXJlLiBUT0RPOiBwZXJoYXBzIGxvb2sgaW50byBhIHdheSB0byByZXN0cnVjdHVyZVxuICAgICAgICAgICAgICAvLyBzZXF1ZW5jZSB0byBoYW5kbGUgYWxsIGVycm9ycyBpbiBvbmUgbG9jYXRpb24gKGhlcmUpXG4gICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgUmVtb3RlIEZUUDogRXJyb3IgU3luY2luZyBcIiR7UGF0aC5iYXNlbmFtZShsb2NhbCl9XCIgdG8gcmVtb3RlYCwge1xuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgIC8vIFRPRE86IFZlcmlmeSB0cmFuc2ZlciB3YXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseSBieSBjaGVja2luZyByZW1vdGVcbiAgICAgICAgICAgICAgLy8gYW5kIHZlcmlmeWluZyBzaXplcyBvciBoYXNoIG9mIGJvdGggZmlsZXNcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oYFJlbW90ZSBGVFA6IFN5bmNlZCBcIiR7UGF0aC5iYXNlbmFtZShsb2NhbCl9XCIgdG8gcmVtb3RlYCwge1xuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHsgLy8gcHJvY2VzcyBzeW5jIGZvciBlbnRpcmUgZGlyZWN0b3J5XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjbGllbnQuc3luY0xvY2FsRGlyZWN0b3J5VG9SZW1vdGUobG9jYWwsICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBWZXJpZnkgdHJhbnNmZXIgd2FzIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkgYnkgY2hlY2tpbmcgcmVtb3RlXG4gICAgICAgICAgICAgICAgLy8gYW5kIHZlcmlmeWluZyBzaXplcyBvciBoYXNoIG9mIGJvdGggZmlsZXNcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhgUmVtb3RlIEZUUDogU3luY2VkIFwiJHtsb2NhbH1cIiB0byByZW1vdGVgLCB7XG4gICAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIC8vIHN5bmNMb2NhbERpcmVjdG9yeVRvUmVtb3RlKCkgaXMgbm90IHNldHVwIHRvIHJldHVybiBhbnkgZXJyb3JzIGhlcmUsXG4gICAgICAgICAgICAgIC8vIGFzIHRoZXkgYXJlIGhhbmRsZWQgZWxzZSB3aGVyZS4gVE9ETzogcGVyaGFwcyBsb29rIGludG8gYSB3YXkgdG8gcmVzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgLy8gc2VxdWVuY2UgdG8gaGFuZGxlIGFsbCBlcnJvcnMgaW4gb25lIGxvY2F0aW9uIChoZXJlKVxuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFJlbW90ZSBGVFA6IEVycm9yIFN5bmNpbmcgXCIke2xvY2FsfVwiIHRvIHJlbW90ZWAsIHtcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICAncmVtb3RlLWZ0cDphYm9ydC1jdXJyZW50Jzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY2xpZW50LmFib3J0KCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6bmF2aWdhdGUtdG8nOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgY29tbWFuZCgpIHtcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0KCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBkaWFsb2cgPSBuZXcgTmF2aWdhdGVUbygpO1xuXG4gICAgICAgIGRpYWxvZy5vbignbmF2aWdhdGUtdG8nLCAoZSwgcGF0aCkgPT4ge1xuICAgICAgICAgIGRpYWxvZy5jbG9zZSgpO1xuICAgICAgICAgIGNsaWVudC5yb290Lm9wZW5QYXRoKHBhdGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkaWFsb2cuYXR0YWNoKCk7XG4gICAgICB9LFxuICAgIH0sXG4gICAgJ3JlbW90ZS1mdHA6Y29weS1uYW1lJzoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGNvbW1hbmQoKSB7XG4gICAgICAgIGlmICghaGFzUHJvamVjdCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcmVtb3RlcyA9IHJlbW90ZWZ0cC50cmVlVmlldy5nZXRTZWxlY3RlZCgpO1xuXG4gICAgICAgIGlmICghcmVtb3RlcyB8fCByZW1vdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBgJHtyZW1vdGVzLm1hcChkYXRhID0+IGRhdGEuaXRlbS5uYW1lKX1gO1xuXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKG5hbWUpO1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgJ3JlbW90ZS1mdHA6cGVybWlzc2lvbi1zZWxlY3RlZCc6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBjb21tYW5kKCkge1xuICAgICAgICBpZiAoIWhhc1Byb2plY3QoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlbW90ZXMgPSByZW1vdGVmdHAudHJlZVZpZXcuZ2V0U2VsZWN0ZWQoKTtcbiAgICAgICAgaWYgKCFyZW1vdGVzIHx8IHJlbW90ZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaXNSb290ID0gcmVtb3Rlc1swXS5oYXNDbGFzcygncHJvamVjdC1yb290Jyk7XG4gICAgICAgIGlmIChpc1Jvb3QpIHJldHVybjtcblxuICAgICAgICBjb25zdCBvcmlnaW5hbCA9IHJlbW90ZXNbMF0uaXRlbS5vcmlnaW5hbDtcblxuICAgICAgICBjb25zdCBwZXJtaXNzaW9uID0gbmV3IFBlcm1pc3Npb25WaWV3KHtcbiAgICAgICAgICByaWdodHM6IG9yaWdpbmFsLnJpZ2h0cyxcbiAgICAgICAgICBncm91cDogb3JpZ2luYWwuZ3JvdXAsXG4gICAgICAgICAgb3duZXI6IG9yaWdpbmFsLm93bmVyLFxuICAgICAgICB9LCByZW1vdGVzWzBdKTtcbiAgICAgIH0sXG4gICAgfSxcblxuICB9O1xuXG4gIHJldHVybiBjb21tYW5kcztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGluaXQ7XG4iXX0=