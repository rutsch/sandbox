var objOruFilter = {
	state: {
		selectedoru: null
	},
	el:{
		mrufilter: null
	},
	/*
	 * Data functions
	 */
	getorujson: function(cb){
		
	},
	getdefaultoru: function(){
		return objStore.getlocalstorageitem('last_oru') || objConfig.defaultoru;
	},
	/*
	 * UI functions
	 */
	preparehtml: function(){
		
	},
	selectoru: function(strOru){
		var self = this;
		self.state.selectedoru = strOru;
		objMap.updatemap();
	},
	init: function(){
		var self = this;
		self.preparehtml();
		self.state.selectedregion = this.getdefaultoru();
		self.selectoru(self.getdefaultoru());
		debugger;
	}
}