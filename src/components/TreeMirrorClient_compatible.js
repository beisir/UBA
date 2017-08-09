var util = require('../libs/util');

var TreeMirrorClient = (function() {
    function TreeMirrorClient(target, mirror, testingQueries) {
        var _this = this;
        this.target = target;
        this.mirror = mirror;
        var children = [];
        for (var child = target.firstChild; child; child = child.nextSibling) {
            var _serializeNode = this.serializeNode(child, true);
            if (_serializeNode != null) {
                children.push(_serializeNode);
            }
        }
        util.global.setTimeout(function() {
            _this.mirror.initialize(children);
        }, 0);
    }
    TreeMirrorClient.prototype.serializeNode = function(node, recursive, xpath) {
        var _this = this,

            /**
             * [_buildNodePath 创建节点路径]
             * @param  {[type]} node [description]
             * @return {[type]}      [description]
             */
            _buildNodePath = function(node) {
                var _path = '/';

                /**
                 * 拼接路径中的节点名称
                 */
                _path += node.tagName.toLowerCase();

                /**
                 * [拼接路径中的节点ID]
                 */
                if (util.hasAttribute(node, 'id') && (node.getAttribute('id').match(/^[0-9]/))) {
                    _path += '#' + node.getAttribute('id');
                }

                /**
                 * 拼接路径中的节点样式类
                 */
                else if (util.hasAttribute(node, 'class')) {
                    for (var classes = node.getAttribute('class').trim().split(/\s+/).sort(), classIndex = 0; classIndex < classes.length; classIndex++) {
                        if (classes[classIndex].length > 0) {
                            _path += '.' + classes[classIndex];
                        }
                    }
                }

                return _path;
            };

        /**
         * [若节点为空，直接返回]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        if (node === null) {
            return null;
        }

        /**
         * [data 未知节点，创建节点数据对象]
         * @type {Object}
         */
        var data = {
            nodeType: node.nodeType
        };

        /**
         * [switch 对不同节点类型分别处理]
         * @param  {[type]} data.nodeType [description]
         * @return {[type]}               [description]
         */
        switch (data.nodeType) {

            /**
             * 只处理元素节点
             */
            case 1:

                /**
                 * [display 获取节点显示状态]
                 * @type {[type]}
                 */
                var display = node.style.display,
                    _display = window.getComputedStyle ? util.global.getComputedStyle(node).display : (node.currentStyle ? node.currentStyle.display : '');

                /**
                 * [若节点不在显示状态，或节点不是A元素，或节点不包含A元素，直接返回null]
                 */
                if (
                    (('none' === display) || _display === 'none') ||
                    ((node.tagName != 'A') && (node.getElementsByTagName('a').length === 0))) {
                    return null;
                }

                /**
                 * [xpath 设置元素路径]
                 * @type {[type]}
                 */
                data.xpath = (xpath || '') + _buildNodePath(node);

                /**
                 * [nodeData 设置节点类型]
                 * @type {String}
                 */
                data.tagName = node.tagName;

                /**
                 * [node 设置节点引用]
                 * @type {[type]}
                 */
                data.node = node;

                /**
                 * [若当前节点是A元素，初始化链接属性]
                 */
                if (node.tagName === 'A') {

                    /**
                     * [如果包含 data-uba-title 属性]
                     */
                    if (util.hasAttribute(node, 'data-uba-title') && (node.getAttribute('data-uba-title') > 0)) {
                        data.text = node.getAttribute('data-uba-title');
                    } else if (util.hasAttribute(node, 'title') && (node.getAttribute('title').length > 0)) {
                        data.text = node.getAttribute('title');
                    } else {
                        data.text = node.textContent || '';
                    }
                    data.text = data.text.trim().replace(/[\n\t]/g, '').replace(/\s+/g, ' ');

                    /**
                     * [attributes 设置节点属性]
                     * @type {Object}
                     */
                    data.attributes = {};
                    for (var i = 0; i < node.attributes.length; i++) {
                        var attr = node.attributes[i];
                        data.attributes[attr.name] = attr.value;
                    }

                    /**
                     * [leaf 标识为叶子节点]
                     * @type {Boolean}
                     */
                    data.leaf = true;
                }

                /**
                 * [若当前节点包含子元素，递归序列化节点]
                 */
                if (recursive && node.childNodes.length) {
                    data.childNodes = [];
                    for (var child = node.firstChild; child; child = child.nextSibling) {
                        var _serializeNode = this.serializeNode(child, true, data.xpath);
                        if (_serializeNode != null) {
                            data.childNodes.push(_serializeNode);
                        }
                    }
                }
                break;
            default:
                return null;
                break;
        }
        return data;
    };
    return TreeMirrorClient;
})();

module.exports = TreeMirrorClient;
