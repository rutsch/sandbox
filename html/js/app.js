

function findFavourites(){
	var arrResult = [];
    for (var i = 0; i < store.length; i++){
        var key = localStorage.key(i);
        if(key.indexOf('fav_') > -1 ){
        	arrResult.push(store.getItem(key));
        }
    }     	
    return arrResult;
}

function getColorForPercentage(pct, low_color, middle_color, high_color) {
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
}


/*
 * Click functions
 */
function btnSubmitClick() {
	var un = getEl("username").value, 
	pw = getEl("password").value,
	handleLoginError = function(msg){
		//hideLoadingPanel();
		getEl("username").value = '';
		getEl("password").value = '';
		TweenLite.to(getEl('btn_submit'), 0.3, {
			opacity : 1
		});
		showErrorDiv(msg, true);			
	};	
	if(un == "" || pw == "") {
		alert('Please enter a code1 account and a password');
	}else{
		//showLoadingPanel();
		// Start authentication
		TweenLite.to(getEl('btn_submit'), 0.3, {
			opacity : 0.5
		});
	
		if(un.toLowerCase().indexOf('code1\\') == -1) un = 'code1\\' + un;
		var objData = {
			type: 'json',
			fulldomain: location.protocol+"//"+location.hostname
		};
		psv('GET', authUrl1, objData, function(response){
        	if(response.error) {
        		handleLoginError(response.error.message);
        	}else{			
				objData.stay = true;
				psv('GET', authUrl1, objData, function(response){
					
	            	if(response.error) {
	            		handleLoginError(response.error.message);
	            	}else{				
						objData.method='generatejsvarsjson';
						psv('GET', authUrl2, objData, function(response){
							if(response.error) {
								handleLoginError(response.error.message);
							}else{
								//debugger;
								console.log(response.token);
			                    var objDataAuthenticate = {
			                            username: un,
			                            password: pw,
			                            url: '/index.aspx',
			                            token: response.token,
			                            type: 'json',
			                            fulldomain: location.protocol+"//"+location.hostname
			                    };
			                    
			                    psv('POST', authUrl3, objDataAuthenticate, function(response2){
			                    	//response = JSON.parse(response);
			                    	if(response2.error) {
			                    		handleLoginError(response2.error.message);
			                    	}else{
			                    		//debugger;
			                    		console.log(response2.token);
			                    		objPageVars.token = response2.token;
			                    		setLocalStorageItem('token', objPageVars.token);
		                    			setLocalStorageItem('username', un);
		                    			TweenLite.to(getEl('btn_submit'), 0.3, {
		                    				opacity : 1
		                    			});		        
		                    			//hideLoadingPanel();
			                    		startApp();                   		
			                    	}
			                    });						
							}
						});
	            	}
				});
        	}
		});
	}
}

