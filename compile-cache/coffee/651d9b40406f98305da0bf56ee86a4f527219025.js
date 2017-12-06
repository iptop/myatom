
/*
Requires https://github.com/jaspervdj/stylish-haskell
 */

(function() {
  "use strict";
  var Beautifier, Crystal,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Crystal = (function(superClass) {
    extend(Crystal, superClass);

    function Crystal() {
      return Crystal.__super__.constructor.apply(this, arguments);
    }

    Crystal.prototype.name = "Crystal";

    Crystal.prototype.link = "http://crystal-lang.org";

    Crystal.prototype.executables = [
      {
        name: "Crystal",
        cmd: "crystal",
        homepage: "http://crystal-lang.org",
        installation: "https://crystal-lang.org/docs/installation/",
        version: {
          parse: function(text) {
            return text.match(/Crystal (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/crystal"
        }
      }
    ];

    Crystal.prototype.options = {
      Crystal: false
    };

    Crystal.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.exe("crystal").run(['tool', 'format', tempFile = this.tempFile("temp", text)], {
        ignoreReturnCode: true
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return Crystal;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jcnlzdGFsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxtQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBQ3JCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxTQURSO1FBRUUsR0FBQSxFQUFLLFNBRlA7UUFHRSxRQUFBLEVBQVUseUJBSFo7UUFJRSxZQUFBLEVBQWMsNkNBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLHlCQUFYLENBQXNDLENBQUEsQ0FBQTtVQUFoRCxDQURBO1NBTFg7UUFRRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8scUJBREQ7U0FSVjtPQURXOzs7c0JBZWIsT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLEtBREY7OztzQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7YUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsQ0FBZSxDQUFDLEdBQWhCLENBQW9CLENBQ2xCLE1BRGtCLEVBRWxCLFFBRmtCLEVBR2xCLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FITyxDQUFwQixFQUlLO1FBQUMsZ0JBQUEsRUFBa0IsSUFBbkI7T0FKTCxDQUtFLENBQUMsSUFMSCxDQUtRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUjtJQURROzs7O0tBdEIyQjtBQVB2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vamFzcGVydmRqL3N0eWxpc2gtaGFza2VsbFxyXG4jIyNcclxuXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDcnlzdGFsIGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiQ3J5c3RhbFwiXHJcbiAgbGluazogXCJodHRwOi8vY3J5c3RhbC1sYW5nLm9yZ1wiXHJcbiAgZXhlY3V0YWJsZXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJDcnlzdGFsXCJcclxuICAgICAgY21kOiBcImNyeXN0YWxcIlxyXG4gICAgICBob21lcGFnZTogXCJodHRwOi8vY3J5c3RhbC1sYW5nLm9yZ1wiXHJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2NyeXN0YWwtbGFuZy5vcmcvZG9jcy9pbnN0YWxsYXRpb24vXCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvQ3J5c3RhbCAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXHJcbiAgICAgIH1cclxuICAgICAgZG9ja2VyOiB7XHJcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvY3J5c3RhbFwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdXHJcblxyXG4gIG9wdGlvbnM6IHtcclxuICAgIENyeXN0YWw6IGZhbHNlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgQGV4ZShcImNyeXN0YWxcIikucnVuKFtcclxuICAgICAgJ3Rvb2wnLFxyXG4gICAgICAnZm9ybWF0JyxcclxuICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXHJcbiAgICAgIF0sIHtpZ25vcmVSZXR1cm5Db2RlOiB0cnVlfSlcclxuICAgICAgLnRoZW4oPT5cclxuICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXHJcbiAgICAgIClcclxuIl19
