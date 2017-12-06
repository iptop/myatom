(function() {
  var DownloadCmd, EventEmitter, FtpTransport, Host, HostView, MonitoredFiles, RemoteSync, ScpTransport, chokidar, exec, fs, getLogger, logger, minimatch, path, randomize, uploadCmd, watchChangeSet, watchFiles, watcher,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require("path");

  fs = require("fs-plus");

  chokidar = require("chokidar");

  randomize = require("randomatic");

  exec = null;

  minimatch = null;

  ScpTransport = null;

  FtpTransport = null;

  uploadCmd = null;

  DownloadCmd = null;

  Host = null;

  HostView = null;

  EventEmitter = null;

  MonitoredFiles = [];

  watchFiles = {};

  watchChangeSet = false;

  watcher = chokidar.watch();

  logger = null;

  getLogger = function() {
    var Logger;
    if (!logger) {
      Logger = require("./Logger");
      logger = new Logger("Remote Sync");
    }
    return logger;
  };

  RemoteSync = (function() {
    function RemoteSync(projectPath1, configPath1) {
      var ref;
      this.projectPath = projectPath1;
      this.configPath = configPath1;
      if (Host == null) {
        Host = require('./model/host');
      }
      this.host = new Host(this.configPath);
      watchFiles = (ref = this.host.watch) != null ? ref.split(",").filter(Boolean) : void 0;
      if (this.host.source) {
        this.projectPath = path.join(this.projectPath, this.host.source);
      }
      if (watchFiles != null) {
        this.initAutoFileWatch(this.projectPath);
      }
      this.initIgnore(this.host);
      this.initMonitor();
    }

    RemoteSync.prototype.initIgnore = function(host) {
      var ignore, ref;
      ignore = (ref = host.ignore) != null ? ref.split(",") : void 0;
      return host.isIgnore = (function(_this) {
        return function(filePath, relativizePath) {
          var i, len, pattern;
          if (!(relativizePath || _this.inPath(_this.projectPath, filePath))) {
            return true;
          }
          if (!ignore) {
            return false;
          }
          if (!relativizePath) {
            relativizePath = _this.projectPath;
          }
          filePath = path.relative(relativizePath, filePath);
          if (minimatch == null) {
            minimatch = require("minimatch");
          }
          for (i = 0, len = ignore.length; i < len; i++) {
            pattern = ignore[i];
            if (minimatch(filePath, pattern, {
              matchBase: true,
              dot: true
            })) {
              return true;
            }
          }
          return false;
        };
      })(this);
    };

    RemoteSync.prototype.isIgnore = function(filePath, relativizePath) {
      return this.host.isIgnore(filePath, relativizePath);
    };

    RemoteSync.prototype.inPath = function(rootPath, localPath) {
      if (fs.isDirectorySync(localPath)) {
        localPath = localPath + path.sep;
      }
      return localPath.indexOf(rootPath + path.sep) === 0;
    };

    RemoteSync.prototype.dispose = function() {
      if (this.transport) {
        this.transport.dispose();
        return this.transport = null;
      }
    };

    RemoteSync.prototype.deleteFile = function(filePath) {
      var UploadListener, i, len, ref, t;
      if (this.isIgnore(filePath)) {
        return;
      }
      if (!uploadCmd) {
        UploadListener = require("./UploadListener");
        uploadCmd = new UploadListener(getLogger());
      }
      uploadCmd.handleDelete(filePath, this.getTransport());
      ref = this.getUploadMirrors();
      for (i = 0, len = ref.length; i < len; i++) {
        t = ref[i];
        uploadCmd.handleDelete(filePath, t);
      }
      if (this.host.deleteLocal) {
        return fs.removeSync(filePath);
      }
    };

    RemoteSync.prototype.downloadFolder = function(localPath, targetPath, callback) {
      if (DownloadCmd == null) {
        DownloadCmd = require('./commands/DownloadAllCommand');
      }
      return DownloadCmd.run(getLogger(), this.getTransport(), localPath, targetPath, callback);
    };

    RemoteSync.prototype.downloadFile = function(localPath) {
      var realPath;
      if (this.isIgnore(localPath)) {
        return;
      }
      realPath = path.relative(this.projectPath, localPath);
      realPath = path.join(this.host.target, realPath).replace(/\\/g, "/");
      return this.getTransport().download(realPath);
    };

    RemoteSync.prototype.uploadFile = function(filePath) {
      var UploadListener, e, i, j, len, len1, ref, ref1, results, t;
      if (this.isIgnore(filePath)) {
        return;
      }
      if (!uploadCmd) {
        UploadListener = require("./UploadListener");
        uploadCmd = new UploadListener(getLogger());
      }
      if (this.host.saveOnUpload) {
        ref = atom.workspace.getTextEditors();
        for (i = 0, len = ref.length; i < len; i++) {
          e = ref[i];
          if (e.getPath() === filePath && e.isModified()) {
            e.save();
            if (this.host.uploadOnSave) {
              return;
            }
          }
        }
      }
      uploadCmd.handleSave(filePath, this.getTransport());
      ref1 = this.getUploadMirrors();
      results = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        t = ref1[j];
        results.push(uploadCmd.handleSave(filePath, t));
      }
      return results;
    };

    RemoteSync.prototype.uploadFolder = function(dirPath) {
      return fs.traverseTree(dirPath, this.uploadFile.bind(this), (function(_this) {
        return function() {
          return !_this.isIgnore(dirPath);
        };
      })(this));
    };

    RemoteSync.prototype.initMonitor = function() {
      var _this;
      _this = this;
      return setTimeout(function() {
        var MutationObserver, observer, targetObject;
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        observer = new MutationObserver(function(mutations, observer) {
          _this.monitorStyles();
        });
        targetObject = document.querySelector('.tree-view');
        if (targetObject !== null) {
          return observer.observe(targetObject, {
            subtree: true,
            attributes: false,
            childList: true
          });
        }
      }, 250);
    };

    RemoteSync.prototype.monitorFile = function(dirPath, toggle, notifications) {
      var _this, fileName, index;
      if (toggle == null) {
        toggle = true;
      }
      if (notifications == null) {
        notifications = true;
      }
      if (!this.fileExists(dirPath) && !this.isDirectory(dirPath)) {
        return;
      }
      fileName = this.monitorFileName(dirPath);
      if (indexOf.call(MonitoredFiles, dirPath) < 0) {
        MonitoredFiles.push(dirPath);
        watcher.add(dirPath);
        if (notifications) {
          atom.notifications.addInfo("remote-sync: Watching file - *" + fileName + "*");
        }
        if (!watchChangeSet) {
          _this = this;
          watcher.on('change', function(path) {
            return _this.uploadFile(path);
          });
          watcher.on('unlink', function(path) {
            return _this.deleteFile(path);
          });
          watchChangeSet = true;
        }
      } else if (toggle) {
        watcher.unwatch(dirPath);
        index = MonitoredFiles.indexOf(dirPath);
        MonitoredFiles.splice(index, 1);
        if (notifications) {
          atom.notifications.addInfo("remote-sync: Unwatching file - *" + fileName + "*");
        }
      }
      return this.monitorStyles();
    };

    RemoteSync.prototype.monitorStyles = function() {
      var file, file_name, i, icon_file, item, j, len, len1, list_item, monitorClass, monitored, pulseClass, results;
      monitorClass = 'file-monitoring';
      pulseClass = 'pulse';
      monitored = document.querySelectorAll('.' + monitorClass);
      if (monitored !== null && monitored.length !== 0) {
        for (i = 0, len = monitored.length; i < len; i++) {
          item = monitored[i];
          item.classList.remove(monitorClass);
        }
      }
      results = [];
      for (j = 0, len1 = MonitoredFiles.length; j < len1; j++) {
        file = MonitoredFiles[j];
        file_name = file.replace(/(['"])/g, "\\$1");
        file_name = file.replace(/\\/g, '\\\\');
        icon_file = document.querySelector('[data-path="' + file_name + '"]');
        if (icon_file !== null) {
          list_item = icon_file.parentNode;
          list_item.classList.add(monitorClass);
          if (atom.config.get("remote-sync.monitorFileAnimation")) {
            results.push(list_item.classList.add(pulseClass));
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    RemoteSync.prototype.monitorFilesList = function() {
      var file, files, i, k, len, ref, v, watchedPaths;
      files = "";
      watchedPaths = watcher.getWatched();
      for (k in watchedPaths) {
        v = watchedPaths[k];
        ref = watchedPaths[k];
        for (i = 0, len = ref.length; i < len; i++) {
          file = ref[i];
          files += file + "<br/>";
        }
      }
      if (files !== "") {
        return atom.notifications.addInfo("remote-sync: Currently watching:<br/>*" + files + "*");
      } else {
        return atom.notifications.addWarning("remote-sync: Currently not watching any files");
      }
    };

    RemoteSync.prototype.fileExists = function(dirPath) {
      var e, exists, file_name;
      file_name = this.monitorFileName(dirPath);
      try {
        exists = fs.statSync(dirPath);
        return true;
      } catch (error) {
        e = error;
        atom.notifications.addWarning("remote-sync: cannot find *" + file_name + "* to watch");
        return false;
      }
    };

    RemoteSync.prototype.isDirectory = function(dirPath) {
      var directory;
      if (directory = fs.statSync(dirPath).isDirectory()) {
        atom.notifications.addWarning("remote-sync: cannot watch directory - *" + dirPath + "*");
        return false;
      }
      return true;
    };

    RemoteSync.prototype.monitorFileName = function(dirPath) {
      var file;
      file = dirPath.split('\\').pop().split('/').pop();
      return file;
    };

    RemoteSync.prototype.initAutoFileWatch = function(projectPath) {
      var _this, filesName, i, len;
      _this = this;
      if (watchFiles.length !== 0) {
        for (i = 0, len = watchFiles.length; i < len; i++) {
          filesName = watchFiles[i];
          _this.setupAutoFileWatch(filesName, projectPath);
        }
        setTimeout(function() {
          return _this.monitorFilesList();
        }, 1500);
      }
    };

    RemoteSync.prototype.setupAutoFileWatch = function(filesName, projectPath) {
      var _this;
      _this = this;
      return setTimeout(function() {
        var fullpath;
        if (process.platform === "win32") {
          filesName = filesName.replace(/\//g, '\\');
        }
        fullpath = projectPath + filesName.replace(/^\s+|\s+$/g, "");
        return _this.monitorFile(fullpath, false, false);
      }, 250);
    };

    RemoteSync.prototype.uploadGitChange = function(dirPath) {
      var curRepo, i, isChangedPath, len, repo, repos, workingDirectory;
      repos = atom.project.getRepositories();
      curRepo = null;
      for (i = 0, len = repos.length; i < len; i++) {
        repo = repos[i];
        if (!repo) {
          continue;
        }
        workingDirectory = repo.getWorkingDirectory();
        if (this.inPath(workingDirectory, this.projectPath)) {
          curRepo = repo;
          break;
        }
      }
      if (!curRepo) {
        return;
      }
      isChangedPath = function(path) {
        var status;
        status = curRepo.getCachedPathStatus(path);
        return curRepo.isStatusModified(status) || curRepo.isStatusNew(status);
      };
      return fs.traverseTree(dirPath, (function(_this) {
        return function(path) {
          if (isChangedPath(path)) {
            return _this.uploadFile(path);
          }
        };
      })(this), (function(_this) {
        return function(path) {
          return !_this.isIgnore(path);
        };
      })(this));
    };

    RemoteSync.prototype.createTransport = function(host) {
      var Transport;
      if (host.transport === 'scp' || host.transport === 'sftp') {
        if (ScpTransport == null) {
          ScpTransport = require("./transports/ScpTransport");
        }
        Transport = ScpTransport;
      } else if (host.transport === 'ftp') {
        if (FtpTransport == null) {
          FtpTransport = require("./transports/FtpTransport");
        }
        Transport = FtpTransport;
      } else {
        throw new Error("[remote-sync] invalid transport: " + host.transport + " in " + this.configPath);
      }
      return new Transport(getLogger(), host, this.projectPath);
    };

    RemoteSync.prototype.getTransport = function() {
      if (this.transport) {
        return this.transport;
      }
      this.transport = this.createTransport(this.host);
      return this.transport;
    };

    RemoteSync.prototype.getUploadMirrors = function() {
      var host, i, len, ref;
      if (this.mirrorTransports) {
        return this.mirrorTransports;
      }
      this.mirrorTransports = [];
      if (this.host.uploadMirrors) {
        ref = this.host.uploadMirrors;
        for (i = 0, len = ref.length; i < len; i++) {
          host = ref[i];
          this.initIgnore(host);
          this.mirrorTransports.push(this.createTransport(host));
        }
      }
      return this.mirrorTransports;
    };

    RemoteSync.prototype.diffFile = function(localPath) {
      var os, realPath, targetPath;
      realPath = path.relative(this.projectPath, localPath);
      realPath = path.join(this.host.target, realPath).replace(/\\/g, "/");
      if (!os) {
        os = require("os");
      }
      targetPath = path.join(os.tmpDir(), "remote-sync", randomize('A0', 16));
      return this.getTransport().download(realPath, targetPath, (function(_this) {
        return function() {
          return _this.diff(localPath, targetPath);
        };
      })(this));
    };

    RemoteSync.prototype.diffFolder = function(localPath) {
      var os, targetPath;
      if (!os) {
        os = require("os");
      }
      targetPath = path.join(os.tmpDir(), "remote-sync", randomize('A0', 16));
      return this.downloadFolder(localPath, targetPath, (function(_this) {
        return function() {
          return _this.diff(localPath, targetPath);
        };
      })(this));
    };

    RemoteSync.prototype.diff = function(localPath, targetPath) {
      var diffCmd;
      if (this.isIgnore(localPath)) {
        return;
      }
      targetPath = path.join(targetPath, path.relative(this.projectPath, localPath));
      diffCmd = atom.config.get('remote-sync.difftoolCommand');
      if (exec == null) {
        exec = require("child_process").exec;
      }
      return exec("\"" + diffCmd + "\" \"" + localPath + "\" \"" + targetPath + "\"", function(err) {
        if (!err) {
          return;
        }
        return getLogger().error("Check [difftool Command] in your settings (remote-sync).\nCommand error: " + err + "\ncommand: " + diffCmd + " " + localPath + " " + targetPath);
      });
    };

    return RemoteSync;

  })();

  module.exports = {
    create: function(projectPath) {
      var configPath;
      configPath = path.join(projectPath, atom.config.get('remote-sync.configFileName'));
      if (!fs.existsSync(configPath)) {
        return;
      }
      return new RemoteSync(projectPath, configPath);
    },
    configure: function(projectPath, callback) {
      var configPath, emitter, host, view;
      if (HostView == null) {
        HostView = require('./view/host-view');
      }
      if (Host == null) {
        Host = require('./model/host');
      }
      if (EventEmitter == null) {
        EventEmitter = require("events").EventEmitter;
      }
      emitter = new EventEmitter();
      emitter.on("configured", callback);
      configPath = path.join(projectPath, atom.config.get('remote-sync.configFileName'));
      host = new Host(configPath, emitter);
      view = new HostView(host);
      return view.attach();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9yZW1vdGUtc3luYy9saWIvUmVtb3RlU3luYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9OQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1gsU0FBQSxHQUFZLE9BQUEsQ0FBUSxZQUFSOztFQUVaLElBQUEsR0FBTzs7RUFDUCxTQUFBLEdBQVk7O0VBRVosWUFBQSxHQUFlOztFQUNmLFlBQUEsR0FBZTs7RUFFZixTQUFBLEdBQVk7O0VBQ1osV0FBQSxHQUFjOztFQUNkLElBQUEsR0FBTzs7RUFFUCxRQUFBLEdBQVc7O0VBQ1gsWUFBQSxHQUFlOztFQUVmLGNBQUEsR0FBaUI7O0VBQ2pCLFVBQUEsR0FBaUI7O0VBQ2pCLGNBQUEsR0FBaUI7O0VBQ2pCLE9BQUEsR0FBaUIsUUFBUSxDQUFDLEtBQVQsQ0FBQTs7RUFHakIsTUFBQSxHQUFTOztFQUNULFNBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLElBQUcsQ0FBSSxNQUFQO01BQ0UsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO01BQ1QsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFPLGFBQVAsRUFGZjs7QUFHQSxXQUFPO0VBSkc7O0VBTU47SUFDUyxvQkFBQyxZQUFELEVBQWUsV0FBZjtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsY0FBRDtNQUFjLElBQUMsQ0FBQSxhQUFEOztRQUMxQixPQUFRLE9BQUEsQ0FBUSxjQUFSOztNQUVSLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxJQUFBLENBQUssSUFBQyxDQUFBLFVBQU47TUFDWixVQUFBLHdDQUF3QixDQUFFLEtBQWIsQ0FBbUIsR0FBbkIsQ0FBdUIsQ0FB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QUFFLENBQUMsVUFBSCxDQUFjLFVBQWQsQ0FBZDtBQUFBLGVBQUE7O0FBQ0EsYUFBVyxJQUFBLFVBQUEsQ0FBVyxXQUFYLEVBQXdCLFVBQXhCO0lBSEwsQ0FBUjtJQUtBLFNBQUEsRUFBVyxTQUFDLFdBQUQsRUFBYyxRQUFkO0FBQ1QsVUFBQTs7UUFBQSxXQUFZLE9BQUEsQ0FBUSxrQkFBUjs7O1FBQ1osT0FBUSxPQUFBLENBQVEsY0FBUjs7O1FBQ1IsZUFBZ0IsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQzs7TUFFbEMsT0FBQSxHQUFjLElBQUEsWUFBQSxDQUFBO01BQ2QsT0FBTyxDQUFDLEVBQVIsQ0FBVyxZQUFYLEVBQXlCLFFBQXpCO01BRUEsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQUF1QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLENBQXZCO01BQ2IsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLFVBQUwsRUFBaUIsT0FBakI7TUFDWCxJQUFBLEdBQVcsSUFBQSxRQUFBLENBQVMsSUFBVDthQUNYLElBQUksQ0FBQyxNQUFMLENBQUE7SUFYUyxDQUxYOztBQTlTRiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlIFwicGF0aFwiXHJcbmZzID0gcmVxdWlyZSBcImZzLXBsdXNcIlxyXG5jaG9raWRhciA9IHJlcXVpcmUgXCJjaG9raWRhclwiXHJcbnJhbmRvbWl6ZSA9IHJlcXVpcmUgXCJyYW5kb21hdGljXCJcclxuXHJcbmV4ZWMgPSBudWxsXHJcbm1pbmltYXRjaCA9IG51bGxcclxuXHJcblNjcFRyYW5zcG9ydCA9IG51bGxcclxuRnRwVHJhbnNwb3J0ID0gbnVsbFxyXG5cclxudXBsb2FkQ21kID0gbnVsbFxyXG5Eb3dubG9hZENtZCA9IG51bGxcclxuSG9zdCA9IG51bGxcclxuXHJcbkhvc3RWaWV3ID0gbnVsbFxyXG5FdmVudEVtaXR0ZXIgPSBudWxsXHJcblxyXG5Nb25pdG9yZWRGaWxlcyA9IFtdXHJcbndhdGNoRmlsZXMgICAgID0ge31cclxud2F0Y2hDaGFuZ2VTZXQgPSBmYWxzZVxyXG53YXRjaGVyICAgICAgICA9IGNob2tpZGFyLndhdGNoKClcclxuXHJcblxyXG5sb2dnZXIgPSBudWxsXHJcbmdldExvZ2dlciA9IC0+XHJcbiAgaWYgbm90IGxvZ2dlclxyXG4gICAgTG9nZ2VyID0gcmVxdWlyZSBcIi4vTG9nZ2VyXCJcclxuICAgIGxvZ2dlciA9IG5ldyBMb2dnZXIgXCJSZW1vdGUgU3luY1wiXHJcbiAgcmV0dXJuIGxvZ2dlclxyXG5cclxuY2xhc3MgUmVtb3RlU3luY1xyXG4gIGNvbnN0cnVjdG9yOiAoQHByb2plY3RQYXRoLCBAY29uZmlnUGF0aCkgLT5cclxuICAgIEhvc3QgPz0gcmVxdWlyZSAnLi9tb2RlbC9ob3N0J1xyXG5cclxuICAgIEBob3N0ID0gbmV3IEhvc3QoQGNvbmZpZ1BhdGgpXHJcbiAgICB3YXRjaEZpbGVzID0gQGhvc3Qud2F0Y2g/LnNwbGl0KFwiLFwiKS5maWx0ZXIoQm9vbGVhbilcclxuICAgIEBwcm9qZWN0UGF0aCA9IHBhdGguam9pbihAcHJvamVjdFBhdGgsIEBob3N0LnNvdXJjZSkgaWYgQGhvc3Quc291cmNlXHJcbiAgICBpZiB3YXRjaEZpbGVzP1xyXG4gICAgICBAaW5pdEF1dG9GaWxlV2F0Y2goQHByb2plY3RQYXRoKVxyXG4gICAgQGluaXRJZ25vcmUoQGhvc3QpXHJcbiAgICBAaW5pdE1vbml0b3IoKVxyXG5cclxuICBpbml0SWdub3JlOiAoaG9zdCktPlxyXG4gICAgaWdub3JlID0gaG9zdC5pZ25vcmU/LnNwbGl0KFwiLFwiKVxyXG4gICAgaG9zdC5pc0lnbm9yZSA9IChmaWxlUGF0aCwgcmVsYXRpdml6ZVBhdGgpID0+XHJcbiAgICAgIHJldHVybiB0cnVlIHVubGVzcyByZWxhdGl2aXplUGF0aCBvciBAaW5QYXRoKEBwcm9qZWN0UGF0aCwgZmlsZVBhdGgpXHJcbiAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgaWdub3JlXHJcblxyXG4gICAgICByZWxhdGl2aXplUGF0aCA9IEBwcm9qZWN0UGF0aCB1bmxlc3MgcmVsYXRpdml6ZVBhdGhcclxuICAgICAgZmlsZVBhdGggPSBwYXRoLnJlbGF0aXZlIHJlbGF0aXZpemVQYXRoLCBmaWxlUGF0aFxyXG5cclxuICAgICAgbWluaW1hdGNoID89IHJlcXVpcmUgXCJtaW5pbWF0Y2hcIlxyXG4gICAgICBmb3IgcGF0dGVybiBpbiBpZ25vcmVcclxuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBtaW5pbWF0Y2ggZmlsZVBhdGgsIHBhdHRlcm4sIHsgbWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWUgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaXNJZ25vcmU6IChmaWxlUGF0aCwgcmVsYXRpdml6ZVBhdGgpLT5cclxuICAgIHJldHVybiBAaG9zdC5pc0lnbm9yZShmaWxlUGF0aCwgcmVsYXRpdml6ZVBhdGgpXHJcblxyXG4gIGluUGF0aDogKHJvb3RQYXRoLCBsb2NhbFBhdGgpLT5cclxuICAgIGxvY2FsUGF0aCA9IGxvY2FsUGF0aCArIHBhdGguc2VwIGlmIGZzLmlzRGlyZWN0b3J5U3luYyhsb2NhbFBhdGgpXHJcbiAgICByZXR1cm4gbG9jYWxQYXRoLmluZGV4T2Yocm9vdFBhdGggKyBwYXRoLnNlcCkgPT0gMFxyXG5cclxuICBkaXNwb3NlOiAtPlxyXG4gICAgaWYgQHRyYW5zcG9ydFxyXG4gICAgICBAdHJhbnNwb3J0LmRpc3Bvc2UoKVxyXG4gICAgICBAdHJhbnNwb3J0ID0gbnVsbFxyXG5cclxuICBkZWxldGVGaWxlOiAoZmlsZVBhdGgpIC0+XHJcbiAgICByZXR1cm4gaWYgQGlzSWdub3JlKGZpbGVQYXRoKVxyXG5cclxuICAgIGlmIG5vdCB1cGxvYWRDbWRcclxuICAgICAgVXBsb2FkTGlzdGVuZXIgPSByZXF1aXJlIFwiLi9VcGxvYWRMaXN0ZW5lclwiXHJcbiAgICAgIHVwbG9hZENtZCA9IG5ldyBVcGxvYWRMaXN0ZW5lciBnZXRMb2dnZXIoKVxyXG5cclxuICAgIHVwbG9hZENtZC5oYW5kbGVEZWxldGUoZmlsZVBhdGgsIEBnZXRUcmFuc3BvcnQoKSlcclxuICAgIGZvciB0IGluIEBnZXRVcGxvYWRNaXJyb3JzKClcclxuICAgICAgdXBsb2FkQ21kLmhhbmRsZURlbGV0ZShmaWxlUGF0aCwgdClcclxuXHJcbiAgICBpZiBAaG9zdC5kZWxldGVMb2NhbFxyXG4gICAgICBmcy5yZW1vdmVTeW5jKGZpbGVQYXRoKVxyXG5cclxuICBkb3dubG9hZEZvbGRlcjogKGxvY2FsUGF0aCwgdGFyZ2V0UGF0aCwgY2FsbGJhY2spLT5cclxuICAgIERvd25sb2FkQ21kID89IHJlcXVpcmUgJy4vY29tbWFuZHMvRG93bmxvYWRBbGxDb21tYW5kJ1xyXG4gICAgRG93bmxvYWRDbWQucnVuKGdldExvZ2dlcigpLCBAZ2V0VHJhbnNwb3J0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxQYXRoLCB0YXJnZXRQYXRoLCBjYWxsYmFjaylcclxuXHJcbiAgZG93bmxvYWRGaWxlOiAobG9jYWxQYXRoKS0+XHJcbiAgICByZXR1cm4gaWYgQGlzSWdub3JlKGxvY2FsUGF0aClcclxuICAgIHJlYWxQYXRoID0gcGF0aC5yZWxhdGl2ZShAcHJvamVjdFBhdGgsIGxvY2FsUGF0aClcclxuICAgIHJlYWxQYXRoID0gcGF0aC5qb2luKEBob3N0LnRhcmdldCwgcmVhbFBhdGgpLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpXHJcbiAgICBAZ2V0VHJhbnNwb3J0KCkuZG93bmxvYWQocmVhbFBhdGgpXHJcblxyXG4gIHVwbG9hZEZpbGU6IChmaWxlUGF0aCkgLT5cclxuICAgIHJldHVybiBpZiBAaXNJZ25vcmUoZmlsZVBhdGgpXHJcblxyXG4gICAgaWYgbm90IHVwbG9hZENtZFxyXG4gICAgICBVcGxvYWRMaXN0ZW5lciA9IHJlcXVpcmUgXCIuL1VwbG9hZExpc3RlbmVyXCJcclxuICAgICAgdXBsb2FkQ21kID0gbmV3IFVwbG9hZExpc3RlbmVyIGdldExvZ2dlcigpXHJcblxyXG4gICAgaWYgQGhvc3Quc2F2ZU9uVXBsb2FkXHJcbiAgICAgIGZvciBlIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcclxuICAgICAgICBpZiBlLmdldFBhdGgoKSBpcyBmaWxlUGF0aCBhbmQgZS5pc01vZGlmaWVkKClcclxuICAgICAgICAgIGUuc2F2ZSgpXHJcbiAgICAgICAgICByZXR1cm4gaWYgQGhvc3QudXBsb2FkT25TYXZlXHJcblxyXG4gICAgdXBsb2FkQ21kLmhhbmRsZVNhdmUoZmlsZVBhdGgsIEBnZXRUcmFuc3BvcnQoKSlcclxuICAgIGZvciB0IGluIEBnZXRVcGxvYWRNaXJyb3JzKClcclxuICAgICAgdXBsb2FkQ21kLmhhbmRsZVNhdmUoZmlsZVBhdGgsIHQpXHJcblxyXG4gIHVwbG9hZEZvbGRlcjogKGRpclBhdGgpLT5cclxuICAgIGZzLnRyYXZlcnNlVHJlZSBkaXJQYXRoLCBAdXBsb2FkRmlsZS5iaW5kKEApLCA9PlxyXG4gICAgICByZXR1cm4gbm90IEBpc0lnbm9yZShkaXJQYXRoKVxyXG5cclxuICBpbml0TW9uaXRvcjogKCktPlxyXG4gICAgX3RoaXMgPSBAXHJcbiAgICBzZXRUaW1lb3V0IC0+XHJcbiAgICAgIE11dGF0aW9uT2JzZXJ2ZXIgPSB3aW5kb3cuTXV0YXRpb25PYnNlcnZlciBvciB3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlclxyXG4gICAgICBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMsIG9ic2VydmVyKSAtPlxyXG4gICAgICAgIF90aGlzLm1vbml0b3JTdHlsZXMoKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICApXHJcblxyXG4gICAgICB0YXJnZXRPYmplY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yICcudHJlZS12aWV3J1xyXG4gICAgICBpZiB0YXJnZXRPYmplY3QgIT0gbnVsbFxyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUgdGFyZ2V0T2JqZWN0LFxyXG4gICAgICAgICAgc3VidHJlZTogdHJ1ZVxyXG4gICAgICAgICAgYXR0cmlidXRlczogZmFsc2VcclxuICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxyXG4gICAgLCAyNTBcclxuXHJcbiAgbW9uaXRvckZpbGU6IChkaXJQYXRoLCB0b2dnbGUgPSB0cnVlLCBub3RpZmljYXRpb25zID0gdHJ1ZSktPlxyXG4gICAgcmV0dXJuIGlmICFAZmlsZUV4aXN0cyhkaXJQYXRoKSAmJiAhQGlzRGlyZWN0b3J5KGRpclBhdGgpXHJcblxyXG4gICAgZmlsZU5hbWUgPSBALm1vbml0b3JGaWxlTmFtZShkaXJQYXRoKVxyXG4gICAgaWYgZGlyUGF0aCBub3QgaW4gTW9uaXRvcmVkRmlsZXNcclxuICAgICAgTW9uaXRvcmVkRmlsZXMucHVzaCBkaXJQYXRoXHJcbiAgICAgIHdhdGNoZXIuYWRkKGRpclBhdGgpXHJcbiAgICAgIGlmIG5vdGlmaWNhdGlvbnNcclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcInJlbW90ZS1zeW5jOiBXYXRjaGluZyBmaWxlIC0gKlwiK2ZpbGVOYW1lK1wiKlwiXHJcblxyXG4gICAgICBpZiAhd2F0Y2hDaGFuZ2VTZXRcclxuICAgICAgICBfdGhpcyA9IEBcclxuICAgICAgICB3YXRjaGVyLm9uKCdjaGFuZ2UnLCAocGF0aCkgLT5cclxuICAgICAgICAgIF90aGlzLnVwbG9hZEZpbGUocGF0aClcclxuICAgICAgICApXHJcbiAgICAgICAgd2F0Y2hlci5vbigndW5saW5rJywgKHBhdGgpIC0+XHJcbiAgICAgICAgICBfdGhpcy5kZWxldGVGaWxlKHBhdGgpXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHdhdGNoQ2hhbmdlU2V0ID0gdHJ1ZVxyXG4gICAgZWxzZSBpZiB0b2dnbGVcclxuICAgICAgd2F0Y2hlci51bndhdGNoKGRpclBhdGgpXHJcbiAgICAgIGluZGV4ID0gTW9uaXRvcmVkRmlsZXMuaW5kZXhPZihkaXJQYXRoKVxyXG4gICAgICBNb25pdG9yZWRGaWxlcy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICAgIGlmIG5vdGlmaWNhdGlvbnNcclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcInJlbW90ZS1zeW5jOiBVbndhdGNoaW5nIGZpbGUgLSAqXCIrZmlsZU5hbWUrXCIqXCJcclxuICAgIEAubW9uaXRvclN0eWxlcygpXHJcblxyXG4gIG1vbml0b3JTdHlsZXM6ICgpLT5cclxuICAgIG1vbml0b3JDbGFzcyAgPSAnZmlsZS1tb25pdG9yaW5nJ1xyXG4gICAgcHVsc2VDbGFzcyAgICA9ICdwdWxzZSdcclxuICAgIG1vbml0b3JlZCAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsICcuJyttb25pdG9yQ2xhc3NcclxuXHJcbiAgICBpZiBtb25pdG9yZWQgIT0gbnVsbCBhbmQgbW9uaXRvcmVkLmxlbmd0aCAhPSAwXHJcbiAgICAgIGZvciBpdGVtIGluIG1vbml0b3JlZFxyXG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSBtb25pdG9yQ2xhc3NcclxuXHJcbiAgICBmb3IgZmlsZSBpbiBNb25pdG9yZWRGaWxlc1xyXG4gICAgICBmaWxlX25hbWUgPSBmaWxlLnJlcGxhY2UoLyhbJ1wiXSkvZywgXCJcXFxcJDFcIik7XHJcbiAgICAgIGZpbGVfbmFtZSA9IGZpbGUucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKTtcclxuICAgICAgaWNvbl9maWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciAnW2RhdGEtcGF0aD1cIicrZmlsZV9uYW1lKydcIl0nXHJcbiAgICAgIGlmIGljb25fZmlsZSAhPSBudWxsXHJcbiAgICAgICAgbGlzdF9pdGVtID0gaWNvbl9maWxlLnBhcmVudE5vZGVcclxuICAgICAgICBsaXN0X2l0ZW0uY2xhc3NMaXN0LmFkZCBtb25pdG9yQ2xhc3NcclxuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJyZW1vdGUtc3luYy5tb25pdG9yRmlsZUFuaW1hdGlvblwiKVxyXG4gICAgICAgICAgbGlzdF9pdGVtLmNsYXNzTGlzdC5hZGQgcHVsc2VDbGFzc1xyXG5cclxuICBtb25pdG9yRmlsZXNMaXN0OiAoKS0+XHJcbiAgICBmaWxlcyAgICAgICAgPSBcIlwiXHJcbiAgICB3YXRjaGVkUGF0aHMgPSB3YXRjaGVyLmdldFdhdGNoZWQoKVxyXG4gICAgZm9yIGssdiBvZiB3YXRjaGVkUGF0aHNcclxuICAgICAgZm9yIGZpbGUgaW4gd2F0Y2hlZFBhdGhzW2tdXHJcbiAgICAgICAgZmlsZXMgKz0gZmlsZStcIjxici8+XCJcclxuICAgIGlmIGZpbGVzICE9IFwiXCJcclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJyZW1vdGUtc3luYzogQ3VycmVudGx5IHdhdGNoaW5nOjxici8+KlwiK2ZpbGVzK1wiKlwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwicmVtb3RlLXN5bmM6IEN1cnJlbnRseSBub3Qgd2F0Y2hpbmcgYW55IGZpbGVzXCJcclxuXHJcbiAgZmlsZUV4aXN0czogKGRpclBhdGgpIC0+XHJcbiAgICBmaWxlX25hbWUgPSBAbW9uaXRvckZpbGVOYW1lKGRpclBhdGgpXHJcbiAgICB0cnlcclxuICAgICAgZXhpc3RzID0gZnMuc3RhdFN5bmMoZGlyUGF0aClcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGNhdGNoIGVcclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJyZW1vdGUtc3luYzogY2Fubm90IGZpbmQgKlwiK2ZpbGVfbmFtZStcIiogdG8gd2F0Y2hcIlxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaXNEaXJlY3Rvcnk6IChkaXJQYXRoKSAtPlxyXG4gICAgaWYgZGlyZWN0b3J5ID0gZnMuc3RhdFN5bmMoZGlyUGF0aCkuaXNEaXJlY3RvcnkoKVxyXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcInJlbW90ZS1zeW5jOiBjYW5ub3Qgd2F0Y2ggZGlyZWN0b3J5IC0gKlwiK2RpclBhdGgrXCIqXCJcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgbW9uaXRvckZpbGVOYW1lOiAoZGlyUGF0aCktPlxyXG4gICAgZmlsZSA9IGRpclBhdGguc3BsaXQoJ1xcXFwnKS5wb3AoKS5zcGxpdCgnLycpLnBvcCgpXHJcbiAgICByZXR1cm4gZmlsZVxyXG5cclxuICBpbml0QXV0b0ZpbGVXYXRjaDogKHByb2plY3RQYXRoKSAtPlxyXG4gICAgX3RoaXMgPSBAXHJcbiAgICBpZiB3YXRjaEZpbGVzLmxlbmd0aCAhPSAwXHJcbiAgICAgIF90aGlzLnNldHVwQXV0b0ZpbGVXYXRjaCBmaWxlc05hbWUscHJvamVjdFBhdGggZm9yIGZpbGVzTmFtZSBpbiB3YXRjaEZpbGVzXHJcbiAgICAgIHNldFRpbWVvdXQgLT5cclxuICAgICAgICBfdGhpcy5tb25pdG9yRmlsZXNMaXN0KClcclxuICAgICAgLCAxNTAwXHJcbiAgICAgIHJldHVyblxyXG5cclxuICBzZXR1cEF1dG9GaWxlV2F0Y2g6IChmaWxlc05hbWUscHJvamVjdFBhdGgpIC0+XHJcbiAgICBfdGhpcyA9IEBcclxuICAgIHNldFRpbWVvdXQgLT5cclxuICAgICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSA9PSBcIndpbjMyXCJcclxuICAgICAgICBmaWxlc05hbWUgPSBmaWxlc05hbWUucmVwbGFjZSgvXFwvL2csICdcXFxcJylcclxuICAgICAgZnVsbHBhdGggPSBwcm9qZWN0UGF0aCArIGZpbGVzTmFtZS5yZXBsYWNlIC9eXFxzK3xcXHMrJC9nLCBcIlwiXHJcbiAgICAgIF90aGlzLm1vbml0b3JGaWxlKGZ1bGxwYXRoLGZhbHNlLGZhbHNlKVxyXG4gICAgLCAyNTBcclxuXHJcblxyXG4gIHVwbG9hZEdpdENoYW5nZTogKGRpclBhdGgpLT5cclxuICAgIHJlcG9zID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpXHJcbiAgICBjdXJSZXBvID0gbnVsbFxyXG4gICAgZm9yIHJlcG8gaW4gcmVwb3NcclxuICAgICAgY29udGludWUgdW5sZXNzIHJlcG9cclxuICAgICAgd29ya2luZ0RpcmVjdG9yeSA9IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXHJcbiAgICAgIGlmIEBpblBhdGgod29ya2luZ0RpcmVjdG9yeSwgQHByb2plY3RQYXRoKVxyXG4gICAgICAgIGN1clJlcG8gPSByZXBvXHJcbiAgICAgICAgYnJlYWtcclxuICAgIHJldHVybiB1bmxlc3MgY3VyUmVwb1xyXG5cclxuICAgIGlzQ2hhbmdlZFBhdGggPSAocGF0aCktPlxyXG4gICAgICBzdGF0dXMgPSBjdXJSZXBvLmdldENhY2hlZFBhdGhTdGF0dXMocGF0aClcclxuICAgICAgcmV0dXJuIGN1clJlcG8uaXNTdGF0dXNNb2RpZmllZChzdGF0dXMpIG9yIGN1clJlcG8uaXNTdGF0dXNOZXcoc3RhdHVzKVxyXG5cclxuICAgIGZzLnRyYXZlcnNlVHJlZSBkaXJQYXRoLCAocGF0aCk9PlxyXG4gICAgICBAdXBsb2FkRmlsZShwYXRoKSBpZiBpc0NoYW5nZWRQYXRoKHBhdGgpXHJcbiAgICAsIChwYXRoKT0+IHJldHVybiBub3QgQGlzSWdub3JlKHBhdGgpXHJcblxyXG4gIGNyZWF0ZVRyYW5zcG9ydDogKGhvc3QpLT5cclxuICAgIGlmIGhvc3QudHJhbnNwb3J0IGlzICdzY3AnIG9yIGhvc3QudHJhbnNwb3J0IGlzICdzZnRwJ1xyXG4gICAgICBTY3BUcmFuc3BvcnQgPz0gcmVxdWlyZSBcIi4vdHJhbnNwb3J0cy9TY3BUcmFuc3BvcnRcIlxyXG4gICAgICBUcmFuc3BvcnQgPSBTY3BUcmFuc3BvcnRcclxuICAgIGVsc2UgaWYgaG9zdC50cmFuc3BvcnQgaXMgJ2Z0cCdcclxuICAgICAgRnRwVHJhbnNwb3J0ID89IHJlcXVpcmUgXCIuL3RyYW5zcG9ydHMvRnRwVHJhbnNwb3J0XCJcclxuICAgICAgVHJhbnNwb3J0ID0gRnRwVHJhbnNwb3J0XHJcbiAgICBlbHNlXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIltyZW1vdGUtc3luY10gaW52YWxpZCB0cmFuc3BvcnQ6IFwiICsgaG9zdC50cmFuc3BvcnQgKyBcIiBpbiBcIiArIEBjb25maWdQYXRoKVxyXG5cclxuICAgIHJldHVybiBuZXcgVHJhbnNwb3J0KGdldExvZ2dlcigpLCBob3N0LCBAcHJvamVjdFBhdGgpXHJcblxyXG4gIGdldFRyYW5zcG9ydDogLT5cclxuICAgIHJldHVybiBAdHJhbnNwb3J0IGlmIEB0cmFuc3BvcnRcclxuICAgIEB0cmFuc3BvcnQgPSBAY3JlYXRlVHJhbnNwb3J0KEBob3N0KVxyXG4gICAgcmV0dXJuIEB0cmFuc3BvcnRcclxuXHJcbiAgZ2V0VXBsb2FkTWlycm9yczogLT5cclxuICAgIHJldHVybiBAbWlycm9yVHJhbnNwb3J0cyBpZiBAbWlycm9yVHJhbnNwb3J0c1xyXG4gICAgQG1pcnJvclRyYW5zcG9ydHMgPSBbXVxyXG4gICAgaWYgQGhvc3QudXBsb2FkTWlycm9yc1xyXG4gICAgICBmb3IgaG9zdCBpbiBAaG9zdC51cGxvYWRNaXJyb3JzXHJcbiAgICAgICAgQGluaXRJZ25vcmUoaG9zdClcclxuICAgICAgICBAbWlycm9yVHJhbnNwb3J0cy5wdXNoIEBjcmVhdGVUcmFuc3BvcnQoaG9zdClcclxuICAgIHJldHVybiBAbWlycm9yVHJhbnNwb3J0c1xyXG5cclxuICBkaWZmRmlsZTogKGxvY2FsUGF0aCktPlxyXG4gICAgcmVhbFBhdGggPSBwYXRoLnJlbGF0aXZlKEBwcm9qZWN0UGF0aCwgbG9jYWxQYXRoKVxyXG4gICAgcmVhbFBhdGggPSBwYXRoLmpvaW4oQGhvc3QudGFyZ2V0LCByZWFsUGF0aCkucmVwbGFjZSgvXFxcXC9nLCBcIi9cIilcclxuXHJcbiAgICBvcyA9IHJlcXVpcmUgXCJvc1wiIGlmIG5vdCBvc1xyXG4gICAgdGFyZ2V0UGF0aCA9IHBhdGguam9pbiBvcy50bXBEaXIoKSwgXCJyZW1vdGUtc3luY1wiLCByYW5kb21pemUoJ0EwJywgMTYpXHJcblxyXG4gICAgQGdldFRyYW5zcG9ydCgpLmRvd25sb2FkIHJlYWxQYXRoLCB0YXJnZXRQYXRoLCA9PlxyXG4gICAgICBAZGlmZiBsb2NhbFBhdGgsIHRhcmdldFBhdGhcclxuXHJcbiAgZGlmZkZvbGRlcjogKGxvY2FsUGF0aCktPlxyXG4gICAgb3MgPSByZXF1aXJlIFwib3NcIiBpZiBub3Qgb3NcclxuICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4gb3MudG1wRGlyKCksIFwicmVtb3RlLXN5bmNcIiwgcmFuZG9taXplKCdBMCcsIDE2KVxyXG4gICAgQGRvd25sb2FkRm9sZGVyIGxvY2FsUGF0aCwgdGFyZ2V0UGF0aCwgPT5cclxuICAgICAgQGRpZmYgbG9jYWxQYXRoLCB0YXJnZXRQYXRoXHJcblxyXG4gIGRpZmY6IChsb2NhbFBhdGgsIHRhcmdldFBhdGgpIC0+XHJcbiAgICByZXR1cm4gaWYgQGlzSWdub3JlKGxvY2FsUGF0aClcclxuICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UGF0aCwgcGF0aC5yZWxhdGl2ZShAcHJvamVjdFBhdGgsIGxvY2FsUGF0aCkpXHJcbiAgICBkaWZmQ21kID0gYXRvbS5jb25maWcuZ2V0KCdyZW1vdGUtc3luYy5kaWZmdG9vbENvbW1hbmQnKVxyXG4gICAgZXhlYyA/PSByZXF1aXJlKFwiY2hpbGRfcHJvY2Vzc1wiKS5leGVjXHJcbiAgICBleGVjIFwiXFxcIiN7ZGlmZkNtZH1cXFwiIFxcXCIje2xvY2FsUGF0aH1cXFwiIFxcXCIje3RhcmdldFBhdGh9XFxcIlwiLCAoZXJyKS0+XHJcbiAgICAgIHJldHVybiBpZiBub3QgZXJyXHJcbiAgICAgIGdldExvZ2dlcigpLmVycm9yIFwiXCJcIkNoZWNrIFtkaWZmdG9vbCBDb21tYW5kXSBpbiB5b3VyIHNldHRpbmdzIChyZW1vdGUtc3luYykuXHJcbiAgICAgICBDb21tYW5kIGVycm9yOiAje2Vycn1cclxuICAgICAgIGNvbW1hbmQ6ICN7ZGlmZkNtZH0gI3tsb2NhbFBhdGh9ICN7dGFyZ2V0UGF0aH1cclxuICAgICAgXCJcIlwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgY3JlYXRlOiAocHJvamVjdFBhdGgpLT5cclxuICAgIGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4gcHJvamVjdFBhdGgsIGF0b20uY29uZmlnLmdldCgncmVtb3RlLXN5bmMuY29uZmlnRmlsZU5hbWUnKVxyXG4gICAgcmV0dXJuIHVubGVzcyBmcy5leGlzdHNTeW5jIGNvbmZpZ1BhdGhcclxuICAgIHJldHVybiBuZXcgUmVtb3RlU3luYyhwcm9qZWN0UGF0aCwgY29uZmlnUGF0aClcclxuXHJcbiAgY29uZmlndXJlOiAocHJvamVjdFBhdGgsIGNhbGxiYWNrKS0+XHJcbiAgICBIb3N0VmlldyA/PSByZXF1aXJlICcuL3ZpZXcvaG9zdC12aWV3J1xyXG4gICAgSG9zdCA/PSByZXF1aXJlICcuL21vZGVsL2hvc3QnXHJcbiAgICBFdmVudEVtaXR0ZXIgPz0gcmVxdWlyZShcImV2ZW50c1wiKS5FdmVudEVtaXR0ZXJcclxuXHJcbiAgICBlbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpXHJcbiAgICBlbWl0dGVyLm9uIFwiY29uZmlndXJlZFwiLCBjYWxsYmFja1xyXG5cclxuICAgIGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4gcHJvamVjdFBhdGgsIGF0b20uY29uZmlnLmdldCgncmVtb3RlLXN5bmMuY29uZmlnRmlsZU5hbWUnKVxyXG4gICAgaG9zdCA9IG5ldyBIb3N0KGNvbmZpZ1BhdGgsIGVtaXR0ZXIpXHJcbiAgICB2aWV3ID0gbmV3IEhvc3RWaWV3KGhvc3QpXHJcbiAgICB2aWV3LmF0dGFjaCgpXHJcbiJdfQ==
