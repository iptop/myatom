(function() {
  var Beautifier, Executable, Promise, _, fs, path, readFile, shellEnv, temp, which;

  Promise = require('bluebird');

  _ = require('lodash');

  fs = require('fs');

  temp = require('temp').track();

  readFile = Promise.promisify(fs.readFile);

  which = require('which');

  path = require('path');

  shellEnv = require('shell-env');

  Executable = require('./executable');

  module.exports = Beautifier = (function() {

    /*
    Promise
     */
    Beautifier.prototype.Promise = Promise;


    /*
    Name of Beautifier
     */

    Beautifier.prototype.name = 'Beautifier';


    /*
    Supported Options
    
    Enable options for supported languages.
    - <string:language>:<boolean:all_options_enabled>
    - <string:language>:<string:option_key>:<boolean:enabled>
    - <string:language>:<string:option_key>:<string:rename>
    - <string:language>:<string:option_key>:<function:transform>
    - <string:language>:<string:option_key>:<array:mapper>
     */

    Beautifier.prototype.options = {};

    Beautifier.prototype.executables = [];


    /*
    Is the beautifier a command-line interface beautifier?
     */

    Beautifier.prototype.isPreInstalled = function() {
      return this.executables.length === 0;
    };

    Beautifier.prototype._exe = {};

    Beautifier.prototype.loadExecutables = function() {
      var executables;
      this.debug("Load executables");
      if (Object.keys(this._exe).length === this.executables.length) {
        return Promise.resolve(this._exe);
      } else {
        return Promise.resolve(executables = this.executables.map(function(e) {
          return new Executable(e);
        })).then(function(executables) {
          return Promise.all(executables.map(function(exe) {
            return exe.init();
          }));
        }).then((function(_this) {
          return function(es) {
            var exe, missingInstalls;
            _this.debug("Executables loaded", es);
            exe = {};
            missingInstalls = [];
            es.forEach(function(e) {
              exe[e.cmd] = e;
              if (!e.isInstalled && e.required) {
                return missingInstalls.push(e);
              }
            });
            _this._exe = exe;
            _this.debug("exe", exe);
            if (missingInstalls.length === 0) {
              return _this._exe;
            } else {
              _this.debug("Missing required executables: " + (missingInstalls.map(function(e) {
                return e.cmd;
              }).join(' and ')) + ".");
              throw Executable.commandNotFoundError(missingInstalls[0].cmd);
            }
          };
        })(this))["catch"]((function(_this) {
          return function(error) {
            _this.debug("Error loading executables", error);
            return Promise.reject(error);
          };
        })(this));
      }
    };

    Beautifier.prototype.exe = function(cmd) {
      var e;
      console.log('exe', cmd, this._exe);
      e = this._exe[cmd];
      if (e == null) {
        throw Executable.commandNotFoundError(cmd);
      }
      return e;
    };


    /*
    Supported languages by this Beautifier
    
    Extracted from the keys of the `options` field.
     */

    Beautifier.prototype.languages = null;


    /*
    Beautify text
    
    Override this method in subclasses
     */

    Beautifier.prototype.beautify = null;


    /*
    Show deprecation warning to user.
     */

    Beautifier.prototype.deprecate = function(warning) {
      var ref;
      return (ref = atom.notifications) != null ? ref.addWarning(warning) : void 0;
    };

    Beautifier.prototype.deprecateOptionForExecutable = function(exeName, oldOption, newOption) {
      var deprecationMessage;
      deprecationMessage = "The \"" + oldOption + "\" configuration option has been deprecated. Please switch to using the option in section \"Executables\" (near the top) in subsection \"" + exeName + "\" labelled \"" + newOption + "\" in Atom-Beautify package settings.";
      return this.deprecate(deprecationMessage);
    };


    /*
    Create temporary file
     */

    Beautifier.prototype.tempFile = function(name, contents, ext) {
      if (name == null) {
        name = "atom-beautify-temp";
      }
      if (contents == null) {
        contents = "";
      }
      if (ext == null) {
        ext = "";
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return temp.open({
            prefix: name,
            suffix: ext
          }, function(err, info) {
            _this.debug('tempFile', name, err, info);
            if (err) {
              return reject(err);
            }
            return fs.write(info.fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(info.fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(info.path);
              });
            });
          });
        };
      })(this));
    };


    /*
    Read file
     */

    Beautifier.prototype.readFile = function(filePath) {
      return Promise.resolve(filePath).then(function(filePath) {
        return readFile(filePath, "utf8");
      });
    };


    /*
    Find file
     */

    Beautifier.prototype.findFile = function(startDir, fileNames) {
      var currentDir, fileName, filePath, i, len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (i = 0, len = fileNames.length; i < len; i++) {
          fileName = fileNames[i];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (error1) {}
        }
        startDir.pop();
      }
      return null;
    };

    Beautifier.prototype.getDefaultLineEnding = function(crlf, lf, optionEol) {
      if (!optionEol || optionEol === 'System Default') {
        optionEol = atom.config.get('line-ending-selector.defaultLineEnding');
      }
      switch (optionEol) {
        case 'LF':
          return lf;
        case 'CRLF':
          return crlf;
        case 'OS Default':
          if (process.platform === 'win32') {
            return crlf;
          } else {
            return lf;
          }
        default:
          return lf;
      }
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Beautifier.prototype.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      return Executable.which(exe, options);
    };


    /*
    Run command-line interface command
     */

    Beautifier.prototype.run = function(executable, args, arg) {
      var cwd, exe, help, ignoreReturnCode, onStdin, ref;
      ref = arg != null ? arg : {}, cwd = ref.cwd, ignoreReturnCode = ref.ignoreReturnCode, help = ref.help, onStdin = ref.onStdin;
      exe = new Executable({
        name: this.name,
        homepage: this.link,
        installation: this.link,
        cmd: executable
      });
      if (help == null) {
        help = {
          program: executable,
          link: this.link,
          pathOption: void 0
        };
      }
      return exe.run(args, {
        cwd: cwd,
        ignoreReturnCode: ignoreReturnCode,
        help: help,
        onStdin: onStdin
      });
    };


    /*
    Logger instance
     */

    Beautifier.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Beautifier.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(__filename);
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          ref = this.options;
          for (lang in ref) {
            options = ref[lang];
            if (typeof options === "boolean") {
              if (options === true) {
                this.options[lang] = globalOptions;
              }
            } else if (typeof options === "object") {
              this.options[lang] = _.merge(globalOptions, options);
            } else {
              this.warn(("Unsupported options type " + (typeof options) + " for language " + lang + ": ") + options);
            }
          }
        }
      }
      this.verbose("Options for " + this.name + ":", this.options);
      this.languages = _.keys(this.options);
    }

    return Beautifier;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNWLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxLQUFoQixDQUFBOztFQUNQLFFBQUEsR0FBVyxPQUFPLENBQUMsU0FBUixDQUFrQixFQUFFLENBQUMsUUFBckI7O0VBQ1gsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxRQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVI7O0VBQ1gsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOztBQUVyQjs7O3lCQUdBLE9BQUEsR0FBUzs7O0FBRVQ7Ozs7eUJBR0EsSUFBQSxHQUFNOzs7QUFFTjs7Ozs7Ozs7Ozs7eUJBVUEsT0FBQSxHQUFTOzt5QkFFVCxXQUFBLEdBQWE7OztBQUViOzs7O3lCQUdBLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBYixLQUF1QjtJQURUOzt5QkFHaEIsSUFBQSxHQUFNOzt5QkFDTixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxrQkFBUDtNQUNBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsSUFBYixDQUFrQixDQUFDLE1BQW5CLEtBQTZCLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBN0M7ZUFDRSxPQUFPLENBQUMsT0FBUixDQUFn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LElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFULEdBQWlCLGNBRG5CO2VBREY7YUFBQSxNQUdLLElBQUcsT0FBTyxPQUFQLEtBQWtCLFFBQXJCO2NBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBLENBQVQsR0FBaUIsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxhQUFSLEVBQXVCLE9BQXZCLEVBRGQ7YUFBQSxNQUFBO2NBR0gsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFBLDJCQUFBLEdBQTJCLENBQUMsT0FBTyxPQUFSLENBQTNCLEdBQTJDLGdCQUEzQyxHQUEyRCxJQUEzRCxHQUFnRSxJQUFoRSxDQUFBLEdBQXFFLE9BQTNFLEVBSEc7O0FBTFAsV0FGRjtTQUpGOztNQWVBLElBQUMsQ0FBQSxPQUFELENBQVMsY0FBQSxHQUFlLElBQUMsQ0FBQSxJQUFoQixHQUFxQixHQUE5QixFQUFrQyxJQUFDLENBQUEsT0FBbkM7TUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLE9BQVI7SUFyQkY7Ozs7O0FBM05mIiwic291cmNlc0NvbnRlbnQiOlsiUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJylcclxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXHJcbmZzID0gcmVxdWlyZSgnZnMnKVxyXG50ZW1wID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcclxucmVhZEZpbGUgPSBQcm9taXNlLnByb21pc2lmeShmcy5yZWFkRmlsZSlcclxud2hpY2ggPSByZXF1aXJlKCd3aGljaCcpXHJcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcclxuc2hlbGxFbnYgPSByZXF1aXJlKCdzaGVsbC1lbnYnKVxyXG5FeGVjdXRhYmxlID0gcmVxdWlyZSgnLi9leGVjdXRhYmxlJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmVhdXRpZmllclxyXG5cclxuICAjIyNcclxuICBQcm9taXNlXHJcbiAgIyMjXHJcbiAgUHJvbWlzZTogUHJvbWlzZVxyXG5cclxuICAjIyNcclxuICBOYW1lIG9mIEJlYXV0aWZpZXJcclxuICAjIyNcclxuICBuYW1lOiAnQmVhdXRpZmllcidcclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIE9wdGlvbnNcclxuXHJcbiAgRW5hYmxlIG9wdGlvbnMgZm9yIHN1cHBvcnRlZCBsYW5ndWFnZXMuXHJcbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8Ym9vbGVhbjphbGxfb3B0aW9uc19lbmFibGVkPlxyXG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8Ym9vbGVhbjplbmFibGVkPlxyXG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8c3RyaW5nOnJlbmFtZT5cclxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PGZ1bmN0aW9uOnRyYW5zZm9ybT5cclxuICAtIDxzdHJpbmc6bGFuZ3VhZ2U+OjxzdHJpbmc6b3B0aW9uX2tleT46PGFycmF5Om1hcHBlcj5cclxuICAjIyNcclxuICBvcHRpb25zOiB7fVxyXG5cclxuICBleGVjdXRhYmxlczogW11cclxuXHJcbiAgIyMjXHJcbiAgSXMgdGhlIGJlYXV0aWZpZXIgYSBjb21tYW5kLWxpbmUgaW50ZXJmYWNlIGJlYXV0aWZpZXI/XHJcbiAgIyMjXHJcbiAgaXNQcmVJbnN0YWxsZWQ6ICgpIC0+XHJcbiAgICBAZXhlY3V0YWJsZXMubGVuZ3RoIGlzIDBcclxuXHJcbiAgX2V4ZToge31cclxuICBsb2FkRXhlY3V0YWJsZXM6ICgpIC0+XHJcbiAgICBAZGVidWcoXCJMb2FkIGV4ZWN1dGFibGVzXCIpXHJcbiAgICBpZiBPYmplY3Qua2V5cyhAX2V4ZSkubGVuZ3RoIGlzIEBleGVjdXRhYmxlcy5sZW5ndGhcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKEBfZXhlKVxyXG4gICAgZWxzZVxyXG4gICAgICBQcm9taXNlLnJlc29sdmUoZXhlY3V0YWJsZXMgPSBAZXhlY3V0YWJsZXMubWFwKChlKSAtPiBuZXcgRXhlY3V0YWJsZShlKSkpXHJcbiAgICAgICAgLnRoZW4oKGV4ZWN1dGFibGVzKSAtPiBQcm9taXNlLmFsbChleGVjdXRhYmxlcy5tYXAoKGV4ZSkgLT4gZXhlLmluaXQoKSkpKVxyXG4gICAgICAgIC50aGVuKChlcykgPT5cclxuICAgICAgICAgIEBkZWJ1ZyhcIkV4ZWN1dGFibGVzIGxvYWRlZFwiLCBlcylcclxuICAgICAgICAgIGV4ZSA9IHt9XHJcbiAgICAgICAgICBtaXNzaW5nSW5zdGFsbHMgPSBbXVxyXG4gICAgICAgICAgZXMuZm9yRWFjaCgoZSkgLT5cclxuICAgICAgICAgICAgZXhlW2UuY21kXSA9IGVcclxuICAgICAgICAgICAgaWYgbm90IGUuaXNJbnN0YWxsZWQgYW5kIGUucmVxdWlyZWRcclxuICAgICAgICAgICAgICBtaXNzaW5nSW5zdGFsbHMucHVzaChlKVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgICAgQF9leGUgPSBleGVcclxuICAgICAgICAgIEBkZWJ1ZyhcImV4ZVwiLCBleGUpXHJcbiAgICAgICAgICBpZiBtaXNzaW5nSW5zdGFsbHMubGVuZ3RoIGlzIDBcclxuICAgICAgICAgICAgcmV0dXJuIEBfZXhlXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIEBkZWJ1ZyhcIk1pc3NpbmcgcmVxdWlyZWQgZXhlY3V0YWJsZXM6ICN7bWlzc2luZ0luc3RhbGxzLm1hcCgoZSkgLT4gZS5jbWQpLmpvaW4oJyBhbmQgJyl9LlwiKVxyXG4gICAgICAgICAgICB0aHJvdyBFeGVjdXRhYmxlLmNvbW1hbmROb3RGb3VuZEVycm9yKG1pc3NpbmdJbnN0YWxsc1swXS5jbWQpXHJcbiAgICAgICAgKVxyXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+XHJcbiAgICAgICAgICBAZGVidWcoXCJFcnJvciBsb2FkaW5nIGV4ZWN1dGFibGVzXCIsIGVycm9yKVxyXG4gICAgICAgICAgUHJvbWlzZS5yZWplY3QoZXJyb3IpXHJcbiAgICAgICAgKVxyXG4gIGV4ZTogKGNtZCkgLT5cclxuICAgIGNvbnNvbGUubG9nKCdleGUnLCBjbWQsIEBfZXhlKVxyXG4gICAgZSA9IEBfZXhlW2NtZF1cclxuICAgIGlmICFlP1xyXG4gICAgICB0aHJvdyBFeGVjdXRhYmxlLmNvbW1hbmROb3RGb3VuZEVycm9yKGNtZClcclxuICAgIGVcclxuXHJcbiAgIyMjXHJcbiAgU3VwcG9ydGVkIGxhbmd1YWdlcyBieSB0aGlzIEJlYXV0aWZpZXJcclxuXHJcbiAgRXh0cmFjdGVkIGZyb20gdGhlIGtleXMgb2YgdGhlIGBvcHRpb25zYCBmaWVsZC5cclxuICAjIyNcclxuICBsYW5ndWFnZXM6IG51bGxcclxuXHJcbiAgIyMjXHJcbiAgQmVhdXRpZnkgdGV4dFxyXG5cclxuICBPdmVycmlkZSB0aGlzIG1ldGhvZCBpbiBzdWJjbGFzc2VzXHJcbiAgIyMjXHJcbiAgYmVhdXRpZnk6IG51bGxcclxuXHJcbiAgIyMjXHJcbiAgU2hvdyBkZXByZWNhdGlvbiB3YXJuaW5nIHRvIHVzZXIuXHJcbiAgIyMjXHJcbiAgZGVwcmVjYXRlOiAod2FybmluZykgLT5cclxuICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkV2FybmluZyh3YXJuaW5nKVxyXG5cclxuICBkZXByZWNhdGVPcHRpb25Gb3JFeGVjdXRhYmxlOiAoZXhlTmFtZSwgb2xkT3B0aW9uLCBuZXdPcHRpb24pIC0+XHJcbiAgICBkZXByZWNhdGlvbk1lc3NhZ2UgPSBcIlRoZSBcXFwiI3tvbGRPcHRpb259XFxcIiBjb25maWd1cmF0aW9uIG9wdGlvbiBoYXMgYmVlbiBkZXByZWNhdGVkLiBQbGVhc2Ugc3dpdGNoIHRvIHVzaW5nIHRoZSBvcHRpb24gaW4gc2VjdGlvbiBcXFwiRXhlY3V0YWJsZXNcXFwiIChuZWFyIHRoZSB0b3ApIGluIHN1YnNlY3Rpb24gXFxcIiN7ZXhlTmFtZX1cXFwiIGxhYmVsbGVkIFxcXCIje25ld09wdGlvbn1cXFwiIGluIEF0b20tQmVhdXRpZnkgcGFja2FnZSBzZXR0aW5ncy5cIlxyXG4gICAgQGRlcHJlY2F0ZShkZXByZWNhdGlvbk1lc3NhZ2UpXHJcblxyXG4gICMjI1xyXG4gIENyZWF0ZSB0ZW1wb3JhcnkgZmlsZVxyXG4gICMjI1xyXG4gIHRlbXBGaWxlOiAobmFtZSA9IFwiYXRvbS1iZWF1dGlmeS10ZW1wXCIsIGNvbnRlbnRzID0gXCJcIiwgZXh0ID0gXCJcIikgLT5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxyXG4gICAgICAjIGNyZWF0ZSB0ZW1wIGZpbGVcclxuICAgICAgdGVtcC5vcGVuKHtwcmVmaXg6IG5hbWUsIHN1ZmZpeDogZXh0fSwgKGVyciwgaW5mbykgPT5cclxuICAgICAgICBAZGVidWcoJ3RlbXBGaWxlJywgbmFtZSwgZXJyLCBpbmZvKVxyXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcclxuICAgICAgICBmcy53cml0ZShpbmZvLmZkLCBjb250ZW50cywgKGVycikgLT5cclxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcclxuICAgICAgICAgIGZzLmNsb3NlKGluZm8uZmQsIChlcnIpIC0+XHJcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcclxuICAgICAgICAgICAgcmVzb2x2ZShpbmZvLnBhdGgpXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcbiAgICApXHJcblxyXG4gICMjI1xyXG4gIFJlYWQgZmlsZVxyXG4gICMjI1xyXG4gIHJlYWRGaWxlOiAoZmlsZVBhdGgpIC0+XHJcbiAgICBQcm9taXNlLnJlc29sdmUoZmlsZVBhdGgpXHJcbiAgICAudGhlbigoZmlsZVBhdGgpIC0+XHJcbiAgICAgIHJldHVybiByZWFkRmlsZShmaWxlUGF0aCwgXCJ1dGY4XCIpXHJcbiAgICApXHJcblxyXG4gICMjI1xyXG4gIEZpbmQgZmlsZVxyXG4gICMjI1xyXG4gIGZpbmRGaWxlOiAoc3RhcnREaXIsIGZpbGVOYW1lcykgLT5cclxuICAgIHRocm93IG5ldyBFcnJvciBcIlNwZWNpZnkgZmlsZSBuYW1lcyB0byBmaW5kLlwiIHVubGVzcyBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICB1bmxlc3MgZmlsZU5hbWVzIGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgZmlsZU5hbWVzID0gW2ZpbGVOYW1lc11cclxuICAgIHN0YXJ0RGlyID0gc3RhcnREaXIuc3BsaXQocGF0aC5zZXApXHJcbiAgICB3aGlsZSBzdGFydERpci5sZW5ndGhcclxuICAgICAgY3VycmVudERpciA9IHN0YXJ0RGlyLmpvaW4ocGF0aC5zZXApXHJcbiAgICAgIGZvciBmaWxlTmFtZSBpbiBmaWxlTmFtZXNcclxuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihjdXJyZW50RGlyLCBmaWxlTmFtZSlcclxuICAgICAgICB0cnlcclxuICAgICAgICAgIGZzLmFjY2Vzc1N5bmMoZmlsZVBhdGgsIGZzLlJfT0spXHJcbiAgICAgICAgICByZXR1cm4gZmlsZVBhdGhcclxuICAgICAgc3RhcnREaXIucG9wKClcclxuICAgIHJldHVybiBudWxsXHJcblxyXG4gICMgUmV0cmlldmVzIHRoZSBkZWZhdWx0IGxpbmUgZW5kaW5nIGJhc2VkIHVwb24gdGhlIEF0b20gY29uZmlndXJhdGlvblxyXG4gICMgIGBsaW5lLWVuZGluZy1zZWxlY3Rvci5kZWZhdWx0TGluZUVuZGluZ2AuIElmIHRoZSBBdG9tIGNvbmZpZ3VyYXRpb25cclxuICAjICBpbmRpY2F0ZXMgXCJPUyBEZWZhdWx0XCIsIHRoZSBgcHJvY2Vzcy5wbGF0Zm9ybWAgaXMgcXVlcmllZCwgcmV0dXJuaW5nXHJcbiAgIyAgQ1JMRiBmb3IgV2luZG93cyBzeXN0ZW1zIGFuZCBMRiBmb3IgYWxsIG90aGVyIHN5c3RlbXMuXHJcbiAgIyBDb2RlIG1vZGlmaWVkIGZyb20gYXRvbS9saW5lLWVuZGluZy1zZWxlY3RvclxyXG4gICMgcmV0dXJuczogVGhlIGNvcnJlY3QgbGluZS1lbmRpbmcgY2hhcmFjdGVyIHNlcXVlbmNlIGJhc2VkIHVwb24gdGhlIEF0b21cclxuICAjICBjb25maWd1cmF0aW9uLCBvciBgbnVsbGAgaWYgdGhlIEF0b20gbGluZSBlbmRpbmcgY29uZmlndXJhdGlvbiB3YXMgbm90XHJcbiAgIyAgcmVjb2duaXplZC5cclxuICAjIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vbGluZS1lbmRpbmctc2VsZWN0b3IvYmxvYi9tYXN0ZXIvbGliL21haW4uanNcclxuICBnZXREZWZhdWx0TGluZUVuZGluZzogKGNybGYsbGYsb3B0aW9uRW9sKSAtPlxyXG4gICAgaWYgKCFvcHRpb25Fb2wgfHwgb3B0aW9uRW9sID09ICdTeXN0ZW0gRGVmYXVsdCcpXHJcbiAgICAgIG9wdGlvbkVvbCA9IGF0b20uY29uZmlnLmdldCgnbGluZS1lbmRpbmctc2VsZWN0b3IuZGVmYXVsdExpbmVFbmRpbmcnKVxyXG4gICAgc3dpdGNoIG9wdGlvbkVvbFxyXG4gICAgICB3aGVuICdMRidcclxuICAgICAgICByZXR1cm4gbGZcclxuICAgICAgd2hlbiAnQ1JMRidcclxuICAgICAgICByZXR1cm4gY3JsZlxyXG4gICAgICB3aGVuICdPUyBEZWZhdWx0J1xyXG4gICAgICAgIHJldHVybiBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMicgdGhlbiBjcmxmIGVsc2UgbGZcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVybiBsZlxyXG5cclxuICAjIyNcclxuICBMaWtlIHRoZSB1bml4IHdoaWNoIHV0aWxpdHkuXHJcblxyXG4gIEZpbmRzIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhIHNwZWNpZmllZCBleGVjdXRhYmxlIGluIHRoZSBQQVRIIGVudmlyb25tZW50IHZhcmlhYmxlLlxyXG4gIERvZXMgbm90IGNhY2hlIHRoZSByZXN1bHRzLFxyXG4gIHNvIGhhc2ggLXIgaXMgbm90IG5lZWRlZCB3aGVuIHRoZSBQQVRIIGNoYW5nZXMuXHJcbiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS13aGljaFxyXG4gICMjI1xyXG4gIHdoaWNoOiAoZXhlLCBvcHRpb25zID0ge30pIC0+XHJcbiAgICAjIEBkZXByZWNhdGUoXCJCZWF1dGlmaWVyLndoaWNoIGZ1bmN0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgRXhlY3V0YWJsZXMuXCIpXHJcbiAgICBFeGVjdXRhYmxlLndoaWNoKGV4ZSwgb3B0aW9ucylcclxuXHJcbiAgIyMjXHJcbiAgUnVuIGNvbW1hbmQtbGluZSBpbnRlcmZhY2UgY29tbWFuZFxyXG4gICMjI1xyXG4gIHJ1bjogKGV4ZWN1dGFibGUsIGFyZ3MsIHtjd2QsIGlnbm9yZVJldHVybkNvZGUsIGhlbHAsIG9uU3RkaW59ID0ge30pIC0+XHJcbiAgICAjIEBkZXByZWNhdGUoXCJCZWF1dGlmaWVyLnJ1biBmdW5jdGlvbiBoYXMgYmVlbiBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIEV4ZWN1dGFibGVzLlwiKVxyXG4gICAgZXhlID0gbmV3IEV4ZWN1dGFibGUoe1xyXG4gICAgICBuYW1lOiBAbmFtZVxyXG4gICAgICBob21lcGFnZTogQGxpbmtcclxuICAgICAgaW5zdGFsbGF0aW9uOiBAbGlua1xyXG4gICAgICBjbWQ6IGV4ZWN1dGFibGVcclxuICAgIH0pXHJcbiAgICBoZWxwID89IHtcclxuICAgICAgcHJvZ3JhbTogZXhlY3V0YWJsZVxyXG4gICAgICBsaW5rOiBAbGlua1xyXG4gICAgICBwYXRoT3B0aW9uOiB1bmRlZmluZWRcclxuICAgIH1cclxuICAgIGV4ZS5ydW4oYXJncywge2N3ZCwgaWdub3JlUmV0dXJuQ29kZSwgaGVscCwgb25TdGRpbn0pXHJcblxyXG4gICMjI1xyXG4gIExvZ2dlciBpbnN0YW5jZVxyXG4gICMjI1xyXG4gIGxvZ2dlcjogbnVsbFxyXG4gICMjI1xyXG4gIEluaXRpYWxpemUgYW5kIGNvbmZpZ3VyZSBMb2dnZXJcclxuICAjIyNcclxuICBzZXR1cExvZ2dlcjogLT5cclxuICAgIEBsb2dnZXIgPSByZXF1aXJlKCcuLi9sb2dnZXInKShfX2ZpbGVuYW1lKVxyXG4gICAgIyBAdmVyYm9zZShAbG9nZ2VyKVxyXG4gICAgIyBNZXJnZSBsb2dnZXIgbWV0aG9kcyBpbnRvIGJlYXV0aWZpZXIgY2xhc3NcclxuICAgIGZvciBrZXksIG1ldGhvZCBvZiBAbG9nZ2VyXHJcbiAgICAgICMgQHZlcmJvc2Uoa2V5LCBtZXRob2QpXHJcbiAgICAgIEBba2V5XSA9IG1ldGhvZFxyXG4gICAgQHZlcmJvc2UoXCIje0BuYW1lfSBiZWF1dGlmaWVyIGxvZ2dlciBoYXMgYmVlbiBpbml0aWFsaXplZC5cIilcclxuXHJcbiAgIyMjXHJcbiAgQ29uc3RydWN0b3IgdG8gc2V0dXAgYmVhdXRpZmVyXHJcbiAgIyMjXHJcbiAgY29uc3RydWN0b3I6ICgpIC0+XHJcbiAgICAjIFNldHVwIGxvZ2dlclxyXG4gICAgQHNldHVwTG9nZ2VyKClcclxuICAgICMgSGFuZGxlIGdsb2JhbCBvcHRpb25zXHJcbiAgICBpZiBAb3B0aW9ucy5fP1xyXG4gICAgICBnbG9iYWxPcHRpb25zID0gQG9wdGlvbnMuX1xyXG4gICAgICBkZWxldGUgQG9wdGlvbnMuX1xyXG4gICAgICAjIE9ubHkgbWVyZ2UgaWYgZ2xvYmFsT3B0aW9ucyBpcyBhbiBvYmplY3RcclxuICAgICAgaWYgdHlwZW9mIGdsb2JhbE9wdGlvbnMgaXMgXCJvYmplY3RcIlxyXG4gICAgICAgICMgSXRlcmF0ZSBvdmVyIGFsbCBzdXBwb3J0ZWQgbGFuZ3VhZ2VzXHJcbiAgICAgICAgZm9yIGxhbmcsIG9wdGlvbnMgb2YgQG9wdGlvbnNcclxuICAgICAgICAgICNcclxuICAgICAgICAgIGlmIHR5cGVvZiBvcHRpb25zIGlzIFwiYm9vbGVhblwiXHJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMgaXMgdHJ1ZVxyXG4gICAgICAgICAgICAgIEBvcHRpb25zW2xhbmddID0gZ2xvYmFsT3B0aW9uc1xyXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2Ygb3B0aW9ucyBpcyBcIm9iamVjdFwiXHJcbiAgICAgICAgICAgIEBvcHRpb25zW2xhbmddID0gXy5tZXJnZShnbG9iYWxPcHRpb25zLCBvcHRpb25zKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBAd2FybihcIlVuc3VwcG9ydGVkIG9wdGlvbnMgdHlwZSAje3R5cGVvZiBvcHRpb25zfSBmb3IgbGFuZ3VhZ2UgI3tsYW5nfTogXCIrIG9wdGlvbnMpXHJcbiAgICBAdmVyYm9zZShcIk9wdGlvbnMgZm9yICN7QG5hbWV9OlwiLCBAb3B0aW9ucylcclxuICAgICMgU2V0IHN1cHBvcnRlZCBsYW5ndWFnZXNcclxuICAgIEBsYW5ndWFnZXMgPSBfLmtleXMoQG9wdGlvbnMpXHJcbiJdfQ==
