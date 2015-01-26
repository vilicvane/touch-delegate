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
declare module TouchDelegate {
    interface IDictionary<T> {
        [key: string]: T;
    }
    module Utils {
        var hop: (v: string) => boolean;
        function clone<T extends {}>(src: T): T;
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
            map: IDictionary<T>;
            keys: string[];
            exists(key: string): boolean;
            get(key: string, defaultValue?: T): T;
            set(key: string, value: T): void;
            remove(key: string): any;
            remove(filter: (key: string, value: T) => boolean): any;
            clear(): void;
        }
    }
    interface IDelegateEvent {
        target: EventTarget;
        touch: TouchInfo;
        stopPropagation: (stopAll?: boolean) => void;
    }
    interface ITouchEventPoint {
        x: number;
        y: number;
        time: number;
        isStart: boolean;
        isEnd: boolean;
    }
    interface IPoint {
        x: number;
        y: number;
    }
    interface IVelocity {
        x: number;
        y: number;
        speed: number;
    }
    function getDistance(pointA: IPoint, pointB: IPoint): number;
    class TouchSequence {
        identifier: number;
        touchPoints: ITouchEventPoint[];
        constructor(identifier: number);
        first: ITouchEventPoint;
        last: ITouchEventPoint;
        end: boolean;
        x: number;
        y: number;
        diffX: number;
        diffY: number;
        lastDiffX: number;
        lastDiffY: number;
        slope: number;
        lastSlope: number;
        velocity: IVelocity;
        timeLasting: number;
        maxRadius: number;
        add(point: ITouchEventPoint): void;
    }
    class TouchInfo {
        dataMap: Utils.StringMap<any>;
        sequences: TouchSequence[];
        activeSequenceMap: Utils.StringMap<TouchSequence>;
        start: boolean;
        end: boolean;
        timeLasting: number;
    }
    interface IDelegateItem {
        id: string;
        identifier: Identifier;
        listener: (event: IDelegateEvent) => void;
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
        private static _pointerDown(id, x, y);
        private static _pointerMove(id, x, y);
        private static _pointerUp(id);
        private _insert(item);
        private static _timeoutIds;
        private static _trigger(triggerItem?);
        on(identifier: Identifier, listener: (event: IDelegateEvent) => void, priority?: number): void;
        delegate(identifier: Identifier, selector: any, listener: (event: IDelegateEvent) => void, priority?: number): void;
    }
}
declare module TouchDelegate {
    interface IIdentifierResult {
        identified: boolean;
        match?: boolean;
        timeout?: number;
        end?: boolean;
        data?: any;
    }
    class Identifier {
        name: string;
        identify: (info: TouchInfo, identified: boolean, data: any) => IIdentifierResult;
        constructor(name: string, identify: (info: TouchInfo, identified: boolean, data: any) => IIdentifierResult);
    }
    module Identifier {
        var tap: Identifier;
        var hold: Identifier;
        interface IFreeDelegateEvent extends IDelegateEvent {
            diffX: number;
            diffY: number;
            x: number;
            y: number;
        }
        var free: Identifier;
        interface ISlideXDelegateEvent extends IDelegateEvent {
            diffX: number;
        }
        var slideX: Identifier;
        interface ISlideYDelegateEvent extends IDelegateEvent {
            diffY: number;
        }
        var slideY: Identifier;
        interface IPolylineDelegateEvent extends IDelegateEvent, IPolylineData {
        }
        interface IPolylineData {
            changedAxis: string;
            diffX: number;
            diffY: number;
        }
        var polylineAfterSlideY: Identifier;
    }
}
