Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var File = (function () {
  function File(params) {
    var _this = this;

    _classCallCheck(this, File);

    this.parent = null;
    this.name = '';
    this.client = null;
    this.status = 0;
    this.size = 0;
    this.date = null;
    this.type = null;
    this.original = null;

    Object.keys(params).forEach(function (n) {
      if (Object.prototype.hasOwnProperty.call(_this, n)) {
        _this[n] = params[n];
      }
    });

    var ext = _path2['default'].extname(this.name);

    if (_fsPlus2['default'].isReadmePath(this.name)) {
      this.type = 'readme';
    } else if (_fsPlus2['default'].isCompressedExtension(ext)) {
      this.type = 'compressed';
    } else if (_fsPlus2['default'].isImageExtension(ext)) {
      this.type = 'image';
    } else if (_fsPlus2['default'].isPdfExtension(ext)) {
      this.type = 'pdf';
    } else if (_fsPlus2['default'].isBinaryExtension(ext)) {
      this.type = 'binary';
    } else {
      this.type = 'text';
    }
  }

  _createClass(File, [{
    key: 'open',
    value: function open() {
      var _this2 = this;

      var client = this.root.client;

      client.download(this.remote, false, function (err) {
        if (err) {
          atom.notifications.addError('Remote FTP: ' + err, {
            dismissable: false
          });
          return;
        }
        atom.workspace.open(_this2.local);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      //
    }
  }, {
    key: 'local',
    get: function get() {
      if (this.parent) {
        return _path2['default'].normalize(_path2['default'].join(this.parent.local, this.name)).replace(/\\/g, '/');
      }

      throw new Error('File needs to be in a Directory');
    }
  }, {
    key: 'remote',
    get: function get() {
      if (this.parent) {
        return _path2['default'].normalize(_path2['default'].join(this.parent.remote, this.name)).replace(/\\/g, '/');
      }

      throw new Error('File needs to be in a Directory');
    }
  }, {
    key: 'root',
    get: function get() {
      if (this.parent) {
        return this.parent.root;
      }

      return this;
    }
  }]);

  return File;
})();

exports['default'] = File;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9SZW1vdGUtRlRQL2xpYi9maWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7c0JBRWUsU0FBUzs7OztvQkFDUCxNQUFNOzs7O0FBSHZCLFdBQVcsQ0FBQzs7SUFLTixJQUFJO0FBQ0csV0FEUCxJQUFJLENBQ0ksTUFBTSxFQUFFOzs7MEJBRGhCLElBQUk7O0FBRU4sUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixRQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQixRQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVyQixVQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBSztBQUNqQyxVQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksUUFBTyxDQUFDLENBQUMsRUFBRTtBQUNqRCxjQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNyQjtLQUNGLENBQUMsQ0FBQzs7QUFFSCxRQUFNLEdBQUcsR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVwQyxRQUFJLG9CQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDOUIsVUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7S0FDdEIsTUFBTSxJQUFJLG9CQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3hDLFVBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO0tBQzFCLE1BQU0sSUFBSSxvQkFBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNuQyxVQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztLQUNyQixNQUFNLElBQUksb0JBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2pDLFVBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0tBQ25CLE1BQU0sSUFBSSxvQkFBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNwQyxVQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztLQUN0QixNQUFNO0FBQ0wsVUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7S0FDcEI7R0FDRjs7ZUFoQ0csSUFBSTs7V0FrQ0osZ0JBQUc7OztBQUNMLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDOztBQUVoQyxZQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQUMsR0FBRyxFQUFLO0FBQzNDLFlBQUksR0FBRyxFQUFFO0FBQ1AsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLGtCQUFnQixHQUFHLEVBQUk7QUFDaEQsdUJBQVcsRUFBRSxLQUFLO1dBQ25CLENBQUMsQ0FBQztBQUNILGlCQUFPO1NBQ1I7QUFDRCxZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFLLEtBQUssQ0FBQyxDQUFDO09BQ2pDLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRzs7S0FFVDs7O1NBRVEsZUFBRztBQUNWLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGVBQU8sa0JBQUssU0FBUyxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQ3BGOztBQUVELFlBQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztLQUNwRDs7O1NBRVMsZUFBRztBQUNYLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGVBQU8sa0JBQUssU0FBUyxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQ3JGOztBQUVELFlBQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztLQUNwRDs7O1NBRU8sZUFBRztBQUNULFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7T0FDekI7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1NBMUVHLElBQUk7OztxQkE2RUssSUFBSSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvLmF0b20vcGFja2FnZXMvUmVtb3RlLUZUUC9saWIvZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuY2xhc3MgRmlsZSB7XG4gIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLm5hbWUgPSAnJztcbiAgICB0aGlzLmNsaWVudCA9IG51bGw7XG4gICAgdGhpcy5zdGF0dXMgPSAwO1xuICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgdGhpcy5kYXRlID0gbnVsbDtcbiAgICB0aGlzLnR5cGUgPSBudWxsO1xuICAgIHRoaXMub3JpZ2luYWwgPSBudWxsO1xuXG4gICAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKChuKSA9PiB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIG4pKSB7XG4gICAgICAgIHRoaXNbbl0gPSBwYXJhbXNbbl07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUodGhpcy5uYW1lKTtcblxuICAgIGlmIChmcy5pc1JlYWRtZVBhdGgodGhpcy5uYW1lKSkge1xuICAgICAgdGhpcy50eXBlID0gJ3JlYWRtZSc7XG4gICAgfSBlbHNlIGlmIChmcy5pc0NvbXByZXNzZWRFeHRlbnNpb24oZXh0KSkge1xuICAgICAgdGhpcy50eXBlID0gJ2NvbXByZXNzZWQnO1xuICAgIH0gZWxzZSBpZiAoZnMuaXNJbWFnZUV4dGVuc2lvbihleHQpKSB7XG4gICAgICB0aGlzLnR5cGUgPSAnaW1hZ2UnO1xuICAgIH0gZWxzZSBpZiAoZnMuaXNQZGZFeHRlbnNpb24oZXh0KSkge1xuICAgICAgdGhpcy50eXBlID0gJ3BkZic7XG4gICAgfSBlbHNlIGlmIChmcy5pc0JpbmFyeUV4dGVuc2lvbihleHQpKSB7XG4gICAgICB0aGlzLnR5cGUgPSAnYmluYXJ5JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50eXBlID0gJ3RleHQnO1xuICAgIH1cbiAgfVxuXG4gIG9wZW4oKSB7XG4gICAgY29uc3QgY2xpZW50ID0gdGhpcy5yb290LmNsaWVudDtcblxuICAgIGNsaWVudC5kb3dubG9hZCh0aGlzLnJlbW90ZSwgZmFsc2UsIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBSZW1vdGUgRlRQOiAke2Vycn1gLCB7XG4gICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLmxvY2FsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgLy9cbiAgfVxuXG4gIGdldCBsb2NhbCgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHJldHVybiBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4odGhpcy5wYXJlbnQubG9jYWwsIHRoaXMubmFtZSkpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgbmVlZHMgdG8gYmUgaW4gYSBEaXJlY3RvcnknKTtcbiAgfVxuXG4gIGdldCByZW1vdGUoKSB7XG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICByZXR1cm4gcGF0aC5ub3JtYWxpemUocGF0aC5qb2luKHRoaXMucGFyZW50LnJlbW90ZSwgdGhpcy5uYW1lKSkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignRmlsZSBuZWVkcyB0byBiZSBpbiBhIERpcmVjdG9yeScpO1xuICB9XG5cbiAgZ2V0IHJvb3QoKSB7XG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQucm9vdDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWxlO1xuIl19