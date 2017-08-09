var util = require('../libs/util'),
    uuid = require('../libs/uuid'),
    cookie = require('js-cookie'),
    element = require('./element');

/**
 * [page 页面数据对象]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function page(options) {
    var _this = this,

        /**
         * [_urlAttributes 通过url解析出对象]
         * @type {Object}
         */
        _urlAttributes = util.parseURL(util.global.location.href);

    /**
     * 扩展实例属性
     */
    util.extend(true, _this, {

        /**
         * [pageID 页面编号，用于区分访客打开相同页面]
         * @type {String}
         */
        pageId: ((window.PAGE_ID) || (window.HC && window.HC.PAGE_ID)) || (new uuid()).id,

        /**
         * [title 页面标题]
         * @type {String}
         */
        title: util.global.document.title || '',

        /**
         * [protocol 页面协议]
         * @type {String}
         */
        protocol: util.global.location.protocol.substring(0, util.global.location.protocol.length - 1),

        /**
         * [host 页面主机名]
         * @type {String}
         */
        host: util.global.location.host || '',

        /**
         * [path 页面路径]
         * @type {String}
         */
        path: _urlAttributes.path || '',

        /**
         * [query 查询字符串]
         * @type {String}
         */
        query: util.global.location.search.slice(1) || '',

        /**
         * [referrer 页面访前地址]
         * @type {String}
         */
        referrer: util.global.document.referrer || '',

        /**
         * [pageTime 访客访问时间]
         * @type {NUmber}
         */
        pageTime: +new Date(),

        /**
         * [pageFrameType 获取框架页面类型]
         * @type {Number}
         * 0：当前页未被框架页包含
         * 1：当前页被同域框架页包含
         * 2：当前页被外域框架页包含
         */
        pageFrameType: util.getFramePageType(),

        /**
         * [unContainsContentTagNams 不包含内容元素类型列表]
         * @type {Array}
         */
        unContainsContentTagNams: ["I", "SPAN", "EM", "svg"],

        /**
         * [_clickableTagNames 可点击元素标记名列表]
         * @type {Array}
         */
        clickableTagNames: ["A", "BUTTON"],

        /**
         * [indexTagNames 用于确定同级元素的元素标记名]
         * @type {Array}
         */
        indexTagNames: ["TR", "LI"],

        /**
         * [changEventTagNames 触发chang事件的元素标记名]
         * @type {Array}
         */
        changEventTagNames: ["radio", "checkbox", 'text'],

        /**
         * [ignoreClickTagName 忽略点击元素]
         * @type {Array}
         */
        ignoreClickTagNames: ["TEXTAREA", "HTML", "BODY"],

        /**
         * [buttonTypeNames description]
         * @type {Array}
         */
        buttonTypeNames: ["button", "submit"],

        /**
         * [clickTagNames description]
         * @type {Array}
         */
        clickTagNames: ["A", "BUTTON", "INPUT", "IMG"],

        /**
         * [ignoreNodeName 忽略元素列表]
         * @type {Object}
         */
        ignoreNodeName: {
            tspan: 1,
            text: 1,
            g: 1,
            rect: 1,
            path: 1,
            defs: 1,
            clipPath: 1,
            desc: 1,
            title: 1,
            use: 1
        },

        /**
         * [_eventNames 用户点击行为事件名称列表]
         * @type {Array}
         */
        observeEventName: ['click', 'change', 'submit'],

        /**
         * [exposureNodes 曝光节点数据对象]
         * @type {Object}
         */
        exposureNodes: [],

        /**
         * [exposureNodesXpathSimilarity 存储曝光节点之间的相似度数据，防止每次排重的时候重新计算]
         * @type {Object}
         */
        exposureNodesXpathSimilarity: {},

        /**
         * [ignoreExposureDomains 忽略以下域名的曝光数据]
         * @type {Array}
         */
        ignoreExposureDomains: ['my.b2b.hc360.com']
    }, options);

    /**
     * 初始化访客数据对象属性
     */
    page.prototype.init.call(_this);
}

/**
 * [init 初始化页面数据对象]
 */
page.prototype.init = function() {
    var _this = this;
};

/**
 * [getElementPath 生成元素路径对象]
 * @param  {[type]} _element [元素]
 * @param  {[type]} _flag    [当前元素是否起始元素]
 * @return {[type]}          [description]
 */
