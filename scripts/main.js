$(document).ready(function(){
	
	getTdfTowns('http://www.letour.fr', 'HISTO/us/TDF/villes.html', function(towns){
		
		towns = towns.slice(0, 10);

		getStagesForTowns(towns, function(){
			getLocationsForTowns(towns, function(){
				alert(towns[0].location);
			});
		});

		
	});


});

function forEachAsync(items, itemAction, allDoneCallback){
	if(items.length == 0) allDoneCallback();
	
	var i = 0;
	items.forEach(function(item, index){
		itemAction(item, function(){
			if(++i == items.length) allDoneCallback();
		}, index);
	});
	
	
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
			        			url: domain + a.href.substring(7, a.href.length)
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
			town.StageCount = stages.length;
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
				town.location = results[0].geometry.location;
				town.allLocationResults = results;
			}
			
			setProgress(i + 1, towns.length);
			townCallback();
		});
	
	
	}, function(){
		console.log('Got locations for ' + towns.length + ' towns');
		callback();
	});

}
