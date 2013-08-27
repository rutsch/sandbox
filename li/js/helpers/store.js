var objStore = {
	store: null,
	findfavourites: function(){
		var arrResult = [];
	    for (var i = 0; i < objStore.store.length; i++){
	        var key = localStorage.key(i);
	        if(key.indexOf('fav_') > -1 ){
	        	arrResult.push(objStore.store.getItem(key));
	        }
	    }     	
	    return arrResult;
	},
	setlocalstorageitem: function(key, value){
		objStore.store.setItem(key, value);
	},
	getlocalstorageitem: function(key){
		objStore.store.getItem(key);
	},
	removelocalstorageitem: function(key){
		objStore.store.removeItem(key);    
	},
	init: function(){
		objStore.store = window.localStorage;
	}
}