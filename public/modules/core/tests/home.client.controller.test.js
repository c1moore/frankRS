'use strict';

(function() {
	describe('HomeController', function() {
		//Initialize global variables
		var scope,
			HomeController;

		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope, Authentication, $injector) {
			scope = $rootScope.$new();
			Authentication = $injector.get('Authentication');
			Authentication.user = {
				roles : ["admin", "recruiter", "attendee"]
			};

			HomeController = $controller('HomeController', {
				$scope: scope,
				Authentication : Authentication
			});
		}));

		it('should expose the authentication service', function() {
			expect(scope.authentication).toBeTruthy();
		});

		it('should expect comments to be true', function() {
			expect(scope.displayComments).toBeTruthy();
			//expect(scope.buttonsGrid).toEqual("col-md-10");
		});

		it('should change comments to change to false', function() {
			scope.toggleComments();
			expect(scope.displayComments).not.toBeTruthy();
			//expect(scope.buttonsGrid).toEqual("col-md-12");
		});

		it('should return a width of 50', function() {
			scope.authentication.user.roles = ['recruiter'];
			expect(scope.data.buttons.length).toEqual(5);
		})
	});
})();