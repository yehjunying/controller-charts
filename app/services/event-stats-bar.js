/**
 * Created by junying on 2017/4/13.
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.EventStatsBar = factory()
}(this, (function () {
    'use strict';

    function makeChart(ctx, opt) {
        return new Chart(ctx, opt);
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
                label: 'Event',
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
            type: 'bar',
            data: _chartData,
            options: {
                animation : false,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        //display: false,
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        };

        return {
            chart: makeChart(canvasContext, _opt),
            update: function (data) {
                var chartData = [],
                    labels = [];

                angular.forEach(data, function (value, key) {
                    labels.push(value.label);
                    chartData.push(value.data);
                });

                _chartData.datasets[0].data = chartData;
                _chartData.labels = labels;

                this.chart.update();

                // var chartData = _chartData.datasets[0].data;
                // angular.forEach(chartData, function (el, index, array) {
                //     if (index !== 0) {
                //         array[index - 1] = el;
                //     }
                // });
                // chartData[chartData.length - 1] = data.transmitInKbps;
                //
                // chartData = _chartData.datasets[1].data;
                // angular.forEach(chartData, function (el, index, array) {
                //     if (index !== 0) {
                //         array[index - 1] = el;
                //     }
                // });
                // chartData[chartData.length - 1] = data.receiveInKbps;
                // this.chart.update();
                //
                // _info = data;
            },
            reset: function () {
                // var chartData = _chartData.datasets[0].data;
                // angular.forEach(chartData, function (el, index, array) {
                //     array[index] = 0;
                // });
                //
                // chartData = _chartData.datasets[1].data;
                // angular.forEach(chartData, function (el, index, array) {
                //     array[index] = 0;
                // });
            },
            // chartLast: function (n) {
            //     n = n || 1;
            //     var chartData = _chartData.datasets[0].data,
            //         ret = [];
            //
            //     if (chartData.length < n) {
            //         n = chartData.length;
            //     }
            //
            //     ret[0] = chartData.slice(chartData.length - n, chartData.length)
            //         .reverse();
            //
            //     chartData = _chartData.datasets[1].data;
            //     ret[1] = chartData.slice(chartData.length - n, chartData.length)
            //         .reverse();
            //
            //     return ret;
            // },
            // last: function () {
            //     return _info;
            // }
        };
    }

    return function (options) {
        options = options || {};

        var self = {
            chart: makeStackChart(options.canvasContext)
        };

        return {
            update: function (data) {
                self.chart.update(data);
            }
        }
    }

})));