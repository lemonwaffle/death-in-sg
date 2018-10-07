(function(v) {
    'use strict';

    // UI FLAGS
    v.genderFilter = 'None';
    v.valueFilter = 'True';
    v.categoryFilter = 'None';

    // GENDER FILTER BUTTONS
    var genderButtons = d3.selectAll('.ui__gender input');
    genderButtons.on('change', function() {
        var value = d3.select(this).attr('value');
        v.genderFilter = value;

        v.updateViz(v.onDataChange());
    });

    // VALUE BUTTONS
    var valueButtons = d3.selectAll('.ui__value input');
    valueButtons.on('change', function() {
        var value = d3.select(this).attr('value');
        v.valueFilter = value;

        v.updateViz(v.onDataChange());
    });



}(window.v = window.v || {}));
