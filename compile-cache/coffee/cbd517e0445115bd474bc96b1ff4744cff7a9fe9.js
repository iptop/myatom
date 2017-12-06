
/*
Requires [perltidy](http://perltidy.sourceforge.net)
 */

(function() {
  "use strict";
  var Beautifier, PerlTidy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PerlTidy = (function(superClass) {
    extend(PerlTidy, superClass);

    function PerlTidy() {
      return PerlTidy.__super__.constructor.apply(this, arguments);
    }

    PerlTidy.prototype.name = "Perltidy";

    PerlTidy.prototype.link = "http://perltidy.sourceforge.net/";

    PerlTidy.prototype.isPreInstalled = false;

    PerlTidy.prototype.options = {
      Perl: true
    };

    PerlTidy.prototype.cli = function(options) {
      if (options.perltidy_path == null) {
        return new Error("'Perl Perltidy Path' not set!" + " Please set this in the Atom Beautify package settings.");
      } else {
        return options.perltidy_path;
      }
    };

    PerlTidy.prototype.beautify = function(text, language, options) {
      var ref;
      return this.run("perltidy", ['--standard-output', '--standard-error-output', '--quiet', ((ref = options.perltidy_profile) != null ? ref.length : void 0) ? "--profile=" + options.perltidy_profile : void 0, this.tempFile("input", text)], {
        help: {
          link: "http://perltidy.sourceforge.net/"
        }
      });
    };

    return PerlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9wZXJsdGlkeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUEsb0JBQUE7SUFBQTs7O0VBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3VCQUNyQixJQUFBLEdBQU07O3VCQUNOLElBQUEsR0FBTTs7dUJBQ04sY0FBQSxHQUFnQjs7dUJBRWhCLE9BQUEsR0FBUztNQUNQLElBQUEsRUFBTSxJQURDOzs7dUJBSVQsR0FBQSxHQUFLLFNBQUMsT0FBRDtNQUNILElBQU8sNkJBQVA7QUFDRSxlQUFXLElBQUEsS0FBQSxDQUFNLCtCQUFBLEdBQ2YseURBRFMsRUFEYjtPQUFBLE1BQUE7QUFJRSxlQUFPLE9BQU8sQ0FBQyxjQUpqQjs7SUFERzs7dUJBT0wsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQWlCLENBQ2YsbUJBRGUsRUFFZix5QkFGZSxFQUdmLFNBSGUsaURBSW9ELENBQUUsZ0JBQXJFLEdBQUEsWUFBQSxHQUFhLE9BQU8sQ0FBQyxnQkFBckIsR0FBQSxNQUplLEVBS2YsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBTGUsQ0FBakIsRUFNSztRQUFBLElBQUEsRUFBTTtVQUNQLElBQUEsRUFBTSxrQ0FEQztTQUFOO09BTkw7SUFEUTs7OztLQWhCNEI7QUFOeEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuUmVxdWlyZXMgW3Blcmx0aWR5XShodHRwOi8vcGVybHRpZHkuc291cmNlZm9yZ2UubmV0KVxyXG4jIyNcclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBlcmxUaWR5IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiUGVybHRpZHlcIlxyXG4gIGxpbms6IFwiaHR0cDovL3Blcmx0aWR5LnNvdXJjZWZvcmdlLm5ldC9cIlxyXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBQZXJsOiB0cnVlXHJcbiAgfVxyXG5cclxuICBjbGk6IChvcHRpb25zKSAtPlxyXG4gICAgaWYgbm90IG9wdGlvbnMucGVybHRpZHlfcGF0aD9cclxuICAgICAgcmV0dXJuIG5ldyBFcnJvcihcIidQZXJsIFBlcmx0aWR5IFBhdGgnIG5vdCBzZXQhXCIgK1xyXG4gICAgICAgIFwiIFBsZWFzZSBzZXQgdGhpcyBpbiB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlwiKVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gb3B0aW9ucy5wZXJsdGlkeV9wYXRoXHJcblxyXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XHJcbiAgICBAcnVuKFwicGVybHRpZHlcIiwgW1xyXG4gICAgICAnLS1zdGFuZGFyZC1vdXRwdXQnXHJcbiAgICAgICctLXN0YW5kYXJkLWVycm9yLW91dHB1dCdcclxuICAgICAgJy0tcXVpZXQnXHJcbiAgICAgIFwiLS1wcm9maWxlPSN7b3B0aW9ucy5wZXJsdGlkeV9wcm9maWxlfVwiIGlmIG9wdGlvbnMucGVybHRpZHlfcHJvZmlsZT8ubGVuZ3RoXHJcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXHJcbiAgICAgIF0sIGhlbHA6IHtcclxuICAgICAgICBsaW5rOiBcImh0dHA6Ly9wZXJsdGlkeS5zb3VyY2Vmb3JnZS5uZXQvXCJcclxuICAgICAgfSlcclxuIl19
