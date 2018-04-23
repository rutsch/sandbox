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
        template: null,
        debug: false || (window.objConfig.sitetype.indexOf('dev') > -1)
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

    decimalplaces: function(num) {
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

    correctlabeldecimals: function(strLabel, strReferenceLabel) {
        var bolRoundPrecisionUp = false;
        var intReferenceLabelDecimals = 0;

        if (arguments.length === 3)
            bolRoundPrecisionUp = arguments[2];

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

    reset: function() {
        var self = this;
        //
        // // 1) throw the original svg node away
        // var elContainer = self.el.root.parentNode;
        // elContainer.removeChild(self.el.root);
        //
        // // 2) inject the original svg again
        // elContainer.innerHTML = self.vars.template;
        //
        // // 3) initiate the object again
        // self.init();
    },
    getMinMax: function() {
        var self = this;
        var minmax = {
          min: 1000000000000000000,
          max: 0
        }
        for (var i = 0; i < self.vars.data.points.length; i++) {
            var val = self.vars.data.points[i].value.replace(',', '') * 1;
            if (val < minmax.min) minmax.min = val;
            if (val > minmax.max) minmax.max = val;

        }
        return minmax;
    },
    createColumn: function (pointdata, minmax, range, height) {
        var self = this;
        var column = document.createElement('div');

        var value = document.createElement('div');
        var valueText = document.createTextNode(pointdata.value);
        value.classList.add('value');
        value.appendChild(valueText);
        column.appendChild(value);

        var point = document.createElement('div');
        point.classList.add('point');
        point = self.drawPoint(point, pointdata, minmax, range, height);
        column.appendChild(point);

        var period = document.createElement('div');
        var periodText = document.createTextNode(pointdata.label);
        period.classList.add('period');
        period.appendChild(periodText);
        column.appendChild(period);

        return column;
    },
    drawPoint: function (el, point, minmax, range, height) {
        var self = this;
        var pointY = height * (point.value.replace(',', '') * 1 - minmax.min) / range;

        // debugger;

        var pointDiv = document.createElement('div');
        pointDiv.classList.add('y');
        pointDiv.setAttribute('style', 'bottom: ' + (pointY + 15) + 'px');

        el.appendChild(pointDiv);

        return el;
    },
    createLine: function (x1, y1, x2, y2, el) {
        var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        var angle  = Math.atan2(y2 - y1, x2 - x1) * -180 / Math.PI;
        var transform = 'rotate('+angle+'deg)';

        var lineDiv = document.createElement('div');
        lineDiv.classList.add('line');
        var style = 'bottom: ' + y1 + 'px; transform: ' + transform + '; width: ' + length + 'px;';

        lineDiv.setAttribute('style', style);
        el.appendChild(lineDiv);
    },
    drawgraph: function(objData) {

        var self = this;
        if (objData === undefined) objData = self.vars.data;

        self.el.root.innerHTML = '';

        var objPoint = {},
            objCoords = {};

        // Sort the array of points on the utc date stamp
        objData.points.sort(function(a, b) {
            return a.utcend - b.utcend;
        })

        // Store the data object for later reference
        self.vars.data = objData;

        // Get min and max values
        var minmax = self.getMinMax();

        // debugger;
        // console.log(self.el.root.getBoundingClientRect());
        var height = self.el.root.getBoundingClientRect().height - 120;
        if (height < 0) height = 125;
        var range = minmax.max - minmax.min;

        // Create the columns
        for (var i = 0; i < self.vars.data.points.length; i++) {
            // Append div to wrapper
            var column = self.createColumn(self.vars.data.points[i], minmax, range, height);

            self.el.root.appendChild(column);
        }

        // Create the lines
        var linePoints = document.querySelectorAll('.y');
        for (var i = 0; i < linePoints.length - 1; i++) {
            var co = linePoints[i].getBoundingClientRect();
            var conext = linePoints[i + 1].getBoundingClientRect();
            // debugger;


            // self.createLine(co.left + 5, (linePoints[i].style.bottom.replace('px', '') * 1) + 5, conext.left + 5, (linePoints[i + 1].style.bottom.replace('px', '') * 1) + 5, linePoints[i].parentNode);
        }

    },
    redrawgraph: function() {
        var self = this;
        // Remove the Lines
        var lines = document.querySelectorAll('.line');
        for (var a = 0; a < lines.length; a++) {
            lines[a].parentNode.removeChild(lines[a]);
        }
        // Create the lines
        var linePoints = document.querySelectorAll('.y');
        for (var i = 0; i < linePoints.length - 1; i++) {
            var co = linePoints[i].getBoundingClientRect();
            var conext = linePoints[i + 1].getBoundingClientRect();


            self.createLine(co.x + 5, (linePoints[i].style.bottom.replace('px', '') * 1) + 5, conext.x + 5, (linePoints[i + 1].style.bottom.replace('px', '') * 1) + 5, linePoints[i].parentNode);
        }
    },

    init: function() {
        var self = this;

        self.el.root = document.getElementById('graph');
    }
}
