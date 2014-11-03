'use strict';

(function() {
	describe('LeaderboardTablesCtrl', function() {
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope) {
			scope = $rootScope.$new();

			LeaderboardTablesCtrl = $controller('LeaderboardTablesCtrl', {
				$scope: scope
			});
		}));

		it('should return');
	});
})();
