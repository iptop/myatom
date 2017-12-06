'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MyEmacsModeView = (function () {
  function MyEmacsModeView(serializedState) {
    _classCallCheck(this, MyEmacsModeView);

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('my-emacs-mode');

    // Create message element
    var message = document.createElement('div');
    message.textContent = 'The MyEmacsMode package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated

  _createClass(MyEmacsModeView, [{
    key: 'serialize',
    value: function serialize() {}

    // Tear down any state and detach
  }, {
    key: 'destroy',
    value: function destroy() {
      this.element.remove();
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }
  }]);

  return MyEmacsModeView;
})();

exports['default'] = MyEmacsModeView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvbXktZW1hY3MtbW9kZS9saWIvbXktZW1hY3MtbW9kZS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztJQUVTLGVBQWU7QUFFdkIsV0FGUSxlQUFlLENBRXRCLGVBQWUsRUFBRTswQkFGVixlQUFlOzs7QUFJaEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBRzVDLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsV0FBTyxDQUFDLFdBQVcsR0FBRyxnREFBZ0QsQ0FBQztBQUN2RSxXQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNuQzs7OztlQVprQixlQUFlOztXQWV6QixxQkFBRyxFQUFFOzs7OztXQUdQLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN2Qjs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7OztTQXhCa0IsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9teS1lbWFjcy1tb2RlL2xpYi9teS1lbWFjcy1tb2RlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15RW1hY3NNb2RlVmlldyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNlcmlhbGl6ZWRTdGF0ZSkge1xyXG4gICAgLy8gQ3JlYXRlIHJvb3QgZWxlbWVudFxyXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbXktZW1hY3MtbW9kZScpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBtZXNzYWdlIGVsZW1lbnRcclxuICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSAnVGhlIE15RW1hY3NNb2RlIHBhY2thZ2UgaXMgQWxpdmUhIEl0XFwncyBBTElWRSEnO1xyXG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdtZXNzYWdlJyk7XHJcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQobWVzc2FnZSk7XHJcbiAgfVxyXG5cclxuICAvLyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxyXG4gIHNlcmlhbGl6ZSgpIHt9XHJcblxyXG4gIC8vIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XHJcbiAgfVxyXG5cclxuICBnZXRFbGVtZW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcclxuICB9XHJcblxyXG59XHJcbiJdfQ==