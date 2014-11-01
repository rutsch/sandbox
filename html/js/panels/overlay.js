var objOverlay = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null
	},
	show: function(cb, animate){
		var self = this;
		
		var bolCallback=(typeof cb === 'undefined')?false:((typeof cb === 'boolean')?false:true);
		var bolAnimate=(typeof animate === 'undefined')?false:animate;
		
		self.state.tweening = true;
		self.el.wrapper.style.display = "block";
		
		if(bolAnimate){
			TweenLite.to(self.el.wrapper, 0.3, {
				opacity : 0.7,
				delay : 0,
				onComplete : function() {
					self.state.visible = true;
					self.state.tweening = false;

					if(bolCallback)cb();
				}
			});
		}else{
			self.el.wrapper.style.opacity = 0.7;
			self.state.visible = true;
			self.state.tweening = false;
			if(bolCallback)cb();
		}
	},
	hide: function(cb, animate){
		var self = this;

		var bolCallback=(typeof cb === 'undefined')?false:((typeof cb === 'boolean')?false:true);
		var bolAnimate=(typeof animate === 'undefined')?false:animate;
		
		self.state.tweening = true;
		
		if(bolAnimate){
			TweenLite.to(self.el.wrapper, 0.3, {
				opacity : 0,
				delay : 0,
				onComplete : function() {
					self.el.wrapper.style.display = "none";
					self.state.visible = false;
					self.state.tweening = false;

					if(bolCallback)cb();
				}
			});
		}else{
			self.el.wrapper.style.display = "none";
			self.state.visible = false;
			self.state.tweening = false;
			if(bolCallback)cb();
		}
	},
	init: function(){
		var self = this;
		self.state.tweening = false;
		self.state.visible = false;
		
		self.el.wrapper = getEl('overlay');
	}
}