page.prototype.getElementPath = function(_element, _flag) {
    var _this = this,
        _xpath = '',
        _path = '',
        _ignore = false,

        /**
         * 从起始元素向上级元素查找，若某级元素属于["A", "BUTTON"]列表中，则该属性记录这个节点的相关信息，最终该属性会挂载到结果集的同名属性上
         */
        _pnodeContent,
        _objFlag = false,
        _obj,
        _idxFlag = false,
        _idx,
        _node,
        _elementEntity,
        _parentNode,
        _data;

    /**
     * [_elementEntity 实例化当前元素实例，循环查找至 body 或 html 元素]
     * @type {element}
     */
    for (_elementEntity = new element(_element);
        ((_elementEntity.name !== 'body') && (_elementEntity.name !== 'html'));) {

        /**
         * [_path 获取当前元素路径]
         * @type {String}
         */
        _path = _elementEntity.path();

        /**
         * [是否忽略当前元素]
         */
        if (_elementEntity.ignore) {
            _ignore = true;
        }

        /**
         * [元素数据属性只设置一次，若当前元素没有数据属性则一级级向上获取父元素的数据属性]
         */
        if ((!_objFlag) && _elementEntity.hasObj()) {
            _objFlag = true;
            _obj = _elementEntity.obj;
        }

        /**
         * [元素位置属性只设置一次，若当前元素没有位置属性则一级级向上获取父元素的位置属性]
         */
        if ((!_idxFlag) && _elementEntity.hasIdx()) {
            _idxFlag = true;
            _idx = _elementEntity.idx;
        }

        /**
         * [非起始元素，且当前元素是从起始元素向上查找到的第一个存在于可点击元素["A", "BUTTON"]列表中的元素，则创建一个pnodeContent属性挂载到返回结果对象上，该属性以包含当前元素的路径信息]
         */
        if (_flag && (_xpath !== '') && ((_this.clickableTagNames.indexOf(_elementEntity.node.tagName) != -1) || _elementEntity.isContainer())) {

            /**
             * [_node 获取当前元素路径]
             */
            _node = _this.getElementPath(_elementEntity.node);

            /**
             * [_pnodeContent 包含信息对象]
             * @type {Object}
             */
            _pnodeContent = {
                x: _node.xpath,
                h: _elementEntity.href,
                v: _this.getElementContent(_elementEntity.node)
            };

            /**
             * [_data 返回数据结果集]
             * @type {Object}
             */
            _data = {
                xpath: _pnodeContent.x + _xpath,
                ignore: _ignore || _node.ignore,
                pnode: _elementEntity.node
            };

            /**
             * [获取元素位置]
             */
            if (_idxFlag) {
                _pnodeContent.idx = _idx;
                _data.idx = _idx;
            } else if (_node.idx) {
                _pnodeContent.idx = _node.idx;
                _data.idx = _node.idx;
            } else {
                _pnodeContent.idx = _this.getElementIndex(_elementEntity.node, _node.xpath);
            }

            /**
             * [获取元素数据]
             */
            if (_idxFlag) {
                _pnodeContent.obj = _obj;
                _data.obj = _obj;
            } else if (_node.obj) {
                _pnodeContent.obj = _node.obj;
                _data.obj = _node.obj;
            }

            /**
             * [containerMessage 保存包含信息对象]
             * @type {[type]}
             */
            _data.pnodeContent = _pnodeContent;

            /**
             * 返回数据结果集
             */
            return _data;
        }

        /**
         * [_xpath 拼接元素路径]
         * @type {String}
         */
        _xpath = _path + _xpath;

        /**
         * [_parentNode 获取当前元素父元素]
         * @type {Object}
         */
        _parentNode = _elementEntity.node.parentNode;

        /**
         * [若不存在父元素，结束循环]
         */
        if ((!_parentNode) || (!_parentNode.tagName)) {
            break;
        }

        /**
         * [_elementEntity 将当前元素设置为父元素，并继续循环获取元素路径]
         * @type {element}
         */
        _elementEntity = new element(_parentNode);
    }

    /**
     * [_result 元素路径对象]
     * @type {Object}
     */
    _data = {
        xpath: _xpath,
        pnodeContent: _pnodeContent,
        ignore: _ignore
    };

    /**
     * [设置元素数据]
     */
    if (_objFlag) {
        _data.obj = _obj;
    }

    /**
     * [设置元素位置]
     */
    if (_idxFlag) {
        _data.idx = _idx;
    }

    /**
     * 返回元素路径对象
     */
    return _data;
};

