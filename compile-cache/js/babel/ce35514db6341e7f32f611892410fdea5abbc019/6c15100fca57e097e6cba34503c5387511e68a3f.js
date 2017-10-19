Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _atom = require('atom');

var _notifications = require('../notifications');

'use babel';

var PermissionView = (function (_View) {
  _inherits(PermissionView, _View);

  function PermissionView() {
    _classCallCheck(this, PermissionView);

    _get(Object.getPrototypeOf(PermissionView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PermissionView, [{
    key: 'initialize',
    value: function initialize(params, remotes) {
      var _this = this;

      this.ftp = atom.project['remoteftp-main'];
      this.item = remotes.item;
      this.right = { r: 4, w: 2, x: 1 };

      this.disposables = new _atom.CompositeDisposable();
      this.disposables.add(atom.commands.add('atom-workspace', {
        'core:confirm': function coreConfirm() {
          _this.confirm();
        },
        'core:cancel': function coreCancel(event) {
          _this.cancel();
          event.stopPropagation();
        }
      }));

      if (typeof params.rights === 'undefined') {
        (0, _notifications.isNotImplemented)('Modification permission is not available for SFTP');
        this.destroy();
        return;
      }

      Object.keys(params.rights).forEach(function (right) {
        var perms = params.rights[right].split('');
        var $perm = (0, _atomSpacePenViews.$)(_this).find('.permission-' + right);

        for (var i = 0; i < perms.length; i++) {
          $perm.find('input[data-perm="' + perms[i] + '"]').attr('checked', true);
        }
      });

      this.chownGroup.getModel().setPlaceholderText(params.group);
      this.chownOwner.getModel().setPlaceholderText(params.owner);

      this.disposables.add(atom.tooltips.add(this.chownGroup, {
        title: 'Only number can be entered. (Valid GID)',
        placement: 'bottom'
      }), atom.tooltips.add(this.chownOwner, {
        title: 'Only number can be entered. (Valid UID)',
        placement: 'bottom'
      }));

      this.checkPermissions();
      this.show();

      (0, _atomSpacePenViews.$)(this).find('.permissions-wrapper input').on('change', function () {
        _this.checkPermissions();
      });
    }
  }, {
    key: 'checkPermissions',
    value: function checkPermissions() {
      var _this2 = this;

      this.chmod = Object.defineProperties({
        user: 0,
        group: 0,
        other: 0
      }, {
        toString: {
          get: function get() {
            return '' + this.user + this.group + this.other;
          },
          configurable: true,
          enumerable: true
        }
      });

      var chmods = {
        user: this.permissionUser,
        group: this.permissionGroup,
        other: this.permissionOther
      };

      Object.keys(chmods).forEach(function (cKey) {
        var cItem = chmods[cKey];
        var $inputs = (0, _atomSpacePenViews.$)(cItem).find('input');
        var list = {};

        for (var x = 0; x < $inputs.length; x++) {
          var $this = (0, _atomSpacePenViews.$)($inputs[x]);

          list[$this.attr('data-perm')] = $this.prop('checked');
        }

        Object.keys(list).filter(function (key) {
          return list[key];
        }).forEach(function (key) {
          _this2.chmod[cKey] += _this2.right[key];
        });
      });

      this.chmodInput.setText(this.chmod.toString);
    }
  }, {
    key: 'checkOwners',
    value: function checkOwners() {
      var groupText = this.chownGroup.getText();
      var ownerText = this.chownOwner.getText();

      if (groupText === '' && ownerText === '') return;

      var group = groupText || this.chownGroup.getModel().getPlaceholderText();
      var owner = ownerText || this.chownOwner.getModel().getPlaceholderText();

      if (groupText !== '') {
        this.ftp.client.site('CHGRP ' + group + ' ' + this.item.remote, function (response) {
          if (response[0].code !== 200) {
            (0, _notifications.isNoChangeGroup)(response);
          }
        });
      }

      if (ownerText !== '') {
        this.ftp.client.site('CHOWN ' + owner + ' ' + this.item.remote, function (response) {
          if (response[0].code !== 200) {
            (0, _notifications.isNoChangeOwner)(response);
          }
        });
      }
    }
  }, {
    key: 'confirm',
    value: function confirm() {
      this.hide();

      var command = 'CHMOD ' + this.chmodInput.getText() + ' ' + this.item.remote;

      this.checkOwners();
      this.ftp.client.site(command);
      this.item.parent.open(); // Refresh

      this.checkPermissions();
      this.destroy();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.hide();
      this.destroy();
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.show();
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.panel) {
        this.panel.hide();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.disposables.dispose();
      this.remove();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      return this.div({
        'class': 'permission-view remote-ftp'
      }, function () {
        _this3.div({
          'class': 'permissions-wrapper'
        }, function () {
          // Owner
          _this3.div({
            'class': 'permission-user block',
            outlet: 'permissionUser'
          }, function () {
            _this3.h5('Owner Permissions');

            // Read
            _this3.label('Read', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-user-read',
                'data-perm': 'r'
              });
            });

            // Write
            _this3.label('Write', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-user-write',
                'data-perm': 'w'
              });
            });

            // Execute
            _this3.label('Execute', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-user-execute',
                'data-perm': 'x'
              });
            });
          });

          // Group
          _this3.div({
            'class': 'permission-group block',
            outlet: 'permissionGroup'
          }, function () {
            _this3.h5('Group Permissions');

            // Read
            _this3.label('Read', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-group-read',
                'data-perm': 'r'
              });
            });

            // Write
            _this3.label('Write', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-group-write',
                'data-perm': 'w'
              });
            });

            // Execute
            _this3.label('Execute', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-group-execute',
                'data-perm': 'x'
              });
            });
          });

          // Public
          _this3.div({
            'class': 'permission-other block',
            outlet: 'permissionOther'
          }, function () {
            _this3.h5('Public (other) Permissions');

            // Read
            _this3.label('Read', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-other-read',
                'data-perm': 'r'
              });
            });

            // Write
            _this3.label('Write', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-other-write',
                'data-perm': 'w'
              });
            });

            // Execute
            _this3.label('Execute', {
              'class': 'input-label inline-block'
            }, function () {
              _this3.input({
                'class': 'input-checkbox',
                type: 'checkbox',
                id: 'permission-other-execute',
                'data-perm': 'x'
              });
            });
          });

          _this3.div({
            'class': 'permission-chown block'
          }, function () {
            _this3.label('Group: ', {
              'class': 'input-label inline-block'
            });

            _this3.subview('chownGroup', new _atomSpacePenViews.TextEditorView({
              mini: true,
              placeholderText: null
            }));

            _this3.label('Owner: ', {
              'class': 'input-label inline-block'
            });

            _this3.subview('chownOwner', new _atomSpacePenViews.TextEditorView({
              mini: true,
              placeholderText: null
            }));
          });
        });

        _this3.div({
          'class': 'permissions-wrapper-block'
        }, function () {
          _this3.div({
            'class': 'permissions-chmod block'
          }, function () {
            _this3.label('Chmod');
            _this3.subview('chmodInput', new _atomSpacePenViews.TextEditorView({
              mini: true,
              placeholderText: 600
            }));
          });
        });

        _this3.div({
          'class': 'block clearfix',
          outlet: 'buttonBlock'
        }, function () {
          _this3.button({
            'class': 'inline-block btn pull-right icon icon-x inline-block-tight',
            outlet: 'cancelButton',
            click: 'cancel'
          }, 'Cancel');
          _this3.button({
            'class': 'inline-block btn btn-primary pull-right icon icon-sync inline-block-tight',
            outlet: 'saveButton',
            click: 'confirm'
          }, 'Save');
        });
      });
    }
  }]);

  return PermissionView;
})(_atomSpacePenViews.View);

