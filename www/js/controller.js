// Controller that gets the services.
angular.module('wmtechtalks.controllers', ['wmtechtalks.services'])

.controller('AboutCtrl', function($scope, localStorageService) {
  console.log("Showing about...");
  if (localStorageService.get('config')) {
    $scope.config = localStorageService.get('config');
    console.log("Config about: ", $scope.config);
  }
  $scope.goToURL = function(url) {
    console.log("Redirecting to: ", url);
    var ref = window.open(encodeURI(url), '_system', 'location=yes');
  };
})

.controller('StartCtrl', function($scope, $state, localStorageService, $ionicPopup, Configuration) {
  console.log("Starting app...");

  $scope.login = {};

  if (localStorageService.get('config')) {
    $scope.config = localStorageService.get('config');
    console.log("Config: ", $scope.config);
    if ($scope.config.login) {
      $state.go('app.sessions', null, {reload: true});
    }
  } else {
    Configuration.get().$promise.then(function(result) {
        console.log("REST call successful");
        $scope.config = result;
        $scope.config.login = false;
        localStorageService.set('config', $scope.config);
        console.log("Config: ", $scope.config);
      }, function(error) {
        console.log("REST call error", error);
        $scope.showErrorNetwork();
      });
  }

  $scope.options = {
    loop: false,
    effect: 'slide',
    allowSwipeToPrev: false,
    speed: 500
  };
  $scope.data = {};
  $scope.$watch('data.slider', function(nv, ov) {
    $scope.slider = $scope.data.slider;
  });

  $scope.login = function() {
    console.log("Activation code: ", $scope.login.password);
    if ($scope.login.password === $scope.config.activation) {
      if (localStorageService.get('config')) {
        $scope.config = localStorageService.get('config');
        $scope.config.login = true;
        console.log("Config: ", $scope.config);
        localStorageService.set('config', $scope.config);
      }
      // Goto Sessions
      $state.go('app.sessions', null, {reload: true});
    } else {
      $scope.showErrorLogin();
    }
  };

  // An alert dialog
  $scope.showErrorLogin = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Tech Live: Access Code',
      template: '<div class="col text-center">Access code is invalid</div>'
    });

    alertPopup.then(function(res) {
      console.log('Thank you');
    });
  };
  $scope.showErrorNetwork = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Tech Live',
      template: '<div class="col text-center">Could not request data. Verify network access</div>'
    });

    alertPopup.then(function(res) {
      console.log('Thank you');
    });
  };
})

// Gets the list of sessions
.controller('SessionsCtrl', function($scope, localStorageService, Session, Configuration) {
  console.log("Showing sessions...");

  if (localStorageService.get('talkSessions')) {
    $scope.sessions = localStorageService.get('talkSessions');

    // Verify version
    Configuration.get().$promise.then(function(result) {
        var config = result;
        console.log("Config online: ", config);

        // Compare versions
        if (localStorageService.get('config')) {
          $scope.config = localStorageService.get('config');
          console.log("Config local: ", $scope.config);
          if ($scope.config.version < config.version) {
            console.log("New version found...");
            // Get data again
            Session.query().$promise.then(function(result) {
                $scope.sessions = result;
                localStorageService.set('talkSessions', $scope.sessions);
                // Save Configuration
                $scope.config.version = config.version;
                localStorageService.set('config', $scope.config);
                console.log("Saved config: ", $scope.config);
              }, function(error) {
                console.log("REST call error", error);
              });
          }
        }

      }, function(error) {
        console.log("REST call error", error);
      });

  } else {
    // GET: /sessions
    //$scope.sessions = Session.query();
    Session.query().$promise.then(function(result) {
        console.log("REST call successful");
        $scope.sessions = result;
        localStorageService.set('talkSessions', $scope.sessions);
      }, function(error) {
        console.log("REST call error", error);
      });
  }

  $scope.button = {};
  $scope.b1 = {};
  $scope.b2 = {};
  $scope.b1.clicked = true;

  $scope.click = function(button) {
    $scope.b1.clicked = false;
    $scope.b2.clicked = false;

    button.clicked = true;
    $scope.b1.clicked = true;
    $scope.b2.clicked = false;
  };

  $scope.isFavorite = function (session) {
    var talks = {};
    if (localStorageService.get('talkData')) {
      talks = localStorageService.get('talkData');
    } else {
      talks = [];
    }
    for (i = 0; i < talks.length; i++) {
      if (session.id == talks[i].id) {
        return true;
      }
    }
    return false;
  };
})

