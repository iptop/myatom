(function() {
  module.exports = {
    name: "Bash",
    namespace: "bash",
    scope: ['source.sh', 'source.bash'],

    /*
    Supported Grammars
     */
    grammars: ["Shell Script"],
    defaultBeautifier: "beautysh",

    /*
    Supported extensions
     */
    extensions: ["bash", "sh"],
    options: {
      indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indentation size/length"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvYmFzaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxNQUZTO0lBR2YsU0FBQSxFQUFXLE1BSEk7SUFJZixLQUFBLEVBQU8sQ0FBQyxXQUFELEVBQWMsYUFBZCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixjQURRLENBVEs7SUFhZixpQkFBQSxFQUFtQixVQWJKOztBQWVmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixNQURVLEVBRVYsSUFGVSxDQWxCRztJQXVCZixPQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLE9BQUEsRUFBUyxDQUZUO1FBR0EsV0FBQSxFQUFhLHlCQUhiO09BREY7S0F4QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIG5hbWU6IFwiQmFzaFwiXHJcbiAgbmFtZXNwYWNlOiBcImJhc2hcIlxyXG4gIHNjb3BlOiBbJ3NvdXJjZS5zaCcsICdzb3VyY2UuYmFzaCddXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xyXG4gICMjI1xyXG4gIGdyYW1tYXJzOiBbXHJcbiAgICBcIlNoZWxsIFNjcmlwdFwiXHJcbiAgXVxyXG5cclxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJiZWF1dHlzaFwiXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXHJcbiAgIyMjXHJcbiAgZXh0ZW5zaW9uczogW1xyXG4gICAgXCJiYXNoXCJcclxuICAgIFwic2hcIlxyXG4gIF1cclxuXHJcbiAgb3B0aW9uczpcclxuICAgIGluZGVudF9zaXplOlxyXG4gICAgICB0eXBlOiAnaW50ZWdlcidcclxuICAgICAgZGVmYXVsdDogbnVsbFxyXG4gICAgICBtaW5pbXVtOiAwXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIHNpemUvbGVuZ3RoXCJcclxuXHJcbn1cclxuIl19
