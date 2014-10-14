'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions
var dateMustBeAtLeastToday = function(start_date) {
	return (start_date > new Date().getTime());
};

var contentsValidate = function(property) {
	//return ((property.name && property.name.length) && (property.start_date && property.start_date.length && (property.start_date > new Date().getTime())) && (property.end_date && property.end_date.length) && (property.location && property.location.length));
	return ((property.name && property.name.length) && (property.location && property.location.length));
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
			},
			start_date: {
				type: Number
			},
			end_date: {
				type: Number
			},
			location: {
				type: String,
				trim: true
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
	if(this.contents.start_date > this.contents.end_date){
		this.invalidate('end_date','end date must be after start date');
	}	
	if(this.contents.end_date < new Date().getTime()){
		this.invalidate('end_date','end date must not be in the past');
	}
	if(this.contents.start_date < new Date().getTime()) {
		this.invalidate('start_date', 'Event must start later than now.');
	}
	if(isNaN(new Date(this.contents.end_date).getDate()) || isNaN(new Date(this.contents.start_date).getDate())) {
		this.invalidate('contents', 'Dates must be valid.');
	}
	next();
});

mongoose.model('Event', EventSchema);
