(function() {
  module.exports = {
    name: "Jade",
    namespace: "jade",
    fallback: ['html'],
    scope: ['text.jade'],

    /*
    Supported Grammars
     */
    grammars: ["Jade", "Pug"],

    /*
    Supported extensions
     */
    extensions: ["jade", "pug"],
    options: [
      {
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
        omit_div: {
          type: 'boolean',
          "default": false,
          description: "Whether to omit/remove the 'div' tags."
        }
      }
    ],
    defaultBeautifier: "Pug Beautify"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvamFkZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxNQUZTO0lBR2YsU0FBQSxFQUFXLE1BSEk7SUFJZixRQUFBLEVBQVUsQ0FBQyxNQUFELENBSks7SUFLZixLQUFBLEVBQU8sQ0FBQyxXQUFELENBTFE7O0FBT2Y7OztJQUdBLFFBQUEsRUFBVSxDQUNSLE1BRFEsRUFDQSxLQURBLENBVks7O0FBY2Y7OztJQUdBLFVBQUEsRUFBWSxDQUNWLE1BRFUsRUFDRixLQURFLENBakJHO0lBcUJmLE9BQUEsRUFBUztNQUNQO1FBQUEsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFNBQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7VUFFQSxPQUFBLEVBQVMsQ0FGVDtVQUdBLFdBQUEsRUFBYSx5QkFIYjtTQURGO1FBS0EsV0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47VUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7VUFFQSxXQUFBLEVBQWEsdUJBRmI7U0FORjtRQVNBLFFBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxTQUFOO1VBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO1VBRUEsV0FBQSxFQUFhLHdDQUZiO1NBVkY7T0FETztLQXJCTTtJQXFDZixpQkFBQSxFQUFtQixjQXJDSjs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgbmFtZTogXCJKYWRlXCJcclxuICBuYW1lc3BhY2U6IFwiamFkZVwiXHJcbiAgZmFsbGJhY2s6IFsnaHRtbCddXHJcbiAgc2NvcGU6IFsndGV4dC5qYWRlJ11cclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIEdyYW1tYXJzXHJcbiAgIyMjXHJcbiAgZ3JhbW1hcnM6IFtcclxuICAgIFwiSmFkZVwiLCBcIlB1Z1wiXHJcbiAgXVxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xyXG4gICMjI1xyXG4gIGV4dGVuc2lvbnM6IFtcclxuICAgIFwiamFkZVwiLCBcInB1Z1wiXHJcbiAgXVxyXG5cclxuICBvcHRpb25zOiBbXHJcbiAgICBpbmRlbnRfc2l6ZTpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgbWluaW11bTogMFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBzaXplL2xlbmd0aFwiXHJcbiAgICBpbmRlbnRfY2hhcjpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogbnVsbFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBjaGFyYWN0ZXJcIlxyXG4gICAgb21pdF9kaXY6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJXaGV0aGVyIHRvIG9taXQvcmVtb3ZlIHRoZSAnZGl2JyB0YWdzLlwiXHJcbiAgXVxyXG5cclxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJQdWcgQmVhdXRpZnlcIlxyXG5cclxufVxyXG4iXX0=
