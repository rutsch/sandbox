var objError = {
	state: {
		visible: null,
		tweening: null
	},
	el: {
		wrapper: null,
		text: null
	},
	hide: function () {
		var self = this;
		self.el.wrapper.innerHTML = '';
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			height: 0,
			onComplete: function () {
				self.state.tweening = false;
				self.state.visible = false;
			}
		});
	},
	show: function (msg, autohide) {
		var self = this;
		self.el.wrapper.innerHTML = msg;
		self.state.tweening = true;
		TweenLite.to(self.el.wrapper, 0.3, {
			height: 50,
			onComplete: function () {
				self.state.tweening = false;
				self.state.visible = true;
				if (autohide) {
					var hide = setTimeout(function () {
						self.hide();
					}, 4000);
				}
			}
		});
	},
	handleError: function (callingFunction, err) {
		var self = this;
		if (objLoading.state.visible) objLoading.hide();
		if (objOverlay.state.visible) objOverlay.hide();
		if (err.message) err = err.message;
		if (err.line) {
			self.show('JS Error: line=' + err.line + ', message=' + err.message + ', stack=' + err.stack, true)
		} else {
			//console.trace(err);
			if (typeof err === 'string') {
				if (err.toLowerCase() == 'token mismatch' || err.toLowerCase() == 'not authenticated') {
					objLogin.show();
				} else {
					self.show(err, true);
				}
			} else {
				self.show(JSON.stringify(err), true);
			}

		}

	},
	init: function () {
		var self = this;
		self.state.visible = false;
		self.state.tweening = false;

		self.el.wrapper = getEl('error');
	}
}