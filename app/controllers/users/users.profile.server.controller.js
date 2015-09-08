'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove fields that could be used to comprise the system or to cheat from the req.body object
	delete req.body.roles;
	delete req.body.login_enabled;
	delete req.body.rank;
	delete req.body.almostList;
	delete req.body.attendeeList;
	delete req.body.inviteeList;
	delete req.body.status;
	delete req.body.provider;
	delete req.body.password;
	delete req.body.salt;
	delete req.body.providerData;
	delete req.body.additionalProvidersData;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.lName + ', ' + user.fName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.jsonp(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not logged in.'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.jsonp(req.user || null);
};