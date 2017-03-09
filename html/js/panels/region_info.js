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

        self.el.legend__title.innerHTML = window.objDataFilter.state.filter.subtype === 'all' ? window.objConfig.fragments['lives_improved'] : window.objConfig.fragments[window.objMap.mapdatatypekeys(window.objDataFilter.state.filter.subtype)]
        self.el.legend__subtitle.innerHTML = '';
        
        // self.el.legend__top_value.innerHTML = objConfig.fragments['high']; //objMap.intLivesImprovedPercentageMax;
        // self.el.legend__low_value.innerHTML = objConfig.fragments['low']; //objMap.intLivesImprovedPercentageMin;
    },
    hideEmptyEl: function () {
        var self = this;
        window.Sizzle('.nr_label').forEach(function (el) {
            if (el.getElementsByTagName('span')[0].innerText === '' || (window.objDataFilter.state.filter.subtype && window.objDataFilter.state.filter.subtype !== 'all' && el.getElementsByTagName('span')[0].className !== window.objDataFilter.state.filter.subtype.replace('value_', 'nr_'))) {
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
        if (window.isPublicSite()) {
            window.objFilter.hide();
            window.objOverlay.show();
        }
        if (window.objPageState.mobile === true) {
            self.removeMobileRegionInfos();
           
            // Copy region info html to correct LI
            var el = window.Sizzle('[data-target=' + window.objPageState.state.filter.oru + ']')[0];

            el.className = 'mapselector selected';
            el.innerHTML = el.innerHTML + window.getEl(window.objDataFilter.state.filter.datasource).outerHTML;
            el.getElementsByClassName('region_info_wrapper')[0].removeAttribute('style');
        } else {

            // Slide down top_panel
            if (window.app.state.width > 768) {
                window.TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '0%',
                    opacity: 1,
                    onComplete: self.showcomplete(self.el.regionpanel)
                });
            } else {
                window.TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '0%',
                    opacity: 1,
                    onComplete: self.showcomplete(self.el.regionpanel)
                });
            }
        }

        // Disabled for now
        // var seenPanelBefore = objStore.getlocalstorageitem('seenRegionInfoIntro');
        var seenPanelBefore = true;
        if (seenPanelBefore || window.isPublicSite()) {
            // Nothing to do
        } else {
            window.objPanelInfo.show('region_info');
            window.objStore.setlocalstorageitem('seenRegionInfoIntro', 'true');
        }
    },
    // Central onComplete handler for show() function
    showcomplete: function (el) {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = true;
        if (el) {
            // el.className = 'visible';
        }
        window.TweenLite.to(self.el.toolspanel, 0.3, {
            bottom: '0%',
            opacity: 0,
            'z-index': -1
        })
    },
    hide: function () {
        var self = this;

        if (self.state.visible) {
            // self.el.regionpanel.className = 'hidden animate';

            // Hide the panel
            self.state.tweening = true;

            if (window.app.state.width > 768) {
                window.TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '0%',
                    opacity: 0,
                    onComplete: self.hidecomplete(self.el.regionpanel)
                });
            } else {
                window.TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '-86%',
                    opacity: 0,
                    onComplete: self.hidecomplete(self.el.regionpanel)
                });
            }
        }

        if (window.objPageState.mobile) {
            self.removeMobileRegionInfos();
        }

        window.objHeader.hidefavouritebutton();

    },
    // Central onComplete handler for hide() function
    hidecomplete: function (el) {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = false;

        // In the public version of the tool, we show the data in an overlay
        if (window.isPublicSite() && window.objOverlay.state.visible) {
            window.objOverlay.hide();
            // objFilter.show();
        }

        if (el) {
            // el.className = 'hidden';
        }

        window.TweenLite.to(self.el.toolspanel, 0.3, {
            bottom: '0%',
            opacity: 1,
            'z-index': 3
        });
    },
    removeMobileRegionInfos: function () {
        var el = window.Sizzle('[data-target] > div');
        for (var i = 0; i < el.length; i++) {
            el[i].parentNode.className = 'mapselector';
            el[i].parentNode.removeChild(el[i]);
        }
    },
    showsimulation: function (self) {
        var self = this;

        self.el.btnshowcurrent.style.display = 'block';

        window.TweenLite.to(self.el.btnshowsimulation, 0.3, {
            opacity: 0,
            onComplete: function () {
                self.showsimulationcomplete();
                self.state.panel = 'simulation';
                self.el.btnshowsimulation.style.display = 'none';
            }
        });
        window.TweenLite.to(self.el.btnshowcurrent, 0.3, {
            opacity: 1,
            onComplete: self.showsimulationcomplete
        });
        window.TweenLite.to(self.el.regionpanel, 0.3, {
            top: '-35%',
            onComplete: self.showsimulationcomplete
        });
        window.TweenLite.to(self.el.toolspanel, 0.3, {
            bottom: '0%',
            onComplete: self.showsimulationcomplete
        });
    },
    // Central onComplete handler for showsimulation() function
    showsimulationcomplete: function () {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = true;
    },
    showcurrent: function (self) {
        var self = this;

        self.el.btnshowsimulation.style.display = 'block';

        window.TweenLite.to(self.el.btnshowcurrent, 0.3, {
            opacity: 0,
            onComplete: function () {
                //debugger;
                self.showcurrentcomplete();
                self.state.panel = 'current';
                self.el.btnshowcurrent.style.display = 'none';
            }
        });
        window.TweenLite.to(self.el.toolspanel, 0.3, {
            bottom: '-35%',
            onComplete: self.showcurrentcomplete
        });
        window.TweenLite.to(self.el.btnshowsimulation, 0.3, {
            opacity: 1,
            onComplete: self.showcurrentcomplete
        });

        window.TweenLite.to(self.el.regionpanel, 0.3, {
            top: '0%',
            onComplete: self.showcurrentcomplete
        });

    },
    // Central onComplete handler for showcurrent() function
    showcurrentcomplete: function () {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = true;
    },
    showhistory: function () {
        var self = this;
        window.TweenLite.to(self.el.history, 0.3, {
            opacity: 1,
            onComplete: function () {
                self.state.tweening = false;
                self.state.visible = true;
            }
        });
    },
    hidehistory: function () {
        var self = this;
        window.TweenLite.to(self.el.history, 0.3, {
            opacity: 0,
            onComplete: function () {
                self.state.tweening = false;
                self.state.visible = true;
            }
        });
    },
    init: function () {
        var self = this;
        self.state.visible = false;
        self.state.tweening = false;

        self.el.wrapper = window.getEl('region_info_wrapper');
        self.el.regionpanel = window.getEl('region_info');
        self.el.toolspanel = window.getEl('map_tools');
        self.el.legend = window.getEl('map_tools__legend');
        self.el.legend__title = window.getEl('map_tools__legend__title');
        self.el.legend__subtitle = window.getEl('map_tools__legend__subtitle');
        self.el.legend__top_value = window.getEl('map_tools__legend__top_value');
        self.el.legend__low_value = window.getEl('map_tools__legend__low_value');

        self.el.data = {};

        // Lives improved
        self.el.data.nrlivesimproved = window.getEl('nr_lives_improved');
        self.el.data.labellivesimproved = window.getEl('nr_lives_improved_label');
        self.el.data.percentagelivesimproved = window.getEl('lives_improved_percentage');
        self.el.data.population = window.getEl('nr_population');
        self.el.data.gdp = window.getEl('nr_gdp');

        // Global presence
        self.el.data.assets = window.getEl('nr_assets');
        self.el.data.employees = window.getEl('nr_employees');
        self.el.data.female = window.getEl('nr_female');
        self.el.data.male = window.getEl('nr_male');
        self.el.data.plants = window.getEl('nr_plants');
        self.el.data.research = window.getEl('nr_research');
        self.el.data.sales = window.getEl('nr_sales');

        // Sustainability
        self.el.data.co2 = window.getEl('nr_co2');
        self.el.data.emission = window.getEl('nr_emission');
        self.el.data.emissionhaz = window.getEl('nr_emissionhaz');
        self.el.data.trc = window.getEl('nr_trc');
        self.el.data.waste = window.getEl('nr_waste');
        self.el.data.wasterecycled = window.getEl('nr_wasterecycled');
        self.el.data.water = window.getEl('nr_water');



        self.el.btnshowcurrent = window.getEl('show_current');
        self.el.btnshowsimulation = window.getEl('show_simulation');
        self.el.history = window.getEl('graph');

        self.el.regioninfotitle = window.getEl('region_info_title');

        window.objArcProps.targetnode = window.getEl('arc_path');
        window.objArcProps.targetleftwrapper = window.getEl('arc_path_left_wrapper');
        window.objArcProps.targetleftnode = window.getEl('arc_path_left');
        
        // renderInfographic({ angle: 0 });
    }
}