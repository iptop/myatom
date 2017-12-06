Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _optionScopes = require('./option-scopes');

var _optionScopes2 = _interopRequireDefault(_optionScopes);

'use babel';

var options = {
  normalizeSlashes: {
    type: 'boolean',
    description: 'Replaces backward slashes with forward slashes on windows (if possible)',
    'default': true
  },
  maxFileCount: {
    type: 'number',
    description: 'The maximum amount of files to be handled',
    'default': 2000
  },
  suggestionPriority: {
    type: 'number',
    description: 'Suggestion priority of this provider. If set to a number larger than or equal to 1, suggestions will be displayed on top of default suggestions.',
    'default': 2
  },
  ignoredNames: {
    type: 'boolean',
    'default': true,
    description: 'Ignore items matched by the `Ignore Names` core option.'
  },
  ignoreSubmodules: {
    type: 'boolean',
    'default': false,
    description: 'Ignore submodule directories.'
  },
  ignoredPatterns: {
    type: 'array',
    'default': [],
    items: {
      type: 'string'
    },
    description: 'Ignore additional file path patterns.'
  },
  ignoreBuiltinScopes: {
    type: 'boolean',
    'default': false,
    description: 'Ignore built-in scopes and use only scopes from user configuration.'
  },
  scopes: {
    type: 'array',
    'default': [],
    items: {
      type: 'object',
      properties: {
        scopes: {
          type: ['array'],
          items: {
            type: 'string'
          }
        },
        prefixes: {
          type: ['array'],
          items: {
            type: 'string'
          }
        },
        extensions: {
          type: ['array'],
          items: {
            type: 'string'
          }
        },
        relative: {
          type: 'boolean',
          'default': true
        },
        replaceOnInsert: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: ['string', 'string']
            }
          }
        }
      }
    }
  }
};

for (var key in _optionScopes2['default']) {
  options[key] = {
    type: 'boolean',
    'default': false
  };
}

