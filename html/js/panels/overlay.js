var objOverlay = {
    state: {
        visible: null,
        tweening: null
    },
    el: {
        wrapper: null,
        closebutton: null
    },
    show: function (cb, animate) {
        var self = this;

        var bolAnimate = (typeof animate === 'undefined') ? false : animate;

        self.state.tweening = true;
        self.el.wrapper.style.display = "block";

        if (bolAnimate && !self.state.tweening) {
            window.TweenLite.to(self.el.wrapper, 0.3, {
                opacity: 0.7,
                delay: 0,
                onComplete: self.showcomplete(cb)
            });
        } else {
            self.el.wrapper.style.opacity = 0.7;
            self.showcomplete(cb);
        }
    },
    showcomplete: function (cb) {
        objOverlay.state.visible = true;
        objOverlay.state.tweening = false;
        var bolCallback = (typeof cb === 'undefined') ? false : ((typeof cb === 'boolean') ? false : true);
        if (bolCallback) cb();
    },
    hide: function (cb, animate) {
        var self = this;

        var bolAnimate = (typeof animate === 'undefined') ? false : animate;

        self.state.tweening = true;

        if (bolAnimate && !self.state.tweening) {
            window.TweenLite.to(self.el.wrapper, 0.3, {
                opacity: 0,
                delay: 0,
                onComplete: self.hidecomplete(cb)
            });
        } else {
            self.hidecomplete(cb);
        }
    },
    hidecomplete: function (cb) {
        objOverlay.el.wrapper.style.display = "none";
        objOverlay.state.visible = false;
        objOverlay.state.tweening = false;
        var bolCallback = (typeof cb === 'undefined') ? false : ((typeof cb === 'boolean') ? false : true);
        if (bolCallback) cb();
    },
    btncloseclick: function () {
        window.objHeader.btnbackclick();
    },
    init: function () {
        var self = this;
        self.state.tweening = false;
        self.state.visible = false;

        self.el.wrapper = window.getEl('overlay');

        if (window.isPublicSite()) {
            self.el.wrapper.closebutton = window.getEl('loader');
            self.el.wrapper.setAttributeNS(null, 'onclick', 'objOverlay.btncloseclick();');
        }
    }
}