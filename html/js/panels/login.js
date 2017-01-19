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
    vars: {},
    el: {
        wrapper: null,
        submit: null
    },

    /*
     * Click functions
     */
    btnsubmitclick: function () {
        var loginUrl = (window.objConfig.urls.hasOwnProperty('urlshiblogin')) ? window.objConfig.urls.urlshiblogin : 'https://www.livesimproved.philips.com/tools/shibboleth-authenticate.aspx';

        // Reload the complete page to force shibboleth authentication and reset to default or remembered state
        location.href = loginUrl + '?rnd=' + Math.random();
    },
    findlatestsnapshotid: function (response) {
        var self = this;

        // Capture the snapshot configuration and store the config into the config object
        window.objConfig.snapshots = response.snapshotconfig;

        // Find the latest snapshot id
        var dateCurrent = new Date('1970-01-01');

        // Note - for IE old use new Date('2011', '04' - 1, '11', '11', '51', '00')
        var strLatestSnapshotId = '';
        if (window.objConfig.snapshots != null) {
            for (var i = 0; i < window.objConfig.snapshots.length; i++) {
                var objConfigSingle = window.objConfig.snapshots[i];

                // console.log(objConfigSingle);

                var dateNew = new Date(objConfigSingle.dateend);

                // console.log(dateNew)
                // console.log(dateNew-dateCurrent);

                if ((dateNew - dateCurrent) > 0) {
                    // This snapshot is newer than the previous one
                    strLatestSnapshotId = objConfigSingle.snapshotid;

                    dateCurrent = new Date(objConfigSingle.dateend);
                }
            }
        }

        // Update the id in the config file
        window.objConfig.currentsnapshotid = strLatestSnapshotId;

    },

    // 1) Retrieve snapshot id (public info - no login needed)
    getsnapshotconfig: function () {
        var self = this;

        var objData = {
            type: 'json',
            fulldomain: location.protocol + "//" + location.hostname,
            method: 'getsnapshotdetailssimple',
            token: objLogin.token
        };

        window.psv('GET', window.objConfig.urls.authurl2, objData, function getSnapshotConfigHandler(err, response) {
            if (err || window.hasProperty(response, 'error')) {
                if (window.hasProperty(response, 'error')) {
                    window.objError.show('There was an error retrieving snapshot information. ' + ((typeof response === 'object') ? JSON.stringify(response) : response), true);
                } else {
                    window.objError.show('There was an error retrieving snapshot information. ' + ((typeof err === 'object') ? JSON.stringify(err) : err), true);
                }
            } else {
                // console.log(response);
                if (typeof response === "undefined" || typeof response === 'string' || response === null) {
                    window.objError.show('There was an error retrieving snapshot information. No data was received...', true);
                    window.handleShibbolethLoginRequired();
                } else {
                    // Check if authentication is required
                    if (response.hasOwnProperty('authenticated') && !response.authenticated) {
                        window.handleShibbolethLoginRequired();
                    } else {
                        // Finds the latest snapshot id and stores it in objConfig
                        self.findlatestsnapshotid(response);

                        // Test if we need to show an update message and store this in the local storage
                        self.checkappconfigforupdates(response);

                        // Check if we need to start an authentication procedure
                        if (window.isPublicSite()) {
                            // For the public website just render a token
                            objLogin.token = window.generateUniqueId().replace(/x/g, '');

                            // Continue to retrieve the metadata    
                            self.continueretrievemetadata();
                        } else {
                            // Retrieve a server session
                            self.checksession();
                        }
                    }
                }

            }
        });
    },

    // 2) Test if we need to start an authentication process, if not then store the token
    checksession: function () {

        // 2) test if we are logged in
        var objData = {
            fulldomain: location.protocol + "//" + location.hostname,
            method: 'checksession',
            type: 'json'
        }
        window.psv('GET', window.objConfig.urls.authurl2, objData, function checkSessionHandler(err, data) {
            if (err || window.hasProperty(data, 'error')) {
                if (window.hasProperty(data, 'error')) {
                    window.objError.show('There was an error retrieving session information. ' + ((typeof data === 'object') ? JSON.stringify(data) : data), true);
                } else {
                    window.objError.show('There was an error retrieving session information. ' + ((typeof err === 'object') ? JSON.stringify(err) : err), true);
                }
            } else {
                // Change the view if we need to login
                if (!data.authenticated) {
                    window.handleShibbolethLoginRequired();
                } else {
                    // Store the token
                    objLogin.token = data.token;

                    // Continue to the retrieve metadata step
                    objLogin.continueretrievemetadata();
                }
            }
        });

    },

    continueretrievemetadata: function () {
        window.app.defaultpagestate.view = 'worldmap';

        // Load the metadata
        window.app.retrievemetadata();
    },

    checksnapshotconfigforupdates: function (response) {
        var self = this;

        // Check if there are updates in the snapshotconfig
        var storedConfig = window.objStore.getlocalstorageitem('snapshotconfig');
        var newConfig = response.snapshotconfig;
        if (storedConfig) {
            storedConfig = JSON.parse(storedConfig).snapshotconfig;

            // Loop through snapshots in newConfig
            for (var i = 0; i < newConfig.length; i++) {
                // debugger;
                var found = false;
                for (var ii = 0; ii < storedConfig.length; ii++) {
                    if (newConfig[i].snapshotid === storedConfig[ii].snapshotid) {
                        found = true;
                        if (newConfig[i].lastmodified !== storedConfig[ii].lastmodified) {
                            // Data updated
                            self.state.messages.push('There is updated data for "' + newConfig[i].name + '".');
                            break;
                        }
                    }
                }
                if (!found) {
                    // New dataset added
                    self.state.messages.push('A new data set "' + newConfig[i].name + '" has been added.');
                }
            }

        }
        window.objStore.setlocalstorageitem('snapshotconfig', JSON.stringify(response));
    },
    checkappconfigforupdates: function (response) {
        var self = this;

        // Check if there are updates in the appinfo
        var storedConfig = window.objStore.getlocalstorageitem('appconfig');
        var newConfig = response.appinfo;

        var strBaseMessage = '';

        // On the app we show a new release
        if (window.app.state.mobile) {
            strBaseMessage = '<b>New release available</b><p>A new version (' + ((window.app.state.ios) ? newConfig.iosid : newConfig.androidid) + ') of the Lives Improved app is available.</p>';
            strBaseMessage += '<p>Please visit the <span class="mimiclink" onclick="loadUrlInBrowser(\'https://www.livesimproved.philips.com/download\', true)">Lives Improved website</span> to download and install this new version.</p>';
            strBaseMessage += '<p>Details:</p>';
            if (storedConfig) {
                storedConfig = JSON.parse(storedConfig);
                if (window.app.state.ios) {
                    if (storedConfig.iosid !== newConfig.iosid) {
                        self.state.messages.push(strBaseMessage);
                        self.state.messages.push(newConfig.iosdescription)
                    }
                } else {
                    if (storedConfig.androidid !== newConfig.androidid) {
                        self.state.messages.push(strBaseMessage);
                        self.state.messages.push(newConfig.andrioddescription)
                    }
                }
            }
        } else {
            // On the website version we show updates for every new user
            strBaseMessage = '<b>The Lives Improved website has updated</b>';
            strBaseMessage += '<p>Details:</p>';

            // TODO: currently using the IOS app release notes. This should be changed so that we show website updates independantly from app updates

            storedConfig = (storedConfig) ? JSON.parse(storedConfig) : null;
            if (storedConfig) {
                if (storedConfig.iosid !== newConfig.iosid) {
                    self.state.messages.push(strBaseMessage);
                    self.state.messages.push(newConfig.iosdescription);
                }
            } else {
                // New user: show the release notes
                self.state.messages.push(strBaseMessage);
                self.state.messages.push(newConfig.iosdescription);
            }

        }

        window.objStore.setlocalstorageitem('appconfig', JSON.stringify(response.appinfo));
    },

    /*
     * UI functions
     */
    hide: function () {
        var self = this;
        self.state.tweening = true;

        if (window.app.state.ios) {
            self.el.wrapper.style.display = "none";
            self.state.tweening = false;
            self.state.visible = false;
        } else {
            window.TweenLite.to(self.el.wrapper, 0.3, {
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

        // console.trace();
        // debugger;

        // Reset some variables
        window.objSliders.vars.simulatorsampling = false;
        self.el.wrapper.style.display = "block";
        self.state.tweening = true;

        if (window.app.state.ios) {
            self.el.wrapper.style.opacity = 1;
            self.state.tweening = false;
            self.state.visible = true;
            location.href = window.objConfig.urls.urlshiblogin + '?rnd=' + Math.random();
        } else {
            window.TweenLite.to(self.el.wrapper, 0.3, {
                opacity: 1,
                onComplete: function () {
                    // debugger;
                    self.state.tweening = false;
                    self.state.visible = true;
                    location.href = window.objConfig.urls.urlshiblogin + '?rnd=' + Math.random();
                }
            });
        }
    },
    logout: function () {
        var self = this;

        window.objStore.removelocalstorageitem('token');


        // Show the login screen
        window.objPageState.updatepagestate({
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

        // debugger;
        window.getEl('messagelist').innerHTML = '';

        // debugger;
        if (self.state.messages.length > 0) {
            for (var i = 0; i < self.state.messages.length; i++) {
                window.getEl('messagelist').innerHTML += '<li>' + self.state.messages[i] + '</li>';
            }
            self.state.messages = [];
            self.showmessages();
        }

    },
    hidemessages: function () {
        var self = this;
        self.state.tweening = true;
        window.TweenLite.to(self.el.messagespanel, 0.3, {
            opacity: 0,
            onComplete: function () {
                window.objOverlay.hide();
                self.el.messagespanel.style.display = 'none';
                self.state.tweening = false;
                self.state.visible = false;
            }
        });
    },
    showmessages: function () {
        var self = this;
        window.objOverlay.show();
        self.state.tweening = true;
        self.el.messagespanel.style.display = 'block';
        window.TweenLite.to(self.el.messagespanel, 0.3, {
            opacity: 1,
            onComplete: function () {
                // debugger;
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

        // Fill elements object
        self.el.wrapper = window.getEl('login_panel');
        self.el.submit = window.getEl('btn_submit');
        self.el.messagespanel = window.getEl('messages_panel');

        self.token = window.objStore.getlocalstorageitem('token');
    }
}