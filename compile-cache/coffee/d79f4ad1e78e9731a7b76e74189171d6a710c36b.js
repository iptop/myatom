(function() {
  "use strict";
  var Beautifier, NginxBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = NginxBeautify = (function(superClass) {
    extend(NginxBeautify, superClass);

    function NginxBeautify() {
      return NginxBeautify.__super__.constructor.apply(this, arguments);
    }

    NginxBeautify.prototype.name = "Nginx Beautify";

    NginxBeautify.prototype.link = "https://github.com/denysvitali/nginxbeautify";

    NginxBeautify.prototype.options = {
      Nginx: {
        spaces: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return 0;
            } else {
              return indent_size;
            }
          }
        ],
        tabs: [
          "indent_with_tabs", "indent_size", "indent_char", function(indent_with_tabs, indent_size, indent_char) {
            if (indent_with_tabs || indent_char === "\t") {
              return indent_size;
            } else {
              return 0;
            }
          }
        ],
        dontJoinCurlyBracet: true
      }
    };

    NginxBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var Beautify, error, instance;
        Beautify = require("nginxbeautify");
        instance = new Beautify(options);
        try {
          return resolve(instance.parse(text));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return NginxBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9uZ2lueC1iZWF1dGlmeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEseUJBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzRCQUNyQixJQUFBLEdBQU07OzRCQUNOLElBQUEsR0FBTTs7NEJBRU4sT0FBQSxHQUFTO01BQ1AsS0FBQSxFQUFPO1FBQ0wsTUFBQSxFQUFRO1VBQUMsa0JBQUQsRUFBcUIsYUFBckIsRUFBb0MsYUFBcEMsRUFBbUQsU0FBQyxnQkFBRCxFQUFtQixXQUFuQixFQUFnQyxXQUFoQztZQUN6RCxJQUFHLGdCQUFBLElBQW9CLFdBQUEsS0FBZSxJQUF0QztxQkFDRSxFQURGO2FBQUEsTUFBQTtxQkFHRSxZQUhGOztVQUR5RCxDQUFuRDtTQURIO1FBT0wsSUFBQSxFQUFNO1VBQUMsa0JBQUQsRUFBcUIsYUFBckIsRUFBb0MsYUFBcEMsRUFBbUQsU0FBQyxnQkFBRCxFQUFtQixXQUFuQixFQUFnQyxXQUFoQztZQUN2RCxJQUFHLGdCQUFBLElBQW9CLFdBQUEsS0FBZSxJQUF0QztxQkFDRSxZQURGO2FBQUEsTUFBQTtxQkFHRSxFQUhGOztVQUR1RCxDQUFuRDtTQVBEO1FBYUwsbUJBQUEsRUFBcUIsSUFiaEI7T0FEQTs7OzRCQWtCVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUVSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsZUFBUjtRQUNYLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxPQUFUO0FBQ2Y7aUJBQ0UsT0FBQSxDQUFRLFFBQVEsQ0FBQyxLQUFULENBQWUsSUFBZixDQUFSLEVBREY7U0FBQSxjQUFBO1VBRU07aUJBRUosTUFBQSxDQUFPLEtBQVAsRUFKRjs7TUFIa0IsQ0FBVDtJQUZIOzs7O0tBdEJpQztBQUg3QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBOZ2lueEJlYXV0aWZ5IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiTmdpbnggQmVhdXRpZnlcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2Rlbnlzdml0YWxpL25naW54YmVhdXRpZnlcIlxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBOZ2lueDoge1xyXG4gICAgICBzcGFjZXM6IFtcImluZGVudF93aXRoX3RhYnNcIiwgXCJpbmRlbnRfc2l6ZVwiLCBcImluZGVudF9jaGFyXCIsIChpbmRlbnRfd2l0aF90YWJzLCBpbmRlbnRfc2l6ZSwgaW5kZW50X2NoYXIpIC0+XHJcbiAgICAgICAgaWYgaW5kZW50X3dpdGhfdGFicyBvciBpbmRlbnRfY2hhciBpcyBcIlxcdFwiXHJcbiAgICAgICAgICAwXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgaW5kZW50X3NpemVcclxuICAgICAgXVxyXG4gICAgICB0YWJzOiBbXCJpbmRlbnRfd2l0aF90YWJzXCIsIFwiaW5kZW50X3NpemVcIiwgXCJpbmRlbnRfY2hhclwiLCAoaW5kZW50X3dpdGhfdGFicywgaW5kZW50X3NpemUsIGluZGVudF9jaGFyKSAtPlxyXG4gICAgICAgIGlmIGluZGVudF93aXRoX3RhYnMgb3IgaW5kZW50X2NoYXIgaXMgXCJcXHRcIlxyXG4gICAgICAgICAgaW5kZW50X3NpemVcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAwXHJcbiAgICAgIF1cclxuICAgICAgZG9udEpvaW5DdXJseUJyYWNldDogdHJ1ZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuXHJcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICAgIEJlYXV0aWZ5ID0gcmVxdWlyZShcIm5naW54YmVhdXRpZnlcIilcclxuICAgICAgaW5zdGFuY2UgPSBuZXcgQmVhdXRpZnkob3B0aW9ucylcclxuICAgICAgdHJ5XHJcbiAgICAgICAgcmVzb2x2ZShpbnN0YW5jZS5wYXJzZSh0ZXh0KSlcclxuICAgICAgY2F0Y2ggZXJyb3JcclxuICAgICAgICAjIEVycm9yIG9jY3VycmVkXHJcbiAgICAgICAgcmVqZWN0KGVycm9yKVxyXG4gICAgKVxyXG4iXX0=
