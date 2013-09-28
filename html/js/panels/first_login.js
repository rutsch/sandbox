var objFirstLogin = {
	state: {
		visible: null,
		tweening: null,
		contentloaded: false
	},
	el: {
		wrapper: null,
		content: null
	},
	show: function(){
		var self = this;
		objStore.setlocalstorageitem('usedAppBefore', 'true');			
		objOverlay.show();
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
	},
	showcontent: function(el, id){
		var self = this;
		//close open faq
		var arrAllLi = Sizzle('#first_login div.selected');// self.el.content.getElementsByTagName('div');
		console.log(arrAllLi.length);
		for ( var a = 0; a < arrAllLi.length; a++) {
			arrAllLi[a].className = arrAllLi[a].className.replace(' selected', '');
		}		
		//show new faq
		el.className += ' selected';
		getEl(id).className += ' selected';
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('first_login_panel');
		self.el.content=getEl('first_login_content');
	}
}