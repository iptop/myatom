(function() {
  "use strict";
  var $, Beautifiers, CompositeDisposable, LoadingView, Promise, _, async, beautifier, beautify, beautifyDirectory, beautifyFile, beautifyFilePath, debug, defaultLanguageOptions, dir, fs, getCursors, getScrollTop, getUnsupportedOptions, handleSaveEvent, loadingView, logger, path, pkg, plugin, setCursors, setScrollTop, showError, strip, yaml;

  pkg = require('../package');

  plugin = module.exports;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  _ = require("lodash");

  Beautifiers = require("./beautifiers");

  beautifier = new Beautifiers();

  defaultLanguageOptions = beautifier.options;

  logger = require('./logger')(__filename);

  Promise = require('bluebird');

  fs = null;

  path = require("path");

  strip = null;

  yaml = null;

  async = null;

  dir = null;

  LoadingView = null;

  loadingView = null;

  $ = null;

  getScrollTop = function(editor) {
    var view;
    view = atom.views.getView(editor);
    return view != null ? view.getScrollTop() : void 0;
  };

  setScrollTop = function(editor, value) {
    var ref, view;
    view = atom.views.getView(editor);
    return view != null ? (ref = view.component) != null ? ref.setScrollTop(value) : void 0 : void 0;
  };

  getCursors = function(editor) {
    var bufferPosition, cursor, cursors, j, len, posArray;
    cursors = editor.getCursors();
    posArray = [];
    for (j = 0, len = cursors.length; j < len; j++) {
      cursor = cursors[j];
      bufferPosition = cursor.getBufferPosition();
      posArray.push([bufferPosition.row, bufferPosition.column]);
    }
    return posArray;
  };

  setCursors = function(editor, posArray) {
    var bufferPosition, i, j, len;
    for (i = j = 0, len = posArray.length; j < len; i = ++j) {
      bufferPosition = posArray[i];
      if (i === 0) {
        editor.setCursorBufferPosition(bufferPosition);
        continue;
      }
      editor.addCursorAtBufferPosition(bufferPosition);
    }
  };

  beautifier.on('beautify::start', function() {
    if (atom.config.get("atom-beautify.general.showLoadingView")) {
      if (LoadingView == null) {
        LoadingView = require("./views/loading-view");
      }
      if (loadingView == null) {
        loadingView = new LoadingView();
      }
      return loadingView.show();
    }
  });

  beautifier.on('beautify::end', function() {
    return loadingView != null ? loadingView.hide() : void 0;
  });

  showError = function(error) {
    var detail, ref, stack;
    if (!atom.config.get("atom-beautify.general.muteAllErrors")) {
      stack = error.stack;
      detail = error.description || error.message;
      return (ref = atom.notifications) != null ? ref.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0;
    }
  };

  beautify = function(arg) {
    var editor, language, onSave;
    editor = arg.editor, onSave = arg.onSave, language = arg.language;
    return new Promise(function(resolve, reject) {
      var allOptions, beautifyCompleted, e, editedFilePath, forceEntireFile, grammarName, isSelection, oldText, text;
      plugin.checkUnsupportedOptions();
      if (path == null) {
        path = require("path");
      }
      forceEntireFile = onSave && atom.config.get("atom-beautify.general.beautifyEntireFileOnSave");
      beautifyCompleted = function(text) {
        var error, origScrollTop, posArray, selectedBufferRange;
        if (text == null) {

        } else if (text instanceof Error) {
          showError(text);
          return reject(text);
        } else if (typeof text === "string") {
          if (oldText !== text) {
            posArray = getCursors(editor);
            origScrollTop = getScrollTop(editor);
            if (!forceEntireFile && isSelection) {
              selectedBufferRange = editor.getSelectedBufferRange();
              editor.setTextInBufferRange(selectedBufferRange, text);
            } else {
              editor.getBuffer().setTextViaDiff(text);
            }
            setCursors(editor, posArray);
            setTimeout((function() {
              setScrollTop(editor, origScrollTop);
              return resolve(text);
            }), 0);
          }
        } else {
          error = new Error("Unsupported beautification result '" + text + "'.");
          showError(error);
          return reject(error);
        }
      };
      editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return showError(new Error("Active Editor not found. ", "Please select a Text Editor first to beautify."));
      }
      isSelection = !!editor.getSelectedText();
      editedFilePath = editor.getPath();
      allOptions = beautifier.getOptionsForPath(editedFilePath, editor);
      text = void 0;
      if (!forceEntireFile && isSelection) {
        text = editor.getSelectedText();
      } else {
        text = editor.getText();
      }
      oldText = text;
      grammarName = editor.getGrammar().name;
      try {
        beautifier.beautify(text, allOptions, grammarName, editedFilePath, {
          onSave: onSave,
          language: language
        }).then(beautifyCompleted)["catch"](beautifyCompleted);
      } catch (error1) {
        e = error1;
        showError(e);
      }
    });
  };

  beautifyFilePath = function(filePath, callback) {
    var $el, cb;
    logger.verbose('beautifyFilePath', filePath);
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
    $el.addClass('beautifying');
    cb = function(err, result) {
      logger.verbose('Cleanup beautifyFilePath', err, result);
      $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
      $el.removeClass('beautifying');
      return callback(err, result);
    };
    if (fs == null) {
      fs = require("fs");
    }
    logger.verbose('readFile', filePath);
    return fs.readFile(filePath, function(err, data) {
      var allOptions, completionFun, e, grammar, grammarName, input;
      logger.verbose('readFile completed', err, filePath);
      if (err) {
        return cb(err);
      }
      input = data != null ? data.toString() : void 0;
      grammar = atom.grammars.selectGrammar(filePath, input);
      grammarName = grammar.name;
      allOptions = beautifier.getOptionsForPath(filePath);
      logger.verbose('beautifyFilePath allOptions', allOptions);
      completionFun = function(output) {
        logger.verbose('beautifyFilePath completionFun', output);
        if (output instanceof Error) {
          return cb(output, null);
        } else if (typeof output === "string") {
          if (output.trim() === '') {
            logger.verbose('beautifyFilePath, output was empty string!');
            return cb(null, output);
          }
          return fs.writeFile(filePath, output, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, output);
          });
        } else {
          return cb(new Error("Unknown beautification result " + output + "."), output);
        }
      };
      try {
        logger.verbose('beautify', input, allOptions, grammarName, filePath);
        return beautifier.beautify(input, allOptions, grammarName, filePath).then(completionFun)["catch"](completionFun);
      } catch (error1) {
        e = error1;
        return cb(e);
      }
    });
  };

  beautifyFile = function(arg) {
    var filePath, target;
    target = arg.target;
    filePath = target.dataset.path;
    if (!filePath) {
      return;
    }
    beautifyFilePath(filePath, function(err, result) {
      if (err) {
        return showError(err);
      }
    });
  };

  beautifyDirectory = function(arg) {
    var $el, dirPath, target;
    target = arg.target;
    dirPath = target.dataset.path;
    if (!dirPath) {
      return;
    }
    if ((typeof atom !== "undefined" && atom !== null ? atom.confirm({
      message: "This will beautify all of the files found recursively in this directory, '" + dirPath + "'. Do you want to continue?",
      buttons: ['Yes, continue!', 'No, cancel!']
    }) : void 0) !== 0) {
      return;
    }
    if ($ == null) {
      $ = require("atom-space-pen-views").$;
    }
    $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
    $el.addClass('beautifying');
    if (dir == null) {
      dir = require("node-dir");
    }
    if (async == null) {
      async = require("async");
    }
    dir.files(dirPath, function(err, files) {
      if (err) {
        return showError(err);
      }
      return async.each(files, function(filePath, callback) {
        return beautifyFilePath(filePath, function() {
          return callback();
        });
      }, function(err) {
        $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
        return $el.removeClass('beautifying');
      });
    });
  };

  debug = function() {
    var addHeader, addInfo, allOptions, beautifiers, codeBlockSyntax, debugInfo, detail, editor, error, filePath, grammarName, headers, language, linkifyTitle, open, ref, ref1, selectedBeautifier, stack, text, tocEl;
    try {
      open = require("open");
      if (fs == null) {
        fs = require("fs");
      }
      plugin.checkUnsupportedOptions();
      editor = atom.workspace.getActiveTextEditor();
      linkifyTitle = function(title) {
        var p, sep;
        title = title.toLowerCase();
        p = title.split(/[\s,+#;,\/?:@&=+$]+/);
        sep = "-";
        return p.join(sep);
      };
      if (editor == null) {
        return confirm("Active Editor not found.\n" + "Please select a Text Editor first to beautify.");
      }
      if (!confirm('Are you ready to debug Atom Beautify?')) {
        return;
      }
      debugInfo = "";
      headers = [];
      tocEl = "<TABLEOFCONTENTS/>";
      addInfo = function(key, val) {
        if (key != null) {
          return debugInfo += "**" + key + "**: " + val + "\n\n";
        } else {
          return debugInfo += val + "\n\n";
        }
      };
      addHeader = function(level, title) {
        debugInfo += (Array(level + 1).join('#')) + " " + title + "\n\n";
        return headers.push({
          level: level,
          title: title
        });
      };
      addHeader(1, "Atom Beautify - Debugging information");
      debugInfo += "The following debugging information was " + ("generated by `Atom Beautify` on `" + (new Date()) + "`.") + "\n\n---\n\n" + tocEl + "\n\n---\n\n";
      addInfo('Platform', process.platform);
      addHeader(2, "Versions");
      addInfo('Atom Version', atom.appVersion);
      addInfo('Atom Beautify Version', pkg.version);
      addHeader(2, "Original file to be beautified");
      filePath = editor.getPath();
      addInfo('Original File Path', "`" + filePath + "`");
      grammarName = editor.getGrammar().name;
      addInfo('Original File Grammar', grammarName);
      language = beautifier.getLanguage(grammarName, filePath);
      addInfo('Original File Language', language != null ? language.name : void 0);
      addInfo('Language namespace', language != null ? language.namespace : void 0);
      beautifiers = beautifier.getBeautifiers(language.name);
      addInfo('Supported Beautifiers', _.map(beautifiers, 'name').join(', '));
      selectedBeautifier = beautifier.getBeautifierForLanguage(language);
      addInfo('Selected Beautifier', selectedBeautifier.name);
      text = editor.getText() || "";
      codeBlockSyntax = ((ref = language != null ? language.name : void 0) != null ? ref : grammarName).toLowerCase().split(' ')[0];
      addHeader(3, 'Original File Contents');
      addInfo(null, "\n```" + codeBlockSyntax + "\n" + text + "\n```");
      addHeader(3, 'Package Settings');
      addInfo(null, "The raw package settings options\n" + ("```json\n" + (JSON.stringify(atom.config.get('atom-beautify'), void 0, 4)) + "\n```"));
      addHeader(2, "Beautification options");
      allOptions = beautifier.getOptionsForPath(filePath, editor);
      return Promise.all(allOptions).then(function(allOptions) {
        var cb, configOptions, e, editorConfigOptions, editorOptions, finalOptions, homeOptions, logFilePathRegex, logs, preTransformedOptions, projectOptions, subscription;
        editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
        projectOptions = allOptions.slice(4);
        preTransformedOptions = beautifier.getOptionsForLanguage(allOptions, language);
        if (selectedBeautifier) {
          finalOptions = beautifier.transformOptions(selectedBeautifier, language.name, preTransformedOptions);
        }
        addInfo('Editor Options', "\n" + "Options from Atom Editor settings\n" + ("```json\n" + (JSON.stringify(editorOptions, void 0, 4)) + "\n```"));
        addInfo('Config Options', "\n" + "Options from Atom Beautify package settings\n" + ("```json\n" + (JSON.stringify(configOptions, void 0, 4)) + "\n```"));
        addInfo('Home Options', "\n" + ("Options from `" + (path.resolve(beautifier.getUserHome(), '.jsbeautifyrc')) + "`\n") + ("```json\n" + (JSON.stringify(homeOptions, void 0, 4)) + "\n```"));
        addInfo('EditorConfig Options', "\n" + "Options from [EditorConfig](http://editorconfig.org/) file\n" + ("```json\n" + (JSON.stringify(editorConfigOptions, void 0, 4)) + "\n```"));
        addInfo('Project Options', "\n" + ("Options from `.jsbeautifyrc` files starting from directory `" + (path.dirname(filePath)) + "` and going up to root\n") + ("```json\n" + (JSON.stringify(projectOptions, void 0, 4)) + "\n```"));
        addInfo('Pre-Transformed Options', "\n" + "Combined options before transforming them given a beautifier's specifications\n" + ("```json\n" + (JSON.stringify(preTransformedOptions, void 0, 4)) + "\n```"));
        if (selectedBeautifier) {
          addHeader(3, 'Final Options');
          addInfo(null, "Final combined and transformed options that are used\n" + ("```json\n" + (JSON.stringify(finalOptions, void 0, 4)) + "\n```"));
        }
        logs = "";
        logFilePathRegex = new RegExp('\\: \\[(.*)\\]');
        subscription = logger.onLogging(function(msg) {
          var sep;
          sep = path.sep;
          return logs += msg.replace(logFilePathRegex, function(a, b) {
            var i, p, s;
            s = b.split(sep);
            i = s.indexOf('atom-beautify');
            p = s.slice(i + 2).join(sep);
            return ': [' + p + ']';
          });
        });
        cb = function(result) {
          var JsDiff, bullet, diff, header, indent, indentNum, j, len, toc;
          subscription.dispose();
          addHeader(2, "Results");
          addInfo('Beautified File Contents', "\n```" + codeBlockSyntax + "\n" + result + "\n```");
          JsDiff = require('diff');
          if (typeof result === "string") {
            diff = JsDiff.createPatch(filePath || "", text || "", result || "", "original", "beautified");
            addInfo('Original vs. Beautified Diff', "\n```" + codeBlockSyntax + "\n" + diff + "\n```");
          }
          addHeader(3, "Logs");
          addInfo(null, "```\n" + logs + "\n```");
          toc = "## Table Of Contents\n";
          for (j = 0, len = headers.length; j < len; j++) {
            header = headers[j];

            /*
            - Heading 1
              - Heading 1.1
             */
            indent = "  ";
            bullet = "-";
            indentNum = header.level - 2;
            if (indentNum >= 0) {
              toc += "" + (Array(indentNum + 1).join(indent)) + bullet + " [" + header.title + "](\#" + (linkifyTitle(header.title)) + ")\n";
            }
          }
          debugInfo = debugInfo.replace(tocEl, toc);
          return atom.workspace.open().then(function(editor) {
            editor.setText(debugInfo);
            return confirm("Please login to GitHub and create a Gist named \"debug.md\" (Markdown file) with your debugging information.\nThen add a link to your Gist in your GitHub Issue.\nThank you!\n\nGist: https://gist.github.com/\nGitHub Issues: https://github.com/Glavin001/atom-beautify/issues");
          })["catch"](function(error) {
            return confirm("An error occurred when creating the Gist: " + error.message);
          });
        };
        try {
          return beautifier.beautify(text, allOptions, grammarName, filePath).then(cb)["catch"](cb);
        } catch (error1) {
          e = error1;
          return cb(e);
        }
      })["catch"](function(error) {
        var detail, ref1, stack;
        stack = error.stack;
        detail = error.description || error.message;
        return typeof atom !== "undefined" && atom !== null ? (ref1 = atom.notifications) != null ? ref1.addError(error.message, {
          stack: stack,
          detail: detail,
          dismissable: true
        }) : void 0 : void 0;
      });
    } catch (error1) {
      error = error1;
      stack = error.stack;
      detail = error.description || error.message;
      return typeof atom !== "undefined" && atom !== null ? (ref1 = atom.notifications) != null ? ref1.addError(error.message, {
        stack: stack,
        detail: detail,
        dismissable: true
      }) : void 0 : void 0;
    }
  };

  handleSaveEvent = function() {
    return atom.workspace.observeTextEditors(function(editor) {
      var beautifyOnSaveHandler, disposable, pendingPaths;
      pendingPaths = {};
      beautifyOnSaveHandler = function(arg) {
        var beautifyOnSave, buffer, fileExtension, filePath, grammar, key, language, languages;
        filePath = arg.path;
        logger.verbose('Should beautify on this save?');
        if (pendingPaths[filePath]) {
          logger.verbose("Editor with file path " + filePath + " already beautified!");
          return;
        }
        buffer = editor.getBuffer();
        if (path == null) {
          path = require('path');
        }
        grammar = editor.getGrammar().name;
        fileExtension = path.extname(filePath);
        fileExtension = fileExtension.substr(1);
        languages = beautifier.languages.getLanguages({
          grammar: grammar,
          extension: fileExtension
        });
        if (languages.length < 1) {
          return;
        }
        language = languages[0];
        key = "atom-beautify." + language.namespace + ".beautify_on_save";
        beautifyOnSave = atom.config.get(key);
        logger.verbose('save editor positions', key, beautifyOnSave);
        if (beautifyOnSave) {
          logger.verbose('Beautifying file', filePath);
          return beautify({
            editor: editor,
            onSave: true
          }).then(function() {
            logger.verbose('Done beautifying file', filePath);
            if (editor.isAlive() === true) {
              logger.verbose('Saving TextEditor...');
              pendingPaths[filePath] = true;
              return Promise.resolve(editor.save()).then(function() {
                delete pendingPaths[filePath];
                return logger.verbose('Saved TextEditor.');
              });
            }
          })["catch"](function(error) {
            return showError(error);
          });
        }
      };
      disposable = editor.onDidSave(function(arg) {
        var filePath;
        filePath = arg.path;
        return beautifyOnSaveHandler({
          path: filePath
        });
      });
      return plugin.subscriptions.add(disposable);
    });
  };

  getUnsupportedOptions = function() {
    var schema, settings, unsupportedOptions;
    settings = atom.config.get('atom-beautify');
    schema = atom.config.getSchema('atom-beautify');
    unsupportedOptions = _.filter(_.keys(settings), function(key) {
      return schema.properties[key] === void 0;
    });
    return unsupportedOptions;
  };

  plugin.checkUnsupportedOptions = function() {
    var unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    if (unsupportedOptions.length !== 0) {
      return atom.notifications.addWarning("Please run Atom command 'Atom-Beautify: Migrate Settings'.", {
        detail: "You can open the Atom command palette with `cmd-shift-p` (OSX) or `ctrl-shift-p` (Linux/Windows) in Atom. You have unsupported options: " + (unsupportedOptions.join(', ')),
        dismissable: true
      });
    }
  };

  plugin.migrateSettings = function() {
    var namespaces, rename, rex, unsupportedOptions;
    unsupportedOptions = getUnsupportedOptions();
    namespaces = beautifier.languages.namespaces;
    if (unsupportedOptions.length === 0) {
      return atom.notifications.addSuccess("No options to migrate.");
    } else {
      rex = new RegExp("(" + (namespaces.join('|')) + ")_(.*)");
      rename = _.toPairs(_.zipObject(unsupportedOptions, _.map(unsupportedOptions, function(key) {
        var m;
        m = key.match(rex);
        if (m === null) {
          return "general." + key;
        } else {
          return m[1] + "." + m[2];
        }
      })));
      _.each(rename, function(arg) {
        var key, newKey, val;
        key = arg[0], newKey = arg[1];
        val = atom.config.get("atom-beautify." + key);
        atom.config.set("atom-beautify." + newKey, val);
        return atom.config.set("atom-beautify." + key, void 0);
      });
      return atom.notifications.addSuccess("Successfully migrated options: " + (unsupportedOptions.join(', ')));
    }
  };

  plugin.addLanguageCommands = function() {
    var j, language, languages, len, results;
    languages = beautifier.languages.languages;
    logger.verbose("languages", languages);
    results = [];
    for (j = 0, len = languages.length; j < len; j++) {
      language = languages[j];
      results.push(((function(_this) {
        return function(language) {
          return _this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:beautify-language-" + (language.name.toLowerCase()), function() {
            logger.verbose("Beautifying language", language);
            return beautify({
              language: language
            });
          }));
        };
      })(this))(language));
    }
    return results;
  };

  plugin.config = _.merge(require('./config'), defaultLanguageOptions);

  plugin.activate = function() {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(handleSaveEvent());
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:beautify-editor", beautify));
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:help-debug-editor", debug));
    this.subscriptions.add(atom.commands.add(".tree-view .file .name", "atom-beautify:beautify-file", beautifyFile));
    this.subscriptions.add(atom.commands.add(".tree-view .directory .name", "atom-beautify:beautify-directory", beautifyDirectory));
    this.subscriptions.add(atom.commands.add("atom-workspace", "atom-beautify:migrate-settings", plugin.migrateSettings));
    return this.addLanguageCommands();
  };

  plugin.deactivate = function() {
    return this.subscriptions.dispose();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7RUFBQTtBQUFBLE1BQUE7O0VBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxZQUFSOztFQUdOLE1BQUEsR0FBUyxNQUFNLENBQUM7O0VBQ2Ysc0JBQXVCLE9BQUEsQ0FBUSxXQUFSOztFQUN4QixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osV0FBQSxHQUFjLE9BQUEsQ0FBUSxlQUFSOztFQUNkLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQUE7O0VBQ2pCLHNCQUFBLEdBQXlCLFVBQVUsQ0FBQzs7RUFDcEMsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQUEsQ0FBb0IsVUFBcEI7O0VBQ1QsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUdWLEVBQUEsR0FBSzs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsS0FBQSxHQUFROztFQUNSLElBQUEsR0FBTzs7RUFDUCxLQUFBLEdBQVE7O0VBQ1IsR0FBQSxHQUFNOztFQUNOLFdBQUEsR0FBYzs7RUFDZCxXQUFBLEdBQWM7O0VBQ2QsQ0FBQSxHQUFJOztFQU1KLFlBQUEsR0FBZSxTQUFDLE1BQUQ7QUFDYixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjswQkFDUCxJQUFJLENBQUUsWUFBTixDQUFBO0VBRmE7O0VBR2YsWUFBQSxHQUFlLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDYixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjs4REFDUSxDQUFFLFlBQWpCLENBQThCLEtBQTlCO0VBRmE7O0VBSWYsVUFBQSxHQUFhLFNBQUMsTUFBRDtBQUNYLFFB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QXJFLENBQW5CO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsaUNBQXBDLEVBQXVFLEtBQXZFLENBQW5CO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQix3QkFBbEIsRUFBNEMsNkJBQTVDLEVBQTJFLFlBQTNFLENBQW5CO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw2QkFBbEIsRUFBaUQsa0NBQWpELEVBQXFGLGlCQUFyRixDQUFuQjtJQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGdDQUFwQyxFQUFzRSxNQUFNLENBQUMsZUFBN0UsQ0FBbkI7V0FDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtFQVJnQjs7RUFVbEIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsU0FBQTtXQUNsQixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtFQURrQjtBQXBuQnBCIiwic291cmNlc0NvbnRlbnQiOlsiIyBnbG9iYWwgYXRvbVxyXG5cInVzZSBzdHJpY3RcIlxyXG5wa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlJylcclxuXHJcbiMgRGVwZW5kZW5jaWVzXHJcbnBsdWdpbiA9IG1vZHVsZS5leHBvcnRzXHJcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcclxuXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcclxuQmVhdXRpZmllcnMgPSByZXF1aXJlKFwiLi9iZWF1dGlmaWVyc1wiKVxyXG5iZWF1dGlmaWVyID0gbmV3IEJlYXV0aWZpZXJzKClcclxuZGVmYXVsdExhbmd1YWdlT3B0aW9ucyA9IGJlYXV0aWZpZXIub3B0aW9uc1xyXG5sb2dnZXIgPSByZXF1aXJlKCcuL2xvZ2dlcicpKF9fZmlsZW5hbWUpXHJcblByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpXHJcblxyXG4jIExhenkgbG9hZGVkIGRlcGVuZGVuY2llc1xyXG5mcyA9IG51bGxcclxucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXHJcbnN0cmlwID0gbnVsbFxyXG55YW1sID0gbnVsbFxyXG5hc3luYyA9IG51bGxcclxuZGlyID0gbnVsbCAjIE5vZGUtRGlyXHJcbkxvYWRpbmdWaWV3ID0gbnVsbFxyXG5sb2FkaW5nVmlldyA9IG51bGxcclxuJCA9IG51bGxcclxuXHJcbiMgZnVuY3Rpb24gY2xlYW5PcHRpb25zKGRhdGEsIHR5cGVzKSB7XHJcbiMgbm9wdC5jbGVhbihkYXRhLCB0eXBlcyk7XHJcbiMgcmV0dXJuIGRhdGE7XHJcbiMgfVxyXG5nZXRTY3JvbGxUb3AgPSAoZWRpdG9yKSAtPlxyXG4gIHZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxyXG4gIHZpZXc/LmdldFNjcm9sbFRvcCgpXHJcbnNldFNjcm9sbFRvcCA9IChlZGl0b3IsIHZhbHVlKSAtPlxyXG4gIHZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxyXG4gIHZpZXc/LmNvbXBvbmVudD8uc2V0U2Nyb2xsVG9wIHZhbHVlXHJcblxyXG5nZXRDdXJzb3JzID0gKGVkaXRvcikgLT5cclxuICBjdXJzb3JzID0gZWRpdG9yLmdldEN1cnNvcnMoKVxyXG4gIHBvc0FycmF5ID0gW11cclxuICBmb3IgY3Vyc29yIGluIGN1cnNvcnNcclxuICAgIGJ1ZmZlclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIHBvc0FycmF5LnB1c2ggW1xyXG4gICAgICBidWZmZXJQb3NpdGlvbi5yb3dcclxuICAgICAgYnVmZmVyUG9zaXRpb24uY29sdW1uXHJcbiAgICBdXHJcbiAgcG9zQXJyYXlcclxuc2V0Q3Vyc29ycyA9IChlZGl0b3IsIHBvc0FycmF5KSAtPlxyXG5cclxuICAjIGNvbnNvbGUubG9nIFwic2V0Q3Vyc29yczpcclxuICBmb3IgYnVmZmVyUG9zaXRpb24sIGkgaW4gcG9zQXJyYXlcclxuICAgIGlmIGkgaXMgMFxyXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gYnVmZmVyUG9zaXRpb25cclxuICAgICAgY29udGludWVcclxuICAgIGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uIGJ1ZmZlclBvc2l0aW9uXHJcbiAgcmV0dXJuXHJcblxyXG4jIFNob3cgYmVhdXRpZmljYXRpb24gcHJvZ3Jlc3MvbG9hZGluZyB2aWV3XHJcbmJlYXV0aWZpZXIub24oJ2JlYXV0aWZ5OjpzdGFydCcsIC0+XHJcbiAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1iZWF1dGlmeS5nZW5lcmFsLnNob3dMb2FkaW5nVmlld1wiKVxyXG4gICAgTG9hZGluZ1ZpZXcgPz0gcmVxdWlyZSBcIi4vdmlld3MvbG9hZGluZy12aWV3XCJcclxuICAgIGxvYWRpbmdWaWV3ID89IG5ldyBMb2FkaW5nVmlldygpXHJcbiAgICBsb2FkaW5nVmlldy5zaG93KClcclxuKVxyXG5iZWF1dGlmaWVyLm9uKCdiZWF1dGlmeTo6ZW5kJywgLT5cclxuICBsb2FkaW5nVmlldz8uaGlkZSgpXHJcbilcclxuIyBTaG93IGVycm9yXHJcbnNob3dFcnJvciA9IChlcnJvcikgLT5cclxuICBpZiBub3QgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1iZWF1dGlmeS5nZW5lcmFsLm11dGVBbGxFcnJvcnNcIilcclxuICAgICMgY29uc29sZS5sb2coZSlcclxuICAgIHN0YWNrID0gZXJyb3Iuc3RhY2tcclxuICAgIGRldGFpbCA9IGVycm9yLmRlc2NyaXB0aW9uIG9yIGVycm9yLm1lc3NhZ2VcclxuICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkRXJyb3IoZXJyb3IubWVzc2FnZSwge1xyXG4gICAgICBzdGFjaywgZGV0YWlsLCBkaXNtaXNzYWJsZSA6IHRydWV9KVxyXG5cclxuYmVhdXRpZnkgPSAoeyBlZGl0b3IsIG9uU2F2ZSwgbGFuZ3VhZ2UgfSkgLT5cclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cclxuXHJcbiAgICBwbHVnaW4uY2hlY2tVbnN1cHBvcnRlZE9wdGlvbnMoKVxyXG5cclxuICAgICMgQ29udGludWUgYmVhdXRpZnlpbmdcclxuICAgIHBhdGggPz0gcmVxdWlyZShcInBhdGhcIilcclxuICAgIGZvcmNlRW50aXJlRmlsZSA9IG9uU2F2ZSBhbmQgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1iZWF1dGlmeS5nZW5lcmFsLmJlYXV0aWZ5RW50aXJlRmlsZU9uU2F2ZVwiKVxyXG5cclxuICAgICMgR2V0IHRoZSBwYXRoIHRvIHRoZSBjb25maWcgZmlsZVxyXG4gICAgIyBBbGwgb2YgdGhlIG9wdGlvbnNcclxuICAgICMgTGlzdGVkIGluIG9yZGVyIGZyb20gZGVmYXVsdCAoYmFzZSkgdG8gdGhlIG9uZSB3aXRoIHRoZSBoaWdoZXN0IHByaW9yaXR5XHJcbiAgICAjIExlZnQgPSBEZWZhdWx0LCBSaWdodCA9IFdpbGwgb3ZlcnJpZGUgdGhlIGxlZnQuXHJcbiAgICAjIEF0b20gRWRpdG9yXHJcbiAgICAjXHJcbiAgICAjIFVzZXIncyBIb21lIHBhdGhcclxuICAgICMgUHJvamVjdCBwYXRoXHJcbiAgICAjIEFzeW5jaHJvbm91c2x5IGFuZCBjYWxsYmFjay1zdHlsZVxyXG4gICAgYmVhdXRpZnlDb21wbGV0ZWQgPSAodGV4dCkgLT5cclxuXHJcbiAgICAgIGlmIG5vdCB0ZXh0P1xyXG4gICAgICAgICMgRG8gbm90aGluZywgaXMgdW5kZWZpbmVkXHJcbiAgICAgICAgIyBjb25zb2xlLmxvZyAnYmVhdXRpZnlDb21wbGV0ZWQnXHJcbiAgICAgIGVsc2UgaWYgdGV4dCBpbnN0YW5jZW9mIEVycm9yXHJcbiAgICAgICAgc2hvd0Vycm9yKHRleHQpXHJcbiAgICAgICAgcmV0dXJuIHJlamVjdCh0ZXh0KVxyXG4gICAgICBlbHNlIGlmIHR5cGVvZiB0ZXh0IGlzIFwic3RyaW5nXCJcclxuICAgICAgICBpZiBvbGRUZXh0IGlzbnQgdGV4dFxyXG5cclxuICAgICAgICAgICMgY29uc29sZS5sb2cgXCJSZXBsYWNpbmcgY3VycmVudCBlZGl0b3IncyB0ZXh0IHdpdGggbmV3IHRleHRcIlxyXG4gICAgICAgICAgcG9zQXJyYXkgPSBnZXRDdXJzb3JzKGVkaXRvcilcclxuXHJcbiAgICAgICAgICAjIGNvbnNvbGUubG9nIFwicG9zQXJyYXk6XHJcbiAgICAgICAgICBvcmlnU2Nyb2xsVG9wID0gZ2V0U2Nyb2xsVG9wKGVkaXRvcilcclxuXHJcbiAgICAgICAgICAjIGNvbnNvbGUubG9nIFwib3JpZ1Njcm9sbFRvcDpcclxuICAgICAgICAgIGlmIG5vdCBmb3JjZUVudGlyZUZpbGUgYW5kIGlzU2VsZWN0aW9uXHJcbiAgICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2UgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXHJcblxyXG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nIFwic2VsZWN0ZWRCdWZmZXJSYW5nZTpcclxuICAgICAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIHNlbGVjdGVkQnVmZmVyUmFuZ2UsIHRleHRcclxuICAgICAgICAgIGVsc2VcclxuXHJcbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgXCJzZXRUZXh0XCJcclxuICAgICAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHRWaWFEaWZmKHRleHQpXHJcblxyXG4gICAgICAgICAgIyBjb25zb2xlLmxvZyBcInNldEN1cnNvcnNcIlxyXG4gICAgICAgICAgc2V0Q3Vyc29ycyBlZGl0b3IsIHBvc0FycmF5XHJcblxyXG4gICAgICAgICAgIyBjb25zb2xlLmxvZyBcIkRvbmUgc2V0Q3Vyc29yc1wiXHJcbiAgICAgICAgICAjIExldCB0aGUgc2Nyb2xsVG9wIHNldHRpbmcgcnVuIGFmdGVyIGFsbCB0aGUgc2F2ZSByZWxhdGVkIHN0dWZmIGlzIHJ1bixcclxuICAgICAgICAgICMgb3RoZXJ3aXNlIHNldFNjcm9sbFRvcCBpcyBub3Qgd29ya2luZywgcHJvYmFibHkgYmVjYXVzZSB0aGUgY3Vyc29yXHJcbiAgICAgICAgICAjIGFkZGl0aW9uIGhhcHBlbnMgYXN5bmNocm9ub3VzbHlcclxuICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxyXG5cclxuICAgICAgICAgICAgIyBjb25zb2xlLmxvZyBcInNldFNjcm9sbFRvcFwiXHJcbiAgICAgICAgICAgIHNldFNjcm9sbFRvcCBlZGl0b3IsIG9yaWdTY3JvbGxUb3BcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodGV4dClcclxuICAgICAgICAgICksIDBcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKFwiVW5zdXBwb3J0ZWQgYmVhdXRpZmljYXRpb24gcmVzdWx0ICcje3RleHR9Jy5cIilcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IpXHJcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcclxuXHJcbiAgICAgICMgZWxzZVxyXG4gICAgICAjIGNvbnNvbGUubG9nIFwiQWxyZWFkeSBCZWF1dGlmdWwhXCJcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBjb25zb2xlLmxvZyAnQmVhdXRpZnkgdGltZSEnXHJcbiAgICAjXHJcbiAgICAjIEdldCBjdXJyZW50IGVkaXRvclxyXG4gICAgZWRpdG9yID0gZWRpdG9yID8gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcblxyXG5cclxuICAgICMgQ2hlY2sgaWYgdGhlcmUgaXMgYW4gYWN0aXZlIGVkaXRvclxyXG4gICAgaWYgbm90IGVkaXRvcj9cclxuICAgICAgcmV0dXJuIHNob3dFcnJvciggbmV3IEVycm9yKFwiQWN0aXZlIEVkaXRvciBub3QgZm91bmQuIFwiXHJcbiAgICAgICAgXCJQbGVhc2Ugc2VsZWN0IGEgVGV4dCBFZGl0b3IgZmlyc3QgdG8gYmVhdXRpZnkuXCIpKVxyXG4gICAgaXNTZWxlY3Rpb24gPSAhIWVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxyXG5cclxuXHJcbiAgICAjIEdldCBlZGl0b3IgcGF0aCBhbmQgY29uZmlndXJhdGlvbnMgZm9yIHBhdGhzXHJcbiAgICBlZGl0ZWRGaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcclxuXHJcblxyXG4gICAgIyBHZXQgYWxsIG9wdGlvbnNcclxuICAgIGFsbE9wdGlvbnMgPSBiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JQYXRoKGVkaXRlZEZpbGVQYXRoLCBlZGl0b3IpXHJcblxyXG5cclxuICAgICMgR2V0IGN1cnJlbnQgZWRpdG9yJ3MgdGV4dFxyXG4gICAgdGV4dCA9IHVuZGVmaW5lZFxyXG4gICAgaWYgbm90IGZvcmNlRW50aXJlRmlsZSBhbmQgaXNTZWxlY3Rpb25cclxuICAgICAgdGV4dCA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxyXG4gICAgZWxzZVxyXG4gICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKVxyXG4gICAgb2xkVGV4dCA9IHRleHRcclxuXHJcblxyXG4gICAgIyBHZXQgR3JhbW1hclxyXG4gICAgZ3JhbW1hck5hbWUgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWVcclxuXHJcblxyXG4gICAgIyBGaW5hbGx5LCBiZWF1dGlmeSFcclxuICAgIHRyeVxyXG4gICAgICBiZWF1dGlmaWVyLmJlYXV0aWZ5KHRleHQsIGFsbE9wdGlvbnMsIGdyYW1tYXJOYW1lLCBlZGl0ZWRGaWxlUGF0aCwgb25TYXZlOiBvblNhdmUsIGxhbmd1YWdlOiBsYW5ndWFnZSlcclxuICAgICAgLnRoZW4oYmVhdXRpZnlDb21wbGV0ZWQpXHJcbiAgICAgIC5jYXRjaChiZWF1dGlmeUNvbXBsZXRlZClcclxuICAgIGNhdGNoIGVcclxuICAgICAgc2hvd0Vycm9yKGUpXHJcbiAgICByZXR1cm5cclxuICApXHJcblxyXG5iZWF1dGlmeUZpbGVQYXRoID0gKGZpbGVQYXRoLCBjYWxsYmFjaykgLT5cclxuICBsb2dnZXIudmVyYm9zZSgnYmVhdXRpZnlGaWxlUGF0aCcsIGZpbGVQYXRoKVxyXG5cclxuICAjIFNob3cgaW4gcHJvZ3Jlc3MgaW5kaWNhdGUgb24gZmlsZSdzIHRyZWUtdmlldyBlbnRyeVxyXG4gICQgPz0gcmVxdWlyZShcImF0b20tc3BhY2UtcGVuLXZpZXdzXCIpLiRcclxuICAkZWwgPSAkKFwiLmljb24tZmlsZS10ZXh0W2RhdGEtcGF0aD1cXFwiI3tmaWxlUGF0aH1cXFwiXVwiKVxyXG4gICRlbC5hZGRDbGFzcygnYmVhdXRpZnlpbmcnKVxyXG5cclxuICAjIENsZWFudXAgYW5kIHJldHVybiBjYWxsYmFjayBmdW5jdGlvblxyXG4gIGNiID0gKGVyciwgcmVzdWx0KSAtPlxyXG4gICAgbG9nZ2VyLnZlcmJvc2UoJ0NsZWFudXAgYmVhdXRpZnlGaWxlUGF0aCcsIGVyciwgcmVzdWx0KVxyXG4gICAgJGVsID0gJChcIi5pY29uLWZpbGUtdGV4dFtkYXRhLXBhdGg9XFxcIiN7ZmlsZVBhdGh9XFxcIl1cIilcclxuICAgICRlbC5yZW1vdmVDbGFzcygnYmVhdXRpZnlpbmcnKVxyXG4gICAgcmV0dXJuIGNhbGxiYWNrKGVyciwgcmVzdWx0KVxyXG5cclxuICAjIEdldCBjb250ZW50cyBvZiBmaWxlXHJcbiAgZnMgPz0gcmVxdWlyZSBcImZzXCJcclxuICBsb2dnZXIudmVyYm9zZSgncmVhZEZpbGUnLCBmaWxlUGF0aClcclxuICBmcy5yZWFkRmlsZShmaWxlUGF0aCwgKGVyciwgZGF0YSkgLT5cclxuICAgIGxvZ2dlci52ZXJib3NlKCdyZWFkRmlsZSBjb21wbGV0ZWQnLCBlcnIsIGZpbGVQYXRoKVxyXG4gICAgcmV0dXJuIGNiKGVycikgaWYgZXJyXHJcbiAgICBpbnB1dCA9IGRhdGE/LnRvU3RyaW5nKClcclxuICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLnNlbGVjdEdyYW1tYXIoZmlsZVBhdGgsIGlucHV0KVxyXG4gICAgZ3JhbW1hck5hbWUgPSBncmFtbWFyLm5hbWVcclxuXHJcbiAgICAjIEdldCB0aGUgb3B0aW9uc1xyXG4gICAgYWxsT3B0aW9ucyA9IGJlYXV0aWZpZXIuZ2V0T3B0aW9uc0ZvclBhdGgoZmlsZVBhdGgpXHJcbiAgICBsb2dnZXIudmVyYm9zZSgnYmVhdXRpZnlGaWxlUGF0aCBhbGxPcHRpb25zJywgYWxsT3B0aW9ucylcclxuXHJcbiAgICAjIEJlYXV0aWZ5IEZpbGVcclxuICAgIGNvbXBsZXRpb25GdW4gPSAob3V0cHV0KSAtPlxyXG4gICAgICBsb2dnZXIudmVyYm9zZSgnYmVhdXRpZnlGaWxlUGF0aCBjb21wbGV0aW9uRnVuJywgb3V0cHV0KVxyXG4gICAgICBpZiBvdXRwdXQgaW5zdGFuY2VvZiBFcnJvclxyXG4gICAgICAgIHJldHVybiBjYihvdXRwdXQsIG51bGwgKSAjIG91dHB1dCA9PSBFcnJvclxyXG4gICAgICBlbHNlIGlmIHR5cGVvZiBvdXRwdXQgaXMgXCJzdHJpbmdcIlxyXG4gICAgICAgICMgZG8gbm90IGFsbG93IGVtcHR5IHN0cmluZ1xyXG4gICAgICAgIGlmIG91dHB1dC50cmltKCkgaXMgJydcclxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKCdiZWF1dGlmeUZpbGVQYXRoLCBvdXRwdXQgd2FzIGVtcHR5IHN0cmluZyEnKVxyXG4gICAgICAgICAgcmV0dXJuIGNiKG51bGwsIG91dHB1dClcclxuICAgICAgICAjIHNhdmUgdG8gZmlsZVxyXG4gICAgICAgIGZzLndyaXRlRmlsZShmaWxlUGF0aCwgb3V0cHV0LCAoZXJyKSAtPlxyXG4gICAgICAgICAgcmV0dXJuIGNiKGVycikgaWYgZXJyXHJcbiAgICAgICAgICByZXR1cm4gY2IoIG51bGwgLCBvdXRwdXQpXHJcbiAgICAgICAgKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuIGNiKCBuZXcgRXJyb3IoXCJVbmtub3duIGJlYXV0aWZpY2F0aW9uIHJlc3VsdCAje291dHB1dH0uXCIpLCBvdXRwdXQpXHJcbiAgICB0cnlcclxuICAgICAgbG9nZ2VyLnZlcmJvc2UoJ2JlYXV0aWZ5JywgaW5wdXQsIGFsbE9wdGlvbnMsIGdyYW1tYXJOYW1lLCBmaWxlUGF0aClcclxuICAgICAgYmVhdXRpZmllci5iZWF1dGlmeShpbnB1dCwgYWxsT3B0aW9ucywgZ3JhbW1hck5hbWUsIGZpbGVQYXRoKVxyXG4gICAgICAudGhlbihjb21wbGV0aW9uRnVuKVxyXG4gICAgICAuY2F0Y2goY29tcGxldGlvbkZ1bilcclxuICAgIGNhdGNoIGVcclxuICAgICAgcmV0dXJuIGNiKGUpXHJcbiAgICApXHJcblxyXG5iZWF1dGlmeUZpbGUgPSAoe3RhcmdldH0pIC0+XHJcbiAgZmlsZVBhdGggPSB0YXJnZXQuZGF0YXNldC5wYXRoXHJcbiAgcmV0dXJuIHVubGVzcyBmaWxlUGF0aFxyXG4gIGJlYXV0aWZ5RmlsZVBhdGgoZmlsZVBhdGgsIChlcnIsIHJlc3VsdCkgLT5cclxuICAgIHJldHVybiBzaG93RXJyb3IoZXJyKSBpZiBlcnJcclxuICAgICMgY29uc29sZS5sb2coXCJCZWF1dGlmeSBGaWxlXHJcbiAgKVxyXG4gIHJldHVyblxyXG5cclxuYmVhdXRpZnlEaXJlY3RvcnkgPSAoe3RhcmdldH0pIC0+XHJcbiAgZGlyUGF0aCA9IHRhcmdldC5kYXRhc2V0LnBhdGhcclxuICByZXR1cm4gdW5sZXNzIGRpclBhdGhcclxuXHJcbiAgcmV0dXJuIGlmIGF0b20/LmNvbmZpcm0oXHJcbiAgICBtZXNzYWdlOiBcIlRoaXMgd2lsbCBiZWF1dGlmeSBhbGwgb2YgdGhlIGZpbGVzIGZvdW5kIFxcXHJcbiAgICAgICAgcmVjdXJzaXZlbHkgaW4gdGhpcyBkaXJlY3RvcnksICcje2RpclBhdGh9Jy4gXFxcclxuICAgICAgICBEbyB5b3Ugd2FudCB0byBjb250aW51ZT9cIixcclxuICAgIGJ1dHRvbnM6IFsnWWVzLCBjb250aW51ZSEnLCdObywgY2FuY2VsISddKSBpc250IDBcclxuXHJcbiAgIyBTaG93IGluIHByb2dyZXNzIGluZGljYXRlIG9uIGRpcmVjdG9yeSdzIHRyZWUtdmlldyBlbnRyeVxyXG4gICQgPz0gcmVxdWlyZShcImF0b20tc3BhY2UtcGVuLXZpZXdzXCIpLiRcclxuICAkZWwgPSAkKFwiLmljb24tZmlsZS1kaXJlY3RvcnlbZGF0YS1wYXRoPVxcXCIje2RpclBhdGh9XFxcIl1cIilcclxuICAkZWwuYWRkQ2xhc3MoJ2JlYXV0aWZ5aW5nJylcclxuXHJcbiAgIyBQcm9jZXNzIERpcmVjdG9yeVxyXG4gIGRpciA/PSByZXF1aXJlIFwibm9kZS1kaXJcIlxyXG4gIGFzeW5jID89IHJlcXVpcmUgXCJhc3luY1wiXHJcbiAgZGlyLmZpbGVzKGRpclBhdGgsIChlcnIsIGZpbGVzKSAtPlxyXG4gICAgcmV0dXJuIHNob3dFcnJvcihlcnIpIGlmIGVyclxyXG5cclxuICAgIGFzeW5jLmVhY2goZmlsZXMsIChmaWxlUGF0aCwgY2FsbGJhY2spIC0+XHJcbiAgICAgICMgSWdub3JlIGVycm9yc1xyXG4gICAgICBiZWF1dGlmeUZpbGVQYXRoKGZpbGVQYXRoLCAtPiBjYWxsYmFjaygpKVxyXG4gICAgLCAoZXJyKSAtPlxyXG4gICAgICAkZWwgPSAkKFwiLmljb24tZmlsZS1kaXJlY3RvcnlbZGF0YS1wYXRoPVxcXCIje2RpclBhdGh9XFxcIl1cIilcclxuICAgICAgJGVsLnJlbW92ZUNsYXNzKCdiZWF1dGlmeWluZycpXHJcbiAgICAgICMgY29uc29sZS5sb2coJ0NvbXBsZXRlZCBiZWF1dGlmeWluZyBkaXJlY3RvcnkhJywgZGlyUGF0aClcclxuICAgIClcclxuICApXHJcbiAgcmV0dXJuXHJcblxyXG5kZWJ1ZyA9ICgpIC0+XHJcbiAgdHJ5XHJcbiAgICBvcGVuID0gcmVxdWlyZShcIm9wZW5cIilcclxuICAgIGZzID89IHJlcXVpcmUgXCJmc1wiXHJcblxyXG4gICAgcGx1Z2luLmNoZWNrVW5zdXBwb3J0ZWRPcHRpb25zKClcclxuXHJcbiAgICAjIEdldCBjdXJyZW50IGVkaXRvclxyXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcblxyXG4gICAgbGlua2lmeVRpdGxlID0gKHRpdGxlKSAtPlxyXG4gICAgICB0aXRsZSA9IHRpdGxlLnRvTG93ZXJDYXNlKClcclxuICAgICAgcCA9IHRpdGxlLnNwbGl0KC9bXFxzLCsjOyxcXC8/OkAmPSskXSsvKSAjIHNwbGl0IGludG8gcGFydHNcclxuICAgICAgc2VwID0gXCItXCJcclxuICAgICAgcC5qb2luKHNlcClcclxuXHJcbiAgICAjIENoZWNrIGlmIHRoZXJlIGlzIGFuIGFjdGl2ZSBlZGl0b3JcclxuICAgIGlmIG5vdCBlZGl0b3I/XHJcbiAgICAgIHJldHVybiBjb25maXJtKFwiQWN0aXZlIEVkaXRvciBub3QgZm91bmQuXFxuXCIgK1xyXG4gICAgICBcIlBsZWFzZSBzZWxlY3QgYSBUZXh0IEVkaXRvciBmaXJzdCB0byBiZWF1dGlmeS5cIilcclxuICAgIHJldHVybiB1bmxlc3MgY29uZmlybSgnQXJlIHlvdSByZWFkeSB0byBkZWJ1ZyBBdG9tIEJlYXV0aWZ5PycpXHJcbiAgICBkZWJ1Z0luZm8gPSBcIlwiXHJcbiAgICBoZWFkZXJzID0gW11cclxuICAgIHRvY0VsID0gXCI8VEFCTEVPRkNPTlRFTlRTLz5cIlxyXG4gICAgYWRkSW5mbyA9IChrZXksIHZhbCkgLT5cclxuICAgICAgaWYga2V5P1xyXG4gICAgICAgIGRlYnVnSW5mbyArPSBcIioqI3trZXl9Kio6ICN7dmFsfVxcblxcblwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBkZWJ1Z0luZm8gKz0gXCIje3ZhbH1cXG5cXG5cIlxyXG4gICAgYWRkSGVhZGVyID0gKGxldmVsLCB0aXRsZSkgLT5cclxuICAgICAgZGVidWdJbmZvICs9IFwiI3tBcnJheShsZXZlbCsxKS5qb2luKCcjJyl9ICN7dGl0bGV9XFxuXFxuXCJcclxuICAgICAgaGVhZGVycy5wdXNoKHtcclxuICAgICAgICBsZXZlbCwgdGl0bGVcclxuICAgICAgICB9KVxyXG4gICAgYWRkSGVhZGVyKDEsIFwiQXRvbSBCZWF1dGlmeSAtIERlYnVnZ2luZyBpbmZvcm1hdGlvblwiKVxyXG4gICAgZGVidWdJbmZvICs9IFwiVGhlIGZvbGxvd2luZyBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24gd2FzIFwiICtcclxuICAgIFwiZ2VuZXJhdGVkIGJ5IGBBdG9tIEJlYXV0aWZ5YCBvbiBgI3tuZXcgRGF0ZSgpfWAuXCIgK1xyXG4gICAgXCJcXG5cXG4tLS1cXG5cXG5cIiArXHJcbiAgICB0b2NFbCArXHJcbiAgICBcIlxcblxcbi0tLVxcblxcblwiXHJcblxyXG4gICAgIyBQbGF0Zm9ybVxyXG4gICAgYWRkSW5mbygnUGxhdGZvcm0nLCBwcm9jZXNzLnBsYXRmb3JtKVxyXG4gICAgYWRkSGVhZGVyKDIsIFwiVmVyc2lvbnNcIilcclxuXHJcblxyXG4gICAgIyBBdG9tIFZlcnNpb25cclxuICAgIGFkZEluZm8oJ0F0b20gVmVyc2lvbicsIGF0b20uYXBwVmVyc2lvbilcclxuXHJcblxyXG4gICAgIyBBdG9tIEJlYXV0aWZ5IFZlcnNpb25cclxuICAgIGFkZEluZm8oJ0F0b20gQmVhdXRpZnkgVmVyc2lvbicsIHBrZy52ZXJzaW9uKVxyXG4gICAgYWRkSGVhZGVyKDIsIFwiT3JpZ2luYWwgZmlsZSB0byBiZSBiZWF1dGlmaWVkXCIpXHJcblxyXG5cclxuICAgICMgT3JpZ2luYWwgZmlsZVxyXG4gICAgI1xyXG4gICAgIyBHZXQgZWRpdG9yIHBhdGggYW5kIGNvbmZpZ3VyYXRpb25zIGZvciBwYXRoc1xyXG4gICAgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXHJcblxyXG4gICAgIyBQYXRoXHJcbiAgICBhZGRJbmZvKCdPcmlnaW5hbCBGaWxlIFBhdGgnLCBcImAje2ZpbGVQYXRofWBcIilcclxuXHJcbiAgICAjIEdldCBHcmFtbWFyXHJcbiAgICBncmFtbWFyTmFtZSA9IGVkaXRvci5nZXRHcmFtbWFyKCkubmFtZVxyXG5cclxuICAgICMgR3JhbW1hclxyXG4gICAgYWRkSW5mbygnT3JpZ2luYWwgRmlsZSBHcmFtbWFyJywgZ3JhbW1hck5hbWUpXHJcblxyXG4gICAgIyBMYW5ndWFnZVxyXG4gICAgbGFuZ3VhZ2UgPSBiZWF1dGlmaWVyLmdldExhbmd1YWdlKGdyYW1tYXJOYW1lLCBmaWxlUGF0aClcclxuICAgIGFkZEluZm8oJ09yaWdpbmFsIEZpbGUgTGFuZ3VhZ2UnLCBsYW5ndWFnZT8ubmFtZSlcclxuICAgIGFkZEluZm8oJ0xhbmd1YWdlIG5hbWVzcGFjZScsIGxhbmd1YWdlPy5uYW1lc3BhY2UpXHJcblxyXG4gICAgIyBCZWF1dGlmaWVyXHJcbiAgICBiZWF1dGlmaWVycyA9IGJlYXV0aWZpZXIuZ2V0QmVhdXRpZmllcnMobGFuZ3VhZ2UubmFtZSlcclxuICAgIGFkZEluZm8oJ1N1cHBvcnRlZCBCZWF1dGlmaWVycycsIF8ubWFwKGJlYXV0aWZpZXJzLCAnbmFtZScpLmpvaW4oJywgJykpXHJcbiAgICBzZWxlY3RlZEJlYXV0aWZpZXIgPSBiZWF1dGlmaWVyLmdldEJlYXV0aWZpZXJGb3JMYW5ndWFnZShsYW5ndWFnZSlcclxuICAgIGFkZEluZm8oJ1NlbGVjdGVkIEJlYXV0aWZpZXInLCBzZWxlY3RlZEJlYXV0aWZpZXIubmFtZSlcclxuXHJcbiAgICAjIEdldCBjdXJyZW50IGVkaXRvcidzIHRleHRcclxuICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpIG9yIFwiXCJcclxuXHJcbiAgICAjIENvbnRlbnRzXHJcbiAgICBjb2RlQmxvY2tTeW50YXggPSAobGFuZ3VhZ2U/Lm5hbWUgPyBncmFtbWFyTmFtZSkudG9Mb3dlckNhc2UoKS5zcGxpdCgnICcpWzBdXHJcbiAgICBhZGRIZWFkZXIoMywgJ09yaWdpbmFsIEZpbGUgQ29udGVudHMnKVxyXG4gICAgYWRkSW5mbyhudWxsLCBcIlxcbmBgYCN7Y29kZUJsb2NrU3ludGF4fVxcbiN7dGV4dH1cXG5gYGBcIilcclxuXHJcbiAgICBhZGRIZWFkZXIoMywgJ1BhY2thZ2UgU2V0dGluZ3MnKVxyXG4gICAgYWRkSW5mbyhudWxsLFxyXG4gICAgICBcIlRoZSByYXcgcGFja2FnZSBzZXR0aW5ncyBvcHRpb25zXFxuXCIgK1xyXG4gICAgICBcImBgYGpzb25cXG4je0pTT04uc3RyaW5naWZ5KGF0b20uY29uZmlnLmdldCgnYXRvbS1iZWF1dGlmeScpLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxyXG5cclxuICAgICMgQmVhdXRpZmljYXRpb24gT3B0aW9uc1xyXG4gICAgYWRkSGVhZGVyKDIsIFwiQmVhdXRpZmljYXRpb24gb3B0aW9uc1wiKVxyXG4gICAgIyBHZXQgYWxsIG9wdGlvbnNcclxuICAgIGFsbE9wdGlvbnMgPSBiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JQYXRoKGZpbGVQYXRoLCBlZGl0b3IpXHJcbiAgICAjIFJlc29sdmUgb3B0aW9ucyB3aXRoIHByb21pc2VzXHJcbiAgICBQcm9taXNlLmFsbChhbGxPcHRpb25zKVxyXG4gICAgLnRoZW4oKGFsbE9wdGlvbnMpIC0+XHJcbiAgICAgICMgRXh0cmFjdCBvcHRpb25zXHJcbiAgICAgIFtcclxuICAgICAgICAgIGVkaXRvck9wdGlvbnNcclxuICAgICAgICAgIGNvbmZpZ09wdGlvbnNcclxuICAgICAgICAgIGhvbWVPcHRpb25zXHJcbiAgICAgICAgICBlZGl0b3JDb25maWdPcHRpb25zXHJcbiAgICAgIF0gPSBhbGxPcHRpb25zXHJcbiAgICAgIHByb2plY3RPcHRpb25zID0gYWxsT3B0aW9uc1s0Li5dXHJcblxyXG4gICAgICBwcmVUcmFuc2Zvcm1lZE9wdGlvbnMgPSBiZWF1dGlmaWVyLmdldE9wdGlvbnNGb3JMYW5ndWFnZShhbGxPcHRpb25zLCBsYW5ndWFnZSlcclxuXHJcbiAgICAgIGlmIHNlbGVjdGVkQmVhdXRpZmllclxyXG4gICAgICAgIGZpbmFsT3B0aW9ucyA9IGJlYXV0aWZpZXIudHJhbnNmb3JtT3B0aW9ucyhzZWxlY3RlZEJlYXV0aWZpZXIsIGxhbmd1YWdlLm5hbWUsIHByZVRyYW5zZm9ybWVkT3B0aW9ucylcclxuXHJcbiAgICAgICMgU2hvdyBvcHRpb25zXHJcbiAgICAgICMgYWRkSW5mbygnQWxsIE9wdGlvbnMnLCBcIlxcblwiICtcclxuICAgICAgIyBcIkFsbCBvcHRpb25zIGV4dHJhY3RlZCBmb3IgZmlsZVxcblwiICtcclxuICAgICAgIyBcImBgYGpzb25cXG4je0pTT04uc3RyaW5naWZ5KGFsbE9wdGlvbnMsIHVuZGVmaW5lZCwgNCl9XFxuYGBgXCIpXHJcbiAgICAgIGFkZEluZm8oJ0VkaXRvciBPcHRpb25zJywgXCJcXG5cIiArXHJcbiAgICAgIFwiT3B0aW9ucyBmcm9tIEF0b20gRWRpdG9yIHNldHRpbmdzXFxuXCIgK1xyXG4gICAgICBcImBgYGpzb25cXG4je0pTT04uc3RyaW5naWZ5KGVkaXRvck9wdGlvbnMsIHVuZGVmaW5lZCwgNCl9XFxuYGBgXCIpXHJcbiAgICAgIGFkZEluZm8oJ0NvbmZpZyBPcHRpb25zJywgXCJcXG5cIiArXHJcbiAgICAgIFwiT3B0aW9ucyBmcm9tIEF0b20gQmVhdXRpZnkgcGFja2FnZSBzZXR0aW5nc1xcblwiICtcclxuICAgICAgXCJgYGBqc29uXFxuI3tKU09OLnN0cmluZ2lmeShjb25maWdPcHRpb25zLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxyXG4gICAgICBhZGRJbmZvKCdIb21lIE9wdGlvbnMnLCBcIlxcblwiICtcclxuICAgICAgXCJPcHRpb25zIGZyb20gYCN7cGF0aC5yZXNvbHZlKGJlYXV0aWZpZXIuZ2V0VXNlckhvbWUoKSwgJy5qc2JlYXV0aWZ5cmMnKX1gXFxuXCIgK1xyXG4gICAgICBcImBgYGpzb25cXG4je0pTT04uc3RyaW5naWZ5KGhvbWVPcHRpb25zLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxyXG4gICAgICBhZGRJbmZvKCdFZGl0b3JDb25maWcgT3B0aW9ucycsIFwiXFxuXCIgK1xyXG4gICAgICBcIk9wdGlvbnMgZnJvbSBbRWRpdG9yQ29uZmlnXShodHRwOi8vZWRpdG9yY29uZmlnLm9yZy8pIGZpbGVcXG5cIiArXHJcbiAgICAgIFwiYGBganNvblxcbiN7SlNPTi5zdHJpbmdpZnkoZWRpdG9yQ29uZmlnT3B0aW9ucywgdW5kZWZpbmVkLCA0KX1cXG5gYGBcIilcclxuICAgICAgYWRkSW5mbygnUHJvamVjdCBPcHRpb25zJywgXCJcXG5cIiArXHJcbiAgICAgIFwiT3B0aW9ucyBmcm9tIGAuanNiZWF1dGlmeXJjYCBmaWxlcyBzdGFydGluZyBmcm9tIGRpcmVjdG9yeSBgI3twYXRoLmRpcm5hbWUoZmlsZVBhdGgpfWAgYW5kIGdvaW5nIHVwIHRvIHJvb3RcXG5cIiArXHJcbiAgICAgIFwiYGBganNvblxcbiN7SlNPTi5zdHJpbmdpZnkocHJvamVjdE9wdGlvbnMsIHVuZGVmaW5lZCwgNCl9XFxuYGBgXCIpXHJcbiAgICAgIGFkZEluZm8oJ1ByZS1UcmFuc2Zvcm1lZCBPcHRpb25zJywgXCJcXG5cIiArXHJcbiAgICAgIFwiQ29tYmluZWQgb3B0aW9ucyBiZWZvcmUgdHJhbnNmb3JtaW5nIHRoZW0gZ2l2ZW4gYSBiZWF1dGlmaWVyJ3Mgc3BlY2lmaWNhdGlvbnNcXG5cIiArXHJcbiAgICAgIFwiYGBganNvblxcbiN7SlNPTi5zdHJpbmdpZnkocHJlVHJhbnNmb3JtZWRPcHRpb25zLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxyXG4gICAgICBpZiBzZWxlY3RlZEJlYXV0aWZpZXJcclxuICAgICAgICBhZGRIZWFkZXIoMywgJ0ZpbmFsIE9wdGlvbnMnKVxyXG4gICAgICAgIGFkZEluZm8obnVsbCxcclxuICAgICAgICAgIFwiRmluYWwgY29tYmluZWQgYW5kIHRyYW5zZm9ybWVkIG9wdGlvbnMgdGhhdCBhcmUgdXNlZFxcblwiICtcclxuICAgICAgICAgIFwiYGBganNvblxcbiN7SlNPTi5zdHJpbmdpZnkoZmluYWxPcHRpb25zLCB1bmRlZmluZWQsIDQpfVxcbmBgYFwiKVxyXG5cclxuICAgICAgI1xyXG4gICAgICBsb2dzID0gXCJcIlxyXG4gICAgICBsb2dGaWxlUGF0aFJlZ2V4ID0gbmV3IFJlZ0V4cCgnXFxcXDogXFxcXFsoLiopXFxcXF0nKVxyXG4gICAgICBzdWJzY3JpcHRpb24gPSBsb2dnZXIub25Mb2dnaW5nKChtc2cpIC0+XHJcbiAgICAgICAgIyBjb25zb2xlLmxvZygnbG9nZ2luZycsIG1zZylcclxuICAgICAgICBzZXAgPSBwYXRoLnNlcFxyXG4gICAgICAgIGxvZ3MgKz0gbXNnLnJlcGxhY2UobG9nRmlsZVBhdGhSZWdleCwgKGEsYikgLT5cclxuICAgICAgICAgIHMgPSBiLnNwbGl0KHNlcClcclxuICAgICAgICAgIGkgPSBzLmluZGV4T2YoJ2F0b20tYmVhdXRpZnknKVxyXG4gICAgICAgICAgcCA9IHMuc2xpY2UoaSsyKS5qb2luKHNlcClcclxuICAgICAgICAgICMgY29uc29sZS5sb2coJ2xvZ2dpbmcnLCBhcmd1bWVudHMsIHMsIGksIHApXHJcbiAgICAgICAgICByZXR1cm4gJzogWycrcCsnXSdcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgICAgY2IgPSAocmVzdWx0KSAtPlxyXG4gICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcclxuICAgICAgICBhZGRIZWFkZXIoMiwgXCJSZXN1bHRzXCIpXHJcblxyXG4gICAgICAgICMgTG9nc1xyXG4gICAgICAgIGFkZEluZm8oJ0JlYXV0aWZpZWQgRmlsZSBDb250ZW50cycsIFwiXFxuYGBgI3tjb2RlQmxvY2tTeW50YXh9XFxuI3tyZXN1bHR9XFxuYGBgXCIpXHJcbiAgICAgICAgIyBEaWZmXHJcbiAgICAgICAgSnNEaWZmID0gcmVxdWlyZSgnZGlmZicpXHJcbiAgICAgICAgaWYgdHlwZW9mIHJlc3VsdCBpcyBcInN0cmluZ1wiXHJcbiAgICAgICAgICBkaWZmID0gSnNEaWZmLmNyZWF0ZVBhdGNoKGZpbGVQYXRoIG9yIFwiXCIsIHRleHQgb3IgXCJcIiwgXFxcclxuICAgICAgICAgICAgcmVzdWx0IG9yIFwiXCIsIFwib3JpZ2luYWxcIiwgXCJiZWF1dGlmaWVkXCIpXHJcbiAgICAgICAgICBhZGRJbmZvKCdPcmlnaW5hbCB2cy4gQmVhdXRpZmllZCBEaWZmJywgXCJcXG5gYGAje2NvZGVCbG9ja1N5bnRheH1cXG4je2RpZmZ9XFxuYGBgXCIpXHJcblxyXG4gICAgICAgIGFkZEhlYWRlcigzLCBcIkxvZ3NcIilcclxuICAgICAgICBhZGRJbmZvKG51bGwsIFwiYGBgXFxuI3tsb2dzfVxcbmBgYFwiKVxyXG5cclxuICAgICAgICAjIEJ1aWxkIFRhYmxlIG9mIENvbnRlbnRzXHJcbiAgICAgICAgdG9jID0gXCIjIyBUYWJsZSBPZiBDb250ZW50c1xcblwiXHJcbiAgICAgICAgZm9yIGhlYWRlciBpbiBoZWFkZXJzXHJcbiAgICAgICAgICAjIyNcclxuICAgICAgICAgIC0gSGVhZGluZyAxXHJcbiAgICAgICAgICAgIC0gSGVhZGluZyAxLjFcclxuICAgICAgICAgICMjI1xyXG4gICAgICAgICAgaW5kZW50ID0gXCIgIFwiICMgMiBzcGFjZXNcclxuICAgICAgICAgIGJ1bGxldCA9IFwiLVwiXHJcbiAgICAgICAgICBpbmRlbnROdW0gPSBoZWFkZXIubGV2ZWwgLSAyXHJcbiAgICAgICAgICBpZiBpbmRlbnROdW0gPj0gMFxyXG4gICAgICAgICAgICB0b2MgKz0gKFwiI3tBcnJheShpbmRlbnROdW0rMSkuam9pbihpbmRlbnQpfSN7YnVsbGV0fSBbI3toZWFkZXIudGl0bGV9XShcXCMje2xpbmtpZnlUaXRsZShoZWFkZXIudGl0bGUpfSlcXG5cIilcclxuICAgICAgICAjIFJlcGxhY2UgVEFCTEVPRkNPTlRFTlRTXHJcbiAgICAgICAgZGVidWdJbmZvID0gZGVidWdJbmZvLnJlcGxhY2UodG9jRWwsIHRvYylcclxuXHJcbiAgICAgICAgIyBTYXZlIHRvIG5ldyBUZXh0RWRpdG9yXHJcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpXHJcbiAgICAgICAgICAudGhlbigoZWRpdG9yKSAtPlxyXG4gICAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChkZWJ1Z0luZm8pXHJcbiAgICAgICAgICAgIGNvbmZpcm0oXCJcIlwiUGxlYXNlIGxvZ2luIHRvIEdpdEh1YiBhbmQgY3JlYXRlIGEgR2lzdCBuYW1lZCBcXFwiZGVidWcubWRcXFwiIChNYXJrZG93biBmaWxlKSB3aXRoIHlvdXIgZGVidWdnaW5nIGluZm9ybWF0aW9uLlxyXG4gICAgICAgICAgICBUaGVuIGFkZCBhIGxpbmsgdG8geW91ciBHaXN0IGluIHlvdXIgR2l0SHViIElzc3VlLlxyXG4gICAgICAgICAgICBUaGFuayB5b3UhXHJcblxyXG4gICAgICAgICAgICBHaXN0OiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9cclxuICAgICAgICAgICAgR2l0SHViIElzc3VlczogaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L2lzc3Vlc1xyXG4gICAgICAgICAgICBcIlwiXCIpXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICAuY2F0Y2goKGVycm9yKSAtPlxyXG4gICAgICAgICAgICBjb25maXJtKFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hlbiBjcmVhdGluZyB0aGUgR2lzdDogXCIrZXJyb3IubWVzc2FnZSlcclxuICAgICAgICAgIClcclxuICAgICAgdHJ5XHJcbiAgICAgICAgYmVhdXRpZmllci5iZWF1dGlmeSh0ZXh0LCBhbGxPcHRpb25zLCBncmFtbWFyTmFtZSwgZmlsZVBhdGgpXHJcbiAgICAgICAgLnRoZW4oY2IpXHJcbiAgICAgICAgLmNhdGNoKGNiKVxyXG4gICAgICBjYXRjaCBlXHJcbiAgICAgICAgcmV0dXJuIGNiKGUpXHJcbiAgICApXHJcbiAgICAuY2F0Y2goKGVycm9yKSAtPlxyXG4gICAgICBzdGFjayA9IGVycm9yLnN0YWNrXHJcbiAgICAgIGRldGFpbCA9IGVycm9yLmRlc2NyaXB0aW9uIG9yIGVycm9yLm1lc3NhZ2VcclxuICAgICAgYXRvbT8ubm90aWZpY2F0aW9ucz8uYWRkRXJyb3IoZXJyb3IubWVzc2FnZSwge1xyXG4gICAgICAgIHN0YWNrLCBkZXRhaWwsIGRpc21pc3NhYmxlIDogdHJ1ZVxyXG4gICAgICB9KVxyXG4gICAgKVxyXG4gIGNhdGNoIGVycm9yXHJcbiAgICBzdGFjayA9IGVycm9yLnN0YWNrXHJcbiAgICBkZXRhaWwgPSBlcnJvci5kZXNjcmlwdGlvbiBvciBlcnJvci5tZXNzYWdlXHJcbiAgICBhdG9tPy5ub3RpZmljYXRpb25zPy5hZGRFcnJvcihlcnJvci5tZXNzYWdlLCB7XHJcbiAgICAgIHN0YWNrLCBkZXRhaWwsIGRpc21pc3NhYmxlIDogdHJ1ZVxyXG4gICAgfSlcclxuXHJcbmhhbmRsZVNhdmVFdmVudCA9IC0+XHJcbiAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpIC0+XHJcbiAgICBwZW5kaW5nUGF0aHMgPSB7fVxyXG4gICAgYmVhdXRpZnlPblNhdmVIYW5kbGVyID0gKHtwYXRoOiBmaWxlUGF0aH0pIC0+XHJcbiAgICAgIGxvZ2dlci52ZXJib3NlKCdTaG91bGQgYmVhdXRpZnkgb24gdGhpcyBzYXZlPycpXHJcbiAgICAgIGlmIHBlbmRpbmdQYXRoc1tmaWxlUGF0aF1cclxuICAgICAgICBsb2dnZXIudmVyYm9zZShcIkVkaXRvciB3aXRoIGZpbGUgcGF0aCAje2ZpbGVQYXRofSBhbHJlYWR5IGJlYXV0aWZpZWQhXCIpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxyXG4gICAgICBwYXRoID89IHJlcXVpcmUoJ3BhdGgnKVxyXG4gICAgICAjIEdldCBHcmFtbWFyXHJcbiAgICAgIGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWVcclxuICAgICAgIyBHZXQgZmlsZSBleHRlbnNpb25cclxuICAgICAgZmlsZUV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShmaWxlUGF0aClcclxuICAgICAgIyBSZW1vdmUgcHJlZml4IFwiLlwiIChwZXJpb2QpIGluIGZpbGVFeHRlbnNpb25cclxuICAgICAgZmlsZUV4dGVuc2lvbiA9IGZpbGVFeHRlbnNpb24uc3Vic3RyKDEpXHJcbiAgICAgICMgR2V0IGxhbmd1YWdlXHJcbiAgICAgIGxhbmd1YWdlcyA9IGJlYXV0aWZpZXIubGFuZ3VhZ2VzLmdldExhbmd1YWdlcyh7Z3JhbW1hciwgZXh0ZW5zaW9uOiBmaWxlRXh0ZW5zaW9ufSlcclxuICAgICAgaWYgbGFuZ3VhZ2VzLmxlbmd0aCA8IDFcclxuICAgICAgICByZXR1cm5cclxuICAgICAgIyBUT0RPOiBzZWxlY3QgYXBwcm9wcmlhdGUgbGFuZ3VhZ2VcclxuICAgICAgbGFuZ3VhZ2UgPSBsYW5ndWFnZXNbMF1cclxuICAgICAgIyBHZXQgbGFuZ3VhZ2UgY29uZmlnXHJcbiAgICAgIGtleSA9IFwiYXRvbS1iZWF1dGlmeS4je2xhbmd1YWdlLm5hbWVzcGFjZX0uYmVhdXRpZnlfb25fc2F2ZVwiXHJcbiAgICAgIGJlYXV0aWZ5T25TYXZlID0gYXRvbS5jb25maWcuZ2V0KGtleSlcclxuICAgICAgbG9nZ2VyLnZlcmJvc2UoJ3NhdmUgZWRpdG9yIHBvc2l0aW9ucycsIGtleSwgYmVhdXRpZnlPblNhdmUpXHJcbiAgICAgIGlmIGJlYXV0aWZ5T25TYXZlXHJcbiAgICAgICAgbG9nZ2VyLnZlcmJvc2UoJ0JlYXV0aWZ5aW5nIGZpbGUnLCBmaWxlUGF0aClcclxuICAgICAgICBiZWF1dGlmeSh7ZWRpdG9yLCBvblNhdmU6IHRydWV9KVxyXG4gICAgICAgIC50aGVuKCgpIC0+XHJcbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSgnRG9uZSBiZWF1dGlmeWluZyBmaWxlJywgZmlsZVBhdGgpXHJcbiAgICAgICAgICBpZiBlZGl0b3IuaXNBbGl2ZSgpIGlzIHRydWVcclxuICAgICAgICAgICAgbG9nZ2VyLnZlcmJvc2UoJ1NhdmluZyBUZXh0RWRpdG9yLi4uJylcclxuICAgICAgICAgICAgIyBTdG9yZSB0aGUgZmlsZVBhdGggdG8gcHJldmVudCBpbmZpbml0ZSBsb29waW5nXHJcbiAgICAgICAgICAgICMgV2hlbiBXaGl0ZXNwYWNlIHBhY2thZ2UgaGFzIG9wdGlvbiBcIkVuc3VyZSBTaW5nbGUgVHJhaWxpbmcgTmV3bGluZVwiIGVuYWJsZWRcclxuICAgICAgICAgICAgIyBJdCB3aWxsIGFkZCBhIG5ld2xpbmUgYW5kIGtlZXAgdGhlIGZpbGUgZnJvbSBjb252ZXJnaW5nIG9uIGEgYmVhdXRpZmllZCBmb3JtXHJcbiAgICAgICAgICAgICMgYW5kIHNhdmluZyB3aXRob3V0IGVtaXR0aW5nIG9uRGlkU2F2ZSBldmVudCwgYmVjYXVzZSB0aGVyZSB3ZXJlIG5vIGNoYW5nZXMuXHJcbiAgICAgICAgICAgIHBlbmRpbmdQYXRoc1tmaWxlUGF0aF0gPSB0cnVlXHJcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZShlZGl0b3Iuc2F2ZSgpKS50aGVuKCgpIC0+XHJcbiAgICAgICAgICAgICAgZGVsZXRlIHBlbmRpbmdQYXRoc1tmaWxlUGF0aF1cclxuICAgICAgICAgICAgICBsb2dnZXIudmVyYm9zZSgnU2F2ZWQgVGV4dEVkaXRvci4nKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpIC0+XHJcbiAgICAgICAgICByZXR1cm4gc2hvd0Vycm9yKGVycm9yKVxyXG4gICAgICAgIClcclxuICAgIGRpc3Bvc2FibGUgPSBlZGl0b3Iub25EaWRTYXZlKCh7cGF0aCA6IGZpbGVQYXRofSkgLT5cclxuICAgICAgIyBUT0RPOiBJbXBsZW1lbnQgZGVib3VuY2luZ1xyXG4gICAgICBiZWF1dGlmeU9uU2F2ZUhhbmRsZXIoe3BhdGg6IGZpbGVQYXRofSlcclxuICAgIClcclxuICAgIHBsdWdpbi5zdWJzY3JpcHRpb25zLmFkZCBkaXNwb3NhYmxlXHJcblxyXG5nZXRVbnN1cHBvcnRlZE9wdGlvbnMgPSAtPlxyXG4gIHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWJlYXV0aWZ5JylcclxuICBzY2hlbWEgPSBhdG9tLmNvbmZpZy5nZXRTY2hlbWEoJ2F0b20tYmVhdXRpZnknKVxyXG4gIHVuc3VwcG9ydGVkT3B0aW9ucyA9IF8uZmlsdGVyKF8ua2V5cyhzZXR0aW5ncyksIChrZXkpIC0+XHJcbiAgICAjIHJldHVybiBhdG9tLmNvbmZpZy5nZXRTY2hlbWEoXCJhdG9tLWJlYXV0aWZ5LiR7a2V5fVwiKS50eXBlXHJcbiAgICAjIHJldHVybiB0eXBlb2Ygc2V0dGluZ3Nba2V5XVxyXG4gICAgc2NoZW1hLnByb3BlcnRpZXNba2V5XSBpcyB1bmRlZmluZWRcclxuICApXHJcbiAgcmV0dXJuIHVuc3VwcG9ydGVkT3B0aW9uc1xyXG5cclxucGx1Z2luLmNoZWNrVW5zdXBwb3J0ZWRPcHRpb25zID0gLT5cclxuICB1bnN1cHBvcnRlZE9wdGlvbnMgPSBnZXRVbnN1cHBvcnRlZE9wdGlvbnMoKVxyXG4gIGlmIHVuc3VwcG9ydGVkT3B0aW9ucy5sZW5ndGggaXNudCAwXHJcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIlBsZWFzZSBydW4gQXRvbSBjb21tYW5kICdBdG9tLUJlYXV0aWZ5OiBNaWdyYXRlIFNldHRpbmdzJy5cIiwge1xyXG4gICAgICBkZXRhaWwgOiBcIllvdSBjYW4gb3BlbiB0aGUgQXRvbSBjb21tYW5kIHBhbGV0dGUgd2l0aCBgY21kLXNoaWZ0LXBgIChPU1gpIG9yIGBjdHJsLXNoaWZ0LXBgIChMaW51eC9XaW5kb3dzKSBpbiBBdG9tLiBZb3UgaGF2ZSB1bnN1cHBvcnRlZCBvcHRpb25zOiAje3Vuc3VwcG9ydGVkT3B0aW9ucy5qb2luKCcsICcpfVwiLFxyXG4gICAgICBkaXNtaXNzYWJsZSA6IHRydWVcclxuICAgIH0pXHJcblxyXG5wbHVnaW4ubWlncmF0ZVNldHRpbmdzID0gLT5cclxuICB1bnN1cHBvcnRlZE9wdGlvbnMgPSBnZXRVbnN1cHBvcnRlZE9wdGlvbnMoKVxyXG4gIG5hbWVzcGFjZXMgPSBiZWF1dGlmaWVyLmxhbmd1YWdlcy5uYW1lc3BhY2VzXHJcbiAgIyBjb25zb2xlLmxvZygnbWlncmF0ZS1zZXR0aW5ncycsIHNjaGVtYSwgbmFtZXNwYWNlcywgdW5zdXBwb3J0ZWRPcHRpb25zKVxyXG4gIGlmIHVuc3VwcG9ydGVkT3B0aW9ucy5sZW5ndGggaXMgMFxyXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoXCJObyBvcHRpb25zIHRvIG1pZ3JhdGUuXCIpXHJcbiAgZWxzZVxyXG4gICAgcmV4ID0gbmV3IFJlZ0V4cChcIigje25hbWVzcGFjZXMuam9pbignfCcpfSlfKC4qKVwiKVxyXG4gICAgcmVuYW1lID0gXy50b1BhaXJzKF8uemlwT2JqZWN0KHVuc3VwcG9ydGVkT3B0aW9ucywgXy5tYXAodW5zdXBwb3J0ZWRPcHRpb25zLCAoa2V5KSAtPlxyXG4gICAgICBtID0ga2V5Lm1hdGNoKHJleClcclxuICAgICAgaWYgbSBpcyBudWxsXHJcbiAgICAgICAgIyBEaWQgbm90IG1hdGNoXHJcbiAgICAgICAgIyBQdXQgaW50byBnZW5lcmFsXHJcbiAgICAgICAgcmV0dXJuIFwiZ2VuZXJhbC4je2tleX1cIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuIFwiI3ttWzFdfS4je21bMl19XCJcclxuICAgICkpKVxyXG4gICAgIyBjb25zb2xlLmxvZygncmVuYW1lJywgcmVuYW1lKVxyXG4gICAgIyBsb2dnZXIudmVyYm9zZSgncmVuYW1lJywgcmVuYW1lKVxyXG5cclxuICAgICMgTW92ZSBhbGwgb3B0aW9uIHZhbHVlcyB0byByZW5hbWVkIGtleVxyXG4gICAgXy5lYWNoKHJlbmFtZSwgKFtrZXksIG5ld0tleV0pIC0+XHJcbiAgICAgICMgQ29weSB0byBuZXcga2V5XHJcbiAgICAgIHZhbCA9IGF0b20uY29uZmlnLmdldChcImF0b20tYmVhdXRpZnkuI3trZXl9XCIpXHJcbiAgICAgICMgY29uc29sZS5sb2coJ3JlbmFtZScsIGtleSwgbmV3S2V5LCB2YWwpXHJcbiAgICAgIGF0b20uY29uZmlnLnNldChcImF0b20tYmVhdXRpZnkuI3tuZXdLZXl9XCIsIHZhbClcclxuICAgICAgIyBEZWxldGUgb2xkIGtleVxyXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJhdG9tLWJlYXV0aWZ5LiN7a2V5fVwiLCB1bmRlZmluZWQpXHJcbiAgICApXHJcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIlN1Y2Nlc3NmdWxseSBtaWdyYXRlZCBvcHRpb25zOiAje3Vuc3VwcG9ydGVkT3B0aW9ucy5qb2luKCcsICcpfVwiKVxyXG5cclxucGx1Z2luLmFkZExhbmd1YWdlQ29tbWFuZHMgPSAtPlxyXG4gIGxhbmd1YWdlcyA9IGJlYXV0aWZpZXIubGFuZ3VhZ2VzLmxhbmd1YWdlc1xyXG4gIGxvZ2dlci52ZXJib3NlKFwibGFuZ3VhZ2VzXCIsIGxhbmd1YWdlcylcclxuICBmb3IgbGFuZ3VhZ2UgaW4gbGFuZ3VhZ2VzXHJcbiAgICAoKGxhbmd1YWdlKSA9PlxyXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktbGFuZ3VhZ2UtI3tsYW5ndWFnZS5uYW1lLnRvTG93ZXJDYXNlKCl9XCIsICgpIC0+XHJcbiAgICAgICAgbG9nZ2VyLnZlcmJvc2UoXCJCZWF1dGlmeWluZyBsYW5ndWFnZVwiLCBsYW5ndWFnZSlcclxuICAgICAgICBiZWF1dGlmeSh7IGxhbmd1YWdlIH0pXHJcbiAgICAgIClcclxuICAgICkobGFuZ3VhZ2UpXHJcblxyXG5wbHVnaW4uY29uZmlnID0gXy5tZXJnZShyZXF1aXJlKCcuL2NvbmZpZycpLCBkZWZhdWx0TGFuZ3VhZ2VPcHRpb25zKVxyXG5wbHVnaW4uYWN0aXZhdGUgPSAtPlxyXG4gIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcclxuICBAc3Vic2NyaXB0aW9ucy5hZGQgaGFuZGxlU2F2ZUV2ZW50KClcclxuICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJhdG9tLXdvcmtzcGFjZVwiLCBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktZWRpdG9yXCIsIGJlYXV0aWZ5XHJcbiAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIiwgXCJhdG9tLWJlYXV0aWZ5OmhlbHAtZGVidWctZWRpdG9yXCIsIGRlYnVnXHJcbiAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiLnRyZWUtdmlldyAuZmlsZSAubmFtZVwiLCBcImF0b20tYmVhdXRpZnk6YmVhdXRpZnktZmlsZVwiLCBiZWF1dGlmeUZpbGVcclxuICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCIudHJlZS12aWV3IC5kaXJlY3RvcnkgLm5hbWVcIiwgXCJhdG9tLWJlYXV0aWZ5OmJlYXV0aWZ5LWRpcmVjdG9yeVwiLCBiZWF1dGlmeURpcmVjdG9yeVxyXG4gIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBcImF0b20td29ya3NwYWNlXCIsIFwiYXRvbS1iZWF1dGlmeTptaWdyYXRlLXNldHRpbmdzXCIsIHBsdWdpbi5taWdyYXRlU2V0dGluZ3NcclxuICBAYWRkTGFuZ3VhZ2VDb21tYW5kcygpXHJcblxyXG5wbHVnaW4uZGVhY3RpdmF0ZSA9IC0+XHJcbiAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXHJcbiJdfQ==
