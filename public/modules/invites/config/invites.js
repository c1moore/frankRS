angular.module('inviteApp', ['ngAnimate'])
      .controller('inviteController', ['$scope', function($scope) {
        $scope.friends = [{name:'Dom',email:'dom@hotmail.com'},
          {name:'Dan', email:'dan@gmail.com'},
          {name:'Dalton', email:'dalton@gmail.com'},
          {name:'Calvin', email:'calvin@gmail.com'},
          {name:'James', email:'james@gmail.com'},
          {name:'James', email:'james@gmail.com'}];
        $scope.attendingLimit = 5;
        $scope.invites = [{name:'Dom',email:'dom@gmail.com'},
          {name:'Dan', email:'dan@gmail.com'},
          {name:'Dalton', email:'dalton@gmail.com'},
          {name:'Calvin', email:'calvin@gmail.com'},
          {name:'James', email:'james@gmail.com'},
          {name:'James', email:'james@gmail.com'},
          {name:'Dom',email:'dom@gmail.com'},
          {name:'Dan', email:'dan@gmail.com'},
          {name:'Dalton', email:'dalton@gmail.com'},
          {name:'Calvin', email:'calvin@gmail.com'},
          {name:'James', email:'james@gmail.com'},
          {name:'James', email:'james@gmail.com'}];
        $scope.inviteLimit = 5;
        $scope.livepreview = false;
      }]);
