var objDataFilter = {
    el: {
        wrapper: ''
    },
    state: {
        filter: {
            datasource: 'lives_improved'
        }
    },
    init: function () {
        var self = this;
        self.el.wrapper = getEl('map-tab_panels');
		var items = Sizzle('.map-tab_panels > div > ul > li');//self.el.wrapper.getElementsByTagName('li');
		for (var i =0; i < items.length; i++) {
			items[i].addEventListener('click', this.datasourceChanged, false);
		}

    },
	datasourceChanged: function(e) {
        //debugger;
        e.stopPropagation();
		objDataFilter.state.filter.datasource = this.getAttribute('data-panel');
        objDataFilter.state.filter.subtype = 'all';
		var items = objDataFilter.el.wrapper.getElementsByClassName('active-tab');
		for (var i =0; i < items.length; i++) {
			items[i].removeAttribute('class');
		}
		this.setAttribute('class', 'active-tab');

        var subtypeindicators = objDataFilter.el.wrapper.getElementsByClassName('subtypeindicator');
		for (var i =0; i < subtypeindicators.length; i++) {
			subtypeindicators[i].innerText = 'All data';
		}
        // Show or hide the legend
        objFilter.applyfilter();
        if(objDataFilter.state.filter.datasource === 'lives_improved' || objDataFilter.state.filter.subtype !== 'all') {
            objRegionInfo.renderLegend();
            TweenLite.to(objRegionInfo.el.legend, 0.3, {
    			opacity: 1
    		})

        } else {
            TweenLite.to(objRegionInfo.el.legend, 0.3, {
    			opacity: 0
    		})
        }
		//console.log(objDataFilter.state.filter.datasource);
	},
    subtypeChanged: function(e) {
        e.stopPropagation();
        // get subtype
        var subtype = this.getAttribute('data-subtype');
        // Set the subtype name to div below the data type
        this.parentNode.parentNode.parentNode.getElementsByClassName('subtypeindicator')[0].innerHTML = this.innerText;

        objDataFilter.state.filter.subtype = subtype;
        getEl('body').setAttribute('data-subtype', subtype);
        objFilter.applyfilter();
        if(objDataFilter.state.filter.datasource === 'lives_improved' || objDataFilter.state.filter.subtype !== 'all') {
            objRegionInfo.renderLegend();
            TweenLite.to(objRegionInfo.el.legend, 0.3, {
    			opacity: 1
    		})

        } else {
            TweenLite.to(objRegionInfo.el.legend, 0.3, {
    			opacity: 0
    		})
        }

    }
}
