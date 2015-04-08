angular.module('crime-stats.timeController', [])

.controller('TimeController', ['$scope', '$http', '$location', 'TimeUnits', function ($scope, $http, $location, TimeUnits) {
  $scope.crimes = [];
  $scope.count = $scope.frequency = 0;
  $scope.timeUnit = $location.$$url.slice(1);
  $scope.type = {
    violent: 0,
    property: 0,
    'quality of life': 0,
    other: 0
  };
  $scope.dayOfWeek = [0,0,0,0,0,0,0];

  $scope.capitalizeFirstLetter = function(str) {
    return str.charAt(0).toUpperCase()+str.slice(1);
  };

  $http.get('/crime/'+$scope.timeUnit)
    .success(function(data) {
      console.log('ON SUCCESS');
      if (!Array.isArray(data)) {
        console.error('Data is not parseable');
        return;
      }
      var newCrimes = data;
      $scope.crimes = $scope.crimes.concat(newCrimes);
      $scope.count = $scope.crimes.length;
      $scope.frequency = ($scope.count / (TimeUnits[$scope.timeUnit]() / TimeUnits.day())).toString().slice(0,7);

      // Count crimes by type

      for (var i=0; i<newCrimes.length; i++) {
        switch(newCrimes[i][2].toLowerCase()) {
          case 'aggravated assault':
          case 'murder':
          case 'robbery':
          case 'simple assault':
            $scope.type.violent++;
            break;
          case 'disturbing the peace':
          case 'narcotics':
          case 'alcohol':
          case 'prostitution':
            $scope.type.property++;
            break;
          case 'theft':
          case 'vehicle theft':
          case 'vandalism':
          case 'burglary':
          case 'arson':
            $scope.type['quality of life']++;
            break;
          default:
            $scope.type.other++;
        }
      }

      // Count crimes by day of week
      if (TimeUnits[$scope.timeUnit]()>=TimeUnits.week()) {
        for (var i=0; i<newCrimes.length; i++) {
          $scope.dayOfWeek[new Date(newCrimes[i][0].split('T')[0]).getUTCDay()]++; // Slice off end to suppress time zones
        }
      }
    })
    .error(function(data, status) {
      console.error('Error, Status Code: ', status || 500);
    });
}])
.factory('TimeUnits', function () {
  var hour = function() {
    return 60*60*1000;
  };
  var day = function() {
    return 24*hour();
  };
  var week = function() {
    return 7*day();
  };
  var month = function() { // month and year in terms of weeks to better support crimes / day of week
    return 28*day();
  };
  var year = function() {
    return 364*day();
  };
  return {
    hour: hour,
    day: day,
    week: week,
    month: month,
    year: year
  };
})
.directive('loading', ['$http', function ($http) {
  return {
    restrict: 'A',
    link: function (scope, elm, attrs) {
      scope.isLoading = function () {
        return $http.pendingRequests.length > 0;
      };
      scope.$watch(scope.isLoading, function (v) {
        if(v) {
            elm.removeClass('hidden');
        } else {
            elm.addClass('hidden');
        }
      });
    }
  };
}]);
