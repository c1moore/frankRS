'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

var validateRequired = function(property) {
	return (property && property.length);
};

var validateLogin = function(enabled) {
	return (typeof enabled === 'boolean');
};

var validateRole = function(property) {
	if(property.length == 0)
		return false;

	var valid = true;
	for(var i=0; i<property.length; i++) {
		if(!(property[i] === 'admin' || property[i] === 'recruiter' || property[i] === 'attendee')) {
			valid = false;
			break;
		}
	}
	return valid;
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	fName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address'],
		unique: "This email address is already being used."
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		validate: [validateRequired, 'Provider required.']
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['admin', 'recruiter', 'attendee']
		}],
		validate: [validateRole, 'A valid role is required.']
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
  	resetPasswordExpires: {
  		type: Date
  	},
  	status: {
  		type: [{
  			event_id: {type: mongoose.Schema.Types.ObjectId},
  			status: {type: Boolean}
  		}]
  	},
  	inviteeList: {
  		type: [{
  			user_id: {type: mongoose.Schema.Types.ObjectId},
  			event_id: {type: mongoose.Schema.Types.ObjectId}
  		}]
  	},
  	attendeeList: {
  		type: [{
  			user_id: {type: mongoose.Schema.Types.ObjectId},
  			event_id: {type: mongoose.Schema.Types.ObjectId}
  		}]
  	},
  	almostList: {
  		type: [{
  			user_id: {type: mongoose.Schema.Types.ObjectId},
  			event_id: {type: mongoose.Schema.Types.ObjectId}
  		}]
  	},
  	rank: {
  		type: Number,
  		min: 1
  	},
  	login_enabled: {
  		type: Boolean,
  		validate: [validateLogin, 'login_enabled is required.']
  	},
  	templates: {
  		type: [{
  			name: {type: String},
  			template: {type: String}
  		}]
  	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
/**UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};**/

mongoose.model('User', UserSchema);
