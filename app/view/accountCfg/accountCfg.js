(function () {
    'use strict';

    // injected refs
    var $window, $log, $scope, /*mast, fs,*/ wss, ns;

    function accountCfgDataResponse(resp) {
        if (resp.status === 200) {
            $scope.tableData = resp.data;
        } else {
            $scope.summaryErrorMsg = resp.data.message;
        }

        $scope.$digest();
    }

    function accountCfgModifyResponse(resp) {
        if (resp.status === 200) {
            wss.sendEvent('accountCfgDataRequest');
            $scope.showSummary();
        } else {
            $scope.configErrorMsg = resp.data.message;
        }

        $scope.$digest();
    }

    function accountCfgAddResponse(resp) {
        if (resp.status === 200) {
            wss.sendEvent('accountCfgDataRequest');
            $scope.showSummary();
        } else {
            $scope.configErrorMsg = resp.data.message;
        }

        $scope.$digest();
    }

    function accountCfgDeleteResponse(resp) {
        if (resp.status === 200) {
            wss.sendEvent('accountCfgDataRequest');
        } else {
            $scope.summaryErrorMsg = resp.data.message;
        }

        $scope.$digest();
    }

    angular.module('ovAccountCfg', [])
    .controller('OvAccountCfgCtrl',
        ['$window', '$log', '$scope', /*'MastService',*/ /*'FnService',*/ 'WebSocketService', 'NavService',

        function (_$window_, _$log_, _$scope_, /*_mast_,*/ /*_fs_,*/ _wss_, _ns_) {

            $window = _$window_;
            $log = _$log_;
            $scope = _$scope_;
            //mast = _mast_;
            //fs = _fs_;
            wss = _wss_;
            ns = _ns_;

//             $scope.allUsers = [
//                 {
//                     username: "user1",
//                     group: "admingroup",
//                     notes: "notes",
//                     statistics: {
//                         online: true,
//                         loginTime: moment().format('LLLL'),
//                         remoteAddress: '1.2.3.4'
//                     }
//                 },
//                 {
//                     username: "user2",
//                     group: "admingroup",
//                     notes: "notes",
//                     statistics: {
//                         online: false,
//                         loginTime: moment().format('LLLL')
//                     }
//                 },
//                 {
//                     username: "user3",
//                     group: "admingroup",
//                     notes: "notes",
//                     statistics: {
//                         online: true,
//                         loginTime: moment().format('LLLL'),
//                         remoteAddress: '1.2.3.4'
//                     }
//                 }
//             ];
//
//             $scope.allUsers.forEach(function (el) {
//                 el.extraScreen = {};
//             });
//
//             $scope.current = [$scope.allUsers[0]];
//             $scope.others = [$scope.allUsers[1], $scope.allUsers[2]];
//
//             $scope.navigateTo = function (extraScreen, $event) {
//                 $scope.allUsers.forEach(function (el) {
//                     if (el.extraScreen !== extraScreen) {
//                         el.extraScreen.isSelected = false;
//                     }
//                 });
//                 extraScreen.isSelected = !extraScreen.isSelected;
//
// //            $scope.allUsers.forEach(function (el) {
// //                console.log(el.username + " " + el.extraScreen.isSelected);
// //            });
//             }

            $scope.displayPanel = 'summary';
            $scope.tableData = [];
            $scope.summaryErrorMsg = '';
            $scope.configErrorMsg = '';

            var handlers = {
                accountCfgDataResponse:   accountCfgDataResponse,
                accountCfgModifyResponse: accountCfgModifyResponse,
                accountCfgAddResponse:    accountCfgAddResponse,
                accountCfgDeleteResponse: accountCfgDeleteResponse
            };

            wss.bindHandlers(handlers);

            $scope.navToConfigHistory = function () {
                ns.navTo('configHistory', { from: 'accountCfg' });
            };

            wss.sendEvent('accountCfgDataRequest');

            $scope.displayPwd = false;

            $scope.newAccount = function() {
                $scope.configAccount = {
                    username: '',
                    password: ''
                };

                $scope.configErrorMsg = '';
                $scope.displayPanel = 'config';
                $scope.configMode = 'New';
            };

            $scope.chgPwd = function(user) {
                $scope.configAccount = user;
                $scope.configErrorMsg = '';
                $scope.displayPanel = 'config';
                $scope.configMode = 'Change Password';
            };

            $scope.createAccount = function(account) {
                wss.sendEvent('accountCfgAddRequest', account);
            };

            $scope.modifyAccount = function(account) {
                wss.sendEvent('accountCfgModifyRequest', account);
            };

            $scope.deleteAccount = function(account) {
                wss.sendEvent('accountCfgDeleteRequest', {username: account.username});
            };

            $scope.showSummary = function() {
                $scope.summaryErrorMsg = '';
                $scope.displayPanel = 'summary';
            };

            $scope.$on('$destroy', function () {
                wss.unbindHandlers(handlers);
            });

            $log.log('OvAccountCfgCtrl has been created');
        }]);
}());
