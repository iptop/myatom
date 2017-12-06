(function() {
  module.exports = {
    name: "SQL",
    namespace: "sql",
    scope: ['source.sql'],

    /*
    Supported Grammars
     */
    grammars: ["SQL (Rails)", "SQL"],

    /*
    Supported extensions
     */
    extensions: ["sql"],
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      },
      keywords: {
        type: 'string',
        "default": "upper",
        description: "Change case of keywords",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      },
      identifiers: {
        type: 'string',
        "default": "unchanged",
        description: "Change case of identifiers",
        "enum": ["unchanged", "lower", "upper", "capitalize"]
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvc3FsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLEtBRlM7SUFHZixTQUFBLEVBQVcsS0FISTtJQUlmLEtBQUEsRUFBTyxDQUFDLFlBQUQsQ0FKUTs7QUFNZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsYUFEUSxFQUVSLEtBRlEsQ0FUSzs7QUFjZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsS0FEVSxDQWpCRztJQXFCZixPQUFBLEVBRUU7TUFBQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHlCQUhiO09BREY7TUFLQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FEVDtRQUVBLFdBQUEsRUFBYSx5QkFGYjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxXQUFELEVBQWEsT0FBYixFQUFxQixPQUFyQixFQUE2QixZQUE3QixDQUhOO09BTkY7TUFVQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsV0FEVDtRQUVBLFdBQUEsRUFBYSw0QkFGYjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxXQUFELEVBQWEsT0FBYixFQUFxQixPQUFyQixFQUE2QixZQUE3QixDQUhOO09BWEY7S0F2QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIG5hbWU6IFwiU1FMXCJcclxuICBuYW1lc3BhY2U6IFwic3FsXCJcclxuICBzY29wZTogWydzb3VyY2Uuc3FsJ11cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXHJcbiAgIyMjXHJcbiAgZ3JhbW1hcnM6IFtcclxuICAgIFwiU1FMIChSYWlscylcIlxyXG4gICAgXCJTUUxcIlxyXG4gIF1cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcclxuICAjIyNcclxuICBleHRlbnNpb25zOiBbXHJcbiAgICBcInNxbFwiXHJcbiAgXVxyXG5cclxuICBvcHRpb25zOlxyXG4gICAgIyBTUUxcclxuICAgIGluZGVudF9zaXplOlxyXG4gICAgICB0eXBlOiAnaW50ZWdlcidcclxuICAgICAgZGVmYXVsdDogbnVsbFxyXG4gICAgICBtaW5pbXVtOiAwXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcclxuICAgIGtleXdvcmRzOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcInVwcGVyXCJcclxuICAgICAgZGVzY3JpcHRpb246IFwiQ2hhbmdlIGNhc2Ugb2Yga2V5d29yZHNcIlxyXG4gICAgICBlbnVtOiBbXCJ1bmNoYW5nZWRcIixcImxvd2VyXCIsXCJ1cHBlclwiLFwiY2FwaXRhbGl6ZVwiXVxyXG4gICAgaWRlbnRpZmllcnM6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwidW5jaGFuZ2VkXCJcclxuICAgICAgZGVzY3JpcHRpb246IFwiQ2hhbmdlIGNhc2Ugb2YgaWRlbnRpZmllcnNcIlxyXG4gICAgICBlbnVtOiBbXCJ1bmNoYW5nZWRcIixcImxvd2VyXCIsXCJ1cHBlclwiLFwiY2FwaXRhbGl6ZVwiXVxyXG5cclxufVxyXG4iXX0=
