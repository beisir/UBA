var util = require('../libs/util'),
    uuid = require('../libs/uuid'),
    ua = require('../libs/ua'),
    sender = require('../modules/sender'),
    user = require('../modules/user'),
    page = require('../modules/page'),
    TreeMirrorClient = require('../components/TreeMirrorClient_compatible'),
    promise = require('es6-promise');

/**
 * 非IE浏览器或IE9以上浏览器，导入MutationObserver对象
 *
 * 非IE浏览器 ua.parseUA().ie 的值为0
 */
var ieVersion = parseInt(ua.parseUA().ie, 10);
if ((ieVersion === 0) || (ieVersion >= 9)) {

    /**
     * 导入MutationObserver模块
     */
    util.global.MutationObserver = require('../components/MutationObserver');

    /**
     * 导入TreeMirrorClient模块
     */
    TreeMirrorClient = require('../components/TreeMirrorClient');
}

/**
 * [tracker 用户行为跟踪对象]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function tracker(options) {
    var _this = this;

    /**
     * 扩展实例属性
     */
    util.extend(true, _this, {

        /**
         * [accountID 初始化站点编号]
         * @type {UUID}
         */
        accountID: (new uuid()).id,

        /**
         * [browser 浏览器类型]
         * @type {String}
         */
        browserType: 'web',

        /**
         * [lastActionTime 访客最后一个行为时间]
         * @type {[type]}
         */
        lastActionTime: (new Date()).getTime(),

        /**
         * [userEntity 生成用户对象实例]
         * @type {user}
         */
        userEntity: new user(),

        /**
         * [pageEntity 生成页面对象实例]
         * @type {page}
         */
        pageEntity: new page(),

        /**
         * [senderEntity 初始化发送数据对象实例]
         * @type {sender}
         */
        senderEntity: new sender(),

        /**
         * [circleHandlerEntity 圈选业务对象实例]
         * @type {[type]}
         */
        circleHandlerEntity: null
    }, options);
}

/**
 * [init 初始化用户行为跟踪对象]
 */
tracker.prototype.init = function() {
    var _this = this,
        _promise = new promise(function(resolve, reject) {
            resolve();
        });

    /**
     * [监听发送数据前事件]
     */
    _this.senderEntity.addEventListener('onBeforeSendData', function(args) {
        var _ref = this;

        /**
         * [发送关闭页面时间时，为避免请求被挂起，使用图片对象发送数据]
         *
         * [发送写入cookie请求时，使用图片对象发送数据]
         */
        if ((args.dataUncompressed.t === 'close') || (args.dataUncompressed.t === 'ci')) {

            /**
             * [dataCompressed 重新压缩数据]
             * @type {String}
             */
            args.dataCompressed = _ref.lzString.compressToEncodedURIComponent(JSON.stringify(args.dataUncompressed));

            /**
             * [compressName 指定压缩方式名称]
             * @type {[type]}
             */
            _ref.compressName = _ref.compressMapping.compressToEncodedURIComponent;

            /**
             * [sender 设置]
             * @type {Array}
             */
            args.senders = [_ref.sendByImage];
        }
    });

    /**
     * [若非 hc360.com 域的站点，需要依赖服务写入 hc360.com 域的cookie，以便将当前访客和 hc360.com 域的访客联系到一起]
     */
    if (!(/hc360.com$/.test(util.global.location.hostname.toLowerCase()))) {

        /**
         * [创建加载服务的延迟对象]
         */
        _promise = _this.senderEntity.send({}, 'ci');
    }

    /**
     * [若存在加载服务的延迟对象，则等待服务加载完成后，执行后续业务逻辑]
     */
    _promise.then(function() {

        /**
         * 开始DOM监测
         */
        _this.observe();
    });

    /**
     * [延迟对象失败回调]
     */
    _promise.catch(function() {});
};

/**
 * [observe 开始监测]
 */
