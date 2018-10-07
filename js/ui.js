(function(v) {
    'use strict';

    // UI FLAGS
    v.genderFilter = 'None';
    // v.valueFilter = 'True';
    v.categoryFilter = 'None';

    // // GENDER FILTER BUTTONS
    // var genderButtons = d3.selectAll('.ui__gender input');
    // genderButtons.on('change', function() {
    //     var value = d3.select(this).attr('value');
    //     v.genderFilter = value;
    //
    //     v.updateViz(v.updateChartData());
    // });
    //
    // // VALUE BUTTONS
    // // var valueButtons = d3.selectAll('.ui__value input');
    // // valueButtons.on('change', function() {
    // //     var value = d3.select(this).attr('value');
    // //     v.valueFilter = value;
    // //
    // //     v.updateViz(v.onDataChange());
    // // });
    //
    //
    // // INITIALISE SPECIFIC CATEGORIES WINDOW *****************************************************
    // var specificWindow = d3.select('.ui__specific');
    //
    // var specificCats = specificWindow.selectAll('div')
    //                                     .data(v.MAIN_CATS)
    //                                     .enter()
    //                                     .append('div');
    //
    // specificCats.append('input')
    //             .attr('type', 'radio')
    //             .attr('name', 'view')
    //             .attr('id', function(d) { return 'view' + d.replace(/\s/g,''); }) // remove whitespace
    //             .attr('value', function(d) { return d; });
    // specificCats.append('label')
    //                 .attr('for', function(d) { return 'view' + d.replace(/\s/g,''); })
    //             // .append('span')
    //                 .text(function(d) { return d; });
    //
    // // VIEW BUTTONS *******************************************************************************
    // var mainSpecificButton = d3.select('.ui__specific-window input');
    // // Specific Buttons
    // var specificButtons = d3.selectAll('.ui__specific input');
    // specificButtons.on('change', function() {
    //     var value = d3.select(this).attr('value');
    //     // update filter
    //     v.categoryFilter = value;
    //
    //     // Check the main specific button
    //     mainSpecificButton.attr('checked', 'checked');
    //
    //     v.updateViz(v.updateChartData());
    // });
    // // General Button
    // var generalButton = d3.select('.ui__view input');
    // generalButton.on('change', function() {
    //     var value = d3.select(this).attr('value');
    //     // update filter
    //     v.categoryFilter = value;
    //
    //     // Uncheck the mian specific button
    //     mainSpecificButton.attr('checked', null);
    //
    //     v.updateViz(v.updateChartData());
    // });






    // INITIALISE CATEGORIES FOR SELECT INPUT **********************************************
    var selectCat = d3.select('.ui__cat');
    selectCat.selectAll('option')
                .data(v.MAIN_CATS)
                .enter()
                .append('option')
                .attr('value', function(d) { return d; })
                .text(function(d) { return d; });
    selectCat.insert('option', ':first-child')
                .attr('value', 'None')
                .text('All')
                .attr('selected', 'selected');


    // SELECT INPUT INTERACTIONS ****************************************************************

    var selectGender = d3.select('.ui__gender');
    selectGender.on('change', function() {
        var value = d3.select(this).property('value');

        v.genderFilter = value;

        v.onInputChange();
    });

    selectCat.on('change', function() {
        var value = d3.select(this).property('value');

        v.categoryFilter = value;

        v.onInputChange();

    });








}(window.v = window.v || {}));
