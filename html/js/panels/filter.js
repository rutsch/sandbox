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
        // For the public websites we do not show the overlay in combination with the filter
        if (!window.isPublicSite()) window.objOverlay.show();

        // Animate the panel in view
        if (!self.state.tweening) {
            self.state.tweening = true;
            self.el.wrapper.style.display = 'block';
            window.TweenLite.to(self.el.wrapper, 0.3, {
                opacity: 1,
                onComplete: self.showcomplete
            });
        }

        // Set the mru and oru filter objects to the current state
        window.objMruFilter.setmrufilterstate();
        window.objOruFilter.setorufilterstate();


        // Disabled for now
        // var seenPanelBefore = objStore.getlocalstorageitem('seenFilterIntro');

        var seenPanelBefore = true;
        if (seenPanelBefore || window.isPublicSite()) {

        } else {
            window.objPanelInfo.show('filter');
            window.objStore.setlocalstorageitem('seenFilterIntro', 'true');
        }
    },
    showcomplete: function () {
        objFilter.state.tweening = false;
        objFilter.state.visible = true;
    },
    hide: function () {
        var self = this;
        if (!self.state.tweening) {
            self.state.tweening = true;
            window.TweenLite.to(self.el.wrapper, 0.3, {
                opacity: 0,
                onComplete: function () {
                    // For the public websites we do not show the overlay in combination with the filter
                    if (!window.isPublicSite()) window.objOverlay.hide();
                    self.el.filtercontent.innerHTML = self.state.currentfilterhtml;
                    self.el.wrapper.style.display = 'none';
                    self.state.tweening = false;
                    self.state.visible = false;
                    self.el.btnapply.style.display = 'none';
                }
            });
        }
    },
    blink: function () {
        var self = this;

        if (window.isPublicSite()) {
            // Do not blink the filter panel on the publick website when a user clicks on it
            self.blinkcomplete();
        } else {
            window.TweenLite.to(self.el.filtercontent, 0.2, {
                opacity: 0.5,
                onComplete: function () {
                    self.el.loader.style.display = 'block';
                    window.TweenLite.to(self.el.filtercontent, 0.4, {
                        opacity: 1,
                        onComplete: self.blinkcomplete
                    });
                }
            });
        }

    },
    blinkcomplete: function () {
        //debugger;
        objFilter.el.loader.style.display = 'none';
        objFilter.el.btnapply.style.display = 'block';
    },
    applyfilter: function (resetSelectedOru) {
        var self = this;
        
        // debugger;
        // console.log('objFilter.applyfilter()');
        // Update the objPageState properties with the filter selection we have just made

        if (!window.isPublicSite() && self.state.visible && !self.state.tweening) self.hide();

        self.state.currentfilterhtml = self.el.filtercontent.innerHTML;

        self.el.btnapply.style.display = 'none';

        // Calculate the new view to pass in the new page state        
        var selectedOru = window.objOruFilter.state.selectedoruguid;
        if (typeof resetSelectedOru === 'boolean') {
            if (resetSelectedOru) selectedOru = 'none';
        }

        // Canculate the view to use
        var newView = 'worldmap';
        if (selectedOru !== 'none') newView = 'detail';

        // console.log(objPageState.vars.processed);

        // Because we auto-apply the filter for the public site, we need to handle it in a different way.
        if (window.isPublicSite()) {
            //   objPageState.updatepagestate(objPageState.state);
            window.objPageState.updatepagestate({
                view: newView,
                filter: {
                    datasource: window.objDataFilter.state.filter.datasource,
                    subtype: window.objDataFilter.state.filter.subtype,
                    orulevel: window.objOruFilter.retrieveselectedorulevel(), // For worldmap data 1, 2, 3, 4
                    oru: selectedOru, // Selected country/region
                    sector: window.objMruFilter.state.selectedsector, // Main sector
                    mru: window.objMruFilter.state.selectedmru // Product group
                }
            });
        } else {
            window.objPageState.updatepagestate({
                view: 'worldmap',
                filter: {
                    datasource: window.objDataFilter.state.filter.datasource,
                    subtype: window.objDataFilter.state.filter.subtype,
                    orulevel: window.objOruFilter.retrieveselectedorulevel(), // For worldmap data 1, 2, 3, 4
                    oru: 'none', // Selected country/region
                    sector: window.objMruFilter.state.selectedsector, // Main sector
                    mru: window.objMruFilter.state.selectedmru // Product group
                }
            });
        }



        // Hide the details panel
        if (!window.isPublicSite()) {
            if (window.objRegionInfo.state.visible && !window.objRegionInfo.state.tweening) window.objRegionInfo.hide();
        }
        
    },
    init: function () {
        var self = this;
        self.state.visible = false;
        self.state.tweening = false;

        self.el.wrapper = window.getEl('filter_panel');
        self.el.loader = window.getEl('filter_loader');
        self.el.filtercontent = window.Sizzle('#filter_panel div.modal_content')[0];
        self.el.btnapply = window.getEl('btn_apply_filter');
        self.el.btnapply.style.display = 'none';

        self.state.currentfilterhtml = self.el.filtercontent.innerHTML;
    }
}