tracker.prototype.observe = function() {
    var _this = this;

    /**
     * 发送PV数据
     */
    _this.sendPageView();

    /**
     * [监听DOMContentLoaded事件]
     */
    util.ready(function() {

        /**
         * 注册事件监听
         */
        _this.registerEventListener();

        /**
         * [注册DOM监听]
         */
        util.global.setTimeout(function() {
            _this.registerDOMObserver();
        }, 1000);

        /**
         * 通知父框架页当前页面加载完成，用于用户行为分析后台的圈选功能
         */
        _this.pageEntity.postMessage({
            action: 'iframeDOMContentLoaded',
            url: window.location.href||''
        });
    });

    /**
     * [添加beforeunload事件监听]
     */
    util.addEventListener(util.global, 'beforeunload', function() {

        /**
         * 发送页面关闭事件，用于计算页面停留时间
         */
        _this.beforeunloadHandler();
    });

    /**
     * [监听消息事件]
     */
    util.addEventListener(util.global, 'message', function(event) {
        var _data = event.data;

        /**
         * [若消息为空]
         */
        if (!_data) {
            return;
        }

        /**
         * [根据 _data.action 执行当前对象对应方法]
         * @type {String}
         */
        switch (_data.action) {
            case 'loadCirclePlugin':
                _this.loadCirclePlugin();
                break;

                /**
                 * 父框架页切换回浏览模式
                 */
            case 'browse-mode':
                _this.circleHandlerEntity.switchToBrowseMode();
                break;

                /**
                 * 父框架页切换到圈选模式
                 */
            case 'circle-mode':
                _this.circleHandlerEntity.switchToCircleMode();
                break;

                /**
                 * 父框架页切换到热图模式
                 */
            case 'heat-mode':
                _this.circleHandlerEntity.switchToHeatMode();
                break;
            default:
                break;
        }
    });
};

/**
 * [sendPageView 发送PV数据]
 */
tracker.prototype.sendPageView = function() {
    var _this = this,
        _data = {
            ai: _this.accountId,
            b: _this.browserType,
            ui: _this.userEntity.userId,
            vi: _this.userEntity.visitId,
            si: _this.userEntity.sessionId,
            tm: _this.userEntity.visitTime,
            ft: _this.userEntity.firstVisitTime,
            sw: _this.userEntity.screenWidth,
            sh: _this.userEntity.screenHeight,
            l: _this.userEntity.browserLanguage,
            pt: _this.pageEntity.protocol,
            d: _this.pageEntity.host,
            p: _this.pageEntity.path,
            q: _this.pageEntity.query,
            rf: _this.pageEntity.referrer,
            pi: _this.pageEntity.pageId,
            ti: _this.pageEntity.title,
            // at: ua.parseUA(),
            cs: util.global.document.charset || '',
            ic: util.global.navigator.cookieEnabled,
            dpi: util.global.devicePixelRatio || 0,
            ifr: _this.pageEntity.pageFrameType.type,
            ifru: _this.pageEntity.pageFrameType.type ? _this.pageEntity.pageFrameType.url : '',
            //为区分sem，高振洲需求，阿拉丁页增加特有两个参数，以区分流量
            kw: window.requesParamsVo ? window.requesParamsVo.key : '',
            isem: window.datap4p ? (window.datap4p == 'false' ? 1 : 0) : ''
        },
        _promise = _this.senderEntity.send(_data, 'pageview');

    /**
     * [发送数据成功回调]
     */
    _promise.then(function() {});

    /**
     * [发送数据失败回调]
     */
    _promise.catch(function() {});
};

/**
 * [loadCirclePlugin 加载圈选插件]
 * @return {[type]} [description]
 */
