(function() {
	describe('Roles Filter Test', function() {
		// Load the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		var testData = [
			{roles:['admin', 'recruiter','atendee']},
			{roles:['recruiter']},
			{roles:['admin','atendee']}
		];

		it('should return remove third testData', 
			inject(function($filter) {
				var data = $filter('roles')(testData,['admin']);
				expect(data.length).toEqual(2);
		}));
	});
})();