.controller('FavoritesCtrl', function($scope, localStorageService) {
  console.log("Showing favorites...");

  $scope.talks = [];
  $scope.talk = {};

  $scope.button = {};
  $scope.b1 = {};
  $scope.b2 = {};
  $scope.b2.clicked = true;

  $scope.click = function(button) {
    $scope.b1.clicked = false;
    $scope.b2.clicked = false;

    button.clicked = true;
  };

  // Fetches talks from local storage
  if (localStorageService.get('talkData')) {
    $scope.talks = localStorageService.get('talkData');
  } else {
    $scope.talks = [];
  }
  console.log("Favorites size: ", $scope.talks.length);

  $scope.talksIsEmpty = function() {
    if ($scope.talks.length == 0) {
      return true;
    } else {
      return false;
    }
  };

  $scope.removeTalk = function (index) {
    $scope.talks.splice(index, 1);
    localStorageService.set('talkData', $scope.talks);
  };

  $scope.isFavorite = function (session) {
    console.log("Is favorite: ", session);
    for (i = 0; i < $scope.talks.length; i++) {
      if (session.id == $scope.talks[i].id) {
        return true;
      }
    }
    return false;
  };
})

.controller('SessionDetailCtrl', function($scope, $stateParams, $cordovaCalendar, $cordovaLocalNotification, $ionicPopup, localStorageService, Session) {
  console.log("Showing session with id " + $stateParams.sessionId);

  var monthMap = {"January":0,"February":1,"March":2,"April":3,"May":4,"June":5,"July":6,"August":7,"September":8,"October":9,"November":10,"December":11};
  var dateNow = new Date();

  //$scope.session = Session.get({sessionId: $stateParams.sessionId});
  if (localStorageService.get('talkSessions')) {
    $scope.sessions = localStorageService.get('talkSessions');
    for (i = 0; i < $scope.sessions.length; i++) {
      if ($stateParams.sessionId == $scope.sessions[i].id) {
        $scope.session = $scope.sessions[i];
        break;
      }
    }
    if (typeof $scope.session === 'undefined') {
      console.log("Session ID not found: ", $stateParams.sessionId);
    } else {
      $scope.webexNum = $scope.session.webexNum.replace(/\s+/g, '');
    }
  } else {
    console.log("Session ID not found: ", $stateParams.sessionId);
  }

  if ($scope.session.gender === 'M') {
    $scope.avatarImg = 'img/avatar.png';
  } else if ($scope.session.gender === 'F') {
    $scope.avatarImg = 'img/avatar_f.png';
  }

  $scope.isFavorite = function (session) {
    var talks = {};
    if (localStorageService.get('talkData')) {
      talks = localStorageService.get('talkData');
    } else {
      talks = [];
    }
    for (i = 0; i < talks.length; i++) {
      if (session.id == talks[i].id) {
        return true;
      }
    }
    return false;
  };

  $scope.addTalk = function (talk) {
    console.log("Adding session to favorites: ", talk.id);
    var talks = {};
    if (localStorageService.get('talkData')) {
      talks = localStorageService.get('talkData');
    } else {
      talks = [];
    }
    talks.push(talk);
    localStorageService.set('talkData', talks);
    // Add to calendar
    document.addEventListener("deviceready", function () {
      $scope.addEvent(talk);
      $scope.showCalendarAlert();
      $scope.addNotification();
    });
  };

  // Calculate duration
  var startTime = $scope.session.starttime.substring(0, $scope.session.starttime.length-2);
  var startTimeMer = $scope.session.starttime.substring($scope.session.starttime.length-2, $scope.session.starttime.length);
  var endTime = $scope.session.endtime.substring(0, $scope.session.endtime.length-2);
  var endTimeMer = $scope.session.endtime.substring($scope.session.endtime.length-2, $scope.session.endtime.length);
  var numStartHour;
  var numEndHour;

  var startTimeHour = startTime.substring(0, startTime.indexOf(':'));
  var startTimeMin = startTime.substring(startTime.indexOf(':') + 1, startTime.length);
  var numStartMin = parseInt(startTimeMin);
  var endTimeHour = endTime.substring(0, endTime.indexOf(':'));
  var endTimeMin = endTime.substring(endTime.indexOf(':') + 1, endTime.length);
  var numEndMin = parseInt(endTimeMin);

  if (startTimeMer.toLocaleUpperCase() === 'PM') {
    numStartHour = parseInt(startTimeHour) + 12;
  } else {
    numStartHour = parseInt(startTimeHour);
  }
  if (endTimeMer.toLocaleUpperCase() === 'PM') {
    numEndHour = parseInt(endTimeHour) + 12;
  } else {
    numEndHour = parseInt(endTimeHour);
  }

  $scope.sessionStartHour = numStartHour;
  $scope.sessionEndHour = numEndHour;
  $scope.sessionStartMin = numStartMin;
  $scope.sessionEndMin = numEndMin;

  // Using a constant date (e.g. 2000-01-01)
  var date1 = new Date(2000, 0, 1, numStartHour, numStartMin); // 9:00 AM
  var date2 = new Date(2000, 0, 1, numEndHour, numEndMin); // 5:00 PM
  var diff = date2 - date1;
  $scope.duration = (diff / 1000) / 60;
  console.log("Duration: ", $scope.duration);

  // Verify to show rate
  var sessionEndDate = new Date(parseInt($scope.session.year), monthMap[$scope.session.month], parseInt($scope.session.day), numEndHour, numEndMin);
  var diffRateDate = dateNow - sessionEndDate;
  var sessionEndPassedTime = (diffRateDate / 1000) / 60;
  // Session can be rated 5 minutes after it ends
  console.log("Minutes passed since session end: ", sessionEndPassedTime);
  if (sessionEndPassedTime > 5) {
    // Verify if session was already rated
    var ratedTalks = {};
    if (localStorageService.get('ratedTalks')) {
      var isRated = false;
      ratedTalks = localStorageService.get('ratedTalks');
      console.log("Rated talks: ", ratedTalks);
      for (var i = 0; i < ratedTalks.length; i++) {
        if (ratedTalks[i] == $scope.session.id) {
          isRated = true;
          break;
        }
      }
      if (isRated) {
        $scope.rateIt = false;
      } else {
        $scope.rateIt = true;
      }
    } else {
      $scope.rateIt = true;
    }
  }

  $scope.goToURL = function(url) {
    console.log("Redirecting to: ", url);
    var ref = window.open(encodeURI(url), '_system', 'location=yes');
  };

  // Adds event to device calendar
  $scope.addEvent = function(session) {
    $cordovaCalendar.createEvent({
        title: session.title,
        notes: session.description,
        location: session.room,
        startDate: new Date(session.year, monthMap[session.month], session.day, $scope.sessionStartHour, $scope.sessionStartMin, 0, 0, 0),
        endDate: new Date(session.year, monthMap[session.month], session.day, $scope.sessionEndHour, $scope.sessionEndMin, 0, 0, 0)
    }).then(function (result) {
        console.log('success');console.dir(result);
        // This validation means that the user allowed the Calendar function
        if (result === 'OK') {
          $scope.addEvent(session);
          return;
        }
    }, function (err) {
        //$scope.showError("Error: " + err);
    });
  };

  // Adds event notification
  $scope.addNotification = function() {
    var alarmTime = sessionEndDate;
    alarmTime.setMinutes(alarmTime.getMinutes() + 6);
    if ($scope.rateIt) {
      $cordovaLocalNotification.add({
        id: $scope.session.id,
        date: alarmTime,
        //message: "Please send your feedback for: " + session.title,
        //message: "It would be great to have your feedback about: " + session.title,
        message: "Let us know your feedback:" + $scope.session.title,
        title: "Waltmart Tech Live",
        autoCancel: true,
        sound: null,
        data: { title: $scope.session.title }
      }).then(function () {
        console.log("Notification added...");
        //$cordovaLocalNotification.isScheduled($scope.session.id).then(function(isScheduled) {
        //  alert("Notification Scheduled: " + $scope.session.id + " " + isScheduled);
        //});
      });
    }
  };

  $scope.$on("$cordovaLocalNotification:added", function(id, state, json) {
    alert("Added a notification");
  });

  $scope.goBack = function () {
    window.history.back();
    //$window.location.reload(true);
    //$state.go('app.sessions', null, {reload: true});
  };

  $scope.showCalendarAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Tech Live',
      template: '<div class="col text-center">Event added to Calendar</div>'
    });

    alertPopup.then(function(res) {
      console.log('Thank you');
    });
  };
})

