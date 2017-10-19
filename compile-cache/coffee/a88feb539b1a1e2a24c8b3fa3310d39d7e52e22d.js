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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2V4cGFuZC1yZWdpb24vbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUVBLE1BQUEsRUFDRTtNQUFBLFFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQURUO1FBRUEsS0FBQSxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47VUFDQSxVQUFBLEVBQ0U7WUFBQSxPQUFBLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sUUFBTjthQURGO1lBRUEsSUFBQSxFQUNFO2NBQUEsSUFBQSxFQUFNLFNBQU47YUFIRjtXQUZGO1NBSEY7T0FERjtLQUhGO0lBY0EsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSTthQUdwQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUNqQjtRQUFBLHNCQUFBLEVBQXdCLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBdEM7UUFDQSxzQkFBQSxFQUF3QixJQUFDLENBQUEsWUFBWSxDQUFDLE1BRHRDO1FBRUEsd0NBQUEsRUFBMEMsU0FBQyxLQUFEO2lCQUFXLFFBQVEsQ0FBQyxNQUFULENBQWdCLEtBQWhCLEVBQXVCLE1BQXZCLEVBQStCLENBQUMsR0FBRCxDQUEvQjtRQUFYLENBRjFDO1FBR0Es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LE1BQVQsQ0FBZ0IsS0FBaEIsRUFBdUIsZ0JBQXZCLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELElBQW5EO1FBQVgsQ0FuQjNDO1FBb0JBLDRDQUFBLEVBQThDLFNBQUMsS0FBRDtpQkFBVyxRQUFRLENBQUMsTUFBVCxDQUFnQixLQUFoQixFQUF1QixnQkFBdkIsRUFBeUMsR0FBekMsRUFBOEMsR0FBOUMsRUFBbUQsSUFBbkQ7UUFBWCxDQXBCOUM7UUFxQkEsNENBQUEsRUFBOEMsU0FBQyxLQUFEO2lCQUFXLFFBQVEsQ0FBQyxNQUFULENBQWdCLEtBQWhCLEVBQXVCLGdCQUF2QixFQUF5QyxHQUF6QyxFQUE4QyxHQUE5QyxFQUFtRCxJQUFuRDtRQUFYLENBckI5QztRQXNCQSw2Q0FBQSxFQUErQyxTQUFDLEtBQUQ7aUJBQVcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBaEIsRUFBdUIsZ0JBQXZCLEVBQXlDLEdBQXpDLEVBQThDLEdBQTlDLEVBQW1ELElBQW5EO1FBQVgsQ0F0Qi9DO09BRGlCLENBQW5CO0lBTFEsQ0FkVjtJQTRDQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRlAsQ0E1Q1o7O0FBTEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuRXhwYW5kUmVnaW9uID0gcmVxdWlyZSAnLi9leHBhbmQtcmVnaW9uJ1xuU2VsZWN0b3IgPSByZXF1aXJlICcuL3NlbGVjdG9yJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBjb25maWc6XG4gICAgY29tbWFuZHM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgY29tbWFuZDpcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgb25jZTpcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBleHBhbmRSZWdpb24gPSBuZXcgRXhwYW5kUmVnaW9uXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpleHBhbmQnOiBAZXhwYW5kUmVnaW9uLmV4cGFuZFxuICAgICAgJ2V4cGFuZC1yZWdpb246c2hyaW5rJzogQGV4cGFuZFJlZ2lvbi5zaHJpbmtcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC13b3JkLWluY2x1ZGUtZGFzaCc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnV29yZCcsIFsnLSddKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LXdvcmQtaW5jbHVkZS1kYXNoLWFuZC1kb3QnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ1dvcmQnLCBbJy0nLCAnLiddKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LXRhZy1hdHRyaWJ1dGUnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ1dvcmQnLCBbJy0nLCAnLicsICdcIicsICc9JywgJy8nXSlcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1zY29wZSc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnU2NvcGUnKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWZvbGQnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0ZvbGQnKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWluc2lkZS1wYXJhZ3JhcGgnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZVBhcmFncmFwaCcpXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLXNpbmdsZS1xdW90ZXMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZVF1b3RlcycsICdcXCcnLCBmYWxzZSlcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1pbnNpZGUtZG91YmxlLXF1b3Rlcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlUXVvdGVzJywgJ1wiJywgZmFsc2UpXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLWJhY2stdGlja3MnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZVF1b3RlcycsICdgJywgZmFsc2UpXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLXBhcmVudGhlc2VzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVCcmFja2V0cycsICcoJywgJyknLCBmYWxzZSlcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1pbnNpZGUtY3VybHktYnJhY2tldHMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZUJyYWNrZXRzJywgJ3snLCAnfScsIGZhbHNlKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWluc2lkZS1hbmdsZS1icmFja2V0cyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlQnJhY2tldHMnLCAnPCcsICc+JywgZmFsc2UpXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLXNxdWFyZS1icmFja2V0cyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlQnJhY2tldHMnLCAnWycsICddJywgZmFsc2UpXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtaW5zaWRlLXRhZ3MnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZUJyYWNrZXRzJywgJz4nLCAnPCcsIGZhbHNlKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWFyb3VuZC1zaW5nbGUtcXVvdGVzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVRdW90ZXMnLCAnXFwnJywgdHJ1ZSlcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1hcm91bmQtZG91YmxlLXF1b3Rlcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlUXVvdGVzJywgJ1wiJywgdHJ1ZSlcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1hcm91bmQtYmFjay10aWNrcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlUXVvdGVzJywgJ2AnLCB0cnVlKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWFyb3VuZC1wYXJlbnRoZXNlcyc6IChldmVudCkgLT4gU2VsZWN0b3Iuc2VsZWN0KGV2ZW50LCAnSW5zaWRlQnJhY2tldHMnLCAnKCcsICcpJywgdHJ1ZSlcbiAgICAgICdleHBhbmQtcmVnaW9uOnNlbGVjdC1hcm91bmQtY3VybHktYnJhY2tldHMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZUJyYWNrZXRzJywgJ3snLCAnfScsIHRydWUpXG4gICAgICAnZXhwYW5kLXJlZ2lvbjpzZWxlY3QtYXJvdW5kLWFuZ2xlLWJyYWNrZXRzJzogKGV2ZW50KSAtPiBTZWxlY3Rvci5zZWxlY3QoZXZlbnQsICdJbnNpZGVCcmFja2V0cycsICc8JywgJz4nLCB0cnVlKVxuICAgICAgJ2V4cGFuZC1yZWdpb246c2VsZWN0LWFyb3VuZC1zcXVhcmUtYnJhY2tldHMnOiAoZXZlbnQpIC0+IFNlbGVjdG9yLnNlbGVjdChldmVudCwgJ0luc2lkZUJyYWNrZXRzJywgJ1snLCAnXScsIHRydWUpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4iXX0=
