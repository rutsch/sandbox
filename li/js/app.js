var app = {
	state: {
		signedin: false,
		token: null,
		current_mru: null,
		current_oru: null,
		current_sector: null,
		current_region: null
	},
	start: function(){
		//load base data for filters etc
		
		//set values for opening state of map (check localstorage ro get default from config)

		//update map
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
		//init elements
		objMruFilter.init();
		
		//check logged in?
		if(objLogin.checkloggedin()){
			//when signed in
			self.start();
		}else{
			//show login panel
			objLogin.show();
		}
	}
}

app.init();