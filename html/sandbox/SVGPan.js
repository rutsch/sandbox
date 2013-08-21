/** 
 *  SVGPan library 1.2.2
 * ======================
 *
 * Given an unique existing element with id "viewport" (or when missing, the 
 * first g-element), including the the library into any SVG adds the following 
 * capabilities:
 *
 *  - Mouse panning
 *  - Mouse zooming (using the wheel)
 *  - Object dragging
 *
 * You can configure the behaviour of the pan/zoom/drag with the variables
 * listed in the CONFIGURATION section of this file.
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Safari has still some issues
 *
 * Releases:
 *
 * 1.2.2, Tue Aug 30 17:21:56 CEST 2011, Andrea Leofreddi
 *	- Fixed viewBox on root tag (#7)
 *	- Improved zoom speed (#2)
 *
 * 1.2.1, Mon Jul  4 00:33:18 CEST 2011, Andrea Leofreddi
 *	- Fixed a regression with mouse wheel (now working on Firefox 5)
 *	- Working with viewBox attribute (#4)
 *	- Added "use strict;" and fixed resulting warnings (#5)
 *	- Added configuration variables, dragging is disabled by default (#3)
 *
 * 1.2, Sat Mar 20 08:42:50 GMT 2010, Zeng Xiaohui
 *	Fixed a bug with browser mouse handler interaction
 *
 * 1.1, Wed Feb  3 17:39:33 GMT 2010, Zeng Xiaohui
 *	Updated the zoom code to support the mouse wheel on Safari/Chrome
 *
 * 1.0, Andrea Leofreddi
 *	First release
 *
 * This code is licensed under the following BSD license:
 *
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com>. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 */

"use strict";

/// CONFIGURATION 
/// ====>

var objZoomPanSettings={
	pan: 1, // 1 or 0: enable or disable panning (default enabled)
	zoom: 1, // 1 or 0: enable or disable zooming (default enabled)
	drag: 0, // 1 or 0: enable or disable dragging (default disabled)
	zoomscale: 0.2, // Zoom sensitivity
	mobile: false
}

//settings for the touch system
var objTouchSettings={
	debug: true,
	debugtoconsole: true,
	debugtointerface: true,
	zoommax: 5,
	zoommin: 0.2
}

/// <====
/// END OF CONFIGURATION 


var objTouchVars={
	dragging: false,
	timer1: null,
	timer2: null,
	timer3: null,
	timer4: null,
	zoom: 1,
	zoomworking: 1,
	fingerx: null,
	fingery: null,
	deltax: 0,
	deltay: 0,
	deltaxremembered: 0,
	deltayremembered: 0,
	pinchsize: 0,
	pinchscale: 1,
	sampling: false,
	action: '',
	ctmorig: null,

	state: 'none',
	elsvg: null,
	elanimate: null,
	eldragtarget: null,
	svgpointorigin: null,
	svgmatrix: null,
	svgx: 0,
	svgy: 0
}

function initSgvZoomPan(elSvgRoot, elSvgNodeToAnimate){
	//set the svg root
	objTouchVars.elsvg=elSvgRoot;

	//this function sets the svg node to animate and does some viewport magic
	getRoot(elSvgNodeToAnimate);

	//retrieve the position of the svg element
	var arrPos=retrievePosition(elSvgRoot);
	objTouchVars.svgx=arrPos[0];
	objTouchVars.svgy=arrPos[1];

	//setup the handlers
	setupHandlers(elSvgRoot);

	function retrievePosition(obj) {
		var curleft = 0, curtop = 0;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
		}
		return [curleft,curtop];
	}
}

function setupHandlers(){
	//setup event handlers
	if(objZoomPanSettings.mobile){
		//finetune hammer object

		console.log('setting up for mobile');
		//finetune hammer object
		Hammer.gestures.Drag.defaults.drag_min_distance=1;
		Hammer.gestures.Drag.defaults.correct_for_drag_min_distance=true;

		//setup a hammer object for the svg worldmap
		objPageVars.hammersvg = Hammer(objTouchVars.elsvg, {
			prevent_default: true,
			no_mouseevents: true,
			
			tap: false,
			pinch: true,
			hold: false,
			drag: true,
			swipe: false,
			rotate: false,
			transform: true
		});

		//setup handlers
		setupHandlersMobile();
	}else{
		console.log('setting up for desktop');
		setupHandlersDesktop();
	}	
}



