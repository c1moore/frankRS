'use strict';

angular.module('leaderboard').controller('commentsCtrl', ['$scope', 'Authentication', '$timeout', '$location', 'eventSelector', '$http', '$window', '$modal', 'cacheService', '$interval',
	function($scope, Authentication, $timeout, $location, eventSelector, $http, $window, $modal, cacheService, $interval) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin', 'recruiter']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
			$scope.authentication = Authentication;
			$scope.editorExpanded = false;
			$scope.removable = function(user_id) {
				if(_.intersection($scope.authentication.user.roles, ['admin']).length === 1)
					return true;
				else {
					if(user_id.toString() === $scope.authentication.user._id.toString())
						return true;
				}

				return false;
			};

			$scope.toHumanReadable = function(time) {
				var date = new Date(parseInt(time));

				return date.toLocaleDateString() + " " + date.toLocaleTimeString();
			};

			/**
			* Get all the comments from the database for recruiters for
			* this event.
			*/
			$scope.getComments = function() {
				if(eventSelector.postEventId) {
					$http.post('/comments/getRecruiterCommentsForEvent', {event_id : eventSelector.postEventId}).success(function(response) {
						$scope.comments = response;
					}).error(function(response, status) {
						if(status !== 401) {
							$scope.commentErr = "Error retrieving comments.  Try refreshing the page.";

							if(response.message === "No comments found!") {
								$scope.commentErr = response.message;
							}

							//Fail silently, since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
							$timeout(function() {
								$scope.getComments();
							}, 5000);
						}
					});
				}
			};

			//Get comments when the page is first loaded.
			$timeout($scope.getComments);
			//Watch for changes in the selected event and update the comments accordingly.
			$scope.$watch(function() {
				return eventSelector.selectedEvent;
			}, $scope.getComments);

			//Update comments every 1 minute.
			$interval($scope.getComments(), 60000);
		}
	}
]);