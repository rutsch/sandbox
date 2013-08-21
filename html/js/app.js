/*
Utilities
 */
function getEl(id) {
	return document.getElementById(id);
}
function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

function logAction(event, elThis, strType) {
	console.log(strType);
	console.log(event);
}
function lon2x(lon) {
	var xfactor = 2.752;
	var xoffset = 473.75;
	var x = (lon * xfactor) + xoffset;
	return x;
}
function lat2y(lat) {
	var yfactor = -2.753;
	var yoffset = 231;
	var y = (lat * yfactor) + yoffset;
	return y;
}
function plot(lat, lon, size) {
	size = size * .5 + 4;
	return R.circle(lon2x(lon), lat2y(lat), size).attr(city_attr);
}
function collectionHas(a, b) { //helper function (see below)
    for(var i = 0, len = a.length; i < len; i ++) {
        if(a[i] == b) return true;
    }
    return false;
}
function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}
function getCookie(c_name)
{
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1){
		c_start = c_value.indexOf(c_name + "=");
  	}
	if (c_start == -1){
		c_value = null;
	}
	else{
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1){
			c_end = c_value.length;
	 	}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}
function getFirstLevelChildElementsById(parentId, childNodeType){
	//debugger;
	var selector = parentId ==='producttree_temp'?'#producttree_temp':'#producttree_temp #' + parentId;
	var parent = Sizzle(selector);
	parent = parent[0].getElementsByTagName('ul')[0];
	
	var	childElements = parent.getElementsByTagName('li'),
		result = [];

	for (i=0;i<childElements.length;i++) { 
	    if (childElements[i].parentNode === parent){
	    	result.push(childElements[i]);
	    }
	};	
	return result;
}
function getFirstLevelChildElements(parent, childNodeType){
	//debugger;
	
	var	childElements = parent.getElementsByTagName(childNodeType),
		result = [];

	for (i=0;i<childElements.length;i++) { 
	    if (childElements[i].parentNode === parent){
	    	result.push(childElements[i]);
	    }
	};	
	return result;
}
function findParentBySelector(parentId, selector) {
	var elm = getEl(parentId);
    var all = document.querySelectorAll(selector);
    var cur = elm.parentNode;
    while(cur && !collectionHas(all, cur)) { //keep going up until you find a match
        cur = cur.parentNode; //go up
    }
    return cur; //will return null if not found
}
function traverse_it(obj){
    for(var prop in obj){
        if(typeof obj[prop]=='object'){
            // object
            traverse_it(obj[prop[i]]);
        }else{
            // something else
            alert('The value of '+prop+' is '+obj[prop]+'.');
        }
    }
}
function getParamStringFromObject(objParams){
	var params = []; 

	for (var param in objParams) {
		params.push(param + '=' + objParams[param]);
	}        
	return params.join('&');

}
function toggleClass(el, cls){
	var cur = el.getAttribute('class');

	if(cur.indexOf(cls)>-1){
		cur = cur.replace(cls, '');
	}else{
		cur = cur + ' ' +cls;
	}
	el.setAttribute('class', cur);
}

function getTransformedWidth(svg, el){
	//debugger;
    var matrix = el.getTransformToElement(svg);
    return matrix.a*el.cx.animVal.value;
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
function rgbFromHex(hex){
	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
	return {
		r: hexToR(hex),
		g: hexToG(hex),
		b: hexToB(hex)
	}
}
function psv(type, url, objParams, cb) {
	var xmlhttp,
	strParams = '';
	
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			cb(JSON.parse(xmlhttp.responseText));
		}
	};
	
	strParams = getParamStringFromObject(objParams);
	
	xmlhttp.open(type, url + (type==="GET" ? '?'+strParams : ''), true);
	
	xmlhttp.crossDomain=true;
	xmlhttp.withCredentials = true;	
	if(type =="POST"){
		xmlhttp.timeout = 40000;
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.send(strParams);		
	}else{
		xmlhttp.send();
	}
}


