/*
    Touch Delegate
    https://github.com/vilic/touch-delegate
  
    by VILIC VANE
    https://github.com/vilic
  
    MIT License
*/

module TouchDelegate {
    export interface IIdentifierResult {
        identified: boolean;
        match?: boolean;
        timeout?: number;
        end?: boolean;
        data?: any;
    }

    export class Identifier {
        constructor(
            public name: string,
            public identify: (info: TouchInfo, identified: boolean, data: any) => IIdentifierResult
            ) {
        }
    }

    export module Identifier {
        export var tap = new Identifier('tap', info => {
            var sequences = info.sequences;
            var sequence = sequences[0];

            if (!sequence) {
                alert(JSON.stringify(info, null, '  '));
            }

            if (
                sequences.length > 1 ||
                sequence.timeLasting > 500 ||
                sequence.maxRadius > 5
                ) {
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

        export var hold = new Identifier('hold', info => {
            var sequences = info.sequences;
            var sequence = sequences[0];

            if (
                sequences.length > 1 ||
                sequence.maxRadius > 3
                ) {
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
                return <IIdentifierResult>{
                    identified: false,
                    timeout: 1000
                };
            }
        });

        export interface IFreeDelegateEvent extends IDelegateEvent {
            diffX: number;
            diffY: number;
            x: number;
            y: number;
        }

        export var free = new Identifier('free', info => {
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

        export interface ISlideXDelegateEvent extends IDelegateEvent { 
            diffX: number;
        }

        export var slideX = new Identifier('slide-x', (info, identified) => {
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

        export interface ISlideYDelegateEvent extends IDelegateEvent {
            diffY: number;
        }

        export var slideY = new Identifier('slide-y', (info, identified) => {
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

        export interface IPolylineDelegateEvent extends IDelegateEvent, IPolylineData { }

        export interface IPolylineData {
            changedAxis: string; // 'x' or 'y'
            diffX: number;
            diffY: number;
        }

        export var polylineAfterSlideY = new Identifier('polyline-after-slide-y', (info: TouchInfo, identified: boolean, data: IPolylineData) => {
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
            } else if (lastSlope < 1) {
                // x
                data.changedAxis = 'x';
                data.diffX += sequence.lastDiffX;
            } else if (data.changedAxis == 'y') {
                data.diffY += sequence.lastDiffY;
            } else {
                data.diffX += sequence.lastDiffX;
            }

            return {
                identified: identified,
                match: match,
                end: false,
                data: data
            };
        });

    }
}