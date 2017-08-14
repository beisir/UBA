var _htmlArray = ['<div id="uba-circle-container" class="uba-content-section uba-collapsed">',
    '    <div id="uba-circle-header" class="uba-circle-header">',
    '        <div style="float:left">',
    '            <div class="tips">',
    '                <i>?</i>',
    '                <span>',
    '                <span>圈选功能使用可视化方式采集数据.</span>',
    '                <span>页面：表示统计这个元素在某个页面或者页面组的数据，在下拉列表中选择已定义的页面。</span>',
    '                <span>圈选：根据业务需要，选择你希望统计的数据。</span>',
    '                <span>图中显示过去7天及今天的浏览量、点击量。</span>',
    '                <span>点击保存后即可在单图、漏斗、留存等分析模块中使用。</span>',
    '                <span>了解更多，请参考 <a href="javascript:;">帮助文档。</a></span>',
    '                </span>',
    '            </div>',
    '            <div class="uba-circle-header-tips-board"></div>',
    '        </div>',
    // '        <p><span class="tag-scope"></span></p>',
    '    </div>',
    '    <div class="uba-circle-form">',
    '        <div class="uba-tag-info">',
    '            <form class="uba-form-horizontal">',
    '                <div id="uba-row-title" class="uba-form-group">',
    '                    <label for="tagTitle" class="uba-col-2 uba-control-label">名称</label>',
    '                    <div class="uba-col-10">',
    '                        <input id="uba-tag-title" type="text" class="uba-form-control with-placeholder" readonly />',
    '                        <span class="error-text"></span>',
    '                    </div>',
    '                </div>',
    // '                <div class="uba-form-group" id="uba-form-group-page-select">',
    // '                    <label for="tagPage" class="uba-col-2 uba-control-label">页面</label>',
    // '                    <div class="uba-col-10 uba-select-control">',
    // '                        <span class="current-page"></span>',
    // '                        <div id="page-tag-options" class="with-toggle">',
    // '                        </div>',
    // '                    </div>',
    // '                </div>',
    '                <div class="uba-form-group" id="uba-form-group-filter-combination">',
    '                    <label for="filterContent" class="uba-col-2 uba-control-label">圈选</label>',
    '                    <div class="uba-col-10">',
    '                        <div class="filter-container">',
    '                            <div class="button-group" id="filter-button-group">',
    '                                <div class="filter-button-item uba-selected" data-val="1">当前元素</div>',
    '                                <div class="filter-button-item" data-val="2">当前位置</div>',
    '                                <div class="filter-button-item" data-val="3">同类元素</div>',
    // '                                <div class="filter-button-item selected" data-val="4">自定义</div>',
    '                            </div>',
    // '                            <div class="filter-detail">',
    // '                                <ul></ul>',
    // '                            </div>',
    '                        </div>',
    '                    </div>',
    '                </div>',
    '            </form>',
    '            <div class="uba-chart-container">',
    '               <div id="uba-chart"></div>',
    '            </div>',
    '        </div>',
    '    </div>',
    '    <div class="uba-circle-footer">',
    '        <div id="uba-circle-form-buttons">',
    '            <div style="float:left">',
    '                <button id="uba-save">另存为</button>',
    '            </div>',
    '            <div style="float:right">',
    '                <button id="uba-cancel">取消</button>',
    '            </div>',
    '        </div>',
    '    </div>',
    '</div>'
];

var util = require('../libs/util'),
    promise = require('es6-promise'),
    echarts = require('../components/echarts');
// echarts = require('../components/echarts.simple.min');

/**
 * [circleDialog 圈选弹出框对象]
 * @return {[type]} [description]
 */
function circleDialog(options) {
    var _this = this;

    /**
     * 扩展实例属性
     */
    util.extend(true, _this, {

        /**
         * [wrap 弹出框包裹元素]
         * @type {[type]}
         */
        wrap: null,

        /**
         * [target 弹出框目标元素]
         * @type {[type]}
         */
        target: null,

        /**
         * [xpath 弹出框目标元素路径]
         * @type {String}
         */
        xpath: '',

        /**
         * [text 弹出框目标元素文本]
         * @type {String}
         */
        text: '',

        /**
         * [index 弹出框目标元素位置索引]
         * @type {[type]}
         */
        index: null,

        /**
         * [currentCircleOption 当前选中的圈选设置对应的值]
         * @type {String}
         */
        currentCircleOption: 1,

        /**
         * [sericeURL 获取图标数据服务地址]
         * @type {String}
         */
        sericeURL: 'http://log.org.hc360.com/logrecordservice/sll',

        /**
         * [chartEntity 图表对象实例]
         * @type {[type]}
         */
        chartEntity: null,

        /**
         * [chartOptions 图表基础配置]
         * @type {Object}
         */
        chartOptions: {
            title: {
                text: '',
                subtext: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value}'
                },
                splitNumber: 2
            }
        },

        /**
         * [circleEntity 圈选对象实例]
         * @type {[type]}
         */
        circleEntity: null,

        /**
         * [listener 自定义事件及其处理函数保存对象]
         * @type {Object}
         */
        listener: {}
    }, options);

    /**
     * 创建DOM结构
     */
    _this.buildDOM();

    /**
     * [mousedownHandler 锁定函数作用域]
     * @type {[type]}
     */
    _this.mousedownHandler = circleDialog.prototype.mousedownHandler.bind(_this);
    _this.mouseupHandler = circleDialog.prototype.mouseupHandler.bind(_this);
    _this.mousemoveHandler = circleDialog.prototype.mousemoveHandler.bind(_this);
    _this.switchCircleOptionHandler = circleDialog.prototype.switchCircleOptionHandler.bind(_this);

    /**
     * 绑定鼠标事件
     */
    _this.bindEvents();
}