/**
 * [getElementIndex 获取元素位置]
 * @param  {[type]} element [description]
 * @param  {[type]} xpath   [description]
 * @return {[type]}         [description]
 */
page.prototype.getElementIndex = function(element, xpath) {
    var _this = this,
        _node = element,
        _parentNode,
        _child,
        _childs,
        _index,
        _nodeIndex,
        _length,
        _tempRegExp = new RegExp(_this.indexTagNames.join('|'), 'ig');

    /**
     * [若存在元素路径，根据路径确认是否含有可以确定元素位置的父元素，如果没有，直接返回]
     */
    if (xpath && (xpath.search(_tempRegExp) == -1)) {
        return 1;
    }

    /**
     * [找到用于确定元素位置的父元素]
     */
    for (; _node && (_node.tagName !== 'BODY') && (_this.indexTagNames.indexOf(_node.tagName) === -1);) {
        _node = _node.parentNode;
    }

    /**
     * [若找到确定元素位置的父元素]
     */
    if (_node) {
        for (_parentNode = _node.parentNode, _childs = _parentNode.childNodes, _index = 0, _nodeIndex = 1, _length = _childs.length; _length > _index; _index++) {
            _child = _childs[_index];

            /**
             * [忽略其他类型节点]
             */
            if (_child.tagName === _node.tagName) {

                /**
                 * [当前元素是否含有位置属性]
                 */
                if (util.hasAttribute(_child, 'data-uba-idx')) {
                    _nodeIndex = parseInt(_child.getAttribute('data-uba-idx'), 10);
                }

                /**
                 * [当前元素如果等于确定元素位置的元素，则返回该元素的当前元素位置]
                 */
                if (_child === _node) {
                    return _nodeIndex;
                }

                /**
                 * 当前元素位置加1
                 */
                _nodeIndex += 1;
            }
        }
    }
};

/**
 * [getElementContent 获取元素内容]
 * @param  {[type]} element [description]
 * @return {[type]}               [description]
 */
page.prototype.getElementContent = function(element) {
    var _this = this;

    /**
     * [switch 根据不同类型元素获取元素内容]
     */
    switch (element.tagName) {
        case 'BUTTON':

            /**
             * [若元素的name属性不为空，则返回元素的name属性]
             */
            if (element.name.length) {
                return element.name;
            }

            /**
             * 否则获取元素文本内容
             */
            else {
                return _this.getElementText(element);
            }
            break;

        case 'A':
            /**
             * [如果包含 data-uba-title 属性]
             */
            if (util.hasAttribute(element, 'data-uba-title') && (element.getAttribute('data-uba-title') > 0)) {
                return element.getAttribute('data-uba-title');
            }

            /**
             * [如果包含 title 属性]
             */
            if (util.hasAttribute(element, 'title') && (element.getAttribute('title').length > 0)) {
                return element.getAttribute('title');
            }

            /**
             * [如果文本内容不为空，获取文本内容]
             */
            var _text = _this.getElementText(element);
            if (_text.length > 0) {
                return _this.getElementText(element);
            }

            /**
             * [如果包含 href 属性]
             */
            else if (util.hasAttribute(element, 'href') && (element.getAttribute('href').length > 0)) {
                return element.getAttribute('href');
            } else {
                return _text;
            }
            break;
        default:
            return _this.getElementText(element);
            break;
    }
};

/**
 * [getElementText 获取元素文本内容]
 * @param  {[type]} elem [description]
 * @return {[type]}         [description]
 */
page.prototype.getElementText = function(elem) {
    var _this = this,
        node,
        ret = "",
        i = 0,
        nodeType = elem.nodeType;

    if (!nodeType) {
        // If no nodeType, this is expected to be an array
        for (;
            (node = elem[i]); i++) {
            // Do not traverse comment nodes
            ret += _this.getElementText(node);
        }
    } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (see #11153)
        if (typeof elem.textContent === "string") {
            return elem.textContent;
        } else {
            // Traverse its children
            for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                ret += _this.getElementText(elem);
            }
        }
    } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
    }
    // Do not include comment or processing instruction nodes

    return ret.replace(/[\t\n]/g, ' ').trim();
};

/**
 * [depthInside 元素深度是否小于指定深度]
 * @param  {[type]} element      [description]
 * @param  {[type]} depth        [指定深度]
 * @param  {[type]} currentDepth [当前深度]
 * @return {[type]}              [description]
 */
