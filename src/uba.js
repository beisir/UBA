/**
 * [加载jQuery并开始初始化用户行为分析功能]
 */
(function(callback) {

    // /**
    // * [未加载jQuery]
    // */
    // if (!window.jQuery) {

    //     /**
    //      * [异步加载jQuery模块]
    //      */
    //     require.ensure([], function(require) {

    //         /**
    //          * 加载jQuery模块
    //          */
    //         require('./components/jquery');

    //         /**
    //          * 加载完成后执行回调
    //          */
    //         callback && callback();
    //     }, 'jquery');
    // }

    // /**
    //  * 已加载jQuery
    //  */
    // else {

    //     /**
    //      * 直接执行回调
    //      */
    //     callback && callback();
    // }

    /**
     * [因为电销CRM系统的部分页面脚本在引入 es5-shim 后在360浏览器兼容模式下出现各种兼容性问题，暂时屏蔽电销CRM域的数据采集]
     * 
     * 例如：http://dxcrm.inc.hc360.com/memberReg.htm?resCode=201408161853439668368&token=TEhENEU5QUhYR1pEVDkxTzFPMzg=&sourcetypeid=18&type=0   ]
     */
    // var _host = window.location.host;
    // if (_host === 'dxcrm.inc.hc360.com') {
    //     return;
    // }

    /**
     * [防止重复初始化]
     */
    if (window._hcuba_ && window._hcuba_.initialized) {
        return;
    }

    /**
     * 开始初始化用户行为分析
     */
    if (callback) {
        callback();
    }
})(function() {

    /**
     * es5-shim.js and es5-shim.min.js monkey-patch a JavaScript context to contain all EcmaScript 5 methods that can be faithfully emulated with a legacy JavaScript engine. Note: As es5-shim.js is designed to patch the native Javascript engine, it should be the library that is loaded first.
     * es5-sham.js and es5-sham.min.js monkey-patch other ES5 methods as closely as possible. For these methods, as closely as possible to ES5 is not very close. Many of these shams are intended only to allow code to be written to ES5 without causing run-time errors in older engines. In many cases, this means that these shams cause many ES5 methods to silently fail. Decide carefully whether this is what you want. Note: es5-sham.js requires es5-shim.js to be able to work properly.
     */
    require('es5-shim/es5-shim');
    require('es5-shim/es5-sham');

    /**
     * This file creates a global JSON object containing two methods: stringify and parse. This file provides the ES5 JSON capability to ES3 systems.
     * If a project might run on IE8 or earlier, then this file should be included.
     * This file does nothing on ES5 systems.
     */
    require('./libs/json2');

    /**
     * [uuid 导入UUID模块]
     * @type {Object}
     */
    var uuid = require('./libs/uuid');

    /**
     * [util 引入工具类模块]
     * @type {Object}
     */
    var util = require('./libs/util');

    /**
     * [不统计爬虫行为]
     */
    if (util.isBot()) {
        return;
    }

    /**
     * [tracker 导入用户行为跟踪对象模块]
     * @type {Object}
     */
    var tracker = require('./modules/tracker'),

        /**
         * [trackerEntity 生成用户行为跟踪对象实例]
         * @type {tracker}
         */
        trackerEntity = new tracker(),

        /**
         * [trackerActions 用户行为跟踪对象行为列表，此处为该对象设置站点编号]
         * @type {[type]}
         */
        trackerActions = util.global._hcuba_ || [];

    /**
     * [排除已初始化或未设置 AccountID 的情况]
     */
    if ((Object.prototype.toString.call(trackerActions) != '[object Array]') || (!trackerActions.length)) {
        return;
    }

    /**
     * [_uba 更新全局对象]
     * @type {Object}
     */
    util.global._hcuba_ = {
        initialized: !0
    };

    /**
     * [执行用户行为跟踪对象行为列表]
     */
    trackerActions.forEach(function(action) {
        var actionName = action.shift();
        trackerEntity[actionName].apply(trackerEntity, action);
    });

    /**
     * 初始化用户行为跟踪对象
     */
    trackerEntity.init();
});