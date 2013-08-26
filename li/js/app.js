var app = {
	state: {
		signedin: false,
		token: null,
		current_mru: null,
		current_oru: null,
		current_sector: null,
		current_region: null
	}
	init: function(){
		//init panels
		objMap.init();
		objFooter.init();
		objHeader.init();
		objOverlay.init();
		objRegionInfo.init();
		objSliders.init();
		//check login
			//when signed in
			//load base data for filters etc
			
			//set values for opening state of map (check localstorage ro get default from config)
			
			//update map
			objMap.updatemap();
	}
}

app.init();