/**
 * Register handlers for desktop
 */
function setupHandlersDesktop(){
	setAttributes(objTouchVars.elsvg, {
		"onmouseup" : "handleClickTouchEnd(evt)",
		"onmousedown" : "handleClickTouchStart(evt)",
		"onmousemove" : "handleDrag(evt)",
		//"onmouseout" : "handleClickTouchEnd(evt)", // Decomment this to stop the pan functionality when dragging out of the SVG element
	});

	if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
		window.addEventListener('mousewheel', handleZoomDesktop, false); // Chrome/Safari
	else
		window.addEventListener('DOMMouseScroll', handleZoomDesktop, false); // Others
}



function setupHandlersMobile(){
	//a few "cheap" tricks to work around the tap-issue (sometimes you need to tap twice to trigger the event...)

	objPageVars.hammersvg.on("dragstart", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
		}
		objTouchVars.dragging=true;
		
		if(objTouchVars.timer1)clearTimeout(objTouchVars.timer1);
		objTouchVars.timer1=setTimeout(function(){
			objTouchVars.dragging=false;
		},500);

		handleClickTouchStart(ev);
	});
	objPageVars.hammersvg.on("drag", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
		}

		objTouchVars.dragging=true;
		
		handleDrag(ev);
	});		    
	objPageVars.hammersvg.on("dragend release", function(ev) {
		//if(window.console) { console.log(ev); }
		//handleClickTouchEnd(ev);
	});
	

	objPageVars.hammersvg.on("touch", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
		}
		
		objTouchVars.timer2=setTimeout(function(){
			if(!objTouchVars.dragging)handleClick(ev);
			objTouchVars.dragging=false;
		},300)
		
	});


	objPageVars.hammersvg.on("pinch", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			if(window.console) { console.log(ev); }
			console.log('pinch');
		}

		objTouchVars.dragging=true;

		if(objTouchVars.timer1)clearTimeout(objTouchVars.timer1);
		objTouchVars.timer1=setTimeout(function(){
			objTouchVars.dragging=false;
		},500);

		handleZoomMobile(ev);
	});		    
	objPageVars.hammersvg.on("pinchin", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
		}

	});	
	objPageVars.hammersvg.on("pinchout", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
		}

	});

	//check how we can switch off hammer events to save CPU calculation
	objPageVars.hammersvg.on("hold", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
			console.log('hold');
		}
	});		    
	

	objPageVars.hammersvg.on("swipe", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
			console.log('swipe');
		}
	});	

	objPageVars.hammersvg.on("tap", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
			console.log('tap');
		}
	});		    
	
	objPageVars.hammersvg.on("doubletap", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
			console.log('doubletap');
		}
	});		    
	
	objPageVars.hammersvg.on("transform", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
			console.log('transform');
		}
	});		    
	objPageVars.hammersvg.on("rotate", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
			//console.log('rotate');
		}
	});		    
	objPageVars.hammersvg.on("release", function(ev) {
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			//if(window.console) { console.log(ev); }
			console.log('release');
		}
		handleRelease(ev)
	});		    
					
}


function handleClick(ev){



}


function handleRelease(ev){

	//in case of pinch: remember the reached zoomlevel
	if(objTouchVars.action.indexOf('zoom') > -1){
		objTouchVars.zoom=objTouchVars.zoomworking;
		objTouchVars.pinchscale=1;
		//objTouchVars.zoomworking=1;
		clearTimeout(objTouchVars.timer3);
	}

	if(objTouchVars.action='drag'){
		objTouchVars.zoom=objTouchVars.zoomworking;
		objTouchVars.deltax=0;
		objTouchVars.deltay=0;
		objTouchVars.deltaxremembered=0;
		objTouchVars.deltayremembered=0;

		objTouchVars.dragging=false;


		clearTimeout(objTouchVars.timer3);
	}

	//stop the sampling
	objTouchVars.sampling=false;

	//reset the variables
	objTouchVars.fingerx=null;
	objTouchVars.fingery=null;
	objTouchVars.action='';
	objTouchVars.ctmorig=null;
	debugLog();

	handleClickTouchEnd(ev);
}







