"use strict";

angular.module('krewes').directive('kreweList', ["$window", "$timeout", "frankInterests",
	function($window, $timeout, frankInterests) {
		var kreweListDefinition = {
			restrict: "EA",
			templateUrl: "modules/krewes/views/krewe-list.client.view.html",
			scope: {
				parentIndex: "=index",
				krewe: "=",
				dndDropFunc: "&",
				dndInsertedFunc: "&",
				dndEffectAllowedArg: "=",
				dndMovedFunc: "&"
			},
			priority: 1,
			link: function($scope, elm, attrs, ctrl) {
				$scope.interestsSource = frankInterests.interests;
				
				elm.css("overflow-y", "auto");

				$scope.$watch("krewe", function() {
					console.log("Resizing...");
					resizeSelf(elm);
				}, true);

				var resizeSelf = function(elm) {
					$timeout(function(elm) {
						var kreweContainerSelector = ".krewe-container:nth-of-type(" + (parseInt($scope.parentIndex, 10) + 1) + ")";
						var containerHeight = angular.element(kreweContainerSelector).innerHeight();
						var nameHeight = angular.element(kreweContainerSelector + " h3.krewe-name").outerHeight(true);
						var kaptainHeight = angular.element(kreweContainerSelector + " ul.krewe-kaptain").outerHeight(true);

						console.log(containerHeight, nameHeight, kaptainHeight);

						var height = (containerHeight - nameHeight - kaptainHeight) + "px";
						angular.element(kreweContainerSelector + " ul.krewe-list").css("height", height);
						angular.element(kreweContainerSelector + " ul.krewe-list > .krewe-member-placeholder").css("height", height);
						angular.element(kreweContainerSelector + " ul.krewe-list > .krewe-member-placeholder").css("line-height", height);
					}, 10);
				};

				resizeSelf(elm);
			}
		};

		return kreweListDefinition;
	}
]);