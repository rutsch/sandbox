var objDataFilter = {
    el: {
        wrapper: ''
    },
    vars: {
        subclicked: false,
        timerid: null
    },
    state: {
        filter: {
            datasource: 'lives_improved',
            subtype: ''
        },
        subtype: {

        }
    },
    init: function () {
        var self = this;
        self.el.wrapper = window.getEl('map-tab_panels');
    },

    showhidelegend: function () {
        if (objDataFilter.state.filter.datasource === 'lives_improved' || objDataFilter.state.filter.subtype !== 'all') {
            window.objRegionInfo.renderLegend();
            window.TweenLite.to(window.objRegionInfo.el.legend, 0.3, {
                opacity: 1
            })

        } else {
            window.TweenLite.to(window.objRegionInfo.el.legend, 0.3, {
                opacity: 0
            })
        }
    },

    resetsubtypeindicators: function (subtypeindicators) {
        for (var i = 0; i < subtypeindicators.length; i++) {
            subtypeindicators[i].innerText = window.translateFragment('all_data');
        }
    },

    setactivetab: function (el) {
        var items = objDataFilter.el.wrapper.getElementsByClassName('active-tab');
        for (var i = 0; i < items.length; i++) {
            items[i].removeAttribute('class');
        }
        el.setAttribute('class', 'active-tab');
    },

    // Maps a data type key to a key in the translation fragment data
    mapdatatypekeys: function (key) {
        var obj = {
            'value_co2': 'c_o_2',
            'value_fte': 'number_of_employees',
            'value_waste': 'waste',
            'value_water': 'water',
            'value_emissions': 'emissions',
            'value_emissionshaz': 'emissionshaz',
            'value_trc': 'lwc_rate',
            'value_wasterecycled': 'recycled',
            'value_sales': 'number_sales',
            'value_male': 'percentage_male',
            'value_female': 'percentage_female',
            'value_research': 'r_and_d_centers',
            'value_plants': 'manufacturing_sites',
            'value_assets': 'number_assets',
            'value_employees': 'number_of_employees',
        }
        if (obj[key]) {
            return obj[key];
        } else {
            console.log('ERROR: key ' + key + ' could not be found...')
        }
        return key;
    },

    // Render the datatype sub filter elements underneath the tabs    
    renderdatasubtypefilters: function () {
        var self = this;
        var htmlSustain = '<div class="bg"></div><ul><li class="datasubtype" data-subtype="all" onclick="objDataFilter.changesubtype(this, \'sustainability\', \'all\')">' + window.translateFragment('all_data') + '</li>';
        window.objMap.datatypes.sustainability.forEach(function (datatype) {
            if (datatype.indexOf('value_') > -1) {
                htmlSustain += '<li class="datasubtype" data-subtype="' + datatype + '" onclick="objDataFilter.changesubtype(this, \'sustainability\', \'' + datatype + '\')">' + window.translateFragment(self.mapdatatypekeys(datatype)).replace(/^(.*?)(\s*\(.*\))$/g, '$1') + '</li>';
            }
        });
        htmlSustain += '</ul>';
        window.Sizzle('li[data-panel=sustainability] .datatype-filter')[0].innerHTML = htmlSustain;

        // console.log(htmlSustain);

        var htmlGlobal = '<div class="bg"></div><ul><li class="datasubtype" data-subtype="all" onclick="objDataFilter.changesubtype(this, \'global_presence\', \'all\')">' + window.translateFragment('all_data') + '</li>';
        window.objMap.datatypes.global_presence.forEach(function (datatype) {
            if (datatype.indexOf('value_') > -1) {
                htmlGlobal += '<li class="datasubtype" data-subtype="' + datatype + '" onclick="objDataFilter.changesubtype(this, \'global_presence\', \'' + datatype + '\')">' + window.translateFragment(self.mapdatatypekeys(datatype)).replace(/^(.*?)(\s*\(.*\))$/g, '$1') + '</li>';
            }
        });
        htmlGlobal += '</ul>';
        window.Sizzle('li[data-panel=global_presence] .datatype-filter')[0].innerHTML = htmlGlobal;

        // console.log(htmlGlobal);
    },

    // Sets the active data source sub-type element in the fold out menu    
    setdatasubtypefilter: function (dataSource, subType) {
        // Reset all
        var arrLi = document.getElementsByClassName('datasubtype');
        for (var i = 0; i < arrLi.length; i++) {
            arrLi[i].setAttribute('class', 'datasubtype');
        }

        // Set the active one
        var elLi = window.Sizzle('li[data-panel=' + dataSource + '] li[data-subtype=' + subType + ']');

        if (typeof elLi !== 'undefined') {
            elLi[0].setAttribute('class', 'datasubtype active');
        }

    },

    // Shows and hides the lines in the details panel    
    setdetailspanel: function (dataSource, subType) {
        console.log('setdetailspanel("' + dataSource + '", "' + subType + '")');
        var elPanel = document.getElementById(dataSource + '_details');
        var defaultState = (typeof subType === 'undefined') ? 'block' : 'none';

        // Set the default state for the lines in the details panel
        var arrDivs = elPanel.getElementsByTagName('div');
        for (var i = 0; i < arrDivs.length; i++) {
            arrDivs[i].style.display = defaultState;
        }

        // Show the subtype element if it was supplied
        if (typeof subType !== 'undefined') {
            if (subType !== 'all') document.getElementById(subType).style.display = 'block';
        }
    },

    /*
    Click handlers in tab menu
    */
    changedatasource: function (el, dataSource) {
        if (!objDataFilter.vars.subclicked) {
            // Set the datafilter state
            objDataFilter.state.filter.datasource = dataSource;
            objDataFilter.state.filter.subtype = 'all';

            // Apply the filter
            window.objFilter.applyfilter();
        }
    },
    changesubtype: function (el, dataSource, subType) {
        // Variable to prevent the click event from triggering changedatasource()
        objDataFilter.vars.subclicked = true;

        // Set the datafilter state
        objDataFilter.state.filter.datasource = dataSource;
        objDataFilter.state.filter.subtype = subType;

        // Apply the filter
        window.objFilter.applyfilter();

        // Reset the variable
        objDataFilter.vars.timerid = setTimeout(function () {
            objDataFilter.vars.subclicked = false;
        }, 50);
    },

    /*
    Functions called onhashchange -> update the filter UI to reflect the new selection
    */
    datasourcechanged: function (dataSource) {
        var el = window.Sizzle('li[data-panel=' + dataSource + ']')[0];

        // Set the active tab in the UI
        objDataFilter.setactivetab(el);

        // Reset all indicators to their default value
        objDataFilter.resetsubtypeindicators(objDataFilter.el.wrapper.getElementsByClassName('subtypeindicator'));

        // Remove the data-subtype attribute from the body node
        window.getEl('body').removeAttribute('data-subtype');

        // Show or hide the legend
        objDataFilter.showhidelegend();

        // Only show the elements that are required in the details panel
        if (dataSource !== 'lives_improved') objDataFilter.setdetailspanel(dataSource);

        // Set the data type subfilter to the active state
        if (dataSource !== 'lives_improved') objDataFilter.setdatasubtypefilter(dataSource, 'all');
    },

    subtypechanged: function (dataSource, subType) {
        var el = window.Sizzle('li[data-panel=' + dataSource + '] li[data-subtype=' + subType + ']')[0];

        // Retrieve the main datasource tab
        var elDataSource = window.Sizzle('li[data-panel=' + dataSource + ']')[0];

        // Set the active tab in the UI
        objDataFilter.setactivetab(elDataSource);

        // Reset all indicators to their default value
        objDataFilter.resetsubtypeindicators(objDataFilter.el.wrapper.getElementsByClassName('subtypeindicator'));

        // Set the subtype name to div below the data type
        elDataSource.getElementsByClassName('subtypeindicator')[0].innerHTML = el.innerHTML;

        // Set the body element style
        window.getEl('body').setAttribute('data-subtype', subType);

        // Show or hide the legend
        objDataFilter.showhidelegend();

        // Only show the elements that are required in the details panel
        if (dataSource !== 'lives_improved') objDataFilter.setdetailspanel(dataSource, subType);

        // Set the data type subfilter to the active state
        if (dataSource !== 'lives_improved') objDataFilter.setdatasubtypefilter(dataSource, subType);
    }
}