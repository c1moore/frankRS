'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions

var validateRequired = function(property) {
	return (property && property.length);
};

/**
 * Event Schema
 */
var EventSchema = new Schema({
	name: {
		type: String,
		trim: true,
		validate: [validateRequired, 'Name is required.']
	},
	start_date: {
		type: Number,
		validate: [validateRequired, 'Start date is required.']
	},
	end_date: {
		type: Number,
		validate: [validateRequired, 'End date is required.']
	},
	location: {
		type: String,
		trim: true,
		validate: [validateRequired, 'Location is required.']
	},
	schedule: {
		type: String,
		trim: true,
		default: 'No schedule specified'
	}
});

EventSchema.index({name:1}, {unique:true});

EventSchema.pre('validate', function(next) {
	if(this.start_date > this.end_date){
		this.invalidate('end_date','end date must be after start date');
	}	
	if(this.end_date < new Date().getTime()){
		this.invalidate('end_date','end date must not be in the past');
	}
	if(this.start_date < new Date().getTime()) {
		this.invalidate('start_date', 'Event must start later than now.');
	}
	if(isNaN(new Date(this.end_date).getDate()) || isNaN(new Date(this.start_date).getDate())) {
		this.invalidate('contents', 'Dates must be valid.');
	}
	next();
});

mongoose.model('Event', EventSchema);