page.prototype.depthLimit = function(element, depth, currentDepth) {
    var _this = this,
        _length,
        _index,
        _childs,
        _child;

    /**
     * [未指定当前深度时，默认为1]
     */
    if ((currentDepth == null)) {
        currentDepth = 1;
    }

    /**
     * [若当前元素有子节点]
     */
    if (element.hasChildNodes()) {

        /**
         * [若当前深度大于指定深度，返回false]
         */
        if (currentDepth > depth) {
            return false;
        }

        /**
         * [获取当前元素的子节点，若子节点是元素，且子元素的深度大于指定深度]
         */
        for (_index = 0, _childs = element.childNodes, _length = _childs.length; _length > _index; _index++) {
            _child = _childs[_index];
            if ((_child.nodeType === 1) && (!_this.depthLimit(_child, depth, currentDepth + 1))) {
                return false;
            }
        }
    }

    return depth >= currentDepth;
};

/**
 * [isLeafNode 是否叶子节点]
 * @param  {[type]}  element [description]
 * @return {Boolean}         [description]
 */
page.prototype.isLeafNode = function(element) {
    var _this = this,
        _length,
        _index,
        _childs,
        _child;

    /**
     * [若当前元素包含子元素，且元素类型不是SVG，且其任一子元素是元素节点，则当前元素不是叶子元素]
     */
    if (element.hasChildNodes() && (element.tagName != 'svg')) {
        for (_index = 0, _childs = element.childNodes, _length = _childs.length; _index < _length; _index++) {
            _child = _childs[_index];
            if (_child.nodeType === 1) {
                return false;
            }
        }
    }

    return true;
};

/**
 * [analyzeEventElementAttribute 解析事件元素属性]
 * @param  {[type]} eventType [description]
 * @param  {[type]} element   [description]
 * @return {[type]}           [description]
 */
page.prototype.analyzeEventElementAttribute = function(eventType, element) {
    var _this = this,
        _obj = {},
        _tagName = element.tagName,
        _src,
        _href,
        _path,
        _text;

    /**
     * [获取元素资源引用地址]
     */
    if (_tagName === 'IMG') {
        _src = element.src;
        if ((_src != null) && (_src.length > 0) && (_src.indexOf('data:image') === -1)) {
            _obj.h = _src;
        }
    } else if (util.hasAttribute(element, 'href')) {
        _href = element.getAttribute('href');
        if (_href && _href.indexOf('javascript') !== 0) {
            _obj.h = _this.normalizePath(_href);
        }
    }

    /**
     * [获取元素的内容信息]
     */
    if (util.hasAttribute(element, 'data-uba-title') && (element.getAttribute('data-uba-title').length > 0)) {
        _obj.v = element.getAttribute('data-uba-title');
    } else if (util.hasAttribute(element, 'title') && (element.getAttribute('title').length > 0)) {
        _obj.v = element.getAttribute('title');
    }

    /**
     * [若当前事件为点击事件]
     */
    else if (eventType === 'click') {

        /**
         * [如果是叶子节点]
         */
        if (_this.isLeafNode(element)) {

            /**
             * [被点击元素是图片,获取图片的alt属性或图片文件名作为内容]
             */
            if (_tagName === 'IMG') {
                if (element.alt) {
                    _obj.v = element.alt;
                } else if (_obj.h) {
                    _obj.v = util.parseURL(_obj.h).file;
                }
            }

            /**
             * [被点击元素是INPUT，且其type存在于["button", "submit"]列表中，获取其value属性作为内容]
             */
            else if ((_tagName === 'INPUT') && (_this.buttonTypeNames.indexOf(element.type) != -1)) {
                _obj.v = element.value;
            }

            /**
             * [如果是SVG元素，获取其子节点的xlink:href属性作为内容]
             */
            else if (_tagName === 'svg') {
                for (var i = 0, j = element.childNodes, k = j.length; i < k; i++) {
                    var _svg = j[i];
                    if ((_svg.nodeType === 1) && (_svg.tagName === 'use') && util.hasAttribute(_svg, 'xlink:href')) {
                        _obj.v = _svg.getAttribute('xlink:href');
                    }
                }
            }

            /**
             * 其他情况
             */
            else {

                /**
                 * [_text 获取元素内容属性作为内容]
                 * @type {String}
                 */
                _text = _this.getElementContent(element);
                if (_text.length) {
                    _obj.v = _text.substring(0, 2000);
                }
            }
        }

        /**
         * 其他情况
         */
        else {

            /**
             * [_text 获取元素内容属性作为内容]
             * @type {String}
             */
            _text = _this.getElementContent(element);
            if (_text.length) {
                _obj.v = _text.substring(0, 2000);
            }
        }
    }

    /**
     * [若事件类型为change]
     */
    else if (eventType === 'change') {

        /**
         * [排除TEXTAREA元素，若当前元素为INPUT，且其type存在于["radio", "checkbox"]列表中，或其type不是password，或其为SELECT元素，获取其value属性作为内容]
         */
        if ((_tagName !== "TEXTAREA") && ((("INPUT" === _tagName) && (-1 !== _this.changEventTagNames.indexOf(element.type)) || ("password" !== element.type)) || ("SELECT" === _tagName))) {
            _obj.v = element.value;
        }
    }

    /**
     * [事件类型为submit]
     */
    else if (eventType === 'submit') {
        var _child,
            _childs,
            _length,
            _index;

        /**
         * [查找表单下面的INPUT元素，找到]
         */
        for (_childs = element.getElementsByTagName('input'), _index = 0, _length = _childs.length; _index < _length; _index++) {
            _child = _childs[_index];
            if ("search" === _child.type || "text" === _child.type || "submit" === _child.type) {
                _obj.x = _this.path(_child).xpath;
                _obj.v = util.trim(_child.value);
            }

        }
    }

    return _obj;
};

