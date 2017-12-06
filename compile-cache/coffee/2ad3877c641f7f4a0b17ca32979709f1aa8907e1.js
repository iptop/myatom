
/*
Requires https://github.com/FriendsOfPHP/PHP-CS-Fixer
 */

(function() {
  "use strict";
  var Beautifier, PHPCSFixer, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = PHPCSFixer = (function(superClass) {
    extend(PHPCSFixer, superClass);

    function PHPCSFixer() {
      return PHPCSFixer.__super__.constructor.apply(this, arguments);
    }

    PHPCSFixer.prototype.name = 'PHP-CS-Fixer';

    PHPCSFixer.prototype.link = "https://github.com/FriendsOfPHP/PHP-CS-Fixer";

    PHPCSFixer.prototype.executables = [
      {
        name: "PHP",
        cmd: "php",
        homepage: "http://php.net/",
        installation: "http://php.net/manual/en/install.php",
        version: {
          parse: function(text) {
            return text.match(/PHP (\d+\.\d+\.\d+)/)[1];
          }
        }
      }, {
        name: "PHP-CS-Fixer",
        cmd: "php-cs-fixer",
        homepage: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
        installation: "https://github.com/FriendsOfPHP/PHP-CS-Fixer#installation",
        optional: true,
        version: {
          parse: function(text) {
            try {
              return text.match(/version (.*) by/)[1] + ".0";
            } catch (error) {
              return text.match(/PHP CS Fixer (\d+\.\d+\.\d+)/)[1];
            }
          }
        },
        docker: {
          image: "unibeautify/php-cs-fixer",
          workingDir: "/project"
        }
      }
    ];

    PHPCSFixer.prototype.options = {
      PHP: {
        rules: true,
        cs_fixer_path: true,
        cs_fixer_version: true,
        cs_fixer_config_file: true,
        allow_risky: true,
        level: true,
        fixers: true
      }
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFiles, isVersion1, php, phpCsFixer, phpCsFixerOptions, runOptions;
      this.debug('php-cs-fixer', options);
      php = this.exe('php');
      phpCsFixer = this.exe('php-cs-fixer');
      configFiles = ['.php_cs', '.php_cs.dist'];
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), configFiles) : void 0;
      }
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = this.findFile(atom.project.getPaths()[0], configFiles);
      }
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, options.cs_fixer_config_file ? "--config=" + options.cs_fixer_config_file : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
      isVersion1 = (phpCsFixer.isInstalled && phpCsFixer.isVersion('1.x')) || (options.cs_fixer_version && phpCsFixer.versionSatisfies(options.cs_fixer_version + ".0.0", '1.x'));
      if (isVersion1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, options.cs_fixer_config_file ? "--config-file=" + options.cs_fixer_config_file : void 0];
      }
      runOptions = {
        ignoreReturnCode: true,
        help: {
          link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
        }
      };
      if (options.cs_fixer_path) {
        this.deprecateOptionForExecutable("PHP-CS-Fixer", "PHP - PHP-CS-Fixer Path (cs_fixer_path)", "Path");
      }
      return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, phpCsFixer.path(), this.tempFile("temp", text, '.php')]).then((function(_this) {
        return function(arg) {
          var customPhpCsFixerPath, finalPhpCsFixerPath, isPhpScript, phpCsFixerPath, tempFile;
          customPhpCsFixerPath = arg[0], phpCsFixerPath = arg[1], tempFile = arg[2];
          finalPhpCsFixerPath = customPhpCsFixerPath && path.isAbsolute(customPhpCsFixerPath) ? customPhpCsFixerPath : phpCsFixerPath;
          _this.verbose('finalPhpCsFixerPath', finalPhpCsFixerPath, phpCsFixerPath, customPhpCsFixerPath);
          isPhpScript = (finalPhpCsFixerPath.indexOf(".phar") !== -1) || (finalPhpCsFixerPath.indexOf(".php") !== -1);
          _this.verbose('isPhpScript', isPhpScript);
          if (finalPhpCsFixerPath && isPhpScript) {
            return php.run([finalPhpCsFixerPath, phpCsFixerOptions, tempFile], runOptions).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return phpCsFixer.run([phpCsFixerOptions, tempFile], Object.assign({}, runOptions, {
              cmd: finalPhpCsFixerPath
            })).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9waHAtY3MtZml4ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLDRCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBRXJCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxLQURSO1FBRUUsR0FBQSxFQUFLLEtBRlA7UUFHRSxRQUFBLEVBQVUsaUJBSFo7UUFJRSxZQUFBLEVBQWMsc0NBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLHFCQUFYLENBQWtDLENBQUEsQ0FBQTtVQUE1QyxDQURBO1NBTFg7T0FEVyxFQVVYO1FBQ0UsSUFBQSxFQUFNLGNBRFI7UUFFRSxHQUFBLEVBQUssY0FGUDtRQUdFLFFBQUEsRUFBVSw4Q0FIWjtRQUlFLFlBQUEsRUFBYywyREFKaEI7UUFLRSxRQUFBLEVBQVUsSUFMWjtRQU1FLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7QUFDTDtxQkFDRSxJQUFJLENBQUMsS0FBTCxDQUFXLGlCQUFYLENBQThCLENBQUEsQ0FBQSxDQUE5QixHQUFtQyxLQURyQzthQUFBLGFBQUE7cUJBR0UsSUFBSSxDQUFDLEtBQUwsQ0FBVyw4QkFBWCxDQUEyQyxDQUFBLENBQUEsRUFIN0M7O1VBREssQ0FEQTtTQU5YO1FBYUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLDBCQUREO1VBRU4sVUFBQSxFQUFZLFVB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LmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXHJcbiMjI1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCJcclxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXHJcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUEhQQ1NGaXhlciBleHRlbmRzIEJlYXV0aWZpZXJcclxuXHJcbiAgbmFtZTogJ1BIUC1DUy1GaXhlcidcclxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXCJcclxuICBleGVjdXRhYmxlczogW1xyXG4gICAge1xyXG4gICAgICBuYW1lOiBcIlBIUFwiXHJcbiAgICAgIGNtZDogXCJwaHBcIlxyXG4gICAgICBob21lcGFnZTogXCJodHRwOi8vcGhwLm5ldC9cIlxyXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2luc3RhbGwucGhwXCJcclxuICAgICAgdmVyc2lvbjoge1xyXG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvUEhQIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcIlBIUC1DUy1GaXhlclwiXHJcbiAgICAgIGNtZDogXCJwaHAtY3MtZml4ZXJcIlxyXG4gICAgICBob21lcGFnZTogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXHJcbiAgICAgIGluc3RhbGxhdGlvbjogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlciNpbnN0YWxsYXRpb25cIlxyXG4gICAgICBvcHRpb25hbDogdHJ1ZVxyXG4gICAgICB2ZXJzaW9uOiB7XHJcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPlxyXG4gICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHRleHQubWF0Y2goL3ZlcnNpb24gKC4qKSBieS8pWzFdICsgXCIuMFwiXHJcbiAgICAgICAgICBjYXRjaFxyXG4gICAgICAgICAgICB0ZXh0Lm1hdGNoKC9QSFAgQ1MgRml4ZXIgKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxyXG4gICAgICB9XHJcbiAgICAgIGRvY2tlcjoge1xyXG4gICAgICAgIGltYWdlOiBcInVuaWJlYXV0aWZ5L3BocC1jcy1maXhlclwiXHJcbiAgICAgICAgd29ya2luZ0RpcjogXCIvcHJvamVjdFwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdXHJcblxyXG4gIG9wdGlvbnM6XHJcbiAgICBQSFA6XHJcbiAgICAgIHJ1bGVzOiB0cnVlXHJcbiAgICAgIGNzX2ZpeGVyX3BhdGg6IHRydWVcclxuICAgICAgY3NfZml4ZXJfdmVyc2lvbjogdHJ1ZVxyXG4gICAgICBjc19maXhlcl9jb25maWdfZmlsZTogdHJ1ZVxyXG4gICAgICBhbGxvd19yaXNreTogdHJ1ZVxyXG4gICAgICBsZXZlbDogdHJ1ZVxyXG4gICAgICBmaXhlcnM6IHRydWVcclxuXHJcbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cclxuICAgIEBkZWJ1ZygncGhwLWNzLWZpeGVyJywgb3B0aW9ucylcclxuICAgIHBocCA9IEBleGUoJ3BocCcpXHJcbiAgICBwaHBDc0ZpeGVyID0gQGV4ZSgncGhwLWNzLWZpeGVyJylcclxuICAgIGNvbmZpZ0ZpbGVzID0gWycucGhwX2NzJywgJy5waHBfY3MuZGlzdCddXHJcblxyXG4gICAgIyBGaW5kIGEgY29uZmlnIGZpbGUgaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGlmIGEgY3VzdG9tIG9uZSB3YXMgbm90IHByb3ZpZGVkXHJcbiAgICBpZiBub3Qgb3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZVxyXG4gICAgICBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlID0gaWYgY29udGV4dD8gYW5kIGNvbnRleHQuZmlsZVBhdGg/IHRoZW4gQGZpbmRGaWxlKHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVQYXRoKSwgY29uZmlnRmlsZXMpXHJcblxyXG4gICAgIyBUcnkgYWdhaW4gdG8gZmluZCBhIGNvbmZpZyBmaWxlIGluIHRoZSBwcm9qZWN0IHJvb3RcclxuICAgIGlmIG5vdCBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXHJcbiAgICAgIG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGUgPSBAZmluZEZpbGUoYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIGNvbmZpZ0ZpbGVzKVxyXG5cclxuICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xyXG4gICAgICBcImZpeFwiXHJcbiAgICAgIFwiLS1ydWxlcz0je29wdGlvbnMucnVsZXN9XCIgaWYgb3B0aW9ucy5ydWxlc1xyXG4gICAgICBcIi0tY29uZmlnPSN7b3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZX1cIiBpZiBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXHJcbiAgICAgIFwiLS1hbGxvdy1yaXNreT0je29wdGlvbnMuYWxsb3dfcmlza3l9XCIgaWYgb3B0aW9ucy5hbGxvd19yaXNreVxyXG4gICAgICBcIi0tdXNpbmctY2FjaGU9bm9cIlxyXG4gICAgXVxyXG5cclxuICAgIGlzVmVyc2lvbjEgPSAoKHBocENzRml4ZXIuaXNJbnN0YWxsZWQgYW5kIHBocENzRml4ZXIuaXNWZXJzaW9uKCcxLngnKSkgb3IgXFxcclxuICAgICAgKG9wdGlvbnMuY3NfZml4ZXJfdmVyc2lvbiBhbmQgcGhwQ3NGaXhlci52ZXJzaW9uU2F0aXNmaWVzKFwiI3tvcHRpb25zLmNzX2ZpeGVyX3ZlcnNpb259LjAuMFwiLCAnMS54JykpKVxyXG4gICAgaWYgaXNWZXJzaW9uMVxyXG4gICAgICBwaHBDc0ZpeGVyT3B0aW9ucyA9IFtcclxuICAgICAgICBcImZpeFwiXHJcbiAgICAgICAgXCItLWxldmVsPSN7b3B0aW9ucy5sZXZlbH1cIiBpZiBvcHRpb25zLmxldmVsXHJcbiAgICAgICAgXCItLWZpeGVycz0je29wdGlvbnMuZml4ZXJzfVwiIGlmIG9wdGlvbnMuZml4ZXJzXHJcbiAgICAgICAgXCItLWNvbmZpZy1maWxlPSN7b3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZX1cIiBpZiBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXHJcbiAgICAgIF1cclxuICAgIHJ1bk9wdGlvbnMgPSB7XHJcbiAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcclxuICAgICAgaGVscDoge1xyXG4gICAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXJcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxyXG4gICAgaWYgb3B0aW9ucy5jc19maXhlcl9wYXRoXHJcbiAgICAgIEBkZXByZWNhdGVPcHRpb25Gb3JFeGVjdXRhYmxlKFwiUEhQLUNTLUZpeGVyXCIsIFwiUEhQIC0gUEhQLUNTLUZpeGVyIFBhdGggKGNzX2ZpeGVyX3BhdGgpXCIsIFwiUGF0aFwiKVxyXG5cclxuICAgIEBQcm9taXNlLmFsbChbXHJcbiAgICAgIEB3aGljaChvcHRpb25zLmNzX2ZpeGVyX3BhdGgpIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxyXG4gICAgICBwaHBDc0ZpeGVyLnBhdGgoKVxyXG4gICAgICBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsICcucGhwJylcclxuICAgIF0pLnRoZW4oKFtjdXN0b21QaHBDc0ZpeGVyUGF0aCwgcGhwQ3NGaXhlclBhdGgsIHRlbXBGaWxlXSkgPT5cclxuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcclxuICAgICAgZmluYWxQaHBDc0ZpeGVyUGF0aCA9IGlmIGN1c3RvbVBocENzRml4ZXJQYXRoIGFuZCBwYXRoLmlzQWJzb2x1dGUoY3VzdG9tUGhwQ3NGaXhlclBhdGgpIHRoZW4gXFxcclxuICAgICAgICBjdXN0b21QaHBDc0ZpeGVyUGF0aCBlbHNlIHBocENzRml4ZXJQYXRoXHJcbiAgICAgIEB2ZXJib3NlKCdmaW5hbFBocENzRml4ZXJQYXRoJywgZmluYWxQaHBDc0ZpeGVyUGF0aCwgcGhwQ3NGaXhlclBhdGgsIGN1c3RvbVBocENzRml4ZXJQYXRoKVxyXG5cclxuICAgICAgaXNQaHBTY3JpcHQgPSAoZmluYWxQaHBDc0ZpeGVyUGF0aC5pbmRleE9mKFwiLnBoYXJcIikgaXNudCAtMSkgb3IgKGZpbmFsUGhwQ3NGaXhlclBhdGguaW5kZXhPZihcIi5waHBcIikgaXNudCAtMSlcclxuICAgICAgQHZlcmJvc2UoJ2lzUGhwU2NyaXB0JywgaXNQaHBTY3JpcHQpXHJcblxyXG4gICAgICBpZiBmaW5hbFBocENzRml4ZXJQYXRoIGFuZCBpc1BocFNjcmlwdFxyXG4gICAgICAgIHBocC5ydW4oW2ZpbmFsUGhwQ3NGaXhlclBhdGgsIHBocENzRml4ZXJPcHRpb25zLCB0ZW1wRmlsZV0sIHJ1bk9wdGlvbnMpXHJcbiAgICAgICAgICAudGhlbig9PlxyXG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXHJcbiAgICAgICAgICApXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBwaHBDc0ZpeGVyLnJ1bihbcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSxcclxuICAgICAgICAgIE9iamVjdC5hc3NpZ24oe30sIHJ1bk9wdGlvbnMsIHsgY21kOiBmaW5hbFBocENzRml4ZXJQYXRoIH0pXHJcbiAgICAgICAgKVxyXG4gICAgICAgICAgLnRoZW4oPT5cclxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxyXG4gICAgICAgICAgKVxyXG4gICAgKVxyXG4iXX0=
