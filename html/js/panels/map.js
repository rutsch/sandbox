var objMap = {
    state: {
        visible: null
    },
    el: {
        mapwrapper: null
    },
    vars: {
        showdetailview: false,
        regionidtoshow: null //contains the region id of the details panel to show
    },
    data: null,
    maps: {
        world: {
            url: 'jvector_world.svg'
        },
        region: {
            url: 'philips_regions.svg'
        },
        market: {
            url: 'philips_markets.svg'
        },
        country: {
            url: 'jvector_countries.svg'
        }
    },
    getcolorforpercentage: function (pct, lowColor, middleColor, highColor) {
        var self = this;
        var useMiddleColor = true;

        //console.log('pct: ' + pct);
        pct /= 100;
        //console.log('pct (%): ' + pct);


        var percentColors = [{
                pct: 0.0000001,
                color: lowColor
            },
            {
                pct: 0.5,
                color: middleColor
            },
            {
                pct: 1.0,
                color: highColor
            }
        ];

        // Settings for using two colors
        var indexHigh = 2;
        var indexLow = 0;

        // Settings for using three colors
        if (useMiddleColor) {
            if (pct <= 0.5) {
                indexHigh = 1;
                pct = pct * 2;
            } else {
                indexLow = 1;
                indexHigh = 2;
                pct = (pct - 0.5) * 2;
            }
        }

        // Return the calculated RGB value
        return 'rgb(' + colourGradientor(pct, [percentColors[indexHigh].color.r, percentColors[indexHigh].color.g, percentColors[indexHigh].color.b], [percentColors[indexLow].color.r, percentColors[indexLow].color.g, percentColors[indexLow].color.b]).join(',') + ')';
    },
    /*
     * Data functions
     */
    // Retrieves the svg data for the map
    retrieveworldmapsvg: function () {
        var self = this;

        window.objTouchVars.elanimate = null;
        self.state.mapname = window.objOruFilter.convertoruleveltomarket(window.objPageState.state.filter.orulevel);

        // Attempt to retrieve the svg data from localstorage
        var svgdata = window.objStore.getlocalstorageitem('map_' + self.state.mapname + '_v5');

        // Test if real SVG data was returned from the local storage
        var performAjax = true;
        if (svgdata) {
            if (svgdata.indexOf('<svg') > -1) performAjax = false;
        }

        if (!performAjax) {
            return svgdata.replace(/fill:#00ffff/g, '');
        } else {
            // Load svg data via http
            var arrFormData = [];
            arrFormData['type'] = 'xml';
            arrFormData['file'] = self.maps[self.state.mapname.toLowerCase()].url;
            arrFormData['method'] = 'getsvgworldmap';
            arrFormData['fulldomain'] = location.protocol + "//" + location.hostname;
            arrFormData['token'] = window.objLogin.token;
            arrFormData['v'] = Math.random();

            svgdata = window.serverSideRequest({
                url: window.objConfig.urls.authurl2,
                formdata: arrFormData,
                method: 'get',
                debug: false
            });

            svgdata = svgdata.replace(/fill:#00ffff/g, '');

            if (typeof svgdata === 'string') {
                window.objStore.setlocalstorageitem('map_' + self.state.mapname + '_v5', svgdata);
                return svgdata;
            } else {
                return "";
            }

        }


    },

    // Retrieves the lives improved data
    getworldmapdata: function () {
        var self = this;

        var objData;

        // debugger;
        switch (window.objDataFilter.state.filter.datasource) {
            case "lives_improved":
            case "":
                objData = {
                    fulldomain: location.protocol + "//" + location.hostname,
                    method: 'getworldmapdata',
                    type: 'json',
                    token: window.objLogin.token,
                    oru: window.objPageState.state.filter.orulevel,
                    mru: window.objPageState.state.filter.mru,
                    snapshotid: window.objConfig.currentsnapshotid
                }
                //showLoadingPanel();
                window.psv('GET', window.objConfig.urls.dynamicresourceurl, objData, function getWorldmapDataHandler(err, data) {
                    //hideLoadingPanel();
                    if (err != null) {
                        console.log(err);
                        window.objError.show('There was an error retrieving the worldmap data. ' + ((typeof err === 'object') ? JSON.parse(err) : err), true);
                    } else {
                        // Check if authentication is required
                        if (data.hasOwnProperty('authenticated') && !data.authenticated) {
                            window.handleShibbolethLoginRequired();
                        } else {
                            if (data.hasOwnProperty('error')) {
                                window.objError.show('There was an error retrieving the worldmap data. ' + data.error.message, true);
                            } else {
                                self.postprocessworldmapdata(data);
                            }
                        }
                    }
                });
                break;
            case 'sustainability':
                self.postprocessworldmapdata(window.objData.sustainability);

                break;
            case 'global_presence':
                self.postprocessworldmapdata(window.objData.global_presence);

                break;


        }

    },
    createDataTypeListForRegions: function(regions) {
        var self = this,
            listSustain = [],
            listGlobal = [];
        regions.forEach(function(region) {
            listSustain = [];
            listGlobal = [];
            var regionId = 'philips_' + region.getAttribute('id');
            // loop through object properties
            // debugger;
            for (var key in window.objData.sustainability.snapshotdata[regionId]) {
                if (window.objData.sustainability.snapshotdata[regionId].hasOwnProperty(key)) {
                    // do stuff
                    listSustain.push(key);
                }
            }
            for (var key in window.objData.global_presence.snapshotdata[regionId]) {
                if (window.objData.global_presence.snapshotdata[regionId].hasOwnProperty(key)) {
                    // do stuff
                    listGlobal.push(key);
                }
            }
            // $.each(self.data[region], function(key, value) {
            //     list.push(key);
            // });
        });
        return {
            global_presence: listGlobal,
            sustainability: listSustain
        };
    },
    postprocessworldmapdata: function (data) {
        var self = this;

        objLoading.show();
        /*
        0) update the ui to set if we will use the simulator or not
        */
        // if (data.hasOwnProperty('usesimulator')) objSliders.togglesimulator(data.usesimulator);

        /*
		1) store the data in this object as a property
		*/
        self.data = data.snapshotdata;

        /*
		2) retrieve the elements from the svg that we need to color
		*/
        var elSvgWrapper = getEl('svgcontentwrapper');
        //console.log(elSvgWrapper);
        var arrRegions = getFirstLevelChildElements(elSvgWrapper, 'path');
        if (arrRegions.length == 0) arrRegions = getFirstLevelChildElements(elSvgWrapper, 'g')

        /*
		3) set the proper coloring
		*/

        // If oru not world and datafilter subtype not all, calculate percentages

        if (objOruFilter.state.selectedoru !== 1 && ((objDataFilter.state.filter.datasource === 'global_presence' || objDataFilter.state.filter.datasource === 'sustainability') && objDataFilter.state.filter.subtype !== 'all') || objDataFilter.state.filter.datasource === 'lives_improved') {
            var property = 'l';
            //analyze the data we have received
            var intLivesImprovedPercentageMax = 0;
            var intLivesImprovedPercentageMin = 100;
            if (objDataFilter.state.filter.datasource === 'lives_improved') {
                for (var key in self.data) {
                    if (self.data[key].l >= 0) {

                        var livesImprovedPercentage = (self.data[key].l * 100 / self.data[key].p);
                        if (livesImprovedPercentage > intLivesImprovedPercentageMax) intLivesImprovedPercentageMax = livesImprovedPercentage;
                        if (livesImprovedPercentage < intLivesImprovedPercentageMin) intLivesImprovedPercentageMin = livesImprovedPercentage;
                    }
                }
            } else {
                for (var key in self.data) {
                    if (self.data[key][objDataFilter.state.filter.subtype] >= 0) {

                        var livesImprovedPercentage = (self.data[key][objDataFilter.state.filter.subtype] * 100 / self.data['philips_world'][objDataFilter.state.filter.subtype]);
                        if (livesImprovedPercentage > intLivesImprovedPercentageMax) intLivesImprovedPercentageMax = livesImprovedPercentage;
                        if (livesImprovedPercentage < intLivesImprovedPercentageMin) intLivesImprovedPercentageMin = livesImprovedPercentage;
                    }
                }

            }

            console.log(' - intLivesImprovedPercentageMax: '+intLivesImprovedPercentageMax+' - intLivesImprovedPercentageMin: '+intLivesImprovedPercentageMin);
        } else {
            intLivesImprovedPercentageMax = 100;
            intLivesImprovedPercentageMin = 100;
        }


        //settings for the coloring
        var minimumPercentage = 0; //anything below this percentage will get the 'low' color
        var factor = (intLivesImprovedPercentageMax - intLivesImprovedPercentageMin) / (100 - minimumPercentage);

        //calculate rgb colors if needed
        if (!objConfig.colors[objPageState.state.filter.sector].hasOwnProperty('rgb')) {
            objConfig.colors[objPageState.state.filter.sector].rgb = {};
            objConfig.colors[objPageState.state.filter.sector].rgb.low = rgbFromHex(objConfig.colors[objPageState.state.filter.sector].low);
            objConfig.colors[objPageState.state.filter.sector].rgb.middle = rgbFromHex(objConfig.colors[objPageState.state.filter.sector].middle);
            objConfig.colors[objPageState.state.filter.sector].rgb.high = rgbFromHex(objConfig.colors[objPageState.state.filter.sector].high);
        }

        //console.log(JSON.stringify(objConfig.colors[objPageState.state.filter.sector]))
        //console.log('- factor: ' + factor + ', liMax: ' + intLivesImprovedPercentageMax + ', liMin: ' + intLivesImprovedPercentageMin);
        //console.log('* ' + JSON.stringify(self.getcolorforpercentage(50, objConfig.colors[objPageState.state.filter.sector].low, objConfig.colors[objPageState.state.filter.sector].middle, objConfig.colors[objPageState.state.filter.sector].high)));
        //alert('stop');

        var percentageMax = 0,
            percentageMin = 100;

        for (var i = 0; i < arrRegions.length; i++) {
            var region = arrRegions[i],
            regionId = region.id == 'UK' ? 'GB' : region.id,
            key = objPageState.state.filter.mru + '_' + (objPageState.state.filter.orulevel != 4 ? regionId.toLowerCase() : regionId),
            regionData = (self.data[key]) ? self.data[key] : false;

            //console.log(key+' - '+regionData);
            // debugger;
            if (regionData) {
                var percentageLI;
                if (objDataFilter.state.filter.datasource === 'lives_improved') {
                    //calculate percentage lives improved and store that in the worldmapdata object
                    percentageLI = (regionData.l * 100) / regionData.p || 0;
                } else {
                    if (objDataFilter.state.filter.subtype !== 'all') {
                        percentageLI = (regionData[objDataFilter.state.filter.subtype] * 100) / self.data['philips_world'][objDataFilter.state.filter.subtype] || 0;
                    } else {
                        percentageLi = 100;
                    }
                }

                self.data[key].percentageLI = percentageLI;


                //add colors to the map
                var color = objConfig.colors[objPageState.state.filter.sector].middle;
                self.data[key].color = objConfig.colors[objPageState.state.filter.sector].middle;

                //calculate the color to place on the map
                var percentageForColor = 80;
                if (intLivesImprovedPercentageMax > intLivesImprovedPercentageMin) {
                    percentageForColor = (percentageLI - intLivesImprovedPercentageMin) / factor + minimumPercentage;
                }

                // Correct for percentages above 100 and below 0
                if (percentageForColor >= 100) percentageForColor = 100;
                if (percentageForColor < 0) percentageForColor = 0;

                if (percentageForColor > percentageMax) percentageMax = percentageForColor;
                if (percentageForColor < percentageMin) percentageMin = percentageForColor;

                self.intLivesImprovedPercentageMin = percentageMin;
                self.intLivesImprovedPercentageMax = percentageMax;
                //console.log('- regionId: ' + regionId + ', percentageLI: ' + percentageLI + ', percentageForColor: ' + percentageForColor);
                var colorToSet = self.getcolorforpercentage(percentageForColor, objConfig.colors[objPageState.state.filter.sector].rgb.low, objConfig.colors[objPageState.state.filter.sector].rgb.middle, objConfig.colors[objPageState.state.filter.sector].rgb.high);

                //JT: shouldn't objConfig.hideinactivecountries be part of the MruFilter object??
                if (regionData.l <= 100 && objConfig.hideinactivecountries) {
                    colorToSet = '#999';
                }

                region.style.fill = colorToSet;

                var paths = region.getElementsByTagName('*');
                for (var ii = 0; ii < paths.length; ii++) {
                    var path = paths[ii];
                    if (path.nodeName == 'path' || path.nodeName == 'polygon' || path.nodeName == 'rect' || path.nodeName == 'g' || path.nodeName == 'polyline') {
                        paths[ii].style.fill = colorToSet;
                        //paths[ii].style.opacity=1;
                    }
                }
                //JT: end change
            } else {
                region.style.fill = '#999';
            }
        }



        /*
		4) perform post processing (set events and center map)
		*/
        //retrieve the base svg elements
        self.el.rootanimate = getEl('viewport');
        self.el.rootsvg = getEl('holder_1000').getElementsByTagName('svg')[0];
        //console.log(objPageElements.rootsvg);

        //resize the map to fit into the window
        self.resizeworldmap();

        //prepare an object containing vital information about the svg element to animate
        self.state.rootanimateattributevalues = self.retrievesvgelementobject(self.el.rootanimate);

        //apply zoom and pan functionality to the svg drawing
        var bolUseHomeGrown = true;
        if (bolUseHomeGrown) {
            //initiate the new version of the zoom pan library
            objTouchSettings.debug = false;
            objTouchSettings.debugtointerface = false;
            objTouchSettings.debugtoconsole = true;
            objZoomPanSettings.mobile = app.state.mobile;

            objZoomPanSettings.clickcallback = function (event) {
                //console.log('in callback');
                //console.log(event);

                var elClicked = event.srcElement;
                if (typeof (elClicked) == "undefined") {
                    elClicked = event.originalTarget;
                }
                var strElementName = elClicked.nodeName;
                var strElementId = (elClicked.id) ? elClicked.id : '';
                var elParent = elClicked.parentNode;
                var strParentElementName = elParent.nodeName;
                var strParentElementId = (elParent.id) ? elParent.id : '';
                if (strElementId == '') strElementId = strParentElementId;
                //console.log('strElementName: '+strElementName+' strElementId: '+strElementId+' strParentElementName:'+strParentElementName+' strParentElementId: '+strParentElementId);

                if (strElementName == 'path' || strElementName == 'g' || strElementName == 'polygon') countryClicked(strElementId);
            }

            initSgvZoomPan(self.el.rootsvg, self.el.rootanimate);

            //console.log(objPageElements.rootanimateattributevalues);
        } else {

            initZoomPan(self.el.rootsvg);
        }

        self.centerworldmap(self.el.rootanimate);

        // On the public version of the application, stretch the worldmap to the maximum size of the window
        if (isPublicSite()) self.maximizeworldmap(self.el.rootanimate);

        objLoading.hide();
        //hideLoadingPanel();

        /*
		5) set the labels in the interface
		*/
        objHeader.setregionname(self.state.mapname);
        objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());

        //if we need to show country region details after the loading sequence has completed
        if (self.vars.showdetailview) {
            self.detailspanel();
        }
        self.vars.showdetailview = false;

        //post processing
        self.el.elsvgholder.style.visibility = 'visible';


    },

    /*
     * UI functions
     */
    updatemap: function (bolShowDetailView, strCallbackReference) {
        var self = this;

        //store the variable in this object so that we can use it later
        if (typeof bolShowDetailView == "boolean") {
            self.vars.showdetailview = bolShowDetailView;
        } else {
            self.vars.showdetailview = false;
        }


        self.el.elsvgholder.style.visibility = 'hidden';

        //1) retrieve the svg map
        var strSvg = self.retrieveworldmapsvg();



        //console.log(strSvg);

        if (strSvg != null) {
            // execute possible callback function
            if (typeof strCallbackReference == 'function') {
                strCallbackReference();
            }

            // remove the handlers of the previous map and update svg html
            removeHandlers(function () {

                self.el.elsvgholder.innerHTML = '';
                self.el.elsvgholder.innerHTML = strSvg;

                // Render the data filter panels for Global presence and sustainability based on the map that we have loaded
                var elSvgWrapper = getEl('svgcontentwrapper');
                //console.log(elSvgWrapper);
                var arrRegions = getFirstLevelChildElements(elSvgWrapper, 'path');
                if (arrRegions.length == 0) arrRegions = getFirstLevelChildElements(elSvgWrapper, 'g');
                console.log(arrRegions);

                // Set the datatypes for this data section
                self.datatypes = self.createDataTypeListForRegions(arrRegions);
                self.renderDataTypeFilters();
                console.log(self.datatypes);

                // window.objDataFilter.renderDataTypeList(self.datatypes);
                // Render a country list
                self.renderCountryList(arrRegions);
                //get worldmap livesimproved data
                self.getworldmapdata();
            });
        }

    },
    renderCountryList: function(regions) {
        var list = '<ul class="c-region-list">';
        regions.forEach(function(region) {
            list += '<li class="mapselector" data-target="'+region.id+'">'+translateFragment(region.id)+'</li>';
        });
        list += '</ul>';
        getEl('regions').innerHTML = list;

        // Attach click events
        var lis = document.getElementsByClassName('mapselector');

        for (var i=0; i<lis.length; i++) {
            lis[i].addEventListener('click', function() {
                countryClicked(this.getAttribute('data-target'), true);
            }, false);
        }
        console.log(list);
    },
    mapdatatypekeys: function (key) {
        var obj = {
            'value_co2': 'c_o_2',
            'value_fte': 'number_of_employees',
            'value_waste': 'waste',
            'value_water': 'water',
            'value_emissions': 'emissions',
            'value_emissionshaz': 'emissionshaz',
            'value_lwc': 'lwc_rate',
            'value_wasterecycled': 'recycled',
            'value_sales': 'number_sales',
            'value_male': 'percentage_male',
            'value_female': 'percentage_female',
            'value_research': 'r_and_d_centers',
            'value_plants': 'manufacturing_sites',
            'value_assets': 'number_assets',
            'value_employees': 'number_of_employees',
        }
        return obj[key];
    },
    renderDataTypeFilters: function () {
        var self = this;
        var htmlSustain = '<ul><li class="datafilter" data-subtype="all">All data</li>';
        self.datatypes.sustainability.forEach(function(datatype) {
            htmlSustain += '<li class="datatypefilter" data-subtype="' + datatype + '">' + objConfig.fragments[self.mapdatatypekeys(datatype)] + '</li>';
        });
        htmlSustain += '</ul>';
        Sizzle('li[data-panel=sustainability] .datatype-filter')[0].innerHTML = htmlSustain;
        console.log(htmlSustain);

        var htmlGlobal = '<ul><li class="datafilter" data-subtype="all">All data</li>'
        self.datatypes.global_presence.forEach(function(datatype) {
            htmlGlobal += '<li class="datafilter" data-subtype="' + datatype + '">' + objConfig.fragments[self.mapdatatypekeys(datatype)] + '</li>';
        });
        htmlGlobal += '</ul>';
        Sizzle('li[data-panel=global_presence] .datatype-filter')[0].innerHTML = htmlGlobal;


        var subtypes = Sizzle('.datatype-filter li');
        console.log(subtypes.length);
        for (var i =0; i < subtypes.length; i++) {
            subtypes[i].addEventListener('click', objDataFilter.subtypeChanged, false);
        }
        console.log(htmlGlobal);
    },
    retrievesvgelementobject: function (elSvg) {
        var self = this;
        objSvgElementProperties = {};

        //1- set the current values into the object
        objSvgElementProperties.translatex = 0;
        objSvgElementProperties.translatey = 0;
        objSvgElementProperties.scale = 1;

        //2- position of the element in the browser
        var arrPosition = findPos(elSvg.ownerSVGElement);
        objSvgElementProperties.x = arrPosition[0];
        objSvgElementProperties.y = arrPosition[1];

        //3- store the attributes of the svg node into the object too
        for (var attr, i = 0, attrs = self.el.rootanimate.attributes, l = attrs.length; i < l; i++) {
            attr = attrs.item(i);
            //alert(attr.nodeName);
            if (attr.nodeName == 'transform') {
                //perform string manipulation to find all the values used in the transform
            }
            objSvgElementProperties[attr.nodeName] = attr.nodeValue;
        }

        //4- the svg transform object (this allows us to read the position, scale etc of the svg element)
        objSvgElementProperties.transformmatrix = elSvg.getCTM();

        //5- the svg size
        objSvgElementProperties.size = elSvg.getBoundingClientRect();


        return objSvgElementProperties;
    },
    resizeworldmap: function () {
        var self = this;
        if (typeof (self.el.rootsvg) != "undefined") {
            self.el.rootsvg.setAttributeNS(null, 'viewBox', '0 0 ' + app.state.width + ' ' + app.state.height);
            self.el.rootsvg.setAttributeNS(null, 'enable-background', 'new 0 0 ' + app.state.width + ' ' + app.state.height);
            self.el.elsvgholder.style.width = app.state.width + 'px';
            self.el.elsvgholder.style.height = app.state.height + 'px';
            self.el.rootsvg.setAttributeNS(null, 'width', app.state.width);
            self.el.rootsvg.setAttributeNS(null, 'height', app.state.height);
        }
    },
    //moves the worldmap by mimicking a drag in the browser window
    moveworldmap: function (intDeltaX, intDeltaY) {
        var self = this;
        //create a custom object that mimics the mousemove event
        if (objTouchVars.elanimate != null) {
            var objFakeEventObject = {
                gesture: {
                    center: {
                        pageX: 0,
                        pageY: 0
                    }
                },
                clientX: 0,
                clientY: 0,
                target: {
                    tagName: 'svg'
                }
            }

            //fake start
            handleClickTouchStart(objFakeEventObject);

            //disable fireing of click event on desktop
            objTouchVars.clickstart = false;

            //fake drag by x amount of pixels
            objFakeEventObject = {
                gesture: {
                    center: {
                        pageX: intDeltaX,
                        pageY: intDeltaY
                    }
                },
                clientX: intDeltaX,
                clientY: intDeltaY
            }
            handleDrag(objFakeEventObject);

            //fake end
            handleClickTouchEnd(objFakeEventObject);
        }
    },
    //centers the worldmap in the screen
    centerworldmap: function (elSvg) {
        var self = this;
        //set the worldmap to position 0,0, but respect the current zoom level
        svgSetTransform(elSvg, {
            scale: svgRetrieveZoomLevel(elSvg),
            translatex: 0,
            translatey: 0,
            transformmatrix: {}
        });
        //console.log(elSvg);

        //move to new position
        self.moveworldmap((app.state.width / 2) - (self.state.rootanimateattributevalues.size.width / 2) - self.state.rootanimateattributevalues.x, (app.state.height / 2) - (self.state.rootanimateattributevalues.size.height / 2) - self.state.rootanimateattributevalues.y);

        //store the state of the map in a new object
        self.state.rootanimateattributevalues = self.retrievesvgelementobject(self.el.rootanimate);
    },
    maximizeworldmap: function (elSvg) {
        var self = this;

        var zoomFactor = 1,
            deltaX = 0,
            deltaY = 0;

        // Determine how to maximize the map
        if ((app.state.width / app.state.height) >= (self.state.rootanimateattributevalues.size.width / self.state.rootanimateattributevalues.size.height)) {
            // Stretch to height and horizontally center
            zoomFactor = app.state.height / self.state.rootanimateattributevalues.size.height;
            // how much should we move the map after it has been zoomed correctly
            deltaX = (app.state.width - (self.state.rootanimateattributevalues.size.width * zoomFactor)) / 2;
        } else {
            //Stretch to width and vertically center
            zoomFactor = app.state.width / self.state.rootanimateattributevalues.size.width;
            // how much should we move the map after it has been zoomed correctly
            deltaY = (app.state.height - (self.state.rootanimateattributevalues.size.height * zoomFactor)) / 2;
        }

        //console.log('- zoomFactor: ' + zoomFactor + ', deltaX: ' + deltaX + ', deltaY: ' + deltaY);

        // Zoom the map
        svgSetTransform(elSvg, {
            scale: zoomFactor,
            translatex: 0,
            translatey: 0,
            transformmatrix: {}
        });

        // Move the map
        self.moveworldmap(deltaX, deltaY);

        // store the state of the map in a new object
        self.state.rootanimateattributevalues = self.retrievesvgelementobject(self.el.rootanimate);
    },
	hideSelectedCountries: function() {
		Array.prototype.slice.call(document.getElementsByClassName('active')).forEach(function(el) {el.removeAttribute('class')});
	},
	zoomIn: function (){
		var self = this;
		var currentZoom = self.state.rootanimateattributevalues.scale;
		if (currentZoom < 5) {
			svgSetTransform(self.el.rootanimate, {
	            scale: currentZoom + 1,
				translatex: 0,
	            translatey: 0,
	            transformmatrix: {}
	        });
			self.state.rootanimateattributevalues.scale = currentZoom + 1;

			var zoomFactor = 1,
	            deltaX = 0,
	            deltaY = 0;

	        // Determine how to maximize the map
	        if ((app.state.width / app.state.height) >= (self.state.rootanimateattributevalues.size.width / self.state.rootanimateattributevalues.size.height)) {
	            // Stretch to height and horizontally center
	            zoomFactor = app.state.height / self.state.rootanimateattributevalues.size.height;
	            // how much should we move the map after it has been zoomed correctly
	            deltaX = (app.state.width - (self.state.rootanimateattributevalues.size.width * self.state.rootanimateattributevalues.scale)) / 2;
	        } else {
	            //Stretch to width and vertically center
	            zoomFactor = app.state.width / self.state.rootanimateattributevalues.size.width;
	            // how much should we move the map after it has been zoomed correctly
	            deltaY = (app.state.height - (self.state.rootanimateattributevalues.size.height * self.state.rootanimateattributevalues.scale)) / 2;
	        }
			self.moveworldmap(deltaX, deltaY);
			// self.centerworldmap(self.el.rootanimate);
		}

	},
	zoomOut: function() {
		var self = this;
		var currentZoom = self.state.rootanimateattributevalues.scale;
		if (currentZoom > 1) {
			svgSetTransform(self.el.rootanimate, {
	            scale: currentZoom - 1,
				translatex: 0,
	            translatey: 0,
	            transformmatrix: {}
	        });
			self.state.rootanimateattributevalues.scale = currentZoom - 1;
			// self.centerworldmap(self.el.rootanimate);
			self.moveworldmap(self.state.rootanimateattributevalues.translatex, self.state.rootanimateattributevalues.translatey);
		}
	},
    detailspanel: function () {
        var self = this;

        //debugger;
        //JT: unsure, but I feel that this is a property that we should store in the oru filter object
        objOruFilter.state.selectedoruguid = objPageState.state.filter.oru;


        if (objBookmarks.isfavourite()) {
            getEl('toggle_favourite').className = getEl('toggle_favourite').className + ' selected';
        } else {
            getEl('toggle_favourite').className = getEl('toggle_favourite').className.replace(' selected', '');
        }
        objHeader.showbackbutton();
        objHeader.showfavouritebutton();


        //initiates the simulator
        // objSliders.start();

        //objRegionInfo.hidehistory();

        // add the current ORU sector as a class to the wrapper div
        app.el.outerwrapper.className = objConfig.sitetype + ' ' + objPageState.state.filter.sector ;

        var sec = {},
            back = {},
            key = objPageState.state.filter.mru + '_' + (objPageState.state.filter.oru.length < 4 ? objPageState.state.filter.oru : objPageState.state.filter.oru.toLowerCase()),
            regionData = self.data[key];

        var elRegion = getEl(objPageState.state.filter.oru);
        if (elRegion) {
            var opacity = elRegion.style.opacity;
            TweenLite.to(elRegion, 0, {
                opacity: 0.7,
                onComplete: function () {
                    //alert('in')
                    //debugger;
					self.hideSelectedCountries();
					elRegion.setAttribute('class', 'active');
                    //JT: I introduced a very crappy way to check for a tablet - can this be improved and become app.state.tablet ?
                    if (app.state.width > 768) {
                        self.updateui(regionData, objPageState.state.filter.oru, elRegion);
                    } else {
                        TweenLite.to(self.el.elsvgholder, 0.2, {
                            opacity: 0,
                            onComplete: function () {
                                self.updateui(regionData, objPageState.state.filter.oru, elRegion);
                            }
                        });
                    }


                }
            });
        } else {
            console.log('Could not find the region in the map to animate.');
            console.log(objPageState.state.filter.oru);
        }



    },
    updateui: function (regionData, idCountry, elRegion) {
        var self = this;

        //debugger;
        //if(app.state.width<1000 || app.state.height<1000)self.el.elsvgholder.style.display = 'none';

        //set the rounded values in the ui
        self.setroundeddatainui(regionData);

        //set the percentage in the infographic
        if (regionData.percentageLI > 100) regionData.percentageLI = 100;
        if (regionData.percentageLI >= 10 && regionData.percentageLI < 100) regionData.percentageLI = Math.round(regionData.percentageLI);
        if (regionData.percentageLI < 10 && regionData.percentageLI > 0.1) regionData.percentageLI = Math.round(regionData.percentageLI * 10) / 10;
        if (regionData.percentageLI < 0.1) regionData.percentageLI = '< 0.1';

		// Set the calculated lives improved percentage
        objRegionInfo.el.data.percentagelivesimproved.textContent = regionData.percentageLI + '%';

		// Set the correct images matching the percentage
		var elLivesImprovedIcons = getEl('lives_improved_icons');
		// Clear images that where set before
		elLivesImprovedIcons.innerHTML = '';

		function doScaledTimeout(i, elem) {
			setTimeout(function() {
				elLivesImprovedIcons.appendChild(elem);
			}, i * 0);
		}
		for (var i = 0; i < 100; i++) {
			var elem = document.createElement("img");
			if (i < regionData.percentageLI) {
				// Add selected icon
				elem.setAttribute("src", "img/person-selected.png");
			} else {
				// Add unselected icon
				elem.setAttribute("src", "img/person.png");
			}
			// We can add a timeout effect for the loading of the images here by switching the comments on both lines below
			// doScaledTimeout(i, elem);
			elLivesImprovedIcons.appendChild(elem);
		}

        //set the labels in the header
        objHeader.setregionname(objOruFilter.getregionnamebyid((idCountry.length < 4 ? idCountry : idCountry.toLowerCase())));
        // objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());

        //if(getEl('btn_back').className.indexOf('hide')> -1){
        //	toggleClass(getEl('btn_back'), 'hide');
        //	toggleClass(getEl('toggle_favourite'), 'hide');
        //}
        //objSliders.show();
        objRegionInfo.show();


        TweenLite.to(elRegion, 0.3, {
            opacity: 1,
            onComplete: function () {

            }
        });

    },
    //updates the fields in the ui with new data
    setroundeddatainui: function (objData) {
        //debugger;
        var self = this;
        var objExtendedData = self.roundlivesimproveddataobject(objData);

        var elLivesImproved = getEl('region_info_wrapper lives_improved');
        var elGlobalPresence = getEl('region_info_wrapper global_presence');
        var elSustainability = getEl('region_info_wrapper sustainability');
        //console.log(objExtendedData)

        if (objDataFilter.state.filter.datasource === 'lives_improved') {
            // Lives improved
            objRegionInfo.el.data.nrlivesimproved.textContent = objExtendedData.displayl + ' ' + objConfig.fragments['million'];
            objRegionInfo.el.data.labellivesimproved.textContent = objConfig.fragments['lives_improved'];
            objRegionInfo.el.data.gdp.textContent = '$' + objExtendedData.displayg + objExtendedData.labelg;
            objRegionInfo.el.data.population.textContent = objExtendedData.displayp + objExtendedData.labelp;

            TweenLite.to(elGlobalPresence, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
            TweenLite.to(elSustainability, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
            TweenLite.to(elLivesImproved, 0.3, {
                opacity: 1,
                'z-index': 1,
                onComplete: function () {

                }
            });
        }

        else if (objDataFilter.state.filter.datasource === 'global_presence') {
            // Global presence
            objRegionInfo.el.data.assets.textContent = objExtendedData.value_assets;
            objRegionInfo.el.data.employees.textContent = objExtendedData.value_employees;
            objRegionInfo.el.data.female.textContent = objExtendedData.value_female + '%';
            objRegionInfo.el.data.male.textContent = objExtendedData.value_male + '%';
            objRegionInfo.el.data.plants.textContent = objExtendedData.value_plants;
            objRegionInfo.el.data.research.textContent = objExtendedData.value_research;
            objRegionInfo.el.data.sales.textContent = objExtendedData.value_sales;

            if (objDataFilter.state.filter.subtype !== 'all') {
                self.hideOtherElements(objDataFilter.state.filter.subtype);
            } else {
                self.showAllElements();
            }

            TweenLite.to(elGlobalPresence, 0.3, {
                opacity: 1,
                'z-index': 1,
                onComplete: function () {

                }
            });
            TweenLite.to(elSustainability, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
            TweenLite.to(elLivesImproved, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
        }
        else if (objDataFilter.state.filter.datasource === 'sustainability') {
            // Sustainability
            objRegionInfo.el.data.co2.textContent = objExtendedData.value_co2;
            objRegionInfo.el.data.emission.textContent = objExtendedData.value_emissions;
            objRegionInfo.el.data.emissionhaz.textContent = objExtendedData.value_emissionshaz;
            objRegionInfo.el.data.fte.textContent = objExtendedData.value_fte;
            objRegionInfo.el.data.lwc.textContent = objExtendedData.value_lwc;
            objRegionInfo.el.data.waste.textContent = objExtendedData.value_waste;
            objRegionInfo.el.data.wasterecycled.textContent = objExtendedData.value_wasterecycled;
            objRegionInfo.el.data.water.textContent = objExtendedData.value_water;

            if (objDataFilter.state.filter.subtype !== 'all') {
                self.hideOtherElements(objDataFilter.state.filter.subtype);
            } else {
                self.showAllElements();
            }

            TweenLite.to(elGlobalPresence, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
            TweenLite.to(elSustainability, 0.3, {
                opacity: 1,
                'z-index': 1,
                onComplete: function () {

                }
            });
            TweenLite.to(elLivesImproved, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
        }


    },
    hideOtherElements: function (subtype) {
        for (var property in objRegionInfo.el.data) {
            if (objRegionInfo.el.data.hasOwnProperty(property)) {
                if(objRegionInfo.el.data[property].className !== subtype.replace('value_', 'nr_')) {
                    objRegionInfo.el.data[property].parentNode.style.display = 'none';
                }
            }
        }
    },
    showAllElements: function () {
        for (var property in objRegionInfo.el.data) {
            if (objRegionInfo.el.data.hasOwnProperty(property)) {
                objRegionInfo.el.data[property].parentNode.style.display = 'block';
            }
        }
    },
    //rounds the data befor sending it to the app
    roundlivesimproveddataobject: function (objData) {
        //console.log(objData)
        var intDecimals = 0;

        //lives improved
        if (objData.l >= 0) {
            //always have 4 digits in the display
            //more than 1000 million
            if (objData.l >= 1000000000) {
                //console.log('-2');
                objData.roundedl = Math.round(objData.l / 1000000);
                //console.log(objData.roundedl)
            }
            //100 - 999.99 million
            if (objData.l >= 100000000 && objData.l < 1000000000) {
                //console.log('-1');
                objData.roundedl = Math.round((objData.l / 1000000) * 10) / 10;
                intDecimals = 1;
            }
            //10 - 99.99 million
            if (objData.l >= 10000000 && objData.l < 100000000) {
                //console.log('0');
                objData.roundedl = Math.round((objData.l / 1000000) * 100) / 100;
                intDecimals = 2;
            }
            //0.0001 - 9.99 million
            if (objData.l < 10000000) {
                //console.log('1');
                objData.roundedl = Math.round((objData.l / 1000000) * 1000) / 1000;
                intDecimals = 3;
            }
            /*
			if(objData.l<1000){
			//console.log('...')
			objData.roundedl=objData.l;
			intDecimals=2;
			}
			*/
            objData.displayl = formatMoney(objData.roundedl, intDecimals, ',', '.', '');
            objData.labell = 'million lives improved';
        }

        //gdp
        if (objData.g >= 0) {
            if (objData.g > 1) {
                objData.roundedg = Math.round(objData.g / 1);
                intDecimals = 0;
            } else {
                objData.roundedg = Math.round((objData.g / 1) * 10) / 10;
                intDecimals = 1;
            }
            objData.displayg = formatMoney(objData.roundedg, intDecimals, ',', '.', '');
            objData.labelg = ' billion';
        }

        //population
        if (objData.p >= 0) {
            if (objData.p > 1000000) {
                objData.roundedp = Math.round(objData.p / 1000000);
                intDecimals = 0;
            } else {
                objData.roundedp = Math.round((objData.p / 1000000) * 10) / 10;
                intDecimals = 1;
            }
            objData.displayp = formatMoney(objData.roundedp, intDecimals, ',', '.', '');
            objData.labelp = ' million';
        }

        return objData;
    },
    init: function () {
        var self = this;
        self.state.visible = false;

        self.el.elsvgholder = getEl('holder_1000');
    }
}
