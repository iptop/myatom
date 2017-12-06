(function() {
  "use strict";
  var Beautifier, VueBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = VueBeautifier = (function(superClass) {
    extend(VueBeautifier, superClass);

    function VueBeautifier() {
      return VueBeautifier.__super__.constructor.apply(this, arguments);
    }

    VueBeautifier.prototype.name = "Vue Beautifier";

    VueBeautifier.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/vue-beautifier.coffee";

    VueBeautifier.prototype.options = {
      Vue: true
    };

    VueBeautifier.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var _, prettydiff, regexp, results;
          prettydiff = require("prettydiff");
          _ = require('lodash');
          regexp = /(^<(template|script|style)[^>]*>)((\s|\S)*?)^<\/\2>/gim;
          results = text.replace(regexp, function(match, begin, type, text) {
            var beautifiedText, lang, ref, replaceText, result;
            lang = (ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? ref[1] : void 0;
            replaceText = text;
            text = text.trim();
            beautifiedText = ((function() {
              switch (type) {
                case "template":
                  switch (lang) {
                    case "pug":
                    case "jade":
                      return require("pug-beautify")(text, options);
                    case void 0:
                      return require("js-beautify").html(text, options);
                    default:
                      return void 0;
                  }
                  break;
                case "script":
                  return require("js-beautify")(text, options);
                case "style":
                  switch (lang) {
                    case "scss":
                      options = _.merge(options, {
                        source: text,
                        lang: "scss",
                        mode: "beautify"
                      });
                      return prettydiff.api(options)[0];
                    case "less":
                      options = _.merge(options, {
                        source: text,
                        lang: "less",
                        mode: "beautify"
                      });
                      return prettydiff.api(options)[0];
                    case void 0:
                      return require("js-beautify").css(text, options);
                    default:
                      return void 0;
                  }
              }
            })());
            result = beautifiedText ? match.replace(replaceText, "\n" + (beautifiedText.trim()) + "\n") : match;
            _this.verbose("Vue part", match, begin, type, text, lang, result);
            return result;
          });
          _this.verbose("Vue final results", results);
          return resolve(results);
        };
      })(this));
    };

    return VueBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy92dWUtYmVhdXRpZmllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEseUJBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzRCQUNyQixJQUFBLEdBQU07OzRCQUNOLElBQUEsR0FBTTs7NEJBRU4sT0FBQSxHQUNFO01BQUEsR0FBQSxFQUFLLElBQUw7Ozs0QkFFRixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixjQUFBO1VBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSO1VBQ2IsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSO1VBQ0osTUFBQSxHQUFTO1VBRVQsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixFQUFxQixTQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsSUFBZixFQUFxQixJQUFyQjtBQUM3QixnQkFBQTtZQUFBLElBQUEsK0RBQStDLENBQUEsQ0FBQTtZQUMvQyxXQUFBLEdBQWM7WUFDZCxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBQTtZQUNQLGNBQUEsR0FBaUI7QUFBQyxzQkFBTyxJQUFQO0FBQUEscUJBQ1gsVUFEVztBQUVkLDBCQUFPLElBQVA7QUFBQSx5QkFDTyxLQURQO0FBQUEseUJBQ2MsTUFEZDs2QkFFSSxPQUFBLENBQVEsY0FBUixDQUFBLENBQXdCLElBQXhCLEVBQThCLE9BQTlCO0FBRkoseUJBR08sTUFIUDs2QkFJSSxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCLEVBQWtDLE9BQWxDO0FBSko7NkJBTUk7QUFOSjtBQURHO0FBRFcscUJBU1gsUUFUVzt5QkFVZCxPQUFBLENBQVEsYUFBUixDQUFBLENBQXVCLElBQXZCLEVBQTZCLE9BQTdCO0FBVmMscUJBV1gsT0FYVztBQVlkLDBCQUFPLElBQVA7QUFBQSx5QkFDTyxNQURQO3NCQUVJLE9BQUEsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVIsRUFDUjt3QkFBQSxNQUFBLEVBQVEsSUFBUjt3QkFDQSxJQUFBLEVBQU0sTUFETjt3QkFFQSxJQUFBLEVBQU0sVUFGTjt1QkFEUTs2QkFLVixVQUFVLENBQUMsR0FBWCxDQUFlLE9BQWYsQ0FBd0IsQ0FBQSxDQUFBO0FBUDVCLHlCQVFPLE1BUlA7c0JBU0ksT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUNSO3dCQUFBLE1BQUEsRUFBUSxJQUFSO3dCQUNBLElBQUEsRUFBTSxNQUROO3dCQUVBLElBQUEsRUFBTSxVQUZOO3VCQURROzZCQUtWLFVBQVUsQ0FBQyxHQUFYLENBQWUsT0FBZixDQUF3QixDQUFBLENBQUE7QUFkNUIseUJBZU8sTUFmUDs2QkFnQkksT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQyxHQUF2QixDQUEyQixJQUEzQixFQUFpQyxPQUFqQztBQWhCSjs2QkFrQkk7QUFsQko7QUFaYztnQkFBRDtZQWdDakIsTUFBQSxHQUFZLGNBQUgsR0FBdUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxXQUFkLEVBQTJCLElBQUEsR0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFmLENBQUEsQ0FBRCxDQUFKLEdBQTJCLElBQXRELENBQXZCLEdBQXVGO1lBQ2hHLEtBQUMsQ0FBQSxPQUFELENBQVMsVUFBVCxFQUFxQixLQUFyQixFQUE0QixLQUE1QixFQUFtQyxJQUFuQyxFQUF5QyxJQUF6QyxFQUErQyxJQUEvQyxFQUFxRCxNQUFyRDtBQUNBLG1CQUFPO1VBdENzQixDQUFyQjtVQXdDVixLQUFDLENBQUEsT0FBRCxDQUFTLG1CQUFULEVBQThCLE9BQTlCO2lCQUNBLE9BQUEsQ0FBUSxPQUFSO1FBOUNrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtJQURIOzs7O0tBUGlDO0FBSDdDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFZ1ZUJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgbmFtZTogXCJWdWUgQmVhdXRpZmllclwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvYmxvYi9tYXN0ZXIvc3JjL2JlYXV0aWZpZXJzL3Z1ZS1iZWF1dGlmaWVyLmNvZmZlZVwiXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBWdWU6IHRydWVcclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cclxuICAgICAgcHJldHR5ZGlmZiA9IHJlcXVpcmUoXCJwcmV0dHlkaWZmXCIpXHJcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxyXG4gICAgICByZWdleHAgPSAvKF48KHRlbXBsYXRlfHNjcmlwdHxzdHlsZSlbXj5dKj4pKChcXHN8XFxTKSo/KV48XFwvXFwyPi9naW1cclxuXHJcbiAgICAgIHJlc3VsdHMgPSB0ZXh0LnJlcGxhY2UocmVnZXhwLCAobWF0Y2gsIGJlZ2luLCB0eXBlLCB0ZXh0KSA9PlxyXG4gICAgICAgIGxhbmcgPSAvbGFuZ1xccyo9XFxzKlsnXCJdKFxcdyspW1wiJ10vLmV4ZWMoYmVnaW4pP1sxXVxyXG4gICAgICAgIHJlcGxhY2VUZXh0ID0gdGV4dFxyXG4gICAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKVxyXG4gICAgICAgIGJlYXV0aWZpZWRUZXh0ID0gKHN3aXRjaCB0eXBlXHJcbiAgICAgICAgICB3aGVuIFwidGVtcGxhdGVcIlxyXG4gICAgICAgICAgICBzd2l0Y2ggbGFuZ1xyXG4gICAgICAgICAgICAgIHdoZW4gXCJwdWdcIiwgXCJqYWRlXCJcclxuICAgICAgICAgICAgICAgIHJlcXVpcmUoXCJwdWctYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucylcclxuICAgICAgICAgICAgICB3aGVuIHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmh0bWwodGV4dCwgb3B0aW9ucylcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRcclxuICAgICAgICAgIHdoZW4gXCJzY3JpcHRcIlxyXG4gICAgICAgICAgICByZXF1aXJlKFwianMtYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucylcclxuICAgICAgICAgIHdoZW4gXCJzdHlsZVwiXHJcbiAgICAgICAgICAgIHN3aXRjaCBsYW5nXHJcbiAgICAgICAgICAgICAgd2hlbiBcInNjc3NcIlxyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8ubWVyZ2Uob3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgc291cmNlOiB0ZXh0XHJcbiAgICAgICAgICAgICAgICAgIGxhbmc6IFwic2Nzc1wiXHJcbiAgICAgICAgICAgICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgcHJldHR5ZGlmZi5hcGkob3B0aW9ucylbMF1cclxuICAgICAgICAgICAgICB3aGVuIFwibGVzc1wiXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gXy5tZXJnZShvcHRpb25zLFxyXG4gICAgICAgICAgICAgICAgICBzb3VyY2U6IHRleHRcclxuICAgICAgICAgICAgICAgICAgbGFuZzogXCJsZXNzXCJcclxuICAgICAgICAgICAgICAgICAgbW9kZTogXCJiZWF1dGlmeVwiXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICBwcmV0dHlkaWZmLmFwaShvcHRpb25zKVswXVxyXG4gICAgICAgICAgICAgIHdoZW4gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuY3NzKHRleHQsIG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHJlc3VsdCA9IGlmIGJlYXV0aWZpZWRUZXh0IHRoZW4gbWF0Y2gucmVwbGFjZShyZXBsYWNlVGV4dCwgXCJcXG4je2JlYXV0aWZpZWRUZXh0LnRyaW0oKX1cXG5cIikgZWxzZSBtYXRjaFxyXG4gICAgICAgIEB2ZXJib3NlKFwiVnVlIHBhcnRcIiwgbWF0Y2gsIGJlZ2luLCB0eXBlLCB0ZXh0LCBsYW5nLCByZXN1bHQpXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICApXHJcbiAgICAgIEB2ZXJib3NlKFwiVnVlIGZpbmFsIHJlc3VsdHNcIiwgcmVzdWx0cylcclxuICAgICAgcmVzb2x2ZShyZXN1bHRzKVxyXG4gICAgKVxyXG4iXX0=
