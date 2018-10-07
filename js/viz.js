(function(v) {
    'use strict';

    // MARGIN CONVENTION *************************************************************
    // BOUNDING CONTAINER
    var chartHolder = d3.select('.chart');
    var boundRect = chartHolder.node().getBoundingClientRect();
    // MARGINS
    var margin = {top:20, right:10, bottom:20, left:50};
    // define 'width' and 'height' as inner dimensions of chart area
    var width = boundRect.width - margin.left - margin.right,
        height = boundRect.height - margin.top - margin.bottom;
    // define 'svg' as a 'g' element that translates the origin to the
    // top-left corner of the chart area
    var svg = chartHolder.append('svg')
                    .attr('width', width+margin.left+margin.right)
                    .attr('height', height+margin.top+margin.bottom)
                .append('g')
                    .attr('transform', 'translate('+margin.left+','+margin.top+')');





    // INITIALISE VISUAL DEPENDENCIES *********************************************************

    // KEY FUNCTION (when binding data)
    var keyfunc = function(d) { return d.key; };

    // STACK METHOD
    var stack = d3.stack();
                    // .order(d3.stackOrderInsideOut);
                    // .order(v.MAIN_CATS);


    // SCALE FUNCTIONS
    var xScale = d3.scaleOrdinal()
                    .range(d3.range(0, width, width/13));

    var yScale = d3.scaleLinear()
                    .range([height, 0]);

    // AXES FUNCTIONS
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    // AREA GENERATOR
    var area = d3.area()
                    .curve(d3.curveNatural)
                    .curve(d3.curveMonotoneX)
                    .x(function(d) { return xScale(d.data.age_grp); })
                    .y0(function(d) { return yScale(d[0]); })
                    .y1(function(d) { return yScale(d[1]); });

    // DIFFERENT CHARTS
    // General Chart
    var generalChart = svg.append('g')
                            .attr('class', 'chart__general');
    var specificChart = svg.append('g')
                            .attr('class', 'chart__specific')
                            ;

    // AXES GROUPS
    var xAxisG = svg.append('g')
                    .attr('class', 'chart__axis chart__axis--x')
                    .attr('transform', 'translate(0,' + height + ')');

    var yAxisG = svg.append('g')
                    .attr('class', 'chart__axis chart__axis--y');



    // INITIALISE CHART FUNCTION *****************************************************************
    // Receives Stacked Data to update the Stacked Chart
    v.initViz = function(data) {
        // Finish initialising visual dependencies (that depend on data)
        // STACK METHOD
        stack.keys(v.MAIN_CATS)
                .value(function value(d, key) {
                    return d[key];
                });
        // stack the data
        var series = stack(data);

        // var categories = [];
        // for (var i=0; i<series.length; i++) {
        //     var c = series[i];
        //     categories[c.index] = c.key;
        // }
        // console.log(categories);


        // SCALES
        xScale.domain(data.map(function(d) { return d.age_grp; }));

        yScale.domain([
            0,
            // calculate the stacked column with the largest value

            d3.max(data, function(d) {
                return d3.sum(v.MAIN_CATS, function(k) {
                    return d[k];
                });
            })

        ]);


        // CREATE THE AREAS!
        generalChart.selectAll('path')
            .data(series, keyfunc)
            .enter()
            .append('path')
            .attr('class', 'chart__area')
            .attr('d', area)
            .attr('fill', function(d, i) {
                return v.COLORS[i];
            })
            // on click, filter out all the other areas,
            // and reveal the sub-categories within
            .on('click', function(d) {
                // category that was clicked
                var category = d.key;
                v.categoryFilter = category;
                // updates chart
                v.updateViz(v.onDataChange());
                // switches to the detailed view
                v.detailedViz();
            });


        // CREATE THE AXES
        xAxisG.call(xAxis);
        yAxisG.call(yAxis);



    };


    // UPDATE CHART FUNCTION ***************************************************************
    // Function that updates the chart whenever there is a data change
    // Takes Stacked Data as input
    v.updateViz = function(data) {
        // STACK METHOD
        stack.keys(v.MAIN_CATS)
                .value(function value(d, key) {
                    return d[key];
                });

        // stack the data
        var series = stack(data);



        // Bind the new data to the paths
        var paths = generalChart.selectAll('path')
                                .data(series, keyfunc);

        // Flattens out the filtered categories
        var areaTransitions = paths.transition()
                                    .duration(1000)
                                    .attr('d', area);

        // Update scale for selected CAtegory
        yScale.domain([
            0,
            // calculate the stacked column with the largest value

            d3.max(data, function(d) {
                return d3.sum(v.MAIN_CATS, function(k) {
                    return d[k];
                });
            })

        ]);

        // Update areas again with adjusted scale
        areaTransitions.transition()
            .delay(200)
            .on('start', function() {
                // Transition axis to new scale concurrently
                yAxisG.transition()
                        .duration(1000)
                        .call(yAxis);
            })
            .duration(1000)
            .attr('d', area);


    };


    // ************************************************************************************
    // Function that transitions to the detailed view
    // Takes in as inputs
    // 1. current Stacked Data
    // 2. Selected Category
    v.detailedViz = function(data, category) {


    };




    // RESIZE?? *****************************************************************************

}(window.v = window.v || {}));
