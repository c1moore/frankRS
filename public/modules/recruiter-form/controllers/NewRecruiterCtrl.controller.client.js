'use strict';

angular.module('recruiter-form').controller('NewRecruiterCtrl', ['$scope', '$http', '$timeout', '$window', 'vcRecaptchaService', 'Authentication', '$location',
	function($scope, $http, $timeout, $window, vcRecaptchaService, Authentication, $location) {
		//If the person accessing the page has an account, they should request to be a recruiter on the events page so redirect them.
		if(Authentication.user) {
			$location.path('/events');
		}

		$scope.recruiter = {};
		$scope.success = false;
		$scope.error = false;

		$scope.submit = function() {
			if(vcRecaptchaService.getResponse() === "") {
				//The user has not resolved the reCAPTCHA.
				$scope.error = "reCAPTCHA not resolved.";
			} else {
				$scope.recruiter['g-recaptcha-response'] = vcRecaptchaService.getResponse();
				$scope.note = "PLEASE DO NOT DELETE OR EDIT THIS SECTION:\n**********\n***Reason:\n" + $scope.recruiter.reason + "\n\n***Connections:\n" + $scope.recruiter.connections + "\n\n***Recruiter Skills:\n" + $scope.recruiter.skills + "\n***************";

				$http.post('/candidate/new/no_user', $scope.recruiter).success(function(res) {
					$scope.success = true;
				}).error(function(res, status) {
					if(status === 400) {
						if(res.message) {
							$scope.error = res.message;
						} else {
							$scope.error = "No robots allowed!";
						}
					} else if(status === 500) {
						$scope.error = "There was an error with our servers.  Please try again later.  If this error persists, please notify us and include a screenshot of this page.";
					}
				});
			}
		};
	}
]);