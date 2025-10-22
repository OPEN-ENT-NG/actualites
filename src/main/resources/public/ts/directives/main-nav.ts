import { angular, ng, ui } from "entcore";

export const mainNav = ng.directive("mainNav", function () {
  return {
    restrict: "A",
    link: function ($scope, $element) {
      var $elem = $element[0];
      var maxWidth = ui.breakpoints.tablette;
      if (!ui.breakpoints.checkMaxWidth(maxWidth)) {
        angular.element($elem).css({
          "position": "absolute",
          "max-height": "100vh",
          "overflow-y": "auto",
        });
      }
    },
  };
});
