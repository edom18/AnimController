(function (win, doc, Class, exports) {

    'use strict';

    /**
     * Animation contoroller class
     * @constructor
     * @param {Object} attr config object.
     */
    var AnimController = EventDispatcher.extend({
        FPS: 16,
        init: function (attr) {

            attr || (attr = {});

            this._queue = [];
            this._frame = 0;
            this._prevTime = 0;
            this._stopped = true;
            this.FPS = attr.FPS || this.FPS;
        },

        /**
         * Add anim(s) data.
         * @param {Object|Array.<Object|Anim>} data animation object.
         */
        add: function (data) {
            var d = null;

            if ({}.toString.call(data) !== '[object Array]') {
                data = [data];
            }

            for (var i = 0, l = data.length; i < l; i++) {
                d = (data[i] instanceof Anim) ? data[i] : new Anim(data[i]);
                this._queue.push(d);
            }
        },
        start: function () {
            this._stopped = false;
            this._prevTime = +new Date();
            this._loop();
        },
        stop: function () {
            this._stopped = true;
            clearTimeout(this._timerId);
        },
        length: function () {
            return this._queue.length;
        },
        run: function () {
            this._frame++;
            var t = this._frame * this.FPS;
            var queue = this._queue;

            for (var i = 0, l = queue.length; i < l; i++) {
                var duration = queue[i].duration;
                var delay = queue[i].delay;
                var past = t - delay;

                if (delay > t) {
                    continue;
                }

                queue[i].run(past / duration);
            }
        },
        _clearnup: function () {
            var queue = this._queue;
            var _newArr = [];

            for (var i = 0, l = queue.length; i < l; i++) {
                if (queue[i].isTerminal()) {
                    queue[i].dispose();
                    queue[i] = null;
                    continue;
                }

                _newArr.push(queue[i]);
            }

            this._queue = _newArr;
        },
        _loop: function () {
            this.run();

            this._clearnup();

            if (this.length() === 0) {
                this.stop();
                this.trigger('done');
                return;
            }

            this._timerId = setTimeout(this._loop.bind(this), this.FPS);
        }
    });

    /**
     * Anim class
     * @constructor
     * @param {Object} attr config object.
     */
    var Anim = Class.extend({
        init: function (attr) {
            attr || (attr = {});

            this.func = attr.func || function () {};
            this.delay = attr.delay || 0;
            this.duration = attr.duration || 1;
        },
        dispose: function () {
            this.func = null;
            this.delay = null;
            this.duration = null;
        },
        run: function (t) {

            if (t > 1) {
                this._terminated = true;
                return;
            }
            this.func(t);
        },
        isTerminal: function () {
            return this._terminated;
        }
    });

    exports.AnimController = AnimController;
}(window, window.document, window.Class, window));