exports['default'] = options;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9jb25maWcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzRCQUV5QixpQkFBaUI7Ozs7QUFGMUMsV0FBVyxDQUFBOztBQUlYLElBQU0sT0FBTyxHQUFHO0FBQ2Qsa0JBQWdCLEVBQUU7QUFDaEIsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFXLEVBQUUseUVBQXlFO0FBQ3RGLGVBQVMsSUFBSTtHQUNkO0FBQ0QsY0FBWSxFQUFFO0FBQ1osUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFXLEVBQUUsMkNBQTJDO0FBQ3hELGVBQVMsSUFBSTtHQUNkO0FBQ0Qsb0JBQWtCLEVBQUU7QUFDbEIsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFXLEVBQUUsa0pBQWtKO0FBQy9KLGVBQVMsQ0FBQztHQUNYO0FBQ0QsY0FBWSxFQUFFO0FBQ1osUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLElBQUk7QUFDYixlQUFXLEVBQUUseURBQXlEO0dBQ3ZFO0FBQ0Qsa0JBQWdCLEVBQUU7QUFDaEIsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxlQUFXLEVBQUUsK0JBQStCO0dBQzdDO0FBQ0QsaUJBQWUsRUFBRTtBQUNmLFFBQUksRUFBRSxPQUFPO0FBQ2IsZUFBUyxFQUFFO0FBQ1gsU0FBSyxFQUFFO0FBQ0wsVUFBSSxFQUFFLFFBQVE7S0FDZjtBQUNELGVBQVcsRUFBRSx1Q0FBdUM7R0FDckQ7QUFDRCxxQkFBbUIsRUFBRTtBQUNuQixRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLGVBQVcsRUFBRSxxRUFBcUU7R0FDbkY7QUFDRCxRQUFNLEVBQUU7QUFDTixRQUFJLEVBQUUsT0FBTztBQUNiLGVBQVMsRUFBRTtBQUNYLFNBQUssRUFBRTtBQUNMLFVBQUksRUFBRSxRQUFRO0FBQ2QsZ0JBQVUsRUFBRTtBQUNWLGNBQU0sRUFBRTtBQUNOLGNBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNmLGVBQUssRUFBRTtBQUNMLGdCQUFJLEVBQUUsUUFBUTtXQUNmO1NBQ0Y7QUFDRCxnQkFBUSxFQUFFO0FBQ1IsY0FBSSxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQ2YsZUFBSyxFQUFFO0FBQ0wsZ0JBQUksRUFBRSxRQUFRO1dBQ2Y7U0FDRjtBQUNELGtCQUFVLEVBQUU7QUFDVixjQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDZixlQUFLLEVBQUU7QUFDTCxnQkFBSSxFQUFFLFFBQVE7V0FDZjtTQUNGO0FBQ0QsZ0JBQVEsRUFBRTtBQUNSLGNBQUksRUFBRSxTQUFTO0FBQ2YscUJBQVMsSUFBSTtTQUNkO0FBQ0QsdUJBQWUsRUFBRTtBQUNmLGNBQUksRUFBRSxPQUFPO0FBQ2IsZUFBSyxFQUFFO0FBQ0wsZ0JBQUksRUFBRSxPQUFPO0FBQ2IsaUJBQUssRUFBRTtBQUNMLGtCQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO2FBQzNCO1dBQ0Y7U0FDRjtPQUNGO0tBQ0Y7R0FDRjtDQUNGLENBQUE7O0FBRUQsS0FBSyxJQUFJLEdBQUcsK0JBQWtCO0FBQzVCLFNBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRztBQUNiLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0dBQ2YsQ0FBQTtDQUNGOztxQkFFYyxPQUFPIiwiZmlsZSI6ImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9jb25maWcvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xyXG5cclxuaW1wb3J0IE9wdGlvblNjb3BlcyBmcm9tICcuL29wdGlvbi1zY29wZXMnXHJcblxyXG5jb25zdCBvcHRpb25zID0ge1xyXG4gIG5vcm1hbGl6ZVNsYXNoZXM6IHtcclxuICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnUmVwbGFjZXMgYmFja3dhcmQgc2xhc2hlcyB3aXRoIGZvcndhcmQgc2xhc2hlcyBvbiB3aW5kb3dzIChpZiBwb3NzaWJsZSknLFxyXG4gICAgZGVmYXVsdDogdHJ1ZVxyXG4gIH0sXHJcbiAgbWF4RmlsZUNvdW50OiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIG1heGltdW0gYW1vdW50IG9mIGZpbGVzIHRvIGJlIGhhbmRsZWQnLFxyXG4gICAgZGVmYXVsdDogMjAwMFxyXG4gIH0sXHJcbiAgc3VnZ2VzdGlvblByaW9yaXR5OiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnU3VnZ2VzdGlvbiBwcmlvcml0eSBvZiB0aGlzIHByb3ZpZGVyLiBJZiBzZXQgdG8gYSBudW1iZXIgbGFyZ2VyIHRoYW4gb3IgZXF1YWwgdG8gMSwgc3VnZ2VzdGlvbnMgd2lsbCBiZSBkaXNwbGF5ZWQgb24gdG9wIG9mIGRlZmF1bHQgc3VnZ2VzdGlvbnMuJyxcclxuICAgIGRlZmF1bHQ6IDJcclxuICB9LFxyXG4gIGlnbm9yZWROYW1lczoge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgIGRlc2NyaXB0aW9uOiAnSWdub3JlIGl0ZW1zIG1hdGNoZWQgYnkgdGhlIGBJZ25vcmUgTmFtZXNgIGNvcmUgb3B0aW9uLidcclxuICB9LFxyXG4gIGlnbm9yZVN1Ym1vZHVsZXM6IHtcclxuICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgZGVzY3JpcHRpb246ICdJZ25vcmUgc3VibW9kdWxlIGRpcmVjdG9yaWVzLidcclxuICB9LFxyXG4gIGlnbm9yZWRQYXR0ZXJuczoge1xyXG4gICAgdHlwZTogJ2FycmF5JyxcclxuICAgIGRlZmF1bHQ6IFtdLFxyXG4gICAgaXRlbXM6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgIH0sXHJcbiAgICBkZXNjcmlwdGlvbjogJ0lnbm9yZSBhZGRpdGlvbmFsIGZpbGUgcGF0aCBwYXR0ZXJucy4nXHJcbiAgfSxcclxuICBpZ25vcmVCdWlsdGluU2NvcGVzOiB7XHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgIGRlc2NyaXB0aW9uOiAnSWdub3JlIGJ1aWx0LWluIHNjb3BlcyBhbmQgdXNlIG9ubHkgc2NvcGVzIGZyb20gdXNlciBjb25maWd1cmF0aW9uLidcclxuICB9LFxyXG4gIHNjb3Blczoge1xyXG4gICAgdHlwZTogJ2FycmF5JyxcclxuICAgIGRlZmF1bHQ6IFtdLFxyXG4gICAgaXRlbXM6IHtcclxuICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBzY29wZXM6IHtcclxuICAgICAgICAgIHR5cGU6IFsnYXJyYXknXSxcclxuICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmVmaXhlczoge1xyXG4gICAgICAgICAgdHlwZTogWydhcnJheSddLFxyXG4gICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IHtcclxuICAgICAgICAgIHR5cGU6IFsnYXJyYXknXSxcclxuICAgICAgICAgIGl0ZW1zOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWxhdGl2ZToge1xyXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwbGFjZU9uSW5zZXJ0OiB7XHJcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcclxuICAgICAgICAgICAgaXRlbXM6IHtcclxuICAgICAgICAgICAgICB0eXBlOiBbJ3N0cmluZycsICdzdHJpbmcnXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mb3IgKGxldCBrZXkgaW4gT3B0aW9uU2NvcGVzKSB7XHJcbiAgb3B0aW9uc1trZXldID0ge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdDogZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IG9wdGlvbnNcclxuIl19