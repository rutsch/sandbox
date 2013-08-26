var store = {
	findfavourites: function(){
		var arrResult = [];
	    for (var i = 0; i < store.length; i++){
	        var key = localStorage.key(i);
	        if(key.indexOf('fav_') > -1 ){
	        	arrResult.push(store.getItem(key));
	        }
	    }     	
	    return arrResult;
	}
}