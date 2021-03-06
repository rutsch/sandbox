var objMap = {
    state: {
        visible: null
    },
    el: {
        mapwrapper: null,
        elsvgholder: null,
        svgcontentwrapper: null
    },
    vars: {
        showdetailview: false,
        regionidtoshow: null, // Contains the region id of the details panel to show
        zoomdelta: 0.3,
        nodataids: []
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
        var useMiddleColor = true;

        // console.log('pct: ' + pct);
        pct /= 100;
        // console.log('pct (%): ' + pct);


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
        return 'rgb(' + window.colourGradientor(pct, [percentColors[indexHigh].color.r, percentColors[indexHigh].color.g, percentColors[indexHigh].color.b], [percentColors[indexLow].color.r, percentColors[indexLow].color.g, percentColors[indexLow].color.b]).join(',') + ')';
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
        var svgdata = window.objStore.getlocalstorageitem('map_' + self.state.mapname + '_v' + window.objConfig.localstorageversion);

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
            arrFormData['v'] = window.pageVars.version;

            // TODO: Test if there is any way that we can make this an async call...
            svgdata = window.serverSideRequest({
                url: window.objConfig.urls.authurl2,
                formdata: arrFormData,
                method: 'get',
                debug: false
            });

            svgdata = svgdata.replace(/fill:#00ffff/g, '');

            if (typeof svgdata === 'string') {
                window.objStore.setlocalstorageitem('map_' + self.state.mapname + '_v' + window.objConfig.localstorageversion, svgdata);
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

                // showLoadingPanel();
                window.psv('GET', window.objConfig.urls.dynamicresourceurl, objData, function getWorldmapDataHandler(err, data) {

                    // hideLoadingPanel();
                    if (err != null) {
                        // console.log(err);
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

    // Returns two arrays containing the data type (points) used in the sustainability and global presence data sources
    createdatatypelistforregions: function (level) {
        var self = this,
            listSustain = [],
            listGlobal = [];

        var regions = window.objOruFilter.retrieveoruarr(level);

        regions.forEach(function (region) {
            listSustain = [];
            listGlobal = [];
            var regionId = 'philips_' + region.guid;

            // Loop through object properties
            // debugger;
            //if (window.objConfig.datasources.indexOf('sustainability') > -1) {

            if (window.objData.sustainability && window.objData.sustainability.snapshotdata && window.objConfig.datasources.indexOf('sustainability') > -1) {
                for (var key in window.objData.sustainability.snapshotdata[regionId]) {
                    if (window.objData.sustainability.snapshotdata[regionId].hasOwnProperty(key)) {
                        // Do stuff
                        listSustain.push(key);
                    }
                }
            }

            if (window.objData['global_presence'] && window.objData['global_presence'].snapshotdata && window.objConfig.datasources.indexOf('global_presence') > -1) {
                for (var key in window.objData.global_presence.snapshotdata[regionId]) {
                    if (window.objData.global_presence.snapshotdata[regionId].hasOwnProperty(key)) {
                        // Do stuff
                        listGlobal.push(key);
                    }
                }
            }
        });
        return {
            global_presence: listGlobal,
            sustainability: listSustain
        };
    },

    postprocessworldmapdata: function (data) {
        var self = this;

        var debugRoutine = true;
        var setColor = true;
        var noDataColor = window.rgbFromHex('#cae3e9');
        var combinedDataColor = window.rgbFromHex('#46b0a8');

        // Reset the array of region ID's that contain no data
        self.vars.nodataids.length = 0;

        // console.log('----------------');
        // console.log('In postprocessworldmapdata');
        // console.dir(data);
        // console.log('----------------');

        window.objLoading.show();

        /*
        0) update the ui to set if we will use the simulator or not
        */
        // if (data.hasOwnProperty('usesimulator')) objSliders.togglesimulator(data.usesimulator);

        /*
		1) store the data in this object as a property
		*/
        self.data = window.cloneObject(data.snapshotdata);

        /*
		2) retrieve the elements from the svg that we need to color
		*/
        var elSvgWrapper = window.getEl('svgcontentwrapper');
        //console.log(elSvgWrapper);
        var arrRegions = window.getFirstLevelChildElements(elSvgWrapper, 'path');
        if (arrRegions.length === 0) arrRegions = window.getFirstLevelChildElements(elSvgWrapper, 'g')

        // Calculate the lives improved percentage and add it to the data variable
        if (window.objDataFilter.state.filter.datasource === 'lives_improved') {
            for (var oruGuid in self.data) {
                if (typeof oruGuid === 'string') {
                    self.data[oruGuid].lprc = (self.data[oruGuid].l * 100 / self.data[oruGuid].p)
                }
            }
        }

        /*
        3) Find the highest and lowest values in the data objects
        */

        // A) Filter out only the objects that we actually need to process
        var dataToProcess = {};
        var dataTypeMetadata = {};
        var currentOruArr = window.objOruFilter.retrieveoruarr();

        var prefix = 'philips_';
        currentOruArr.forEach(function (objOru, index) {
            // Check one time if the ORU list contains the philips_ or lighting_ prefix
            if (index === 0 && objOru.guid.indexOf('_') > -1) {
                prefix = '';
            }

            // Store the datatypes that we need to check in an array
            if (index === 0) {
                for (var dataTypeId in self.data[prefix + objOru.guid]) {
                    if (typeof dataTypeId === 'string') {
                        dataTypeMetadata[dataTypeId] = {
                            min: null,
                            max: null
                        };
                    }
                }
            }

            if (typeof self.data[prefix + objOru.guid] === 'object') {
                dataToProcess[prefix + objOru.guid] = self.data[prefix + objOru.guid];
            } else {
                console.log('ERROR: Could not locate ORU key ' + prefix + objOru.guid + ' in the dataset');
            }
        })



        // Fill the metadata object with the min and max values of each data type
        for (var oruGuid in dataToProcess) {
            if (typeof oruGuid === 'string') {
                // Loop through all the data types that we have found
                for (var dataTypeId in dataTypeMetadata) {
                    if (typeof dataTypeId === 'string') {
                        var currentValue = parseFloat(dataToProcess[oruGuid][dataTypeId]);
                        if (!isNaN(currentValue)) {
                            if (dataTypeMetadata[dataTypeId].min === null && dataTypeMetadata[dataTypeId].max === null) {
                                dataTypeMetadata[dataTypeId].min = dataTypeMetadata[dataTypeId].max = currentValue;
                            } else {
                                if (currentValue < dataTypeMetadata[dataTypeId].min) {
                                    dataTypeMetadata[dataTypeId].min = currentValue;
                                } else {
                                    if (currentValue > dataTypeMetadata[dataTypeId].max) {
                                        dataTypeMetadata[dataTypeId].max = currentValue;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // console.log('----------------');
        // console.log(JSON.stringify(dataTypeMetadata));
        // console.log(JSON.stringify(dataToProcess));
        // console.log('----------------');

        /*
		4) set the coloring based on the values that we have received
		*/

        // If oru not world and datafilter subtype not all, calculate percentages

        // Analyze the data we have received
        var dataValueMax = 100;
        var dataValueMin = 100;

        if (window.objPageState.state.filter.orulevel !== "1" &&
            ((window.objDataFilter.state.filter.datasource === 'global_presence' || window.objDataFilter.state.filter.datasource === 'sustainability') && window.objDataFilter.state.filter.subtype !== 'all') || window.objDataFilter.state.filter.datasource === 'lives_improved') {

            // For Lives Improved - use the percentage
            if (window.objDataFilter.state.filter.datasource === 'lives_improved') {
                dataValueMax = dataTypeMetadata.lprc.max;
                dataValueMin = dataTypeMetadata.lprc.min;
            } else {
                dataValueMax = dataTypeMetadata[window.objDataFilter.state.filter.subtype].max;
                dataValueMin = dataTypeMetadata[window.objDataFilter.state.filter.subtype].min;
            }

            // if (debugRoutine) console.log(' - dataValueMax: ' + dataValueMax + ' - dataValueMin: ' + dataValueMin);
        }

        // Determine when we cannot color the map because we show the data on global level or we show more data types in one view
        var combinedView = (window.objPageState.state.filter.orulevel === "1" || ((window.objDataFilter.state.filter.datasource === 'global_presence' || window.objDataFilter.state.filter.datasource === 'sustainability') && window.objDataFilter.state.filter.subtype === 'all'))


        // Settings for the coloring
        var minimumPercentage = 0; // Anything below this percentage will get the 'low' color
        var factor = (dataValueMax === dataValueMin) ? 1 : ((100 - minimumPercentage) / (dataValueMax - dataValueMin));
        // console.log('- factor: ' + factor);

        // Calculate rgb colors if needed
        if (!window.objConfig.colors[window.objPageState.state.filter.sector].hasOwnProperty('rgb')) {
            window.objConfig.colors[window.objPageState.state.filter.sector].rgb = {};
            window.objConfig.colors[window.objPageState.state.filter.sector].rgb.low = window.rgbFromHex(window.objConfig.colors[window.objPageState.state.filter.sector].low);
            window.objConfig.colors[window.objPageState.state.filter.sector].rgb.middle = window.rgbFromHex(window.objConfig.colors[window.objPageState.state.filter.sector].middle);
            window.objConfig.colors[window.objPageState.state.filter.sector].rgb.high = window.rgbFromHex(window.objConfig.colors[window.objPageState.state.filter.sector].high);
        }


        for (var i = 0; i < arrRegions.length; i++) {
            var region = arrRegions[i],
                regionId = region.id === 'UK' ? 'GB' : region.id,
                oruGuid = window.objPageState.state.filter.mru + '_' + (window.objPageState.state.filter.orulevel !== 4 ? regionId.toLowerCase() : regionId),
                regionData = (self.data[oruGuid]) ? self.data[oruGuid] : false;

            // console.log(key+' - '+regionData);
            // debugger;
            if (regionData) {
                var dataValueToDisplay;
                var noData = false;
                if (window.objDataFilter.state.filter.datasource === 'lives_improved') {
                    // Calculate percentage lives improved and store that in the worldmapdata object
                    dataValueToDisplay = self.data[oruGuid].percentageLI = self.data[oruGuid].lprc;
                    if (self.data[oruGuid].l < 100) noData = true;
                } else {
                    if (window.objDataFilter.state.filter.subtype === 'all') {

                        var hasDataArr = [];
                        for (var dataType in regionData) {
                            if (typeof dataType === 'string') {
                                var currentValue = parseFloat(regionData[dataType]);

                                if (!isNaN(currentValue)) {
                                    if (currentValue === 0) {
                                        hasDataArr.push('no');
                                    } else {
                                        hasDataArr.push('yes')
                                    }
                                } else {
                                    if (regionData[dataType] === '-') {
                                        hasDataArr.push('no');
                                    } else {
                                        hasDataArr.push('yes')
                                    }
                                }
                            }
                        }
                        // We have no data for the geographical region if all the elements contain no data
                        noData = (hasDataArr.indexOf('yes') === -1);
                    } else {
                        dataValueToDisplay = regionData[window.objDataFilter.state.filter.subtype];
                        console.log(dataValueToDisplay);
                        if (dataValueToDisplay === '-' || dataValueToDisplay === undefined) noData = true;
                    }
                }

                // Add colors to the map
                if (setColor) {
                    var colorToSet = '#000';

                    if (noData && window.objConfig.hideinactivecountries) {
                        colorToSet = self.getcolorforpercentage(100, noDataColor, noDataColor, noDataColor);
                    } else {

                        if (combinedView) {
                            colorToSet = self.getcolorforpercentage(100, combinedDataColor, combinedDataColor, combinedDataColor);
                        } else {
                            // Calculate the color to place on the map
                            var percentageForColor = 100;
                            if (dataValueMax > dataValueMin) {
                                percentageForColor = (dataValueToDisplay - dataValueMin) * factor;
                            }

                            // if (debugRoutine) console.log('- ' + oruGuid + ': ' + percentageForColor);

                            // Correct for percentages above 100 and below 0
                            if (percentageForColor >= 100) percentageForColor = 100;
                            if (percentageForColor < 0) percentageForColor = 0;

                            colorToSet = self.getcolorforpercentage(percentageForColor, window.objConfig.colors[window.objPageState.state.filter.sector].rgb.low, window.objConfig.colors[window.objPageState.state.filter.sector].rgb.middle, window.objConfig.colors[window.objPageState.state.filter.sector].rgb.high);
                        }


                    }

                    // Set the color and the classname on the container element
                    region.style.fill = colorToSet;
                    window.toggleClass(region, 'no-data', noData);

                    // Set the color and the classname of the nested SVG DOM elements
                    var paths = region.getElementsByTagName('*');
                    for (var y = 0; y < paths.length; y++) {
                        if (paths[y].nodeName === 'path' || paths[y].nodeName === 'polygon' || paths[y].nodeName === 'rect' || paths[y].nodeName === 'g' || paths[y].nodeName === 'polyline') {
                            paths[y].style.fill = colorToSet;
                            window.toggleClass(paths[y], 'no-data', noData);
                        }
                    }

                    // Fill the nodata array with the ID of this region
                    if (noData) self.vars.nodataids.push(regionId);
                }

            } else {
                region.style.fill = noDataColor;
            }
        }



        /*
		5) perform post processing (set events and center map)
		*/

        // Retrieve the base svg elements
        self.el.rootanimate = window.getEl('viewport');
        self.el.rootsvg = window.getEl('holder_1000').getElementsByTagName('svg')[0];
        self.el.svgcontentwrapper = window.getEl('svgcontentwrapper');

        // Prepare an object containing vital information about the svg element to animate
        self.state.rootanimateattributevalues = self.retrievesvgelementobject(self.el.rootanimate);

        // Apply zoom and pan functionality to the svg drawing

        // Initiate the new version of the zoom pan library
        window.objTouchSettings.debug = false;
        window.objTouchSettings.debugtointerface = false;
        window.objTouchSettings.debugtoconsole = true;
        window.objZoomPanSettings.mobile = window.app.state.mobileortablet;

        window.objZoomPanSettings.clickcallback = function (event) {
            // event.stopPropagation();
            // debugger;
            // console.log('in callback');
            // console.log(event);

            var elClicked = event.srcElement;
            if (typeof (elClicked) === "undefined") {
                elClicked = event.originalTarget;
            }
            var strElementName = elClicked.nodeName;
            var strElementId = (elClicked.id) ? elClicked.id : '';
            var elParent = elClicked.parentNode;
            var strParentElementName = elParent.nodeName;
            var strParentElementId = (elParent.id) ? elParent.id : '';
            if (strElementId === '') strElementId = strParentElementId;

            // console.log('- strElementName: ' + strElementName + ' strElementId: ' + strElementId + ' strParentElementName:' + strParentElementName + ' strParentElementId: ' + strParentElementId);

            if ((strElementName === 'path' || strElementName === 'g' || strElementName === 'polygon')) window.countryClicked(strElementId);
        }

        // Initiate the map zoom and pan library
        window.initSgvZoomPan(self.el.rootsvg, self.el.rootanimate);

        // Resize the map to fit into the window
        self.resizeworldmap();


        // Move the worldmap to the center of the screen
        self.moveworldmap(((self.el.elsvgholder.clientWidth - self.el.rootanimate.getBBox().width) / 2), 0);

        // On the public version of the application, stretch the worldmap to the maximum size of the window
        // if (window.isPublicSite() && window.app.isMobile.any() === false) self.maximizeworldmap(self.el.rootanimate);

        window.objLoading.hide();

        // hideLoadingPanel();

        /*
		6) set the labels in the interface
		*/
        window.objHeader.setregionname(self.state.mapname);
        window.objHeader.setbreadcrumb(window.objMruFilter.getmrufilterbreadcrumb());

        // If we need to show country region details after the loading sequence has completed
        // debugger;
        if (self.vars.showdetailview) {
            self.detailspanel();
        } else {
            window.objRegionInfo.hide();
        }
        self.vars.showdetailview = false;

        // Post processing
        self.el.elsvgholder.style.visibility = 'visible';

        // Show or hide the legend
        window.objRegionInfo.showhidelegend(dataValueMax, dataValueMin);

        // Render a country list to use in the mobile view of the map
        window.objOruFilter.rendermobilegeographylist();
    },

    /*
     * UI functions
     */
    updatemap: function (bolShowDetailView, strCallbackReference) {
        var self = this;

        // Store the variable in this object so that we can use it later
        if (typeof bolShowDetailView === "boolean") {
            self.vars.showdetailview = bolShowDetailView;
        } else {
            self.vars.showdetailview = false;
        }


        self.el.elsvgholder.style.visibility = 'hidden';

        // 1) retrieve the svg map
        var strSvg = self.retrieveworldmapsvg();

        // console.log(strSvg);

        if (strSvg != null) {
            // Execute possible callback function
            if (typeof strCallbackReference === 'function') {
                strCallbackReference();
            }

            // Remove the handlers of the previous map and update svg html
            window.removeHandlers(function () {
                // Inject the SVG map into the DOM
                self.el.elsvgholder.innerHTML = '';
                self.el.elsvgholder.innerHTML = strSvg;

                // Get worldmap livesimproved data
                self.getworldmapdata();
            });
        }

    },


    retrievesvgelementobject: function (elSvg) {
        var self = this;
        window.objSvgElementProperties = {};

        // 1- set the current values into the object
        window.objSvgElementProperties.translatex = 0;
        window.objSvgElementProperties.translatey = 0;
        window.objSvgElementProperties.scale = 1;

        // 2- position of the element in the browser
        var arrPosition = window.findPos(elSvg.ownerSVGElement);
        window.objSvgElementProperties.x = arrPosition[0];
        window.objSvgElementProperties.y = arrPosition[1];

        // 3- store the attributes of the svg node into the object too
        for (var attr, i = 0, attrs = self.el.rootanimate.attributes, l = attrs.length; i < l; i++) {
            attr = attrs.item(i);

            // alert(attr.nodeName);
            if (attr.nodeName === 'transform') {
                // Perform string manipulation to find all the values used in the transform
            }
            window.objSvgElementProperties[attr.nodeName] = attr.nodeValue;
        }

        // 4- the svg transform object (this allows us to read the position, scale etc of the svg element)
        window.objSvgElementProperties.transformmatrix = elSvg.getCTM();

        // 5- the svg size
        window.objSvgElementProperties.size = elSvg.getBoundingClientRect();


        return window.objSvgElementProperties;
    },
    resizeworldmap: function () {
        var self = this;

        if (typeof (self.el.rootsvg) !== "undefined") {
            var mapDivHeight = self.el.elsvgholder.clientHeight;
            var mapDivWidth = self.el.elsvgholder.clientWidth;
            self.el.rootsvg.setAttributeNS(null, 'viewBox', '0 0 ' + mapDivWidth + ' ' + mapDivHeight);
            self.el.rootsvg.setAttributeNS(null, 'enable-background', 'new 0 0 ' + mapDivWidth + ' ' + mapDivHeight);
            // self.el.elsvgholder.style.width = window.app.state.width + 'px';
            // self.el.elsvgholder.style.height = window.app.state.height + 'px';
            self.el.rootsvg.setAttributeNS(null, 'width', mapDivWidth);
            self.el.rootsvg.setAttributeNS(null, 'height', mapDivHeight); // window.app.state.height);
        }
    },

    // Moves the worldmap by mimicking a drag in the browser window
    moveworldmap: function (intDeltaX, intDeltaY) {
        var self = this;

        // Create a custom object that mimics the mousemove event
        if (window.objTouchVars.elanimate != null) {
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

            // Fake start
            window.handleClickTouchStart(objFakeEventObject);

            // Disable fireing of click event on desktop
            window.objTouchVars.clickstart = false;

            // Fake drag by x amount of pixels
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
            window.handleDrag(objFakeEventObject);

            // Fake end
            window.handleClickTouchEnd(objFakeEventObject);
        }
    },

    // Centers the worldmap in the screen
    centerworldmap: function (elSvg) {
        var self = this;


        // Set the worldmap to position 0,0, but respect the current zoom level
        window.svgSetTransform(elSvg, {
            scale: self.state.rootanimateattributevalues.scale,
            translatex: 0,
            translatey: 0,
            transformmatrix: {}
        });

        // debugger;

        // console.log(elSvg);

        // // Move to new position
        // self.moveworldmap((window.app.state.width / 2) - (self.state.rootanimateattributevalues.size.width / 2) - self.state.rootanimateattributevalues.x, (window.app.state.height / 2) - (self.state.rootanimateattributevalues.size.height / 2) - self.state.rootanimateattributevalues.y);
        // console.log(self.el.svgcontentwrapper.getBBox().width);

        // var deltaX = ((window.app.state.width - self.el.rootanimate.getBBox().width) / 2);

        self.el.rootanimate.setAttributeNS(null, 'transform', '');

        // Move the worldmap to the center of the screen
        self.moveworldmap(((self.el.elsvgholder.clientWidth - self.el.rootanimate.getBBox().width) / 2), 0);

        // Store the state of the map in a new object
        self.state.rootanimateattributevalues = self.retrievesvgelementobject(self.el.rootanimate);
    },
    maximizeworldmap: function (elSvg) {
        var self = this;

        var zoomFactor = 1,
            deltaX = 0,
            deltaY = 0;

        // Determine how to maximize the map
        if ((window.app.state.width / window.app.state.height) >= (self.state.rootanimateattributevalues.size.width / self.state.rootanimateattributevalues.size.height)) {
            // Stretch to height and horizontally center
            zoomFactor = window.app.state.height / self.state.rootanimateattributevalues.size.height;

            // How much should we move the map after it has been zoomed correctly
            deltaX = (window.app.state.width - (self.state.rootanimateattributevalues.size.width * zoomFactor)) / 2;
        } else {
            // Stretch to width and vertically center
            zoomFactor = window.app.state.width / self.state.rootanimateattributevalues.size.width;

            // How much should we move the map after it has been zoomed correctly
            deltaY = (window.app.state.height - (self.state.rootanimateattributevalues.size.height * zoomFactor)) / 2;
        }

        // console.log('- zoomFactor: ' + zoomFactor + ', deltaX: ' + deltaX + ', deltaY: ' + deltaY);

        // Zoom the map
        window.svgSetTransform(elSvg, {
            scale: zoomFactor,
            translatex: 0,
            translatey: 0,
            transformmatrix: {}
        });

        // Move the map
        self.moveworldmap(deltaX, deltaY);

        // Store the state of the map in a new object
        self.state.rootanimateattributevalues = self.retrievesvgelementobject(self.el.rootanimate);
    },
    hideselectedcountries: function () {
        Array.prototype.slice.call(objMap.el.elsvgholder.getElementsByClassName('active')).forEach(function (el) {
            el.removeAttribute('class')
        });
    },

    // Map zoom functionality using the buttons
    zoom: function (type) {
        var self = this;
        var currentZoom = self.state.rootanimateattributevalues.scale;

        var p = window.objTouchVars.elsvg.createSVGPoint();
        p.x = window.app.state.width / 2;
        p.y = (window.app.state.height / 2) - 125; // Needs to be improved

        // Use the zoom functionality from the SVG library to execute the zoom on the map
        window.handleZoom(p, ((type === 'in') ? (currentZoom + self.vars.zoomdelta) : (currentZoom - self.vars.zoomdelta)));

        // Store the state of the map in a new object
        self.state.rootanimateattributevalues = self.retrievesvgelementobject(self.el.rootanimate);
    },

    /**
     * Show the details panel, select the active country in the map
     */
    detailspanel: function () {
        var self = this;

        // debugger;
        // JT: unsure, but I feel that this is a property that we should store in the oru filter object
        window.objOruFilter.state.selectedoruguid = window.objPageState.state.filter.oru;


        if (window.objBookmarks.isfavourite()) {
            window.getEl('toggle_favourite').className = window.getEl('toggle_favourite').className + ' selected';
        } else {
            window.getEl('toggle_favourite').className = window.getEl('toggle_favourite').className.replace(' selected', '');
        }
        window.objHeader.showbackbutton();
        window.objHeader.showfavouritebutton();

        // Initiates the simulator
        if (window.objPageState.state.filter.datasource === 'lives_improved') window.objSliders.start();

        // objRegionInfo.hidehistory();

        // Add the current ORU sector as a class to the wrapper div
        window.app.setmainwrapperclass();

        // Retrieve the current data to from the data object
        var key = window.objPageState.state.filter.mru + '_' + (window.objPageState.state.filter.oru.length < 4 ? window.objPageState.state.filter.oru : window.objPageState.state.filter.oru.toLowerCase());
        var regionData = self.data[key];

        var elRegion = window.getEl(window.objPageState.state.filter.oru);

        if (elRegion) {

            var className = elRegion.getAttribute('class');
            if (typeof className === 'string' && className === 'no-data' && window.app.state.mobile === false) {
                // If this region has no data, then update the page state to not select a region at all
                window.objPageState.updatepagestate({
                    view: 'worldmap',
                    filter: {
                        datasource: window.objDataFilter.state.filter.datasource,
                        subtype: window.objDataFilter.state.filter.subtype,
                        oru: 'none',
                    }
                });
            } else {
                // This region contains data so start highlighting the area in the map and fill the details panel with data
                window.TweenLite.to(elRegion, 0, {
                    opacity: 0.7,
                    onComplete: function () {
                        // alert('in')
                        // debugger;
                        self.hideselectedcountries();
                        elRegion.setAttribute('class', 'active');

                        // JT: I introduced a very crappy way to check for a tablet - can this be improved and become app.state.tablet ?
                        if (window.app.state.width > 768) {
                            self.updateui(regionData, window.objPageState.state.filter.oru, elRegion);
                        } else {
                            window.TweenLite.to(self.el.elsvgholder, 0.2, {
                                opacity: 0,
                                onComplete: function () {
                                    self.updateui(regionData, window.objPageState.state.filter.oru, elRegion);
                                }
                            });
                        }


                    }
                });
            }

        } else {
            console.log('Could not find the region in the map to animate.');
            console.log(window.objPageState.state.filter.oru);
        }



    },
    updateui: function (regionData, idCountry, elRegion) {
        var self = this;

        // debugger;
        // if(app.state.width<1000 || app.state.height<1000)self.el.elsvgholder.style.display = 'none';

        // console.log(regionData);

        // Set the rounded values in the ui
        self.setroundeddatainui(regionData);

        // Function to add a fade in effect for building up the Lives Improved person images in the UI
        function doScaledTimeout(i, elLiIcons, elem) {
            setTimeout(function () {
                elLiIcons.appendChild(elem);
            }, i * 0);
        }

        if (window.objDataFilter.state.filter.datasource === 'lives_improved') {

            // Set the calculated lives improved percentage
            window.objRegionInfo.el.data.percentagelivesimproved.textContent = self.roundlivesimprovedpercentage(regionData.percentageLI) + '%';

            // Set the correct images matching the percentage
            var elLivesImprovedIcons = window.getEl('lives_improved_icons');

            // Clear images that where set before
            elLivesImprovedIcons.innerHTML = '';

            var roundedData = self.roundlivesimprovedpercentage(regionData.percentageLI);

            // debugger;
            for (var i = 0; i < 100; i++) {
                var elem = document.createElement("img");
                if (i < roundedData) {
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

            // Check if there is more then one icons panel
            var iconpanels = document.querySelectorAll('.lives_improved_icons');
            if (iconpanels.length > 1) {
                iconpanels[1].innerHTML = iconpanels[0].innerHTML;
            }
        }


        // Set the labels in the header
        window.objHeader.setregionname(window.objOruFilter.getregionnamebyid((idCountry.length < 4 ? idCountry : idCountry.toLowerCase())));

        // objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());

        // if(getEl('btn_back').className.indexOf('hide')> -1){
        // 	toggleClass(getEl('btn_back'), 'hide');
        // 	toggleClass(getEl('toggle_favourite'), 'hide');
        // }
        // objSliders.show();
        window.objRegionInfo.show();


        window.TweenLite.to(elRegion, 0.3, {
            opacity: 1,
            onComplete: function () {

            }
        });

    },

    // Updates the fields in the ui with new data
    setroundeddatainui: function (objData) {
        // debugger;
        var self = this;
        var objExtendedData = self.roundlivesimproveddataobject(objData);
        // console.log('++++');
        // console.log('- objData: ' + JSON.stringify(objData));
        // console.log('- objExtendedData: ' + JSON.stringify(objExtendedData));
        // console.log('++++');

        var elLivesImproved = window.getEl('region_info_wrapper lives_improved');
        var elGlobalPresence = window.getEl('region_info_wrapper global_presence');
        var elSustainability = window.getEl('region_info_wrapper sustainability');

        function selectValueForUi(key) {
            return (objData[key] === '-') ? objData[key] : objExtendedData[key];
        }

        // console.log(objExtendedData)

        if (window.objPageState.state.filter.datasource === 'lives_improved') {
            // Lives improved
            window.objRegionInfo.el.data.nrlivesimproved.textContent = objExtendedData.displayl + ' ' + window.translateFragment('million');
            window.objRegionInfo.el.data.labellivesimproved.textContent = window.translateFragment('lives_improved');
            window.objRegionInfo.el.data.gdp.textContent = objExtendedData.displayg + objExtendedData.labelg;
            window.objRegionInfo.el.data.population.textContent = objExtendedData.displayp + objExtendedData.labelp;

            window.TweenLite.to(elGlobalPresence, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
            window.TweenLite.to(elSustainability, 0.3, {
                opacity: 0,
                'z-index': -2,
                onComplete: function () {

                }
            });
            window.TweenLite.to(elLivesImproved, 0.3, {
                opacity: 1,
                'z-index': 1,
                onComplete: function () {

                }
            });
        } else if (window.objPageState.state.filter.datasource === 'global_presence') {
            // Global presence
            window.objRegionInfo.el.data.assets.textContent = selectValueForUi('value_assets');
            window.objRegionInfo.el.data.employees.textContent = selectValueForUi('value_employees');
            window.objRegionInfo.el.data.female.textContent = selectValueForUi('value_female');
            window.objRegionInfo.el.data.male.textContent = selectValueForUi('value_male');
            window.objRegionInfo.el.data.plants.textContent = selectValueForUi('value_plants');
            window.objRegionInfo.el.data.research.textContent = selectValueForUi('value_research');
            window.objRegionInfo.el.data.sales.textContent = selectValueForUi('value_sales');

            window.TweenLite.to(elGlobalPresence, 0.3, {
                opacity: 1,
                'z-index': 1,
                onComplete: function () {

                }
            });
            window.TweenLite.to(elSustainability, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
            window.TweenLite.to(elLivesImproved, 0.3, {
                opacity: 0,
                'z-index': -2,
                onComplete: function () {

                }
            });
        } else if (window.objPageState.state.filter.datasource === 'sustainability') {
            // Sustainability
            try {
                window.objRegionInfo.el.data.co2.textContent = selectValueForUi('value_co2');
                window.objRegionInfo.el.data.emission.textContent = selectValueForUi('value_emissions');
                window.objRegionInfo.el.data.emissionhaz.textContent = selectValueForUi('value_emissionshaz');
                window.objRegionInfo.el.data.trc.textContent = selectValueForUi('value_trc');
                window.objRegionInfo.el.data.waste.textContent = selectValueForUi('value_waste');
                window.objRegionInfo.el.data.wasterecycled.textContent = selectValueForUi('value_wasterecycled');
                window.objRegionInfo.el.data.water.textContent = selectValueForUi('value_water');
            } catch (err) {
                console.log('ERROR:');
                console.dir(err);
            }

            window.TweenLite.to(elGlobalPresence, 0.3, {
                opacity: 0,
                'z-index': -1,
                onComplete: function () {

                }
            });
            window.TweenLite.to(elSustainability, 0.3, {
                opacity: 1,
                'z-index': 1,
                onComplete: function () {

                }
            });
            window.TweenLite.to(elLivesImproved, 0.3, {
                opacity: 0,
                'z-index': -2,
                onComplete: function () {

                }
            });
        }


    },

    // Rounds the data befor sending it to the app
    roundlivesimproveddataobject: function (objData) {
        // console.log(objData)
        var intDecimals = 0;

        if (window.objPageState.state.filter.datasource === 'lives_improved') {
            // Lives improved
            if (objData.l >= 0) {
                // Always have 4 digits in the display

                // More than 1000 million
                if (objData.l >= 1000000000) {
                    // console.log('-2');
                    objData.roundedl = Math.round(objData.l / 1000000);

                    // console.log(objData.roundedl)
                }

                // 100 - 999.99 million
                if (objData.l >= 100000000 && objData.l < 1000000000) {
                    // console.log('-1');
                    objData.roundedl = Math.round((objData.l / 1000000) * 10) / 10;
                    intDecimals = 1;
                }

                // 10 - 99.99 million
                if (objData.l >= 10000000 && objData.l < 100000000) {
                    // console.log('0');
                    objData.roundedl = Math.round((objData.l / 1000000) * 100) / 100;
                    intDecimals = 2;
                    if (window.objPageState.state.filter.orulevel === '3') intDecimals = 1;
                }

                // 0.0001 - 9.99 million
                if (objData.l < 10000000) {
                    // console.log('1');
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
                objData.displayl = window.formatMoney(objData.roundedl, intDecimals, ',', '.', '');

                // objData.labell = 'million lives improved';
                objData.labell = '';
            }

            // GDP
            if (objData.g >= 0) {
                if (objData.g > 1) {
                    objData.roundedg = Math.round(objData.g / 1);
                    intDecimals = 0;
                } else {
                    objData.roundedg = Math.round((objData.g / 1) * 10) / 10;
                    intDecimals = 1;
                }
                objData.displayg = window.formatMoney(objData.roundedg, intDecimals, ',', '.', '');

                // objData.labelg = ' ' + window.translateFragment('billion');
                objData.labelg = '';
            }

            // Population
            if (objData.p >= 0) {
                if (objData.p > 1000000) {
                    objData.roundedp = Math.round(objData.p / 1000000);
                    intDecimals = 0;
                } else {
                    objData.roundedp = Math.round((objData.p / 1000000) * 10) / 10;
                    intDecimals = 1;
                }
                objData.displayp = window.formatMoney(objData.roundedp, intDecimals, ',', '.', '');

                // objData.labelp = ' ' + window.translateFragment('million');
                objData.labelp = '';
            }

            return objData;

        } else {
            // Loop through the datapoints and apply formatting/rounding, etc.

            var objDataRounded = window.cloneObject(objData);
            for (var key in objDataRounded) {
                if (typeof key === 'string') {
                    switch (key) {
                        case 'value_co2':
                        case 'value_emissions':
                        case 'value_emissionshaz':
                        case 'value_waste':
                        case 'value_wasterecycled':
                        case 'value_assets':
                        case 'value_employees':
                        case 'value_sales':
                            objDataRounded[key] = window.formatMoney(objData[key], 0, ',', '.', '');
                            break;

                        case 'value_water':
                            var water = objData[key] + '';
                            if (water.indexOf(',') > -1) {
                                water = water.replace(/,/g, '');
                            }
                            objDataRounded[key] = window.formatMoney(water, 0, ',', '.', '');
                            break;

                        default:
                            objDataRounded[key] = objData[key];
                    }

                }
            }

            return objDataRounded;
        }
    },

    roundlivesimprovedpercentage: function (percentageLI) {
        if (percentageLI > 100) return 100;
        if (percentageLI >= 10 && percentageLI < 100) return Math.round(percentageLI);
        if (percentageLI < 10 && percentageLI > 0.1) return Math.round(percentageLI * 10) / 10;
        return '< 0.1';
    },

    init: function () {
        var self = this;
        self.state.visible = false;

        self.el.elsvgholder = window.getEl('holder_1000');
    }
}
