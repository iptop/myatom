
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Beautifier, ErlTidy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ErlTidy = (function(superClass) {
    extend(ErlTidy, superClass);

    function ErlTidy() {
      return ErlTidy.__super__.constructor.apply(this, arguments);
    }

    ErlTidy.prototype.name = "erl_tidy";

    ErlTidy.prototype.link = "http://erlang.org/doc/man/erl_tidy.html";

    ErlTidy.prototype.isPreInstalled = false;

    ErlTidy.prototype.options = {
      Erlang: true
    };

    ErlTidy.prototype.beautify = function(text, language, options) {
      var tempFile;
      tempFile = void 0;
      return this.tempFile("input", text).then((function(_this) {
        return function(path) {
          tempFile = path;
          return _this.run("erl", [["-eval", 'erl_tidy:file("' + tempFile + '")'], ["-noshell", "-s", "init", "stop"]], {
            help: {
              link: "http://erlang.org/doc/man/erl_tidy.html"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return ErlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9lcmxfdGlkeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsbUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUVyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBQ04sY0FBQSxHQUFnQjs7c0JBRWhCLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7c0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsUUFBQSxHQUFXO2FBQ1gsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDNUIsUUFBQSxHQUFXO2lCQUNYLEtBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxFQUFZLENBQ1YsQ0FBQyxPQUFELEVBQVUsaUJBQUEsR0FBb0IsUUFBcEIsR0FBK0IsSUFBekMsQ0FEVSxFQUVWLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsTUFBbkIsRUFBMkIsTUFBM0IsQ0FGVSxDQUFaLEVBSUU7WUFBRSxJQUFBLEVBQU07Y0FBRSxJQUFBLEVBQU0seUNBQVI7YUFBUjtXQUpGO1FBRjRCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQVFDLENBQUMsSUFSRixDQVFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDTCxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFESztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FSUDtJQUZROzs7O0tBVjJCO0FBUHZDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcclxuIyMjXHJcblxyXG5cInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRXJsVGlkeSBleHRlbmRzIEJlYXV0aWZpZXJcclxuXHJcbiAgbmFtZTogXCJlcmxfdGlkeVwiXHJcbiAgbGluazogXCJodHRwOi8vZXJsYW5nLm9yZy9kb2MvbWFuL2VybF90aWR5Lmh0bWxcIlxyXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBFcmxhbmc6IHRydWVcclxuICB9XHJcblxyXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XHJcbiAgICB0ZW1wRmlsZSA9IHVuZGVmaW5lZFxyXG4gICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCkudGhlbigocGF0aCkgPT5cclxuICAgICAgdGVtcEZpbGUgPSBwYXRoXHJcbiAgICAgIEBydW4oXCJlcmxcIiwgW1xyXG4gICAgICAgIFtcIi1ldmFsXCIsICdlcmxfdGlkeTpmaWxlKFwiJyArIHRlbXBGaWxlICsgJ1wiKSddXHJcbiAgICAgICAgW1wiLW5vc2hlbGxcIiwgXCItc1wiLCBcImluaXRcIiwgXCJzdG9wXCJdXHJcbiAgICAgICAgXSxcclxuICAgICAgICB7IGhlbHA6IHsgbGluazogXCJodHRwOi8vZXJsYW5nLm9yZy9kb2MvbWFuL2VybF90aWR5Lmh0bWxcIiB9IH1cclxuICAgICAgICApXHJcbiAgICApLnRoZW4oPT5cclxuICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxyXG4gICAgKVxyXG4iXX0=
