'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions
var ensureNotZeroLength = function(property) {
	return (property.length!==0);
};

/**
 * Event Schema
 */
var EventSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: "A name is required",
		default: '',
		validate: [ensureNotZeroLength, 'Please fill in your first name']
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [ensureNotZeroLength, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	}
});

mongoose.model('Event', EventSchema);
