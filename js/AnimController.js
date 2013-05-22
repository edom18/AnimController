(function (win, doc, Class) {

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
            this.FPS = attr.FPS || this.FPS;
        },
        add: function (data) {
            this._queue.push(new Anim(data));
        },
        start: function () {
            this._prevTime = +new Date();
            this._loop();
        },
        stop: function () {
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


    //------------------------------------------------------------

    //for test

    win.actrl = new AnimController();
    actrl.add({
        delay: 50,
        duration: 1000,
        func: function (t) {
            console.log(t);
        }
    });

    actrl.start();
    actrl.on('done', function () {
        alert('all things has done.');
    });

}(window, window.document, window.Class));
