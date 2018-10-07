// This module contains any code we might want to share among the other scripts.

(function(v) {
    'use strict';

    // Main Data Object
    v.DATA = {};
    // Death Categories
    v.DEATH_CATS = {};
    // Any flags
    v.flag = 0;
    // Stack Method Keys
    v.keys = [];
    // Main Death Categories
    v.MAIN_CATS = ["Cancer", "Circulatory", "External", "Respiratory", "Congenital", "Genitourinary", "Nervous", "Birth Problems", "Digestive", "Infection", "Others", "Endocrine", "Blood", "Musculoskeletal", "Skin", "Mental"];
    // 20 Colors
    // v.COLORS = ['(31, 119, 180)', '(174, 199, 232)', '(255, 127, 14)', '(255, 187, 120)',
    //          '(44, 160, 44)', '(152, 223, 138)', '(214, 39, 40)', '(255, 152, 150)',
    //          '(148, 103, 189)', '(197, 176, 213)', '(140, 86, 75)', '(196, 156, 148)',
    //          '(227, 119, 194)', '(247, 182, 210)', '(127, 127, 127)', '(199, 199, 199)',
    //          '(188, 189, 34)', '(219, 219, 141)', '(23, 190, 207)', '(158, 218, 229)'];
    v.COLORS = [
        '#482e5b', '#705c53', '#6d7162', '#d76a63',
        '#5a8685', '#89ab9b', '#d9e2cf', '#f4d8d4',
        '#861505', '#ffdf6e', '#34558b', '#f9be84',
        '#b0adf0', '#da0f3e', '#bc8a4d', '#d99ac5'
    ];






    // DATA REFORMATTING FUNCTIONS ***************************************************************************

    // Function that reformats the data for usage in our stacked area chart
    // also updates the KEYS to be used for the stack function
    v.stackData = function(d, cat) {
        // INPUT:
        // 1. JSON Dataset
        // A list of objects
        // each object corresponding to a row in the dataset
        // each property is a column and its corresponding value

        // 2. The category to be grouped by

        // OUTPUT:
        // A list of objects
        // each object corresponding to an age group
        // properties being the various death categories (keys)
        // containing any extra information as required (counts etc.)

        // final reformatted data to be output
        var data = [];

        // store the keys for stack method
        // v.MAIN_CATS = d3.nest()
        //             .key(function(d) { return d[cat]; })
        //             .entries(d)
        //             .map(function(d) { return d.key; });
        // console.log(v.MAIN_CATS);

        // use d3.nest to first group the data by age group
        // and the specified category
        var group = d3.nest()
                        .key(function(d) { return d.death_age; })
                        // sort by h_cat with the largest death count first

                        .key(function(d) { return d[cat]; })
                        // aggregate the death count values in each group
                        .rollup(function(l) {
                            return d3.sum(l, function(d) { return d.death_count; });
                        })
                        .entries(d);

        console.log('nested data:');
        console.log(group);

        // restructure the data
        // looping through the age groups
        for (var i=0; i<group.length; i++) {
            // create an age group object
            var grp = { age_grp: group[i].key };

            // loop through all the categories (keys)
            for (var j=0; j<group[i].values.length; j++) {
                var category = group[i].values[j];
                // create the category entry in the age group object
                grp[category.key] = category.value;
            }
            console.log(grp);

            // check for missing categories and fill them with 0
            for (var k=0; k<v.MAIN_CATS.length; k++) {
                var categories = v.MAIN_CATS[k];
                if (!grp.hasOwnProperty(categories)) {
                    grp[categories] = 0;
                }
            }

            // finally, append the object into the main data
            data.push(grp);
        }

        console.log('stacked data:');
        console.log(data);


        return data;
    };


    // Function that Normalises the Stacked Data
    // takes as input
    // 1. Stacked Data Object
    // 2. 'True' if requires normalising, else 'False'
    v.normaliseStackedData = function(data, val) {
        // Calculate the total for each age group
        // Then divide all the key values by that total
        if (val == 'False') {
            return data;
        }

        for (var i=0; i<data.length; i++) {
            var total = d3.sum(v.MAIN_CATS, function(k) { return data[i][k]; });

            for (var j=0; j<v.MAIN_CATS.length; j++) {
                data[i][v.MAIN_CATS[j]] /= total;
            }
        }
        console.log('normalised:');
        console.log(data);

        return data;

    };

    // Function that filters the Main Data
    // takes as input
    // 1. Main Data Object
    // 2. Column to be filtered
    // 2. Value of interest, if 'None', don't filter
    v.filterData = function(data, col, val) {
        if (val=='None') {
            return data;
        } else {
            var filteredData = data.filter(function(d) { return d[col] == val; });
            return filteredData;
        }

    };

    // Function that filters the Stacked Data
    // based on selected Category
    v.filterStackedData = function(data, cat) {
        for (var i=0; i<data.length; i++) {

            for (var j=0; j<v.MAIN_CATS.length; j++) {
                var key = v.MAIN_CATS[j];
                if (key != cat) {
                    data[i][key] = 0;
                }
            }
        }
        console.log(data);
        return data;
    };




    // OUR UPDATE METHOD ************************************************************************
    // Called whenever a user does something to change the data.
    // Synchronises all the visual elements to any user-driven data changes.
    v.onDataChange = function() {
        // Make all the neccessary data filters and stack the data
        console.log(v.DATA);
        var newData = v.filterData(v.DATA, 'gender', v.genderFilter);
        newData = v.stackData(newData, 'h_cat');
        newData = v.normaliseStackedData(newData, v.valueFilter);
        newData = v.filterStackedData(newData, v.categoryFilter);
        // update the chart
        return newData;
    };


}(window.v = window.v || {}));
