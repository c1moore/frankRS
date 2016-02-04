'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'frank-recruiter-system';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'ngTable',
        'angularjs-dropdown-multiselect',
        'textAngular',
        'flow',
        'ngInputDate',
        'multi-select',
        'dialogs.main',
        'angularSpinner',
        'vcRecaptcha',
        'dndLists',
        'LocalStorageModule'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('admin');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('events');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('invites');'use strict';
// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('krewes');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('leaderboard');'use strict';
// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('memoboard');'use strict';
// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('problems');'use strict';
// Use application configuration module to register a new module
ApplicationConfiguration.registerModule('recruiter-form');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');angular.module('admin').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('admin', {
      url: '/admin',
      templateUrl: 'modules/admin/views/admin.client.view.html'
    });
  }
]);'use strict';
angular.module('admin').controller('applicationController', [
  '$scope',
  'ngTableParams',
  '$http',
  'eventSelector',
  '$filter',
  '$window',
  '$location',
  'usSpinnerService',
  '$timeout',
  '$sce',
  '$modal',
  'Authentication',
  function ($scope, ngTableParams, $http, eventSelector, $filter, $window, $location, usSpinnerService, $timeout, $sce, $modal, Authentication) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, ['admin']).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.newCandidateEvents = [];
      $scope.candidates = [];
      $scope.selectEvents = [];
      $scope.statusIsOpen = false;
      //Whether the dropdown menu for the status is open.
      $scope.candidateStatuses = [
        'volunteer',
        'invited',
        'accepted'
      ];
      var rowUpdated = false;
      //Keep track of whether data was actually changed.
      /**
			* Since the name field has multiple fields, ng-blur will not suffice.  This allows
			* the user to edit both the first name and last name before changing back to just
			* displaying the first and last name.
			*/
      $scope.$edit = {};
      $scope.$edit.lName = false;
      $scope.$edit.fName = false;
      $scope.$edit.row = -1;
      $scope.$watch('$edit.lName', function () {
        $timeout(function () {
          if (!$scope.$edit.lName && !$scope.$edit.fName && $scope.$edit.row >= 0) {
            $scope.$data[$scope.$edit.row].$edit.name = false;
            $scope.updateCandidate($scope.$data[$scope.$edit.row]._id, 'name');
          }
        }, 100);
      });
      $scope.$watch('$edit.fName', function () {
        $timeout(function () {
          if (!$scope.$edit.lName && !$scope.$edit.fName && $scope.$edit.row >= 0) {
            $scope.$data[$scope.$edit.row].$edit.name = false;
            $scope.updateCandidate($scope.$data[$scope.$edit.row]._id, 'name');
          }
        }, 100);
      });
      //settings for the multi select directive in form to create new candidate
      $scope.selectSettings = {
        smartButtonMaxItems: 3,
        externalIdProp: 'event_id',
        idProp: 'event_id',
        displayProp: 'label'
      };
      //Settings for multiselect directive in the table of candidates
      $scope.tableMsSettings = {
        smartButtonMaxItems: 1,
        externalIdProp: 'label',
        idProp: 'label',
        displayProp: 'label'
      };
      //updated the selected event from the event selector service
      $scope.$watch(function () {
        return eventSelector.selectedEvent;
      }, function (selectedEvent) {
        $scope.isEventSelected = eventSelector.postEventId ? true : false;
        if ($scope.isEventSelected) {
          $scope.selectedEvent = eventSelector.selectedEvent;
          $scope.selectedEvent = selectedEvent;
          $scope.getCandidates(true);
        }
      });
      $http.get('/events/enumerateAll').success(function (data) {
        //formats the event data for the multiselect directive
        for (var i = 0; i < data.length; i++) {
          $scope.selectEvents.push({
            label: data[i].name,
            event_id: data[i]._id
          });
        }
      }).error(function (data) {
        $scope.selectEvents = [];
        $scope.selectEvents[0] = {
          label: 'Error',
          event_id: 'error'
        };
      });
      $scope.getCandidates = function (eventChanged) {
        $http.post('/candidate/getCandidatesByEvent', { event_id: eventSelector.postEventId }).success(function (data) {
          for (var i = 0; i < data.length; i++) {
            data[i].displayName = data[i].lName + ', ' + data[i].fName;
          }
          $scope.candidates = [];
          $scope.candidates = data;
          rowUpdated = false;
        }).error(function (error, status) {
          if (eventChanged || error.message === 'No candidates found.') {
            $scope.candidates = [];
          }
          /**
					* If the error was not an authentication problem, try reloading the data.  If the problem
					* was related to authentication, the interceptor will take care of routing the user.
					* Problems related to no events existing will be treated the same way for now from here.
					*/
          if (status !== 401 && $location.path() === '/leaderboard') {
            $timeout(function () {
              $scope.getCandidates();
            }, 5000);
          }
        });
      };
      $scope.addCandidate = function (newCandidate) {
        if ($scope.newCandidateEvents.length > 0) {
          newCandidate.events = [];
          for (var i = 0; i < $scope.newCandidateEvents.length; i++) {
            newCandidate.events.push($scope.newCandidateEvents[i].event_id);
          }
          $http.post('/candidate/setCandidate', newCandidate).success(function () {
            //Refresh table view
            $scope.getCandidates();
            //Reset the form
            $scope.candidateForm.$setPristine(true);
            $scope.newCandidate = {};
            $scope.newCanidateEvents = [];
          }).error(function (res, status) {
            //Warn the user iff there wasn't an authentication issue (window.alert will keep the page from redirecting immediately).
            if (status !== 401) {
              $window.alert('Oops, something bad happened.  We couldn\'t save the new candidate.  Please make sure all fields are correct and try again.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report this issue</a>');
            }
          });
        }
      };
      $scope.acceptCandidate = function (candidate) {
        var postObject = {
            candidate_id: candidate._id,
            event_id: eventSelector.postEventId,
            accepted: true
          };
        $http.post('/candidate/setAccepted', postObject).success(function () {
          //refresh table view
          $scope.getCandidates();
        }).error(function (res, status) {
          //Warn the user.
          if (status !== 401) {
            //Refresh table view so the candidate no longer appears as accepted.
            $scope.getCandidates();
            $window.alert('Candidate not updated.  Please try again.\n\n' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          }
        });
      };
      $scope.denyCandidate = function (candidate) {
        $http.post('/candidate/deleteCandidate/event', {
          candidate_id: candidate._id,
          event_id: eventSelector.postEventId
        }).success(function () {
          //refresh table view
          $scope.getCandidates();
        }).error(function (res) {
          //Refresh table view so the candidate's real status is displayed.
          $scope.getCandidates();
          //Warn the user.
          $window.alert('Candidate not updated.  Please try again.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
        });
      };
      //This updates the table when the candidates variable is changed.
      //I may be able to move this safely into the getCandidates() function.  Tests are needed to confirm this.
      $scope.$watch('candidates', function () {
        $timeout(function () {
          $scope.tableParams.reload();
        });
      });
      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 5,
        filter: { fName: '' },
        sorting: { fName: 'asc' }
      }, {
        getData: function ($defer, params) {
          var filteredData = params.filter() ? $filter('filter')($scope.candidates, params.filter()) : $scope.candidates;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.candidates;
          params.total(orderedData.length);
          $scope.$data = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
          $defer.resolve($scope.$data);
        }
      });
      /**
			* This is the logic for sending an email to a candidate.  Instead of having one array with
			* an object that has the keys email and id, two separate arrays will be used to simplify the
			* HTML code.  For security reasons, the candidate ids will be passed to the backend, not
			* their email addresses.
			*/
      $scope.selected = {};
      $scope.selected.emails = [];
      $scope.selected.ids = [];
      $scope.email = {};
      $scope.email.errmess = [];
      $scope.sending = false;
      $scope.selectedCandidates = [];
      $scope.setSelected = function (_id, email, index) {
        if ($scope.selectedCandidates[index]) {
          for (var i = 0; i < $scope.selected.ids.length; i++) {
            if ($scope.selected.ids[i] === _id) {
              $scope.selected.ids.splice(i, 1);
              $scope.selected.emails.splice(i, 1);
              $scope.selectedCandidates[index] = false;
              return;
            }
          }
        }
        $scope.selected.ids.push(_id);
        $scope.selected.emails.push(email);
        $scope.selectedCandidates[index] = true;
      };
      $scope.sendMessages = function () {
        $scope.email.error = false;
        $scope.email.errmess = [];
        if (!$scope.email.message) {
          $scope.email.error = true;
          $scope.email.errmess.push('Message is required.');
        }
        if (!$scope.selected.ids.length) {
          $scope.email.error = true;
          $scope.email.errmess.push('At least one recipient is required.');
        }
        if (!$scope.email.error) {
          $scope.sending = true;
          usSpinnerService.spin('spinner-2');
          var body = {
              candidate_ids: $scope.selected.ids,
              subject: $scope.email.subject,
              message: $scope.email.message,
              event_id: eventSelector.postEventId
            };
          $http.post('/admin/send', body).success(function (response) {
            $scope.selected = {};
            $scope.selected.emails = [];
            $scope.selected.ids = [];
            $scope.email = {};
            $scope.email.errmess = [];
            $scope.selectedCandidates = [];
            $window.alert('Emails sent!');
            usSpinnerService.stop('spinner-2');
            $scope.sending = false;
          }).error(function (response, status) {
            if (status !== 401) {
              $window.alert('There was an error sending the message.  Please try again later.\n\nError: ' + response.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
            }
            usSpinnerService.stop('spinner-2');
            $scope.sending = false;
          });
        }
      };
      $scope.$watch('$data', function () {
        //Only mark as modified if there actually is data in the table.
        if ($scope.$data && $scope.$data.length > 0) {
          rowUpdated = true;
        }
      });
      $scope.updateCandidate = function (id, field) {
        if (rowUpdated) {
          var index = -1;
          for (var i = 0; i < $scope.$data.length; i++) {
            if ($scope.$data[i]._id === id)
              index = i;
          }
          if (index !== -1) {
            if (field === 'name') {
              $http.post('/candidate/setfName', {
                fName: $scope.$data[index].fName,
                candidate_id: $scope.$data[index]._id
              }).success(function () {
                $scope.getCandidates();
              }).error(function (res, status) {
                if (status !== 401) {
                  $scope.getCandidates();
                  $window.alert('Error occurred while updating ' + $scope.$data[index].fName + '\'s name.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
                }
              });
              $http.post('/candidate/setlName', {
                lName: $scope.$data[index].lName,
                candidate_id: $scope.$data[index]._id
              }).success(function () {
                $scope.getCandidates();
              }).error(function (res, status) {
                if (status !== 401) {
                  $scope.getCandidates();
                  $window.alert('Error occurred while updating ' + $scope.$data[index].fName + '\'s name.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
                }
              });
            } else {
              var address = '/candidate/set' + field;
              var data = {};
              data.candidate_id = $scope.$data[index]._id;
              if (field === 'Status') {
                data[field.toLowerCase()] = $scope.$data[index].events[field.toLowerCase()];
                data.event_id = eventSelector.postEventId;
              } else {
                data[field.toLowerCase()] = $scope.$data[index][field.toLowerCase()];
              }
              $http.post(address, data).success(function () {
                $scope.getCandidates();
              }).error(function (res, status) {
                if (status !== 401) {
                  $scope.getCandidates();
                  $window.alert('Error occurred while updating ' + $scope.$data[index].fName + '\'s record.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
                }
              });
            }
          } else {
            $scope.getCandidates();
            $window.alert('Candidate could not be found.  Refresh the page and try again.\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          }
        }
      };
      $scope.inviteRecruiter = function (event) {
        var modalInstance = $modal.open({
            templateUrl: 'modules/admin/views/inviteRecruiter.client.view.html',
            controller: 'RecruiterInvitationCtrl',
            backdrop: 'static',
            keyboard: false
          });
      };
    }
  }
]);
angular.module('admin').controller('RecruiterInvitationCtrl', [
  '$scope',
  '$modalInstance',
  '$http',
  'eventSelector',
  '$location',
  'usSpinnerService',
  function ($scope, $modalInstance, $http, eventSelector, $location, usSpinnerService) {
    $scope.event = {
      name: eventSelector.selectedEvent,
      id: eventSelector.postEventId
    };
    $scope.invite = { subject: 'We Want You to Be Our Next Great Recruiter' };
    $scope.editorMode = true;
    $scope.sending = false;
    $scope.sentMode = false;
    $scope.error = false;
    var link = 'http://' + $location.host() + '/#!/recruiter/form?eid=' + encodeURIComponent(eventSelector.postEventId.toString());
    var linkHtml = '<a href=\'' + link + '\'>' + link + '</a>';
    var linkRegex = /#link#/g;
    $scope.spinnerOpts = {
      lines: 11,
      length: 12,
      width: 5,
      radius: 14,
      corners: 0.5,
      opacity: 0.05,
      shadow: true,
      color: [
        '#73c92d',
        '#f7b518',
        '#C54E90'
      ]
    };
    $scope.sendInvite = function () {
      usSpinnerService.spin('admin-new-recruiter-spinner-1');
      $scope.editorMode = $scope.sentMode = false;
      $scope.sending = true;
      $scope.error = false;
      var invite = {};
      angular.extend(invite, $scope.invite);
      //Replace HTML unsafe characters with their proper HTML safe equivalents.
      invite.message = _.escape(invite.message);
      //Either add the link to the end of the email or replace the reserved word with the link.
      if (invite.message.search(linkRegex) === -1) {
        invite.message += '\n\nYou can sign up at ' + linkHtml;
      } else {
        invite.message = invite.message.replace(linkRegex, linkHtml);
      }
      //Replace all newline characters with <br />.
      invite.message = invite.message.replace(/\n/g, '<br />');
      //Split the string of emails into an array
      invite.emails = invite.emails.split(/, */g);
      invite.event_id = eventSelector.postEventId;
      $http.post('/send/nonuser', invite).success(function () {
        $scope.sending = false;
        $scope.sentMode = true;
        $scope.invite = { subject: 'We Want You to Be Our Next Great Recruiter' };
        usSpinnerService.stop('admin-new-recruiter-spinner-1');
      }).error(function (res, status) {
        $scope.error = res.message + '  Error: ' + res.error.code;
        $scope.sending = false;
        $scope.editorMode = true;
        usSpinnerService.stop('admin-new-recruiter-spinner-1');
      });
    };
    $scope.done = function () {
      $modalInstance.close();
    };
  }
]);'use strict';
angular.module('admin').controller('adminAttendeesController', [
  '$scope',
  'ngTableParams',
  '$http',
  '$filter',
  'eventSelector',
  '$modal',
  '$window',
  '$timeout',
  'Authentication',
  '$location',
  function ($scope, ngTableParams, $http, $filter, eventSelector, $modal, $window, $timeout, Authentication, $location) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, ['admin']).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.attendees = [];
      //Array of attendees (user objects).
      $scope.isEventSelected = eventSelector.postEventId ? true : false;
      //Is an event selected?
      $scope.tabErr = false;
      //Was there an error obtaining attendees from backend?
      //When a new event is selected, update isEventSelected and attendees.
      $scope.$watch(function () {
        return eventSelector.postEventId;
      }, function () {
        $scope.isEventSelected = eventSelector.postEventId ? true : false;
        if ($scope.isEventSelected) {
          getAttendees();
        }
      });
      //Obtain all users for this event from the backend.
      var getAttendees = function () {
        $scope.tabErr = false;
        $http.post('/event/users', { event_id: eventSelector.postEventId }).success(function (res) {
          $scope.attendees = res;
          $scope.attendeeTableParams.reload();
        }).error(function (res, status) {
          if (status === 400 && res.message === 'No users found for this event.') {
            $scope.tabErr = res.message;
          } else {
            //Fail silently, since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
            if (status !== 401 && $location.path() === '/admin') {
              $timeout(function () {
                $scope.getCandidates();
              }, 5000);
            }
          }
        });
      };
      //Setup ng-table
      $scope.attendeeTableParams = new ngTableParams({
        page: 1,
        count: 10,
        filter: { displayName: '' },
        sorting: { displayName: 'asc' }
      }, {
        getData: function ($defer, params) {
          var filteredData = params.filter() ? $filter('filter')($scope.attendees, params.filter()) : $scope.attendees;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.attendees;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
      //Delete the attendee's account.
      var deleteAttendee = function (aid, aname) {
        $http.post('/remove', { user_id: aid }).success(function (res) {
          getAttendees();
        }).error(function (res, status) {
          $window.alert('There was an error deleting ' + aname + '\'s account.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          getAttendees();
        });
      };
      //Remove attendee's permissions for selected event.
      var removeEventPermissions = function (aid, aname) {
        $http.post('/user/inactivate', {
          user_id: aid,
          event_id: eventSelector.postEventId
        }).success(function (res) {
          getAttendees();
        }).error(function (res, status) {
          $window.alert('There was an error removing permissions for ' + aname + '.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          getAttendees();
        });
      };
      //Remove attendee's permissions for selected event.
      var removeAllPermissions = function (aid, aname) {
        $http.post('/user/inactivate/all', { user_id: aid }).success(function (res) {
          getAttendees();
        }).error(function (res, status) {
          $window.alert('There was an error removing permissions for ' + aname + '.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          getAttendees();
        });
      };
      /**
			* To be called when the user wants to completely delete an attendee.  The user will be
			* prompted to confirm this action should be completed.
			*
			* @param attendee - Attendee object to delete
			*/
      $scope.deleteAttendee = function (attendee) {
        var modalInstance = $modal.open({
            templateUrl: 'modules/admin/views/attendee-warn-delete.client.view.html',
            controller: 'attendeeDeleteModalCtrl',
            backdrop: true,
            backdropClass: 'admin-backdrop',
            resolve: {
              attendee: function () {
                return attendee;
              }
            }
          });
        modalInstance.result.then(function (result) {
          if (result) {
            deleteAttendee(attendee._id, attendee.fName + ' ' + attendee.lName);
          }
        });
      };
      /**
			* To be called when the user wants to remove an attendee.  When called, the user is
			* prompted on whether the action should be completed.  If the user decides to
			* continue, removeAttendee will be called.
			*
			* @param attendee - Attendee object to delete
			*/
      $scope.removeAttendee = function (attendee) {
        /**
				* Flags to represent what action should be taken.  The flags have the
				* following meanings:
				* 		0 - Take no action (cancel)
				* 		1 - Remove the user's permissions for only the selected event
				* 		2 - Remove the user's permissions for all events
				*
				* These flags are always assumed to stay in this order (i.e. cancel is first,
				* remove role is second, and remove user is last).
				*/
        var actionFlags = [
            0,
            1,
            2
          ];
        var modalInstance = $modal.open({
            templateUrl: 'modules/admin/views/attendee-warn-inactive.client.view.html',
            controller: 'attendeeActionModalCtrl',
            backdrop: true,
            backdropClass: 'admin-backdrop',
            resolve: {
              flags: function () {
                return actionFlags;
              },
              attendee: function () {
                return attendee;
              }
            }
          });
        modalInstance.result.then(function (result) {
          result = parseInt(result, 10);
          //Do the action specified by the returned flag.
          switch (result) {
          case actionFlags[0]:
            //Do nothing
            break;
          case actionFlags[1]:
            //Remove user's permissions for this event.
            removeEventPermissions(attendee._id, attendee.fName);
            break;
          case actionFlags[2]:
            //Remove user's permissions for all events.
            removeAllPermissions(attendee._id, attendee.fName);
            break;
          }
        });
      };
    }
  }
]);
angular.module('admin').controller('attendeeActionModalCtrl', [
  '$scope',
  '$modalInstance',
  'attendee',
  'flags',
  'eventSelector',
  function ($scope, $modalInstance, attendee, flags, eventSelector) {
    $scope.attendee = attendee;
    $scope.event = eventSelector.selectedEvent;
    $scope.flags = flags;
    $scope.selection = flags[0];
    /**
		* Action to call whenever the modal is exited using any button.  If the user
		* accepts, whatever action they chose is returned as specified by the flags;
		* otherwise, 0 for cancel is returned.
		*
		* @param action - 1 if the user accepts or 0 if the user changed their mind
		*/
    $scope.done = function (action) {
      action = parseInt(action, 10);
      var flag = action ? $scope.selection : $scope.flags[0];
      $modalInstance.close(flag);
    };
  }
]);
angular.module('admin').controller('attendeeDeleteModalCtrl', [
  '$scope',
  '$modalInstance',
  'attendee',
  function ($scope, $modalInstance, attendee) {
    $scope.attendee = attendee;
    $scope.done = function (action) {
      action = parseInt(action, 10);
      if (action) {
        $modalInstance.close(true);
      } else {
        $modalInstance.close(false);
      }
    };
  }
]);'use strict';
angular.module('admin').controller('eventController', [
  '$scope',
  'ngTableParams',
  '$http',
  '$timeout',
  '$filter',
  '$modal',
  '$window',
  'Authentication',
  '$location',
  'eventSelector',
  function ($scope, ngTableParams, $http, $timeout, $filter, $modal, $window, Authentication, $location, eventSelector) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, ['admin']).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.events = [];
      //converts to date object so the date forms can be validated
      var toDate = function (element) {
        if (element.start_date && element.end_date) {
          element.start_date = new Date(element.start_date);
          element.end_date = new Date(element.end_date);
        }
      };
      var getEvents = function () {
        $http.get('/events/enumerateAll').success(function (data) {
          $scope.events = [];
          data.forEach(toDate);
          $scope.events = data;
        });
      };
      getEvents();
      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        filter: { name: '' },
        sorting: { name: 'asc' }
      }, {
        getData: function ($defer, params) {
          var filteredData = params.filter() ? $filter('filter')($scope.events, params.filter()) : $scope.events;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.events;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
      $scope.$watch('events', function () {
        $scope.tableParams.reload();
      });
      $scope.addEvent = function (newEvent) {
        newEvent.start_date = new Date(newEvent.start_date).getTime();
        newEvent.end_date = new Date(newEvent.end_date).getTime();
        $http.post('/events/create', newEvent).success(function () {
          getEvents();
          $scope.newEvent = null;
          $scope.eventForm.$setPristine(true);
          eventSelector.eventSelect();
        }).error(function (response, status) {
          if (status !== 401) {
            $window.alert('There was an error adding ' + newEvent.name + '.  Please make sure all information is correct and try again.\n\nError: ' + response.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          }
        });
      };
      $scope.updateEvent = function (event) {
        event.start_date = new Date(event.start_date).getTime();
        event.end_date = new Date(event.end_date).getTime();
        $http.post('/events/setEventObj', {
          event_id: event._id,
          event: event
        }).success(function () {
          getEvents();
          eventSelector.eventSelect();
        }).error(function (response, status) {
          if (status !== 401) {
            getEvents();
            $window.alert('There was an error updating ' + event.name + '.  Please make sure all information is correct and try again.\n\nError: ' + response.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          }
        });
      };
      //the following code sets up the date selectors in the event form 
      $scope.today = function () {
        $scope.dt = new Date();
      };
      $scope.today();
      $scope.clear = function () {
        $scope.dt = null;
      };
      $scope.openS = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.openedS = true;
      };
      $scope.openE = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.openedE = true;
      };
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
      var deleteEvent = function (event) {
        $http.post('/events/delete', { event_id: event._id }).success(function () {
          getEvents();
          eventSelector.eventSelect();
        }).error(function (res, status) {
          if (status !== 401) {
            getEvents();
            $window.alert('An error occurred while deleting ' + event.name + '.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          }
        });
      };
      $scope.deleteEvent = function (event) {
        var modalInstance = $modal.open({
            templateUrl: 'modules/admin/views/event-warn-delete.client.view.html',
            controller: 'eventDeleteModalCtrl',
            backdrop: true,
            backdropClass: 'admin-backdrop',
            resolve: {
              event: function () {
                return event;
              }
            }
          });
        modalInstance.result.then(function (result) {
          if (result) {
            deleteEvent(event);
          }
        });
      };
      var inactivateEvent = function (eid, ename) {
        $http.post('events/inactivate', { event_id: eid }).success(function () {
          getEvents();
        }).error(function (res, status) {
          if (status !== 401) {
            getEvents();
            $window.alert('An error occurred while disabling ' + ename + '.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report it</a>.');
          }
        });
      };
      $scope.inactivateEvent = function (event) {
        var modalInstance = $modal.open({
            templateUrl: 'modules/admin/views/event-warn-inactivate.client.view.html',
            controller: 'eventInactivateModalCtrl',
            backdrop: true,
            backdropClass: 'admin-backdrop',
            resolve: {
              event: function () {
                return event;
              }
            }
          });
        modalInstance.result.then(function (result) {
          if (result) {
            inactivateEvent(event._id, event.name);
          }
        });
      };
    }
  }
]);
angular.module('admin').controller('eventDeleteModalCtrl', [
  '$scope',
  '$modalInstance',
  'event',
  function ($scope, $modalInstance, event) {
    $scope.event = event;
    $scope.done = function (action) {
      action = parseInt(action, 10);
      if (action) {
        $modalInstance.close(true);
      } else {
        $modalInstance.close(false);
      }
    };
  }
]);
angular.module('admin').controller('eventInactivateModalCtrl', [
  '$scope',
  '$modalInstance',
  'event',
  function ($scope, $modalInstance, event) {
    $scope.event = event;
    $scope.done = function (action) {
      action = parseInt(action, 10);
      if (action) {
        $modalInstance.close(true);
      } else {
        $modalInstance.close(false);
      }
    };
  }
]);'use strict';
angular.module('admin').controller('recruitersController', [
  '$scope',
  'ngTableParams',
  '$http',
  '$filter',
  'eventSelector',
  '$modal',
  '$window',
  '$timeout',
  'Authentication',
  '$location',
  function ($scope, ngTableParams, $http, $filter, eventSelector, $modal, $window, $timeout, Authentication, $location) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, ['admin']).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.recruiters = [];
      //Array of recruiters (user objects).
      $scope.isEventSelected = eventSelector.postEventId ? true : false;
      //Is an event selected?
      $scope.tabErr = false;
      //Was there an error obtaining recruiters from backend?
      //When a new event is selected, update isEventSelected and recruiters.
      $scope.$watch(function () {
        return eventSelector.postEventId;
      }, function () {
        $scope.isEventSelected = eventSelector.postEventId ? true : false;
        if ($scope.isEventSelected) {
          getRecruiters();
        }
      });
      //Obtain recruiters from the backend.
      var getRecruiters = function () {
        $http.get('/event/recruiters', { params: { event_id: eventSelector.postEventId } }).success(function (res) {
          $scope.tabErr = false;
          //Only retain ranking information for this event.
          for (var i = 0; i < res.length; i++) {
            var j;
            for (j = 0; j < res[i].rank.length; j++) {
              if (res[i].rank[j].event_id.toString() === eventSelector.postEventId.toString()) {
                res[i].rank = res[i].rank[j].place;
                break;
              }
            }
            if (j === res[i].rank.length) {
              res[i].rank = '0';
            }
          }
          $scope.recruiters = res;
          $scope.recruiterTableParams.reload();
        }).error(function (res, status) {
          if (status === 400 && res.message === 'No recruiters found for this event.') {
            $scope.tabErr = res.message;
          } else {
            //Fail silently, since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
            if (status !== 401 && $location.path() === '/leaderboard') {
              $timeout(function () {
                $scope.getCandidates();
              }, 5000);
            }
          }
        });
      };
      //Setup ng-table
      $scope.recruiterTableParams = new ngTableParams({
        page: 1,
        count: 10,
        filter: {},
        sorting: { displayName: 'asc' }
      }, {
        getData: function ($defer, params) {
          var filteredData = params.filter() ? $filter('filter')($scope.recruiters, params.filter()) : $scope.recruiters;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.recruiters;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
      //Remove user's role as a recruiter for this specific event.
      var removeRecruiter = function (rid, rname) {
        $http.post('/remove/Recruiter', {
          user_id: rid,
          event_id: eventSelector.postEventId
        }).success(function (res) {
          getRecruiters();
        }).error(function (res, status) {
          if (status !== 401) {
            getRecruiters();
            $window.alert('There was an error removing ' + rname + '\'s recruiter role.\n\n' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report this issue</a>');
          }
        });
      };
      //Delete the recruiter's account.
      var deleteRecruiter = function (rid, rname) {
        $http.post('/remove', { user_id: rid }).success(function (res) {
          getRecruiters();
        }).error(function (res, status) {
          if (status !== 401) {
            getRecruiters();
            $window.alert('There was an error deleting ' + rname + '\'s account.\n\nError: ' + res.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report this issue</a>');
          }
        });
      };
      /**
			* To be called when the user wants to remove a recruiter.  When called, the user is
			* prompted on what action should be taken.  The options are to remove recruiter's
			* role for this event or completely delete them from the system.  After making a
			* choice, either removeRecruiter or deleteRecruiter are called.
			*
			* @param rid - Recruiter's user ID
			*/
      $scope.removeRecruiter = function (recruiter) {
        /**
				* Flags to represent what action should be taken.  The flags have the
				* following meanings:
				* 		0 - Take no action (cancel)
				* 		1 - Remove the user's recruiter role for this event
				* 		2 - Remove this user from the system
				*
				* These flags are always assumed to stay in this order (i.e. cancel is first,
				* remove role is second, and remove user is last).
				*/
        var flags = [
            0,
            1,
            2
          ];
        var modalInstance = $modal.open({
            templateUrl: 'modules/admin/views/recruiterWarn.client.view.html',
            controller: 'actionModalCtrl',
            backdrop: true,
            backdropClass: 'admin-backdrop',
            resolve: {
              flags: function () {
                return [
                  0,
                  1,
                  2
                ];
              },
              recruiter: function () {
                return recruiter;
              }
            }
          });
        modalInstance.result.then(function (result) {
          result = parseInt(result);
          //Make sure a proper flag was returned
          switch (result) {
          case flags[0]:
            //Take no action
            break;
          case flags[1]:
            //Remove users recruiter role for this event
            removeRecruiter(recruiter._id, recruiter.fName);
            break;
          case flags[2]:
            //Remove this user from the system
            deleteRecruiter(recruiter._id, recruiter.fName);
            break;
          }
        });
      };
    }
  }
]);
angular.module('admin').controller('actionModalCtrl', [
  '$scope',
  '$modalInstance',
  'flags',
  'recruiter',
  function ($scope, $modalInstance, flags, recruiter) {
    /**
		* It is assumed `flags` is an array with 3 elements with the following order:
		* 		Cancel action
		* 		Remove user's role as recruiter for this event
		* 		Remove user from system
		*/
    $scope.flags = flags;
    $scope.recruiter = recruiter;
    $scope.cancel = true;
    //Cancel removing recruiter
    $scope.selection = $scope.flags[0];
    //What flag has been selected
    /**
		* Action to call whenever the modal is exited using any button.  If action is
		* set and evaluates to `$scope.cancel`, the cancel flag is returned.  Otherwise,
		* the value returned is obtained from `$scope.selection`.
		*
		* @param action - If the modal was cancelled/exited, this should be set to
		* $scope.cancel.  Otherwise, this should not be arg should not be set
		*/
    $scope.done = function (action) {
      var flag = action ? $scope.flags[0] : $scope.selection;
      $modalInstance.close(flag);
    };
  }
]);angular.module('admin').directive('multiselect', [
  '$q',
  '$timeout',
  function ($q, $timeout) {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        ctrl.$asyncValidators.username = function (modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty model valid
            return $q.when();
          }
          var def = $q.defer();
          $timeout(function () {
            // Mock a delayed response
            if (usernames.indexOf(modelValue) === -1) {
              // The username is available
              def.resolve();
            } else {
              def.reject();
            }
          }, 2000);
          return def.promise;
        };
      }
    };
  }
]);'use strict';
angular.module('core').config([
  'flowFactoryProvider',
  function (flowFactoryProvider) {
    flowFactoryProvider.defaults = {
      target: '/comments/uploadRecruiterImage',
      uploadMethod: 'POST'
    };
    flowFactoryProvider.on('catchAll', function (event) {
      console.log(event);
      console.log('catchAll', arguments);
    });
  }
]);'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  '$filter',
  'eventSelector',
  function ($scope, Authentication, Menus, $filter, eventSelector) {
    $scope.authentication = Authentication;
    $scope.userRoles = [
      'recruiter',
      'admin'
    ];
    $scope.leaderboardRoles = [
      'recruiter',
      'admin'
    ];
    $scope.inviteRoles = [
      'recruiter',
      'admin'
    ];
    $scope.memoRoles = [
      'recruiter',
      'admin',
      'attendee'
    ];
    $scope.eventsRoles = [
      'attendee',
      'recruiter'
    ];
    $scope.adminRoles = ['admin'];
    $scope.kreweRoles = [
      'admin',
      'kreweAdmin'
    ];
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.eventSelector = eventSelector;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
    /**
		* Returns true if the menu item should not be on the menu based on the roles required for the page.
		* 
		* @param rolesNeeded (array, string) - if an array, the array should contain strings of the required
		* roles.  If a string, a single comma (',') should be used to separate roles.  Accepted strings
		* include:
		*		- "admin"		- admin roles required
		*		- "recruiter"	- recruiter role required
		*		- "attendee"	- attendee role required
		*		- "*"			- any of the above roles.  If specified, it MUST be the only specified role.
		*/
    $scope.hideLink = function (rolesNeeded) {
      if (!$scope.authentication.user) {
        return true;
      }
      if (typeof rolesNeeded === 'string') {
        if (rolesNeeded === '*') {
          return false;
        } else {
          rolesNeeded = rolesNeeded.split(',');
        }
      } else if (rolesNeeded[0] === '*') {
        return false;
      }
      if ($filter('roles')($scope.authentication.user.roles, rolesNeeded).length === 0) {
        return true;
      } else {
        return false;
      }
    };
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  '$filter',
  '$location',
  'eventSelector',
  function ($scope, Authentication, $filter, $location, eventSelector) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    /*
		* If the user is not logged in they should be sent directly to
		* the login page.  Only authorized users should see this page.
		*/
    if (!$scope.authentication.user) {
      $location.path('/signin');
      return;
    } else {
      /*
			* Save the user roles so we can determine the proper buttons to
			* display to the user.
			*/
      $scope.userRoles = $scope.authentication.user.roles;
      //$scope.userRoles = ['recruiter'];
      // Temporary data for buttons
      $scope.data = {
        buttons: [
          {
            name: 'Admin Page',
            description: 'A place where admins can fulfill their fantasies of being all-powerful.',
            link: '/#!/admin',
            roles: ['admin'],
            image: '/modules/core/img/icons/admin.png'
          },
          {
            name: 'Krewes Portal',
            description: 'Create and adjust Krewes.',
            link: '/#!/krewes_portal',
            roles: [
              'admin',
              'kreweAdmin'
            ],
            image: '/modules/core/img/icons/krewes.png'
          },
          {
            name: 'Control Room',
            description: 'Send out your invitations and see your invitation stats.',
            link: '/#!/invite',
            roles: [
              'recruiter',
              'admin'
            ],
            image: '/modules/core/img/icons/invites.png'
          },
          {
            name: 'Leaderboard',
            description: 'See how your friends and competitors rank against you.',
            link: '/#!/leaderboard',
            roles: [
              'recruiter',
              'admin'
            ],
            image: '/modules/core/img/icons/leaderboard.png'
          },
          {
            name: 'frank Lounge',
            description: 'Take a look at what people are saying about the events you are attending and weigh in on the chatter.',
            link: '/#!/franklounge',
            roles: [
              'admin',
              'recruiter',
              'attendee'
            ],
            image: '/modules/core/img/icons/frank_lounge.png'
          },
          {
            name: 'Recruiter Registration',
            description: 'Think you got what it takes to be a recruiter for frank?  Then sign up here.  Warning: we only accept the best.',
            link: '/#!/events',
            roles: [
              'recruiter',
              'attendee'
            ],
            titleId: 'recruiter-request-button-title',
            image: '/modules/core/img/icons/recruiter_registration.png'
          },
          {
            name: 'Register',
            description: 'Register to attend frank 2016.',
            link: 'https://frank2016.eventbrite.com/',
            roles: [
              'recruiter',
              'admin'
            ],
            image: '/modules/core/img/icons/register.png',
            newTab: true
          }
        ]
      };  //changes button width based on the number of buttons the user can see
          /*$scope.buttonsWidth = 100/($filter('roles')($scope.data.buttons,$scope.userRoles)).length;*/
          /*$scope.displayComments = true;*/
          /*$scope.buttonsGrid = "col-md-10";*/
          /*$scope.toggleComments = function(){
				$scope.displayComments = !$scope.displayComments;
				if ($scope.displayComments) {
					$scope.buttonsGrid = "col-md-10";
				}
				else if (!$scope.displayComments) {
					$scope.buttonsGrid = "col-md-12";
				}
			};*/
          /*$scope.showComments = function() {
				if (comments.length === 0) {
					return "No users";
				}
			};*/
    }
  }
]);'use strict';
angular.module('core').directive('comment', [function () {
    var commentDefinition = {
        template: '<div class="frank-comment" ng-transclude></div>',
        restrict: 'E',
        replace: true,
        transclude: true
      };
    return commentDefinition;
  }]);
/**
*
*
* Possible imporovement: simply pass the entire object to the directive instead of requiring
* to pass all the fields into the header individually.
*/
angular.module('core').directive('commentHeader', [
  '$http',
  '$window',
  function ($http, $window) {
    var commentHeaderDefinition = {
        restrict: 'E',
        scope: {
          author: '@authorName',
          time: '@postTime',
          image: '@authorImage',
          removable: '@',
          removeAddress: '@',
          commentId: '@',
          commentsArr: '=',
          arrIndex: '='
        },
        replace: true,
        template: '<div class=\'frank-comment-header\'>' + '<div ng-if=\'image\' class=\'frank-comment-image-container\'>' + '<img src=\'{{image}}\' class=\'frank-comment-image\' />' + '</div>' + '<div class=\'frank-comment-author\'>' + '<span>{{author}}</span>' + '</div>' + '<div class=\'frank-comment-time\'>' + '<span>{{time}}</span>' + '</div>' + '<div ng-if=\'removable\' class=\'frank-comment-remove\'>' + '<a href=\'#\' class=\'frank-comment-remove-icon\' ng-click=\'removeComment()\'><i class=\'fa fa-remove text-danger\'></i></a>' + '</div>' + '</div>',
        link: function postLink($scope, element, attrs) {
          $scope.removeComment = function () {
            $http.post($scope.removeAddress, { comment_id: $scope.commentId }).success(function (response) {
              $scope.commentsArr.splice($scope.arrIndex, 1);
            }).error(function (response, status) {
              $window.alert('There was an error deleting this comment.  Please try again.');
            });
          };
        }
      };
    return commentHeaderDefinition;
  }
]);
angular.module('core').directive('commentBody', [function () {
    var commentBodyDefinition = {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div class=\'frank-comment-body\'>' + '<div class=\'frank-comment-message\'>' + '<span ng-bind-html=\'comment\'></span>' + '</div>' + '</div>',
        scope: { comment: '=commentBody' }
      };
    return commentBodyDefinition;
  }]);
angular.module('core').directive('commentFooter', [function () {
    var commentFooterDefinition = {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
          interests: '=',
          interestsMapper: '='
        },
        template: '<div class=\'frank-comment-footer\'>' + '<div class=\'frank-comment-interests\'>' + '<div ng-repeat=\'interest in interests\' class=\'frank-comment-footer-img-container\'>' + '<img src=\'{{interestsMapper[interest]}}\' alt=\'interest\' class=\'frank-comment-footer-img\' />' + '</div>' + '</div>' + '</div>'
      };
    return commentFooterDefinition;
  }]);
angular.module('core').directive('commentEditor', [
  '$compile',
  '$timeout',
  'eventSelector',
  '$window',
  '$http',
  'Authentication',
  function ($compile, $timeout, eventSelector, $window, $http, Authentication) {
    var commentEditorDefinition = {
        restrict: 'E',
        replace: true,
        scope: {
          newComment: '=commentContent',
          expanded: '=',
          files: '=files',
          postAddress: '@',
          commentsArr: '=',
          refresh: '&',
          interestsEnabled: '@',
          interests: '=?',
          selectedInterests: '=?'
        },
        template: '<form class=\'frank-comment-editor\' ng-submit=\'postComment()\'>' + '<div class=\'frank-comment-editor-compressed\' ng-click=\'toggleExpanded()\' ng-hide=\'expanded\'>Click to comment...</div>' + '<div class=\'frank-comment-editor-expanded\' ng-show=\'expanded\' flow-init flow-name=\'uploader.flowInstance\' flow-file-added=\'!!{jpg:1,gif:1,png:1,tiff:1,jpeg:1}[$file.getExtension()]\' flow-complete=\'flowComplete()\' flow-file-error=\'flowError()\'>' + '<div text-angular ng-model=\'comment.content\' ta-toolbar="[[\'undo\', \'redo\'], [\'ul\', \'ol\', \'quote\'], [\'bold\', \'italics\', \'underline\'], [\'insertLink\', \'insertVideo\']]" ></div>' + '<span class=\'btn btn-default frank-comment-editor-img-uploader\' flow-btn><i class=\'fa fa-camera\'></i></span>' + '<div class=\'frank-comment-editor-preview-container\'><div class=\'frank-comment-editor-preview\' ng-repeat=\'file in $flow.files\'><img class=\'frank-comment-editor-preview-img\' flow-img=\'file\' ng-mouseover=\'showOverlay = $index\' /><div ng-class=\'{"frank-comment-editor-preview-overlay" : showOverlay===$index, "frank-comment-editor-preview-overlay-hidden" : showOverlay!==$index}\' ng-click=\'file.cancel()\' ng-mouseleave=\'showOverlay = -1\'><i class=\'fa fa-remove\'></i></div></div></div>' + '<div class=\'frank-comment-editor-submit\' ng-class=\'{"frank-comment-editor-submit-higher" : uploader.flowInstance.files.length}\'><input type=\'submit\' value=\'Post\' class=\'btn btn-primary\' ng-disabled="!eventSelector.postEventId" /></div>' + '<div ng-if=\'interestsEnabled\' multi-select=\'\' input-model=\'interests\' max-height=\'72px\' output-model=\'comment.interests\' button-label=\'icon name\' item-label=\'icon name\' tick-property=\'ticked\' selection-mode=\'multiple\' max-labels=\'2\' helper-elements=\'none reset filter\' default-label=\'Select Tag...\'></div>' + '</div>' + '</form>',
        link: function postLink($scope, element, attrs) {
          //$scope.expanded = false;
          $scope.showOverlay = -1;
          $scope.toggleExpanded = function () {
            $scope.expanded = !$scope.expanded;
          };
          $timeout(function () {
            var imgbut = angular.element('.frank-comment-editor-img-uploader').detach();
            angular.element('.ta-toolbar .btn-group:last').append(imgbut);
            var multiselect = angular.element('.multiSelect').detach();
            angular.element('.ta-toolbar').append(multiselect);
            angular.element('.ta-toolbar .multiSelect').removeAttr('type');
          });
          //Remove the disabled attributes from the textAngular toolbar.  This is mainly for styling.
          angular.element('.ta-toolbar button').removeAttr('ng-disabled');
          angular.element('.ta-toolbar button').removeAttr('unselectable');
          $timeout(function () {
            angular.element('.ta-toolbar button').removeAttr('disabled');
          }, 100);
          //Make sure the toolbar is not disabled after textAngular textbox loses focus.
          angular.element('.ta-root').on('focusout', function () {
            $scope.$apply(function () {
              $timeout(function () {
                angular.element('.ta-toolbar button').removeAttr('disabled');
              }, 10);
            });
          });
        },
        controller: function ($scope) {
          $scope.uploader = {};
          $scope.comment = {};
          $scope.newComment = $scope.comment.content = '';
          $scope.eventSelector = eventSelector;
          if ($scope.interestsEnabled) {
            $scope.comment.interests = $scope.selectedInterests;
          }
          $scope.postComment = function () {
            if ($scope.uploader.flowInstance.getSize() > 2097152) {
              $window.alert('We can\'t handle all the awesomeness from your pictures.  Try removing a few or if you only have 1, try cropping it.');
            } else if (!$scope.comment.content && !$scope.uploader.flowInstance.files.length) {
              $window.alert('Don\'t forget to add some of your deep thoughts before posting a comment.');
            } else {
              var now = Date.now();
              for (var i = 0; i < $scope.uploader.flowInstance.files.length; i++) {
                $scope.uploader.flowInstance.files[i].name = Authentication.user._id + eventSelector.selectedEvent + now + i + '.' + $scope.uploader.flowInstance.files[i].getExtension();
              }
              $scope.uploader.flowInstance.opts.query = { event_id: eventSelector.postEventId };
              $scope.uploader.flowInstance.opts.testChunks = false;
              $scope.uploader.flowInstance.opts.permanentErrors = [
                400,
                401,
                404,
                415,
                500,
                501
              ];
              var flowErr = false;
              $scope.flowError = function () {
                flowErr = true;
                $window.alert('There was an error uploading your images.  Only <b>images</b> smaller than 2MB are allowed.');
              };
              //TODO: Add an .error() event and a var.  If there was an error, set the var to false and do not add the comment to db.
              $scope.flowComplete = function () {
                if (!flowErr) {
                  var commentWithImg = $scope.comment.content;
                  for (var i = 0; i < $scope.uploader.flowInstance.files.length; i++) {
                    commentWithImg += '<div class=\'frank-comment-pic-container\'><img class=\'frank-comment-pic\' src=\'img/recruiter/' + $scope.uploader.flowInstance.files[i].name + '\' /></div>';
                  }
                  var interestsArr = [];
                  if ($scope.interestsEnabled) {
                    for (var i = 0; i < $scope.comment.interests.length; i++) {
                      interestsArr.push($scope.comment.interests[i].name);
                    }
                  }
                  $http.post($scope.postAddress, {
                    comment: commentWithImg,
                    event_id: eventSelector.postEventId,
                    interests: interestsArr
                  }).success(function (response) {
                    $scope.refresh();
                    $scope.comment.content = '';
                    $scope.expanded = false;
                    $scope.uploader.flowInstance.cancel();
                    if ($scope.interestsEnabled) {
                      for (var i = 0; i < $scope.interests.length; i++) {
                        $scope.interests[i].ticked = false;
                      }
                    }
                  }).error(function (response, status) {
                    $window.alert('This is embarrassing!  We couldn\'t post your comment.  Please try again.');
                  });
                }
              };
              $scope.uploader.flowInstance.upload();
            }
          };
        }
      };
    return commentEditorDefinition;
  }
]);'use strict';
// :)
angular.module('core').filter('roles', function () {
  return function (data, rolesNeeded) {
    //creates array function to find if an array contains an element
    var contains = function (array, needle) {
      for (var x in array) {
        if (array[x] === needle)
          return true;
      }
      return false;
    };
    //filters out data for arrays of objects
    var objectContaining = function (element) {
      for (var x in rolesNeeded) {
        if (contains(element.roles, rolesNeeded[x]))
          return true;
      }
      return false;
    };
    //filters out data for arrays of strings
    var arrayContaining = function (element) {
      return contains(rolesNeeded, element);
    };
    //handles the case when data or rolesNeeded don't exist 
    if (data === null || rolesNeeded === null) {
      return [];
    }  //check if arrays are the same
    else if (angular.equals(data, rolesNeeded)) {
      return rolesNeeded;
    }  //check if array of objects
    else if (typeof data[0] === 'object') {
      return data.filter(objectContaining);
    } else {
      return data.filter(arrayContaining);
    }
  };
});'use strict';
angular.module('core').factory('cacheService', [
  '$http',
  'storageService',
  function ($http, storageService) {
    return {
      getData: function (key) {
        return storageService.get(key);
      },
      setData: function (key, data) {
        storageService.save(key, data);
      },
      removeData: function (key) {
        storageService.remove(key);
      }
    };
  }
]);'use strict';
/**
* Service that allows users to select the event for which the current page should display information about.  Admins should be able to view all events
* at all times, the eventSelector will have to behave slightly differently if the user is an admin.  Otherwise, the user should only view the events that are in
* their status array.  While this is handled in the backend, the data sent to the frontend differs slightly.
*
* Since the eventSelector is refreshed every time the page is refreshed, we should store the value that
* the user selected before refreshing the page so this event can automatically be restored.  We are using
* cacheService to deal with saving these values to the localStorage.
*/
angular.module('core').service('eventSelector', [
  '$rootScope',
  '$http',
  '$location',
  'cacheService',
  'Authentication',
  '$window',
  '$timeout',
  function ($rootScope, $http, $location, cacheService, Authentication, $window, $timeout) {
    var thisService = this;
    var cache = cacheService;
    this.events = [];
    //List of events viewable to this user.
    this.selectedEvent = 'Select Event';
    this.postEventId = null;
    this.numRecruiting = 0;
    this.recruiterEvent = true;
    //Whether or not this user is recruiting for the selected event.
    this.nresDisabled = false;
    //Whether or not the events for which this user is only attending (not recruiting) are disabled (used on pages that require recruiter/admin privileges).
    this.disabled = false;
    this.admin = false;
    //Whether or not this user is an admin.
    var keys = [];
    var put = function (key, value) {
      cache.setData(key, value);
    };
    this.hideEventSelector = function () {
      var path = $location.path();
      return path === '/signin' || path === '/settings/profile' || path === '/settings/password' || !Authentication.user;
    };
    thisService.eventSelect = function () {
      /**
			* Functions will be defined based on whether or not the current user is an admin.  Since
			* admins should be able to see all events, their eventSelector will behave differently than
			* attendees and recruiters.
			*/
      if (_.intersection(Authentication.user.roles, ['admin']).length > 0) {
        thisService.admin = true;
        var checkEvent = function (needle) {
          for (var i = 0; i < thisService.events.length; i++) {
            if (thisService.events[i]._id === needle)
              return i;
          }
          return false;
        };
        /*This request the available events from the db. If there already is a cache of the selected event,
				this event is used as the currently selected event. If there is not a cache of events, it will use
				the first available event in the events array from the db as the selected event. */
        var getEvents = function () {
          $http.get('/users/events').success(function (data) {
            thisService.events = data;
            var cachedEvent = cache.getData('selectedEvent'), cachedId = cache.getData('eventId'), cachedUI = cache.getData('ui');
            var index;
            if (cachedEvent && cachedEvent != 'undefined' && cachedId && cachedId != 'undefined' && thisService.events.length && (index = checkEvent(cachedId)) && cachedUI && cachedUI === Authentication.user._id) {
              thisService.selectedEvent = thisService.events[index].name;
              thisService.postEventId = thisService.events[index]._id;
            } else {
              thisService.selectedEvent = thisService.events[0].name;
              thisService.postEventId = thisService.events[0]._id;
              put('selectedEvent', thisService.events[0].name);
              put('eventId', thisService.events[0]._id);
              put('ui', Authentication.user._id);
            }
          }).error(function (error, status) {
            thisService.selectedEvent = 'Error';
            //Attempt again in 5 seconds.
            if (status !== 401) {
              $timeout(function () {
                getEvents();
              }, 5000);
            }
          });
        };
        getEvents();
        thisService.changeEvent = function (event) {
          thisService.selectedEvent = event.name;
          thisService.postEventId = event._id;
          put('selectedEvent', event.name);
          put('eventId', event._id);
        };
        /**
				* Admins have permission to do anything with any event so there is no need for a divider.
				*/
        thisService.showDivider = function () {
          return false;
        };
      } else {
        var restrictedPaths = [
            '/invite',
            '/leaderboard'
          ];
        $rootScope.$on('$locationChangeSuccess', function (event) {
          var current_path = $location.path();
          for (var i = 0; i < restrictedPaths.length; i++) {
            if (current_path === restrictedPaths[i]) {
              thisService.nresDisabled = true;
              break;
            }
          }
          if (i === restrictedPaths.length) {
            thisService.nresDisabled = false;
          }
        });
        var checkEvent = function (needle) {
          for (var i = 0; i < thisService.events.length; i++) {
            if (thisService.events[i].event_id._id === needle) {
              return i;
            }
          }
          return false;
        };
        var getEvents = function () {
          $http.get('/users/events').success(function (data) {
            thisService.events = data.status;
            console.log(data);
            for (var i = 0; i < thisService.events.length; i++) {
              if (thisService.events[i].event_id.recruiter)
                thisService.numRecruiting++;
            }
            var cachedEvent = cache.getData('selectedEvent'), cachedId = cache.getData('eventId'), cachedUI = cache.getData('ui');
            var index;
            if (cachedEvent && cachedEvent != 'undefined' && cachedId && cachedId != 'undefined' && thisService.events.length && (index = checkEvent(cachedId)) && cachedUI && cachedUI === Authentication.user._id) {
              thisService.selectedEvent = thisService.events[index].event_id.name;
              thisService.postEventId = thisService.events[index].event_id._id;
              thisService.recruiterEvent = thisService.events[index].recruiter;
            } else {
              thisService.selectedEvent = thisService.events[0].event_id.name;
              thisService.postEventId = thisService.events[0].event_id._id;
              thisService.recruiterEvent = thisService.events[0].recruiter;
              put('selectedEvent', thisService.events[0].event_id.name);
              put('eventId', thisService.events[0].event_id._id);
              put('recruiterEvent', thisService.recruiterEvent);
              put('ui', Authentication.user._id);
            }
          }).error(function (error, status) {
            if (status === 400) {
              thisService.selectedEvent = 'Error';
              thisService.disabled = !thisService.disabled;
            }
            //Attempt again in 5 seconds.
            if (status !== 401) {
              $timeout(function () {
                getEvents();
              }, 5000);
            }
          });
        };
        getEvents();
        thisService.changeEvent = function (event) {
          thisService.selectedEvent = event.event_id.name;
          thisService.postEventId = event.event_id._id;
          thisService.recruiterEvent = event.recruiter;
          put('selectedEvent', event.event_id.name);
          put('eventId', event.event_id._id);
          put('recruiterEvent', thisService.recruiterEvent);
        };
        thisService.showDivider = function () {
          return thisService.numRecruiting > 0 && thisService.events.length > thisService.numRecruiting;
        };
      }
    };
    if ($window.user != '') {
      thisService.eventSelect();
    }
  }
]);'use strict';
/**
* Provides a dictionary of frank's interests as keys and the location
* where the images for a given interest can be found.
*/
angular.module('core').service('frankInterests', [function () {
    this.interests = {
      'Arts': 'img/interests/arts.png',
      'Child Development': 'img/interests/child_development.png',
      'Conservation': 'img/interests/conservation.png',
      'Corporate Social Responsibility': 'img/interests/corporate_social_responsibility.png',
      'Corrections': 'img/interests/corrections.png',
      'Culture': 'img/interests/culture.png',
      'Education': 'img/interests/education.png',
      'Entertainment': 'img/interests/entertainment.png',
      'Environment': 'img/interests/environment.png',
      'Food & Health': 'img/interests/food_&_health.png',
      'frank': 'img/interests/frank.png',
      'Gender Equality': 'img/interests/gender_equality.png',
      'Health': 'img/interests/health.png',
      'Human Rights': 'img/interests/human_rights.png',
      'Income Disparity': 'img/interests/income_disparity.png',
      'Inspiration': 'img/interests/inspiration.png',
      'International Development': 'img/interests/international_development.png',
      'Media': 'img/interests/media.png',
      'Mental Health': 'img/interests/mental_health.png',
      'Music': 'img/interests/music.png',
      'Politics': 'img/interests/politics.png',
      'Poverty': 'img/interests/poverty.png',
      'Religion': 'img/interests/religion.png',
      'Science': 'img/interests/science.png',
      'Social Media': 'img/interests/social_media.png',
      'Solutions Journalism': 'img/interests/solutions_journalism.png',
      'Special Needs': 'img/interests/special_needs.png',
      'Technology': 'img/interests/technology.png',
      'Tobacco': 'img/interests/tobacco.png',
      'Travel': 'img/interests/travel.png',
      'Violence Prevention': 'img/interests/violence_prevention.png',
      'Water': 'img/interests/water.png'
    };
  }]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
angular.module('core').factory('storageService', [
  '$cacheFactory',
  function ($cacheFactory) {
    return {
      get: function (key) {
        return localStorage.getItem(key);
      },
      save: function (key, data) {
        localStorage.setItem(key, data);
      },
      remove: function (key) {
        localStorage.removeItem(key);
      },
      clearAll: function () {
        localStorage.clear();
      }
    };
  }
]);'use strict';
angular.module('events').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Home state routing
    $stateProvider.state('events', {
      url: '/events',
      templateUrl: 'modules/events/views/events.client.view.html'
    });
  }
]);'use strict';
angular.module('events').controller('userEventCtrl', [
  '$scope',
  'ngTableParams',
  '$http',
  'eventSelector',
  '$filter',
  'dialogs',
  'Authentication',
  '$timeout',
  '$window',
  '$modal',
  '$location',
  function ($scope, ngTableParams, $http, eventSelector, $filter, dialogs, Authentication, $timeout, $window, $modal, $location) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, [
        'admin',
        'recruiter',
        'attendee'
      ]).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.user = Authentication;
      $scope.dpOpen = false;
      $scope.openDatepicker = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.dpOpen = true;
      };
      var getEvents = function () {
        $http.post('/events/user/allEvents').success(function (data) {
          $scope.events = [];
          $scope.events = data;
          for (var i = 0; i < $scope.events.length; i++) {
            //This is what is searched when the user tries to filter the table.  Two different formats are used to increase chances of returning what the user wants: (day_of_week, Month day, Year) & (M/d/yyyy)
            $scope.events[i].date = $filter('date')($scope.events[i].start_date, 'EEEE, MMMM d, yyyy') + ' - ' + $filter('date')($scope.events[i].end_date, 'EEEE, MMMM d, yyyy') + ' ' + $filter('date')($scope.events[i].start_date, 'M/d/yyyy') + ' - ' + $filter('date')($scope.events[i].end_date, 'M/d/yyyy');
            $scope.events[i].start_date = $filter('date')($scope.events[i].start_date, 'EEE, MMM d, yyyy');
            $scope.events[i].end_date = $filter('date')($scope.events[i].end_date, 'EEE, MMM d, yyyy');
          }
        }).error(function (error, status) {
          //Fail silently, since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
          if (status !== 401 && $location.path() === '/events') {
            $timeout(function () {
              getEvents();
            }, 5000);
          }
        });
      };
      getEvents();
      $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        filter: { name: '' },
        sorting: { name: 'asc' }
      }, {
        getData: function ($defer, params) {
          var filteredData = params.filter() ? $filter('filter')($scope.events, params.filter()) : $scope.events;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : $scope.events;
          if (orderedData) {
            params.total(orderedData.length);
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          } else {
            params.total(0);
            $defer.resolve(null);
          }
        }
      });
      $scope.$watch('events', function () {
        $timeout(function () {
          $scope.tableParams.reload();
        });
      });
      /*$scope.launch = function(event) {
				dlg = dialogs.confirm("Confirmation Vital", "Are you absolutely sure you want to go through the rigorous tests we put forth to become a recruiter for " + event.name + "? <br /><br />(You obviously have the right stuff if you have access to this page.)", {windowClass : "frank-recruiter-signup-modal"});
				dlg.result.then(function(btn){
					$http.post("candidate/setCandidate", {event_id:event._id}).success(function() {
						getEvents();
					}).error(function(error) {
						$window.alert("There was an error submitting your request.  Please try again later.");
					});
				});
			};*/
      $scope.launch = function (event) {
        var modalInstance = $modal.open({
            templateUrl: 'modules/events/views/recruiter-form.client.view.html',
            controller: 'FormModalCtrl',
            backdrop: 'static',
            keyboard: false,
            resolve: {
              event: function () {
                return event;
              }
            }
          });
        /**
				* The modal instance should return with either a truthy value.  If this value evaluates to
				* true, the table is updated.  Otherwise, the table will not be updated.
				*/
        modalInstance.result.then(function (answers) {
          if (answers) {
            getEvents();
          }
        });
      };
      /**
			* Adopted from post made on stackoverflow.com by disfated.  Original post here:
			* http://stackoverflow.com/questions/2332811/capitalize-words-in-string
			*/
      $scope.capitalize = function (string, lower) {
        return (lower ? string.toLowerCase() : string).replace(/(?:^|\s)\S/g, function (a) {
          return a.toUpperCase();
        });
      };
    }
  }
]);
angular.module('events').controller('FormModalCtrl', [
  '$scope',
  '$modalInstance',
  'event',
  'usSpinnerService',
  '$http',
  function ($scope, $modalInstance, event, usSpinnerService, $http) {
    $scope.event = event;
    $scope.answers = {};
    $scope.answers.reason = '';
    $scope.answers.connection = '';
    /**
		* 
		*/
    $http.post('/candidate/me').success(function (candidate, status) {
      if (status === 200) {
        if (candidate.note) {
          var startRegex = /\*\*\*\*\*\*\*\*\*\*/;
          var endRegex = /\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*/;
          var reasonRegex = /\*\*\*Reason:/;
          var connRegex = /\*\*\*Connections:/;
          var skillsRegex = /\*\*\*Recruiter Skills:/;
          if (candidate.note.search(startRegex) !== -1) {
            var rindex = candidate.note.search(reasonRegex);
            if (rindex !== -1) {
              rindex += 11;  //Go to the start of the reason answer.
            }
            var cindex = candidate.note.search(connRegex);
            var rend;
            //End of the reason answer.
            if (cindex !== -1) {
              rend = cindex - 2;
              cindex += 16;  //Go to the start of the connection answer.
            }
            var sindex = candidate.note.search(skillsRegex);
            var cend;
            if (sindex !== -1) {
              cend = sindex - 2;
              sindex += 21;
            }
            var send = candidate.note.search(endRegex);
            if (rindex !== -1 && cindex > rindex && send > sindex && sindex > cindex) {
              $scope.answers.reason = candidate.note.substring(rindex, rend);
              $scope.answers.connection = candidate.note.substring(cindex, cend);
            }
          }
        }
      }
    });
    $scope.spinnerOpts = {
      lines: 11,
      length: 12,
      width: 5,
      radius: 14,
      corners: 0.5,
      opacity: 0.05,
      shadow: true,
      color: [
        '#73c92d',
        '#f7b518',
        '#C54E90'
      ]
    };
    $scope.sending = false;
    $scope.tabs = [];
    $scope.tabs[0] = true;
    $scope.tabs[1] = false;
    $scope.tabs[2] = false;
    $scope.tabs[3] = false;
    $scope.tabs[4] = false;
    $scope.selected = 0;
    $scope.next = function () {
      //Simply set the next tab to be active, do not increment $scope.selected as it will be incremented by bootstrap-ui.
      $scope.tabs[++$scope.selected] = true;
    };
    $scope.previous = function () {
      //Simply set the previous tab to be active, do not increment $scope.selected as it will be incremented by bootstrap-ui.
      $scope.tabs[--$scope.selected] = true;
    };
    /**
		* Send candidate information to the backend.  The candidate's answers will be placed in the note
		* field so an admin can look over them later.
		*/
    $scope.send = function () {
      usSpinnerService.spin('candidate-form-spinner-1');
      $scope.sending = true;
      $scope.next();
      var notes = 'PLEASE DO NOT DELETE OR EDIT THIS SECTION:\n**********\n***Reason:\n' + $scope.answers.reason + '\n\n***Connections:\n' + $scope.answers.connection + '\n***************';
      $http.post('candidate/setCandidate', {
        event_id: event._id,
        note: notes
      }).success(function () {
        $scope.sending = false;
        $scope.error = false;
      }).error(function (error) {
        $scope.sending = false;
        $scope.error = true;
      });
    };
    $scope.done = function (status) {
      status = parseInt(status, 10);
      if (status) {
        $modalInstance.close(true);
      } else {
        $modalInstance.close(false);
      }
    };
  }
]);'use strict';
angular.module('invites').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Home state routing
    $stateProvider.state('invite', {
      url: '/invite',
      templateUrl: 'modules/invites/views/invites.client.view.html'
    });
  }
]);'use strict';
// :)
angular.module('invites').controller('invitesCtrl', [
  '$scope',
  'Authentication',
  '$location',
  'eventSelector',
  '$http',
  '$window',
  '$modal',
  'cacheService',
  'previewService',
  'usSpinnerService',
  function ($scope, Authentication, $location, eventSelector, $http, $window, $modal, cacheService, previewService, usSpinnerService) {
    $scope.authentication = Authentication;
    /*
		* If the user is not logged in, they should be redirected to the sigin page.  If the
		* user is logged in, but does not have the proper permissions they should be
		* redirected to the homepage.
		*/
    if (!$scope.authentication.user) {
      $location.path('/signin');
    } else if (!_.intersection($scope.authentication.user.roles, [
        'recruiter',
        'admin'
      ]).length) {
      $location.path('/');
    } else {
      //Defaults for when the screen is too small to display the sidebar.
      $scope.sidebarActiveColor = '#333232';
      $scope.sidebarInactiveColor = '#6c6969';
      $scope.sidebarColor = $scope.sidebarInactiveColor;
      $scope.sidebarOpen = false;
      if (!eventSelector.recruiterEvent) {
        angular.element('#invitation-submit-button').addClass('disabled');
        angular.element('#invitation-preview-button').addClass('disabled');
      }
      var tempEvent = cacheService.getData('selectedEvent');
      if (!tempEvent || tempEvent === 'Select Event') {
        angular.element('#invitation-submit-button').addClass('disabled');
        angular.element('#invitation-preview-button').addClass('disabled');
        $scope.eventWarning = $modal.open({
          controller: 'modalCtrl',
          template: '<div class=\'modal-header\'>' + '<h3 class=\'modal-title\'>Select Event</h3>' + '</div>' + '<div class=\'modal-body\'>' + '<p>It looks like you do not have an event selected or you did not have an event for which you are recruiting selected.  That\'s alright, just select the event for which you want to send an invitation before proceeding.</p>' + '<p>(The event selector is in the top right-hand corner by your name.)</p>' + '</div>' + '<div class=\'modal-footer\'>' + '<button class=\'btn btn-primary\' ng-click=\'closeWarning()\'>OK</button>' + '</div>'
        });
      }
      $scope.recruiter_email = $scope.authentication.user.email;
      $scope.invite = {};
      $scope.invite.event_name = eventSelector.selectedEvent;
      $scope.invite.event_id = eventSelector.postEventId;
      $scope.$watch(function () {
        return eventSelector.selectedEvent;
      }, function () {
        if (eventSelector.postEventId) {
          if (eventSelector.recruiterEvent) {
            angular.element('#invitation-submit-button').removeClass('disabled');
            angular.element('#invitation-preview-button').removeClass('disabled');
          }
          $scope.invite.event_name = eventSelector.selectedEvent;
          $scope.invite.event_id = eventSelector.postEventId;
          getPreview();
        }
      });
      $scope.sending = false;
      $scope.send = function () {
        $scope.sending = true;
        usSpinnerService.spin('spinner-1');
        angular.element('#invitation-submit-button').addClass('disabled');
        $http.post('/send/evite', $scope.invite).success(function (response) {
          //Set all form fields to blank so the user can send another invitation.
          $scope.invite.fName = '';
          $scope.invite.lName = '';
          $scope.invite.email = '';
          $scope.invite.message = '';
          angular.element('#invitation-submit-button').removeClass('disabled');
          getSideTables();
          usSpinnerService.stop('spinner-1');
          $scope.sending = false;
          $window.alert(response.message);
        }).error(function (response, status) {
          if (status !== 401) {
            if (status !== 500) {
              angular.element('#invitation-submit-button').removeClass('disabled');
              usSpinnerService.stop('spinner-1');
              $scope.sending = false;
              $window.alert('There was an error sending this message.\n\nError: ' + response.message + '\nIf this error continues, please <a href=\'/#!/problems\'>report this issue</a>');
            } else {
              angular.element('#invitation-submit-button').removeClass('disabled');
              usSpinnerService.stop('spinner-1');
              $scope.sending = false;
              $window.alert('We could not connect to the server right now.\nIf this error continues, please <a href=\'/#!/problems\'>report this issue</a>');
            }
          } else {
            angular.element('#invitation-submit-button').removeClass('disabled');
            usSpinnerService.stop('spinner-1');
            $scope.sending = false;
            $location.path('/');
          }
        });
      };
      /*
			* Logic for sidebars
			*/
      $scope.firstSelected = true;
      $scope.secondSelected = false;
      $scope.thirdSelected = false;
      $scope.attendees = {}, $scope.attendees.list = [];
      $scope.invitees = {}, $scope.invitees.list = [];
      $scope.almosts = {}, $scope.almosts.list = [];
      var getSideTables = function () {
        if ($scope.invite.event_id) {
          var request = { event_id: $scope.invite.event_id };
          $http.post('/recruiter/attendees', request).success(function (response) {
            $scope.attendees.list = response;
            if (response.length) {
              $scope.attendees.error = '';
            } else {
              $scope.attendees.error = 'What?  How could this be?  Nobody has accepted one of your invitations yet!?!';
            }
          }).error(function (response, status) {
            $scope.attendees.list = [];
            //Since the http interceptor handles 401 cases, simply display a message despite the error code.
            if (status === 400 && response.message === 'User not found or nobody the user invited has signed up to attend yet.') {
              $scope.attendees.error = 'What?  How could this be?  Nobody has accepted one of your invitations yet!?!';
            } else {
              $scope.attendees.error = response.message;  //If the interceptor has not redirected the user, this message may contain helpful information.
            }
          });
          $http.post('/recruiter/invitees', request).success(function (response) {
            $scope.invitees.list = response;
            if (response.length) {
              $scope.invitees.error = '';
            } else {
              $scope.invitees.error = 'How will anybody have be able to enjoy ' + eventSelector.selectedEvent + ' without wonderful people like you inviting them?  You should invite more people.';
            }
          }).error(function (response, status) {
            $scope.invitees.list = [];
            if (status === 400 && response.message === 'User not found or nobody the user invited has signed up to attend yet.') {
              $scope.invitees.error = 'How will anybody have be able to enjoy ' + eventSelector.selectedEvent + ' without wonderful people like you inviting them?  You should invite more people.';
            } else {
              $scope.attendees.error = response.message;
            }
          });
          $http.post('/recruiter/almosts', request).success(function (response) {
            $scope.almosts.list = response;
            if (response.length) {
              $scope.almosts.error = '';
            } else {
              $scope.almosts.error = 'Nobody has chosen somebody else\'s invitation over your invitation.  Looks like somebody is popular.';
            }
          }).error(function (response, status) {
            $scope.almosts.list = [];
            if (status === 400 && response.message === 'User not found or nobody the user invited has signed up to attend yet.') {
              $scope.almosts.error = 'Nobody has chosen somebody else\'s invitation over your invitation.  Looks like somebody is popular.';
            } else {
              $scope.almosts.error = response.message;
            }
          });
        } else {
          $scope.attendees.error = 'You have not selected an event.  You can do so in the top right-hand corner.';
          $scope.invitees.error = 'You have not selected an event.  You can do so in the top right-hand corner.';
          $scope.almosts.error = 'You have not selected an event.  You can do so in the top right-hand corner.';
        }
      };
      getSideTables();
      /*
			* Logic for preview.
			*/
      var previewOptions = {};
      var minPreviewWindowSize = 750;
      //Miniumum size (inclusive) of the window before the window will open the preview in a new tab.
      $scope.previewNewTab = false;
      $scope.previewQuery = '';
      if ($window.innerWidth <= minPreviewWindowSize) {
        $scope.previewNewTab = true;
      }
      $scope.$watch(function () {
        return $window.innerWidth;
      }, function () {
        if ($window.innerWidth <= minPreviewWindowSize) {
          $scope.previewNewTab = true;
        } else if ($scope.previewNewTab) {
          $scope.previewNewTab = false;
        }
      });
      previewService.preview.recruiter_name = $scope.authentication.user.fName;
      previewService.preview.sender_email = $scope.authentication.user.email;
      previewService.preview.event_name = $scope.invite.event_name;
      previewService.preview.receiver_email = $scope.invite.invitee_email;
      previewService.preview.receiver_name = $scope.invite.fName;
      previewService.preview.message = $scope.invite.message;
      $scope.previewQuery = 'filename=' + encodeURIComponent(eventSelector.selectedEvent.replace(/\s{2,}/, ' ').replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g, '').replace(/\s/g, '_')) + '&recruiter_name=' + encodeURIComponent(previewService.preview.recruiter_name) + '&sender_email=' + encodeURIComponent(previewService.preview.sender_email) + '&event_name=' + encodeURIComponent(previewService.preview.event_name) + '&receiver_email=' + encodeURIComponent(previewService.preview.receiver_email) + '&receiver_name=' + encodeURIComponent(previewService.preview.receiver_name) + '&message=' + encodeURIComponent(previewService.preview.message);
      $scope.$watchCollection('invite', function () {
        previewService.preview.sender_email = $scope.authentication.user.email;
        previewService.preview.event_name = $scope.invite.event_name;
        previewService.preview.receiver_email = $scope.invite.invitee_email;
        previewService.preview.receiver_name = $scope.invite.fName;
        previewService.preview.message = $scope.invite.message;
        $scope.previewQuery = 'filename=' + encodeURIComponent(eventSelector.selectedEvent.replace(/\s{2,}/, ' ').replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g, '').replace(/\s/g, '_')) + '&recruiter_name=' + encodeURIComponent(previewService.preview.recruiter_name) + '&sender_email=' + encodeURIComponent(previewService.preview.sender_email) + '&event_name=' + encodeURIComponent(previewService.preview.event_name) + '&receiver_email=' + encodeURIComponent(previewService.preview.receiver_email) + '&receiver_name=' + encodeURIComponent(previewService.preview.receiver_name) + '&message=' + encodeURIComponent(previewService.preview.message);
      });
      var getPreview = function () {
        var request = {
            event_id: eventSelector.postEventId,
            event_name: eventSelector.selectedEvent
          };
        $http.get('/preview/invitation', { params: request }).success(function (response) {
          previewOptions.template = response.preview;
          previewOptions.template = '<div class=\'modal-header\'>' + '<h3 class=\'modal-title\'>{{eventSelector.selectedEvent}} Invitation Preview</h3>' + '</div>' + '<div class=\'modal-body\'>' + previewOptions.template + '</div>' + '<div class=\'modal-footer\'>' + '<button class=\'btn btn-primary\' ng-click=\'closePreview()\'>Got it!</button>' + '</div>';
        }).error(function (response, status) {
          previewOptions = {};
          previewOptions.template = response.message;
          previewOptions.template = '<div class=\'modal-header\'>' + '<h3 class=\'modal-title\'>{{eventSelector.selectedEvent}} Invitation Preview</h3>' + '</div>' + '<div class=\'modal-body\' style=\'overflow: auto;\'>' + previewOptions.template + '</div>' + '<div class=\'modal-footer\'>' + '<button class=\'btn btn-primary\' ng-click=\'closePreview()\'>Got it!</button>' + '</div>';
        });
      };
      $scope.togglePreview = function () {
        if (!previewService.preview.modalInstance) {
          previewOptions.controller = 'modalCtrl';
          previewOptions.backdrop = false;
          previewOptions.windowClass = 'frank-invite-preview-modal';
          previewOptions.modalDraggable = true;
          previewOptions.keyboard = false;
          previewService.preview.modalInstance = $modal.open(previewOptions);
        }
      };
      $scope.$watch(function () {
        return eventSelector.postEventId;
      }, function () {
        $scope.invite.event_id = eventSelector.postEventId;
        $scope.previewQuery = 'filename=' + encodeURIComponent(eventSelector.selectedEvent.replace(/\s{2,}/, ' ').replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]'\\@+"|<>?]/g, '').replace(/\s/g, '_')) + '&recruiter_name=' + encodeURIComponent(previewService.preview.recruiter_name) + '&sender_email=' + encodeURIComponent(previewService.preview.sender_email) + '&event_name=' + encodeURIComponent(previewService.preview.event_name) + '&receiver_email=' + encodeURIComponent(previewService.preview.receiver_email) + '&receiver_name=' + encodeURIComponent(previewService.preview.receiver_name) + '&message=' + encodeURIComponent(previewService.preview.message);
        getSideTables();
      });
    }
  }
]);
angular.module('invites').controller('modalCtrl', [
  '$scope',
  '$modalInstance',
  'eventSelector',
  'previewService',
  function ($scope, $modalInstance, eventSelector, previewService) {
    $scope.closeWarning = function () {
      $modalInstance.dismiss('done');
    };
    $scope.previewService = previewService;
    $scope.recruiter_name = previewService.preview.recruiter_name;
    $scope.event_name = previewService.preview.event_name;
    $scope.receiver_name = previewService.preview.receiver_name;
    $scope.receiver_email = previewService.preview.receiver_email;
    $scope.sender_email = previewService.preview.sender_email;
    $scope.message = previewService.preview.message;
    $scope.modalInstance = previewService.preview.modalInstance;
    $scope.$watchCollection('previewService.preview', function () {
      $scope.event_name = previewService.preview.event_name;
      $scope.receiver_name = previewService.preview.receiver_name;
      $scope.receiver_email = previewService.preview.receiver_email;
      $scope.sender_email = previewService.preview.sender_email;
      $scope.message = previewService.preview.message;
      $scope.modalInstance = previewService.preview.modalInstance;
    });
    $scope.closePreview = function () {
      $modalInstance.close();
      previewService.preview.modalInstance = null;
    };
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('previewService', [function () {
    this.preview = {};
    this.preview.modalInstance = null;
    this.preview.recruiter_name = '';
    this.preview.event_name = '';
    this.preview.sender_email = '';
    this.preview.receiver_email = '';
    this.preview.receiver_name = '';
    this.preview.message = '';
  }]);'use strict';
angular.module('krewes').config([
  'localStorageServiceProvider',
  function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('frankRS').setStorageCookie(365).setStorageCookieDomain(window.location.host).setStorageType('localStorage').setNotify(false, false);  // Notifications are not necessary
  }
]);'use strict';
angular.module('krewes').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('krewes', {
      url: '/krewes_portal',
      templateUrl: 'modules/krewes/views/krewes.client.view.html'
    });
  }
]);'use strict';
angular.module('krewes').controller('ConflictModalCtrl', [
  '$scope',
  '$modalInstance',
  'message',
  'serverKrewe',
  'localKrewe',
  'memberIndex',
  'kreweDeleted',
  'conflictIndicators',
  'frankInterests',
  function ($scope, $modalInstance, message, serverKrewe, localKrewe, memberIndex, kreweDeleted, conflictIndicators, frankInterests) {
    $scope.message = message;
    $scope.serverKrewe = serverKrewe;
    $scope.localKrewe = localKrewe;
    $scope.kreweDeleted = kreweDeleted;
    $scope.interestsSource = frankInterests.interests;
    $scope.serverMemberIndex = memberIndex.server;
    $scope.localMemberIndex = memberIndex.local;
    $scope.nameConflict = conflictIndicators.name;
    $scope.kaptainConflict = conflictIndicators.kaptain;
    $scope.memberConflict = conflictIndicators.member;
    $scope.closeModal = function (selection) {
      $modalInstance.close(parseInt(selection, 10));
    };
  }
]);'use strict';
angular.module('krewes').controller('SaveModalCtrl', [
  '$scope',
  '$modalInstance',
  'data',
  '$timeout',
  'usSpinnerService',
  function ($scope, $modalInstance, data, $timeout, usSpinnerService) {
    $scope.status = data.statusMessage;
    $scope.loading = data.loading;
    $scope.error = data.errorSaving;
    $scope.spinnerOpts = {
      lines: 11,
      length: 12,
      width: 5,
      radius: 14,
      corners: 0.5,
      opacity: 0.05,
      shadow: true,
      color: [
        '#73c92d',
        '#f7b518',
        '#c54e80'
      ]
    };
    $scope.$watch(function () {
      return data.loading;
    }, function () {
      if (data.loading === false) {
        // If done loading, close the modal in 5 seconds.
        $timeout(function () {
          $modalInstance.close();
        }, 5000);
      }
    });
    $scope.$watch(function () {
      return data.statusMessage;
    }, function () {
      $scope.status = data.statusMessage;
      $scope.loading = data.loading;
      $scope.error = data.errorSaving;
    });
  }
]);'use strict';
angular.module('krewes').controller('KreweController', [
  '$scope',
  'Authentication',
  '$http',
  '$location',
  'eventSelector',
  '$timeout',
  'localStorageService',
  'frankInterests',
  '$modal',
  '$window',
  '$filter',
  function ($scope, Authentication, $http, $location, eventSelector, $timeout, localStorageService, frankInterests, $modal, $window, $filter) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, [
        'admin',
        'kreweAdmin',
        'kaptain'
      ]).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      if (_.intersection(Authentication.user.roles, [
          'admin',
          'kreweAdmin'
        ]).length !== 0) {
        /*** scope Variables ***/
        $scope.krewes = [];
        $scope.potentialMembers = [];
        $scope.newPotentialMembers = [];
        $scope.nameLock = -1;
        // Dictionary of potential interests as the key and the path to their image as the value.
        $scope.interestsSource = frankInterests.interests;
        /*** Variables ***/
        var originalDataPrefix = 'original_';
        // Prefix to add to original krewe data.
        var currentDataPrefix = 'dirty_';
        // Prefix to add to current version of krewe data.
        var deltaPrefix = 'delta_';
        // Prefix to add to delta information.
        var potentialMembersPrefix = 'potential_';
        // Prefix to add to current potential members.
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
        var loadKrewes = function (convertKaptain, done) {
          if (typeof convertKaptain !== 'boolean') {
            if (!done) {
              done = convertKaptain;
            }
            convertKaptain = true;
          }
          $http.post('/krewes', { event_id: eventSelector.postEventId }).success(function (kreweData, status) {
            // Transform the kaptain field for each krewe to the format dnd expects.
            if (convertKaptain) {
              for (var i = kreweData.length - 1; i >= 0; i--) {
                if (!kreweData[i].kaptain) {
                  kreweData[i].kaptain = [];
                  continue;
                }
                kreweData[i].kaptain = [kreweData[i].kaptain];
              }
            }
            if (done && {}.toString.call(done) === '[object Function]') {
              done(null, kreweData);
            }
          }).error(function (errMessage, status) {
            if (done && {}.toString.call(done) === '[object Function]') {
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
        var loadPotentialMembers = function (done) {
          $http.post('/krewes/users', { event_id: eventSelector.postEventId }).success(function (unassignedUsers, status) {
            if (done && {}.toString.call(done) === '[object Function]') {
              done(null, unassignedUsers);
            }
          }).error(function (errMessage, status) {
            if (done && {}.toString.call(done) === '[object Function]') {
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
        var binarySearch = function (needle, haystack) {
          var index;
          var lowerBounds = 0;
          var upperBounds = haystack.length - 1;
          console.log(haystack);
          console.log(haystack.length);
          console.log(upperBounds);
          while (true) {
            if (lowerBounds > upperBounds) {
              return null;
            }
            index = lowerBounds + Math.floor((upperBounds - lowerBounds) / 2);
            console.log(lowerBounds, index, upperBounds);
            if (haystack[index]._id === needle) {
              return index;
            } else if (haystack[index]._id > needle) {
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
        var setDifference = function (setA, setB) {
          var setAKeys = _.keys(setA);
          var difference = {};
          for (var setAIndex = setAKeys.length - 1; setAIndex >= 0; setAIndex--) {
            if (!setB[setAKeys[setAIndex]]) {
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
        var scanNonMemberFields = function (localKrewes, serverKrewes, deltas, deltaKeys, deltaIndex, callback) {
          if (deltas.length === deltaIndex) {
            callback();
          }
          var localKrewe;
          // Populated only if a conflict is found.
          var serverIndex = binarySearch(deltaKeys[deltaIndex], serverKrewes);
          async.series([
            function (asyncSeriesCallback) {
              console.log(deltaKeys[deltaIndex]);
              console.log(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex]);
              console.log(deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && deltaKeys[deltaIndex] != 0);
              if (deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && serverIndex === null) {
                // Server version was not found.  This item has been deleted.  Ask the user what to do.  If the user wants to keep the krewe, the krewe's _id needs to be set to null to be assigned a new krewe.localKrewe = localChanges[binarySearch(deltaKeys[deltaIndex], localChanges)];
                queryUser(UserQueryTypes.kreweMissing, localKrewe, function (selection) {
                  if (selection === 0) {
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
            function (asyncSeriesCallback) {
              var currentDelta = deltas[deltaKeys[deltaIndex]];
              var serverKrewe = serverKrewes[serverIndex];
              console.log('*********************');
              console.log(currentDelta);
              console.log(serverKrewe);
              console.log('*********************');
              async.parallel([
                function (asyncParallelCallback) {
                  if (deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && currentDelta.name && currentDelta.name.original !== serverKrewe.name && currentDelta.name.current !== serverKrewe.name) {
                    // Cannot resolve automatically.  Ask the user which version to keep (original, current, server).
                    if (!localKrewe) {
                      localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
                    }
                    queryUser(UserQueryTypes.kreweName, localKrewe, serverKrewes[serverIndex], function (selection) {
                      if (selection === 0) {
                        // Sever version was chosen.  Update the local version.
                        localKrewe.name = serverKrewe.name;
                      } else if (selection === 1) {
                        // Local version was chosen.  Update the server version.
                        serverKrewe.name = localKrewe.name;
                      }
                      asyncParallelCallback();
                    });
                  } else if (deltaKeys[deltaIndex] != +deltaKeys[deltaIndex]) {
                    if (!localKrewe) {
                      localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
                    }
                    // Either the localKrewe already has the name on the server, or the server was updated last.  Either way, the version saved to the server should have the name for serverKrewe.
                    localKrewe.name = serverKrewe.name;
                    asyncParallelCallback();
                  } else {
                    asyncParallelCallback();
                  }
                },
                function (asyncParallelCallback) {
                  if (deltaKeys[deltaIndex] != +deltaKeys[deltaIndex] && currentDelta.kaptain && currentDelta.kaptain.original !== serverKrewe.kaptain[0]._id && currentDelta.kaptain.current !== serverKrewe.kaptain[0]._id) {
                    // Cannot resolve automatically.  Ask the user which version to keep (original, current, server).
                    if (!localKrewe) {
                      localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
                    }
                    queryUser(UserQueryTypes.kreweKaptain, localKrewe, serverKrewes[serverIndex], function (selection) {
                      if (selection === 0) {
                        // Sever version was chosen.  Update the local version.
                        localKrewe.kaptain = serverKrewe.kaptain;
                      } else if (selection === 1) {
                        // Local version was chosen.  Update the server version.
                        serverKrewe.kaptain = localKrewe.kaptain;
                      }
                      asyncParallelCallback();
                    });
                  } else if (deltaKeys[deltaIndex] != +deltaKeys[deltaIndex]) {
                    if (!localKrewe) {
                      localKrewe = localKrewes[binarySearch(deltaKeys[deltaIndex], localKrewes)];
                    }
                    // Either the localKrewe already has the same kaptain as on the server, or the server was updated last.  Either way, the version saved to the server should have the same kaptain as already on the server.
                    localKrewe.kaptain = serverKrewe.kaptain;
                    asyncParallelCallback();
                  } else {
                    asyncParallelCallback();
                  }
                }
              ], function (error, results) {
                asyncSeriesCallback();
              });
            }
          ], function (error, results) {
            if (++deltaIndex < deltaKeys.length) {
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
        var resolveConflicts = function (deltas, localChanges, originalVersion, serverVersion, callback) {
          var deltaKeys = _.keys(deltas);
          var tempIdMax = getNextId(eventSelector.postEventId.toString());
          // Sort the krewe arrays for quicker lookup.
          quickSortKrewes(serverVersion);
          quickSortKrewes(localChanges);
          // Check each delta and determine if a conflict can be resolved programatically.
          scanNonMemberFields(localChanges, serverVersion, deltas, deltaKeys, 0, function () {
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
            for (var localIndex = localChanges.length - 1; localIndex >= 0; localIndex--) {
              var currentKreweId = localChanges[localIndex]._id.toString();
              var currentKaptain = null;
              if (localChanges[localIndex].kaptain && localChanges[localIndex].kaptain.length) {
                currentKaptain = localChanges[localIndex].kaptain[0]._id;
              }
              if (currentKaptain) {
                kaptains[currentKaptain] = {
                  krewe: currentKreweId,
                  kreweIndex: localIndex
                };
              }
              for (var localMemberIndex = localChanges[localIndex].members.length - 1; localMemberIndex >= 0; localMemberIndex--) {
                var currentMemberId = localChanges[localIndex].members[localMemberIndex]._id;
                localMembers[currentMemberId] = {
                  krewe: currentKreweId,
                  kreweIndex: localIndex,
                  memberIndex: localMemberIndex,
                  original: currentKreweId
                };
                localMemberKeys.push(currentMemberId);
                if (deltas[currentKreweId] && deltas[currentKreweId].members[currentMemberId]) {
                  // This member was added to this Krewe locally.
                  localMembers[currentMemberId].action = deltas[currentKreweId].members[currentMemberId].action;
                  // Find the original Krewe from which they were removed.
                  for (var deltaIndex = deltaKeys.length - 1; deltaIndex >= 0; deltaIndex--) {
                    if (deltaKeys[deltaIndex] === currentKreweId) {
                      continue;
                    }
                    if (deltas[deltaKeys[deltaIndex]].members && deltas[deltaKeys[deltaIndex]].members[currentMemberId]) {
                      localMembers[currentMemberId].original = deltaKeys[deltaIndex];
                    }
                  }
                }
              }
            }
            // Make sure the members that no longer part of a Krewe are included.
            for (var deltaIndex = deltaKeys.length - 1; deltaIndex >= 0; deltaIndex--) {
              var deltaMembers = _.keys(deltas[deltaKeys[deltaIndex]].members);
              for (var memberIndex = deltaMembers.length - 1; memberIndex >= 0; memberIndex--) {
                if (!localMembers[deltaMembers[memberIndex]] && !kaptains[deltaMembers[memberIndex]]) {
                  // This member does not exist in localMembers, add him/her.
                  localMembers[deltaMembers[memberIndex]] = {
                    krewe: null,
                    original: deltaKeys[deltaIndex],
                    action: '-'
                  };
                }
              }
            }
            var serverMembers = {};
            var serverMemberConflicts = {};
            var serverMemberKeys = [];
            for (var serverIndex = serverVersion.length - 1; serverIndex >= 0; serverIndex--) {
              var currentKreweId = serverVersion[serverIndex]._id;
              var currentKaptain = null;
              if (serverVersion[serverIndex].kaptain && serverVersion[serverIndex].kaptain.length) {
                currentKaptain = serverVersion[serverIndex].kaptain[0]._id;
              }
              if (currentKaptain && kaptains[currentKaptain] && kaptains[currentKaptain].krewe !== currentKreweId) {
                // Conflict!  This Kaptain is a Kaptain for more than one group.
                kaptainConflicts[currentKaptain] = kaptains[currentKaptain];
                kaptainConflicts[currentKaptain].conflictingKrewe = currentKreweId;
                kaptainConflicts[currentKaptain].conflictingKreweIndex = serverIndex;
                conflictingKaptainKeys.push(currentKaptain);
              }
              for (var serverMemberIndex = serverVersion[serverIndex].members.length - 1; serverMemberIndex >= 0; serverMemberIndex--) {
                var currentMemberId = serverVersion[serverIndex].members[serverMemberIndex]._id;
                serverMembers[currentMemberId] = {
                  krewe: currentKreweId,
                  kreweIndex: serverIndex,
                  memberIndex: serverMemberIndex
                };
                if (!localMembers[currentMemberId]) {
                  // This member was added by another.  Merge the changes only if the Krewe is already in the local version and won't be overwritten later.
                  if (deltas[currentKreweId]) {
                    localChanges[binarySearch(currentKreweId, localChanges)].members.push(serverVersion[serverIndex].members[serverMemberIndex]);
                  }
                  continue;
                } else if (localMembers[currentMemberId].krewe === currentKreweId || localMembers[currentMemberId].original === currentKreweId) {
                  // No conflict.  Use the local version.
                  continue;
                }
                serverMemberConflicts[currentMemberId] = serverMembers[currentMemberId];
                serverMemberKeys.push(currentMemberId);
              }
            }
            if (conflictingKaptainKeys.length) {
              scanKaptains(localChanges, serverVersion, kaptainConflicts, conflictingKaptainKeys, 0, function () {
                if (serverMemberKeys.length) {
                  scanMembers(serverVersion, localChanges, serverMemberConflicts, localMembers, serverMemberKeys, 0, function () {
                    mergeKrewes(localChanges, serverVersion, localMembers, serverMembers, deltas);
                    callback();
                  });
                } else {
                  mergeKrewes(localChanges, serverVersion, localMembers, serverMembers, deltas);
                  callback();
                }
              });
            } else {
              if (serverMemberKeys.length) {
                scanMembers(serverVersion, localChanges, serverMemberConflicts, localMembers, serverMemberKeys, 0, function () {
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
        var mergeKrewes = function (localKrewes, serverKrewes, localMembers, serverMembers, deltas) {
          // Find Krewes that were not modified and replace them with the server version.
          for (var serverIndex = serverKrewes.length - 1; serverIndex >= 0; serverIndex--) {
            if (!deltas[serverKrewes[serverIndex]._id]) {
              // No deltas exist for this Krewe.
              var localIndex = binarySearch(serverKrewes[serverIndex]._id, localKrewes);
              if (localIndex || localIndex === 0) {
                localKrewes[localIndex] = serverKrewes[serverIndex];
              } else {
                localKrewes.push(serverKrewes[serverIndex]);
              }
            }
          }
          // Make sure there is no overlap of Kaptains and Krewe members.  Since Kaptain conflicts have been resolved, Kaptains supercede member status.
          for (var localIndex = localKrewes.length - 1; localIndex >= 0; localIndex--) {
            if (!localKrewes[localIndex].kaptain.length) {
              continue;
            }
            var kaptainId = localKrewes[localIndex].kaptain[0]._id;
            if (localMembers[kaptainId]) {
              if (localMembers[kaptainId].krewe) {
                localKrewes[localMembers[kaptainId].kreweIndex].members.splice(localMembers[kaptainId].memberIndex, 1);  // for(var memberIndex = localMemberKeys.length - 1; memberIndex >= 0; memberIndex--) {
                                                                                                                         // 	if(localMembers[localMemberKeys[memberIndex]].memberIndex > localMembers[kaptainId].memberIndex && localMembers[localMemberKeys[memberIndex]].krewe === localMembers[kaptainId].krewe) {
                                                                                                                         // 		localMembers[localMemberKeys[memberIndex]].memberIndex--;
                                                                                                                         // 	}
                                                                                                                         // }
              }
              delete localMembers[kaptainId];
            } else if (serverMembers[kaptainId]) {
              if (serverMembers[kaptainId].krewe) {
                // At this point, the server and local Krewes have been merged.
                var index = binarySearch(serverMembers[kaptainId].krewe, localKrewes);
                localKrewes[index].members.splice(serverMembers[kaptainId].memberIndex, 1);
              }
              delete serverMembers[kaptainId];
            }
          }
        };
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
        var scanKaptains = function (localKrewes, serverKrewes, kaptainConflicts, conflictingKaptainKeys, index, callback) {
          var conflictingKaptain = kaptainConflicts[conflictingKaptainKeys[index]];
          queryUser(UserQueryTypes.kreweKaptain, localKrewes[conflictingKaptain.kreweIndex], serverKrewes[conflictingKaptain.conflictingKreweIndex], function (selection) {
            if (selection === 0) {
              localKrewes[conflictingKaptain.kreweIndex].kaptain = [];
            } else {
              serverKrewes[conflictingKaptain.conflictingKreweIndex].kaptain = [];
            }
            if (conflictingKaptainKeys.length > ++index) {
              scanKaptains(localKrewes, kaptainConflicts, conflictingKaptainKeys, index, callback);
            } else {
              callback();
            }
          });
        };
        /**
				* Iterates over the members in serverMemberKeys and detects and resolves any conflicts recursively.
				*/
        var scanMembers = function (serverKrewes, localKrewes, serverMembers, localMembers, serverMemberKeys, serverIndex, callback) {
          var serverMember = serverMembers[serverMemberKeys[serverIndex]];
          var localMember = localMembers[serverMemberKeys[serverIndex]];
          queryUser(UserQueryTypes.kreweMember, localKrewes[localMember.kreweIndex], serverKrewes[serverMember.kreweIndex], serverMember.memberIndex, localMember.memberIndex, function (selection) {
            if (selection === 0) {
              var displacedMember = localKrewes[localMember.kreweIndex].members.splice(localMember.memberIndex, 1)[0];
              var localIndex = binarySearch(serverMember.krewe, localKrewes);
              // If this Krewe exists on the local version, add the member.  Otherwise, the entire Krewe will be added later.
              if (localIndex) {
                localKrewes[localIndex].members.push(displacedMember);
              }
              delete localMembers[serverMemberKeys[serverIndex]];
            } else {
              serverKrewes[serverMember.kreweIndex].members.splice(serverMember.memberIndex, 1)[0];
              delete serverMembers[serverMemberKeys[serverIndex]];
            }
            if (serverMemberKeys.length > ++serverIndex) {
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
            kreweName: 1,
            kreweKaptain: 2,
            kreweMember: 3,
            kreweMissing: 4,
            memberMissing: 5
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
        var queryUser = function (queryType, localKrewe, serverKrewe, serverMemberIndex, localMemberIndex, callback) {
          console.log(!queryType);
          console.log(queryType !== UserQueryTypes.kreweMissing && (!serverKrewe || typeof serverKrewe !== 'object'));
          console.log(!localKrewe);
          console.log(queryType === UserQueryTypes.kreweMember && (!serverMemberIndex || !localMemberIndex || serverMemberIndex !== +serverMemberIndex || localMemberIndex !== +localMemberIndex));
          if (!queryType || !localKrewe || queryType !== UserQueryTypes.kreweMissing && (!serverKrewe || typeof serverKrewe !== 'object') || queryType === UserQueryTypes.kreweMember && (!serverMemberIndex && serverMemberIndex !== 0 || !localMemberIndex && localMemberIndex !== 0 || serverMemberIndex !== +serverMemberIndex || localMemberIndex !== +localMemberIndex)) {
            return -1;
          }
          if (!callback) {
            if (serverKrewe && {}.toString.call(serverKrewe) === '[object Function]') {
              callback = serverKrewe;
              serverKrewe = null;
            } else if (serverMemberIndex && {}.toString.call(serverMemberIndex) === '[object Function]') {
              callback = serverMemberIndex;
              serverMemberIndex = null;
            } else {
              return -1;
            }
          }
          var modalMessage;
          var conflictIndicators = {
              name: false,
              kaptain: false,
              member: false
            };
          if (queryType === UserQueryTypes.kreweName) {
            modalMessage = 'Krewe name modified on the server and locally.  Which version should be kept?';
            conflictIndicators.name = true;
          } else if (queryType === UserQueryTypes.kreweKaptain) {
            modalMessage = 'Krewe Kaptain modified on the server and locally.  Which version should be kept?';
            conflictIndicators.kaptain = true;
          } else if (queryType === UserQueryTypes.kreweMember) {
            modalMessage = 'An attendee\'s assigned Krewe was changed on the server and locally.  Which version should be kept?';
            conflictIndicators.member = true;
          } else if (queryType === UserQueryTypes.kreweMissing) {
            modalMessage = 'This Krewe was deleted on the server.  Should it be kept or deleted?';
          } else if (queryType === UserQueryTypes.memberMissing) {
            modalMessage = 'This member has vanished.  Should we remove them from all Krewes or keep them in their original Krewe?';
            conflictIndicators.member = true;
          } else {
            return -1;
          }
          var modalInstance = $modal.open({
              templateUrl: 'modules/krewes/views/krewe-conflict.client.view.html',
              controller: 'ConflictModalCtrl',
              resolve: {
                message: function () {
                  return modalMessage;
                },
                serverKrewe: function () {
                  return {
                    value: serverKrewe,
                    key: 0
                  };
                },
                localKrewe: function () {
                  return {
                    value: localKrewe,
                    key: 1
                  };
                },
                memberIndex: function () {
                  if (queryType === UserQueryTypes.kreweMember) {
                    return {
                      server: serverMemberIndex,
                      local: localMemberIndex
                    };
                  } else if (queryType === UserQueryTypes.missingMembers) {
                    return { local: serverKrewe };
                  }
                  return false;
                },
                kreweDeleted: function () {
                  if (queryType === UserQueryTypes.kreweMissing || queryType === UserQueryTypes.memberMissing) {
                    return true;
                  }
                  return false;
                },
                conflictIndicators: function () {
                  return conflictIndicators;
                }
              },
              backdrop: 'static',
              keyboard: false,
              windowClass: 'frank-conflict-resolve-modal'
            });
          modalInstance.result.then(function (selection) {
            callback(selection);
          });
        };
        /**
				* Store the initial copy of the data retreived from the backend to localstorage.
				*
				* @param event_id <String> - the _id of the event to which this data pertains
				* @param originalKrewes <Object> - the data stored in the backend when changes started
				*/
        var storeOriginalVersionLocally = function (event_id, originalKrewes) {
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
        var retreiveOriginalVersionLocally = function (event_id) {
          var storageKey = originalDataPrefix + event_id;
          if (_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
            return localStorageService.get(storageKey);
          }
          return null;
        };
        /**
				* Remove the original data as retreived from the backend before changes were made.
				*
				* @param event_id <String> - the event for which original Krewe data should be removed.
				*/
        var removeOriginalVersionLocally = function (event_id) {
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
        var originalVersionExistsLocally = function (event_id) {
          var storageKey = originalDataPrefix + event_id;
          return _.intersection(localStorageService.keys(), [storageKey]).length === 1;
        };
        /**
				* Store the current version of data being edited by the user to localstorage.
				*
				* @param event_id <String> - the _id of the event for which kreweData pertains
				* @param kreweData <Object> - the current krewe data for event_id
				*/
        var storeChangesLocally = function (event_id, kreweData) {
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
        var storeCurrentStateLocallyUnsafe = function () {
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
        var removeLocalChanges = function (event_id) {
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
        var retreiveChangesLocally = function (event_id) {
          var storageKey = currentDataPrefix + event_id;
          if (_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
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
        var retreiveLocalPotentialMembers = function (event_id) {
          var storageKey = potentialMembersPrefix + event_id;
          if (_.intersection(localStorageService.keys(), [storageKey]).length !== 0) {
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
        var localChangesExist = function (event_id) {
          var storageKey = currentDataPrefix + event_id;
          return _.intersection(localStorageService.keys(), [storageKey]).length === 1;
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
        var storeDelta = function (event_id, krewe_id, modifiedField, newValue, action) {
          var storageKey = deltaPrefix + event_id;
          var eventDeltas = retreiveDeltas(event_id);
          var originalKrewes = retreiveOriginalVersionLocally(event_id);
          var originalData = null;
          var delta = {};
          // Find the original value only if the field is name or kaptain and the original data for this Krewe isn't already saved in a delta record.
          if (modifiedField !== 'members' && (!eventDeltas || !eventDeltas[krewe_id] || !eventDeltas[krewe_id][modifiedField])) {
            for (var originalKreweIndex = originalKrewes.length - 1; originalKreweIndex >= 0; originalKreweIndex--) {
              if (originalKrewes[originalKreweIndex]._id === krewe_id) {
                if (modifiedField === 'name') {
                  originalData = originalKrewes[originalKreweIndex].name;
                } else {
                  if (originalKrewes[originalKreweIndex].kaptain.length) {
                    originalData = originalKrewes[originalKreweIndex].kaptain[0]._id;
                  } else {
                    originalData = null;
                  }
                }
                break;
              }
            }
          } else if (modifiedField !== 'members') {
            originalData = eventDeltas[krewe_id][modifiedField].original;
          }
          // If the new value matches the original value, simply delete the delta and return.
          if (originalData === newValue && (modifiedField === 'name' || modifiedField === 'kaptain')) {
            removeDelta(event_id, krewe_id, modifiedField);
            return;
          }
          if (modifiedField === 'name' || modifiedField === 'kaptain') {
            delta = {
              original: originalData,
              current: newValue
            };
          } else if (modifiedField === 'members') {
            delta = { action: action };
          } else {
            return;
          }
          if (eventDeltas) {
            // Some deltas already exist for this event.
            if (eventDeltas[krewe_id]) {
              // Some deltas exist for this Krewe.
              var krewe = eventDeltas[krewe_id];
              if (modifiedField === 'name' || modifiedField === 'kaptain') {
                // Simply replace the old value, if applicable.
                krewe[modifiedField] = delta;
              } else {
                // Determine if information for members exist.  If so and this action is the opposite of the previous action, remove entry for the member's delta record; otherwise do nothing.
                if (krewe[modifiedField] && krewe[modifiedField][newValue]) {
                  if (krewe[modifiedField][newValue].action !== action) {
                    delete krewe[modifiedField][newValue];
                    // If this field no longer has any deltas, delete it.
                    console.log(krewe[modifiedField]);
                    if (!krewe[modifiedField] || !Object.keys(krewe[modifiedField]).length) {
                      delete eventDeltas[krewe_id][modifiedField];
                      // If this Krewe no longer has any deltas, delete it.
                      if (!krewe || !Object.keys(krewe).length) {
                        delete eventDeltas[krewe_id];
                        // If this event no longer has deltas, delete it and return it.
                        if (!eventDeltas || !Object.keys(eventDeltas).length) {
                          localStorageService.remove(storageKey);
                          return;
                        }
                      }
                    }
                  }
                } else {
                  if (!krewe[modifiedField]) {
                    krewe[modifiedField] = {};
                  }
                  krewe[modifiedField][newValue] = delta;
                }
              }
            } else {
              // No deltas exist for this Krewe, add this one.
              eventDeltas[krewe_id] = {};
              if (modifiedField !== 'members') {
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
            if (modifiedField !== 'members') {
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
        var retreiveDeltas = function (event_id) {
          var storageKey = deltaPrefix + event_id;
          if (_.intersection(localStorageService.keys(), [storageKey]).length === 1) {
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
        var removeDelta = function (event_id, krewe_id, modifiedField) {
          var storageKey = deltaPrefix + event_id;
          var eventDeltas = retreiveDeltas(event_id);
          if (eventDeltas) {
            if (eventDeltas[krewe_id]) {
              // An entry for this Krewe exists, remove the necessary data.
              delete eventDeltas[krewe_id][modifiedField];
              // Check if any other deltas exist for this Krewe, if not delete it.
              if (!_.keys(eventDeltas[krewe_id]).length) {
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
        var removeDeltas = function (event_id) {
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
        var deltasExist = function (event_id) {
          var storageKey = deltaPrefix + event_id;
          return _.intersection(localStorageService.keys(), [storageKey]).length === 1;
        };
        /**
				* Returns the next _id that can be used for a new Krewe and increments the ID value stored
				* in local storage.
				*
				* @param event_id <String> - the _id of the event to which the Krewe will be added
				*
				* @return <Int> - the _id that should be used by the new Krewe
				*/
        var getNextId = function (event_id) {
          var storageKey = 'nextId_' + event_id;
          var nextId = 0;
          if (_.intersection(localStorageService.keys(), [storageKey]).length === 1) {
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
        var resetNextId = function (event_id) {
          var storageKey = 'nextId_' + event_id;
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
        var kreweArraysMatch = function (kreweArray1, kreweArray2) {
          if (kreweArray1.length !== kreweArray2.length) {
            return false;
          }
          quickSortKrewes(kreweArray1);
          quickSortKrewes(kreweArray2);
          for (var kreweIndex = kreweArray1.length - 1; kreweIndex >= 0; kreweIndex--) {
            if (!krewesMatch(kreweArray1[kreweIndex], kreweArray2[kreweIndex])) {
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
        var krewesMatch = function (krewe1, krewe2) {
          if (krewe1.name !== krewe2.name) {
            return false;
          }
          if (krewe1.kaptain._id !== krewe2.kaptain._id) {
            return false;
          }
          if (!membersMatch(krewe1.members, krewe2.members)) {
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
        var membersMatch = function (memberArray1, memberArray2) {
          if (memberArray1.length !== memberArray2.length) {
            return false;
          }
          quickSortMembers(memberArray1);
          quickSortMembers(memberArray2);
          for (var memberIndex = memberArray1.length - 1; memberIndex >= 0; memberIndex--) {
            if (memberArray1[memberIndex]._id !== memberArray2[memberIndex]._id) {
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
        var quickSortMembers = function (unsortedArray, lowerBounds, upperBounds) {
          lowerBounds = lowerBounds ? lowerBounds : 0;
          upperBounds = upperBounds || upperBounds === 0 ? upperBounds : unsortedArray.length - 1;
          if (lowerBounds < upperBounds) {
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
        var partitionMembers = function (unsortedArray, lowerBounds, upperBounds) {
          var random = _.random(lowerBounds, upperBounds);
          var pivot = unsortedArray[random]._id;
          var leftCursor = lowerBounds - 1, rightCursor = upperBounds + 1;
          while (true) {
            while (++leftCursor < upperBounds && unsortedArray[leftCursor]._id < pivot);
            while (--rightCursor >= lowerBounds && unsortedArray[rightCursor]._id > pivot);
            if (leftCursor >= rightCursor) {
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
        var quickSortKrewes = function (unsortedArray, lowerBounds, upperBounds) {
          lowerBounds = lowerBounds ? lowerBounds : 0;
          upperBounds = upperBounds || upperBounds === 0 ? upperBounds : unsortedArray.length - 1;
          if (lowerBounds < upperBounds) {
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
        var partitionKrewes = function (unsortedArray, lowerBounds, upperBounds) {
          var random = _.random(lowerBounds, upperBounds);
          var pivot = unsortedArray[random]._id;
          var leftCursor = lowerBounds - 1, rightCursor = upperBounds + 1;
          while (true) {
            while (++leftCursor < upperBounds && unsortedArray[leftCursor]._id < pivot);
            while (--rightCursor >= lowerBounds && unsortedArray[rightCursor]._id > pivot);
            if (leftCursor >= rightCursor) {
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
        $scope.$watch(function () {
          return eventSelector.postEventId;
        }, function () {
          if (eventSelector.postEventId !== null) {
            if (!localChangesExist(eventSelector.postEventId)) {
              // No local changes exist.  Update the local information.
              async.parallel([
                loadKrewes,
                loadPotentialMembers
              ], function (status, data) {
                if (!status) {
                  $scope.krewes = data[0];
                  $scope.potentialMembers = data[1];
                  storeOriginalVersionLocally(eventSelector.postEventId, $scope.krewes);
                } else {
                  if (status === 400 && data.message === 'Required fields not specified.') {
                  } else if (status === 400 && (data.message === 'An error occurred retreiving krewes.' || data.message === 'An error occurred retreiving users.')) {
                  } else {
                  }
                }
              });
            } else {
              // Local changes have been made.
              $scope.krewes = retreiveChangesLocally(eventSelector.postEventId.toString());
              $scope.potentialMembers = retreiveLocalPotentialMembers(eventSelector.postEventId.toString());
            }
          }
        });
        $scope.$watch('potentialMembers.length', function () {
          var membersSorted = _.every($scope.potentialMembers, function (value, index, collection) {
              return index === 0 || collection[index].lName.localeCompare(collection[index - 1].lName) >= 0;
            });
          if (!membersSorted) {
            $scope.potentialMembers = $filter('orderBy')($scope.potentialMembers, 'lName');
          }
        });
        /*** scope Functions ***/
        $scope.editKreweName = function (kreweIndex) {
          if ($scope.nameLock !== -1) {
            $scope.saveKreweName(kreweIndex);
          }
          $scope.nameLock = kreweIndex;
        };
        $scope.saveKreweName = function (kreweIndex) {
          var event_id = eventSelector.postEventId.toString();
          var krewes = _.extend({}, $scope.krewes);
          $scope.nameLock = -1;
          storeDelta(event_id, krewes[kreweIndex]._id.toString(), 'name', krewes[kreweIndex].name);
          storeChangesLocally(event_id, _.extend({}, $scope.krewes));
        };
        var addToPotentialMembers = function (member) {
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
        $scope.removeKaptain = function (kreweIndex, newKaptain) {
          var oldKaptain = $scope.krewes[kreweIndex].kaptain.splice(0, 1);
          var event_id = eventSelector.postEventId.toString();
          if (oldKaptain.length) {
            storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), 'members', oldKaptain[0]._id.toString(), '-');
            $scope.addNewPotentialMember(oldKaptain[0]);
          }
          if (newKaptain) {
            // Check if there is already a Kaptain for this krewe or not.
            storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), 'kaptain', newKaptain._id.toString());
            storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), 'members', newKaptain._id.toString(), '+');
          } else {
            storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), 'kaptain', null);
          }
          storeChangesLocally(event_id, _.extend({}, $scope.krewes));
          if (newKaptain) {
            return newKaptain;
          }
        };
        /**
				* Add a delta for a new member.
				*/
        $scope.addMember = function (kreweIndex, newMember) {
          var event_id = eventSelector.postEventId.toString();
          storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), 'members', newMember._id.toString(), '+');
          return newMember;
        };
        /**
				* Remove the memberIndexth member from this krewe.
				*
				* @param kreweIndex <int> - the index of the krewe from which this member should be removed
				* @param memberIndex <int> - the index of the member within the krewe that should be removed
				*/
        $scope.removeMember = function (kreweIndex, memberIndex) {
          var event_id = eventSelector.postEventId.toString();
          storeDelta(event_id, $scope.krewes[kreweIndex]._id.toString(), 'members', $scope.krewes[kreweIndex].members[memberIndex]._id.toString(), '-');
          var newPotentialMember = $scope.krewes[kreweIndex].members.splice(memberIndex, 1)[0];
          $scope.addNewPotentialMember(newPotentialMember);
          storeChangesLocally(event_id, _.extend({}, $scope.krewes));
        };
        /**
				* Create a new, empty Krewe.
				*/
        $scope.addNewKrewe = function () {
          var newKrewe = {
              _id: getNextId(eventSelector.postEventId.toString()),
              name: '',
              kaptain: [],
              members: []
            };
          $scope.krewes.push(newKrewe);
        };
        /**
				* Add a member to the potential members.
				*/
        $scope.addNewPotentialMember = function (newPotentialMember) {
          var index = $scope.newPotentialMembers.length - 1;
          for (; index >= 0; index--) {
            if ($scope.newPotentialMembers[index] === newPotentialMember._id) {
              break;
            }
          }
          if (index < 0) {
            $scope.newPotentialMembers.push(newPotentialMember._id);
          }
        };
        /**
				* Converts the array of krewes used by DnD to the format expected by the backend.
				*
				* @param krewes <[Object]> - array of krewes used by the DnD plugin
				*/
        var unmangleKrewes = function (krewes, event_id) {
          // Determine the last temporary id used.
          var tempIdMax = getNextId(event_id);
          for (var kreweIndex = krewes.length - 1; kreweIndex >= 0; kreweIndex--) {
            if (krewes[kreweIndex]._id < tempIdMax && krewes[kreweIndex].name === '' && !krewes[kreweIndex].members.length && !krewes[kreweIndex].kaptain.length) {
              krewes.splice(kreweIndex, 1);
              continue;
            }
            var memberUserObjects = [];
            _.assign(memberUserObjects, krewes[kreweIndex].members);
            krewes[kreweIndex].members = [];
            krewes[kreweIndex].kaptain_id = krewes[kreweIndex].kaptain.length ? krewes[kreweIndex].kaptain[0]._id : null;
            delete krewes[kreweIndex].kaptain;
            for (var memberIndex = memberUserObjects.length - 1; memberIndex >= 0; memberIndex--) {
              krewes[kreweIndex].members.push({ member_id: memberUserObjects[memberIndex]._id });
            }
            if (krewes[kreweIndex]._id === +krewes[kreweIndex]._id && krewes[kreweIndex]._id < tempIdMax) {
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
        var resetLocalStorage = function (event_id) {
          removeLocalChanges(event_id);
          removeOriginalVersionLocally(event_id);
          removeDeltas(event_id);
          resetNextId(event_id);
        };
        /**
				* Save all changes to the backend to be processed and refresh localstorage's
				* copy of backend data.  After all changes have been saved, clear the
				* localstorage current krewe data for this event since the local version now
				* matches the backend.
				*/
        $scope.saveChanges = function () {
          var event_id = eventSelector.postEventId.toString();
          var refresh = false;
          // Whether the page should be refreshed after the modal has exited.
          $scope.modalData = {};
          $scope.modalData.statusMessage = 'Searching for conflicts...';
          // Current status to display to user.
          $scope.modalData.loading = true;
          // Whether the system is still trying to save.
          $scope.modalData.errorSaving = false;
          // Whether an error occurred saving the local changes.
          var modalInstance = $modal.open({
              templateUrl: 'modules/krewes/views/krewe-save.client.view.html',
              controller: 'SaveModalCtrl',
              resolve: {
                data: function () {
                  return $scope.modalData;
                }
              },
              backdrop: 'static',
              keyboard: false
            });
          modalInstance.result.then(function () {
            if (refresh) {
              $window.location.reload();
            }
          });
          if (deltasExist(event_id)) {
            // Check to see if the data can be saved and save to the database if so.
            var localVersion = [];
            _.assign(localVersion, $scope.krewes);
            var cacheObj = retreiveOriginalVersionLocally(event_id);
            var originalVersion = Object.keys(cacheObj).map(function (value) {
                return cacheObj[value];
              });
            var deltas = retreiveDeltas(event_id);
            // Check the original version against the one in the db.  If they match, local changes will overwrite the backend's version.
            loadKrewes(true, function (status, data) {
              if (!status) {
                var serverVersion = data;
                if (kreweArraysMatch(originalVersion, serverVersion)) {
                  $scope.modalData.statusMessage = 'No conflicts exist.  Saving to server...';
                  // Convert the kaptain and members fields back to the proper format.
                  unmangleKrewes(localVersion, event_id);
                  // Find all deltas that remove a member and add the member to add that member to the potentialMembers.  If somebody is found that was added to another group, this will be taken care of automatically with /save/krewes.
                  for (var deltaIndex = deltas.length - 1; deltaIndex >= 0; deltaIndex--) {
                    var delta = deltas[deltaIndex];
                    var memberKeys = _.keys(delta.members);
                    for (var memberIndex = memberKeys.length - 1; memberIndex >= 0; memberIndex--) {
                      if (delta.members[memberKeys[memberIndex]].action === '-') {
                        $scope.newPotentialMembers.push(memberKeys[memberIndex]);
                      }
                    }
                  }
                  // Update potential members.
                  $http.post('/remove/krewe_members', {
                    event_id: event_id,
                    users: $scope.newPotentialMembers
                  }).success(function (resMess) {
                    // Save local changes to the server.
                    $http.post('/save/krewes', {
                      event_id: event_id,
                      krewes: localVersion
                    }).success(function (resMess) {
                      // Remove localstorage and load current version from the backend.
                      resetLocalStorage(event_id);
                      async.parallel([
                        loadKrewes,
                        loadPotentialMembers
                      ], function (status, data) {
                        if (!status) {
                          $scope.krewes = data[0];
                          $scope.potentialMembers = data[1];
                          storeOriginalVersionLocally(event_id, $scope.krewes);
                          // Stop loading icon and give the user positive feedback.
                          $scope.modalData.statusMessage = 'Local changes saved!';
                          $scope.modalData.loading = false;
                        } else {
                          // An error occurred refreshing data.  Alert the user and refresh the page.
                          $scope.modalData.statusMessage = 'Local changes saved!  This page will self-refresh in 5 seconds.';
                          $scope.modalData.loading = false;
                          refresh = true;
                        }
                      });
                    }).error(function (errData, status) {
                      if (status === 400 && errData.message !== 'Some Krewes could not be updated.') {
                        // Data is missing or formatted improperly.  Alert the user to results.
                        $scope.modalData.statusMessage = 'Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                        $scope.modalData.loading = false;
                        $scope.modalData.errorSaving = true;
                      } else if (status === 400) {
                        // Some Krewes could not be saved.  Alert the user.
                        $scope.modalData.statusMessage = 'Some local changes could not be saved.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                        $scope.modalData.loading = false;
                        $scope.modalData.errorSaving = true;
                      } else {
                        // Unkown error.  Most likely 500.  Alert the user.
                        $scope.modalData.statusMessage = 'Could not connect to server.  Please try again later.';
                        $scope.modalData.loading = false;
                        $scope.modalData.errorSaving = true;
                      }
                    });
                  }).error(function (errData, status) {
                    if (status === 400 && errData.message === 'Required fields not specified.') {
                      // Data is missing or formatted improperly.  Alert the user to results.
                      $scope.modalData.statusMessage = 'Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                      $scope.modalData.loading = false;
                      $scope.modalData.errorSaving = true;
                    } else if (status === 400) {
                      // Some memberships could not be revoked.  Alert the user.
                      $scope.modalData.statusMessage = 'Some members were not updated.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                      $scope.modalData.loading = false;
                      $scope.modalData.errorSaving = true;
                    } else {
                      // Unkown error.  Most likely 500.  Alert the user.
                      $scope.modalData.statusMessage = 'Could not connect to the server.  Please try again later.';
                      $scope.modalData.loading = false;
                      $scope.modalData.errorSaving = true;
                    }
                  });
                } else {
                  $scope.modalData.statusMessage = 'Conflicts found.  Attempting to resolve them, this may take some time.  Please do not close out of the browser.';
                  // Conflicts exist that need to be resolved.  Display a message alerting the user.
                  resolveConflicts(deltas, localVersion, originalVersion, serverVersion, function () {
                    $scope.modalData.statusMessage = 'Conflicts resolved.  Saving to server...';
                    // Convert the kaptain and members fields back to the proper format.
                    unmangleKrewes(localVersion, event_id);
                    // newPotentialMembers was set by resolveConflicts.  Save them.
                    $http.post('/remove/krewe_members', {
                      event_id: event_id,
                      users: $scope.newPotentialMembers
                    }).success(function (resMess) {
                      // Save local changes to the server.
                      $http.post('/save/krewes', {
                        event_id: event_id,
                        krewes: localVersion
                      }).success(function (resMess) {
                        // Remove localstorage and load current version from the backend.
                        resetLocalStorage(event_id);
                        async.parallel([
                          loadKrewes,
                          loadPotentialMembers
                        ], function (status, data) {
                          if (!status) {
                            $scope.krewes = data[0];
                            $scope.potentialMembers = data[1];
                            storeOriginalVersionLocally(event_id, $scope.krewes);
                            // Stop loading icon and give the user positive feedback.
                            $scope.modalData.statusMessage = 'Local changes saved!';
                            $scope.modalData.loading = false;
                          } else {
                            // An error occurred refreshing data.  Alert the user and refresh the page.
                            $scope.modalData.statusMessage = 'Local changes saved!  This page will self-refresh in 5 seconds.';
                            $scope.modalData.loading = false;
                            refresh = true;
                          }
                        });
                      }).error(function (errData, status) {
                        if (status === 400 && errData.message !== 'Some Krewes could not be updated.') {
                          // Data is missing or formatted improperly.  Alert the user to results.
                          $scope.modalData.statusMessage = 'Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                          $scope.modalData.loading = false;
                          $scope.modalData.errorSaving = true;
                        } else if (status === 400) {
                          // Some Krewes could not be saved.  Alert the user.
                          $scope.modalData.statusMessage = 'Some local changes could not be saved.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                          $scope.modalData.loading = false;
                          $scope.modalData.errorSaving = true;
                        } else {
                          // Unkown error.  Most likely 500.  Alert the user.
                          $scope.modalData.statusMessage = 'Could not connect to server.  Please try again later.';
                          $scope.modalData.loading = false;
                          $scope.modalData.errorSaving = true;
                        }
                      });
                    }).error(function (errData, status) {
                      if (status === 400 && errData.message === 'Required fields not specified.') {
                        // Data is missing or formatted improperly.  Alert the user to results.
                        $scope.modalData.statusMessage = 'Could not save local changes as some data may be corrupt.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                        $scope.modalData.loading = false;
                        $scope.modalData.errorSaving = true;
                      } else if (status === 400) {
                        // Some memberships could not be revoked.  Alert the user.
                        $scope.modalData.statusMessage = 'Some members were not updated.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                        $scope.modalData.loading = false;
                        $scope.modalData.errorSaving = true;
                      } else {
                        // Unkown error.  Most likely 500.  Alert the user.
                        $scope.modalData.statusMessage = 'Could not connect to the server.  Please try again later.';
                        $scope.modalData.loading = false;
                        $scope.modalData.errorSaving = true;
                      }
                    });
                  });
                }
              } else {
                // An error occurred.  Stop loading icon and warn the user and let them know they can save it later.
                if (status === 400 && data.message === 'Required fields not specified.') {
                  // Data was not passed to backend.  Most likely the user does not have an event selected.
                  $scope.modalData.statusMessage = 'Error contacting server.  Make sure an event is selected in the top right-hand corner of the screen.';
                  $scope.modalData.loading = false;
                  $scope.modalData.errorSaving = true;
                } else if (status === 400 && (data.message === 'An error occurred retreiving krewes.' || data.message === 'An error occurred retreiving users.')) {
                  // Some error occurred.  Warn the user and give them the option to report the problem.
                  $scope.modalData.statusMessage = 'An error occurred retreiving krewes.  Please contact frank to resolve the problem (you can do so by clicking the "Report a Problem" link on the drop-down under your name).';
                  $scope.modalData.loading = false;
                  $scope.modalData.errorSaving = true;
                } else {
                  // Unknown error (probably 500).  Warn user.
                  $scope.modalData.statusMessage = 'Could not connect to server.  Please try again later.';
                  $scope.modalData.loading = false;
                  $scope.modalData.errorSaving = true;
                }
              }
            });
          } else {
            // No need to save changes.  Stop loading icon and give user positive feedback.
            $scope.modalData.statusMessage = 'Local changes saved!';
            $scope.modalData.loading = false;
          }
        };
        /**
				* Remove potentialMemberIndexth user from the potential members.
				*
				* @param potentialMemberIndex <int> the index of the member to remove within the potentialMembers array
				*/
        $scope.removePotentialMember = function (potentialMemberIndex) {
          $scope.potentialMembers.splice(potentialMemberIndex, 1);
          storeChangesLocally(eventSelector.postEventId, $scope.krewes);
        };
      }
    }
  }
]);'use strict';
angular.module('krewes').directive('fillerDiv', [
  '$window',
  function ($window) {
    var fillerDivDefinition = {
        restrict: 'EA',
        transclude: true,
        template: '<div class="fullSizeDiv" ng-transclude></div>',
        scope: {
          marginTop: '=?',
          marginBottom: '=?',
          paddingTop: '=?',
          paddingBottom: '=?'
        },
        link: function ($scope, elm, attrs, ctrl) {
          elm.css('overflow-y', 'auto');
          $scope.$watch(function () {
            return attrs;
          }, function () {
            setAttributes(elm, attrs);
            resizeSelf($scope, elm, attrs, ctrl);
          });
          angular.element($window).on('resize', function () {
            resizeSelf($scope, elm, attrs, ctrl);
          });
          var resizeSelf = function (scope, elm, attrs, ctrl) {
            var jumbotron = angular.element('div.jumbotron.text-center');
            var jumbotronOffset = jumbotron.offset();
            var jumbotronOuterHeight = parseInt(jumbotron.outerHeight(true), 10);
            var footer = angular.element('footer div.musicdiv.well');
            var footerOffset = footer.offset();
            var margin = {};
            var padding = {};
            if (attrs.marginTop) {
              margin.top = parseInt(attrs.marginTop, 10);
            } else {
              margin.top = 0;
            }
            if (attrs.marginBottom) {
              margin.bottom = parseInt(attrs.marginBottom, 10);
            } else {
              margin.bottom = 0;
            }
            if (attrs.paddingTop) {
              padding.top = parseInt(attrs.paddingTop);
            } else {
              padding.top = 0;
            }
            if (attrs.paddingBottom) {
              padding.bottom = parseInt(attrs.paddingBottom);
            } else {
              padding.bottom = 0;
            }
            var footerTop = footerOffset.top - margin.bottom - padding.bottom;
            var jumbotronBottom = jumbotronOffset.top + jumbotronOuterHeight + margin.top + padding.top;
            var height = footerTop - jumbotronBottom;
            elm.css('height', height);
          };
          var setAttributes = function (elm, attrs) {
            var cssProperties = {};
            if (attrs.marginTop) {
              cssProperties.marginTop = parseInt(attrs.marginTop, 10) + 'px';
            }
            if (attrs.marginBottom) {
              cssProperties.marginBottom = parseInt(attrs.marginBottom, 10) + 'px';
            }
            if (attrs.paddingTop) {
              cssProperties.paddingTop = parseInt(attrs.paddingTop, 10) + 'px';
            }
            if (attrs.paddingBottom) {
              cssProperties.paddingBottom = parseInt(attrs.paddingBottom, 10) + 'px';
            }
            elm.css(cssProperties);
          };
          setAttributes(elm, attrs);
        }
      };
    return fillerDivDefinition;
  }
]);'use strict';
angular.module('krewes').directive('kreweList', [
  '$window',
  '$timeout',
  'frankInterests',
  function ($window, $timeout, frankInterests) {
    var kreweListDefinition = {
        restrict: 'EA',
        templateUrl: 'modules/krewes/views/krewe-list.client.view.html',
        scope: {
          parentIndex: '=index',
          krewe: '=',
          dndDropFunc: '&',
          dndInsertedFunc: '&',
          dndEffectAllowedArg: '=',
          dndMovedFunc: '&'
        },
        priority: 1,
        link: function ($scope, elm, attrs, ctrl) {
          $scope.interestsSource = frankInterests.interests;
          elm.css('overflow-y', 'auto');
          $scope.$watch('krewe', function () {
            console.log('Resizing...');
            resizeSelf(elm);
          }, true);
          var resized = false;
          var resizeSelf = function (elm) {
            $timeout(function (elm) {
              var kreweContainerSelector = '.krewe-container:nth-of-type(' + (parseInt($scope.parentIndex, 10) + 1) + ')';
              var containerHeight = angular.element(kreweContainerSelector).innerHeight();
              var nameHeight = angular.element(kreweContainerSelector + ' h3.krewe-name').outerHeight(true);
              var kaptainHeight = angular.element(kreweContainerSelector + ' ul.krewe-kaptain').outerHeight(true);
              console.log(containerHeight, nameHeight, kaptainHeight);
              var height = containerHeight - nameHeight - kaptainHeight + 'px';
              angular.element(kreweContainerSelector + ' ul.krewe-list').css('height', height);
              angular.element(kreweContainerSelector + ' ul.krewe-list > .krewe-member-placeholder').css('height', height);
              angular.element(kreweContainerSelector + ' ul.krewe-list > .krewe-member-placeholder').css('line-height', height);
              // Make sure the element was resized.
              if (!resized) {
                $timeout(function (elm) {
                  resizeSelf(elm);
                }, 50);
                resized = true;
              } else {
                resized = false;
              }
            }, 10);
          };
          resizeSelf(elm);
        }
      };
    return kreweListDefinition;
  }
]);'use strict';
angular.module('leaderboard').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Home state routing
    $stateProvider.state('leaderboard', {
      url: '/leaderboard',
      templateUrl: 'modules/leaderboard/views/leaderboard.client.view.html'
    });
  }
]);'use strict';
angular.module('leaderboard').controller('commentsCtrl', [
  '$scope',
  'Authentication',
  '$timeout',
  '$location',
  'eventSelector',
  '$http',
  '$window',
  '$modal',
  'cacheService',
  '$interval',
  function ($scope, Authentication, $timeout, $location, eventSelector, $http, $window, $modal, cacheService, $interval) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, [
        'admin',
        'recruiter'
      ]).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.authentication = Authentication;
      $scope.editorExpanded = false;
      $scope.removable = function (user_id) {
        if (_.intersection($scope.authentication.user.roles, ['admin']).length === 1)
          return true;
        else {
          if (user_id.toString() === $scope.authentication.user._id.toString())
            return true;
        }
        return false;
      };
      $scope.toHumanReadable = function (time) {
        var date = new Date(parseInt(time));
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      };
      /**
			* Get all the comments from the database for recruiters for
			* this event.
			*/
      $scope.getComments = function () {
        if (eventSelector.postEventId) {
          $http.post('/comments/getRecruiterCommentsForEvent', { event_id: eventSelector.postEventId }).success(function (response) {
            $scope.comments = response;
          }).error(function (response, status) {
            if (status !== 401) {
              $scope.commentErr = 'Error retrieving comments.  Try refreshing the page.';
              if (response.message === 'No comments found!') {
                $scope.commentErr = response.message;
              }
              //Fail silently, since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
              if ($location.path() === '/leaderboard') {
                $timeout(function () {
                  $scope.getComments();
                }, 5000);
              }
            }
          });
        }
      };
      //Get comments when the page is first loaded.
      $timeout($scope.getComments);
      //Watch for changes in the selected event and update the comments accordingly.
      $scope.$watch(function () {
        return eventSelector.selectedEvent;
      }, $scope.getComments);
      //Update comments every 1 minute.
      $interval($scope.getComments(), 60000);
    }
  }
]);'use strict';
angular.module('leaderboard').controller('LeaderboardTablesCtrl', [
  '$scope',
  'Authentication',
  '$http',
  'ngTableParams',
  '$filter',
  '$resource',
  '$location',
  'eventSelector',
  '$timeout',
  function ($scope, Authentication, $http, ngTableParams, $filter, $resource, $location, eventSelector, $timeout) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, [
        'admin',
        'recruiter'
      ]).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.authentication = Authentication;
      $scope.userScore = 0;
      //Recruiter's rank out of all the recruiters for this event.
      $scope.userInvites = 0;
      //Number of people this recruiter invited.
      $scope.userAttendees = 0;
      //Number of people attending that this recruiter invited.
      $scope.statsError = false;
      //Error retreiving stats for this event?
      $scope.inviteeAttendeeRatio = 0.05;
      //The points ratio of invitees to attendees.
      $scope.mainTableFilter = { displayName: '' };
      if (!eventSelector.recruiterEvent) {
        eventSelector.selectedEvent = 'Select Event';
        eventSelector.recruiterEvent = true;
        eventSelector.postEventId = null;
      }
      $scope.returnInt = function (value) {
        return Math.floor(value);
      };
      /* Create an array of specified length.  Used to create an array ngRepeat can iterate over when creating infographics on attendance. */
      $scope.getArr = function (length) {
        return new Array(length);
      };
      var mainApi = $resource('/leaderboard/maintable', { event_id: eventSelector.postEventId }, {
          'getTable': {
            method: 'POST',
            isArray: true
          }
        });
      var attendingApi = $resource('/leaderboard/attendees', { event_id: eventSelector.postEventId }, {
          'getTable': {
            method: 'POST',
            isArray: true
          }
        });
      var invitedApi = $resource('/leaderboard/invitees', { event_id: eventSelector.postEventId }, {
          'getTable': {
            method: 'POST',
            isArray: true
          }
        });
      var getTables = function () {
        $scope.mainTableParams = new ngTableParams({
          page: 1,
          count: 10,
          filter: $scope.mainTableFilter,
          sorting: { place: 'asc' }
        }, {
          total: 0,
          getData: function ($defer, params) {
            mainApi.getTable({ event_id: eventSelector.postEventId }, function (data) {
              var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
              var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : data;
              //Find the number of people invited by the person in first place.
              if (params.orderBy() !== 'place' || params.sorting().place !== 'asc') {
                var maxFilter = $filter('orderBy')(data, 'place');
                $scope.maxValue = maxFilter[0].attending + maxFilter[0].invited * $scope.inviteeAttendeeRatio;
              } else {
                //No need to sort the data again
                $scope.maxValue = orderedData[0].attending + orderedData[0].invited * $scope.inviteeAttendeeRatio;
              }
              params.total(orderedData.length);
              //set total recalculation for paganation
              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            });
          },
          $scope: { $data: {} }
        });
        $scope.attendingTableParams = new ngTableParams({
          page: 1,
          count: 10,
          filter: { attendeeName: '' },
          sorting: { attendeeName: 'asc' }
        }, {
          total: 0,
          getData: function ($defer, params) {
            attendingApi.getTable({ event_id: eventSelector.postEventId }, function (data) {
              var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
              var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : data;
              params.total(orderedData.length);
              //set total recalculation for paganation
              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            });
          },
          $scope: { $data: {} }
        });
        $scope.invitedTableParams = new ngTableParams({
          page: 1,
          count: 10,
          filter: { inviteeName: '' },
          sorting: { inviteeName: 'asc' }
        }, {
          total: 0,
          getData: function ($defer, params) {
            invitedApi.getTable(params.url, { event_id: eventSelector.postEventId }, function (data) {
              var filteredData = params.filter() ? $filter('filter')(data, params.filter()) : data;
              var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : data;
              params.total(orderedData.length);
              //set total recalculation for paganation
              $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            });
          },
          $scope: { $data: {} }
        });
      };
      if (!$scope.hasOwnProperty('params')) {
        $scope.params = new ngTableParams();
        $scope.params.isNullInstance = true;
      }
      $scope.params.settings().$scope = $scope;
      /**
			* Obtain the recruiter's stats: score, number attending, and number invited.
			*/
      $scope.smallRankHeader = false;
      var getStats = function () {
        $http.get('/leaderboard/recruiterinfo', { params: { event_id: eventSelector.postEventId } }).success(function (response) {
          if (response.place) {
            $scope.userScore = response.place;
          } else {
            $scope.userScore = 'N/A';
            $scope.smallRankHeader = true;
          }
          $scope.userInvites = response.invited;
          $scope.userAttendees = response.attending;
          $http.get('/events/stats', { params: { event_id: eventSelector.postEventId } }).success(function (response) {
            $scope.capacity = response.capacity;
            $scope.attending = response.attending;
            $scope.invited = response.invited;
            //Find ratio of above stats to the capacity for the event.  Convert to percent and divide by 2 (make the number easier to display on the screen).
            $scope.percentInvited = Math.round($scope.invited / $scope.capacity * 50);
            $scope.percentAttending = Math.round($scope.attending / $scope.capacity * 50);
            $scope.percentCapacity = 50;
          }).error(function (response, status) {
            $scope.statsError = true;
          });
        }).error(function (response, status) {
          //Fail silently since the interceptor should handle any important cases and notices can be annoying.  Attempt again in 5 seconds.
          if (status !== 401 && $location.path() === '/leaderboard') {
            $timeout(function () {
              getStats();
            }, 5000);
          }
        });
      };
      /**
			* Return the success rate ratio (number attending) / (total number invited and attending).
			*/
      $scope.getRatio = function () {
        if ($scope.userInvites + $scope.userAttendees === 0) {
          return 0;
        } else {
          return ($scope.userAttendees / ($scope.userInvites + $scope.userAttendees) * 100).toFixed(2);
        }
      };
      /**
			* Set or reset the tables.
			*/
      var tablesSet = false;
      //Will be used to determine if the tables have already been set previously.  If they have, simply reload the tables when a change is made.  If not, set them.
      $scope.$watch(function () {
        return eventSelector.selectedEvent;
      }, function () {
        if (eventSelector.postEventId) {
          getStats();
          if (tablesSet) {
            $timeout(function () {
              $scope.mainTableParams.reload();
              $scope.attendingTableParams.reload();
              $scope.invitedTableParams.reload();
            });
          } else {
            getTables();
            tablesSet = true;
          }
        }
      });
    }
  }
]);'use strict';
// :)
angular.module('leaderboard').filter('offset', function () {
  return function (data, start) {
    start = parseInt(start, 10);
    return data.slice(start);
  };
});'use strict';
angular.module('memoboard').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('franklounge', {
      url: '/franklounge',
      templateUrl: 'modules/memoboard/views/memoboard.client.view.html'
    });
  }
]);'use strict';
angular.module('memoboard').controller('memoboardCtrl', [
  '$scope',
  'Authentication',
  'eventSelector',
  '$http',
  '$timeout',
  '$window',
  '$interval',
  '$location',
  function ($scope, Authentication, eventSelector, $http, $timeout, $window, $interval, $location) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, [
        'admin',
        'recruiter',
        'attendee'
      ]).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.authentication = Authentication;
      $scope.editorExpanded = true;
      $scope.removable = function (user_id) {
        if (_.intersection($scope.authentication.user.roles, ['admin']).length === 1)
          return true;
        else {
          if (user_id.toString() === $scope.authentication.user._id.toString())
            return true;
        }
        return false;
      };
      $scope.toHumanReadable = function (time) {
        var date = new Date(parseInt(time));
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      };
      $scope.getComments = function (eventChanged) {
        if (eventSelector.postEventId) {
          $http.post('/comments/getSocialCommentsForEvent', { event_id: eventSelector.postEventId }).success(function (response) {
            $scope.comments = response;
            $scope.commentsErr = '';
          }).error(function (response, status) {
            if (typeof $scope.comments === 'string' || eventChanged) {
              $scope.comments = false;
            }
            $scope.commentsErr = response.message;
          });
        }
      };
      //Get comments when the page is first loaded.
      $timeout($scope.getComments);
      //Watch for changes in the selected event and update the comments accordingly.
      $scope.$watch(function () {
        return eventSelector.selectedEvent;
      }, function () {
        $scope.getComments(true);
      });
      //Update comments every 1 minute.
      $interval($scope.getComments(false), 60000);
      $scope.interests = {
        'Arts': 'img/interests/arts.png',
        'Child Development': 'img/interests/child_development.png',
        'Conservation': 'img/interests/conservation.png',
        'Corporate Social Responsibility': 'img/interests/corporate_social_responsibility.png',
        'Corrections': 'img/interests/corrections.png',
        'Culture': 'img/interests/culture.png',
        'Education': 'img/interests/education.png',
        'Entertainment': 'img/interests/entertainment.png',
        'Environment': 'img/interests/environment.png',
        'Food & Health': 'img/interests/food_&_health.png',
        'frank': 'img/interests/frank.png',
        'Gender Equality': 'img/interests/gender_equality.png',
        'Health': 'img/interests/health.png',
        'Human Rights': 'img/interests/human_rights.png',
        'Income Disparity': 'img/interests/income_disparity.png',
        'Inspiration': 'img/interests/inspiration.png',
        'International Development': 'img/interests/international_development.png',
        'Media': 'img/interests/media.png',
        'Mental Health': 'img/interests/mental_health.png',
        'Music': 'img/interests/music.png',
        'Politics': 'img/interests/politics.png',
        'Poverty': 'img/interests/poverty.png',
        'Religion': 'img/interests/religion.png',
        'Science': 'img/interests/science.png',
        'Social Media': 'img/interests/social_media.png',
        'Solutions Journalism': 'img/interests/solutions_journalism.png',
        'Special Needs': 'img/interests/special_needs.png',
        'Technology': 'img/interests/technology.png',
        'Tobacco': 'img/interests/tobacco.png',
        'Travel': 'img/interests/travel.png',
        'Violence Prevention': 'img/interests/violence_prevention.png',
        'Water': 'img/interests/water.png'
      };
      $scope.interestsSelector = [];
      angular.forEach($scope.interests, function (value, key) {
        $scope.interestsSelector.push({
          icon: '<img src=\'' + value + '\' />',
          name: key,
          ticked: false
        });
      });
      $scope.selectedInterests = [];
    }
  }
]);angular.module('problems').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('problems', {
      url: '/problems',
      templateUrl: 'modules/problems/views/problems.client.view.html'
    });
  }
]);'use strict';
angular.module('problems').controller('ProblemController', [
  '$scope',
  '$http',
  'eventSelector',
  'Authentication',
  '$location',
  function ($scope, $http, eventSelector, Authentication, $location) {
    if (!Authentication.user || _.intersection(Authentication.user.roles, [
        'admin',
        'recruiter',
        'attendee'
      ]).length === 0) {
      if (!Authentication.user) {
        $location.path('/signin');
      } else {
        $location.path('/');
      }
    } else {
      $scope.user = Authentication.user;
      $scope.admin = $scope.user.roles.indexOf('admin') !== -1 ? true : false;
      $scope.recruiter = $scope.admin || ($scope.user.roles.indexOf('recruiter') !== -1 ? true : false);
      $scope.problem = {};
      $scope.problem.contact = 'true';
      $scope.submitProblem = function () {
        var data = {
            subject: 'Problem Reported on frankRS',
            event_id: eventSelector.postEventId
          };
        var permissions = $scope.problem.contact === 'true' ? 'can' : 'cannot';
        $scope.user.email = $scope.user.email.replace(/\n/, '<br />');
        var message = '<p>A problem was reported for the frank recruiter system.  Here are a few details:</p>' + '<br />' + '<br />' + '<b>Browser: </b>' + ($scope.problem.browser !== 'other' ? $scope.problem.browser : $scope.problem.other) + '<br />' + '<b>Version: </b>' + $scope.problem.version + '<br />' + '<b>OS: </b>' + ($scope.problem.os !== 'other' ? $scope.problem.os : $scope.problem.os_other) + '<br />' + '<b>Page: </b>' + $scope.problem.page + '<br />' + '<b>Description: </b>' + $scope.problem.description + '<br />' + '<br />' + '<b>***User Information***</b><br />' + '&nbsp;&nbsp;&nbsp;&nbsp;<b>Name: </b>' + $scope.user.fName + $scope.user.lName + '<br />' + '&nbsp;&nbsp;&nbsp;&nbsp;<b>Email: </b>' + $scope.user.email + '<br />' + '&nbsp;&nbsp;&nbsp;&nbsp;<b>Roles: </b>' + $scope.user.roles + '<br />' + '<br />' + 'You <b>' + permissions + '</b> reply to this message for more information.';
        data.message = angular.toJson(message);
        $http.post('/send/programmer', data).success(function () {
          $scope.error = false;
          $scope.success = true;
          $scope.problem = {};
          $scope.problem.contact = true;
        }).error(function (res, status) {
          $scope.success = true;
          $scope.error = res.message;
        });
      };
    }
  }
]);'use strict';
angular.module('recruiter-form').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('recruiter-form', {
      url: '/recruiter/form',
      templateUrl: 'modules/recruiter-form/views/recruiter-form.client.view.html'
    });
  }
]);'use strict';
angular.module('recruiter-form').controller('NewRecruiterCtrl', [
  '$scope',
  '$http',
  '$timeout',
  '$window',
  'vcRecaptchaService',
  'Authentication',
  '$location',
  function ($scope, $http, $timeout, $window, vcRecaptchaService, Authentication, $location) {
    //If the person accessing the page has an account, they should request to be a recruiter on the events page so redirect them.
    if (Authentication.user) {
      $location.path('/events');
    }
    $scope.recruiter = {};
    $scope.success = false;
    $scope.error = false;
    $scope.submit = function () {
      if (vcRecaptchaService.getResponse() === '') {
        //The user has not resolved the reCAPTCHA.
        $scope.error = 'reCAPTCHA not resolved.';
      } else {
        $scope.recruiter['g-recaptcha-response'] = vcRecaptchaService.getResponse();
        $scope.recruiter.note = 'PLEASE DO NOT DELETE OR EDIT THIS SECTION:\n**********\n***Reason:\n' + $scope.recruiter.reason + '\n\n***Connections:\n' + $scope.recruiter.connections + '\n\n***Recruiter Skills:\n' + $scope.recruiter.skills + '\n***************';
        $scope.recruiter.event_id = $location.search().eid;
        $http.post('/candidate/new/no_user', $scope.recruiter).success(function (res) {
          $scope.success = true;
        }).error(function (res, status) {
          if (status === 400) {
            if (res.message) {
              $scope.error = res.message;
            } else {
              $scope.error = 'No robots allowed!';
            }
          } else if (status === 500) {
            $scope.error = 'There was an error with our servers.  Please try again later.  If this error persists, please notify us and include a screenshot of this page.';
          }
        });
      }
    };
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      '$window',
      function ($q, $location, Authentication, $window) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              /**
								* 401 errors are handled specially.  They can mean the user is not logged
								* in or that the user does not have permission to do the action they were
								* trying to do.  Also, the user could try to access something without
								* selecting an event, which will cause a 401, but may not require a
								* redirection.
								*/
              if (rejection.data.message === 'User not logged in.') {
                //Deauthenticate the global user
                Authentication.user = null;
                $window.user = null;
                //Redirect the user to the signin page
                $location.path('/signin');
              } else if (rejection.data.message === 'User does not have permission.') {
                //Redirect the user to the home page
                $location.path('/');
              }
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  'eventSelector',
  '$window',
  'vcRecaptchaService',
  '$timeout',
  function ($scope, $http, $location, Authentication, eventSelector, $window, vcRecaptchaService, $timeout) {
    $scope.authentication = Authentication;
    if ($location.path() === '/create/admin') {
      var numErrors = 0, superhuman = true, slothTimer;
      $timeout(function () {
        superhuman = false;
      }, 30000);
      var startTimeout = function () {
        slothTimer = $timeout(function () {
          $window.location.reload();
        }, 300000);
      };
      startTimeout();
      $scope.signup = function () {
        $timeout.cancel(slothTimer);
        startTimeout();
        if (!$scope.credentials || $scope.credentials.modify) {
          numErrors++;
          return;
        }
        if (vcRecaptchaService.getResponse() === '') {
          //The user has not resolved the reCAPTCHA.
          $scope.error = 'reCAPTCHA not resolved.';
        } else {
          $scope.credentials['g-recaptcha-response'] = vcRecaptchaService.getResponse();
          $http.post('/auth/signup', $scope.credentials).success(function (response) {
            // If successful we assign the response to the global user model
            $scope.authentication.user = response;
            $scope.userForm.$setPristine();
            $scope.userForm = $scope.credentials = {};
            $scope.retype = '';
            vcRecaptchaService.reload();
            numErrors = 0;
          }).error(function (response) {
            /**
						* Why do these horrible things?  No matter what, if you have made enough mistakes to trigger this, you do not have
						* authorized access to create an admin.  If you do, you would have attempted contacting somebody by now.  I do not
						* want a repeat of the problem that occurs on the main site in which attackers make so many requests to the server
						* that the speed of the site comes to a crawl.  For this reason, the frontend will attempt to handle obvious
						* attempts to hack the system: filling in the form too fast, triggering too many errors, or taking too long.  If
						* the first two issues occur more than 3 times, you are probably a robot and I will crash your browser as a
						* protective measure.  If the second issue occurs more than 3 times, the user probably does not have the proper
						* permissions and are therefore attempting to be malicious.  Adding the user's IP address to a block list may not
						* fix the problem altogether as this is easily faked, only unskilled hackers could not change their IP address.
						* When this is the case, the other measures taken will stop them.  This would also require the server, a problem
						* I am trying to avoid.
						*/
            if (++numErrors >= 4) {
              var counter = 0;
              var text = 'jackass';
              while (counter < 2) {
                window.alert('Why are you trying to crash my system?  I think I might crash yours... I hope you aren\'t using Windows/IE.');
                text += 'jackass';
                counter++;
              }
              while (true) {
                text += 'jackass';
                console.log(text);
              }
            }
            $scope.error = response.message;
          });
        }
      };
    }
    if ($location.path() === '/signin') {
      // If user is signed in then redirect back home
      if ($scope.authentication.user)
        $location.path('/');
      $scope.signin = function () {
        $http.post('/auth/signin', $scope.credentials).success(function (response) {
          // If successful we assign the response to the global user model
          $scope.authentication.user = response;
          //Tell eventSelector to get data from db.
          eventSelector.eventSelect();
          // And redirect to the index page
          if (!response.updated || response.updated === response.created) {
            $location.path('/settings/password');
          } else {
            $location.path('/');
          }
        }).error(function (response) {
          $scope.error = response.message;
        });
      };
    }
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    //Keep track of if this is the user's first time using the system.
    $scope.newUser = !$scope.user.updated || $scope.user.updated === $scope.user.created;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        for (var i = 0; i < $scope.user.interests.length; i++) {
          $scope.user.interests[i] = $scope.user.interests[i].name;
        }
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
        //Send user to the settings page if they are accessing the system for the first time
        if ($scope.newUser) {
          $location.path('/settings/profile');
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.interests = {
      'Arts': 'img/interests/arts.png',
      'Child Development': 'img/interests/child_development.png',
      'Conservation': 'img/interests/conservation.png',
      'Corporate Social Responsibility': 'img/interests/corporate_social_responsibility.png',
      'Corrections': 'img/interests/corrections.png',
      'Culture': 'img/interests/culture.png',
      'Education': 'img/interests/education.png',
      'Entertainment': 'img/interests/entertainment.png',
      'Environment': 'img/interests/environment.png',
      'Food & Health': 'img/interests/food_&_health.png',
      'frank': 'img/interests/frank.png',
      'Gender Equality': 'img/interests/gender_equality.png',
      'Health': 'img/interests/health.png',
      'Human Rights': 'img/interests/human_rights.png',
      'Income Disparity': 'img/interests/income_disparity.png',
      'Inspiration': 'img/interests/inspiration.png',
      'International Development': 'img/interests/international_development.png',
      'Media': 'img/interests/media.png',
      'Mental Health': 'img/interests/mental_health.png',
      'Music': 'img/interests/music.png',
      'Politics': 'img/interests/politics.png',
      'Poverty': 'img/interests/poverty.png',
      'Religion': 'img/interests/religion.png',
      'Science': 'img/interests/science.png',
      'Social Media': 'img/interests/social_media.png',
      'Solutions Journalism': 'img/interests/solutions_journalism.png',
      'Special Needs': 'img/interests/special_needs.png',
      'Technology': 'img/interests/technology.png',
      'Tobacco': 'img/interests/tobacco.png',
      'Travel': 'img/interests/travel.png',
      'Violence Prevention': 'img/interests/violence_prevention.png',
      'Water': 'img/interests/water.png'
    };
    $scope.interestsSelector = [];
    angular.forEach($scope.interests, function (value, key) {
      if (_.intersection($scope.user.interests, [key]).length) {
        $scope.interestsSelector.push({
          icon: '<img src=\'' + value + '\' />',
          name: key,
          ticked: true
        });
      } else {
        $scope.interestsSelector.push({
          icon: '<img src=\'' + value + '\' />',
          name: key,
          ticked: false
        });
      }
    });
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);