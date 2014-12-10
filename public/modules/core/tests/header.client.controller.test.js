'use strict';

(function() {
	describe('HeaderController', function() {
		//Initialize global variables
		var scope,
			HeaderController;

		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));
		//beforeEach(module('Authentication'));

		beforeEach(inject(function($controller, $rootScope, Authentication, $injector) {
			scope = $rootScope.$new();
			Authentication = $injector.get('Authentication');
			Authentication.user = {
				roles : ["admin", "recruiter", "attendee"]
			};

			HeaderController = $controller('HeaderController', {
				$scope: scope,
				Authentication : Authentication
			});

			//scope.authentication.user.roles = ["attendee"];
		}));

		it('should expose the authentication service', function() {
			expect(scope.authentication).toBeTruthy();
		});

		it('should return return true for user with only attendee Role', function() {
			scope.authentication.user.roles = ["attendee"];
			expect(scope.hideLink(scope.leaderboardRoles)).toBeTruthy();
		});

		it('should return return false for user with recruiter and/or admin Role(s)', function() {
			scope.authentication.user.roles = ['recruiter','admin'];
			expect(scope.hideLink(scope.leaderboardRoles)).toEqual(false);
		});
	});
})();