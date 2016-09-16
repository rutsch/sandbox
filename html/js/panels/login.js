var objLogin = {
  token: null,
  role: '',
  state: {
    visible: null,
    tweening: null,
    usernamedisabled: null,
    passworddisabled: null,
    authenticating: null,
    messages: []
  },
  vars: {
    urlshiblogin: '/tools/shibboleth-authenticate.aspx'
  },
  el: {
    wrapper: null,
    submit: null
  },
  /*
   * Click functions
   */
  btnsubmitclick: function () {
    var loginUrl = (objConfig.urls.hasOwnProperty('urlshiblogin')) ? objConfig.urls.urlshiblogin : 'https://www.livesimproved.philips.com/tools/shibboleth-authenticate.aspx';
    //alert(loginUrl);
    //reload the complete page to force shibboleth authentication and reset to default or remembered state
    location.href = loginUrl + '?rnd=' + Math.random();
  },
  findlatestsnapshotid: function (response) {
    var self = this;

    //capture the snapshot configuration and store the config into the config object
    objConfig.snapshots = response.snapshotconfig;

    //find the latest snapshot id
    var dateCurrent = new Date('1970-01-01');
    //note - for IE old use new Date('2011', '04' - 1, '11', '11', '51', '00')
    var strLatestSnapshotId = '';
    if (objConfig.snapshots != null) {
      for (var i = 0; i < objConfig.snapshots.length; i++) {
        var objConfigSingle = objConfig.snapshots[i];
        //console.log(objConfigSingle);

        var dateNew = new Date(objConfigSingle.dateend);
        //console.log(dateNew)
        //console.log(dateNew-dateCurrent);

        if ((dateNew - dateCurrent) > 0) {
          //this snapshot is newer than the previous one
          strLatestSnapshotId = objConfigSingle.snapshotid;

          dateCurrent = new Date(objConfigSingle.dateend);
        }
      }
    }

    //update the id in the config file
    objConfig.currentsnapshotid = strLatestSnapshotId;
    //console.log('latest snapshot id '+objConfig.currentsnapshotid);

  },
  //1) Retrieve snapshot id (public info - no login needed)
  getsnapshotconfig: function () {
    var self = this;

    var objData = {
      type: 'json',
      fulldomain: location.protocol + "//" + location.hostname,
      method: 'getsnapshotdetailssimple',
      type: 'json',
      token: objLogin.token
    };

    psv('GET', objConfig.urls.authurl2, objData, function getSnapshotConfigHandler(err, response) {
      //debugger;
      if (err || hasProperty(response, 'error')) {
        if (hasProperty(response, 'error')) {
          objError.show('There was an error retrieving snapshot information. ' + ((typeof response == 'object') ? JSON.stringify(response) : response), true);
        } else {
          objError.show('There was an error retrieving snapshot information. ' + ((typeof err == 'object') ? JSON.stringify(err) : err), true);
        }
      } else {
        //console.log(response);
        if (typeof response == "undefined") {
          objError.show('There was an error retrieving snapshot information. No data was received...', true);
        } else {
          //check if authentication is required
          if (response.hasOwnProperty('authenticated') && !response.authenticated) {
            handleShibbolethLoginRequired();
          } else {
            //finds the latest snapshot id and stores it in objConfig
            self.findlatestsnapshotid(response);

            //test if we need to show an update message and store this in the local storage
            self.checkappconfigforupdates(response);

            //check if we need to start an authentication procedure
            self.checksession();
          }
        }

      }
    });
  },
  //2) Test if we need to start an authentication process, if not then store the token
  checksession: function () {

    //2) test if we are logged in
    var objData = {
      fulldomain: location.protocol + "//" + location.hostname,
      method: 'checksession',
      type: 'json'
    }
    psv('GET', objConfig.urls.authurl2, objData, function checkSessionHandler(err, data) {
      if (err || hasProperty(data, 'error')) {
        if (hasProperty(data, 'error')) {
          objError.show('There was an error retrieving session information. ' + ((typeof data == 'object') ? JSON.stringify(data) : data), true);
        } else {
          objError.show('There was an error retrieving session information. ' + ((typeof err == 'object') ? JSON.stringify(err) : err), true);
        }
      } else {
        //change the view if we need to login
        if (!data.authenticated) {
          handleShibbolethLoginRequired();
        } else {
          // store the token
          objLogin.token = data.token;

          app.defaultpagestate.view = 'worldmap';

          //load the metadata
          app.retrievemetadata();
        }
      }
    });

  },

  checksnapshotconfigforupdates: function (response) {
    var self = this;
    //check if there are updates in the snapshotconfig
    var storedConfig = objStore.getlocalstorageitem('snapshotconfig');
    var newConfig = response.snapshotconfig;
    if (storedConfig) {
      storedConfig = JSON.parse(storedConfig).snapshotconfig;
      //loop through snapshots in newConfig
      for (var i = 0; i < newConfig.length; i++) {
        //debugger;
        var found = false;
        for (var ii = 0; ii < storedConfig.length; ii++) {
          if (newConfig[i].snapshotid == storedConfig[ii].snapshotid) {
            found = true;
            if (newConfig[i].lastmodified != storedConfig[ii].lastmodified) {
              //data updated
              self.state.messages.push('There is updated data for "' + newConfig[i].name + '".');
              break;
            }
          }
        }
        if (!found) {
          // new dataset added
          self.state.messages.push('A new data set "' + newConfig[i].name + '" has been added.');
        }
      }

    }
    objStore.setlocalstorageitem('snapshotconfig', JSON.stringify(response));
  },
  checkappconfigforupdates: function (response) {
    var self = this;
    //check if there are updates in the appinfo
    var storedConfig = objStore.getlocalstorageitem('appconfig');
    var newConfig = response.appinfo;

    var strBaseMessage = '';

    //on the app we show a new release
    if (app.state.mobile) {
      strBaseMessage = '<b>New release available</b><p>A new version (' + ((app.state.ios) ? newConfig.iosid : newConfig.androidid) + ') of the Lives Improved app is available.</p>';
      strBaseMessage += '<p>Please visit the <span class="mimiclink" onclick="loadUrlInBrowser(\'https://www.livesimproved.philips.com/download\', true)">Lives Improved website</span> to download and install this new version.</p>';
      strBaseMessage += '<p>Details:</p>';
      if (storedConfig) {
        storedConfig = JSON.parse(storedConfig);
        if (app.state.ios) {
          if (storedConfig.iosid != newConfig.iosid) {
            self.state.messages.push(strBaseMessage);
            self.state.messages.push(newConfig.iosdescription)
          }
        } else {
          if (storedConfig.androidid != newConfig.androidid) {
            self.state.messages.push(strBaseMessage);
            self.state.messages.push(newConfig.andrioddescription)
          }
        }
      }
    } else {
      //on the website version we show updates for every new user
      strBaseMessage = '<b>The Lives Improved website has updated</b>';
      strBaseMessage += '<p>Details:</p>';

      //TODO: currently using the IOS app release notes. This should be changed so that we show website updates independantly from app updates

      storedConfig = (storedConfig) ? JSON.parse(storedConfig) : null;
      if (storedConfig) {
        if (storedConfig.iosid != newConfig.iosid) {
          self.state.messages.push(strBaseMessage);
          self.state.messages.push(newConfig.iosdescription);
        }
      } else {
        //new user: show the release notes
        self.state.messages.push(strBaseMessage);
        self.state.messages.push(newConfig.iosdescription);
      }

    }

    objStore.setlocalstorageitem('appconfig', JSON.stringify(response.appinfo));
  },

  /*
   * UI functions
   */
  hide: function () {
    var self = this;
    self.state.tweening = true;

    if (app.state.ios) {
      self.el.wrapper.style.display = "none";
      self.state.tweening = false;
      self.state.visible = false;
    } else {
      TweenLite.to(self.el.wrapper, 0.3, {
        opacity: 0,
        onComplete: function () {
          self.el.wrapper.style.display = "none";
          self.state.tweening = false;
          self.state.visible = false;
        }
      });
    }
  },
  show: function () {
    var self = this;

    //reset some variables
    objSliders.vars.simulatorsampling = false;
    self.el.wrapper.style.display = "block";
    self.state.tweening = true;

    if (app.state.ios) {
      self.el.wrapper.style.opacity = 1;
      self.state.tweening = false;
      self.state.visible = true;
      location.href = objConfig.urls.urlshiblogin + '?rnd=' + Math.random();
    } else {
      TweenLite.to(self.el.wrapper, 0.3, {
        opacity: 1,
        onComplete: function () {
          //debugger;
          self.state.tweening = false;
          self.state.visible = true;
          location.href = objConfig.urls.urlshiblogin + '?rnd=' + Math.random();
        }
      });
    }
  },
  logout: function () {
    var self = this;

    objStore.removelocalstorageitem('token');
    //debugger;

    //show the login screen
    objPageState.updatepagestate({
      view: 'login'
    });

    /*objFilter.hide();
		objExplain.hide();
		objBookmarks.hide();
		objOverlay.hide();
		objLogin.show();
		objLoading.hide();*/
  },

  showupdatemessages: function () {
    var self = this;
    //debugger;
    getEl('messagelist').innerHTML = '';
    //debugger;
    if (self.state.messages.length > 0) {
      for (var i = 0; i < self.state.messages.length; i++) {
        getEl('messagelist').innerHTML += '<li>' + self.state.messages[i] + '</li>';
      }
      self.state.messages = [];
      self.showmessages();
    }

  },
  hidemessages: function () {
    var self = this;
    self.state.tweening = true;
    TweenLite.to(self.el.messagespanel, 0.3, {
      opacity: 0,
      onComplete: function () {
        objOverlay.hide();
        self.el.messagespanel.style.display = 'none';
        self.state.tweening = false;
        self.state.visible = false;
      }
    });
  },
  showmessages: function () {
    var self = this;
    objOverlay.show();
    self.state.tweening = true;
    self.el.messagespanel.style.display = 'block';
    TweenLite.to(self.el.messagespanel, 0.3, {
      opacity: 1,
      onComplete: function () {
        //debugger;
        self.state.tweening = false;
        self.state.visible = true;
      }
    });
  },
  init: function () {
    var self = this;
    self.state.passworddisabled = false;
    self.state.usernamedisabled = false;
    self.state.authenticating = false;
    //fill elements object
    self.el.wrapper = getEl('login_panel');
    self.el.submit = getEl('btn_submit');
    self.el.messagespanel = getEl('messages_panel');

    self.token = objStore.getlocalstorageitem('token');
  }
}