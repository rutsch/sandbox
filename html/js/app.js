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
		objStore.removelocalstorageitem('token');
		location.reload();
		//objLogin.logout();
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
				//objFilter.show();
				var usedAppBefore = objStore.getlocalstorageitem('usedAppBefore');
				if(usedAppBefore){
					objLogin.showupdatemessages();	
				}else{
					objFirstLogin.show();
							
				}
			}
		});			
	},
	init: function(){
		var self = this;

		//load the main content in the wrapper
		getEl('content_outer_wrapper').innerHTML=serverSideRequest({url: objConfig.urls.base+'/data/body_content.html', method: 'get', debug: false});

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
		objFirstLogin.init();

		//change the settings for the zoom/pan based on the device
		if(self.state.ios){
			objZoomPanSettings.dragtimerdelay=800;
			objZoomPanSettings.touchtimerdelay=300;
			
			//for status/carrier bar issue
			if(self.state.ios7){
				getEl('title_bar').style.height="65px";
				getEl('info').style.top="10px";
				getEl('btn_back').style.top="10px";
				getEl('toggle_favourite').style.top="10px";
			}
		}

		//retrieve snapshot id
		objLogin.getsnapshotconfig(function(){
			//if(objLogin.loggedin()){
				self.start();
			//}	
		});
	}
}