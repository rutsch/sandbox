window.onload = function () {
	panels = {
		login:  document.getElementById('login_panel'),
		app: document.getElementById('app_panel'),
		bookmarks: document.getElementById('bookmarks_panel'),
		filter: document.getElementById('filter_panel'),
		explain: document.getElementById('explain_panel'),
		overlay: document.getElementById('overlay')
	}
	appPanels = {
		map: document.getElementById('map'),
		region_info: document.getElementById('region_info'), 
		lives_improved: document.getElementById('lives_improved')
	}
}

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
	TweenLite.to(panels.login, 0.2, {width:settings.width});
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

var panels = {};
var appPanels = {};
var settings = {
	width: document.body.clientWidth,
	height: document.documentElement["clientHeight"]
}
