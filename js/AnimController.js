(function (win, doc, Class, exports) {

    'use strict';

    /**
     * Runner base class.
     * @constructor
     */
    var AnimRunner = Class.extend({
        /**
         * @param {AnimController} ctrl will use to access the controller.
         */
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
                queue = this.ctrl.getQueue(),

                duration,
                delay,
                past;

            this.ctrl.setFrame(frame);

            for (var i = 0, l = queue.length; i < l; i++) {
                duration = queue[i].duration;
                delay = queue[i].delay;
                past = frame - delay;

                if (delay > frame) {
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
                queue,
                duration,
                delay,
                past;

            frame = this.ctrl.getFrame() + 1;
            queue = this.ctrl.getQueue(0);
            this.ctrl.setFrame(frame);

            duration = queue.duration;
            delay = queue.delay;
            past  = frame - delay;

            if (delay > frame) {
                return;
            }

            queue.run(past / duration);

            if (queue.isTerminal()) {
                this.ctrl.setFrame(0);
            }
        }
    });

    /**
     * Loop runner class.
     * @constructor
     */
    var LoopAnimRunner = AnimRunner.extend({
        _getNextQueue: function () {
            var queue = this.ctrl.getQueue();

            for (var i = 0, l = queue.length; i < l; i++) {
                if (!queue[i].isTerminal()) {
                    return queue[i];
                }
            }

            return null;
        },
        _resetQueue: function () {
            var queue = this.ctrl.getQueue();

            for (var i = 0, l = queue.length; i < l; i++) {
                queue[i].reset();
            }

            this.ctrl.setFrame(0);
        },
        run: function () {
            var frame,
                queue,
                duration,
                delay,
                past;

            queue = this._getNextQueue();

            if (queue === null) {
                this._resetQueue();
                return;
            }

            frame = this.ctrl.getFrame() + 1;
            this.ctrl.setFrame(frame);

            duration = queue.duration;
            delay = queue.delay;
            past  = frame - delay;

            if (delay > frame) {
                return;
            }

            queue.run(past / duration);

            if (queue.isTerminal()) {
                this.ctrl.setFrame(0);
            }
        }
    });

    // ----------------------------------------------------------------------------------------

    /**
     * Animation contoroller class
     * @constructor
     * @param {Object} attr config object.
     */
    var AnimController = EventDispatcher.extend({
        FPS: 16,

        /**
         * @param {Object} config object.
         */
        init: function (attr) {

            attr || (attr = {});

            this._queue = [];
            this._frame = 0;
            this._prevTime = 0;
            this._stopped = true;
            this.FPS = attr.FPS || this.FPS;
            this._unneeded  = attr.unneeded;
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

            this._compile(this.runner instanceof ParallelAnimRunner);

            return this;
        },

        /**
         * Start an animation.
         */
        start: function () {
            this._stopped = false;
            this._prevTime = +new Date();
            this._loop();

            return this;
        },

        /**
         * Stop an animation.
         */
        stop: function () {
            this._stopped = true;
            clearTimeout(this._timerId);

            return this;
        },

        /**
         * Return length of queue.
         */
        length: function () {
            return this._queue.length;
        },

        /**
         * Proceed a frame.
         */
        run: function () {
            this.runner.run();
            return this;
        },

        /**
         * Compile queue delays.
         */
        _compile: function (needParse) {

            var queue = this._queue,
                prevQueue,
                curQueue,
                prevTime = 0,

                FPS = this.FPS;

            function _parseNum(str) {
                return +(str.slice(2));
            }
            function _convart(num) {
                return Math.floor(num / FPS);
            }

            for (var i = 0, l = queue.length; i < l; i++) {
                prevQueue = queue[i - 1];
                curQueue  = queue[i];

                //convart to as frame.
                curQueue.duration = _convart(curQueue.duration);

                if (!needParse) {
                    if ({}.toString.call(curQueue.delay) === '[object String]') {
                        curQueue.delay = _convart(_parseNum(curQueue.delay));
                    }
                    else {
                        curQueue.delay = _convart(curQueue.delay);
                    }
                    continue;
                }

                if (prevQueue) {
                    prevTime = prevQueue.delay + prevQueue.duration;
                }

                if ({}.toString.call(curQueue.delay) !== '[object String]') {
                    curQueue.delay = _convart(curQueue.delay);
                    continue;
                }

                var type = curQueue.delay.match(/^[+-]=/);

                if (type === null) {
                    curQueue.delay = _convart(+curQueue.delay);
                    continue;
                }

                curQueue.delay = _convart(_parseNum(curQueue.delay));

                if (type[0] === '-=') {
                    curQueue.delay *= -1;
                }

                curQueue.delay = prevTime + curQueue.delay;

                if (curQueue.delay < 0) {
                    curQueue.delay = 0;
                }
            }
        },

        /**
         * Clearn up a queue.
         */
        _clearnup: function () {

            if (this._unneeded) {
                return;
            }

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

        /**
         * This method gives a loop of animation.
         */
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
     * Create animation controller as loop.
     * @param {Object} data initialize data.
     */
    AnimController.loop = function (data) {
        var actrl = new AnimController({
            unneeded: true,
            runner: LoopAnimRunner,
            data: data
        });

        return actrl;
    };

    // -------------------------------------------------------------------

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
            this.duration  = attr.duration || 1;
            this.attribute = attr.attribute;
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
        },
        reset: function () {
            this._terminated = false;
        }
    });

    /* -----------------------------------------------------
        EXPORTS
    -------------------------------------------------------- */
    exports.Anim = Anim;
    exports.AnimController = AnimController;

}(window, window.document, window.Class, window));
