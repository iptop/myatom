(function() {
  "use strict";
  var Beautifier, SassConvert,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = SassConvert = (function(superClass) {
    extend(SassConvert, superClass);

    function SassConvert() {
      return SassConvert.__super__.constructor.apply(this, arguments);
    }

    SassConvert.prototype.name = "SassConvert";

    SassConvert.prototype.link = "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax";

    SassConvert.prototype.executables = [
      {
        name: "SassConvert",
        cmd: "sass-convert",
        homepage: "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax",
        installation: "http://sass-lang.com/documentation/file.SASS_REFERENCE.html#syntax",
        version: {
          parse: function(text) {
            return text.match(/Sass (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/sass-convert"
        }
      }
    ];

    SassConvert.prototype.options = {
      CSS: false,
      Sass: false,
      SCSS: false
    };

    SassConvert.prototype.beautify = function(text, language, options, context) {
      var lang;
      lang = language.toLowerCase();
      return this.exe("sass-convert").run([this.tempFile("input", text), "--from", lang, "--to", lang]);
    };

    return SassConvert;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9zYXNzLWNvbnZlcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHVCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzswQkFDckIsSUFBQSxHQUFNOzswQkFDTixJQUFBLEdBQU07OzBCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLGFBRFI7UUFFRSxHQUFBLEVBQUssY0FGUDtRQUdFLFFBQUEsRUFBVSxvRUFIWjtRQUlFLFlBQUEsRUFBYyxvRUFKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsc0JBQVgsQ0FBbUMsQ0FBQSxDQUFBO1VBQTdDLENBREE7U0FMWDtRQVFFLE1BQUEsRUFBUTtVQUNOLEtBQUEsRUFBTywwQkFERDtTQVJWO09BRFc7OzswQkFlYixPQUFBLEdBRUU7TUFBQSxHQUFBLEVBQUssS0FBTDtNQUNBLElBQUEsRUFBTSxLQUROO01BRUEsSUFBQSxFQUFNLEtBRk47OzswQkFJRixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixFQUEwQixPQUExQjtBQUNSLFVBQUE7TUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLFdBQVQsQ0FBQTthQUNQLElBQUMsQ0FBQSxHQUFELENBQUssY0FBTCxDQUFvQixDQUFDLEdBQXJCLENBQXlCLENBQ3ZCLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUR1QixFQUV2QixRQUZ1QixFQUViLElBRmEsRUFFUCxNQUZPLEVBRUMsSUFGRCxDQUF6QjtJQUZROzs7O0tBeEIrQjtBQUgzQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTYXNzQ29udmVydCBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcIlNhc3NDb252ZXJ0XCJcclxuICBsaW5rOiBcImh0dHA6Ly9zYXNzLWxhbmcuY29tL2RvY3VtZW50YXRpb24vZmlsZS5TQVNTX1JFRkVSRU5DRS5odG1sI3N5bnRheFwiXHJcbiAgZXhlY3V0YWJsZXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJTYXNzQ29udmVydFwiXHJcbiAgICAgIGNtZDogXCJzYXNzLWNvbnZlcnRcIlxyXG4gICAgICBob21lcGFnZTogXCJodHRwOi8vc2Fzcy1sYW5nLmNvbS9kb2N1bWVudGF0aW9uL2ZpbGUuU0FTU19SRUZFUkVOQ0UuaHRtbCNzeW50YXhcIlxyXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cDovL3Nhc3MtbGFuZy5jb20vZG9jdW1lbnRhdGlvbi9maWxlLlNBU1NfUkVGRVJFTkNFLmh0bWwjc3ludGF4XCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvU2FzcyAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXHJcbiAgICAgIH1cclxuICAgICAgZG9ja2VyOiB7XHJcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvc2Fzcy1jb252ZXJ0XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIF1cclxuXHJcbiAgb3B0aW9uczpcclxuICAgICMgVE9ETzogQWRkIHN1cHBvcnQgZm9yIG9wdGlvbnNcclxuICAgIENTUzogZmFsc2VcclxuICAgIFNhc3M6IGZhbHNlXHJcbiAgICBTQ1NTOiBmYWxzZVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxyXG4gICAgbGFuZyA9IGxhbmd1YWdlLnRvTG93ZXJDYXNlKClcclxuICAgIEBleGUoXCJzYXNzLWNvbnZlcnRcIikucnVuKFtcclxuICAgICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCksXHJcbiAgICAgIFwiLS1mcm9tXCIsIGxhbmcsIFwiLS10b1wiLCBsYW5nXHJcbiAgICBdKVxyXG4iXX0=
