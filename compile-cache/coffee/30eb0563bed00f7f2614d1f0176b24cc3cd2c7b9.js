
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  "use strict";
  var Beautifier, Sqlformat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Sqlformat = (function(superClass) {
    extend(Sqlformat, superClass);

    function Sqlformat() {
      return Sqlformat.__super__.constructor.apply(this, arguments);
    }

    Sqlformat.prototype.name = "sqlformat";

    Sqlformat.prototype.link = "https://github.com/andialbrecht/sqlparse";

    Sqlformat.prototype.isPreInstalled = false;

    Sqlformat.prototype.options = {
      SQL: true
    };

    Sqlformat.prototype.beautify = function(text, language, options) {
      return this.run("sqlformat", [this.tempFile("input", text), "--reindent", options.indent_size != null ? "--indent_width=" + options.indent_size : void 0, (options.keywords != null) && options.keywords !== 'unchanged' ? "--keywords=" + options.keywords : void 0, (options.identifiers != null) && options.identifiers !== 'unchanged' ? "--identifiers=" + options.identifiers : void 0], {
        help: {
          link: "https://github.com/andialbrecht/sqlparse"
        }
      });
    };

    return Sqlformat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9zcWxmb3JtYXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHFCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUNOLGNBQUEsR0FBZ0I7O3dCQUVoQixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQUssSUFERTs7O3dCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQWtCLENBQ2hCLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURnQixFQUVoQixZQUZnQixFQUcyQiwyQkFBM0MsR0FBQSxpQkFBQSxHQUFrQixPQUFPLENBQUMsV0FBMUIsR0FBQSxNQUhnQixFQUlxQiwwQkFBQSxJQUFxQixPQUFPLENBQUMsUUFBUixLQUFvQixXQUE5RSxHQUFBLGFBQUEsR0FBYyxPQUFPLENBQUMsUUFBdEIsR0FBQSxNQUpnQixFQUsyQiw2QkFBQSxJQUF3QixPQUFPLENBQUMsV0FBUixLQUF1QixXQUExRixHQUFBLGdCQUFBLEdBQWlCLE9BQU8sQ0FBQyxXQUF6QixHQUFBLE1BTGdCLENBQWxCLEVBTUs7UUFBQSxJQUFBLEVBQU07VUFDUCxJQUFBLEVBQU0sMENBREM7U0FBTjtPQU5MO0lBRFE7Ozs7S0FUNkI7QUFQekMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2FuZGlhbGJyZWNodC9zcWxwYXJzZVxyXG4jIyNcclxuXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTcWxmb3JtYXQgZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgbmFtZTogXCJzcWxmb3JtYXRcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2FuZGlhbGJyZWNodC9zcWxwYXJzZVwiXHJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXHJcblxyXG4gIG9wdGlvbnM6IHtcclxuICAgIFNRTDogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIEBydW4oXCJzcWxmb3JtYXRcIiwgW1xyXG4gICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxyXG4gICAgICBcIi0tcmVpbmRlbnRcIlxyXG4gICAgICBcIi0taW5kZW50X3dpZHRoPSN7b3B0aW9ucy5pbmRlbnRfc2l6ZX1cIiBpZiBvcHRpb25zLmluZGVudF9zaXplP1xyXG4gICAgICBcIi0ta2V5d29yZHM9I3tvcHRpb25zLmtleXdvcmRzfVwiIGlmIChvcHRpb25zLmtleXdvcmRzPyAmJiBvcHRpb25zLmtleXdvcmRzICE9ICd1bmNoYW5nZWQnKVxyXG4gICAgICBcIi0taWRlbnRpZmllcnM9I3tvcHRpb25zLmlkZW50aWZpZXJzfVwiIGlmIChvcHRpb25zLmlkZW50aWZpZXJzPyAmJiBvcHRpb25zLmlkZW50aWZpZXJzICE9ICd1bmNoYW5nZWQnKVxyXG4gICAgICBdLCBoZWxwOiB7XHJcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYW5kaWFsYnJlY2h0L3NxbHBhcnNlXCJcclxuICAgICAgfSlcclxuIl19
