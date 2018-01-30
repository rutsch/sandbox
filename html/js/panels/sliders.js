var objSliders = {
    state: {
        visible: null,
        tweening: null
    },
    el: {
        wrapper: null,
        innerwrapper: null,
        slidersales: null,
        slidergreensales: null
    },
    vars: {
        data: null,
        content: null,
        slidersalesvalue: 0,
        slidergreensalesvalue: 0,
        livesimprovedcurrent: 0,
        simulatorsampling: false,
        debug: false,
        updatetrendgraph: true,
        updatecurrent: false,
        usebiliniarinterpolation: true,
        debugstring: '',
        recalculatecounter: 0,
        setupsimulator: true
    },
    
    /*
     * UI functions
     * 
     * !!!!!!!!!!!!!!!!!!!!! NOT USED, ALL ANIMATIONS ARE STARTED FROM OBJREGIONINFO !!!!!!!!!!!!!!!!!!!!!!!! 
     * 
     */

    /* Helpers */
    calculatefloorceil: function (intValue, intStep) {
        var intFloor = 0,
            intCeil = 0;
        var intermediate = Math.round(intValue / intStep) * intStep;
        
        // console.log('- intermediate='+intermediate);
        // console.log('- modulus='+(s%step));

        if (intValue >= 0) {
            if ((intValue % intStep) > (intStep / 2)) {
                // console.log('1');
                intCeil = intermediate;
                intFloor = intCeil - intStep;
            } else {
                // console.log('2');
                intFloor = intermediate;
                intCeil = intFloor + intStep;
            }

        } else {
            if (Math.abs((intValue % intStep)) > (intStep / 2) || (intValue % intStep) === 0) {
                // console.log('3');
                intFloor = intermediate;
                intCeil = intFloor + intStep;
            } else {
                // console.log('4');
                intCeil = intermediate;
                intFloor = intCeil - intStep;
            }
        }
        return {
            floor: intFloor,
            ceil: intCeil
        };
    },

    // Loads the data and sets up the interface 
    start: function () {
        var self = this;
        
        // Hide the green sales slider element for Healthcare
        // debugger;
        if (window.objPageState.state.filter.sector === 'PD0900') {
            objSliders.el.slidergreensales.parentNode.style.visibility = 'hidden';
        } else {
            objSliders.el.slidergreensales.parentNode.style.visibility = 'visible';
        }

        // Start Ajax Call to get simulation data
        var objData = {
            fulldomain: location.protocol + "//" + location.hostname,
            method: 'getlivesimprovedcachedata',
            type: 'json',
            oru: window.objPageState.state.filter.oru,
            mru: window.objPageState.state.filter.mru,
            snapshotid: window.objConfig.currentsnapshotid,
            token: window.objLogin.token
        }

        // Reset the counter
        self.recalculatecounter = 0;

        window.psv('GET', window.objConfig.urls.dynamicresourceurl, objData, self.getsimulatordatahandler);
    },

    // Processes the data received from the server so that it can be used in the graphs
    getsimulatordatahandler: function (err, response) {
        // Because we are executed from an async function we have to explicitly use objSliders below...
        var self = objSliders;

        if (err) {
            window.objError.handleError('objSliders.start', err);
        } else {
            // Check if authentication is required
            if (response.hasOwnProperty('authenticated') && !response.authenticated) {
                window.handleShibbolethLoginRequired();
            } else {
                // Check if we have received an error
                if (window.hasProperty(response, 'error')) {
                    window.objError.show(response.error.message, true);
                } else {
                    
                    // Check if we have actually received simulator cache data and update the setupsimulator variable accordingly
                    self.vars.setupsimulator = (response.hasOwnProperty('sales') && response.hasOwnProperty('greensales') && response.hasOwnProperty('scenario'));

                    // Store the data we have received
                    self.vars.data = response;

                    // Fill the information we have received for the trend graph in the global object
                    window.app.trendgraph.predictionlabel = self.vars.data.layout.simulatorlabel;
                    window.app.trendgraph.predictiondate = self.vars.data.layout.simulatordate;
                    window.app.trendgraph.stylecurrentline = self.vars.data.layout.simulatorstyle;


                    if (self.vars.setupsimulator) {
                        // Set the title
                        window.getEl('simulation_header').innerHTML = self.vars.data.layout.simulatorlabel + window.app.labels.simulatortitle;

                        // self.el.innerwrapper.style.display='block';
                        self.el.errorwrapper.style.display = 'none';
                    }

                    // Show the interface
                    // self.show();

                    //initiate the base logic and start sampling the slider positions
                    if (self.vars.setupsimulator) self.setupsimulator();
                    self.setuphistorygraph();
                }
            }
        }
    },




    // Prepares the object with data that will be send to the graph engine
    setuphistorygraph: function () {
        var self = this;
        var data = self.vars.data.historicaldata;
        var objGraphData = {
            points: [],
            ymin: null,
            ymax: null
        };

        /* Construct an object that we can sent to the graph utility */
        var strPredicionLabel = '',
            strPredictionDate = '',
            intPredictionUtc = 0;
        var intMaxValue = -1000000000000,
            intMinValue = 1000000000000;
        var reggie = /(\d{4})-(\d{2})-(\d{2})/;
        var dateArray;

        // Sort the array before processing it
        data.sort(function (a, b) {
            return (new Date(a.dateend)) - (new Date(b.dateend));
        })

        // console.log(JSON.stringify(data));

        for (var i = 0; i < data.length; i++) {
            var intLivesImproved = data[i].l;
            if (intLivesImproved === -1) intLivesImproved = 0;
            
            // console.log(intLivesImproved);


            dateArray = reggie.exec(data[i].dateend);

            // Add an element to the array
            objGraphData.points.push({
                value: window.objMap.roundlivesimproveddataobject({
                    l: intLivesImproved,
                    g: -1,
                    p: -1
                }).displayl,
                label: data[i].name,
                dateend: data[i].dateend,
                utcend: Date.UTC(
                    (+dateArray[1]),
                    (+dateArray[2]) - 1, // Careful, month starts at 0!
                    (+dateArray[3])
                )
            });

            // Find out the data for the last element (year end prediction) in the graph
            if (i === (data.length - 1)) {
                // Determine what the last date should be
                var myDate = new Date(data[i].dateend);


                // TODO: make this dynamic based on input in backend!!!!

                // If the last snapshot ends on xxxx-12-31, then we need to show the next year
                if (window.app.trendgraph.predictionlabel !== '') {
                    strPredicionLabel = window.app.trendgraph.predictionlabel;
                } else {
                    strPredicionLabel = 'Q4 ' + (((myDate.getMonth() + 1) === 12) ? (myDate.getFullYear() + 1) : myDate.getFullYear());
                }
                if (window.app.trendgraph.predictiondate !== '') {
                    strPredictionDate = window.app.trendgraph.predictiondate;
                } else {
                    strPredictionDate = (((myDate.getMonth() + 1) === 12) ? (myDate.getFullYear() + 1) : myDate.getFullYear()) + "-12-31";
                }

                dateArray = reggie.exec(strPredictionDate);
                intPredictionUtc = Date.UTC(
                    (+dateArray[1]),
                    (+dateArray[2]) - 1, // Careful, month starts at 0!
                    (+dateArray[3])
                )

            }

            // Keep track of min and max values so that we can scale the graph properly
            if (intLivesImproved > intMaxValue) intMaxValue = intLivesImproved;
            if (intLivesImproved < intMinValue) intMinValue = intLivesImproved;
        }



        // console.log(intMaxValue)

        // Add the last element (year end prediction)
        if (self.vars.setupsimulator && self.vars.data.livesimproved.s0g0) {
            objGraphData.points.push({
                value: window.objMap.roundlivesimproveddataobject({
                    l: self.vars.data.livesimproved.s0g0,
                    g: -1,
                    p: -1
                }).displayl,
                label: strPredicionLabel,
                dateend: strPredictionDate,
                utcend: intPredictionUtc
            });

            // Test if we need to correct the min-max values based on the simulator data we have just received 
            if (self.vars.data.livesimproved.s0g0 > intMaxValue) intMaxValue = self.vars.data.livesimproved.s0g0;
            if (self.vars.data.livesimproved.s0g0 < intMinValue) intMinValue = self.vars.data.livesimproved.s0g0;

            // Grab the min and max values from the simulator data set
            var strKeyMin = 's' + (self.vars.data.scenario.salesmin + '').replace(/\-/, 'minus') + 'g' + (self.vars.data.scenario.greensalesmin + '').replace(/\-/, 'minus');
            var strKeyMax = 's' + (self.vars.data.scenario.salesmax + '').replace(/\-/, 'minus') + 'g' + (self.vars.data.scenario.greensalesmax + '').replace(/\-/, 'minus');
            
            // console.log('From historical data: intMaxValue=' + intMaxValue + ', intMinValue=' + intMinValue + 'strKeyMin=' + strKeyMin + ', strKeyMax=' + strKeyMax)

            var intSimulatorMax = self.vars.data.livesimproved[strKeyMax];
            var intSimulatorMin = self.vars.data.livesimproved[strKeyMin];

            // Check if these values are more extreme than the points we have already processed
            if (intSimulatorMax > intMaxValue) intMaxValue = intSimulatorMax;
            if (intSimulatorMin >= 0 && intSimulatorMin < intMinValue) intMinValue = intSimulatorMin;

            // console.log('From simulator data: intSimulatorMax=' + intSimulatorMax + ', intSimulatorMin=' + intSimulatorMin);

            // console.log(intMaxValue + ' ' + intMinValue);
        }



        // Determine min and max values to show on the y-axis
        objGraphData.ymin = parseFloat(window.objMap.roundlivesimproveddataobject({
            l: intMinValue,
            g: -1,
            p: -1
        }).displayl.replace(/,/, ''));
        
        // objGraphData.ymin = objGraphData.ymin - Math.round(((objGraphData.ymin / 100) * 5));
        objGraphData.ymax = parseFloat(window.objMap.roundlivesimproveddataobject({
            l: intMaxValue,
            g: -1,
            p: -1
        }).displayl.replace(/,/, ''));

        // Set the dimensions of the graph
        // objTrendGraph.props.width=self.el.history.offsetWidth;
        // objTrendGraph.props.height=self.el.history.offsetHeight;

        // Fix the number of grid lines
        window.objTrendGraph.props.axis.ygridlines = 3;
        if (objGraphData.ymax < 0.1) window.objTrendGraph.props.axis.ygridlines = null


        // Remove elements from the graph data object if there are more points than specified in app.js
        if (window.app.trendgraph.pointsvisible != null) {
            if (objGraphData.points.length > window.app.trendgraph.pointsvisible) {
                for (var i = 0; i < (objGraphData.points.length - window.app.trendgraph.pointsvisible + 1); i++) {
                    objGraphData.points.shift();
                }

            }
        }

        // Add style information from app.js into the data object
        objGraphData.styles = {};
        objGraphData.styles.stylecurrentline = window.app.trendgraph.stylecurrentline;

        // Set other properties for the graph
        window.objTrendGraph.props.line.lastsegment.class = 'lastsegment';
        window.objTrendGraph.props.line.lastpoint.id = 'lp';
        
        // console.log(objGraphData);

        // Draw the graph
        window.objTrendGraph.reset();
        window.objTrendGraph.drawgraph(objGraphData);

    },
    setupsimulator: function () {
        var self = this;
        
        // Reset data
        self.el.slidersales.value = 0;
        self.el.slidergreensales.value = 0;

        self.el.slidersaleslabel.innerHTML = '0%';
        if (window.objRegionInfo.el.wrapper != null) window.objRegionInfo.el.wrapper.className = '';

        self.vars.slidersalesvalue = 0;

        // Store the current lives improved number
        var strKey = window.objPageState.state.filter.mru + "_" + window.objPageState.state.filter.oru;
        var intPopulation = window.objMap.data[strKey].l;
        self.vars.livesimprovedcurrent = intPopulation;

        // Store the green sales percentage and determine max and min for gsp slider
        self.vars.gsp = (window.objMap.data[strKey].gsp === -1) ? 0 : Math.round(window.objMap.data[strKey].gsp * 100);
        self.vars.gspslidermin = (self.vars.gsp - (-self.vars.data.scenario.greensalesmin) < 0) ? 0 : self.vars.gsp - (-self.vars.data.scenario.greensalesmin);
        self.vars.gspslidermax = (self.vars.gsp + self.vars.data.scenario.greensalesmax > 100) ? 100 : self.vars.gsp + self.vars.data.scenario.greensalesmax;
        
        // Recalculate values
        self.vars.greensalesmin = (self.vars.gsp - (-self.vars.data.scenario.greensalesmin)) < 0 ? self.vars.gsp : self.vars.data.scenario.greensalesmin;
        self.vars.greensalesmax = (self.vars.gsp + self.vars.data.scenario.greensalesmax > 100) ? 100 - self.vars.gsp : self.vars.data.scenario.greensalesmax;
        self.vars.salesmax = self.vars.data.scenario.salesmax;
        self.vars.salesmin = self.vars.data.scenario.salesmin;

        self.el.slidergreensaleslabel.innerHTML = self.vars.gsp + '%';
        self.vars.slidergreensalesvalue = self.vars.gsp;
        
        // Set gsp value
        self.el.slidergreensales.value = 0;

        // Set the values min/max for the slider labels
        // console.log(self.el.salesmin);
        self.el.salesmin.innerHTML = self.vars.data.scenario.salesmin;
        self.el.salesmax.innerHTML = self.vars.data.scenario.salesmax;
        self.el.greensalesmin.innerHTML = self.vars.gspslidermin;
        self.el.greensalesmax.innerHTML = self.vars.gspslidermax;

        // Set the min and max values on the input nodes
        self.el.slidersales.setAttribute('min', self.vars.data.scenario.salesmin);
        self.el.slidersales.setAttribute('max', self.vars.data.scenario.salesmax);

        // debugger;
        self.el.slidergreensales.setAttribute('min', self.vars.gspslidermin - self.vars.gsp);
        self.el.slidergreensales.setAttribute('max', self.vars.gspslidermax - self.vars.gsp);

        // Position the "0" label
        // self.vars.data.scenario.salesmin=-30;
        // console.log('greensalesmin: %s, greensalesmax: %s', self.vars.data.scenario.greensalesmin, self.vars.greensalesmax);
        // console.log('gspslidermin: %s, gspslidermax: %s', self.vars.gspslidermin, self.vars.gspslidermax);
        // console.log(self.vars.data.scenario);
        var intLeftSales = (Math.abs(self.vars.data.scenario.salesmin)) / (Math.abs(self.vars.data.scenario.salesmin) + self.vars.salesmax) * 100 - 2;
        var intLeftGreensales = (self.vars.gsp - self.vars.gspslidermin) / (self.vars.gspslidermax - self.vars.gspslidermin) * 100 - 3;
        
        // console.log('intLeftGreensales: %s', intLeftGreensales);
        // debugger;
        window.getEl('saleszero').style.left = intLeftSales + '%';
        window.getEl('greensaleszero').style.left = intLeftGreensales + '%';
        self.el.greensaleszero.innerHTML = self.vars.gsp;

        // Hide the green sales laber when it's above 85% (otherwise it will clash with the max value in the UI)
        self.el.greensaleszero.style.display = (intLeftGreensales > 85 || self.vars.gsp === 0) ? 'none' : 'inline';
        
        // self.el.slidersaleslabel

        // Start the sampling process
        self.vars.simulatorsampling = true;

        self.executeslidersampling();
    },
    executeslidersampling: function () {
        var self = this;

        // Retrieve the values of the sliders
        var intCurrentSalesPercentage = self.el.slidersales.value;
        var intCurrentGreenSalesPercentage = self.el.slidergreensales.value;

        // Only call the simulator update if the values of the sliders have changed...
        if (intCurrentSalesPercentage !== self.vars.slidersalesvalue || intCurrentGreenSalesPercentage !== self.vars.slidergreensalesvalue) {
            // console.log('recalculate simulated data: intCurrentSalesPercentage=' + intCurrentSalesPercentage + ' - intCurrentGreenSalesPercentage=' + intCurrentGreenSalesPercentage);
            self.calculatevalue(intCurrentSalesPercentage, intCurrentGreenSalesPercentage);

            // console.log(self.recalculatecounter);
            if (self.recalculatecounter === 1) {
                // Sent a stats action to record that somebody has manipulated the sliders
                window.objAnalytics.data.events.push({
                    category: 'simulator' /* Required - object that was interacted with */ ,
                    action: 'slide' /* Required - type of interaction */ ,
                    label: 'simulator change' /* Optional - used for categorization of events */
                });
            }
            self.recalculatecounter++;
        }


        self.vars.slidersalesvalue = Math.round(intCurrentSalesPercentage * 10) / 10;
        self.vars.slidergreensalesvalue = Math.round(intCurrentGreenSalesPercentage * 10) / 10;

        // if(self.vars.timersimulator)clearTimeout(self.vars.timersimulator);

        // console.log('in sampler '+intCurrentGreenSalesPercentage)

        // Calls itself...
        if (self.vars.simulatorsampling) {
            self.vars.timersimulator = setTimeout(function () {
                self.executeslidersampling();
            }, 100);
        }

    },
    calculatevalue: function (intCurrentSalesPercentage, intCurrentGreenSalesPercentage) {
        var self = this;
        intCurrentSalesPercentage = parseFloat(intCurrentSalesPercentage, 10);
        intCurrentGreenSalesPercentage = parseFloat(intCurrentGreenSalesPercentage, 10);

        // Update the lables of the sliders
        self.el.slidersaleslabel.innerHTML = (intCurrentSalesPercentage > 0 ? '+' : '') + Math.round(intCurrentSalesPercentage * 10) / 10 + '%';
        
        // console.log(intCurrentGreenSalesPercentage + ' - ' + self.vars.gsp + ' - ' + (Math.round((intCurrentGreenSalesPercentage + self.vars.gsp) * 10) / 10));
        self.el.slidergreensaleslabel.innerHTML = Math.round((intCurrentGreenSalesPercentage + self.vars.gsp) * 10) / 10 + '%';

        // Encode the retieved values so that we can find them in the simululator data
        var intLivesImprovedSimulated = 0;

        if (self.vars.usebiliniarinterpolation) {
            var sfloor = 0,
                sceil = 0,
                gsfloor = 0,
                gsceil = 0,
                objCeilFloor = {};
            var q11 = 0,
                q12 = 0,
                q21 = 0,
                q22 = 0,
                key = '';
            var r1 = 0,
                r2 = 0;

            if (intCurrentSalesPercentage === self.vars.salesmax) intCurrentSalesPercentage -= 0.0001;
            if (intCurrentGreenSalesPercentage === self.vars.greensalesmax) intCurrentGreenSalesPercentage -= 0.0001;
            
            // console.log('- intCurrentSalesPercentage=' + intCurrentSalesPercentage + ' - intCurrentGreenSalesPercentage=' + intCurrentGreenSalesPercentage);

            // Clear debug string
            if (self.vars.debug) self.vars.debugstring = '';

            // Get ceil and floor
            objCeilFloor = self.calculatefloorceil(intCurrentSalesPercentage, self.vars.data.scenario.salesstep);
            sfloor = objCeilFloor.floor;
            sceil = objCeilFloor.ceil;

            objCeilFloor = self.calculatefloorceil(intCurrentGreenSalesPercentage, self.vars.data.scenario.greensalesstep);
            gsfloor = objCeilFloor.floor;
            gsceil = objCeilFloor.ceil;
            if (self.vars.debug) self.vars.debugstring += "- sfloor=" + sfloor + "<br/>- sceil=" + sceil + "<br/>- gsfloor=" + gsfloor + "<br/>- gsceil=" + gsceil + "<br/>"
            
            // console.log("- sfloor=" + sfloor + "<br/>" + "- sceil=" + sceil + "<br/>" + "- gsfloor=" + gsfloor + "<br/>" + "- gsceil=" + gsceil + "<br/>");

            // Get all combinations
            key = 's' + (sfloor + '').replace(/-/, 'minus') + 'g' + (gsfloor + '').replace(/-/, 'minus');
            q11 = self.vars.data.livesimproved[key];
            if (self.vars.debug) self.vars.debugstring += '- q11 key=' + key + ', value=' + q11 + '<br/>';

            key = 's' + (sceil + '').replace(/-/, 'minus') + 'g' + (gsfloor + '').replace(/-/, 'minus');
            q21 = self.vars.data.livesimproved[key];
            if (self.vars.debug) self.vars.debugstring += '- q21 key=' + key + ', value=' + q21 + '<br/>';

            key = 's' + (sfloor + '').replace(/-/, 'minus') + 'g' + (gsceil + '').replace(/-/, 'minus');
            q12 = self.vars.data.livesimproved[key];
            if (self.vars.debug) self.vars.debugstring += '- q12 key=' + key + ', value=' + q12 + '<br/>';

            key = 's' + (sceil + '').replace(/-/, 'minus') + 'g' + (gsceil + '').replace(/-/, 'minus');
            q22 = self.vars.data.livesimproved[key];
            if (self.vars.debug) self.vars.debugstring += '- q22 key=' + key + ', value=' + q22 + '<br/>';

            // Interpolation phase1
            r1 = ((sceil - intCurrentSalesPercentage) / (sceil - sfloor) * q11) + ((intCurrentSalesPercentage - sfloor) / (sceil - sfloor) * q21);
            r2 = ((sceil - intCurrentSalesPercentage) / (sceil - sfloor) * q12) + ((intCurrentSalesPercentage - sfloor) / (sceil - sfloor) * q22);

            // Interpolation phase2
            intLivesImprovedSimulated = ((gsceil - intCurrentGreenSalesPercentage) / (gsceil - gsfloor) * r1) + ((intCurrentGreenSalesPercentage - gsfloor) / (gsceil - gsfloor) * r2);

            if (self.vars.debug) {
                if (window.getEl('debug') == null) {
                    console.log(self.vars.debugstring);
                } else {
                    window.getEl('debug').innerHTML = self.vars.debugstring;
                }
                self.vars.debugstring = '';
            }
        }


        // Check if the new lives improved number is actually a number
        if (isNaN(intLivesImprovedSimulated) === false) {
            // Get the poplation
            // var strKey=objMruFilter.state.selectedmru+"_"+objOruFilter.state.selectedoruguid;
            var intPopulation = window.objMap.data[window.objPageState.state.filter.mru + "_" + window.objPageState.state.filter.oru].p;

            // Calculate the lives improved percentage
            var intLivesImprovedSimulatedPercentage = Math.round((intLivesImprovedSimulated / (intPopulation)) * 100);

            // console.log(intLivesImprovedSimulatedPercentage);
            // console.log(intLivesImprovedSimulated);

            // Overwrite the livesimproved number in the interface

            // console.log(objMap.roundlivesimproveddataobject({l:intLivesImprovedSimulated, g:-1, p: -1}).displayl);

            // UPDATE INTERFACE
            if (self.vars.updatecurrent) {
                // Use the utility in objMap to round the number in the correct format so that it can be displayed
                self.el.livesimprovednumber.innerHTML = window.objMap.roundlivesimproveddataobject({
                    l: intLivesImprovedSimulated,
                    g: -1,
                    p: -1
                }).displayl.replace(/,/, '');

                // Set the infographic text
                self.el.livesimprovedpercentage.textContent = intLivesImprovedSimulatedPercentage + '%';

                // Update the infographic circle
                window.applyInfographicDelta((intLivesImprovedSimulatedPercentage * 360) / 100);

                // Set the class in the wrapper div - that will trigger the "up" or "down" icon display
                if (intLivesImprovedSimulated > self.vars.livesimprovedcurrent) {
                    window.objRegionInfo.el.wrapper.setAttribute('class', 'more');

                } else {
                    if (intLivesImprovedSimulated < self.vars.livesimprovedcurrent) {
                        window.objRegionInfo.el.wrapper.setAttribute('class', 'less');
                    } else {
                        window.objRegionInfo.el.wrapper.setAttribute('class', 'equal');
                    }
                }
            }

            if (self.vars.updatetrendgraph) {
                window.objTrendGraph.updatelastpointingraph(parseFloat(window.objMap.roundlivesimproveddataobject({
                    l: intLivesImprovedSimulated,
                    g: -1,
                    p: -1
                }).displayl.replace(/,/, '')))
            }
        }





    },
    togglesimulator: function (useSimulator) {
        var self = this;
        self.vars.setupsimulator = useSimulator;
        self.el.innerwrapper.style.display = (useSimulator) ? 'block' : 'none';
    },
    init: function () {
        var self = this;
        self.state.visible = false;
        self.state.tweening = false;

        self.el.wrapper = window.getEl('simulation');
        self.el.innerwrapper = window.getEl('simulation_wrapper');
        self.el.errorwrapper = window.getEl('simulation_error_wrapper');
        self.el.slidersales = window.getEl('slidersales');
        self.el.slidergreensales = window.getEl('slidergreensales');
        self.el.slidersaleslabel = window.getEl('value_sales');
        self.el.slidergreensaleslabel = window.getEl('value_green_sales');
        self.el.livesimprovednumber = window.getEl('nr_lives_improved');
        self.el.livesimprovedpercentage = window.getEl('lives_improved_percentage');
        self.el.history = window.getEl('region_history');

        self.el.salesmin = window.getEl('salesmin');
        self.el.salesmax = window.getEl('salesmax');
        self.el.greensalesmin = window.getEl('greensalesmin');
        self.el.greensalesmax = window.getEl('greensalesmax');
        self.el.saleszero = window.getEl('saleszero');
        self.el.greensaleszero = window.getEl('greensaleszero');

        // Set the title
        window.getEl('simulation_header').innerHTML = window.app.labels.simulatortitle;
        // Store the content of the slider interface in a variable so that we can inject it
        self.vars.content = self.el.wrapper.innerHTML;
    }
}