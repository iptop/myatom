(function() {
  var CompositeDisposable, EmacsCursor, EmacsEditor, KillRing, Mark, State,
    slice = [].slice;

  CompositeDisposable = require('atom').CompositeDisposable;

  EmacsCursor = require('./emacs-cursor');

  KillRing = require('./kill-ring');

  Mark = require('./mark');

  State = require('./state');

  module.exports = EmacsEditor = (function() {
    var capitalize, downcase, upcase;

    EmacsEditor["for"] = function(editor) {
      return editor._atomicEmacs != null ? editor._atomicEmacs : editor._atomicEmacs = new EmacsEditor(editor);
    };

    function EmacsEditor(editor1) {
      this.editor = editor1;
      this.disposable = new CompositeDisposable;
      this.disposable.add(this.editor.onDidRemoveCursor((function(_this) {
        return function() {
          var cursors;
          cursors = _this.editor.getCursors();
          if (cursors.length === 1) {
            return EmacsCursor["for"](cursors[0]).clearLocalKillRing();
          }
        };
      })(this)));
      this.disposable.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
    }

    EmacsEditor.prototype.destroy = function() {
      var cursor, i, len, ref;
      ref = this.getEmacsCursors();
      for (i = 0, len = ref.length; i < len; i++) {
        cursor = ref[i];
        cursor.destroy();
      }
      return this.disposable.dispose();
    };

    EmacsEditor.prototype.getEmacsCursors = function() {
      var c, i, len, ref, results;
      ref = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        c = ref[i];
        results.push(EmacsCursor["for"](c));
      }
      return results;
    };

    EmacsEditor.prototype.moveEmacsCursors = function(callback) {
      return this.editor.moveCursors(function(cursor) {
        if (cursor.destroyed === true) {
          return;
        }
        return callback(EmacsCursor["for"](cursor), cursor);
      });
    };


    /*
    Section: Navigation
     */

    EmacsEditor.prototype.backwardChar = function() {
      return this.editor.moveCursors(function(cursor) {
        return cursor.moveLeft();
      });
    };

    EmacsEditor.prototype.forwardChar = function() {
      return this.editor.moveCursors(function(cursor) {
        return cursor.moveRight();
      });
    };

    EmacsEditor.prototype.backwardWord = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        emacsCursor.skipNonWordCharactersBackward();
        return emacsCursor.skipWordCharactersBackward();
      });
    };

    EmacsEditor.prototype.forwardWord = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        emacsCursor.skipNonWordCharactersForward();
        return emacsCursor.skipWordCharactersForward();
      });
    };

    EmacsEditor.prototype.backwardSexp = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        return emacsCursor.skipSexpBackward();
      });
    };

    EmacsEditor.prototype.forwardSexp = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        return emacsCursor.skipSexpForward();
      });
    };

    EmacsEditor.prototype.backwardList = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        return emacsCursor.skipListBackward();
      });
    };

    EmacsEditor.prototype.forwardList = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        return emacsCursor.skipListForward();
      });
    };

    EmacsEditor.prototype.previousLine = function() {
      return this.editor.moveCursors(function(cursor) {
        return cursor.moveUp();
      });
    };

    EmacsEditor.prototype.nextLine = function() {
      return this.editor.moveCursors(function(cursor) {
        return cursor.moveDown();
      });
    };

    EmacsEditor.prototype.backwardParagraph = function() {
      return this.moveEmacsCursors(function(emacsCursor, cursor) {
        var position;
        position = cursor.getBufferPosition();
        if (position.row !== 0) {
          cursor.setBufferPosition([position.row - 1, 0]);
        }
        return emacsCursor.goToMatchStartBackward(/^\s*$/) || cursor.moveToTop();
      });
    };

    EmacsEditor.prototype.forwardParagraph = function() {
      var lastRow;
      lastRow = this.editor.getLastBufferRow();
      return this.moveEmacsCursors(function(emacsCursor, cursor) {
        var position;
        position = cursor.getBufferPosition();
        if (position.row !== lastRow) {
          cursor.setBufferPosition([position.row + 1, 0]);
        }
        return emacsCursor.goToMatchStartForward(/^\s*$/) || cursor.moveToBottom();
      });
    };

    EmacsEditor.prototype.backToIndentation = function() {
      return this.editor.moveCursors((function(_this) {
        return function(cursor) {
          var line, position, targetColumn;
          console.log((new Date()).getTime());
          position = cursor.getBufferPosition();
          line = _this.editor.lineTextForBufferRow(position.row);
          targetColumn = line.search(/\S/);
          if (targetColumn === -1) {
            targetColumn = line.length;
          }
          if (position.column !== targetColumn) {
            return cursor.setBufferPosition([position.row, targetColumn]);
          }
        };
      })(this));
    };


    /*
    Section: Killing & Yanking
     */

    EmacsEditor.prototype.backwardKillWord = function() {
      var method;
      this._pullFromClipboard();
      method = State.killing ? 'prepend' : 'push';
      this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor, cursor) {
            return emacsCursor.backwardKillWord(method);
          });
        };
      })(this));
      this._updateGlobalKillRing(method);
      return State.killed();
    };

    EmacsEditor.prototype.killWord = function() {
      var method;
      this._pullFromClipboard();
      method = State.killing ? 'append' : 'push';
      this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            return emacsCursor.killWord(method);
          });
        };
      })(this));
      this._updateGlobalKillRing(method);
      return State.killed();
    };

    EmacsEditor.prototype.killLine = function() {
      var method;
      this._pullFromClipboard();
      method = State.killing ? 'append' : 'push';
      this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            return emacsCursor.killLine(method);
          });
        };
      })(this));
      this._updateGlobalKillRing(method);
      return State.killed();
    };

    EmacsEditor.prototype.killRegion = function() {
      var method;
      this._pullFromClipboard();
      method = State.killing ? 'append' : 'push';
      this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            return emacsCursor.killRegion(method);
          });
        };
      })(this));
      this._updateGlobalKillRing(method);
      return State.killed();
    };

    EmacsEditor.prototype.copyRegionAsKill = function() {
      var method;
      this._pullFromClipboard();
      method = State.killing ? 'append' : 'push';
      this.editor.transact((function(_this) {
        return function() {
          var emacsCursor, i, len, ref, results, selection;
          ref = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            selection = ref[i];
            emacsCursor = EmacsCursor["for"](selection.cursor);
            emacsCursor.killRing()[method](selection.getText());
            emacsCursor.killRing().getCurrentEntry();
            results.push(emacsCursor.mark().deactivate());
          }
          return results;
        };
      })(this));
      return this._updateGlobalKillRing(method);
    };

    EmacsEditor.prototype.yank = function() {
      this._pullFromClipboard();
      this.editor.transact((function(_this) {
        return function() {
          var emacsCursor, i, len, ref, results;
          ref = _this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            emacsCursor = ref[i];
            results.push(emacsCursor.yank());
          }
          return results;
        };
      })(this));
      return State.yanked();
    };

    EmacsEditor.prototype.yankPop = function() {
      if (!State.yanking) {
        return;
      }
      this._pullFromClipboard();
      this.editor.transact((function(_this) {
        return function() {
          var emacsCursor, i, len, ref, results;
          ref = _this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            emacsCursor = ref[i];
            results.push(emacsCursor.rotateYank(-1));
          }
          return results;
        };
      })(this));
      return State.yanked();
    };

    EmacsEditor.prototype.yankShift = function() {
      if (!State.yanking) {
        return;
      }
      this._pullFromClipboard();
      this.editor.transact((function(_this) {
        return function() {
          var emacsCursor, i, len, ref, results;
          ref = _this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            emacsCursor = ref[i];
            results.push(emacsCursor.rotateYank(1));
          }
          return results;
        };
      })(this));
      return State.yanked();
    };

    EmacsEditor.prototype._pushToClipboard = function() {
      if (atom.config.get("atomic-emacs.killToClipboard")) {
        return KillRing.pushToClipboard();
      }
    };

    EmacsEditor.prototype._pullFromClipboard = function() {
      var c, killRings;
      if (atom.config.get("atomic-emacs.yankFromClipboard")) {
        killRings = (function() {
          var i, len, ref, results;
          ref = this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            c = ref[i];
            results.push(c.killRing());
          }
          return results;
        }).call(this);
        return KillRing.pullFromClipboard(killRings);
      }
    };

    EmacsEditor.prototype._updateGlobalKillRing = function(method) {
      var c, kills;
      if (this.editor.hasMultipleCursors()) {
        kills = (function() {
          var i, len, ref, results;
          ref = this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            c = ref[i];
            results.push(c.killRing().getCurrentEntry());
          }
          return results;
        }).call(this);
        if (method !== 'push') {
          method = 'replace';
        }
        KillRing.global[method](kills.join('\n') + '\n');
      }
      return this._pushToClipboard();
    };


    /*
    Section: Editing
     */

    EmacsEditor.prototype.deleteHorizontalSpace = function() {
      return this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            var range;
            range = emacsCursor.horizontalSpaceRange();
            return _this.editor.setTextInBufferRange(range, '');
          });
        };
      })(this));
    };

    EmacsEditor.prototype.deleteIndentation = function() {
      if (!this.editor) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          _this.editor.moveUp();
          return _this.editor.joinLines();
        };
      })(this));
    };

    EmacsEditor.prototype.openLine = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var emacsCursor, i, len, ref, results;
          ref = _this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            emacsCursor = ref[i];
            results.push(emacsCursor.insertAfter("\n"));
          }
          return results;
        };
      })(this));
    };

    EmacsEditor.prototype.justOneSpace = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var emacsCursor, i, len, range, ref, results;
          ref = _this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            emacsCursor = ref[i];
            range = emacsCursor.horizontalSpaceRange();
            results.push(_this.editor.setTextInBufferRange(range, ' '));
          }
          return results;
        };
      })(this));
    };

    EmacsEditor.prototype.deleteBlankLines = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var emacsCursor, i, len, ref, results;
          ref = _this.getEmacsCursors();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            emacsCursor = ref[i];
            results.push(emacsCursor.deleteBlankLines());
          }
          return results;
        };
      })(this));
    };

    EmacsEditor.prototype.transposeChars = function() {
      return this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            return emacsCursor.transposeChars();
          });
        };
      })(this));
    };

    EmacsEditor.prototype.transposeWords = function() {
      return this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            return emacsCursor.transposeWords();
          });
        };
      })(this));
    };

    EmacsEditor.prototype.transposeLines = function() {
      return this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            return emacsCursor.transposeLines();
          });
        };
      })(this));
    };

    EmacsEditor.prototype.transposeSexps = function() {
      return this.editor.transact((function(_this) {
        return function() {
          return _this.moveEmacsCursors(function(emacsCursor) {
            return emacsCursor.transposeSexps();
          });
        };
      })(this));
    };

    downcase = function(s) {
      return s.toLowerCase();
    };

    upcase = function(s) {
      return s.toUpperCase();
    };

    capitalize = function(s) {
      return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
    };

    EmacsEditor.prototype.downcaseWordOrRegion = function() {
      return this._transformWordOrRegion(downcase);
    };

    EmacsEditor.prototype.upcaseWordOrRegion = function() {
      return this._transformWordOrRegion(upcase);
    };

    EmacsEditor.prototype.capitalizeWordOrRegion = function() {
      return this._transformWordOrRegion(capitalize, {
        wordAtATime: true
      });
    };

    EmacsEditor.prototype._transformWordOrRegion = function(transformWord, arg) {
      var wordAtATime;
      wordAtATime = (arg != null ? arg : {}).wordAtATime;
      return this.editor.transact((function(_this) {
        return function() {
          var cursor, i, len, ref;
          if (_this.editor.getSelections().filter(function(s) {
            return !s.isEmpty();
          }).length > 0) {
            return _this.editor.mutateSelectedText(function(selection) {
              var range;
              range = selection.getBufferRange();
              if (wordAtATime) {
                return _this.editor.scanInBufferRange(/\w+/g, range, function(hit) {
                  return hit.replace(transformWord(hit.matchText));
                });
              } else {
                return _this.editor.setTextInBufferRange(range, transformWord(selection.getText()));
              }
            });
          } else {
            ref = _this.editor.getCursors();
            for (i = 0, len = ref.length; i < len; i++) {
              cursor = ref[i];
              cursor.emitter.__track = true;
            }
            return _this.moveEmacsCursors(function(emacsCursor) {
              return emacsCursor.transformWord(transformWord);
            });
          }
        };
      })(this));
    };


    /*
    Section: Marking & Selecting
     */

    EmacsEditor.prototype.setMark = function() {
      var emacsCursor, i, len, ref, results;
      ref = this.getEmacsCursors();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        emacsCursor = ref[i];
        results.push(emacsCursor.mark().set().activate());
      }
      return results;
    };

    EmacsEditor.prototype.markSexp = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        return emacsCursor.markSexp();
      });
    };

    EmacsEditor.prototype.markWholeBuffer = function() {
      var c, emacsCursor, first, i, len, ref, rest;
      ref = this.editor.getCursors(), first = ref[0], rest = 2 <= ref.length ? slice.call(ref, 1) : [];
      for (i = 0, len = rest.length; i < len; i++) {
        c = rest[i];
        c.destroy();
      }
      emacsCursor = EmacsCursor["for"](first);
      first.moveToBottom();
      emacsCursor.mark().set().activate();
      return first.moveToTop();
    };

    EmacsEditor.prototype.exchangePointAndMark = function() {
      return this.moveEmacsCursors(function(emacsCursor) {
        return emacsCursor.mark().exchange();
      });
    };


    /*
    Section: UI
     */

    EmacsEditor.prototype.recenterTopBottom = function() {
      var c, maxOffset, maxRow, minOffset, minRow, view;
      if (!this.editor) {
        return;
      }
      view = atom.views.getView(this.editor);
      minRow = Math.min.apply(Math, (function() {
        var i, len, ref, results;
        ref = this.editor.getCursors();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          c = ref[i];
          results.push(c.getBufferRow());
        }
        return results;
      }).call(this));
      maxRow = Math.max.apply(Math, (function() {
        var i, len, ref, results;
        ref = this.editor.getCursors();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          c = ref[i];
          results.push(c.getBufferRow());
        }
        return results;
      }).call(this));
      minOffset = view.pixelPositionForBufferPosition([minRow, 0]);
      maxOffset = view.pixelPositionForBufferPosition([maxRow, 0]);
      switch (State.recenters) {
        case 0:
          view.setScrollTop((minOffset.top + maxOffset.top - view.getHeight()) / 2);
          break;
        case 1:
          view.setScrollTop(minOffset.top - 2 * this.editor.getLineHeightInPixels());
          break;
        case 2:
          view.setScrollTop(maxOffset.top + 3 * this.editor.getLineHeightInPixels() - view.getHeight());
      }
      return State.recentered();
    };

    EmacsEditor.prototype.scrollUp = function() {
      var currentRow, firstRow, lastRow, rowCount, visibleRowRange;
      if ((visibleRowRange = this.editor.getVisibleRowRange())) {
        if (!visibleRowRange.every((function(_this) {
          return function(e) {
            return !Number.isNaN(e);
          };
        })(this))) {
          return;
        }
        firstRow = visibleRowRange[0], lastRow = visibleRowRange[1];
        currentRow = this.editor.cursors[0].getBufferRow();
        rowCount = (lastRow - firstRow) - 2;
        return this.editor.moveDown(rowCount);
      }
    };

    EmacsEditor.prototype.scrollDown = function() {
      var currentRow, firstRow, lastRow, rowCount, visibleRowRange;
      if ((visibleRowRange = this.editor.getVisibleRowRange())) {
        if (!visibleRowRange.every((function(_this) {
          return function(e) {
            return !Number.isNaN(e);
          };
        })(this))) {
          return;
        }
        firstRow = visibleRowRange[0], lastRow = visibleRowRange[1];
        currentRow = this.editor.cursors[0].getBufferRow();
        rowCount = (lastRow - firstRow) - 2;
        return this.editor.moveUp(rowCount);
      }
    };


    /*
    Section: Other
     */

    EmacsEditor.prototype.keyboardQuit = function() {
      var emacsCursor, i, len, ref, results;
      ref = this.getEmacsCursors();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        emacsCursor = ref[i];
        results.push(emacsCursor.mark().deactivate());
      }
      return results;
    };

    return EmacsEditor;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2F0b21pYy1lbWFjcy9saWIvZW1hY3MtZWRpdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0VBQUE7SUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLFFBQUE7O0lBQUEsV0FBQyxFQUFBLEdBQUEsRUFBRCxHQUFNLFNBQUMsTUFBRDsyQ0FDSixNQUFNLENBQUMsZUFBUCxNQUFNLENBQUMsZUFBb0IsSUFBQSxXQUFBLENBQVksTUFBWjtJQUR2Qjs7SUFHTyxxQkFBQyxPQUFEO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFDWixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUk7TUFDbEIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBMEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ3hDLGNBQUE7VUFBQSxPQUFBLEdBQVUsS0FBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUE7VUFDVixJQUFHLE9BQU8sQ0FBQyxNQUFSLEtBQWtCLENBQXJCO21CQUNFLFdBQVcsRUFBQyxHQUFELEVBQVgsQ0FBZ0IsT0FBUSxDQUFBLENBQUEsQ0FBeEIsQ0FBMkIsQ0FBQyxrQkFBNUIsQ0FBQSxFQURGOztRQUZ3QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUIsQ0FBaEI7TUFJQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsSUFBQyxD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LFFBQVIsQ0FBaUIsUUFBakIsRUFQRjs7SUFEUTs7MEJBVVYsVUFBQSxHQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsSUFBRyxDQUFDLGVBQUEsR0FBa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBLENBQW5CLENBQUg7UUFFRSxJQUFBLENBQWMsZUFBZSxDQUFDLEtBQWhCLENBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDttQkFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFQLENBQWEsQ0FBYjtVQUFSO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixDQUFkO0FBQUEsaUJBQUE7O1FBRUMsNkJBQUQsRUFBVTtRQUNWLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUFuQixDQUFBO1FBQ2IsUUFBQSxHQUFXLENBQUMsT0FBQSxHQUFVLFFBQVgsQ0FBQSxHQUF1QjtlQUNsQyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxRQUFmLEVBUEY7O0lBRFU7OztBQVVaOzs7OzBCQUlBLFlBQUEsR0FBYyxTQUFBO0FBQ1osVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0UsV0FBVyxDQUFDLElBQVosQ0FBQSxDQUFrQixDQUFDLFVBQW5CLENBQUE7QUFERjs7SUFEWTs7Ozs7QUFyV2hCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkVtYWNzQ3Vyc29yID0gcmVxdWlyZSAnLi9lbWFjcy1jdXJzb3InXG5LaWxsUmluZyA9IHJlcXVpcmUgJy4va2lsbC1yaW5nJ1xuTWFyayA9IHJlcXVpcmUgJy4vbWFyaydcblN0YXRlID0gcmVxdWlyZSAnLi9zdGF0ZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRW1hY3NFZGl0b3JcbiAgQGZvcjogKGVkaXRvcikgLT5cbiAgICBlZGl0b3IuX2F0b21pY0VtYWNzID89IG5ldyBFbWFjc0VkaXRvcihlZGl0b3IpXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yKSAtPlxuICAgIEBkaXNwb3NhYmxlID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZS5hZGQgQGVkaXRvci5vbkRpZFJlbW92ZUN1cnNvciA9PlxuICAgICAgY3Vyc29ycyA9IEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBpZiBjdXJzb3JzLmxlbmd0aCA9PSAxXG4gICAgICAgIEVtYWNzQ3Vyc29yLmZvcihjdXJzb3JzWzBdKS5jbGVhckxvY2FsS2lsbFJpbmcoKVxuICAgIEBkaXNwb3NhYmxlLmFkZCBAZWRpdG9yLm9uRGlkRGVzdHJveSA9PlxuICAgICAgQGRlc3Ryb3koKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgIyBOZWl0aGVyIGN1cnNvci5kaWQtZGVzdHJveSBub3IgVGV4dEVkaXRvci5kaWQtcmVtb3ZlLWN1cnNvciBzZWVtcyB0byBmaXJlXG4gICAgIyB3aGVuIHRoZSBlZGl0b3IgaXMgZGVzdHJveWVkLiAoQXRvbSBidWc/KSBTbyB3ZSBkZXN0cm95IEVtYWNzQ3Vyc29ycyBoZXJlLlxuICAgIGZvciBjdXJzb3IgaW4gQGdldEVtYWNzQ3Vyc29ycygpXG4gICAgICBjdXJzb3IuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgZ2V0RW1hY3NDdXJzb3JzOiAoKSAtPlxuICAgIEVtYWNzQ3Vyc29yLmZvcihjKSBmb3IgYyBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuXG4gIG1vdmVFbWFjc0N1cnNvcnM6IChjYWxsYmFjaykgLT5cbiAgICBAZWRpdG9yLm1vdmVDdXJzb3JzIChjdXJzb3IpIC0+XG4gICAgICAjIEF0b20gYnVnOiBpZiBtb3Zpbmcgb25lIGN1cnNvciBkZXN0cm95cyBhbm90aGVyLCB0aGUgZGVzdHJveWVkIG9uZSdzXG4gICAgICAjIGVtaXR0ZXIgaXMgZGlzcG9zZWQsIGJ1dCBjdXJzb3IuaXNEZXN0cm95ZWQoKSBpcyBzdGlsbCBmYWxzZS4gSG93ZXZlclxuICAgICAgIyBjdXJzb3IuZGVzdHJveWVkID09IHRydWUuIFRleHRFZGl0b3IubW92ZUN1cnNvcnMgcHJvYmFibHkgc2hvdWxkbid0IGV2ZW5cbiAgICAgICMgeWllbGQgaXQgaW4gdGhpcyBjYXNlLlxuICAgICAgcmV0dXJuIGlmIGN1cnNvci5kZXN0cm95ZWQgPT0gdHJ1ZVxuICAgICAgY2FsbGJhY2soRW1hY3NDdXJzb3IuZm9yKGN1cnNvciksIGN1cnNvcilcblxuICAjIyNcbiAgU2VjdGlvbjogTmF2aWdhdGlvblxuICAjIyNcblxuICBiYWNrd2FyZENoYXI6IC0+XG4gICAgQGVkaXRvci5tb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPlxuICAgICAgY3Vyc29yLm1vdmVMZWZ0KClcblxuICBmb3J3YXJkQ2hhcjogLT5cbiAgICBAZWRpdG9yLm1vdmVDdXJzb3JzIChjdXJzb3IpIC0+XG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcblxuICBiYWNrd2FyZFdvcmQ6IC0+XG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxuICAgICAgZW1hY3NDdXJzb3Iuc2tpcE5vbldvcmRDaGFyYWN0ZXJzQmFja3dhcmQoKVxuICAgICAgZW1hY3NDdXJzb3Iuc2tpcFdvcmRDaGFyYWN0ZXJzQmFja3dhcmQoKVxuXG4gIGZvcndhcmRXb3JkOiAtPlxuICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgLT5cbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBOb25Xb3JkQ2hhcmFjdGVyc0ZvcndhcmQoKVxuICAgICAgZW1hY3NDdXJzb3Iuc2tpcFdvcmRDaGFyYWN0ZXJzRm9yd2FyZCgpXG5cbiAgYmFja3dhcmRTZXhwOiAtPlxuICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgLT5cbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBTZXhwQmFja3dhcmQoKVxuXG4gIGZvcndhcmRTZXhwOiAtPlxuICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgLT5cbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBTZXhwRm9yd2FyZCgpXG5cbiAgYmFja3dhcmRMaXN0OiAtPlxuICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgLT5cbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBMaXN0QmFja3dhcmQoKVxuXG4gIGZvcndhcmRMaXN0OiAtPlxuICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgLT5cbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBMaXN0Rm9yd2FyZCgpXG5cbiAgcHJldmlvdXNMaW5lOiAtPlxuICAgIEBlZGl0b3IubW92ZUN1cnNvcnMgKGN1cnNvcikgLT5cbiAgICAgIGN1cnNvci5tb3ZlVXAoKVxuXG4gIG5leHRMaW5lOiAtPlxuICAgIEBlZGl0b3IubW92ZUN1cnNvcnMgKGN1cnNvcikgLT5cbiAgICAgIGN1cnNvci5tb3ZlRG93bigpXG5cbiAgYmFja3dhcmRQYXJhZ3JhcGg6IC0+XG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yLCBjdXJzb3IpIC0+XG4gICAgICBwb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB1bmxlc3MgcG9zaXRpb24ucm93ID09IDBcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtwb3NpdGlvbi5yb3cgLSAxLCAwXSlcblxuICAgICAgZW1hY3NDdXJzb3IuZ29Ub01hdGNoU3RhcnRCYWNrd2FyZCgvXlxccyokLykgb3JcbiAgICAgICAgY3Vyc29yLm1vdmVUb1RvcCgpXG5cbiAgZm9yd2FyZFBhcmFncmFwaDogLT5cbiAgICBsYXN0Um93ID0gQGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KClcbiAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IsIGN1cnNvcikgLT5cbiAgICAgIHBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHVubGVzcyBwb3NpdGlvbi5yb3cgPT0gbGFzdFJvd1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3Bvc2l0aW9uLnJvdyArIDEsIDBdKVxuXG4gICAgICBlbWFjc0N1cnNvci5nb1RvTWF0Y2hTdGFydEZvcndhcmQoL15cXHMqJC8pIG9yXG4gICAgICAgIGN1cnNvci5tb3ZlVG9Cb3R0b20oKVxuXG4gIGJhY2tUb0luZGVudGF0aW9uOiAtPlxuICAgIEBlZGl0b3IubW92ZUN1cnNvcnMgKGN1cnNvcikgPT5cbiAgICAgIGNvbnNvbGUubG9nKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpXG4gICAgICBwb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhwb3NpdGlvbi5yb3cpXG4gICAgICB0YXJnZXRDb2x1bW4gPSBsaW5lLnNlYXJjaCgvXFxTLylcbiAgICAgIHRhcmdldENvbHVtbiA9IGxpbmUubGVuZ3RoIGlmIHRhcmdldENvbHVtbiA9PSAtMVxuXG4gICAgICBpZiBwb3NpdGlvbi5jb2x1bW4gIT0gdGFyZ2V0Q29sdW1uXG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcG9zaXRpb24ucm93LCB0YXJnZXRDb2x1bW5dKVxuXG4gICMjI1xuICBTZWN0aW9uOiBLaWxsaW5nICYgWWFua2luZ1xuICAjIyNcblxuICBiYWNrd2FyZEtpbGxXb3JkOiAtPlxuICAgIEBfcHVsbEZyb21DbGlwYm9hcmQoKVxuICAgIG1ldGhvZCA9IGlmIFN0YXRlLmtpbGxpbmcgdGhlbiAncHJlcGVuZCcgZWxzZSAncHVzaCdcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IsIGN1cnNvcikgPT5cbiAgICAgICAgZW1hY3NDdXJzb3IuYmFja3dhcmRLaWxsV29yZChtZXRob2QpXG4gICAgQF91cGRhdGVHbG9iYWxLaWxsUmluZyhtZXRob2QpXG4gICAgU3RhdGUua2lsbGVkKClcblxuICBraWxsV29yZDogLT5cbiAgICBAX3B1bGxGcm9tQ2xpcGJvYXJkKClcbiAgICBtZXRob2QgPSBpZiBTdGF0ZS5raWxsaW5nIHRoZW4gJ2FwcGVuZCcgZWxzZSAncHVzaCdcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XG4gICAgICAgIGVtYWNzQ3Vyc29yLmtpbGxXb3JkKG1ldGhvZClcbiAgICBAX3VwZGF0ZUdsb2JhbEtpbGxSaW5nKG1ldGhvZClcbiAgICBTdGF0ZS5raWxsZWQoKVxuXG4gIGtpbGxMaW5lOiAtPlxuICAgIEBfcHVsbEZyb21DbGlwYm9hcmQoKVxuICAgIG1ldGhvZCA9IGlmIFN0YXRlLmtpbGxpbmcgdGhlbiAnYXBwZW5kJyBlbHNlICdwdXNoJ1xuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgPT5cbiAgICAgICAgZW1hY3NDdXJzb3Iua2lsbExpbmUobWV0aG9kKVxuICAgIEBfdXBkYXRlR2xvYmFsS2lsbFJpbmcobWV0aG9kKVxuICAgIFN0YXRlLmtpbGxlZCgpXG5cbiAga2lsbFJlZ2lvbjogLT5cbiAgICBAX3B1bGxGcm9tQ2xpcGJvYXJkKClcbiAgICBtZXRob2QgPSBpZiBTdGF0ZS5raWxsaW5nIHRoZW4gJ2FwcGVuZCcgZWxzZSAncHVzaCdcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XG4gICAgICAgIGVtYWNzQ3Vyc29yLmtpbGxSZWdpb24obWV0aG9kKVxuICAgIEBfdXBkYXRlR2xvYmFsS2lsbFJpbmcobWV0aG9kKVxuICAgIFN0YXRlLmtpbGxlZCgpXG5cbiAgY29weVJlZ2lvbkFzS2lsbDogLT5cbiAgICBAX3B1bGxGcm9tQ2xpcGJvYXJkKClcbiAgICBtZXRob2QgPSBpZiBTdGF0ZS5raWxsaW5nIHRoZW4gJ2FwcGVuZCcgZWxzZSAncHVzaCdcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIGVtYWNzQ3Vyc29yID0gRW1hY3NDdXJzb3IuZm9yKHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICAgIGVtYWNzQ3Vyc29yLmtpbGxSaW5nKClbbWV0aG9kXShzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuICAgICAgICBlbWFjc0N1cnNvci5raWxsUmluZygpLmdldEN1cnJlbnRFbnRyeSgpXG4gICAgICAgIGVtYWNzQ3Vyc29yLm1hcmsoKS5kZWFjdGl2YXRlKClcbiAgICBAX3VwZGF0ZUdsb2JhbEtpbGxSaW5nKG1ldGhvZClcblxuICB5YW5rOiAtPlxuICAgIEBfcHVsbEZyb21DbGlwYm9hcmQoKVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcbiAgICAgICAgZW1hY3NDdXJzb3IueWFuaygpXG4gICAgU3RhdGUueWFua2VkKClcblxuICB5YW5rUG9wOiAtPlxuICAgIHJldHVybiBpZiBub3QgU3RhdGUueWFua2luZ1xuICAgIEBfcHVsbEZyb21DbGlwYm9hcmQoKVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcbiAgICAgICAgZW1hY3NDdXJzb3Iucm90YXRlWWFuaygtMSlcbiAgICBTdGF0ZS55YW5rZWQoKVxuXG4gIHlhbmtTaGlmdDogLT5cbiAgICByZXR1cm4gaWYgbm90IFN0YXRlLnlhbmtpbmdcbiAgICBAX3B1bGxGcm9tQ2xpcGJvYXJkKClcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBmb3IgZW1hY3NDdXJzb3IgaW4gQGdldEVtYWNzQ3Vyc29ycygpXG4gICAgICAgIGVtYWNzQ3Vyc29yLnJvdGF0ZVlhbmsoMSlcbiAgICBTdGF0ZS55YW5rZWQoKVxuXG4gIF9wdXNoVG9DbGlwYm9hcmQ6IC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbWljLWVtYWNzLmtpbGxUb0NsaXBib2FyZFwiKVxuICAgICAgS2lsbFJpbmcucHVzaFRvQ2xpcGJvYXJkKClcblxuICBfcHVsbEZyb21DbGlwYm9hcmQ6IC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbWljLWVtYWNzLnlhbmtGcm9tQ2xpcGJvYXJkXCIpXG4gICAgICBraWxsUmluZ3MgPSAoYy5raWxsUmluZygpIGZvciBjIGluIEBnZXRFbWFjc0N1cnNvcnMoKSlcbiAgICAgIEtpbGxSaW5nLnB1bGxGcm9tQ2xpcGJvYXJkKGtpbGxSaW5ncylcblxuICBfdXBkYXRlR2xvYmFsS2lsbFJpbmc6IChtZXRob2QpIC0+XG4gICAgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxuICAgICAga2lsbHMgPSAoYy5raWxsUmluZygpLmdldEN1cnJlbnRFbnRyeSgpIGZvciBjIGluIEBnZXRFbWFjc0N1cnNvcnMoKSlcbiAgICAgIG1ldGhvZCA9ICdyZXBsYWNlJyBpZiBtZXRob2QgIT0gJ3B1c2gnXG4gICAgICBLaWxsUmluZy5nbG9iYWxbbWV0aG9kXShraWxscy5qb2luKCdcXG4nKSArICdcXG4nKVxuICAgIEBfcHVzaFRvQ2xpcGJvYXJkKClcblxuICAjIyNcbiAgU2VjdGlvbjogRWRpdGluZ1xuICAjIyNcblxuICBkZWxldGVIb3Jpem9udGFsU3BhY2U6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSA9PlxuICAgICAgICByYW5nZSA9IGVtYWNzQ3Vyc29yLmhvcml6b250YWxTcGFjZVJhbmdlKClcbiAgICAgICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgJycpXG5cbiAgZGVsZXRlSW5kZW50YXRpb246IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgQGVkaXRvci5tb3ZlVXAoKVxuICAgICAgQGVkaXRvci5qb2luTGluZXMoKVxuXG4gIG9wZW5MaW5lOiAtPlxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcbiAgICAgICAgZW1hY3NDdXJzb3IuaW5zZXJ0QWZ0ZXIoXCJcXG5cIilcblxuICBqdXN0T25lU3BhY2U6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIGVtYWNzQ3Vyc29yIGluIEBnZXRFbWFjc0N1cnNvcnMoKVxuICAgICAgICByYW5nZSA9IGVtYWNzQ3Vyc29yLmhvcml6b250YWxTcGFjZVJhbmdlKClcbiAgICAgICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgJyAnKVxuXG4gIGRlbGV0ZUJsYW5rTGluZXM6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIGVtYWNzQ3Vyc29yIGluIEBnZXRFbWFjc0N1cnNvcnMoKVxuICAgICAgICBlbWFjc0N1cnNvci5kZWxldGVCbGFua0xpbmVzKClcblxuICB0cmFuc3Bvc2VDaGFyczogLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XG4gICAgICAgIGVtYWNzQ3Vyc29yLnRyYW5zcG9zZUNoYXJzKClcblxuICB0cmFuc3Bvc2VXb3JkczogLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XG4gICAgICAgIGVtYWNzQ3Vyc29yLnRyYW5zcG9zZVdvcmRzKClcblxuICB0cmFuc3Bvc2VMaW5lczogLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XG4gICAgICAgIGVtYWNzQ3Vyc29yLnRyYW5zcG9zZUxpbmVzKClcblxuICB0cmFuc3Bvc2VTZXhwczogLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XG4gICAgICAgIGVtYWNzQ3Vyc29yLnRyYW5zcG9zZVNleHBzKClcblxuICBkb3duY2FzZSA9IChzKSAtPiBzLnRvTG93ZXJDYXNlKClcbiAgdXBjYXNlID0gKHMpIC0+IHMudG9VcHBlckNhc2UoKVxuICBjYXBpdGFsaXplID0gKHMpIC0+IHMuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSkudG9Mb3dlckNhc2UoKVxuXG4gIGRvd25jYXNlV29yZE9yUmVnaW9uOiAtPlxuICAgIEBfdHJhbnNmb3JtV29yZE9yUmVnaW9uKGRvd25jYXNlKVxuXG4gIHVwY2FzZVdvcmRPclJlZ2lvbjogLT5cbiAgICBAX3RyYW5zZm9ybVdvcmRPclJlZ2lvbih1cGNhc2UpXG5cbiAgY2FwaXRhbGl6ZVdvcmRPclJlZ2lvbjogLT5cbiAgICBAX3RyYW5zZm9ybVdvcmRPclJlZ2lvbihjYXBpdGFsaXplLCB3b3JkQXRBVGltZTogdHJ1ZSlcblxuICBfdHJhbnNmb3JtV29yZE9yUmVnaW9uOiAodHJhbnNmb3JtV29yZCwge3dvcmRBdEFUaW1lfT17fSkgLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBpZiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5maWx0ZXIoKHMpIC0+IG5vdCBzLmlzRW1wdHkoKSkubGVuZ3RoID4gMFxuICAgICAgICBAZWRpdG9yLm11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgICBpZiB3b3JkQXRBVGltZVxuICAgICAgICAgICAgQGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSAvXFx3Ky9nLCByYW5nZSwgKGhpdCkgLT5cbiAgICAgICAgICAgICAgaGl0LnJlcGxhY2UodHJhbnNmb3JtV29yZChoaXQubWF0Y2hUZXh0KSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlLCB0cmFuc2Zvcm1Xb3JkKHNlbGVjdGlvbi5nZXRUZXh0KCkpKVxuICAgICAgZWxzZVxuICAgICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICAgICAgY3Vyc29yLmVtaXR0ZXIuX190cmFjayA9IHRydWVcbiAgICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSA9PlxuICAgICAgICAgIGVtYWNzQ3Vyc29yLnRyYW5zZm9ybVdvcmQodHJhbnNmb3JtV29yZClcblxuICAjIyNcbiAgU2VjdGlvbjogTWFya2luZyAmIFNlbGVjdGluZ1xuICAjIyNcblxuICBzZXRNYXJrOiAtPlxuICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcbiAgICAgIGVtYWNzQ3Vyc29yLm1hcmsoKS5zZXQoKS5hY3RpdmF0ZSgpXG5cbiAgbWFya1NleHA6IC0+XG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxuICAgICAgZW1hY3NDdXJzb3IubWFya1NleHAoKVxuXG4gIG1hcmtXaG9sZUJ1ZmZlcjogLT5cbiAgICBbZmlyc3QsIHJlc3QuLi5dID0gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICBjLmRlc3Ryb3koKSBmb3IgYyBpbiByZXN0XG4gICAgZW1hY3NDdXJzb3IgPSBFbWFjc0N1cnNvci5mb3IoZmlyc3QpXG4gICAgZmlyc3QubW92ZVRvQm90dG9tKClcbiAgICBlbWFjc0N1cnNvci5tYXJrKCkuc2V0KCkuYWN0aXZhdGUoKVxuICAgIGZpcnN0Lm1vdmVUb1RvcCgpXG5cbiAgZXhjaGFuZ2VQb2ludEFuZE1hcms6IC0+XG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxuICAgICAgZW1hY3NDdXJzb3IubWFyaygpLmV4Y2hhbmdlKClcblxuICAjIyNcbiAgU2VjdGlvbjogVUlcbiAgIyMjXG5cbiAgcmVjZW50ZXJUb3BCb3R0b206IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yXG4gICAgdmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKVxuICAgIG1pblJvdyA9IE1hdGgubWluKChjLmdldEJ1ZmZlclJvdygpIGZvciBjIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpKS4uLilcbiAgICBtYXhSb3cgPSBNYXRoLm1heCgoYy5nZXRCdWZmZXJSb3coKSBmb3IgYyBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSkuLi4pXG4gICAgbWluT2Zmc2V0ID0gdmlldy5waXhlbFBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oW21pblJvdywgMF0pXG4gICAgbWF4T2Zmc2V0ID0gdmlldy5waXhlbFBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oW21heFJvdywgMF0pXG5cbiAgICBzd2l0Y2ggU3RhdGUucmVjZW50ZXJzXG4gICAgICB3aGVuIDBcbiAgICAgICAgdmlldy5zZXRTY3JvbGxUb3AoKG1pbk9mZnNldC50b3AgKyBtYXhPZmZzZXQudG9wIC0gdmlldy5nZXRIZWlnaHQoKSkvMilcbiAgICAgIHdoZW4gMVxuICAgICAgICAjIEF0b20gYXBwbGllcyBhIChoYXJkY29kZWQpIDItbGluZSBidWZmZXIgd2hpbGUgc2Nyb2xsaW5nIC0tIGRvIHRoYXQgaGVyZS5cbiAgICAgICAgdmlldy5zZXRTY3JvbGxUb3AobWluT2Zmc2V0LnRvcCAtIDIqQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSlcbiAgICAgIHdoZW4gMlxuICAgICAgICB2aWV3LnNldFNjcm9sbFRvcChtYXhPZmZzZXQudG9wICsgMypAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpIC0gdmlldy5nZXRIZWlnaHQoKSlcblxuICAgIFN0YXRlLnJlY2VudGVyZWQoKVxuXG4gIHNjcm9sbFVwOiAtPlxuICAgIGlmICh2aXNpYmxlUm93UmFuZ2UgPSBAZWRpdG9yLmdldFZpc2libGVSb3dSYW5nZSgpKVxuICAgICAgIyBJRiB0aGUgYnVmZmVyIGlzIGVtcHR5LCB3ZSBnZXQgTmFOcyBoZXJlIChBdG9tIDEuMjEpLlxuICAgICAgcmV0dXJuIHVubGVzcyB2aXNpYmxlUm93UmFuZ2UuZXZlcnkoKGUpID0+ICFOdW1iZXIuaXNOYU4oZSkpXG5cbiAgICAgIFtmaXJzdFJvdywgbGFzdFJvd10gPSB2aXNpYmxlUm93UmFuZ2VcbiAgICAgIGN1cnJlbnRSb3cgPSBAZWRpdG9yLmN1cnNvcnNbMF0uZ2V0QnVmZmVyUm93KClcbiAgICAgIHJvd0NvdW50ID0gKGxhc3RSb3cgLSBmaXJzdFJvdykgLSAyXG4gICAgICBAZWRpdG9yLm1vdmVEb3duKHJvd0NvdW50KVxuXG4gIHNjcm9sbERvd246IC0+XG4gICAgaWYgKHZpc2libGVSb3dSYW5nZSA9IEBlZGl0b3IuZ2V0VmlzaWJsZVJvd1JhbmdlKCkpXG4gICAgICAjIElGIHRoZSBidWZmZXIgaXMgZW1wdHksIHdlIGdldCBOYU5zIGhlcmUgKEF0b20gMS4yMSkuXG4gICAgICByZXR1cm4gdW5sZXNzIHZpc2libGVSb3dSYW5nZS5ldmVyeSgoZSkgPT4gIU51bWJlci5pc05hTihlKSlcblxuICAgICAgW2ZpcnN0Um93LGxhc3RSb3ddID0gdmlzaWJsZVJvd1JhbmdlXG4gICAgICBjdXJyZW50Um93ID0gQGVkaXRvci5jdXJzb3JzWzBdLmdldEJ1ZmZlclJvdygpXG4gICAgICByb3dDb3VudCA9IChsYXN0Um93IC0gZmlyc3RSb3cpIC0gMlxuICAgICAgQGVkaXRvci5tb3ZlVXAocm93Q291bnQpXG5cbiAgIyMjXG4gIFNlY3Rpb246IE90aGVyXG4gICMjI1xuXG4gIGtleWJvYXJkUXVpdDogLT5cbiAgICBmb3IgZW1hY3NDdXJzb3IgaW4gQGdldEVtYWNzQ3Vyc29ycygpXG4gICAgICBlbWFjc0N1cnNvci5tYXJrKCkuZGVhY3RpdmF0ZSgpXG4iXX0=
