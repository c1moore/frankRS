angular.module('leaderboard').controller('LeaderboardTablesCtrl', ['$scope', 'Authentication', '$http', 'ngTableParams',
	function($scope, Authentication, $http, ngTableParams) {
		// route will be leaderboard/recuiterInfo
		var data = {
			users: [],
			error: null
		};

		$http.get('/modules/leaderboard/tests/MOCK_DATA.json').success(function(data) {
			$scope.data.users = data;
		}).error(function(error){
			$scope.data.error = error;
		});

		$scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10           // count per page
    		}, {
        total: data.users.length, // length of data
        getData: function($defer, params) {
            $defer.resolve(data.users.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
	}
]);