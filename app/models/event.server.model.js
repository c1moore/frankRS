'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Validation functions

var validateRequired = function(property) {
	if(property === 0)
		return property.toString().length;
	
	return (property && property.toString().length);
};

/**
 * Event Schema
 */
var EventSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true,
		validate: [validateRequired, 'Name is required.']
	},
	start_date: {
		type: Number,
		required: true,
		validate: [validateRequired, 'Start date is required.']
	},
	end_date: {
		type: Number,
		required: true,
		validate: [validateRequired, 'End date is required.']
	},
	location: {
		type: String,
		trim: true,
		required: true,
		validate: [validateRequired, 'Location is required.']
	},
	schedule: {
		type: String,
		trim: true,
		default: 'No schedule specified'
	},
	capacity: {
		type: Number,
		min: 0,
		required: true,
		validate: [validateRequired, 'Capacity is required.']
	},
	attending: {
		type: Number,
		min: 0,
		default: 0,
		required: true
	},
	invited: {
		type: Number,
		min: 0,
		default: 0,
		required: true
	},
	active: {
		type: Boolean,
		default: true,
		required: true
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

exports = EventSchema;
