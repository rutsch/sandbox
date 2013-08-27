var objMruFilter = {
	state: {
		selectedregion: null,
		tweening: null
	},
	el: {
		mrufilter: null
	},
	/*
	 * Data functions
	 */
	getmruhtml: function(cb){
		
	},
	getdefaultmru: function(){
		return objStore.getlocalstorageitem('last_mru') || objConfig.defaultmru;
	},
	/*
	 * UI functions
	 */
	preparehtml: function(){
		
	},
	selectmru: function(strMru){
		var self = this;
		self.state.selectedregion = strMru;
		self.showlevel(strMru);
		objMap.updatemap();
	},
	showlevel: function(strMru){
		var self = this;
	},
	init: function(){
		var self = this;
		self.state.tweening = false;
		
		self.preparehtml();
		self.state.selectedregion = this.getdefaultmru();
		self.selectmru(self.getdefaultmru());
	}
}