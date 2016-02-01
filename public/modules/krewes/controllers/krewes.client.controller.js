'use strict';

angular.module('krewes').controller('KreweController', ['$scope', 'Authentication', '$http', '$location', 'eventSelector', '$timeout', 'localStorageService', 'frankInterests', '$modal', '$window', '$filter',
	function($scope, Authentication, $http, $location, eventSelector, $timeout, localStorageService, frankInterests, $modal, $window, $filter) {
		if(!Authentication.user || _.intersection(Authentication.user.roles, ['admin', 'kreweAdmin', 'kaptain']).length === 0) {
			if(!Authentication.user) {
				$location.path('/signin');
			} else {
				$location.path('/');
			}
		} else {
			if(_.intersection(Authentication.user.roles, ['admin', 'kreweAdmin']).length !== 0) {
				/*** scope Variables ***/
				$scope.krewes = [];
				$scope.potentialMembers = [];
				$scope.newPotentialMembers = [];
				$scope.nameLock = -1;

				// Dictionary of potential interests as the key and the path to their image as the value.
				$scope.interestsSource = frankInterests.interests;

				/*** Variables ***/
				var originalDataPrefix = "original_";		// Prefix to add to original krewe data.
				var currentDataPrefix = "dirty_";			// Prefix to add to current version of krewe data.
				var deltaPrefix = "delta_";					// Prefix to add to delta information.
				var potentialMembersPrefix = "potential_";	// Prefix to add to current potential members.

				/**
				* Load all saved krewes in database and transform them to a format expected by 
				* the drag and drop plugin.
				*
				* @param convertKaptain <Boolean> (optional) - true if the Kaptain field should be converted to an
				* 	array.  The default value is true.
				* @param done(err, data) <function> (optional) - callback function with the following parameters
				*		err - null if no error occurred, status code otherwise
				*		data - data obtained from server
				*/
				var loadKrewes = function(convertKaptain, done) {
					if(typeof convertKaptain !== 'boolean') {
						if(!done) {
							done = convertKaptain;
						}

						convertKaptain = true;
					}

					$http.post('/krewes', {event_id: eventSelector.postEventId}).success(function(kreweData, status) {
						// Transform the kaptain field for each krewe to the format dnd expects.
						if(convertKaptain) {
							for (var i = kreweData.length - 1; i >= 0; i--) {
								if(!kreweData[i].kaptain) {
									kreweData[i].kaptain = [];

									continue;
								}

								kreweData[i].kaptain = [kreweData[i].kaptain];
							}
						}

						if(done && {}.toString.call(done) === '[object Function]') {
							done(null, kreweData);
						}
					}).error(function(errMessage, status) {
						if(done && {}.toString.call(done) === '[object Function]') {
							done(status, errMessage);
						}
					});
				};

				/**
				* Load all the potential members from the database.
				*
				* @param done(err, data) <function> (optional) - callback function with the following parameters
				*		err - null if no error occurred, status code otherwise
				*		data - data obtained from server
				*/
				var loadPotentialMembers = function(done) {
					$http.post('/krewes/users', {event_id: eventSelector.postEventId}).success(function(unassignedUsers, status) {
						if(done && {}.toString.call(done) === '[object Function]') {
							done(null, unassignedUsers);
						}
					}).error(function(errMessage, status) {
						if(done && {}.toString.call(done) === '[object Function]') {
							done(status);
						}
					});
				};

				/**
				* Performs a binary search on haystack, which is an array of objects with an _id field, to find the object
				* with the _id field equal to needle.  If haystack is not sorted, this search will fail.  If needle could
				* not be found, null is returned.
				*
				* @param needle <String> - the _id of the Krewe that needs to be found
				* @param haystack <[Object]> - the array of Krewes through which to search
				*
				* @return <Int> - index of needle or null if needle was not found
				*/
				var binarySearch = function(needle, haystack) {
					var index;
					var lowerBounds = 0;
					var upperBounds = haystack.length - 1;
					console.log(haystack);
					console.log(haystack.length);
					console.log(upperBounds);

					while(true) {
						if(lowerBounds > upperBounds) {
							return null;
						}

						index = lowerBounds + Math.floor((upperBounds - lowerBounds) / 2);
						console.log(lowerBounds, index, upperBounds);

						if(haystack[index]._id === needle) {
							return index;
						} else if(haystack[index]._id > needle) {
							upperBounds = index - 1;
						} else {
							lowerBounds = index + 1;
						}
					}
				};

				/**
				* Returns the difference between setA and setB (setA \ setB).  An item in a set is determined using the
				* keys of the sets.
				*
				* @param setA <Object> - the object to inspect.  Each key should be an item in the set.
				* @param setB <Object> - the object with items to exclude.  Each key should be an item in the set.
				*
				* @return <[Object]> A set containing those items in setA, but not in setB
				*/
				var setDifference = function(setA, setB) {
					var setAKeys = _.keys(setA);
					var difference = {};

					for(var setAIndex = setAKeys.length - 1; setAIndex >= 0; setAIndex--) {
						if(!setB[setAKeys[setAIndex]]) {
							difference[setAKeys[setAIndex]] = setA[setAKeys[setAIndex]];
						}
					}

					return difference;
				};

				/**
				* Iterates over each of the deltas (recursively) and detects and resovles conflicts if any are found.
				*
				* @param localKrewes <[Object]> - data for all modified Krewes
				* @param serverKrewes <[Object]> - sorted version of Krewes on the server
				* @param deltas <Object> - all deltas stored for this event
				* @param deltaKeys <[String]> - the keys used in deltas
				* @param deltaIndex <Int> - the index of the delta to use.  This value should always be 0 when calling from outside this function.
				* @param callback <Function> - the function that should be called after all conflicts have been resolved.
				*/
				var scanNonMemberFields = function(localKrewes, serverKrewes, deltas, deltaKeys, deltaIndex, callback) {
					if(deltas.length === deltaIndex) {
						callback();
					}

					var localKrewe;			// Populated only if a conflict is found.
					var serverIndex = binarySearch(deltaKeys[deltaIndex], serverKrewes);

					async.series([
						function(asyncSeriesCallback) {
							console.log(deltaKeys[deltaIndex]);
							console.log(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex]);
							console.log(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && deltaKeys[deltaIndex] != 0);
							if(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && serverIndex === null) {
								// Server version was not found.  This item has been deleted.  Ask the user what to do.  If the user wants to keep the krewe, the krewe's _id needs to be set to null to be assigned a new krewe.localKrewe = localChanges[binarySearch(deltaKeys[deltaIndex], localChanges)];
								queryUser(UserQueryTypes.kreweMissing, localKrewe, function(selection) {
									if(selection === 0) {
										// Delete this Krewe.
										deltaKeys.splice(deltaIndex, 1);
										deltaIndex--;
									}

									asyncSeriesCallback();
								});
							} else {
								asyncSeriesCallback();
							}
						},
						function(asyncSeriesCallback) {
							var currentDelta = deltas[deltaKeys[deltaIndex]];
							var serverKrewe = serverKrewes[serverIndex];

							console.log("*********************");
							console.log(currentDelta);
							console.log(serverKrewe);
							console.log("*********************");

							async.parallel([
								function(asyncParallelCallback) {
									if(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && currentDelta.name && currentDelta.name.original !== serverKrewe.name && currentDelta.name.current !== serverKrewe.name) {
										// Cannot resolve automatically.  Ask the user which version to keep (original, current, server).
										if(!localKrewe) {
											localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
										}

										queryUser(UserQueryTypes.kreweName, localKrewe, serverKrewes[serverIndex], function(selection) {
											if(selection === 0) {
												// Sever version was chosen.  Update the local version.
												localKrewe.name = serverKrewe.name;
											} else if(selection === 1) {
												// Local version was chosen.  Update the server version.
												serverKrewe.name = localKrewe.name;
											}

											asyncParallelCallback();
										});
									}  else if(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex]) {
										if(!localKrewe) {
											localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
										}

										// Either the localKrewe already has the name on the server, or the server was updated last.  Either way, the version saved to the server should have the name for serverKrewe.
										localKrewe.name = serverKrewe.name;

										asyncParallelCallback();
									} else {
										asyncParallelCallback();
									}
								},
								function(asyncParallelCallback) {
									if(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && currentDelta.kaptain && currentDelta.kaptain.original !== serverKrewe.kaptain[0]._id && currentDelta.kaptain.current !== serverKrewe.kaptain[0]._id) {
										// Cannot resolve automatically.  Ask the user which version to keep (original, current, server).
										if(!localKrewe) {
											localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
										}

										queryUser(UserQueryTypes.kreweKaptain, localKrewe, serverKrewes[serverIndex], function(selection) {
											if(selection === 0) {
												// Sever version was chosen.  Update the local version.
												localKrewe.kaptain = serverKrewe.kaptain;
											} else if(selection === 1) {
												// Local version was chosen.  Update the server version.
												serverKrewe.kaptain = localKrewe.kaptain;
											}

											asyncParallelCallback();
										});
									} else if(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex]) {
										if(!localKrewe) {
											localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
										}

										// Either the localKrewe already has the same kaptain as on the server, or the server was updated last.  Either way, the version saved to the server should have the same kaptain as already on the server.
										localKrewe.kaptain = serverKrewe.kaptain;

										asyncParallelCallback();
									} else {
										asyncParallelCallback();
									}
								}
							], function(error, results) {
								asyncSeriesCallback();
							});
						}
					], function(error, results) {
						if(++deltaIndex < deltaKeys.length) {
							scanNonMemberFields(localKrewes, serverKrewes, deltas, deltaKeys, deltaIndex, callback);
						} else {
							callback();
						}
					});
				};

				/**
				* Closely examines conflicts and attempts to resolve them.  If a conflict cannot be resolved, notify
				* the user and let them determine which copy to maintain.  Conflicts that can be resolved
				* automatically include:
				*		- Changes to different Krewes
				*		- Changes to different data for the same Krewe
				*		- Changes to elements in arrays such as:
				*			- The same member being added to a Krewe
				*			- Different members being added and removed from the Krewe without adding them 
				*				to another Krewe
				* To resolve conflicts, the newest version will be used.  This means if the server version was modified,
				* but the local version was not, the server version will be kept since it was last modified.  If both
				* versions have been modified, the user will have to determine which version to keep.
				*
				* @param deltas <Object> - all deltas stored for this event
				* @param localChanges <[Object]> - data for all modified Krewes
				* @param originalVersion <[Object]> - sorted original version of Krewes before changes were made
				* @param serverVersion <[Object]> - sorted version of Krewes on the server
				* @param potentialUsers <[Object]> - list of all users that have not been assigned a Krewe locally
				*/
				var resolveConflicts = function(deltas, localChanges, originalVersion, serverVersion, callback) {
					var deltaKeys = _.keys(deltas);
					var tempIdMax = getNextId(eventSelector.postEventId.toString());

					// Sort the krewe arrays for quicker lookup.
					quickSortKrewes(serverVersion);
					quickSortKrewes(localChanges);

					// Check each delta and determine if a conflict can be resolved programatically.
					scanNonMemberFields(localChanges, serverVersion, deltas, deltaKeys, 0, function() {
						// If no changes have been made to this Krewe locally, the server version will be used.  If changes have been
						// made, the following considerations need to be made based on how the members changed:
						//	- Deletion - 	If the member does not appear anywhere else on the server, the user needs to be added back
						//					back to the potentialMembers.  If the member exists somewhere else, no further actions
						//					are necessary.
						// 	- Addition -	If the member was not previously part of a different krewe, the user needs to be removed
						//					from the potentialMembers, which occurs automaticaly.  If the member was previously part
						//					of a different krewe, no further actions are required anyways.
						// Conflicts are considered differently.  A conflict only exists if the same member was added to different
						// Krewes on the server and locally.  To detect this type of conflict, we will have to search the server
						// version for all members that were added to a Krewe.  If the member exists in a different Krewe than the
						// server and original versions, a conflict exists.  To speed up searching through the server and local
						// array of members, an object will be created for both.
						var localMembers = {};
						var localMemberKeys = [];
						var kaptains = {};
						var kaptainConflicts = {};
						var conflictingKaptainKeys = [];
						for(var localIndex = localChanges.length - 1; localIndex >= 0; localIndex--) {
							var currentKreweId = localChanges[localIndex]._id.toString();
							var currentKaptain = null;

							if(localChanges[localIndex].kaptain && localChanges[localIndex].kaptain.length) {
								currentKaptain = localChanges[localIndex].kaptain[0]._id;
							}

							if(currentKaptain) {
								kaptains[currentKaptain] = {
									krewe: 		currentKreweId,
									kreweIndex:	localIndex
								};
							}

							for(var localMemberIndex = localChanges[localIndex].members.length - 1; localMemberIndex >= 0; localMemberIndex--) {
								var currentMemberId = localChanges[localIndex].members[localMemberIndex]._id;

								localMembers[currentMemberId] = {
									krewe: 			currentKreweId,
									kreweIndex: 	localIndex,
									memberIndex: 	localMemberIndex,
									original: 		currentKreweId
								};
								localMemberKeys.push(currentMemberId);

								if(deltas[currentKreweId] && deltas[currentKreweId].members[currentMemberId]) {
									// This member was added to this Krewe locally.
									localMembers[currentMemberId].action = deltas[currentKreweId].members[currentMemberId].action;

									// Find the original Krewe from which they were removed.
									for(var deltaIndex = deltaKeys.length - 1; deltaIndex >= 0; deltaIndex--) {
										if(deltaKeys[deltaIndex] === currentKreweId) {
											continue;
										}

										if(deltas[deltaKeys[deltaIndex]].members && deltas[deltaKeys[deltaIndex]].members[currentMemberId]) {
											localMembers[currentMemberId].original = deltaKeys[deltaIndex];
										}
									}
								}
							}
						}

						// Make sure the members that no longer part of a Krewe are included.
						for(var deltaIndex = deltaKeys.length - 1; deltaIndex >= 0; deltaIndex--) {
							var deltaMembers = _.keys(deltas[deltaKeys[deltaIndex]].members);

							for(var memberIndex = deltaMembers.length - 1; memberIndex >= 0; memberIndex--) {
								if(!localMembers[deltaMembers[memberIndex]] && !kaptains[deltaMembers[memberIndex]]) {
									// This member does not exist in localMembers, add him/her.
									localMembers[deltaMembers[memberIndex]] = {
										krewe: 		null,
										original: 	deltaKeys[deltaIndex],
										action: 	'-'
									};
								}
							}
						}

						var serverMembers = {};
						var serverMemberConflicts = {};
						var serverMemberKeys = [];
						for(var serverIndex = serverVersion.length - 1; serverIndex >= 0; serverIndex--) {
							var currentKreweId = serverVersion[serverIndex]._id;
							var currentKaptain = null;

							if(serverVersion[serverIndex].kaptain && serverVersion[serverIndex].kaptain.length) {
								currentKaptain = serverVersion[serverIndex].kaptain[0]._id;
							}

							if(currentKaptain && kaptains[currentKaptain] && kaptains[currentKaptain].krewe !== currentKreweId) {
								// Conflict!  This Kaptain is a Kaptain for more than one group.
								kaptainConflicts[currentKaptain] = kaptains[currentKaptain];
								kaptainConflicts[currentKaptain].conflictingKrewe = currentKreweId;
								kaptainConflicts[currentKaptain].conflictingKreweIndex = serverIndex;

								conflictingKaptainKeys.push(currentKaptain);
							}

							for(var serverMemberIndex = serverVersion[serverIndex].members.length - 1; serverMemberIndex >= 0; serverMemberIndex--) {
								var currentMemberId = serverVersion[serverIndex].members[serverMemberIndex]._id;

								serverMembers[currentMemberId] = {
									krewe: 			currentKreweId,
									kreweIndex: 	serverIndex,
									memberIndex: 	serverMemberIndex
								};

								if(!localMembers[currentMemberId]) {
									// This member was added by another.  Merge the changes only if the Krewe is already in the local version and won't be overwritten later.
									if(deltas[currentKreweId]) {
										localChanges[binarySearch(currentKreweId, localChanges)].members.push(serverVersion[serverIndex].members[serverMemberIndex]);
									}

									continue;
								} else if(localMembers[currentMemberId].krewe === currentKreweId || localMembers[currentMemberId].original === currentKreweId) {
									// No conflict.  Use the local version.
									continue;
								}

								serverMemberConflicts[currentMemberId] = serverMembers[currentMemberId];
								serverMemberKeys.push(currentMemberId);
							}
						}

						if(conflictingKaptainKeys.length) {
							scanKaptains(localChanges, serverVersion, kaptainConflicts, conflictingKaptainKeys, 0, function() {
								if(serverMemberKeys.length) {
									scanMembers(serverVersion, localChanges, serverMemberConflicts, localMembers, serverMemberKeys, 0, function() {
										mergeKrewes(localChanges, serverVersion, localMembers, serverMembers, deltas);

										callback();
									});
								} else {
									mergeKrewes(localChanges, serverVersion, localMembers, serverMembers, deltas);

									callback();
								}
							});
						} else {
							if(serverMemberKeys.length) {
								scanMembers(serverVersion, localChanges, serverMemberConflicts, localMembers, serverMemberKeys, 0, function() {
									mergeKrewes(localChanges, serverVersion, localMembers, serverMembers, deltas);

									callback();
								});
							} else {
								mergeKrewes(localChanges, serverVersion, localMembers, serverMembers, deltas);

								callback();
							}
						}
					});
				};

				/**
				* Merges any changes from the server that are not already local and strips any duplicate Kaptains.
				*/
				var mergeKrewes = function(localKrewes, serverKrewes, localMembers, serverMembers, deltas) {
					// Find Krewes that were not modified and replace them with the server version.
					for(var serverIndex = serverKrewes.length - 1; serverIndex >= 0; serverIndex--) {
						if(!deltas[serverKrewes[serverIndex]._id]) {
							// No deltas exist for this Krewe.
							var localIndex = binarySearch(serverKrewes[serverIndex]._id, localKrewes);

							if(localIndex || localIndex === 0) {
								localKrewes[localIndex] = serverKrewes[serverIndex];
							} else {
								localKrewes.push(serverKrewes[serverIndex]);
							}
						}
					}

					// Make sure there is no overlap of Kaptains and Krewe members.  Since Kaptain conflicts have been resolved, Kaptains supercede member status.
					for(var localIndex = localKrewes.length - 1; localIndex >= 0; localIndex--) {
						if(!localKrewes[localIndex].kaptain.length) {
							continue;
						}

						var kaptainId = localKrewes[localIndex].kaptain[0]._id;

						if(localMembers[kaptainId]) {
							if(localMembers[kaptainId].krewe) {
								localKrewes[localMembers[kaptainId].kreweIndex].members.splice(localMembers[kaptainId].memberIndex, 1);

								// for(var memberIndex = localMemberKeys.length - 1; memberIndex >= 0; memberIndex--) {
								// 	if(localMembers[localMemberKeys[memberIndex]].memberIndex > localMembers[kaptainId].memberIndex && localMembers[localMemberKeys[memberIndex]].krewe === localMembers[kaptainId].krewe) {
								// 		localMembers[localMemberKeys[memberIndex]].memberIndex--;
								// 	}
								// }
							}

							delete localMembers[kaptainId];
						} else if(serverMembers[kaptainId]) {
							if(serverMembers[kaptainId].krewe) {
								// At this point, the server and local Krewes have been merged.
								var index = binarySearch(serverMembers[kaptainId].krewe, localKrewes);
								localKrewes[index].members.splice(serverMembers[kaptainId].memberIndex, 1);
							}

							delete serverMembers[kaptainId];
						}
					}
				}

				/**
				* Scans the missing members recursively so the system can "pause" while waiting for user input (i.e., the
				* system will not continue resolving conflicts until callback is called).
				*
				* @param missingMembers <[Object]> - an array of the missing members
				* @param index <Int> - this value should always be 0 when being called by an outside function.
				* @param callback <Function> - callback function to be called after all missing members have received user feedback
				*/
				// var scanMissingMembers = function(serverKrewes, localKrewes, missingMembers, index, callback) {
				// 	queryUser(UserQueryTypes.missingMembers, serverKrewes[missingMembers[index].kreweIndex], missingMembers[index].memberIndex, function(selection) {
				// 		// Handle selection.
				// 		if(selection === 1) {
				// 			localKrewes[binarySearch(missingMembers[index].krewe, localKrewes)].members.push(serverKrewes[missingMembers[index].kreweIndex].members[missingMembers[index].memberIndex]);
				// 		}

				// 		if(missingMembers.length > index) {
				// 			scanMissingMembers(missingMembers, ++index, callback);
				// 		} else {
				// 			callback();
				// 		}
				// 	});
				// };

				/**
				* Iterates over the members in conflictingKaptainKeys and detects and resolves any conflicts recursively.
				*/
				var scanKaptains = function(localKrewes, serverKrewes, kaptainConflicts, conflictingKaptainKeys, index, callback) {
					var conflictingKaptain = kaptainConflicts[conflictingKaptainKeys[index]];

					queryUser(UserQueryTypes.kreweKaptain, localKrewes[conflictingKaptain.kreweIndex], serverKrewes[conflictingKaptain.conflictingKreweIndex], function(selection) {
						if(selection === 0) {
							localKrewes[conflictingKaptain.kreweIndex].kaptain = [];
						} else {
							serverKrewes[conflictingKaptain.conflictingKreweIndex].kaptain = [];
						}

						if(conflictingKaptainKeys.length > ++index) {
							scanKaptains(localKrewes, kaptainConflicts, conflictingKaptainKeys, index, callback);
						} else {
							callback();
						}
					});
				};

				/**
				* Iterates over the members in serverMemberKeys and detects and resolves any conflicts recursively.
				*/
				var scanMembers = function(serverKrewes, localKrewes, serverMembers, localMembers, serverMemberKeys, serverIndex, callback) {
					var serverMember = serverMembers[serverMemberKeys[serverIndex]];
					var localMember = localMembers[serverMemberKeys[serverIndex]];

					queryUser(UserQueryTypes.kreweMember, localKrewes[localMember.kreweIndex], serverKrewes[serverMember.kreweIndex], serverMember.memberIndex, localMember.memberIndex, function(selection) {
						if(selection === 0) {
							var displacedMember = localKrewes[localMember.kreweIndex].members.splice(localMember.memberIndex, 1)[0];
							var localIndex = binarySearch(serverMember.krewe, localKrewes);

							// If this Krewe exists on the local version, add the member.  Otherwise, the entire Krewe will be added later.
							if(localIndex) {
								localKrewes[localIndex].members.push(displacedMember);
							}

							delete localMembers[serverMemberKeys[serverIndex]];
						} else {
							serverKrewes[serverMember.kreweIndex].members.splice(serverMember.memberIndex, 1)[0];

							delete serverMembers[serverMemberKeys[serverIndex]];
						}

						if(serverMemberKeys.length > ++serverIndex) {
							scanMembers(serverKrewes, localKrewes, serverMembers, localMembers, serverMemberKeys, serverIndex, callback);
						} else {
							callback();
						}
					});
				};

				/**
				* Possible query types for queryUser.
				*/
				var UserQueryTypes = Object.freeze({
					kreweName: 		1,
					kreweKaptain: 	2,
					kreweMember: 	3,
					kreweMissing: 	4,
					memberMissing: 	5
				});

				/**
				* Queries the user as to which version of the a Krewe the user wishes to keep.
				*
				* @param queryType <UserQueryTypes> - the type of conflict that was detected
				* @param localKrewe <Object> - the local version of the Krewe in which the conflict exists
				* @param serverKrewe <Object> - required if queryType is not kreweMissing.  The server version of the Krewe in which the conflict exists
				* @param serverMemberIndex <Int> - required only if queryType is kreweMember.  The index of the member causing the conflict in the server version of the Krewe
				* @param serverMemberIndex <Int> - required only if queryType is kreweMember.  The index of the member causing the conflict in the local version of the Krewe
				* @param callback <Function(selection)> - calback function that will return the user's choice.  See table below for possible values of selection and their meanings.
				*
				*	|---------------------------------------------------------------|
				*	|_Value_|_______________________Meaning_________________________|
				*	|  -1 	| Error occurred										|
				*	|		| If queryType is kreweMissing or memberMissing,		|
				*	|	0	|		the user chose to delete the Krewe.  Otherwise,	|
				*	|		|		the server version was selected. 				|
				*	|	 	| If queryType is kreweMissing or memberMissing,		|
				*	|	1	|		the user chose to keep the Krewe.  Otherwise,	|
				*	|		|		the local version was selected.					|
				*	|---------------------------------------------------------------|
				*/
				var queryUser = function(queryType, localKrewe, serverKrewe, serverMemberIndex, localMemberIndex, callback) {
					console.log(!queryType);
					console.log((queryType !== UserQueryTypes.kreweMissing && (!serverKrewe || typeof serverKrewe !== "object")));
					console.log(!localKrewe);
					console.log(queryType === UserQueryTypes.kreweMember && (!serverMemberIndex || !localMemberIndex || serverMemberIndex !== +serverMemberIndex || localMemberIndex !== +localMemberIndex));
					if(!queryType || !localKrewe || (queryType !== UserQueryTypes.kreweMissing && (!serverKrewe || typeof serverKrewe !== "object")) || (queryType === UserQueryTypes.kreweMember && ((!serverMemberIndex && serverMemberIndex !== 0) || (!localMemberIndex && localMemberIndex !== 0) || serverMemberIndex !== +serverMemberIndex || localMemberIndex !== +localMemberIndex))) {
						return -1;
					}

					if(!callback) {
						if(serverKrewe && {}.toString.call(serverKrewe) === '[object Function]') {
							callback = serverKrewe;
							serverKrewe = null;
						} else if(serverMemberIndex && {}.toString.call(serverMemberIndex) === '[object Function]') {
							callback = serverMemberIndex;
							serverMemberIndex = null;
						} else {
							return -1;
						}
					}

					var modalMessage;
					var conflictIndicators = {
						name: 		false,
						kaptain: 	false,
						member: 	false
					};

					if(queryType === UserQueryTypes.kreweName) {
						modalMessage = "Krewe name modified on the server and locally.  Which version should be kept?";

						conflictIndicators.name = true;
					} else if(queryType === UserQueryTypes.kreweKaptain) {
						modalMessage = "Krewe Kaptain modified on the server and locally.  Which version should be kept?";

						conflictIndicators.kaptain = true;
					} else if(queryType === UserQueryTypes.kreweMember) {
						modalMessage = "An attendee's assigned Krewe was changed on the server and locally.  Which version should be kept?";

						conflictIndicators.member = true;
					} else if(queryType === UserQueryTypes.kreweMissing) {
						modalMessage = "This Krewe was deleted on the server.  Should it be kept or deleted?"
					} else if(queryType === UserQueryTypes.memberMissing) {
						modalMessage = "This member has vanished.  Should we remove them from all Krewes or keep them in their original Krewe?";

						conflictIndicators.member = true;
					} else {
						return -1;
					}

					var modalInstance = $modal.open({
						templateUrl: 	'modules/krewes/views/krewe-conflict.client.view.html',
						controller: 	'ConflictModalCtrl',
						resolve: {
							message: 			function() {
								return modalMessage;
							},
							serverKrewe: 		function() {
								return {
									value: 	serverKrewe,
									key: 	0
								};
							},
							localKrewe: 		function() {
								return {
									value: 	localKrewe,
									key: 	1
								};
							},
							memberIndex: 		function() {
								if(queryType === UserQueryTypes.kreweMember) {
									return {
										server: serverMemberIndex,
										local: 	localMemberIndex
									};
								} else if(queryType === UserQueryTypes.missingMembers) {
									return {
										local: 	serverKrewe
									}
								}

								return false;
							},
							kreweDeleted: 		function() {
								if(queryType === UserQueryTypes.kreweMissing || queryType === UserQueryTypes.memberMissing) {
									return true;
								}

								return false;
							},
							conflictIndicators: function() {
								return conflictIndicators;
							}
						},
						backdrop: 		'static',
						keyboard: 		false,
						windowClass: 	'frank-conflict-resolve-modal'
					});

					modalInstance.result.then(function(selection) {
						callback(selection);
					});
				};

				/**
				* Store the initial copy of the data retreived from the backend to localstorage.
				*
				* @param event_id <String> - the _id of the event to which this data pertains
				* @param originalKrewes <Object> - the data stored in the backend when changes started
				*/
				var storeOriginalVersionLocally = function(event_id, originalKrewes) {
					var storageKey = originalDataPrefix + event_id;

					localStorageService.set(storageKey, originalKrewes);
				};

				/**
				* Returns the original krewes as stored in local storage.
				*
				* @param event_id <String> - the _id of the event for which data should be retreived
				*
				* @return <Object> if requested data for this event is in localstorage, null otherwise
				*/
				var retreiveOriginalVersionLocally = function(event_id) {
					var storageKey = originalDataPrefix + event_id;

					if(_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
						return localStorageService.get(storageKey);
					}

					return null;
				};

				/**
				* Remove the original data as retreived from the backend before changes were made.
				*
				* @param event_id <String> - the event for which original Krewe data should be removed.
				*/
				var removeOriginalVersionLocally = function(event_id) {
					var storageKey = currentDataPrefix + event_id;

					localStorageService.remove(storageKey);
				};

				/**
				* Returns true iff the a local version of the state of krewe data when changes
				* began is stored in localstorage.  Returns false otherwise.
				*
				* @param event_id <String> - the _id of the event
				*
				* @return <Bool> - true iff local version of the state of krewe data when changes began is in localstorage
				*/
				var originalVersionExistsLocally = function(event_id) {
					var storageKey = originalDataPrefix + event_id;

					return (_.intersection(localStorageService.keys(), [storageKey]).length === 1);
				};

				/**
				* Store the current version of data being edited by the user to localstorage.
				*
				* @param event_id <String> - the _id of the event for which kreweData pertains
				* @param kreweData <Object> - the current krewe data for event_id
				*/
				var storeChangesLocally = function(event_id, kreweData) {
					var storageKey = currentDataPrefix + event_id;
					var potentialStorageKey = potentialMembersPrefix + event_id;

					localStorageService.set(storageKey, kreweData);
					localStorageService.set(potentialStorageKey, $scope.potentialMembers);
				};

				/**
				* Same as storeChangesLocally except the current values are used for event_id and kreweData.
				* Note: this method may not be as safe as storeChangesLocally if the user changes the selected
				* event before this method is called.
				*/
				var storeCurrentStateLocallyUnsafe = function() {
					var storageKey = currentDataPrefix + eventSelector.postEventId;
					var potentialStorageKey = potentialMembersPrefix + eventSelector.postEventId;

					localStorageService.set(storageKey, $scope.krewes);
					localStorageService.set(potentialStorageKey, $scope.potentialMembers);
				};

				/**
				* Remove locally saved changes from localstorage.
				*
				* @param event_id <String> - the event for which local changes should be removed.
				*/
				var removeLocalChanges = function(event_id) {
					var storageKey = currentDataPrefix + event_id;

					localStorageService.remove(storageKey);
				};

				/**
				* Returns the local krewe data for the event specified by event_id.
				*
				* @param event_id <String> - the _id of the event for which local krewe data should be retreived
				*
				* @return <Object> if requested data for this event is in localstorage, null otherwise
				*/
				var retreiveChangesLocally = function(event_id) {
					var storageKey = currentDataPrefix + event_id;

					if(_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
						return localStorageService.get(storageKey);
					}

					return null;
				};

				/**
				* Returns the locally stored potential members.
				*
				* @param event_id <String> - the _id of the event for which potential members should be retreived.
				*
				* @return <Object> if requested data for this event is in local storage, <null> otherwise.
				*/
				var retreiveLocalPotentialMembers = function(event_id) {
					var storageKey = potentialMembersPrefix + event_id;

					if(_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
						return localStorageService.get(storageKey);
					}

					return null;
				};

				/**
				* Return true iff local changes to krewe data for event_id is stored.  Returns
				* false otherwise.
				*
				* @param event_id <String> - the _id of the event
				*
				* @return <Bool> - true iff local changes are stored, false otherwise
				*/
				var localChangesExist = function(event_id) {
					var storageKey = currentDataPrefix + event_id;

					return (_.intersection(localStorageService.keys(), [storageKey]).length === 1);
				};

				/**
				* Stores a delta in local storage.  If the delta already exists, the values in the delta
				* will be replaced by these values.
				*
				* @param event_id <String> - the _id of the event that was modified
				* @param krewe_id <String> - the _id of the krewe that was modified
				* @param modifiedField <String> -  the field that was modified.  Can be either "name", "kaptain", or "members"
				* @param newValue <String> - the new value for the modified field or the member's _id if modifiedField is "members"
				* @param action <String> - "+" when the member was added, "-" when the member was removed
				*/
				var storeDelta = function(event_id, krewe_id, modifiedField, newValue, action) {
					var storageKey = deltaPrefix + event_id;
					var eventDeltas = retreiveDeltas(event_id);
					var originalKrewes = retreiveOriginalVersionLocally(event_id);
					var originalData = null;
					var delta = {};

					// Find the original value only if the field is name or kaptain and the original data for this Krewe isn't already saved in a delta record.
					if(modifiedField !== "members" && (!eventDeltas || !eventDeltas[krewe_id] || !eventDeltas[krewe_id][modifiedField])) {
						for(var originalKreweIndex = originalKrewes.length - 1; originalKreweIndex >= 0; originalKreweIndex--) {
							if(originalKrewes[originalKreweIndex]._id === krewe_id) {
								if(modifiedField === "name") {
									originalData = originalKrewes[originalKreweIndex].name;
								} else {
									if(originalKrewes[originalKreweIndex].kaptain.length) {
										originalData = originalKrewes[originalKreweIndex].kaptain[0]._id;
									} else {
										originalData = null;
									}
								}

								break;
							}
						}
					} else if(modifiedField !== "members") {
						originalData = eventDeltas[krewe_id][modifiedField].original;
					}

					// If the new value matches the original value, simply delete the delta and return.
					if(originalData === newValue && (modifiedField === "name" || modifiedField === "kaptain")) {
						removeDelta(event_id, krewe_id, modifiedField);
						return;
					}

					if(modifiedField === "name" || modifiedField === "kaptain") {
						delta = {
							original: 	originalData,
							current: 	newValue
						};
					} else if(modifiedField === "members") {
						delta = {
							action: 	action
						};
					} else {
						return;
					}

					if(eventDeltas) {
						// Some deltas already exist for this event.
						if(eventDeltas[krewe_id]) {
							// Some deltas exist for this Krewe.
							var krewe = eventDeltas[krewe_id];

							if(modifiedField === "name" || modifiedField === "kaptain") {
								// Simply replace the old value, if applicable.
								krewe[modifiedField] = delta;
							} else {
								// Determine if information for members exist.  If so and this action is the opposite of the previous action, remove entry for the member's delta record; otherwise do nothing.
								if(krewe[modifiedField] && krewe[modifiedField][newValue]) {
									if(krewe[modifiedField][newValue].action !== action) {
										delete krewe[modifiedField][newValue];

										// If this field no longer has any deltas, delete it.
										console.log(krewe[modifiedField]);
										if(!krewe[modifiedField] || !Object.keys(krewe[modifiedField]).length) {
											delete eventDeltas[krewe_id][modifiedField];

											// If this Krewe no longer has any deltas, delete it.
											if(!krewe || !Object.keys(krewe).length) {
												delete eventDeltas[krewe_id];

												// If this event no longer has deltas, delete it and return it.
												if(!eventDeltas || !Object.keys(eventDeltas).length) {
													localStorageService.remove(storageKey);
													return;
												}
											}
										}
									}
								} else {
									if(!krewe[modifiedField]) {
										krewe[modifiedField] = {};
									}

									krewe[modifiedField][newValue] = delta;
								}
							}
						} else {
							// No deltas exist for this Krewe, add this one.
							eventDeltas[krewe_id] = {};

							if(modifiedField !== "members") {
								eventDeltas[krewe_id][modifiedField] = delta;
							} else {
								eventDeltas[krewe_id][modifiedField] = {};
								eventDeltas[krewe_id][modifiedField][newValue] = delta;
							}
						}
					} else {
						// No deltas exist for this event.  Simply create one for this Krewe and save the information.
						eventDeltas = {};
						eventDeltas[krewe_id] = {};

						if(modifiedField !== "members") {
							eventDeltas[krewe_id][modifiedField] = delta;
						} else {
							eventDeltas[krewe_id][modifiedField] = {};
							eventDeltas[krewe_id][modifiedField][newValue] = delta;
						}
					}

					localStorageService.set(storageKey, eventDeltas);
				};

				/**
				* Retreive all delta information for a particular event.  If no deltas are stored for the specifed
				* event, null will be returned instead.
				*
				* @param event_id <String> - the _id of the event for which information should be returned
				*
				* @return <[Object]> - an array of deltas for this event
				*/
				var retreiveDeltas = function(event_id) {
					var storageKey = deltaPrefix + event_id;

					if(_.intersection(localStorageService.keys(), [storageKey]).length === 1) {
						return localStorageService.get(storageKey);
					}

					return null;
				};

				/**
				* Remove a delta for a specific field in a specific krewe.  Returns true if the krewe was found
				* and deleted, false otherwise.
				*
				* @param event_id <String> - the event to which this krewe belongs
				* @param krewe_id <String> - the krewe that should be modified
				* @param modifiedField <String> - the field that should be removed
				*
				* @return <Boolean> - true iff the Krewe was found and the field was deleted
				*/
				var removeDelta = function(event_id, krewe_id, modifiedField) {
					var storageKey = deltaPrefix + event_id;
					var eventDeltas = retreiveDeltas(event_id);

					if(eventDeltas) {
						if(eventDeltas[krewe_id]) {
							// An entry for this Krewe exists, remove the necessary data.
							delete eventDeltas[krewe_id][modifiedField];

							// Check if any other deltas exist for this Krewe, if not delete it.
							if(!_.keys(eventDeltas[krewe_id]).length) {
								localStorageService.remove(storageKey);
							} else {
								localStorageService.set(storageKey, eventDeltas);
							}

							return true;
						}
					}

					return false;
				};

				/**
				* Remove all deltas for a specific event.
				*
				* @param event_id <String> - 
				*/
				var removeDeltas = function(event_id) {
					var storageKey = deltaPrefix + event_id;

					localStorageService.remove(storageKey);
				};

				/**
				* Return true iff deltas exist for the specified event.  This method is much more accurate
				* than use localChangesExist as deltas are a smarter way of keeping track of changes.
				*
				* @param event_id <String> - the _id of the event
				*
				* @return <Bool> - true iff local changes are stored, false otherwise
				*/
				var deltasExist = function(event_id) {
					var storageKey = deltaPrefix + event_id;

					return (_.intersection(localStorageService.keys(), [storageKey]).length === 1);
				};

				/**
				* Returns the next _id that can be used for a new Krewe and increments the ID value stored
				* in local storage.
				*
				* @param event_id <String> - the _id of the event to which the Krewe will be added
				*
				* @return <Int> - the _id that should be used by the new Krewe
				*/
				var getNextId = function(event_id) {
					var storageKey = "nextId_" + event_id;

					var nextId = 0;
					if(_.intersection(localStorageService.keys(), [storageKey]).length === 1) {
						nextId = parseInt(localStorageService.get(storageKey), 10);
					}

					localStorageService.set(storageKey, nextId + 1);

					return nextId;
				};

				/**
				* Resets the _id for a new Krewe in localstorage.  This should only be called when
				* the local version is going to be saved to the database.  Doing so before will
				* result in undefined behavior (Krewes will be mixed up, basically).
				*
				* @param event_id <String> - the _id of the event for which the temporary _ids should be reset.
				*/
				var resetNextId = function(event_id) {
					var storageKey = "nextId_" + event_id;

					localStorageService.set(storageKey, 0);
				};

				/**
				* Deteremines if two arrays of Krewes contain the same exact information.  Order of the arrays
				* does not matter.  When comparing members only the _id field is used to determine equality as
				* other fields can be modified by the user, but still point to the same person.
				*
				* Since conflicts are not expected to be common, this method simply returns false if the difference
				* is found between any two krewes.  If conflicts become more common, performance can be enhanced
				* returning a complete report of differences between the two arrays.  For example, once a difference
				* is found, the difference can be recorded and this method could continue to search for other
				* differences and record all found.
				*
				* @param kreweArray1 <[Object]> - 
				* @param kreweArray2 <[Object]> - 
				*
				* @return <Boolean> - true if the data in the arrays match.
				*/
				var kreweArraysMatch = function(kreweArray1, kreweArray2) {
					if(kreweArray1.length !== kreweArray2.length) {
						return false;
					}

					quickSortKrewes(kreweArray1);
					quickSortKrewes(kreweArray2);

					for(var kreweIndex = kreweArray1.length - 1; kreweIndex >= 0; kreweIndex--) {
						if(!krewesMatch(kreweArray1[kreweIndex], kreweArray2[kreweIndex])) {
							return false;
						}
					}

					return true;
				};

				/**
				* Determines if two Krewe objects are equal.  When comparing members, only the _id field is used
				* to determine equality as other fields can be modified by the user, but still point to the same
				* person.
				*
				* Since conflicts are not expected to be common, this method simply returns false if the difference
				* is found between any two krewes.  If conflicts become more common, performance can be enhanced
				* returning a complete report of differences between the two arrays.  For example, once a difference
				* is found, the difference can be recorded and this method could continue to search for other
				* differences and record all found.
				*
				* @param krewe1 <Object> - 
				* @param krewe2 <Object> - 
				*
				* @return <Boolean> - true if krewe1 matches krewe2
				*/
				var krewesMatch = function(krewe1, krewe2) {
					if(krewe1.name !== krewe2.name) {
						return false;
					}

					if(krewe1.kaptain._id !== krewe2.kaptain._id) {
						return false;
					}

					if(!membersMatch(krewe1.members, krewe2.members)) {
						return false;
					}

					return true;
				};

				/**
				* Detemines if an array of members are equal.  Equality is defined as having the same
				* members in both arrays of members.  Only the _id field is used to determine equality
				* as other fields (such as name) can be modified by the user, but still point to the same
				* person.
				*
				* Since conflicts are not expected to be common, this method simply returns false if the difference
				* is found between any two krewes.  If conflicts become more common, performance can be enhanced
				* returning a complete report of differences between the two arrays.  For example, once a difference
				* is found, the difference can be recorded and this method could continue to search for other
				* differences and record all found.
				*
				* @param memberArray1 <[Object]> - 
				* @param memberArray2 <[Object]> - 
				*
				* @return <Boolean> - true if all members are in both arrays.
				*/
				var membersMatch = function(memberArray1, memberArray2) {
					if(memberArray1.length !== memberArray2.length) {
						return false;
					}

					quickSortMembers(memberArray1);
					quickSortMembers(memberArray2);

					for(var memberIndex = memberArray1.length - 1; memberIndex >= 0; memberIndex--) {
						if(memberArray1[memberIndex]._id !== memberArray2[memberIndex]._id) {
							return false;
						}
					}

					return true;
				};

				/**
				* Sorts an array of member objects according to the member's _id.  This function mutates unsortedArray.
				*
				* @param unsortedArray <[Object]> - an array of member objects to be sorted
				* @param lowerBounds <Int> (optional) - optional lower index to begin sort.  If not specifed, 0 is used.
				* @param upperBounds <Int> (optional) - optional upper index to stop sorting.  If not specified, the
				* 	length of the array is used.
				*/
				var quickSortMembers = function(unsortedArray, lowerBounds, upperBounds) {
					lowerBounds = lowerBounds ? lowerBounds : 0;
					upperBounds = (upperBounds || upperBounds === 0) ? upperBounds : unsortedArray.length - 1;

					if(lowerBounds < upperBounds) {
						var partition = partitionMembers(unsortedArray, lowerBounds, upperBounds);
						quickSortMembers(unsortedArray, lowerBounds, partition);
						quickSortMembers(unsortedArray, partition + 1, upperBounds);
					}
				};

				/**
				* Helper method for quickSortMembers.  It selects a pivot randomly and sorts the items in the array
				* within the bounds relative to the selected pivot.
				*
				* @param unsortedArray <[Object]> - an array of member objects to be sorted
				* @param lowerBounds <Int> - lower bounds for this partition
				* @param upperBounds <Int> - upper bounds for this partition
				*
				* @return <Int> - the index of the pivot chosen
				*/
				var partitionMembers = function(unsortedArray, lowerBounds, upperBounds) {
					var random = _.random(lowerBounds, upperBounds);
					var pivot = unsortedArray[random]._id;

					var leftCursor = lowerBounds - 1,
						rightCursor = upperBounds + 1;

					while(true) {
						while(++leftCursor < upperBounds && unsortedArray[leftCursor]._id < pivot);
						while(--rightCursor >= lowerBounds && unsortedArray[rightCursor]._id > pivot);

						if(leftCursor >= rightCursor) {
							break;
						}

						var temp = unsortedArray[leftCursor];
						unsortedArray[leftCursor] = unsortedArray[rightCursor];
						unsortedArray[rightCursor] = temp;
					}

					return rightCursor;
				};

				/**
				* Sorts an array of krewe objects according to the krewe _id.  This function mutates unsortedArray.
				*
				* @param unsortedArray <[Object]> - an array of krewe objects to be sorted
				* @param lowerBounds <Int> (optional) - optional lower index to begin sort.  If not specified, 0 is used
				* @param upperBounds <Int> (optional) - optional upper index to stop sort.  If not specified, the length
				* 	of unsortedArray is used.
				*/
				var quickSortKrewes = function(unsortedArray, lowerBounds, upperBounds) {
					lowerBounds = lowerBounds ? lowerBounds : 0;
					upperBounds = (upperBounds || upperBounds === 0) ? upperBounds : unsortedArray.length - 1;

					if(lowerBounds < upperBounds) {
						var partition = partitionKrewes(unsortedArray, lowerBounds, upperBounds);
						quickSortKrewes(unsortedArray, lowerBounds, partition);
						quickSortKrewes(unsortedArray, partition + 1, upperBounds);
					}
				};

				/**
				* Helper method for quickSortKrewes.  It selects a pivot randomly and sorts the items in the array
				* within the bounds relative to the selected pivot.
				*
				* @param unsortedArray <[Object]> - an array of krewe objects to be sorted
				* @param lowerBounds <Int> - lower bounds for this partition
				* @param upperBounds <Int> - upper bounds for this partition
				*
				* @return <Int> - the index of the pivot chosen
				*/
				var partitionKrewes = function(unsortedArray, lowerBounds, upperBounds) {
					var random = _.random(lowerBounds, upperBounds);
					var pivot = unsortedArray[random]._id;

					var leftCursor = lowerBounds - 1,
						rightCursor = upperBounds + 1;

					while(true) {
						while(++leftCursor < upperBounds && unsortedArray[leftCursor]._id < pivot);
						while(--rightCursor >= lowerBounds && unsortedArray[rightCursor]._id > pivot);

						if(leftCursor >= rightCursor) {
							break;
						}

						var temp = unsortedArray[leftCursor];
						unsortedArray[leftCursor] = unsortedArray[rightCursor];
						unsortedArray[rightCursor] = temp;
					}

					return rightCursor;
				};

				/*** Event Listeners ***/
				// Load data from backend when the selected event changes.
				$scope.$watch(
					function() {
						return eventSelector.postEventId;
					},
					function() {
						if(eventSelector.postEventId !== null) {
							if(!localChangesExist(eventSelector.postEventId)) {
								// No local changes exist.  Update the local information.
								async.parallel([
									loadKrewes,
									loadPotentialMembers
								], function(status, data) {
									if(!status) {
										$scope.krewes = data[0];
										$scope.potentialMembers = $filter('orderBy')(data[1], 'lName');

										storeOriginalVersionLocally(eventSelector.postEventId, $scope.krewes);
									} else {
										if(status === 400 && data.message === "Required fields not specified.") {
											// Data was not passed to backend.  Most likely the user does not have an event selected.
										} else if(status === 400 && (data.message === "An error occurred retreiving krewes." || data.message === "An error occurred retreiving users.")) {
											// Some error occurred.  Warn the user and give them the option to report the problem.
										} else {
											// Unknown error (probably 500).  Warn user.
										}
									}
								});
							} else {
								// Local changes have been made.
								$scope.krewes = retreiveChangesLocally(eventSelector.postEventId.toString());
								$scope.potentialMembers = retreiveLocalPotentialMembers(eventSelector.postEventId.toString());
							}
						}
					}
				);

				/*** scope Functions ***/
				$scope.editKreweName = function(kreweIndex) {
					if($scope.nameLock !== -1) {
						$scope.saveKreweName(kreweIndex);
					}

					$scope.nameLock = kreweIndex;
				};

				$scope.saveKreweName = function(kreweIndex) {
					var event_id = eventSelector.postEventId.toString();
					var krewes = _.extend({}, $scope.krewes);
					$scope.nameLock = -1;

					storeDelta(event_id, krewes[kreweIndex]._id.toString(), "name", krewes[kreweIndex].name);
					storeChangesLocally(event_id, _.extend({}, $scope.krewes));
				};

				var addToPotentialMembers = function(member) {
					$scope.potentialMembers.push(member);
				};

				/**
				* Remove the current Kaptain from this krewe.  If another Kaptain is being replacing
				* the current Kaptain, newKaptain should contain the new Kaptain.  Otherwise, this
				* field should be left blank
				*
				* @param kreweIndex <int> - the index of the krewe from which the kaptain should be removed
				* @param newKaptain <Object> (optional) - the new kaptain that is replacing the current kaptain
				*
				* @return newKaptain <Object> - iff newKaptain was specified, otherwise nothing is returned
				*/
				$scope.removeKaptain = function(kreweIndex, newKaptain) {
					var oldKaptain = $scope.krewes[kreweIndex].kaptain.splice(0, 1);

					var event_id = eventSelector.postEventId.toString();

					if(oldKaptain.length) {
						storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), "members", oldKaptain[0]._id.toString(), "-");
						$scope.addNewPotentialMember(oldKaptain[0]);
					}

					if(newKaptain) {
						// Check if there is already a Kaptain for this krewe or not.
						storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), "kaptain", newKaptain._id.toString());
						storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), "members", newKaptain._id.toString(), "+");
					} else {
						storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), "kaptain", null);
					}

					storeChangesLocally(event_id, _.extend({}, $scope.krewes));

					if(newKaptain) {
						return newKaptain;
					}
				};

				/**
				* Add a delta for a new member.
				*/
				$scope.addMember = function(kreweIndex, newMember) {
					var event_id = eventSelector.postEventId.toString();

					storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), "members", newMember._id.toString(), "+");

					return newMember;
				};

				/**
				* Remove the memberIndexth member from this krewe.
				*
				* @param kreweIndex <int> - the index of the krewe from which this member should be removed
				* @param memberIndex <int> - the index of the member within the krewe that should be removed
				*/
				$scope.removeMember = function(kreweIndex, memberIndex) {
					var event_id = eventSelector.postEventId.toString();
					storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), "members", $scope.krewes[kreweIndex].members[memberIndex]._id.toString(), "-");

					var newPotentialMember = $scope.krewes[kreweIndex].members.splice(memberIndex, 1)[0];
					$scope.addNewPotentialMember(newPotentialMember);

					storeChangesLocally(event_id, _.extend({}, $scope.krewes));
				};

				/**
				* Create a new, empty Krewe.
				*/
				$scope.addNewKrewe = function() {
					var newKrewe = {
						_id: 		getNextId(eventSelector.postEventId.toString()),
						name: 		"",
						kaptain: 	[],
						members: 	[]
					};

					$scope.krewes.push(newKrewe);
				};

				/**
				* Add a member to the potential members.
				*/
				$scope.addNewPotentialMember = function(newPotentialMember) {
					$scope.potentialMembers.push(newPotentialMember);

					var index = $scope.newPotentialMembers.length - 1;
					for(; index >= 0; index--) {
						if($scope.newPotentialMembers[index] === newPotentialMember._id) {
							break;
						}
					}

					if(index < 0) {
						$scope.newPotentialMembers.push(newPotentialMember._id);
					}
				};

				/**
				* Converts the array of krewes used by DnD to the format expected by the backend.
				*
				* @param krewes <[Object]> - array of krewes used by the DnD plugin
				*/
				var unmangleKrewes = function(krewes, event_id) {
					// Determine the last temporary id used.
					var tempIdMax = getNextId(event_id);

					for(var kreweIndex = krewes.length - 1; kreweIndex >= 0; kreweIndex--) {
						if(krewes[kreweIndex]._id < tempIdMax && krewes[kreweIndex].name === "" && !krewes[kreweIndex].members.length && !krewes[kreweIndex].kaptain.length) {
							krewes.splice(kreweIndex, 1);

							continue;
						}

						var memberUserObjects = [];
						_.assign(memberUserObjects, krewes[kreweIndex].members);
						krewes[kreweIndex].members = [];

						krewes[kreweIndex].kaptain_id = krewes[kreweIndex].kaptain.length ? krewes[kreweIndex].kaptain[0]._id : null;
						delete krewes[kreweIndex].kaptain;

						for (var memberIndex = memberUserObjects.length - 1; memberIndex >= 0; memberIndex--) {
							krewes[kreweIndex].members.push({member_id: memberUserObjects[memberIndex]._id});
						}

						if(krewes[kreweIndex]._id === +krewes[kreweIndex]._id && krewes[kreweIndex]._id < tempIdMax) {
							// This Krewe is new and is using a temporary ID.  The _id needs to be reset to null.
							krewes[kreweIndex]._id = false;
						}
					}
				};

				/**
				* Reset all local data to start afresh.  This should be called after all local changes
				* have been stored on the server.
				*
				* @param event_id <String> - the _id of the event for which localstorage should be reset.
				*/
				var resetLocalStorage = function(event_id) {
					removeLocalChanges(event_id);
					removeOriginalVersionLocally(event_id);
					removeDeltas(event_id);
					resetNextId(event_id);
				}

				/**
				* Save all changes to the backend to be processed and refresh localstorage's
				* copy of backend data.  After all changes have been saved, clear the
				* localstorage current krewe data for this event since the local version now
				* matches the backend.
				*/
				$scope.saveChanges = function() {
					var event_id = eventSelector.postEventId.toString();
					var refresh = false;				// Whether the page should be refreshed after the modal has exited.

					$scope.modalData = {};
					$scope.modalData.statusMessage = "Searching for conflicts...";	// Current status to display to user.
					$scope.modalData.loading = true;								// Whether the system is still trying to save.
					$scope.modalData.errorSaving = false;							// Whether an error occurred saving the local changes.

					var modalInstance = $modal.open({
						templateUrl: 	'modules/krewes/views/krewe-save.client.view.html',
						controller: 	'SaveModalCtrl',
						resolve: {
							data: 	function() {
								return $scope.modalData;
							}
						},
						backdrop: 		'static',
						keyboard: 		false
					});

					modalInstance.result.then(function() {
						if(refresh) {
							$window.location.reload();
						}
					});

					if(deltasExist(event_id)) {
						// Check to see if the data can be saved and save to the database if so.
						var localVersion = [];
						_.assign(localVersion, $scope.krewes);

						var cacheObj = retreiveOriginalVersionLocally(event_id);
						var originalVersion = Object.keys(cacheObj).map(function(value) {
							return cacheObj[value];
						});

						var deltas = retreiveDeltas(event_id);

						// Check the original version against the one in the db.  If they match, local changes will overwrite the backend's version.
						loadKrewes(true, function(status, data) {
							if(!status) {
								var serverVersion = data;

								if(kreweArraysMatch(originalVersion, serverVersion)) {
									$scope.modalData.statusMessage = "No conflicts exist.  Saving to server...";

									// Convert the kaptain and members fields back to the proper format.
									unmangleKrewes(localVersion, event_id);

									// Find all deltas that remove a member and add the member to add that member to the potentialMembers.  If somebody is found that was added to another group, this will be taken care of automatically with /save/krewes.
									for (var deltaIndex = deltas.length - 1; deltaIndex >= 0; deltaIndex--) {
										var delta = deltas[deltaIndex];
										var memberKeys = _.keys(delta.members);

										for (var memberIndex = memberKeys.length - 1; memberIndex >= 0; memberIndex--) {
											if(delta.members[memberKeys[memberIndex]].action === '-') {
												$scope.newPotentialMembers.push(memberKeys[memberIndex]);
											}
										}
									}

									// Update potential members.
									$http.post('/remove/krewe_members', {event_id: event_id, users: $scope.newPotentialMembers}).success(function(resMess) {
										// Save local changes to the server.
										$http.post('/save/krewes', {event_id: event_id, krewes: localVersion}).success(function(resMess) {
											// Remove localstorage and load current version from the backend.
											resetLocalStorage(event_id);
											
											async.parallel([
												loadKrewes,
												loadPotentialMembers
											], function(status, data) {
												if(!status) {
													$scope.krewes = data[0];
													$scope.potentialMembers = $filter('orderBy')(data[1], 'lName');

													storeOriginalVersionLocally(event_id, $scope.krewes);

													// Stop loading icon and give the user positive feedback.
													$scope.modalData.statusMessage = "Local changes saved!";
													$scope.modalData.loading = false;
												} else {
													// An error occurred refreshing data.  Alert the user and refresh the page.
													$scope.modalData.statusMessage = "Local changes saved!  This page will self-refresh in 5 seconds.";
													$scope.modalData.loading = false;
													refresh = true;
												}
											});
										}).error(function(errData, status) {
											if(status === 400 && errData.message !== "Some Krewes could not be updated.") {
												// Data is missing or formatted improperly.  Alert the user to results.
												$scope.modalData.statusMessage = "Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
												$scope.modalData.loading = false;
												$scope.modalData.errorSaving = true;
											} else if(status === 400) {
												// Some Krewes could not be saved.  Alert the user.
												$scope.modalData.statusMessage = "Some local changes could not be saved.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
												$scope.modalData.loading = false;
												$scope.modalData.errorSaving = true;
											} else {
												// Unkown error.  Most likely 500.  Alert the user.
												$scope.modalData.statusMessage = "Could not connect to server.  Please try again later.";
												$scope.modalData.loading = false;
												$scope.modalData.errorSaving = true;
											}
										});
									}).error(function(errData, status) {
										if(status === 400 && errData.message === "Required fields not specified.") {
											// Data is missing or formatted improperly.  Alert the user to results.
											$scope.modalData.statusMessage = "Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
											$scope.modalData.loading = false;
											$scope.modalData.errorSaving = true;
										} else if(status === 400) {
											// Some memberships could not be revoked.  Alert the user.
											$scope.modalData.statusMessage = "Some members were not updated.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
											$scope.modalData.loading = false;
											$scope.modalData.errorSaving = true;
										} else {
											// Unkown error.  Most likely 500.  Alert the user.
											$scope.modalData.statusMessage = "Could not connect to the server.  Please try again later.";
											$scope.modalData.loading = false;
											$scope.modalData.errorSaving = true;
										}
									});
								} else {
									$scope.modalData.statusMessage = "Conflicts found.  Attempting to resolve them, this may take some time.  Please do not close out of the browser.";

									// Conflicts exist that need to be resolved.  Display a message alerting the user.
									resolveConflicts(deltas, localVersion, originalVersion, serverVersion, function() {
										$scope.modalData.statusMessage = "Conflicts resolved.  Saving to server...";

										// Convert the kaptain and members fields back to the proper format.
										unmangleKrewes(localVersion, event_id);

										// newPotentialMembers was set by resolveConflicts.  Save them.
										$http.post('/remove/krewe_members', {event_id: event_id, users: $scope.newPotentialMembers}).success(function(resMess) {
											// Save local changes to the server.
											$http.post('/save/krewes', {event_id: event_id, krewes: localVersion}).success(function(resMess) {
												// Remove localstorage and load current version from the backend.
												resetLocalStorage(event_id);
												
												async.parallel([
													loadKrewes,
													loadPotentialMembers
												], function(status, data) {
													if(!status) {
														$scope.krewes = data[0];
														$scope.potentialMembers = $filter('orderBy')(data[1], 'lName');

														storeOriginalVersionLocally(event_id, $scope.krewes);

														// Stop loading icon and give the user positive feedback.
														$scope.modalData.statusMessage = "Local changes saved!";
														$scope.modalData.loading = false;
													} else {
														// An error occurred refreshing data.  Alert the user and refresh the page.
														$scope.modalData.statusMessage = "Local changes saved!  This page will self-refresh in 5 seconds.";
														$scope.modalData.loading = false;
														refresh = true;
													}
												});
											}).error(function(errData, status) {
												if(status === 400 && errData.message !== "Some Krewes could not be updated.") {
													// Data is missing or formatted improperly.  Alert the user to results.
													$scope.modalData.statusMessage = "Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
													$scope.modalData.loading = false;
													$scope.modalData.errorSaving = true;
												} else if(status === 400) {
													// Some Krewes could not be saved.  Alert the user.
													$scope.modalData.statusMessage = "Some local changes could not be saved.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
													$scope.modalData.loading = false;
													$scope.modalData.errorSaving = true;
												} else {
													// Unkown error.  Most likely 500.  Alert the user.
													$scope.modalData.statusMessage = "Could not connect to server.  Please try again later.";
													$scope.modalData.loading = false;
													$scope.modalData.errorSaving = true;
												}
											});
										}).error(function(errData, status) {
											if(status === 400 && errData.message === "Required fields not specified.") {
												// Data is missing or formatted improperly.  Alert the user to results.
												$scope.modalData.statusMessage = "Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
												$scope.modalData.loading = false;
												$scope.modalData.errorSaving = true;
											} else if(status === 400) {
												// Some memberships could not be revoked.  Alert the user.
												$scope.modalData.statusMessage = "Some members were not updated.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
												$scope.modalData.loading = false;
												$scope.modalData.errorSaving = true;
											} else {
												// Unkown error.  Most likely 500.  Alert the user.
												$scope.modalData.statusMessage = "Could not connect to the server.  Please try again later.";
												$scope.modalData.loading = false;
												$scope.modalData.errorSaving = true;
											}
										});
									});
								}
							} else {
								// An error occurred.  Stop loading icon and warn the user and let them know they can save it later.
								if(status === 400 && data.message === "Required fields not specified.") {
									// Data was not passed to backend.  Most likely the user does not have an event selected.
									$scope.modalData.statusMessage = "Error contacting server.  Make sure an event is selected in the top right-hand corner of the screen.";
									$scope.modalData.loading = false;
									$scope.modalData.errorSaving = true;
								} else if(status === 400 && (data.message === "An error occurred retreiving krewes." || data.message === "An error occurred retreiving users.")) {
									// Some error occurred.  Warn the user and give them the option to report the problem.
									$scope.modalData.statusMessage = "An error occurred retreiving krewes.  Please contact frank to resolve the problem (you can do so by clicking the \"Report a Problem\" link on the drop-down under your name).";
									$scope.modalData.loading = false;
									$scope.modalData.errorSaving = true;
								} else {
									// Unknown error (probably 500).  Warn user.
									$scope.modalData.statusMessage = "Could not connect to server.  Please try again later.";
									$scope.modalData.loading = false;
									$scope.modalData.errorSaving = true;
								}
							}
						});
					} else {
						// No need to save changes.  Stop loading icon and give user positive feedback.
						$scope.modalData.statusMessage = "Local changes saved!";
						$scope.modalData.loading = false;
					}
				};

				/**
				* Remove potentialMemberIndexth user from the potential members.
				*
				* @param potentialMemberIndex <int> the index of the member to remove within the potentialMembers array
				*/
				$scope.removePotentialMember = function(potentialMemberIndex) {
					$scope.potentialMembers.splice(potentialMemberIndex, 1);

					storeChangesLocally(eventSelector.postEventId, $scope.krewes);
				};
			}
		}
	}
]);