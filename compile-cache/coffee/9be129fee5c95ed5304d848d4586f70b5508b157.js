
/*
Requires https://github.com/FriendsOfPHP/phpcbf
 */

(function() {
  "use strict";
  var Beautifier, PHPCBF,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PHPCBF = (function(superClass) {
    extend(PHPCBF, superClass);

    function PHPCBF() {
      return PHPCBF.__super__.constructor.apply(this, arguments);
    }

    PHPCBF.prototype.name = "PHPCBF";

    PHPCBF.prototype.link = "http://php.net/manual/en/install.php";

    PHPCBF.prototype.executables = [
      {
        name: "PHP",
        cmd: "php",
        homepage: "http://php.net/",
        installation: "http://php.net/manual/en/install.php",
        version: {
          parse: function(text) {
            return text.match(/PHP (\d+\.\d+\.\d+)/)[1];
          }
        }
      }, {
        name: "PHPCBF",
        cmd: "phpcbf",
        homepage: "https://github.com/squizlabs/PHP_CodeSniffer",
        installation: "https://github.com/squizlabs/PHP_CodeSniffer#installation",
        version: {
          parse: function(text) {
            return text.match(/version (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/phpcbf"
        }
      }
    ];

    PHPCBF.prototype.options = {
      PHP: {
        phpcbf_path: true,
        phpcbf_version: true,
        standard: true
      }
    };

    PHPCBF.prototype.beautify = function(text, language, options) {
      var php, phpcbf, standardFile, standardFiles;
      this.debug('phpcbf', options);
      standardFiles = ['phpcs.xml', 'phpcs.xml.dist', 'phpcs.ruleset.xml', 'ruleset.xml'];
      standardFile = this.findFile(atom.project.getPaths()[0], standardFiles);
      if (standardFile) {
        options.standard = standardFile;
      }
      php = this.exe('php');
      phpcbf = this.exe('phpcbf');
      if (options.phpcbf_path) {
        this.deprecateOptionForExecutable("PHPCBF", "PHP - PHPCBF Path (phpcbf_path)", "Path");
      }
      return this.Promise.all([options.phpcbf_path ? this.which(options.phpcbf_path) : void 0, phpcbf.path(), this.tempFile("temp", text, ".php")]).then((function(_this) {
        return function(arg) {
          var customPhpcbfPath, finalPhpcbfPath, isPhpScript, isVersion3, phpcbfPath, tempFile;
          customPhpcbfPath = arg[0], phpcbfPath = arg[1], tempFile = arg[2];
          finalPhpcbfPath = customPhpcbfPath && path.isAbsolute(customPhpcbfPath) ? customPhpcbfPath : phpcbfPath;
          _this.verbose('finalPhpcbfPath', finalPhpcbfPath, phpcbfPath, customPhpcbfPath);
          isVersion3 = (phpcbf.isInstalled && phpcbf.isVersion('3.x')) || (options.phpcbf_version && phpcbf.versionSatisfies(options.phpcbf_version + ".0.0", '3.x'));
          isPhpScript = (finalPhpcbfPath.indexOf(".phar") !== -1) || (finalPhpcbfPath.indexOf(".php") !== -1);
          _this.verbose('isPhpScript', isPhpScript);
          if (isPhpScript) {
            return php.run([phpcbfPath, !isVersion3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile], {
              ignoreReturnCode: true,
              onStdin: function(stdin) {
                return stdin.end();
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return phpcbf.run([!isVersion3 ? "--no-patch" : void 0, options.standard ? "--standard=" + options.standard : void 0, tempFile = _this.tempFile("temp", text, ".php")], {
              ignoreReturnCode: true,
              onStdin: function(stdin) {
                return stdin.end();
              }
            }).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return PHPCBF;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9waHBjYmYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLGtCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztxQkFDckIsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLEtBRFI7UUFFRSxHQUFBLEVBQUssS0FGUDtRQUdFLFFBQUEsRUFBVSxpQkFIWjtRQUlFLFlBQUEsRUFBYyxzQ0FKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcscUJBQVgsQ0FBa0MsQ0FBQSxDQUFBO1VBQTVDLENBREE7U0FMWDtPQURXLEVBVVg7UUFDRSxJQUFBLEVBQU0sUUFEUjtRQUVFLEdBQUEsRUFBSyxRQUZQO1FBR0UsUUFBQSxFQUFVLDhDQUhaO1FBSUUsWUFBQSxFQUFjLDJEQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyx5QkFBWCxDQUFzQyxDQUFBLENBQUE7VUFBaEQsQ0FEQTtTQUxYO1FBUUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLG9CQUREO1NBUlY7T0FWVzs7O3FCQXdCYixPQUFBLEdBQVM7TUFDUCxHQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtRQUNBLGNBQUEsRUFBZ0IsSUFEaEI7UUFFQSxRQUFBLEVBQVUsSUFGVjtPQUZLOzs7cUJBT1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7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QSxFQUFTLFNBQUMsS0FBRDt1QkFDUCxLQUFLLENBQUMsR0FBTixDQUFBO2NBRE8sQ0FGUjthQUpMLENBU0UsQ0FBQyxJQVRILENBU1EsU0FBQTtxQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7WUFESSxDQVRSLEVBZkY7O1FBWk07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSlI7SUFkUTs7OztLQWxDMEI7QUFQdEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9waHBjYmZcclxuIyMjXHJcblxyXG5cInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ0JGIGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiUEhQQ0JGXCJcclxuICBsaW5rOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXHJcbiAgZXhlY3V0YWJsZXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJQSFBcIlxyXG4gICAgICBjbWQ6IFwicGhwXCJcclxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cDovL3BocC5uZXQvXCJcclxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXHJcbiAgICAgIHZlcnNpb246IHtcclxuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL1BIUCAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHtcclxuICAgICAgbmFtZTogXCJQSFBDQkZcIlxyXG4gICAgICBjbWQ6IFwicGhwY2JmXCJcclxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXJcIlxyXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9naXRodWIuY29tL3NxdWl6bGFicy9QSFBfQ29kZVNuaWZmZXIjaW5zdGFsbGF0aW9uXCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvdmVyc2lvbiAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXHJcbiAgICAgIH1cclxuICAgICAgZG9ja2VyOiB7XHJcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvcGhwY2JmXCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIF1cclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgUEhQOlxyXG4gICAgICBwaHBjYmZfcGF0aDogdHJ1ZVxyXG4gICAgICBwaHBjYmZfdmVyc2lvbjogdHJ1ZVxyXG4gICAgICBzdGFuZGFyZDogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIEBkZWJ1ZygncGhwY2JmJywgb3B0aW9ucylcclxuICAgIHN0YW5kYXJkRmlsZXMgPSBbJ3BocGNzLnhtbCcsICdwaHBjcy54bWwuZGlzdCcsICdwaHBjcy5ydWxlc2V0LnhtbCcsICdydWxlc2V0LnhtbCddXHJcbiAgICBzdGFuZGFyZEZpbGUgPSBAZmluZEZpbGUoYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIHN0YW5kYXJkRmlsZXMpXHJcblxyXG4gICAgb3B0aW9ucy5zdGFuZGFyZCA9IHN0YW5kYXJkRmlsZSBpZiBzdGFuZGFyZEZpbGVcclxuXHJcbiAgICBwaHAgPSBAZXhlKCdwaHAnKVxyXG4gICAgcGhwY2JmID0gQGV4ZSgncGhwY2JmJylcclxuXHJcbiAgICBpZiBvcHRpb25zLnBocGNiZl9wYXRoXHJcbiAgICAgIEBkZXByZWNhdGVPcHRpb25Gb3JFeGVjdXRhYmxlKFwiUEhQQ0JGXCIsIFwiUEhQIC0gUEhQQ0JGIFBhdGggKHBocGNiZl9wYXRoKVwiLCBcIlBhdGhcIilcclxuXHJcbiAgICAjIEZpbmQgcGhwY2JmLnBoYXIgc2NyaXB0XHJcbiAgICBAUHJvbWlzZS5hbGwoW1xyXG4gICAgICBAd2hpY2gob3B0aW9ucy5waHBjYmZfcGF0aCkgaWYgb3B0aW9ucy5waHBjYmZfcGF0aFxyXG4gICAgICBwaHBjYmYucGF0aCgpXHJcbiAgICAgIEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dCwgXCIucGhwXCIpXHJcbiAgICBdKS50aGVuKChbY3VzdG9tUGhwY2JmUGF0aCwgcGhwY2JmUGF0aCwgdGVtcEZpbGVdKSA9PlxyXG4gICAgICAjIEdldCBmaXJzdCB2YWxpZCwgYWJzb2x1dGUgcGF0aFxyXG4gICAgICBmaW5hbFBocGNiZlBhdGggPSBpZiBjdXN0b21QaHBjYmZQYXRoIGFuZCBwYXRoLmlzQWJzb2x1dGUoY3VzdG9tUGhwY2JmUGF0aCkgdGhlbiBcXFxyXG4gICAgICAgIGN1c3RvbVBocGNiZlBhdGggZWxzZSBwaHBjYmZQYXRoXHJcbiAgICAgIEB2ZXJib3NlKCdmaW5hbFBocGNiZlBhdGgnLCBmaW5hbFBocGNiZlBhdGgsIHBocGNiZlBhdGgsIGN1c3RvbVBocGNiZlBhdGgpXHJcblxyXG4gICAgICBpc1ZlcnNpb24zID0gKChwaHBjYmYuaXNJbnN0YWxsZWQgYW5kIHBocGNiZi5pc1ZlcnNpb24oJzMueCcpKSBvciBcXFxyXG4gICAgICAgIChvcHRpb25zLnBocGNiZl92ZXJzaW9uIGFuZCBwaHBjYmYudmVyc2lvblNhdGlzZmllcyhcIiN7b3B0aW9ucy5waHBjYmZfdmVyc2lvbn0uMC4wXCIsICczLngnKSkpXHJcblxyXG4gICAgICBpc1BocFNjcmlwdCA9IChmaW5hbFBocGNiZlBhdGguaW5kZXhPZihcIi5waGFyXCIpIGlzbnQgLTEpIG9yIChmaW5hbFBocGNiZlBhdGguaW5kZXhPZihcIi5waHBcIikgaXNudCAtMSlcclxuICAgICAgQHZlcmJvc2UoJ2lzUGhwU2NyaXB0JywgaXNQaHBTY3JpcHQpXHJcblxyXG4gICAgICBpZiBpc1BocFNjcmlwdFxyXG4gICAgICAgIHBocC5ydW4oW1xyXG4gICAgICAgICAgcGhwY2JmUGF0aCxcclxuICAgICAgICAgIFwiLS1uby1wYXRjaFwiIHVubGVzcyBpc1ZlcnNpb24zXHJcbiAgICAgICAgICBcIi0tc3RhbmRhcmQ9I3tvcHRpb25zLnN0YW5kYXJkfVwiIGlmIG9wdGlvbnMuc3RhbmRhcmRcclxuICAgICAgICAgIHRlbXBGaWxlXHJcbiAgICAgICAgICBdLCB7XHJcbiAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcclxuICAgICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxyXG4gICAgICAgICAgICAgIHN0ZGluLmVuZCgpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oPT5cclxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxyXG4gICAgICAgICAgKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcGhwY2JmLnJ1bihbXHJcbiAgICAgICAgICBcIi0tbm8tcGF0Y2hcIiB1bmxlc3MgaXNWZXJzaW9uM1xyXG4gICAgICAgICAgXCItLXN0YW5kYXJkPSN7b3B0aW9ucy5zdGFuZGFyZH1cIiBpZiBvcHRpb25zLnN0YW5kYXJkXHJcbiAgICAgICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcInRlbXBcIiwgdGV4dCwgXCIucGhwXCIpXHJcbiAgICAgICAgICBdLCB7XHJcbiAgICAgICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcclxuICAgICAgICAgICAgb25TdGRpbjogKHN0ZGluKSAtPlxyXG4gICAgICAgICAgICAgIHN0ZGluLmVuZCgpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oPT5cclxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxyXG4gICAgICAgICAgKVxyXG4gICAgICApXHJcbiJdfQ==
