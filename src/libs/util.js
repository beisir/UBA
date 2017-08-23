var class2type = {},
    core_toString = class2type.toString,
    core_hasOwn = class2type.hasOwnProperty,
    // core_trim = ''.trim,
    core_trim = undefined,//因为需要过滤换行符，暂不使用原生的 trim 方法
    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
var class2typelist = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
for (var i = 0, j = class2typelist.length; i < j; i++) {
    class2type["[object " + class2typelist[i] + "]"] = class2typelist[i].toLowerCase();
}

/**
 * [util 工具类]
 * @type {Object}
 */
var util = {

    /**
     * [getFramePageType 获取框架页面类型]
     * 0：当前页未被框架页包含
     * 1：当前页被同域框架页包含
     * 2：当前页被外域框架页包含
     */
    getFramePageType: function() {

        /**
         * [type 页面类型]
         * @type {Number}
         */
        var type = 0,

            /**
             * 父框架页URL
             */
            topURL,

            /**
             * [localURL 当前页面URL]
             * @type {[type]}
             */
            localURL = window.location.href;
        try {

            /**
             * [topURL 获取父框架页URL]
             * @type {String}
             */
            topURL = window.top.location.href;

            /**
             * [localURL 判断当前页面URL和父框架页URL是否相同]
             */
            localURL == topURL ? type = 0 : type = 1;

            /**
             * [若父框架页地址获取不到]
             */
            if (topURL == undefined) {
                type = 2;
            }
        } catch (ex) {
            type = 2;
        }
        return {
            type: type,
            url: topURL || ''
        };
    },

    /**
     * [type 获取对象类型]
     * @type {String}
     */
    type: function(obj) {
        if (obj == null) {
            return String(obj);
        }
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[core_toString.call(obj)] || "object" :
            typeof obj;
    },

    /**
     * [getByteLength 获取字符串长度，英文占1个字符，中文汉字占2个字符]
     * @param {String} str [字符串]
     * @param {Number} minLength [字符串长度]
     */
    getByteLength: function(str) {
        if (typeof str != 'string') {
            str = str.toString();
        }
        var nlength = 0;
        for (var i = 0; i < str.length; i++) {
            if ((str.charCodeAt(i) & 0xff00) != 0) {
                nlength++;
            }
            nlength++;
        }
        return nlength;
    },

    /**
     * [获取指定url地址的主机名、协议等属性]
     * @param  {String} url [url]
     * @return {Object}     [属性对象]
     */
    parseURL: function(url) {

        /**
         * [url 删除左右空格]
         * @type {String}
         */
        var _url = url.replace(/(^\s*)|(\s*$)/g, ""),

            /**
             * [_protocols 网络协议前缀]
             * @type {Array}
             */
            _protocols = ['http', 'https'],

            /**
             * [_regExp 判断url地址是否包含网络协议]
             * @type {RegExp}
             */
            _regExp = new RegExp('^(' + _protocols.join('|') + ')\:\/\/', 'ig');

        /**
         * [若url地址不包含协议，则默认在url地址起始位置添加 http:// ]
         */
        (!_regExp.test(url)) && (_url = 'http://' + _url);

        /**
         * [根据url地址创建链接元素并解析链接属性]
         * @type {Object}
         */
        var a = document.createElement('a');
        a.href = _url;
        return {
            source: _url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function() {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length,
                    i = 0,
                    s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    },

    /**
     * [getQueryString 获取查询参数]
     * @param {String} key [键]
     * @return {String} [值]
     */
    getQueryString: function(key) {
        var search = window.location.search;
        var regExp = new RegExp('[\\?\\&]([^\\?\\&]+)=([^\\?\\&]+)', 'ig');
        var queryStringList = {};
        var parttern;
        while ((parttern = regExp.exec(search))) {
            if (!queryStringList[parttern[1].toLowerCase()]) {
                queryStringList[parttern[1].toLowerCase()] = parttern[2];
            }
        }

        //返回指定键的值
        if (key) {
            return queryStringList[key.toLowerCase()] || '';
        }

        //返回所有查询参数
        return queryStringList;
    },

    /**
     * [isBot 是否爬虫]
     * @return {Boolean} [description]
     */
    isBot: function() {
        return !!window.navigator.userAgent.toLowerCase().match(/(bot|crawler|spider|scrapy|jiankongbao|slurp|transcoder|networkbench)/i);
    },

    /**
     * [全局对象]
     */
    global: (function() {
        return this;
    })(),

    /**
     * [getBrowserPlugins 获取浏览器插件信息]
     * @return {[type]} [description]
     */
    getBrowserPlugins: function() {
        var _plugins = [];
        try {
            for (var i = 0, j = window.navigator.plugins.length; i < j; i++) {
                _plugins.push(window.navigator.plugins[i].name);
            }
        } catch (ex) {}
        return _plugins;
    },

    /**
     * [trim description]
     * @type {[type]}
     */
    trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
        function(text) {
            return text == null ?
                "" :
                core_trim.call(text);
        } :

        // Otherwise use our own trimming functionality
        function(text) {
            return text == null ?
                "" :
                (text + "").replace(rtrim, "");
        },

    /**
     * [hasAttribute 元素是否有指定属性]
     * @param  {[type]}  element [description]
     * @param  {[type]}  key     [description]
     * @return {Boolean}         [description]
     */
    hasAttribute: function(element, key) {
        return element.hasAttribute ? element.hasAttribute(key) : !!element[key];
    },

    /**
     * [addEventListener 添加元素事件监听]
     * @param {[type]} element    [description]
     * @param {[type]} eventName  [description]
     * @param {[type]} handler    [description]
     * @param {[type]} useCapture [description]
     */
    addEventListener: function(element, eventName, handler, useCapture) {
        if (document.addEventListener) {
            element.addEventListener(eventName, handler, !!useCapture);
        } else if (document.attachEvent) {
            element.attachEvent('on' + eventName, function() {
                var _event = window.event;
                _event.currentTarget = element;
                _event.target = _event.srcElement;
                handler.call(element, _event);
            });
        } else {
            element['on' + eventName] = hander;
        }
    },

    /**
     * [bind 添加元素事件监听，和 addEventListener 的区别在于IE浏览器不在匿名事件处理函数中对 handler 调用，而是直接将事件交给 handler 处理，这样保证顺利移除事件监听]
     * @param  {[type]} element    [description]
     * @param  {[type]} eventName  [description]
     * @param  {[type]} handler    [description]
     * @param  {[type]} useCapture [description]
     * @return {[type]}            [description]
     */
    bind: function(element, eventName, handler, useCapture) {
        if (document.addEventListener) {
            element.addEventListener(eventName, handler, !!useCapture);
        } else if (document.attachEvent) {
            element.attachEvent('on' + eventName, handler);
        } else {
            element['on' + eventName] = hander;
        }
    },

    /**
     * [removeEventListener 移除元素事件监听]
     * @param  {[type]} element    [description]
     * @param  {[type]} eventName  [description]
     * @param  {[type]} handler    [description]
     * @param  {[type]} useCapture [description]
     * @return {[type]}            [description]
     */
    removeEventListener: function(element, eventName, handler, useCapture) {
        if (document.removeEventListener) {
            element.removeEventListener(eventName, handler, !!useCapture);
        } else if (document.detachEvent) {
            element.detachEvent('on' + eventName, handler);
        } else {
            element['on' + eventName] = null;
        }
    },

    /**
     * [ready 监听DOMContentLoaded事件]
     * @param  {Function} fn [description]
     * @return {[type]}      [description]
     */
    ready: require('../components/DOMReady'),

    /**
     * [throttle 函数节流]
     */
    throttle: function(fn, delay) {
        var timer = null;
        return function() {
            var context = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        };
    }
};


/**
 * [isFunction description]
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
util.isFunction = function(obj) {
    return util.type(obj) === "function";
};

/**
 * [isArray description]
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
util.isArray = Array.isArray || function(obj) {
    return util.type(obj) === "array";
};

/**
 * [isWindow description]
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
util.isWindow = function(obj) {
    return obj != null && obj == obj.window;
};

/**
 * [isPlainObject description]
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
util.isPlainObject = function(obj) {
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don'el pass through, as well
    if (!obj || util.type(obj) !== "object" || obj.nodeType || util.isWindow(obj)) {
        return false;
    }

    try {
        // Not own constructor property must be Object
        if (obj.constructor &&
            !core_hasOwn.call(obj, "constructor") &&
            !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
    } catch (e) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var key;
    for (key in obj) {}

    return key === undefined || core_hasOwn.call(obj, key);
};

/**
 * [extend description]
 * @return {[type]} [description]
 */
util.extend = function() {
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !util.isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (length === i) {
        target = this;
        --i;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (util.isPlainObject(copy) || (copyIsArray = util.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && util.isArray(src) ? src : [];

                    } else {
                        clone = src && util.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = util.extend(deep, clone, copy);

                    // Don'el bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

/**
 * [outerWidth description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
util.outerWidth = function(el) {
    var width = el.offsetWidth;
    var style = el.currentStyle || window.getComputedStyle(el);

    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
};

/**
 * [outerHeight description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
util.outerHeight = function(el) {
    var height = el.offsetHeight;
    var style = el.currentStyle || window.getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
};

/**
 * [height description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
util.height = function(el) {
    return (el.currentStyle || window.getComputedStyle(el)).height;
};

/**
 * [width description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
util.width = function(el) {
    return (el.currentStyle || window.getComputedStyle(el)).width;
};

/**
 * [css description]
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
util.css = function(el, name) {
    return (el.currentStyle || window.getComputedStyle(el))[name];
};

/**
 * [visible 判断元素是否显示在屏幕中]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
util.visible = function(el, direction) {
    if (!el) {
        return;
    }

    // Set direction default to 'both'.
    direction = direction || 'both';

    var vpWidth = window.document.documentElement.clientWidth,
        vpHeight = window.document.documentElement.clientHeight;
    if (el.getBoundingClientRect) {

        // Use this native browser method, if available.
        var rec = el.getBoundingClientRect(),
            tViz = rec.top >= 0 && rec.top < vpHeight,
            bViz = rec.bottom > 0 && rec.bottom <= vpHeight,
            lViz = rec.left >= 0 && rec.left < vpWidth,
            rViz = rec.right > 0 && rec.right <= vpWidth,
            vVisible = tViz && bViz,
            hVisible = lViz && rViz,
            vVisible = (rec.top < 0 && rec.bottom > vpHeight) ? true : vVisible,
            hVisible = (rec.left < 0 && rec.right > vpWidth) ? true : hVisible;

        if (direction === 'both')
            return !!(vVisible && hVisible);
        else if (direction === 'vertical')
            return !!(vVisible);
        else if (direction === 'horizontal')
            return !!(hVisible);
    } else {
        var viewTop = 0,
            viewBottom = viewTop + vpHeight,
            viewLeft = ('pageXOffset' in window) ? window['pageXOffset'] : window.document.documentElement['scrollLeft'] || el['scrollLeft'],
            viewRight = viewLeft + vpWidth,
            _top = el.offsetTop,
            _bottom = el.offsetTop + util.height(el),
            _left = el.offsetLeft,
            _right = el.offsetLeft + util.width(el),
            compareTop = _top,
            compareBottom = _bottom,
            compareLeft = _left,
            compareRight = _right;

        if (direction === 'both')
            return !!((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
        else if (direction === 'vertical')
            return !!((compareBottom <= viewBottom) && (compareTop >= viewTop));
        else if (direction === 'horizontal')
            return !!((compareRight <= viewRight) && (compareLeft >= viewLeft));
    }
};

module.exports = util;