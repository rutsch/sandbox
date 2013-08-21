/**
 *  Raphaël-ZPD: A zoom/pan/drag plugin for Raphaël.
 * ==================================================
 *
 * This code is licensed under the following BSD license:
 * 
 * Copyright 2010 Daniel Assange <somnidea@lemma.org> (Raphaël integration and extensions). All rights reserved.
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com> (original author). All rights reserved.
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

 /*
Edited bij Johan Thijs to make it compatible with hammer.js and mobile devices
 */


var opts = { zoom: true, pan: true, drag: true }

function initZoomPan(root) {

	var state = 'none', stateTarget, stateOrigin, stateTf;


	//setup event handlers
	if(objPageVars.mobile){
		//finetune hammer object
		Hammer.gestures.Drag.defaults.drag_min_distance=1;
		Hammer.gestures.Drag.defaults.correct_for_drag_min_distance=true;

		//setup a hammer object for the svg worldmap
		objPageVars.hammersvg = Hammer(document.getElementById("holder_1000"), {
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
		setupHandlersDesktop(root);
	}
	


	var elViewport=document.getElementById("viewport");
	var bolDragging=false;
	//for scale/pinch on mobile
	var pinchRemembered=1;
	var mode="zoomin";
	var svgSizeXOriginal=null;
	var svgSizeYOriginal=null;
	var svgSizeXMax=null;
	var svgSizeXMin=null;
	var maxZoom=7, minZoom=0.3;
	var timer1, timer2;





	/**
	 * Handler registration
	 */
	function setupHandlersDesktop(root){
		root.onmousedown = handleMouseDown;
		root.onmousemove = handleMouseMove;
		root.onmouseup = handleMouseUp;
		//root.onmouseout = handleMouseUp; // Decomment this to stop the pan functionality when dragging out of the SVG element

		if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0){
			window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
		}else{
			window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
		}
		
		//root.onclick = handleClick;

	}



	function setupHandlersMobile(){
		debugger;
		//console.log('setupHandlersMobile')
		//a few "cheap" tricks to work around the tap-issue (sometimes you need to tap twice to trigger the event...)
	    objPageVars.hammersvg.on("dragstart", function(ev) {
	        //if(window.console) { console.log(ev); }
	        bolDragging=true;
	        
	        if(timer1)clearTimeout(timer1);
	        timer1=setTimeout(function(){
	        	bolDragging=false;
	        },500);

	        handleMouseDown(ev);
	    });
	    objPageVars.hammersvg.on("drag", function(ev) {
	        //if(window.console) { console.log(ev); }
	        handleMouseMove(ev);
	    });		    
	    objPageVars.hammersvg.on("dragend release", function(ev) {
	        //if(window.console) { console.log(ev); }
	        handleMouseUp(ev);
	    });	
	    objPageVars.hammersvg.on("pinch", function(ev) {
	        //if(window.console) { console.log(ev); }
	        bolDragging=true;

			if(timer1)clearTimeout(timer1);
	        timer1=setTimeout(function(){
	        	bolDragging=false;
	        },500);

	        handlePinch(ev);
	    });	
	   	objPageVars.hammersvg.on("touch", function(ev) {
	   		//if(window.console) { console.log(ev); }
	   		//alert('test');
	   		//storeOriginal(ev);
	   		timer2=setTimeout(function(){
	   			if(!bolDragging)handleClick(ev);
	   			bolDragging=false;
	   		},300)
			
	    });	
	    /*		    
	    objPageVars.hammersvg.on("pinchin", function(ev) {
	        if(window.console) { console.log(ev); }
	        handlePinchIn(ev);
	    });	
	    objPageVars.hammersvg.on("pinchout", function(ev) {
	        if(window.console) { console.log(ev); }
	        handlePinchOut(ev);
	    });
	    */			    
	}

	/**
	 * Instance an SVGPoint object with given event coordinates.
	 */
	function getEventPoint(evt) {
		var p = root.createSVGPoint();


		if(objPageVars.mobile){
			p.x = evt.gesture.center.pageX;
			p.y = evt.gesture.center.pageY;
		}else{
			p.x = evt.clientX;
			p.y = evt.clientY;			
		}

		return p;
	}

	/**
	 * Sets the current transform matrix of an element.
	 */
	function setCTM(element, objSvgProperties) {

		var bolUseStringMethod=false;

		if(bolUseStringMethod){
			/* string method */
			//var strTransformValue='translate('+objSvgProperties['translatex']+', '+objSvgProperties['translatey']+') scale('+objSvgProperties['scale']+')';
			var strTransformValue='matrix('+objSvgProperties.a+',0,0,'+objSvgProperties.a+','+objSvgProperties.e+','+objSvgProperties.f+')';
			element.setAttributeNS( null, 'transform', strTransformValue);
		}else{
			/* native method */
			//set the new values for the transform matrix
			/*
			objSvgProperties.transformmatrix.a=objSvgProperties.a;
			objSvgProperties.transformmatrix.b=0;
			objSvgProperties.transformmatrix.c=0;
			objSvgProperties.transformmatrix.d=objSvgProperties.scale;
			objSvgProperties.transformmatrix.e=objSvgProperties.translatex;
			objSvgProperties.transformmatrix.f=objSvgProperties.translatey;

			//console.log(objSvgProperties.transformmatrix);
			*/
			//someitem.ownerSVGElement.createSVGTransformFromMatrix(m)
			var svgTransform=element.ownerSVGElement.createSVGTransformFromMatrix(objSvgProperties);
			//console.log(bla);

			element.transform.baseVal.initialize(svgTransform);
		}


		//var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

		//element.setAttribute("transform", s);
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
		for (i in attributes)
			element.setAttributeNS(null, i, attributes[i]);
	}

	/**
	 * Handle mouse click event.
	 */
	 function handleClick(evt, el){
   		//get the id of the clicked element - that corresponds to the country that the user has clicked on
   		var idCountry="";
   		debugger;
   		if(objPageVars.mobile){
			var elSvg=evt.srcElement;
			var elParent=elSvg.parentNode;
			if(elParent.nodeName!='svg'){
				idCountry=elSvg.parentNode.id;
				if(idCountry == '' || idCountry == null){
					idCountry=elSvg.id;
				}
				countryClicked(idCountry);
			}
   		}else{
   			//console.log(evt);
   			//console.log(el);
   		}
   		//debugger;
   		//console.log(evt);
   		

	 }

	/**
	 * Handle mouse move event.
	 */
	function handleMouseWheel(evt) {
		if (!opts.zoom) return;

		if(evt.preventDefault)
			evt.preventDefault();

		evt.returnValue = false;

		

		var delta;

		if(evt.wheelDelta)
			delta = evt.wheelDelta / 3600; // Chrome/Safari
		else
			delta = evt.detail / -90; // Mozilla

		var z = 1 + delta; // Zoom factor: 0.9/1.1

		//console.log('zoom factor z:'+z+' delta:'+delta);

		zoomSvg(evt, z);
	}


	function handlePinch(evt){
		//console.log(evt.gesture.scale);
		var z=evt.gesture.scale;
		var zOriginal=z;
		var debugPinchRemembered=pinchRemembered;

		//store the original size of the svg
		var rect = elViewport.getBoundingClientRect(); // get the bounding rectangle
		if(svgSizeXOriginal==null && svgSizeYOriginal==null){
			//console.log( rect.width );
			//console.log( rect.height);
			svgSizeXOriginal=rect.width;
			svgSizeYOriginal=rect.height;

			svgSizeXMax=svgSizeXOriginal*maxZoom;
			svgSizeXMin=svgSizeXOriginal*minZoom;
		}



		//only execute any zooming when the fingers have reached a new position...
		if(z!=pinchRemembered){
			if(z < pinchRemembered)mode="zoomout";
			if(z >= pinchRemembered)mode="zoomin";
			//zoomout

			if(mode=="zoomout" && z>=1)z=1-(1-z);
			if(mode=="zoomin" && z<1)z=1+(1-z);

			pinchRemembered=zOriginal;

			//console.log(mode);

			if(z>1.05)z=1.05;
			if(z<0.95)z=0.95;

			//console.log('* mode: '+mode+' zOriginal:'+zOriginal+' z:'+z+' pinchRemembered:'+debugPinchRemembered);
			
			//logic to determine if we can zoom any further
			var bolExecuteZoom=true;
			if((rect.width > svgSizeXMax) && mode=="zoomin")bolExecuteZoom=false;
			if((rect.width < svgSizeXMin) && mode=="zoomout")bolExecuteZoom=false;

			if(bolExecuteZoom)zoomSvg(evt, z);
		}

	}

	//obsolete
	function handlePinchIn(evt){
		//console.log('pinchin');
		var scale=evt.gesture.scale;
		//console.log(scale);
		var zCorrected=scale;
		//zCorrected=2.05;
		//console.log(zCorrected);

		if(zCorrected > 1.05){
			zCorrected = 1.05;
		}else{
			if(zCorrected < 0.95){
				zCorrected = 0.95;
			}
		}
		

		//console.log(zCorrected);
		zoomSvg(evt, zCorrected);
	}

	//obsolete
	function handlePinchOut(evt){
		//console.log('pinchout');
		var scale=evt.gesture.scale;
		//console.log(scale);
		var zCorrected=scale;

		//console.log(zCorrected);

		if(scale > 1.05){
			zCorrected = 1.05;
		}else{
			if(scale < 0.95){
				zCorrected = 0.95;
			}
		}
			

		//console.log(zCorrected);
		zoomSvg(evt, zCorrected);
	}

	function zoomSvg(evt, z){
		//console.log('z: '+z);
		var g, svgDoc;
		if(objPageVars.mobile){
			var g = elViewport;
		}else{
			var svgDoc = evt.target.ownerDocument;
			var g = svgDoc.getElementById("viewport");
		}
		
		var p = getEventPoint(evt);
		//console.log(p)

		p = p.matrixTransform(g.getCTM().inverse());
		//console.log(p)

		// Compute new scale matrix in current mouse position
		var k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

		setCTM(g, g.getCTM().multiply(k));

		if(typeof(stateTf) == "undefined")
			stateTf = g.getCTM().inverse();

		stateTf = stateTf.multiply(k.inverse());

	}

	/**
	 * Handle mouse move event.
	 */
	function handleMouseMove(evt) {
		//preventDefault is handled by hammer
		if(!objPageVars.mobile){
			if(evt.preventDefault)evt.preventDefault();
		}
		
		evt.returnValue = false;

		var g, svgDoc;
		if(objPageVars.mobile){
			var g = elViewport;
		}else{
			var svgDoc = evt.target.ownerDocument;
			var g = svgDoc.getElementById("viewport");
		}

		//console.log(state);
		//console.log(opts)
		state='pan';
		if(state == 'pan') {
			// Pan mode
			if (!opts.pan) return;


			var p = getEventPoint(evt).matrixTransform(stateTf);
			setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));

		} else if(state == 'move') {
			// Move mode
			if (!opts.drag) return;

			var p = getEventPoint(evt).matrixTransform(g.getCTM().inverse());

			setCTM(stateTarget, root.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));

			stateOrigin = p;
		}
	}

	/**
	 * Handle click event.
	 */
	function handleMouseDown(evt) {
		//preventDefault is handled by hammer
		if(!objPageVars.mobile){
			if(evt.preventDefault)evt.preventDefault();
		}

		evt.returnValue = false;

		var g, svgDoc;
		if(objPageVars.mobile){
			var g = elViewport;
		}else{
			var svgDoc = evt.target.ownerDocument;
			var g = svgDoc.getElementById("viewport");
		}

		//stateTf = g.getCTM().inverse();
		//stateOrigin = getEventPoint(evt).matrixTransform(stateTf);		

		if(evt.target.tagName == "svg" || !opts.drag) {
			// Pan mode
			if (!opts.pan) return;
			stateTf = g.getCTM().inverse();
			stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
			state = 'pan';
		} else {
			// Move mode
			if (!opts.drag || evt.target.draggable == false) return;
			stateTf = g.getCTM().inverse();
			stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
			state = 'move';
		}
	}

	/**
	 * Handle mouse button release event.
	 */
	function handleMouseUp(evt) {
		//preventDefault is handled by hammer
		if(!objPageVars.mobile){
			if(evt.preventDefault)evt.preventDefault();
		}

		evt.returnValue = false;

		if((state == 'pan' && opts.pan) || (state == 'move' && opts.drag)) {
			// Quit pan mode
			state = '';
		}

		//pinchRemembered=1;
	}

	function storeOriginal(evt){
		var g, svgDoc;
		if(objPageVars.mobile){
			var g = elViewport;
		}else{
			var svgDoc = evt.target.ownerDocument;
			var g = svgDoc.getElementById("viewport");
		}

		stateTf = g.getCTM().inverse();
		stateOrigin = getEventPoint(evt).matrixTransform(stateTf);	
	}
}


