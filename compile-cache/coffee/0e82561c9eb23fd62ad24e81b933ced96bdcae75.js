(function() {
  module.exports = {
    name: "LaTeX",
    namespace: "latex",
    scope: ['source.tex'],

    /*
    Supported Grammars
     */
    grammars: ["BibTeX", "LaTeX", "TeX"],

    /*
    Supported extensions
     */
    extensions: ["bib", "tex", "sty", "cls", "dtx", "ins", "bbx", "cbx"],
    defaultBeautifier: "Latex Beautify",

    /*
     */
    options: {
      indent_char: {
        type: 'string',
        "default": null,
        description: "Indentation character"
      },
      indent_with_tabs: {
        type: 'boolean',
        "default": null,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
      },
      indent_preamble: {
        type: 'boolean',
        "default": false,
        description: "Indent the preamble"
      },
      always_look_for_split_braces: {
        type: 'boolean',
        "default": true,
        description: "If `latexindent` should look for commands that split braces across lines"
      },
      always_look_for_split_brackets: {
        type: 'boolean',
        "default": false,
        description: "If `latexindent` should look for commands that split brackets across lines"
      },
      remove_trailing_whitespace: {
        type: 'boolean',
        "default": false,
        description: "Remove trailing whitespace"
      },
      align_columns_in_environments: {
        type: 'array',
        "default": ["tabular", "matrix", "bmatrix", "pmatrix"],
        description: "Aligns columns by the alignment tabs for environments specified"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbGF0ZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sT0FGUztJQUdmLFNBQUEsRUFBVyxPQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsWUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixRQURRLEVBRVIsT0FGUSxFQUdSLEtBSFEsQ0FUSzs7QUFlZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsS0FEVSxFQUVWLEtBRlUsRUFHVixLQUhVLEVBSVYsS0FKVSxFQUtWLEtBTFUsRUFNVixLQU5VLEVBT1YsS0FQVSxFQVFWLEtBUlUsQ0FsQkc7SUE2QmYsaUJBQUEsRUFBbUIsZ0JBN0JKOztBQStCZjs7SUFHQSxPQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSx1QkFGYjtPQURGO01BSUEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGtFQUZiO09BTEY7TUFRQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxxQkFGYjtPQVRGO01BWUEsNEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLDBFQUZiO09BYkY7TUFnQkEsOEJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDRFQUZiO09BakJGO01Bb0JBLDBCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSw0QkFGYjtPQXJCRjtNQXdCQSw2QkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFRLENBQUMsU0FBRCxFQUFZLFFBQVosRUFBc0IsU0FBdEIsRUFBaUMsU0FBakMsQ0FEUjtRQUVBLFdBQUEsRUFBYSxpRUFGYjtPQXpCRjtLQW5DYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgbmFtZTogXCJMYVRlWFwiXHJcbiAgbmFtZXNwYWNlOiBcImxhdGV4XCJcclxuICBzY29wZTogWydzb3VyY2UudGV4J11cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXHJcbiAgIyMjXHJcbiAgZ3JhbW1hcnM6IFtcclxuICAgIFwiQmliVGVYXCJcclxuICAgIFwiTGFUZVhcIlxyXG4gICAgXCJUZVhcIlxyXG4gIF1cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcclxuICAjIyNcclxuICBleHRlbnNpb25zOiBbXHJcbiAgICBcImJpYlwiXHJcbiAgICBcInRleFwiXHJcbiAgICBcInN0eVwiXHJcbiAgICBcImNsc1wiXHJcbiAgICBcImR0eFwiXHJcbiAgICBcImluc1wiXHJcbiAgICBcImJieFwiXHJcbiAgICBcImNieFwiXHJcbiAgXVxyXG5cclxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJMYXRleCBCZWF1dGlmeVwiXHJcblxyXG4gICMjI1xyXG5cclxuICAjIyNcclxuICBvcHRpb25zOlxyXG4gICAgaW5kZW50X2NoYXI6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcclxuICAgIGluZGVudF93aXRoX3RhYnM6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBudWxsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHVzZXMgdGFicywgb3ZlcnJpZGVzIGBJbmRlbnQgU2l6ZWAgYW5kIGBJbmRlbnQgQ2hhcmBcIlxyXG4gICAgaW5kZW50X3ByZWFtYmxlOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50IHRoZSBwcmVhbWJsZVwiXHJcbiAgICBhbHdheXNfbG9va19mb3Jfc3BsaXRfYnJhY2VzOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBgbGF0ZXhpbmRlbnRgIHNob3VsZCBsb29rIGZvciBjb21tYW5kcyB0aGF0IHNwbGl0IGJyYWNlcyBhY3Jvc3MgbGluZXNcIlxyXG4gICAgYWx3YXlzX2xvb2tfZm9yX3NwbGl0X2JyYWNrZXRzOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgYGxhdGV4aW5kZW50YCBzaG91bGQgbG9vayBmb3IgY29tbWFuZHMgdGhhdCBzcGxpdCBicmFja2V0cyBhY3Jvc3MgbGluZXNcIlxyXG4gICAgcmVtb3ZlX3RyYWlsaW5nX3doaXRlc3BhY2U6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZW1vdmUgdHJhaWxpbmcgd2hpdGVzcGFjZVwiXHJcbiAgICBhbGlnbl9jb2x1bW5zX2luX2Vudmlyb25tZW50czpcclxuICAgICAgdHlwZTogJ2FycmF5J1xyXG4gICAgICBkZWZhdWx0OltcInRhYnVsYXJcIiwgXCJtYXRyaXhcIiwgXCJibWF0cml4XCIsIFwicG1hdHJpeFwiXVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJBbGlnbnMgY29sdW1ucyBieSB0aGUgYWxpZ25tZW50IHRhYnMgZm9yIGVudmlyb25tZW50cyBzcGVjaWZpZWRcIlxyXG59XHJcbiJdfQ==
