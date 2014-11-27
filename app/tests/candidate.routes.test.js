 'use strict';

 /*jshint expr:true */

 /**
	* Module dependencies.
	*/
	var should = require('should'),
	mongoose = require('mongoose'),
	http = require('http'),
	superagent=require('superagent'),
	agent=require('superagent'),
	Candidate = mongoose.model('Candidate'),
	User = mongoose.model('User'),
	Event = mongoose.model('Event'),

	config = require('../../config/config'),
	request = require('supertest');

 /**
	* Globals
	*/
	var candidate1,candidate3, user, user1,acceptedCandidate,attendee,attendee1,attendee3,attendee4,guest1,recruiter,recruiter1,event1,event2,event3,event4,tempNewCandidate;

	function arraysEqual(array0,array1) {
		if (array0.length !== array1.length) return false;
		for (var i = 0; i<array0.length; i++) {
			if (array0[i] !== array1[i]) return false;
		}
		return true;
	}

	describe('Candidate Route Integration Tests:', function() {

		before(function(done){
			event1 = new Event({
				name:  'testing1231',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			event2 = new Event({
				name:  'testing1232',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'SFCC',
					schedule: 'www.google.com'
				});
			event3 = new Event({
				name:  'testing1233',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'Orlando',
					schedule: 'www.google.com'
				});
			event4 = new Event({
				name:  'testing1234',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'Tampa',
					schedule: 'www.google.com'
				});

			event1.save(function() {
				event2.save(function() {
					event3.save(function(err){
						event4.save(function(err){
					//	console.log(err);
					user = new User({
						fName: 'Test',
						lName: 'ing',
						roles: ['admin'],
						email: 'test@test.com',
						password: 'password',
						login_enabled: true

					});


					attendee = new User({
						fName: 'attendee',
						lName: 'Testing',
						roles: ['attendee'],
						email: 'test1234@test.com',
						status: [{event_id: event2._id, attending: false, recruiter: false}],
						password: 'password',
						login_enabled: true

					});

					attendee3 = new User({
						fName: 'John',
						lName: 'Doe',
						roles: ['attendee'],
						email: 'test321@test.com',
						status: [{event_id: event2._id, attending: false, recruiter: false}],
						password: 'password',
						login_enabled: true

					});

					candidate3 = new Candidate({
						fName : 'John',
						lName : 'Doe',
						email : 'test321@test.com',
						//status : 'volunteer',
						events: [{event_id:event2._id,accepted:true,status:'volunteer'}],
						note : 'this is a test',
						user_id: attendee3._id
					});
					acceptedCandidate = new Candidate({
						fName : 'Jane',
						lName : 'Doe',
						email : 'jDoe@test.com',
						events: [{event_id:event2._id,accepted:true,status:'volunteer'}],
						note : 'this is a test'

					});
					recruiter = new User({
						fName: 'attendee',
						lName: 'Testing',
						roles: ['recruiter'],
						email: 'test12@test.com',
						password: 'password',
						login_enabled: true
					});

					candidate1 = new Candidate({
						fName : 'Full',
						lName : 'Name',
						email : 'test@test.com',
						//status : 'volunteer',
						events: [{event_id: event1._id, accepted: false,status: 'volunteer'},{event_id:event2._id,accepted:false,status:'volunteer'}],
						note : 'this is a test',
						user_id: attendee._id
					});

					guest1=agent.agent();
					acceptedCandidate.save(function(err,res){


					candidate3.save(function(err,res){
						//console.log(err);
			
							attendee3.save(function(err,res){
							attendee4 = agent.agent();
							attendee4
							.post('http://localhost:3001/auth/signin')
							.send({'email': 'test321@test.com', 'password': 'password'})
							.end(function (err, res) {

							});


					recruiter.save(function(err,res){
						recruiter1 = agent.agent();
						recruiter1
						.post('http://localhost:3001/auth/signin')
						.send({'email': 'test12@test.com', 'password':'password'})
						.end(function(err,res){

						});

						attendee.save(function(err, res) {
							attendee1 = agent.agent();
							attendee1
							.post('http://localhost:3001/auth/signin')
							.send({'email': 'test1234@test.com', 'password': 'password'})
							.end(function (err, res) {
								
							});


							user.save(function(err, res) {
								user1 = superagent.agent();
								user1
								.post('http://localhost:3001/auth/signin')
								.send({'email': user.email, 'password': 'password'})
								.end(function (err, res) {
									done();
									});
								});
							});
							});
					});
						});
					});
				});
			});
		});
	});

});

 it("should save the user.", function(done) {
 	var query = User.findOne({"email" : user.email});
 	query.exec(function(err, res) {
 		done(err);
 	});
 });

 it("should be able to access the main page from the candidate route testing mechanism", function(done) {
 	request('http://localhost:3001')
 	.post('/')
 	.expect(200);
 	done();
 });




 describe('Admin route tests:', function() {

 	describe('Obtain all candidates:', function() {
 		it("should return all of the candidates in the db.", function(done) {
 			candidate1.save(function(err) {
 				user1
 					.post('http://localhost:3001/candidate/getCandidates')
 					.end(function(err, res) {
 						should.not.exist(err);
 						res.status.should.equal(200);
 						res.body.length.should.equal(3);
 						done();
 					});
 			});
 		});

 		it("should return an error when the user is a recruiter.", function(done) {
 			recruiter1
 				.post('http://localhost:3001/candidate/getCandidates')
 				.end(function(err, res) {
 					should.not.exist(err);
 					res.status.should.equal(401);
 					res.body.message.should.equal("User does not have permission.");
 					done();
 				});
 		});

 		it("should return an error when the user is an attendee.", function(done) {
 			attendee1
 				.post('http://localhost:3001/candidate/getCandidates')
 				.end(function(err, res) {
 					should.not.exist(err);
 					res.status.should.equal(401);
 					res.body.message.should.equal("User does not have permission.");
 					done();
 				});
 		});

 		it("should return an error when the user is not logged in.", function(done) {
 			guest1
 				.post('http://localhost:3001/candidate/getCandidates')
 				.end(function(err, res) {
 					should.not.exist(err);
 					res.status.should.equal(401);
 					res.body.message.should.equal("User is not logged in.");
 					done();
 				});
 		});
 	});

 	it("admin should be able to get the candidate first name", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getfName')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('fName');
 				res.body.fName.should.be.equal('Full');
 				done();
 			});
 		});
 	});


 	it("admin should be able to get the candidate last name", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getlName')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('lName');
 				res.body.lName.should.be.equal('Name');
 				done();
 			});
 		});
 	});


 	it("admin should be able to get the candidate email", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getEmail')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('email');
 				res.body.email.should.be.equal('test@test.com');
 				done();
 			});
 		});
 	});
