import { hasChange, isObject } from "../shared";
import { Deep } from "./effect";
import { reactive } from "./reactive";
import { IReactive } from "./types/reactive.type";

enum RefFlags {
  IS_REF = "__v_isRef",
}

class RefImpl<T> {
  private readonly _deep = new Deep();
  private _value: T;
  constructor(value: T) {
    this._value = convert(value);
  }
  get value(): T {
    if (!isObject(this._value)) this._deep.append();
    return this._value;
  }
  set value(newValue: any) {
    if (!hasChange(newValue, this._value)) {
      this._value = convert(newValue);
      if (!isObject(this._value)) this._deep.notify();
    }
  }
  get [RefFlags.IS_REF]() {
    return true;
  }
}

export function ref<T = any>(raw: T) {
  const ref = new RefImpl<T>(raw);
  return ref;
}

export function isRef(target: any) {
  return target[RefFlags.IS_REF] ? true : false;
}

// utils
export function convert(value: any) {
  return isObject(value) ? reactive(value as IReactive) : value;
}

function unRef(target: any): any {
  return isRef(target) ? target.value : target;
}
export function proxyRefs<T extends Object>(target: T) {
  return new Proxy<any>(target, {
    get(target, key, receiver) {
      return unRef(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key] = value);
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
