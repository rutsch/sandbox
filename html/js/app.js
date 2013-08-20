/*
Utilities
 */
function getEl(id) {
	return document.getElementById(id);
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
			                    var objDataAuthenticate = {
			                            username: un,
			                            password: pw,
			                            url: '/index.aspx',
			                            token: response.token,
			                            type: 'json',
			                            fulldomain: location.protocol+"//"+location.hostname
			                    };
			                    
			                    psv('POST', authUrl3, objDataAuthenticate, function(response){
			                    	//response = JSON.parse(response);
			                    	if(response.error) {
			                    		handleLoginError(response.error.message);
			                    	}else{
			                    		objPageVars.token = response.token;
			                    		hideLoadingPanel();
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
	back={};

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
					var centerx = left+(width/2);
					
					//debugger;					
					var percentage = 61;
					TweenLite.to(objPageElements.percentage, 0.4, {
						opacity : 1,
						onComplete : function() {	
							animateArc({start: 0, end: (percentage*360) /100}, 2);
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
	var selector = '#producttree_temp li';
	var parent = findParentBySelector(parentId, selector);
	var parentId = parent?parent.getAttribute('id'):'producttree_temp';
	showMruFilterLevel(parentId);
}
function showMruFilterLevel(id){
	var arrLi = getFirstLevelChildElementsById(id, 'li');
	renderMruFilterComponent(arrLi, id);
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
	psv('GET', mruUrl, objData, function(data) {
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
	    				//if(err) callback(err);
	    				callback(null, data.html);
	    			});
	    	    },
	    	    // load mru HTML for latest snapshot id
	    	    oruJson: function(callback){
	    	    	callback(null, null);
	    	    },
	    	    snapshotConfig: function(callback){
	    	    	callback(null, null);
	    	    }
	    	},
	    	// all done
	    	function(err, results) {
	    		
	    		panels.mruhtml.innerHTML = results.mruHtml;
	    		showMruFilterLevel('producttree_temp');
				
				//renderWorldmap();
	    	});			
			
		
		}
	});   	
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
	
	// set the global page variable to detect if we are running on a mobile
	// device or not
	objPageVars.mobile = isMobile.any();

	// initiate the hammer object to capture multitouch events
	if (objPageVars.mobile) {
		// initiate the hammer object on the holder div of the worldmap svg
		/*
		 * Hammer.gestures.Drag.defaults.drag_min_distance=1;
		 * Hammer.gestures.Drag.defaults.correct_for_drag_min_distance=true;
		 * 
		 * objPageVars.hammer = Hammer(document.getElementById("main_wrapper"), {
		 * prevent_default: true, no_mouseevents: true });
		 */
	}


	/*
	Worldmap logic
	*/
	objPageElements.rootanimate=getEl('viewport');
	objPageElements.rootsvg=document.getElementsByTagName('svg')[0];

	objPageElements.rootsvg.setAttributeNS( null, 'viewBox', '0 0 '+objPageVars.width+' '+objPageVars.height);
	//objPageElements.rootsvg.setAttributeNS( null, 'enable-background', '0 0 '+objPageVars.width+' '+objPageVars.height);
	getEl('holder_1000').style.width = objPageVars.width+'px';
	getEl('holder_1000').style.height = objPageVars.height+'px';
	
	objPageElements.rootsvg.setAttributeNS( null, 'width', objPageVars.width);
	objPageElements.rootsvg.setAttributeNS( null, 'height', objPageVars.height);
	
	//scale the svg


	var bolUseHomeGrown=false;
	if(bolUseHomeGrown){
		//initiate the hammer object to capture multitouch events
		setupHammer();

		//prepare an object containing vital information about the svg element to animate
		objPageElements.rootanimateattributevalues=retrieveSvgElementObject(objPageElements.rootanimate);
		console.log(objPageElements.rootanimateattributevalues);
	}else{
		initZoomPan(objPageElements.rootsvg);
	}


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
	

	
	if(objPageVars.signedin && objPageVars.token !==""){
		startApp();
	}
	
}
function onResize() {
	objPageVars.width = document.body.clientWidth;
	objPageVars.height = document.documentElement["clientHeight"];
	//console.log(objPageElements.raphaelmap.height);
	objPageElements.raphaelmap.setSize(objPageVars.width, objPageVars.height);
	//console.log(objPageElements.raphaelmap.height);
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
	token: 'a',
	signedin: true,
	mobile : false,
	hammer : null,
	width : document.body.clientWidth,
	height : document.documentElement["clientHeight"],
	selectedregionpath : {}
}
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

var mruUrl = "https://www.troperlaunna2010.philips.com/tools/dynamic_resources_cached.aspx";
var authUrl1 = "https://www.troperlaunna2010.philips.com/pages/login/login.aspx";
var authUrl2 = "https://www.troperlaunna2010.philips.com/tools/dynamic_resources.aspx";
var authUrl3 = "https://www.troperlaunna2010.philips.com/pages/login/authenticate_user.aspx";
var snapshot_url = 'https://www.troperlaunna2010.philips.com/tools/dynamic_resources_cached.aspx?method=getworldmapdata';

var currentScript = null,
	success = null;

window.onload = initPage;
window.onresize = onResize;
