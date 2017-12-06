Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* global atom */

var _events = require('events');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

var _pathsCache = require('./paths-cache');

var _pathsCache2 = _interopRequireDefault(_pathsCache);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _configDefaultScopes = require('./config/default-scopes');

var _configDefaultScopes2 = _interopRequireDefault(_configDefaultScopes);

var _configOptionScopes = require('./config/option-scopes');

var _configOptionScopes2 = _interopRequireDefault(_configOptionScopes);

'use babel';
var PathsProvider = (function (_EventEmitter) {
  _inherits(PathsProvider, _EventEmitter);

  function PathsProvider() {
    _classCallCheck(this, PathsProvider);

    _get(Object.getPrototypeOf(PathsProvider.prototype), 'constructor', this).call(this);
    this.reloadScopes();

    this._pathsCache = new _pathsCache2['default']();
    this._isReady = false;

    this._onRebuildCache = this._onRebuildCache.bind(this);
    this._onRebuildCacheDone = this._onRebuildCacheDone.bind(this);

    this._pathsCache.on('rebuild-cache', this._onRebuildCache);
    this._pathsCache.on('rebuild-cache-done', this._onRebuildCacheDone);
  }

  /**
   * Reloads the scopes
   */

  _createClass(PathsProvider, [{
    key: 'reloadScopes',
    value: function reloadScopes() {
      this._scopes = atom.config.get('autocomplete-paths.scopes').slice(0) || [];

      if (!atom.config.get('autocomplete-paths.ignoreBuiltinScopes')) {
        this._scopes = this._scopes.concat(_configDefaultScopes2['default']);
      }

      for (var key in _configOptionScopes2['default']) {
        if (atom.config.get('autocomplete-paths.' + key)) {
          this._scopes = this._scopes.slice(0).concat(_configOptionScopes2['default'][key]);
        }
      }
    }

    /**
     * Gets called when the PathsCache is starting to rebuild the cache
     * @private
     */
  }, {
    key: '_onRebuildCache',
    value: function _onRebuildCache() {
      this.emit('rebuild-cache');
    }

    /**
     * Gets called when the PathsCache is done rebuilding the cache
     * @private
     */
  }, {
    key: '_onRebuildCacheDone',
    value: function _onRebuildCacheDone() {
      this.emit('rebuild-cache-done');
    }

    /**
     * Checks if the given scope config matches the given request
     * @param  {Object} scope
     * @param  {Object} request
     * @return {Array} The match object
     * @private
     */
  }, {
    key: '_scopeMatchesRequest',
    value: function _scopeMatchesRequest(scope, request) {
      var sourceScopes = Array.isArray(scope.scopes) ? scope.scopes : [scope.scopes];

      // Check if the scope descriptors match
      var scopeMatches = _underscorePlus2['default'].intersection(request.scopeDescriptor.getScopesArray(), sourceScopes).length > 0;
      if (!scopeMatches) return false;

      // Check if the line matches the prefixes
      var line = this._getLineTextForRequest(request);

      var lineMatch = null;
      var scopePrefixes = Array.isArray(scope.prefixes) ? scope.prefixes : [scope.prefixes];
      scopePrefixes.forEach(function (prefix) {
        var regex = new RegExp(prefix, 'i');
        lineMatch = lineMatch || line.match(regex);
      });

      return lineMatch;
    }

    /**
     * Returns the whole line text for the given request
     * @param  {Object} request
     * @return {String}
     * @private
     */
  }, {
    key: '_getLineTextForRequest',
    value: function _getLineTextForRequest(request) {
      var editor = request.editor;
      var bufferPosition = request.bufferPosition;

      return editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    }

    /**
     * Returns the suggestions for the given scope and the given request
     * @param  {Object} scope
     * @param  {Object} request
     * @return {Promise}
     * @private
     */
  }, {
    key: '_getSuggestionsForScope',
    value: function _getSuggestionsForScope(scope, request, match) {
      var line = this._getLineTextForRequest(request);
      var pathPrefix = line.substr(match.index + match[0].length);
      var trailingSlashPresent = pathPrefix.match(/[/|\\]$/);
      var directoryGiven = pathPrefix.indexOf('./') === 0 || pathPrefix.indexOf('../') === 0;
      var parsedPathPrefix = _path2['default'].parse(pathPrefix);

      // path.parse ignores trailing slashes, so we handle this manually
      if (trailingSlashPresent) {
        parsedPathPrefix.dir = _path2['default'].join(parsedPathPrefix.dir, parsedPathPrefix.base);
        parsedPathPrefix.base = '';
        parsedPathPrefix.name = '';
      }

      var projectDirectory = this._getProjectDirectory(request.editor);
      if (!projectDirectory) return Promise.resolve([]);
      var currentDirectory = _path2['default'].dirname(request.editor.getPath());

      var requestedDirectoryPath = _path2['default'].resolve(currentDirectory, parsedPathPrefix.dir);

      var files = directoryGiven ? this._pathsCache.getFilePathsForProjectDirectory(projectDirectory, requestedDirectoryPath) : this._pathsCache.getFilePathsForProjectDirectory(projectDirectory);

      var fuzzyMatcher = directoryGiven ? parsedPathPrefix.base : pathPrefix;

      var extensions = scope.extensions;

      if (extensions) {
        (function () {
          var regex = new RegExp('.(' + extensions.join('|') + ')$');
          files = files.filter(function (path) {
            return regex.test(path);
          });
        })();
      }

      if (fuzzyMatcher) {
        files = _fuzzaldrinPlus2['default'].filter(files, fuzzyMatcher, {
          maxResults: 10
        });
      }

      var suggestions = files.map(function (pathName) {
        var normalizeSlashes = atom.config.get('autocomplete-paths.normalizeSlashes');

        var projectRelativePath = atom.project.relativizePath(pathName)[1];
        var displayText = projectRelativePath;
        if (directoryGiven) {
          displayText = _path2['default'].relative(requestedDirectoryPath, pathName);
        }
        if (normalizeSlashes) {
          displayText = (0, _slash2['default'])(displayText);
        }

        // Relativize path to current file if necessary
        var relativePath = _path2['default'].relative(_path2['default'].dirname(request.editor.getPath()), pathName);
        if (normalizeSlashes) relativePath = (0, _slash2['default'])(relativePath);
        if (scope.relative !== false) {
          pathName = relativePath;
          if (scope.includeCurrentDirectory !== false) {
            if (pathName[0] !== '.') {
              pathName = './' + pathName;
            }
          }
        }

        if (scope.projectRelativePath) {
          pathName = projectRelativePath;
        }

        // Replace stuff if necessary
        if (scope.replaceOnInsert) {
          var originalPathName = pathName;
          scope.replaceOnInsert.forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var from = _ref2[0];
            var to = _ref2[1];

            var regex = new RegExp(from);
            if (regex.test(pathName)) {
              pathName = pathName.replace(regex, to);
            }
          });
        }

        // Calculate distance to file
        var distanceToFile = relativePath.split(_path2['default'].sep).length;
        return {
          text: pathName,
          replacementPrefix: pathPrefix,
          displayText: displayText,
          type: 'import',
          iconHTML: '<i class="icon-file-code"></i>',
          score: _fuzzaldrinPlus2['default'].score(displayText, request.prefix),
          distanceToFile: distanceToFile
        };
      });

      // Modify score to incorporate distance
      var suggestionsCount = suggestions.length;
      if (suggestions.length) {
        (function () {
          var maxDistance = _underscorePlus2['default'].max(suggestions, function (s) {
            return s.distanceToFile;
          }).distanceToFile;
          suggestions.forEach(function (s, i) {
            s.score = suggestionsCount - i + (maxDistance - s.distanceToFile);
          });

          // Sort again
          suggestions.sort(function (a, b) {
            return b.score - a.score;
          });
        })();
      }

      return Promise.resolve(suggestions);
    }

    /**
     * Returns the suggestions for the given request
     * @param  {Object} request
     * @return {Promise}
     */
  }, {
    key: 'getSuggestions',
    value: function getSuggestions(request) {
      var _this = this;

      var matches = this._scopes.map(function (scope) {
        return [scope, _this._scopeMatchesRequest(scope, request)];
      }).filter(function (result) {
        return result[1];
      }); // Filter scopes that match
      var promises = matches.map(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var scope = _ref32[0];
        var match = _ref32[1];
        return _this._getSuggestionsForScope(scope, request, match);
      });

      return Promise.all(promises).then(function (suggestions) {
        suggestions = _underscorePlus2['default'].flatten(suggestions);
        if (!suggestions.length) return false;
        return suggestions;
      });
    }

    /**
     * Rebuilds the cache
     * @return {Promise}
     */
  }, {
    key: 'rebuildCache',
    value: function rebuildCache() {
      var _this2 = this;

      return this._pathsCache.rebuildCache().then(function (result) {
        _this2._isReady = true;
        return result;
      });
    }

    /**
     * Returns the project directory that contains the file opened in the given editor
     * @param  {TextEditor} editor
     * @return {Directory}
     * @private
     */
  }, {
    key: '_getProjectDirectory',
    value: function _getProjectDirectory(editor) {
      var filePath = editor.getBuffer().getPath();
      var projectDirectory = null;
      atom.project.getDirectories().forEach(function (directory) {
        if (directory.contains(filePath)) {
          projectDirectory = directory;
        }
      });
      return projectDirectory;
    }
  }, {
    key: 'isReady',
    value: function isReady() {
      return this._isReady;
    }
  }, {
    key: 'dispose',

    /**
     * Disposes this provider
     */
    value: function dispose() {
      this._pathsCache.removeListener('rebuild-cache', this._onRebuildCache);
      this._pathsCache.removeListener('rebuild-cache-done', this._onRebuildCacheDone);
      this._pathsCache.dispose(true);
    }
  }, {
    key: 'suggestionPriority',
    get: function get() {
      return atom.config.get('autocomplete-paths.suggestionPriority');
    }
  }, {
    key: 'fileCount',
    get: function get() {
      var _this3 = this;

      return atom.project.getDirectories().reduce(function (accumulated, directory) {
        var filePaths = _this3._pathsCache.getFilePathsForProjectDirectory(directory);
        return accumulated + filePaths.length;
      }, 0);
    }
  }]);

  return PathsProvider;
})(_events.EventEmitter);

