(function() {
  "use strict";
  var Beautifier, MarkoBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = MarkoBeautifier = (function(superClass) {
    extend(MarkoBeautifier, superClass);

    function MarkoBeautifier() {
      return MarkoBeautifier.__super__.constructor.apply(this, arguments);
    }

    MarkoBeautifier.prototype.name = 'Marko Beautifier';

    MarkoBeautifier.prototype.link = "https://github.com/marko-js/marko-prettyprint";

    MarkoBeautifier.prototype.options = {
      Marko: true
    };

    MarkoBeautifier.prototype.beautify = function(text, language, options, context) {
      return new this.Promise(function(resolve, reject) {
        var error, i, indent, indent_char, indent_size, j, markoPrettyprint, prettyprintOptions, ref;
        markoPrettyprint = require('marko-prettyprint');
        indent_char = options.indent_char || ' ';
        indent_size = options.indent_size || 4;
        indent = '';
        for (i = j = 0, ref = indent_size - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          indent += indent_char;
        }
        prettyprintOptions = {
          syntax: options.syntax,
          filename: (context != null) && (context.filePath != null) ? context.filePath : require.resolve('marko-prettyprint'),
          indent: indent
        };
        try {
          return resolve(markoPrettyprint(text, prettyprintOptions));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return MarkoBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9tYXJrby1iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSwyQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7OEJBRXJCLElBQUEsR0FBTTs7OEJBQ04sSUFBQSxHQUFNOzs4QkFFTixPQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQU8sSUFBUDs7OzhCQUVGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCLEVBQTBCLE9BQTFCO0FBRVIsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLG1CQUFSO1FBRW5CLFdBQUEsR0FBYyxPQUFPLENBQUMsV0FBUixJQUF1QjtRQUNyQyxXQUFBLEdBQWMsT0FBTyxDQUFDLFdBQVIsSUFBdUI7UUFFckMsTUFBQSxHQUFTO0FBRVQsYUFBUywwRkFBVDtVQUNFLE1BQUEsSUFBVTtBQURaO1FBR0Esa0JBQUEsR0FDRTtVQUFBLE1BQUEsRUFBUyxPQUFPLENBQUMsTUFBakI7VUFDQSxRQUFBLEVBQWEsaUJBQUEsSUFBYSwwQkFBaEIsR0FBdUMsT0FBTyxDQUFDLFFBQS9DLEdBQTZELE9BQU8sQ0FBQyxPQUFSLENBQWdCLG1CQUFoQixDQUR2RTtVQUVBLE1BQUEsRUFBUSxNQUZSOztBQUlGO2lCQUNFLE9BQUEsQ0FBUSxnQkFBQSxDQUFpQixJQUFqQixFQUF1QixrQkFBdkIsQ0FBUixFQURGO1NBQUEsY0FBQTtVQUVNO2lCQUVKLE1BQUEsQ0FBTyxLQUFQLEVBSkY7O01BaEJrQixDQUFUO0lBRkg7Ozs7S0FSbUM7QUFIL0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTWFya29CZWF1dGlmaWVyIGV4dGVuZHMgQmVhdXRpZmllclxyXG5cclxuICBuYW1lOiAnTWFya28gQmVhdXRpZmllcidcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrby1qcy9tYXJrby1wcmV0dHlwcmludFwiXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBNYXJrbzogdHJ1ZVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxyXG5cclxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cclxuICAgICAgbWFya29QcmV0dHlwcmludCA9IHJlcXVpcmUoJ21hcmtvLXByZXR0eXByaW50JylcclxuXHJcbiAgICAgIGluZGVudF9jaGFyID0gb3B0aW9ucy5pbmRlbnRfY2hhciB8fCAnICdcclxuICAgICAgaW5kZW50X3NpemUgPSBvcHRpb25zLmluZGVudF9zaXplIHx8IDRcclxuXHJcbiAgICAgIGluZGVudCA9ICcnXHJcblxyXG4gICAgICBmb3IgaSBpbiBbMC4uaW5kZW50X3NpemUgLSAxXVxyXG4gICAgICAgIGluZGVudCArPSBpbmRlbnRfY2hhclxyXG5cclxuICAgICAgcHJldHR5cHJpbnRPcHRpb25zID1cclxuICAgICAgICBzeW50YXggOiBvcHRpb25zLnN5bnRheFxyXG4gICAgICAgIGZpbGVuYW1lOiBpZiBjb250ZXh0PyBhbmQgY29udGV4dC5maWxlUGF0aD8gdGhlbiBjb250ZXh0LmZpbGVQYXRoIGVsc2UgcmVxdWlyZS5yZXNvbHZlKCdtYXJrby1wcmV0dHlwcmludCcpXHJcbiAgICAgICAgaW5kZW50OiBpbmRlbnRcclxuXHJcbiAgICAgIHRyeVxyXG4gICAgICAgIHJlc29sdmUobWFya29QcmV0dHlwcmludCh0ZXh0LCBwcmV0dHlwcmludE9wdGlvbnMpKVxyXG4gICAgICBjYXRjaCBlcnJvclxyXG4gICAgICAgICMgRXJyb3Igb2NjdXJyZWRcclxuICAgICAgICByZWplY3QoZXJyb3IpXHJcbiAgICApXHJcbiJdfQ==
