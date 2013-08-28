var objLogin = {
	token: null,
	state: {
		visible: null,
		tweening: null,
		usernamedisabled: null,
		passworddisabled: null,
		authenticating: null
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
			alert('Please enter a code1 account and a password');
		}else{
			self.startauthentication();
		}
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
			psv('GET', objConfig.urls.authurl1, objData, function(response){
	        	if(response.error) {
	        		self.handleloginerror(response.error.message);
	        	}else{
					objData.stay = true;
					psv('GET', objConfig.urls.authurl1, objData, function(response){
						//debugger;
		            	if(response.error) {
		            		self.handleloginerror(response.error.message);
		            	}else{	
		            	    self.getjsonvars(objData);
		            	}
					});
	        	}
			});
		}
	},
	getjsonvars: function(objData){
		var self = this;
		objData.method='generatejsvarsjson';
		psv('GET', objConfig.urls.authurl2, objData, function(response){
			if(response.error) {
				self.handleloginerror(response.error.message);
			}else{
				self.authenticate(response.token);
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
        
        psv('POST', objConfig.urls.authurl3, objDataAuthenticate, function(response){
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
        		app.start();                   		
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
			width : 0,
			onComplete: function(){
				self.state.tweening = false;
				self.state.visible = false;
			}
		});
	},
	show: function(){
		var self = this;

		//reset some variables
		objSimulator.vars.simulatorsampling=true;

		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			width : '100%',
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;
			}
		});		
	},
	//JT: this needs to be extended so that basically the app is resetted to it's original state
	logout: function(){
		var self = this;
		objLogin.show();
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
	}
}