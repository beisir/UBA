var util = require('../libs/util');

util.global.MutationSummary = require("./MutationSummary");

var TreeMirrorClient = (function() {
    function TreeMirrorClient(target, mirror, testingQueries) {
        var _this = this;
        this.target = target;
        this.mirror = mirror;
        this.nextId = 1;
        this.knownNodes = new MutationSummary.NodeMap();
        // var rootId = this.serializeNode(target).id;
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
        var queries = [{
            element: "a",
            elementAttributes: "href"
        }];
        if (testingQueries) {
            queries = queries.concat(testingQueries);
        }
        this.mutationSummary = new MutationSummary({
            rootNode: target,
            callback: function(summaries) {
                _this.applyChanged(summaries);
            },
            queries: queries
        });
    }
    TreeMirrorClient.prototype.disconnect = function() {
        if (this.mutationSummary) {
            this.mutationSummary.disconnect();
            this.mutationSummary = undefined;
        }
    };
    TreeMirrorClient.prototype.rememberNode = function(node) {
        var id = this.nextId++;
        this.knownNodes.set(node, id);
        return id;
    };
    TreeMirrorClient.prototype.forgetNode = function(node) {
        this.knownNodes.delete(node);
    };
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
         * [是否已知节点，如果是的话直接返回已知元素ID]
         * @type {[type]}
         */
        var id = this.knownNodes.get(node);
        if (id !== undefined) {
            return {
                id: id
            };
        }

        /**
         * [data 未知节点，创建节点数据对象]
         * @type {Object}
         */
        var data = {
            nodeType: node.nodeType,
            id: this.rememberNode(node)
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
                 * [若无xpath，先构建元素路径前缀]
                 */
                if (!xpath) {
                    for (var _pElement = node.parentElement; _pElement && ("BODY" !== _pElement.tagName) && ("HTML" !== _pElement.tagName);) {

                        /**
                         * [xpath 设置元素路径]
                         * @type {[type]}
                         */
                        xpath = _buildNodePath(_pElement) + (xpath || '');

                        /**
                         * [_pElement 设置当前元素的父级为当前元素]
                         * @type {[type]}
                         */
                        _pElement = _pElement.parentElement;
                    }
                }

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
                    ((node.tagName != 'A') && (node.querySelector('a') === null))) {
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
    TreeMirrorClient.prototype.serializeAddedAndMoved = function(added, reparented, reordered) {
        var _this = this;
        var all = added.concat(reparented).concat(reordered || []);
        var parentMap = new MutationSummary.NodeMap();
        all.forEach(function(node) {
            var parent = node.parentNode;
            var children = parentMap.get(parent);
            if (!children) {
                children = new MutationSummary.NodeMap();
                parentMap.set(parent, children);
            }
            children.set(node, true);
        });
        var moved = [];
        parentMap.keys().forEach(function(parent) {
            var children = parentMap.get(parent);
            var keys = children.keys();
            while (keys.length) {
                var node = keys[0];
                while (node.previousSibling && children.has(node.previousSibling))
                    node = node.previousSibling;
                while (node && children.has(node)) {
                    var data = _this.serializeNode(node);
                    if (data != null) {
                        data.previousSibling = _this.serializeNode(node.previousSibling);
                        data.parentNode = _this.serializeNode(node.parentNode);
                        moved.push(data);
                        children.delete(node);
                        node = node.nextSibling;
                    }
                }
                var keys = children.keys();
            }
        });
        return moved;
    };
    TreeMirrorClient.prototype.serializeAttributeChanges = function(attributeChanged) {
        var _this = this;
        var map = new MutationSummary.NodeMap();
        Object.keys(attributeChanged).forEach(function(attrName) {
            attributeChanged[attrName].forEach(function(element) {
                var record = map.get(element);
                if (!record) {
                    record = _this.serializeNode(element);
                    if (record != null) {
                        record.attributes = {};
                        map.set(element, record);
                    }
                }
                record.attributes[attrName] = element.getAttribute(attrName);
            });
        });
        return map.keys().map(function(node) {
            return map.get(node);
        });
    };
    TreeMirrorClient.prototype.applyChanged = function(summaries) {
        var _this = this;
        var summary = summaries[0];
        var removed = summary.removed.map(function(node) {
            return _this.serializeNode(node);
        });
        // var moved = this.serializeAddedAndMoved(summary.added, summary.reparented, summary.reordered); 
        var moved = this.serializeAddedAndMoved(summary.added, [], []);// 只取新增的节点
        var attributes = this.serializeAttributeChanges(summary.attributeChanged);
        var text = (summary.characterDataChanged || []).map(function(node) {
            var data = _this.serializeNode(node);
            if (data != null) {
                data.textContent = node.textContent;
                return data;
            }
        });
        util.global.setTimeout(function() {
            _this.mirror.applyChanged(removed, moved, attributes, text);
        }, 0);
        summary.removed.forEach(function(node) {
            _this.forgetNode(node);
        });
    };
    return TreeMirrorClient;
})();

module.exports = TreeMirrorClient;
