(function() {
  module.exports = {
    name: "Coldfusion",
    description: "Coldfusion Markup; cfscript is also handled via the prettydiff javascript parser",
    namespace: "cfml",
    scope: ['text.html'],

    /*
    Supported Grammars
     */
    grammars: ["html"],

    /*
    Supported extensions
     */
    extensions: ["cfm", "cfml", "cfc"],
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
        minimum: 0,
        description: "Indentation character"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvY29sZGZ1c2lvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxZQUZTO0lBR2YsV0FBQSxFQUFhLGtGQUhFO0lBSWYsU0FBQSxFQUFXLE1BSkk7SUFLZixLQUFBLEVBQU8sQ0FBQyxXQUFELENBTFE7O0FBT2Y7OztJQUdBLFFBQUEsRUFBVSxDQUNSLE1BRFEsQ0FWSzs7QUFjZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsS0FEVSxFQUVWLE1BRlUsRUFHVixLQUhVLENBakJHO0lBdUJmLE9BQUEsRUFDRTtNQUFBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FERjtNQUtBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEsdUJBSGI7T0FORjtNQVVBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FEVDtRQUVBLFdBQUEsRUFBYSwwQ0FGYjtPQVhGO01BY0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHNCQUZiO09BZkY7S0F4QmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIG5hbWU6IFwiQ29sZGZ1c2lvblwiXHJcbiAgZGVzY3JpcHRpb246IFwiQ29sZGZ1c2lvbiBNYXJrdXA7IGNmc2NyaXB0IGlzIGFsc28gaGFuZGxlZCB2aWEgdGhlIHByZXR0eWRpZmYgamF2YXNjcmlwdCBwYXJzZXJcIlxyXG4gIG5hbWVzcGFjZTogXCJjZm1sXCJcclxuICBzY29wZTogWyd0ZXh0Lmh0bWwnXVxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgR3JhbW1hcnNcclxuICAjIyNcclxuICBncmFtbWFyczogW1xyXG4gICAgXCJodG1sXCJcclxuICBdXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXHJcbiAgIyMjXHJcbiAgZXh0ZW5zaW9uczogW1xyXG4gICAgXCJjZm1cIlxyXG4gICAgXCJjZm1sXCJcclxuICAgIFwiY2ZjXCJcclxuICBdXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBpbmRlbnRfc2l6ZTpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgbWluaW11bTogMFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnRhdGlvbiBzaXplL2xlbmd0aFwiXHJcbiAgICBpbmRlbnRfY2hhcjpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogbnVsbFxyXG4gICAgICBtaW5pbXVtOiAwXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudGF0aW9uIGNoYXJhY3RlclwiXHJcbiAgICB3cmFwX2xpbmVfbGVuZ3RoOlxyXG4gICAgICB0eXBlOiAnaW50ZWdlcidcclxuICAgICAgZGVmYXVsdDogMjUwXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk1heGltdW0gY2hhcmFjdGVycyBwZXIgbGluZSAoMCBkaXNhYmxlcylcIlxyXG4gICAgcHJlc2VydmVfbmV3bGluZXM6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiB0cnVlXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlByZXNlcnZlIGxpbmUtYnJlYWtzXCJcclxuXHJcbn1cclxuIl19
