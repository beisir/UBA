var lzString = require('lz-string'),
    ua = require('../libs/ua'),
    util = require('../libs/util'),
    promise = require('es6-promise');

/**
 * [sender 发送数据对象]
 * @return {Object} [发送数据对象实例]
 */
function sender(options) {
    var _this = this;

    /**
     * 扩展实例属性
     */
    util.extend(true, _this, {

            /**
             * [userID 用户对象实例]
             * @type {Object}
             */
            userEntity: null,

            /**
             * [pageEntity 页面对象实例]
             * @type {Object}
             */
            pageEntity: null,

            /**
             * [listener 自定义事件及其处理函数保存对象]
             * @type {Object}
             */
            listener: {},

            /**
             * [actionMapping 行为与行为名称映射表]
             * @type {Object}
             */
            actionMapping: {

                /**
                 * [pageview description]
                 * @type {String}
                 */
                pageview: 'page',

                /**
                 * [click 点击]
                 * @type {String}
                 */
                click: 'click',

                /**
                 * [exposure 曝光]
                 * @type {String}
                 */
                exposure: 'imp',

                /**
                 * [exposure 曝光]
                 * @type {String}
                 */
                close: 'close',

                /**
                 * [ci 部署到外域站点时，需要通过服务来写入 hc360 域的cookie，]
                 * @type {String}
                 */
                ci: 'ci',

                /**
                 * [action 其他行为]
                 * @type {String}
                 */
                action: 'action'
            },

            /**
             * [service 数据服务地址]
             * @type {String}
             */
            service: {

                /**
                 * [protocol 数据服务协议]
                 * @type {String}
                 */
                protocol: (util.global.document.location.protocol === 'https:') ? 'https://' : 'http://',

                /**
                 * [host 数据服务主机名]
                 * @type {String}
                 */
                host: (util.global.document.location.protocol === 'https:') ? 'logrecords.hc360.com' : 'log.org.hc360.com',

                /**
                 * [path 数据服务路径]
                 * @type {String}
                 */
                path: '/logrecordservice/sll'
            },

            /**
             * [compress 压缩方式名称]
             * @type {String}
             */
            compressName: 'uint8',

            /**
             * [_this.compressMapping 压缩方式映射关系]
             * @type {Object}
             */
            compressMapping: {
                compressToUTF16: 'utf16',
                compressToEncodedURIComponent: 'uri',
                compressToUint8Array: 'uint8'
            },

            /**
             * [senderName 数据发送者名称]
             * @type {String}
             */
            senderName: 'xhr',

            /**
             * [sender 数据发送者]
             * @type {String}
             */
            senderMapping: {
                sendByXMLHttpRequest: 'xhr',
                sendByXDomainRequest: 'xdr',
                sendByImage: 'img',
                sendByFormSubmit: 'form'
            },

            /**
             * [lzString lzString引用]
             * @type {[type]}
             */
            lzString: lzString
        },
        options);

    /**
     * 初始化发送数据对象
     */
    sender.prototype.init.call(_this);
}

/**
 * [init 初始化发送数据对象]
 * @return {[type]} [description]
 */
sender.prototype.init = function() {
    var _this = this;

    /**
     * [senders 设置发送者对象]
     * @type {Array}
     */
    _this.senders = [_this.sendByXMLHttpRequest, _this.sendByXDomainRequest, _this.sendByImage, _this.sendByFormSubmit];
};

/**
 * [send 发送数据，此处开始压缩数据]
 * @param  {Object} data   [数据对象]
 * @param  {String} action [发送行为标识]
 * @return {[type]}        [description]
 */
