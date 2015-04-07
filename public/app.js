angular.module('crime-stats', ['crime-stats.timeController', 'ui.router'])
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $urlRouterProvider.otherwise('/week');

  $stateProvider
    .state('day', {
      url: '/day',
      templateUrl: 'views/timeView.html',
      controller: 'TimeController'
    })
    .state('week', {
      url: '/week',
      templateUrl: 'views/timeView.html',
      controller: 'TimeController'
    })
    .state('month', {
      url: '/month',
      templateUrl: 'views/timeView.html',
      controller: 'TimeController'
    })
    .state('year', {
      url: '/year',
      templateUrl: 'views/timeView.html',
      controller: 'TimeController'
    });

  $httpProvider.interceptors.push('AttachTokens');
})
.factory('AttachTokens', function() {
  return {
    request: function (object) {
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
});
