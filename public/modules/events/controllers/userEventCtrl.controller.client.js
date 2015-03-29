angular.module('events').controller('userEventCtrl', ['$scope', 'ngTableParams', '$http', 'eventSelector', '$filter', 'dialogs', 'Authentication', '$timeout', '$window',
	function($scope, ngTableParams, $http, eventSelector, $filter, dialogs, Authentication, $timeout, $window) {
		$scope.user = Authentication;
		
		$scope.dpOpen = false;
		$scope.openDatepicker = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.dpOpen = true;
		};

		var getEvents = function() {
			$http.post('/events/user/allEvents').success(function(data) {
				$scope.events = [];
				$scope.events = data;

				for(var i=0; i < $scope.events.length; i++) {
					//This is what is searched when the user tries to filter the table.  Two different formats are used to increase chances of returning what the user wants: (day_of_week, Month day, Year) & (M/d/yyyy)
					$scope.events[i].date = $filter('date')($scope.events[i].start_date, "EEEE, MMMM d, yyyy") + " - " + $filter('date')($scope.events[i].end_date, "EEEE, MMMM d, yyyy") + " " + $filter('date')($scope.events[i].start_date, "M/d/yyyy") + " - " + $filter('date')($scope.events[i].end_date, "M/d/yyyy");

					$scope.events[i].start_date = $filter('date')($scope.events[i].start_date, "EEE, MMM d, yyyy");
					$scope.events[i].end_date = $filter('date')($scope.events[i].end_date, "EEE, MMM d, yyyy");
				}
			}).error(function(error) {
				console.log(error);
			});
		};
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

		        if(orderedData) {
		        	params.total(orderedData.length);
					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				} else {
					params.total(0);
					$defer.resolve(null);
				}
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