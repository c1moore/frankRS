'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users');
	//users2 = require('../../app/controllers/users/users.routes.server.controller.js');

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);
	app.route('/users/displayName').get(users.getDisplayName);
	app.route('/users/email').get(users.getEmail);
	app.route('/users').get(users.requiresLogin);
	app.route('/users/auth').post(users.hasAuthorization);
	app.route('/users/events').get(users.getUserEvents);

	// Setting up user removal routes
	app.route('/remove').post(users.deleteUser);
	app.route('/remove/Recruiter').post(users.removeRecruiterRole);
	app.route('/user/inactivate').post(users.removePermissions);

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

	//Setting admin routes
	app.route('/event/recruiters').get(users.getRecruiters);
	app.route('/event/users').post(users.getUsers);

	//Returning Leaderboard data
	app.route('/leaderboard/maintable').post(users.getLeaderboard);
	app.route('/leaderboard/recruiterinfo').get(users.getRecruiterInfo);
	app.route('/leaderboard/attendees').post(users.getAttendees);
	app.route('/leaderboard/invitees').post(users.getInvitees);
	app.route('/leaderboard/inviteetable').post(users.getInvitees);

	//Setting Recruiter specific routes
	app.route('/recruiter/events').get(users.getRecruiterEvents);
	app.route('/recruiter/attendees').post(users.getRecruiterAttendees);
	app.route('/recruiter/invitees').post(users.getRecruiterInvitees);
	app.route('/recruiter/almosts').post(users.getRecruiterAlmosts);

	//Setting invitation routes
	app.route('/invitation/send').post(users.sendInvitation);
	app.route('/invitation/accept').post(users.acceptInvitation);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);
};
