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
        'vcRecaptcha'
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