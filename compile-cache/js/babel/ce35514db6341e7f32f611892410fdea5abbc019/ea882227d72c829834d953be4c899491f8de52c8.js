'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var isEEXIST = function isEEXIST(path, forceBtn, cancelBtn) {
  var dismissable = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  atom.notifications.addWarning('Remote FTP: Already exists file in localhost', {
    detail: 'Delete or rename file before downloading folder ' + path,
    dismissable: dismissable,
    buttons: [{
      text: 'Delete file',
      className: 'btn btn-error',
      onDidClick: function onDidClick() {
        forceBtn(this);
      }
    }, {
      text: 'Cancel',
      className: 'btn btn-float-right',
      onDidClick: function onDidClick() {
        if (typeof cancelBtn === 'function') {
          cancelBtn(this);
        } else {
          this.removeNotification();
        }
      }
    }]
  });
};

exports.isEEXIST = isEEXIST;
var isEISDIR = function isEISDIR(path, forceBtn, cancelBtn) {
  var dismissable = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  atom.notifications.addWarning('Remote FTP: Already exists folder in localhost', {
    detail: 'Delete or rename folder before downloading file ' + path,
    dismissable: dismissable,
    buttons: [{
      text: 'Delete folder',
      className: 'btn btn-error',
      onDidClick: function onDidClick() {
        forceBtn(this);
      }
    }, {
      text: 'Cancel',
      className: 'btn btn-float-right',
      onDidClick: function onDidClick() {
        if (typeof cancelBtn === 'function') {
          cancelBtn(this);
        } else {
          this.removeNotification();
        }
      }
    }]
  });
};

exports.isEISDIR = isEISDIR;
var isAlreadyExits = function isAlreadyExits(path) {
  var type = arguments.length <= 1 || arguments[1] === undefined ? 'folder' : arguments[1];
  var dismissable = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  atom.notifications.addWarning('Remote FTP: The ' + type + ' already exists.', {
    detail: path + ' has already on the server!',
    dismissable: dismissable
  });
};

exports.isAlreadyExits = isAlreadyExits;
var isPermissionDenied = function isPermissionDenied(path) {
  var dismissable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  atom.notifications.addWarning('Remote FTP: Permission denied', {
    detail: path + ' : Permission denied',
    dismissable: dismissable
  });
};

exports.isPermissionDenied = isPermissionDenied;
var isNoChangeGroup = function isNoChangeGroup(response) {
  var dismissable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  atom.notifications.addWarning('Remote FTP: Group privileges was not changed.', {
    detail: response[0].message,
    dismissable: dismissable
  });
};

exports.isNoChangeGroup = isNoChangeGroup;
var isNoChangeOwner = function isNoChangeOwner(response) {
  var dismissable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  console.error(response);
  atom.notifications.addWarning('Remote FTP: Owner privileges was not changed.', {
    detail: response[0].message,
    dismissable: dismissable
  });
};

