var objOruFilter = {
    json: null,
    state: {
        selectedoru: null, // Detail of the map (1, 2, 3, 4) - replaced with objPageState.state.filter.orulevel
        selectedoruguid: null // Selected country/region - replaced with objPageState.state.filter.oru
    },
    el: {
        mrufilter: null,
        wrapper: null
    },
    // Fired when the filter panel is opened - sets the state of the filter to match the filter state of the application
    setorufilterstate: function () {
        var self = this;
        // console.log('bla');

        self.state.selectedoru = window.objPageState.state.filter.orulevel;
        var strButtonId = 'btn_country';
        switch (window.objPageState.state.filter.orulevel) {
            case "1":
                strButtonId = 'btn_world'
                break;
            case "2":
                strButtonId = 'btn_region'
                break;
            case "3":
                strButtonId = 'btn_bmc'
                break;
            default:
                break;
        }

        self.selectoru(window.getEl(strButtonId), window.objPageState.state.filter.orulevel, false);

        //console.log(self.getmrufilteraxisarray(objPageState.state.filter.mru))

    },
    getregionnamebyid: function (regionId) {
        var self = this;

        // console.log(regionId);
        // console.trace();
        // console.log(iterate(self.json, 'guid', regionId))
        var result = window.translateFragment(regionId); // window.iterate(self.json, 'guid', regionId).name;

        // JT: stupid fix for now to get the map up and running with a typo in the metadata id
        if (result.indexOf('[') > -1) {
            var regionIdNew = undefined;
            if (regionId === 'cantral-east_europe') regionIdNew = 'central-east_europe';
            if (regionId === 'central-east_europe') regionIdNew = 'cantral-east_europe';
            if (regionIdNew) result = window.translateFragment(regionIdNew); // window.iterate(self.json, 'guid', regionIdNew).name;
        }

        // Reset the object defined in utils.js
        window.returnObj = {};

        return result;
    },
    /*
     * UI functions
     */
    selectoru: function (el, strOru) {
        var self = this;

        console.log(strOru);

        self.el.wrapper = window.getEl('oru_filter_container');
        //remove all selected classes
        // var arrAllLi = self.el.wrapper.getElementsByTagName('option');
        // console.log(arrAllLi);
        // //debugger;
        // for (var a = 0; a < arrAllLi.length; a++) {
        // 	console.log(arrAllLi[a].getAttribute('value'));
        // 	if (arrAllLi[a].getAttribute('value') === strOru) {
        // 		arrAllLi[a].setAttribute('selected', 'selected')
        // 	}
        // }
        el.className = 'selected';
        self.state.selectedoru = strOru;
        window.objHeader.setbreadcrumb(window.objMruFilter.getmrufilterbreadcrumb());
        if (arguments.length === 2) window.objFilter.blink();

        // Apply the filter automatically in case of the public website
        if (window.isPublicSite()) window.objFilter.applyfilter();
        //objMap.updatemap();
    },
    settocurrentoru: function () {
        var self = this;
        // Remove all selected classes
        var arrAllLi = self.el.wrapper.getElementsByTagName('option');
        // console.log(objPageState.state.filter.orulevel);

        // Debugger;
        for (var a = 0; a < arrAllLi.length; a++) {
            if (arrAllLi[a].getAttribute('value') === window.objPageState.state.filter.orulevel) {
                arrAllLi[a].setAttribute('selected', 'selected')
            }
        }
        //debugger;
    },
    setdatalevelattribute: function (level) {
        window.getEl('body').setAttribute('data-orulevel', ('level' + ((level) ? level : document.getElementsById('oru-select').selectedValue)));
    },
    convertoruleveltomarket: function (oruLevel) {

        switch (parseInt(oruLevel, 10)) {
            case 1:
                return 'World';
            case 2:
                return 'Region';
            case 3:
                return 'Market';
            case 4:
                return 'Country';
            default:
        }

        return '';
    },
    init: function (cb) {
        var self = this;
        self.state.selectedoru = window.app.defaultpagestate.filter.orulevel;
        self.el.wrapper = window.getEl('oru_filter_container');

        // Set the data-oru level class
        objOruFilter.setdatalevelattribute(1);
    }
}