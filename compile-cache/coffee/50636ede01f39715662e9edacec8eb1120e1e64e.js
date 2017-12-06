
/*
Requires [formatR](https://github.com/yihui/formatR)
 */

(function() {
  var Beautifier, R, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  module.exports = R = (function(superClass) {
    extend(R, superClass);

    function R() {
      return R.__super__.constructor.apply(this, arguments);
    }

    R.prototype.name = "formatR";

    R.prototype.link = "https://github.com/yihui/formatR";

    R.prototype.executables = [
      {
        name: "Rscript",
        cmd: "rscript",
        homepage: "https://github.com/yihui/formatR",
        installation: "https://github.com/yihui/formatR",
        version: {
          parse: function(text) {
            return text.match(/version (\d+\.\d+\.\d+) /)[1];
          },
          runOptions: {
            returnStderr: true
          }
        },
        docker: {
          image: "unibeautify/rscript"
        }
      }
    ];

    R.prototype.options = {
      R: true
    };

    R.prototype.beautify = function(text, language, options) {
      var r_beautifier, rscript;
      rscript = this.exe("rscript");
      r_beautifier = path.resolve(__dirname, "formatR.r");
      return rscript.run([r_beautifier, options.indent_size, this.tempFile("input", text)]);
    };

    return R;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9mb3JtYXRSL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtBQUFBLE1BQUEsbUJBQUE7SUFBQTs7O0VBR0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQOztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztnQkFDckIsSUFBQSxHQUFNOztnQkFDTixJQUFBLEdBQU07O2dCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLFNBRFI7UUFFRSxHQUFBLEVBQUssU0FGUDtRQUdFLFFBQUEsRUFBVSxrQ0FIWjtRQUlFLFlBQUEsRUFBYyxrQ0FKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsMEJBQVgsQ0FBdUMsQ0FBQSxDQUFBO1VBQWpELENBREE7VUFFUCxVQUFBLEVBQVk7WUFDVixZQUFBLEVBQWMsSUFESjtXQUZMO1NBTFg7UUFXRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8scUJBREQ7U0FYVjtPQURXOzs7Z0JBa0JiLE9BQUEsR0FBUztNQUNQLENBQUEsRUFBRyxJQURJOzs7Z0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTDtNQUNWLFlBQUEsR0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsV0FBeEI7YUFDZixPQUFPLENBQUMsR0FBUixDQUFZLENBQ1YsWUFEVSxFQUVWLE9BQU8sQ0FBQyxXQUZFLEVBR1YsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBSFUsQ0FBWjtJQUhROzs7O0tBekJxQjtBQVJqQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG5SZXF1aXJlcyBbZm9ybWF0Ul0oaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFIpXHJcbiMjI1xyXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcclxuXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUiBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcImZvcm1hdFJcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFJcIlxyXG4gIGV4ZWN1dGFibGVzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwiUnNjcmlwdFwiXHJcbiAgICAgIGNtZDogXCJyc2NyaXB0XCJcclxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFJcIlxyXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9naXRodWIuY29tL3lpaHVpL2Zvcm1hdFJcIlxyXG4gICAgICB2ZXJzaW9uOiB7XHJcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC92ZXJzaW9uIChcXGQrXFwuXFxkK1xcLlxcZCspIC8pWzFdXHJcbiAgICAgICAgcnVuT3B0aW9uczoge1xyXG4gICAgICAgICAgcmV0dXJuU3RkZXJyOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGRvY2tlcjoge1xyXG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L3JzY3JpcHRcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBSOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgcnNjcmlwdCA9IEBleGUoXCJyc2NyaXB0XCIpXHJcbiAgICByX2JlYXV0aWZpZXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImZvcm1hdFIuclwiKVxyXG4gICAgcnNjcmlwdC5ydW4oW1xyXG4gICAgICByX2JlYXV0aWZpZXIsXHJcbiAgICAgIG9wdGlvbnMuaW5kZW50X3NpemUsXHJcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpLFxyXG4gICAgXSlcclxuIl19
