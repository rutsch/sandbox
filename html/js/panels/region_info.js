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

    self.el.toppanel.className = 'show animate';
    self.el.bottompanel.className = 'show animate';



    // slide down top_panel
    if (app.state.width > 768) {
      TweenLite.to(self.el.toppanel, 0.3, {
        top: '0%',
        onComplete: function () {
          //debugger;
          self.state.tweening = false;
          self.state.visible = true;
          self.el.toppanel.className = 'show';
        }
      });
      TweenLite.to(self.el.bottompanel, 0.3, {
        top: '0%',
        onComplete: function () {
          self.state.tweening = false;
          self.state.visible = true;
          self.el.bottompanel.className = 'show';
        }
      });
    } else {
      self.el.btnshowcurrent.style.display = 'block';
      self.el.btnshowsimulation.style.display = 'block';
      TweenLite.to(self.el.toppanel, 0.3, {
        top: '0%',
        onComplete: function () {
          //debugger;
          self.state.tweening = false;
          self.state.visible = true;
          self.el.toppanel.className = 'show';
        }
      });
      TweenLite.to(self.el.btnshowsimulation, 0, {
        opacity: 1,
        onComplete: function () {
          //debugger;
          self.state.tweening = false;
          self.state.visible = true;

        }
      });
      TweenLite.to(self.el.btnshowcurrent, 0, {
        opacity: 0,
        onComplete: function () {
          //debugger;
          self.state.tweening = false;
          self.state.visible = true;

        }
      });
      TweenLite.to(self.el.bottompanel, 0.3, {
        bottom: '-35%',
        onComplete: function () {
          self.state.tweening = false;
          self.state.visible = true;
          self.el.bottompanel.className = 'show';
        }
      });
    }

    var seenPanelBefore = objStore.getlocalstorageitem('seenRegionInfoIntro');
    if (seenPanelBefore) {

    } else {
      objPanelInfo.show('region_info');
      objStore.setlocalstorageitem('seenRegionInfoIntro', 'true');
    }
  },
  hide: function () {
    var self = this;

    if (self.state.visible) {
      self.el.toppanel.className = 'hide animate';
      self.el.bottompanel.className = 'hide animate';

      // Hide the panel
      self.state.tweening = true;
      objSliders.vars.simulatorsampling = false;
      self.el.bottompanel.removeAttribute('style');
      if (app.state.width > 768) {
        TweenLite.to(self.el.toppanel, 0.3, {
          top: '-30%',
          onComplete: function () {
            //debugger;
            self.state.tweening = false;
            self.state.visible = false;
            self.el.toppanel.className = 'hide';
          }
        });
        TweenLite.to(self.el.bottompanel, 0.3, {
          top: '-30%',
          onComplete: function () {
            self.state.tweening = false;
            self.state.visible = false;
            self.el.bottompanel.className = 'hide';
          }
        });
      } else {
        TweenLite.to(self.el.toppanel, 0.3, {
          top: '-86%',
          onComplete: function () {
            self.state.tweening = false;
            self.state.visible = false;
            self.el.toppanel.className = 'hide';
          }
        });
        TweenLite.to(self.el.bottompanel, 0.3, {
          bottom: '-50%',
          onComplete: function () {
            self.state.tweening = false;
            self.state.visible = false;
            self.el.bottompanel.className = 'hide';
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
            //debugger;
            self.state.tweening = false;
            self.state.visible = false;
            self.el.btnshowsimulation.style.display = 'none';
          }
        });
        TweenLite.to(self.el.btnshowcurrent, 0, {
          opacity: 0,
          onComplete: function () {
            //debugger;
            self.state.tweening = false;
            self.state.visible = false;
            self.el.btnshowcurrent.style.display = 'none';
          }
        });
      }
    }
    objHeader.hidefavouritebutton();

  },
  showsimulation: function (self) {
    var self = this;

    self.el.btnshowcurrent.style.display = 'block';

    TweenLite.to(self.el.btnshowsimulation, 0.3, {
      opacity: 0,
      onComplete: function () {
        //debugger;
        self.state.tweening = false;
        self.state.visible = true;
        self.state.panel = 'simulation';
        self.el.btnshowsimulation.style.display = 'none';
      }
    });
    TweenLite.to(self.el.btnshowcurrent, 0.3, {
      opacity: 1,
      onComplete: function () {
        //debugger;
        self.state.tweening = false;
        self.state.visible = true;

      }
    });
    TweenLite.to(self.el.toppanel, 0.3, {
      top: '-35%',
      onComplete: function () {
        //debugger;
        self.state.tweening = false;
        self.state.visible = true;

      }
    });
    TweenLite.to(self.el.bottompanel, 0.3, {
      bottom: '0%',
      onComplete: function () {
        self.state.tweening = false;
        self.state.visible = true;
      }
    });
  },
  showcurrent: function (self) {
    var self = this;

    self.el.btnshowsimulation.style.display = 'block';

    TweenLite.to(self.el.btnshowcurrent, 0.3, {
      opacity: 0,
      onComplete: function () {
        //debugger;
        self.state.tweening = false;
        self.state.visible = true;
        self.state.panel = 'current';
        self.el.btnshowcurrent.style.display = 'none';
      }
    });
    TweenLite.to(self.el.bottompanel, 0.3, {
      bottom: '-35%',
      onComplete: function () {
        self.state.tweening = false;
        self.state.visible = true;
      }
    });
    TweenLite.to(self.el.btnshowsimulation, 0.3, {
      opacity: 1,
      onComplete: function () {
        //debugger;
        self.state.tweening = false;
        self.state.visible = true;

      }
    });

    TweenLite.to(self.el.toppanel, 0.3, {
      top: '0%',
      onComplete: function () {
        //debugger;
        self.state.tweening = false;
        self.state.visible = true;

      }
    });

  },
  showhistory: function () {
    var self = this;
    self.el.history = getEl('graph');
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
    self.el.history = getEl('graph');
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