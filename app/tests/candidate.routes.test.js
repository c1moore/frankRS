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
	var candidate1, user, user1,attendee,attendee1,guest1,recruiter,recruiter1,event1,event2,event3,event4,newCandidate;

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
				name:  'testing123',
				start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
				end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
				location: 'UF',
				schedule: 'www.google.com'
			});

			event2 = new Event({
				name:  'testing123',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'SFCC',
					schedule: 'www.google.com'
				});
			event3 = new Event({
				name:  'testing123',
					start_date: new Date(2014,11,30,10,0,0).getTime(), //year, month, day, hour, minute, millisec
					end_date:  new Date(2015,11,30,10,0,0).getTime(),  //month is zero based.  11 = dec
					location: 'Orlando',
					schedule: 'www.google.com'
				});
			event4 = new Event({
				name:  'testing123',
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
						login_enable: true

					});
					attendee = new User({
						fName: 'attendee',
						lName: 'Testing',
						roles: ['attendee'],
						email: 'test1234@test.com',
						password: 'password',
						login_enable: true

					});
					recruiter = new User({
						fName: 'attendee',
						lName: 'Testing',
						roles: ['attendee'],
						email: 'test12@test.com',
						password: 'password',
						login_enable: true

					});

					candidate1 = new Candidate({
						fName : 'Full',
						lName : 'Name',
						email : 'test@test.com',
						status : 'volunteer',
						events: [{eventsID: event1._id, accepted: false},{eventsID:event2._id,accepted:false}],
						note : 'this is a test'
					});

					guest1=agent.agent();
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

 it("should save the user.", function(done) {
 	var query = User.findOne({"email" : user.email});
 	query.exec(function(err, res) {
 		done(err);
 	});
 });

 it("should be able to access the main page from the candidate route testing mechanism", function(done) {
 	request('http://localhost:3001')
 	.get('/')
 	.expect(200);
 	done();
 });




 describe('Admin route tests:', function() {

 	it("admin should be able to get the candidate first name", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getfName')
 			.send({candidateID: candidate1._id})
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
 			.get('http://localhost:3001/candidate/getlName')
 			.send({candidateID: candidate1._id})
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
 			.get('http://localhost:3001/candidate/getEmail')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('email');
 				res.body.email.should.be.equal('test@test.com');
 				done();
 			});
 		});
 	});
 	it("admin should be able to get the candidate status", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getStatus')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('status');
 				res.body.status.should.be.equal('volunteer');
 				done();
 			});
 		});
 	});


 	it("admin should be able to get the candidate accept_key", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getAccept_Key')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('accept_key');
 				res.body.accept_key.should.be.equal('false');
 				done();
 			});
 		});
 	});
 	it("admin should be able to get the candidate EventsID", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getEvents')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 			//console.log(res.body);
 			res.status.should.equal(200);
 			res.body.should.have.property('events');
 			(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 			(res.body.events[1].accepted.toString()).should.be.equal('false');
 			done();
 		});
 		});
 	});
 	it("admin should be able to get the candidate note", function(done) {
 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getNote')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;
 				res.status.should.equal(200);
 				res.body.should.have.property('note');
 				res.body.note.should.be.equal('this is a test');
 				done();
 			});
 		});
 	});

 	it("admin should be able to set the candidate first name", function(done) {
 		user1
 		.get('http://localhost:3001/candidate/setfName')
 		.send({candidateID: candidate1._id,newfName:'dan'})
 		.end(function(err,res) {
 			if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: candidate1._id})
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
 		.get('http://localhost:3001/candidate/setlName')
 		.send({candidateID: candidate1._id,newlName:'pickle'})
 		.end(function(err,res) {
 			if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getlName')
			.send({candidateID: candidate1._id})
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
 		.get('http://localhost:3001/candidate/setEmail')
 		.send({candidateID: candidate1._id,newEmail:'DanP@test.com'})
 		.end(function(err,res) {
 			if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getEmail')
			.send({candidateID: candidate1._id})
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
 		.get('http://localhost:3001/candidate/setStatus')
 		.send({candidateID: candidate1._id,newStatus:'accepted'})
 		.end(function(err,res) {
 			if (err) throw err;
			//console.log(res);
			res.status.should.equal(200);
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getStatus')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('status');
						res1.body.status.should.be.equal('accepted');
						done();
					});
		});

 	});

 	it("admin should be able to add(set) candidate event", function(done) {
 		user1
 		.get('http://localhost:3001/candidate/setEvent')
 		.send({candidateID: candidate1._id,newEvent:{eventsID: event3._id, accepted: true}})
 		.end(function(err,res) {
 			if (err) throw err;

 			res.status.should.equal(200);

 			user1
 			.get('http://localhost:3001/candidate/getEvents')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('false');
 				(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 				(res.body.events[1].accepted.toString()).should.be.equal('false');
 				(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 				(res.body.events[2].accepted.toString()).should.be.equal('true');

 				done();
 			});
 		});
 	});

 it("admin should be able to set candidate event accepted field", function(done) {
 	user1
 	.get('http://localhost:3001/candidate/setAccepted')
 	.send({'candidateID' : candidate1._id, 'eventsID': event2._id, 'accepted': true})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(200);

 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getEvents')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('false');
 				(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 				(res.body.events[1].accepted.toString()).should.be.equal('true');
 				(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 				(res.body.events[2].accepted.toString()).should.be.equal('true');

 				done();
 			});
 		});
 	});
 });

 it("admin should be able to set the candidate's note", function(done) {
 	user1
 	.get('http://localhost:3001/candidate/setNote')
 	.send({candidateID: candidate1._id,newNote:'I have changed the candidate note'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(200);

 		user1
 		.get('http://localhost:3001/candidate/getNote')
 		.send({candidateID: candidate1._id})
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
 	.get('http://localhost:3001/candidate/setCandidate')
 	.send({newfName: 'John',newlName: 'Smith',newEmail:'JohnS@test.com',newStatus:'volunteer',newEvent: event1._id,newAccept_Key:false,newNote:'I Volunteer as Tribute!'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res.body);
			res.status.should.equal(200);
			newCandidate=res.body;
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: newCandidate._id})
			.end(function(err,res1) {
				if (err) throw err;
						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('John');
						done();
					});
		});

 });
 it("admin should be able to delete a candidate", function(done) {
 	user1
 	.get('http://localhost:3001/candidate/deleteCandidate')
 	.send({candidateID: newCandidate._id})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(200);			
 		done();
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
 	.get('http://localhost:3001/candidate/setCandidate')
 	.send({newfName:attendee.fName,newlName:attendee.lName,newEmail:attendee.email,newEvent: event1._id})
 	.end(function(err,res) {
 		if (err) throw err;
 		//console.log(err);
 		res.status.should.equal(200);
 		newCandidate=res.body;
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: newCandidate._id})
			.end(function(err,res1) {
				if (err) throw err;
						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('attendee');


						user1
						.get('http://localhost:3001/candidate/deleteCandidate')
						.send({candidateID: newCandidate._id})
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
 		.get('http://localhost:3001/candidate/getfName')
 		.send({candidateID: candidate1._id})
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
 		.get('http://localhost:3001/candidate/getlName')
 		.send({candidateID: candidate1._id})
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
 		.get('http://localhost:3001/candidate/getEmail')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('email');
 		//	res.body.email.should.be.equal('test@test.com');
 		done();
 	});
 	});
 });
 it("attendees should NOT be able to get the candidate status", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.get('http://localhost:3001/candidate/getStatus')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('status');
 			//res.body.status.should.be.equal('volunteer');
 			done();
 		});
 	});
 });


 it("attendees should NOT be able to get the candidate accept_key", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.get('http://localhost:3001/candidate/getAccept_Key')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('accept_key');
 			//res.body.accept_key.should.be.equal('false');
 			done();
 		});
 	});
 });
 it("attendees should NOT be able to get the candidate EventsID", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.get('http://localhost:3001/candidate/getEvents')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			//console.log(res.body);
 			res.status.should.equal(401);
 			res.body.should.not.have.property('events');
 			/*(res.body.events[0].eventsID.toString()).should.be.equal(event1._id.toString());
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].eventsID.toString()).should.be.equal(event2._id.toString());
 			(res.body.events[1].accepted.toString()).should.be.equal('false');*/
 			done();
 		});
 	});
 });
 it("attendees should NOT be able to get the candidate note", function(done) {
 	candidate1.save(function(err) {
 		attendee1
 		.get('http://localhost:3001/candidate/getNote')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('note');
 			//res.body.note.should.be.equal('this is a test');
 			done();
 		});
 	});
 });

 it("attendees should NOT be able to set the candidate first name", function(done) {
 	attendee1
 	.get('http://localhost:3001/candidate/setfName')
 	.send({candidateID: candidate1._id,newfName:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: candidate1._id})
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
 	.get('http://localhost:3001/candidate/setlName')
 	.send({candidateID: candidate1._id,newlName:'Blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getlName')
			.send({candidateID: candidate1._id})
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
 	.get('http://localhost:3001/candidate/setEmail')
 	.send({candidateID: candidate1._id,newEmail:'blah@test.com'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getEmail')
			.send({candidateID: candidate1._id})
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
 	.get('http://localhost:3001/candidate/setStatus')
 	.send({candidateID: candidate1._id,newStatus:'volunteer'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getStatus')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('status');
						res1.body.status.should.be.equal('accepted');
						done();
					});
		});

 });
 
 it("attendees should NOT be able to add(set) candidate event", function(done) {
 	attendee1
 	.get('http://localhost:3001/candidate/setEvent')
 	.send({candidateID: candidate1._id,newEvent:{eventsID: event4._id, accepted: false}})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);

 		user1
 		.get('http://localhost:3001/candidate/getEvents')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;

 			res.status.should.equal(200);
 			res.body.should.have.property('events');

 			(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 			(res.body.events[1].accepted.toString()).should.be.equal('true');
 			(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 			(res.body.events[2].accepted.toString()).should.be.equal('true');
 			should.not.exist(res.body.events[3]);

 			done();
 		});
 	});
 });

 it("attendees should NOT be able to set candidate event accepted field", function(done) {
 	attendee1
 	.get('http://localhost:3001/candidate/setAccepted')
 	.send({'candidateID' : candidate1._id, 'eventsID': event2._id, 'accepted': false})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);

 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getEvents')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('false');
 				(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 				(res.body.events[1].accepted.toString()).should.be.equal('true');
 				(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 				(res.body.events[2].accepted.toString()).should.be.equal('true');
 				done();
 			});
 		});
 	});
 });

 it("attendees should NOT be able to set the candidate's note", function(done) {
 	attendee1
 	.get('http://localhost:3001/candidate/setNote')
 	.send({candidateID: candidate1._id,newNote:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);

 		user1
 		.get('http://localhost:3001/candidate/getNote')
 		.send({candidateID: candidate1._id})
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
 	.get('http://localhost:3001/candidate/setCandidate')
 	.send({newfName:attendee.fName,newlName:attendee.lName,newEmail:attendee.email,newEvent: event1._id})
 	.end(function(err,res) {
 		if (err) throw err;
 		//console.log(err);
 		res.status.should.equal(200);
 		newCandidate=res.body;
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: newCandidate._id})
			.end(function(err,res1) {
				if (err) throw err;
						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('attendee');


						user1
						.get('http://localhost:3001/candidate/deleteCandidate')
						.send({candidateID: newCandidate._id})
						.end(function(err,res) {
							if (err) throw err;
							res.status.should.equal(200);			
							done();
						});				
					});
		});

 });

  describe('Recruiter route tests:', function() {


 it("recruters should NOT be able to get the candidate first name", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.get('http://localhost:3001/candidate/getfName')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.have.should.not.have.property('fName');
 			//res.body.fName.should.be.equal('Full');
 			done();
 		});
 	});
 });


 it("recruters should NOT be able to get the candidate last name", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.get('http://localhost:3001/candidate/getlName')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('lName');
 			//res.body.lName.should.be.equal('Name');
 			done();
 		});
 	});
 });


 it("recruters should NOT be able to get the candidate email", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.get('http://localhost:3001/candidate/getEmail')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('email');
 		//	res.body.email.should.be.equal('test@test.com');
 		done();
 	});
 	});
 });
 it("recruters should NOT be able to get the candidate status", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.get('http://localhost:3001/candidate/getStatus')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('status');
 			//res.body.status.should.be.equal('volunteer');
 			done();
 		});
 	});
 });


 it("recruters should NOT be able to get the candidate accept_key", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.get('http://localhost:3001/candidate/getAccept_Key')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('accept_key');
 			//res.body.accept_key.should.be.equal('false');
 			done();
 		});
 	});
 });
 it("recruters should NOT be able to get the candidate EventsID", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.get('http://localhost:3001/candidate/getEvents')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			//console.log(res.body);
 			res.status.should.equal(401);
 			res.body.should.not.have.property('events');
 			/*(res.body.events[0].eventsID.toString()).should.be.equal(event1._id.toString());
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].eventsID.toString()).should.be.equal(event2._id.toString());
 			(res.body.events[1].accepted.toString()).should.be.equal('false');*/
 			done();
 		});
 	});
 });
 it("recruters should NOT be able to get the candidate note", function(done) {
 	candidate1.save(function(err) {
 		recruiter1
 		.get('http://localhost:3001/candidate/getNote')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('note');
 			//res.body.note.should.be.equal('this is a test');
 			done();
 		});
 	});
 });

 it("recruters should NOT be able to set the candidate first name", function(done) {
 	recruiter1
 	.get('http://localhost:3001/candidate/setfName')
 	.send({candidateID: candidate1._id,newfName:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: candidate1._id})
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
 it("recruters should NOT be able to set the candidate last name", function(done) {
 	recruiter1
 	.get('http://localhost:3001/candidate/setlName')
 	.send({candidateID: candidate1._id,newlName:'Blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getlName')
			.send({candidateID: candidate1._id})
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

 it("recruters should NOT be able to set the candidate email", function(done) {
 	recruiter1
 	.get('http://localhost:3001/candidate/setEmail')
 	.send({candidateID: candidate1._id,newEmail:'blah@test.com'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getEmail')
			.send({candidateID: candidate1._id})
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
 it("recruters should NOT be able to set the candidate status", function(done) {
 	recruiter1
 	.get('http://localhost:3001/candidate/setStatus')
 	.send({candidateID: candidate1._id,newStatus:'volunteer'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getStatus')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('status');
						res1.body.status.should.be.equal('accepted');
						done();
					});
		});

 });
 
 it("recruters should NOT be able to add(set) candidate event", function(done) {
 	recruiter1
 	.get('http://localhost:3001/candidate/setEvent')
 	.send({candidateID: candidate1._id,newEvent:{eventsID: event4._id, accepted: false}})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);

 		user1
 		.get('http://localhost:3001/candidate/getEvents')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;

 			res.status.should.equal(200);
 			res.body.should.have.property('events');

 			(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 			(res.body.events[1].accepted.toString()).should.be.equal('true');
 			(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 			(res.body.events[2].accepted.toString()).should.be.equal('true');
 			should.not.exist(res.body.events[3]);

 			done();
 		});
 	});
 });

 it("recruters should NOT be able to set candidate event accepted field", function(done) {
 	recruiter1
 	.get('http://localhost:3001/candidate/setAccepted')
 	.send({'candidateID' : candidate1._id, 'eventsID': event2._id, 'accepted': false})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);

 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getEvents')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('false');
 				(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 				(res.body.events[1].accepted.toString()).should.be.equal('true');
 				(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 				(res.body.events[2].accepted.toString()).should.be.equal('true');
 				done();
 			});
 		});
 	});
 });

 it("recruters should NOT be able to set the candidate's note", function(done) {
 	recruiter1
 	.get('http://localhost:3001/candidate/setNote')
 	.send({candidateID: candidate1._id,newNote:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);

 		user1
 		.get('http://localhost:3001/candidate/getNote')
 		.send({candidateID: candidate1._id})
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
  describe('Guest route tests:', function() {

 it("guests should NOT be able to volunteer as a new candidate", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setCandidate')
 	.send({newfName:attendee.fName,newlName:attendee.lName,newEmail:attendee.email,newEvent: event1._id})
 	.end(function(err,res) {
 		if (err) throw err;
 		//console.log(err);
 		res.status.should.equal(401);
 		/*newCandidate=res.body;
			//res.body.should.have.property('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: newCandidate._id})
			.end(function(err,res1) {
				if (err) throw err;
						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('fName');
						res1.body.fName.should.be.equal('attendee');


						user1
						.get('http://localhost:3001/candidate/deleteCandidate')
						.send({candidateID: newCandidate._id})
						.end(function(err,res) {
							if (err) throw err;
							res.status.should.equal(200);			
							done();
						});				
 });*/
 	done();
 });

 });

 it("guest should NOT be able to get the candidate first name", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.get('http://localhost:3001/candidate/getfName')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.have.should.not.have.property('fName');
 			//res.body.fName.should.be.equal('Full');
 			done();
 		});
 	});
 });


 it("guest should NOT be able to get the candidate last name", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.get('http://localhost:3001/candidate/getlName')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('lName');
 			//res.body.lName.should.be.equal('Name');
 			done();
 		});
 	});
 });


 it("guest should NOT be able to get the candidate email", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.get('http://localhost:3001/candidate/getEmail')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('email');
 		//	res.body.email.should.be.equal('test@test.com');
 		done();
 	});
 	});
 });
 it("guest should NOT be able to get the candidate status", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.get('http://localhost:3001/candidate/getStatus')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('status');
 			//res.body.status.should.be.equal('volunteer');
 			done();
 		});
 	});
 });


 it("guest should NOT be able to get the candidate accept_key", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.get('http://localhost:3001/candidate/getAccept_Key')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('accept_key');
 			//res.body.accept_key.should.be.equal('false');
 			done();
 		});
 	});
 });
 it("guest should NOT be able to get the candidate EventsID", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.get('http://localhost:3001/candidate/getEvents')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			//console.log(res.body);
 			res.status.should.equal(401);
 			res.body.should.not.have.property('events');
 			/*(res.body.events[0].eventsID.toString()).should.be.equal(event1._id.toString());
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].eventsID.toString()).should.be.equal(event2._id.toString());
 			(res.body.events[1].accepted.toString()).should.be.equal('false');*/
 			done();
 		});
 	});
 });
 it("guest should NOT be able to get the candidate note", function(done) {
 	candidate1.save(function(err) {
 		guest1
 		.get('http://localhost:3001/candidate/getNote')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;
 			res.status.should.equal(401);
 			res.body.should.not.have.property('note');
 			//res.body.note.should.be.equal('this is a test');
 			done();
 		});
 	});
 });

 it("guest should NOT be able to set the candidate first name", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setfName')
 	.send({candidateID: candidate1._id,newfName:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getfName')
			.send({candidateID: candidate1._id})
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
 it("guest should NOT be able to set the candidate last name", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setlName')
 	.send({candidateID: candidate1._id,newlName:'Blah'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getlName')
			.send({candidateID: candidate1._id})
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

 it("guest should NOT be able to set the candidate email", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setEmail')
 	.send({candidateID: candidate1._id,newEmail:'blah@test.com'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getEmail')
			.send({candidateID: candidate1._id})
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
 it("guest should NOT be able to set the candidate status", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setStatus')
 	.send({candidateID: candidate1._id,newStatus:'volunteer'})
 	.end(function(err,res) {
 		if (err) throw err;
			//console.log(res);
			res.status.should.equal(401);
			//res.body.should.not.exist('fName');
			//res.body.fName.should.be.equal('Full');
			//done();
			user1
			.get('http://localhost:3001/candidate/getStatus')
			.send({candidateID: candidate1._id})
			.end(function(err,res1) {
				if (err) throw err;



						//console.log(res1.body);
						if (err) throw err;
						res1.status.should.equal(200);
						res1.body.should.have.property('status');
						res1.body.status.should.be.equal('accepted');
						done();
					});
		});

 });
 
 it("guest should NOT be able to add(set) candidate event", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setEvent')
 	.send({candidateID: candidate1._id,newEvent:{eventsID: event4._id, accepted: false}})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);

 		user1
 		.get('http://localhost:3001/candidate/getEvents')
 		.send({candidateID: candidate1._id})
 		.end(function(err,res) {
 			if (err) throw err;

 			res.status.should.equal(200);
 			res.body.should.have.property('events');

 			(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 			(res.body.events[0].accepted.toString()).should.be.equal('false');
 			(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 			(res.body.events[1].accepted.toString()).should.be.equal('true');
 			(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 			(res.body.events[2].accepted.toString()).should.be.equal('true');
 			should.not.exist(res.body.events[3]);

 			done();
 		});
 	});
 });

 it("guest should NOT be able to set candidate event accepted field", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setAccepted')
 	.send({'candidateID' : candidate1._id, 'eventsID': event2._id, 'accepted': false})
 	.end(function(err,res) {
 		if (err) throw err;

 		res.status.should.equal(401);

 		candidate1.save(function(err) {
 			user1
 			.get('http://localhost:3001/candidate/getEvents')
 			.send({candidateID: candidate1._id})
 			.end(function(err,res) {
 				if (err) throw err;

 				res.status.should.equal(200);
 				res.body.should.have.property('events');

 				(res.body.events[0].eventsID.name.toString()).should.be.equal(event1.name);
 				(res.body.events[0].accepted.toString()).should.be.equal('false');
 				(res.body.events[1].eventsID.name.toString()).should.be.equal(event2.name);
 				(res.body.events[1].accepted.toString()).should.be.equal('true');
 				(res.body.events[2].eventsID.name.toString()).should.be.equal(event3.name);
 				(res.body.events[2].accepted.toString()).should.be.equal('true');
 				done();	
 			});
 		});
 	});
 });

 it("guest should NOT be able to set the candidate's note", function(done) {
 	guest1
 	.get('http://localhost:3001/candidate/setNote')
 	.send({candidateID: candidate1._id,newNote:'blah'})
 	.end(function(err,res) {
 		if (err) throw err;
 		res.status.should.equal(401);

 		user1
 		.get('http://localhost:3001/candidate/getNote')
 		.send({candidateID: candidate1._id})
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

 after(function(done) {
 	candidate1.remove();
 	user.remove();
 	attendee.remove();
 	recruiter.remove();
 	event1.remove();
 	event2.remove();
 	event3.remove();
 	event4.remove();
 	done();
 });
}); 
});
});
});
});