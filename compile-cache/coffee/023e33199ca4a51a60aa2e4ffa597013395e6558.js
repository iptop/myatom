(function() {
  var KillRing;

  module.exports = KillRing = (function() {
    function KillRing() {
      this.currentIndex = -1;
      this.entries = [];
      this.limit = 500;
      this.lastClip = void 0;
    }

    KillRing.prototype.fork = function() {
      var fork;
      fork = new KillRing;
      fork.setEntries(this.entries);
      fork.currentIndex = this.currentIndex;
      fork.lastClip = this.lastClip;
      return fork;
    };

    KillRing.prototype.isEmpty = function() {
      return this.entries.length === 0;
    };

    KillRing.prototype.reset = function() {
      return this.entries = [];
    };

    KillRing.prototype.getEntries = function() {
      return this.entries.slice();
    };

    KillRing.prototype.setEntries = function(entries) {
      this.entries = entries.slice();
      this.currentIndex = this.entries.length - 1;
      return this;
    };

    KillRing.prototype.push = function(text) {
      this.entries.push(text);
      if (this.entries.length > this.limit) {
        this.entries.shift();
      }
      return this.currentIndex = this.entries.length - 1;
    };

    KillRing.prototype.append = function(text) {
      var index;
      if (this.entries.length === 0) {
        return this.push(text);
      } else {
        index = this.entries.length - 1;
        this.entries[index] = this.entries[index] + text;
        return this.currentIndex = this.entries.length - 1;
      }
    };

    KillRing.prototype.prepend = function(text) {
      var index;
      if (this.entries.length === 0) {
        return this.push(text);
      } else {
        index = this.entries.length - 1;
        this.entries[index] = "" + text + this.entries[index];
        return this.currentIndex = this.entries.length - 1;
      }
    };

    KillRing.prototype.replace = function(text) {
      var index;
      if (this.entries.length === 0) {
        return this.push(text);
      } else {
        index = this.entries.length - 1;
        this.entries[index] = text;
        return this.currentIndex = this.entries.length - 1;
      }
    };

    KillRing.prototype.getCurrentEntry = function() {
      if (this.entries.length === 0) {
        return null;
      } else {
        return this.entries[this.currentIndex];
      }
    };

    KillRing.prototype.rotate = function(n) {
      if (this.entries.length === 0) {
        return null;
      }
      this.currentIndex = (this.currentIndex + n) % this.entries.length;
      if (this.currentIndex < 0) {
        this.currentIndex += this.entries.length;
      }
      return this.entries[this.currentIndex];
    };

    KillRing.global = new KillRing;

    KillRing.pullFromClipboard = function(killRings) {
      var entries, text;
      text = atom.clipboard.read();
      if (text !== KillRing.lastClip) {
        KillRing.global.push(text);
        KillRing.lastClip = text;
        if (killRings.length > 1) {
          entries = text.split(/\r?\n/);
          return killRings.forEach(function(killRing, i) {
            var entry, ref;
            entry = (ref = entries[i]) != null ? ref : '';
            return killRing.push(entry);
          });
        }
      }
    };

    KillRing.pushToClipboard = function() {
      var text;
      text = KillRing.global.getCurrentEntry();
      atom.clipboard.write(text);
      return KillRing.lastClip = text;
    };

    return KillRing;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9taWMtZW1hY3MvbGliL2tpbGwtcmluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxrQkFBQTtNQUNYLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUM7TUFDakIsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsUUFBRCxHQUFZO0lBSkQ7O3VCQU1iLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJO01BQ1gsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBQyxDQUFBLE9BQWpCO01BQ0EsSUFBSSxDQUFDLFlBQUwsR0FBb0IsSUFBQyxDQUFBO01BQ3JCLElBQUksQ0FBQyxRQUFMLEdBQWdCLElBQUMsQ0FBQTthQUNqQjtJQUxJOzt1QkFPTixPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxLQUFtQjtJQURaOzt1QkFHVCxLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFETjs7dUJBR1AsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQTtJQURVOzt1QkFHWixVQUFBLEdBQVksU0FBQyxPQUFEO01BQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFPLENBQUMsS0FBUixDQUFBO01BQ1gsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULEdBQWtCO2FBQ2xDO0lBSFU7O3VCQUtaLElBQUEsR0FBTSxTQUFDLElBQUQ7TUFDSixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkO01BQ0EsSUFBRyxJQUFDLENBQUEsT0FBTyxD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LEdBQW1CLENBQXRCO1VBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBWDtpQkFDVixTQUFTLENBQUMsT0FBVixDQUFrQixTQUFDLFFBQUQsRUFBVyxDQUFYO0FBQ2hCLGdCQUFBO1lBQUEsS0FBQSxzQ0FBcUI7bUJBQ3JCLFFBQVEsQ0FBQyxJQUFULENBQWMsS0FBZDtVQUZnQixDQUFsQixFQUZGO1NBSEY7O0lBRmtCOztJQVdwQixRQUFDLENBQUEsZUFBRCxHQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFoQixDQUFBO01BQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLElBQXJCO2FBQ0EsUUFBUSxDQUFDLFFBQVQsR0FBb0I7SUFISjs7Ozs7QUFwRnBCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxyXG5jbGFzcyBLaWxsUmluZ1xyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgQGN1cnJlbnRJbmRleCA9IC0xXHJcbiAgICBAZW50cmllcyA9IFtdXHJcbiAgICBAbGltaXQgPSA1MDBcclxuICAgIEBsYXN0Q2xpcCA9IHVuZGVmaW5lZFxyXG5cclxuICBmb3JrOiAtPlxyXG4gICAgZm9yayA9IG5ldyBLaWxsUmluZ1xyXG4gICAgZm9yay5zZXRFbnRyaWVzKEBlbnRyaWVzKVxyXG4gICAgZm9yay5jdXJyZW50SW5kZXggPSBAY3VycmVudEluZGV4XHJcbiAgICBmb3JrLmxhc3RDbGlwID0gQGxhc3RDbGlwXHJcbiAgICBmb3JrXHJcblxyXG4gIGlzRW1wdHk6IC0+XHJcbiAgICBAZW50cmllcy5sZW5ndGggPT0gMFxyXG5cclxuICByZXNldDogLT5cclxuICAgIEBlbnRyaWVzID0gW11cclxuXHJcbiAgZ2V0RW50cmllczogLT5cclxuICAgIEBlbnRyaWVzLnNsaWNlKClcclxuXHJcbiAgc2V0RW50cmllczogKGVudHJpZXMpIC0+XHJcbiAgICBAZW50cmllcyA9IGVudHJpZXMuc2xpY2UoKVxyXG4gICAgQGN1cnJlbnRJbmRleCA9IEBlbnRyaWVzLmxlbmd0aCAtIDFcclxuICAgIHRoaXNcclxuXHJcbiAgcHVzaDogKHRleHQpIC0+XHJcbiAgICBAZW50cmllcy5wdXNoKHRleHQpXHJcbiAgICBpZiBAZW50cmllcy5sZW5ndGggPiBAbGltaXRcclxuICAgICAgQGVudHJpZXMuc2hpZnQoKVxyXG4gICAgQGN1cnJlbnRJbmRleCA9IEBlbnRyaWVzLmxlbmd0aCAtIDFcclxuXHJcbiAgYXBwZW5kOiAodGV4dCkgLT5cclxuICAgIGlmIEBlbnRyaWVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIEBwdXNoKHRleHQpXHJcbiAgICBlbHNlXHJcbiAgICAgIGluZGV4ID0gQGVudHJpZXMubGVuZ3RoIC0gMVxyXG4gICAgICBAZW50cmllc1tpbmRleF0gPSBAZW50cmllc1tpbmRleF0gKyB0ZXh0XHJcbiAgICAgIEBjdXJyZW50SW5kZXggPSBAZW50cmllcy5sZW5ndGggLSAxXHJcblxyXG4gIHByZXBlbmQ6ICh0ZXh0KSAtPlxyXG4gICAgaWYgQGVudHJpZXMubGVuZ3RoID09IDBcclxuICAgICAgQHB1c2godGV4dClcclxuICAgIGVsc2VcclxuICAgICAgaW5kZXggPSBAZW50cmllcy5sZW5ndGggLSAxXHJcbiAgICAgIEBlbnRyaWVzW2luZGV4XSA9IFwiI3t0ZXh0fSN7QGVudHJpZXNbaW5kZXhdfVwiXHJcbiAgICAgIEBjdXJyZW50SW5kZXggPSBAZW50cmllcy5sZW5ndGggLSAxXHJcblxyXG4gIHJlcGxhY2U6ICh0ZXh0KSAtPlxyXG4gICAgaWYgQGVudHJpZXMubGVuZ3RoID09IDBcclxuICAgICAgQHB1c2godGV4dClcclxuICAgIGVsc2VcclxuICAgICAgaW5kZXggPSBAZW50cmllcy5sZW5ndGggLSAxXHJcbiAgICAgIEBlbnRyaWVzW2luZGV4XSA9IHRleHRcclxuICAgICAgQGN1cnJlbnRJbmRleCA9IEBlbnRyaWVzLmxlbmd0aCAtIDFcclxuXHJcbiAgZ2V0Q3VycmVudEVudHJ5OiAtPlxyXG4gICAgaWYgQGVudHJpZXMubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIGVsc2VcclxuICAgICAgQGVudHJpZXNbQGN1cnJlbnRJbmRleF1cclxuXHJcbiAgcm90YXRlOiAobikgLT5cclxuICAgIHJldHVybiBudWxsIGlmIEBlbnRyaWVzLmxlbmd0aCA9PSAwXHJcbiAgICBAY3VycmVudEluZGV4ID0gKEBjdXJyZW50SW5kZXggKyBuKSAlIEBlbnRyaWVzLmxlbmd0aFxyXG4gICAgQGN1cnJlbnRJbmRleCArPSBAZW50cmllcy5sZW5ndGggaWYgQGN1cnJlbnRJbmRleCA8IDBcclxuICAgIHJldHVybiBAZW50cmllc1tAY3VycmVudEluZGV4XVxyXG5cclxuICBAZ2xvYmFsID0gbmV3IEtpbGxSaW5nXHJcblxyXG4gIEBwdWxsRnJvbUNsaXBib2FyZDogKGtpbGxSaW5ncykgLT5cclxuICAgIHRleHQgPSBhdG9tLmNsaXBib2FyZC5yZWFkKClcclxuICAgIGlmIHRleHQgIT0gS2lsbFJpbmcubGFzdENsaXBcclxuICAgICAgS2lsbFJpbmcuZ2xvYmFsLnB1c2godGV4dClcclxuICAgICAgS2lsbFJpbmcubGFzdENsaXAgPSB0ZXh0XHJcbiAgICAgIGlmIGtpbGxSaW5ncy5sZW5ndGggPiAxXHJcbiAgICAgICAgZW50cmllcyA9IHRleHQuc3BsaXQoL1xccj9cXG4vKVxyXG4gICAgICAgIGtpbGxSaW5ncy5mb3JFYWNoIChraWxsUmluZywgaSkgLT5cclxuICAgICAgICAgIGVudHJ5ID0gZW50cmllc1tpXSA/ICcnXHJcbiAgICAgICAgICBraWxsUmluZy5wdXNoKGVudHJ5KVxyXG5cclxuICBAcHVzaFRvQ2xpcGJvYXJkOiAtPlxyXG4gICAgdGV4dCA9IEtpbGxSaW5nLmdsb2JhbC5nZXRDdXJyZW50RW50cnkoKVxyXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dClcclxuICAgIEtpbGxSaW5nLmxhc3RDbGlwID0gdGV4dFxyXG4iXX0=
