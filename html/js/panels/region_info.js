var objRegionInfo = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null,
		nrlivesimproved: null,
		labellivesimproved: null,
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
			top : '-100%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;
				TweenLite.to(objSliders.el.wrapper, 0.3, {
					opacity : 0,
					onComplete: function(){
						//debugger;
						objSliders.state.tweening = false;
						objSliders.state.visible = false;
					}
				});						
			}
		});
		TweenLite.to(self.el.regionhistorywrapper, 0.3, {
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
				TweenLite.to(objSliders.el.wrapper, 0.3, {
					opacity : 1,
					onComplete: function(){
						//debugger;
						objSliders.state.tweening = false;
						objSliders.state.visible = true;
					}
				});		
			}
		});		
		TweenLite.to(self.el.regionhistorywrapper, 0.3, {
			top : '50%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;				
			}
		});	
		
	},	
	showhistory: function(self){
		if(app.state.width<700){
			TweenLite.to(self.el.regioninfowrapper, 0.3, {
				top : '-40%',
				onComplete: function(){
					self.state.tweening = false;
					self.state.visible = false;
				}
			});
			TweenLite.to(self.el.regionhistorywrapper, 0.3, {
				top : '50%',
				onComplete: function(){
					self.state.tweening = false;
					self.state.visible = false;
				}
			});	
		}
	},
	showdetails: function(self){
		if(app.state.width<700){
			TweenLite.to(self.el.regioninfowrapper, 0.3, {
				left : '0%',
				onComplete: function(){
					self.state.tweening = false;
					self.state.visible = false;
				}
			});
			TweenLite.to(self.el.regionhistorywrapper, 0.3, {
				left : '100%',
				onComplete: function(){
					self.state.tweening = false;
					self.state.visible = false;
				}
			});
		}
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('region_info');
		self.el.regioninfowrapper=getEl('region_info_wrapper');
		self.el.regionhistorywrapper = getEl('region_history');
		self.el.nrlivesimproved = getEl('nr_lives_improved');
		self.el.labellivesimproved=getEl('nr_lives_improved_label');
		self.el.percentagelivesimproved = getEl('lives_improved_percentage');
		self.el.population = getEl('nr_population');
		self.el.gdp = getEl('nr_gdp');
		
		objArcProps.targetnode=getEl('arc_path');
		objArcProps.targetleftwrapper=getEl('arc_path_left_wrapper');
		objArcProps.targetleftnode=getEl('arc_path_left');	
		renderInfographic({angle: 0});
		
		Hammer(self.el.wrapper).on('swipeleft', function(){
			self.showhistory(self);
		});
		Hammer(self.el.wrapper).on('swiperight', function(){
			self.showdetails(self);
		});
	}
}