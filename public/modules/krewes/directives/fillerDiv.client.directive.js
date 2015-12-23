"use strict";

angular.module('krewes').directive('fillerDiv', ["$window",
	function($window) {
		var fillerDivDefinition = {
			restrict: "EA",
			transclude: true,
			template: '<div class="fullSizeDiv" ng-transclude></div>',
			scope: {
				marginTop: "=?",
				marginBottom: "=?",
				paddingTop: "=?",
				paddingBottom: "=?"
			},
			link: function($scope, elm, attrs, ctrl) {
				elm.css("overflow-y", "auto");

				$scope.$watch(
					function() {
						return attrs;
					}, function() {
						setAttributes(elm, attrs);
						resizeSelf($scope, elm, attrs, ctrl);
					}
				);

				angular.element($window).on('resize', function() {
					resizeSelf($scope, elm, attrs, ctrl);
				});

				var resizeSelf = function(scope, elm, attrs, ctrl) {
					var jumbotron = angular.element("div.jumbotron.text-center");
					var jumbotronOffset = jumbotron.offset();
					var jumbotronOuterHeight = parseInt(jumbotron.outerHeight(true), 10);

					var footer = angular.element("footer div.musicdiv.well");
					var footerOffset = footer.offset();

					var margin = {};
					var padding = {};

					if(attrs.marginTop) {
						margin.top = parseInt(attrs.marginTop, 10);
					} else {
						margin.top = 0;
					}

					if(attrs.marginBottom) {
						margin.bottom = parseInt(attrs.marginBottom, 10);
					} else {
						margin.bottom = 0;
					}

					if(attrs.paddingTop) {
						padding.top = parseInt(attrs.paddingTop);
					} else {
						padding.top = 0;
					}

					if(attrs.paddingBottom) {
						padding.bottom = parseInt(attrs.paddingBottom);
					} else {
						padding.bottom = 0;
					}

					var footerTop = footerOffset.top - margin.bottom - padding.bottom;
					var jumbotronBottom = jumbotronOffset.top + jumbotronOuterHeight + margin.top + padding.top;
					var height = footerTop - jumbotronBottom;

					elm.css("height", height);
				};

				var setAttributes = function(elm, attrs) {
					var cssProperties = {};

					if(attrs.marginTop) {
						cssProperties.marginTop = parseInt(attrs.marginTop, 10) + "px";
					}

					if(attrs.marginBottom) {
						cssProperties.marginBottom = parseInt(attrs.marginBottom, 10) + "px";
					}

					if(attrs.paddingTop) {
						cssProperties.paddingTop = parseInt(attrs.paddingTop, 10) + "px";
					}

					if(attrs.paddingBottom) {
						cssProperties.paddingBottom = parseInt(attrs.paddingBottom, 10) + "px";
					}

					elm.css(cssProperties);
				};

				setAttributes(elm, attrs);
			}
		};

		return fillerDivDefinition;
	}
]);