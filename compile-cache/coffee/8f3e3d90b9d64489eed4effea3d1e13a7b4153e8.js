
/*
Requires https://github.com/avh4/elm-format
 */

(function() {
  "use strict";
  var Beautifier, ElmFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ElmFormat = (function(superClass) {
    extend(ElmFormat, superClass);

    function ElmFormat() {
      return ElmFormat.__super__.constructor.apply(this, arguments);
    }

    ElmFormat.prototype.name = "elm-format";

    ElmFormat.prototype.link = "https://github.com/avh4/elm-format";

    ElmFormat.prototype.executables = [
      {
        name: "elm-format",
        cmd: "elm-format",
        homepage: "https://github.com/avh4/elm-format",
        installation: "https://github.com/avh4/elm-format#installation-",
        version: {
          args: ['--help'],
          parse: function(text) {
            try {
              return text.match(/elm-format-\d+.\d+ (\d+\.\d+\.\d+)/)[1];
            } catch (error) {
              return text.match(/elm-format (\d+\.\d+\.\d+)/)[1];
            }
          }
        },
        docker: {
          image: "unibeautify/elm-format"
        }
      }
    ];

    ElmFormat.prototype.options = {
      Elm: true
    };

    ElmFormat.prototype.beautify = function(text, language, options) {
      var tempfile;
      return tempfile = this.tempFile("input", text, ".elm").then((function(_this) {
        return function(name) {
          return _this.exe("elm-format").run(['--yes', name]).then(function() {
            return _this.readFile(name);
          });
        };
      })(this));
    };

    return ElmFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9lbG0tZm9ybWF0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQSxxQkFBQTtJQUFBOzs7RUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7d0JBQ3JCLElBQUEsR0FBTTs7d0JBQ04sSUFBQSxHQUFNOzt3QkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxZQURSO1FBRUUsR0FBQSxFQUFLLFlBRlA7UUFHRSxRQUFBLEVBQVUsb0NBSFo7UUFJRSxZQUFBLEVBQWMsa0RBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsSUFBQSxFQUFNLENBQUMsUUFBRCxDQURDO1VBRVAsS0FBQSxFQUFPLFNBQUMsSUFBRDtBQUNMO0FBQ0UscUJBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxvQ0FBWCxDQUFpRCxDQUFBLENBQUEsRUFEMUQ7YUFBQSxhQUFBO0FBR0UscUJBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyw0QkFBWCxDQUF5QyxDQUFBLENBQUEsRUFIbEQ7O1VBREssQ0FGQTtTQUxYO1FBYUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLHdCQUREO1NBYlY7T0FEVzs7O3dCQW9CYixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQUssSUFERTs7O3dCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsRUFBeUIsTUFBekIsQ0FDWCxDQUFDLElBRFUsQ0FDTCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFDSixLQUFDLENBQUEsR0FBRCxDQUFLLFlBQUwsQ0FDRSxDQUFDLEdBREgsQ0FDTyxDQUNILE9BREcsRUFFSCxJQUZHLENBRFAsQ0FLRSxDQUFDLElBTEgsQ0FLUSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsSUFBVjtVQURJLENBTFI7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FESztJQURIOzs7O0tBM0I2QjtBQU56QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0XHJcbiMjI1xyXG5cInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRWxtRm9ybWF0IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiZWxtLWZvcm1hdFwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYXZoNC9lbG0tZm9ybWF0XCJcclxuICBleGVjdXRhYmxlczogW1xyXG4gICAge1xyXG4gICAgICBuYW1lOiBcImVsbS1mb3JtYXRcIlxyXG4gICAgICBjbWQ6IFwiZWxtLWZvcm1hdFwiXHJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hdmg0L2VsbS1mb3JtYXRcIlxyXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9naXRodWIuY29tL2F2aDQvZWxtLWZvcm1hdCNpbnN0YWxsYXRpb24tXCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIGFyZ3M6IFsnLS1oZWxwJ11cclxuICAgICAgICBwYXJzZTogKHRleHQpIC0+XHJcbiAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgcmV0dXJuIHRleHQubWF0Y2goL2VsbS1mb3JtYXQtXFxkKy5cXGQrIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cclxuICAgICAgICAgIGNhdGNoXHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0Lm1hdGNoKC9lbG0tZm9ybWF0IChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cclxuICAgICAgfVxyXG4gICAgICBkb2NrZXI6IHtcclxuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9lbG0tZm9ybWF0XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIF1cclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgRWxtOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgdGVtcGZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0LCBcIi5lbG1cIilcclxuICAgIC50aGVuIChuYW1lKSA9PlxyXG4gICAgICBAZXhlKFwiZWxtLWZvcm1hdFwiKVxyXG4gICAgICAgIC5ydW4oW1xyXG4gICAgICAgICAgJy0teWVzJyxcclxuICAgICAgICAgIG5hbWVcclxuICAgICAgICBdKVxyXG4gICAgICAgIC50aGVuICgpID0+XHJcbiAgICAgICAgICBAcmVhZEZpbGUobmFtZSlcclxuIl19
