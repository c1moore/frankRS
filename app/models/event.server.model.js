'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions
var dateMustBeAtLeastToday = function(start_date) {
	return (Date.parse(start_date) > new Date().getTime());
};
/*
var dateMustBeBeforeStart = function(end_date) {
	return (Date(start_date).getTime() < Date(end_date).getTime());
};*/

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
				type: String,
				validate: [dateMustBeAtLeastToday, 'Date must be at least today if not later'] //, contentsValidate, 'Start date is required.']
			},
			end_date: {
				type: String
				//validate: [dateMustBeBeforeStart, 'End date must not exceed the start date'] //, contentsValidate, 'End date is required.']
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

EventSchema.pre('validate', function(next) {
	if(Date.parse(this.contents.start_date) > Date.parse(this.contents.end_date)){
		this.invalidate('end_date','end date must be after start date');
	}	
	if(Date.parse(this.contents.end_date) < new Date().getTime()){
		this.invalidate('end_date','end date must not be in the past');
	}
	next();
});

EventSchema.pre('save', function(next) {
	if (this.contents.start_date) {
		this.contents.start_date=this.contents.start_date.toString();
	}
	if (this.contents.end_date) {
		this.contents.end_date=this.contents.end_date.toString();
	}
	next();
});

mongoose.model('Event', EventSchema);
