var objMap = {
	state: {
		visible: false,
		selectedcountry: ''
	},
	el: {
		mapwrapper: null
	},
	/*
	 * Data functions
	 */
	getcolorforpercentage: function(pct, low_color, middle_color, high_color) {
		var self = this;
	    pct /= 100;

	    var percentColors = [
	            { pct: 0.01, color: rgbFromHex(low_color) },
	            { pct: 0.5, color: rgbFromHex(middle_color) },
	            { pct: 1.0, color: rgbFromHex(high_color) } 
	        ];

	    for (var i = 0; i < percentColors.length; i++) {
	        if (pct <= percentColors[i].pct) {
	            var lower = percentColors[i - 1] || { pct: 0.1, color: { r: 0x0, g: 0x00, b: 0 } };
	            var upper = percentColors[i];
	            var range = upper.pct - lower.pct;
	            var rangePct = (pct - lower.pct) / range;
	            var pctLower = 1 - rangePct;
	            var pctUpper = rangePct;
	            var color = {
	                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
	                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
	                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
	            };
	            return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
	        }
	    }
	},
	/*
	 * UI functions
	 */
	updatemap: function(){
		
	},
	regionclick: function(){
		
	},
	init: function(){
		
	}
}
