
/*
Requires [puppet-link](http://puppet-lint.com/)
 */

(function() {
  "use strict";
  var Beautifier, PuppetFix,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PuppetFix = (function(superClass) {
    extend(PuppetFix, superClass);

    function PuppetFix() {
      return PuppetFix.__super__.constructor.apply(this, arguments);
    }

    PuppetFix.prototype.name = "puppet-lint";

    PuppetFix.prototype.link = "http://puppet-lint.com/";

    PuppetFix.prototype.isPreInstalled = false;

    PuppetFix.prototype.options = {
      Puppet: true
    };

    PuppetFix.prototype.cli = function(options) {
      if (options.puppet_path == null) {
        return new Error("'puppet-lint' path is not set!" + " Please set this in the Atom Beautify package settings.");
      } else {
        return options.puppet_path;
      }
    };

    PuppetFix.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("puppet-lint", ['--fix', tempFile = this.tempFile("input", text)], {
        ignoreReturnCode: true,
        help: {
          link: "http://puppet-lint.com/"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return PuppetFix;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9wdXBwZXQtZml4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQSxxQkFBQTtJQUFBOzs7RUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7d0JBRXJCLElBQUEsR0FBTTs7d0JBQ04sSUFBQSxHQUFNOzt3QkFDTixjQUFBLEdBQWdCOzt3QkFFaEIsT0FBQSxHQUFTO01BQ1AsTUFBQSxFQUFRLElBREQ7Ozt3QkFJVCxHQUFBLEdBQUssU0FBQyxPQUFEO01BQ0gsSUFBTywyQkFBUDtBQUNFLGVBQVcsSUFBQSxLQUFBLENBQU0sZ0NBQUEsR0FDZix5REFEUyxFQURiO09BQUEsTUFBQTtBQUlFLGVBQU8sT0FBTyxDQUFDLFlBSmpCOztJQURHOzt3QkFPTCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7YUFBQSxJQUFDLENBQUEsR0FBRCxDQUFLLGFBQUwsRUFBb0IsQ0FDbEIsT0FEa0IsRUFFbEIsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUZPLENBQXBCLEVBR0s7UUFDRCxnQkFBQSxFQUFrQixJQURqQjtRQUVELElBQUEsRUFBTTtVQUNKLElBQUEsRUFBTSx5QkFERjtTQUZMO09BSEwsQ0FTRSxDQUFDLElBVEgsQ0FTUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1FBREk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBVFI7SUFEUTs7OztLQWpCNkI7QUFOekMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuUmVxdWlyZXMgW3B1cHBldC1saW5rXShodHRwOi8vcHVwcGV0LWxpbnQuY29tLylcclxuIyMjXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQdXBwZXRGaXggZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgIyB0aGlzIGlzIHdoYXQgZGlzcGxheXMgYXMgeW91ciBEZWZhdWx0IEJlYXV0aWZpZXIgaW4gTGFuZ3VhZ2UgQ29uZmlnXHJcbiAgbmFtZTogXCJwdXBwZXQtbGludFwiXHJcbiAgbGluazogXCJodHRwOi8vcHVwcGV0LWxpbnQuY29tL1wiXHJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXHJcblxyXG4gIG9wdGlvbnM6IHtcclxuICAgIFB1cHBldDogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgY2xpOiAob3B0aW9ucykgLT5cclxuICAgIGlmIG5vdCBvcHRpb25zLnB1cHBldF9wYXRoP1xyXG4gICAgICByZXR1cm4gbmV3IEVycm9yKFwiJ3B1cHBldC1saW50JyBwYXRoIGlzIG5vdCBzZXQhXCIgK1xyXG4gICAgICAgIFwiIFBsZWFzZSBzZXQgdGhpcyBpbiB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlwiKVxyXG4gICAgZWxzZVxyXG4gICAgICByZXR1cm4gb3B0aW9ucy5wdXBwZXRfcGF0aFxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgQHJ1bihcInB1cHBldC1saW50XCIsIFtcclxuICAgICAgJy0tZml4J1xyXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXHJcbiAgICAgIF0sIHtcclxuICAgICAgICBpZ25vcmVSZXR1cm5Db2RlOiB0cnVlXHJcbiAgICAgICAgaGVscDoge1xyXG4gICAgICAgICAgbGluazogXCJodHRwOi8vcHVwcGV0LWxpbnQuY29tL1wiXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbig9PlxyXG4gICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcclxuICAgICAgKVxyXG4iXX0=
