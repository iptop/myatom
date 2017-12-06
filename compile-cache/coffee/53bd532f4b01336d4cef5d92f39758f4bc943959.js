(function() {
  "use strict";
  var Beautifier, CoffeeFmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = CoffeeFmt = (function(superClass) {
    extend(CoffeeFmt, superClass);

    function CoffeeFmt() {
      return CoffeeFmt.__super__.constructor.apply(this, arguments);
    }

    CoffeeFmt.prototype.name = "coffee-fmt";

    CoffeeFmt.prototype.link = "https://github.com/sterpe/coffee-fmt";

    CoffeeFmt.prototype.options = {
      CoffeeScript: {
        tab: [
          "indent_size", "indent_char", "indent_with_tabs", function(indentSize, indentChar, indentWithTabs) {
            if (indentWithTabs) {
              return "\t";
            }
            return Array(indentSize + 1).join(indentChar);
          }
        ]
      }
    };

    CoffeeFmt.prototype.beautify = function(text, language, options) {
      this.verbose('beautify', language, options);
      return new this.Promise(function(resolve, reject) {
        var e, fmt, results;
        options.newLine = "\n";
        fmt = require('coffee-fmt');
        try {
          results = fmt.format(text, options);
          return resolve(results);
        } catch (error) {
          e = error;
          return reject(e);
        }
      });
    };

    return CoffeeFmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jb2ZmZWUtZm10LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7d0JBQ3JCLElBQUEsR0FBTTs7d0JBQ04sSUFBQSxHQUFNOzt3QkFFTixPQUFBLEdBQVM7TUFFUCxZQUFBLEVBQ0U7UUFBQSxHQUFBLEVBQUs7VUFBQyxhQUFELEVBQ0gsYUFERyxFQUNZLGtCQURaLEVBRUgsU0FBQyxVQUFELEVBQWEsVUFBYixFQUF5QixjQUF6QjtZQUNFLElBQWUsY0FBZjtBQUFBLHFCQUFPLEtBQVA7O21CQUNBLEtBQUEsQ0FBTSxVQUFBLEdBQVcsQ0FBakIsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixVQUF6QjtVQUZGLENBRkc7U0FBTDtPQUhLOzs7d0JBV1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7TUFDUixJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQsRUFBcUIsUUFBckIsRUFBK0IsT0FBL0I7QUFDQSxhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBRWxCLFlBQUE7UUFBQSxPQUFPLENBQUMsT0FBUixHQUFrQjtRQUVsQixHQUFBLEdBQU0sT0FBQSxDQUFRLFlBQVI7QUFFTjtVQUNFLE9BQUEsR0FBVSxHQUFHLENBQUMsTUFBSixDQUFXLElBQVgsRUFBaUIsT0FBakI7aUJBRVYsT0FBQSxDQUFRLE9BQVIsRUFIRjtTQUFBLGFBQUE7VUFJTTtpQkFDSixNQUFBLENBQU8sQ0FBUCxFQUxGOztNQU5rQixDQUFUO0lBRkg7Ozs7S0FmNkI7QUFIekMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ29mZmVlRm10IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiY29mZmVlLWZtdFwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vc3RlcnBlL2NvZmZlZS1mbXRcIlxyXG5cclxuICBvcHRpb25zOiB7XHJcbiAgICAjIEFwcGx5IGxhbmd1YWdlLXNwZWNpZmljIG9wdGlvbnNcclxuICAgIENvZmZlZVNjcmlwdDpcclxuICAgICAgdGFiOiBbXCJpbmRlbnRfc2l6ZVwiLCBcXFxyXG4gICAgICAgIFwiaW5kZW50X2NoYXJcIiwgXCJpbmRlbnRfd2l0aF90YWJzXCIsIFxcXHJcbiAgICAgICAgKGluZGVudFNpemUsIGluZGVudENoYXIsIGluZGVudFdpdGhUYWJzKSAtPlxyXG4gICAgICAgICAgcmV0dXJuIFwiXFx0XCIgaWYgaW5kZW50V2l0aFRhYnNcclxuICAgICAgICAgIEFycmF5KGluZGVudFNpemUrMSkuam9pbihpbmRlbnRDaGFyKVxyXG4gICAgICBdXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgQHZlcmJvc2UoJ2JlYXV0aWZ5JywgbGFuZ3VhZ2UsIG9wdGlvbnMpXHJcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICAgICMgQWRkIG5ld0xpbmUgb3B0aW9uXHJcbiAgICAgIG9wdGlvbnMubmV3TGluZSA9IFwiXFxuXCJcclxuICAgICAgIyBSZXF1aXJlXHJcbiAgICAgIGZtdCA9IHJlcXVpcmUoJ2NvZmZlZS1mbXQnKVxyXG4gICAgICAjIEZvcm1hdCFcclxuICAgICAgdHJ5XHJcbiAgICAgICAgcmVzdWx0cyA9IGZtdC5mb3JtYXQodGV4dCwgb3B0aW9ucylcclxuICAgICAgICAjIFJldHVybiBiZWF1dGlmaWVkIENvZmZlZVNjcmlwdCBjb2RlXHJcbiAgICAgICAgcmVzb2x2ZShyZXN1bHRzKVxyXG4gICAgICBjYXRjaCBlXHJcbiAgICAgICAgcmVqZWN0KGUpXHJcbiAgICApXHJcbiJdfQ==