function serverSideRequest(objArguments){
	/*
	This function performs a serverside request by using the passed xmlhttp object.
	It returns the string that the server side script returned (sync) or passes the string on a user defined function 'callbackFunction' (async)
	Use named argument syntax:
	serverSideRequest({url: '/bla.html', callback: 'performTask()', method: 'get', formdata: arrFormData, debug: false})
	*/
	var bolAsync=true, bolSubmitFormData=false, bolDebug=false, bolSubmitXmlFile=false;
	var strDebug, strKey, strValue, strFormData='', strResult;
	var strUrl='', strMethod='post', arrFormData='';
	var callbackFunction=null;

	//translate the passed object into local variables
	strUrl=typeof objArguments.url != 'undefined'? objArguments.url : '';

	callbackFunction=typeof objArguments.callback != 'undefined'? objArguments.callback : null;

	strMethod=typeof objArguments.method != 'undefined'? objArguments.method.toLowerCase() : 'get';
	strDebug=typeof objArguments.debug != 'undefined'? objArguments.debug+'' : 'false';
	if(strDebug.toLowerCase()=='true')bolDebug=true;
	//form data
	arrFormData=typeof objArguments.arrdata != 'undefined'? objArguments.arrdata : '';
	if(typeof(arrFormData)=='string')arrFormData=typeof objArguments.formdata != 'undefined'? objArguments.formdata : '';
	if(bolDebug)arrFormData['debug']='true';
	if(typeof(arrFormData)!='string')bolSubmitFormData=true;

	
	//detrmine asynchronous request
	if(callbackFunction==null)bolAsync=false;	

	//bolDebug=true;
	if(bolDebug)alert("Parameters recieved:\n"+"strUrl="+strUrl+"\n"+"callbackFunction="+callbackFunction+"\n"+"strMethod="+strMethod+"\n"+"arrFormData="+arrFormData+"\n bolSubmitFormData="+bolSubmitFormData+"\nbolAsync="+bolAsync);


	//bypass caching by adding a querystring to the url
	if(strMethod=='post'){
		strUrl+=(strUrl.indexOf('?')>0)?'&rnd=' + generateUniqueId():'?rnd=' + generateUniqueId();
	}else{
		if(typeof(arrFormData)!='string'){
			arrFormData['rnd']=generateUniqueId();
		}else{
			arrFormData=new Array();
			arrFormData['rnd']=generateUniqueId();
			bolSubmitFormData=true;
		}
	}

	//form data to sent
	if(bolSubmitFormData){
		var arr=new Array();
		for(strKey in arrFormData){
			//alert(typeof(arrFormData[strKey]));
			if(typeof(arrFormData[strKey])!='function' && typeof(arrFormData[strKey])!='object'){
				strValue=encodeUrl(arrFormData[strKey]);
				arr.push(strKey+"="+strValue)
			}
		}
		strFormData=arr.join('&');
		if(bolDebug)alert('Form data sent to server:\n'+strFormData);
	}

	//create remote xmlhttp object
	objXmlHttpLocal = createRemote();

	//determine onreadystatechange function (async only)
	if(bolAsync){
		objXmlHttpLocal.onreadystatechange= function() {
			if (objXmlHttpLocal.readyState == 4) {
				if (objXmlHttpLocal.status == 200) {
				  //ok
				  strResult=objXmlHttpLocal.responseText;
				  if(bolDebug)alert("just before callback function\n\n"+strResult);
				  callbackFunction(strResult);
				}else{
					strResult="ERROR: There was a problem retrieving the server side data:\n" + objXmlHttpLocal.statusText;
					alert(strResult);
				}
			}
		}
	}else{
		//make sure to clear any previously attached onreadystate functions
		/*
		Need to investigate memory leak problems in IE
		*/
		objXmlHttpLocal.onreadystatechange = function(){};
	}



	//perform request
	if(strMethod.toLowerCase()=="get")strUrl+="?"+strFormData;
	objXmlHttpLocal.open(strMethod.toUpperCase(), strUrl, bolAsync);
	if(bolSubmitFormData && strMethod.toLowerCase()=="post"){
		objXmlHttpLocal.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		objXmlHttpLocal.send(strFormData);
	}else{
		if(bolSubmitXmlFile){
			objXmlHttpLocal.send(arrFormData);
		}else{			
			objXmlHttpLocal.send(null);
		}
	}

	if(!bolAsync)return objXmlHttpLocal.responseText;
	
	function createRemote(){
		try {
			return(new XMLHttpRequest());
		}
		catch(e) {
			return(new ActiveXObject('Microsoft.XMLHTTP'));
		}
	}
	
}
function encodeUrl(sStr) {
	return escape(sStr).replace(/\+/g, '%2C').replace(/\"/g,'%22').replace(/\'/g, '%27').replace(/\//g, '%2F');
}
function generateUniqueId(){
	var t=Math.random();
	t=Math.round(t*10000);
	var t2=Math.random();
	t2=Math.round(t*10000);
	var objDate=new Date();
	var intSec=objDate.getSeconds();
	t=t+"x"+intSec+"x"+t2;
	return t;
}

/*
 * Click functions
 */
function btnSubmitClick() {

	if(un == "" || pw == "") {
		alert('Please enter a code1 account and a password');
	}else{
		showLoadingPanel();
		// Start authentication
		getEl('btn_submit').style.border = '1px solid red';
		var un = getEl("username").value, 
			pw = getEl("password").value,
			handleLoginError = function(msg){
				hideLoadingPanel();
				getEl("username").value = '';
				getEl("password").value = '';
				getEl('btn_submit').style.border = 'none';
				showErrorDiv(msg, true);			
			};		
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
			                    		setCookie('token', objPageVars.token, 1);

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
	TweenLite.to(objPageElements.region_info, 0.4, {
		opacity : 0,
		delay: 0,
		onComplete: function(){
			TweenLite.to(objPageElements.percentage, 0.4, {
				opacity : 0,
				onComplete : function() {
					TweenLite.to(appPanels.simulation, 0.4, {
						height : 0,
						onComplete : function() {	
							
						}
					});	
					TweenLite.to(appPanels.region_info, 0.4, {
						height : 0
					});					
				}
			});
		}
	});
	toggleClass(getEl('btn_back'), 'hide');
	//updateVal(0, 100, 50, sec, 2);
}
function btnLogoutClick() {
	TweenLite.to(panels.login, 0.2, {
		width : objPageVars.width
	});
}
function btnFilterClick() {
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
	updateWorldmap();
	TweenLite.to(panels.filter, 0.4, {
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
function btnExplainClick() {
	panels.overlay.style.display = "block";
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
function btnBookmarksClick() {
	location.reload();
	/*
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
	*/
}
function btnCloseBookmarksClick() {
	TweenLite.to(panels.bookmarks, 0.4, {
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
function countryClicked(idCountry) {
	if (idCountry !== "") {
		regionClick(idCountry);
	}
}
function regionClick(idCountry) {
	var sec={},
	back={},
	key=objPageVars.current_mru + '_' + idCountry,
	regionData = objPageVars.worldmapdata[key];
	
	TweenLite.to(getEl(idCountry), 0.5, {
		opacity: 0.5, 
		onComplete: function(){
			getEl('nr_lives_improved').innerHTML =regionData.l;
			getEl('nr_gdp').innerHTML ='$'+regionData.g+' trillion';
			getEl('nr_population').innerHTML =regionData.p+ ' million';
			getEl('lives_improved_percentage').innerHTML = regionData.percentageLI+'%';
			getEl('region_name').innerHTML = getRegionNameById(idCountry);
			getEl('filter_breadcrumb').innerHTML = getMruFilterBreadcrumb();
			
			toggleClass(getEl('btn_back'), 'hide');
			TweenLite.to(appPanels.region_info, 0.4, {
				height : '40%'
			});
			TweenLite.to(appPanels.simulation, 0.4, {
				height : '60%',
				onComplete : function() {
					//updateVal(61, 100, 50, sec, 2, 1500);
					TweenLite.to(objPageElements.region_info, 0.4, {
						opacity : 1,
						onComplete : function() {
							//updateVal(61, 100, 50, sec, 2, 1500);
							// position the percentage div over the circle svg
							var elCircle = getEl('background');
							
							//var width = elCircle.getBBox().width;
							//var width2 = getTransformedWidth(objPageElements.circlesvg, elCircle);
							var boundingRect = elCircle.getBoundingClientRect(); 
							var width=boundingRect.width*100/90;
							var left=boundingRect.left;
							var centerx = left+(width/2) -10;
							debugger;
							objPageElements.percentage.style.left = centerx - (objPageElements.percentage.clientWidth /2) + 'px';
							objPageElements.percentage.style.bottom = (boundingRect.bottom /8) + (width/2) - (objPageElements.percentage.clientHeight / 2)  + 'px';
												
							TweenLite.to(objPageElements.percentage, 0.4, {
								opacity : 1,
								onComplete : function() {	
									animateArc({start: 0, end: (regionData.percentageLI*360) /100}, 2);
									TweenLite.to(getEl(idCountry), 0.5, {
										opacity: 1
									});
								}
							});
						}
					});			
				}
			});			
		}
	});
	

}
function updateValue(val, id){
	var target = getEl(id);
	target.innerHTML = (val > 0 ? '+': '') + val + '%';
}

/*
MRU Filter functions
*/
function renderMruFilterComponent(arrLi, parentId){
	appPanels.mru_filter.innerHTML = '';
	var ul = document.createElement('ul'),
		liHeader = document.createElement('li'),
		backButton = document.createElement('div');
	
	liHeader.setAttribute('class', 'mru_filter_header');
	backButton.setAttribute('id', 'btn_back');
	backButton.onclick = function(){
		levelUp(parentId);
	}
	liHeader.appendChild(backButton);
	ul.appendChild(liHeader);
	for ( var i = 0; i < arrLi.length; i++) {
		var liItem = document.createElement('li'),
			id = arrLi[i].id,
			title = getFirstLevelChildElements(arrLi[i], 'div')[0].innerHTML;
		//debugger;
		
		liItem.id = id;
		liItem.setAttribute('class', 'mru_filter_element');
		liItem.setAttribute('data-title', id);
		liItem.onclick = function(){
			showMruFilterLevel(this.id);
		}
		liItem.innerHTML = title;
		ul.appendChild(liItem);
	}
	
	appPanels.mru_filter.appendChild(ul);
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
function setCurrentOru(oru){
	objPageVars.current_oru = oru;
}
function toggleFavourite(){
	
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
	psv('GET', dynamicResourceUrl, objData, function(data) {
		if(data.error)cb(data.error.message);
		cb(null, data);
	});	
}
/*
 * Worldmap Logic
 */
function renderWorldmap() {
	// attributes for the worldmap
	var attr = {
		fill : "#999",
		stroke : "#666",
		"stroke-width" : .5,
		"stroke-linejoin" : "round"
	};

	// initiate the raphael object
	var R = Raphael("holder_1000", objPageVars.width, objPageVars.height);

	R.ZPD({
		zoom : true,
		pan : true,
		drag : false
	});

	R.setViewBox(0, 0, objPageVars.width, objPageVars.height, true);
	R.canvas.setAttribute('preserveAspectRatio', 'none');

	// render the map
	var map = objPageElements.map;
	render_map(R, map, attr);

	// set the effects in the map
	var current = null;
	if (objPageVars.mobile) {
		// on mobile - set the id of the country in the generated SVG map so
		// that we can pick it up
		for ( var state in map) {
			// console.log(state);
			map[state].node.id = state;
			// set the color for the region
			map[state].animate({
				fill : Raphael.getColor(),
				stroke : "#666"
			}, 300);
		}
	} else {
		for ( var state in map) {
			map[state].node.id = state;
			map[state].color = Raphael.getColor();
			map[state].animate({
				fill : Raphael.getColor(),
				stroke : "#666"
			}, 300);
			(function(st, state) {
				st[0].style.cursor = "pointer";
				st[0].onmouseover = function() {
					current && map[current].animate({
						fill : "#999",
						stroke : "#666"
					}, 300);
					st.animate({
						fill : st.color,
						stroke : "#ccc"
					}, 300);
					R.safari();
					current = state;
				};
				st[0].onmouseout = function() {
					st.animate({
						fill : "#999",
						stroke : "#666"
					}, 300);
					R.safari();
				};

				st[0].onclick = function() {
					countryClicked(state);
				};
			})(map[state], state);
		}
		; // end for
	}

	R.safari();
	objPageElements.raphaelmap = R;
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
				display : 'block',
				opacity : 1,
				delay : 0
			});
		}
	});
}
function hideLoadingPanel(){
	TweenLite.to(panels.loading, 0.4, {
		opacity : 0,
		delay : 0,
		onComplete : function() {
			panels.loading.style.display = "none";
			TweenLite.to(panels.overlay, 0.3, {
				display : 'block',
				opacity : 0,
				delay : 0,
				onComplete: function(){
					panels.overlay.style.display = "none";
				}
			});
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
			generateArc({
				targetnode: objArcProps.targetnode,
				centerx: objArcProps.centerx,
				centery: objArcProps.centery,
				radius: objArcProps.radius,
				angle: objToAnimate.angle
			});

		}
	});

}

//performs an ajax call and inserts the retrieved svg data into the wrapper div
function loadWorldmap(oru, cb){
	
	var strOru = 'world';
	switch (oru) {
	case 1:
		strOru = 'world';
		break;
	case 2:
		strOru = 'region';
		break;
	case 3:
		strOru = 'market';
		break;
	case 4:
		strOru = 'country';
		break;
	default:
		break;
	}	
	if(objPageVars.currentsvgid == oru){
		cb();
	}else{
		serverSideRequest({
			url: objPageVars.maps[strOru].url, 
			method: 'get', 
			debug: true,
			debug: false,
			callback: function(strSvgData){
				//insert the SVG data into the holder div
				objPageElements.elsvgholder.innerHTML=strSvgData;

				//retrieve the base svg elements
				objPageElements.rootanimate=getEl('viewport');
				objPageElements.rootsvg=document.getElementsByTagName('svg')[0];
				
				//resize the map to fit into the window
				resizeWorldmap();

				

				//prepare an object containing vital information about the svg element to animate
				objPageElements.rootanimateattributevalues=retrieveSvgElementObject(objPageElements.rootanimate);

				centerWorldmap(objPageElements.rootanimate);
				
				//apply zoom and pan functionality to the svg drawing
				var bolUseHomeGrown=false;
				if(bolUseHomeGrown){
					//initiate the hammer object to capture multitouch events
					setupHammer();


					//console.log(objPageElements.rootanimateattributevalues);
				}else{
					initZoomPan(objPageElements.rootsvg);
				}
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

function centerWorldmap(elSvg){

	var offsetX=-(objPageElements.rootanimateattributevalues.size.width/2);
	if(objPageVars.width>objPageElements.rootanimateattributevalues.size.width)offsetX=0-offsetX;
	
	var offsetY=-(objPageElements.rootanimateattributevalues.size.height/2);
	//if(objPageVars.height>objPageElements.rootanimateattributevalues.size.height)offsetY=0-offsetY-(objPageElements.rootanimateattributevalues.size.height/2);

	svgSetTransform(elSvg, {
		scale: 1,
		translatex: offsetX,
		translatey: offsetY,
		transformmatrix: {}
	});
}

//sets the transform attribute on the passed svg node
function svgSetTransform(elSvg, objSvgProperties){
	var bolUseStringMethod=true;

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
	    			setCookie('token', '', 365);
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
function updateWorldmap(){
	getWorldmapData(function(err, data){
		//debugger;
		
		if(err){
			setCookie('token', '', 365);
			btnLogoutClick();			
		}else{
			//load correct map
			var oru = objPageVars.current_oru;

			loadWorldmap(oru, function(){
				objPageVars.worldmapdata = data.snapshotdata;
				var arrRegions = getFirstLevelChildElements(getEl('viewport'), 'g') ;// getEl('viewport').getElementsByTagName('g');
				//debugger;
				for ( var i = 0; i < arrRegions.length; i++) {
					var region = arrRegions[i],
						regionId = region.id == 'UK' ? 'GB' : region.id,
						key=objPageVars.current_mru + '_' + (oru == 3 ? regionId.toLowerCase() : regionId),
						regionData = objPageVars.worldmapdata[key];
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
						region.style.opacity=1;
						
						var paths=region.getElementsByTagName('*');//.concat(region.getElementsByTagName('path'),region.getElementsByTagName('rect'),region.getElementsByTagName('polygon'));
						for ( var ii = 0; ii < paths.length; ii++) {
							var path = paths[ii];
							if(path.nodeName == 'path' || path.nodeName == 'polygon' || path.nodeName == 'rect' || path.nodeName == 'g'){
								paths[ii].style.fill=color;	
								paths[ii].style.opacity=opacity;
							}
						}									
					} else {
						region.style.fill = '#000';
					}							
				}
				hideLoadingPanel();				
			});
			
			
		}
	});	
}
function getMruFilterBreadcrumb(){
	var mru = objPageVars.current_mru;
	var el = getEl(mru);
	var name = el.firstElementChild.innerHTML,
	    arrParents = [];
	arrParents.push(name);

	while(el.parentNode !=null && el.parentNode.className !== 'filter_list mru'){
	    el = el.parentNode; 
	    if(el.localName == 'li'){
	        arrParents.push(el.firstElementChild.innerHTML);
	    }
	    
	}

	return(arrParents.reverse().join(' - '));	
	
}
var matchFound= false,
returnObj;
function iterate(obj, type, value) {
	for (var property in obj) {
	    
	    if (obj.hasOwnProperty(property)) {
	        if (typeof obj[property] == "object")
	            iterate(obj[property], type, value);
	        else
	            if(obj[property] === value){
	                if(property === type){
	                    returnObj = obj;
	                    matchFound= true;
	                    break;
	                }
	            }
	    }
	}
	return returnObj;
}
function getRegionNameById(regionId){
	return iterate(objPageVars.orujson, 'guid', regionId).name;
}
/*
 * Executes page logic
 */
function initPage() {
	//alert('in');
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
		mru_filter: getEl('filter_container')
	}

	
	// set the global page variable to detect if we are running on a mobile device or not
	objPageVars.mobile = isMobile.any();


	//load the worldmap and continue processing
	objPageElements.elsvgholder=getEl('holder_1000');
	


	//initiate the infographic
	objPageElements.circlesvg = getEl('svg_circle');
	objPageElements.svgpath=getEl('arc_path');
	objPageElements.region_info = getEl('info');
	objPageElements.percentage = getEl('percentage');
	
	objArcProps.targetnode=objPageElements.svgpath;
	var objArcProperties={
		targetnode: objArcProps.targetnode,
		centerx: objArcProps.centerx,
		centery: objArcProps.centery,
		radius: objArcProps.radius,
		angle: 0
	}

	//calls the function that generates an arc from the path svg node
	generateArc(objArcProperties);
	
	objPageVars.token = getCookie('token');
	
	if(objPageVars.token !=="" && objPageVars.token !==null){
		startApp();
	}	
	
}

function onResize() {
	objPageVars.width = document.body.clientWidth;
	objPageVars.height = document.documentElement["clientHeight"];
	resizeWorldmap();
	//centerWorldmap(objPageElements.rootanimate);
}

/*
 * Global variables
 */
var panels = {};
var appPanels = {};
var objPageElements = {
	map : {},
	regionRaphael: {}
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
		world: {url: 'svg/World.svg'},
		region: {url: 'svg/Continents.svg'},
		market: {url: 'svg/Markets.svg'},
		country: {url: 'svg/Countries.svg'}
	},
	current_oru: 4,
	current_mru: 'philips',
	current_sector: 'cl'
}
var colors = {
	philips: {
		low: '#7DABF1',
		middle: '#5C95EA',
		high: '#3D7FDF' 
	},
	PD0900: {
		low: '#99EAF0',
		middle: '#5BCCD4',
		high: '#30B6BF'		
	},
	PD0100: {
		low: '#CBF277',
		middle: '#A6D542',
		high: '#98C833'   		
	},
	PD0200:{
		low: '#BE67E9',
		middle: '#A359C8',
		high: '#8737B0'  		
	}
};
//global properties of the arc to build
var objArcProps={
	targetnode: null,
	centerx: 200,
	centery: 200,
	radius: 100,
	angle: 0
}
var isMobile = {
	any : function() {
		return 'ontouchstart' in document.documentElement;
	}
};


var dynamicResourceUrl = "https://www.livesimproved.philips.com/tools/dynamic_resources_cached.aspx";
var authUrl1 = "https://www.livesimproved.philips.com/pages/login/login.aspx";
var authUrl2 = "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx";
var authUrl3 = "https://www.livesimproved.philips.com/pages/login/authenticate_user.aspx";
var snapshot_url = 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached.aspx?method=getworldmapdata';


var currentScript = null,
	success = null;

window.onload = initPage;
window.onresize = onResize;
