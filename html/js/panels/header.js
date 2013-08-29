var objHeader = {
	el: {
		backbutton: null,
		togglefavouritebutton: null,
		regionname: null,
		breadcrumb: null,
		breadcrumbmarquee: null,
		regionnamemarquee: null
	},
	state: {
		showbackbutton: false,
		togglefavouritevisible: false
	},
	/*
	 * Helpers
	 */
	hidebackbutton: function(){
		var self = this;
		TweenLite.to(self.el.backbutton, 0.3, {
			display : 'none',
			onComplete: function(){

			}
		});				
	},
	showbackbutton: function(){
		var self = this;
		if(self.state.showbackbutton){
			TweenLite.to(self.el.backbutton, 0.3, {
				display : 'block',
				onComplete: function(){

				}
			});									
		}
	},
	hidefavouritebutton: function(){
		var self = this;
		TweenLite.to(self.el.togglefavouritebutton, 0.3, {
			display : 'none',
			onComplete: function(){

			}
		});						
	},
	showfavouritebutton: function(){
		var self = this;
		TweenLite.to(self.el.togglefavouritebutton, 0.3, {
			display : 'block',
			onComplete: function(){
				if(objBookmarks.isfavourite()){
					self.el.togglefavouritebutton.className=self.el.togglefavouritebutton.className +' selected';		
				}else{
					self.el.togglefavouritebutton.className=self.el.togglefavouritebutton.className.replace(' selected','');
				}
			}
		});					
	},
	/*
	 * Button clicks
	 */
	togglefavourite: function(el){
		var self = this;
		//alert('adding item to favourites');
		var key = 'fav_' +objOruFilter.state.selectedoru+'_'+objMruFilter.state.selectedmru+'_'+objMap.state.selectedregion;
		
		if(objBookmarks.isfavourite()){
			objStore.removelocalstorageitem(key);
			el.className=el.className.replace(' selected','');

		}else{
			var obj = {
				oru: objOruFilter.state.selectedoru,
				mru: objMruFilter.state.selectedmru,
				region_id: objMap.state.selectedregion,
				region_name: objOruFilter.getregionnamebyid(objMap.state.selectedregion),
				breadcrumb: objMruFilter.getmrufilterbreadcrumb()
			}
			objStore.setlocalstorageitem(key, JSON.stringify(obj));	
			el.className=el.className +' selected';		
		}

		//alert('added item to favourites');
		objBookmarks.renderfavouritepanel();
		
	},
	btnbackclick: function(){
		var self = this;
		self.hidebackbutton();
		self.hidefavouritebutton();
		objHeader.setregionname(objMap.state.mapname);
		objMap.el.elsvgholder.style.opacity = 1;
		objMap.el.elsvgholder.style.display = 'block';
		objRegionInfo.hide();
		objSliders.hide();
	},
	/*
	 * Change field values
	 */
	setregionname: function(name){
		var self = this;
		TweenLite.to(self.el.regionname, 0.3, {
			opacity : 0,
			onComplete: function(){
				
				if(self.el.regionnamemarquee){
					self.el.regionnamemarquee.el.innerHTML = '';
					self.el.breadcrumb.scrollWidth = 0;
				}
				self.el.regionname = getEl('region_name');
				self.el.regionname.innerHTML = name;
				//debugger;
				if(self.el.regionname.scrollWidth > self.el.regionname.clientWidth){
					self.el.regionnamemarquee = new Marquee({el:self.el.regionname, mouseStops: false}).init();
				}else{
					if(self.el.regionnamemarquee){
						self.el.regionnamemarquee.stop();
					}
				}				
				TweenLite.to(self.el.regionname, 0.3, {
					opacity : 1
				});	
			}
		});			
	},
	setbreadcrumb: function(value){
		var self = this;
		TweenLite.to(self.el.breadcrumb, 0.3, {
			opacity : 0,
			onComplete: function(){
				if(self.el.breadcrumbmarquee){
					//debugger;
					self.el.breadcrumbmarquee.el.innerHTML = '';
					self.el.breadcrumb.scrollWidth = 0;
				}
				self.el.breadcrumb = getEl('filter_breadcrumb');
				self.el.breadcrumb.innerHTML = value;
				//debugger;
				if(self.el.breadcrumb.scrollWidth > self.el.breadcrumb.clientWidth){
					self.el.breadcrumbmarquee = new Marquee({el:self.el.breadcrumb, mouseStops: false}).init();
				}else{
					if(self.el.breadcrumbmarquee){
						self.el.breadcrumbmarquee.stop();
					}
					//debugger;
				}
				TweenLite.to(self.el.breadcrumb, 0.3, {
					opacity : 1
				});	
			}
		});		
	},
	init: function(){
		var self = this;
		self.el.backbutton = getEl('btn_back');
		self.el.togglefavouritebutton = getEl('toggle_favourite');
		self.el.regionname = getEl('region_name');
		self.el.breadcrumb = getEl('filter_breadcrumb');
		
		self.state.showbackbutton = (app.state.width < 700);
	}
}