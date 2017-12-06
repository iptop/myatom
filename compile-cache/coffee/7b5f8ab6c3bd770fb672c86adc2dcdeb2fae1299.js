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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9leHBhbmQtcmVnaW9uL2xpYi9zZWxlY3Rvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUVKLFFBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFEUSxzQkFBTyxxQkFBTTtNQUNyQixNQUFBLHFFQUE0QixDQUFDO01BQzdCLElBQUEsQ0FBYyxNQUFkO0FBQUEsZUFBQTs7TUFFQSxNQUFBLEdBQVMsUUFBQSxHQUFTO2FBQ2xCLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRDtpQkFDN0IsS0FBRSxDQUFBLE1BQUEsQ0FBRixjQUFVLENBQUEsU0FBVyxTQUFBLFdBQUEsSUFBQSxDQUFBLENBQXJCO1FBRDZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQUxPOztJQVNULFFBQUMsQ0FBQSxVQUFELEdBQWMsU0FBQyxTQUFELEVBQVksaUJBQVo7QUFDWixVQUFBOztRQUR3QixvQkFBb0I7O01BQzVDLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsRUFBNEM7UUFBQSxLQUFBLEVBQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxrQkFBakIsQ0FBQSxDQUFQO09BQTVDO0FBQ3BCLFdBQUEsbURBQUE7O1FBQ0UsaUJBQUEsR0FBb0IsaUJBQWlCLENBQUMsT0FBbEIsQ0FBMEIsSUFBMUIsRUFBZ0MsRUFBaEM7QUFEdEI7TUFFQSxTQUFBLEdBQWdCLElBQUEsTUFBQSxDQUFPLE9BQUEsR0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFG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VUFDZCxFQUFHLEdBQUcsQ0FBQztRQVZUO01BSG1CO01BZXJCLGtCQUFBLEdBQXFCLFNBQUMsS0FBRDtBQUNuQixZQUFBO1FBQUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQUE7UUFDTixLQUFBLEdBQVE7QUFDUixlQUFNLEdBQUcsQ0FBQyxHQUFKLEdBQVUsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFoQjtVQUNFLE9BQUEsR0FBVSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBRyxDQUFDLEdBQWhDO0FBQ1YsaUJBQU0sR0FBRyxDQUFDLE1BQUosR0FBYSxPQUFPLENBQUMsTUFBM0I7QUFDRSxvQkFBTyxPQUFRLENBQUEsR0FBRyxDQUFDLE1BQUosQ0FBZjtBQUFBLG1CQUNPLFNBRFA7Z0JBQ3NCLEVBQUc7QUFBbEI7QUFEUCxtQkFFTyxPQUZQO2dCQUdJLElBQUcsRUFBRyxLQUFILEdBQVcsQ0FBZDtrQkFDRSxJQUFtQixlQUFuQjtvQkFBQSxFQUFHLEtBQUssQ0FBQyxPQUFUOztrQkFDQSxJQUFpQixlQUFqQjtvQkFBQSxFQUFHLEdBQUcsQ0FBQyxPQUFQOztBQUNBLHlCQUFPLElBSFQ7O0FBSEo7WUFPQSxFQUFHLEdBQUcsQ0FBQztVQVJUO1VBU0EsR0FBRyxDQUFDLE1BQUosR0FBYTtVQUNiLEVBQUcsR0FBRyxDQUFDO1FBWlQ7TUFIbUI7TUFrQnBCLHlCQUFELEVBQVM7TUFDVCxLQUFBLEdBQVEsa0JBQUEsQ0FBbUIsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBbkI7TUFDUixJQUFHLGFBQUg7UUFDRSxFQUFHLEtBQUssQ0FBQztRQUNULEdBQUEsR0FBTSxrQkFBQSxDQUFtQixLQUFuQjtRQUNOLElBQUcsV0FBSDtpQkFDRSxTQUFTLENBQUMsY0FBVixDQUF5QixDQUFDLEtBQUQsRUFBUSxHQUFSLENBQXpCLEVBREY7U0FIRjs7SUFwQ3NCOzs7OztBQWpJMUIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xyXG57UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuY2xhc3MgU2VsZWN0b3JcclxuXHJcbiAgQHNlbGVjdDogKGV2ZW50LCB0eXBlLCBhcmdzLi4uKSAtPlxyXG4gICAgZWRpdG9yID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRNb2RlbD8oKVxyXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcclxuXHJcbiAgICBtZXRob2QgPSBcInNlbGVjdCN7dHlwZX1cIlxyXG4gICAgZWRpdG9yLmV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkKChzZWxlY3Rpb24pID0+XHJcbiAgICAgIEBbbWV0aG9kXShzZWxlY3Rpb24sIGFyZ3MuLi4pXHJcbiAgICApXHJcblxyXG4gIEBzZWxlY3RXb3JkID0gKHNlbGVjdGlvbiwgaW5jbHVkZUNoYXJhY3RlcnMgPSBbXSkgLT5cclxuICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnLCBzY29wZTogc2VsZWN0aW9uLmN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKSlcclxuICAgIGZvciBjaGFyIGluIGluY2x1ZGVDaGFyYWN0ZXJzXHJcbiAgICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gbm9uV29yZENoYXJhY3RlcnMucmVwbGFjZShjaGFyLCAnJylcclxuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbXlxcXFxzI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIiwgXCJnXCIpXHJcbiAgICBvcHRpb25zID0ge3dvcmRSZWdleCwgaW5jbHVkZU5vbldvcmRDaGFyYWN0ZXJzOiBmYWxzZX1cclxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShzZWxlY3Rpb24uY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2Uob3B0aW9ucykpXHJcbiAgICBzZWxlY3Rpb24ud29yZHdpc2UgPSB0cnVlXHJcbiAgICBzZWxlY3Rpb24uaW5pdGlhbFNjcmVlblJhbmdlID0gc2VsZWN0aW9uLmdldFNjcmVlblJhbmdlKClcclxuXHJcbiAgQHNlbGVjdFNjb3BlID0gKHNlbGVjdGlvbikgLT5cclxuICAgIHNjb3BlcyA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKCkuZ2V0U2NvcGVzQXJyYXkoKVxyXG4gICAgcmV0dXJuIHVubGVzcyBzY29wZXNcclxuXHJcbiAgICBzZWxlY3Rpb25SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXHJcbiAgICBzY29wZXMgPSBzY29wZXMuc2xpY2UoKS5yZXZlcnNlKClcclxuICAgIHtlZGl0b3J9ID0gc2VsZWN0aW9uXHJcblxyXG4gICAgZm9yIHNjb3BlIGluIHNjb3Blc1xyXG4gICAgICBzY29wZVJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NvcGVBdFBvc2l0aW9uKHNjb3BlLCBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXHJcblxyXG4gICAgICBpZiBzY29wZVJhbmdlPy5jb250YWluc1JhbmdlKHNlbGVjdGlvblJhbmdlKSBhbmQgbm90IHNjb3BlUmFuZ2U/LmlzRXF1YWwoc2VsZWN0aW9uUmFuZ2UpXHJcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHNjb3BlUmFuZ2UpXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gIEBzZWxlY3RGb2xkID0gKHNlbGVjdGlvbikgLT5cclxuICAgIHNlbGVjdGlvblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcclxuICAgIHtlZGl0b3J9ID0gc2VsZWN0aW9uXHJcbiAgICB7bGFuZ3VhZ2VNb2RlfSA9IGVkaXRvclxyXG5cclxuICAgIGZvciBjdXJyZW50Um93IGluIFtzZWxlY3Rpb25SYW5nZS5zdGFydC5yb3cuLjBdXHJcbiAgICAgIFtzdGFydFJvdywgZW5kUm93XSA9IGxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckZvbGRBdEJ1ZmZlclJvdyhjdXJyZW50Um93KSA/IFtdXHJcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBzdGFydFJvdz9cclxuICAgICAgY29udGludWUgdW5sZXNzIHN0YXJ0Um93IDw9IHNlbGVjdGlvblJhbmdlLnN0YXJ0LnJvdyBhbmQgc2VsZWN0aW9uUmFuZ2UuZW5kLnJvdyA8PSBlbmRSb3dcclxuICAgICAgZm9sZFJhbmdlID0gbmV3IFJhbmdlKFtzdGFydFJvdywgMF0sIFtlbmRSb3csIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmRSb3cpLmxlbmd0aF0pXHJcblxyXG4gICAgICBpZiBmb2xkUmFuZ2U/LmNvbnRhaW5zUmFuZ2Uoc2VsZWN0aW9uUmFuZ2UpIGFuZCBub3QgZm9sZFJhbmdlPy5pc0VxdWFsKHNlbGVjdGlvblJhbmdlKVxyXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShmb2xkUmFuZ2UpXHJcbiAgICAgICAgcmV0dXJuXHJcblxyXG4gIEBzZWxlY3RJbnNpZGVQYXJhZ3JhcGggPSAoc2VsZWN0aW9uKSAtPlxyXG4gICAgcmFuZ2UgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEN1cnJlbnRQYXJhZ3JhcGhCdWZmZXJSYW5nZSgpXHJcbiAgICByZXR1cm4gdW5sZXNzIHJhbmdlP1xyXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxyXG4gICAgc2VsZWN0aW9uLnNlbGVjdFRvQmVnaW5uaW5nT2ZOZXh0UGFyYWdyYXBoKClcclxuXHJcbiAgQHNlbGVjdEluc2lkZVF1b3RlcyA9IChzZWxlY3Rpb24sIGNoYXIsIGluY2x1ZGVRdW90ZXMpIC0+XHJcbiAgICBmaW5kT3BlbmluZ1F1b3RlID0gKHBvcykgLT5cclxuICAgICAgc3RhcnQgPSBwb3MuY29weSgpXHJcbiAgICAgIHBvcyA9IHBvcy5jb3B5KClcclxuICAgICAgd2hpbGUgcG9zLnJvdyA+PSAwXHJcbiAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhwb3Mucm93KVxyXG4gICAgICAgIHBvcy5jb2x1bW4gPSBsaW5lLmxlbmd0aCAtIDEgaWYgcG9zLmNvbHVtbiBpcyAtMVxyXG4gICAgICAgIHdoaWxlIHBvcy5jb2x1bW4gPj0gMFxyXG4gICAgICAgICAgaWYgbGluZVtwb3MuY29sdW1uXSBpcyBjaGFyXHJcbiAgICAgICAgICAgIGlmIHBvcy5jb2x1bW4gaXMgMCBvciBsaW5lW3Bvcy5jb2x1bW4gLSAxXSBpc250ICdcXFxcJ1xyXG4gICAgICAgICAgICAgIGlmIGlzU3RhcnRRdW90ZShwb3MpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvb2tCYWNrd2FyZE9uTGluZShzdGFydCkgb3IgbG9va0ZvcndhcmRPbkxpbmUoc3RhcnQpXHJcbiAgICAgICAgICAtLSBwb3MuY29sdW1uXHJcbiAgICAgICAgcG9zLmNvbHVtbiA9IC0xXHJcbiAgICAgICAgLS0gcG9zLnJvd1xyXG4gICAgICBsb29rRm9yd2FyZE9uTGluZShzdGFydClcclxuXHJcbiAgICBpc1N0YXJ0UXVvdGUgPSAoZW5kKSAtPlxyXG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGVuZC5yb3cpXHJcbiAgICAgIG51bVF1b3RlcyA9IGxpbmUuc3Vic3RyaW5nKDAsIGVuZC5jb2x1bW4gKyAxKS5yZXBsYWNlKCBcIicje2NoYXJ9XCIsICcnKS5zcGxpdChjaGFyKS5sZW5ndGggLSAxXHJcbiAgICAgIG51bVF1b3RlcyAlIDJcclxuXHJcbiAgICBsb29rRm9yd2FyZE9uTGluZSA9IChwb3MpIC0+XHJcbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9zLnJvdylcclxuXHJcbiAgICAgIGluZGV4ID0gbGluZS5zdWJzdHJpbmcocG9zLmNvbHVtbikuaW5kZXhPZihjaGFyKVxyXG4gICAgICBpZiBpbmRleCA+PSAwXHJcbiAgICAgICAgcG9zLmNvbHVtbiArPSBpbmRleFxyXG4gICAgICAgIHJldHVybiBwb3NcclxuICAgICAgbnVsbFxyXG5cclxuICAgIGxvb2tCYWNrd2FyZE9uTGluZSA9IChwb3MpIC0+XHJcbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9zLnJvdykuc3Vic3RyaW5nKDAscG9zLmNvbHVtbilcclxuXHJcbiAgICAgIGluZGV4ID0gbGluZS5sYXN0SW5kZXhPZihjaGFyKVxyXG4gICAgICBpZiBpbmRleCA+PSAwXHJcbiAgICAgICAgcG9zLmNvbHVtbiArPSBpbmRleCAtIGxpbmUubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIHBvc1xyXG4gICAgICBudWxsXHJcblxyXG4gICAgZmluZENsb3NpbmdRdW90ZSA9IChzdGFydCkgLT5cclxuICAgICAgZW5kID0gc3RhcnQuY29weSgpXHJcbiAgICAgIGVzY2FwaW5nID0gZmFsc2VcclxuXHJcbiAgICAgIHdoaWxlIGVuZC5yb3cgPCBlZGl0b3IuZ2V0TGluZUNvdW50KClcclxuICAgICAgICBlbmRMaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGVuZC5yb3cpXHJcbiAgICAgICAgd2hpbGUgZW5kLmNvbHVtbiA8IGVuZExpbmUubGVuZ3RoXHJcbiAgICAgICAgICBpZiBlbmRMaW5lW2VuZC5jb2x1bW5dIGlzICdcXFxcJ1xyXG4gICAgICAgICAgICArKyBlbmQuY29sdW1uXHJcbiAgICAgICAgICBlbHNlIGlmIGVuZExpbmVbZW5kLmNvbHVtbl0gaXMgY2hhclxyXG4gICAgICAgICAgICAtLSBzdGFydC5jb2x1bW4gaWYgaW5jbHVkZVF1b3Rlc1xyXG4gICAgICAgICAgICArKyBlbmQuY29sdW1uIGlmIGluY2x1ZGVRdW90ZXNcclxuICAgICAgICAgICAgcmV0dXJuIGVuZFxyXG4gICAgICAgICAgKysgZW5kLmNvbHVtblxyXG4gICAgICAgIGVuZC5jb2x1bW4gPSAwXHJcbiAgICAgICAgKysgZW5kLnJvd1xyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICB7ZWRpdG9yLCBjdXJzb3J9ID0gc2VsZWN0aW9uXHJcbiAgICBzdGFydCA9IGZpbmRPcGVuaW5nUXVvdGUoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXHJcbiAgICBpZiBzdGFydD9cclxuICAgICAgKysgc3RhcnQuY29sdW1uICMgc2tpcCB0aGUgb3BlbmluZyBxdW90ZVxyXG4gICAgICBlbmQgPSBmaW5kQ2xvc2luZ1F1b3RlKHN0YXJ0KVxyXG4gICAgICBpZiBlbmQ/XHJcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtzdGFydCwgZW5kXSlcclxuXHJcbiAgQHNlbGVjdEluc2lkZUJyYWNrZXRzID0gKHNlbGVjdGlvbiwgYmVnaW5DaGFyLCBlbmRDaGFyLCBpbmNsdWRlQnJhY2tldHMpIC0+XHJcbiAgICBmaW5kT3BlbmluZ0JyYWNrZXQgPSAocG9zKSAtPlxyXG4gICAgICBwb3MgPSBwb3MuY29weSgpXHJcbiAgICAgIGRlcHRoID0gMFxyXG4gICAgICB3aGlsZSBwb3Mucm93ID49IDBcclxuICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvcy5yb3cpXHJcbiAgICAgICAgcG9zLmNvbHVtbiA9IGxpbmUubGVuZ3RoIC0gMSBpZiBwb3MuY29sdW1uIGlzIC0xXHJcbiAgICAgICAgd2hpbGUgcG9zLmNvbHVtbiA+PSAwXHJcbiAgICAgICAgICBzd2l0Y2ggbGluZVtwb3MuY29sdW1uXVxyXG4gICAgICAgICAgICB3aGVuIGVuZENoYXIgdGhlbiArKyBkZXB0aFxyXG4gICAgICAgICAgICB3aGVuIGJlZ2luQ2hhclxyXG4gICAgICAgICAgICAgIHJldHVybiBwb3MgaWYgLS0gZGVwdGggPCAwXHJcbiAgICAgICAgICAtLSBwb3MuY29sdW1uXHJcbiAgICAgICAgcG9zLmNvbHVtbiA9IC0xXHJcbiAgICAgICAgLS0gcG9zLnJvd1xyXG5cclxuICAgIGZpbmRDbG9zaW5nQnJhY2tldCA9IChzdGFydCkgLT5cclxuICAgICAgZW5kID0gc3RhcnQuY29weSgpXHJcbiAgICAgIGRlcHRoID0gMFxyXG4gICAgICB3aGlsZSBlbmQucm93IDwgZWRpdG9yLmdldExpbmVDb3VudCgpXHJcbiAgICAgICAgZW5kTGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmQucm93KVxyXG4gICAgICAgIHdoaWxlIGVuZC5jb2x1bW4gPCBlbmRMaW5lLmxlbmd0aFxyXG4gICAgICAgICAgc3dpdGNoIGVuZExpbmVbZW5kLmNvbHVtbl1cclxuICAgICAgICAgICAgd2hlbiBiZWdpbkNoYXIgdGhlbiArKyBkZXB0aFxyXG4gICAgICAgICAgICB3aGVuIGVuZENoYXJcclxuICAgICAgICAgICAgICBpZiAtLSBkZXB0aCA8IDBcclxuICAgICAgICAgICAgICAgIC0tIHN0YXJ0LmNvbHVtbiBpZiBpbmNsdWRlQnJhY2tldHNcclxuICAgICAgICAgICAgICAgICsrIGVuZC5jb2x1bW4gaWYgaW5jbHVkZUJyYWNrZXRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZW5kXHJcbiAgICAgICAgICArKyBlbmQuY29sdW1uXHJcbiAgICAgICAgZW5kLmNvbHVtbiA9IDBcclxuICAgICAgICArKyBlbmQucm93XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHtlZGl0b3IsIGN1cnNvcn0gPSBzZWxlY3Rpb25cclxuICAgIHN0YXJ0ID0gZmluZE9wZW5pbmdCcmFja2V0KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxyXG4gICAgaWYgc3RhcnQ/XHJcbiAgICAgICsrIHN0YXJ0LmNvbHVtbiAjIHNraXAgdGhlIG9wZW5pbmcgcXVvdGVcclxuICAgICAgZW5kID0gZmluZENsb3NpbmdCcmFja2V0KHN0YXJ0KVxyXG4gICAgICBpZiBlbmQ/XHJcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtzdGFydCwgZW5kXSlcclxuIl19