/* 	it("admin should be able to get the candidate status", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getStatus')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('status');
 				res.body.status.should.be.equal('volunteer');
 				done();
 			});
 		});
 	});

*/
 	it("admin should be able to get the candidate EventsID", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getEvents')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 			//console.log(res.body);
 			res.status.should.equal(200);
 			res.body.should.have.property('events');
 			(res.body.events[0].event_id.name.toString()).should.be.equal(event1.name);
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[0].status.toString()).should.be.equal('volunteer');
 			(res.body.events[1].event_id.name.toString()).should.be.equal(event2.name);
 			(res.body.events[1].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].status.toString()).should.be.equal('volunteer');
 			done();
 		});
 		});
 	});

 	it("admin should be able to get the candidate note", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getNote')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('note');
 				res.body.note.should.be.equal('this is a test');
 				done();
 			});
 		});
 	});

 	it("admin should be able to get the candidate getUser_id", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getUser_id')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('user_id');
 				res.body.user_id.should.be.equal((attendee._id).toString());
 				done();
 			});
 		});
 	});


 	it("admin should be able to set the candidate first name", function(done) {
 		user1
 		.post('http://localhost:3001/candidate/setfName')
 		.send({candidate_id: candidate1._id,fName:'dan'})
 		.end(function(err,res) {
 			if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getfName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('dan');
						done();
					});
		});

 	});
 	it("admin should be able to set the candidate last name", function(done) {
 		user1
 		.post('http://localhost:3001/candidate/setlName')
 		.send({candidate_id: candidate1._id,lName:'pickle'})
 		.end(function(err,res) {
 			if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getlName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('lName');
						res1.body.lName.should.be.equal('pickle');
						done();
					});
		});

 	});

 	it("admin should be able to set the candidate email", function(done) {
 		user1
 		.post('http://localhost:3001/candidate/setEmail')
 		.send({candidate_id: candidate1._id,email:'DanP@test.com'})
 		.end(function(err,res) {
 			if (err) throw err;
 			//console.log(res.body);
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getEmail')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('email');
						res1.body.email.should.be.equal('DanP@test.com');
						done();
					});
		});

 	});
 	it("admin should be able to set the candidate status", function(done) {
 		user1
 	.post('http://localhost:3001/candidate/setStatus')
 	.send({'candidate_id' : candidate1._id, 'event_id': event2._id, 'status': 'accepted'})
 	.end(function(err,res) {
 		if (err) throw err;
 		//console.log(res.body);
 		res.status.should.equal(200);

 		candidate1.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getEvents')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				//console.log("\n");
 				//console.log(res.body);
 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].event_id.name.toString()).should.be.equal(event1.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('false');
 				(res.body.events[0].status.toString()).should.be.equal('volunteer');
 				(res.body.events[1].event_id.name.toString()).should.be.equal(event2.name);
 				(res.body.events[1].accepted.toString()).should.be.equal('false');
 				(res.body.events[1].status.toString()).should.be.equal('accepted');
 				done();
 			});
 		});
 	});
 });

 	it("admin should be able to add(set) candidate event", function(done) {
 		user1
 		.post('http://localhost:3001/candidate/addEvent')
 		.send({candidate_id: candidate1._id, event_id: event3._id})
 		.end(function(err,res) {
 			if (err) throw err;

 			console.log(res.body);

 			res.status.should.equal(200);

 			user1
 			.post('http://localhost:3001/candidate/getEvents')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].event_id.name.toString()).should.be.equal(event1.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('false');
 				(res.body.events[1].event_id.name.toString()).should.be.equal(event2.name);
 				(res.body.events[1].accepted.toString()).should.be.equal('false');
 				(res.body.events[2].event_id.name.toString()).should.be.equal(event3.name);
 				(res.body.events[2].accepted.toString()).should.be.equal('false');

 				done();
 			});
 		});
 	});

 it("admin should be able to set candidate event accepted field", function(done) {
 	candidate1.save(function(err) {
	 	user1
	 		.post('http://localhost:3001/candidate/setAccepted')
	 		.send({'candidate_id' : candidate1._id, 'event_id': event2._id, 'accepted': true})
	 		.end(function(err,res) {
		 		if (err) throw err;

		 		res.status.should.equal(200);
		 		console.log(res.body);

 				user1
	 				.post('http://localhost:3001/candidate/getEvents')
	 				.send({candidate_id: candidate1._id})
	 				.end(function(err,res) {
		 				if (err) throw err;

	 					res.status.should.equal(200);
	 					res.body.should.have.property('events');

		 				(res.body.events[0].event_id.name.toString()).should.be.equal(event1.name);
	 					(res.body.events[0].accepted.toString()).should.be.equal('false');
	 					(res.body.events[1].event_id.name.toString()).should.be.equal(event2.name);
	 					(res.body.events[1].accepted.toString()).should.be.equal('true');
	 					(res.body.events[2].event_id.name.toString()).should.be.equal(event3.name);
	 					(res.body.events[2].accepted.toString()).should.be.equal('false');

	 					done();
	 				});
 			});
 	});
 });

  it('Should have changed the attendee user to a recruiter for the roles and status fields',function(done){
  	attendee1
  	.get('http://localhost:3001/recruiter/events')
  	//.send({'user' : attendee._id})
  	.end(function(err,res){
  		if (err) throw err;
  		//console.log(res.body);
  		//console.log(err);
  		res.status.should.equal(200);
  		//res.body.should.have.property('event_id');
  		(res.body[0].recruiter.toString()).should.equal('true');
  		(res.body[0].event_id._id.toString()).should.equal(event2._id.toString());

  		done();
  	});
  });


