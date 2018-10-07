// This module contains any code we might want to share among the other scripts.

(function(v) {
    'use strict';

    // ANY GLOBAL VARIABLES *************************************************************************************************

    // Main Data Object
    v.DATA = {};
    // Deaths Totals for each Age Group
    v.DEATH_TOTALS = {};
    // Death Categories
    v.DEATH_CATS = {};
    // Age Groups
    v.AGE_GRPS = [];
    // Stack Method Keys
    v.keys = [];



    // };

    v.COLORS = {
        'Cancer': '#3c2b35',
        'Circulatory': '#4d3542',
        'External': '#705c53',
        'Respiratory': '#6d7162',
        'Congenital': '#d2dcab',
        'Genitourinary': '#a5c1a5',
        'Nervous': '#587f72',
        'Birth Problems': '#235652',
        "Digestive": '#09274c',
        "Infection": '#41577f',
        "Others": '#834f59',
        "Endocrine": '#b67f82',
        "Blood": '#ffd1b5',
        "Musculoskeletal": '#eec3bf',
        "Skin": '#ddcfca',
        "Mental": '#c3a996'
    };

    // Main Death Categories
    v.MAIN_CATS = Object.getOwnPropertyNames(v.COLORS);

    // 20 Colors
    // v.COLORS = ['(31, 119, 180)', '(174, 199, 232)', '(255, 127, 14)', '(255, 187, 120)',
    //          '(44, 160, 44)', '(152, 223, 138)', '(214, 39, 40)', '(255, 152, 150)',
    //          '(148, 103, 189)', '(197, 176, 213)', '(140, 86, 75)', '(196, 156, 148)',
    //          '(227, 119, 194)', '(247, 182, 210)', '(127, 127, 127)', '(199, 199, 199)',
    //          '(188, 189, 34)', '(219, 219, 141)', '(23, 190, 207)', '(158, 218, 229)'];

//     v.COLORS = [
//      '#3c2b35',
//      '#4d3542',
//      '#705c53',
//      '#6d7162',
//      "#d2dcab",
//      "#a5c1a5",
//      "#587f72",
//      "#235652",
//      "#09274c",
//      "#41577f",
//      "#834f59",
//      "#b67f82",
//      "#ffd1b5",
//      "#eec3bf",
//      "#ddcfca",
//      "#c3a996",
// ];


    // DATA REFORMATTING FUNCTIONS ************************************************************************

    // Main Data Object:
    // Array of rows (objects)
    // {
    //     a_cat: "External",
    //     d_cat: "Accidental drowning and submersion",
    //     death_age: "00 - 04",
    //     death_count: 2,
    //     gender: "F",
    //     h_cat: "External",
    //     m_cat: "External causes of morbidity and mortality"
    // }

    // Stacked Data Object:
    // Array of objects
    // {age_grp: "00 - 04", External: 32, Blood: 6, Circulatory: 18, Birth Problems: 195, …}

    // Series Data Object:
    // Array of arrays
    // with each array corresponding to a death category.
    // [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), Array(2), key: "Cancer", index: 0]
    // each value array contains a the stacked data object (of the corresponding age grp)
    // [0, 41, data: {…}]




    // STACK DATA FUNCTION
    // stacks the data to be passed to a chart for rendering
    // data is stacked by age grp and then by specified column
    // 1. Main Data Object
    // 2. Column to be grouped by
    v.stackData = function(d, col) {
        var data = [];
        // determine the unique grouping values
        var uniqueKeys = d3.nest()
                            .key(function(d) { return d[col]; })
                            .entries(d)
                            .map(function(d) { return d.key; });
        console.log('Unique Keys:');
        console.log(uniqueKeys);

        // nests the data by age grp and then by h_cat
        var group = d3.nest()
                        .key(function(d) { return d.death_age; })
                        .key(function(d) { return d[col]; })
                        // aggregate the death count values in each group
                        .rollup(function(l) {
                            return d3.sum(l, function(d) { return d.death_count; });
                        })
                        .entries(d);

        console.log('Nested Data Object:');
        console.log(group);

        // fill in missing age groups
        // var grp = [];
        // v.AGE_GRPS.forEach(function(d) {
        //     var obj = {};
        //     obj.age_grp = d;
        //     grp.push(obj);
        // });
        // console.log(grp);

        // restructure the data into the stacked format
        for (var i=0; i<group.length; i++) {
            // create an age group object
            var grp = { age_grp: group[i].key };
            // calculate total
            // var total = 0;

            // loop through all the categories (keys)
            for (var j=0; j<group[i].values.length; j++) {
                var category = group[i].values[j];
                // create the category entry in the age group object
                grp[category.key] = category.value;
                // total += category.value;
            }
            // create a grp total property in the object
            // grp.total = total;

            // check for missing categories and fill them with 0
            for (var k=0; k<uniqueKeys.length; k++) {
                var categories = uniqueKeys[k];
                if (!grp.hasOwnProperty(categories)) {
                    grp[categories] = 0;
                }
            }

            // finally, append the object into the main data
            data.push(grp);
        }

        // fill in missing age grps
        var currentAgeGrps = data.map(function(d) { return d.age_grp; });
        v.AGE_GRPS.forEach(function(age) {
            if (currentAgeGrps.indexOf(age) == -1) {
                var grp = { age_grp: age };

                for (var k=0; k<uniqueKeys.length; k++) {
                    grp[uniqueKeys[k]] = 0;
                }

                data.push(grp);
            }
        });

        // finally sort
        data.sort(function(a, b) {
            if (a.age_grp < b.age_grp) {
                return -1;
            } else {
                return 1;
            }
        });

        console.log('Stacked Data Object:');
        console.log(data);

        return data;
    };


    // NORMIALISE STACKED DATA FUNCTION
    // Normalise the stacked data based on pre-calculated death totals
    v.normaliseStackedData = function(data) {
        for (var i=0; i<data.length; i++) {
            var obj = data[i];
            var grp = obj.age_grp;

            var keys = Object.keys(obj).filter(function(d) {
                return d!=='age_grp';
            });

            keys.forEach(function(key) {
                obj[key] /= v.DEATH_TOTALS[v.genderFilter][grp];
                obj[key] *= 100;
            });


            // for (var j=0; j<v.MAIN_CATS.length; j++) {
            //     var cat = v.MAIN_CATS[j];
            //
            //     obj[cat] /= v.DEATH_TOTALS[v.genderFilter][grp];
            //     obj[cat] *= 100;
            // }
        }

        // Access the 'total' property in each stacked object
        // for (var i=0; i<data.length; i++) {
        //     var obj = data[i];
        //
        //     for (var j=0; j<v.MAIN_CATS.length; j++) {
        //         var cat = v.MAIN_CATS[j];
        //
        //         obj[cat] /= obj.total;
        //         obj[cat] *= 100;
        //
        //     }
        // }

        console.log('Normalised Stacked Data Object:');
        console.log(data);

        return data;
    };


    // FILTER FUNCTION
    // Filters the Main Data Object
    // 1. Main Data Object
    // 2. Column Name
    // 3. Value to filter
    v.filterData = function(data, col, value) {
        if (value=='None') {
            return data;
        } else {
            var filteredData = data.filter(function(d) { return d[col] == value; });
            return filteredData;
        }
    };


    // CATEGORY FILTER FUNCTION
    // Filters the Stacked Data Object according to Death Category
    v.filterStackedData = function(data) {
        if (v.categoryFilter=='None') {
            return data;
        }

        for (var i=0; i<data.length; i++) {

            for (var j=0; j<v.MAIN_CATS.length; j++) {
                var key = v.MAIN_CATS[j];
                if (key != v.categoryFilter) {
                    data[i][key] = 0;
                }
            }
        }

        return data;
    };




    // MAIN DATA CONSOLIDATION FUNCTION *******************************************************************
    // Restructures and restacks the data whenever a flag is updated
    // Receives the Main Data Object as input
    v.updateChartData = function() {
        var mainData = v.filterData(v.DATA, 'gender', v.genderFilter);
        var stackedData = v.filterStackedData(
                          v.normaliseStackedData(
                          v.stackData(mainData, 'h_cat')));

        return stackedData;
    };

    v.updateSpecificChartData = function() {
        var mainData = v.filterData(v.DATA, 'gender', v.genderFilter);
        mainData = v.filterData(mainData, 'h_cat', v.categoryFilter);

        var stackedData = v.normaliseStackedData(
                            v.stackData(mainData, 'd_cat'));

        return stackedData;
    };


}(window.v = window.v || {}));
