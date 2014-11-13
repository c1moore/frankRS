'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto'),
	idvalidator = require('mongoose-id-validator');

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

/*
* A validation function to check if a required field that has no special needs has a value.
*/
var validateRequired = function(property) {
	return (property && property.length);
};

/*
* A Validation function for the status schema.  While this field is not required for the user to be saved, if the field is
* specified all three subfields must be specified.
*/
var validateOptional = function(property) {
	if(property && property.length)
		return (property.event_id && property.event_id.length && property.attending && property.attending.length && property.recruiter && property.recruiter.length);
	return true;
};

/*
* A Validation function for login_enabled.  Since it is a boolean value, we cannot rely on the validateRequired function.
*/
var validateLogin = function(enabled) {
	return (typeof enabled === 'boolean');
};

/*
* A Validation function for the roles array.  Since mongoose does not validate whether all roles specified are proper roles,
* this function confirms their validity and that a role is specified.
*/
var validateRole = function(property) {
	if(property.length === 0)
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

//Create schemas that will be used in arrays.  Based on loose research, this method seems the easiest and most efficient for arrays of objects.

/*
* This schema is used for attendeeList, inviteeList, and almostList.  All three of these lists require a user and event ID, which will be used to
* determined who the recruiter invited to the specified event and whether they are attending or not.
*/
var ListSchema = new Schema({
	user_id: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
	event_id: {type: mongoose.Schema.Types.ObjectId, ref:'Event'}
}, {_id:false});

//mongoose.model('List', ListSchema);
//var List = mongoose.model('List');
//List.ensureIndexes({user_id:1, event_id:1}, {sparse:true, unique:"User already a member of list for specified event."});
//ListSchema.index({user_id:1, event_id:1}, {sparse:true, unique:"User already a member of list for specified event."});

/*
* This schema is used for the status array in the User schema.  This list specifies all the events a certain user is invited to attend, whether or not
* the user is attending, and whether or not the user is a recruiter for this event (as opposed to just an attendee).
*/
var StatusSchema = new Schema({
	event_id: {type: mongoose.Schema.Types.ObjectId, ref:'Event'},
	attending: {type: Boolean},
	recruiter: {type:Boolean}
}, {_id:false, validate : [validateOptional, 'All fields of status required.']});

/*
* This schema is used for the recruiters' ranks.  For each event for which a user is recruiting, they will have a rank out of all of the recruiters for that
* event that is determined by the number of people they invited and the ones out of those invited who are actually attending.
*/
var RankSchema = new Schema({
	event_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
	place: {type: Number, min: 1}
}, {_id : false});

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
  		type: [StatusSchema]
  	},
  	/*List of people invited, but not registered to attend.*/
  	inviteeList: {
  		type: [ListSchema]
  	},
  	/*List of people attending the event.*/
  	attendeeList: {
  		type: [ListSchema]
  	},
  	/*List of people attending the event, but who accepted the invitation from another recruiter.*/
  	almostList: {
  		type: [ListSchema]
  	},
  	rank: {
  		type: [RankSchema]
  	},
  	/*If the user is invited, but not yet registered to attend they cannot login.*/
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

//Validate that ObjectIds reference actual IDs from other schemas.
ListSchema.plugin(idvalidator);
StatusSchema.plugin(idvalidator);
RankSchema.plugin(idvalidator);

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

mongoose.model('User', UserSchema);
