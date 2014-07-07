var app = {
	state: {
		width: null,
		height: null,
		mobile: null,
		ios: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false),
		ios7: (navigator.userAgent.match(/OS 7_/g) ? true : false),
		ipad: (navigator.userAgent.match(/(iPad)/g) ? true : false),
		orientation: '',
		ie: !!window.MSStream,
		webbrowser: ((location.href.indexOf('http') > -1))
	},
	defaultpagestate: {
		view: 'worldmap',
		popup: 'none',
		filter: {
			oru: '3',
			mru: 'philips'
		}
	},
	labels: {
		simulatortitle: ' simulation'
	},
	trendgraph: {
		//TODO: these labels need to be set in the backend or associated with the cache data upload in the backend!
		//if left empty ('') then the system will assume that the simulator point is year end data
		predictionlabel: 'Q1 2014', //set the label of the last point (simulator) in the graph to a manual value
		predictiondate: '2014-03-31', //(yyyy-mm-dd) set to a date to ovewrite the year end date that will normally be calculated
		pointsvisible: null, //set to a value to limit the number of points shown in the graph
		stylecurrentline: '' //overwrite the style of the line to the current data point
	},
	el: {

	},
	btnfilterclick: function (el) {
		objFilter.show();
	},
	btnbookmarksclick: function (el) {
		objBookmarks.show();
	},
	btnexplainclick: function (el) {
		objExplain.show();
	},
	btnlogoutclick: function (el) {
		objStore.setlocalstorageitem('reloadtime', new Date().getTime() / 1000);
		objLogin.logout();
	},
	hidetransparentlayer: function () {
		getEl('transparentlayer').style.display = 'none';
	},
	isMobile: {
		any: function () {
			return 'ontouchstart' in document.documentElement;
		}
	},
	start: function () {
		//init elements with async because elements require external data

		// - getoruandproductdata
		var objData = {
			fulldomain: location.protocol + "//" + location.hostname,
			method: 'getoruandproductdata',
			type: 'json',
			token: objLogin.token,
			snapshotid: objConfig.currentsnapshotid
		}
		psv('GET', objConfig.urls.dynamicresourceurl, objData, function (err, data) {
			if (err) {
				objError.show('There was an error retrieving metadata information. ' + ((typeof err == 'object') ? JSON.parse(err) : err), true);
			} else {
				//console.log(data);

				//load the retrieved data into the ORU object
				objOruFilter.json = data.result.orudata;

				//load the retrieved data into the MRU (product) object
				objMruFilter.preparehtml(data.result.productdata);

				//hide the login
				objLogin.hide();

				objMap.updatemap(null, function () {
					//TODO: add logic to show bookmarks, filter or messages
					//objFilter.show();
					var usedAppBefore = objStore.getlocalstorageitem('seenAppIntro');
					if (usedAppBefore) {
						objLogin.showupdatemessages();
					} else {
						objPanelInfo.show('app');
						objStore.setlocalstorageitem('seenAppIntro', 'true');
					}
				});

				//cb(null, data);
			}
		});

	},
	getdimensions: function () {
		var self = this;
		self.state.width = document.body.clientWidth;
		self.state.height = document.documentElement["clientHeight"];
		if (self.state.width > self.state.height) {
			self.state.orientation = 'landscape';
		} else {
			self.state.orientation = 'portrait';
		}
	},
	sethash: function () {

		var objData = {
			fulldomain: location.protocol + "//" + location.hostname,
			method: 'checksession',
			type: 'json',
			token: objLogin.token
		}

		psv('GET', objConfig.urls.authurl2, objData, function (err, response) {
			if (err) {
				console.log(err)
			} else {
				console.log(response)
				if (response.error) {

				} else {
					console.log(response.authenticated);
				}
			}
		});

	},
	init: function () {
		var self = this;

		//load the main content in the wrapper
		getEl('content_outer_wrapper').innerHTML = serverSideRequest({ url: objConfig.urls.base + '/data/body_content.html', method: 'get', debug: false });

		//retrieve the dimensions
		self.getdimensions();

		//detect mobile/desktop
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
		objPanelInfo.init();

		objOruFilter.init();
		objMruFilter.init();

		//change the settings for the zoom/pan based on the device
		if (self.state.ios) {
			objZoomPanSettings.dragtimerdelay = 800;
			objZoomPanSettings.touchtimerdelay = 300;

			//for status/carrier bar issue
			if (self.state.ios7) {
				getEl('title_bar').style.height = "65px";
				getEl('info').style.top = "10px";
				getEl('btn_back').style.top = "10px";
				getEl('toggle_favourite').style.top = "10px";
			}
		}


		/*
		This is where it all starts...
		*/
		//1) retrieve snapshot id (public info - no login needed)
		objLogin.getsnapshotconfig(function () {

			//2) set or process the information supplied in the hash
			if (location.hash.length > 0) {
				var objPageStateNew = objPageState.hash2object(location.hash);
				//console.log(objPageStateNew);
				if (objPageStateNew.hasOwnProperty("error")) {
					//could not properly parse the hash into a state object - default to standard object
					location.hash = objPageState.object2hash(self.defaultpagestate);
				} else {
					//go to the view originally requested
					objPageState.handlechange(objPageStateNew);
				}
			} else {
				//set the page state to default
				location.hash = objPageState.object2hash(self.defaultpagestate);
			}

		});




	}
}


