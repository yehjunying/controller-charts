(function () {
    'use strict';

    var $window, $log, $scope, $loc, mast, fs, wss, ns;

    // var configHistoryDetailCurrent = {
    //     id: '20170501011000000',
    //     modified: '2017-05-01 01:10:00.000',
    //     modifiedBy: 'mars',
    //     description: 'Device had added; Link had added',
    //     networkCfg: {
    //         global: {
    //             reservedSubnet: [
    //                 "192.168.1.0/24",
    //                 "192.168.2.0/24",
    //                 "192.168.3.0/24",
    //                 "192.168.4.0/24",
    //                 "192.168.5.0/24",
    //                 "192.168.6.0/24",
    //                 "192.168.7.0/24",
    //                 "192.168.8.0/24",
    //                 "192.168.9.0/24",
    //                 "192.168.10.0/24",
    //                 "192.168.11.0/24",
    //                 "192.168.12.0/24",
    //                 "192.168.13.0/24",
    //                 "192.168.14.0/24",
    //                 "192.168.15.0/24",
    //                 "192.168.16.0/24",
    //                 "192.168.17.0/24",
    //                 "192.168.18.0/24",
    //                 "192.168.19.0/24",
    //                 "192.168.20.0/24",
    //                 "192.168.21.0/24",
    //                 "192.168.22.0/24",
    //                 "192.168.23.0/24",
    //                 "192.168.24.0/24",
    //                 "192.168.25.0/24"
    //             ],
    //             reservedVlanRange: {
    //                 begin: 4001,
    //                 end: 4094
    //             }
    //         }
    //     }
    // };

    angular.module('ovConfigHistoryDetail', [])
    .controller('OvConfigHistoryDetailCtrl',
        ['$window', '$log', '$scope', '$location'/*, 'MastService', 'FnService'*/, 'WebSocketService'/*, 'NavService'*/,

        function (_$window_, _$log_, _$scope_, _$location_/*, _mast_, _fs_*/, _wss_/*, _ns_*/) {

            $window = _$window_;
            $log = _$log_;
            $scope = _$scope_;
            $loc = _$location_;
            // mast = _mast_;
            // fs = _fs_;
            wss = _wss_;
            // ns = _ns_;

            $scope.searchOptions = {
                prevPage: '',
                historyId: ''
            };

            $scope.currentConfig = {};
            $scope.compareConfig = {};

            var params = $loc.search();

            var handlers = {
                configHistoryDetailDataResponse: configHistoryDetailDataResponse,
                configRestoreResponse: configRestoreResponse
            };

            wss.bindHandlers(handlers);
            
            if (params.hasOwnProperty('from')) {
                $scope.searchOptions.prevPage = params['from'];
            } else {
                // TODO: hide 'Back' button ?
                console.log('hide Back button');
            }

            if (params.hasOwnProperty('id')) {
                $scope.searchOptions.historyId = params['id'];

                wss.sendEvent('configHistoryDetailDataRequest', { id: $scope.searchOptions.historyId });
            } else {
                // TODO: show error msg ?
                console.log('show error msg');
            }

            $scope.backToPreviousPage = function() {
                ns.navTo($scope.searchOptions.prevPage);
            };

            function configHistoryDetailDataResponse(data) {
                if (data.status === 200) {
                    $scope.currentConfig = _.cloneDeep(data.config);
                }

                $scope.$digest();
            }

            $scope.currentConfig = _.cloneDeep(configHistoryDetailCurrent);

            // TODO: function not work ?
            $scope.friendlyDateString = function (date) {
                return moment(date).calendar(null, {
                    sameDay: '[Today] A hh:mm:ss',
                    lastDay: '[Yesterday] A hh:mm:ss',
                    lastWeek: 'YYYY/MM/DD A hh:mm:ss',
                    sameElse: 'YYYY/MM/DD A hh:mm:ss'
                });
            };

            $scope.restore = function(id) {
                wss.sendEvent('configRestoreRequest', {id: id});
            };

            function configRestoreResponse(data) {
                if (data.status === 200) {
                    wss.sendEvent('configHistoryDataRequest');
                }
            }

            $scope.$on('$destroy', function () {
                console.log('destroy');
            });

            $log.log('OvConfigHistoryDetailCtrl has been created');
        }]);
}());
