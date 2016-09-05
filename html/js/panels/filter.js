var objFilter = {
	state: {
		visible: null,
		tweening: null,
		currentfilterhtml: ''
	},
	el: {
		wrapper: null,
		filtercontent: null
	},
	show: function () {
		var self = this;
		self.state.currentfilterhtml = self.el.filtercontent.innerHTML;
		objOverlay.show();
		self.state.tweening = true;
		self.el.wrapper.style.display = 'block';
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity: 1,
			onComplete: function () {
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;
			}
		});

		//set the mru and oru filter objects to the current state
		objMruFilter.setmrufilterstate();
		objOruFilter.setorufilterstate();

		var seenPanelBefore = objStore.getlocalstorageitem('seenFilterIntro');
		if (seenPanelBefore) {

		} else {
			objPanelInfo.show('filter');
			objStore.setlocalstorageitem('seenFilterIntro', 'true');
		}
	},
	hide: function () {
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity: 0,
			onComplete: function () {
				objOverlay.hide();
				self.el.filtercontent.innerHTML = self.state.currentfilterhtml;
				self.el.wrapper.style.display = 'none';
				self.state.tweening = false;
				self.state.visible = false;
				self.el.btnapply.style.display = 'none';
			}
		});
	},
	blink: function () {
		var self = this;

		TweenLite.to(self.el.filtercontent, 0.2, {
			opacity: 0.5,
			onComplete: function () {
				//debugger;
				self.el.loader.style.display = 'block';
				TweenLite.to(self.el.filtercontent, 0.4, {
					opacity: 1,
					onComplete: function () {
						//debugger;
						self.el.loader.style.display = 'none';
						//if(self.el.btnapply.style.display == 'none'){
						self.el.btnapply.style.display = 'block';
						//}
					}
				});
			}
		});
	},
	applyfilter: function () {
		var self = this;
		console.log('objFilter.applyfilter()');
		//update the objPageState properties with the filter selection we have just made

		if (objConfig.sitetype.indexOf('public') == -1) self.hide();

		self.state.currentfilterhtml = self.el.filtercontent.innerHTML;

		self.el.btnapply.style.display = 'none';

		//objMap.updatemap();
		objPageState.updatepagestate({
			view: 'worldmap',
			filter: {
				orulevel: objOruFilter.state.selectedoru, //for worldmap data 1, 2, 3, 4
				oru: 'none', //selected country/region
				sector: objMruFilter.state.selectedsector, //main sector
				mru: objMruFilter.state.selectedmru //product group
			}
		});


		//hide the details panel
		objRegionInfo.hide();
	},
	init: function () {
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;

		self.el.wrapper = getEl('filter_panel');
		self.el.loader = getEl('filter_loader');
		self.el.filtercontent = Sizzle('#filter_panel div.modal_content')[0];
		self.el.btnapply = getEl('btn_apply_filter');
		self.el.btnapply.style.display = 'none';

		self.state.currentfilterhtml = self.el.filtercontent.innerHTML;
	}
}