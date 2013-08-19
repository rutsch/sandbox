
var SvgDoc; //evt.target.ownerDocument
var NodeList;
var SelectedNode=null;
var CorrectNode=null;
var Feedback;

var ObjectsMovable = false; //SVGPan
var root = document.documentElement;//SVGPan
var state = 'none', stateTarget, stateOrigin, stateTf;//SVGPan

function Init(evt)
  {
    SvgDoc = evt.target.ownerDocument;
    NodeList=document.getElementsByTagName('path');
    Feedback=document.getElementById('Feedback').firstChild;    
    
    SvgDoc.getElementById('viewport').setAttributeNS(null,'transform','translate(265,800)');//465,900
    zoomy(0.7);          
  }

function Click(evt) 
{	     
  var elem = evt.target;
  if(elem!==null && elem!==undefined){
	  elem.setAttributeNS(null,'fill','#0f0');    
    var country = elem.getAttributeNS(null,'id');
    var iso = elem.getAttributeNS(null,'_iso');
    top.clickFromSvg(country,iso);
    Feedback.nodeValue=country;
    
    /*    	  
    document.getElementById('textDemographics').firstChild.nodeValue=country;
    document.getElementById('demographics').setAttributeNS(null,'style','display:inline;');        
    */
    
    top.hintCancel(country);
  }
}

function HintClick(evt) 
{	      
  var elem = evt.target;  
    var country = elem.getAttributeNS(null,'_country');
    var iso = document.getElementById(country).getAttributeNS(null,'_iso');    
    top.clickFromSvg(country,iso);    
     //elem.setAttributeNS(null,'style','display:none;');
}

function On(a) 
  {    
	a.target.setAttributeNS(null,'fill','#f00');
	Feedback.nodeValue=''+a.target.getAttributeNS(null,'id');
  }

function Off(a) 
  {
    //if(a.target.getAttributeNS(null,'fill')==='#f00')
	    a.target.setAttributeNS(null,'fill','#ccc');
   
	 Feedback.nodeValue='';
  }
  
  //----------------------------------
// Based on SVGPan 1.2
// changed: misc stuff and wheel event, now also supported by IE9+, Opera11+
function getCenterPoint() {
    var p = root.createSVGPoint();
    // center of 1024, 768
    p.x = 512;
    p.y = 384;
    return p;
}


function setCTM(element, matrix) {
    var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";
    element.setAttribute("transform", s);
}

function zoomy(level) {
    var z = level;
    var g = SvgDoc.getElementById("viewport");
    var p = getCenterPoint();
    p = p.matrixTransform(g.getCTM().inverse());

    // Compute new scale matrix in current mouse position
    var k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);
    setCTM(g, g.getCTM().multiply(k));

    if (typeof (stateTf) === "undefined") {
        stateTf = g.getCTM().inverse();
    }
    stateTf = stateTf.multiply(k.inverse());
}

function zoomIn() {
    zoomy(1.1);    
}
function zoomOut() {
    zoomy(0.9);    
}

function getEventPoint(evt) {
    var p = root.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    return p;
}

function getXYPoint(x, y) {
    var p = root.createSVGPoint();
    p.x = x;
    p.y = y;
    return p;
}

function setAttributes(element, attributes) {
    var a;
    for (a in attributes) {
        if (attributes.hasOwnProperty(a)) {
            element.setAttributeNS(null, a, attributes[a]);
        }
    }
}

function handleMouseWheel(evt) {
    if (evt.preventDefault) {
        evt.preventDefault();
    }
    evt.returnValue = false;
    var delta;
    if (evt.wheelDelta) {
        delta = evt.wheelDelta / 3600; // Chrome/Safari
    } else {
        delta = evt.detail / -90;  // Mozilla
    }
    var z = 1 + delta; // Zoom factor: 0.9/1.1
    //var SvgDoc = evt.target.ownerDocument;
    var g = SvgDoc.getElementById("viewport");
    var p = getEventPoint(evt);
    //var p = getCenterPoint();
    p = p.matrixTransform(g.getCTM().inverse());

    // Compute new scale matrix in current mouse position
    var k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);
    setCTM(g, g.getCTM().multiply(k));

    if (typeof (stateTf) === "undefined") {
        stateTf = g.getCTM().inverse();
    }
    stateTf = stateTf.multiply(k.inverse());
}

function handleMouseMove(evt) {
    if (evt.preventDefault) {
        evt.preventDefault();
    }
    evt.returnValue = false;
    var g = SvgDoc.getElementById("viewport");
    if (state === 'pan') {
        // Pan mode
        var p = getEventPoint(evt).matrixTransform(stateTf);
        setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));
    } else if (ObjectsMovable && state === 'move') {
        // Move mode
        var pp = getEventPoint(evt).matrixTransform(g.getCTM().inverse());
        setCTM(stateTarget, root.createSVGMatrix().translate(pp.x - stateOrigin.x, pp.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));
        stateOrigin = pp;
    }
}

function handleMouseDown(evt) {
    if (evt.preventDefault) {
        evt.preventDefault();
    }

    evt.returnValue = false;
    var g = SvgDoc.getElementById("viewport");
    if (evt.target.tagName === "svg") {
        // Pan mode
        state = 'pan';
        stateTf = g.getCTM().inverse();
        stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
    } else {
        // Move mode
        state = 'move';
        stateTarget = evt.target;
        stateTf = g.getCTM().inverse();
        stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
    }
}

function handleMouseUp(evt) {
    if (evt.preventDefault) {
        evt.preventDefault();
    }

    evt.returnValue = false;
    if (state === 'pan' || state === 'move') {
        // Quit pan mode
        state = '';
    }
}

function setupHandlers(root) {
    setAttributes(root, {
        "onmouseup": "add(evt)",
        "onmousedown": "handleMouseDown(evt)",
        "onmousemove": "handleMouseMove(evt)",
        "onmouseup": "handleMouseUp(evt)" //put , if below is used
        //"onmouseout" : "handleMouseUp(evt)" // Decomment this to stop the pan functionality when dragging out of the SVG element
    });

    /* Tested ok with Chrome 10+, Firefox 4+, Safari 5+, IE 9+, Opera 11+ */
    if (window.addEventListener) {
        /** DOMMouseScroll is for mozilla. */
        window.addEventListener('DOMMouseScroll', handleMouseWheel, false);
    }
    /** IE/Opera. */
    window.onmousewheel = document.onmousewheel = handleMouseWheel;
}
setupHandlers(root);
// end of SVGPan
//----------------------------------
   
