(function() {
  var CompositeDisposable, Mark, Point, State, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Point = ref.Point;

  State = require('./state');

  Mark = (function() {
    Mark.deactivatable = [];

    Mark.deactivatePending = function() {
      var i, len, mark, ref1;
      ref1 = this.deactivatable;
      for (i = 0, len = ref1.length; i < len; i++) {
        mark = ref1[i];
        mark.deactivate();
      }
      return this.deactivatable.length = 0;
    };

    function Mark(cursor) {
      this.cursor = cursor;
      this.editor = cursor.editor;
      this.marker = this.editor.markBufferPosition(cursor.getBufferPosition());
      this.active = false;
      this.updating = false;
    }

    Mark.prototype.destroy = function() {
      if (this.active) {
        this.deactivate();
      }
      return this.marker.destroy();
    };

    Mark.prototype.set = function(point) {
      if (point == null) {
        point = this.cursor.getBufferPosition();
      }
      this.deactivate();
      this.marker.setHeadBufferPosition(point);
      this._updateSelection();
      return this;
    };

    Mark.prototype.getBufferPosition = function() {
      return this.marker.getHeadBufferPosition();
    };

    Mark.prototype.activate = function() {
      if (!this.active) {
        this.activeSubscriptions = new CompositeDisposable;
        this.activeSubscriptions.add(this.cursor.onDidChangePosition((function(_this) {
          return function(event) {
            return _this._updateSelection(event);
          };
        })(this)));
        this.activeSubscriptions.add(atom.commands.onDidDispatch((function(_this) {
          return function(event) {
            return _this._updateSelection(event);
          };
        })(this)));
        this.activeSubscriptions.add(this.editor.getBuffer().onDidChange((function(_this) {
          return function(event) {
            if (!(_this._isIndent(event) || _this._isOutdent(event))) {
              if (State.isDuringCommand) {
                return Mark.deactivatable.push(_this);
              } else {
                return _this.deactivate();
              }
            }
          };
        })(this)));
        return this.active = true;
      }
    };

    Mark.prototype.deactivate = function() {
      if (this.active) {
        this.activeSubscriptions.dispose();
        this.active = false;
      }
      if (!this.cursor.editor.isDestroyed()) {
        return this.cursor.clearSelection();
      }
    };

    Mark.prototype.isActive = function() {
      return this.active;
    };

    Mark.prototype.exchange = function() {
      var position;
      position = this.marker.getHeadBufferPosition();
      this.set().activate();
      return this.cursor.setBufferPosition(position);
    };

    Mark.prototype._updateSelection = function(event) {
      var head, tail;
      if (!this.updating) {
        this.updating = true;
        try {
          head = this.cursor.getBufferPosition();
          tail = this.marker.getHeadBufferPosition();
          return this.setSelectionRange(head, tail);
        } finally {
          this.updating = false;
        }
      }
    };

    Mark.prototype.getSelectionRange = function() {
      return this.cursor.selection.getBufferRange();
    };

    Mark.prototype.setSelectionRange = function(head, tail) {
      var reversed;
      reversed = Point.min(head, tail) === head;
      return this.cursor.selection.setBufferRange([head, tail], {
        reversed: reversed
      });
    };

    Mark.prototype._isIndent = function(event) {
      return this._isIndentOutdent(event.newRange, event.newText);
    };

    Mark.prototype._isOutdent = function(event) {
      return this._isIndentOutdent(event.oldRange, event.oldText);
    };

    Mark.prototype._isIndentOutdent = function(range, text) {
      var diff, tabLength;
      tabLength = this.editor.getTabLength();
      diff = range.end.column - range.start.column;
      if (diff === this.editor.getTabLength() && range.start.row === range.end.row && this._checkTextForSpaces(text, tabLength)) {
        return true;
      }
    };

    Mark.prototype._checkTextForSpaces = function(text, tabSize) {
      var ch, i, len;
      if (!(text && text.length === tabSize)) {
        return false;
      }
      for (i = 0, len = text.length; i < len; i++) {
        ch = text[i];
        if (ch !== " ") {
          return false;
        }
      }
      return true;
    };

    return Mark;

  })();

  module.exports = Mark;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9taWMtZW1hY3MvbGliL21hcmsuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUErQixPQUFBLENBQVEsTUFBUixDQUEvQixFQUFDLDZDQUFELEVBQXNCOztFQUN0QixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBY0Y7SUFDSixJQUFDLENBQUEsYUFBRCxHQUFpQjs7SUFFakIsSUFBQyxDQUFBLGlCQUFELEdBQW9CLFNBQUE7QUFDbEIsVUFBQTtBQUFBO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxJQUFJLENBQUMsVUFBTCxDQUFBO0FBREY7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsR0FBd0I7SUFITjs7SUFLUCxjQUFDLE1BQUQ7TUFDWCxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxNQUFNLENBQUM7TUFDakIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQTNCO01BQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFMRDs7bUJBT2IsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFpQixJQUFDLENBQUEsTUFBbEI7UUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBQUE7O2FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUE7SUFGTzs7bUJBSVQsR0FBQSxHQUFLLFNBQUMsS0FBRDs7UUFBQyxRQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBQTs7TUFDVixJQUFDLENBQUEsVUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUE4QixLQUE5QjtNQUNBLElBQUMsQ0FBQSxn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LGlCQUFPLE1BQVA7O0FBREY7YUFFQTtJQUxtQjs7Ozs7O0VBT3ZCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdEhqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xyXG5TdGF0ZSA9IHJlcXVpcmUgJy4vc3RhdGUnXHJcblxyXG4jIFJlcHJlc2VudHMgYW4gRW1hY3Mtc3R5bGUgbWFyay5cclxuI1xyXG4jIEVhY2ggY3Vyc29yIG1heSBoYXZlIGEgTWFyay4gT24gY29uc3RydWN0aW9uLCB0aGUgbWFyayBpcyBhdCB0aGUgY3Vyc29yJ3NcclxuIyBwb3NpdGlvbi5cclxuI1xyXG4jIFRoZSBtYXJrIGNhbiB0aGVuIGJlIHNldCgpIGF0IGFueSB0aW1lLCB3aGljaCB3aWxsIG1vdmUgaXQgdG8gd2hlcmUgdGhlIGN1cnNvclxyXG4jIGlzLlxyXG4jXHJcbiMgSXQgY2FuIGFsc28gYmUgYWN0aXZhdGUoKWQgYW5kIGRlYWN0aXZhdGUoKWQuIFdoaWxlIGFjdGl2ZSwgdGhlIHJlZ2lvbiBiZXR3ZWVuXHJcbiMgdGhlIG1hcmsgYW5kIHRoZSBjdXJzb3IgaXMgc2VsZWN0ZWQsIGFuZCB0aGlzIHNlbGVjdGlvbiBpcyB1cGRhdGVkIGFzIHRoZVxyXG4jIGN1cnNvciBpcyBtb3ZlZC4gSWYgdGhlIGJ1ZmZlciBpcyBlZGl0ZWQsIHRoZSBtYXJrIGlzIGF1dG9tYXRpY2FsbHlcclxuIyBkZWFjdGl2YXRlZC5cclxuY2xhc3MgTWFya1xyXG4gIEBkZWFjdGl2YXRhYmxlID0gW11cclxuXHJcbiAgQGRlYWN0aXZhdGVQZW5kaW5nOiAtPlxyXG4gICAgZm9yIG1hcmsgaW4gQGRlYWN0aXZhdGFibGVcclxuICAgICAgbWFyay5kZWFjdGl2YXRlKClcclxuICAgIEBkZWFjdGl2YXRhYmxlLmxlbmd0aCA9IDBcclxuXHJcbiAgY29uc3RydWN0b3I6IChjdXJzb3IpIC0+XHJcbiAgICBAY3Vyc29yID0gY3Vyc29yXHJcbiAgICBAZWRpdG9yID0gY3Vyc29yLmVkaXRvclxyXG4gICAgQG1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxyXG4gICAgQGFjdGl2ZSA9IGZhbHNlXHJcbiAgICBAdXBkYXRpbmcgPSBmYWxzZVxyXG5cclxuICBkZXN0cm95OiAtPlxyXG4gICAgQGRlYWN0aXZhdGUoKSBpZiBAYWN0aXZlXHJcbiAgICBAbWFya2VyLmRlc3Ryb3koKVxyXG5cclxuICBzZXQ6IChwb2ludD1AY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpIC0+XHJcbiAgICBAZGVhY3RpdmF0ZSgpXHJcbiAgICBAbWFya2VyLnNldEhlYWRCdWZmZXJQb3NpdGlvbihwb2ludClcclxuICAgIEBfdXBkYXRlU2VsZWN0aW9uKClcclxuICAgIEBcclxuXHJcbiAgZ2V0QnVmZmVyUG9zaXRpb246IC0+XHJcbiAgICBAbWFya2VyLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXHJcblxyXG4gIGFjdGl2YXRlOiAtPlxyXG4gICAgaWYgbm90IEBhY3RpdmVcclxuICAgICAgQGFjdGl2ZVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxyXG4gICAgICBAYWN0aXZlU3Vic2NyaXB0aW9ucy5hZGQgQGN1cnNvci5vbkRpZENoYW5nZVBvc2l0aW9uIChldmVudCkgPT5cclxuICAgICAgICBAX3VwZGF0ZVNlbGVjdGlvbihldmVudClcclxuICAgICAgIyBDdXJzb3IgbW92ZW1lbnQgY29tbWFuZHMgbGlrZSBjdXJzb3IubW92ZURvd24gZGVhY3RpdmF0ZSB0aGUgc2VsZWN0aW9uXHJcbiAgICAgICMgdW5jb25kaXRpb25hbGx5LCBidXQgZG9uJ3QgdHJpZ2dlciBvbkRpZENoYW5nZVBvc2l0aW9uIGlmIHRoZSBwb3NpdGlvblxyXG4gICAgICAjIGRvZXNuJ3QgY2hhbmdlIChlLmcuIGF0IEVPRikuIFNvIHdlIGFsc28gdXBkYXRlIHRoZSBzZWxlY3Rpb24gYWZ0ZXIgYW55XHJcbiAgICAgICMgY29tbWFuZC5cclxuICAgICAgQGFjdGl2ZVN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaCAoZXZlbnQpID0+XHJcbiAgICAgICAgQF91cGRhdGVTZWxlY3Rpb24oZXZlbnQpXHJcbiAgICAgIEBhY3RpdmVTdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlIChldmVudCkgPT5cclxuICAgICAgICB1bmxlc3MgQF9pc0luZGVudChldmVudCkgb3IgQF9pc091dGRlbnQoZXZlbnQpXHJcbiAgICAgICAgICAjIElmIHdlJ3JlIGluIGEgY29tbWFuZCAoYXMgb3Bwb3NlZCB0byBhIHNpbXBsZSBjaGFyYWN0ZXIgaW5zZXJ0KSxcclxuICAgICAgICAgICMgZGVsYXkgdGhlIGRlYWN0aXZhdGlvbiB1bnRpbCB0aGUgZW5kIG9mIHRoZSBjb21tYW5kLiBPdGhlcndpc2VcclxuICAgICAgICAgICMgdXBkYXRpbmcgb25lIHNlbGVjdGlvbiBtYXkgcHJlbWF0dXJlbHkgZGVhY3RpdmF0ZSB0aGUgbWFyayBhbmQgY2xlYXJcclxuICAgICAgICAgICMgYSBzZWNvbmQgc2VsZWN0aW9uIGJlZm9yZSBpdCBoYXMgYSBjaGFuY2UgdG8gYmUgdXBkYXRlZC5cclxuICAgICAgICAgIGlmIFN0YXRlLmlzRHVyaW5nQ29tbWFuZFxyXG4gICAgICAgICAgICBNYXJrLmRlYWN0aXZhdGFibGUucHVzaCh0aGlzKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBAZGVhY3RpdmF0ZSgpXHJcbiAgICAgIEBhY3RpdmUgPSB0cnVlXHJcblxyXG4gIGRlYWN0aXZhdGU6IC0+XHJcbiAgICBpZiBAYWN0aXZlXHJcbiAgICAgIEBhY3RpdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxyXG4gICAgICBAYWN0aXZlID0gZmFsc2VcclxuICAgIHVubGVzcyBAY3Vyc29yLmVkaXRvci5pc0Rlc3Ryb3llZCgpXHJcbiAgICAgIEBjdXJzb3IuY2xlYXJTZWxlY3Rpb24oKVxyXG5cclxuICBpc0FjdGl2ZTogLT5cclxuICAgIEBhY3RpdmVcclxuXHJcbiAgZXhjaGFuZ2U6IC0+XHJcbiAgICBwb3NpdGlvbiA9IEBtYXJrZXIuZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcclxuICAgIEBzZXQoKS5hY3RpdmF0ZSgpXHJcbiAgICBAY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvc2l0aW9uKVxyXG5cclxuICBfdXBkYXRlU2VsZWN0aW9uOiAoZXZlbnQpIC0+XHJcbiAgICAjIFVwZGF0aW5nIHRoZSBzZWxlY3Rpb24gdXBkYXRlcyB0aGUgY3Vyc29yIG1hcmtlciwgc28gZ3VhcmQgYWdhaW5zdCB0aGVcclxuICAgICMgbmVzdGVkIGludm9jYXRpb24uXHJcbiAgICBpZiAhQHVwZGF0aW5nXHJcbiAgICAgIEB1cGRhdGluZyA9IHRydWVcclxuICAgICAgdHJ5XHJcbiAgICAgICAgaGVhZCA9IEBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxyXG4gICAgICAgIHRhaWwgPSBAbWFya2VyLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXHJcbiAgICAgICAgQHNldFNlbGVjdGlvblJhbmdlKGhlYWQsIHRhaWwpXHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAgICBAdXBkYXRpbmcgPSBmYWxzZVxyXG5cclxuICBnZXRTZWxlY3Rpb25SYW5nZTogLT5cclxuICAgIEBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcclxuXHJcbiAgc2V0U2VsZWN0aW9uUmFuZ2U6IChoZWFkLCB0YWlsKSAtPlxyXG4gICAgcmV2ZXJzZWQgPSBQb2ludC5taW4oaGVhZCwgdGFpbCkgaXMgaGVhZFxyXG4gICAgQGN1cnNvci5zZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW2hlYWQsIHRhaWxdLCByZXZlcnNlZDogcmV2ZXJzZWQpXHJcblxyXG4gIF9pc0luZGVudDogKGV2ZW50KS0+XHJcbiAgICBAX2lzSW5kZW50T3V0ZGVudChldmVudC5uZXdSYW5nZSwgZXZlbnQubmV3VGV4dClcclxuXHJcbiAgX2lzT3V0ZGVudDogKGV2ZW50KS0+XHJcbiAgICBAX2lzSW5kZW50T3V0ZGVudChldmVudC5vbGRSYW5nZSwgZXZlbnQub2xkVGV4dClcclxuXHJcbiAgX2lzSW5kZW50T3V0ZGVudDogKHJhbmdlLCB0ZXh0KS0+XHJcbiAgICB0YWJMZW5ndGggPSBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXHJcbiAgICBkaWZmID0gcmFuZ2UuZW5kLmNvbHVtbiAtIHJhbmdlLnN0YXJ0LmNvbHVtblxyXG4gICAgdHJ1ZSBpZiBkaWZmID09IEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkgYW5kIHJhbmdlLnN0YXJ0LnJvdyA9PSByYW5nZS5lbmQucm93IGFuZCBAX2NoZWNrVGV4dEZvclNwYWNlcyh0ZXh0LCB0YWJMZW5ndGgpXHJcblxyXG4gIF9jaGVja1RleHRGb3JTcGFjZXM6ICh0ZXh0LCB0YWJTaXplKS0+XHJcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHRleHQgYW5kIHRleHQubGVuZ3RoIGlzIHRhYlNpemVcclxuXHJcbiAgICBmb3IgY2ggaW4gdGV4dFxyXG4gICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGNoIGlzIFwiIFwiXHJcbiAgICB0cnVlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcmtcclxuIl19
