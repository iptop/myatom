(function() {
  var log;

  log = require('./log');

  module.exports = {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 2,
    suggestionPriority: atom.config.get('autocomplete-python.suggestionPriority'),
    excludeLowerPriority: false,
    cacheSize: 10,
    _addEventListener: function(editor, eventName, handler) {
      var disposable, editorView;
      editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      disposable = new this.Disposable(function() {
        log.debug('Unsubscribing from event listener ', eventName, handler);
        return editorView.removeEventListener(eventName, handler);
      });
      return disposable;
    },
    _noExecutableError: function(error) {
      if (this.providerNoExecutable) {
        return;
      }
      log.warning('No python executable found', error);
      atom.notifications.addWarning('autocomplete-python unable to find python binary.', {
        detail: "Please set path to python executable manually in package\nsettings and restart your editor. Be sure to migrate on new settings\nif everything worked on previous version.\nDetailed error message: " + error + "\n\nCurrent config: " + (atom.config.get('autocomplete-python.pythonPaths')),
        dismissable: true
      });
      return this.providerNoExecutable = true;
    },
    _spawnDaemon: function() {
      var interpreter, ref;
      interpreter = this.InterpreterLookup.getInterpreter();
      log.debug('Using interpreter', interpreter);
      this.provider = new this.BufferedProcess({
        command: interpreter || 'python',
        args: [__dirname + '/completion.py'],
        stdout: (function(_this) {
          return function(data) {
            return _this._deserialize(data);
          };
        })(this),
        stderr: (function(_this) {
          return function(data) {
            var ref, requestId, resolve, results1;
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
            log.debug("Forcing to resolve " + (Object.keys(_this.requests).length) + " promises");
            ref = _this.requests;
            results1 = [];
            for (requestId in ref) {
              resolve = ref[requestId];
              if (typeof resolve === 'function') {
                resolve([]);
              }
              results1.push(delete _this.requests[requestId]);
            }
            return results1;
          };
        })(this),
        exit: (function(_this) {
          return function(code) {
            return log.warning('Process exit with', code, _this.provider);
          };
        })(this)
      });
      this.provider.onWillThrowError((function(_this) {
        return function(arg) {
          var error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            _this._noExecutableError(error);
            _this.dispose();
            return handle();
          } else {
            throw error;
          }
        };
      })(this));
      if ((ref = this.provider.process) != null) {
        ref.stdin.on('error', function(err) {
          return log.debug('stdin', err);
        });
      }
      return setTimeout((function(_this) {
        return function() {
          log.debug('Killing python process after timeout...');
          if (_this.provider && _this.provider.process) {
            return _this.provider.kill();
          }
        };
      })(this), 60 * 10 * 1000);
    },
    load: function() {
      if (!this.constructed) {
        this.constructor();
      }
      return this;
    },
    constructor: function() {
      var err, ref, selector;
      ref = require('atom'), this.Disposable = ref.Disposable, this.CompositeDisposable = ref.CompositeDisposable, this.BufferedProcess = ref.BufferedProcess;
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.DefinitionsView = require('./definitions-view');
      this.UsagesView = require('./usages-view');
      this.OverrideView = require('./override-view');
      this.RenameView = require('./rename-view');
      this.InterpreterLookup = require('./interpreters-lookup');
      this._ = require('underscore');
      this.filter = require('fuzzaldrin-plus').filter;
      this._showSignatureOverlay = require('./tooltips')._showSignatureOverlay;
      this.requests = {};
      this.responses = {};
      this.provider = null;
      this.disposables = new this.CompositeDisposable;
      this.subscriptions = {};
      this.definitionsView = null;
      this.usagesView = null;
      this.renameView = null;
      this.constructed = true;
      this.snippetsManager = null;
      log.debug("Init autocomplete-python with priority " + this.suggestionPriority);
      try {
        this.triggerCompletionRegex = RegExp(atom.config.get('autocomplete-python.triggerCompletionRegex'));
      } catch (error1) {
        err = error1;
        atom.notifications.addWarning('autocomplete-python invalid regexp to trigger autocompletions.\nFalling back to default value.', {
          detail: "Original exception: " + err,
          dismissable: true
        });
        atom.config.set('autocomplete-python.triggerCompletionRegex', '([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)');
        this.triggerCompletionRegex = /([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      }
      selector = 'atom-text-editor[data-grammar~=python]';
      atom.commands.add(selector, 'autocomplete-python:go-to-definition', (function(_this) {
        return function() {
          return _this.goToDefinition();
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:complete-arguments', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this._completeArguments(editor, editor.getCursorBufferPosition(), true);
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:show-usages', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.usagesView) {
            _this.usagesView.destroy();
          }
          _this.usagesView = new _this.UsagesView();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            return _this.usagesView.setItems(usages);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:override-method', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.overrideView) {
            _this.overrideView.destroy();
          }
          _this.overrideView = new _this.OverrideView();
          return _this.getMethods(editor, bufferPosition).then(function(arg) {
            var bufferPosition, indent, methods;
            methods = arg.methods, indent = arg.indent, bufferPosition = arg.bufferPosition;
            _this.overrideView.indent = indent;
            _this.overrideView.bufferPosition = bufferPosition;
            return _this.overrideView.setItems(methods);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:rename', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            if (_this.renameView) {
              _this.renameView.destroy();
            }
            if (usages.length > 0) {
              _this.renameView = new _this.RenameView(usages);
              return _this.renameView.onInput(function(newName) {
                var _relative, fileName, project, ref1, ref2, results1;
                ref1 = _this._.groupBy(usages, 'fileName');
                results1 = [];
                for (fileName in ref1) {
                  usages = ref1[fileName];
                  ref2 = atom.project.relativizePath(fileName), project = ref2[0], _relative = ref2[1];
                  if (project) {
                    results1.push(_this._updateUsagesInFile(fileName, usages, newName));
                  } else {
                    results1.push(log.debug('Ignoring file outside of project', fileName));
                  }
                }
                return results1;
              });
            } else {
              if (_this.usagesView) {
                _this.usagesView.destroy();
              }
              _this.usagesView = new _this.UsagesView();
              return _this.usagesView.setItems(usages);
            }
          });
        };
      })(this));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
          });
        };
      })(this));
      return atom.config.onDidChange('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function() {
          return atom.workspace.observeTextEditors(function(editor) {
            return _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          });
        };
      })(this));
    },
    _updateUsagesInFile: function(fileName, usages, newName) {
      var columnOffset;
      columnOffset = {};
      return atom.workspace.open(fileName, {
        activateItem: false
      }).then(function(editor) {
        var buffer, column, i, len, line, name, usage;
        buffer = editor.getBuffer();
        for (i = 0, len = usages.length; i < len; i++) {
          usage = usages[i];
          name = usage.name, line = usage.line, column = usage.column;
          if (columnOffset[line] == null) {
            columnOffset[line] = 0;
          }
          log.debug('Replacing', usage, 'with', newName, 'in', editor.id);
          log.debug('Offset for line', line, 'is', columnOffset[line]);
          buffer.setTextInRange([[line - 1, column + columnOffset[line]], [line - 1, column + name.length + columnOffset[line]]], newName);
          columnOffset[line] += newName.length - name.length;
        }
        return buffer.save();
      });
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = editor.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event, _this);
            };
          })(this));
        }
        if (!atom.config.get('autocomplete-plus.enableAutoActivation')) {
          log.debug('Ignoring keyup events due to autocomplete-plus settings.');
          return;
        }
        disposable = this._addEventListener(editor, eventName, (function(_this) {
          return function(e) {
            if (atom.keymaps.keystrokeForKeyboardEvent(e) === '^(') {
              log.debug('Trying to complete arguments on keyup event', e);
              return _this._completeArguments(editor, editor.getCursorBufferPosition());
            }
          };
        })(this));
        this.disposables.add(disposable);
        this.subscriptions[eventId] = disposable;
        return log.debug('Subscribed on event', eventId);
      } else {
        if (eventId in this.subscriptions) {
          this.subscriptions[eventId].dispose();
          return log.debug('Unsubscribed from event', eventId);
        }
      }
    },
    _serialize: function(request) {
      log.debug('Serializing request to be sent to Jedi', request);
      return JSON.stringify(request);
    },
    _sendRequest: function(data, respawned) {
      var process;
      log.debug('Pending requests:', Object.keys(this.requests).length, this.requests);
      if (Object.keys(this.requests).length > 10) {
        log.debug('Cleaning up request queue to avoid overflow, ignoring request');
        this.requests = {};
        if (this.provider && this.provider.process) {
          log.debug('Killing python process');
          this.provider.kill();
          return;
        }
      }
      if (this.provider && this.provider.process) {
        process = this.provider.process;
        if (process.exitCode === null && process.signalCode === null) {
          if (this.provider.process.pid) {
            return this.provider.process.stdin.write(data + '\n');
          } else {
            return log.debug('Attempt to communicate with terminated process', this.provider);
          }
        } else if (respawned) {
          atom.notifications.addWarning(["Failed to spawn daemon for autocomplete-python.", "Completions will not work anymore", "unless you restart your editor."].join(' '), {
            detail: ["exitCode: " + process.exitCode, "signalCode: " + process.signalCode].join('\n'),
            dismissable: true
          });
          return this.dispose();
        } else {
          this._spawnDaemon();
          this._sendRequest(data, {
            respawned: true
          });
          return log.debug('Re-spawning python process...');
        }
      } else {
        log.debug('Spawning python process...');
        this._spawnDaemon();
        return this._sendRequest(data);
      }
    },
    _deserialize: function(response) {
      var bufferPosition, cacheSizeDelta, e, editor, i, id, ids, j, len, len1, ref, ref1, ref2, resolve, responseSource, results1;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      ref = response.trim().split('\n');
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        responseSource = ref[i];
        try {
          response = JSON.parse(responseSource);
        } catch (error1) {
          e = error1;
          throw new Error("Failed to parse JSON from \"" + responseSource + "\".\nOriginal exception: " + e);
        }
        if (response['arguments']) {
          editor = this.requests[response['id']];
          if (typeof editor === 'object') {
            bufferPosition = editor.getCursorBufferPosition();
            if (response['id'] === this._generateRequestId('arguments', editor, bufferPosition)) {
              if ((ref1 = this.snippetsManager) != null) {
                ref1.insertSnippet(response['arguments'], editor);
              }
            }
          }
        } else {
          resolve = this.requests[response['id']];
          if (typeof resolve === 'function') {
            resolve(response['results']);
          }
        }
        cacheSizeDelta = Object.keys(this.responses).length > this.cacheSize;
        if (cacheSizeDelta > 0) {
          ids = Object.keys(this.responses).sort((function(_this) {
            return function(a, b) {
              return _this.responses[a]['timestamp'] - _this.responses[b]['timestamp'];
            };
          })(this));
          ref2 = ids.slice(0, cacheSizeDelta);
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            id = ref2[j];
            log.debug('Removing old item from cache with ID', id);
            delete this.responses[id];
          }
        }
        this.responses[response['id']] = {
          source: responseSource,
          timestamp: Date.now()
        };
        log.debug('Cached request with ID', response['id']);
        results1.push(delete this.requests[response['id']]);
      }
      return results1;
    },
    _generateRequestId: function(type, editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column, type].join()).digest('hex');
    },
    _generateRequestConfig: function() {
      var args, extraPaths;
      extraPaths = this.InterpreterLookup.applySubstitutions(atom.config.get('autocomplete-python.extraPaths').split(';'));
      args = {
        'extraPaths': extraPaths,
        'useSnippets': atom.config.get('autocomplete-python.useSnippets'),
        'caseInsensitiveCompletion': atom.config.get('autocomplete-python.caseInsensitiveCompletion'),
        'showDescriptions': atom.config.get('autocomplete-python.showDescriptions'),
        'fuzzyMatcher': atom.config.get('autocomplete-python.fuzzyMatcher')
      };
      return args;
    },
    setSnippetsManager: function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    },
    _completeArguments: function(editor, bufferPosition, force) {
      var disableForSelector, line, lines, payload, prefix, scopeChain, scopeDescriptor, suffix, useSnippets;
      useSnippets = atom.config.get('autocomplete-python.useSnippets');
      if (!force && useSnippets === 'none') {
        atom.commands.dispatch(document.querySelector('atom-text-editor'), 'autocomplete-plus:activate');
        return;
      }
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.Selector.create(this.disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('Ignoring argument completion inside of', scopeChain);
        return;
      }
      lines = editor.getBuffer().getLines();
      line = lines[bufferPosition.row];
      prefix = line.slice(bufferPosition.column - 1, bufferPosition.column);
      if (prefix !== '(') {
        log.debug('Ignoring argument completion with prefix', prefix);
        return;
      }
      suffix = line.slice(bufferPosition.column, line.length);
      if (!/^(\)(?:$|\s)|\s|$)/.test(suffix)) {
        log.debug('Ignoring argument completion with suffix', suffix);
        return;
      }
      payload = {
        id: this._generateRequestId('arguments', editor, bufferPosition),
        lookup: 'arguments',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function() {
          return _this.requests[payload.id] = editor;
        };
      })(this));
    },
    _fuzzyFilter: function(candidates, query) {
      if (candidates.length !== 0 && (query !== ' ' && query !== '.' && query !== '(')) {
        candidates = this.filter(candidates, query, {
          key: 'text'
        });
      }
      return candidates;
    },
    getSuggestions: function(arg) {
      var bufferPosition, editor, lastIdentifier, line, lines, matches, payload, prefix, requestId, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.load();
      if (!this.triggerCompletionRegex.test(prefix)) {
        return this.lastSuggestions = [];
      }
      bufferPosition = {
        row: bufferPosition.row,
        column: bufferPosition.column
      };
      lines = editor.getBuffer().getLines();
      if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
        line = lines[bufferPosition.row];
        lastIdentifier = /\.?[a-zA-Z_][a-zA-Z0-9_]*$/.exec(line.slice(0, bufferPosition.column));
        if (lastIdentifier) {
          bufferPosition.column = lastIdentifier.index + 1;
          lines[bufferPosition.row] = line.slice(0, bufferPosition.column);
        }
      }
      requestId = this._generateRequestId('completions', editor, bufferPosition, lines.join('\n'));
      if (requestId in this.responses) {
        log.debug('Using cached response with ID', requestId);
        matches = JSON.parse(this.responses[requestId]['source'])['results'];
        if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
          return this.lastSuggestions = this._fuzzyFilter(matches, prefix);
        } else {
          return this.lastSuggestions = matches;
        }
      }
      payload = {
        id: requestId,
        prefix: prefix,
        lookup: 'completions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
            return _this.requests[payload.id] = function(matches) {
              return resolve(_this.lastSuggestions = _this._fuzzyFilter(matches, prefix));
            };
          } else {
            return _this.requests[payload.id] = function(suggestions) {
              return resolve(_this.lastSuggestions = suggestions);
            };
          }
        };
      })(this));
    },
    getDefinitions: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('definitions', editor, bufferPosition),
        lookup: 'definitions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getUsages: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('usages', editor, bufferPosition),
        lookup: 'usages',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getMethods: function(editor, bufferPosition) {
      var indent, lines, payload;
      indent = bufferPosition.column;
      lines = editor.getBuffer().getLines();
      lines.splice(bufferPosition.row + 1, 0, "  def __autocomplete_python(s):");
      lines.splice(bufferPosition.row + 2, 0, "    s.");
      payload = {
        id: this._generateRequestId('methods', editor, bufferPosition),
        lookup: 'methods',
        path: editor.getPath(),
        source: lines.join('\n'),
        line: bufferPosition.row + 2,
        column: 6,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = function(methods) {
            return resolve({
              methods: methods,
              indent: indent,
              bufferPosition: bufferPosition
            });
          };
        };
      })(this));
    },
    goToDefinition: function(editor, bufferPosition) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!bufferPosition) {
        bufferPosition = editor.getCursorBufferPosition();
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new this.DefinitionsView();
      return this.getDefinitions(editor, bufferPosition).then((function(_this) {
        return function(results) {
          _this.definitionsView.setItems(results);
          if (results.length === 1) {
            return _this.definitionsView.confirmed(results[0]);
          }
        };
      })(this));
    },
    dispose: function() {
      if (this.disposables) {
        this.disposables.dispose();
      }
      if (this.provider) {
        return this.provider.kill();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLGdCQUFWO0lBQ0Esa0JBQUEsRUFBb0IsaURBRHBCO0lBRUEsaUJBQUEsRUFBbUIsQ0FGbkI7SUFHQSxrQkFBQSxFQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhCLENBSHBCO0lBSUEsb0JBQUEsRUFBc0IsS0FKdEI7SUFLQSxTQUFBLEVBQVcsRUFMWDtJQU9BLGlCQUFBLEVBQW1CLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsT0FBcEI7QUFDakIsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkI7TUFDYixVQUFVLENBQUMsZ0JBQVgsQ0FBNEIsU0FBNUIsRUFBdUMsT0FBdkM7TUFDQSxVQUFBLEdBQWlCLElBQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFBO1FBQzNCLEdBQUcsQ0FBQyxLQUFKLENBQVUsb0NBQVYsRUFBZ0QsU0FBaEQsRUFBMkQsT0FBM0Q7ZUFDQSxVQUFVLENBQUMsbUJBQVgsQ0FBK0IsU0FBL0IsRUFBMEMsT0FBMUM7TUFGMkIsQ0FBWjtBQUdqQixhQUFPO0lBTlUsQ0FQbkI7SUFlQSxrQkFBQSxFQUFvQixTQUFDLEtBQUQ7TUFDbEIsSUFBRyxJQUFDLENBQUEsb0JBQUo7QUFDRSxlQURGOztNQUVBLEdBQUcsQ0FBQyxPQUFKLENBQVksNEJBQVosRUFBMEMsS0FBMUM7TUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQ0UsbURBREYsRUFDdUQ7UUFDckQsTUFB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TUFFQSxJQUFDLENBQUEsZUFBRCxHQUF1QixJQUFBLElBQUMsQ0FBQSxlQUFELENBQUE7YUFDdkIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsTUFBaEIsRUFBd0IsY0FBeEIsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtVQUMzQyxLQUFDLENBQUEsZUFBZSxDQUFDLFFBQWpCLENBQTBCLE9BQTFCO1VBQ0EsSUFBRyxPQUFPLENBQUMsTUFBUixLQUFrQixDQUFyQjttQkFDRSxLQUFDLENBQUEsZUFBZSxDQUFDLFNBQWpCLENBQTJCLE9BQVEsQ0FBQSxDQUFBLENBQW5DLEVBREY7O1FBRjJDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QztJQVJjLENBdGNoQjtJQW1kQSxPQUFBLEVBQVMsU0FBQTtNQUNQLElBQUcsSUFBQyxDQUFBLFdBQUo7UUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQSxFQURGOztNQUVBLElBQUcsSUFBQyxDQUFBLFFBQUo7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQSxFQURGOztJQUhPLENBbmRUOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsibG9nID0gcmVxdWlyZSAnLi9sb2cnXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgc2VsZWN0b3I6ICcuc291cmNlLnB5dGhvbidcclxuICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcuc291cmNlLnB5dGhvbiAuY29tbWVudCwgLnNvdXJjZS5weXRob24gLnN0cmluZydcclxuICBpbmNsdXNpb25Qcmlvcml0eTogMlxyXG4gIHN1Z2dlc3Rpb25Qcmlvcml0eTogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnN1Z2dlc3Rpb25Qcmlvcml0eScpXHJcbiAgZXhjbHVkZUxvd2VyUHJpb3JpdHk6IGZhbHNlXHJcbiAgY2FjaGVTaXplOiAxMFxyXG5cclxuICBfYWRkRXZlbnRMaXN0ZW5lcjogKGVkaXRvciwgZXZlbnROYW1lLCBoYW5kbGVyKSAtPlxyXG4gICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyBlZGl0b3JcclxuICAgIGVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lciBldmVudE5hbWUsIGhhbmRsZXJcclxuICAgIGRpc3Bvc2FibGUgPSBuZXcgQERpc3Bvc2FibGUgLT5cclxuICAgICAgbG9nLmRlYnVnICdVbnN1YnNjcmliaW5nIGZyb20gZXZlbnQgbGlzdGVuZXIgJywgZXZlbnROYW1lLCBoYW5kbGVyXHJcbiAgICAgIGVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lciBldmVudE5hbWUsIGhhbmRsZXJcclxuICAgIHJldHVybiBkaXNwb3NhYmxlXHJcblxyXG4gIF9ub0V4ZWN1dGFibGVFcnJvcjogKGVycm9yKSAtPlxyXG4gICAgaWYgQHByb3ZpZGVyTm9FeGVjdXRhYmxlXHJcbiAgICAgIHJldHVyblxyXG4gICAgbG9nLndhcm5pbmcgJ05vIHB5dGhvbiBleGVjdXRhYmxlIGZvdW5kJywgZXJyb3JcclxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxyXG4gICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbiB1bmFibGUgdG8gZmluZCBweXRob24gYmluYXJ5LicsIHtcclxuICAgICAgZGV0YWlsOiBcIlwiXCJQbGVhc2Ugc2V0IHBhdGggdG8gcHl0aG9uIGV4ZWN1dGFibGUgbWFudWFsbHkgaW4gcGFja2FnZVxyXG4gICAgICBzZXR0aW5ncyBhbmQgcmVzdGFydCB5b3VyIGVkaXRvci4gQmUgc3VyZSB0byBtaWdyYXRlIG9uIG5ldyBzZXR0aW5nc1xyXG4gICAgICBpZiBldmVyeXRoaW5nIHdvcmtlZCBvbiBwcmV2aW91cyB2ZXJzaW9uLlxyXG4gICAgICBEZXRhaWxlZCBlcnJvciBtZXNzYWdlOiAje2Vycm9yfVxyXG5cclxuICAgICAgQ3VycmVudCBjb25maWc6ICN7YXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnB5dGhvblBhdGhzJyl9XCJcIlwiXHJcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcclxuICAgIEBwcm92aWRlck5vRXhlY3V0YWJsZSA9IHRydWVcclxuXHJcbiAgX3NwYXduRGFlbW9uOiAtPlxyXG4gICAgaW50ZXJwcmV0ZXIgPSBASW50ZXJwcmV0ZXJMb29rdXAuZ2V0SW50ZXJwcmV0ZXIoKVxyXG4gICAgbG9nLmRlYnVnICdVc2luZyBpbnRlcnByZXRlcicsIGludGVycHJldGVyXHJcbiAgICBAcHJvdmlkZXIgPSBuZXcgQEJ1ZmZlcmVkUHJvY2Vzc1xyXG4gICAgICBjb21tYW5kOiBpbnRlcnByZXRlciBvciAncHl0aG9uJ1xyXG4gICAgICBhcmdzOiBbX19kaXJuYW1lICsgJy9jb21wbGV0aW9uLnB5J11cclxuICAgICAgc3Rkb3V0OiAoZGF0YSkgPT5cclxuICAgICAgICBAX2Rlc2VyaWFsaXplKGRhdGEpXHJcbiAgICAgIHN0ZGVycjogKGRhdGEpID0+XHJcbiAgICAgICAgaWYgZGF0YS5pbmRleE9mKCdpcyBub3QgcmVjb2duaXplZCBhcyBhbiBpbnRlcm5hbCBvciBleHRlcm5hbCcpID4gLTFcclxuICAgICAgICAgIHJldHVybiBAX25vRXhlY3V0YWJsZUVycm9yKGRhdGEpXHJcbiAgICAgICAgbG9nLmRlYnVnIFwiYXV0b2NvbXBsZXRlLXB5dGhvbiB0cmFjZWJhY2sgb3V0cHV0OiAje2RhdGF9XCJcclxuICAgICAgICBpZiBkYXRhLmluZGV4T2YoJ2plZGknKSA+IC0xXHJcbiAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ub3V0cHV0UHJvdmlkZXJFcnJvcnMnKVxyXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcclxuICAgICAgICAgICAgICAnJydMb29rcyBsaWtlIHRoaXMgZXJyb3Igb3JpZ2luYXRlZCBmcm9tIEplZGkuIFBsZWFzZSBkbyBub3RcclxuICAgICAgICAgICAgICByZXBvcnQgc3VjaCBpc3N1ZXMgaW4gYXV0b2NvbXBsZXRlLXB5dGhvbiBpc3N1ZSB0cmFja2VyLiBSZXBvcnRcclxuICAgICAgICAgICAgICB0aGVtIGRpcmVjdGx5IHRvIEplZGkuIFR1cm4gb2ZmIGBvdXRwdXRQcm92aWRlckVycm9yc2Agc2V0dGluZ1xyXG4gICAgICAgICAgICAgIHRvIGhpZGUgc3VjaCBlcnJvcnMgaW4gZnV0dXJlLiBUcmFjZWJhY2sgb3V0cHV0OicnJywge1xyXG4gICAgICAgICAgICAgIGRldGFpbDogXCIje2RhdGF9XCIsXHJcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcclxuICAgICAgICAgICAgJ2F1dG9jb21wbGV0ZS1weXRob24gdHJhY2ViYWNrIG91dHB1dDonLCB7XHJcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZGF0YX1cIixcclxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXHJcblxyXG4gICAgICAgIGxvZy5kZWJ1ZyBcIkZvcmNpbmcgdG8gcmVzb2x2ZSAje09iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RofSBwcm9taXNlc1wiXHJcbiAgICAgICAgZm9yIHJlcXVlc3RJZCwgcmVzb2x2ZSBvZiBAcmVxdWVzdHNcclxuICAgICAgICAgIGlmIHR5cGVvZiByZXNvbHZlID09ICdmdW5jdGlvbidcclxuICAgICAgICAgICAgcmVzb2x2ZShbXSlcclxuICAgICAgICAgIGRlbGV0ZSBAcmVxdWVzdHNbcmVxdWVzdElkXVxyXG5cclxuICAgICAgZXhpdDogKGNvZGUpID0+XHJcbiAgICAgICAgbG9nLndhcm5pbmcgJ1Byb2Nlc3MgZXhpdCB3aXRoJywgY29kZSwgQHByb3ZpZGVyXHJcbiAgICBAcHJvdmlkZXIub25XaWxsVGhyb3dFcnJvciAoe2Vycm9yLCBoYW5kbGV9KSA9PlxyXG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxyXG4gICAgICAgIEBfbm9FeGVjdXRhYmxlRXJyb3IoZXJyb3IpXHJcbiAgICAgICAgQGRpc3Bvc2UoKVxyXG4gICAgICAgIGhhbmRsZSgpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0aHJvdyBlcnJvclxyXG5cclxuICAgIEBwcm92aWRlci5wcm9jZXNzPy5zdGRpbi5vbiAnZXJyb3InLCAoZXJyKSAtPlxyXG4gICAgICBsb2cuZGVidWcgJ3N0ZGluJywgZXJyXHJcblxyXG4gICAgc2V0VGltZW91dCA9PlxyXG4gICAgICBsb2cuZGVidWcgJ0tpbGxpbmcgcHl0aG9uIHByb2Nlc3MgYWZ0ZXIgdGltZW91dC4uLidcclxuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xyXG4gICAgICAgIEBwcm92aWRlci5raWxsKClcclxuICAgICwgNjAgKiAxMCAqIDEwMDBcclxuXHJcbiAgbG9hZDogLT5cclxuICAgIGlmIG5vdCBAY29uc3RydWN0ZWRcclxuICAgICAgQGNvbnN0cnVjdG9yKClcclxuICAgIHJldHVybiB0aGlzXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxyXG4gICAge0BEaXNwb3NhYmxlLCBAQ29tcG9zaXRlRGlzcG9zYWJsZSwgQEJ1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xyXG4gICAge0BzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW59ID0gcmVxdWlyZSAnLi9zY29wZS1oZWxwZXJzJ1xyXG4gICAge0BTZWxlY3Rvcn0gPSByZXF1aXJlICdzZWxlY3Rvci1raXQnXHJcbiAgICBARGVmaW5pdGlvbnNWaWV3ID0gcmVxdWlyZSAnLi9kZWZpbml0aW9ucy12aWV3J1xyXG4gICAgQFVzYWdlc1ZpZXcgPSByZXF1aXJlICcuL3VzYWdlcy12aWV3J1xyXG4gICAgQE92ZXJyaWRlVmlldyA9IHJlcXVpcmUgJy4vb3ZlcnJpZGUtdmlldydcclxuICAgIEBSZW5hbWVWaWV3ID0gcmVxdWlyZSAnLi9yZW5hbWUtdmlldydcclxuICAgIEBJbnRlcnByZXRlckxvb2t1cCA9IHJlcXVpcmUgJy4vaW50ZXJwcmV0ZXJzLWxvb2t1cCdcclxuICAgIEBfID0gcmVxdWlyZSAndW5kZXJzY29yZSdcclxuICAgIEBmaWx0ZXIgPSByZXF1aXJlKCdmdXp6YWxkcmluLXBsdXMnKS5maWx0ZXJcclxuICAgIHtAX3Nob3dTaWduYXR1cmVPdmVybGF5fSA9IHJlcXVpcmUgJy4vdG9vbHRpcHMnXHJcblxyXG4gICAgQHJlcXVlc3RzID0ge31cclxuICAgIEByZXNwb25zZXMgPSB7fVxyXG4gICAgQHByb3ZpZGVyID0gbnVsbFxyXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IEBDb21wb3NpdGVEaXNwb3NhYmxlXHJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IHt9XHJcbiAgICBAZGVmaW5pdGlvbnNWaWV3ID0gbnVsbFxyXG4gICAgQHVzYWdlc1ZpZXcgPSBudWxsXHJcbiAgICBAcmVuYW1lVmlldyA9IG51bGxcclxuICAgIEBjb25zdHJ1Y3RlZCA9IHRydWVcclxuICAgIEBzbmlwcGV0c01hbmFnZXIgPSBudWxsXHJcblxyXG4gICAgbG9nLmRlYnVnIFwiSW5pdCBhdXRvY29tcGxldGUtcHl0aG9uIHdpdGggcHJpb3JpdHkgI3tAc3VnZ2VzdGlvblByaW9yaXR5fVwiXHJcblxyXG4gICAgdHJ5XHJcbiAgICAgIEB0cmlnZ2VyQ29tcGxldGlvblJlZ2V4ID0gUmVnRXhwIGF0b20uY29uZmlnLmdldChcclxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi50cmlnZ2VyQ29tcGxldGlvblJlZ2V4JylcclxuICAgIGNhdGNoIGVyclxyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcclxuICAgICAgICAnJydhdXRvY29tcGxldGUtcHl0aG9uIGludmFsaWQgcmVnZXhwIHRvIHRyaWdnZXIgYXV0b2NvbXBsZXRpb25zLlxyXG4gICAgICAgIEZhbGxpbmcgYmFjayB0byBkZWZhdWx0IHZhbHVlLicnJywge1xyXG4gICAgICAgIGRldGFpbDogXCJPcmlnaW5hbCBleGNlcHRpb246ICN7ZXJyfVwiXHJcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxyXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udHJpZ2dlckNvbXBsZXRpb25SZWdleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAnKFtcXC5cXCBdfFthLXpBLVpfXVthLXpBLVowLTlfXSopJylcclxuICAgICAgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXggPSAvKFtcXC5cXCBdfFthLXpBLVpfXVthLXpBLVowLTlfXSopL1xyXG5cclxuICAgIHNlbGVjdG9yID0gJ2F0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyfj1weXRob25dJ1xyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOmdvLXRvLWRlZmluaXRpb24nLCA9PlxyXG4gICAgICBAZ29Ub0RlZmluaXRpb24oKVxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOmNvbXBsZXRlLWFyZ3VtZW50cycsID0+XHJcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxyXG4gICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCksIHRydWUpXHJcblxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOnNob3ctdXNhZ2VzJywgPT5cclxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcclxuICAgICAgaWYgQHVzYWdlc1ZpZXdcclxuICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcclxuICAgICAgQHVzYWdlc1ZpZXcgPSBuZXcgQFVzYWdlc1ZpZXcoKVxyXG4gICAgICBAZ2V0VXNhZ2VzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHVzYWdlcykgPT5cclxuICAgICAgICBAdXNhZ2VzVmlldy5zZXRJdGVtcyh1c2FnZXMpXHJcblxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOm92ZXJyaWRlLW1ldGhvZCcsID0+XHJcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxyXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXHJcbiAgICAgIGlmIEBvdmVycmlkZVZpZXdcclxuICAgICAgICBAb3ZlcnJpZGVWaWV3LmRlc3Ryb3koKVxyXG4gICAgICBAb3ZlcnJpZGVWaWV3ID0gbmV3IEBPdmVycmlkZVZpZXcoKVxyXG4gICAgICBAZ2V0TWV0aG9kcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh7bWV0aG9kcywgaW5kZW50LCBidWZmZXJQb3NpdGlvbn0pID0+XHJcbiAgICAgICAgQG92ZXJyaWRlVmlldy5pbmRlbnQgPSBpbmRlbnRcclxuICAgICAgICBAb3ZlcnJpZGVWaWV3LmJ1ZmZlclBvc2l0aW9uID0gYnVmZmVyUG9zaXRpb25cclxuICAgICAgICBAb3ZlcnJpZGVWaWV3LnNldEl0ZW1zKG1ldGhvZHMpXHJcblxyXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOnJlbmFtZScsID0+XHJcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxyXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXHJcbiAgICAgIEBnZXRVc2FnZXMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikudGhlbiAodXNhZ2VzKSA9PlxyXG4gICAgICAgIGlmIEByZW5hbWVWaWV3XHJcbiAgICAgICAgICBAcmVuYW1lVmlldy5kZXN0cm95KClcclxuICAgICAgICBpZiB1c2FnZXMubGVuZ3RoID4gMFxyXG4gICAgICAgICAgQHJlbmFtZVZpZXcgPSBuZXcgQFJlbmFtZVZpZXcodXNhZ2VzKVxyXG4gICAgICAgICAgQHJlbmFtZVZpZXcub25JbnB1dCAobmV3TmFtZSkgPT5cclxuICAgICAgICAgICAgZm9yIGZpbGVOYW1lLCB1c2FnZXMgb2YgQF8uZ3JvdXBCeSh1c2FnZXMsICdmaWxlTmFtZScpXHJcbiAgICAgICAgICAgICAgW3Byb2plY3QsIF9yZWxhdGl2ZV0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZU5hbWUpXHJcbiAgICAgICAgICAgICAgaWYgcHJvamVjdFxyXG4gICAgICAgICAgICAgICAgQF91cGRhdGVVc2FnZXNJbkZpbGUoZmlsZU5hbWUsIHVzYWdlcywgbmV3TmFtZSlcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGZpbGUgb3V0c2lkZSBvZiBwcm9qZWN0JywgZmlsZU5hbWVcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZiBAdXNhZ2VzVmlld1xyXG4gICAgICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcclxuICAgICAgICAgIEB1c2FnZXNWaWV3ID0gbmV3IEBVc2FnZXNWaWV3KClcclxuICAgICAgICAgIEB1c2FnZXNWaWV3LnNldEl0ZW1zKHVzYWdlcylcclxuXHJcbiAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cclxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLCBlZGl0b3IuZ2V0R3JhbW1hcigpKVxyXG4gICAgICBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxyXG4gICAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGVkaXRvciwgZ3JhbW1hcilcclxuXHJcbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlQXV0b0FjdGl2YXRpb24nLCA9PlxyXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cclxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGVkaXRvci5nZXRHcmFtbWFyKCkpXHJcblxyXG4gIF91cGRhdGVVc2FnZXNJbkZpbGU6IChmaWxlTmFtZSwgdXNhZ2VzLCBuZXdOYW1lKSAtPlxyXG4gICAgY29sdW1uT2Zmc2V0ID0ge31cclxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZU5hbWUsIGFjdGl2YXRlSXRlbTogZmFsc2UpLnRoZW4gKGVkaXRvcikgLT5cclxuICAgICAgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpXHJcbiAgICAgIGZvciB1c2FnZSBpbiB1c2FnZXNcclxuICAgICAgICB7bmFtZSwgbGluZSwgY29sdW1ufSA9IHVzYWdlXHJcbiAgICAgICAgY29sdW1uT2Zmc2V0W2xpbmVdID89IDBcclxuICAgICAgICBsb2cuZGVidWcgJ1JlcGxhY2luZycsIHVzYWdlLCAnd2l0aCcsIG5ld05hbWUsICdpbicsIGVkaXRvci5pZFxyXG4gICAgICAgIGxvZy5kZWJ1ZyAnT2Zmc2V0IGZvciBsaW5lJywgbGluZSwgJ2lzJywgY29sdW1uT2Zmc2V0W2xpbmVdXHJcbiAgICAgICAgYnVmZmVyLnNldFRleHRJblJhbmdlKFtcclxuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgY29sdW1uT2Zmc2V0W2xpbmVdXSxcclxuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgbmFtZS5sZW5ndGggKyBjb2x1bW5PZmZzZXRbbGluZV1dLFxyXG4gICAgICAgICAgXSwgbmV3TmFtZSlcclxuICAgICAgICBjb2x1bW5PZmZzZXRbbGluZV0gKz0gbmV3TmFtZS5sZW5ndGggLSBuYW1lLmxlbmd0aFxyXG4gICAgICBidWZmZXIuc2F2ZSgpXHJcblxyXG5cclxuICBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50OiAoZWRpdG9yLCBncmFtbWFyKSAtPlxyXG4gICAgZXZlbnROYW1lID0gJ2tleXVwJ1xyXG4gICAgZXZlbnRJZCA9IFwiI3tlZGl0b3IuaWR9LiN7ZXZlbnROYW1lfVwiXHJcbiAgICBpZiBncmFtbWFyLnNjb3BlTmFtZSA9PSAnc291cmNlLnB5dGhvbidcclxuXHJcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5zaG93VG9vbHRpcHMnKSBpcyB0cnVlXHJcbiAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PlxyXG4gICAgICAgICAgQF9zaG93U2lnbmF0dXJlT3ZlcmxheShldmVudCwgQClcclxuXHJcbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJylcclxuICAgICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGtleXVwIGV2ZW50cyBkdWUgdG8gYXV0b2NvbXBsZXRlLXBsdXMgc2V0dGluZ3MuJ1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICBkaXNwb3NhYmxlID0gQF9hZGRFdmVudExpc3RlbmVyIGVkaXRvciwgZXZlbnROYW1lLCAoZSkgPT5cclxuICAgICAgICBpZiBhdG9tLmtleW1hcHMua2V5c3Ryb2tlRm9yS2V5Ym9hcmRFdmVudChlKSA9PSAnXignXHJcbiAgICAgICAgICBsb2cuZGVidWcgJ1RyeWluZyB0byBjb21wbGV0ZSBhcmd1bWVudHMgb24ga2V5dXAgZXZlbnQnLCBlXHJcbiAgICAgICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXHJcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxyXG4gICAgICBAc3Vic2NyaXB0aW9uc1tldmVudElkXSA9IGRpc3Bvc2FibGVcclxuICAgICAgbG9nLmRlYnVnICdTdWJzY3JpYmVkIG9uIGV2ZW50JywgZXZlbnRJZFxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBldmVudElkIG9mIEBzdWJzY3JpcHRpb25zXHJcbiAgICAgICAgQHN1YnNjcmlwdGlvbnNbZXZlbnRJZF0uZGlzcG9zZSgpXHJcbiAgICAgICAgbG9nLmRlYnVnICdVbnN1YnNjcmliZWQgZnJvbSBldmVudCcsIGV2ZW50SWRcclxuXHJcbiAgX3NlcmlhbGl6ZTogKHJlcXVlc3QpIC0+XHJcbiAgICBsb2cuZGVidWcgJ1NlcmlhbGl6aW5nIHJlcXVlc3QgdG8gYmUgc2VudCB0byBKZWRpJywgcmVxdWVzdFxyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpXHJcblxyXG4gIF9zZW5kUmVxdWVzdDogKGRhdGEsIHJlc3Bhd25lZCkgLT5cclxuICAgIGxvZy5kZWJ1ZyAnUGVuZGluZyByZXF1ZXN0czonLCBPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aCwgQHJlcXVlc3RzXHJcbiAgICBpZiBPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aCA+IDEwXHJcbiAgICAgIGxvZy5kZWJ1ZyAnQ2xlYW5pbmcgdXAgcmVxdWVzdCBxdWV1ZSB0byBhdm9pZCBvdmVyZmxvdywgaWdub3JpbmcgcmVxdWVzdCdcclxuICAgICAgQHJlcXVlc3RzID0ge31cclxuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xyXG4gICAgICAgIGxvZy5kZWJ1ZyAnS2lsbGluZyBweXRob24gcHJvY2VzcydcclxuICAgICAgICBAcHJvdmlkZXIua2lsbCgpXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xyXG4gICAgICBwcm9jZXNzID0gQHByb3ZpZGVyLnByb2Nlc3NcclxuICAgICAgaWYgcHJvY2Vzcy5leGl0Q29kZSA9PSBudWxsIGFuZCBwcm9jZXNzLnNpZ25hbENvZGUgPT0gbnVsbFxyXG4gICAgICAgIGlmIEBwcm92aWRlci5wcm9jZXNzLnBpZFxyXG4gICAgICAgICAgcmV0dXJuIEBwcm92aWRlci5wcm9jZXNzLnN0ZGluLndyaXRlKGRhdGEgKyAnXFxuJylcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBsb2cuZGVidWcgJ0F0dGVtcHQgdG8gY29tbXVuaWNhdGUgd2l0aCB0ZXJtaW5hdGVkIHByb2Nlc3MnLCBAcHJvdmlkZXJcclxuICAgICAgZWxzZSBpZiByZXNwYXduZWRcclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcclxuICAgICAgICAgIFtcIkZhaWxlZCB0byBzcGF3biBkYWVtb24gZm9yIGF1dG9jb21wbGV0ZS1weXRob24uXCJcclxuICAgICAgICAgICBcIkNvbXBsZXRpb25zIHdpbGwgbm90IHdvcmsgYW55bW9yZVwiXHJcbiAgICAgICAgICAgXCJ1bmxlc3MgeW91IHJlc3RhcnQgeW91ciBlZGl0b3IuXCJdLmpvaW4oJyAnKSwge1xyXG4gICAgICAgICAgZGV0YWlsOiBbXCJleGl0Q29kZTogI3twcm9jZXNzLmV4aXRDb2RlfVwiXHJcbiAgICAgICAgICAgICAgICAgICBcInNpZ25hbENvZGU6ICN7cHJvY2Vzcy5zaWduYWxDb2RlfVwiXS5qb2luKCdcXG4nKSxcclxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcclxuICAgICAgICBAZGlzcG9zZSgpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAX3NwYXduRGFlbW9uKClcclxuICAgICAgICBAX3NlbmRSZXF1ZXN0KGRhdGEsIHJlc3Bhd25lZDogdHJ1ZSlcclxuICAgICAgICBsb2cuZGVidWcgJ1JlLXNwYXduaW5nIHB5dGhvbiBwcm9jZXNzLi4uJ1xyXG4gICAgZWxzZVxyXG4gICAgICBsb2cuZGVidWcgJ1NwYXduaW5nIHB5dGhvbiBwcm9jZXNzLi4uJ1xyXG4gICAgICBAX3NwYXduRGFlbW9uKClcclxuICAgICAgQF9zZW5kUmVxdWVzdChkYXRhKVxyXG5cclxuICBfZGVzZXJpYWxpemU6IChyZXNwb25zZSkgLT5cclxuICAgIGxvZy5kZWJ1ZyAnRGVzZXJlYWxpemluZyByZXNwb25zZSBmcm9tIEplZGknLCByZXNwb25zZVxyXG4gICAgbG9nLmRlYnVnIFwiR290ICN7cmVzcG9uc2UudHJpbSgpLnNwbGl0KCdcXG4nKS5sZW5ndGh9IGxpbmVzXCJcclxuICAgIGZvciByZXNwb25zZVNvdXJjZSBpbiByZXNwb25zZS50cmltKCkuc3BsaXQoJ1xcbicpXHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZVNvdXJjZSlcclxuICAgICAgY2F0Y2ggZVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlwiXCJGYWlsZWQgdG8gcGFyc2UgSlNPTiBmcm9tIFxcXCIje3Jlc3BvbnNlU291cmNlfVxcXCIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIE9yaWdpbmFsIGV4Y2VwdGlvbjogI3tlfVwiXCJcIilcclxuXHJcbiAgICAgIGlmIHJlc3BvbnNlWydhcmd1bWVudHMnXVxyXG4gICAgICAgIGVkaXRvciA9IEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cclxuICAgICAgICBpZiB0eXBlb2YgZWRpdG9yID09ICdvYmplY3QnXHJcbiAgICAgICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXHJcbiAgICAgICAgICAjIENvbXBhcmUgcmVzcG9uc2UgSUQgd2l0aCBjdXJyZW50IHN0YXRlIHRvIGF2b2lkIHN0YWxlIGNvbXBsZXRpb25zXHJcbiAgICAgICAgICBpZiByZXNwb25zZVsnaWQnXSA9PSBAX2dlbmVyYXRlUmVxdWVzdElkKCdhcmd1bWVudHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxyXG4gICAgICAgICAgICBAc25pcHBldHNNYW5hZ2VyPy5pbnNlcnRTbmlwcGV0KHJlc3BvbnNlWydhcmd1bWVudHMnXSwgZWRpdG9yKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmVzb2x2ZSA9IEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cclxuICAgICAgICBpZiB0eXBlb2YgcmVzb2x2ZSA9PSAnZnVuY3Rpb24nXHJcbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlWydyZXN1bHRzJ10pXHJcbiAgICAgIGNhY2hlU2l6ZURlbHRhID0gT2JqZWN0LmtleXMoQHJlc3BvbnNlcykubGVuZ3RoID4gQGNhY2hlU2l6ZVxyXG4gICAgICBpZiBjYWNoZVNpemVEZWx0YSA+IDBcclxuICAgICAgICBpZHMgPSBPYmplY3Qua2V5cyhAcmVzcG9uc2VzKS5zb3J0IChhLCBiKSA9PlxyXG4gICAgICAgICAgcmV0dXJuIEByZXNwb25zZXNbYV1bJ3RpbWVzdGFtcCddIC0gQHJlc3BvbnNlc1tiXVsndGltZXN0YW1wJ11cclxuICAgICAgICBmb3IgaWQgaW4gaWRzLnNsaWNlKDAsIGNhY2hlU2l6ZURlbHRhKVxyXG4gICAgICAgICAgbG9nLmRlYnVnICdSZW1vdmluZyBvbGQgaXRlbSBmcm9tIGNhY2hlIHdpdGggSUQnLCBpZFxyXG4gICAgICAgICAgZGVsZXRlIEByZXNwb25zZXNbaWRdXHJcbiAgICAgIEByZXNwb25zZXNbcmVzcG9uc2VbJ2lkJ11dID1cclxuICAgICAgICBzb3VyY2U6IHJlc3BvbnNlU291cmNlXHJcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXHJcbiAgICAgIGxvZy5kZWJ1ZyAnQ2FjaGVkIHJlcXVlc3Qgd2l0aCBJRCcsIHJlc3BvbnNlWydpZCddXHJcbiAgICAgIGRlbGV0ZSBAcmVxdWVzdHNbcmVzcG9uc2VbJ2lkJ11dXHJcblxyXG4gIF9nZW5lcmF0ZVJlcXVlc3RJZDogKHR5cGUsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIHRleHQpIC0+XHJcbiAgICBpZiBub3QgdGV4dFxyXG4gICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKVxyXG4gICAgcmV0dXJuIHJlcXVpcmUoJ2NyeXB0bycpLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShbXHJcbiAgICAgIGVkaXRvci5nZXRQYXRoKCksIHRleHQsIGJ1ZmZlclBvc2l0aW9uLnJvdyxcclxuICAgICAgYnVmZmVyUG9zaXRpb24uY29sdW1uLCB0eXBlXS5qb2luKCkpLmRpZ2VzdCgnaGV4JylcclxuXHJcbiAgX2dlbmVyYXRlUmVxdWVzdENvbmZpZzogLT5cclxuICAgIGV4dHJhUGF0aHMgPSBASW50ZXJwcmV0ZXJMb29rdXAuYXBwbHlTdWJzdGl0dXRpb25zKFxyXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZXh0cmFQYXRocycpLnNwbGl0KCc7JykpXHJcbiAgICBhcmdzID1cclxuICAgICAgJ2V4dHJhUGF0aHMnOiBleHRyYVBhdGhzXHJcbiAgICAgICd1c2VTbmlwcGV0cyc6IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VTbmlwcGV0cycpXHJcbiAgICAgICdjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uJzogYXRvbS5jb25maWcuZ2V0KFxyXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLmNhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb24nKVxyXG4gICAgICAnc2hvd0Rlc2NyaXB0aW9ucyc6IGF0b20uY29uZmlnLmdldChcclxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi5zaG93RGVzY3JpcHRpb25zJylcclxuICAgICAgJ2Z1enp5TWF0Y2hlcic6IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxyXG4gICAgcmV0dXJuIGFyZ3NcclxuXHJcbiAgc2V0U25pcHBldHNNYW5hZ2VyOiAoQHNuaXBwZXRzTWFuYWdlcikgLT5cclxuXHJcbiAgX2NvbXBsZXRlQXJndW1lbnRzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgZm9yY2UpIC0+XHJcbiAgICB1c2VTbmlwcGV0cyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VTbmlwcGV0cycpXHJcbiAgICBpZiBub3QgZm9yY2UgYW5kIHVzZVNuaXBwZXRzID09ICdub25lJ1xyXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3InKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnKVxyXG4gICAgICByZXR1cm5cclxuICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcclxuICAgIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXHJcbiAgICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBAU2VsZWN0b3IuY3JlYXRlKEBkaXNhYmxlRm9yU2VsZWN0b3IpXHJcbiAgICBpZiBAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKGRpc2FibGVGb3JTZWxlY3Rvciwgc2NvcGVDaGFpbilcclxuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIGluc2lkZSBvZicsIHNjb3BlQ2hhaW5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyB3ZSBkb24ndCB3YW50IHRvIGNvbXBsZXRlIGFyZ3VtZW50cyBpbnNpZGUgb2YgZXhpc3RpbmcgY29kZVxyXG4gICAgbGluZXMgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGluZXMoKVxyXG4gICAgbGluZSA9IGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd11cclxuICAgIHByZWZpeCA9IGxpbmUuc2xpY2UoYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gMSwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxyXG4gICAgaWYgcHJlZml4IGlzbnQgJygnXHJcbiAgICAgIGxvZy5kZWJ1ZyAnSWdub3JpbmcgYXJndW1lbnQgY29tcGxldGlvbiB3aXRoIHByZWZpeCcsIHByZWZpeFxyXG4gICAgICByZXR1cm5cclxuICAgIHN1ZmZpeCA9IGxpbmUuc2xpY2UgYnVmZmVyUG9zaXRpb24uY29sdW1uLCBsaW5lLmxlbmd0aFxyXG4gICAgaWYgbm90IC9eKFxcKSg/OiR8XFxzKXxcXHN8JCkvLnRlc3Qoc3VmZml4KVxyXG4gICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGFyZ3VtZW50IGNvbXBsZXRpb24gd2l0aCBzdWZmaXgnLCBzdWZmaXhcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcGF5bG9hZCA9XHJcbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCdhcmd1bWVudHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxyXG4gICAgICBsb29rdXA6ICdhcmd1bWVudHMnXHJcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcclxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXHJcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xyXG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxyXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcclxuXHJcbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlID0+XHJcbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IGVkaXRvclxyXG5cclxuICBfZnV6enlGaWx0ZXI6IChjYW5kaWRhdGVzLCBxdWVyeSkgLT5cclxuICAgIGlmIGNhbmRpZGF0ZXMubGVuZ3RoIGlzbnQgMCBhbmQgcXVlcnkgbm90IGluIFsnICcsICcuJywgJygnXVxyXG4gICAgICBjYW5kaWRhdGVzID0gQGZpbHRlcihjYW5kaWRhdGVzLCBxdWVyeSwga2V5OiAndGV4dCcpXHJcbiAgICByZXR1cm4gY2FuZGlkYXRlc1xyXG5cclxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XHJcbiAgICBAbG9hZCgpXHJcbiAgICBpZiBub3QgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXgudGVzdChwcmVmaXgpXHJcbiAgICAgIHJldHVybiBAbGFzdFN1Z2dlc3Rpb25zID0gW11cclxuICAgIGJ1ZmZlclBvc2l0aW9uID1cclxuICAgICAgcm93OiBidWZmZXJQb3NpdGlvbi5yb3dcclxuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cclxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcclxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxyXG4gICAgICAjIHdlIHdhbnQgdG8gZG8gb3VyIG93biBmaWx0ZXJpbmcsIGhpZGUgYW55IGV4aXN0aW5nIHN1ZmZpeCBmcm9tIEplZGlcclxuICAgICAgbGluZSA9IGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd11cclxuICAgICAgbGFzdElkZW50aWZpZXIgPSAvXFwuP1thLXpBLVpfXVthLXpBLVowLTlfXSokLy5leGVjKFxyXG4gICAgICAgIGxpbmUuc2xpY2UgMCwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxyXG4gICAgICBpZiBsYXN0SWRlbnRpZmllclxyXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiA9IGxhc3RJZGVudGlmaWVyLmluZGV4ICsgMVxyXG4gICAgICAgIGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd10gPSBsaW5lLnNsaWNlKDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbilcclxuICAgIHJlcXVlc3RJZCA9IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoXHJcbiAgICAgICdjb21wbGV0aW9ucycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIGxpbmVzLmpvaW4oJ1xcbicpKVxyXG4gICAgaWYgcmVxdWVzdElkIG9mIEByZXNwb25zZXNcclxuICAgICAgbG9nLmRlYnVnICdVc2luZyBjYWNoZWQgcmVzcG9uc2Ugd2l0aCBJRCcsIHJlcXVlc3RJZFxyXG4gICAgICAjIFdlIGhhdmUgdG8gcGFyc2UgSlNPTiBvbiBlYWNoIHJlcXVlc3QgaGVyZSB0byBwYXNzIG9ubHkgYSBjb3B5XHJcbiAgICAgIG1hdGNoZXMgPSBKU09OLnBhcnNlKEByZXNwb25zZXNbcmVxdWVzdElkXVsnc291cmNlJ10pWydyZXN1bHRzJ11cclxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmZ1enp5TWF0Y2hlcicpXHJcbiAgICAgICAgcmV0dXJuIEBsYXN0U3VnZ2VzdGlvbnMgPSBAX2Z1enp5RmlsdGVyKG1hdGNoZXMsIHByZWZpeClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVybiBAbGFzdFN1Z2dlc3Rpb25zID0gbWF0Y2hlc1xyXG4gICAgcGF5bG9hZCA9XHJcbiAgICAgIGlkOiByZXF1ZXN0SWRcclxuICAgICAgcHJlZml4OiBwcmVmaXhcclxuICAgICAgbG9va3VwOiAnY29tcGxldGlvbnMnXHJcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcclxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXHJcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xyXG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxyXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcclxuXHJcbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxyXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcclxuICAgICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAobWF0Y2hlcykgPT5cclxuICAgICAgICAgIHJlc29sdmUoQGxhc3RTdWdnZXN0aW9ucyA9IEBfZnV6enlGaWx0ZXIobWF0Y2hlcywgcHJlZml4KSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IChzdWdnZXN0aW9ucykgPT5cclxuICAgICAgICAgIHJlc29sdmUoQGxhc3RTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zKVxyXG5cclxuICBnZXREZWZpbml0aW9uczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XHJcbiAgICBwYXlsb2FkID1cclxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ2RlZmluaXRpb25zJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcclxuICAgICAgbG9va3VwOiAnZGVmaW5pdGlvbnMnXHJcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcclxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXHJcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xyXG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxyXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcclxuXHJcbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxyXG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSByZXNvbHZlXHJcblxyXG4gIGdldFVzYWdlczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XHJcbiAgICBwYXlsb2FkID1cclxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ3VzYWdlcycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXHJcbiAgICAgIGxvb2t1cDogJ3VzYWdlcydcclxuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxyXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcclxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XHJcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXHJcbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxyXG5cclxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XHJcbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcclxuXHJcbiAgZ2V0TWV0aG9kczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XHJcbiAgICBpbmRlbnQgPSBidWZmZXJQb3NpdGlvbi5jb2x1bW5cclxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcclxuICAgIGxpbmVzLnNwbGljZShidWZmZXJQb3NpdGlvbi5yb3cgKyAxLCAwLCBcIiAgZGVmIF9fYXV0b2NvbXBsZXRlX3B5dGhvbihzKTpcIilcclxuICAgIGxpbmVzLnNwbGljZShidWZmZXJQb3NpdGlvbi5yb3cgKyAyLCAwLCBcIiAgICBzLlwiKVxyXG4gICAgcGF5bG9hZCA9XHJcbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCdtZXRob2RzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcclxuICAgICAgbG9va3VwOiAnbWV0aG9kcydcclxuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxyXG4gICAgICBzb3VyY2U6IGxpbmVzLmpvaW4oJ1xcbicpXHJcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvdyArIDJcclxuICAgICAgY29sdW1uOiA2XHJcbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxyXG5cclxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XHJcbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IChtZXRob2RzKSAtPlxyXG4gICAgICAgIHJlc29sdmUoe21ldGhvZHMsIGluZGVudCwgYnVmZmVyUG9zaXRpb259KVxyXG5cclxuICBnb1RvRGVmaW5pdGlvbjogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XHJcbiAgICBpZiBub3QgZWRpdG9yXHJcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxyXG4gICAgaWYgbm90IGJ1ZmZlclBvc2l0aW9uXHJcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcclxuICAgIGlmIEBkZWZpbml0aW9uc1ZpZXdcclxuICAgICAgQGRlZmluaXRpb25zVmlldy5kZXN0cm95KClcclxuICAgIEBkZWZpbml0aW9uc1ZpZXcgPSBuZXcgQERlZmluaXRpb25zVmlldygpXHJcbiAgICBAZ2V0RGVmaW5pdGlvbnMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikudGhlbiAocmVzdWx0cykgPT5cclxuICAgICAgQGRlZmluaXRpb25zVmlldy5zZXRJdGVtcyhyZXN1bHRzKVxyXG4gICAgICBpZiByZXN1bHRzLmxlbmd0aCA9PSAxXHJcbiAgICAgICAgQGRlZmluaXRpb25zVmlldy5jb25maXJtZWQocmVzdWx0c1swXSlcclxuXHJcbiAgZGlzcG9zZTogLT5cclxuICAgIGlmIEBkaXNwb3NhYmxlc1xyXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXHJcbiAgICBpZiBAcHJvdmlkZXJcclxuICAgICAgQHByb3ZpZGVyLmtpbGwoKVxyXG4iXX0=