sender.prototype.send = function(data, actionName) {
    var _this = this,
        _action = _this.actionMapping[actionName] || _this.actionMapping.action,
        _ua = ua.parseUA(),

        /**
         * [_plainObject 初始化对象属性，该对象用于保持派发事件中对象应用]
         * @type {Object}
         */
        _dispatchEventArgs = {

            /**
             * [dataCompress 待发送数据]
             * @type {String}
             */
            dataCompressed: '',

            /**
             * [origin 压缩前数据对象]
             * @type {Object}
             */
            dataUncompressed: data,

            /**
             * [senders 发送者对象列表]
             * @type {[type]}
             */
            senders: _this.senders.slice(0)
        },

        /**
         * 发送数据延迟对象
         */
        _promise;

    /**
     * [t 发送数据行为标识]
     * @type {String}
     */
    _dispatchEventArgs.dataUncompressed.t = _action;

    /**
     * 压缩数据 
     */
    try {

        /**
         * [不支持Uint8Array对象的浏览器]
         */
        // if (!util.global.Uint8Array) {

        //     /**
        //      * 在支持XMLHttpRequest对象的浏览器且非IE7浏览器时使用compressToUTF16压缩
        //      * 
        //      * IE浏览器在IE7、IE8开始支持XMLHttpRequest对象
        //      */
        //     if (util.global.XMLHttpRequest && (parseInt(_ua.ie, 10) != 7)) {
        //         _dispatchEventArgs.dataCompressed = _this.lzString.compressToUTF16(JSON.stringify(_dispatchEventArgs.dataUncompressed));
        //         _this.compressName = _this.compressMapping.compressToUTF16;
        //     }

        //     /**
        //      * 在不支持XMLHttpRequest对象的浏览器或IE7浏览器时使用compressToEncodedURIComponent压缩
        //      */
        //     else {
        _dispatchEventArgs.dataCompressed = _this.lzString.compressToEncodedURIComponent(JSON.stringify(_dispatchEventArgs.dataUncompressed));
        _this.compressName = _this.compressMapping.compressToEncodedURIComponent;
        //     }
        // }

        // /**
        //  * 支持Uint8Array对象的浏览器使用compressToUint8Array压缩
        //  */
        // else {
        //     _dispatchEventArgs.dataCompressed = _this.lzString.compressToUint8Array(JSON.stringify(_dispatchEventArgs.dataUncompressed));
        //     _this.compressName = _this.compressMapping.compressToUint8Array;
        // }

    } catch (ex) {
        return;
    }

    /**
     * 派发开始发送数据事件
     */
    _this.__dispatchEvent('onBeforeSendData', _dispatchEventArgs);

    /**
     * [查找当前浏览器可发送数据的方式并使用该方式发送数据]
     */
    while (_dispatchEventArgs.senders.length && (!(_promise = _dispatchEventArgs.senders.shift().call(_this, _dispatchEventArgs.dataCompressed)))) {}

    /**
     * 返回延迟对象
     */
    return _promise;
};

/**
 * [sendByXMLHttpRequest 使用XMLHttpRequest对象发送数据]
 * @param  {Object} data [数据]
 * @return {[type]}      [description]
 */
sender.prototype.sendByXMLHttpRequest = function(data) {
    var _this = this,
        _xhr,
        _data = data,
        _promise;

    /**
     * [判断数据长度是否为0]
     */
    if (!_data.length) {
        return;
    }

    /**
     * [验证是否存在XMLHttpRequest对象]
     */
    if (util.global.XMLHttpRequest) {
        _xhr = new util.global.XMLHttpRequest();
    } else {
        return;
    }

    /**
     * [验证XMLHttpRequest对象是否支持withCredentials属性]
     */
    if ('withCredentials' in _xhr) {
        _xhr.withCredentials = true;
    } else {
        xhr = null;
        return;
    }

    /**
     * [_promise 创建延迟对象]
     */
    _promise = new promise(function(resolve, reject) {

        /**
         * [senderName 设置发送者名称]
         * @type {String}
         */
        _this.senderName = _this.senderMapping['sendByXMLHttpRequest'];

        /**
         * [打开链接]
         */
        _xhr.open('POST', _this.getServiceUrl(), true);
        _xhr.onreadystatechange = function() {
            if (_xhr.readyState === 4) {
                if (_xhr.status === 200) {
                    resolve(_xhr);
                } else {
                    reject(_xhr);
                }
            }
        };

        /**
         * [若支持ArrayBuffer]
         */
        // if (util.global.ArrayBuffer && data.buffer) {
        //     _data = data.buffer;
        // }

        /**
         * 发送数据
         */
        try {
            _xhr.send(_data);
        } catch (ex) {
            reject(_xhr);
        }
    });


    /**
     * 返回延迟对象
     */
    return _promise;
};

