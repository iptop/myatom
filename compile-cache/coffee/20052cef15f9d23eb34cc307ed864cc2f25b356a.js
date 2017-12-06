
/*
Requires http://golang.org/cmd/gofmt/
 */

(function() {
  "use strict";
  var Beautifier, Gofmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Gofmt = (function(superClass) {
    extend(Gofmt, superClass);

    function Gofmt() {
      return Gofmt.__super__.constructor.apply(this, arguments);
    }

    Gofmt.prototype.name = "gofmt";

    Gofmt.prototype.link = "https://golang.org/cmd/gofmt/";

    Gofmt.prototype.isPreInstalled = false;

    Gofmt.prototype.options = {
      Go: true
    };

    Gofmt.prototype.beautify = function(text, language, options) {
      return this.run("gofmt", [this.tempFile("input", text)]);
    };

    return Gofmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9nb2ZtdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsaUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O29CQUNyQixJQUFBLEdBQU07O29CQUNOLElBQUEsR0FBTTs7b0JBQ04sY0FBQSxHQUFnQjs7b0JBRWhCLE9BQUEsR0FBUztNQUNQLEVBQUEsRUFBSSxJQURHOzs7b0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsRUFBYyxDQUNaLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURZLENBQWQ7SUFEUTs7OztLQVR5QjtBQVByQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG5SZXF1aXJlcyBodHRwOi8vZ29sYW5nLm9yZy9jbWQvZ29mbXQvXHJcbiMjI1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdvZm10IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiZ29mbXRcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9nb2xhbmcub3JnL2NtZC9nb2ZtdC9cIlxyXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBHbzogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIEBydW4oXCJnb2ZtdFwiLCBbXHJcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXHJcbiAgICAgIF0pXHJcbiJdfQ==
