var app = {
    state: {
        width: null,
        height: null,
        mobile: null,
        mobileortablet: null,
        ios: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false),
        ios7: (navigator.userAgent.match(/OS 7_/g) ? true : false),
        ipad: (navigator.userAgent.match(/(iPad)/g) ? true : false),
        orientation: '',
        ie: !!window.MSStream,
        webbrowser: ((location.href.indexOf('http') > -1)),
        initialmapview: true,
        inframe: (top !== self)
    },
    vars: {
        basehtml: null

    },
    defaultpagestate: {
        view: 'detail',
        popup: 'none',
        filter: {
            datasource: 'lives_improved', // Data source to use
            subtype: 'all', // Data point to show
            orulevel: '1', // For worldmap data 1, 2, 3, 4
            oru: 'world', // Selected country/region
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
            // window.matchMedia("only screen and (max-width: 760px)")
            return window.getComputedStyle(window.getEl('map'), null).display === 'none';
        },
        mobileortablet: function () {
            var check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        }
    },

    setmainwrapperclass: function () {
        window.app.el.outerwrapper.className = window.objConfig.sitetype +
            ' ' + window.objPageState.state.filter.sector +
            ' view-' + window.objPageState.state.view +
            ' datasource-' + window.objPageState.state.filter.datasource +
            ' subtype-' + window.objPageState.state.filter.subtype +
            ' orulevel-' + window.objPageState.state.filter.orulevel +
            ' oru-' + window.objPageState.state.filter.oru +
            ' sector-' + window.objPageState.state.filter.sector +
            ' mru-' + window.objPageState.state.filter.mru +
            ' nrdatasources-' + window.objConfig.datasources.length;
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

                // Post process the large ORU data object
                window.objOruFilter.postprocessorudata();

                // Load the retrieved data into the MRU (product) object
                window.objMruFilter.preparehtml(data.result.productdata);

                /*
                Start loading the sustainability and global_precense data (we do this once and retain them in memory)
                */

                if (window.objConfig.datasources.indexOf('sustainability') > -1) {
                    app.retrievesustainabilitydata();
                } else if (window.objConfig.datasources.indexOf('global_presence') > -1) {
                    app.retrieveglobalpresencedata();
                } else {
                    // Render the initial view of the app
                    app.processinitialview(true);
                }

                // Load the Global Presence and Sustainability data sets

            }

        }
    },
    retrievesustainabilitydata: function () {

        var objData = {
            _type: 'json',
            method: 'getworldmapdata',
            token: window.objLogin.token,
            source: 'sustainability',
            period: window.objConfig.datatype
        }

        // showLoadingPanel();
        window.psv('GET', window.objConfig.urls.dynamicresourceurl, objData, function (err, data) {
            // hideLoadingPanel();
            if (err != null) {
                console.log(err);
                window.objError.show('There was an error retrieving the sustainability data. ' + ((typeof err === 'object') ? JSON.parse(err) : err), true);
            } else {
                // Store data in variable for later use
                window.objData['sustainability'] = data;

                if (window.objConfig.datasources.indexOf('global_presence') > -1) {
                    // Load the global presence data
                    app.retrieveglobalpresencedata();
                } else {
                    // Render the initial view of the app
                    app.processinitialview(true);
                }
            }
        });

    },
    retrieveglobalpresencedata: function () {

        var objData = {
            _type: 'json',
            method: 'getworldmapdata',
            token: window.objLogin.token,
            source: 'global_presence',
            period: window.objConfig.datatype
        }

        // showLoadingPanel();
        window.psv('GET', window.objConfig.urls.dynamicresourceurl, objData, function (err, data) {
            // hideLoadingPanel();
            if (err != null) {
                console.log(err);
                window.objError.show('There was an error retrieving the Global Presence data. ' + ((typeof err === 'object') ? JSON.parse(err) : err), true);
            } else {
                // Store data in variable for later use
                window.objData['global_presence'] = data;

                // Render the initial view of the app
                app.processinitialview(true);
            }
        });

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
        self.state.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        self.state.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        // document.documentElement.clientHeight - (document.documentElement.clientHeight * .15) - 250;

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
        self.state.mobileortablet = self.isMobile.mobileortablet();

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
        self.setmainwrapperclass();

        // Set the class of the body element if we are running in an iframe
        if (app.state.inframe) window.toggleClass(document.body, 'inframe', true);

        /*
        This is where it all starts...
        */
        window.objLogin.getsnapshotconfig();
    },

    retrievetranslationfragments: function (errorMessage, htmlBody) {
        if (errorMessage) {
            window.objError.show(errorMessage, true);
        } else {

            window.app.vars.basehtml = htmlBody;
            var file = location.href.replace(/^(.*)index.*$/, '$1') + 'data/locale-' + window.objConfig.lang + ((window.objConfig.lang === 'en') ? '_US' : '_CN') + '.json';
            if (window.location.href.indexOf('results.philips.com') > -1 || window.location.href.indexOf('resultshub.com') > -1) {
                file = '/publications/ar16/data/locale-' + window.objConfig.lang + ((window.objConfig.lang === 'en') ? '_US' : '_CN') + '.json';
            }

            // Load the translation fragments
            window.psv('GET', file, {
                v: window.pageVars.version
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
                    window.app.reworkbasehtml();

                }
            });
        }

    },

    reworkbasehtml: function () {

        /*
        1) Translate placeholders in the HTML with translated text fragments
        */
        // Translate fragments in the HTML and inject it back into the UI
        window.app.vars.basehtml = window.app.vars.basehtml.replace(/\[([a-zA-Z\d\s_-]*?)\]/g, function replacementHandler(match, contents, offset, s) {
            return window.translateFragment(contents);
        });

        // Inject the translated HTML into the DOM of our page
        app.el.outerwrapper.innerHTML = window.app.vars.basehtml;

        /*
        2) Rework the HTML structure based on the datasources that we need to display in this version of the map
        */

        // 2a) Remove the tabs from the HTML if we do not need them
        var arrDataSourceTabs = document.getElementsByClassName('datafilter');
        var tabIdsToRemove = [];
        for (var i = 0; i < arrDataSourceTabs.length; i++) {
            var key = arrDataSourceTabs[i].id.replace(/tab_/, '');
            if (window.objConfig.datasources.indexOf(key) === -1) {
                tabIdsToRemove.push(arrDataSourceTabs[i].id);
            }
        }

        tabIdsToRemove.forEach(function (id) {
            document.getElementById(id).parentNode.removeChild(document.getElementById(id));
        })

        // Continue by initiating the objects of this application
        window.app.initobjects();
    },

    init: function () {
        var self = this;

        // Dynamically adjust the default page state object based on the datasources that we want to show
        app.defaultpagestate.filter.datasource = window.objConfig.datasources[0];

        // Load the main html content using an ajax call
        self.el.outerwrapper = window.getEl('content_outer_wrapper');
        window.serverSideRequest({
            url: window.objConfig.urls.base + '/data/body_content.html?v=' + window.pageVars.version,
            method: 'get',
            debug: false,
            callback: window.app.retrievetranslationfragments
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
            datasource: null, // Values: lives improved, global_presence or sustainability
            subtype: null, // Subtype filter in the data (i.e. only show co2 from the sustainability dataset)
            orulevel: null, // For worldmap data 1, 2, 3, 4
            oru: null, // Selected country/region
            sector: null, // Selected main sector
            mru: null // Product group
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
            if (obj.filter.hasOwnProperty("subtype")) self.state.filter.subtype = obj.filter.subtype;
        }
    },

    // Method used to change the page state and then update the hash
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

    // Calculates the delta between two state objects
    calculatestatedelta: function (currentState, newState) {
        var deltaState = {
            filter: {}
        };
        for (var keyCurrentLevel1 in currentState) {
            if (typeof keyCurrentLevel1 === 'string') {
                if (newState.hasOwnProperty(keyCurrentLevel1)) {
                    if (keyCurrentLevel1 === 'filter') {
                        if (newState.hasOwnProperty('filter')) {
                            for (var keyCurrentLevel2 in currentState.filter) {
                                if (typeof keyCurrentLevel2 === 'string') {
                                    if (newState.filter.hasOwnProperty(keyCurrentLevel2)) {
                                        if (currentState.filter[keyCurrentLevel2] !== newState.filter[keyCurrentLevel2]) {
                                            deltaState.filter[keyCurrentLevel2] = newState.filter[keyCurrentLevel2];
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (currentState[keyCurrentLevel1] !== newState[keyCurrentLevel1]) {
                            deltaState[keyCurrentLevel1] = newState[keyCurrentLevel1];
                        }
                    }
                }
            }
        }

        // Strip empty filter element

        return deltaState;
    },

    handlechange: function (objPageStateNew) {
        // Check which properties have changed and act accordingly
        var self = this;

        // Calculate the delta between the current and the new state
        var objPageStateDelta = self.calculatestatedelta(self.state, objPageStateNew);

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
            bolFilterDataChanged = false,
            bolFilterDataSubTypeChanged = false,
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
            bolFilterChangeDetected = true;
        }
        if (self.state.filter.mru !== objPageStateNew.filter.mru) {
            bolFilterChangeDetected = true;
        }

        if (self.state.filter.datasource !== objPageStateNew.filter.datasource) {
            bolFilterDataChanged = true;
            bolFilterChangeDetected = true;

            // Update the filter object
            window.objDataFilter.state.filter.datasource = objPageStateNew.filter.datasource;
        }

        if (self.state.filter.subtype !== objPageStateNew.filter.subtype) {
            bolFilterDataSubTypeChanged = true;
            bolFilterChangeDetected = true;

            // Update the filter object
            window.objDataFilter.state.filter.subtype = objPageStateNew.filter.subtype;
        }


        console.log('+---------------------------------------+');
        // console.trace();
        console.log('- self.state: ' + JSON.stringify(self.state, null, '  '));
        console.log('- objPageStateNew: ' + JSON.stringify(objPageStateNew, null, '  '));
        console.log('- objPageStateDelta: ' + JSON.stringify(objPageStateDelta, null, '  '));
        // console.log('- bolFilterChangeDetected: ' + bolFilterChangeDetected);
        // console.log('- bolFilterOruLevelChanged: ' + bolFilterOruLevelChanged);
        // console.log('- bolFilterOruChanged: ' + bolFilterOruChanged);
        // console.log('- bolFilterSectorChanged: ' + bolFilterSectorChanged);
        // console.log('- bolFilterMruChanged: ' + bolFilterMruChanged);
        // console.log('- bolFilterDataChanged: ' + bolFilterDataChanged);
        // console.log('- bolFilterDataSubTypeChanged: ' + bolFilterDataSubTypeChanged);
        // console.log('- bolFromLogin: ' + bolFromLogin);
        console.log('+---------------------------------------+');

        // 2) check we we are coming from login
        if (self.state.view === 'login' && objPageStateNew.view !== 'login') bolFromLogin = true;

        // 3) show the transparent layer one time only
        if (self.state.mobileortablet && self.state.initialmapview && bolFromLogin && objPageStateNew.view !== 'login') app.showtransparentlayer();



        if (bolFilterOruLevelChanged || bolFilterDataChanged || bolFilterDataSubTypeChanged) {
            // Retrieve all the datatypes for this geographical region
            window.objMap.datatypes = window.objMap.createdatatypelistforregions(objPageStateNew.filter.orulevel);

            // Render the datatypes as sub elements in the tabs
            window.objDataFilter.renderdatasubtypefilters();

            // Update the UI so that the correct panels get the selected state
            if (objPageStateNew.filter.subtype !== 'all') {
                // Update the subtype
                window.objDataFilter.subtypechanged(objPageStateNew.filter.datasource, objPageStateNew.filter.subtype)
            } else {
                // Update the datasource
                window.objDataFilter.datasourcechanged(objPageStateNew.filter.datasource)
            }
        }


        if (bolFilterOruChanged && objPageStateNew.filter.datasource !== 'lives_improved') {
            window.objRegionInfo.setdetailspanel(objPageStateNew.filter.datasource, objPageStateNew.filter.subtype)
        }


        // 4) handle view change
        // debugger;
        // console.log(self.state.view);
        // console.log(objPageStateNew.view);

        if (self.state.view !== objPageStateNew.view) {
            // console.log('viewchange detected: self.state.view=' + self.state.view + ' - objPageStateNew.view=' + objPageStateNew.view);
            switch (objPageStateNew.view) {
                case 'login':
                    self.stateremembered = self.clonestateobject();
                    self.setstateobject(objPageStateNew);
                    window.objLogin.show();
                    break;
                default:
                    self.updateworldmapview(objPageStateNew, objPageStateDelta);
                    break;
            }
        } else {

            // 5) handle filter change
            if (bolFilterChangeDetected) {
                // console.log('filter change detected');
                self.updateworldmapview(objPageStateNew, objPageStateDelta);

            } else {
                // 6) handle a popup panel change

            }

        }

        // 8) Set the oru level as an attribute on the body
        window.objOruFilter.setdatalevelattribute(objPageStateNew.filter.orulevel);

        // 7) open the filter panel if this is the public website
        // if (window.isPublicSite() && !window.objFilter.state.visible) window.objFilter.show();

        // Update the current state object with the new one
        self.setstateobject(objPageStateNew);

        // Set the main wrapper class
        window.app.setmainwrapperclass();
    },


    updateworldmapview: function (objPageStateNew, objPageStateDelta) {
        var self = this;

        // Update current page state with the one we have just received
        self.setstateobject(objPageStateNew);

        // Detect if we are dealing with a minor or a mojor change in the UI
        var bolMajorChange = false;
        if (objPageStateDelta.hasOwnProperty('filter')) {
            if (
                objPageStateDelta.filter.hasOwnProperty('orulevel') ||
                objPageStateDelta.filter.hasOwnProperty('datasource') ||
                objPageStateDelta.filter.hasOwnProperty('sector')
            ) bolMajorChange = true;
        }

        console.log('- bolMajorChange: ' + bolMajorChange);

        // Select the correct data source UI element        

        // debugger;
        if (typeof window.objMap.data === "object" && bolMajorChange === false) {

            /*
            Deal with minor state change (for example a click on a geographical region)
            */

            // Update the colors in the map            
            if (objPageStateDelta.hasOwnProperty('filter') && (objPageStateDelta.filter.hasOwnProperty('subtype'))) {
                window.objMap.updatemap((objPageStateNew.view === 'detail'), app.showappintromessage);
            }

            if (objPageStateNew.view === 'detail') {

                window.objMap.detailspanel();
            } else {
                // This assumes that we are hitting 'back' from a details panel

                window.objRegionInfo.hide();
                window.objMap.hideselectedcountries();

                // Set the header
                window.objHeader.setregionname(window.objMap.state.mapname);
            }
        } else {
            /*
            Deal with major state change (for example a selecting a new worldmap)
            */

            // Load the svg map, the map data and open the details panel afterwards
            window.objOruFilter.settocurrentoru();

            // Reload all the data
            if (objPageStateNew.view === 'detail') {
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