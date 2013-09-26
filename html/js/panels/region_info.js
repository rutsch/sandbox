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
	show: function(){
		var self = this;
		self.state.tweening = true;
		// slide down top_panel
		
		// slide up bottom_panel
		
		TweenLite.to(self.el.toppanel, 0.3, {
			top : '0%',
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});		
		TweenLite.to(self.el.btnshowsimulation, 0, {
			opacity: 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});	
		TweenLite.to(self.el.btnshowcurrent, 0, {
			opacity: 0,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});			
		TweenLite.to(self.el.bottompanel, 0.3, {
			bottom : '-35%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;				
			}
		});	

	},	
	hide: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.toppanel, 0.3, {
			top : '-86%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;					
			}
		});
		TweenLite.to(self.el.bottompanel, 0.3, {
			bottom : '-50%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;
				TweenLite.to(objMap.el.elsvgholder, 0.3, {
					opacity : 1,
					onComplete: function(){		
						objMap.el.elsvgholder.style.display = 'block';
						
					}
				});				
			}
		});			
		TweenLite.to(self.el.btnshowsimulation, 0.3, {
			opacity: 0,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});	
		TweenLite.to(self.el.btnshowcurrent, 0, {
			opacity: 0,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});			
	},	
	showsimulation: function(self){
		var self = this;
		TweenLite.to(self.el.btnshowsimulation, 0.3, {
			opacity: 0,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});		
		TweenLite.to(self.el.btnshowcurrent, 0.3, {
			opacity: 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});			
		TweenLite.to(self.el.toppanel, 0.3, {
			top : '-35%',
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});		
		TweenLite.to(self.el.bottompanel, 0.3, {
			bottom : '0%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;				
			}
		});	
	},
	showcurrent: function(self){
		var self = this;
		TweenLite.to(self.el.btnshowcurrent, 0.3, {
			opacity: 0,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});			
		TweenLite.to(self.el.bottompanel, 0.3, {
			bottom : '-35%',
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;				
			}
		});	
		TweenLite.to(self.el.btnshowsimulation, 0.3, {
			opacity: 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

			}
		});				

		TweenLite.to(self.el.toppanel, 0.3, {
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
		
		self.el.wrapper = getEl('region_info_wrapper');
		self.el.toppanel = getEl('top_panel');
		self.el.bottompanel = getEl('bottom_panel');
				

		self.el.nrlivesimproved = getEl('nr_lives_improved');
		self.el.labellivesimproved=getEl('nr_lives_improved_label');
		self.el.percentagelivesimproved = getEl('lives_improved_percentage');
		self.el.population = getEl('nr_population');
		self.el.gdp = getEl('nr_gdp');
		self.el.btnshowcurrent = getEl('show_current');
		self.el.btnshowsimulation = getEl('show_simulation');
		
		objArcProps.targetnode=getEl('arc_path');
		objArcProps.targetleftwrapper=getEl('arc_path_left_wrapper');
		objArcProps.targetleftnode=getEl('arc_path_left');	
		renderInfographic({angle: 0});
		
		Hammer(self.el.wrapper).on('swipeleft', function(){
			//self.showhistory(self);
		});
		Hammer(self.el.wrapper).on('swiperight', function(){
			//self.showdetails(self);
		});
	}
}