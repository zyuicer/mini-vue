import { createVnode, Fragment } from "../vnode";

export function renderSlot(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      return createVnode(Fragment, null, slot(props));
    }
  }
}
