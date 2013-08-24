function initSimulator(objSimulatorData){
	//alert(JSON.stringify(objSimulatorData));

	//reset data
	objPageElements.elslidersales.value=0;
	objPageElements.elslidergreensales.value=0;
	objPageVars.slidersalesvalue=0;
	objPageVars.slidergreensalesvalue=0;

	objPageVars.simulatordata=objSimulatorData;

	//store the current lives improved number
	objPageVars.livesimprovedcurrent=parseInt(objPageElements.ellivesimprovednumber.innerHTML);

	//set the values min/max for the slider labels
	getEl('salesmin').innerHTML=objPageVars.simulatordata.scenario.salesmin;
	getEl('salesmax').innerHTML=objPageVars.simulatordata.scenario.salesmax;
	getEl('greensalesmin').innerHTML=objPageVars.simulatordata.scenario.greensalesmin;
	getEl('greensalesmax').innerHTML=objPageVars.simulatordata.scenario.greensalesmax;

	//set the min and max values on the input nodes
	objPageElements.elslidersales.setAttribute('min', objPageVars.simulatordata.scenario.salesmin);
	objPageElements.elslidersales.setAttribute('max', objPageVars.simulatordata.scenario.salesmax);
	objPageElements.elslidergreensales.setAttribute('min', objPageVars.simulatordata.scenario.greensalesmin);
	objPageElements.elslidergreensales.setAttribute('max', objPageVars.simulatordata.scenario.greensalesmax);

	//position the "0" label
	//objPageVars.simulatordata.scenario.salesmin=-30;
	var intLeftSales=(-objPageVars.simulatordata.scenario.salesmin)/(-objPageVars.simulatordata.scenario.salesmin+objPageVars.simulatordata.scenario.salesmax)*100+1;
	var intLeftGreensales=(-objPageVars.simulatordata.scenario.salesmin)/(-objPageVars.simulatordata.scenario.salesmin+objPageVars.simulatordata.scenario.salesmax)*100+1;
	getEl('saleszero').style.left=intLeftSales+'%';
	getEl('greensaleszero').style.left=intLeftGreensales+'%';
	//objPageElements.elslidersaleslabel

	//show the interface
	showSimulatorInterface();
	objPageVars.simulatorsampling=true;
	executeSliderSampling();
}

//samples the values of the sliders cand calls the simulator routine if they change
function executeSliderSampling(){
	//retrieve the values of the sliders
	var intCurrentSalesPercentage=objPageElements.elslidersales.value;
	var intCurrentGreenSalesPercentage=objPageElements.elslidergreensales.value;

	//only call the simulator update if the values of the sliders have changed...
	if(intCurrentSalesPercentage!=objPageVars.slidersalesvalue || intCurrentGreenSalesPercentage!=objPageVars.slidergreensalesvalue){
		simulatorCalculateValue(intCurrentSalesPercentage, intCurrentGreenSalesPercentage);
	}
	

	objPageVars.slidersalesvalue=Math.round(intCurrentSalesPercentage*10)/10;
	objPageVars.slidergreensalesvalue=Math.round(intCurrentGreenSalesPercentage*10)/10;

	//if(objPageVars.timersimulator)clearTimeout(objPageVars.timersimulator);

	//calls itself...
	if(objPageVars.simulatorsampling){
		objPageVars.timersimulator=setTimeout(function(){
			executeSliderSampling();
		},100);		
	}
}

