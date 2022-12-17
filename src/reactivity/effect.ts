import { extend } from "../shared";
import { IDeep, IReactiveEffect, IRunner } from "./types/effect.type";
import {
  IReactive,
  IReactiveKey,
  IReactiveOptions,
} from "./types/reactive.type";

let DEEP_WEAKMAP = new WeakMap<IReactive, Map<IReactiveKey, Deep>>();
let ACTIVE_EFFECT: IReactiveEffect | null = null;

export class Deep implements IDeep {
  effects = new Set<IReactiveEffect>();
  constructor() {}
  append() {
    if (ACTIVE_EFFECT) {
      ACTIVE_EFFECT._deep = this;
      this.effects.add(ACTIVE_EFFECT);
    }
  }
  notify() {
    this.effects.forEach((e) => {
      if (e.scheduler) {
        e.scheduler();
      } else {
        e.run();
      }
    });
  }
}

export class ReactiveEffect implements IReactiveEffect {
  _deep?: Deep;
  constructor(private readonly _fn, readonly scheduler) {}
  run() {
    // TODO:
    ACTIVE_EFFECT = this;
    const res = this._fn();
    ACTIVE_EFFECT = null;
    return res;
  }
  stop() {
    if (this._deep?.effects.has(this)) {
      this._deep.effects.delete(this);
    }
  }
}

// 需要响应的函数
export function effect(_fn, options: IReactiveOptions = {}) {
  const _effect = new ReactiveEffect(_fn, options.scheduler);
  extend(_effect, options);
  _effect.run();
  const runner: IRunner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// 添加依赖
export function track(target: IReactive, key: IReactiveKey) {
  const deep = getDeep(target, key);
  deep.append();
}

// 触发依赖
export function trigget(target: IReactive, key: IReactiveKey) {
  const deep = getDeep(target, key);
  deep.notify();
}

// 停止 一个响应
export function stop(runner: IRunner) {
  runner.effect!.stop();
}

// 查询到指定的 deep
function getDeep(target: IReactive, key: IReactiveKey) {
  let map = DEEP_WEAKMAP.get(target);
  if (!map) {
    map = new Map<IReactiveKey, Deep>();
    DEEP_WEAKMAP.set(target, map);
  }
  let deep = map.get(key);
  if (!deep) {
    deep = new Deep();
    map.set(key, deep);
  }
  return deep;
}
