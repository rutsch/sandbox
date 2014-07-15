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
	//fired when the filter panel is opened - sets the state of the filter to match the filter state of the application
	setmrufilterstate: function () {
		var self = this;

		self.state.selectedmru = objPageState.state.filter.mru;
		self.state.selectedsector = self.getmrufilteraxisarray(objPageState.state.filter.mru)[0].id;

		self.showlevel(self.state.selectedsector, self.state.selectedmru, false);

		//console.log(self.getmrufilteraxisarray(objPageState.state.filter.mru))

	},
	getsectoridfromfilterhtml: function () {
		var self = this;

	},
	getmrufilteraxisarray: function (mru) {
		var self = this;

		var selector = '#filter_container #' + mru;
		var el = Sizzle(selector)[0];
		var arrParents = [];

		if (el && el.firstElementChild) {
			arrParents.push({
				id: el.id,
				name: el.firstElementChild.innerHTML
			});

			while (el.parentNode != null && el.parentNode.className !== 'filter_list') {
				el = el.parentNode;
				if (el.localName == 'li') {
					arrParents.push({
						id: el.id,
						name: el.firstElementChild.innerHTML
					});
				}

			}
		} else {
			arrParents.push({
				id: 'philips',
				name: 'Philips Group'
			});
		}

		return (arrParents.reverse());
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

		var arrAxis = self.getmrufilteraxisarray(objPageState.state.filter.mru);
		var arrBreadcrumb = [];
		for (var a = 0; a < arrAxis.length; a++) {
			arrBreadcrumb.push(arrAxis[a].name);
		}

		return arrBreadcrumb.join(' &bull; ');
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
		//console.log('strSector=' + strSector + ' - strMru=' + strMru);

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
					if (arguments.length == 2) {
						TweenLite.to(arrUl[ii], 0.2, {
							height: 0
						});
					} else {
						arrUl[ii].style.height = "0px";
					}
				}
			}
		}

		//set selected class on clicked element
		elClicked.className = 'selected';

		//expand the list to show the child elements
		if (arguments.length == 2) {
			//only need to show the child elements of the element that was clicked
			var childUl = getFirstLevelChildElements(elClicked, 'ul');
			if (childUl.length > 0) {
				TweenLite.to(childUl[0], 0.4, {
					height: 'auto'
				});
			}
		} else {
			//we need to expand the whole tree
			var arrAxis = self.getmrufilteraxisarray(objPageState.state.filter.mru);
			for (var a = 0; a < arrAxis.length; a++) {
				var childUl = getFirstLevelChildElements(getEl(arrAxis[a].id), 'ul');
				if (childUl.length > 0) {
					childUl[0].style.height = "auto";
				}
			}
		}

		objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());
		if (arguments.length == 2) objFilter.blink();
		//objMap.updatemap();		
	},
	init: function (cb) {
		var self = this;
		self.state.tweening = false;
		self.state.selectedmru = app.defaultpagestate.filter.mru;
		self.state.selectedsector = 'philips';

		self.el.mrufilter = getEl('filter_container');
		self.el.tempmru = getEl('producttree_temp');
	}
}