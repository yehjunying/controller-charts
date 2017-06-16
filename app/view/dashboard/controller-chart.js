;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.controllerChart = factory()
}(this, (function () {
    'use strict';

    function controllerChart(options) {
        options = options || {};

        var angular = options.deps['angular'] || null;

        var self = {
            charts: [],
            options: options
        };

        function makeChart(ctx, opt) {
            return new Chart(ctx, opt);
        }

        function makeLineChart(canvasContext) {
            var _info = {};

            var _chartData = {
                labels: (new Array(60)).fill(''),
                datasets: [{
                    lineTension: 0,
                    borderWidth: 1,
                    pointRadius: 0,
                    backgroundColor: "rgba(30, 191, 174, 0.2)",
                    borderColor: "rgba(30, 191, 174, 1)",
                    pointBorderColor: "rgba(30, 191, 174, 1)",
                    label: 'CPU',
                    data: (new Array(60)).fill(0)
                }]
            };

            var _opt = {
                type: 'line',
                data: _chartData,
                options: {
                    animation : false,
                    maintainAspectRatio: false,
                    // onResize: function (inst, size) {
                    //     console.log(size);
                    // },
                    scales: {
                        xAxes: [{
                            display: false
                        }],
                        yAxes: [{
                            ticks: {
                                suggestedMin: 0,
                                suggestedMax: 100
                            }
                        }]
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.yLabel;
                            }
                        }
                    }
                }
            };

            return {
                chart: makeChart(canvasContext, _opt),
                update: function (data) {
                    var chartData = _chartData.datasets[0].data;
                    angular.forEach(chartData, function (el, index, array) {
                        if (index !== 0) {
                            array[index - 1] = el;
                        }
                    });
                    chartData[chartData.length - 1] = data.utilization;
                    this.chart.update();

                    _info = data;
                },
                reset: function () {
                    var chartData = _chartData.datasets[0].data;
                    angular.forEach(chartData, function (el, index, array) {
                        array[index] = 0;
                    });
                },
                chartLast: function (n) {
                    n = n || 1;
                    var chartData = _chartData.datasets[0].data;

                    if (chartData.length < n) {
                        n = chartData.length;
                    }

                    return chartData.slice(chartData.length - n, chartData.length)
                        .reverse();
                },
                last: function () {
                    return _info;
                }
            };
        }

        function makeStackChart(canvasContext) {
            var _info = {};

            var _chartData = {
                labels: (new Array(60)).fill(''),
                datasets: [{
                    lineTension: 0.1,
                    borderWidth: 1,
                    pointRadius: 0,
                    backgroundColor: "rgba(71, 209, 71, 0.3)",
                    borderColor: "rgba(71, 209, 71, 1)",
                    pointBorderColor: "rgba(71, 209, 71, 1)",
                    label: 'Send',
                    data: (new Array(60)).fill(0)
                }, {
                    lineTension: 0.1,
                    borderWidth: 1,
                    pointRadius: 0,
                    backgroundColor: "rgba(48, 165, 255, 0.2)",
                    borderColor: "rgba(48, 165, 255, 1)",
                    pointBorderColor: "rgba(48, 165, 255, 1)",
                    label: 'Receive',
                    data: (new Array(60)).fill(0)
                }]
            };

            var _opt = {
                type: 'line',
                data: _chartData,
                options: {
                    animation : false,
                    maintainAspectRatio: false,
                    scales: {
                        xAxes: [{
                            display: false,
                            stacked: true
                        }],
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                suggestedMin: 0,
                                suggestedMax: 100
                            }
                        }]
                    }
                }
            };

            return {
                chart: makeChart(canvasContext, _opt),
                update: function (data) {
                    var chartData = _chartData.datasets[0].data;
                    angular.forEach(chartData, function (el, index, array) {
                        if (index !== 0) {
                            array[index - 1] = el;
                        }
                    });
                    chartData[chartData.length - 1] = data.transmitInKbps;

                    chartData = _chartData.datasets[1].data;
                    angular.forEach(chartData, function (el, index, array) {
                        if (index !== 0) {
                            array[index - 1] = el;
                        }
                    });
                    chartData[chartData.length - 1] = data.receiveInKbps;
                    this.chart.update();

                    _info = data;
                },
                reset: function () {
                    var chartData = _chartData.datasets[0].data;
                    angular.forEach(chartData, function (el, index, array) {
                        array[index] = 0;
                    });

                    chartData = _chartData.datasets[1].data;
                    angular.forEach(chartData, function (el, index, array) {
                        array[index] = 0;
                    });
                },
                chartLast: function (n) {
                    n = n || 1;
                    var chartData = _chartData.datasets[0].data,
                        ret = [];

                    if (chartData.length < n) {
                        n = chartData.length;
                    }

                    ret[0] = chartData.slice(chartData.length - n, chartData.length)
                        .reverse();

                    chartData = _chartData.datasets[1].data;
                    ret[1] = chartData.slice(chartData.length - n, chartData.length)
                        .reverse();

                    return ret;
                },
                last: function () {
                    return _info;
                }
            };
        }

        function makeController(options) {
            options = options || {};

            return {
                name: '',
                cpu: makeLineChart(options.cpuChartCanvas),
                memory: makeLineChart(options.memoryChartCanvas),
                ethernet: makeStackChart(options.ethernetChartCanvas),
                update: function (data) {
                    this.name = data.name;
                    this.cpu.update(data.cpu);
                    this.memory.update(data.memory);
                    this.ethernet.update(data.ethernet);
                },
                reset: function () {
                    this.name = '';
                    this.cpu.reset();
                    this.memory.reset();
                    this.ethernet.reset();
                },
                isShow: function () {
                    return this.name !== '';
                },
                columns: function (ctrls) {
                    if (!this.isShow()) {
                        return 12;
                    }

                    var total = 0;

                    angular.forEach(ctrls, function (ctrl) {
                        if (ctrl.isShow()) {
                            total += 1;
                        }
                    });

                    return 12 / total;
                }
            };
        }

        function add(options) {
            self.charts.push(makeController(options));
            return this;
        }

        function update(resp) {
            var r_resp = {},
                controllers = self.charts;

            angular.forEach(resp, function (value, key) {
                // unique
                r_resp[value.name] = value;
            });

            // drop existing data if no receiving data for specify controller
            angular.forEach(controllers, function (value, key) {
                if (typeof r_resp[value.name] === 'undefined') {
                    // controllers[key].name = '';
                    controllers[key].reset();
                }
            });

            angular.forEach(r_resp, function (value, key) {
                var index = controllers.findIndex(function (ctrl) {
                    return (ctrl.name === value.name);
                });

                if (index === -1) {
                    index = controllers.findIndex(function (ctrl) {
                        return (ctrl.name === '');
                    });
                }

                if (index === -1) {
                    // something error...
                    console.log('something error...');
                    return;
                }

                controllers[index].update(value);
            });
        }

        return {
            charts: self.charts,
            add: add,
            update: update
        }
    }

    return controllerChart;
})));
