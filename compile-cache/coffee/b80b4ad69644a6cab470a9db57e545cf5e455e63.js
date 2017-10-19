(function() {
  module.exports = {
    initialize: function() {
      this._killed = this.killing = false;
      this._yanked = this.yanking = false;
      this.previousCommand = null;
      this.recenters = 0;
      return this._recentered = false;
    },
    beforeCommand: function(event) {
      return this.isDuringCommand = true;
    },
    afterCommand: function(event) {
      if ((this.killing = this._killed)) {
        this._killed = false;
      }
      if ((this.yanking = this._yanked)) {
        this._yanked = false;
      }
      if (this._recentered) {
        this._recentered = false;
        this.recenters = (this.recenters + 1) % 3;
      } else {
        this.recenters = 0;
      }
      this.previousCommand = event.type;
      return this.isDuringCommand = false;
    },
    killed: function() {
      return this._killed = true;
    },
    yanked: function() {
      return this._yanked = true;
    },
    recentered: function() {
      return this._recentered = true;
    },
    yankComplete: function() {
      return this.yanking && !this._yanked;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yLy5hdG9tL3BhY2thZ2VzL2F0b21pYy1lbWFjcy9saWIvc3RhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFVBQUEsRUFBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsT0FBRCxHQUFXO01BQ3RCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUN0QixJQUFDLENBQUEsZUFBRCxHQUFtQjtNQUNuQixJQUFDLENBQUEsU0FBRCxHQUFhO2FBQ2IsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUxMLENBQVo7SUFPQSxhQUFBLEVBQWUsU0FBQyxLQUFEO2FBQ2IsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFETixDQVBmO0lBVUEsWUFBQSxFQUFjLFNBQUMsS0FBRDtNQUNaLElBQUcsQ0FBQyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxPQUFiLENBQUg7UUFDRSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BRGI7O01BR0EsSUFBRyxDQUFDLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE9BQWIsQ0FBSDtRQUNFLElBQUMsQ0FBQSxPQUFELEdBQVcsTUFEYjs7TUFHQSxJQUFHLElBQUMsQ0FBQSxXQUFKO1FBQ0UsSUFBQyxDQUFBLFdBQUQsR0FBZTtRQUNmLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQyxJQUFDLENBQUEsU0FBRCxHQUFhLENBQWQsQ0FBQSxHQUFtQixFQUZsQztPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsU0FBRCxHQUFhLEVBSmY7O01BTUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsS0FBSyxDQUFDO2FBQ3pCLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBZFAsQ0FWZDtJQTBCQSxNQUFBLEVBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFETCxDQTFCUjtJQTZCQSxNQUFBLEVBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFETCxDQTdCUjtJQWdDQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFETCxDQWhDWjtJQW1DQSxZQUFBLEVBQWMsU0FBQTthQUFHLElBQUMsQ0FBQSxPQUFELElBQWEsQ0FBSSxJQUFDLENBQUE7SUFBckIsQ0FuQ2Q7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGluaXRpYWxpemU6IC0+XG4gICAgQF9raWxsZWQgPSBAa2lsbGluZyA9IGZhbHNlXG4gICAgQF95YW5rZWQgPSBAeWFua2luZyA9IGZhbHNlXG4gICAgQHByZXZpb3VzQ29tbWFuZCA9IG51bGxcbiAgICBAcmVjZW50ZXJzID0gMFxuICAgIEBfcmVjZW50ZXJlZCA9IGZhbHNlXG5cbiAgYmVmb3JlQ29tbWFuZDogKGV2ZW50KSAtPlxuICAgIEBpc0R1cmluZ0NvbW1hbmQgPSB0cnVlXG5cbiAgYWZ0ZXJDb21tYW5kOiAoZXZlbnQpIC0+XG4gICAgaWYgKEBraWxsaW5nID0gQF9raWxsZWQpXG4gICAgICBAX2tpbGxlZCA9IGZhbHNlXG5cbiAgICBpZiAoQHlhbmtpbmcgPSBAX3lhbmtlZClcbiAgICAgIEBfeWFua2VkID0gZmFsc2VcblxuICAgIGlmIEBfcmVjZW50ZXJlZFxuICAgICAgQF9yZWNlbnRlcmVkID0gZmFsc2VcbiAgICAgIEByZWNlbnRlcnMgPSAoQHJlY2VudGVycyArIDEpICUgM1xuICAgIGVsc2VcbiAgICAgIEByZWNlbnRlcnMgPSAwXG5cbiAgICBAcHJldmlvdXNDb21tYW5kID0gZXZlbnQudHlwZVxuICAgIEBpc0R1cmluZ0NvbW1hbmQgPSBmYWxzZVxuXG4gIGtpbGxlZDogLT5cbiAgICBAX2tpbGxlZCA9IHRydWVcblxuICB5YW5rZWQ6IC0+XG4gICAgQF95YW5rZWQgPSB0cnVlXG5cbiAgcmVjZW50ZXJlZDogLT5cbiAgICBAX3JlY2VudGVyZWQgPSB0cnVlXG5cbiAgeWFua0NvbXBsZXRlOiAtPiBAeWFua2luZyBhbmQgbm90IEBfeWFua2VkXG4iXX0=
