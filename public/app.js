angular.module('crime-stats', ['crime-stats.controller', 'ui.router'])
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  $urlRouterProvider.otherwise('/week');

  $stateProvider
    .state('day', {
      url: '/day',
      templateUrl: 'views/day.html',
      controller: 'TimeController'
    })
    .state('week', {
      url: '/week',
      templateUrl: 'views/week.html',
      controller: 'TimeController'
    })
    .state('month', {
      url: '/month',
      templateUrl: 'views/month.html',
      controller: 'TimeController'
    })
    .state('year', {
      url: '/year',
      templateUrl: 'views/year.html',
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
