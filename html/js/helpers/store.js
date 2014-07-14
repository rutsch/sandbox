var objStore = {
	store: null,
	findfavourites: function () {
		var arrResult = [];
		for (var i = 0; i < objStore.store.length; i++) {
			var key = localStorage.key(i);
			if (key.indexOf('fav_') > -1) {
				arrResult.push(objStore.store.getItem(key));
			}
		}
		return arrResult;
	},
	setlocalstorageitem: function (key, value) {
		objStore.store.setItem(key, value);
	},
	getlocalstorageitem: function (key) {
		return objStore.store.getItem(key);
	},
	removelocalstorageitem: function (key) {
		objStore.store.removeItem(key);
	},
	init: function () {
		var self = this;
		objStore.store = window.localStorage;

		//set a guid to use for statistics if it does not exist
		if (self.getlocalstorageitem('statguid') == null) {
			self.setlocalstorageitem('statguid', 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			}))
		}
	}
}