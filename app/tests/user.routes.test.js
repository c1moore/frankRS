'use strict';

/*jshint expr:true */

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	_ = require('lodash'),
	http = require('http'),
	config = require('../../config/config'),
	request = require('supertest'),
	agent = require('superagent'),
	User = mongoose.model('User'),
	Evnt = mongoose.model('Event');

/**
 * Globals
 */
var user, user2, user3, user4, user5, user6, event1, event2, event3, event4,
	useragent = agent.agent(), useragent2 = agent.agent();

/*
* Helper function to check if the events returned by getRecruiterEvents in the users.routes.server.controller.js file
* only returns the events for which the user is recruiting by comparing the ObjectIDs of the results to the actual
* ObjectIDs that should be returned.
*/
var checkRecruiterEvents = function(events) {
	var recruiterEvents = [event1._id.toString(), event2._id.toString(), event3._id.toString()];

	if(events.length !== recruiterEvents.length)
		return false;

	for(var i=0; i<events.length; i++) {
		if(!(_.intersection([events[i].event_id._id.toString()], recruiterEvents).length))
			return false;
	}

	return true;
};

/**
 * Unit tests
 */
describe('Express.js User Route Unit Tests:', function() {
	before(function(done) {
		//Remove all data from database so any previous tests that did not do this won't affect these tests.
		User.remove(function() {
			Evnt.remove(function() {
				done();
			});
		});
	});

	beforeEach(function(done) {
  		var millisInMonth = new Date(1970, 0, 31, 11, 59, 59).getTime();			//Number of milliseconds in a typical month.
		var startDate = new Date(Date.now() + millisInMonth).getTime();				//Start date for 1 month from now.
		var endDate = new Date(Date.now() + millisInMonth + 86400000).getTime();	//Event lasts 1 day.

		event1 = new Evnt({
			name:  'Test Event',
			start_date: startDate,
			end_date:  endDate,
			location: 'UF',
			schedule: 'www.google.com',
			capacity: 50
		});

		event2 = new Evnt({
			name:  'Event2',
			start_date: startDate,
			end_date:  endDate,
			location: 'SFCC',
			schedule: 'www.google.com',
			capacity: 50
		});

		event3 = new Evnt({
			name:  'Event3',
			start_date: startDate,
			end_date:  endDate,
			location: 'SFCC',
			schedule: 'www.google.com',
			capacity: 50
		});

		event4 = new Evnt({
			name:  'Event4',
			start_date: startDate,
			end_date:  endDate,
			location: 'SFCC',
			schedule: 'www.google.com',
			capacity: 50
		});

		event1.save(function(err) {
			if(err)
				return done(err);

			event2.save(function(err) {
				if(err)
					return done(err);

				event3.save(function(err) {
					if(err)
						return done(err);

					event4.save(function(err) {
						if(err)
							return done(err);

						user2 = new User({
							fName : 'Calvin',
							lName : 'Moore',
							displayName : 'Moore, Calvin',
							email : 'calvin_cen3031.0.boom0625@spamgourmet.com',
							roles : ['attendee'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}, {'event_id':event2._id, 'attending':false, 'recruiter':true}, {'event_id':event3._id, 'attending':true, 'recruiter':true}, {'event_id':event4._id, 'attending':true, 'recruiter':false}],
							password : 'password',
							login_enabled : true
						});

						user3 = new User({
							fName : 'Nother',
							lName : 'Name',
							displayName : 'Name, Nother',
							email : 'nother_name_cen3031.0.boom0625@spamgourmet.com',
							roles : ['attendee'],
							status : [{event_id : event1._id, attending: false, recruiter : false}],
							password : 'password',
							login_enabled : true
						});

						user4 = new User({
							fName : 'Example',
							lName : 'Name',
							displayName : 'Name, Example',
							email : 'example_name_cen3031.0.boom0625@spamgourmet.com',
							roles : ['attendee', 'recruiter'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}],
							attendeeList : [{'user_id' : user2._id, 'event_id' : event1._id}],
							inviteeList : [{'user_id' : user3._id, 'event_id' : event1._id}, {'user_id' : user2._id, 'event_id' : event1._id}],
							password : 'password',
							login_enabled : true
						});

						user5 = new User({
							fName : 'My',
							lName : 'Name',
							displayName : 'Name, My',
							email : 'myname_cen3031.0.boom0625@spamgourmet.com',
							roles : ['admin'],
							password : 'password',
							status : [{event_id : event1._id, attending : false, recruiter : false}],
							login_enabled : true
						});

						user6 = new User({
							fName : 'Nother',
							lName : 'Name',
							displayName : 'Name, Nother',
							email : 'nother_name2_cen3031.0.boom0625@spamgourmet.com',
							roles : ['attendee'],
							status : [],
							password : 'password',
							login_enabled : true
						});

						user = new User({
							fName : 'Calvin',
							lName : 'Moore',
							displayName : 'Moore, Calvin',
							email : 'test_cen3031.0.boom0625@spamgourmet.com',
							roles : ['recruiter'],
							status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}, {'event_id':event2._id, 'attending':false, 'recruiter':true}, {'event_id':event3._id, 'attending':true, 'recruiter':true}, {'event_id':event4._id, 'attending':true, 'recruiter':false}],
							rank : [{'event_id':event1._id, 'place':2}, {'event_id':event2._id, 'place':2}, {'event_id':event3._id, 'place':3}],
							password : 'password',
							attendeeList : [{'user_id' : user2._id, 'event_id' : event1._id}, {'user_id' : user3._id, 'event_id' : event2._id}, {'user_id' : user4._id, 'event_id' : event1._id}],
							inviteeList : [{'user_id' : user3._id, 'event_id' : event1._id}],
							almostList : [{'user_id' : user4._id, 'event_id' : event2._id}, {'user_id' : user2._id, 'event_id' : event2._id}],
							login_enabled : true
						});

						user2.save(function(err) {
							if(err)
								return done(err);

							user3.save(function(err) {
								if(err)
									return done(err);

								user4.save(function(err) {
									if(err)
										return done(err);

									user5.save(function(err) {
										if(err)
											return done(err);

										user6.save(function(err) {
											if(err)
												return done(err);

											user.save(function(err) {
												if(err)
													return done(err);

												useragent2
													.post('http://localhost:3001/auth/signin')
													.send({'email' : user2.email, 'password' : 'password'})
													.end(function(err, res) {
														if(err)
															return done(err);

														if(res.status !== 200)
															return done(new Error("useragent2 could not log in."));

														useragent
															.post('http://localhost:3001/auth/signin')
															.send({'email' : user.email, 'password' : 'password'})
															.end(function(err, res) {
																if(err)
																	return done(err);

																if(res.status !== 200)
																	return done(new Error("useragent2 could not log in."));

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
	});

	it("should be able to access the main page from the user route testing mechanism", function(done) {
		request('http://localhost:3001/')
			.get('')
			.expect(200)
			.end(function(err, res) {
				done(err);
			});
	});

	it('should not be able to log in if login_enabled is false.', function(done) {
		var useragent3 = agent.agent();
		var tempUser = new User({
			fName : 'Temp',
			lName : 'User',
			email : 'tempuser123_cen3031.0.boom0625@spamgourmet.com',
			password : '123password',
			login_enabled : false,
			roles : ['attendee']
		});

		tempUser.save(function() {
			useragent3
				.post('http://localhost:3001/auth/signin')
				.send({'email' : tempUser.email, 'password' : '123password'})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("User cannot log into account yet.  You must sign up to attend the event to which you were invited.");
					done();
				});
		});
	});

	describe("Admin routes:", function() {
		it("should return all recruiters for a specific event when the user is an admin.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.get('http://localhost:3001/event/recruiters')
						.query({event_id : event1._id.toString()})
						.end(function(err, res) {
							if(err) {
								return done(err);
							}

							res.status.should.equal(200);
							res.body.length.should.equal(3);

							var rcts = res.body;
							for(var i = 0; i < rcts.length; i++) {
								if(rcts[i]._id.toString() !== user2._id.toString() && rcts[i]._id.toString() !== user4._id.toString() && rcts[i]._id.toString() !== user._id.toString()) {
									return done(new Error("Returned users that are not recruiters:\n" + rcts[i].toString()));
								}
							}

							done();
						});
				});
		});

		it("should not return all recruiters for a specific event when the user is a recruiter.", function(done) {
			useragent
				.get('http://localhost:3001/event/recruiters')
				.send({event_id : event1._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");
					done();
				});
		});

		it("should not return all recruiters for a specific event when the user is an attendee.", function(done) {
			useragent2
				.get('http://localhost:3001/event/recruiters')
				.send({event_id : event1._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");
					done();
				});
		});

		it("should not return all recruiters for a specific event when the user is not logged in.", function(done) {
			var tempAgent = agent.agent();
			
			tempAgent
				.get('http://localhost:3001/event/recruiters')
				.send({event_id : event1._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");
					done();
				});
		});

		it("should delete a user account from the system when the user has admin permissions.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					User.count({}, function(err, scount) {
						if(err) {
							return done(err);
						}

						tempAdmin
							.post("http://localhost:3001/remove")
							.send({user_id : user._id})
							.end(function(err, res) {
								if(err) {
									return done(err);
								}

								res.status.should.equal(200);

								User.count({}, function(err, fcount) {
									if(err) {
										return done(err);
									}

									fcount.should.equal(scount - 1);

									User.find({_id : user._id}, function(err, result) {
										if(err) {
											return done(err);
										}

										if(result.length) {
											return done(new Error("Correct user not removed."));
										}

										done();
									});
								});
							});
					});
				});
		});

		it("should not delete a user account from the system when the user is a recruiter and does not own the account.", function(done) {
			User.count({}, function(err, scount) {
				if(err) {
					return done(err);
				}

				useragent
					.post("http://localhost:3001/remove")
					.send({user_id : user4._id})
					.end(function(err, res) {
						if(err) {
							return done(err);
						}

						res.status.should.equal(401);
						res.body.message.should.equal("User does not have permission.");

						User.count({}, function(err, fcount) {
							if(err) {
								return done(err);
							}

							fcount.should.equal(scount);

							User.find({_id : user4._id}, function(err, result) {
								if(err) {
									return done(err);
								}

								should.exist(result);
								done();
							});
						});
					});
			});
		});

		it("should not delete a user account from the system when the user is an attendee and does not own the account.", function(done) {
			User.count({}, function(err, scount) {
				if(err) {
					return done(err);
				}

				useragent2
					.post("http://localhost:3001/remove")
					.send({user_id : user4._id})
					.end(function(err, res) {
						if(err) {
							return done(err);
						}

						res.status.should.equal(401);
						res.body.message.should.equal("User does not have permission.");

						User.count({}, function(err, fcount) {
							if(err) {
								return done(err);
							}

							fcount.should.equal(scount);

							User.find({_id : user4._id}, function(err, result) {
								if(err) {
									return done(err);
								}

								should.exist(result);
								done();
							});
						});
					});
			});
		});

		it("should not delete a user account from the system when the user is not logged in.", function(done) {
			var tempUser = agent.agent();

			User.count({}, function(err, scount) {
				if(err) {
					return done(err);
				}

				tempUser
					.post("http://localhost:3001/remove")
					.send({user_id : user4._id})
					.end(function(err, res) {
						if(err) {
							return done(err);
						}

						res.status.should.equal(401);
						res.body.message.should.equal("User is not logged in.");

						User.count({}, function(err, fcount) {
							if(err) {
								return done(err);
							}

							fcount.should.equal(scount);

							User.find({_id : user4._id}, function(err, result) {
								if(err) {
									return done(err);
								}

								should.exist(result);
								done();
							});
						});
					});
			});
		});

		it("should not delete a user account when the user_id is not specified.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					User.count({}, function(err, scount) {
						if(err) {
							return done(err);
						}

						tempAdmin
							.post("http://localhost:3001/remove")
							.end(function(err, res) {
								if(err) {
									return done(err);
								}

								res.status.should.equal(400);
								res.body.message.should.equal("Required fields not specified.");

								User.count({}, function(err, fcount) {
									if(err) {
										return done(err);
									}

									fcount.should.equal(scount);

									User.find({_id : user._id}, function(err, result) {
										if(err) {
											return done(err);
										}

										if(!result.length) {
											return done(new Error("Correct user not removed."));
										}

										done();
									});
								});
							});
					});
				});
		});

		it("should remove a recruiter's current roles/status for a specific event when they are not attending the event and the requester is an admin.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post("http://localhost:3001/remove/Recruiter")
						.send({user_id : user._id, event_id : event2._id})
						.end(function(err, res) {
							if(err) {
								return done(err);
							}

							res.status.should.equal(200);

							User.findOne({_id : user._id}, function(err, recruiter) {
								if(err) {
									return done(err);
								}

								should.exist(recruiter);		//A result should have been found.
								recruiter.roles[0].should.equal(user.roles[0]);

								for(var i = 0; i < recruiter.status.length; i++) {
									if(recruiter.status[i].event_id.toString() === event2._id.toString()) {
										return done(new Error("Recruiter role not removed for proper event."));
									}
								}

								done();
							});
						});
				});
		});

		it("should change a recruiter's current role for an event to attendee when they are attending the event and the requester is an admin.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post("http://localhost:3001/remove/Recruiter")
						.send({user_id : user._id, event_id : event1._id})
						.end(function(err, res) {
							if(err) {
								return done(err);
							}

							res.status.should.equal(200);

							User.findOne({_id : user._id}, function(err, recruiter) {
								if(err) {
									return done(err);
								}

								should.exist(recruiter);		//A result should have been found.
								recruiter.roles[0].should.equal(user.roles[0]);

								var i;
								for(i = 0; i < recruiter.status.length; i++) {
									if(recruiter.status[i].event_id.toString() === event1._id.toString() && recruiter.status[i].recruiter) {
										return done(new Error("Recruiter role not removed for event."));
									}
									if(recruiter.status[i].event_id.toString() === event1._id.toString()) {
										break;
									}
								}

								if(i === recruiter.status.length) {
									return done(new Error("Event was deleted from recruiter's status."));
								}

								done();
							});
						});
				});
		});

		it("should delete a recruiter's account if they are not attending any events or recruiting for any events and the requester is an admin.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					var tempUser = new User({
						fName: 			"Temp",
						lName: 			"User",
						displayName: 	"User, Temp",
						email: 			"temp_user_cen3031.0.boom0625@pamgourmet.com",
						roles: 			["recruiter"],
						status: 		[{event_id : event1._id, attending: false, recruiter : true}],
						password: 		"password",
						login_enabled: 	true
					});

					tempUser.save(function(err, ruser) {
						tempAdmin
							.post("http://localhost:3001/remove/Recruiter")
							.send({user_id : tempUser._id, event_id : event1._id})
							.end(function(err, res) {
								if(err) {
									return done(err);
								}

								res.status.should.equal(200);

								User.findOne({_id : tempUser._id}, function(err, recruiter) {
									if(err) {
										return done(err);
									}

									should.not.exist(recruiter);		//A result should have been found.

									done();
								});
							});
					});
				});
		});

		it("should do nothing when the user is not a recruiter.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post("http://localhost:3001/remove/Recruiter")
						.send({user_id : user3._id, event_id : event1._id})
						.end(function(err, res) {
							if(err) {
								return done(err);
							}

							res.status.should.equal(200);

							User.findOne({_id : user3._id}, function(err, recruiter) {
								if(err) {
									return done(err);
								}

								should.exist(recruiter);		//A result should have been found.
								recruiter.roles[0].should.equal(user3.roles[0]);

								for(var i = 0; i < recruiter.status.length; i++) {
									if(recruiter.status[i].event_id.toString() === event1._id.toString()) {
										if(recruiter.status[i].attending || recruiter.status[i].recruiter) {
											return done(new Error("Nonrecruiter's status was updated."));
										}
									}
								}

								done();
							});
						});
				});
		});

		it("should not change a recruiter's role when the requester is a recruiter.", function(done) {
			useragent
				.post("http://localhost:3001/remove/Recruiter")
				.send({user_id : user._id, event_id : event2._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					User.findOne({_id : user._id}, function(err, recruiter) {
						if(err) {
							return done(err);
						}

						should.exist(recruiter);		//A result should have been found.
						recruiter.roles[0].should.equal(user.roles[0]);

						for(var i = 0; i < recruiter.status.length; i++) {
							if(recruiter.status[i].event_id.toString() === event2._id.toString() && !recruiter.status[i].recruiter) {
								return done(new Error("Recruiter role removed."));
							}
						}

						done();
					});
				});
		});

		it("should not change a recruiter's role when the requester is an attendee.", function(done) {
			useragent2
				.post("http://localhost:3001/remove/Recruiter")
				.send({user_id : user._id, event_id : event2._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					User.findOne({_id : user._id}, function(err, recruiter) {
						if(err) {
							return done(err);
						}

						should.exist(recruiter);		//A result should have been found.
						recruiter.roles[0].should.equal(user.roles[0]);

						for(var i = 0; i < recruiter.status.length; i++) {
							if(recruiter.status[i].event_id.toString() === event2._id.toString() && !recruiter.status[i].recruiter) {
								return done(new Error("Recruiter role removed."));
							}
						}

						done();
					});
				});
		});

		it("should not change a recruiter's role when the requester is not logged in.", function(done) {
			var tempagent = agent.agent();
			tempagent
				.post("http://localhost:3001/remove/Recruiter")
				.send({user_id : user._id, event_id : event2._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");

					User.findOne({_id : user._id}, function(err, recruiter) {
						if(err) {
							return done(err);
						}

						should.exist(recruiter);		//A result should have been found.
						recruiter.roles[0].should.equal(user.roles[0]);

						for(var i = 0; i < recruiter.status.length; i++) {
							if(recruiter.status[i].event_id.toString() === event2._id.toString() && !recruiter.status[i].recruiter) {
								return done(new Error("Recruiter role removed."));
							}
						}

						done();
					});
				});
		});

		it("should not change a recruiter's role when the user_id is not specified.", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post("http://localhost:3001/remove/Recruiter")
						.send({event_id : event2._id})
						.end(function(err, res) {
							if(err) {
								return done(err);
							}

							res.status.should.equal(400);
							res.body.message.should.equal("Required fields not specified.");

							User.findOne({_id : user._id}, function(err, recruiter) {
								if(err) {
									return done(err);
								}

								should.exist(recruiter);		//A result should have been found.
								recruiter.roles[0].should.equal(user.roles[0]);

								for(var i = 0; i < recruiter.status.length; i++) {
									if(recruiter.status[i].event_id.toString() === event2._id.toString() && !recruiter.status[i].recruiter) {
										return done(new Error("Recruiter role removed for event."));
									}
								}

								done();
							});
						});
				});
		});

		it("should allow an admin to make an account inactive for a particular event", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/user/inactivate')
						.send({user_id : user._id, event_id : event1._id})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);

							User.findOne({_id : user._id}, function(err, ruser) {
								should.not.exist(err);
								should.exist(ruser);

								for(var i = 0; i < ruser.status.length; i++) {
									if(ruser.status[i].event_id.toString() === event1._id.toString()) {
										if(ruser.status[i].active) {
											return done(new Error("Event not made inactive."));
										}

										if(!ruser.login_enabled) {
											return done(new Error("User login_enabled set to false incorrectly."));
										}

										break;
									}
								}

								done();
							});
						});
				});
		});

		it("should not return events that are inactive for the user when requesting user events", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/user/inactivate')
						.send({user_id : user._id, event_id : event1._id})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);

							User.findOne({_id : user._id}, function(err, ruser) {
								should.not.exist(err);
								should.exist(ruser);

								for(var i = 0; i < ruser.status.length; i++) {
									if(ruser.status[i].event_id.toString() === event1._id.toString()) {
										if(ruser.status[i].active) {
											return done(new Error("Event not made inactive."));
										}

										if(!ruser.login_enabled) {
											return done(new Error("User login_enabled set to false incorrectly."));
										}

										break;
									}
								}

								useragent
									.get('http://localhost:3001/users/events')
									.end(function(err, res) {
										should.not.exist(err);
										res.status.should.equal(200);

										res.body.status.length.should.equal(user.status.length - 1);

										for(var i = 0; i < res.body.status.length; i++) {
											if(res.body.status[i].event_id === event1._id.toString()) {
												return done(new Error("Inactive event returned."));
												break;
											}
										}

										done();
									});
							});
						});
				});
		});

		it("should revoke a recruiter's role for the specified event when setting the event as inactive for the user", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/user/inactivate')
						.send({user_id : user._id, event_id : event1._id})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);

							User.findOne({_id : user._id}, function(err, ruser) {
								should.not.exist(err);
								should.exist(ruser);

								for(var i = 0; i < ruser.status.length; i++) {
									if(ruser.status[i].event_id.toString() === event1._id.toString()) {
										if(ruser.status[i].active) {
											return done(new Error("Event not made inactive."));
										}

										if(ruser.status[i].recruiter) {
											return done(new Error("Recruiter permissions not revoked."));
										}

										break;
									}
								}

								if(!ruser.login_enabled) {
									return done(new Error("User login_enabled set to false incorrectly."));
								}

								done();
							});
						});
				});
		});

		it("should revoke a recruiter's role completely when the making an event inactive for the recruiter and the user is no longer recruiting for any events", function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/user/inactivate')
						.send({user_id : user4._id, event_id : event1._id})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);

							User.findOne({_id : user4._id}, function(err, ruser) {
								should.not.exist(err);
								should.exist(ruser);

								for(var i = 0; i < ruser.status.length; i++) {
									if(ruser.status[i].event_id.toString() === event1._id.toString()) {
										if(ruser.status[i].active) {
											return done(new Error("Event not made inactive."));
										}

										break;
									}
								}

								if(_.intersection(["recruiter"], ruser.roles).length) {
									return done(new Error("Recruiter permissions not revoked."));
								}

								if(ruser.login_enabled) {
									return done(new Error("User login_enabled not set to false as expected."));
								}

								done();
							});
						});
				});
		});

		it("should not allow a recruiter to make an event inactive for another user", function(done) {
			useragent
				.post('http://localhost:3001/user/inactivate')
				.send({user_id : user4._id, event_id : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					User.findOne({_id : user4._id}, function(err, ruser) {
						should.not.exist(err);

						for(var i = 0; i < ruser.status.length; i++) {
							if(ruser.status[i].event_id.toString() === event1._id.toString() && !ruser.status[i].active) {
								return done(new Error("User account made inactive."));
							}
						}

						done();
					});
				});
		});

		it("should not allow an attendee to make an event inactive for another user", function(done) {
			useragent2
				.post('http://localhost:3001/user/inactivate')
				.send({user_id : user4._id, event_id : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					User.findOne({_id : user4._id}, function(err, ruser) {
						should.not.exist(err);

						for(var i = 0; i < ruser.status.length; i++) {
							if(ruser.status[i].event_id.toString() === event1._id.toString() && !ruser.status[i].active) {
								return done(new Error("User account made inactive."));
							}
						}

						done();
					});
				});
		});

		it("should not allow a user that is not logged in to make an event inactive for another user", function(done) {
			var tempAgent = agent.agent();
			tempAgent
				.post('http://localhost:3001/user/inactivate')
				.send({user_id : user4._id, event_id : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");

					User.findOne({_id : user4._id}, function(err, ruser) {
						should.not.exist(err);

						for(var i = 0; i < ruser.status.length; i++) {
							if(ruser.status[i].event_id.toString() === event1._id.toString() && !ruser.status[i].active) {
								return done(new Error("User account made inactive."));
							}
						}

						done();
					});
				});
		});

		it('should remove the user\'s recruiter status and make all events inactive.', function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/user/inactivate/all')
						.send({user_id : user._id})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);

							User.findOne({_id : user._id}, function(err, ruser) {
								should.not.exist(err);
								should.exist(ruser);

								for(var i = 0; i < ruser.status.length; i++) {
									if(ruser.status[i].active || ruser.status[i].recruiter) {
										return done(new Error("Not all events inactivated or recruiter status not revoked. \n\nactive: " + ruser.status[i].active + "\nrecruiter: " + ruser.status[i].recruiter));
									}
								}

								if(_.intersection(['recruiter'], ruser.roles).length) {
									return done(new Error("User recruiter role not removed."));
								}

								if(ruser.login_enabled) {
									return done(new Error("User can still log in."));
								}

								done();
							});
						});
				});
		});

		it('should not allow a recruiter to make a user\'s account inactive.', function(done) {
			useragent
				.post('http://localhost:3001/user/inactivate/all')
				.send({user_id : user2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					User.findOne({_id : user2._id}, function(err, user) {
						for(var i = 0; i < user.status.length; i++) {
							if(!user.status[i].active) {
								return done(new Error("Event made inactive by recruiter."));
							}
						}

						done();
					});
				});
		});

		it('should not allow an attendee to make a user\'s account inactive.', function(done) {
			useragent2
				.post('http://localhost:3001/user/inactivate/all')
				.send({user_id : user2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					User.findOne({_id : user2._id}, function(err, user) {
						for(var i = 0; i < user.status.length; i++) {
							if(!user.status[i].active) {
								return done(new Error("Event made inactive by recruiter."));
							}
						}

						done();
					});
				});
		});

		it('should not allow a user that is not logged in to make a user\'s account inactive', function(done) {
			var tempAgent = agent.agent();
			tempAgent
				.post('http://localhost:3001/user/inactivate/all')
				.send({user_id : user2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");

					User.findOne({_id : user2._id}, function(err, user) {
						for(var i = 0; i < user.status.length; i++) {
							if(!user.status[i].active) {
								return done(new Error("Event made inactive by recruiter."));
							}
						}

						done();
					});
				});
		});

		it('should return a proper error when user_id is not specified.', function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/user/inactivate/all')
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal("Required fields not specified.");

							done();
						});
				});
		});

		it('should allow an admin to obtain all users for a particular event.', function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					//Set active to false in user's status array for this event to confirm all users are returned.
					for(var i = 0; i < user.status.length; i++) {
						if(user.status[i].event_id.toString() === event1._id.toString()) {
							user.status[i].active = false;
							break;
						}
					}

					user.save(function(err) {
						should.not.exist(err);

						tempAdmin
							.post("http://localhost:3001/event/users")
							.send({event_id : event1._id})
							.end(function(err, res) {
								if(err) {
									return done(err);
								}

								res.status.should.equal(200);
								res.body.length.should.equal(5);

								for(var i=0; i < res.body.length; i++) {
									if(res.body[i]._id.toString() !== user._id.toString() && res.body[i]._id.toString() !== user2._id.toString() && res.body[i]._id.toString() !== user3._id.toString() && res.body[i]._id.toString() !== user4._id.toString() && res.body[i]._id.toString() !== user5._id.toString()) {
										return done(new Error("Correct users not returned."));
									}
								}

								done();
							});
					});
				});
		});

		it('should not allow a recruiter to obtain all users for a particular event.', function(done) {
			useragent
				.post("http://localhost:3001/event/users")
				.send({user_id : user._id, event_id : event2._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					done();
				});
		});

		it('should not allow an attendee to obtain all users for a particular event.', function(done) {
			useragent
				.post("http://localhost:3001/event/users")
				.send({user_id : user._id, event_id : event2._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					done();
				});
		});

		it('should not allow somebody not logged in to obtain all users for a particular event.', function(done) {
			var tempAgent = agent.agent();
			tempAgent
				.post("http://localhost:3001/event/users")
				.send({user_id : user._id, event_id : event2._id})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");

					done();
				});
		});
	});

	describe('Programmer email routes:', function() {
		it('should allow an admin to send an email to the programmer.', function(done) {
			this.timeout(10000);
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/programmer/email')
						.send({subject : "Hello Mr. Programmer", message : "How are you doing today?"})
						.end(function(err, res) {
							if(err) {
								return done(err);
							}

							res.status.should.equal(200);

							done();
						});
				});
		});

		it('should allow a recruiter to send an email to the programmer.', function(done) {
			this.timeout(10000);
			useragent
				.post('http://localhost:3001/programmer/email')
				.send({subject : "Hello Mr. Programmer", message : "How are you doing today?"})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);

					done();
				});
		});

		it('should allow an attendee to send an email to the programmer.', function(done) {
			this.timeout(10000);
			useragent2
				.post('http://localhost:3001/programmer/email')
				.send({subject : "Hello Mr. Programmer", message : "How are you doing today?"})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);

					done();
				});
		});

		it('should not allow a "guest" to send an email to the programmer.', function(done) {
			var tempAgent = agent.agent();
			tempAgent
				.post('http://localhost:3001/programmer/email')
				.send({subject : "Hello Mr. Programmer", message : "How are you doing today?"})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");

					done();
				});
		});

		it('should not allow anybody to send an email to the programmer when the subject is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/programmer/email')
				.send({message : "How are you doing today?"})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(400);
					res.body.message.should.equal("Required field not specified.");

					done();
				});
		});

		it('should not allow anybody to send an email to the programmer when the message is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/programmer/email')
				.send({subject : "How are you doing today?"})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(400);
					res.body.message.should.equal("Required field not specified.");

					done();
				});
		});
	});

	describe('Leaderboard routes:', function() {
		it('should be able to get leaderboard when they have the proper roles.', function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/maintable')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
	         		should.not.exist(err);
	          		res.status.should.equal(200);
	          		res.body.length.should.equal(2);

	          		var i;
	          		for(i=0; i<res.body.length; i++) {
	          			if(res.body[i]._id.toString() === user._id.toString())
	          				break;
	          		}

	          		res.body[i].attending.should.equal(2);
	          		res.body[i].invited.should.equal(1);
	          		res.body[i].place.should.equal(2);
					done();
				});
		});

		it('should return an error when no event_id is specified.', function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/maintable')
				.end(function(err, res) {
	         		should.not.exist(err);
	          		res.status.should.equal(400);
	          		res.body.message.should.equal('Event not specified.');
					done();
				});
		});

		it('should fail to get leaderboard when the user does not have proper roles.', function(done) {
			useragent2
				.post('http://localhost:3001/leaderboard/maintable')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
	         		should.not.exist(err);
	          		res.status.should.equal(401);
	          		res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should fail to get leaderboard when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/leaderboard/maintable')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe('Recruiter events routes:', function() {
		it('should return an array of events for which the user is recruiting', function(done) {
			useragent
				.get('http://localhost:3001/recruiter/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					checkRecruiterEvents(res.body).should.be.true;
					done();
				});
		});

		it('should return an error when the user is not a recruiter', function(done) {
			useragent2
				.get('http://localhost:3001/recruiter/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/recruiter/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe('User events routes:', function() {
		it('should return an array of events for which the user is associated', function(done) {
			useragent
				.get('http://localhost:3001/users/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.status.length.should.equal(4);
					done();
				});
		});

		it('should return an array of events for the user even if they are not a recruiter', function(done) {
			useragent2
				.get('http://localhost:3001/users/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.status.length.should.equal(4);
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/users/events')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's leaderboard status information:", function() {
		it("should return a recruiter's information.", function(done) {
			useragent
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.query({'event_id' : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.attending.should.equal(2);
					res.body.invited.should.equal(1);
					res.body.place.should.equal(2);
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.query({'event_id' : event1._id.toString()})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/leaderboard/recruiterinfo')
				.query({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's attendeeList routes:", function() {
		it("should return a recruiter's attendeeList for a specific event.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(2);
					for(var i=0; i<res.body.length; i++) {
						if(res.body[i].email !== user2.email && res.body[i].email !== user4.email) {
							done(new Error("Proper attendees not returned."));
						}
					}
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/attendees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/recruiter/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/recruiter/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's inviteeList routes:", function() {
		it("should return a recruiter's inviteeList for a specific event.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(1);
					res.body[0].email.should.equal(user3.email);
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/invitees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/recruiter/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/recruiter/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Recruiter's almostList routes:", function() {
		it("should return a recruiter's almostList for a specific event.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/almosts')
				.send({'event_id' : event2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(2);
					for(var i=0; i<res.body.length; i++) {
						if(res.body[i].email !== user4.email && res.body[i].email !== user2.email) {
							done(new Error("Proper attendees not returned."));
						}
					}
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/recruiter/almosts')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/recruiter/almosts')
				.send({'event_id' : event2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/recruiter/almosts')
				.send({'event_id' : event2._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Leaderboard attendeeList controllers:", function() {
		it("should return the attendeeList for a specific event (for all recruiters).", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(3);

					var recruiter1=0, recruiter2=0;
					for(var i=0; i<res.body.length; i++) {
						if(res.body[i].recruiterName === "Moore, Calvin")
							recruiter1++;
						else if(res.body[i].recruiterName === "Name, Example")
							recruiter2++;
					}

					recruiter1.should.equal(2);
					recruiter2.should.equal(1);
					
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/attendees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/leaderboard/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/leaderboard/attendees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe("Leaderboard inviteeList controllers:", function() {
		it("should return the inviteeList for a specific event (for all recruiters).", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.length.should.equal(3);

					var recruiter1=0, recruiter2=0;
					for(var i=0; i<res.body.length; i++) {
						if(res.body[i].recruiterName === "Moore, Calvin")
							recruiter1++;
						else if(res.body[i].recruiterName === "Name, Example")
							recruiter2++;
					}

					recruiter1.should.equal(1);
					recruiter2.should.equal(2);
					
					done();
				});
		});

		it("should return an error when the event_id is not specified.", function(done) {
			useragent
				.post('http://localhost:3001/leaderboard/invitees')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Event not specified.");
					done();
				});
		});

		it('should return the proper error when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/leaderboard/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User does not have permission.');
					done();
				});
		});

		it('should return the proper error when the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/leaderboard/invitees')
				.send({'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	describe('Sending an invitation', function() {
		it('should send an invitation and update the recruiter\'s rank and inviteeList accordingly when an invitee is already in the database and has been invited, but not attending the event, without adding a new user.', function(done) {
			this.timeout(10000);
			User.count({}, function(err, scount) {
				useragent
					.post('http://localhost:3001/invitation/send')
					.send({'fName' : user5.fName, 'lName' : user5.lName, 'email' : user5.email, 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						User.findOne({_id : user._id}, function(err, rectr) {
							(user.inviteeList.length < rectr.inviteeList.length).should.be.true;
							(user.attendeeList.length === rectr.attendeeList.length).should.be.true;
							(user.almostList.length === rectr.almostList.length).should.be.true;
							User.count({}, function(err, fcount) {
								fcount.should.equal(scount);
								User.findOne({_id : user5._id}, function(err, newUser5) {
									newUser5.status.length.should.equal(user5.status.length);

									Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
										newEvnt.invited.should.equal(event1.invited);

										done();
									});
								});
							});
						});
					});
			});
		});

		it('should send an invitation and update the recruiter\'s rank and inviteeList and the number invited to the event accordingly when an invitee is already in the database, but has not been invited to the event, without adding a new user.', function(done) {
			this.timeout(10000);
			User.count({}, function(err, scount) {
				useragent
					.post('http://localhost:3001/invitation/send')
					.send({'fName' : user6.fName, 'lName' : user6.lName, 'email' : user6.email, 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						res.body.message.should.equal("Invitation has been sent to " + user6.fName + "!");
						
						User.findOne({_id : user._id}, function(err, rectr) {
							should.not.exist(err);

							User.count({}, function(err, fcount) {
								fcount.should.equal(scount);

								User.findOne({_id : user6._id}, function(err, newUser3) {
									newUser3.status.length.should.be.greaterThan(user6.status.length);


									(user.attendeeList.length === rectr.attendeeList.length).should.be.true;
									(user.almostList.length === rectr.almostList.length).should.be.true;
									user.inviteeList.length.should.be.lessThan(rectr.inviteeList.length);

									Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
										newEvnt.invited.should.equal(event1.invited + 1);

										done();
									});
								});
							});
						});
					});
			});
		});

		it('should send an invitation, but not add an invitee to the inviteeList or increment the number invited to the event when this invitee has already been invited by this recruiter.', function(done) {
			this.timeout(10000);
			User.count({}, function(err, scount) {
				useragent
					.post('http://localhost:3001/invitation/send')
					.send({'fName' : user3.fName, 'lName' : user3.lName, 'email' : user3.email, 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						res.body.message.should.equal("Invitation has been sent to " + user3.fName + "!");
						
						User.findOne({_id : user._id}, function(err, rectr) {
							should.not.exist(err);

							User.count({}, function(err, fcount) {
								fcount.should.equal(scount);

								User.findOne({_id : user3._id}, function(err, newUser3) {
									newUser3.status.length.should.be.equal(user3.status.length);


									(user.attendeeList.length === rectr.attendeeList.length).should.be.true;
									(user.almostList.length === rectr.almostList.length).should.be.true;
									user.inviteeList.length.should.be.equal(rectr.inviteeList.length);

									Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
										newEvnt.invited.should.equal(event1.invited);

										done();
									});
								});
							});
						});
					});
			});
		});

		it('should send an invitation, create a new user, and update the recruiter\'s rank and inviteeList and the number invited to the event accordingly when an invitee is not in the db yet.', function(done) {
			this.timeout(10000);
			User.count({}, function(err, scount) {
				useragent
					.post('http://localhost:3001/invitation/send')
					.send({'lName' : 'Moore', 'fName' : 'Calvin', 'email' : 'h.m.murdock95@gmail.com', 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						User.findOne({_id : user._id}, function(err, rectr) {
							(user.inviteeList.length < rectr.inviteeList.length).should.be.true;
							(user.attendeeList.length === rectr.attendeeList.length).should.be.true;
							(user.almostList.length === rectr.almostList.length).should.be.true;
							User.count({}, function(err, fcount) {
								fcount.should.be.greaterThan(scount);
								User.findOne({email : 'h.m.murdock95@gmail.com'}, function(err, newUser3) {
									newUser3.status.length.should.equal(1);

									Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
										newEvnt.invited.should.equal(event1.invited + 1);

										done();
									});
								});
							});
						});
					});
			});
		});

		it('should not send an invitation or update the number invited to the event, but update the recruiter\'s almostList when that user is attending.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				useragent
					.post('http://localhost:3001/invitation/send')
					.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						res.body.message.should.equal(user2.fName + " " + user2.lName + " is already attending frank.  You're thinking of the right people.");
						User.findOne({_id : user._id}, function(err, rectr) {
							(oldRectr.inviteeList.length === rectr.inviteeList.length).should.be.true;
							(oldRectr.attendeeList.length === rectr.attendeeList.length).should.be.true;
							(oldRectr.almostList.length < rectr.almostList.length).should.be.true;

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
					});
			});
		});

		it('should not send an invitation if the user is a recruiter, but not a recruiter for this event.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({lName : 'Moore', fName : 'Calvin', email : 'donotsend_cen3031.0.boom0625@spamgourmet.com', event_id : event4._id, event_name : event4.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission to send invitations for this event.");

					User.findOne({email : 'donotsend_cen3031.0.boom0625@spamgourmet.com'}, function(err, ruser) {
						should.not.exist(err);
						should.not.exist(ruser);

						Evnt.findOne({_id : event4._id}, function(err, revent) {
							should.not.exist(err);
							revent.invited.should.equal(event4.invited);

							done();
						});
					});
				});
		});

		it('should not send an invitation for an event that has been made inactive for this event even if the user is still a recruiter.', function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/user/inactivate')
						.send({user_id : user._id, event_id : event1._id})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);
							
							useragent
								.post('http://localhost:3001/invitation/send')
								.send({lName : 'Moore', fName : 'Calvin', email : 'donotsend_cen3031.0.boom0625@spamgourmet.com', event_id : event4._id, event_name : event4.name})
								.end(function(err, res) {
									should.not.exist(err);
									res.status.should.equal(401);
									res.body.message.should.equal("User does not have permission to send invitations for this event.");

									User.findOne({email : 'donotsend_cen3031.0.boom0625@spamgourmet.com'}, function(err, ruser) {
										should.not.exist(err);
										should.not.exist(ruser);

										Evnt.findOne({_id : event4._id}, function(err, revent) {
											should.not.exist(err);
											revent.invited.should.equal(event4.invited);

											done();
										});
									});
								});
						});
				});
		});

		it('should not send an invitation for an event that has been made inactive even if the user is a recruiter.', function(done) {
			var tempAdmin = agent.agent();
			tempAdmin
				.post('http://localhost:3001/auth/signin')
				.send({email : user5.email, password : 'password'})
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					res.status.should.equal(200);
					tempAdmin.saveCookies(res);

					tempAdmin
						.post('http://localhost:3001/events/inactivate')
						.send({event_id : event1._id})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);
							
							useragent
								.post('http://localhost:3001/invitation/send')
								.send({lName : 'Moore', fName : 'Calvin', email : 'donotsend_cen3031.0.boom0625@spamgourmet.com', event_id : event4._id, event_name : event4.name})
								.end(function(err, res) {
									should.not.exist(err);
									res.status.should.equal(401);
									res.body.message.should.equal("User does not have permission to send invitations for this event.");

									User.findOne({email : 'donotsend_cen3031.0.boom0625@spamgourmet.com'}, function(err, ruser) {
										should.not.exist(err);
										should.not.exist(ruser);

										Evnt.findOne({_id : event4._id}, function(err, revent) {
											should.not.exist(err);
											revent.invited.should.equal(event4.invited);

											done();
										});
									});
								});
						});
				});
		});

		it('should not send an invitation when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");

					Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
						newEvnt.invited.should.equal(event1.invited);

						done();
					});
				});
		});

		it('should not send an invitation when the user is not signed in to their account.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");

					Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
						newEvnt.invited.should.equal(event1.invited);

						done();
					});
				});
		});

		it('should return an error when invitee first name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");

					Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
						newEvnt.invited.should.equal(event1.invited);

						done();
					});
				});
		});

		it('should return an error when invitee last name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");

					Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
						newEvnt.invited.should.equal(event1.invited);

						done();
					});
				});
		});

		it('should return an error when invitee email is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");

					Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
						newEvnt.invited.should.equal(event1.invited);

						done();
					});
				});
		});

		it('should return an error when the event ID is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");

					Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
						newEvnt.invited.should.equal(event1.invited);

						done();
					});
				});
		});

		it('should return an error when the event name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/send')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");

					Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
						newEvnt.invited.should.equal(event1.invited);

						done();
					});
				});
		});
	});

	describe('Accepting an invitation', function() {
		it('should allow an outside source to send data when the correct API key is sent and update the a user\'s account and the number of attendees for the event accordingly if they were already invited.', function(done) {
			this.timeout(100000);
			User.findOne({_id : user._id}, function(err, oldRectr) {
				if(err) {
					return done(err);
				}

				User.count({}, function(err, scount) {
					if(err) {
						return done(err);
					}
					
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : user5.fName, 'invitee_lName' : user5.lName, 'invitee_email' : user5.email, 'organization' : 'frank', 'event_name' : event1.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);
							User.findOne({_id : user._id}, function(err, rectr) {
								if(err) {
									return done(err);
								}
								
								((oldRectr.inviteeList.length - 1) === rectr.inviteeList.length).should.be.true;
								(oldRectr.attendeeList.length < rectr.attendeeList.length).should.be.true;
								(oldRectr.almostList.length === rectr.almostList.length).should.be.true;
								User.count({}, function(err, fcount) {
									if(err) {
										return done(err);
									}
									
									fcount.should.equal(scount);
									User.findOne({_id : user5._id}, function(err, newUser5) {
										if(err) {
											return done(err);
										}
										
										newUser5.status.length.should.equal(user5.status.length);
										for(var i=0; i<newUser5.status.length; i++) {
											if(newUser5.status[i].event_id.toString() === event1._id.toString()) {
												newUser5.status[i].attending.should.be.true;
												break;
											}
										}
										i.should.not.equal(newUser5.status.length);

										Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
											if(err) {
												return done(err);
											}
											
											newEvnt.attending.should.equal(event1.attending + 1);
											newEvnt.invited.should.equal(event1.invited - 1);

											done();
										});
									});
								});
							});
						});
				});
			});
		});

		it('should allow an outside source to send data when the correct API key is sent and update the user\'s account and the number attending this event accordingly if they have an account but were not invited to this event.', function(done) {
			this.timeout(100000);
			User.findOne({_id : user._id}, function(err, oldRectr) {
				if(err) {
					return done(err);
				}
				
				User.count({}, function(err, scount) {
					if(err) {
						return done(err);
					}
					
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : user5.fName, 'invitee_lName' : user5.lName, 'invitee_email' : user5.email, 'organization' : 'frank', 'event_name' : event2.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(200);
							User.findOne({_id : user._id}, function(err, rectr) {
								if(err) {
									return done(err);
								}
								
								((oldRectr.inviteeList.length - 1) === rectr.inviteeList.length).should.be.true;
								(oldRectr.attendeeList.length < rectr.attendeeList.length).should.be.true;
								(oldRectr.almostList.length === rectr.almostList.length).should.be.true;
								User.count({}, function(err, fcount) {
									if(err) {
										return done(err);
									}
									
									fcount.should.equal(scount);
									User.findOne({_id : user5._id}, function(err, newUser5) {
										if(err) {
											return done(err);
										}
										
										newUser5.status.length.should.be.greaterThan(user5.status.length);
										for(var i=0; i<newUser5.status.length; i++) {
											if(newUser5.status[i].event_id.toString() === event2._id.toString()) {
												newUser5.status[i].attending.should.be.true;
												break;
											}
										}
										i.should.not.equal(newUser5.status.length);

										Evnt.findOne({_id : event2._id}, function(err, newEvnt) {
											if(err) {
												return done(err);
											}
											
											newEvnt.attending.should.equal(event2.attending + 1);
											newEvnt.invited.should.equal(event1.invited - 1);

											done();
										});
									});
								});
							});
						});
				});
			});
		});

		it('should allow an outside source to send data when the correct API key is sent and create a user\'s account correctly and update the number attending if they were not invited via the recruiter system.', function(done) {
			this.timeout(100000);
			User.findOne({_id : user._id}, function(err, oldRectr) {
				if(err) {
					return done(err);
				}
				
				User.count({}, function(err, scount) {
					if(err) {
						return done(err);
					}
					
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Anthony', 'invitee_lName' : 'Moore', 'invitee_email' : 'a.moore_cen3031.0.boom0625@spamgourmet.com', 'organization' : 'Marines', 'event_name' : event1.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							if(err) {
								return done(err);
							}
							
							should.not.exist(err);
							res.status.should.equal(200);
							User.findOne({_id : user._id}, function(err, rectr) {
								if(err) {
									return done(err);
								}
								
								((oldRectr.inviteeList.length - 1) === rectr.inviteeList.length).should.be.true;
								(oldRectr.attendeeList.length < rectr.attendeeList.length).should.be.true;
								(oldRectr.almostList.length === rectr.almostList.length).should.be.true;
								User.count({}, function(err, fcount) {
									if(err) {
										return done(err);
									}
									
									fcount.should.be.greaterThan(scount);
									User.findOne({email : 'a.moore_cen3031.0.boom0625@spamgourmet.com'}, function(err, newUser) {
										if(err) {
											return done(err);
										}
										
										newUser.status.length.should.equal(1);
										var i;
										for(i=0; i<newUser.status.length; i++) {
											if(newUser.status[i].event_id.toString() === event1._id.toString()) {
												newUser.status[i].attending.should.be.true;
												break;
											}
										}
										i.should.not.equal(newUser.status.length);

										Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
											if(err) {
												return done(err);
											}
											
											newEvnt.attending.should.equal(event1.attending + 1);
											newEvnt.invited.should.equal(event1.invited - 1);

											done();
										});
									});
								});
							});
						});
				});
			});
		});

		it('should allow an outside source to send data when the correct API key is sent and update the a user\'s account, the number of attendees, all other recruiter\'s lists, and ranks for the event accordingly if they were already invited.', function(done) {
			this.timeout(100000);
			User.findOne({_id : user._id}, function(err, oldRectr) {
				if(err) {
					return done(err);
				}

				var tempUser1 = new User({
					fName : 'Calvin',
					lName : 'Moore',
					displayName : 'Moore, Calvin',
					email : 'tempUser1_cen3031.0.boom0625@spamgourmet.com',
					roles : ['recruiter'],
					status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}],
					rank : [{'event_id':event1._id, 'place':1}],
					password : 'password',
					attendeeList : [{'user_id' : user2._id, 'event_id' : event1._id}, {'user_id' : user4._id, 'event_id' : event1._id}, {'user_id' : user3._id, 'event_id' : event1._id}],
					inviteeList : [{'user_id' : user5._id, 'event_id' : event1._id}],
					almostList : [{'user_id' : user2._id, 'event_id' : event2._id}],
					login_enabled : true
				});

				var tempUser2 = new User({
					fName : 'Calvin',
					lName : 'Moore',
					displayName : 'Moore, Calvin',
					email : 'tempUser2_cen3031.0.boom0625@spamgourmet.com',
					roles : ['recruiter'],
					status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}],
					rank : [{'event_id':event1._id, 'place': 3}],
					password : 'password',
					attendeeList : [],
					inviteeList : [{'user_id' : user5._id, 'event_id' : event1._id, read : true}],
					almostList : [{'user_id' : user2._id, 'event_id' : event2._id}],
					login_enabled : true
				});

				var tempUser3 = new User({
					fName : 'Calvin',
					lName : 'Moore',
					displayName : 'Moore, Calvin',
					email : 'tempUser3_cen3031.0.boom0625@spamgourmet.com',
					roles : ['recruiter'],
					status : [{'event_id':event1._id, 'attending':true, 'recruiter':true}],
					rank : [{'event_id':event1._id, 'place': 4}],
					password : 'password',
					attendeeList : [{'user_id' : user2._id, 'event_id' : event1._id}],
					inviteeList : [{'user_id' : user5._id, 'event_id' : event1._id}],
					almostList : [],
					login_enabled : true
				});

				tempUser1.save(function(err) {
					should.not.exist(err);

					tempUser2.save(function(err) {
						should.not.exist(err);

						tempUser3.save(function(err) {
							should.not.exist(err);

							User.count({}, function(err, scount) {
								if(err) {
									return done(err);
								}

								var tempagent = agent.agent();
								tempagent
									.post('http://localhost:3001/invitation/accept')
									.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : user5.fName, 'invitee_lName' : user5.lName, 'invitee_email' : user5.email, 'organization' : 'frank', 'event_name' : event1.name, 'recruiter_email' : user.email})
									.end(function(err, res) {
										should.not.exist(err);
										res.status.should.equal(200);
										User.findOne({_id : user._id}, function(err, rectr) {
											if(err) {
												return done(err);
											}
											
											((oldRectr.inviteeList.length - 1) === rectr.inviteeList.length).should.be.true;
											(oldRectr.attendeeList.length < rectr.attendeeList.length).should.be.true;
											(oldRectr.almostList.length === rectr.almostList.length).should.be.true;

											var i;
											for(i = 0; i < rectr.rank.length; i++) {
												if(rectr.rank[i].event_id.toString() === event1._id.toString()) {
													rectr.rank[i].place.should.equal(1);
													break;
												}
											}
											i.should.not.equal(rectr.rank.length);

											User.count({}, function(err, fcount) {
												if(err) {
													return done(err);
												}
												
												fcount.should.equal(scount);
												User.findOne({_id : user5._id}, function(err, newUser5) {
													if(err) {
														return done(err);
													}
													
													newUser5.status.length.should.equal(user5.status.length);
													for(i=0; i<newUser5.status.length; i++) {
														if(newUser5.status[i].event_id.toString() === event1._id.toString()) {
															newUser5.status[i].attending.should.be.true;
															break;
														}
													}
													i.should.not.equal(newUser5.status.length);

													Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
														if(err) {
															return done(err);
														}
														
														newEvnt.attending.should.equal(event1.attending + 1);
														newEvnt.invited.should.equal(event1.invited - 1);

														User.findOne({_id : tempUser1._id}, function(err, newTempUser1) {
															should.not.exist(err);

															newTempUser1.rank[0].place.should.equal(2);
															newTempUser1.inviteeList.length.should.equal(0);
															newTempUser1.almostList.length.should.equal(2);

															User.findOne({_id : tempUser2._id}, function(err, newTempUser2) {
																should.not.exist(err);

																console.log(event1._id);
																console.log(newTempUser2);

																newTempUser2.rank[0].place.should.equal(5);
																newTempUser2.inviteeList.length.should.equal(0);
																newTempUser2.almostList.length.should.equal(2);
																for(i = 0; i < newTempUser2.almostList.length; i++) {
																	if(newTempUser2.almostList[i].user_id.toString() === user5._id.toString() && newTempUser2.almostList[i].event_id.toString() === event1._id.toString()) {
																		newTempUser2.almostList[i].read.should.be.true;
																		break;
																	}
																}
																i.should.not.equal(newTempUser2.almostList.length);

																User.findOne({_id : tempUser3._id}, function(err, newTempUser3) {
																	should.not.exist(err);

																	newTempUser3.rank[0].place.should.equal(4);
																	newTempUser3.inviteeList.length.should.equal(0);
																	newTempUser3.almostList.length.should.equal(1);

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
			});
		});

		it('should send an error when the invitee_fName is missing.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_lName' : 'Moore', 'invitee_email' : 'a.moore_cen3031.0.boom0625@spamgourmet.com', 'organization' : 'Marines', 'event_name' : event1.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('All required fields not specified.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event1.attending);
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
				});
			});
		});

		it('should send an error when the invitee_lName is missing.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Moore', 'invitee_email' : 'a.moore_cen3031.0.boom0625@spamgourmet.com', 'organization' : 'Marines', 'event_name' : event1.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('All required fields not specified.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event1.attending);
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
				});
			});
		});

		it('should send an error when the invitee_email is missing.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Calvin', 'invitee_lName' : 'Moore', 'organization' : 'Marines', 'event_name' : event1.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('All required fields not specified.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event1.attending);
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
				});
			});
		});

		it('should send an error when the organization is missing.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Calvin', 'invitee_lName' : 'Moore', 'invitee_email' : 'h.m.murdock95@gmail.com', 'event_name' : event1.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('All required fields not specified.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event1.attending);
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
				});
			});
		});

		it('should send an error when the event_name is missing.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Calvin', 'invitee_lName' : 'Moore', 'invitee_email' : 'h.m.murdock95@gmail.com', 'organization' : 'frank', 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('All required fields not specified.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event1.attending);
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
				});
			});
		});

		it('should send an error when the event_name is not in the database.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Calvin', 'invitee_lName' : 'Moore', 'invitee_email' : 'h.m.murdock95@gmail.com', 'organization' : 'frank', 'event_name' : 'EventName that is not in our db!!!', 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('Event not found.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event1.attending);
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
				});
			});
		});

		it('should send an error when the recruiter_email is missing.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Calvin', 'invitee_lName' : 'Moore', 'invitee_email' : 'h.m.murdock95@gmail.com', 'organization' : 'frank', 'event_name' : event2.name})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('All required fields not specified.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event2.attending);
								newEvnt.invited.should.equal(event2.invited);

								done();
							});
						});
				});
			});
		});

		it('should return an error when the api_key is missing', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'invitee_fName' : 'Anthony', 'invitee_lName' : 'Moore', 'invitee_email' : 'a.moore_cen3031.0.boom0625@spamgourmet.com', 'organization' : 'Marines', 'event_name' : event1.name, 'recruiter_email' : user.email})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal("You are not authorized to make this request.");

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event1.attending);
								newEvnt.invited.should.equal(event1.invited);

								done();
							});
						});
				});
			});
		});

		it('should send an error when the recruiter_email is a function.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				User.count({}, function(err, scount) {
					var tempagent = agent.agent();
					tempagent
						.post('http://localhost:3001/invitation/accept')
						.send({'api_key' : 'qCTuno3HzNfqIL5ctH6IM4ckg46QWJCI7kGDuBoe', 'invitee_fName' : 'Calvin', 'invitee_lName' : 'Moore', 'invitee_email' : 'h.m.murdock95@gmail.com', 'organization' : 'frank', 'event_name' : event2.name, 'recruiter_email' : 1234})
						.end(function(err, res) {
							should.not.exist(err);
							res.status.should.equal(400);
							res.body.message.should.equal('Illegal value for field recruiter_email.');

							Evnt.findOne({_id : event1._id}, function(err, newEvnt) {
								newEvnt.attending.should.equal(event2.attending);
								newEvnt.invited.should.equal(event2.invited);

								done();
							});
						});
				});
			});
		});


		/*it('should send an invitation and update the recruiter\'s rank and inviteeList accordingly when an invitee is already in the database, but not not even invited the event, without adding a new user.', function(done) {
			this.timeout(10000);
			User.count({}, function(err, scount) {
				useragent
					.post('http://localhost:3001/invitation/accept')
					.send({'fName' : user3.fName, 'lName' : user3.lName, 'email' : user3.email, 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						User.findOne({_id : user._id}, function(err, rectr) {
							(user.inviteeList.length < rectr.inviteeList.length).should.be.true;
							(user.attendeeList.length === rectr.attendeeList.length).should.be.true;
							(user.almostList.length === rectr.almostList.length).should.be.true;
							User.count({}, function(err, fcount) {
								fcount.should.equal(scount);
								User.findOne({_id : user3._id}, function(err, newUser3) {
									newUser3.status.length.should.be.greaterThan(user3.status.length);
									done();
								});
							});
						});
					});
			});
		});

		it('should send an invitation, create a new user, and update the recruiter\'s rank and inviteeList accordingly when an invitee is not in the db yet.', function(done) {
			this.timeout(10000);
			User.count({}, function(err, scount) {
				useragent
					.post('http://localhost:3001/invitation/accept')
					.send({'lName' : 'Moore', 'fName' : 'Calvin', 'email' : 'h.m.murdock95@gmail.com', 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						User.findOne({_id : user._id}, function(err, rectr) {
							(user.inviteeList.length < rectr.inviteeList.length).should.be.true;
							(user.attendeeList.length === rectr.attendeeList.length).should.be.true;
							(user.almostList.length === rectr.almostList.length).should.be.true;
							User.count({}, function(err, fcount) {
								fcount.should.be.greaterThan(scount);
								User.findOne({email : 'h.m.murdock95@gmail.com'}, function(err, newUser3) {
									newUser3.status.length.should.equal(1);
									done();
								});
							});
						});
					});
			});
		});

		it('should not send an invitation, but update the recruiter\'s almostList when that user is attending.', function(done) {
			User.findOne({_id : user._id}, function(err, oldRectr) {
				useragent
					.post('http://localhost:3001/invitation/accept')
					.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
					.end(function(err, res) {
						should.not.exist(err);
						res.status.should.equal(200);
						res.body.message.should.equal(user2.fName + " " + user2.lName + " is already attending frank.  You're thinking of the right people.");
						User.findOne({_id : user._id}, function(err, rectr) {
							(oldRectr.inviteeList.length === rectr.inviteeList.length).should.be.true;
							(oldRectr.attendeeList.length === rectr.attendeeList.length).should.be.true;
							(oldRectr.almostList.length < rectr.almostList.length).should.be.true;
							done();
						});
					});
			});
		});

		it('should not send an invitation when the user does not have the proper permissions.', function(done) {
			useragent2
				.post('http://localhost:3001/invitation/accept')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User does not have permission.");
					done();
				});
		});

		it('should not send an invitation when the user is not signed in to their account.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.post('http://localhost:3001/invitation/accept')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");
					done();
				});
		});

		it('should return an error when invitee first name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/accept')
				.send({'lName' : user2.lName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when invitee last name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/accept')
				.send({'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when invitee email is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/accept')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'event_id' : event1._id, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when the event ID is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/accept')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_name' : event1.name})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});

		it('should return an error when the event name is not specified.', function(done) {
			useragent
				.post('http://localhost:3001/invitation/accept')
				.send({'lName' : user2.lName, 'fName' : user2.fName, 'email' : user2.email, 'event_id' : event1._id})
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(400);
					res.body.message.should.equal("Required fields not specified.");
					done();
				});
		});*/
	});

	describe('Obtain specific user information:', function() {
		it('should return the user displayname, which should be in the format "Last, First"', function(done) {
			useragent
				.get('http://localhost:3001/users/displayName')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.displayName.should.equal(user.displayName);
					done();
				});
		});

		it('should return an error when requesting the displayname if the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/users/displayName')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal("User is not logged in.");
					done();
				});
		});

		it('should return the user email address', function(done) {
			useragent
				.get('http://localhost:3001/users/email')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(200);
					res.body.email.should.equal(user.email);
					done();
				});
		});

		it('should return an error when requesting user email address if the user is not logged in.', function(done) {
			var useragent3 = agent.agent();
			useragent3
				.get('http://localhost:3001/users/email')
				.end(function(err, res) {
					should.not.exist(err);
					res.status.should.equal(401);
					res.body.message.should.equal('User is not logged in.');
					done();
				});
		});
	});

	afterEach(function(done) {
		user = user2 = user3 = user4 = user5 = user6 = null;
		useragent = agent.agent(), useragent2 = agent.agent();

		User.remove(function(err) {
			if(err)
				return done(err);

			Evnt.remove(function(err) {
				if(err)
					return done(err);

				done();
			});
		});
	});

});
