			/*
			SVG Animation
			*/
			function getEventPoint(evt, root) {
				var p = root.createSVGPoint();
				var bolCorrect=true;

				if(objPageVars.mobile){
					p.x = evt.gesture.center.pageX;
					p.y = evt.gesture.center.pageY;
					if(bolCorrect){
						p.x-objPageElements.rootanimateattributevalues.x;
						//p.y-objPageElements.rootanimateattributevalues.y;
					}
				}else{
					p.x = evt.clientX;
					p.y = evt.clientY;			
				}

				return p;
			}

			//zooms a svg node
			function zoomSvg(elSvg, objSvgProperties, intAnimationDurationInSeconds, objAnimationProperties){
				if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
					if(window.console){
						console.log('in zoomSvg');
						console.log(objSvgProperties);
						console.log(objAnimationProperties);
						
					}

				}

				//console.log(objSvgProperties);
				var bolUseAnimation=false;

				var zoomLevel=objAnimationProperties.zoom;



				//compute new scale matrix in current mouse position
				var pointX=objAnimationProperties.svgpoint.x;
				var pointY=objAnimationProperties.svgpoint.y;
				//var pointXNew=pointX-objAnimationProperties.ctmorig.e;
				//var pointYNew=pointY-objAnimationProperties.ctmorig.f;
				//var matrixCurrent=elSvg.getCTM();
				var matrixCurrent=objAnimationProperties.ctmorig;
				var pointXNew=pointX-matrixCurrent.e;
				var pointYNew=pointY-matrixCurrent.f;
				//var svgMatrixNew = elSvg.ownerSVGElement.createSVGMatrix().translate(pointX, pointY).scale(zoomLevel).translate(-pointXNew, -pointYNew);
				var svgMatrixNew = elSvg.ownerSVGElement.createSVGMatrix().translate(pointX, pointY).scale(zoomLevel).translate(-pointX, -pointY);

				//var svgMatrixNew = elSvg.ownerSVGElement.createSVGMatrix().translate(objAnimationProperties.svgpoint.x, objAnimationProperties.svgpoint.y).scale(zoomLevel).translate(-objAnimationProperties.svgpoint.x, -objAnimationProperties.svgpoint.y);
				
				//var svgMatrixNew = objAnimationProperties.ctmorig.multiply(svgMatrixTemp);

				console.log(svgMatrixNew);
				console.log('---');

				if(bolUseAnimation){
					/* use tweenlite to perform the zoom action */
					TweenLite.to(objSvgProperties, intAnimationDurationInSeconds, {
						translatex: svgMatrixNew.e,
						translatey: svgMatrixNew.f,
						scale: zoomLevel,
						onUpdate: function(){

							svgSetTransform(elSvg, objSvgProperties)

						},
						onComplete: function(){
							//alert('done');
						}
					});

				}else{
					/* set it without animating */
					objSvgProperties.translatex=svgMatrixNew.e;
					objSvgProperties.translatey=svgMatrixNew.f;
					objSvgProperties.scale=zoomLevel;
					svgSetTransform(elSvg, objSvgProperties);
				}


			}









			//pans a svg node
			function panSvg(elSvg, objSvgProperties, intAnimationDurationInSeconds, objAnimationProperties){
				if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
					if(window.console){
						console.log('in panSvg');
						console.log(objSvgProperties);
					}
				}

				//console.log(objSvgProperties);
				var bolUseAnimation=false;