/**
 * Instance an SVGPoint object with given event coordinates.
 */
function getEventPoint(evt) {
	var p = objTouchVars.elsvg.createSVGPoint();

	if(objZoomPanSettings.mobile){
		p.x = evt.gesture.center.pageX-objTouchVars.svgx;
		p.y = evt.gesture.center.pageY-objTouchVars.svgy;
	}else{
		p.x = evt.clientX-objTouchVars.svgx;
		p.y = evt.clientY-objTouchVars.svgy;			
	}



	return p;
}



/**
 * Handle zoom.
 */
function handleZoomMobile(ev){

	//set the action parameter
	if(objTouchVars.pinchscale!=ev.gesture.scale){
		//console.log('in');
		if(ev.gesture.scale>objTouchVars.pinchscale){
			objTouchVars.action='zoomin';
		}else{
			objTouchVars.action='zoomout';
		}

	}else{
		objTouchVars.action='zoom';
	}

	
	//capture the center of the pinch effect
	objTouchVars.fingerx=ev.gesture.startEvent.center.pageX;
	objTouchVars.fingery=ev.gesture.startEvent.center.pageY;

	//calculate a new zoom level and assure that this stays within limits
	var intOldZoomLevel=objTouchVars.zoomworking;
	var intNewZoomLevel=objTouchVars.zoom*ev.gesture.scale;

	//var intZoomDelta=1-(intOldZoomLevel-intNewZoomLevel);
	var intZoomDelta=1-(objTouchVars.pinchscale-ev.gesture.scale);
	console.log(intZoomDelta);

	/*
	if(intNewZoomLevel<=objTouchSettings.zoommax && intNewZoomLevel>=objTouchSettings.zoommin){
		objTouchVars.zoomworking=objTouchVars.zoom*ev.gesture.scale;
	}else{
		if(intNewZoomLevel>=1){
			objTouchVars.zoomworking=objTouchSettings.zoommax;
			intZoomDelta=1;
		}else{
			objTouchVars.zoomworking=objTouchSettings.zoommin;
			intZoomDelta=1;
		}
	}
	*/
	//store the scale mode
	objTouchVars.pinchscale=ev.gesture.scale;


	if(objTouchSettings.debug && objTouchSettings.debugtointerface){
		debugLog();
	}

	handleZoom(ev, intZoomDelta);
	/*
	//start the sampling
	if(!objTouchVars.sampling){
		if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
			console.log('!!! start the pinch sampling process !!!');
		}
		objTouchVars.sampling=true;
		objTouchVars.timer4=setTimeout(function(){
			startPinchSampling();
		},50);
	}
	*/
}


function handleZoomDesktop(evt){
	if(!objZoomPanSettings.zoom)return;

	//preventDefault is handled by hammer
	if(!objZoomPanSettings.mobile){
		if(evt.preventDefault)evt.preventDefault();
	}

	evt.returnValue = false;



	var delta;

	if(evt.wheelDelta)
		delta = evt.wheelDelta / 360; // Chrome/Safari
	else
		delta = evt.detail / -9; // Mozilla

	var z = Math.pow(1 + objZoomPanSettings.zoomscale, delta);

	handleZoom(evt, z);


}


function handleZoom(evt, z) {

	console.log(z);

	var svgDoc = evt.target.ownerDocument;

	var g = getRoot(svgDoc);
	
	var p = getEventPoint(evt);

	p = p.matrixTransform(g.getCTM().inverse());

	// Compute new scale matrix in current mouse position
	var k = objTouchVars.elsvg.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

        setCTM(g, g.getCTM().multiply(k));

	if(objTouchVars.svgmatrix == null)objTouchVars.svgmatrix = g.getCTM().inverse();

	objTouchVars.svgmatrix = objTouchVars.svgmatrix.multiply(k.inverse());
}

/**
 * Handle drag.
 */
