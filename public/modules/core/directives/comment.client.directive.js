'use strict';

angular.module('core').directive('comment', [
	function() {
		var commentDefinition = {
			template: '<div class="frank-comment" ng-transclude></div>',
			restrict: 'E',
			replace : true,
			transclude : true,
			//link: function postLink(scope, element, attrs) {
			//}
		};

		return commentDefinition;
	}
]);

angular.module('core').directive('commentHeader', [
	function() {
		var commentHeaderDefinition = {
			restrict : 'E',
			scope : {
				author : '@authorName',
				time : '@postTime',
				image : '@authorImage',
				removable : '@'
			},
			require : '^comment',
			replace : true,
			template : "<div class='frank-comment-header'>" +
							"<div ng-if='image' class='frank-comment-image-container'>" +
								"<img src='{{image}}' class='frank-comment-image' />" +
							"</div>" +
							"<div class='frank-comment-author'>" +
								"<span>{{author}}</span>" +
							"</div>" +
							"<div class='frank-comment-time'>" +
								"<span>{{time}}</span>" +
							"</div>" +
							"<div ng-if='removable' class='frank-comment-remove'>" +
								"<a href='#' class='frank-comment-remove-icon'><i class='fa fa-remove text-danger'></i></a>" +
							"</div>" +
						"</div>"
		};

		return commentHeaderDefinition;
	}
]);

angular.module('core').directive('commentBody', [
	function() {
		var commentBodyDefinition = {
			restrict : 'E',
			transclude : true,
			replace : true,
			require : '^comment',
			template : "<div class='frank-comment-body'>" +
							"<div class='frank-comment-message'>" +
								"<span ng-transclude></span>" +
							"</div>" +
						"</div>"
		};

		return commentBodyDefinition;
	}
]);

angular.module('core').directive('commentFooter', [
	function() {
		var commentFooterDefinition = {
			restrict : 'E',
			transclude : true,
			replace : true,
			scope : {
				interests : '='
			},
			require : '^comment',
			template : "<div class='frank-comment-footer'>" +
							"<div class='frank-comment-interests'>" +
								"<div ng-repeat='interest in interests' class='frank-comment-footer-img-container'>" +
									"<img src='interest.url' alt='interest.text' class='frank-comment-footer-img' />" +
								"</div>" +
							"</div>" +
						"</div>"
		};

		return commentFooterDefinition;
	}
]);

angular.module('core').directive('commentEditor', ['$compile', '$timeout',
	function($compile, $timeout) {
		var commentEditorDefinition = {
			restrict : 'E',
			replace : true,
			scope : {
				newComment : '=commentContent',
				expanded : '=',
				files : '=files'
			},
			template : "<div class='frank-comment-editor'>" +
							"<div class='frank-comment-editor-compressed' ng-click='toggleExpanded()' ng-hide='expanded'>Click to comment...</div>" +
							"<div class='frank-comment-editor-expanded' ng-show='expanded' flow-init>" +
								"<div text-angular ng-model='newComment' ta-toolbar=\"[['undo', 'redo'], ['ul', 'ol', 'quote'], ['bold', 'italics', 'underline'], ['insertLink', 'insertVideo']]\" ></div>" +
							"</div>" +
						"</div>",
			link : function postLink($scope, element, attrs) {
				$scope.expanded = false;

				$scope.toggleExpanded = function() {
					$scope.expanded = !$scope.expanded;
				}

				angular.element(".ta-toolbar .btn-group:last").append($compile("<span class='btn btn-default' flow-btn><i class='fa fa-camera'></i></button>")($scope));
				angular.element(".ta-toolbar button").removeAttr("ng-disabled");
				angular.element(".ta-toolbar button").removeAttr("unselectable");
				$timeout(function() {
					angular.element(".ta-toolbar button").removeAttr("disabled")
				}, 100);
				angular.element(".ta-root").on('focusout', function() {
					$scope.$apply(function() {
						$timeout(function() {
							angular.element(".ta-toolbar button").removeAttr("disabled")
						}, 10);
					});
				});
			}
		};

		return commentEditorDefinition;
	}
]);