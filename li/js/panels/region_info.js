var objRegionInfo = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null,
		nrlivesimproved: null,
		percentagelivesimproved: null,
		population: null, 
		gdp: null
	},
	/*
	 * UI functions
	 */
	hide: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			top : '-40%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;
			}
		});
	},
	show: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			top : '0%',
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;
			}
		});		
	},	
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('region_info');
		self.el.nrlivesimproved = getEl('nr_lives_improved');
		self.el.percentagelivesimproved = getEl('lives_improved_percentage');
		self.el.population = getEl('nr_population');
		self.el.gdp = getEl('nr_gdp');
		
		objArcProps.targetnode=getEl('arc_path');
		objArcProps.targetleftwrapper=getEl('arc_path_left_wrapper');
		objArcProps.targetleftnode=getEl('arc_path_left');	
		renderInfographic({angle: 0});
	}
}