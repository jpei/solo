angular.module('crime-stats.timeController', [])

.controller('TimeController', function ($scope, $http, $location, TimeUnits) {
  $scope.crimes = [];
  $scope.count = $scope.frequency = 0;
  $scope.timeUnit = $location.$$url.slice(1);
  $scope.capitalizeFirstLetter = function(str) {
    return str.charAt(0).toUpperCase()+str.slice(1);
  };

  $http.get('/crime/'+$scope.timeUnit)
    .success(function(data) {
      $scope.crimes = data;
      $scope.count = $scope.crimes.length;
      $scope.frequency = ($scope.count / (TimeUnits[$scope.timeUnit]() / TimeUnits.day())).toString().slice(0,7);
      $scope.type = {
        violent: 0,
        property: 0,
        'quality of life': 0,
        other: 0
      };
      for (var i=0; i<$scope.crimes.length; i++) {
        switch($scope.crimes[i][2].toLowerCase()) {
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
    })
    .error(function(data, status) {
      console.error('Error, Status Code: ', status);
    });
})
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
  var month = function() {
    return 30*day();
  };
  var year = function() {
    return 365*day();
  };
  return {
    hour: hour,
    day: day,
    week: week,
    month: month,
    year: year
  };
})
.directive('loading', function ($http) {
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
});
