(function() {
  var $, CompositeDisposable, RemoteSync, configure, disposables, fs, getEventPath, handleEvent, initProject, path, projectDict, reload;

  fs = require('fs-plus');

  CompositeDisposable = null;

  path = null;

  $ = null;

  getEventPath = function(e) {
    var fullPath, projectPath, ref, relativePath, target;
    if ($ == null) {
      $ = require('atom-space-pen-views').$;
    }
    target = $(e.target).closest('.file, .directory, .tab')[0];
    if (target == null) {
      target = atom.workspace.getActiveTextEditor();
    }
    fullPath = target != null ? typeof target.getPath === "function" ? target.getPath() : void 0 : void 0;
    if (!fullPath) {
      return [];
    }
    ref = atom.project.relativizePath(fullPath), projectPath = ref[0], relativePath = ref[1];
    return [projectPath, fullPath];
  };

  projectDict = null;

  disposables = null;

  RemoteSync = null;

  initProject = function(projectPaths) {
    var disposes, err, i, j, len, len1, obj, projectPath, results;
    disposes = [];
    for (projectPath in projectDict) {
      if (projectPaths.indexOf(projectPath) === -1) {
        disposes.push(projectPath);
      }
    }
    for (i = 0, len = disposes.length; i < len; i++) {
      projectPath = disposes[i];
      projectDict[projectPath].dispose();
      delete projectDict[projectPath];
    }
    results = [];
    for (j = 0, len1 = projectPaths.length; j < len1; j++) {
      projectPath = projectPaths[j];
      try {
        projectPath = fs.realpathSync(projectPath);
      } catch (error) {
        err = error;
        continue;
      }
      if (projectDict[projectPath]) {
        continue;
      }
      if (RemoteSync == null) {
        RemoteSync = require("./lib/RemoteSync");
      }
      obj = RemoteSync.create(projectPath);
      if (obj) {
        results.push(projectDict[projectPath] = obj);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  handleEvent = function(e, cmd) {
    var fullPath, projectObj, projectPath, ref;
    ref = getEventPath(e), projectPath = ref[0], fullPath = ref[1];
    if (!projectPath) {
      return;
    }
    projectObj = projectDict[fs.realpathSync(projectPath)];
    return typeof projectObj[cmd] === "function" ? projectObj[cmd](fs.realpathSync(fullPath)) : void 0;
  };

  reload = function(projectPath) {
    var ref;
    if ((ref = projectDict[projectPath]) != null) {
      ref.dispose();
    }
    return projectDict[projectPath] = RemoteSync.create(projectPath);
  };

  configure = function(e) {
    var projectPath;
    projectPath = getEventPath(e)[0];
    if (!projectPath) {
      return;
    }
    projectPath = fs.realpathSync(projectPath);
    if (RemoteSync == null) {
      RemoteSync = require("./lib/RemoteSync");
    }
    return RemoteSync.configure(projectPath, function() {
      return reload(projectPath);
    });
  };

  module.exports = {
    config: {
      logToConsole: {
        type: 'boolean',
        "default": false,
        title: 'Log to console',
        description: 'Log messages to the console instead of the status view at the bottom of the window'
      },
      autoHideLogPanel: {
        type: 'boolean',
        "default": false,
        title: 'Hide log panel after transferring',
        description: 'Hides the status view at the bottom of the window after the transfer operation is done'
      },
      foldLogPanel: {
        type: 'boolean',
        "default": false,
        title: 'Fold log panel by default',
        description: 'Shows only one line in the status view'
      },
      monitorFileAnimation: {
        type: 'boolean',
        "default": true,
        title: 'Monitor file animation',
        description: 'Toggles the pulse animation for a monitored file'
      },
      difftoolCommand: {
        type: 'string',
        "default": '',
        title: 'Diff tool command',
        description: 'The command to run for your diff tool'
      },
      configFileName: {
        type: 'string',
        "default": '.remote-sync.json'
      }
    },
    activate: function(state) {
      projectDict = {};
      initProject(atom.project.getPaths());
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      disposables = new CompositeDisposable;
      disposables.add(atom.commands.add('atom-workspace', {
        'remote-sync:upload-folder': function(e) {
          return handleEvent(e, "uploadFolder");
        },
        'remote-sync:upload-file': function(e) {
          return handleEvent(e, "uploadFile");
        },
        'remote-sync:delete-file': function(e) {
          return handleEvent(e, "deleteFile");
        },
        'remote-sync:delete-folder': function(e) {
          return handleEvent(e, "deleteFile");
        },
        'remote-sync:download-file': function(e) {
          return handleEvent(e, "downloadFile");
        },
        'remote-sync:download-folder': function(e) {
          return handleEvent(e, "downloadFolder");
        },
        'remote-sync:diff-file': function(e) {
          return handleEvent(e, "diffFile");
        },
        'remote-sync:diff-folder': function(e) {
          return handleEvent(e, "diffFolder");
        },
        'remote-sync:upload-git-change': function(e) {
          return handleEvent(e, "uploadGitChange");
        },
        'remote-sync:monitor-file': function(e) {
          return handleEvent(e, "monitorFile");
        },
        'remote-sync:monitor-files-list': function(e) {
          return handleEvent(e, "monitorFilesList");
        },
        'remote-sync:configure': configure
      }));
      disposables.add(atom.project.onDidChangePaths(function(projectPaths) {
        return initProject(projectPaths);
      }));
      return disposables.add(atom.workspace.observeTextEditors(function(editor) {
        var onDidDestroy, onDidSave;
        onDidSave = editor.onDidSave(function(e) {
          var fullPath, projectObj, projectPath, ref, relativePath;
          fullPath = e.path;
          ref = atom.project.relativizePath(fullPath), projectPath = ref[0], relativePath = ref[1];
          if (!projectPath) {
            return;
          }
          projectPath = fs.realpathSync(projectPath);
          projectObj = projectDict[projectPath];
          if (!projectObj) {
            return;
          }
          if (fs.realpathSync(fullPath) === fs.realpathSync(projectObj.configPath)) {
            projectObj = reload(projectPath);
          }
          if (!projectObj.host.uploadOnSave) {
            return;
          }
          return projectObj.uploadFile(fs.realpathSync(fullPath));
        });
        onDidDestroy = editor.onDidDestroy(function() {
          disposables.remove(onDidSave);
          disposables.remove(onDidDestroy);
          onDidDestroy.dispose();
          return onDidSave.dispose();
        });
        disposables.add(onDidSave);
        return disposables.add(onDidDestroy);
      }));
    },
    deactivate: function() {
      var obj, projectPath;
      disposables.dispose();
      disposables = null;
      for (projectPath in projectDict) {
        obj = projectDict[projectPath];
        obj.dispose();
      }
      return projectDict = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9yZW1vdGUtc3luYy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxtQkFBQSxHQUFzQjs7RUFDdEIsSUFBQSxHQUFPOztFQUNQLENBQUEsR0FBSTs7RUFFSixZQUFBLEdBQWUsU0FBQyxDQUFEO0FBQ2IsUUFBQTs7TUFBQSxJQUFLLE9BQUEsQ0FBUSxzQkFBUixDQUErQixDQUFDOztJQUVyQyxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLHlCQUFwQixDQUErQyxDQUFBLENBQUE7O01BQ3hELFNBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBOztJQUVWLFFBQUEsMkRBQVcsTUFBTSxDQUFFO0lBQ25CLElBQUEsQ0FBaUIsUUFBakI7QUFBQSxhQUFPLEdBQVA7O0lBRUEsTUFBOEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQTlCLEVBQUMsb0JBQUQsRUFBYztBQUNkLFdBQU8sQ0FBQyxXQUFELEVBQWMsUUFBZDtFQVZNOztFQVlmLFdBQUEsR0FBYzs7RUFDZCxXQUFBLEdBQWM7O0VBQ2QsVUFBQSxHQUFhOztFQUNiLFdBQUEsR0FBYyxTQUFDLFlBQUQ7QUFDWixRQUFBO0lBQUEsUUFBQSxHQUFXO0FBQ1gsU0FBQSwwQkFBQTtNQUNFLElBQTZCLFlBQVksQ0FBQyxPQUFiLENBQXFCLFdBQXJCLENBQUEsS0FBcUMsQ0FBQyxDQUFuRTtRQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsV0FBZCxFQUFBOztBQURGO0FBR0EsU0FBQSwwQ0FBQTs7TUFDRSxXQUFZLENBQUEsV0FBQSxDQUFZLENBQUMsT0FBekIsQ0FBQTtNQUNBLE9BQU8sV0FBWSxD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QUFsQyxDQUFoQjtJQXpCUSxDQTlCVjtJQWlGQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxXQUFXLENBQUMsT0FBWixDQUFBO01BQ0EsV0FBQSxHQUFjO0FBQ2QsV0FBQSwwQkFBQTs7UUFDRSxHQUFHLENBQUMsT0FBSixDQUFBO0FBREY7YUFFQSxXQUFBLEdBQWM7SUFMSixDQWpGWjs7QUE1REYiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKVxyXG5cclxuQ29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGxcclxucGF0aCA9IG51bGxcclxuJCA9IG51bGxcclxuXHJcbmdldEV2ZW50UGF0aCA9IChlKS0+XHJcbiAgJCA/PSByZXF1aXJlKCdhdG9tLXNwYWNlLXBlbi12aWV3cycpLiRcclxuXHJcbiAgdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmZpbGUsIC5kaXJlY3RvcnksIC50YWInKVswXVxyXG4gIHRhcmdldCA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcclxuXHJcbiAgZnVsbFBhdGggPSB0YXJnZXQ/LmdldFBhdGg/KClcclxuICByZXR1cm4gW10gdW5sZXNzIGZ1bGxQYXRoXHJcblxyXG4gIFtwcm9qZWN0UGF0aCwgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmdWxsUGF0aClcclxuICByZXR1cm4gW3Byb2plY3RQYXRoLCBmdWxsUGF0aF1cclxuXHJcbnByb2plY3REaWN0ID0gbnVsbFxyXG5kaXNwb3NhYmxlcyA9IG51bGxcclxuUmVtb3RlU3luYyA9IG51bGxcclxuaW5pdFByb2plY3QgPSAocHJvamVjdFBhdGhzKS0+XHJcbiAgZGlzcG9zZXMgPSBbXVxyXG4gIGZvciBwcm9qZWN0UGF0aCBvZiBwcm9qZWN0RGljdFxyXG4gICAgZGlzcG9zZXMucHVzaCBwcm9qZWN0UGF0aCBpZiBwcm9qZWN0UGF0aHMuaW5kZXhPZihwcm9qZWN0UGF0aCkgPT0gLTFcclxuXHJcbiAgZm9yIHByb2plY3RQYXRoIGluIGRpc3Bvc2VzXHJcbiAgICBwcm9qZWN0RGljdFtwcm9qZWN0UGF0aF0uZGlzcG9zZSgpXHJcbiAgICBkZWxldGUgcHJvamVjdERpY3RbcHJvamVjdFBhdGhdXHJcblxyXG4gIGZvciBwcm9qZWN0UGF0aCBpbiBwcm9qZWN0UGF0aHNcclxuICAgIHRyeVxyXG4gICAgICAgIHByb2plY3RQYXRoID0gZnMucmVhbHBhdGhTeW5jKHByb2plY3RQYXRoKVxyXG4gICAgY2F0Y2ggZXJyXHJcbiAgICAgICAgY29udGludWVcclxuICAgIGNvbnRpbnVlIGlmIHByb2plY3REaWN0W3Byb2plY3RQYXRoXVxyXG4gICAgUmVtb3RlU3luYyA/PSByZXF1aXJlIFwiLi9saWIvUmVtb3RlU3luY1wiXHJcbiAgICBvYmogPSBSZW1vdGVTeW5jLmNyZWF0ZShwcm9qZWN0UGF0aClcclxuICAgIHByb2plY3REaWN0W3Byb2plY3RQYXRoXSA9IG9iaiBpZiBvYmpcclxuXHJcbmhhbmRsZUV2ZW50ID0gKGUsIGNtZCktPlxyXG4gIFtwcm9qZWN0UGF0aCwgZnVsbFBhdGhdID0gZ2V0RXZlbnRQYXRoKGUpXHJcbiAgcmV0dXJuIHVubGVzcyBwcm9qZWN0UGF0aFxyXG5cclxuICBwcm9qZWN0T2JqID0gcHJvamVjdERpY3RbZnMucmVhbHBhdGhTeW5jKHByb2plY3RQYXRoKV1cclxuICBwcm9qZWN0T2JqW2NtZF0/KGZzLnJlYWxwYXRoU3luYyhmdWxsUGF0aCkpXHJcblxyXG5yZWxvYWQgPSAocHJvamVjdFBhdGgpLT5cclxuICBwcm9qZWN0RGljdFtwcm9qZWN0UGF0aF0/LmRpc3Bvc2UoKVxyXG4gIHByb2plY3REaWN0W3Byb2plY3RQYXRoXSA9IFJlbW90ZVN5bmMuY3JlYXRlKHByb2plY3RQYXRoKVxyXG5cclxuY29uZmlndXJlID0gKGUpLT5cclxuICBbcHJvamVjdFBhdGhdID0gZ2V0RXZlbnRQYXRoKGUpXHJcbiAgcmV0dXJuIHVubGVzcyBwcm9qZWN0UGF0aFxyXG5cclxuICBwcm9qZWN0UGF0aCA9IGZzLnJlYWxwYXRoU3luYyhwcm9qZWN0UGF0aClcclxuICBSZW1vdGVTeW5jID89IHJlcXVpcmUgXCIuL2xpYi9SZW1vdGVTeW5jXCJcclxuICBSZW1vdGVTeW5jLmNvbmZpZ3VyZSBwcm9qZWN0UGF0aCwgLT4gcmVsb2FkKHByb2plY3RQYXRoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGNvbmZpZzpcclxuICAgIGxvZ1RvQ29uc29sZTpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIHRpdGxlOiAnTG9nIHRvIGNvbnNvbGUnXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnTG9nIG1lc3NhZ2VzIHRvIHRoZSBjb25zb2xlIGluc3RlYWQgb2YgdGhlIHN0YXR1cyB2aWV3IGF0IHRoZSBib3R0b20gb2YgdGhlIHdpbmRvdydcclxuICAgIGF1dG9IaWRlTG9nUGFuZWw6XHJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICB0aXRsZTogJ0hpZGUgbG9nIHBhbmVsIGFmdGVyIHRyYW5zZmVycmluZydcclxuICAgICAgZGVzY3JpcHRpb246ICdIaWRlcyB0aGUgc3RhdHVzIHZpZXcgYXQgdGhlIGJvdHRvbSBvZiB0aGUgd2luZG93IGFmdGVyIHRoZSB0cmFuc2ZlciBvcGVyYXRpb24gaXMgZG9uZSdcclxuICAgIGZvbGRMb2dQYW5lbDpcclxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXHJcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIHRpdGxlOiAnRm9sZCBsb2cgcGFuZWwgYnkgZGVmYXVsdCdcclxuICAgICAgZGVzY3JpcHRpb246ICdTaG93cyBvbmx5IG9uZSBsaW5lIGluIHRoZSBzdGF0dXMgdmlldydcclxuICAgIG1vbml0b3JGaWxlQW5pbWF0aW9uOlxyXG4gICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICB0aXRsZTogJ01vbml0b3IgZmlsZSBhbmltYXRpb24nXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnVG9nZ2xlcyB0aGUgcHVsc2UgYW5pbWF0aW9uIGZvciBhIG1vbml0b3JlZCBmaWxlJ1xyXG4gICAgZGlmZnRvb2xDb21tYW5kOlxyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgICBkZWZhdWx0OiAnJ1xyXG4gICAgICB0aXRsZTogJ0RpZmYgdG9vbCBjb21tYW5kJ1xyXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb21tYW5kIHRvIHJ1biBmb3IgeW91ciBkaWZmIHRvb2wnXHJcbiAgICBjb25maWdGaWxlTmFtZTpcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgZGVmYXVsdDogJy5yZW1vdGUtc3luYy5qc29uJ1xyXG5cclxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxyXG4gICAgcHJvamVjdERpY3QgPSB7fVxyXG4gICAgaW5pdFByb2plY3QoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpXHJcblxyXG4gICAgQ29tcG9zaXRlRGlzcG9zYWJsZSA/PSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZVxyXG4gICAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxyXG5cclxuICAgIGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XHJcbiAgICAgICdyZW1vdGUtc3luYzp1cGxvYWQtZm9sZGVyJzogKGUpLT4gaGFuZGxlRXZlbnQoZSwgXCJ1cGxvYWRGb2xkZXJcIilcclxuICAgICAgJ3JlbW90ZS1zeW5jOnVwbG9hZC1maWxlJzogKGUpLT4gaGFuZGxlRXZlbnQoZSwgXCJ1cGxvYWRGaWxlXCIpXHJcbiAgICAgICdyZW1vdGUtc3luYzpkZWxldGUtZmlsZSc6IChlKS0+IGhhbmRsZUV2ZW50KGUsIFwiZGVsZXRlRmlsZVwiKVxyXG4gICAgICAncmVtb3RlLXN5bmM6ZGVsZXRlLWZvbGRlcic6IChlKS0+IGhhbmRsZUV2ZW50KGUsIFwiZGVsZXRlRmlsZVwiKVxyXG4gICAgICAncmVtb3RlLXN5bmM6ZG93bmxvYWQtZmlsZSc6IChlKS0+IGhhbmRsZUV2ZW50KGUsIFwiZG93bmxvYWRGaWxlXCIpXHJcbiAgICAgICdyZW1vdGUtc3luYzpkb3dubG9hZC1mb2xkZXInOiAoZSktPiBoYW5kbGVFdmVudChlLCBcImRvd25sb2FkRm9sZGVyXCIpXHJcbiAgICAgICdyZW1vdGUtc3luYzpkaWZmLWZpbGUnOiAoZSktPiBoYW5kbGVFdmVudChlLCBcImRpZmZGaWxlXCIpXHJcbiAgICAgICdyZW1vdGUtc3luYzpkaWZmLWZvbGRlcic6IChlKS0+IGhhbmRsZUV2ZW50KGUsIFwiZGlmZkZvbGRlclwiKVxyXG4gICAgICAncmVtb3RlLXN5bmM6dXBsb2FkLWdpdC1jaGFuZ2UnOiAoZSktPiBoYW5kbGVFdmVudChlLCBcInVwbG9hZEdpdENoYW5nZVwiKVxyXG4gICAgICAncmVtb3RlLXN5bmM6bW9uaXRvci1maWxlJzogKGUpLT4gaGFuZGxlRXZlbnQoZSwgXCJtb25pdG9yRmlsZVwiKVxyXG4gICAgICAncmVtb3RlLXN5bmM6bW9uaXRvci1maWxlcy1saXN0JzogKGUpLT4gaGFuZGxlRXZlbnQoZSxcIm1vbml0b3JGaWxlc0xpc3RcIilcclxuICAgICAgJ3JlbW90ZS1zeW5jOmNvbmZpZ3VyZSc6IGNvbmZpZ3VyZVxyXG4gICAgfSlcclxuXHJcbiAgICBkaXNwb3NhYmxlcy5hZGQgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgKHByb2plY3RQYXRocyktPlxyXG4gICAgICBpbml0UHJvamVjdChwcm9qZWN0UGF0aHMpXHJcblxyXG4gICAgZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSAtPlxyXG4gICAgICBvbkRpZFNhdmUgPSBlZGl0b3Iub25EaWRTYXZlIChlKSAtPlxyXG4gICAgICAgIGZ1bGxQYXRoID0gZS5wYXRoXHJcbiAgICAgICAgW3Byb2plY3RQYXRoLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZ1bGxQYXRoKVxyXG4gICAgICAgIHJldHVybiB1bmxlc3MgcHJvamVjdFBhdGhcclxuXHJcbiAgICAgICAgcHJvamVjdFBhdGggPSBmcy5yZWFscGF0aFN5bmMocHJvamVjdFBhdGgpXHJcbiAgICAgICAgcHJvamVjdE9iaiA9IHByb2plY3REaWN0W3Byb2plY3RQYXRoXVxyXG4gICAgICAgIHJldHVybiB1bmxlc3MgcHJvamVjdE9ialxyXG5cclxuICAgICAgICBpZiBmcy5yZWFscGF0aFN5bmMoZnVsbFBhdGgpID09IGZzLnJlYWxwYXRoU3luYyhwcm9qZWN0T2JqLmNvbmZpZ1BhdGgpXHJcbiAgICAgICAgICBwcm9qZWN0T2JqID0gcmVsb2FkKHByb2plY3RQYXRoKVxyXG5cclxuICAgICAgICByZXR1cm4gdW5sZXNzIHByb2plY3RPYmouaG9zdC51cGxvYWRPblNhdmVcclxuICAgICAgICBwcm9qZWN0T2JqLnVwbG9hZEZpbGUoZnMucmVhbHBhdGhTeW5jKGZ1bGxQYXRoKSlcclxuXHJcblxyXG4gICAgICBvbkRpZERlc3Ryb3kgPSBlZGl0b3Iub25EaWREZXN0cm95IC0+XHJcbiAgICAgICAgZGlzcG9zYWJsZXMucmVtb3ZlIG9uRGlkU2F2ZVxyXG4gICAgICAgIGRpc3Bvc2FibGVzLnJlbW92ZSBvbkRpZERlc3Ryb3lcclxuICAgICAgICBvbkRpZERlc3Ryb3kuZGlzcG9zZSgpXHJcbiAgICAgICAgb25EaWRTYXZlLmRpc3Bvc2UoKVxyXG5cclxuICAgICAgZGlzcG9zYWJsZXMuYWRkIG9uRGlkU2F2ZVxyXG4gICAgICBkaXNwb3NhYmxlcy5hZGQgb25EaWREZXN0cm95XHJcblxyXG4gIGRlYWN0aXZhdGU6IC0+XHJcbiAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcclxuICAgIGRpc3Bvc2FibGVzID0gbnVsbFxyXG4gICAgZm9yIHByb2plY3RQYXRoLCBvYmogb2YgcHJvamVjdERpY3RcclxuICAgICAgb2JqLmRpc3Bvc2UoKVxyXG4gICAgcHJvamVjdERpY3QgPSBudWxsXHJcbiJdfQ==
