(function() {
  var DEFAULT_INDENT, DEFAULT_WARN_FN, adjust_space;

  DEFAULT_INDENT = '    ';

  adjust_space = function(line) {
    var comment, muli_string, string_list;
    string_list = line.match(/(['"])[^\1]*?\1/g);
    muli_string = line.match(/\[(=*)\[([^\]\1\]]*)/);
    comment = line.match(/\-{2}[^\[].*$/);
    line = line.replace(/\s+/g, ' ');
    line = line.replace(/\s?(==|>=|<=|~=|[=><\+\*\/])\s?/g, ' $1 ');
    line = line.replace(/([^=e\-\(\s])\s?\-\s?([^\-\[])/g, '$1 - $2');
    line = line.replace(/([^\d])e\s?\-\s?([^\-\[])/g, '$1e - $2');
    line = line.replace(/,([^\s])/g, ', $1');
    line = line.replace(/\s+,/g, ',');
    line = line.replace(/(['"])[^\1]*?\1/g, function() {
      return string_list.shift();
    });
    if (muli_string && muli_string[0]) {
      line = line.replace(/\[(=*)\[([^\]\1\]]*)/, muli_string[0]);
    }
    if (comment && comment[0]) {
      line = line.replace(/\-{2}[^\[].*$/, comment[0]);
    }
    return line;
  };

  DEFAULT_WARN_FN = function(msg) {
    return console.log('WARNING:', msg);
  };

  module.exports = function(str, indent, warn_fn, opts) {
    var $currIndent, $extIndent, $lastIndent, $nextIndent, $prevLength, $template, eol, new_code;
    if (opts == null) {
      opts = {};
    }
    eol = (opts != null ? opts.eol : void 0) || '\n';
    indent = indent || DEFAULT_INDENT;
    warn_fn = typeof warn_fn === 'function' ? warn_fn : DEFAULT_WARN_FN;
    if (Number.isInteger(indent)) {
      indent = ' '.repeat(indent);
    }
    $currIndent = 0;
    $nextIndent = 0;
    $prevLength = 0;
    $extIndent = 0;
    $lastIndent = 0;
    $template = 0;
    new_code = str.split(/\r?\n/g).map(function(line, line_number) {
      var $brackets, $curly, $template_flag, $useful, arr, code, comment, new_line, raw_line, res1, res2;
      $template_flag = false;
      if ($template) {
        res2 = line.match(/\](=*)\]/);
        if (res2 && $template === res2[1].length + 1) {
          $template_flag = true;
          if ($template && !/]=*]$/.test(line)) {
            arr = line.split(/\]=*\]/, 2);
            comment = arr[0];
            code = arr[1];
            line = comment + ']' + '='.repeat($template - 1) + ']' + adjust_space(code);
            $template = 0;
          }
          $template = 0;
        } else {
          return line;
        }
      }
      res1 = line.match(/\[(=*)\[/);
      if (res1) {
        $template = res1[1].length + 1;
      }
      if (!$template_flag) {
        line = line.trim();
        line = adjust_space(line);
      }
      if (!line.length) {
        return '';
      }
      raw_line = line;
      line = line.replace(/(['"])[^\1]*?\1/, '');
      line = line.replace(/\s*--.+/, '');
      if (/^((local )?function|repeat|while)\b/.test(line) && !/\bend\s*[\),;]*$/.test(line) || /\b(then|do)$/.test(line) && !/^elseif\b/.test(line) || /^if\b/.test(line) && /\bthen\b/.test(line) && !/\bend$/.test(line) || /\bfunction ?(?:\w+ )?\([^\)]*\)$/.test(line) && !/\bend$/.test(line)) {
        $nextIndent = $currIndent + 1;
      } else if (/^until\b/.test(line) || /^end\s*[\),;]*$/.test(line) || /^end\s*\)\s*\.\./.test(line) || /^else(if)?\b/.test(line) && /\bend$/.test(line)) {
        $nextIndent = --$currIndent;
      } else if (/^else\b/.test(line) || /^elseif\b/.test(line)) {
        $nextIndent = $currIndent;
        $currIndent = $currIndent - 1;
      }
      $brackets = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      $curly = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if ($curly < 0) {
        $currIndent += $curly;
      }
      if ($brackets < 0) {
        $currIndent += $brackets;
      }
      $nextIndent += $brackets + $curly;
      if ($currIndent - $lastIndent > 1) {
        $extIndent += $nextIndent - $lastIndent - 1;
        $nextIndent = $currIndent = 1 + $lastIndent;
      }
      if ($currIndent - $lastIndent < -1 && $extIndent > 0) {
        $extIndent += $currIndent - $lastIndent + 1;
        $currIndent = -1 + $lastIndent;
      }
      if ($nextIndent < $currIndent) {
        $nextIndent = $currIndent;
      }
      if ($currIndent < 0) {
        warn_fn("negative indentation at line " + line_number + ": " + raw_line);
      }
      new_line = (raw_line.length && $currIndent > 0 && !$template_flag ? indent.repeat($currIndent) : '') + raw_line;
      $useful = $prevLength > 0 || raw_line.length > 0;
      $lastIndent = $currIndent;
      $currIndent = $nextIndent;
      $prevLength = raw_line.length;
      return new_line || void 0;
    });
    if ($currIndent > 0) {
      warn_fn('positive indentation at the end');
    }
    return new_code.join(eol);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdG9tLWJlYXV0aWZ5L3NyYy9iZWF1dGlmaWVycy9sdWEtYmVhdXRpZmllci9iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsY0FBQSxHQUFpQjs7RUFFakIsWUFBQSxHQUFlLFNBQUMsSUFBRDtBQUNiLFFBQUE7SUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxrQkFBWDtJQUNkLFdBQUEsR0FBYyxJQUFJLENBQUMsS0FBTCxDQUFXLHNCQUFYO0lBQ2QsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWDtJQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQWIsRUFBcUIsR0FBckI7SUFFUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxrQ0FBYixFQUFpRCxNQUFqRDtJQUVQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLGlDQUFiLEVBQWdELFNBQWhEO0lBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsNEJBQWIsRUFBMkMsVUFBM0M7SUFFUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLEVBQTBCLE1BQTFCO0lBRVAsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixFQUFzQixHQUF0QjtJQUVQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLGtCQUFiLEVBQWlDLFNBQUE7YUFDdEMsV0FBVyxDQUFDLEtBQVosQ0FBQTtJQURzQyxDQUFqQztJQUVQLElBQUcsV0FBQSxJQUFnQixXQUFZLENBQUEsQ0FBQSxDQUEvQjtNQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLHNCQUFiLEVBQXFDLFdBQVksQ0FBQSxDQUFBLENBQWpELEVBRFQ7O0lBRUEsSUFBRyxP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QUEsSUFBZSxVQURqQjs7TUFFQSxXQUFBLElBQWUsU0FBQSxHQUFZO01BRTNCLElBQUcsV0FBQSxHQUFjLFdBQWQsR0FBNEIsQ0FBL0I7UUFDRSxVQUFBLElBQWMsV0FBQSxHQUFjLFdBQWQsR0FBNEI7UUFDMUMsV0FBQSxHQUFjLFdBQUEsR0FBYyxDQUFBLEdBQUksWUFGbEM7O01BR0EsSUFBRyxXQUFBLEdBQWMsV0FBZCxHQUE0QixDQUFDLENBQTdCLElBQW1DLFVBQUEsR0FBYSxDQUFuRDtRQUNFLFVBQUEsSUFBYyxXQUFBLEdBQWMsV0FBZCxHQUE0QjtRQUMxQyxXQUFBLEdBQWMsQ0FBQyxDQUFELEdBQUssWUFGckI7O01BR0EsSUFBRyxXQUFBLEdBQWMsV0FBakI7UUFDRSxXQUFBLEdBQWMsWUFEaEI7O01BR0EsSUFBMEUsV0FBQSxHQUFjLENBQXhGO1FBQUEsT0FBQSxDQUFRLCtCQUFBLEdBQWtDLFdBQWxDLEdBQThDLElBQTlDLEdBQWtELFFBQTFELEVBQUE7O01BQ0EsUUFBQSxHQUFXLENBQUksUUFBUSxDQUFDLE1BQVQsSUFBb0IsV0FBQSxHQUFjLENBQWxDLElBQXdDLENBQUMsY0FBNUMsR0FBZ0UsTUFBTSxDQUFDLE1BQVAsQ0FBYyxXQUFkLENBQWhFLEdBQWdHLEVBQWpHLENBQUEsR0FBdUc7TUFDbEgsT0FBQSxHQUFVLFdBQUEsR0FBYyxDQUFkLElBQW1CLFFBQVEsQ0FBQyxNQUFULEdBQWtCO01BQy9DLFdBQUEsR0FBYztNQUNkLFdBQUEsR0FBYztNQUNkLFdBQUEsR0FBYyxRQUFRLENBQUM7YUFDdkIsUUFBQSxJQUFZO0lBOURxQixDQUF4QjtJQWdFWCxJQUE2QyxXQUFBLEdBQWMsQ0FBM0Q7TUFBQSxPQUFBLENBQVEsaUNBQVIsRUFBQTs7V0FDQSxRQUFRLENBQUMsSUFBVCxDQUFjLEdBQWQ7RUE1RWU7QUE1QmpCIiwic291cmNlc0NvbnRlbnQiOlsiREVGQVVMVF9JTkRFTlQgPSAnICAgICdcclxuXHJcbmFkanVzdF9zcGFjZSA9IChsaW5lKSAtPlxyXG4gIHN0cmluZ19saXN0ID0gbGluZS5tYXRjaCAvKFsnXCJdKVteXFwxXSo/XFwxL2dcclxuICBtdWxpX3N0cmluZyA9IGxpbmUubWF0Y2ggL1xcWyg9KilcXFsoW15cXF1cXDFcXF1dKikvXHJcbiAgY29tbWVudCA9IGxpbmUubWF0Y2ggL1xcLXsyfVteXFxbXS4qJC9cclxuICBsaW5lID0gbGluZS5yZXBsYWNlIC9cXHMrL2csICcgJ1xyXG4gICMgcmVwbGFjZSBhbGwgd2hpdGVzcGFjZXMgaW5zaWRlIHRoZSBzdHJpbmcgd2l0aCBvbmUgc3BhY2UsIFdBUk5JTkc6IHRoZSB3aGl0ZXNwYWNlcyBpbiBzdHJpbmcgd2lsbCBiZSByZXBsYWNlIHRvbyFcclxuICBsaW5lID0gbGluZS5yZXBsYWNlIC9cXHM/KD09fD49fDw9fH49fFs9PjxcXCtcXCpcXC9dKVxccz8vZywgJyAkMSAnXHJcbiAgIyBhZGQgd2hpdGVzcGFjZSBhcm91bmQgdGhlIG9wZXJhdG9yXHJcbiAgbGluZSA9IGxpbmUucmVwbGFjZSAvKFtePWVcXC1cXChcXHNdKVxccz9cXC1cXHM/KFteXFwtXFxbXSkvZywgJyQxIC0gJDInXHJcbiAgbGluZSA9IGxpbmUucmVwbGFjZSAvKFteXFxkXSllXFxzP1xcLVxccz8oW15cXC1cXFtdKS9nLCAnJDFlIC0gJDInXHJcbiAgIyBqdXN0IGZvcm1hdCBtaW51cywgbm90IGZvciAtLSBvciBuZWdhdGl2ZSBudW1iZXIgb3IgY29tbWVudGFyeS5cclxuICBsaW5lID0gbGluZS5yZXBsYWNlIC8sKFteXFxzXSkvZywgJywgJDEnXHJcbiAgIyBhZGp1c3QgJywnXHJcbiAgbGluZSA9IGxpbmUucmVwbGFjZSAvXFxzKywvZywgJywnXHJcbiAgIyByZWNvdmVyIHRoZSB3aGl0ZXNwYWNlcyBpbiBzdHJpbmcuXHJcbiAgbGluZSA9IGxpbmUucmVwbGFjZSAvKFsnXCJdKVteXFwxXSo/XFwxL2csIC0+XHJcbiAgICBzdHJpbmdfbGlzdC5zaGlmdCgpXHJcbiAgaWYgbXVsaV9zdHJpbmcgYW5kIG11bGlfc3RyaW5nWzBdXHJcbiAgICBsaW5lID0gbGluZS5yZXBsYWNlIC9cXFsoPSopXFxbKFteXFxdXFwxXFxdXSopLywgbXVsaV9zdHJpbmdbMF1cclxuICBpZiBjb21tZW50IGFuZCBjb21tZW50WzBdXHJcbiAgICBsaW5lID0gbGluZS5yZXBsYWNlIC9cXC17Mn1bXlxcW10uKiQvLCBjb21tZW50WzBdXHJcbiAgbGluZVxyXG5cclxuREVGQVVMVF9XQVJOX0ZOID0gKG1zZykgLT5cclxuICBjb25zb2xlLmxvZygnV0FSTklORzonLCBtc2cpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IChzdHIsIGluZGVudCwgd2Fybl9mbiwgb3B0cyA9IHt9KSAtPlxyXG4gIGVvbCA9IG9wdHM/LmVvbCBvciAnXFxuJ1xyXG4gIGluZGVudCA9IGluZGVudCBvciBERUZBVUxUX0lOREVOVFxyXG4gIHdhcm5fZm4gPSBpZiB0eXBlb2Ygd2Fybl9mbiA9PSAnZnVuY3Rpb24nIHRoZW4gd2Fybl9mbiBlbHNlIERFRkFVTFRfV0FSTl9GTlxyXG4gIGluZGVudCA9ICcgJy5yZXBlYXQoaW5kZW50KSBpZiBOdW1iZXIuaXNJbnRlZ2VyKGluZGVudClcclxuICAkY3VyckluZGVudCA9IDBcclxuICAkbmV4dEluZGVudCA9IDBcclxuICAkcHJldkxlbmd0aCA9IDBcclxuICAkZXh0SW5kZW50ID0gMFxyXG4gICRsYXN0SW5kZW50ID0gMFxyXG4gICR0ZW1wbGF0ZSA9IDBcclxuICBuZXdfY29kZSA9IHN0ci5zcGxpdCgvXFxyP1xcbi9nKS5tYXAgKGxpbmUsIGxpbmVfbnVtYmVyKSAtPlxyXG4gICAgJHRlbXBsYXRlX2ZsYWcgPSBmYWxzZVxyXG4gICAgaWYgJHRlbXBsYXRlXHJcbiAgICAgIHJlczIgPSBsaW5lLm1hdGNoKC9cXF0oPSopXFxdLylcclxuICAgICAgaWYgcmVzMiBhbmQgJHRlbXBsYXRlID09IHJlczJbMV0ubGVuZ3RoICsgMVxyXG4gICAgICAgICR0ZW1wbGF0ZV9mbGFnID0gdHJ1ZVxyXG4gICAgICAgIGlmICR0ZW1wbGF0ZSBhbmQgIS9dPSpdJC8udGVzdChsaW5lKVxyXG4gICAgICAgICAgYXJyID0gbGluZS5zcGxpdCgvXFxdPSpcXF0vLCAyKVxyXG4gICAgICAgICAgY29tbWVudCA9IGFyclswXVxyXG4gICAgICAgICAgY29kZSA9IGFyclsxXVxyXG4gICAgICAgICAgbGluZSA9IGNvbW1lbnQgKyAnXScgKyAnPScucmVwZWF0KCR0ZW1wbGF0ZSAtIDEpICsgJ10nICsgYWRqdXN0X3NwYWNlKGNvZGUpXHJcbiAgICAgICAgICAkdGVtcGxhdGUgPSAwXHJcbiAgICAgICAgJHRlbXBsYXRlID0gMFxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuIGxpbmVcclxuICAgIHJlczEgPSBsaW5lLm1hdGNoKC9cXFsoPSopXFxbLylcclxuICAgIGlmIHJlczFcclxuICAgICAgJHRlbXBsYXRlID0gcmVzMVsxXS5sZW5ndGggKyAxXHJcbiAgICBpZiAhJHRlbXBsYXRlX2ZsYWdcclxuICAgICAgbGluZSA9IGxpbmUudHJpbSgpXHJcbiAgICAgICMgcmVtb3RlIGFsbCBzcGFjZXMgb24gYm90aCBlbmRzXHJcbiAgICAgIGxpbmUgPSBhZGp1c3Rfc3BhY2UobGluZSlcclxuICAgIGlmICFsaW5lLmxlbmd0aFxyXG4gICAgICByZXR1cm4gJydcclxuICAgIHJhd19saW5lID0gbGluZVxyXG4gICAgbGluZSA9IGxpbmUucmVwbGFjZSgvKFsnXCJdKVteXFwxXSo/XFwxLywgJycpXHJcbiAgICAjIHJlbW92ZSBhbGwgcXVvdGVkIGZyYWdtZW50cyBmb3IgcHJvcGVyIGJyYWNrZXQgcHJvY2Vzc2luZ1xyXG4gICAgbGluZSA9IGxpbmUucmVwbGFjZSgvXFxzKi0tLisvLCAnJylcclxuICAgICMgcmVtb3ZlIGFsbCBjb21tZW50czsgdGhpcyBpZ25vcmVzIGxvbmcgYnJhY2tldCBzdHlsZSBjb21tZW50c1xyXG4gICAgaWYgL14oKGxvY2FsICk/ZnVuY3Rpb258cmVwZWF0fHdoaWxlKVxcYi8udGVzdChsaW5lKSBhbmQgIS9cXGJlbmRcXHMqW1xcKSw7XSokLy50ZXN0KGxpbmUpIG9yIC9cXGIodGhlbnxkbykkLy50ZXN0KGxpbmUpIGFuZCAhL15lbHNlaWZcXGIvLnRlc3QobGluZSkgb3IgL15pZlxcYi8udGVzdChsaW5lKSBhbmQgL1xcYnRoZW5cXGIvLnRlc3QobGluZSkgYW5kICEvXFxiZW5kJC8udGVzdChsaW5lKSBvciAvXFxiZnVuY3Rpb24gPyg/OlxcdysgKT9cXChbXlxcKV0qXFwpJC8udGVzdChsaW5lKSBhbmQgIS9cXGJlbmQkLy50ZXN0KGxpbmUpXHJcbiAgICAgICRuZXh0SW5kZW50ID0gJGN1cnJJbmRlbnQgKyAxXHJcbiAgICBlbHNlIGlmIC9edW50aWxcXGIvLnRlc3QobGluZSkgb3IgL15lbmRcXHMqW1xcKSw7XSokLy50ZXN0KGxpbmUpIG9yIC9eZW5kXFxzKlxcKVxccypcXC5cXC4vLnRlc3QobGluZSkgb3IgL15lbHNlKGlmKT9cXGIvLnRlc3QobGluZSkgYW5kIC9cXGJlbmQkLy50ZXN0KGxpbmUpXHJcbiAgICAgICRuZXh0SW5kZW50ID0gLS0kY3VyckluZGVudFxyXG4gICAgZWxzZSBpZiAvXmVsc2VcXGIvLnRlc3QobGluZSkgb3IgL15lbHNlaWZcXGIvLnRlc3QobGluZSlcclxuICAgICAgJG5leHRJbmRlbnQgPSAkY3VyckluZGVudFxyXG4gICAgICAkY3VyckluZGVudCA9ICRjdXJySW5kZW50IC0gMVxyXG4gICAgJGJyYWNrZXRzID0gKGxpbmUubWF0Y2goL1xcKC9nKSBvciBbXSkubGVuZ3RoIC0gKChsaW5lLm1hdGNoKC9cXCkvZykgb3IgW10pLmxlbmd0aClcclxuICAgICMgY2FwdHVyZSB1bmJhbGFuY2VkIGJyYWNrZXRzXHJcbiAgICAkY3VybHkgPSAobGluZS5tYXRjaCgvXFx7L2cpIG9yIFtdKS5sZW5ndGggLSAoKGxpbmUubWF0Y2goL1xcfS9nKSBvciBbXSkubGVuZ3RoKVxyXG4gICAgIyBjYXB0dXJlIHVuYmFsYW5jZWQgY3VybHkgYnJhY2tldHNcclxuICAgICMgY2xvc2UgKGN1cmx5KSBicmFja2V0cyBpZiBuZWVkZWRcclxuICAgIGlmICRjdXJseSA8IDBcclxuICAgICAgJGN1cnJJbmRlbnQgKz0gJGN1cmx5XHJcbiAgICBpZiAkYnJhY2tldHMgPCAwXHJcbiAgICAgICRjdXJySW5kZW50ICs9ICRicmFja2V0c1xyXG4gICAgJG5leHRJbmRlbnQgKz0gJGJyYWNrZXRzICsgJGN1cmx5XHJcbiAgICAjIGNvbnNvbGUubG9nKHtsYXN0OiAkbGFzdEluZGVudCwgY3VycjogJGN1cnJJbmRlbnQsIG5leHQ6ICRuZXh0SW5kZW50LCBleHQ6ICRleHRJbmRlbnR9KVxyXG4gICAgaWYgJGN1cnJJbmRlbnQgLSAkbGFzdEluZGVudCA+IDFcclxuICAgICAgJGV4dEluZGVudCArPSAkbmV4dEluZGVudCAtICRsYXN0SW5kZW50IC0gMVxyXG4gICAgICAkbmV4dEluZGVudCA9ICRjdXJySW5kZW50ID0gMSArICRsYXN0SW5kZW50XHJcbiAgICBpZiAkY3VyckluZGVudCAtICRsYXN0SW5kZW50IDwgLTEgYW5kICRleHRJbmRlbnQgPiAwXHJcbiAgICAgICRleHRJbmRlbnQgKz0gJGN1cnJJbmRlbnQgLSAkbGFzdEluZGVudCArIDFcclxuICAgICAgJGN1cnJJbmRlbnQgPSAtMSArICRsYXN0SW5kZW50XHJcbiAgICBpZiAkbmV4dEluZGVudCA8ICRjdXJySW5kZW50XHJcbiAgICAgICRuZXh0SW5kZW50ID0gJGN1cnJJbmRlbnRcclxuICAgICMgY29uc29sZS5sb2coe2xhc3Q6ICRsYXN0SW5kZW50LCBjdXJyOiAkY3VyckluZGVudCwgbmV4dDogJG5leHRJbmRlbnQsIGV4dDogJGV4dEluZGVudH0pXHJcbiAgICB3YXJuX2ZuIFwiXCJcIm5lZ2F0aXZlIGluZGVudGF0aW9uIGF0IGxpbmUgI3tsaW5lX251bWJlcn06ICN7cmF3X2xpbmV9XCJcIlwiIGlmICRjdXJySW5kZW50IDwgMFxyXG4gICAgbmV3X2xpbmUgPSAoaWYgcmF3X2xpbmUubGVuZ3RoIGFuZCAkY3VyckluZGVudCA+IDAgYW5kICEkdGVtcGxhdGVfZmxhZyB0aGVuIGluZGVudC5yZXBlYXQoJGN1cnJJbmRlbnQpIGVsc2UgJycpICsgcmF3X2xpbmVcclxuICAgICR1c2VmdWwgPSAkcHJldkxlbmd0aCA+IDAgb3IgcmF3X2xpbmUubGVuZ3RoID4gMFxyXG4gICAgJGxhc3RJbmRlbnQgPSAkY3VyckluZGVudFxyXG4gICAgJGN1cnJJbmRlbnQgPSAkbmV4dEluZGVudFxyXG4gICAgJHByZXZMZW5ndGggPSByYXdfbGluZS5sZW5ndGhcclxuICAgIG5ld19saW5lIG9yIHVuZGVmaW5lZFxyXG5cclxuICB3YXJuX2ZuICdwb3NpdGl2ZSBpbmRlbnRhdGlvbiBhdCB0aGUgZW5kJyBpZiAkY3VyckluZGVudCA+IDBcclxuICBuZXdfY29kZS5qb2luIGVvbFxyXG4iXX0=
