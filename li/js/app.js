var app = {
	state: {
		width: null,
		height: null,
		mobile: null
	},
	el: {
		
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
	isMobile: {
		any : function() {
			return 'ontouchstart' in document.documentElement;
		}
	},
	start: function(){
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
			if(err){
				objLogin.show();	
			}else{
				objLogin.hide();
				objMap.updatemap();				
			}
		});			
				
	},
	init: function(){
		var self = this;
		self.state.width = document.body.clientWidth;
		self.state.height = document.documentElement["clientHeight"];
		self.state.mobile = self.isMobile.any();
		
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

		//retrieve snapshot id
		objLogin.getsnapshotconfig();

		if(objLogin.loggedin()){
			self.start();
		}

	}
}

app.init();