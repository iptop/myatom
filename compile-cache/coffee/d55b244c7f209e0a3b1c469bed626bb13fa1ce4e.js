(function() {
  var CompositeDisposable, ExpandRegion, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ExpandRegion = (function() {
    function ExpandRegion() {
      this.shrink = bind(this.shrink, this);
      this.expand = bind(this.expand, this);
    }

    ExpandRegion.prototype.editor = null;

    ExpandRegion.prototype.editorElement = null;

    ExpandRegion.prototype.lastSelections = [];

    ExpandRegion.prototype.currentIndex = 0;

    ExpandRegion.prototype.lastEditor = null;

    ExpandRegion.prototype.expand = function(event) {
      this.editorElement = event.currentTarget;
      this.editor = this.editorElement.getModel();
      if (!this.isActive()) {
        this.candidates = this.computeCandidates();
      }
      this.editor.expandSelectionsForward((function(_this) {
        return function(selection) {
          var candidate, currentRange, i, index, len, range, ref;
          candidate = _this.candidates.get(selection);
          if (!candidate) {
            return;
          }
          currentRange = selection.getBufferRange();
          ref = candidate.ranges;
          for (index = i = 0, len = ref.length; i < len; index = ++i) {
            range = ref[index];
            if (currentRange.compare(range) === 1) {
              candidate.index = index;
              return selection.setBufferRange(range, {
                autoscroll: false
              });
            }
          }
        };
      })(this));
      this.saveState();
      this.currentIndex++;
    };

    ExpandRegion.prototype.shrink = function(event) {
      this.editorElement = event.currentTarget;
      this.editor = this.editorElement.getModel();
      if (!this.isActive()) {
        return;
      }
      if (this.currentIndex === 0) {
        return;
      }
      this.currentIndex--;
      this.candidates.forEach((function(_this) {
        return function(candidate, selection) {
          var range;
          if (selection.destroyed) {
            if (candidate.ranges.length > _this.currentIndex) {
              _this.candidates["delete"](selection);
              range = candidate.ranges[_this.currentIndex];
              selection = _this.editor.addSelectionForBufferRange(range, {
                autoscroll: false
              });
              if (range.isEmpty()) {
                selection.clear();
              }
              return _this.candidates.set(selection, candidate);
            }
          } else if (candidate.ranges.length > _this.currentIndex) {
            range = candidate.ranges[_this.currentIndex];
            selection.setBufferRange(range, {
              autoscroll: false
            });
            if (range.isEmpty()) {
              return selection.clear();
            }
          }
        };
      })(this));
      return this.saveState();
    };

    ExpandRegion.prototype.saveState = function() {
      var selection;
      this.lastSelections = (function() {
        var i, len, ref, results1;
        ref = this.editor.getSelections();
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          selection = ref[i];
          results1.push(selection.getBufferRange());
        }
        return results1;
      }).call(this);
      return this.lastEditor = this.editor;
    };

    ExpandRegion.prototype.computeCandidates = function() {
      var candidate, candidates, command, i, j, len, len1, ranges, recursive, ref, ref1, ref2, ref3, ref4, ref5, results, selection, selectionRange;
      this.lastSelections = [];
      this.currentIndex = 0;
      candidates = new Map;
      results = {};
      ref = this.getCommands();
      for (i = 0, len = ref.length; i < len; i++) {
        ref1 = ref[i], command = ref1.command, recursive = ref1.recursive;
        ref2 = this.computeRanges(command, recursive);
        for (selectionRange in ref2) {
          ranges = ref2[selectionRange];
          if (results[selectionRange] == null) {
            results[selectionRange] = [];
          }
          (ref3 = results[selectionRange]).push.apply(ref3, ranges);
        }
      }
      ref4 = this.editor.getSelections();
      for (j = 0, len1 = ref4.length; j < len1; j++) {
        selection = ref4[j];
        selectionRange = selection.getBufferRange();
        candidate = {
          ranges: [selectionRange]
        };
        if (results[selectionRange] != null) {
          (ref5 = candidate.ranges).push.apply(ref5, results[selectionRange]);
        }
        candidates.set(selection, candidate);
      }
      return this.uniq(candidates);
    };

    ExpandRegion.prototype.uniq = function(candidates) {
      candidates.forEach(function(candidate) {
        candidate.ranges.sort(function(a, b) {
          return b.compare(a);
        });
        return candidate.ranges = _.uniq(candidate.ranges, true, function(v) {
          return v.toString();
        });
      });
      return candidates;
    };

    ExpandRegion.prototype.isActive = function() {
      var i, index, len, selection, selections;
      if (this.editor !== this.lastEditor) {
        return false;
      }
      if (this.lastSelections.length === 0) {
        return false;
      }
      selections = this.editor.getSelections();
      if (this.lastSelections.length !== selections.length) {
        return false;
      }
      for (index = i = 0, len = selections.length; i < len; index = ++i) {
        selection = selections[index];
        if (!selection.getBufferRange().isEqual(this.lastSelections[index])) {
          return false;
        }
      }
      return true;
    };

    ExpandRegion.prototype.computeRanges = function(command, recursive) {
      var i, len, ranges, ref, results, scrollTop, selection, state;
      if (recursive == null) {
        recursive = false;
      }
      state = new Map;
      results = {};
      ranges = [];
      ref = this.editor.getSelections();
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        state.set(selection, selection.getBufferRange());
      }
      scrollTop = this.editorElement.getScrollTop();
      this.editor.transact((function(_this) {
        return function() {
          var currentRanges, j, k, len1, len2, prevRanges, ref1, ref2, selection2string;
          atom.commands.dispatch(_this.editorElement, command);
          ref1 = _this.editor.getSelections();
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            selection = ref1[j];
            results[state.get(selection)] = [selection.getBufferRange()];
          }
          selection2string = function(selection) {
            return selection.getBufferRange().toString();
          };
          if (recursive) {
            while (1) {
              prevRanges = _this.editor.getSelections().map(selection2string);
              atom.commands.dispatch(_this.editorElement, command);
              currentRanges = _this.editor.getSelections().map(selection2string);
              if (_.isEqual(prevRanges, currentRanges)) {
                break;
              }
              ref2 = _this.editor.getSelections();
              for (k = 0, len2 = ref2.length; k < len2; k++) {
                selection = ref2[k];
                results[state.get(selection)].push(selection.getBufferRange());
              }
            }
          }
          if (_this.editorElement.getScrollTop() !== scrollTop) {
            _this.editorElement.setScrollTop(scrollTop);
          }
          return _this.editor.abortTransaction();
        };
      })(this));
      state.forEach((function(_this) {
        return function(range, selection) {
          if (selection.destroyed) {
            return _this.editor.addSelectionForBufferRange(range);
          } else {
            return selection.setBufferRange(range);
          }
        };
      })(this));
      return results;
    };

    ExpandRegion.prototype.getCommands = function() {
      var commands, registeredCommands, scopeDescriptor;
      scopeDescriptor = this.editor.getRootScopeDescriptor();
      commands = atom.config.get('expand-region.commands', {
        scope: scopeDescriptor
      });
      registeredCommands = atom.commands.registeredCommands;
      return commands.filter(function(arg) {
        var command;
        command = arg.command;
        return registeredCommands[command];
      });
    };

    return ExpandRegion;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9leHBhbmQtcmVnaW9uL2xpYi9leHBhbmQtcmVnaW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0NBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNILHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OzJCQUNKLE1BQUEsR0FBUTs7MkJBQ1IsYUFBQSxHQUFlOzsyQkFDZixjQUFBLEdBQWdCOzsyQkFDaEIsWUFBQSxHQUFjOzsyQkFDZCxVQUFBLEdBQVk7OzJCQUVaLE1BQUEsR0FBUSxTQUFDLEtBQUQ7TUFDTixJQUFDLENBQUEsYUFBRCxHQUFpQixLQUFLLENBQUM7TUFDdkIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQTtNQUVWLElBQUEsQ0FBMEMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUExQztRQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFBZDs7TUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO0FBQzlCLGNBQUE7VUFBQSxTQUFBLEdBQVksS0FBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLFNBQWhCO1VBQ1osSUFBQSxDQUFjLFNBQWQ7QUFBQSxtQkFBQTs7VUFDQSxZQUFBLEdBQWUsU0FBUyxDQUFDLGNBQVYsQ0FBQTtBQUNmO0FBQUEsZUFBQSxxREFBQTs7WUFDRSxJQUFHLFlBQVksQ0FBQyxPQUFiLENBQXFCLEtBQXJCLENBQUEsS0FBK0IsQ0FBbEM7Y0FDRSxTQUFTLENBQUMsS0FBVixHQUFrQjtBQUNsQixxQkFBTyxTQUFTLENBQUMsY0FBVixDQUF5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QUFOLENBQVUsU0FBVixDQUFBLENBQXFCLENBQUMsSUFBOUIsQ0FBbUMsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUFuQztBQURGO1lBTkYsQ0FERjs7VUFVQSxJQUEwQyxLQUFDLENBQUEsYUFBYSxDQUFDLFlBQWYsQ0FBQSxDQUFBLEtBQW1DLFNBQTdFO1lBQUEsS0FBQyxDQUFBLGFBQWEsQ0FBQyxZQUFmLENBQTRCLFNBQTVCLEVBQUE7O2lCQUNBLEtBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQTtRQXBCZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7TUF1QkEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRCxFQUFRLFNBQVI7VUFDWixJQUFHLFNBQVMsQ0FBQyxTQUFiO21CQUNFLEtBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsS0FBbkMsRUFERjtXQUFBLE1BQUE7bUJBR0UsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsS0FBekIsRUFIRjs7UUFEWTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZDthQU9BO0lBeENhOzsyQkEwQ2YsV0FBQSxHQUFhLFNBQUE7QUFDWCxVQUFBO01BQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQUE7TUFDbEIsUUFBQSxHQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEM7UUFBQSxLQUFBLEVBQU8sZUFBUDtPQUExQztNQUNWLHFCQUFzQixJQUFJLENBQUM7YUFDNUIsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBQyxHQUFEO0FBQWUsWUFBQTtRQUFiLFVBQUQ7ZUFBYyxrQkFBbUIsQ0FBQSxPQUFBO01BQWxDLENBQWhCO0lBSlc7Ozs7O0FBL0lmIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcclxue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuY2xhc3MgRXhwYW5kUmVnaW9uXHJcbiAgZWRpdG9yOiBudWxsXHJcbiAgZWRpdG9yRWxlbWVudDogbnVsbFxyXG4gIGxhc3RTZWxlY3Rpb25zOiBbXVxyXG4gIGN1cnJlbnRJbmRleDogMFxyXG4gIGxhc3RFZGl0b3I6IG51bGxcclxuXHJcbiAgZXhwYW5kOiAoZXZlbnQpID0+XHJcbiAgICBAZWRpdG9yRWxlbWVudCA9IGV2ZW50LmN1cnJlbnRUYXJnZXRcclxuICAgIEBlZGl0b3IgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXHJcblxyXG4gICAgQGNhbmRpZGF0ZXMgPSBAY29tcHV0ZUNhbmRpZGF0ZXMoKSB1bmxlc3MgQGlzQWN0aXZlKClcclxuXHJcbiAgICBAZWRpdG9yLmV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkIChzZWxlY3Rpb24pID0+XHJcbiAgICAgIGNhbmRpZGF0ZSA9IEBjYW5kaWRhdGVzLmdldChzZWxlY3Rpb24pXHJcbiAgICAgIHJldHVybiB1bmxlc3MgY2FuZGlkYXRlXHJcbiAgICAgIGN1cnJlbnRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXHJcbiAgICAgIGZvciByYW5nZSwgaW5kZXggaW4gY2FuZGlkYXRlLnJhbmdlc1xyXG4gICAgICAgIGlmIGN1cnJlbnRSYW5nZS5jb21wYXJlKHJhbmdlKSBpcyAxXHJcbiAgICAgICAgICBjYW5kaWRhdGUuaW5kZXggPSBpbmRleFxyXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSwgYXV0b3Njcm9sbDogZmFsc2UpXHJcblxyXG4gICAgQHNhdmVTdGF0ZSgpXHJcbiAgICBAY3VycmVudEluZGV4KytcclxuICAgIHJldHVyblxyXG5cclxuICBzaHJpbms6IChldmVudCkgPT5cclxuICAgIEBlZGl0b3JFbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldFxyXG4gICAgQGVkaXRvciA9IEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcclxuICAgIHJldHVybiB1bmxlc3MgQGlzQWN0aXZlKClcclxuICAgIHJldHVybiBpZiBAY3VycmVudEluZGV4IGlzIDBcclxuXHJcbiAgICBAY3VycmVudEluZGV4LS1cclxuICAgIEBjYW5kaWRhdGVzLmZvckVhY2goKGNhbmRpZGF0ZSwgc2VsZWN0aW9uKSA9PlxyXG4gICAgICBpZiBzZWxlY3Rpb24uZGVzdHJveWVkXHJcbiAgICAgICAgaWYgY2FuZGlkYXRlLnJhbmdlcy5sZW5ndGggPiBAY3VycmVudEluZGV4XHJcbiAgICAgICAgICBAY2FuZGlkYXRlcy5kZWxldGUoc2VsZWN0aW9uKVxyXG4gICAgICAgICAgcmFuZ2UgID0gY2FuZGlkYXRlLnJhbmdlc1tAY3VycmVudEluZGV4XVxyXG4gICAgICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShyYW5nZSwgYXV0b3Njcm9sbDogZmFsc2UpXHJcbiAgICAgICAgICBzZWxlY3Rpb24uY2xlYXIoKSBpZiByYW5nZS5pc0VtcHR5KClcclxuICAgICAgICAgIEBjYW5kaWRhdGVzLnNldChzZWxlY3Rpb24sIGNhbmRpZGF0ZSlcclxuICAgICAgZWxzZSBpZiBjYW5kaWRhdGUucmFuZ2VzLmxlbmd0aCA+IEBjdXJyZW50SW5kZXhcclxuICAgICAgICByYW5nZSA9IGNhbmRpZGF0ZS5yYW5nZXNbQGN1cnJlbnRJbmRleF1cclxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIGF1dG9zY3JvbGw6IGZhbHNlKVxyXG4gICAgICAgIHNlbGVjdGlvbi5jbGVhcigpIGlmIHJhbmdlLmlzRW1wdHkoKVxyXG4gICAgKVxyXG5cclxuICAgIEBzYXZlU3RhdGUoKVxyXG5cclxuICBzYXZlU3RhdGU6IC0+XHJcbiAgICBAbGFzdFNlbGVjdGlvbnMgPSAoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSlcclxuICAgIEBsYXN0RWRpdG9yID0gQGVkaXRvclxyXG5cclxuICBjb21wdXRlQ2FuZGlkYXRlczogLT5cclxuICAgIEBsYXN0U2VsZWN0aW9ucyA9IFtdXHJcbiAgICBAY3VycmVudEluZGV4ID0gMFxyXG4gICAgY2FuZGlkYXRlcyA9IG5ldyBNYXBcclxuXHJcbiAgICByZXN1bHRzID0ge31cclxuICAgIGZvciB7Y29tbWFuZCwgcmVjdXJzaXZlfSBpbiBAZ2V0Q29tbWFuZHMoKVxyXG4gICAgICBmb3Igc2VsZWN0aW9uUmFuZ2UsIHJhbmdlcyBvZiBAY29tcHV0ZVJhbmdlcyhjb21tYW5kLCByZWN1cnNpdmUpXHJcbiAgICAgICAgcmVzdWx0c1tzZWxlY3Rpb25SYW5nZV0gPSBbXSB1bmxlc3MgcmVzdWx0c1tzZWxlY3Rpb25SYW5nZV0/XHJcbiAgICAgICAgcmVzdWx0c1tzZWxlY3Rpb25SYW5nZV0ucHVzaChyYW5nZXMuLi4pXHJcblxyXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxyXG4gICAgICBzZWxlY3Rpb25SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXHJcbiAgICAgIGNhbmRpZGF0ZSA9XHJcbiAgICAgICByYW5nZXM6IFtzZWxlY3Rpb25SYW5nZV1cclxuICAgICAgICNpbmRleDogMFxyXG5cclxuICAgICAgaWYgcmVzdWx0c1tzZWxlY3Rpb25SYW5nZV0/XHJcbiAgICAgICAgY2FuZGlkYXRlLnJhbmdlcy5wdXNoKHJlc3VsdHNbc2VsZWN0aW9uUmFuZ2VdLi4uKVxyXG5cclxuICAgICAgY2FuZGlkYXRlcy5zZXQoc2VsZWN0aW9uLCBjYW5kaWRhdGUpXHJcblxyXG4gICAgQHVuaXEoY2FuZGlkYXRlcylcclxuXHJcbiAgdW5pcTogKGNhbmRpZGF0ZXMpIC0+XHJcbiAgICBjYW5kaWRhdGVzLmZvckVhY2ggKGNhbmRpZGF0ZSkgLT5cclxuICAgICAgY2FuZGlkYXRlLnJhbmdlcy5zb3J0KChhLCBiKSAtPlxyXG4gICAgICAgIGIuY29tcGFyZShhKVxyXG4gICAgICApXHJcbiAgICAgIGNhbmRpZGF0ZS5yYW5nZXMgPSBfLnVuaXEoY2FuZGlkYXRlLnJhbmdlcywgdHJ1ZSwgKHYpIC0+IHYudG9TdHJpbmcoKSlcclxuICAgIGNhbmRpZGF0ZXNcclxuXHJcbiAgaXNBY3RpdmU6IC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGVkaXRvciBpc250IEBsYXN0RWRpdG9yXHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGxhc3RTZWxlY3Rpb25zLmxlbmd0aCBpcyAwXHJcblxyXG4gICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGxhc3RTZWxlY3Rpb25zLmxlbmd0aCBpc250IHNlbGVjdGlvbnMubGVuZ3RoXHJcblxyXG4gICAgZm9yIHNlbGVjdGlvbiwgaW5kZXggaW4gc2VsZWN0aW9uc1xyXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwoQGxhc3RTZWxlY3Rpb25zW2luZGV4XSlcclxuXHJcbiAgICB0cnVlXHJcblxyXG4gIGNvbXB1dGVSYW5nZXM6IChjb21tYW5kLCByZWN1cnNpdmUgPSBmYWxzZSkgLT5cclxuICAgIHN0YXRlID0gbmV3IE1hcFxyXG4gICAgcmVzdWx0cyA9IHt9XHJcbiAgICByYW5nZXMgPSBbXVxyXG5cclxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcclxuICAgICAgc3RhdGUuc2V0KHNlbGVjdGlvbiwgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXHJcblxyXG4gICAgc2Nyb2xsVG9wID0gQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcclxuXHJcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XHJcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsIGNvbW1hbmQpXHJcblxyXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXHJcbiAgICAgICAgcmVzdWx0c1tzdGF0ZS5nZXQoc2VsZWN0aW9uKV0gPSBbc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCldXHJcblxyXG4gICAgICBzZWxlY3Rpb24yc3RyaW5nID0gKHNlbGVjdGlvbikgLT5cclxuICAgICAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS50b1N0cmluZygpXHJcblxyXG4gICAgICBpZiByZWN1cnNpdmVcclxuICAgICAgICB3aGlsZSAxXHJcbiAgICAgICAgICBwcmV2UmFuZ2VzID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKHNlbGVjdGlvbjJzdHJpbmcpXHJcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKEBlZGl0b3JFbGVtZW50LCBjb21tYW5kKVxyXG4gICAgICAgICAgY3VycmVudFJhbmdlcyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChzZWxlY3Rpb24yc3RyaW5nKVxyXG4gICAgICAgICAgYnJlYWsgaWYgXy5pc0VxdWFsKHByZXZSYW5nZXMsIGN1cnJlbnRSYW5nZXMpXHJcblxyXG4gICAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxyXG4gICAgICAgICAgICByZXN1bHRzW3N0YXRlLmdldChzZWxlY3Rpb24pXS5wdXNoKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxyXG5cclxuICAgICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcCkgaWYgQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgaXNudCBzY3JvbGxUb3BcclxuICAgICAgQGVkaXRvci5hYm9ydFRyYW5zYWN0aW9uKClcclxuXHJcbiAgICAjIHJlc3RvcmVcclxuICAgIHN0YXRlLmZvckVhY2goKHJhbmdlLCBzZWxlY3Rpb24pID0+XHJcbiAgICAgIGlmIHNlbGVjdGlvbi5kZXN0cm95ZWRcclxuICAgICAgICBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxyXG4gICAgKVxyXG5cclxuICAgIHJlc3VsdHNcclxuXHJcbiAgZ2V0Q29tbWFuZHM6IC0+XHJcbiAgICBzY29wZURlc2NyaXB0b3IgPSBAZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKVxyXG4gICAgY29tbWFuZHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2V4cGFuZC1yZWdpb24uY29tbWFuZHMnLCBzY29wZTogc2NvcGVEZXNjcmlwdG9yKVxyXG4gICAge3JlZ2lzdGVyZWRDb21tYW5kc30gPSBhdG9tLmNvbW1hbmRzXHJcbiAgICBjb21tYW5kcy5maWx0ZXIoKHtjb21tYW5kfSkgLT4gcmVnaXN0ZXJlZENvbW1hbmRzW2NvbW1hbmRdKVxyXG4iXX0=
