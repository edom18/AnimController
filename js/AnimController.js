(function (win, doc, Class, exports) {

    'use strict';

    var AnimRunner = Class.extend({
        init: function (ctrl) {
            this.ctrl = ctrl;
        },
        run: function () {}
    });

    /**
     * Parallel runner class.
     * @constructor
     */
    var ParallelAnimRunner = AnimRunner.extend({
        run: function () {
            var frame = this.ctrl.getFrame() + 1,
                t = frame * this.ctrl.FPS,
                queue = this.ctrl.getQueue(),

                duration,
                delay,
                past;

            this.ctrl.setFrame(frame);

            for (var i = 0, l = queue.length; i < l; i++) {
                duration = queue[i].duration;
                delay = queue[i].delay;
                past = t - delay;

                if (delay > t) {
                    continue;
                }

                queue[i].run(past / duration);
            }
        }
    });

    /**
     * Serial runner class.
     * @constructor
     */
    var SerialAnimRunner = AnimRunner.extend({
        run: function () {
            var frame,
                t,
                queue,
                duration,
                delay,
                past;

            frame = this.ctrl.getFrame() + 1;
            this.ctrl.setFrame(frame);
            t = frame * this.ctrl.FPS;
            queue = this.ctrl.getQueue(0);

            duration = queue.duration;
            delay = queue.delay;
            past = t - delay;

            if (delay > t) {
                return;
            }

            queue.run(past / duration);

            if (queue.isTerminal()) {
                this.ctrl.setFrame(0);
            }
        }
    });

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
            this.runner = attr.runner ? new attr.runner(this) : new ParallelAnimRunner(this);

            if (attr.data) {
                this.add(attr.data);
            }
        },
        getFrame: function () {
            return this._frame;
        },
        setFrame: function (frame) {
            this._frame = frame;
        },
        getQueue: function (index) {
            if (typeof index !== 'undefined') {
                return this._queue[index];
            }
            return this._queue.slice();
        },
        setQueue: function (index, queue) {
            this._queue[index] = queue;
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

            return this;
        },
        start: function () {
            this._stopped = false;
            this._prevTime = +new Date();
            this._loop();

            return this;
        },
        stop: function () {
            this._stopped = true;
            clearTimeout(this._timerId);

            return this;
        },
        length: function () {
            return this._queue.length;
        },
        run: function () {
            this.runner.run();
            return this;
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
     * Create animation controller as parallel.
     * @param {Object} data initialize data.
     */
    AnimController.parallel = function (data) {
        var actrl = new AnimController({
            runner: ParallelAnimRunner,
            data: data
        });

        return actrl;
    };

    /**
     * Create animation controller as serial.
     * @param {Object} data initialize data.
     */
    AnimController.serial = function (data) {
        var actrl = new AnimController({
            runner: SerialAnimRunner,
            data: data
        });

        return actrl;
    };

    /**
     * Anim class
     * @constructor
     * @param {Object} attr config object.
     */
    var Anim = Class.extend({
        init: function (attr) {
            attr || (attr = {});

            this.func  = attr.func;
            this.delay = attr.delay || 0;
            this.duration = attr.duration || 1;
        },
        dispose: function () {
            this.func  = null;
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

    /* -----------------------------------------------------
        EXPORTS
    -------------------------------------------------------- */
    exports.Anim = Anim;
    exports.AnimController = AnimController;

}(window, window.document, window.Class, window));
