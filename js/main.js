(function (win, doc) {

    'use strict';

    var el = doc.querySelector('#test');

    win.actrl = AnimController.loop([
        {
            delay: 50,
            duration: 1000,
            func: function (t) {
                var val = easing(0, 500, t);
                el.style.left = val + 'px';
            }
        },
        {
            delay: 500,
            duration: 1000,
            func: function (t) {
                var val = easing(0, 300, t);
                el.style.top = val + 'px';
            }
        }
    ]).start();

    //win.actrl = AnimController.parallel([
    //    {
    //        delay: 50,
    //        duration: 1000,
    //        func: function (t) {
    //            var val = easing(0, 500, t);
    //            el.style.left = val + 'px';
    //        }
    //    },
    //    {
    //        delay: 500,
    //        duration: 1000,
    //        func: function (t) {
    //            var val = easing(0, 300, t);
    //            el.style.top = val + 'px';
    //        }
    //    }
    //]).start();

    actrl.on('done', function () {
        console.log('all things has done.');
    });

}(window, window.document));
