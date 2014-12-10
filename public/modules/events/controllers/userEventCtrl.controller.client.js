angular.module('events').controller('userEventCtrl', ['$scope', 'ngTableParams', '$http', 'eventSelector', '$filter', 'dialogs', 'Authentication', '$timeout', '$window',
	function($scope, ngTableParams, $http, eventSelector, $filter, dialogs, Authentication, $timeout, $window) {
		$scope.user = Authentication;
		console.log($scope.user);
		$scope.test = function(event) {
			console.log(event);
		}

		var getEvents = function() {
			$http.post('/events/user/allEvents').success(function(data) {
				$scope.events = [];
				$scope.events = data;
			}).error(function(error) {
				console.log(error);
			});
		}
		getEvents();


	  	$scope.tableParams = new ngTableParams({
        	page: 1,
			count: 5,
			filter: {
			        name:''
			  },
			  sorting: {
			        name:'asc'
			  }
			}, {
			getData: function($defer, params) {
		        var filteredData = params.filter() ?
		              $filter('filter')($scope.events, params.filter()) :
		              $scope.events;
		        var orderedData = params.sorting() ? 
		              $filter('orderBy')(filteredData, params.orderBy()) : 
		              $scope.events;
		        params.total(orderedData.length);
				$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			}
        });

        $scope.$watch("events", function() {
        	$timeout(function() {
				$scope.tableParams.reload();
			});
		});

		$scope.launch = function(event) {
			dlg = dialogs.confirm("Confirmation Vital", "Are you absolutely sure you want to go through the rigorous tests we put forth to become a recruiter for " + event.name + "? <br /><br />(You obviously have the right stuff if you have access to this page.)", {windowClass : "frank-recruiter-signup-modal"});
			dlg.result.then(function(btn){
				$http.post("candidate/setCandidate", {event_id:event._id}).success(function() {
					getEvents();
				}).error(function(error) {
					console.log(error);
					$window.alert("There was an error submitting your request.  Please try again later.");
				})
			})
		}

		/**
		* Adopted from post made on stackoverflow.com by disfated.  Original post here:
		* http://stackoverflow.com/questions/2332811/capitalize-words-in-string
		*/
		$scope.capitalize = function(string, lower) {
			return (lower ? string.toLowerCase() : string).replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		};
	}
]);