import { hasOwn } from "../shared";
import { IComponentInstance } from "./types/component.type";

const instancePropertyMap = {
  $props: (i) => i.props,
  $slots: (i) => i.slots,
};

export const proxyHandler: ProxyHandler<object> = {
  get(target: { _: IComponentInstance }, key, receiver) {
    const { _: instance } = target;
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      const val = setupState[key];
      return val;
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicHandler = instancePropertyMap[key];

    if (publicHandler) {
      return publicHandler(instance);
    }
  },
};
