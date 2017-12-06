(function() {
  "use strict";
  var Beautifier, Cljfmt, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  Beautifier = require('../beautifier');

  module.exports = Cljfmt = (function(superClass) {
    extend(Cljfmt, superClass);

    function Cljfmt() {
      return Cljfmt.__super__.constructor.apply(this, arguments);
    }

    Cljfmt.prototype.name = "cljfmt";

    Cljfmt.prototype.link = "https://github.com/snoe/node-cljfmt";

    Cljfmt.prototype.options = {
      Clojure: false
    };

    Cljfmt.prototype.beautify = function(text, language, options) {
      var cljfmt, formatPath;
      formatPath = path.resolve(__dirname, "fmt.edn");
      cljfmt = path.resolve(__dirname, "..", "..", "..", "node_modules/.bin/cljfmt");
      return this.tempFile("input", text).then((function(_this) {
        return function(filePath) {
          return _this.run(cljfmt, [filePath, "--edn=" + formatPath]).then(function() {
            return _this.readFile(filePath);
          });
        };
      })(this));
    };

    return Cljfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jbGpmbXQvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7OztFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7cUJBRXJCLElBQUEsR0FBTTs7cUJBQ04sSUFBQSxHQUFNOztxQkFFTixPQUFBLEdBQVM7TUFDUCxPQUFBLEVBQVMsS0FERjs7O3FCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsU0FBeEI7TUFDYixNQUFBLEdBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DLElBQXBDLEVBQTBDLDBCQUExQzthQUNULElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUF3QixDQUFDLElBQXpCLENBQThCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFEO2lCQUM1QixLQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxDQUNYLFFBRFcsRUFFWCxRQUFBLEdBQVcsVUFGQSxDQUFiLENBR0UsQ0FBQyxJQUhILENBR1EsU0FBQTttQkFDTixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7VUFETSxDQUhSO1FBRDRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQUhROzs7O0tBVDBCO0FBSnRDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcclxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENsamZtdCBleHRlbmRzIEJlYXV0aWZpZXJcclxuXHJcbiAgbmFtZTogXCJjbGpmbXRcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Nub2Uvbm9kZS1jbGpmbXRcIlxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBDbG9qdXJlOiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIGZvcm1hdFBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImZtdC5lZG5cIilcclxuICAgIGNsamZtdCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi5cIiwgXCIuLlwiLCBcIi4uXCIsIFwibm9kZV9tb2R1bGVzLy5iaW4vY2xqZm10XCIpXHJcbiAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KS50aGVuKChmaWxlUGF0aCkgPT5cclxuICAgICAgQHJ1bihjbGpmbXQsIFtcclxuICAgICAgICBmaWxlUGF0aCxcclxuICAgICAgICBcIi0tZWRuPVwiICsgZm9ybWF0UGF0aFxyXG4gICAgICBdKS50aGVuKD0+XHJcbiAgICAgICAgQHJlYWRGaWxlKGZpbGVQYXRoKSkpXHJcbiJdfQ==
