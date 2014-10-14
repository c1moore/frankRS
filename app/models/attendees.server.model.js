'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	User = mongoose.model('User'),
	Event = mongoose.model('Event');

//Validation functions
var validateRequired = function(prop) {
	return (prop && prop.length);
};

/**
 * Recent attendees Schema
 */
var AttendeesSchema = new Schema({
	attendee : {
		type: Schema.ObjectID,
		validate: [validateRequired, "User's ID required."],
		unique: 'This user is already in this list.'
	},
	time : {
		type: Number,
		validate: [validateRequired, 'Registration time is required.']
	},
	eventid : {
		type: Schema.ObjectID,
		validate: [validateRequired, "Event ID required."]
	}
});

AttendeesSchema.pre('validate', function(next) {
	var query = User.findOne({'_id' : attendee});
	query.exec(function(err, result) {
		if(err || !result.fName)
			this.invalidate('attendee', 'User ID not found.');
	});

	var query = Event.findOne({'_id' : eventid});
	query.exec(function(err) {
		if(err || !result.contents.name)
			this.invalidate('eventid', 'Event ID not found.');
	});
	next();
});

mongoose.model('Attendees', AttendeesSchema);
