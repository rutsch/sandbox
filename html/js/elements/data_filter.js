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

    // Shows and hides the lines in the details panel    
    setdetailspanel: function (dataSource, subType) {
        var elPanel = document.getElementById(dataSource + '_details');
        var defaultState = (typeof subType === 'undefined') ? 'block' : 'none';

        // Set the default state for the lines in the details panel
        var arrDivs = elPanel.getElementsByTagName('div');
        for (var i = 0; i < arrDivs.length; i++) {
            arrDivs[i].style.display = defaultState;
        }

        // Show the subtype element if it was supplied
        if (typeof subType !== 'undefined') {
            document.getElementById(subType).style.display = 'block';
        }
    },

    datasourceChanged: function (el, dataSource, applyfilter) {
        if (!objDataFilter.vars.subclicked) {
            if (typeof el === 'undefined') el = window.Sizzle('li[data-panel=' + dataSource + ']')[0];

            // Set the datafilter state
            objDataFilter.state.filter.datasource = dataSource;
            objDataFilter.state.filter.subtype = 'all';

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

            // Apply the filter
            if (applyfilter) window.objFilter.applyfilter();
        }

    },
    subtypeChanged: function (el, dataSource, subType, applyfilter) {
        // debugger;

        if (typeof el === 'undefined') el = window.Sizzle('li[data-panel=' + dataSource + '] li[data-subtype=' + subType + ']')[0];

        // Variable to prevent the click event from triggering datasourceChanged()
        objDataFilter.vars.subclicked = true;

        // Set the datafilter state
        objDataFilter.state.filter.datasource = dataSource;
        objDataFilter.state.filter.subtype = subType;

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

        // Apply the filter        
        if (applyfilter) window.objFilter.applyfilter();

        // Reset the variable
        objDataFilter.vars.timerid = setTimeout(function () {
            objDataFilter.vars.subclicked = false;
        }, 50);
    }
}