'use strict';

angular.module('core').directive('comment', [
	function() {
		var commentDefinition = {
			template: '<div class="frank-comment" ng-transclude></div>',
			restrict: 'E',
			replace : true,
			transclude : true
			//link: function postLink(scope, element, attrs) {
			//}
		};

		return commentDefinition;
	}
]);

/**
*
*
* Possible imporovement: simply pass the entire object to the directive instead of requiring
* to pass all the fields into the header individually.
*/
angular.module('core').directive('commentHeader', ['$http', '$window',
	function($http, $window) {
		var commentHeaderDefinition = {
			restrict : 'E',
			scope : {
				author : '@authorName',
				time : '@postTime',
				image : '@authorImage',
				removable : '@',
				removeAddress : '@',
				commentId : '@',
				commentsArr : '=',
				arrIndex : '='
			},
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
								"<a href='#' class='frank-comment-remove-icon' ng-click='removeComment()'><i class='fa fa-remove text-danger'></i></a>" +
							"</div>" +
						"</div>",
			link : function postLink($scope, element, attrs) {
				$scope.removeComment = function() {
					$http.post($scope.removeAddress, {comment_id : $scope.commentId}).success(function(response) {
						$scope.commentsArr.splice($scope.arrIndex, 1);
					}).error(function(response, status) {
						$window.alert("There was an error deleting this comment.  Please try again.");
						console.log(response.message);
					});
				};
			}
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
			template : "<div class='frank-comment-body'>" +
							"<div class='frank-comment-message'>" +
								"<span ng-bind-html='comment'></span>" +
							"</div>" +
						"</div>",
			scope : {
				comment : '=commentBody'
			}
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

angular.module('core').directive('commentEditor', ['$compile', '$timeout', 'eventSelector', '$window', '$http', 'Authentication',
	function($compile, $timeout, eventSelector, $window, $http, Authentication) {
		var commentEditorDefinition = {
			restrict : 'E',
			replace : true,
			scope : {
				newComment : '=commentContent',
				expanded : '=',
				files : '=files',
				postAddress : '@',
				commentsArr : '='
			},
			template : "<form class='frank-comment-editor' ng-submit='postComment()'>" +
							"<div class='frank-comment-editor-compressed' ng-click='toggleExpanded()' ng-hide='expanded'>Click to comment...</div>" +
							"<div class='frank-comment-editor-expanded' ng-show='expanded' flow-init flow-name='uploader.flowInstance' flow-file-added='!!{jpg:1,gif:1,png:1,tiff:1,jpeg:1}[$file.getExtension()]' flow-complete='flowComplete()'>" +
								"<div text-angular ng-model='comment.content' ta-toolbar=\"[['undo', 'redo'], ['ul', 'ol', 'quote'], ['bold', 'italics', 'underline'], ['insertLink', 'insertVideo']]\" ></div>" +
								"<span class='btn btn-default frank-comment-editor-img-uploader' flow-btn><i class='fa fa-camera'></i></span>" +
								"<div class='frank-comment-editor-preview-container'><div class='frank-comment-editor-preview' ng-repeat='file in $flow.files'><img class='frank-comment-editor-preview-img' flow-img='file' ng-mouseover='showOverlay = $index' /><div ng-class='{\"frank-comment-editor-preview-overlay\" : showOverlay===$index, \"frank-comment-editor-preview-overlay-hidden\" : showOverlay!==$index}' ng-click='file.cancel()' ng-mouseleave='showOverlay = -1'><i class='fa fa-remove'></i></div></div></div>" +
								"<div class='frank-comment-editor-submit' ng-class='{\"frank-comment-editor-submit-higher\" : uploader.flowInstance.files.length}'><input type='submit' value='Post' class='btn btn-primary' /></div>" +
							"</div>" +
						"</form>",
			link : function postLink($scope, element, attrs) {
				$scope.expanded = false;
				$scope.showOverlay = -1;

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
			},
			controller : function($scope) {
				$scope.uploader = {};
				$scope.comment = {};
				$scope.newComment = $scope.comment.content = "";

				$scope.postComment = function() {
					if($scope.uploader.flowInstance.getSize() > 2097152) {
						$window.alert("We can't handle all the awesomeness from your pictures.  Try removing a few or if you only have 1, try cropping it.");
					} else if(!$scope.comment.content && !$scope.uploader.flowInstance.files.length) {
						$window.alert("Don't forget to add some of your deep thoughts before posting a comment.");
					} else {
						var now = Date.now();
						for(var i=0; i<$scope.uploader.flowInstance.files.length; i++) {
							$scope.uploader.flowInstance.files[i].name = Authentication.user._id + eventSelector.selectedEvent + now + i + "." + $scope.uploader.flowInstance.files[i].getExtension();
							console.log($scope.uploader.flowInstance.files[i].name);
						}
						$scope.uploader.flowInstance.opts.query = {event_id : eventSelector.postEventId};
						$scope.uploader.flowInstance.opts.testChunks = false;
						$scope.uploader.flowInstance.opts.permanentErrors = [400, 401, 404, 415, 500, 501];

						//TODO: Add an .error() event and a var.  If there was an error, set the var to false and do not add the comment to db.
						$scope.flowComplete = function() {
							var commentWithImg = $scope.comment.content;
							for(var i=0; i<$scope.uploader.flowInstance.files.length; i++) {
								commentWithImg += "<div class='frank-comment-pic-containter'><img class='frank-comment-pic' src='img/recruiter/" + $scope.uploader.flowInstance.files[i].name + "' /></div>";
							}
							$http.post($scope.postAddress, {comment : commentWithImg, event_id : eventSelector.postEventId}).success(function(response) {
								$scope.commentsArr.push({
									user_id : {
										displayName : Authentication.user.displayName
									},
									event_id : eventSelector.postEventId,
									comment : commentWithImg,
									date : now,
									stream : 'recruiter'
								});
								$scope.comment.content = "";
								$scope.expanded = false;
								$scope.uploader.flowInstance.cancel();
							}).error(function(response, status) {
								$window.alert(status + " " + response.message);
							});
						};

						$scope.uploader.flowInstance.upload();
					}
				};

			}
		};

		return commentEditorDefinition;
	}
]);