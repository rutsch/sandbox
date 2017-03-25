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
    hidebackbutton: function () {
        var self = this;
        window.TweenLite.to(self.el.backbutton, 0.3, {
            display: 'none',
            onComplete: function () {

            }
        });
    },
    showbackbutton: function () {
        var self = this;
        if (self.state.showbackbutton) {
            window.TweenLite.to(self.el.backbutton, 0.3, {
                display: 'block',
                onComplete: function () {

                }
            });
        }
    },
    hidefavouritebutton: function () {
        var self = this;
        window.TweenLite.to(self.el.togglefavouritebutton, 0.3, {
            display: 'none',
            onComplete: function () {

            }
        });
    },
    showfavouritebutton: function () {
        var self = this;
        window.TweenLite.to(self.el.togglefavouritebutton, 0.3, {
            display: 'block',
            onComplete: function () {
                if (window.objBookmarks.isfavourite()) {
                    self.el.togglefavouritebutton.className = self.el.togglefavouritebutton.className + ' selected';
                } else {
                    self.el.togglefavouritebutton.className = self.el.togglefavouritebutton.className.replace(' selected', '');
                }
            }
        });
    },

    /*
     * Button clicks
     */
    togglefavourite: function (el) {
        var self = this;
        //alert('adding item to favourites');
        var key = 'fav_' + window.objPageState.state.filter.orulevel + '_' + window.objPageState.state.filter.mru + '_' + window.objPageState.state.filter.oru;
        var strStatsLabel = '';

        if (window.objBookmarks.isfavourite()) {
            window.objStore.removelocalstorageitem(key);
            el.className = el.className.replace(' selected', '');
            strStatsLabel = 'remove favourite';
        } else {
            var obj = {
                oru: window.objPageState.state.filter.orulevel,
                mru: window.objPageState.state.filter.mru,
                region_id: window.objPageState.state.filter.oru,
                region_name: window.objOruFilter.getregionnamebyid(window.objPageState.state.filter.oru),
                breadcrumb: window.objMruFilter.getmrufilterbreadcrumb()
            }
            window.objStore.setlocalstorageitem(key, JSON.stringify(obj));
            el.className = el.className + ' selected';
            strStatsLabel = 'add favourite';
        }

        // Add an action to the stats object
        window.objAnalytics.data.events.push({
            category: 'button',
            action: 'click',
            label: strStatsLabel
        });

        // alert('added item to favourites');
        window.objBookmarks.renderfavouritepanel();

    },

    btnbackclick: function () {
        var self = this;
        self.hidebackbutton();
        self.hidefavouritebutton();
        window.objHeader.setregionname(window.objMap.state.mapname);

        window.objPageState.updatepagestate({
            view: 'worldmap',
            filter: {
                oru: 'none'
            }
        });

        //objRegionInfo.hide();
        //objSliders.hide();
    },

    /*
     * Change field values
     */
    setregionname: function (name) {
        var self = this;
        if (typeof name !== 'undefined') {
            if (window.isPublicSite()) {
                // Grab the selected region from the header and dump it
                var elements = document.getElementsByClassName('region_info_title');
                for (var i = 0; i < elements.length; i++) {
                    elements[i].innerHTML = name;
                }
                //objRegionInfo.el.regioninfotitle.innerHTML = name;
            } else {
                window.TweenLite.to(self.el.regionname, 0.3, {
                    opacity: 0,
                    onComplete: function () {
                        if (name !== window.objMap.state.mapname) {
                            name = window.objMap.state.mapname + ' &bull; ' + name;
                        }
                        self.el.regionname.innerHTML = name;
                        self.el.regionnamemarquee = new Marquee("region_name", {
                            behavior: 'scroll',
                            direction: 'rtl',
                            interrupt: 'no',
                            step: 0.1
                        });
                        if (self.el.regionname.scrollWidth > self.el.regionname.clientWidth) {

                        } else {
                            if (self.el.regionnamemarquee) {
                                self.el.regionnamemarquee.pause();
                            }
                        }

                        window.TweenLite.to(self.el.regionname, 0.3, {
                            opacity: 1
                        });
                    }
                });
            }



        }

    },
    setbreadcrumb: function (value) {
        var self = this;
        window.TweenLite.to(self.el.breadcrumb, 0.3, {
            opacity: 0,
            onComplete: function () {
                self.el.breadcrumb.innerHTML = value;
                self.el.breadcrumbmarquee = new Marquee("filter_breadcrumb", {
                    behavior: 'scroll',
                    direction: 'rtl',
                    interrupt: 'no',
                    step: 0.1
                });
                if (self.el.breadcrumb.scrollWidth > self.el.breadcrumb.clientWidth) {

                } else {
                    if (self.el.breadcrumbmarquee) {
                        self.el.breadcrumbmarquee.pause();
                    }
                }

                window.TweenLite.to(self.el.breadcrumb, 0.3, {
                    opacity: 1
                });
            }
        });
    },
    init: function () {
        var self = this;
        self.el.backbutton = window.getEl('btn_back');
        self.el.togglefavouritebutton = window.getEl('toggle_favourite');
        self.el.regionname = window.getEl('region_name');
        self.el.breadcrumb = window.getEl('filter_breadcrumb');

        self.state.showbackbutton = (window.app.state.width < 768);
    }
}