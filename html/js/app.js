var app = {
	state: {
		width: null,
		height: null,
		mobile: null,
		ios: ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false ),
		ios7: ( navigator.userAgent.match(/OS 7_/g) ? true : false ),
		ipad: ( navigator.userAgent.match(/(iPad)/g) ? true : false )
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
				objOruFilter.init(function(err){
					//JT: this needs to become much simpler....
					if(err != null) cb(err)
					else cb();
				});
			},
			initMru: function(cb){
				objMruFilter.init(function(err){
					//JT: this needs to become much simpler....
					if(err != null) cb(err)
					else cb();	
				});
			}				
		},function(err, results){
			if(err != null){
				//debugger;
				objError.handleError('app.start', err);
				//objLogin.show();	
			}else{
				objLogin.hide();
				objMap.updatemap();		
				//TODO: add logic to show bookmarks, filter or messages
				objFilter.show();
				objLogin.showupdatemessages();
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
		objTrendGraph.init();
		objLoading.init();

		//change the settings for the zoom/pan based on the device
		if(self.state.ios){
			objZoomPanSettings.dragtimerdelay=800;
			objZoomPanSettings.touchtimerdelay=300;
		}

		//retrieve snapshot id
		objLogin.getsnapshotconfig(function(){
			//if(objLogin.loggedin()){
				self.start();
			//}	
		});
	}
}

app.init();