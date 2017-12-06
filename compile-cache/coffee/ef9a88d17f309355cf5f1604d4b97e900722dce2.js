
/*
Requires https://github.com/bbatsov/rubocop
 */

(function() {
  "use strict";
  var Beautifier, Rubocop,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Rubocop = (function(superClass) {
    extend(Rubocop, superClass);

    function Rubocop() {
      return Rubocop.__super__.constructor.apply(this, arguments);
    }

    Rubocop.prototype.name = "Rubocop";

    Rubocop.prototype.link = "https://github.com/bbatsov/rubocop";

    Rubocop.prototype.isPreInstalled = false;

    Rubocop.prototype.options = {
      Ruby: {
        indent_size: true,
        rubocop_path: true
      }
    };

    Rubocop.prototype.beautify = function(text, language, options) {
      return this.Promise.all([options.rubocop_path ? this.which(options.rubocop_path) : void 0, this.which('rubocop')]).then((function(_this) {
        return function(paths) {
          var _, config, configFile, fs, path, rubocopPath, tempFile, yaml;
          _this.debug('rubocop paths', paths);
          _ = require('lodash');
          path = require('path');
          rubocopPath = _.find(paths, function(p) {
            return p && path.isAbsolute(p);
          });
          _this.verbose('rubocopPath', rubocopPath);
          _this.debug('rubocopPath', rubocopPath, paths);
          configFile = path.join(atom.project.getPaths()[0], ".rubocop.yml");
          fs = require('fs');
          if (fs.existsSync(configFile)) {
            _this.debug("rubocop", config, fs.readFileSync(configFile, 'utf8'));
          } else {
            yaml = require("yaml-front-matter");
            config = {
              "Style/IndentationWidth": {
                "Width": options.indent_size
              }
            };
            configFile = _this.tempFile("rubocop-config", yaml.safeDump(config));
            _this.debug("rubocop", config, configFile);
          }
          if (rubocopPath != null) {
            return _this.run(rubocopPath, ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text, '.rb')], {
              ignoreReturnCode: true
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.run("rubocop", ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text, '.rb')], {
              ignoreReturnCode: true
            }).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return Rubocop;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9ydWJvY29wLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxtQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBQ3JCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFDTixjQUFBLEdBQWdCOztzQkFFaEIsT0FBQSxHQUFTO01BQ1AsSUFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7UUFDQSxZQUFBLEVBQWMsSUFEZDtPQUZLOzs7c0JBTVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7YUFDUixJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxDQUNxQixPQUFPLENBQUMsWUFBeEMsR0FBQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxZQUFmLENBQUEsR0FBQSxNQURXLEVBRVgsSUFBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLENBRlcsQ0FBYixDQUdFLENBQUMsSUFISCxDQUdRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ04sY0FBQTtVQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sZUFBUCxFQUF3QixLQUF4QjtVQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjtVQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjtVQUVQLFdBQUEsR0FBYyxDQUFDLENBQUMsSUFBRixDQUFPLEtBQVAsRUFBYyxTQUFDLENBQUQ7bUJBQU8sQ0FBQSxJQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLENBQWhCO1VBQWIsQ0FBZDtVQUNkLEtBQUMsQ0FBQSxPQUFELENBQVMsYUFBVCxFQUF3QixXQUF4QjtVQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sYUFBUCxFQUFzQixXQUF0QixFQUFtQyxLQUFuQztVQUVBLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXdCLENBQUEsQ0FBQSxDQUFsQyxFQUFzQyxjQUF0QztVQUViLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjtVQUVMLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxVQUFkLENBQUg7WUFDRSxLQUFDLENBQUEsS0FBRCxDQUFPLFNBQVAsRUFBa0IsTUFBbEIsRUFBMEIsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsVUFBaEIsRUFBNEIsTUFBNUIsQ0FBMUIsRUFERjtXQUFBLE1BQUE7WUFHRSxJQUFBLEdBQU8sT0FBQSxDQUFRLG1CQUFSO1lBRVAsTUFBQSxHQUFTO2NBQ1Asd0JBQUEsRUFDRTtnQkFBQSxPQUFBLEVBQVMsT0FBTyxDQUFDLFdBQWpCO2VBRks7O1lBS1QsVUFBQSxHQUFhLEtBQUMsQ0FBQSxRQUFELENBQVUsZ0JBQVYsRUFBNEIsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkLENBQTVCO1lBQ2IsS0FBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLEVBQWtCLE1BQWxCLEVBQTBCLFVBQTFCLEVBWEY7O1VBY0EsSUFBRyxtQkFBSDttQkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsRUFBa0IsQ0FDaEIsZ0JBRGdCLEVBRWhCLFVBRmdCLEVBRUosVUFGSSxFQUdoQixRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCLEtBQXhCLENBSEssQ0FBbEIsRUFJSztjQUFDLGdCQUFBLEVBQWtCLElBQW5CO2FBSkwsQ0FLRSxDQUFDLElBTEgsQ0FLUSxTQUFBO3FCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtZQURJLENBTFIsRUFERjtXQUFBLE1BQUE7bUJBVUUsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFMLEVBQWdCLENBQ2QsZ0JBRGMsRUFFZCxVQUZjLEVBRUYsVUFGRSxFQUdkLFFBQUEsR0FBVyxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsRUFBd0IsS0FBeEIsQ0FIRyxDQUFoQixFQUlLO2NBQUMsZ0JBQUEsRUFBa0IsSUFBbkI7YUFKTCxDQUtFLENBQUMsSUFMSCxDQUtRLFNBQUE7cUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1lBREksQ0FMUixFQVZGOztRQTNCTTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIUjtJQURROzs7O0tBWDJCO0FBUHZDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9iYmF0c292L3J1Ym9jb3BcclxuIyMjXHJcblxyXG5cInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUnVib2NvcCBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcIlJ1Ym9jb3BcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JiYXRzb3YvcnVib2NvcFwiXHJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXHJcblxyXG4gIG9wdGlvbnM6IHtcclxuICAgIFJ1Ynk6XHJcbiAgICAgIGluZGVudF9zaXplOiB0cnVlXHJcbiAgICAgIHJ1Ym9jb3BfcGF0aDogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIEBQcm9taXNlLmFsbChbXHJcbiAgICAgIEB3aGljaChvcHRpb25zLnJ1Ym9jb3BfcGF0aCkgaWYgb3B0aW9ucy5ydWJvY29wX3BhdGhcclxuICAgICAgQHdoaWNoKCdydWJvY29wJylcclxuICAgIF0pLnRoZW4oKHBhdGhzKSA9PlxyXG4gICAgICBAZGVidWcoJ3J1Ym9jb3AgcGF0aHMnLCBwYXRocylcclxuICAgICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcclxuICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXHJcbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXHJcbiAgICAgIHJ1Ym9jb3BQYXRoID0gXy5maW5kKHBhdGhzLCAocCkgLT4gcCBhbmQgcGF0aC5pc0Fic29sdXRlKHApIClcclxuICAgICAgQHZlcmJvc2UoJ3J1Ym9jb3BQYXRoJywgcnVib2NvcFBhdGgpXHJcbiAgICAgIEBkZWJ1ZygncnVib2NvcFBhdGgnLCBydWJvY29wUGF0aCwgcGF0aHMpXHJcblxyXG4gICAgICBjb25maWdGaWxlID0gcGF0aC5qb2luKGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLCBcIi5ydWJvY29wLnltbFwiKVxyXG5cclxuICAgICAgZnMgPSByZXF1aXJlICdmcydcclxuXHJcbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoY29uZmlnRmlsZSlcclxuICAgICAgICBAZGVidWcoXCJydWJvY29wXCIsIGNvbmZpZywgZnMucmVhZEZpbGVTeW5jKGNvbmZpZ0ZpbGUsICd1dGY4JykpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB5YW1sID0gcmVxdWlyZShcInlhbWwtZnJvbnQtbWF0dGVyXCIpXHJcbiAgICAgICAgIyBHZW5lcmF0ZSBjb25maWcgZmlsZVxyXG4gICAgICAgIGNvbmZpZyA9IHtcclxuICAgICAgICAgIFwiU3R5bGUvSW5kZW50YXRpb25XaWR0aFwiOlxyXG4gICAgICAgICAgICBcIldpZHRoXCI6IG9wdGlvbnMuaW5kZW50X3NpemVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZ0ZpbGUgPSBAdGVtcEZpbGUoXCJydWJvY29wLWNvbmZpZ1wiLCB5YW1sLnNhZmVEdW1wKGNvbmZpZykpXHJcbiAgICAgICAgQGRlYnVnKFwicnVib2NvcFwiLCBjb25maWcsIGNvbmZpZ0ZpbGUpXHJcblxyXG4gICAgICAjIENoZWNrIGlmIFBIUC1DUy1GaXhlciBwYXRoIHdhcyBmb3VuZFxyXG4gICAgICBpZiBydWJvY29wUGF0aD9cclxuICAgICAgICBAcnVuKHJ1Ym9jb3BQYXRoLCBbXHJcbiAgICAgICAgICBcIi0tYXV0by1jb3JyZWN0XCJcclxuICAgICAgICAgIFwiLS1jb25maWdcIiwgY29uZmlnRmlsZVxyXG4gICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsICcucmInKVxyXG4gICAgICAgICAgXSwge2lnbm9yZVJldHVybkNvZGU6IHRydWV9KVxyXG4gICAgICAgICAgLnRoZW4oPT5cclxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxyXG4gICAgICAgICAgKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQHJ1bihcInJ1Ym9jb3BcIiwgW1xyXG4gICAgICAgICAgXCItLWF1dG8tY29ycmVjdFwiXHJcbiAgICAgICAgICBcIi0tY29uZmlnXCIsIGNvbmZpZ0ZpbGVcclxuICAgICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0LCAnLnJiJylcclxuICAgICAgICAgIF0sIHtpZ25vcmVSZXR1cm5Db2RlOiB0cnVlfSlcclxuICAgICAgICAgIC50aGVuKD0+XHJcbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcclxuICAgICAgICAgIClcclxuKVxyXG4iXX0=
