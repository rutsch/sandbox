var objOruFilter = {
	json: null,
	state: {
		selectedoru: null,
		selectedoruguid: null
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
	getregionnamebyid: function(regionId){
		var self = this;
		return iterate(self.json, 'guid', regionId).name;
	},		
	/*
	 * UI functions
	 */
	selectoru: function(el, strOru){
		var self = this;
		
		//remove all selected classes
		var arrAllLi = self.el.wrapper.getElementsByTagName('div');
		for ( var a = 0; a < arrAllLi.length; a++) {
			arrAllLi[a].className = '';
		}		
		el.className='selected';
		self.state.selectedoru = strOru;
		objFilter.blink();
		objMap.updatemap();
	},
	settocurrentoru: function(){
		var self = this;
		debugger;
	},
	init: function(cb){
		var self = this;
		self.state.selectedoru = this.getdefaultoru();
		self.el.wrapper = getEl('oru_filter_container');
		self.getorujson(function(err, data){
			if(err || data.error){
				objLogin.show();
			}else{			
				self.json = data;
				//self.selectoru(self.state.selectedoru);			
				cb();
			}
		});		
	}
}