function btnBackToMapClick() {
	animateArc({start: 0, end: 0}, 2);
	var strMapMode = '';

	//stop sampling the simulation handles
	objPageVars.simulatorsampling=false;

	if(objPageVars.width>700){
		getEl('region_name').innerHTML = objPageVars.currentsvgname;
		TweenLite.to(objPageElements.region_info, 0.2, {
			opacity : 1,
			delay: 0,
			onComplete: function(){

			}
		});

		TweenLite.to(appPanels.simulation, 0.4, {
			top : '-32%',
			onComplete : function() {	
				appPanels.map.style.display = 'block';
				TweenLite.to(appPanels.map, 0.2, {
					opacity: 1
				});					
				
			}
		});	
		TweenLite.to(appPanels.region_info, 0.4, {
			top : '-32%'
		});									
	}else{
		getEl('region_name').innerHTML = objPageVars.currentsvgname;
		TweenLite.to(objPageElements.region_info, 0.2, {
			opacity : 1,
			delay: 0,
			onComplete: function(){

			}
		});

		TweenLite.to(appPanels.simulation, 0.4, {
			bottom : '-60%',
			onComplete : function() {	
				appPanels.map.style.display = 'block';
				TweenLite.to(appPanels.map, 0.2, {
					opacity: 1
				});					
				
			}
		});	
		TweenLite.to(appPanels.region_info, 0.4, {
			top : '-40%'
		});				
	
	}
			
	//hideLoadingPanel();
	toggleClass(getEl('btn_back'), 'hide');
	toggleClass(getEl('toggle_favourite'), 'hide');
	//updateVal(0, 100, 50, sec, 2);
}
function btnLogoutClick() {
	setLocalStorageItem('token', '');
	panels.overlay.style.display = "none";
	panels.overlay.style.opacity = 0;
	getEl('username').value = objPageVars.username;
	getEl("password").value = '';	
	TweenLite.to(panels.login, 0.2, {
		width : objPageVars.width
	});
}
function btnFilterClick() {
	//stop sampling the simulator handles
	objPageVars.simulatorsampling=false;

	panels.overlay.style.display = "block";
	TweenLite.to(panels.overlay, 0.3, {
		opacity : 0.7,
		delay : 0,
		onComplete : function() {
			TweenLite.to(panels.filter, 0.4, {
				display : 'block',
				opacity : 1,
				delay : 0
			});
		}
	});
}
function btnCloseFilterClick() {
	
	TweenLite.to(panels.filter, 0.4, {
		opacity : 0,
		display : 'none',
		delay : 0,
		onComplete : function() {
			btnBackToMapClick();
			TweenLite.to(panels.overlay, 0.3, {
				opacity : 0,
				delay : 0,
				onComplete : function() {
					panels.overlay.style.display = "none";
				}
			});
		}
	});
}
function btnExplainClick() {
	panels.overlay.style.display = "block";
	if(!objPageVars.faqloaded){
		serverSideRequest({
			url: 'data/faq.html', 
			method: 'get', 
			debug: false,
			callback: function(strFaqContent){
				//insert the SVG data into the holder div
				getEl('explain_content').innerHTML=strFaqContent;


				objPageVars.faqloaded=true;


				openExplain();
			}
		});		

	}else{
		openExplain();
	}


}
function openExplain(){
	TweenLite.to(panels.overlay, 0.3, {
		opacity : 0.7,
		delay : 0,
		onComplete : function() {
			TweenLite.to(panels.explain, 0.4, {
				display : 'block',
				opacity : 1,
				delay : 0
			});
		}
	});	
}

