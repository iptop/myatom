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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2V4cGFuZC1yZWdpb24vbGliL2V4cGFuZC1yZWdpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvQ0FBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7MkJBQ0osTUFBQSxHQUFROzsyQkFDUixhQUFBLEdBQWU7OzJCQUNmLGNBQUEsR0FBZ0I7OzJCQUNoQixZQUFBLEdBQWM7OzJCQUNkLFVBQUEsR0FBWTs7MkJBRVosTUFBQSxHQUFRLFNBQUMsS0FBRDtNQUNOLElBQUMsQ0FBQSxhQUFELEdBQWlCLEtBQUssQ0FBQztNQUN2QixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxhQUFhLENBQUMsUUFBZixDQUFBO01BRVYsSUFBQSxDQUEwQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQTFDO1FBQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUFkOztNQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7QUFDOUIsY0FBQTtVQUFBLFNBQUEsR0FBWSxLQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsU0FBaEI7VUFDWixJQUFBLENBQWMsU0FBZDtBQUFBLG1CQUFBOztVQUNBLFlBQUEsR0FBZSxTQUFTLENBQUMsY0FBVixDQUFBO0FBQ2Y7QUFBQSxlQUFBLHFEQUFBOztZQUNFLElBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsS0FBckIsQ0FBQSxLQUErQixDQUFsQztjQUNFLFNBQVMsQ0FBQyxLQUFWLEdBQWtCO0FBQ2xCLHFCQUFPLFNBQVMsQ0FBQyxj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SyxDQUFDLEdBQU4sQ0FBVSxTQUFWLENBQUEsQ0FBcUIsQ0FBQyxJQUE5QixDQUFtQyxTQUFTLENBQUMsY0FBVixDQUFBLENBQW5DO0FBREY7WUFORixDQURGOztVQVVBLElBQTBDLEtBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUFBLENBQUEsS0FBbUMsU0FBN0U7WUFBQSxLQUFDLENBQUEsYUFBYSxDQUFDLFlBQWYsQ0FBNEIsU0FBNUIsRUFBQTs7aUJBQ0EsS0FBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBO1FBcEJlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtNQXVCQSxLQUFLLENBQUMsT0FBTixDQUFjLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFELEVBQVEsU0FBUjtVQUNaLElBQUcsU0FBUyxDQUFDLFNBQWI7bUJBQ0UsS0FBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxLQUFuQyxFQURGO1dBQUEsTUFBQTttQkFHRSxTQUFTLENBQUMsY0FBVixDQUF5QixLQUF6QixFQUhGOztRQURZO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkO2FBT0E7SUF4Q2E7OzJCQTBDZixXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsc0JBQVIsQ0FBQTtNQUNsQixRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQztRQUFBLEtBQUEsRUFBTyxlQUFQO09BQTFDO01BQ1YscUJBQXNCLElBQUksQ0FBQzthQUM1QixRQUFRLENBQUMsTUFBVCxDQUFnQixTQUFDLEdBQUQ7QUFBZSxZQUFBO1FBQWIsVUFBRDtlQUFjLGtCQUFtQixDQUFBLE9BQUE7TUFBbEMsQ0FBaEI7SUFKVzs7Ozs7QUEvSWYiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRXhwYW5kUmVnaW9uXG4gIGVkaXRvcjogbnVsbFxuICBlZGl0b3JFbGVtZW50OiBudWxsXG4gIGxhc3RTZWxlY3Rpb25zOiBbXVxuICBjdXJyZW50SW5kZXg6IDBcbiAgbGFzdEVkaXRvcjogbnVsbFxuXG4gIGV4cGFuZDogKGV2ZW50KSA9PlxuICAgIEBlZGl0b3JFbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldFxuICAgIEBlZGl0b3IgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG5cbiAgICBAY2FuZGlkYXRlcyA9IEBjb21wdXRlQ2FuZGlkYXRlcygpIHVubGVzcyBAaXNBY3RpdmUoKVxuXG4gICAgQGVkaXRvci5leHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PlxuICAgICAgY2FuZGlkYXRlID0gQGNhbmRpZGF0ZXMuZ2V0KHNlbGVjdGlvbilcbiAgICAgIHJldHVybiB1bmxlc3MgY2FuZGlkYXRlXG4gICAgICBjdXJyZW50UmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgZm9yIHJhbmdlLCBpbmRleCBpbiBjYW5kaWRhdGUucmFuZ2VzXG4gICAgICAgIGlmIGN1cnJlbnRSYW5nZS5jb21wYXJlKHJhbmdlKSBpcyAxXG4gICAgICAgICAgY2FuZGlkYXRlLmluZGV4ID0gaW5kZXhcbiAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgIEBzYXZlU3RhdGUoKVxuICAgIEBjdXJyZW50SW5kZXgrK1xuICAgIHJldHVyblxuXG4gIHNocmluazogKGV2ZW50KSA9PlxuICAgIEBlZGl0b3JFbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldFxuICAgIEBlZGl0b3IgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgcmV0dXJuIHVubGVzcyBAaXNBY3RpdmUoKVxuICAgIHJldHVybiBpZiBAY3VycmVudEluZGV4IGlzIDBcblxuICAgIEBjdXJyZW50SW5kZXgtLVxuICAgIEBjYW5kaWRhdGVzLmZvckVhY2goKGNhbmRpZGF0ZSwgc2VsZWN0aW9uKSA9PlxuICAgICAgaWYgc2VsZWN0aW9uLmRlc3Ryb3llZFxuICAgICAgICBpZiBjYW5kaWRhdGUucmFuZ2VzLmxlbmd0aCA+IEBjdXJyZW50SW5kZXhcbiAgICAgICAgICBAY2FuZGlkYXRlcy5kZWxldGUoc2VsZWN0aW9uKVxuICAgICAgICAgIHJhbmdlICA9IGNhbmRpZGF0ZS5yYW5nZXNbQGN1cnJlbnRJbmRleF1cbiAgICAgICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlLCBhdXRvc2Nyb2xsOiBmYWxzZSlcbiAgICAgICAgICBzZWxlY3Rpb24uY2xlYXIoKSBpZiByYW5nZS5pc0VtcHR5KClcbiAgICAgICAgICBAY2FuZGlkYXRlcy5zZXQoc2VsZWN0aW9uLCBjYW5kaWRhdGUpXG4gICAgICBlbHNlIGlmIGNhbmRpZGF0ZS5yYW5nZXMubGVuZ3RoID4gQGN1cnJlbnRJbmRleFxuICAgICAgICByYW5nZSA9IGNhbmRpZGF0ZS5yYW5nZXNbQGN1cnJlbnRJbmRleF1cbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCBhdXRvc2Nyb2xsOiBmYWxzZSlcbiAgICAgICAgc2VsZWN0aW9uLmNsZWFyKCkgaWYgcmFuZ2UuaXNFbXB0eSgpXG4gICAgKVxuXG4gICAgQHNhdmVTdGF0ZSgpXG5cbiAgc2F2ZVN0YXRlOiAtPlxuICAgIEBsYXN0U2VsZWN0aW9ucyA9IChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpKVxuICAgIEBsYXN0RWRpdG9yID0gQGVkaXRvclxuXG4gIGNvbXB1dGVDYW5kaWRhdGVzOiAtPlxuICAgIEBsYXN0U2VsZWN0aW9ucyA9IFtdXG4gICAgQGN1cnJlbnRJbmRleCA9IDBcbiAgICBjYW5kaWRhdGVzID0gbmV3IE1hcFxuXG4gICAgcmVzdWx0cyA9IHt9XG4gICAgZm9yIHtjb21tYW5kLCByZWN1cnNpdmV9IGluIEBnZXRDb21tYW5kcygpXG4gICAgICBmb3Igc2VsZWN0aW9uUmFuZ2UsIHJhbmdlcyBvZiBAY29tcHV0ZVJhbmdlcyhjb21tYW5kLCByZWN1cnNpdmUpXG4gICAgICAgIHJlc3VsdHNbc2VsZWN0aW9uUmFuZ2VdID0gW10gdW5sZXNzIHJlc3VsdHNbc2VsZWN0aW9uUmFuZ2VdP1xuICAgICAgICByZXN1bHRzW3NlbGVjdGlvblJhbmdlXS5wdXNoKHJhbmdlcy4uLilcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGNhbmRpZGF0ZSA9XG4gICAgICAgcmFuZ2VzOiBbc2VsZWN0aW9uUmFuZ2VdXG4gICAgICAgI2luZGV4OiAwXG5cbiAgICAgIGlmIHJlc3VsdHNbc2VsZWN0aW9uUmFuZ2VdP1xuICAgICAgICBjYW5kaWRhdGUucmFuZ2VzLnB1c2gocmVzdWx0c1tzZWxlY3Rpb25SYW5nZV0uLi4pXG5cbiAgICAgIGNhbmRpZGF0ZXMuc2V0KHNlbGVjdGlvbiwgY2FuZGlkYXRlKVxuXG4gICAgQHVuaXEoY2FuZGlkYXRlcylcblxuICB1bmlxOiAoY2FuZGlkYXRlcykgLT5cbiAgICBjYW5kaWRhdGVzLmZvckVhY2ggKGNhbmRpZGF0ZSkgLT5cbiAgICAgIGNhbmRpZGF0ZS5yYW5nZXMuc29ydCgoYSwgYikgLT5cbiAgICAgICAgYi5jb21wYXJlKGEpXG4gICAgICApXG4gICAgICBjYW5kaWRhdGUucmFuZ2VzID0gXy51bmlxKGNhbmRpZGF0ZS5yYW5nZXMsIHRydWUsICh2KSAtPiB2LnRvU3RyaW5nKCkpXG4gICAgY2FuZGlkYXRlc1xuXG4gIGlzQWN0aXZlOiAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBAZWRpdG9yIGlzbnQgQGxhc3RFZGl0b3JcbiAgICByZXR1cm4gZmFsc2UgaWYgQGxhc3RTZWxlY3Rpb25zLmxlbmd0aCBpcyAwXG5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICByZXR1cm4gZmFsc2UgaWYgQGxhc3RTZWxlY3Rpb25zLmxlbmd0aCBpc250IHNlbGVjdGlvbnMubGVuZ3RoXG5cbiAgICBmb3Igc2VsZWN0aW9uLCBpbmRleCBpbiBzZWxlY3Rpb25zXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwoQGxhc3RTZWxlY3Rpb25zW2luZGV4XSlcblxuICAgIHRydWVcblxuICBjb21wdXRlUmFuZ2VzOiAoY29tbWFuZCwgcmVjdXJzaXZlID0gZmFsc2UpIC0+XG4gICAgc3RhdGUgPSBuZXcgTWFwXG4gICAgcmVzdWx0cyA9IHt9XG4gICAgcmFuZ2VzID0gW11cblxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHN0YXRlLnNldChzZWxlY3Rpb24sIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxuXG4gICAgc2Nyb2xsVG9wID0gQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcblxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsIGNvbW1hbmQpXG5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgcmVzdWx0c1tzdGF0ZS5nZXQoc2VsZWN0aW9uKV0gPSBbc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCldXG5cbiAgICAgIHNlbGVjdGlvbjJzdHJpbmcgPSAoc2VsZWN0aW9uKSAtPlxuICAgICAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS50b1N0cmluZygpXG5cbiAgICAgIGlmIHJlY3Vyc2l2ZVxuICAgICAgICB3aGlsZSAxXG4gICAgICAgICAgcHJldlJhbmdlcyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChzZWxlY3Rpb24yc3RyaW5nKVxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsIGNvbW1hbmQpXG4gICAgICAgICAgY3VycmVudFJhbmdlcyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChzZWxlY3Rpb24yc3RyaW5nKVxuICAgICAgICAgIGJyZWFrIGlmIF8uaXNFcXVhbChwcmV2UmFuZ2VzLCBjdXJyZW50UmFuZ2VzKVxuXG4gICAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgICAgcmVzdWx0c1tzdGF0ZS5nZXQoc2VsZWN0aW9uKV0ucHVzaChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICAgICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcCkgaWYgQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgaXNudCBzY3JvbGxUb3BcbiAgICAgIEBlZGl0b3IuYWJvcnRUcmFuc2FjdGlvbigpXG5cbiAgICAjIHJlc3RvcmVcbiAgICBzdGF0ZS5mb3JFYWNoKChyYW5nZSwgc2VsZWN0aW9uKSA9PlxuICAgICAgaWYgc2VsZWN0aW9uLmRlc3Ryb3llZFxuICAgICAgICBAZWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgZWxzZVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgKVxuXG4gICAgcmVzdWx0c1xuXG4gIGdldENvbW1hbmRzOiAtPlxuICAgIHNjb3BlRGVzY3JpcHRvciA9IEBlZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpXG4gICAgY29tbWFuZHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2V4cGFuZC1yZWdpb24uY29tbWFuZHMnLCBzY29wZTogc2NvcGVEZXNjcmlwdG9yKVxuICAgIHtyZWdpc3RlcmVkQ29tbWFuZHN9ID0gYXRvbS5jb21tYW5kc1xuICAgIGNvbW1hbmRzLmZpbHRlcigoe2NvbW1hbmR9KSAtPiByZWdpc3RlcmVkQ29tbWFuZHNbY29tbWFuZF0pXG4iXX0=
