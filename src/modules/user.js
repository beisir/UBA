var util = require('../libs/util'),
    uuid = require('../libs/uuid'),
    cookie = require('js-cookie');

/**
 * [user 访客数据对象]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function user(options) {
    var _this = this;

    /**
     * 扩展实例属性
     */
    util.extend(true, _this, {

            /**
             * [userId 已登录用户名]
             * @type {String}
             */
            userId: null,

            /**
             * [visitId 访客编号，包含已登录、未登录用户]
             * @type {String}
             */
            visitId: null,

            /**
             * [sessionId 访客会话编号]
             * @type {String}
             */
            sessionId: null,

            /**
             * [firstVisitTime 访客首次访问时间]
             * @type {String}
             */
            firstVisitTime: null,

            /**
             * [screenHeight 访客屏幕分辨率高度]
             * @type {Number}
             */
            screenHeight: util.global.screen.height,

            /**
             * [screenWidth 访客屏幕分辨率宽度]
             * @type {Number}
             */
            screenWidth: util.global.screen.width,

            /**
             * [browserLanguage 访客浏览器语言]
             * @type {String}
             */
            browserLanguage: (util.global.navigator.language || util.global.navigator.browserLanguage || '').toLowerCase(),

            /**
             * [visitTime 访客访问时间]
             * @type {NUmber}
             */
            visitTime: (new Date()).getTime(),

            /**
             * [cookieDomain cookie所在域列表]
             * @return {Array} [description]
             */
            cookieDomain: function() {
                try {
                    var _hostname = util.global.location.hostname.split('.');
                    return [
                        '.' + _hostname.slice(-2).join('.'),
                        '.' + _hostname.slice(-3).join('.')
                    ];
                } catch (ex) {
                    return [util.global.location.hostname];
                }
            }(),

            /**
             * [cookieMapping cookie键值对映射关系]
             * @type {Object}
             */
            cookieMapping: {
                userid: 'lastloginusers',
                visitid: 'hc360visitid',
                sessionid: 'hc360sessionid',
                firstvisittime: 'hc360firstvisittime'
            }
        },
        options);

    /**
     * 初始化访客数据对象属性
     */
    user.prototype.init.call(_this);
}

/**
 * [init 初始化访客数据对象]
 */
user.prototype.init = function() {
    var _this = this,

        /**
         * [_validateUUID 验证UUID]
         * @param  {[type]} uuid [description]
         * @return {[type]}      [description]
         */
        _validateUUID = function(uuid) {
            return (!!uuid) && /^[0-9A-Z]{32,32}$/.test(uuid);
        },

        /**
         * [_validateTimestamp 验证时间戳]
         * @param  {[type]} timestamp [description]
         * @return {[type]}           [description]
         */
        _validateTimestamp = function(timestamp) {
            return (!!timestamp) && /^\d+$/.test(timestamp);
        };

    /**
     * [userId 获取登录用户名，登录过多个用户时，获取最后一次登录的用户名]
     */
    var _userIds = (cookie.get(_this.cookieMapping.userid) || '').split(',');
    _this.userId = _userIds.pop();

    /**
     * [visitId 获取或初始化访客编号]
     * @type {String}
     */
    _this.visitId = cookie.get(_this.cookieMapping.visitid);
    if (!_validateUUID(_this.visitId)) {
        _this.visitId = (new uuid()).id;
        _this.setCookie(_this.cookieMapping.visitid, _this.visitId, {
            expires: 365 * 10 //过期时间10年
        });
    }

    /**
     * [sessionId 获取或设置访客会话编号]
     * @type {String}
     */
    _this.sessionId = cookie.get(_this.cookieMapping.sessionid);
    if (!_validateUUID(_this.sessionId)) {
        _this.sessionId = (new uuid()).id;
        _this.setCookie(_this.cookieMapping.sessionid, _this.sessionId, {}); // 无过期时间表示随会话结束
    }

    /**
     * [firstVisitTime 获取或设置访客首次访问时间]
     * @type {String}
     */
    _this.firstVisitTime = cookie.get(_this.cookieMapping.firstvisittime) || '';
    if (!_validateTimestamp(_this.firstVisitTime)) {
        _this.firstVisitTime = (new Date()).getTime();
        _this.setCookie(_this.cookieMapping.firstvisittime, _this.firstVisitTime, {
            expires: 90 //过期时间90天
        });
    }
};

/**
 * [getUserName 实时获取当前用户名]
 * @return {String} [用户名]
 */
user.prototype.getUserName = function() {
    var _this = this;

    /**
     * [userId 获取登录用户名，登录过多个用户时，获取最后一次登录的用户名]
     */
    var _userIds = (cookie.get(_this.cookieMapping.userid) || '').split(',');
    _this.userId = _userIds.pop();

    /**
     * 返回当前用户名
     */
    return _this.userId;
};

/**
 * [setCookie 写入多个域名的Cookie]
 * @param {String} key        [key]
 * @param {String} value      [value]
 * @param {Object} attributes [attributes]
 */
user.prototype.setCookie = function(key, value, attributes) {
    var _this = this;

    /**
     * [写入多个域名Cookie]
     */
    _this.cookieDomain.forEach(function(domain) {
        cookie.set(key, value, util.extend(attributes, {
            domain: domain
        }));
    });
};


module.exports = user;