function btnCloseExplainClick() {
	TweenLite.to(panels.explain, 0.4, {
		opacity : 0,
		display : 'none',
		delay : 0,
		onComplete : function() {
			TweenLite.to(panels.overlay, 0.3, {
				opacity : 0,
				delay : 0,
				onComplete : function() {
					panels.overlay.style.display = "none";
				}
			});
		}
	});
}
function btnBookmarksClick(el) {
	var paddingtop=el.style['padding-top'];
	TweenLite.to(el, 0.3, {
		'padding-top' : '6px',
		onComplete: function(){
			TweenLite.to(el, 0.3, {
				'padding-top' : paddingtop
			});
		}
	});
	panels.overlay.style.display = "block";
	TweenLite.to(panels.overlay, 0.3, {
		opacity : 0.7,
		delay : 0,
		onComplete : function() {
			TweenLite.to(panels.bookmarks, 0.4, {
				display : 'block',
				opacity : 1,
				delay : 0
			});
		}
	});
}
function btnCloseBookmarksClick(closeOverlay) {
	TweenLite.to(panels.bookmarks, 0.4, {
		opacity : 0,
		display : 'none',
		delay : 0,
		onComplete : function() {
			if(closeOverlay){
				TweenLite.to(panels.overlay, 0.3, {
					opacity : 0,
					delay : 0,
					onComplete : function() {
						panels.overlay.style.display = "none";
					}
				});
			}
		}
	});
}
function countryClicked(idCountry) {
	if (idCountry !== "") {
		regionClick(idCountry);
	}
}
function regionClick(idCountry) {
	objPageVars.current_region = idCountry;
	if(isFavourite()){
		getEl('toggle_favourite').className=getEl('toggle_favourite').className +' selected';
	}else{
		getEl('toggle_favourite').className=getEl('toggle_favourite').className.replace(' selected','');
	}

	//start Ajax Call to get simulation data
	var objData = {
		fulldomain: location.protocol+"//"+location.hostname,
		method: 'getlivesimprovedcachedata',
		type: 'json',
		oru: objPageVars.current_region,
		mru: objPageVars.current_mru,
		snapshotid: 1,
		token: objPageVars.token
	}
	
	//initiates the simulator
	psv('GET', simulation_data_url, objData, function(response){
		if(response.error) {
			showErrorDiv(response.error.message, true);
		}else{
			initSimulator(response);
		}
	});
	
	
	document.getElementsByTagName("body")[0].className = objPageVars.current_sector;
	//var color=colors[objPageVars.current_sector].middle;
	//appPanels.region_info.style.background = color;
	var sec={},
	back={},
	key=objPageVars.current_mru + '_' + (idCountry.length < 4 ? idCountry : idCountry.toLowerCase()),
	regionData = objPageVars.worldmapdata[key];
	var elRegion = getEl(idCountry);
	var opacity = elRegion.style.opacity;
	TweenLite.to(elRegion, 0.5, {
		opacity: opacity - 0.3, 
		onComplete: function(){
			//TweenLite.to(appPanels.map, 0.2, {
			//	opacity: 0, 
			//	onComplete: function(){
					//debugger;
					//appPanels.map.style.display = 'none';
					objPageElements.ellivesimprovednumber.innerHTML =regionData.l;
					getEl('nr_gdp').innerHTML ='$'+regionData.g+' billion';
					getEl('nr_population').innerHTML =regionData.p+ ' million';
					objPageElements.ellivesimprovedpercentage.textContent = regionData.percentageLI+'%';
					getEl('region_name').innerHTML = getRegionNameById((idCountry.length < 4 ? idCountry : idCountry.toLowerCase()));
					getEl('filter_breadcrumb').innerHTML = getMruFilterBreadcrumb();
					//var color = ColorLuminance(colors[objPageVars.current_sector].middle, (100 - regionData.percentageLI) / 100);
					//getEl('region_info').style['background-color'] = color;
					
					//hideLoadingPanel();	
					if(getEl('btn_back').className.indexOf('hide')> -1){
						toggleClass(getEl('btn_back'), 'hide');
						toggleClass(getEl('toggle_favourite'), 'hide');
					}
					if(objPageVars.width>700){
						TweenLite.to(appPanels.region_info, 0.4, {
							top : '0%!important'
						});
						TweenLite.to(appPanels.simulation, 0.4, {
							top : '0%',
							onComplete : function() {
								//updateVal(61, 100, 50, sec, 2, 1500);
								TweenLite.to(objPageElements.region_info, 0.4, {
									opacity : 1,
									onComplete : function() {
										elRegion.style.opacity = opacity;
										animateArc({start: 0, end: (regionData.percentageLI*360) /100}, 1);	
										TweenLite.to(appPanels.map, 0.2, {
											opacity: 1
										});
									}
								});			
							}
						});							
					}else{
						TweenLite.to(appPanels.region_info, 0.4, {
							top : '0%'
						});
						TweenLite.to(appPanels.simulation, 0.4, {
							bottom : '0%',
							onComplete : function() {
								//updateVal(61, 100, 50, sec, 2, 1500);
								TweenLite.to(objPageElements.region_info, 0.4, {
									opacity : 1,
									onComplete : function() {
										elRegion.style.opacity = opacity;
										animateArc({start: 0, end: (regionData.percentageLI*360) /100}, 1);	
									}
								});			
							}
						});							
					}
		
			//	}
			//});			
		}
	});

	

}


