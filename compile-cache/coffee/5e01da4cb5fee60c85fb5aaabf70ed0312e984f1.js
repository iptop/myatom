
/*
Requires https://github.com/google/yapf
 */

(function() {
  "use strict";
  var Beautifier, Yapf,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Yapf = (function(superClass) {
    extend(Yapf, superClass);

    function Yapf() {
      return Yapf.__super__.constructor.apply(this, arguments);
    }

    Yapf.prototype.name = "yapf";

    Yapf.prototype.link = "https://github.com/google/yapf";

    Yapf.prototype.isPreInstalled = false;

    Yapf.prototype.options = {
      Python: false
    };

    Yapf.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("yapf", ["-i", tempFile = this.tempFile("input", text)], {
        help: {
          link: "https://github.com/google/yapf"
        },
        ignoreReturnCode: true
      }).then((function(_this) {
        return function() {
          var editor, filePath, projectPath;
          if (options.sort_imports) {
            editor = atom.workspace.getActiveTextEditor();
            filePath = editor.getPath();
            projectPath = atom.project.relativizePath(filePath)[0];
            return _this.run("isort", ["-sp", projectPath, tempFile], {
              help: {
                link: "https://github.com/timothycrosley/isort"
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.readFile(tempFile);
          }
        };
      })(this));
    };

    return Yapf;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy95YXBmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxnQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7bUJBRXJCLElBQUEsR0FBTTs7bUJBQ04sSUFBQSxHQUFNOzttQkFDTixjQUFBLEdBQWdCOzttQkFFaEIsT0FBQSxHQUFTO01BQ1AsTUFBQSxFQUFRLEtBREQ7OzttQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7YUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxDQUNYLElBRFcsRUFFWCxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRkEsQ0FBYixFQUdLO1FBQUEsSUFBQSxFQUFNO1VBQ1AsSUFBQSxFQUFNLGdDQURDO1NBQU47UUFFQSxnQkFBQSxFQUFrQixJQUZsQjtPQUhMLENBTUUsQ0FBQyxJQU5ILENBTVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ0osY0FBQTtVQUFBLElBQUcsT0FBTyxDQUFDLFlBQVg7WUFDRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1lBQ1QsUUFBQSxHQUFXLE1BQU0sQ0FBQyxPQUFQLENBQUE7WUFDWCxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQXNDLENBQUEsQ0FBQTttQkFFcEQsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQ0UsQ0FBQyxLQUFELEVBQVEsV0FBUixFQUFxQixRQUFyQixDQURGLEVBRUU7Y0FBQSxJQUFBLEVBQU07Z0JBQ0osSUFBQSxFQUFNLHlDQURGO2VBQU47YUFGRixDQUtBLENBQUMsSUFMRCxDQUtNLFNBQUE7cUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1lBREksQ0FMTixFQUxGO1dBQUEsTUFBQTttQkFjRSxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFkRjs7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOUjtJQURROzs7O0tBVndCO0FBUHBDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUveWFwZlxyXG4jIyNcclxuXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBZYXBmIGV4dGVuZHMgQmVhdXRpZmllclxyXG5cclxuICBuYW1lOiBcInlhcGZcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS95YXBmXCJcclxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgUHl0aG9uOiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIEBydW4oXCJ5YXBmXCIsIFtcclxuICAgICAgXCItaVwiXHJcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcclxuICAgICAgXSwgaGVscDoge1xyXG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS95YXBmXCJcclxuICAgICAgfSwgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZSlcclxuICAgICAgLnRoZW4oPT5cclxuICAgICAgICBpZiBvcHRpb25zLnNvcnRfaW1wb3J0c1xyXG4gICAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcbiAgICAgICAgICBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcclxuICAgICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxyXG5cclxuICAgICAgICAgIEBydW4oXCJpc29ydFwiLFxyXG4gICAgICAgICAgICBbXCItc3BcIiwgcHJvamVjdFBhdGgsIHRlbXBGaWxlXSxcclxuICAgICAgICAgICAgaGVscDoge1xyXG4gICAgICAgICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RpbW90aHljcm9zbGV5L2lzb3J0XCJcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbig9PlxyXG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxyXG4gICAgICApXHJcbiJdfQ==