.controller('MapModalCtrl', function($scope, $ionicModal) {

  $scope.showMap = function () {
    console.log("Showing map...");
    $scope.openModal();
  };

  $ionicModal.fromTemplateUrl('templates/map_modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
    // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
})

.controller('RateModalCtrl', function($scope, $state, $ionicModal, $ionicPopup, localStorageService, Rate) {

  $scope.a1 = {}; $scope.a2 = {}; $scope.a3 = {}; $scope.a4 = {}; $scope.a5 = {};
  $scope.b1 = {}; $scope.b2 = {}; $scope.b3 = {}; $scope.b4 = {}; $scope.b5 = {};
  $scope.rate = {};
  $scope.b1Active = false;
  $scope.b2Active = false;
  $scope.sendActive = false;

  $scope.showRate = function (session) {
    console.log("Showing rate...");
    $scope.sesionId = session.id;
    $scope.openModal();
  };

  $ionicModal.fromTemplateUrl('templates/rate_modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
    // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
    $scope.rate.comments = '';
    $scope.a1.clicked = false;
    $scope.a2.clicked = false;
    $scope.a3.clicked = false;
    $scope.a4.clicked = false;
    $scope.a5.clicked = false;
    $scope.b1.clicked = false;
    $scope.b2.clicked = false;
    $scope.b3.clicked = false;
    $scope.b4.clicked = false;
    $scope.b5.clicked = false;
    $scope.b1Active = false;
    $scope.b2Active = false;
    $scope.sendActive = false;
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
    $scope.rate.comments = '';
    $scope.a1.clicked = false;
    $scope.a2.clicked = false;
    $scope.a3.clicked = false;
    $scope.a4.clicked = false;
    $scope.a5.clicked = false;
    $scope.b1.clicked = false;
    $scope.b2.clicked = false;
    $scope.b3.clicked = false;
    $scope.b4.clicked = false;
    $scope.b5.clicked = false;
    $scope.b1Active = false;
    $scope.b2Active = false;
    $scope.sendActive = false;
  });

  $scope.click1 = function(button) {
    $scope.a1.clicked = false;
    $scope.a2.clicked = false;
    $scope.a3.clicked = false;
    $scope.a4.clicked = false;
    $scope.a5.clicked = false;

    button.clicked = true;
    $scope.b1Active = true;
    if ($scope.b1Active && $scope.b2Active) {
      $scope.sendActive = true;
    }
  };

  $scope.click2 = function(button) {
    $scope.b1.clicked = false;
    $scope.b2.clicked = false;
    $scope.b3.clicked = false;
    $scope.b4.clicked = false;
    $scope.b5.clicked = false;

    button.clicked = true;
    $scope.b2Active = true;
    if ($scope.b1Active && $scope.b2Active) {
      $scope.sendActive = true;
    }
  };

  $scope.sendRate = function() {
    console.log("Receiving rate...");
    var rate1 = 0;
    var rate2 = 0;
    if ($scope.a1.clicked) {
      rate1 = $scope.a1.value;
    } else if ($scope.a2.clicked) {
      rate1 = $scope.a2.value;
    } else if ($scope.a3.clicked) {
      rate1 = $scope.a3.value;
    } else if ($scope.a4.clicked) {
      rate1 = $scope.a4.value;
    } else if ($scope.a5.clicked) {
      rate1 = $scope.a5.value;
    }
    console.log("Rate 1: ", rate1);
    if ($scope.b1.clicked) {
      rate2 = $scope.b1.value;
    } else if ($scope.b2.clicked) {
      rate2 = $scope.b2.value;
    } else if ($scope.b3.clicked) {
      rate2 = $scope.b3.value;
    } else if ($scope.b4.clicked) {
      rate2 = $scope.b4.value;
    } else if ($scope.b5.clicked) {
      rate2 = $scope.b5.value;
    }
    console.log("Rate 2: ", rate2);

    console.log("Comments: ", $scope.rate.comments);

    if (rate1 == 0 || rate2 == 0) {
      $scope.showAlert();
    } else {
      // Send POST
      Rate.save({talkId: $scope.sesionId, talkRate: rate1, speakerRate: rate2, comments: $scope.rate.comments}, function (response) {
        console.log("Rate result: ", response);
        // Save session as rated.
        var ratedTalks = [];
        if (localStorageService.get('ratedTalks')) {
          ratedTalks = localStorageService.get('ratedTalks');
        }
        ratedTalks.push($scope.sesionId);
        localStorageService.set('ratedTalks', ratedTalks);
        // Close modal
        $scope.closeModal();
        $scope.showRateSave();
        // Goto Session updated
        $state.go('app.session', null, {sessionId: $scope.sesionId, reload: true});
      }, function (err) {
        console.log("Rate error: ", err);
        $scope.showError();
      });
    }
  };

  // An alert dialog
  $scope.showAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Rate incomplete',
      template: '<div class="col text-center">Please rate the Talk and Speaker</div>'
    });

    alertPopup.then(function(res) {
      console.log('Thank you');
    });
  };

  // An alert dialog
  $scope.showRateSave = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Rate',
      template: '<div class="col text-center">Rate saved, thank you!</div>'
    });

    alertPopup.then(function(res) {
      console.log('Thank you');
    });
  };

  // An alert dialog
  $scope.showError = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Rate',
      template: '<div class="col text-center">We had some problems, please try later</div>'
    });

    alertPopup.then(function(res) {
      console.log('Thank you');
    });
  };
});
