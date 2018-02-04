/* eslint-disable no-unused-vars, no-alert */

/*
Utilities
*/
function reloadApp() {
    location.reload();
}
var objUtils = {

}

// Find an element by id, by classname, by tagname or return null
function getEl(id) {
    return document.getElementById(id) || document.getElementsByClassName(id)[0] || document.getElementsByTagName(id)[0] || null;
}

function findPos(obj) {
    var curleft = 0,
        curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj === obj.offsetParent);
    }
    return [curleft, curtop];
}

function logAction(event, elThis, strType) {
    // console.log(strType);
    // console.log(event);
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

function collectionHas(a, b) { // Helper function (see below)
    for (var i = 0, len = a.length; i < len; i++) {
        if (a[i] === b) return true;
    }
    return false;
}

function getFirstLevelChildElements(parent, childNodeType) {
    //debugger;
    //console.trace();
    //console.table(parent)
    var childElements = parent.getElementsByTagName(childNodeType),
        result = [];

    for (var i = 0; i < childElements.length; i++) {
        if (childElements[i].parentNode === parent) {
            result.push(childElements[i]);
        }
    }
    return result;
}

function findParentBySelector(parentId, selector) {
    var elm = getEl(parentId);
    var all = document.querySelectorAll(selector);
    var cur = elm.parentNode;
    while (cur && !collectionHas(all, cur)) { // Keep going up until you find a match
        cur = cur.parentNode; // Go up
    }
    return cur; // Will return null if not found
}


function getParamStringFromObject(objParams) {
    var params = [];

    for (var param in objParams) {
        if (typeof param === 'string') params.push(param + '=' + encodeURIComponent(objParams[param]));
    }
    return params.join('&');

}

/**
 * Tests if a class exists on a DOM element
 *
 * @param {any} el DOM element to inspect or the complete content of the class attribute
 * @param {string} classname Classname to search for
 * @returns Booloan indicating if the classname exists
 */
function containsClass(el, classname) {
    var currentClass = (typeof el === 'string') ? el : el.getAttribute('class');

    if (typeof currentClass === 'string') return (currentClass.split(" ").indexOf(classname) > -1);

    return false;
}

/**
 * Toggles a class on a DOM node
 *
 * @param {object} el DOM node to toggle the class on
 * @param {string} cls Classname to toggle on the DOM node
 * @param {boolean} forceAdd Optionally force add/remove the class on the DOM element
 */
function toggleClass(el, cls, forceAdd) {
    var cur = el.getAttribute('class');

    if (typeof forceAdd === 'boolean') {
        if (forceAdd) {
            // Add the class
            if (typeof cur === 'string') {
                if (!containsClass(cur, cls)) el.setAttribute('class', (cur + ' ' + cls));
            } else {
                el.setAttribute('class', cls);
            }
        } else {
            // Remove the class if it's present in the attribute
            if (typeof cur === 'string') {
                if (containsClass(cur, cls)) {
                    el.setAttribute('class', (cur.replace(new RegExp('\\b' + cls + '\\b', 'g'), "")));
                }
            }
        }
    } else {
        if (typeof cur === 'string') {

            if (containsClass(el, cls)) {
                cur = cur.replace(new RegExp('\\b' + cls + '\\b', 'g'), "");
            } else {
                cur = cur + ' ' + cls;
            }
        }

        el.setAttribute('class', cur);
    }
}


// Sets the transform attribute on the passed svg node
function svgSetTransform(elSvg, objSvgProperties) {
    var bolUseStringMethod = true;

    if (bolUseStringMethod) {
        /* String method */
        // var strTransformValue='translate('+objSvgProperties['translatex']+', '+objSvgProperties['translatey']+') scale('+objSvgProperties['scale']+')';
        if (objSvgProperties.scale === 'Infinity') objSvgProperties.scale = 1;
        var strTransformValue = 'matrix(' + objSvgProperties.scale + ',0,0,' + objSvgProperties.scale + ',' + objSvgProperties.translatex + ',' + objSvgProperties.translatey + ')';

        elSvg.setAttributeNS(null, 'transform', strTransformValue);
    } else {
        /* Native method */

        // Set the new values for the transform matrix
        objSvgProperties.transformmatrix.a = objSvgProperties.scale;
        objSvgProperties.transformmatrix.b = 0;
        objSvgProperties.transformmatrix.c = 0;
        objSvgProperties.transformmatrix.d = objSvgProperties.scale;
        objSvgProperties.transformmatrix.e = objSvgProperties.translatex;
        objSvgProperties.transformmatrix.f = objSvgProperties.translatey;

        // console.log(objSvgProperties.transformmatrix);

        // someitem.ownerSVGElement.createSVGTransformFromMatrix(m)
        var svgTransform = elSvg.ownerSVGElement.createSVGTransformFromMatrix(objSvgProperties.transformmatrix);

        // console.log(bla);

        elSvg.transform.baseVal.initialize(svgTransform);
    }

}

// Retrieves the matrix zoom level
function svgRetrieveZoomLevel(elSvg) {
    if (!elSvg) return 1;
    var zoomLevel = parseFloat(elSvg.getAttributeNS(null, 'transform').replace(/.*bla\(\s*(\d[^\,]*).*/g, '$1'));
    return (isNaN(zoomLevel)) ? 1 : zoomLevel;
}

function getTransformedWidth(svg, el) {
    // debugger;
    var matrix = el.getTransformToElement(svg);
    return matrix.a * el.cx.animVal.value;
}

function rgbFromHex(hex) {
    function cutHex(h) {
        return (h.charAt(0) === "#") ? h.substring(1, 7) : h
    }

    function hexToR(h) {
        return parseInt((cutHex(h)).substring(0, 2), 16)
    }

    function hexToG(h) {
        return parseInt((cutHex(h)).substring(2, 4), 16)
    }

    function hexToB(h) {
        return parseInt((cutHex(h)).substring(4, 6), 16)
    }

    return {
        r: hexToR(hex),
        g: hexToG(hex),
        b: hexToB(hex)
    }
}

/*
Calculates the color in between two colors (beginning=dark color, end=light color)
*/
function colourGradientor(p, rgb_beginning, rgb_end) {

    var w1 = ((p * 2 - 1) + 1) / 2.0;
    var w2 = 1 - w1;

    return [parseInt(rgb_beginning[0] * w1 + rgb_end[0] * w2, 10), parseInt(rgb_beginning[1] * w1 + rgb_end[1] * w2, 10), parseInt(rgb_beginning[2] * w1 + rgb_end[2] * w2, 10)];
}

function encodeUrl(sStr) {
    return escape(sStr).replace(/\+/g, '%2C').replace(/\"/g, '%22').replace(/\'/g, '%27').replace(/\//g, '%2F');
}

function generateUniqueId() {
    var t = Math.random();
    t = Math.round(t * 10000);
    var t2 = Math.random();
    t2 = Math.round(t * 10000);
    var objDate = new Date();
    var intSec = objDate.getSeconds();
    t = t + "x" + intSec + "x" + t2;
    return t;
}
var matchFound = false,
    returnObj = {};

function iterate(obj, type, value) {

    for (var property in obj) {

        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] === "object") {
                iterate(obj[property], type, value);
            } else {
                if (obj[property] === value) {
                    if (property === type) {
                        returnObj = obj;
                        matchFound = true;
                        break;
                    }
                }
            }
        }
    }
    return returnObj;
}