exports['default'] = PermissionView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi92aWV3cy9wZXJtaXNzaW9uLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2lDQUV3QyxzQkFBc0I7O29CQUMxQixNQUFNOzs2QkFDeUIsa0JBQWtCOztBQUpyRixXQUFXLENBQUM7O0lBTU4sY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOzs7ZUFBZCxjQUFjOztXQW1NUixvQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFOzs7QUFDMUIsVUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDOztBQUVsQyxVQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDO0FBQzdDLFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3ZELHNCQUFjLEVBQUUsdUJBQU07QUFDcEIsZ0JBQUssT0FBTyxFQUFFLENBQUM7U0FDaEI7QUFDRCxxQkFBYSxFQUFFLG9CQUFDLEtBQUssRUFBSztBQUN4QixnQkFBSyxNQUFNLEVBQUUsQ0FBQztBQUNkLGVBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUN6QjtPQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUN4Qyw2Q0FBaUIsbURBQW1ELENBQUMsQ0FBQztBQUN0RSxZQUFJLENBQUMsT0FBTyxF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ImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi92aWV3cy9wZXJtaXNzaW9uLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgJCwgVmlldywgVGV4dEVkaXRvclZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgeyBpc05vQ2hhbmdlR3JvdXAsIGlzTm9DaGFuZ2VPd25lciwgaXNOb3RJbXBsZW1lbnRlZCB9IGZyb20gJy4uL25vdGlmaWNhdGlvbnMnO1xuXG5jbGFzcyBQZXJtaXNzaW9uVmlldyBleHRlbmRzIFZpZXcge1xuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXYoe1xuICAgICAgY2xhc3M6ICdwZXJtaXNzaW9uLXZpZXcgcmVtb3RlLWZ0cCcsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5kaXYoe1xuICAgICAgICBjbGFzczogJ3Blcm1pc3Npb25zLXdyYXBwZXInLFxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAvLyBPd25lclxuICAgICAgICB0aGlzLmRpdih7XG4gICAgICAgICAgY2xhc3M6ICdwZXJtaXNzaW9uLXVzZXIgYmxvY2snLFxuICAgICAgICAgIG91dGxldDogJ3Blcm1pc3Npb25Vc2VyJyxcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaDUoJ093bmVyIFBlcm1pc3Npb25zJyk7XG5cbiAgICAgICAgICAvLyBSZWFkXG4gICAgICAgICAgdGhpcy5sYWJlbCgnUmVhZCcsIHtcbiAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtbGFiZWwgaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0KHtcbiAgICAgICAgICAgICAgY2xhc3M6ICdpbnB1dC1jaGVja2JveCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIGlkOiAncGVybWlzc2lvbi11c2VyLXJlYWQnLFxuICAgICAgICAgICAgICAnZGF0YS1wZXJtJzogJ3InLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBXcml0ZVxuICAgICAgICAgIHRoaXMubGFiZWwoJ1dyaXRlJywge1xuICAgICAgICAgICAgY2xhc3M6ICdpbnB1dC1sYWJlbCBpbmxpbmUtYmxvY2snLFxuICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQoe1xuICAgICAgICAgICAgICBjbGFzczogJ2lucHV0LWNoZWNrYm94JyxcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgaWQ6ICdwZXJtaXNzaW9uLXVzZXItd3JpdGUnLFxuICAgICAgICAgICAgICAnZGF0YS1wZXJtJzogJ3cnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBFeGVjdXRlXG4gICAgICAgICAgdGhpcy5sYWJlbCgnRXhlY3V0ZScsIHtcbiAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtbGFiZWwgaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0KHtcbiAgICAgICAgICAgICAgY2xhc3M6ICdpbnB1dC1jaGVja2JveCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIGlkOiAncGVybWlzc2lvbi11c2VyLWV4ZWN1dGUnLFxuICAgICAgICAgICAgICAnZGF0YS1wZXJtJzogJ3gnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEdyb3VwXG4gICAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgICBjbGFzczogJ3Blcm1pc3Npb24tZ3JvdXAgYmxvY2snLFxuICAgICAgICAgIG91dGxldDogJ3Blcm1pc3Npb25Hcm91cCcsXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmg1KCdHcm91cCBQZXJtaXNzaW9ucycpO1xuXG4gICAgICAgICAgLy8gUmVhZFxuICAgICAgICAgIHRoaXMubGFiZWwoJ1JlYWQnLCB7XG4gICAgICAgICAgICBjbGFzczogJ2lucHV0LWxhYmVsIGlubGluZS1ibG9jaycsXG4gICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnB1dCh7XG4gICAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtY2hlY2tib3gnLFxuICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICBpZDogJ3Blcm1pc3Npb24tZ3JvdXAtcmVhZCcsXG4gICAgICAgICAgICAgICdkYXRhLXBlcm0nOiAncicsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFdyaXRlXG4gICAgICAgICAgdGhpcy5sYWJlbCgnV3JpdGUnLCB7XG4gICAgICAgICAgICBjbGFzczogJ2lucHV0LWxhYmVsIGlubGluZS1ibG9jaycsXG4gICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnB1dCh7XG4gICAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtY2hlY2tib3gnLFxuICAgICAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgICBpZDogJ3Blcm1pc3Npb24tZ3JvdXAtd3JpdGUnLFxuICAgICAgICAgICAgICAnZGF0YS1wZXJtJzogJ3cnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBFeGVjdXRlXG4gICAgICAgICAgdGhpcy5sYWJlbCgnRXhlY3V0ZScsIHtcbiAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtbGFiZWwgaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0KHtcbiAgICAgICAgICAgICAgY2xhc3M6ICdpbnB1dC1jaGVja2JveCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIGlkOiAncGVybWlzc2lvbi1ncm91cC1leGVjdXRlJyxcbiAgICAgICAgICAgICAgJ2RhdGEtcGVybSc6ICd4JyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQdWJsaWNcbiAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgIGNsYXNzOiAncGVybWlzc2lvbi1vdGhlciBibG9jaycsXG4gICAgICAgICAgb3V0bGV0OiAncGVybWlzc2lvbk90aGVyJyxcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaDUoJ1B1YmxpYyAob3RoZXIpIFBlcm1pc3Npb25zJyk7XG5cbiAgICAgICAgICAvLyBSZWFkXG4gICAgICAgICAgdGhpcy5sYWJlbCgnUmVhZCcsIHtcbiAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtbGFiZWwgaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0KHtcbiAgICAgICAgICAgICAgY2xhc3M6ICdpbnB1dC1jaGVja2JveCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIGlkOiAncGVybWlzc2lvbi1vdGhlci1yZWFkJyxcbiAgICAgICAgICAgICAgJ2RhdGEtcGVybSc6ICdyJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gV3JpdGVcbiAgICAgICAgICB0aGlzLmxhYmVsKCdXcml0ZScsIHtcbiAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtbGFiZWwgaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0KHtcbiAgICAgICAgICAgICAgY2xhc3M6ICdpbnB1dC1jaGVja2JveCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgICAgIGlkOiAncGVybWlzc2lvbi1vdGhlci13cml0ZScsXG4gICAgICAgICAgICAgICdkYXRhLXBlcm0nOiAndycsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEV4ZWN1dGVcbiAgICAgICAgICB0aGlzLmxhYmVsKCdFeGVjdXRlJywge1xuICAgICAgICAgICAgY2xhc3M6ICdpbnB1dC1sYWJlbCBpbmxpbmUtYmxvY2snLFxuICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQoe1xuICAgICAgICAgICAgICBjbGFzczogJ2lucHV0LWNoZWNrYm94JyxcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgaWQ6ICdwZXJtaXNzaW9uLW90aGVyLWV4ZWN1dGUnLFxuICAgICAgICAgICAgICAnZGF0YS1wZXJtJzogJ3gnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgICBjbGFzczogJ3Blcm1pc3Npb24tY2hvd24gYmxvY2snLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sYWJlbCgnR3JvdXA6ICcsIHtcbiAgICAgICAgICAgIGNsYXNzOiAnaW5wdXQtbGFiZWwgaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHRoaXMuc3VidmlldygnY2hvd25Hcm91cCcsIG5ldyBUZXh0RWRpdG9yVmlldyh7XG4gICAgICAgICAgICBtaW5pOiB0cnVlLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXJUZXh0OiBudWxsLFxuICAgICAgICAgIH0pKTtcblxuICAgICAgICAgIHRoaXMubGFiZWwoJ093bmVyOiAnLCB7XG4gICAgICAgICAgICBjbGFzczogJ2lucHV0LWxhYmVsIGlubGluZS1ibG9jaycsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnN1YnZpZXcoJ2Nob3duT3duZXInLCBuZXcgVGV4dEVkaXRvclZpZXcoe1xuICAgICAgICAgICAgbWluaTogdHJ1ZSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dDogbnVsbCxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZGl2KHtcbiAgICAgICAgY2xhc3M6ICdwZXJtaXNzaW9ucy13cmFwcGVyLWJsb2NrJyxcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXYoe1xuICAgICAgICAgIGNsYXNzOiAncGVybWlzc2lvbnMtY2htb2QgYmxvY2snLFxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sYWJlbCgnQ2htb2QnKTtcbiAgICAgICAgICB0aGlzLnN1YnZpZXcoJ2NobW9kSW5wdXQnLCBuZXcgVGV4dEVkaXRvclZpZXcoe1xuICAgICAgICAgICAgbWluaTogdHJ1ZSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dDogNjAwLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5kaXYoe1xuICAgICAgICBjbGFzczogJ2Jsb2NrIGNsZWFyZml4JyxcbiAgICAgICAgb3V0bGV0OiAnYnV0dG9uQmxvY2snLFxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmJ1dHRvbih7XG4gICAgICAgICAgY2xhc3M6ICdpbmxpbmUtYmxvY2sgYnRuIHB1bGwtcmlnaHQgaWNvbiBpY29uLXggaW5saW5lLWJsb2NrLXRpZ2h0JyxcbiAgICAgICAgICBvdXRsZXQ6ICdjYW5jZWxCdXR0b24nLFxuICAgICAgICAgIGNsaWNrOiAnY2FuY2VsJyxcbiAgICAgICAgfSwgJ0NhbmNlbCcpO1xuICAgICAgICB0aGlzLmJ1dHRvbih7XG4gICAgICAgICAgY2xhc3M6ICdpbmxpbmUtYmxvY2sgYnRuIGJ0bi1wcmltYXJ5IHB1bGwtcmlnaHQgaWNvbiBpY29uLXN5bmMgaW5saW5lLWJsb2NrLXRpZ2h0JyxcbiAgICAgICAgICBvdXRsZXQ6ICdzYXZlQnV0dG9uJyxcbiAgICAgICAgICBjbGljazogJ2NvbmZpcm0nLFxuICAgICAgICB9LCAnU2F2ZScpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKHBhcmFtcywgcmVtb3Rlcykge1xuICAgIHRoaXMuZnRwID0gYXRvbS5wcm9qZWN0WydyZW1vdGVmdHAtbWFpbiddO1xuICAgIHRoaXMuaXRlbSA9IHJlbW90ZXMuaXRlbTtcbiAgICB0aGlzLnJpZ2h0ID0geyByOiA0LCB3OiAyLCB4OiAxIH07XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnY29yZTpjb25maXJtJzogKCkgPT4ge1xuICAgICAgICB0aGlzLmNvbmZpcm0oKTtcbiAgICAgIH0sXG4gICAgICAnY29yZTpjYW5jZWwnOiAoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIGlmICh0eXBlb2YgcGFyYW1zLnJpZ2h0cyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGlzTm90SW1wbGVtZW50ZWQoJ01vZGlmaWNhdGlvbiBwZXJtaXNzaW9uIGlzIG5vdCBhdmFpbGFibGUgZm9yIFNGVFAnKTtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKHBhcmFtcy5yaWdodHMpLmZvckVhY2goKHJpZ2h0KSA9PiB7XG4gICAgICBjb25zdCBwZXJtcyA9IHBhcmFtcy5yaWdodHNbcmlnaHRdLnNwbGl0KCcnKTtcbiAgICAgIGNvbnN0ICRwZXJtID0gJCh0aGlzKS5maW5kKGAucGVybWlzc2lvbi0ke3JpZ2h0fWApO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBlcm1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICRwZXJtLmZpbmQoYGlucHV0W2RhdGEtcGVybT1cIiR7cGVybXNbaV19XCJdYCkuYXR0cignY2hlY2tlZCcsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5jaG93bkdyb3VwLmdldE1vZGVsKCkuc2V0UGxhY2Vob2xkZXJUZXh0KHBhcmFtcy5ncm91cCk7XG4gICAgdGhpcy5jaG93bk93bmVyLmdldE1vZGVsKCkuc2V0UGxhY2Vob2xkZXJUZXh0KHBhcmFtcy5vd25lcik7XG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20udG9vbHRpcHMuYWRkKHRoaXMuY2hvd25Hcm91cCwge1xuICAgICAgICB0aXRsZTogJ09ubHkgbnVtYmVyIGNhbiBiZSBlbnRlcmVkLiAoVmFsaWQgR0lEKScsXG4gICAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICB9KSxcblxuICAgICAgYXRvbS50b29sdGlwcy5hZGQodGhpcy5jaG93bk93bmVyLCB7XG4gICAgICAgIHRpdGxlOiAnT25seSBudW1iZXIgY2FuIGJlIGVudGVyZWQuIChWYWxpZCBVSUQpJyxcbiAgICAgICAgcGxhY2VtZW50OiAnYm90dG9tJyxcbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICB0aGlzLmNoZWNrUGVybWlzc2lvbnMoKTtcbiAgICB0aGlzLnNob3coKTtcblxuICAgICQodGhpcykuZmluZCgnLnBlcm1pc3Npb25zLXdyYXBwZXIgaW5wdXQnKS5vbignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgdGhpcy5jaGVja1Blcm1pc3Npb25zKCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGVja1Blcm1pc3Npb25zKCkge1xuICAgIHRoaXMuY2htb2QgPSB7XG4gICAgICB1c2VyOiAwLFxuICAgICAgZ3JvdXA6IDAsXG4gICAgICBvdGhlcjogMCxcbiAgICAgIGdldCB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMudXNlcn0ke3RoaXMuZ3JvdXB9JHt0aGlzLm90aGVyfWA7XG4gICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCBjaG1vZHMgPSB7XG4gICAgICB1c2VyOiB0aGlzLnBlcm1pc3Npb25Vc2VyLFxuICAgICAgZ3JvdXA6IHRoaXMucGVybWlzc2lvbkdyb3VwLFxuICAgICAgb3RoZXI6IHRoaXMucGVybWlzc2lvbk90aGVyLFxuICAgIH07XG5cbiAgICBPYmplY3Qua2V5cyhjaG1vZHMpLmZvckVhY2goKGNLZXkpID0+IHtcbiAgICAgIGNvbnN0IGNJdGVtID0gY2htb2RzW2NLZXldO1xuICAgICAgY29uc3QgJGlucHV0cyA9ICQoY0l0ZW0pLmZpbmQoJ2lucHV0Jyk7XG4gICAgICBjb25zdCBsaXN0ID0ge307XG5cbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgJGlucHV0cy5sZW5ndGg7IHgrKykge1xuICAgICAgICBjb25zdCAkdGhpcyA9ICQoJGlucHV0c1t4XSk7XG5cbiAgICAgICAgbGlzdFskdGhpcy5hdHRyKCdkYXRhLXBlcm0nKV0gPSAkdGhpcy5wcm9wKCdjaGVja2VkJyk7XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKGxpc3QpLmZpbHRlcihrZXkgPT4gbGlzdFtrZXldKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgdGhpcy5jaG1vZFtjS2V5XSArPSB0aGlzLnJpZ2h0W2tleV07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY2htb2RJbnB1dC5zZXRUZXh0KHRoaXMuY2htb2QudG9TdHJpbmcpO1xuICB9XG5cbiAgY2hlY2tPd25lcnMoKSB7XG4gICAgY29uc3QgZ3JvdXBUZXh0ID0gdGhpcy5jaG93bkdyb3VwLmdldFRleHQoKTtcbiAgICBjb25zdCBvd25lclRleHQgPSB0aGlzLmNob3duT3duZXIuZ2V0VGV4dCgpO1xuXG4gICAgaWYgKGdyb3VwVGV4dCA9PT0gJycgJiYgb3duZXJUZXh0ID09PSAnJykgcmV0dXJuO1xuXG4gICAgY29uc3QgZ3JvdXAgPSBncm91cFRleHQgfHwgdGhpcy5jaG93bkdyb3VwLmdldE1vZGVsKCkuZ2V0UGxhY2Vob2xkZXJUZXh0KCk7XG4gICAgY29uc3Qgb3duZXIgPSBvd25lclRleHQgfHwgdGhpcy5jaG93bk93bmVyLmdldE1vZGVsKCkuZ2V0UGxhY2Vob2xkZXJUZXh0KCk7XG5cbiAgICBpZiAoZ3JvdXBUZXh0ICE9PSAnJykge1xuICAgICAgdGhpcy5mdHAuY2xpZW50LnNpdGUoYENIR1JQICR7Z3JvdXB9ICR7dGhpcy5pdGVtLnJlbW90ZX1gLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlWzBdLmNvZGUgIT09IDIwMCkge1xuICAgICAgICAgIGlzTm9DaGFuZ2VHcm91cChyZXNwb25zZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvd25lclRleHQgIT09ICcnKSB7XG4gICAgICB0aGlzLmZ0cC5jbGllbnQuc2l0ZShgQ0hPV04gJHtvd25lcn0gJHt0aGlzLml0ZW0ucmVtb3RlfWAsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2VbMF0uY29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgaXNOb0NoYW5nZU93bmVyKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uZmlybSgpIHtcbiAgICB0aGlzLmhpZGUoKTtcblxuICAgIGNvbnN0IGNvbW1hbmQgPSBgQ0hNT0QgJHt0aGlzLmNobW9kSW5wdXQuZ2V0VGV4dCgpfSAke3RoaXMuaXRlbS5yZW1vdGV9YDtcblxuICAgIHRoaXMuY2hlY2tPd25lcnMoKTtcbiAgICB0aGlzLmZ0cC5jbGllbnQuc2l0ZShjb21tYW5kKTtcbiAgICB0aGlzLml0ZW0ucGFyZW50Lm9wZW4oKTsgLy8gUmVmcmVzaFxuXG4gICAgdGhpcy5jaGVja1Blcm1pc3Npb25zKCk7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5oaWRlKCk7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcyB9KTtcbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHtcbiAgICAgIHRoaXMucGFuZWwuaGlkZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgdGhpcy5yZW1vdmUoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQZXJtaXNzaW9uVmlldztcbiJdfQ==