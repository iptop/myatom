(function() {
  var Range, Selector, _,
    slice = [].slice;

  _ = require('underscore-plus');

  Range = require('atom').Range;

  module.exports = Selector = (function() {
    function Selector() {}

    Selector.select = function() {
      var args, base, editor, event, method, type;
      event = arguments[0], type = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
      editor = typeof (base = event.currentTarget).getModel === "function" ? base.getModel() : void 0;
      if (!editor) {
        return;
      }
      method = "select" + type;
      return editor.expandSelectionsForward((function(_this) {
        return function(selection) {
          return _this[method].apply(_this, [selection].concat(slice.call(args)));
        };
      })(this));
    };

    Selector.selectWord = function(selection, includeCharacters) {
      var char, i, len, nonWordCharacters, options, wordRegex;
      if (includeCharacters == null) {
        includeCharacters = [];
      }
      nonWordCharacters = atom.config.get('editor.nonWordCharacters', {
        scope: selection.cursor.getScopeDescriptor()
      });
      for (i = 0, len = includeCharacters.length; i < len; i++) {
        char = includeCharacters[i];
        nonWordCharacters = nonWordCharacters.replace(char, '');
      }
      wordRegex = new RegExp("[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+", "g");
      options = {
        wordRegex: wordRegex,
        includeNonWordCharacters: false
      };
      selection.setBufferRange(selection.cursor.getCurrentWordBufferRange(options));
      selection.wordwise = true;
      return selection.initialScreenRange = selection.getScreenRange();
    };

    Selector.selectScope = function(selection) {
      var editor, i, len, scope, scopeRange, scopes, selectionRange;
      scopes = selection.cursor.getScopeDescriptor().getScopesArray();
      if (!scopes) {
        return;
      }
      selectionRange = selection.getBufferRange();
      scopes = scopes.slice().reverse();
      editor = selection.editor;
      for (i = 0, len = scopes.length; i < len; i++) {
        scope = scopes[i];
        scopeRange = editor.bufferRangeForScopeAtPosition(scope, selection.cursor.getBufferPosition());
        if ((scopeRange != null ? scopeRange.containsRange(selectionRange) : void 0) && !(scopeRange != null ? scopeRange.isEqual(selectionRange) : void 0)) {
          selection.setBufferRange(scopeRange);
          return;
        }
      }
    };

    Selector.selectFold = function(selection) {
      var currentRow, editor, endRow, foldRange, i, languageMode, ref, ref1, ref2, selectionRange, startRow;
      selectionRange = selection.getBufferRange();
      editor = selection.editor;
      languageMode = editor.languageMode;
      for (currentRow = i = ref = selectionRange.start.row; ref <= 0 ? i <= 0 : i >= 0; currentRow = ref <= 0 ? ++i : --i) {
        ref2 = (ref1 = languageMode.rowRangeForFoldAtBufferRow(currentRow)) != null ? ref1 : [], startRow = ref2[0], endRow = ref2[1];
        if (startRow == null) {
          continue;
        }
        if (!(startRow <= selectionRange.start.row && selectionRange.end.row <= endRow)) {
          continue;
        }
        foldRange = new Range([startRow, 0], [endRow, editor.lineTextForBufferRow(endRow).length]);
        if ((foldRange != null ? foldRange.containsRange(selectionRange) : void 0) && !(foldRange != null ? foldRange.isEqual(selectionRange) : void 0)) {
          selection.setBufferRange(foldRange);
          return;
        }
      }
    };

    Selector.selectInsideParagraph = function(selection) {
      var range;
      range = selection.cursor.getCurrentParagraphBufferRange();
      if (range == null) {
        return;
      }
      selection.setBufferRange(range);
      return selection.selectToBeginningOfNextParagraph();
    };

    Selector.selectInsideQuotes = function(selection, char, includeQuotes) {
      var cursor, editor, end, findClosingQuote, findOpeningQuote, isStartQuote, lookBackwardOnLine, lookForwardOnLine, start;
      findOpeningQuote = function(pos) {
        var line, start;
        start = pos.copy();
        pos = pos.copy();
        while (pos.row >= 0) {
          line = editor.lineTextForBufferRow(pos.row);
          if (pos.column === -1) {
            pos.column = line.length - 1;
          }
          while (pos.column >= 0) {
            if (line[pos.column] === char) {
              if (pos.column === 0 || line[pos.column - 1] !== '\\') {
                if (isStartQuote(pos)) {
                  return pos;
                } else {
                  return lookBackwardOnLine(start) || lookForwardOnLine(start);
                }
              }
            }
            --pos.column;
          }
          pos.column = -1;
          --pos.row;
        }
        return lookForwardOnLine(start);
      };
      isStartQuote = function(end) {
        var line, numQuotes;
        line = editor.lineTextForBufferRow(end.row);
        numQuotes = line.substring(0, end.column + 1).replace("'" + char, '').split(char).length - 1;
        return numQuotes % 2;
      };
      lookForwardOnLine = function(pos) {
        var index, line;
        line = editor.lineTextForBufferRow(pos.row);
        index = line.substring(pos.column).indexOf(char);
        if (index >= 0) {
          pos.column += index;
          return pos;
        }
        return null;
      };
      lookBackwardOnLine = function(pos) {
        var index, line;
        line = editor.lineTextForBufferRow(pos.row).substring(0, pos.column);
        index = line.lastIndexOf(char);
        if (index >= 0) {
          pos.column += index - line.length;
          return pos;
        }
        return null;
      };
      findClosingQuote = function(start) {
        var end, endLine, escaping;
        end = start.copy();
        escaping = false;
        while (end.row < editor.getLineCount()) {
          endLine = editor.lineTextForBufferRow(end.row);
          while (end.column < endLine.length) {
            if (endLine[end.column] === '\\') {
              ++end.column;
            } else if (endLine[end.column] === char) {
              if (includeQuotes) {
                --start.column;
              }
              if (includeQuotes) {
                ++end.column;
              }
              return end;
            }
            ++end.column;
          }
          end.column = 0;
          ++end.row;
        }
      };
      editor = selection.editor, cursor = selection.cursor;
      start = findOpeningQuote(cursor.getBufferPosition());
      if (start != null) {
        ++start.column;
        end = findClosingQuote(start);
        if (end != null) {
          return selection.setBufferRange([start, end]);
        }
      }
    };

    Selector.selectInsideBrackets = function(selection, beginChar, endChar, includeBrackets) {
      var cursor, editor, end, findClosingBracket, findOpeningBracket, start;
      findOpeningBracket = function(pos) {
        var depth, line;
        pos = pos.copy();
        depth = 0;
        while (pos.row >= 0) {
          line = editor.lineTextForBufferRow(pos.row);
          if (pos.column === -1) {
            pos.column = line.length - 1;
          }
          while (pos.column >= 0) {
            switch (line[pos.column]) {
              case endChar:
                ++depth;
                break;
              case beginChar:
                if (--depth < 0) {
                  return pos;
                }
            }
            --pos.column;
          }
          pos.column = -1;
          --pos.row;
        }
      };
      findClosingBracket = function(start) {
        var depth, end, endLine;
        end = start.copy();
        depth = 0;
        while (end.row < editor.getLineCount()) {
          endLine = editor.lineTextForBufferRow(end.row);
          while (end.column < endLine.length) {
            switch (endLine[end.column]) {
              case beginChar:
                ++depth;
                break;
              case endChar:
                if (--depth < 0) {
                  if (includeBrackets) {
                    --start.column;
                  }
                  if (includeBrackets) {
                    ++end.column;
                  }
                  return end;
                }
            }
            ++end.column;
          }
          end.column = 0;
          ++end.row;
        }
      };
      editor = selection.editor, cursor = selection.cursor;
      start = findOpeningBracket(cursor.getBufferPosition());
      if (start != null) {
        ++start.column;
        end = findClosingBracket(start);
        if (end != null) {
          return selection.setBufferRange([start, end]);
        }
      }
    };

    return Selector;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2V4cGFuZC1yZWdpb24vbGliL3NlbGVjdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0JBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNILFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBRUosUUFBQyxDQUFBLE1BQUQsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQURRLHNCQUFPLHFCQUFNO01BQ3JCLE1BQUEscUVBQTRCLENBQUM7TUFDN0IsSUFBQSxDQUFjLE1BQWQ7QUFBQSxlQUFBOztNQUVBLE1BQUEsR0FBUyxRQUFBLEdBQVM7YUFDbEIsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUM3QixLQUFFLENBQUEsTUFBQSxDQUFGLGNBQVUsQ0FBQSxTQUFXLFNBQUEsV0FBQSxJQUFBLENBQUEsQ0FBckI7UUFENkI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CO0lBTE87O0lBU1QsUUFBQyxDQUFBLFVBQUQsR0FBYyxTQUFDLFNBQUQsRUFBWSxpQkFBWjtBQUNaLFVBQUE7O1FBRHdCLG9CQUFvQjs7TUFDNUMsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixFQUE0QztRQUFBLEtBQUEsRUFBTyxTQUFTLENBQUMsTUFBTSxDQUFDLGtCQUFqQixDQUFBLENBQVA7T0FBNUM7QUFDcEIsV0FBQSxtREFBQTs7UUFDRSxpQkFBQSxHQUFvQixpQkFBaUIsQ0FBQyxPQUFsQixDQUEwQixJQUExQixFQUFnQyxFQUFoQztBQUR0QjtNQUVBLFNBQUEsR0FBZ0IsSUFBQSxNQUFBLENBQU8sT0FBQSxHQUFPLENBQUMsQ0FBQyxD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dWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VsZWN0b3JcblxuICBAc2VsZWN0OiAoZXZlbnQsIHR5cGUsIGFyZ3MuLi4pIC0+XG4gICAgZWRpdG9yID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRNb2RlbD8oKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG5cbiAgICBtZXRob2QgPSBcInNlbGVjdCN7dHlwZX1cIlxuICAgIGVkaXRvci5leHBhbmRTZWxlY3Rpb25zRm9yd2FyZCgoc2VsZWN0aW9uKSA9PlxuICAgICAgQFttZXRob2RdKHNlbGVjdGlvbiwgYXJncy4uLilcbiAgICApXG5cbiAgQHNlbGVjdFdvcmQgPSAoc2VsZWN0aW9uLCBpbmNsdWRlQ2hhcmFjdGVycyA9IFtdKSAtPlxuICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnLCBzY29wZTogc2VsZWN0aW9uLmN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKSlcbiAgICBmb3IgY2hhciBpbiBpbmNsdWRlQ2hhcmFjdGVyc1xuICAgICAgbm9uV29yZENoYXJhY3RlcnMgPSBub25Xb3JkQ2hhcmFjdGVycy5yZXBsYWNlKGNoYXIsICcnKVxuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbXlxcXFxzI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIiwgXCJnXCIpXG4gICAgb3B0aW9ucyA9IHt3b3JkUmVnZXgsIGluY2x1ZGVOb25Xb3JkQ2hhcmFjdGVyczogZmFsc2V9XG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHNlbGVjdGlvbi5jdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZShvcHRpb25zKSlcbiAgICBzZWxlY3Rpb24ud29yZHdpc2UgPSB0cnVlXG4gICAgc2VsZWN0aW9uLmluaXRpYWxTY3JlZW5SYW5nZSA9IHNlbGVjdGlvbi5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgQHNlbGVjdFNjb3BlID0gKHNlbGVjdGlvbikgLT5cbiAgICBzY29wZXMgPSBzZWxlY3Rpb24uY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KClcbiAgICByZXR1cm4gdW5sZXNzIHNjb3Blc1xuXG4gICAgc2VsZWN0aW9uUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIHNjb3BlcyA9IHNjb3Blcy5zbGljZSgpLnJldmVyc2UoKVxuICAgIHtlZGl0b3J9ID0gc2VsZWN0aW9uXG5cbiAgICBmb3Igc2NvcGUgaW4gc2NvcGVzXG4gICAgICBzY29wZVJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NvcGVBdFBvc2l0aW9uKHNjb3BlLCBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICAgIGlmIHNjb3BlUmFuZ2U/LmNvbnRhaW5zUmFuZ2Uoc2VsZWN0aW9uUmFuZ2UpIGFuZCBub3Qgc2NvcGVSYW5nZT8uaXNFcXVhbChzZWxlY3Rpb25SYW5nZSlcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHNjb3BlUmFuZ2UpXG4gICAgICAgIHJldHVyblxuXG4gIEBzZWxlY3RGb2xkID0gKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb25SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAge2VkaXRvcn0gPSBzZWxlY3Rpb25cbiAgICB7bGFuZ3VhZ2VNb2RlfSA9IGVkaXRvclxuXG4gICAgZm9yIGN1cnJlbnRSb3cgaW4gW3NlbGVjdGlvblJhbmdlLnN0YXJ0LnJvdy4uMF1cbiAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IGxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckZvbGRBdEJ1ZmZlclJvdyhjdXJyZW50Um93KSA/IFtdXG4gICAgICBjb250aW51ZSB1bmxlc3Mgc3RhcnRSb3c/XG4gICAgICBjb250aW51ZSB1bmxlc3Mgc3RhcnRSb3cgPD0gc2VsZWN0aW9uUmFuZ2Uuc3RhcnQucm93IGFuZCBzZWxlY3Rpb25SYW5nZS5lbmQucm93IDw9IGVuZFJvd1xuICAgICAgZm9sZFJhbmdlID0gbmV3IFJhbmdlKFtzdGFydFJvdywgMF0sIFtlbmRSb3csIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmRSb3cpLmxlbmd0aF0pXG5cbiAgICAgIGlmIGZvbGRSYW5nZT8uY29udGFpbnNSYW5nZShzZWxlY3Rpb25SYW5nZSkgYW5kIG5vdCBmb2xkUmFuZ2U/LmlzRXF1YWwoc2VsZWN0aW9uUmFuZ2UpXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShmb2xkUmFuZ2UpXG4gICAgICAgIHJldHVyblxuXG4gIEBzZWxlY3RJbnNpZGVQYXJhZ3JhcGggPSAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlID0gc2VsZWN0aW9uLmN1cnNvci5nZXRDdXJyZW50UGFyYWdyYXBoQnVmZmVyUmFuZ2UoKVxuICAgIHJldHVybiB1bmxlc3MgcmFuZ2U/XG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIHNlbGVjdGlvbi5zZWxlY3RUb0JlZ2lubmluZ09mTmV4dFBhcmFncmFwaCgpXG5cbiAgQHNlbGVjdEluc2lkZVF1b3RlcyA9IChzZWxlY3Rpb24sIGNoYXIsIGluY2x1ZGVRdW90ZXMpIC0+XG4gICAgZmluZE9wZW5pbmdRdW90ZSA9IChwb3MpIC0+XG4gICAgICBzdGFydCA9IHBvcy5jb3B5KClcbiAgICAgIHBvcyA9IHBvcy5jb3B5KClcbiAgICAgIHdoaWxlIHBvcy5yb3cgPj0gMFxuICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvcy5yb3cpXG4gICAgICAgIHBvcy5jb2x1bW4gPSBsaW5lLmxlbmd0aCAtIDEgaWYgcG9zLmNvbHVtbiBpcyAtMVxuICAgICAgICB3aGlsZSBwb3MuY29sdW1uID49IDBcbiAgICAgICAgICBpZiBsaW5lW3Bvcy5jb2x1bW5dIGlzIGNoYXJcbiAgICAgICAgICAgIGlmIHBvcy5jb2x1bW4gaXMgMCBvciBsaW5lW3Bvcy5jb2x1bW4gLSAxXSBpc250ICdcXFxcJ1xuICAgICAgICAgICAgICBpZiBpc1N0YXJ0UXVvdGUocG9zKVxuICAgICAgICAgICAgICAgIHJldHVybiBwb3NcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBsb29rQmFja3dhcmRPbkxpbmUoc3RhcnQpIG9yIGxvb2tGb3J3YXJkT25MaW5lKHN0YXJ0KVxuICAgICAgICAgIC0tIHBvcy5jb2x1bW5cbiAgICAgICAgcG9zLmNvbHVtbiA9IC0xXG4gICAgICAgIC0tIHBvcy5yb3dcbiAgICAgIGxvb2tGb3J3YXJkT25MaW5lKHN0YXJ0KVxuXG4gICAgaXNTdGFydFF1b3RlID0gKGVuZCkgLT5cbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coZW5kLnJvdylcbiAgICAgIG51bVF1b3RlcyA9IGxpbmUuc3Vic3RyaW5nKDAsIGVuZC5jb2x1bW4gKyAxKS5yZXBsYWNlKCBcIicje2NoYXJ9XCIsICcnKS5zcGxpdChjaGFyKS5sZW5ndGggLSAxXG4gICAgICBudW1RdW90ZXMgJSAyXG5cbiAgICBsb29rRm9yd2FyZE9uTGluZSA9IChwb3MpIC0+XG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvcy5yb3cpXG5cbiAgICAgIGluZGV4ID0gbGluZS5zdWJzdHJpbmcocG9zLmNvbHVtbikuaW5kZXhPZihjaGFyKVxuICAgICAgaWYgaW5kZXggPj0gMFxuICAgICAgICBwb3MuY29sdW1uICs9IGluZGV4XG4gICAgICAgIHJldHVybiBwb3NcbiAgICAgIG51bGxcblxuICAgIGxvb2tCYWNrd2FyZE9uTGluZSA9IChwb3MpIC0+XG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvcy5yb3cpLnN1YnN0cmluZygwLHBvcy5jb2x1bW4pXG5cbiAgICAgIGluZGV4ID0gbGluZS5sYXN0SW5kZXhPZihjaGFyKVxuICAgICAgaWYgaW5kZXggPj0gMFxuICAgICAgICBwb3MuY29sdW1uICs9IGluZGV4IC0gbGluZS5sZW5ndGhcbiAgICAgICAgcmV0dXJuIHBvc1xuICAgICAgbnVsbFxuXG4gICAgZmluZENsb3NpbmdRdW90ZSA9IChzdGFydCkgLT5cbiAgICAgIGVuZCA9IHN0YXJ0LmNvcHkoKVxuICAgICAgZXNjYXBpbmcgPSBmYWxzZVxuXG4gICAgICB3aGlsZSBlbmQucm93IDwgZWRpdG9yLmdldExpbmVDb3VudCgpXG4gICAgICAgIGVuZExpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coZW5kLnJvdylcbiAgICAgICAgd2hpbGUgZW5kLmNvbHVtbiA8IGVuZExpbmUubGVuZ3RoXG4gICAgICAgICAgaWYgZW5kTGluZVtlbmQuY29sdW1uXSBpcyAnXFxcXCdcbiAgICAgICAgICAgICsrIGVuZC5jb2x1bW5cbiAgICAgICAgICBlbHNlIGlmIGVuZExpbmVbZW5kLmNvbHVtbl0gaXMgY2hhclxuICAgICAgICAgICAgLS0gc3RhcnQuY29sdW1uIGlmIGluY2x1ZGVRdW90ZXNcbiAgICAgICAgICAgICsrIGVuZC5jb2x1bW4gaWYgaW5jbHVkZVF1b3Rlc1xuICAgICAgICAgICAgcmV0dXJuIGVuZFxuICAgICAgICAgICsrIGVuZC5jb2x1bW5cbiAgICAgICAgZW5kLmNvbHVtbiA9IDBcbiAgICAgICAgKysgZW5kLnJvd1xuICAgICAgcmV0dXJuXG5cbiAgICB7ZWRpdG9yLCBjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgc3RhcnQgPSBmaW5kT3BlbmluZ1F1b3RlKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIHN0YXJ0P1xuICAgICAgKysgc3RhcnQuY29sdW1uICMgc2tpcCB0aGUgb3BlbmluZyBxdW90ZVxuICAgICAgZW5kID0gZmluZENsb3NpbmdRdW90ZShzdGFydClcbiAgICAgIGlmIGVuZD9cbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtzdGFydCwgZW5kXSlcblxuICBAc2VsZWN0SW5zaWRlQnJhY2tldHMgPSAoc2VsZWN0aW9uLCBiZWdpbkNoYXIsIGVuZENoYXIsIGluY2x1ZGVCcmFja2V0cykgLT5cbiAgICBmaW5kT3BlbmluZ0JyYWNrZXQgPSAocG9zKSAtPlxuICAgICAgcG9zID0gcG9zLmNvcHkoKVxuICAgICAgZGVwdGggPSAwXG4gICAgICB3aGlsZSBwb3Mucm93ID49IDBcbiAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhwb3Mucm93KVxuICAgICAgICBwb3MuY29sdW1uID0gbGluZS5sZW5ndGggLSAxIGlmIHBvcy5jb2x1bW4gaXMgLTFcbiAgICAgICAgd2hpbGUgcG9zLmNvbHVtbiA+PSAwXG4gICAgICAgICAgc3dpdGNoIGxpbmVbcG9zLmNvbHVtbl1cbiAgICAgICAgICAgIHdoZW4gZW5kQ2hhciB0aGVuICsrIGRlcHRoXG4gICAgICAgICAgICB3aGVuIGJlZ2luQ2hhclxuICAgICAgICAgICAgICByZXR1cm4gcG9zIGlmIC0tIGRlcHRoIDwgMFxuICAgICAgICAgIC0tIHBvcy5jb2x1bW5cbiAgICAgICAgcG9zLmNvbHVtbiA9IC0xXG4gICAgICAgIC0tIHBvcy5yb3dcblxuICAgIGZpbmRDbG9zaW5nQnJhY2tldCA9IChzdGFydCkgLT5cbiAgICAgIGVuZCA9IHN0YXJ0LmNvcHkoKVxuICAgICAgZGVwdGggPSAwXG4gICAgICB3aGlsZSBlbmQucm93IDwgZWRpdG9yLmdldExpbmVDb3VudCgpXG4gICAgICAgIGVuZExpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coZW5kLnJvdylcbiAgICAgICAgd2hpbGUgZW5kLmNvbHVtbiA8IGVuZExpbmUubGVuZ3RoXG4gICAgICAgICAgc3dpdGNoIGVuZExpbmVbZW5kLmNvbHVtbl1cbiAgICAgICAgICAgIHdoZW4gYmVnaW5DaGFyIHRoZW4gKysgZGVwdGhcbiAgICAgICAgICAgIHdoZW4gZW5kQ2hhclxuICAgICAgICAgICAgICBpZiAtLSBkZXB0aCA8IDBcbiAgICAgICAgICAgICAgICAtLSBzdGFydC5jb2x1bW4gaWYgaW5jbHVkZUJyYWNrZXRzXG4gICAgICAgICAgICAgICAgKysgZW5kLmNvbHVtbiBpZiBpbmNsdWRlQnJhY2tldHNcbiAgICAgICAgICAgICAgICByZXR1cm4gZW5kXG4gICAgICAgICAgKysgZW5kLmNvbHVtblxuICAgICAgICBlbmQuY29sdW1uID0gMFxuICAgICAgICArKyBlbmQucm93XG4gICAgICByZXR1cm5cblxuICAgIHtlZGl0b3IsIGN1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBzdGFydCA9IGZpbmRPcGVuaW5nQnJhY2tldChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiBzdGFydD9cbiAgICAgICsrIHN0YXJ0LmNvbHVtbiAjIHNraXAgdGhlIG9wZW5pbmcgcXVvdGVcbiAgICAgIGVuZCA9IGZpbmRDbG9zaW5nQnJhY2tldChzdGFydClcbiAgICAgIGlmIGVuZD9cbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtzdGFydCwgZW5kXSlcbiJdfQ==
