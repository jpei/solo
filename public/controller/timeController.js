angular.module('crime-stats.timeController', [])

.controller('TimeController', function ($scope, $location) {
  $scope.crimes = [];
  $scope.time = $location.$$url.slice(1);
  $scope.capitalizeFirstLetter = function(str) {
    return str.charAt(0).toUpperCase()+str.slice(1);
  };

  $.get('/crime/'+$scope.time, function(data){
    // data.forEach(function(crime){
    //   $('body').append(crime + "<br>");
    // });
    $scope.crimes = data;
    $scope.$digest();
  });
});
