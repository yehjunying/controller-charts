(function () {
    'use strict';

    var $log, $scope, $timeout, $interval, $http, wss, client, esFactory;

    var overview_timer = null,
        controller_data_timer = null,
        top_ranks_timer = null;

    var top5TrafficCoreBarChartData,     top5TrafficCoreBarChartOption,
        top5TrafficAccessBarChartData,   top5TrafficAccessBarChartOption,
        top5DropCountCoreBarChartData,   top5DropCountCoreBarChartOption,
        top5DropCountAccessBarChartData, top5DropCountAccessBarChartOption;

    function createControllerCharts() {
        $scope.c = controllerChart({deps: {'angular': angular}})
            .add({
                cpuChartCanvas: document.getElementById("controller-1-cpu-chart").getContext("2d"),
                memoryChartCanvas: document.getElementById("controller-1-memory-chart").getContext("2d"),
                ethernetChartCanvas: document.getElementById("controller-1-ethernet-chart").getContext("2d")
            })
            .add({
                cpuChartCanvas: document.getElementById("controller-2-cpu-chart").getContext("2d"),
                memoryChartCanvas: document.getElementById("controller-2-memory-chart").getContext("2d"),
                ethernetChartCanvas: document.getElementById("controller-2-ethernet-chart").getContext("2d")
            })
            .add({
                cpuChartCanvas: document.getElementById("controller-3-cpu-chart").getContext("2d"),
                memoryChartCanvas: document.getElementById("controller-3-memory-chart").getContext("2d"),
                ethernetChartCanvas: document.getElementById("controller-3-ethernet-chart").getContext("2d")
            });
    }

    function updateTopRanksTrafficCharts(chart, data) {
        data.sort(function(a, b) {
            var aTotal, bTotal;

            aTotal = a.transmitUtilization + a.receiveUtilization;
            bTotal = b.transmitUtilization + b.receiveUtilization;

            return (aTotal - bTotal) * -1;
        });

        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];

        data.forEach(function(d) {
            var deviceName = getDeviceName(d.device);

            chart.data.labels.push(deviceName + ', port' + d.port);
            chart.data.datasets[0].data.push(d.transmitUtilization);
            chart.data.datasets[1].data.push(d.receiveUtilization);
        });

        chart.update();
    }

    function updateTopRanksDropCountCharts(chart, data) {
        data.sort(function(a, b) {
            var aTotal, bTotal;

            aTotal = a.transmitDropCount + a.receiveDropCount;
            bTotal = b.transmitDropCount + b.receiveDropCount;

            return (aTotal - bTotal) * -1;
        });

        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];

        data.forEach(function(d) {
            var deviceName = getDeviceName(d.device);

            chart.data.labels.push(deviceName + ', port' + d.port);
            chart.data.datasets[0].data.push(d.transmitDropCount);
            chart.data.datasets[1].data.push(d.receiveDropCount);
        });

        chart.update();
    }

    function createTopRanksCharts() {
        top5TrafficCoreBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(71, 209, 71, 0.8)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(48, 165, 255, 1)",
                    data: []
                }
            ]
        };

        top5TrafficCoreBarChartOption = {
            type: 'horizontalBar',
            data: top5TrafficCoreBarChartData,
            options: {
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 200
                        }
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        top5TrafficAccessBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(71, 209, 71, 0.8)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(48, 165, 255, 1)",
                    data: []
                }
            ]
        };

        top5TrafficAccessBarChartOption = {
            type: 'horizontalBar',
            data: top5TrafficAccessBarChartData,
            options: {
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        top5DropCountCoreBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(249, 36, 63, 0.7)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(255, 181, 62, 1)",
                    data: []
                }
            ]
        };

        top5DropCountCoreBarChartOption = {
            type: 'horizontalBar',
            data: top5DropCountCoreBarChartData,
            options: {
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 200
                        }
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        top5DropCountAccessBarChartData = {
            labels: [],
            datasets: [
                {
                    type: 'horizontalBar',
                    label: 'Send',
                    backgroundColor: "rgba(249, 36, 63, 0.7)",
                    data: []
                },
                {
                    type: 'horizontalBar',
                    label: 'Receive',
                    backgroundColor: "rgba(255, 181, 62, 1)",
                    data: []
                }
            ]
        };

        top5DropCountAccessBarChartOption = {
            type: 'horizontalBar',
            data: top5DropCountAccessBarChartData,
            options: {
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        stacked: true,
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        for (var i = 0; i < 5; i++) {
            top5TrafficCoreBarChartData.labels.push('');
            top5TrafficCoreBarChartData.datasets[0].data.push(0);
            top5TrafficCoreBarChartData.datasets[1].data.push(0);

            top5TrafficAccessBarChartData.labels.push('');
            top5TrafficAccessBarChartData.datasets[0].data.push(0);
            top5TrafficAccessBarChartData.datasets[1].data.push(0);

            top5DropCountCoreBarChartData.labels.push('');
            top5DropCountCoreBarChartData.datasets[0].data.push(0);
            top5DropCountCoreBarChartData.datasets[1].data.push(0);

            top5DropCountAccessBarChartData.labels.push('');
            top5DropCountAccessBarChartData.datasets[0].data.push(0);
            top5DropCountAccessBarChartData.datasets[1].data.push(0);
        }

        var ctx = document.getElementById("top5-traffic-core").getContext("2d");
        window.top5trafficCoreBarChart = new Chart(ctx, top5TrafficCoreBarChartOption);

        ctx = document.getElementById("top5-traffic-access").getContext("2d");
        window.top5trafficAccessBarChart = new Chart(ctx, top5TrafficAccessBarChartOption);

        ctx = document.getElementById("top5-drop-count-core").getContext("2d");
        window.top5dropCountCoreBarChart = new Chart(ctx, top5DropCountCoreBarChartOption);

        ctx = document.getElementById("top5-drop-count-access").getContext("2d");
        window.top5dropCountAccessBarChart = new Chart(ctx, top5DropCountAccessBarChartOption);
    }

    function dashboardOverviewDataResponse(resp) {
        if (resp.status === 200) {
            $scope.overview = resp.data;

            overview_timer = $timeout(function(){wss.sendEvent('dashboardOverviewDataRequest');}, 5000);
        } else {
            // TODO: show error
            console.log(resp.data);
        }
    }

    function dashboardControllerDataResponse(resp) {
        if (resp.status === 200) {
            $scope.c.update(resp.data);

            controller_data_timer = $timeout(function(){wss.sendEvent('dashboardControllerDataRequest');}, 1000);
        } else {
            // TODO: show error
            console.log(resp.data);
        }
    }

    function dashboardTopRanksDataResponse(resp) {
        if ($scope.isDeviceRespDone === false) {
            var respData = angular.copy(resp);

            top_ranks_timer = $timeout(function(){dashboardTopRanksDataResponse(respData)}, 100);
        }

        if (resp.status === 200) {
            updateTopRanksTrafficCharts(window.top5trafficCoreBarChart, resp.data.coreLink.traffic);
            updateTopRanksTrafficCharts(window.top5trafficAccessBarChart, resp.data.accessLink.traffic);
            updateTopRanksDropCountCharts(window.top5dropCountCoreBarChart, resp.data.coreLink.dropCount);
            updateTopRanksDropCountCharts(window.top5dropCountAccessBarChart, resp.data.accessLink.dropCount);

            top_ranks_timer = $timeout(function(){wss.sendEvent('dashboardTopRanksDataRequest');}, 5000);
        } else {
            // TODO: show error
            console.log(resp.data);
        }
    }

    function getDeviceName(deviceId) {
        var index;

        $scope.deviceCfgs = $scope.deviceCfgs || [];

        index = $scope.deviceCfgs.findIndex(function(device) {
            return (device.id === deviceId);
        });

        if (index !== -1) {
            return $scope.deviceCfgs[index].name;
        }

        return "";
    }

    function deviceCfgDataResponse(resp) {
        if (resp.status === 200) {
            $scope.deviceCfgs = resp.data;
        } else {
            // TODO: show error
            console.log(resp.data);
        }

        $scope.isDeviceRespDone = true;
    }

    function RefreshCtrl(options) {
        options = options || {};

        if (typeof options.intervalFn !== 'function') {
            throw new Error('intervalFn is required');
        }

        if (typeof options.hookFn !== 'function') {
            throw new Error('hookFn is required');
        }

        // plugin
        var intervalFn = options.intervalFn,
            hookFn = options.hookFn;

        var self = (function init(options) {
            var opts = {
                enabled: false,
                interval: 1000, // unit: ms

                // inner status
                timer: null
            };

            if (typeof options.interval !== 'undefined') {
                opts.interval = options.interval;
            }

            if (typeof options.enabled !== 'undefined') {
                opts.enabled = options.enabled;
            }

            return opts;
        })(options);

        if (self.enabled) {
            start();
        }

        function getInterval() {
            return self.interval;
        }

        function parseInterval(str) {
            var unit = str.substr(str.length - 1),
                int = str.substr(0, str.length - 1),
                ms = parseInt(int, 10);

            if (unit === 's') {
                ms *= 1000;
            } else if (unit === 'm') {
                ms *= 1000000;
            } else {
                throw new TypeError('Invalid interval value ' + str);
            }

            return ms;
        }

        function intervalPrettyString(interval) {
            if (interval < 60000) {
                return '' + (interval / 1000) + 's';
            } else {
                return '' + (interval / 1000000) + 'm';
            }
        }

        function setInterval(value) {
            if (typeof value === 'string') {
                value = parseInterval(value);
            }

            if (self.interval === value) {
                return;
            }

            self.interval = value;
            if (self.enabled) {
                restart();
            }
        }

        function getEnabledStatus() {
            return self.enabled;
        }

        function restart() {
            stop();
            start();
        }

        function start() {
            console.log('start refresh');
            if (self.timer) {
                throw new Error('coding defect, self.timer should be null');
            }

            self.timer = intervalFn(hookFn, self.interval);
        }

        function stop() {
            console.log('stop refresh');
            if (self.timer) {
                intervalFn.cancel(self.timer);
                self.timer = null;
            }
        }

        function setEnabledStatus(value) {
            console.log('set enabled status from ' + (self.enabled ? 'true' : 'false') + ' to ' + (value ? 'true' : 'false'));

            if (value === true) {
                start();
            } else {
                stop();
            }

            self.enabled = value;
        }

        return {
            toggle: function () {
                var enabled = this.enabled();
                enabled = !enabled;

                console.log('toggle status to ' + (enabled ? 'true' : 'false'));

                this.enabled(enabled);
            },
            interval: function (value) {
                if (typeof value === 'undefined') {
                    return getInterval();
                } else {
                    setInterval(value);
                }
            },
            intervalPrettyString: function () {
                var interval = this.interval();

                return intervalPrettyString(interval);
            },
            enabled: function (value) {
                if (typeof value === 'undefined') {
                    return getEnabledStatus();
                } else {
                    return setEnabledStatus(value);
                }
            }
        }
    }

    function SearchWrapper(options) {
        options = options || {};

        if (typeof options.client !== 'object') {
            throw new Error('intervalFn is required');
        }

        var get = ESSearch(options.client),
            req;

        var self =  {
            searchResult: {
                items: [],
                stats: {},
                finished: false
            },
            listeners: {
                begin: [],
                more_begin: [],
                updated: []
            }
        };

        function genSearchReq(options) {
            options = options || {};

            function makeAggsReg() {
                return {
//                        avg_severity: {
//                            avg: {
//                                field: 'severity'
//                            }
//                        },
                    severities: {
                        terms: {
                            field: 'severity'
                        }
                    },
                    tags: {
                        terms: {
                            field: 'tag'
                        }
                    },
                    hostnames: {
                        terms: {
                            field: 'hostname'
                        }
                    },
                    addresses: {
                        terms: {
                            field: 'address'
                        }
                    },
                    event_time_min: {
                        min: {
                            field: 'time'
                        }
                    },
                    event_time_max: {
                        max: {
                            field: 'time'
                        }
                    },
                    event_over_time: {
                        date_histogram: {
                            field: 'time',
                            interval: 'day'
                        }
                    }
                };
            }

            var uiConvertor = {
                type: function (text) {
                    if (text === 'System') {
                        return 'test';
                    } else if (text === 'Fabric') {
                        return 'foo';
                    }

                    return '';
                },
                dateRangeUnit: function (text) {
                    if (text === 'Minutes') {
                        return 'm';
                    } else if (text === 'Hours') {
                        return 'h';
                    } else if (text === 'Days') {
                        return 'd';
                    }

                    return 'd';
                }
            };

            function severityStringToNumber(str) {
                var severity = {
                    fullText: {
                        'Emergency': 0,
                        'Alert': 1,
                        'Critical': 2,
                        'Error': 3,
                        'Warning': 4,
                        'Notice': 5,
                        'Informational': 6,
                        'Debug': 7
                    },
                    keyword: {
                        'Emerg': 0,
                        'Alert': 1,
                        'Crit': 2,
                        'Err': 3,
                        'Warning': 4,
                        'Notice': 5,
                        'Info': 6,
                        'Debug': 7
                    }
                };

                if (typeof severity.fullText[str] !== 'undefined') {
                    return severity.fullText[str];
                }

                return severity.keyword[str];
            }

            function makeQueryReg(options) {
                var req = {
                    bool: {
                        must: []
                    }
                };

//                req.bool.must.push({
//                    term: {
//                        message: 'failed'
//                    }
//                });

                // OR operations
                var terms_should = {
                    bool: {
                        should: []
                    }
                };

                options.q = options.q.trim();
                if (options.q && _.indexOf(options.terms, options.q) === -1) {
                    terms_should.bool.should.push({
                        term: {
                            message: options.q
                        }
                    });
                }

                angular.forEach(options.terms, function (value) {
                    var s = value.trim();

                    if (!s) {
                        return;
                    }

                    terms_should.bool.should.push({
                        term: {
                            message: value
                        }
                    });
                });

                if (terms_should.bool.should.length) {
                    req.bool.must.push(terms_should);
                }

//                req.bool.must.push({
//                    bool: {
//                        should: [
//                            {
//                                term: {
//                                    message: 'failed'
//                                }
//                            },
//                            {
//                                term: {
//                                    message: 'remote'
//                                }
//                            }
//                        ]
//                    }
//                });

                if (options.severity !== 'All') {
                    req.bool.must.push({
                        term: {
                            severity: severityStringToNumber(options.severity)
                        }
                    });
                }

                function convertDateRange(options) {
                    return {
                        //gte: 'now-' + options.timePeriod + uiConvertor.dateRangeUnit(options.timePeriodUnit) + '/' + uiConvertor.dateRangeUnit(options.timePeriodUnit),
                        //lt: 'now' + '/' + uiConvertor.dateRangeUnit(options.timePeriodUnit)
                        gte: 'now-' + options.timePeriod + uiConvertor.dateRangeUnit(options.timePeriodUnit),
                        lt: 'now'
                    }
                }

                req.bool.must.push({
                    range: {
                        time: convertDateRange(options)
                    }
                });

                return req;
            }

            var req = {
                size: options.fetchSize,
                maxSize: options.pageSize,
                body: {
                    query: makeQueryReg(options),
                    aggs: makeAggsReg(options)
                }
            };

            if (typeof options.index === 'string') {
                req.index = options.index;
            }

            if (options.type !== 'All') {
                req.type = uiConvertor.type(options.type);
            }

            return req;
        }

        function respCb(err, resp) {
            if (err) {
                // FIXME: should consider the error case
                self.searchResult.last = true;
                self.listeners.updated[0](err, self.searchResult);
                return;
            }

            self.searchResult.items = _.concat(self.searchResult.items, resp.hits.hits);

            if (resp.aggregations) {
                self.searchResult.stats = _.cloneDeep(resp.aggregations);
                self.searchResult.stats.total = resp.hits.total;

                self.searchResult.first = true;
            } else {
                self.searchResult.first = false;
            }

            self.searchResult.last = this.$scope.last;

            self.listeners.updated[0](null, self.searchResult);
        }

        return {
            searchResult: function () {
                return self.searchResult;
            },
            search: function (options) {
                self.searchResult = {
                    items: [],
                    stats: {},
                    finished: false
                };

                req = genSearchReq(options);

                self.listeners.begin[0](req);

                get(req, respCb);

                return this;
            },
            more: function () {
                self.searchResult = {
                    items: [],
                    stats: {},
                    finished: false
                };

                req.$scope.climb = 0;

                self.listeners.more_begin[0](req);

                get(req, respCb);

                return this;
            },
            on: function (type, cb) {
                if (type === 'begin') {
                    self.listeners.begin.push(cb.bind(this));
                } else if (type === 'more_begin') {
                    self.listeners.more_begin.push(cb.bind(this));
                } else if (type === 'updated') {
                    self.listeners.updated.push(cb.bind(this));
                } else {
                    throw new TypeError('invalid type ' + type);
                }

                return this;
            }
        }
    }

    function clearTimers() {
        if (overview_timer !== null) {
            $timeout.cancel(overview_timer);
            overview_timer = null;
        }

        if (controller_data_timer !== null) {
            $timeout.cancel(controller_data_timer);
            controller_data_timer = null;
        }

        if (top_ranks_timer !== null) {
            $timeout.cancel(top_ranks_timer);
            top_ranks_timer = null;
        }
    }

    angular.module('ovDashboard', ['elasticsearch'])
    .controller('OvDashboardCtrl',
        ['$log', '$scope', '$timeout', '$interval', '$http', 'WebSocketService', 'client', 'esFactory',

        function (_$log_, _$scope_, _$timeout_, _$interval_, _$http_, _wss_, _client_, _esFactory_) {

            $log = _$log_;
            $scope = _$scope_;
            $timeout = _$timeout_;
            $interval = _$interval_;
            $http = _$http_;
            wss = _wss_;
            client = _client_;
            esFactory = _esFactory_;

            $scope.overview = {
                controller: {
                    totalCount: 0
                },
                spine: {
                    totalCount: 0
                },
                leaf: {
                    totalCount: 0
                },
                rack: {
                    totalCount: 0
                },
                server: {
                    totalCount: 0
                },
                link: {
                    totalCount: 0,
                    issuedCount: 0
                }
            };

            $scope.topRanks = {
                coreLink: {
                    traffic: [{}],
                    dropCount: [{}]
                },
                accessLink: {
                    traffic: [{}],
                    dropCount: [{}]
                }
            };

            $scope.deviceCfgs = [];
            $scope.isDeviceRespDone = false;

            $scope.items = [];
            $scope.logs = [];

            var handlers = {
                dashboardOverviewDataResponse: dashboardOverviewDataResponse,
                dashboardControllerDataResponse: dashboardControllerDataResponse,
                dashboardTopRanksDataResponse: dashboardTopRanksDataResponse,
                deviceCfgDataResponse: deviceCfgDataResponse
            };

            wss.bindHandlers(handlers);

            wss.sendEvent('deviceCfgDataRequest');
            wss.sendEvent('dashboardOverviewDataRequest');
            wss.sendEvent('dashboardControllerDataRequest');
            wss.sendEvent('dashboardTopRanksDataRequest');

            createControllerCharts();
            createTopRanksCharts();

            var searchCtrl = SearchWrapper({
                client: client
            });

            searchCtrl.on('begin', function (req) {
                console.log('search beginning');

                $scope.searchResult = {
                    items: [],
                    stats: {},
                    finished: false
                };

                $scope.searchProgressing = true;
                // $scope.progressBar.on('end', searchFinished);
                //
                // $scope.progressBar.max(req.maxSize);
                // $scope.progressBar.reset();
                // $scope.progressBar.value($scope.progressBar.max()/200);
            }).on('more_begin', function (req) {
                console.log('search beginning');

                $scope.searchProgressing = true;
                // $scope.progressBar.on('end', searchFinished);
                //
                // $scope.progressBar.max(req.maxSize);
                // $scope.progressBar.reset();
                // $scope.progressBar.value($scope.progressBar.max()/200);
            }).on('updated', function (err, searchResult) {
                function updateData(exist, resp) {
                    if (exist === []) {
                        return _.cloneDeep(resp);
                    }

                    return _.reverse(
                        _.unionBy(
                            _.sortBy(
                                _.concat(resp, exist), ['_id']),
                            '_id'
                        ));
                }

                $scope.logs = $scope.searchResult.items = updateData($scope.searchResult.items, searchResult.items);

                if (searchResult.first) {
                    $scope.searchResult.stats = searchResult.stats;
                    // updateChart(searchResult.stats);
                }

                // if (searchResult.last) {
                //     $scope.progressBar.value($scope.progressBar.max());
                // } else {
                //     $scope.progressBar.value(searchResult.items.length);
                // }
            });

            $scope.searchOptions = {
                fetchSize: 200, // per fetch size
                pageSize: 200,  // one page size
                q: '',
                terms: [],
                type: 'All',
                severity: 'All',
                source: 'All',
                timePeriod: 180,
                timePeriodUnit: 'Days'
            };

            searchCtrl.search($scope.searchOptions);

            var refreshCtrl = RefreshCtrl({
                interval: 2000,
                intervalFn: $interval,
                hookFn: function () {
                    searchCtrl.search($scope.searchOptions);
                }
            });

            refreshCtrl.enabled(true);

            $scope.makeColClass = function(col) {
                return 'col-xs-' + col + ' col-sm-' + col + ' col-md-' + col + ' col-lg-' + col;
            };

            $scope.makeClass = function () {
                var total = 0,
                    col;

                angular.forEach($scope.c.charts, function (ctrl) {
                    if (ctrl.isShow()) {
                        total += 1;
                    }
                });

                if (total === 0) {
                    // return 'col-md-12';
                    // return $scope.makeColClass(12);
                    col = 12;
                } else {
                    col = 12/total;
                }

                return $scope.makeColClass(col);
                // return $scope.makeColClass(12/total);
                // return 'col-md-' + (12 / total);
            };

            $scope.makeLogClass = function (item) {
                if (item.severity < 4) {
                    return 'danger';
                } else if (item.severity === 4) {
                    return 'warning';
                } else {
                    return 'info';
                }
            };

            $scope.$on('$destroy', function () {
                refreshCtrl.enabled(false);
                clearTimers();
                wss.unbindHandlers(handlers);
            });

            $log.log('OvDashboardCtrl has been created');
        }])
    .service('client', function (esFactory) {
        return esFactory({
            host: 'localhost:9200',
            // host: document.location.origin + '/events',
            apiVersion: '2.3'//,
            // log: 'trace'
        });
    });
}());
