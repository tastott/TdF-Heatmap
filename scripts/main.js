$(document).ready(function(){
	
	getTdfTowns('http://www.letour.fr/HISTO/us/TDF/villes.html', function(towns){
		alert(towns.length);
	})


});

function getTdfTowns(url, callback){
	$.ajax({
	    url: url,
	    type: 'GET',
	    success: function(response) {
	        var towns = $(response.responseText)
				        	.find('li.ville > a')
				        	.map(function(i, a){
				        		return {
				        			name: a.text,
				        			url: a.href
				        		}		
				        	})
				        	.toArray();

        	callback(towns);
	    }
	});
}