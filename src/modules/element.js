var util = require('../libs/util');

/**
 * [element 元素对象]
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
function element(node) {
    var _this = this,

        /**
         * [_ignoreClassNames 这里过滤掉 uba-*** 的样式名是为了在做圈选操作的时候，剔除掉圈选操作添加的样式类名]
         * @type {RegExp}
         */
        _ignoreClassNames = /(^| )(clear|clearfix|active|hover|enabled|hidden|display|focus|disabled|uba-)[^\. ]*/g;

    /**
     * [node 保存元素引用]
     * @type {Object}
     */
    _this.node = node;

    /**
     * [name 元素类型]
     * @type {String}
     */
    _this.name = node.tagName.toLowerCase() || '';

    /**
     * [id 元素ID]
     * @type {String}
     */
    if (util.hasAttribute(node, 'id') && (node.getAttribute('id').match(/^[0-9]/) != null)) {
        _this.id = node.getAttribute('id');
    }

    /**
     * [ignore 是否忽略]
     * @type {Boolean}
     */
    _this.ignore = util.hasAttribute(node, 'data-uba-ignore');

    /**
     * [href 链接地址]
     * @type {String}
     */
    if (util.hasAttribute(node, 'href')) {
        _this.href = node.getAttribute('href');
    }

    /**
     * [样式名]
     */
    var _class = node.className || node.getAttribute('class');
    if (_class) {
        _this.class = util.trim(_class).replace(_ignoreClassNames, '').split(/\s+/).sort();
    }

    /**
     * [obj 元素数据]
     * @type {String}
     */
    if (util.hasAttribute(node, 'data-uba-obj')) {
        _this.obj = node.getAttribute('data-uba-obj');
    }

    /**
     * [idx 元素位置]
     * @type {String}
     */
    if (util.hasAttribute(node, 'data-uba-idx')) {
        _this.idx = node.getAttribute('data-uba-idx');
    }
}

/**
 * [path description]
 * @return {[type]} [description]
 */
element.prototype.path = function() {
    var _this = this,
        _path = ['/', _this.name];

    /**
     * 拼接元素ID
     */
    _this.id && _path.push('#' + _this.id);

    /**
     * [拼接元素样式]
     */
    if (_this.class && _this.class.length) {
        for (var i = 0, j = _this.class.length; i < j; i++) {
            _path.push('.' + _this.class[i]);
        }
    }

    /**
     * 返回元素路径
     */
    return _path.join('');
};

/**
 * [hasObj 是否含有数据]
 * @return {Boolean} [description]
 */
element.prototype.hasObj = function() {
    return this.obj != null;
};

/**
 * [hasIdx 是否含有位置]
 * @return {Boolean} [description]
 */
element.prototype.hasIdx = function() {
    return this.idx != null;
};

/**
 * [isContainer 是否包裹元素]
 * @return {Boolean} [description]
 */
element.prototype.isContainer = function() {
    return util.hasAttribute(this.node, 'data-uba-container');
};

module.exports = element;
