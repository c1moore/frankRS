'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	idvalidator = require('mongoose-id-validator');

//Validation functions
var validateRequired = function(property) {
	return (property && property.length);
};


/**
 * Event Schema
 */
var CommentSchema = new Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		validate: [validateRequired, 'user_id is required.'],
		required: true
	},
	event_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Event',
		validate: [validateRequired, 'event_id is required.'],
		required: true
	},
	comment: {
		type: String,
		validate: [validateRequired, 'Comment body is required.'],
		required: true
	},
	stream: {
		type: String,
		enum: ['recruiter', 'social'],
		validate: [validateRequired, 'A comment stream type is required.'],
		required: true
	}
});

//ID validator
CommentSchema.plugin(idvalidator);

mongoose.model('Comment', CommentSchema);
