/*
Utilities
*/
function getEl(id) {
    return document.getElementById(id);
}

function logAction(event, elThis, strType){
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
function plot(lat,lon,size) {
	size = size * .5 + 4;
	return R.circle(lon2x(lon), lat2y(lat), size).attr(city_attr);
}



/*
 Click functions
 */
function btn_submit_click(){
	TweenLite.to(panels.login, 0.3, {width:0});
	
}
function btn_back_to_map_click(){
	TweenLite.to(appPanels.region_info, 0.4, {height:0});
	TweenLite.to(appPanels.lives_improved, 0.4, {height:0});
}
function region_click(){
	TweenLite.to(appPanels.region_info, 0.4, {height:'40%'});
	TweenLite.to(appPanels.lives_improved, 0.4, {height:'60%'});	
}
function btn_logout_click(){
	TweenLite.to(panels.login, 0.2, {width:objPageVars.width});
}

function btn_filter_click(){
	panels.overlay.style.display = "block";
	TweenLite.to(panels.overlay, 0.3, {opacity: 0.7, delay: 0, onComplete: function(){
		TweenLite.to(panels.filter, 0.4, {display: 'block', opacity: 1, delay: 0});
	}});
}

function btn_close_filter_click(){
	TweenLite.to(panels.filter, 0.4, {opacity: 0, display: 'none', delay: 0, onComplete: function(){
		TweenLite.to(panels.overlay, 0.3, {opacity: 0, delay: 0, onComplete: function(){
			panels.overlay.style.display = "none";
		}});		
	}});
}

function btn_explain_click(){
	panels.overlay.style.display = "block";
	TweenLite.to(panels.overlay, 0.3, {opacity: 0.7, delay: 0, onComplete: function(){
		TweenLite.to(panels.explain, 0.4, {display: 'block', opacity: 1, delay: 0});
	}});	
}

function btn_close_explain_click(){
	TweenLite.to(panels.explain, 0.4, {opacity: 0, display: 'none', delay: 0, onComplete: function(){
		TweenLite.to(panels.overlay, 0.3, {opacity: 0, delay: 0, onComplete: function(){
			panels.overlay.style.display = "none";
		}});		
	}});
}

function btn_bookmarks_click(){
	panels.overlay.style.display = "block";
	TweenLite.to(panels.overlay, 0.3, {opacity: 0.7, delay: 0, onComplete: function(){
		TweenLite.to(panels.bookmarks, 0.4, {display: 'block', opacity: 1, delay: 0});
	}});	
	
}
function btn_close_bookmarks_click(){
	TweenLite.to(panels.bookmarks, 0.4, {opacity: 0, display: 'none', delay: 0, onComplete: function(){
		TweenLite.to(panels.overlay, 0.3, {opacity: 0, delay: 0, onComplete: function(){
			panels.overlay.style.display = "none";
		}});		
	}});
}
/*
 Worldmap Logic
 */
function renderWorldmap(){
	//attributes for the worldmap				
	var attr = {
		fill: "#333",
		stroke: "#888",
		"stroke-width": .5,
		"stroke-linejoin": "round"
	};	

		
	//var width = document.getElementById('holder_1000').style.width;
	//var height = document.getElementById('holder_1000').style.height * 0.99;
	//alert(document.documentElement["clientHeight"]);

    //initiate the raphael object
	var R = Raphael("holder_1000", document.body.clientWidth, document.documentElement["clientHeight"]);
	R.ZPD({ zoom: true, pan: true, drag: false });
	//R.setViewBox(0, 0, document.body.clientWidth, document.documentElement["clientHeight"], false);

	//render the map
	var map = {};
	render_map(R, map, attr);

	//set the effects in the map
	var current = null;
	for (var state in map) {							        
        map[state].color = Raphael.getColor();
        (function (st, state) {
			st[0].style.cursor = "pointer";
			st[0].onmouseover = function () {
				current && map[current].animate({fill: "#333", stroke: "#666"}, 300);
				st.animate({fill: st.color, stroke: "#ccc"}, 300);
				R.safari();
				current = state;
			};
			st[0].onmouseout = function () {
				st.animate({fill: "#333", stroke: "#666"}, 300);
				R.safari();
			};
			
			st[0].onclick = function () {
				alert(state);
			};
		})(map[state], state);
	}; // end for
	
	//document.getElementsByTagName('svg')[0].id = 'viewport';

	R.safari();	
}

/*
Executes page logic
*/
function initPage() {
	//init global objects
	panels = {
		login:  getEl('login_panel'),
		app: getEl('app_panel'),
		bookmarks: getEl('bookmarks_panel'),
		filter: getEl('filter_panel'),
		explain: getEl('explain_panel'),
		overlay: getEl('overlay')
	}
	appPanels = {
		map: getEl('map'),
		region_info: getEl('region_info'), 
		lives_improved: getEl('lives_improved')
	}
	//set the global page variable to detect if we are running on a mobile device or not
	objPageVars.mobile=isMobile.any();

	//initiate the hammer object to capture multitouch events
	if(objPageVars.mobile){
		//initiate the hammer object on the holder div of the worldmap svg
		Hammer.gestures.Drag.defaults.drag_min_distance=1;
		Hammer.gestures.Drag.defaults.correct_for_drag_min_distance=true;

		objPageVars.hammer = Hammer(document.getElementById("main_wrapper"), {
			prevent_default: true,
			no_mouseevents: true
		});
	}	
	renderWorldmap();
}

var panels = {};
var appPanels = {};
var objPageElements={};
var objPageVars={
	mobile: false,
	hammer: null,
	width: document.body.clientWidth,
	height: document.documentElement["clientHeight"]	
}
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

window.onload = initPage;