// Function that handles the situation where shibboleth login required
function handleShibbolethLoginRequired(cb) {
    console.log('!!Shibboleth login is required!!');

    // console.trace();
    // debugger;

    // Remember the state so we can return to it after we have passed the authentication step
    if (window.objStore.getlocalstorageitem('stateremembered') == null) {
        if (location.hash.indexOf('login/') > -1) {
            window.objStore.setlocalstorageitem('stateremembered', JSON.stringify(window.app.defaultpagestate));
        } else {
            window.objStore.setlocalstorageitem('stateremembered', JSON.stringify(window.objPageState.hash2object(location.hash)));
        }
    }

    // Show the login page that forces the complete app html to reload
    if (cb) {
        // console.log(cb);
        cb(null, {
            authenticated: false
        });
    } else {
        window.objLogin.logout();
    }
}

/*
AJAX UTILITIES
*/
function psv(type, url, objParams, cb) {
    var xmlhttp,
        strParams = '',
        bolPerformCatch = false;

    // Enable the try-catch only on production website
    if (window.objConfig.sitetype === 'prod') bolPerformCatch = false;

    window.objLoading.show();

    if (window.XMLHttpRequest) { // Code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // Code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            // console.log(xmlhttp.statusText);
            if (this.status === 200) {
                window.objLoading.hide();

                // If shibboleth returns information that login is required
                if (xmlhttp.responseText.toLowerCase().indexOf('name="samlrequest"') > 0) {

                    handleShibbolethLoginRequired(cb)

                } else {
                    if (bolPerformCatch) {
                        // Recommended for production
                        try {
                            var objResponse = JSON.parse(xmlhttp.responseText);

                            // Test if we have lost the session and need to login again
                            if (objResponse.hasOwnProperty('error')) {
                                if (objResponse.error.message === "Not authenticated" || objResponse.error.message === "Token mismatch") {
                                    // Run the logout routine which will reset the app to it's original state and the show the login screen
                                    window.objStore.setlocalstorageitem('reloadtime', new Date().getTime() / 1000);
                                    window.objLogin.logout();
                                } else {
                                    cb(null, objResponse);
                                }
                            } else {
                                cb(null, objResponse);
                            }
                        } catch (err) {
                            cb(err);
                        }
                    } else {
                        // Recommended for develop & debug

                        // console.log(xmlhttp.responseText);
                        var objResponse = JSON.parse(xmlhttp.responseText);

                        // Test if we have lost the session and need to login again
                        if (objResponse.hasOwnProperty('error')) {
                            if (objResponse.error.message === "Not authenticated" || objResponse.error.message === "Token mismatch") {
                                // Run the logout routine which will reset the app to it's original state and the show the login screen
                                window.objLogin.logout();
                            } else {
                                cb(null, objResponse);
                            }
                        } else {
                            cb(null, objResponse);
                        }
                    }
                }




            } else {
                // Error occured (for example server error or 404)
                // console.log(xmlhttp);
                cb(xmlhttp.statusText);
            }
        }
    };

    strParams = getParamStringFromObject(objParams);

    xmlhttp.open(type, url + (type === "GET" ? '?' + strParams : ''), true);

    xmlhttp.crossDomain = true;
    xmlhttp.withCredentials = true;
    if (type === "POST") {
        xmlhttp.timeout = 40000;
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(strParams);
    } else {
        xmlhttp.send();
    }
}


