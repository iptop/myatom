(function() {
  module.exports = {
    name: "PHP",
    namespace: "php",

    /*
    Supported Grammars
     */
    grammars: ["PHP"],

    /*
    Supported extensions
     */
    extensions: ["php", "module", "inc"],
    defaultBeautifier: "PHP-CS-Fixer",
    options: {
      cs_fixer_path: {
        title: "PHP-CS-Fixer Path",
        type: 'string',
        "default": "",
        description: "Absolute path to the `php-cs-fixer` CLI executable"
      },
      cs_fixer_version: {
        title: "PHP-CS-Fixer Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2]
      },
      cs_fixer_config_file: {
        title: "PHP-CS-Fixer Config File",
        type: 'string',
        "default": "",
        description: "Path to php-cs-fixer config file. Will use local `.php_cs` or `.php_cs.dist` if found in the working directory or project root."
      },
      fixers: {
        type: 'string',
        "default": "",
        description: "Add fixer(s). i.e. linefeed,-short_tag,indentation (PHP-CS-Fixer 1 only)"
      },
      level: {
        type: 'string',
        "default": "",
        description: "By default, all PSR-2 fixers and some additional ones are run. (PHP-CS-Fixer 1 only)"
      },
      rules: {
        type: 'string',
        "default": "",
        description: "Add rule(s). i.e. line_ending,-full_opening_tag,@PSR2 (PHP-CS-Fixer 2 only)"
      },
      allow_risky: {
        title: "Allow risky rules",
        type: 'string',
        "default": "no",
        "enum": ["no", "yes"],
        description: "Allow risky rules to be applied (PHP-CS-Fixer 2 only)"
      },
      phpcbf_path: {
        title: "PHPCBF Path",
        type: 'string',
        "default": "",
        description: "Path to the `phpcbf` CLI executable"
      },
      phpcbf_version: {
        title: "PHPCBF Version",
        type: 'integer',
        "default": 2,
        "enum": [1, 2, 3]
      },
      standard: {
        title: "PHPCBF Standard",
        type: 'string',
        "default": "PEAR",
        description: "Standard name Squiz, PSR2, PSR1, PHPCS, PEAR, Zend, MySource... or path to CS rules. Will use local `phpcs.xml`, `phpcs.xml.dist`, `phpcs.ruleset.xml` or `ruleset.xml` if found in the project root."
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sYW5ndWFnZXMvcGhwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBRWYsSUFBQSxFQUFNLEtBRlM7SUFHZixTQUFBLEVBQVcsS0FISTs7QUFLZjs7O0lBR0EsUUFBQSxFQUFVLENBQ1IsS0FEUSxDQVJLOztBQVlmOzs7SUFHQSxVQUFBLEVBQVksQ0FDVixLQURVLEVBRVYsUUFGVSxFQUdWLEtBSFUsQ0FmRztJQXFCZixpQkFBQSxFQUFtQixjQXJCSjtJQXVCZixPQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sbUJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSxvREFIYjtPQURGO01BS0EsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxzQkFBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUZUO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLENBQUQsRUFBSSxDQUFKLENBSE47T0FORjtNQVVBLG9CQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sMEJBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGVDtRQUdBLFdBQUEsRUFBYSxpSUFIYjtPQVhGO01BZUEsTUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsMEVBRmI7T0FoQkY7TUFtQkEsS0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsc0ZBRmI7T0FwQkY7TUF1QkEsS0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsNkVBRmI7T0F4QkY7TUEyQkEsV0FBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLG1CQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FITjtRQUlBLFdBQUEsRUFBYSx1REFKYjtPQTVCRjtNQWlDQSxXQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO1FBR0EsV0FBQSxFQUFhLHFDQUhiO09BbENGO01Bc0NBLGNBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxnQkFBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUZUO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUhOO09BdkNGO01BMkNBLFFBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxpQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUZUO1FBR0EsV0FBQSxFQUFhLHVNQUhiO09BNUNGO0tBeEJhOztBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBuYW1lOiBcIlBIUFwiXHJcbiAgbmFtZXNwYWNlOiBcInBocFwiXHJcblxyXG4gICMjI1xyXG4gIFN1cHBvcnRlZCBHcmFtbWFyc1xyXG4gICMjI1xyXG4gIGdyYW1tYXJzOiBbXHJcbiAgICBcIlBIUFwiXHJcbiAgXVxyXG5cclxuICAjIyNcclxuICBTdXBwb3J0ZWQgZXh0ZW5zaW9uc1xyXG4gICMjI1xyXG4gIGV4dGVuc2lvbnM6IFtcclxuICAgIFwicGhwXCJcclxuICAgIFwibW9kdWxlXCJcclxuICAgIFwiaW5jXCJcclxuICBdXHJcblxyXG4gIGRlZmF1bHRCZWF1dGlmaWVyOiBcIlBIUC1DUy1GaXhlclwiXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBjc19maXhlcl9wYXRoOlxyXG4gICAgICB0aXRsZTogXCJQSFAtQ1MtRml4ZXIgUGF0aFwiXHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwiXCJcclxuICAgICAgZGVzY3JpcHRpb246IFwiQWJzb2x1dGUgcGF0aCB0byB0aGUgYHBocC1jcy1maXhlcmAgQ0xJIGV4ZWN1dGFibGVcIlxyXG4gICAgY3NfZml4ZXJfdmVyc2lvbjpcclxuICAgICAgdGl0bGU6IFwiUEhQLUNTLUZpeGVyIFZlcnNpb25cIlxyXG4gICAgICB0eXBlOiAnaW50ZWdlcidcclxuICAgICAgZGVmYXVsdDogMlxyXG4gICAgICBlbnVtOiBbMSwgMl1cclxuICAgIGNzX2ZpeGVyX2NvbmZpZ19maWxlOlxyXG4gICAgICB0aXRsZTogXCJQSFAtQ1MtRml4ZXIgQ29uZmlnIEZpbGVcIlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcIlwiXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gcGhwLWNzLWZpeGVyIGNvbmZpZyBmaWxlLiBXaWxsIHVzZSBsb2NhbCBgLnBocF9jc2Agb3IgYC5waHBfY3MuZGlzdGAgaWYgZm91bmQgaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5IG9yIHByb2plY3Qgcm9vdC5cIlxyXG4gICAgZml4ZXJzOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcIlwiXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkFkZCBmaXhlcihzKS4gaS5lLiBsaW5lZmVlZCwtc2hvcnRfdGFnLGluZGVudGF0aW9uIChQSFAtQ1MtRml4ZXIgMSBvbmx5KVwiXHJcbiAgICBsZXZlbDpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogXCJcIlxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJCeSBkZWZhdWx0LCBhbGwgUFNSLTIgZml4ZXJzIGFuZCBzb21lIGFkZGl0aW9uYWwgb25lcyBhcmUgcnVuLiAoUEhQLUNTLUZpeGVyIDEgb25seSlcIlxyXG4gICAgcnVsZXM6XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwiXCJcclxuICAgICAgZGVzY3JpcHRpb246IFwiQWRkIHJ1bGUocykuIGkuZS4gbGluZV9lbmRpbmcsLWZ1bGxfb3BlbmluZ190YWcsQFBTUjIgKFBIUC1DUy1GaXhlciAyIG9ubHkpXCJcclxuICAgIGFsbG93X3Jpc2t5OlxyXG4gICAgICB0aXRsZTogXCJBbGxvdyByaXNreSBydWxlc1wiXHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgIGRlZmF1bHQ6IFwibm9cIlxyXG4gICAgICBlbnVtOiBbXCJub1wiLCBcInllc1wiXVxyXG4gICAgICBkZXNjcmlwdGlvbjogXCJBbGxvdyByaXNreSBydWxlcyB0byBiZSBhcHBsaWVkIChQSFAtQ1MtRml4ZXIgMiBvbmx5KVwiXHJcbiAgICBwaHBjYmZfcGF0aDpcclxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFBhdGhcIlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcIlwiXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlBhdGggdG8gdGhlIGBwaHBjYmZgIENMSSBleGVjdXRhYmxlXCIsXHJcbiAgICBwaHBjYmZfdmVyc2lvbjpcclxuICAgICAgdGl0bGU6IFwiUEhQQ0JGIFZlcnNpb25cIlxyXG4gICAgICB0eXBlOiAnaW50ZWdlcidcclxuICAgICAgZGVmYXVsdDogMlxyXG4gICAgICBlbnVtOiBbMSwgMiwgM11cclxuICAgIHN0YW5kYXJkOlxyXG4gICAgICB0aXRsZTogXCJQSFBDQkYgU3RhbmRhcmRcIlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiBcIlBFQVJcIixcclxuICAgICAgZGVzY3JpcHRpb246IFwiU3RhbmRhcmQgbmFtZSBTcXVpeiwgUFNSMiwgUFNSMSwgUEhQQ1MsIFBFQVIsIFplbmQsIE15U291cmNlLi4uIG9yIHBhdGggdG8gQ1MgcnVsZXMuIFdpbGwgdXNlIGxvY2FsIGBwaHBjcy54bWxgLCBgcGhwY3MueG1sLmRpc3RgLCBgcGhwY3MucnVsZXNldC54bWxgIG9yIGBydWxlc2V0LnhtbGAgaWYgZm91bmQgaW4gdGhlIHByb2plY3Qgcm9vdC5cIlxyXG5cclxufVxyXG4iXX0=
