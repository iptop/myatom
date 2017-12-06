(function() {
  'use strict';
  var Beautifier, HOST, MULTI_LINE_OUTPUT_TABLE, PORT, PythonBeautifier, format, net,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  net = require('net');

  Beautifier = require('./beautifier');

  HOST = '127.0.0.1';

  PORT = 36805;

  MULTI_LINE_OUTPUT_TABLE = {
    'Grid': 0,
    'Vertical': 1,
    'Hanging Indent': 2,
    'Vertical Hanging Indent': 3,
    'Hanging Grid': 4,
    'Hanging Grid Grouped': 5,
    'NOQA': 6
  };

  format = function(data, formaters) {
    return new Promise(function(resolve, reject) {
      var client;
      client = new net.Socket();
      client.on('error', function(error) {
        client.destroy();
        return reject(error);
      });
      return client.connect(PORT, HOST, function() {
        var response;
        client.setEncoding('utf8');
        client.write(JSON.stringify({
          'data': data,
          'formaters': formaters
        }));
        response = '';
        client.on('data', function(chunk) {
          return response += chunk;
        });
        return client.on('end', function() {
          response = JSON.parse(response);
          if (response.error != null) {
            reject(Error(response.error));
          } else {
            resolve(response.data);
          }
          return client.destroy();
        });
      });
    });
  };

  module.exports = PythonBeautifier = (function(superClass) {
    extend(PythonBeautifier, superClass);

    function PythonBeautifier() {
      return PythonBeautifier.__super__.constructor.apply(this, arguments);
    }

    PythonBeautifier.prototype.name = "pybeautifier";

    PythonBeautifier.prototype.link = "https://github.com/guyskk/pybeautifier";

    PythonBeautifier.prototype.isPreInstalled = false;

    PythonBeautifier.prototype.options = {
      Python: true
    };

    PythonBeautifier.prototype.beautify = function(text, language, options) {
      var formater, formaters, multi_line_output;
      formater = {
        'name': options.formater
      };
      if (options.formater === 'autopep8') {
        formater.config = {
          'ignore': options.ignore,
          'max_line_length': options.max_line_length
        };
      } else if (options.formater === 'yapf') {
        formater.config = {
          'style_config': options.style_config
        };
      }
      formaters = [formater];
      if (options.sort_imports) {
        multi_line_output = MULTI_LINE_OUTPUT_TABLE[options.multi_line_output];
        formaters.push({
          'name': 'isort',
          'config': {
            'multi_line_output': multi_line_output
          }
        });
      }
      return new this.Promise(function(resolve, reject) {
        return format(text, formaters).then(function(data) {
          return resolve(data);
        })["catch"](function(error) {
          return reject(error);
        });
      });
    };

    return PythonBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9weWJlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLDhFQUFBO0lBQUE7OztFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsSUFBQSxHQUFPOztFQUNQLElBQUEsR0FBTzs7RUFDUCx1QkFBQSxHQUEwQjtJQUN4QixNQUFBLEVBQVEsQ0FEZ0I7SUFFeEIsVUFBQSxFQUFZLENBRlk7SUFHeEIsZ0JBQUEsRUFBa0IsQ0FITTtJQUl4Qix5QkFBQSxFQUEyQixDQUpIO0lBS3hCLGNBQUEsRUFBZ0IsQ0FMUTtJQU14QixzQkFBQSxFQUF3QixDQU5BO0lBT3hCLE1BQUEsRUFBUSxDQVBnQjs7O0VBVTFCLE1BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ1AsV0FBVyxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2pCLFVBQUE7TUFBQSxNQUFBLEdBQWEsSUFBQSxHQUFHLENBQUMsTUFBSixDQUFBO01BQ2IsTUFBTSxDQUFDLEVBQVAsQ0FBVSxPQUFWLEVBQW1CLFNBQUMsS0FBRDtRQUNqQixNQUFNLENBQUMsT0FBUCxDQUFBO2VBQ0EsTUFBQSxDQUFPLEtBQVA7TUFGaUIsQ0FBbkI7YUFHQSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkIsU0FBQTtBQUN6QixZQUFBO1FBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsTUFBbkI7UUFDQSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQUksQ0FBQyxTQUFMLENBQWU7VUFBQyxNQUFBLEVBQVEsSUFBVDtVQUFlLFdBQUEsRUFBYSxTQUE1QjtTQUFmLENBQWI7UUFDQSxRQUFBLEdBQVc7UUFDWCxNQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsU0FBQyxLQUFEO2lCQUNoQixRQUFBLElBQVk7UUFESSxDQUFsQjtlQUVBLE1BQU0sQ0FBQyxFQUFQLENBQVUsS0FBVixFQUFpQixTQUFBO1VBQ2YsUUFBQSxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsUUFBWDtVQUNYLElBQUcsc0JBQUg7WUFDRSxNQUFBLENBQU8sS0FBQSxDQUFNLFFBQVEsQ0FBQyxLQUFmLENBQVAsRUFERjtXQUFBLE1BQUE7WUFHRSxPQUFBLENBQVEsUUFBUSxDQUFDLElBQWpCLEVBSEY7O2lCQUlBLE1BQU0sQ0FBQyxPQUFQLENBQUE7UUFOZSxDQUFqQjtNQU55QixDQUEzQjtJQUxpQixDQUFSO0VBREo7O0VBb0JULE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OytCQUVyQixJQUFBLEdBQU07OytCQUNOLElBQUEsR0FBTTs7K0JBQ04sY0FBQSxHQUFnQjs7K0JBRWhCLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7K0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsUUFBQSxHQUFXO1FBQUMsTUFBQSxFQUFRLE9BQU8sQ0FBQyxRQUFqQjs7TUFDWCxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLFVBQXZCO1FBQ0UsUUFBUSxDQUFDLE1BQVQsR0FBa0I7VUFDaEIsUUFBQSxFQUFVLE9BQU8sQ0FBQyxNQURGO1VBRWhCLGlCQUFBLEVBQW1CLE9BQU8sQ0FBQyxlQUZYO1VBRHBCO09BQUEsTUFLSyxJQUFHLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE1BQXZCO1FBQ0gsUUFBUSxDQUFDLE1BQVQsR0FBa0I7VUFBQyxjQUFBLEVBQWdCLE9BQU8sQ0FBQyxZQUF6QjtVQURmOztNQUVMLFNBQUEsR0FBWSxDQUFDLFFBQUQ7TUFDWixJQUFHLE9BQU8sQ0FBQyxZQUFYO1FBQ0UsaUJBQUEsR0FBb0IsdUJBQXdCLENBQUEsT0FBTyxDQUFDLGlCQUFSO1FBQzVDLFNBQVMsQ0FBQyxJQUFWLENBQ0U7VUFBQSxNQUFBLEVBQVEsT0FBUjtVQUNBLFFBQUEsRUFBVTtZQUFDLG1CQUFBLEVBQXFCLGlCQUF0QjtXQURWO1NBREYsRUFGRjs7QUFLQSxhQUFXLElBQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxTQUFDLE9BQUQsRUFBVSxNQUFWO2VBQ2xCLE1BQUEsQ0FBTyxJQUFQLEVBQWEsU0FBYixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtpQkFDSixPQUFBLENBQVEsSUFBUjtRQURJLENBRE4sQ0FHQSxFQUFDLEtBQUQsRUFIQSxDQUdPLFNBQUMsS0FBRDtpQkFDTCxNQUFBLENBQU8sS0FBUDtRQURLLENBSFA7TUFEa0IsQ0FBVDtJQWZIOzs7O0tBVm9DO0FBcENoRCIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xyXG5uZXQgPSByZXF1aXJlKCduZXQnKVxyXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcclxuXHJcbkhPU1QgPSAnMTI3LjAuMC4xJ1xyXG5QT1JUID0gMzY4MDVcclxuTVVMVElfTElORV9PVVRQVVRfVEFCTEUgPSB7XHJcbiAgJ0dyaWQnOiAwLFxyXG4gICdWZXJ0aWNhbCc6IDEsXHJcbiAgJ0hhbmdpbmcgSW5kZW50JzogMixcclxuICAnVmVydGljYWwgSGFuZ2luZyBJbmRlbnQnOiAzLFxyXG4gICdIYW5naW5nIEdyaWQnOiA0LFxyXG4gICdIYW5naW5nIEdyaWQgR3JvdXBlZCc6IDUsXHJcbiAgJ05PUUEnOiA2XHJcbn1cclxuXHJcbmZvcm1hdCA9IChkYXRhLCBmb3JtYXRlcnMpIC0+XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICBjbGllbnQgPSBuZXcgbmV0LlNvY2tldCgpXHJcbiAgICBjbGllbnQub24gJ2Vycm9yJywgKGVycm9yKSAtPlxyXG4gICAgICBjbGllbnQuZGVzdHJveSgpXHJcbiAgICAgIHJlamVjdChlcnJvcilcclxuICAgIGNsaWVudC5jb25uZWN0IFBPUlQsIEhPU1QsIC0+XHJcbiAgICAgIGNsaWVudC5zZXRFbmNvZGluZygndXRmOCcpXHJcbiAgICAgIGNsaWVudC53cml0ZShKU09OLnN0cmluZ2lmeSh7J2RhdGEnOiBkYXRhLCAnZm9ybWF0ZXJzJzogZm9ybWF0ZXJzfSkpXHJcbiAgICAgIHJlc3BvbnNlID0gJydcclxuICAgICAgY2xpZW50Lm9uICdkYXRhJywgKGNodW5rKSAtPlxyXG4gICAgICAgIHJlc3BvbnNlICs9IGNodW5rXHJcbiAgICAgIGNsaWVudC5vbiAnZW5kJywgLT5cclxuICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2UpXHJcbiAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3I/XHJcbiAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2UuZXJyb3IpKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UuZGF0YSlcclxuICAgICAgICBjbGllbnQuZGVzdHJveSgpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFB5dGhvbkJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXHJcblxyXG4gIG5hbWU6IFwicHliZWF1dGlmaWVyXCJcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9ndXlza2svcHliZWF1dGlmaWVyXCJcclxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcclxuXHJcbiAgb3B0aW9uczoge1xyXG4gICAgUHl0aG9uOiB0cnVlXHJcbiAgfVxyXG5cclxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxyXG4gICAgZm9ybWF0ZXIgPSB7J25hbWUnOiBvcHRpb25zLmZvcm1hdGVyfVxyXG4gICAgaWYgb3B0aW9ucy5mb3JtYXRlciA9PSAnYXV0b3BlcDgnXHJcbiAgICAgIGZvcm1hdGVyLmNvbmZpZyA9IHtcclxuICAgICAgICAnaWdub3JlJzogb3B0aW9ucy5pZ25vcmVcclxuICAgICAgICAnbWF4X2xpbmVfbGVuZ3RoJzogb3B0aW9ucy5tYXhfbGluZV9sZW5ndGhcclxuICAgICAgfVxyXG4gICAgZWxzZSBpZiBvcHRpb25zLmZvcm1hdGVyID09ICd5YXBmJ1xyXG4gICAgICBmb3JtYXRlci5jb25maWcgPSB7J3N0eWxlX2NvbmZpZyc6IG9wdGlvbnMuc3R5bGVfY29uZmlnfVxyXG4gICAgZm9ybWF0ZXJzID0gW2Zvcm1hdGVyXVxyXG4gICAgaWYgb3B0aW9ucy5zb3J0X2ltcG9ydHNcclxuICAgICAgbXVsdGlfbGluZV9vdXRwdXQgPSBNVUxUSV9MSU5FX09VVFBVVF9UQUJMRVtvcHRpb25zLm11bHRpX2xpbmVfb3V0cHV0XVxyXG4gICAgICBmb3JtYXRlcnMucHVzaFxyXG4gICAgICAgICduYW1lJzogJ2lzb3J0J1xyXG4gICAgICAgICdjb25maWcnOiB7J211bHRpX2xpbmVfb3V0cHV0JzogbXVsdGlfbGluZV9vdXRwdXR9XHJcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XHJcbiAgICAgIGZvcm1hdCh0ZXh0LCBmb3JtYXRlcnMpXHJcbiAgICAgIC50aGVuIChkYXRhKSAtPlxyXG4gICAgICAgIHJlc29sdmUoZGF0YSlcclxuICAgICAgLmNhdGNoIChlcnJvcikgLT5cclxuICAgICAgICByZWplY3QoZXJyb3IpXHJcbiJdfQ==
