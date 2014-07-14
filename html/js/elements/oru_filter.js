var objOruFilter = {
	json: null,
	state: {
		selectedoru: null, // detail of the map (1, 2, 3, 4) - replaced with objPageState.state.filter.orulevel
		selectedoruguid: null // the selected country/region - replaced with objPageState.state.filter.oru
	},
	el: {
		mrufilter: null
	},
	//TODO - where is the below used??
	getdefaultoru: function () {
		return objStore.getlocalstorageitem('last_oru') || objConfig.defaultoru;
	},
	getregionnamebyid: function (regionId) {
		var self = this;

		//console.log(regionId);
		//console.trace();
		//console.log(iterate(self.json, 'guid', regionId))
		var result = iterate(self.json, 'guid', regionId).name;

		//JT: stupid fix for now to get the map up and running with a typo in the metadata id
		if (result == null) {
			var regionIdNew = '';
			if (regionId == 'cantral-east_europe') regionIdNew = 'central-east_europe';
			if (regionId == 'central-east_europe') regionIdNew = 'cantral-east_europe';
			result = iterate(self.json, 'guid', regionIdNew).name;
		}

		//reset the object defined in utils.js
		returnObj = {};

		return result;
	},
	/*
	* UI functions
	*/
	selectoru: function (el, strOru) {
		var self = this;
		self.el.wrapper = getEl('oru_filter_container');
		//remove all selected classes
		var arrAllLi = self.el.wrapper.getElementsByTagName('div');
		for (var a = 0; a < arrAllLi.length; a++) {
			arrAllLi[a].className = '';
		}
		el.className = 'selected';
		self.state.selectedoru = strOru;
		objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());
		objFilter.blink();
		//objMap.updatemap();
	},
	settocurrentoru: function () {
		var self = this;
		//debugger;
	},
	init: function (cb) {
		var self = this;
		self.state.selectedoru = this.getdefaultoru();
		self.el.wrapper = getEl('oru_filter_container');
	}
}