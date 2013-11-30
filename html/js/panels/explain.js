var objExplain = {
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
		objOverlay.show();
		self.state.tweening = true;
		self.el.wrapper.style.display = 'block';
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

				if(!self.state.contentloaded){
					serverSideRequest({
						url: (objConfig.urls.base+'/data/faq.html'), 
						method: 'get', 
						debug: false,
						callback: function(err, strFaqContent){
							//alert(strFaqContent);
							//insert the SVG data into the holder div
							self.el.content.innerHTML=strFaqContent;

							self.state.contentloaded=true;
						}
					});
				}
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
	showfaqcontent: function(el, id){
		var self = this;
		//close open faq
		var arrAllLi = Sizzle('#explain_content div.selected');// self.el.content.getElementsByTagName('div');
		//console.log(arrAllLi.length);
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
		
		self.el.wrapper = getEl('explain_panel');
		self.el.content=getEl('explain_content');
	}
}