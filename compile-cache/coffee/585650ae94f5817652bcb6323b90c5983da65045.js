(function() {
  module.exports = {
    name: "GLSL",
    namespace: "glsl",

    /*
    Supported Grammars
     */
    grammars: ["C", "opencl", "GLSL"],

    /*
    Supported extensions
     */
    extensions: ["vert", "frag"],
    options: {
      configPath: {
        type: 'string',
        "default": "",
        description: "Path to clang-format config file. i.e. clang-format.cfg"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvZ2xzbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxNQUZTO0lBR2YsU0FBQSxFQUFXLE1BSEk7O0FBS2Y7OztJQUdBLFFBQUEsRUFBVSxDQUNSLEdBRFEsRUFFUixRQUZRLEVBR1IsTUFIUSxDQVJLOztBQWNmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixNQURVLEVBRVYsTUFGVSxDQWpCRztJQXNCZixPQUFBLEVBQ0U7TUFBQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLFdBQUEsRUFBYSx5REFGYjtPQURGO0tBdkJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBuYW1lOiBcIkdMU0xcIlxyXG4gIG5hbWVzcGFjZTogXCJnbHNsXCJcclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXHJcbiAgIyMjXHJcbiAgZ3JhbW1hcnM6IFtcclxuICAgIFwiQ1wiXHJcbiAgICBcIm9wZW5jbFwiXHJcbiAgICBcIkdMU0xcIlxyXG4gIF1cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIGV4dGVuc2lvbnNcclxuICAjIyNcclxuICBleHRlbnNpb25zOiBbXHJcbiAgICBcInZlcnRcIlxyXG4gICAgXCJmcmFnXCJcclxuICBdXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBjb25maWdQYXRoOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcIlwiXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gY2xhbmctZm9ybWF0IGNvbmZpZyBmaWxlLiBpLmUuIGNsYW5nLWZvcm1hdC5jZmdcIlxyXG5cclxufVxyXG4iXX0=
