(function() {
  "use strict";
  var Beautifier, LatexBeautify, fs, path, temp,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require("fs");

  temp = require("temp").track();

  module.exports = LatexBeautify = (function(superClass) {
    extend(LatexBeautify, superClass);

    function LatexBeautify() {
      return LatexBeautify.__super__.constructor.apply(this, arguments);
    }

    LatexBeautify.prototype.name = "Latex Beautify";

    LatexBeautify.prototype.link = "https://github.com/cmhughes/latexindent.pl";

    LatexBeautify.prototype.isPreInstalled = false;

    LatexBeautify.prototype.options = {
      LaTeX: true
    };

    LatexBeautify.prototype.buildConfigFile = function(options) {
      var config, delim, i, indentChar, len, ref;
      indentChar = options.indent_char;
      if (options.indent_with_tabs) {
        indentChar = "\\t";
      }
      config = "defaultIndent: \"" + indentChar + "\"\nalwaysLookforSplitBraces: " + (+options.always_look_for_split_braces) + "\nalwaysLookforSplitBrackets: " + (+options.always_look_for_split_brackets) + "\nindentPreamble: " + (+options.indent_preamble) + "\nremoveTrailingWhitespace: " + (+options.remove_trailing_whitespace) + "\nlookForAlignDelims:\n";
      ref = options.align_columns_in_environments;
      for (i = 0, len = ref.length; i < len; i++) {
        delim = ref[i];
        config += "\t" + delim + ": 1\n";
      }
      return config;
    };

    LatexBeautify.prototype.setUpDir = function(dirPath, text, config) {
      this.texFile = path.join(dirPath, "latex.tex");
      fs.writeFile(this.texFile, text, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.configFile = path.join(dirPath, "localSettings.yaml");
      fs.writeFile(this.configFile, config, function(err) {
        if (err) {
          return reject(err);
        }
      });
      this.logFile = path.join(dirPath, "indent.log");
      return fs.writeFile(this.logFile, "", function(err) {
        if (err) {
          return reject(err);
        }
      });
    };

    LatexBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        return temp.mkdir("latex", function(err, dirPath) {
          if (err) {
            return reject(err);
          }
          return resolve(dirPath);
        });
      }).then((function(_this) {
        return function(dirPath) {
          var run;
          _this.setUpDir(dirPath, text, _this.buildConfigFile(options));
          return run = _this.run("latexindent", ["-s", "-l", "-c=" + dirPath, _this.texFile, "-o", _this.texFile], {
            help: {
              link: "https://github.com/cmhughes/latexindent.pl"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(_this.texFile);
        };
      })(this));
    };

    return LatexBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9sYXRleC1iZWF1dGlmeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEseUNBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxLQUFoQixDQUFBOztFQUdQLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzRCQUNyQixJQUFBLEdBQU07OzRCQUNOLElBQUEsR0FBTTs7NEJBQ04sY0FBQSxHQUFnQjs7NEJBRWhCLE9BQUEsR0FBUztNQUNQLEtBQUEsRUFBTyxJQURBOzs7NEJBTVQsZUFBQSxHQUFpQixTQUFDLE9BQUQ7QUFDZixVQUFBO01BQUEsVUFBQSxHQUFhLE9BQU8sQ0FBQztNQUNyQixJQUFHLE9BQU8sQ0FBQyxnQkFBWDtRQUNFLFVBQUEsR0FBYSxNQURmOztNQUdBLE1BQUEsR0FBUyxtQkFBQSxHQUNtQixVQURuQixHQUM4QixnQ0FEOUIsR0FFMkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0QkFBVixDQUYzQixHQUVrRSxnQ0FGbEUsR0FHNkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw4QkFBVixDQUg3QixHQUdzRSxvQkFIdEUsR0FJaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFWLENBSmpCLEdBSTJDLDhCQUozQyxHQUsyQixDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUFWLENBTDNCLEdBS2dFO0FBR3pFO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxNQUFBLElBQVUsSUFBQSxHQUFLLEtBQUwsR0FBVztBQUR2QjtBQUVBLGFBQU87SUFmUTs7NEJBcUJqQixRQUFBLEdBQVUsU0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixNQUFoQjtNQUNSLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLFdBQW5CO01BQ1gsRUFBRSxDQUFDLFNBQUgsQ0FBYSxJQUFDLENBQUEsT0FBZCxFQUF1QixJQUF2QixFQUE2QixTQUFDLEdBQUQ7UUFDM0IsSUFBc0IsR0FBdEI7QUFBQSxpQkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOztNQUQyQixDQUE3QjtNQUVBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLG9CQUFuQjtNQUNkLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBQyxDQUFBLFVBQWQsRUFBMEIsTUFBMUIsRUFBa0MsU0FBQyxHQUFEO1FBQ2hDLElBQXNCLEdBQXRCO0FBQUEsaUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7TUFEZ0MsQ0FBbEM7TUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixZQUFuQjthQUNYLEVBQUUsQ0FBQyxTQUFILENBQWEsSUFBQyxDQUFBLE9BQWQsRUFBdUIsRUFBdkIsRUFBMkIsU0FBQyxHQUFEO1FBQ3pCLElBQXNCLEdBQXRCO0FBQUEsaUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7TUFEeUIsQ0FBM0I7SUFSUTs7NEJBWVYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDSixJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtlQUNYLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWCxFQUFvQixTQUFDLEdBQUQsRUFBTSxPQUFOO1VBQ2xCLElBQXNCLEdBQXRCO0FBQUEsbUJBQU8sTUFBQSxDQUFPLEdBQVAsRUFBUDs7aUJBQ0EsT0FBQSxDQUFRLE9BQVI7UUFGa0IsQ0FBcEI7TUFEVyxDQUFULENBTUosQ0FBQyxJQU5HLENBTUUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsS0FBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLEVBQXlCLEtBQUMsQ0FBQSxlQUFELENBQWlCLE9BQWpCLENBQXpCO2lCQUNBLEdBQUEsR0FBTSxLQUFDLENBQUEsR0FBRCxDQUFLLGFBQUwsRUFBb0IsQ0FDeEIsSUFEd0IsRUFFeEIsSUFGd0IsRUFHeEIsS0FBQSxHQUFRLE9BSGdCLEVBSXhCLEtBQUMsQ0FBQSxPQUp1QixFQUt4QixJQUx3QixFQU14QixLQUFDLENBQUEsT0FOdUIsQ0FBcEIsRUFPSDtZQUFBLElBQUEsRUFBTTtjQUNQLElBQUEsRUFBTSw0Q0FEQzthQUFOO1dBUEc7UUFGRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FORixDQW1CSixDQUFDLElBbkJHLENBbUJHLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDTCxLQUFDLENBQUEsUUFBRCxDQUFVLEtBQUMsQ0FBQSxPQUFYO1FBREs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBbkJIO0lBREk7Ozs7S0E1Q2lDO0FBUDdDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcclxuZnMgPSByZXF1aXJlKFwiZnNcIilcclxudGVtcCA9IHJlcXVpcmUoXCJ0ZW1wXCIpLnRyYWNrKClcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExhdGV4QmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgbmFtZTogXCJMYXRleCBCZWF1dGlmeVwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vY21odWdoZXMvbGF0ZXhpbmRlbnQucGxcIlxyXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBMYVRlWDogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgIyBUaGVyZSBhcmUgdG9vIG1hbnkgb3B0aW9ucyB3aXRoIGxhdGV4bWssIEkgaGF2ZSB0cmllZCB0byBzbGltIHRoaXMgZG93biB0byB0aGUgbW9zdCB1c2VmdWwgb25lcy5cclxuICAjIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBjb25maWd1cmF0aW9uIGZpbGUgZm9yIGxhdGV4aW5kZW50LlxyXG4gIGJ1aWxkQ29uZmlnRmlsZTogKG9wdGlvbnMpIC0+XHJcbiAgICBpbmRlbnRDaGFyID0gb3B0aW9ucy5pbmRlbnRfY2hhclxyXG4gICAgaWYgb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzXHJcbiAgICAgIGluZGVudENoYXIgPSBcIlxcXFx0XCJcclxuICAgICMgK3RydWUgPSAxIGFuZCArZmFsc2UgPSAwXHJcbiAgICBjb25maWcgPSBcIlwiXCJcclxuICAgICAgICAgICAgIGRlZmF1bHRJbmRlbnQ6IFxcXCIje2luZGVudENoYXJ9XFxcIlxyXG4gICAgICAgICAgICAgYWx3YXlzTG9va2ZvclNwbGl0QnJhY2VzOiAjeytvcHRpb25zLmFsd2F5c19sb29rX2Zvcl9zcGxpdF9icmFjZXN9XHJcbiAgICAgICAgICAgICBhbHdheXNMb29rZm9yU3BsaXRCcmFja2V0czogI3srb3B0aW9ucy5hbHdheXNfbG9va19mb3Jfc3BsaXRfYnJhY2tldHN9XHJcbiAgICAgICAgICAgICBpbmRlbnRQcmVhbWJsZTogI3srb3B0aW9ucy5pbmRlbnRfcHJlYW1ibGV9XHJcbiAgICAgICAgICAgICByZW1vdmVUcmFpbGluZ1doaXRlc3BhY2U6ICN7K29wdGlvbnMucmVtb3ZlX3RyYWlsaW5nX3doaXRlc3BhY2V9XHJcbiAgICAgICAgICAgICBsb29rRm9yQWxpZ25EZWxpbXM6XFxuXHJcbiAgICAgICAgICAgICBcIlwiXCJcclxuICAgIGZvciBkZWxpbSBpbiBvcHRpb25zLmFsaWduX2NvbHVtbnNfaW5fZW52aXJvbm1lbnRzXHJcbiAgICAgIGNvbmZpZyArPSBcIlxcdCN7ZGVsaW19OiAxXFxuXCJcclxuICAgIHJldHVybiBjb25maWdcclxuXHJcbiAgIyBMYXRleGluZGVudCBhY2NlcHRzIGNvbmZpZ3VyYXRpb24gX2ZpbGVzXyBvbmx5LlxyXG4gICMgVGhpcyBmaWxlIGhhcyB0byBiZSBuYW1lZCBsb2NhbFNldHRpbmdzLnlhbWwgYW5kIGJlIGluIHRoZSBzYW1lIGZvbGRlciBhcyB0aGUgdGV4IGZpbGUuXHJcbiAgIyBJdCBhbHNvIGluc2lzdHMgb24gY3JlYXRpbmcgYSBsb2cgZmlsZSBzb21ld2hlcmUuXHJcbiAgIyBTbyB3ZSBzZXQgdXAgYSBkaXJlY3Rvcnkgd2l0aCBhbGwgdGhlIGZpbGVzIGluIHBsYWNlLlxyXG4gIHNldFVwRGlyOiAoZGlyUGF0aCwgdGV4dCwgY29uZmlnKSAtPlxyXG4gICAgQHRleEZpbGUgPSBwYXRoLmpvaW4oZGlyUGF0aCwgXCJsYXRleC50ZXhcIilcclxuICAgIGZzLndyaXRlRmlsZSBAdGV4RmlsZSwgdGV4dCwgKGVycikgLT5cclxuICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxyXG4gICAgQGNvbmZpZ0ZpbGUgPSBwYXRoLmpvaW4oZGlyUGF0aCwgXCJsb2NhbFNldHRpbmdzLnlhbWxcIilcclxuICAgIGZzLndyaXRlRmlsZSBAY29uZmlnRmlsZSwgY29uZmlnLCAoZXJyKSAtPlxyXG4gICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXHJcbiAgICBAbG9nRmlsZSA9IHBhdGguam9pbihkaXJQYXRoLCBcImluZGVudC5sb2dcIilcclxuICAgIGZzLndyaXRlRmlsZSBAbG9nRmlsZSwgXCJcIiwgKGVycikgLT5cclxuICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxyXG5cclxuICAjQmVhdXRpZmllciBkb2VzIG5vdCBjdXJyZW50bHkgaGF2ZSBhIG1ldGhvZCBmb3IgY3JlYXRpbmcgZGlyZWN0b3JpZXMsIHNvIHdlIGNhbGwgdGVtcCBkaXJlY3RseS5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICAgIHRlbXAubWtkaXIoXCJsYXRleFwiLCAoZXJyLCBkaXJQYXRoKSAtPlxyXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcclxuICAgICAgICByZXNvbHZlKGRpclBhdGgpXHJcbiAgICAgIClcclxuICAgIClcclxuICAgIC50aGVuKChkaXJQYXRoKT0+XHJcbiAgICAgIEBzZXRVcERpcihkaXJQYXRoLCB0ZXh0LCBAYnVpbGRDb25maWdGaWxlKG9wdGlvbnMpKVxyXG4gICAgICBydW4gPSBAcnVuIFwibGF0ZXhpbmRlbnRcIiwgW1xyXG4gICAgICAgIFwiLXNcIiAgICAgICAgICAgICNTaWxlbnQgbW9kZVxyXG4gICAgICAgIFwiLWxcIiAgICAgICAgICAgICNUZWxsIGxhdGV4aW5kZW50IHdlIGhhdmUgYSBsb2NhbCBjb25maWd1cmF0aW9uIGZpbGVcclxuICAgICAgICBcIi1jPVwiICsgZGlyUGF0aCAjVGVsbCBsYXRleGluZGVudCB0byBwbGFjZSB0aGUgbG9nIGZpbGUgaW4gdGhpcyBkaXJlY3RvcnlcclxuICAgICAgICBAdGV4RmlsZVxyXG4gICAgICAgIFwiLW9cIiAgICAgICAgICAgICNPdXRwdXQgdG8gdGhlIHNhbWUgbG9jYXRpb24gYXMgZmlsZSwgLXcgY3JlYXRlcyBhIGJhY2t1cCBmaWxlLCB3aGVyZWFzIHRoaXMgZG9lcyBub3RcclxuICAgICAgICBAdGV4RmlsZVxyXG4gICAgICBdLCBoZWxwOiB7XHJcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vY21odWdoZXMvbGF0ZXhpbmRlbnQucGxcIlxyXG4gICAgICB9XHJcbiAgICApXHJcbiAgICAudGhlbiggPT5cclxuICAgICAgQHJlYWRGaWxlKEB0ZXhGaWxlKVxyXG4gICAgKVxyXG4iXX0=
