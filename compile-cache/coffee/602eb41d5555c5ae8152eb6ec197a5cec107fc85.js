(function() {
  module.exports = {
    name: "Nginx",
    namespace: "nginx",
    scope: ['source.conf'],

    /*
    Supported Grammars
     */
    grammars: ["nginx"],

    /*
    Supported extensions
     */
    extensions: ["conf"],
    defaultBeautifier: "Nginx Beautify",
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
      indent_with_tabs: {
        type: 'boolean',
        "default": null,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
      },
      dontJoinCurlyBracet: {
        title: "Don't join curly brackets",
        type: "boolean",
        "default": true,
        description: ""
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvbmdpbnguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFFZixJQUFBLEVBQU0sT0FGUztJQUdmLFNBQUEsRUFBVyxPQUhJO0lBSWYsS0FBQSxFQUFPLENBQUMsYUFBRCxDQUpROztBQU1mOzs7SUFHQSxRQUFBLEVBQVUsQ0FDUixPQURRLENBVEs7O0FBYWY7OztJQUdBLFVBQUEsRUFBWSxDQUNWLE1BRFUsQ0FoQkc7SUFvQmYsaUJBQUEsRUFBbUIsZ0JBcEJKO0lBc0JmLE9BQUEsRUFDRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtNQUtBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHVCQUZiO09BTkY7TUFTQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsa0VBRmI7T0FWRjtNQWFBLG1CQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sMkJBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtRQUdBLFdBQUEsRUFBYSxFQUhiO09BZEY7S0F2QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIG5hbWU6IFwiTmdpbnhcIlxyXG4gIG5hbWVzcGFjZTogXCJuZ2lueFwiXHJcbiAgc2NvcGU6IFsnc291cmNlLmNvbmYnXVxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgR3JhbW1hcnNcclxuICAjIyNcclxuICBncmFtbWFyczogW1xyXG4gICAgXCJuZ2lueFwiXHJcbiAgXVxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xyXG4gICMjI1xyXG4gIGV4dGVuc2lvbnM6IFtcclxuICAgIFwiY29uZlwiXHJcbiAgXVxyXG5cclxuICBkZWZhdWx0QmVhdXRpZmllcjogXCJOZ2lueCBCZWF1dGlmeVwiXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBpbmRlbnRfc2l6ZTpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgbWluaW11bTogMFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBzaXplL2xlbmd0aFwiXHJcbiAgICBpbmRlbnRfY2hhcjpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogbnVsbFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBjaGFyYWN0ZXJcIlxyXG4gICAgaW5kZW50X3dpdGhfdGFiczpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gdXNlcyB0YWJzLCBvdmVycmlkZXMgYEluZGVudCBTaXplYCBhbmQgYEluZGVudCBDaGFyYFwiXHJcbiAgICBkb250Sm9pbkN1cmx5QnJhY2V0OlxyXG4gICAgICB0aXRsZTogXCJEb24ndCBqb2luIGN1cmx5IGJyYWNrZXRzXCJcclxuICAgICAgdHlwZTogXCJib29sZWFuXCJcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJcIlxyXG59XHJcbiJdfQ==
