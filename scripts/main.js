$(document).ready(function(){
	
	getTdfTowns('http://www.letour.fr', 'HISTO/us/TDF/villes.html', function(towns){
		writeTownsJson(towns);
		
		towns = towns.slice(0,  10);

		getStagesForTowns(towns, function(){
			getLocationsForTowns(towns, function(){
				var data = toHeatmapData(towns);
				drawHeatmap(data);
			});
		});

		
	});


});

function writeTownsJson(towns){
	var json = JSON.stringify(towns);
	$('#json-text-area').text(json);
}

function forEachAsync(items, itemAction, allDoneCallback, pause){
	if(items.length == 0) allDoneCallback();
	
	var index = 0;

	var doNext = function(){
		itemAction(items[index], function(){
			if(index == items.length - 1) allDoneCallback();
			else {
				++index;
				if(pause) setTimeout(doNext, pause);
				else doNext();
			}
		}, index)
	};

	doNext();
}

function setProgress(current, total){
	$('#progress').attr('value', current / total);
}

function getHtml(url, callback){
	$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(response) {
	        callback(response.responseText);
	    }
	});
}

function getTdfTowns(domain, url, callback){
	console.log('Getting towns from ' + url + '...');
	getHtml(domain + '/' + url, function(html){
		var towns = $(html)
			        	.find('li.ville > a')
			        	.map(function(i, a){
			        		return {
			        			name: a.text,
			        			url: domain + a.href.substring(7, a.href.length),
								location: null,
								stageCount: 0
			        		}		
			        	})
			        	.toArray();
		console.log('Got towns')	        	
    	callback(towns);
	});
}

function getStagesForTowns(towns, callback){

	console.log('Getting stages for ' + towns.length + ' towns...');
	
	forEachAsync(towns, function(town, townCallback, i){
		getStagesForTown(town.url, function(stages){
			town.stageCount = stages.length;
			setProgress(i + 1, towns.length);
			townCallback();
		});
	}, function(){
		console.log('Got stages for ' + towns.length + ' towns');
		callback();
	});

}

function getStagesForTown(url, callback){
	console.log('Getting stages for town ' + url + '...');
	getHtml(url, function(html){
		var stages = $(html).find('table.liste')
							.find('tr')
							.map(function(i, tr){
								return {
									index: i
								};
							})
							.toArray();
		stages = stages.slice(1, stages.length);

		console.log('Got stages for town ' + url);
		callback(stages);
	})
}

function getLocationsForTowns(towns, callback){

	console.log('Getting locations for ' + towns.length + ' towns...');
	var geocoder = new google.maps.Geocoder();

	forEachAsync(towns, function(town, townCallback, i){
		
		geocoder.geocode( { 'address': town.name}, function(results, status) {
			if(results && results.length){
				console.log('Got location for ' + town.name);
				town.location = results[0].geometry.location;
				town.allLocationResults = results;
				setProgress(i + 1, towns.length);
			} else {
				console.log('Failed to get location for ' + town.name + '. Status: ' + status);
			}

			townCallback();
		});
	
	}, function(){
		console.log('Got locations for ' + towns.length + ' towns');
		callback();
	}, 750);

}

function toHeatmapData(towns){

	var max = 0;

	var data = towns
				.filter(function(town){return town.location;})
				.map(function(town){
					max = Math.max(max, town.stageCount);
					return {
						lat: town.location.lat(),
						lng: town.location.lng(),
						count: town.stageCount
					};
				});

	return {
		max: max,
		data: data
	};
}

function drawHeatmap(data){
	 
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
        "radius":20,
        "visible":true, 
        "opacity":60
    });
  
    
    // this is important, because if you set the data set too early, the latlng/pixel projection doesn't work
    google.maps.event.addListenerOnce(map, "idle", function(){
        heatmap.setDataSet(data);
    });

}