(function() {
  module.exports = {
    name: "JavaScript",
    namespace: "js",
    scope: ['source.js'],

    /*
    Supported Grammars
     */
    grammars: ["JavaScript"],

    /*
    Supported extensions
     */
    extensions: ["js"],
    defaultBeautifier: "JS Beautify",

    /*
     */
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
        description: "Indentation character"
      },
      indent_level: {
        type: 'integer',
        "default": 0,
        description: "Initial indentation level"
      },
      indent_with_tabs: {
        type: 'boolean',
        "default": null,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      },
      max_preserve_newlines: {
        type: 'integer',
        "default": 10,
        description: "Number of line-breaks to be preserved in one chunk"
      },
      space_in_paren: {
        type: 'boolean',
        "default": false,
        description: "Add padding spaces within paren, ie. f( a, b )"
      },
      jslint_happy: {
        type: 'boolean',
        "default": false,
        description: "Enable jslint-stricter mode"
      },
      space_after_anon_function: {
        type: 'boolean',
        "default": false,
        description: "Add a space before an anonymous function's parens, ie. function ()"
      },
      brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "collapse-preserve-inline", "expand", "end-expand", "none"],
        description: "[collapse|collapse-preserve-inline|expand|end-expand|none]"
      },
      break_chained_methods: {
        type: 'boolean',
        "default": false,
        description: "Break chained method calls across subsequent lines"
      },
      keep_array_indentation: {
        type: 'boolean',
        "default": false,
        description: "Preserve array indentation"
      },
      keep_function_indentation: {
        type: 'boolean',
        "default": false,
        description: ""
      },
      space_before_conditional: {
        type: 'boolean',
        "default": true,
        description: ""
      },
      eval_code: {
        type: 'boolean',
        "default": false,
        description: ""
      },
      unescape_strings: {
        type: 'boolean',
        "default": false,
        description: "Decode printable characters encoded in xNN notation"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 0,
        description: "Wrap lines at next opportunity after N characters"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      end_with_comma: {
        type: 'boolean',
        "default": false,
        description: "If a terminating comma should be inserted into arrays, object literals, and destructured objects."
      },
      end_of_line: {
        type: 'string',
        "default": "System Default",
        "enum": ["CRLF", "LF", "System Default"],
        description: "Override EOL from line-ending-selector"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvamF2YXNjcmlwdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxZQUZTO0lBR2YsU0FBQSxFQUFXLElBSEk7SUFJZixLQUFBLEVBQU8sQ0FBQyxXQUFELENBSlE7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLFlBRFEsQ0FUSzs7QUFhZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsSUFEVSxDQWhCRztJQW9CZixpQkFBQSxFQUFtQixhQXBCSjs7QUFzQmY7O0lBRUEsT0FBQSxFQUVFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQURGO01BS0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsdUJBRmI7T0FORjtNQVNBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQURUO1FBRUEsV0FBQSxFQUFhLDJCQUZiO09BVkY7TUFhQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsa0VBRmI7T0FkRjtNQWlCQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsc0JBRmI7T0FsQkY7TUFxQkEscUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsV0FBQSxFQUFhLG9EQUZiO09BdEJGO01BeUJBLGNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLGdEQUZiO09BMUJGO01BNkJBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDZCQUZiO09BOUJGO01BaUNBLHlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxvRUFGYjtPQWxDRjtNQXFDQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsMEJBQWIsRUFBeUMsUUFBekMsRUFBbUQsWUFBbkQsRUFBaUUsTUFBakUsQ0FGTjtRQUdBLFdBQUEsRUFBYSw0REFIYjtPQXRDRjtNQTBDQSxxQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsb0RBRmI7T0EzQ0Y7TUE4Q0Esc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLDRCQUZiO09BL0NGO01Ba0RBLHlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtRQUVBLFdBQUEsRUFBYSxFQUZiO09BbkRGO01Bc0RBLHdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxFQUZiO09BdkRGO01BMERBLFNBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLEVBRmI7T0EzREY7TUE4REEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1FBRUEsV0FBQSxFQUFhLHFEQUZiO09BL0RGO01Ba0VBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FEVDtRQUVBLFdBQUEsRUFBYSxtREFGYjtPQW5FRjtNQXNFQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEseUJBRmI7T0F2RUY7TUEwRUEsY0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsbUdBRmI7T0EzRUY7TUErRUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLGdCQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUSxJQUFSLEVBQWEsZ0JBQWIsQ0FGTjtRQUdBLFdBQUEsRUFBYSx3Q0FIYjtPQWhGRjtLQTFCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgbmFtZTogXCJKYXZhU2NyaXB0XCJcclxuICBuYW1lc3BhY2U6IFwianNcIlxyXG4gIHNjb3BlOiBbJ3NvdXJjZS5qcyddXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xyXG4gICMjI1xyXG4gIGdyYW1tYXJzOiBbXHJcbiAgICBcIkphdmFTY3JpcHRcIlxyXG4gIF1cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcclxuICAjIyNcclxuICBleHRlbnNpb25zOiBbXHJcbiAgICBcImpzXCJcclxuICBdXHJcblxyXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIkpTIEJlYXV0aWZ5XCJcclxuXHJcbiAgIyMjXHJcbiAgIyMjXHJcbiAgb3B0aW9uczpcclxuICAgICMgSmF2YVNjcmlwdFxyXG4gICAgaW5kZW50X3NpemU6XHJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xyXG4gICAgICBkZWZhdWx0OiBudWxsXHJcbiAgICAgIG1pbmltdW06IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxyXG4gICAgaW5kZW50X2NoYXI6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcclxuICAgIGluZGVudF9sZXZlbDpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5pdGlhbCBpbmRlbnRhdGlvbiBsZXZlbFwiXHJcbiAgICBpbmRlbnRfd2l0aF90YWJzOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogbnVsbFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiB1c2VzIHRhYnMsIG92ZXJyaWRlcyBgSW5kZW50IFNpemVgIGFuZCBgSW5kZW50IENoYXJgXCJcclxuICAgIHByZXNlcnZlX25ld2xpbmVzOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJQcmVzZXJ2ZSBsaW5lLWJyZWFrc1wiXHJcbiAgICBtYXhfcHJlc2VydmVfbmV3bGluZXM6XHJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xyXG4gICAgICBkZWZhdWx0OiAxMFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJOdW1iZXIgb2YgbGluZS1icmVha3MgdG8gYmUgcHJlc2VydmVkIGluIG9uZSBjaHVua1wiXHJcbiAgICBzcGFjZV9pbl9wYXJlbjpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBwYWRkaW5nIHNwYWNlcyB3aXRoaW4gcGFyZW4sIGllLiBmKCBhLCBiIClcIlxyXG4gICAganNsaW50X2hhcHB5OlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiRW5hYmxlIGpzbGludC1zdHJpY3RlciBtb2RlXCJcclxuICAgIHNwYWNlX2FmdGVyX2Fub25fZnVuY3Rpb246XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJBZGQgYSBzcGFjZSBiZWZvcmUgYW4gYW5vbnltb3VzIGZ1bmN0aW9uJ3MgcGFyZW5zLCBpZS4gZnVuY3Rpb24gKClcIlxyXG4gICAgYnJhY2Vfc3R5bGU6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwiY29sbGFwc2VcIlxyXG4gICAgICBlbnVtOiBbXCJjb2xsYXBzZVwiLCBcImNvbGxhcHNlLXByZXNlcnZlLWlubGluZVwiLCBcImV4cGFuZFwiLCBcImVuZC1leHBhbmRcIiwgXCJub25lXCJdXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIltjb2xsYXBzZXxjb2xsYXBzZS1wcmVzZXJ2ZS1pbmxpbmV8ZXhwYW5kfGVuZC1leHBhbmR8bm9uZV1cIlxyXG4gICAgYnJlYWtfY2hhaW5lZF9tZXRob2RzOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiQnJlYWsgY2hhaW5lZCBtZXRob2QgY2FsbHMgYWNyb3NzIHN1YnNlcXVlbnQgbGluZXNcIlxyXG4gICAga2VlcF9hcnJheV9pbmRlbnRhdGlvbjpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlByZXNlcnZlIGFycmF5IGluZGVudGF0aW9uXCJcclxuICAgIGtlZXBfZnVuY3Rpb25faW5kZW50YXRpb246XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJcIlxyXG4gICAgc3BhY2VfYmVmb3JlX2NvbmRpdGlvbmFsOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJcIlxyXG4gICAgZXZhbF9jb2RlOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiXCJcclxuICAgIHVuZXNjYXBlX3N0cmluZ3M6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJEZWNvZGUgcHJpbnRhYmxlIGNoYXJhY3RlcnMgZW5jb2RlZCBpbiB4Tk4gbm90YXRpb25cIlxyXG4gICAgd3JhcF9saW5lX2xlbmd0aDpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiV3JhcCBsaW5lcyBhdCBuZXh0IG9wcG9ydHVuaXR5IGFmdGVyIE4gY2hhcmFjdGVyc1wiXHJcbiAgICBlbmRfd2l0aF9uZXdsaW5lOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246IFwiRW5kIG91dHB1dCB3aXRoIG5ld2xpbmVcIlxyXG4gICAgZW5kX3dpdGhfY29tbWE6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBhIHRlcm1pbmF0aW5nIGNvbW1hIHNob3VsZCBiZSBpbnNlcnRlZCBpbnRvIFxcXHJcbiAgICAgICAgICAgICAgICAgIGFycmF5cywgb2JqZWN0IGxpdGVyYWxzLCBhbmQgZGVzdHJ1Y3R1cmVkIG9iamVjdHMuXCJcclxuICAgIGVuZF9vZl9saW5lOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcIlN5c3RlbSBEZWZhdWx0XCJcclxuICAgICAgZW51bTogW1wiQ1JMRlwiLFwiTEZcIixcIlN5c3RlbSBEZWZhdWx0XCJdXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk92ZXJyaWRlIEVPTCBmcm9tIGxpbmUtZW5kaW5nLXNlbGVjdG9yXCJcclxuXHJcbn1cclxuIl19
