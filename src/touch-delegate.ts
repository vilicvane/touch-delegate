/*
    Touch Delegate
    https://github.com/vilic/touch-delegate
  
    by VILIC VANE
    https://github.com/vilic
  
    MIT License
*/

interface Touch {
    identifier: number;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    radiusX: number;
    radiusY: number;
    rotationAngle: number;
    force: number;
    target: Element;
}

interface TouchList {
    [index: number]: Touch;
    length: number;

    item(index: number): Touch;
    identifiedTouch(id: number): Touch;
}

interface TouchEvent extends Event {
    altKey: boolean;
    changedTouches: TouchList;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    targetTouches: TouchList;
    touches: TouchList;
}

module TouchDelegate {
    export interface IDictionary<T> {
        [key: string]: T;
    }

    export module Utils {
        export var hop = Object.prototype.hasOwnProperty;

        export function clone<T extends {}>(src: T): T {
            var dest: T = <any>(src instanceof Array ? [] : {});

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

        export class StringHash {
            private _map: IDictionary<void> = {};

            get keys(): string[] {
                return Object.keys(this._map);
            }

            exists(key: string): boolean {
                return hop.call(this._map, key);
            }

            set(key: string) {
                this._map[key] = null;
            }

            unset(key: string) {
                delete this._map[key];
            }

            clear() {
                this._map = {};
            }
        }

        export class StringMap<T> {
            private _map: IDictionary<T> = {};

            get map(): IDictionary<T> {
                return clone(this._map);
            }

            get keys(): string[] {
                return Object.keys(this._map);
            }

            exists(key: string): boolean {
                return hop.call(this._map, key);
            }

            get(key: string, defaultValue?: T): T {
                if (hop.call(this._map, key)) {
                    return this._map[key];
                } else if (arguments.length > 1) {
                    this._map[key] = defaultValue;
                    return defaultValue;
                } else {
                    return undefined;
                }
            }

            set(key: string, value: T) {
                this._map[key] = value;
            }

            remove(key: string);
            remove(filter: (key: string, value: T) => boolean);
            remove(key: any) {
                if (typeof key == 'function') {
                    var filter: (key: string, value: T) => boolean = key;
                    var map = this._map;

                    var keys = Object.keys(map);

                    keys.forEach(key => {
                        if (filter(key, map[key])) {
                            delete map[key];
                        }
                    });

                } else {
                    delete this._map[key];
                }
            }

            clear() {
                this._map = {};
            }
        }
    }

    export interface IDelegateEvent {
        //changedSequences: TouchSequence[];
        target: EventTarget;
        touch: TouchInfo;
        stopPropagation: (stopAll?: boolean) => void;
    }

    export interface ITouchEventPoint {
        x: number;
        y: number;
        time: number;
        isStart: boolean;
        isEnd: boolean;
    }

    export interface IPoint {
        x: number;
        y: number;
    }

    export interface IVelocity {
        x: number;
        y: number;
        speed: number;
    }

