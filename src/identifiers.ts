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
            ) { }
    }

    export module Identifier {

        /**
         * `tap` identifier, identifies a quick touch.
         */
        export var tap = new Identifier('tap', info => {
            var sequences = info.sequences;
            var sequence = sequences[0];

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

        /**
         * `hold` identifier, identifiers a touch longer than 500ms.
         */
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

            if (sequence.timeLasting >= 500) {
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

        /**
         * delegate event interface for `free` identifier.
         */
        export interface IFreeDelegateEvent extends IDelegateEvent {
            diffX: number;
            diffY: number;
            x: number;
            y: number;
        }

        /**
         * `free` identifier, matches any touch with data of the first touch sequence.
         */
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
        
        /**
         * delegate event interface for `slide-x` identifier.
         */
        export interface ISlideXDelegateEvent extends IDelegateEvent { 
            diffX: number;
        }

        /**
         * `slide-x` identifier, identifiers horizontally touch moving.
         */
        export var slideX = new Identifier('slide-x', (info, identified) => {
            var sequences = info.sequences;
            var sequence = sequences[0];

            var match = identified;
            
            if (!identified && sequence.maxRadius > 2) {
                identified = true;

                if (Math.abs(sequence.lastSlope) < 1 && sequences.length == 1) {
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
        
        /**
         * delegate event interface for `slide-y` identifier.
         */
        export interface ISlideYDelegateEvent extends IDelegateEvent {
            diffY: number;
        }
        
        /**
         * `slide-y` identifier, identifiers vertically touch moving.
         */
        export var slideY = new Identifier('slide-y', (info, identified) => {
            var sequences = info.sequences;
            var sequence = sequences[0];

            var match = identified;

            if (!identified && sequence.maxRadius > 2) {
                identified = true;

                if (Math.abs(sequence.lastSlope) > 1 && sequences.length == 1) {
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
    }
}