'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = [{
  scopes: ['source.js', 'source.js.jsx', 'source.coffee', 'source.coffee.jsx', 'source.ts', 'source.tsx'],
  prefixes: ['import\\s+.*?from\\s+[\'"]', // import foo from './foo'
  'import\\s+[\'"]', // import './foo'
  'require\\([\'"]', // require('./foo')
  'define\\(\\[?[\'"]' // define(['./foo']) or define('./foo')
  ],
  extensions: ['js', 'jsx', 'ts', 'tsx', 'coffee', 'json'],
  relative: true,
  replaceOnInsert: [['([\\/]?index)?\\.jsx?$', ''], ['([\\/]?index)?\\.ts$', ''], ['([\\/]?index)?\\.coffee$', '']]
}, {
  scopes: ['text.html.vue'],
  prefixes: ['import\\s+.*?from\\s+[\'"]', // import foo from './foo'
  'import\\s+[\'"]', // import './foo'
  'require\\([\'"]', // require('./foo')
  'define\\(\\[?[\'"]' // define(['./foo']) or define('./foo')
  ],
  extensions: ['js', 'jsx', 'vue', 'ts', 'tsx', 'coffee'],
  relative: true,
  replaceOnInsert: [['\\.jsx?$', ''], ['\\.ts$', ''], ['\\.coffee$', '']]
}, {
  scopes: ['text.html.vue'],
  prefixes: ['@import[\\(|\\s+]?[\'"]' // @import 'foo' or @import('foo')
  ],
  extensions: ['css', 'sass', 'scss', 'less', 'styl'],
  relative: true,
  replaceOnInsert: [['(/)?_([^/]*?)$', '$1$2'] // dir1/_dir2/_file.sass => dir1/_dir2/file.sass
  ]
}, {
  scopes: ['source.coffee', 'source.coffee.jsx'],
  prefixes: ['require\\s+[\'"]', // require './foo'
  'define\\s+\\[?[\'"]' // define(['./foo']) or define('./foo')
  ],
  extensions: ['js', 'jsx', 'ts', 'tsx', 'coffee'],
  relative: true,
  replaceOnInsert: [['\\.jsx?$', ''], ['\\.ts$', ''], ['\\.coffee$', '']]
}, {
  scopes: ['source.php'],
  prefixes: ['require_once\\([\'"]', // require_once('foo.php')
  'include\\([\'"]' // include('./foo.php')
  ],
  extensions: ['php'],
  relative: true
}, {
  scopes: ['source.sass', 'source.css.scss', 'source.less', 'source.stylus'],
  prefixes: ['@import[\\(|\\s+]?[\'"]' // @import 'foo' or @import('foo')
  ],
  extensions: ['sass', 'scss', 'css'],
  relative: true,
  replaceOnInsert: [['(/)?_([^/]*?)$', '$1$2'] // dir1/_dir2/_file.sass => dir1/_dir2/file.sass
  ]
}, {
  scopes: ['source.css'],
  prefixes: ['@import\\s+[\'"]?', // @import 'foo.css'
  '@import\\s+url\\([\'"]?' // @import url('foo.css')
  ],
  extensions: ['css'],
  relative: true
}, {
  scopes: ['source.css', 'source.sass', 'source.less', 'source.css.scss', 'source.stylus'],
  prefixes: ['url\\([\'"]?'],
  extensions: ['png', 'gif', 'jpeg', 'jpg', 'woff', 'ttf', 'svg', 'otf'],
  relative: true
}, {
  scopes: ['source.c', 'source.cpp'],
  prefixes: ['^\\s*#include\\s+[\'"]'],
  extensions: ['h', 'hpp'],
  relative: true,
  includeCurrentDirectory: false
}, {
  scopes: ['source.lua'],
  prefixes: ['require[\\s+|\\(][\'"]'],
  extensions: ['lua'],
  relative: true,
  includeCurrentDirectory: false,
  replaceOnInsert: [['\\/', '.'], ['\\\\', '.'], ['\\.lua$', '']]
}, {
  scopes: ['source.ruby'],
  prefixes: ['^\\s*require[\\s+|\\(][\'"]'],
  extensions: ['rb'],
  relative: true,
  includeCurrentDirectory: false,
  replaceOnInsert: [['\\.rb$', '']]
}, {
  scopes: ['source.python'],
  prefixes: ['^\\s*from\\s+', '^\\s*import\\s+'],
  extensions: ['py'],
  relative: true,
  includeCurrentDirectory: false,
  replaceOnInsert: [['\\/', '.'], ['\\\\', '.'], ['\\.py$', '']]
}];
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL2NvbmZpZy9kZWZhdWx0LXNjb3Blcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7O3FCQUVJLENBQ2I7QUFDRSxRQUFNLEVBQUUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDO0FBQ3ZHLFVBQVEsRUFBRSxDQUNSLDRCQUE0QjtBQUM1QixtQkFBaUI7QUFDakIsbUJBQWlCO0FBQ2pCLHNCQUFvQjtHQUNyQjtBQUNELFlBQVUsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO0FBQ3hELFVBQVEsRUFBRSxJQUFJO0FBQ2QsaUJBQWUsRUFBRSxDQUNmLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxDQUFDLEVBQzlCLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLEVBQzVCLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQ2pDO0NBQ0YsRUFDRDtBQUNFLFFBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQztBQUN6QixVQUFRLEVBQUUsQ0FDUiw0QkFBNEI7QUFDNUIsbUJBQWlCO0FBQ2pCLG1CQUFpQjtBQUNqQixzQkFBb0I7R0FDckI7QUFDRCxZQUFVLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQztBQUN2RCxVQUFRLEVBQUUsSUFBSTtBQUNkLGlCQUFlLEVBQUUsQ0FDZixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFDaEIsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQ2QsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQ25CO0NBQ0YsRUFDRDtBQUNFLFFBQU0sRUFB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QUF1QixFQUFFLEtBQUs7QUFDOUIsaUJBQWUsRUFBRSxDQUNmLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUNmO0NBQ0YsRUFDRDtBQUNFLFFBQU0sRUFBRSxDQUFDLGVBQWUsQ0FBQztBQUN6QixVQUFRLEVBQUUsQ0FDUixlQUFlLEVBQ2YsaUJBQWlCLENBQ2xCO0FBQ0QsWUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2xCLFVBQVEsRUFBRSxJQUFJO0FBQ2QseUJBQXVCLEVBQUUsS0FBSztBQUM5QixpQkFBZSxFQUFFLENBQ2YsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQ1osQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQ2IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQ2Y7Q0FDRixDQUNGIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL2NvbmZpZy9kZWZhdWx0LXNjb3Blcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAge1xuICAgIHNjb3BlczogWydzb3VyY2UuanMnLCAnc291cmNlLmpzLmpzeCcsICdzb3VyY2UuY29mZmVlJywgJ3NvdXJjZS5jb2ZmZWUuanN4JywgJ3NvdXJjZS50cycsICdzb3VyY2UudHN4J10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICdpbXBvcnRcXFxccysuKj9mcm9tXFxcXHMrW1xcJ1wiXScsIC8vIGltcG9ydCBmb28gZnJvbSAnLi9mb28nXG4gICAgICAnaW1wb3J0XFxcXHMrW1xcJ1wiXScsIC8vIGltcG9ydCAnLi9mb28nXG4gICAgICAncmVxdWlyZVxcXFwoW1xcJ1wiXScsIC8vIHJlcXVpcmUoJy4vZm9vJylcbiAgICAgICdkZWZpbmVcXFxcKFxcXFxbP1tcXCdcIl0nIC8vIGRlZmluZShbJy4vZm9vJ10pIG9yIGRlZmluZSgnLi9mb28nKVxuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydqcycsICdqc3gnLCAndHMnLCAndHN4JywgJ2NvZmZlZScsICdqc29uJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXG4gICAgICBbJyhbXFxcXC9dP2luZGV4KT9cXFxcLmpzeD8kJywgJyddLFxuICAgICAgWycoW1xcXFwvXT9pbmRleCk/XFxcXC50cyQnLCAnJ10sXG4gICAgICBbJyhbXFxcXC9dP2luZGV4KT9cXFxcLmNvZmZlZSQnLCAnJ11cbiAgICBdXG4gIH0sXG4gIHtcbiAgICBzY29wZXM6IFsndGV4dC5odG1sLnZ1ZSddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAnaW1wb3J0XFxcXHMrLio/ZnJvbVxcXFxzK1tcXCdcIl0nLCAvLyBpbXBvcnQgZm9vIGZyb20gJy4vZm9vJ1xuICAgICAgJ2ltcG9ydFxcXFxzK1tcXCdcIl0nLCAvLyBpbXBvcnQgJy4vZm9vJ1xuICAgICAgJ3JlcXVpcmVcXFxcKFtcXCdcIl0nLCAvLyByZXF1aXJlKCcuL2ZvbycpXG4gICAgICAnZGVmaW5lXFxcXChcXFxcWz9bXFwnXCJdJyAvLyBkZWZpbmUoWycuL2ZvbyddKSBvciBkZWZpbmUoJy4vZm9vJylcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnanMnLCAnanN4JywgJ3Z1ZScsICd0cycsICd0c3gnLCAnY29mZmVlJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXG4gICAgICBbJ1xcXFwuanN4PyQnLCAnJ10sXG4gICAgICBbJ1xcXFwudHMkJywgJyddLFxuICAgICAgWydcXFxcLmNvZmZlZSQnLCAnJ11cbiAgICBdXG4gIH0sXG4gIHtcbiAgICBzY29wZXM6IFsndGV4dC5odG1sLnZ1ZSddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAnQGltcG9ydFtcXFxcKHxcXFxccytdP1tcXCdcIl0nIC8vIEBpbXBvcnQgJ2Zvbycgb3IgQGltcG9ydCgnZm9vJylcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnY3NzJywgJ3Nhc3MnLCAnc2NzcycsICdsZXNzJywgJ3N0eWwnXSxcbiAgICByZWxhdGl2ZTogdHJ1ZSxcbiAgICByZXBsYWNlT25JbnNlcnQ6IFtcbiAgICAgIFsnKC8pP18oW14vXSo/KSQnLCAnJDEkMiddIC8vIGRpcjEvX2RpcjIvX2ZpbGUuc2FzcyA9PiBkaXIxL19kaXIyL2ZpbGUuc2Fzc1xuICAgIF1cbiAgfSxcbiAge1xuICAgIHNjb3BlczogWydzb3VyY2UuY29mZmVlJywgJ3NvdXJjZS5jb2ZmZWUuanN4J10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICdyZXF1aXJlXFxcXHMrW1xcJ1wiXScsIC8vIHJlcXVpcmUgJy4vZm9vJ1xuICAgICAgJ2RlZmluZVxcXFxzK1xcXFxbP1tcXCdcIl0nIC8vIGRlZmluZShbJy4vZm9vJ10pIG9yIGRlZmluZSgnLi9mb28nKVxuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydqcycsICdqc3gnLCAndHMnLCAndHN4JywgJ2NvZmZlZSddLFxuICAgIHJlbGF0aXZlOiB0cnVlLFxuICAgIHJlcGxhY2VPbkluc2VydDogW1xuICAgICAgWydcXFxcLmpzeD8kJywgJyddLFxuICAgICAgWydcXFxcLnRzJCcsICcnXSxcbiAgICAgIFsnXFxcXC5jb2ZmZWUkJywgJyddXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5waHAnXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ3JlcXVpcmVfb25jZVxcXFwoW1xcJ1wiXScsIC8vIHJlcXVpcmVfb25jZSgnZm9vLnBocCcpXG4gICAgICAnaW5jbHVkZVxcXFwoW1xcJ1wiXScgLy8gaW5jbHVkZSgnLi9mb28ucGhwJylcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsncGhwJ10sXG4gICAgcmVsYXRpdmU6IHRydWVcbiAgfSxcbiAge1xuICAgIHNjb3BlczogWydzb3VyY2Uuc2FzcycsICdzb3VyY2UuY3NzLnNjc3MnLCAnc291cmNlLmxlc3MnLCAnc291cmNlLnN0eWx1cyddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAnQGltcG9ydFtcXFxcKHxcXFxccytdP1tcXCdcIl0nIC8vIEBpbXBvcnQgJ2Zvbycgb3IgQGltcG9ydCgnZm9vJylcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnc2FzcycsICdzY3NzJywgJ2NzcyddLFxuICAgIHJlbGF0aXZlOiB0cnVlLFxuICAgIHJlcGxhY2VPbkluc2VydDogW1xuICAgICAgWycoLyk/XyhbXi9dKj8pJCcsICckMSQyJ10gLy8gZGlyMS9fZGlyMi9fZmlsZS5zYXNzID0+IGRpcjEvX2RpcjIvZmlsZS5zYXNzXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5jc3MnXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ0BpbXBvcnRcXFxccytbXFwnXCJdPycsIC8vIEBpbXBvcnQgJ2Zvby5jc3MnXG4gICAgICAnQGltcG9ydFxcXFxzK3VybFxcXFwoW1xcJ1wiXT8nIC8vIEBpbXBvcnQgdXJsKCdmb28uY3NzJylcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnY3NzJ10sXG4gICAgcmVsYXRpdmU6IHRydWVcbiAgfSxcbiAge1xuICAgIHNjb3BlczogWydzb3VyY2UuY3NzJywgJ3NvdXJjZS5zYXNzJywgJ3NvdXJjZS5sZXNzJywgJ3NvdXJjZS5jc3Muc2NzcycsICdzb3VyY2Uuc3R5bHVzJ10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICd1cmxcXFxcKFtcXCdcIl0/J1xuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydwbmcnLCAnZ2lmJywgJ2pwZWcnLCAnanBnJywgJ3dvZmYnLCAndHRmJywgJ3N2ZycsICdvdGYnXSxcbiAgICByZWxhdGl2ZTogdHJ1ZVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5jJywgJ3NvdXJjZS5jcHAnXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ15cXFxccyojaW5jbHVkZVxcXFxzK1tcXCdcIl0nXG4gICAgXSxcbiAgICBleHRlbnNpb25zOiBbJ2gnLCAnaHBwJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgaW5jbHVkZUN1cnJlbnREaXJlY3Rvcnk6IGZhbHNlXG4gIH0sXG4gIHtcbiAgICBzY29wZXM6IFsnc291cmNlLmx1YSddLFxuICAgIHByZWZpeGVzOiBbXG4gICAgICAncmVxdWlyZVtcXFxccyt8XFxcXChdW1xcJ1wiXSdcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsnbHVhJ10sXG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgaW5jbHVkZUN1cnJlbnREaXJlY3Rvcnk6IGZhbHNlLFxuICAgIHJlcGxhY2VPbkluc2VydDogW1xuICAgICAgWydcXFxcLycsICcuJ10sXG4gICAgICBbJ1xcXFxcXFxcJywgJy4nXSxcbiAgICAgIFsnXFxcXC5sdWEkJywgJyddXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5ydWJ5J10sXG4gICAgcHJlZml4ZXM6IFtcbiAgICAgICdeXFxcXHMqcmVxdWlyZVtcXFxccyt8XFxcXChdW1xcJ1wiXSdcbiAgICBdLFxuICAgIGV4dGVuc2lvbnM6IFsncmInXSxcbiAgICByZWxhdGl2ZTogdHJ1ZSxcbiAgICBpbmNsdWRlQ3VycmVudERpcmVjdG9yeTogZmFsc2UsXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXG4gICAgICBbJ1xcXFwucmIkJywgJyddXG4gICAgXVxuICB9LFxuICB7XG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5weXRob24nXSxcbiAgICBwcmVmaXhlczogW1xuICAgICAgJ15cXFxccypmcm9tXFxcXHMrJyxcbiAgICAgICdeXFxcXHMqaW1wb3J0XFxcXHMrJ1xuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogWydweSddLFxuICAgIHJlbGF0aXZlOiB0cnVlLFxuICAgIGluY2x1ZGVDdXJyZW50RGlyZWN0b3J5OiBmYWxzZSxcbiAgICByZXBsYWNlT25JbnNlcnQ6IFtcbiAgICAgIFsnXFxcXC8nLCAnLiddLFxuICAgICAgWydcXFxcXFxcXCcsICcuJ10sXG4gICAgICBbJ1xcXFwucHkkJywgJyddXG4gICAgXVxuICB9XG5dXG4iXX0=