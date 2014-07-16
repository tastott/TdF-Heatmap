///<reference path="typings/google.maps.d.ts" />
define(["require", "exports", 'jquery', 'heatmap-gmaps'], function(require, exports, $, HeatmapOverlay) {
    function ToHeatmapData(towns) {
        var max = 0;

        var data = towns.filter(function (town) {
            return town.Location;
        }).map(function (town) {
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

    function Draw(towns) {
        require(['async!google-maps'], function () {
            var markerMinZoom = 8;

            var heatmapData = ToHeatmapData(towns);

            var myLatlng = new google.maps.LatLng(48.8567, 2.3508);

            var myOptions = {
                zoom: 5,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: false,
                scrollwheel: true,
                draggable: true,
                navigationControl: true,
                mapTypeControl: false,
                scaleControl: true,
                disableDoubleClickZoom: false
            };
            var map = new google.maps.Map($("#heatmap")[0], myOptions);

            var heatmap = new HeatmapOverlay(map, {
                "radius": 30,
                "visible": true,
                "opacity": 60
            });

            var markers = [];

            //Show/hide markers depending on zoom level
            google.maps.event.addListener(map, 'zoom_changed', function () {
                var zoom = map.getZoom();

                var heatMapRadius = zoom * 7;
                heatmap.setRadius(heatMapRadius);

                for (var i = 0; i < markers.length; i++) {
                    markers[i].setVisible(zoom >= markerMinZoom);
                }
            });

            // this is important, because if you set the data set too early, the latlng/pixel projection doesn't work
            google.maps.event.addListenerOnce(map, "idle", function () {
                heatmap.setDataSet(heatmapData);

                //Add marker for each town
                towns.forEach(function (town) {
                    var latlng = new google.maps.LatLng(town.Location.Latitude, town.Location.Longitude);

                    // To add the marker to the map, use the 'map' property
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: town.Name
                    });

                    marker.setVisible(map.getZoom() >= markerMinZoom);

                    markers.push(marker);
                });
            });
        });
    }
    exports.Draw = Draw;
});
//# sourceMappingURL=draw-heatmap.js.map
