(function (win, doc) {

    'use strict';

    function AnimController() {

    }
    AnimController.prototype = {
        constructor: AnimController,
        add: function (anim) {

        },
        start: function () {

        },
        stop: function () {

        }
    };

    function Anim() {

    }
    Anim.prototype = {
        constructor: Anim
    };


    //for test

    var actrl = new AnimController();
    actrl.add({
        delay: 500,
        dulation: 1000,
        run: function (t) {
            var x = t / 1000;
            var val = easing(a, b, x);
            el.style.width = val + 'px';
        }
    });

    actrl.start();
    actrl.on('done', function () {
        alert('all things has done.');
    });

}(window, window.document));
