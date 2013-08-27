var app = {
	state: {

	},
	btnfilterclick: function(el){
		objFilter.show();
	},
	btnbookmarksclick: function(el){
		objBookmarks.show();
	},
	btnexplainclick: function(el){
		objExplain.show();
	},
	btnlogoutclick: function(el){
		objLogin.logout();
	},
	start: function(){
		objMap.updatemap();		
	},
	init: function(){
		var self = this;
		//init storage
		objStore.init();
		//init panels
		objLogin.init();
		objMap.init();
		objFooter.init();
		objHeader.init();
		objOverlay.init();
		objRegionInfo.init();
		objSliders.init();
		objError.init();
		objFilter.init();
		objBookmarks.init();
		objExplain.init();
		
		//check logged in?
		if(objLogin.loggedin()){
			//when signed in
			//init elements with async because elements require external data
			async.parallel({
				initOru: function(cb){
					objOruFilter.init(function(){
						cb();
					});
				},
				initMru: function(cb){
					objMruFilter.init(function(){
						cb();
					});
				}				
			},function(err, results){
				objLogin.hide();
				self.start();
			});			
		}else{
			//show login panel
			objLogin.show();
		}	
	}
}

app.init();