exports['default'] = PathsProvider;

PathsProvider.prototype.selector = '*';
PathsProvider.prototype.inclusionPriority = 1;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9wYXRocy1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBRzZCLFFBQVE7O29CQUNwQixNQUFNOzs7OzhCQUNULGlCQUFpQjs7OztxQkFDYixPQUFPOzs7OzBCQUNGLGVBQWU7Ozs7OEJBQ2YsaUJBQWlCOzs7O21DQUNkLHlCQUF5Qjs7OztrQ0FDMUIsd0JBQXdCOzs7O0FBVmpELFdBQVcsQ0FBQTtJQVlVLGFBQWE7WUFBYixhQUFhOztBQUNwQixXQURPLGFBQWEsR0FDakI7MEJBREksYUFBYTs7QUFFOUIsK0JBRmlCLGFBQWEsNkNBRXZCO0FBQ1AsUUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBOztBQUVuQixRQUFJLENBQUMsV0FBVyxHQUFHLDZCQUFnQixDQUFBO0FBQ25DLFFBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFBOztBQUVyQixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RELFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUU5RCxRQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQzFELFFBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0dBQ3BFOzs7Ozs7ZUFia0IsYUFBYTs7V0FrQm5CLHdCQUFHO0FBQ2QsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFF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O0FBQ2QsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUs7QUFDdEUsWUFBTSxTQUFTLEdBQUcsT0FBSyxXQUFXLENBQUMsK0JBQStCLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDN0UsZUFBTyxXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztPQUN2QyxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQ047OztTQTVRa0IsYUFBYTs7O3FCQUFiLGFBQWE7O0FBd1JsQyxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUE7QUFDdEMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUEiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL3BhdGhzLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcclxuLyogZ2xvYmFsIGF0b20gKi9cclxuXHJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcclxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xyXG5pbXBvcnQgc2xhc2ggZnJvbSAnc2xhc2gnXHJcbmltcG9ydCBQYXRoc0NhY2hlIGZyb20gJy4vcGF0aHMtY2FjaGUnXHJcbmltcG9ydCBmdXp6YWxkcmluIGZyb20gJ2Z1enphbGRyaW4tcGx1cydcclxuaW1wb3J0IERlZmF1bHRTY29wZXMgZnJvbSAnLi9jb25maWcvZGVmYXVsdC1zY29wZXMnXHJcbmltcG9ydCBPcHRpb25TY29wZXMgZnJvbSAnLi9jb25maWcvb3B0aW9uLXNjb3BlcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhzUHJvdmlkZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHN1cGVyKClcclxuICAgIHRoaXMucmVsb2FkU2NvcGVzKClcclxuXHJcbiAgICB0aGlzLl9wYXRoc0NhY2hlID0gbmV3IFBhdGhzQ2FjaGUoKVxyXG4gICAgdGhpcy5faXNSZWFkeSA9IGZhbHNlXHJcblxyXG4gICAgdGhpcy5fb25SZWJ1aWxkQ2FjaGUgPSB0aGlzLl9vblJlYnVpbGRDYWNoZS5iaW5kKHRoaXMpXHJcbiAgICB0aGlzLl9vblJlYnVpbGRDYWNoZURvbmUgPSB0aGlzLl9vblJlYnVpbGRDYWNoZURvbmUuYmluZCh0aGlzKVxyXG5cclxuICAgIHRoaXMuX3BhdGhzQ2FjaGUub24oJ3JlYnVpbGQtY2FjaGUnLCB0aGlzLl9vblJlYnVpbGRDYWNoZSlcclxuICAgIHRoaXMuX3BhdGhzQ2FjaGUub24oJ3JlYnVpbGQtY2FjaGUtZG9uZScsIHRoaXMuX29uUmVidWlsZENhY2hlRG9uZSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbG9hZHMgdGhlIHNjb3Blc1xyXG4gICAqL1xyXG4gIHJlbG9hZFNjb3BlcyAoKSB7XHJcbiAgICB0aGlzLl9zY29wZXMgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wYXRocy5zY29wZXMnKS5zbGljZSgwKSB8fCBbXVxyXG5cclxuICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMuaWdub3JlQnVpbHRpblNjb3BlcycpKSB7XHJcbiAgICAgIHRoaXMuX3Njb3BlcyA9IHRoaXMuX3Njb3Blcy5jb25jYXQoRGVmYXVsdFNjb3BlcylcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBrZXkgaW4gT3B0aW9uU2NvcGVzKSB7XHJcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoYGF1dG9jb21wbGV0ZS1wYXRocy4ke2tleX1gKSkge1xyXG4gICAgICAgIHRoaXMuX3Njb3BlcyA9IHRoaXMuX3Njb3Blcy5zbGljZSgwKS5jb25jYXQoT3B0aW9uU2NvcGVzW2tleV0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgY2FsbGVkIHdoZW4gdGhlIFBhdGhzQ2FjaGUgaXMgc3RhcnRpbmcgdG8gcmVidWlsZCB0aGUgY2FjaGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9vblJlYnVpbGRDYWNoZSAoKSB7XHJcbiAgICB0aGlzLmVtaXQoJ3JlYnVpbGQtY2FjaGUnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBjYWxsZWQgd2hlbiB0aGUgUGF0aHNDYWNoZSBpcyBkb25lIHJlYnVpbGRpbmcgdGhlIGNhY2hlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBfb25SZWJ1aWxkQ2FjaGVEb25lICgpIHtcclxuICAgIHRoaXMuZW1pdCgncmVidWlsZC1jYWNoZS1kb25lJylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gc2NvcGUgY29uZmlnIG1hdGNoZXMgdGhlIGdpdmVuIHJlcXVlc3RcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHNjb3BlXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSByZXF1ZXN0XHJcbiAgICogQHJldHVybiB7QXJyYXl9IFRoZSBtYXRjaCBvYmplY3RcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIF9zY29wZU1hdGNoZXNSZXF1ZXN0IChzY29wZSwgcmVxdWVzdCkge1xyXG4gICAgY29uc3Qgc291cmNlU2NvcGVzID0gQXJyYXkuaXNBcnJheShzY29wZS5zY29wZXMpXHJcbiAgICAgID8gc2NvcGUuc2NvcGVzXHJcbiAgICAgIDogW3Njb3BlLnNjb3Blc11cclxuXHJcbiAgICAvLyBDaGVjayBpZiB0aGUgc2NvcGUgZGVzY3JpcHRvcnMgbWF0Y2hcclxuICAgIGNvbnN0IHNjb3BlTWF0Y2hlcyA9IF8uaW50ZXJzZWN0aW9uKFxyXG4gICAgICByZXF1ZXN0LnNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpLFxyXG4gICAgICBzb3VyY2VTY29wZXNcclxuICAgICkubGVuZ3RoID4gMFxyXG4gICAgaWYgKCFzY29wZU1hdGNoZXMpIHJldHVybiBmYWxzZVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHRoZSBsaW5lIG1hdGNoZXMgdGhlIHByZWZpeGVzXHJcbiAgICBjb25zdCBsaW5lID0gdGhpcy5fZ2V0TGluZVRleHRGb3JSZXF1ZXN0KHJlcXVlc3QpXHJcblxyXG4gICAgbGV0IGxpbmVNYXRjaCA9IG51bGxcclxuICAgIGNvbnN0IHNjb3BlUHJlZml4ZXMgPSBBcnJheS5pc0FycmF5KHNjb3BlLnByZWZpeGVzKVxyXG4gICAgICA/IHNjb3BlLnByZWZpeGVzXHJcbiAgICAgIDogW3Njb3BlLnByZWZpeGVzXVxyXG4gICAgc2NvcGVQcmVmaXhlcy5mb3JFYWNoKHByZWZpeCA9PiB7XHJcbiAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChwcmVmaXgsICdpJylcclxuICAgICAgbGluZU1hdGNoID0gbGluZU1hdGNoIHx8IGxpbmUubWF0Y2gocmVnZXgpXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBsaW5lTWF0Y2hcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHdob2xlIGxpbmUgdGV4dCBmb3IgdGhlIGdpdmVuIHJlcXVlc3RcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHJlcXVlc3RcclxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBfZ2V0TGluZVRleHRGb3JSZXF1ZXN0IChyZXF1ZXN0KSB7XHJcbiAgICBjb25zdCB7IGVkaXRvciwgYnVmZmVyUG9zaXRpb24gfSA9IHJlcXVlc3RcclxuICAgIHJldHVybiBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdWdnZXN0aW9ucyBmb3IgdGhlIGdpdmVuIHNjb3BlIGFuZCB0aGUgZ2l2ZW4gcmVxdWVzdFxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gc2NvcGVcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHJlcXVlc3RcclxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgX2dldFN1Z2dlc3Rpb25zRm9yU2NvcGUgKHNjb3BlLCByZXF1ZXN0LCBtYXRjaCkge1xyXG4gICAgY29uc3QgbGluZSA9IHRoaXMuX2dldExpbmVUZXh0Rm9yUmVxdWVzdChyZXF1ZXN0KVxyXG4gICAgY29uc3QgcGF0aFByZWZpeCA9IGxpbmUuc3Vic3RyKG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKVxyXG4gICAgY29uc3QgdHJhaWxpbmdTbGFzaFByZXNlbnQgPSBwYXRoUHJlZml4Lm1hdGNoKC9bL3xcXFxcXSQvKVxyXG4gICAgY29uc3QgZGlyZWN0b3J5R2l2ZW4gPSBwYXRoUHJlZml4LmluZGV4T2YoJy4vJykgPT09IDAgfHwgcGF0aFByZWZpeC5pbmRleE9mKCcuLi8nKSA9PT0gMFxyXG4gICAgY29uc3QgcGFyc2VkUGF0aFByZWZpeCA9IHBhdGgucGFyc2UocGF0aFByZWZpeClcclxuXHJcbiAgICAvLyBwYXRoLnBhcnNlIGlnbm9yZXMgdHJhaWxpbmcgc2xhc2hlcywgc28gd2UgaGFuZGxlIHRoaXMgbWFudWFsbHlcclxuICAgIGlmICh0cmFpbGluZ1NsYXNoUHJlc2VudCkge1xyXG4gICAgICBwYXJzZWRQYXRoUHJlZml4LmRpciA9IHBhdGguam9pbihwYXJzZWRQYXRoUHJlZml4LmRpciwgcGFyc2VkUGF0aFByZWZpeC5iYXNlKVxyXG4gICAgICBwYXJzZWRQYXRoUHJlZml4LmJhc2UgPSAnJ1xyXG4gICAgICBwYXJzZWRQYXRoUHJlZml4Lm5hbWUgPSAnJ1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHByb2plY3REaXJlY3RvcnkgPSB0aGlzLl9nZXRQcm9qZWN0RGlyZWN0b3J5KHJlcXVlc3QuZWRpdG9yKVxyXG4gICAgaWYgKCFwcm9qZWN0RGlyZWN0b3J5KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxyXG4gICAgY29uc3QgY3VycmVudERpcmVjdG9yeSA9IHBhdGguZGlybmFtZShyZXF1ZXN0LmVkaXRvci5nZXRQYXRoKCkpXHJcblxyXG4gICAgY29uc3QgcmVxdWVzdGVkRGlyZWN0b3J5UGF0aCA9IHBhdGgucmVzb2x2ZShjdXJyZW50RGlyZWN0b3J5LCBwYXJzZWRQYXRoUHJlZml4LmRpcilcclxuXHJcbiAgICBsZXQgZmlsZXMgPSBkaXJlY3RvcnlHaXZlblxyXG4gICAgICA/IHRoaXMuX3BhdGhzQ2FjaGUuZ2V0RmlsZVBhdGhzRm9yUHJvamVjdERpcmVjdG9yeShwcm9qZWN0RGlyZWN0b3J5LCByZXF1ZXN0ZWREaXJlY3RvcnlQYXRoKVxyXG4gICAgICA6IHRoaXMuX3BhdGhzQ2FjaGUuZ2V0RmlsZVBhdGhzRm9yUHJvamVjdERpcmVjdG9yeShwcm9qZWN0RGlyZWN0b3J5KVxyXG5cclxuICAgIGNvbnN0IGZ1enp5TWF0Y2hlciA9IGRpcmVjdG9yeUdpdmVuXHJcbiAgICAgID8gcGFyc2VkUGF0aFByZWZpeC5iYXNlXHJcbiAgICAgIDogcGF0aFByZWZpeFxyXG5cclxuICAgIGNvbnN0IHsgZXh0ZW5zaW9ucyB9ID0gc2NvcGVcclxuICAgIGlmIChleHRlbnNpb25zKSB7XHJcbiAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgLigke2V4dGVuc2lvbnMuam9pbignfCcpfSkkYClcclxuICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIocGF0aCA9PiByZWdleC50ZXN0KHBhdGgpKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChmdXp6eU1hdGNoZXIpIHtcclxuICAgICAgZmlsZXMgPSBmdXp6YWxkcmluLmZpbHRlcihmaWxlcywgZnV6enlNYXRjaGVyLCB7XHJcbiAgICAgICAgbWF4UmVzdWx0czogMTBcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3VnZ2VzdGlvbnMgPSBmaWxlcy5tYXAocGF0aE5hbWUgPT4ge1xyXG4gICAgICBjb25zdCBub3JtYWxpemVTbGFzaGVzID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMubm9ybWFsaXplU2xhc2hlcycpXHJcblxyXG4gICAgICBjb25zdCBwcm9qZWN0UmVsYXRpdmVQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGhOYW1lKVsxXVxyXG4gICAgICBsZXQgZGlzcGxheVRleHQgPSBwcm9qZWN0UmVsYXRpdmVQYXRoXHJcbiAgICAgIGlmIChkaXJlY3RvcnlHaXZlbikge1xyXG4gICAgICAgIGRpc3BsYXlUZXh0ID0gcGF0aC5yZWxhdGl2ZShyZXF1ZXN0ZWREaXJlY3RvcnlQYXRoLCBwYXRoTmFtZSlcclxuICAgICAgfVxyXG4gICAgICBpZiAobm9ybWFsaXplU2xhc2hlcykge1xyXG4gICAgICAgIGRpc3BsYXlUZXh0ID0gc2xhc2goZGlzcGxheVRleHQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbGF0aXZpemUgcGF0aCB0byBjdXJyZW50IGZpbGUgaWYgbmVjZXNzYXJ5XHJcbiAgICAgIGxldCByZWxhdGl2ZVBhdGggPSBwYXRoLnJlbGF0aXZlKHBhdGguZGlybmFtZShyZXF1ZXN0LmVkaXRvci5nZXRQYXRoKCkpLCBwYXRoTmFtZSlcclxuICAgICAgaWYgKG5vcm1hbGl6ZVNsYXNoZXMpIHJlbGF0aXZlUGF0aCA9IHNsYXNoKHJlbGF0aXZlUGF0aClcclxuICAgICAgaWYgKHNjb3BlLnJlbGF0aXZlICE9PSBmYWxzZSkge1xyXG4gICAgICAgIHBhdGhOYW1lID0gcmVsYXRpdmVQYXRoXHJcbiAgICAgICAgaWYgKHNjb3BlLmluY2x1ZGVDdXJyZW50RGlyZWN0b3J5ICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgaWYgKHBhdGhOYW1lWzBdICE9PSAnLicpIHtcclxuICAgICAgICAgICAgcGF0aE5hbWUgPSBgLi8ke3BhdGhOYW1lfWBcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzY29wZS5wcm9qZWN0UmVsYXRpdmVQYXRoKSB7XHJcbiAgICAgICAgcGF0aE5hbWUgPSBwcm9qZWN0UmVsYXRpdmVQYXRoXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlcGxhY2Ugc3R1ZmYgaWYgbmVjZXNzYXJ5XHJcbiAgICAgIGlmIChzY29wZS5yZXBsYWNlT25JbnNlcnQpIHtcclxuICAgICAgICBsZXQgb3JpZ2luYWxQYXRoTmFtZSA9IHBhdGhOYW1lXHJcbiAgICAgICAgc2NvcGUucmVwbGFjZU9uSW5zZXJ0LmZvckVhY2goKFtmcm9tLCB0b10pID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChmcm9tKVxyXG4gICAgICAgICAgaWYgKHJlZ2V4LnRlc3QocGF0aE5hbWUpKSB7XHJcbiAgICAgICAgICAgIHBhdGhOYW1lID0gcGF0aE5hbWUucmVwbGFjZShyZWdleCwgdG8pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIGRpc3RhbmNlIHRvIGZpbGVcclxuICAgICAgY29uc3QgZGlzdGFuY2VUb0ZpbGUgPSByZWxhdGl2ZVBhdGguc3BsaXQocGF0aC5zZXApLmxlbmd0aFxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHRleHQ6IHBhdGhOYW1lLFxyXG4gICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiBwYXRoUHJlZml4LFxyXG4gICAgICAgIGRpc3BsYXlUZXh0LFxyXG4gICAgICAgIHR5cGU6ICdpbXBvcnQnLFxyXG4gICAgICAgIGljb25IVE1MOiAnPGkgY2xhc3M9XCJpY29uLWZpbGUtY29kZVwiPjwvaT4nLFxyXG4gICAgICAgIHNjb3JlOiBmdXp6YWxkcmluLnNjb3JlKGRpc3BsYXlUZXh0LCByZXF1ZXN0LnByZWZpeCksXHJcbiAgICAgICAgZGlzdGFuY2VUb0ZpbGVcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBNb2RpZnkgc2NvcmUgdG8gaW5jb3Jwb3JhdGUgZGlzdGFuY2VcclxuICAgIGNvbnN0IHN1Z2dlc3Rpb25zQ291bnQgPSBzdWdnZXN0aW9ucy5sZW5ndGhcclxuICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgY29uc3QgbWF4RGlzdGFuY2UgPSBfLm1heChzdWdnZXN0aW9ucywgcyA9PiBzLmRpc3RhbmNlVG9GaWxlKS5kaXN0YW5jZVRvRmlsZVxyXG4gICAgICBzdWdnZXN0aW9ucy5mb3JFYWNoKChzLCBpKSA9PiB7XHJcbiAgICAgICAgcy5zY29yZSA9IChzdWdnZXN0aW9uc0NvdW50IC0gaSkgKyAobWF4RGlzdGFuY2UgLSBzLmRpc3RhbmNlVG9GaWxlKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gU29ydCBhZ2FpblxyXG4gICAgICBzdWdnZXN0aW9ucy5zb3J0KChhLCBiKSA9PiBiLnNjb3JlIC0gYS5zY29yZSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHN1Z2dlc3Rpb25zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3VnZ2VzdGlvbnMgZm9yIHRoZSBnaXZlbiByZXF1ZXN0XHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSByZXF1ZXN0XHJcbiAgICogQHJldHVybiB7UHJvbWlzZX1cclxuICAgKi9cclxuICBnZXRTdWdnZXN0aW9ucyAocmVxdWVzdCkge1xyXG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMuX3Njb3Blc1xyXG4gICAgICAubWFwKHNjb3BlID0+IFtzY29wZSwgdGhpcy5fc2NvcGVNYXRjaGVzUmVxdWVzdChzY29wZSwgcmVxdWVzdCldKVxyXG4gICAgICAuZmlsdGVyKHJlc3VsdCA9PiByZXN1bHRbMV0pIC8vIEZpbHRlciBzY29wZXMgdGhhdCBtYXRjaFxyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBtYXRjaGVzLm1hcCgoW3Njb3BlLCBtYXRjaF0pID0+XHJcbiAgICAgIHRoaXMuX2dldFN1Z2dlc3Rpb25zRm9yU2NvcGUoc2NvcGUsIHJlcXVlc3QsIG1hdGNoKVxyXG4gICAgKVxyXG5cclxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcylcclxuICAgICAgLnRoZW4oc3VnZ2VzdGlvbnMgPT4ge1xyXG4gICAgICAgIHN1Z2dlc3Rpb25zID0gXy5mbGF0dGVuKHN1Z2dlc3Rpb25zKVxyXG4gICAgICAgIGlmICghc3VnZ2VzdGlvbnMubGVuZ3RoKSByZXR1cm4gZmFsc2VcclxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnNcclxuICAgICAgfSlcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlYnVpbGRzIHRoZSBjYWNoZVxyXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XHJcbiAgICovXHJcbiAgcmVidWlsZENhY2hlICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9wYXRoc0NhY2hlLnJlYnVpbGRDYWNoZSgpXHJcbiAgICAgIC50aGVuKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgdGhpcy5faXNSZWFkeSA9IHRydWVcclxuICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwcm9qZWN0IGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBmaWxlIG9wZW5lZCBpbiB0aGUgZ2l2ZW4gZWRpdG9yXHJcbiAgICogQHBhcmFtICB7VGV4dEVkaXRvcn0gZWRpdG9yXHJcbiAgICogQHJldHVybiB7RGlyZWN0b3J5fVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgX2dldFByb2plY3REaXJlY3RvcnkgKGVkaXRvcikge1xyXG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0UGF0aCgpXHJcbiAgICBsZXQgcHJvamVjdERpcmVjdG9yeSA9IG51bGxcclxuICAgIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZvckVhY2goZGlyZWN0b3J5ID0+IHtcclxuICAgICAgaWYgKGRpcmVjdG9yeS5jb250YWlucyhmaWxlUGF0aCkpIHtcclxuICAgICAgICBwcm9qZWN0RGlyZWN0b3J5ID0gZGlyZWN0b3J5XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gcHJvamVjdERpcmVjdG9yeVxyXG4gIH1cclxuXHJcbiAgaXNSZWFkeSAoKSB7IHJldHVybiB0aGlzLl9pc1JlYWR5IH1cclxuXHJcbiAgZ2V0IHN1Z2dlc3Rpb25Qcmlvcml0eSAoKSB7XHJcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMuc3VnZ2VzdGlvblByaW9yaXR5JylcclxuICB9XHJcblxyXG4gIGdldCBmaWxlQ291bnQoKSB7XHJcbiAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkucmVkdWNlKChhY2N1bXVsYXRlZCwgZGlyZWN0b3J5KSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX3BhdGhzQ2FjaGUuZ2V0RmlsZVBhdGhzRm9yUHJvamVjdERpcmVjdG9yeShkaXJlY3RvcnkpXHJcbiAgICAgIHJldHVybiBhY2N1bXVsYXRlZCArIGZpbGVQYXRocy5sZW5ndGg7XHJcbiAgICB9LCAwKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgdGhpcyBwcm92aWRlclxyXG4gICAqL1xyXG4gIGRpc3Bvc2UgKCkge1xyXG4gICAgdGhpcy5fcGF0aHNDYWNoZS5yZW1vdmVMaXN0ZW5lcigncmVidWlsZC1jYWNoZScsIHRoaXMuX29uUmVidWlsZENhY2hlKVxyXG4gICAgdGhpcy5fcGF0aHNDYWNoZS5yZW1vdmVMaXN0ZW5lcigncmVidWlsZC1jYWNoZS1kb25lJywgdGhpcy5fb25SZWJ1aWxkQ2FjaGVEb25lKVxyXG4gICAgdGhpcy5fcGF0aHNDYWNoZS5kaXNwb3NlKHRydWUpXHJcbiAgfVxyXG59XHJcblxyXG5QYXRoc1Byb3ZpZGVyLnByb3RvdHlwZS5zZWxlY3RvciA9ICcqJ1xyXG5QYXRoc1Byb3ZpZGVyLnByb3RvdHlwZS5pbmNsdXNpb25Qcmlvcml0eSA9IDFcclxuIl19