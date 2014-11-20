angular.module('admin').controller("mainController", function($rootScope, $scope, $state) {		

		$scope.go = function(route){
			$state.go(route);
		};

		$scope.active = function(route){
			return $state.is(route);
		};

		$scope.tabs = [
			{ heading: "Application", route:"application.view.client.html", active:false },
			{ heading: "Event", route:"event.view.client.html", active:false },
		];

		$scope.$on("$stateChangeSuccess", function() {
			$scope.tabs.forEach(function(tab) {
				tab.active = $scope.active(tab.route);
			});
		});
	});
