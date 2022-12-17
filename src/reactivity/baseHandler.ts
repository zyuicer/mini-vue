import { track, trigget } from "./effect";
import { isReactive } from "./reactive";
import { ReactiveFlag } from "./reactiveFlags";
import { IReactive, IReactiveKey } from "./types/reactive.type";

const get = createGetting();
const set = createSetting();
const readonlyGetting = createGetting(true);

function createGetting(isReadonly: boolean = false) {
  return function get<T extends IReactive>(
    target: T,
    key: IReactiveKey,
    receiver
  ) {
    if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly;
    } else if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly;
    }

    const res = Reflect.get(target, key, receiver);

    if (!isReadonly) {
      // 依赖收集
      track(target, key);
      return res;
    }
  };
}

function createSetting() {
  return function set<T extends IReactive>(
    target: T,
    key: IReactiveKey,
    value,
    receiver
  ) {
    const res = Reflect.set(target, key, value, receiver);
    trigget(target, key);
    return res;
  };
}

export const reactiveHandler = {
  get,
  set,
};

export const readonlyHandler = {
  get: readonlyGetting,
  set(target, key) {
    throw Error(`Sorry ${key} is readonly`);
  },
};
