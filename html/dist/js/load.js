/*
Basic JavaScript used when the page loads
*/

// Global page variables
var pageVars = {
    version: Math.round(Math.random() * 100000000),
    rootpath: '/webapp/html'
}

// Grab the version from the parent window if possbile
if (top !== self) {
    pageVars.version = (top.pageVars.version) ? top.pageVars.version : pageVars.version;
}

/**
 * Load a remote resource by writing the DOM element in the tree
 * 
 * @param {string} path 
 */
function loadRemoteResource(path) {
    if (path.indexOf('.js') > -1) {
        document.write('\x3Cscript type="text/javascript" src="' + pageVars.rootpath + path + '?v=' + pageVars.version + '">\x3C/script>');
    } else {
        document.write('\x3Clink rel="stylesheet" type="text/css" href="' + pageVars.rootpath + path + '?v=' + pageVars.version + '">')
    }
}

/**
 * Loads the JavaScript files for the worldmap
 * 
 * @param {any} arr 
 */
function loadJavaScriptResources(arr) {
    arr.forEach(function (path) {
        loadRemoteResource(path);
    });
    if (top !== self) loadRemoteResource('/js/lib/iframeResizer.contentWindow.min.js');
}

/**
 * Loads conditional JavaScript resources
 * 
 */
function addAdditionalAssets() {
    if (location.host.indexOf(':') > -1 || location.host.indexOf('dev') > -1) {
        document.write('\x3Cscript src="http://' + (location.host || 'localhost').split(':')[0] + ':' + ((location.host.split(':')[1] * 1) + 1000) + '/livereload.js">\x3C/script>');
    }
}


// Write the stylesheet links
[
    '/css/style.css',
    '/css/graph.css'
].forEach(function (path) {
    loadRemoteResource(path);
});
if (!!window.MSStream) loadRemoteResource('/css/ie-all-versions.css');