    export function getDistance(pointA: IPoint, pointB: IPoint) {
        var diffX = pointA.x - pointB.x;
        var diffY = pointA.y - pointB.y;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    export class TouchSequence {
        touchPoints: ITouchEventPoint[] = [];

        constructor(public identifier: number) { }

        get first(): ITouchEventPoint {
            return this.touchPoints[0];
        }

        get last(): ITouchEventPoint {
            var points = this.touchPoints;
            return points[points.length - 1];
        }

        get end(): boolean {
            var point = this.last;
            return !!point && point.isEnd;
        }

        get x(): number {
            var point = this.last;
            if (point) {
                return point.x;
            }
        }

        get y(): number {
            var point = this.last;
            if (point) {
                return point.y;
            }
        }

        get diffX(): number {
            var first = this.first;
            var last = this.last;
            if (first) {
                return last.x - first.x;
            }
        }

        get diffY(): number {
            var first = this.first;
            var last = this.last;
            if (first) {
                return last.y - first.y;
            }
        }

        get lastDiffX(): number {
            var points = this.touchPoints;

            var pointA = points[points.length - 2];
            var pointB = points[points.length - 1];

            if (pointA) {
                return pointB.x - pointA.x;
            } else {
                return 0;
            }
        }

        get lastDiffY(): number {
            var points = this.touchPoints;

            var pointA = points[points.length - 2];
            var pointB = points[points.length - 1];

            if (pointA) {
                return pointB.y - pointA.y;
            } else {
                return 0;
            }
        }

        get slope(): number { 
            return this.diffY / this.diffX;
        }

        get lastSlope(): number {
            return this.lastDiffY / this.lastDiffX;
        }

        get velocity(): IVelocity {
            var points = this.touchPoints;

            var pointA = points[points.length - 1];

            if (points.length < 2) {
                return {
                    x: 0,
                    y: 0,
                    speed: 0
                };
            }

            var pointB = points.length < 3 || !pointA.isEnd ?
                points[points.length - 2] : points[points.length - 3];
            
            var duration = pointB.time - pointA.time;

            return {
                x: (pointB.x - pointA.x) / duration,
                y: (pointB.y - pointA.y) / duration,
                speed: getDistance(pointB, pointA) / (pointB.time - pointA.time)
            };
        }

        get timeLasting() {
            var first = this.first;
            var last = this.last;
            return (this.end ? last.time : Date.now()) - first.time;
        }

        get maxRadius() {
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
        }

        add(point: ITouchEventPoint) {
            this.touchPoints.push(point);
        }
    }

    export class TouchInfo {
        dataMap = new Utils.StringMap<any>();
        sequences: TouchSequence[] = [];
        activeSequenceMap = new Utils.StringMap<TouchSequence>();

        get start(): boolean {
            return !this.end && this.sequences.length == 1 && this.sequences[0].touchPoints.length == 1;
        }

        get end(): boolean {
            return !this.activeSequenceMap.keys.length;
        }

        get timeLasting(): number {
            var sequences = this.sequences;
            if (!sequences.length) {
                return 0;
            }

            var firstSequence = sequences[0];
            var start = firstSequence.first.time;

            if (this.end) {
                var end = 0;
                sequences.forEach(sequence => {
                    end = Math.max(end, sequence.last.time);
                });
                return end - start;
            } else {
                return Date.now() - start;
            }
        }
    }

    export interface IDelegateItem {
        id: string;
        identifier: Identifier;
        listener: (event: IDelegateEvent) => void;
        priority: number;
    }

    export class Delegate {
        private static _added = 0;
        private static _stopAll = false;
        private static _stopPropagationHash = new Utils.StringHash();
        private static _touchInfo = new TouchInfo();

        private _$target: JQuery;
        get $target(): JQuery {
            return $(this._$target);
        }

        private _$parent: JQuery;

        private static _triggerTarget: EventTarget;
        private static _currentDelegateItems: IDelegateItem[] = [];
        private _delegateItems: IDelegateItem[] = [];

        private _addEventListeners = (() => {
            if (navigator.pointerEnabled || navigator.msPointerEnabled) {
                var typePointerDown: string;

                if (navigator.pointerEnabled) {
                    typePointerDown = 'pointerdown';
                } else {
                    typePointerDown = 'MSPointerDown';
                }

                return (selector: string, preventDefault: boolean) => {
                    var onpointerdown = (e: JQueryEventObject) => {
                        Delegate._triggerTarget = e.target;
                        Delegate._currentDelegateItems = Delegate._currentDelegateItems.concat(this._delegateItems);
                        if (preventDefault) {
                            e.preventDefault();
                        }
                    };

                    var $parent = this._$parent;

                    if (selector == null) {
                        this._$target
                            .on(typePointerDown, onpointerdown);
                    } else {
                        $parent
                            .delegate(selector, typePointerDown, onpointerdown);
                    }
                };
            } else {
                return (selector: string, preventDefault: boolean) => {
                    var ontouchstart = (e: JQueryEventObject) => {
                        Delegate._triggerTarget = e.target;
                        Delegate._currentDelegateItems = Delegate._currentDelegateItems.concat(this._delegateItems);
                        if (preventDefault) {
                            e.preventDefault();
                        }
                    };

                    var $parent = this._$parent;

                    if (selector == null) {
                        this._$target
                            .on('touchstart', ontouchstart);
                    } else {
                        $parent
                            .delegate(selector, 'touchstart', ontouchstart);
                    }
                };
            }
        })();

        private static _ = (() => {
            if (navigator.pointerEnabled || navigator.msPointerEnabled) {
                var typePointerDown: string;
                var typePointerMove: string;
                var typePointerUp: string;
                var typePointerCancel: string;

                if (navigator.pointerEnabled) {
                    typePointerDown = 'pointerdown';
                    typePointerMove = 'pointermove';
                    typePointerUp = 'pointerup pointercancel';
                } else {
                    typePointerDown = 'MSPointerDown';
                    typePointerMove = 'MSPointerMove';
                    typePointerUp = 'MSPointerUp MSPointerCancel';
                }

                $(document)
                    .on(typePointerDown, (e: JQueryEventObject) => {
                        var oe: PointerEvent = <any>e.originalEvent;
                        Delegate._pointerDown(oe.pointerId, oe.clientX, oe.clientY);
                        //e.stopPropagation();
                        //e.preventDefault();
                    })
                    .on(typePointerMove, e => {
                        var oe: PointerEvent = <any>e.originalEvent;
                        Delegate._pointerMove(oe.pointerId, oe.clientX, oe.clientY);
                        //e.preventDefault();
                    })
                    .on(typePointerUp, e => {
                        var oe: PointerEvent = <any>e.originalEvent;
                        Delegate._pointerUp(oe.pointerId);
                        //e.preventDefault();
                    });
            } else {
                $(document)
                    .on('touchstart', (e: JQueryEventObject) => {
                        var oe: TouchEvent = <any>e.originalEvent;
                        var touches = oe.changedTouches;
                        for (var i = 0; i < touches.length; i++) {
                            var touch = touches[i];
                            Delegate._pointerDown(touch.identifier, touch.clientX, touch.clientY);
                        }
                        //e.stopPropagation();
                        //e.preventDefault();
                    })
                    .on('touchmove', e => {
                        var oe: TouchEvent = <any>e.originalEvent;
                        var touches = oe.changedTouches;
                        for (var i = 0; i < touches.length; i++) {
                            var touch = touches[i];
                            Delegate._pointerMove(touch.identifier, touch.clientX, touch.clientY);
                        }
                        //e.preventDefault();
                    })
                    .on('touchend touchcancel', (e: JQueryEventObject) => {
                        var oe: TouchEvent = <any>e.originalEvent;
                        var touches = oe.changedTouches;
                        for (var i = 0; i < touches.length; i++) {
                            var touch = touches[i];
                            Delegate._pointerUp(touch.identifier);
                        }
                        //e.preventDefault();
                    });
            }
        })();

        constructor($ele: JQuery, preventDefault?: boolean, parent?: Node);
        constructor(node: Node, preventDefault?: boolean, parent?: Node);
        constructor(selector: string, preventDefault?: boolean, parent?: Node);
        constructor(selector: any, preventDefault = false, parent = window.document) {
            this._$parent = $(parent);
            this._$target = $(selector);
            this._addEventListeners(typeof selector == 'string' ? selector : null, preventDefault);
        }

        private static _pointerDown(id: number, x: number, y: number) {
            var idStr = id.toString();
            var info = Delegate._touchInfo;

            var sequenceMap = info.activeSequenceMap;
            var sequence = sequenceMap.get(idStr);

            var isStart: boolean;

            if (sequence) {
                isStart = false;
            } else {
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
        }

        private static _pointerMove(id: number, x: number, y: number) {
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
        }

        private static _pointerUp(id: number) {
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
                Delegate._timeoutIds.forEach(id => clearTimeout(id));
                Delegate._timeoutIds.length = 0;
                Delegate._stopAll = false;
                Delegate._stopPropagationHash.clear();
            }
        }

        private _insert(item: IDelegateItem) {
            var items = this._delegateItems;

            var i: number;

            for (i = items.length - 1; i >= 0; i--) {
                if (items[i].priority < item.priority) {
                    break;
                }
            }

            items.splice(i + 1, 0, item);
        }

        private static _timeoutIds: number[] = [];

        private static _trigger(triggerItem?: IDelegateItem) {
            var info = Delegate._touchInfo;

            Delegate._currentDelegateItems = Delegate._currentDelegateItems.filter(item => {
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

                var match: boolean;

                if (result.identified) {
                    match = result.match;
                    data = result.data;

                    dataMap.set(id, data);

                    if (identified) {
                        if (match != null) {
                            match = true;
                        }
                    } else {
                        identified = true;
                    }
                } else if (typeof result.timeout == 'number') {
                    var timeoutId = setTimeout(() => {
                        Delegate._trigger(item);
                    }, result.timeout);
                    Delegate._timeoutIds.push(timeoutId);
                    return true;
                }

                if (identified) {
                    if (match) {
                        var eventData: IDelegateEvent = {
                            target: Delegate._triggerTarget,
                            touch: info,
                            stopPropagation: result.end !== false ?
                            (stopAll) => {
                                if (stopAll) {
                                    Delegate._stopAll = true;
                                } else {
                                    Delegate._stopPropagationHash.set(identifier.name);
                                }
                            } :
                            (stopAll) => {
                                if (stopAll) {
                                    Delegate._stopAll = true;
                                } else {
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
                    } else { 
                        return true;
                    }
                } else {
                    return true;
                }
            });
        }

        add(identifier: Identifier, listener: (event: IDelegateEvent) => void, priority = 0) {
            this._insert({
                id: (Delegate._added++).toString(),
                identifier: identifier,
                listener: listener,
                priority: priority
            });
        }

        delegate(identifier: Identifier, selector: any, listener: (event: IDelegateEvent) => void, priority = 0) {
            this._insert({
                id: (Delegate._added++).toString(),
                identifier: identifier,
                listener: (event: IDelegateEvent) => {
                    var $target = $(event.target);
                    var target: HTMLElement;

                    if ($target.is(selector)) {
                        target = $target[0];
                    } else {
                        target = $target.closest(selector, this._$target[0])[0];
                    }

                    if (target) {
                        event.target = target;
                        listener(event);
                    }
                },
                priority: priority
            });
        }
    }

}