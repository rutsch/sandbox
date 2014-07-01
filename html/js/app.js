var app = {
	state: {
		width: null,
		height: null,
		mobile: null,
		ios: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false),
		ios7: (navigator.userAgent.match(/OS 7_/g) ? true : false),
		ipad: (navigator.userAgent.match(/(iPad)/g) ? true : false),
		orientation: '',
		ie: !!window.MSStream
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
		objOruFilter.init(function (err) {
			//JT: this needs to become much simpler....
			//alert(err);
			if (err != null) {
				objError.handleError('app.start', err);
			} else {
				objMruFilter.init(function (err) {
					//JT: this needs to become much simpler....
					//alert(err);
					if (err != null) {
						objError.handleError('app.start', err);
					} else {
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

					}
				});
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

		//retrieve snapshot id
		objLogin.getsnapshotconfig(function () {
			//if(objLogin.loggedin()){
			self.start();
			//}	
		});




	}
}

window.onresize = function () {
	//update the width and height variables
	app.getdimensions();

	//rework the dimensions of the map based on the new dimensions of the window
	objMap.resizeworldmap();

	objRegionInfo.hide();
};
