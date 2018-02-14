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

        if (window.objConfig.datasources.indexOf('sustainability') > -1) {
            var htmlSustain = '<div class="bg"></div><ul><li class="datasubtype" data-subtype="all" onclick="objDataFilter.changesubtype(\'sustainability\', \'all\')">' + window.translateFragment('all_data') + '</li>';
            window.objMap.datatypes.sustainability.forEach(function (datatype) {
                if (datatype.indexOf('value_') > -1) {
                    htmlSustain += '<li class="datasubtype" data-subtype="' + datatype + '" onclick="objDataFilter.changesubtype(\'sustainability\', \'' + datatype + '\')">' + window.translateFragment(self.mapdatatypekeys(datatype)).replace(/^(.*?)(\s*\(.*\))$/g, '$1') + '</li>';
                }
            });
            htmlSustain += '</ul>';
            window.Sizzle('li[data-panel=sustainability] .datatype-filter')[0].innerHTML = htmlSustain;
        }


        // console.log(htmlSustain);
        if (window.objConfig.datasources.indexOf('global_presence') > -1) {
            var htmlGlobal = '<div class="bg"></div><ul><li class="datasubtype" data-subtype="all" onclick="objDataFilter.changesubtype(\'global_presence\', \'all\')">' + window.translateFragment('all_data') + '</li>';
            window.objMap.datatypes.global_presence.forEach(function (datatype) {
                if (datatype.indexOf('value_') > -1) {
                    htmlGlobal += '<li class="datasubtype" data-subtype="' + datatype + '" onclick="objDataFilter.changesubtype(\'global_presence\', \'' + datatype + '\')">' + window.translateFragment(self.mapdatatypekeys(datatype)).replace(/^(.*?)(\s*\(.*\))$/g, '$1') + '</li>';
                }
            });
            htmlGlobal += '</ul>';
            window.Sizzle('li[data-panel=global_presence] .datatype-filter')[0].innerHTML = htmlGlobal;
        }

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



    /*
    Click handlers in tab menu
    */
    changedatasource: function (dataSource) {
        if (!objDataFilter.vars.subclicked) {
            console.log('changedatasource("' + dataSource + '")');

            // Set the datafilter state
            objDataFilter.state.filter.datasource = dataSource;
            objDataFilter.state.filter.subtype = 'all';

            // Apply the filter
            window.objFilter.applyfilter();
        }
    },
    changesubtype: function (dataSource, subType) {
        console.log('changesubtype("' + dataSource + '", "' + subType + '")');
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

        // Only show the elements that are required in the details panel
        if (dataSource !== 'lives_improved') window.objRegionInfo.setdetailspanel(dataSource, 'all');

        // Set the data type subfilter to the active state
        if (dataSource !== 'lives_improved') objDataFilter.setdatasubtypefilter(dataSource, 'all');
    },

    subtypechanged: function (dataSource, subType) {
        // debugger;
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

        // Only show the elements that are required in the details panel
        if (dataSource !== 'lives_improved') window.objRegionInfo.setdetailspanel(dataSource, subType);

        // Set the data type subfilter to the active state
        if (dataSource !== 'lives_improved') objDataFilter.setdatasubtypefilter(dataSource, subType);
    },

    renderdatalabel: function (dataSource) {
        var labelid = window.objConfig.datalabels[window.objConfig.siteid];

        // TODO: Make this more dynamic so that we do not need to update this manually each publication
        var labelidFuture = window.objConfig.datalabels['q417'];

        // Lives improved data is shown
        if (dataSource === 'lives_improved') {
            // A) Lives Improves always shows the latest data
            labelid = labelidFuture;
        } else {
            // B) Sustainability data for QR is only based on HealthTech business
            if (dataSource === 'sustainability' && window.objConfig.pubtype === 'qr') {
                // If we are previewing the data then we need to show the new ID
                if (window.objConfig.datatype === 'future') {
                    labelid = labelidFuture;
                }
                labelid += '_ht';
            }
            
        }

        // Retrieve and translate the label
        var label = window.translateFragment(labelid);

        if (window.app.state.inframe) {
            window.setTimeout(function () {
                window.postMessageToParent({
                    action: 'setdatalabel',
                    value: (label)
                });
            }, 100);
        } else {
            // TODO - this needs to be implemented
        }
    }
}