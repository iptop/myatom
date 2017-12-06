(function() {
  "use strict";
  var Beautifier, ESLintFixer, Path, allowUnsafeNewFunction,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  Path = require('path');

  allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

  module.exports = ESLintFixer = (function(superClass) {
    extend(ESLintFixer, superClass);

    function ESLintFixer() {
      return ESLintFixer.__super__.constructor.apply(this, arguments);
    }

    ESLintFixer.prototype.name = "ESLint Fixer";

    ESLintFixer.prototype.link = "https://github.com/eslint/eslint";

    ESLintFixer.prototype.options = {
      JavaScript: false
    };

    ESLintFixer.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var editor, filePath, projectPath, result;
        editor = atom.workspace.getActiveTextEditor();
        filePath = editor.getPath();
        projectPath = atom.project.relativizePath(filePath)[0];
        result = null;
        return allowUnsafeNewFunction(function() {
          var CLIEngine, cli, err, importPath;
          importPath = Path.join(projectPath, 'node_modules', 'eslint');
          try {
            CLIEngine = require(importPath).CLIEngine;
            cli = new CLIEngine({
              fix: true,
              cwd: projectPath
            });
            result = cli.executeOnText(text).results[0];
            return resolve(result.output);
          } catch (error) {
            err = error;
            return reject(err);
          }
        });
      });
    };

    return ESLintFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9lc2xpbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7OztFQUVBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ04seUJBQTBCLE9BQUEsQ0FBUSxVQUFSOztFQUUzQixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzswQkFDckIsSUFBQSxHQUFNOzswQkFDTixJQUFBLEdBQU07OzBCQUVOLE9BQUEsR0FBUztNQUNQLFVBQUEsRUFBWSxLQURMOzs7MEJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLFlBQUE7UUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1FBQ1QsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUE7UUFDWCxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQXNDLENBQUEsQ0FBQTtRQUVwRCxNQUFBLEdBQVM7ZUFDVCxzQkFBQSxDQUF1QixTQUFBO0FBQ3JCLGNBQUE7VUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLEVBQXVCLGNBQXZCLEVBQXVDLFFBQXZDO0FBQ2I7WUFDRSxTQUFBLEdBQVksT0FBQSxDQUFRLFVBQVIsQ0FBbUIsQ0FBQztZQUVoQyxHQUFBLEdBQVUsSUFBQSxTQUFBLENBQVU7Y0FBQSxHQUFBLEVBQUssSUFBTDtjQUFXLEdBQUEsRUFBSyxXQUFoQjthQUFWO1lBQ1YsTUFBQSxHQUFTLEdBQUcsQ0FBQyxhQUFKLENBQWtCLElBQWxCLENBQXVCLENBQUMsT0FBUSxDQUFBLENBQUE7bUJBRXpDLE9BQUEsQ0FBUSxNQUFNLENBQUMsTUFBZixFQU5GO1dBQUEsYUFBQTtZQU9NO21CQUNKLE1BQUEsQ0FBTyxHQUFQLEVBUkY7O1FBRnFCLENBQXZCO01BTmtCLENBQVQ7SUFESDs7OztLQVIrQjtBQU4zQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXHJcblxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuUGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxyXG57YWxsb3dVbnNhZmVOZXdGdW5jdGlvbn0gPSByZXF1aXJlICdsb29waG9sZSdcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRVNMaW50Rml4ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgbmFtZTogXCJFU0xpbnQgRml4ZXJcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VzbGludC9lc2xpbnRcIlxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBKYXZhU2NyaXB0OiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcbiAgICAgIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxyXG4gICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMF1cclxuXHJcbiAgICAgIHJlc3VsdCA9IG51bGxcclxuICAgICAgYWxsb3dVbnNhZmVOZXdGdW5jdGlvbiAtPlxyXG4gICAgICAgIGltcG9ydFBhdGggPSBQYXRoLmpvaW4ocHJvamVjdFBhdGgsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcclxuICAgICAgICB0cnlcclxuICAgICAgICAgIENMSUVuZ2luZSA9IHJlcXVpcmUoaW1wb3J0UGF0aCkuQ0xJRW5naW5lXHJcblxyXG4gICAgICAgICAgY2xpID0gbmV3IENMSUVuZ2luZShmaXg6IHRydWUsIGN3ZDogcHJvamVjdFBhdGgpXHJcbiAgICAgICAgICByZXN1bHQgPSBjbGkuZXhlY3V0ZU9uVGV4dCh0ZXh0KS5yZXN1bHRzWzBdXHJcblxyXG4gICAgICAgICAgcmVzb2x2ZSByZXN1bHQub3V0cHV0XHJcbiAgICAgICAgY2F0Y2ggZXJyXHJcbiAgICAgICAgICByZWplY3QoZXJyKVxyXG4gICAgKVxyXG4iXX0=
