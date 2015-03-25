'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */

var should = require('should'),
	mongoose = require('mongoose'),
 	http = require('http'),
 	superagent = require('superagent'),
 	Comment = mongoose.model('Comment'),
	Evnt = mongoose.model('Event'),
 	User = mongoose.model('User'),
 	config = require('../../config/config'),
 	request = require('supertest');

/**
 * Globals
 */
var comment1, comment2, event1, recruiter, badRecruiter, user, userAdmin;
var agent = superagent.agent();
var agentAdmin = superagent.agent();
var agentRecruiter = superagent.agent();
var agentBadRecruiter = superagent.agent();

function arraysEqual(array0,array1) {
    if (array0.length !== array1.length) return false;
    for (var i = 0; i<array0.length; i++) {
        if (array0[i] !== array1[i]) return false;
    }
    return true;
}

/**
 * Unit tests
 */
describe('Comment Route Integration Tests:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		User.remove(function() {
			Evnt.remove(function() {
				Comment.remove(function() {
					done();
				});				
			});
		});
	});

	before(function(done) {
		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
		var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

		event1 = new Evnt({
			name:  'testing123',
 			start_date: startDate,
 			end_date:  endDate,
 			location: 'UF',
 			schedule: 'www.google.com'
 		});

		recruiter = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee','recruiter'],
 			displayName: 'Full Name',
 			email: 'recruiter@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:true}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

		badRecruiter = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee','recruiter'],
 			displayName: 'Full Name',
 			email: 'badrecruiter@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:true, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

		user = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['attendee'],
 			displayName: 'Full Name',
 			email: 'anotheruser@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

		userAdmin = new User({
 			fName: 'Full',
 			lName: 'Name',
 			roles: ['admin'],
 			displayName: 'Full Name',
 			email: 'admin@test.com',
 			password: 'password',
 			status: [{event_id: event1._id, attending:false, recruiter:false}],
 			salt: 'abc123',
 			rank: [],
 			provider: 'local',
 			login_enabled: true
 		});

 		event1.save(function(err){
			if(err) throw err;
			badRecruiter.save(function(err) {
				if(err) throw err;
				recruiter.save(function(err){
					if(err) throw err;
					user.save(function(err){
						if (err) throw err;
						userAdmin.save(function(err){
							if(err) throw err;
							comment1 = new Comment({
								user_id: recruiter._id,
								event_id: event1._id,
								comment: "A comment",
								stream: 'recruiter'
							});
							comment2 = new Comment({
								user_id: user._id,
								event_id: event1._id,
								comment: "A comment",
								stream: 'social'
							});
							comment2.save(function(err){
								if(err) throw err;
								comment1.save(function(err){
									if(err) throw err;
									done();
								});
							});
						});
					});
				});
			});
		});
	});

 	it("should be able to access the main page from the testing mechanism", function(done) {
 		request('http://localhost:3001')
 			.get('/')
 			.expect(200,done);
 	});

 	it("should not be able to get the comment object when not signed in", function(done) {
		request('http://localhost:3001')
			.post('/comments/getCommentObj')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal("User is not logged in.");
				done();
			});
	});

	it("should not be able to get the social comments for an event when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/getSocialCommentsForEvent')
			.end(function(err, res) { 
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal("User is not logged in.");
				done();
			});
	});

	it("should not be able to get the recruiter comments for an event when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/getRecruiterCommentsForEvent')
			.end(function(err, res) { 
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal("User is not logged in.");
				done();
			});
	});

	it("should not be able to get the post social comments for an event when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/postCommentSocial')
			.send({comment:'c',event_id:event1._id,interests:['dogs'],user_id:user})
			.end(function(err, res) { 
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal("User is not logged in.");
				done();
			});
	});

	it("should not be able to get the post recruiter comments for an event when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/postCommentRecruiter')
			.send({comment:'c',event_id:event1._id,interests:['dogs'],user_id:recruiter})
			.end(function(err, res) { 
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal("User is not logged in.");
				done();
			});
	});

	it("should not be able to get the delete comments when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/delete') //Shouldnt matter what we send
			.end(function(err, res) { 
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal("User is not logged in.");
				done();
			});
	});
	
	it("should not be able to search by interests for a comment when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/searchByInterests')
			.send({event_id:event1._id,interest:'dogs'})
			.end(function(err, res) { 
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				res.body.message.should.be.equal("User is not logged in.");
				done();
			});
	});

	it("should not be able to upload recruiter comment image when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/uploadRecruiterImage')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				done();
			});
	});

	it("should not be able to upload social comment image when not signed in",function(done) {
		request('http://localhost:3001')
			.post('/comments/uploadSocialImage')
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				done();
			});
	});

 	it("should be able to sign in as a regular user", function(done) {
 		agent
 			.post('http://localhost:3001/auth/signin')
 			.send({email: user.email, password: 'password'})
 			.end(function(err,res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
       				done();
 			});
     	});

 	it("should be able to sign in as an admin", function(done) {
 		agentAdmin
 			.post('http://localhost:3001/auth/signin')
 			.send({email: userAdmin.email, password: 'password'})
 			.end(function(err,res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
       				done();
 			});
     	});

 	it("should be able to sign in as a recruiter", function(done) {
 		agentRecruiter
 			.post('http://localhost:3001/auth/signin')
 			.send({email: recruiter.email, password: 'password'})
 			.end(function(err,res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
       				done();
 			});
     	});

 	it("should be able to sign in as the bad (not-recruiting) recruiter", function(done) {
 		agentBadRecruiter
 			.post('http://localhost:3001/auth/signin')
 			.send({email: badRecruiter.email, password: 'password'})
 			.end(function(err,res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
       				done();
 			});
     	});

	it("should not be able to get a recruiter comment as a normal user",function(done) {
		agent
			.post('http://localhost:3001/comments/getCommentObj')
			.send({comment_id: comment1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				done();
			});
	});

	it("should not be able to get a recruiter comment if not recruiting for that event",function(done) {
		agentBadRecruiter
			.post('http://localhost:3001/comments/getCommentObj')
			.send({comment_id: comment1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.be.equal(401);
				res.body.should.have.property('message');
				done();
			});
	});

	it("should be able to get a recruiter comment always when admin",function(done) {
		agentAdmin
			.post('http://localhost:3001/comments/getCommentObj')
			.send({comment_id: comment1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
				res.body.should.have.property('_id');
				done();
			});
	});

	it("should be able to get a recruiter comment as an recruiter",function(done) {
		agentRecruiter
			.post('http://localhost:3001/comments/getCommentObj')
			.send({comment_id: comment1._id.toString()})
			.end(function(err, res) {
				should.not.exist(err);
				res.status.should.be.equal(200);
				res.body.should.have.property('_id');
				done();
			});
	});
	

	after(function(done) {
		User.remove(function(err) {
			if(err)
				return done(err);

			Evnt.remove(function(err) {
				if(err)
					return done(err);
				
				Comment.remove(function(err) {
					if(err)
						return done(err);

			 		done();
				});
			});
		});
	});
});
