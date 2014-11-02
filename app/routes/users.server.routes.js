'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	//james_user_routes = require('../../app/controllers/users/users.routes.server.controller.js'),
	james_event_routes = require('../../app/controllers/event.routes.server.controller.js');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users'),
	users2 = require('../../app/controllers/users/users.routes.server.controller.js');

	// Event Routes
	app.route('/events/enumerate').get(james_event_routes.getMyEvents);
	app.route('/events/getStartDate').get(james_event_routes.getStartDate);
	app.route('/events/getEndDate').get(james_event_routes.getEndDate);
	app.route('/events/getLocation').get(james_event_routes.getLocation);
	app.route('/events/getEventObj').get(james_event_routes.getEventObj);
	app.route('/events/getSchedule').get(james_event_routes.getSchedule);
	app.route('/events/enumerateAll').get(james_event_routes.getAllEvents);
	app.route('/events/getName').get(james_event_routes.getName);

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);
	app.route('/users/displayName').get(users2.getDisplayName);
	app.route('/users/email').get(users2.getEmail);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Setting the linkedin oauth routes
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));
	
	// Setting the github oauth routes
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(users.oauthCallback('github'));

	//Returning Leaderboard data
	app.route('/leaderboard/maintable').post(users2.getLeaderboard);
	app.route('/leaderboard/recruiterinfo').get(users2.getRecruiterInfo);
	app.route('/leaderboard/attendees').post(users2.getAttendees);
	app.route('/leaderboard/inviteetable').post(users2.getInvitees);

	//Setting Recruiter specific routes
	app.route('/recruiter/events').post(users2.getRecruiterEvents);
	app.route('/recruiter/attendees').post(users2.getRecruiterAttendees);
	app.route('/recruiter/invitees').post(users2.getRecruiterInvitees);
	app.route('/recruiter/almosts').post(users2.getRecruiterAlmosts);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
