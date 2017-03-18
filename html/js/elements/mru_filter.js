var objMruFilter = {
    state: {
        selectedmru: null, // The id of the product devision
        selectedsector: null, // The id of the main sector
        tweening: null
    },
    el: {
        mrufilter: null,
        tempmru: null
    },

    // Fired when the filter panel is opened - sets the state of the filter to match the filter state of the application
    setmrufilterstate: function () {
        var self = this;

        self.state.selectedmru = window.objPageState.state.filter.mru;
        self.state.selectedsector = self.getmrufilteraxisarray(window.objPageState.state.filter.mru)[0].id;

        self.showlevel(self.state.selectedsector, self.state.selectedmru, false);

        //console.log(self.getmrufilteraxisarray(objPageState.state.filter.mru))

    },
    getsectoridfromfilterhtml: function () {
        var self = this;

    },
    getmrufilteraxisarray: function (mru) {
        var self = this;

        var selector = '#filter_container #' + mru;
        var el = window.Sizzle(selector)[0];
        var arrParents = [];

        if (el && el.firstElementChild) {
            arrParents.push({
                id: el.id,
                name: el.firstElementChild.innerHTML
            });

            while (el.parentNode != null && el.parentNode.className !== 'filter_list') {
                el = el.parentNode;
                if (el.localName === 'li') {
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
        } else if (str.indexOf('ifestyle') > -1 || str.indexOf('ersonal') > -1) {
            return 'PD0200';
        } else if (str.indexOf('onnected') > -1) {
            return 'DHS003';
        } else if (str.indexOf('iagnosis') > -1) {
            return 'DHS001';
        } else if (str.indexOf('oyal') > -1) {
            return 'royalphilips';
        } else {
            return 'philips';
        }
    },
    getmrufilterbreadcrumb: function () {
        var self = this;

        var arrAxis = self.getmrufilteraxisarray(window.objPageState.state.filter.mru);
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

        self.el.mrufilter = window.getEl('filter_container');
        self.el.mrufilter.innerHTML = html;

        self.state.selectedsector = window.app.defaultpagestate.filter.sector;
    },
    selectmru: function (e, strSector, strMru) {
        var self = this;
        if (e) e.stopPropagation();

        self.showlevel(strSector, strMru);
    },
    showlevel: function (strSector, strMru) {
        var self = this;
        // debugger;
        self.state.selectedmru = strMru;
        self.state.selectedsector = strSector;

        // console.log('strSector=' + strSector + ' - strMru=' + strMru);

        var elClicked = window.getEl(strMru),
            parentNode = elClicked.parentNode,
            arrSiblingsOrSelf = window.getFirstLevelChildElements(parentNode, 'li');

        // Remove all selected classes
        var arrAllLi = window.getEl('filter_container').getElementsByTagName('li');
        for (var a = 0; a < arrAllLi.length; a++) {
            arrAllLi[a].className = '';
        }

        // Hide child ul for all siblings of clicked element
        for (var i = 0; i < arrSiblingsOrSelf.length; i++) {
            var el = arrSiblingsOrSelf[i];

            // Skip self
            if (el !== elClicked) {
                var arrUl = el.getElementsByTagName('ul');
                for (var ii = 0; ii < arrUl.length; ii++) {
                    if (arguments.length === 2) {
                        window.TweenLite.to(arrUl[ii], 0.2, {
                            height: 0
                        });
                    } else {
                        arrUl[ii].style.height = "0px";
                    }
                }
            }
        }

        // Set selected class on clicked element
        elClicked.className = 'selected';

        // Expand the list to show the child elements
        if (arguments.length === 2) {
            // Only need to show the child elements of the element that was clicked
            var childUl = window.getFirstLevelChildElements(elClicked, 'ul');
            if (childUl.length > 0) {
                window.TweenLite.to(childUl[0], 0.4, {
                    height: 'auto'
                });
            }
        } else {
            // We need to expand the whole tree
            var arrAxis = self.getmrufilteraxisarray(window.objPageState.state.filter.mru);
            for (var a = 0; a < arrAxis.length; a++) {
                var childUl = window.getFirstLevelChildElements(window.getEl(arrAxis[a].id), 'ul');
                if (childUl.length > 0) {
                    childUl[0].style.height = "auto";
                }
            }
        }

        window.objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());
        if (arguments.length === 2) window.objFilter.blink();

        // Apply the filter immediately if we are on the public website
        if (window.isPublicSite()) window.objFilter.applyfilter();

        // objMap.updatemap();		
    },
    init: function (cb) {
        var self = this;
        self.state.tweening = false;
        self.state.selectedmru = window.app.defaultpagestate.filter.mru;
        self.state.selectedsector = 'philips';

        self.el.mrufilter = window.getEl('filter_container');
        self.el.tempmru = window.getEl('producttree_temp');
    }
}