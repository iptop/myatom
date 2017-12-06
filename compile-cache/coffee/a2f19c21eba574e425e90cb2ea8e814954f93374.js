(function() {
  module.exports = {
    name: "Python",
    namespace: "python",
    scope: ['source.python'],

    /*
    Supported Grammars
     */
    grammars: ["Python"],

    /*
    Supported extensions
     */
    extensions: ["py"],
    options: {
      max_line_length: {
        type: 'integer',
        "default": 79,
        description: "set maximum allowed line length"
      },
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      ignore: {
        type: 'array',
        "default": ["E24"],
        items: {
          type: 'string'
        },
        description: "do not fix these errors/warnings"
      },
      formater: {
        type: 'string',
        "default": 'autopep8',
        "enum": ['autopep8', 'yapf'],
        description: "formatter used by pybeautifier"
      },
      style_config: {
        type: 'string',
        "default": 'pep8',
        description: "formatting style used by yapf"
      },
      sort_imports: {
        type: 'boolean',
        "default": false,
        description: "sort imports (requires isort installed)"
      },
      multi_line_output: {
        type: 'string',
        "default": 'Hanging Grid Grouped',
        "enum": ['Grid', 'Vertical', 'Hanging Indent', 'Vertical Hanging Indent', 'Hanging Grid', 'Hanging Grid Grouped', 'NOQA'],
        description: "defines how from imports wrap (requires isort installed)"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvcHl0aG9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLFFBRlM7SUFHZixTQUFBLEVBQVcsUUFISTtJQUlmLEtBQUEsRUFBTyxDQUFDLGVBQUQsQ0FKUTs7QUFNZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsUUFEUSxDQVRLOztBQWFmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixJQURVLENBaEJHO0lBb0JmLE9BQUEsRUFDRTtNQUFBLGVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLGlDQUZiO09BREY7TUFJQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHlCQUhiO09BTEY7TUFTQSxNQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxLQUFELENBRFQ7UUFFQSxLQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO1FBSUEsV0FBQSxFQUFhLGtDQUpiO09BVkY7TUFlQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsTUFBYixDQUZOO1FBR0EsV0FBQSxFQUFhLGdDQUhiO09BaEJGO01Bb0JBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO1FBRUEsV0FBQSxFQUFhLCtCQUZiO09BckJGO01Bd0JBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHlDQUZiO09BekJGO01BNEJBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsc0JBRFQ7UUFFQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQ0osTUFESSxFQUVKLFVBRkksRUFHSixnQkFISSxFQUlKLHlCQUpJLEVBS0osY0FMSSxFQU1KLHNCQU5JLEVBT0osTUFQSSxDQUZOO1FBV0EsV0FBQSxFQUFhLDBEQVhiO09BN0JGO0tBckJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBuYW1lOiBcIlB5dGhvblwiXHJcbiAgbmFtZXNwYWNlOiBcInB5dGhvblwiXHJcbiAgc2NvcGU6IFsnc291cmNlLnB5dGhvbiddXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xyXG4gICMjI1xyXG4gIGdyYW1tYXJzOiBbXHJcbiAgICBcIlB5dGhvblwiXHJcbiAgXVxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xyXG4gICMjI1xyXG4gIGV4dGVuc2lvbnM6IFtcclxuICAgIFwicHlcIlxyXG4gIF1cclxuXHJcbiAgb3B0aW9uczpcclxuICAgIG1heF9saW5lX2xlbmd0aDpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IDc5XHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcInNldCBtYXhpbXVtIGFsbG93ZWQgbGluZSBsZW5ndGhcIlxyXG4gICAgaW5kZW50X3NpemU6XHJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xyXG4gICAgICBkZWZhdWx0OiBudWxsXHJcbiAgICAgIG1pbmltdW06IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxyXG4gICAgaWdub3JlOlxyXG4gICAgICB0eXBlOiAnYXJyYXknXHJcbiAgICAgIGRlZmF1bHQ6IFtcIkUyNFwiXVxyXG4gICAgICBpdGVtczpcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZXNjcmlwdGlvbjogXCJkbyBub3QgZml4IHRoZXNlIGVycm9ycy93YXJuaW5nc1wiXHJcbiAgICBmb3JtYXRlcjpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogJ2F1dG9wZXA4J1xyXG4gICAgICBlbnVtOiBbJ2F1dG9wZXA4JywgJ3lhcGYnXVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJmb3JtYXR0ZXIgdXNlZCBieSBweWJlYXV0aWZpZXJcIlxyXG4gICAgc3R5bGVfY29uZmlnOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiAncGVwOCdcclxuICAgICAgZGVzY3JpcHRpb246IFwiZm9ybWF0dGluZyBzdHlsZSB1c2VkIGJ5IHlhcGZcIlxyXG4gICAgc29ydF9pbXBvcnRzOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwic29ydCBpbXBvcnRzIChyZXF1aXJlcyBpc29ydCBpbnN0YWxsZWQpXCJcclxuICAgIG11bHRpX2xpbmVfb3V0cHV0OlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiAnSGFuZ2luZyBHcmlkIEdyb3VwZWQnXHJcbiAgICAgIGVudW06IFtcclxuICAgICAgICAnR3JpZCdcclxuICAgICAgICAnVmVydGljYWwnXHJcbiAgICAgICAgJ0hhbmdpbmcgSW5kZW50J1xyXG4gICAgICAgICdWZXJ0aWNhbCBIYW5naW5nIEluZGVudCdcclxuICAgICAgICAnSGFuZ2luZyBHcmlkJ1xyXG4gICAgICAgICdIYW5naW5nIEdyaWQgR3JvdXBlZCdcclxuICAgICAgICAnTk9RQSdcclxuICAgICAgXVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJkZWZpbmVzIGhvdyBmcm9tIGltcG9ydHMgd3JhcCAocmVxdWlyZXMgaXNvcnQgaW5zdGFsbGVkKVwiXHJcbn1cclxuIl19