/*
MRU Filter functions
*/
function renderMruFilterComponent(arrLi, parentId){
	//create ul
	var ul = document.createElement('ul');
	ul.id='filter_list';
	//create Philips li
	var liPhilips = document.createElement('li');
	liPhilips.innerHTML = 'Philips';
	liPhilips.id = 'philips';
	liPhilips.className = 'selected';
	liPhilips.setAttribute('data-id', 'philips');
	liPhilips.setAttribute('onclick', 'applyFilter(event, "mru", "philips")');
	ul.appendChild(liPhilips);
	//get all first children of philips from temp html
	var arrLi = getFirstLevelChildElementsById('philips', 'li');
	for ( var i = 0; i < arrLi.length; i++) {
		arrLi[i].innerHTML+= '<div class="mru_sector_color"></div>';
		ul.appendChild(arrLi[i]);
	}
	appPanels.mru_filter.innerHTML = '';
	appPanels.mru_filter.appendChild(ul);
	
	//add event to function call for all calls to stop propagation 
	var arrAllLi = getEl('filter_container').getElementsByTagName('li');
	for ( var a = 0; a < arrAllLi.length; a++) {
		if(arrAllLi[a].onclick){
			var strClick = arrAllLi[a].getAttribute('onclick').replace('applyFilter(\'','applyFilter(event, \'');
			arrAllLi[a].setAttribute('onclick', strClick); 
		}
	}	
}
function applyFilter(e, key, mru){
	e.stopPropagation();
	var elClicked=getEl(mru),
	parentNode = elClicked.parentNode,
	arrSiblingsOrSelf = getFirstLevelChildElements(parentNode, 'li');	

	//set global current mru
	objPageVars.current_mru = mru;
	
	//remove all selected classes
	var arrAllLi = getEl('filter_container').getElementsByTagName('li');
	for ( var a = 0; a < arrAllLi.length; a++) {
		arrAllLi[a].className = '';
	}
	//hide child ul for all siblings of clicked element
	for ( var i = 0; i < arrSiblingsOrSelf.length; i++) {
		var el = arrSiblingsOrSelf[i];
		//skip self
		if(el != elClicked){
			var arrUl = el.getElementsByTagName('ul');
			for ( var ii = 0; ii < arrUl.length; ii++) {
				TweenLite.to(arrUl[ii], 0.2, {
					height: 0
				});
			}
		}
	}
	objPageVars.current_sector = getSectorFromBreadCrumb(getMruFilterBreadcrumb());
	
	//debugger;
	//set selected class on clicked element
	elClicked.className='selected';
	//test if element has children
	var childUl = getFirstLevelChildElements(elClicked, 'ul');
	if(childUl.length > 0){
		//open the child ul
		TweenLite.to(childUl[0], 0.4, {
			height: 'auto'
		});		
	}
	updateWorldmap();	
}






function levelUp(parentId){
	var selector = '#philips li';
	var parent = findParentBySelector(parentId, selector);
	var parentId = parent?parent.getAttribute('id'):'philips';
	showMruFilterLevel(parentId);
}
function showMruFilterLevel(id){
	//debugger;
	if(id == 'philips' || id == 'PD0100' || id == 'PD0200' || id == 'PD0900'){
		objPageVars.current_sector = id;
	}
	objPageVars.current_mru = id;
		
	var arrLi = getFirstLevelChildElementsById(id, 'li');
	renderMruFilterComponent(arrLi, id);
}
function setCurrentOru(el, oru){
	var arrEl = el.parentNode.getElementsByTagName('div');
	for ( var i = 0; i < arrEl.length; i++) {
		var ele = arrEl[i];
		ele.className='';
	}
	el.className='selected';
	objPageVars.current_oru = oru;
	updateWorldmap();	
}
function toggleFavourite(el){
	//alert('adding item to favourites');
	var key = 'fav_' +objPageVars.current_oru+'_'+objPageVars.current_mru+'_'+objPageVars.current_region;
	
	if(isFavourite()){
		removeLocalStorageItem(key);
		el.className=el.className.replace(' selected','');

	}else{
		var obj = {
			oru: objPageVars.current_oru,
			mru: objPageVars.current_mru,
			region_id: objPageVars.current_region,
			region_name: getRegionNameById(objPageVars.current_region),
			breadcrumb: getMruFilterBreadcrumb()
		}
		setLocalStorageItem(key, JSON.stringify(obj));	
		el.className=el.className +' selected';		
	}

	//alert('added item to favourites');
	renderFavouritePanel();
}
function removeFavourite(e, el){
	e.stopPropagation();
	var elParent=el.parentNode;
	var key = elParent.getAttribute('data-key');
	removeLocalStorageItem('fav_'+key);
	TweenLite.to(elParent, 0.2, {
		left: '100%',
		delay : 0,
		onComplete : function() {
			TweenLite.to(elParent, 0.3, {
				height : 0,
				delay : 0,
				onComplete: function(){
					elParent.parentNode.removeChild(elParent);
					return false;
				}
			});
		}
	});	
	return false;
}
function isFavourite(){
	var key = 'fav_' +objPageVars.current_oru+'_'+objPageVars.current_mru+'_'+objPageVars.current_region;
	var fav = getLocalStorageItem(key);
	return fav!=null;
}
function renderFavouritePanel(){
	var arrFavs = findFavourites();
	var ul = document.createElement('ul');
	for ( var i = 0; i < arrFavs.length; i++) {
		var obj = JSON.parse(arrFavs[i]),
			sector = getSectorFromBreadCrumb(obj.breadcrumb);
		var liItem = document.createElement('li');
		liItem.setAttribute('data-oru', obj.oru);
		liItem.setAttribute('data-mru', obj.mru);
		liItem.setAttribute('data-region', obj.region_id);
		liItem.setAttribute('data-sector', sector);
		var key = obj.oru + '_' + obj.mru + '_' +(obj.oru != 4 ? obj.region_id.toLowerCase() : obj.region_id);
		liItem.setAttribute('data-key', key);
		
		liItem.innerHTML = '<div class="bookmark_color" style="background:'+colors[sector].middle+'"></div><h2>'+obj.region_name+'</h2><span class="bookmark_sub">'+obj.breadcrumb+'</span><div class="remove_bookmark" onclick="removeFavourite(event, this);return false;"></div>';
		liItem.onclick = function(){
			openFavourite(this.getAttribute('data-oru'), this.getAttribute('data-mru'), this.getAttribute('data-region'), this.getAttribute('data-sector'));
		}
		ul.appendChild(liItem);
	}
	appPanels.bookmarkslist.innerHTML = '';
	appPanels.bookmarkslist.appendChild(ul);
}
function getSectorFromBreadCrumb(str){
	if(str.indexOf('ealthcare')> -1){
		return 'PD0900';
	}else if(str.indexOf('ighting')> -1){
		return 'PD0100';
	}else if(str.indexOf('ifestyle')> -1){
		return 'PD0200';
	}else{
		return 'philips';
	}
}
function openFavourite(oru, mru, region, sector){
	objPageVars.current_oru = oru;
	objPageVars.current_mru = mru;
	objPageVars.current_sector = sector;
	updateWorldmap(region);
	btnCloseBookmarksClick(true);
}
/*
 * Data functions
 */
