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
                    // Store the data we have received
                    self.vars.data = response;

                    // Fill the information we have received for the trend graph in the global object
                    window.app.trendgraph.predictionlabel = self.vars.data.layout.simulatorlabel;
                    window.app.trendgraph.predictiondate = self.vars.data.layout.simulatordate;
                    window.app.trendgraph.stylecurrentline = self.vars.data.layout.simulatorstyle;

                    // Continue by setting up the graph
                    self.setuphistorygraph();
                }
            }
        }
    },




    // Generates the trend graph in the UI
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
        window.setTimeout(function () {
            window.objTrendGraph.redrawgraph();
        }, 1000)
        window.objTrendGraph.drawgraph(objGraphData);

    },
    init: function () {
        var self = this;
        self.state.visible = false;
        self.state.tweening = false;

    }
}
