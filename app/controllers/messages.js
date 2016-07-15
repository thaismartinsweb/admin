'use strict';

angular.module('adminThaisMartins')
.controller('MessagesController', ['$scope', '$filter', 'UserService', 'MessageService', 'ChatService', function ($scope, $filter, UserService, MessageService, ChatService) {

    $scope.visibleSearch = false;
    $scope.search = {};

    $scope.users = [];
    $scope.messages = [];
    $scope.current = {};
    $scope.text = '';

    $scope.code = UserService.getCode();

    UserService.getAll()
        .then(function(response) {
            $scope.users = response.data.filter(function(user) {
                return (user._id != $scope.code);
            });
            return MessageService.getAll();
        })
        .then(function(response) {
            angular.forEach($scope.users, function(user) {

                var userMessages = $filter('filter')(response.data, {'to': $scope.code, 'from': user._id});
                var myMessages = $filter('filter')(response.data, {'to': user._id, 'from': $scope.code});
                var allMessages = myMessages.concat(userMessages);

                user.hasMessage = $filter('filter')(allMessages, {'to': $scope.code, 'visualized': false});
                $scope.messages[user._id] = {
                    messages: $filter('orderBy')(allMessages, 'created'),
                    user: user
                };
            });
        });

    $scope.scrollChat = function() {
        setTimeout(function() {
            var box = document.getElementById('talks');
            if(box) $('#talks-box').animate({scrollTop: box.scrollHeight}, 100);
        }, 300);
    };

    $scope.showConversation = function(userId) {

        $scope.current.messages = $scope.messages[userId].messages;
        $scope.current.user = $scope.messages[userId].user;
        $scope.scrollChat();

        var notVisualized =  $filter('filter')($scope.current.messages, {'to': $scope.code, 'visualized': false});
        angular.forEach(notVisualized, function(message) {
            if(!message.visualized) ChatService.emit('visualized', message);
        });

        angular.forEach($scope.users, function(user) {
            if(user._id == userId) user.hasMessage = [];
        });
    };
}]);