function serverSideRequest(objArguments) {
    /*
	This function performs a serverside request by using the passed xmlhttp object.
	It returns the string that the server side script returned (sync) or passes the string on a user defined function 'callbackFunction' (async)
	Use named argument syntax:
	serverSideRequest({url: '/bla.html', callback: 'performTask()', method: 'get', formdata: arrFormData, debug: false})
	*/
    var bolAsync = true,
        bolSubmitFormData = false,
        bolDebug = false,
        bolSubmitXmlFile = false,
        bolBypassCache = false;
    var strDebug, strKey, strValue, strFormData = '',
        strResult;
    var strUrl = '',
        strMethod = 'post',
        arrFormData = '';
    var callbackFunction = null;

    // Translate the passed object into local variables
    strUrl = typeof objArguments.url !== 'undefined' ? objArguments.url : '';

    callbackFunction = typeof objArguments.callback !== 'undefined' ? objArguments.callback : null;
    if (typeof objArguments.bypasscache !== 'undefined') {
        if (objArguments.bypasscache === 'true') bolBypassCache = true;
    }
    strMethod = typeof objArguments.method !== 'undefined' ? objArguments.method.toLowerCase() : 'get';
    strDebug = typeof objArguments.debug !== 'undefined' ? objArguments.debug + '' : 'false';
    if (strDebug.toLowerCase() === 'true') bolDebug = true;

    // Form data
    arrFormData = typeof objArguments.arrdata !== 'undefined' ? objArguments.arrdata : '';
    if (typeof (arrFormData) === 'string') arrFormData = typeof objArguments.formdata !== 'undefined' ? objArguments.formdata : '';
    if (bolDebug) arrFormData['debug'] = 'true';
    if (typeof (arrFormData) !== 'string') bolSubmitFormData = true;


    // Determine asynchronous request
    if (callbackFunction == null) bolAsync = false;

    // bolDebug = true;

    if (bolDebug) alert("Parameters recieved:\nstrUrl=" + strUrl + "\ncallbackFunction=" + callbackFunction + "\nstrMethod=" + strMethod + "\narrFormData=" + arrFormData + "\nbolSubmitFormData=" + bolSubmitFormData + "\nbolAsync=" + bolAsync);


    // Bypass caching by adding a querystring to the url
    if (bolBypassCache) {
        if (strMethod === 'post') {
            strUrl += (strUrl.indexOf('?') > 0) ? '&rnd=' + generateUniqueId() : '?rnd=' + generateUniqueId();
        } else {
            if (typeof (arrFormData) !== 'string') {
                arrFormData['rnd'] = generateUniqueId();
            } else {
                arrFormData = new Array();
                arrFormData['rnd'] = generateUniqueId();
                bolSubmitFormData = true;
            }
        }
    }



    // Form data to sent
    if (bolSubmitFormData) {
        var arr = new Array();
        for (strKey in arrFormData) {
            // alert(typeof(arrFormData[strKey]));
            if (typeof (arrFormData[strKey]) !== 'function' && typeof (arrFormData[strKey]) !== 'object') {
                strValue = encodeUrl(arrFormData[strKey]);
                arr.push(strKey + "=" + strValue)
            }
        }
        strFormData = arr.join('&');
        if (bolDebug) alert('Form data sent to server:\n' + strFormData);
    }

    function createRemote() {
        try {
            return (new XMLHttpRequest());
        } catch (e) {
            return (new ActiveXObject('Microsoft.XMLHTTP'));
        }
    }

    // Create remote xmlhttp object
    var objXmlHttpLocal = createRemote();

    // Determine onreadystatechange function (async only)
    if (bolAsync) {
        objXmlHttpLocal.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    // OK
                    strResult = objXmlHttpLocal.responseText;
                    if (bolDebug) alert("just before callback function\n\n" + strResult);
                    callbackFunction(undefined, strResult);
                } else {
                    strResult = "ERROR: There was a problem retrieving the server side data:\n" + objXmlHttpLocal.statusText;
                    callbackFunction(strResult);
                }
            }
        }
    } else {
        // Make sure to clear any previously attached onreadystate functions
        /*
		Need to investigate memory leak problems in IE
		*/
        objXmlHttpLocal.onreadystatechange = function () {};
    }

    // Data for a GET request
    if (strMethod.toLowerCase() === "get" && strFormData.length > 0) strUrl += "?" + strFormData;

    // Perform request
    try {
        objXmlHttpLocal.open(strMethod.toUpperCase(), strUrl, bolAsync);
        if (bolSubmitFormData && strMethod.toLowerCase() === "post") {
            objXmlHttpLocal.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            objXmlHttpLocal.send(strFormData);
        } else {
            if (bolSubmitXmlFile) {
                objXmlHttpLocal.send(arrFormData);
            } else {
                objXmlHttpLocal.send(null);
            }
        }
    } catch (err) {
        if (!bolAsync) {
            console.log(err);
            return null;
        } else {
            callbackFunction(JSON.stringify(err));
        }
    }

    if (!bolAsync) {
        return objXmlHttpLocal.responseText;
    }

    // objXmlHttpLocal = null;
}

