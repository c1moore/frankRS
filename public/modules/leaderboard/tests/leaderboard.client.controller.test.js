'use strict';

(function() {
	describe('LeaderboardTablesCtrl', function() {
		var scope, LeaderboardTablesCtrl;

		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope, Authentication, $injector) {
			scope = $rootScope.$new();
			Authentication = $injector.get('Authentication');
			Authentication.user = {
				roles : ["admin", "recruiter", "attendee"]
			};

			LeaderboardTablesCtrl = $controller('LeaderboardTablesCtrl', {
				$scope: scope,
				Authentication : Authentication
			});
		}));

		it('getRatio() should return the right ratio', function() {
			scope.userInvites = 10;
			scope.userAttendees = 10;
			expect(scope.getRatio()).toBe(0.5);
		});

		it('getRatio() should return 0 when userInvites and userAttendees are both 0', function() {
			scope.userInvites = 0;
			scope.userAttendees = 0;
			expect(scope.getRatio()).toBe(0);
		});
	});
})();
