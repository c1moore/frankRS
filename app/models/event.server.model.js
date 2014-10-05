'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions
var dateMustBeAtLeastToday = function(start_date) {
	return (start_date >= Date.getTime())
};

var dateMustBeBeforeStart = function(end_date) {
	return (this.start_date > end_date);
};

var contentsValidate = function(contents) {
	if (!contents) return false;
	if (!name) return false;
	if (!start_date) return false;
	if (!end_date) return false;
	if (!location) return false;
	return true;
};

/**
 * Event Schema
 */
var EventSchema = new Schema({
	contents: {
		type: {
			name: {
				type: String,
				trim: true,
				unique: "Events must have a unique name",
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
			}
		},
		unique: true,
		validate: [contentsValidate, "The event contains empty fields"]
	},
	schedule: {
		type: String,
		trim: true,
		default: "No schedule specified"
	}
});

mongoose.model('Event', EventSchema);
