(function() {
  var BOB, CLOSERS, CompositeDisposable, EmacsCursor, KillRing, Mark, OPENERS, escapeRegExp;

  KillRing = require('./kill-ring');

  Mark = require('./mark');

  CompositeDisposable = require('atom').CompositeDisposable;

  OPENERS = {
    '(': ')',
    '[': ']',
    '{': '}',
    '\'': '\'',
    '"': '"',
    '`': '`'
  };

  CLOSERS = {
    ')': '(',
    ']': '[',
    '}': '{',
    '\'': '\'',
    '"': '"',
    '`': '`'
  };

  module.exports = EmacsCursor = (function() {
    EmacsCursor["for"] = function(cursor) {
      return cursor._atomicEmacs != null ? cursor._atomicEmacs : cursor._atomicEmacs = new EmacsCursor(cursor);
    };

    function EmacsCursor(cursor1) {
      this.cursor = cursor1;
      this.editor = this.cursor.editor;
      this._mark = null;
      this._localKillRing = null;
      this._yankMarker = null;
      this._disposable = this.cursor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
    }

    EmacsCursor.prototype.mark = function() {
      return this._mark != null ? this._mark : this._mark = new Mark(this.cursor);
    };

    EmacsCursor.prototype.killRing = function() {
      if (this.editor.hasMultipleCursors()) {
        return this.getLocalKillRing();
      } else {
        return KillRing.global;
      }
    };

    EmacsCursor.prototype.getLocalKillRing = function() {
      return this._localKillRing != null ? this._localKillRing : this._localKillRing = KillRing.global.fork();
    };

    EmacsCursor.prototype.clearLocalKillRing = function() {
      return this._localKillRing = null;
    };

    EmacsCursor.prototype.destroy = function() {
      var ref, ref1;
      this.clearLocalKillRing();
      this._disposable.dispose();
      this._disposable = null;
      if ((ref = this._yankMarker) != null) {
        ref.destroy();
      }
      if ((ref1 = this._mark) != null) {
        ref1.destroy();
      }
      return delete this.cursor._atomicEmacs;
    };

    EmacsCursor.prototype.locateBackward = function(regExp) {
      return this._locateBackwardFrom(this.cursor.getBufferPosition(), regExp);
    };

    EmacsCursor.prototype.locateForward = function(regExp) {
      return this._locateForwardFrom(this.cursor.getBufferPosition(), regExp);
    };

    EmacsCursor.prototype.locateWordCharacterBackward = function() {
      return this.locateBackward(this._getWordCharacterRegExp());
    };

    EmacsCursor.prototype.locateWordCharacterForward = function() {
      return this.locateForward(this._getWordCharacterRegExp());
    };

    EmacsCursor.prototype.locateNonWordCharacterBackward = function() {
      return this.locateBackward(this._getNonWordCharacterRegExp());
    };

    EmacsCursor.prototype.locateNonWordCharacterForward = function() {
      return this.locateForward(this._getNonWordCharacterRegExp());
    };

    EmacsCursor.prototype.goToMatchStartBackward = function(regExp) {
      var ref;
      return this._goTo((ref = this.locateBackward(regExp)) != null ? ref.start : void 0);
    };

    EmacsCursor.prototype.goToMatchStartForward = function(regExp) {
      var ref;
      return this._goTo((ref = this.locateForward(regExp)) != null ? ref.start : void 0);
    };

    EmacsCursor.prototype.goToMatchEndBackward = function(regExp) {
      var ref;
      return this._goTo((ref = this.locateBackward(regExp)) != null ? ref.end : void 0);
    };

    EmacsCursor.prototype.goToMatchEndForward = function(regExp) {
      var ref;
      return this._goTo((ref = this.locateForward(regExp)) != null ? ref.end : void 0);
    };

    EmacsCursor.prototype.skipCharactersBackward = function(characters) {
      var regexp;
      regexp = new RegExp("[^" + (escapeRegExp(characters)) + "]");
      return this.skipBackwardUntil(regexp);
    };

    EmacsCursor.prototype.skipCharactersForward = function(characters) {
      var regexp;
      regexp = new RegExp("[^" + (escapeRegExp(characters)) + "]");
      return this.skipForwardUntil(regexp);
    };

    EmacsCursor.prototype.skipWordCharactersBackward = function() {
      return this.skipBackwardUntil(this._getNonWordCharacterRegExp());
    };

    EmacsCursor.prototype.skipWordCharactersForward = function() {
      return this.skipForwardUntil(this._getNonWordCharacterRegExp());
    };

    EmacsCursor.prototype.skipNonWordCharactersBackward = function() {
      return this.skipBackwardUntil(this._getWordCharacterRegExp());
    };

    EmacsCursor.prototype.skipNonWordCharactersForward = function() {
      return this.skipForwardUntil(this._getWordCharacterRegExp());
    };

    EmacsCursor.prototype.skipBackwardUntil = function(regexp) {
      if (!this.goToMatchEndBackward(regexp)) {
        return this._goTo(BOB);
      }
    };

    EmacsCursor.prototype.skipForwardUntil = function(regexp) {
      if (!this.goToMatchStartForward(regexp)) {
        return this._goTo(this.editor.getEofBufferPosition());
      }
    };

    EmacsCursor.prototype.insertAfter = function(text) {
      var position;
      position = this.cursor.getBufferPosition();
      this.editor.setTextInBufferRange([position, position], "\n");
      return this.cursor.setBufferPosition(position);
    };

    EmacsCursor.prototype.horizontalSpaceRange = function() {
      var end, start;
      this.skipCharactersBackward(' \t');
      start = this.cursor.getBufferPosition();
      this.skipCharactersForward(' \t');
      end = this.cursor.getBufferPosition();
      return [start, end];
    };

    EmacsCursor.prototype.deleteBlankLines = function() {
      var blankLineRe, e, eof, point, s;
      eof = this.editor.getEofBufferPosition();
      blankLineRe = /^[ \t]*$/;
      point = this.cursor.getBufferPosition();
      s = e = point.row;
      while (blankLineRe.test(this.cursor.editor.lineTextForBufferRow(e)) && e <= eof.row) {
        e += 1;
      }
      while (s > 0 && blankLineRe.test(this.cursor.editor.lineTextForBufferRow(s - 1))) {
        s -= 1;
      }
      if (s === e) {
        e += 1;
        while (blankLineRe.test(this.cursor.editor.lineTextForBufferRow(e)) && e <= eof.row) {
          e += 1;
        }
        return this.cursor.editor.setTextInBufferRange([[s + 1, 0], [e, 0]], '');
      } else if (e === s + 1) {
        this.cursor.editor.setTextInBufferRange([[s, 0], [e, 0]], '');
        return this.cursor.setBufferPosition([s, 0]);
      } else {
        this.cursor.editor.setTextInBufferRange([[s, 0], [e, 0]], '\n');
        return this.cursor.setBufferPosition([s, 0]);
      }
    };

    EmacsCursor.prototype.transformWord = function(transformer) {
      var end, range, start, text;
      this.skipNonWordCharactersForward();
      start = this.cursor.getBufferPosition();
      this.skipWordCharactersForward();
      end = this.cursor.getBufferPosition();
      range = [start, end];
      text = this.editor.getTextInBufferRange(range);
      return this.editor.setTextInBufferRange(range, transformer(text));
    };

    EmacsCursor.prototype.backwardKillWord = function(method) {
      return this._killUnit(method, (function(_this) {
        return function() {
          var end, start;
          end = _this.cursor.getBufferPosition();
          _this.skipNonWordCharactersBackward();
          _this.skipWordCharactersBackward();
          start = _this.cursor.getBufferPosition();
          return [start, end];
        };
      })(this));
    };

    EmacsCursor.prototype.killWord = function(method) {
      return this._killUnit(method, (function(_this) {
        return function() {
          var end, start;
          start = _this.cursor.getBufferPosition();
          _this.skipNonWordCharactersForward();
          _this.skipWordCharactersForward();
          end = _this.cursor.getBufferPosition();
          return [start, end];
        };
      })(this));
    };

    EmacsCursor.prototype.killLine = function(method) {
      return this._killUnit(method, (function(_this) {
        return function() {
          var end, line, start;
          start = _this.cursor.getBufferPosition();
          line = _this.editor.lineTextForBufferRow(start.row);
          if (start.column === 0 && atom.config.get("atomic-emacs.killWholeLine")) {
            end = [start.row + 1, 0];
          } else {
            if (/^\s*$/.test(line.slice(start.column))) {
              end = [start.row + 1, 0];
            } else {
              end = [start.row, line.length];
            }
          }
          return [start, end];
        };
      })(this));
    };

    EmacsCursor.prototype.killRegion = function(method) {
      return this._killUnit(method, (function(_this) {
        return function() {
          var position;
          position = _this.cursor.selection.getBufferRange();
          return [position, position];
        };
      })(this));
    };

    EmacsCursor.prototype._killUnit = function(method, findRange) {
      var killRing, range, text;
      if (method == null) {
        method = 'push';
      }
      if ((this.cursor.selection != null) && !this.cursor.selection.isEmpty()) {
        range = this.cursor.selection.getBufferRange();
        this.cursor.selection.clear();
      } else {
        range = findRange();
      }
      text = this.editor.getTextInBufferRange(range);
      this.editor.setTextInBufferRange(range, '');
      killRing = this.killRing();
      killRing[method](text);
      return killRing.getCurrentEntry();
    };

    EmacsCursor.prototype.yank = function() {
      var killRing, newRange, position, range;
      killRing = this.killRing();
      if (killRing.isEmpty()) {
        return;
      }
      if (this.cursor.selection) {
        range = this.cursor.selection.getBufferRange();
        this.cursor.selection.clear();
      } else {
        position = this.cursor.getBufferPosition();
        range = [position, position];
      }
      newRange = this.editor.setTextInBufferRange(range, killRing.getCurrentEntry());
      this.cursor.setBufferPosition(newRange.end);
      if (this._yankMarker == null) {
        this._yankMarker = this.editor.markBufferPosition(this.cursor.getBufferPosition());
      }
      return this._yankMarker.setBufferRange(newRange);
    };

    EmacsCursor.prototype.rotateYank = function(n) {
      var entry, range;
      if (this._yankMarker === null) {
        return;
      }
      entry = this.killRing().rotate(n);
      if (entry !== null) {
        range = this.editor.setTextInBufferRange(this._yankMarker.getBufferRange(), entry);
        return this._yankMarker.setBufferRange(range);
      }
    };

    EmacsCursor.prototype.yankComplete = function() {
      var ref;
      if ((ref = this._yankMarker) != null) {
        ref.destroy();
      }
      return this._yankMarker = null;
    };

    EmacsCursor.prototype._nextCharacterFrom = function(position) {
      var lineLength;
      lineLength = this.editor.lineTextForBufferRow(position.row).length;
      if (position.column === lineLength) {
        if (position.row === this.editor.getLastBufferRow()) {
          return null;
        } else {
          return this.editor.getTextInBufferRange([position, [position.row + 1, 0]]);
        }
      } else {
        return this.editor.getTextInBufferRange([position, position.translate([0, 1])]);
      }
    };

    EmacsCursor.prototype._previousCharacterFrom = function(position) {
      var column;
      if (position.column === 0) {
        if (position.row === 0) {
          return null;
        } else {
          column = this.editor.lineTextForBufferRow(position.row - 1).length;
          return this.editor.getTextInBufferRange([[position.row - 1, column], position]);
        }
      } else {
        return this.editor.getTextInBufferRange([position.translate([0, -1]), position]);
      }
    };

    EmacsCursor.prototype.nextCharacter = function() {
      return this._nextCharacterFrom(this.cursor.getBufferPosition());
    };

    EmacsCursor.prototype.previousCharacter = function() {
      return this._nextCharacterFrom(this.cursor.getBufferPosition());
    };

    EmacsCursor.prototype.skipSexpForward = function() {
      var point, target;
      point = this.cursor.getBufferPosition();
      target = this._sexpForwardFrom(point);
      return this.cursor.setBufferPosition(target);
    };

    EmacsCursor.prototype.skipSexpBackward = function() {
      var point, target;
      point = this.cursor.getBufferPosition();
      target = this._sexpBackwardFrom(point);
      return this.cursor.setBufferPosition(target);
    };

    EmacsCursor.prototype.skipListForward = function() {
      var point, target;
      point = this.cursor.getBufferPosition();
      target = this._listForwardFrom(point);
      if (target) {
        return this.cursor.setBufferPosition(target);
      }
    };

    EmacsCursor.prototype.skipListBackward = function() {
      var point, target;
      point = this.cursor.getBufferPosition();
      target = this._listBackwardFrom(point);
      if (target) {
        return this.cursor.setBufferPosition(target);
      }
    };

    EmacsCursor.prototype.markSexp = function() {
      var mark, newTail, range;
      range = this.cursor.getMarker().getBufferRange();
      newTail = this._sexpForwardFrom(range.end);
      mark = this.mark().set(newTail);
      if (!mark.isActive()) {
        return mark.activate();
      }
    };

    EmacsCursor.prototype.transposeChars = function() {
      var column, line, pair, pairRange, previousLine, ref, row;
      ref = this.cursor.getBufferPosition(), row = ref.row, column = ref.column;
      if (row === 0 && column === 0) {
        return;
      }
      line = this.editor.lineTextForBufferRow(row);
      if (column === 0) {
        previousLine = this.editor.lineTextForBufferRow(row - 1);
        pairRange = [[row - 1, previousLine.length], [row, 1]];
      } else if (column === line.length) {
        pairRange = [[row, column - 2], [row, column]];
      } else {
        pairRange = [[row, column - 1], [row, column + 1]];
      }
      pair = this.editor.getTextInBufferRange(pairRange);
      return this.editor.setTextInBufferRange(pairRange, (pair[1] || '') + pair[0]);
    };

    EmacsCursor.prototype.transposeWords = function() {
      var word1Range, word2Range;
      this.skipNonWordCharactersBackward();
      word1Range = this._wordRange();
      this.skipWordCharactersForward();
      this.skipNonWordCharactersForward();
      if (this.editor.getEofBufferPosition().isEqual(this.cursor.getBufferPosition())) {
        return this.skipNonWordCharactersBackward();
      } else {
        word2Range = this._wordRange();
        return this._transposeRanges(word1Range, word2Range);
      }
    };

    EmacsCursor.prototype.transposeSexps = function() {
      var end1, end2, start1, start2;
      this.skipSexpBackward();
      start1 = this.cursor.getBufferPosition();
      this.skipSexpForward();
      end1 = this.cursor.getBufferPosition();
      this.skipSexpForward();
      end2 = this.cursor.getBufferPosition();
      this.skipSexpBackward();
      start2 = this.cursor.getBufferPosition();
      return this._transposeRanges([start1, end1], [start2, end2]);
    };

    EmacsCursor.prototype.transposeLines = function() {
      var lineRange, row, text;
      row = this.cursor.getBufferRow();
      if (row === 0) {
        this._endLineIfNecessary();
        this.cursor.moveDown();
        row += 1;
      }
      this._endLineIfNecessary();
      lineRange = [[row, 0], [row + 1, 0]];
      text = this.editor.getTextInBufferRange(lineRange);
      this.editor.setTextInBufferRange(lineRange, '');
      return this.editor.setTextInBufferRange([[row - 1, 0], [row - 1, 0]], text);
    };

    EmacsCursor.prototype._wordRange = function() {
      var range, wordEnd, wordStart;
      this.skipWordCharactersBackward();
      range = this.locateNonWordCharacterBackward();
      wordStart = range ? range.end : [0, 0];
      range = this.locateNonWordCharacterForward();
      wordEnd = range ? range.start : this.editor.getEofBufferPosition();
      return [wordStart, wordEnd];
    };

    EmacsCursor.prototype._endLineIfNecessary = function() {
      var length, row;
      row = this.cursor.getBufferPosition().row;
      if (row === this.editor.getLineCount() - 1) {
        length = this.cursor.getCurrentBufferLine().length;
        return this.editor.setTextInBufferRange([[row, length], [row, length]], "\n");
      }
    };

    EmacsCursor.prototype._transposeRanges = function(range1, range2) {
      var text1, text2;
      text1 = this.editor.getTextInBufferRange(range1);
      text2 = this.editor.getTextInBufferRange(range2);
      this.editor.setTextInBufferRange(range2, text1);
      this.editor.setTextInBufferRange(range1, text2);
      return this.cursor.setBufferPosition(range2[1]);
    };

    EmacsCursor.prototype._sexpForwardFrom = function(point) {
      var character, eob, eof, quotes, re, ref, ref1, result, stack;
      eob = this.editor.getEofBufferPosition();
      point = ((ref = this._locateForwardFrom(point, /[\w()[\]{}'"]/i)) != null ? ref.start : void 0) || eob;
      character = this._nextCharacterFrom(point);
      if (OPENERS.hasOwnProperty(character) || CLOSERS.hasOwnProperty(character)) {
        result = null;
        stack = [];
        quotes = 0;
        eof = this.editor.getEofBufferPosition();
        re = /[^()[\]{}"'`\\]+|\\.|[()[\]{}"'`]/g;
        this.editor.scanInBufferRange(re, [point, eof], (function(_this) {
          return function(hit) {
            var closer;
            if (hit.matchText === stack[stack.length - 1]) {
              stack.pop();
              if (stack.length === 0) {
                result = hit.range.end;
                return hit.stop();
              } else if (/^["'`]$/.test(hit.matchText)) {
                return quotes -= 1;
              }
            } else if ((closer = OPENERS[hit.matchText])) {
              if (!(/^["'`]$/.test(closer) && quotes > 0)) {
                stack.push(closer);
                if (/^["'`]$/.test(closer)) {
                  return quotes += 1;
                }
              }
            } else if (CLOSERS[hit.matchText]) {
              if (stack.length === 0) {
                return hit.stop();
              }
            }
          };
        })(this));
        return result || point;
      } else {
        return ((ref1 = this._locateForwardFrom(point, /[\W\n]/i)) != null ? ref1.start : void 0) || eob;
      }
    };

    EmacsCursor.prototype._sexpBackwardFrom = function(point) {
      var character, quotes, re, ref, ref1, result, stack;
      point = ((ref = this._locateBackwardFrom(point, /[\w()[\]{}'"]/i)) != null ? ref.end : void 0) || BOB;
      character = this._previousCharacterFrom(point);
      if (OPENERS.hasOwnProperty(character) || CLOSERS.hasOwnProperty(character)) {
        result = null;
        stack = [];
        quotes = 0;
        re = /[^()[\]{}"'`\\]+|\\.|[()[\]{}"'`]/g;
        this.editor.backwardsScanInBufferRange(re, [BOB, point], (function(_this) {
          return function(hit) {
            var opener;
            if (hit.matchText === stack[stack.length - 1]) {
              stack.pop();
              if (stack.length === 0) {
                result = hit.range.start;
                return hit.stop();
              } else if (/^["'`]$/.test(hit.matchText)) {
                return quotes -= 1;
              }
            } else if ((opener = CLOSERS[hit.matchText])) {
              if (!(/^["'`]$/.test(opener) && quotes > 0)) {
                stack.push(opener);
                if (/^["'`]$/.test(opener)) {
                  return quotes += 1;
                }
              }
            } else if (OPENERS[hit.matchText]) {
              if (stack.length === 0) {
                return hit.stop();
              }
            }
          };
        })(this));
        return result || point;
      } else {
        return ((ref1 = this._locateBackwardFrom(point, /[\W\n]/i)) != null ? ref1.end : void 0) || BOB;
      }
    };

    EmacsCursor.prototype._listForwardFrom = function(point) {
      var end, eob, match;
      eob = this.editor.getEofBufferPosition();
      if (!(match = this._locateForwardFrom(point, /[()[\]{}]/i))) {
        return null;
      }
      end = this._sexpForwardFrom(match.start);
      if (end.isEqual(match.start)) {
        return null;
      } else {
        return end;
      }
    };

    EmacsCursor.prototype._listBackwardFrom = function(point) {
      var match, start;
      if (!(match = this._locateBackwardFrom(point, /[()[\]{}]/i))) {
        return null;
      }
      start = this._sexpBackwardFrom(match.end);
      if (start.isEqual(match.end)) {
        return null;
      } else {
        return start;
      }
    };

    EmacsCursor.prototype._locateBackwardFrom = function(point, regExp) {
      var result;
      result = null;
      this.editor.backwardsScanInBufferRange(regExp, [BOB, point], function(hit) {
        return result = hit.range;
      });
      return result;
    };

    EmacsCursor.prototype._locateForwardFrom = function(point, regExp) {
      var eof, result;
      result = null;
      eof = this.editor.getEofBufferPosition();
      this.editor.scanInBufferRange(regExp, [point, eof], function(hit) {
        return result = hit.range;
      });
      return result;
    };

    EmacsCursor.prototype._getWordCharacterRegExp = function() {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp('[^\\s' + escapeRegExp(nonWordCharacters) + ']');
    };

    EmacsCursor.prototype._getNonWordCharacterRegExp = function() {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp('[\\s' + escapeRegExp(nonWordCharacters) + ']');
    };

    EmacsCursor.prototype._goTo = function(point) {
      if (point) {
        this.cursor.setBufferPosition(point);
        return true;
      } else {
        return false;
      }
    };

    return EmacsCursor;

  })();

  escapeRegExp = function(string) {
    if (string) {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    } else {
      return '';
    }
  };

  BOB = {
    row: 0,
    column: 0
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9taWMtZW1hY3MvbGliL2VtYWNzLWN1cnNvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ04sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixPQUFBLEdBQVU7SUFBQyxHQUFBLEVBQUssR0FBTjtJQUFXLEdBQUEsRUFBSyxHQUFoQjtJQUFxQixHQUFBLEVBQUssR0FBMUI7SUFBK0IsSUFBQSxFQUFNLElBQXJDO0lBQTJDLEdBQUEsRUFBSyxHQUFoRDtJQUFxRCxHQUFBLEVBQUssR0FBMUQ7OztFQUNWLE9BQUEsR0FBVTtJQUFDLEdBQUEsRUFBSyxHQUFOO0lBQVcsR0FBQSxFQUFLLEdBQWhCO0lBQXFCLEdBQUEsRUFBSyxHQUExQjtJQUErQixJQUFBLEVBQU0sSUFBckM7SUFBMkMsR0FBQSxFQUFLLEdBQWhEO0lBQXFELEdBQUEsRUFBSyxHQUExRDs7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNKLFdBQUMsRUFBQSxHQUFBLEVBQUQsR0FBTSxTQUFDLE1BQUQ7MkNBQ0osTUFBTSxDQUFDLGVBQVAsTUFBTSxDQUFDLGVBQW9CLElBQUEsV0FBQSxDQUFZLE1BQVo7SUFEdkI7O0lBR08scUJBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQ1osSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDO01BQ2xCLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsY0FBRCxHQUFrQjtNQUNsQixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsQ0FBQSxT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QixNQUExQixFQUFrQyxDQUFDLEtBQUQsRUFBUSxHQUFSLENBQWxDLEVBQWdELFNBQUMsR0FBRDtlQUM5QyxNQUFBLEdBQVMsR0FBRyxDQUFDO01BRGlDLENBQWhEO2FBRUE7SUFMa0I7OzBCQU9wQix1QkFBQSxHQUF5QixTQUFBO0FBQ3ZCLFVBQUE7TUFBQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCO2FBQ2hCLElBQUEsTUFBQSxDQUFPLE9BQUEsR0FBVSxZQUFBLENBQWEsaUJBQWIsQ0FBVixHQUE0QyxHQUFuRDtJQUZtQjs7MEJBSXpCLDBCQUFBLEdBQTRCLFNBQUE7QUFDMUIsVUFBQTtNQUFBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEI7YUFDaEIsSUFBQSxNQUFBLENBQU8sTUFBQSxHQUFTLFlBQUEsQ0FBYSxpQkFBYixDQUFULEdBQTJDLEdBQWxEO0lBRnNCOzswQkFJNUIsS0FBQSxHQUFPLFNBQUMsS0FBRDtNQUNMLElBQUcsS0FBSDtRQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBMEIsS0FBMUI7ZUFDQSxLQUZGO09BQUEsTUFBQTtlQUlFLE1BSkY7O0lBREs7Ozs7OztFQVNULFlBQUEsR0FBZSxTQUFDLE1BQUQ7SUFDYixJQUFHLE1BQUg7YUFDRSxNQUFNLENBQUMsT0FBUCxDQUFlLHdCQUFmLEVBQXlDLE1BQXpDLEVBREY7S0FBQSxNQUFBO2FBR0UsR0FIRjs7RUFEYTs7RUFNZixHQUFBLEdBQU07SUFBQyxHQUFBLEVBQUssQ0FBTjtJQUFTLE1BQUEsRUFBUSxDQUFqQjs7QUEzZ0JOIiwic291cmNlc0NvbnRlbnQiOlsiS2lsbFJpbmcgPSByZXF1aXJlICcuL2tpbGwtcmluZydcclxuTWFyayA9IHJlcXVpcmUgJy4vbWFyaydcclxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcclxuXHJcbk9QRU5FUlMgPSB7JygnOiAnKScsICdbJzogJ10nLCAneyc6ICd9JywgJ1xcJyc6ICdcXCcnLCAnXCInOiAnXCInLCAnYCc6ICdgJ31cclxuQ0xPU0VSUyA9IHsnKSc6ICcoJywgJ10nOiAnWycsICd9JzogJ3snLCAnXFwnJzogJ1xcJycsICdcIic6ICdcIicsICdgJzogJ2AnfVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG5jbGFzcyBFbWFjc0N1cnNvclxyXG4gIEBmb3I6IChjdXJzb3IpIC0+XHJcbiAgICBjdXJzb3IuX2F0b21pY0VtYWNzID89IG5ldyBFbWFjc0N1cnNvcihjdXJzb3IpXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoQGN1cnNvcikgLT5cclxuICAgIEBlZGl0b3IgPSBAY3Vyc29yLmVkaXRvclxyXG4gICAgQF9tYXJrID0gbnVsbFxyXG4gICAgQF9sb2NhbEtpbGxSaW5nID0gbnVsbFxyXG4gICAgQF95YW5rTWFya2VyID0gbnVsbFxyXG4gICAgQF9kaXNwb3NhYmxlID0gQGN1cnNvci5vbkRpZERlc3Ryb3kgPT4gQGRlc3Ryb3koKVxyXG5cclxuICBtYXJrOiAtPlxyXG4gICAgQF9tYXJrID89IG5ldyBNYXJrKEBjdXJzb3IpXHJcblxyXG4gIGtpbGxSaW5nOiAtPlxyXG4gICAgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKVxyXG4gICAgICBAZ2V0TG9jYWxLaWxsUmluZygpXHJcbiAgICBlbHNlXHJcbiAgICAgIEtpbGxSaW5nLmdsb2JhbFxyXG5cclxuICBnZXRMb2NhbEtpbGxSaW5nOiAtPlxyXG4gICAgQF9sb2NhbEtpbGxSaW5nID89IEtpbGxSaW5nLmdsb2JhbC5mb3JrKClcclxuXHJcbiAgY2xlYXJMb2NhbEtpbGxSaW5nOiAtPlxyXG4gICAgQF9sb2NhbEtpbGxSaW5nID0gbnVsbFxyXG5cclxuICBkZXN0cm95OiAtPlxyXG4gICAgQGNsZWFyTG9jYWxLaWxsUmluZygpXHJcbiAgICBAX2Rpc3Bvc2FibGUuZGlzcG9zZSgpXHJcbiAgICBAX2Rpc3Bvc2FibGUgPSBudWxsXHJcbiAgICBAX3lhbmtNYXJrZXI/LmRlc3Ryb3koKVxyXG4gICAgQF9tYXJrPy5kZXN0cm95KClcclxuICAgIGRlbGV0ZSBAY3Vyc29yLl9hdG9taWNFbWFjc1xyXG5cclxuICAjIExvb2sgZm9yIHRoZSBwcmV2aW91cyBvY2N1cnJlbmNlIG9mIHRoZSBnaXZlbiByZWdleHAuXHJcbiAgI1xyXG4gICMgUmV0dXJuIGEgUmFuZ2UgaWYgZm91bmQsIG51bGwgb3RoZXJ3aXNlLiBUaGlzIGRvZXMgbm90IG1vdmUgdGhlIGN1cnNvci5cclxuICBsb2NhdGVCYWNrd2FyZDogKHJlZ0V4cCkgLT5cclxuICAgIEBfbG9jYXRlQmFja3dhcmRGcm9tKEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSwgcmVnRXhwKVxyXG5cclxuICAjIExvb2sgZm9yIHRoZSBuZXh0IG9jY3VycmVuY2Ugb2YgdGhlIGdpdmVuIHJlZ2V4cC5cclxuICAjXHJcbiAgIyBSZXR1cm4gYSBSYW5nZSBpZiBmb3VuZCwgbnVsbCBvdGhlcndpc2UuIFRoaXMgZG9lcyBub3QgbW92ZSB0aGUgY3Vyc29yLlxyXG4gIGxvY2F0ZUZvcndhcmQ6IChyZWdFeHApIC0+XHJcbiAgICBAX2xvY2F0ZUZvcndhcmRGcm9tKEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSwgcmVnRXhwKVxyXG5cclxuICAjIExvb2sgZm9yIHRoZSBwcmV2aW91cyB3b3JkIGNoYXJhY3Rlci5cclxuICAjXHJcbiAgIyBSZXR1cm4gYSBSYW5nZSBpZiBmb3VuZCwgbnVsbCBvdGhlcndpc2UuIFRoaXMgZG9lcyBub3QgbW92ZSB0aGUgY3Vyc29yLlxyXG4gIGxvY2F0ZVdvcmRDaGFyYWN0ZXJCYWNrd2FyZDogLT5cclxuICAgIEBsb2NhdGVCYWNrd2FyZCBAX2dldFdvcmRDaGFyYWN0ZXJSZWdFeHAoKVxyXG5cclxuICAjIExvb2sgZm9yIHRoZSBuZXh0IHdvcmQgY2hhcmFjdGVyLlxyXG4gICNcclxuICAjIFJldHVybiBhIFJhbmdlIGlmIGZvdW5kLCBudWxsIG90aGVyd2lzZS4gVGhpcyBkb2VzIG5vdCBtb3ZlIHRoZSBjdXJzb3IuXHJcbiAgbG9jYXRlV29yZENoYXJhY3RlckZvcndhcmQ6IC0+XHJcbiAgICBAbG9jYXRlRm9yd2FyZCBAX2dldFdvcmRDaGFyYWN0ZXJSZWdFeHAoKVxyXG5cclxuICAjIExvb2sgZm9yIHRoZSBwcmV2aW91cyBub253b3JkIGNoYXJhY3Rlci5cclxuICAjXHJcbiAgIyBSZXR1cm4gYSBSYW5nZSBpZiBmb3VuZCwgbnVsbCBvdGhlcndpc2UuIFRoaXMgZG9lcyBub3QgbW92ZSB0aGUgY3Vyc29yLlxyXG4gIGxvY2F0ZU5vbldvcmRDaGFyYWN0ZXJCYWNrd2FyZDogLT5cclxuICAgIEBsb2NhdGVCYWNrd2FyZCBAX2dldE5vbldvcmRDaGFyYWN0ZXJSZWdFeHAoKVxyXG5cclxuICAjIExvb2sgZm9yIHRoZSBuZXh0IG5vbndvcmQgY2hhcmFjdGVyLlxyXG4gICNcclxuICAjIFJldHVybiBhIFJhbmdlIGlmIGZvdW5kLCBudWxsIG90aGVyd2lzZS4gVGhpcyBkb2VzIG5vdCBtb3ZlIHRoZSBjdXJzb3IuXHJcbiAgbG9jYXRlTm9uV29yZENoYXJhY3RlckZvcndhcmQ6IC0+XHJcbiAgICBAbG9jYXRlRm9yd2FyZCBAX2dldE5vbldvcmRDaGFyYWN0ZXJSZWdFeHAoKVxyXG5cclxuICAjIE1vdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBwcmV2aW91cyBvY2N1cnJlbmNlIG9mIHRoZSBnaXZlbiByZWdleHAuXHJcbiAgI1xyXG4gICMgUmV0dXJuIHRydWUgaWYgZm91bmQsIGZhbHNlIG90aGVyd2lzZS5cclxuICBnb1RvTWF0Y2hTdGFydEJhY2t3YXJkOiAocmVnRXhwKSAtPlxyXG4gICAgQF9nb1RvIEBsb2NhdGVCYWNrd2FyZChyZWdFeHApPy5zdGFydFxyXG5cclxuICAjIE1vdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBuZXh0IG9jY3VycmVuY2Ugb2YgdGhlIGdpdmVuIHJlZ2V4cC5cclxuICAjXHJcbiAgIyBSZXR1cm4gdHJ1ZSBpZiBmb3VuZCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gIGdvVG9NYXRjaFN0YXJ0Rm9yd2FyZDogKHJlZ0V4cCkgLT5cclxuICAgIEBfZ29UbyBAbG9jYXRlRm9yd2FyZChyZWdFeHApPy5zdGFydFxyXG5cclxuICAjIE1vdmUgdG8gdGhlIGVuZCBvZiB0aGUgcHJldmlvdXMgb2NjdXJyZW5jZSBvZiB0aGUgZ2l2ZW4gcmVnZXhwLlxyXG4gICNcclxuICAjIFJldHVybiB0cnVlIGlmIGZvdW5kLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAgZ29Ub01hdGNoRW5kQmFja3dhcmQ6IChyZWdFeHApIC0+XHJcbiAgICBAX2dvVG8gQGxvY2F0ZUJhY2t3YXJkKHJlZ0V4cCk/LmVuZFxyXG5cclxuICAjIE1vdmUgdG8gdGhlIGVuZCBvZiB0aGUgbmV4dCBvY2N1cnJlbmNlIG9mIHRoZSBnaXZlbiByZWdleHAuXHJcbiAgI1xyXG4gICMgUmV0dXJuIHRydWUgaWYgZm91bmQsIGZhbHNlIG90aGVyd2lzZS5cclxuICBnb1RvTWF0Y2hFbmRGb3J3YXJkOiAocmVnRXhwKSAtPlxyXG4gICAgQF9nb1RvIEBsb2NhdGVGb3J3YXJkKHJlZ0V4cCk/LmVuZFxyXG5cclxuICAjIFNraXAgYmFja3dhcmRzIG92ZXIgdGhlIGdpdmVuIGNoYXJhY3RlcnMuXHJcbiAgI1xyXG4gICMgSWYgdGhlIGVuZCBvZiB0aGUgYnVmZmVyIGlzIHJlYWNoZWQsIHJlbWFpbiB0aGVyZS5cclxuICBza2lwQ2hhcmFjdGVyc0JhY2t3YXJkOiAoY2hhcmFjdGVycykgLT5cclxuICAgIHJlZ2V4cCA9IG5ldyBSZWdFeHAoXCJbXiN7ZXNjYXBlUmVnRXhwKGNoYXJhY3RlcnMpfV1cIilcclxuICAgIEBza2lwQmFja3dhcmRVbnRpbChyZWdleHApXHJcblxyXG4gICMgU2tpcCBmb3J3YXJkcyBvdmVyIHRoZSBnaXZlbiBjaGFyYWN0ZXJzLlxyXG4gICNcclxuICAjIElmIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlciBpcyByZWFjaGVkLCByZW1haW4gdGhlcmUuXHJcbiAgc2tpcENoYXJhY3RlcnNGb3J3YXJkOiAoY2hhcmFjdGVycykgLT5cclxuICAgIHJlZ2V4cCA9IG5ldyBSZWdFeHAoXCJbXiN7ZXNjYXBlUmVnRXhwKGNoYXJhY3RlcnMpfV1cIilcclxuICAgIEBza2lwRm9yd2FyZFVudGlsKHJlZ2V4cClcclxuXHJcbiAgIyBTa2lwIGJhY2t3YXJkcyBvdmVyIGFueSB3b3JkIGNoYXJhY3RlcnMuXHJcbiAgI1xyXG4gICMgSWYgdGhlIGJlZ2lubmluZyBvZiB0aGUgYnVmZmVyIGlzIHJlYWNoZWQsIHJlbWFpbiB0aGVyZS5cclxuICBza2lwV29yZENoYXJhY3RlcnNCYWNrd2FyZDogLT5cclxuICAgIEBza2lwQmFja3dhcmRVbnRpbChAX2dldE5vbldvcmRDaGFyYWN0ZXJSZWdFeHAoKSlcclxuXHJcbiAgIyBTa2lwIGZvcndhcmRzIG92ZXIgYW55IHdvcmQgY2hhcmFjdGVycy5cclxuICAjXHJcbiAgIyBJZiB0aGUgZW5kIG9mIHRoZSBidWZmZXIgaXMgcmVhY2hlZCwgcmVtYWluIHRoZXJlLlxyXG4gIHNraXBXb3JkQ2hhcmFjdGVyc0ZvcndhcmQ6IC0+XHJcbiAgICBAc2tpcEZvcndhcmRVbnRpbChAX2dldE5vbldvcmRDaGFyYWN0ZXJSZWdFeHAoKSlcclxuXHJcbiAgIyBTa2lwIGJhY2t3YXJkcyBvdmVyIGFueSBub24td29yZCBjaGFyYWN0ZXJzLlxyXG4gICNcclxuICAjIElmIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGJ1ZmZlciBpcyByZWFjaGVkLCByZW1haW4gdGhlcmUuXHJcbiAgc2tpcE5vbldvcmRDaGFyYWN0ZXJzQmFja3dhcmQ6IC0+XHJcbiAgICBAc2tpcEJhY2t3YXJkVW50aWwoQF9nZXRXb3JkQ2hhcmFjdGVyUmVnRXhwKCkpXHJcblxyXG4gICMgU2tpcCBmb3J3YXJkcyBvdmVyIGFueSBub24td29yZCBjaGFyYWN0ZXJzLlxyXG4gICNcclxuICAjIElmIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlciBpcyByZWFjaGVkLCByZW1haW4gdGhlcmUuXHJcbiAgc2tpcE5vbldvcmRDaGFyYWN0ZXJzRm9yd2FyZDogLT5cclxuICAgIEBza2lwRm9yd2FyZFVudGlsKEBfZ2V0V29yZENoYXJhY3RlclJlZ0V4cCgpKVxyXG5cclxuICAjIFNraXAgb3ZlciBjaGFyYWN0ZXJzIHVudGlsIHRoZSBwcmV2aW91cyBvY2N1cnJlbmNlIG9mIHRoZSBnaXZlbiByZWdleHAuXHJcbiAgI1xyXG4gICMgSWYgdGhlIGJlZ2lubmluZyBvZiB0aGUgYnVmZmVyIGlzIHJlYWNoZWQsIHJlbWFpbiB0aGVyZS5cclxuICBza2lwQmFja3dhcmRVbnRpbDogKHJlZ2V4cCkgLT5cclxuICAgIGlmIG5vdCBAZ29Ub01hdGNoRW5kQmFja3dhcmQocmVnZXhwKVxyXG4gICAgICBAX2dvVG8gQk9CXHJcblxyXG4gICMgU2tpcCBvdmVyIGNoYXJhY3RlcnMgdW50aWwgdGhlIG5leHQgb2NjdXJyZW5jZSBvZiB0aGUgZ2l2ZW4gcmVnZXhwLlxyXG4gICNcclxuICAjIElmIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlciBpcyByZWFjaGVkLCByZW1haW4gdGhlcmUuXHJcbiAgc2tpcEZvcndhcmRVbnRpbDogKHJlZ2V4cCkgLT5cclxuICAgIGlmIG5vdCBAZ29Ub01hdGNoU3RhcnRGb3J3YXJkKHJlZ2V4cClcclxuICAgICAgQF9nb1RvIEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxyXG5cclxuICAjIEluc2VydCB0aGUgZ2l2ZW4gdGV4dCBhZnRlciB0aGlzIGN1cnNvci5cclxuICBpbnNlcnRBZnRlcjogKHRleHQpIC0+XHJcbiAgICBwb3NpdGlvbiA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9zaXRpb24sIHBvc2l0aW9uXSwgXCJcXG5cIilcclxuICAgIEBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9zaXRpb24pXHJcblxyXG4gIGhvcml6b250YWxTcGFjZVJhbmdlOiAtPlxyXG4gICAgQHNraXBDaGFyYWN0ZXJzQmFja3dhcmQoJyBcXHQnKVxyXG4gICAgc3RhcnQgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIEBza2lwQ2hhcmFjdGVyc0ZvcndhcmQoJyBcXHQnKVxyXG4gICAgZW5kID0gQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXHJcbiAgICBbc3RhcnQsIGVuZF1cclxuXHJcbiAgZGVsZXRlQmxhbmtMaW5lczogLT5cclxuICAgIGVvZiA9IEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxyXG4gICAgYmxhbmtMaW5lUmUgPSAvXlsgXFx0XSokL1xyXG5cclxuICAgIHBvaW50ID0gQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXHJcbiAgICBzID0gZSA9IHBvaW50LnJvd1xyXG4gICAgd2hpbGUgYmxhbmtMaW5lUmUudGVzdChAY3Vyc29yLmVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlKSkgYW5kIGUgPD0gZW9mLnJvd1xyXG4gICAgICBlICs9IDFcclxuICAgIHdoaWxlIHMgPiAwIGFuZCBibGFua0xpbmVSZS50ZXN0KEBjdXJzb3IuZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHMgLSAxKSlcclxuICAgICAgcyAtPSAxXHJcblxyXG4gICAgaWYgcyA9PSBlXHJcbiAgICAgICMgTm8gYmxhbmtzOiBkZWxldGUgYmxhbmtzIGFoZWFkLlxyXG4gICAgICBlICs9IDFcclxuICAgICAgd2hpbGUgYmxhbmtMaW5lUmUudGVzdChAY3Vyc29yLmVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlKSkgYW5kIGUgPD0gZW9mLnJvd1xyXG4gICAgICAgIGUgKz0gMVxyXG4gICAgICBAY3Vyc29yLmVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW3MgKyAxLCAwXSwgW2UsIDBdXSwgJycpXHJcbiAgICBlbHNlIGlmIGUgPT0gcyArIDFcclxuICAgICAgIyBPbmUgYmxhbms6IGRlbGV0ZSBpdC5cclxuICAgICAgQGN1cnNvci5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tzLCAwXSwgW2UsIDBdXSwgJycpXHJcbiAgICAgIEBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3MsIDBdKVxyXG4gICAgZWxzZVxyXG4gICAgICAjIE11bHRpcGxlIGJsYW5rczogZGVsZXRlIGFsbCBidXQgb25lLlxyXG4gICAgICBAY3Vyc29yLmVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW3MsIDBdLCBbZSwgMF1dLCAnXFxuJylcclxuICAgICAgQGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcywgMF0pXHJcblxyXG4gIHRyYW5zZm9ybVdvcmQ6ICh0cmFuc2Zvcm1lcikgLT5cclxuICAgIEBza2lwTm9uV29yZENoYXJhY3RlcnNGb3J3YXJkKClcclxuICAgIHN0YXJ0ID0gQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXHJcbiAgICBAc2tpcFdvcmRDaGFyYWN0ZXJzRm9yd2FyZCgpXHJcbiAgICBlbmQgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIHJhbmdlID0gW3N0YXJ0LCBlbmRdXHJcbiAgICB0ZXh0ID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcclxuICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsIHRyYW5zZm9ybWVyKHRleHQpKVxyXG5cclxuICBiYWNrd2FyZEtpbGxXb3JkOiAobWV0aG9kKSAtPlxyXG4gICAgQF9raWxsVW5pdCBtZXRob2QsID0+XHJcbiAgICAgIGVuZCA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG4gICAgICBAc2tpcE5vbldvcmRDaGFyYWN0ZXJzQmFja3dhcmQoKVxyXG4gICAgICBAc2tpcFdvcmRDaGFyYWN0ZXJzQmFja3dhcmQoKVxyXG4gICAgICBzdGFydCA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG4gICAgICBbc3RhcnQsIGVuZF1cclxuXHJcbiAga2lsbFdvcmQ6IChtZXRob2QpIC0+XHJcbiAgICBAX2tpbGxVbml0IG1ldGhvZCwgPT5cclxuICAgICAgc3RhcnQgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgICAgQHNraXBOb25Xb3JkQ2hhcmFjdGVyc0ZvcndhcmQoKVxyXG4gICAgICBAc2tpcFdvcmRDaGFyYWN0ZXJzRm9yd2FyZCgpXHJcbiAgICAgIGVuZCA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG4gICAgICBbc3RhcnQsIGVuZF1cclxuXHJcbiAga2lsbExpbmU6IChtZXRob2QpIC0+XHJcbiAgICBAX2tpbGxVbml0IG1ldGhvZCwgPT5cclxuICAgICAgc3RhcnQgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc3RhcnQucm93KVxyXG4gICAgICBpZiBzdGFydC5jb2x1bW4gPT0gMCBhbmQgYXRvbS5jb25maWcuZ2V0KFwiYXRvbWljLWVtYWNzLmtpbGxXaG9sZUxpbmVcIilcclxuICAgICAgICAgIGVuZCA9IFtzdGFydC5yb3cgKyAxLCAwXVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgL15cXHMqJC8udGVzdChsaW5lLnNsaWNlKHN0YXJ0LmNvbHVtbikpXHJcbiAgICAgICAgICBlbmQgPSBbc3RhcnQucm93ICsgMSwgMF1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBlbmQgPSBbc3RhcnQucm93LCBsaW5lLmxlbmd0aF1cclxuICAgICAgW3N0YXJ0LCBlbmRdXHJcblxyXG4gIGtpbGxSZWdpb246IChtZXRob2QpIC0+XHJcbiAgICBAX2tpbGxVbml0IG1ldGhvZCwgPT5cclxuICAgICAgcG9zaXRpb24gPSBAY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXHJcbiAgICAgIFtwb3NpdGlvbiwgcG9zaXRpb25dXHJcblxyXG4gIF9raWxsVW5pdDogKG1ldGhvZD0ncHVzaCcsIGZpbmRSYW5nZSkgLT5cclxuICAgIGlmIEBjdXJzb3Iuc2VsZWN0aW9uPyBhbmQgbm90IEBjdXJzb3Iuc2VsZWN0aW9uLmlzRW1wdHkoKVxyXG4gICAgICByYW5nZSA9IEBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcclxuICAgICAgQGN1cnNvci5zZWxlY3Rpb24uY2xlYXIoKVxyXG4gICAgZWxzZVxyXG4gICAgICByYW5nZSA9IGZpbmRSYW5nZSgpXHJcblxyXG4gICAgdGV4dCA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXHJcbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlLCAnJylcclxuICAgIGtpbGxSaW5nID0gQGtpbGxSaW5nKClcclxuICAgIGtpbGxSaW5nW21ldGhvZF0odGV4dClcclxuICAgIGtpbGxSaW5nLmdldEN1cnJlbnRFbnRyeSgpXHJcblxyXG4gIHlhbms6IC0+XHJcbiAgICBraWxsUmluZyA9IEBraWxsUmluZygpXHJcbiAgICByZXR1cm4gaWYga2lsbFJpbmcuaXNFbXB0eSgpXHJcbiAgICBpZiBAY3Vyc29yLnNlbGVjdGlvblxyXG4gICAgICByYW5nZSA9IEBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcclxuICAgICAgQGN1cnNvci5zZWxlY3Rpb24uY2xlYXIoKVxyXG4gICAgZWxzZVxyXG4gICAgICBwb3NpdGlvbiA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG4gICAgICByYW5nZSA9IFtwb3NpdGlvbiwgcG9zaXRpb25dXHJcbiAgICBuZXdSYW5nZSA9IEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UsIGtpbGxSaW5nLmdldEN1cnJlbnRFbnRyeSgpKVxyXG4gICAgQGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihuZXdSYW5nZS5lbmQpXHJcbiAgICBAX3lhbmtNYXJrZXIgPz0gQGVkaXRvci5tYXJrQnVmZmVyUG9zaXRpb24oQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxyXG4gICAgQF95YW5rTWFya2VyLnNldEJ1ZmZlclJhbmdlKG5ld1JhbmdlKVxyXG5cclxuICByb3RhdGVZYW5rOiAobikgLT5cclxuICAgIHJldHVybiBpZiBAX3lhbmtNYXJrZXIgPT0gbnVsbFxyXG4gICAgZW50cnkgPSBAa2lsbFJpbmcoKS5yb3RhdGUobilcclxuICAgIHVubGVzcyBlbnRyeSBpcyBudWxsXHJcbiAgICAgIHJhbmdlID0gQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShAX3lhbmtNYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSwgZW50cnkpXHJcbiAgICAgIEBfeWFua01hcmtlci5zZXRCdWZmZXJSYW5nZShyYW5nZSlcclxuXHJcbiAgeWFua0NvbXBsZXRlOiAtPlxyXG4gICAgQF95YW5rTWFya2VyPy5kZXN0cm95KClcclxuICAgIEBfeWFua01hcmtlciA9IG51bGxcclxuXHJcbiAgX25leHRDaGFyYWN0ZXJGcm9tOiAocG9zaXRpb24pIC0+XHJcbiAgICBsaW5lTGVuZ3RoID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhwb3NpdGlvbi5yb3cpLmxlbmd0aFxyXG4gICAgaWYgcG9zaXRpb24uY29sdW1uID09IGxpbmVMZW5ndGhcclxuICAgICAgaWYgcG9zaXRpb24ucm93ID09IEBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXHJcbiAgICAgICAgbnVsbFxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9zaXRpb24sIFtwb3NpdGlvbi5yb3cgKyAxLCAwXV0pXHJcbiAgICBlbHNlXHJcbiAgICAgIEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW3Bvc2l0aW9uLCBwb3NpdGlvbi50cmFuc2xhdGUoWzAsIDFdKV0pXHJcblxyXG4gIF9wcmV2aW91c0NoYXJhY3RlckZyb206IChwb3NpdGlvbikgLT5cclxuICAgIGlmIHBvc2l0aW9uLmNvbHVtbiA9PSAwXHJcbiAgICAgIGlmIHBvc2l0aW9uLnJvdyA9PSAwXHJcbiAgICAgICAgbnVsbFxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgY29sdW1uID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhwb3NpdGlvbi5yb3cgLSAxKS5sZW5ndGhcclxuICAgICAgICBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbcG9zaXRpb24ucm93IC0gMSwgY29sdW1uXSwgcG9zaXRpb25dKVxyXG4gICAgZWxzZVxyXG4gICAgICBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtwb3NpdGlvbi50cmFuc2xhdGUoWzAsIC0xXSksIHBvc2l0aW9uXSlcclxuXHJcbiAgbmV4dENoYXJhY3RlcjogLT5cclxuICAgIEBfbmV4dENoYXJhY3RlckZyb20oQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxyXG5cclxuICBwcmV2aW91c0NoYXJhY3RlcjogLT5cclxuICAgIEBfbmV4dENoYXJhY3RlckZyb20oQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxyXG5cclxuICAjIFNraXAgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCBvciBuZXh0IHN5bWJvbGljIGV4cHJlc3Npb24uXHJcbiAgc2tpcFNleHBGb3J3YXJkOiAtPlxyXG4gICAgcG9pbnQgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIHRhcmdldCA9IEBfc2V4cEZvcndhcmRGcm9tKHBvaW50KVxyXG4gICAgQGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbih0YXJnZXQpXHJcblxyXG4gICMgU2tpcCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBjdXJyZW50IG9yIHByZXZpb3VzIHN5bWJvbGljIGV4cHJlc3Npb24uXHJcbiAgc2tpcFNleHBCYWNrd2FyZDogLT5cclxuICAgIHBvaW50ID0gQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXHJcbiAgICB0YXJnZXQgPSBAX3NleHBCYWNrd2FyZEZyb20ocG9pbnQpXHJcbiAgICBAY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRhcmdldClcclxuXHJcbiAgIyBTa2lwIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgb3IgbmV4dCBsaXN0LlxyXG4gIHNraXBMaXN0Rm9yd2FyZDogLT5cclxuICAgIHBvaW50ID0gQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXHJcbiAgICB0YXJnZXQgPSBAX2xpc3RGb3J3YXJkRnJvbShwb2ludClcclxuICAgIEBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGFyZ2V0KSBpZiB0YXJnZXRcclxuXHJcbiAgIyBTa2lwIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGN1cnJlbnQgb3IgcHJldmlvdXMgbGlzdC5cclxuICBza2lwTGlzdEJhY2t3YXJkOiAtPlxyXG4gICAgcG9pbnQgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIHRhcmdldCA9IEBfbGlzdEJhY2t3YXJkRnJvbShwb2ludClcclxuICAgIEBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGFyZ2V0KSBpZiB0YXJnZXRcclxuXHJcbiAgIyBBZGQgdGhlIG5leHQgc2V4cCB0byB0aGUgY3Vyc29yJ3Mgc2VsZWN0aW9uLiBBY3RpdmF0ZSBpZiBuZWNlc3NhcnkuXHJcbiAgbWFya1NleHA6IC0+XHJcbiAgICByYW5nZSA9IEBjdXJzb3IuZ2V0TWFya2VyKCkuZ2V0QnVmZmVyUmFuZ2UoKVxyXG4gICAgbmV3VGFpbCA9IEBfc2V4cEZvcndhcmRGcm9tKHJhbmdlLmVuZClcclxuICAgIG1hcmsgPSBAbWFyaygpLnNldChuZXdUYWlsKVxyXG4gICAgbWFyay5hY3RpdmF0ZSgpIHVubGVzcyBtYXJrLmlzQWN0aXZlKClcclxuXHJcbiAgIyBUcmFuc3Bvc2UgdGhlIHR3byBjaGFyYWN0ZXJzIGFyb3VuZCB0aGUgY3Vyc29yLiBBdCB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZSxcclxuICAjIHRyYW5zcG9zZSB0aGUgbmV3bGluZSB3aXRoIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUuIEF0IHRoZSBlbmQgb2YgYVxyXG4gICMgbGluZSwgdHJhbnNwb3NlIHRoZSBsYXN0IHR3byBjaGFyYWN0ZXJzLiBBdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBidWZmZXIsIGRvXHJcbiAgIyBub3RoaW5nLiBXZWlyZCwgYnV0IHRoYXQncyBFbWFjcyFcclxuICB0cmFuc3Bvc2VDaGFyczogLT5cclxuICAgIHtyb3csIGNvbHVtbn0gPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIHJldHVybiBpZiByb3cgPT0gMCBhbmQgY29sdW1uID09IDBcclxuXHJcbiAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpXHJcbiAgICBpZiBjb2x1bW4gPT0gMFxyXG4gICAgICBwcmV2aW91c0xpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdyAtIDEpXHJcbiAgICAgIHBhaXJSYW5nZSA9IFtbcm93IC0gMSwgcHJldmlvdXNMaW5lLmxlbmd0aF0sIFtyb3csIDFdXVxyXG4gICAgZWxzZSBpZiBjb2x1bW4gPT0gbGluZS5sZW5ndGhcclxuICAgICAgcGFpclJhbmdlID0gW1tyb3csIGNvbHVtbiAtIDJdLCBbcm93LCBjb2x1bW5dXVxyXG4gICAgZWxzZVxyXG4gICAgICBwYWlyUmFuZ2UgPSBbW3JvdywgY29sdW1uIC0gMV0sIFtyb3csIGNvbHVtbiArIDFdXVxyXG4gICAgcGFpciA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocGFpclJhbmdlKVxyXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShwYWlyUmFuZ2UsIChwYWlyWzFdIG9yICcnKSArIHBhaXJbMF0pXHJcblxyXG4gICMgVHJhbnNwb3NlIHRoZSB3b3JkIGF0IHRoZSBjdXJzb3Igd2l0aCB0aGUgbmV4dCBvbmUuIE1vdmUgdG8gdGhlIGVuZCBvZiB0aGVcclxuICAjIG5leHQgd29yZC5cclxuICB0cmFuc3Bvc2VXb3JkczogLT5cclxuICAgIEBza2lwTm9uV29yZENoYXJhY3RlcnNCYWNrd2FyZCgpXHJcblxyXG4gICAgd29yZDFSYW5nZSA9IEBfd29yZFJhbmdlKClcclxuICAgIEBza2lwV29yZENoYXJhY3RlcnNGb3J3YXJkKClcclxuICAgIEBza2lwTm9uV29yZENoYXJhY3RlcnNGb3J3YXJkKClcclxuICAgIGlmIEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKS5pc0VxdWFsKEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcclxuICAgICAgIyBObyBzZWNvbmQgd29yZCAtIGp1c3QgZ28gYmFjay5cclxuICAgICAgQHNraXBOb25Xb3JkQ2hhcmFjdGVyc0JhY2t3YXJkKClcclxuICAgIGVsc2VcclxuICAgICAgd29yZDJSYW5nZSA9IEBfd29yZFJhbmdlKClcclxuICAgICAgQF90cmFuc3Bvc2VSYW5nZXMod29yZDFSYW5nZSwgd29yZDJSYW5nZSlcclxuXHJcbiAgIyBUcmFuc3Bvc2UgdGhlIHNleHAgYXQgdGhlIGN1cnNvciB3aXRoIHRoZSBuZXh0IG9uZS4gTW92ZSB0byB0aGUgZW5kIG9mIHRoZVxyXG4gICMgbmV4dCBzZXhwLlxyXG4gIHRyYW5zcG9zZVNleHBzOiAtPlxyXG4gICAgQHNraXBTZXhwQmFja3dhcmQoKVxyXG4gICAgc3RhcnQxID0gQGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXHJcbiAgICBAc2tpcFNleHBGb3J3YXJkKClcclxuICAgIGVuZDEgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuXHJcbiAgICBAc2tpcFNleHBGb3J3YXJkKClcclxuICAgIGVuZDIgPSBAY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIEBza2lwU2V4cEJhY2t3YXJkKClcclxuICAgIHN0YXJ0MiA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG5cclxuICAgIEBfdHJhbnNwb3NlUmFuZ2VzKFtzdGFydDEsIGVuZDFdLCBbc3RhcnQyLCBlbmQyXSlcclxuXHJcbiAgIyBUcmFuc3Bvc2UgdGhlIGxpbmUgYXQgdGhlIGN1cnNvciB3aXRoIHRoZSBvbmUgYWJvdmUgaXQuIE1vdmUgdG8gdGhlXHJcbiAgIyBiZWdpbm5pbmcgb2YgdGhlIG5leHQgbGluZS5cclxuICB0cmFuc3Bvc2VMaW5lczogLT5cclxuICAgIHJvdyA9IEBjdXJzb3IuZ2V0QnVmZmVyUm93KClcclxuICAgIGlmIHJvdyA9PSAwXHJcbiAgICAgIEBfZW5kTGluZUlmTmVjZXNzYXJ5KClcclxuICAgICAgQGN1cnNvci5tb3ZlRG93bigpXHJcbiAgICAgIHJvdyArPSAxXHJcbiAgICBAX2VuZExpbmVJZk5lY2Vzc2FyeSgpXHJcblxyXG4gICAgbGluZVJhbmdlID0gW1tyb3csIDBdLCBbcm93ICsgMSwgMF1dXHJcbiAgICB0ZXh0ID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShsaW5lUmFuZ2UpXHJcbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKGxpbmVSYW5nZSwgJycpXHJcbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtbcm93IC0gMSwgMF0sIFtyb3cgLSAxLCAwXV0sIHRleHQpXHJcblxyXG4gIF93b3JkUmFuZ2U6IC0+XHJcbiAgICBAc2tpcFdvcmRDaGFyYWN0ZXJzQmFja3dhcmQoKVxyXG4gICAgcmFuZ2UgPSBAbG9jYXRlTm9uV29yZENoYXJhY3RlckJhY2t3YXJkKClcclxuICAgIHdvcmRTdGFydCA9IGlmIHJhbmdlIHRoZW4gcmFuZ2UuZW5kIGVsc2UgWzAsIDBdXHJcbiAgICByYW5nZSA9IEBsb2NhdGVOb25Xb3JkQ2hhcmFjdGVyRm9yd2FyZCgpXHJcbiAgICB3b3JkRW5kID0gaWYgcmFuZ2UgdGhlbiByYW5nZS5zdGFydCBlbHNlIEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxyXG4gICAgW3dvcmRTdGFydCwgd29yZEVuZF1cclxuXHJcbiAgX2VuZExpbmVJZk5lY2Vzc2FyeTogLT5cclxuICAgIHJvdyA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5yb3dcclxuICAgIGlmIHJvdyA9PSBAZWRpdG9yLmdldExpbmVDb3VudCgpIC0gMVxyXG4gICAgICBsZW5ndGggPSBAY3Vyc29yLmdldEN1cnJlbnRCdWZmZXJMaW5lKCkubGVuZ3RoXHJcbiAgICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tyb3csIGxlbmd0aF0sIFtyb3csIGxlbmd0aF1dLCBcIlxcblwiKVxyXG5cclxuICBfdHJhbnNwb3NlUmFuZ2VzOiAocmFuZ2UxLCByYW5nZTIpIC0+XHJcbiAgICB0ZXh0MSA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UxKVxyXG4gICAgdGV4dDIgPSBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlMilcclxuXHJcbiAgICAjIFVwZGF0ZSByYW5nZTIgZmlyc3Qgc28gaXQgZG9lc24ndCBjaGFuZ2UgcmFuZ2UxLlxyXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZTIsIHRleHQxKVxyXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZTEsIHRleHQyKVxyXG4gICAgQGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihyYW5nZTJbMV0pXHJcblxyXG4gIF9zZXhwRm9yd2FyZEZyb206IChwb2ludCkgLT5cclxuICAgIGVvYiA9IEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxyXG4gICAgcG9pbnQgPSBAX2xvY2F0ZUZvcndhcmRGcm9tKHBvaW50LCAvW1xcdygpW1xcXXt9J1wiXS9pKT8uc3RhcnQgb3IgZW9iXHJcbiAgICBjaGFyYWN0ZXIgPSBAX25leHRDaGFyYWN0ZXJGcm9tKHBvaW50KVxyXG4gICAgaWYgT1BFTkVSUy5oYXNPd25Qcm9wZXJ0eShjaGFyYWN0ZXIpIG9yIENMT1NFUlMuaGFzT3duUHJvcGVydHkoY2hhcmFjdGVyKVxyXG4gICAgICByZXN1bHQgPSBudWxsXHJcbiAgICAgIHN0YWNrID0gW11cclxuICAgICAgcXVvdGVzID0gMFxyXG4gICAgICBlb2YgPSBAZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcclxuICAgICAgcmUgPSAvW14oKVtcXF17fVwiJ2BcXFxcXSt8XFxcXC58WygpW1xcXXt9XCInYF0vZ1xyXG4gICAgICBAZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHJlLCBbcG9pbnQsIGVvZl0sIChoaXQpID0+XHJcbiAgICAgICAgaWYgaGl0Lm1hdGNoVGV4dCA9PSBzdGFja1tzdGFjay5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgc3RhY2sucG9wKClcclxuICAgICAgICAgIGlmIHN0YWNrLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGhpdC5yYW5nZS5lbmRcclxuICAgICAgICAgICAgaGl0LnN0b3AoKVxyXG4gICAgICAgICAgZWxzZSBpZiAvXltcIidgXSQvLnRlc3QoaGl0Lm1hdGNoVGV4dClcclxuICAgICAgICAgICAgcXVvdGVzIC09IDFcclxuICAgICAgICBlbHNlIGlmIChjbG9zZXIgPSBPUEVORVJTW2hpdC5tYXRjaFRleHRdKVxyXG4gICAgICAgICAgdW5sZXNzIC9eW1wiJ2BdJC8udGVzdChjbG9zZXIpIGFuZCBxdW90ZXMgPiAwXHJcbiAgICAgICAgICAgIHN0YWNrLnB1c2goY2xvc2VyKVxyXG4gICAgICAgICAgICBxdW90ZXMgKz0gMSBpZiAvXltcIidgXSQvLnRlc3QoY2xvc2VyKVxyXG4gICAgICAgIGVsc2UgaWYgQ0xPU0VSU1toaXQubWF0Y2hUZXh0XVxyXG4gICAgICAgICAgaWYgc3RhY2subGVuZ3RoID09IDBcclxuICAgICAgICAgICAgaGl0LnN0b3AoKVxyXG4gICAgICByZXN1bHQgb3IgcG9pbnRcclxuICAgIGVsc2VcclxuICAgICAgQF9sb2NhdGVGb3J3YXJkRnJvbShwb2ludCwgL1tcXFdcXG5dL2kpPy5zdGFydCBvciBlb2JcclxuXHJcbiAgX3NleHBCYWNrd2FyZEZyb206IChwb2ludCkgLT5cclxuICAgIHBvaW50ID0gQF9sb2NhdGVCYWNrd2FyZEZyb20ocG9pbnQsIC9bXFx3KClbXFxde30nXCJdL2kpPy5lbmQgb3IgQk9CXHJcbiAgICBjaGFyYWN0ZXIgPSBAX3ByZXZpb3VzQ2hhcmFjdGVyRnJvbShwb2ludClcclxuICAgIGlmIE9QRU5FUlMuaGFzT3duUHJvcGVydHkoY2hhcmFjdGVyKSBvciBDTE9TRVJTLmhhc093blByb3BlcnR5KGNoYXJhY3RlcilcclxuICAgICAgcmVzdWx0ID0gbnVsbFxyXG4gICAgICBzdGFjayA9IFtdXHJcbiAgICAgIHF1b3RlcyA9IDBcclxuICAgICAgcmUgPSAvW14oKVtcXF17fVwiJ2BcXFxcXSt8XFxcXC58WygpW1xcXXt9XCInYF0vZ1xyXG4gICAgICBAZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHJlLCBbQk9CLCBwb2ludF0sIChoaXQpID0+XHJcbiAgICAgICAgaWYgaGl0Lm1hdGNoVGV4dCA9PSBzdGFja1tzdGFjay5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgc3RhY2sucG9wKClcclxuICAgICAgICAgIGlmIHN0YWNrLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGhpdC5yYW5nZS5zdGFydFxyXG4gICAgICAgICAgICBoaXQuc3RvcCgpXHJcbiAgICAgICAgICBlbHNlIGlmIC9eW1wiJ2BdJC8udGVzdChoaXQubWF0Y2hUZXh0KVxyXG4gICAgICAgICAgICBxdW90ZXMgLT0gMVxyXG4gICAgICAgIGVsc2UgaWYgKG9wZW5lciA9IENMT1NFUlNbaGl0Lm1hdGNoVGV4dF0pXHJcbiAgICAgICAgICB1bmxlc3MgL15bXCInYF0kLy50ZXN0KG9wZW5lcikgYW5kIHF1b3RlcyA+IDBcclxuICAgICAgICAgICAgc3RhY2sucHVzaChvcGVuZXIpXHJcbiAgICAgICAgICAgIHF1b3RlcyArPSAxIGlmIC9eW1wiJ2BdJC8udGVzdChvcGVuZXIpXHJcbiAgICAgICAgZWxzZSBpZiBPUEVORVJTW2hpdC5tYXRjaFRleHRdXHJcbiAgICAgICAgICBpZiBzdGFjay5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgICBoaXQuc3RvcCgpXHJcbiAgICAgIHJlc3VsdCBvciBwb2ludFxyXG4gICAgZWxzZVxyXG4gICAgICBAX2xvY2F0ZUJhY2t3YXJkRnJvbShwb2ludCwgL1tcXFdcXG5dL2kpPy5lbmQgb3IgQk9CXHJcblxyXG4gIF9saXN0Rm9yd2FyZEZyb206IChwb2ludCkgLT5cclxuICAgIGVvYiA9IEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxyXG4gICAgaWYgIShtYXRjaCA9IEBfbG9jYXRlRm9yd2FyZEZyb20ocG9pbnQsIC9bKClbXFxde31dL2kpKVxyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgZW5kID0gdGhpcy5fc2V4cEZvcndhcmRGcm9tKG1hdGNoLnN0YXJ0KVxyXG4gICAgaWYgZW5kLmlzRXF1YWwobWF0Y2guc3RhcnQpIHRoZW4gbnVsbCBlbHNlIGVuZFxyXG5cclxuICBfbGlzdEJhY2t3YXJkRnJvbTogKHBvaW50KSAtPlxyXG4gICAgaWYgIShtYXRjaCA9IEBfbG9jYXRlQmFja3dhcmRGcm9tKHBvaW50LCAvWygpW1xcXXt9XS9pKSlcclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIHN0YXJ0ID0gdGhpcy5fc2V4cEJhY2t3YXJkRnJvbShtYXRjaC5lbmQpXHJcbiAgICBpZiBzdGFydC5pc0VxdWFsKG1hdGNoLmVuZCkgdGhlbiBudWxsIGVsc2Ugc3RhcnRcclxuXHJcbiAgX2xvY2F0ZUJhY2t3YXJkRnJvbTogKHBvaW50LCByZWdFeHApIC0+XHJcbiAgICByZXN1bHQgPSBudWxsXHJcbiAgICBAZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHJlZ0V4cCwgW0JPQiwgcG9pbnRdLCAoaGl0KSAtPlxyXG4gICAgICByZXN1bHQgPSBoaXQucmFuZ2VcclxuICAgIHJlc3VsdFxyXG5cclxuICBfbG9jYXRlRm9yd2FyZEZyb206IChwb2ludCwgcmVnRXhwKSAtPlxyXG4gICAgcmVzdWx0ID0gbnVsbFxyXG4gICAgZW9mID0gQGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXHJcbiAgICBAZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHJlZ0V4cCwgW3BvaW50LCBlb2ZdLCAoaGl0KSAtPlxyXG4gICAgICByZXN1bHQgPSBoaXQucmFuZ2VcclxuICAgIHJlc3VsdFxyXG5cclxuICBfZ2V0V29yZENoYXJhY3RlclJlZ0V4cDogLT5cclxuICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnKVxyXG4gICAgbmV3IFJlZ0V4cCgnW15cXFxccycgKyBlc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpICsgJ10nKVxyXG5cclxuICBfZ2V0Tm9uV29yZENoYXJhY3RlclJlZ0V4cDogLT5cclxuICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnKVxyXG4gICAgbmV3IFJlZ0V4cCgnW1xcXFxzJyArIGVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycykgKyAnXScpXHJcblxyXG4gIF9nb1RvOiAocG9pbnQpIC0+XHJcbiAgICBpZiBwb2ludFxyXG4gICAgICBAY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxyXG4gICAgICB0cnVlXHJcbiAgICBlbHNlXHJcbiAgICAgIGZhbHNlXHJcblxyXG4jIFN0b2xlbiBmcm9tIHVuZGVyc2NvcmUtcGx1cywgd2hpY2ggd2UgY2FuJ3Qgc2VlbSB0byByZXF1aXJlKCkgZnJvbSBhIHBhY2thZ2VcclxuIyB3aXRob3V0IGRlcGVuZGluZyBvbiBhIHNlcGFyYXRlIGNvcHkgb2YgdGhlIHdob2xlIGxpYnJhcnkuXHJcbmVzY2FwZVJlZ0V4cCA9IChzdHJpbmcpIC0+XHJcbiAgaWYgc3RyaW5nXHJcbiAgICBzdHJpbmcucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJylcclxuICBlbHNlXHJcbiAgICAnJ1xyXG5cclxuQk9CID0ge3JvdzogMCwgY29sdW1uOiAwfVxyXG4iXX0=
