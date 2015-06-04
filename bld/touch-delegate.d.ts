declare module TouchDelegate {
    interface Dictionary<T> {
        [key: string]: T;
    }
    module Utils {
        var hop: (v: string) => boolean;
        function clone<T extends Dictionary<any>>(src: T): T;
        class StringHash {
            private _map;
            keys: string[];
            exists(key: string): boolean;
            set(key: string): void;
            unset(key: string): void;
            clear(): void;
        }
        class StringMap<T> {
            private _map;
            map: Dictionary<T>;
            keys: string[];
            exists(key: string): boolean;
            get(key: string, defaultValue?: T): T;
            set(key: string, value: T): void;
            remove(key: string): void;
            remove(filter: (key: string, value: T) => boolean): void;
            clear(): void;
        }
    }
    interface DelegateEvent {
        originalEvent: Event;
        target: EventTarget;
        touch: TouchInfo;
        firstMatch: boolean;
        stopPropagation: (stopAll?: boolean) => void;
    }
    interface DelegateListener {
        (event: DelegateEvent): void | boolean;
    }
    interface TouchEventPoint {
        x: number;
        y: number;
        time: number;
        isStart: boolean;
        isEnd: boolean;
    }
    interface Point {
        x: number;
        y: number;
    }
    interface Velocity {
        x: number;
        y: number;
        speed: number;
    }
    function getDistance(pointA: Point, pointB: Point): number;
    class TouchSequence {
        identifier: number;
        touchPoints: TouchEventPoint[];
        constructor(identifier: number);
        first: TouchEventPoint;
        last: TouchEventPoint;
        ended: boolean;
        x: number;
        y: number;
        diffX: number;
        diffY: number;
        lastDiffX: number;
        lastDiffY: number;
        slope: number;
        lastSlope: number;
        velocity: Velocity;
        timeLasting: number;
        maxRadius: number;
        add(point: TouchEventPoint): void;
    }
    class TouchInfo {
        dataMap: Utils.StringMap<any>;
        sequences: TouchSequence[];
        activeSequenceMap: Utils.StringMap<TouchSequence>;
        isStart: boolean;
        isEnd: boolean;
        timeLasting: number;
    }
    interface DelegateItem {
        id: string;
        identifier: Identifier;
        listener: DelegateListener;
        priority: number;
    }
    class Delegate {
        private static _added;
        private static _stopAll;
        private static _stopPropagationHash;
        private static _touchInfo;
        private _$target;
        $target: JQuery;
        private _$parent;
        private static _triggerTarget;
        private static _currentDelegateItems;
        private _delegateItems;
        private _addEventListeners;
        private static _;
        constructor($ele: JQuery, preventDefault?: boolean, parent?: Node);
        constructor(node: Node, preventDefault?: boolean, parent?: Node);
        constructor(selector: string, preventDefault?: boolean, parent?: Node);
        private static _pointerDown(originalEvent, id, x, y);
        private static _pointerMove(originalEvent, id, x, y);
        private static _pointerUp(originalEvent, id);
        private _insert(item);
        private static _timeoutIds;
        private static _trigger(originalEvent, triggerItem?);
        on(identifier: Identifier, listener: DelegateListener, priority?: number): void;
        delegate(identifier: Identifier, selector: any, listener: DelegateListener, priority?: number): void;
    }
}
declare module TouchDelegate {
    interface IdentifierResult {
        identified: boolean;
        match?: boolean;
        timeout?: number;
        end?: boolean;
        data?: any;
    }
    class Identifier {
        name: string;
        identify: (info: TouchInfo, identified: boolean, data: any) => IdentifierResult;
        constructor(name: string, identify: (info: TouchInfo, identified: boolean, data: any) => IdentifierResult);
    }
    module Identifier {
        /**
         * `tap` identifier, identifies a quick touch.
         */
        var tap: Identifier;
        /**
         * `hold` identifier, identifiers a touch longer than 500ms.
         */
        var hold: Identifier;
        /**
         * delegate event interface for `free` identifier.
         */
        interface FreeDelegateEvent extends DelegateEvent {
            diffX: number;
            diffY: number;
            x: number;
            y: number;
        }
        /**
         * `free` identifier, matches any touch with data of the first touch sequence.
         */
        var free: Identifier;
        /**
         * delegate event interface for `slide-x` identifier.
         */
        interface SlideXDelegateEvent extends DelegateEvent {
            diffX: number;
        }
        /**
         * `slide-x` identifier, identifiers horizontally touch moving.
         */
        var slideX: Identifier;
        /**
         * delegate event interface for `slide-y` identifier.
         */
        interface SlideYDelegateEvent extends DelegateEvent {
            diffY: number;
        }
        /**
         * `slide-y` identifier, identifiers vertically touch moving.
         */
        var slideY: Identifier;
    }
}
