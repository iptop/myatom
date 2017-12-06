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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9taWMtZW1hY3MvbGliL3N0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUN0QixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDdEIsSUFBQyxDQUFBLGVBQUQsR0FBbUI7TUFDbkIsSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFMTCxDQUFaO0lBT0EsYUFBQSxFQUFlLFNBQUMsS0FBRDthQUNiLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBRE4sQ0FQZjtJQVVBLFlBQUEsRUFBYyxTQUFDLEtBQUQ7TUFDWixJQUFHLENBQUMsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsT0FBYixDQUFIO1FBQ0UsSUFBQyxDQUFBLE9BQUQsR0FBVyxNQURiOztNQUdBLElBQUcsQ0FBQyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxPQUFiLENBQUg7UUFDRSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BRGI7O01BR0EsSUFBRyxJQUFDLENBQUEsV0FBSjtRQUNFLElBQUMsQ0FBQSxXQUFELEdBQWU7UUFDZixJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFkLENBQUEsR0FBbUIsRUFGbEM7T0FBQSxNQUFBO1FBSUUsSUFBQyxDQUFBLFNBQUQsR0FBYSxFQUpmOztNQU1BLElBQUMsQ0FBQSxlQUFELEdBQW1CLEtBQUssQ0FBQzthQUN6QixJQUFDLENBQUEsZUFBRCxHQUFtQjtJQWRQLENBVmQ7SUEwQkEsTUFBQSxFQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsT0FBRCxHQUFXO0lBREwsQ0ExQlI7SUE2QkEsTUFBQSxFQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsT0FBRCxHQUFXO0lBREwsQ0E3QlI7SUFnQ0EsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBRCxHQUFlO0lBREwsQ0FoQ1o7SUFtQ0EsWUFBQSxFQUFjLFNBQUE7YUFBRyxJQUFDLENBQUEsT0FBRCxJQUFhLENBQUksSUFBQyxDQUFBO0lBQXJCLENBbkNkOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxyXG4gIGluaXRpYWxpemU6IC0+XHJcbiAgICBAX2tpbGxlZCA9IEBraWxsaW5nID0gZmFsc2VcclxuICAgIEBfeWFua2VkID0gQHlhbmtpbmcgPSBmYWxzZVxyXG4gICAgQHByZXZpb3VzQ29tbWFuZCA9IG51bGxcclxuICAgIEByZWNlbnRlcnMgPSAwXHJcbiAgICBAX3JlY2VudGVyZWQgPSBmYWxzZVxyXG5cclxuICBiZWZvcmVDb21tYW5kOiAoZXZlbnQpIC0+XHJcbiAgICBAaXNEdXJpbmdDb21tYW5kID0gdHJ1ZVxyXG5cclxuICBhZnRlckNvbW1hbmQ6IChldmVudCkgLT5cclxuICAgIGlmIChAa2lsbGluZyA9IEBfa2lsbGVkKVxyXG4gICAgICBAX2tpbGxlZCA9IGZhbHNlXHJcblxyXG4gICAgaWYgKEB5YW5raW5nID0gQF95YW5rZWQpXHJcbiAgICAgIEBfeWFua2VkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAX3JlY2VudGVyZWRcclxuICAgICAgQF9yZWNlbnRlcmVkID0gZmFsc2VcclxuICAgICAgQHJlY2VudGVycyA9IChAcmVjZW50ZXJzICsgMSkgJSAzXHJcbiAgICBlbHNlXHJcbiAgICAgIEByZWNlbnRlcnMgPSAwXHJcblxyXG4gICAgQHByZXZpb3VzQ29tbWFuZCA9IGV2ZW50LnR5cGVcclxuICAgIEBpc0R1cmluZ0NvbW1hbmQgPSBmYWxzZVxyXG5cclxuICBraWxsZWQ6IC0+XHJcbiAgICBAX2tpbGxlZCA9IHRydWVcclxuXHJcbiAgeWFua2VkOiAtPlxyXG4gICAgQF95YW5rZWQgPSB0cnVlXHJcblxyXG4gIHJlY2VudGVyZWQ6IC0+XHJcbiAgICBAX3JlY2VudGVyZWQgPSB0cnVlXHJcblxyXG4gIHlhbmtDb21wbGV0ZTogLT4gQHlhbmtpbmcgYW5kIG5vdCBAX3lhbmtlZFxyXG4iXX0=
