var objMruFilter = {
	state: {
		selectedmru: null, //id of the product devision
		selectedsector: null, //id of the main sector
		tweening: null
	},
	el: {
		mrufilter: null,
		tempmru: null
	},
	getdefaultmru: function () {
		return objStore.getlocalstorageitem('last_mru') || objConfig.defaultmru;
	},
	getsectorfrombreadcrumb: function (str) {
		if (str.indexOf('ealthcare') > -1) {
			return 'PD0900';
		} else if (str.indexOf('ighting') > -1) {
			return 'PD0100';
		} else if (str.indexOf('ifestyle') > -1) {
			return 'PD0200';
		} else {
			return 'philips';
		}
	},
	getmrufilterbreadcrumb: function () {
		var self = this;
		var mru = objPageState.state.filter.mru;
		var selector = '#filter_container #' + mru;
		var el = Sizzle(selector)[0];
		var name;
		var arrParents = [];

		if (el && el.firstElementChild) {
			name = el.firstElementChild.innerHTML
			arrParents.push(name);

			while (el.parentNode != null && el.parentNode.className !== 'filter_list') {
				el = el.parentNode;
				if (el.localName == 'li') {
					arrParents.push(el.firstElementChild.innerHTML);
				}

			}
		} else {
			name = 'Philips Group';
			arrParents.push(name);
		}

		//if(arrParents.length > 2){
		//	arrParents = arrParents.reverse();
		//	var el1 = arrParents[0],
		//		el2 = arrParents[arrParents.length -1];
		//	return el1 + ' ... ' + el2;
		//}else{
		return (arrParents.reverse().join(' &bull; '));
		//}

	},
	/*
	* UI functions
	*/
	preparehtml: function (html) {
		var self = this;
		self.el.tempmru.innerHTML = html;

		self.el.mrufilter = getEl('filter_container');
		self.el.mrufilter.innerHTML = html;

		self.state.selectedsector = app.defaultpagestate.filter.sector;
	},
	selectmru: function (e, strSector, strMru) {
		var self = this;
		if (e) e.stopPropagation();

		self.showlevel(strSector, strMru);
	},
	showlevel: function (strSector, strMru) {
		var self = this;
		//debugger;
		self.state.selectedmru = strMru;
		self.state.selectedsector = strSector;
		console.log('strSector=' + strSector + ' - strMru=' + strMru);

		var elClicked = getEl(strMru),
		parentNode = elClicked.parentNode,
		arrSiblingsOrSelf = getFirstLevelChildElements(parentNode, 'li');

		//remove all selected classes
		var arrAllLi = getEl('filter_container').getElementsByTagName('li');
		for (var a = 0; a < arrAllLi.length; a++) {
			arrAllLi[a].className = '';
		}
		//hide child ul for all siblings of clicked element
		for (var i = 0; i < arrSiblingsOrSelf.length; i++) {
			var el = arrSiblingsOrSelf[i];
			//skip self
			if (el != elClicked) {
				var arrUl = el.getElementsByTagName('ul');
				for (var ii = 0; ii < arrUl.length; ii++) {
					TweenLite.to(arrUl[ii], 0.2, {
						height: 0
					});
				}
			}
		}

		//set selected class on clicked element
		elClicked.className = 'selected';
		//test if element has children
		var childUl = getFirstLevelChildElements(elClicked, 'ul');
		if (childUl.length > 0) {
			//open the child ul
			TweenLite.to(childUl[0], 0.4, {
				height: 'auto'
			});
		}
		objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());
		objFilter.blink();
		//objMap.updatemap();		
	},
	init: function (cb) {
		var self = this;
		self.state.tweening = false;
		self.state.selectedmru = self.getdefaultmru();
		self.state.selectedsector = 'philips';

		self.el.mrufilter = getEl('filter_container');
		self.el.tempmru = getEl('producttree_temp');
	}
}