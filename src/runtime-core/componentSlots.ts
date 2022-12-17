import { ShapeFlags } from "../shared/shapeFlags";
import { IComponentInstance, ISlots } from "./types/component.type";

export function initSlots(instance: IComponentInstance, slots: ISlots) {
  const { shapeFlag } = instance.vnode;
  if (shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    instance.slots = normalizeObjectSlots(slots);
  }
}

function normalizeObjectSlots(slots: ISlots): ISlots {
  const newSlots: ISlots = {};
  for (const key in slots) {
    const val = slots[key];

    newSlots[key] = (props) => normalizeSlotValue(val(props));
  }
  return newSlots;
}

function normalizeSlotValue(val: any) {
  return Array.isArray(val) ? val : [val];
}
