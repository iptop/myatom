(function() {
  var CompositeDisposable, EmacsCursor, EmacsEditor, KillRing, Mark, State, afterCommand, beforeCommand, closeOtherPanes, findFile, getEditor;

  CompositeDisposable = require('atom').CompositeDisposable;

  EmacsCursor = require('./emacs-cursor');

  EmacsEditor = require('./emacs-editor');

  KillRing = require('./kill-ring');

  Mark = require('./mark');

  State = require('./state');

  beforeCommand = function(event) {
    return State.beforeCommand(event);
  };

  afterCommand = function(event) {
    var emacsCursor, emacsEditor, i, len, ref;
    Mark.deactivatePending();
    if (State.yankComplete()) {
      emacsEditor = getEditor(event);
      ref = emacsEditor.getEmacsCursors();
      for (i = 0, len = ref.length; i < len; i++) {
        emacsCursor = ref[i];
        emacsCursor.yankComplete();
      }
    }
    return State.afterCommand(event);
  };

  getEditor = function(event) {
    var editor, ref, ref1, ref2;
    editor = (ref = (ref1 = event.target) != null ? (ref2 = ref1.closest('atom-text-editor')) != null ? typeof ref2.getModel === "function" ? ref2.getModel() : void 0 : void 0 : void 0) != null ? ref : atom.workspace.getActiveTextEditor();
    return EmacsEditor["for"](editor);
  };

  findFile = function(event) {
    var haveAOF, useAOF;
    haveAOF = atom.packages.isPackageLoaded('advanced-open-file');
    useAOF = atom.config.get('atomic-emacs.useAdvancedOpenFile');
    if (haveAOF && useAOF) {
      return atom.commands.dispatch(event.target, 'advanced-open-file:toggle');
    } else {
      return atom.commands.dispatch(event.target, 'fuzzy-finder:toggle-file-finder');
    }
  };

  closeOtherPanes = function(event) {
    var activePane, container, i, len, pane, ref, results;
    container = atom.workspace.getPaneContainers().find((function(_this) {
      return function(c) {
        return c.getLocation() === 'center';
      };
    })(this));
    activePane = container != null ? container.getActivePane() : void 0;
    if (activePane == null) {
      return;
    }
    ref = container.getPanes();
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      pane = ref[i];
      if (pane !== activePane) {
        results.push(pane.close());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  module.exports = {
    EmacsCursor: EmacsCursor,
    EmacsEditor: EmacsEditor,
    KillRing: KillRing,
    Mark: Mark,
    State: State,
    config: {
      useAdvancedOpenFile: {
        type: 'boolean',
        "default": true,
        title: 'Use advanced-open-file for find-file if available'
      },
      alwaysUseKillRing: {
        type: 'boolean',
        "default": false,
        title: 'Use kill ring for built-in copy & cut commands'
      },
      killToClipboard: {
        type: 'boolean',
        "default": true,
        title: 'Send kills to the system clipboard'
      },
      yankFromClipboard: {
        type: 'boolean',
        "default": false,
        title: 'Yank changed text from the system clipboard'
      },
      killWholeLine: {
        type: 'boolean',
        "default": false,
        title: 'Always Kill whole line.'
      }
    },
    activate: function() {
      var ref, ref1;
      if (this.disposable) {
        console.log("atomic-emacs activated twice -- aborting");
        return;
      }
      State.initialize();
      if ((ref = document.getElementsByTagName('atom-workspace')[0]) != null) {
        if ((ref1 = ref.classList) != null) {
          ref1.add('atomic-emacs');
        }
      }
      this.disposable = new CompositeDisposable;
      this.disposable.add(atom.commands.onWillDispatch(function(event) {
        return beforeCommand(event);
      }));
      this.disposable.add(atom.commands.onDidDispatch(function(event) {
        return afterCommand(event);
      }));
      this.disposable.add(atom.commands.add('atom-text-editor', {
        "atomic-emacs:backward-char": function(event) {
          return getEditor(event).backwardChar();
        },
        "atomic-emacs:forward-char": function(event) {
          return getEditor(event).forwardChar();
        },
        "atomic-emacs:backward-word": function(event) {
          return getEditor(event).backwardWord();
        },
        "atomic-emacs:forward-word": function(event) {
          return getEditor(event).forwardWord();
        },
        "atomic-emacs:backward-sexp": function(event) {
          return getEditor(event).backwardSexp();
        },
        "atomic-emacs:forward-sexp": function(event) {
          return getEditor(event).forwardSexp();
        },
        "atomic-emacs:backward-list": function(event) {
          return getEditor(event).backwardList();
        },
        "atomic-emacs:forward-list": function(event) {
          return getEditor(event).forwardList();
        },
        "atomic-emacs:previous-line": function(event) {
          return getEditor(event).previousLine();
        },
        "atomic-emacs:next-line": function(event) {
          return getEditor(event).nextLine();
        },
        "atomic-emacs:backward-paragraph": function(event) {
          return getEditor(event).backwardParagraph();
        },
        "atomic-emacs:forward-paragraph": function(event) {
          return getEditor(event).forwardParagraph();
        },
        "atomic-emacs:back-to-indentation": function(event) {
          return getEditor(event).backToIndentation();
        },
        "atomic-emacs:backward-kill-word": function(event) {
          return getEditor(event).backwardKillWord();
        },
        "atomic-emacs:kill-word": function(event) {
          return getEditor(event).killWord();
        },
        "atomic-emacs:kill-line": function(event) {
          return getEditor(event).killLine();
        },
        "atomic-emacs:kill-region": function(event) {
          return getEditor(event).killRegion();
        },
        "atomic-emacs:copy-region-as-kill": function(event) {
          return getEditor(event).copyRegionAsKill();
        },
        "atomic-emacs:append-next-kill": function(event) {
          return State.killed();
        },
        "atomic-emacs:yank": function(event) {
          return getEditor(event).yank();
        },
        "atomic-emacs:yank-pop": function(event) {
          return getEditor(event).yankPop();
        },
        "atomic-emacs:yank-shift": function(event) {
          return getEditor(event).yankShift();
        },
        "atomic-emacs:cut": function(event) {
          if (atom.config.get('atomic-emacs.alwaysUseKillRing')) {
            return getEditor(event).killRegion();
          } else {
            return event.abortKeyBinding();
          }
        },
        "atomic-emacs:copy": function(event) {
          if (atom.config.get('atomic-emacs.alwaysUseKillRing')) {
            return getEditor(event).copyRegionAsKill();
          } else {
            return event.abortKeyBinding();
          }
        },
        "atomic-emacs:delete-horizontal-space": function(event) {
          return getEditor(event).deleteHorizontalSpace();
        },
        "atomic-emacs:delete-indentation": function(event) {
          return getEditor(event).deleteIndentation();
        },
        "atomic-emacs:open-line": function(event) {
          return getEditor(event).openLine();
        },
        "atomic-emacs:just-one-space": function(event) {
          return getEditor(event).justOneSpace();
        },
        "atomic-emacs:delete-blank-lines": function(event) {
          return getEditor(event).deleteBlankLines();
        },
        "atomic-emacs:transpose-chars": function(event) {
          return getEditor(event).transposeChars();
        },
        "atomic-emacs:transpose-lines": function(event) {
          return getEditor(event).transposeLines();
        },
        "atomic-emacs:transpose-sexps": function(event) {
          return getEditor(event).transposeSexps();
        },
        "atomic-emacs:transpose-words": function(event) {
          return getEditor(event).transposeWords();
        },
        "atomic-emacs:downcase-word-or-region": function(event) {
          return getEditor(event).downcaseWordOrRegion();
        },
        "atomic-emacs:upcase-word-or-region": function(event) {
          return getEditor(event).upcaseWordOrRegion();
        },
        "atomic-emacs:capitalize-word-or-region": function(event) {
          return getEditor(event).capitalizeWordOrRegion();
        },
        "atomic-emacs:set-mark": function(event) {
          return getEditor(event).setMark();
        },
        "atomic-emacs:mark-sexp": function(event) {
          return getEditor(event).markSexp();
        },
        "atomic-emacs:mark-whole-buffer": function(event) {
          return getEditor(event).markWholeBuffer();
        },
        "atomic-emacs:exchange-point-and-mark": function(event) {
          return getEditor(event).exchangePointAndMark();
        },
        "atomic-emacs:recenter-top-bottom": function(event) {
          return getEditor(event).recenterTopBottom();
        },
        "atomic-emacs:scroll-down": function(event) {
          return getEditor(event).scrollDown();
        },
        "atomic-emacs:scroll-up": function(event) {
          return getEditor(event).scrollUp();
        },
        "core:cancel": function(event) {
          return getEditor(event).keyboardQuit();
        }
      }));
      return this.disposable.add(atom.commands.add('atom-workspace', {
        "atomic-emacs:find-file": function(event) {
          return findFile(event);
        },
        "atomic-emacs:close-other-panes": function(event) {
          return closeOtherPanes(event);
        }
      }));
    },
    deactivate: function() {
      var ref, ref1, ref2;
      if ((ref = document.getElementsByTagName('atom-workspace')[0]) != null) {
        if ((ref1 = ref.classList) != null) {
          ref1.remove('atomic-emacs');
        }
      }
      if ((ref2 = this.disposable) != null) {
        ref2.dispose();
      }
      this.disposable = null;
      return KillRing.global.reset();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9taWMtZW1hY3MvbGliL2F0b21pYy1lbWFjcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUVSLGFBQUEsR0FBZ0IsU0FBQyxLQUFEO1dBQ2QsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEI7RUFEYzs7RUFHaEIsWUFBQSxHQUFlLFNBQUMsS0FBRDtBQUNiLFFBQUE7SUFBQSxJQUFJLENBQUMsaUJBQUwsQ0FBQTtJQUVBLElBQUcsS0FBSyxDQUFDLFlBQU4sQ0FBQSxDQUFIO01BQ0UsV0FBQSxHQUFjLFNBQUEsQ0FBVSxLQUFWO0FBQ2Q7QUFBQSxXQUFBLHFDQUFBOztRQUNFLFdBQVcsQ0FBQyxZQUFaLENBQUE7QUFERixPQUZGOztXQUtBLEtBQUssQ0FBQyxZQUFOLENBQW1CLEtBQW5CO0VBUmE7O0VBVWYsU0FBQSxHQUFZLFNBQUMsS0FBRDtBQUVWLFFBQUE7SUFBQSxNQUFBLGdNQUFrRSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7V0FDbEUsV0FBVyxFQUFDLEdBQUQsRUFBWCxDQUFnQixNQUFoQjtFQUhVOztFQUtaLFFBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxRQUFBO0lBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixvQkFBOUI7SUFDVixNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdC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UUFBWCxDQTFEMUI7UUE2REEsYUFBQSxFQUFlLFNBQUMsS0FBRDtpQkFBVyxTQUFBLENBQVUsS0FBVixDQUFnQixDQUFDLFlBQWpCLENBQUE7UUFBWCxDQTdEZjtPQUZjLENBQWhCO2FBaUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2Q7UUFBQSx3QkFBQSxFQUEwQixTQUFDLEtBQUQ7aUJBQVcsUUFBQSxDQUFTLEtBQVQ7UUFBWCxDQUExQjtRQUNBLGdDQUFBLEVBQWtDLFNBQUMsS0FBRDtpQkFBVyxlQUFBLENBQWdCLEtBQWhCO1FBQVgsQ0FEbEM7T0FEYyxDQUFoQjtJQTNFUSxDQTVCVjtJQTJHQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7OztjQUE2RCxDQUFFLE1BQS9ELENBQXNFLGNBQXRFOzs7O1lBQ1csQ0FBRSxPQUFiLENBQUE7O01BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYzthQUNkLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBaEIsQ0FBQTtJQUpVLENBM0daOztBQTFDRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXHJcbkVtYWNzQ3Vyc29yID0gcmVxdWlyZSAnLi9lbWFjcy1jdXJzb3InXHJcbkVtYWNzRWRpdG9yID0gcmVxdWlyZSAnLi9lbWFjcy1lZGl0b3InXHJcbktpbGxSaW5nID0gcmVxdWlyZSAnLi9raWxsLXJpbmcnXHJcbk1hcmsgPSByZXF1aXJlICcuL21hcmsnXHJcblN0YXRlID0gcmVxdWlyZSAnLi9zdGF0ZSdcclxuXHJcbmJlZm9yZUNvbW1hbmQgPSAoZXZlbnQpIC0+XHJcbiAgU3RhdGUuYmVmb3JlQ29tbWFuZChldmVudClcclxuXHJcbmFmdGVyQ29tbWFuZCA9IChldmVudCkgLT5cclxuICBNYXJrLmRlYWN0aXZhdGVQZW5kaW5nKClcclxuXHJcbiAgaWYgU3RhdGUueWFua0NvbXBsZXRlKClcclxuICAgIGVtYWNzRWRpdG9yID0gZ2V0RWRpdG9yKGV2ZW50KVxyXG4gICAgZm9yIGVtYWNzQ3Vyc29yIGluIGVtYWNzRWRpdG9yLmdldEVtYWNzQ3Vyc29ycygpXHJcbiAgICAgIGVtYWNzQ3Vyc29yLnlhbmtDb21wbGV0ZSgpXHJcblxyXG4gIFN0YXRlLmFmdGVyQ29tbWFuZChldmVudClcclxuXHJcbmdldEVkaXRvciA9IChldmVudCkgLT5cclxuICAjIEdldCBlZGl0b3IgZnJvbSB0aGUgZXZlbnQgaWYgcG9zc2libGUgc28gd2UgY2FuIHRhcmdldCBtaW5pLWVkaXRvcnMuXHJcbiAgZWRpdG9yID0gZXZlbnQudGFyZ2V0Py5jbG9zZXN0KCdhdG9tLXRleHQtZWRpdG9yJyk/LmdldE1vZGVsPygpID8gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcbiAgRW1hY3NFZGl0b3IuZm9yKGVkaXRvcilcclxuXHJcbmZpbmRGaWxlID0gKGV2ZW50KSAtPlxyXG4gIGhhdmVBT0YgPSBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCgnYWR2YW5jZWQtb3Blbi1maWxlJylcclxuICB1c2VBT0YgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b21pYy1lbWFjcy51c2VBZHZhbmNlZE9wZW5GaWxlJylcclxuICBpZiBoYXZlQU9GIGFuZCB1c2VBT0ZcclxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZXZlbnQudGFyZ2V0LCAnYWR2YW5jZWQtb3Blbi1maWxlOnRvZ2dsZScpXHJcbiAgZWxzZVxyXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChldmVudC50YXJnZXQsICdmdXp6eS1maW5kZXI6dG9nZ2xlLWZpbGUtZmluZGVyJylcclxuXHJcbmNsb3NlT3RoZXJQYW5lcyA9IChldmVudCkgLT5cclxuICBjb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lQ29udGFpbmVycygpLmZpbmQoKGMpID0+IGMuZ2V0TG9jYXRpb24oKSA9PSAnY2VudGVyJylcclxuICBhY3RpdmVQYW5lID0gY29udGFpbmVyPy5nZXRBY3RpdmVQYW5lKClcclxuICByZXR1cm4gaWYgbm90IGFjdGl2ZVBhbmU/XHJcbiAgZm9yIHBhbmUgaW4gY29udGFpbmVyLmdldFBhbmVzKClcclxuICAgIHVubGVzcyBwYW5lIGlzIGFjdGl2ZVBhbmVcclxuICAgICAgcGFuZS5jbG9zZSgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgRW1hY3NDdXJzb3I6IEVtYWNzQ3Vyc29yXHJcbiAgRW1hY3NFZGl0b3I6IEVtYWNzRWRpdG9yXHJcbiAgS2lsbFJpbmc6IEtpbGxSaW5nXHJcbiAgTWFyazogTWFya1xyXG4gIFN0YXRlOiBTdGF0ZVxyXG5cclxuICBjb25maWc6XHJcbiAgICB1c2VBZHZhbmNlZE9wZW5GaWxlOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgIHRpdGxlOiAnVXNlIGFkdmFuY2VkLW9wZW4tZmlsZSBmb3IgZmluZC1maWxlIGlmIGF2YWlsYWJsZSdcclxuICAgIGFsd2F5c1VzZUtpbGxSaW5nOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICB0aXRsZTogJ1VzZSBraWxsIHJpbmcgZm9yIGJ1aWx0LWluIGNvcHkgJiBjdXQgY29tbWFuZHMnXHJcbiAgICBraWxsVG9DbGlwYm9hcmQ6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgdGl0bGU6ICdTZW5kIGtpbGxzIHRvIHRoZSBzeXN0ZW0gY2xpcGJvYXJkJ1xyXG4gICAgeWFua0Zyb21DbGlwYm9hcmQ6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgIHRpdGxlOiAnWWFuayBjaGFuZ2VkIHRleHQgZnJvbSB0aGUgc3lzdGVtIGNsaXBib2FyZCdcclxuICAgIGtpbGxXaG9sZUxpbmU6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgIHRpdGxlOiAnQWx3YXlzIEtpbGwgd2hvbGUgbGluZS4nXHJcblxyXG4gIGFjdGl2YXRlOiAtPlxyXG4gICAgaWYgQGRpc3Bvc2FibGVcclxuICAgICAgY29uc29sZS5sb2cgXCJhdG9taWMtZW1hY3MgYWN0aXZhdGVkIHR3aWNlIC0tIGFib3J0aW5nXCJcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgU3RhdGUuaW5pdGlhbGl6ZSgpXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXRvbS13b3Jrc3BhY2UnKVswXT8uY2xhc3NMaXN0Py5hZGQoJ2F0b21pYy1lbWFjcycpXHJcbiAgICBAZGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXHJcbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5jb21tYW5kcy5vbldpbGxEaXNwYXRjaCAoZXZlbnQpIC0+IGJlZm9yZUNvbW1hbmQoZXZlbnQpXHJcbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoIChldmVudCkgLT4gYWZ0ZXJDb21tYW5kKGV2ZW50KVxyXG4gICAgQGRpc3Bvc2FibGUuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcclxuICAgICAgIyBOYXZpZ2F0aW9uXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmJhY2t3YXJkLWNoYXJcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkQ2hhcigpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmZvcndhcmQtY2hhclwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuZm9yd2FyZENoYXIoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpiYWNrd2FyZC13b3JkXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5iYWNrd2FyZFdvcmQoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpmb3J3YXJkLXdvcmRcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmZvcndhcmRXb3JkKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6YmFja3dhcmQtc2V4cFwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuYmFja3dhcmRTZXhwKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6Zm9yd2FyZC1zZXhwXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5mb3J3YXJkU2V4cCgpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmJhY2t3YXJkLWxpc3RcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkTGlzdCgpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmZvcndhcmQtbGlzdFwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuZm9yd2FyZExpc3QoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpwcmV2aW91cy1saW5lXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5wcmV2aW91c0xpbmUoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpuZXh0LWxpbmVcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLm5leHRMaW5lKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6YmFja3dhcmQtcGFyYWdyYXBoXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5iYWNrd2FyZFBhcmFncmFwaCgpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmZvcndhcmQtcGFyYWdyYXBoXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5mb3J3YXJkUGFyYWdyYXBoKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6YmFjay10by1pbmRlbnRhdGlvblwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuYmFja1RvSW5kZW50YXRpb24oKVxyXG5cclxuICAgICAgIyBLaWxsaW5nICYgWWFua2luZ1xyXG4gICAgICBcImF0b21pYy1lbWFjczpiYWNrd2FyZC1raWxsLXdvcmRcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkS2lsbFdvcmQoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpraWxsLXdvcmRcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmtpbGxXb3JkKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6a2lsbC1saW5lXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5raWxsTGluZSgpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmtpbGwtcmVnaW9uXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5raWxsUmVnaW9uKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6Y29weS1yZWdpb24tYXMta2lsbFwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuY29weVJlZ2lvbkFzS2lsbCgpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmFwcGVuZC1uZXh0LWtpbGxcIjogKGV2ZW50KSAtPiBTdGF0ZS5raWxsZWQoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczp5YW5rXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS55YW5rKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6eWFuay1wb3BcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnlhbmtQb3AoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczp5YW5rLXNoaWZ0XCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS55YW5rU2hpZnQoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpjdXRcIjogKGV2ZW50KSAtPlxyXG4gICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXRvbWljLWVtYWNzLmFsd2F5c1VzZUtpbGxSaW5nJylcclxuICAgICAgICAgIGdldEVkaXRvcihldmVudCkua2lsbFJlZ2lvbigpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgZXZlbnQuYWJvcnRLZXlCaW5kaW5nKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6Y29weVwiOiAoZXZlbnQpIC0+XHJcbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9taWMtZW1hY3MuYWx3YXlzVXNlS2lsbFJpbmcnKVxyXG4gICAgICAgICAgZ2V0RWRpdG9yKGV2ZW50KS5jb3B5UmVnaW9uQXNLaWxsKClcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBldmVudC5hYm9ydEtleUJpbmRpbmcoKVxyXG5cclxuICAgICAgIyBFZGl0aW5nXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmRlbGV0ZS1ob3Jpem9udGFsLXNwYWNlXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5kZWxldGVIb3Jpem9udGFsU3BhY2UoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpkZWxldGUtaW5kZW50YXRpb25cIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmRlbGV0ZUluZGVudGF0aW9uKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6b3Blbi1saW5lXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5vcGVuTGluZSgpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmp1c3Qtb25lLXNwYWNlXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5qdXN0T25lU3BhY2UoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpkZWxldGUtYmxhbmstbGluZXNcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmRlbGV0ZUJsYW5rTGluZXMoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczp0cmFuc3Bvc2UtY2hhcnNcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnRyYW5zcG9zZUNoYXJzKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6dHJhbnNwb3NlLWxpbmVzXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS50cmFuc3Bvc2VMaW5lcygpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOnRyYW5zcG9zZS1zZXhwc1wiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkudHJhbnNwb3NlU2V4cHMoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczp0cmFuc3Bvc2Utd29yZHNcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnRyYW5zcG9zZVdvcmRzKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6ZG93bmNhc2Utd29yZC1vci1yZWdpb25cIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmRvd25jYXNlV29yZE9yUmVnaW9uKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6dXBjYXNlLXdvcmQtb3ItcmVnaW9uXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS51cGNhc2VXb3JkT3JSZWdpb24oKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpjYXBpdGFsaXplLXdvcmQtb3ItcmVnaW9uXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5jYXBpdGFsaXplV29yZE9yUmVnaW9uKClcclxuXHJcbiAgICAgICMgTWFya2luZyAmIFNlbGVjdGluZ1xyXG4gICAgICBcImF0b21pYy1lbWFjczpzZXQtbWFya1wiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuc2V0TWFyaygpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOm1hcmstc2V4cFwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkubWFya1NleHAoKVxyXG4gICAgICBcImF0b21pYy1lbWFjczptYXJrLXdob2xlLWJ1ZmZlclwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkubWFya1dob2xlQnVmZmVyKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6ZXhjaGFuZ2UtcG9pbnQtYW5kLW1hcmtcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmV4Y2hhbmdlUG9pbnRBbmRNYXJrKClcclxuXHJcbiAgICAgICMgU2Nyb2xsaW5nXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOnJlY2VudGVyLXRvcC1ib3R0b21cIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnJlY2VudGVyVG9wQm90dG9tKClcclxuICAgICAgXCJhdG9taWMtZW1hY3M6c2Nyb2xsLWRvd25cIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnNjcm9sbERvd24oKVxyXG4gICAgICBcImF0b21pYy1lbWFjczpzY3JvbGwtdXBcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnNjcm9sbFVwKClcclxuXHJcbiAgICAgICMgVUlcclxuICAgICAgXCJjb3JlOmNhbmNlbFwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkua2V5Ym9hcmRRdWl0KClcclxuXHJcbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcclxuICAgICAgXCJhdG9taWMtZW1hY3M6ZmluZC1maWxlXCI6IChldmVudCkgLT4gZmluZEZpbGUoZXZlbnQpXHJcbiAgICAgIFwiYXRvbWljLWVtYWNzOmNsb3NlLW90aGVyLXBhbmVzXCI6IChldmVudCkgLT4gY2xvc2VPdGhlclBhbmVzKGV2ZW50KVxyXG5cclxuICBkZWFjdGl2YXRlOiAtPlxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2F0b20td29ya3NwYWNlJylbMF0/LmNsYXNzTGlzdD8ucmVtb3ZlKCdhdG9taWMtZW1hY3MnKVxyXG4gICAgQGRpc3Bvc2FibGU/LmRpc3Bvc2UoKVxyXG4gICAgQGRpc3Bvc2FibGUgPSBudWxsXHJcbiAgICBLaWxsUmluZy5nbG9iYWwucmVzZXQoKVxyXG4iXX0=
