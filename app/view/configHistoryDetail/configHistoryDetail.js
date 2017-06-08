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
                $scope.config = {
                    global: {
                        reservedVlanRange: {},
                        reservedSubnet: []
                    },
                    devices: [],
                    links: [],
                    networks: []
                };

                if (resp.status === 200) {
                    // $scope.currentConfig = _.cloneDeep(resp.data);
                    $scope.currentConfig = _.cloneDeep(resp.data[$scope.searchOptions.historyId]);
                    $scope.otherConfig = _.cloneDeep(resp.data[$scope.searchOptions.other]);

                    $scope.currentConfig.networkCfg.devices = objectify($scope.currentConfig.networkCfg.devices, 'name');
                    $scope.currentConfig.networkCfg.links = objectify($scope.currentConfig.networkCfg.links, 'id');
                    $scope.currentConfig.networkCfg.networks = objectify($scope.currentConfig.networkCfg.networks, 'name');

                    $scope.otherConfig.networkCfg.devices = objectify($scope.otherConfig.networkCfg.devices, 'name');
                    $scope.otherConfig.networkCfg.links = objectify($scope.otherConfig.networkCfg.links, 'id');
                    $scope.otherConfig.networkCfg.networks = objectify($scope.otherConfig.networkCfg.networks, 'name');

                    //
                    // comparing global config
                    //
                    $scope.config.global.reservedVlanRange.current = _.clone($scope.currentConfig.networkCfg.global.reservedVlanRange);
                    $scope.config.global.reservedVlanRange.other = _.clone($scope.otherConfig.networkCfg.global.reservedVlanRange);

                    angular.forEach($scope.currentConfig.networkCfg.global.reservedSubnet, function (subnet) {
                        var xx = {
                            current: subnet
                        }, index;


                        if ((index = _.findIndex($scope.otherConfig.networkCfg.global.reservedSubnet, function (o) { return o == subnet; })) !== -1) {
                            xx.other = $scope.otherConfig.networkCfg.global.reservedSubnet[index];
                            delete $scope.otherConfig.networkCfg.global.reservedSubnet[index];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.global.reservedSubnet);

                    angular.forEach($scope.otherConfig.networkCfg.global.reservedSubnet, function (device) {
                        var xx = {
                            other: device
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.global.reservedSubnet);

                    //
                    // comparing devices config
                    //
                    angular.forEach($scope.currentConfig.networkCfg.devices, function (device) {
                        var xx = {
                            current: device,
                            other: {}
                        };

                        if ($scope.otherConfig.networkCfg.devices[device.name]) {
                            xx.other = $scope.otherConfig.networkCfg.devices[device.name];
                            delete $scope.otherConfig.networkCfg.devices[device.name];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.devices);

                    angular.forEach($scope.otherConfig.networkCfg.devices, function (device) {
                        var xx = {
                            current: {},
                            other: device
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.devices);

                    //
                    // comparing links config
                    //
                    angular.forEach($scope.currentConfig.networkCfg.links, function (link) {
                        var xx = {
                            current: link,
                            other: {}
                        };

                        if ($scope.otherConfig.networkCfg.links[link.id]) {
                            xx.other = $scope.otherConfig.networkCfg.links[link.id];
                            delete $scope.otherConfig.networkCfg.links[link.id];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.links);

                    angular.forEach($scope.otherConfig.networkCfg.links, function (link) {
                        var xx = {
                            current: {},
                            other: link
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.links);

                    //
                    // comparing networks config
                    //
                    angular.forEach($scope.currentConfig.networkCfg.networks, function (network) {
                        var xx = {
                            current: network,
                            other: {}
                        };

                        if ($scope.otherConfig.networkCfg.networks[network.name]) {
                            xx.other = $scope.otherConfig.networkCfg.networks[network.name];
                            delete $scope.otherConfig.networkCfg.networks[network.name];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.networks);

                    angular.forEach($scope.otherConfig.networkCfg.networks, function (network) {
                        var xx = {
                            current: {},
                            other: network
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.config.networks);

                    angular.forEach($scope.config.networks, function (g) {
                        g.members = compare(g.current.members, g.other.members);
                    });

                    console.log('');
                }

                $scope.$digest();
            }

            function compare(array1, array2) {
                var result = [];
                array2 = _.cloneDeep(array2);

                angular.forEach(array1, function (elem) {
                    var xx = {
                        current: elem
                    }, index;


                    if ((index = _.findIndex(array2, function (o) { return o == elem; })) !== -1) {
                        xx.other = array2[index];
                        delete array2[index];
                    }

                    Array.prototype.push.call(this, xx);
                }, result);

                angular.forEach(array2, function (elem) {
                    var xx = {
                        other: elem
                    };

                    Array.prototype.push.call(this, xx);
                }, result);

                return result;
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

            $scope.makeClass = function (val1, val2, transform) {
                var klass = 'equation';
                if (!_.isEqual(val1, val2)) {
                    if (_.isUndefined(val1) || (_.isObject(val1) || _.isArray(val1)) && _.isEmpty(val1)) {
                        klass = 'deletion';
                    } else if (_.isUndefined(val2) || (_.isObject(val2) || _.isArray(val2)) && _.isEmpty(val2)) {
                        klass = 'addition';
                    } else {
                        klass = 'modification';
                    }
                }

                if (!_.isUndefined(transform)) {
                    if (!_.isUndefined(transform[klass])) {
                        klass = transform[klass];
                    }
                }

                return klass;
            };

            (function () {
                var kls;
                // kls = $scope.makeClass(1, 2);
                // kls = $scope.makeClass(1, undefined);
                // kls = $scope.makeClass(undefined, 1);
                //
                // kls = $scope.makeClass('1', '2');
                // kls = $scope.makeClass('1', undefined);
                // kls = $scope.makeClass(undefined, '1');
                //
                // kls = $scope.makeClass({hello: 'hi'}, {hello: 'good'});
                // kls = $scope.makeClass({hello: 'hi'}, {});
                // kls = $scope.makeClass({}, {hello: 'good'});

                kls = $scope.makeClass({hello: 'hi'}, undefined);
                kls = $scope.makeClass(undefined, {hello: 'good'});

                kls = $scope.makeClass(['hi'], ['good']);
                kls = $scope.makeClass(['hi'], []);
                kls = $scope.makeClass([], ['good']);

                kls = $scope.makeClass(['hi'], undefined);
                kls = $scope.makeClass(undefined, ['good']);
            })();

            $scope.setting = $scope.setting || {
                    style: 'dense'
                    // style: 'column'
                };
            $scope.changeStyle = function () {
                if ($scope.setting.style === 'dense') {
                    $scope.setting.style = 'column';
                } else {
                    $scope.setting.style = 'dense';
                }
            };

            $scope.setting.hideUnchangedItems = false;
            $scope.setHideUnchangedItems = function () {
                $scope.setting.hideUnchangedItems = !$scope.setting.hideUnchangedItems;
            };

            $scope.hideUnchangedItems = function (val1, val2) {
                if ($scope.setting.hideUnchangedItems === false) {
                    return false;
                }

                if (_.isUndefined(val2)) {
                    if (_.isArray(val1)) {
                        for (var i = 0; i < val1.length; ++i) {
                            if (!_.isEqual(val1[i].current, val1[i].other)) {
                                return false;
                            }
                        }

                        return true;
                    } else if (_.isObject(val1)) {
                        return _.isEqual(val1.current, val1.other);
                    }
                }

                return _.isEqual(val1, val2);
            };

            $scope.equals = function (o1, o2) {
                return _.isEqual(o1, o2);
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
