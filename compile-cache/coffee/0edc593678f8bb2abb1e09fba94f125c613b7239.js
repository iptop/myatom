
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var Beautifier, Uncrustify, _, cfg, expandHomeDir, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  _ = require('lodash');

  module.exports = Uncrustify = (function(superClass) {
    extend(Uncrustify, superClass);

    function Uncrustify() {
      return Uncrustify.__super__.constructor.apply(this, arguments);
    }

    Uncrustify.prototype.name = "Uncrustify";

    Uncrustify.prototype.link = "https://github.com/uncrustify/uncrustify";

    Uncrustify.prototype.executables = [
      {
        name: "Uncrustify",
        cmd: "uncrustify",
        homepage: "http://uncrustify.sourceforge.net/",
        installation: "https://github.com/uncrustify/uncrustify",
        version: {
          parse: function(text) {
            var error, v;
            try {
              v = text.match(/uncrustify (\d+\.\d+)/)[1];
            } catch (error1) {
              error = error1;
              this.error(error);
              if (v == null) {
                v = text.match(/Uncrustify-(\d+\.\d+)/)[1];
              }
            }
            if (v) {
              return v + ".0";
            }
          }
        },
        docker: {
          image: "unibeautify/uncrustify"
        }
      }
    ];

    Uncrustify.prototype.options = {
      Apex: true,
      C: true,
      "C++": true,
      "C#": true,
      "Objective-C": true,
      D: true,
      Pawn: true,
      Vala: true,
      Java: true,
      Arduino: true
    };

    Uncrustify.prototype.beautify = function(text, language, options, context) {
      var fileExtension, uncrustify;
      fileExtension = context.fileExtension;
      uncrustify = this.exe("uncrustify");
      return new this.Promise(function(resolve, reject) {
        var basePath, configPath, editor, expandedConfigPath, projectPath;
        configPath = options.configPath;
        if (!configPath) {
          return cfg(options, function(error, cPath) {
            if (error) {
              throw error;
            }
            return resolve(cPath);
          });
        } else {
          editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            basePath = path.dirname(editor.getPath());
            projectPath = atom.workspace.project.getPaths()[0];
            expandedConfigPath = expandHomeDir(configPath);
            configPath = path.resolve(projectPath, expandedConfigPath);
            return resolve(configPath);
          } else {
            return reject(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
          }
        }
      }).then((function(_this) {
        return function(configPath) {
          var lang, outputFile;
          lang = "C";
          switch (language) {
            case "Apex":
              lang = "Apex";
              break;
            case "C":
              lang = "C";
              break;
            case "C++":
              lang = "CPP";
              break;
            case "C#":
              lang = "CS";
              break;
            case "Objective-C":
            case "Objective-C++":
              lang = "OC+";
              break;
            case "D":
              lang = "D";
              break;
            case "Pawn":
              lang = "PAWN";
              break;
            case "Vala":
              lang = "VALA";
              break;
            case "Java":
              lang = "JAVA";
              break;
            case "Arduino":
              lang = "CPP";
          }
          return uncrustify.run(["-c", configPath, "-f", _this.tempFile("input", text, fileExtension && ("." + fileExtension)), "-o", outputFile = _this.tempFile("output", text, fileExtension && ("." + fileExtension)), "-l", lang]).then(function() {
            return _this.readFile(outputFile);
          });
        };
      })(this));
    };

    return Uncrustify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy91bmNydXN0aWZ5L2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQSxtREFBQTtJQUFBOzs7RUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUNOLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxpQkFBUjs7RUFDaEIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3lCQUNyQixJQUFBLEdBQU07O3lCQUNOLElBQUEsR0FBTTs7eUJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sWUFEUjtRQUVFLEdBQUEsRUFBSyxZQUZQO1FBR0UsUUFBQSxFQUFVLG9DQUhaO1FBSUUsWUFBQSxFQUFjLDBDQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7QUFDTCxnQkFBQTtBQUFBO2NBQ0UsQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsdUJBQVgsQ0FBb0MsQ0FBQSxDQUFBLEVBRDFDO2FBQUEsY0FBQTtjQUVNO2NBQ0osSUFBQyxDQUFBLEtBQUQsQ0FBTyxLQUFQO2NBQ0EsSUFBa0QsU0FBbEQ7Z0JBQUEsQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsdUJBQVgsQ0FBb0MsQ0FBQSxDQUFBLEVBQXhDO2VBSkY7O1lBS0EsSUFBRyxDQUFIO0FBQ0UscUJBQU8sQ0FBQSxHQUFJLEtBRGI7O1VBTkssQ0FEQTtTQUxYO1FBZUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLHdCQUREO1NBZlY7T0FEVzs7O3lCQXNC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Qkk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBckJLO0lBTEg7Ozs7S0F0QzhCO0FBVjFDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcblJlcXVpcmVzIGh0dHA6Ly91bmNydXN0aWZ5LnNvdXJjZWZvcmdlLm5ldC9cclxuIyMjXHJcblwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcclxuY2ZnID0gcmVxdWlyZShcIi4vY2ZnXCIpXHJcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxyXG5leHBhbmRIb21lRGlyID0gcmVxdWlyZSgnZXhwYW5kLWhvbWUtZGlyJylcclxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFVuY3J1c3RpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgbmFtZTogXCJVbmNydXN0aWZ5XCJcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS91bmNydXN0aWZ5L3VuY3J1c3RpZnlcIlxyXG4gIGV4ZWN1dGFibGVzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwiVW5jcnVzdGlmeVwiXHJcbiAgICAgIGNtZDogXCJ1bmNydXN0aWZ5XCJcclxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cDovL3VuY3J1c3RpZnkuc291cmNlZm9yZ2UubmV0L1wiXHJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vdW5jcnVzdGlmeS91bmNydXN0aWZ5XCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT5cclxuICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICB2ID0gdGV4dC5tYXRjaCgvdW5jcnVzdGlmeSAoXFxkK1xcLlxcZCspLylbMV1cclxuICAgICAgICAgIGNhdGNoIGVycm9yXHJcbiAgICAgICAgICAgIEBlcnJvcihlcnJvcilcclxuICAgICAgICAgICAgdiA9IHRleHQubWF0Y2goL1VuY3J1c3RpZnktKFxcZCtcXC5cXGQrKS8pWzFdIGlmIG5vdCB2P1xyXG4gICAgICAgICAgaWYgdlxyXG4gICAgICAgICAgICByZXR1cm4gdiArIFwiLjBcIlxyXG4gICAgICB9XHJcbiAgICAgIGRvY2tlcjoge1xyXG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L3VuY3J1c3RpZnlcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBBcGV4OiB0cnVlXHJcbiAgICBDOiB0cnVlXHJcbiAgICBcIkMrK1wiOiB0cnVlXHJcbiAgICBcIkMjXCI6IHRydWVcclxuICAgIFwiT2JqZWN0aXZlLUNcIjogdHJ1ZVxyXG4gICAgRDogdHJ1ZVxyXG4gICAgUGF3bjogdHJ1ZVxyXG4gICAgVmFsYTogdHJ1ZVxyXG4gICAgSmF2YTogdHJ1ZVxyXG4gICAgQXJkdWlubzogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cclxuICAgIGZpbGVFeHRlbnNpb24gPSBjb250ZXh0LmZpbGVFeHRlbnNpb25cclxuXHJcbiAgICB1bmNydXN0aWZ5ID0gQGV4ZShcInVuY3J1c3RpZnlcIilcclxuICAgICMgY29uc29sZS5sb2coJ3VuY3J1c3RpZnkuYmVhdXRpZnknLCBsYW5ndWFnZSwgb3B0aW9ucylcclxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgICAgY29uZmlnUGF0aCA9IG9wdGlvbnMuY29uZmlnUGF0aFxyXG4gICAgICB1bmxlc3MgY29uZmlnUGF0aFxyXG4gICAgICAgICMgTm8gY3VzdG9tIGNvbmZpZyBwYXRoXHJcbiAgICAgICAgY2ZnIG9wdGlvbnMsIChlcnJvciwgY1BhdGgpIC0+XHJcbiAgICAgICAgICB0aHJvdyBlcnJvciBpZiBlcnJvclxyXG4gICAgICAgICAgcmVzb2x2ZSBjUGF0aFxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgIyBIYXMgY3VzdG9tIGNvbmZpZyBwYXRoXHJcbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXHJcbiAgICAgICAgaWYgZWRpdG9yP1xyXG4gICAgICAgICAgYmFzZVBhdGggPSBwYXRoLmRpcm5hbWUoZWRpdG9yLmdldFBhdGgoKSlcclxuICAgICAgICAgIHByb2plY3RQYXRoID0gYXRvbS53b3Jrc3BhY2UucHJvamVjdC5nZXRQYXRocygpWzBdXHJcbiAgICAgICAgICAjIGNvbnNvbGUubG9nKGJhc2VQYXRoKTtcclxuICAgICAgICAgICMgRXhwYW5kIEhvbWUgRGlyZWN0b3J5IGluIENvbmZpZyBQYXRoXHJcbiAgICAgICAgICBleHBhbmRlZENvbmZpZ1BhdGggPSBleHBhbmRIb21lRGlyKGNvbmZpZ1BhdGgpXHJcbiAgICAgICAgICBjb25maWdQYXRoID0gcGF0aC5yZXNvbHZlKHByb2plY3RQYXRoLCBleHBhbmRlZENvbmZpZ1BhdGgpXHJcbiAgICAgICAgICByZXNvbHZlIGNvbmZpZ1BhdGhcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiTm8gVW5jcnVzdGlmeSBDb25maWcgUGF0aCBzZXQhIFBsZWFzZSBjb25maWd1cmUgVW5jcnVzdGlmeSB3aXRoIEF0b20gQmVhdXRpZnkuXCIpKVxyXG4gICAgKVxyXG4gICAgLnRoZW4oKGNvbmZpZ1BhdGgpID0+XHJcbiAgICAgICMgU2VsZWN0IFVuY3J1c3RpZnkgbGFuZ3VhZ2VcclxuICAgICAgbGFuZyA9IFwiQ1wiICMgRGVmYXVsdCBpcyBDXHJcbiAgICAgIHN3aXRjaCBsYW5ndWFnZVxyXG4gICAgICAgIHdoZW4gXCJBcGV4XCJcclxuICAgICAgICAgIGxhbmcgPSBcIkFwZXhcIlxyXG4gICAgICAgIHdoZW4gXCJDXCJcclxuICAgICAgICAgIGxhbmcgPSBcIkNcIlxyXG4gICAgICAgIHdoZW4gXCJDKytcIlxyXG4gICAgICAgICAgbGFuZyA9IFwiQ1BQXCJcclxuICAgICAgICB3aGVuIFwiQyNcIlxyXG4gICAgICAgICAgbGFuZyA9IFwiQ1NcIlxyXG4gICAgICAgIHdoZW4gXCJPYmplY3RpdmUtQ1wiLCBcIk9iamVjdGl2ZS1DKytcIlxyXG4gICAgICAgICAgbGFuZyA9IFwiT0MrXCJcclxuICAgICAgICB3aGVuIFwiRFwiXHJcbiAgICAgICAgICBsYW5nID0gXCJEXCJcclxuICAgICAgICB3aGVuIFwiUGF3blwiXHJcbiAgICAgICAgICBsYW5nID0gXCJQQVdOXCJcclxuICAgICAgICB3aGVuIFwiVmFsYVwiXHJcbiAgICAgICAgICBsYW5nID0gXCJWQUxBXCJcclxuICAgICAgICB3aGVuIFwiSmF2YVwiXHJcbiAgICAgICAgICBsYW5nID0gXCJKQVZBXCJcclxuICAgICAgICB3aGVuIFwiQXJkdWlub1wiXHJcbiAgICAgICAgICBsYW5nID0gXCJDUFBcIlxyXG5cclxuICAgICAgdW5jcnVzdGlmeS5ydW4oW1xyXG4gICAgICAgIFwiLWNcIlxyXG4gICAgICAgIGNvbmZpZ1BhdGhcclxuICAgICAgICBcIi1mXCJcclxuICAgICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0LCBmaWxlRXh0ZW5zaW9uIGFuZCBcIi4je2ZpbGVFeHRlbnNpb259XCIpXHJcbiAgICAgICAgXCItb1wiXHJcbiAgICAgICAgb3V0cHV0RmlsZSA9IEB0ZW1wRmlsZShcIm91dHB1dFwiLCB0ZXh0LCBmaWxlRXh0ZW5zaW9uIGFuZCBcIi4je2ZpbGVFeHRlbnNpb259XCIpXHJcbiAgICAgICAgXCItbFwiXHJcbiAgICAgICAgbGFuZ1xyXG4gICAgICAgIF0pXHJcbiAgICAgICAgLnRoZW4oPT5cclxuICAgICAgICAgIEByZWFkRmlsZShvdXRwdXRGaWxlKVxyXG4gICAgICAgIClcclxuICAgIClcclxuIl19
