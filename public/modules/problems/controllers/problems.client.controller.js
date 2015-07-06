'use strict';

angular.module('problems').controller('ProblemController', ['$scope', '$http', 'eventSelector', 'Authentication', '$location',
	function($scope, $http, eventSelector, Authentication, $location) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin', 'recruiter', 'attendee']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
			$scope.user = Authentication.user;
			$scope.admin = ($scope.user.roles.indexOf("admin") !== -1) ? true : false;
			$scope.recruiter = $scope.admin || (($scope.user.roles.indexOf("recruiter") !== -1) ? true : false);

			$scope.problem = {};
			$scope.problem.contact = "true";

			$scope.submitProblem = function() {
				var data = {subject : "Problem Reported on frankRS"};
				var permissions = ($scope.problem.contact === "true") ? "can" : "cannot";

				var message = "<p>A problem was reported for the frank recruiter system.  Here are a few details:</p>" +
				"<br />" +
				"<br />" +
				"<b>Browser: </b>" + (($scope.problem.browser !== 'other') ? $scope.problem.browser : $scope.problem.other) + "<br />" +
				"<b>Version: </b>" + $scope.problem.version + "<br />" +
				"<b>OS: </b>" + (($scope.problem.os !== 'other') ? $scope.problem.os : $scope.problem.os_other) + "<br />" +
				"<b>Page: </b>" + $scope.problem.page + "<br />" +
				"<b>Description: </b>" + $scope.problem.description + "<br />" +
				"<br />" +
				"<b>***User Information***</b><br />" +
				"&nbsp;&nbsp;&nbsp;&nbsp;<b>Name: </b>" + $scope.user.fName + $scope.user.lName + "<br />" +
				"&nbsp;&nbsp;&nbsp;&nbsp;<b>Email: </b>" + $scope.user.email + "<br />" +
				"&nbsp;&nbsp;&nbsp;&nbsp;<b>Roles: </b>" + $scope.user.roles + "<br />" +
				"<br />" +
				"You <b>" + permissions + "</b> reply to this message for more information.";

				data.message = angular.toJson(message);

				$http.post("/programmer/email", data).success(function() {
					$scope.error = false;
					$scope.success = true;

					$scope.problem = {};
					$scope.problem.contact = true;
				}).error(function(res, status) {
					$scope.success = true;
					$scope.error = res.message;
				});
			};
		}
	}
]);