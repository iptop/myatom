(function() {
  "use strict";
  var Beautifier, PugBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PugBeautify = (function(superClass) {
    extend(PugBeautify, superClass);

    function PugBeautify() {
      return PugBeautify.__super__.constructor.apply(this, arguments);
    }

    PugBeautify.prototype.name = "Pug Beautify";

    PugBeautify.prototype.link = "https://github.com/vingorius/pug-beautify";

    PugBeautify.prototype.options = {
      Jade: {
        fill_tab: [
          'indent_char', function(indent_char) {
            return indent_char === "\t";
          }
        ],
        omit_div: true,
        tab_size: "indent_size"
      }
    };

    PugBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var error, pugBeautify;
        pugBeautify = require("pug-beautify");
        try {
          return resolve(pugBeautify(text, options));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return PugBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9wdWctYmVhdXRpZnkuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzswQkFDckIsSUFBQSxHQUFNOzswQkFDTixJQUFBLEdBQU07OzBCQUNOLE9BQUEsR0FBUztNQUVQLElBQUEsRUFDRTtRQUFBLFFBQUEsRUFBVTtVQUFDLGFBQUQsRUFBZ0IsU0FBQyxXQUFEO0FBRXhCLG1CQUFRLFdBQUEsS0FBZTtVQUZDLENBQWhCO1NBQVY7UUFJQSxRQUFBLEVBQVUsSUFKVjtRQUtBLFFBQUEsRUFBVSxhQUxWO09BSEs7OzswQkFXVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUVSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsY0FBUjtBQUNkO2lCQUNFLE9BQUEsQ0FBUSxXQUFBLENBQVksSUFBWixFQUFrQixPQUFsQixDQUFSLEVBREY7U0FBQSxjQUFBO1VBRU07aUJBRUosTUFBQSxDQUFPLEtBQVAsRUFKRjs7TUFGa0IsQ0FBVDtJQUZIOzs7O0tBZCtCO0FBSDNDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFB1Z0JlYXV0aWZ5IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiUHVnIEJlYXV0aWZ5XCJcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS92aW5nb3JpdXMvcHVnLWJlYXV0aWZ5XCJcclxuICBvcHRpb25zOiB7XHJcbiAgICAjIEFwcGx5IHRoZXNlIG9wdGlvbnMgZmlyc3QgLyBnbG9iYWxseSwgZm9yIGFsbCBsYW5ndWFnZXNcclxuICAgIEphZGU6XHJcbiAgICAgIGZpbGxfdGFiOiBbJ2luZGVudF9jaGFyJywgKGluZGVudF9jaGFyKSAtPlxyXG4gICAgICAgICMgU2hvdWxkIHVzZSB0YWJzP1xyXG4gICAgICAgIHJldHVybiAoaW5kZW50X2NoYXIgaXMgXCJcXHRcIilcclxuICAgICAgXVxyXG4gICAgICBvbWl0X2RpdjogdHJ1ZVxyXG4gICAgICB0YWJfc2l6ZTogXCJpbmRlbnRfc2l6ZVwiXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG5cclxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgICAgcHVnQmVhdXRpZnkgPSByZXF1aXJlKFwicHVnLWJlYXV0aWZ5XCIpXHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHJlc29sdmUocHVnQmVhdXRpZnkodGV4dCwgb3B0aW9ucykpXHJcbiAgICAgIGNhdGNoIGVycm9yXHJcbiAgICAgICAgIyBFcnJvciBvY2N1cnJlZFxyXG4gICAgICAgIHJlamVjdChlcnJvcilcclxuICAgIClcclxuIl19