it("admin should be able to set candidate event status field", function(done) {
 	user1
 	.post('http://localhost:3001/candidate/setStatus')
 	.send({'candidate_id' : candidate3._id, 'event_id': event2._id, 'status': 'accepted'})
 	.end(function(err,res) {
 		if (err) throw err;
 		//console.log(res.body);
 		res.status.should.equal(200);

 		candidate3.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getEvents')
 			.send({candidate_id: candidate3._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				//console.log(res.body);

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].event_id.name.toString()).should.be.equal(event2.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('true');
 				 (res.body.events[0].status.toString()).should.be.equal('accepted');

 				 				done();
 			});
 		});
 	});
 });

  it('Should have changed the attendee user to a recruiter for the whan status is the last to be changed to accepted',function(done){
  	attendee4
  	.get('http://localhost:3001/recruiter/events')
  	//.send({'user' : attendee._id})
  	.end(function(err,res){
  		if (err) throw err;
  		res.status.should.equal(200);
  		//res.body.should.have.property('event_id');
  		(res.body[0].recruiter.toString()).should.equal('true');
  		(res.body[0].event_id._id.toString()).should.equal(event2._id.toString());

  		done();
  	});
  });


   it("Should automatically create a new user when a candidate accepts and is accepted to become a recruiter if they are not already a user", function(done) {
 	user1
 	.post('http://localhost:3001/candidate/setStatus')
 	.send({'candidate_id' : acceptedCandidate._id, 'event_id': event2._id, 'status': 'accepted'})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(200);

 		acceptedCandidate.save(function(err) {
 			user1
 			.post('http://localhost:3001/candidate/getEvents')
 			.send({candidate_id: acceptedCandidate._id})
 			.end(function(err,res) {
 				if (err) throw err;

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].event_id.name.toString()).should.be.equal(event2.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('true');
 				(res.body.events[0].status.toString()).should.be.equal('accepted');

 				var query = Candidate.findOne({'email': acceptedCandidate.email});;
 				query.exec(function(err,result){
 					(result.email === undefined).should.be.false;
 					result.email.should.equal(acceptedCandidate.email);
 					done();
 				});
  			});
 		});
 	});
 });


 it("admin should be able to set the candidate's note", function(done) {
 	user1
 	.post('http://localhost:3001/candidate/setNote')
 	.send({candidate_id: candidate1._id,note:'I have changed the candidate note'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(200);

 		user1
 		.post('http://localhost:3001/candidate/getNote')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res1) {
 			if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('note');
						res1.body.note.should.be.equal('I have changed the candidate note');
						done();
					});
 	});

 });
 it("admin should be able to set a new candidate", function(done) {
 	user1
	 	.post('http://localhost:3001/candidate/setCandidate')
	 	.send({fName: 'John', lName: 'Smith', email:'JohnS@test.com', events : [event1._id]})
	 	.end(function(err,res) {
			console.log(res.body);
			console.log(res.status);
	 		if (err) throw err;
			res.status.should.equal(200);

			Candidate.findOne({email : 'JohnS@test.com'}, function(err, newCandidate) {
				tempNewCandidate = newCandidate;
				if(err) {
					throw err;
				}
				user1
					.post('http://localhost:3001/candidate/getfName')
					.send({candidate_id: newCandidate._id})
					.end(function(err,res1) {
						if (err) throw err;

						console.log(res1.body);
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('John');
						done();
					});
			});
		});

 });
 it("admin should be able to delete a candidate", function(done) {
 	user1
 	.post('http://localhost:3001/candidate/deleteCandidate')
 	.send({candidate_id: tempNewCandidate._id})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(200);			
 		done();
 	});



 });

});


