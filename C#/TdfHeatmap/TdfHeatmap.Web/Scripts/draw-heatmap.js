define(['jquery', 'heatmap-gmaps', 'async!http://maps.google.com/maps/api/js?sensor=false'], function ($, HeatmapOverlay) {

    return {
        draw: function (data) {
            var myLatlng = new google.maps.LatLng(48.3333, 16.35);

            var myOptions = {
                zoom: 3,
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
                "radius": 20,
                "visible": true,
                "opacity": 60
            });


            // this is important, because if you set the data set too early, the latlng/pixel projection doesn't work
            google.maps.event.addListenerOnce(map, "idle", function () {
                heatmap.setDataSet(data);
            });
        }
    }
});