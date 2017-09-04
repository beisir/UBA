var _htmlArray = ['<div id="uba-circle-container" class="uba-content-section uba-collapsed">',
    '    <div id="uba-circle-header" class="uba-circle-header">',
    '        <div style="float:left">',
    '            <div class="tips">',
    '                <i>?</i>',
    '                <span>',
    '                <span>圈选功能使用可视化方式采集数据。</span>',
    '                <span>当前元素:由当前地址、圈选文本、元素路径、元素索引定位。</span>',
    '                <span>当前位置:由类似地址、元素路径、元素索引定位。</span>',
    '                <span>同类元素:由当前地址、元素路径定位。</span>',
    '                <span>浏览量：是当前页面的访问量</span>',
    '                <span>点击量与选择的标签相关。具体详情见稍后的<a href="javascript:;">帮助中心</a>。</span>',
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
    '                        <input id="uba-tag-title" type="text" class="uba-form-control with-placeholder" />',
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
    '                                <div class="filter-button-item" data-val="3">同类元素</div>',
    '                                <div class="filter-button-item" data-val="2">当前位置</div>',
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
    lzString = require('lz-string'),
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
         * [lzString 压缩数据对象]
         * @type {[type]}
         */
        lzString: lzString,

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
         * [serviceURL 获取图标数据服务地址]
         * @type {String}
         */
        serviceURL: {
            get: '//point.hc360.com/slw/loop/',
            save: '//point.hc360.com/ind/add/'
        },

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
            legend: {
                data: []
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false
            },
            yAxis: [],
            grid: {
                x: 50,
                x2: 40,
                y: 32,
                y2: 20
            },
            series: []
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
            width: 300,
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
     * [_windowWidth 获取视窗宽高]
     * @type {Number}
     */
    var _windowWidth = 0,
        _windowHeight = 0,
        _dialogWidth = 320,
        _dialogHeight = 328,
        _elementPosition = _this.target.getBoundingClientRect();

    /**
     * [获取视窗宽度]
     */
    if (window.innerWidth) {
        _windowWidth = window.innerWidth;
    } else if (document.body && document.body.clientWidth) {
        _windowWidth = document.body.clientWidth;
    }

    /**
     * [获取视窗高度]
     */
    if (window.innerHeight) {
        _windowHeight = window.innerHeight;
    } else if (document.body && document.body.clientHeight) {
        _windowHeight = document.body.clientHeight;
    }

    /**
     * 若点击事件左偏移量加上弹窗的宽度超出视窗，则将弹出框显示在元素的左侧
     */
    if ((_event.pageX + _dialogWidth) >= _windowWidth) {
        _this.left = _event.pageX - _dialogWidth;
    }

    /**
     * 若点击事件上偏移量加上弹窗的高度超出视窗，则将弹出框显示在元素的上侧
     */
    if ((_event.pageY + _dialogHeight) >= _windowHeight) {
        _this.top = _event.pageY - _dialogHeight;
    }

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
     * [value 默认将元素内容填充到指标名称输入框]
     * @type {[type]}
     */
    _this.txtTitle.value = _this.text;

    /**
     * [_promise 获取数据延迟对象]
     * @type {[type]}
     */
    // _this.serviceURL.get='/ldt';
    _promise = _this.getDataPromise({
        xpath: _this.xpath,
        text: _this.text,
        idx: _this.index,
        url: document.location.href,
        opt: _this.currentCircleOption
    }, _this.serviceURL.get);

    /**
     * [未返回延迟对象]
     */
    if (!_promise) {
        return;
    }

    /**
     * 显示弹出框，以便能获取元素正确位置
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
            _data = JSON.parse(xhr.responseText || '{}');
        } catch (e) {}

        /**
         * [_data 模拟数据]
         * @type {[type]}
         */
        // _data = {
        //     "data": {
        //         "dataList": [{
        //             "unit": "次",
        //             "data": [141565, 124, 85873, 64083, 133855, 126917, 58969],
        //             "name": "浏览量"
        //         }, {
        //             "unit": "次",
        //             "data": [121565, 104, 83873, 63083, 123855, 136917, 52969],
        //             "name": "点击量"
        //         }],
        //         "time": ["2017-08-24", "2017-08-25", "2017-08-26", "2017-08-27", "2017-08-28", "2017-08-29", "2017-08-30"]
        //     }
        // };
        _data = _data.data || {};

        /**
         * [_option 更新配置]
         * @type {[type]}
         */
        _option = util.extend(true, _this.chartOptions, {
            xAxis: {
                data: _data.time || []
            }
        });

        /**
         * [创建图标系列数据]
         */
        _option.series = [];
        _option.legend.data = [];
        _option.yAxis = [];
        _colors = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
        (_data.dataList || []).forEach(function(item, index) {

            /**
             * [创建数据序列]
             * @type {[type]}
             */
            _option.series.push({
                name: item.name || '',
                type: 'line',
                smooth: true,
                data: item.data || [],
                yAxisIndex: index //指定y坐标轴
            });

            /**
             * 添加图例
             */
            _option.legend.data.push(item.name || '');

            /**
             * [添加Y坐标轴]
             */
            _option.yAxis.push(Object.assign({
                type: 'value',
                position: ((index % 2) === 0) ? 'left' : 'right',
                axisLabel: {
                    /**
                     * [formatter 格式化数据]
                     * @param  {[type]} value [刻度数值（类目）]
                     * @param  {[type]} index [刻度的索引]
                     * @return {[type]}       [description]
                     */
                    formatter: function(value, index) {
                        return util.ConversionPrice(value, 0);
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: _colors[index % (_colors.length)]
                    }
                }
            }, {
                name: item.name || ''
            }));
        });

        /**
         * 使用新数据渲染图表
         */
        _this.chartEntity.setOption(_option);
    });
};

