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
		webbrowser: ((location.href.indexOf('http') > -1)),
		initialmapview: true
	},
	vars: {


	},
	defaultpagestate: {
		view: 'worldmap',
		popup: 'none',
		filter: {
			orulevel: '3', //for worldmap data 1, 2, 3, 4
			oru: 'none', //selected country/region
			sector: 'philips', //main sector
			mru: 'philips' //product group
		}
	},
	labels: {
		simulatortitle: ' simulation'
	},
	trendgraph: {
		//if left empty ('') then the system will assume that the simulator point is year end data
		predictionlabel: 'Q1 2014', //set the label of the last point (simulator) in the graph to a manual value
		predictiondate: '2014-03-31', //(yyyy-mm-dd) set to a date to ovewrite the year end date that will normally be calculated
		pointsvisible: null, //set to a value to limit the number of points shown in the graph
		stylecurrentline: '' //overwrite the style of the line to the current data point
	},
	el: {

	},
	btnfilterclick: function (el) {
		//add an action to the stats object
		objAnalytics.data.events.push({
			category: 'button' /*required - object that was interacted with*/,
			action: 'click' /*required - type of interaction*/,
			label: 'open filter panel' /*optional - used for categorization of events*/
		});
		objFilter.show();
	},
	btnbookmarksclick: function (el) {
		//add an action to the stats object
		objAnalytics.data.events.push({
			category: 'button' /*required - object that was interacted with*/,
			action: 'click' /*required - type of interaction*/,
			label: 'open bookmarks panel' /*optional - used for categorization of events*/
		});
		objBookmarks.show();
	},
	btnexplainclick: function (el) {
		//add an action to the stats object
		objAnalytics.data.events.push({
			category: 'button' /*required - object that was interacted with*/,
			action: 'click' /*required - type of interaction*/,
			label: 'open help panel' /*optional - used for categorization of events*/
		});
		objExplain.show();
	},
	btnlogoutclick: function (el) {
		//add an action to the stats object
		objAnalytics.data.events.push({
			category: 'button' /*required - object that was interacted with*/,
			action: 'click' /*required - type of interaction*/,
			label: 'logout' /*optional - used for categorization of events*/
		});
		objStore.setlocalstorageitem('reloadtime', new Date().getTime() / 1000);
		objLogin.logout();
	},
	showtransparentlayer: function () {
		getEl('transparentlayer').style.display = 'block';
	},
	hidetransparentlayer: function () {
		getEl('transparentlayer').style.display = 'none';
	},
	isMobile: {
		any: function () {
			return 'ontouchstart' in document.documentElement;
		}
	},
	//retrieves oru and mru metadata structures
	retrievemetadata: function (callback) {
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

				//execute the callback routine if needed
				if (callback) callback();
			}
		});
	},
	start: function (bolShowDetailView) {
		//init elements with async because elements require external data

		//hide the login
		objLogin.hide();

		//setup the worldmap and load the data
		objMap.updatemap(bolShowDetailView, app.showappintromessage);

	},
	showappintromessage: function () {
		//TODO: add logic to show bookmarks, filter or messages
		//objFilter.show();
		var usedAppBefore = objStore.getlocalstorageitem('seenAppIntro');
		if (usedAppBefore) {
			objLogin.showupdatemessages();
		} else {
			objPanelInfo.show('app');
			objStore.setlocalstorageitem('seenAppIntro', 'true');
		}
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
	processinitialview: function (bolAuthenticated) {
		var self = this;

		//set or process the information supplied in the hash
		if (location.hash.length > 0) {
			var objPageStateNew = objPageState.hash2object(location.hash);
			//console.log(objPageStateNew);
			if (objPageStateNew.hasOwnProperty("error")) {
				//could not properly parse the hash into a state object - default to standard object
				location.hash = objPageState.object2hash(self.defaultpagestate);
			} else {
				if (!bolAuthenticated) {
					//remember the state so we can return to it after we have passed the authentication step
					objStore.setlocalstorageitem('stateremembered', JSON.stringify(objPageStateNew));

					//assure that we will show the login screen
					objPageStateNew.view = 'login';
					location.hash = objPageState.object2hash(objPageStateNew);
				} else {
					//go to the view originally requested
					objPageState.handlechange(objPageStateNew);
				}
			}
		} else {
			//set the page state to default
			location.hash = objPageState.object2hash(self.defaultpagestate);
		}

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

		//init the stats
		objAnalytics.init();

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

		//init the filters
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

			//2) test if we are logged in
			var objData = {
				fulldomain: location.protocol + "//" + location.hostname,
				method: 'checksession',
				type: 'json'
			}
			psv('GET', objConfig.urls.authurl2, objData, function (err, data) {
				if (err) {
					objError.show('There was an error checking the session. ' + ((typeof err == 'object') ? JSON.parse(err) : err), true);
				} else {

					//change the view if we need to login
					if (!data.authenticated) {
						self.defaultpagestate.view = 'login';
						self.processinitialview(false);
					} else {
						self.defaultpagestate.view = 'worldmap';
						//load the metadata
						self.retrievemetadata(function () {
							self.processinitialview(true);
						});
					}
				}
			});

		});

	}
}

