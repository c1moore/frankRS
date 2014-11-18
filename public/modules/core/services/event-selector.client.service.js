'use strict';

//Menu service used for managing  menus
angular.module('core').service('eventSelector', ['$http', '$location',

	function($http, $location) {
		var thisService = this;
		this.events = [];
		this.selectedEvent = "Select Event";
		this.disabled = false;
		this.numRecruiting = 0;
		this.postEventId = null;
		this.nresDisabled = false;

		$http.get('/users/events').success(function(data) {
			thisService.events = data.status;
			for(var i=0; i<thisService.events.length; i++) {
				if(thisService.events[i].recruiter)
					thisService.numRecruiting++;
			}
		}).error(function(error, status) {
			if(status === 401) {
				thisService.selectedEvent = "Error";
				thisService.disabled = !thisService.disabled;
			}
			console.log(error);
		});

		this.changeEvent = function(event) {
			thisService.selectedEvent = event.event_id.name;
			thisService.postEventId = event.event_id._id;
		};

		this.showDivider = function() {
			return ((thisService.numRecruiting > 0) && (thisService.events.length > thisService.numRecruiting));
		};

		this.toggleDisabledEvents = function() {
			thisService.nresDisabled = !thisService.nresDisabled;
		}

		this.hideEventSelector = function() {
			return ($location.path() === '/signin');
		}
	}
]);