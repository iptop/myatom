(function() {
  var CompositeDisposable, ExpandRegion, Selector;

  CompositeDisposable = require('atom').CompositeDisposable;

  ExpandRegion = require('./expand-region');

  Selector = require('./selector');

  module.exports = {
    subscriptions: null,
    config: {
      commands: {
        type: 'array',
        "default": [],
        items: {
          type: 'object',
          properties: {
            command: {
              type: 'string'
            },
            once: {
              type: 'boolean'
            }
          }
        }
      }
    },
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.expandRegion = new ExpandRegion;
      return this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'expand-region:expand': this.expandRegion.expand,
        'expand-region:shrink': this.expandRegion.shrink,
        'expand-region:select-word-include-dash': function(event) {
          return Selector.select(event, 'Word', ['-']);
        },
        'expand-region:select-word-include-dash-and-dot': function(event) {
          return Selector.select(event, 'Word', ['-', '.']);
        },
        'expand-region:select-tag-attribute': function(event) {
          return Selector.select(event, 'Word', ['-', '.', '"', '=', '/']);
        },
        'expand-region:select-scope': function(event) {
          return Selector.select(event, 'Scope');
        },
        'expand-region:select-fold': function(event) {
          return Selector.select(event, 'Fold');
        },
        'expand-region:select-inside-paragraph': function(event) {
          return Selector.select(event, 'InsideParagraph');
        },
        'expand-region:select-inside-single-quotes': function(event) {
          return Selector.select(event, 'InsideQuotes', '\'', false);
        },
        'expand-region:select-inside-double-quotes': function(event) {
          return Selector.select(event, 'InsideQuotes', '"', false);
        },
        'expand-region:select-inside-back-ticks': function(event) {
          return Selector.select(event, 'InsideQuotes', '`', false);
        },
        'expand-region:select-inside-parentheses': function(event) {
          return Selector.select(event, 'InsideBrackets', '(', ')', false);
        },
        'expand-region:select-inside-curly-brackets': function(event) {
          return Selector.select(event, 'InsideBrackets', '{', '}', false);
        },
        'expand-region:select-inside-angle-brackets': function(event) {
          return Selector.select(event, 'InsideBrackets', '<', '>', false);
        },
        'expand-region:select-inside-square-brackets': function(event) {
          return Selector.select(event, 'InsideBrackets', '[', ']', false);
        },
        'expand-region:select-inside-tags': function(event) {
          return Selector.select(event, 'InsideBrackets', '>', '<', false);
        },
        'expand-region:select-around-single-quotes': function(event) {
          return Selector.select(event, 'InsideQuotes', '\'', true);
        },
        'expand-region:select-around-double-quotes': function(event) {
          return Selector.select(event, 'InsideQuotes', '"', true);
        },
        'expand-region:select-around-back-ticks': function(event) {
          return Selector.select(event, 'InsideQuotes', '`', true);
        },
        'expand-region:select-around-parentheses': function(event) {
          return Selector.select(event, 'InsideBrackets', '(', ')', true);
        },
        'expand-region:select-around-curly-brackets': function(event) {
          return Selector.select(event, 'InsideBrackets', '{', '}', true);
        },
        'expand-region:select-around-angle-brackets': function(event) {
          return Selector.select(event, 'InsideBrackets', '<', '>', true);
        },
        'expand-region:select-around-square-brackets': function(event) {
          return Selector.select(event, 'InsideBrackets', '[', ']', true);
        }
      }));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9leHBhbmQtcmVnaW9uL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsYUFBQSxFQUFlLElBQWY7SUFFQSxNQUFBLEVBQ0U7TUFBQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtRQUVBLEtBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxRQUFOO1VBQ0EsVUFBQSxFQUNFO1lBQUEsT0FBQSxFQUNFO2NBQUEsSUFBQSxFQUFNLFFBQU47YUFERjtZQUVBLElBQUEsRUFDRTtjQUFBLElBQUEsRUFBTSxTQUFOO2FBSEY7V0FGRjtTQUhGO09BREY7S0FIRjtJQWNBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUk7YUFHcEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFDakI7UUFBQSxzQkFBQSxFQUF3QixJQUFDLENBQUEsWUFBWSxDQUFDLE1BQXRDO1FBQ0Esc0JBQUEsRUFBd0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUR0QztRQUVBLHdDQUFBLEVBQTBDLFNBQUMsS0FBRDtpQkFBVyxRQUFRLENBQUMsTUFBVCxDQUFnQixLQUFoQixFQUF1QixNQUF2QixFQUErQixDQUFDLEdBQUQsQ0FBL0I7UUFBWCxDQUYxQztRQUdBLGdEQUFBLEVB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QWdCLEtBQWhCLEVBQXVCLGdCQUF2QixFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxJQUFuRDtRQUFYLENBbkIzQztRQW9CQSw0Q0FBQSxFQUE4QyxTQUFDLEtBQUQ7aUJBQVcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBaEIsRUFBdUIsZ0JBQXZCLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELElBQW5EO1FBQVgsQ0FwQjlDO1FBcUJBLDRDQUFBLEVBQThDLFNBQUMsS0FBRDtpQkFBVyxRQUFRLENBQUMsTUFBVCxDQUFnQixLQUFoQixFQUF1QixnQkFBdkIsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsSUFBbkQ7UUFBWCxDQXJCOUM7UUFzQkEsNkNBQUEsRUFBK0MsU0FBQyxLQUFEO2lCQUFXLFFBQVEsQ0FBQyxNQUFULENBQWdCLEtBQWhCLEVBQXVCLGdCQUF2QixFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxJQUFuRDtRQUFYLENBdEIvQztPQURpQixDQUFuQjtJQUxRLENBZFY7SUE0Q0EsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZQLENBNUNaOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcclxuRXhwYW5kUmVnaW9uID0gcmVxdWlyZSAnLi9leHBhbmQtcmVnaW9uJ1xyXG5TZWxlY3RvciA9IHJlcXVpcmUgJy4vc2VsZWN0b3InXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxyXG5cclxuICBjb25maWc6XHJcbiAgICBjb21tYW5kczpcclxuICAgICAgdHlwZTogJ2FycmF5J1xyXG4gICAgICBkZWZhdWx0OiBbXVxyXG4gICAgICBpdGVtczpcclxuICAgICAgICB0eXBlOiAnb2JqZWN0J1xyXG4gICAgICAgIHByb3BlcnRpZXM6XHJcbiAgICAgICAgICBjb21tYW5kOlxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICAgICAgb25jZTpcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcblxyXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XHJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXHJcbiAgICBAZXhwYW5kUmVnaW9uID0gbmV3IEV4cGFuZFJlZ2lvblxyXG5cclxuICAgICMgUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XHJcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpleHBhbmQnOiBAZXhwYW5kUmVnaW9uLmV4cGFuZFxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzaHJpbmsnOiBAZXhwYW5kUmVnaW9uLnNocmlua1xyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3Qtd29yZC1pbmNsdWRlLWRhc2gnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ1dvcmQnLCBbJy0nXSlcclxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LXdvcmQtaW5jbHVkZS1kYXNoLWFuZC1kb3QnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ1dvcmQnLCBbJy0nLCAnLiddKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtdGFnLWF0dHJpYnV0ZSc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnV29yZCcsIFsnLScsICcuJywgJ1wiJywgJz0nLCAnLyddKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3Qtc2NvcGUnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ1Njb3BlJylcclxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWZvbGQnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0ZvbGQnKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLXBhcmFncmFwaCc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlUGFyYWdyYXBoJylcclxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWluc2lkZS1zaW5nbGUtcXVvdGVzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVRdW90ZXMnLCAnXFwnJywgZmFsc2UpXHJcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1pbnNpZGUtZG91YmxlLXF1b3Rlcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlUXVvdGVzJywgJ1wiJywgZmFsc2UpXHJcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1pbnNpZGUtYmFjay10aWNrcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlUXVvdGVzJywgJ2AnLCBmYWxzZSlcclxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWluc2lkZS1wYXJlbnRoZXNlcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlQnJhY2tldHMnLCAnKCcsICcpJywgZmFsc2UpXHJcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1pbnNpZGUtY3VybHktYnJhY2tldHMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZUJyYWNrZXRzJywgJ3snLCAnfScsIGZhbHNlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLWFuZ2xlLWJyYWNrZXRzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVCcmFja2V0cycsICc8JywgJz4nLCBmYWxzZSlcclxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWluc2lkZS1zcXVhcmUtYnJhY2tldHMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZUJyYWNrZXRzJywgJ1snLCAnXScsIGZhbHNlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLXRhZ3MnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZUJyYWNrZXRzJywgJz4nLCAnPCcsIGZhbHNlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtYXJvdW5kLXNpbmdsZS1xdW90ZXMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZVF1b3RlcycsICdcXCcnLCB0cnVlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtYXJvdW5kLWRvdWJsZS1xdW90ZXMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZVF1b3RlcycsICdcIicsIHRydWUpXHJcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1hcm91bmQtYmFjay10aWNrcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlUXVvdGVzJywgJ2AnLCB0cnVlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtYXJvdW5kLXBhcmVudGhlc2VzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVCcmFja2V0cycsICcoJywgJyknLCB0cnVlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtYXJvdW5kLWN1cmx5LWJyYWNrZXRzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVCcmFja2V0cycsICd7JywgJ30nLCB0cnVlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtYXJvdW5kLWFuZ2xlLWJyYWNrZXRzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVCcmFja2V0cycsICc8JywgJz4nLCB0cnVlKVxyXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtYXJvdW5kLXNxdWFyZS1icmFja2V0cyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlQnJhY2tldHMnLCAnWycsICddJywgdHJ1ZSlcclxuXHJcbiAgZGVhY3RpdmF0ZTogLT5cclxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcclxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxyXG4iXX0=
