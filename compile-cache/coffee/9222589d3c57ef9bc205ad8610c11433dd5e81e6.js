(function() {
  module.exports = {
    name: "Lua",
    namespace: "lua",

    /*
    Supported Grammars
     */
    grammars: ["Lua"],

    /*
    Supported extensions
     */
    extensions: ['lua'],
    defaultBeautifier: "Lua beautifier",
    options: {
      end_of_line: {
        type: 'string',
        "default": "System Default",
        "enum": ["CRLF", "LF", "System Default"],
        description: "Override EOL from line-ending-selector"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbHVhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLEtBRlM7SUFHZixTQUFBLEVBQVcsS0FISTs7QUFLZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsS0FEUSxDQVJLOztBQVlmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLENBZkc7SUFtQmYsaUJBQUEsRUFBbUIsZ0JBbkJKO0lBcUJmLE9BQUEsRUFDRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxnQkFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVEsSUFBUixFQUFhLGdCQUFiLENBRk47UUFHQSxXQUFBLEVBQWEsd0NBSGI7T0FERjtLQXRCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgbmFtZTogXCJMdWFcIlxyXG4gIG5hbWVzcGFjZTogXCJsdWFcIlxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgR3JhbW1hcnNcclxuICAjIyNcclxuICBncmFtbWFyczogW1xyXG4gICAgXCJMdWFcIlxyXG4gIF1cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcclxuICAjIyNcclxuICBleHRlbnNpb25zOiBbXHJcbiAgICAnbHVhJ1xyXG4gIF1cclxuXHJcbiAgZGVmYXVsdEJlYXV0aWZpZXI6IFwiTHVhIGJlYXV0aWZpZXJcIlxyXG5cclxuICBvcHRpb25zOlxyXG4gICAgZW5kX29mX2xpbmU6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwiU3lzdGVtIERlZmF1bHRcIlxyXG4gICAgICBlbnVtOiBbXCJDUkxGXCIsXCJMRlwiLFwiU3lzdGVtIERlZmF1bHRcIl1cclxuICAgICAgZGVzY3JpcHRpb246IFwiT3ZlcnJpZGUgRU9MIGZyb20gbGluZS1lbmRpbmctc2VsZWN0b3JcIlxyXG59XHJcbiJdfQ==
