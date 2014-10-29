'use strict';

(function() {
	describe('LeaderboardController', function() {
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope) {
			scope = $rootScope.$new();

			LeaderboardController = $controller('LeaderboardController', {
				$scope: scope
			});
		}));

		it('should return');
	});
})();
