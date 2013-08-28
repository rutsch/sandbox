var objBookmarks = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null
	},
	isfavourite: function(){
		var key = 'fav_' +objOruFilter.selectedoru+'_'+objMruFilter.selectedmru+'_'+objMruFilter.selectedregion;
		var fav = objStore.getlocalstorageitem(key);
		return fav!=null;
	},
	addbookmark: function(){
		
	},
	removebookmark: function(){
		
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
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('bookmarks_panel');
	}
}