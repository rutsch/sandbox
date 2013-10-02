var objLogin = {
	token: null,
	state: {
		visible: null,
		tweening: null,
		usernamedisabled: null,
		passworddisabled: null,
		authenticating: null,
		messages: []
	},
	el: {
		wrapper: null,
		tbxusername: null,
		tbxpassword: null,
		submit: null
	},
	handleloginerror: function(msg){
		var self = this;
		objOverlay.hide();
		self.el.tbxpassword.value = '';
		self.state.authenticating = false;		
		TweenLite.to(self.el.submit, 0.3, {
			opacity : 1,
			onComplete: function(){
				self.state.tweening = false;
				self.el.submit.value="Log in";
				self.state.passworddisabled = false;
				self.state.usernamedisabled = false;
			}
		});
		objError.show(msg, true);		
	},
	//JT: this check is not valid anymore - all ajax utilities now return a message when authentication is required
	loggedin: function(){
		var self = this;
		self.token  = objStore.getlocalstorageitem('token');
		return self.token != null && self.token != '';
	},
	/*
	 * Click functions
	 */
	btnsubmitclick: function(e){
		e.preventDefault();
		var self = this;
		if(self.el.tbxpassword.value == '' || self.el.tbxusername.value == ''){
			alert('Please enter a Philips CODE1 account and a password');
			if(self.el.tbxpassword.value == ''){
				self.el.tbxpassword.focus();
			}else{
				self.el.tbxusername.focus();
			}
		}else{
			self.startauthentication();
		}
	},
	findlatestsnapshotid: function(response){
		var self=this;

		//capture the snapshot configuration and store the config into the config object
		objConfig.snapshots=response.snapshotconfig;

		//find the latest snapshot id
		var dateCurrent=new Date('1970-01-01');
		//note - for IE old use new Date('2011', '04' - 1, '11', '11', '51', '00')
		var strLatestSnapshotId='';
		if(objConfig.snapshots!=null){
			for ( var i = 0; i < objConfig.snapshots.length; i++) {
				var objConfigSingle = objConfig.snapshots[i];
				//console.log(objConfigSingle);
				
				var dateNew=new Date(objConfigSingle.dateend);
				//console.log(dateNew)
				//console.log(dateNew-dateCurrent);
				
				if((dateNew-dateCurrent)>0){
				   //this snapshot is newer than the previous one
				   strLatestSnapshotId=objConfigSingle.snapshotid;
				   
				   dateCurrent=new Date(objConfigSingle.dateend);
				}
			}
		}

		//update the id in the config file
		objConfig.currentsnapshotid=strLatestSnapshotId;
		//console.log('latest snapshot id '+objConfig.currentsnapshotid);

	},
	getsnapshotconfig: function(cb){
		var self=this;
		
		var objData = {
			type: 'json',
			fulldomain: location.protocol+"//"+location.hostname,
			method:'getsnapshotdetailssimple',
			type:'json',
			token: objLogin.token
		};

		psv('GET', objConfig.urls.authurl2, objData, function(err, response){
			//debugger;
			if(err != null){
				cb(err);
			}else{
				//finds the latest snapshot id and stores it in objConfig
				var latestSnapshotId = self.findlatestsnapshotid(response);
				self.checkappconfigforupdates(response);
				cb(null, latestSnapshotId);				
			}

		});	
	},
	checksnapshotconfigforupdates: function(response){
		var self = this;
		//check if there are updates in the snapshotconfig
		var storedConfig = objStore.getlocalstorageitem('snapshotconfig');
		var newConfig = response.snapshotconfig;
		if(storedConfig){
			storedConfig = JSON.parse(storedConfig).snapshotconfig;
			//loop through snapshots in newConfig
			for ( var i = 0; i < newConfig.length; i++) {
				//debugger;
				var found = false;
				for ( var ii = 0; ii < storedConfig.length; ii++) {
					if(newConfig[i].snapshotid == storedConfig[ii].snapshotid){
						found = true;
						if(newConfig[i].lastmodified != storedConfig[ii].lastmodified){
							//data updated
							self.state.messages.push('There is updated data for "'+newConfig[i].name+'".');
							break;
						}	
					}
				}
				if(!found){
					// new dataset added
					self.state.messages.push('A new data set "'+newConfig[i].name+'" has been added.');
				}
			}

		}						
		objStore.setlocalstorageitem('snapshotconfig', JSON.stringify(response));
	},
	checkappconfigforupdates: function(response){
		var self = this;
		//check if there are updates in the appinfo
		var storedConfig = objStore.getlocalstorageitem('appconfig');
		var newConfig = response.appinfo;
		var strBaseMessage='<b>New release available</b><p>A new version ('+((app.state.ios)?newConfig.iosid:newConfig.androidid)+') of the Lives Improved app is available.</p>';
		strBaseMessage+='<p>Please visit the Lives Improved website <a href="https://www.livesimproved.philips.com">www.livesimproved.philips.com</a> to download and install this new version.</p>';
		strBaseMessage+='<p>Details:</p>';
		if(storedConfig){
			storedConfig = JSON.parse(storedConfig);
			if(app.state.ios){
				if(storedConfig.iosid != newConfig.iosid){
					self.state.messages.push(strBaseMessage);
					self.state.messages.push(newConfig.iosdescription)
				}
			}else{
				if(storedConfig.androidid != newConfig.androidid){
					self.state.messages.push(strBaseMessage);
					self.state.messages.push(newConfig.andrioddescription)
				}
			}
		}						
		objStore.setlocalstorageitem('appconfig', JSON.stringify(response.appinfo));
	},
	/*
	 * Authentication functions
	 */
	startauthentication: function(){
		var self = this;
		if(!self.state.authenticating){
			self.state.authenticating = true;
			objOverlay.show();
			
			var pw = self.el.tbxpassword.value,
				un = self.el.tbxusername.value;
			
			self.changeauthenticatebutton();
						
			var objData = {
				type: 'json',
				fulldomain: location.protocol+"//"+location.hostname
			};
			psv('GET', objConfig.urls.authurl1, objData, function(err, response){
				if(err != null){
					self.handleloginerror(err);
				}else{
					if(response.error) {
						self.handleloginerror(response.error.message);
					}else{
						objData.stay = true;
						psv('GET', objConfig.urls.authurl1, objData, function(err, response){
							//debugger;
							if(err != null){
								self.handleloginerror(err);
							}else{
								//finds the latest snapshot id and stores it in objConfig
								self.findlatestsnapshotid(response);
								//checks if there are updates in the snapshot config and display's a message
								self.checksnapshotconfigforupdates(response);
								
								
								if(response.error) {
									self.handleloginerror(response.error.message);
								}else{	
									self.getjsonvars(objData);
								}								
							}

						});
					}					
				}

			});
		}
	},
	getjsonvars: function(objData){
		var self = this;
		objData.method='generatejsvarsjson';
		psv('GET', objConfig.urls.authurl2, objData, function(err, response){
			//console.log(response);
			if(err != null){
				self.handleloginerror(err);
			}else{
				if(response.error) {
					self.handleloginerror(response.error.message);
				}else{
					self.authenticate(response.token);
				}				
			}
		});
	},
	authenticate: function(token){
		var self = this;
		if(self.el.tbxusername.value.toLowerCase().indexOf('code1\\') == -1) self.el.tbxusername.value = 'code1\\' + self.el.tbxusername.value;
		var objDataAuthenticate = {
			username: self.el.tbxusername.value,
			password: self.el.tbxpassword.value,
			url: '/index.aspx',
			token: token,
			type: 'json',
			fulldomain: location.protocol+"//"+location.hostname
		};
		
		psv('POST', objConfig.urls.authurl3, objDataAuthenticate, function(err, response){
			if(err != null){
				self.handleloginerror(err);
			}else{			
				//response = JSON.parse(response);
				if(response.error) {
					self.handleloginerror(response.error.message);
				}else{
					self.token = response.token;
					objStore.setlocalstorageitem('token', self.token);
					objStore.setlocalstorageitem('username', self.el.tbxusername.value);
					
					self.state.authenticating = false;
					self.changeauthenticatebutton();
								
					objOverlay.hide();
					self.hide();
					self.el.tbxpassword.value = '';
					app.start();                   		
				}
			}
		});	
	},
	/*
	 * UI functions
	 */
	hide: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 0,
			onComplete: function(){
				self.el.wrapper.style.display = "none";
				self.state.tweening = false;
				self.state.visible = false;
			}
		});
	},
	show: function(){
		var self = this;

		//reset some variables
		objSliders.vars.simulatorsampling=false;
		self.el.wrapper.style.display = "block";
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;

				//set the focus
				if(self.el.tbxusername.value==''){
					setTimeout(function(){self.el.tbxusername.focus()}, 500);
				}else{
					setTimeout(function(){self.el.tbxpassword.focus()}, 500);
				}

			}
		});		
	},
	//JT: this needs to be extended so that basically the app is resetted to it's original state
	logout: function(){
		var self = this;
		objStore.removelocalstorageitem('token');
		if((new Date().getTime() /1000) - objStore.getlocalstorageitem('reloadtime') > 10){
			location.reload();
			objStore.removelocalstorageitem('reloadtime');
		}
		objLogin.show();
		/*objFilter.hide();
		objExplain.hide();
		objBookmarks.hide();
		objOverlay.hide();
		objLogin.show();
		objLoading.hide();*/
	},
	changeauthenticatebutton: function(){
		var self = this;
		if(self.state.authenticating){
			TweenLite.to(self.el.submit, 0.3, {
				opacity : 0.5,
				onComplete: function(){
					self.el.submit.value="Authenticating...";
					self.state.passworddisabled = true;
					self.state.usernamedisabled = true;
				}
			});				
		}else{
			TweenLite.to(self.el.submit, 0.3, {
				opacity : 1,
				onComplete: function(){
					self.el.submit.value="Log in";
					self.state.passworddisabled = false;
					self.state.usernamedisabled = false;
				}
			});				
		}			
	},
	showupdatemessages: function(){
		var self = this;
		//debugger;
		getEl('messagelist').innerHTML = '';
		if(self.state.messages.length > 0){
			for ( var i = 0; i < self.state.messages.length; i++) {
				getEl('messagelist').innerHTML += '<li>' + self.state.messages[i] + '</li>';
			}
			self.state.messages = [];
			self.showmessages();
		}

	},
	hidemessages: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.messagespanel, 0.3, {
			opacity : 0,
			onComplete: function(){
				objOverlay.hide();
				self.el.messagespanel.style.display = 'none';
				self.state.tweening = false;
				self.state.visible = false;
			}
		});			
	},
	showmessages: function(){
		var self = this;
		objOverlay.show();
		self.state.tweening = true;
		self.el.messagespanel.style.display = 'block';
		TweenLite.to(self.el.messagespanel, 0.3, {
			opacity : 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;
			}
		});		
	},
	init: function(){
		var self = this;
		self.state.passworddisabled = false;
		self.state.usernamedisabled = false;
		self.state.authenticating = false;
		//fill elements object
		self.el.wrapper = getEl('login_panel');
		self.el.tbxusername = getEl('username');
		self.el.tbxpassword = getEl('password');
		self.el.submit = getEl('btn_submit');
		self.el.messagespanel = getEl('messages_panel');
		
		self.el.tbxusername.value = objStore.getlocalstorageitem('username');
		
		self.token  = objStore.getlocalstorageitem('token');
	}
}