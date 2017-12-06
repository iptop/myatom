(function() {
  "use strict";
  var Beautifier, PrettyDiff,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PrettyDiff = (function(superClass) {
    extend(PrettyDiff, superClass);

    function PrettyDiff() {
      return PrettyDiff.__super__.constructor.apply(this, arguments);
    }

    PrettyDiff.prototype.name = "Pretty Diff";

    PrettyDiff.prototype.link = "https://github.com/prettydiff/prettydiff";

    PrettyDiff.prototype.options = {
      _: {
        inchar: [
          "indent_with_tabs", "indent_char", function(indent_with_tabs, indent_char) {
            if (indent_with_tabs === true) {
              return "\t";
            } else {
              return indent_char;
            }
          }
        ],
        insize: [
          "indent_with_tabs", "indent_size", function(indent_with_tabs, indent_size) {
            if (indent_with_tabs === true) {
              return 1;
            } else {
              return indent_size;
            }
          }
        ],
        objsort: function(objsort) {
          return objsort || false;
        },
        preserve: [
          'preserve_newlines', function(preserve_newlines) {
            if (preserve_newlines === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        cssinsertlines: "newline_between_rules",
        comments: [
          "indent_comments", function(indent_comments) {
            if (indent_comments === false) {
              return "noindent";
            } else {
              return "indent";
            }
          }
        ],
        force: "force_indentation",
        quoteConvert: "convert_quotes",
        vertical: [
          'align_assignments', function(align_assignments) {
            if (align_assignments === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ],
        wrap: "wrap_line_length",
        space: "space_after_anon_function",
        noleadzero: "no_lead_zero",
        endcomma: "end_with_comma",
        methodchain: [
          'break_chained_methods', function(break_chained_methods) {
            if (break_chained_methods === true) {
              return false;
            } else {
              return true;
            }
          }
        ],
        ternaryline: "preserve_ternary_lines",
        bracepadding: "space_in_paren"
      },
      CSV: true,
      Coldfusion: true,
      ERB: true,
      EJS: true,
      HTML: true,
      Handlebars: true,
      Mustache: true,
      Nunjucks: true,
      XML: true,
      SVG: true,
      Spacebars: true,
      JSX: true,
      JavaScript: true,
      CSS: true,
      SCSS: true,
      JSON: true,
      TSS: true,
      Twig: true,
      LESS: true,
      Swig: true,
      "UX Markup": true,
      Visualforce: true,
      "Riot.js": true,
      XTemplate: true,
      "Golang Template": true
    };

    PrettyDiff.prototype.beautify = function(text, language, options) {
      options.crlf = this.getDefaultLineEnding(true, false, options.end_of_line);
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var _, args, lang, output, prettydiff, result;
          prettydiff = require("prettydiff");
          _ = require('lodash');
          lang = "auto";
          switch (language) {
            case "CSV":
              lang = "csv";
              break;
            case "Coldfusion":
              lang = "html";
              break;
            case "EJS":
            case "Twig":
              lang = "ejs";
              break;
            case "ERB":
              lang = "html_ruby";
              break;
            case "Handlebars":
            case "Mustache":
            case "Spacebars":
            case "Swig":
            case "Riot.js":
            case "XTemplate":
              lang = "handlebars";
              break;
            case "SGML":
              lang = "markup";
              break;
            case "XML":
            case "Visualforce":
            case "SVG":
              lang = "xml";
              break;
            case "HTML":
            case "Nunjucks":
            case "UX Markup":
              lang = "html";
              break;
            case "JavaScript":
              lang = "javascript";
              break;
            case "JSON":
              lang = "json";
              break;
            case "JSX":
              lang = "jsx";
              break;
            case "JSTL":
              lang = "jsp";
              break;
            case "CSS":
              lang = "css";
              break;
            case "LESS":
              lang = "less";
              break;
            case "SCSS":
              lang = "scss";
              break;
            case "TSS":
              lang = "tss";
              break;
            case "Golang Template":
              lang = "go";
              break;
            default:
              lang = "auto";
          }
          args = {
            source: text,
            lang: lang,
            mode: "beautify"
          };
          _.merge(options, args);
          _this.verbose('prettydiff', options);
          output = prettydiff.api(options);
          result = output[0];
          return resolve(result);
        };
      })(this));
    };

    return PrettyDiff;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9wcmV0dHlkaWZmLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBQ3JCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFDTixPQUFBLEdBQVM7TUFFUCxDQUFBLEVBQ0U7UUFBQSxNQUFBLEVBQVE7VUFBQyxrQkFBRCxFQUFxQixhQUFyQixFQUFvQyxTQUFDLGdCQUFELEVBQW1CLFdBQW5CO1lBQzFDLElBQUksZ0JBQUEsS0FBb0IsSUFBeEI7cUJBQ0UsS0FERjthQUFBLE1BQUE7cUJBQ1ksWUFEWjs7VUFEMEMsQ0FBcEM7U0FBUjtRQUlBLE1BQUEsRUFBUTtVQUFDLGtCQUFELEVBQXFCLGFBQXJCLEVBQW9DLFNBQUMsZ0JBQUQsRUFBbUIsV0FBbkI7WUFDMUMsSUFBSSxnQkFBQSxLQUFvQixJQUF4QjtxQkFDRSxFQURGO2FBQUEsTUFBQTtxQkFDUyxZQURUOztVQUQwQyxDQUFwQztTQUpSO1FBUUEsT0FBQSxFQUFTLFNBQUMsT0FBRDtpQkFDUCxPQUFBLElBQVc7UUFESixDQVJUO1FBVUEsUUFBQSxFQUFVO1VBQUMsbUJBQUQsRUFBc0IsU0FBQyxpQkFBRDtZQUM5QixJQUFJLGlCQUFBLEtBQXFCLElBQXpCO3FCQUNFLE1BREY7YUFBQSxNQUFBO3FCQUNhLE9BRGI7O1VBRDhCLENBQXRCO1NBVlY7UUFjQSxjQUFBLEVBQWdCLHVCQWRoQjtRQWVBLFFBQUEsRUFBVTtVQUFDLGlCQUFELEVBQW9CLFNBQUMsZUFBRDtZQUM1QixJQUFJLGVBQUEsS0FBbUIsS0FBdkI7cUJBQ0UsV0FERjthQUFBLE1B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QURnQjtBQWYzQixpQkFpQk8sWUFqQlA7Y0FrQkksSUFBQSxHQUFPO0FBREo7QUFqQlAsaUJBbUJPLE1BbkJQO2NBb0JJLElBQUEsR0FBTztBQURKO0FBbkJQLGlCQXFCTyxLQXJCUDtjQXNCSSxJQUFBLEdBQU87QUFESjtBQXJCUCxpQkF1Qk8sTUF2QlA7Y0F3QkksSUFBQSxHQUFPO0FBREo7QUF2QlAsaUJBeUJPLEtBekJQO2NBMEJJLElBQUEsR0FBTztBQURKO0FBekJQLGlCQTJCTyxNQTNCUDtjQTRCSSxJQUFBLEdBQU87QUFESjtBQTNCUCxpQkE2Qk8sTUE3QlA7Y0E4QkksSUFBQSxHQUFPO0FBREo7QUE3QlAsaUJBK0JPLEtBL0JQO2NBZ0NJLElBQUEsR0FBTztBQURKO0FBL0JQLGlCQWlDTyxpQkFqQ1A7Y0FrQ0ksSUFBQSxHQUFPO0FBREo7QUFqQ1A7Y0FvQ0ksSUFBQSxHQUFPO0FBcENYO1VBdUNBLElBQUEsR0FDRTtZQUFBLE1BQUEsRUFBUSxJQUFSO1lBQ0EsSUFBQSxFQUFNLElBRE47WUFFQSxJQUFBLEVBQU0sVUFGTjs7VUFLRixDQUFDLENBQUMsS0FBRixDQUFRLE9BQVIsRUFBaUIsSUFBakI7VUFHQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBdUIsT0FBdkI7VUFDQSxNQUFBLEdBQVMsVUFBVSxDQUFDLEdBQVgsQ0FBZSxPQUFmO1VBQ1QsTUFBQSxHQUFTLE1BQU8sQ0FBQSxDQUFBO2lCQUdoQixPQUFBLENBQVEsTUFBUjtRQTNEa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7SUFGSDs7OztLQXJFOEI7QUFIMUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJldHR5RGlmZiBleHRlbmRzIEJlYXV0aWZpZXJcclxuICBuYW1lOiBcIlByZXR0eSBEaWZmXCJcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9wcmV0dHlkaWZmL3ByZXR0eWRpZmZcIlxyXG4gIG9wdGlvbnM6IHtcclxuICAgICMgQXBwbHkgdGhlc2Ugb3B0aW9ucyBmaXJzdCAvIGdsb2JhbGx5LCBmb3IgYWxsIGxhbmd1YWdlc1xyXG4gICAgXzpcclxuICAgICAgaW5jaGFyOiBbXCJpbmRlbnRfd2l0aF90YWJzXCIsIFwiaW5kZW50X2NoYXJcIiwgKGluZGVudF93aXRoX3RhYnMsIGluZGVudF9jaGFyKSAtPlxyXG4gICAgICAgIGlmIChpbmRlbnRfd2l0aF90YWJzIGlzIHRydWUpIHRoZW4gXFxcclxuICAgICAgICAgIFwiXFx0XCIgZWxzZSBpbmRlbnRfY2hhclxyXG4gICAgICBdXHJcbiAgICAgIGluc2l6ZTogW1wiaW5kZW50X3dpdGhfdGFic1wiLCBcImluZGVudF9zaXplXCIsIChpbmRlbnRfd2l0aF90YWJzLCBpbmRlbnRfc2l6ZSkgLT5cclxuICAgICAgICBpZiAoaW5kZW50X3dpdGhfdGFicyBpcyB0cnVlKSB0aGVuIFxcXHJcbiAgICAgICAgICAxIGVsc2UgaW5kZW50X3NpemVcclxuICAgICAgXVxyXG4gICAgICBvYmpzb3J0OiAob2Jqc29ydCkgLT5cclxuICAgICAgICBvYmpzb3J0IG9yIGZhbHNlXHJcbiAgICAgIHByZXNlcnZlOiBbJ3ByZXNlcnZlX25ld2xpbmVzJywgKHByZXNlcnZlX25ld2xpbmVzKSAtPlxyXG4gICAgICAgIGlmIChwcmVzZXJ2ZV9uZXdsaW5lcyBpcyB0cnVlICkgdGhlbiBcXFxyXG4gICAgICAgICAgXCJhbGxcIiBlbHNlIFwibm9uZVwiXHJcbiAgICAgIF1cclxuICAgICAgY3NzaW5zZXJ0bGluZXM6IFwibmV3bGluZV9iZXR3ZWVuX3J1bGVzXCJcclxuICAgICAgY29tbWVudHM6IFtcImluZGVudF9jb21tZW50c1wiLCAoaW5kZW50X2NvbW1lbnRzKSAtPlxyXG4gICAgICAgIGlmIChpbmRlbnRfY29tbWVudHMgaXMgZmFsc2UpIHRoZW4gXFxcclxuICAgICAgICAgIFwibm9pbmRlbnRcIiBlbHNlIFwiaW5kZW50XCJcclxuICAgICAgXVxyXG4gICAgICBmb3JjZTogXCJmb3JjZV9pbmRlbnRhdGlvblwiXHJcbiAgICAgIHF1b3RlQ29udmVydDogXCJjb252ZXJ0X3F1b3Rlc1wiXHJcbiAgICAgIHZlcnRpY2FsOiBbJ2FsaWduX2Fzc2lnbm1lbnRzJywgKGFsaWduX2Fzc2lnbm1lbnRzKSAtPlxyXG4gICAgICAgIGlmIChhbGlnbl9hc3NpZ25tZW50cyBpcyB0cnVlICkgdGhlbiBcXFxyXG4gICAgICAgICAgXCJhbGxcIiBlbHNlIFwibm9uZVwiXHJcbiAgICAgIF1cclxuICAgICAgd3JhcDogXCJ3cmFwX2xpbmVfbGVuZ3RoXCJcclxuICAgICAgc3BhY2U6IFwic3BhY2VfYWZ0ZXJfYW5vbl9mdW5jdGlvblwiXHJcbiAgICAgIG5vbGVhZHplcm86IFwibm9fbGVhZF96ZXJvXCJcclxuICAgICAgZW5kY29tbWE6IFwiZW5kX3dpdGhfY29tbWFcIlxyXG4gICAgICBtZXRob2RjaGFpbjogWydicmVha19jaGFpbmVkX21ldGhvZHMnLCAoYnJlYWtfY2hhaW5lZF9tZXRob2RzKSAtPlxyXG4gICAgICAgIGlmIChicmVha19jaGFpbmVkX21ldGhvZHMgaXMgdHJ1ZSApIHRoZW4gXFxcclxuICAgICAgICAgIGZhbHNlIGVsc2UgdHJ1ZVxyXG4gICAgICBdXHJcbiAgICAgIHRlcm5hcnlsaW5lOiBcInByZXNlcnZlX3Rlcm5hcnlfbGluZXNcIlxyXG4gICAgICBicmFjZXBhZGRpbmc6IFwic3BhY2VfaW5fcGFyZW5cIlxyXG4gICAgIyBBcHBseSBsYW5ndWFnZS1zcGVjaWZpYyBvcHRpb25zXHJcbiAgICBDU1Y6IHRydWVcclxuICAgIENvbGRmdXNpb246IHRydWVcclxuICAgIEVSQjogdHJ1ZVxyXG4gICAgRUpTOiB0cnVlXHJcbiAgICBIVE1MOiB0cnVlXHJcbiAgICBIYW5kbGViYXJzOiB0cnVlXHJcbiAgICBNdXN0YWNoZTogdHJ1ZVxyXG4gICAgTnVuanVja3M6IHRydWVcclxuICAgIFhNTDogdHJ1ZVxyXG4gICAgU1ZHOiB0cnVlXHJcbiAgICBTcGFjZWJhcnM6IHRydWVcclxuICAgIEpTWDogdHJ1ZVxyXG4gICAgSmF2YVNjcmlwdDogdHJ1ZVxyXG4gICAgQ1NTOiB0cnVlXHJcbiAgICBTQ1NTOiB0cnVlXHJcbiAgICBKU09OOiB0cnVlXHJcbiAgICBUU1M6IHRydWVcclxuICAgIFR3aWc6IHRydWVcclxuICAgIExFU1M6IHRydWVcclxuICAgIFN3aWc6IHRydWVcclxuICAgIFwiVVggTWFya3VwXCI6IHRydWVcclxuICAgIFZpc3VhbGZvcmNlOiB0cnVlXHJcbiAgICBcIlJpb3QuanNcIjogdHJ1ZVxyXG4gICAgWFRlbXBsYXRlOiB0cnVlXHJcbiAgICBcIkdvbGFuZyBUZW1wbGF0ZVwiOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgb3B0aW9ucy5jcmxmID0gQGdldERlZmF1bHRMaW5lRW5kaW5nKHRydWUsZmFsc2Usb3B0aW9ucy5lbmRfb2ZfbGluZSlcclxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cclxuICAgICAgcHJldHR5ZGlmZiA9IHJlcXVpcmUoXCJwcmV0dHlkaWZmXCIpXHJcbiAgICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxyXG5cclxuICAgICAgIyBTZWxlY3QgUHJldHR5ZGlmZiBsYW5ndWFnZVxyXG4gICAgICBsYW5nID0gXCJhdXRvXCJcclxuICAgICAgc3dpdGNoIGxhbmd1YWdlXHJcbiAgICAgICAgd2hlbiBcIkNTVlwiXHJcbiAgICAgICAgICBsYW5nID0gXCJjc3ZcIlxyXG4gICAgICAgIHdoZW4gXCJDb2xkZnVzaW9uXCJcclxuICAgICAgICAgIGxhbmcgPSBcImh0bWxcIlxyXG4gICAgICAgIHdoZW4gXCJFSlNcIiwgXCJUd2lnXCJcclxuICAgICAgICAgIGxhbmcgPSBcImVqc1wiXHJcbiAgICAgICAgd2hlbiBcIkVSQlwiXHJcbiAgICAgICAgICBsYW5nID0gXCJodG1sX3J1YnlcIlxyXG4gICAgICAgIHdoZW4gXCJIYW5kbGViYXJzXCIsIFwiTXVzdGFjaGVcIiwgXCJTcGFjZWJhcnNcIiwgXCJTd2lnXCIsIFwiUmlvdC5qc1wiLCBcIlhUZW1wbGF0ZVwiXHJcbiAgICAgICAgICBsYW5nID0gXCJoYW5kbGViYXJzXCJcclxuICAgICAgICB3aGVuIFwiU0dNTFwiXHJcbiAgICAgICAgICBsYW5nID0gXCJtYXJrdXBcIlxyXG4gICAgICAgIHdoZW4gXCJYTUxcIiwgXCJWaXN1YWxmb3JjZVwiLCBcIlNWR1wiXHJcbiAgICAgICAgICBsYW5nID0gXCJ4bWxcIlxyXG4gICAgICAgIHdoZW4gXCJIVE1MXCIsIFwiTnVuanVja3NcIiwgXCJVWCBNYXJrdXBcIlxyXG4gICAgICAgICAgbGFuZyA9IFwiaHRtbFwiXHJcbiAgICAgICAgd2hlbiBcIkphdmFTY3JpcHRcIlxyXG4gICAgICAgICAgbGFuZyA9IFwiamF2YXNjcmlwdFwiXHJcbiAgICAgICAgd2hlbiBcIkpTT05cIlxyXG4gICAgICAgICAgbGFuZyA9IFwianNvblwiXHJcbiAgICAgICAgd2hlbiBcIkpTWFwiXHJcbiAgICAgICAgICBsYW5nID0gXCJqc3hcIlxyXG4gICAgICAgIHdoZW4gXCJKU1RMXCJcclxuICAgICAgICAgIGxhbmcgPSBcImpzcFwiXHJcbiAgICAgICAgd2hlbiBcIkNTU1wiXHJcbiAgICAgICAgICBsYW5nID0gXCJjc3NcIlxyXG4gICAgICAgIHdoZW4gXCJMRVNTXCJcclxuICAgICAgICAgIGxhbmcgPSBcImxlc3NcIlxyXG4gICAgICAgIHdoZW4gXCJTQ1NTXCJcclxuICAgICAgICAgIGxhbmcgPSBcInNjc3NcIlxyXG4gICAgICAgIHdoZW4gXCJUU1NcIlxyXG4gICAgICAgICAgbGFuZyA9IFwidHNzXCJcclxuICAgICAgICB3aGVuIFwiR29sYW5nIFRlbXBsYXRlXCJcclxuICAgICAgICAgIGxhbmcgPSBcImdvXCJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBsYW5nID0gXCJhdXRvXCJcclxuXHJcbiAgICAgICMgUHJldHR5ZGlmZiBBcmd1bWVudHNcclxuICAgICAgYXJncyA9XHJcbiAgICAgICAgc291cmNlOiB0ZXh0XHJcbiAgICAgICAgbGFuZzogbGFuZ1xyXG4gICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxyXG5cclxuICAgICAgIyBNZXJnZSBhcmdzIGludG9zIG9wdGlvbnNcclxuICAgICAgXy5tZXJnZShvcHRpb25zLCBhcmdzKVxyXG5cclxuICAgICAgIyBCZWF1dGlmeVxyXG4gICAgICBAdmVyYm9zZSgncHJldHR5ZGlmZicsIG9wdGlvbnMpXHJcbiAgICAgIG91dHB1dCA9IHByZXR0eWRpZmYuYXBpKG9wdGlvbnMpXHJcbiAgICAgIHJlc3VsdCA9IG91dHB1dFswXVxyXG5cclxuICAgICAgIyBSZXR1cm4gYmVhdXRpZmllZCB0ZXh0XHJcbiAgICAgIHJlc29sdmUocmVzdWx0KVxyXG5cclxuICAgIClcclxuIl19
