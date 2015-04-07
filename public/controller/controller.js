angular.module('crime-stats.controller', [])

.controller('TimeController', function ($scope, $window) {
  $scope.crimes = [];
  console.log('in controller');

  $.get('/crime', function(data){
    // data.forEach(function(crime){
    //   $('body').append(crime + "<br>");
    // });
    console.log(data);
    $scope.crimes = data;
    $window.scope = $scope;
  });
});
