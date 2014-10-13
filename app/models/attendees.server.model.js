'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	User = mongoose.model('User');

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
	}
});

AttendeesSchema.pre('validate', function(next) {
	var query = User.findOne({'_id' : attendee});
	query.exec(function(err) {
		if(err)
			this.invalidate('attendee', 'User ID not found.');
	});
	next();
});

AttendeesSchema.pre('save', function(next) {
	Attendees.count({}, function(err, result) {
		if(result > 10) {
			var query = Attendees.findOne({});
			query.sort({'time' : 'desc'});
			query.remove();
			query.exec();
		}
	});
});

mongoose.model('Attendees', AttendeesSchema);
