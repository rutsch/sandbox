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
        johan: 'http://resultshub.com',
        rutger: 'https://www.test.results.philips.com',
        suus: 'https://www.dev.results.philips.com',
        resultshubpublic: 'https://www.results.philips.com',
        dynamicresourceurl: 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
        authurl2: "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
        authurl3: "https://www.livesimproved.philips.com/pages/login/authenticate_user.aspx",
        urlshiblogin: "https://www.livesimproved.philips.com/tools/shibboleth-authenticate.aspx"
    },
    colors: {
        philips: { // Philips group
            low: '#5BBBB7',
            middle: '#1E9D8B',
            high: '#22505F'
        },
        PD0900: { // Healthsystems  (to be removed)
            low: '#B7D9E3',
            middle: '#0E6EB3',
            high: '#074178'
        },
        PD0100: { // Lighting
            low: '#F3DDC2',
            middle: '#F2A41C',
            high: '#EE7706'
        },
        BS9001: { // Lighting (2) - can this be removed??
            low: '#F3DDC2',
            middle: '#F2A41C',
            high: '#EE7706'
        },

        PD0200: { // Personal health (previously known as Consumer Lifestyle)
            low: '#B5DFB7',
            middle: '#3A8D3F',
            high: '#123727'
        },

        DHS001: { // Diagnosis & Treatment
            low: '#E1DDFA',
            middle: '#570E60',
            high: '#2E0740'
        },

        DHS003: { // Connected Care & Health Informatics
            low: '#CEDFFF',
            middle: '#6B91D5',
            high: '#094B89'
        },
        royalphilips: { // Royal Philips (new)
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
            '/js/elements/data_filter.js',
            '/js/app.js'
        ]
    },
    sitetype: 'prod',
    lang: 'en',
    fragments: {},
    hideinactivecountries: true,
    snapshots: null,
    currentsnapshotid: 'nothing',
    loadremotefile: function (filename) {
        var self = this;

        if (filename.indexOf('js') > -1) { // If filename is a external JavaScript file
            var fileref = document.createElement('script')
            fileref.setAttribute("type", "text/javascript")
            fileref.setAttribute("src", self.urls.base + filename + '?rnd=' + Math.round(Math.random() * 100000000))
        } else if (filename.indexOf('css') > -1) { // If filename is an external CSS file
            var fileref = document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", self.urls.base + filename + '?rnd=' + Math.round(Math.random() * 100000000))
        }

        if (typeof fileref !== "undefined") document.getElementsByTagName("head")[0].appendChild(fileref)
    },
    calculateconfigsettings: function () {
        var self = this;

        // Base url's of the resources

        // Running on a website - grab the base url
        if (location.href.indexOf('.html') > -1) {
            self.urls.base = location.href.replace(/^(.*)\/.*?\.html.*$/, "$1");
        } else {
            self.urls.base = location.href.replace(/^(.*)\/(\?.*).$/, "$1");
            self.urls.base = self.urls.base.replace(/^(.*)(\/)$/, "$1");
        }

        // Determine site
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
            self.sitetype = 'devpublic';
        } else if (self.urls.rutger.indexOf(location.hostname) > -1) {
            self.sitetype = 'devpublic';
        } else if (self.urls.resultshubpublic.indexOf(location.hostname) > -1) {
            self.sitetype = 'devpublic';
        } else if (self.urls.suus.indexOf(location.hostname) > -1) {
            self.sitetype = 'devpublic';
        } else if (self.urls.devpublic.indexOf(location.hostname) > -1) {
            self.sitetype = 'devpublic';
        } else if (self.urls.prodpublic.indexOf(location.hostname) > -1) {
            self.sitetype = 'prodpublic';
        }
        console.log('sitetype: %s', self.sitetype);

        /*
        Calculate the language
        */
        // TODO: This needs to improve!
        if (location.href.indexOf('_zh.htm') > -1 || location.href.indexOf('.com.cn') > -1) self.lang = 'zh';

        // console.log('self.sitetype: %s', self.sitetype);

        /*
        Calculate the absolute URL's to use in the application for interacting with the backend
        */
        var pattrn = /^((http|https):\/\/.*?)(\/.*)$/;

        // Helper function that reworks the default remote URL's so that they use the domain name as provided by the baseRemoteUrl argument
        function calculateUrls(baseRemoteUrl) {
            self.urls.dynamicresourceurl = self.urls.dynamicresourceurl.replace(pattrn, baseRemoteUrl + "$3"); //'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
            self.urls.authurl2 = self.urls.authurl2.replace(pattrn, baseRemoteUrl + "$3"); // "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
            self.urls.authurl3 = self.urls.authurl3.replace(pattrn, baseRemoteUrl + "$3"); //
            self.urls.urlshiblogin = self.urls.urlshiblogin.replace(pattrn, baseRemoteUrl + "$3");

            // console.log(JSON.stringify(self.urls));
        }


        // If we are on the dev site, then we need to use a local url for data retrieval etc.
        if (self.sitetype === 'dev' ||
            self.sitetype === 'troper' ||
            self.sitetype === 'prodhealthtech' ||
            self.sitetype === 'prodlighting' ||
            self.sitetype === 'prodpublic' ||
            self.sitetype === 'devhealthtech' ||
            self.sitetype === 'devlighting' ||
            self.sitetype === 'devpublic') {
            calculateUrls(self.urls[self.sitetype].replace(pattrn, "$1"));
        }

        // Special case to test the app
        if (self.sitetype.indexOf('public') > -1) {
            calculateUrls('');
            self.urls.dynamicresourceurl = '/tools/api.aspx';
        }


    },
    startapplication: function () {
        var self = this;
        // console.log('testing')
        if (typeof app !== 'undefined' &&
            typeof objUtils !== 'undefined' &&
            typeof objStore !== 'undefined' &&
            typeof objInfographic !== 'undefined' &&
            typeof objFooter !== 'undefined' &&
            typeof objHeader !== 'undefined' &&
            typeof objMap !== 'undefined' &&
            typeof objOverlay !== 'undefined' &&
            typeof objRegionInfo !== 'undefined' &&
            typeof objSliders !== 'undefined' &&
            typeof objLogin !== 'undefined' &&
            typeof objError !== 'undefined' &&
            typeof objFilter !== 'undefined' &&
            typeof objBookmarks !== 'undefined' &&
            typeof objTrendGraph !== 'undefined' &&
            typeof objExplain !== 'undefined' &&
            typeof objLoading !== 'undefined' &&
            typeof objPanelInfo !== 'undefined' &&
            typeof objMruFilter !== 'undefined' &&
            typeof objOruFilter !== 'undefined'
        ) {
            window.app.init();
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
