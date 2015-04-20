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
			count: 	5,
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

		/**
		* To be called when the user wants to remove an attendee.  When called, the user is
		* prompted on whether the action should be completed.  If the user decides to
		* continue, removeAttendee will be called.
		*
		* @param attendee - Attendee object to delete
		*/
		$scope.removeAttendee = function(attendee) {
			var modalInstance = $modal.open({
				templateUrl: 	"modules/admin/views/attendeeWarn.client.view.html",
				controller: 	"attendeeActionModalCtrl",
				backdrop: 		true,
				backdropClass: 	"admin-backdrop",
				resolve: 		{
					attendee: function() {
						return attendee;
					}
				}
			});

			modalInstance.result.then(function(result) {
				result = parseInt(result);
				//Should return either 0 (do not delete) or 1 (delete).
				if(result) {
					deleteAttendee(attendee._id, attendee.fName);
				}
			});
		};
	}
]);

angular.module("admin").controller("attendeeActionModalCtrl", ["$scope", "$modalInstance", "attendee",
	function($scope, $modalInstance, attendee) {
		$scope.attendee = attendee;

		/**
		* Action to call whenever the modal is exited using any button.  If the user
		* accepts, 1 is returned; otherwise, 0 is returned.
		*
		* @param action - 1 if the user accepts or 0 if the user changed their mind
		*/
		$scope.done = function(action) {
			$modalInstance.close(action);
		};
	}
]);