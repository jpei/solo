angular.module('crime-stats.timeController', [])

.controller('TimeController', ['$scope', '$http', '$location', '$window', 'TimeUnits', 'AnalyzeCrimes', function ($scope, $http, $location, $window, TimeUnits, AnalyzeCrimes) {
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

  var createXMLHttpRequest = function() {
    try { return new $window.XMLHttpRequest();                   } catch(e) {}
    try { return new $window.ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
    try { return new $window.ActiveXObject("Msxml2.XMLHTTP");    } catch(e) {}
    $window.alert("XMLHttpRequest not supported");
    return null;
  };

  var handleResponse = function() {
    if (http.readyState !== 4 && http.readyState !== 3)
      return;
    if (http.readyState === 3 && http.status !== 200)
      return;
    if (http.readyState === 4 && http.status !== 200) {
      clearInterval(pollTimer);
      inProgress = false;
    }
    // In konqueror http.responseText is sometimes null here...
    if (http.responseText === null)
      return;

    // while (prevDataLength !== http.responseText.length) {
    //   if (http.readyState === 4  && prevDataLength === http.responseText.length)
    //     break;
    //   prevDataLength = http.responseText.length;
    //   var response = http.responseText.substring(nextLine);
    //   var lines = response.split('\n');
    //   nextLine = nextLine + response.lastIndexOf('\n') + 1;
    //   if (response[response.length-1] !== '\n')
    //     lines.pop();

    //   for (var i = 0; i < lines.length; i++) {
    //       // ...
    //   }
    // }
    console.log(http.responseText.length);
    // http.responseText = '';

    if (http.readyState === 4 && prevDataLength === http.responseText.length)
      clearInterval(pollTimer);

    inProgress = false;
  };

  var http = createXMLHttpRequest();
  http.open('GET', '/crime/'+$scope.timeUnit, true);
  http.onreadystatechange = handleResponse;
  http.send();
  var pollTimer = setInterval(handleResponse, 1000);
  var inProgress = true;

  // $http.get('/crime/'+$scope.timeUnit)
  //   .success(function(data) {
  //     console.log('ON SUCCESS');
  //     if (!Array.isArray(data)) {
  //       console.error('Data is not parseable');
  //       return;
  //     }
  //     AnalyzeCrimes.analyzeAll(data, $scope, TimeUnits);
  //   })
  //   .error(function(data, status) {
  //     console.error('Error, Status Code: ', status || 500);
  //   });
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
.factory('AnalyzeCrimes', function() {
  var analyzeAll = function(data, $scope, TimeUnits) {
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
      for (var j=0; j<newCrimes.length; j++) {
        $scope.dayOfWeek[new Date(newCrimes[j][0].split('T')[0]).getUTCDay()]++; // Slice off end to suppress time zones
      }
    }
  };
  return { analyzeAll : analyzeAll };
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
