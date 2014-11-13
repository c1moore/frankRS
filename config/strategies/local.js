'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User');

module.exports = function() {
	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
		function(email, password, done) {
			User.findOne({
				email: email
			}, function(err, user) {
				if (err) {
					return done(err);
				} else if (!user || !user.authenticate(password)) {
					return done(null, false, {
						message: 'Email or password is unknown.'
					});
				} else if(!user.login_enabled) {
					return done(null, false, {
						message : 'User cannot log into account yet.  You must sign up to attend the event to which you were invited.'
					});
				} else {
					return done(null, user);
				}
			});
		}
	));
};
