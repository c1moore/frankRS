'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions
var dateMustBeAtLeastToday = function(start_date) {
	return (start_date >= Date.getTime());
};

var dateMustBeBeforeStart = function(end_date) {
	return (this.start_date > end_date);
};

var contentsValidate = function(property) {
	return ((property.name && property.name.length) && (property.start_date && property.start_date.length) && (property.end_date && property.end_date.length) && (property.location && property.location.length));
	//return (property && property.length);

};

/**
 * Event Schema
 */
var EventSchema = new Schema({
	contents: {
		type: {
			name: {
				type: String,
				trim: true
				//validate: [contentsValidate, 'A name is required.']
			},
			start_date: {
				type: Date,
				validate: [dateMustBeAtLeastToday, 'Date must be at least today if not later'] //, contentsValidate, 'Start date is required.']
			},
			end_date: {
				type: Date,
				validate: [dateMustBeBeforeStart, 'End date must not exceed the start date'] //, contentsValidate, 'End date is required.']
			},
			location: {
				type: String,
				trim: true
				//validate: [contentsValidate, 'A location is required.']
			}
		},
		unique: true,
		validate: [contentsValidate, 'Name, start and end date, and location are all required.']
	},
	schedule: {
		type: String,
		trim: true,
		default: 'No schedule specified'
	}
});

mongoose.model('Event', EventSchema);
