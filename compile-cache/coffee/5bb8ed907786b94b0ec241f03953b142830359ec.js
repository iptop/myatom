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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2F0b21pYy1lbWFjcy9saWIvYXRvbWljLWVtYWNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBRVIsYUFBQSxHQUFnQixTQUFDLEtBQUQ7V0FDZCxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQjtFQURjOztFQUdoQixZQUFBLEdBQWUsU0FBQyxLQUFEO0FBQ2IsUUFBQTtJQUFBLElBQUksQ0FBQyxpQkFBTCxDQUFBO0lBRUEsSUFBRyxLQUFLLENBQUMsWUFBTixDQUFBLENBQUg7TUFDRSxXQUFBLEdBQWMsU0FBQSxDQUFVLEtBQVY7QUFDZDtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsV0FBVyxDQUFDLFlBQVosQ0FBQTtBQURGLE9BRkY7O1dBS0EsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsS0FBbkI7RUFSYTs7RUFVZixTQUFBLEdBQVksU0FBQyxLQUFEO0FBRVYsUUFBQTtJQUFBLE1BQUEsZ01BQWtFLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtXQUNsRSxXQUFXLEVBQUMsR0FBRCxFQUFYLENBQWdCLE1BQWhCO0VBSFU7O0VBS1osUUFBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLG9CQUE5QjtJQUNWLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdB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akIsQ0FBQTtRQUFYLENBMUQxQjtRQTZEQSxhQUFBLEVBQWUsU0FBQyxLQUFEO2lCQUFXLFNBQUEsQ0FBVSxLQUFWLENBQWdCLENBQUMsWUFBakIsQ0FBQTtRQUFYLENBN0RmO09BRmMsQ0FBaEI7YUFpRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDZDtRQUFBLHdCQUFBLEVBQTBCLFNBQUMsS0FBRDtpQkFBVyxRQUFBLENBQVMsS0FBVDtRQUFYLENBQTFCO1FBQ0EsZ0NBQUEsRUFBa0MsU0FBQyxLQUFEO2lCQUFXLGVBQUEsQ0FBZ0IsS0FBaEI7UUFBWCxDQURsQztPQURjLENBQWhCO0lBM0VRLENBNUJWO0lBMkdBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7O2NBQTZELENBQUUsTUFBL0QsQ0FBc0UsY0FBdEU7Ozs7WUFDVyxDQUFFLE9BQWIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjO2FBQ2QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFoQixDQUFBO0lBSlUsQ0EzR1o7O0FBMUNGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkVtYWNzQ3Vyc29yID0gcmVxdWlyZSAnLi9lbWFjcy1jdXJzb3InXG5FbWFjc0VkaXRvciA9IHJlcXVpcmUgJy4vZW1hY3MtZWRpdG9yJ1xuS2lsbFJpbmcgPSByZXF1aXJlICcuL2tpbGwtcmluZydcbk1hcmsgPSByZXF1aXJlICcuL21hcmsnXG5TdGF0ZSA9IHJlcXVpcmUgJy4vc3RhdGUnXG5cbmJlZm9yZUNvbW1hbmQgPSAoZXZlbnQpIC0+XG4gIFN0YXRlLmJlZm9yZUNvbW1hbmQoZXZlbnQpXG5cbmFmdGVyQ29tbWFuZCA9IChldmVudCkgLT5cbiAgTWFyay5kZWFjdGl2YXRlUGVuZGluZygpXG5cbiAgaWYgU3RhdGUueWFua0NvbXBsZXRlKClcbiAgICBlbWFjc0VkaXRvciA9IGdldEVkaXRvcihldmVudClcbiAgICBmb3IgZW1hY3NDdXJzb3IgaW4gZW1hY3NFZGl0b3IuZ2V0RW1hY3NDdXJzb3JzKClcbiAgICAgIGVtYWNzQ3Vyc29yLnlhbmtDb21wbGV0ZSgpXG5cbiAgU3RhdGUuYWZ0ZXJDb21tYW5kKGV2ZW50KVxuXG5nZXRFZGl0b3IgPSAoZXZlbnQpIC0+XG4gICMgR2V0IGVkaXRvciBmcm9tIHRoZSBldmVudCBpZiBwb3NzaWJsZSBzbyB3ZSBjYW4gdGFyZ2V0IG1pbmktZWRpdG9ycy5cbiAgZWRpdG9yID0gZXZlbnQudGFyZ2V0Py5jbG9zZXN0KCdhdG9tLXRleHQtZWRpdG9yJyk/LmdldE1vZGVsPygpID8gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gIEVtYWNzRWRpdG9yLmZvcihlZGl0b3IpXG5cbmZpbmRGaWxlID0gKGV2ZW50KSAtPlxuICBoYXZlQU9GID0gYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQoJ2FkdmFuY2VkLW9wZW4tZmlsZScpXG4gIHVzZUFPRiA9IGF0b20uY29uZmlnLmdldCgnYXRvbWljLWVtYWNzLnVzZUFkdmFuY2VkT3BlbkZpbGUnKVxuICBpZiBoYXZlQU9GIGFuZCB1c2VBT0ZcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGV2ZW50LnRhcmdldCwgJ2FkdmFuY2VkLW9wZW4tZmlsZTp0b2dnbGUnKVxuICBlbHNlXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChldmVudC50YXJnZXQsICdmdXp6eS1maW5kZXI6dG9nZ2xlLWZpbGUtZmluZGVyJylcblxuY2xvc2VPdGhlclBhbmVzID0gKGV2ZW50KSAtPlxuICBjb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lQ29udGFpbmVycygpLmZpbmQoKGMpID0+IGMuZ2V0TG9jYXRpb24oKSA9PSAnY2VudGVyJylcbiAgYWN0aXZlUGFuZSA9IGNvbnRhaW5lcj8uZ2V0QWN0aXZlUGFuZSgpXG4gIHJldHVybiBpZiBub3QgYWN0aXZlUGFuZT9cbiAgZm9yIHBhbmUgaW4gY29udGFpbmVyLmdldFBhbmVzKClcbiAgICB1bmxlc3MgcGFuZSBpcyBhY3RpdmVQYW5lXG4gICAgICBwYW5lLmNsb3NlKClcblxubW9kdWxlLmV4cG9ydHMgPVxuICBFbWFjc0N1cnNvcjogRW1hY3NDdXJzb3JcbiAgRW1hY3NFZGl0b3I6IEVtYWNzRWRpdG9yXG4gIEtpbGxSaW5nOiBLaWxsUmluZ1xuICBNYXJrOiBNYXJrXG4gIFN0YXRlOiBTdGF0ZVxuXG4gIGNvbmZpZzpcbiAgICB1c2VBZHZhbmNlZE9wZW5GaWxlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIHRpdGxlOiAnVXNlIGFkdmFuY2VkLW9wZW4tZmlsZSBmb3IgZmluZC1maWxlIGlmIGF2YWlsYWJsZSdcbiAgICBhbHdheXNVc2VLaWxsUmluZzpcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdGl0bGU6ICdVc2Uga2lsbCByaW5nIGZvciBidWlsdC1pbiBjb3B5ICYgY3V0IGNvbW1hbmRzJ1xuICAgIGtpbGxUb0NsaXBib2FyZDpcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICB0aXRsZTogJ1NlbmQga2lsbHMgdG8gdGhlIHN5c3RlbSBjbGlwYm9hcmQnXG4gICAgeWFua0Zyb21DbGlwYm9hcmQ6XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHRpdGxlOiAnWWFuayBjaGFuZ2VkIHRleHQgZnJvbSB0aGUgc3lzdGVtIGNsaXBib2FyZCdcbiAgICBraWxsV2hvbGVMaW5lOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0aXRsZTogJ0Fsd2F5cyBLaWxsIHdob2xlIGxpbmUuJ1xuXG4gIGFjdGl2YXRlOiAtPlxuICAgIGlmIEBkaXNwb3NhYmxlXG4gICAgICBjb25zb2xlLmxvZyBcImF0b21pYy1lbWFjcyBhY3RpdmF0ZWQgdHdpY2UgLS0gYWJvcnRpbmdcIlxuICAgICAgcmV0dXJuXG5cbiAgICBTdGF0ZS5pbml0aWFsaXplKClcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXRvbS13b3Jrc3BhY2UnKVswXT8uY2xhc3NMaXN0Py5hZGQoJ2F0b21pYy1lbWFjcycpXG4gICAgQGRpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlLmFkZCBhdG9tLmNvbW1hbmRzLm9uV2lsbERpc3BhdGNoIChldmVudCkgLT4gYmVmb3JlQ29tbWFuZChldmVudClcbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoIChldmVudCkgLT4gYWZ0ZXJDb21tYW5kKGV2ZW50KVxuICAgIEBkaXNwb3NhYmxlLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAjIE5hdmlnYXRpb25cbiAgICAgIFwiYXRvbWljLWVtYWNzOmJhY2t3YXJkLWNoYXJcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkQ2hhcigpXG4gICAgICBcImF0b21pYy1lbWFjczpmb3J3YXJkLWNoYXJcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmZvcndhcmRDaGFyKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmJhY2t3YXJkLXdvcmRcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkV29yZCgpXG4gICAgICBcImF0b21pYy1lbWFjczpmb3J3YXJkLXdvcmRcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmZvcndhcmRXb3JkKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmJhY2t3YXJkLXNleHBcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkU2V4cCgpXG4gICAgICBcImF0b21pYy1lbWFjczpmb3J3YXJkLXNleHBcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmZvcndhcmRTZXhwKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmJhY2t3YXJkLWxpc3RcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkTGlzdCgpXG4gICAgICBcImF0b21pYy1lbWFjczpmb3J3YXJkLWxpc3RcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmZvcndhcmRMaXN0KClcbiAgICAgIFwiYXRvbWljLWVtYWNzOnByZXZpb3VzLWxpbmVcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnByZXZpb3VzTGluZSgpXG4gICAgICBcImF0b21pYy1lbWFjczpuZXh0LWxpbmVcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLm5leHRMaW5lKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmJhY2t3YXJkLXBhcmFncmFwaFwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuYmFja3dhcmRQYXJhZ3JhcGgoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6Zm9yd2FyZC1wYXJhZ3JhcGhcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmZvcndhcmRQYXJhZ3JhcGgoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6YmFjay10by1pbmRlbnRhdGlvblwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuYmFja1RvSW5kZW50YXRpb24oKVxuXG4gICAgICAjIEtpbGxpbmcgJiBZYW5raW5nXG4gICAgICBcImF0b21pYy1lbWFjczpiYWNrd2FyZC1raWxsLXdvcmRcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmJhY2t3YXJkS2lsbFdvcmQoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6a2lsbC13b3JkXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5raWxsV29yZCgpXG4gICAgICBcImF0b21pYy1lbWFjczpraWxsLWxpbmVcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmtpbGxMaW5lKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmtpbGwtcmVnaW9uXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5raWxsUmVnaW9uKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmNvcHktcmVnaW9uLWFzLWtpbGxcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmNvcHlSZWdpb25Bc0tpbGwoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6YXBwZW5kLW5leHQta2lsbFwiOiAoZXZlbnQpIC0+IFN0YXRlLmtpbGxlZCgpXG4gICAgICBcImF0b21pYy1lbWFjczp5YW5rXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS55YW5rKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOnlhbmstcG9wXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS55YW5rUG9wKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOnlhbmstc2hpZnRcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnlhbmtTaGlmdCgpXG4gICAgICBcImF0b21pYy1lbWFjczpjdXRcIjogKGV2ZW50KSAtPlxuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b21pYy1lbWFjcy5hbHdheXNVc2VLaWxsUmluZycpXG4gICAgICAgICAgZ2V0RWRpdG9yKGV2ZW50KS5raWxsUmVnaW9uKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGV2ZW50LmFib3J0S2V5QmluZGluZygpXG4gICAgICBcImF0b21pYy1lbWFjczpjb3B5XCI6IChldmVudCkgLT5cbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdG9taWMtZW1hY3MuYWx3YXlzVXNlS2lsbFJpbmcnKVxuICAgICAgICAgIGdldEVkaXRvcihldmVudCkuY29weVJlZ2lvbkFzS2lsbCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBldmVudC5hYm9ydEtleUJpbmRpbmcoKVxuXG4gICAgICAjIEVkaXRpbmdcbiAgICAgIFwiYXRvbWljLWVtYWNzOmRlbGV0ZS1ob3Jpem9udGFsLXNwYWNlXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5kZWxldGVIb3Jpem9udGFsU3BhY2UoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6ZGVsZXRlLWluZGVudGF0aW9uXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5kZWxldGVJbmRlbnRhdGlvbigpXG4gICAgICBcImF0b21pYy1lbWFjczpvcGVuLWxpbmVcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLm9wZW5MaW5lKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmp1c3Qtb25lLXNwYWNlXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5qdXN0T25lU3BhY2UoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6ZGVsZXRlLWJsYW5rLWxpbmVzXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5kZWxldGVCbGFua0xpbmVzKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOnRyYW5zcG9zZS1jaGFyc1wiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkudHJhbnNwb3NlQ2hhcnMoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6dHJhbnNwb3NlLWxpbmVzXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS50cmFuc3Bvc2VMaW5lcygpXG4gICAgICBcImF0b21pYy1lbWFjczp0cmFuc3Bvc2Utc2V4cHNcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnRyYW5zcG9zZVNleHBzKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOnRyYW5zcG9zZS13b3Jkc1wiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkudHJhbnNwb3NlV29yZHMoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6ZG93bmNhc2Utd29yZC1vci1yZWdpb25cIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmRvd25jYXNlV29yZE9yUmVnaW9uKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOnVwY2FzZS13b3JkLW9yLXJlZ2lvblwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkudXBjYXNlV29yZE9yUmVnaW9uKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOmNhcGl0YWxpemUtd29yZC1vci1yZWdpb25cIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmNhcGl0YWxpemVXb3JkT3JSZWdpb24oKVxuXG4gICAgICAjIE1hcmtpbmcgJiBTZWxlY3RpbmdcbiAgICAgIFwiYXRvbWljLWVtYWNzOnNldC1tYXJrXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5zZXRNYXJrKClcbiAgICAgIFwiYXRvbWljLWVtYWNzOm1hcmstc2V4cFwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkubWFya1NleHAoKVxuICAgICAgXCJhdG9taWMtZW1hY3M6bWFyay13aG9sZS1idWZmZXJcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLm1hcmtXaG9sZUJ1ZmZlcigpXG4gICAgICBcImF0b21pYy1lbWFjczpleGNoYW5nZS1wb2ludC1hbmQtbWFya1wiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkuZXhjaGFuZ2VQb2ludEFuZE1hcmsoKVxuXG4gICAgICAjIFNjcm9sbGluZ1xuICAgICAgXCJhdG9taWMtZW1hY3M6cmVjZW50ZXItdG9wLWJvdHRvbVwiOiAoZXZlbnQpIC0+IGdldEVkaXRvcihldmVudCkucmVjZW50ZXJUb3BCb3R0b20oKVxuICAgICAgXCJhdG9taWMtZW1hY3M6c2Nyb2xsLWRvd25cIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLnNjcm9sbERvd24oKVxuICAgICAgXCJhdG9taWMtZW1hY3M6c2Nyb2xsLXVwXCI6IChldmVudCkgLT4gZ2V0RWRpdG9yKGV2ZW50KS5zY3JvbGxVcCgpXG5cbiAgICAgICMgVUlcbiAgICAgIFwiY29yZTpjYW5jZWxcIjogKGV2ZW50KSAtPiBnZXRFZGl0b3IoZXZlbnQpLmtleWJvYXJkUXVpdCgpXG5cbiAgICBAZGlzcG9zYWJsZS5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgIFwiYXRvbWljLWVtYWNzOmZpbmQtZmlsZVwiOiAoZXZlbnQpIC0+IGZpbmRGaWxlKGV2ZW50KVxuICAgICAgXCJhdG9taWMtZW1hY3M6Y2xvc2Utb3RoZXItcGFuZXNcIjogKGV2ZW50KSAtPiBjbG9zZU90aGVyUGFuZXMoZXZlbnQpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXRvbS13b3Jrc3BhY2UnKVswXT8uY2xhc3NMaXN0Py5yZW1vdmUoJ2F0b21pYy1lbWFjcycpXG4gICAgQGRpc3Bvc2FibGU/LmRpc3Bvc2UoKVxuICAgIEBkaXNwb3NhYmxlID0gbnVsbFxuICAgIEtpbGxSaW5nLmdsb2JhbC5yZXNldCgpXG4iXX0=
