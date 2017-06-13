(function () {
    'use strict';

    var $window, $log, $scope, $interval, mast, fs, wss, client, esFactory;


    angular.module('ovEvent', ['elasticsearch'])
    .controller('OvEventCtrl',
        ['$window', '$log', '$scope', '$interval', '$mdConstant', '$mdDialog', /*'MastService', 'FnService',*/ 'WebSocketService', 'client', 'esFactory',

        function (_$window_, _$log_, _$scope_, _$interval_, $mdConstant, $mdDialog, /*_mast_, _fs_,*/ _wss_, _client_, _esFactory_) {

            $window = _$window_;
            $log = _$log_;
            $scope = _$scope_;
            $interval = _$interval_;
            //mast = _mast_;
            //fs = _fs_;
            wss = _wss_;
            client = _client_;
            esFactory = _esFactory_;

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

                var self = {
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

                    self.searchResult.items = _.cloneDeep(resp.hits.hits);

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

            function ProgressBar(options) {
                options = options || {};

                var height = 5,
                    logger = function () {
                    };

                if (typeof options.id !== 'string') {
                    throw new Error('id is required');
                }

                if (options.log) {
                    if (typeof options.log === 'function') {
                        logger = options.log;
                    }
                    else if (typeof options.log === 'string' && options.log === 'trace') {
                        logger = console.log;
                    }
                }

                var svg = d3.select(options.id)
                    .append('svg')
                    .attr('height', height)
                    .attr('width', '100%');

                svg.append('rect')
                    .attr('class', 'bg-rect')
                    .attr('rx', 0)
                    .attr('ry', 0)
                    .attr('opacity', 0)
                    .attr('height', height)
                    .attr('width', '100%')
                    .attr('x', 0)
                    .attr('y', 0);

                var progress = svg.append('rect')
                    .attr('class', 'progress-rect')
                    .attr('opacity', 1)
                    .attr('height', height)
                    .attr('width', 0)
                    .attr('rx', 0)
                    .attr('ry', 0)
                    .attr('x', 0)
                    .attr('y', 0);

                var self = {
                    value: 0,
                    max: 100,
                    listeners: {
                        end: []
                    }
                };

                setValue(self.value);

                function width(el) {
                    if (typeof el === 'undefined') {
                        el = svg;
                    }

                    return el.node().getBBox().width;
                }

                function dispatchEvent(type) {
                    if (typeof self.listeners[type] === 'undefined') {
                        throw new TypeError('invalid listener type');
                    }

                    self.listeners[type].forEach(function (fn) {
                        fn();
                    });

                    self.listeners[type] = [];
                }

                function finalize() {
                    progress.transition()
                        .duration(300)
                        .attr('opacity', 0)
                        .each('end', (function (value) {
                            dispatchEvent('end');
                        }))
                        .each('interrupt', (function (value) {
                            dispatchEvent('end');
                        }))
                }

                function getValue() {
                    return self.value;
                }

                function setValue(value, immediately) {
                    self.value = value;

                    if (immediately) {
                        progress.attr('width', function () {
                            return (self.value / self.max) * width(svg);
                        });
                    } else {
                        logger('progress-bar: setValue(' + value + ')');

                        var progressTrans = progress.transition()
                            .duration(50)
                            .attr('width', function () {
                                logger('progress-bar: width = ' + (self.value / self.max) * width(svg));
                                return (self.value / self.max) * width(svg);
                            });

                        if (d3.version[0] === '3') {
                            progressTrans
                                .each('end', (function (value) {
                                    return function () {
                                        logger('progress-bar: setValue(' + value + ') finished');

                                        if (value === self.max) {
                                            finalize();
                                        }
                                    }
                                })(value))
                                .each('interrupt', (function (value) {
                                    return function () {
                                        logger('progress-bar: setValue ' + value + ' interrupted');
                                    }
                                })(value));
                        } else if (d3.version[0] === '4') {
                            progressTrans
                                .on('end', (function (value) {
                                    return function () {
                                        logger('progress-bar: setValue ' + value + ' finished');

                                        if (value === self.max) {
                                            finalize();
                                        }
                                    }
                                })(value))
                                .on('interrupt', (function (value) {
                                    return function () {
                                        logger('progress-bar: setValue ' + value + ' interrupted');
                                    }
                                })(value));
                        }
                    }
                }

                function getMax() {
                    return self.max;
                }

                function setMax(value) {
                    self.max = value;
                }

                return {
                    reset: function () {
                        progress.attr('width', 0)
                            .attr('opacity', 1);
                        return this;
                    },
                    value: function (value, immediately) {
                        if (typeof value === 'undefined') {
                            return getValue();
                        } else {
                            setValue(value, immediately);
                            return this;
                        }
                    },
                    max: function (value) {
                        if (typeof value === 'undefined') {
                            return getMax();
                        } else {
                            setMax(value);
                            return this;
                        }
                    },
                    width: width,
                    on: function (type, cb) {
                        if (type === 'end') {
                            self.listeners.end.push(cb.bind(this));
                        } else {
                            throw new TypeError('invalid type ' + type);
                        }

                        return this;
                    }
                }
            }

            $scope.keys = [$mdConstant.KEY_CODE.SPACE];
            $scope.editableFruitNames = ['Apple', 'Banana', 'Orange'];

            $scope.progressBar = ProgressBar({
                id: '#progress-bar',
                //log: console.log
            });

            $scope.showSearchOptions = true;

            $scope.toggleSearchOptions = function () {
                $scope.showSearchOptions = !$scope.showSearchOptions;
            };

            $scope.isShowSearchOptions = function () {
                return $scope.showSearchOptions;
            };

            $scope.searchOptions = {
                fetchSize: 200, // per fetch size
                pageSize: 200,  // one page size
                q: '',
                terms: [],
                type: 'All',
                severity: 'All',
                source: 'All',
                timePeriod: 60,
                timePeriodUnit: 'Minutes'
            };

            $scope.filterOptions = {
                severities: [],
                tags: [],
                address: []
            };

            $scope.onFilterCheckbox = function (option, val) {
                var index = _.indexOf(option, val);

                if (index === -1) {
                    option.push(val);
                } else {
                    option.splice(index, 1);
                }
            };

            $scope.eventFilter = function (options) {
                return function (item) {

                    if (_.head(options.severities)) {
                        if (_.indexOf(options.severities, item._source.severity) === -1) {
                            return false;
                        }
                    }

                    if (_.head(options.tags)) {
                        if (_.indexOf(options.tags, item._source.tag) === -1) {
                            return false;
                        }
                    }

                    if (_.head(options.address)) {
                        if (_.indexOf(options.address, item._source.address) === -1) {
                            return false;
                        }
                    }
                    //return item.name === options.name;
                    return true;
                };
            };

            $scope.searchOptions.predefinedTimePeriod = [
                {
                    id: 1, period: 60, unit: 'Minutes'
                },
                {
                    id: 2, period: 24, unit: 'Hours'
                },
                {
                    id: 3, period: 30, unit: 'Days'
                },
                {
                    id: 4, period: 'Customized Period...'
                }
            ];
            $scope.searchOptions.selectedPeriod = $scope.searchOptions.predefinedTimePeriod[0];

            $scope.onClosedTimePeriodSelect = function (ev) {
                function selectedText() {
                    return '' + $scope.searchOptions.timePeriod + ' ' + $scope.searchOptions.timePeriodUnit;
                }

                if ($scope.searchOptions.selectedPeriod.id === 4) {
                    $('#time-period-select md-select-value span').first().text(selectedText());

                    $mdDialog.show({
                        controller: DialogController,
                        templateUrl: 'app/view/event/period.tmpl.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:true,
                        locals: {searchOptions: $scope.searchOptions}
                    })
                        .then(function(answer) {
                            $scope.status = 'You said the information was "' + answer + '".';

                            $scope.searchOptions.timePeriod = answer.period;
                            $scope.searchOptions.timePeriodUnit = answer.unit;

                            $('#time-period-select md-select-value span').first().text(selectedText());
                            $('#time-period-select').focus();
                        }, function() {
                            $scope.status = 'You cancelled the dialog.';

                            $('#time-period-select md-select-value span').first().text(selectedText());
                            $('#time-period-select').focus();

                            // TODO: should change to previous setting
                        });
                } else {
                    $scope.searchOptions.timePeriod = $scope.searchOptions.selectedPeriod.period;
                    $scope.searchOptions.timePeriodUnit = $scope.searchOptions.selectedPeriod.unit;

                    $('#time-period-select md-select-value span').first().text(selectedText());
                }
            };

            function DialogController($scope, $mdDialog, searchOptions) {
                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.answer = function(answer) {
                    $mdDialog.hide({
                        period: $scope.period,
                        unit: $scope.unit
                    });
                };

                $scope.states = ['Minutes', 'Hours', 'Days'];
                $scope.period = searchOptions.timePeriod;
                $scope.unit = searchOptions.timePeriodUnit;
            }

            var searchCtrl = SearchWrapper({
                client: client
            });

            var chart = EventStatsBar({
                canvasContext: document.getElementById('event-stats-chart').getContext("2d")
            });

            function updateChart(stats) {
                var data = [];

                var minDate = new Date(stats.event_time_min.value_as_string),
                    maxData = new Date(stats.event_time_max.value_as_string);

                var sameYear = minDate.getFullYear() === maxData.getFullYear();

                angular.forEach(stats.event_over_time.buckets, function (value, key) {

                    var date = new Date(value.key_as_string);

                    if (sameYear) {
                        data.push({
                            label: '' + (date.getMonth() + 1) + '/' + date.getDate(),
                            data: value.doc_count
                        });
                    } else {
                        data.push({
                            label: '' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
                            data: value.doc_count
                        });
                    }
                });

                chart.update(data);
            }

            $scope.searchResult = {
                items: [],
                stats: {},
                finished: false
            };

            $scope.searchProgressing = false;

            function searchFinished() {
                console.log('search finished');
                $scope.searchProgressing = false;
                $scope.$digest();
            }

            searchCtrl.on('begin', function (req) {
                console.log('search beginning');

                $scope.searchResult = {
                    items: [],
                    itemsPerDay: [],
                    itemsLookupTbl: {},
                    stats: {},
                    finished: false
                };

                $scope.searchProgressing = true;
                $scope.progressBar.on('end', searchFinished);

                $scope.progressBar.max(req.maxSize);
                $scope.progressBar.reset();
                $scope.progressBar.value($scope.progressBar.max() / 200);
            }).on('more_begin', function (req) {
                console.log('search beginning');

                $scope.searchProgressing = true;
                $scope.progressBar.on('end', searchFinished);

                $scope.progressBar.max(req.maxSize);
                $scope.progressBar.reset();
                $scope.progressBar.value($scope.progressBar.max() / 200);
            }).on('updated', function (err, searchResult) {
                $scope.searchResult.items = _.concat($scope.searchResult.items, searchResult.items);

                _.forEach(searchResult.items, function (item) {
                    var date = new Date(item._source.time);
                    var dateString = '' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();

                    if (typeof $scope.searchResult.itemsLookupTbl[dateString] === 'undefined') {
                        $scope.searchResult.itemsPerDay.push({date: dateString, data:[]});
                        $scope.searchResult.itemsLookupTbl[dateString] = _.last($scope.searchResult.itemsPerDay).data;
                    }

                    $scope.searchResult.itemsLookupTbl[dateString].push(item);
                });

                if (searchResult.first) {
                    $scope.searchResult.stats = searchResult.stats;
                    updateChart(searchResult.stats);
                }

                if (searchResult.last) {
                    $scope.progressBar.value($scope.progressBar.max());
                } else {
                    $scope.progressBar.value(searchResult.items.length);
                }
            });

            $scope.onSearchKeyPressed = function ($event) {
                var keyCode = $event.which || $event.keyCode;
                if (keyCode === 13) {

                    // trigger 'md-add-on-blu' action
                    $('#search-input').blur().focus();

                    setTimeout(function () {
                        $scope.search();
                    }, 0);
                }
            };

            $scope.search = function () {
                if ($scope.searchProgressing === true) {
                    return;
                }

                $scope.searchResult = {
                    items: [],
                    stats: {}
                };

                searchCtrl.search($scope.searchOptions);
            };

            $scope.haveMore = function () {
                if (typeof $scope.searchResult === 'undefined') {
                    return true;
                }

                return $scope.searchResult.items.length < $scope.searchResult.stats.total;
            };

            $scope.loadMore = function () {
                if ($scope.searchProgressing === true) {
                    return;
                }

                if (!$scope.haveMore()) {
                    return;
                }

                searchCtrl.more();
            };

            $scope.setSearchOptionsAndSearch = function (options) {
                if ($scope.searchProgressing === true) {
                    return;
                }

                $scope.searchOptions = _.assignIn($scope.searchOptions, options);
                $scope.search();
            };

            searchCtrl.search($scope.searchOptions);

            $scope.addTermFn = function (options, term) {
                term = String.prototype.trim.call(term);

                if (!term) {
                    return;
                }

                if (_.indexOf(_.slice(options.terms, 1), term) === -1) {
                    options.terms.push(term);

                    // FIXME: bad ...
                    options.q = '';
                }
            };

            $scope.removeTermFn = function (options, term) {
                var idx = _.indexOf(options.terms, term);
                if (idx === -1) {
                    return;
                }

                options.terms.splice(idx, 1);
            };

            var refreshCtrl = RefreshCtrl({
                interval: 5000,
                intervalFn: $interval,
                hookFn: function () {
                    searchCtrl.search($scope.searchOptions);
                }
            });

            $scope.toggleRefresh = refreshCtrl.toggle.bind(refreshCtrl);
            $scope.setRefreshInterval = refreshCtrl.interval.bind(refreshCtrl);
            $scope.refreshInterval = refreshCtrl.intervalPrettyString.bind(refreshCtrl);

            $scope.makeAutoRefreshClass = function () {
                return refreshCtrl.enabled() ? 'btn-info' : '';
            };

            $scope.severityString = function (lvl) {
                var severity = {
                    0: 'Emergency',
                    1: 'Alert',
                    2: 'Critical',
                    3: 'Error',
                    4: 'Warning',
                    5: 'Notice',
                    6: 'Informational',
                    7: 'Debug'
                };

                return severity[lvl];
            };

            $scope.makeEventListClass = function (item) {
                if (item.severity < 4) {
                    return 'danger';
                } else if (item.severity === 4) {
                    return 'warning';
                } else {
                    return 'info';
                }
            };

            $scope.friendlyDateString = function (date) {
                return moment(date).calendar(null, {
                    sameDay: '[Today] A hh:mm:ss',
                    lastDay: '[Yesterday] A hh:mm:ss',
                    sameElse: 'YYYY/MM/DD A hh:mm:ss'
                });
            };

            $scope.scrolled = false;
            $('#event-view').scroll(function () {
                if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                    $scope.scrolled = true;
                } else {
                    $scope.scrolled = false;
                }
                $scope.$digest();

                // TODO: if max enter is larger than 5000, disable auto load function
                if ($scope.scrolled === true) {
                    $scope.loadMore();
                }
            });

            $scope.makeColClass = function(col) {
                return 'col-xs-' + col + ' col-sm-' + col + ' col-md-' + col + ' col-lg-' + col;
            };

            $scope.$on('$destroy', function () {
                // wss.unbindHandlers(handlers);
            });

            $log.log('OvEventCtrl has been created');
        }])
        .filter('prettyJSON', function () {
            function prettyPrintJson(json) {
                return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
            }

            return prettyPrintJson;
        })
        .config(function($httpProvider) {
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        })
        .service('client', function (esFactory) {
            return esFactory({
                host: 'localhost:9200',
                //host: document.location.origin + '/events',
                apiVersion: '2.3',
                log: 'trace'
            });
        });
}());
