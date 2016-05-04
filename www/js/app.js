// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('wmtechtalks', ['ionic', 'ngCordova', 'LocalStorageModule', 'wmtechtalks.controllers', 'wmtechtalks.directives'])

.run(function($ionicPlatform, $cordovaSplashscreen, $state, $timeout, $location) {

  $ionicPlatform.ready(function() {

    $timeout(function() {
      try {
        $cordovaSplashscreen.hide();
      } catch (err) {
        console.log("Error: ", err);
      }
    }, 0);

    if(device.platform === "iOS") {
      window.plugin.notification.local.promptForPermission();
    }

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    window.plugin.notification.local.onadd = function (id, state, json) {
      var notification = {
        id: id,
        state: state,
        json: json
      };
      $timeout(function() {
        $rootScope.$broadcast("$cordovaLocalNotification:added", notification);
      });
    };

    cordova.plugins.notification.local.on("click", function(notification) {
      var data = JSON.parse(notification.data);
      //alert("Pending talk rate: " + data.title);
      // Goto Session
      //$state.go('app.session', {sessionId: notification.id});
      $location.path('/app/sessions/' + notification.id);
    });

  });

  // Disable BACK button on sessions
  $ionicPlatform.registerBackButtonAction(function (event) {
    if ($state.current.name === "app.sessions") {
      navigator.app.exitApp();
    } else {
      navigator.app.backHistory();
    }
  }, 100);

})

.config(function($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

  localStorageServiceProvider.setPrefix('tech-talks');

  $stateProvider
    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
    .state('start', {
      url: "/start",
      templateUrl: "templates/start.html",
      controller: 'StartCtrl'
    })
    .state('app.about', {
      url: "/about",
      views: {
        'app-about': {
          templateUrl: "templates/about.html",
          controller: 'AboutCtrl'
        }
      }
    })
    .state('app.sessions', {
      url: "/sessions",
      views: {
        'app-sessions': {
          templateUrl: "templates/sessions.html",
          controller: 'SessionsCtrl'
        }
      }
    })
    .state('app.favorites', {
      url: "/favorites",
      views: {
        'app-sessions': {
          templateUrl: "templates/favorites.html",
          controller: 'FavoritesCtrl'
        }
      }
    })
    .state('app.session', {
      url: "/sessions/:sessionId",
      views: {
        '@': {
          templateUrl: "templates/session.html",
          controller: 'SessionDetailCtrl'
        }
      }
    });

  $urlRouterProvider.otherwise('/start');
});
