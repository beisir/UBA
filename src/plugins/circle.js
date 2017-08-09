var util = require('../libs/util'),
    circleDialog = require('./circle-dialog');

/**
 * [circle 圈选业务对象实例]
 * @param  {[type]} trackr [description]
 * @return {[type]}        [description]
 */
function circle(trackerEntity) {
    var _this = this;

    /**
     * [扩展对象属性]
     */
    util.extend(true, _this, {

        /**
         * [trackerEntity 保留trackerEntity对象引用]
         * @type {Object}
         */
        trackerEntity: trackerEntity,

        /**
         * [circleMode 圈选模式]
         * @type {String}
         */
        circleMode: 'browse-mode',

        /**
         * [classNames 样式类名]
         * @type {Object}
         */
        classNames: {
            ubaConsole: 'uba-workbench',
            hoverClass: 'uba-circle-hovered',
            clickedClass: 'uba-circle-clicked',
            coverClass: 'uba-circle-cover'
        },

        /**
         * 初始化弹出框对象实例
         */
        circleDialogEntity: new circleDialog()

    });

    /**
     * [bodyMouseOverHandler 锁定部分函数作用域为当前对象]
     * @type {[type]}
     */
    _this.bodyMouseOverHandler = circle.prototype.bodyMouseOverHandler.bind(_this);
    _this.bodyMouseOutHandler = circle.prototype.bodyMouseOutHandler.bind(_this);
    _this.elementClickHandler = circle.prototype.elementClickHandler.bind(_this);

    /**
     * [监听弹出框关闭事件]
     */
    _this.circleDialogEntity.addEventListener('onClose', function() {
        
        /**
         * 移除点击元素样式
         */
        _this.clickOff();
    });
}

/**
 * [switchToBrowseMode 切换到浏览模式]
 * @return {[type]} [description]
 */
circle.prototype.switchToBrowseMode = function() {
    var _this = this;

    // console.log('browse');

    /**
     * 移除绑定事件
     */
    _this.unbindEvents();

    /**
     * 移除根元素样式
     */
    _this.removeClass(util.global.document.body, _this.classNames.ubaConsole);

    /**
     * 移除点击元素样式
     */
    _this.clickOff();

    /**
     * 隐藏弹出框
     */
    _this.circleDialogEntity.hide();
};

/**
 * [switchToCircleMode 切换到圈选模式]
 * @return {[type]} [description]
 */
circle.prototype.switchToCircleMode = function() {
    var _this = this;

    // console.log('circle');

    /**
     * 绑定事件
     */
    _this.bindEvents();

    /**
     * 添加根元素样式
     */
    _this.addClass(util.global.document.body, _this.classNames.ubaConsole);
};

/**
 * [switchToHeatMode 切换到热图模式]
 * @return {[type]} [description]
 */
circle.prototype.switchToHeatMode = function() {
    var _this = this;

    // console.log('heat');

    /**
     * 移除绑定事件
     */
    _this.unbindEvents();

    /**
     * 添加根元素样式
     */
    _this.removeClass(util.global.document.body, _this.classNames.ubaConsole);

    /**
     * 移除点击元素样式
     */
    _this.clickOff();

    /**
     * 隐藏弹出框
     */
    _this.circleDialogEntity.hide();
};

/**
 * [bindEvents 绑定事件]
 * @return {[type]} [description]
 */
circle.prototype.bindEvents = function() {
    var _this = this,
        _body = util.global.document.body;
    util.bind(_body, 'mouseover', _this.bodyMouseOverHandler, false);
    util.bind(_body, 'mouseout', _this.bodyMouseOutHandler, false);
    util.bind(_body, 'click', _this.elementClickHandler, false);
    util.bind(_body, 'tap', _this.elementClickHandler, false);
    util.bind(_body, 'touch', _this.elementClickHandler, false);
};

/**
 * [unbindEvents 解除绑定事件]
 * @return {[type]} [description]
 */
circle.prototype.unbindEvents = function() {
    var _this = this,
        _body = util.global.document.body;
    util.removeEventListener(_body, 'mouseover', _this.bodyMouseOverHandler, false);
    util.removeEventListener(_body, 'mouseout', _this.bodyMouseOutHandler, false);
    util.removeEventListener(_body, 'click', _this.elementClickHandler, false);
    util.removeEventListener(_body, 'tap', _this.elementClickHandler, false);
    util.removeEventListener(_body, 'touch', _this.elementClickHandler, false);
};

