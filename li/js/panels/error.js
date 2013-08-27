var objError = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null,
		text: null
	},
	hide: function(){
		var self = this;
		self.el.text = '';
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			height : 0,
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;
			}
		});
	},
	show: function(msg, autohide){
		var self = this;
		self.el.text = msg;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			height : 0,
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = true;
				if(autohide){
					var hide = setTimeout(function(){
						self.hide();
					}, 2000);
				}
			}
		});		
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('error');
		self.el.text = self.el.wrapper.innerHTML;
	}
}