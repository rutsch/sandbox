var objSliders = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null,
		innerwrapper: null,
		slidersales: null,
		slidergreensales: null
	},
	vars: {
		data: null,
		content: null,
		slidersalesvalue: 0,
		slidergreensalesvalue: 0,
		livesimprovedcurrent: 0,
		simulatorsampling: false
	},
	/*
	 * UI functions
	 */
	hide: function(){
		var self = this;
		if(app.state.width>700){
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				top : '-40%',
				onComplete: function(){
					self.state.tweening = false;
					self.el.innerwrapper.style.opacity = 0;
					self.state.visible = false;
				}
			});			
		}else{
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				bottom : '-60%',
				onComplete: function(){
					self.state.tweening = false;
					self.el.innerwrapper.style.opacity = 0;
					self.state.visible = false;
				}
			});			
		}

	},
	show: function(){
		var self = this;
		if(app.state.width>700){
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				top : '0%',
				onComplete: function(){
					//debugger;
					self.state.tweening = false;
					self.el.innerwrapper.style.opacity = 1;
					self.state.visible = true;
				}
			});					
		}else{
			self.state.tweening = true;
			TweenLite.to(self.el.wrapper, 0.3, {
				bottom : '0%',
				onComplete: function(){
					//debugger;
					self.state.tweening = false;
					self.el.innerwrapper.style.opacity = 1;
					self.state.visible = true;
				}
			});					
		}

	},
	//loads the data and sets up the interface 
	start: function(){
		var self=this;
		//start Ajax Call to get simulation data
		var objData = {
			fulldomain: location.protocol+"//"+location.hostname,
			method: 'getlivesimprovedcachedata',
			type: 'json',
			oru: objOruFilter.state.selectedoruguid,
			mru: objMruFilter.state.selectedmru,
			snapshotid: 1,
			token: objLogin.token
		}
		
		
		psv('GET', objConfig.urls.simulationdataurl, objData, function(response){

			if(response.error) {
				self.el.wrapper.innerHTML="<div class='simulator_data_error'>"+response.error.message+"</div>";
				//objError.show(response.error.message, true);
			}else{
				//store the data we have received
				self.vars.data=response;

				//inject the slider html into the div
				self.el.wrapper.innerHTML=self.vars.content;
				self.el.innerwrapper = getEl('simulation_wrapper');

				//show the interface
				self.show();

				//initiate the base logic and start sampling the slider positions
				self.setupsimulator();
			}
		});


	},
	setupsimulator: function(){
		var self=this;
		//reset data
		self.el.slidersales.value=0;
		self.el.slidergreensales.value=0;
		
		self.vars.slidersalesvalue=0;
		self.vars.slidergreensalesvalue=0;


		//store the current lives improved number
		var strKey=objMruFilter.state.selectedmru+"_"+objOruFilter.state.selectedoruguid;
		var intPopulation=objMap.data[strKey].l;
		self.vars.livesimprovedcurrent=intPopulation;

		//set the values min/max for the slider labels
		getEl('salesmin').innerHTML=self.vars.data.scenario.salesmin;
		getEl('salesmax').innerHTML=self.vars.data.scenario.salesmax;
		getEl('greensalesmin').innerHTML=self.vars.data.scenario.greensalesmin;
		getEl('greensalesmax').innerHTML=self.vars.data.scenario.greensalesmax;

		//set the min and max values on the input nodes
		self.el.elslidersales.setAttribute('min', self.vars.data.scenario.salesmin);
		self.el.elslidersales.setAttribute('max', self.vars.data.scenario.salesmax);
		self.el.elslidergreensales.setAttribute('min', self.vars.data.scenario.greensalesmin);
		self.el.elslidergreensales.setAttribute('max', self.vars.data.scenario.greensalesmax);

		//position the "0" label
		//self.vars.data.scenario.salesmin=-30;
		var intLeftSales=(-self.vars.data.scenario.salesmin)/(-self.vars.data.scenario.salesmin+self.vars.data.scenario.salesmax)*100+1;
		var intLeftGreensales=(-self.vars.data.scenario.greensalesmin)/(-self.vars.data.scenario.greensalesmin+self.vars.data.scenario.greensalesmax)*100+1;
		getEl('saleszero').style.left=intLeftSales+'%';
		getEl('greensaleszero').style.left=intLeftGreensales+'%';
		//objPageElements.elslidersaleslabel

		//show the interface
		//showSimulatorInterface();
		
		//start the sampling process
		self.vars.simulatorsampling=true;

		self.executeslidersampling();
	},
	executeslidersampling: function(){
		var self=this;
		//retrieve the values of the sliders
		var intCurrentSalesPercentage=self.el.slidersales.value;
		var intCurrentGreenSalesPercentage=self.el.slidergreensales.value;

		//only call the simulator update if the values of the sliders have changed...
		if(intCurrentSalesPercentage!=self.vars.slidersalesvalue || intCurrentGreenSalesPercentage!=self.vars.slidergreensalesvalue){
			//simulatorCalculateValue(intCurrentSalesPercentage, intCurrentGreenSalesPercentage);
		}
		

		self.vars.slidersalesvalue=Math.round(intCurrentSalesPercentage*10)/10;
		self.vars.slidergreensalesvalue=Math.round(intCurrentGreenSalesPercentage*10)/10;

		//if(self.vars.timersimulator)clearTimeout(self.vars.timersimulator);

		//calls itself...
		if(self.vars.simulatorsampling){
			self.vars.timersimulator=setTimeout(function(){
				executeSliderSampling();
			},100);		
		}

	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('simulation');
		self.el.innerwrapper = getEl('simulation_wrapper');
		self.el.slidersales = getEl('slidersales');
		self.el.slidergreensales = getEl('slidergreensales');

		//store the content of the slider interface in a variable so that we can inject it
		self.vars.content=self.el.wrapper.innerHTML;
	}
}