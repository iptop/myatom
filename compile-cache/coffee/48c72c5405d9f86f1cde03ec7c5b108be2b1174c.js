
/*
 */

(function() {
  "use strict";
  var Beautifier, Gherkin,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Gherkin = (function(superClass) {
    extend(Gherkin, superClass);

    function Gherkin() {
      return Gherkin.__super__.constructor.apply(this, arguments);
    }

    Gherkin.prototype.name = "Gherkin formatter";

    Gherkin.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/gherkin.coffee";

    Gherkin.prototype.options = {
      gherkin: true
    };

    Gherkin.prototype.beautify = function(text, language, options) {
      var Lexer, logger;
      Lexer = require('gherkin').Lexer('en');
      logger = this.logger;
      return new this.Promise(function(resolve, reject) {
        var i, len, lexer, line, loggerLevel, recorder, ref;
        recorder = {
          lines: [],
          tags: [],
          comments: [],
          last_obj: null,
          indent_to: function(indent_level) {
            if (indent_level == null) {
              indent_level = 0;
            }
            return options.indent_char.repeat(options.indent_size * indent_level);
          },
          write_blank: function() {
            return this.lines.push('');
          },
          write_indented: function(content, indent) {
            var i, len, line, ref, results;
            if (indent == null) {
              indent = 0;
            }
            ref = content.trim().split("\n");
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              line = ref[i];
              results.push(this.lines.push("" + (this.indent_to(indent)) + (line.trim())));
            }
            return results;
          },
          write_comments: function(indent) {
            var comment, i, len, ref, results;
            if (indent == null) {
              indent = 0;
            }
            ref = this.comments.splice(0, this.comments.length);
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              comment = ref[i];
              results.push(this.write_indented(comment, indent));
            }
            return results;
          },
          write_tags: function(indent) {
            if (indent == null) {
              indent = 0;
            }
            if (this.tags.length > 0) {
              return this.write_indented(this.tags.splice(0, this.tags.length).join(' '), indent);
            }
          },
          comment: function(value, line) {
            logger.verbose({
              token: 'comment',
              value: value.trim(),
              line: line
            });
            return this.comments.push(value);
          },
          tag: function(value, line) {
            logger.verbose({
              token: 'tag',
              value: value,
              line: line
            });
            return this.tags.push(value);
          },
          feature: function(keyword, name, description, line) {
            logger.verbose({
              token: 'feature',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_comments(0);
            this.write_tags(0);
            this.write_indented(keyword + ": " + name, '');
            if (description) {
              return this.write_indented(description, 1);
            }
          },
          background: function(keyword, name, description, line) {
            logger.verbose({
              token: 'background',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          scenario: function(keyword, name, description, line) {
            logger.verbose({
              token: 'scenario',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_tags(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          scenario_outline: function(keyword, name, description, line) {
            logger.verbose({
              token: 'outline',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(1);
            this.write_tags(1);
            this.write_indented(keyword + ": " + name, 1);
            if (description) {
              return this.write_indented(description, 2);
            }
          },
          examples: function(keyword, name, description, line) {
            logger.verbose({
              token: 'examples',
              keyword: keyword,
              name: name,
              description: description,
              line: line
            });
            this.write_blank();
            this.write_comments(2);
            this.write_tags(2);
            this.write_indented(keyword + ": " + name, 2);
            if (description) {
              return this.write_indented(description, 3);
            }
          },
          step: function(keyword, name, line) {
            logger.verbose({
              token: 'step',
              keyword: keyword,
              name: name,
              line: line
            });
            this.write_comments(2);
            return this.write_indented("" + keyword + name, 2);
          },
          doc_string: function(content_type, string, line) {
            var three_quotes;
            logger.verbose({
              token: 'doc_string',
              content_type: content_type,
              string: string,
              line: line
            });
            three_quotes = '"""';
            this.write_comments(2);
            return this.write_indented("" + three_quotes + content_type + "\n" + string + "\n" + three_quotes, 3);
          },
          row: function(cells, line) {
            logger.verbose({
              token: 'row',
              cells: cells,
              line: line
            });
            this.write_comments(3);
            return this.write_indented("| " + (cells.join(' | ')) + " |", 3);
          },
          eof: function() {
            logger.verbose({
              token: 'eof'
            });
            return this.write_comments(2);
          }
        };
        lexer = new Lexer(recorder);
        lexer.scan(text);
        loggerLevel = typeof atom !== "undefined" && atom !== null ? atom.config.get('atom-beautify.general.loggerLevel') : void 0;
        if (loggerLevel === 'verbose') {
          ref = recorder.lines;
          for (i = 0, len = ref.length; i < len; i++) {
            line = ref[i];
            logger.verbose("> " + line);
          }
        }
        return resolve(recorder.lines.join("\n"));
      });
    };

    return Gherkin;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9naGVya2luLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztBQUFBO0VBR0E7QUFIQSxNQUFBLG1CQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUVOLE9BQUEsR0FBUztNQUNQLE9BQUEsRUFBUyxJQURGOzs7c0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBQWtCLENBQUMsS0FBbkIsQ0FBeUIsSUFBekI7TUFDUixNQUFBLEdBQVMsSUFBQyxDQUFBO0FBQ1YsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsUUFBQSxHQUFXO1VBQ1QsS0FBQSxFQUFPLEVBREU7VUFFVCxJQUFBLEVBQU0sRUFGRztVQUdULFFBQUEsRUFBVSxFQUhEO1VBS1QsUUFBQSxFQUFVLElBTEQ7VUFPVCxTQUFBLEVBQVcsU0FBQyxZQUFEOztjQUFDLGVBQWU7O0FBQ3pCLG1CQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBcEIsQ0FBMkIsT0FBTyxDQUFDLFdBQVIsR0FBc0IsWUFBakQ7VUFERSxDQVBGO1VBVVQsV0FBQSxFQUFhLFNBQUE7bUJBQ1gsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksRUFBWjtVQURXLENBVko7VUFhVCxjQUFBLEVBQWdCLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDZCxnQkFBQTs7Y0FEd0IsU0FBUzs7QUFDakM7QUFBQTtp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OUQsRUFBOEUsQ0FBOUU7VUFMVSxDQWxGSDtVQXlGVCxHQUFBLEVBQUssU0FBQyxLQUFELEVBQVEsSUFBUjtZQUNILE1BQU0sQ0FBQyxPQUFQLENBQWU7Y0FBQyxLQUFBLEVBQU8sS0FBUjtjQUFlLEtBQUEsRUFBTyxLQUF0QjtjQUE2QixJQUFBLEVBQU0sSUFBbkM7YUFBZjtZQUlBLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQWhCO21CQUNBLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUEsR0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWCxDQUFELENBQUosR0FBdUIsSUFBdkMsRUFBNEMsQ0FBNUM7VUFORyxDQXpGSTtVQWlHVCxHQUFBLEVBQUssU0FBQTtZQUNILE1BQU0sQ0FBQyxPQUFQLENBQWU7Y0FBQyxLQUFBLEVBQU8sS0FBUjthQUFmO21CQUVBLElBQUMsQ0FBQSxjQUFELENBQWdCLENBQWhCO1VBSEcsQ0FqR0k7O1FBdUdYLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxRQUFOO1FBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO1FBRUEsV0FBQSxrREFBYyxJQUFJLENBQUUsTUFBTSxDQUFDLEdBQWIsQ0FBaUIsbUNBQWpCO1FBQ2QsSUFBRyxXQUFBLEtBQWUsU0FBbEI7QUFDRTtBQUFBLGVBQUEscUNBQUE7O1lBQ0UsTUFBTSxDQUFDLE9BQVAsQ0FBZSxJQUFBLEdBQUssSUFBcEI7QUFERixXQURGOztlQUlBLE9BQUEsQ0FBUSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQWYsQ0FBb0IsSUFBcEIsQ0FBUjtNQWhIa0IsQ0FBVDtJQUhIOzs7O0tBUjJCO0FBTnZDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcbiMjI1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdoZXJraW4gZXh0ZW5kcyBCZWF1dGlmaWVyXHJcbiAgbmFtZTogXCJHaGVya2luIGZvcm1hdHRlclwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vR2xhdmluMDAxL2F0b20tYmVhdXRpZnkvYmxvYi9tYXN0ZXIvc3JjL2JlYXV0aWZpZXJzL2doZXJraW4uY29mZmVlXCJcclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgZ2hlcmtpbjogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cclxuICAgIExleGVyID0gcmVxdWlyZSgnZ2hlcmtpbicpLkxleGVyKCdlbicpXHJcbiAgICBsb2dnZXIgPSBAbG9nZ2VyXHJcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICAgIHJlY29yZGVyID0ge1xyXG4gICAgICAgIGxpbmVzOiBbXVxyXG4gICAgICAgIHRhZ3M6IFtdXHJcbiAgICAgICAgY29tbWVudHM6IFtdXHJcblxyXG4gICAgICAgIGxhc3Rfb2JqOiBudWxsXHJcblxyXG4gICAgICAgIGluZGVudF90bzogKGluZGVudF9sZXZlbCA9IDApIC0+XHJcbiAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pbmRlbnRfY2hhci5yZXBlYXQob3B0aW9ucy5pbmRlbnRfc2l6ZSAqIGluZGVudF9sZXZlbClcclxuXHJcbiAgICAgICAgd3JpdGVfYmxhbms6ICgpIC0+XHJcbiAgICAgICAgICBAbGluZXMucHVzaCgnJylcclxuXHJcbiAgICAgICAgd3JpdGVfaW5kZW50ZWQ6IChjb250ZW50LCBpbmRlbnQgPSAwKSAtPlxyXG4gICAgICAgICAgZm9yIGxpbmUgaW4gY29udGVudC50cmltKCkuc3BsaXQoXCJcXG5cIilcclxuICAgICAgICAgICAgQGxpbmVzLnB1c2goXCIje0BpbmRlbnRfdG8oaW5kZW50KX0je2xpbmUudHJpbSgpfVwiKVxyXG5cclxuICAgICAgICB3cml0ZV9jb21tZW50czogKGluZGVudCA9IDApIC0+XHJcbiAgICAgICAgICBmb3IgY29tbWVudCBpbiBAY29tbWVudHMuc3BsaWNlKDAsIEBjb21tZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChjb21tZW50LCBpbmRlbnQpXHJcblxyXG4gICAgICAgIHdyaXRlX3RhZ3M6IChpbmRlbnQgPSAwKSAtPlxyXG4gICAgICAgICAgaWYgQHRhZ3MubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoQHRhZ3Muc3BsaWNlKDAsIEB0YWdzLmxlbmd0aCkuam9pbignICcpLCBpbmRlbnQpXHJcblxyXG4gICAgICAgIGNvbW1lbnQ6ICh2YWx1ZSwgbGluZSkgLT5cclxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ2NvbW1lbnQnLCB2YWx1ZTogdmFsdWUudHJpbSgpLCBsaW5lOiBsaW5lfSlcclxuICAgICAgICAgIEBjb21tZW50cy5wdXNoKHZhbHVlKVxyXG5cclxuICAgICAgICB0YWc6ICh2YWx1ZSwgbGluZSkgLT5cclxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ3RhZycsIHZhbHVlOiB2YWx1ZSwgbGluZTogbGluZX0pXHJcbiAgICAgICAgICBAdGFncy5wdXNoKHZhbHVlKVxyXG5cclxuICAgICAgICBmZWF0dXJlOiAoa2V5d29yZCwgbmFtZSwgZGVzY3JpcHRpb24sIGxpbmUpIC0+XHJcbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdmZWF0dXJlJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBsaW5lOiBsaW5lfSlcclxuXHJcbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMClcclxuICAgICAgICAgIEB3cml0ZV90YWdzKDApXHJcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoXCIje2tleXdvcmR9OiAje25hbWV9XCIsICcnKVxyXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKGRlc2NyaXB0aW9uLCAxKSBpZiBkZXNjcmlwdGlvblxyXG5cclxuICAgICAgICBiYWNrZ3JvdW5kOiAoa2V5d29yZCwgbmFtZSwgZGVzY3JpcHRpb24sIGxpbmUpIC0+XHJcbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdiYWNrZ3JvdW5kJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBsaW5lOiBsaW5lfSlcclxuXHJcbiAgICAgICAgICBAd3JpdGVfYmxhbmsoKVxyXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDEpXHJcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoXCIje2tleXdvcmR9OiAje25hbWV9XCIsIDEpXHJcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoZGVzY3JpcHRpb24sIDIpIGlmIGRlc2NyaXB0aW9uXHJcblxyXG4gICAgICAgIHNjZW5hcmlvOiAoa2V5d29yZCwgbmFtZSwgZGVzY3JpcHRpb24sIGxpbmUpIC0+XHJcbiAgICAgICAgICBsb2dnZXIudmVyYm9zZSh7dG9rZW46ICdzY2VuYXJpbycsIGtleXdvcmQ6IGtleXdvcmQsIG5hbWU6IG5hbWUsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiwgbGluZTogbGluZX0pXHJcblxyXG4gICAgICAgICAgQHdyaXRlX2JsYW5rKClcclxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygxKVxyXG4gICAgICAgICAgQHdyaXRlX3RhZ3MoMSlcclxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7a2V5d29yZH06ICN7bmFtZX1cIiwgMSlcclxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChkZXNjcmlwdGlvbiwgMikgaWYgZGVzY3JpcHRpb25cclxuXHJcbiAgICAgICAgc2NlbmFyaW9fb3V0bGluZTogKGtleXdvcmQsIG5hbWUsIGRlc2NyaXB0aW9uLCBsaW5lKSAtPlxyXG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnb3V0bGluZScsIGtleXdvcmQ6IGtleXdvcmQsIG5hbWU6IG5hbWUsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiwgbGluZTogbGluZX0pXHJcblxyXG4gICAgICAgICAgQHdyaXRlX2JsYW5rKClcclxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygxKVxyXG4gICAgICAgICAgQHdyaXRlX3RhZ3MoMSlcclxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7a2V5d29yZH06ICN7bmFtZX1cIiwgMSlcclxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChkZXNjcmlwdGlvbiwgMikgaWYgZGVzY3JpcHRpb25cclxuXHJcbiAgICAgICAgZXhhbXBsZXM6IChrZXl3b3JkLCBuYW1lLCBkZXNjcmlwdGlvbiwgbGluZSkgLT5cclxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ2V4YW1wbGVzJywga2V5d29yZDoga2V5d29yZCwgbmFtZTogbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBsaW5lOiBsaW5lfSlcclxuXHJcbiAgICAgICAgICBAd3JpdGVfYmxhbmsoKVxyXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDIpXHJcbiAgICAgICAgICBAd3JpdGVfdGFncygyKVxyXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKFwiI3trZXl3b3JkfTogI3tuYW1lfVwiLCAyKVxyXG4gICAgICAgICAgQHdyaXRlX2luZGVudGVkKGRlc2NyaXB0aW9uLCAzKSBpZiBkZXNjcmlwdGlvblxyXG5cclxuICAgICAgICBzdGVwOiAoa2V5d29yZCwgbmFtZSwgbGluZSkgLT5cclxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ3N0ZXAnLCBrZXl3b3JkOiBrZXl3b3JkLCBuYW1lOiBuYW1lLCBsaW5lOiBsaW5lfSlcclxuXHJcbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMilcclxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7a2V5d29yZH0je25hbWV9XCIsIDIpXHJcblxyXG4gICAgICAgIGRvY19zdHJpbmc6IChjb250ZW50X3R5cGUsIHN0cmluZywgbGluZSkgLT5cclxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ2RvY19zdHJpbmcnLCBjb250ZW50X3R5cGU6IGNvbnRlbnRfdHlwZSwgc3RyaW5nOiBzdHJpbmcsIGxpbmU6IGxpbmV9KVxyXG4gICAgICAgICAgdGhyZWVfcXVvdGVzID0gJ1wiXCJcIidcclxuXHJcbiAgICAgICAgICBAd3JpdGVfY29tbWVudHMoMilcclxuICAgICAgICAgIEB3cml0ZV9pbmRlbnRlZChcIiN7dGhyZWVfcXVvdGVzfSN7Y29udGVudF90eXBlfVxcbiN7c3RyaW5nfVxcbiN7dGhyZWVfcXVvdGVzfVwiLCAzKVxyXG5cclxuICAgICAgICByb3c6IChjZWxscywgbGluZSkgLT5cclxuICAgICAgICAgIGxvZ2dlci52ZXJib3NlKHt0b2tlbjogJ3JvdycsIGNlbGxzOiBjZWxscywgbGluZTogbGluZX0pXHJcblxyXG4gICAgICAgICAgIyBUT0RPOiBuZWVkIHRvIGNvbGxlY3Qgcm93cyBzbyB0aGF0IHdlIGNhbiBhbGlnbiB0aGUgdmVydGljYWwgcGlwZXMgdG8gdGhlIHdpZGVzdCBjb2x1bW5zXHJcbiAgICAgICAgICAjIFNlZSBHaGVya2luOjpGb3JtYXR0ZXI6OlByZXR0eUZvcm1hdHRlciN0YWJsZShyb3dzKVxyXG4gICAgICAgICAgQHdyaXRlX2NvbW1lbnRzKDMpXHJcbiAgICAgICAgICBAd3JpdGVfaW5kZW50ZWQoXCJ8ICN7Y2VsbHMuam9pbignIHwgJyl9IHxcIiwgMylcclxuXHJcbiAgICAgICAgZW9mOiAoKSAtPlxyXG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2Uoe3Rva2VuOiAnZW9mJ30pXHJcbiAgICAgICAgICAjIElmIHRoZXJlIHdlcmUgYW55IGNvbW1lbnRzIGxlZnQsIHRyZWF0IHRoZW0gYXMgc3RlcCBjb21tZW50cy5cclxuICAgICAgICAgIEB3cml0ZV9jb21tZW50cygyKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXhlciA9IG5ldyBMZXhlcihyZWNvcmRlcilcclxuICAgICAgbGV4ZXIuc2Nhbih0ZXh0KVxyXG5cclxuICAgICAgbG9nZ2VyTGV2ZWwgPSBhdG9tPy5jb25maWcuZ2V0KCdhdG9tLWJlYXV0aWZ5LmdlbmVyYWwubG9nZ2VyTGV2ZWwnKVxyXG4gICAgICBpZiBsb2dnZXJMZXZlbCBpcyAndmVyYm9zZSdcclxuICAgICAgICBmb3IgbGluZSBpbiByZWNvcmRlci5saW5lc1xyXG4gICAgICAgICAgbG9nZ2VyLnZlcmJvc2UoXCI+ICN7bGluZX1cIilcclxuXHJcbiAgICAgIHJlc29sdmUgcmVjb3JkZXIubGluZXMuam9pbihcIlxcblwiKVxyXG4gICAgKVxyXG4iXX0=