/* it("should save the attendee user.", function(done) {
 	var query = User.findOne({"email" : attendee.email});
 	query.exec(function(err, res) {
 		done(err);
 	});
});*/

  describe('Attendee route tests:', function() {

 it("attendee should be able to volunteer as a new candidate", function(done) {
 	attendee1
 	.post('http://localhost:3001/candidate/setCandidate')
 	.send({events: [event1._id]})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(200);
 		tempNewCandidate=res.body;
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getfName')
			.send({candidate_id: tempNewCandidate._id})
			.end(function(err,res1) {
				if (err) throw err;
						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('attendee');


						user1
						.post('http://localhost:3001/candidate/deleteCandidate')
						.send({candidate_id: tempNewCandidate._id})
						.end(function(err,res) {
							if (err) throw err;
							res.status.should.equal(200);			
							done();
						});				
					});
		});

 });

 it("attendees should NOT be able to get the candidate first name", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.post('http://localhost:3001/candidate/getfName')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.have.should.not.have.property('fName');
 			//res.body.fName.should.be.equal('Full');
 			done();
 		});
 	});
 });


 it("attendees should NOT be able to get the candidate last name", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.post('http://localhost:3001/candidate/getlName')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('lName');
 			//res.body.lName.should.be.equal('Name');
 			done();
 		});
 	});
 });


 it("attendees should NOT be able to get the candidate email", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.post('http://localhost:3001/candidate/getEmail')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('email');
 		//	res.body.email.should.be.equal('test@test.com');
 		done();
 	});
 	});
 });
 /*it("attendees should NOT be able to get the candidate status", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.post('http://localhost:3001/candidate/getStatus')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('status');
 			//res.body.status.should.be.equal('volunteer');
 			done();
 		});
 	});
 });
*/


 it("attendees should NOT be able to get the candidate EventsID", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.post('http://localhost:3001/candidate/getEvents')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			//console.log(res.body);
 			res.status.should.equal(401);
 			res.body.should.not.have.property('events');
 			/*(res.body.events[0].event_id.toString()).should.be.equal(event1._id.toString());
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].event_id.toString()).should.be.equal(event2._id.toString());
 			(res.body.events[1].accepted.toString()).should.be.equal('false');*/
 			done();
 		});
 	});
 });
 it("attendees should NOT be able to get the candidate note", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.post('http://localhost:3001/candidate/getNote')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('note');
 			//res.body.note.should.be.equal('this is a test');
 			done();
 		});
 	});
 });

 it("attendees should NOT be able to get the candidate getUser_id", function(done) {
 		candidate1.save(function(err) {
 			attendee1
 			.post('http://localhost:3001/candidate/getUser_id')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(401);
 				res.body.should.not.have.property('user_id');
 				//res.body.user_id.should.be.equal((attendee._id).toString());
 				done();
 			});
 		});
 	});

 it("attendees should NOT be able to set the candidate first name", function(done) {
 	attendee1
 	.post('http://localhost:3001/candidate/setfName')
 	.send({candidate_id: candidate1._id,fName:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getfName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('dan');
						done();
					});
		});

 });
 it("attendees should NOT be able to set the candidate last name", function(done) {
 	attendee1
 	.post('http://localhost:3001/candidate/setlName')
 	.send({candidate_id: candidate1._id,lName:'Blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getlName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('lName');
						res1.body.lName.should.be.equal('pickle');
						done();
					});
		});

 });

 it("attendees should NOT be able to set the candidate email", function(done) {
 	attendee1
 	.post('http://localhost:3001/candidate/setEmail')
 	.send({candidate_id: candidate1._id,email:'blah@test.com'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getEmail')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('email');
						res1.body.email.should.be.equal('DanP@test.com');
						done();
					});
		});

 });
 it("attendees should NOT be able to set the candidate status", function(done) {
 	attendee1
 	.post('http://localhost:3001/candidate/setStatus')
 	.send({candidate_id: candidate1._id,'event_id': event2._id, status:'volunteer'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getEvents')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						(res1.body.events[1]).should.have.property('status');
						(res1.body.events[1].status).should.be.equal('accepted');
						done();
					});
		});

 });
 
 it("attendees should NOT be able to add(set) candidate event", function(done) {
 	attendee1
 	.post('http://localhost:3001/candidate/setAccepted')
 	.send({candidate_id: candidate1._id, event_id: event4._id, accepted: false})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);
 		res.body.message.should.equal('User not authorized.');
 		done();
 	});
 });

 it("attendees should NOT be able to set the candidate's note", function(done) {
 	attendee1
 	.post('http://localhost:3001/candidate/setNote')
 	.send({candidate_id: candidate1._id,note:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);

 		user1
 		.post('http://localhost:3001/candidate/getNote')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res1) {
 			if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('note');
						res1.body.note.should.be.equal('I have changed the candidate note');
						done();
					});
 	});

 });
 it("attendee should be able to volunteer as a new candidate", function(done) {
 	recruiter1
 	.post('http://localhost:3001/candidate/setCandidate')
 	.send({events: [event1._id]})
 	.end(function(err,res) {
 		if (err) throw err;
 		//console.log(err);
 		res.status.should.equal(200);
 		tempNewCandidate=res.body;
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getfName')
			.send({candidate_id: tempNewCandidate._id})
			.end(function(err,res1) {
				if (err) throw err;
						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('attendee');


						user1
						.post('http://localhost:3001/candidate/deleteCandidate')
						.send({candidate_id: tempNewCandidate._id})
						.end(function(err,res) {
							if (err) throw err;
							res.status.should.equal(200);			
							done();
						});				
					});
		});

 });
 });

  describe('Recruiter route tests:', function() {


 it("recruiters should NOT be able to get the candidate first name", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.post('http://localhost:3001/candidate/getfName')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.have.should.not.have.property('fName');
 			//res.body.fName.should.be.equal('Full');
 			done();
 		});
 	});
 });


 it("recruiters should NOT be able to get the candidate last name", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.post('http://localhost:3001/candidate/getlName')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('lName');
 			//res.body.lName.should.be.equal('Name');
 			done();
 		});
 	});
 });


 it("recruiters should NOT be able to get the candidate email", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.post('http://localhost:3001/candidate/getEmail')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('email');
 		//	res.body.email.should.be.equal('test@test.com');
 		done();
 	});
 	});
 });
 /*it("recruiters should NOT be able to get the candidate status", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.post('http://localhost:3001/candidate/getStatus')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('status');
 			//res.body.status.should.be.equal('volunteer');
 			done();
 		});
 	});
 });
*/


 it("recruiters should NOT be able to get the candidate EventsID", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.post('http://localhost:3001/candidate/getEvents')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('events');
 			done();
 		});
 	});
 });
 it("recruiters should NOT be able to get the candidate note", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.post('http://localhost:3001/candidate/getNote')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('note');
 			//res.body.note.should.be.equal('this is a test');
 			done();
 		});
 	});
 });