//regular expression to match a valid hash
var regValid = /^#\!\/(login|worldmap|detail?)\/((\w|\d|-)+)\/((\w|\d|-)+)\/((\w|\d|-)+)\/((\w|\d|-)+)\/(filter|faq|help|bookmark|none?)$/g;

var objPageState = {
	state: {
		view: null,
		popup: null,
		filter: {
			orulevel: null, //for worldmap data 1, 2, 3, 4
			oru: null, //selected country/region
			sector: null, //main sector
			mru: null //product group
		}
	},
	stateremembered: {

	},
	clonestateobject: function () {
		var self = this;
		return {
			view: self.state.view,
			popup: self.state.popup,
			filter: {
				orulevel: self.state.filter.orulevel,
				oru: self.state.filter.oru,
				sector: self.state.filter.sector,
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
			if (obj.filter.hasOwnProperty("orulevel")) self.state.filter.orulevel = obj.filter.orulevel;
			if (obj.filter.hasOwnProperty("oru")) self.state.filter.oru = obj.filter.oru;
			if (obj.filter.hasOwnProperty("sector")) self.state.filter.sector = obj.filter.sector;
			if (obj.filter.hasOwnProperty("mru")) self.state.filter.mru = obj.filter.mru;
		}
	},
	updatepagestate: function (obj) {
		var objCurrentState = objPageState.clonestateobject();

		if (obj.hasOwnProperty("view")) objCurrentState.view = obj.view;
		if (obj.hasOwnProperty("popup")) objCurrentState.popup = obj.popup;
		//debugger;
		if (obj.hasOwnProperty("filter")) {
			if (obj.filter.hasOwnProperty("orulevel")) objCurrentState.filter.orulevel = obj.filter.orulevel;
			if (obj.filter.hasOwnProperty("oru")) objCurrentState.filter.oru = obj.filter.oru;
			if (obj.filter.hasOwnProperty("sector")) objCurrentState.filter.sector = obj.filter.sector;
			if (obj.filter.hasOwnProperty("mru")) objCurrentState.filter.mru = obj.filter.mru;
		}
		//debugger;
		//console.log(obj);
		//console.log(objCurrentState);
		//console.log(objPageState.object2hash(objCurrentState));
		//debugger;
		location.hash = objPageState.object2hash(objCurrentState);
	},
	hash2object: function (strHash) {
		// converts a hash string into a state javascript object
		// #!/view(1)/orulevel(2)/oru(4)/sector(6)/mru(8)/popup(10)
		// #!/worldmap/2/emea/PD0100/BS9001/none
		var bolFilterOnly = false;
		if (arguments.length > 1) bolFilterOnly = bolReturnFilterOnly;

		if (regValid.test(strHash)) {
			return {
				view: strHash.replace(regValid, "$1"),
				popup: strHash.replace(regValid, "$10"),
				filter: {
					orulevel: strHash.replace(regValid, "$2"),
					oru: strHash.replace(regValid, "$4"),
					sector: strHash.replace(regValid, "$6"),
					mru: strHash.replace(regValid, "$8")
				}
			}
		} else {
			return { error: true };
		}
	},
	object2hash: function (obj) {
		//console.log(obj);
		// #!/view(1)/orulevel(2)/oru(4)/sector(6)/mru(8)/popup(10)
		return '#!/' + obj.view + '/' + obj.filter.orulevel + '/' + obj.filter.oru + '/' + obj.filter.sector + '/' + obj.filter.mru + '/' + obj.popup;
	},
	handlechange: function (objPageStateNew) {
		//check which properties have changed and act accordingly
		var self = this;

		//0) add the view to the analytics object so that it will be tracked by google analytics
		objAnalytics.data.views.push({
			page: location.href,
			title: location.hash.replace(regValid, function () {
				if (objPageStateNew.view == 'login') {
					return '/login';
				} else {
					if (objOruFilter.json == null) {
						return '/nothing';
					} else {
						//construct a readable page title (breadcrumb format)
						//debugger;
						//console.log(objMruFilter.getmrufilteraxisarray(arguments[8]));
						var pageName = '/' + arguments[1] + '/' + objOruFilter.convertoruleveltomarket(arguments[2]).toLowerCase() + '/' + arguments[4] + '/';
						
						var arrAxis = objMruFilter.getmrufilteraxisarray(arguments[8]);
						var arrBreadcrumb = [];
						for (var a = 0; a < arrAxis.length; a++) {
							arrBreadcrumb.push(arrAxis[a].name.toLowerCase().replace(/[\s]/gi, '_').replace(/&amp;/, 'and'));
						}
						pageName += arrBreadcrumb.join('/') + '/' + arguments[10];
						
						
						//var strGoogleAnalyticsPath = '/' + arguments[1] + '/' + objOruFilter.convertoruleveltomarket(arguments[2]).toLowerCase() + '/' + arguments[4] + '/' + arguments[6] + '/' + arguments[8] + '/' + arguments[10];
						//console.log(pageName);

						return pageName;
					}
				}
			})
		});

		//1) check if a filter has changed
		var bolFilterChangeDetected = false, bolFilterOruLevelChanged = false, bolFilterOruChanged = false, bolFilterSectorChanged = false, bolFilterMruChanged = false, bolFromLogin = false;
		if (self.state.filter.orulevel != objPageStateNew.filter.orulevel) {
			bolFilterOruLevelChanged = true;
			bolFilterChangeDetected = true;
		}
		if (self.state.filter.oru != objPageStateNew.filter.oru) {
			bolFilterOruChanged = true;
			bolFilterChangeDetected = true;
		}
		if (self.state.filter.sector != objPageStateNew.filter.sector) {
			bolFilterSectorChanged = true;
			bolFilterChangeDetected = true;
		}
		if (self.state.filter.mru != objPageStateNew.filter.mru) {
			bolFilterMruChanged = true;
			bolFilterChangeDetected = true;
		}

		//2) check we we are coming from login
		if (self.state.view == 'login' && objPageStateNew.view != 'login') bolFromLogin = true;

		//3) show the transparent layer one time only
		if (self.state.mobile && self.state.initialmapview && bolFromLogin && objPageStateNew.view != 'login') self.showtransparentlayer();

		//4) handle view change
		if (self.state.view != objPageStateNew.view) {
			//console.log('viewchange detected: self.state.view=' + self.state.view + ' - objPageStateNew.view=' + objPageStateNew.view);
			switch (objPageStateNew.view) {
				case 'worldmap':
					self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, false);
					break;
				case 'login':
					self.stateremembered = self.clonestateobject();
					self.setstateobject(objPageStateNew);
					objLogin.show();
					break;
				case 'detail':
					self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, true);
					break;
			}
		} else {
			//5) handle filter change
			if (bolFilterChangeDetected) {
				//console.log('filter change detected');
				//if the detail view is open then we need to reload the data in it
				if (objPageStateNew.view == 'detail') {
					self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, true);
				} else {
					//called when a change in the filter panel has occured
					self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, false);
				}
			} else {
				//6) handle a popup panel change

			}

		}

		//debugger;
		self.setstateobject(objPageStateNew);
	},
	updateworldmapview: function (objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, bolShowDetailsPanel) {
		var self = this;
		//debugger;
		if (typeof objMap.data == "object" && !bolFilterSectorChanged && !bolFilterMruChanged && !bolFilterOruLevelChanged && bolFilterOruChanged) {
			if (objPageStateNew.view == 'detail') {
				self.setstateobject(objPageStateNew);
				objMap.detailspanel();
			} else {
				//this assumes that we are hitting 'back' from a details panel
				objRegionInfo.hide();

				//set the header
				objHeader.setregionname(objMap.state.mapname);
			}
		} else {
			//load the svg map, the map data and open the details panel afterwards
			self.setstateobject(objPageStateNew);
			//reload all the data
			if (bolShowDetailsPanel) {
				app.start(true);
			} else {
				app.start();
			}
		}

	},
	copyfilterattributes: function (objPageStateNew) {
		if (self.state.filter.orulevel != objPageStateNew.filter.orulevel) {
			self.state.filter.orulevel = objPageStateNew.filter.orulevel;
		}
		if (self.state.filter.oru != objPageStateNew.filter.oru) {
			self.state.filter.oru = objPageStateNew.filter.oru;
		}
		if (self.state.filter.sector != objPageStateNew.filter.sector) {
			self.state.filter.sector = objPageStateNew.filter.sector;
		}
		if (self.state.filter.mru != objPageStateNew.filter.mru) {
			self.state.filter.mru = objPageStateNew.filter.mru;
		}
	},
	init: function () {
		var self = this;

	}
}