/**
 * [buildDOM 创建DOM结构]
 * @return {[type]} [description]
 */
circleDialog.prototype.buildDOM = function() {
    var _this = this,
        _wrap = util.global.document.createElement('div');

    /**
     * [innerHTML 填充弹出框HTML]
     * @type {[type]}
     */
    _wrap.innerHTML = _htmlArray.join('');

    /**
     * [wrap description]
     * @type {[type]}
     */
    _this.wrap = _wrap.childNodes[0];

    /**
     * 将弹出框添加到主文档
     */
    util.global.document.body.appendChild(_this.wrap);

    /**
     * [display 默认隐藏]
     * @type {String}
     */
    _this.wrap.style.display = 'none';

    /**
     * [wrapHeader 扩展当前对象的元素属性]
     * @type {[type]}
     */
    util.extend(true, _this, {

        /**
         * [header 获取头部元素]
         * @type {[type]}
         */
        header: util.global.document.getElementById('uba-circle-header'),

        /**
         * [close 获取关闭按钮]
         * @type {[type]}
         */
        btnClose: util.global.document.getElementById('uba-cancel'),

        /**
         * [save 获取另存为按钮]
         * @type {[type]}
         */
        btnSave: util.global.document.getElementById('uba-save'),

        /**
         * [txtTitle 标题输入框]
         * @type {[type]}
         */
        txtTitle: util.global.document.getElementById('uba-tag-title'),

        /**
         * [filterButtonGroup 圈选选项按钮包裹元素]
         * @type {[type]}
         */
        filterButtonGroup: util.global.document.getElementById('filter-button-group'),

        /**
         * [chartEntity 初始化图表对象实例]
         * @type {[type]}
         */
        chartEntity: echarts.init(util.global.document.getElementById('uba-chart'), null, {
            width: 275,
            height: 175
        })
    });
};

/**
 * [render description]
 * @param  {[type]} element [description]
 * @return {[type]}        [description]
 */
circleDialog.prototype.render = function(options) {
    var _this = this,
        _event = options.event,
        _promise,
        _data;

    /**
     * [设置对象属性]
     * @type {[type]}
     */
    _this.target = options.element,
        _this.xpath = options.xpath,
        _this.text = options.text,
        _this.index = options.index,
        _this.left = _event.pageX,
        _this.top = _event.pageY,
        _this.currentCircleOption = 1;

    /**
     * 切换圈选选项
     */
    _this.switchCircleOption();

    /**
     * 更新圈选弹出框内容
     */
    _this.update();
};

/**
 * [update 更新圈选弹出框内容]
 * @return {[type]} [description]
 */
circleDialog.prototype.update = function() {
    var _this = this,
        _option;

    /**
     * [value 更新元素标题文本框内容]
     * @type {[type]}
     */
    _this.txtTitle.value = _this.text;

    /**
     * [_promise 获取数据延迟对象]
     * @type {[type]}
     */
    _promise = _this.getDataPromise({
        xpath: _this.xpath,
        text: _this.text,
        idx: _this.index,
        opt: _this.currentCircleOption
    });

    /**
     * 显示弹出框
     */
    _this.show();

    /**
     * [top 定位弹出框位置]
     * @type {[type]}
     */
    _this.wrap.style.top = (_this.top) + 'px';
    _this.wrap.style.left = (_this.left) + 'px';

    /**
     * [获取到数据后显示弹出框，更新图表]
     */
    _promise.then(function(xhr) {

        /**
         * 将数据转为JSON
         */
        try {
            _data = JSON.parse(xhr.responseText || '{}')
        } catch (e) {}

        /**
         * [_data 模拟数据]
         * @type {[type]}
         */
        // _data = JSON.parse('{"data":{"time":["0603","0602","0605","0604"],"datalist":["1003","1001","1005","1004"]}}').data;

        /**
         * [_option 更新配置]
         * @type {[type]}
         */
        _option = util.extend(true, _this.chartOptions, {
            xAxis: {
                data: _data.time || []
            },
            series: [{
                name: '点击数',
                type: 'line',
                data: _data.datalist || []
            }]
        });

        /**
         * 使用新数据渲染图表
         */
        _this.chartEntity.setOption(_option);
    });
};

