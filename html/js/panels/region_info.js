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
        gdp: null,
        legendmax: null,
        legendmin: null
    },




    /*
     * UI functions
     */
    show: function () {
        var self = this;
        var animate = true;
        self.state.tweening = true;

        // In the public version of the tool, we show the data in an overlay and hide the filter panel
        if (window.isPublicSite()) {
            window.objFilter.hide();
            window.objOverlay.show();
        }

        // debugger;

        if (window.objPageState.mobile === true) {
            // Show the mobile version of the region info panel
            self.removeMobileRegionInfos();

            // Copy region info html to correct LI
            var el = window.Sizzle('[data-target=' + window.objPageState.state.filter.oru + ']')[0];

            el.className = 'mapselector selected';
            el.innerHTML = el.innerHTML + window.getEl(window.objDataFilter.state.filter.datasource).outerHTML;
            el.getElementsByClassName('region_info_wrapper')[0].removeAttribute('style');
        } else {
            // Show the desktop version of the region info panel
            if (animate) {
                window.TweenLite.to(self.el.regionpanel, 0.3, {
                    bottom: '0%',
                    opacity: 1,
                    onComplete: self.showcomplete(self.el.regionpanel, animate)
                });
            } else {
                window.css(self.el.regionpanel, {
                    bottom: '0%',
                    opacity: 1
                });
                self.showcomplete(self.el.regionpanel, animate);
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
    showcomplete: function (el, animate) {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = true;

        if (animate) {
            window.TweenLite.to(self.el.toolspanel, 0.3, {
                bottom: '0%',
                opacity: 0,
                'z-index': -1
            });
        } else {
            window.css(self.el.toolspanel, {
                bottom: '0%',
                opacity: 0,
                'z-index': -1
            });
        }

    },


    hide: function () {
        var self = this;
        var animate = true;

        // debugger;

        if (self.state.visible) {
            // self.el.regionpanel.className = 'hidden animate';

            // Hide the panel
            self.state.tweening = true;

            if (animate) {
                if (window.app.state.width > 768) {
                    window.TweenLite.to(self.el.regionpanel, 0.3, {
                        bottom: '0%',
                        opacity: 0,
                        onComplete: self.hidecomplete(self.el.regionpanel, animate)
                    });
                } else {
                    window.TweenLite.to(self.el.regionpanel, 0.3, {
                        bottom: '-86%',
                        opacity: 0,
                        onComplete: self.hidecomplete(self.el.regionpanel, animate)
                    });
                }
            } else {
                window.css(self.el.regionpanel, {
                    opacity: 0,
                    bottom: '0%'
                });
                self.hidecomplete(self.el.regionpanel, animate);
            }
        }

        if (window.objPageState.mobile) {
            self.removeMobileRegionInfos();
        }

        window.objHeader.hidefavouritebutton();

    },

    // Central onComplete handler for hide() function
    hidecomplete: function (el, animate) {
        var self = objRegionInfo;
        self.state.tweening = false;
        self.state.visible = false;

        // // In the public version of the tool, we show the data in an overlay
        if (window.isPublicSite() && window.objOverlay.state.visible) {
            window.objOverlay.hide();
            // window.objFilter.show();
        }

        // debugger;

        if (animate) {
            window.TweenLite.to(self.el.toolspanel, 0.3, {
                bottom: '0%',
                opacity: 1,
                'z-index': 3
            });
        } else {
            window.css(self.el.toolspanel, {
                bottom: '0%',
                opacity: 1,
                'z-index': 3
            });
        }
    },

    /*
    Legend
    */

    renderLegend: function (dataValueMax, dataValueMin) {
        var self = this;

        self.el.legend__title.innerHTML = window.objDataFilter.state.filter.subtype === 'all' ? window.translateFragment('lives_improved') : window.translateFragment(window.objDataFilter.mapdatatypekeys(window.objDataFilter.state.filter.subtype));
        self.el.legend__subtitle.innerHTML = '';

        if (typeof dataValueMax === 'undefined' || typeof dataValueMin === 'undefined' || dataValueMax === dataValueMin) {
            self.el.legend__top_value.innerHTML = window.translateFragment('high');
            self.el.legend__low_value.innerHTML = window.translateFragment('low');
        } else {
            // Process the numbers so that they will be displayed correctly
            var roundedValueMax = 0;
            var roundedValueMin = 0;
            switch (window.objPageState.state.filter.datasource) {
                case 'lives_improved':
                    roundedValueMax = window.objMap.roundlivesimprovedpercentage(dataValueMax);
                    roundedValueMin = window.objMap.roundlivesimprovedpercentage(dataValueMin);
                    break;
                default:
                    var tmp = {};
                    tmp[window.objPageState.state.filter.subtype] = dataValueMax;
                    roundedValueMax = window.objMap.roundlivesimproveddataobject(tmp)[window.objPageState.state.filter.subtype];
                    tmp[window.objPageState.state.filter.subtype] = dataValueMin;
                    roundedValueMin = window.objMap.roundlivesimproveddataobject(tmp)[window.objPageState.state.filter.subtype];
            }

            self.el.legend__top_value.innerHTML = roundedValueMax;
            self.el.legend__low_value.innerHTML = roundedValueMin;
        }
    },



    showhidelegend: function (dataValueMax, dataValueMin) {
        // console.log('in showhidelegend(' + dataValueMax + ',' + dataValueMin + ')');
        if (window.objPageState.state.filter.datasource === 'lives_improved' ||
            window.objPageState.state.filter.subtype !== 'all' ||
            (window.objPageState.state.filter.datasource === 'sustainability' && window.objPageState.state.filter.subtype === 'all' && window.objPageState.state.filter.orulevel === '3')
        ) {
            window.objRegionInfo.renderLegend(dataValueMax, dataValueMin);
            window.css(window.objRegionInfo.el.legend, {
                opacity: 1
            });
        } else {
            window.css(window.objRegionInfo.el.legend, {
                opacity: 0
            });
        }
    },

    /*
    Details panel
    */
    // Shows and hides the lines in the details panel    
    setdetailspanel: function (dataSource, subType) {
        // console.trace();
        // console.log('setdetailspanel("' + dataSource + '", "' + subType + '")');
        // console.log('- window.objMap.datatypes["' + dataSource + '"]: ' + window.objMap.datatypes[dataSource]);
        var elPanel = document.getElementById(dataSource + '_details');
        var defaultState = (typeof subType === 'undefined') ? 'block' : (subType === 'all') ? 'block' : 'none';

        // Set the default state for the lines in the details panel
        var arrDivs = elPanel.getElementsByTagName('div');
        for (var i = 0; i < arrDivs.length; i++) {
            // Hide the rows that contain no data
            if (window.objMap.datatypes[dataSource].indexOf(arrDivs[i].id) === -1) {
                arrDivs[i].style.display = 'none';
            } else {
                arrDivs[i].style.display = defaultState;
            }
        }

        // Show the subtype element if it was supplied
        if (typeof subType !== 'undefined') {
            if (subType !== 'all') document.getElementById(subType).style.display = 'block';
        }
    },

    hidedetailspanel: function () {

        window.objHeader.setregionname(window.objMap.state.mapname);

        // Update the states in the different objects        
        window.objOruFilter.state.selectedoruguid = 'none';

        // Update the page state        
        window.objPageState.updatepagestate({
            view: 'worldmap',
            filter: {
                datasource: window.objDataFilter.state.filter.datasource,
                subtype: window.objDataFilter.state.filter.subtype,
                oru: 'none',
            }
        });
    },



    removeMobileRegionInfos: function () {
        var el = window.Sizzle('[data-target] > div');
        for (var i = 0; i < el.length; i++) {
            el[i].parentNode.className = 'mapselector';
            el[i].parentNode.removeChild(el[i]);
        }
    },


    // Used to show/hide the trend graph
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