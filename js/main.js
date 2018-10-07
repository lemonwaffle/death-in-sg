// This module initialises the app and manages data requests.
(function(v) {
    'use strict';

    // functions that takes a stacked data and
    // compiles the death totals for each age group as an object
    var sumStackedData = function(data) {
        var object = {};

        for (var i=0; i<data.length; i++) {
            var grp = data[i];

            var sum = d3.sum(v.MAIN_CATS, function(cat) { return grp[cat]; });

            object[grp.age_grp] = sum;
        }

        return object;
    };




    // LOADING AND STORING THE DATASET/S *********************************************
    d3.queue()
        .defer(d3.json, 'data/data.json')
        .defer(d3.json, 'data/death_cat.json')
        .await(ready);

    // Callback function for the 'await' method
    function ready(error, data, cats) {
        // Logs any error to the console
        if (error) {
            return console.warn(error);
        }

        v.DEATH_CATS = cats;
        v.DATA = data;
        console.log('Main Data Object:');
        console.log(data);

        // get an array of all the age groups
        v.AGE_GRPS = d3.nest()
                            .key(function(d) { return d.death_age; })
                            .entries(data)
                            .map(function(d) { return d.key; });

        var chartData = v.stackData(data, 'h_cat');
        console.log(chartData);


        // calculate age grp death totals
        // for normalising functions (All, Males, Females)
        v.DEATH_TOTALS.None = sumStackedData(chartData);
        v.DEATH_TOTALS.M = sumStackedData(v.stackData(v.filterData(v.DATA, 'gender', 'M'), 'h_cat'));
        v.DEATH_TOTALS.F = sumStackedData(v.stackData(v.filterData(v.DATA, 'gender', 'F'), 'h_cat'));



        chartData = v.normaliseStackedData(chartData);
        v.initViz(chartData);
    }



}(window.v = window.v || {}));
