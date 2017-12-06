(function() {
  module.exports = {
    name: "CSS",
    namespace: "css",
    scope: ['source.css'],

    /*
    Supported Grammars
     */
    grammars: ["CSS"],

    /*
    Supported extensions
     */
    extensions: ["css"],
    defaultBeautifier: "JS Beautify",
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      indent_char: {
        type: 'string',
        "default": null,
        minimum: 0,
        description: "Indentation character"
      },
      selector_separator_newline: {
        type: 'boolean',
        "default": false,
        description: "Add a newline between multiple selectors"
      },
      newline_between_rules: {
        type: 'boolean',
        "default": true,
        description: "Add a newline between CSS rules"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": false,
        description: "Retain empty lines. " + "Consecutive empty lines will be converted to a single empty line."
      },
      wrap_line_length: {
        type: 'integer',
        "default": 0,
        description: "Maximum amount of characters per line (0 = disable)"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      indent_comments: {
        type: 'boolean',
        "default": true,
        description: "Determines whether comments should be indented."
      },
      force_indentation: {
        type: 'boolean',
        "default": false,
        description: "if indentation should be forcefully applied to markup even if it disruptively adds unintended whitespace to the documents rendered output"
      },
      convert_quotes: {
        type: 'string',
        "default": "none",
        description: "Convert the quote characters delimiting strings from either double or single quotes to the other.",
        "enum": ["none", "double", "single"]
      },
      align_assignments: {
        type: 'boolean',
        "default": false,
        description: "If lists of assignments or properties should be vertically aligned for faster and easier reading."
      },
      no_lead_zero: {
        type: 'boolean',
        "default": false,
        description: "If in CSS values leading 0s immediately preceding a decimal should be removed or prevented."
      },
      configPath: {
        title: "comb custom config file",
        type: 'string',
        "default": "",
        description: "Path to custom CSScomb config file, used in absence of a `.csscomb.json` or `.csscomb.cson` at the root of your project."
      },
      predefinedConfig: {
        title: "comb predefined config",
        type: 'string',
        "default": "csscomb",
        description: "Used if neither a project or custom config file exists.",
        "enum": ["csscomb", "yandex", "zen"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvY3NzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLEtBRlM7SUFHZixTQUFBLEVBQVcsS0FISTtJQUlmLEtBQUEsRUFBTyxDQUFDLFlBQUQsQ0FKUTs7QUFNZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsS0FEUSxDQVRLOztBQWFmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLENBaEJHO0lBb0JmLGlCQUFBLEVBQW1CLGFBcEJKO0lBc0JmLE9BQUEsRUFFRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtNQUtBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEsdUJBSGI7T0FORjtNQVVBLDBCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSwwQ0FGYjtPQVhGO01BY0EscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLGlDQUZiO09BZkY7TUFrQkEsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHNCQUFBLEdBQ1gsbUVBSEY7T0FuQkY7TUF3QkEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQURUO1FBRUEsV0FBQSxFQUFhLHFEQUZiO09BekJGO01BNEJBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSx5QkFGYjtPQTdCRjtNQWdDQSxlQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxpREFGYjtPQWpDRjtNQW9DQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsMklBRmI7T0FyQ0Y7TUEwQ0EsY0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRFQ7UUFFQSxXQUFBLEVBQWEsbUdBRmI7UUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsUUFBbkIsQ0FKTjtPQTNDRjtNQWdEQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsbUdBRmI7T0FqREY7TUFxREEsWUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsNkZBRmI7T0F0REY7TUEwREEsVUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLHlCQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRlQ7UUFHQSxXQUFBLEVBQWEsMEhBSGI7T0EzREY7TUFnRUEsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyx3QkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUZUO1FBR0EsV0FBQSxFQUFhLHlEQUhiO1FBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLFNBQUQsRUFBWSxRQUFaLEVBQXNCLEtBQXRCLENBSk47T0FqRUY7S0F4QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIG5hbWU6IFwiQ1NTXCJcclxuICBuYW1lc3BhY2U6IFwiY3NzXCJcclxuICBzY29wZTogWydzb3VyY2UuY3NzJ11cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXHJcbiAgIyMjXHJcbiAgZ3JhbW1hcnM6IFtcclxuICAgIFwiQ1NTXCJcclxuICBdXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXHJcbiAgIyMjXHJcbiAgZXh0ZW5zaW9uczogW1xyXG4gICAgXCJjc3NcIlxyXG4gIF1cclxuXHJcbiAgZGVmYXVsdEJlYXV0aWZpZXI6IFwiSlMgQmVhdXRpZnlcIlxyXG5cclxuICBvcHRpb25zOlxyXG4gICAgIyBDU1NcclxuICAgIGluZGVudF9zaXplOlxyXG4gICAgICB0eXBlOiAnaW50ZWdlcidcclxuICAgICAgZGVmYXVsdDogbnVsbFxyXG4gICAgICBtaW5pbXVtOiAwXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcclxuICAgIGluZGVudF9jaGFyOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBudWxsXHJcbiAgICAgIG1pbmltdW06IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcclxuICAgIHNlbGVjdG9yX3NlcGFyYXRvcl9uZXdsaW5lOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIGEgbmV3bGluZSBiZXR3ZWVuIG11bHRpcGxlIHNlbGVjdG9yc1wiXHJcbiAgICBuZXdsaW5lX2JldHdlZW5fcnVsZXM6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiB0cnVlXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBhIG5ld2xpbmUgYmV0d2VlbiBDU1MgcnVsZXNcIlxyXG4gICAgcHJlc2VydmVfbmV3bGluZXM6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZXRhaW4gZW1wdHkgbGluZXMuIFwiK1xyXG4gICAgICAgIFwiQ29uc2VjdXRpdmUgZW1wdHkgbGluZXMgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gXFxcclxuICAgICAgICAgICAgICAgIGEgc2luZ2xlIGVtcHR5IGxpbmUuXCJcclxuICAgIHdyYXBfbGluZV9sZW5ndGg6XHJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xyXG4gICAgICBkZWZhdWx0OiAwXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk1heGltdW0gYW1vdW50IG9mIGNoYXJhY3RlcnMgcGVyIGxpbmUgKDAgPSBkaXNhYmxlKVwiXHJcbiAgICBlbmRfd2l0aF9uZXdsaW5lOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiRW5kIG91dHB1dCB3aXRoIG5ld2xpbmVcIlxyXG4gICAgaW5kZW50X2NvbW1lbnRzOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJEZXRlcm1pbmVzIHdoZXRoZXIgY29tbWVudHMgc2hvdWxkIGJlIGluZGVudGVkLlwiXHJcbiAgICBmb3JjZV9pbmRlbnRhdGlvbjpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcImlmIGluZGVudGF0aW9uIHNob3VsZCBiZSBmb3JjZWZ1bGx5IGFwcGxpZWQgdG8gXFxcclxuICAgICAgICAgICAgICAgIG1hcmt1cCBldmVuIGlmIGl0IGRpc3J1cHRpdmVseSBhZGRzIHVuaW50ZW5kZWQgd2hpdGVzcGFjZSBcXFxyXG4gICAgICAgICAgICAgICAgdG8gdGhlIGRvY3VtZW50cyByZW5kZXJlZCBvdXRwdXRcIlxyXG4gICAgY29udmVydF9xdW90ZXM6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwibm9uZVwiXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNvbnZlcnQgdGhlIHF1b3RlIGNoYXJhY3RlcnMgZGVsaW1pdGluZyBzdHJpbmdzIFxcXHJcbiAgICAgICAgICAgICAgICBmcm9tIGVpdGhlciBkb3VibGUgb3Igc2luZ2xlIHF1b3RlcyB0byB0aGUgb3RoZXIuXCJcclxuICAgICAgZW51bTogW1wibm9uZVwiLCBcImRvdWJsZVwiLCBcInNpbmdsZVwiXVxyXG4gICAgYWxpZ25fYXNzaWdubWVudHM6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBsaXN0cyBvZiBhc3NpZ25tZW50cyBvciBwcm9wZXJ0aWVzIHNob3VsZCBiZSBcXFxyXG4gICAgICAgICAgICAgICAgdmVydGljYWxseSBhbGlnbmVkIGZvciBmYXN0ZXIgYW5kIGVhc2llciByZWFkaW5nLlwiXHJcbiAgICBub19sZWFkX3plcm86XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBpbiBDU1MgdmFsdWVzIGxlYWRpbmcgMHMgaW1tZWRpYXRlbHkgcHJlY2VkaW5nIFxcXHJcbiAgICAgICAgICAgICAgICBhIGRlY2ltYWwgc2hvdWxkIGJlIHJlbW92ZWQgb3IgcHJldmVudGVkLlwiXHJcbiAgICBjb25maWdQYXRoOlxyXG4gICAgICB0aXRsZTogXCJjb21iIGN1c3RvbSBjb25maWcgZmlsZVwiXHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwiXCJcclxuICAgICAgZGVzY3JpcHRpb246IFwiUGF0aCB0byBjdXN0b20gQ1NTY29tYiBjb25maWcgZmlsZSwgdXNlZCBpbiBhYnNlbmNlIG9mIGEgXFxcclxuICAgICAgICAgICAgICAgIGAuY3NzY29tYi5qc29uYCBvciBgLmNzc2NvbWIuY3NvbmAgYXQgdGhlIHJvb3Qgb2YgeW91ciBwcm9qZWN0LlwiXHJcbiAgICBwcmVkZWZpbmVkQ29uZmlnOlxyXG4gICAgICB0aXRsZTogXCJjb21iIHByZWRlZmluZWQgY29uZmlnXCJcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogXCJjc3Njb21iXCJcclxuICAgICAgZGVzY3JpcHRpb246IFwiVXNlZCBpZiBuZWl0aGVyIGEgcHJvamVjdCBvciBjdXN0b20gY29uZmlnIGZpbGUgZXhpc3RzLlwiXHJcbiAgICAgIGVudW06IFtcImNzc2NvbWJcIiwgXCJ5YW5kZXhcIiwgXCJ6ZW5cIl1cclxufVxyXG4iXX0=
