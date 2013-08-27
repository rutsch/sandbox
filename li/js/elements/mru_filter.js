var objMruFilter = {
	state: {
		selectedmru: null,
		selectedsector: null,
		tweening: null
	},
	el: {
		mrufilter: null,
		tempmru: null
	},
	/*
	 * Data functions
	 */
	getmruhtml: function(cb){
		var objData = {
			fulldomain: location.protocol+"//"+location.hostname,
			method:'getproductdata',
			type:'json',
			token: objLogin.token,
			snapshotid:1	
		}
		psv('GET', objConfig.urls.dynamicresourceurl, objData, function(data) {
			cb(null, data);
		});		
	},
	getdefaultmru: function(){
		return objStore.getlocalstorageitem('last_mru') || objConfig.defaultmru;
	},
	getsectorfrombreadcrumb: function(breadcrumb){
		
	},
	getmmrufilterbreadcrumb: function(){
		
	},
	/*
	 * UI functions
	 */
	preparehtml: function(html){
		var self = this;
		self.el.tempmru.innerHTML = html;
		
		//create ul
		var ul = document.createElement('ul');
		ul.id='filter_list';
		//create Philips li
		var liPhilips = document.createElement('li');
		liPhilips.innerHTML = 'Philips';
		liPhilips.id = 'philips';
		liPhilips.className = 'selected';
		liPhilips.setAttribute('data-id', 'philips');
		liPhilips.setAttribute('onclick', 'objMruFilter.selectmru(event, "mru", "philips")');
		ul.appendChild(liPhilips);
		//get all first children of philips from temp html
		var arrLi = getFirstLevelChildElementsById('philips', 'li');
		for ( var i = 0; i < arrLi.length; i++) {
			arrLi[i].innerHTML+= '<div class="mru_sector_color"></div>';
			ul.appendChild(arrLi[i]);
		}
		self.el.mrufilter.innerHTML = '';
		self.el.mrufilter.appendChild(ul);
		
		//add event to function call for all calls to stop propagation 
		var arrAllLi = getEl('filter_container').getElementsByTagName('li');
		for ( var a = 0; a < arrAllLi.length; a++) {
			if(arrAllLi[a].onclick){
				var strClick = arrAllLi[a].getAttribute('onclick').replace('applyFilter(\'','objMruFilter.selectmru(event, \'');
				arrAllLi[a].setAttribute('onclick', strClick); 
			}
		}			
		getEl('philips').onclick();
	},
	selectmru: function(e, useless, strMru){
		var self = this;
		if(e)e.stopPropagation();
		
		self.state.selectedregion = strMru;
		self.showlevel(strMru);
		objMap.updatemap();
	},
	showlevel: function(id){
		var self = this;

		self.state.selectedmru = id;
		self.state.selectedsector = self.getsectorfrombreadcrumb(self.getmmrufilterbreadcrumb());
		
		var elClicked=getEl(id),
		parentNode = elClicked.parentNode,
		arrSiblingsOrSelf = getFirstLevelChildElements(parentNode, 'li');	
		
		//remove all selected classes
		var arrAllLi = getEl('filter_container').getElementsByTagName('li');
		for ( var a = 0; a < arrAllLi.length; a++) {
			arrAllLi[a].className = '';
		}
		//hide child ul for all siblings of clicked element
		for ( var i = 0; i < arrSiblingsOrSelf.length; i++) {
			var el = arrSiblingsOrSelf[i];
			//skip self
			if(el != elClicked){
				var arrUl = el.getElementsByTagName('ul');
				for ( var ii = 0; ii < arrUl.length; ii++) {
					TweenLite.to(arrUl[ii], 0.2, {
						height: 0
					});
				}
			}
		}
		
		//set selected class on clicked element
		elClicked.className='selected';
		//test if element has children
		var childUl = getFirstLevelChildElements(elClicked, 'ul');
		if(childUl.length > 0){
			//open the child ul
			TweenLite.to(childUl[0], 0.4, {
				height: 'auto'
			});		
		}
		objMap.updatemap();		
	},
	init: function(cb){
		var self = this;
		self.state.tweening = false;
		self.state.selectedmru = self.getdefaultmru();
		
		self.el.mrufilter = getEl('filter_container');
		self.el.tempmru = getEl('producttree_temp');
		
		self.getmruhtml(function(err, data){
			self.preparehtml(data.html);
			cb();
		});

	}
}