Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

// eslint-disable-line

var _pythonIndent = require("./python-indent");

var _pythonIndent2 = _interopRequireDefault(_pythonIndent);

"use babel";

exports["default"] = {
    config: {
        hangingIndentTabs: {
            type: "number",
            "default": 1,
            description: "Number of tabs used for _hanging_ indents",
            "enum": [1, 2]
        }
    },

    activate: function activate() {
        var _this = this;

        this.pythonIndent = new _pythonIndent2["default"]();
        this.subscriptions = new _atom.CompositeDisposable();
        this.subscriptions.add(atom.commands.add("atom-text-editor", { "editor:newline": function editorNewline() {
                return _this.pythonIndent.indent();
            } }));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFb0MsTUFBTTs7Ozs0QkFDakIsaUJBQWlCOzs7O0FBSDFDLFdBQVcsQ0FBQzs7cUJBS0c7QUFDWCxVQUFNLEVBQUU7QUFDSix5QkFBaUIsRUFBRTtBQUNmLGdCQUFJLEVBQUUsUUFBUTtBQUNkLHVCQUFTLENBQUM7QUFDVix1QkFBVyxFQUFFLDJDQUEyQztBQUN4RCxvQkFBTSxDQUNGLENBQUMsRUFDRCxDQUFDLENBQ0o7U0FDSjtLQUNKOztBQUVELFlBQVEsRUFBQSxvQkFBRzs7O0FBQ1AsWUFBSSxDQUFDLFlBQVksR0FBRywrQkFBa0IsQ0FBQztBQUN2QyxZQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLFlBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUN2RCxFQUFFLGdCQUFnQixFQUFFO3VCQUFNLE1BQUssWUFBWSxDQUFDLE1BQU0sRUFBRTthQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDaEU7Q0FDSiIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5pbXBvcnQgUHl0aG9uSW5kZW50IGZyb20gXCIuL3B5dGhvbi1pbmRlbnRcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNvbmZpZzoge1xuICAgICAgICBoYW5naW5nSW5kZW50VGFiczoge1xuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgICAgIGRlZmF1bHQ6IDEsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJOdW1iZXIgb2YgdGFicyB1c2VkIGZvciBfaGFuZ2luZ18gaW5kZW50c1wiLFxuICAgICAgICAgICAgZW51bTogW1xuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGFjdGl2YXRlKCkge1xuICAgICAgICB0aGlzLnB5dGhvbkluZGVudCA9IG5ldyBQeXRob25JbmRlbnQoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcImF0b20tdGV4dC1lZGl0b3JcIixcbiAgICAgICAgICAgIHsgXCJlZGl0b3I6bmV3bGluZVwiOiAoKSA9PiB0aGlzLnB5dGhvbkluZGVudC5pbmRlbnQoKSB9KSk7XG4gICAgfSxcbn07XG4iXX0=