'use strict';

angular.module('admin').controller('recruitersController', ['$scope', 'ngTableParams', '$http', '$filter', 'eventSelector', '$modal',
	function($scope, ngTableParams, $http, $filter, eventSelector, $modal) {
		$scope.recruiters = [];			//Array of recruiters (user objects).
		$scope.isEventSelected = eventSelector.postEventId ? true : false;		//Is an event selected?
		$scope.tabErr = false;			//Was there an error obtaining recruiters from backend?

		//When a new event is selected, update isEventSelected and recruiters.
		$scope.$watch(function() {
			return eventSelector.postEventId;
		}, function() {
			$scope.isEventSelected = eventSelector.postEventId ? true : false;

			if($scope.isEventSelected) {
				getRecruiters();
			}
		});

		//Obtain recruiters from the backend.
		var getRecruiters = function() {
			$http.get('/event/recruiters', {params : {event_id : eventSelector.postEventId}}).success(function(res) {
				$scope.tabErr = false;

				//Only retain ranking information for this event.
				for(var i = 0; i < res.length; i++) {
					var j;
					for(j = 0; j < res[i].rank.length; j++) {
						if(res[i].rank[j].event_id.toString() === eventSelector.postEventId.toString()) {
							res[i].rank = res[i].rank[j].place;
							break;
						}
					}

					if(j === res[i].rank.length) {
						res[i].rank = "0";
					}
				}

				$scope.recruiters = res;

				$scope.recruiterTableParams.reload();
			}).error(function(res, status) {
				if(status === 400) {
					$scope.tabErr = res.message;
				}
			});
		};

		//Setup ng-table
		$scope.recruiterTableParams = new ngTableParams({
			page: 	1,
			count: 	5,
			filter: {
				displayName: 	''
			},
			sorting: {
				displayName: 	'asc'
			}
		}, {
			getData: function($defer, params) {
				var filteredData = params.filter() ? $filter('filter')($scope.recruiters, params.filter()) : $scope.recruiters;
				var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.recruiters;

				params.total(orderedData.length);
				$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			}
		});

		//Remove user's role as a recruiter for this specific event.
		var removeRecruiter = function(rid, rname) {
			console.log("removing");
			$http.post("/remove/Recruiter", {user_id : rid, event_id : eventSelector.postEventId}).success(function(res) {
				getRecruiters();
			}).error(function(res, status) {
				$window.alert("There was an error removing " + rname + "'s recruiter role.\n\n" + res.message);

				getRecruiters();
			});
		};

		//Delete the recruiter's account.
		var deleteRecruiter = function(rid, rname) {
			$http.post("/remove", {user_id : rid}).success(function(res) {
				getRecruiters();
			}).error(function(res, status) {
				$window.alert("There was an error deleting " + rname + "'s account.\n\n" + res.message);
				getRecruiters();
			});
		};

		/**
		* To be called when the user wants to remove a recruiter.  When called, the user is
		* prompted on what action should be taken.  The options are to remove recruiter's
		* role for this event or completely delete them from the system.  After making a
		* choice, either removeRecruiter or deleteRecruiter are called.
		*
		* @param rid - Recruiter's user ID
		*/
		$scope.removeRecruiter = function(recruiter) {
			/**
			* Flags to represent what action should be taken.  The flags have the
			* following meanings:
			* 		0 - Take no action (cancel)
			* 		1 - Remove the user's recruiter role for this event
			* 		2 - Remove this user from the system
			*
			* These flags are always assumed to stay in this order (i.e. cancel is first,
			* remove role is second, and remove user is last).
			*/
			var flags = [0, 1, 2];

			var modalInstance = $modal.open({
				templateUrl: 	"modules/admin/views/recruiterWarn.client.view.html",
				controller: 	"actionModalCtrl",
				backdrop: 		true,
				backdropClass: 	"admin-backdrop",
				resolve: 		{
					flags: function() {
						return [0, 1, 2];
					},
					recruiter: function() {
						return recruiter;
					}
				}
			});

			modalInstance.result.then(function(result) {
				result = parseInt(result);
				//Make sure a proper flag was returned
				switch(result) {
					case flags[0]:
						//Take no action
						break;
					case flags[1]:
						//Remove users recruiter role for this event
						removeRecruiter(recruiter._id, recruiter.fName);
						break;
					case flags[2]:
						//Remove this user from the system
						deleteRecruiter(recruiter._id, recruiter.fName);
						break;
				}
			});
		};
	}
]);

angular.module("admin").controller("actionModalCtrl", ["$scope", "$modalInstance", "flags", "recruiter",
	function($scope, $modalInstance, flags, recruiter) {
		/**
		* It is assumed `flags` is an array with 3 elements with the following order:
		* 		Cancel action
		* 		Remove user's role as recruiter for this event
		* 		Remove user from system
		*/
		$scope.flags = flags;
		$scope.recruiter = recruiter;
		$scope.cancel = true;					//Cancel removing recruiter
		$scope.selection = $scope.flags[0];		//What flag has been selected

		/**
		* Action to call whenever the modal is exited using any button.  If action is
		* set and evaluates to `$scope.cancel`, the cancel flag is returned.  Otherwise,
		* the value returned is obtained from `$scope.selection`.
		*
		* @param action - If the modal was cancelled/exited, this should be set to
		* $scope.cancel.  Otherwise, this should not be arg should not be set
		*/
		$scope.done = function(action) {
			var flag = action ? $scope.flags[0] : $scope.selection;

			$modalInstance.close(flag);
		};
	}
]);