function handleDrag(evt) {
	//preventDefault is handled by hammer
	if(!objZoomPanSettings.mobile){
		if(evt.preventDefault)evt.preventDefault();
	}

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	var g = getRoot(svgDoc);

	if(objTouchVars.state == 'pan' && objZoomPanSettings.pan) {
		// Pan mode
		var p = getEventPoint(evt).matrixTransform(objTouchVars.svgmatrix);

		setCTM(g, objTouchVars.svgmatrix.inverse().translate(p.x - objTouchVars.svgpointorigin.x, p.y - objTouchVars.svgpointorigin.y));
	} else if(objTouchVars.state == 'drag' && objZoomPanSettings.drag) {
		// Drag mode
		var p = getEventPoint(evt).matrixTransform(g.getCTM().inverse());

		setCTM(objTouchVars.eldragtarget, objTouchVars.elsvg.createSVGMatrix().translate(p.x - objTouchVars.svgpointorigin.x, p.y - objTouchVars.svgpointorigin.y).multiply(g.getCTM().inverse()).multiply(objTouchVars.eldragtarget.getCTM()));

		objTouchVars.svgpointorigin = p;
	}

	if(objTouchSettings.debug && objTouchSettings.debugtointerface){
		debugLog();
	}	
}

/**
 * Handle click event. (mousedown)
 */
function handleClickTouchStart(evt) {
	//preventDefault is handled by hammer
	if(!objZoomPanSettings.mobile){
		if(evt.preventDefault)evt.preventDefault();
	}

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	var g = getRoot(svgDoc);

	if(
		evt.target.tagName == "svg" 
		|| !objZoomPanSettings.drag // Pan anyway when drag is disabled and the user clicked on an element 
	) {
		// Pan mode
		objTouchVars.state = 'pan';

		objTouchVars.svgmatrix = g.getCTM().inverse();

		objTouchVars.svgpointorigin = getEventPoint(evt).matrixTransform(objTouchVars.svgmatrix);
	} else {
		// Drag mode
		objTouchVars.state = 'drag';

		objTouchVars.eldragtarget = evt.target;

		objTouchVars.svgmatrix = g.getCTM().inverse();

		objTouchVars.svgpointorigin = getEventPoint(evt).matrixTransform(objTouchVars.svgmatrix);
	}
}

/**
 * Handle mouse button release event. (mouseup)
 */
function handleClickTouchEnd(evt) {
	//preventDefault is handled by hammer
	if(!objZoomPanSettings.mobile){
		if(evt.preventDefault)evt.preventDefault();
	}

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	if(objTouchVars.state == 'pan' || objTouchVars.state == 'drag') {
		// Quit pan mode
		objTouchVars.state = '';
	}
}
































/**
 * Retrieves the root element for SVG manipulation. The element is then cached into the svgRoot global variable.
 */
function getRoot(root) {
	if(objTouchVars.elanimate == null) {
		var r = document.getElementById("viewport") ? document.getElementById("viewport") : document.documentElement, t = r;

		while(t != root) {
			if(t.getAttribute("viewBox")) {
				setCTM(r, t.getCTM());

				t.removeAttribute("viewBox");
			}

			t = t.parentNode;
		}

		objTouchVars.elanimate = r;
	}

	return objTouchVars.elanimate;
}

/**
 * Sets the current transform matrix of an element.
 */
function setCTM(elSvg, objSvgProperties){
	var bolUseStringMethod=false;

	if(bolUseStringMethod){
		/* string method */
		elSvg.setAttributeNS( null, 'transform', 'matrix('+objSvgProperties.a+',0,0,'+objSvgProperties.a+','+objSvgProperties.e+','+objSvgProperties.f+')');
	}else{
		/* native method */
		elSvg.transform.baseVal.initialize(elSvg.ownerSVGElement.createSVGTransformFromMatrix(objSvgProperties));
	}
}


/**
 * Dumps a matrix to a string (useful for debug).
 */
function dumpMatrix(matrix) {
	var s = "[ " + matrix.a + ", " + matrix.c + ", " + matrix.e + "\n  " + matrix.b + ", " + matrix.d + ", " + matrix.f + "\n  0, 0, 1 ]";

	return s;
}

/**
 * Sets attributes of an element.
 */
function setAttributes(element, attributes){
	for (var i in attributes)
		element.setAttributeNS(null, i, attributes[i]);
}


function debugLog(){
	var arrContent=[];
	for (var prop in objTouchVars) {
		if(prop != 'timer1' && prop != 'timer2' && prop != 'timer3' && prop != 'timer4'){
			arrContent.push('- '+prop+'='+objTouchVars[prop]);
		}
		
	}

	objPageElements.debugdetails.innerHTML=arrContent.join('<br/>');
}


