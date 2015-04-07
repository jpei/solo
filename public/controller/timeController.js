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
