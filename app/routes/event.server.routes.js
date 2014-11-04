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

};
