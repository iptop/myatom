Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.execPromise = execPromise;

var _child_process = require('child_process');

'use babel';

function execPromise(cmd, options) {
  return new Promise(function (resolve, reject) {
    (0, _child_process.exec)(cmd, options, function (err, stdout, stderr) {
      if (err) {
        return reject(err);
      }
      resolve(stdout);
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs2QkFFcUIsZUFBZTs7QUFGcEMsV0FBVyxDQUFBOztBQUlKLFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDeEMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsNkJBQUssR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFLO0FBQzFDLFVBQUksR0FBRyxFQUFFO0FBQ1AsZUFBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDcEI7QUFDRCxhQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakIsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL3V0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcclxuXHJcbmltcG9ydCB7IGV4ZWMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNQcm9taXNlKGNtZCwgb3B0aW9ucykge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBleGVjKGNtZCwgb3B0aW9ucywgKGVyciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcclxuICAgICAgaWYgKGVycikge1xyXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcclxuICAgICAgfVxyXG4gICAgICByZXNvbHZlKHN0ZG91dCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG4iXX0=