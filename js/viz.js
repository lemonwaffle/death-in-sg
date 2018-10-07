(function(v) {
    'use strict';

    // MARGIN CONVENTION *************************************************************
    // BOUNDING CONTAINER
    var chartHolder = d3.select('.chart');
    var boundRect = chartHolder.node().getBoundingClientRect();
    // MARGINS
    var margin = {top:20, right:40, bottom:20, left:50};
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
    var stack = d3.stack()
                    .keys(v.MAIN_CATS)
                    .value(function value(d, key) {
                        return d[key];
                    });
                    // .order(d3.stackOrderInsideOut);
    var specificStack = d3.stack()
                            .value(function value(d, key) {
                                return d[key];
                            })
                            .order(d3.stackOrderDescending);

    // SCALE FUNCTIONS

    var calculateXRange = function(width) {
        var x = width/17;
        var xRange = [];

        var increValues = [2, 4, 6, 8, 10];
        var skipValues = [3, 5, 7, 9, 11];

        for (var i=0; i<18; i++) {
            if (increValues.indexOf(i) > -1) {
                xRange.push(x*i + x*0.5);

            } else if (skipValues.indexOf(i) > -1) {
                continue;

            } else {
                xRange.push(x*i);
            }
        }

        return xRange;
    };

    var xScale = d3.scaleOrdinal()
                    .range(calculateXRange(width));

    var yScale = d3.scaleLinear()
                    .range([height, 0]);

    // COLOR FUNCTION
    var colorScale = d3.scaleSequential(d3.interpolateCubehelixDefault);


    // AXES FUNCTIONS
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft()
                    .scale(yScale)
                    // horizontal grid lines
                    .tickSize(-width)
                    // format to percentage
                    .tickFormat(function(d) { return d+'%'; });
    var yAxisF = function(g) {
        g.call(yAxis);
        g.selectAll('.tick text').attr('x', -10);
    };

    // AXES GROUPS
    var xAxisG = svg.append('g')
                    .attr('class', 'chart__axis chart__axis--x')
                    .attr('transform', 'translate(0,' + height + ')');

    var yAxisG = svg.append('g')
                    .attr('class', 'chart__axis chart__axis--y');

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
                            .attr('class', 'chart__specific');

    // overlay for specific chart
    var overlay = svg.append('rect')
                        .attr('height', height)
                        .attr('width', width)
                        .attr('fill', 'none')
                        .style('pointer-events', 'all')
                        .style('display', 'none');


    // TOOLTIP ELEMENTS
    var tooltip = d3.select('.chart__tooltip');

    var tooltipLine = svg.append('line')
                            .attr('y1', 0)
                            .attr('y2', height)
                            .attr('stroke-width', 1)
                            .attr('stroke', '#d9e2cf')
                            .attr('opacity', 0);

    // FORMAT FUNCTIONS
    var percentFormat = d3.format('.1%'); // % with one-decimal point


    // TRANSITION THINGUMS
    var DURATION = 700;
    var DELAY = 200;





    // INITIALISE CHART FUNCTION *****************************************************************
    // Receives Stacked Data to Initialise the Stacked Area Chart
    v.initViz = function(data) {
        // Finish initialising visual dependencies (that depend on data)

        // Render the Series Data
        var series = stack(data);

        console.log('Series Data Object:');
        console.log(series);

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
                return v.COLORS[d.key];
            })
            .attr('stroke', function(d, i) {
                return v.COLORS[d.key];
            })
            // .attr('stroke', 'white')
            // .attr('fill', function(d, i) {
            //     // console.log('rgb' + v.COLORS[i]);
            //     return v.COLORS[i];
            // })
            // .attr('stroke', function(d, i) {
            //     return v.COLORS[i];
            // })
            .attr('stroke-width', 2)
            // .attr('fill-opacity', 0.5)
            // on click, filter out all the other areas,
            // and reveal the sub-categories within
            // .on('click', function(d) {
            //     // category that was clicked
            //     var category = d.key;
            //     v.categoryFilter = category;
            //     // updates chart
            //     v.updateViz(v.updateChartData());
            // })
            // TOOLTIPS SHEANENIGIANS **************************
            .on('mouseout', function() {
                tooltipLine.attr('opacity', 0);
                tooltip.style('opacity', 0);
            })
            .on('mouseover', function() {
                tooltipLine.attr('opacity', 1);
                tooltip.style('opacity', 1.0);
            })
            .on('mousemove', mousemoveGeneral);

            // svg.on('mouseout', function() {
            //     tooltipLine.attr('opacity', 0);
            //     tooltip.style('opacity', 0);
            // });




        // CREATE THE AXES
        xAxisG.call(xAxis);
        yAxisG.call(yAxisF);

        // TEST
        // console.log(xScale.invert(100));

    };


    // UPDATE CHART FUNCTION ***************************************************************************
    // with any neccessary transitions
    v.updateViz = function(data) {
        // stack the data
        var series = stack(data);

        console.log('Series Data Object:');
        console.log(series);

        // Bind the new data to the paths
        var paths = generalChart.selectAll('path')
                                .data(series, keyfunc);


        // Flattens out the filtered categories
        var areaTransitions = paths.transition()
                                    .duration(DURATION)
                                    .attr('d', area)
                                    .attr('stroke', function(d) {
                                        if (v.categoryFilter=='None') {
                                            return v.COLORS[d.key];
                                        } else {
                                            return v.COLORS[v.categoryFilter];
                                        }
                                    });

        // Change the stroke


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
            .delay(DELAY)
            .on('start', function() {
                // Transition axis to new scale concurrently
                yAxisG.transition()
                        .duration(DURATION)
                        .call(yAxisF);
            })
            .duration(DURATION)
            .attr('d', area);

    };


    // SPECIFIC CHART **********************************************************************
    v.initSpecificViz = function(data) {
        console.log('Data for Specific Viz ************');
        console.log(data);
        // Keys of the Dataset
        var keys = Object.keys(data[0]).filter(function(d) { return d!=='age_grp'; });
        // Activate the Stack Function
        specificStack.keys(keys);
        // Render the Series Data
        var series = specificStack(data);

        // CREATE THE AREAS
        specificChart.selectAll('path')
                        .data(series)
                        .enter()
                        .append('path')
                            .attr('d', area)
                            .attr('fill', d3.color(v.COLORS[v.categoryFilter]).darker(2))
                            .attr('stroke', v.COLORS[v.categoryFilter])
                            .attr('stroke-width', 1)
                            .attr('opacity', 0)
                        .transition()
                            .duration(DURATION)
                            .delay(DURATION*2 + DELAY)
                            .attr('opacity', 1);
        // Tooltip Interactions
        // specificChart
        overlay.style('display', null)
                .datum(data)
                .on('mouseout', function() {
                                    tooltipLine.attr('opacity', 0);
                                    tooltip.style('opacity', 0);
                                })
                                .on('mouseover', function() {
                                    tooltipLine.attr('opacity', 1);
                                    tooltip.style('opacity', 1.0);
                                })
                                .on('mousemove', mousemoveSpecific);


    };



    // TOOLTIP FUNCTION ********************************************************************
    // Shows information pertaining to mouse-overed category area
    // var mousemove = function(d) {
    //     var cat = d.key;
    //     // find mouse position
    //     var mouseX = d3.mouse(this)[0];
    //     var mouseY = d3.mouse(this)[1];
    //     // find nearest scale position
    //     var range = xScale.range();
    //     var xi = d3.bisectLeft(range, mouseX);
    //     var x0 = range[xi-1];
    //     var x1 = range[xi];
    //     var midX = ((x1-x0)/2) + x0;
    //
    //     xi = mouseX > midX ? xi : xi-1;
    //
    //     var x = range[xi];
    //
    //     // get data value
    //     var value = percentFormat(d[xi].data[cat]/100);
    //
    //
    //     // UPDATE TOOLTIP
    //     tooltip.style('top', mouseY+'px')
    //             .transition()
    //             .duration(100)
    //             .ease(d3.easeLinear)
    //             .style('left', function() {
    //                 var posX;
    //                 if (mouseX > width/2) {
    //                     posX = x - 70;
    //                 } else {
    //                     posX = x + 70;
    //                 }
    //                 return posX + 'px';
    //             });
    //     tooltip.select('.tooltip__header')
    //             .text(cat);
    //     tooltip.select('.tooltip__value')
    //             .text(value);
    //
    //
    //     // UPDATE LINE
    //     // tooltipLine.call(swiftTransition);
    //     tooltipLine
    //                 .transition()
    //                 .duration(50)
    //                 .ease(d3.easeLinear)
    //                 .attr('x1', x)
    //                 .attr('x2', x);
    // };


    // Shows information pertaining to all categories
    var mousemoveGeneral = function(d) {
        // category hovered over
        var cat = d.key;
        // find mouse position
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        // find nearest scale position
        var range = xScale.range();
        var xi = d3.bisectLeft(range, mouseX);
        var x0 = range[xi-1];
        var x1 = range[xi];
        var midX = ((x1-x0)/2) + x0;

        xi = mouseX > midX ? xi : xi-1;
        // x position of tooltip
        var x = range[xi];

        // data object in question
        // An array of [cat, value] pairs, sorted in descending order
        var data = Object.entries(d[xi].data)
                        .filter(function(d) {
                            return d[0] != 'age_grp';
                        })
                        .sort(function(a, b) {
                            return b[1] - a[1];
                        });
        var age_grp = d[xi].data.age_grp;


        // Update Tooltip Line Position
        tooltipLine
            .transition()
            .duration(50)
            .ease(d3.easeLinear)
            .attr('x1', x)
            .attr('x2', x);


        // Update Tooltip Position
        tooltip.style('top', '100px')
                .transition()
                .duration(100)
                .ease(d3.easeLinear)
                .style('left', function() {
                    var posX;
                    if (mouseX > width/2) {
                        posX = x - 150;
                    } else {
                        posX = x + 70;
                    }
                    return posX + 'px';
                });
        // Update Tooltip Text
        tooltip.selectAll('div').remove();
        tooltip.select('.tooltip__header')
                .text(age_grp);
        var tooltipCats = tooltip.selectAll('div')
                                    .data(data)
                                    .enter()
                                    .append('div');
                                    // .style('background-color', function(d) {
                                    //     if (d[0] == cat) {
                                    //         return v.COLORS[cat];
                                    //     } else {
                                    //         return 'None';
                                    //     }
                                    // });
        tooltipCats.append('p')
                    .attr('class', 'tooltip__cat')
                    .text(function(d) { return d[0]; });
        tooltipCats.append('p')
                    .attr('class', 'tooltip__value')
                    // color text according to cat
                    // .style('color', function(d) { return v.COLORS[d[0]]; })
                    .text(function(d) { return percentFormat(d[1]/100); });

    };


    // Shows information pertaining to categories in Specific View
    // Takes as input the current working stacked dataset
    var mousemoveSpecific = function(data) {
        // find mouse position
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];
        // find nearest scale position
        var range = xScale.range();
        var xi = d3.bisectLeft(range, mouseX);
        var x0 = range[xi-1];
        var x1 = range[xi];
        var midX = ((x1-x0)/2) + x0;

        xi = mouseX > midX ? xi : xi-1;
        // x position of tooltip
        var x = range[xi];

        // age group
        var ageGrp = data[xi].age_grp;
        // data object in question
        var dataset = Object.entries(data[xi])
                        .filter(function(d) { return d[0] !== 'age_grp'; })
                        .sort(function(a, b) { return b[1] - a[1]; });


        // Update Tooltip Line Position
        tooltipLine
            .transition()
            .duration(50)
            .ease(d3.easeLinear)
            .attr('x1', x)
            .attr('x2', x);

        // Update Tooltip Position
        tooltip.style('top', '100px')
                .transition()
                .duration(100)
                .ease(d3.easeLinear)
                .style('left', function() {
                    var posX;
                    if (mouseX > width/2) {
                        posX = x - 150;
                    } else {
                        posX = x + 70;
                    }
                    return posX + 'px';
                });

        // Update Tooltip Text
        tooltip.selectAll('div').remove();
        tooltip.select('.tooltip__header')
                .text(ageGrp);
        var tooltipCats = tooltip.selectAll('div')
                                    .data(dataset)
                                    .enter()
                                    .append('div');
                                    // .style('background-color', function(d) {
                                    //     if (d[0] == cat) {
                                    //         return v.COLORS[cat];
                                    //     } else {
                                    //         return 'None';
                                    //     }
                                    // });
        tooltipCats.append('p')
                    .attr('class', 'tooltip__cat')
                    .text(function(d) { return d[0]; });
        tooltipCats.append('p')
                    .attr('class', 'tooltip__value')
                    // color text according to cat
                    // .style('color', function(d) { return v.COLORS[d[0]]; })
                    .text(function(d) { return percentFormat(d[1]/100); });

    };


    // RESIZE?? *****************************************************************************


    // FUNCTION THAT IS CALLED WHENEVER THE INPUT IS CHANGES *************************************
    // INCLUDES ALL THE TRANSITIONS (to facilitate chaining)
    v.onInputChange = function() {
        // Get rid of specific chart first
        // check if specific chart is rendered
        // if (specificChart.selectAll('path').empty()) {
        //     // console.log('is empty! *****************');
        //     v.updateViz(v.updateChartData());
        // } else {
        //     // console.log('is not empty! ****************');
        //     specificChart.selectAll('path')
        //                     .transition()
        //                     .duration(DURATION)
        //                     .on('end', v.updateViz(v.updateChartData()))
        //                     .attr('opacity', 0)
        //                     .remove();
        //
        // }

        // specificChart.selectAll('path')
        //                 .transition()
        //                 .duration(DURATION)
        //                 .attr('opacity', 0);

        // Reset Visual Elements
        specificChart.selectAll('path').remove();
        overlay.style('display', 'none');

        v.updateViz(v.updateChartData());

        if (v.categoryFilter!=='None') {
            console.log('category selected! *****************');
            v.initSpecificViz(v.updateSpecificChartData());
        }



    };

}(window.v = window.v || {}));