/**
 * [getDataPromise 获取数据延迟对象]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
circleDialog.prototype.getDataPromise = function(data) {
    var _this = this,
        _xhr,
        _data = data,
        _promise;

    /**
     * [判断数据长度是否为0]
     */
    if (!data) {
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
         * [打开链接]
         */
        _xhr.open('POST', _this.sericeURL, true);
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
 * [bindEvents 绑定拖动事件]
 * @return {[type]} [description]
 */
circleDialog.prototype.bindEvents = function() {
    var _this = this;
    util.bind(_this.header, 'mousedown', _this.mousedownHandler);
    util.bind(_this.header, 'mouseup', _this.mouseupHandler);
    util.bind(_this.btnClose, 'click', function() {
        _this.hide();

        /**
         * 派发弹出框关闭事件
         */
        _this.__dispatchEvent('onClose');
    });
    util.bind(_this.btnSave, 'click', function() {
    });

    /**
     * [绑定圈选选项按钮点击事件]
     */
    _this.filterButtonGroup.childNodes.forEach(function(child, index) {
        util.bind(child, 'click', _this.switchCircleOptionHandler);
    });
};

/**
 * [unbindEvents description]
 * @return {[type]} [description]
 */
circleDialog.prototype.unbindEvents = function() {
    var _this = this;
    util.removeEventListener(_this.header, 'mousedown', _this.mousedownHandler);
    util.removeEventListener(_this.header, 'mouseup', _this.mouseupHandler);
};

/**
 * [mousedownHandler description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
circleDialog.prototype.mousedownHandler = function(event) {
    var _this = this,
        _event = event;

    /**
     * 取消事件默认行为
     */
    _event.preventDefault();

    _this.dragging = _this.wrap;
    _this.cursorPosition = {
        top: _event.pageY - _this.dragging.offsetTop,
        left: _event.pageX - _this.dragging.offsetLeft
    };

    util.bind(util.global.document.body, 'mousemove', _this.mousemoveHandler);
};

/**
 * [mouseupHandler description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
circleDialog.prototype.mouseupHandler = function(event) {
    var _this = this,
        _event = event;

    _this.dragging = null;
    util.removeEventListener(util.global.document.body, 'mousemove', _this.mousemoveHandler);
};

/**
 * [mousemoveHandler description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
circleDialog.prototype.mousemoveHandler = function(event) {
    var _this = this,
        _event = event;

    if (_this.dragging) {
        _this.wrap.style.top = (_event.pageY - _this.cursorPosition.top) + 'px';
        _this.wrap.style.left = (_event.pageX - _this.cursorPosition.left) + 'px';
    }
};

/**
 * [switchCircleOptionHandler 切换圈选选项事件处理函数]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
circleDialog.prototype.switchCircleOptionHandler = function(event) {
    var _this = this,
        _target = event.target || event.srcElement;

    /**
     * [currentCircleOption 设置当前选中圈选选项]
     * @type {[type]}
     */
    _this.currentCircleOption = parseInt(_target.getAttribute('data-val'));

    /**
     * 切换圈选选项
     */
    _this.switchCircleOption();

    /**
     * 更新图表
     */
    _this.update();
};

/**
 * [switchCircleOption 切换圈选选项]
 * @return {[type]} [description]
 */
circleDialog.prototype.switchCircleOption = function() {
    var _this = this;

    /**
     * [删除同级元素的选中样式，设置当前元素的选中样式]
     */
    _this.filterButtonGroup.childNodes.forEach(function(child, index) {

        /**
         * [排除非元素节点]
         */
        if (child.nodeType !== 1) {
            return true;
        }

        /**
         * [设置圈选选项样式]
         */
        if (parseInt(child.getAttribute('data-val')) == _this.currentCircleOption) {
            _this.addClass(child, 'uba-selected');
        } else {
            _this.removeClass(child, 'uba-selected');
        }
    });
};

/**
 * [hide description]
 * @return {[type]} [description]
 */
circleDialog.prototype.hide = function() {
    var _this = this;
    _this.wrap.style.display = 'none';
};

/**
 * [hide description]
 * @return {[type]} [description]
 */
circleDialog.prototype.show = function() {
    var _this = this;
    _this.wrap.style.display = 'block';
};

/**
 * [addClass 指定元素添加指定样式类名]
 * @param  {[type]}  element   [description]
 * @param  {[type]}  className [description]
 * @return {Boolean}           [description]
 */
circleDialog.prototype.addClass = function(element, className) {
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
circleDialog.prototype.removeClass = function(element, className) {
    var _this = this;
    try {
        _ret = element.classList.remove(className);
    } catch (ex) {}
};

/**
 * [__getEventListener 获取指定事件类型的事件处理函数列表]
 * @param  {String} eventType [事件类型]
 * @return {Array}           [事件处理函数列表]
 */
circleDialog.prototype.__getEventListener = function(eventType) {
    var _this = this;
    _this.listener[eventType] = _this.listener[eventType] ? _this.listener[eventType] : [];
    return _this.listener[eventType];
};

/**
 * [__dispatchEvent 派发事件]
 */
circleDialog.prototype.__dispatchEvent = function() {
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
circleDialog.prototype.removeEventListener = function(eventType, eventHandler) {
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
circleDialog.prototype.addEventListener = function(eventTypes, eventHandler) {
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

module.exports = circleDialog;