var objMap = {
	state: {
		visible: null,
		currentmap: null,
		lastsvgdata: null,
		selectedregion: null
	},
	el: {
		mapwrapper: null
	},
	data: null,
	maps: {
		world: {url: 'jvector_world.svg'},
		region: {url: 'jvector_continents.svg'},
		market: {url: 'jvector_markets.svg'},
		country: {url: 'jvector_countries.svg'}
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
	//loads the svg data for the map
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

			//set labels in the interface
			objHeader.setregionname(strOru);	
			objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());

			var arrFormData=[];
			arrFormData['type']='xml';
			arrFormData['file']=self.maps[strOru.toLowerCase()].url;
			arrFormData['method']='getsvgworldmap';
			arrFormData['fulldomain']=location.protocol+"//"+location.hostname;
			arrFormData['token']=objLogin.token;

			serverSideRequest({
				url: objConfig.urls.authurl2, 
				formdata: arrFormData,
				method: 'get', 
				debug: false,
				callback: function(err, strSvgData){
					if(err != null) cb(err)
					else cb(strSvgData);
				}
			});		
		}	
		else{
			cb(null);
		}
	},
	//retrieves the lives improved data
	getworldmapdata: function(cb){
		var objData = {
			fulldomain: location.protocol+"//"+location.hostname,
			method:'getworldmapdata',
			type:'json',
			token: objLogin.token,
			oru: objOruFilter.state.selectedoru,
			mru: objMruFilter.state.selectedmru,
			snapshotid: objConfig.currentsnapshotid
		}
		//showLoadingPanel();
		psv('GET', objConfig.urls.dynamicresourceurl, objData, function(err, data) {
			//hideLoadingPanel();
			if(err != null){
				cb(err);
			}else{
				if(data.error){
					cb(data.error.message);
				}else{
					cb(null, data);
				}				
			}
		});		
	},
	/*
	 * UI functions
	 */
	updatemap: function(regionIdToSelect){
		var self = this;

		//JT: ????
		self.el.elsvgholder.style.visibility = 'hidden';
		//load correct svg map
		self.loadmap(function(data){
			
			if(data != null){
				// update svg html
				self.el.elsvgholder.innerHTML='';
				self.el.elsvgholder.innerHTML=data;
			}
			//get worldmap livesimproved data
			self.getworldmapdata(function(err, data){
				if(err != null){
					objError.handleError('map.updatemap', err);
				}else{
					objLoading.show();

					/*
					1) store the data in this object as a property
					*/
					self.data = data.snapshotdata;

					/*
					2) retrieve the elements from the svg that we need to color
					*/
					var elSvgWrapper=getEl('svgcontentwrapper');
					var arrRegions = getFirstLevelChildElements(elSvgWrapper, 'path') ;
					if(arrRegions.length == 0) arrRegions = getFirstLevelChildElements(elSvgWrapper, 'g')
					//console.log(arrRegions);

					/*
					2) set the proper coloring
					*/

					//analyze the data we have received
					var intLivesImprovedTotal=0;
					var intLivesImprovedPercentageMax=0;
					var intLivesImprovedPercentageMin=100;
					for (var key in self.data) {
						if(self.data[key].l>=0){
							intLivesImprovedTotal+=self.data[key].l;
							
							var livesImprovedPercentage=(self.data[key].l*100/self.data[key].p);
							if(livesImprovedPercentage>intLivesImprovedPercentageMax)intLivesImprovedPercentageMax=livesImprovedPercentage;
							if(livesImprovedPercentage<intLivesImprovedPercentageMin)intLivesImprovedPercentageMin=livesImprovedPercentage;
						}
					}
					//console.log('- intLivesImprovedTotal: '+intLivesImprovedTotal+' - intLivesImprovedPercentageMax: '+intLivesImprovedPercentageMax+' - intLivesImprovedPercentageMin: '+intLivesImprovedPercentageMin);


					//settings for the coloring
					var minimumPercentage=1; //anything below this percentage will get the 'low' color
					var factor=(intLivesImprovedPercentageMax-intLivesImprovedPercentageMin)/(100-minimumPercentage);

					for ( var i = 0; i < arrRegions.length; i++) {
						var region = arrRegions[i],
							regionId = region.id == 'UK' ? 'GB' : region.id,
							key=objMruFilter.state.selectedmru + '_' + (objOruFilter.state.selectedoru != 4 ? regionId.toLowerCase() : regionId),
							//JT: need a test here to check if the key really exists
							regionData = (self.data[key])?self.data[key]:false;

						//console.log(key+' - '+regionData);
						//debugger;
						if (regionData) {
							//calculate percentage lives improved and store that in the worldmapdata object
							var percentageLI = (regionData.l * 100) / regionData.p || 0;
							if(percentageLI> 99)percentageLI=100;
							if(percentageLI< 1)percentageLI=0;
							self.data[key].percentageLI = Math.round(percentageLI);
							

							//add colors to the map
							var color=objConfig.colors[objMruFilter.state.selectedsector].middle;
							self.data[key].color = objConfig.colors[objMruFilter.state.selectedsector].middle;

							//calculate the color to place on the map
							var percentageForColor=80;
							if(intLivesImprovedPercentageMax>intLivesImprovedPercentageMin){
								percentageForColor=(percentageLI-intLivesImprovedPercentageMin)/factor+minimumPercentage;
							}

							if(percentageForColor>=100)percentageForColor=99;
							//console.log(regionId+' colorprc: '+percentageForColor);
							var colorToSet=self.getcolorforpercentage(percentageForColor, objConfig.colors[objMruFilter.state.selectedsector].low, objConfig.colors[objMruFilter.state.selectedsector].middle, objConfig.colors[objMruFilter.state.selectedsector].high);
							
							//JT: shouldn't objConfig.hideinactivecountries be part of the MruFilter object??
							if(regionData.l <= 100 && objConfig.hideinactivecountries){
								colorToSet = '#999';
							}

							region.style.fill=colorToSet;	
							
							var paths=region.getElementsByTagName('*');
							for ( var ii = 0; ii < paths.length; ii++) {
								var path = paths[ii];
								if(path.nodeName == 'path' || path.nodeName == 'polygon' || path.nodeName == 'rect' || path.nodeName == 'g' || path.nodeName == 'polyline'){
									paths[ii].style.fill=colorToSet;	
									//paths[ii].style.opacity=1;
								}
							}
							//JT: end change							
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
					objLoading.hide();
					//hideLoadingPanel();	
					if(regionIdToSelect){
						self.regionclick(regionIdToSelect);
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
		self.state.selectedregion = idCountry;
		//JT: unsure, but I feel that this is a property that we should store in the oru filter object
		objOruFilter.state.selectedoruguid=idCountry; 


		if(objBookmarks.isfavourite()){
			getEl('toggle_favourite').className=getEl('toggle_favourite').className +' selected';
		}else{
			getEl('toggle_favourite').className=getEl('toggle_favourite').className.replace(' selected','');
		}



		//initiates the simulator
		objSliders.start();


		
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
				//alert('in')
				//debugger;

				//JT: I introduced a very crappy way to check for a tablet - can this be improved and become app.state.tablet ?
				if(app.state.width>700){
					self.updateui(regionData, idCountry, elRegion);
				}else{
					TweenLite.to(self.el.elsvgholder, 0.2, {
						opacity: 0, 
						onComplete: function(){
							self.updateui(regionData, idCountry, elRegion);
						}
					});		
				}

		
			}
		});

				
	},
	updateui: function(regionData, idCountry, elRegion){
		var self=this;

		//debugger;
		//if(app.state.width<1000 || app.state.height<1000)self.el.elsvgholder.style.display = 'none';
		
		//set the rounded values in the ui
		self.setroundeddatainui(regionData);

		//set the percentage in the infographic
		objRegionInfo.el.percentagelivesimproved.textContent = regionData.percentageLI+'%';

		objHeader.setregionname(objOruFilter.getregionnamebyid((idCountry.length < 4 ? idCountry : idCountry.toLowerCase())));
		objHeader.setbreadcrumb(objMruFilter.getmrufilterbreadcrumb());
		
		//if(getEl('btn_back').className.indexOf('hide')> -1){
		//	toggleClass(getEl('btn_back'), 'hide');
		//	toggleClass(getEl('toggle_favourite'), 'hide');
		//}
		//objSliders.show();
		objRegionInfo.show();
		
		objHeader.showbackbutton();
		objHeader.showfavouritebutton();
		TweenLite.to(elRegion, 0.5, {
			opacity: 1,
			onComplete: function(){
				animateArc({start: 0, end: (regionData.percentageLI*360) /100}, 1);	
			}
		});		

	},
	//updates the fields in the ui with new data
	setroundeddatainui: function(objData){
		var self=this;
		var objExtendedData=self.roundlivesimproveddataobject(objData);
		//console.log(objExtendedData)

		objRegionInfo.el.nrlivesimproved.innerHTML =objExtendedData.displayl;
		objRegionInfo.el.labellivesimproved.innerHTML=objExtendedData.labell;
		objRegionInfo.el.gdp.innerHTML='<span>GDP</span> $'+objExtendedData.displayg+objExtendedData.labelg;
		objRegionInfo.el.population.innerHTML='<span>Population</span>' +objExtendedData.displayp+objExtendedData.labelp;
	},
	//rounds the data befor sending it to the app
	roundlivesimproveddataobject: function(objData){
		//console.log(objData)
		var intDecimals=0;
		
		//lives improved
		if(objData.l>=0){
			//always have 4 digits in the display
			//more than 1000 million
			if(objData.l>=1000000000){
				//console.log('-2');
				objData.roundedl=Math.round(objData.l/1000000);
				//console.log(objData.roundedl)
			}
			//100 - 999.99 million
			if(objData.l>=100000000 && objData.l<1000000000){
				//console.log('-1');
				objData.roundedl=Math.round((objData.l/1000000)*10)/10;
				intDecimals=1;
			}
			//10 - 99.99 million
			if(objData.l>=10000000 && objData.l<100000000){
				//console.log('0');
				objData.roundedl=Math.round((objData.l/1000000)*100)/100;
				intDecimals=2;
			}
			//0.0001 - 9.99 million
			if(objData.l>=1 && objData.l<10000000){
				//console.log('1');
				objData.roundedl=Math.round((objData.l/1000000)*1000)/1000;
				intDecimals=3;
			}

			objData.displayl=formatMoney(objData.roundedl, intDecimals,',','.','');
			objData.labell='million lives improved';
		}

		//gdp
		if(objData.g>=0){
			if(objData.g>1){
				objData.roundedg=Math.round(objData.g/1);
				intDecimals=0;
			}else{
				objData.roundedg=Math.round((objData.g/1)*10)/10;
				intDecimals=1;
			}
			objData.displayg=formatMoney(objData.roundedg, intDecimals,',','.','');
			objData.labelg=' billion';				
		}

		//population
		if(objData.p>=0){
			if(objData.p>1000000){
				objData.roundedp=Math.round(objData.p/1000000);
				intDecimals=0;
			}else{
				objData.roundedp=Math.round((objData.p/1000000)*10)/10;
				intDecimals=1;
			}
			objData.displayp=formatMoney(objData.roundedp, intDecimals,',','.','');
			objData.labelp=' million';	
		}

		return objData;
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		
		self.el.elsvgholder = getEl('holder_1000');
	}
}
