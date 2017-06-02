(function () {
    'use strict';

    var $window, $log, $scope, $loc, mast, fs, wss, ns;

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

            function configHistoryDetailDataResponse(resp) {
                if (resp.status === 200) {
                    $scope.currentConfig = _.cloneDeep(resp.data);
                }

                $scope.$digest();
            }

            // $scope.currentConfig = _.cloneDeep(configHistoryDetailCurrent);

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

            function configRestoreResponse(resp) {
                if (resp.status === 200) {
                    wss.sendEvent('configHistoryDataRequest');
                }
            }

            $scope.$on('$destroy', function () {
                console.log('destroy');
            });

            $log.log('OvConfigHistoryDetailCtrl has been created');
        }]);
}());