function countryClicked(idCountry, mobile, forceview) {
    var elRegion = getEl(idCountry);

    if (mobile) {
        window.objPageState.mobile = true;
    } else {
        window.objPageState.mobile = false;
    }

    // console.log('++++');
    // console.log('- mobile: ' + mobile);
    // console.log('- containsClass(elRegion, "no-data"): ' + containsClass(elRegion, "no-data"));
    // console.log('- window.app.state.mobile: ' + window.app.state.mobile);
    // console.log('++++');

    if (window.objPageState.state.filter.oru !== idCountry && ((containsClass(elRegion, "no-data") === false && window.objPageState.mobile === false) || window.objPageState.mobile)) {
        var newView = 'detail';
        var newOru = idCountry;
        if (typeof forceview === 'string' && forceview === 'worldmap') {
            newView = 'worldmap';
            newOru = 'none';
        }
        window.objPageState.updatepagestate({
            view: newView,
            filter: {
                oru: newOru,
                datasource: window.objDataFilter.state.filter.datasource,
                subtype: window.objDataFilter.state.filter.subtype
            }
        });
    } else {
        // console.log('click discarded because the details panel is already open');
        window.objPageState.updatepagestate({
            view: 'worldmap',
            filter: {
                oru: 'none',
                datasource: window.objDataFilter.state.filter.datasource,
                subtype: window.objDataFilter.state.filter.subtype
            }
        });
    }

}