/**
 * [sendByXDomainRequest 使用sendByXDomainRequest对象发送数据]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
sender.prototype.sendByXDomainRequest = function(data) {
    var _this = this,
        _xdr,
        _data = data,
        _promise;

    /**
     * [判断数据长度是否为0]
     */
    if (!data.length) {
        return;
    }

    /**
     * [验证是否存在XDomainRequest对象]
     */
    if (!util.global.XDomainRequest) {
        return;
    }

    /**
     * [_promise 创建延迟对象]
     */
    _promise = new promise(function(resolve, reject) {

        /**
         * [senderName 设置发送者名称]
         * @type {String}
         */
        _this.senderName = _this.senderMapping['sendByXDomainRequest'];

        /**
         * 打开链接
         */
        _xdr = new util.global.XDomainRequest();
        _xdr.open('POST', _this.getServiceUrl());
        _xdr.onload = function() {
            resolve(_xdr);
        };
        _xdr.onerror = function() {
            reject(_xdr);
        };
        _xdr.onprogress = function() {};
        _xdr.ontimeout = function() {
            reject(_xdr);
        };

        /**
         * 发送数据
         */
        try {
            _xdr.send(_data);
        } catch (ex) {
            reject(_xdr);
        }
    });

    /**
     * 返回延迟对象
     */
    return _promise;
};

/**
 * [sendByImage 使用图片对象发送数据]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
sender.prototype.sendByImage = function(data) {
    var _this = this,
        _img,
        _data = data,
        _promise;

    /**
     * [判断数据长度是否为0或超过浏览器URL最小长度限制]
     */
    if ((data.length >= 2000) || (!data.length)) {
        return;
    }

    /**
     * [_promise 创建延迟对象]
     */
    _promise = new promise(function(resolve, reject) {

        /**
         * [senderName 设置发送者名称]
         * @type {String}
         */
        _this.senderName = _this.senderMapping['sendByImage'];

        /**
         * [_img 创建Image元素独显]
         * @type {Object}
         */
        _img = document.createElement('img');
        _img.width = 1,
            _img.height = 1;
        _img.onload = function() {
            resolve('load');
            _img.onload = _img.onerror = _img.onabort = null;
        };
        _img.onerror = function() {
            resolve('error');
            _img.onload = _img.onerror = _img.onabort = null;
        };
        _img.onabort = function() {
            reject('abort');
            _img.onload = _img.onerror = _img.onabort = null;
        };

        /**
         * [src 发送数据]
         */
        _img.src = [_this.getServiceUrl(), 'data=' + _data].join('&');
    });

    /**
     * 返回延迟对象
     */
    return _promise;
};

