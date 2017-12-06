(function() {
  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: '.source.python .comment, .source.python .string, .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name',
    constructed: false,
    constructor: function() {
      this.provider = require('./provider');
      this.log = require('./log');
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.constructed = true;
      return this.log.debug('Loading python hyper-click provider...');
    },
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (!this.constructed) {
        this.constructor();
      }
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName.indexOf('source.python') > -1) {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = this.Selector.create(this.disableForSelector);
        if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          this.log.debug(range.start, this._getScopes(editor, range.start));
          this.log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = (function(_this) {
          return function() {
            return _this.provider.load().goToDefinition(editor, bufferPosition);
          };
        })(this);
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9oeXBlcmNsaWNrLXByb3ZpZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsQ0FBVjtJQUNBLFlBQUEsRUFBYyxxQkFEZDtJQUVBLGtCQUFBLEVBQW9CLDRRQUZwQjtJQUdBLFdBQUEsRUFBYSxLQUhiO0lBS0EsV0FBQSxFQUFhLFNBQUE7TUFDWCxJQUFDLENBQUEsUUFBRCxHQUFZLE9BQUEsQ0FBUSxZQUFSO01BQ1osSUFBQyxDQUFBLEdBQUQsR0FBTyxPQUFBLENBQVEsT0FBUjtNQUNOLElBQUMsQ0FBQSwyQkFBNEIsT0FBQSxDQUFRLGlCQUFSLEVBQTVCO01BQ0QsSUFBQyxDQUFBLFdBQVksT0FBQSxDQUFRLGNBQVIsRUFBWjtNQUNGLElBQUMsQ0FBQSxXQUFELEdBQWU7YUFDZixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBVyx3Q0FBWDtJQU5XLENBTGI7SUFhQSxVQUFBLEVBQVksU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNWLGFBQU8sTUFBTSxDQUFDLGdDQUFQLENBQXdDLEtBQXhDLENBQThDLENBQUM7SUFENUMsQ0FiWjtJQWdCQSxvQkFBQSxFQUFzQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsS0FBZjtBQUNwQixVQUFBO01BQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxXQUFSO1FBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQURGOztNQUVBLElBQUcsSUFBQSxLQUFTLEdBQVQsSUFBQSxJQUFBLEtBQWMsR0FBakI7QUFDRSxlQURGOztNQUVBLElBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQVMsQ0FBQyxPQUE5QixDQUFzQyxlQUF0QyxDQUFBLEdBQXlELENBQUMsQ0FBN0Q7UUFDRSxjQUFBLEdBQWlCLEtBQUssQ0FBQztRQUN2QixlQUFBLEdBQWtCLE1BQU0sQ0FBQyxnQ0FBUCxDQUNoQixjQURnQjtRQUVsQixVQUFBLEdBQWEsZUFBZSxDQUFDLGFBQWhCLENBQUE7UUFDYixrQkFBQSxHQUFxQixJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLGtCQUFsQjtRQUNyQixJQUFHLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixrQkFBMUIsRUFBOEMsVUFBOUMsQ0FBSDtBQUNFLGlCQURGOztRQUdBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFIO1VBQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLEtBQWpCLEVBQXdCLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixLQUFLLENBQUMsS0FBMUIsQ0FBeEI7VUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsR0FBakIsRUFBc0IsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaLEVBQW9CLEtBQUssQ0FBQyxHQUExQixDQUF0QixFQUZGOztRQUdBLFFBQUEsR0FBVyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNULEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBLENBQWdCLENBQUMsY0FBakIsQ0FBZ0MsTUFBaEMsRUFBd0MsY0FBeEM7VUFEUztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7QUFFWCxlQUFPO1VBQUMsT0FBQSxLQUFEO1VBQVEsVUFBQSxRQUFSO1VBZFQ7O0lBTG9CLENBaEJ0Qjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cclxuICBwcmlvcml0eTogMVxyXG4gIHByb3ZpZGVyTmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXHJcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24gLmNvbW1lbnQsIC5zb3VyY2UucHl0aG9uIC5zdHJpbmcsIC5zb3VyY2UucHl0aG9uIC5udW1lcmljLCAuc291cmNlLnB5dGhvbiAuaW50ZWdlciwgLnNvdXJjZS5weXRob24gLmRlY2ltYWwsIC5zb3VyY2UucHl0aG9uIC5wdW5jdHVhdGlvbiwgLnNvdXJjZS5weXRob24gLmtleXdvcmQsIC5zb3VyY2UucHl0aG9uIC5zdG9yYWdlLCAuc291cmNlLnB5dGhvbiAudmFyaWFibGUucGFyYW1ldGVyLCAuc291cmNlLnB5dGhvbiAuZW50aXR5Lm5hbWUnXHJcbiAgY29uc3RydWN0ZWQ6IGZhbHNlXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQHByb3ZpZGVyID0gcmVxdWlyZSAnLi9wcm92aWRlcidcclxuICAgIEBsb2cgPSByZXF1aXJlICcuL2xvZydcclxuICAgIHtAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWlufSA9IHJlcXVpcmUgJy4vc2NvcGUtaGVscGVycydcclxuICAgIHtAU2VsZWN0b3J9ID0gcmVxdWlyZSAnc2VsZWN0b3Ita2l0J1xyXG4gICAgQGNvbnN0cnVjdGVkID0gdHJ1ZVxyXG4gICAgQGxvZy5kZWJ1ZyAnTG9hZGluZyBweXRob24gaHlwZXItY2xpY2sgcHJvdmlkZXIuLi4nXHJcblxyXG4gIF9nZXRTY29wZXM6IChlZGl0b3IsIHJhbmdlKSAtPlxyXG4gICAgcmV0dXJuIGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihyYW5nZSkuc2NvcGVzXHJcblxyXG4gIGdldFN1Z2dlc3Rpb25Gb3JXb3JkOiAoZWRpdG9yLCB0ZXh0LCByYW5nZSkgLT5cclxuICAgIGlmIG5vdCBAY29uc3RydWN0ZWRcclxuICAgICAgQGNvbnN0cnVjdG9yKClcclxuICAgIGlmIHRleHQgaW4gWycuJywgJzonXVxyXG4gICAgICByZXR1cm5cclxuICAgIGlmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLmluZGV4T2YoJ3NvdXJjZS5weXRob24nKSA+IC0xXHJcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gcmFuZ2Uuc3RhcnRcclxuICAgICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFxyXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uKVxyXG4gICAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxyXG4gICAgICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBAU2VsZWN0b3IuY3JlYXRlKEBkaXNhYmxlRm9yU2VsZWN0b3IpXHJcbiAgICAgIGlmIEBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxyXG4gICAgICAgIHJldHVyblxyXG5cclxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dERlYnVnJylcclxuICAgICAgICBAbG9nLmRlYnVnIHJhbmdlLnN0YXJ0LCBAX2dldFNjb3BlcyhlZGl0b3IsIHJhbmdlLnN0YXJ0KVxyXG4gICAgICAgIEBsb2cuZGVidWcgcmFuZ2UuZW5kLCBAX2dldFNjb3BlcyhlZGl0b3IsIHJhbmdlLmVuZClcclxuICAgICAgY2FsbGJhY2sgPSA9PlxyXG4gICAgICAgIEBwcm92aWRlci5sb2FkKCkuZ29Ub0RlZmluaXRpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcclxuICAgICAgcmV0dXJuIHtyYW5nZSwgY2FsbGJhY2t9XHJcbiJdfQ==
