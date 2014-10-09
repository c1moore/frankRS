'use strict';

(function() {
	describe('ButtonController', function() {
		//Initialize global variables
		var scope,
			ButtonController;

		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope) {
			scope = $rootScope.$new();

			ButtonController = $controller('ButtonController', {
				$scope: scope
			});
		}));

		it('should give recruiter buttons for recruiter', function() {
			
		});
	});
})();
