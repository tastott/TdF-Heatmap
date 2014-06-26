$(document).ready(function(){
	
	getTdfTowns('http://www.letour.fr', 'HISTO/us/TDF/villes.html', function(towns){
		
		//towns = towns.slice(0, 100);

		var i = 0;

		towns.forEach(function(town){
			getTownStages(town.url, function(stages){
				town.StageCount = stages.length;
				if(++i == towns.length){
					
					
					
				}
			});
		});

		
	});


});

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

function getTownStages(url, callback){
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