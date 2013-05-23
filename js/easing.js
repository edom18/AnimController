
    var PI  = Math.PI,
        pow = Math.pow,
        cos = Math.cos,
        sin = Math.sin;

    function ease(a, b, x) {
        var c = a - b;
        var t = (x - 0.5) * 2;

        return b * (1 - t * t) + a;
    }

    function easing(a, b, x) {
        var f = (1.0 - cos(x * PI)) * 0.5;
        return a * (1.0 - f) + b * f;
    }

    function easeInOutExpo(a, b, x) {
        var c = b - a;
        var t = x * 2;

        if (t < 1) {
            return c / 2 * pow(2, 10 * (t - 1)) + a;
        }

        return c / 2 * (-pow(2, -10 * (t - 1)) + 2) + a;
    }

    function easeInOutExpo2(a, b, x) {
        var c = b - a;
        var t = x * 2;

        if (t < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + a;
        }
        if (t < 1.7) {
            return (c / 2 * (-Math.pow(2, -10 * (t - 1)) + 2)) * 0.95 + a;
        }

        return c / 2 * (-Math.pow(2, -10 * (t - 1)) + 2) + a;
    }

    function easeInExpo(a, b, x) {
        var c = b - a;
        return c * pow(2, 10 * (x - 1)) + a;
    }

    function easeOutExpo(a, b, x) {
        var c = b - a;
        return c * (-pow(2, -10 * x) + 1) + a;
    }
