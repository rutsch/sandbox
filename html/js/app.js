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
function ajax(url, cb) {
	var xmlhttp;
	if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			cb(xmlhttp.responseText);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}
 
function getJSON(url, data, cb) {
	var src = url + (url.indexOf("?")+1 ? "&" : "?");
	var head = document.getElementsByTagName("head")[0];
	var newScript = document.createElement("script");
	var params = [];
	var param_name = ""
	
	this.success = cb;
	
	data["callback"] = "success";
	for(param_name in data){  
	    params.push(param_name + "=" + encodeURIComponent(data[param_name]));  
	}
	src += params.join("&")
	
	newScript.type = "text/javascript";  
	newScript.src = src;
	
	if(this.currentScript) head.removeChild(currentScript);
	head.appendChild(newScript); 
}


/*
 * Click functions
 */
function btnSubmitClick() {
	TweenLite.to(panels.login, 0.3, {
		width : 0
	});
}
function btnBackToMapClick() {
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
			var R = Raphael("region_info", 200, 200);
			R.setViewBox(0, 0, 200, 200, true);
			var path = R.path(
					objPageElements.map[idCountry].node.getAttribute("d"))
					.attr({
						fill : '#000000',
						stroke : '#000000',
						'stroke-width' : 1
					});
			updateVal(90, 100, 50, sec, 2);
			// debugger;
			// objPageVars.selectedregionpath =
			// document.getElementById(idCountry).cloneNode(true);
			// document.getElementById("region_svg").appendChild(objPageVars.selectedregionpath);
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
function getMruHtml() {
	getJSON(mruUrl, {}, function(data) {
		panels.mruhtml.innerHTML = data.html;
		renderMruFilterComponent();
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
		mruhtml: getEl('producttree_temp')
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

	getMruHtml();
	renderWorldmap();
	initCircle();
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
	map : {}
};
var objPageVars = {
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
var mruUrl = "https://www.troperlaunna2010.philips.com/tools/dynamic_resources_cached.aspx?method=getproductdata&type=json&snapshotid=1";
var currentScript = null,
	success = null;

window.onload = initPage;
window.onresize = onResize;