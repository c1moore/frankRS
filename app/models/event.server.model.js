'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions
var dateMustBeAtLeastToday = function(start_date) {
	return (start_date >= Date.now);
};

var dateMustBeBeforeStart = function(end_date) {
	return (this.start_date > end_Date);
};

/**
 * Event Schema
 */
var EventSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: "A name is required"
	},
	start_date: {
		type: Date,
		required: "A start date is required",
		validate: [dateMustBeAtLeastToday, 'Date must be at least today if not later']
	},
	end_date: {
		type: Date,
		required: "An end date is required",
		validate: [dateMustBeBeforeStart, 'End date must not exceed the start date']
	},
	location: {
		type: String,
		trim: true,
		required: "The event must have a location"
	},
	schedule: {
		type: String,
		trim: true,
		default: "No schedule specified"
	}
});

mongoose.model('Event', EventSchema);
