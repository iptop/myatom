
/*
Requires https://github.com/threedaymonk/htmlbeautifier
 */

(function() {
  "use strict";
  var Beautifier, HTMLBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = HTMLBeautifier = (function(superClass) {
    extend(HTMLBeautifier, superClass);

    function HTMLBeautifier() {
      return HTMLBeautifier.__super__.constructor.apply(this, arguments);
    }

    HTMLBeautifier.prototype.name = "HTML Beautifier";

    HTMLBeautifier.prototype.link = "https://github.com/threedaymonk/htmlbeautifier";

    HTMLBeautifier.prototype.isPreInstalled = false;

    HTMLBeautifier.prototype.options = {
      ERB: {
        indent_size: true
      }
    };

    HTMLBeautifier.prototype.beautify = function(text, language, options) {
      var tempFile;
      console.log('erb', options);
      return this.run("htmlbeautifier", ["--tab-stops", options.indent_size, tempFile = this.tempFile("temp", text)]).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return HTMLBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9odG1sYmVhdXRpZmllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsMEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzZCQUNyQixJQUFBLEdBQU07OzZCQUNOLElBQUEsR0FBTTs7NkJBQ04sY0FBQSxHQUFnQjs7NkJBRWhCLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO09BRks7Ozs2QkFLVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVosRUFBbUIsT0FBbkI7YUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLLGdCQUFMLEVBQXVCLENBQ3JCLGFBRHFCLEVBQ04sT0FBTyxDQUFDLFdBREYsRUFFckIsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixDQUZVLENBQXZCLENBSUUsQ0FBQyxJQUpILENBSVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpSO0lBRlE7Ozs7S0FWa0M7QUFQOUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL3RocmVlZGF5bW9uay9odG1sYmVhdXRpZmllclxyXG4jIyNcclxuXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIVE1MQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcIkhUTUwgQmVhdXRpZmllclwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vdGhyZWVkYXltb25rL2h0bWxiZWF1dGlmaWVyXCJcclxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgRVJCOlxyXG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIGNvbnNvbGUubG9nKCdlcmInLCBvcHRpb25zKVxyXG4gICAgQHJ1bihcImh0bWxiZWF1dGlmaWVyXCIsIFtcclxuICAgICAgXCItLXRhYi1zdG9wc1wiLCBvcHRpb25zLmluZGVudF9zaXplXHJcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxyXG4gICAgICBdKVxyXG4gICAgICAudGhlbig9PlxyXG4gICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcclxuICAgICAgKVxyXG4iXX0=
