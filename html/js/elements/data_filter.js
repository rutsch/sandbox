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
    showHideLegend: function () {
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

    datasourceChanged: function (el, dataSource, applyfilter) {
        if (!objDataFilter.vars.subclicked) {
            // console.log('***');
            // console.trace();
            // console.log(el);
            // console.log(dataSource);
            // console.log('***');

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
            objDataFilter.showHideLegend();

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

        var elDataSource = window.Sizzle('li[data-panel=' + dataSource + ']')[0];
        console.log(elDataSource);

        // Set the active tab in the UI
        objDataFilter.setactivetab(elDataSource);

        // Reset all indicators to their default value
        objDataFilter.resetsubtypeindicators(objDataFilter.el.wrapper.getElementsByClassName('subtypeindicator'));

        // Set the subtype name to div below the data type
        elDataSource.getElementsByClassName('subtypeindicator')[0].innerHTML = el.innerHTML;

        // Set the body element style
        window.getEl('body').setAttribute('data-subtype', subType);

        // Show or hide the legend
        objDataFilter.showHideLegend();

        // Apply the filter        
        if (applyfilter) window.objFilter.applyfilter();

        // Reset the variable
        objDataFilter.vars.timerid = setTimeout(function () {
            objDataFilter.vars.subclicked = false;
        }, 50);
    }
}