it("recruiters should NOT be able to get the candidate getUser_id", function(done) {
 		candidate1.save(function(err) {
 			recruiter1
 			.post('http://localhost:3001/candidate/getUser_id')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(401);
 				res.body.should.not.have.property('user_id');
 				//res.body.user_id.should.be.equal((attendee._id).toString());
 				done();
 			});
 		});
 	});
 it("recruiters should NOT be able to set the candidate first name", function(done) {
 	recruiter1
 	.post('http://localhost:3001/candidate/setfName')
 	.send({candidate_id: candidate1._id,fName:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getfName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('dan');
						done();
					});
		});

 });
 it("recruiters should NOT be able to set the candidate last name", function(done) {
 	recruiter1
 	.post('http://localhost:3001/candidate/setlName')
 	.send({candidate_id: candidate1._id,lName:'Blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getlName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('lName');
						res1.body.lName.should.be.equal('pickle');
						done();
					});
		});

 });

 it("recruiters should NOT be able to set the candidate email", function(done) {
 	recruiter1
 	.post('http://localhost:3001/candidate/setEmail')
 	.send({candidate_id: candidate1._id,email:'blah@test.com'})
 	.end(function(err,res) {
 		if (err) throw err;
			res.status.should.equal(401);
			user1
			.post('http://localhost:3001/candidate/getEmail')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('email');
						res1.body.email.should.be.equal('DanP@test.com');
						done();
					});
		});

 });
 it("recruiters should NOT be able to set the candidate status", function(done) {
 	recruiter1
 		.post('http://localhost:3001/candidate/setStatus')
 	.send({candidate_id: candidate1._id,'event_id': event2._id, status:'volunteer'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getEvents')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						(res1.body.events[1]).should.have.property('status');
						(res1.body.events[1].status).should.be.equal('accepted');
						done();
					});
		});

 });
 
 it("recruiters should NOT be able to set candidate accepted field", function(done) {
 	recruiter1
 	.post('http://localhost:3001/candidate/setAccepted')
 	.send({candidate_id: candidate1._id, event_id : event4._id, accepted : false})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);
 		res.body.message.should.equal('User not authorized.');
 		done();
 	});
 });

 it("recruiters should NOT be able to set the candidate's note", function(done) {
 	recruiter1
 	.post('http://localhost:3001/candidate/setNote')
 	.send({candidate_id: candidate1._id,note:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);

 		user1
 		.post('http://localhost:3001/candidate/getNote')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res1) {
 			if (err) throw err;
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('note');
						res1.body.note.should.be.equal('I have changed the candidate note');
						done();
					});
 	});

 });
 });
  describe('Guest route tests:', function() {

 it("guests should NOT be able to volunteer as a new candidate", function(done) {
 	guest1
 	.post('http://localhost:3001/candidate/setCandidate')
 	.send({fName:attendee.fName,lName:attendee.lName,email:attendee.email,newEvent: event1._id})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);
 	done();
 });

 });

 it("guest should NOT be able to get the candidate first name", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.post('http://localhost:3001/candidate/getfName')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.have.should.not.have.property('fName');
 			done();
 		});
 	});
 });


 it("guest should NOT be able to get the candidate last name", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.post('http://localhost:3001/candidate/getlName')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('lName');
 			done();
 		});
 	});
 });


 it("guest should NOT be able to get the candidate email", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.post('http://localhost:3001/candidate/getEmail')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('email');
 		done();
 	});
 	});
 });
