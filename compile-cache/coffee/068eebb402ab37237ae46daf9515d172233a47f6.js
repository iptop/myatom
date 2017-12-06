(function() {
  var Executable, HybridExecutable, Promise, _, fs, os, parentConfigKey, path, semver, spawn, which,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Promise = require('bluebird');

  _ = require('lodash');

  which = require('which');

  spawn = require('child_process').spawn;

  path = require('path');

  semver = require('semver');

  os = require('os');

  fs = require('fs');

  parentConfigKey = "atom-beautify.executables";

  Executable = (function() {
    var isInstalled, version;

    Executable.prototype.name = null;

    Executable.prototype.cmd = null;

    Executable.prototype.key = null;

    Executable.prototype.homepage = null;

    Executable.prototype.installation = null;

    Executable.prototype.versionArgs = ['--version'];

    Executable.prototype.versionParse = function(text) {
      return semver.clean(text);
    };

    Executable.prototype.versionRunOptions = {};

    Executable.prototype.versionsSupported = '>= 0.0.0';

    Executable.prototype.required = true;

    function Executable(options) {
      var versionOptions;
      if (options.cmd == null) {
        throw new Error("The command (i.e. cmd property) is required for an Executable.");
      }
      this.name = options.name;
      this.cmd = options.cmd;
      this.key = this.cmd;
      this.homepage = options.homepage;
      this.installation = options.installation;
      this.required = !options.optional;
      if (options.version != null) {
        versionOptions = options.version;
        if (versionOptions.args) {
          this.versionArgs = versionOptions.args;
        }
        if (versionOptions.parse) {
          this.versionParse = versionOptions.parse;
        }
        if (versionOptions.runOptions) {
          this.versionRunOptions = versionOptions.runOptions;
        }
        if (versionOptions.supported) {
          this.versionsSupported = versionOptions.supported;
        }
      }
      this.setupLogger();
    }

    Executable.prototype.init = function() {
      return Promise.all([this.loadVersion()]).then((function(_this) {
        return function() {
          return _this.verbose("Done init of " + _this.name);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          if (!_this.required) {
            return _this;
          } else {
            return Promise.reject(error);
          }
        };
      })(this));
    };


    /*
    Logger instance
     */

    Executable.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Executable.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(this.name + " Executable");
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " executable logger has been initialized.");
    };

    isInstalled = null;

    version = null;

    Executable.prototype.loadVersion = function(force) {
      if (force == null) {
        force = false;
      }
      this.verbose("loadVersion", this.version, force);
      if (force || (this.version == null)) {
        this.verbose("Loading version without cache");
        return this.runVersion().then((function(_this) {
          return function(text) {
            return _this.saveVersion(text);
          };
        })(this));
      } else {
        this.verbose("Loading cached version");
        return Promise.resolve(this.version);
      }
    };

    Executable.prototype.runVersion = function() {
      return this.run(this.versionArgs, this.versionRunOptions).then((function(_this) {
        return function(version) {
          _this.info("Version text: " + version);
          return version;
        };
      })(this));
    };

    Executable.prototype.saveVersion = function(text) {
      return Promise.resolve().then((function(_this) {
        return function() {
          return _this.versionParse(text);
        };
      })(this)).then(function(version) {
        var valid;
        valid = Boolean(semver.valid(version));
        if (!valid) {
          throw new Error("Version is not valid: " + version);
        }
        return version;
      }).then((function(_this) {
        return function(version) {
          _this.isInstalled = true;
          return _this.version = version;
        };
      })(this)).then((function(_this) {
        return function(version) {
          _this.info(_this.cmd + " version: " + version);
          return version;
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          var help;
          _this.isInstalled = false;
          _this.error(error);
          help = {
            program: _this.cmd,
            link: _this.installation || _this.homepage,
            pathOption: "Executable - " + (_this.name || _this.cmd) + " - Path"
          };
          return Promise.reject(_this.commandNotFoundError(_this.name || _this.cmd, help));
        };
      })(this));
    };

    Executable.prototype.isSupported = function() {
      return this.isVersion(this.versionsSupported);
    };

    Executable.prototype.isVersion = function(range) {
      return this.versionSatisfies(this.version, range);
    };

    Executable.prototype.versionSatisfies = function(version, range) {
      return semver.satisfies(version, range);
    };

    Executable.prototype.getConfig = function() {
      return (typeof atom !== "undefined" && atom !== null ? atom.config.get(parentConfigKey + "." + this.key) : void 0) || {};
    };


    /*
    Run command-line interface command
     */

    Executable.prototype.run = function(args, options) {
      var cmd, cwd, exeName, help, ignoreReturnCode, onStdin, returnStderr, returnStdoutOrStderr;
      if (options == null) {
        options = {};
      }
      this.debug("Run: ", this.cmd, args, options);
      cmd = options.cmd, cwd = options.cwd, ignoreReturnCode = options.ignoreReturnCode, help = options.help, onStdin = options.onStdin, returnStderr = options.returnStderr, returnStdoutOrStderr = options.returnStdoutOrStderr;
      exeName = cmd || this.cmd;
      if (cwd == null) {
        cwd = os.tmpDir();
      }
      if (help == null) {
        help = {
          program: this.cmd,
          link: this.installation || this.homepage,
          pathOption: "Executable - " + (this.name || this.cmd) + " - Path"
        };
      }
      return Promise.all([this.shellEnv(), this.resolveArgs(args)]).then((function(_this) {
        return function(arg1) {
          var args, env, exePath;
          env = arg1[0], args = arg1[1];
          _this.debug('exeName, args:', exeName, args);
          exePath = _this.path(exeName);
          return Promise.all([exeName, args, env, exePath]);
        };
      })(this)).then((function(_this) {
        return function(arg1) {
          var args, env, exe, exeName, exePath, spawnOptions;
          exeName = arg1[0], args = arg1[1], env = arg1[2], exePath = arg1[3];
          _this.debug('exePath:', exePath);
          _this.debug('env:', env);
          _this.debug('PATH:', env.PATH);
          _this.debug('args', args);
          args = _this.relativizePaths(args);
          _this.debug('relativized args', args);
          exe = exePath != null ? exePath : exeName;
          spawnOptions = {
            cwd: cwd,
            env: env
          };
          _this.debug('spawnOptions', spawnOptions);
          return _this.spawn(exe, args, spawnOptions, onStdin).then(function(arg2) {
            var returnCode, stderr, stdout, windowsProgramNotFoundMsg;
            returnCode = arg2.returnCode, stdout = arg2.stdout, stderr = arg2.stderr;
            _this.verbose('spawn result, returnCode', returnCode);
            _this.verbose('spawn result, stdout', stdout);
            _this.verbose('spawn result, stderr', stderr);
            if (!ignoreReturnCode && returnCode !== 0) {
              windowsProgramNotFoundMsg = "is not recognized as an internal or external command";
              _this.verbose(stderr, windowsProgramNotFoundMsg);
              if (_this.isWindows() && returnCode === 1 && stderr.indexOf(windowsProgramNotFoundMsg) !== -1) {
                throw _this.commandNotFoundError(exeName, help);
              } else {
                throw new Error(stderr || stdout);
              }
            } else {
              if (returnStdoutOrStderr) {
                return stdout || stderr;
              } else if (returnStderr) {
                return stderr;
              } else {
                return stdout;
              }
            }
          })["catch"](function(err) {
            _this.debug('error', err);
            if (err.code === 'ENOENT' || err.errno === 'ENOENT') {
              throw _this.commandNotFoundError(exeName, help);
            } else {
              throw err;
            }
          });
        };
      })(this));
    };

    Executable.prototype.path = function(cmd) {
      var config, exeName;
      if (cmd == null) {
        cmd = this.cmd;
      }
      config = this.getConfig();
      if (config && config.path) {
        return Promise.resolve(config.path);
      } else {
        exeName = cmd;
        return this.which(exeName);
      }
    };

    Executable.prototype.resolveArgs = function(args) {
      args = _.flatten(args);
      return Promise.all(args);
    };

    Executable.prototype.relativizePaths = function(args) {
      var newArgs, tmpDir;
      tmpDir = os.tmpDir();
      newArgs = args.map(function(arg) {
        var isTmpFile;
        isTmpFile = typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && path.dirname(arg).startsWith(tmpDir);
        if (isTmpFile) {
          return path.relative(tmpDir, arg);
        }
        return arg;
      });
      return newArgs;
    };


    /*
    Spawn
     */

    Executable.prototype.spawn = function(exe, args, options, onStdin) {
      args = _.without(args, void 0);
      args = _.without(args, null);
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var cmd, stderr, stdout;
          _this.debug('spawn', exe, args);
          cmd = spawn(exe, args, options);
          stdout = "";
          stderr = "";
          cmd.stdout.on('data', function(data) {
            return stdout += data;
          });
          cmd.stderr.on('data', function(data) {
            return stderr += data;
          });
          cmd.on('close', function(returnCode) {
            _this.debug('spawn done', returnCode, stderr, stdout);
            return resolve({
              returnCode: returnCode,
              stdout: stdout,
              stderr: stderr
            });
          });
          cmd.on('error', function(err) {
            _this.debug('error', err);
            return reject(err);
          });
          if (onStdin) {
            return onStdin(cmd.stdin);
          }
        };
      })(this));
    };


    /*
    Add help to error.description
    
    Note: error.description is not officially used in JavaScript,
    however it is used internally for Atom Beautify when displaying errors.
     */

    Executable.prototype.commandNotFoundError = function(exe, help) {
      if (exe == null) {
        exe = this.name || this.cmd;
      }
      return this.constructor.commandNotFoundError(exe, help);
    };

    Executable.commandNotFoundError = function(exe, help) {
      var docsLink, er, helpStr, message;
      message = "Could not find '" + exe + "'. The program may not be installed.";
      er = new Error(message);
      er.code = 'CommandNotFound';
      er.errno = er.code;
      er.syscall = 'beautifier::run';
      er.file = exe;
      if (help != null) {
        if (typeof help === "object") {
          docsLink = "https://github.com/Glavin001/atom-beautify#beautifiers";
          helpStr = "See " + exe + " installation instructions at " + docsLink + (help.link ? ' or go to ' + help.link : '') + "\n";
          if (help.pathOption) {
            helpStr += "You can configure Atom Beautify with the absolute path to '" + (help.program || exe) + "' by setting '" + help.pathOption + "' in the Atom Beautify package settings.\n";
          }
          helpStr += "Your program is properly installed if running '" + (this.isWindows() ? 'where.exe' : 'which') + " " + exe + "' in your " + (this.isWindows() ? 'CMD prompt' : 'Terminal') + " returns an absolute path to the executable.\n";
          if (help.additional) {
            helpStr += help.additional;
          }
          er.description = helpStr;
        } else {
          er.description = help;
        }
      }
      return er;
    };

    Executable._envCache = null;

    Executable.prototype.shellEnv = function() {
      var env;
      env = this.constructor.shellEnv();
      this.debug("env", env);
      return env;
    };

    Executable.shellEnv = function() {
      return Promise.resolve(process.env);
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Executable.prototype.which = function(exe, options) {
      return this.constructor.which(exe, options);
    };

    Executable._whichCache = {};

    Executable.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      if (this._whichCache[exe]) {
        return Promise.resolve(this._whichCache[exe]);
      }
      return this.shellEnv().then((function(_this) {
        return function(env) {
          return new Promise(function(resolve, reject) {
            var i, ref;
            if (options.path == null) {
              options.path = env.PATH;
            }
            if (_this.isWindows()) {
              if (!options.path) {
                for (i in env) {
                  if (i.toLowerCase() === "path") {
                    options.path = env[i];
                    break;
                  }
                }
              }
              if (options.pathExt == null) {
                options.pathExt = ((ref = process.env.PATHEXT) != null ? ref : '.EXE') + ";";
              }
            }
            return which(exe, options, function(err, path) {
              if (err) {
                return resolve(exe);
              }
              _this._whichCache[exe] = path;
              return resolve(path);
            });
          });
        };
      })(this));
    };


    /*
    If platform is Windows
     */

    Executable.prototype.isWindows = function() {
      return this.constructor.isWindows();
    };

    Executable.isWindows = function() {
      return new RegExp('^win').test(process.platform);
    };

    return Executable;

  })();

  HybridExecutable = (function(superClass) {
    extend(HybridExecutable, superClass);

    HybridExecutable.prototype.dockerOptions = {
      image: void 0,
      workingDir: "/workdir"
    };

    function HybridExecutable(options) {
      HybridExecutable.__super__.constructor.call(this, options);
      if (options.docker != null) {
        this.dockerOptions = Object.assign({}, this.dockerOptions, options.docker);
        this.docker = this.constructor.dockerExecutable();
      }
    }

    HybridExecutable.docker = void 0;

    HybridExecutable.dockerExecutable = function() {
      if (this.docker == null) {
        this.docker = new Executable({
          name: "Docker",
          cmd: "docker",
          homepage: "https://www.docker.com/",
          installation: "https://www.docker.com/get-docker",
          version: {
            parse: function(text) {
              return text.match(/version [0]*([1-9]\d*).[0]*([1-9]\d*).[0]*([1-9]\d*)/).slice(1).join('.');
            }
          }
        });
      }
      return this.docker;
    };

    HybridExecutable.prototype.installedWithDocker = false;

    HybridExecutable.prototype.init = function() {
      return HybridExecutable.__super__.init.call(this)["catch"]((function(_this) {
        return function(error) {
          if (_this.docker == null) {
            return Promise.reject(error);
          }
          return _this.docker.init().then(function() {
            return _this.runImage(_this.versionArgs, _this.versionRunOptions);
          }).then(function(text) {
            return _this.saveVersion(text);
          }).then(function() {
            return _this.installedWithDocker = true;
          }).then(function() {
            return _this;
          })["catch"](function(dockerError) {
            _this.debug(dockerError);
            return Promise.reject(error);
          });
        };
      })(this));
    };

    HybridExecutable.prototype.run = function(args, options) {
      if (options == null) {
        options = {};
      }
      if (this.installedWithDocker && this.docker && this.docker.isInstalled) {
        return this.runImage(args, options);
      }
      return HybridExecutable.__super__.run.call(this, args, options);
    };

    HybridExecutable.prototype.runImage = function(args, options) {
      this.debug("Run Docker executable: ", args, options);
      return this.resolveArgs(args).then((function(_this) {
        return function(args) {
          var cwd, image, newArgs, pwd, rootPath, tmpDir, workingDir;
          cwd = options.cwd;
          tmpDir = os.tmpDir();
          pwd = fs.realpathSync(cwd || tmpDir);
          image = _this.dockerOptions.image;
          workingDir = _this.dockerOptions.workingDir;
          rootPath = '/mountedRoot';
          newArgs = args.map(function(arg) {
            if (typeof arg === 'string' && !arg.includes(':') && path.isAbsolute(arg) && !path.dirname(arg).startsWith(tmpDir)) {
              return path.join(rootPath, arg);
            } else {
              return arg;
            }
          });
          return _this.docker.run(["run", "--volume", pwd + ":" + workingDir, "--volume", (path.resolve('/')) + ":" + rootPath, "--workdir", workingDir, image, newArgs], options);
        };
      })(this));
    };

    return HybridExecutable;

  })(Executable);

  module.exports = HybridExecutable;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9leGVjdXRhYmxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNkZBQUE7SUFBQTs7O0VBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNWLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSixLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBQ2pDLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxlQUFBLEdBQWtCOztFQUdaO0FBRUosUUFBQTs7eUJBQUEsSUFBQSxHQUFNOzt5QkFDTixHQUFBLEdBQUs7O3lCQUNMLEdBQUEsR0FBSzs7eUJBQ0wsUUFBQSxHQUFVOzt5QkFDVixZQUFBLEdBQWM7O3lCQUNkLFdBQUEsR0FBYSxDQUFDLFdBQUQ7O3lCQUNiLFlBQUEsR0FBYyxTQUFDLElBQUQ7YUFBVSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWI7SUFBVjs7eUJBQ2QsaUJBQUEsR0FBbUI7O3lCQUNuQixpQkFBQSxHQUFtQjs7eUJBQ25CLFFBQUEsR0FBVTs7SUFFRyxvQkFBQyxPQUFEO0FBRVgsVUFBQTtNQUFBLElBQUksbUJBQUo7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFNLGdFQUFOLEVBRFo7O01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxPQUFPLENBQUM7TUFDaEIsSUFBQyxDQUFBLEdBQUQsR0FBTyxPQUFPLENBQUM7TUFDZixJQUFDLENBQUEsR0FBRCxHQUFPLElBQUMsQ0FBQTtN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QWQsSUFBMkIsQ0FBSSxHQUFHLENBQUMsUUFBSixDQUFhLEdBQWIsQ0FBL0IsSUFDRSxJQUFJLENBQUMsVUFBTCxDQUFnQixHQUFoQixDQURGLElBQzJCLENBQUksSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQWlCLENBQUMsVUFBbEIsQ0FBNkIsTUFBN0IsQ0FEbkM7cUJBRU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW9CLEdBQXBCLEVBRlA7YUFBQSxNQUFBO3FCQUVxQyxJQUZyQzs7VUFEaUIsQ0FBVDtpQkFNVixLQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxDQUNSLEtBRFEsRUFFUixVQUZRLEVBRU8sR0FBRCxHQUFLLEdBQUwsR0FBUSxVQUZkLEVBR1IsVUFIUSxFQUdNLENBQUMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQUQsQ0FBQSxHQUFtQixHQUFuQixHQUFzQixRQUg1QixFQUlSLFdBSlEsRUFJSyxVQUpMLEVBS1IsS0FMUSxFQU1SLE9BTlEsQ0FBWixFQVFFLE9BUkY7UUFkSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUjtJQUZROzs7O0tBaERtQjs7RUE4RS9CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBcmJqQiIsInNvdXJjZXNDb250ZW50IjpbIlByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpXHJcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxyXG53aGljaCA9IHJlcXVpcmUoJ3doaWNoJylcclxuc3Bhd24gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuc3Bhd25cclxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxyXG5zZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKVxyXG5vcyA9IHJlcXVpcmUoJ29zJylcclxuZnMgPSByZXF1aXJlKCdmcycpXHJcblxyXG5wYXJlbnRDb25maWdLZXkgPSBcImF0b20tYmVhdXRpZnkuZXhlY3V0YWJsZXNcIlxyXG5cclxuXHJcbmNsYXNzIEV4ZWN1dGFibGVcclxuXHJcbiAgbmFtZTogbnVsbFxyXG4gIGNtZDogbnVsbFxyXG4gIGtleTogbnVsbFxyXG4gIGhvbWVwYWdlOiBudWxsXHJcbiAgaW5zdGFsbGF0aW9uOiBudWxsXHJcbiAgdmVyc2lvbkFyZ3M6IFsnLS12ZXJzaW9uJ11cclxuICB2ZXJzaW9uUGFyc2U6ICh0ZXh0KSAtPiBzZW12ZXIuY2xlYW4odGV4dClcclxuICB2ZXJzaW9uUnVuT3B0aW9uczoge31cclxuICB2ZXJzaW9uc1N1cHBvcnRlZDogJz49IDAuMC4wJ1xyXG4gIHJlcXVpcmVkOiB0cnVlXHJcblxyXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cclxuICAgICMgVmFsaWRhdGlvblxyXG4gICAgaWYgIW9wdGlvbnMuY21kP1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgY29tbWFuZCAoaS5lLiBjbWQgcHJvcGVydHkpIGlzIHJlcXVpcmVkIGZvciBhbiBFeGVjdXRhYmxlLlwiKVxyXG4gICAgQG5hbWUgPSBvcHRpb25zLm5hbWVcclxuICAgIEBjbWQgPSBvcHRpb25zLmNtZFxyXG4gICAgQGtleSA9IEBjbWRcclxuICAgIEBob21lcGFnZSA9IG9wdGlvbnMuaG9tZXBhZ2VcclxuICAgIEBpbnN0YWxsYXRpb24gPSBvcHRpb25zLmluc3RhbGxhdGlvblxyXG4gICAgQHJlcXVpcmVkID0gbm90IG9wdGlvbnMub3B0aW9uYWxcclxuICAgIGlmIG9wdGlvbnMudmVyc2lvbj9cclxuICAgICAgdmVyc2lvbk9wdGlvbnMgPSBvcHRpb25zLnZlcnNpb25cclxuICAgICAgQHZlcnNpb25BcmdzID0gdmVyc2lvbk9wdGlvbnMuYXJncyBpZiB2ZXJzaW9uT3B0aW9ucy5hcmdzXHJcbiAgICAgIEB2ZXJzaW9uUGFyc2UgPSB2ZXJzaW9uT3B0aW9ucy5wYXJzZSBpZiB2ZXJzaW9uT3B0aW9ucy5wYXJzZVxyXG4gICAgICBAdmVyc2lvblJ1bk9wdGlvbnMgPSB2ZXJzaW9uT3B0aW9ucy5ydW5PcHRpb25zIGlmIHZlcnNpb25PcHRpb25zLnJ1bk9wdGlvbnNcclxuICAgICAgQHZlcnNpb25zU3VwcG9ydGVkID0gdmVyc2lvbk9wdGlvbnMuc3VwcG9ydGVkIGlmIHZlcnNpb25PcHRpb25zLnN1cHBvcnRlZFxyXG4gICAgQHNldHVwTG9nZ2VyKClcclxuXHJcbiAgaW5pdDogKCkgLT5cclxuICAgIFByb21pc2UuYWxsKFtcclxuICAgICAgQGxvYWRWZXJzaW9uKClcclxuICAgIF0pXHJcbiAgICAgIC50aGVuKCgpID0+IEB2ZXJib3NlKFwiRG9uZSBpbml0IG9mICN7QG5hbWV9XCIpKVxyXG4gICAgICAudGhlbigoKSA9PiBAKVxyXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PlxyXG4gICAgICAgIGlmIG5vdCBALnJlcXVpcmVkXHJcbiAgICAgICAgICBAXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgUHJvbWlzZS5yZWplY3QoZXJyb3IpXHJcbiAgICAgIClcclxuXHJcbiAgIyMjXHJcbiAgTG9nZ2VyIGluc3RhbmNlXHJcbiAgIyMjXHJcbiAgbG9nZ2VyOiBudWxsXHJcbiAgIyMjXHJcbiAgSW5pdGlhbGl6ZSBhbmQgY29uZmlndXJlIExvZ2dlclxyXG4gICMjI1xyXG4gIHNldHVwTG9nZ2VyOiAtPlxyXG4gICAgQGxvZ2dlciA9IHJlcXVpcmUoJy4uL2xvZ2dlcicpKFwiI3tAbmFtZX0gRXhlY3V0YWJsZVwiKVxyXG4gICAgZm9yIGtleSwgbWV0aG9kIG9mIEBsb2dnZXJcclxuICAgICAgQFtrZXldID0gbWV0aG9kXHJcbiAgICBAdmVyYm9zZShcIiN7QG5hbWV9IGV4ZWN1dGFibGUgbG9nZ2VyIGhhcyBiZWVuIGluaXRpYWxpemVkLlwiKVxyXG5cclxuICBpc0luc3RhbGxlZCA9IG51bGxcclxuICB2ZXJzaW9uID0gbnVsbFxyXG4gIGxvYWRWZXJzaW9uOiAoZm9yY2UgPSBmYWxzZSkgLT5cclxuICAgIEB2ZXJib3NlKFwibG9hZFZlcnNpb25cIiwgQHZlcnNpb24sIGZvcmNlKVxyXG4gICAgaWYgZm9yY2Ugb3IgIUB2ZXJzaW9uP1xyXG4gICAgICBAdmVyYm9zZShcIkxvYWRpbmcgdmVyc2lvbiB3aXRob3V0IGNhY2hlXCIpXHJcbiAgICAgIEBydW5WZXJzaW9uKClcclxuICAgICAgICAudGhlbigodGV4dCkgPT4gQHNhdmVWZXJzaW9uKHRleHQpKVxyXG4gICAgZWxzZVxyXG4gICAgICBAdmVyYm9zZShcIkxvYWRpbmcgY2FjaGVkIHZlcnNpb25cIilcclxuICAgICAgUHJvbWlzZS5yZXNvbHZlKEB2ZXJzaW9uKVxyXG5cclxuICBydW5WZXJzaW9uOiAoKSAtPlxyXG4gICAgQHJ1bihAdmVyc2lvbkFyZ3MsIEB2ZXJzaW9uUnVuT3B0aW9ucylcclxuICAgICAgLnRoZW4oKHZlcnNpb24pID0+XHJcbiAgICAgICAgQGluZm8oXCJWZXJzaW9uIHRleHQ6IFwiICsgdmVyc2lvbilcclxuICAgICAgICB2ZXJzaW9uXHJcbiAgICAgIClcclxuXHJcbiAgc2F2ZVZlcnNpb246ICh0ZXh0KSAtPlxyXG4gICAgUHJvbWlzZS5yZXNvbHZlKClcclxuICAgICAgLnRoZW4oID0+IEB2ZXJzaW9uUGFyc2UodGV4dCkpXHJcbiAgICAgIC50aGVuKCh2ZXJzaW9uKSAtPlxyXG4gICAgICAgIHZhbGlkID0gQm9vbGVhbihzZW12ZXIudmFsaWQodmVyc2lvbikpXHJcbiAgICAgICAgaWYgbm90IHZhbGlkXHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWZXJzaW9uIGlzIG5vdCB2YWxpZDogXCIrdmVyc2lvbilcclxuICAgICAgICB2ZXJzaW9uXHJcbiAgICAgIClcclxuICAgICAgLnRoZW4oKHZlcnNpb24pID0+XHJcbiAgICAgICAgQGlzSW5zdGFsbGVkID0gdHJ1ZVxyXG4gICAgICAgIEB2ZXJzaW9uID0gdmVyc2lvblxyXG4gICAgICApXHJcbiAgICAgIC50aGVuKCh2ZXJzaW9uKSA9PlxyXG4gICAgICAgIEBpbmZvKFwiI3tAY21kfSB2ZXJzaW9uOiAje3ZlcnNpb259XCIpXHJcbiAgICAgICAgdmVyc2lvblxyXG4gICAgICApXHJcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+XHJcbiAgICAgICAgQGlzSW5zdGFsbGVkID0gZmFsc2VcclxuICAgICAgICBAZXJyb3IoZXJyb3IpXHJcbiAgICAgICAgaGVscCA9IHtcclxuICAgICAgICAgIHByb2dyYW06IEBjbWRcclxuICAgICAgICAgIGxpbms6IEBpbnN0YWxsYXRpb24gb3IgQGhvbWVwYWdlXHJcbiAgICAgICAgICBwYXRoT3B0aW9uOiBcIkV4ZWN1dGFibGUgLSAje0BuYW1lIG9yIEBjbWR9IC0gUGF0aFwiXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFByb21pc2UucmVqZWN0KEBjb21tYW5kTm90Rm91bmRFcnJvcihAbmFtZSBvciBAY21kLCBoZWxwKSlcclxuICAgICAgKVxyXG5cclxuICBpc1N1cHBvcnRlZDogKCkgLT5cclxuICAgIEBpc1ZlcnNpb24oQHZlcnNpb25zU3VwcG9ydGVkKVxyXG5cclxuICBpc1ZlcnNpb246IChyYW5nZSkgLT5cclxuICAgIEB2ZXJzaW9uU2F0aXNmaWVzKEB2ZXJzaW9uLCByYW5nZSlcclxuXHJcbiAgdmVyc2lvblNhdGlzZmllczogKHZlcnNpb24sIHJhbmdlKSAtPlxyXG4gICAgc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSlcclxuXHJcbiAgZ2V0Q29uZmlnOiAoKSAtPlxyXG4gICAgYXRvbT8uY29uZmlnLmdldChcIiN7cGFyZW50Q29uZmlnS2V5fS4je0BrZXl9XCIpIG9yIHt9XHJcblxyXG4gICMjI1xyXG4gIFJ1biBjb21tYW5kLWxpbmUgaW50ZXJmYWNlIGNvbW1hbmRcclxuICAjIyNcclxuICBydW46IChhcmdzLCBvcHRpb25zID0ge30pIC0+XHJcbiAgICBAZGVidWcoXCJSdW46IFwiLCBAY21kLCBhcmdzLCBvcHRpb25zKVxyXG4gICAgeyBjbWQsIGN3ZCwgaWdub3JlUmV0dXJuQ29kZSwgaGVscCwgb25TdGRpbiwgcmV0dXJuU3RkZXJyLCByZXR1cm5TdGRvdXRPclN0ZGVyciB9ID0gb3B0aW9uc1xyXG4gICAgZXhlTmFtZSA9IGNtZCBvciBAY21kXHJcbiAgICBjd2QgPz0gb3MudG1wRGlyKClcclxuICAgIGhlbHAgPz0ge1xyXG4gICAgICBwcm9ncmFtOiBAY21kXHJcbiAgICAgIGxpbms6IEBpbnN0YWxsYXRpb24gb3IgQGhvbWVwYWdlXHJcbiAgICAgIHBhdGhPcHRpb246IFwiRXhlY3V0YWJsZSAtICN7QG5hbWUgb3IgQGNtZH0gLSBQYXRoXCJcclxuICAgIH1cclxuXHJcbiAgICAjIFJlc29sdmUgZXhlY3V0YWJsZSBhbmQgYWxsIGFyZ3NcclxuICAgIFByb21pc2UuYWxsKFtAc2hlbGxFbnYoKSwgdGhpcy5yZXNvbHZlQXJncyhhcmdzKV0pXHJcbiAgICAgIC50aGVuKChbZW52LCBhcmdzXSkgPT5cclxuICAgICAgICBAZGVidWcoJ2V4ZU5hbWUsIGFyZ3M6JywgZXhlTmFtZSwgYXJncylcclxuICAgICAgICAjIEdldCBQQVRIIGFuZCBvdGhlciBlbnZpcm9ubWVudCB2YXJpYWJsZXNcclxuICAgICAgICBleGVQYXRoID0gQHBhdGgoZXhlTmFtZSlcclxuICAgICAgICBQcm9taXNlLmFsbChbZXhlTmFtZSwgYXJncywgZW52LCBleGVQYXRoXSlcclxuICAgICAgKVxyXG4gICAgICAudGhlbigoW2V4ZU5hbWUsIGFyZ3MsIGVudiwgZXhlUGF0aF0pID0+XHJcbiAgICAgICAgQGRlYnVnKCdleGVQYXRoOicsIGV4ZVBhdGgpXHJcbiAgICAgICAgQGRlYnVnKCdlbnY6JywgZW52KVxyXG4gICAgICAgIEBkZWJ1ZygnUEFUSDonLCBlbnYuUEFUSClcclxuICAgICAgICBAZGVidWcoJ2FyZ3MnLCBhcmdzKVxyXG4gICAgICAgIGFyZ3MgPSB0aGlzLnJlbGF0aXZpemVQYXRocyhhcmdzKVxyXG4gICAgICAgIEBkZWJ1ZygncmVsYXRpdml6ZWQgYXJncycsIGFyZ3MpXHJcblxyXG4gICAgICAgIGV4ZSA9IGV4ZVBhdGggPyBleGVOYW1lXHJcbiAgICAgICAgc3Bhd25PcHRpb25zID0ge1xyXG4gICAgICAgICAgY3dkOiBjd2RcclxuICAgICAgICAgIGVudjogZW52XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEBkZWJ1Zygnc3Bhd25PcHRpb25zJywgc3Bhd25PcHRpb25zKVxyXG5cclxuICAgICAgICBAc3Bhd24oZXhlLCBhcmdzLCBzcGF3bk9wdGlvbnMsIG9uU3RkaW4pXHJcbiAgICAgICAgICAudGhlbigoe3JldHVybkNvZGUsIHN0ZG91dCwgc3RkZXJyfSkgPT5cclxuICAgICAgICAgICAgQHZlcmJvc2UoJ3NwYXduIHJlc3VsdCwgcmV0dXJuQ29kZScsIHJldHVybkNvZGUpXHJcbiAgICAgICAgICAgIEB2ZXJib3NlKCdzcGF3biByZXN1bHQsIHN0ZG91dCcsIHN0ZG91dClcclxuICAgICAgICAgICAgQHZlcmJvc2UoJ3NwYXduIHJlc3VsdCwgc3RkZXJyJywgc3RkZXJyKVxyXG5cclxuICAgICAgICAgICAgIyBJZiByZXR1cm4gY29kZSBpcyBub3QgMCB0aGVuIGVycm9yIG9jY3VyZWRcclxuICAgICAgICAgICAgaWYgbm90IGlnbm9yZVJldHVybkNvZGUgYW5kIHJldHVybkNvZGUgaXNudCAwXHJcbiAgICAgICAgICAgICAgIyBvcGVyYWJsZSBwcm9ncmFtIG9yIGJhdGNoIGZpbGVcclxuICAgICAgICAgICAgICB3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnID0gXCJpcyBub3QgcmVjb2duaXplZCBhcyBhbiBpbnRlcm5hbCBvciBleHRlcm5hbCBjb21tYW5kXCJcclxuXHJcbiAgICAgICAgICAgICAgQHZlcmJvc2Uoc3RkZXJyLCB3aW5kb3dzUHJvZ3JhbU5vdEZvdW5kTXNnKVxyXG5cclxuICAgICAgICAgICAgICBpZiBAaXNXaW5kb3dzKCkgYW5kIHJldHVybkNvZGUgaXMgMSBhbmQgc3RkZXJyLmluZGV4T2Yod2luZG93c1Byb2dyYW1Ob3RGb3VuZE1zZykgaXNudCAtMVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgQGNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZU5hbWUsIGhlbHApXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0ZGVyciBvciBzdGRvdXQpXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICBpZiByZXR1cm5TdGRvdXRPclN0ZGVyclxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ZG91dCBvciBzdGRlcnJcclxuICAgICAgICAgICAgICBlbHNlIGlmIHJldHVyblN0ZGVyclxyXG4gICAgICAgICAgICAgICAgc3RkZXJyXHJcbiAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgc3Rkb3V0XHJcbiAgICAgICAgICApXHJcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT5cclxuICAgICAgICAgICAgQGRlYnVnKCdlcnJvcicsIGVycilcclxuXHJcbiAgICAgICAgICAgICMgQ2hlY2sgaWYgZXJyb3IgaXMgRU5PRU5UIChjb21tYW5kIGNvdWxkIG5vdCBiZSBmb3VuZClcclxuICAgICAgICAgICAgaWYgZXJyLmNvZGUgaXMgJ0VOT0VOVCcgb3IgZXJyLmVycm5vIGlzICdFTk9FTlQnXHJcbiAgICAgICAgICAgICAgdGhyb3cgQGNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZU5hbWUsIGhlbHApXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAjIGNvbnRpbnVlIGFzIG5vcm1hbCBlcnJvclxyXG4gICAgICAgICAgICAgIHRocm93IGVyclxyXG4gICAgICAgICAgKVxyXG4gICAgICApXHJcblxyXG4gIHBhdGg6IChjbWQgPSBAY21kKSAtPlxyXG4gICAgY29uZmlnID0gQGdldENvbmZpZygpXHJcbiAgICBpZiBjb25maWcgYW5kIGNvbmZpZy5wYXRoXHJcbiAgICAgIFByb21pc2UucmVzb2x2ZShjb25maWcucGF0aClcclxuICAgIGVsc2VcclxuICAgICAgZXhlTmFtZSA9IGNtZFxyXG4gICAgICBAd2hpY2goZXhlTmFtZSlcclxuXHJcbiAgcmVzb2x2ZUFyZ3M6IChhcmdzKSAtPlxyXG4gICAgYXJncyA9IF8uZmxhdHRlbihhcmdzKVxyXG4gICAgUHJvbWlzZS5hbGwoYXJncylcclxuXHJcbiAgcmVsYXRpdml6ZVBhdGhzOiAoYXJncykgLT5cclxuICAgIHRtcERpciA9IG9zLnRtcERpcigpXHJcbiAgICBuZXdBcmdzID0gYXJncy5tYXAoKGFyZykgLT5cclxuICAgICAgaXNUbXBGaWxlID0gKHR5cGVvZiBhcmcgaXMgJ3N0cmluZycgYW5kIG5vdCBhcmcuaW5jbHVkZXMoJzonKSBhbmQgXFxcclxuICAgICAgICBwYXRoLmlzQWJzb2x1dGUoYXJnKSBhbmQgcGF0aC5kaXJuYW1lKGFyZykuc3RhcnRzV2l0aCh0bXBEaXIpKVxyXG4gICAgICBpZiBpc1RtcEZpbGVcclxuICAgICAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZSh0bXBEaXIsIGFyZylcclxuICAgICAgcmV0dXJuIGFyZ1xyXG4gICAgKVxyXG4gICAgbmV3QXJnc1xyXG5cclxuICAjIyNcclxuICBTcGF3blxyXG4gICMjI1xyXG4gIHNwYXduOiAoZXhlLCBhcmdzLCBvcHRpb25zLCBvblN0ZGluKSAtPlxyXG4gICAgIyBSZW1vdmUgdW5kZWZpbmVkL251bGwgdmFsdWVzXHJcbiAgICBhcmdzID0gXy53aXRob3V0KGFyZ3MsIHVuZGVmaW5lZClcclxuICAgIGFyZ3MgPSBfLndpdGhvdXQoYXJncywgbnVsbClcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cclxuICAgICAgQGRlYnVnKCdzcGF3bicsIGV4ZSwgYXJncylcclxuXHJcbiAgICAgIGNtZCA9IHNwYXduKGV4ZSwgYXJncywgb3B0aW9ucylcclxuICAgICAgc3Rkb3V0ID0gXCJcIlxyXG4gICAgICBzdGRlcnIgPSBcIlwiXHJcblxyXG4gICAgICBjbWQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpIC0+XHJcbiAgICAgICAgc3Rkb3V0ICs9IGRhdGFcclxuICAgICAgKVxyXG4gICAgICBjbWQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpIC0+XHJcbiAgICAgICAgc3RkZXJyICs9IGRhdGFcclxuICAgICAgKVxyXG4gICAgICBjbWQub24oJ2Nsb3NlJywgKHJldHVybkNvZGUpID0+XHJcbiAgICAgICAgQGRlYnVnKCdzcGF3biBkb25lJywgcmV0dXJuQ29kZSwgc3RkZXJyLCBzdGRvdXQpXHJcbiAgICAgICAgcmVzb2x2ZSh7cmV0dXJuQ29kZSwgc3Rkb3V0LCBzdGRlcnJ9KVxyXG4gICAgICApXHJcbiAgICAgIGNtZC5vbignZXJyb3InLCAoZXJyKSA9PlxyXG4gICAgICAgIEBkZWJ1ZygnZXJyb3InLCBlcnIpXHJcbiAgICAgICAgcmVqZWN0KGVycilcclxuICAgICAgKVxyXG5cclxuICAgICAgb25TdGRpbiBjbWQuc3RkaW4gaWYgb25TdGRpblxyXG4gICAgKVxyXG5cclxuXHJcbiAgIyMjXHJcbiAgQWRkIGhlbHAgdG8gZXJyb3IuZGVzY3JpcHRpb25cclxuXHJcbiAgTm90ZTogZXJyb3IuZGVzY3JpcHRpb24gaXMgbm90IG9mZmljaWFsbHkgdXNlZCBpbiBKYXZhU2NyaXB0LFxyXG4gIGhvd2V2ZXIgaXQgaXMgdXNlZCBpbnRlcm5hbGx5IGZvciBBdG9tIEJlYXV0aWZ5IHdoZW4gZGlzcGxheWluZyBlcnJvcnMuXHJcbiAgIyMjXHJcbiAgY29tbWFuZE5vdEZvdW5kRXJyb3I6IChleGUsIGhlbHApIC0+XHJcbiAgICBleGUgPz0gQG5hbWUgb3IgQGNtZFxyXG4gICAgQGNvbnN0cnVjdG9yLmNvbW1hbmROb3RGb3VuZEVycm9yKGV4ZSwgaGVscClcclxuXHJcbiAgQGNvbW1hbmROb3RGb3VuZEVycm9yOiAoZXhlLCBoZWxwKSAtPlxyXG4gICAgIyBDcmVhdGUgbmV3IGltcHJvdmVkIGVycm9yXHJcbiAgICAjIG5vdGlmeSB1c2VyIHRoYXQgaXQgbWF5IG5vdCBiZVxyXG4gICAgIyBpbnN0YWxsZWQgb3IgaW4gcGF0aFxyXG4gICAgbWVzc2FnZSA9IFwiQ291bGQgbm90IGZpbmQgJyN7ZXhlfScuIFxcXHJcbiAgICAgICAgICAgIFRoZSBwcm9ncmFtIG1heSBub3QgYmUgaW5zdGFsbGVkLlwiXHJcbiAgICBlciA9IG5ldyBFcnJvcihtZXNzYWdlKVxyXG4gICAgZXIuY29kZSA9ICdDb21tYW5kTm90Rm91bmQnXHJcbiAgICBlci5lcnJubyA9IGVyLmNvZGVcclxuICAgIGVyLnN5c2NhbGwgPSAnYmVhdXRpZmllcjo6cnVuJ1xyXG4gICAgZXIuZmlsZSA9IGV4ZVxyXG4gICAgaWYgaGVscD9cclxuICAgICAgaWYgdHlwZW9mIGhlbHAgaXMgXCJvYmplY3RcIlxyXG4gICAgICAgICMgQmFzaWMgbm90aWNlXHJcbiAgICAgICAgZG9jc0xpbmsgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS9HbGF2aW4wMDEvYXRvbS1iZWF1dGlmeSNiZWF1dGlmaWVyc1wiXHJcbiAgICAgICAgaGVscFN0ciA9IFwiU2VlICN7ZXhlfSBpbnN0YWxsYXRpb24gaW5zdHJ1Y3Rpb25zIGF0ICN7ZG9jc0xpbmt9I3tpZiBoZWxwLmxpbmsgdGhlbiAoJyBvciBnbyB0byAnK2hlbHAubGluaykgZWxzZSAnJ31cXG5cIlxyXG4gICAgICAgICMgIyBIZWxwIHRvIGNvbmZpZ3VyZSBBdG9tIEJlYXV0aWZ5IGZvciBwcm9ncmFtJ3MgcGF0aFxyXG4gICAgICAgIGhlbHBTdHIgKz0gXCJZb3UgY2FuIGNvbmZpZ3VyZSBBdG9tIEJlYXV0aWZ5IFxcXHJcbiAgICAgICAgICAgICAgICAgICAgd2l0aCB0aGUgYWJzb2x1dGUgcGF0aCBcXFxyXG4gICAgICAgICAgICAgICAgICAgIHRvICcje2hlbHAucHJvZ3JhbSBvciBleGV9JyBieSBzZXR0aW5nIFxcXHJcbiAgICAgICAgICAgICAgICAgICAgJyN7aGVscC5wYXRoT3B0aW9ufScgaW4gXFxcclxuICAgICAgICAgICAgICAgICAgICB0aGUgQXRvbSBCZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlxcblwiIGlmIGhlbHAucGF0aE9wdGlvblxyXG4gICAgICAgIGhlbHBTdHIgKz0gXCJZb3VyIHByb2dyYW0gaXMgcHJvcGVybHkgaW5zdGFsbGVkIGlmIHJ1bm5pbmcgXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcje2lmIEBpc1dpbmRvd3MoKSB0aGVuICd3aGVyZS5leGUnIFxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlICd3aGljaCd9ICN7ZXhlfScgXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIHlvdXIgI3tpZiBAaXNXaW5kb3dzKCkgdGhlbiAnQ01EIHByb21wdCcgXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgJ1Rlcm1pbmFsJ30gXFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybnMgYW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZXhlY3V0YWJsZS5cXG5cIlxyXG4gICAgICAgICMgIyBPcHRpb25hbCwgYWRkaXRpb25hbCBoZWxwXHJcbiAgICAgICAgaGVscFN0ciArPSBoZWxwLmFkZGl0aW9uYWwgaWYgaGVscC5hZGRpdGlvbmFsXHJcbiAgICAgICAgZXIuZGVzY3JpcHRpb24gPSBoZWxwU3RyXHJcbiAgICAgIGVsc2UgI2lmIHR5cGVvZiBoZWxwIGlzIFwic3RyaW5nXCJcclxuICAgICAgICBlci5kZXNjcmlwdGlvbiA9IGhlbHBcclxuICAgIHJldHVybiBlclxyXG5cclxuXHJcbiAgQF9lbnZDYWNoZSA9IG51bGxcclxuICBzaGVsbEVudjogKCkgLT5cclxuICAgIGVudiA9IEBjb25zdHJ1Y3Rvci5zaGVsbEVudigpXHJcbiAgICBAZGVidWcoXCJlbnZcIiwgZW52KVxyXG4gICAgcmV0dXJuIGVudlxyXG4gIEBzaGVsbEVudjogKCkgLT5cclxuICAgIFByb21pc2UucmVzb2x2ZShwcm9jZXNzLmVudilcclxuXHJcbiAgIyMjXHJcbiAgTGlrZSB0aGUgdW5peCB3aGljaCB1dGlsaXR5LlxyXG5cclxuICBGaW5kcyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYSBzcGVjaWZpZWQgZXhlY3V0YWJsZSBpbiB0aGUgUEFUSCBlbnZpcm9ubWVudCB2YXJpYWJsZS5cclxuICBEb2VzIG5vdCBjYWNoZSB0aGUgcmVzdWx0cyxcclxuICBzbyBoYXNoIC1yIGlzIG5vdCBuZWVkZWQgd2hlbiB0aGUgUEFUSCBjaGFuZ2VzLlxyXG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtd2hpY2hcclxuICAjIyNcclxuICB3aGljaDogKGV4ZSwgb3B0aW9ucykgLT5cclxuICAgIEAuY29uc3RydWN0b3Iud2hpY2goZXhlLCBvcHRpb25zKVxyXG4gIEBfd2hpY2hDYWNoZSA9IHt9XHJcbiAgQHdoaWNoOiAoZXhlLCBvcHRpb25zID0ge30pIC0+XHJcbiAgICBpZiBAX3doaWNoQ2FjaGVbZXhlXVxyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKEBfd2hpY2hDYWNoZVtleGVdKVxyXG4gICAgIyBHZXQgUEFUSCBhbmQgb3RoZXIgZW52aXJvbm1lbnQgdmFyaWFibGVzXHJcbiAgICBAc2hlbGxFbnYoKVxyXG4gICAgICAudGhlbigoZW52KSA9PlxyXG4gICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XHJcbiAgICAgICAgICBvcHRpb25zLnBhdGggPz0gZW52LlBBVEhcclxuICAgICAgICAgIGlmIEBpc1dpbmRvd3MoKVxyXG4gICAgICAgICAgICAjIEVudmlyb25tZW50IHZhcmlhYmxlcyBhcmUgY2FzZS1pbnNlbnNpdGl2ZSBpbiB3aW5kb3dzXHJcbiAgICAgICAgICAgICMgQ2hlY2sgZW52IGZvciBhIGNhc2UtaW5zZW5zaXRpdmUgJ3BhdGgnIHZhcmlhYmxlXHJcbiAgICAgICAgICAgIGlmICFvcHRpb25zLnBhdGhcclxuICAgICAgICAgICAgICBmb3IgaSBvZiBlbnZcclxuICAgICAgICAgICAgICAgIGlmIGkudG9Mb3dlckNhc2UoKSBpcyBcInBhdGhcIlxyXG4gICAgICAgICAgICAgICAgICBvcHRpb25zLnBhdGggPSBlbnZbaV1cclxuICAgICAgICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgICAgICMgVHJpY2sgbm9kZS13aGljaCBpbnRvIGluY2x1ZGluZyBmaWxlc1xyXG4gICAgICAgICAgICAjIHdpdGggbm8gZXh0ZW5zaW9uIGFzIGV4ZWN1dGFibGVzLlxyXG4gICAgICAgICAgICAjIFB1dCBlbXB0eSBleHRlbnNpb24gbGFzdCB0byBhbGxvdyBmb3Igb3RoZXIgcmVhbCBleHRlbnNpb25zIGZpcnN0XHJcbiAgICAgICAgICAgIG9wdGlvbnMucGF0aEV4dCA/PSBcIiN7cHJvY2Vzcy5lbnYuUEFUSEVYVCA/ICcuRVhFJ307XCJcclxuICAgICAgICAgIHdoaWNoKGV4ZSwgb3B0aW9ucywgKGVyciwgcGF0aCkgPT5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZXhlKSBpZiBlcnJcclxuICAgICAgICAgICAgQF93aGljaENhY2hlW2V4ZV0gPSBwYXRoXHJcbiAgICAgICAgICAgIHJlc29sdmUocGF0aClcclxuICAgICAgICAgIClcclxuICAgICAgICApXHJcbiAgICAgIClcclxuXHJcbiAgIyMjXHJcbiAgSWYgcGxhdGZvcm0gaXMgV2luZG93c1xyXG4gICMjI1xyXG4gIGlzV2luZG93czogKCkgLT4gQGNvbnN0cnVjdG9yLmlzV2luZG93cygpXHJcbiAgQGlzV2luZG93czogKCkgLT4gbmV3IFJlZ0V4cCgnXndpbicpLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSlcclxuXHJcbmNsYXNzIEh5YnJpZEV4ZWN1dGFibGUgZXh0ZW5kcyBFeGVjdXRhYmxlXHJcblxyXG4gIGRvY2tlck9wdGlvbnM6IHtcclxuICAgIGltYWdlOiB1bmRlZmluZWRcclxuICAgIHdvcmtpbmdEaXI6IFwiL3dvcmtkaXJcIlxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxyXG4gICAgc3VwZXIob3B0aW9ucylcclxuICAgIGlmIG9wdGlvbnMuZG9ja2VyP1xyXG4gICAgICBAZG9ja2VyT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIEBkb2NrZXJPcHRpb25zLCBvcHRpb25zLmRvY2tlcilcclxuICAgICAgQGRvY2tlciA9IEBjb25zdHJ1Y3Rvci5kb2NrZXJFeGVjdXRhYmxlKClcclxuXHJcbiAgQGRvY2tlcjogdW5kZWZpbmVkXHJcbiAgQGRvY2tlckV4ZWN1dGFibGU6ICgpIC0+XHJcbiAgICBpZiBub3QgQGRvY2tlcj9cclxuICAgICAgQGRvY2tlciA9IG5ldyBFeGVjdXRhYmxlKHtcclxuICAgICAgICBuYW1lOiBcIkRvY2tlclwiXHJcbiAgICAgICAgY21kOiBcImRvY2tlclwiXHJcbiAgICAgICAgaG9tZXBhZ2U6IFwiaHR0cHM6Ly93d3cuZG9ja2VyLmNvbS9cIlxyXG4gICAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL3d3dy5kb2NrZXIuY29tL2dldC1kb2NrZXJcIlxyXG4gICAgICAgIHZlcnNpb246IHtcclxuICAgICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvdmVyc2lvbiBbMF0qKFsxLTldXFxkKikuWzBdKihbMS05XVxcZCopLlswXSooWzEtOV1cXGQqKS8pLnNsaWNlKDEpLmpvaW4oJy4nKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIHJldHVybiBAZG9ja2VyXHJcblxyXG4gIGluc3RhbGxlZFdpdGhEb2NrZXI6IGZhbHNlXHJcbiAgaW5pdDogKCkgLT5cclxuICAgIHN1cGVyKClcclxuICAgICAgLmNhdGNoKChlcnJvcikgPT5cclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpIGlmIG5vdCBAZG9ja2VyP1xyXG4gICAgICAgIEBkb2NrZXIuaW5pdCgpXHJcbiAgICAgICAgICAudGhlbig9PiBAcnVuSW1hZ2UoQHZlcnNpb25BcmdzLCBAdmVyc2lvblJ1bk9wdGlvbnMpKVxyXG4gICAgICAgICAgLnRoZW4oKHRleHQpID0+IEBzYXZlVmVyc2lvbih0ZXh0KSlcclxuICAgICAgICAgIC50aGVuKCgpID0+IEBpbnN0YWxsZWRXaXRoRG9ja2VyID0gdHJ1ZSlcclxuICAgICAgICAgIC50aGVuKD0+IEApXHJcbiAgICAgICAgICAuY2F0Y2goKGRvY2tlckVycm9yKSA9PlxyXG4gICAgICAgICAgICBAZGVidWcoZG9ja2VyRXJyb3IpXHJcbiAgICAgICAgICAgIFByb21pc2UucmVqZWN0KGVycm9yKVxyXG4gICAgICAgICAgKVxyXG4gICAgICApXHJcblxyXG4gIHJ1bjogKGFyZ3MsIG9wdGlvbnMgPSB7fSkgLT5cclxuICAgIGlmIEBpbnN0YWxsZWRXaXRoRG9ja2VyIGFuZCBAZG9ja2VyIGFuZCBAZG9ja2VyLmlzSW5zdGFsbGVkXHJcbiAgICAgIHJldHVybiBAcnVuSW1hZ2UoYXJncywgb3B0aW9ucylcclxuICAgIHN1cGVyKGFyZ3MsIG9wdGlvbnMpXHJcblxyXG4gIHJ1bkltYWdlOiAoYXJncywgb3B0aW9ucykgLT5cclxuICAgIEBkZWJ1ZyhcIlJ1biBEb2NrZXIgZXhlY3V0YWJsZTogXCIsIGFyZ3MsIG9wdGlvbnMpXHJcbiAgICB0aGlzLnJlc29sdmVBcmdzKGFyZ3MpXHJcbiAgICAgIC50aGVuKChhcmdzKSA9PlxyXG4gICAgICAgIHsgY3dkIH0gPSBvcHRpb25zXHJcbiAgICAgICAgdG1wRGlyID0gb3MudG1wRGlyKClcclxuICAgICAgICBwd2QgPSBmcy5yZWFscGF0aFN5bmMoY3dkIG9yIHRtcERpcilcclxuICAgICAgICBpbWFnZSA9IEBkb2NrZXJPcHRpb25zLmltYWdlXHJcbiAgICAgICAgd29ya2luZ0RpciA9IEBkb2NrZXJPcHRpb25zLndvcmtpbmdEaXJcclxuXHJcbiAgICAgICAgcm9vdFBhdGggPSAnL21vdW50ZWRSb290J1xyXG4gICAgICAgIG5ld0FyZ3MgPSBhcmdzLm1hcCgoYXJnKSAtPlxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmcgaXMgJ3N0cmluZycgYW5kIG5vdCBhcmcuaW5jbHVkZXMoJzonKSBcXFxyXG4gICAgICAgICAgICBhbmQgcGF0aC5pc0Fic29sdXRlKGFyZykgYW5kIG5vdCBwYXRoLmRpcm5hbWUoYXJnKS5zdGFydHNXaXRoKHRtcERpcikpXHJcbiAgICAgICAgICAgIHRoZW4gcGF0aC5qb2luKHJvb3RQYXRoLCBhcmcpIGVsc2UgYXJnXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBAZG9ja2VyLnJ1bihbXHJcbiAgICAgICAgICAgIFwicnVuXCIsXHJcbiAgICAgICAgICAgIFwiLS12b2x1bWVcIiwgXCIje3B3ZH06I3t3b3JraW5nRGlyfVwiLFxyXG4gICAgICAgICAgICBcIi0tdm9sdW1lXCIsIFwiI3twYXRoLnJlc29sdmUoJy8nKX06I3tyb290UGF0aH1cIixcclxuICAgICAgICAgICAgXCItLXdvcmtkaXJcIiwgd29ya2luZ0RpcixcclxuICAgICAgICAgICAgaW1hZ2UsXHJcbiAgICAgICAgICAgIG5ld0FyZ3NcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICBvcHRpb25zXHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIeWJyaWRFeGVjdXRhYmxlXHJcbiJdfQ==
