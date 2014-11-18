'use strict';

//Menu service used for managing  menus
angular.module('core').service('Event-Selector', ['$http',

	function($http) {
		var events = [];
		var selectedEvent = "Select Event";
		var disabled = false;

		$http.get('/users/events').success(function(data) {
			events = data;
		}).error(function(error, status) {
			if(status === 401) {
				selectedEvent = "Error";
				disabled = !disabled;
			}
			console.log(error);
		});

		var changeEvent = function(event) {
			selectedEvent = event.name;
			postEventId = event._id;
		};
	}
]);