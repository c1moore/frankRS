'use strict';

angular.module('leaderboard').controller('commentsCtrl', ['$scope', 'Authentication', '$timeout', '$location', 'eventSelector', '$http', '$window', '$modal', 'cacheService', '$interval',
	function($scope, Authentication, $timeout, $location, eventSelector, $http, $window, $modal, cacheService, $interval) {
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

		/**
		* Get all the comments from the database for recruiters for
		* this event.
		*/
		var getComments = function() {
			if(eventSelector.postEventId) {
				$http.post('/comments/getRecruiterCommentsForEvent', {event_id : eventSelector.postEventId}).success(function(response) {
					$scope.comments = response;
					console.log(response);
				}).error(function(response, status) {
					if(status === 401) {
						if(response.message === "User is not logged in.") {
							$location.path('/signin');
						} else {
							$location.path('/');
						}
					} else if(status === 400) {
						$scope.commentErr = "Error retrieving comments.  Try refreshing the page.";
					}
				});
			}
		};

		//Get comments when the page is first loaded.
		$timeout(getComments);
		//Watch for changes in the selected event and update the comments accordingly.
		$scope.$watch(function() {
			return eventSelector.selectedEvent;
		}, getComments);

		//Update comments every 1 minute.
		$interval(getComments(), 60000);
	}
]);