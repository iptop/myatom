Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* global atom */

var _events = require('events');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _gitIgnoreParser = require('git-ignore-parser');

var _gitIgnoreParser2 = _interopRequireDefault(_gitIgnoreParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _atom = require('atom');

var _utils = require('./utils');

'use babel';
var PathsCache = (function (_EventEmitter) {
  _inherits(PathsCache, _EventEmitter);

  function PathsCache() {
    var _this = this;

    _classCallCheck(this, PathsCache);

    _get(Object.getPrototypeOf(PathsCache.prototype), 'constructor', this).call(this);

    this._projectChangeWatcher = atom.project.onDidChangePaths(function () {
      return _this.rebuildCache();
    });

    this._repositories = [];
    this._filePathsByProjectDirectory = new Map();
    this._filePathsByDirectory = new Map();
    this._fileWatchersByDirectory = new Map();
  }

  /**
   * Checks if the given path is ignored
   * @param  {String}  path
   * @return {Boolean}
   * @private
   */

  _createClass(PathsCache, [{
    key: '_isPathIgnored',
    value: function _isPathIgnored(path) {
      var ignored = false;
      if (atom.config.get('core.excludeVcsIgnoredPaths')) {
        this._repositories.forEach(function (repository) {
          if (ignored) return;
          var ignoreSubmodules = atom.config.get('autocomplete-paths.ignoreSubmodules');
          var isIgnoredSubmodule = ignoreSubmodules && repository.isSubmodule(path);
          if (repository.isPathIgnored(path) || isIgnoredSubmodule) {
            ignored = true;
          }
        });
      }

      if (atom.config.get('autocomplete-paths.ignoredNames')) {
        var ignoredNames = atom.config.get('core.ignoredNames');
        ignoredNames.forEach(function (ignoredName) {
          if (ignored) return;
          ignored = ignored || (0, _minimatch2['default'])(path, ignoredName, { matchBase: true, dot: true });
        });
      }

      var ignoredPatterns = atom.config.get('autocomplete-paths.ignoredPatterns');
      if (ignoredPatterns) {
        ignoredPatterns.forEach(function (ignoredPattern) {
          if (ignored) return;
          ignored = ignored || (0, _minimatch2['default'])(path, ignoredPattern, { dot: true });
        });
      }

      return ignored;
    }

    /**
     * Caches the project paths and repositories
     * @return {Promise}
     * @private
     */
  }, {
    key: '_cacheProjectPathsAndRepositories',
    value: function _cacheProjectPathsAndRepositories() {
      var _this2 = this;

      this._projectDirectories = atom.project.getDirectories();

      return Promise.all(this._projectDirectories.map(atom.project.repositoryForDirectory.bind(atom.project))).then(function (repositories) {
        _this2._repositories = repositories.filter(function (r) {
          return r;
        });
      });
    }

    /**
     * Invoked when the content of the given `directory` has changed
     * @param  {Directory} projectDirectory
     * @param  {Directory} directory
     * @private
     */
  }, {
    key: '_onDirectoryChanged',
    value: function _onDirectoryChanged(projectDirectory, directory) {
      this._removeFilePathsForDirectory(projectDirectory, directory);
      this._cleanWatchersForDirectory(directory);
      this._cacheDirectoryFilePaths(projectDirectory, directory);
    }

    /**
     * Removes all watchers inside the given directory
     * @param  {Directory} directory
     * @private
     */
  }, {
    key: '_cleanWatchersForDirectory',
    value: function _cleanWatchersForDirectory(directory) {
      var _this3 = this;

      this._fileWatchersByDirectory.forEach(function (watcher, otherDirectory) {
        if (directory.contains(otherDirectory.path)) {
          watcher.dispose();
          _this3._fileWatchersByDirectory['delete'](otherDirectory);
        }
      });
    }

    /**
     * Removes all cached file paths in the given directory
     * @param  {Directory} projectDirectory
     * @param  {Directory} directory
     * @private
     */
  }, {
    key: '_removeFilePathsForDirectory',
    value: function _removeFilePathsForDirectory(projectDirectory, directory) {
      var filePaths = this._filePathsByProjectDirectory.get(projectDirectory.path);
      if (!filePaths) return;

      filePaths = filePaths.filter(function (path) {
        return !directory.contains(path);
      });
      this._filePathsByProjectDirectory.set(projectDirectory.path, filePaths);

      this._filePathsByDirectory['delete'](directory.path);
    }

    /**
     * Caches file paths for the given directory
     * @param  {Directory} projectDirectory
     * @param  {Directory} directory
     * @return {Promise}
     * @private
     */
  }, {
    key: '_cacheDirectoryFilePaths',
    value: function _cacheDirectoryFilePaths(projectDirectory, directory) {
      var _this4 = this;

      if (this._cancelled) return Promise.resolve([]);

      if (process.platform !== 'win32') {
        var watcher = this._fileWatchersByDirectory.get(directory);
        if (!watcher) {
          watcher = directory.onDidChange(function () {
            return _this4._onDirectoryChanged(projectDirectory, directory);
          });
          this._fileWatchersByDirectory.set(directory, watcher);
        }
      }

      return this._getDirectoryEntries(directory).then(function (entries) {
        if (_this4._cancelled) return Promise.resolve([]);

        // Filter: Files that are not ignored
        var filePaths = entries.filter(function (entry) {
          return entry instanceof _atom.File;
        }).map(function (entry) {
          return entry.path;
        }).filter(function (path) {
          return !_this4._isPathIgnored(path);
        });

        // Merge file paths into existing array (which contains *all* file paths)
        var filePathsArray = _this4._filePathsByProjectDirectory.get(projectDirectory.path) || [];
        var newPathsCount = filePathsArray.length + filePaths.length;

        var maxFileCount = atom.config.get('autocomplete-paths.maxFileCount');
        if (newPathsCount > maxFileCount && !_this4._cancelled) {
          atom.notifications.addError('autocomplete-paths', {
            description: 'Maximum file count of ' + maxFileCount + ' has been exceeded. Path autocompletion will not work in this project.<br /><br /><a href="https://github.com/atom-community/autocomplete-paths/wiki/Troubleshooting#maximum-file-limit-exceeded">Click here to learn more.</a>',
            dismissable: true
          });

          _this4._filePathsByProjectDirectory.clear();
          _this4._filePathsByDirectory.clear();
          _this4._cancelled = true;
          _this4.emit('rebuild-cache-done');
          return;
        }

        _this4._filePathsByProjectDirectory.set(projectDirectory.path, _underscorePlus2['default'].union(filePathsArray, filePaths));

        // Merge file paths into existing array (which contains file paths for a specific directory)
        filePathsArray = _this4._filePathsByDirectory.get(directory.path) || [];
        _this4._filePathsByDirectory.set(directory.path, _underscorePlus2['default'].union(filePathsArray, filePaths));

        var directories = entries.filter(function (entry) {
          return entry instanceof _atom.Directory;
        }).filter(function (entry) {
          return !_this4._isPathIgnored(entry.path);
        });

        return Promise.all(directories.map(function (directory) {
          return _this4._cacheDirectoryFilePaths(projectDirectory, directory);
        }));
      });
    }

    /**
     * Promisified version of Directory#getEntries
     * @param  {Directory} directory
     * @return {Promise}
     * @private
     */
  }, {
    key: '_getDirectoryEntries',
    value: function _getDirectoryEntries(directory) {
      return new Promise(function (resolve, reject) {
        directory.getEntries(function (err, entries) {
          if (err) return reject(err);
          resolve(entries);
        });
      });
    }

    /**
     * Rebuilds the paths cache
     */
  }, {
    key: 'rebuildCache',
    value: function rebuildCache() {
      var _this5 = this;

      var path = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      this.dispose();

      this._cancelled = false;
      this.emit('rebuild-cache');

      return (0, _utils.execPromise)('find --version').then(
      // `find` is available
      function () {
        return _this5._buildInitialCacheWithFind();
      },
      // `find` is not available
      function () {
        return _this5._buildInitialCache();
      });
    }

    /**
     * Builds the initial file cache
     * @return {Promise}
     * @private
     */
  }, {
    key: '_buildInitialCache',
    value: function _buildInitialCache() {
      var _this6 = this;

      return this._cacheProjectPathsAndRepositories().then(function () {
        return Promise.all(_this6._projectDirectories.map(function (projectDirectory) {
          return _this6._cacheDirectoryFilePaths(projectDirectory, projectDirectory);
        }));
      }).then(function (result) {
        _this6.emit('rebuild-cache-done');
        return result;
      });
    }

    /**
     * Returns the project path for the given file / directory pathName
     * @param  {String} pathName
     * @return {String}
     * @private
     */
  }, {
    key: '_getProjectPathForPath',
    value: function _getProjectPathForPath(pathName) {
      var projects = this._projectPaths;
      for (var i = 0; i < projects.length; i++) {
        var projectPath = projects[i];
        if (pathName.indexOf(projectPath) === 0) {
          return projectPath;
        }
      }
      return false;
    }

    /**
     * Returns the file paths for the given project directory with the given (optional) relative path
     * @param  {Directory} projectDirectory
     * @param  {String} [relativeToPath=null]
     * @return {String[]}
     */
  }, {
    key: 'getFilePathsForProjectDirectory',
    value: function getFilePathsForProjectDirectory(projectDirectory) {
      var relativeToPath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var filePaths = this._filePathsByProjectDirectory.get(projectDirectory.path) || [];
      if (relativeToPath) {
        return filePaths.filter(function (filePath) {
          return filePath.indexOf(relativeToPath) === 0;
        });
      }
      return filePaths;
    }

    /**
     * Disposes this PathsCache
     */
  }, {
    key: 'dispose',
    value: function dispose(isPackageDispose) {
      this._fileWatchersByDirectory.forEach(function (watcher, directory) {
        watcher.dispose();
      });
      this._fileWatchersByDirectory = new Map();
      this._filePathsByProjectDirectory = new Map();
      this._filePathsByDirectory = new Map();
      this._repositories = [];
      if (this._projectWatcher) {
        this._projectWatcher.dispose();
        this._projectWatcher = null;
      }
      if (isPackageDispose && this._projectChangeWatcher) {
        this._projectChangeWatcher.dispose();
        this._projectChangeWatcher = null;
      }
    }

    //
    // Cache with `find`
    //

    /**
     * Builds the initial file cache with `find`
     * @return {Promise}
     * @private
     */
  }, {
    key: '_buildInitialCacheWithFind',
    value: function _buildInitialCacheWithFind() {
      var _this7 = this;

      return this._cacheProjectPathsAndRepositories().then(function () {
        _this7._projectWatcher = atom.project.onDidChangeFiles(_this7._onDidChangeFiles.bind(_this7));

        return Promise.all(_this7._projectDirectories.map(_this7._populateCacheFor.bind(_this7)));
      }).then(function (result) {
        _this7.emit('rebuild-cache-done');
        return result;
      });
    }
  }, {
    key: '_onDidChangeFiles',
    value: function _onDidChangeFiles(events) {
      var _this8 = this;

      events.filter(function (event) {
        return event.action !== 'modified';
      }).forEach(function (event) {
        if (!_this8._projectDirectories) {
          return;
        }

        var action = event.action;
        var path = event.path;
        var oldPath = event.oldPath;

        var projectDirectory = _this8._projectDirectories.find(function (projectDirectory) {
          return path.indexOf(projectDirectory.path) === 0;
        });

        if (!projectDirectory) {
          return;
        }
        var directoryPath = projectDirectory.path;
        var ignored = _this8._isPathIgnored(path);

        if (ignored) {
          return;
        }

        var files = _this8._filePathsByProjectDirectory.get(directoryPath) || [];

        switch (action) {
          case 'created':
            files.push(path);
            break;

          case 'deleted':
            var i = files.indexOf(path);
            if (i > -1) {
              files.splice(i, 1);
            }
            break;

          case 'renamed':
            var j = files.indexOf(oldPath);
            if (j > -1) {
              files[j] = path;
            }
            break;
        }

        if (!_this8._filePathsByProjectDirectory.has(directoryPath)) {
          _this8._filePathsByProjectDirectory.set(directoryPath, files);
        }
      });
    }

    /**
     * Returns a list of ignore patterns for a directory
     * @param  {String} directoryPath
     * @return {String[]}
     * @private
     */
  }, {
    key: '_getIgnorePatterns',
    value: function _getIgnorePatterns(directoryPath) {
      var patterns = [];

      if (atom.config.get('autocomplete-paths.ignoredNames')) {
        atom.config.get('core.ignoredNames').forEach(function (pattern) {
          return patterns.push(pattern);
        });
      }

      if (atom.config.get('core.excludeVcsIgnoredPaths')) {
        try {
          var gitIgnore = _fs2['default'].readFileSync(directoryPath + '/.gitignore', 'utf-8');
          (0, _gitIgnoreParser2['default'])(gitIgnore).forEach(function (pattern) {
            return patterns.push(pattern);
          });
        } catch (err) {
          // .gitignore does not exist for this directory, ignoring
        }
      }

      var ignoredPatterns = atom.config.get('autocomplete-paths.ignoredPatterns');
      if (ignoredPatterns) {
        ignoredPatterns.forEach(function (pattern) {
          return patterns.push(pattern);
        });
      }

      return patterns;
    }

    /**
     * Populates cache for a project directory
     * @param  {Directory} projectDirectory
     * @return {Promise}
     * @private
     */
  }, {
    key: '_populateCacheFor',
    value: function _populateCacheFor(projectDirectory) {
      var _this9 = this;

      var directoryPath = projectDirectory.path;

      var ignorePatterns = this._getIgnorePatterns(directoryPath);
      var ignorePatternsForFind = ignorePatterns.map(function (pattern) {
        return pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
      });
      var ignorePattern = '\'.*\\(' + ignorePatternsForFind.join('\\|') + '\\).*\'';

      var cmd = ['find', '-L', directoryPath + '/', '-type', 'f', '-not', '-regex', ignorePattern].join(' ');

      return (0, _utils.execPromise)(cmd, {
        maxBuffer: 1024 * 1024
      }).then(function (stdout) {
        var files = _underscorePlus2['default'].compact(stdout.split('\n'));

        _this9._filePathsByProjectDirectory.set(directoryPath, files);

        return files;
      });
    }
  }]);

  return PathsCache;
})(_events.EventEmitter);

exports['default'] = PathsCache;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9wYXRocy1jYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQUc2QixRQUFROztrQkFDdEIsSUFBSTs7OzsrQkFDUyxtQkFBbUI7Ozs7b0JBQzlCLE1BQU07Ozs7OEJBQ1QsaUJBQWlCOzs7O3lCQUNULFdBQVc7Ozs7b0JBQ0QsTUFBTTs7cUJBQ1YsU0FBUzs7QUFWckMsV0FBVyxDQUFBO0lBWVUsVUFBVTtZQUFWLFVBQVU7O0FBQ2pCLFdBRE8sVUFBVSxHQUNkOzs7MEJBREksVUFBVTs7QUFFM0IsK0JBRmlCLFVBQVUsNkNBRXBCOztBQUVQLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2FBQU0sTUFBSyxZQUFZLEVBQUU7S0FBQSxDQUFDLENBQUE7O0FBRXJGLFFBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzdDLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3RDLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0dBQzFDOzs7Ozs7Ozs7ZUFWa0IsVUFBVTs7V0FrQmQsd0JBQUMsSUFBSSxFQUFFO0FBQ3BCLFVBQUksT0FBTyxHQUFHLEtBQUssQ0FBQTtBQUNuQixVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLEVBQUU7QUFDbEQsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDdkMsY0FBSSxPQUFPLEVBQUUsT0FBTTtBQUNuQixjQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFx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LFlBQU0sS0FBSyxHQUFHLDRCQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRTVDLGVBQUssNEJBQTRCLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFNUQsZUFBTyxLQUFLLENBQUM7T0FDZCxDQUFDLENBQUM7S0FDSjs7O1NBcGFrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL3N0YXJ0Ly5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wYXRocy9saWIvcGF0aHMtY2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xyXG4vKiBnbG9iYWwgYXRvbSAqL1xyXG5cclxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnXHJcbmltcG9ydCBnaXRJZ25vcmVQYXJzZXIgZnJvbSAnZ2l0LWlnbm9yZS1wYXJzZXInO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnXHJcbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xyXG5pbXBvcnQgeyBEaXJlY3RvcnksIEZpbGUgfSBmcm9tICdhdG9tJ1xyXG5pbXBvcnQgeyBleGVjUHJvbWlzZSB9IGZyb20gJy4vdXRpbHMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoc0NhY2hlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5fcHJvamVjdENoYW5nZVdhdGNoZXIgPSBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB0aGlzLnJlYnVpbGRDYWNoZSgpKVxyXG5cclxuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IFtdXHJcbiAgICB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3RvcnkgPSBuZXcgTWFwKClcclxuICAgIHRoaXMuX2ZpbGVQYXRoc0J5RGlyZWN0b3J5ID0gbmV3IE1hcCgpXHJcbiAgICB0aGlzLl9maWxlV2F0Y2hlcnNCeURpcmVjdG9yeSA9IG5ldyBNYXAoKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBwYXRoIGlzIGlnbm9yZWRcclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBwYXRoXHJcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9pc1BhdGhJZ25vcmVkIChwYXRoKSB7XHJcbiAgICBsZXQgaWdub3JlZCA9IGZhbHNlXHJcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnKSkge1xyXG4gICAgICB0aGlzLl9yZXBvc2l0b3JpZXMuZm9yRWFjaChyZXBvc2l0b3J5ID0+IHtcclxuICAgICAgICBpZiAoaWdub3JlZCkgcmV0dXJuXHJcbiAgICAgICAgY29uc3QgaWdub3JlU3VibW9kdWxlcyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBhdGhzLmlnbm9yZVN1Ym1vZHVsZXMnKVxyXG4gICAgICAgIGNvbnN0IGlzSWdub3JlZFN1Ym1vZHVsZSA9IGlnbm9yZVN1Ym1vZHVsZXMgJiYgcmVwb3NpdG9yeS5pc1N1Ym1vZHVsZShwYXRoKVxyXG4gICAgICAgIGlmIChyZXBvc2l0b3J5LmlzUGF0aElnbm9yZWQocGF0aCkgfHwgaXNJZ25vcmVkU3VibW9kdWxlKSB7XHJcbiAgICAgICAgICBpZ25vcmVkID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMuaWdub3JlZE5hbWVzJykpIHtcclxuICAgICAgY29uc3QgaWdub3JlZE5hbWVzID0gYXRvbS5jb25maWcuZ2V0KCdjb3JlLmlnbm9yZWROYW1lcycpXHJcbiAgICAgIGlnbm9yZWROYW1lcy5mb3JFYWNoKGlnbm9yZWROYW1lID0+IHtcclxuICAgICAgICBpZiAoaWdub3JlZCkgcmV0dXJuXHJcbiAgICAgICAgaWdub3JlZCA9IGlnbm9yZWQgfHwgbWluaW1hdGNoKHBhdGgsIGlnbm9yZWROYW1lLCB7IG1hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaWdub3JlZFBhdHRlcm5zID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMuaWdub3JlZFBhdHRlcm5zJylcclxuICAgIGlmIChpZ25vcmVkUGF0dGVybnMpIHtcclxuICAgICAgaWdub3JlZFBhdHRlcm5zLmZvckVhY2goaWdub3JlZFBhdHRlcm4gPT4ge1xyXG4gICAgICAgIGlmIChpZ25vcmVkKSByZXR1cm5cclxuICAgICAgICBpZ25vcmVkID0gaWdub3JlZCB8fCBtaW5pbWF0Y2gocGF0aCwgaWdub3JlZFBhdHRlcm4sIHsgZG90OiB0cnVlIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGlnbm9yZWRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhY2hlcyB0aGUgcHJvamVjdCBwYXRocyBhbmQgcmVwb3NpdG9yaWVzXHJcbiAgICogQHJldHVybiB7UHJvbWlzZX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9jYWNoZVByb2plY3RQYXRoc0FuZFJlcG9zaXRvcmllcyAoKSB7XHJcbiAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxyXG5cclxuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLl9wcm9qZWN0RGlyZWN0b3JpZXNcclxuICAgICAgLm1hcChhdG9tLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeS5iaW5kKGF0b20ucHJvamVjdCkpXHJcbiAgICApLnRoZW4ocmVwb3NpdG9yaWVzID0+IHtcclxuICAgICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gcmVwb3NpdG9yaWVzLmZpbHRlcihyID0+IHIpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW52b2tlZCB3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBnaXZlbiBgZGlyZWN0b3J5YCBoYXMgY2hhbmdlZFxyXG4gICAqIEBwYXJhbSAge0RpcmVjdG9yeX0gcHJvamVjdERpcmVjdG9yeVxyXG4gICAqIEBwYXJhbSAge0RpcmVjdG9yeX0gZGlyZWN0b3J5XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBfb25EaXJlY3RvcnlDaGFuZ2VkIChwcm9qZWN0RGlyZWN0b3J5LCBkaXJlY3RvcnkpIHtcclxuICAgIHRoaXMuX3JlbW92ZUZpbGVQYXRoc0ZvckRpcmVjdG9yeShwcm9qZWN0RGlyZWN0b3J5LCBkaXJlY3RvcnkpXHJcbiAgICB0aGlzLl9jbGVhbldhdGNoZXJzRm9yRGlyZWN0b3J5KGRpcmVjdG9yeSlcclxuICAgIHRoaXMuX2NhY2hlRGlyZWN0b3J5RmlsZVBhdGhzKHByb2plY3REaXJlY3RvcnksIGRpcmVjdG9yeSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIHdhdGNoZXJzIGluc2lkZSB0aGUgZ2l2ZW4gZGlyZWN0b3J5XHJcbiAgICogQHBhcmFtICB7RGlyZWN0b3J5fSBkaXJlY3RvcnlcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9jbGVhbldhdGNoZXJzRm9yRGlyZWN0b3J5IChkaXJlY3RvcnkpIHtcclxuICAgIHRoaXMuX2ZpbGVXYXRjaGVyc0J5RGlyZWN0b3J5LmZvckVhY2goKHdhdGNoZXIsIG90aGVyRGlyZWN0b3J5KSA9PiB7XHJcbiAgICAgIGlmIChkaXJlY3RvcnkuY29udGFpbnMob3RoZXJEaXJlY3RvcnkucGF0aCkpIHtcclxuICAgICAgICB3YXRjaGVyLmRpc3Bvc2UoKVxyXG4gICAgICAgIHRoaXMuX2ZpbGVXYXRjaGVyc0J5RGlyZWN0b3J5LmRlbGV0ZShvdGhlckRpcmVjdG9yeSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIGNhY2hlZCBmaWxlIHBhdGhzIGluIHRoZSBnaXZlbiBkaXJlY3RvcnlcclxuICAgKiBAcGFyYW0gIHtEaXJlY3Rvcnl9IHByb2plY3REaXJlY3RvcnlcclxuICAgKiBAcGFyYW0gIHtEaXJlY3Rvcnl9IGRpcmVjdG9yeVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgX3JlbW92ZUZpbGVQYXRoc0ZvckRpcmVjdG9yeSAocHJvamVjdERpcmVjdG9yeSwgZGlyZWN0b3J5KSB7XHJcbiAgICBsZXQgZmlsZVBhdGhzID0gdGhpcy5fZmlsZVBhdGhzQnlQcm9qZWN0RGlyZWN0b3J5LmdldChwcm9qZWN0RGlyZWN0b3J5LnBhdGgpXHJcbiAgICBpZiAoIWZpbGVQYXRocykgcmV0dXJuXHJcblxyXG4gICAgZmlsZVBhdGhzID0gZmlsZVBhdGhzLmZpbHRlcihwYXRoID0+ICFkaXJlY3RvcnkuY29udGFpbnMocGF0aCkpXHJcbiAgICB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3Rvcnkuc2V0KHByb2plY3REaXJlY3RvcnkucGF0aCwgZmlsZVBhdGhzKVxyXG5cclxuICAgIHRoaXMuX2ZpbGVQYXRoc0J5RGlyZWN0b3J5LmRlbGV0ZShkaXJlY3RvcnkucGF0aClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhY2hlcyBmaWxlIHBhdGhzIGZvciB0aGUgZ2l2ZW4gZGlyZWN0b3J5XHJcbiAgICogQHBhcmFtICB7RGlyZWN0b3J5fSBwcm9qZWN0RGlyZWN0b3J5XHJcbiAgICogQHBhcmFtICB7RGlyZWN0b3J5fSBkaXJlY3RvcnlcclxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgX2NhY2hlRGlyZWN0b3J5RmlsZVBhdGhzIChwcm9qZWN0RGlyZWN0b3J5LCBkaXJlY3RvcnkpIHtcclxuICAgIGlmICh0aGlzLl9jYW5jZWxsZWQpIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXHJcblxyXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHtcclxuICAgICAgbGV0IHdhdGNoZXIgPSB0aGlzLl9maWxlV2F0Y2hlcnNCeURpcmVjdG9yeS5nZXQoZGlyZWN0b3J5KVxyXG4gICAgICBpZiAoIXdhdGNoZXIpIHtcclxuICAgICAgICB3YXRjaGVyID0gZGlyZWN0b3J5Lm9uRGlkQ2hhbmdlKCgpID0+XHJcbiAgICAgICAgICB0aGlzLl9vbkRpcmVjdG9yeUNoYW5nZWQocHJvamVjdERpcmVjdG9yeSwgZGlyZWN0b3J5KVxyXG4gICAgICAgIClcclxuICAgICAgICB0aGlzLl9maWxlV2F0Y2hlcnNCeURpcmVjdG9yeS5zZXQoZGlyZWN0b3J5LCB3YXRjaGVyKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2dldERpcmVjdG9yeUVudHJpZXMoZGlyZWN0b3J5KVxyXG4gICAgICAudGhlbihlbnRyaWVzID0+IHtcclxuICAgICAgICBpZiAodGhpcy5fY2FuY2VsbGVkKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxyXG5cclxuICAgICAgICAvLyBGaWx0ZXI6IEZpbGVzIHRoYXQgYXJlIG5vdCBpZ25vcmVkXHJcbiAgICAgICAgY29uc3QgZmlsZVBhdGhzID0gZW50cmllc1xyXG4gICAgICAgICAgLmZpbHRlcihlbnRyeSA9PiBlbnRyeSBpbnN0YW5jZW9mIEZpbGUpXHJcbiAgICAgICAgICAubWFwKGVudHJ5ID0+IGVudHJ5LnBhdGgpXHJcbiAgICAgICAgICAuZmlsdGVyKHBhdGggPT4gIXRoaXMuX2lzUGF0aElnbm9yZWQocGF0aCkpXHJcblxyXG4gICAgICAgIC8vIE1lcmdlIGZpbGUgcGF0aHMgaW50byBleGlzdGluZyBhcnJheSAod2hpY2ggY29udGFpbnMgKmFsbCogZmlsZSBwYXRocylcclxuICAgICAgICBsZXQgZmlsZVBhdGhzQXJyYXkgPSB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3RvcnkuZ2V0KHByb2plY3REaXJlY3RvcnkucGF0aCkgfHwgW11cclxuICAgICAgICBjb25zdCBuZXdQYXRoc0NvdW50ID0gZmlsZVBhdGhzQXJyYXkubGVuZ3RoICsgZmlsZVBhdGhzLmxlbmd0aFxyXG5cclxuICAgICAgICBjb25zdCBtYXhGaWxlQ291bnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wYXRocy5tYXhGaWxlQ291bnQnKVxyXG4gICAgICAgIGlmIChuZXdQYXRoc0NvdW50ID4gbWF4RmlsZUNvdW50ICYmICF0aGlzLl9jYW5jZWxsZWQpIHtcclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignYXV0b2NvbXBsZXRlLXBhdGhzJywge1xyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYE1heGltdW0gZmlsZSBjb3VudCBvZiAke21heEZpbGVDb3VudH0gaGFzIGJlZW4gZXhjZWVkZWQuIFBhdGggYXV0b2NvbXBsZXRpb24gd2lsbCBub3Qgd29yayBpbiB0aGlzIHByb2plY3QuPGJyIC8+PGJyIC8+PGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tLWNvbW11bml0eS9hdXRvY29tcGxldGUtcGF0aHMvd2lraS9Ucm91Ymxlc2hvb3RpbmcjbWF4aW11bS1maWxlLWxpbWl0LWV4Y2VlZGVkXCI+Q2xpY2sgaGVyZSB0byBsZWFybiBtb3JlLjwvYT5gLFxyXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3RvcnkuY2xlYXIoKVxyXG4gICAgICAgICAgdGhpcy5fZmlsZVBhdGhzQnlEaXJlY3RvcnkuY2xlYXIoKVxyXG4gICAgICAgICAgdGhpcy5fY2FuY2VsbGVkID0gdHJ1ZVxyXG4gICAgICAgICAgdGhpcy5lbWl0KCdyZWJ1aWxkLWNhY2hlLWRvbmUnKVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3Rvcnkuc2V0KHByb2plY3REaXJlY3RvcnkucGF0aCxcclxuICAgICAgICAgIF8udW5pb24oZmlsZVBhdGhzQXJyYXksIGZpbGVQYXRocylcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIC8vIE1lcmdlIGZpbGUgcGF0aHMgaW50byBleGlzdGluZyBhcnJheSAod2hpY2ggY29udGFpbnMgZmlsZSBwYXRocyBmb3IgYSBzcGVjaWZpYyBkaXJlY3RvcnkpXHJcbiAgICAgICAgZmlsZVBhdGhzQXJyYXkgPSB0aGlzLl9maWxlUGF0aHNCeURpcmVjdG9yeS5nZXQoZGlyZWN0b3J5LnBhdGgpIHx8IFtdXHJcbiAgICAgICAgdGhpcy5fZmlsZVBhdGhzQnlEaXJlY3Rvcnkuc2V0KGRpcmVjdG9yeS5wYXRoLFxyXG4gICAgICAgICAgXy51bmlvbihmaWxlUGF0aHNBcnJheSwgZmlsZVBhdGhzKVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgY29uc3QgZGlyZWN0b3JpZXMgPSBlbnRyaWVzXHJcbiAgICAgICAgICAuZmlsdGVyKGVudHJ5ID0+IGVudHJ5IGluc3RhbmNlb2YgRGlyZWN0b3J5KVxyXG4gICAgICAgICAgLmZpbHRlcihlbnRyeSA9PiAhdGhpcy5faXNQYXRoSWdub3JlZChlbnRyeS5wYXRoKSlcclxuXHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGRpcmVjdG9yaWVzLm1hcChkaXJlY3RvcnkgPT5cclxuICAgICAgICAgIHRoaXMuX2NhY2hlRGlyZWN0b3J5RmlsZVBhdGhzKHByb2plY3REaXJlY3RvcnksIGRpcmVjdG9yeSlcclxuICAgICAgICApKVxyXG4gICAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvbWlzaWZpZWQgdmVyc2lvbiBvZiBEaXJlY3RvcnkjZ2V0RW50cmllc1xyXG4gICAqIEBwYXJhbSAge0RpcmVjdG9yeX0gZGlyZWN0b3J5XHJcbiAgICogQHJldHVybiB7UHJvbWlzZX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9nZXREaXJlY3RvcnlFbnRyaWVzIChkaXJlY3RvcnkpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGRpcmVjdG9yeS5nZXRFbnRyaWVzKChlcnIsIGVudHJpZXMpID0+IHtcclxuICAgICAgICBpZiAoZXJyKSByZXR1cm4gcmVqZWN0KGVycilcclxuICAgICAgICByZXNvbHZlKGVudHJpZXMpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVidWlsZHMgdGhlIHBhdGhzIGNhY2hlXHJcbiAgICovXHJcbiAgcmVidWlsZENhY2hlIChwYXRoID0gbnVsbCkge1xyXG4gICAgdGhpcy5kaXNwb3NlKClcclxuXHJcbiAgICB0aGlzLl9jYW5jZWxsZWQgPSBmYWxzZVxyXG4gICAgdGhpcy5lbWl0KCdyZWJ1aWxkLWNhY2hlJylcclxuXHJcbiAgICByZXR1cm4gZXhlY1Byb21pc2UoJ2ZpbmQgLS12ZXJzaW9uJylcclxuICAgICAgLnRoZW4oXHJcbiAgICAgICAgLy8gYGZpbmRgIGlzIGF2YWlsYWJsZVxyXG4gICAgICAgICgpID0+IHRoaXMuX2J1aWxkSW5pdGlhbENhY2hlV2l0aEZpbmQoKSxcclxuICAgICAgICAvLyBgZmluZGAgaXMgbm90IGF2YWlsYWJsZVxyXG4gICAgICAgICgpID0+IHRoaXMuX2J1aWxkSW5pdGlhbENhY2hlKClcclxuICAgICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnVpbGRzIHRoZSBpbml0aWFsIGZpbGUgY2FjaGVcclxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgX2J1aWxkSW5pdGlhbENhY2hlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9jYWNoZVByb2plY3RQYXRoc0FuZFJlcG9zaXRvcmllcygpXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXHJcbiAgICAgICAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3JpZXMubWFwKHByb2plY3REaXJlY3RvcnkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVEaXJlY3RvcnlGaWxlUGF0aHMocHJvamVjdERpcmVjdG9yeSwgcHJvamVjdERpcmVjdG9yeSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgKVxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgIHRoaXMuZW1pdCgncmVidWlsZC1jYWNoZS1kb25lJylcclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwcm9qZWN0IHBhdGggZm9yIHRoZSBnaXZlbiBmaWxlIC8gZGlyZWN0b3J5IHBhdGhOYW1lXHJcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoTmFtZVxyXG4gICAqIEByZXR1cm4ge1N0cmluZ31cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9nZXRQcm9qZWN0UGF0aEZvclBhdGggKHBhdGhOYW1lKSB7XHJcbiAgICBjb25zdCBwcm9qZWN0cyA9IHRoaXMuX3Byb2plY3RQYXRoc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9qZWN0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBwcm9qZWN0UGF0aCA9IHByb2plY3RzW2ldXHJcbiAgICAgIGlmIChwYXRoTmFtZS5pbmRleE9mKHByb2plY3RQYXRoKSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBwcm9qZWN0UGF0aFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGZpbGUgcGF0aHMgZm9yIHRoZSBnaXZlbiBwcm9qZWN0IGRpcmVjdG9yeSB3aXRoIHRoZSBnaXZlbiAob3B0aW9uYWwpIHJlbGF0aXZlIHBhdGhcclxuICAgKiBAcGFyYW0gIHtEaXJlY3Rvcnl9IHByb2plY3REaXJlY3RvcnlcclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IFtyZWxhdGl2ZVRvUGF0aD1udWxsXVxyXG4gICAqIEByZXR1cm4ge1N0cmluZ1tdfVxyXG4gICAqL1xyXG4gIGdldEZpbGVQYXRoc0ZvclByb2plY3REaXJlY3RvcnkgKHByb2plY3REaXJlY3RvcnksIHJlbGF0aXZlVG9QYXRoID0gbnVsbCkge1xyXG4gICAgbGV0IGZpbGVQYXRocyA9IHRoaXMuX2ZpbGVQYXRoc0J5UHJvamVjdERpcmVjdG9yeS5nZXQocHJvamVjdERpcmVjdG9yeS5wYXRoKSB8fCBbXVxyXG4gICAgaWYgKHJlbGF0aXZlVG9QYXRoKSB7XHJcbiAgICAgIHJldHVybiBmaWxlUGF0aHMuZmlsdGVyKGZpbGVQYXRoID0+IGZpbGVQYXRoLmluZGV4T2YocmVsYXRpdmVUb1BhdGgpID09PSAwKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpbGVQYXRoc1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgdGhpcyBQYXRoc0NhY2hlXHJcbiAgICovXHJcbiAgZGlzcG9zZShpc1BhY2thZ2VEaXNwb3NlKSB7XHJcbiAgICB0aGlzLl9maWxlV2F0Y2hlcnNCeURpcmVjdG9yeS5mb3JFYWNoKCh3YXRjaGVyLCBkaXJlY3RvcnkpID0+IHtcclxuICAgICAgd2F0Y2hlci5kaXNwb3NlKClcclxuICAgIH0pXHJcbiAgICB0aGlzLl9maWxlV2F0Y2hlcnNCeURpcmVjdG9yeSA9IG5ldyBNYXAoKVxyXG4gICAgdGhpcy5fZmlsZVBhdGhzQnlQcm9qZWN0RGlyZWN0b3J5ID0gbmV3IE1hcCgpXHJcbiAgICB0aGlzLl9maWxlUGF0aHNCeURpcmVjdG9yeSA9IG5ldyBNYXAoKVxyXG4gICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gW11cclxuICAgIGlmICh0aGlzLl9wcm9qZWN0V2F0Y2hlcikge1xyXG4gICAgICB0aGlzLl9wcm9qZWN0V2F0Y2hlci5kaXNwb3NlKClcclxuICAgICAgdGhpcy5fcHJvamVjdFdhdGNoZXIgPSBudWxsXHJcbiAgICB9XHJcbiAgICBpZiAoaXNQYWNrYWdlRGlzcG9zZSAmJiB0aGlzLl9wcm9qZWN0Q2hhbmdlV2F0Y2hlcikge1xyXG4gICAgICB0aGlzLl9wcm9qZWN0Q2hhbmdlV2F0Y2hlci5kaXNwb3NlKClcclxuICAgICAgdGhpcy5fcHJvamVjdENoYW5nZVdhdGNoZXIgPSBudWxsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvL1xyXG4gIC8vIENhY2hlIHdpdGggYGZpbmRgXHJcbiAgLy9cclxuXHJcbiAgLyoqXHJcbiAgICogQnVpbGRzIHRoZSBpbml0aWFsIGZpbGUgY2FjaGUgd2l0aCBgZmluZGBcclxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgX2J1aWxkSW5pdGlhbENhY2hlV2l0aEZpbmQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVQcm9qZWN0UGF0aHNBbmRSZXBvc2l0b3JpZXMoKVxyXG4gICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fcHJvamVjdFdhdGNoZXIgPSBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VGaWxlcyh0aGlzLl9vbkRpZENoYW5nZUZpbGVzLmJpbmQodGhpcykpXHJcblxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChcclxuICAgICAgICAgIHRoaXMuX3Byb2plY3REaXJlY3Rvcmllcy5tYXAodGhpcy5fcG9wdWxhdGVDYWNoZUZvci5iaW5kKHRoaXMpKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdyZWJ1aWxkLWNhY2hlLWRvbmUnKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIF9vbkRpZENoYW5nZUZpbGVzKGV2ZW50cykge1xyXG4gICAgZXZlbnRzXHJcbiAgICAgIC5maWx0ZXIoZXZlbnQgPT4gZXZlbnQuYWN0aW9uICE9PSAnbW9kaWZpZWQnKVxyXG4gICAgICAuZm9yRWFjaChldmVudCA9PiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9wcm9qZWN0RGlyZWN0b3JpZXMpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHsgYWN0aW9uLCBwYXRoLCBvbGRQYXRoIH0gPSBldmVudDtcclxuXHJcbiAgICAgICAgY29uc3QgcHJvamVjdERpcmVjdG9yeSA9IHRoaXMuX3Byb2plY3REaXJlY3Rvcmllc1xyXG4gICAgICAgICAgLmZpbmQocHJvamVjdERpcmVjdG9yeSA9PiBwYXRoLmluZGV4T2YocHJvamVjdERpcmVjdG9yeS5wYXRoKSA9PT0gMCk7XHJcblxyXG4gICAgICAgIGlmICghcHJvamVjdERpcmVjdG9yeSkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gcHJvamVjdERpcmVjdG9yeS5wYXRoO1xyXG4gICAgICAgIGNvbnN0IGlnbm9yZWQgPSB0aGlzLl9pc1BhdGhJZ25vcmVkKHBhdGgpO1xyXG5cclxuICAgICAgICBpZiAoaWdub3JlZCkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3RvcnkuZ2V0KGRpcmVjdG9yeVBhdGgpIHx8IFtdO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xyXG4gICAgICAgICAgY2FzZSAnY3JlYXRlZCc6XHJcbiAgICAgICAgICAgIGZpbGVzLnB1c2gocGF0aCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgIGNhc2UgJ2RlbGV0ZWQnOlxyXG4gICAgICAgICAgICBjb25zdCBpID0gZmlsZXMuaW5kZXhPZihwYXRoKTtcclxuICAgICAgICAgICAgaWYgKGkgPiAtMSkge1xyXG4gICAgICAgICAgICAgIGZpbGVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICBjYXNlICdyZW5hbWVkJzpcclxuICAgICAgICAgICAgY29uc3QgaiA9IGZpbGVzLmluZGV4T2Yob2xkUGF0aCk7XHJcbiAgICAgICAgICAgIGlmIChqID4gLTEpIHtcclxuICAgICAgICAgICAgICBmaWxlc1tqXSA9IHBhdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX2ZpbGVQYXRoc0J5UHJvamVjdERpcmVjdG9yeS5oYXMoZGlyZWN0b3J5UGF0aCkpIHtcclxuICAgICAgICAgIHRoaXMuX2ZpbGVQYXRoc0J5UHJvamVjdERpcmVjdG9yeS5zZXQoZGlyZWN0b3J5UGF0aCwgZmlsZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBpZ25vcmUgcGF0dGVybnMgZm9yIGEgZGlyZWN0b3J5XHJcbiAgICogQHBhcmFtICB7U3RyaW5nfSBkaXJlY3RvcnlQYXRoXHJcbiAgICogQHJldHVybiB7U3RyaW5nW119XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBfZ2V0SWdub3JlUGF0dGVybnMoZGlyZWN0b3J5UGF0aCkge1xyXG4gICAgY29uc3QgcGF0dGVybnMgPSBbXTtcclxuXHJcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMuaWdub3JlZE5hbWVzJykpIHtcclxuICAgICAgYXRvbS5jb25maWcuZ2V0KCdjb3JlLmlnbm9yZWROYW1lcycpLmZvckVhY2gocGF0dGVybiA9PiBwYXR0ZXJucy5wdXNoKHBhdHRlcm4pKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnKSkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGdpdElnbm9yZSA9IGZzLnJlYWRGaWxlU3luYyhkaXJlY3RvcnlQYXRoICsgJy8uZ2l0aWdub3JlJywgJ3V0Zi04Jyk7XHJcbiAgICAgICAgZ2l0SWdub3JlUGFyc2VyKGdpdElnbm9yZSkuZm9yRWFjaChwYXR0ZXJuID0+IHBhdHRlcm5zLnB1c2gocGF0dGVybikpO1xyXG4gICAgICB9XHJcbiAgICAgIGNhdGNoKGVycikge1xyXG4gICAgICAgIC8vIC5naXRpZ25vcmUgZG9lcyBub3QgZXhpc3QgZm9yIHRoaXMgZGlyZWN0b3J5LCBpZ25vcmluZ1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaWdub3JlZFBhdHRlcm5zID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMuaWdub3JlZFBhdHRlcm5zJyk7XHJcbiAgICBpZiAoaWdub3JlZFBhdHRlcm5zKSB7XHJcbiAgICAgIGlnbm9yZWRQYXR0ZXJucy5mb3JFYWNoKHBhdHRlcm4gPT4gcGF0dGVybnMucHVzaChwYXR0ZXJuKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBhdHRlcm5zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9wdWxhdGVzIGNhY2hlIGZvciBhIHByb2plY3QgZGlyZWN0b3J5XHJcbiAgICogQHBhcmFtICB7RGlyZWN0b3J5fSBwcm9qZWN0RGlyZWN0b3J5XHJcbiAgICogQHJldHVybiB7UHJvbWlzZX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9wb3B1bGF0ZUNhY2hlRm9yKHByb2plY3REaXJlY3RvcnkpIHtcclxuICAgIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBwcm9qZWN0RGlyZWN0b3J5LnBhdGg7XHJcblxyXG4gICAgY29uc3QgaWdub3JlUGF0dGVybnMgPSB0aGlzLl9nZXRJZ25vcmVQYXR0ZXJucyhkaXJlY3RvcnlQYXRoKTtcclxuICAgIGNvbnN0IGlnbm9yZVBhdHRlcm5zRm9yRmluZCA9IGlnbm9yZVBhdHRlcm5zLm1hcChcclxuICAgICAgcGF0dGVybiA9PiBwYXR0ZXJuXHJcbiAgICAgICAgLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKVxyXG4gICAgICAgIC5yZXBsYWNlKC9cXCovZywgJy4qJylcclxuICAgICk7XHJcbiAgICBjb25zdCBpZ25vcmVQYXR0ZXJuID0gJ1xcJy4qXFxcXCgnICsgaWdub3JlUGF0dGVybnNGb3JGaW5kLmpvaW4oJ1xcXFx8JykgKyAnXFxcXCkuKlxcJyc7XHJcblxyXG4gICAgY29uc3QgY21kID0gW1xyXG4gICAgICAnZmluZCcsXHJcbiAgICAgICctTCcsXHJcbiAgICAgIGRpcmVjdG9yeVBhdGggKyAnLycsXHJcbiAgICAgICctdHlwZScsICdmJyxcclxuICAgICAgJy1ub3QnLCAnLXJlZ2V4JywgaWdub3JlUGF0dGVybixcclxuICAgIF0uam9pbignICcpO1xyXG5cclxuICAgIHJldHVybiBleGVjUHJvbWlzZShjbWQsIHtcclxuICAgICAgbWF4QnVmZmVyOiAxMDI0ICogMTAyNCxcclxuICAgIH0pLnRoZW4oc3Rkb3V0ID0+IHtcclxuICAgICAgY29uc3QgZmlsZXMgPSBfLmNvbXBhY3Qoc3Rkb3V0LnNwbGl0KCdcXG4nKSk7XHJcblxyXG4gICAgICB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3Rvcnkuc2V0KGRpcmVjdG9yeVBhdGgsIGZpbGVzKTtcclxuXHJcbiAgICAgIHJldHVybiBmaWxlcztcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=