/*
				var svgMatrixNew = objTouchVars.stateTf.inverse().translate(objAnimationProperties.svgpoint.x - objTouchVars.stateOrigin.x, objAnimationProperties.svgpoint.y - objTouchVars.stateOrigin.y);
				console.log(svgMatrixNew);

				//objTouchVars.stateOrigin = svgMatrixNew;
				
			//setCTM(g, );
*/
				objSvgElementProperties.transformmatrix=elSvg.getCTM();

				//calculate the end position of the svg node after pan is done
				var zoomLevel=1;
				//delta...
				var intTranslateX=0;
				//if(objAnimationProperties.deltax!=objTouchVars.deltaxremembered){
					intTranslateX=(objSvgProperties.transformmatrix.e-(objTouchVars.deltaxremembered-objAnimationProperties.deltax));
					
				//}
				objTouchVars.deltaxremembered=objAnimationProperties.deltax;
				
				var intTranslateY=0;
				//if(objAnimationProperties.deltay!=objTouchVars.deltayremembered){

					intTranslateY=(objSvgProperties.transformmatrix.f-(objTouchVars.deltayremembered-objAnimationProperties.deltay));
					
				//}
				objTouchVars.deltayremembered=objAnimationProperties.deltay;

				

				if(bolUseAnimation){
					
					TweenLite.to(objSvgProperties, intAnimationDurationInSeconds, {
						translatex: intTranslateX,
						translatey: intTranslateY,
						scale: zoomLevel,
						onUpdate: function(){

							svgSetTransform(elSvg, objSvgProperties)

						},
						onComplete: function(){
							//alert('done');
						}
					});

				}else{
					
					objSvgProperties.translatex=intTranslateX;
					objSvgProperties.translatey=intTranslateY;
					objSvgProperties.scale=objAnimationProperties.zoom;
					svgSetTransform(elSvg, objSvgProperties);
				}

			}			

			//sets the transform attribute on the passed svg node
			function svgSetTransform(elSvg, objSvgProperties){
				var bolUseStringMethod=false;

				if(bolUseStringMethod){
					/* string method */
					//var strTransformValue='translate('+objSvgProperties['translatex']+', '+objSvgProperties['translatey']+') scale('+objSvgProperties['scale']+')';
					var strTransformValue='matrix('+objSvgProperties.scale+',0,0,'+objSvgProperties.scale+','+objSvgProperties.translatex+','+objSvgProperties.translatey+')';
					elSvg.setAttributeNS( null, 'transform', strTransformValue);
				}else{
					/* native method */
					//set the new values for the transform matrix
					objSvgProperties.transformmatrix.a=objSvgProperties.scale;
					objSvgProperties.transformmatrix.b=0;
					objSvgProperties.transformmatrix.c=0;
					objSvgProperties.transformmatrix.d=objSvgProperties.scale;
					objSvgProperties.transformmatrix.e=objSvgProperties.translatex;
					objSvgProperties.transformmatrix.f=objSvgProperties.translatey;

					//console.log(objSvgProperties.transformmatrix);

					//someitem.ownerSVGElement.createSVGTransformFromMatrix(m)
					var svgTransform=elSvg.ownerSVGElement.createSVGTransformFromMatrix(objSvgProperties.transformmatrix);
					//console.log(bla);

					elSvg.transform.baseVal.initialize(svgTransform);
				}

			}

			//retrieves the svg element properties (typically <g/> element)
			function retrieveSvgElementObject(elSvg){
				objSvgElementProperties={};

				//1- set the current values into the object
				objSvgElementProperties.translatex=0;
				objSvgElementProperties.translatey=0;
				objSvgElementProperties.scale=1;				
				
				//2- position of the element in the browser
				var arrPosition=findPos(elSvg.ownerSVGElement);
				objSvgElementProperties.x=arrPosition[0];
				objSvgElementProperties.y=arrPosition[1];
				
				//3- store the attributes of the svg node into the object too
				for (var attr, i=0, attrs=objPageElements.rootanimate.attributes, l=attrs.length; i<l; i++){
					attr = attrs.item(i);
					//alert(attr.nodeName);
					if(attr.nodeName=='transform'){
						//perform srting manipulation to find all the values used in the transform
					}
					objSvgElementProperties[attr.nodeName]=attr.nodeValue;
				}

				//4- the svg transform object (this allows us to read the position, scale etc of the svg element)
				objSvgElementProperties.transformmatrix=elSvg.getCTM();

				//5- the svg size
				objSvgElementProperties.size=elSvg.getBoundingClientRect();


				return objSvgElementProperties;
			}




			function setupHammer(){
				//setup event handlers
				if(objPageVars.mobile){
					console.log('setting up');
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
				}


			}

			//settings for the touch system
			var objTouchSettings={
				debug: true,
				debugtoconsole: true,
				debugtointerface: true,
				zoommax: 5,
				zoommin: 0.2
			}

			//data that will be updated while touching the screen
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
				ctmorig: null
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

					handleDragStart(ev);
				});
				objPageVars.hammersvg.on("drag", function(ev) {
					if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
						//if(window.console) { console.log(ev); }
					}
					console.log(ev);
					objTouchVars.dragging=true;
					
					handleDrag(ev);
				});		    
				objPageVars.hammersvg.on("dragend release", function(ev) {
					//if(window.console) { console.log(ev); }
					//handleMouseUp(ev);
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

					handlePinch(ev);
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

			function startPinchSampling(){
				if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
					if(window.console) { console.log('in startPinchSampling()'); }
				}

				//fix the values
				var objAnimationProperties={};
				objAnimationProperties.zoom=objTouchVars.zoomworking;
				objAnimationProperties.svgpoint=objTouchVars.svgpoint;
				objAnimationProperties.ctmorig=objTouchVars.ctmorig



				//zoom the svg around the center position
				zoomSvg(objPageElements.rootanimate, objPageElements.rootanimateattributevalues, 0.19, objAnimationProperties);

				
				if(objTouchVars.sampling){
					objTouchVars.timer3=setTimeout(function(){
						startPinchSampling();
					},60);
				}


			}


			function startDragSampling(){
				if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
					if(window.console) { console.log('in startDragSampling()'); }
				}

				/**/
				//retrieve the current matrix values
				//objSvgElementProperties.transformmatrix=objPageElements.rootanimate.getCTM();
				//console.log('**');
				//console.log(objPageElements.rootanimateattributevalues);
				//console.log('**');

				//fix the values
				var objAnimationProperties={};
				objAnimationProperties.fingerx=objTouchVars.fingerx;
				objAnimationProperties.fingery=objTouchVars.fingery;
				objAnimationProperties.deltax=objTouchVars.deltax;
				objAnimationProperties.deltay=objTouchVars.deltay;
				objAnimationProperties.svgpoint=objTouchVars.svgpoint;
				objAnimationProperties.zoom=objTouchVars.zoom;


				//zoom the svg around the center position
				panSvg(objPageElements.rootanimate, objPageElements.rootanimateattributevalues, 0.19, objAnimationProperties);
				
				
				if(objTouchVars.sampling){
					objTouchVars.timer3=setTimeout(function(){
						startDragSampling();
					},60);
				}


			}

			function handleRelease(ev){

				//in case of pinch: remember the reached zoomlevel
				if(objTouchVars.action.indexOf('zoom') > -1){
					objTouchVars.zoom=objTouchVars.zoomworking;
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
			}

			
			function handlePinch(ev){

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

				//for debugging purposes: show in the interface what is going on
				if(objTouchSettings.debug && objTouchSettings.debugtointerface){
					if(objTouchVars.action=='zoomin'){
						objPageElements.zoomin.style.display = "block";
						objPageElements.zoomout.style.display = "none";
					}else{
						if(objTouchVars.action=='zoomout'){
							objPageElements.zoomin.style.display = "none";
							objPageElements.zoomout.style.display = "block";
						}
					}
				}
				
				//capture the center of the pinch effect
				objTouchVars.fingerx=ev.gesture.startEvent.center.pageX;
				objTouchVars.fingery=ev.gesture.startEvent.center.pageY;

				//calculate a new zoom level and assure that this stays within limits
				var intNewZoomLevel=objTouchVars.zoom*ev.gesture.scale;
				if(intNewZoomLevel<=objTouchSettings.zoommax && intNewZoomLevel>=objTouchSettings.zoommin){
					objTouchVars.zoomworking=objTouchVars.zoom*ev.gesture.scale;
				}else{
					if(intNewZoomLevel>=1){
						objTouchVars.zoomworking=objTouchSettings.zoommax;
					}else{
						objTouchVars.zoomworking=objTouchSettings.zoommin;
					}
				}

				//store the scale mode
				objTouchVars.pinchscale=ev.gesture.scale;

				//console.log('!!!!!');
				var p = getEventPoint(ev, objPageElements.rootsvg);
				//console.log(p);
				objTouchVars.svgpoint = p.matrixTransform(objPageElements.rootanimate.getCTM().inverse());
				//console.log(objTouchVars.svgpoint);
				//console.log('!!!!!');

				if(objTouchVars.ctmorig==null){
					objTouchVars.ctmorig=objPageElements.rootanimate.getCTM();
				}


				debugLog();


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
			}

			function handlePinchIn(ev){
		
			}

			function handlePinchOut(ev){


			}

			function handleDragStart(ev){
				objTouchVars.action="drag";

				//objTouchVars.stateTf = objPageElements.rootanimate.getCTM().inverse();
				//objTouchVars.stateOrigin = getEventPoint(ev, objPageElements.rootsvg);
				

			}

			function handleDrag(ev){
				//console.log('!!');
				//console.log(ev);
				//console.log('!!');

				//store details about the event in the global variable
				objTouchVars.fingerx=ev.gesture.srcEvent.pageX;
				objTouchVars.fingery=ev.gesture.srcEvent.pageY;
				objTouchVars.deltax=ev.gesture.deltaX;
				objTouchVars.deltay=ev.gesture.deltaY;




				debugLog();

				//start the sampling
				if(!objTouchVars.sampling){
					if(objTouchSettings.debug && objTouchSettings.debugtoconsole){
						console.log('!!! start the drag sampling process !!!');
					}
					objTouchVars.sampling=true;
					objTouchVars.timer4=setTimeout(function(){
						startDragSampling();
					},50);
				}
			}

			function handleDragEnd(ev){

			}

			function handleClick(ev){


			}