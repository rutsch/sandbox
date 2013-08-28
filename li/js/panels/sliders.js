var objSliders = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null,
		slidersales: null,
		slidergreensales: null
	},
	/*
	 * UI functions
	 */
	hide: function(){
		var self = this;
		if(app.state.width>700){
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				top : '-40%',
				onComplete: function(){
					self.state.tweening = false;
					self.state.visible = false;
				}
			});			
		}else{
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				bottom : '-60%',
				onComplete: function(){
					self.state.tweening = false;
					self.state.visible = false;
				}
			});			
		}

	},
	show: function(){
		var self = this;
		if(app.state.width>700){
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				top : '0%',
				onComplete: function(){
					//debugger;
					self.state.tweening = false;
					self.state.visible = true;
				}
			});					
		}else{
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				bottom : '0%',
				onComplete: function(){
					//debugger;
					self.state.tweening = false;
					self.state.visible = true;
				}
			});					
		}

	},	
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('simulation');
		self.el.slidersales = getEl('slidersales');
		self.el.slidergreensales = getEl('slidergreensales');
	}
}