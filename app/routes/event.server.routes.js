'use strict';

//Routes to get info from Event, basic structure of this file stolen from Dan
var james_event_routes = require('../../app/controllers/event.routes.server.controller.js');

module.exports = function(app) {

	// Event Routes
	app.route('/events/enumerate').get(james_event_routes.getMyEvents);
	app.route('/events/getStartDate').get(james_event_routes.getStartDate);
	app.route('/events/getEndDate').get(james_event_routes.getEndDate);
	app.route('/events/getLocation').get(james_event_routes.getLocation);
	app.route('/events/getEventObj').get(james_event_routes.getEventObj);
	app.route('/events/getSchedule').get(james_event_routes.getSchedule);
	app.route('/events/enumerateAll').get(james_event_routes.getAllEvents);
	app.route('/events/getName').get(james_event_routes.getName);
	app.route('/events/setName').post(james_event_routes.setName);
	app.route('/events/setStartDate').post(james_event_routes.setStartDate);
	app.route('/events/setEndDate').post(james_event_routes.setEndDate);
	app.route('/events/setLocation').post(james_event_routes.setLocation);
	app.route('/events/setEventObj').post(james_event_routes.setEventObj);
	app.route('/events/setSchedule').post(james_event_routes.setSchedule);
	app.route('/events/delete').post(james_event_routes.delete);
	app.route('/events/create').post(james_event_routes.create);
	app.route('/events/user/allEvents').post(james_event_routes.recruiterStatus);
	app.route('/events/capacity').get(james_event_routes.getCapacity);
	app.route('/events/capacity').post(james_event_routes.setCapacity);
	app.route('/events/attending').get(james_event_routes.getAttending);
	app.route('/events/invited').get(james_event_routes.getInvited);
	app.route('/events/stats').get(james_event_routes.getStats);
	app.route('/events/inactivate').post(james_event_routes.makeInactive);
};
