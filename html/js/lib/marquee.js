/*
Project: Marquee JavaScript
Version: 0.5.2
URL: http://neswork.com/javascript/marquee/
Author: Gavriel Fleischer <flocsy@gmail.com>
Copyright: (C) 2009-2010 Gavriel Fleischer
Licence: GNU Public Licence
File: marquee.js
Minimized file name: marquee.min.js
File last modified: 2010-02-16
*/

/*
Class: Marquee
Javascript replacement of non-standard <marquee> html element
*/
/*
Constructor: Marquee

Parameters: args - object with the following optional elements:
id - id of the html element to be turned to marquee
el - the html element
dir [left|right|up|down] - direction to move the content to
jump - how many pixels the content is jumped each step. default: 1
wait - how many miliseconds to wait between each step. default: 50
mouseStops [true|false] - default: true
callback - function to be called on events

> function callback(action, args) {...}
- action [init,start,stop,chg1,chg2,chg3]
- args - object: {id, el}
*/
var Marquee = function(args)
{
	// private attributes
	this._debug_i = 0;
	this._interval = false;
	this._lock = false;

	// static attributes
	if ("undefined" == typeof Marquee._instances)
	{
		Marquee._instances = new Array();
		Marquee._count = 0;
		if (!window.addEventListener)
		{
			window.onresize = function(event)
			{
				for (i=0;i<Marquee._instances.length;i++)
				{
					Marquee._instances[i].onresize(event);
				}
			};
		}
	}

	// private methods
	var _cloneNode = function(node,id_suffix)
	{
		function append_id(el,str)
		{
			if (el.id)
			{
				el.id += str;
			}
			for (var i=0;i<el.childNodes.length;i++)
			{
				append_id(el.childNodes[i],str);
			}
		}
		var clone = node.cloneNode(true);
		append_id(clone,id_suffix);
		return clone;
	};
	// this function determines whether the event is the equivalent of the microsoft
	// mouseleave or mouseenter events.
	// http://forums.devshed.com/javascript-development-115/nested-onmouseover-onmouseout-onmouseout-not-called-reliably-299387.html
	var _isMouseLeaveOrEnter = function(ev, handler)
	{
		var event = window.event || ev;
		if (event.type != 'mouseout' && event.type != 'mouseover')
		{
			return false;
		}
		var reltg = event.relatedTarget ? event.relatedTarget :
			event.type == 'mouseout' ? event.toElement :
			event.fromElement;
		while (reltg != handler && reltg !== null)
		{
			reltg = reltg.parentNode;
		}
		return (reltg != handler);
	};
	var _isIE = function()
	{
		return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
	};
	this._print_console = function(text)
	{
		if (!this.console_id)
		{
			return false;
		}
		var console = document.getElementById(this.console_id);
		if (!console)
		{
			return false;
		}
		console.innerHTML = (++this._debug_i) + ". " + text;
		return true;
	};
	this._change_order = function(new_order)
	{
		this._orig_copy_order = 1 - this._orig_copy_order;
		if ("undefined" != typeof new_order)
		{
			this._orig_copy_order = new_order;
		}
		if (this._orig_copy_order)
		{
			this.el.appendChild(this._copy1);
			this.el.appendChild(this._orig);
		}
		else
		{
			this.el.appendChild(this._orig);
			this.el.appendChild(this._copy1);
		}
	};
	this.onmouseout = function(event)
	{
		if (_isMouseLeaveOrEnter(event, this.el))
		{
			this.start();
		}
	};
	this.onmousein = function(event)
	{
		if (_isMouseLeaveOrEnter(event, this.el))
		{
			this.stop();
		}
	};
	this._call_callback = function(action)
	{
		var ret = false;
		if (null !== this.callback)
		{
			ret = this.callback(action, {"id":this.id, "el":this.el});
		}
		return ret;
	};
	this._scroll = function()
	{
		if (this._lock || !this.go)
		{
			return false;
		}
		this._lock = true;
		switch (this.dir)
		{
		case "down":
			// sH: height of the full string, oH: height of the visible window
			if (!this._orig_copy_order && (this.el.offsetHeight-3*this.extra_margin)/2 <= this._orig.offsetHeight - this.el.scrollTop)
			{
				this._change_order();
				this._call_callback("chg1");
			}
			else if (this._orig_copy_order && this._orig.offsetHeight - this.el.offsetHeight >= this.el.scrollTop)
			{
				this.el.scrollTop += this._orig.offsetHeight;
				this._change_order();
				this._call_callback("chg2");
			}
			else if (this._orig_copy_order && this.el.scrollTop <= 0)
			{ // if this.el.offsetHeight > this._orig.offsetHeight
				this.el.scrollTop += this.el.offsetHeight;
				this._change_order();
				this._call_callback("chg3");
			}
/*			if (window.opera && 0 === this.el.scrollLeft)
			{
			//	this._change_order();
				this.el.scrollLeft -= 100;
			}
*/
			this.el.scrollTop -= this.jump;
			this._print_console('id:'+this.id+', order:'+this._orig_copy_order+', dir:'+this.dir+', sT:' + this.el.scrollTop /*+'('+scrollTop+')'*/ + ', sH:'+this.el.scrollHeight+", oH:"+this.el.offsetHeight+", _oH:"+this._orig.offsetHeight);
			break;
		case "up":
			// sH: height of the full string, oH: height of the visible window
			if (!this._orig_copy_order && (this.el.offsetHeight - this.extra_margin)/2 >= this._orig.offsetHeight - this.el.scrollTop)
			{
				this._change_order();
				this._call_callback("chg1");
			}
			else if (this.el.scrollTop >= this._orig.offsetHeight)
			{
				this.el.scrollTop = 0;
				this._change_order();
				this._call_callback("chg2");
			}
			else if (this.el.scrollHeight - this.el.scrollTop <= this.el.offsetHeight)
			{ // if this.el.offsetHeight > this._orig.offsetHeight
				this.el.scrollTop -= this._orig.offsetHeight;
				this._change_order();
				this._call_callback("chg3");
			}
			this.el.scrollTop += this.jump;
			this._print_console('id:'+this.id+', order:'+this._orig_copy_order+', dir:'+this.dir+', sT:' + this.el.scrollTop+ ', sH:'+this.el.scrollHeight+", oH:"+this.el.offsetHeight+", _oH:"+this._orig.offsetHeight);
			break;
		case "right":
			var scrollLeft = this.el.scrollLeft < 0 ? this.el.scrollWidth-this.el.offsetWidth+this.el.scrollLeft : this.el.scrollLeft;
			// sW: width of the full string, oW: width of the visible window
			if (!this._orig_copy_order && /*0 !== scrollLeft &&*/ (this.el.offsetWidth-3*this.extra_margin)/2 <= this._orig.offsetWidth - scrollLeft)
			{
				this._change_order();
				this._call_callback("chg1");
			}
			else if (this._orig_copy_order && this._orig.offsetWidth - this.el.offsetWidth >= scrollLeft)
			{
				this.el.scrollLeft += this._orig.offsetWidth;
				this._change_order();
				this._call_callback("chg2");
			}
			else if (this._orig_copy_order && scrollLeft <= 0)
			{ // if this.el.offsetWidth > this._orig.offsetWidth
				this.el.scrollLeft += this.el.offsetWidth;
				this._change_order();
				this._call_callback("chg3");
			}
/*			if (window.opera && 0 === this.el.scrollLeft)
			{
			//	this._change_order();
				this.el.scrollLeft -= 100;
this._print_console('id:'+this.id+', order:'+this._orig_copy_order+', dir:'+this.dir+', sL:' + this.el.scrollLeft+'('+scrollLeft+'), sW:'+this.el.scrollWidth+", oW:"+this.el.offsetWidth+", _oW:"+this._orig.offsetWidth+", eM:"+this.extra_margin);
alert("OK")
			}
*/
			this.el.scrollLeft -= this.jump;
			this._print_console('id:'+this.id+', order:'+this._orig_copy_order+', dir:'+this.dir+', sL:' + this.el.scrollLeft+'('+scrollLeft+'), sW:'+this.el.scrollWidth+", oW:"+this.el.offsetWidth+", _oW:"+this._orig.offsetWidth+", eM:"+this.extra_margin);
			break;
		case "left":
		default:
			// sW: width of the full string, oW: width of the visible window
			if (!this._orig_copy_order && (this.el.offsetWidth - this.extra_margin)/2 >= this._orig.offsetWidth - this.el.scrollLeft)
			{
				this._change_order();
				this._call_callback("chg1");
			}
			else if (this.el.scrollLeft >= this._orig.offsetWidth)
			{
				this.el.scrollLeft = 0;
				this._change_order();
				this._call_callback("chg2");
			}
			else if (this.el.scrollWidth - this.el.scrollLeft <= this.el.offsetWidth)
			{ // if this.el.offsetWidth > this._orig.offsetWidth
				this.el.scrollLeft -= this._orig.offsetWidth;
				this._change_order();
				this._call_callback("chg3");
			}
			this.el.scrollLeft += this.jump;
			this._print_console('id:'+this.id+', order:'+this._orig_copy_order+', dir:'+this.dir+', sL:' + this.el.scrollLeft+ ', sW:'+this.el.scrollWidth+", oW:"+this.el.offsetWidth+", _oW:"+this._orig.offsetWidth);
			break;
		}
		this._lock = false;
		return true;
	};
	this.copy = function()
	{
		if (null !== this._copy1)
		{
			debugger;
			this.el.removeChild(this._copy1);
			while (this._copy1.firstChild)
			{
				this._copy1.removeChild(this._copy1.firstChild);
			}
		}
		else
		{
			this._copy1 = document.createElement(this._orig.nodeName);
		}
		this._copy1.id = this.el.id + "_copy1";
		this._copy1.style.display = "inline-block";
		if (_isIE())
		{
			this._copy1.style.zoom = "1";
			this._copy1.style.display = "inline";
		}
		if (this._orig.firstChild)
		{
			var twin;
			for (var i=0;i<this._orig.childNodes.length;i++)
			{
				twin = _cloneNode(this._orig.childNodes[i],"_copy1");
				this._copy1.appendChild(twin);
			}
		}
		this.el.appendChild(this._copy1);
		this._change_order(this._orig_copy_order);
	};
	this.onresize = function(event)
	{
		this.extra_margin = this.el.offsetWidth - this._orig.offsetWidth;
		if (0 > this.extra_margin)
		{
			this.extra_margin = 0;
		}
		switch (this.dir)
		{
		case "right":
			if (this.el.offsetWidth > this._orig.offsetWidth)
			{
				this._orig.style.marginLeft = this.extra_margin + "px";
				this._copy1.style.marginLeft = this.extra_margin + "px";
			}
			break;
		case "left":
		default:
			if (this.el.offsetWidth > this._orig.offsetWidth)
			{
				this._orig.style.marginRight = this.extra_margin + "px";
				this._copy1.style.marginRight = this.extra_margin + "px";
			}
			break;
		}
	};

	// public methods
	/*
	Function: start
	Starts moving the content.
	*/
	this.start = function()
	{
		this.go = true;
		if (this._interval === false)
		{
			var self = this;
			this._interval = setInterval(function(){self._scroll()},this.wait);
			this._scroll();
			this._call_callback("start");
		}
		return this;
	};
	/*
	Function: stop
	Stops moving the content.
	*/
	this.stop = function()
	{
		this.go = false;
		clearInterval(this._interval);
		this._interval = false;
		this._call_callback("stop");
		return this;
	};
	/*
	Function: changed
	Should be called when the content has been changed dynamically.
	Copies the original content and recalculates extra_margin.
	Needed for flowless movement when the content ends and starts again.
	*/
	this.changed = function()
	{
		this.copy();
		this.onresize();
		return this;
	};
	this.init = function()
	{
		var self = this;
		var _count = ++Marquee._count;
		Marquee._instances.push(self);
		this.id = "marquee_"+_count;
		if(this.el){
			this.el.innerHTML = '';
		}
		if(this._orig){
			this._orig = null;	
		}
		this.el = null;
		this.dir = null;
		this.jump = 1;
		this.wait = 50;
		this.mouseStops = true;
		this.callback = null;
		this.console_id = null;
		this.extra_margin = 0;
		this.go = false;

		for (var key in args)
		{
			this[key] = args[key];
		}
		if (null === this.el && "undefined" !== typeof args.id)
		{
			this.el = document.getElementById(args.id);
		}
		else if (null !== this.el && "undefined" != typeof this.el.id)
		{
			this.id = this.el.id;
		}
		if (null === this.el)
		{
			alert("Missing element");
		}
		if (null === this.dir && null !== this.el)
		{
			this.dir = ("rtl" == this.el.dir || "rtl" == this.el.style.direction) ? this.dir = "right" : this.dir = "left";
		}

		this.el.style.overflow = "hidden";
		if (this.mouseStops)
		{
			if (this.el.addEventListener)
			{
				this.el.addEventListener('mouseover',function(event){self.onmousein(event);},false);
				this.el.addEventListener('mouseout',function(event){self.onmouseout(event);},false);
			}
			else
			{
				this.el.onmouseover = function(event){self.onmousein(event);};
				this.el.onmouseout = function(event){self.onmouseout(event);};
			}
		}
		if (window.addEventListener)
		{
			window.addEventListener('resize',function(event){self.onresize(event);},false);
		}

		switch (this.dir)
		{
		case "up":
		case "down":
			break;
		case "right":
		case "left":
		default:
			this.el.style.width = "100%"; // this is not good if dir: up, down
			break;
		}
		this._orig = document.createElement(this.el.nodeName);
		this._orig.id = this.el.id + "_orig";
		this._orig.style.display = "inline-block";
		if (this.el.firstChild)
		{
			var child = this.el.firstChild;
			while (child)
			{
				this._orig.appendChild(child);
				child = this.el.firstChild;
			}
		}
		if (_isIE())
		{
			this._orig.style.zoom = "1";
			this._orig.style.display = "inline";
		}
		this.el.appendChild(this._orig);
		this._copy1 = null;

		this._orig_copy_order = 0;
		this.changed();
		this._call_callback("init");
		this.start();
		return this;
	};
};