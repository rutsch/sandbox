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
			snapshotid: objConfig.currentsnapshotid	
		}
		psv('GET', objConfig.urls.dynamicresourceurl, objData, function(err, data) {
			if(err != null) {
				cb(err);
			}else{ 
				cb(null, data);
			}
		});		
	},
	getdefaultmru: function(){
		return objStore.getlocalstorageitem('last_mru') || objConfig.defaultmru;
	},
	getsectorfrombreadcrumb: function(str){
		if(str.indexOf('ealthcare')> -1){
			return 'PD0900';
		}else if(str.indexOf('ighting')> -1){
			return 'PD0100';
		}else if(str.indexOf('ifestyle')> -1){
			return 'PD0200';
		}else{
			return 'philips';
		}	
	},
	getmrufilterbreadcrumb: function(){
		var self = this;
		var mru = self.state.selectedmru;
		var selector = '#filter_container #' + mru;
		var el = Sizzle(selector)[0];
		var name;
		var arrParents = [];
		
		if(el && el.firstElementChild){
			name = el.firstElementChild.innerHTML
			arrParents.push(name);

			while(el.parentNode !=null && el.parentNode.className !== 'filter_list'){
			    el = el.parentNode; 
			    if(el.localName == 'li'){
			        arrParents.push(el.firstElementChild.innerHTML);
			    }
			    
			}
		}else{
			name = 'Philips';
			arrParents.push(name);
		}
		
		//if(arrParents.length > 2){
		//	arrParents = arrParents.reverse();
		//	var el1 = arrParents[0],
		//		el2 = arrParents[arrParents.length -1];
		//	return el1 + ' ... ' + el2;
		//}else{
			return(arrParents.reverse().join(' &bull; '));	
		//}
					
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
		self.el.mrufilter = getEl('filter_container');
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
		//getEl('philips').onclick();
	},
	selectmru: function(e, useless, strMru){
		var self = this;
		if(e)e.stopPropagation();
		
		self.showlevel(strMru);
	},
	showlevel: function(id){
		var self = this;

		self.state.selectedmru = id;
		self.state.selectedsector = self.getsectorfrombreadcrumb(self.getmrufilterbreadcrumb());
		
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
		objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());
		objFilter.blink();
		//objMap.updatemap();		
	},
	init: function(cb){
		var self = this;
		self.state.tweening = false;
		self.state.selectedmru = self.getdefaultmru();
		self.state.selectedsector = 'philips';

		self.el.mrufilter = getEl('filter_container');
		self.el.tempmru = getEl('producttree_temp');

		self.getmruhtml(function(err, data){
			if(err != null){
				cb(err);
			}else{
				self.preparehtml(data.html);
				self.state.selectedsector = self.getsectorfrombreadcrumb(self.getmrufilterbreadcrumb());
				cb();	
			}
		});

	}
}