function getMruHtml(cb) {
	var objData = {
		fulldomain: location.protocol+"//"+location.hostname,
		method:'getproductdata',
		type:'json',
		token: objPageVars.token,
		snapshotid:1		
	}
	psv('GET', dynamicResourceUrl, objData, function(data) {
		cb(null, data);
	});
}
function getOruJson(cb){
	var objData = {
		fulldomain: location.protocol+"//"+location.hostname,
		method:'getorudata',
		type:'json',
		token: objPageVars.token,
		snapshotid:1		
	}
	psv('GET', dynamicResourceUrl, objData, function(data) {
		cb(null, data);
	});	
}
function getSnapShotConfig(cb){
	/*var objData = {
		fulldomain: location.protocol+"//"+location.hostname,
		type:'json',
		token: objPageVars.token,
		snapshotid:1		
	}
	psv('GET', authUrl1, objData, function(data) {
		cb(null, data);
	});	*/
	cb(null, {});	
}
function getWorldmapData(cb){
	var objData = {
		fulldomain: location.protocol+"//"+location.hostname,
		method:'getworldmapdata',
		type:'json',
		token: objPageVars.token,
		oru: objPageVars.current_oru,
		mru: objPageVars.current_mru,
		snapshotid:1		
	}
	//showLoadingPanel();
	psv('GET', snapshot_url, objData, function(data) {
		//hideLoadingPanel();
		if(data.error){
			cb(data.error.message);
		}else{
			//JT: this seems to be a really nasty hack...
			cb(null, data);
		}

	});	
}

/*
 * functions
 */
function showLoadingPanel(){
	panels.overlay.style.display = "block";
	TweenLite.to(panels.overlay, 0.3, {
		opacity : 0.7,
		delay : 0,
		onComplete : function() {
			panels.loading.style.display = "block";
			TweenLite.to(panels.loading, 0.4, {
				opacity : 1,
				delay : 0
			});
		}
	});
}
function hideLoadingPanel(){
	panels.loading.style.display = "none";
	TweenLite.to(panels.overlay, 0.3, {
		display : 'none',
		opacity : 0,
		delay : 0,
		onComplete: function(){
			panels.overlay.style.display = "none";
		}
	});

}
function showErrorDiv(strMessage, autoClose){
	panels.error.innerHTML = strMessage;
	TweenLite.to(panels.error, 0.3, {
		opacity : 1
	});	
	if(autoClose) setTimeout(function(){hideErrorDiv();}, 5000);
}
function hideErrorDiv(){
	TweenLite.to(panels.error, 0.3, {
		opacity : 0,
		delay : 0,
		onComplete : function() {
			panels.error.innerHTML = '';
		}
	});
}


