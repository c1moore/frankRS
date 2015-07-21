'user strict';

/**
* Module dependencies.
*/
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Types = Schema.Types,
	idvalidator = require('mongoose-id-validator');

/**
* Validation function for required properties.
*/
var validateRequiredProperty = function(property) {
	return (property && property.length);
};

/**
* Email Schema - we will use emails instead of the user's _id since some emails
* may go to someone who is not a user in the system.
*/
var EmailSchema = new Schema({
	to: {
		type: 		String,
		trim: 		true,
		validate: 	[validateRequiredProperty, 'Please fill in your email'],
		match: 		[/.+\@.+\..+/, 'Please fill a valid email address'],
		required: 	true
	},
	from: {
		type: 		String,
		trim: 		true,
		validate: 	[validateRequiredProperty, 'Please fill in your email'],
		match: 		[/.+\@.+\..+/, 'Please fill a valid email address'],
		required: 	true
	},
	subject: {
		type: 		String,
		trim: 		true,
		default: 	''
	},
	message: {
		type: 		String,
		trim: 		true,
		validate: 	[validateRequiredProperty, 'Message body required'],
		required: 	true
	},
	read: {
		type: 		Boolean,
		default: 	false,
		required: 	true
	},
	event_id: {
		type: 		Types.ObjectId,
		ref: 		'Event',
		required: 	true
	}
});

//Use idvalidator to make sure event_id references an existing event in the db.
EmailSchema.plugin(idvalidator);

mongoose.model('Email', EmailSchema);

exports = EmailSchema;