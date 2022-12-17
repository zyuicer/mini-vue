import { ReactiveEffect } from "./effect";

class ComputedImpl {
  private _value;
  private readonly _effect: ReactiveEffect;
  private _dirty: boolean = true;
  constructor(fn) {
    this._effect = new ReactiveEffect(fn, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    if (this._dirty) {
      this._value = this._effect.run();
      this._dirty = false;
    }
    return this._value;
  }
}

export function computed<T extends Function>(_fn: T) {
  const res = new ComputedImpl(_fn);
  return res;
}
