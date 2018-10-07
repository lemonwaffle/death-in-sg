// This module initialises the app and manages data requests.
(function(v) {
    'use strict';






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

        // initialise chart
        v.initViz(
            v.normaliseStackedData(
                v.stackData(data, 'h_cat')
            )
        );

    }

}(window.v = window.v || {}));
