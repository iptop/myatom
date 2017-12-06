
/*
Requires clang-format (https://clang.llvm.org)
 */

(function() {
  "use strict";
  var Beautifier, ClangFormat, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  fs = require('fs');

  module.exports = ClangFormat = (function(superClass) {
    extend(ClangFormat, superClass);

    function ClangFormat() {
      return ClangFormat.__super__.constructor.apply(this, arguments);
    }

    ClangFormat.prototype.name = "clang-format";

    ClangFormat.prototype.link = "https://clang.llvm.org/docs/ClangFormat.html";

    ClangFormat.prototype.executables = [
      {
        name: "ClangFormat",
        cmd: "clang-format",
        homepage: "https://clang.llvm.org/docs/ClangFormat.html",
        installation: "https://clang.llvm.org/docs/ClangFormat.html",
        version: {
          parse: function(text) {
            return text.match(/version (\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "unibeautify/clang-format"
        }
      }
    ];

    ClangFormat.prototype.options = {
      "C++": false,
      "C": false,
      "Objective-C": false,
      "GLSL": true
    };


    /*
      Dump contents to a given file
     */

    ClangFormat.prototype.dumpToFile = function(name, contents) {
      if (name == null) {
        name = "atom-beautify-dump";
      }
      if (contents == null) {
        contents = "";
      }
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          return fs.open(name, "w", function(err, fd) {
            _this.debug('dumpToFile', name, err, fd);
            if (err) {
              return reject(err);
            }
            return fs.write(fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(name);
              });
            });
          });
        };
      })(this));
    };

    ClangFormat.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var currDir, currFile, dumpFile, editor, fullPath, ref;
        editor = typeof atom !== "undefined" && atom !== null ? (ref = atom.workspace) != null ? ref.getActiveTextEditor() : void 0 : void 0;
        if (editor != null) {
          fullPath = editor.getPath();
          currDir = path.dirname(fullPath);
          currFile = path.basename(fullPath);
          dumpFile = path.join(currDir, ".atom-beautify." + currFile);
          return resolve(dumpFile);
        } else {
          return reject(new Error("No active editor found!"));
        }
      }).then((function(_this) {
        return function(dumpFile) {
          return _this.exe("clang-format").run([_this.dumpToFile(dumpFile, text), ["--style=file"]])["finally"](function() {
            return fs.unlink(dumpFile);
          });
        };
      })(this));
    };

    return ClangFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jbGFuZy1mb3JtYXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLGlDQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzBCQUVyQixJQUFBLEdBQU07OzBCQUNOLElBQUEsR0FBTTs7MEJBQ04sV0FBQSxHQUFhO01BQ1g7UUFDRSxJQUFBLEVBQU0sYUFEUjtRQUVFLEdBQUEsRUFBSyxjQUZQO1FBR0UsUUFBQSxFQUFVLDhDQUhaO1FBSUUsWUFBQSxFQUFjLDhDQUpoQjtRQUtFLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyx5QkFBWCxDQUFzQyxDQUFBLENBQUE7VUFBaEQsQ0FEQTtTQUxYO1FBUUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLDBCQUREO1NBUlY7T0FEVzs7OzBCQWViLE9BQUEsR0FBUztNQUNQLEtBQUEsRUFBTyxLQURBO01BRVAsR0FBQSxFQUFLLEtBRkU7TUFHUCxhQUFBLEVBQWUsS0FIUjtNQUlQLE1BQUEsRUFBUSxJQUpEOzs7O0FBT1Q7Ozs7MEJBR0EsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUE4QixRQUE5Qjs7UUFBQyxPQUFPOzs7UUFBc0IsV0FBVzs7QUFDbkQsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO2lCQUNsQixFQUFFLENBQUMsSUFBSCxDQUFRLElBQVIsRUFBYyxHQUFkLEVBQW1CLFNBQUMsR0FBRCxFQUFNLEVBQU47WUFDakIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQLEVBQXFCLElBQXJCLEVBQTJCLEdBQTNCLEVBQWdDLEVBQWhDO1lBQ0EsSUFBc0IsR0FBdEI7QUFBQSxxQkFBTyxNQUFBLENBQU8sR0FBUCxFQUFQOzttQkFDQSxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFBYSxRQUFiLEVBQXVCLFNBQUMsR0FBRDtjQUNyQixJQUFzQixHQUF0QjtBQUFBLHVCQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O3FCQUNBLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxFQUFhLFNBQUMsR0FBRDtnQkFDWCxJQUFzQixHQUF0QjtBQUFBLHlCQUFPLE1BQUEsQ0FBTyxHQUFQLEVBQVA7O3VCQUNBLE9BQUEsQ0FBUSxJQUFSO2NBRlcsQ0FBYjtZQUZxQixDQUF2QjtVQUhpQixDQUFuQjtRQURrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtJQUREOzswQkFlWixRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQWFSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLE1BQUEsc0ZBQXdCLENBQUUsbUJBQWpCLENBQUE7UUFDVCxJQUFHLGNBQUg7VUFDRSxRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQVAsQ0FBQTtVQUNYLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWI7VUFDVixRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxRQUFkO1VBQ1gsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixpQkFBQSxHQUFrQixRQUFyQztpQkFDWCxPQUFBLENBQVEsUUFBUixFQUxGO1NBQUEsTUFBQTtpQkFPRSxNQUFBLENBQVcsSUFBQSxLQUFBLENBQU0seUJBQU4sQ0FBWCxFQVBGOztNQUZrQixDQUFULENBV1gsQ0FBQyxJQVhVLENBV0wsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQ7QUFFSixpQkFBTyxLQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixDQUM5QixLQUFDLENBQUEsVUFBRCxDQUFZLFFBQVosRUFBc0IsSUFBdEIsQ0FEOEIsRUFFOUIsQ0FBQyxjQUFELENBRjhCLENBQXpCLENBR0gsRUFBQyxPQUFELEVBSEcsQ0FHTyxTQUFBO21CQUNWLEVBQUUsQ0FBQyxNQUFILENBQVUsUUFBVjtVQURVLENBSFA7UUFGSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FYSztJQWJIOzs7O0tBNUMrQjtBQVQzQyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xyXG5SZXF1aXJlcyBjbGFuZy1mb3JtYXQgKGh0dHBzOi8vY2xhbmcubGx2bS5vcmcpXHJcbiMjI1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcclxuZnMgPSByZXF1aXJlKCdmcycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIENsYW5nRm9ybWF0IGV4dGVuZHMgQmVhdXRpZmllclxyXG5cclxuICBuYW1lOiBcImNsYW5nLWZvcm1hdFwiXHJcbiAgbGluazogXCJodHRwczovL2NsYW5nLmxsdm0ub3JnL2RvY3MvQ2xhbmdGb3JtYXQuaHRtbFwiXHJcbiAgZXhlY3V0YWJsZXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJDbGFuZ0Zvcm1hdFwiXHJcbiAgICAgIGNtZDogXCJjbGFuZy1mb3JtYXRcIlxyXG4gICAgICBob21lcGFnZTogXCJodHRwczovL2NsYW5nLmxsdm0ub3JnL2RvY3MvQ2xhbmdGb3JtYXQuaHRtbFwiXHJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2NsYW5nLmxsdm0ub3JnL2RvY3MvQ2xhbmdGb3JtYXQuaHRtbFwiXHJcbiAgICAgIHZlcnNpb246IHtcclxuICAgICAgICBwYXJzZTogKHRleHQpIC0+IHRleHQubWF0Y2goL3ZlcnNpb24gKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxyXG4gICAgICB9XHJcbiAgICAgIGRvY2tlcjoge1xyXG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L2NsYW5nLWZvcm1hdFwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdXHJcblxyXG4gIG9wdGlvbnM6IHtcclxuICAgIFwiQysrXCI6IGZhbHNlXHJcbiAgICBcIkNcIjogZmFsc2VcclxuICAgIFwiT2JqZWN0aXZlLUNcIjogZmFsc2VcclxuICAgIFwiR0xTTFwiOiB0cnVlXHJcbiAgfVxyXG5cclxuICAjIyNcclxuICAgIER1bXAgY29udGVudHMgdG8gYSBnaXZlbiBmaWxlXHJcbiAgIyMjXHJcbiAgZHVtcFRvRmlsZTogKG5hbWUgPSBcImF0b20tYmVhdXRpZnktZHVtcFwiLCBjb250ZW50cyA9IFwiXCIpIC0+XHJcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XHJcbiAgICAgIGZzLm9wZW4obmFtZSwgXCJ3XCIsIChlcnIsIGZkKSA9PlxyXG4gICAgICAgIEBkZWJ1ZygnZHVtcFRvRmlsZScsIG5hbWUsIGVyciwgZmQpXHJcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxyXG4gICAgICAgIGZzLndyaXRlKGZkLCBjb250ZW50cywgKGVycikgLT5cclxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcclxuICAgICAgICAgIGZzLmNsb3NlKGZkLCAoZXJyKSAtPlxyXG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXHJcbiAgICAgICAgICAgIHJlc29sdmUobmFtZSlcclxuICAgICAgICAgIClcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgIClcclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgICMgTk9URTogT25lIG1heSB3b25kZXIgd2h5IHRoaXMgY29kZSBnb2VzIGEgbG9uZyB3YXkgdG8gY29uc3RydWN0IGEgZmlsZVxyXG4gICAgIyBwYXRoIGFuZCBkdW1wIGNvbnRlbnQgdXNpbmcgYSBjdXN0b20gYGR1bXBUb0ZpbGVgLiBXb3VsZG4ndCBpdCBiZSBlYXNpZXJcclxuICAgICMgdG8gdXNlIGBAdGVtcEZpbGVgIGluc3RlYWQ/IFRoZSByZWFzb24gaGVyZSBpcyB0byB3b3JrIGFyb3VuZCB0aGVcclxuICAgICMgY2xhbmctZm9ybWF0IGNvbmZpZyBmaWxlIGxvY2F0aW5nIG1lY2hhbmlzbS4gQXMgaW5kaWNhdGVkIGluIHRoZSBtYW51YWwsXHJcbiAgICAjIGNsYW5nLWZvcm1hdCAod2l0aCBgLS1zdHlsZSBmaWxlYCkgdHJpZXMgdG8gbG9jYXRlIGEgYC5jbGFuZy1mb3JtYXRgXHJcbiAgICAjIGNvbmZpZyBmaWxlIGluIGRpcmVjdG9yeSBhbmQgcGFyZW50IGRpcmVjdG9yaWVzIG9mIHRoZSBpbnB1dCBmaWxlLFxyXG4gICAgIyBhbmQgcmV0cmVhdCB0byBkZWZhdWx0IHN0eWxlIGlmIG5vdCBmb3VuZC4gUHJvamVjdHMgb2Z0ZW4gbWFrZXMgdXNlIG9mXHJcbiAgICAjIHRoaXMgcnVsZSB0byBkZWZpbmUgdGhlaXIgb3duIHN0eWxlIGluIGl0cyB0b3AgZGlyZWN0b3J5LiBVc2VycyBvZnRlblxyXG4gICAgIyBwdXQgYSBgLmNsYW5nLWZvcm1hdGAgaW4gdGhlaXIgJEhPTUUgdG8gZGVmaW5lIGhpcy9oZXIgc3R5bGUuIFRvIGhvbm9yXHJcbiAgICAjIHRoaXMgcnVsZSwgd2UgSEFWRSBUTyBnZW5lcmF0ZSB0aGUgdGVtcCBmaWxlIGluIFRIRSBTQU1FIGRpcmVjdG9yeSBhc1xyXG4gICAgIyB0aGUgZWRpdGluZyBmaWxlLiBIb3dldmVyLCB0aGlzIG1lY2hhbmlzbSBpcyBub3QgZGlyZWN0bHkgc3VwcG9ydGVkIGJ5XHJcbiAgICAjIGF0b20tYmVhdXRpZnkgYXQgdGhlIG1vbWVudC4gU28gd2UgaW50cm9kdWNlIGxvdHMgb2YgY29kZSBoZXJlLlxyXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgICBlZGl0b3IgPSBhdG9tPy53b3Jrc3BhY2U/LmdldEFjdGl2ZVRleHRFZGl0b3IoKVxyXG4gICAgICBpZiBlZGl0b3I/XHJcbiAgICAgICAgZnVsbFBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXHJcbiAgICAgICAgY3VyckRpciA9IHBhdGguZGlybmFtZShmdWxsUGF0aClcclxuICAgICAgICBjdXJyRmlsZSA9IHBhdGguYmFzZW5hbWUoZnVsbFBhdGgpXHJcbiAgICAgICAgZHVtcEZpbGUgPSBwYXRoLmpvaW4oY3VyckRpciwgXCIuYXRvbS1iZWF1dGlmeS4je2N1cnJGaWxlfVwiKVxyXG4gICAgICAgIHJlc29sdmUgZHVtcEZpbGVcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJObyBhY3RpdmUgZWRpdG9yIGZvdW5kIVwiKSlcclxuICAgIClcclxuICAgIC50aGVuKChkdW1wRmlsZSkgPT5cclxuICAgICAgIyBjb25zb2xlLmxvZyhcImNsYW5nLWZvcm1hdFwiLCBkdW1wRmlsZSlcclxuICAgICAgcmV0dXJuIEBleGUoXCJjbGFuZy1mb3JtYXRcIikucnVuKFtcclxuICAgICAgICBAZHVtcFRvRmlsZShkdW1wRmlsZSwgdGV4dClcclxuICAgICAgICBbXCItLXN0eWxlPWZpbGVcIl1cclxuICAgICAgICBdKS5maW5hbGx5KCAtPlxyXG4gICAgICAgICAgZnMudW5saW5rKGR1bXBGaWxlKVxyXG4gICAgICAgIClcclxuICAgIClcclxuIl19
