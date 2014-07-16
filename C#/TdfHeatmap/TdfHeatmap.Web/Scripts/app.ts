///<reference path="require/require.d.ts" />
import $ = require('jquery')
import heatmap = require('draw-heatmap')

//var funcText =
//    'var Input = 1;\
//     Input * (2.6 - );';

//var output = eval(funcText);
//alert(output);



require(['json!towns.json'], (towns) => {

    heatmap.draw(towns.filter(t => t.Location));
});