tracker.prototype.loadCirclePlugin = function() {
    var _this = this,
        _promiseJS,
        _promiseCSS;

    /**
     * [若当前圈选对象实例不存在]
     */
    if (!_this.circleHandlerEntity) {

        /**
         * [_promiseJS 创建延迟对象]
         */
        _promiseJS = new promise(function(resolve, reject) {

            /**
             * [异步加载圈选插件]
             */
            require.ensure([], function(require) {
                resolve(require('../plugins/circle.js'));
            }, 'plugin.circle');
        });

        /**
         * [_promiseCSS 创建延迟对象]
         */
        _promiseCSS = new promise(function(resolve, reject) {

            /**
             * [异步加载圈选插件]
             */
            require.ensure([], function(require) {
                resolve(require('../plugins/circle.style.css'));
            }, 'plugin.circle.style');
        });

        /**
         * [加载完圈选脚本和样式完成后通知框架页圈选功能加载完毕]
         */
        promise.all([_promiseJS, _promiseCSS]).then(function(_tempModules) {
            var _circleModule = _tempModules[0];

            /**
             * [circleHandlerEntity 初始化圈选插件实例]
             * @type {circleModule}
             */
            _this.circleHandlerEntity = new _circleModule(_this);

            /**
             * 通知父框架页圈选组件加载完成
             */
            _this.pageEntity.postMessage({
                action: 'loadCirclePluginComplete'
            });
        });
    }
};

/**
 * [registerEventListener 注册事件监听]
 * @return {[type]} [description]
 */
tracker.prototype.registerEventListener = function() {
    var _this = this,

        /**
         * [_data 待发送数据对象]
         * @type {Object}
         */
        _data = {
            ai: _this.accountId,
            b: _this.browserType,
            vi: _this.userEntity.visitId,
            si: _this.userEntity.sessionId,
            ui: _this.userEntity.userId,
            tm: (new Date()).getTime(),
            pi: _this.pageEntity.pageId,
            ptm: _this.userEntity.visitTime,
            pt: _this.pageEntity.protocol,
            d: _this.pageEntity.host,
            p: _this.pageEntity.path,
            q: _this.pageEntity.query,
            e: [],
            ifr: _this.pageEntity.pageFrameType.type,
            ifru: _this.pageEntity.pageFrameType.type ? _this.pageEntity.pageFrameType.url : ''
        },

        /**
         * [_eventHandler 事件处理函数]
         * @return {[type]} [description]
         */
        _eventHandler = function(evt) {

            /**
             * [lastActionTime 设置最后一次访客行为事件]
             * @type {Number}
             */
            _this.lastActionTime = (new Date()).getTime();

            /**
             * [_element 获取事件元素]
             * @type {Object}
             */
            var _element = evt.target || evt.srcElement;

            /**
             * [若存在元素 且 元素属于忽略元素 且 元素有父元素节点，则向上级查找符合该条件的元素并设置为当前元素]
             */
            for (; _element && _this.pageEntity.ignoreNodeName[_element.tagName] && _element.parentNode;) {
                _element = _element.parentNode;
            }
            /**
             * [_path 获取元素路径]
             * @type {String}
             */
            var _path = _this.pageEntity.getElementPath(_element, true);

            /**
             * [如果是忽略元素，直接返回]
             */
            if (_path.ignore) {
                return;
            }

            /**
             * [_tagName 获取元素类型]
             * @type {String}
             */
            var _tagName = _element.tagName;

            /**
             * [若是点击事件，对一些情况不做处理]
             */
            if (evt.type === 'click') {

                /**
                 * [若当前元素存在于["TEXTAREA", "HTML", "BODY"]列表中，直接返回]
                 */
                if (_this.pageEntity.ignoreClickTagNames.indexOf(_tagName) !== -1) {
                    return;
                }

                /**
                 * [若当前元素为INPUT元素，且其type不存在于["button", "submit"]列表中，直接返回]
                 */
                if ((_tagName === 'INPUT') && (_this.pageEntity.buttonTypeNames.indexOf(_element.type)) === -1) {
                    return;
                }

                /**
                 * [若元素不存在于["A", "BUTTON", "INPUT", "IMG"]里列表中，且元素包含子元素的深度大于4，直接返回]
                 */
                if ((_this.pageEntity.clickTagNames.indexOf(_tagName) === -1) && (!_this.pageEntity.depthLimit(_element, 4))) {
                    return;
                }
            }

            /**
             * [_elementAttr 解析元素属性]
             * @type {Object}
             */
            var _elementAttr = _this.pageEntity.analyzeEventElementAttribute(evt.type, _element);

            /**
             * [x 设置元素路径]
             */
            _elementAttr.x = _path.xpath;

            /**
             * [设置元素数据]
             */
            if (_path.obj) {
                _elementAttr.obj = _path.obj;
            }

            /**
             * [设置元素位置]
             */
            if (_path.idx) {
                _elementAttr.idx = _path.idx;
            } else {
                _elementAttr.idx = _this.pageEntity.getElementIndex(_element, _elementAttr.x);
            }

            /**
             * [e 设置事件元素数据]
             * @type {Array}
             */
            _data.e = [_elementAttr];

            /**
             * [若存在pnodeContent属性]
             */
            if (_path.pnodeContent) {

                /**
                 * [组合数据]
                 * @type {Array}
                 */
                _data.e = _data.e.concat(_path.pnodeContent);
            }

            /**
             * [ui 因为有些页面有异步登录的业务，用户名会变化，这里实时获取用户名，不使用页面打开的时候获取的用户名]
             * @type {String}
             */
            _data.ui = _this.userEntity.getUserName();

            /**
             * [tm 设置发送数据时间]
             * @type {Timestamp}
             */
            _data.tm = (new Date()).getTime();

            /**
             * [_promise 发送点击数据]
             * @type {promise}
             */
            var _promise = _this.senderEntity.send(_data, 'click');

            /**
             * [发送数据成功回调]
             */
            _promise.then(function() {});

            /**
             * [发送数据失败回调]
             */
            _promise.catch(function() {});
        };

    /**
     * 绑定监测事件处理函数
     */
    _this.pageEntity.observeEventName.forEach(function(_eventName) {
        util.addEventListener(util.global.document, _eventName, _eventHandler);
    });

    /**
     * [如果是移动端]
     */
    // if (ua.parseUA().mobile) {}
};

