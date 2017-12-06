
/*
Global Logger
 */

(function() {
  module.exports = (function() {
    var Emitter, emitter, levels, stream, winston, writable;
    Emitter = require('event-kit').Emitter;
    emitter = new Emitter();
    winston = require('winston');
    stream = require('stream');
    writable = new stream.Writable();
    writable._write = function(chunk, encoding, next) {
      var msg;
      msg = chunk.toString();
      emitter.emit('logging', msg);
      return next();
    };
    levels = {
      silly: 0,
      input: 1,
      verbose: 2,
      prompt: 3,
      debug: 4,
      info: 5,
      data: 6,
      help: 7,
      warn: 8,
      error: 9
    };
    return function(label) {
      var i, len, logger, loggerMethods, method, transport, wlogger;
      transport = new winston.transports.File({
        label: label,
        level: 'debug',
        timestamp: true,
        stream: writable,
        json: false
      });
      wlogger = new winston.Logger({
        transports: [transport]
      });
      wlogger.on('logging', function(transport, level, msg, meta) {
        var d, levelNum, loggerLevel, loggerLevelNum, path, ref;
        loggerLevel = (ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('atom-beautify.general.loggerLevel') : void 0) != null ? ref : "warn";
        loggerLevelNum = levels[loggerLevel];
        levelNum = levels[level];
        if (loggerLevelNum <= levelNum) {
          path = require('path');
          label = "" + (path.dirname(transport.label).split(path.sep).reverse()[0]) + path.sep + (path.basename(transport.label));
          d = new Date();
          return console.log((d.toLocaleDateString()) + " " + (d.toLocaleTimeString()) + " - " + label + " [" + level + "]: " + msg, meta);
        }
      });
      loggerMethods = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];
      logger = {};
      for (i = 0, len = loggerMethods.length; i < len; i++) {
        method = loggerMethods[i];
        logger[method] = wlogger[method];
      }
      logger.onLogging = function(handler) {
        var subscription;
        subscription = emitter.on('logging', handler);
        return subscription;
      };
      return logger;
    };
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9sb2dnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0EsTUFBTSxDQUFDLE9BQVAsR0FBb0IsQ0FBQSxTQUFBO0FBRWxCLFFBQUE7SUFBQyxVQUFXLE9BQUEsQ0FBUSxXQUFSO0lBQ1osT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFBO0lBR2QsT0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSO0lBQ1YsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSO0lBQ1QsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLFFBQVAsQ0FBQTtJQUNmLFFBQVEsQ0FBQyxNQUFULEdBQWtCLFNBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsSUFBbEI7QUFDaEIsVUFBQTtNQUFBLEdBQUEsR0FBTSxLQUFLLENBQUMsUUFBTixDQUFBO01BRU4sT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFiLEVBQXdCLEdBQXhCO2FBQ0EsSUFBQSxDQUFBO0lBSmdCO0lBTWxCLE1BQUEsR0FBUztNQUNQLEtBQUEsRUFBTyxDQURBO01BRVAsS0FBQSxFQUFPLENBRkE7TUFHUCxPQUFBLEVBQVMsQ0FIRjtNQUlQLE1BQUEsRUFBUSxDQUpEO01BS1AsS0FBQSxFQUFPLENBTEE7TUFNUCxJQUFBLEVBQU0sQ0FOQztNQU9QLElBQUEsRUFBTSxDQVBDO01BUVAsSUFBQSxFQUFNLENBUkM7TUFTUCxJQUFBLEVBQU0sQ0FUQztNQVVQLEtBQUEsRUFBTyxDQVZBOztBQWFULFdBQU8sU0FBQyxLQUFEO0FBQ0wsVUFBQTtNQUFBLFNBQUEsR0FBZ0IsSUFBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQXBCLENBQTBCO1FBQ3hDLEtBQUEsRUFBTyxLQURpQztRQUV4QyxLQUFBLEVBQU8sT0FGaUM7UUFHeEMsU0FBQSxFQUFXLElBSDZCO1FBTXhDLE1BQUEsRUFBUSxRQU5nQztRQU94QyxJQUFBLEVBQU0sS0FQa0M7T0FBMUI7TUFVaEIsT0FBQSxHQUFjLElBQUMsT0FBTyxDQUFDLE1BQVQsQ0FBaUI7UUFFN0IsVUFBQSxFQUFZLENBQ1YsU0FEVSxDQUZpQjtPQUFqQjtNQU1kLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLFNBQUQsRUFBWSxLQUFaLEVBQW1CLEdBQW5CLEVBQXdCLElBQXhCO0FBQ3BCLFlBQUE7UUFBQSxXQUFBLHdJQUN5QztRQUV6QyxjQUFBLEdBQWlCLE1BQU8sQ0FBQSxXQUFBO1FBQ3hCLFFBQUEsR0FBVyxNQUFPLENBQUEsS0FBQTtRQUNsQixJQUFHLGNBQUEsSUFBa0IsUUFBckI7VUFDRSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7VUFDUCxLQUFBLEdBQVEsRUFBQSxHQUFFLENBQUMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFTLENBQUMsS0FBdkIsQ0FDQyxDQUFDLEtBREYsQ0FDUSxJQUFJLENBQUMsR0FEYixDQUNpQixDQUFDLE9BRGxCLENBQUEsQ0FDNEIsQ0FBQSxDQUFBLENBRDdCLENBQUYsR0FFTSxJQUFJLENBQUMsR0FGWCxHQUVnQixDQUFDLElBQUksQ0FBQyxRQUFMLENBQWMsU0FBUyxDQUFDLEtBQXhCLENBQUQ7VUFDeEIsQ0FBQSxHQUFRLElBQUEsSUFBQSxDQUFBO2lCQUNSLE9BQU8sQ0FBQyxHQUFSLENBQWMsQ0FBQyxDQUFDLENBQUMsa0JBQUYsQ0FBQSxDQUFELENBQUEsR0FBd0IsR0FBeEIsR0FBMEIsQ0FBQyxDQUFDLENBQUMsa0JBQUYsQ0FBQSxDQUFELENBQTFCLEdBQWtELEtBQWxELEdBQXVELEtBQXZELEdBQTZELElBQTdELEdBQWlFLEtBQWpFLEdBQXVFLEtBQXZFLEdBQTRFLEdBQTFGLEVBQWlHLElBQWpHLEVBTkY7O01BTm9CLENBQXRCO01BZUEsYUFBQSxHQUFnQixDQUFDLE9BQUQsRUFBUyxPQUFULEVBQWlCLFNBQWpCLEVBQTJCLE1BQTNCLEVBQWtDLE1BQWxDLEVBQXlDLE9BQXpDO01BQ2hCLE1BQUEsR0FBUztBQUNULFdBQUEsK0NBQUE7O1FBQ0UsTUFBTyxDQUFBLE1BQUEsQ0FBUCxHQUFpQixPQUFRLENBQUEsTUFBQTtBQUQzQjtNQUdBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLFNBQUMsT0FBRDtBQUVqQixZQUFBO1FBQUEsWUFBQSxHQUFlLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixPQUF0QjtBQUVmLGVBQU87TUFKVTtBQU1uQixhQUFPO0lBM0NGO0VBNUJXLENBQUEsQ0FBSCxDQUFBO0FBSGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcbkdsb2JhbCBMb2dnZXJcclxuIyMjXHJcbm1vZHVsZS5leHBvcnRzID0gZG8gLT5cclxuICAjIENyZWF0ZSBFdmVudCBFbWl0dGVyXHJcbiAge0VtaXR0ZXJ9ID0gcmVxdWlyZSAnZXZlbnQta2l0J1xyXG4gIGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXHJcbiAgIyBDcmVhdGUgVHJhbnNwb3J0IHdpdGggV3JpdGFibGUgU3RyZWFtXHJcbiAgIyBTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjE1ODM4MzEvMjU3ODIwNVxyXG4gIHdpbnN0b24gPSByZXF1aXJlKCd3aW5zdG9uJylcclxuICBzdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKVxyXG4gIHdyaXRhYmxlID0gbmV3IHN0cmVhbS5Xcml0YWJsZSgpXHJcbiAgd3JpdGFibGUuX3dyaXRlID0gKGNodW5rLCBlbmNvZGluZywgbmV4dCkgLT5cclxuICAgIG1zZyA9IGNodW5rLnRvU3RyaW5nKClcclxuICAgICMgY29uc29sZS5sb2cobXNnKVxyXG4gICAgZW1pdHRlci5lbWl0KCdsb2dnaW5nJywgbXNnKVxyXG4gICAgbmV4dCgpXHJcblxyXG4gIGxldmVscyA9IHtcclxuICAgIHNpbGx5OiAwLFxyXG4gICAgaW5wdXQ6IDEsXHJcbiAgICB2ZXJib3NlOiAyLFxyXG4gICAgcHJvbXB0OiAzLFxyXG4gICAgZGVidWc6IDQsXHJcbiAgICBpbmZvOiA1LFxyXG4gICAgZGF0YTogNixcclxuICAgIGhlbHA6IDcsXHJcbiAgICB3YXJuOiA4LFxyXG4gICAgZXJyb3I6IDlcclxuICB9XHJcblxyXG4gIHJldHVybiAobGFiZWwpIC0+XHJcbiAgICB0cmFuc3BvcnQgPSBuZXcgKHdpbnN0b24udHJhbnNwb3J0cy5GaWxlKSh7XHJcbiAgICAgIGxhYmVsOiBsYWJlbFxyXG4gICAgICBsZXZlbDogJ2RlYnVnJ1xyXG4gICAgICB0aW1lc3RhbXA6IHRydWVcclxuICAgICAgIyBwcmV0dHlQcmludDogdHJ1ZVxyXG4gICAgICAjIGNvbG9yaXplOiB0cnVlXHJcbiAgICAgIHN0cmVhbTogd3JpdGFibGVcclxuICAgICAganNvbjogZmFsc2VcclxuICAgIH0pXHJcbiAgICAjIEluaXRpYWxpemUgbG9nZ2VyXHJcbiAgICB3bG9nZ2VyID0gbmV3ICh3aW5zdG9uLkxvZ2dlcikoe1xyXG4gICAgICAjIENvbmZpZ3VyZSB0cmFuc3BvcnRzXHJcbiAgICAgIHRyYW5zcG9ydHM6IFtcclxuICAgICAgICB0cmFuc3BvcnRcclxuICAgICAgXVxyXG4gICAgfSlcclxuICAgIHdsb2dnZXIub24oJ2xvZ2dpbmcnLCAodHJhbnNwb3J0LCBsZXZlbCwgbXNnLCBtZXRhKS0+XHJcbiAgICAgIGxvZ2dlckxldmVsID0gYXRvbT8uY29uZmlnLmdldChcXFxyXG4gICAgICAgICdhdG9tLWJlYXV0aWZ5LmdlbmVyYWwubG9nZ2VyTGV2ZWwnKSA/IFwid2FyblwiXHJcbiAgICAgICMgY29uc29sZS5sb2coJ2xvZ2dpbmcnLCBsb2dnZXJMZXZlbCwgYXJndW1lbnRzKVxyXG4gICAgICBsb2dnZXJMZXZlbE51bSA9IGxldmVsc1tsb2dnZXJMZXZlbF1cclxuICAgICAgbGV2ZWxOdW0gPSBsZXZlbHNbbGV2ZWxdXHJcbiAgICAgIGlmIGxvZ2dlckxldmVsTnVtIDw9IGxldmVsTnVtXHJcbiAgICAgICAgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxyXG4gICAgICAgIGxhYmVsID0gXCIje3BhdGguZGlybmFtZSh0cmFuc3BvcnQubGFiZWwpXFxcclxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQocGF0aC5zZXApLnJldmVyc2UoKVswXX1cXFxyXG4gICAgICAgICAgICAgICAgICAgICN7cGF0aC5zZXB9I3twYXRoLmJhc2VuYW1lKHRyYW5zcG9ydC5sYWJlbCl9XCJcclxuICAgICAgICBkID0gbmV3IERhdGUoKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiI3tkLnRvTG9jYWxlRGF0ZVN0cmluZygpfSAje2QudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IC0gI3tsYWJlbH0gWyN7bGV2ZWx9XTogI3ttc2d9XCIsIG1ldGEpXHJcbiAgICApXHJcbiAgICAjIEV4cG9ydCBsb2dnZXIgbWV0aG9kc1xyXG4gICAgbG9nZ2VyTWV0aG9kcyA9IFsnc2lsbHknLCdkZWJ1ZycsJ3ZlcmJvc2UnLCdpbmZvJywnd2FybicsJ2Vycm9yJ11cclxuICAgIGxvZ2dlciA9IHt9XHJcbiAgICBmb3IgbWV0aG9kIGluIGxvZ2dlck1ldGhvZHNcclxuICAgICAgbG9nZ2VyW21ldGhvZF0gPSB3bG9nZ2VyW21ldGhvZF1cclxuICAgICMgQWRkIGxvZ2dlciBsaXN0ZW5lclxyXG4gICAgbG9nZ2VyLm9uTG9nZ2luZyA9IChoYW5kbGVyKSAtPlxyXG4gICAgICAjIGNvbnNvbGUubG9nKCdvbkxvZ2dpbmcnLCBoYW5kbGVyKVxyXG4gICAgICBzdWJzY3JpcHRpb24gPSBlbWl0dGVyLm9uKCdsb2dnaW5nJywgaGFuZGxlcilcclxuICAgICAgIyBjb25zb2xlLmxvZygnZW1pdHRlcicsIGVtaXR0ZXIuaGFuZGxlcnNCeUV2ZW50TmFtZSwgc3Vic2NyaXB0aW9uKVxyXG4gICAgICByZXR1cm4gc3Vic2NyaXB0aW9uXHJcbiAgICAjIFJldHVybiBzaW1wbGlmaWVkIGxvZ2dlclxyXG4gICAgcmV0dXJuIGxvZ2dlclxyXG4iXX0=
