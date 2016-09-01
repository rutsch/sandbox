var objConfig = {
  urls: {
    base: 'https://www.livesimproved.philips.com/webapp/html',
    dev: 'https://dev.livesimproved.philips.com/webapp/html',
    troper: 'https://www.troperlaunna2010.philips.com/webapp/html',
    devpublic: 'https://dev.public.livesimproved.philips.com/webapp/html',
    prodpublic: 'https://www.public.livesimproved.philips.com/webapp/html',
    devhealthtech: 'https://dev.healthtech.livesimproved.philips.com/webapp/html',
    prodhealthtech: 'https://www.healthtech.livesimproved.philips.com/webapp/html',
    devlighting: 'https://dev.lighting.livesimproved.philips.com/webapp/html',
    prodlighting: 'https://www.lighting.livesimproved.philips.com/webapp/html',
    johan: 'http://livesimproved.site',
    rutger: 'http://95.97.163.236/sandbox/html',
    dynamicresourceurl: 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
    authurl2: "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
    authurl3: "https://www.livesimproved.philips.com/pages/login/authenticate_user.aspx",
    urlshiblogin: "https://www.livesimproved.philips.com/tools/shibboleth-authenticate.aspx"
  },
  colors: {
    philips: { //philips group
      low: '#D2E9FF',
      middle: '#0E6EB3',
      high: '#002E6C'
    },
    PD0900: { //healthsystems  (to be removed)
      low: '#B7D9E3',
      middle: '#0E6EB3',
      high: '#074178'
    },
    PD0100: { //lighting
      low: '#F3DDC2',
      middle: '#F2A41C',
      high: '#EE7706'
    },
    BS9001: { //lighting (2) - can this be removed??
      low: '#F3DDC2',
      middle: '#F2A41C',
      high: '#EE7706'
    },

    PD0200: { //personal health (previously known as Consumer Lifestyle)
      low: '#B5DFB7',
      middle: '#3A8D3F',
      high: '#123727'
    },

    DHS001: { //Diagnosis & Treatment
      low: '#E1DDFA',
      middle: '#570E60',
      high: '#2E0740'
    },

    DHS003: { //Connected Care & Health Informatics
      low: '#CEDFFF',
      middle: '#6B91D5',
      high: '#094B89'
    },
    royalphilips: { //royal philips (new)
      low: '#DFFFFB',
      middle: '#1E8877',
      high: '#095D67'
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
    } else if (filename.indexOf('css') > -1) { //if filename is an external CSS file
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
      } else if (self.urls.prodhealthtech.indexOf(location.hostname) > -1) {
        self.sitetype = 'prodhealthtech';
      } else if (self.urls.prodlighting.indexOf(location.hostname) > -1) {
        self.sitetype = 'prodlighting';
      } else if (self.urls.devhealthtech.indexOf(location.hostname) > -1) {
        self.sitetype = 'devhealthtech';
      } else if (self.urls.devlighting.indexOf(location.hostname) > -1) {
        self.sitetype = 'devlighting';
      } else if (self.urls.troper.indexOf(location.hostname) > -1) {
        self.sitetype = 'troper';
      } else if (self.urls.johan.indexOf(location.hostname) > -1) {
        self.sitetype = 'johan';
      } else if (self.urls.rutger.indexOf(location.hostname) > -1) {
        self.sitetype = 'rutger';
      } else if (self.urls.devpublic.indexOf(location.hostname) > -1) {
        self.sitetype = 'devpublic';
      } else if (self.urls.prodpublic.indexOf(location.hostname) > -1) {
        self.sitetype = 'prodpublic';
      }
      console.log('sitetype: %s', self.sitetype);

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
        } else if (location.search.indexOf('sitetype=troper') > -1) {
          //troperlaunna
          self.urls.base = self.urls.troper;
          self.sitetype = 'troper';
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
        } else if (location.href.indexOf('troperlaunna') > -1) {
          //troperlaunna
          self.urls.base = self.urls.troper;
          self.sitetype = 'troper';
        }
      }
    }

    //console.log('self.sitetype: %s', self.sitetype);

    /*
    Calculate the absolute URL's to use in the application
    */
    var pattrn = /^((http|https):\/\/.*?)(\/.*)$/;
    //if we are on the dev site, then we need to use a local url for data retrieval etc.
    if (self.sitetype == 'dev' || self.sitetype == 'troper' || self.sitetype == 'prodhealthtech' || self.sitetype == 'prodlighting' || self.sitetype == 'prodpublic' || self.sitetype == 'devhealthtech' || self.sitetype == 'devlighting' || self.sitetype == 'devpublic') {

      var strUrlCurrent = self.urls[self.sitetype].replace(pattrn, "$1");

      //console.log(strUrlCurrent);

      self.urls.dynamicresourceurl = self.urls.dynamicresourceurl.replace(pattrn, strUrlCurrent + "$3"); //'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
      self.urls.authurl2 = self.urls.authurl2.replace(pattrn, strUrlCurrent + "$3"); // "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
      self.urls.authurl3 = self.urls.authurl3.replace(pattrn, strUrlCurrent + "$3"); //
      self.urls.urlshiblogin = self.urls.urlshiblogin.replace(pattrn, strUrlCurrent + "$3");
      //console.log(JSON.stringify(self.urls));
    }

    //special case to test the app
    if (self.sitetype == 'johan') {
      var remoteUrl = self.urls.prodhealthtech.replace(pattrn, "$1");
      self.urls.dynamicresourceurl = self.urls.dynamicresourceurl.replace(pattrn, remoteUrl + "$3");
      self.urls.authurl2 = self.urls.authurl2.replace(pattrn, remoteUrl + "$3");
      self.urls.authurl3 = self.urls.authurl3.replace(pattrn, remoteUrl + "$3");
      self.urls.urlshiblogin = self.urls.urlshiblogin.replace(pattrn, remoteUrl + "$3");
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