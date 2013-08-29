var objFilter = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null,
		filtercontent: null
	},
	show: function(){
		var self = this;
		objOverlay.show();
		self.state.tweening = true;
		self.el.wrapper.style.display = 'block';
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;
			}
		});		
	},
	hide: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 0,
			onComplete: function(){
				objOverlay.hide();
				self.el.wrapper.style.display = 'none';
				self.state.tweening = false;
				self.state.visible = false;
			}
		});	
		objHeader.btnbackclick();
	},
	blink: function(){
		var self = this;
		TweenLite.to(self.el.filtercontent, 0.4, {
			opacity : 0.5,
			onComplete: function(){
				TweenLite.to(self.el.filtercontent, 0.2, {
					opacity : 1
				});	
			}
		});				
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('filter_panel');
		self.el.filtercontent = Sizzle('#filter_panel div.modal_content')[0];
	}
}