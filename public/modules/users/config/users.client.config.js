'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication', '$window',
			function($q, $location, Authentication, $window) {
				return {
					responseError: function(rejection) {
						console.log(rejection);
						switch (rejection.status) {
							case 401:
								/**
								* 401 errors are handled specially.  They can mean the user is not logged
								* in or that the user does not have permission to do the action they were
								* trying to do.  Also, the user could try to access something without
								* selecting an event, which will cause a 401, but may not require a
								* redirection.
								*/
								if(rejection.data.message === "User not logged in.") {
									//Deauthenticate the global user
									Authentication.user = null;
									$window.user = null;

									//Redirect the user to the signin page
									$location.path('/signin');
								} else if(rejection.data.message === "User does not have permission.") {
									//Redirect the user to the home page
									$location.path('/');
								}

								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);