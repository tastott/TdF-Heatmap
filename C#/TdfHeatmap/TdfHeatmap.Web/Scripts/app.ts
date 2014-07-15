///<reference path="require/require.d.ts" />
import $ = require('jquery')
import heatmap = require('draw-heatmap')

//var funcText =
//    'var Input = 1;\
//     Input * (2.6 - );';

//var output = eval(funcText);
//alert(output);


function ToHeatmapData(towns) {

    var max = 0;

    var data = towns
        .filter(town => town.Location)
        .map(town => {
            max = Math.max(max, town.Stages.length);
            return {
                lat: town.Location.Latitude,
                lng: town.Location.Longitude,
                count: town.Stages.length
            };
        });

    return {
        max: max,
        data: data
    };
}

require(['json!towns.json'], (towns) => {

    var heatmapData = ToHeatmapData(towns);
    heatmap.draw(heatmapData);
});