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
function getParamStringFromObject(objParams){
	var params = []; 

	for (var param in objParams) {
		params.push(param + '=' + objParams[param]);
	}        
	return params.join('&');

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
	if(un == "" || pw == "") {
		alert('Please enter a code1 account and a password');
	}else{
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
	objPageElements.regionRaphael.remove();
	TweenLite.to(appPanels.region_info, 0.4, {
		height : 0
	});
	TweenLite.to(appPanels.lives_improved, 0.4, {
		height : 0
	});
	updateVal(0, 100, 50, sec, 2);
}
function regionClick(idCountry) {
	TweenLite.to(appPanels.region_info, 0.4, {
		height : '40%'
	});
	TweenLite.to(appPanels.lives_improved, 0.4, {
		height : '60%',
		onComplete : function() {
			updateVal(90, 100, 50, sec, 2);
		}
	});
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


/*
 Render functions
 */
function renderMruFilterComponent(){
	
}



/*
 * Data functions
 */
function getMruHtml(cb) {
	var objData = {
		fulldomain: 'http://97.95.163.236',//location.protocol+"//"+location.hostname,
		method:'getproductdata',
		type:'json',
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

	// document.getElementsByTagName('svg')[0].id = 'viewport';

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
	    		renderMruFilterComponent();	    		
				renderWorldmap();
				initCircle();	
	    	});			
			
		
		}
	});   	
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
		lives_improved : getEl('lives_improved')
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
	// get colors

	// get bookmarks

	// get mru data to create filter

	
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
	token: 'empty',
	signedin: true,
	mobile : false,
	hammer : null,
	width : document.body.clientWidth,
	height : document.documentElement["clientHeight"],
	selectedregionpath : {}
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
var currentScript = null,
	success = null;

window.onload = initPage;
window.onresize = onResize;