/**
 * [save 保存圈选弹出框内容]
 * @return {[type]} [description]
 */
circleDialog.prototype.save = function() {
    var _this = this;

    /**
     * [验证指标名称非空]
     */
    var _title = util.trim(_this.txtTitle.value);
    if (!util.trim(_title).length) {
        alert('请输入指标名称！');
        return;
    }

    /**
     * [_promise 获取数据延迟对象]
     * @type {[type]}
     */
    _promise = _this.getDataPromise({
        xpath: _this.xpath,
        opt: _this.currentCircleOption,
        name: _title, //指标名称
        url: document.location.href,
        pos: _this.index,
        text: _this.text, //元素内容
    }, _this.serviceURL.save);

    /**
     * 派发弹出框数据保存事件
     */
    _this.__dispatchEvent('onSave');

    /**
     * [获取到数据后显示弹出框，更新图表]
     */
    _promise.then(function(xhr) {

        /**
         * 将数据转为JSON
         */
        try {
            _data = JSON.parse(xhr.responseText || '{}');
        } catch (e) {}


        /**
         * [判断是否保存成功]
         */
        if (parseInt(_data.errno) === 0) {

            /**
             * [_option 隐藏弹出框]
             * @type {[type]}
             */
            alert('保存指标成功！');
            _this.hide();
            return;
        }

        /**
         * [显示保存信息]
         */
        _data.message = _data.message || '保存指标失败！';
        if (_data.message.trim().length) {
            alert(_data.message);
        }
    });
};

/**
 * [getDataPromise 获取数据延迟对象]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
circleDialog.prototype.getDataPromise = function(data, serviceURL) {
    var _this = this,
        _xhr,
        _data = data,
        _promise;

    /**
     * 压缩数据
     */
    try {
        _data = _this.lzString.compressToEncodedURIComponent(JSON.stringify(_data));
    } catch (e) {
        _data = '';
    }

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
         * [打开链接]
         */
        _xhr.open('POST', serviceURL, true);
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

        /**
         * 保存弹出框数据
         */
        _this.save();
    });

    /**
     * [绑定圈选选项按钮点击事件]
     */
    for (var i = 0; i < _this.filterButtonGroup.childNodes.length; i++) {
        var _childNodeTemp = _this.filterButtonGroup.childNodes[i];
        if (_childNodeTemp.nodeType === 1) {
            util.bind(_childNodeTemp, 'click', _this.switchCircleOptionHandler);
        }
    }
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
    for (var i = 0; i < _this.filterButtonGroup.childNodes.length; i++) {
        var _childNodeTemp = _this.filterButtonGroup.childNodes[i];

        /**
         * [排除非元素节点]
         */
        if (_childNodeTemp.nodeType === 1) {

            /**
             * [设置圈选选项样式]
             */
            if (parseInt(_childNodeTemp.getAttribute('data-val')) == _this.currentCircleOption) {
                _this.addClass(_childNodeTemp, 'uba-selected');
            } else {
                _this.removeClass(_childNodeTemp, 'uba-selected');
            }
        }
    }
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