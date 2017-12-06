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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9taWMtZW1hY3MvbGliL2VtYWNzLWVkaXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9FQUFBO0lBQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUVSLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixRQUFBOztJQUFBLFdBQUMsRUFBQSxHQUFBLEVBQUQsR0FBTSxTQUFDLE1BQUQ7MkNBQ0osTUFBTSxDQUFDLGVBQVAsTUFBTSxDQUFDLGVBQW9CLElBQUEsV0FBQSxDQUFZLE1BQVo7SUFEdkI7O0lBR08scUJBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQ1osSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJO01BQ2xCLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUN4QyxjQUFBO1VBQUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBO1VBQ1YsSUFBRyxPQUFPLENBQUMsTUFBUixLQUFrQixDQUFyQjttQkFDRSxXQUFXLEVBQUMsR0FBRCxFQUFYLENBQWdCLE9BQVEsQ0FBQSxDQUFBLENBQXhCLENBQTJCLENBQUMsa0JBQTVCLENBQUEsRUFERjs7UUFGd0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBQWhCO01BSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUMsQ0FBQSxNQUFN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QWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBQSxDQUFuQixDQUFIO1FBRUUsSUFBQSxDQUFjLGVBQWUsQ0FBQyxLQUFoQixDQUFzQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLENBQUQ7bUJBQU8sQ0FBQyxNQUFNLENBQUMsS0FBUCxDQUFhLENBQWI7VUFBUjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsQ0FBZDtBQUFBLGlCQUFBOztRQUVDLDZCQUFELEVBQVU7UUFDVixVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsWUFBbkIsQ0FBQTtRQUNiLFFBQUEsR0FBVyxDQUFDLE9BQUEsR0FBVSxRQUFYLENBQUEsR0FBdUI7ZUFDbEMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsUUFBZixFQVBGOztJQURVOzs7QUFVWjs7OzswQkFJQSxZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7QUFBQTtBQUFBO1dBQUEscUNBQUE7O3FCQUNFLFdBQVcsQ0FBQyxJQUFaLENBQUEsQ0FBa0IsQ0FBQyxVQUFuQixDQUFBO0FBREY7O0lBRFk7Ozs7O0FBcFdoQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXHJcbkVtYWNzQ3Vyc29yID0gcmVxdWlyZSAnLi9lbWFjcy1jdXJzb3InXHJcbktpbGxSaW5nID0gcmVxdWlyZSAnLi9raWxsLXJpbmcnXHJcbk1hcmsgPSByZXF1aXJlICcuL21hcmsnXHJcblN0YXRlID0gcmVxdWlyZSAnLi9zdGF0ZSdcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuY2xhc3MgRW1hY3NFZGl0b3JcclxuICBAZm9yOiAoZWRpdG9yKSAtPlxyXG4gICAgZWRpdG9yLl9hdG9taWNFbWFjcyA/PSBuZXcgRW1hY3NFZGl0b3IoZWRpdG9yKVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XHJcbiAgICBAZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXHJcbiAgICBAZGlzcG9zYWJsZS5hZGQgQGVkaXRvci5vbkRpZFJlbW92ZUN1cnNvciA9PlxyXG4gICAgICBjdXJzb3JzID0gQGVkaXRvci5nZXRDdXJzb3JzKClcclxuICAgICAgaWYgY3Vyc29ycy5sZW5ndGggPT0gMVxyXG4gICAgICAgIEVtYWNzQ3Vyc29yLmZvcihjdXJzb3JzWzBdKS5jbGVhckxvY2FsS2lsbFJpbmcoKVxyXG4gICAgQGRpc3Bvc2FibGUuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ID0+XHJcbiAgICAgIEBkZXN0cm95KClcclxuXHJcbiAgZGVzdHJveTogLT5cclxuICAgICMgTmVpdGhlciBjdXJzb3IuZGlkLWRlc3Ryb3kgbm9yIFRleHRFZGl0b3IuZGlkLXJlbW92ZS1jdXJzb3Igc2VlbXMgdG8gZmlyZVxyXG4gICAgIyB3aGVuIHRoZSBlZGl0b3IgaXMgZGVzdHJveWVkLiAoQXRvbSBidWc/KSBTbyB3ZSBkZXN0cm95IEVtYWNzQ3Vyc29ycyBoZXJlLlxyXG4gICAgZm9yIGN1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcclxuICAgICAgY3Vyc29yLmRlc3Ryb3koKVxyXG4gICAgQGRpc3Bvc2FibGUuZGlzcG9zZSgpXHJcblxyXG4gIGdldEVtYWNzQ3Vyc29yczogKCkgLT5cclxuICAgIEVtYWNzQ3Vyc29yLmZvcihjKSBmb3IgYyBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxyXG5cclxuICBtb3ZlRW1hY3NDdXJzb3JzOiAoY2FsbGJhY2spIC0+XHJcbiAgICBAZWRpdG9yLm1vdmVDdXJzb3JzIChjdXJzb3IpIC0+XHJcbiAgICAgICMgQXRvbSBidWc6IGlmIG1vdmluZyBvbmUgY3Vyc29yIGRlc3Ryb3lzIGFub3RoZXIsIHRoZSBkZXN0cm95ZWQgb25lJ3NcclxuICAgICAgIyBlbWl0dGVyIGlzIGRpc3Bvc2VkLCBidXQgY3Vyc29yLmlzRGVzdHJveWVkKCkgaXMgc3RpbGwgZmFsc2UuIEhvd2V2ZXJcclxuICAgICAgIyBjdXJzb3IuZGVzdHJveWVkID09IHRydWUuIFRleHRFZGl0b3IubW92ZUN1cnNvcnMgcHJvYmFibHkgc2hvdWxkbid0IGV2ZW5cclxuICAgICAgIyB5aWVsZCBpdCBpbiB0aGlzIGNhc2UuXHJcbiAgICAgIHJldHVybiBpZiBjdXJzb3IuZGVzdHJveWVkID09IHRydWVcclxuICAgICAgY2FsbGJhY2soRW1hY3NDdXJzb3IuZm9yKGN1cnNvciksIGN1cnNvcilcclxuXHJcbiAgIyMjXHJcbiAgU2VjdGlvbjogTmF2aWdhdGlvblxyXG4gICMjI1xyXG5cclxuICBiYWNrd2FyZENoYXI6IC0+XHJcbiAgICBAZWRpdG9yLm1vdmVDdXJzb3JzIChjdXJzb3IpIC0+XHJcbiAgICAgIGN1cnNvci5tb3ZlTGVmdCgpXHJcblxyXG4gIGZvcndhcmRDaGFyOiAtPlxyXG4gICAgQGVkaXRvci5tb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPlxyXG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcclxuXHJcbiAgYmFja3dhcmRXb3JkOiAtPlxyXG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxyXG4gICAgICBlbWFjc0N1cnNvci5za2lwTm9uV29yZENoYXJhY3RlcnNCYWNrd2FyZCgpXHJcbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBXb3JkQ2hhcmFjdGVyc0JhY2t3YXJkKClcclxuXHJcbiAgZm9yd2FyZFdvcmQ6IC0+XHJcbiAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpIC0+XHJcbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBOb25Xb3JkQ2hhcmFjdGVyc0ZvcndhcmQoKVxyXG4gICAgICBlbWFjc0N1cnNvci5za2lwV29yZENoYXJhY3RlcnNGb3J3YXJkKClcclxuXHJcbiAgYmFja3dhcmRTZXhwOiAtPlxyXG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxyXG4gICAgICBlbWFjc0N1cnNvci5za2lwU2V4cEJhY2t3YXJkKClcclxuXHJcbiAgZm9yd2FyZFNleHA6IC0+XHJcbiAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpIC0+XHJcbiAgICAgIGVtYWNzQ3Vyc29yLnNraXBTZXhwRm9yd2FyZCgpXHJcblxyXG4gIGJhY2t3YXJkTGlzdDogLT5cclxuICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgLT5cclxuICAgICAgZW1hY3NDdXJzb3Iuc2tpcExpc3RCYWNrd2FyZCgpXHJcblxyXG4gIGZvcndhcmRMaXN0OiAtPlxyXG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxyXG4gICAgICBlbWFjc0N1cnNvci5za2lwTGlzdEZvcndhcmQoKVxyXG5cclxuICBwcmV2aW91c0xpbmU6IC0+XHJcbiAgICBAZWRpdG9yLm1vdmVDdXJzb3JzIChjdXJzb3IpIC0+XHJcbiAgICAgIGN1cnNvci5tb3ZlVXAoKVxyXG5cclxuICBuZXh0TGluZTogLT5cclxuICAgIEBlZGl0b3IubW92ZUN1cnNvcnMgKGN1cnNvcikgLT5cclxuICAgICAgY3Vyc29yLm1vdmVEb3duKClcclxuXHJcbiAgYmFja3dhcmRQYXJhZ3JhcGg6IC0+XHJcbiAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IsIGN1cnNvcikgLT5cclxuICAgICAgcG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG4gICAgICB1bmxlc3MgcG9zaXRpb24ucm93ID09IDBcclxuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3Bvc2l0aW9uLnJvdyAtIDEsIDBdKVxyXG5cclxuICAgICAgZW1hY3NDdXJzb3IuZ29Ub01hdGNoU3RhcnRCYWNrd2FyZCgvXlxccyokLykgb3JcclxuICAgICAgICBjdXJzb3IubW92ZVRvVG9wKClcclxuXHJcbiAgZm9yd2FyZFBhcmFncmFwaDogLT5cclxuICAgIGxhc3RSb3cgPSBAZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKVxyXG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yLCBjdXJzb3IpIC0+XHJcbiAgICAgIHBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgICAgdW5sZXNzIHBvc2l0aW9uLnJvdyA9PSBsYXN0Um93XHJcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtwb3NpdGlvbi5yb3cgKyAxLCAwXSlcclxuXHJcbiAgICAgIGVtYWNzQ3Vyc29yLmdvVG9NYXRjaFN0YXJ0Rm9yd2FyZCgvXlxccyokLykgb3JcclxuICAgICAgICBjdXJzb3IubW92ZVRvQm90dG9tKClcclxuXHJcbiAgYmFja1RvSW5kZW50YXRpb246IC0+XHJcbiAgICBAZWRpdG9yLm1vdmVDdXJzb3JzIChjdXJzb3IpID0+XHJcbiAgICAgIHBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9zaXRpb24ucm93KVxyXG4gICAgICB0YXJnZXRDb2x1bW4gPSBsaW5lLnNlYXJjaCgvXFxTLylcclxuICAgICAgdGFyZ2V0Q29sdW1uID0gbGluZS5sZW5ndGggaWYgdGFyZ2V0Q29sdW1uID09IC0xXHJcblxyXG4gICAgICBpZiBwb3NpdGlvbi5jb2x1bW4gIT0gdGFyZ2V0Q29sdW1uXHJcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtwb3NpdGlvbi5yb3csIHRhcmdldENvbHVtbl0pXHJcblxyXG4gICMjI1xyXG4gIFNlY3Rpb246IEtpbGxpbmcgJiBZYW5raW5nXHJcbiAgIyMjXHJcblxyXG4gIGJhY2t3YXJkS2lsbFdvcmQ6IC0+XHJcbiAgICBAX3B1bGxGcm9tQ2xpcGJvYXJkKClcclxuICAgIG1ldGhvZCA9IGlmIFN0YXRlLmtpbGxpbmcgdGhlbiAncHJlcGVuZCcgZWxzZSAncHVzaCdcclxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cclxuICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yLCBjdXJzb3IpID0+XHJcbiAgICAgICAgZW1hY3NDdXJzb3IuYmFja3dhcmRLaWxsV29yZChtZXRob2QpXHJcbiAgICBAX3VwZGF0ZUdsb2JhbEtpbGxSaW5nKG1ldGhvZClcclxuICAgIFN0YXRlLmtpbGxlZCgpXHJcblxyXG4gIGtpbGxXb3JkOiAtPlxyXG4gICAgQF9wdWxsRnJvbUNsaXBib2FyZCgpXHJcbiAgICBtZXRob2QgPSBpZiBTdGF0ZS5raWxsaW5nIHRoZW4gJ2FwcGVuZCcgZWxzZSAncHVzaCdcclxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cclxuICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSA9PlxyXG4gICAgICAgIGVtYWNzQ3Vyc29yLmtpbGxXb3JkKG1ldGhvZClcclxuICAgIEBfdXBkYXRlR2xvYmFsS2lsbFJpbmcobWV0aG9kKVxyXG4gICAgU3RhdGUua2lsbGVkKClcclxuXHJcbiAga2lsbExpbmU6IC0+XHJcbiAgICBAX3B1bGxGcm9tQ2xpcGJvYXJkKClcclxuICAgIG1ldGhvZCA9IGlmIFN0YXRlLmtpbGxpbmcgdGhlbiAnYXBwZW5kJyBlbHNlICdwdXNoJ1xyXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxyXG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XHJcbiAgICAgICAgZW1hY3NDdXJzb3Iua2lsbExpbmUobWV0aG9kKVxyXG4gICAgQF91cGRhdGVHbG9iYWxLaWxsUmluZyhtZXRob2QpXHJcbiAgICBTdGF0ZS5raWxsZWQoKVxyXG5cclxuICBraWxsUmVnaW9uOiAtPlxyXG4gICAgQF9wdWxsRnJvbUNsaXBib2FyZCgpXHJcbiAgICBtZXRob2QgPSBpZiBTdGF0ZS5raWxsaW5nIHRoZW4gJ2FwcGVuZCcgZWxzZSAncHVzaCdcclxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cclxuICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSA9PlxyXG4gICAgICAgIGVtYWNzQ3Vyc29yLmtpbGxSZWdpb24obWV0aG9kKVxyXG4gICAgQF91cGRhdGVHbG9iYWxLaWxsUmluZyhtZXRob2QpXHJcbiAgICBTdGF0ZS5raWxsZWQoKVxyXG5cclxuICBjb3B5UmVnaW9uQXNLaWxsOiAtPlxyXG4gICAgQF9wdWxsRnJvbUNsaXBib2FyZCgpXHJcbiAgICBtZXRob2QgPSBpZiBTdGF0ZS5raWxsaW5nIHRoZW4gJ2FwcGVuZCcgZWxzZSAncHVzaCdcclxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cclxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxyXG4gICAgICAgIGVtYWNzQ3Vyc29yID0gRW1hY3NDdXJzb3IuZm9yKHNlbGVjdGlvbi5jdXJzb3IpXHJcbiAgICAgICAgZW1hY3NDdXJzb3Iua2lsbFJpbmcoKVttZXRob2RdKHNlbGVjdGlvbi5nZXRUZXh0KCkpXHJcbiAgICAgICAgZW1hY3NDdXJzb3Iua2lsbFJpbmcoKS5nZXRDdXJyZW50RW50cnkoKVxyXG4gICAgICAgIGVtYWNzQ3Vyc29yLm1hcmsoKS5kZWFjdGl2YXRlKClcclxuICAgIEBfdXBkYXRlR2xvYmFsS2lsbFJpbmcobWV0aG9kKVxyXG5cclxuICB5YW5rOiAtPlxyXG4gICAgQF9wdWxsRnJvbUNsaXBib2FyZCgpXHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcclxuICAgICAgICBlbWFjc0N1cnNvci55YW5rKClcclxuICAgIFN0YXRlLnlhbmtlZCgpXHJcblxyXG4gIHlhbmtQb3A6IC0+XHJcbiAgICByZXR1cm4gaWYgbm90IFN0YXRlLnlhbmtpbmdcclxuICAgIEBfcHVsbEZyb21DbGlwYm9hcmQoKVxyXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxyXG4gICAgICBmb3IgZW1hY3NDdXJzb3IgaW4gQGdldEVtYWNzQ3Vyc29ycygpXHJcbiAgICAgICAgZW1hY3NDdXJzb3Iucm90YXRlWWFuaygtMSlcclxuICAgIFN0YXRlLnlhbmtlZCgpXHJcblxyXG4gIHlhbmtTaGlmdDogLT5cclxuICAgIHJldHVybiBpZiBub3QgU3RhdGUueWFua2luZ1xyXG4gICAgQF9wdWxsRnJvbUNsaXBib2FyZCgpXHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcclxuICAgICAgICBlbWFjc0N1cnNvci5yb3RhdGVZYW5rKDEpXHJcbiAgICBTdGF0ZS55YW5rZWQoKVxyXG5cclxuICBfcHVzaFRvQ2xpcGJvYXJkOiAtPlxyXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbWljLWVtYWNzLmtpbGxUb0NsaXBib2FyZFwiKVxyXG4gICAgICBLaWxsUmluZy5wdXNoVG9DbGlwYm9hcmQoKVxyXG5cclxuICBfcHVsbEZyb21DbGlwYm9hcmQ6IC0+XHJcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJhdG9taWMtZW1hY3MueWFua0Zyb21DbGlwYm9hcmRcIilcclxuICAgICAga2lsbFJpbmdzID0gKGMua2lsbFJpbmcoKSBmb3IgYyBpbiBAZ2V0RW1hY3NDdXJzb3JzKCkpXHJcbiAgICAgIEtpbGxSaW5nLnB1bGxGcm9tQ2xpcGJvYXJkKGtpbGxSaW5ncylcclxuXHJcbiAgX3VwZGF0ZUdsb2JhbEtpbGxSaW5nOiAobWV0aG9kKSAtPlxyXG4gICAgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxyXG4gICAgICBraWxscyA9IChjLmtpbGxSaW5nKCkuZ2V0Q3VycmVudEVudHJ5KCkgZm9yIGMgaW4gQGdldEVtYWNzQ3Vyc29ycygpKVxyXG4gICAgICBtZXRob2QgPSAncmVwbGFjZScgaWYgbWV0aG9kICE9ICdwdXNoJ1xyXG4gICAgICBLaWxsUmluZy5nbG9iYWxbbWV0aG9kXShraWxscy5qb2luKCdcXG4nKSArICdcXG4nKVxyXG4gICAgQF9wdXNoVG9DbGlwYm9hcmQoKVxyXG5cclxuICAjIyNcclxuICBTZWN0aW9uOiBFZGl0aW5nXHJcbiAgIyMjXHJcblxyXG4gIGRlbGV0ZUhvcml6b250YWxTcGFjZTogLT5cclxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cclxuICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSA9PlxyXG4gICAgICAgIHJhbmdlID0gZW1hY3NDdXJzb3IuaG9yaXpvbnRhbFNwYWNlUmFuZ2UoKVxyXG4gICAgICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsICcnKVxyXG5cclxuICBkZWxldGVJbmRlbnRhdGlvbjogLT5cclxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvclxyXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxyXG4gICAgICBAZWRpdG9yLm1vdmVVcCgpXHJcbiAgICAgIEBlZGl0b3Iuam9pbkxpbmVzKClcclxuXHJcbiAgb3BlbkxpbmU6IC0+XHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcclxuICAgICAgICBlbWFjc0N1cnNvci5pbnNlcnRBZnRlcihcIlxcblwiKVxyXG5cclxuICBqdXN0T25lU3BhY2U6IC0+XHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcclxuICAgICAgICByYW5nZSA9IGVtYWNzQ3Vyc29yLmhvcml6b250YWxTcGFjZVJhbmdlKClcclxuICAgICAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlLCAnICcpXHJcblxyXG4gIGRlbGV0ZUJsYW5rTGluZXM6IC0+XHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIGZvciBlbWFjc0N1cnNvciBpbiBAZ2V0RW1hY3NDdXJzb3JzKClcclxuICAgICAgICBlbWFjc0N1cnNvci5kZWxldGVCbGFua0xpbmVzKClcclxuXHJcbiAgdHJhbnNwb3NlQ2hhcnM6IC0+XHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgPT5cclxuICAgICAgICBlbWFjc0N1cnNvci50cmFuc3Bvc2VDaGFycygpXHJcblxyXG4gIHRyYW5zcG9zZVdvcmRzOiAtPlxyXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxyXG4gICAgICBAbW92ZUVtYWNzQ3Vyc29ycyAoZW1hY3NDdXJzb3IpID0+XHJcbiAgICAgICAgZW1hY3NDdXJzb3IudHJhbnNwb3NlV29yZHMoKVxyXG5cclxuICB0cmFuc3Bvc2VMaW5lczogLT5cclxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cclxuICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSA9PlxyXG4gICAgICAgIGVtYWNzQ3Vyc29yLnRyYW5zcG9zZUxpbmVzKClcclxuXHJcbiAgdHJhbnNwb3NlU2V4cHM6IC0+XHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIEBtb3ZlRW1hY3NDdXJzb3JzIChlbWFjc0N1cnNvcikgPT5cclxuICAgICAgICBlbWFjc0N1cnNvci50cmFuc3Bvc2VTZXhwcygpXHJcblxyXG4gIGRvd25jYXNlID0gKHMpIC0+IHMudG9Mb3dlckNhc2UoKVxyXG4gIHVwY2FzZSA9IChzKSAtPiBzLnRvVXBwZXJDYXNlKClcclxuICBjYXBpdGFsaXplID0gKHMpIC0+IHMuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSkudG9Mb3dlckNhc2UoKVxyXG5cclxuICBkb3duY2FzZVdvcmRPclJlZ2lvbjogLT5cclxuICAgIEBfdHJhbnNmb3JtV29yZE9yUmVnaW9uKGRvd25jYXNlKVxyXG5cclxuICB1cGNhc2VXb3JkT3JSZWdpb246IC0+XHJcbiAgICBAX3RyYW5zZm9ybVdvcmRPclJlZ2lvbih1cGNhc2UpXHJcblxyXG4gIGNhcGl0YWxpemVXb3JkT3JSZWdpb246IC0+XHJcbiAgICBAX3RyYW5zZm9ybVdvcmRPclJlZ2lvbihjYXBpdGFsaXplLCB3b3JkQXRBVGltZTogdHJ1ZSlcclxuXHJcbiAgX3RyYW5zZm9ybVdvcmRPclJlZ2lvbjogKHRyYW5zZm9ybVdvcmQsIHt3b3JkQXRBVGltZX09e30pIC0+XHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIGlmIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZpbHRlcigocykgLT4gbm90IHMuaXNFbXB0eSgpKS5sZW5ndGggPiAwXHJcbiAgICAgICAgQGVkaXRvci5tdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgPT5cclxuICAgICAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcclxuICAgICAgICAgIGlmIHdvcmRBdEFUaW1lXHJcbiAgICAgICAgICAgIEBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UgL1xcdysvZywgcmFuZ2UsIChoaXQpIC0+XHJcbiAgICAgICAgICAgICAgaGl0LnJlcGxhY2UodHJhbnNmb3JtV29yZChoaXQubWF0Y2hUZXh0KSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgdHJhbnNmb3JtV29yZChzZWxlY3Rpb24uZ2V0VGV4dCgpKSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcclxuICAgICAgICAgIGN1cnNvci5lbWl0dGVyLl9fdHJhY2sgPSB0cnVlXHJcbiAgICAgICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSA9PlxyXG4gICAgICAgICAgZW1hY3NDdXJzb3IudHJhbnNmb3JtV29yZCh0cmFuc2Zvcm1Xb3JkKVxyXG5cclxuICAjIyNcclxuICBTZWN0aW9uOiBNYXJraW5nICYgU2VsZWN0aW5nXHJcbiAgIyMjXHJcblxyXG4gIHNldE1hcms6IC0+XHJcbiAgICBmb3IgZW1hY3NDdXJzb3IgaW4gQGdldEVtYWNzQ3Vyc29ycygpXHJcbiAgICAgIGVtYWNzQ3Vyc29yLm1hcmsoKS5zZXQoKS5hY3RpdmF0ZSgpXHJcblxyXG4gIG1hcmtTZXhwOiAtPlxyXG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxyXG4gICAgICBlbWFjc0N1cnNvci5tYXJrU2V4cCgpXHJcblxyXG4gIG1hcmtXaG9sZUJ1ZmZlcjogLT5cclxuICAgIFtmaXJzdCwgcmVzdC4uLl0gPSBAZWRpdG9yLmdldEN1cnNvcnMoKVxyXG4gICAgYy5kZXN0cm95KCkgZm9yIGMgaW4gcmVzdFxyXG4gICAgZW1hY3NDdXJzb3IgPSBFbWFjc0N1cnNvci5mb3IoZmlyc3QpXHJcbiAgICBmaXJzdC5tb3ZlVG9Cb3R0b20oKVxyXG4gICAgZW1hY3NDdXJzb3IubWFyaygpLnNldCgpLmFjdGl2YXRlKClcclxuICAgIGZpcnN0Lm1vdmVUb1RvcCgpXHJcblxyXG4gIGV4Y2hhbmdlUG9pbnRBbmRNYXJrOiAtPlxyXG4gICAgQG1vdmVFbWFjc0N1cnNvcnMgKGVtYWNzQ3Vyc29yKSAtPlxyXG4gICAgICBlbWFjc0N1cnNvci5tYXJrKCkuZXhjaGFuZ2UoKVxyXG5cclxuICAjIyNcclxuICBTZWN0aW9uOiBVSVxyXG4gICMjI1xyXG5cclxuICByZWNlbnRlclRvcEJvdHRvbTogLT5cclxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvclxyXG4gICAgdmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKVxyXG4gICAgbWluUm93ID0gTWF0aC5taW4oKGMuZ2V0QnVmZmVyUm93KCkgZm9yIGMgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkpLi4uKVxyXG4gICAgbWF4Um93ID0gTWF0aC5tYXgoKGMuZ2V0QnVmZmVyUm93KCkgZm9yIGMgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkpLi4uKVxyXG4gICAgbWluT2Zmc2V0ID0gdmlldy5waXhlbFBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oW21pblJvdywgMF0pXHJcbiAgICBtYXhPZmZzZXQgPSB2aWV3LnBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihbbWF4Um93LCAwXSlcclxuXHJcbiAgICBzd2l0Y2ggU3RhdGUucmVjZW50ZXJzXHJcbiAgICAgIHdoZW4gMFxyXG4gICAgICAgIHZpZXcuc2V0U2Nyb2xsVG9wKChtaW5PZmZzZXQudG9wICsgbWF4T2Zmc2V0LnRvcCAtIHZpZXcuZ2V0SGVpZ2h0KCkpLzIpXHJcbiAgICAgIHdoZW4gMVxyXG4gICAgICAgICMgQXRvbSBhcHBsaWVzIGEgKGhhcmRjb2RlZCkgMi1saW5lIGJ1ZmZlciB3aGlsZSBzY3JvbGxpbmcgLS0gZG8gdGhhdCBoZXJlLlxyXG4gICAgICAgIHZpZXcuc2V0U2Nyb2xsVG9wKG1pbk9mZnNldC50b3AgLSAyKkBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkpXHJcbiAgICAgIHdoZW4gMlxyXG4gICAgICAgIHZpZXcuc2V0U2Nyb2xsVG9wKG1heE9mZnNldC50b3AgKyAzKkBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgLSB2aWV3LmdldEhlaWdodCgpKVxyXG5cclxuICAgIFN0YXRlLnJlY2VudGVyZWQoKVxyXG5cclxuICBzY3JvbGxVcDogLT5cclxuICAgIGlmICh2aXNpYmxlUm93UmFuZ2UgPSBAZWRpdG9yLmdldFZpc2libGVSb3dSYW5nZSgpKVxyXG4gICAgICAjIElGIHRoZSBidWZmZXIgaXMgZW1wdHksIHdlIGdldCBOYU5zIGhlcmUgKEF0b20gMS4yMSkuXHJcbiAgICAgIHJldHVybiB1bmxlc3MgdmlzaWJsZVJvd1JhbmdlLmV2ZXJ5KChlKSA9PiAhTnVtYmVyLmlzTmFOKGUpKVxyXG5cclxuICAgICAgW2ZpcnN0Um93LCBsYXN0Um93XSA9IHZpc2libGVSb3dSYW5nZVxyXG4gICAgICBjdXJyZW50Um93ID0gQGVkaXRvci5jdXJzb3JzWzBdLmdldEJ1ZmZlclJvdygpXHJcbiAgICAgIHJvd0NvdW50ID0gKGxhc3RSb3cgLSBmaXJzdFJvdykgLSAyXHJcbiAgICAgIEBlZGl0b3IubW92ZURvd24ocm93Q291bnQpXHJcblxyXG4gIHNjcm9sbERvd246IC0+XHJcbiAgICBpZiAodmlzaWJsZVJvd1JhbmdlID0gQGVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2UoKSlcclxuICAgICAgIyBJRiB0aGUgYnVmZmVyIGlzIGVtcHR5LCB3ZSBnZXQgTmFOcyBoZXJlIChBdG9tIDEuMjEpLlxyXG4gICAgICByZXR1cm4gdW5sZXNzIHZpc2libGVSb3dSYW5nZS5ldmVyeSgoZSkgPT4gIU51bWJlci5pc05hTihlKSlcclxuXHJcbiAgICAgIFtmaXJzdFJvdyxsYXN0Um93XSA9IHZpc2libGVSb3dSYW5nZVxyXG4gICAgICBjdXJyZW50Um93ID0gQGVkaXRvci5jdXJzb3JzWzBdLmdldEJ1ZmZlclJvdygpXHJcbiAgICAgIHJvd0NvdW50ID0gKGxhc3RSb3cgLSBmaXJzdFJvdykgLSAyXHJcbiAgICAgIEBlZGl0b3IubW92ZVVwKHJvd0NvdW50KVxyXG5cclxuICAjIyNcclxuICBTZWN0aW9uOiBPdGhlclxyXG4gICMjI1xyXG5cclxuICBrZXlib2FyZFF1aXQ6IC0+XHJcbiAgICBmb3IgZW1hY3NDdXJzb3IgaW4gQGdldEVtYWNzQ3Vyc29ycygpXHJcbiAgICAgIGVtYWNzQ3Vyc29yLm1hcmsoKS5kZWFjdGl2YXRlKClcclxuIl19
