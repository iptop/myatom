(function() {
  "use strict";
  var Beautifier, Remark,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Remark = (function(superClass) {
    extend(Remark, superClass);

    function Remark() {
      return Remark.__super__.constructor.apply(this, arguments);
    }

    Remark.prototype.name = "Remark";

    Remark.prototype.link = "https://github.com/wooorm/remark";

    Remark.prototype.options = {
      _: {
        gfm: true,
        yaml: true,
        commonmark: true,
        footnotes: true,
        pedantic: true,
        breaks: true,
        entities: true,
        setext: true,
        closeAtx: true,
        looseTable: true,
        spacedTable: true,
        fence: true,
        fences: true,
        bullet: true,
        listItemIndent: true,
        incrementListMarker: true,
        rule: true,
        ruleRepetition: true,
        ruleSpaces: true,
        strong: true,
        emphasis: true,
        position: true
      },
      Markdown: true
    };

    Remark.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var cleanMarkdown, err, remark;
        try {
          remark = require('remark');
          cleanMarkdown = remark().process(text, options).toString();
          return resolve(cleanMarkdown);
        } catch (error) {
          err = error;
          this.error("Remark error: " + err);
          return reject(err);
        }
      });
    };

    return Remark;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9yZW1hcmsuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztxQkFDckIsSUFBQSxHQUFNOztxQkFDTixJQUFBLEdBQU07O3FCQUNOLE9BQUEsR0FBUztNQUNQLENBQUEsRUFBRztRQUNELEdBQUEsRUFBSyxJQURKO1FBRUQsSUFBQSxFQUFNLElBRkw7UUFHRCxVQUFBLEVBQVksSUFIWDtRQUlELFNBQUEsRUFBVyxJQUpWO1FBS0QsUUFBQSxFQUFVLElBTFQ7UUFNRCxNQUFBLEVBQVEsSUFOUDtRQU9ELFFBQUEsRUFBVSxJQVBUO1FBUUQsTUFBQSxFQUFRLElBUlA7UUFTRCxRQUFBLEVBQVUsSUFUVDtRQVVELFVBQUEsRUFBWSxJQVZYO1FBV0QsV0FBQSxFQUFhLElBWFo7UUFZRCxLQUFBLEVBQU8sSUFaTjtRQWFELE1BQUEsRUFBUSxJQWJQO1FBY0QsTUFBQSxFQUFRLElBZFA7UUFlRCxjQUFBLEVBQWdCLElBZmY7UUFnQkQsbUJBQUEsRUFBcUIsSUFoQnBCO1FBaUJELElBQUEsRUFBTSxJQWpCTDtRQWtCRCxjQUFBLEVBQWdCLElBbEJmO1FBbUJELFVBQUEsRUFBWSxJQW5CWDtRQW9CRCxNQUFBLEVBQVEsSUFwQlA7UUFxQkQsUUFBQSxFQUFVLElBckJUO1FBc0JELFFBQUEsRUFBVSxJQXRCVDtPQURJO01BeUJQLFFBQUEsRUFBVSxJQXpCSDs7O3FCQTRCVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtBQUFBO1VBQ0UsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO1VBQ1QsYUFBQSxHQUFnQixNQUFBLENBQUEsQ0FBUSxDQUFDLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsT0FBdkIsQ0FBK0IsQ0FBQyxRQUFoQyxDQUFBO2lCQUNoQixPQUFBLENBQVEsYUFBUixFQUhGO1NBQUEsYUFBQTtVQUlNO1VBQ0osSUFBQyxDQUFBLEtBQUQsQ0FBTyxnQkFBQSxHQUFpQixHQUF4QjtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQU5GOztNQURrQixDQUFUO0lBREg7Ozs7S0EvQjBCO0FBSHRDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJlbWFyayBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcIlJlbWFya1wiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vd29vb3JtL3JlbWFya1wiXHJcbiAgb3B0aW9uczoge1xyXG4gICAgXzoge1xyXG4gICAgICBnZm06IHRydWVcclxuICAgICAgeWFtbDogdHJ1ZVxyXG4gICAgICBjb21tb25tYXJrOiB0cnVlXHJcbiAgICAgIGZvb3Rub3RlczogdHJ1ZVxyXG4gICAgICBwZWRhbnRpYzogdHJ1ZVxyXG4gICAgICBicmVha3M6IHRydWVcclxuICAgICAgZW50aXRpZXM6IHRydWVcclxuICAgICAgc2V0ZXh0OiB0cnVlXHJcbiAgICAgIGNsb3NlQXR4OiB0cnVlXHJcbiAgICAgIGxvb3NlVGFibGU6IHRydWVcclxuICAgICAgc3BhY2VkVGFibGU6IHRydWVcclxuICAgICAgZmVuY2U6IHRydWVcclxuICAgICAgZmVuY2VzOiB0cnVlXHJcbiAgICAgIGJ1bGxldDogdHJ1ZVxyXG4gICAgICBsaXN0SXRlbUluZGVudDogdHJ1ZVxyXG4gICAgICBpbmNyZW1lbnRMaXN0TWFya2VyOiB0cnVlXHJcbiAgICAgIHJ1bGU6IHRydWVcclxuICAgICAgcnVsZVJlcGV0aXRpb246IHRydWVcclxuICAgICAgcnVsZVNwYWNlczogdHJ1ZVxyXG4gICAgICBzdHJvbmc6IHRydWVcclxuICAgICAgZW1waGFzaXM6IHRydWVcclxuICAgICAgcG9zaXRpb246IHRydWVcclxuICAgIH1cclxuICAgIE1hcmtkb3duOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxyXG4gICAgICB0cnlcclxuICAgICAgICByZW1hcmsgPSByZXF1aXJlICdyZW1hcmsnXHJcbiAgICAgICAgY2xlYW5NYXJrZG93biA9IHJlbWFyaygpLnByb2Nlc3ModGV4dCwgb3B0aW9ucykudG9TdHJpbmcoKVxyXG4gICAgICAgIHJlc29sdmUgY2xlYW5NYXJrZG93blxyXG4gICAgICBjYXRjaCBlcnJcclxuICAgICAgICBAZXJyb3IoXCJSZW1hcmsgZXJyb3I6ICN7ZXJyfVwiKVxyXG4gICAgICAgIHJlamVjdChlcnIpXHJcbiAgICApXHJcbiJdfQ==
