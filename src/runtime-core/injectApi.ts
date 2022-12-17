import { hasOwn } from "../shared";
import { currentInstance } from "./component";

export function provide(key: string, value: any) {
  const instance = currentInstance();
  let { provide } = instance;
  let parentProvide = instance.parent?.provide;
  if (provide === parentProvide) {
    provide = parentProvide = Object.create(parentProvide);
  }

  provide[key] = value;
}

export function inject(key: string, defaultValue: any) {
  const instance = currentInstance();

  let { provide } = instance;

  if (key in provide) {
    let val = provide[key];
    return val;
  } else {
    if (typeof defaultValue === "function") {
      return defaultValue();
    }
    return defaultValue;
  }
}
