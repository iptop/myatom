
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Autopep8, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Autopep8 = (function(superClass) {
    extend(Autopep8, superClass);

    function Autopep8() {
      return Autopep8.__super__.constructor.apply(this, arguments);
    }

    Autopep8.prototype.name = "autopep8";

    Autopep8.prototype.link = "https://github.com/hhatto/autopep8";

    Autopep8.prototype.executables = [
      {
        name: "autopep8",
        cmd: "autopep8",
        homepage: "https://github.com/hhatto/autopep8",
        installation: "https://github.com/hhatto/autopep8#installation",
        version: {
          parse: function(text) {
            try {
              return text.match(/autopep8 (\d+\.\d+\.\d+)/)[1];
            } catch (error) {
              return text.match(/autopep8 (\d+\.\d+)/)[1] + ".0";
            }
          },
          runOptions: {
            returnStdoutOrStderr: true
          }
        },
        docker: {
          image: "unibeautify/autopep8"
        }
      }, {
        name: "isort",
        cmd: "isort",
        optional: true,
        homepage: "https://github.com/timothycrosley/isort",
        installation: "https://github.com/timothycrosley/isort#installing-isort",
        version: {
          parse: function(text) {
            return text.match(/VERSION (\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options, context) {
      var tempFile;
      if (context == null) {
        context = {};
      }
      return this.exe("autopep8").run([tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0]).then((function(_this) {
        return function() {
          var filePath, projectPath;
          if (options.sort_imports) {
            filePath = context.filePath;
            projectPath = typeof atom !== "undefined" && atom !== null ? atom.project.relativizePath(filePath)[0] : void 0;
            return _this.exe("isort").run(["-sp", projectPath, tempFile]);
          }
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return Autopep8;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9hdXRvcGVwOC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsb0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3VCQUVyQixJQUFBLEdBQU07O3VCQUNOLElBQUEsR0FBTTs7dUJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sVUFEUjtRQUVFLEdBQUEsRUFBSyxVQUZQO1FBR0UsUUFBQSxFQUFVLG9DQUhaO1FBSUUsWUFBQSxFQUFjLGlEQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7QUFDTDtxQkFDRSxJQUFJLENBQUMsS0FBTCxDQUFXLDBCQUFYLENBQXVDLENBQUEsQ0FBQSxFQUR6QzthQUFBLGFBQUE7cUJBR0UsSUFBSSxDQUFDLEtBQUwsQ0FBVyxxQkFBWCxDQUFrQyxDQUFBLENBQUEsQ0FBbEMsR0FBdUMsS0FIekM7O1VBREssQ0FEQTtVQU1QLFVBQUEsRUFBWTtZQUNWLG9CQUFBLEVBQXNCLElBRFo7V0FOTDtTQUxYO1FBZUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLHNCQUREO1NBZlY7T0FEVyxFQW9CWDtRQUNFLElBQUEsRUFBTSxPQURSO1FBRUUsR0FBQSxFQUFLLE9BRlA7UUFHRSxRQUFBLEVBQVUsSUFIWjtRQUlFLFFBQUEsRUFBVSx5Q0FKWjtRQUtFLFlBQUEsRUFBYywwREFMaEI7UUFNRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcseUJBQVgsQ0FBc0MsQ0FBQSxDQUFBO1VBQWhELENBREE7U0FOWDtPQXBCVzs7O3VCQWdDYixPQUFBLEdBQVM7TUFDUCxNQUFBLEVBQVEsSUFERDs7O3VCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBQ1IsVUFBQTs7UUFEa0MsVUFBVTs7YUFDNUMsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLENBQWdCLENBQUMsR0FBakIsQ0FBcUIsQ0FDakIsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURNLEVBRWpCLElBRmlCLEVBR3NDLCtCQUF2RCxHQUFBLENBQUMsbUJBQUQsRUFBc0IsRUFBQSxHQUFHLE9BQU8sQ0FBQyxlQUFqQyxDQUFBLEdBQUEsTUFIaUIsRUFJNkIsMkJBQTlDLEdBQUEsQ0FBQyxlQUFELEVBQWlCLEVBQUEsR0FBRyxPQUFPLENBQUMsV0FBNUIsQ0FBQSxHQUFBLE1BSmlCLEVBSzZCLHNCQUE5QyxHQUFBLENBQUMsVUFBRCxFQUFZLEVBQUEsR0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBZixDQUFvQixHQUFwQixDQUFELENBQWQsQ0FBQSxHQUFBLE1BTGlCLENBQXJCLENBT0UsQ0FBQyxJQVBILENBT1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ0osY0FBQTtVQUFBLElBQUcsT0FBTyxDQUFDLFlBQVg7WUFDRSxRQUFBLEdBQVcsT0FBTyxDQUFDO1lBQ25CLFdBQUEsa0RBQWMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxjQUFkLENBQTZCLFFBQTdCLENBQXVDLENBQUEsQ0FBQTttQkFDckQsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLENBQWEsQ0FBQyxHQUFkLENBQWtCLENBQUMsS0FBRCxFQUFRLFdBQVIsRUFBcUIsUUFBckIsQ0FBbEIsRUFIRjs7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FQUixDQWFFLENBQUMsSUFiSCxDQWFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FiUjtJQURROzs7O0tBeEM0QjtBQVB4QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XHJcbiMjI1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEF1dG9wZXA4IGV4dGVuZHMgQmVhdXRpZmllclxyXG5cclxuICBuYW1lOiBcImF1dG9wZXA4XCJcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxyXG4gIGV4ZWN1dGFibGVzOiBbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwiYXV0b3BlcDhcIlxyXG4gICAgICBjbWQ6IFwiYXV0b3BlcDhcIlxyXG4gICAgICBob21lcGFnZTogXCJodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XCJcclxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDgjaW5zdGFsbGF0aW9uXCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT5cclxuICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICB0ZXh0Lm1hdGNoKC9hdXRvcGVwOCAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXHJcbiAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICB0ZXh0Lm1hdGNoKC9hdXRvcGVwOCAoXFxkK1xcLlxcZCspLylbMV0gKyBcIi4wXCJcclxuICAgICAgICBydW5PcHRpb25zOiB7XHJcbiAgICAgICAgICByZXR1cm5TdGRvdXRPclN0ZGVycjogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBkb2NrZXI6IHtcclxuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9hdXRvcGVwOFwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHtcclxuICAgICAgbmFtZTogXCJpc29ydFwiXHJcbiAgICAgIGNtZDogXCJpc29ydFwiXHJcbiAgICAgIG9wdGlvbmFsOiB0cnVlXHJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aW1vdGh5Y3Jvc2xleS9pc29ydFwiXHJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vdGltb3RoeWNyb3NsZXkvaXNvcnQjaW5zdGFsbGluZy1pc29ydFwiXHJcbiAgICAgIHZlcnNpb246IHtcclxuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL1ZFUlNJT04gKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBQeXRob246IHRydWVcclxuICB9XHJcblxyXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQgPSB7fSkgLT5cclxuICAgIEBleGUoXCJhdXRvcGVwOFwiKS5ydW4oW1xyXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcclxuICAgICAgICBcIi1pXCJcclxuICAgICAgICBbXCItLW1heC1saW5lLWxlbmd0aFwiLCBcIiN7b3B0aW9ucy5tYXhfbGluZV9sZW5ndGh9XCJdIGlmIG9wdGlvbnMubWF4X2xpbmVfbGVuZ3RoP1xyXG4gICAgICAgIFtcIi0taW5kZW50LXNpemVcIixcIiN7b3B0aW9ucy5pbmRlbnRfc2l6ZX1cIl0gaWYgb3B0aW9ucy5pbmRlbnRfc2l6ZT9cclxuICAgICAgICBbXCItLWlnbm9yZVwiLFwiI3tvcHRpb25zLmlnbm9yZS5qb2luKCcsJyl9XCJdIGlmIG9wdGlvbnMuaWdub3JlP1xyXG4gICAgICBdKVxyXG4gICAgICAudGhlbig9PlxyXG4gICAgICAgIGlmIG9wdGlvbnMuc29ydF9pbXBvcnRzXHJcbiAgICAgICAgICBmaWxlUGF0aCA9IGNvbnRleHQuZmlsZVBhdGhcclxuICAgICAgICAgIHByb2plY3RQYXRoID0gYXRvbT8ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMF1cclxuICAgICAgICAgIEBleGUoXCJpc29ydFwiKS5ydW4oW1wiLXNwXCIsIHByb2plY3RQYXRoLCB0ZW1wRmlsZV0pXHJcbiAgICAgIClcclxuICAgICAgLnRoZW4oPT4gQHJlYWRGaWxlKHRlbXBGaWxlKSlcclxuIl19
