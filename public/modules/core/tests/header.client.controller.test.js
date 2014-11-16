'use strict';

(function() {
	describe('HeaderController', function() {
		//Initialize global variables
		var scope,
			HeaderController;

		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope) {
			scope = $rootScope.$new();

			HeaderController = $controller('HeaderController', {
				$scope: scope
			});
		}));

		it('should expose the authentication service', function() {
			expect(scope.authentication).toBeTruthy();
		});

		it('should return return true for user with only attendee Role', function() {
			scope.userRoles = ['attendee'];
			expect(scope.hideLink(scope.leaderboardRoles)).toBeTruthy()
		});

		it('should return return false for user with recruiter and/or admin Role(s)', function() {
			scope.userRoles = ['recruiter','admin'];
			expect(scope.hideLink(scope.leaderboardRoles)).toEqual(false)
		});
	});
})();