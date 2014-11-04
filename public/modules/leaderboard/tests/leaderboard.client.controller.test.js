'use strict';

(function() {
	describe('LeaderboardTablesCtrl', function() {
		var scope, LeaderboardTablesCtrl;

		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope) {
			scope = $rootScope.$new();

			LeaderboardTablesCtrl = $controller('LeaderboardTablesCtrl', {
				$scope: scope
			});
		}));

		it('should return the max invited value from data', function() {
			expect(scope.invitedMax).toBeGreaterThan(90);
		});
	});
})();
