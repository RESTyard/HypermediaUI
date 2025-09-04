declare module 'simple-object-query' {
    export function find(obj: any, query: any): any;
    export function search(ops: any): any;
    export namespace search {
        namespace helpers {
            function equal(a: any, b: any): boolean;
            function regexp(val: any, rule: any): any;
            function callback(val: any, rule: any): any;
        }
    }
    export function match(ops: any): any;
    export function get(obj: any, path: any): any;
    export function where(arr: any, query: any): any;
    export function replace(obj: any, query: any, cb: any, ...args: any[]): void;
    export function flatten(list: any): any;
}