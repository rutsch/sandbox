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
  /*
	* UI functions
	*/
  show: function () {
    var self = this;
    self.state.tweening = true;

    self.el.toppanel.className = 'visible animate';
    self.el.bottompanel.className = 'visible animate';

    // In the public version of the tool, we show the data in an overlay and hide the filter panel
    if (isPublicSite()) {
      objFilter.hide();
      objOverlay.show();
    }

    // slide down top_panel
    if (app.state.width > 768) {
      TweenLite.to(self.el.toppanel, 0.3, {
        top: '0%',
        onComplete: self.showcomplete(self.el.toppanel)
      });
      TweenLite.to(self.el.bottompanel, 0.3, {
        top: '0%',
        onComplete: self.showcomplete(self.el.bottompanel)
      });
    } else {
      self.el.btnshowcurrent.style.display = 'block';
      self.el.btnshowsimulation.style.display = 'block';
      TweenLite.to(self.el.toppanel, 0.3, {
        top: '0%',
        onComplete: self.showcomplete(self.el.toppanel)
      });
      TweenLite.to(self.el.btnshowsimulation, 0, {
        opacity: 1,
        onComplete: self.showcomplete
      });
      TweenLite.to(self.el.btnshowcurrent, 0, {
        opacity: 0,
        onComplete: self.showcomplete
      });
      TweenLite.to(self.el.bottompanel, 0.3, {
        bottom: '-35%',
        onComplete: self.showcomplete(self.el.bottompanel)
      });
    }

    var seenPanelBefore = objStore.getlocalstorageitem('seenRegionInfoIntro');
    if (seenPanelBefore || isPublicSite()) {

    } else {
      objPanelInfo.show('region_info');
      objStore.setlocalstorageitem('seenRegionInfoIntro', 'true');
    }
  },
  // Central onComplete handler for show() function
  showcomplete: function (el) {
    var self = objRegionInfo;
    self.state.tweening = false;
    self.state.visible = true;
    if (el) el.className = 'visible';
  },
  hide: function () {
    var self = this;

    if (self.state.visible) {
      self.el.toppanel.className = 'hidden animate';
      self.el.bottompanel.className = 'hidden animate';

      // Hide the panel
      self.state.tweening = true;
      objSliders.vars.simulatorsampling = false;
      self.el.bottompanel.removeAttribute('style');

      if (app.state.width > 768) {
        TweenLite.to(self.el.toppanel, 0.3, {
          top: '-30%',
          onComplete: self.hidecomplete(self.el.toppanel)
        });
        TweenLite.to(self.el.bottompanel, 0.3, {
          top: '-30%',
          onComplete: self.hidecomplete(self.el.bottompanel)
        });
      } else {
        TweenLite.to(self.el.toppanel, 0.3, {
          top: '-86%',
          onComplete: self.hidecomplete(self.el.toppanel)
        });
        TweenLite.to(self.el.bottompanel, 0.3, {
          bottom: '-50%',
          onComplete: function () {
            self.hidecomplete(self.el.bottompanel);
            TweenLite.to(objMap.el.elsvgholder, 0.3, {
              opacity: 1,
              onComplete: function () {
                objMap.el.elsvgholder.style.display = 'block';
              }
            });
          }
        });
        TweenLite.to(self.el.btnshowsimulation, 0.3, {
          opacity: 0,
          onComplete: function () {
            self.hidecomplete();
            self.el.btnshowsimulation.style.display = 'none';
          }
        });
        TweenLite.to(self.el.btnshowcurrent, 0, {
          opacity: 0,
          onComplete: function () {
            self.hidecomplete();
            self.el.btnshowcurrent.style.display = 'none';
          }
        });
      }
    }
    objHeader.hidefavouritebutton();

  },
  // Central onComplete handler for hide() function
  hidecomplete: function (el) {
    var self = objRegionInfo;
    self.state.tweening = false;
    self.state.visible = false;

    // In the public version of the tool, we show the data in an overlay
    if (isPublicSite() && objOverlay.state.visible) {
      objOverlay.hide();
      objFilter.show();
    }

    if (el) el.className = 'hidden';
  },
  showsimulation: function (self) {
    var self = this;

    self.el.btnshowcurrent.style.display = 'block';

    TweenLite.to(self.el.btnshowsimulation, 0.3, {
      opacity: 0,
      onComplete: function () {
        self.showsimulationcomplete();
        self.state.panel = 'simulation';
        self.el.btnshowsimulation.style.display = 'none';
      }
    });
    TweenLite.to(self.el.btnshowcurrent, 0.3, {
      opacity: 1,
      onComplete: self.showsimulationcomplete
    });
    TweenLite.to(self.el.toppanel, 0.3, {
      top: '-35%',
      onComplete: self.showsimulationcomplete
    });
    TweenLite.to(self.el.bottompanel, 0.3, {
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

    TweenLite.to(self.el.btnshowcurrent, 0.3, {
      opacity: 0,
      onComplete: function () {
        //debugger;
        self.showcurrentcomplete();
        self.state.panel = 'current';
        self.el.btnshowcurrent.style.display = 'none';
      }
    });
    TweenLite.to(self.el.bottompanel, 0.3, {
      bottom: '-35%',
      onComplete: self.showcurrentcomplete
    });
    TweenLite.to(self.el.btnshowsimulation, 0.3, {
      opacity: 1,
      onComplete: self.showcurrentcomplete
    });

    TweenLite.to(self.el.toppanel, 0.3, {
      top: '0%',
      onComplete: self.showcurrentcomplete
    });

  },
  // Central onComplete handler for showcurrent() function
  showcurrentcomplete: function(){
    var self = objRegionInfo;
    self.state.tweening = false;
    self.state.visible = true;
  },
  showhistory: function () {
    var self = this;
    TweenLite.to(self.el.history, 0.3, {
      opacity: 1,
      onComplete: function () {
        self.state.tweening = false;
        self.state.visible = true;
      }
    });
  },
  hidehistory: function () {
    var self = this;
    TweenLite.to(self.el.history, 0.3, {
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

    self.el.wrapper = getEl('region_info_wrapper');
    self.el.toppanel = getEl('top_panel');
    self.el.bottompanel = getEl('bottom_panel');

    self.el.toppanel.className = 'hide';
    self.el.bottompanel.className = 'hide';

    self.el.nrlivesimproved = getEl('nr_lives_improved');
    self.el.labellivesimproved = getEl('nr_lives_improved_label');
    self.el.percentagelivesimproved = getEl('lives_improved_percentage');
    self.el.population = getEl('nr_population');
    self.el.gdp = getEl('nr_gdp');
    self.el.btnshowcurrent = getEl('show_current');
    self.el.btnshowsimulation = getEl('show_simulation');
    self.el.history = getEl('graph');

    self.el.regioninfotitle = getEl('region_info_title');

    objArcProps.targetnode = getEl('arc_path');
    objArcProps.targetleftwrapper = getEl('arc_path_left_wrapper');
    objArcProps.targetleftnode = getEl('arc_path_left');
    renderInfographic({ angle: 0 });

    if (app.state.mobile) {
      if (app.state.ipad) {

        Hammer(self.el.toppanel).on('drag', function (ev) {
          if (ev.gesture.direction == 'up' && ev.gesture.distance > 10) self.hide();
        });

        //setup swipe effect on simulator panel
        Hammer(self.el.bottompanel).on('drag', function (ev) {
          if (ev.gesture.direction == 'up' && ev.gesture.distance > 10) self.hide();
        });

      } else {
        //setup swipe effect on the top panel
        Hammer(self.el.toppanel).on('drag', function (ev) {
          //console.log('drag top panel');
          //console.log(ev.gesture.direction +' - ' +ev.gesture.distance)

          if (ev.gesture.direction == 'up' && ev.gesture.distance > 10) self.showsimulation(self);
          if (self.state.panel == 'simulation' && ev.gesture.direction == 'down' && ev.gesture.distance > 10) self.showcurrent(self);
        });

        //setup swipe effect on bottom panel
        Hammer(self.el.bottompanel).on('drag', function (ev) {
          //console.log('drag bottom panel');
          //console.log(ev.gesture.direction +' - ' +ev.gesture.distance)

          if (ev.gesture.direction == 'down' && ev.gesture.distance > 10) self.showcurrent(self);
        });
      }


    }


  }
}