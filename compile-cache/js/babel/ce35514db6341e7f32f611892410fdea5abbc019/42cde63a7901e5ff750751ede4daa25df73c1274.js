Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

var _helpers = require('../helpers');

'use babel';

var FileView = (function (_ScrollView) {
  _inherits(FileView, _ScrollView);

  function FileView() {
    _classCallCheck(this, FileView);

    _get(Object.getPrototypeOf(FileView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FileView, [{
    key: 'initialize',
    value: function initialize(file) {
      var _this = this;

      _get(Object.getPrototypeOf(FileView.prototype), 'initialize', this).call(this, file);

      this.item = file;
      this.attr('draggable', true);
      this.name.text(this.item.name);
      this.name.attr('data-name', this.item.name);
      this.name.attr('data-path', this.item.remote);

      var addIconToElement = (0, _helpers.getIconHandler)();

      if (addIconToElement) {
        var element = this.name[0] || this.name;
        var path = this.item && this.item.local;

        this.iconDisposable = addIconToElement(element, path);
      } else {
        switch (this.item.type) {
          case 'binary':
            this.name.addClass('icon-file-binary');
            break;
          case 'compressed':
            this.name.addClass('icon-file-zip');
            break;
          case 'image':
            this.name.addClass('icon-file-media');
            break;
          case 'pdf':
            this.name.addClass('icon-file-pdf');
            break;
          case 'readme':
            this.name.addClass('icon-book');
            break;
          case 'text':
            this.name.addClass('icon-file-text');
            break;
          default:
            break;
        }
      }

      // Events
      this.on('mousedown', function (e) {
        e.stopPropagation();

        var view = (0, _atomSpacePenViews.$)(_this).view();
        var button = e.originalEvent ? e.originalEvent.button : 0;
        var selectKey = process.platform === 'darwin' ? 'metaKey' : 'ctrlKey'; // on mac the select key for multiple files is the meta key
        var $selected = (0, _atomSpacePenViews.$)('.remote-ftp-view .selected');

        if (!view) return;

        if ((button === 0 || button === 2) && !(button === 2 && $selected.length > 1)) {
          if (!e[selectKey]) {
            $selected.removeClass('selected');
            (0, _atomSpacePenViews.$)('.remote-ftp-view .entries.list-tree').removeClass('multi-select');
          } else {
            (0, _atomSpacePenViews.$)('.remote-ftp-view .entries.list-tree').addClass('multi-select');
          }
          view.toggleClass('selected');
        }
      });

      this.on('dblclick', function (e) {
        e.stopPropagation();

        var view = (0, _atomSpacePenViews.$)(_this).view();

        if (!view) {
          return;
        }

        view.open();
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.item = null;

      if (this.iconDisposable) {
        this.iconDisposable.dispose();
        this.iconDisposable = null;
      }

      this.remove();
    }
  }, {
    key: 'open',
    value: function open() {
      this.item.open();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this2 = this;

      return this.li({
        'class': 'file entry list-item',
        is: 'tree-view-file'
      }, function () {
        return _this2.span({
          'class': 'name icon',
          outlet: 'name'
        });
      });
    }
  }]);

  return FileView;
})(_atomSpacePenViews.ScrollView);

exports['default'] = FileView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi92aWV3cy9maWxlLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2lDQUU4QixzQkFBc0I7O3VCQUNyQixZQUFZOztBQUgzQyxXQUFXLENBQUM7O0lBS04sUUFBUTtZQUFSLFFBQVE7O1dBQVIsUUFBUTswQkFBUixRQUFROzsrQkFBUixRQUFROzs7ZUFBUixRQUFROztXQVlGLG9CQUFDLElBQUksRUFBRTs7O0FBQ2YsaUNBYkUsUUFBUSw0Q0FhTyxJQUFJLEVBQUU7O0FBRXZCLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTlDLFVBQU0sZ0JBQWdCLEdBQUcsOEJBQWdCLENBQUM7O0FBRTFDLFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzFDLFlBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRTFDLFlBQUksQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFD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SUFBSSxFQUFFLENBQUM7S0FDbEI7OztXQWpHYSxtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2IsaUJBQU8sc0JBQXNCO0FBQzdCLFVBQUUsRUFBRSxnQkFBZ0I7T0FDckIsRUFBRTtlQUFNLE9BQUssSUFBSSxDQUFDO0FBQ2pCLG1CQUFPLFdBQVc7QUFDbEIsZ0JBQU0sRUFBRSxNQUFNO1NBQ2YsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUNMOzs7U0FWRyxRQUFROzs7cUJBdUdDLFFBQVEiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL1JlbW90ZS1GVFAvbGliL3ZpZXdzL2ZpbGUtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyAkLCBTY3JvbGxWaWV3IH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgZ2V0SWNvbkhhbmRsZXIgfSBmcm9tICcuLi9oZWxwZXJzJztcblxuY2xhc3MgRmlsZVZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3IHtcblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5saSh7XG4gICAgICBjbGFzczogJ2ZpbGUgZW50cnkgbGlzdC1pdGVtJyxcbiAgICAgIGlzOiAndHJlZS12aWV3LWZpbGUnLFxuICAgIH0sICgpID0+IHRoaXMuc3Bhbih7XG4gICAgICBjbGFzczogJ25hbWUgaWNvbicsXG4gICAgICBvdXRsZXQ6ICduYW1lJyxcbiAgICB9KSk7XG4gIH1cblxuICBpbml0aWFsaXplKGZpbGUpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGZpbGUpO1xuXG4gICAgdGhpcy5pdGVtID0gZmlsZTtcbiAgICB0aGlzLmF0dHIoJ2RyYWdnYWJsZScsIHRydWUpO1xuICAgIHRoaXMubmFtZS50ZXh0KHRoaXMuaXRlbS5uYW1lKTtcbiAgICB0aGlzLm5hbWUuYXR0cignZGF0YS1uYW1lJywgdGhpcy5pdGVtLm5hbWUpO1xuICAgIHRoaXMubmFtZS5hdHRyKCdkYXRhLXBhdGgnLCB0aGlzLml0ZW0ucmVtb3RlKTtcblxuICAgIGNvbnN0IGFkZEljb25Ub0VsZW1lbnQgPSBnZXRJY29uSGFuZGxlcigpO1xuXG4gICAgaWYgKGFkZEljb25Ub0VsZW1lbnQpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLm5hbWVbMF0gfHwgdGhpcy5uYW1lO1xuICAgICAgY29uc3QgcGF0aCA9IHRoaXMuaXRlbSAmJiB0aGlzLml0ZW0ubG9jYWw7XG5cbiAgICAgIHRoaXMuaWNvbkRpc3Bvc2FibGUgPSBhZGRJY29uVG9FbGVtZW50KGVsZW1lbnQsIHBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHRoaXMuaXRlbS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgICAgdGhpcy5uYW1lLmFkZENsYXNzKCdpY29uLWZpbGUtYmluYXJ5Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NvbXByZXNzZWQnOlxuICAgICAgICAgIHRoaXMubmFtZS5hZGRDbGFzcygnaWNvbi1maWxlLXppcCcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbWFnZSc6XG4gICAgICAgICAgdGhpcy5uYW1lLmFkZENsYXNzKCdpY29uLWZpbGUtbWVkaWEnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGRmJzpcbiAgICAgICAgICB0aGlzLm5hbWUuYWRkQ2xhc3MoJ2ljb24tZmlsZS1wZGYnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVhZG1lJzpcbiAgICAgICAgICB0aGlzLm5hbWUuYWRkQ2xhc3MoJ2ljb24tYm9vaycpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgICB0aGlzLm5hbWUuYWRkQ2xhc3MoJ2ljb24tZmlsZS10ZXh0Jyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXZlbnRzXG4gICAgdGhpcy5vbignbW91c2Vkb3duJywgKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGNvbnN0IHZpZXcgPSAkKHRoaXMpLnZpZXcoKTtcbiAgICAgIGNvbnN0IGJ1dHRvbiA9IGUub3JpZ2luYWxFdmVudCA/IGUub3JpZ2luYWxFdmVudC5idXR0b24gOiAwO1xuICAgICAgY29uc3Qgc2VsZWN0S2V5ID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgPyAnbWV0YUtleScgOiAnY3RybEtleSc7IC8vIG9uIG1hYyB0aGUgc2VsZWN0IGtleSBmb3IgbXVsdGlwbGUgZmlsZXMgaXMgdGhlIG1ldGEga2V5XG4gICAgICBjb25zdCAkc2VsZWN0ZWQgPSAkKCcucmVtb3RlLWZ0cC12aWV3IC5zZWxlY3RlZCcpO1xuXG4gICAgICBpZiAoIXZpZXcpIHJldHVybjtcblxuICAgICAgaWYgKChidXR0b24gPT09IDAgfHwgYnV0dG9uID09PSAyKSAmJiAhKGJ1dHRvbiA9PT0gMiAmJiAkc2VsZWN0ZWQubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgaWYgKCFlW3NlbGVjdEtleV0pIHtcbiAgICAgICAgICAkc2VsZWN0ZWQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgJCgnLnJlbW90ZS1mdHAtdmlldyAuZW50cmllcy5saXN0LXRyZWUnKS5yZW1vdmVDbGFzcygnbXVsdGktc2VsZWN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJCgnLnJlbW90ZS1mdHAtdmlldyAuZW50cmllcy5saXN0LXRyZWUnKS5hZGRDbGFzcygnbXVsdGktc2VsZWN0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdmlldy50b2dnbGVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub24oJ2RibGNsaWNrJywgKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGNvbnN0IHZpZXcgPSAkKHRoaXMpLnZpZXcoKTtcblxuICAgICAgaWYgKCF2aWV3KSB7IHJldHVybjsgfVxuXG4gICAgICB2aWV3Lm9wZW4oKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5pdGVtID0gbnVsbDtcblxuICAgIGlmICh0aGlzLmljb25EaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLmljb25EaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuaWNvbkRpc3Bvc2FibGUgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMucmVtb3ZlKCk7XG4gIH1cblxuICBvcGVuKCkge1xuICAgIHRoaXMuaXRlbS5vcGVuKCk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWxlVmlldztcbiJdfQ==