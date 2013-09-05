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
		
		//stop the sampling of the sliders
		self.vars.simulatorsampling=true;


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
		//hide the green sales slider element for Healthcare
		debugger;
		if(objMruFilter.state.selectedsector == 'PD0900'){
			objSliders.el.slidergreensales.parentNode.style.display = 'none';
		}else{
			objSliders.el.slidergreensales.parentNode.style.display = 'block';
		}
		
		//start Ajax Call to get simulation data
		var objData = {
			fulldomain: location.protocol+"//"+location.hostname,
			method: 'getlivesimprovedcachedata',
			type: 'json',
			oru: objOruFilter.state.selectedoruguid,
			mru: objMruFilter.state.selectedmru,
			snapshotid:  objConfig.currentsnapshotid,
			token: objLogin.token
		}
		
		
		psv('GET', objConfig.urls.simulationdataurl, objData, function(response){

			if(response.error) {
				self.el.innerwrapper.style.display='none';
				self.el.errorwrapper.style.display='block';
				self.el.errorwrapper.innerHTML="<div class='simulator_data_error'>"+response.error.message+"</div>";

				//show the interface
				//self.show();	
							
				//objError.show(response.error.message, true);
			}else{
				//store the data we have received
				self.vars.data=response;

				self.el.innerwrapper.style.display='block';
				self.el.errorwrapper.style.display='none';

				//show the interface
				//self.show();

				//initiate the base logic and start sampling the slider positions
				self.setupsimulator();
				self.setuphistorygraph();
			}
		});
	},
	setuphistorygraph: function(){
		var self = this;
		var data = self.vars.data.historicaldata,
			arrValues = [];		
		
		
		for ( var i = 0; i < data.length; i++) {
			arrValues.push({
				x: i, 
				y: Math.round((data[i].l*100)/data[i].p * 100) / 100,
				label: data[i].name
			});
		}
		self.renderchart(arrValues);

		
		
		/*
		debugger;
		var r = Raphael('region_history', '80%', '80%');
		r.setViewBox(0, 0, 300, 150);
		var root = r.canvas;

		var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.id = 'graph_wrapper';
		g.setAttribute('transform', 'translate(0,0)');
		root.appendChild(g);
		r.canvas = g;		
		
		var chart = r.linechart(0, 0, 300, 140, arrPoints, arrValues, {smooth: true, colors: ['#FFF', '#0F0', '#FF0'], symbol: 'circle', axis: "0 0 1 0", axisxstep:5, axisystep: 1});
		debugger;
		var xText = chart.axis[0].text.items;      
		for(var i in xText){ // Iterate through the array of dom elems, the current dom elem will be i
			debugger;
			var _oldLabel = (xText[i].attr('text') + "").split('.'), // Get the current dom elem in the loop, and split it on the decimal
			_newLabel = _oldLabel[0] + ":" + (_oldLabel[1] == undefined ? '00' : '30'); // Format the result into time strings
			xText[i].attr({'text': _newLabel}); // Set the text of the current elem with the result
		};
		
		getEl('graph_wrapper').parentNode.setAttribute('style', '');*/
		//2012-12-31, 2013-03-31, 2013-04-30
	},
	updatehistorygraph: function(newValue){
		var self = this,
			arrValues = [];
		//clone current data object
		var data = self.vars.data.historicaldata;
		
		for ( var i = 0; i < data.length; i++) {
			arrValues.push({
				x: i, 
				y: data[i].l,
				label: data[i].name
			});
		}
		arrValues.push({x: data.length, y: newValue, label: 'Year end', markerColor: '#333'});
		
		self.renderchart(arrValues);
	},
	renderchart: function(data){
		var self = this;
		self.el.history.innerHTML = '';
		var chart = new CanvasJS.Chart("region_history",
		{
		  axisY:{
		    gridThickness: 0,
		    tickLength: 0,
		    labelFontSize: 10,
		    color: '#000',
		    labelFontColor: '#fff',
		    lineColor: '#333'
		  },
		  axisX:{
			  labelFontColor: '#fff',
			  lineColor: '#333'
		  },
		  data: [
		 
		    {        
		    	type: "line",
		    	color: '#fff',
		    	dataPoints: data
		    }
		  ]
	    });
	
		chart.render();		
	},
	setupsimulator: function(){
		var self=this;
		//reset data
		self.el.slidersales.value=0;
		self.el.slidergreensales.value=0;
		self.el.slidersaleslabel.innerHTML = '0%';
		self.el.slidergreensaleslabel.innerHTML = '0%';
		objRegionInfo.el.wrapper.className = '';
		
		self.vars.slidersalesvalue=0;
		self.vars.slidergreensalesvalue=0;


		//store the current lives improved number
		var strKey=objMruFilter.state.selectedmru+"_"+objOruFilter.state.selectedoruguid;
		var intPopulation=objMap.data[strKey].l;
		self.vars.livesimprovedcurrent=intPopulation;

		//set the values min/max for the slider labels
		self.el.salesmin.innerHTML=self.vars.data.scenario.salesmin;
		self.el.salesmax.innerHTML=self.vars.data.scenario.salesmax;
		self.el.greensalesmin.innerHTML=self.vars.data.scenario.greensalesmin;
		self.el.greensalesmax.innerHTML=self.vars.data.scenario.greensalesmax;

		//set the min and max values on the input nodes
		self.el.slidersales.setAttribute('min', self.vars.data.scenario.salesmin);
		self.el.slidersales.setAttribute('max', self.vars.data.scenario.salesmax);
		self.el.slidergreensales.setAttribute('min', self.vars.data.scenario.greensalesmin);
		self.el.slidergreensales.setAttribute('max', self.vars.data.scenario.greensalesmax);

		//position the "0" label
		//self.vars.data.scenario.salesmin=-30;
		var intLeftSales=(-self.vars.data.scenario.salesmin)/(-self.vars.data.scenario.salesmin+self.vars.data.scenario.salesmax)*100+1;
		var intLeftGreensales=(-self.vars.data.scenario.greensalesmin)/(-self.vars.data.scenario.greensalesmin+self.vars.data.scenario.greensalesmax)*100+1;
		getEl('saleszero').style.left=intLeftSales+'%';
		getEl('greensaleszero').style.left=intLeftGreensales+'%';
		//self.el.slidersaleslabel

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
			self.calculatevalue(intCurrentSalesPercentage, intCurrentGreenSalesPercentage);
		}
		

		self.vars.slidersalesvalue=Math.round(intCurrentSalesPercentage*10)/10;
		self.vars.slidergreensalesvalue=Math.round(intCurrentGreenSalesPercentage*10)/10;

		//if(self.vars.timersimulator)clearTimeout(self.vars.timersimulator);

		//calls itself...
		if(self.vars.simulatorsampling){
			self.vars.timersimulator=setTimeout(function(){
				self.executeslidersampling();
			},100);		
		}

	},
	calculatevalue: function(intCurrentSalesPercentage, intCurrentGreenSalesPercentage){
		var self=this;


		//update the lables of the sliders
		self.el.slidersaleslabel.innerHTML=(intCurrentSalesPercentage > 0 ? '+': '') + Math.round(intCurrentSalesPercentage*10)/10 + '%';
		self.el.slidergreensaleslabel.innerHTML=(intCurrentGreenSalesPercentage > 0 ? '+': '') + Math.round(intCurrentGreenSalesPercentage*10)/10 + '%';

		//encode the retieved values so that we can find them in the simululator data
		var intSalesMin, intGreenSalesMin, intSalesMax, intGreenSalesMax;
		intCurrentSalesPercentage=parseFloat(intCurrentSalesPercentage, 10);
		intCurrentGreenSalesPercentage=parseFloat(intCurrentGreenSalesPercentage, 10);

		//correct for maximum values
		if(intCurrentSalesPercentage==self.vars.data.scenario.salesmax)intCurrentSalesPercentage=self.vars.data.scenario.salesmax-0.000001;
		if(intCurrentGreenSalesPercentage==self.vars.data.scenario.greensalesmax)intCurrentGreenSalesPercentage=self.vars.data.scenario.greensalesmax-0.000001;
		
		intSalesMin=Math.floor((intCurrentSalesPercentage+0.00001)/self.vars.data.scenario.salesstep)*self.vars.data.scenario.salesstep
		//console.log(intSalesTemp)
		intGreenSalesMin=Math.floor((intCurrentGreenSalesPercentage+0.00001)/self.vars.data.scenario.greensalesstep)*self.vars.data.scenario.greensalesstep
		//console.log(intGreenSalesTemp)
		var strKeyMin='s'+(intSalesMin+'').replace(/-/, 'minus')+'g'+(intGreenSalesMin+'').replace(/-/, 'minus');
		//console.log(strKeyMin);

		intSalesMax=Math.ceil((intCurrentSalesPercentage+0.000001)/self.vars.data.scenario.salesstep)*self.vars.data.scenario.salesstep
		//console.log(intSalesTemp)
		intGreenSalesMax=Math.ceil((intCurrentGreenSalesPercentage+0.000001)/self.vars.data.scenario.greensalesstep)*self.vars.data.scenario.greensalesstep
		//console.log(intGreenSalesTemp)
		var strKeyMax='s'+(intSalesMax+'').replace(/-/, 'minus')+'g'+(intGreenSalesMax+'').replace(/-/, 'minus');
		//console.log(strKeyMax);

		//attempt to find the values in the associative array
		var intLivesImprovedMax=null, intLivesImprovedMin=null;
		if(self.vars.data.livesimproved[strKeyMin]){
		    intLivesImprovedMin=self.vars.data.livesimproved[strKeyMin];
		}
		if(self.vars.data.livesimproved[strKeyMax]){
		    intLivesImprovedMax=self.vars.data.livesimproved[strKeyMax];
		}

		//console.log('- strKeyMin: '+strKeyMin+' - strKeyMax: '+strKeyMax+'intLivesImprovedMin: '+intLivesImprovedMin+' - intLivesImprovedMax: '+intLivesImprovedMax);

		//assume both sliders have the same influence
		var intDelta=intLivesImprovedMax-intLivesImprovedMin;
		var intFactor=intDelta/(self.vars.data.scenario.salesstep+self.vars.data.scenario.greensalesstep);
		var intSalesFactor=intFactor*self.vars.data.scenario.salesstep;
		var intGreenSalesFactor=intFactor*self.vars.data.scenario.greensalesstep;
		//console.log('intDelta: '+intDelta+' - intFactor: '+intFactor+' - intSalesFactor: '+intSalesFactor+' - intGreenSalesFactor: '+intGreenSalesFactor);
		var intSalesDelta=0;
		//intSalesDelta=(intCurrentSalesPercentage-intSalesMin/self.vars.data.scenario.salesstep);

		if(intCurrentGreenSalesPercentage>0)intSalesDelta=(intCurrentSalesPercentage-intSalesMin/self.vars.data.scenario.salesstep);
		if(intCurrentGreenSalesPercentage<0)intSalesDelta=((0-intSalesMin)-(0-intCurrentSalesPercentage))/self.vars.data.scenario.salesstep;


		var intGreenSalesDelta=0;
		//intGreenSalesDelta=(intCurrentGreenSalesPercentage/intGreenSalesMax);
		if(intCurrentGreenSalesPercentage>0)(intCurrentGreenSalesPercentage-intGreenSalesMin/self.vars.data.scenario.greensalesstep);
		if(intCurrentGreenSalesPercentage<0)intGreenSalesDelta=((0-intGreenSalesMin)-(0-intCurrentGreenSalesPercentage))/self.vars.data.scenario.greensalesstep;

		//console.log('intCurrentSalesPercentage: '+intCurrentSalesPercentage+' - intCurrentGreenSalesPercentage: '+intCurrentGreenSalesPercentage);
		//console.log('intSalesMin: '+intSalesMin+' - intGreenSalesMin: '+intGreenSalesMin+' - intSalesDelta: '+intSalesDelta+' - intGreenSalesDelta: '+intGreenSalesDelta);

		var intLivesImprovedSimulated=intLivesImprovedMin+(intSalesDelta*intSalesFactor)+(intGreenSalesDelta*intGreenSalesFactor);

		//get the poplation
		var strKey=objMruFilter.state.selectedmru+"_"+objOruFilter.state.selectedoruguid;
		var intPopulation=objMap.data[strKey].p;

		var intLivesImprovedSimulatedPercentage=Math.round((intLivesImprovedSimulated/(intPopulation))*100);

		//console.log(intLivesImprovedSimulatedPercentage);
		//console.log(intLivesImprovedSimulated);

		//overwrite the livesimproved number in the interface
		self.el.livesimprovednumber.innerHTML=Math.round(intLivesImprovedSimulated/100000) /10;

		//set the infographic
		self.el.livesimprovedpercentage.textContent=intLivesImprovedSimulatedPercentage+'%';
		//animateArc({start: self.vars.infographicangle, end: (intLivesImprovedSimulatedPercentage*360) /100}, 0.1);	

		//update the infographic
		applyInfographicDelta((intLivesImprovedSimulatedPercentage*360) /100);

		//self.updatehistorygraph(intLivesImprovedSimulated);
		
		if(intLivesImprovedSimulated>self.vars.livesimprovedcurrent){
			objRegionInfo.el.wrapper.setAttribute('class', 'more');

		}else{
			if(intLivesImprovedSimulated<self.vars.livesimprovedcurrent){
				objRegionInfo.el.wrapper.setAttribute('class', 'less');
			}else{
				objRegionInfo.el.wrapper.setAttribute('class', 'equal');
			}
		}

	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('simulation');
		self.el.innerwrapper = getEl('simulation_wrapper');
		self.el.errorwrapper = getEl('simulation_error_wrapper');
		self.el.slidersales = getEl('slidersales');
		self.el.slidergreensales = getEl('slidergreensales');
		self.el.slidersaleslabel=getEl('value_sales');
		self.el.slidergreensaleslabel=getEl('value_green_sales');
		self.el.livesimprovednumber=getEl('nr_lives_improved');
		self.el.livesimprovedpercentage=getEl('lives_improved_percentage');
		self.el.history = getEl('region_history');

		self.el.salesmin=getEl('salesmin');
		self.el.salesmax=getEl('salesmax');
		self.el.greensalesmin=getEl('greensalesmin');
		self.el.greensalesmax=getEl('greensalesmax');
		self.el.saleszero=getEl('saleszero');
		self.el.greensaleszero=getEl('greensaleszero');

		//store the content of the slider interface in a variable so that we can inject it
		self.vars.content=self.el.wrapper.innerHTML;
	}
}