function setNumberSeperators(str) {
    var output = '';
    var amount = new String(str);
    amount = amount.split('.');
    var decimals = (amount[1]) ?
        amount[1] :
        '';
    amount = amount[0].split('').reverse();
    for (var i = 0; i <= amount.length - 1; i++) {
        output = amount[i] + output;
        if ((i + 1) % 3 === 0 && (amount.length - 1) !== i) output = ',' + output;
    }
    if (decimals !== '') {
        output += '.';
        output += decimals;
    }
    if (output.indexOf('.') > -1) {
        if (output.split('.')[1].length < 2) output = output + '0';
    }
    return output;
}

function formatFinancialData(input) {
    var output = '';
    if (parseFloat(input) < 0) {
        output = '(' + setNumberSeperators(0 - parseFloat(input)) + ')';
    } else {
        output = setNumberSeperators(input);
    }
    return output;
}

/*
Formats a generic integer as a money
usage
var myMoney=3543.75873;
var formattedMoney = formatMoney(myMoney, 2,'.',',');

*/
function formatMoney(n, decPlaces, thouSeparator, decSeparator, currencySymbol) {
    if (n === undefined) return n;
    var decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator === undefined ? "." : decSeparator,
        thouSeparator = thouSeparator === undefined ? "," : thouSeparator,
        currencySymbol = currencySymbol === undefined ? "" : currencySymbol,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + currencySymbol + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
}

// Utility function to load a url
function loadUrlInBrowser(strUrl) {
    var bolLoadInNewWindow = false;
    if (arguments.length > 1) bolLoadInNewWindow = arguments[1];

    // Add an action to the stats object
    window.objAnalytics.data.events.push({
        category: ((strUrl.match(/^https?:\/\/.+\.(zip|dmg|txt|cfg|gz|pl|pdf)$/i)) ? 'download' : 'link'),
        action: 'click',
        label: strUrl
    });

    if (window.app.state.webbrowser) {
        if (bolLoadInNewWindow) {
            window.open(strUrl);
        } else {
            location.href = strUrl;
        }
    } else {
        if (bolLoadInNewWindow) {
            window.open(strUrl, '_system', 'location=no');
        } else {
            window.open(strUrl, '_blank', 'location=no');
        }

        // var ref = window.open(strUrl, '_blank', 'location=no');
        // ref.addEventListener('loadstart', function() { alert(event.url); });
    }

}

function hasProperty(obj, propName) {
    if (typeof obj !== 'object' || obj === null) return false;
    return obj.hasOwnProperty(propName);
}

// Determines if we are a public site or not
function isPublicSite() {
    return (window.objConfig.sitetype.indexOf('public') > -1) ? true : false;
}

function translateFragment(id) {
    if (window.objConfig.fragments.hasOwnProperty(id)) {
        var fragment = window.objConfig.fragments[id];

        // Very dirty way to insert sub and superscript
        if (fragment.indexOf('CO2') > -1) fragment = fragment.replace(/^(.*CO)(\d)(.*)$/, '$1<sub>$2</sub>$3');
        if (fragment.indexOf('m3') > -1) fragment = fragment.replace(/^(.*m)(\d)(.*)$/, '$1<sup>$2</sup>$3');

        return fragment;
    }
    return '[' + id + ']';
}

/**
 * Clones a JavaScript object
 * @param   {object} obj Object to clone
 * @returns {object} Cloned JavaScript Object
 */
function cloneObject(obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (err) {
        console.log('---------------');
        console.log('There was an error attempting to clone the object');
        console.trace();
        console.log(typeof obj);
        console.log(obj);
        return console.log('---------------');
    }
}

/**
 * Sets a number of styles to a DOM element
 *
 * @param {object} el DOM element
 * @param {object} styles An onject in the format {background: 'green'}
 */
function css(el, styles) {
    for (var property in styles) {
        if (typeof property === 'string') {
            el.style[property] = styles[property];
        }
    }
}

/**
 * Sends a message to the parent frame indicating that the iframe in which the wordmap is running needs to be resized
 *
 */
function messageIframeResizeToParent() {
    window.setTimeout(function () {
        window.postMessageToParent({
            action: 'adjustiframeheight',
            value: document.getElementsByTagName('body')[0].offsetHeight
        });
    }, 100);
}

/**
 * Sends a message to the parent frame
 *
 * @param {any} message
 */
function postMessageToParent(message) {
    // var origin = location.href.replace(/^(http(s){0,1}:\/\/.*?)(\/).*$/, '$1');
    window.parent.postMessage(((typeof message === 'object') ? JSON.stringify(message) : message), '*');
}
