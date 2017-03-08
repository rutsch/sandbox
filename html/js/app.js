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
        initialmapview: true,
        inframe: (top === self)
    },
    vars: {
        basehtml: null

    },
    defaultpagestate: {
        view: 'worldmap',
        popup: 'none',
        filter: {
            datasource: 'lives_improved',
            orulevel: '1', // For worldmap data 1, 2, 3, 4
            oru: 'none', // Selected country/region
            sector: 'philips', // Main sector
            mru: 'philips' // Product group
        }
    },
    labels: {
        simulatortitle: ' simulation'
    },
    trendgraph: {
        // If left empty ('') then the system will assume that the simulator point is year end data
        predictionlabel: 'Q1 2014', // Set the label of the last point (simulator) in the graph to a manual value
        predictiondate: '2014-03-31', // (yyyy-mm-dd) set to a date to ovewrite the year end date that will normally be calculated
        pointsvisible: null, // Set to a value to limit the number of points shown in the graph
        stylecurrentline: '' // Overwrite the style of the line to the current data point
    },
    el: {
        outerwrapper: null
    },
    btnfilterclick: function (el) {
        // Add an action to the stats object
        window.objAnalytics.data.events.push({
            category: 'button',
            action: 'click',
            label: 'open filter panel'
        });
        window.objFilter.show();
    },
    btnbookmarksclick: function (el) {
        // Add an action to the stats object
        window.objAnalytics.data.events.push({
            category: 'button',
            action: 'click',
            label: 'open bookmarks panel'
        });
        window.objBookmarks.show();
    },
    btnexplainclick: function (el) {
        // Add an action to the stats object
        window.objAnalytics.data.events.push({
            category: 'button',
            action: 'click',
            label: 'open help panel'
        });
        window.objExplain.show();
    },
    btnlogoutclick: function (el) {
        // Add an action to the stats object
        window.objAnalytics.data.events.push({
            category: 'button',
            action: 'click',
            label: 'logout'
        });
        window.objLogin.logout();
    },
    showtransparentlayer: function () {
        window.getEl('transparentlayer').style.display = 'block';
    },
    hidetransparentlayer: function () {
        window.getEl('transparentlayer').style.display = 'none';
    },
    isMobile: {
        any: function () {
            return window.getComputedStyle(window.getEl('map'), null).display === 'none';
        }
    },
    retrievechartdata: function (type) {
        var objData = {
            _type: 'json',
            method: 'getworldmapdata',
            token: window.objLogin.token,
            source: type,
            period: 'future'
        }

        // showLoadingPanel();
        window.psv('GET', window.objConfig.urls.dynamicresourceurl, objData, function (err, data) {
            // hideLoadingPanel();
            if (err != null) {
                console.log(err);
                window.objError.show('There was an error retrieving the worldmap data. ' + ((typeof err === 'object') ? JSON.parse(err) : err), true);
            } else {
                // Store data in variable for later use
                window.objData[type] = data;
            }
        });
    },
    // Retrieves oru and mru metadata structures
    retrievemetadata: function () {
        var objData = {
            fulldomain: location.protocol + "//" + location.hostname,
            method: 'getoruandproductdata',
            type: 'json',
            token: window.objLogin.token,
            snapshotid: window.objConfig.currentsnapshotid
        }
        window.psv('GET', window.objConfig.urls.dynamicresourceurl, objData, app.retrievemetadatahandler);
    },
    retrievemetadatahandler: function (err, data) {

        if (err || window.hasProperty(data, 'error')) {
            if (window.hasProperty(data, 'error')) {
                window.objError.show('There was an error retrieving metadata information. ' + ((typeof data === 'object') ? JSON.stringify(data) : data), true);
            } else {
                window.objError.show('There was an error retrieving metadata information. ' + ((typeof err === 'object') ? JSON.stringify(err) : err), true);
            }
        } else {
            // console.log(data);

            // Check if authentication is required
            if (data.hasOwnProperty('authenticated') && !data.authenticated) {
                window.handleShibbolethLoginRequired();
            } else {
                // Load the retrieved data into the ORU object
                window.objOruFilter.json = data.result.orudata;

                // Load the retrieved data into the MRU (product) object
                window.objMruFilter.preparehtml(data.result.productdata);

                // Load the Global Presence and Sustainability data sets
                app.retrievechartdata('sustainability');
                app.retrievechartdata('global_presence');

                // Render the initial view of the app
                app.processinitialview(true);
            }

        }
    },
    start: function (bolShowDetailView) {
        // Init elements with async because elements require external data

        // Hide the login
        window.objLogin.hide();

        // Setup the worldmap, load the data and afterwards show the introduction message
        window.objMap.updatemap(bolShowDetailView, app.showappintromessage);
    },
    showappintromessage: function () {
        // TODO: add logic to show bookmarks, filter or messages
        // objFilter.show();
        var usedAppBefore = window.objStore.getlocalstorageitem('seenAppIntro');

        // TODO: this needs to change so that we can show website updates and app updates independently
        if (!window.isPublicSite()) {
            if ((usedAppBefore && app.state.mobile) || (!app.state.mobile)) {
                window.objLogin.showupdatemessages();
            } else {
                window.objPanelInfo.show('app');
                window.objStore.setlocalstorageitem('seenAppIntro', 'true');
            }
        } else {
            // Mark the seenAppIntro as true for the public version of the site
            window.objStore.setlocalstorageitem('seenAppIntro', 'true');
        }

    },
    getdimensions: function () {
        var self = this;
        self.state.width = document.body.clientWidth;
        self.state.height = document.documentElement["clientHeight"] - (document.documentElement["clientHeight"] * .15) - 250;
        if (self.state.width > self.state.height) {
            self.state.orientation = 'landscape';
        } else {
            self.state.orientation = 'portrait';
        }
    },
    processinitialview: function (bolAuthenticated) {
        var self = this;

        // console.log('processinitialview - bolAuthenticated: %s, current hash: %s', bolAuthenticated, location.hash);
        // debugger;

        // Set or process the information supplied in the hash
        if (location.hash.length > 0) {
            var objPageStateNew = window.objPageState.hash2object(location.hash);
            // console.log(objPageStateNew);
            if (objPageStateNew.hasOwnProperty("error")) {
                // Could not properly parse the hash into a state object - default to standard object
                location.hash = window.objPageState.object2hash(self.defaultpagestate);
            } else {


                if (!bolAuthenticated) {
                    // console.log('in !bolAuthenticated');

                    if (location.hash.indexOf('!/login/') > -1) {
                        // location.hash = objPageState.object2hash(self.defaultpagestate) + "/";
                    } else {
                        // Remember the state so we can return to it after we have passed the authentication step
                        window.objStore.setlocalstorageitem('stateremembered', JSON.stringify(objPageStateNew));

                        // Assure that we will show the login screen
                        objPageStateNew.view = 'login';
                        location.hash = window.objPageState.object2hash(objPageStateNew);
                    }

                } else {
                    // Go to the view originally requested
                    window.objPageState.handlechange(objPageStateNew);
                }
            }


        } else {
            // Attempt to use the old page state (which we stored in app.js) to restore to the view to the state before we were logged out
            if (window.objStore.getlocalstorageitem('stateremembered') !== null) {
                try {
                    var objPageStateRemembered = JSON.parse(window.objStore.getlocalstorageitem('stateremembered'));
                    window.objStore.removelocalstorageitem('stateremembered');
                    location.hash = window.objPageState.object2hash(objPageStateRemembered);
                } catch (e) {
                    window.objStore.removelocalstorageitem('stateremembered');

                    // Set the page state to default
                    location.hash = window.objPageState.object2hash(self.defaultpagestate);
                }


            } else {
                // Set the page state to default
                location.hash = window.objPageState.object2hash(self.defaultpagestate);
            }

        }

    },

    // Initiates the objects in this application
    initobjects: function () {
        var self = this;

        // Retrieve the dimensions
        self.getdimensions();

        // Detect mobile/desktop
        self.state.mobile = self.isMobile.any();

        // Init storage
        window.objStore.init();

        // Init the stats
        window.objAnalytics.init();

        // Init panels
        window.objLogin.init();
        window.objMap.init();
        window.objFooter.init();
        window.objHeader.init();
        window.objOverlay.init();
        window.objRegionInfo.init();
        // window.objSliders.init();
        window.objError.init();
        window.objFilter.init();
        window.objBookmarks.init();
        window.objExplain.init();
        // window.objTrendGraph.init();
        window.objLoading.init();
        window.objPanelInfo.init();

        // Init the filters
        window.objOruFilter.init();
        window.objMruFilter.init();
        window.objDataFilter.init();

        // Change the settings for the zoom/pan based on the device
        if (self.state.ios) {
            window.objZoomPanSettings.dragtimerdelay = 800;
            window.objZoomPanSettings.touchtimerdelay = 300;

            // For status/carrier bar issue
            if (self.state.ios7) {
                window.getEl('title_bar').style.height = "65px";
                window.getEl('info').style.top = "10px";
                window.getEl('btn_back').style.top = "10px";
                window.getEl('toggle_favourite').style.top = "10px";
            }
        }

        // Set the class of the body element to refect the site type
        app.el.outerwrapper.className = window.objConfig.sitetype;

        /*
        This is where it all starts...
        */
        window.objLogin.getsnapshotconfig();
    },

    init: function () {
        var self = this;

        // Load the main html content
        app.el.outerwrapper = window.getEl('content_outer_wrapper');
        self.vars.basehtml = window.serverSideRequest({
            url: window.objConfig.urls.base + '/data/body_content.html?v=' + Math.random(),
            method: 'get',
            debug: false
        });
        var file = location.href.replace(/^(.*)index.*$/, '$1') + 'data/locale-' + window.objConfig.lang + ((window.objConfig.lang === 'en') ? '_US' : '_CN') + '.json';
        if (window.location.href.indexOf('results.philips.com') > -1 || window.location.href.indexOf('resultshub.com') > -1) {
            file = '/publications/ar16/data/locale-' + window.objConfig.lang + ((window.objConfig.lang === 'en') ? '_US' : '_CN') + '.json';
        }

        // Load the translation fragments
        window.psv('GET', file, {
            v: Math.random()
        }, function retrieveFragmentsHandler(err, data) {
            if (err) {
                window.objError.show('There was an error retrieving translation fragments. ' + ((typeof err === 'object') ? JSON.stringify(err) : err), true);
            } else {
                // console.log(data);

                // Attach the data to the objConfig.fragments object
                for (var key in data) {
                    // console.log(key);
                    if (typeof key === 'string') window.objConfig.fragments[key] = data[key];
                }

                // console.log(objConfig.fragments);

                // Start translating stuff

                // Translate fragments in the HTML and inject it back into the UI
                self.vars.basehtml = self.vars.basehtml.replace(/\[([a-zA-Z\d\s_-]*?)\]/g, function replacementHandler(match, contents, offset, s) {
                    return window.translateFragment(contents);
                });

                // Inject the translated HTML into the DOM of our page
                app.el.outerwrapper.innerHTML = self.vars.basehtml;

                // Continue by initiating the onjects of this application
                self.initobjects();
            }
        });
    }
}

