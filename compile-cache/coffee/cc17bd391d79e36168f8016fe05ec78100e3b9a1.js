(function() {
  var slice = [].slice;

  module.exports = {
    prefix: 'autocomplete-python:',
    debug: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (atom.config.get('autocomplete-python.outputDebug')) {
        return console.debug.apply(console, [this.prefix].concat(slice.call(msg)));
      }
    },
    warning: function() {
      var msg;
      msg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console.warn.apply(console, [this.prefix].concat(slice.call(msg)));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcHl0aG9uL2xpYi9sb2cuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLHNCQUFSO0lBQ0EsS0FBQSxFQUFPLFNBQUE7QUFDTCxVQUFBO01BRE07TUFDTixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBSDtBQUNFLGVBQU8sT0FBTyxDQUFDLEtBQVIsZ0JBQWMsQ0FBQSxJQUFDLENBQUEsTUFBUSxTQUFBLFdBQUEsR0FBQSxDQUFBLENBQXZCLEVBRFQ7O0lBREssQ0FEUDtJQUtBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsVUFBQTtNQURRO0FBQ1IsYUFBTyxPQUFPLENBQUMsSUFBUixnQkFBYSxDQUFBLElBQUMsQ0FBQSxNQUFRLFNBQUEsV0FBQSxHQUFBLENBQUEsQ0FBdEI7SUFEQSxDQUxUOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxyXG4gIHByZWZpeDogJ2F1dG9jb21wbGV0ZS1weXRob246J1xyXG4gIGRlYnVnOiAobXNnLi4uKSAtPlxyXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dERlYnVnJylcclxuICAgICAgcmV0dXJuIGNvbnNvbGUuZGVidWcgQHByZWZpeCwgbXNnLi4uXHJcblxyXG4gIHdhcm5pbmc6IChtc2cuLi4pIC0+XHJcbiAgICByZXR1cm4gY29uc29sZS53YXJuIEBwcmVmaXgsIG1zZy4uLlxyXG4iXX0=
