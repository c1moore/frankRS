routerApp.controller('eventController', function($scope) {
        /* Preserving the state of the table, doesn't really work yet
        var service = {
            model: {
              name:'',
              start:'',
              end:'',
              location:''
            },
            
            SaveState:function {
              sessionStorage.userService=angular.toJson(service.model);
            }
            
            RestoreState:function() {
              service.model=angular.fromJson(sessionStorage.userService);
            }
          }
          
          $rootScope.$on("savestate", service.SaveState);
          $rootScope.$on("restorestate", service.RestoreState);
          
          return service; */
          
          var ec = this;      
          
          ec.events = [
          
          //These were just some test events to see if table worked
             {
                name: 'Frank',
                start: '05/23/2014',
                end: '05/25/2014',
                location: 'Gainesville'
            },
            {
                name: 'Graduation',
                start: '12/18/2014',
                end: '12/19/2014',
                location: 'Gainesville'
            },
            {
                name: 'Concert',
                start: '06/07/2015',
                end: '06/20/2015',
                location: 'Jacksonville'
            },
            {
                name: 'Football game',
                start: '11/05/2014',
                end: '11/10/2014',
                location: 'Gainesville'
            },
            {
                name: 'Bonaroo',
                start: '06/13/2014',
                end: '07/01/2014',
                location: 'Tennessee'
            },
            {
                name: 'Doms Birthday',
                start: '05/24/2014',
                end: '05/25/2014',
                location: 'Somewhere'
            },
            {
                name: 'New hobbit movie!',
                start: '12/25/2014',
                end: '12/25/2014',
                location: 'New Zealand'
            }]; 
            
          
          
            


          ec.addEvent = function () {

          ec.events.push ({
            name: $scope.name,
            start: $scope.startDate,
            end: $scope.endDate,
            location: $scope.locationid
          });

          // Clear input fields after push
          $scope.eventName = "";
          $scope.startDate = "";
          $scope.endDate = "";
          $scope.locationid = "";
};

          ec.deleteRow = function(index) {
          ec.events.splice(index,1);
          }

            
});


routerApp.controller('applicationController', function($scope) {
  
          var ac = this; 
  
          ac.applications = [
            {
                name: 'Nostra Dom',
            },
            {
                name: 'Bob the Builder',
            },
            {
                name: 'Clive',
            }
          ];
          
          ac.addApplicant = function(index) {
            
          ac.applications.splice(index,1);
          }
          
          ac.removeApplicant = function(index) {
          ac.applications.splice(index,1);
          }
  
});
