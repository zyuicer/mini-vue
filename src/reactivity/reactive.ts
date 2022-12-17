import { reactiveHandler, readonlyHandler } from "./baseHandler";
import { track, trigget } from "./effect";
import { IReactiveKey, IReactive } from "./types/reactive.type";
import { ReactiveFlag } from "./reactiveFlags";
export function reactive<T extends IReactive>(raw: T) {
  return new Proxy<T>(raw, reactiveHandler);
}

export function readonly<T extends IReactive>(raw: T) {
  return new Proxy<T>(raw, readonlyHandler);
}

export function isReadonly(target: any) {
  return target[ReactiveFlag.IS_READONLY];
}

export function isReactive(target: any) {
  return target[ReactiveFlag.IS_REACTIVE];
}