/**
 * [getExposureNodes 获取曝光数据]
 * @param  {[type]} nodeAttr    [description]
 * @param  {[type]} nodesLength [description]
 * @return {[type]}             [description]
 */
page.prototype.getExposureNodes = function(_children) {
    var _this = this,
        _leafNodes = [],
        _child,
        _childs = _children,
        _length,
        _index,

        /**
         * [_regExp 只获取商品终极页、商铺页的链接元素作为曝光数据]
         * @type {RegExp}
         */
        _regExpMatch = function(href) {

            /**
             * [_regExpList 匹配链接地址列表]
             * @type {Array}
             */
            var _regExpList = [
                    /^http\:\/\/b2b.hc360.com\/supplyself\/[0-9]+.html/,
                    /^http\:\/\/m.hc360.com\/supplyself\/[0-9]+.html/,
                    /^http\:\/\/js.hc360.com\/supplyself\/[0-9]+.html/,
                    /^http\:\/\/([^.]+).b2b.hc360.com/ //出于用户页面体验的问题，暂时不记录商铺链接
                ],

                /**
                 * [_regExpShop 匹配商铺页]
                 * @type {RegExp}
                 */
                _regExpShop = /^http\:\/\/([^.]+).b2b.hc360.com/,

                /**
                 * [_regExpShopDetail 商铺终极页]
                 * @type {RegExp}
                 */
                _regExpShopDetail = /^http\:\/\/b2b.hc360.com\/supplyself\/[0-9]+.html/,

                /**
                 * [_domains 要过滤的 ***.b2b.hc360.com 二级域名列表]
                 * @type {Array}
                 */
                _domains = ['my', 'info'],

                /**
                 * 匹配项
                 */
                _matches;

            /**
             * [逐个验证URL地址]
             */
            while (_regExpList.length) {

                /**
                 * [_matches 获取链接地址匹配结果]
                 * @type {Object}
                 */
                _matches = _regExpList.shift().exec(href);

                /**
                 * [匹配到 *.b2b.hc360.com 商铺页]
                 */
                if (_matches && _matches[1]) {

                    /**
                     * [过滤如 my.b2b.hc360.com 等非商铺页]
                     */
                    if (_domains.indexOf(_matches[1]) != -1) {
                        return false;
                    }

                    /**
                     * [忽略从商铺页或商品终极页跳转到商铺页的链接，例如商铺页和商品终极页的导航链接]
                     */
                    else if (_regExpShop.test(util.global.location.href) || _regExpShopDetail.test(util.global.location.href)) {
                        return false;
                    }
                }

                /**
                 * [若匹配到商铺终极页，]
                 */
                if (_matches) {
                    return true;
                }
            }

            return false;
        };

    /**
     * [若当前域属于忽略曝光数据的域，则直接返回]
     */
    if (_this.ignoreExposureDomains.indexOf(_this.host) != -1) {
        return _leafNodes;
    }

    /**
     * [遍历创建曝光数据集]
     */
    for (_index = 0, _length = _childs.length; _index < _length; _index++) {
        _child = _childs[_index];

        /**
         * [如果是叶子节点，且能匹配链接地址列表，直接添加到结果集中]
         */
        if (_child.leaf && _regExpMatch(_child.attributes.href || '')) {
            _leafNodes.push({
                x: _child.xpath,
                v: _child.text,
                h: _this.normalizePath(_child.attributes.href),
                idx: _this.getElementIndex(_child.node, _child.xpath),
                n: _child.node
            });
        }

        /**
         * [若当前元素的子集合不为空]
         */
        if (_child.childNodes && _child.childNodes.length) {
            _leafNodes = _leafNodes.concat(_this.getExposureNodes(_child.childNodes));
        }
    }
    return _leafNodes;
};