//updates the user interface with the new values for livesimproved
function simulatorCalculateValue(intCurrentSalesPercentage, intCurrentGreenSalesPercentage){
	//console.log('in simulatorCalculateValue with sales: '+intCurrentSalesPercentage+' and green sales: '+intCurrentGreenSalesPercentage);

	//update the lables of the sliders
	objPageElements.elslidersaleslabel.innerHTML=(intCurrentSalesPercentage > 0 ? '+': '') + intCurrentSalesPercentage + '%';
	objPageElements.elslidergreensaleslabel.innerHTML=(intCurrentGreenSalesPercentage > 0 ? '+': '') + intCurrentGreenSalesPercentage + '%';

	//encode the retieved values so that we can find them in the simululator data
	var intSalesMin, intGreenSalesMin, intSalesMax, intGreenSalesMax;
	intCurrentSalesPercentage=parseFloat(intCurrentSalesPercentage, 10);
	intCurrentGreenSalesPercentage=parseFloat(intCurrentGreenSalesPercentage, 10);


	intSalesMin=Math.floor((intCurrentSalesPercentage+0.00001)/objPageVars.simulatordata.scenario.salesstep)*objPageVars.simulatordata.scenario.salesstep
	//console.log(intSalesTemp)
	intGreenSalesMin=Math.floor((intCurrentGreenSalesPercentage+0.00001)/objPageVars.simulatordata.scenario.greensalesstep)*objPageVars.simulatordata.scenario.greensalesstep
	//console.log(intGreenSalesTemp)
	var strKeyMin='s'+(intSalesMin+'').replace(/-/, 'minus')+'g'+(intGreenSalesMin+'').replace(/-/, 'minus');
	//console.log(strKeyMin);

	intSalesMax=Math.ceil((intCurrentSalesPercentage+0.000001)/objPageVars.simulatordata.scenario.salesstep)*objPageVars.simulatordata.scenario.salesstep
	//console.log(intSalesTemp)
	intGreenSalesMax=Math.ceil((intCurrentGreenSalesPercentage+0.000001)/objPageVars.simulatordata.scenario.greensalesstep)*objPageVars.simulatordata.scenario.greensalesstep
	//console.log(intGreenSalesTemp)
	var strKeyMax='s'+(intSalesMax+'').replace(/-/, 'minus')+'g'+(intGreenSalesMax+'').replace(/-/, 'minus');
	//console.log(strKeyMax);

	//attempt to find the values in the associative array
	var intLivesImprovedMax=null, intLivesImprovedMin=null;
	if(objPageVars.simulatordata.livesimproved[strKeyMin]){
	    intLivesImprovedMin=objPageVars.simulatordata.livesimproved[strKeyMin];
	}
	if(objPageVars.simulatordata.livesimproved[strKeyMax]){
	    intLivesImprovedMax=objPageVars.simulatordata.livesimproved[strKeyMax];
	}

	console.log('intLivesImprovedMin: '+intLivesImprovedMin+' - intLivesImprovedMax: '+intLivesImprovedMax);

	//assume both sliders have the same influence
	var intDelta=intLivesImprovedMax-intLivesImprovedMin;
	var intFactor=intDelta/(objPageVars.simulatordata.scenario.salesstep+objPageVars.simulatordata.scenario.greensalesstep);
	var intSalesFactor=intFactor*objPageVars.simulatordata.scenario.salesstep;
	var intGreenSalesFactor=intFactor*objPageVars.simulatordata.scenario.greensalesstep;
	//console.log('intDelta: '+intDelta+' - intFactor: '+intFactor+' - intSalesFactor: '+intSalesFactor+' - intGreenSalesFactor: '+intGreenSalesFactor);
	var intSalesDelta=0;
	//intSalesDelta=(intCurrentSalesPercentage-intSalesMin/objPageVars.simulatordata.scenario.salesstep);

	if(intCurrentGreenSalesPercentage>0)intSalesDelta=(intCurrentSalesPercentage-intSalesMin/objPageVars.simulatordata.scenario.salesstep);
	if(intCurrentGreenSalesPercentage<0)intSalesDelta=((0-intSalesMin)-(0-intCurrentSalesPercentage))/objPageVars.simulatordata.scenario.salesstep;


	var intGreenSalesDelta=0;
	//intGreenSalesDelta=(intCurrentGreenSalesPercentage/intGreenSalesMax);
	if(intCurrentGreenSalesPercentage>0)(intCurrentGreenSalesPercentage-intGreenSalesMin/objPageVars.simulatordata.scenario.greensalesstep);
	if(intCurrentGreenSalesPercentage<0)intGreenSalesDelta=((0-intGreenSalesMin)-(0-intCurrentGreenSalesPercentage))/objPageVars.simulatordata.scenario.greensalesstep;

	//console.log('intCurrentSalesPercentage: '+intCurrentSalesPercentage+' - intCurrentGreenSalesPercentage: '+intCurrentGreenSalesPercentage);
	//console.log('intSalesMin: '+intSalesMin+' - intGreenSalesMin: '+intGreenSalesMin+' - intSalesDelta: '+intSalesDelta+' - intGreenSalesDelta: '+intGreenSalesDelta);

	var intLivesImprovedSimulated=intLivesImprovedMin+(intSalesDelta*intSalesFactor)+(intGreenSalesDelta*intGreenSalesFactor);

	//get the poplation
	var strKey=objPageVars["current_mru"]+"_"+objPageVars["current_region"];
	var intPopulation=objPageVars.worldmapdata[strKey].p;

	var intLivesImprovedSimulatedPercentage=Math.round((intLivesImprovedSimulated/(intPopulation*1000000))*100);

	console.log(intLivesImprovedSimulatedPercentage);

	console.log(intLivesImprovedSimulated);

	//overwrite the livesimproved number in the interface
	objPageElements.ellivesimprovednumber.innerHTML=Math.round(intLivesImprovedSimulated/1000000);

	//set the infographic
	objPageElements.ellivesimprovedpercentage.textContent=intLivesImprovedSimulatedPercentage+'%';
	//animateArc({start: objPageVars.infographicangle, end: (intLivesImprovedSimulatedPercentage*360) /100}, 0.1);	

	generateArc({
		targetnode: objArcProps.targetnode,
		centerx: objArcProps.centerx,
		centery: objArcProps.centery,
		radius: objArcProps.radius,
		angle: (intLivesImprovedSimulatedPercentage*360) /100
	});

	if(intLivesImprovedSimulated>objPageVars.livesimprovedcurrent){
		objPageElements.ellivesimprovednumberwrapper.setAttribute('class', 'more');

	}else{
		if(intLivesImprovedSimulated<objPageVars.livesimprovedcurrent){
			objPageElements.ellivesimprovednumberwrapper.setAttribute('class', 'less');
		}else{
			objPageElements.ellivesimprovednumberwrapper.setAttribute('class', 'equal');
		}
	}



}


function showSimulatorInterface(){
	TweenLite.to(getEl('simulation_wrapper'), 0.2, {
		opacity: 1
	});


}

