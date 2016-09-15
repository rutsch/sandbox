var objFilter = {
  state: {
    visible: null,
    tweening: null,
    currentfilterhtml: ''
  },
  el: {
    wrapper: null,
    filtercontent: null
  },
  show: function () {
    var self = this;
    self.state.currentfilterhtml = self.el.filtercontent.innerHTML;
    // For the public websites we do not show the overlay in combination with the filter
    if (!isPublicSite()) objOverlay.show();

    // Animate the panel in view
    if (!self.state.tweening){
      self.state.tweening = true;
      self.el.wrapper.style.display = 'block';
      TweenLite.to(self.el.wrapper, 0.3, {
        opacity: 1,
        onComplete: self.showcomplete
      });
    }

    //set the mru and oru filter objects to the current state
    objMruFilter.setmrufilterstate();
    objOruFilter.setorufilterstate();

    var seenPanelBefore = objStore.getlocalstorageitem('seenFilterIntro');
    if (seenPanelBefore || isPublicSite()) {

    } else {
      objPanelInfo.show('filter');
      objStore.setlocalstorageitem('seenFilterIntro', 'true');
    }
  },
  showcomplete: function(){
    objFilter.state.tweening = false;
    objFilter.state.visible = true;
  },
  hide: function () {
    var self = this;
    if (!self.state.tweening) {
      self.state.tweening = true;
      TweenLite.to(self.el.wrapper, 0.3, {
        opacity: 0,
        onComplete: function () {
          // For the public websites we do not show the overlay in combination with the filter
          if (!isPublicSite()) objOverlay.hide();
          self.el.filtercontent.innerHTML = self.state.currentfilterhtml;
          self.el.wrapper.style.display = 'none';
          self.state.tweening = false;
          self.state.visible = false;
          self.el.btnapply.style.display = 'none';
        }
      });
    }
  },
  blink: function () {
    var self = this;

    if (isPublicSite()) {
      // Do not blink the filter panel on the publick website when a user clicks on it
      self.blinkcomplete();
    } else {
      TweenLite.to(self.el.filtercontent, 0.2, {
        opacity: 0.5,
        onComplete: function () {
          self.el.loader.style.display = 'block';
          TweenLite.to(self.el.filtercontent, 0.4, {
            opacity: 1,
            onComplete: self.blinkcomplete
          });
        }
      });
    }

  },
  blinkcomplete: function(){
    //debugger;
    objFilter.el.loader.style.display = 'none';
    objFilter.el.btnapply.style.display = 'block';
  },
  applyfilter: function () {
    var self = this;
    //console.log('objFilter.applyfilter()');
    //update the objPageState properties with the filter selection we have just made

    if (!isPublicSite() && self.state.visible && !self.state.tweening) self.hide();

    self.state.currentfilterhtml = self.el.filtercontent.innerHTML;

    self.el.btnapply.style.display = 'none';

    //console.log(objPageState.vars.processed);
    //debugger;

    // Because we auto-apply the filter for the public site, we need to handle it in a different way.
    if (objPageState.vars.processed < 2 && isPublicSite()) {
      objPageState.updatepagestate(objPageState.state);
    } else {
      objPageState.updatepagestate({
        view: 'worldmap',
        filter: {
          orulevel: objOruFilter.state.selectedoru, //for worldmap data 1, 2, 3, 4
          oru: 'none', //selected country/region
          sector: objMruFilter.state.selectedsector, //main sector
          mru: objMruFilter.state.selectedmru //product group
        }
      });
    }



    //hide the details panel
    if (objRegionInfo.state.visible && !objRegionInfo.state.tweening) objRegionInfo.hide();
  },
  init: function () {
    var self = this;
    self.state.visible = false;
    self.state.tweening = false;

    self.el.wrapper = getEl('filter_panel');
    self.el.loader = getEl('filter_loader');
    self.el.filtercontent = Sizzle('#filter_panel div.modal_content')[0];
    self.el.btnapply = getEl('btn_apply_filter');
    self.el.btnapply.style.display = 'none';

    self.state.currentfilterhtml = self.el.filtercontent.innerHTML;
  }
}