var objAnalytics = {
	data: {
		views: [], //contains an array of objects to send to google analytics { page: '/start', title: 'My New Page Title' }
		events: [] //contains an array of objects with the events to send to google analytics {category: 'button' /*required - object that was interacted with*/, action: 'click' /*required - type of interaction*/, label: 'some description' /*optional - used for categorization of events*/, value: 1 /*optional - counter*/ }
	},
	//this self-calling function will check the data object on fixed intervals and populate Google Analytics with the data accordingly
	asyncanalytics: function () {
		var self = this;

		for (var a = 0; a < self.data.views.length; a++) {
			//send the view to google analytics
			ga('send', 'pageview', self.data.views[a]);

			if (a == (self.data.views.length - 1)) {
				//last element -> clear out the array
				self.data.views.length = 0;
			}
		}

		for (var a = 0; a < self.data.events.length; a++) {
			//debugger;
			if (self.data.events[a].hasOwnProperty("category") && self.data.events[a].hasOwnProperty("action")) {
				switch (Object.keys(self.data.events[a]).length) {
					case 2:
						ga('send', 'event', self.data.events[a].category, self.data.events[a].action);
						break;
					case 3:
						if (self.data.events[a].hasOwnProperty("label")) {
							ga('send', 'event', self.data.events[a].category, self.data.events[a].action, self.data.events[a].label);
						}
						break;
					case 4:
						if (self.data.events[a].hasOwnProperty("label") && self.data.events[a].hasOwnProperty("value")) {
							ga('send', 'event', self.data.events[a].category, self.data.events[a].action, self.data.events[a].label, self.data.events[a].value);
						}
						break;
					default:
						//incorrect number of properties
						break;
				}
			}

			if (a == (self.data.events.length - 1)) {
				//last element -> clear out the array
				self.data.events.length = 0;
			}
		}

		intTimerId = window.setTimeout(function () {
			objAnalytics.asyncanalytics();
		}, 500);

	},

	init: function () {
		var self = this;

		//inject analytics.js
		(function (i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date(); a = s.createElement(o),
				m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
		})(window, document, 'script', ((location.href.indexOf('http') > -1) ? '//www.google-analytics.com/analytics.js' : 'js/lib/analytics.js'), 'ga');

		//create the tracker
		var options;
		if (location.href.indexOf('http') > -1) {
			options = 'auto';
		} else {
			//we are running inside the app
			options = {
				'storage': 'none',
				'clientId': objStore.getlocalstorageitem('statguid')
			};
		}
		ga('create', 'UA-52778332-1', options);

		//assure that we will always use https to communicate with google
		ga('set', 'forceSSL', true);

		//send an initial hit to the server
		ga('send', 'pageview', { page: '/start' });

		//start the async checker
		self.asyncanalytics();

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