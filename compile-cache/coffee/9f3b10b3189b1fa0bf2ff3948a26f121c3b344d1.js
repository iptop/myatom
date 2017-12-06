
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  "use strict";
  var fs, possibleOptions, temp;

  fs = require("fs");

  temp = require("temp").track();

  possibleOptions = require("./possible-options.json");

  module.exports = function(options, cb) {
    var ic, isPossible, k, text, v, vs;
    text = "";
    options.output_tab_size = options.output_tab_size || options.indent_size;
    options.input_tab_size = options.input_tab_size || options.indent_size;
    delete options.indent_size;
    ic = options.indent_char;
    if (options.indent_with_tabs === 0 || options.indent_with_tabs === 1 || options.indent_with_tabs === 2) {
      null;
    } else if (ic === " ") {
      options.indent_with_tabs = 0;
    } else if (ic === "\t") {
      options.indent_with_tabs = 2;
    } else {
      options.indent_with_tabs = 1;
    }
    delete options.indent_char;
    delete options.languageOverride;
    delete options.configPath;
    for (k in options) {
      isPossible = possibleOptions.indexOf(k) !== -1;
      if (isPossible) {
        v = options[k];
        vs = v;
        if (typeof vs === "boolean") {
          if (vs === true) {
            vs = "True";
          } else {
            vs = "False";
          }
        }
        text += k + " = " + vs + "\n";
      } else {
        delete options[k];
      }
    }
    return temp.open({
      suffix: ".cfg"
    }, function(err, info) {
      if (!err) {
        return fs.write(info.fd, text || "", function(err) {
          if (err) {
            return cb(err);
          }
          return fs.close(info.fd, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, info.path);
          });
        });
      } else {
        return cb(err);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy91bmNydXN0aWZ5L2NmZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUE7O0VBSUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsS0FBaEIsQ0FBQTs7RUFDUCxlQUFBLEdBQWtCLE9BQUEsQ0FBUSx5QkFBUjs7RUFDbEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxPQUFELEVBQVUsRUFBVjtBQUNmLFFBQUE7SUFBQSxJQUFBLEdBQU87SUFHUCxPQUFPLENBQUMsZUFBUixHQUEwQixPQUFPLENBQUMsZUFBUixJQUEyQixPQUFPLENBQUM7SUFDN0QsT0FBTyxDQUFDLGNBQVIsR0FBeUIsT0FBTyxDQUFDLGNBQVIsSUFBMEIsT0FBTyxDQUFDO0lBQzNELE9BQU8sT0FBTyxDQUFDO0lBUWYsRUFBQSxHQUFLLE9BQU8sQ0FBQztJQUNiLElBQUcsT0FBTyxDQUFDLGdCQUFSLEtBQTRCLENBQTVCLElBQWlDLE9BQU8sQ0FBQyxnQkFBUixLQUE0QixDQUE3RCxJQUFrRSxPQUFPLENBQUMsZ0JBQVIsS0FBNEIsQ0FBakc7TUFDRSxLQURGO0tBQUEsTUFFSyxJQUFHLEVBQUEsS0FBTSxHQUFUO01BQ0gsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLEVBRHhCO0tBQUEsTUFFQSxJQUFHLEVBQUEsS0FBTSxJQUFUO01BQ0gsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLEVBRHhCO0tBQUEsTUFBQTtNQUdILE9BQU8sQ0FBQyxnQkFBUixHQUEyQixFQUh4Qjs7SUFJTCxPQUFPLE9BQU8sQ0FBQztJQUtmLE9BQU8sT0FBTyxDQUFDO0lBQ2YsT0FBTyxPQUFPLENBQUM7QUFHZixTQUFBLFlBQUE7TUFFRSxVQUFBLEdBQWEsZUFBZSxDQUFDLE9BQWhCLENBQXdCLENBQXhCLENBQUEsS0FBZ0MsQ0FBQztNQUM5QyxJQUFHLFVBQUg7UUFDRSxDQUFBLEdBQUksT0FBUSxDQUFBLENBQUE7UUFDWixFQUFBLEdBQUs7UUFDTCxJQUFHLE9BQU8sRUFBUCxLQUFhLFNBQWhCO1VBQ0UsSUFBRyxFQUFBLEtBQU0sSUFBVDtZQUNFLEVBQUEsR0FBSyxPQURQO1dBQUEsTUFBQTtZQUdFLEVBQUEsR0FBSyxRQUhQO1dBREY7O1FBS0EsSUFBQSxJQUFRLENBQUEsR0FBSSxLQUFKLEdBQVksRUFBWixHQUFpQixLQVIzQjtPQUFBLE1BQUE7UUFXRSxPQUFPLE9BQVEsQ0FBQSxDQUFBLEVBWGpCOztBQUhGO1dBaUJBLElBQUksQ0FBQyxJQUFMLENBQ0U7TUFBQSxNQUFBLEVBQVEsTUFBUjtLQURGLEVBRUUsU0FBQyxHQUFELEVBQU0sSUFBTjtNQUNBLElBQUEsQ0FBTyxHQUFQO2VBR0UsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFJLENBQUMsRUFBZCxFQUFrQixJQUFBLElBQVEsRUFBMUIsRUFBOEIsU0FBQyxHQUFEO1VBRzVCLElBQWtCLEdBQWxCO0FBQUEsbUJBQU8sRUFBQSxDQUFHLEdBQUgsRUFBUDs7aUJBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFJLENBQUMsRUFBZCxFQUFrQixTQUFDLEdBQUQ7WUFHaEIsSUFBa0IsR0FBbEI7QUFBQSxxQkFBTyxFQUFBLENBQUcsR0FBSCxFQUFQOzttQkFDQSxFQUFBLENBQUcsSUFBSCxFQUFTLElBQUksQ0FBQyxJQUFkO1VBSmdCLENBQWxCO1FBSjRCLENBQTlCLEVBSEY7T0FBQSxNQUFBO2VBZUUsRUFBQSxDQUFHLEdBQUgsRUFmRjs7SUFEQSxDQUZGO0VBakRlO0FBUGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcblJlcXVpcmVzIGh0dHA6Ly9wZWFyLnBocC5uZXQvcGFja2FnZS9QSFBfQmVhdXRpZmllclxyXG4jIyNcclxuXCJ1c2Ugc3RyaWN0XCJcclxuZnMgPSByZXF1aXJlKFwiZnNcIilcclxudGVtcCA9IHJlcXVpcmUoXCJ0ZW1wXCIpLnRyYWNrKClcclxucG9zc2libGVPcHRpb25zID0gcmVxdWlyZSBcIi4vcG9zc2libGUtb3B0aW9ucy5qc29uXCJcclxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucywgY2IpIC0+XHJcbiAgdGV4dCA9IFwiXCJcclxuXHJcbiAgIyBBcHBseSBpbmRlbnRfc2l6ZSB0byBvdXRwdXRfdGFiX3NpemVcclxuICBvcHRpb25zLm91dHB1dF90YWJfc2l6ZSA9IG9wdGlvbnMub3V0cHV0X3RhYl9zaXplIG9yIG9wdGlvbnMuaW5kZW50X3NpemUgIyBqc2hpbnQgaWdub3JlOiBsaW5lXHJcbiAgb3B0aW9ucy5pbnB1dF90YWJfc2l6ZSA9IG9wdGlvbnMuaW5wdXRfdGFiX3NpemUgb3Igb3B0aW9ucy5pbmRlbnRfc2l6ZSAjIGpzaGludCBpZ25vcmU6IGxpbmVcclxuICBkZWxldGUgb3B0aW9ucy5pbmRlbnRfc2l6ZSAjIGpzaGludCBpZ25vcmU6IGxpbmVcclxuXHJcbiAgIyBJbmRlbnQgd2l0aCBUYWJzP1xyXG4gICMgSG93IHRvIHVzZSB0YWJzIHdoZW4gaW5kZW50aW5nIGNvZGVcclxuICAjIDA9c3BhY2VzIG9ubHlcclxuICAjIDE9aW5kZW50IHdpdGggdGFicyB0byBicmFjZSBsZXZlbCwgYWxpZ24gd2l0aCBzcGFjZXNcclxuICAjIDI9aW5kZW50IGFuZCBhbGlnbiB3aXRoIHRhYnMsIHVzaW5nIHNwYWNlcyB3aGVuIG5vdCBvbiBhIHRhYnN0b3BcclxuICAjIGpzaGludCBpZ25vcmU6IHN0YXJ0XHJcbiAgaWMgPSBvcHRpb25zLmluZGVudF9jaGFyXHJcbiAgaWYgb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzIGlzIDAgb3Igb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzIGlzIDEgb3Igb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzIGlzIDJcclxuICAgIG51bGwgIyBJZ25vcmUgaW5kZW50X2NoYXIgb3B0aW9uXHJcbiAgZWxzZSBpZiBpYyBpcyBcIiBcIlxyXG4gICAgb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzID0gMCAjIFNwYWNlcyBvbmx5XHJcbiAgZWxzZSBpZiBpYyBpcyBcIlxcdFwiXHJcbiAgICBvcHRpb25zLmluZGVudF93aXRoX3RhYnMgPSAyICMgaW5kZW50IGFuZCBhbGlnbiB3aXRoIHRhYnMsIHVzaW5nIHNwYWNlcyB3aGVuIG5vdCBvbiBhIHRhYnN0b3BcclxuICBlbHNlXHJcbiAgICBvcHRpb25zLmluZGVudF93aXRoX3RhYnMgPSAxICMgaW5kZW50IHdpdGggdGFicyB0byBicmFjZSBsZXZlbCwgYWxpZ24gd2l0aCBzcGFjZXNcclxuICBkZWxldGUgb3B0aW9ucy5pbmRlbnRfY2hhclxyXG5cclxuXHJcbiAgIyBqc2hpbnQgaWdub3JlOiBlbmRcclxuICAjIFJlbW92ZSBtaXNjXHJcbiAgZGVsZXRlIG9wdGlvbnMubGFuZ3VhZ2VPdmVycmlkZVxyXG4gIGRlbGV0ZSBvcHRpb25zLmNvbmZpZ1BhdGhcclxuXHJcbiAgIyBJdGVyYXRlIG92ZXIgZWFjaCBwcm9wZXJ0eSBhbmQgd3JpdGUgdG8gY29uZmlndXJhdGlvbiBmaWxlXHJcbiAgZm9yIGsgb2Ygb3B0aW9uc1xyXG4gICAgIyBSZW1vdmUgYWxsIG5vbi1wb3NzaWJsZSBvcHRpb25zXHJcbiAgICBpc1Bvc3NpYmxlID0gcG9zc2libGVPcHRpb25zLmluZGV4T2YoaykgaXNudCAtMVxyXG4gICAgaWYgaXNQb3NzaWJsZVxyXG4gICAgICB2ID0gb3B0aW9uc1trXVxyXG4gICAgICB2cyA9IHZcclxuICAgICAgaWYgdHlwZW9mIHZzIGlzIFwiYm9vbGVhblwiXHJcbiAgICAgICAgaWYgdnMgaXMgdHJ1ZVxyXG4gICAgICAgICAgdnMgPSBcIlRydWVcIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHZzID0gXCJGYWxzZVwiXHJcbiAgICAgIHRleHQgKz0gayArIFwiID0gXCIgKyB2cyArIFwiXFxuXCJcclxuICAgIGVsc2VcclxuICAgICAgIyBjb25zb2xlLmxvZyhcInJlbW92aW5nICN7a30gb3B0aW9uXCIpXHJcbiAgICAgIGRlbGV0ZSBvcHRpb25zW2tdXHJcblxyXG4gICMgQ3JlYXRlIHRlbXAgaW5wdXQgZmlsZVxyXG4gIHRlbXAub3BlblxyXG4gICAgc3VmZml4OiBcIi5jZmdcIlxyXG4gICwgKGVyciwgaW5mbykgLT5cclxuICAgIHVubGVzcyBlcnJcclxuXHJcbiAgICAgICMgU2F2ZSBjdXJyZW50IHRleHQgdG8gaW5wdXQgZmlsZVxyXG4gICAgICBmcy53cml0ZSBpbmZvLmZkLCB0ZXh0IG9yIFwiXCIsIChlcnIpIC0+XHJcblxyXG4gICAgICAgICMgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICByZXR1cm4gY2IoZXJyKSBpZiBlcnJcclxuICAgICAgICBmcy5jbG9zZSBpbmZvLmZkLCAoZXJyKSAtPlxyXG5cclxuICAgICAgICAgICMgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgIHJldHVybiBjYihlcnIpIGlmIGVyclxyXG4gICAgICAgICAgY2IgbnVsbCwgaW5mby5wYXRoXHJcblxyXG5cclxuICAgIGVsc2VcclxuICAgICAgY2IgZXJyXHJcbiJdfQ==
