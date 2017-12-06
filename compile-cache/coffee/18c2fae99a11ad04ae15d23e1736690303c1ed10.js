(function() {
  var CompositeDisposable, Point, PythonTools, Range, path, ref, regexPatternIn,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  regexPatternIn = function(pattern, list) {
    var item, j, len;
    for (j = 0, len = list.length; j < len; j++) {
      item = list[j];
      if (pattern.test(item)) {
        return true;
      }
    }
    return false;
  };

  PythonTools = {
    config: {
      smartBlockSelection: {
        type: 'boolean',
        description: 'Do not select whitespace outside logical string blocks',
        "default": true
      },
      pythonPath: {
        type: 'string',
        "default": '',
        title: 'Path to python directory',
        description: ',\nOptional. Set it if default values are not working for you or you want to use specific\npython version. For example: `/usr/local/Cellar/python/2.7.3/bin` or `E:\\Python2.7`'
      }
    },
    subscriptions: null,
    _issueReportLink: "https://github.com/michaelaquilina/python-tools/issues/new",
    activate: function(state) {
      var env, j, len, p, path_env, paths, pythonPath;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:show-usages': (function(_this) {
          return function() {
            return _this.jediToolsRequest('usages');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:goto-definition': (function(_this) {
          return function() {
            return _this.jediToolsRequest('gotoDef');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:select-all-string': (function(_this) {
          return function() {
            return _this.selectAllString();
          };
        })(this)
      }));
      env = process.env;
      pythonPath = atom.config.get('python-tools.pythonPath');
      path_env = null;
      if (/^win/.test(process.platform)) {
        paths = ['C:\\Python2.7', 'C:\\Python3.4', 'C:\\Python34', 'C:\\Python3.5', 'C:\\Python35', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5'];
        path_env = env.Path || '';
      } else {
        paths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
        path_env = env.PATH || '';
      }
      path_env = path_env.split(path.delimiter);
      path_env.unshift(pythonPath && indexOf.call(path_env, pythonPath) < 0 ? pythonPath : void 0);
      for (j = 0, len = paths.length; j < len; j++) {
        p = paths[j];
        if (indexOf.call(path_env, p) < 0) {
          path_env.push(p);
        }
      }
      env.PATH = path_env.join(path.delimiter);
      this.provider = require('child_process').spawn('python', [__dirname + '/tools.py'], {
        env: env
      });
      this.readline = require('readline').createInterface({
        input: this.provider.stdout,
        output: this.provider.stdin
      });
      this.provider.on('error', (function(_this) {
        return function(err) {
          if (err.code === 'ENOENT') {
            return atom.notifications.addWarning("python-tools was unable to find your machine's python executable.\n\nPlease try set the path in package settings and then restart atom.\n\nIf the issue persists please post an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          } else {
            return atom.notifications.addError("python-tools unexpected error.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          }
        };
      })(this));
      return this.provider.on('exit', (function(_this) {
        return function(code, signal) {
          if (signal !== 'SIGTERM') {
            return atom.notifications.addError("python-tools experienced an unexpected exit.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: "exit with code " + code + ", signal " + signal,
              dismissable: true
            });
          }
        };
      })(this));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.provider.kill();
      return this.readline.close();
    },
    selectAllString: function() {
      var block, bufferPosition, delim_index, delimiter, editor, end, end_index, i, j, line, ref1, ref2, scopeDescriptor, scopes, selections, start, start_index, trimmed;
      editor = atom.workspace.getActiveTextEditor();
      bufferPosition = editor.getCursorBufferPosition();
      line = editor.lineTextForBufferRow(bufferPosition.row);
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopes = scopeDescriptor.getScopesArray();
      block = false;
      if (regexPatternIn(/string.quoted.single.single-line.*/, scopes)) {
        delimiter = '\'';
      } else if (regexPatternIn(/string.quoted.double.single-line.*/, scopes)) {
        delimiter = '"';
      } else if (regexPatternIn(/string.quoted.double.block.*/, scopes)) {
        delimiter = '"""';
        block = true;
      } else if (regexPatternIn(/string.quoted.single.block.*/, scopes)) {
        delimiter = '\'\'\'';
        block = true;
      } else {
        return;
      }
      if (!block) {
        start = end = bufferPosition.column;
        while (line[start] !== delimiter) {
          start = start - 1;
          if (start < 0) {
            return;
          }
        }
        while (line[end] !== delimiter) {
          end = end + 1;
          if (end === line.length) {
            return;
          }
        }
        return editor.setSelectedBufferRange(new Range(new Point(bufferPosition.row, start + 1), new Point(bufferPosition.row, end)));
      } else {
        start = end = bufferPosition.row;
        start_index = end_index = -1;
        delim_index = line.indexOf(delimiter);
        if (delim_index !== -1) {
          scopes = editor.scopeDescriptorForBufferPosition(new Point(start, delim_index));
          scopes = scopes.getScopesArray();
          if (regexPatternIn(/punctuation.definition.string.begin.*/, scopes)) {
            start_index = line.indexOf(delimiter);
            while (end_index === -1) {
              end = end + 1;
              line = editor.lineTextForBufferRow(end);
              end_index = line.indexOf(delimiter);
            }
          } else if (regexPatternIn(/punctuation.definition.string.end.*/, scopes)) {
            end_index = line.indexOf(delimiter);
            while (start_index === -1) {
              start = start - 1;
              line = editor.lineTextForBufferRow(start);
              start_index = line.indexOf(delimiter);
            }
          }
        } else {
          while (end_index === -1) {
            end = end + 1;
            line = editor.lineTextForBufferRow(end);
            end_index = line.indexOf(delimiter);
          }
          while (start_index === -1) {
            start = start - 1;
            line = editor.lineTextForBufferRow(start);
            start_index = line.indexOf(delimiter);
          }
        }
        if (atom.config.get('python-tools.smartBlockSelection')) {
          selections = [new Range(new Point(start, start_index + delimiter.length), new Point(start, editor.lineTextForBufferRow(start).length))];
          for (i = j = ref1 = start + 1, ref2 = end; j < ref2; i = j += 1) {
            line = editor.lineTextForBufferRow(i);
            trimmed = line.replace(/^\s+/, "");
            selections.push(new Range(new Point(i, line.length - trimmed.length), new Point(i, line.length)));
          }
          line = editor.lineTextForBufferRow(end);
          trimmed = line.replace(/^\s+/, "");
          selections.push(new Range(new Point(end, line.length - trimmed.length), new Point(end, end_index)));
          return editor.setSelectedBufferRanges(selections.filter(function(range) {
            return !range.isEmpty();
          }));
        } else {
          return editor.setSelectedBufferRange(new Range(new Point(start, start_index + delimiter.length), new Point(end, end_index)));
        }
      }
    },
    handleJediToolsResponse: function(response) {
      var column, editor, first_def, item, j, len, line, options, ref1, selections;
      if ('error' in response) {
        console.error(response['error']);
        atom.notifications.addError(response['error']);
        return;
      }
      if (response['definitions'].length > 0) {
        editor = atom.workspace.getActiveTextEditor();
        if (response['type'] === 'usages') {
          path = editor.getPath();
          selections = [];
          ref1 = response['definitions'];
          for (j = 0, len = ref1.length; j < len; j++) {
            item = ref1[j];
            if (item['path'] === path) {
              selections.push(new Range(new Point(item['line'] - 1, item['col']), new Point(item['line'] - 1, item['col'] + item['name'].length)));
            }
          }
          return editor.setSelectedBufferRanges(selections);
        } else if (response['type'] === 'gotoDef') {
          first_def = response['definitions'][0];
          line = first_def['line'];
          column = first_def['col'];
          if (line !== null && column !== null) {
            options = {
              initialLine: line,
              initialColumn: column,
              searchAllPanes: true
            };
            return atom.workspace.open(first_def['path'], options).then(function(editor) {
              return editor.scrollToCursorPosition();
            });
          }
        } else {
          return atom.notifications.addError("python-tools error. " + this._issueReportLink, {
            detail: JSON.stringify(response),
            dismissable: true
          });
        }
      } else {
        return atom.notifications.addInfo("python-tools could not find any results!");
      }
    },
    jediToolsRequest: function(type) {
      var bufferPosition, editor, grammar, handleJediToolsResponse, payload, readline;
      editor = atom.workspace.getActiveTextEditor();
      grammar = editor.getGrammar();
      bufferPosition = editor.getCursorBufferPosition();
      payload = {
        type: type,
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        col: bufferPosition.column,
        project_paths: atom.project.getPaths()
      };
      handleJediToolsResponse = this.handleJediToolsResponse;
      readline = this.readline;
      return new Promise(function(resolve, reject) {
        var response;
        return response = readline.question((JSON.stringify(payload)) + "\n", function(response) {
          handleJediToolsResponse(JSON.parse(response));
          return resolve();
        });
      });
    }
  };

  module.exports = PythonTools;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9weXRob24tdG9vbHMvbGliL3B5dGhvbi10b29scy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlFQUFBO0lBQUE7O0VBQUEsTUFBc0MsT0FBQSxDQUFRLE1BQVIsQ0FBdEMsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBQ2YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUdQLGNBQUEsR0FBaUIsU0FBQyxPQUFELEVBQVUsSUFBVjtBQUNmLFFBQUE7QUFBQSxTQUFBLHNDQUFBOztNQUNFLElBQUcsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQUg7QUFDRSxlQUFPLEtBRFQ7O0FBREY7QUFHQSxXQUFPO0VBSlE7O0VBT2pCLFdBQUEsR0FBYztJQUNaLE1BQUEsRUFBUTtNQUNOLG1CQUFBLEVBQXFCO1FBQ25CLElBQUEsRUFBTSxTQURhO1FBRW5CLFdBQUEsRUFBYSx3REFGTTtRQUduQixDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFU7T0FEZjtNQU1OLFVBQUEsRUFBWTtRQUNWLElBQUEsRUFBTSxRQURJO1FBRVYsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZDO1FBR1YsS0FBQSxFQUFPLDBCQUhHO1FBSVYsV0FBQSxFQUFhLGlMQUpIO09BTk47S0FESTtJQWtCWixhQUFBLEVBQWUsSUFsQkg7SUFvQlosZ0JBQUEsRUFBa0IsNERBcEJOO0lBc0JaLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFFUixVQUFBO01BQUEsSUFBSSxDQUFDLGFBQUwsR0FBcUIsSUFBSTtNQUN6QixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQ0UsZ0RBREYsRUFFRTtRQUFDLDBCQUFBLEVBQTRCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQU0sS0FBSSxD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QU0sY0FBYyxDQUFDLEdBSmI7UUFLUixHQUFBLEVBQUssY0FBYyxDQUFDLE1BTFo7UUFNUixhQUFBLEVBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FOUDs7TUFVVix1QkFBQSxHQUEwQixJQUFJLENBQUM7TUFDL0IsUUFBQSxHQUFXLElBQUksQ0FBQztBQUVoQixhQUFXLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDakIsWUFBQTtlQUFBLFFBQUEsR0FBVyxRQUFRLENBQUMsUUFBVCxDQUFvQixDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsT0FBZixDQUFELENBQUEsR0FBeUIsSUFBN0MsRUFBa0QsU0FBQyxRQUFEO1VBQzNELHVCQUFBLENBQXdCLElBQUksQ0FBQyxLQUFMLENBQVcsUUFBWCxDQUF4QjtpQkFDQSxPQUFBLENBQUE7UUFGMkQsQ0FBbEQ7TUFETSxDQUFSO0lBbkJLLENBOVJOOzs7RUF5VGQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFwVWpCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XHJcbnBhdGggPSByZXF1aXJlKCdwYXRoJyk7XHJcblxyXG5cclxucmVnZXhQYXR0ZXJuSW4gPSAocGF0dGVybiwgbGlzdCkgLT5cclxuICBmb3IgaXRlbSBpbiBsaXN0XHJcbiAgICBpZiBwYXR0ZXJuLnRlc3QoaXRlbSlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICByZXR1cm4gZmFsc2VcclxuXHJcblxyXG5QeXRob25Ub29scyA9IHtcclxuICBjb25maWc6IHtcclxuICAgIHNtYXJ0QmxvY2tTZWxlY3Rpb246IHtcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0RvIG5vdCBzZWxlY3Qgd2hpdGVzcGFjZSBvdXRzaWRlIGxvZ2ljYWwgc3RyaW5nIGJsb2NrcycsXHJcbiAgICAgIGRlZmF1bHQ6IHRydWVcclxuICAgIH0sXHJcbiAgICBweXRob25QYXRoOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgdGl0bGU6ICdQYXRoIHRvIHB5dGhvbiBkaXJlY3RvcnknLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJycnLFxyXG4gICAgICBPcHRpb25hbC4gU2V0IGl0IGlmIGRlZmF1bHQgdmFsdWVzIGFyZSBub3Qgd29ya2luZyBmb3IgeW91IG9yIHlvdSB3YW50IHRvIHVzZSBzcGVjaWZpY1xyXG4gICAgICBweXRob24gdmVyc2lvbi4gRm9yIGV4YW1wbGU6IGAvdXNyL2xvY2FsL0NlbGxhci9weXRob24vMi43LjMvYmluYCBvciBgRTpcXFxcUHl0aG9uMi43YFxyXG4gICAgICAnJydcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcclxuXHJcbiAgX2lzc3VlUmVwb3J0TGluazogXCJodHRwczovL2dpdGh1Yi5jb20vbWljaGFlbGFxdWlsaW5hL3B5dGhvbi10b29scy9pc3N1ZXMvbmV3XCJcclxuXHJcbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cclxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxyXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcclxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCJzb3VyY2UgcHl0aG9uXCJdJyxcclxuICAgICAgICB7J3B5dGhvbi10b29sczpzaG93LXVzYWdlcyc6ICgpID0+IHRoaXMuamVkaVRvb2xzUmVxdWVzdCgndXNhZ2VzJyl9XHJcbiAgICAgIClcclxuICAgIClcclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXHJcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxyXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj1cInNvdXJjZSBweXRob25cIl0nLFxyXG4gICAgICAgIHsncHl0aG9uLXRvb2xzOmdvdG8tZGVmaW5pdGlvbic6ICgpID0+IHRoaXMuamVkaVRvb2xzUmVxdWVzdCgnZ290b0RlZicpfVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxyXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcclxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCJzb3VyY2UgcHl0aG9uXCJdJyxcclxuICAgICAgICB7J3B5dGhvbi10b29sczpzZWxlY3QtYWxsLXN0cmluZyc6ICgpID0+IHRoaXMuc2VsZWN0QWxsU3RyaW5nKCl9XHJcbiAgICAgIClcclxuICAgIClcclxuXHJcbiAgICBlbnYgPSBwcm9jZXNzLmVudlxyXG4gICAgcHl0aG9uUGF0aCA9IGF0b20uY29uZmlnLmdldCgncHl0aG9uLXRvb2xzLnB5dGhvblBhdGgnKVxyXG4gICAgcGF0aF9lbnYgPSBudWxsXHJcblxyXG4gICAgaWYgL153aW4vLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSlcclxuICAgICAgcGF0aHMgPSBbXHJcbiAgICAgICAgJ0M6XFxcXFB5dGhvbjIuNycsXHJcbiAgICAgICAgJ0M6XFxcXFB5dGhvbjMuNCcsXHJcbiAgICAgICAgJ0M6XFxcXFB5dGhvbjM0JyxcclxuICAgICAgICAnQzpcXFxcUHl0aG9uMy41JyxcclxuICAgICAgICAnQzpcXFxcUHl0aG9uMzUnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAyLjcnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAzLjQnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAzLjUnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAyLjcnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAzLjQnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAzLjUnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAyLjcnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAzLjQnLFxyXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAzLjUnXHJcbiAgICAgIF1cclxuICAgICAgcGF0aF9lbnYgPSAoZW52LlBhdGggb3IgJycpXHJcbiAgICBlbHNlXHJcbiAgICAgIHBhdGhzID0gWycvdXNyL2xvY2FsL2JpbicsICcvdXNyL2JpbicsICcvYmluJywgJy91c3Ivc2JpbicsICcvc2JpbiddXHJcbiAgICAgIHBhdGhfZW52ID0gKGVudi5QQVRIIG9yICcnKVxyXG5cclxuICAgIHBhdGhfZW52ID0gcGF0aF9lbnYuc3BsaXQocGF0aC5kZWxpbWl0ZXIpXHJcbiAgICBwYXRoX2Vudi51bnNoaWZ0KHB5dGhvblBhdGggaWYgcHl0aG9uUGF0aCBhbmQgcHl0aG9uUGF0aCBub3QgaW4gcGF0aF9lbnYpXHJcbiAgICBmb3IgcCBpbiBwYXRoc1xyXG4gICAgICBpZiBwIG5vdCBpbiBwYXRoX2VudlxyXG4gICAgICAgIHBhdGhfZW52LnB1c2gocClcclxuICAgIGVudi5QQVRIID0gcGF0aF9lbnYuam9pbihwYXRoLmRlbGltaXRlcilcclxuXHJcbiAgICB0aGlzLnByb3ZpZGVyID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduKFxyXG4gICAgICAncHl0aG9uJywgW19fZGlybmFtZSArICcvdG9vbHMucHknXSwgZW52OiBlbnZcclxuICAgIClcclxuXHJcbiAgICB0aGlzLnJlYWRsaW5lID0gcmVxdWlyZSgncmVhZGxpbmUnKS5jcmVhdGVJbnRlcmZhY2Uoe1xyXG4gICAgICBpbnB1dDogdGhpcy5wcm92aWRlci5zdGRvdXQsXHJcbiAgICAgIG91dHB1dDogdGhpcy5wcm92aWRlci5zdGRpblxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLnByb3ZpZGVyLm9uKCdlcnJvcicsIChlcnIpID0+XHJcbiAgICAgIGlmIGVyci5jb2RlID09ICdFTk9FTlQnXHJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJcIlwiXHJcbiAgICAgICAgICBweXRob24tdG9vbHMgd2FzIHVuYWJsZSB0byBmaW5kIHlvdXIgbWFjaGluZSdzIHB5dGhvbiBleGVjdXRhYmxlLlxyXG5cclxuICAgICAgICAgIFBsZWFzZSB0cnkgc2V0IHRoZSBwYXRoIGluIHBhY2thZ2Ugc2V0dGluZ3MgYW5kIHRoZW4gcmVzdGFydCBhdG9tLlxyXG5cclxuICAgICAgICAgIElmIHRoZSBpc3N1ZSBwZXJzaXN0cyBwbGVhc2UgcG9zdCBhbiBpc3N1ZSBvblxyXG4gICAgICAgICAgI3t0aGlzLl9pc3N1ZVJlcG9ydExpbmt9XHJcbiAgICAgICAgICBcIlwiXCIsIHtcclxuICAgICAgICAgICAgZGV0YWlsOiBlcnIsXHJcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiXCJcIlxyXG4gICAgICAgICAgcHl0aG9uLXRvb2xzIHVuZXhwZWN0ZWQgZXJyb3IuXHJcblxyXG4gICAgICAgICAgUGxlYXNlIGNvbnNpZGVyIHBvc3RpbmcgYW4gaXNzdWUgb25cclxuICAgICAgICAgICN7dGhpcy5faXNzdWVSZXBvcnRMaW5rfVxyXG4gICAgICAgICAgXCJcIlwiLCB7XHJcbiAgICAgICAgICAgICAgZGV0YWlsOiBlcnIsXHJcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgIClcclxuICAgIHRoaXMucHJvdmlkZXIub24oJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PlxyXG4gICAgICBpZiBzaWduYWwgIT0gJ1NJR1RFUk0nXHJcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxyXG4gICAgICAgICAgXCJcIlwiXHJcbiAgICAgICAgICBweXRob24tdG9vbHMgZXhwZXJpZW5jZWQgYW4gdW5leHBlY3RlZCBleGl0LlxyXG5cclxuICAgICAgICAgIFBsZWFzZSBjb25zaWRlciBwb3N0aW5nIGFuIGlzc3VlIG9uXHJcbiAgICAgICAgICAje3RoaXMuX2lzc3VlUmVwb3J0TGlua31cclxuICAgICAgICAgIFwiXCJcIiwge1xyXG4gICAgICAgICAgICBkZXRhaWw6IFwiZXhpdCB3aXRoIGNvZGUgI3tjb2RlfSwgc2lnbmFsICN7c2lnbmFsfVwiLFxyXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgIClcclxuXHJcbiAgZGVhY3RpdmF0ZTogKCkgLT5cclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcclxuICAgIHRoaXMucHJvdmlkZXIua2lsbCgpXHJcbiAgICB0aGlzLnJlYWRsaW5lLmNsb3NlKClcclxuXHJcbiAgc2VsZWN0QWxsU3RyaW5nOiAoKSAtPlxyXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcbiAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXHJcbiAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGJ1ZmZlclBvc2l0aW9uLnJvdylcclxuXHJcbiAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXHJcbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxyXG5cclxuICAgIGJsb2NrID0gZmFsc2VcclxuICAgIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLnNpbmdsZS5zaW5nbGUtbGluZS4qLywgc2NvcGVzKVxyXG4gICAgICBkZWxpbWl0ZXIgPSAnXFwnJ1xyXG4gICAgZWxzZSBpZiByZWdleFBhdHRlcm5Jbigvc3RyaW5nLnF1b3RlZC5kb3VibGUuc2luZ2xlLWxpbmUuKi8sIHNjb3BlcylcclxuICAgICAgZGVsaW1pdGVyID0gJ1wiJ1xyXG4gICAgZWxzZSBpZiByZWdleFBhdHRlcm5Jbigvc3RyaW5nLnF1b3RlZC5kb3VibGUuYmxvY2suKi8sIHNjb3BlcylcclxuICAgICAgZGVsaW1pdGVyID0gJ1wiXCJcIidcclxuICAgICAgYmxvY2sgPSB0cnVlXHJcbiAgICBlbHNlIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLnNpbmdsZS5ibG9jay4qLywgc2NvcGVzKVxyXG4gICAgICBkZWxpbWl0ZXIgPSAnXFwnXFwnXFwnJ1xyXG4gICAgICBibG9jayA9IHRydWVcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgaWYgbm90IGJsb2NrXHJcbiAgICAgIHN0YXJ0ID0gZW5kID0gYnVmZmVyUG9zaXRpb24uY29sdW1uXHJcblxyXG4gICAgICB3aGlsZSBsaW5lW3N0YXJ0XSAhPSBkZWxpbWl0ZXJcclxuICAgICAgICBzdGFydCA9IHN0YXJ0IC0gMVxyXG4gICAgICAgIGlmIHN0YXJ0IDwgMFxyXG4gICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICB3aGlsZSBsaW5lW2VuZF0gIT0gZGVsaW1pdGVyXHJcbiAgICAgICAgZW5kID0gZW5kICsgMVxyXG4gICAgICAgIGlmIGVuZCA9PSBsaW5lLmxlbmd0aFxyXG4gICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShuZXcgUmFuZ2UoXHJcbiAgICAgICAgbmV3IFBvaW50KGJ1ZmZlclBvc2l0aW9uLnJvdywgc3RhcnQgKyAxKSxcclxuICAgICAgICBuZXcgUG9pbnQoYnVmZmVyUG9zaXRpb24ucm93LCBlbmQpLFxyXG4gICAgICApKVxyXG4gICAgZWxzZVxyXG4gICAgICBzdGFydCA9IGVuZCA9IGJ1ZmZlclBvc2l0aW9uLnJvd1xyXG4gICAgICBzdGFydF9pbmRleCA9IGVuZF9pbmRleCA9IC0xXHJcblxyXG4gICAgICAjIERldGVjdCBpZiB3ZSBhcmUgYXQgdGhlIGJvdW5kYXJpZXMgb2YgdGhlIGJsb2NrIHN0cmluZ1xyXG4gICAgICBkZWxpbV9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXHJcblxyXG4gICAgICBpZiBkZWxpbV9pbmRleCAhPSAtMVxyXG4gICAgICAgIHNjb3BlcyA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoc3RhcnQsIGRlbGltX2luZGV4KSlcclxuICAgICAgICBzY29wZXMgPSBzY29wZXMuZ2V0U2NvcGVzQXJyYXkoKVxyXG5cclxuICAgICAgICAjIFdlIGFyZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBibG9ja1xyXG4gICAgICAgIGlmIHJlZ2V4UGF0dGVybkluKC9wdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi4qLywgc2NvcGVzKVxyXG4gICAgICAgICAgc3RhcnRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxyXG4gICAgICAgICAgd2hpbGUgZW5kX2luZGV4ID09IC0xXHJcbiAgICAgICAgICAgIGVuZCA9IGVuZCArIDFcclxuICAgICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQpXHJcbiAgICAgICAgICAgIGVuZF9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXHJcblxyXG4gICAgICAgICMgV2UgYXJlIHRoZSBlbmQgb2YgdGhlIGJsb2NrXHJcbiAgICAgICAgZWxzZSBpZiByZWdleFBhdHRlcm5JbigvcHVuY3R1YXRpb24uZGVmaW5pdGlvbi5zdHJpbmcuZW5kLiovLCBzY29wZXMpXHJcbiAgICAgICAgICBlbmRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxyXG4gICAgICAgICAgd2hpbGUgc3RhcnRfaW5kZXggPT0gLTFcclxuICAgICAgICAgICAgc3RhcnQgPSBzdGFydCAtIDFcclxuICAgICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhzdGFydClcclxuICAgICAgICAgICAgc3RhcnRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxyXG5cclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgV2UgYXJlIG5laXRoZXIgYXQgdGhlIGJlZ2lubmluZyBvciB0aGUgZW5kIG9mIHRoZSBibG9ja1xyXG4gICAgICAgIHdoaWxlIGVuZF9pbmRleCA9PSAtMVxyXG4gICAgICAgICAgZW5kID0gZW5kICsgMVxyXG4gICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQpXHJcbiAgICAgICAgICBlbmRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxyXG4gICAgICAgIHdoaWxlIHN0YXJ0X2luZGV4ID09IC0xXHJcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0IC0gMVxyXG4gICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhzdGFydClcclxuICAgICAgICAgIHN0YXJ0X2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcclxuXHJcbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgncHl0aG9uLXRvb2xzLnNtYXJ0QmxvY2tTZWxlY3Rpb24nKVxyXG4gICAgICAgICMgU21hcnQgYmxvY2sgc2VsZWN0aW9uc1xyXG4gICAgICAgIHNlbGVjdGlvbnMgPSBbbmV3IFJhbmdlKFxyXG4gICAgICAgICAgbmV3IFBvaW50KHN0YXJ0LCBzdGFydF9pbmRleCArIGRlbGltaXRlci5sZW5ndGgpLFxyXG4gICAgICAgICAgbmV3IFBvaW50KHN0YXJ0LCBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc3RhcnQpLmxlbmd0aCksXHJcbiAgICAgICAgKV1cclxuXHJcbiAgICAgICAgZm9yIGkgaW4gW3N0YXJ0ICsgMSAuLi4gZW5kXSBieSAxXHJcbiAgICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGkpXHJcbiAgICAgICAgICB0cmltbWVkID0gbGluZS5yZXBsYWNlKC9eXFxzKy8sIFwiXCIpICAjIGxlZnQgdHJpbVxyXG4gICAgICAgICAgc2VsZWN0aW9ucy5wdXNoKG5ldyBSYW5nZShcclxuICAgICAgICAgICAgbmV3IFBvaW50KGksIGxpbmUubGVuZ3RoIC0gdHJpbW1lZC5sZW5ndGgpLFxyXG4gICAgICAgICAgICBuZXcgUG9pbnQoaSwgbGluZS5sZW5ndGgpLFxyXG4gICAgICAgICAgKSlcclxuXHJcbiAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQpXHJcbiAgICAgICAgdHJpbW1lZCA9IGxpbmUucmVwbGFjZSgvXlxccysvLCBcIlwiKSAgIyBsZWZ0IHRyaW1cclxuXHJcbiAgICAgICAgc2VsZWN0aW9ucy5wdXNoKG5ldyBSYW5nZShcclxuICAgICAgICAgIG5ldyBQb2ludChlbmQsIGxpbmUubGVuZ3RoIC0gdHJpbW1lZC5sZW5ndGgpLFxyXG4gICAgICAgICAgbmV3IFBvaW50KGVuZCwgZW5kX2luZGV4KSxcclxuICAgICAgICApKVxyXG5cclxuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoc2VsZWN0aW9ucy5maWx0ZXIgKHJhbmdlKSAtPiBub3QgcmFuZ2UuaXNFbXB0eSgpKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UobmV3IFJhbmdlKFxyXG4gICAgICAgICAgbmV3IFBvaW50KHN0YXJ0LCBzdGFydF9pbmRleCArIGRlbGltaXRlci5sZW5ndGgpLFxyXG4gICAgICAgICAgbmV3IFBvaW50KGVuZCwgZW5kX2luZGV4KSxcclxuICAgICAgICApKVxyXG5cclxuICBoYW5kbGVKZWRpVG9vbHNSZXNwb25zZTogKHJlc3BvbnNlKSAtPlxyXG4gICAgaWYgJ2Vycm9yJyBvZiByZXNwb25zZVxyXG4gICAgICBjb25zb2xlLmVycm9yKHJlc3BvbnNlWydlcnJvciddKVxyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IocmVzcG9uc2VbJ2Vycm9yJ10pXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGlmIHJlc3BvbnNlWydkZWZpbml0aW9ucyddLmxlbmd0aCA+IDBcclxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcblxyXG4gICAgICBpZiByZXNwb25zZVsndHlwZSddID09ICd1c2FnZXMnXHJcbiAgICAgICAgcGF0aCA9IGVkaXRvci5nZXRQYXRoKClcclxuICAgICAgICBzZWxlY3Rpb25zID0gW11cclxuICAgICAgICBmb3IgaXRlbSBpbiByZXNwb25zZVsnZGVmaW5pdGlvbnMnXVxyXG4gICAgICAgICAgaWYgaXRlbVsncGF0aCddID09IHBhdGhcclxuICAgICAgICAgICAgc2VsZWN0aW9ucy5wdXNoKG5ldyBSYW5nZShcclxuICAgICAgICAgICAgICBuZXcgUG9pbnQoaXRlbVsnbGluZSddIC0gMSwgaXRlbVsnY29sJ10pLFxyXG4gICAgICAgICAgICAgIG5ldyBQb2ludChpdGVtWydsaW5lJ10gLSAxLCBpdGVtWydjb2wnXSArIGl0ZW1bJ25hbWUnXS5sZW5ndGgpLCAgIyBVc2Ugc3RyaW5nIGxlbmd0aFxyXG4gICAgICAgICAgICApKVxyXG5cclxuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoc2VsZWN0aW9ucylcclxuXHJcbiAgICAgIGVsc2UgaWYgcmVzcG9uc2VbJ3R5cGUnXSA9PSAnZ290b0RlZidcclxuICAgICAgICBmaXJzdF9kZWYgPSByZXNwb25zZVsnZGVmaW5pdGlvbnMnXVswXVxyXG5cclxuICAgICAgICBsaW5lID0gZmlyc3RfZGVmWydsaW5lJ11cclxuICAgICAgICBjb2x1bW4gPSBmaXJzdF9kZWZbJ2NvbCddXHJcblxyXG4gICAgICAgIGlmIGxpbmUgIT0gbnVsbCBhbmQgY29sdW1uICE9IG51bGxcclxuICAgICAgICAgIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGluaXRpYWxMaW5lOiBsaW5lLFxyXG4gICAgICAgICAgICBpbml0aWFsQ29sdW1uOiBjb2x1bW4sXHJcbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaXJzdF9kZWZbJ3BhdGgnXSwgb3B0aW9ucykudGhlbigoZWRpdG9yKSAtPlxyXG4gICAgICAgICAgICBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXHJcbiAgICAgICAgICApXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXHJcbiAgICAgICAgICBcInB5dGhvbi10b29scyBlcnJvci4gI3t0aGlzLl9pc3N1ZVJlcG9ydExpbmt9XCIsIHtcclxuICAgICAgICAgICAgZGV0YWlsOiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSksXHJcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgZWxzZVxyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcInB5dGhvbi10b29scyBjb3VsZCBub3QgZmluZCBhbnkgcmVzdWx0cyFcIilcclxuXHJcbiAgamVkaVRvb2xzUmVxdWVzdDogKHR5cGUpIC0+XHJcbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcclxuICAgIGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpXHJcblxyXG4gICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxyXG5cclxuICAgIHBheWxvYWQgPSB7XHJcbiAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKCksXHJcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKSxcclxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93LFxyXG4gICAgICBjb2w6IGJ1ZmZlclBvc2l0aW9uLmNvbHVtbixcclxuICAgICAgcHJvamVjdF9wYXRoczogYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcclxuICAgIH1cclxuXHJcbiAgICAjIFRoaXMgaXMgbmVlZGVkIGZvciB0aGUgcHJvbWlzZSB0byB3b3JrIGNvcnJlY3RseVxyXG4gICAgaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2UgPSB0aGlzLmhhbmRsZUplZGlUb29sc1Jlc3BvbnNlXHJcbiAgICByZWFkbGluZSA9IHRoaXMucmVhZGxpbmVcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgICAgcmVzcG9uc2UgPSByZWFkbGluZS5xdWVzdGlvbihcIiN7SlNPTi5zdHJpbmdpZnkocGF5bG9hZCl9XFxuXCIsIChyZXNwb25zZSkgLT5cclxuICAgICAgICBoYW5kbGVKZWRpVG9vbHNSZXNwb25zZShKU09OLnBhcnNlKHJlc3BvbnNlKSlcclxuICAgICAgICByZXNvbHZlKClcclxuICAgICAgKVxyXG4gICAgKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFB5dGhvblRvb2xzXHJcbiJdfQ==
