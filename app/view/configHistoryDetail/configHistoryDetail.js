(function () {
    'use strict';

    var $window, $log, $scope, $loc/*, mast, fs*/, wss, ns;

    angular.module('ovConfigHistoryDetail', ['angAccordion'])
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
                $scope.searchOptions.other = params['other'];

                wss.sendEvent('configHistoryDetailDataRequest', {
                    id: [$scope.searchOptions.historyId, $scope.searchOptions.other]
                });
            } else {
                // TODO: show error msg ?
                console.log('show error msg');
            }

            $scope.backToPreviousPage = function() {
                ns.navTo($scope.searchOptions.prevPage);
            };

            function objectify(array, key) {
                var obj = {};
                angular.forEach(array, function(elem) {
                    var id = elem[key].toString();
                    obj[id] = _.cloneDeep(elem);
                }, obj);

                return obj;
            }

            function configHistoryDetailDataResponse(resp) {
                if (resp.status === 200) {
                    // $scope.currentConfig = _.cloneDeep(resp.data);
                    $scope.currentConfig = _.cloneDeep(resp.data[$scope.searchOptions.historyId]);
                    $scope.otherConfig = _.cloneDeep(resp.data[$scope.searchOptions.other]);

                    $scope.currentConfig.networkCfg.devices = objectify($scope.currentConfig.networkCfg.devices, 'id');
                    $scope.currentConfig.networkCfg.links = objectify($scope.currentConfig.networkCfg.links, 'id');
                    $scope.currentConfig.networkCfg.networks = objectify($scope.currentConfig.networkCfg.networks, 'name');

                    $scope.otherConfig.networkCfg.devices = objectify($scope.otherConfig.networkCfg.devices, 'id');
                    $scope.otherConfig.networkCfg.links = objectify($scope.otherConfig.networkCfg.links, 'id');
                    $scope.otherConfig.networkCfg.networks = objectify($scope.otherConfig.networkCfg.networks, 'name');

                    $scope.config = {
                        devices: [],
                        links: [],
                        networks: []
                    };

                    angular.forEach($scope.currentConfig.networkCfg.devices, function (device) {
                        var xx = {
                            current: device
                        };

                        if ($scope.otherConfig.networkCfg.devices[device.id]) {
                            xx.other = $scope.otherConfig.networkCfg.devices[device.id];
                            delete $scope.otherConfig.networkCfg.devices[device.id];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.devices);

                    angular.forEach($scope.otherConfig.networkCfg.devices, function (device) {
                        var xx = {
                            other: device
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.devices);

                    ////////

                    angular.forEach($scope.currentConfig.networkCfg.links, function (link) {
                        var xx = {
                            current: link
                        };

                        if ($scope.otherConfig.networkCfg.links[link.id]) {
                            xx.other = $scope.otherConfig.networkCfg.links[link.id];
                            delete $scope.otherConfig.networkCfg.links[link.id];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.links);

                    angular.forEach($scope.otherConfig.networkCfg.links, function (link) {
                        var xx = {
                            other: link
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.links);

                    ////////

                    angular.forEach($scope.currentConfig.networkCfg.networks, function (network) {
                        var xx = {
                            current: network
                        };

                        if ($scope.otherConfig.networkCfg.networks[network.name]) {
                            xx.other = $scope.otherConfig.networkCfg.networks[network.name];
                            delete $scope.otherConfig.networkCfg.networks[network.name];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.networks);

                    angular.forEach($scope.otherConfig.networkCfg.networks, function (network) {
                        var xx = {
                            other: network
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.networks);

                    console.log('');
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
