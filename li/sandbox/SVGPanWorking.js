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
	if(objPageVars.mobile){
		//finetune hammer object

		console.log('setting up for mobile');
		//finetune hammer object
		Hammer.gestures.Drag.defaults.drag_min_distance=1;
		Hammer.gestures.Drag.defaults.correct_for_drag_min_distance=true;

		//setup a hammer object for the svg worldmap
		objPageVars.hammersvg = Hammer(objPageElements.toucharea, {
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
 * Register handlers
 */
function setupHandlersDesktop(){
	setAttributes(objTouchVars.elsvg, {
		"onmouseup" : "handleMouseUp(evt)",
		"onmousedown" : "handleMouseDown(evt)",
		"onmousemove" : "handleMouseMove(evt)",
		//"onmouseout" : "handleMouseUp(evt)", // Decomment this to stop the pan functionality when dragging out of the SVG element
	});

	if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
		window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
	else
		window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
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
 * Instance an SVGPoint object with given event coordinates.
 */
function getEventPoint(evt) {
	var p = objTouchVars.elsvg.createSVGPoint();

	p.x = evt.clientX-objTouchVars.svgx;
	p.y = evt.clientY-objTouchVars.svgy;

	return p;
}

/**
 * Sets the current transform matrix of an element.
 */
function setCTM(element, matrix) {
	var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

	element.setAttribute("transform", s);
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

/**
 * Handle mouse wheel event.
 */
function handleMouseWheel(evt) {
	if(!objZoomPanSettings.zoom)
		return;

	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	var delta;

	if(evt.wheelDelta)
		delta = evt.wheelDelta / 360; // Chrome/Safari
	else
		delta = evt.detail / -9; // Mozilla

	var z = Math.pow(1 + objZoomPanSettings.zoomscale, delta);

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
 * Handle mouse move event.
 */
function handleMouseMove(evt) {
	if(evt.preventDefault)
		evt.preventDefault();

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
}

/**
 * Handle click event.
 */
function handleMouseDown(evt) {
	if(evt.preventDefault)
		evt.preventDefault();

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
 * Handle mouse button release event.
 */
function handleMouseUp(evt) {
	if(evt.preventDefault)
		evt.preventDefault();

	evt.returnValue = false;

	var svgDoc = evt.target.ownerDocument;

	if(objTouchVars.state == 'pan' || objTouchVars.state == 'drag') {
		// Quit pan mode
		objTouchVars.state = '';
	}
}

