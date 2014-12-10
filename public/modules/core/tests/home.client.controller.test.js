'use strict';

(function() {
	describe('HomeController', function() {
		//Initialize global variables
		var scope,
			HomeController;

		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		beforeEach(inject(function($controller, $rootScope) {
			scope = $rootScope.$new();

			HomeController = $controller('HomeController', {
				$scope: scope
			});
		}));

		it('should expose the authentication service', function() {
			expect(scope.authentication).toBeTruthy();
		});

		it('should expect comments to be true', function() {
			expect(scope.displayComments).toBeTruthy();
			expect(scope.buttonsGrid).toEqual("col-md-10");
		});

		it('should change comments to change to false', function() {
			scope.toggleComments();
			expect(scope.displayComments).not.toBeTruthy();
			expect(scope.buttonsGrid).toEqual("col-md-12");
		});
		
		it('should return 5', function() {
			expect(scope.buttons).toEqual(5);
		});
		
		it('should return the right named views', function() {
			expect(scope.names).toEqual(["Admin Page", "Memo Board", "Leaderboard", "Control Room", "Request to Become a Recruiter"]);
		});
		
		it('should return no users', function() {
			scope.comments.length(0);
			expect(scope.showComments).toEqual("No users");
		});

		it('should return a width of 50', function() {
			scope.userRoles = ['recruiter'];
			expect(scope.buttonsWidth).toEqual(50);
		})
	});
})();
