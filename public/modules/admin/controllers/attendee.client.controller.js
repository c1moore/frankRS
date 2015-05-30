'use strict';

angular.module('admin').controller('adminAttendeesController', ['$scope', 'ngTableParams', '$http', '$filter', 'eventSelector', '$modal',
	function($scope, ngTableParams, $http, $filter, eventSelector, $modal) {
		$scope.attendees = [];			//Array of attendees (user objects).
		$scope.isEventSelected = eventSelector.postEventId ? true : false;		//Is an event selected?
		$scope.tabErr = false;			//Was there an error obtaining attendees from backend?

		//When a new event is selected, update isEventSelected and attendees.
		$scope.$watch(function() {
			return eventSelector.postEventId;
		}, function() {
			$scope.isEventSelected = eventSelector.postEventId ? true : false;

			if($scope.isEventSelected) {
				getAttendees();
			}
		});

		//Obtain all users for this event from the backend.
		var getAttendees = function() {
			$scope.tabErr = false;
			$http.post('/event/users', {event_id : eventSelector.postEventId}).success(function(res) {
				$scope.attendees = res;

				$scope.attendeeTableParams.reload();
			}).error(function(res, status) {
				if(status === 400) {
					$scope.tabErr = res.message;
				}
			});
		};

		//Setup ng-table
		$scope.attendeeTableParams = new ngTableParams({
			page: 	1,
			count: 	10,
			filter: {
				displayName: 	''
			},
			sorting: {
				displayName: 	'asc'
			}
		}, {
			getData: function($defer, params) {
				var filteredData = params.filter() ? $filter('filter')($scope.attendees, params.filter()) : $scope.attendees;
				var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.attendees;

				params.total(orderedData.length);
				$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
			}
		});

		//Delete the attendee's account.
		var deleteAttendee = function(aid, aname) {
			$http.post("/remove", {user_id : aid}).success(function(res) {
				getAttendees();
			}).error(function(res, status) {
				$window.alert("There was an error deleting " + aname + "'s account.\n\n" + res.message);
				getAttendees();
			});
		};

		//Remove attendee's permissions for selected event.
		var removeEventPermissions = function(aid, aname) {
			$http.post('/user/inactivate', {user_id : aid, event_id : eventSelector.postEventId}).success(function(res) {
				getAttendees();
			}).error(function(res, status) {
				$window.alert("There was an error removing permissions for " + aname + ".\n\n" + res.message);
				getAttendees();
			});
		};

		//Remove attendee's permissions for selected event.
		var removeAllPermissions = function(aid, aname) {
			$http.post('/user/inactivate/all', {user_id : aid}).success(function(res) {
				getAttendees();
			}).error(function(res, status) {
				$window.alert("There was an error removing permissions for " + aname + ".\n\n" + res.message);
				getAttendees();
			});
		};

		/**
		* To be called when the user wants to completely delete an attendee.  The user will be
		* prompted to confirm this action should be completed.
		*
		* @param attendee - Attendee object to delete
		*/
		$scope.deleteAttendee = function(attendee) {
			var modalInstance = $modal.open({
				templateUrl: 	"modules/admin/views/attendee-warn-delete.client.view.html",
				controller: 	"attendeeDeleteModalCtrl",
				backdrop: 		true,
				backdropClass: 	"admin-backdrop",
				resolve: 		{
					attendee: 	function() {
						return attendee;
					}
				}
			});

			modalInstance.result.then(function(result) {
				if(result) {
					deleteAttendee(attendee._id, attendee.fName + ' ' + attendee.lName);
				}
			});
		};


		/**
		* To be called when the user wants to remove an attendee.  When called, the user is
		* prompted on whether the action should be completed.  If the user decides to
		* continue, removeAttendee will be called.
		*
		* @param attendee - Attendee object to delete
		*/
		$scope.removeAttendee = function(attendee) {
			/**
			* Flags to represent what action should be taken.  The flags have the
			* following meanings:
			* 		0 - Take no action (cancel)
			* 		1 - Remove the user's permissions for only the selected event
			* 		2 - Remove the user's permissions for all events
			*
			* These flags are always assumed to stay in this order (i.e. cancel is first,
			* remove role is second, and remove user is last).
			*/
			var actionFlags = [0, 1, 2];

			var modalInstance = $modal.open({
				templateUrl: 	"modules/admin/views/attendee-warn-inactive.client.view.html",
				controller: 	"attendeeActionModalCtrl",
				backdrop: 		true,
				backdropClass: 	"admin-backdrop",
				resolve: 		{
					flags: function() {
						return actionFlags;
					},
					attendee: function() {
						return attendee;
					}
				}
			});

			modalInstance.result.then(function(result) {
				result = parseInt(result, 10);
				
				//Do the action specified by the returned flag.
				switch(result) {
					case actionFlags[0]:
						//Do nothing
						break;
					case actionFlags[1]:
						//Remove user's permissions for this event.
						removeEventPermissions(attendee._id, attendee.fName);
						break;
					case actionFlags[2]:
						//Remove user's permissions for all events.
						removeAllPermissions(attendee._id, attendee.fName);
						break;
				}
			});
		};
	}
]);

angular.module("admin").controller("attendeeActionModalCtrl", ["$scope", "$modalInstance", "attendee", "flags", "eventSelector",
	function($scope, $modalInstance, attendee, flags, eventSelector) {
		$scope.attendee = attendee;
		$scope.event = eventSelector.selectedEvent;
		$scope.flags = flags;
		$scope.selection = flags[0];

		/**
		* Action to call whenever the modal is exited using any button.  If the user
		* accepts, whatever action they chose is returned as specified by the flags;
		* otherwise, 0 for cancel is returned.
		*
		* @param action - 1 if the user accepts or 0 if the user changed their mind
		*/
		$scope.done = function(action) {
			action = parseInt(action, 10);
			var flag = action ? $scope.selection : $scope.flags[0];

			$modalInstance.close(flag);
		};
	}
]);

angular.module("admin").controller("attendeeDeleteModalCtrl", ["$scope", "$modalInstance", "attendee",
	function($scope, $modalInstance, attendee) {
		$scope.attendee = attendee;

		$scope.done = function(action) {
			action = parseInt(action, 10);
			if(action) {
				$modalInstance.close(true);
			} else {
				$modalInstance.close(false);
			}
		}
	}
]);