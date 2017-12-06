(function() {
  module.exports = {
    name: "Markdown",
    namespace: "markdown",

    /*
    Supported Grammars
     */
    grammars: ["GitHub Markdown"],

    /*
    Supported extensions
     */
    extensions: ["markdown", "md"],
    defaultBeautifier: "Tidy Markdown",
    options: {
      gfm: {
        type: 'boolean',
        "default": true,
        description: 'GitHub Flavoured Markdown'
      },
      yaml: {
        type: 'boolean',
        "default": true,
        description: 'Enables raw YAML front matter to be detected (thus ignoring markdown-like syntax).'
      },
      commonmark: {
        type: 'boolean',
        "default": false,
        description: 'Allows and disallows several constructs.'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbWFya2Rvd24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sVUFGUztJQUdmLFNBQUEsRUFBVyxVQUhJOztBQUtmOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixpQkFEUSxDQVJLOztBQVlmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixVQURVLEVBRVYsSUFGVSxDQWZHO0lBb0JmLGlCQUFBLEVBQW1CLGVBcEJKO0lBc0JmLE9BQUEsRUFDRTtNQUFBLEdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLDJCQUZiO09BREY7TUFJQSxJQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLFdBQUEsRUFBYSxvRkFGYjtPQUxGO01BUUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsMENBRmI7T0FURjtLQXZCYTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgbmFtZTogXCJNYXJrZG93blwiXHJcbiAgbmFtZXNwYWNlOiBcIm1hcmtkb3duXCJcclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXHJcbiAgIyMjXHJcbiAgZ3JhbW1hcnM6IFtcclxuICAgIFwiR2l0SHViIE1hcmtkb3duXCJcclxuICBdXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXHJcbiAgIyMjXHJcbiAgZXh0ZW5zaW9uczogW1xyXG4gICAgXCJtYXJrZG93blwiXHJcbiAgICBcIm1kXCJcclxuICBdXHJcblxyXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIlRpZHkgTWFya2Rvd25cIlxyXG5cclxuICBvcHRpb25zOlxyXG4gICAgZ2ZtOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0dpdEh1YiBGbGF2b3VyZWQgTWFya2Rvd24nXHJcbiAgICB5YW1sOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZXMgcmF3IFlBTUwgZnJvbnQgbWF0dGVyIHRvIGJlIGRldGVjdGVkICh0aHVzIGlnbm9yaW5nIG1hcmtkb3duLWxpa2Ugc3ludGF4KS4nXHJcbiAgICBjb21tb25tYXJrOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogZmFsc2VcclxuICAgICAgZGVzY3JpcHRpb246ICdBbGxvd3MgYW5kIGRpc2FsbG93cyBzZXZlcmFsIGNvbnN0cnVjdHMuJ1xyXG59XHJcbiJdfQ==
