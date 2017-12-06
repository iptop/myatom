
/*
 */

(function() {
  var Beautifier, Lua, format, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  format = require('./beautifier');

  module.exports = Lua = (function(superClass) {
    extend(Lua, superClass);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "Lua beautifier";

    Lua.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/lua-beautifier/beautifier.coffee";

    Lua.prototype.options = {
      Lua: true
    };

    Lua.prototype.beautify = function(text, language, options) {
      options.eol = this.getDefaultLineEnding('\r\n', '\n', options.end_of_line);
      return new this.Promise(function(resolve, reject) {
        var error;
        try {
          return resolve(format(text, options.indent_char.repeat(options.indent_size), this.warn, options));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9sdWEtYmVhdXRpZmllci9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7QUFBQTtBQUFBLE1BQUEsNkJBQUE7SUFBQTs7O0VBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQOztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixNQUFBLEdBQVMsT0FBQSxDQUFRLGNBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7a0JBQ3JCLElBQUEsR0FBTTs7a0JBQ04sSUFBQSxHQUFNOztrQkFFTixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQUssSUFERTs7O2tCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO01BQ1IsT0FBTyxDQUFDLEdBQVIsR0FBYyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBNkIsSUFBN0IsRUFBa0MsT0FBTyxDQUFDLFdBQTFDO2FBQ1YsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDWCxZQUFBO0FBQUE7aUJBQ0UsT0FBQSxDQUFRLE1BQUEsQ0FBTyxJQUFQLEVBQWEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFwQixDQUEyQixPQUFPLENBQUMsV0FBbkMsQ0FBYixFQUE4RCxJQUFDLENBQUEsSUFBL0QsRUFBcUUsT0FBckUsQ0FBUixFQURGO1NBQUEsY0FBQTtVQUVNO2lCQUNKLE1BQUEsQ0FBTyxLQUFQLEVBSEY7O01BRFcsQ0FBVDtJQUZJOzs7O0tBUnVCO0FBUm5DIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcbiMjI1xyXG5wYXRoID0gcmVxdWlyZShcInBhdGhcIilcclxuXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcclxuZm9ybWF0ID0gcmVxdWlyZSAnLi9iZWF1dGlmaWVyJ1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMdWEgZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgbmFtZTogXCJMdWEgYmVhdXRpZmllclwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvYmxvYi9tYXN0ZXIvc3JjL2JlYXV0aWZpZXJzL2x1YS1iZWF1dGlmaWVyL2JlYXV0aWZpZXIuY29mZmVlXCJcclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgTHVhOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgb3B0aW9ucy5lb2wgPSBAZ2V0RGVmYXVsdExpbmVFbmRpbmcoJ1xcclxcbicsJ1xcbicsb3B0aW9ucy5lbmRfb2ZfbGluZSlcclxuICAgIG5ldyBAUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgICB0cnlcclxuICAgICAgICByZXNvbHZlIGZvcm1hdCB0ZXh0LCBvcHRpb25zLmluZGVudF9jaGFyLnJlcGVhdChvcHRpb25zLmluZGVudF9zaXplKSwgQHdhcm4sIG9wdGlvbnNcclxuICAgICAgY2F0Y2ggZXJyb3JcclxuICAgICAgICByZWplY3QgZXJyb3JcclxuIl19
