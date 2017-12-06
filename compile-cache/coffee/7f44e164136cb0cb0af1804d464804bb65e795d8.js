(function() {
  "use strict";
  var Beautifier, TypeScriptFormatter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = TypeScriptFormatter = (function(superClass) {
    extend(TypeScriptFormatter, superClass);

    function TypeScriptFormatter() {
      return TypeScriptFormatter.__super__.constructor.apply(this, arguments);
    }

    TypeScriptFormatter.prototype.name = "TypeScript Formatter";

    TypeScriptFormatter.prototype.link = "https://github.com/vvakame/typescript-formatter";

    TypeScriptFormatter.prototype.options = {
      TypeScript: true
    };

    TypeScriptFormatter.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var e, format, formatterUtils, opts, result;
          try {
            format = require("typescript-formatter/lib/formatter")["default"];
            formatterUtils = require("typescript-formatter/lib/utils");
            opts = formatterUtils.createDefaultFormatCodeSettings();
            if (options.indent_with_tabs) {
              opts.convertTabsToSpaces = false;
            } else {
              opts.tabSize = options.tab_width || options.indent_size;
              opts.indentSize = options.indent_size;
              opts.indentStyle = 'space';
            }
            _this.verbose('typescript', text, opts);
            result = format('', text, opts);
            _this.verbose(result);
            return resolve(result);
          } catch (error) {
            e = error;
            return reject(e);
          }
        };
      })(this));
    };

    return TypeScriptFormatter;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy90eXBlc2NyaXB0LWZvcm1hdHRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsK0JBQUE7SUFBQTs7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O2tDQUNyQixJQUFBLEdBQU07O2tDQUNOLElBQUEsR0FBTTs7a0NBQ04sT0FBQSxHQUFTO01BQ1AsVUFBQSxFQUFZLElBREw7OztrQ0FJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUVsQixjQUFBO0FBQUE7WUFDRSxNQUFBLEdBQVMsT0FBQSxDQUFRLG9DQUFSLENBQTZDLEVBQUMsT0FBRDtZQUN0RCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxnQ0FBUjtZQUdqQixJQUFBLEdBQU8sY0FBYyxDQUFDLCtCQUFmLENBQUE7WUFFUCxJQUFHLE9BQU8sQ0FBQyxnQkFBWDtjQUNFLElBQUksQ0FBQyxtQkFBTCxHQUEyQixNQUQ3QjthQUFBLE1BQUE7Y0FHRSxJQUFJLENBQUMsT0FBTCxHQUFlLE9BQU8sQ0FBQyxTQUFSLElBQXFCLE9BQU8sQ0FBQztjQUM1QyxJQUFJLENBQUMsVUFBTCxHQUFrQixPQUFPLENBQUM7Y0FDMUIsSUFBSSxDQUFDLFdBQUwsR0FBbUIsUUFMckI7O1lBT0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQXVCLElBQXZCLEVBQTZCLElBQTdCO1lBQ0EsTUFBQSxHQUFTLE1BQUEsQ0FBTyxFQUFQLEVBQVcsSUFBWCxFQUFpQixJQUFqQjtZQUNULEtBQUMsQ0FBQSxPQUFELENBQVMsTUFBVDttQkFDQSxPQUFBLENBQVEsTUFBUixFQWpCRjtXQUFBLGFBQUE7WUFrQk07QUFDSixtQkFBTyxNQUFBLENBQU8sQ0FBUCxFQW5CVDs7UUFGa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7SUFESDs7OztLQVB1QztBQUhuRCIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUeXBlU2NyaXB0Rm9ybWF0dGVyIGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiVHlwZVNjcmlwdCBGb3JtYXR0ZXJcIlxyXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Z2YWthbWUvdHlwZXNjcmlwdC1mb3JtYXR0ZXJcIlxyXG4gIG9wdGlvbnM6IHtcclxuICAgIFR5cGVTY3JpcHQ6IHRydWVcclxuICB9XHJcblxyXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XHJcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XHJcblxyXG4gICAgICB0cnlcclxuICAgICAgICBmb3JtYXQgPSByZXF1aXJlKFwidHlwZXNjcmlwdC1mb3JtYXR0ZXIvbGliL2Zvcm1hdHRlclwiKS5kZWZhdWx0XHJcbiAgICAgICAgZm9ybWF0dGVyVXRpbHMgPSByZXF1aXJlKFwidHlwZXNjcmlwdC1mb3JtYXR0ZXIvbGliL3V0aWxzXCIpXHJcbiAgICAgICAgIyBAdmVyYm9zZSgnZm9ybWF0JywgZm9ybWF0LCBmb3JtYXR0ZXJVdGlscylcclxuXHJcbiAgICAgICAgb3B0cyA9IGZvcm1hdHRlclV0aWxzLmNyZWF0ZURlZmF1bHRGb3JtYXRDb2RlU2V0dGluZ3MoKVxyXG5cclxuICAgICAgICBpZiBvcHRpb25zLmluZGVudF93aXRoX3RhYnNcclxuICAgICAgICAgIG9wdHMuY29udmVydFRhYnNUb1NwYWNlcyA9IGZhbHNlXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgb3B0cy50YWJTaXplID0gb3B0aW9ucy50YWJfd2lkdGggb3Igb3B0aW9ucy5pbmRlbnRfc2l6ZVxyXG4gICAgICAgICAgb3B0cy5pbmRlbnRTaXplID0gb3B0aW9ucy5pbmRlbnRfc2l6ZVxyXG4gICAgICAgICAgb3B0cy5pbmRlbnRTdHlsZSA9ICdzcGFjZSdcclxuXHJcbiAgICAgICAgQHZlcmJvc2UoJ3R5cGVzY3JpcHQnLCB0ZXh0LCBvcHRzKVxyXG4gICAgICAgIHJlc3VsdCA9IGZvcm1hdCgnJywgdGV4dCwgb3B0cylcclxuICAgICAgICBAdmVyYm9zZShyZXN1bHQpXHJcbiAgICAgICAgcmVzb2x2ZSByZXN1bHRcclxuICAgICAgY2F0Y2ggZVxyXG4gICAgICAgIHJldHVybiByZWplY3QoZSlcclxuXHJcbiAgICApXHJcbiJdfQ==
