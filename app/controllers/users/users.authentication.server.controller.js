'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	bufEqual = require('buffer-equal-constant-time'),
	config = require('../../../config/config'),
	crypto = require('crypto'),
	querystring = require('querystring'),
	https = require('https');

/**
 * Signup
 */
exports.signup = function(req, res) {
	if(!req.body.fName || !req.body.lName || !req.body.email || !req.body.password || !req.body['g-recaptcha-response'] || req.body.modify) {
		return res.status(400).send({message : "Incorrect information provided."});
	}

	//First, check the API key
	var api_key = new Buffer(config.Admin_API_Key),
		user_api = new Buffer(req.body.admin_pass);

	var post_data = querystring.stringify({
		secret: 	config.recaptcha.private_key,
		response: 	req.body['g-recaptcha-response']
	});

	var post_options = {
		hostname: 	'www.google.com',
		path: 		'/recaptcha/api/siteverify',
		method: 	'POST',
		port:		443,
		headers:	{
			'Content-Type':		'application/x-www-form-urlencoded',
			'Content-Length':	post_data.length
		}
	};

	var out_req = https.request(post_options, function(out_res) {
		var body = '';
		out_res.on('data', function(chunk) {
			body += chunk;
		});

		out_res.on('end', function() {
			body = JSON.parse(body);
			if(body.success) {
				//Assuming it is possible for Google to fail, let's add an extra check to make sure nobody is trying to inflitrate the system.
				if(bufEqual(api_key, user_api)) {
					// For security measurement we remove fields that could be used to comprise the system or to cheat from the req.body object
					delete req.body.roles;
					delete req.body.login_enabled;
					delete req.body.rank;
					delete req.body.almostList;
					delete req.body.attendeeList;
					delete req.body.inviteeList;
					delete req.body.status;
					delete req.body.admin_pass;
	
					// Init Variables
					var user = new User(req.body);
					var message = null;

					// Add missing user fields
					user.provider = 'local';
					user.displayName = user.lName + ', ' + user.fName;
					user.login_enabled = true;
	
					//Create an admin role from user
					user.roles = ["admin"];

					// Then save the user 
					user.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							return res.status(200).send();
						}
					});
				} else {
					//bufEqual is not truly constant time.  Let's sleep a random amount of time to confuse any possible attackers.
					//This method is not perfect, but it will add an extra layer of security and may work against some unsophisticated attackers.
					crypto.randomBytes(32, function(err, buf) {
						if(err) {
							return res.status(400).send({message : "Incorrect information provided."});
						}
	
						var timeouts = [];
						timeouts[0] = buf.readUInt8BE(0);
						timeouts[1] = buf.readUInt8BE(8);
						timeouts[2] = buf.readUInt8BE(16);
						timeouts[3] = buf.readUInt8BE(24);

						var timeoutMillis = Math.ceil(timeouts[0] + timeouts[1] + timeouts[2] + timeouts[3]);
						console.log(timeoutMillis);
						setTimeout(function() {
							return res.status(400).send({message : "Incorrect information provided."});
						}, timeoutMillis);
					});
				}
			} else {
				return res.status(400).send({message : "Incorrect information provided."});
			}
		});
	});

	out_req.on('error', function(err) {
		res.status(400).send({message : err});
	});

	out_req.write(post_data, 'utf8');
	out_req.end();
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;
			user.attendeeList = undefined;
			user.inviteeList = undefined;
			user.almostList = undefined;
			user.templates = undefined;

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
	return function(req, res, next) {
		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery, function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

					User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function(err) {
							return done(err, user);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/#!/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

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
	}
};
