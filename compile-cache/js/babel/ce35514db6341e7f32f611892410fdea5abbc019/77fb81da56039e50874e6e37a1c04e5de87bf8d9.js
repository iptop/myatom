'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var init = function INIT() {
  var atom = global.atom;
  var copyEnabled = function copyEnabled() {
    return atom.config.get('Remote-FTP.context.enableCopyFilename');
  };
  var contextMenu = {
    '.remote-ftp-view .entries.list-tree:not(.multi-select) .directory .header': {
      enabled: copyEnabled(),
      command: [{
        label: 'Copy name',
        command: 'remote-ftp:copy-name'
      }, {
        type: 'separator'
      }]
    },
    '.remote-ftp-view .entries.list-tree:not(.multi-select) .file': {
      enabled: copyEnabled(),
      command: [{
        label: 'Copy filename',
        command: 'remote-ftp:copy-name'
      }, {
        type: 'separator'
      }]
    }
  };
  return contextMenu;
};

exports['default'] = init;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9tZW51cy9jb250ZXh0TWVudS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7O0FBRVosSUFBTSxJQUFJLEdBQUcsU0FBUyxJQUFJLEdBQUc7QUFDM0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN6QixNQUFNLFdBQVcsR0FBRyxTQUFkLFdBQVc7V0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQztHQUFBLENBQUM7QUFDbkYsTUFBTSxXQUFXLEdBQUc7QUFDbEIsK0VBQTJFLEVBQUU7QUFDM0UsYUFBTyxFQUFFLFdBQVcsRUFBRTtBQUN0QixhQUFPLEVBQUUsQ0FBQztBQUNSLGFBQUssRUFBRSxXQUFXO0FBQ2xCLGVBQU8sRUFBRSxzQkFBc0I7T0FDaEMsRUFBRTtBQUNELFlBQUksRUFBRSxXQUFXO09BQ2xCLENBQUM7S0FDSDtBQUNELGtFQUE4RCxFQUFFO0FBQzlELGFBQU8sRUFBRSxXQUFXLEVBQUU7QUFDdEIsYUFBTyxFQUFFLENBQUM7QUFDUixhQUFLLEVBQUUsZUFBZTtBQUN0QixlQUFPLEVBQUUsc0JBQXNCO09BQ2hDLEVBQUU7QUFDRCxZQUFJLEVBQUUsV0FBVztPQUNsQixDQUFDO0tBQ0g7R0FDRixDQUFDO0FBQ0YsU0FBTyxXQUFXLENBQUM7Q0FDcEIsQ0FBQzs7cUJBR2EsSUFBSSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvbWVudXMvY29udGV4dE1lbnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgaW5pdCA9IGZ1bmN0aW9uIElOSVQoKSB7XG4gIGNvbnN0IGF0b20gPSBnbG9iYWwuYXRvbTtcbiAgY29uc3QgY29weUVuYWJsZWQgPSAoKSA9PiBhdG9tLmNvbmZpZy5nZXQoJ1JlbW90ZS1GVFAuY29udGV4dC5lbmFibGVDb3B5RmlsZW5hbWUnKTtcbiAgY29uc3QgY29udGV4dE1lbnUgPSB7XG4gICAgJy5yZW1vdGUtZnRwLXZpZXcgLmVudHJpZXMubGlzdC10cmVlOm5vdCgubXVsdGktc2VsZWN0KSAuZGlyZWN0b3J5IC5oZWFkZXInOiB7XG4gICAgICBlbmFibGVkOiBjb3B5RW5hYmxlZCgpLFxuICAgICAgY29tbWFuZDogW3tcbiAgICAgICAgbGFiZWw6ICdDb3B5IG5hbWUnLFxuICAgICAgICBjb21tYW5kOiAncmVtb3RlLWZ0cDpjb3B5LW5hbWUnLFxuICAgICAgfSwge1xuICAgICAgICB0eXBlOiAnc2VwYXJhdG9yJyxcbiAgICAgIH1dLFxuICAgIH0sXG4gICAgJy5yZW1vdGUtZnRwLXZpZXcgLmVudHJpZXMubGlzdC10cmVlOm5vdCgubXVsdGktc2VsZWN0KSAuZmlsZSc6IHtcbiAgICAgIGVuYWJsZWQ6IGNvcHlFbmFibGVkKCksXG4gICAgICBjb21tYW5kOiBbe1xuICAgICAgICBsYWJlbDogJ0NvcHkgZmlsZW5hbWUnLFxuICAgICAgICBjb21tYW5kOiAncmVtb3RlLWZ0cDpjb3B5LW5hbWUnLFxuICAgICAgfSwge1xuICAgICAgICB0eXBlOiAnc2VwYXJhdG9yJyxcbiAgICAgIH1dLFxuICAgIH0sXG4gIH07XG4gIHJldHVybiBjb250ZXh0TWVudTtcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgaW5pdDtcbiJdfQ==