// Services for the event app.
angular.module('wmtechtalks.services', ['ngResource'])

.factory('Configuration', function ($resource) {
    return $resource('http://wmtechtalks-wmnode.rhcloud.com/configuration');
})

.factory('Session', function ($resource) {
    return $resource('http://wmtechtalks-wmnode.rhcloud.com/sessions/:sessionId');
})

.factory('Rate', function ($resource) {
    return $resource('http://wmtechtalks-wmnode.rhcloud.com/rate');
});
