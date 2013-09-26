//global properties of the arc to build
var objArcProps={
	targetnode: null,
	targetleftwrapper: null,
	targetleftnode: null,
	centerx: 150,
	centery: 125,
	radius: 100,
	angle: 0,
	anglestored: 0
}

//renders the infographic in the ui
/*
{
	angle: 20,
	initial: true,
	setall: true
}
*/
function renderInfographic(objArgs){
	if(typeof(objArgs.initial)=='undefined')objArgs.initial=true;
	if(typeof(objArgs.setall)=='undefined')objArgs.setall=true;
	
	//generates arc for the main indicator
	generateArc({
		targetnode: objArcProps.targetnode,
		centerx: objArcProps.centerx,
		centery: objArcProps.centery,
		radius: objArcProps.radius,
		leftwrapper: null,
		angle: objArgs.angle
	});	
	
	//generates an arc for the left indicator
	if(objArgs.setall){
		generateArc({
			targetnode: objArcProps.targetleftnode,
			centerx: objArcProps.centerx,
			centery: objArcProps.centery,
			radius: objArcProps.radius,
			leftwrapper: objArcProps.targetleftwrapper,
			angle: (360-objArgs.angle)
		});	
	}
	
	if(objArgs.initial)objArcProps.anglestored=objArgs.angle;
}

function applyInfographicDelta(intAngleNew){
	if(intAngleNew>=objArcProps.anglestored){
		 //build up a new infographic   
		renderInfographic({
			angle: intAngleNew,
			initial: false,
			setall: true
		});
	}else{
		 //only make the main indicator smaller   
		renderInfographic({
			angle: intAngleNew,
			initial: false,
			setall: false
		});        
	}
}

/*
var objArcProperties={
	targetnode: objArcProps.targetnode,
	centerx: objArcProps.centerx,
	centery: objArcProps.centery,
	radius: objArcProps.radius,
	leftwrapper: objArcProps.targetleftwrapper,
	angle: 0
}
*/
function generateArc(objArgs){

	//correction for the angle and to make sure 360 works
	var intAngle=360-objArgs.angle;
	if(intAngle<=0)intAngle=0.1;
	
	//
	//to create maximum performance on mobile i have not centralized the calculation in a function, but repeated the logic several times...
	//also i avoided string contatination in favor of using arrays and join()
	//

	// M endx endy A 25 25 0 (0|1) 0 startx starty
	var arrAttrValue=[];
	arrAttrValue.push('M ');
	arrAttrValue.push(objArgs.centerx + (objArgs.radius *  Math.cos(((270-intAngle) * Math.PI) / 180.0))+' ');
	arrAttrValue.push(objArgs.centery + (objArgs.radius *  Math.sin(((270-intAngle) * Math.PI) / 180.0))+' A ');
	arrAttrValue.push(objArgs.radius+' '+objArgs.radius+' 0 '+((intAngle<180)?'1':'0')+' 0 ');
	arrAttrValue.push(objArgs.centerx + (objArgs.radius *  Math.cos(((270-0) * Math.PI) / 180.0))+' ');
	arrAttrValue.push(objArgs.centery + (objArgs.radius *  Math.sin(((270-0) * Math.PI) / 180.0)));

	//objPageElements.debuglayer.innerHTML=strAttrValue;
	
	//set the translate option on the wrapper
	if(objArgs.leftwrapper!=null){
		objArgs.leftwrapper.setAttributeNS(null, 'transform', 'rotate('+intAngle+','+objArgs.centerx+','+objArgs.centery+')');
	}

	//set the value of the "d" attribute in the <path/> node
	objArgs.targetnode.setAttributeNS(null, 'd', arrAttrValue.join(''));
}


function animateArc(objArgs, intAnimationDurationInSeconds){
	var objToAnimate={
		angle: objArgs.start
	}

	TweenLite.to(objToAnimate, intAnimationDurationInSeconds, {
		angle: objArgs.end,
		onUpdate: function(){
			//hard coding the centerx, centery and radius boosts performance...

			//main indicator
			generateArc({
				targetnode: objArcProps.targetnode,
				centerx: objArcProps.centerx,
				centery: objArcProps.centery,
				radius: objArcProps.radius,
			    leftwrapper: null,
				angle: objToAnimate.angle
			});	

			//generates an arc for the left indicator
			generateArc({
			    targetnode: objArcProps.targetleftnode,
			    centerx: objArcProps.centerx,
			    centery: objArcProps.centery,
			    radius: objArcProps.radius,
			    leftwrapper: objArcProps.targetleftwrapper,
			    angle: (360-objToAnimate.angle)
			});	


		},
		onComplete: function(){
			//store the final arc in a global variable
			//objPageVars.infographicangle=objArgs.end;
			objArcProps.anglestored=objArgs.end;
		}
	});

}