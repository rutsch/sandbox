var objDataFilter = {
    el: {
        wrapper: ''
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

        // Add click event to the list items in the header panel
        var items = window.Sizzle('.map-tab_panels > div > ul > li'); //self.el.wrapper.getElementsByTagName('li');
        for (var i = 0; i < items.length; i++) {
            items[i].addEventListener('click', this.datasourceChanged, false);
        }

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
            // TRANSLATE
            subtypeindicators[i].innerText = window.translateFragment('all_data');
        }
    },
    datasourceChanged: function (e) {
        var element = this;
        var wasClicked = false;
        if (e.type && e.type === 'click') {
            e.stopPropagation();
            wasClicked = true;

        } else {
            element = e;
        }

        objDataFilter.state.filter.datasource = element.getAttribute('data-panel');
        objDataFilter.state.filter.subtype = 'all';
        var items = objDataFilter.el.wrapper.getElementsByClassName('active-tab');
        for (var i = 0; i < items.length; i++) {
            items[i].removeAttribute('class');
        }
        element.setAttribute('class', 'active-tab');

        // Reset all indicators to their default value
        objDataFilter.resetsubtypeindicators(objDataFilter.el.wrapper.getElementsByClassName('subtypeindicator'));

        // Remove the data-subtype attribute from the body node
        window.getEl('body').removeAttribute('data-subtype');

        if (wasClicked) {
            // Apply the filter
            window.objFilter.applyfilter();

            // Show or hide the legend
            objDataFilter.showHideLegend();
        }

    },
    subtypeChanged: function (e) {
        if (e) e.stopPropagation();

        //debugger;

        // First kick off the main datasource change event so that we have everything set properly
        objDataFilter.datasourceChanged(this.parentNode.parentNode.parentNode);

        // Get the sub data type
        var subtype = this.getAttribute('data-subtype');

        // Set the subtype name to div below the data type
        this.parentNode.parentNode.parentNode.getElementsByClassName('subtypeindicator')[0].innerHTML = this.innerHTML;

        // Set the body element style
        window.getEl('body').setAttribute('data-subtype', subtype);

        // Apply the filter
        objDataFilter.state.filter.subtype = subtype;
        window.objFilter.applyfilter();

        // Show or hide the legend
        objDataFilter.showHideLegend();
    }
}
