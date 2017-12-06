
/*
Requires http://hhvm.com/
 */

(function() {
  "use strict";
  var Beautifier, HhFormat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = HhFormat = (function(superClass) {
    extend(HhFormat, superClass);

    function HhFormat() {
      return HhFormat.__super__.constructor.apply(this, arguments);
    }

    HhFormat.prototype.name = "hh_format";

    HhFormat.prototype.link = "http://hhvm.com/";

    HhFormat.prototype.isPreInstalled = false;

    HhFormat.prototype.options = {
      PHP: false
    };

    HhFormat.prototype.beautify = function(text, language, options) {
      return this.run("hh_format", [this.tempFile("input", text)], {
        help: {
          link: "http://hhvm.com/"
        }
      }).then(function(output) {
        if (output.trim()) {
          return output;
        } else {
          return this.Promise.resolve(new Error("hh_format returned an empty output."));
        }
      });
    };

    return HhFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9oaF9mb3JtYXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG9CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt1QkFDckIsSUFBQSxHQUFNOzt1QkFDTixJQUFBLEdBQU07O3VCQUNOLGNBQUEsR0FBZ0I7O3VCQUVoQixPQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQUssS0FBTDs7O3VCQUVGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQWtCLENBQ2hCLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURnQixDQUFsQixFQUdBO1FBQ0UsSUFBQSxFQUFNO1VBQ0osSUFBQSxFQUFNLGtCQURGO1NBRFI7T0FIQSxDQU9FLENBQUMsSUFQSCxDQU9RLFNBQUMsTUFBRDtRQUdOLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUFIO2lCQUNFLE9BREY7U0FBQSxNQUFBO2lCQUdFLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFxQixJQUFBLEtBQUEsQ0FBTSxxQ0FBTixDQUFyQixFQUhGOztNQUhNLENBUFI7SUFEUTs7OztLQVI0QjtBQVB4QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG5SZXF1aXJlcyBodHRwOi8vaGh2bS5jb20vXHJcbiMjI1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhoRm9ybWF0IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiaGhfZm9ybWF0XCJcclxuICBsaW5rOiBcImh0dHA6Ly9oaHZtLmNvbS9cIlxyXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxyXG5cclxuICBvcHRpb25zOlxyXG4gICAgUEhQOiBmYWxzZVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgQHJ1bihcImhoX2Zvcm1hdFwiLCBbXHJcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXHJcbiAgICBdLFxyXG4gICAge1xyXG4gICAgICBoZWxwOiB7XHJcbiAgICAgICAgbGluazogXCJodHRwOi8vaGh2bS5jb20vXCJcclxuICAgICAgfVxyXG4gICAgfSkudGhlbigob3V0cHV0KSAtPlxyXG4gICAgICAjIGhoX2Zvcm1hdCBjYW4gZXhpdCB3aXRoIHN0YXR1cyAwIGFuZCBubyBvdXRwdXQgZm9yIHNvbWUgZmlsZXMgd2hpY2hcclxuICAgICAgIyBpdCBkb2Vzbid0IGZvcm1hdC4gIEluIHRoYXQgY2FzZSB3ZSBqdXN0IHJldHVybiBvcmlnaW5hbCB0ZXh0LlxyXG4gICAgICBpZiBvdXRwdXQudHJpbSgpXHJcbiAgICAgICAgb3V0cHV0XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAUHJvbWlzZS5yZXNvbHZlKG5ldyBFcnJvcihcImhoX2Zvcm1hdCByZXR1cm5lZCBhbiBlbXB0eSBvdXRwdXQuXCIpKVxyXG4gICAgKVxyXG4iXX0=
