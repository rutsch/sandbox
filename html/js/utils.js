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
function setLocalStorageItem(key, value){
	store.setItem(key, value);
}
function getLocalStorageItem(key){
	return store.getItem(key);
}
function removeLocalStorageItem(key){
	store.removeItem(key);    
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

function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
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

function getTransformedWidth(svg, el){
	//debugger;
    var matrix = el.getTransformToElement(svg);
    return matrix.a*el.cx.animVal.value;
}

function rgbFromHex(hex){
	//console.log(hex);
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



/*
AJAX UTILITIES
*/

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
			//alert(xmlhttp.responseText);
			//JT: no check is done here if the JSON that was parsed was valid...
			cb(JSON.parse(xmlhttp.responseText));
		}
		//JT: need to include handlers for errors etc..... 
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

