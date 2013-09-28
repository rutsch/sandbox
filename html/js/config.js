var objConfig = {
	urls: {
		dynamicresourceurl: 'https://www.livesimproved.philips.com/tools/dynamic_resources_cached_closed.aspx',
		authurl1: "https://www.livesimproved.philips.com/pages/login/login.aspx",
		authurl2: "https://www.livesimproved.philips.com/tools/dynamic_resources.aspx",
		authurl3: "https://www.livesimproved.philips.com/pages/login/authenticate_user.aspx",
	},
	colors:{
		philips: {
			low: '#7DABF1',
			middle: '#3D7FDF',
			high: '#0b5ed7' 
		},
		PD0900: {
			low: '#99EAF0',
			middle: '#30B6BF',
			high: '#2badb5'		
		},
		PD0100: {
			low: '#CBF277',
			middle: '#98C833',
			high: '#7dba00'   		
		},
		PD0200:{
			low: '#BE67E9',
			middle: '#8737B0',
			high: '#68049c'  		
		}

	},
	hideinactivecountries: true,
	defaultmru: 'philips',
	defaultoru: '3',
	snapshots: null,
	currentsnapshotid: 'nothing'
}


//the files that we need to load dynamically
var arrCssResources=[
	'/css/style.css',
	'/css/graph.css'
];

var arrJsResources=[
	'/js/helpers/utils.js',
	'/js/helpers/store.js',
	'/js/helpers/infographic.js',
	'/js/helpers/psv.js',
	'/js/panels/footer.js',
	'/js/panels/header.js',
	'/js/panels/map.js',
	'/js/panels/overlay.js',
	'/js/panels/region_info.js',
	'/js/panels/sliders.js',
	'/js/panels/login.js',
	'/js/panels/error.js',
	'/js/panels/filter.js',
	'/js/panels/bookmarks.js',
	'/js/panels/explain.js',
	'/js/panels/graph.js',
	'/js/panels/loading.js',
	'/js/panels/first_login.js',
	'/js/elements/mru_filter.js',
	'/js/elements/oru_filter.js',
	'/js/app.js'
];

//base url's of the resources
var strBaseUrl='https://www.livesimproved.philips.com/webapp/html';
if(location.href.indexOf('http')>-1){
	//running on a website - grab the base url
	if(location.href.indexOf('index.html')>-1){
		strBaseUrl=location.href.replace(/^(.*)\/index.html.*$/, "$1");
	}else{
		strBaseUrl=location.href.replace(/^(.*)\/(\?.*).$/, "$1");
	}
}else{
	//running inside the app or running from the filesystem
	//baseurl can be overwritten using the querystring
	if(location.search.indexOf('sitetype')>-1){
		
		if(location.search.indexOf('sitetype=johan')>-1){
			//johan
			strBaseUrl='http://10.0.1.5';
		}else if(location.search.indexOf('sitetype=rutger')>-1){
			//rutger
			strBaseUrl='http://95.97.163.236/sandbox/html';
		}else if(location.search.indexOf('sitetype=dev')>-1){
			//development
			strBaseUrl='https://nlnehvgdc1vw991.code1.philips.com/webapp/html';
		}
	}else{
		if(location.href.indexOf('johan')>-1){
			//johan
			strBaseUrl='http://10.0.1.5';
		}else if(location.href.indexOf('rutger')>-1){
			//rutger
			strBaseUrl='http://95.97.163.236/sandbox/html';
		}else if(location.href.indexOf('dev')>-1){
			//development
			strBaseUrl='https://nlnehvgdc1vw991.code1.philips.com/webapp/html';
		}
	}
}

//alert(strBaseUrl);

//this function inject a resource in the html
function loadRemoteFile(filename){
	if (filename.indexOf('js')>-1){ //if filename is a external JavaScript file
		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", strBaseUrl+filename)
	}
	else if (filename.indexOf('css')>-1){ //if filename is an external CSS file
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", strBaseUrl+filename)
	}
	
	if (typeof fileref!="undefined")document.getElementsByTagName("head")[0].appendChild(fileref)
}