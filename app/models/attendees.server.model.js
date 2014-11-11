// 'use strict';

// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
// 	Schema = mongoose.Schema,
// 	idvalidator = require('mongoose-id-validator');

// //Validation functions
// var validateRequired = function(prop) {
// 	return (prop && prop.length);
// };

// var validateIds = function(prop) {
// 	return (prop.attendee && prop.attendee.length && prop.eventid && prop.eventid.length);
// };

// /**
//  * Recent attendees Schema
//  */
// var AttendeesSchema = new Schema({
// 	attendee : {
// 		type: Schema.Types.ObjectId,
// 		ref: 'User',
// 		validate: [validateRequired, 'User ID is required.']
// 	},
// 	eventid : {
// 		type: Schema.Types.ObjectId,
// 		ref: 'Event',
// 		validate: [validateRequired, 'Event ID is required.']
// 	},
// 	time : {
// 		type: Number,
// 		validate: [validateRequired, 'Registration time is required.']
// 	}
// });

// AttendeesSchema.index({attendee:1, eventid:1}, {unique: true});

// AttendeesSchema.plugin(idvalidator);

// mongoose.model('Attendees', AttendeesSchema);
