define(["require", "exports", 'draw-heatmap'], function(require, exports, heatmap) {
    //var funcText =
    //    'var Input = 1;\
    //     Input * (2.6 - );';
    //var output = eval(funcText);
    //alert(output);
    require(['json!towns.json'], function (towns) {
        heatmap.draw(towns.filter(function (t) {
            return t.Location;
        }));
    });
});
//# sourceMappingURL=app.js.map
