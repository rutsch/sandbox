var objConfig = {
	urls: {
		base: 'https://www.livesimproved.philips.com/webapp/html',
		dev: 'https://nlnehvgdc1vw991.ssn.philips.com/webapp/html',
		johan: 'http://livesimproved.site.10.0.1.25.xip.io',
		rutger: 'http://95.97.163.236/sandbox/html',
		w2003: 'http://www.myvirtualbox.com/webapp/html',
		dynamicresourceurl: 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
		authurl1: "https://www.livesimproved.philips.com/pages/login/login.aspx",
		authurl2: "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
		authurl3: "https://www.livesimproved.philips.com/pages/login/authenticate_user.aspx"
	},
	colors: {
		philips: { //philips group
			low: '#7DABF1',
			middle: '#3D7FDF',
			high: '#0b5ed7'
		},
		PD0900: { //healthcare
			low: '#99EAF0',
			middle: '#30B6BF',
			high: '#2badb5'
		},
		PD0100: { //lighting
			low: '#CBF277',
			middle: '#98C833',
			high: '#7dba00'
		},
		PD0200: { //consumer lifestyle
			low: '#BE67E9',
			middle: '#8737B0',
			high: '#68049c'
		}

	},
	resources: {
		css: [
			'/css/style.css',
			'/css/graph.css'
		],
		js: [
			'/js/helpers/utils.js',
			'/js/helpers/store.js',
			'/js/helpers/infographic.js',
			'/js/panels/footer.js',
			'/js/panels/header.js',
			'/js/panels/map.js',
			'/js/panels/overlay.js',
			'/js/panels/region_info.js',
			'/js/panels/sliders.js',
			'/js/panels/login.js',
			'/js/panels/error.js',
			'/js/panels/filter.js',
			'/js/panels/bookmarks.js',
			'/js/panels/explain.js',
			'/js/panels/graph.js',
			'/js/panels/loading.js',
			'/js/panels/panel_info.js',
			'/js/elements/mru_filter.js',
			'/js/elements/oru_filter.js',
			'/js/app.js'
		]
	},
	sitetype: 'prod',
	hideinactivecountries: true,
	snapshots: null,
	currentsnapshotid: 'nothing',
	loadremotefile: function (filename) {
		var self = this;

		if (filename.indexOf('js') > -1) { //if filename is a external JavaScript file
			var fileref = document.createElement('script')
			fileref.setAttribute("type", "text/javascript")
			fileref.setAttribute("src", self.urls.base + filename + '?rnd=' + Math.round(Math.random() * 100000000))
		}
		else if (filename.indexOf('css') > -1) { //if filename is an external CSS file
			var fileref = document.createElement("link")
			fileref.setAttribute("rel", "stylesheet")
			fileref.setAttribute("type", "text/css")
			fileref.setAttribute("href", self.urls.base + filename + '?rnd=' + Math.round(Math.random() * 100000000))
		}

		if (typeof fileref != "undefined") document.getElementsByTagName("head")[0].appendChild(fileref)
	},
	calculateconfigsettings: function () {
		var self = this;

		//base url's of the resources
		if (location.href.indexOf('http') > -1) {
			//running on a website - grab the base url
			if (location.href.indexOf('.html') > -1) {
				self.urls.base = location.href.replace(/^(.*)\/.*?\.html.*$/, "$1");
			} else {
				self.urls.base = location.href.replace(/^(.*)\/(\?.*).$/, "$1");
				self.urls.base = self.urls.base.replace(/^(.*)(\/)$/, "$1");
			}

			//determine site
			if (self.urls.dev.indexOf(location.hostname) > -1) {
				self.sitetype = 'dev';
			} else if (self.urls.johan.indexOf(location.hostname) > -1) {
				self.sitetype = 'johan';
			} else if (self.urls.rutger.indexOf(location.hostname) > -1) {
				self.sitetype = 'rutger';
			} else if (self.urls.w2003.indexOf(location.hostname) > -1) {
				self.sitetype = 'w2003';
			}
			//alert(self.sitetype);

		} else {
			//running inside the app or running from the filesystem
			//baseurl can be overwritten using the querystring
			if (location.search.indexOf('sitetype') > -1) {

				if (location.search.indexOf('sitetype=johan') > -1) {
					//johan
					self.urls.base = self.urls.johan;
					self.sitetype = 'johan';
				} else if (location.search.indexOf('sitetype=rutger') > -1) {
					//rutger
					self.urls.base = self.urls.rutger;
					elf.sitetype = 'rutger';
				} else if (location.search.indexOf('sitetype=dev') > -1) {
					//development
					self.urls.base = self.urls.dev;
					self.sitetype = 'dev';
				} else if (location.search.indexOf('sitetype=w2003') > -1) {
					//w2003
					self.urls.base = self.urls.dev;
					self.sitetype = 'w2003';
				}
			} else {
				if (location.href.indexOf('johan') > -1) {
					//johan
					self.urls.base = self.urls.johan;
					self.sitetype = 'johan';
				} else if (location.href.indexOf('rutger') > -1) {
					//rutger
					self.urls.base = self.urls.rutger;
					self.sitetype = 'rutger';
				} else if (location.href.indexOf('dev') > -1) {
					//development
					self.urls.base = self.urls.dev;
					self.sitetype = 'dev';
				} else if (location.href.indexOf('w2003') > -1) {
					//development
					self.urls.base = self.urls.w2003;
					self.sitetype = 'w2003';
				}
			}
		}

		//if we are on the dev site, then we need to use a local url for data retrieval etc.
		if (self.sitetype == 'dev') {
			var strUrlDev = self.urls.dev.replace(/^((http|https):\/\/.*?)\/.*$/, "$1");

			self.urls.dynamicresourceurl = self.urls.dynamicresourceurl.replace(/^((http|https):\/\/.*?)(\/.*)$/, strUrlDev + "$3"); //'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
			self.urls.authurl1 = self.urls.authurl1.replace(/^((http|https):\/\/.*?)(\/.*)$/, strUrlDev + "$3"); // "https://www.livesimproved.philips.com/pages/login/login.aspx",
			self.urls.authurl2 = self.urls.authurl2.replace(/^((http|https):\/\/.*?)(\/.*)$/, strUrlDev + "$3"); // "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
			self.urls.authurl3 = self.urls.authurl3.replace(/^((http|https):\/\/.*?)(\/.*)$/, strUrlDev + "$3"); //
			//console.log(JSON.stringify(self.urls));
		}
	},
	startapplication: function () {
		var self = this;
		//console.log('testing')
		if (typeof app != 'undefined' &&
			typeof objUtils != 'undefined' &&
			typeof objStore != 'undefined' &&
			typeof objInfographic != 'undefined' &&
			typeof objFooter != 'undefined' &&
			typeof objHeader != 'undefined' &&
			typeof objMap != 'undefined' &&
			typeof objOverlay != 'undefined' &&
			typeof objRegionInfo != 'undefined' &&
			typeof objSliders != 'undefined' &&
			typeof objLogin != 'undefined' &&
			typeof objError != 'undefined' &&
			typeof objFilter != 'undefined' &&
			typeof objBookmarks != 'undefined' &&
			typeof objTrendGraph != 'undefined' &&
			typeof objExplain != 'undefined' &&
			typeof objLoading != 'undefined' &&
			typeof objPanelInfo != 'undefined' &&
			typeof objMruFilter != 'undefined' &&
			typeof objOruFilter != 'undefined'
		) {
			app.init();
		} else {
			window.setTimeout(function () {
				self.startapplication();
			}, 500);
		}
	},
	init: function () {
		var self = this;

		//determine the configuration settings
		self.calculateconfigsettings();
	}
}

objConfig.init();