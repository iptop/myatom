(function() {
  "use strict";
  var Beautifier, JSBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = JSBeautify = (function(superClass) {
    extend(JSBeautify, superClass);

    function JSBeautify() {
      return JSBeautify.__super__.constructor.apply(this, arguments);
    }

    JSBeautify.prototype.name = "CSScomb";

    JSBeautify.prototype.link = "https://github.com/csscomb/csscomb.js";

    JSBeautify.prototype.options = {
      _: {
        configPath: true,
        predefinedConfig: true
      },
      CSS: true,
      LESS: true,
      SCSS: true
    };

    JSBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var CSON, Comb, comb, config, expandHomeDir, processedCSS, project, ref, syntax;
        Comb = require('csscomb');
        expandHomeDir = require('expand-home-dir');
        CSON = require('season');
        config = null;
        try {
          project = (ref = atom.project.getDirectories()) != null ? ref[0] : void 0;
          try {
            config = CSON.readFileSync(project != null ? project.resolve('.csscomb.cson') : void 0);
          } catch (error) {
            config = require(project != null ? project.resolve('.csscomb.json') : void 0);
          }
        } catch (error) {
          try {
            config = CSON.readFileSync(expandHomeDir(options.configPath));
          } catch (error) {
            config = Comb.getConfig(options.predefinedConfig);
          }
        }
        comb = new Comb(config);
        syntax = "css";
        switch (language) {
          case "LESS":
            syntax = "less";
            break;
          case "SCSS":
            syntax = "scss";
            break;
          case "Sass":
            syntax = "sass";
        }
        processedCSS = comb.processString(text, {
          syntax: syntax
        });
        return resolve(processedCSS);
      });
    };

    return JSBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9jc3Njb21iLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBQ3JCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFFTixPQUFBLEdBQVM7TUFFUCxDQUFBLEVBQ0U7UUFBQSxVQUFBLEVBQVksSUFBWjtRQUNBLGdCQUFBLEVBQWtCLElBRGxCO09BSEs7TUFLUCxHQUFBLEVBQUssSUFMRTtNQU1QLElBQUEsRUFBTSxJQU5DO01BT1AsSUFBQSxFQUFNLElBUEM7Ozt5QkFVVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFJbEIsWUFBQTtRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjtRQUNQLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSO1FBQ2hCLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjtRQUVQLE1BQUEsR0FBUztBQUNUO1VBQ0UsT0FBQSxzREFBeUMsQ0FBQSxDQUFBO0FBQ3pDO1lBQ0UsTUFBQSxHQUFTLElBQUksQ0FBQyxZQUFMLG1CQUFrQixPQUFPLENBQUUsT0FBVCxDQUFpQixlQUFqQixVQUFsQixFQURYO1dBQUEsYUFBQTtZQUdFLE1BQUEsR0FBUyxPQUFBLG1CQUFRLE9BQU8sQ0FBRSxPQUFULENBQWlCLGVBQWpCLFVBQVIsRUFIWDtXQUZGO1NBQUEsYUFBQTtBQU9FO1lBQ0UsTUFBQSxHQUFTLElBQUksQ0FBQyxZQUFMLENBQWtCLGFBQUEsQ0FBYyxPQUFPLENBQUMsVUFBdEIsQ0FBbEIsRUFEWDtXQUFBLGFBQUE7WUFJRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFPLENBQUMsZ0JBQXZCLEVBSlg7V0FQRjs7UUFjQSxJQUFBLEdBQVcsSUFBQSxJQUFBLENBQUssTUFBTDtRQUdYLE1BQUEsR0FBUztBQUNULGdCQUFPLFFBQVA7QUFBQSxlQUNPLE1BRFA7WUFFSSxNQUFBLEdBQVM7QUFETjtBQURQLGVBR08sTUFIUDtZQUlJLE1BQUEsR0FBUztBQUROO0FBSFAsZUFLTyxNQUxQO1lBTUksTUFBQSxHQUFTO0FBTmI7UUFRQSxZQUFBLEdBQWUsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBbkIsRUFBeUI7VUFDdEMsTUFBQSxFQUFRLE1BRDhCO1NBQXpCO2VBS2YsT0FBQSxDQUFRLFlBQVI7TUF4Q2tCLENBQVQ7SUFESDs7OztLQWQ4QjtBQUgxQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXHJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBKU0JlYXV0aWZ5IGV4dGVuZHMgQmVhdXRpZmllclxyXG4gIG5hbWU6IFwiQ1NTY29tYlwiXHJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vY3NzY29tYi9jc3Njb21iLmpzXCJcclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgIyBUT0RPOiBBZGQgc3VwcG9ydCBmb3Igb3B0aW9uc1xyXG4gICAgXzpcclxuICAgICAgY29uZmlnUGF0aDogdHJ1ZVxyXG4gICAgICBwcmVkZWZpbmVkQ29uZmlnOiB0cnVlXHJcbiAgICBDU1M6IHRydWVcclxuICAgIExFU1M6IHRydWVcclxuICAgIFNDU1M6IHRydWVcclxuICB9XHJcblxyXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XHJcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICAgICMgY29uc29sZS5sb2coJ0NTU0NvbWInLCB0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucylcclxuXHJcbiAgICAgICMgUmVxdWlyZVxyXG4gICAgICBDb21iID0gcmVxdWlyZSgnY3NzY29tYicpXHJcbiAgICAgIGV4cGFuZEhvbWVEaXIgPSByZXF1aXJlKCdleHBhbmQtaG9tZS1kaXInKVxyXG4gICAgICBDU09OID0gcmVxdWlyZSgnc2Vhc29uJylcclxuXHJcbiAgICAgIGNvbmZpZyA9IG51bGxcclxuICAgICAgdHJ5ICMgTG9hZCBmcm9tIHByb2plY3QgY29uZmlnIGZpbGUsIHRocm93aW5nIGVycm9yIGlmIG5laXRoZXIgZXhpc3RcclxuICAgICAgICBwcm9qZWN0ID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCk/WzBdXHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICBjb25maWcgPSBDU09OLnJlYWRGaWxlU3luYyhwcm9qZWN0Py5yZXNvbHZlICcuY3NzY29tYi5jc29uJylcclxuICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgY29uZmlnID0gcmVxdWlyZShwcm9qZWN0Py5yZXNvbHZlICcuY3NzY29tYi5qc29uJylcclxuICAgICAgY2F0Y2hcclxuICAgICAgICB0cnkgIyBMb2FkIGZyb20gY3VzdG9tIGNvbmZpZ1xyXG4gICAgICAgICAgY29uZmlnID0gQ1NPTi5yZWFkRmlsZVN5bmMoZXhwYW5kSG9tZURpciBvcHRpb25zLmNvbmZpZ1BhdGgpXHJcbiAgICAgICAgY2F0Y2hcclxuICAgICAgICAgICMgRmFsbGJhY2sgdG8gW3NlbGVjdGVkXSBDU1Njb21iIHByZWRpZmluZWQgY29uZmlnXHJcbiAgICAgICAgICBjb25maWcgPSBDb21iLmdldENvbmZpZyhvcHRpb25zLnByZWRlZmluZWRDb25maWcpXHJcbiAgICAgICMgY29uc29sZS5sb2coJ2NvbmZpZycsIGNvbmZpZywgb3B0aW9ucylcclxuICAgICAgIyBDb25maWd1cmVcclxuICAgICAgY29tYiA9IG5ldyBDb21iKGNvbmZpZylcclxuXHJcbiAgICAgICMgRGV0ZXJtaW5lIHN5bnRheCBmcm9tIExhbmd1YWdlXHJcbiAgICAgIHN5bnRheCA9IFwiY3NzXCIgIyBEZWZhdWx0XHJcbiAgICAgIHN3aXRjaCBsYW5ndWFnZVxyXG4gICAgICAgIHdoZW4gXCJMRVNTXCJcclxuICAgICAgICAgIHN5bnRheCA9IFwibGVzc1wiXHJcbiAgICAgICAgd2hlbiBcIlNDU1NcIlxyXG4gICAgICAgICAgc3ludGF4ID0gXCJzY3NzXCJcclxuICAgICAgICB3aGVuIFwiU2Fzc1wiXHJcbiAgICAgICAgICBzeW50YXggPSBcInNhc3NcIlxyXG4gICAgICAjIFVzZVxyXG4gICAgICBwcm9jZXNzZWRDU1MgPSBjb21iLnByb2Nlc3NTdHJpbmcodGV4dCwge1xyXG4gICAgICAgIHN5bnRheDogc3ludGF4XHJcbiAgICAgIH0pXHJcbiAgICAgICMgY29uc29sZS5sb2coJ3Byb2Nlc3NlZENTUycsIHByb2Nlc3NlZENTUywgc3ludGF4KVxyXG5cclxuICAgICAgcmVzb2x2ZShwcm9jZXNzZWRDU1MpXHJcbiAgICApXHJcbiJdfQ==
