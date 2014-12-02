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

		$scope.toHumanReadable = function(time) {
			var date = new Date(parseInt(time));

			return date.toLocaleDateString() + " " + date.toLocaleTimeString();
		}

		/**
		* Get all the comments from the database for recruiters for
		* this event.
		*/
		var getComments = function() {
			if(eventSelector.postEventId) {
				$http.post('/comments/getRecruiterCommentsForEvent', {event_id : eventSelector.postEventId}).success(function(response) {
					$scope.comments = response;
				}).error(function(response, status) {
					if(status === 401) {
						if(response.message === "User is not logged in.") {
							$location.path('/signin');
						} else if(response.message === "User does not have permission."){
							$location.path('/');
						} else {
							console.log(response.message);
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

		/*//Logic for uploading files
		$scope.files = [];
		var previousFiles=0;

		$scope.uploader = new FileUploader({
			url : '/comments/uploadRecruiterImage'
		});

		$scope.$watch('files', function() {
			var i = $scope.files.length;
			if(i < previousFiles || !i) {
				previousFiles = $scope.files.length;
				return;
			} else {
				console.log($scope.files[0]);
				previousFiles = $scope.files.length;
				$upload.upload({
					url : '/comments/uploadRecruiterImage',
					method : 'POST',
					data : {event_id : eventSelector.postEventId},
					file : $scope.files[i],
					fileName : Date.now() + $scope.authentication.user._id + '.' + $scope.files[i].ext
				}).success(function(data) {
					alert("Cool.");
				}).error(function(data, status) {
					alert("Still cool, but less so.");
				});
			}
		});*/
	}
]);