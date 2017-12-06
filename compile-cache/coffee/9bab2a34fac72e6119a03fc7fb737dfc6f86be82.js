(function() {
  module.exports = {
    name: "HTML",
    namespace: "html",
    scope: ['text.html'],

    /*
    Supported Grammars
     */
    grammars: ["HTML"],

    /*
    Supported extensions
     */
    extensions: ["html"],
    options: {
      indent_inner_html: {
        type: 'boolean',
        "default": false,
        description: "Indent <head> and <body> sections."
      },
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
      brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "expand", "end-expand", "none"],
        description: "[collapse|expand|end-expand|none]"
      },
      indent_scripts: {
        type: 'string',
        "default": "normal",
        "enum": ["keep", "separate", "normal"],
        description: "[keep|separate|normal]"
      },
      wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      wrap_attributes: {
        type: 'string',
        "default": "auto",
        "enum": ["auto", "force", "force-aligned", "force-expand-multiline"],
        description: "Wrap attributes to new lines [auto|force|force-aligned|force-expand-multiline]"
      },
      wrap_attributes_indent_size: {
        type: 'integer',
        "default": null,
        minimum: 0,
        description: "Indent wrapped attributes to after N characters"
      },
      preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      },
      max_preserve_newlines: {
        type: 'integer',
        "default": 10,
        description: "Number of line-breaks to be preserved in one chunk"
      },
      unformatted: {
        type: 'array',
        "default": ['a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var', 'video', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to inline) that should not be reformatted"
      },
      end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      extra_liners: {
        type: 'array',
        "default": ['head', 'body', '/html'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to [head,body,/html] that should have an extra newline before them."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvaHRtbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUVmLElBQUEsRUFBTSxNQUZTO0lBR2YsU0FBQSxFQUFXLE1BSEk7SUFJZixLQUFBLEVBQU8sQ0FBQyxXQUFELENBSlE7O0FBTWY7OztJQUdBLFFBQUEsRUFBVSxDQUNSLE1BRFEsQ0FUSzs7QUFhZjs7O0lBR0EsVUFBQSxFQUFZLENBQ1YsTUFEVSxDQWhCRztJQW9CZixPQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxXQUFBLEVBQWEsb0NBRmI7T0FERjtNQUlBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7UUFHQSxXQUFBLEVBQWEseUJBSGI7T0FMRjtNQVNBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHVCQUZiO09BVkY7TUFhQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFEVDtRQUVBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsUUFBYixFQUF1QixZQUF2QixFQUFxQyxNQUFyQyxDQUZOO1FBR0EsV0FBQSxFQUFhLG1DQUhiO09BZEY7TUFrQkEsY0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFFBRFQ7UUFFQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENB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InNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBuYW1lOiBcIkhUTUxcIlxyXG4gIG5hbWVzcGFjZTogXCJodG1sXCJcclxuICBzY29wZTogWyd0ZXh0Lmh0bWwnXVxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgR3JhbW1hcnNcclxuICAjIyNcclxuICBncmFtbWFyczogW1xyXG4gICAgXCJIVE1MXCJcclxuICBdXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBleHRlbnNpb25zXHJcbiAgIyMjXHJcbiAgZXh0ZW5zaW9uczogW1xyXG4gICAgXCJodG1sXCJcclxuICBdXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBpbmRlbnRfaW5uZXJfaHRtbDpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkluZGVudCA8aGVhZD4gYW5kIDxib2R5PiBzZWN0aW9ucy5cIlxyXG4gICAgaW5kZW50X3NpemU6XHJcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xyXG4gICAgICBkZWZhdWx0OiBudWxsXHJcbiAgICAgIG1pbmltdW06IDBcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gc2l6ZS9sZW5ndGhcIlxyXG4gICAgaW5kZW50X2NoYXI6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgZGVzY3JpcHRpb246IFwiSW5kZW50YXRpb24gY2hhcmFjdGVyXCJcclxuICAgIGJyYWNlX3N0eWxlOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcImNvbGxhcHNlXCJcclxuICAgICAgZW51bTogW1wiY29sbGFwc2VcIiwgXCJleHBhbmRcIiwgXCJlbmQtZXhwYW5kXCIsIFwibm9uZVwiXVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJbY29sbGFwc2V8ZXhwYW5kfGVuZC1leHBhbmR8bm9uZV1cIlxyXG4gICAgaW5kZW50X3NjcmlwdHM6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwibm9ybWFsXCJcclxuICAgICAgZW51bTogW1wia2VlcFwiLCBcInNlcGFyYXRlXCIsIFwibm9ybWFsXCJdXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIltrZWVwfHNlcGFyYXRlfG5vcm1hbF1cIlxyXG4gICAgd3JhcF9saW5lX2xlbmd0aDpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IDI1MFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJNYXhpbXVtIGNoYXJhY3RlcnMgcGVyIGxpbmUgKDAgZGlzYWJsZXMpXCJcclxuICAgIHdyYXBfYXR0cmlidXRlczpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogXCJhdXRvXCJcclxuICAgICAgZW51bTogW1wiYXV0b1wiLCBcImZvcmNlXCIsIFwiZm9yY2UtYWxpZ25lZFwiLCBcImZvcmNlLWV4cGFuZC1tdWx0aWxpbmVcIl1cclxuICAgICAgZGVzY3JpcHRpb246IFwiV3JhcCBhdHRyaWJ1dGVzIHRvIG5ldyBsaW5lcyBbYXV0b3xmb3JjZXxmb3JjZS1hbGlnbmVkfGZvcmNlLWV4cGFuZC1tdWx0aWxpbmVdXCJcclxuICAgIHdyYXBfYXR0cmlidXRlc19pbmRlbnRfc2l6ZTpcclxuICAgICAgdHlwZTogJ2ludGVnZXInXHJcbiAgICAgIGRlZmF1bHQ6IG51bGxcclxuICAgICAgbWluaW11bTogMFxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJJbmRlbnQgd3JhcHBlZCBhdHRyaWJ1dGVzIHRvIGFmdGVyIE4gY2hhcmFjdGVyc1wiXHJcbiAgICBwcmVzZXJ2ZV9uZXdsaW5lczpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IHRydWVcclxuICAgICAgZGVzY3JpcHRpb246IFwiUHJlc2VydmUgbGluZS1icmVha3NcIlxyXG4gICAgbWF4X3ByZXNlcnZlX25ld2xpbmVzOlxyXG4gICAgICB0eXBlOiAnaW50ZWdlcidcclxuICAgICAgZGVmYXVsdDogMTBcclxuICAgICAgZGVzY3JpcHRpb246IFwiTnVtYmVyIG9mIGxpbmUtYnJlYWtzIHRvIGJlIHByZXNlcnZlZCBpbiBvbmUgY2h1bmtcIlxyXG4gICAgdW5mb3JtYXR0ZWQ6XHJcbiAgICAgIHR5cGU6ICdhcnJheSdcclxuICAgICAgZGVmYXVsdDogW1xyXG4gICAgICAgICAgICAnYScsICdhYmJyJywgJ2FyZWEnLCAnYXVkaW8nLCAnYicsICdiZGknLCAnYmRvJywgJ2JyJywgJ2J1dHRvbicsICdjYW52YXMnLCAnY2l0ZScsXHJcbiAgICAgICAgICAgICdjb2RlJywgJ2RhdGEnLCAnZGF0YWxpc3QnLCAnZGVsJywgJ2RmbicsICdlbScsICdlbWJlZCcsICdpJywgJ2lmcmFtZScsICdpbWcnLFxyXG4gICAgICAgICAgICAnaW5wdXQnLCAnaW5zJywgJ2tiZCcsICdrZXlnZW4nLCAnbGFiZWwnLCAnbWFwJywgJ21hcmsnLCAnbWF0aCcsICdtZXRlcicsICdub3NjcmlwdCcsXHJcbiAgICAgICAgICAgICdvYmplY3QnLCAnb3V0cHV0JywgJ3Byb2dyZXNzJywgJ3EnLCAncnVieScsICdzJywgJ3NhbXAnLCAnc2VsZWN0JywgJ3NtYWxsJyxcclxuICAgICAgICAgICAgJ3NwYW4nLCAnc3Ryb25nJywgJ3N1YicsICdzdXAnLCAnc3ZnJywgJ3RlbXBsYXRlJywgJ3RleHRhcmVhJywgJ3RpbWUnLCAndScsICd2YXInLFxyXG4gICAgICAgICAgICAndmlkZW8nLCAnd2JyJywgJ3RleHQnLFxyXG4gICAgICAgICAgICAnYWNyb255bScsICdhZGRyZXNzJywgJ2JpZycsICdkdCcsICdpbnMnLCAnc21hbGwnLCAnc3RyaWtlJywgJ3R0JyxcclxuICAgICAgICAgICAgJ3ByZScsXHJcbiAgICAgICAgICAgICdoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNidcclxuICAgICAgICBdXHJcbiAgICAgIGl0ZW1zOlxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkxpc3Qgb2YgdGFncyAoZGVmYXVsdHMgdG8gaW5saW5lKSB0aGF0IHNob3VsZCBub3QgYmUgcmVmb3JtYXR0ZWRcIlxyXG4gICAgZW5kX3dpdGhfbmV3bGluZTpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkVuZCBvdXRwdXQgd2l0aCBuZXdsaW5lXCJcclxuICAgIGV4dHJhX2xpbmVyczpcclxuICAgICAgdHlwZTogJ2FycmF5J1xyXG4gICAgICBkZWZhdWx0OiBbJ2hlYWQnLCAnYm9keScsICcvaHRtbCddXHJcbiAgICAgIGl0ZW1zOlxyXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkxpc3Qgb2YgdGFncyAoZGVmYXVsdHMgdG8gW2hlYWQsYm9keSwvaHRtbF0gdGhhdCBzaG91bGQgaGF2ZSBhbiBleHRyYSBuZXdsaW5lIGJlZm9yZSB0aGVtLlwiXHJcblxyXG59XHJcbiJdfQ==
