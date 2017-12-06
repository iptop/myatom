
/*
Requires https://www.gnu.org/software/emacs/
 */

(function() {
  "use strict";
  var Beautifier, FortranBeautifier, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  path = require("path");

  module.exports = FortranBeautifier = (function(superClass) {
    extend(FortranBeautifier, superClass);

    function FortranBeautifier() {
      return FortranBeautifier.__super__.constructor.apply(this, arguments);
    }

    FortranBeautifier.prototype.name = "Fortran Beautifier";

    FortranBeautifier.prototype.link = "https://www.gnu.org/software/emacs/";

    FortranBeautifier.prototype.executables = [
      {
        name: "Emacs",
        cmd: "emacs",
        homepage: "https://www.gnu.org/software/emacs/",
        installation: "https://www.gnu.org/software/emacs/",
        version: {
          parse: function(text) {
            return text.match(/Emacs (\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    FortranBeautifier.prototype.options = {
      Fortran: true
    };

    FortranBeautifier.prototype.beautify = function(text, language, options) {
      var args, emacs, emacs_path, emacs_script_path, tempFile;
      this.debug('fortran-beautifier', options);
      emacs = this.exe("emacs");
      emacs_path = options.emacs_path;
      emacs_script_path = options.emacs_script_path;
      if (!emacs_script_path) {
        emacs_script_path = path.resolve(__dirname, "emacs-fortran-formating-script.lisp");
      }
      this.debug('fortran-beautifier', 'emacs script path: ' + emacs_script_path);
      args = ['--batch', '-l', emacs_script_path, '-f', 'f90-batch-indent-region', tempFile = this.tempFile("temp", text)];
      if (emacs_path) {
        this.deprecateOptionForExecutable("Emacs", "emacs_path", "Path");
        return this.run(emacs_path, args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      } else {
        return emacs.run(args, {
          ignoreReturnCode: false
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return FortranBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9mb3J0cmFuLWJlYXV0aWZpZXIvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG1DQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7Z0NBQ3JCLElBQUEsR0FBTTs7Z0NBQ04sSUFBQSxHQUFNOztnQ0FDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxPQURSO1FBRUUsR0FBQSxFQUFLLE9BRlA7UUFHRSxRQUFBLEVBQVUscUNBSFo7UUFJRSxZQUFBLEVBQWMscUNBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLHVCQUFYLENBQW9DLENBQUEsQ0FBQTtVQUE5QyxDQURBO1NBTFg7T0FEVzs7O2dDQVliLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUyxJQURGOzs7Z0NBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxvQkFBUCxFQUE2QixPQUE3QjtNQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUw7TUFFUixVQUFBLEdBQWEsT0FBTyxDQUFDO01BQ3JCLGlCQUFBLEdBQW9CLE9BQU8sQ0FBQztNQUU1QixJQUFHLENBQUksaUJBQVA7UUFDRSxpQkFBQSxHQUFvQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IscUNBQXhCLEVBRHRCOztNQUdBLElBQUMsQ0FBQSxLQUFELENBQU8sb0JBQVAsRUFBNkIscUJBQUEsR0FBd0IsaUJBQXJEO01BRUEsSUFBQSxHQUFPLENBQ0wsU0FESyxFQUVMLElBRkssRUFHTCxpQkFISyxFQUlMLElBSkssRUFLTCx5QkFMSyxFQU1MLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FOTjtNQVNQLElBQUcsVUFBSDtRQUNFLElBQUMsQ0FBQSw0QkFBRCxDQUE4QixPQUE5QixFQUF1QyxZQUF2QyxFQUFxRCxNQUFyRDtlQUNBLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFpQixJQUFqQixFQUF1QjtVQUFDLGdCQUFBLEVBQWtCLEtBQW5CO1NBQXZCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUixFQUZGO09BQUEsTUFBQTtlQU9FLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixFQUFnQjtVQUFDLGdCQUFBLEVBQWtCLEtBQW5CO1NBQWhCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFESTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUixFQVBGOztJQXJCUTs7OztLQW5CcUM7QUFSakQiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuUmVxdWlyZXMgaHR0cHM6Ly93d3cuZ251Lm9yZy9zb2Z0d2FyZS9lbWFjcy9cclxuIyMjXHJcblxyXG5cInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXHJcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGb3J0cmFuQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcIkZvcnRyYW4gQmVhdXRpZmllclwiXHJcbiAgbGluazogXCJodHRwczovL3d3dy5nbnUub3JnL3NvZnR3YXJlL2VtYWNzL1wiXHJcbiAgZXhlY3V0YWJsZXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJFbWFjc1wiXHJcbiAgICAgIGNtZDogXCJlbWFjc1wiXHJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXCJcclxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vd3d3LmdudS5vcmcvc29mdHdhcmUvZW1hY3MvXCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvRW1hY3MgKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBGb3J0cmFuOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCBvcHRpb25zKVxyXG4gICAgZW1hY3MgPSBAZXhlKFwiZW1hY3NcIilcclxuXHJcbiAgICBlbWFjc19wYXRoID0gb3B0aW9ucy5lbWFjc19wYXRoXHJcbiAgICBlbWFjc19zY3JpcHRfcGF0aCA9IG9wdGlvbnMuZW1hY3Nfc2NyaXB0X3BhdGhcclxuXHJcbiAgICBpZiBub3QgZW1hY3Nfc2NyaXB0X3BhdGhcclxuICAgICAgZW1hY3Nfc2NyaXB0X3BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImVtYWNzLWZvcnRyYW4tZm9ybWF0aW5nLXNjcmlwdC5saXNwXCIpXHJcblxyXG4gICAgQGRlYnVnKCdmb3J0cmFuLWJlYXV0aWZpZXInLCAnZW1hY3Mgc2NyaXB0IHBhdGg6ICcgKyBlbWFjc19zY3JpcHRfcGF0aClcclxuXHJcbiAgICBhcmdzID0gW1xyXG4gICAgICAnLS1iYXRjaCdcclxuICAgICAgJy1sJ1xyXG4gICAgICBlbWFjc19zY3JpcHRfcGF0aFxyXG4gICAgICAnLWYnXHJcbiAgICAgICdmOTAtYmF0Y2gtaW5kZW50LXJlZ2lvbidcclxuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXHJcbiAgICAgIF1cclxuXHJcbiAgICBpZiBlbWFjc19wYXRoXHJcbiAgICAgIEBkZXByZWNhdGVPcHRpb25Gb3JFeGVjdXRhYmxlKFwiRW1hY3NcIiwgXCJlbWFjc19wYXRoXCIsIFwiUGF0aFwiKVxyXG4gICAgICBAcnVuKGVtYWNzX3BhdGgsIGFyZ3MsIHtpZ25vcmVSZXR1cm5Db2RlOiBmYWxzZX0pXHJcbiAgICAgICAgLnRoZW4oPT5cclxuICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcclxuICAgICAgICApXHJcbiAgICBlbHNlXHJcbiAgICAgIGVtYWNzLnJ1bihhcmdzLCB7aWdub3JlUmV0dXJuQ29kZTogZmFsc2V9KVxyXG4gICAgICAgIC50aGVuKD0+XHJcbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXHJcbiAgICAgICAgKVxyXG4iXX0=