// Regular expression to match a valid hash
var regValid = /^#\!\/(login|worldmap|detail?)\/((\w|\d|-)+)\/((\w|\d|-)+)\/((\w|\d|-)+)\/((\w|\d|-)+)\/(filter|faq|help|bookmark|none?)\/((\w|\d|-)+)\/((\w|\d|-)+?)$/g;

var objPageState = {
    state: {
        view: null,
        popup: null,
        filter: {
            datasource: null, // lives improved, global ppresence or sustainability
            orulevel: null, //for worldmap data 1, 2, 3, 4
            oru: null, //selected country/region
            sector: null, //main sector
            mru: null //product group
        }
    },
    stateremembered: {

    },
    vars: {
        processed: 0
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
                mru: self.state.filter.mru,
                datasource: objPageState.state.filter.datasource
            }
        }
    },
    setstateobject: function (obj) {
        var self = this;

        if (obj.hasOwnProperty("view")) self.state.view = obj.view;
        if (obj.hasOwnProperty("popup")) self.state.popup = obj.popup;

        // debugger;
        // console.log('setting state object');
        if (obj.hasOwnProperty("filter")) {
            if (obj.filter.hasOwnProperty("orulevel")) self.state.filter.orulevel = obj.filter.orulevel;
            if (obj.filter.hasOwnProperty("oru")) self.state.filter.oru = obj.filter.oru;
            if (obj.filter.hasOwnProperty("sector")) self.state.filter.sector = obj.filter.sector;
            if (obj.filter.hasOwnProperty("mru")) self.state.filter.mru = obj.filter.mru;
            if (obj.filter.hasOwnProperty("datasource")) self.state.filter.datasource = obj.filter.datasource;
        }
    },
    updatepagestate: function (obj) {
        //  debugger;
        var objCurrentState = objPageState.clonestateobject();

        if (obj.hasOwnProperty("view")) objCurrentState.view = obj.view;
        if (obj.hasOwnProperty("popup")) objCurrentState.popup = obj.popup;


        if (obj.hasOwnProperty("filter")) {
            if (obj.filter.hasOwnProperty("orulevel")) objCurrentState.filter.orulevel = obj.filter.orulevel;
            if (obj.filter.hasOwnProperty("oru")) objCurrentState.filter.oru = obj.filter.oru;
            if (obj.filter.hasOwnProperty("sector")) objCurrentState.filter.sector = obj.filter.sector;
            if (obj.filter.hasOwnProperty("mru")) objCurrentState.filter.mru = obj.filter.mru;
            if (obj.filter.hasOwnProperty("datasource")) objCurrentState.filter.datasource = obj.filter.datasource;
            if (obj.filter.hasOwnProperty("subtype")) objCurrentState.filter.subtype = obj.filter.subtype;
        }


        // debugger;
        // console.log(obj);
        // console.log(objCurrentState);
        // console.log(objPageState.object2hash(objCurrentState));

        location.hash = objPageState.object2hash(objCurrentState);
        objPageState.vars.processed++;
    },
    hash2object: function (strHash) {
        // Converts a hash string into a state javascript object
        // #!/view(1)/orulevel(2)/oru(4)/sector(6)/mru(8)/popup(10)
        // #!/worldmap/2/emea/PD0100/BS9001/none

        if (regValid.test(strHash)) {
            return {
                view: strHash.replace(regValid, "$1"),
                popup: strHash.replace(regValid, "$10"),
                filter: {
                    orulevel: strHash.replace(regValid, "$2"),
                    oru: strHash.replace(regValid, "$4"),
                    sector: strHash.replace(regValid, "$6"),
                    mru: strHash.replace(regValid, "$8"),
                    datasource: strHash.replace(regValid, "$11"),
                    subtype: strHash.replace(regValid, "$13")
                }
            }
        } else {
            return {
                error: true
            };
        }
    },
    object2hash: function (obj) {
        // console.log(obj);
        // #!/view(1)/orulevel(2)/oru(4)/sector(6)/mru(8)/popup(10)
        return '#!/' + obj.view + '/' + obj.filter.orulevel + '/' + obj.filter.oru + '/' + obj.filter.sector + '/' + obj.filter.mru + '/' + obj.popup + '/' + obj.filter.datasource + '/' + (obj.filter.subtype ? obj.filter.subtype : 'all');
    },
    handlechange: function (objPageStateNew) {
        // Check which properties have changed and act accordingly
        var self = this;

        // 0) add the view to the analytics object so that it will be tracked by google analytics
        window.objAnalytics.data.views.push({
            page: location.hash.substr(2),
            title: location.hash.replace(regValid, function () {
                if (objPageStateNew.view === 'login') {
                    return '/login';
                } else {
                    if (window.objOruFilter.json == null) {
                        return '/nothing';
                    } else {
                        // Construct a readable page title (breadcrumb format)
                        // debugger;
                        // console.log(objMruFilter.getmrufilteraxisarray(arguments[8]));
                        var pageName = '/' + arguments[1] + '/' + window.objOruFilter.convertoruleveltomarket(arguments[2]).toLowerCase() + '/' + arguments[4] + '/';

                        var arrAxis = window.objMruFilter.getmrufilteraxisarray(arguments[8]);
                        var arrBreadcrumb = [];
                        for (var a = 0; a < arrAxis.length; a++) {
                            arrBreadcrumb.push(arrAxis[a].name.toLowerCase().replace(/[\s]/gi, '_').replace(/&amp;/, 'and'));
                        }
                        pageName += arrBreadcrumb.join('/') + '/' + arguments[10];


                        // var strGoogleAnalyticsPath = '/' + arguments[1] + '/' + objOruFilter.convertoruleveltomarket(arguments[2]).toLowerCase() + '/' + arguments[4] + '/' + arguments[6] + '/' + arguments[8] + '/' + arguments[10];
                        // console.log(pageName);

                        return pageName;
                    }
                }
            })
        });

        // 1) check if a filter has changed
        var bolFilterChangeDetected = false,
            bolFilterOruLevelChanged = false,
            bolFilterOruChanged = false,
            bolFilterSectorChanged = false,
            bolFilterMruChanged = false,
            bolFilterDataChanged = false,
            bolFromLogin = false;
        if (self.state.filter.orulevel !== objPageStateNew.filter.orulevel) {
            bolFilterOruLevelChanged = true;
            bolFilterChangeDetected = true;
        }
        if (self.state.filter.oru !== objPageStateNew.filter.oru) {
            bolFilterOruChanged = true;
            bolFilterChangeDetected = true;
        }
        if (self.state.filter.sector !== objPageStateNew.filter.sector) {
            bolFilterSectorChanged = true;
            bolFilterChangeDetected = true;
        }
        if (self.state.filter.mru !== objPageStateNew.filter.mru) {
            bolFilterMruChanged = true;
            bolFilterChangeDetected = true;
        }

        if (self.state.filter.datasource !== objPageStateNew.filter.datasource || self.state.filter.subtype !== objPageStateNew.filter.subtype) {
            bolFilterDataChanged = true;
            bolFilterChangeDetected = true;
        }

        // 2) check we we are coming from login
        if (self.state.view === 'login' && objPageStateNew.view !== 'login') bolFromLogin = true;

        // 3) show the transparent layer one time only
        if (self.state.mobile && self.state.initialmapview && bolFromLogin && objPageStateNew.view !== 'login') app.showtransparentlayer();

        // 4) handle view change
        // console.log(self.state.view);
        // console.log(objPageStateNew.view);

        if (self.state.view !== objPageStateNew.view) {
            // console.log('viewchange detected: self.state.view=' + self.state.view + ' - objPageStateNew.view=' + objPageStateNew.view);
            switch (objPageStateNew.view) {
                case 'worldmap':
                    self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, false, bolFilterDataChanged);
                    break;
                case 'login':
                    self.stateremembered = self.clonestateobject();
                    self.setstateobject(objPageStateNew);
                    window.objLogin.show();
                    break;
                case 'detail':
                    self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, true, bolFilterDataChanged);
                    break;
            }
        } else {

            // 5) handle filter change
            if (bolFilterChangeDetected) {
                // console.log('filter change detected');
                // if the detail view is open then we need to reload the data in it
                if (objPageStateNew.view === 'detail') {
                    self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, true, bolFilterDataChanged);
                } else {
                    // Called when a change in the filter panel has occured

                    self.updateworldmapview(objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, false, bolFilterDataChanged);
                }
            } else {
                // 6) handle a popup panel change

            }

        }

        // 8) Set the oru level as an attribute on the body
        window.objOruFilter.setdatalevelattribute(objPageState.state.filter.orulevel);

        // 7) open the filter panel if this is the public website
        // if (window.isPublicSite() && !window.objFilter.state.visible) window.objFilter.show();

        // debugger;
        self.setstateobject(objPageStateNew);
    },
    updateworldmapview: function (objPageStateNew, bolFilterSectorChanged, bolFilterMruChanged, bolFilterOruLevelChanged, bolFilterOruChanged, bolShowDetailsPanel, bolFilterDataChanged) {
        var self = this;
        // debugger;
        if (typeof window.objMap.data === "object" && !bolFilterSectorChanged && !bolFilterMruChanged && !bolFilterOruLevelChanged && bolFilterOruChanged) {
            if (objPageStateNew.view === 'detail') {
                self.setstateobject(objPageStateNew);

                window.objMap.detailspanel();
            } else {
                // This assumes that we are hitting 'back' from a details panel
                if (self.state.filter.datasource !== objPageStateNew.filter.datasource) {
                    //debugger;
                    window.objMap.updatemap(false, app.showappintromessage);
                }
                window.objRegionInfo.hide();
                window.objMap.hideSelectedCountries();

                // Set the header
                window.objHeader.setregionname(window.objMap.state.mapname);
            }
        } else {
            // Load the svg map, the map data and open the details panel afterwards
            self.setstateobject(objPageStateNew);
            window.objOruFilter.settocurrentoru();
            // Reload all the data
            if (bolShowDetailsPanel) {
                app.start(true);
            } else {
                app.start();
            }
        }


    },
    copyfilterattributes: function (objPageStateNew) {
        if (self.state.filter.orulevel !== objPageStateNew.filter.orulevel) {
            self.state.filter.orulevel = objPageStateNew.filter.orulevel;
        }
        if (self.state.filter.oru !== objPageStateNew.filter.oru) {
            self.state.filter.oru = objPageStateNew.filter.oru;
        }
        if (self.state.filter.sector !== objPageStateNew.filter.sector) {
            self.state.filter.sector = objPageStateNew.filter.sector;
        }
        if (self.state.filter.mru !== objPageStateNew.filter.mru) {
            self.state.filter.mru = objPageStateNew.filter.mru;
        }
    },
    init: function () {
        var self = this;

    }
}

