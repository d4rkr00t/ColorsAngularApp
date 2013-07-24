angular.module('colorsApp', []);

function Color (hex) {
    this.hex = hex;

    var self = this;

    this.getRGB = function () {
        var result = "";
        if (this.hex.length > 4) {
            result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.hex);
        } else {
            result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(this.hex);
            result[1] = result[1] + result[1];
            result[2] = result[2] + result[2];
            result[3] = result[3] + result[3];
        }

        this.rgb = result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };
    this.getRGB();

    this.getStyle = function (count) {
        var width = 100 / count;
        return "background: " + this.hex + "; width: " + width + "%;";
    };

    this.shadeColor = function (percent) {
        var num = parseInt(this.hex.replace('#',''), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            B = (num >> 8 & 0x00FF) + amt,
            G = (num & 0x0000FF) + amt;

        this.hex = '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
    };

    this.getRgbInfo = function () {
        try {
            return "r: " + this.rgb[0] + ", g: " + this.rgb[1] + ", b: " + this.rgb[2];
        } catch (e) {
            return "wrong color format";
        }
    };
    this.getHsvInfo = function () {
        try {
            var hsv = this.getHSV();
            return "h: " + hsv.h + ", s: " + hsv.s + ", v: " + hsv.v;
        } catch (e) {
            return "wrong color format";
        }
    };

    this.getHSV = function () {
        this.getRGB();
        var rr, gg, bb,
            color = this.rgb,
            r = color[0] / 255,
            g = color[1] / 255,
            b = color[2] / 255,
            h, s,
            v = Math.max(r, g, b),
            diff = v - Math.min(r, g, b),
            diffc = function(c){
                return (v - c) / 6 / diff + 1 / 2;
            };

        if (diff === 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(r);
            gg = diffc(g);
            bb = diffc(b);

            if (r === v) {
                h = bb - gg;
            }else if (g === v) {
                h = (1 / 3) + rr - bb;
            }else if (b === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            }else if (h > 1) {
                h -= 1;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    };
}

angular.module('colorsApp').controller('MainCtrl', function($scope) {
    /**
     * Load timers from localStorage
     */
    var load;
    load = function(key) {
        var data = localStorage.getItem(key);
        return JSON.parse(data);
    };

    /**
     * Save to localStorage
     */
    var save;
    save = function(key, data) {
        data = JSON.stringify(data);
        localStorage.setItem(key, data);
    };

    /**
     * Switch layout
     */
    var switchVertHorizontal;
    switchVertHorizontal = function() {
        if ($(window).width() < 171 * $scope.colors.length) {
            $('.b-colors-container').addClass('b-colors-container__m-vertical');
        } else {
            $('.b-colors-container').removeClass('b-colors-container__m-vertical');
        }
    };

    var colorsForRandom = [
            '#1ABC9C', '#16A085', '#2ECC71', '#27AE60', '#3498DB', '#2980B9', '#9B59B6',
            '#8E44AD', '#34495E', '#2C3E50', '#F1C40F', '#F39C12', '#E67E22', '#D35400',
            '#E74C3C', '#C0392B', '#95A5A6', '#7F8C8D'
        ],
        allowSave = true,
        locationHash = window.location.hash,
        tmp = [];

    if (locationHash.length > 4) {
        tmp = locationHash.split('|');
    } else {
        tmp = load('colors');
    }

    $scope.colors = [];
    $scope.hash = "#";
    $scope.baseUrl = "http://s7at1c.ru/colors/";

    if (tmp && tmp.length > 0) {
        for (var i = 0, max = tmp.length; i < max; i++) {
            $scope.colors.push(new Color(tmp[i]));
        }
    } else {
        $scope.colors.push(new Color(colorsForRandom[Math.floor(Math.random()*colorsForRandom.length)]));
    }

    switchVertHorizontal();
    $(window).on('resize', function () {
        switchVertHorizontal();
    });

    $scope.addColor = function () {
        $scope.colors.push(new Color(colorsForRandom[Math.floor(Math.random()*colorsForRandom.length)]));
        switchVertHorizontal();
    };

    $scope.removeColor = function (index, evt) {
        evt.preventDefault(); evt.stopPropagation();
        $scope.colors.splice(index, 1);
        switchVertHorizontal();
    };

    $scope.ligthen = function (index, evt) {
        evt.preventDefault(); evt.stopPropagation();
        $scope.colors[index].shadeColor(1);
    };

    $scope.darken = function (index, evt) {
        evt.preventDefault(); evt.stopPropagation();
        $scope.colors[index].shadeColor(-1);
    };

    $scope.select = function (evt) {
        evt.preventDefault(); evt.stopPropagation();
        $('.b-link-modal').fadeIn();
        $('.b-clipboard-textarea')[0].select();
    };

    $scope.$watch('colors', function () {
        var colorsForSave = [],
            hash = "";

        for (var i = 0, max = $scope.colors.length; i < max; i++) {
            colorsForSave.push($scope.colors[i].hex);
            if (hash.length === 0) {
                hash += $scope.colors[i].hex;
            } else {
                hash += "|"+$scope.colors[i].hex;
            }
        }

        save('colors', colorsForSave);
        window.location.hash = hash;
        $scope.hash = hash;
    }, true);

    $(document).on('click', function () {
        $('.b-link-modal').fadeOut();
    });

    $(document).on('click', 'textarea', function (evt) {
        evt.preventDefault(); evt.stopPropagation();
    });
});