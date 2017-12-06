(function() {
  module.exports = {
    name: "Ruby",
    namespace: "ruby",
    scope: ['source.ruby'],

    /*
    Supported Grammars
     */
    grammars: ["Ruby", "Ruby on Rails"],

    /*
    Supported extensions
     */
    extensions: ["rb"],
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
        description: "Indentation character",
        "enum": [" ", "\t"]
      },
      rubocop_path: {
        title: "Rubocop Path",
        type: 'string',
        "default": "",
        description: "Path to the `rubocop` CLI executable"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvcnVieS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxNQUZTO0lBR2YsU0FBQSxFQUFXLE1BSEk7SUFJZixLQUFBLEVBQU8sQ0FBQyxhQUFELENBSlE7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLE1BRFEsRUFFUixlQUZRLENBVEs7O0FBY2Y7OztJQUdBLFVBQUEsRUFBWSxDQUNWLElBRFUsQ0FqQkc7SUFxQmYsT0FBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQURGO01BS0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsdUJBRmI7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsR0FBRCxFQUFNLElBQU4sQ0FITjtPQU5GO01BVUEsWUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGNBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSxzQ0FIYjtPQVhGO0tBdEJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBuYW1lOiBcIlJ1YnlcIlxyXG4gIG5hbWVzcGFjZTogXCJydWJ5XCJcclxuICBzY29wZTogWydzb3VyY2UucnVieSddXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xyXG4gICMjI1xyXG4gIGdyYW1tYXJzOiBbXHJcbiAgICBcIlJ1YnlcIlxyXG4gICAgXCJSdWJ5IG9uIFJhaWxzXCJcclxuICBdXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXHJcbiAgIyMjXHJcbiAgZXh0ZW5zaW9uczogW1xyXG4gICAgXCJyYlwiXHJcbiAgXVxyXG5cclxuICBvcHRpb25zOlxyXG4gICAgaW5kZW50X3NpemU6XHJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xyXG4gICAgICBkZWZhdWx0OiBudWxsXHJcbiAgICAgIG1pbmltdW06IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxyXG4gICAgaW5kZW50X2NoYXI6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcclxuICAgICAgZW51bTogW1wiIFwiLCBcIlxcdFwiXVxyXG4gICAgcnVib2NvcF9wYXRoOlxyXG4gICAgICB0aXRsZTogXCJSdWJvY29wIFBhdGhcIlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcIlwiXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gdGhlIGBydWJvY29wYCBDTEkgZXhlY3V0YWJsZVwiXHJcblxyXG59XHJcbiJdfQ==
