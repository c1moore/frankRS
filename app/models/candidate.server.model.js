'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	idvalidator = require('mongoose-id-validator'),
	Schema = mongoose.Schema;

	/**
 * A Validation function for local strategy properties
 */

var validateLocalStrategyProperty = function(property) {
	return (property && property.length);
};

var eventsArray = new Schema({
	event_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
	accepted: {type: Boolean, default: 'false'},
	status: {type: String, enum: ['volunteer','invited','accepted'], default: 'volunteer'}
}, {_id:false});

var CandidateSchema = new Schema({
	fName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
		//required: 'First name required'
	},
	lName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
		//required: 'Last name required'
	},
	email: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address'],
		unique: 'email is already registered'
	},
	events: {
		type: [eventsArray]
	},
	note: {
		type: String,
		default: ''
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}


});

eventsArray.plugin(idvalidator);

CandidateSchema.methods.CreateAcceptKey = function() {
	    var chars = "01@2345$6789-ABCDEF+GHIJK=LMNO*PQRSTU#VWXT+Zabcdefghiklmnopqrstuvwxyz"; 
        var randomstring = ''; 
        var string_length = 100;
        for (var i=0; i<string_length; i++) { 
                var rnum = Math.floor(Math.random() * chars.length); 
                randomstring += chars.substring(rnum,rnum+1); 
        }
        return randomstring;
};

mongoose.model('Candidate', CandidateSchema);