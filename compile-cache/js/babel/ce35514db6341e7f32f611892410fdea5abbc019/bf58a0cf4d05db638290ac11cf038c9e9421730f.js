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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07Ozs7NEJBQ2pCLGlCQUFpQjs7OztBQUgxQyxXQUFXLENBQUM7O3FCQUtHO0FBQ1gsVUFBTSxFQUFFO0FBQ0oseUJBQWlCLEVBQUU7QUFDZixnQkFBSSxFQUFFLFFBQVE7QUFDZCx1QkFBUyxDQUFDO0FBQ1YsdUJBQVcsRUFBRSwyQ0FBMkM7QUFDeEQsb0JBQU0sQ0FDRixDQUFDLEVBQ0QsQ0FBQyxDQUNKO1NBQ0o7S0FDSjs7QUFFRCxZQUFRLEVBQUEsb0JBQUc7OztBQUNQLFlBQUksQ0FBQyxZQUFZLEdBQUcsK0JBQWtCLENBQUM7QUFDdkMsWUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxZQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFDdkQsRUFBRSxnQkFBZ0IsRUFBRTt1QkFBTSxNQUFLLFlBQVksQ0FBQyxNQUFNLEVBQUU7YUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ2hFO0NBQ0oiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcclxuXHJcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcbmltcG9ydCBQeXRob25JbmRlbnQgZnJvbSBcIi4vcHl0aG9uLWluZGVudFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgY29uZmlnOiB7XHJcbiAgICAgICAgaGFuZ2luZ0luZGVudFRhYnM6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgZGVmYXVsdDogMSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiTnVtYmVyIG9mIHRhYnMgdXNlZCBmb3IgX2hhbmdpbmdfIGluZGVudHNcIixcclxuICAgICAgICAgICAgZW51bTogW1xyXG4gICAgICAgICAgICAgICAgMSxcclxuICAgICAgICAgICAgICAgIDIsXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgYWN0aXZhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5weXRob25JbmRlbnQgPSBuZXcgUHl0aG9uSW5kZW50KCk7XHJcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcclxuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFwiYXRvbS10ZXh0LWVkaXRvclwiLFxyXG4gICAgICAgICAgICB7IFwiZWRpdG9yOm5ld2xpbmVcIjogKCkgPT4gdGhpcy5weXRob25JbmRlbnQuaW5kZW50KCkgfSkpO1xyXG4gICAgfSxcclxufTtcclxuIl19