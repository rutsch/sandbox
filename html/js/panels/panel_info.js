var objPanelInfo = {
	state: {
		visible: null,
		tweening: null,
		contentloaded: false
	},
	el: {
		wrapper: null,
		content: null
	},
	show: function(panel){
		var self = this;
		
		self.getcontent(panel, function(){
			//objOverlay.show();
			self.state.tweening = true;
			self.el.wrapper.style.display = 'block';
			TweenLite.to(self.el.wrapper, 0.3, {
				opacity : 1,
				onComplete: function(){
					//debugger;
					self.state.tweening = false;
					self.state.visible = true;

					/*if(!self.state.contentloaded){
						serverSideRequest({
							url: 'data/firstlogin.html', 
							method: 'get', 
							debug: false,
							callback: function(err, strContent){
								//insert the SVG data into the holder div
								self.el.content.innerHTML=strContent;

								self.state.contentloaded=true;
							}
						});
					}*/
				}
			});					
		});
		
		
		
				

	},
	hide: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 0,
			onComplete: function(){
				//objOverlay.hide();
				self.el.wrapper.style.display = 'none';
				self.state.tweening = false;
				self.state.visible = false;
			}
		});	
	},
	getcontent: function(panel, cb){
		var self = this;
		var strIntro = panel + '_intro.html';

		serverSideRequest({
			url: objConfig.urls.base+'/data/'+strIntro, 
			method: 'get', 
			debug: false,
			callback: function(err, strContent){
				//insert the SVG data into the holder div
				self.el.contentwrapper.className = panel;
				self.el.content.innerHTML=strContent;
				cb();
			}
		});
		
	
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('panel_info_panel');
		self.el.contentwrapper = getEl('content_wrapper');
		self.el.content=getEl('panel_info_content');
	}
}