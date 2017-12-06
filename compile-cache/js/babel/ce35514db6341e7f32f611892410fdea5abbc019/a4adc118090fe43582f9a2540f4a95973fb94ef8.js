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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9jb25maWcvZGVmYXVsdC1zY29wZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7OztxQkFFSSxDQUNiO0FBQ0UsUUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQztBQUN2RyxVQUFRLEVBQUUsQ0FDUiw0QkFBNEI7QUFDNUIsbUJBQWlCO0FBQ2pCLG1CQUFpQjtBQUNqQixzQkFBb0I7R0FDckI7QUFDRCxZQUFVLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQztBQUN4RCxVQUFRLEVBQUUsSUFBSTtBQUNkLGlCQUFlLEVBQUUsQ0FDZixDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxFQUM5QixDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxFQUM1QixDQUFDLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxDQUNqQztDQUNGLEVBQ0Q7QUFDRSxRQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUM7QUFDekIsVUFBUSxFQUFFLENBQ1IsNEJBQTRCO0FBQzVCLG1CQUFpQjtBQUNqQixtQkFBaUI7QUFDakIsc0JBQW9CO0dBQ3JCO0FBQ0QsWUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7QUFDdkQsVUFBUSxFQUFFLElBQUk7QUFDZCxpQkFBZSxFQUFFLENBQ2YsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLEVBQ2hCLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUNkLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUNuQjtDQUNGLEVBQ0Q7QUFDRSxRQUFNLEVBQUUsQ0FBQyxl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RSxLQUFLO0FBQzlCLGlCQUFlLEVBQUUsQ0FDZixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FDZjtDQUNGLEVBQ0Q7QUFDRSxRQUFNLEVBQUUsQ0FBQyxlQUFlLENBQUM7QUFDekIsVUFBUSxFQUFFLENBQ1IsZUFBZSxFQUNmLGlCQUFpQixDQUNsQjtBQUNELFlBQVUsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNsQixVQUFRLEVBQUUsSUFBSTtBQUNkLHlCQUF1QixFQUFFLEtBQUs7QUFDOUIsaUJBQWUsRUFBRSxDQUNmLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUNaLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUNiLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUNmO0NBQ0YsQ0FDRiIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL3N0YXJ0Ly5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wYXRocy9saWIvY29uZmlnL2RlZmF1bHQtc2NvcGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICB7XHJcbiAgICBzY29wZXM6IFsnc291cmNlLmpzJywgJ3NvdXJjZS5qcy5qc3gnLCAnc291cmNlLmNvZmZlZScsICdzb3VyY2UuY29mZmVlLmpzeCcsICdzb3VyY2UudHMnLCAnc291cmNlLnRzeCddLFxyXG4gICAgcHJlZml4ZXM6IFtcclxuICAgICAgJ2ltcG9ydFxcXFxzKy4qP2Zyb21cXFxccytbXFwnXCJdJywgLy8gaW1wb3J0IGZvbyBmcm9tICcuL2ZvbydcclxuICAgICAgJ2ltcG9ydFxcXFxzK1tcXCdcIl0nLCAvLyBpbXBvcnQgJy4vZm9vJ1xyXG4gICAgICAncmVxdWlyZVxcXFwoW1xcJ1wiXScsIC8vIHJlcXVpcmUoJy4vZm9vJylcclxuICAgICAgJ2RlZmluZVxcXFwoXFxcXFs/W1xcJ1wiXScgLy8gZGVmaW5lKFsnLi9mb28nXSkgb3IgZGVmaW5lKCcuL2ZvbycpXHJcbiAgICBdLFxyXG4gICAgZXh0ZW5zaW9uczogWydqcycsICdqc3gnLCAndHMnLCAndHN4JywgJ2NvZmZlZScsICdqc29uJ10sXHJcbiAgICByZWxhdGl2ZTogdHJ1ZSxcclxuICAgIHJlcGxhY2VPbkluc2VydDogW1xyXG4gICAgICBbJyhbXFxcXC9dP2luZGV4KT9cXFxcLmpzeD8kJywgJyddLFxyXG4gICAgICBbJyhbXFxcXC9dP2luZGV4KT9cXFxcLnRzJCcsICcnXSxcclxuICAgICAgWycoW1xcXFwvXT9pbmRleCk/XFxcXC5jb2ZmZWUkJywgJyddXHJcbiAgICBdXHJcbiAgfSxcclxuICB7XHJcbiAgICBzY29wZXM6IFsndGV4dC5odG1sLnZ1ZSddLFxyXG4gICAgcHJlZml4ZXM6IFtcclxuICAgICAgJ2ltcG9ydFxcXFxzKy4qP2Zyb21cXFxccytbXFwnXCJdJywgLy8gaW1wb3J0IGZvbyBmcm9tICcuL2ZvbydcclxuICAgICAgJ2ltcG9ydFxcXFxzK1tcXCdcIl0nLCAvLyBpbXBvcnQgJy4vZm9vJ1xyXG4gICAgICAncmVxdWlyZVxcXFwoW1xcJ1wiXScsIC8vIHJlcXVpcmUoJy4vZm9vJylcclxuICAgICAgJ2RlZmluZVxcXFwoXFxcXFs/W1xcJ1wiXScgLy8gZGVmaW5lKFsnLi9mb28nXSkgb3IgZGVmaW5lKCcuL2ZvbycpXHJcbiAgICBdLFxyXG4gICAgZXh0ZW5zaW9uczogWydqcycsICdqc3gnLCAndnVlJywgJ3RzJywgJ3RzeCcsICdjb2ZmZWUnXSxcclxuICAgIHJlbGF0aXZlOiB0cnVlLFxyXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXHJcbiAgICAgIFsnXFxcXC5qc3g/JCcsICcnXSxcclxuICAgICAgWydcXFxcLnRzJCcsICcnXSxcclxuICAgICAgWydcXFxcLmNvZmZlZSQnLCAnJ11cclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIHNjb3BlczogWyd0ZXh0Lmh0bWwudnVlJ10sXHJcbiAgICBwcmVmaXhlczogW1xyXG4gICAgICAnQGltcG9ydFtcXFxcKHxcXFxccytdP1tcXCdcIl0nIC8vIEBpbXBvcnQgJ2Zvbycgb3IgQGltcG9ydCgnZm9vJylcclxuICAgIF0sXHJcbiAgICBleHRlbnNpb25zOiBbJ2NzcycsICdzYXNzJywgJ3Njc3MnLCAnbGVzcycsICdzdHlsJ10sXHJcbiAgICByZWxhdGl2ZTogdHJ1ZSxcclxuICAgIHJlcGxhY2VPbkluc2VydDogW1xyXG4gICAgICBbJygvKT9fKFteL10qPykkJywgJyQxJDInXSAvLyBkaXIxL19kaXIyL19maWxlLnNhc3MgPT4gZGlyMS9fZGlyMi9maWxlLnNhc3NcclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIHNjb3BlczogWydzb3VyY2UuY29mZmVlJywgJ3NvdXJjZS5jb2ZmZWUuanN4J10sXHJcbiAgICBwcmVmaXhlczogW1xyXG4gICAgICAncmVxdWlyZVxcXFxzK1tcXCdcIl0nLCAvLyByZXF1aXJlICcuL2ZvbydcclxuICAgICAgJ2RlZmluZVxcXFxzK1xcXFxbP1tcXCdcIl0nIC8vIGRlZmluZShbJy4vZm9vJ10pIG9yIGRlZmluZSgnLi9mb28nKVxyXG4gICAgXSxcclxuICAgIGV4dGVuc2lvbnM6IFsnanMnLCAnanN4JywgJ3RzJywgJ3RzeCcsICdjb2ZmZWUnXSxcclxuICAgIHJlbGF0aXZlOiB0cnVlLFxyXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXHJcbiAgICAgIFsnXFxcXC5qc3g/JCcsICcnXSxcclxuICAgICAgWydcXFxcLnRzJCcsICcnXSxcclxuICAgICAgWydcXFxcLmNvZmZlZSQnLCAnJ11cclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIHNjb3BlczogWydzb3VyY2UucGhwJ10sXHJcbiAgICBwcmVmaXhlczogW1xyXG4gICAgICAncmVxdWlyZV9vbmNlXFxcXChbXFwnXCJdJywgLy8gcmVxdWlyZV9vbmNlKCdmb28ucGhwJylcclxuICAgICAgJ2luY2x1ZGVcXFxcKFtcXCdcIl0nIC8vIGluY2x1ZGUoJy4vZm9vLnBocCcpXHJcbiAgICBdLFxyXG4gICAgZXh0ZW5zaW9uczogWydwaHAnXSxcclxuICAgIHJlbGF0aXZlOiB0cnVlXHJcbiAgfSxcclxuICB7XHJcbiAgICBzY29wZXM6IFsnc291cmNlLnNhc3MnLCAnc291cmNlLmNzcy5zY3NzJywgJ3NvdXJjZS5sZXNzJywgJ3NvdXJjZS5zdHlsdXMnXSxcclxuICAgIHByZWZpeGVzOiBbXHJcbiAgICAgICdAaW1wb3J0W1xcXFwofFxcXFxzK10/W1xcJ1wiXScgLy8gQGltcG9ydCAnZm9vJyBvciBAaW1wb3J0KCdmb28nKVxyXG4gICAgXSxcclxuICAgIGV4dGVuc2lvbnM6IFsnc2FzcycsICdzY3NzJywgJ2NzcyddLFxyXG4gICAgcmVsYXRpdmU6IHRydWUsXHJcbiAgICByZXBsYWNlT25JbnNlcnQ6IFtcclxuICAgICAgWycoLyk/XyhbXi9dKj8pJCcsICckMSQyJ10gLy8gZGlyMS9fZGlyMi9fZmlsZS5zYXNzID0+IGRpcjEvX2RpcjIvZmlsZS5zYXNzXHJcbiAgICBdXHJcbiAgfSxcclxuICB7XHJcbiAgICBzY29wZXM6IFsnc291cmNlLmNzcyddLFxyXG4gICAgcHJlZml4ZXM6IFtcclxuICAgICAgJ0BpbXBvcnRcXFxccytbXFwnXCJdPycsIC8vIEBpbXBvcnQgJ2Zvby5jc3MnXHJcbiAgICAgICdAaW1wb3J0XFxcXHMrdXJsXFxcXChbXFwnXCJdPycgLy8gQGltcG9ydCB1cmwoJ2Zvby5jc3MnKVxyXG4gICAgXSxcclxuICAgIGV4dGVuc2lvbnM6IFsnY3NzJ10sXHJcbiAgICByZWxhdGl2ZTogdHJ1ZVxyXG4gIH0sXHJcbiAge1xyXG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5jc3MnLCAnc291cmNlLnNhc3MnLCAnc291cmNlLmxlc3MnLCAnc291cmNlLmNzcy5zY3NzJywgJ3NvdXJjZS5zdHlsdXMnXSxcclxuICAgIHByZWZpeGVzOiBbXHJcbiAgICAgICd1cmxcXFxcKFtcXCdcIl0/J1xyXG4gICAgXSxcclxuICAgIGV4dGVuc2lvbnM6IFsncG5nJywgJ2dpZicsICdqcGVnJywgJ2pwZycsICd3b2ZmJywgJ3R0ZicsICdzdmcnLCAnb3RmJ10sXHJcbiAgICByZWxhdGl2ZTogdHJ1ZVxyXG4gIH0sXHJcbiAge1xyXG4gICAgc2NvcGVzOiBbJ3NvdXJjZS5jJywgJ3NvdXJjZS5jcHAnXSxcclxuICAgIHByZWZpeGVzOiBbXHJcbiAgICAgICdeXFxcXHMqI2luY2x1ZGVcXFxccytbXFwnXCJdJ1xyXG4gICAgXSxcclxuICAgIGV4dGVuc2lvbnM6IFsnaCcsICdocHAnXSxcclxuICAgIHJlbGF0aXZlOiB0cnVlLFxyXG4gICAgaW5jbHVkZUN1cnJlbnREaXJlY3Rvcnk6IGZhbHNlXHJcbiAgfSxcclxuICB7XHJcbiAgICBzY29wZXM6IFsnc291cmNlLmx1YSddLFxyXG4gICAgcHJlZml4ZXM6IFtcclxuICAgICAgJ3JlcXVpcmVbXFxcXHMrfFxcXFwoXVtcXCdcIl0nXHJcbiAgICBdLFxyXG4gICAgZXh0ZW5zaW9uczogWydsdWEnXSxcclxuICAgIHJlbGF0aXZlOiB0cnVlLFxyXG4gICAgaW5jbHVkZUN1cnJlbnREaXJlY3Rvcnk6IGZhbHNlLFxyXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXHJcbiAgICAgIFsnXFxcXC8nLCAnLiddLFxyXG4gICAgICBbJ1xcXFxcXFxcJywgJy4nXSxcclxuICAgICAgWydcXFxcLmx1YSQnLCAnJ11cclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIHNjb3BlczogWydzb3VyY2UucnVieSddLFxyXG4gICAgcHJlZml4ZXM6IFtcclxuICAgICAgJ15cXFxccypyZXF1aXJlW1xcXFxzK3xcXFxcKF1bXFwnXCJdJ1xyXG4gICAgXSxcclxuICAgIGV4dGVuc2lvbnM6IFsncmInXSxcclxuICAgIHJlbGF0aXZlOiB0cnVlLFxyXG4gICAgaW5jbHVkZUN1cnJlbnREaXJlY3Rvcnk6IGZhbHNlLFxyXG4gICAgcmVwbGFjZU9uSW5zZXJ0OiBbXHJcbiAgICAgIFsnXFxcXC5yYiQnLCAnJ11cclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIHNjb3BlczogWydzb3VyY2UucHl0aG9uJ10sXHJcbiAgICBwcmVmaXhlczogW1xyXG4gICAgICAnXlxcXFxzKmZyb21cXFxccysnLFxyXG4gICAgICAnXlxcXFxzKmltcG9ydFxcXFxzKydcclxuICAgIF0sXHJcbiAgICBleHRlbnNpb25zOiBbJ3B5J10sXHJcbiAgICByZWxhdGl2ZTogdHJ1ZSxcclxuICAgIGluY2x1ZGVDdXJyZW50RGlyZWN0b3J5OiBmYWxzZSxcclxuICAgIHJlcGxhY2VPbkluc2VydDogW1xyXG4gICAgICBbJ1xcXFwvJywgJy4nXSxcclxuICAgICAgWydcXFxcXFxcXCcsICcuJ10sXHJcbiAgICAgIFsnXFxcXC5weSQnLCAnJ11cclxuICAgIF1cclxuICB9XHJcbl1cclxuIl19