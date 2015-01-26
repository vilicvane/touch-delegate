/*
    Touch Delegate
    https://github.com/vilic/touch-delegate
  
    by VILIC VANE
    https://github.com/vilic
  
    MIT License
*/
var TouchDelegate;
(function (TouchDelegate) {
    var Utils;
    (function (Utils) {
        Utils.hop = Object.prototype.hasOwnProperty;
        function clone(src) {
            var dest = (src instanceof Array ? [] : {});
            for (var key in src) {
                var value = src[key];
                switch (value && value.constructor) {
                    case Object:
                    case Array:
                        dest[key] = clone(value);
                        break;
                    default:
                        dest[key] = value;
                        break;
                }
            }
            return dest;
        }
        Utils.clone = clone;
        var StringHash = (function () {
            function StringHash() {
                this._map = {};
            }
            Object.defineProperty(StringHash.prototype, "keys", {
                get: function () {
                    return Object.keys(this._map);
                },
                enumerable: true,
                configurable: true
            });
            StringHash.prototype.exists = function (key) {
                return Utils.hop.call(this._map, key);
            };
            StringHash.prototype.set = function (key) {
                this._map[key] = null;
            };
            StringHash.prototype.unset = function (key) {
                delete this._map[key];
            };
            StringHash.prototype.clear = function () {
                this._map = {};
            };
            return StringHash;
        })();
        Utils.StringHash = StringHash;
        var StringMap = (function () {
            function StringMap() {
                this._map = {};
            }
            Object.defineProperty(StringMap.prototype, "map", {
                get: function () {
                    return clone(this._map);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StringMap.prototype, "keys", {
                get: function () {
                    return Object.keys(this._map);
                },
                enumerable: true,
                configurable: true
            });
            StringMap.prototype.exists = function (key) {
                return Utils.hop.call(this._map, key);
            };
            StringMap.prototype.get = function (key, defaultValue) {
                if (Utils.hop.call(this._map, key)) {
                    return this._map[key];
                }
                else if (arguments.length > 1) {
                    this._map[key] = defaultValue;
                    return defaultValue;
                }
                else {
                    return undefined;
                }
            };
            StringMap.prototype.set = function (key, value) {
                this._map[key] = value;
            };
            StringMap.prototype.remove = function (key) {
                if (typeof key == 'function') {
                    var filter = key;
                    var map = this._map;
                    var keys = Object.keys(map);
                    keys.forEach(function (key) {
                        if (filter(key, map[key])) {
                            delete map[key];
                        }
                    });
                }
                else {
                    delete this._map[key];
                }
            };
            StringMap.prototype.clear = function () {
                this._map = {};
            };
            return StringMap;
        })();
        Utils.StringMap = StringMap;
    })(Utils = TouchDelegate.Utils || (TouchDelegate.Utils = {}));
    function getDistance(pointA, pointB) {
        var diffX = pointA.x - pointB.x;
        var diffY = pointA.y - pointB.y;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }
    TouchDelegate.getDistance = getDistance;
    var TouchSequence = (function () {
        function TouchSequence(identifier) {
            this.identifier = identifier;
            this.touchPoints = [];
        }
        Object.defineProperty(TouchSequence.prototype, "first", {
            get: function () {
                return this.touchPoints[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "last", {
            get: function () {
                var points = this.touchPoints;
                return points[points.length - 1];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "end", {
            get: function () {
                var point = this.last;
                return !!point && point.isEnd;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "x", {
            get: function () {
                var point = this.last;
                if (point) {
                    return point.x;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "y", {
            get: function () {
                var point = this.last;
                if (point) {
                    return point.y;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "diffX", {
            get: function () {
                var first = this.first;
                var last = this.last;
                if (first) {
                    return last.x - first.x;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "diffY", {
            get: function () {
                var first = this.first;
                var last = this.last;
                if (first) {
                    return last.y - first.y;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "lastDiffX", {
            get: function () {
                var points = this.touchPoints;
                var pointA = points[points.length - 2];
                var pointB = points[points.length - 1];
                if (pointA) {
                    return pointB.x - pointA.x;
                }
                else {
                    return 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "lastDiffY", {
            get: function () {
                var points = this.touchPoints;
                var pointA = points[points.length - 2];
                var pointB = points[points.length - 1];
                if (pointA) {
                    return pointB.y - pointA.y;
                }
                else {
                    return 0;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "slope", {
            get: function () {
                return this.diffY / this.diffX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "lastSlope", {
            get: function () {
                return this.lastDiffY / this.lastDiffX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "velocity", {
            get: function () {
                var points = this.touchPoints;
                var pointA = points[points.length - 1];
                if (points.length < 2) {
                    return {
                        x: 0,
                        y: 0,
                        speed: 0
                    };
                }
                var pointB = points.length < 3 || !pointA.isEnd ? points[points.length - 2] : points[points.length - 3];
                var duration = pointB.time - pointA.time;
                return {
                    x: (pointB.x - pointA.x) / duration,
                    y: (pointB.y - pointA.y) / duration,
                    speed: getDistance(pointB, pointA) / (pointB.time - pointA.time)
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "timeLasting", {
            get: function () {
                var first = this.first;
                var last = this.last;
                return (this.end ? last.time : Date.now()) - first.time;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchSequence.prototype, "maxRadius", {
            get: function () {
                var points = this.touchPoints;
                var firstPoint = points[0];
                var max = 0;
                for (var i = 1; i < points.length; i++) {
                    var radius = getDistance(firstPoint, points[i]);
                    if (radius > max) {
                        max = radius;
                    }
                }
                return max;
            },
            enumerable: true,
            configurable: true
        });
        TouchSequence.prototype.add = function (point) {
            this.touchPoints.push(point);
        };
        return TouchSequence;
    })();
    TouchDelegate.TouchSequence = TouchSequence;
    var TouchInfo = (function () {
        function TouchInfo() {
            this.dataMap = new Utils.StringMap();
            this.sequences = [];
            this.activeSequenceMap = new Utils.StringMap();
        }
        Object.defineProperty(TouchInfo.prototype, "start", {
            get: function () {
                return !this.end && this.sequences.length == 1 && this.sequences[0].touchPoints.length == 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchInfo.prototype, "end", {
            get: function () {
                return !this.activeSequenceMap.keys.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TouchInfo.prototype, "timeLasting", {
            get: function () {
                var sequences = this.sequences;
                if (!sequences.length) {
                    return 0;
                }
                var firstSequence = sequences[0];
                var start = firstSequence.first.time;
                if (this.end) {
                    var end = 0;
                    sequences.forEach(function (sequence) {
                        end = Math.max(end, sequence.last.time);
                    });
                    return end - start;
                }
                else {
                    return Date.now() - start;
                }
            },
            enumerable: true,
            configurable: true
        });
        return TouchInfo;
    })();
    TouchDelegate.TouchInfo = TouchInfo;
    var Delegate = (function () {
        function Delegate(selector, preventDefault, parent) {
            var _this = this;
            if (preventDefault === void 0) { preventDefault = false; }
            if (parent === void 0) { parent = window.document; }
            this._delegateItems = [];
            this._addEventListeners = (function () {
                if (navigator.pointerEnabled || navigator.msPointerEnabled) {
                    var typePointerDown;
                    if (navigator.pointerEnabled) {
                        typePointerDown = 'pointerdown';
                    }
                    else {
                        typePointerDown = 'MSPointerDown';
                    }
                    return function (selector, preventDefault) {
                        var onpointerdown = function (e) {
                            Delegate._triggerTarget = e.target;
                            Delegate._currentDelegateItems = Delegate._currentDelegateItems.concat(_this._delegateItems);
                            if (preventDefault) {
                                e.preventDefault();
                            }
                        };
                        var $parent = _this._$parent;
                        if (selector == null) {
                            _this._$target.on(typePointerDown, onpointerdown);
                        }
                        else {
                            $parent.delegate(selector, typePointerDown, onpointerdown);
                        }
                    };
                }
                else {
                    return function (selector, preventDefault) {
                        var ontouchstart = function (e) {
                            Delegate._triggerTarget = e.target;
                            Delegate._currentDelegateItems = Delegate._currentDelegateItems.concat(_this._delegateItems);
                            if (preventDefault) {
                                e.preventDefault();
                            }
                        };
                        var $parent = _this._$parent;
                        if (selector == null) {
                            _this._$target.on('touchstart', ontouchstart);
                        }
                        else {
                            $parent.delegate(selector, 'touchstart', ontouchstart);
                        }
                    };
                }
            })();
            this._$parent = $(parent);
            this._$target = $(selector);
            this._addEventListeners(typeof selector == 'string' ? selector : null, preventDefault);
        }
        Object.defineProperty(Delegate.prototype, "$target", {
            get: function () {
                return $(this._$target);
            },
            enumerable: true,
            configurable: true
        });
        Delegate._pointerDown = function (id, x, y) {
            var idStr = id.toString();
            var info = Delegate._touchInfo;
            var sequenceMap = info.activeSequenceMap;
            var sequence = sequenceMap.get(idStr);
            var isStart;
            if (sequence) {
                isStart = false;
            }
            else {
                isStart = true;
                sequence = new TouchSequence(id);
                sequenceMap.set(idStr, sequence);
                info.sequences.push(sequence);
            }
            sequence.add({
                x: x,
                y: y,
                isStart: isStart,
                isEnd: false,
                time: Date.now()
            });
            Delegate._trigger();
        };
        Delegate._pointerMove = function (id, x, y) {
            var idStr = id.toString();
            var info = Delegate._touchInfo;
            var sequencesMap = info.activeSequenceMap;
            var sequence = sequencesMap.get(idStr);
            if (!sequence) {
                return;
            }
            sequence.add({
                x: x,
                y: y,
                isStart: false,
                isEnd: false,
                time: Date.now()
            });
            Delegate._trigger();
        };
        Delegate._pointerUp = function (id) {
            var idStr = id.toString();
            var info = Delegate._touchInfo;
            var sequencesMap = info.activeSequenceMap;
            var sequence = sequencesMap.get(idStr);
            if (!sequence) {
                return;
            }
            var points = sequence.touchPoints;
            var last = points[points.length - 1];
            sequence.add({
                x: last.x,
                y: last.y,
                isStart: false,
                isEnd: true,
                time: Date.now()
            });
            sequencesMap.remove(idStr);
            Delegate._trigger();
            if (!sequencesMap.keys.length) {
                info.sequences.length = 0;
                info.dataMap.clear();
                Delegate._triggerTarget = null;
                Delegate._currentDelegateItems = [];
                Delegate._timeoutIds.forEach(function (id) { return clearTimeout(id); });
                Delegate._timeoutIds.length = 0;
                Delegate._stopAll = false;
                Delegate._stopPropagationHash.clear();
            }
        };
        Delegate.prototype._insert = function (item) {
            var items = this._delegateItems;
            var i;
            for (i = items.length - 1; i >= 0; i--) {
                if (items[i].priority < item.priority) {
                    break;
                }
            }
            items.splice(i + 1, 0, item);
        };
        Delegate._trigger = function (triggerItem) {
            var info = Delegate._touchInfo;
            Delegate._currentDelegateItems = Delegate._currentDelegateItems.filter(function (item) {
                if (triggerItem && triggerItem != item) {
                    return true;
                }
                var id = item.id;
                var identifier = item.identifier;
                var identifierName = identifier.name;
                if (Delegate._stopAll || Delegate._stopPropagationHash.exists(identifierName)) {
                    return false;
                }
                var dataMap = info.dataMap;
                var identified = dataMap.exists(id);
                var data = dataMap.get(id);
                var result = identifier.identify(info, identified, data);
                if (!result) {
                    return true;
                }
                var match;
                if (result.identified) {
                    match = result.match;
                    data = result.data;
                    dataMap.set(id, data);
                    if (identified) {
                        if (match != null) {
                            match = true;
                        }
                    }
                    else {
                        identified = true;
                    }
                }
                else if (typeof result.timeout == 'number') {
                    var timeoutId = setTimeout(function () {
                        Delegate._trigger(item);
                    }, result.timeout);
                    Delegate._timeoutIds.push(timeoutId);
                    return true;
                }
                if (identified) {
                    if (match) {
                        var eventData = {
                            target: Delegate._triggerTarget,
                            touch: info,
                            stopPropagation: result.end !== false ? function (stopAll) {
                                if (stopAll) {
                                    Delegate._stopAll = true;
                                }
                                else {
                                    Delegate._stopPropagationHash.set(identifier.name);
                                }
                            } : function (stopAll) {
                                if (stopAll) {
                                    Delegate._stopAll = true;
                                }
                                else {
                                    throw new Error('can not call stopPropagation on a touch delegate event not marked as end');
                                }
                            }
                        };
                        if (data) {
                            $.extend(eventData, data);
                        }
                        item.listener(eventData);
                    }
                    if (!match || result.end !== false) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return true;
                }
            });
        };
        Delegate.prototype.add = function (identifier, listener, priority) {
            if (priority === void 0) { priority = 0; }
            this._insert({
                id: (Delegate._added++).toString(),
                identifier: identifier,
                listener: listener,
                priority: priority
            });
        };
        Delegate.prototype.delegate = function (identifier, selector, listener, priority) {
            var _this = this;
            if (priority === void 0) { priority = 0; }
            this._insert({
                id: (Delegate._added++).toString(),
                identifier: identifier,
                listener: function (event) {
                    var $target = $(event.target);
                    var target;
                    if ($target.is(selector)) {
                        target = $target[0];
                    }
                    else {
                        target = $target.closest(selector, _this._$target[0])[0];
                    }
                    if (target) {
                        event.target = target;
                        listener(event);
                    }
                },
                priority: priority
            });
        };
        Delegate._added = 0;
        Delegate._stopAll = false;
        Delegate._stopPropagationHash = new Utils.StringHash();
        Delegate._touchInfo = new TouchInfo();
        Delegate._currentDelegateItems = [];
        Delegate._ = (function () {
            if (navigator.pointerEnabled || navigator.msPointerEnabled) {
                var typePointerDown;
                var typePointerMove;
                var typePointerUp;
                var typePointerCancel;
                if (navigator.pointerEnabled) {
                    typePointerDown = 'pointerdown';
                    typePointerMove = 'pointermove';
                    typePointerUp = 'pointerup pointercancel';
                }
                else {
                    typePointerDown = 'MSPointerDown';
                    typePointerMove = 'MSPointerMove';
                    typePointerUp = 'MSPointerUp MSPointerCancel';
                }
                $(document).on(typePointerDown, function (e) {
                    var oe = e.originalEvent;
                    Delegate._pointerDown(oe.pointerId, oe.clientX, oe.clientY);
                    //e.stopPropagation();
                    //e.preventDefault();
                }).on(typePointerMove, function (e) {
                    var oe = e.originalEvent;
                    Delegate._pointerMove(oe.pointerId, oe.clientX, oe.clientY);
                    //e.preventDefault();
                }).on(typePointerUp, function (e) {
                    var oe = e.originalEvent;
                    Delegate._pointerUp(oe.pointerId);
                    //e.preventDefault();
                });
            }
            else {
                $(document).on('touchstart', function (e) {
                    var oe = e.originalEvent;
                    var touches = oe.changedTouches;
                    for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        Delegate._pointerDown(touch.identifier, touch.clientX, touch.clientY);
                    }
                    //e.stopPropagation();
                    //e.preventDefault();
                }).on('touchmove', function (e) {
                    var oe = e.originalEvent;
                    var touches = oe.changedTouches;
                    for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        Delegate._pointerMove(touch.identifier, touch.clientX, touch.clientY);
                    }
                    //e.preventDefault();
                }).on('touchend touchcancel', function (e) {
                    var oe = e.originalEvent;
                    var touches = oe.changedTouches;
                    for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        Delegate._pointerUp(touch.identifier);
                    }
                    //e.preventDefault();
                });
            }
        })();
        Delegate._timeoutIds = [];
        return Delegate;
    })();
    TouchDelegate.Delegate = Delegate;
})(TouchDelegate || (TouchDelegate = {}));
/*
    Touch Delegate
    https://github.com/vilic/touch-delegate
  
    by VILIC VANE
    https://github.com/vilic
  
    MIT License
*/
var TouchDelegate;
(function (TouchDelegate) {
    var Identifier = (function () {
        function Identifier(name, identify) {
            this.name = name;
            this.identify = identify;
        }
        return Identifier;
    })();
    TouchDelegate.Identifier = Identifier;
    var Identifier;
    (function (Identifier) {
        Identifier.tap = new Identifier('tap', function (info) {
            var sequences = info.sequences;
            var sequence = sequences[0];
            if (sequences.length > 1 || sequence.timeLasting > 500 || sequence.maxRadius > 5) {
                return {
                    identified: true,
                    match: false,
                    end: true
                };
            }
            if (sequence.end) {
                return {
                    identified: true,
                    match: true,
                    end: true
                };
            }
        });
        Identifier.hold = new Identifier('hold', function (info) {
            var sequences = info.sequences;
            var sequence = sequences[0];
            if (sequences.length > 1 || sequence.maxRadius > 3) {
                return {
                    identified: true,
                    match: false,
                    end: true
                };
            }
            if (sequence.end) {
                return {
                    identified: true,
                    match: false,
                    end: true
                };
            }
            if (sequence.timeLasting >= 1000) {
                return {
                    identified: true,
                    match: true,
                    end: true
                };
            }
            if (sequence.touchPoints.length == 1) {
                return {
                    identified: false,
                    timeout: 1000
                };
            }
        });
        Identifier.free = new Identifier('free', function (info) {
            var sequence = info.sequences[0];
            return {
                identified: true,
                match: true,
                end: false,
                data: {
                    diffX: sequence.diffX,
                    diffY: sequence.diffY,
                    x: sequence.x,
                    y: sequence.y
                }
            };
        });
        Identifier.slideX = new Identifier('slide-x', function (info, identified) {
            var sequences = info.sequences;
            var sequence = sequences[0];
            var match = identified;
            if (!identified && sequence.maxRadius > 2) {
                identified = true;
                if (Math.abs(sequence.slope) < 1 && sequences.length == 1) {
                    match = true;
                }
            }
            return {
                identified: identified,
                match: match,
                end: false,
                data: {
                    diffX: sequence.diffX
                }
            };
        });
        Identifier.slideY = new Identifier('slide-y', function (info, identified) {
            var sequences = info.sequences;
            var sequence = sequences[0];
            var match = identified;
            if (!identified && sequence.maxRadius > 2) {
                identified = true;
                if (Math.abs(sequence.slope) > 1 && sequences.length == 1) {
                    match = true;
                }
            }
            return {
                identified: identified,
                match: match,
                end: false,
                data: {
                    diffY: sequence.diffY
                }
            };
        });
        Identifier.polylineAfterSlideY = new Identifier('polyline-after-slide-y', function (info, identified, data) {
            var sequences = info.sequences;
            var sequence = sequences[0];
            var match = identified;
            if (!identified && sequence.maxRadius > 2) {
                identified = true;
                if (Math.abs(sequence.slope) > 1 && sequences.length == 1) {
                    match = true;
                }
            }
            var lastSlope = Math.abs(sequence.lastSlope);
            if (!data) {
                data = {
                    changedAxis: 'y',
                    diffX: 0,
                    diffY: 0
                };
            }
            if (lastSlope > 1) {
                // y
                data.changedAxis = 'y';
                data.diffY += sequence.lastDiffY;
            }
            else if (lastSlope < 1) {
                // x
                data.changedAxis = 'x';
                data.diffX += sequence.lastDiffX;
            }
            else if (data.changedAxis == 'y') {
                data.diffY += sequence.lastDiffY;
            }
            else {
                data.diffX += sequence.lastDiffX;
            }
            return {
                identified: identified,
                match: match,
                end: false,
                data: data
            };
        });
    })(Identifier = TouchDelegate.Identifier || (TouchDelegate.Identifier = {}));
})(TouchDelegate || (TouchDelegate = {}));
//# sourceMappingURL=touch-delegate.js.map