'use strict';

//Menu service used for managing  menus
angular.module('core').service('eventSelector', ['$http', '$location', 'cacheService',

	function($http, $location, cacheService) {
		var thisService = this;
		this.events = [];
		this.selectedEvent = "Select Event";
		this.disabled = false;
		this.numRecruiting = 0;
		this.postEventId = null;
		this.nresDisabled = false;
		this.recruiterEvent = true;

		var cache = cacheService;
		var keys = [];
		var put = function(key, value) {
			cache.setData(key,value);
		}

		console.log(cache);


		$http.get('/users/events').success(function(data) {
			thisService.events = data.status;
			for(var i=0; i<thisService.events.length; i++) {
				if(thisService.events[i].recruiter)
					thisService.numRecruiting++;
			}
			if(cache.getData('selectedEvent') != null && cache.getData('eventId') != null) {
				thisService.selectedEvent = cache.getData('selectedEvent');
				thisService.postEventId = cache.getData('eventId');
				thisService.recruiterEvent = cache.getData('recruiterEvent');
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
			thisService.recruiterEvent = event.recruiter;
			put('selectedEvent',event.event_id.name);
			put('eventId',event.event_id._id);
			put('recruiterEvent', thisService.recruiterEvent);
		};

		this.showDivider = function() {
			return ((thisService.numRecruiting > 0) && (thisService.events.length > thisService.numRecruiting));
		};

		this.toggleDisabledEvents = function() {
			thisService.nresDisabled = !thisService.nresDisabled;
		}

		this.hideEventSelector = function() {
			var path = $location.path();

			return (path === '/signin' || path === '/settings/profile' || path === '/settings/password');
		}
	}
]);