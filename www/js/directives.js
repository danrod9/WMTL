angular.module('wmtechtalks.directives', [])

.directive('fallBackSrc', function () {
  return {
    link: function postLink(scope, element, attrs) {
      console.log("Img resource: ", attrs.ngSrc);
      if (typeof attrs.ngSrc !== 'undefined' && attrs.ngSrc.length > 0) {
        element.bind('error', function () {
          angular.element(this).attr("src", attrs.fallBackSrc);
        });
      } else {
        console.log("Loading default image...");
        var img = new Image();
        img.src = attrs.fallBackSrc;
        angular.element(img).bind('load', function () {
          element.attr("src", attrs.fallBackSrc);
        });
      }
    }
  }
});
