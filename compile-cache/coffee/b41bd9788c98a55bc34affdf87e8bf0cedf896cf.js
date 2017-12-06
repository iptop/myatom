(function() {
  module.exports = {
    name: "Marko",
    namespace: "marko",
    fallback: ['html'],
    scope: ['text.marko'],

    /*
    Supported Grammars
     */
    grammars: ["Marko"],

    /*
    Supported extensions
     */
    extensions: ["marko"],
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
      syntax: {
        type: 'string',
        "default": "html",
        "enum": ["html", "concise"],
        description: "[html|concise]"
      }
    },
    defaultBeautifier: "Marko Beautifier"
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbWFya28uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sT0FGUztJQUdmLFNBQUEsRUFBVyxPQUhJO0lBSWYsUUFBQSxFQUFVLENBQUMsTUFBRCxDQUpLO0lBS2YsS0FBQSxFQUFPLENBQUMsWUFBRCxDQUxROztBQU9mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixPQURRLENBVks7O0FBY2Y7OztJQUdBLFVBQUEsRUFBWSxDQUNWLE9BRFUsQ0FqQkc7SUFxQmYsT0FBQSxFQUNFO01BQUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxPQUFBLEVBQVMsQ0FGVDtRQUdBLFdBQUEsRUFBYSx5QkFIYjtPQURGO01BS0EsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsdUJBRmI7T0FORjtNQVNBLE1BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO1FBRUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxTQUFULENBRk47UUFHQSxXQUFBLEVBQWEsZ0JBSGI7T0FWRjtLQXRCYTtJQXFDZixpQkFBQSxFQUFtQixrQkFyQ0o7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIG5hbWU6IFwiTWFya29cIlxyXG4gIG5hbWVzcGFjZTogXCJtYXJrb1wiXHJcbiAgZmFsbGJhY2s6IFsnaHRtbCddXHJcbiAgc2NvcGU6IFsndGV4dC5tYXJrbyddXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xyXG4gICMjI1xyXG4gIGdyYW1tYXJzOiBbXHJcbiAgICBcIk1hcmtvXCJcclxuICBdXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXHJcbiAgIyMjXHJcbiAgZXh0ZW5zaW9uczogW1xyXG4gICAgXCJtYXJrb1wiXHJcbiAgXVxyXG5cclxuICBvcHRpb25zOlxyXG4gICAgaW5kZW50X3NpemU6XHJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xyXG4gICAgICBkZWZhdWx0OiBudWxsXHJcbiAgICAgIG1pbmltdW06IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxyXG4gICAgaW5kZW50X2NoYXI6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcclxuICAgIHN5bnRheDpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogXCJodG1sXCJcclxuICAgICAgZW51bTogW1wiaHRtbFwiLCBcImNvbmNpc2VcIl1cclxuICAgICAgZGVzY3JpcHRpb246IFwiW2h0bWx8Y29uY2lzZV1cIlxyXG5cclxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJNYXJrbyBCZWF1dGlmaWVyXCJcclxuXHJcbn1cclxuIl19