/**
 * [uniqueExposureNodes 曝光数据排重]
 * @param  {[type]} nodes            [description]
 * @param  {[type]} similarityDegree [路径相似度阈值，大于等于该值为相似]
 * @return {[type]}                  [description]
 */
page.prototype.uniqueExposureNodes = function(nodes, similarityDegree) {
    var _this = this,
        // _nodes = [],
        _nodesHash = {},
        _flag,
        _tempXpathSimilarity,
        _ret = [];

    /**
     * [过滤曝光元素]
     */
    _ret = nodes.filter(function(node) {

        /**
         * [若当前元素路径在与过滤出的所有元素路径比较时，存在相同部分大于等于similarityDegree，且链接地址相同，则过滤掉。]
         */
        // _nodes.forEach(function(_node) {
        //     console.log(node.x, ',', _node.x, ',', _xpathSimilarity(node.x, _node.x), ',', node.h, ',', _node.h);
        //     _tempXpathSimilarity = _this.exposureNodesXpathSimilarity[[node.x, _node.x].join(' ')] || _this.exposureNodesXpathSimilarity[[_node.x, node.x].join(' ')];
        //     if (!_tempXpathSimilarity) {
        //         _tempXpathSimilarity = _this._xpathSimilarity(node.x, _node.x);
        //         _this.exposureNodesXpathSimilarity[[node.x, _node.x].join(' ')] = _tempXpathSimilarity;
        //     }
        //     if ((_tempXpathSimilarity >= similarityDegree) && _nodesHash[node.h]) {
        //         _flag = true;
        //         return false;
        //     }
        // });

        /**
         * [若已经存在该链接地址，则过滤掉]
         */
        var _href = node.h.trim();
        if (_nodesHash[_href]) {
            return false;
        } else {
            _nodesHash[_href] = 1;
            return true;
        }
    });

    return _ret;
};

/**
 * [_xpathSimilarity xpath相似度是否大于指定值]
 * @return {[type]} [description]
 */
page.prototype._xpathSimilarity = function(xpath1, xpath2) {

    /**
     * [_splitPath 拆分路径，排除空项]
     * @param  {[type]} _xpath [description]
     * @return {[type]}        [description]
     */
    var _splitPath = function(_xpath) {
            return _xpath.split('/').filter(function(str) {
                if (str.trim().length !== 0) {
                    return true;
                } else {
                    return false;
                }
            });
        },
        _xpath1 = _splitPath(xpath1),
        _xpath2 = _splitPath(xpath2),
        _degree = 0;

    /**
     * [若路径1的指定位置和路径2的对应位置内容相同，否则跳出循环]
     * @param  {[type]} var i             [description]
     * @return {[type]}     [description]
     */
    for (var i = 0; i < _xpath1.length; i++) {
        if (_xpath1[i] === _xpath2[i]) {
            _degree += 1;
            continue;
        }
        break;
    }

    return _degree / Math.max(_xpath1.length, _xpath2.length);
};

/**
 * [normalizePath 删除元素xpath后面的斜杠]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
page.prototype.normalizePath = function(path) {
    var regExp = new RegExp("\/$", 'ig');
    while (regExp.test(path)) {
        path = path.replace(regExp, '');
    }
    return path;
};

/**
 * [canPostMessage 向父框架页发送消息]
 * @param  {[type]} data [description]
 * @return {[type]}          [description]
 */
page.prototype.postMessage = function(data) {
    var _this = this,
        _parent = util.global.parent,
        _flag = _parent && ("function" == typeof _parent.postMessage) && (util.global.self !== util.global.top) && (util.global.self !== _parent);

    /**
     * [若消息为空]
     */
    if (!data) {
        return;
    }

    /**
     * [若不存在父框架页]
     */
    if (!_flag) {
        return;
    }

    /**
     * 发送消息
     */
    _parent.postMessage(JSON.stringify(data), '*');
};

module.exports = page;