var objOruFilter = {
	json: null,
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
		var objData = {
			fulldomain: location.protocol+"//"+location.hostname,
			method:'getorudata',
			type:'json',
			token: objLogin.token,
			snapshotid:1	
		}
		psv('GET', objConfig.urls.dynamicresourceurl, objData, function(data) {
			cb(null, data);
		});			
	},
	getdefaultoru: function(){
		return objStore.getlocalstorageitem('last_oru') || objConfig.defaultoru;
	},
	/*
	 * UI functions
	 */
	selectoru: function(strOru){
		var self = this;
		self.state.selectedoru = strOru;
		objMap.updatemap();
	},
	init: function(cb){
		var self = this;
		self.state.selectedoru = this.getdefaultoru();
		self.getorujson(function(err, data){
			self.json = data;
			self.selectoru(self.state.selectedoru);			
			cb();
		});		
	}
}