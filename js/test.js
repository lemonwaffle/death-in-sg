// LOADING IN THE DATA **********************************************
// Main Data Object
var dataset;
var DEATH_CATS;

// Function that reformats the data for usage in our stacked area chart
var formatData = function(d) {
    // INPUT:
    // A list of objects
    // each object corresponding to a row in the dataset
    // each property is a column and its corresponding value

    // OUTPUT:
    // A list of objects
    // each object corresponding to an age group
    // properties being the various death categories (keys)
    // containing any extra information as required (counts etc.)

    dataset = [];

    // use d3.nest to first group the data by age group
    var groupbyAge = d3.nest()
                        .key(function(d) { return d.death_age; })
                        .entries(d);

    console.log(groupbyAge);



};

// Loading and Storing our Dataset
d3.queue()
    .defer(d3.json, 'data.json')
    .defer(d3.json, 'death_cat.json')
    .await(ready);

// Callback function for the 'await' method
function ready(error, data, cats) {
    // Logs any error to the console
    if (error) {
        return console.warn(error);
    }

    DEATH_CATS = cats;
    dataset = formatData(data);

}