/**
 * [bodyMouseOverHandler 绑定文档鼠标悬浮事件]
 * @return {[type]} [description]
 */
circle.prototype.bodyMouseOverHandler = function(event) {
    var _this = this,
        _evt = event,
        _target,
        _tagName,
        _plainTextTagNames = ['I', 'SPAN'],
        _clickableTagNames = ['A', 'BUTTON'],
        _ignoreTagNames = ["BODY", "HR", "BR", "CANVAS"];

    /**
     * 取消事件默认行为，阻止事件冒泡
     */
    _evt.preventDefault();
    _evt.stopImmediatePropagation();
    _evt.stopPropagation();

    /**
     * [_target 获取事件元素及元素类型]
     * @type {[type]}
     */
    _target = _evt.target || _evt.srcElement;
    _tagName = _target.tagName;

    /**
     * [忽略指定类型元素]
     */
    if (_ignoreTagNames.indexOf(_tagName) !== -1) {
        return;
    }

    /**
     * [忽略鼠标点击弹出框]
     */
    if (_this.closest(_target, function(element) {
            return element.id === 'uba-circle-container';
        })) {
        return;
    }

    /**
     * [若当前元素类型为 ['I', 'SPAN'] ,且其父级元素类型为 ['A', 'BUTTON'] ,则将当前元素设置为其父级元素]
     */
    if ((_plainTextTagNames.indexOf(_tagName) !== -1) && _target.parentNode && (_clickableTagNames.indexOf(_target.parentNode.tagName) !== -1)) {
        _target = _target.parentNode;
    }

    /**
     * 设置元素鼠标悬浮样式
     */
    _this.hoverIn(_target);
};

/**
 * [bodyMouseOutHandler 绑定文档鼠标离开事件]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
circle.prototype.bodyMouseOutHandler = function(event) {
    var _this = this,
        _evt = event,
        _target;

    /**
     * 取消事件默认行为，阻止事件冒泡
     */
    _evt.preventDefault();
    _evt.stopImmediatePropagation();
    _evt.stopPropagation();

    /**
     * [_target 获取事件元素及元素类型]
     * @type {[type]}
     */
    _target = _evt.target || _evt.srcElement;

    /**
     * 取消元素鼠标悬浮样式
     */
    _this.hoverOut(_target);
};

/**
 * [elementClickHandler 绑定元素鼠标点击事件]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
circle.prototype.elementClickHandler = function(event) {
    var _this = this,
        _evt = event,
        _target,
        _tagName,
        _plainTextTagNames = ['I', 'SPAN'],
        _clickableTagNames = ['A', 'BUTTON'],
        _ignoreTagNames = ["BODY", "HR", "BR", "CANVAS"],
        _targetData;

    /**
     * 取消事件默认行为，阻止事件冒泡
     */
    _evt.preventDefault();
    _evt.stopImmediatePropagation();
    _evt.stopPropagation();

    /**
     * [_target 获取事件元素及元素类型]
     * @type {[type]}
     */
    _target = _evt.target || _evt.srcElement;
    _tagName = _target.tagName;

    /**
     * [忽略指定类型元素]
     */
    if (_ignoreTagNames.indexOf(_tagName) !== -1) {
        return;
    }

    /**
     * [忽略鼠标点击弹出框]
     */
    if (_this.closest(_target, function(element) {
            return element.id === 'uba-circle-container';
        })) {
        return;
    }

    /**
     * [若当前元素类型为 ['I', 'SPAN'] ,且其父级元素类型为 ['A', 'BUTTON'] ,则将当前元素设置为其父级元素]
     */
    if ((_plainTextTagNames.indexOf(_tagName) !== -1) && _target.parentNode && (_clickableTagNames.indexOf(_target.parentNode.tagName) !== -1)) {
        _target = _target.parentNode;
    }

    /**
     * 设置元素鼠标点击样式
     */
    _this.clickOn(_target);

    /**
     * [_targetData 获取元素属性]
     * @type {[type]}
     */
    _targetData = _this.trackerEntity.pageEntity.getElementPath(_target, true);

    /**
     * 展示弹出框
     */
    _this.circleDialogEntity.render({
        element: _target,
        xpath: _targetData.xpath,
        text: _this.trackerEntity.pageEntity.getElementContent(_target),
        index: _targetData.idx || _this.trackerEntity.pageEntity.getElementIndex(_target, _targetData.xpath),
        event: _evt
    });
};