//performs an ajax call and inserts the retrieved svg data into the wrapper div
function loadWorldmap(oru, cb){
	

	objTouchVars.elanimate=null;
	var strOru = 'World';
	switch (oru) {
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
	objPageVars.currentsvgname = strOru;
	getEl('region_name').innerHTML = objPageVars.currentsvgname;	
	getEl('filter_breadcrumb').innerHTML = getMruFilterBreadcrumb();
	if(objPageVars.currentsvgid == oru){
		cb();
	}else{
		serverSideRequest({
			url: objPageVars.maps[strOru.toLowerCase()].url, 
			method: 'get', 
			debug: false,
			callback: function(strSvgData){
				//insert the SVG data into the holder div
				objPageElements.elsvgholder.innerHTML=strSvgData;

				//retrieve the base svg elements
				objPageElements.rootanimate=getEl('viewport');
				objPageElements.rootsvg=getEl('holder_1000').getElementsByTagName('svg')[0];
				//console.log(objPageElements.rootsvg);
				//resize the map to fit into the window
				resizeWorldmap();

				


				//prepare an object containing vital information about the svg element to animate
				objPageElements.rootanimateattributevalues=retrieveSvgElementObject(objPageElements.rootanimate);
				
				//apply zoom and pan functionality to the svg drawing
				var bolUseHomeGrown=true;
				if(bolUseHomeGrown){
					//initiate the new version of the zoom pan library
					objTouchSettings.debug=false;
					objTouchSettings.debugtointerface=false;
					objTouchSettings.debugtoconsole=true;
					objZoomPanSettings.mobile=objPageVars.mobile;
					
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
					initSgvZoomPan(objPageElements.rootsvg, objPageElements.rootanimate);

					//console.log(objPageElements.rootanimateattributevalues);
				}else{
					
					initZoomPan(objPageElements.rootsvg);
				}

				centerWorldmap(objPageElements.rootanimate);

				objPageVars.currentsvgid=oru;
				cb();
			}
		});		
		
	}


}

//scale the worldmap svg to fit
function resizeWorldmap(){
	objPageElements.rootsvg.setAttributeNS( null, 'viewBox', '0 0 '+objPageVars.width+' '+objPageVars.height);
	objPageElements.rootsvg.setAttributeNS( null, 'enable-background', 'new 0 0 '+objPageVars.width+' '+objPageVars.height);
	objPageElements.elsvgholder.style.width = objPageVars.width+'px';
	objPageElements.elsvgholder.style.height = objPageVars.height+'px';
	objPageElements.rootsvg.setAttributeNS( null, 'width', objPageVars.width);
	objPageElements.rootsvg.setAttributeNS( null, 'height', objPageVars.height);
}

//moves the worldmap by mimicking a drag in the browser window
function moveWorldMap(intDeltaX, intDeltaY){
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


}

//centers the worldmap in the screen
function centerWorldmap(elSvg){
	//set the worldmap to position 0,0
	svgSetTransform(elSvg, {
		scale: 1,
		translatex: 0,
		translatey: 0,
		transformmatrix: {}
	});
	//console.log(elSvg);

	//move to new position
	moveWorldMap((objPageVars.width/2)-(objPageElements.rootanimateattributevalues.size.width/2)-objPageElements.rootanimateattributevalues.x, (objPageVars.height/2)-(objPageElements.rootanimateattributevalues.size.height/2)-objPageElements.rootanimateattributevalues.y);
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


function startApp(){

	//when done animate loginpanel to background
	TweenLite.to(panels.login, 0.3, {
		width : 0,
		onComplete: function(){
	    	async.parallel({
	    		// load everything needed to start rendering all html parts
	    		// load bookmarks from storage
	    	    bookmarksHtmlArray: function(callback){
	    	    	callback(null, null);
	    	    },
	    	    // load mru HTML for latest snapshot id
	    	    mruHtml: function(callback){
	    	    	getMruHtml(function(err, data){
	    				if(data.error) callback(data.error.message);
	    				callback(null, data.html);
	    			});
	    	    },
	    	    // load mru HTML for latest snapshot id
	    	    oruJson: function(callback){
	    	    	getOruJson(function(err, data){
	    	    		callback(null, data);
	    	    	});
	    	    	
	    	    },
	    	    snapshotConfig: function(callback){
	    	    	getSnapShotConfig(function(err, data){
	    	    		callback(null, data);	
	    	    	});
	    	    }
	    	},
	    	// all done
	    	function(err, results) {
	    		if(err){
	    			btnLogoutClick();
	    		}else{
		    		//debugger;
		    		panels.mruhtml.innerHTML = results.mruHtml;
		    		showMruFilterLevel('philips');
		    		objPageVars.orujson = results.oruJson;
					//get worldmapdata
		    		updateWorldmap();
	    		}
	    	});			
		}
	});   	
}
function updateWorldmap(regionIdToSelect){
	//showLoadingPanel();
	getWorldmapData(function(err, data){
		//alert(err+data);
		//debugger;
		//hideLoadingPanel();	
		if(err){
			btnLogoutClick();			
		}else{
			//load correct map
			var oru = objPageVars.current_oru;
			loadWorldmap(oru, function(){
				//console.log(objPageElements.rootanimate);
				objPageVars.worldmapdata = data.snapshotdata;

				//set the colors
				var arrRegions = getFirstLevelChildElements(getEl('viewport'), 'path') ;// getEl('viewport').getElementsByTagName('g');
				if(arrRegions.length == 0) arrRegions = getFirstLevelChildElements(getEl('viewport'), 'g') ;
				for ( var i = 0; i < arrRegions.length; i++) {
					var region = arrRegions[i],
						regionId = region.id == 'UK' ? 'GB' : region.id,
						key=objPageVars.current_mru + '_' + (oru != 4 ? regionId.toLowerCase() : regionId),
						//JT: need a test here to check if the key really exists
						regionData = (objPageVars.worldmapdata[key])?objPageVars.worldmapdata[key]:false;
					//console.log();
					//debugger;
					if (regionData) {
						var percentageLI = (regionData.l * 100) / regionData.p || 0;
						if(percentageLI> 99)percentageLI=100;
						if(percentageLI< 1)percentageLI=0;
						objPageVars.worldmapdata[key].percentageLI = Math.round(percentageLI);
						var color=colors[objPageVars.current_sector].middle;//getColorForPercentage(percentageLI, colors[objPageVars.current_sector].low, colors[objPageVars.current_sector].middle, colors[objPageVars.current_sector].high);
						objPageVars.worldmapdata[key].color = color;
						var opacity=((percentageLI/100) * 0.7) + 0.3;
						if(opacity < 0.2)opacity = 0.2;
						region.style.fill=color;	
						region.style.opacity=opacity;
						
						var paths=region.getElementsByTagName('*');
						for ( var ii = 0; ii < paths.length; ii++) {
							var path = paths[ii];
							if(path.nodeName == 'path' || path.nodeName == 'polygon' || path.nodeName == 'rect' || path.nodeName == 'g'){
								paths[ii].style.fill=color;	
								paths[ii].style.opacity=1;
							}
						}								
					} else {
						region.style.fill = '#000';
					}							
				}
				//hideLoadingPanel();	
				if(regionIdToSelect){
					regionClick(regionIdToSelect);
				}
			});
			
			
		}
	});	
}
function getMruFilterBreadcrumb(){
	var mru = objPageVars.current_mru;
	var selector = '#filter_container #' + mru;
	var el = Sizzle(selector)[0];
	var name;
	var arrParents = [];
	
	if(el.firstElementChild){
		name = el.firstElementChild.innerHTML
		arrParents.push(name);

		while(el.parentNode !=null && el.parentNode.className !== 'filter_list'){
		    el = el.parentNode; 
		    if(el.localName == 'li'){
		        arrParents.push(el.firstElementChild.innerHTML);
		    }
		    
		}
	}else{
		name = 'Philips';
		arrParents.push(name);
	}

	//if(name!='Philips')arrParents.push('Philips');
	return(arrParents.reverse().join(' &bull; '));	
	
}

function getRegionNameById(regionId){
	return iterate(objPageVars.orujson, 'guid', regionId).name;
}
/*
 * Executes page logic
 */
function initPage() {

	// init global objects
	panels = {
		login : getEl('login_panel'),
		app : getEl('app_panel'),
		bookmarks : getEl('bookmarks_panel'),
		filter : getEl('filter_panel'),
		explain : getEl('explain_panel'),
		overlay : getEl('overlay'),
		mruhtml: getEl('producttree_temp'),
		error: getEl('error'),
		loading: getEl('loading')
	}
	appPanels = {
		map : getEl('map'),
		region_info : getEl('region_info'),
		simulation : getEl('simulation'),
		mru_filter: getEl('filter_container'),
		bookmarkslist: getEl('bookmarkslist')
	}

	//page elements needed for the simulator
	objPageElements.elslidersales=getEl('slidersales');
	objPageElements.elslidersaleslabel=getEl('value_sales');
	objPageElements.elslidergreensales=getEl('slidergreensales');
	objPageElements.elslidergreensaleslabel=getEl('value_green_sales');
	objPageElements.ellivesimprovednumber=getEl('nr_lives_improved');
	objPageElements.ellivesimprovedpercentage=getEl('lives_improved_percentage');

	// set the global page variable to detect if we are running on a mobile device or not
	objPageVars.mobile = isMobile.any();


	//wrapper dive for the worldmap
	objPageElements.elsvgholder=getEl('holder_1000');
	
	
	//elements required for the infographic
	objPageElements.region_info = getEl('info');
	//objPageElements.percentage = getEl('percentage');
	
	//setup the infographic
	objArcProps.targetnode=getEl('arc_path');
	objArcProps.targetleftwrapper=getEl('arc_path_left_wrapper');
	objArcProps.targetleftnode=getEl('arc_path_left');
	renderInfographic({angle: 0});
	
	//render the favourites panel
	objPageVars.arrFavourites = findFavourites();
	renderFavouritePanel();


	
	objPageVars.token = getLocalStorageItem('token');
	objPageVars.username = getLocalStorageItem('username');
	
	if(objPageVars.token !=="" && objPageVars.token !==null){
		startApp();
	}else{
		getEl('username').value = objPageVars.username;
	}
	
}

function onResize() {
	objPageVars.width = document.body.clientWidth;
	objPageVars.height = document.documentElement["clientHeight"];
	resizeWorldmap();
	if(objPageElements.rootanimate!=null)centerWorldmap(objPageElements.rootanimate);
}

/*
 * Global variables
 */
var panels = {};
var appPanels = {};
var objPageElements = {
	map : {},
	regionRaphael: {},
	rootanimate: null
};
var objPageVars = {
	token: '',
	signedin: false,
	mobile: false,
	hammer: null,
	width: document.body.clientWidth,
	height: document.documentElement["clientHeight"],
	selectedregionpath: {},
	//the available maps
	maps: {
		world: {url: 'svg/jvector_world.svg'},
		region: {url: 'svg/jvector_continents.svg'},
		market: {url: 'svg/jvector_markets.svg'},
		country: {url: 'svg/jvector_countries.svg'}
	},
	current_oru: 3,
	current_mru: 'philips',
	current_sector: 'cl',
	current_region: '',
	faqloaded: false
}
var colors = {
	philips: {
		low: '#7DABF1',
		middle: '#0b5ed7',
		high: '#3D7FDF' 
	},
	PD0900: {
		low: '#99EAF0',
		middle: '#2badb5',
		high: '#30B6BF'		
	},
	PD0100: {
		low: '#CBF277',
		middle: '#7dba00',
		high: '#98C833'   		
	},
	PD0200:{
		low: '#BE67E9',
		middle: '#68049c',
		high: '#8737B0'  		
	}
};

var isMobile = {
	any : function() {
		return 'ontouchstart' in document.documentElement;
	}
};


var dynamicResourceUrl = "https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx";
var authUrl1 = "https://www.livesimproved.philips.com/pages/login/login.aspx";
var authUrl2 = "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx";
var authUrl3 = "https://www.livesimproved.philips.com/pages/login/authenticate_user.aspx";
var snapshot_url = 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx';
var simulation_data_url = 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx'

var store = window.localStorage;

var currentScript = null,
	success = null;

window.onload = initPage;
window.onresize = onResize;
