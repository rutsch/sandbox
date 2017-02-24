var objRegionInfo = {
    state: {
        visible: null,
        tweening: null,
        panel: 'current'
    },
    el: {
        wrapper: null,
        nrlivesimproved: null,
        labellivesimproved: null,
        percentagelivesimproved: null,
        population: null,
        gdp: null
    },
    renderLegend: function () {
        var self = this;

        self.el.legend__title.innerHTML = objDataFilter.state.filter.subtype === 'all' ? objConfig.fragments['lives_improved'] : objConfig.fragments[objMap.mapdatatypekeys(objDataFilter.state.filter.subtype)]
        self.el.legend__subtitle.innerHTML = '';
        // self.el.legend__top_value.innerHTML = objConfig.fragments['high']; //objMap.intLivesImprovedPercentageMax;
        // self.el.legend__low_value.innerHTML = objConfig.fragments['low']; //objMap.intLivesImprovedPercentageMin;
    },
    hideEmptyEl: function () {
        var self = this;
        Sizzle('.nr_label').forEach(function(el) {
            if(el.getElementsByTagName('span')[0].innerText === '' || (objDataFilter.state.filter.subtype && objDataFilter.state.filter.subtype !== 'all' && el.getElementsByTagName('span')[0].className !== objDataFilter.state.filter.subtype.replace('value_', 'nr_'))) {
                el.style.display = 'none';
            } else {
                el.style.display = 'block';
            }
        });
    },
    /*
	* UI functions
	*/
    show: function () {
        var self = this;
        self.state.tweening = true;

        self.hideEmptyEl();

        // In the public version of the tool, we show the data in an overlay and hide the filter panel
        if (isPublicSite()) {
            objFilter.hide();
            objOverlay.show();
        }
        if (objPageState.mobile === true) {
            self.removeMobileRegionInfos();
            // Copy region info html to correct LI
            var el = Sizzle('[data-target='+objPageState.state.filter.oru+']')[0];

            el.className = 'mapselector selected';
            el.innerHTML = el.innerHTML + getEl(objDataFilter.state.filter.datasource).outerHTML;
            el.getElementsByClassName('region_info_wrapper')[0].removeAttribute('style');
        } else {

            // slide down top_panel
            if (app.state.width > 768) {
                TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '0%',
                    opacity: 1,
                    onComplete: self.showcomplete(self.el.regionpanel)
                });
            } else {
                TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '0%',
                    opacity: 1,
                    onComplete: self.showcomplete(self.el.regionpanel)
                });
            }
        }

        //disabled for now
        //var seenPanelBefore = objStore.getlocalstorageitem('seenRegionInfoIntro');
        var seenPanelBefore = true;
        if (seenPanelBefore || isPublicSite()) {} else {
            objPanelInfo.show('region_info');
            objStore.setlocalstorageitem('seenRegionInfoIntro', 'true');
        }
    },
    // Central onComplete handler for show() function
    showcomplete: function(el) {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = true;
        if (el) {
            // el.className = 'visible';
        }
		TweenLite.to(self.el.toolspanel, 0.3, {
			bottom: '0%',
			opacity: 0,
			'z-index': -1
		})
	}
    ,
    hide: function() {
        var self = this;

        if (self.state.visible) {
            // self.el.regionpanel.className = 'hidden animate';

            // Hide the panel
            self.state.tweening = true;

            if (app.state.width > 768) {
                TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '0%',
					opacity: 0,
                    onComplete: self.hidecomplete(self.el.regionpanel)
                });
            } else {
                TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '-86%',
					opacity: 0,
                    onComplete: self.hidecomplete(self.el.regionpanel)
                });
            }
        }

        if (objPageState.mobile) {
            self.removeMobileRegionInfos();
        }

        objHeader.hidefavouritebutton();

    },
    // Central onComplete handler for hide() function
    hidecomplete: function(el) {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = false;

        // In the public version of the tool, we show the data in an overlay
        if (isPublicSite() && objOverlay.state.visible) {
            objOverlay.hide();
            // objFilter.show();
        }

        if (el) {
            // el.className = 'hidden';
        }

		TweenLite.to(self.el.toolspanel, 0.3, {
			bottom: '0%',
			opacity: 1,
			'z-index': 3
		});
	}
    ,
    removeMobileRegionInfos: function () {
        var el = Sizzle('[data-target] > div');
        for(var i = 0; i <  el.length; i++) {
            el[i].parentNode.className = 'mapselector';
            el[i].parentNode.removeChild(el[i]);
        }
    },
    showsimulation: function(self) {
        var self = this;

        self.el.btnshowcurrent.style.display = 'block';

        TweenLite.to(self.el.btnshowsimulation, 0.3, {
            opacity: 0,
            onComplete: function() {
                self.showsimulationcomplete();
                self.state.panel = 'simulation';
                self.el.btnshowsimulation.style.display = 'none';
            }
        });
        TweenLite.to(self.el.btnshowcurrent, 0.3, {
            opacity: 1,
            onComplete: self.showsimulationcomplete
        });
        TweenLite.to(self.el.regionpanel, 0.3, {
            top: '-35%',
            onComplete: self.showsimulationcomplete
        });
        TweenLite.to(self.el.toolspanel, 0.3, {
            bottom: '0%',
            onComplete: self.showsimulationcomplete
        });
    },
    // Central onComplete handler for showsimulation() function
    showsimulationcomplete: function() {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = true;
    },
    showcurrent: function(self) {
        var self = this;

        self.el.btnshowsimulation.style.display = 'block';

        TweenLite.to(self.el.btnshowcurrent, 0.3, {
            opacity: 0,
            onComplete: function() {
                //debugger;
                self.showcurrentcomplete();
                self.state.panel = 'current';
                self.el.btnshowcurrent.style.display = 'none';
            }
        });
        TweenLite.to(self.el.toolspanel, 0.3, {
            bottom: '-35%',
            onComplete: self.showcurrentcomplete
        });
        TweenLite.to(self.el.btnshowsimulation, 0.3, {
            opacity: 1,
            onComplete: self.showcurrentcomplete
        });

        TweenLite.to(self.el.regionpanel, 0.3, {
            top: '0%',
            onComplete: self.showcurrentcomplete
        });

    },
    // Central onComplete handler for showcurrent() function
    showcurrentcomplete: function() {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = true;
    },
    showhistory: function() {
        var self = this;
        TweenLite.to(self.el.history, 0.3, {
            opacity: 1,
            onComplete: function() {
                self.state.tweening = false;
                self.state.visible = true;
            }
        });
    },
    hidehistory: function() {
        var self = this;
        TweenLite.to(self.el.history, 0.3, {
            opacity: 0,
            onComplete: function() {
                self.state.tweening = false;
                self.state.visible = true;
            }
        });
    },
    init: function() {
        var self = this;
        self.state.visible = false;
        self.state.tweening = false;

        self.el.wrapper = getEl('region_info_wrapper');
        self.el.regionpanel = getEl('region_info');
        self.el.toolspanel = getEl('map_tools');
        self.el.legend = getEl('map_tools__legend');
        self.el.legend__title = getEl('map_tools__legend__title');
        self.el.legend__subtitle = getEl('map_tools__legend__subtitle');
        self.el.legend__top_value = getEl('map_tools__legend__top_value');
        self.el.legend__low_value = getEl('map_tools__legend__low_value');

        self.el.data = {};
        // Lives improved
        self.el.data.nrlivesimproved = getEl('nr_lives_improved');
        self.el.data.labellivesimproved = getEl('nr_lives_improved_label');
        self.el.data.percentagelivesimproved = getEl('lives_improved_percentage');
        self.el.data.population = getEl('nr_population');
        self.el.data.gdp = getEl('nr_gdp');

        // Global presence
        self.el.data.assets = getEl('nr_assets');
        self.el.data.employees = getEl('nr_employees');
        self.el.data.female = getEl('nr_female');
        self.el.data.male = getEl('nr_male');
        self.el.data.plants = getEl('nr_plants');
        self.el.data.research = getEl('nr_research');
        self.el.data.sales = getEl('nr_sales');

        // Sustainability
        self.el.data.co2 = getEl('nr_co2');
        self.el.data.emission = getEl('nr_emission');
        self.el.data.emissionhaz = getEl('nr_emissionhaz');
        self.el.data.trc = getEl('nr_trc');
        self.el.data.waste = getEl('nr_waste');
        self.el.data.wasterecycled = getEl('nr_wasterecycled');
        self.el.data.water = getEl('nr_water');



        self.el.btnshowcurrent = getEl('show_current');
        self.el.btnshowsimulation = getEl('show_simulation');
        self.el.history = getEl('graph');

        self.el.regioninfotitle = getEl('region_info_title');

        objArcProps.targetnode = getEl('arc_path');
        objArcProps.targetleftwrapper = getEl('arc_path_left_wrapper');
        objArcProps.targetleftnode = getEl('arc_path_left');
        // renderInfographic({ angle: 0 });

        if (app.state.mobile) {
            if (app.state.ipad) {

                Hammer(self.el.regionpanel).on('drag', function(ev) {
                    if (ev.gesture.direction == 'up' && ev.gesture.distance > 10)
                        self.hide();
                    }
                );

                //setup swipe effect on simulator panel
                Hammer(self.el.toolspanel).on('drag', function(ev) {
                    if (ev.gesture.direction == 'up' && ev.gesture.distance > 10)
                        self.hide();
                    }
                );

            } else {
                //setup swipe effect on the top panel
                Hammer(self.el.regionpanel).on('drag', function(ev) {
                    //console.log('drag top panel');
                    //console.log(ev.gesture.direction +' - ' +ev.gesture.distance)

                    if (ev.gesture.direction == 'up' && ev.gesture.distance > 10)
                        self.showsimulation(self);
                    if (self.state.panel == 'simulation' && ev.gesture.direction == 'down' && ev.gesture.distance > 10)
                        self.showcurrent(self);
                    }
                );

                //setup swipe effect on bottom panel
                Hammer(self.el.toolspanel).on('drag', function(ev) {
                    //console.log('drag bottom panel');
                    //console.log(ev.gesture.direction +' - ' +ev.gesture.distance)

                    if (ev.gesture.direction == 'down' && ev.gesture.distance > 10)
                        self.showcurrent(self);
                    }
                );
            }

        }

    }
}