/**
 * [clickOn 设置元素鼠标点击样式]
 * @param {[type]} element [description]
 */
circle.prototype.clickOn = function(element) {
    var _this = this;

    /**
     * 清除已被点击的元素样式
     */
    _this.clickOff();

    /**
     * [若当前元素没有鼠标悬浮样式，且该元素可圈选]
     */
    if ((!_this.hasClass(element, _this.classNames.clickedClass)) && _this.circleable(element)) {
        _this.addClass(element, _this.classNames.clickedClass);
    }

    /**
     * 创建元素覆盖层
     */
    _this.createElementCover(element);
};

/**
 * [clickOff 取消元素鼠标点击样式]
 * @return {[type]}         [description]
 */
circle.prototype.clickOff = function() {
    var _this = this,
        _elementCovers = util.global.document.querySelectorAll('.' + _this.classNames.coverClass);

    /**
     * 取消元素点击样式
     */
    _this.removeClass(_this.classNames.clickedClass);

    /**
     * [删除所有覆盖元素]
     * @param  {[type]} _elementCovers.length [description]
     * @return {[type]}                       [description]
     */
    for (var i = 0; i < _elementCovers.length; i++) {
        _elementCovers[i].remove();
    }
};

/**
 * [hoverIn 设置元素鼠标悬浮样式]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.hoverIn = function(element) {
    var _this = this;

    /**
     * [若当前元素没有鼠标悬浮样式，且该元素可圈选]
     */
    if ((!_this.hasClass(element, _this.classNames.hoverClass)) && _this.circleable(element)) {
        _this.addClass(element, _this.classNames.hoverClass);
    }
};

/**
 * [hoverOut 取消元素鼠标悬浮样式]
 * @return {[type]} [description]
 */
circle.prototype.hoverOut = function(element) {
    var _this = this;

    /**
     * 若当前元素有鼠标悬浮样式，删除元素鼠标悬浮样式
     */
    if (_this.hasClass(element, _this.classNames.hoverClass)) {
        _this.removeClass(element, _this.classNames.hoverClass);
    }
};

/**
 * [circleable 指定元素是否可圈选]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.circleable = function(element) {
    var _this = this,
        _ret = false,
        _tagNames = ["SELECT", "A", "BUTTON", "INPUT", "IMG"],
        _text;

    /**
     * [忽略元素]
     */
    if (element.hasAttribute('data-uba-ignore')) {
        return false;
    }

    /**
     * [忽略密码输入框]
     */
    if ((element.tagName === 'INPUT') && (element.type === 'password')) {
        return false;
    }

    /**
     * [若为指定类型元素，确定可以圈选]
     */
    if (_tagNames.indexOf(element.tagName) !== -1) {
        return true;
    }

    /**
     * [若当前元素是叶子节点，且元素内容不为空，且元素在显示状态]
     */
    if (_this.trackerEntity.pageEntity.isLeafNode(element) && _this.trackerEntity.pageEntity.getElementText(element).trim().length) {
        return true;
    }

    /**
     * [元素有背景图且元素深度小于4]
     */
    if (util.css(element, 'background-image') && _this.trackerEntity.pageEntity.depthLimit(element, 4)) {
        return true;
    }

    return false;
};

/**
 * [hasClass 指定元素是否有指定样式类名]
 * @param  {[type]}  element   [description]
 * @param  {[type]}  className [description]
 * @return {Boolean}           [description]
 */
circle.prototype.hasClass = function(element, className) {
    var _this = this,
        _ret = false;
    try {
        _ret = element.classList.contains(className);
    } catch (ex) {}
    return _ret;
};

/**
 * [addClass 指定元素添加指定样式类名]
 * @param  {[type]}  element   [description]
 * @param  {[type]}  className [description]
 * @return {Boolean}           [description]
 */
circle.prototype.addClass = function(element, className) {
    var _this = this;
    try {
        _ret = element.classList.add(className);
    } catch (ex) {}
};

/**
 * [removeClass 指定元素添加指定样式类名]
 * @param  {[type]}  element   [description]
 * @param  {[type]}  className [description]
 * @return {Boolean}           [description]
 */
circle.prototype.removeClass = function(element, className) {
    var _this = this;
    try {
        _ret = element.classList.remove(className);
    } catch (ex) {}
};

/**
 * [css 获取元素样式]
 * @param  {[type]} element   [description]
 * @param  {[type]} styleName [description]
 * @return {[type]}           [description]
 */
