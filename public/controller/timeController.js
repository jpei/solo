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
      $scope.isLoading = false;
      $scope.digest();
    }
    // In konqueror http.responseText is sometimes null here...
    if (http.responseText === null)
      return;

    var unparsed = http.responseText.slice(prevDataLength);
    var findBreak = unparsed.indexOf(']]');
    while (findBreak >= 0) { // Check for end of data "packet"
      AnalyzeCrimes.analyzeAll(JSON.parse(unparsed.slice(0, findBreak+2)), $scope, TimeUnits);
      prevDataLength += findBreak+2;
      unparsed = unparsed.slice(findBreak+2);
      findBreak = unparsed.indexOf(']]');
    }

    if (http.readyState === 4) {
      clearInterval(pollTimer);
      $scope.isLoading = false;
      $scope.digest();
    }
  };

  var http = createXMLHttpRequest();
  http.open('GET', '/crime/'+$scope.timeUnit, true);
  http.onreadystatechange = handleResponse;
  http.send();
  var pollTimer = setInterval(handleResponse, 1000);
  $scope.isLoading = true;
  var prevDataLength = 0;
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
    console.log(JSON.stringify(data));
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
    } else {
      $scope.dayOfWeek = null;
    }
    $scope.$apply();
  };
  return { analyzeAll : analyzeAll };
})
