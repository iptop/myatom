
/*
Requires https://github.com/rust-lang-nursery/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt, path, versionCheckState,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  versionCheckState = false;

  module.exports = Rustfmt = (function(superClass) {
    extend(Rustfmt, superClass);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.link = "https://github.com/rust-lang-nursery/rustfmt";

    Rustfmt.prototype.isPreInstalled = false;

    Rustfmt.prototype.options = {
      Rust: true
    };

    Rustfmt.prototype.beautify = function(text, language, options, context) {
      var cwd, help, p, program;
      cwd = context.filePath && path.dirname(context.filePath);
      program = options.rustfmt_path || "rustfmt";
      help = {
        link: "https://github.com/rust-lang-nursery/rustfmt",
        program: "rustfmt",
        pathOption: "Rust - Rustfmt Path"
      };
      p = versionCheckState === program ? this.Promise.resolve() : this.run(program, ["--version"], {
        help: help
      }).then(function(stdout) {
        if (/^0\.(?:[0-4]\.[0-9])(?!-nightly)/.test(stdout.trim())) {
          versionCheckState = false;
          throw new Error("rustfmt version 0.5.0 or newer required");
        } else {
          versionCheckState = program;
          return void 0;
        }
      });
      return p.then((function(_this) {
        return function() {
          return _this.run(program, [], {
            cwd: cwd,
            help: help,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          });
        };
      })(this));
    };

    return Rustfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9ydXN0Zm10LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSw0Q0FBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLGlCQUFBLEdBQW9COztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUNOLGNBQUEsR0FBZ0I7O3NCQUVoQixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQU0sSUFEQzs7O3NCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTtNQUFBLEdBQUEsR0FBTSxPQUFPLENBQUMsUUFBUixJQUFxQixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQU8sQ0FBQyxRQUFyQjtNQUMzQixPQUFBLEdBQVUsT0FBTyxDQUFDLFlBQVIsSUFBd0I7TUFDbEMsSUFBQSxHQUFPO1FBQ0wsSUFBQSxFQUFNLDhDQUREO1FBRUwsT0FBQSxFQUFTLFNBRko7UUFHTCxVQUFBLEVBQVkscUJBSFA7O01BU1AsQ0FBQSxHQUFPLGlCQUFBLEtBQXFCLE9BQXhCLEdBQ0YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsQ0FERSxHQUdGLElBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLENBQUMsV0FBRCxDQUFkLEVBQTZCO1FBQUEsSUFBQSxFQUFNLElBQU47T0FBN0IsQ0FDRSxDQUFDLElBREgsQ0FDUSxTQUFDLE1BQUQ7UUFDSixJQUFHLGtDQUFrQyxDQUFDLElBQW5DLENBQXdDLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBeEMsQ0FBSDtVQUNFLGlCQUFBLEdBQW9CO0FBQ3BCLGdCQUFVLElBQUEsS0FBQSxDQUFNLHlDQUFOLEVBRlo7U0FBQSxNQUFBO1VBSUUsaUJBQUEsR0FBb0I7aUJBQ3BCLE9BTEY7O01BREksQ0FEUjthQVVGLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNMLEtBQUMsQ0FBQSxHQUFELENBQUssT0FBTCxFQUFjLEVBQWQsRUFBa0I7WUFDaEIsR0FBQSxFQUFLLEdBRFc7WUFFaEIsSUFBQSxFQUFNLElBRlU7WUFHaEIsT0FBQSxFQUFTLFNBQUMsS0FBRDtxQkFDUCxLQUFLLENBQUMsR0FBTixDQUFVLElBQVY7WUFETyxDQUhPO1dBQWxCO1FBREs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVA7SUF6QlE7Ozs7S0FUMkI7QUFWdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL3J1c3QtbGFuZy1udXJzZXJ5L3J1c3RmbXRcclxuIyMjXHJcblxyXG5cInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxyXG5cclxudmVyc2lvbkNoZWNrU3RhdGUgPSBmYWxzZVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdXN0Zm10IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwicnVzdGZtdFwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vcnVzdC1sYW5nLW51cnNlcnkvcnVzdGZtdFwiXHJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXHJcblxyXG4gIG9wdGlvbnM6IHtcclxuICAgIFJ1c3Q6IHRydWVcclxuICB9XHJcblxyXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XHJcbiAgICBjd2QgPSBjb250ZXh0LmZpbGVQYXRoIGFuZCBwYXRoLmRpcm5hbWUgY29udGV4dC5maWxlUGF0aFxyXG4gICAgcHJvZ3JhbSA9IG9wdGlvbnMucnVzdGZtdF9wYXRoIG9yIFwicnVzdGZtdFwiXHJcbiAgICBoZWxwID0ge1xyXG4gICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9ydXN0LWxhbmctbnVyc2VyeS9ydXN0Zm10XCJcclxuICAgICAgcHJvZ3JhbTogXCJydXN0Zm10XCJcclxuICAgICAgcGF0aE9wdGlvbjogXCJSdXN0IC0gUnVzdGZtdCBQYXRoXCJcclxuICAgIH1cclxuXHJcbiAgICAjIDAuNS4wIGlzIGEgcmVsYXRpdmVseSBuZXcgdmVyc2lvbiBhdCB0aGUgcG9pbnQgb2Ygd3JpdGluZyxcclxuICAgICMgYnV0IGlzIGVzc2VudGlhbCBmb3IgdGhpcyB0byB3b3JrIHdpdGggc3RkaW4uXHJcbiAgICAjID0+IENoZWNrIGZvciBpdCBzcGVjaWZpY2FsbHkuXHJcbiAgICBwID0gaWYgdmVyc2lvbkNoZWNrU3RhdGUgPT0gcHJvZ3JhbVxyXG4gICAgICBAUHJvbWlzZS5yZXNvbHZlKClcclxuICAgIGVsc2VcclxuICAgICAgQHJ1bihwcm9ncmFtLCBbXCItLXZlcnNpb25cIl0sIGhlbHA6IGhlbHApXHJcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgLT5cclxuICAgICAgICAgIGlmIC9eMFxcLig/OlswLTRdXFwuWzAtOV0pKD8hLW5pZ2h0bHkpLy50ZXN0KHN0ZG91dC50cmltKCkpXHJcbiAgICAgICAgICAgIHZlcnNpb25DaGVja1N0YXRlID0gZmFsc2VcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicnVzdGZtdCB2ZXJzaW9uIDAuNS4wIG9yIG5ld2VyIHJlcXVpcmVkXCIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHZlcnNpb25DaGVja1N0YXRlID0gcHJvZ3JhbVxyXG4gICAgICAgICAgICB1bmRlZmluZWRcclxuICAgICAgICApXHJcblxyXG4gICAgcC50aGVuKD0+XHJcbiAgICAgIEBydW4ocHJvZ3JhbSwgW10sIHtcclxuICAgICAgICBjd2Q6IGN3ZFxyXG4gICAgICAgIGhlbHA6IGhlbHBcclxuICAgICAgICBvblN0ZGluOiAoc3RkaW4pIC0+XHJcbiAgICAgICAgICBzdGRpbi5lbmQgdGV4dFxyXG4gICAgICB9KVxyXG4gICAgKVxyXG4iXX0=
