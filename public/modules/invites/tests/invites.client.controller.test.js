'use strict';

(function() {
	describe('inviteController', function() {
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope) {
			scope = $rootScope.$new();

			inviteController = $controller('inviteController', {
				$scope: scope
			});
		}));
	});
})();
