var objMap = {
	state: {
		visible: null,
		currentmap: null,
		lastsvgdata: null
	},
	el: {
		mapwrapper: null
	},
	data: null,
	maps: {
		world: {url: 'svg/jvector_world.svg'},
		region: {url: 'svg/jvector_continents.svg'},
		market: {url: 'svg/jvector_markets.svg'},
		country: {url: 'svg/jvector_countries.svg'}
	},
	getcolorforpercentage: function(pct, low_color, middle_color, high_color) {
		var self = this;
	    pct /= 100;

	    var percentColors = [
	            { pct: 0.01, color: rgbFromHex(low_color) },
	            { pct: 0.5, color: rgbFromHex(middle_color) },
	            { pct: 1.0, color: rgbFromHex(high_color) } 
	        ];

	    for (var i = 0; i < percentColors.length; i++) {
	        if (pct <= percentColors[i].pct) {
	            var lower = percentColors[i - 1] || { pct: 0.1, color: { r: 0x0, g: 0x00, b: 0 } };
	            var upper = percentColors[i];
	            var range = upper.pct - lower.pct;
	            var rangePct = (pct - lower.pct) / range;
	            var pctLower = 1 - rangePct;
	            var pctUpper = rangePct;
	            var color = {
	                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
	                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
	                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
	            };
	            return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
	        }
	    }
	},
	/*
	 * Data functions
	 */
	loadmap: function(cb){
		var self = this;
		//update svg if needed
		if(!self.state.currentmap || self.state.currentmap != objOruFilter.state.selectedoru){
			objTouchVars.elanimate=null;
			var strOru = 'World';
			switch (objOruFilter.state.selectedoru) {
				case '1':
				case 1:
					strOru = 'World';
					break;
				case '2':
				case 2:
					strOru = 'Region';
					break;
				case '3':
				case 3:
					strOru = 'Market';
					break;
				case '4':
				case 4:
					strOru = 'Country';
					break;
				default:
					break;
			}	
			self.state.mapname = strOru;
			getEl('region_name').innerHTML = strOru;	
			getEl('filter_breadcrumb').innerHTML = objMruFilter.getmrufilterbreadcrumb();

			serverSideRequest({
				url: self.maps[strOru.toLowerCase()].url, 
				method: 'get', 
				debug: false,
				callback: function(strSvgData){
					cb(strSvgData);
				}
			});		
		}	
		else{
			cb();
		}
	},
	getworldmapdata: function(cb){
		var objData = {
			fulldomain: location.protocol+"//"+location.hostname,
			method:'getworldmapdata',
			type:'json',
			token: objLogin.token,
			oru: objOruFilter.state.selectedoru,
			mru: objMruFilter.state.selectedmru,
			snapshotid:1
		}
		//showLoadingPanel();
		psv('GET', objConfig.urls.snapshoturl, objData, function(data) {
			//hideLoadingPanel();
			if(data.error){
				cb(data.error.message);
			}else{
				//JT: this seems to be a really nasty hack...
				cb(null, data);
			}

		});		
	},
	/*
	 * UI functions
	 */
	updatemap: function(regionIdToSelect){
		var self = this;
		self.el.elsvgholder.style.visibility = 'hidden';
		//load correct map
		self.loadmap(function(data){
			
			if(data){
				// update svg html
				self.el.elsvgholder.innerHTML='';
				self.el.elsvgholder.innerHTML=data;
			}
			//get worldmap data
			self.getworldmapdata(function(err, data){
				if(err){
					
				}else{
					self.data = data.snapshotdata;
					//set colors
					var elSvgWrapper=getEl('svgcontentwrapper');
					var arrRegions = getFirstLevelChildElements(elSvgWrapper, 'path') ;// getEl('viewport').getElementsByTagName('g');
					if(arrRegions.length == 0) arrRegions = getFirstLevelChildElements(elSvgWrapper, 'g');
					/**/
					for ( var i = 0; i < arrRegions.length; i++) {
						var region = arrRegions[i],
							regionId = region.id == 'UK' ? 'GB' : region.id,
							key=objMruFilter.state.selectedmru + '_' + (objOruFilter.state.selectedoru != 4 ? regionId.toLowerCase() : regionId),
							//JT: need a test here to check if the key really exists
							regionData = (self.data[key])?self.data[key]:false;

						if (regionData) {

							var percentageLI = (regionData.l * 100) / regionData.p || 0;
							if(percentageLI> 99)percentageLI=100;
							if(percentageLI< 1)percentageLI=0;
							self.data[key].percentageLI = Math.round(percentageLI);
							
							//JT - add colors to the map

							var color=self.getcolorforpercentage(percentageLI, objConfig.colors[objMruFilter.state.selectedsector].low, objConfig.colors[objMruFilter.state.selectedsector].middle, objConfig.colors[objMruFilter.state.selectedsector].high);
							self.data[key].color = color;

							if(regionData.l == 0 && objConfig.hideinactivecountries){
								color = '#999';
							}
							
							region.style.fill=color;	
							
							var paths=region.getElementsByTagName('*');
							for ( var ii = 0; ii < paths.length; ii++) {
								var path = paths[ii];
								if(path.nodeName == 'path' || path.nodeName == 'polygon' || path.nodeName == 'rect' || path.nodeName == 'g'){
									paths[ii].style.fill=color;	
									//paths[ii].style.opacity=1;
								}
							}								
						} else {
							region.style.fill = '#999';
						}							
					}

					
					/*
					3) perform post processing (set events and center map)
					*/
					//retrieve the base svg elements
					self.el.rootanimate=getEl('viewport');
					self.el.rootsvg=getEl('holder_1000').getElementsByTagName('svg')[0];
					//console.log(objPageElements.rootsvg);
					
					//resize the map to fit into the window
					self.resizeworldmap();

					//prepare an object containing vital information about the svg element to animate
					self.state.rootanimateattributevalues=self.retrievesvgelementobject(self.el.rootanimate);
					
					//apply zoom and pan functionality to the svg drawing
					var bolUseHomeGrown=true;
					if(bolUseHomeGrown){
						//initiate the new version of the zoom pan library
						objTouchSettings.debug=false;
						objTouchSettings.debugtointerface=false;
						objTouchSettings.debugtoconsole=true;
						objZoomPanSettings.mobile=app.state.mobile;
						
						objZoomPanSettings.clickcallback=function(event){
							//console.log('in callback');
							//console.log(event);

							var elClicked=event.srcElement;
							if(typeof(elClicked) == "undefined"){
								elClicked=event.originalTarget;
							}
							var strElementName=elClicked.nodeName;
							var strElementId=(elClicked.id)?elClicked.id:'';
							var elParent=elClicked.parentNode;
							var strParentElementName=elParent.nodeName;
							var strParentElementId=(elParent.id)?elParent.id:'';
							if(strElementId=='')strElementId = strParentElementId;
							//console.log('strElementName: '+strElementName+' strElementId: '+strElementId+' strParentElementName:'+strParentElementName+' strParentElementId: '+strParentElementId);

							if(strElementName=='path' || strElementName == 'g' || strElementName == 'polygon')countryClicked(strElementId);
						}
						initSgvZoomPan(self.el.rootsvg, self.el.rootanimate);

						//console.log(objPageElements.rootanimateattributevalues);
					}else{
						
						initZoomPan(self.el.rootsvg);
					}

					self.centerworldmap(self.el.rootanimate);

					self.currentmap=objOruFilter.state.selectedoru;

					//hideLoadingPanel();	
					if(regionIdToSelect){
						regionClick(regionIdToSelect);
					}
					//post processing
					self.el.elsvgholder.style.visibility = 'visible';
				}
			});
		});
	},
	retrievesvgelementobject: function(elSvg){
		var self = this;
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
		for (var attr, i=0, attrs=self.el.rootanimate.attributes, l=attrs.length; i<l; i++){
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
	},
	resizeworldmap: function(){
		var self = this;
		if(typeof(self.el.rootsvg)!="undefined"){
			self.el.rootsvg.setAttributeNS( null, 'viewBox', '0 0 '+app.state.width+' '+app.state.height);
			self.el.rootsvg.setAttributeNS( null, 'enable-background', 'new 0 0 '+app.state.width+' '+app.state.height);
			self.el.elsvgholder.style.width = app.state.width+'px';
			self.el.elsvgholder.style.height = app.state.height+'px';
			self.el.rootsvg.setAttributeNS( null, 'width', app.state.width);
			self.el.rootsvg.setAttributeNS( null, 'height', app.state.height);		
		}
	},	
	//moves the worldmap by mimicking a drag in the browser window
	moveworldmap: function(intDeltaX, intDeltaY){
		var self = this;
		//create a custom object that mimics the mousemove event 
		if(objTouchVars.elanimate!=null){
			var objFakeEventObject={
				gesture: {
					center: {
						pageX: 0,
						pageY: 0
					}
				},
				clientX: 0,
				clientY: 0,
				target: {
					tagName: 'svg'
				}
			}

			//fake start
			handleClickTouchStart(objFakeEventObject);

			//disable fireing of click event on desktop
			objTouchVars.clickstart=false;

			//fake drag by x amount of pixels
			objFakeEventObject={
				gesture: {
					center: {
						pageX: intDeltaX,
						pageY: intDeltaY
					}
				},
				clientX: intDeltaX,
				clientY: intDeltaY
			}
			handleDrag(objFakeEventObject);

			//fake end
			handleClickTouchEnd(objFakeEventObject);
		}
	},
	//centers the worldmap in the screen
	centerworldmap: function(elSvg){
		var self = this;
		//set the worldmap to position 0,0
		svgSetTransform(elSvg, {
			scale: 1,
			translatex: 0,
			translatey: 0,
			transformmatrix: {}
		});
		//console.log(elSvg);

		//move to new position
		self.moveworldmap((app.state.width/2)-(self.state.rootanimateattributevalues.size.width/2)-self.state.rootanimateattributevalues.x, (app.state.height/2)-(self.state.rootanimateattributevalues.size.height/2)-self.state.rootanimateattributevalues.y);
	},
	regionclick: function(idCountry){
		var self = this;
		self.currentregion = idCountry;
		if(objBookmarks.isfavourite()){
			getEl('toggle_favourite').className=getEl('toggle_favourite').className +' selected';
		}else{
			getEl('toggle_favourite').className=getEl('toggle_favourite').className.replace(' selected','');
		}
		//hide the green sales slider element for Healthcare
		if(objMruFilter.selectedsector == 'PD0900'){
			//objPageElements.elslidergreensales.parentNode.style.display = 'none';
		}else{
			//objPageElements.elslidergreensales.parentNode.style.display = 'block';
		}

		//start Ajax Call to get simulation data
		var objData = {
			fulldomain: location.protocol+"//"+location.hostname,
			method: 'getlivesimprovedcachedata',
			type: 'json',
			oru: objOruFilter.state.selectedoru,
			mru: objMruFilter.state.selectedmru,
			snapshotid: 1,
			token: objLogin.token
		}
		
		//initiates the simulator
		psv('GET', objConfig.urls.simulationdataurl, objData, function(response){
			if(response.error) {
				objError.show(response.error.message, true);
			}else{
				initSimulator(response);
			}
		});
		
		document.getElementsByTagName("body")[0].className = objMruFilter.state.selectedsector;
		//var color=colors[objPageVars.current_sector].middle;
		//appPanels.region_info.style.background = color;
		var sec={},
		back={},
		key=objMruFilter.state.selectedmru + '_' + (idCountry.length < 4 ? idCountry : idCountry.toLowerCase()),
		regionData = self.data[key];
		var elRegion = getEl(idCountry);
		var opacity = elRegion.style.opacity;
		TweenLite.to(elRegion, 0.5, {
			opacity: 0.7, 
			onComplete: function(){
				//TweenLite.to(appPanels.map, 0.2, {
				//	opacity: 0, 
				//	onComplete: function(){
						//debugger;
						//appPanels.map.style.display = 'none';
						objRegionInfo.el.nrlivesimproved.innerHTML =regionData.l;
						objRegionInfo.el.gdp.innerHTML = regionData.g+' billion';
						objRegionInfo.el.population.innerHTML = regionData.p+ ' million';
						objRegionInfo.el.percentagelivesimproved.textContent = regionData.percentageLI+'%';
						objHeader.setregionname(objOruFilter.getregionnamebyid((idCountry.length < 4 ? idCountry : idCountry.toLowerCase())));
						objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());

						//if(getEl('btn_back').className.indexOf('hide')> -1){
						//	toggleClass(getEl('btn_back'), 'hide');
						//	toggleClass(getEl('toggle_favourite'), 'hide');
						//}
						objRegionInfo.show();
						objSliders.show();
						objHeader.showbackbutton();
						objHeader.showfavouritebutton();
						TweenLite.to(elRegion, 0.5, {
							opacity: 1
						});
				//	}
				//});			
			}
		});

				
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		
		self.el.elsvgholder = getEl('holder_1000');
	}
}