/**
 * [sendByFormSubmit 通过表单提交到框架页发送数据]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
sender.prototype.sendByFormSubmit = function(data) {
    var _this = this,
        _data = data,
        _promise,

        /**
         * [_iframeName 框架name属性]
         * @type {Object}
         */
        _iframeName = ('uba-iframe' + Math.random()).replace(/\.*/ig, '');

    /**
     * 曝光数据为空直接返回
     */
    if (!data.length) {
        return;
    }

    /**
     * [_promise 创建延迟对象]
     */
    _promise = new promise(function(resolve, reject) {

        /**
         * [senderName 设置发送者名称]
         * @type {String}
         */
        _this.senderName = _this.senderMapping['sendByFormSubmit'];

        /**
         * [是否未创建表单元素]
         */
        if (!_this.form) {

            /**
             * [拼接曝光表单元素HTML]
             * @type {String}
             */
            var _html = [
                '<div data-node-name="uba-form-wrap" style="display:none;">',
                '   <form action="#formaction#" enctype="application/x-www-form-urlencoded" method="post" target="#ifamename#">',
                '       <input name="data" type="hidden">',
                '   </form>',
                '   <iframe name="#ifamename#"></iframe>',
                '</div>'
            ];

            /**
             * [_formWrap 创建表单元素]
             * @type {Object}
             */
            var _wrap = document.createElement('div');
            _wrap.innerHTML = _html.join('').replace(/\#formaction\#/ig, _this.getServiceUrl()).replace(/\#ifamename\#/ig, _iframeName);

            /**
             * 将元素添加到主文档中
             */
            util.global.document.body.appendChild(_wrap);

            /**
             * [初始化相关元素配置到当前业务对象实例]
             */
            util.extend(true, _this, {
                form: {
                    form: _wrap.getElementsByTagName('form')[0],
                    input: _wrap.getElementsByTagName('input')[0],
                    iframe: _wrap.getElementsByTagName('iframe')[0]
                }
            });
        }

        /**
         * 设置表单中隐藏域的值
         */
        _this.form.input && (_this.form.input.value = data);

        /**
         * 发送数据
         */
        _this.form.form && _this.form.form.submit();

        /**
         * 因为无法知晓iframe加载状态，所以也就无从得知请求什么时候完成，这里直接解决延迟对象了
         */
        _promise.resolve();
    });

    /**
     * 返回延迟对象
     */
    return _promise;
};

/**
 * [getServiceUrl 获取数据服务地址]
 * @return {[type]} [description]
 */
sender.prototype.getServiceUrl = function() {
    var _this = this;
    return [_this.service.protocol, _this.service.host, _this.service.path, '?', 'stm=' + ((new Date()).getTime()), '&cps=' + _this.compressName, '&st=' + _this.senderName].join('');
};

/**
 * [__getEventListener 获取指定事件类型的事件处理函数列表]
 * @param  {String} eventType [事件类型]
 * @return {Array}           [事件处理函数列表]
 */
sender.prototype.__getEventListener = function(eventType) {
    var _this = this;
    _this.listener[eventType] = _this.listener[eventType] ? _this.listener[eventType] : [];
    return _this.listener[eventType];
};

/**
 * [__dispatchEvent 派发事件]
 */
sender.prototype.__dispatchEvent = function() {
    var _this = this,
        _eventType = Array.prototype.shift.call(arguments),
        _listener = _this.__getEventListener(_eventType);

    for (var i = 0; i < _listener.length; i++) {
        try {
            _listener[i].apply(_this, arguments);
        } catch (ex) {}
    }
};

/**
 * [__removeEventListener 移除事件监听]
 * @param {String} eventType    [事件类型]
 * @param {Object} eventHandler [事件处理函数]
 * @return {Object}              [当前业务对象]
 */
sender.prototype.removeEventListener = function(eventType, eventHandler) {
    var _this = this,
        _listener = _this.__getEventListener(eventType);

    for (var i = 0; i < _listener.length; i++) {
        if (eventHandler === _listener[i]) {
            _listener.splice(i--, 1);
        }
    }
};

/**
 * [addEventListener 添加事件监听]
 * @param {String} eventTypes    [事件类型名称列表]
 * @param {Object} eventHandler [事件处理函数]
 * @return {Object}              [当前业务对象]
 */
sender.prototype.addEventListener = function(eventTypes, eventHandler) {
    var _this = this,
        _listener = [],
        _eventTypeList = eventTypes.split(',');

    /**
     * [循环添加不同事件类型的事件处理函数]
     */
    _eventTypeList.forEach(function(eventType) {

        /**
         * [过滤空事件类型名称]
         */
        if (!(eventType.trim().length)) {
            return true;
        }

        /**
         * 获取指定事件类型的事件处理函数列表
         */
        _listener = _this.__getEventListener(eventType);

        /**
         * 将事件处理函数添加到指定事件类型的事件处理函数列表
         */
        _listener.push(eventHandler);
    });
};

module.exports = sender;