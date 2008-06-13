YUI.add('dd-ddm-base', function(Y) {

    /**
     * 3.x DragDrop Manager - Base
     * @class DDM
     * @module dd-ddm-base
     * @namespace DD
     * @extends base
     * @extends event-target
     * @constructor
     */
     //TODO Add Event Bubbling??
    
    var DDMBase = function() {
    };

    DDMBase.NAME = 'DragDropMgr';

    DDMBase.ATTRS = {
        /**
        * @attribute clickPixelThresh
        * @description The number of pixels to move to start a drag operation, default is 3.
        * @type Number
        */        
        clickPixelThresh: {
            value: 3,
            set: function(p) {
                this.clickPixelThresh = p;
            }
        },
        /**
        * @attribute clickPixelThresh
        * @description The number of milliseconds a mousedown has to pass to start a drag operation, default is 1000.
        * @type Number
        */        
        clickTimeThresh: {
            value: 1000,
            set: function(p) {
                this.clickTimeThresh = p;
            }
        }

    };

    Y.mix(DDMBase, {
        /**
        * @property clickPixelThresh
        * @description The number of pixels moved needed to start a drag operation, default 3.
        * @type {Number}
        */
        clickPixelThresh: 3,
        /**
        * @property clickTimeThresh
        * @description The number of milliseconds a mousedown needs to exceed to start a drag operation, default 1000.
        * @type {Number}
        */
        clickTimeThresh: 1000,
        /**
        * @private
        * @property drags
        * @description Holder for all registered drag elements.
        * @type {Array}
        */
        drags: [],
        /**
        * @property activeDrag
        * @description A reference to the currently active draggable object.
        * @type {Drag}
        */
        activeDrag: false,
        /**
        * @private
        * @method regDrag
        * @description Adds a reference to the drag object to the DDM.drags array, called in the constructor of Drag.
        * @param {Drag} d The Drag object
        */
        regDrag: function(d) {
            this.drags[this.drags.length] = d;
        },
        /**
        * @private
        * @method unregDrag
        * @description Remove this drag object from the DDM.drags array.
        * @param {Drag} d The drag object.
        */
        unregDrag: function(d) {
            var tmp = [];
            Y.each(this.drags, function(n, i) {
                if (n !== d) {
                    tmp[tmp.length] = n;
                }
            });
            this.drags = tmp;
        },
        /**
        * @private
        * @method init
        * @description DDM's init method
        */
        init: function() {
            Y.Node.get('document').on('mousemove', this.move, this, true);
            Y.Node.get('document').on('mouseup', this.end, this, true);
        },
        /**
        * @private
        * @method start
        * @description Internal method used by Drag to signal the start of a drag operation
        * @param {Number} x The x position of the drag element
        * @param {Number} y The y position of the drag element
        * @param {Number} w The width of the drag element
        * @param {Number} h The height of the drag element
        */
        start: function(x, y, w, h) {
            this.startDrag.apply(this, arguments);
        },
        /**
        * @private
        * @method startDrag
        * @description Factory method to be overwritten by other DDM's
        * @param {Number} x The x position of the drag element
        * @param {Number} y The y position of the drag element
        * @param {Number} w The width of the drag element
        * @param {Number} h The height of the drag element
        */
        startDrag: function() {},
        /**
        * @private
        * @method endDrag
        * @description Factory method to be overwritten by other DDM's
        */
        endDrag: function() {},
        dropMove: function() {},
        /**
        * @private
        * @method end
        * @description Internal method used by Drag to signal the end of a drag operation
        */
        end: function() {
            if (this.activeDrag) {
                this.endDrag();
                this.activeDrag.end.call(this.activeDrag);
                this.activeDrag = null;
            }
        },
        /**
        * @private
        * @method move
        * @description Internal listener for the mousemove DOM event to pass to the Drag's move method.
        */
        move: function() {
            if (this.activeDrag) {
                this.activeDrag.move.apply(this.activeDrag, arguments);
                this.dropMove();
            }
        },
        /**
        * @method setXY
        * @description A simple method to set the top and left position from offsets instead of page coordinates
        * @param {Object} node The node to set the position of 
        * @param {Array} xy The Array of left/top position to be set.
        */
        setXY: function(node, xy) {
            var t = parseInt(node.getStyle('top'), 10),
            l = parseInt(node.getStyle('left'), 10),
            pos = node.getStyle('position');

            if (pos === 'static') {
                node.setStyle('position', 'relative');
            }

            // in case of 'auto'
            if (isNaN(t)) { t = 0; }
            if (isNaN(l)) { l = 0; }
            
            node.setStyle('top', (xy[1] + t) + 'px');
            node.setStyle('left', (xy[0] + l) + 'px');
        },
        /**
        * @method cssSizestoObject
        * @description Helper method to use to set the gutter from the attribute setter.
        * @param {String} gutter CSS style string for gutter: '5 0' (sets top and bottom to 5px, left and right to 0px), '1 2 3 4' (top 1px, right 2px, bottom 3px, left 4px)
        * @return {Object} The gutter Object Literal.
        */
        cssSizestoObject: function(gutter) {
            var p = gutter.split(' '),
            g = {
                top: 0,
                bottom: 0,
                right: 0,
                left: 0
            };
            if (p.length) {
                g.top = parseInt(p[0], 10);
                if (p[1]) {
                    g.right = parseInt(p[1], 10);
                } else {
                    g.right = g.top;
                }
                if (p[2]) {
                    g.bottom = parseInt(p[2], 10);
                } else {
                    g.bottom = g.top;
                }
                if (p[3]) {
                    g.left = parseInt(p[3], 10);
                } else if (p[1]) {
                    g.left = g.right;
                } else {
                    g.left = g.top;
                }
            }
            return g;
        },
        /**
        * @method getDrag
        * @description Get a valid Drag instance back from a Node or a selector string, false otherwise
        * @param {String/Object} node The Node instance or Selector string to check for a valid Drag Object
        * @return {Object}
        */
        getDrag: function(node) {
            var drag = false,
                n = Y.Node.get(node);
            if (n instanceof Y.Node) {
                Y.each(this.drags, function(v, k) {
                    if (n.compareTo(v.get('node'))) {
                        drag = v;
                    }
                });
            }
            return drag;
        }
    });

    Y.mix(DDMBase, Y.Base.prototype);

    Y.namespace('DD');
    Y.DD.DDM = DDMBase;
    Y.DD.DDM.init();



}, '@VERSION@' ,{skinnable:false, requires:['node', 'nodeextras', 'base']});
YUI.add('dd-ddm', function(Y) {

    /**
     * 3.x DragDrop Manager - Shim support
     * @module dd-ddm
     * @class DDM
     * @namespace DD
     * @extends Base
     * @constructor
     */
     //TODO Add Event Bubbling??

    Y.mix(Y.DD.DDM, {
        /**
        * @private
        * @property pg
        * @description The shim placed over the screen to track the mousemove event.
        * @type {Node}
        */
        pg: null,
        /**
        * @private
        * @property _debugShim
        * @description Set this to true to set the shims opacity to .5 for debugging it, default: false.
        * @type {Boolean}
        */
        _debugShim: false,
        _activateTargets: function() {},
        _deactivateTargets: function() {},
        startDrag: function() {
            if (this.activeDrag.get('useShim')) {
                this.pg_activate();
                this._activateTargets();
            }
        },
        endDrag: function() {
            this.pg_deactivate();
            this._deactivateTargets();
        },
        /**
        * @private
        * @method pg_deactivate
        * @description Deactivates the shim
        */
        pg_deactivate: function() {
            this.pg.setStyle('display', 'none');
        },
        /**
        * @private
        * @method pg_activate
        * @description Activates the shim
        */
        pg_activate: function() {
            this.pg_size();
            this.pg.setStyles({
                top: 0,
                left: 0,
                display: 'block',
                opacity: ((this._debugShim) ? '.5' : '0'),
                filter: 'alpha(opacity=' + ((this._debugShim) ? '50' : '0') + ')'
            });
        },
        /**
        * @private
        * @method pg_size
        * @description Sizes the shim on: activatation, window:scroll, window:resize
        */
        pg_size: function() {
            if (this.activeDrag) {
                var b = Y.Node.get('body'),
                h = b.get('docHeight'),
                w = b.get('docWidth');
                this.pg.setStyles({
                    height: h + 'px',
                    width: w + 'px'
                });
            }
        },
        /**
        * @private
        * @method _createPG
        * @description Creates the shim and adds it's listeners to it.
        */
        _createPG: function() {
            var pg = Y.Node.create(['div']),
            bd = Y.Node.get('body');
            pg.setStyles({
                top: '0',
                left: '0',
                position: 'absolute',
                zIndex: '9999',
                opacity: '0',
                backgroundColor: 'red',
                display: 'none',
                height: '5px',
                width: '5px'
            });
            if (bd.get('firstChild')) {
                bd.insertBefore(pg, bd.get('firstChild'));
            } else {
                bd.appendChild(pg);
            }
            this.pg = pg;
            this.pg.on('mouseup', this.end, this, true);
            this.pg.on('mousemove', this.move, this, true);
            //TODO
            Y.Event.addListener(window, 'resize', this.pg_size, this, true);
            Y.Event.addListener(window, 'scroll', this.pg_size, this, true);
        }   
    }, true);

    Y.DD.DDM._createPG();    


}, '@VERSION@' ,{skinnable:false, requires:['dd-ddm-base']});
YUI.add('dd-drag', function(Y) {

    /**
     * 3.x DragDrop
     * @class Drag
     * @module dd-drag
     * @namespace DD
     * @extends base
     * @constructor
     */

    var DDM = Y.DD.DDM,
        NODE = 'node',
        DRAG_NODE = 'dragNode',
        OFFSET_HEIGHT = 'offsetHeight',
        OFFSET_WIDTH = 'offsetWidth',        
        MOUSE_UP = 'mouseup',
        MOUSE_DOWN = 'mousedown',
        EV_MOUSE_DOWN = 'drag:mouseDown',
        EV_AFTER_MOUSE_DOWN = 'drag:afterMouseDown',
        EV_REMOVE_HANDLE = 'drag:removeHandle',
        EV_ADD_HANDLE = 'drag:addHandle',
        EV_REMOVE_INVALID = 'drag:removeInvalid',
        EV_ADD_INVALID = 'drag:addInvalid',
        EV_START = 'drag:start',
        EV_END = 'drag:end',
        EV_DRAG = 'drag:drag';

        /*

        */
    
    var Drag = function() {
        Drag.superclass.constructor.apply(this, arguments);

        DDM.regDrag(this);
    };
    Drag.NAME = 'drag';

    Drag.ATTRS = {
        /**
        * @attribute node
        * @description Y.Node instanace to use as the element to initiate a drag operation
        * @type Node
        */
        node: {
            set: function(node) {
                return Y.Node.get(node);
            }
        },
        /**
        * @attribute dragNode
        * @description Y.Node instanace to use as the draggable element, defaults to node
        * @type Node
        */
        dragNode: {
            set: function(node) {
                return Y.Node.get(node);
            }
        },
        /**
        * @attribute offsetNode
        * @description Offset the drag element by the difference in cursor position: default true
        * @type Boolean
        */
        offsetNode: {
            value: true
        },
        /**
        * @attribute clickPixelThresh
        * @description The number of pixels to move to start a drag operation, default is 3.
        * @type Number
        */
        clickPixelThresh: {
            value: DDM.clickPixelThresh
        },
        /**
        * @attribute clickTimeThresh
        * @description The number of milliseconds a mousedown has to pass to start a drag operation, default is 1000.
        * @type Number
        */
        clickTimeThresh: {
            value: DDM.clickTimeThresh
        },
        /**
        * @attribute lock
        * @description Set to lock this drag element so that it can't be dragged: default false.
        * @type Boolean
        */
        lock: {
            value: false,
            set: function(lock) {
                if (lock) {
                    this.get(NODE).addClass('yui-dd-locked');
                } else {
                    this.get(NODE).removeClass('yui-dd-locked');
                }
            }
        },
        /**
        * @attribute data
        * @description A payload holder to store arbitrary data about this drag object, can be used to store any value.
        * @type Mixed
        */
        data: {
            value: false
        },
        /**
        * @attribute move
        * @description If this is false, the drag element will not move with the cursor: default true. Can be used to "resize" the element.
        * @type Boolean
        */
        move: {
            value: true
        },
        /**
        * @attribute useShim
        * @description Use the protective shim on all drag operations: default true. Only works with dd-ddm, not dd-ddm-base.
        * @type Boolean
        */
        useShim: {
            value: true
        },
        /**
        * @attribute activeHandle
        * @description This config option is set by Drag to inform you of which handle fired the drag event (in the case that there are several handles): default false.
        * @type Node
        */
        activeHandle: {
            value: false
        },
        /**
        * @attribute primaryButtonOnly
        * @description By default a drag operation will only begin if the mousedown occurred with the primary mouse button. Setting this to false will allow for all mousedown events to trigger a drag.
        * @type Boolean
        */
        primaryButtonOnly: {
            value: true
        },
        /**
        * @attribute dragging
        * @description This attribute is not meant to be used by the implementor, it is meant to be used as an Event tracker so you can listen for it to change.
        * @type Boolean
        */
        dragging: {
            value: false
        },
        /**
        * @attribute target
        * @description This attribute only works if the dd-drop module has been loaded. It will make this node a drop target as well as draggable.
        * @type Boolean
        */
        target: {
            value: false,
            set: function(config) {
                this._handleTarget(config);
            }
        },
        /**
        * @attribute dragMode
        * @description This attribute only works if the dd-drop module is active. It will make this node a drop target as well as draggable
        * @type Boolean
        */
        dragMode: {
            value: 'default',
            set: function(mode) {
                switch (mode) {
                    case 'point':
                        return 0;
                    case 'intersect':
                        return 1;
                    case 'strict':
                        return 2;
                    case 'default':
                        return -1;
                }
                return 'default';
            }
        },
        /**
        * @attribute groups
        * @description Array of groups to add this drag into.
        * @type Array
        */
        groups: {
            value: ['default'],
            set: function(g) {
                this._groups = {};
                Y.each(g, function(v, k) {
                    this._groups[v] = true;
                }, this);
            }
        }
    };

    Y.extend(Drag, Y.Base, {
        /**
        * @property target
        * @description This will be a reference to the Drop instance associated with this drag if the target: true config attribute is set..
        * @type {Object}
        */
        target: null,
        /**
        * @private
        * @method _handleTarget
        * @description Attribute handler for the target config attribute.
        * @param {Boolean/Object}
        * @return {Boolean/Object}
        */
        _handleTarget: function(config) {
            if (Y.DD.Drop) {
                if (config === false) {
                    if (this.target) {
                        DDM.unregTarget(this.target);
                        this.target = null;
                    }
                    return false;
                } else {
                    if (!Y.Lang.isObject(config)) {
                        config = {};
                    }
                    config.node = this.get(NODE);
                    this.target = new Y.DD.Drop(config);
                }
            } else {
                return false;
            }
        },
        /**
        * @private
        * @property _groups
        * @description Storage Array for the groups this drag belongs to.
        * @type {Array}
        */
        _groups: null,
        /**
        * @private
        * @method _createEvents
        * @description This method creates all the events for this Event Target and publishes them so we get Event Bubbling.
        */
        _createEvents: function() {
            
            this.publish(EV_MOUSE_DOWN, {
                defaultFn: this._handleMouseDown,
                emitFacade: true
            });

            var ev = [
                EV_AFTER_MOUSE_DOWN,
                EV_REMOVE_HANDLE,
                EV_ADD_HANDLE,
                EV_REMOVE_INVALID,
                EV_ADD_INVALID,
                EV_START,
                EV_END,
                EV_DRAG
            ];
            
            Y.each(ev, function(v, k) {
                this.publish(v, {
                    emitFacade: true,
                    preventable: false
                });
            }, this);

            this.addTarget(DDM);
            
        },
        /**
        * @private
        * @property _ev_md
        * @description A private reference to the mousedown DOM event
        * @type {Event}
        */
        _ev_md: null,
        /**
        * @private
        * @property _handles
        * @description A private hash of the valid drag handles
        * @type {Array}
        */
        _handles: null,
        /**
        * @private
        * @property _invalids
        * @description A private hash of the invalid selector strings
        * @type {Array}
        */
        _invalids: null,
        /**
        * @private
        * @property _dragThreshMet
        * @description Private flag to see if the drag threshhold was met
        * @type {Boolean}
        */
        _dragThreshMet: null,
        /**
        * @private
        * @property _fromTimeout
        * @description Flag to determine if the drag operation came from a timeout
        * @type {Boolean}
        */
        _fromTimeout: null,
        /**
        * @private
        * @property _clickTimeout
        * @description Holder for the setTimeout call
        * @type {Boolean}
        */
        _clickTimeout: null,
        /**
        * @property deltaXY
        * @description The offset of the mouse position to the element's position
        * @type {Array}
        */
        deltaXY: null,
        /**
        * @property startXY
        * @description The initial mouse position
        * @type {Array}
        */
        startXY: null,
        /**
        * @property nodeXY
        * @description The initial element position
        * @type {Array}
        */
        nodeXY: null,
        /**
        * @property lastXY
        * @description The position of the element as it's moving (for offset calculations)
        * @type {Array}
        */
        lastXY: null,
        /**
        * @property mouseXY
        * @description The XY coords of the mousemove
        * @type {Array}
        */
        mouseXY: null,
        /**
        * @property region
        * @description A region object associated with this drag, used for checking regions while dragging.
        * @type Object
        */
        region: null,       
        /**
        * @private
        * @method _handleMouseUp
        * @description Handler for the mouseup DOM event
        * @param {Event}
        */
        _handleMouseUp: function(ev) {
            this._fixIEMouseUp();
            if (DDM.activeDrag) {
                DDM.end();
            }
        },
        /** 
        * @private
        * @method _ieSelectFix
        * @description The function we use as the onselectstart handler when we start a drag in Internet Explorer
        */
        _ieSelectFix: function() {
            return false;
        },
        /** 
        * @private
        * @property _ieSelectBack
        * @description We will hold a copy of the current "onselectstart" method on this property, and reset it after we are done using it.
        */
        _ieSelectBack: null,
        _fixIEMouseDown: function() {
            if (Y.UA.ie) {
                this._ieSelectBack = document.body.onselectstart;
                document.body.onselectstart = this._ieSelectFix;
            }           
        },
        _fixIEMouseUp: function() {
            if (Y.UA.ie) {
                document.body.onselectstart = this._ieSelectBack;
            }           
        },
        /**
        * @private
        * @method _handleMouseDownEvent
        * @description Handler for the mousedown DOM event
        * @param {Event}
        */
        _handleMouseDownEvent: function(ev) {
            this.fire(EV_MOUSE_DOWN, { ev: ev });
        },
        /**
        * @private
        * @method _handleMouseDown
        * @description Handler for the mousedown DOM event
        * @param {Event}
        */
        _handleMouseDown: function(e) {
            var ev = e.ev;
            this._dragThreshMet = false;
            this._ev_md = ev;
            
            if (this.get('primaryButtonOnly') && ev.button > 1) {
                return false;
            }
            if (this.validClick(ev)) {
                this._fixIEMouseDown();
                ev.halt();
                this._setStartPosition([ev.pageX, ev.pageY]);

                DDM.activeDrag = this;

                var self = this;
                this._clickTimeout = setTimeout(function() {
                    self._timeoutCheck.call(self);
                }, this.get('clickTimeThresh'));
            }
            this.fire(EV_AFTER_MOUSE_DOWN, { ev: ev });
        },
        /**
        * @method validClick
        * @description Method first checks to see if we have handles, if so it validates the click against the handle. Then if it finds a valid handle, it checks it against the invalid handles list. Returns true if a good handle was used, false otherwise.
        * @param {Event}
        * @return {Boolean}
        */
        validClick: function(ev) {
            var r = false,
            tar = ev.target,
            hTest = null;
            if (this._handles) {
                Y.each(this._handles, function(i, n) {
                    if (Y.Lang.isString(n)) {
                        //Am I this or am I inside this
                        if (tar.test(n + ', ' + n + ' *')) {
                            hTest = n;
                            r = true;
                        }
                    }
                });
            } else {
                if (this.get(NODE).contains(tar) || this.get(NODE).compareTo(tar)) {
                    r = true;
                }
            }
            if (r) {
                if (this._invalids) {
                    Y.each(this._invalids, function(i, n) {
                        if (Y.Lang.isString(n)) {
                            //Am I this or am I inside this
                            if (tar.test(n + ', ' + n + ' *')) {
                                r = false;
                            }
                        }
                    });
                }
            }
            if (r) {
                if (hTest) {
                    var els = ev.originalTarget.queryAll(hTest);
                    els.each(function(n, i) {
                        if (n.contains(tar) || n.compareTo(tar)) {
                            this.set('activeHandle', els.item(i));
                        }
                    }, this);
                } else {
                    this.set('activeHandle', this.get(NODE));
                }
            }
            return r;
        },
        /**
        * @private
        * @method _setStartPosition
        * @description Sets the current position of the Element and calculates the offset
        * @param {Array} xy The XY coords to set the position to.
        */
        _setStartPosition: function(xy) {
            this.startXY = xy;
            
            this.nodeXY = this.get(NODE).getXY();
            this.lastXY = this.nodeXY;

            if (this.get('offsetNode')) {
                this.deltaXY = [(this.startXY[0] - this.nodeXY[0]), (this.startXY[1] - this.nodeXY[1])];
            } else {
                this.deltaXY = [0, 0];
            }
        },
        /**
        * @private
        * @method _timeoutCheck
        * @description The method passed to setTimeout to determine if the clickTimeThreshold was met.
        */
        _timeoutCheck: function() {
            if (!this.get('lock')) {
                this._fromTimeout = true;
                this._dragThreshMet = true;
                this.start();
                this.moveNode([this._ev_md.pageX, this._ev_md.pageY], true);
            }
        },
        /**
        * @method removeHandle
        * @description Remove a Selector added by addHandle
        * @param {String} str The selector for the handle to be removed. 
        * @return {Self}
        */
        removeHandle: function(str) {
            if (this._handles[str]) {
                delete this._handles[str];
                this.fire(EV_REMOVE_HANDLE, { handle: str });
            }
            return this;
        },
        /**
        * @method addHandle
        * @description Add a handle to a drag element. Drag only initiates when a mousedown happens on this element.
        * @param {String} str The selector to test for a valid handle. Must be a child of the element.
        * @return {Self}
        */
        addHandle: function(str) {
            if (!this._handles) {
                this._handles = {};
            }
            if (Y.Lang.isString(str)) {
                this._handles[str] = true;
                this.fire(EV_ADD_HANDLE, { handle: str });
            }
            return this;
        },
        /**
        * @method removeInvalid
        * @description Remove an invalid handle added by addInvalid
        * @param {String} str The invalid handle to remove from the internal list.
        * @return {Self}
        */
        removeInvalid: function(str) {
            if (this._invalids[str]) {
                delete this._handles[str];
                this.fire(EV_REMOVE_INVALID, { handle: str });
            }
            return this;
        },
        /**
        * @method addInvalid
        * @description Add a selector string to test the handle against. If the test passes the drag operation will not continue.
        * @param {String} str The selector to test against to determine if this is an invalid drag handle.
        * @return {Self}
        */
        addInvalid: function(str) {
            if (Y.Lang.isString(str)) {
                this._invalids[str] = true;
                this.fire(EV_ADD_INVALID, { handle: str });
            } else {
            }
            return this;
        },
        /**
        * @private
        * @method initializer
        * @description Internal init handler
        */
        initializer: function() {
            this._invalids = {};

            this._createEvents();
            
            if (!this.get(DRAG_NODE)) {
                this.set(DRAG_NODE, this.get(NODE));
            }
            
            this.get(NODE).addClass('yui-draggable');
            this.get(NODE).on(MOUSE_DOWN, this._handleMouseDownEvent, this, true);
            this.get(NODE).on(MOUSE_UP, this._handleMouseUp, this, true);
            this._dragThreshMet = false;
        },
        /**
        * @private
        * @method start
        * @description Starts the drag operation
        */
        start: function() {
            if (!this.get('lock')) {
                this.set('dragging', true);
                DDM.start(this.deltaXY, [this.get(NODE).get(OFFSET_HEIGHT), this.get(NODE).get(OFFSET_WIDTH)]);
                this.get(NODE).addClass('yui-dd-dragging');
                this.fire(EV_START);
                this.get(DRAG_NODE).on(MOUSE_UP, this._handleMouseUp, this, true);
                
                var xy = this.nodeXY;
                this.region = {
                    '0': xy[0], 
                    '1': xy[1],
                    area: 0,
                    top: xy[1],
                    right: xy[0] + this.get(NODE).get(OFFSET_WIDTH),
                    bottom: xy[1] + this.get(NODE).get(OFFSET_HEIGHT),
                    left: xy[0]
                };
                
            }
        },
        /**
        * @private
        * @method end
        * @description Ends the drag operation
        */
        end: function() {
            clearTimeout(this._clickTimeout);
            this._dragThreshMet = false;
            this._fromTimeout = false;
            if (!this.get('lock') && this.get('dragging')) {
                this.fire(EV_END);
            }
            this.get(NODE).removeClass('yui-dd-dragging');
            this.set('dragging', false);
            this.deltaXY = [0, 0];
            this.get(DRAG_NODE).detach(MOUSE_UP, this._handleMouseUp, this, true);
        },
        /**
        * @private
        * @method _align
        * @description Calculates the offsets and set's the XY that the element will move to.
        * @param {Array} xy The xy coords to align with.
        * @return Array
        * @type {Array}
        */
        _align: function(xy) {
            return [xy[0] - this.deltaXY[0], xy[1] - this.deltaXY[1]];
        },
        /**
        * @private
        * @method move
        * @description This method performs the actual element move.
        * @param {Array} eXY The XY to move the element to, usually comes from the mousemove DOM event.
        * @param {Boolean} noFire If true, the drag:drag event will not fire.
        */
        moveNode: function(eXY, noFire) {
            var xy = this._align(eXY), diffXY = [], diffXY2 = [];

            diffXY[0] = (xy[0] - this.lastXY[0]);
            diffXY[1] = (xy[1] - this.lastXY[1]);

            diffXY2[0] = (xy[0] - this.nodeXY[0]);
            diffXY2[1] = (xy[1] - this.nodeXY[1]);

            if (this.get('move')) {
                DDM.setXY(this.get(DRAG_NODE), diffXY);
            }

            this.region = {
                '0': xy[0], 
                '1': xy[1],
                area: 0,
                top: xy[1],
                right: xy[0] + this.get(NODE).get(OFFSET_WIDTH),
                bottom: xy[1] + this.get(NODE).get(OFFSET_HEIGHT),
                left: xy[0]
            };

            var startXY = this.nodeXY;
            if (!noFire) {
                this.fire(EV_DRAG, {
                    info: {
                        start: startXY,
                        xy: xy,
                        delta: diffXY,
                        offset: diffXY2
                    } 
                });
            }
            
            this.lastXY = xy;
        },
        /**
        * @private
        * @method move
        * @description Fired from DragDropMgr (DDM) on mousemove.
        * @param {Event} ev The mousemove DOM event
        */
        move: function(ev) {
            if (this.get('lock')) {
                return false;
            } else {
                this.mouseXY = [ev.pageX, ev.pageY];
                if (!this._dragThreshMet) {
                        var diffX = Math.abs(this.startXY[0] - ev.pageX);
                        var diffY = Math.abs(this.startXY[1] - ev.pageY);
                        if (diffX > this.get('clickPixelThresh') || diffY > this.get('clickPixelThresh')) {
                            this._dragThreshMet = true;
                            this.start();
                            this.moveNode([ev.pageX, ev.pageY]);
                        }
                
                } else {
                    clearTimeout(this._clickTimeout);
                    this.moveNode([ev.pageX, ev.pageY]);
                }
            }
        },
        /**
        * @private
        * @method destructor
        * @description Lifecycle destructor, unreg the drag from the DDM and remove listeners
        * @return {Self}
        */
        destructor: function() {
            DDM.unregDrag(this);
            this.get(NODE).detach(MOUSE_DOWN, this._handleMouseDownEvent, this, true);
            this.get(NODE).detach(MOUSE_UP, this._handleMouseUp, this, true);
        },
        /**
        * @method toString
        * @description General toString method for logging
        * @return String name for the object
        */
        toString: function() {
            return 'Drag';
        }
    });
    Y.namespace('DD');    
    Y.DD.Drag = Drag;


}, '@VERSION@' ,{skinnable:false, requires:['dd-ddm-base']});
YUI.add('dd-proxy', function(Y) {

    /**
     * 3.x DragDrop
     * @class Proxy
     * @module dd-proxy
     * @namespace DD
     * @extends Drag
     * @constructor
     */
    var DDM = Y.DD.DDM,
        NODE = 'node',
        DRAG_NODE = 'dragNode',
        FIRST_CHILD = 'firstChild',
        PROXY = 'proxy';
     

    var Proxy = function() {
        Proxy.superclass.constructor.apply(this, arguments);

    };

    Proxy.ATTRS = {
        /**
        * @attribute moveOnEnd
        * @description Move the original node at the end of the drag. Default: true
        * @type Boolean
        */
        moveOnEnd: {
            value: true
        },
        /**
        * @attribute resizeFrame
        * @description Make the Proxy node assume the size of the original node. Default: true
        * @type Boolean
        */
        resizeFrame: {
            value: true
        },
        /**
        * @attribute proxy
        * @description Make this Draggable instance a Proxy instance. Default: false
        * @type Boolean
        */
        proxy: {
            writeOnce: true,
            value: false
        },        
        /**
        * @attribute positionProxy
        * @description Make the Proxy node appear in the same place as the original node. Default: true
        * @type Boolean
        */
        positionProxy: {
            value: true
        },
        /**
        * @attribute borderStyle
        * @description The default border style for the border of the proxy. Default: 1px solid #808080
        * @type Boolean
        */
        borderStyle: {
            value: '1px solid #808080'
        }
    };

    var proto = {
        /**
        * @private
        * @method _createFrame
        * @description Create the proxy element if it doesn't already exist and set the DD.DDM._proxy value
        */
        _createFrame: function() {
            if (!DDM._proxy) {
                DDM._proxy = true;
                var p = Y.Node.create(['div']),
                bd = Y.Node.get('body');

                p.setStyles({
                    position: 'absolute',
                    display: 'none',
                    border: this.get('borderStyle')
                });

                if (bd.get(FIRST_CHILD)) {
                    bd.insertBefore(p, bd.get(FIRST_CHILD));
                } else {
                    bd.appendChild(p);
                }
                p.set('id', Y.stamp(p));
                p.addClass('dd-proxy');
                DDM._proxy = p;
            }
        },
        /**
        * @private
        * @method _setFrame
        * @description If resizeProxy is set to true (default) it will resize the proxy element to match the size of the Drag Element.
        * If positionProxy is set to true (default) it will position the proxy element in the same location as the Drag Element.
        */
        _setFrame: function() {
            var n = this.get(NODE);
            if (this.get('resizeFrame')) {
                DDM._proxy.setStyles({
                    height: n.get('clientHeight') + 'px',
                    width: n.get('clientWidth') + 'px'
                });
            }
            this.get(DRAG_NODE).setStyles({
                visibility: 'hidden',
                display: 'block',
                border: this.get('borderStyle')
            });

            if (this.get('positionProxy')) {
                this.get(DRAG_NODE).setXY(this.nodeXY);
            }
            this.get(DRAG_NODE).setStyle('visibility', 'visible');
        },
        /**
        * @private
        * @method initializer
        * @description Lifecycle method
        */
        initializer: function() {
            if (this.get(PROXY)) {
                this._createFrame();
            }
        },
        /**
        * @private
        * @method start
        * @description Starts the drag operation and sets the dragNode config option.
        */       
        start: function() {
            if (!this.get('lock')) {
                if (this.get(PROXY)) {
                    if (this.get(DRAG_NODE).compareTo(this.get(NODE))) {
                        this.set(DRAG_NODE, DDM._proxy);
                    }
                }
            }
            Proxy.superclass.start.apply(this);
            if (this.get(PROXY)) {
                this._setFrame();
            }
        },
        /**
        * @private
        * @method end
        * @description Ends the drag operation, if moveOnEnd is set it will position the Drag Element to the new location of the proxy.
        */        
        end: function() {
            if (this.get(PROXY)) {
                if (this.get('moveOnEnd')) {
                    this.get(NODE).setXY(this.lastXY);
                }
                this.get(DRAG_NODE).setStyle('display', 'none');
            }
            Proxy.superclass.end.apply(this);
        }
    };
    //Extend DD.Drag
    Y.extend(Proxy, Y.DD.Drag, proto);
    //Set this new class as DD.Drag for other extensions
    Y.DD.Drag = Proxy;


}, '@VERSION@' ,{skinnable:false, requires:['dd-drag']});
YUI.add('dd-plugin', function(Y) {

       /**
        * 3.x DragDrop
        * @class DragPlugin
        * @module dd-plugin
        * @namespace Plugin
        * @extends drag
        * @constructor
        */

        Y.Plugin = Y.Plugin || {};

        var Drag = function(config) {
            config.node = config.owner;
            Drag.superclass.constructor.apply(this, arguments);
        };

        Drag.NAME = "dd-plugin";
        Drag.NS = "dd";


        Y.extend(Drag, Y.DD.Drag);
        Y.Plugin.Drag = Drag;



}, '@VERSION@' ,{optional:['dd-constrain', 'dd-proxy'], requires:['dd-drag'], skinnable:false});


YUI.add('dd-drag-proxy', function(Y){}, '@VERSION@' ,{skinnable:false, use:['dd-ddm-base', 'dd-ddm', 'dd-drag', 'dd-proxy', 'dd-plugin']});

