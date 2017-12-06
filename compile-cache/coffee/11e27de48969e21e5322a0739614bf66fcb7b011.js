
/*
Requires https://godoc.org/golang.org/x/tools/cmd/goimports
 */

(function() {
  "use strict";
  var Beautifier, Goimports,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Goimports = (function(superClass) {
    extend(Goimports, superClass);

    function Goimports() {
      return Goimports.__super__.constructor.apply(this, arguments);
    }

    Goimports.prototype.name = "goimports";

    Goimports.prototype.link = "https://godoc.org/golang.org/x/tools/cmd/goimports";

    Goimports.prototype.executables = [
      {
        name: "goimports",
        cmd: "goimports",
        homepage: "https://godoc.org/golang.org/x/tools/cmd/goimports",
        installation: "https://godoc.org/golang.org/x/tools/cmd/goimports",
        version: {
          args: ['--help'],
          parse: function(text) {
            return text.indexOf("usage: goimports") !== -1 && "0.0.0";
          },
          runOptions: {
            ignoreReturnCode: true,
            returnStderr: true
          }
        },
        docker: {
          image: "unibeautify/goimports"
        }
      }
    ];

    Goimports.prototype.options = {
      Go: false
    };

    Goimports.prototype.beautify = function(text, language, options) {
      return this.exe("goimports").run([this.tempFile("input", text)]);
    };

    return Goimports;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9nb2ltcG9ydHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHFCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLFdBRFI7UUFFRSxHQUFBLEVBQUssV0FGUDtRQUdFLFFBQUEsRUFBVSxvREFIWjtRQUlFLFlBQUEsRUFBYyxvREFKaEI7UUFLRSxPQUFBLEVBQVM7VUFFUCxJQUFBLEVBQU0sQ0FBQyxRQUFELENBRkM7VUFHUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsa0JBQWIsQ0FBQSxLQUFzQyxDQUFDLENBQXZDLElBQTZDO1VBQXZELENBSEE7VUFJUCxVQUFBLEVBQVk7WUFDVixnQkFBQSxFQUFrQixJQURSO1lBRVYsWUFBQSxFQUFjLElBRko7V0FKTDtTQUxYO1FBY0UsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLHVCQUREO1NBZFY7T0FEVzs7O3dCQXFCYixPQUFBLEdBQVM7TUFDUCxFQUFBLEVBQUksS0FERzs7O3dCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsQ0FDcEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRG9CLENBQXRCO0lBRFE7Ozs7S0E1QjZCO0FBUHpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcblJlcXVpcmVzIGh0dHBzOi8vZ29kb2Mub3JnL2dvbGFuZy5vcmcveC90b29scy9jbWQvZ29pbXBvcnRzXHJcbiMjI1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdvaW1wb3J0cyBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcImdvaW1wb3J0c1wiXHJcbiAgbGluazogXCJodHRwczovL2dvZG9jLm9yZy9nb2xhbmcub3JnL3gvdG9vbHMvY21kL2dvaW1wb3J0c1wiXHJcbiAgZXhlY3V0YWJsZXM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJnb2ltcG9ydHNcIlxyXG4gICAgICBjbWQ6IFwiZ29pbXBvcnRzXCJcclxuICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly9nb2RvYy5vcmcvZ29sYW5nLm9yZy94L3Rvb2xzL2NtZC9nb2ltcG9ydHNcIlxyXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9nb2RvYy5vcmcvZ29sYW5nLm9yZy94L3Rvb2xzL2NtZC9nb2ltcG9ydHNcIlxyXG4gICAgICB2ZXJzaW9uOiB7XHJcbiAgICAgICAgIyBEb2VzIG5vdCBkaXNwbGF5IHZlcnNpb25cclxuICAgICAgICBhcmdzOiBbJy0taGVscCddLFxyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5pbmRleE9mKFwidXNhZ2U6IGdvaW1wb3J0c1wiKSBpc250IC0xIGFuZCBcIjAuMC4wXCIsXHJcbiAgICAgICAgcnVuT3B0aW9uczoge1xyXG4gICAgICAgICAgaWdub3JlUmV0dXJuQ29kZTogdHJ1ZSxcclxuICAgICAgICAgIHJldHVyblN0ZGVycjogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBkb2NrZXI6IHtcclxuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9nb2ltcG9ydHNcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXVxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICBHbzogZmFsc2VcclxuICB9XHJcblxyXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XHJcbiAgICBAZXhlKFwiZ29pbXBvcnRzXCIpLnJ1bihbXHJcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXHJcbiAgICAgIF0pXHJcbiJdfQ==
