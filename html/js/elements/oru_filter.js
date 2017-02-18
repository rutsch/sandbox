var objOruFilter = {
	json: null,
	state: {
		selectedoru: null, // detail of the map (1, 2, 3, 4) - replaced with objPageState.state.filter.orulevel
		selectedoruguid: null // the selected country/region - replaced with objPageState.state.filter.oru
	},
	el: {
	  mrufilter: null,
    wrapper: null
	},
	//fired when the filter panel is opened - sets the state of the filter to match the filter state of the application
	setorufilterstate: function () {
		var self = this;
		console.log('bla');

		self.state.selectedoru = objPageState.state.filter.orulevel;
		var strButtonId = 'btn_country';
		switch (objPageState.state.filter.orulevel) {
			case "1":
				strButtonId = 'btn_world'
				break;
			case "2":
				strButtonId = 'btn_region'
				break;
			case "3":
				strButtonId = 'btn_bmc'
				break;
			default:
				break;
		}

		self.selectoru(getEl(strButtonId), objPageState.state.filter.orulevel, false);

		//console.log(self.getmrufilteraxisarray(objPageState.state.filter.mru))

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

		console.log(strOru);

		self.el.wrapper = getEl('oru_filter_container');
		//remove all selected classes
		// var arrAllLi = self.el.wrapper.getElementsByTagName('option');
		// console.log(arrAllLi);
		// //debugger;
		// for (var a = 0; a < arrAllLi.length; a++) {
		// 	console.log(arrAllLi[a].getAttribute('value'));
		// 	if (arrAllLi[a].getAttribute('value') === strOru) {
		// 		arrAllLi[a].setAttribute('selected', 'selected')
		// 	}
		// }
		el.className = 'selected';
		self.state.selectedoru = strOru;
		objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());
		if (arguments.length == 2) objFilter.blink();

	  // Apply the filter automatically in case of the public website
		if (isPublicSite()) objFilter.applyfilter();
		//objMap.updatemap();
	},
	settocurrentoru: function () {
		var self = this;
		// Remove all selected classes
		var arrAllLi = self.el.wrapper.getElementsByTagName('option');
		console.log(objPageState.state.filter.orulevel);

		// Debugger;
		for (var a = 0; a < arrAllLi.length; a++) {
			if (arrAllLi[a].getAttribute('value') === objPageState.state.filter.orulevel) {
				console.log(arrAllLi[a].getAttribute('value'));
				arrAllLi[a].setAttribute('selected', 'selected')
			}
		}
		//debugger;
	},
	convertoruleveltomarket: function (oruLevel) {

		switch (parseInt(oruLevel)) {
			case 1:
				return 'World';
				break;
			case 2:
				return 'Region';
				break;
			case 3:
				return 'Market';
				break;
			case 4:
				return 'Country';
				break;
			default:
				return '';
				break;
		}

	},
	init: function (cb) {
		var self = this;
		self.state.selectedoru = app.defaultpagestate.filter.orulevel;
		self.el.wrapper = getEl('oru_filter_container');
	}
}
