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
		simulatorsampling: false,
		debug: false,
		updatetrendgraph: true,
		updatecurrent: false,
		usebiliniarinterpolation: true,
		debugstring: ''
	},
	/*
	 * UI functions
	 * 
	 * !!!!!!!!!!!!!!!!!!!!! NOT USED, ALL ANIMATIONS ARE STARTED FROM OBJREGIONINFO !!!!!!!!!!!!!!!!!!!!!!!! 
	 * 
	 */

	/* helpers */
	calculatefloorceil: function(intValue, intStep){
		var intFloor=0, intCeil=0;
		var intermediate=Math.round(intValue / intStep) * intStep;
		//console.log('- intermediate='+intermediate);
		//console.log('- modulus='+(s%step));

		if(intValue>=0){
			if((intValue%intStep)>(intStep/2)){
				//console.log('1');
				intCeil=intermediate;
				intFloor=intCeil-intStep;
			}else{
				//console.log('2');
				intFloor=intermediate;
				intCeil=intFloor+intStep;
			}
		
		}else{
			if(Math.abs((intValue%intStep))>(intStep/2) || (intValue%intStep)==0){
				//console.log('3');
				intFloor=intermediate;
				intCeil=intFloor+intStep;
			}else{
				//console.log('4');
				intCeil=intermediate;
				intFloor=intCeil-intStep;
			}
		}
		return {floor: intFloor, ceil: intCeil};
	},
	//loads the data and sets up the interface 
	start: function(){
		var self=this;
		//hide the green sales slider element for Healthcare
		//debugger;
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
		
		
		psv('GET', objConfig.urls.dynamicresourceurl, objData, function(err, response){
			if(err){
				objError.handleError('objSliders.start', err);
			}else{
				if(response.error) {
					//self.el.innerwrapper.style.display='none';
					self.el.errorwrapper.style.display='block';
					self.el.errorwrapper.innerHTML="<div class='simulator_data_error'>"+response.error.message+"</div>";

					//show the interface
					//self.show();	
								
					//objError.show(response.error.message, true);
				}else{
					//store the data we have received
					self.vars.data=response;

					//self.el.innerwrapper.style.display='block';
					self.el.errorwrapper.style.display='none';

					//show the interface
					//self.show();

					//initiate the base logic and start sampling the slider positions
					self.setupsimulator();
					self.setuphistorygraph();
				}				
			}
		});
	},
	setuphistorygraph: function(){
		var self = this;
		var data = self.vars.data.historicaldata;		
		var objGraphData={
			points: [],
			ymin: null,
			ymax: null
		};
		
		/* construct an object that we can sent to the graph utility */
		var strLastLabel='';
		var intMaxValue=-1000000000000, intMinValue=1000000000000;
		for ( var i = 0; i < data.length; i++) {
			//add an element to the array
			objGraphData.points.push({
				value: objMap.roundlivesimproveddataobject({l:data[i].l, g:-1, p: -1}).displayl, 
				label: data[i].name
			});

			//find out the label for the last element in the graph
			if(i==(data.length-1)){
				//determine what the last date should be
				var myDate=new Date(data[i].dateend);
				//if the last snapshot ends on xxxx-12-31, then we need to show the next year
				strLastLabel='Q4 '+(((myDate.getMonth()+1)==12)?(myDate.getFullYear()+1):myDate.getFullYear());
			}

			//keep track of min and max values so that we can scale the graph properly
			if(data[i].l>intMaxValue)intMaxValue=data[i].l;
			if(data[i].l<intMinValue)intMinValue=data[i].l;
		}
		//console.log(intMinValue)

		//add the last element (year end prediction)
		if(self.vars.data.livesimproved.s0g0){
			objGraphData.points.push({
				value: objMap.roundlivesimproveddataobject({l:self.vars.data.livesimproved.s0g0, g:-1, p: -1}).displayl, 
				label: strLastLabel
			});

			//grab the min and max values from the simulator data set
			var strKeyMin='s'+(self.vars.data.scenario.salesmin+'').replace(/\-/, 'minus')+'g'+(self.vars.data.scenario.greensalesmin+'').replace(/\-/, 'minus');
			var strKeyMax='s'+(self.vars.data.scenario.salesmax+'').replace(/\-/, 'minus')+'g'+(self.vars.data.scenario.greensalesmax+'').replace(/\-/, 'minus');

			var intSimulatorMax=self.vars.data.livesimproved[strKeyMax];
			var intSimulatorMin=self.vars.data.livesimproved[strKeyMin];
			//check if these values are more extreme than the points we have already processed
			if(intSimulatorMax>intMaxValue)intMaxValue=intSimulatorMax;
			if(intSimulatorMin<intMinValue)intMinValue=intSimulatorMin;

			//console.log(intMaxValue+' '+intMinValue);

			objGraphData.ymin=parseFloat(objMap.roundlivesimproveddataobject({l:intMinValue, g:-1, p: -1}).displayl.replace(/,/, ''));
			objGraphData.ymin=objGraphData.ymin-Math.round(((objGraphData.ymin/100)*5));
			objGraphData.ymax=parseFloat(objMap.roundlivesimproveddataobject({l:intMaxValue, g:-1, p: -1}).displayl.replace(/,/, ''));
		}

		//set the dimensions of the graph
		objTrendGraph.props.width=self.el.history.offsetWidth;
		objTrendGraph.props.height=self.el.history.offsetHeight;

		//fix the number of grid lines
		objTrendGraph.props.axis.ygridlines=4;


		//console.log(objGraphData);

		//draw the graph
		objTrendGraph.reset();
		objTrendGraph.drawgraph(objGraphData);
		
	},
	setupsimulator: function(){
		var self=this;
		//reset data
		self.el.slidersales.value=0;
		self.el.slidergreensales.value=0;
		self.el.slidersaleslabel.innerHTML = '0%';
		self.el.slidergreensaleslabel.innerHTML = '0%';
		if(objRegionInfo.el.wrapper!=null)objRegionInfo.el.wrapper.className = '';
		
		self.vars.slidersalesvalue=0;
		self.vars.slidergreensalesvalue=0;


		//store the current lives improved number
		var strKey=objMruFilter.state.selectedmru+"_"+objOruFilter.state.selectedoruguid;
		var intPopulation=objMap.data[strKey].l;
		self.vars.livesimprovedcurrent=intPopulation;

		//set the values min/max for the slider labels
		//console.log(self.el.salesmin);
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
		var intLeftSales=(-self.vars.data.scenario.salesmin)/(-self.vars.data.scenario.salesmin+self.vars.data.scenario.salesmax)*100-1;
		var intLeftGreensales=(-self.vars.data.scenario.greensalesmin)/(-self.vars.data.scenario.greensalesmin+self.vars.data.scenario.greensalesmax)*100-1;
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
		var intLivesImprovedSimulated=0;

		if(self.vars.usebiliniarinterpolation){
			var sfloor=0, sceil=0, gsfloor=0, gsceil=0, objCeilFloor={};
			var q11=0, q21=0, q21=0, q22=0, key='';
			var r1=0, r2=0;

			if(intCurrentSalesPercentage==self.vars.data.scenario.salesmax)intCurrentSalesPercentage-=0.0001;
			if(intCurrentGreenSalesPercentage==self.vars.data.scenario.greensalesmax)intCurrentGreenSalesPercentage-=0.0001;
			//console.log('- intCurrentSalesPercentage='+intCurrentSalesPercentage+' - intCurrentGreenSalesPercentage='+intCurrentGreenSalesPercentage);

			//clear debug string
			if(self.vars.debug)self.vars.debugstring='';

			//get ceil and floor
			objCeilFloor=self.calculatefloorceil(intCurrentSalesPercentage, self.vars.data.scenario.salesstep);
			sfloor=objCeilFloor.floor;
			sceil=objCeilFloor.ceil;

			objCeilFloor=self.calculatefloorceil(intCurrentGreenSalesPercentage, self.vars.data.scenario.greensalesstep);
			gsfloor=objCeilFloor.floor;
			gsceil=objCeilFloor.ceil;
			if(self.vars.debug)self.vars.debugstring+="- sfloor="+sfloor+"<br/>"+"- sceil="+sceil+"<br/>"+"- gsfloor="+gsfloor+"<br/>"+"- gsceil="+gsceil+"<br/>"

			//get all combinations
			key='s'+(sfloor+'').replace(/-/, 'minus')+'g'+(gsfloor+'').replace(/-/, 'minus');
			q11=self.vars.data.livesimproved[key];
			if(self.vars.debug)self.vars.debugstring+='- q11 key='+key+', value='+q11+'<br/>';

			key='s'+(sceil+'').replace(/-/, 'minus')+'g'+(gsfloor+'').replace(/-/, 'minus');
			q21=self.vars.data.livesimproved[key];
			if(self.vars.debug)self.vars.debugstring+='- q21 key='+key+', value='+q21+'<br/>';

			key='s'+(sfloor+'').replace(/-/, 'minus')+'g'+(gsceil+'').replace(/-/, 'minus');
			q12=self.vars.data.livesimproved[key];
			if(self.vars.debug)self.vars.debugstring+='- q12 key='+key+', value='+q12+'<br/>';

			key='s'+(sceil+'').replace(/-/, 'minus')+'g'+(gsceil+'').replace(/-/, 'minus');
			q22=self.vars.data.livesimproved[key];
			if(self.vars.debug)self.vars.debugstring+='- q22 key='+key+', value='+q22+'<br/>';

			//interpolation phase1
			r1=((sceil - intCurrentSalesPercentage)/(sceil - sfloor) * q11) + ((intCurrentSalesPercentage - sfloor)/(sceil - sfloor) * q21);
			r2=((sceil - intCurrentSalesPercentage)/(sceil - sfloor) * q12) + ((intCurrentSalesPercentage - sfloor)/(sceil - sfloor) * q22);

			//interpolation phase2
			intLivesImprovedSimulated=((gsceil - intCurrentGreenSalesPercentage)/(gsceil - gsfloor) * r1) + ((intCurrentGreenSalesPercentage - gsfloor)/(gsceil - gsfloor) * r2);

			if(self.vars.debug)getEl('debug').innerHTML=self.vars.debugstring;
			if(self.vars.debug)self.vars.debugstring='';
		}else{
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
			if(self.vars.debug)getEl('debug').innerHTML="- strKeyMin="+strKeyMin+"<br/>"+"- intLivesImprovedMin="+intLivesImprovedMin+"<br/>"+"- strKeyMax="+strKeyMax+"<br/>"+"- intLivesImprovedMax="+intLivesImprovedMax+"<br/>"

			//console.log('- strKeyMin: '+strKeyMin+' - strKeyMax: '+strKeyMax+'intLivesImprovedMin: '+intLivesImprovedMin+' - intLivesImprovedMax: '+intLivesImprovedMax);

			//assume both sliders have the same influence
			//var intDelta=(intLivesImprovedMax-intLivesImprovedMin);
			var intSalesFactor=(((intLivesImprovedMax-intLivesImprovedMin)/2)/self.vars.data.scenario.salesstep);
			var intGreenSalesFactor=(((intLivesImprovedMax-intLivesImprovedMin)/2)/self.vars.data.scenario.greensalesstep);
			//console.log(' - intSalesFactor: '+intSalesFactor+' - intGreenSalesFactor: '+intGreenSalesFactor);

			//use modulus to calculate the delta (precentage that the slider has moved from the "minimal" position)
			var intSalesDelta=Math.abs(intCurrentSalesPercentage % self.vars.data.scenario.salesstep);
			var intGreenSalesDelta=Math.abs(intCurrentGreenSalesPercentage % self.vars.data.scenario.greensalesstep);
			//console.log('intSalesDelta: '+intSalesDelta+' - intGreenSalesDelta: '+intGreenSalesDelta);

			//calculate the lives improved number
			intLivesImprovedSimulated=intLivesImprovedMin+(intSalesDelta*intSalesFactor)+(intGreenSalesDelta*intGreenSalesFactor);			
		}

		//check if the new lives improved number is actually a number
		if(isNaN(intLivesImprovedSimulated)==false){
			//get the poplation
			//var strKey=objMruFilter.state.selectedmru+"_"+objOruFilter.state.selectedoruguid;
			var intPopulation=objMap.data[objMruFilter.state.selectedmru+"_"+objOruFilter.state.selectedoruguid].p;

			//calculate the lives improved percentage
			var intLivesImprovedSimulatedPercentage=Math.round((intLivesImprovedSimulated/(intPopulation))*100);

			//console.log(intLivesImprovedSimulatedPercentage);
			//console.log(intLivesImprovedSimulated);

			//overwrite the livesimproved number in the interface

			//console.log(objMap.roundlivesimproveddataobject({l:intLivesImprovedSimulated, g:-1, p: -1}).displayl);

			// UPDATE INTERFACE
			if(self.vars.updatecurrent){
				//use the utility in objMap to round the number in the correct format so that it can be displayed
				self.el.livesimprovednumber.innerHTML=objMap.roundlivesimproveddataobject({l:intLivesImprovedSimulated, g:-1, p: -1}).displayl.replace(/,/, '');

				//set the infographic text
				self.el.livesimprovedpercentage.textContent=intLivesImprovedSimulatedPercentage+'%';

				//update the infographic circle
				applyInfographicDelta((intLivesImprovedSimulatedPercentage*360) /100);	
				
				//set the class in the wrapper div - that will trigger the "up" or "down" icon display
				if(intLivesImprovedSimulated>self.vars.livesimprovedcurrent){
					objRegionInfo.el.wrapper.setAttribute('class', 'more');

				}else{
					if(intLivesImprovedSimulated<self.vars.livesimprovedcurrent){
						objRegionInfo.el.wrapper.setAttribute('class', 'less');
					}else{
						objRegionInfo.el.wrapper.setAttribute('class', 'equal');
					}
				}		
			}

			if(self.vars.updatetrendgraph){
				objTrendGraph.updatelastpointingraph(parseFloat(objMap.roundlivesimproveddataobject({l:intLivesImprovedSimulated, g:-1, p: -1}).displayl.replace(/,/, '')))
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