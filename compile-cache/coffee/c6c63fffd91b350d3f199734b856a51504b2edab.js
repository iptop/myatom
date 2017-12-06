
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, _, extend;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "bash", "c-sharp", "c", "clojure", "coffeescript", "coldfusion", "cpp", "crystal", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "glsl", "go", "gohtml", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "lua", "markdown", 'marko', "mustache", "nginx", "nunjucks", "objective-c", "ocaml", "pawn", "perl", "php", "puppet", "python", "r", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "ux_markup", "vala", "vue", "visualforce", "xml", "xtemplate", "yaml"];


    /*
    Languages
     */

    Languages.prototype.languages = null;


    /*
    Namespaces
     */

    Languages.prototype.namespaces = null;


    /*
    Constructor
     */

    function Languages() {
      this.languages = _.map(this.languageNames, function(name) {
        return require("./" + name);
      });
      this.namespaces = _.map(this.languages, function(language) {
        return language.namespace;
      });
    }


    /*
    Get language for grammar and extension
     */

    Languages.prototype.getLanguages = function(arg) {
      var extension, grammar, name, namespace;
      name = arg.name, namespace = arg.namespace, grammar = arg.grammar, extension = arg.extension;
      return _.union(_.filter(this.languages, function(language) {
        return _.isEqual(language.name, name);
      }), _.filter(this.languages, function(language) {
        return _.isEqual(language.namespace, namespace);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.grammars, grammar);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.extensions, extension);
      }));
    };

    return Languages;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBOztFQUtBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixNQUFBLEdBQVM7O0VBR1QsTUFBTSxDQUFDLE9BQVAsR0FBdUI7d0JBSXJCLGFBQUEsR0FBZSxDQUNiLE1BRGEsRUFFYixTQUZhLEVBR2IsTUFIYSxFQUliLFNBSmEsRUFLYixHQUxhLEVBTWIsU0FOYSxFQU9iLGNBUGEsRUFRYixZQVJhLEVBU2IsS0FUYSxFQVViLFNBVmEsRUFXYixLQVhhLEVBWWIsS0FaYSxFQWFiLEdBYmEsRUFjYixLQWRhLEVBZWIsS0FmYSxFQWdCYixLQWhCYSxFQWlCYixRQWpCYSxFQWtCYixTQWxCYSxFQW1CYixNQW5CYSxFQW9CYixJQXBCYSxFQXFCYixRQXJCYSxFQXNCYixTQXRCYSxFQXVCYixZQXZCYSxFQXdCYixTQXhCYSxFQXlCYixNQXpCYSxFQTBCYixNQTFCYSxFQTJCYixNQTNCYSxFQTRCYixZQTVCYSxFQTZCYixNQTdCYSxFQThCYixLQTlCYSxFQStCYixPQS9CYSxFQWdDYixNQWhDYSxFQWlDYixLQWpDYSxFQWtDYixVQWxDYSxFQW1DYixPQW5DYSxFQW9DYixVQXBDYSxFQXFDYixPQXJDYSxFQXNDYixVQXRDYSxFQXVDYixhQXZDYSxFQXdDYixPQXhDYSxFQXlDYixNQXpDYSxFQTBDYixNQTFDYSxFQTJDYixLQTNDYSxFQTRDYixRQTVDYSxFQTZDYixRQTdDYSxFQThDYixHQTlDYSxFQStDYixRQS9DYSxFQWdEYixNQWhEYSxFQWlEYixNQWpEYSxFQWtEYixNQWxEYSxFQW1EYixNQW5EYSxFQW9EYixXQXBEYSxFQXFEYixLQXJEYSxFQXNEYixLQXREYSxFQXVEYixNQXZEYSxFQXdEYixLQXhEYSxFQXlEYixNQXpEYSxFQTBEYixZQTFEYSxFQTJEYixXQTNEYSxFQTREYixNQTVEYSxFQTZEYixLQTdEYSxFQThEYixhQTlEYSxFQStEYixLQS9EYSxFQWdFYixXQWhFYSxFQWlFYixNQWpFYTs7O0FBb0VmOzs7O3dCQUdBLFNBQUEsR0FBVzs7O0FBRVg7Ozs7d0JBR0EsVUFBQSxHQUFZOzs7QUFFWjs7OztJQUdhLG1CQUFBO01BQ1gsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxhQUFQLEVBQXNCLFNBQUMsSUFBRDtlQUNqQyxPQUFBLENBQVEsSUFBQSxHQUFLLElBQWI7TUFEaUMsQ0FBdEI7TUFHYixJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLFNBQVAsRUFBa0IsU0FBQyxRQUFEO2VBQWMsUUFBUSxDQUFDO01BQXZCLENBQWxCO0lBSkg7OztBQU1iOzs7O3dCQUdBLFlBQUEsR0FBYyxTQUFDLEdBQUQ7QUFFWixVQUFBO01BRmMsaUJBQU0sMkJBQVcsdUJBQVM7YUFFeEMsQ0FBQyxDQUFDLEtBQUYsQ0FDRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRDtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLElBQW5CLEVBQXlCLElBQXpCO01BQWQsQ0FBckIsQ0FERixFQUVFLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFNBQVYsRUFBcUIsU0FBQyxRQUFEO2VBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFRLENBQUMsU0FBbkIsRUFBOEIsU0FBOUI7TUFBZCxDQUFyQixDQUZGLEVBR0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQ7ZUFBYyxDQUFDLENBQUMsUUFBRixDQUFXLFFBQVEsQ0FBQyxRQUFwQixFQUE4QixPQUE5QjtNQUFkLENBQXJCLENBSEYsRUFJRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRDtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFVBQXBCLEVBQWdDLFNBQWhDO01BQWQsQ0FBckIsQ0FKRjtJQUZZOzs7OztBQXZHaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcclxuTGFuZ3VhZ2UgU3VwcG9ydCBhbmQgZGVmYXVsdCBvcHRpb25zLlxyXG4jIyNcclxuXCJ1c2Ugc3RyaWN0XCJcclxuIyBMYXp5IGxvYWRlZCBkZXBlbmRlbmNpZXNcclxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXHJcbmV4dGVuZCA9IG51bGxcclxuXHJcbiNcclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMYW5ndWFnZXNcclxuXHJcbiAgIyBTdXBwb3J0ZWQgdW5pcXVlIGNvbmZpZ3VyYXRpb24ga2V5c1xyXG4gICMgVXNlZCBmb3IgZGV0ZWN0aW5nIG5lc3RlZCBjb25maWd1cmF0aW9ucyBpbiAuanNiZWF1dGlmeXJjXHJcbiAgbGFuZ3VhZ2VOYW1lczogW1xyXG4gICAgXCJhcGV4XCJcclxuICAgIFwiYXJkdWlub1wiXHJcbiAgICBcImJhc2hcIlxyXG4gICAgXCJjLXNoYXJwXCJcclxuICAgIFwiY1wiXHJcbiAgICBcImNsb2p1cmVcIlxyXG4gICAgXCJjb2ZmZWVzY3JpcHRcIlxyXG4gICAgXCJjb2xkZnVzaW9uXCJcclxuICAgIFwiY3BwXCJcclxuICAgIFwiY3J5c3RhbFwiXHJcbiAgICBcImNzc1wiXHJcbiAgICBcImNzdlwiXHJcbiAgICBcImRcIlxyXG4gICAgXCJlanNcIlxyXG4gICAgXCJlbG1cIlxyXG4gICAgXCJlcmJcIlxyXG4gICAgXCJlcmxhbmdcIlxyXG4gICAgXCJnaGVya2luXCJcclxuICAgIFwiZ2xzbFwiXHJcbiAgICBcImdvXCJcclxuICAgIFwiZ29odG1sXCJcclxuICAgIFwiZm9ydHJhblwiXHJcbiAgICBcImhhbmRsZWJhcnNcIlxyXG4gICAgXCJoYXNrZWxsXCJcclxuICAgIFwiaHRtbFwiXHJcbiAgICBcImphZGVcIlxyXG4gICAgXCJqYXZhXCJcclxuICAgIFwiamF2YXNjcmlwdFwiXHJcbiAgICBcImpzb25cIlxyXG4gICAgXCJqc3hcIlxyXG4gICAgXCJsYXRleFwiXHJcbiAgICBcImxlc3NcIlxyXG4gICAgXCJsdWFcIlxyXG4gICAgXCJtYXJrZG93blwiXHJcbiAgICAnbWFya28nXHJcbiAgICBcIm11c3RhY2hlXCJcclxuICAgIFwibmdpbnhcIlxyXG4gICAgXCJudW5qdWNrc1wiXHJcbiAgICBcIm9iamVjdGl2ZS1jXCJcclxuICAgIFwib2NhbWxcIlxyXG4gICAgXCJwYXduXCJcclxuICAgIFwicGVybFwiXHJcbiAgICBcInBocFwiXHJcbiAgICBcInB1cHBldFwiXHJcbiAgICBcInB5dGhvblwiXHJcbiAgICBcInJcIlxyXG4gICAgXCJyaW90anNcIlxyXG4gICAgXCJydWJ5XCJcclxuICAgIFwicnVzdFwiXHJcbiAgICBcInNhc3NcIlxyXG4gICAgXCJzY3NzXCJcclxuICAgIFwic3BhY2ViYXJzXCJcclxuICAgIFwic3FsXCJcclxuICAgIFwic3ZnXCJcclxuICAgIFwic3dpZ1wiXHJcbiAgICBcInRzc1wiXHJcbiAgICBcInR3aWdcIlxyXG4gICAgXCJ0eXBlc2NyaXB0XCJcclxuICAgIFwidXhfbWFya3VwXCJcclxuICAgIFwidmFsYVwiXHJcbiAgICBcInZ1ZVwiXHJcbiAgICBcInZpc3VhbGZvcmNlXCJcclxuICAgIFwieG1sXCJcclxuICAgIFwieHRlbXBsYXRlXCJcclxuICAgIFwieWFtbFwiXHJcbiAgXVxyXG5cclxuICAjIyNcclxuICBMYW5ndWFnZXNcclxuICAjIyNcclxuICBsYW5ndWFnZXM6IG51bGxcclxuXHJcbiAgIyMjXHJcbiAgTmFtZXNwYWNlc1xyXG4gICMjI1xyXG4gIG5hbWVzcGFjZXM6IG51bGxcclxuXHJcbiAgIyMjXHJcbiAgQ29uc3RydWN0b3JcclxuICAjIyNcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBsYW5ndWFnZXMgPSBfLm1hcChAbGFuZ3VhZ2VOYW1lcywgKG5hbWUpIC0+XHJcbiAgICAgIHJlcXVpcmUoXCIuLyN7bmFtZX1cIilcclxuICAgIClcclxuICAgIEBuYW1lc3BhY2VzID0gXy5tYXAoQGxhbmd1YWdlcywgKGxhbmd1YWdlKSAtPiBsYW5ndWFnZS5uYW1lc3BhY2UpXHJcblxyXG4gICMjI1xyXG4gIEdldCBsYW5ndWFnZSBmb3IgZ3JhbW1hciBhbmQgZXh0ZW5zaW9uXHJcbiAgIyMjXHJcbiAgZ2V0TGFuZ3VhZ2VzOiAoe25hbWUsIG5hbWVzcGFjZSwgZ3JhbW1hciwgZXh0ZW5zaW9ufSkgLT5cclxuICAgICMgY29uc29sZS5sb2coJ2dldExhbmd1YWdlcycsIG5hbWUsIG5hbWVzcGFjZSwgZ3JhbW1hciwgZXh0ZW5zaW9uLCBAbGFuZ3VhZ2VzKVxyXG4gICAgXy51bmlvbihcclxuICAgICAgXy5maWx0ZXIoQGxhbmd1YWdlcywgKGxhbmd1YWdlKSAtPiBfLmlzRXF1YWwobGFuZ3VhZ2UubmFtZSwgbmFtZSkpXHJcbiAgICAgIF8uZmlsdGVyKEBsYW5ndWFnZXMsIChsYW5ndWFnZSkgLT4gXy5pc0VxdWFsKGxhbmd1YWdlLm5hbWVzcGFjZSwgbmFtZXNwYWNlKSlcclxuICAgICAgXy5maWx0ZXIoQGxhbmd1YWdlcywgKGxhbmd1YWdlKSAtPiBfLmluY2x1ZGVzKGxhbmd1YWdlLmdyYW1tYXJzLCBncmFtbWFyKSlcclxuICAgICAgXy5maWx0ZXIoQGxhbmd1YWdlcywgKGxhbmd1YWdlKSAtPiBfLmluY2x1ZGVzKGxhbmd1YWdlLmV4dGVuc2lvbnMsIGV4dGVuc2lvbikpXHJcbiAgICApXHJcbiJdfQ==