var objPageState = {
	state: {
		view: null,
		popup: null,
		filter: {
			oru: null,
			mru: null
		}
	},
	clonestateobject: function () {
		var self = this;
		return {
			view: self.state.view,
			popup: self.state.popup,
			filter: {
				oru: self.state.filter.oru,
				mru: self.state.filter.mru
			}
		}
	},
	setstateobject: function (obj) {
		var self = this;

		if (obj.hasOwnProperty("view")) self.state.view = obj.view;
		if (obj.hasOwnProperty("popup")) self.state.popup = obj.popup;
		//debugger;
		if (obj.hasOwnProperty("filter")) {
			if (obj.filter.hasOwnProperty("oru")) self.state.filter.oru = obj.filter.oru;
			if (obj.filter.hasOwnProperty("mru")) self.state.filter.mru = obj.filter.mru;
		}
	},
	updatepagestate: function (obj) {
		var objCurrentState = objPageState.clonestateobject();

		if (obj.hasOwnProperty("view")) objCurrentState.view = obj.view;
		if (obj.hasOwnProperty("popup")) objCurrentState.popup = obj.popup;
		//debugger;
		if (obj.hasOwnProperty("filter")) {
			if (obj.filter.hasOwnProperty("oru")) objCurrentState.filter.oru = obj.filter.oru;
			if (obj.filter.hasOwnProperty("mru")) objCurrentState.filter.mru = obj.filter.mru;
		}

		//console.log('set hash');
		//console.log(objCurrentState);
		location.hash = objPageState.object2hash(objCurrentState);
	},
	hash2object: function (strHash) {
		// converts a hash string into a state javascript object
		// #!/view/popup/mru/oru
		// #!/worldmap/philips/3/none
		var regValid = /^#\!\/(login|worldmap?)\/(\w+?)\/(\w+?)\/(filter|faq|help|bookmark|none?)$/g;
		if (regValid.test(strHash)) {
			return {
				view: strHash.replace(regValid, "$1"),
				popup: strHash.replace(regValid, "$4"),
				filter: {
					oru: strHash.replace(regValid, "$3"),
					mru: strHash.replace(regValid, "$2")
				}
			}
		} else {
			return { error: true };
		}
	},
	object2hash: function (obj) {
		//console.log(obj);
		// #!/view/popup/mru/oru
		return '#!/' + obj.view + '/' + obj.filter.mru + '/' + obj.filter.oru + '/' + obj.popup;
	},
	handlechange: function (objPageStateNew) {
		//check which properties have changed and act accordingly
		var self = this;

		//1) handle view change
		if (self.state.view != objPageStateNew.view) {
			switch (objPageStateNew.view) {
				case 'worldmap':
					objLogin.hide();
					app.start();
					break;
				case 'login':
					objLogin.show();
					break;
			}
		}

		self.setstateobject(objPageStateNew);
	},
	init: function () {
		var self = this;

	}
}


window.onresize = function () {
	//update the width and height variables
	app.getdimensions();

	//rework the dimensions of the map based on the new dimensions of the window
	objMap.resizeworldmap();

	objRegionInfo.hide();
};

window.onhashchange = function () {
	//parse the received hash into the objPageState.state object

	var objPageStateNew = objPageState.hash2object(location.hash);
	//debugger;
	//console.log(objPageStateNew);
	if (objPageStateNew.hasOwnProperty("error")) {
		//could not properly parse the hash into a state object - default to standard object
		location.hash = objPageState.object2hash(app.defaultpagestate);
	} else {
		//go to the view requested
		objPageState.handlechange(objPageStateNew);
	}
}