exports.isNoChangeOwner = isNoChangeOwner;
var isNotImplemented = function isNotImplemented(detail) {
  var dismissable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  atom.notifications.addInfo('Remote-FTP: Not implemented.', {
    detail: detail,
    dismissable: dismissable
  });
};
exports.isNotImplemented = isNotImplemented;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9ub3RpZmljYXRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7QUFFTCxJQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBSSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBeUI7TUFBdkIsV0FBVyx5REFBRyxJQUFJOztBQUNwRSxNQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyw4Q0FBOEMsRUFBRTtBQUM1RSxVQUFNLHVEQUFxRCxJQUFJLEFBQUU7QUFDakUsZUFBVyxFQUFYLFdBQVc7QUFDWCxXQUFPLEVBQUUsQ0FDUDtBQUNFLFVBQUksRUFBRSxhQUFhO0FBQ25CLGVBQVMsRUFBRSxlQUFlO0FBQzFCLGdCQUFVLEVBQUEsc0JBQUc7QUFDWCxnQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2hCO0tBQ0YsRUFDRDtBQUNFLFVBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxFQUFFLHFCQUFxQjtBQUNoQyxnQkFBVSxFQUFBLHNCQUFHO0FBQ1gsWUFBSSxPQUFPLFNBQVMsS0FBSyxVQUFVLEVBQUU7QUFDbkMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqQixNQUFNO0FBQ0wsY0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDM0I7T0FDRjtLQUNGLENBQ0Y7R0FDRixDQUFDLENBQUM7Q0FDSixDQUFDOzs7QUFFSyxJQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBSSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBeUI7TUFBdkIsV0FBVyx5REFBRyxJQUFJOztBQUNwRSxNQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxnREFBZ0QsRUFBRTtBQUM5RSxVQUFNLHVEQUFxRCxJQUFJLEFBQUU7QUFDakUsZUFBVyxFQUFYLFdBQVc7QUFDWCxXQUFPLEVBQUUsQ0FDUDtBQUNFLFVBQUksRUFBRSxlQUFlO0FBQ3JCLGVBQVMsRUFBRSxlQUFlO0FBQzFCLGdCQUFVLEVBQUEsc0JBQUc7QUFDWCxnQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2hCO0tBQ0YsRUFDRDtBQUNFLFVBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxFQUFFLHFCQUFxQjtBQUNoQyxnQkFBVSxFQUFBLHNCQUFHO0FBQ1gsWUFBSSxPQUFPLFNBQVMsS0FBSyxVQUFVLEVBQUU7QUFDbkMsbUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqQixNQUFNO0FBQ0wsY0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDM0I7T0FDRjtLQUNGLENBQ0Y7R0FDRixDQUFDLENBQUM7Q0FDSixDQUFDOzs7QUFFSyxJQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLENBQUksSUFBSSxFQUEyQztNQUF6QyxJQUFJLHlEQUFHLFFBQVE7TUFBRSxXQUFXLHlEQUFHLEtBQUs7O0FBQ3ZFLE1BQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxzQkFBb0IsSUFBSSx1QkFBb0I7QUFDdkUsVUFBTSxFQUFLLElBQUksZ0NBQTZCO0FBQzVDLGVBQVcsRUFBWCxXQUFXO0dBQ1osQ0FBQyxDQUFDO0NBQ0osQ0FBQzs7O0FBRUssSUFBTSxrQkFBa0IsR0FBRyxTQUFyQixrQkFBa0IsQ0FBSSxJQUFJLEVBQTBCO01BQXhCLFdBQVcseURBQUcsS0FBSzs7QUFDMUQsTUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsK0JBQStCLEVBQUU7QUFDN0QsVUFBTSxFQUFLLElBQUkseUJBQXNCO0FBQ3JDLGVBQVcsRUFBWCxXQUFXO0dBQ1osQ0FBQyxDQUFDO0NBQ0osQ0FBQzs7O0FBRUssSUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFJLFFBQVEsRUFBMEI7TUFBeEIsV0FBVyx5REFBRyxLQUFLOztBQUMzRCxNQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQywrQ0FBK0MsRUFBRTtBQUM3RSxVQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU87QUFDM0IsZUFBVyxFQUFYLFdBQVc7R0FDWixDQUFDLENBQUM7Q0FDSixDQUFDOzs7QUFFSyxJQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQUksUUFBUSxFQUEwQjtNQUF4QixXQUFXLHlEQUFHLEtBQUs7O0FBQzNELFNBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsTUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsK0NBQStDLEVBQUU7QUFDN0UsVUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPO0FBQzNCLGVBQVcsRUFBWCxXQUFXO0dBQ1osQ0FBQyxDQUFDO0NBQ0osQ0FBQzs7O0FBRUssSUFBTSxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBSSxNQUFNLEVBQTBCO01BQXhCLFdBQVcseURBQUcsS0FBSzs7QUFDMUQsTUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUU7QUFDekQsVUFBTSxFQUFOLE1BQU07QUFDTixlQUFXLEVBQVgsV0FBVztHQUNaLENBQUMsQ0FBQztDQUNKLENBQUMiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL25vdGlmaWNhdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZXhwb3J0IGNvbnN0IGlzRUVYSVNUID0gKHBhdGgsIGZvcmNlQnRuLCBjYW5jZWxCdG4sIGRpc21pc3NhYmxlID0gdHJ1ZSkgPT4ge1xuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnUmVtb3RlIEZUUDogQWxyZWFkeSBleGlzdHMgZmlsZSBpbiBsb2NhbGhvc3QnLCB7XG4gICAgZGV0YWlsOiBgRGVsZXRlIG9yIHJlbmFtZSBmaWxlIGJlZm9yZSBkb3dubG9hZGluZyBmb2xkZXIgJHtwYXRofWAsXG4gICAgZGlzbWlzc2FibGUsXG4gICAgYnV0dG9uczogW1xuICAgICAge1xuICAgICAgICB0ZXh0OiAnRGVsZXRlIGZpbGUnLFxuICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLWVycm9yJyxcbiAgICAgICAgb25EaWRDbGljaygpIHtcbiAgICAgICAgICBmb3JjZUJ0bih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6ICdDYW5jZWwnLFxuICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLWZsb2F0LXJpZ2h0JyxcbiAgICAgICAgb25EaWRDbGljaygpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGNhbmNlbEJ0biA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FuY2VsQnRuKHRoaXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGlmaWNhdGlvbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNFSVNESVIgPSAocGF0aCwgZm9yY2VCdG4sIGNhbmNlbEJ0biwgZGlzbWlzc2FibGUgPSB0cnVlKSA9PiB7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdSZW1vdGUgRlRQOiBBbHJlYWR5IGV4aXN0cyBmb2xkZXIgaW4gbG9jYWxob3N0Jywge1xuICAgIGRldGFpbDogYERlbGV0ZSBvciByZW5hbWUgZm9sZGVyIGJlZm9yZSBkb3dubG9hZGluZyBmaWxlICR7cGF0aH1gLFxuICAgIGRpc21pc3NhYmxlLFxuICAgIGJ1dHRvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgdGV4dDogJ0RlbGV0ZSBmb2xkZXInLFxuICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLWVycm9yJyxcbiAgICAgICAgb25EaWRDbGljaygpIHtcbiAgICAgICAgICBmb3JjZUJ0bih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6ICdDYW5jZWwnLFxuICAgICAgICBjbGFzc05hbWU6ICdidG4gYnRuLWZsb2F0LXJpZ2h0JyxcbiAgICAgICAgb25EaWRDbGljaygpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGNhbmNlbEJ0biA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FuY2VsQnRuKHRoaXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZU5vdGlmaWNhdGlvbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNBbHJlYWR5RXhpdHMgPSAocGF0aCwgdHlwZSA9ICdmb2xkZXInLCBkaXNtaXNzYWJsZSA9IGZhbHNlKSA9PiB7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKGBSZW1vdGUgRlRQOiBUaGUgJHt0eXBlfSBhbHJlYWR5IGV4aXN0cy5gLCB7XG4gICAgZGV0YWlsOiBgJHtwYXRofSBoYXMgYWxyZWFkeSBvbiB0aGUgc2VydmVyIWAsXG4gICAgZGlzbWlzc2FibGUsXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzUGVybWlzc2lvbkRlbmllZCA9IChwYXRoLCBkaXNtaXNzYWJsZSA9IGZhbHNlKSA9PiB7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdSZW1vdGUgRlRQOiBQZXJtaXNzaW9uIGRlbmllZCcsIHtcbiAgICBkZXRhaWw6IGAke3BhdGh9IDogUGVybWlzc2lvbiBkZW5pZWRgLFxuICAgIGRpc21pc3NhYmxlLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc05vQ2hhbmdlR3JvdXAgPSAocmVzcG9uc2UsIGRpc21pc3NhYmxlID0gZmFsc2UpID0+IHtcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1JlbW90ZSBGVFA6IEdyb3VwIHByaXZpbGVnZXMgd2FzIG5vdCBjaGFuZ2VkLicsIHtcbiAgICBkZXRhaWw6IHJlc3BvbnNlWzBdLm1lc3NhZ2UsXG4gICAgZGlzbWlzc2FibGUsXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzTm9DaGFuZ2VPd25lciA9IChyZXNwb25zZSwgZGlzbWlzc2FibGUgPSBmYWxzZSkgPT4ge1xuICBjb25zb2xlLmVycm9yKHJlc3BvbnNlKTtcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1JlbW90ZSBGVFA6IE93bmVyIHByaXZpbGVnZXMgd2FzIG5vdCBjaGFuZ2VkLicsIHtcbiAgICBkZXRhaWw6IHJlc3BvbnNlWzBdLm1lc3NhZ2UsXG4gICAgZGlzbWlzc2FibGUsXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzTm90SW1wbGVtZW50ZWQgPSAoZGV0YWlsLCBkaXNtaXNzYWJsZSA9IGZhbHNlKSA9PiB7XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdSZW1vdGUtRlRQOiBOb3QgaW1wbGVtZW50ZWQuJywge1xuICAgIGRldGFpbCxcbiAgICBkaXNtaXNzYWJsZSxcbiAgfSk7XG59O1xuIl19