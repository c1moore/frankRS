angular.module('admin').controller('applicationController', ['$scope',
function($scope) {
    $scope.applications = [
      // testing table
      {
        name: 'Nostra Dom',
      }, {
        name: 'Bob the Builder',
      }, {
        name: 'Clive',
      }
    ];

    $scope.addApplicant = function(index) {

      $scope.applications.splice(index, 1);
    }

    $scope.removeApplicant = function(index) {
      $scope.applications.splice(index, 1);
    }


  }])
