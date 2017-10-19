(function() {
  var CompositeDisposable, Point, Range, child_process, idAtom, idTerminal, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Point = ref.Point, Range = ref.Range;

  child_process = require('child_process');

  idAtom = "";

  idTerminal = "";

  String.prototype.addSlashes = function() {
    return this.replace(/[\\"]/g, "\\$&").replace(/\u0000/g, "\\0");
  };

  module.exports = {
    config: {
      textToPaste: {
        title: 'String to write to the terminal',
        description: 'String to write for copying selections/cells through clipboard (if empty, text is directly pasted).',
        type: 'string',
        "default": '%paste -q'
      },
      advancePosition: {
        title: 'Advance to next line',
        description: 'If True, the cursor advances to the next line after sending the current line (when there is no selection).',
        type: 'boolean',
        "default": true
      },
      focusOnTerminal: {
        title: 'Focus on terminal after sending commands',
        description: 'After code is sent, bring focus to the terminal.',
        type: 'boolean',
        "default": false
      },
      shellCellStringPrefix: {
        title: 'Cell separator',
        description: 'String prefix to delimit different cells.',
        type: 'string',
        "default": '##'
      },
      shellProfile: {
        title: 'Shell profile',
        description: 'Create a terminal with this profile',
        type: 'string',
        "default": ''
      },
      notifications: {
        type: 'boolean',
        "default": true,
        description: 'Send notifications in case of errors/warnings'
      }
    },
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'ipython-exec:open-terminal': (function(_this) {
          return function() {
            return _this.openTerminal();
          };
        })(this),
        'ipython-exec:setwd': (function(_this) {
          return function() {
            return _this.setWorkingDirectory();
          };
        })(this),
        'ipython-exec:send-command': (function(_this) {
          return function() {
            return _this.sendCommand();
          };
        })(this),
        'ipython-exec:send-cell': (function(_this) {
          return function() {
            return _this.sendCell();
          };
        })(this),
        'ipython-exec:prev-cell': (function(_this) {
          return function() {
            return _this.moveToPrevCell();
          };
        })(this),
        'ipython-exec:next-cell': (function(_this) {
          return function() {
            return _this.moveToNextCell();
          };
        })(this)
      }));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    isTerminalOpen: function() {
      var error;
      try {
        child_process.execSync("xdotool getwindowname " + idTerminal);
        return true;
      } catch (error1) {
        error = error1;
        return false;
      }
    },
    sendCode: function(code) {
      if (!code) {
        return;
      }
      if (process.platform === "darwin") {
        return this.iterm2(code);
      } else if (this.isTerminalOpen()) {
        return this.gnometerminal(code);
      }
    },
    openTerminal: function() {
      var CMD, editor, shellProfile;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (process.platform === "linux") {
        child_process.exec('xdotool getactivewindow', function(error, stdout, stderr) {
          return idAtom = stdout;
        });
        if (!this.isTerminalOpen()) {
          shellProfile = atom.config.get('ipython-exec.shellProfile');
          CMD = 'gnome-terminal --title=ATOM-IPYTHON-SHELL';
          if (shellProfile) {
            CMD += " --profile=" + shellProfile;
          }
          CMD += ' -e ipython &';
          child_process.exec(CMD);
          idTerminal = child_process.execSync('xdotool search --sync --name ATOM-IPYTHON-SHELL | head -1', {
            stdio: 'pipe'
          }).toString();
          if (atom.config.get('ipython-exec.notifications')) {
            return atom.notifications.addSuccess("ipython terminal created");
          }
        }
      }
    },
    setWorkingDirectory: function() {
      var cwd, editor;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (process.platform === "linux" && !this.isTerminalOpen()) {
        return;
      }
      cwd = editor.getPath();
      if (!cwd) {
        if (atom.config.get('ipython-exec.notifications')) {
          atom.notifications.addWarning("Cannot get working directory from file: save the file first");
          return;
        }
      }
      return this.sendCode(('cd "' + cwd.substring(0, cwd.lastIndexOf('/')) + '"').addSlashes());
    },
    sendCommand: function() {
      var cursor, editor, line, selection, textToPaste;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (process.platform === "linux" && !this.isTerminalOpen()) {
        return;
      }
      textToPaste = atom.config.get('ipython-exec.textToPaste').addSlashes();
      if (selection = editor.getSelectedText()) {
        if (textToPaste && selection.indexOf('\n') !== -1) {
          atom.clipboard.write(selection);
          return this.sendCode(textToPaste);
        } else {
          return this.sendCode(selection.addSlashes());
        }
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row).toString();
        if (line) {
          if (textToPaste) {
            atom.clipboard.write(line);
            this.sendCode(textToPaste);
          } else {
            this.sendCode(line.addSlashes());
          }
        }
        if (atom.config.get('ipython-exec.advancePosition')) {
          return editor.moveDown(1);
        }
      }
    },
    sendCell: function() {
      var cellPrefix, editor, first, i, j, k, last, lines, nLines, pos, ref1, ref2, ref3, selection, textToPaste;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(nLines = editor.getLineCount())) {
        return;
      }
      if (process.platform === "linux" && !this.isTerminalOpen()) {
        return;
      }
      lines = editor.buffer.getLines();
      cellPrefix = atom.config.get('ipython-exec.shellCellStringPrefix');
      pos = editor.getCursorBufferPosition().row;
      first = 0;
      last = nLines - 1;
      for (i = j = ref1 = pos; ref1 <= 0 ? j <= 0 : j >= 0; i = ref1 <= 0 ? ++j : --j) {
        if (lines[i].indexOf(cellPrefix) === 0) {
          first = i;
          break;
        }
      }
      for (i = k = ref2 = pos + 1, ref3 = nLines; ref2 <= ref3 ? k < ref3 : k > ref3; i = ref2 <= ref3 ? ++k : --k) {
        if (lines[i].indexOf(cellPrefix) === 0) {
          last = i - 1;
          break;
        }
      }
      textToPaste = atom.config.get('ipython-exec.textToPaste').addSlashes();
      selection = editor.getTextInBufferRange([[first, 0], [last, 2e308]]);
      if (!selection) {
        return;
      }
      atom.clipboard.write(selection);
      return this.sendCode(textToPaste);
    },
    moveToPrevCell: function() {
      var cellPrefix, editor, i, j, lines, nLines, nextPos, pos, ref1;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(nLines = editor.getLineCount())) {
        return;
      }
      lines = editor.buffer.getLines();
      cellPrefix = atom.config.get('ipython-exec.shellCellStringPrefix');
      if (!(pos = editor.getCursorBufferPosition().row)) {
        return;
      }
      nextPos = 0;
      for (i = j = ref1 = pos - 1; ref1 <= 0 ? j < 0 : j > 0; i = ref1 <= 0 ? ++j : --j) {
        if (lines[i].indexOf(cellPrefix) === 0) {
          nextPos = i;
          break;
        }
      }
      return editor.setCursorBufferPosition([nextPos, 0]);
    },
    moveToNextCell: function() {
      var cellPrefix, editor, i, j, lines, nLines, nextPos, pos, ref1, ref2;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      if (!(nLines = editor.getLineCount())) {
        return;
      }
      lines = editor.buffer.getLines();
      cellPrefix = atom.config.get('ipython-exec.shellCellStringPrefix');
      pos = editor.getCursorBufferPosition().row;
      nextPos = pos;
      for (i = j = ref1 = pos + 1, ref2 = nLines; ref1 <= ref2 ? j < ref2 : j > ref2; i = ref1 <= ref2 ? ++j : --j) {
        if (lines[i].indexOf(cellPrefix) === 0) {
          nextPos = i;
          break;
        }
      }
      return editor.setCursorBufferPosition([nextPos, 0]);
    },
    iterm2: function(selection) {
      var command, osascript;
      osascript = require('node-osascript');
      command = [];
      if (atom.config.get('ipython-exec.focusOnTerminal')) {
        command.push('tell application "iTerm" to activate');
      }
      command.push('tell application "iTerm"');
      command.push('  tell the current window');
      command.push('    tell current session');
      command.push('      write text code');
      command.push('    end tell');
      command.push('  end tell');
      command.push('end tell');
      command = command.join('\n');
      return osascript.execute(command, {
        code: selection
      }, function(error, result, raw) {
        if (error) {
          return console.error(error);
        }
      });
    },
    gnometerminal: function(selection) {
      child_process.execSync('xdotool windowactivate ' + idTerminal);
      child_process.execSync('xdotool type --delay 10 --clearmodifiers "' + selection + '"');
      child_process.execSync('xdotool key --clearmodifiers Return');
      if (!atom.config.get('ipython-exec.focusOnTerminal')) {
        return child_process.execSync('xdotool windowactivate ' + idAtom);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2lweXRob24tZXhlYy9saWIvaXB5dGhvbi1leGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBc0MsT0FBQSxDQUFRLE1BQVIsQ0FBdEMsRUFBQyw2Q0FBRCxFQUFzQixpQkFBdEIsRUFBNkI7O0VBRzdCLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVI7O0VBR2hCLE1BQUEsR0FBUzs7RUFDVCxVQUFBLEdBQWE7O0VBR2IsTUFBTSxDQUFBLFNBQUUsQ0FBQSxVQUFSLEdBQXFCLFNBQUE7V0FDbkIsSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLE1BQW5CLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsU0FBbkMsRUFBOEMsS0FBOUM7RUFEbUI7O0VBSXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8saUNBQVA7UUFDQSxXQUFBLEVBQWEscUdBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsV0FIVDtPQURGO01BS0EsZUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHNCQUFQO1FBQ0EsV0FBQSxFQUFhLDRHQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7T0FORjtNQVVBLGVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTywwQ0FBUDtRQUNBLFdBQUEsRUFBYSxrREFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BWEY7TUFlQSxxQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGdCQUFQO1FBQ0EsV0FBQSxFQUFhLDJDQURiO1FBRUEsSUFBQSxFQUFNLFFBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7T0FoQkY7TUFvQkEsWUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGVBQVA7UUFDQSxXQUFBLEVBQWEscUNBRGI7UUFFQSxJQUFBLEVBQU0sUUFGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtPQXJCRjtNQXlCQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSwrQ0FGYjtPQTFCRjtLQURGO0lBK0JBLGFBQUEsRUFBZSxJQS9CZjtJQWtDQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxtQkFBQSxDQUFBO2FBQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQ2pCO1FBQUEsNEJBQUEsRUFBOEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsWUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO1FBQ0Esb0JBQUEsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsbUJBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUR0QjtRQUVBLDJCQUFBLEVBQTZCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUY3QjtRQUdBLHdCQUFBLEVBQTBCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUgxQjtRQUlBLHdCQUFBLEVBQTBCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUoxQjtRQUtBLHdCQUFBLEVBQTBCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUwxQjtPQURpQixDQUFuQjtJQUZRLENBbENWO0lBNkNBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQTdDWjtJQWlEQSxjQUFBLEVBQWdCLFNBQUE7QUFDZCxVQUFBO0FBQUE7UUFBSSxhQUFhLENBQUMsUUFBZCxDQUF3Qix3QkFBQSxHQUF5QixVQUFqRDtBQUErRCxlQUFPLEtBQTFFO09BQUEsY0FBQTtRQUNNO0FBQVcsZUFBTyxNQUR4Qjs7SUFEYyxDQWpEaEI7SUFzREEsUUFBQSxFQUFVLFNBQUMsSUFBRDtNQUNSLElBQVUsQ0FBSSxJQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLFFBQXZCO2VBQXFDLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBUixFQUFyQztPQUFBLE1BQ0ssSUFBRyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUg7ZUFBMEIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFmLEVBQTFCOztJQUhHLENBdERWO0lBNERBLFlBQUEsRUFBYyxTQUFBO0FBQ1osVUFBQTtNQUFBLElBQUEsQ0FBYyxDQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFkO0FBQUEsZUFBQTs7TUFFQSxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE9BQXZCO1FBQ0ksYUFBYSxDQUFDLElBQWQsQ0FBb0IseUJBQXBCLEVBQStDLFNBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsTUFBaEI7aUJBQTJCLE1BQUEsR0FBUztRQUFwQyxDQUEvQztRQUNBLElBQUcsQ0FBSSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQVA7VUFDSSxZQUFBLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJCQUFoQjtVQUNmLEdBQUEsR0FBTTtVQUNOLElBQUcsWUFBSDtZQUNJLEdBQUEsSUFBTyxhQUFBLEdBQWMsYUFEekI7O1VBRUEsR0FBQSxJQUFPO1VBQ1AsYUFBYSxDQUFDLElBQWQsQ0FBb0IsR0FBcEI7VUFDQSxVQUFBLEdBQWEsYUFBYSxDQUFDLFFBQWQsQ0FBd0IsMkRBQXhCLEVBQXFGO1lBQUMsS0FBQSxFQUFPLE1BQVI7V0FBckYsQ0FBdUcsQ0FBQyxRQUF4RyxDQUFBO1VBQ2IsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBaUIsNEJBQWpCLENBQUg7bUJBQ0ksSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QiwwQkFBOUIsRUFESjtXQVJKO1NBRko7O0lBSFksQ0E1RGQ7SUE4RUEsbUJBQUEsRUFBcUIsU0FBQTtBQUNuQixVQUFBO01BQUEsSUFBQSxDQUFjLENBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQVUsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBcEIsSUFBZ0MsQ0FBSSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQTlDO0FBQUEsZUFBQTs7TUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE9BQVAsQ0FBQTtNQUNOLElBQUcsQ0FBSSxHQUFQO1FBQ0ksSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBaUIsNEJBQWpCLENBQUg7VUFDSSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLDZEQUE5QjtBQUNBLGlCQUZKO1NBREo7O2FBSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVyxDQUFDLE1BQUEsR0FBUyxHQUFHLENBQUMsU0FBSixDQUFjLENBQWQsRUFBaUIsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsR0FBaEIsQ0FBakIsQ0FBVCxHQUFrRCxHQUFuRCxDQUF1RCxDQUFDLFVBQXhELENBQUEsQ0FBWDtJQVRtQixDQTlFckI7SUEwRkEsV0FBQSxFQUFhLFNBQUE7QUFDWCxVQUFBO01BQUEsSUFBQSxDQUFjLENBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQVUsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBcEIsSUFBZ0MsQ0FBSSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQTlDO0FBQUEsZUFBQTs7TUFFQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixDQUEyQyxDQUFDLFVBQTVDLENBQUE7TUFDZCxJQUFHLFNBQUEsR0FBWSxNQUFNLENBQUMsZUFBUCxDQUFBLENBQWY7UUFDSSxJQUFHLFdBQUEsSUFBZ0IsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsSUFBbEIsQ0FBQSxLQUEyQixDQUFDLENBQS9DO1VBQ0ksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXNCLFNBQXRCO2lCQUNBLElBQUMsQ0FBQSxRQUFELENBQVcsV0FBWCxFQUZKO1NBQUEsTUFBQTtpQkFJSSxJQUFDLENBQUEsUUFBRCxDQUFXLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBWCxFQUpKO1NBREo7T0FBQSxNQU1LLElBQUcsTUFBQSxHQUFTLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVo7UUFDRCxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyxHQUFuQyxDQUF1QyxDQUFDLFFBQXhDLENBQUE7UUFDUCxJQUFHLElBQUg7VUFDSSxJQUFHLFdBQUg7WUFDSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBc0IsSUFBdEI7WUFDQSxJQUFDLENBQUEsUUFBRCxDQUFXLFdBQVgsRUFGSjtXQUFBLE1BQUE7WUFJSSxJQUFDLENBQUEsUUFBRCxDQUFXLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBWCxFQUpKO1dBREo7O1FBTUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCLENBQUg7aUJBQ0ksTUFBTSxDQUFDLFFBQVAsQ0FBaUIsQ0FBakIsRUFESjtTQVJDOztJQVhNLENBMUZiO0lBaUhBLFFBQUEsRUFBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUEsQ0FBYyxDQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsQ0FBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQVUsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBcEIsSUFBZ0MsQ0FBSSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQTlDO0FBQUEsZUFBQTs7TUFFQSxLQUFBLEdBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFkLENBQUE7TUFDUixVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQjtNQUNiLEdBQUEsR0FBTSxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFnQyxDQUFDO01BR3ZDLEtBQUEsR0FBUTtNQUNSLElBQUEsR0FBTyxNQUFBLEdBQU87QUFDZCxXQUFTLDBFQUFUO1FBQ0ksSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBVCxDQUFpQixVQUFqQixDQUFBLEtBQWdDLENBQW5DO1VBQ0ksS0FBQSxHQUFRO0FBQ1IsZ0JBRko7O0FBREo7QUFJQSxXQUFRLHVHQUFSO1FBQ0ksSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBVCxDQUFpQixVQUFqQixDQUFBLEtBQWdDLENBQW5DO1VBQ0ksSUFBQSxHQUFPLENBQUEsR0FBRTtBQUNULGdCQUZKOztBQURKO01BTUEsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsQ0FBMkMsQ0FBQyxVQUE1QyxDQUFBO01BQ2QsU0FBQSxHQUFZLE1BQU0sQ0FBQyxvQkFBUCxDQUE2QixDQUFDLENBQUMsS0FBRCxFQUFRLENBQVIsQ0FBRCxFQUFhLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FBYixDQUE3QjtNQUNaLElBQVUsQ0FBSSxTQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBc0IsU0FBdEI7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFXLFdBQVg7SUExQlEsQ0FqSFY7SUE4SUEsY0FBQSxFQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLElBQUEsQ0FBYyxDQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsQ0FBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFULENBQWQ7QUFBQSxlQUFBOztNQUVBLEtBQUEsR0FBUSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWQsQ0FBQTtNQUNSLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCO01BQ2IsSUFBQSxDQUFjLENBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsR0FBdkMsQ0FBZDtBQUFBLGVBQUE7O01BR0EsT0FBQSxHQUFVO0FBQ1YsV0FBUyw0RUFBVDtRQUNJLElBQUcsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVQsQ0FBaUIsVUFBakIsQ0FBQSxLQUFnQyxDQUFuQztVQUNJLE9BQUEsR0FBVTtBQUNWLGdCQUZKOztBQURKO2FBTUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsT0FBRCxFQUFVLENBQVYsQ0FBL0I7SUFoQmMsQ0E5SWhCO0lBaUtBLGNBQUEsRUFBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxJQUFBLENBQWMsQ0FBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLENBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBVCxDQUFkO0FBQUEsZUFBQTs7TUFFQSxLQUFBLEdBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFkLENBQUE7TUFDUixVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQjtNQUNiLEdBQUEsR0FBTSxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFnQyxDQUFDO01BR3ZDLE9BQUEsR0FBVTtBQUNWLFdBQVEsdUdBQVI7UUFDSSxJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFULENBQWlCLFVBQWpCLENBQUEsS0FBZ0MsQ0FBbkM7VUFDSSxPQUFBLEdBQVU7QUFDVixnQkFGSjs7QUFESjthQU1BLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLE9BQUQsRUFBVSxDQUFWLENBQS9CO0lBaEJjLENBaktoQjtJQW9MQSxNQUFBLEVBQVEsU0FBQyxTQUFEO0FBQ04sVUFBQTtNQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsZ0JBQVI7TUFDWixPQUFBLEdBQVU7TUFDVixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEIsQ0FBSDtRQUNJLE9BQU8sQ0FBQyxJQUFSLENBQWEsc0NBQWIsRUFESjs7TUFFQSxPQUFPLENBQUMsSUFBUixDQUFhLDBCQUFiO01BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSwyQkFBYjtNQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWEsMEJBQWI7TUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLHVCQUFiO01BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxjQUFiO01BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiO01BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxVQUFiO01BQ0EsT0FBQSxHQUFVLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYjthQUNWLFNBQVMsQ0FBQyxPQUFWLENBQWtCLE9BQWxCLEVBQTJCO1FBQUMsSUFBQSxFQUFNLFNBQVA7T0FBM0IsRUFBOEMsU0FBQyxLQUFELEVBQVEsTUFBUixFQUFnQixHQUFoQjtRQUMxQyxJQUFHLEtBQUg7aUJBQWMsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBQWQ7O01BRDBDLENBQTlDO0lBYk0sQ0FwTFI7SUFxTUEsYUFBQSxFQUFlLFNBQUMsU0FBRDtNQUNiLGFBQWEsQ0FBQyxRQUFkLENBQXdCLHlCQUFBLEdBQTBCLFVBQWxEO01BQ0EsYUFBYSxDQUFDLFFBQWQsQ0FBd0IsNENBQUEsR0FBNkMsU0FBN0MsR0FBdUQsR0FBL0U7TUFDQSxhQUFhLENBQUMsUUFBZCxDQUF3QixxQ0FBeEI7TUFDQSxJQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQixDQUFKO2VBQ0ksYUFBYSxDQUFDLFFBQWQsQ0FBd0IseUJBQUEsR0FBMEIsTUFBbEQsRUFESjs7SUFKYSxDQXJNZjs7QUFmRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcbiN7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmNoaWxkX3Byb2Nlc3MgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJylcblxuIyB3aW5kb3dzJyBpZCB0byBiZSB1c2VkIHdpdGggeGRvdG9vbCAob25seSBsaW51eClcbmlkQXRvbSA9IFwiXCJcbmlkVGVybWluYWwgPSBcIlwiXG5cblxuU3RyaW5nOjphZGRTbGFzaGVzID0gLT5cbiAgQHJlcGxhY2UoL1tcXFxcXCJdL2csIFwiXFxcXCQmXCIpLnJlcGxhY2UgL1xcdTAwMDAvZywgXCJcXFxcMFwiXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgdGV4dFRvUGFzdGU6XG4gICAgICB0aXRsZTogJ1N0cmluZyB0byB3cml0ZSB0byB0aGUgdGVybWluYWwnXG4gICAgICBkZXNjcmlwdGlvbjogJ1N0cmluZyB0byB3cml0ZSBmb3IgY29weWluZyBzZWxlY3Rpb25zL2NlbGxzIHRocm91Z2ggY2xpcGJvYXJkIChpZiBlbXB0eSwgdGV4dCBpcyBkaXJlY3RseSBwYXN0ZWQpLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJXBhc3RlIC1xJ1xuICAgIGFkdmFuY2VQb3NpdGlvbjpcbiAgICAgIHRpdGxlOiAnQWR2YW5jZSB0byBuZXh0IGxpbmUnXG4gICAgICBkZXNjcmlwdGlvbjogJ0lmIFRydWUsIHRoZSBjdXJzb3IgYWR2YW5jZXMgdG8gdGhlIG5leHQgbGluZSBhZnRlciBzZW5kaW5nIHRoZSBjdXJyZW50IGxpbmUgKHdoZW4gdGhlcmUgaXMgbm8gc2VsZWN0aW9uKS4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBmb2N1c09uVGVybWluYWw6XG4gICAgICB0aXRsZTogJ0ZvY3VzIG9uIHRlcm1pbmFsIGFmdGVyIHNlbmRpbmcgY29tbWFuZHMnXG4gICAgICBkZXNjcmlwdGlvbjogJ0FmdGVyIGNvZGUgaXMgc2VudCwgYnJpbmcgZm9jdXMgdG8gdGhlIHRlcm1pbmFsLidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBzaGVsbENlbGxTdHJpbmdQcmVmaXg6XG4gICAgICB0aXRsZTogJ0NlbGwgc2VwYXJhdG9yJ1xuICAgICAgZGVzY3JpcHRpb246ICdTdHJpbmcgcHJlZml4IHRvIGRlbGltaXQgZGlmZmVyZW50IGNlbGxzLidcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnIyMnXG4gICAgc2hlbGxQcm9maWxlOlxuICAgICAgdGl0bGU6ICdTaGVsbCBwcm9maWxlJ1xuICAgICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYSB0ZXJtaW5hbCB3aXRoIHRoaXMgcHJvZmlsZSdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIG5vdGlmaWNhdGlvbnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VuZCBub3RpZmljYXRpb25zIGluIGNhc2Ugb2YgZXJyb3JzL3dhcm5pbmdzJ1xuXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnaXB5dGhvbi1leGVjOm9wZW4tdGVybWluYWwnOiA9PiBAb3BlblRlcm1pbmFsKClcbiAgICAgICdpcHl0aG9uLWV4ZWM6c2V0d2QnOiA9PiBAc2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gICAgICAnaXB5dGhvbi1leGVjOnNlbmQtY29tbWFuZCc6ID0+IEBzZW5kQ29tbWFuZCgpXG4gICAgICAnaXB5dGhvbi1leGVjOnNlbmQtY2VsbCc6ID0+IEBzZW5kQ2VsbCgpXG4gICAgICAnaXB5dGhvbi1leGVjOnByZXYtY2VsbCc6ID0+IEBtb3ZlVG9QcmV2Q2VsbCgpXG4gICAgICAnaXB5dGhvbi1leGVjOm5leHQtY2VsbCc6ID0+IEBtb3ZlVG9OZXh0Q2VsbCgpXG5cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG5cbiAgaXNUZXJtaW5hbE9wZW46IC0+XG4gICAgdHJ5IGNoaWxkX3Byb2Nlc3MuZXhlY1N5bmMoIFwieGRvdG9vbCBnZXR3aW5kb3duYW1lIFwiK2lkVGVybWluYWwgKTsgcmV0dXJuIHRydWVcbiAgICBjYXRjaCBlcnJvciB0aGVuIHJldHVybiBmYWxzZVxuXG5cbiAgc2VuZENvZGU6IChjb2RlKSAtPlxuICAgIHJldHVybiBpZiBub3QgY29kZVxuICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgXCJkYXJ3aW5cIiB0aGVuIEBpdGVybTIoY29kZSlcbiAgICBlbHNlIGlmIEBpc1Rlcm1pbmFsT3BlbigpIHRoZW4gQGdub21ldGVybWluYWwoY29kZSlcblxuXG4gIG9wZW5UZXJtaW5hbDogLT5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyBcImxpbnV4XCJcbiAgICAgICAgY2hpbGRfcHJvY2Vzcy5leGVjKCAneGRvdG9vbCBnZXRhY3RpdmV3aW5kb3cnLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSAtPiBpZEF0b20gPSBzdGRvdXQgKVxuICAgICAgICBpZiBub3QgQGlzVGVybWluYWxPcGVuKClcbiAgICAgICAgICAgIHNoZWxsUHJvZmlsZSA9IGF0b20uY29uZmlnLmdldCgnaXB5dGhvbi1leGVjLnNoZWxsUHJvZmlsZScpXG4gICAgICAgICAgICBDTUQgPSAnZ25vbWUtdGVybWluYWwgLS10aXRsZT1BVE9NLUlQWVRIT04tU0hFTEwnXG4gICAgICAgICAgICBpZiBzaGVsbFByb2ZpbGVcbiAgICAgICAgICAgICAgICBDTUQgKz0gXCIgLS1wcm9maWxlPVwiK3NoZWxsUHJvZmlsZVxuICAgICAgICAgICAgQ01EICs9ICcgLWUgaXB5dGhvbiAmJ1xuICAgICAgICAgICAgY2hpbGRfcHJvY2Vzcy5leGVjKCBDTUQgKVxuICAgICAgICAgICAgaWRUZXJtaW5hbCA9IGNoaWxkX3Byb2Nlc3MuZXhlY1N5bmMoICd4ZG90b29sIHNlYXJjaCAtLXN5bmMgLS1uYW1lIEFUT00tSVBZVEhPTi1TSEVMTCB8IGhlYWQgLTEnLCB7c3RkaW86ICdwaXBlJyB9ICkudG9TdHJpbmcoKVxuICAgICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCAnaXB5dGhvbi1leGVjLm5vdGlmaWNhdGlvbnMnIClcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcImlweXRob24gdGVybWluYWwgY3JlYXRlZFwiKVxuICAgICMgW1RPRE9dIHByb2Nlc3MucGxhdGZvcm0gaXMgXCJkYXJ3aW5cIlxuXG5cbiAgc2V0V29ya2luZ0RpcmVjdG9yeTogLT5cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzIFwibGludXhcIiBhbmQgbm90IEBpc1Rlcm1pbmFsT3BlbigpXG5cbiAgICBjd2QgPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgaWYgbm90IGN3ZFxuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoICdpcHl0aG9uLWV4ZWMubm90aWZpY2F0aW9ucycgKVxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJDYW5ub3QgZ2V0IHdvcmtpbmcgZGlyZWN0b3J5IGZyb20gZmlsZTogc2F2ZSB0aGUgZmlsZSBmaXJzdFwiKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgQHNlbmRDb2RlKCAoJ2NkIFwiJyArIGN3ZC5zdWJzdHJpbmcoMCwgY3dkLmxhc3RJbmRleE9mKCcvJykpICsgJ1wiJykuYWRkU2xhc2hlcygpIClcblxuXG4gIHNlbmRDb21tYW5kOiAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgXCJsaW51eFwiIGFuZCBub3QgQGlzVGVybWluYWxPcGVuKClcblxuICAgIHRleHRUb1Bhc3RlID0gYXRvbS5jb25maWcuZ2V0KCdpcHl0aG9uLWV4ZWMudGV4dFRvUGFzdGUnKS5hZGRTbGFzaGVzKClcbiAgICBpZiBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICAgICAgaWYgdGV4dFRvUGFzdGUgYW5kIHNlbGVjdGlvbi5pbmRleE9mKCdcXG4nKSAhPSAtMVxuICAgICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoIHNlbGVjdGlvbiApXG4gICAgICAgICAgICBAc2VuZENvZGUoIHRleHRUb1Bhc3RlIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNlbmRDb2RlKCBzZWxlY3Rpb24uYWRkU2xhc2hlcygpIClcbiAgICBlbHNlIGlmIGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdykudG9TdHJpbmcoKVxuICAgICAgICBpZiBsaW5lXG4gICAgICAgICAgICBpZiB0ZXh0VG9QYXN0ZVxuICAgICAgICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKCBsaW5lIClcbiAgICAgICAgICAgICAgICBAc2VuZENvZGUoIHRleHRUb1Bhc3RlIClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2VuZENvZGUoIGxpbmUuYWRkU2xhc2hlcygpIClcbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0ICdpcHl0aG9uLWV4ZWMuYWR2YW5jZVBvc2l0aW9uJ1xuICAgICAgICAgICAgZWRpdG9yLm1vdmVEb3duKCAxIClcblxuXG4gIHNlbmRDZWxsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBuTGluZXMgPSBlZGl0b3IuZ2V0TGluZUNvdW50KClcbiAgICByZXR1cm4gaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyBcImxpbnV4XCIgYW5kIG5vdCBAaXNUZXJtaW5hbE9wZW4oKVxuXG4gICAgbGluZXMgPSBlZGl0b3IuYnVmZmVyLmdldExpbmVzKClcbiAgICBjZWxsUHJlZml4ID0gYXRvbS5jb25maWcuZ2V0KCdpcHl0aG9uLWV4ZWMuc2hlbGxDZWxsU3RyaW5nUHJlZml4JylcbiAgICBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3dcblxuICAgICMgZ2V0IGNlbGwgYm91bmRhcmllc1xuICAgIGZpcnN0ID0gMFxuICAgIGxhc3QgPSBuTGluZXMtMVxuICAgIGZvciBpIGluIFtwb3MuLjBdXG4gICAgICAgIGlmIGxpbmVzW2ldLmluZGV4T2YoY2VsbFByZWZpeCkgPT0gMFxuICAgICAgICAgICAgZmlyc3QgPSBpXG4gICAgICAgICAgICBicmVha1xuICAgIGZvciBpIGluW3BvcysxLi4ubkxpbmVzXVxuICAgICAgICBpZiBsaW5lc1tpXS5pbmRleE9mKGNlbGxQcmVmaXgpID09IDBcbiAgICAgICAgICAgIGxhc3QgPSBpLTFcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAjIHBhc3MgdGV4dCB0byBzaGVsbCB0aHJvdWdoIGNsaXBib2FyZFxuICAgIHRleHRUb1Bhc3RlID0gYXRvbS5jb25maWcuZ2V0KCdpcHl0aG9uLWV4ZWMudGV4dFRvUGFzdGUnKS5hZGRTbGFzaGVzKClcbiAgICBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoIFtbZmlyc3QsIDBdLCBbbGFzdCwgSW5maW5pdHldXSApXG4gICAgcmV0dXJuIGlmIG5vdCBzZWxlY3Rpb25cbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSggc2VsZWN0aW9uIClcbiAgICBAc2VuZENvZGUoIHRleHRUb1Bhc3RlIClcblxuXG4gIG1vdmVUb1ByZXZDZWxsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBuTGluZXMgPSBlZGl0b3IuZ2V0TGluZUNvdW50KClcblxuICAgIGxpbmVzID0gZWRpdG9yLmJ1ZmZlci5nZXRMaW5lcygpXG4gICAgY2VsbFByZWZpeCA9IGF0b20uY29uZmlnLmdldCgnaXB5dGhvbi1leGVjLnNoZWxsQ2VsbFN0cmluZ1ByZWZpeCcpXG4gICAgcmV0dXJuIHVubGVzcyBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cgIyBza2lwIGZpcnN0IGxpbmVcblxuICAgICMgZ2V0IHJvdyBvZiBwcmV2IGNlbGxcbiAgICBuZXh0UG9zID0gMFxuICAgIGZvciBpIGluIFtwb3MtMS4uLjBdXG4gICAgICAgIGlmIGxpbmVzW2ldLmluZGV4T2YoY2VsbFByZWZpeCkgPT0gMFxuICAgICAgICAgICAgbmV4dFBvcyA9IGlcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAjIG1vdmUgY3Vyc29yXG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtuZXh0UG9zLCAwXSlcblxuXG4gIG1vdmVUb05leHRDZWxsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBuTGluZXMgPSBlZGl0b3IuZ2V0TGluZUNvdW50KClcblxuICAgIGxpbmVzID0gZWRpdG9yLmJ1ZmZlci5nZXRMaW5lcygpXG4gICAgY2VsbFByZWZpeCA9IGF0b20uY29uZmlnLmdldCgnaXB5dGhvbi1leGVjLnNoZWxsQ2VsbFN0cmluZ1ByZWZpeCcpXG4gICAgcG9zID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93XG5cbiAgICAjIGdldCByb3cgb2YgbmV4dCBjZWxsXG4gICAgbmV4dFBvcyA9IHBvc1xuICAgIGZvciBpIGluW3BvcysxLi4ubkxpbmVzXVxuICAgICAgICBpZiBsaW5lc1tpXS5pbmRleE9mKGNlbGxQcmVmaXgpID09IDBcbiAgICAgICAgICAgIG5leHRQb3MgPSBpXG4gICAgICAgICAgICBicmVha1xuXG4gICAgIyBtb3ZlIGN1cnNvclxuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbbmV4dFBvcywgMF0pXG5cblxuICBpdGVybTI6IChzZWxlY3Rpb24pIC0+XG4gICAgb3Nhc2NyaXB0ID0gcmVxdWlyZSAnbm9kZS1vc2FzY3JpcHQnXG4gICAgY29tbWFuZCA9IFtdXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0ICdpcHl0aG9uLWV4ZWMuZm9jdXNPblRlcm1pbmFsJ1xuICAgICAgICBjb21tYW5kLnB1c2ggJ3RlbGwgYXBwbGljYXRpb24gXCJpVGVybVwiIHRvIGFjdGl2YXRlJ1xuICAgIGNvbW1hbmQucHVzaCAndGVsbCBhcHBsaWNhdGlvbiBcImlUZXJtXCInXG4gICAgY29tbWFuZC5wdXNoICcgIHRlbGwgdGhlIGN1cnJlbnQgd2luZG93J1xuICAgIGNvbW1hbmQucHVzaCAnICAgIHRlbGwgY3VycmVudCBzZXNzaW9uJ1xuICAgIGNvbW1hbmQucHVzaCAnICAgICAgd3JpdGUgdGV4dCBjb2RlJ1xuICAgIGNvbW1hbmQucHVzaCAnICAgIGVuZCB0ZWxsJ1xuICAgIGNvbW1hbmQucHVzaCAnICBlbmQgdGVsbCdcbiAgICBjb21tYW5kLnB1c2ggJ2VuZCB0ZWxsJ1xuICAgIGNvbW1hbmQgPSBjb21tYW5kLmpvaW4oJ1xcbicpXG4gICAgb3Nhc2NyaXB0LmV4ZWN1dGUgY29tbWFuZCwge2NvZGU6IHNlbGVjdGlvbn0sIChlcnJvciwgcmVzdWx0LCByYXcpIC0+XG4gICAgICAgIGlmIGVycm9yIHRoZW4gY29uc29sZS5lcnJvcihlcnJvcilcblxuXG4gIGdub21ldGVybWluYWw6IChzZWxlY3Rpb24pIC0+XG4gICAgY2hpbGRfcHJvY2Vzcy5leGVjU3luYyggJ3hkb3Rvb2wgd2luZG93YWN0aXZhdGUgJytpZFRlcm1pbmFsIClcbiAgICBjaGlsZF9wcm9jZXNzLmV4ZWNTeW5jKCAneGRvdG9vbCB0eXBlIC0tZGVsYXkgMTAgLS1jbGVhcm1vZGlmaWVycyBcIicrc2VsZWN0aW9uKydcIicgKVxuICAgIGNoaWxkX3Byb2Nlc3MuZXhlY1N5bmMoICd4ZG90b29sIGtleSAtLWNsZWFybW9kaWZpZXJzIFJldHVybicgKVxuICAgIGlmICFhdG9tLmNvbmZpZy5nZXQgJ2lweXRob24tZXhlYy5mb2N1c09uVGVybWluYWwnXG4gICAgICAgIGNoaWxkX3Byb2Nlc3MuZXhlY1N5bmMoICd4ZG90b29sIHdpbmRvd2FjdGl2YXRlICcraWRBdG9tIClcbiJdfQ==
