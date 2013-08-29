var objBookmarks = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null
	},
	isfavourite: function(){
		var key = 'fav_' +objOruFilter.state.selectedoru+'_'+objMruFilter.state.selectedmru+'_'+objMap.state.selectedregion;
		var fav = objStore.getlocalstorageitem(key);
		return fav!=null;
	},
	addbookmark: function(){
		
	},
	removefavourite: function(e, el){
		e.stopPropagation();
		var elParent=el.parentNode;
		var key = elParent.getAttribute('data-key');
		objStore.removelocalstorageitem('fav_'+key);
		TweenLite.to(elParent, 0.2, {
			left: '100%',
			delay : 0,
			onComplete : function() {
				TweenLite.to(elParent, 0.3, {
					height : 0,
					delay : 0,
					onComplete: function(){
						elParent.parentNode.removeChild(elParent);
						return false;
					}
				});
			}
		});	
		return false;
	},
	findfavourites: function(){
		var arrResult = [];
	    for (var i = 0; i < objStore.store.length; i++){
	        var key = localStorage.key(i);
	        if(key.indexOf('fav_') > -1 ){
	        	arrResult.push(objStore.store.getItem(key));
	        }
	    }     	
	    return arrResult;
	},
	renderfavouritepanel: function(){
		var self = this;
		var arrFavs = self.findfavourites();
		var ul = document.createElement('ul');
		for ( var i = 0; i < arrFavs.length; i++) {
			var obj = JSON.parse(arrFavs[i]),
				sector = objMruFilter.getsectorfrombreadcrumb(obj.breadcrumb);
			var liItem = document.createElement('li');
			liItem.setAttribute('data-oru', obj.oru);
			liItem.setAttribute('data-mru', obj.mru);
			liItem.setAttribute('data-region', obj.region_id);
			liItem.setAttribute('data-sector', sector);
			var key = obj.oru + '_' + obj.mru + '_' +(obj.oru != 4 ? obj.region_id.toLowerCase() : obj.region_id);
			liItem.setAttribute('data-key', key);
			
			liItem.innerHTML = '<div class="bookmark_color" style="background:'+objConfig.colors[sector].middle+'"></div><h2>'+obj.region_name+'</h2><span class="bookmark_sub">'+obj.breadcrumb+'</span><div class="remove_bookmark" onclick="objBookmarks.removefavourite(event, this);return false;"></div>';
			liItem.onclick = function(){
				self.openfavourite(this.getAttribute('data-oru'), this.getAttribute('data-mru'), this.getAttribute('data-region'), this.getAttribute('data-sector'));
			}
			ul.appendChild(liItem);
		}
		self.el.list.innerHTML = '';
		self.el.list.appendChild(ul);		
	},
	openfavourite: function(oru, mru, region, sector){
		var self = this;
		objOruFilter.state.selectedoru = oru;
		objMruFilter.state.selectedmru = mru;
		objMruFilter.state.selectedsector = sector;
		objOruFilter.settocurrentoru();		
		objMap.updatemap(region);
		self.hide();
	},
	show: function(){
		var self = this;
		objOverlay.show();
		self.state.tweening = true;
		self.el.wrapper.style.display = 'block';
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 1,
			onComplete: function(){
				//debugger;
				self.state.tweening = false;
				self.state.visible = true;
			}
		});		
	},
	hide: function(){
		var self = this;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			opacity : 0,
			onComplete: function(){
				objOverlay.hide();
				self.el.wrapper.style.display = 'none';
				self.state.tweening = false;
				self.state.visible = false;
			}
		});	
	},
	init: function(){
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;
		
		self.el.wrapper = getEl('bookmarks_panel');
		self.el.list = getEl('bookmarkslist');
		self.renderfavouritepanel();
	}
}