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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci9naXRodWIvbXktZW1hY3MtbW9kZS9saWIvbXktZW1hY3MtbW9kZS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztJQUVTLGVBQWU7QUFFdkIsV0FGUSxlQUFlLENBRXRCLGVBQWUsRUFBRTswQkFGVixlQUFlOzs7QUFJaEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBRzVDLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsV0FBTyxDQUFDLFdBQVcsR0FBRyxnREFBZ0QsQ0FBQztBQUN2RSxXQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqQyxRQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNuQzs7OztlQVprQixlQUFlOztXQWV6QixxQkFBRyxFQUFFOzs7OztXQUdQLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN2Qjs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7OztTQXhCa0IsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL2dpdGh1Yi9teS1lbWFjcy1tb2RlL2xpYi9teS1lbWFjcy1tb2RlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlFbWFjc01vZGVWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihzZXJpYWxpemVkU3RhdGUpIHtcbiAgICAvLyBDcmVhdGUgcm9vdCBlbGVtZW50XG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ215LWVtYWNzLW1vZGUnKTtcblxuICAgIC8vIENyZWF0ZSBtZXNzYWdlIGVsZW1lbnRcbiAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9ICdUaGUgTXlFbWFjc01vZGUgcGFja2FnZSBpcyBBbGl2ZSEgSXRcXCdzIEFMSVZFISc7XG4gICAgbWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdtZXNzYWdlJyk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKG1lc3NhZ2UpO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgcmV0cmlldmVkIHdoZW4gcGFja2FnZSBpcyBhY3RpdmF0ZWRcbiAgc2VyaWFsaXplKCkge31cblxuICAvLyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlKCk7XG4gIH1cblxuICBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gIH1cblxufVxuIl19