/**
 * [registerDOMObserver 注册DOM监听]
 * @return {[type]} [description]
 */
tracker.prototype.registerDOMObserver = function() {
    var _this = this,

        /**
         * [_data 待发送数据对象]
         * @type {Object}
         */
        _data = {
            ai: _this.accountId,
            b: _this.browserType,
            vi: _this.userEntity.visitId,
            si: _this.userEntity.sessionId,
            ui: _this.userEntity.userId,
            pi: _this.pageEntity.pageId,
            tm: (new Date()).getTime(),
            ptm: _this.userEntity.visitTime,
            pt: _this.pageEntity.protocol,
            d: _this.pageEntity.host,
            p: _this.pageEntity.path,
            q: _this.pageEntity.query,
            ifr: _this.pageEntity.pageFrameType.type,
            ifru: _this.pageEntity.pageFrameType.type ? _this.pageEntity.pageFrameType.url : ''
        },

        /**
         * TreeMirrorClient对象实例
         */
        _treeMirrorClientEntity,

        /**
         * [_sendExposureData 发送曝光数据]
         * @return {[type]} [description]
         */
        _sendExposureData = function(nodes) {
            /**
             * 发送数据延迟对象
             */
            var _promise,

                /**
                 * [_tempNodes 待发送曝光数据列表]
                 * @type {Array}
                 */
                _tempNodes = [],

                /**
                 * [_nodes 若没有传递曝光元素列表参数，则默认为空数组]
                 * @type {Array}
                 */
                _nodes = nodes || [],

                /**
                 * [_exposureNodes 获取曝光数据列表]
                 * @type {Array}
                 */
                _exposureNodes = _this.pageEntity.getExposureNodes(_nodes);

            /**
             * [exposureNodes 将已有的曝光数据和新增曝光数据组合]
             * @type {Array}
             */
            _this.pageEntity.exposureNodes = _this.pageEntity.exposureNodes.concat(_exposureNodes);

            /**
             * [_exposureNodes 对组合后的数组就行去重，去重的原则是过滤掉链接地址相同，且路径相似度超过70%的元素]
             * @type {Array}
             */
            _this.pageEntity.exposureNodes = _this.pageEntity.uniqueExposureNodes(_this.pageEntity.exposureNodes, 0.7);

            /**
             * [将显示到当前屏幕中且未曝光的元素添加到已曝光数据集中，并设置已曝光状态属性]
             */
            _this.pageEntity.exposureNodes.forEach(function(node, index) {
                if ((!node.exposured) && util.visible(node.n)) {
                    node.exposured = true;
                    _tempNodes.push({
                        x: node.x,
                        v: node.v,
                        h: node.h,
                        idx: node.idx,
                    });
                }
            });

            /**
             * [若曝光数据为空，直接返回]
             */
            if (!_tempNodes.length) {
                return;
            }

            /**
             * [ui 因为有些页面有异步登录的业务，用户名会变化，这里实时获取用户名，不使用页面打开的时候获取的用户名]
             * @type {String}
             */
            _data.ui = _this.userEntity.getUserName();

            /**
             * [tm 设置发送数据时间]
             * @type {Timestamp}
             */
            _data.tm = (new Date()).getTime();

            /**
             * [_promise 创建发送数据延迟对象]
             * @type {Object}
             */
            _promise = _this.senderEntity.send(util.extend(true, {}, _data, {
                e: _tempNodes
            }), 'exposure');

            /**
             * [发送数据成功回调]
             */
            _promise.then(function() {});

            /**
             * [发送数据失败回调]
             */
            _promise.catch(function() {});
        };

    /**
     * [_treeMirrorClientEntity 创建TreeMirrorClient对象实例]
     * @type {TreeMirrorClient}
     */
    _treeMirrorClientEntity = new TreeMirrorClient(util.global.document.body, {

        /**
         * [initialize 初始化]
         * @return {[type]} [description]
         */
        initialize: function(trackerEntity) {
            return function(children) {

                /**
                 * 发送曝光数据
                 */
                util.global.setTimeout(function() {
                    _sendExposureData(children);
                }, 0);
            };
        }(_this),

        /**
         * [applyChanged 应用修改]
         * @return {[type]} [description]
         */
        applyChanged: function(trackerEntity) {
            return function(removed, moved, attributes, text) {

                /**
                 * 发送曝光数据
                 */
                util.global.setTimeout(function() {
                    _sendExposureData(moved);
                }, 0);
            };
        }(_this)
    });

    /**
     * [绑定窗口滚动事件，发送屏幕内的元素曝光数据]
     */
    util.addEventListener(util.global, 'scroll', util.throttle(function() {

        /**
         * 发送曝光数据
         */
        util.global.setTimeout(function() {
            _sendExposureData();
        }, 0);
    }, 500));

    /**
     * [绑定窗口缩放事件，发送屏幕内的元素曝光数据]
     */
    util.addEventListener(util.global, 'resize', util.throttle(function() {

        /**
         * 发送曝光数据
         */
        util.global.setTimeout(function() {
            _sendExposureData();
        }, 0);
    }, 500));
};

/**
 * [beforeunloadHandler beforeunload事件处理函数]
 */
tracker.prototype.beforeunloadHandler = function() {
    var _this = this,
        _data = {
            ai: _this.accountId,
            b: _this.browserType,
            ui: _this.userEntity.userId,
            vi: _this.userEntity.visitId,
            si: _this.userEntity.sessionId,
            tm: (new Date()).getTime(),
            ptm: _this.userEntity.visitTime,
            pi: _this.pageEntity.pageId,
            d: _this.pageEntity.host,
            p: _this.pageEntity.path,
            q: _this.pageEntity.query,
            ifr: _this.pageEntity.pageFrameType.type,
            ifru: _this.pageEntity.pageFrameType.type ? _this.pageEntity.pageFrameType.url : ''
        },
        _promise = _this.senderEntity.send(_data, 'close');

    /**
     * [发送数据成功回调]
     */
    _promise.then(function() {});

    /**
     * [发送数据失败回调]
     */
    _promise.catch(function() {});
};

/**
 * [setAccountId 设置站点编号]
 */
tracker.prototype.setAccountId = function(accountId) {
    var _this = this;
    _this.accountId = accountId;
};

module.exports = tracker;
