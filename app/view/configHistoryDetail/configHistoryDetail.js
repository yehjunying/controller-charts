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

            function initComparedConfig () {
                return {
                    global: {
                        reservedVlanRange: {},
                        reservedSubnet: []
                    },
                    devices: [],
                    links: [],
                    networks: []
                }
            }

            $scope.configuration = {
                raw: {},
                compared: initComparedConfig()
            };
            
            $scope.cc = $scope.configuration.compared;

            function configHistoryDetailDataResponse(resp) {
                $scope.configuration.raw = {};
                $scope.cc = initComparedConfig();

                if (resp.status === 200) {
                    var getResponseConfig = function (data, id) {
                        var notExistConfig = function () {
                            return {
                                networkCfg: {
                                    globalCfgs: {},
                                    deviceCfgs: [],
                                    linkCfgs: [],
                                    networkCfgs: []
                                }
                            };
                        };

                        if (_.isUndefined(data[id])) {
                            return notExistConfig();
                        } else {
                            return _.cloneDeep(data[id]);
                        }
                    };

                    $scope.configuration.raw.current = getResponseConfig(resp.data, $scope.searchOptions.historyId);
                    $scope.configuration.raw.other = getResponseConfig(resp.data, $scope.searchOptions.other);

                    $scope.configuration.raw.current.networkCfg.deviceCfgs = objectify($scope.configuration.raw.current.networkCfg.deviceCfgs, 'name');
                    $scope.configuration.raw.current.networkCfg.linkCfgs = objectify($scope.configuration.raw.current.networkCfg.linkCfgs, 'id');
                    $scope.configuration.raw.current.networkCfg.networkCfgs = objectify($scope.configuration.raw.current.networkCfg.networkCfgs, 'name');

                    $scope.configuration.raw.other.networkCfg.deviceCfgs = objectify($scope.configuration.raw.other.networkCfg.deviceCfgs, 'name');
                    $scope.configuration.raw.other.networkCfg.linkCfgs = objectify($scope.configuration.raw.other.networkCfg.linkCfgs, 'id');
                    $scope.configuration.raw.other.networkCfg.networkCfgs = objectify($scope.configuration.raw.other.networkCfg.networkCfgs, 'name');

                    //
                    // comparing global config
                    //
                    $scope.cc.global.reservedVlanRange.current = _.clone($scope.configuration.raw.current.networkCfg.globalCfgs.reservedVlanRange);
                    $scope.cc.global.reservedVlanRange.other = _.clone($scope.configuration.raw.other.networkCfg.globalCfgs.reservedVlanRange);

                    angular.forEach($scope.configuration.raw.current.networkCfg.globalCfgs.reservedSubnet, function (subnet) {
                        var xx = {
                            current: subnet
                        }, index;


                        if ((index = _.findIndex($scope.configuration.raw.other.networkCfg.globalCfgs.reservedSubnet, function (o) { return o == subnet; })) !== -1) {
                            xx.other = $scope.configuration.raw.other.networkCfg.globalCfgs.reservedSubnet[index];
                            delete $scope.configuration.raw.other.networkCfg.globalCfgs.reservedSubnet[index];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.global.reservedSubnet);

                    angular.forEach($scope.configuration.raw.other.networkCfg.globalCfgs.reservedSubnet, function (device) {
                        var xx = {
                            other: device
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.global.reservedSubnet);

                    //
                    // comparing devices config
                    //
                    angular.forEach($scope.configuration.raw.current.networkCfg.deviceCfgs, function (device) {
                        var xx = {
                            current: device,
                            other: {}
                        };

                        if ($scope.configuration.raw.other.networkCfg.deviceCfgs[device.name]) {
                            xx.other = $scope.configuration.raw.other.networkCfg.deviceCfgs[device.name];
                            delete $scope.configuration.raw.other.networkCfg.deviceCfgs[device.name];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.devices);

                    angular.forEach($scope.configuration.raw.other.networkCfg.deviceCfgs, function (device) {
                        var xx = {
                            current: {},
                            other: device
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.devices);

                    //
                    // comparing links config
                    //
                    angular.forEach($scope.configuration.raw.current.networkCfg.linkCfgs, function (link) {
                        var xx = {
                            current: link,
                            other: {}
                        };

                        if ($scope.configuration.raw.other.networkCfg.linkCfgs[link.id]) {
                            xx.other = $scope.configuration.raw.other.networkCfg.linkCfgs[link.id];
                            delete $scope.configuration.raw.other.networkCfg.linkCfgs[link.id];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.links);

                    angular.forEach($scope.configuration.raw.other.networkCfg.linkCfgs, function (link) {
                        var xx = {
                            current: {},
                            other: link
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.links);

                    //
                    // comparing networks config
                    //
                    angular.forEach($scope.configuration.raw.current.networkCfg.networkCfgs, function (network) {
                        var xx = {
                            current: network,
                            other: {}
                        };

                        if ($scope.configuration.raw.other.networkCfg.networkCfgs[network.name]) {
                            xx.other = $scope.configuration.raw.other.networkCfg.networkCfgs[network.name];
                            delete $scope.configuration.raw.other.networkCfg.networkCfgs[network.name];
                        }

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.networks);

                    angular.forEach($scope.configuration.raw.other.networkCfg.networkCfgs, function (network) {
                        var xx = {
                            current: {},
                            other: network
                        };

                        Array.prototype.push.call(this, xx);
                    }, $scope.cc.networks);

                    angular.forEach($scope.cc.networks, function (g) {
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
                return;

                var kls;
                kls = $scope.makeClass(1, 2);
                kls = $scope.makeClass(1, undefined);
                kls = $scope.makeClass(undefined, 1);

                kls = $scope.makeClass('1', '2');
                kls = $scope.makeClass('1', undefined);
                kls = $scope.makeClass(undefined, '1');

                kls = $scope.makeClass({hello: 'hi'}, {hello: 'good'});
                kls = $scope.makeClass({hello: 'hi'}, {});
                kls = $scope.makeClass({}, {hello: 'good'});

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

            $scope.restore = function() {
                wss.sendEvent('configRestoreRequest', {id: $scope.searchOptions.historyId});
            };

            function configRestoreResponse(resp) {
                if (resp.status === 200) {
                    wss.sendEvent('configHistoryDataRequest');
                }

                // FIXME: error handle
            }

            $scope.$on('$destroy', function () {
                wss.unbindHandlers(handlers);
            });

            $log.log('OvConfigHistoryDetailCtrl has been created');
        }]);
}());
