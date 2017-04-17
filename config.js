/**
 * Created by junying on 2017/4/14.
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.config = factory()
}(this, (function () {
    'use strict';

    return {
        elasticsearch: {
            url: 'http://192.168.137.201:9200',
            // url: 'http://localhost:9200',
            index: 'mars'
        },
        eventview: {
            'searchDetail': {
                // type: 'All',
                // severity: 'All',
                // source: 'All',
                timePeriod: 100,
                timePeriodUnit: 'Days'
            }
        }
    }

})));