/* it("guest should NOT be able to get the candidate status", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.post('http://localhost:3001/candidate/getStatus')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('status');
 			//res.body.status.should.be.equal('volunteer');
 			done();
 		});
 	});
 });*/


 it("guest should NOT be able to get the candidate EventsID", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.post('http://localhost:3001/candidate/getEvents')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('events');
 			done();
 		});
 	});
 });
 it("guest should NOT be able to get the candidate note", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.post('http://localhost:3001/candidate/getNote')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('note');
 			done();
 		});
 	});
 });
it("guest should NOT be able to get the candidate getUser_id", function(done) {
 		candidate1.save(function(err) {
 			guest1
 			.post('http://localhost:3001/candidate/getUser_id')
 			.send({candidate_id: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(401);
 				res.body.should.not.have.property('user_id');
 				//res.body.user_id.should.be.equal((attendee._id).toString());
 				done();
 			});
 		});
 	});
 it("guest should NOT be able to set the candidate first name", function(done) {
 	guest1
 	.post('http://localhost:3001/candidate/setfName')
 	.send({candidate_id: candidate1._id,fName:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			res.status.should.equal(401);
			user1
			.post('http://localhost:3001/candidate/getfName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('dan');
						done();
					});
		});

 });
 it("guest should NOT be able to set the candidate last name", function(done) {
 	guest1
 	.post('http://localhost:3001/candidate/setlName')
 	.send({candidate_id: candidate1._id,lName:'Blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			res.status.should.equal(401);
			user1
			.post('http://localhost:3001/candidate/getlName')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('lName');
						res1.body.lName.should.be.equal('pickle');
						done();
					});
		});

 });

 it("guest should NOT be able to set the candidate email", function(done) {
 	guest1
 	.post('http://localhost:3001/candidate/setEmail')
 	.send({candidate_id: candidate1._id,email:'blah@test.com'})
 	.end(function(err,res) {
 		if (err) throw err;
			res.status.should.equal(401);
			user1
			.post('http://localhost:3001/candidate/getEmail')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('email');
						res1.body.email.should.be.equal('DanP@test.com');
						done();
					});
		});

 });
 it("guest should NOT be able to set the candidate status", function(done) {
 	guest1
	.post('http://localhost:3001/candidate/setStatus')
 	.send({candidate_id: candidate1._id,'event_id': event2._id, status:'volunteer'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.post('http://localhost:3001/candidate/getEvents')
			.send({candidate_id: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						(res1.body.events[1]).should.have.property('status');
						(res1.body.events[1].status).should.be.equal('accepted');
						done();
					});
		});

 });

 it("guest should NOT be able to set candidate event accepted field", function(done) {
 	guest1
 	.post('http://localhost:3001/candidate/setAccepted')
 	.send({'candidate_id' : candidate1._id, 'event_id': event2._id, 'accepted': false})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);
 		res.body.message.should.equal('User is not logged in.');
 		done();
 	});
 });

 it("guest should NOT be able to set the candidate's note", function(done) {
 	guest1
 	.post('http://localhost:3001/candidate/setNote')
 	.send({candidate_id: candidate1._id,note:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);

 		user1
 		.post('http://localhost:3001/candidate/getNote')
 		.send({candidate_id: candidate1._id})
 		.end(function(err,res1) {
 			if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('note');
						res1.body.note.should.be.equal('I have changed the candidate note');
						done();
					});
 	});

 });

 after(function(done) {
 	candidate1.remove();
 	user.remove();
 	attendee.remove();
 	recruiter.remove();
 	attendee3.remove();
 	candidate3.remove();
 	acceptedCandidate.remove();
 	event1.remove();
 	event2.remove();
 	event3.remove();
 	event4.remove();
 	done();
 });
}); 
});

