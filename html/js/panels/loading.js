var objLoading ={
	state: {
		visible: null,
		tweening: null
	},
	vars: {
		animate: false	
	},
	el: {
		wrapper: null
	},
	show: function(cb){
		var self = this;
		self.state.tweening = true;
		if(self.el.wrapper){
			self.el.wrapper.style.display = "block";
			//debugger;
			if((objOverlay.state.visible || (objOverlay.state.visible == false && objOverlay.state.tweening == true)) && objFilter.state.visible == false){
				objLoading.el.wrapper.style.background= 'url("./img/ajax-loader.gif") no-repeat';
			}else{
				objLoading.el.wrapper.style.background= 'url("./img/ajax-loader_white.gif") no-repeat';
			}
			
			//disable tweening (iOS 8 bug)
			if(app.state.ios){
				self.el.wrapper.style.opacity = 0.7;
				self.state.visible = true;
				self.state.tweening = false;
				if(cb)cb();
			}else{
				TweenLite.to(self.el.wrapper, 0.3, {
					opacity : 0.7,
					delay : 0,
					onComplete : function() {
						self.state.visible = true;
						self.state.tweening = false;
						if(cb)cb();
					}
				});	
			}
		}

	},
	hide: function(cb){
		var self = this;
		self.state.tweening = true;
		
		if(self.el.wrapper){
			//disable tweening (iOS 8 bug)
			if(app.state.ios){
				self.el.wrapper.style.display = "none";
				self.state.visible = false;
				self.state.tweening = false;
				if(cb)cb();				
			}else{
				TweenLite.to(self.el.wrapper, 0.3, {
					opacity : 0,
					delay : 0,
					onComplete : function() {
						self.el.wrapper.style.display = "none";
						self.state.visible = false;
						self.state.tweening = false;
						if(cb)cb();
					}
				});	
			}
		}

	},
	init: function(){
		var self = this;
		self.state.tweening = false;
		self.state.visible = false;
		
		self.el.wrapper = getEl('loading');
	}
}