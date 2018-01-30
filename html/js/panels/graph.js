var objTrendGraph = {
    state: {
        valuepopupopen: false,
        trendpopupflipped: false
    },
    vars: {
        popuptrendwidth: 0,
        popuptrendheight: 0,
        popuptrendtextwrapperheight: 0,
        popupvaluewidth: 0,
        popupvalueheight: 0,
        data: null,
        template: null
    },
    el: {
        root: null,
        lastsegment: null,
        lastpoint: null,
        popuptrend: null,
        popuptrendbase: null,
        popuptrendnumber: null,
        popuptrendtextwrapper: null,
        popupvalue: null,
        popupvaluenumber: null
    },
    props: {
        width: 640,
        height: 300,
        padding: {
            top: 60,
            bottom: 40,
            left: 45,
            right: 45
        },
        axis: {
            ymin: 4,
            ymax: 15,
            ystep: 2.5,
            ygridlines: null,
            /* Fixed number of gridlines */
            ygridlinesfullwidth: true,
            showxlines: false,
            xlinelength: 8,
            showylines: false,
            ylinelength: 8,
            ylabelinset: true,
            xpaddingleft: 35,
            xpaddingright: 10,
            ypaddingtop: 20,
            ypaddingbottom: 20
        },
        labels: {
            x: {
                padding: {
                    bottom: 20
                }
            },
            y: {
                translate: {
                    x: 0,
                    y: 8
                }
            }
        },
        coordinatepoint: {
            radius: 5
        },
        title: {
            text: 'Trend'
        },
        line: {
            lastsegment: {
                id: 'last_segment',
                class: 'last'
            },
            lastpoint: {
                id: 'last_point',
                class: 'last'
            }

        }
    },

    // New routine where time is used to calculate x-axis values
    getsvgcoordinatesforpointflex: function (intPointValue, intUtc) {
        var self = this;
        var intYRangePixels = self.props.height - self.props.padding.top - self.props.padding.bottom - self.props.axis.ypaddingtop - self.props.axis.ypaddingbottom;
        var intYRangeValues = self.props.axis.ymax - self.props.axis.ymin;
        var intXRangePixels = self.props.width - self.props.padding.left - self.props.padding.right - self.props.axis.xpaddingleft - self.props.axis.xpaddingright;
        var intXRangeValues = self.vars.data.points[self.vars.data.points.length - 1].utcend - self.vars.data.points[0].utcend;

        // console.log(self.vars.data.points[self.vars.data.points.length-1]);

        // Correct for 0 values on the y axis
        if (intYRangeValues === 0) {
            intYRangeValues = 0.001;
        }


        // Corrent the value if a string with "comma" notation is passed
        if (isNaN(intPointValue)) intPointValue = parseFloat((intPointValue + '').replace(/,/, ''));

        // (self.props.padding.right + (( intXRangePixels/intXRangeValues ) * intArrayPosition) - (( intXRangePixels/intXRangeValues )/2))
        return {
            x: (self.props.padding.left + self.props.axis.xpaddingleft + ((intXRangePixels / intXRangeValues) * (intUtc - self.vars.data.points[0].utcend))),
            y: (self.props.padding.top + (intYRangePixels - (intYRangePixels / intYRangeValues) * (intPointValue - self.props.axis.ymin)) + self.props.axis.ypaddingtop)
        }
    },

    createcoordinatepoint: function (elWrapper, objCoords, objPoint, strId) {
        var self = this;

        // Draw two circles: one as a visual indicator and another as hitarea
        for (var i = 0; i < 2; i++) {
            var elCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            elCircle.setAttributeNS(null, 'cx', (objCoords.x + ''));
            elCircle.setAttributeNS(null, 'cy', (objCoords.y + ''));
            elCircle.setAttributeNS(null, 'r', ((i === 0) ? 30 : self.props.coordinatepoint.radius));
            elCircle.setAttributeNS(null, 'data-value', self.correctlabeldecimals((objPoint.value + ''), (self.props.axis.ymax + '')));
            elCircle.setAttributeNS(null, 'data-label', objPoint.label);
            elCircle.setAttributeNS(null, 'class', ((i === 0) ? 'hitarea' : 'point'));

            if (strId !== '') {
                if (i === 1) elCircle.setAttributeNS(null, 'id', strId);
            } else {
                elCircle.setAttributeNS(null, 'onclick', 'objTrendGraph.showvaluepopup({show: true, x: ' + objCoords.x + ', y: ' + (objCoords.y - 8) + ', value: \'' + objPoint.value + '\', label: \'' + objPoint.label + '\'})');
            }
            elWrapper.appendChild(elCircle);
        }
    },

    createlabel: function (elWrapper, objCoords, objPoint, strType) {
        var self = this;
        var elText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        elText.setAttributeNS(null, 'x', (objCoords.x + ''));
        elText.setAttributeNS(null, 'y', (objCoords.y + ''));

        // Find the translate settings
        if (strType === 'y') {
            if (self.props.labels.y.translate) {
                elText.setAttributeNS(null, 'transform', 'translate(' + self.props.labels.y.translate.x + ', ' + self.props.labels.y.translate.y + ')');
            }
        }


        var textNode = document.createTextNode(objPoint.label);
        elText.appendChild(textNode);

        elWrapper.appendChild(elText);
    },

    setsvglinecoordinates: function (elLine, objCoords) {
        elLine.setAttributeNS(null, 'x1', objCoords.x1);
        if (isNaN(objCoords.y1)) {
            console.log(objCoords);
            console.trace(objCoords.y1)
        }
        elLine.setAttributeNS(null, 'y1', objCoords.y1);
        elLine.setAttributeNS(null, 'x2', objCoords.x2);
        elLine.setAttributeNS(null, 'y2', objCoords.y2);
    },

    updatelastpointingraph: function (intNewValue) {
        var self = this;

        // debugger;

        if (self.vars.data != null) {

            var objCoords = self.getsvgcoordinatesforpointflex(intNewValue, self.vars.data.points[self.vars.data.points.length - 1].utcend);
            
            // Update the line
            self.el.lastsegment.setAttributeNS(null, 'x2', objCoords.x);
            self.el.lastsegment.setAttributeNS(null, 'y2', objCoords.y);

            // Update the point
            self.el.lastpoint.setAttributeNS(null, 'cx', objCoords.x);
            self.el.lastpoint.setAttributeNS(null, 'cy', objCoords.y);
            self.el.lastpoint.setAttributeNS(null, 'data-value', intNewValue);

            // Position the trend popup
            self.positiontrendpopupandsetvalue(objCoords, intNewValue)
        }

    },

    positiontrendpopupandsetvalue: function (objCoords, intValue) {
        var self = this;

        // Determine if the popup needs to be flipped
        // console.log(objCoords.y+self.vars.popuptrendheight);
        // console.log(self.props.height-self.props.padding.bottom);
        // if((objCoords.y+self.vars.popuptrendheight)>=(self.props.height-self.props.padding.bottom)){
        if ((objCoords.y + self.vars.popuptrendheight) >= (self.props.height - self.props.padding.bottom)) {
            self.fliptrendpopup('flipped');
            
            // console.log('perform flip') 53
        } else {
            // console.log('set original')
            self.fliptrendpopup('original');
        }

        // Align the popup
        // var intCorrection=((self.state.trendpopupflipped)?-10:10);
        var strTranslateValue = self.el.popuptrend.getAttributeNS(null, 'transform').replace(/^.*\)\s+(.*)$/, '$1');
        if (window.app.state.ie) {
            self.el.popuptrend.setAttributeNS(null, 'transform', 'translate(' + (objCoords.x - self.vars.popuptrendwidth + 18) + ', ' + (objCoords.y + ((self.state.trendpopupflipped) ? -10 : 10)) + ') ');
        } else {
            self.el.popuptrend.setAttributeNS(null, 'transform', 'translate(' + (objCoords.x - self.vars.popuptrendwidth + 18) + ', ' + (objCoords.y + ((self.state.trendpopupflipped) ? -10 : 10)) + ') ' + strTranslateValue);
        }

        // Set the content in the popup
        self.el.popuptrendnumber.textContent = self.correctlabeldecimals((intValue + ''), (self.props.axis.ymax + ''));
    },

    showvaluepopup: function (objArgs) {
        var self = this;

        // alert('in showvaluepopup')
        // console.log(objArgs);

        if (objArgs.show) {
            // Align the popup and the show it
            self.el.popupvalue.setAttributeNS(null, 'transform', 'translate(' + (objArgs.x - (self.vars.popupvaluewidth / 2)) + ', ' + (objArgs.y - self.vars.popupvalueheight) + ')');
           
            // self.el.popupvalue.setAttributeNS(null,'transform','translate('+(objArgs.x-20)+', '+(objArgs.y)+')');

            self.el.popupvalue.setAttributeNS(null, 'visibility', 'visible');
            self.el.popupvaluenumber.textContent = (objArgs.value + '');
        } else {
            // Hide the popup
            self.el.popupvalue.setAttributeNS(null, 'visibility', 'hidden');
        }

    },

    decimalplaces: function (num) {
        var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) {
            return 0;
        }
        return Math.max(0,
            
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0)
            
            // Adjust for scientific notation.
            - (match[2] ? +match[2] : 0)
        );
    },

    correctlabeldecimals: function (strLabel, strReferenceLabel) {
        var bolRoundPrecisionUp = false;
        var intReferenceLabelDecimals = 0;

        if (arguments.length === 3) bolRoundPrecisionUp = arguments[2];

        // Remove the commas so that we can actually calculate with the numbers
        strReferenceLabel = strReferenceLabel.replace(/,/, '');
        strLabel = strLabel.replace(/,/, '');

        // Get the number of decimals used in the reference label
        if (strReferenceLabel.indexOf('.') > -1) {
            intReferenceLabelDecimals = (strReferenceLabel.split('.')[1]).length;
        }

        var strReturnValue = window.formatMoney(parseFloat(strLabel), intReferenceLabelDecimals, ',', '.', '');

        if (bolRoundPrecisionUp && strReturnValue.indexOf('.') > -1) {
            strReturnValue = parseFloat(strReturnValue).toFixed((strReturnValue.split('.')[1]).length - 1);
        }

        return strReturnValue;

    },

    fliptrendpopup: function (strType) {
        var self = this;

        // Undo the flip and repositioning of the text elements
        if (strType === 'original' && self.state.trendpopupflipped) {
            self.el.popuptrendbase.removeAttributeNS(null, 'transform');
            self.el.popuptrendtextwrapper.removeAttributeNS(null, 'transform');
            self.state.trendpopupflipped = false;
        }

        // Perform a vertical flip and replace the text elements
        if (strType === 'flipped' && !self.state.trendpopupflipped) {
            self.el.popuptrendbase.setAttributeNS(null, 'transform', 'scale(1,-1)');
            self.el.popuptrendtextwrapper.setAttributeNS(null, 'transform', 'translate(0,-53)');
            self.state.trendpopupflipped = true;
        }

    },

    reset: function () {
        var self = this;
        
        // 1) throw the original svg node away
        var elContainer = self.el.root.parentNode;
        elContainer.removeChild(self.el.root);

        // 2) inject the original svg again
        elContainer.innerHTML = self.vars.template;

        // 3) initiate the object again
        self.init();
    },

    drawgraph: function (objData) {
        var self = this;

        var objPoint = {},
            objCoords = {};
        
        // debugger;

        // Sort the array of points on the utc date stamp
        objData.points.sort(function (a, b) {
            return a.utcend - b.utcend;
        })

        // Store the data object for later reference
        self.vars.data = objData;

        // Correct the properties of the graph if the y-axis labels are "inset"
        if (self.props.axis.ylabelinset) {
            // self.props.padding.left=0;
            // self.props.axis.xpaddingleft=45;
        }

        // Set the position of the graph title
        var elTitle = document.getElementById('graph_title');
        elTitle.setAttributeNS(null, 'x', (self.props.padding.left + ((self.props.axis.ylabelinset) ? 0 : 2)));
        elTitle.textContent = self.props.title.text;

        // 0) update the graph properties by setting the y-axis max and min value dynamically
        if (self.vars.data.ymax == null || self.vars.data.ymin == null) {
            // console.log('a');

            // Attempt to autodetect the upper and bottom boundaries
            var intMaxValue = -1000000000000,
                intMinValue = 1000000000000;
            for (var i = 0; i < self.vars.data.points.length; i++) {
                if (self.vars.data.points[i].value > intMaxValue) intMaxValue = self.vars.data.points[i].value;
                if (self.vars.data.points[i].value < intMinValue) intMinValue = self.vars.data.points[i].value;
            }

            // console.log(intMaxValue+' '+intMinValue);

            self.props.axis.ymin = intMinValue - 1;
            self.props.axis.ymax = intMaxValue + 1;
        } else {
            self.props.axis.ymin = self.vars.data.ymin;
            self.props.axis.ymax = self.vars.data.ymax;
        }


        // 1) set the width and height of the <svg /> node using the viewport
        self.el.root.setAttributeNS(null, 'viewBox', '0 0 ' + self.props.width + ' ' + self.props.height);

        // elSvgRoot.setAttributeNS(null,'width',(self.props.width+''));
        // elSvgRoot.setAttributeNS(null,'height',(self.props.height+''));

        // 2) set the length of the x- and y-axis lines
        self.setsvglinecoordinates(document.getElementById('x_axisline'), {
            x1: self.props.padding.left,
            y1: (self.props.height - self.props.padding.bottom),
            x2: (self.props.width - self.props.padding.right),
            y2: (self.props.height - self.props.padding.bottom)
        });
        self.setsvglinecoordinates(document.getElementById('y_axisline'), {
            x1: self.props.padding.left,
            y1: self.props.padding.top,
            x2: self.props.padding.left,
            y2: (self.props.height - self.props.padding.bottom)
        });

        // 3) create the data points
        var elWrapperDataPoints = document.getElementById('data_point_wrapper');
        for (var i = 0; i < self.vars.data.points.length; i++) {
            objPoint = self.vars.data.points[i];
            objCoords = self.getsvgcoordinatesforpointflex(objPoint.value, objPoint.utcend);
            var strId = '';
            if (i === (self.vars.data.points.length - 1)) {
                strId = self.props.line.lastpoint.id;
            }

            // console.log(objCoords);
            self.createcoordinatepoint(elWrapperDataPoints, objCoords, objPoint, strId);

            // On the last data point - position the trend popup
            if (i === self.vars.data.points.length - 1) {
                self.positiontrendpopupandsetvalue(objCoords, objPoint.value);
            }
        }

        // 4) create the graph line (use seperate lines to differentiate the last line)
        var elWrapperLine = document.getElementById('line_wrapper');

        // console.log(self.vars.data.points);
        for (var i = 0; i < self.vars.data.points.length; i++) {
            var objCoordsPrev = {};
            if (i > 0) {
                objCoordsPrev.x = objCoords.x;
                objCoordsPrev.y = objCoords.y;
            }


            objPoint = self.vars.data.points[i];
            objCoords = self.getsvgcoordinatesforpointflex(objPoint.value, objPoint.utcend);

            if (i > 0) {
                var elLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                self.setsvglinecoordinates(elLine, {
                    x1: objCoordsPrev.x,
                    y1: objCoordsPrev.y,
                    x2: objCoords.x,
                    y2: objCoords.y
                });
                if (i === (self.vars.data.points.length - 1)) {
                    elLine.setAttributeNS(null, 'class', self.props.line.lastsegment.class);
                    elLine.setAttributeNS(null, 'id', self.props.line.lastsegment.id);
                }
                if (i === (self.vars.data.points.length - 2)) {
                    elLine.setAttributeNS(null, 'class', 'current');
                    if (typeof objData.styles !== 'undefined') elLine.setAttributeNS(null, 'style', objData.styles.stylecurrentline);
                }
                elWrapperLine.appendChild(elLine);
            }

        }


        // 5) create the x axis labels
        var elWrapperLabelsX = document.getElementById('x_axislabel_wrapper');
        for (var i = 0; i < self.vars.data.points.length; i++) {
            
            // Label on x axis
            objPoint = self.vars.data.points[i];
            objCoords = self.getsvgcoordinatesforpointflex(objPoint.value, objPoint.utcend);

            // console.log(objCoords);

            objCoords.y = self.props.height - self.props.labels.x.padding.bottom;
            self.createlabel(elWrapperLabelsX, objCoords, objPoint, 'x');

            // Lines on the x axis
            if (self.props.axis.showxlines) {
                var elline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                self.setsvglinecoordinates(elline, {
                    x1: objCoords.x,
                    y1: (self.props.padding.top + self.props.height - self.props.padding.top - self.props.padding.bottom),
                    x2: objCoords.x,
                    y2: (self.props.padding.top + self.props.height - self.props.padding.top - self.props.padding.bottom - self.props.axis.xlinelength)
                });

                elWrapperLabelsX.appendChild(elline);
            }

        }

        // 6) create the y axis labels and grid lines
        var elWrapperLabelsY = document.getElementById('y_axislabel_wrapper');
        var elWrapperGridLines = document.getElementById('grid_wrapper');
        var yCorrection = 4;
        var bolFractional = (self.props.axis.ystep % 1 === 0) ? false : true;
        var arrPoints = [];

        // This class determines how the labels are popsitioned
        document.getElementById('wrapper').setAttributeNS(null, 'class', ((self.props.axis.ylabelinset) ? 'inset' : 'normal'))

        // console.log(self.props.axis.ymax)
        if (self.props.axis.ygridlines == null) {
            // Calculate the labels and the gid lines based on the "ystep" variable
            for (var i = parseFloat(self.props.axis.ymin); i <= (self.props.axis.ymax);
                (i = i + 0.1)) {
                // Round the number to one decimal to make sure the logic will work
                i = Math.round(i * 10) / 10

                // console.log(i+' '+i%self.props.axis.ystep);
                
                if (i % self.props.axis.ystep === 0) {
                    // console.log('in i='+i)

                    // Fill the array with points
                    arrPoints.push({
                        value: i,
                        label: ((bolFractional && (i % 1 === 0)) ? (i + '.0') : (i + '')),
                        utcend: self.vars.data.points[0].utcend
                    })
                }
            }
        } else {
            // Calculate the grid lines and labels based on the number of grid lines defined


            // Make sure we ramain in the same number formatting by capturing the decimal pages that were received
            var intDecimalPlacesIn = self.decimalplaces(self.props.axis.ymax);
            var intFactor = 1,
                intPercentage = 1,
                intLength = (self.props.axis.ymax + '').length;
            
            // console.log(intLength)
            
            switch (intDecimalPlacesIn) {
                case 1:
                    intFactor = 10;
                    intPercentage = 10;
                    break;
                case 2:
                    intFactor = 100;
                    intPercentage = 15;
                    break;
                case 3:
                    intFactor = 1000;
                    intPercentage = 20;
                    break;
                case 4:
                    intFactor = 10000;
                    intPercentage = 25;
                    break;
            }
            
            // console.log('intDecimalPlacesIn: %s, intFactor: %s, intPercentage: %s, intLength: %s', intDecimalPlacesIn, intFactor, intPercentage, intLength);
            // console.log(self.props.axis);

            var intMargin = ((self.props.axis.ymax - self.props.axis.ymin) / 100) * intPercentage;
            
            // Percenrage from top
            var intValueTopLine = Math.round((self.props.axis.ymax - intMargin) * intFactor) / intFactor;
            arrPoints.push({
                value: intValueTopLine,
                label: self.correctlabeldecimals(intValueTopLine + '', (self.props.axis.ymax + ''), true)
            });

            // Percentage from bottom
            var intValueBottomLine = Math.round((self.props.axis.ymin + intMargin) * intFactor) / intFactor;
            arrPoints.push({
                value: intValueBottomLine,
                label: self.correctlabeldecimals(intValueBottomLine + '', (self.props.axis.ymax + ''), true)
            });

            // Devide the rest...
            var intFactorRemainder = (intValueTopLine - intValueBottomLine) / (self.props.axis.ygridlines - 1);

            // Fill the array with points
            for (var i = 2; i < self.props.axis.ygridlines; i++) {
                var intValue = Math.round((intValueBottomLine + (intFactorRemainder * (i - 1))) * intFactor) / intFactor;
                arrPoints.push({
                    value: intValue,
                    label: self.correctlabeldecimals(intValue + '', (self.props.axis.ymax + ''), true),
                    utcend: self.vars.data.points[0].utcend
                });

            }

        }

        // Draw the labels and grid lines
        for (var i = 0; i < arrPoints.length; i++) {

            objPoint = arrPoints[i];
            objCoords = self.getsvgcoordinatesforpointflex(objPoint.value, objPoint.utcend);

            // console.log(objCoords);
            
            objCoords.x = self.props.padding.left + ((self.props.axis.ylabelinset) ? 3 : -5);

            // Correct the y-position so that it aligns better with the little line
            objCoords.y = objCoords.y + yCorrection;

            // Label on y - axis
            self.createlabel(elWrapperLabelsY, objCoords, objPoint, 'y')

            // Lines on y-axis
            objCoords.y = objCoords.y - yCorrection;
            objCoords.x = self.props.padding.left;

            if (!self.props.axis.ylabelinset) {
                var elline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                self.setsvglinecoordinates(elline, {
                    x1: objCoords.x,
                    y1: objCoords.y,
                    x2: (objCoords.x + self.props.axis.ylinelength),
                    y2: objCoords.y
                });
                elWrapperLabelsY.appendChild(elline);
            }

            // Grid lines
            var elGridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            var intLineStart = ((self.props.axis.ylabelinset) ? (self.props.padding.left + self.props.axis.xpaddingleft - 5) : self.props.padding.left);
            if (self.props.axis.ygridlinesfullwidth) {
                intLineStart = self.props.padding.left;
            }
            self.setsvglinecoordinates(elGridLine, {
                x1: intLineStart,
                y1: objCoords.y,
                x2: (self.props.width - self.props.padding.right),
                y2: objCoords.y
            });
            elWrapperGridLines.appendChild(elGridLine);
        }


        // Store commonly used elements in global variables for efficient use later
        self.el.lastsegment = document.getElementById(self.props.line.lastsegment.id);
        self.el.lastpoint = document.getElementById(self.props.line.lastpoint.id);

        if (typeof objRegionInfo !== "undefined") window.objRegionInfo.showhistory();

    },
    getbbox: function () {
        var self = this;

        // getBoundingClientRect() gets the width & height in "scale" size, getBBox() gets the original size....
        // In some browsers you need to unhide the SVG element before you can use getBBox()
        try {
            if (self.vars.popuptrendwidth === 0) {
                self.el.toppanel.className = 'show';
                self.vars.popuptrendwidth = self.el.popuptrend.getBBox().width;
            }
            if (self.vars.popuptrendheight === 0) self.vars.popuptrendheight = self.el.popuptrend.getBBox().height;
            if (self.vars.popupvaluewidth === 0) self.vars.popupvaluewidth = self.el.popupvalue.getBBox().width;
            if (self.vars.popupvalueheight === 0) self.vars.popupvalueheight = self.el.popupvalue.getBBox().height;
            if (self.vars.popuptrendtextwrapperheight === 0) self.vars.popuptrendtextwrapperheight = self.el.popuptrendtextwrapper.getBBox().height;
            if (self.vars.popuptrendwidth === 0) self.el.toppanel.className = 'hide';
        } catch (e) {
            console.log(e);
            console.trace();
        }
    },
    init: function () {
        var self = this;
        self.el.root = document.getElementById('graph');
        self.el.popuptrend = document.getElementById('popup_trend');
        self.el.popuptrendnumber = document.getElementById('popup_trend_number');
        self.el.popupvalue = document.getElementById('popup_value');
        self.el.popuptrendbase = document.getElementById('popup_trend_base');
        self.el.popupvaluenumber = document.getElementById('popup_value_number');
        self.el.popuptrendtextwrapper = document.getElementById('popup_trend_text_wrapper');
        self.el.toppanel = window.getEl('top_panel');

        // getBoundingClientRect() gets the width & height in "scale" size, getBBox() gets the original size.... 
        if (!window.isPublicSite()) {
            self.getbbox();
        }

        var objSerializer = new XMLSerializer();
        self.vars.template = objSerializer.serializeToString(self.el.root);

        // Reset the state
        self.state.trendpopupflipped = false;
    }
}