circle.prototype.css = function(element, styleName) {
    var _this = this,
        _style = window.getComputedStyle(element, null),
        _formatStyleName = function(name) {
            return name.replace(/-+(.)?/g, function(t, e) {
                return e ? e.toUpperCase() : "";
            });
        };
    return element.style[_formatStyleName(styleName)] || _style.getPropertyValue(styleName);
};

/**
 * [width description]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.width = function(element) {
    var _this = this;

    if (element === element.window) {
        return element.innerWidth;
    } else if (element.nodeType === 9) {
        return element.documentElement.scrollWidth
    } else {
        return Math.round(element.getBoundingClientRect().width);
    }
};

/**
 * [height description]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.height = function(element) {
    var _this = this;

    if (element === element.window) {
        return element.innerHeight;
    } else if (element.nodeType === 9) {
        return element.documentElement.scrollHeight
    } else {
        return Math.round(element.getBoundingClientRect().height);
    }
};

/**
 * [closest description]
 * @return {[type]} [description]
 */
circle.prototype.closest = function(element, callback) {
    var _this = this;
    for (; element;) {
        if (callback(element)) {
            return element;
        }
        element = element.parentNode;
    }
    return null;
};

/**
 * [offset description]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.offset = function(element) {
    var _this = this,
        _boundingClientRect = element.getBoundingClientRect(),
        _document,
        _window,
        _documentElement;

    if (_boundingClientRect.width || _boundingClientRect.height || element.getClientRects().length) {
        _document = element.ownerDocument;
        _documentElement = _document.documentElement;

        if (element === element.window) {
            _window = element;
        } else if (element.nodeType === 9) {
            _window = element.defaultView;
        } else {
            _window = window;
        }

        return {
            top: _boundingClientRect.top + _window.pageYOffset - _documentElement.clientTop,
            left: _boundingClientRect.left + _window.pageXOffset - _documentElement.clientLeft
        };
    }
};

/**
 * [offsetParent 获取最近的父级定位元素]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.offsetParent = function(element) {
    var _this = this,
        _offsetParent,
        _isRootNodeRegExp = /^(?:body|html)$/i;
    for (_offsetParent = element.offsetParent || util.global.document.body; _offsetParent && (!_isRootNodeRegExp.test(_offsetParent.nodeName)) && (_this.css(_offsetParent, 'position') === 'static');) {
        _offsetParent = _offsetParent.offsetParent;
    }
    return _offsetParent;
};

/**
 * [position 获取元素位置数据]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.position = function(element) {
    var _this = this,
        _ret,
        _offsetParent = _this.offsetParent(element),
        _offset = _this.offset(element),
        _isRootNodeRegExp = /^(?:body|html)$/i;

    if (!_offset) {
        return null;
    }

    /**
     * [是否根元素]
     */
    if (_isRootNodeRegExp.test(_offsetParent.nodeName)) {
        _ret = {
            top: 0,
            left: 0
        };
    } else {
        _ret = _this.offset(_offsetParent);
    }

    /**
     * 加上边框宽度
     */
    _ret.top += parseFloat(_this.css(_offsetParent, "border-top-width") || 0),
        _ret.left += parseFloat(_this.css(_offsetParent, "border-left-width") || 0);

    return {
        top: _offset.top - _ret.top,
        left: _offset.left - _ret.left
    };
};

/**
 * [createElementCover 创建元素覆盖层]
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
circle.prototype.createElementCover = function(element) {
    var _this = this,
        _parent = element.parentNode,
        _position = _this.position(element),
        _elementCover = document.createElement('div'),
        _tableTagNames = ["TABLE", "TR", "TD", "TH"];

    /**
     * [className 设置遮罩层样式]
     * @type {[type]}
     */
    _elementCover.className = _this.classNames.coverClass,
        _elementCover.style.width = _this.width(element) + 'px',
        _elementCover.style.height = _this.height(element) + 'px',
        _elementCover.style.left = _position.left + 'px',
        _elementCover.style.top = _position.top + 'px',
        _elementCover.style.position = 'absolute';

    /**
     * [父元素不能为表格元素]
     */
    for (; _parent && (_tableTagNames.indexOf(_parent.tagName) !== -1);) {
        _parent = _parent.parentNode;
    }

    /**
     * [添加元素]
     * @param  {[type]} _parent [description]
     * @return {[type]}         [description]
     */
    if (_parent) {
        _parent.appendChild(_elementCover);
    }
};

module.exports = circle;
