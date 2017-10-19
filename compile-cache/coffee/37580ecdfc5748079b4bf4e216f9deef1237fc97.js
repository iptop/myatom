(function() {
  var AtomDynamicMacro, CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = AtomDynamicMacro = {
    subscriptions: null,
    repeatedKeys: [],
    activate: function(state) {
      var handler;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-dynamic-macro:execute': (function(_this) {
          return function() {
            return _this.execute();
          };
        })(this)
      }));
      this.seq = [];
      handler = function(event) {
        var seq, tailIdentifier;
        seq = AtomDynamicMacro.seq;
        tailIdentifier = 0 < seq.length ? seq[seq.length - 1].keyIdentifier : "";
        if (tailIdentifier !== event.keyIdentifier || !AtomDynamicMacro.modifierKey(event)) {
          seq.push(event);
          if (seq.length > 100) {
            return seq.shift();
          }
        }
      };
      return document.addEventListener('keydown', handler, true);
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    serialize: function() {},
    findRep: function(a, compare) {
      var i, j, k, l, len, ref, ref1, res;
      compare = compare != null ? compare : function(x, y) {
        return x === y;
      };
      len = a.length;
      res = [];
      for (i = k = 0, ref = len / 2; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        for (j = l = 0, ref1 = i; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
          if (!compare(a[len - 2 - i - j], a[len - 1 - j])) {
            break;
          }
        }
        if (i === j - 1) {
          res = a.slice(len - j, +(len - 1) + 1 || 9e9);
        }
      }
      return res;
    },
    modifierKey: function(key) {
      var ref;
      return (ref = key.keyIdentifier) === 'Control' || ref === 'Alt' || ref === 'Shift' || ref === 'Meta';
    },
    specialKey: function(key) {
      var ref;
      return (ref = key.keyIdentifier) === 'Enter' || ref === 'Delete' || ref === 'Backspace' || ref === 'Tab' || ref === 'Escape' || ref === 'Up' || ref === 'Down' || ref === 'Left' || ref === 'Right' || ref === 'PageUp' || ref === 'PageDown' || ref === 'Home' || ref === 'End';
    },
    normalKey: function(key) {
      return !this.modifierKey(key) && !this.specialKey(key) && key.keyCode >= 32;
    },
    execute: function() {
      var editor, k, key, len1, ref, results;
      editor = atom.workspace.getActiveTextEditor();
      if (this.seq[this.seq.length - 2].keyIdentifier === "U+0054" && this.seq[this.seq.length - 2].ctrlKey) {

      } else {
        this.repeatedKeys = this.findRep(this.seq.slice(0, this.seq.length - 2), function(x, y) {
          return x && y && x.keyIdentifier === y.keyIdentifier;
        });
      }
      ref = this.repeatedKeys;
      results = [];
      for (k = 0, len1 = ref.length; k < len1; k++) {
        key = ref[k];
        if (this.normalKey(key)) {
          if (key.ctrlKey) {
            results.push(atom.keymaps.handleKeyboardEvent(key));
          } else {
            if (key.keyCode === 32) {
              results.push(editor.insertText(" "));
            } else {
              results.push(atom.keymaps.simulateTextInput(key));
            }
          }
        } else if (key.keyIdentifier === "Enter") {
          results.push(editor.insertText("\n"));
        } else {
          results.push(atom.keymaps.handleKeyboardEvent(key));
        }
      }
      return results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2F0b20tZHluYW1pYy1tYWNyby9saWIvYXRvbS1keW5hbWljLW1hY3JvLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUFpQixnQkFBQSxHQUNmO0lBQUEsYUFBQSxFQUFlLElBQWY7SUFDQSxZQUFBLEVBQWMsRUFEZDtJQUdBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLDRCQUFBLEVBQThCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtPQUFwQyxDQUFuQjtNQU9BLElBQUMsQ0FBQSxHQUFELEdBQU87TUFDUCxPQUFBLEdBQVUsU0FBQyxLQUFEO0FBQ1IsWUFBQTtRQUFBLEdBQUEsR0FBTSxnQkFBZ0IsQ0FBQztRQUN2QixjQUFBLEdBQW9CLENBQUEsR0FBSSxHQUFHLENBQUMsTUFBWCxHQUF1QixHQUFJLENBQUEsR0FBRyxDQUFDLE1BQUosR0FBVyxDQUFYLENBQWEsQ0FBQyxhQUF6QyxHQUE0RDtRQUM3RSxJQUFHLGNBQUEsS0FBa0IsS0FBSyxDQUFDLGFBQXhCLElBQXlDLENBQUMsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsS0FBN0IsQ0FBN0M7VUFDRSxHQUFHLENBQUMsSUFBSixDQUFTLEtBQVQ7VUFDQSxJQUFlLEdBQUcsQ0FBQyxNQUFKLEdBQWEsR0FBNUI7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TUFBQTtZQUdFLElBQUcsR0FBRyxDQUFDLE9BQUosS0FBZSxFQUFsQjsyQkFDRSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixHQURGO2FBQUEsTUFBQTsyQkFHRSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFiLENBQStCLEdBQS9CLEdBSEY7YUFIRjtXQURGO1NBQUEsTUFRSyxJQUFHLEdBQUcsQ0FBQyxhQUFKLEtBQXFCLE9BQXhCO3VCQUNILE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCLEdBREc7U0FBQSxNQUFBO3VCQUdILElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQWIsQ0FBaUMsR0FBakMsR0FIRzs7QUFUUDs7SUFQTyxDQTVEVDs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID0gQXRvbUR5bmFtaWNNYWNybyA9XG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgcmVwZWF0ZWRLZXlzOiBbXVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS1keW5hbWljLW1hY3JvOmV4ZWN1dGUnOiA9PiBAZXhlY3V0ZSgpXG5cbiAgICAjXG4gICAgIyBAYWN0aXZhdGUoKSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgbG9hZGluZyB0aGlzIHBhY2thZ2VcbiAgICAjIChieSByZW1vdmluZyBcImFjdGl2YXRpb25Db21tYW5kc1wiIHBhcnQgZnJvbSBwYWNrYWdlLmpzb24pXG4gICAgI1xuICAgICMgUmVjb3JkIGFsbCBrZXkgc3Ryb2tlcyBpbiBAc3BlY1xuICAgIEBzZXEgPSBbXVxuICAgIGhhbmRsZXIgPSAoZXZlbnQpIC0+XG4gICAgICBzZXEgPSBBdG9tRHluYW1pY01hY3JvLnNlcVxuICAgICAgdGFpbElkZW50aWZpZXIgPSBpZiAwIDwgc2VxLmxlbmd0aCB0aGVuIHNlcVtzZXEubGVuZ3RoLTFdLmtleUlkZW50aWZpZXIgZWxzZSBcIlwiXG4gICAgICBpZiB0YWlsSWRlbnRpZmllciAhPSBldmVudC5rZXlJZGVudGlmaWVyIHx8ICFBdG9tRHluYW1pY01hY3JvLm1vZGlmaWVyS2V5KGV2ZW50KVxuICAgICAgICBzZXEucHVzaChldmVudClcbiAgICAgICAgc2VxLnNoaWZ0KCkgaWYgc2VxLmxlbmd0aCA+IDEwMFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCBoYW5kbGVyLCB0cnVlXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBzZXJpYWxpemU6IC0+XG5cbiAgI1xuICAjIERldGVjdCByZXBlYXRlZCBlbGVtZW50cyBhdCB0aGUgZW5kIG9mIGFuIGFycmF5XG4gICNcbiAgIyBmaW5kUmVwIFsxLDIsM10gICAgICAgICAgICAgICAgICAgICAjID0+IFtdXG4gICMgZmluZFJlcCBbMSwyLDMsM10gICAgICAgICAgICAgICAgICAgIyA9PiBbM11cbiAgIyBmaW5kUmVwIFsxLDIsMywxLDIsM10gICAgICAgICAgICAgICAjID0+IFsxLDIsM11cbiAgIyBmaW5kUmVwIFsxLDIsMywzLDEsMiwzLDNdICAgICAgICAgICAjID0+IFsxLDIsMywzXVxuICAjIGZpbmRSZXAgWzEsMiwzXSwgKHgseSkgLT4geCsxID09IHkgICMgPT4gWzNdXG4gICNcbiAgZmluZFJlcDogKGEsY29tcGFyZSkgLT5cbiAgICBjb21wYXJlID0gY29tcGFyZSA/ICh4LHkpIC0+IHggPT0geVxuICAgIGxlbiA9IGEubGVuZ3RoXG4gICAgcmVzID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLmxlbi8yXVxuICAgICAgZm9yIGogaW4gWzAuLmldXG4gICAgICAgIGJyZWFrIHVubGVzcyBjb21wYXJlKGFbbGVuLTItaS1qXSwgYVtsZW4tMS1qXSlcbiAgICAgIHJlcyA9IGFbbGVuLWouLmxlbi0xXSBpZiBpID09IGotMVxuICAgIHJlc1xuXG4gIG1vZGlmaWVyS2V5OiAoa2V5KSAtPlxuICAgIGtleS5rZXlJZGVudGlmaWVyIGluIFtcbiAgICAgICdDb250cm9sJywgJ0FsdCcsICdTaGlmdCcsICdNZXRhJ1xuICAgIF1cblxuICBzcGVjaWFsS2V5OiAoa2V5KSAtPlxuICAgIGtleS5rZXlJZGVudGlmaWVyIGluIFtcbiAgICAgICdFbnRlcicsICdEZWxldGUnLCAnQmFja3NwYWNlJywgJ1RhYicsICdFc2NhcGUnXG4gICAgICAnVXAnLCAnRG93bicsICdMZWZ0JywgJ1JpZ2h0J1xuICAgICAgJ1BhZ2VVcCcsICdQYWdlRG93bicsICdIb21lJywgJ0VuZCdcbiAgICBdXG4gIFxuICBub3JtYWxLZXk6IChrZXkpIC0+XG4gICAgIUBtb2RpZmllcktleShrZXkpICYmICFAc3BlY2lhbEtleShrZXkpICYmIGtleS5rZXlDb2RlID49IDMyXG5cbiAgZXhlY3V0ZTogLT4gIyBEeW5hbWljIE1hY3JvIGV4ZWN1dGlvblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIEBzZXFbQHNlcS5sZW5ndGgtMl0ua2V5SWRlbnRpZmllciA9PSBcIlUrMDA1NFwiICYmXG4gICAgICBAc2VxW0BzZXEubGVuZ3RoLTJdLmN0cmxLZXkgIyB0eXBpbmcgQ3RybC10IHJlcGVhdGVkbHlcbiAgICBlbHNlICMgRmluZCBhIHJlcGVhdGVkIGtleXN0cm9rZXNcbiAgICAgIEByZXBlYXRlZEtleXMgPSBAZmluZFJlcCBAc2VxWzAuLi5Ac2VxLmxlbmd0aC0yXSwgKHgseSkgLT5cbiAgICAgICAgeCAmJiB5ICYmIHgua2V5SWRlbnRpZmllciA9PSB5LmtleUlkZW50aWZpZXJcbiAgICBmb3Iga2V5IGluIEByZXBlYXRlZEtleXMgIyBSZS1leGVjdXRlIHJlcGVhdGVkIGtleSBzdHJva2VzXG4gICAgICBpZiBAbm9ybWFsS2V5KGtleSlcbiAgICAgICAgaWYga2V5LmN0cmxLZXlcbiAgICAgICAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChrZXkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBrZXkua2V5Q29kZSA9PSAzMiAjIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHNwYWNlIGtleVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIgXCIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXRvbS5rZXltYXBzLnNpbXVsYXRlVGV4dElucHV0KGtleSlcbiAgICAgIGVsc2UgaWYga2V5LmtleUlkZW50aWZpZXIgPT0gXCJFbnRlclwiXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiXFxuXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGtleSlcbiJdfQ==
