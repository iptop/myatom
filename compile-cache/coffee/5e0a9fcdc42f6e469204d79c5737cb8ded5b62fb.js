(function() {
  "use strict";
  var BashBeautify, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = BashBeautify = (function(superClass) {
    extend(BashBeautify, superClass);

    function BashBeautify() {
      return BashBeautify.__super__.constructor.apply(this, arguments);
    }

    BashBeautify.prototype.name = "beautysh";

    BashBeautify.prototype.link = "https://github.com/bemeurer/beautysh";

    BashBeautify.prototype.executables = [
      {
        name: "beautysh",
        cmd: "beautysh",
        homepage: "https://github.com/bemeurer/beautysh",
        installation: "https://github.com/bemeurer/beautysh#installation",
        version: {
          args: ['--help'],
          parse: function(text) {
            return text.indexOf("usage: beautysh") !== -1 && "0.0.0";
          }
        },
        docker: {
          image: "unibeautify/beautysh"
        }
      }
    ];

    BashBeautify.prototype.options = {
      Bash: {
        indent_size: true
      }
    };

    BashBeautify.prototype.beautify = function(text, language, options) {
      var beautysh, file;
      beautysh = this.exe("beautysh");
      file = this.tempFile("input", text);
      return beautysh.run(['-i', options.indent_size, '-f', file]).then((function(_this) {
        return function() {
          return _this.readFile(file);
        };
      })(this));
    };

    return BashBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9iZWF1dHlzaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsd0JBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzJCQUNyQixJQUFBLEdBQU07OzJCQUNOLElBQUEsR0FBTTs7MkJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sVUFEUjtRQUVFLEdBQUEsRUFBSyxVQUZQO1FBR0UsUUFBQSxFQUFVLHNDQUhaO1FBSUUsWUFBQSxFQUFjLG1EQUpoQjtRQUtFLE9BQUEsRUFBUztVQUVQLElBQUEsRUFBTSxDQUFDLFFBQUQsQ0FGQztVQUdQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxpQkFBYixDQUFBLEtBQXFDLENBQUMsQ0FBdEMsSUFBNEM7VUFBdEQsQ0FIQTtTQUxYO1FBVUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLHNCQUREO1NBVlY7T0FEVzs7OzJCQWlCYixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUZLOzs7MkJBS1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssVUFBTDtNQUNYLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkI7YUFDUCxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUUsSUFBRixFQUFRLE9BQU8sQ0FBQyxXQUFoQixFQUE2QixJQUE3QixFQUFtQyxJQUFuQyxDQUFiLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxRQUFELENBQVUsSUFBVjtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSO0lBSFE7Ozs7S0F6QmdDO0FBSDVDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEJhc2hCZWF1dGlmeSBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcImJlYXV0eXNoXCJcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZW1ldXJlci9iZWF1dHlzaFwiXHJcbiAgZXhlY3V0YWJsZXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJiZWF1dHlzaFwiXHJcbiAgICAgIGNtZDogXCJiZWF1dHlzaFwiXHJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iZW1ldXJlci9iZWF1dHlzaFwiXHJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vYmVtZXVyZXIvYmVhdXR5c2gjaW5zdGFsbGF0aW9uXCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgICMgRG9lcyBub3QgZGlzcGxheSB2ZXJzaW9uXHJcbiAgICAgICAgYXJnczogWyctLWhlbHAnXSxcclxuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQuaW5kZXhPZihcInVzYWdlOiBiZWF1dHlzaFwiKSBpc250IC0xIGFuZCBcIjAuMC4wXCJcclxuICAgICAgfVxyXG4gICAgICBkb2NrZXI6IHtcclxuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9iZWF1dHlzaFwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdXHJcblxyXG4gIG9wdGlvbnM6IHtcclxuICAgIEJhc2g6XHJcbiAgICAgIGluZGVudF9zaXplOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgYmVhdXR5c2ggPSBAZXhlKFwiYmVhdXR5c2hcIilcclxuICAgIGZpbGUgPSBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0KVxyXG4gICAgYmVhdXR5c2gucnVuKFsgJy1pJywgb3B0aW9ucy5pbmRlbnRfc2l6ZSwgJy1mJywgZmlsZSBdKVxyXG4gICAgICAudGhlbig9PiBAcmVhZEZpbGUgZmlsZSlcclxuIl19
