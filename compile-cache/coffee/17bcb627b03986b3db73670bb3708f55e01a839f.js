(function() {
  module.exports = {
    general: {
      title: 'General',
      type: 'object',
      collapsed: true,
      order: -2,
      description: 'General options for Atom Beautify',
      properties: {
        _analyticsUserId: {
          title: 'Analytics User Id',
          type: 'string',
          "default": "",
          description: "Unique identifier for this user for tracking usage analytics"
        },
        loggerLevel: {
          title: "Logger Level",
          type: 'string',
          "default": 'warn',
          description: 'Set the level for the logger',
          "enum": ['verbose', 'debug', 'info', 'warn', 'error']
        },
        beautifyEntireFileOnSave: {
          title: "Beautify Entire File On Save",
          type: 'boolean',
          "default": true,
          description: "When beautifying on save, use the entire file, even if there is selected text in the editor. Important: The `beautify on save` option for the specific language must be enabled for this to be applicable. This option is not `beautify on save`."
        },
        muteUnsupportedLanguageErrors: {
          title: "Mute Unsupported Language Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show \"Unsupported Language\" errors when they occur"
        },
        muteAllErrors: {
          title: "Mute All Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show any/all errors when they occur"
        },
        showLoadingView: {
          title: "Show Loading View",
          type: 'boolean',
          "default": true,
          description: "Show loading view when beautifying"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixPQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sU0FBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsU0FBQSxFQUFXLElBRlg7TUFHQSxLQUFBLEVBQU8sQ0FBQyxDQUhSO01BSUEsV0FBQSxFQUFhLG1DQUpiO01BS0EsVUFBQSxFQUNFO1FBQUEsZ0JBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxtQkFBUDtVQUNBLElBQUEsRUFBTyxRQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxFQUZWO1VBR0EsV0FBQSxFQUFjLDhEQUhkO1NBREY7UUFLQSxXQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sY0FBUDtVQUNBLElBQUEsRUFBTyxRQURQO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBVSxNQUZWO1VBR0EsV0FBQSxFQUFjLDhCQUhkO1VBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTyxDQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLE1BQXJCLEVBQTZCLE1BQTdCLEVBQXFDLE9BQXJDLENBSlA7U0FORjtRQVdBLHdCQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sOEJBQVA7VUFDQSxJQUFBLEVBQU8sU0FEUDtVQUVBLENBQUEsT0FBQSxDQUFBLEVBQVUsSUFGVjtVQUdBLFdBQUEsRUFBYyxtUEFIZDtTQVpGO1FBZ0JBLDZCQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sa0NBQVA7VUFDQSxJQUFBLEVBQU8sU0FEUDtVQUVBLENBQUEsT0FBQSxDQUFBLEVBQVUsS0FGVjtVQUdBLFdBQUEsRUFBYyw2REFIZDtTQWpCRjtRQXFCQSxhQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8saUJBQVA7VUFDQSxJQUFBLEVBQU8sU0FEUDtVQUVBLENBQUEsT0FBQSxDQUFBLEVBQVUsS0FGVjtVQUdBLFdBQUEsRUFBYyw0Q0FIZDtTQXRCRjtRQTBCQSxlQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sbUJBQVA7VUFDQSxJQUFBLEVBQU8sU0FEUDtVQUVBLENBQUEsT0FBQSxDQUFBLEVBQVUsSUFGVjtVQUdBLFdBQUEsRUFBYyxvQ0FIZDtTQTNCRjtPQU5GO0tBRmE7O0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgZ2VuZXJhbDpcclxuICAgIHRpdGxlOiAnR2VuZXJhbCdcclxuICAgIHR5cGU6ICdvYmplY3QnXHJcbiAgICBjb2xsYXBzZWQ6IHRydWVcclxuICAgIG9yZGVyOiAtMlxyXG4gICAgZGVzY3JpcHRpb246ICdHZW5lcmFsIG9wdGlvbnMgZm9yIEF0b20gQmVhdXRpZnknXHJcbiAgICBwcm9wZXJ0aWVzOlxyXG4gICAgICBfYW5hbHl0aWNzVXNlcklkIDpcclxuICAgICAgICB0aXRsZTogJ0FuYWx5dGljcyBVc2VyIElkJ1xyXG4gICAgICAgIHR5cGUgOiAnc3RyaW5nJ1xyXG4gICAgICAgIGRlZmF1bHQgOiBcIlwiXHJcbiAgICAgICAgZGVzY3JpcHRpb24gOiBcIlVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIHVzZXIgZm9yIHRyYWNraW5nIHVzYWdlIGFuYWx5dGljc1wiXHJcbiAgICAgIGxvZ2dlckxldmVsIDpcclxuICAgICAgICB0aXRsZTogXCJMb2dnZXIgTGV2ZWxcIlxyXG4gICAgICAgIHR5cGUgOiAnc3RyaW5nJ1xyXG4gICAgICAgIGRlZmF1bHQgOiAnd2FybidcclxuICAgICAgICBkZXNjcmlwdGlvbiA6ICdTZXQgdGhlIGxldmVsIGZvciB0aGUgbG9nZ2VyJ1xyXG4gICAgICAgIGVudW0gOiBbJ3ZlcmJvc2UnLCAnZGVidWcnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ11cclxuICAgICAgYmVhdXRpZnlFbnRpcmVGaWxlT25TYXZlIDpcclxuICAgICAgICB0aXRsZTogXCJCZWF1dGlmeSBFbnRpcmUgRmlsZSBPbiBTYXZlXCJcclxuICAgICAgICB0eXBlIDogJ2Jvb2xlYW4nXHJcbiAgICAgICAgZGVmYXVsdCA6IHRydWVcclxuICAgICAgICBkZXNjcmlwdGlvbiA6IFwiV2hlbiBiZWF1dGlmeWluZyBvbiBzYXZlLCB1c2UgdGhlIGVudGlyZSBmaWxlLCBldmVuIGlmIHRoZXJlIGlzIHNlbGVjdGVkIHRleHQgaW4gdGhlIGVkaXRvci4gSW1wb3J0YW50OiBUaGUgYGJlYXV0aWZ5IG9uIHNhdmVgIG9wdGlvbiBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIG11c3QgYmUgZW5hYmxlZCBmb3IgdGhpcyB0byBiZSBhcHBsaWNhYmxlLiBUaGlzIG9wdGlvbiBpcyBub3QgYGJlYXV0aWZ5IG9uIHNhdmVgLlwiXHJcbiAgICAgIG11dGVVbnN1cHBvcnRlZExhbmd1YWdlRXJyb3JzIDpcclxuICAgICAgICB0aXRsZTogXCJNdXRlIFVuc3VwcG9ydGVkIExhbmd1YWdlIEVycm9yc1wiXHJcbiAgICAgICAgdHlwZSA6ICdib29sZWFuJ1xyXG4gICAgICAgIGRlZmF1bHQgOiBmYWxzZVxyXG4gICAgICAgIGRlc2NyaXB0aW9uIDogXCJEbyBub3Qgc2hvdyBcXFwiVW5zdXBwb3J0ZWQgTGFuZ3VhZ2VcXFwiIGVycm9ycyB3aGVuIHRoZXkgb2NjdXJcIlxyXG4gICAgICBtdXRlQWxsRXJyb3JzIDpcclxuICAgICAgICB0aXRsZTogXCJNdXRlIEFsbCBFcnJvcnNcIlxyXG4gICAgICAgIHR5cGUgOiAnYm9vbGVhbidcclxuICAgICAgICBkZWZhdWx0IDogZmFsc2VcclxuICAgICAgICBkZXNjcmlwdGlvbiA6IFwiRG8gbm90IHNob3cgYW55L2FsbCBlcnJvcnMgd2hlbiB0aGV5IG9jY3VyXCJcclxuICAgICAgc2hvd0xvYWRpbmdWaWV3IDpcclxuICAgICAgICB0aXRsZTogXCJTaG93IExvYWRpbmcgVmlld1wiXHJcbiAgICAgICAgdHlwZSA6ICdib29sZWFuJ1xyXG4gICAgICAgIGRlZmF1bHQgOiB0cnVlXHJcbiAgICAgICAgZGVzY3JpcHRpb24gOiBcIlNob3cgbG9hZGluZyB2aWV3IHdoZW4gYmVhdXRpZnlpbmdcIlxyXG4gICAgfVxyXG4iXX0=