var objAnalytics = {
    data: {
        views: [], // Contains an array of objects to send to google analytics { page: '/start', title: 'My New Page Title' }
        events: [] // Contains an array of objects with the events to send to google analytics {category: 'button' /*required - object that was interacted with*/, action: 'click' /*required - type of interaction*/, label: 'some description' /*optional - used for categorization of events*/, value: 1 /*optional - counter*/ }
    },
    state: {
        enabled: (location.href.indexOf('www.results.philips.com') === -1)
    },
    // This self-calling function will check the data object on fixed intervals and populate Google Analytics with the data accordingly
    asyncanalytics: function () {
        var self = this;

        // Send the views to Google Analytics
        for (var a = 0; a < self.data.views.length; a++) {
            // Send the view to google analytics
            if (self.state.enabled) window.ga('send', 'pageview', self.data.views[a]);

            if (a === (self.data.views.length - 1)) {
                // Last element -> clear out the array
                self.data.views.length = 0;
            }
        }

        // Send the events to Google Analytics
        for (var a = 0; a < self.data.events.length; a++) {
            // debugger;
            if (self.data.events[a].hasOwnProperty("category") && self.data.events[a].hasOwnProperty("action")) {
                switch (Object.keys(self.data.events[a]).length) {
                    case 2:
                        if (self.state.enabled) window.ga('send', 'event', self.data.events[a].category, self.data.events[a].action);
                        break;
                    case 3:
                        if (self.data.events[a].hasOwnProperty("label")) {
                            if (self.state.enabled) window.ga('send', 'event', self.data.events[a].category, self.data.events[a].action, self.data.events[a].label);
                        }
                        break;
                    case 4:
                        if (self.data.events[a].hasOwnProperty("label") && self.data.events[a].hasOwnProperty("value")) {
                            if (self.state.enabled) window.ga('send', 'event', self.data.events[a].category, self.data.events[a].action, self.data.events[a].label, self.data.events[a].value);
                        }
                        break;
                    default:
                        // Incorrect number of properties
                        break;
                }
            }

            if (a === (self.data.events.length - 1)) {
                // Last element -> clear out the array
                self.data.events.length = 0;
            }
        }

        // Calls this function again
        var intTimerId = window.setTimeout(function () {
            objAnalytics.asyncanalytics();
        }, 500);

    },

    init: function () {
        var self = this;

        if (self.state.enabled) {

            // Inject analytics.js
            (function (i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
                a = s.createElement(o),
                    m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', ((location.href.indexOf('http') > -1) ? '//www.google-analytics.com/analytics.js' : 'js/lib/analytics.js'), 'ga');

            // Create the tracker
            var options;
            if (location.href.indexOf('http') > -1) {
                options = 'auto';
            } else {
                // We are running inside the app
                options = {
                    'storage': 'none',
                    'clientId': window.objStore.getlocalstorageitem('statguid')
                };
            }
            window.ga('create', 'UA-52778332-1', options);

            // Assure that we will always use https to communicate with google
            window.ga('set', 'forceSSL', true);

            // Send an initial hit to the server
            window.ga('send', 'pageview', {
                page: '/start' + ((location.href.indexOf('http') > -1) ? '/website' : '/app')
            });

            // Start the async checker
            self.asyncanalytics();
        }

    }

}

window.onresize = function () {
    var self = this;
    // Update the width and height variables
    app.getdimensions();
    try {
        if (!app.isMobile.any()) {
            // Rework the dimensions of the map based on the new dimensions of the window
            window.objMap.resizeworldmap();

            // Center the worldmap
            window.objMap.centerworldmap(window.objMap.el.rootanimate);

            // On the public version of the application, stretch the worldmap to the maximum size of the window
            if (window.isPublicSite()) window.objMap.maximizeworldmap(window.objMap.el.rootanimate);

            window.objRegionInfo.hide();
        }
    } catch (e) {
        //
    }

};

window.onhashchange = function () {
    // Parse the received hash into the objPageState.state object
    // debugger;
    var objPageStateNew = objPageState.hash2object(location.hash);

    // debugger;
    // console.log(objPageStateNew);
    if (objPageStateNew.hasOwnProperty("error")) {
        // Could not properly parse the hash into a state object - default to standard object
        location.hash = objPageState.object2hash(app.defaultpagestate);
    } else {
        // Go to the view requested
        objPageState.handlechange(objPageStateNew);
    }
}

window.objData = {};
