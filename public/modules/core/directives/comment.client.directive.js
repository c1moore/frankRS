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

angular.module('core').directive('commentEditor', ['$compile', '$timeout', 'eventSelector',
	function($compile, $timeout, eventSelector) {
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
							"<div class='frank-comment-editor-expanded' ng-show='expanded' flow-init flow-name='uploader.flowInstance' flow-file-added='!!{jpg:1,gif:1,png:1,tiff:1,jpeg:1}[$file.getExtension()]'>" +
								"<div text-angular ng-model='newComment' ta-toolbar=\"[['undo', 'redo'], ['ul', 'ol', 'quote'], ['bold', 'italics', 'underline'], ['insertLink', 'insertVideo']]\" ></div>" +
								"<span class='btn btn-default frank-comment-editor-img-uploader' flow-btn><i class='fa fa-camera'></i></span>" +
								"<div class='frank-comment-editor-preview-container'><div class='frank-comment-editor-preview' ng-repeat='file in $flow.files'><img class='frank-comment-editor-preview-img' flow-img='file' ng-mouseover='showOverlay = $index' /><div ng-class='{\"frank-comment-editor-preview-overlay\" : showOverlay===$index, \"frank-comment-editor-preview-overlay-hidden\" : showOverlay!==$index}' ng-click='file.cancel()' ng-mouseleave='showOverlay = -1'><i class='fa fa-remove'></i></div></div></div>" +
							"</div>" +
						"</div>",
			link : function postLink($scope, element, attrs) {
				$scope.expanded = false;
				$scope.showOverlay = -1;
				// $scope.uploader = {};

				$scope.toggleExpanded = function() {
					$scope.expanded = !$scope.expanded;
				};

				var imgbut = angular.element(".frank-comment-editor-img-uploader").detach();
				angular.element(".ta-toolbar .btn-group:last").append(imgbut);
				
				//Remove the disabled attributes from the textAngular toolbar.  This is mainly for styling.
				angular.element(".ta-toolbar button").removeAttr("ng-disabled");
				angular.element(".ta-toolbar button").removeAttr("unselectable");
				$timeout(function() {
					angular.element(".ta-toolbar button").removeAttr("disabled");
				}, 100);
				//Make sure the toolbar is not disabled after textAngular textbox loses focus.
				angular.element(".ta-root").on('focusout', function() {
					$scope.$apply(function() {
						$timeout(function() {
							angular.element(".ta-toolbar button").removeAttr("disabled");
						}, 10);
					});
				});

				// /**
				// * Automatically upload an image once it is submitted to Flow.js's queue.  Since $flow is not
				// * available immediately, we need to add a timeout before trying to access it.
				// */
				// $timeout(function() {
				// 	console.log($scope.uploader.flowInstance);
				// 	$scope.uploader.flowInstance.filesSubmitted = function(files, event) {
				// 		//Set the 'query' field so we can use the event_id in the filename.
				// 		$scope.uploader.flowInstance.opts.query = {event_id : eventSelector.postEventId};
				// 	};
				// },10000);
			},
			controller : function($scope) {
				$scope.uploader = {};

				/**
				* Automatically upload an image once it is submitted to Flow.js's queue.  Since $flow is not
				* available immediately, we need to add a timeout before trying to access it.
				*/
				$timeout(function() {
					$scope.uploader.flowInstance.filesSubmitted = function(files, event) {
						//Set the 'query' field so we can use the event_id in the filename.
						$scope.uploader.flowInstance.opts.query = {event_id : eventSelector.postEventId};
					};
				});

			}
		};

		return commentEditorDefinition;
	}
]);